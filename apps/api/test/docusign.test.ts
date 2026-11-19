import { randomBytes, randomUUID } from 'node:crypto';
import { inspect } from 'node:util';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config';
import { schema } from '../src/db';
import { Secrets } from '../src/lib/crypto';
import { openTokens, SealedTokensError, sealTokens } from '../src/modules/docusign/tokens';
import { samplePdf } from '../src/seed/sample-pdf';
import { addMember, errorOf, startHarness, testEnv, type Harness, type SignedIn } from './support/harness';
import { createCompany, setPlan } from './support/product';

/**
 * These tests search every row of the shared test database for secrets. Alone they take about two
 * seconds; in a full run the database holds every other test file's rows too, so they get longer.
 */
const SEARCHES_WHOLE_DATABASE = 180_000;

/**
 * The DocuSign connection, against a mocked DocuSign. The integration key, secret and every token
 * are made here for this run. Every name is fictional (Kestrel Pay). No request leaves the process.
 */
const INTEGRATION_KEY = randomUUID();
const SECRET_KEY = randomBytes(24).toString('hex');
const ACCOUNT = randomUUID();
const OAUTH = 'https://account-d.docusign.com';
const API = `https://demo.docusign.net/restapi/v2.1/accounts/${ACCOUNT}`;
const SUBJECT = 'Kestrel Pay seed round SAFE for signature';
const SIGNER_EMAIL = 'amara.okafor@kestrelpay.example';
const SIGNER_NAME = 'Amara Okafor';

const ENV = {
  DOCUSIGN_INTEGRATION_KEY: INTEGRATION_KEY,
  DOCUSIGN_SECRET_KEY: SECRET_KEY,
  DOCUSIGN_ENV: 'demo',
  DOCUSIGN_MAX_ENVELOPES_PER_PULL: '3',
  DOCUSIGN_MAX_ENVELOPES_PER_ORG_PER_DAY: '5',
};

interface FakeEnvelope {
  status: string;
  completed: string | null;
  signers: { name: string; email: string }[];
  noCertificate?: boolean;
}

/** A small stand-in for DocuSign's account server and eSignature REST API. It records every request. */
class FakeDocusign {
  calls: { method: string; url: string }[] = [];
  codes = new Set<string>();
  access = new Set<string>();
  refresh = new Set<string>();
  /** Every token ever issued, to prove none of them is stored or logged in plain text. */
  issued: string[] = [];
  envelopes = new Map<string, FakeEnvelope>();
  refreshRefused = false;
  /** The next API call answers 401 even with a good token. */
  unauthorizedOnce = false;

  newCode(): string {
    const code = `code-${randomBytes(16).toString('hex')}`;
    this.codes.add(code);
    return code;
  }

  private grant() {
    const access = `access-${randomBytes(24).toString('hex')}`;
    const refresh = `refresh-${randomBytes(24).toString('hex')}`;
    this.access.add(access);
    this.refresh.add(refresh);
    this.issued.push(access, refresh);
    return { access_token: access, refresh_token: refresh, token_type: 'Bearer', expires_in: 28800, scope: 'signature' };
  }

  fetch = async (url: string, init?: RequestInit): Promise<Response> => {
    const method = init?.method ?? 'GET';
    const headers = (init?.headers ?? {}) as Record<string, string>;
    this.calls.push({ method, url });
    const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    const parsed = new URL(url);

    if (url === `${OAUTH}/oauth/token`) {
      if (headers['authorization'] !== `Basic ${Buffer.from(`${INTEGRATION_KEY}:${SECRET_KEY}`).toString('base64')}`) return json(401, { error: 'invalid_client' });
      const form = new URLSearchParams(init?.body instanceof URLSearchParams ? init.body.toString() : typeof init?.body === 'string' ? init.body : '');
      if (form.get('grant_type') === 'authorization_code') {
        const code = form.get('code') ?? '';
        if (!this.codes.delete(code)) return json(400, { error: 'invalid_grant', error_description: `bad code ${code}` });
        return json(200, this.grant());
      }
      if (form.get('grant_type') === 'refresh_token') {
        const token = form.get('refresh_token') ?? '';
        if (this.refreshRefused || !this.refresh.delete(token)) return json(400, { error: 'invalid_grant' });
        return json(200, this.grant());
      }
      return json(400, { error: 'unsupported_grant_type' });
    }

    const bearer = headers['authorization']?.replace(/^Bearer /, '') ?? '';
    if (!this.access.has(bearer)) return json(401, { errorCode: 'AUTHORIZATION_INVALID_TOKEN', message: 'The access token provided is expired, revoked or malformed.' });
    if (url === `${OAUTH}/oauth/userinfo`) {
      return json(200, {
        sub: randomUUID(), name: SIGNER_NAME, email: SIGNER_EMAIL,
        accounts: [{ account_id: ACCOUNT, is_default: true, account_name: 'Kestrel Pay Ltd', base_uri: 'https://demo.docusign.net' }],
      });
    }
    if (this.unauthorizedOnce) {
      this.unauthorizedOnce = false;
      return json(401, { errorCode: 'USER_AUTHENTICATION_FAILED' });
    }
    if (parsed.origin + parsed.pathname === `${API}/envelopes`) {
      const completed = [...this.envelopes.entries()].filter(([, envelope]) => envelope.status === 'completed');
      return json(200, {
        resultSetSize: String(completed.length), totalSetSize: String(completed.length), nextUri: null,
        envelopes: completed.map(([envelopeId, envelope]) => ({ envelopeId, status: 'completed', emailSubject: SUBJECT, completedDateTime: envelope.completed, statusChangedDateTime: envelope.completed })),
      });
    }
    const match = /^\/restapi\/v2\.1\/accounts\/[^/]+\/envelopes\/([^/]+)(\/documents\/(combined|certificate))?$/.exec(parsed.pathname);
    const envelope = match?.[1] ? this.envelopes.get(match[1]) : undefined;
    if (!match || !envelope) return json(404, { errorCode: 'ENVELOPE_DOES_NOT_EXIST' });
    if (!match[2]) {
      return json(200, { envelopeId: match[1], status: envelope.status, completedDateTime: envelope.completed, emailSubject: SUBJECT, recipients: { signers: envelope.signers.map((signer, index) => ({ ...signer, recipientId: String(index + 1), status: 'completed' })) } });
    }
    if (match[3] === 'certificate' && envelope.noCertificate) return json(404, { errorCode: 'NOT_FOUND' });
    const pdf = match[3] === 'combined' ? samplePdf(['Kestrel Pay Ltd', 'Advance subscription agreement', 'Signed by both parties']) : samplePdf(['Certificate of completion', 'Kestrel Pay Ltd']);
    return new Response(new Uint8Array(pdf), { status: 200, headers: { 'content-type': 'application/pdf' } });
  };

  apiPaths(): string[] {
    return this.calls.filter((call) => call.url.startsWith(API)).map((call) => new URL(call.url).pathname);
  }
}

describe('DocuSign connection', () => {
  let h: Harness;
  let docusign: FakeDocusign;
  let owner: SignedIn;
  let companyId: string;
  const base = (who: SignedIn = owner) => `/v1/organisations/${who.organisationId}/connections/docusign`;

  beforeAll(async () => {
    h = await startHarness(ENV);
    docusign = new FakeDocusign();
    h.deps.docusignFetch = (url, init) => docusign.fetch(url, init);
  });
  afterAll(() => h.close());

  beforeEach(async () => {
    docusign.calls = [];
    docusign.envelopes.clear();
    docusign.refreshRefused = false;
    docusign.unauthorizedOnce = false;
    h.setNow(null);
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    companyId = (await createCompany(h, owner, { legalName: 'Kestrel Pay Ltd' })).id;
  });

  async function startState(who: SignedIn = owner): Promise<string> {
    const started = await h.request('POST', `${base(who)}/start`, { cookie: who.cookie });
    expect(started.statusCode, started.body).toBe(200);
    const body = started.json<{ status: string; authorizeUrl: string }>();
    expect(body.status).toBe('ready');
    return new URL(body.authorizeUrl).searchParams.get('state') ?? '';
  }

  function callback(state: string, code: string, who: SignedIn = owner) {
    return h.request('GET', `${base(who)}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, { cookie: who.cookie });
  }

  async function connect(who: SignedIn = owner): Promise<void> {
    const response = await callback(await startState(who), docusign.newCode(), who);
    expect(response.statusCode, response.body).toBe(200);
    expect(response.json<{ status: string }>().status).toBe('active');
  }

  function envelope(extra: Partial<FakeEnvelope> = {}): string {
    const id = randomUUID();
    docusign.envelopes.set(id, { status: 'completed', completed: '2026-10-14T09:30:00.000Z', signers: [{ name: SIGNER_NAME, email: SIGNER_EMAIL }, { name: 'Tunde Bello', email: 'tunde@investor.example' }], ...extra });
    return id;
  }

  async function pull(envelopeIds: string[]) {
    const response = await h.request('POST', `${base()}/pull`, { cookie: owner.cookie, body: { companyId, envelopeIds } });
    await h.queue.drain();
    return response;
  }

  async function auditRows(organisationId = owner.organisationId) {
    const { rows } = await h.admin.query<{ action: string; metadata: Record<string, unknown> }>('SELECT action, metadata FROM audit_log WHERE organisation_id = $1 ORDER BY seq', [organisationId]);
    return rows;
  }

  async function storedRow() {
    const { rows } = await h.admin.query<{ status: string; sealed_tokens: string | null; last_error: string | null; access_expires_at: Date | null }>(
      'SELECT status, sealed_tokens, last_error, access_expires_at FROM docusign_connection WHERE organisation_id = $1',
      [owner.organisationId],
    );
    return rows[0];
  }

  /** Every table these connections write to, searched as text for each value. */
  async function foundInDatabase(values: string[]): Promise<string[]> {
    const hits: string[] = [];
    for (const table of ['docusign_connection', 'docusign_envelope_pull', 'docusign_oauth_state_use', 'document', 'fact', 'audit_log', 'rate_limit_bucket', 'outbox']) {
      for (const value of values) {
        const { rows } = await h.admin.query<{ found: string }>(`SELECT count(*)::text AS found FROM ${table} t WHERE t::text LIKE '%' || $1 || '%'`, [value]);
        if (rows[0]?.found !== '0') hits.push(`${table}: ${value.slice(0, 12)}`);
      }
    }
    return hits;
  }

  describe('connecting', () => {
    it('sends the person to DocuSign with the narrowest scope and a signed state, and stores only sealed tokens', async () => {
      const started = (await h.request('POST', `${base()}/start`, { cookie: owner.cookie })).json<{ authorizeUrl: string }>();
      const url = new URL(started.authorizeUrl);
      expect(url.origin + url.pathname).toBe(`${OAUTH}/oauth/auth`);
      expect(Object.fromEntries(url.searchParams)).toMatchObject({
        response_type: 'code',
        scope: 'signature',
        client_id: INTEGRATION_KEY,
        redirect_uri: 'https://api.vero.test/v1/connections/docusign/callback',
      });

      // DocuSign's fixed redirect passes the person on to their organisation's callback.
      const code = docusign.newCode();
      const state = url.searchParams.get('state') ?? '';
      const fixed = await h.request('GET', `/v1/connections/docusign/callback?code=${code}&state=${encodeURIComponent(state)}`, { cookie: owner.cookie });
      expect(fixed.statusCode).toBe(302);
      const response = await h.request('GET', String(fixed.headers['location']), { cookie: owner.cookie });
      expect(response.statusCode, response.body).toBe(200);
      expect(response.json()).toMatchObject({ status: 'active', account: { id: ACCOUNT, name: 'Kestrel Pay Ltd' }, environment: 'demo' });
      expect(response.body).not.toMatch(/access-|refresh-/);

      const row = await storedRow();
      expect(row?.sealed_tokens?.startsWith('v1.')).toBe(true);
      expect(await foundInDatabase(docusign.issued)).toEqual([]);
      // Our own copy opens with the key for this organisation, and only that.
      const opened = openTokens(h.deps.secrets, owner.organisationId, row?.sealed_tokens ?? '');
      expect(docusign.issued).toContain(opened.accessToken);
      expect(() => openTokens(h.deps.secrets, randomUUID(), row?.sealed_tokens ?? '')).toThrow(SealedTokensError);
      expect((await auditRows()).map((item) => item.action)).toContain('docusign.connected');
    });

    it('says plainly when DocuSign refuses the code or the person said no', async () => {
      const refused = await callback(await startState(), 'code-not-issued');
      expect(refused.statusCode).toBe(400);
      expect(errorOf(refused).message).toBe("DocuSign didn't accept that sign-in. Start connecting DocuSign again.");
      expect(refused.body).not.toContain('code-not-issued');
      const declined = await h.request('GET', `${base()}/callback?error=access_denied&state=${encodeURIComponent(await startState())}`, { cookie: owner.cookie });
      expect(declined.statusCode).toBe(400);
      expect(await storedRow()).toBeUndefined();
    });
  });

  describe('the sign-in state', () => {
    it('is single use', async () => {
      const state = await startState();
      expect((await callback(state, docusign.newCode())).statusCode).toBe(200);
      const again = await callback(state, docusign.newCode());
      expect(again.statusCode).toBe(400);
      expect(errorOf(again).message).toMatch(/expired, was already used, or is for someone else/);
    });

    it('expires after 10 minutes', async () => {
      const state = await startState();
      h.setNow(new Date(Date.now() + 11 * 60 * 1000));
      expect((await callback(state, docusign.newCode())).statusCode).toBe(400);
    });

    it('only works for the person and organisation it was made for, and refuses any change', async () => {
      const state = await startState();
      const admin = await addMember(h, owner, 'admin');
      expect((await callback(state, docusign.newCode(), admin)).statusCode).toBe(400);
      const stranger = await h.signIn();
      expect((await h.request('GET', `${base(stranger)}/callback?code=x&state=${encodeURIComponent(state)}`, { cookie: stranger.cookie })).statusCode).toBe(400);
      const [body, signature] = state.split('.');
      const flipped = `${body}.${signature?.slice(0, -1)}${signature?.endsWith('0') ? '1' : '0'}`;
      expect((await callback(flipped, docusign.newCode())).statusCode).toBe(400);
      // The wrong attempts didn't burn it.
      expect((await callback(state, docusign.newCode())).statusCode).toBe(200);
    });
  });

  it('is for owners and admins only', async () => {
    const member = await addMember(h, owner, 'member');
    for (const [method, path] of [['GET', ''], ['POST', '/start'], ['GET', '/envelopes'], ['DELETE', '']] as const) {
      const response = await h.request(method, `${base()}${path}`, { cookie: member.cookie });
      expect(response.statusCode, `${method} ${path}`).toBe(403);
    }
    const admin = await addMember(h, owner, 'admin');
    expect((await h.request('GET', base(), { cookie: admin.cookie })).statusCode).toBe(200);
  });

  describe('listing and pulling', () => {
    it('lists completed envelopes, then brings in only the ones picked, as unconfirmed documents', async () => {
      await connect();
      const picked = envelope();
      const other = envelope();
      envelope({ status: 'sent', completed: null });

      const listed = await h.request('GET', `${base()}/envelopes`, { cookie: owner.cookie });
      expect(listed.statusCode, listed.body).toBe(200);
      const list = listed.json<{ envelopes: { envelopeId: string; subject: string; alreadyPulled: boolean }[]; notice: string }>();
      expect(list.envelopes.map((item) => item.envelopeId).sort()).toEqual([picked, other].sort());
      expect(list.envelopes[0]?.subject).toBe(SUBJECT);
      expect(list.notice).toMatch(/not a check that a document is genuine, validly signed or legally sufficient/);
      const listCall = docusign.calls.find((call) => call.url.startsWith(`${API}/envelopes?`));
      expect(new URL(listCall?.url ?? '').searchParams.get('status')).toBe('completed');

      docusign.calls = [];
      const pulled = await pull([picked]);
      expect(pulled.statusCode, pulled.body).toBe(202);
      // Only the picked envelope was asked for: its status, its combined PDF and its certificate.
      expect(docusign.apiPaths().every((path) => path.includes(picked))).toBe(true);
      expect(docusign.apiPaths().some((path) => path.includes(other))).toBe(false);
      const combinedCall = docusign.calls.find((call) => call.url.includes('/documents/combined'));
      expect(new URL(combinedCall?.url ?? '').searchParams.get('certificate')).toBe('false');

      const { rows: docs } = await h.admin.query<{ id: string; status: string; source: string; mime: string; external_ref: string; extracted_fields: Record<string, unknown>; uploaded_by: string | null }>(
        `SELECT id, status, source, mime, external_ref, extracted_fields, uploaded_by FROM document WHERE company_id = $1 ORDER BY external_ref`,
        [companyId],
      );
      expect(docs.map((doc) => doc.external_ref)).toEqual([`docusign:${ACCOUNT}:${picked}:certificate_of_completion`, `docusign:${ACCOUNT}:${picked}:signed_documents`]);
      expect(docs.every((doc) => doc.status === 'needs_confirmation' && doc.source === 'docusign' && doc.mime === 'application/pdf' && doc.uploaded_by === null)).toBe(true);
      expect(docs[1]?.extracted_fields['connection']).toMatchObject({
        kind: 'docusign',
        envelopeId: picked,
        accountId: ACCOUNT,
        accountName: 'Kestrel Pay Ltd',
        part: 'signed_documents',
        completedAt: '2026-10-14T09:30:00.000Z',
        statement: "DocuSign's own record says this envelope was completed on 2026-10-14.",
      });

      const dto = await h.request('GET', `/v1/documents/${docs[1]?.id}`, { cookie: owner.cookie });
      expect(dto.json<{ fromConnection: { kind: string; statement: string }; state: string }>()).toMatchObject({ fromConnection: { kind: 'docusign' }, state: 'needs_confirmation' });

      const { rows: facts } = await h.admin.query<{ key: string; value: unknown; verification_tier: number; source: string; evidence_method: string }>(
        `SELECT key, value, verification_tier, source, evidence_method FROM fact WHERE company_id = $1 AND source = 'docusign' ORDER BY key`,
        [companyId],
      );
      expect(Object.fromEntries(facts.map((row) => [row.key, row.value]))).toEqual({
        'docusign.certificates_retrieved': [picked],
        'docusign.envelope_completed_on': [`${picked}: 2026-10-14`],
        'docusign.envelope_signer_counts': [`${picked}: 2`],
        'docusign.envelopes_completed': [picked],
      });
      expect(facts.every((row) => row.verification_tier === 4 && row.evidence_method === 'document')).toBe(true);
      expect(JSON.stringify(facts)).not.toMatch(/valid|legal|genuine|verified/i);

      // Signers' names and emails, and the subject, are never kept.
      expect(await foundInDatabase([SIGNER_EMAIL, SIGNER_NAME, 'tunde@investor.example', SUBJECT])).toEqual([]);

      // The confirm path is unchanged: only a person's confirmation files it.
      const confirmed = await h.request('POST', `/v1/documents/${docs[1]?.id}/confirm`, { cookie: owner.cookie, body: { slotKey: 'gb_open_source', confirmSigned: true } });
      expect(confirmed.statusCode, confirmed.body).toBe(200);
      const { rows: filed } = await h.admin.query<{ status: string; classification_confirmed_by: string }>(`SELECT status, classification_confirmed_by FROM document WHERE id = $1`, [docs[1]?.id]);
      expect(filed[0]).toEqual({ status: 'filed', classification_confirmed_by: owner.userId });

      // Pulling the same envelope again adds nothing, and the list now says it was brought in.
      await pull([picked]);
      const { rows: again } = await h.admin.query('SELECT 1 FROM document WHERE company_id = $1', [companyId]);
      expect(again).toHaveLength(2);
      const relisted = (await h.request('GET', `${base()}/envelopes`, { cookie: owner.cookie })).json<{ envelopes: { envelopeId: string; alreadyPulled: boolean }[] }>();
      expect(relisted.envelopes.find((item) => item.envelopeId === picked)?.alreadyPulled).toBe(true);
      const pulledAudit = (await auditRows()).filter((item) => item.action === 'docusign.pulled');
      expect(pulledAudit[0]?.metadata).toMatchObject({ envelopes: 1, pulled: 1, documentsAdded: 2, certificates: 1 });
    });

    it('takes nothing from an envelope DocuSign does not call completed, and says when there was no certificate', async () => {
      await connect();
      const sent = envelope({ status: 'sent', completed: null });
      const noCertificate = envelope({ noCertificate: true });
      await pull([sent, noCertificate]);
      const { rows: docs } = await h.admin.query<{ external_ref: string }>('SELECT external_ref FROM document WHERE company_id = $1', [companyId]);
      expect(docs.map((doc) => doc.external_ref)).toEqual([`docusign:${ACCOUNT}:${noCertificate}:signed_documents`]);
      const { rows } = await h.admin.query<{ value: unknown }>(`SELECT value FROM fact WHERE company_id = $1 AND key = 'docusign.certificates_retrieved'`, [companyId]);
      expect(rows[0]?.value).toEqual([]);
    });

    it('caps envelopes per pick and per organisation per day', async () => {
      await connect();
      const ids = [envelope(), envelope(), envelope(), envelope()];
      const tooMany = await h.request('POST', `${base()}/pull`, { cookie: owner.cookie, body: { companyId, envelopeIds: ids } });
      expect(tooMany.statusCode).toBe(400);
      expect(errorOf(tooMany).message).toBe('You can bring in up to 3 envelopes at a time.');
      expect((await pull(ids.slice(0, 3))).statusCode).toBe(202);
      expect((await pull(ids.slice(0, 2))).statusCode).toBe(202);
      expect((await pull(ids.slice(3))).statusCode).toBe(429);
    });

    it('refuses a company this team only follows, before anything is queued', async () => {
      await connect();
      await h.admin.query(`UPDATE company SET relationship = 'follow' WHERE id = $1`, [companyId]);
      const response = await h.request('POST', `${base()}/pull`, { cookie: owner.cookie, body: { companyId, envelopeIds: [envelope()] } });
      expect(response.statusCode).toBe(403);
      expect(errorOf(response)).toEqual({ code: 'follows_only', message: "You follow this company, so you can see its public record but can't add evidence for it." });
      expect((await h.admin.query(`SELECT 1 FROM audit_log WHERE action = 'docusign.pull_requested' AND target = $1`, [companyId])).rows).toHaveLength(0);
    });

    it('needs a plan with the vault', async () => {
      await connect();
      await setPlan(h, owner.organisationId, 'free');
      const response = await h.request('POST', `${base()}/pull`, { cookie: owner.cookie, body: { companyId, envelopeIds: [envelope()] } });
      expect(response.statusCode).toBe(403);
    });
  });

  describe('refresh and ended access', () => {
    it('refreshes a token near expiry and keeps only the newest, sealed', async () => {
      await connect();
      docusign.calls = [];
      const before = await storedRow();
      await h.admin.query(`UPDATE docusign_connection SET access_expires_at = now() + interval '5 minutes' WHERE organisation_id = $1`, [owner.organisationId]);
      expect((await h.request('GET', `${base()}/envelopes`, { cookie: owner.cookie })).statusCode).toBe(200);
      expect(docusign.calls.filter((call) => call.url.endsWith('/oauth/token'))).toHaveLength(1);
      const after = await storedRow();
      expect(after?.sealed_tokens).not.toBe(before?.sealed_tokens);
      const tokens = openTokens(h.deps.secrets, owner.organisationId, after?.sealed_tokens ?? '');
      expect(docusign.refresh.has(tokens.refreshToken)).toBe(true);
      expect(await foundInDatabase(docusign.issued)).toEqual([]);
    }, SEARCHES_WHOLE_DATABASE);

    it('a 401 gets one refresh and one retry', async () => {
      await connect();
      docusign.unauthorizedOnce = true;
      const listed = await h.request('GET', `${base()}/envelopes`, { cookie: owner.cookie });
      expect(listed.statusCode, listed.body).toBe(200);
      expect(docusign.calls.filter((call) => call.url.endsWith('/oauth/token'))).toHaveLength(2);
    });

    it('a refused refresh ends the connection with plain words, and drops the tokens', async () => {
      await connect();
      docusign.refreshRefused = true;
      await h.admin.query(`UPDATE docusign_connection SET access_expires_at = now() - interval '1 minute' WHERE organisation_id = $1`, [owner.organisationId]);
      const listed = await h.request('GET', `${base()}/envelopes`, { cookie: owner.cookie });
      expect(listed.statusCode).toBe(409);
      expect(errorOf(listed).message).toBe('DocuSign access ended, connect again.');
      expect(await storedRow()).toMatchObject({ status: 'revoked', sealed_tokens: null, last_error: 'DocuSign access ended, connect again.' });
      const status = (await h.request('GET', base(), { cookie: owner.cookie })).json<{ status: string; message: string }>();
      expect(status).toMatchObject({ status: 'revoked', message: 'DocuSign access ended, connect again.' });
      expect((await auditRows()).map((item) => item.action)).toContain('docusign.access_ended');
      // Connecting again brings it back.
      docusign.refreshRefused = false;
      await connect();
    });

    it('a sealed value that was changed is treated as ended access, never as an error with details', async () => {
      await connect();
      const row = await storedRow();
      const sealed = row?.sealed_tokens ?? '';
      const tampered = `${sealed.slice(0, -4)}${sealed.slice(-4) === 'AAAA' ? 'BBBB' : 'AAAA'}`;
      await h.admin.query('UPDATE docusign_connection SET sealed_tokens = $2 WHERE organisation_id = $1', [owner.organisationId, tampered]);
      const listed = await h.request('GET', `${base()}/envelopes`, { cookie: owner.cookie });
      expect(listed.statusCode).toBe(409);
      expect(errorOf(listed).message).toBe('DocuSign access ended, connect again.');
    });
  });

  it('disconnecting deletes our row and its tokens, and keeps facts marked as disconnected', async () => {
    await connect();
    await pull([envelope()]);
    const response = await h.request('DELETE', base(), { cookie: owner.cookie });
    expect(response.statusCode).toBe(200);
    expect(response.json<{ status: string; message: string }>()).toMatchObject({ status: 'not_connected' });
    expect(response.json<{ message: string }>().message).toMatch(/Connected Apps/);
    expect(await storedRow()).toBeUndefined();
    const { rows } = await h.admin.query<{ source_name: string }>(`SELECT DISTINCT source_name FROM fact WHERE company_id = $1 AND source = 'docusign'`, [companyId]);
    expect(rows).toEqual([{ source_name: 'DocuSign (disconnected)' }]);
  });

  it('one organisation never sees another organisation\'s connection, even in the database', async () => {
    await connect();
    const other = await h.signIn();
    expect((await h.request('GET', base(other), { cookie: other.cookie })).json<{ status: string }>().status).toBe('not_connected');
    expect((await h.request('GET', base(), { cookie: other.cookie })).statusCode).toBe(403);
    const seen = await h.deps.db.withOrg(other.organisationId, async (tx) => ({
      connections: await tx.select().from(schema.docusignConnection),
      pulls: await tx.select().from(schema.docusignEnvelopePull),
    }));
    expect(seen).toEqual({ connections: [], pulls: [] });
  });

  it('never writes a token, the secret key or a code to logs, audit, errors or printed settings', async () => {
    await connect();
    await pull([envelope()]);
    await callback(await startState(), 'code-leak-check');
    const logs = h.logs.join('\n');
    const audit = JSON.stringify(await auditRows());
    const printed = `${JSON.stringify(h.config)} ${inspect(h.config, { depth: 10 })}`;
    for (const secret of [...docusign.issued, SECRET_KEY, 'code-leak-check']) {
      expect(logs).not.toContain(secret);
      expect(audit).not.toContain(secret);
      expect(printed).not.toContain(secret);
    }
    expect(await foundInDatabase([...docusign.issued, SECRET_KEY])).toEqual([]);
  }, SEARCHES_WHOLE_DATABASE);
});

describe('DocuSign connection, switched off', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('says it is not connected yet and asks DocuSign nothing', async () => {
    const owner = await h.signIn();
    const base = `/v1/organisations/${owner.organisationId}/connections/docusign`;
    const status = await h.request('GET', base, { cookie: owner.cookie });
    expect(status.json()).toMatchObject({ status: 'not_available', message: "DocuSign isn't connected yet. You can upload the files from your computer for now." });
    expect((await h.request('POST', `${base}/start`, { cookie: owner.cookie })).json()).toMatchObject({ status: 'not_available', authorizeUrl: null });
    expect((await h.request('GET', `${base}/envelopes`, { cookie: owner.cookie })).statusCode).toBe(409);
    expect((await h.request('GET', '/v1/connections/docusign/callback?state=xxxxxxxxxxxxxxxxxxxxxxxx', { cookie: owner.cookie })).statusCode).toBe(404);
  });
});

describe('DocuSign token sealing', () => {
  const organisationId = randomUUID();
  const tokens = { accessToken: `access-${randomBytes(16).toString('hex')}`, refreshToken: `refresh-${randomBytes(16).toString('hex')}` };

  it('round-trips, versioned, with nothing readable in the sealed form', () => {
    const secrets = new Secrets(randomBytes(32).toString('base64'));
    const sealed = sealTokens(secrets, organisationId, tokens);
    expect(sealed.startsWith('v1.')).toBe(true);
    expect(sealed).not.toContain(tokens.accessToken);
    expect(openTokens(secrets, organisationId, sealed)).toEqual(tokens);
    // A fresh nonce each time.
    expect(sealTokens(secrets, organisationId, tokens)).not.toBe(sealed);
  });

  it('refuses a changed value, a wrong key, another organisation or an unknown version', () => {
    const secrets = new Secrets(randomBytes(32).toString('base64'));
    const sealed = sealTokens(secrets, organisationId, tokens);
    const body = Buffer.from(sealed.slice(3), 'base64');
    body[body.length - 1] = (body[body.length - 1] ?? 0) ^ 1;
    expect(() => openTokens(secrets, organisationId, `v1.${body.toString('base64')}`)).toThrow(SealedTokensError);
    expect(() => openTokens(new Secrets(randomBytes(32).toString('base64')), organisationId, sealed)).toThrow(SealedTokensError);
    expect(() => openTokens(secrets, randomUUID(), sealed)).toThrow(SealedTokensError);
    expect(() => openTokens(secrets, organisationId, `v2.${sealed.slice(3)}`)).toThrow(SealedTokensError);
    try {
      openTokens(secrets, randomUUID(), sealed);
    } catch (error) {
      expect(String(error)).not.toContain(tokens.accessToken);
    }
  });
});

describe('DocuSign settings', () => {
  it('switch the connection on only when both the key and the secret are set', () => {
    expect(loadConfig(testEnv()).docusign).toBeUndefined();
    expect(loadConfig(testEnv(ENV)).docusign?.oauthUrl).toBe(OAUTH);
    expect(loadConfig(testEnv({ ...ENV, DOCUSIGN_ENV: 'production' })).docusign?.oauthUrl).toBe('https://account.docusign.com');
    expect(() => loadConfig(testEnv({ DOCUSIGN_INTEGRATION_KEY: INTEGRATION_KEY }))).toThrow(/both/);
  });

  it('never repeat the secret when printed', () => {
    const config = loadConfig(testEnv(ENV));
    expect(`${JSON.stringify(config)} ${inspect(config, { depth: 10 })} ${String(config.docusign?.secretKey)}`).not.toContain(SECRET_KEY);
  });
});

import { createHash, randomBytes } from 'node:crypto';
import { inspect } from 'node:util';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config';
import { schema } from '../src/db';
import { Secrets } from '../src/lib/crypto';
import { openPickerTokens, SealedPickerTokensError, sealPickerTokens } from '../src/modules/file-pickers/tokens';
import { samplePdf } from '../src/seed/sample-pdf';
import { addMember, errorOf, startHarness, testEnv, type Harness, type SignedIn } from './support/harness';
import { createCompany, setPlan } from './support/product';

/**
 * These tests search every row of the shared test database for secrets. Alone they take about two
 * seconds; in a full run the database holds every other test file's rows too, so they get longer.
 */
const SEARCHES_WHOLE_DATABASE = 180_000;

/**
 * The Google Drive picker connection, against a mocked Google. The client id, secret, API key
 * and every token are made here for this run. Every name is fictional (Kestrel Pay). No request
 * leaves the process.
 */
const CLIENT_ID = `${Date.now()}-${randomBytes(8).toString('hex')}.apps.googleusercontent.com`;
const CLIENT_SECRET = `GOCSPX-${randomBytes(16).toString('hex')}`;
const API_KEY = `AIza${randomBytes(16).toString('hex')}`;
const PROJECT_NUMBER = '123456789012';
const ACCOUNT_EMAIL = 'amara.okafor@kestrelpay.example';
const SECRET_LINE = 'Kestrel Pay confidential board minutes line';
const DRIVE = 'https://www.googleapis.com/drive/v3';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

const ENV = {
  GOOGLE_DRIVE_CLIENT_ID: CLIENT_ID,
  GOOGLE_DRIVE_CLIENT_SECRET: CLIENT_SECRET,
  GOOGLE_PICKER_API_KEY: API_KEY,
  GOOGLE_CLOUD_PROJECT_NUMBER: PROJECT_NUMBER,
  GOOGLE_DRIVE_MAX_FILES_PER_PULL: '3',
  GOOGLE_DRIVE_MAX_FILES_PER_ORG_PER_DAY: '8',
};

interface FakeFile {
  name: string;
  mimeType: string;
  content: Buffer;
  /** What the metadata says, when it should differ from the content's length. */
  size?: number;
  modifiedTime: string;
  trashed?: boolean;
}

const id = () => randomBytes(16).toString('base64url').replace(/[^A-Za-z0-9_-]/g, 'x');
const png = () => Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), randomBytes(64)]);

/** A small stand-in for Google's OAuth server and Drive API v3. It records every request. */
class FakeGoogle {
  calls: { method: string; url: string }[] = [];
  /** code -> PKCE challenge it was issued for. */
  codes = new Map<string, string>();
  access = new Set<string>();
  refresh = new Set<string>();
  issued: string[] = [];
  revoked: string[] = [];
  files = new Map<string, FakeFile>();
  refreshRefused = false;
  grantedScope = SCOPE;
  unauthorizedOnce = false;

  newCode(challenge: string): string {
    const code = `4/${randomBytes(16).toString('hex')}`;
    this.codes.set(code, challenge);
    return code;
  }

  private grant(withRefresh: boolean) {
    const access = `ya29.${randomBytes(24).toString('hex')}`;
    const refresh = `1//${randomBytes(24).toString('hex')}`;
    this.access.add(access);
    this.issued.push(access);
    if (withRefresh) {
      this.refresh.add(refresh);
      this.issued.push(refresh);
    }
    return { access_token: access, expires_in: 3599, scope: this.grantedScope, token_type: 'Bearer', ...(withRefresh ? { refresh_token: refresh } : {}) };
  }

  fetch = async (url: string, init?: RequestInit): Promise<Response> => {
    const method = init?.method ?? 'GET';
    const headers = (init?.headers ?? {}) as Record<string, string>;
    this.calls.push({ method, url });
    const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    const parsed = new URL(url);

    if (url === 'https://oauth2.googleapis.com/token') {
      const form = new URLSearchParams(init?.body instanceof URLSearchParams ? init.body.toString() : typeof init?.body === 'string' ? init.body : '');
      if (form.get('client_id') !== CLIENT_ID || form.get('client_secret') !== CLIENT_SECRET) return json(401, { error: 'invalid_client' });
      if (form.get('grant_type') === 'authorization_code') {
        const code = form.get('code') ?? '';
        const challenge = this.codes.get(code);
        this.codes.delete(code);
        const verifier = form.get('code_verifier') ?? '';
        if (!challenge || createHash('sha256').update(verifier).digest('base64url') !== challenge) return json(400, { error: 'invalid_grant', error_description: `Bad code ${code}` });
        return json(200, this.grant(true));
      }
      if (form.get('grant_type') === 'refresh_token') {
        if (this.refreshRefused || !this.refresh.has(form.get('refresh_token') ?? '')) return json(400, { error: 'invalid_grant', error_description: 'Token has been expired or revoked.' });
        return json(200, this.grant(false));
      }
      return json(400, { error: 'unsupported_grant_type' });
    }
    if (url === 'https://oauth2.googleapis.com/revoke') {
      this.revoked.push(new URLSearchParams(init?.body instanceof URLSearchParams ? init.body.toString() : typeof init?.body === 'string' ? init.body : '').get('token') ?? '');
      return new Response('', { status: 200 });
    }

    const bearer = headers['authorization']?.replace(/^Bearer /, '') ?? '';
    if (!this.access.has(bearer) || this.unauthorizedOnce) {
      this.unauthorizedOnce = false;
      return json(401, { error: { code: 401, message: 'Request had invalid authentication credentials.', errors: [{ reason: 'authError' }] } });
    }
    if (parsed.origin + parsed.pathname === `${DRIVE}/about`) return json(200, { user: { emailAddress: ACCOUNT_EMAIL, displayName: 'Amara Okafor' } });
    const match = /^\/drive\/v3\/files\/([^/]+)(\/export)?$/.exec(parsed.pathname);
    const file = match?.[1] ? this.files.get(match[1]) : undefined;
    if (!match || !file) return json(404, { error: { code: 404, message: `File not found: ${match?.[1]}.`, errors: [{ reason: 'notFound' }] } });
    if (match[2]) {
      if (!file.mimeType.startsWith('application/vnd.google-apps.') || parsed.searchParams.get('mimeType') !== 'application/pdf') return json(400, { error: { code: 400, errors: [{ reason: 'badRequest' }] } });
      return new Response(new Uint8Array(samplePdf([file.name, SECRET_LINE])), { status: 200, headers: { 'content-type': 'application/pdf' } });
    }
    if (parsed.searchParams.get('alt') === 'media') {
      if (file.mimeType.startsWith('application/vnd.google-apps.')) return json(403, { error: { code: 403, errors: [{ reason: 'fileNotDownloadable' }] } });
      return new Response(new Uint8Array(file.content), { status: 200, headers: { 'content-type': file.mimeType } });
    }
    return json(200, { id: match[1], name: file.name, mimeType: file.mimeType, modifiedTime: file.modifiedTime, trashed: file.trashed ?? false, ...(file.mimeType.startsWith('application/vnd.google-apps.') ? {} : { size: String(file.size ?? file.content.length) }) });
  };

  /** The Drive file ids any request named. */
  fileIdsRequested(): string[] {
    return this.calls.filter((call) => call.url.startsWith(`${DRIVE}/files/`)).map((call) => new URL(call.url).pathname.split('/')[4] ?? '');
  }
}

describe('Google Drive connection', () => {
  let h: Harness;
  let google: FakeGoogle;
  let owner: SignedIn;
  let companyId: string;
  const base = (who: SignedIn = owner) => `/v1/organisations/${who.organisationId}/connections/google-drive`;

  beforeAll(async () => {
    h = await startHarness(ENV);
    google = new FakeGoogle();
    h.deps.googleDriveFetch = (url, init) => google.fetch(url, init);
  });
  afterAll(() => h.close());

  beforeEach(async () => {
    google.calls = [];
    google.files.clear();
    google.refreshRefused = false;
    google.grantedScope = SCOPE;
    google.unauthorizedOnce = false;
    google.revoked = [];
    h.setNow(null);
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    companyId = (await createCompany(h, owner, { legalName: 'Kestrel Pay Ltd' })).id;
  });

  async function start(who: SignedIn = owner): Promise<{ state: string; challenge: string; url: URL }> {
    const started = await h.request('POST', `${base(who)}/start`, { cookie: who.cookie });
    expect(started.statusCode, started.body).toBe(200);
    const url = new URL(started.json<{ authorizeUrl: string }>().authorizeUrl);
    return { state: url.searchParams.get('state') ?? '', challenge: url.searchParams.get('code_challenge') ?? '', url };
  }

  function callback(state: string, code: string, who: SignedIn = owner) {
    return h.request('GET', `${base(who)}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, { cookie: who.cookie });
  }

  async function connect(who: SignedIn = owner): Promise<void> {
    const { state, challenge } = await start(who);
    const response = await callback(state, google.newCode(challenge), who);
    expect(response.statusCode, response.body).toBe(200);
    expect(response.json<{ status: string }>().status).toBe('active');
  }

  function file(extra: Partial<FakeFile> = {}): string {
    const fileId = id();
    google.files.set(fileId, { name: 'Kestrel Pay shareholders agreement.pdf', mimeType: 'application/pdf', content: samplePdf(['Kestrel Pay Ltd', 'Shareholders agreement', SECRET_LINE]), modifiedTime: '2026-10-02T08:15:00.000Z', ...extra });
    return fileId;
  }

  async function pull(fileIds: string[]) {
    const response = await h.request('POST', `${base()}/files`, { cookie: owner.cookie, body: { companyId, fileIds } });
    await h.queue.drain();
    return response;
  }

  async function auditRows(organisationId = owner.organisationId) {
    const { rows } = await h.admin.query<{ action: string; metadata: Record<string, unknown> }>('SELECT action, metadata FROM audit_log WHERE organisation_id = $1 ORDER BY seq', [organisationId]);
    return rows;
  }

  async function storedRow() {
    const { rows } = await h.admin.query<{ status: string; sealed_tokens: string | null; last_error: string | null; account_domain: string | null }>(
      `SELECT status, sealed_tokens, last_error, account_domain FROM file_picker_connection WHERE organisation_id = $1 AND provider = 'google_drive'`,
      [owner.organisationId],
    );
    return rows[0];
  }

  async function documents() {
    const { rows } = await h.admin.query<{ id: string; status: string; source: string; mime: string; file_name: string; external_ref: string; extracted_fields: Record<string, unknown>; uploaded_by: string | null }>(
      `SELECT id, status, source, mime, file_name, external_ref, extracted_fields, uploaded_by FROM document WHERE company_id = $1 ORDER BY file_name`,
      [companyId],
    );
    return rows;
  }

  async function foundInDatabase(values: string[]): Promise<string[]> {
    const hits: string[] = [];
    for (const table of ['file_picker_connection', 'file_picker_oauth_state_use', 'document', 'fact', 'audit_log', 'rate_limit_bucket', 'outbox']) {
      for (const value of values) {
        const { rows } = await h.admin.query<{ found: string }>(`SELECT count(*)::text AS found FROM ${table} t WHERE t::text LIKE '%' || $1 || '%'`, [value]);
        if (rows[0]?.found !== '0') hits.push(`${table}: ${value.slice(0, 12)}`);
      }
    }
    return hits;
  }

  describe('connecting', () => {
    it('asks Google for drive.file only, offline, with PKCE and a signed state, and stores only sealed tokens and the domain', async () => {
      const { state, challenge, url } = await start();
      expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
      expect(Object.fromEntries(url.searchParams)).toMatchObject({
        client_id: CLIENT_ID,
        redirect_uri: 'https://api.vero.test/v1/connections/google-drive/callback',
        response_type: 'code',
        scope: SCOPE,
        access_type: 'offline',
        code_challenge_method: 'S256',
      });
      expect(url.searchParams.has('include_granted_scopes')).toBe(false);
      expect(challenge).toMatch(/^[A-Za-z0-9_-]{43}$/);

      // Google's fixed redirect passes the person on to their organisation's callback.
      const fixed = await h.request('GET', `/v1/connections/google-drive/callback?code=${encodeURIComponent(google.newCode(challenge))}&state=${encodeURIComponent(state)}`, { cookie: owner.cookie });
      expect(fixed.statusCode).toBe(302);
      const response = await h.request('GET', String(fixed.headers['location']), { cookie: owner.cookie });
      expect(response.statusCode, response.body).toBe(200);
      expect(response.json()).toMatchObject({ provider: 'google_drive', status: 'active', accountDomain: 'kestrelpay.example', tenantId: null });
      expect(response.body).not.toMatch(/ya29\.|1\/\/|amara/);

      // Connecting read only the account's domain: no file was asked for.
      expect(google.fileIdsRequested()).toEqual([]);
      const row = await storedRow();
      expect(row?.sealed_tokens?.startsWith('v1.')).toBe(true);
      expect(row?.account_domain).toBe('kestrelpay.example');
      expect(await foundInDatabase([...google.issued, ACCOUNT_EMAIL, 'Amara Okafor'])).toEqual([]);
      const opened = openPickerTokens(h.deps.secrets, 'google_drive', owner.organisationId, row?.sealed_tokens ?? '');
      expect(google.issued).toContain(opened.refreshToken);
      expect(() => openPickerTokens(h.deps.secrets, 'sharepoint', owner.organisationId, row?.sealed_tokens ?? '')).toThrow(SealedPickerTokensError);
      expect((await auditRows()).map((item) => item.action)).toContain('google_drive.connected');
    });

    it('refuses a code without the PKCE verifier Google expects, and a grant without drive.file', async () => {
      const first = await start();
      const wrongChallenge = await callback(first.state, google.newCode('not-the-challenge-for-this-state-xxxxxxxxxxx'));
      expect(wrongChallenge.statusCode).toBe(400);
      expect(errorOf(wrongChallenge).message).toBe("Google didn't accept that sign-in. Start connecting Google Drive again.");

      google.grantedScope = 'openid';
      const second = await start();
      const noScope = await callback(second.state, google.newCode(second.challenge));
      expect(noScope.statusCode).toBe(400);
      expect(errorOf(noScope).message).toMatch(/didn't allow Vero to open the files you pick/);
      expect(google.revoked).toHaveLength(1);
      expect(await storedRow()).toBeUndefined();
    });

    it('says plainly when the person said no', async () => {
      const { state } = await start();
      const declined = await h.request('GET', `${base()}/callback?error=access_denied&state=${encodeURIComponent(state)}`, { cookie: owner.cookie });
      expect(declined.statusCode).toBe(400);
      expect(errorOf(declined).message).toMatch(/Google sign-in was not completed/);
      expect(await storedRow()).toBeUndefined();
    });
  });

  describe('the sign-in state', () => {
    it('is single use', async () => {
      const { state, challenge } = await start();
      expect((await callback(state, google.newCode(challenge))).statusCode).toBe(200);
      const again = await callback(state, google.newCode(challenge));
      expect(again.statusCode).toBe(400);
      expect(errorOf(again).message).toBe('This Google Drive link has expired, was already used, or is for someone else. Start connecting Google Drive again.');
    });

    it('expires after 10 minutes', async () => {
      const { state, challenge } = await start();
      h.setNow(new Date(Date.now() + 11 * 60 * 1000));
      expect((await callback(state, google.newCode(challenge))).statusCode).toBe(400);
    });

    it('only works for its person, organisation and provider, refuses any change, and wrong attempts do not burn it', async () => {
      const { state, challenge } = await start();
      const admin = await addMember(h, owner, 'admin');
      expect((await callback(state, google.newCode(challenge), admin)).statusCode).toBe(400);
      const stranger = await h.signIn();
      expect((await callback(state, google.newCode(challenge), stranger)).statusCode).toBe(400);
      const [body, signature] = state.split('.');
      const flipped = `${body}.${signature?.slice(0, -1)}${signature?.endsWith('0') ? '1' : '0'}`;
      expect((await callback(flipped, google.newCode(challenge))).statusCode).toBe(400);
      expect(google.calls.filter((call) => call.url.endsWith('/token'))).toHaveLength(0);
      expect((await callback(state, google.newCode(challenge))).statusCode).toBe(200);
    });
  });

  it('is for owners and admins only', async () => {
    const member = await addMember(h, owner, 'member');
    for (const [method, path] of [['GET', ''], ['POST', '/start'], ['POST', '/picker-token'], ['POST', '/files'], ['DELETE', '']] as const) {
      const response = await h.request(method, `${base()}${path}`, { cookie: member.cookie, ...(method === 'POST' && path === '/files' ? { body: { companyId, fileIds: [id()] } } : {}) });
      expect(response.statusCode, `${method} ${path}`).toBe(403);
    }
    const admin = await addMember(h, owner, 'admin');
    expect((await h.request('GET', base(), { cookie: admin.cookie })).statusCode).toBe(200);
  });

  it('gives the Picker a short-lived access token and public ids only, never the refresh token or secret', async () => {
    await connect();
    const response = await h.request('POST', `${base()}/picker-token`, { cookie: owner.cookie });
    expect(response.statusCode, response.body).toBe(200);
    const body = response.json<Record<string, string>>();
    expect(Object.keys(body).sort()).toEqual(['accessToken', 'appId', 'clientId', 'developerKey', 'expiresAt', 'scope']);
    expect(body).toMatchObject({ scope: SCOPE, developerKey: API_KEY, appId: PROJECT_NUMBER, clientId: CLIENT_ID });
    expect(google.access.has(body['accessToken'] ?? '')).toBe(true);
    for (const token of google.refresh) expect(response.body).not.toContain(token);
    expect(response.body).not.toContain(CLIENT_SECRET);
    expect((await auditRows()).map((item) => item.action)).toContain('google_drive.picker_opened');
  });

  describe('bringing in picked files', () => {
    it('reads only the picked ids, exports a Google Doc to PDF, and adds unconfirmed documents', async () => {
      await connect();
      const pdf = file();
      const doc = file({ name: 'Kestrel Pay board minutes', mimeType: 'application/vnd.google-apps.document', content: Buffer.alloc(0), modifiedTime: '2026-09-30T17:00:00.000Z' });
      const notPicked = file({ name: 'Kestrel Pay payroll.pdf' });
      google.calls = [];

      const response = await pull([pdf, doc]);
      expect(response.statusCode, response.body).toBe(202);
      // Exactly these requests, and nothing about any other file.
      expect(google.calls.map((call) => `${call.method} ${new URL(call.url).pathname}${new URL(call.url).searchParams.get('alt') === 'media' ? '?alt=media' : ''}`)).toEqual([
        `GET /drive/v3/files/${pdf}`,
        `GET /drive/v3/files/${pdf}?alt=media`,
        `GET /drive/v3/files/${doc}`,
        `GET /drive/v3/files/${doc}/export`,
      ]);
      expect(google.fileIdsRequested()).not.toContain(notPicked);
      expect(google.calls.some((call) => /\/files(\?|$)/.test(new URL(call.url).pathname + '?'))).toBe(false);
      const exportCall = google.calls.find((call) => call.url.includes('/export'));
      expect(new URL(exportCall?.url ?? '').searchParams.get('mimeType')).toBe('application/pdf');

      const docs = await documents();
      expect(docs.map((row) => row.file_name)).toEqual(['Kestrel Pay board minutes.pdf', 'Kestrel Pay shareholders agreement.pdf']);
      expect(docs.every((row) => row.status === 'needs_confirmation' && row.source === 'google_drive' && row.mime === 'application/pdf' && row.uploaded_by === null)).toBe(true);
      expect(docs[0]?.external_ref).toBe(`google_drive:${doc}:2026-09-30T17:00:00.000Z`);
      expect(docs[0]?.extracted_fields['connection']).toMatchObject({
        kind: 'google_drive',
        fileId: doc,
        modifiedTime: '2026-09-30T17:00:00.000Z',
        accountDomain: 'kestrelpay.example',
        exportedToPdf: true,
        statement: 'You picked this file in Google Drive. Google Drive says it was last changed on 2026-09-30. Google turned it into a PDF for us. That is not a check that it is genuine, signed or legally sufficient.',
      });
      expect(JSON.stringify(docs.map((row) => row.extracted_fields['connection']))).not.toMatch(/amara|valid|verified/i);

      const dto = await h.request('GET', `/v1/documents/${docs[1]?.id}`, { cookie: owner.cookie });
      expect(dto.json()).toMatchObject({ fromConnection: { kind: 'google_drive', exportedToPdf: false }, state: 'needs_confirmation' });

      // The confirm path is unchanged: only a person's confirmation files it.
      const confirmed = await h.request('POST', `/v1/documents/${docs[1]?.id}/confirm`, { cookie: owner.cookie, body: { slotKey: 'gb_open_source', confirmSigned: true } });
      expect(confirmed.statusCode, confirmed.body).toBe(200);
      const { rows: filed } = await h.admin.query<{ status: string; classification_confirmed_by: string }>(`SELECT status, classification_confirmed_by FROM document WHERE id = $1`, [docs[1]?.id]);
      expect(filed[0]).toEqual({ status: 'filed', classification_confirmed_by: owner.userId });

      // The same versions again: metadata only, nothing downloaded, nothing added.
      google.calls = [];
      await pull([pdf, doc]);
      expect(google.calls.map((call) => new URL(call.url).pathname)).toEqual([`/drive/v3/files/${pdf}`, `/drive/v3/files/${doc}`]);
      expect(await documents()).toHaveLength(2);
      const pulled = (await auditRows()).filter((item) => item.action === 'google_drive.pulled');
      expect(pulled[0]?.metadata).toMatchObject({ files: 2, added: 2 });
      expect(pulled[1]?.metadata).toMatchObject({ files: 2, added: 0, alreadyThere: 2 });
    });

    it('takes plain text and images, and refuses Word files, wrong content, oversized and binned files without downloading them', async () => {
      await connect();
      const text = file({ name: 'NOTICE.txt', mimeType: 'text/plain', content: Buffer.from('Kestrel Pay notice file\n') });
      const image = file({ name: 'Kestrel Pay stamp.png', mimeType: 'image/png', content: png() });
      const word = file({ name: 'Kestrel Pay SAFE.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const liar = file({ name: 'looks-like.pdf', mimeType: 'application/pdf', content: Buffer.from('MZ this is not a pdf') });
      const huge = file({ name: 'huge.pdf', size: 500 * 1024 * 1024 });
      const binned = file({ name: 'old.pdf', trashed: true });
      const folder = file({ name: 'Kestrel Pay', mimeType: 'application/vnd.google-apps.folder', content: Buffer.alloc(0) });
      await pull([text, image, word]);
      await pull([liar, huge, binned]);
      await pull([folder]);
      const downloaded = google.calls.filter((call) => call.url.includes('alt=media')).map((call) => new URL(call.url).pathname.split('/')[4]);
      expect(downloaded.sort()).toEqual([text, image, liar].sort());
      expect((await documents()).map((row) => [row.file_name, row.mime])).toEqual([
        ['Kestrel Pay stamp.png', 'image/png'],
        ['NOTICE.txt', 'text/plain'],
      ]);
      const pulled = (await auditRows()).filter((item) => item.action === 'google_drive.pulled').map((item) => item.metadata);
      expect(pulled).toEqual([
        expect.objectContaining({ added: 2, skippedType: 1 }),
        expect.objectContaining({ added: 0, skippedType: 1, skippedSize: 1, notFound: 1 }),
        expect.objectContaining({ added: 0, skippedType: 1 }),
      ]);
    });

    it('caps files per pick and per organisation per day, and needs a plan with the vault', async () => {
      await connect();
      const ids = [file(), file(), file(), file()];
      const tooMany = await h.request('POST', `${base()}/files`, { cookie: owner.cookie, body: { companyId, fileIds: ids } });
      expect(tooMany.statusCode).toBe(400);
      expect(errorOf(tooMany).message).toBe('You can bring in up to 3 files at a time.');
      expect((await pull(ids.slice(0, 3))).statusCode).toBe(202);
      expect((await pull(ids.slice(1, 4))).statusCode).toBe(202);
      expect((await pull(ids.slice(0, 3))).statusCode).toBe(429);
      await setPlan(h, owner.organisationId, 'free');
      expect((await h.request('POST', `${base()}/files`, { cookie: owner.cookie, body: { companyId, fileIds: [file()] } })).statusCode).toBe(403);
    });

    it('refuses a company this team only follows, before asking Google anything', async () => {
      await connect();
      google.calls = [];
      await h.admin.query(`UPDATE company SET relationship = 'follow' WHERE id = $1`, [companyId]);
      const response = await h.request('POST', `${base()}/files`, { cookie: owner.cookie, body: { companyId, fileIds: [file()] } });
      expect(response.statusCode).toBe(403);
      expect(errorOf(response)).toEqual({ code: 'follows_only', message: "You follow this company, so you can see its public record but can't add evidence for it." });
      expect(google.calls).toEqual([]);
    });

    it('refuses ids that are not Drive ids before asking Google anything', async () => {
      await connect();
      google.calls = [];
      const response = await h.request('POST', `${base()}/files`, { cookie: owner.cookie, body: { companyId, fileIds: ['../../about?x=1'] } });
      expect(response.statusCode).toBe(400);
      expect(google.calls).toEqual([]);
    });
  });

  describe('refresh and ended access', () => {
    it('refreshes a token near expiry, keeps the refresh token Google did not rotate, and seals the new access token', async () => {
      await connect();
      const before = openPickerTokens(h.deps.secrets, 'google_drive', owner.organisationId, (await storedRow())?.sealed_tokens ?? '');
      await h.admin.query(`UPDATE file_picker_connection SET access_expires_at = now() + interval '2 minutes' WHERE organisation_id = $1`, [owner.organisationId]);
      google.calls = [];
      const token = (await h.request('POST', `${base()}/picker-token`, { cookie: owner.cookie })).json<{ accessToken: string }>();
      expect(google.calls.filter((call) => call.url.endsWith('/token'))).toHaveLength(1);
      const after = openPickerTokens(h.deps.secrets, 'google_drive', owner.organisationId, (await storedRow())?.sealed_tokens ?? '');
      expect(after.refreshToken).toBe(before.refreshToken);
      expect(after.accessToken).toBe(token.accessToken);
      expect(after.accessToken).not.toBe(before.accessToken);
    });

    it('a 401 gets one refresh and one retry', async () => {
      await connect();
      const picked = file();
      google.unauthorizedOnce = true;
      await pull([picked]);
      expect(google.calls.filter((call) => call.url.endsWith('/token'))).toHaveLength(2);
      expect(await documents()).toHaveLength(1);
    });

    it('a revoked grant ends the connection with plain words, drops the tokens, and stops the run', async () => {
      await connect();
      google.refreshRefused = true;
      await h.admin.query(`UPDATE file_picker_connection SET access_expires_at = now() - interval '1 minute' WHERE organisation_id = $1`, [owner.organisationId]);
      const token = await h.request('POST', `${base()}/picker-token`, { cookie: owner.cookie });
      expect(token.statusCode).toBe(409);
      expect(errorOf(token).message).toBe('Google Drive access ended, connect again.');
      expect(await storedRow()).toMatchObject({ status: 'revoked', sealed_tokens: null, last_error: 'Google Drive access ended, connect again.' });
      expect((await h.request('GET', base(), { cookie: owner.cookie })).json()).toMatchObject({ status: 'revoked', message: 'Google Drive access ended, connect again.' });
      expect((await h.request('POST', `${base()}/files`, { cookie: owner.cookie, body: { companyId, fileIds: [file()] } })).statusCode).toBe(409);
      expect((await auditRows()).map((item) => item.action)).toContain('google_drive.access_ended');
      google.refreshRefused = false;
      await connect();
    });

    it('a sealed value that was changed is treated as ended access', async () => {
      await connect();
      const sealed = (await storedRow())?.sealed_tokens ?? '';
      await h.admin.query(`UPDATE file_picker_connection SET sealed_tokens = $2 WHERE organisation_id = $1`, [owner.organisationId, `${sealed.slice(0, -4)}${sealed.slice(-4) === 'AAAA' ? 'BBBB' : 'AAAA'}`]);
      const token = await h.request('POST', `${base()}/picker-token`, { cookie: owner.cookie });
      expect(token.statusCode).toBe(409);
      expect(errorOf(token).message).toBe('Google Drive access ended, connect again.');
    });
  });

  it('disconnecting revokes the grant at Google and deletes our row; documents stay', async () => {
    await connect();
    await pull([file()]);
    const refreshToken = openPickerTokens(h.deps.secrets, 'google_drive', owner.organisationId, (await storedRow())?.sealed_tokens ?? '').refreshToken;
    google.revoked = [];
    const response = await h.request('DELETE', base(), { cookie: owner.cookie });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'not_connected' });
    expect(response.json<{ message: string }>().message).toMatch(/asked Google to remove/);
    expect(google.revoked).toEqual([refreshToken]);
    expect(await storedRow()).toBeUndefined();
    expect(await documents()).toHaveLength(1);
    expect((await auditRows()).find((item) => item.action === 'google_drive.disconnected')?.metadata).toEqual({ wasActive: true, revokedAtProvider: true });
  });

  it('the vault connection list shows the real Google Drive status', async () => {
    const before = await h.request('GET', '/v1/vault/connections', { cookie: owner.cookie });
    expect(before.json<{ connections: { provider: string; status: string }[] }>().connections.find((item) => item.provider === 'gdrive')?.status).toBe('not_connected');
    await connect();
    const after = await h.request('GET', '/v1/vault/connections', { cookie: owner.cookie });
    expect(after.json<{ connections: { provider: string; status: string }[] }>().connections.map((item) => [item.provider, item.status])).toEqual([
      ['gdrive', 'active'],
      ['notion', 'not_connected'],
    ]);
  });

  it("one organisation never sees another organisation's connection, even in the database", async () => {
    await connect();
    const other = await h.signIn();
    expect((await h.request('GET', base(other), { cookie: other.cookie })).json<{ status: string }>().status).toBe('not_connected');
    expect((await h.request('GET', base(), { cookie: other.cookie })).statusCode).toBe(403);
    expect((await h.request('POST', `${base()}/picker-token`, { cookie: other.cookie })).statusCode).toBe(403);
    const seen = await h.deps.db.withOrg(other.organisationId, (tx) => tx.select().from(schema.filePickerConnection));
    expect(seen).toEqual([]);
  });

  it('never writes a token, the secret, the account email, a file name, a file id or file content to logs, audit or errors', async () => {
    await connect();
    const picked = file();
    await pull([picked, file({ name: 'secret-name.docx', mimeType: 'application/msword' })]);
    await callback((await start()).state, '4/code-leak-check');
    google.refreshRefused = true;
    await h.admin.query(`UPDATE file_picker_connection SET access_expires_at = now() - interval '1 minute' WHERE organisation_id = $1`, [owner.organisationId]);
    const ended = await h.request('POST', `${base()}/picker-token`, { cookie: owner.cookie });
    const logs = h.logs.join('\n');
    const audit = JSON.stringify(await auditRows());
    const printed = `${JSON.stringify(h.config)} ${inspect(h.config, { depth: 10 })}`;
    for (const secret of [...google.issued, CLIENT_SECRET, '4/code-leak-check', ACCOUNT_EMAIL, SECRET_LINE]) {
      expect(logs).not.toContain(secret);
      expect(audit).not.toContain(secret);
      expect(printed).not.toContain(secret);
      expect(ended.body).not.toContain(secret);
    }
    for (const value of [picked, 'shareholders agreement', 'secret-name']) {
      expect(logs).not.toContain(value);
      expect(audit).not.toContain(value);
    }
    expect(await foundInDatabase([...google.issued, CLIENT_SECRET, ACCOUNT_EMAIL])).toEqual([]);
  }, SEARCHES_WHOLE_DATABASE);
});

describe('Google Drive connection, switched off', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('says it is not connected yet and asks Google nothing', async () => {
    const owner = await h.signIn();
    const base = `/v1/organisations/${owner.organisationId}/connections/google-drive`;
    expect((await h.request('GET', base, { cookie: owner.cookie })).json()).toMatchObject({ status: 'not_available', message: "Google Drive isn't connected yet. You can upload the file from your computer for now." });
    expect((await h.request('POST', `${base}/start`, { cookie: owner.cookie })).json()).toMatchObject({ status: 'not_available', authorizeUrl: null });
    expect((await h.request('POST', `${base}/picker-token`, { cookie: owner.cookie })).statusCode).toBe(409);
    expect((await h.request('GET', '/v1/connections/google-drive/callback?state=xxxxxxxxxxxxxxxxxxxxxxxx', { cookie: owner.cookie })).statusCode).toBe(404);
    const list = await h.request('GET', '/v1/vault/connections', { cookie: owner.cookie });
    expect(list.json<{ connections: { provider: string; message: string }[] }>().connections[0]?.message).toMatch(/isn't connected yet/);
  });
});

describe('Google Drive settings and token sealing', () => {
  it('switch on only when all four settings are set, and never print the secret', () => {
    expect(loadConfig(testEnv()).googleDrive).toBeUndefined();
    const config = loadConfig(testEnv(ENV));
    expect(config.googleDrive?.redirectUri).toBe('https://api.vero.test/v1/connections/google-drive/callback');
    expect(() => loadConfig(testEnv({ GOOGLE_DRIVE_CLIENT_ID: CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET: CLIENT_SECRET }))).toThrow(/or none/);
    expect(() => loadConfig(testEnv({ ...ENV, GOOGLE_CLOUD_PROJECT_NUMBER: 'my-project-id' }))).toThrow(/project number/);
    expect(`${JSON.stringify(config)} ${inspect(config, { depth: 10 })} ${String(config.googleDrive?.clientSecret)}`).not.toContain(CLIENT_SECRET);
  });

  it('round-trips sealed tokens and refuses a change, a wrong key, another organisation or provider', () => {
    const secrets = new Secrets(randomBytes(32).toString('base64'));
    const organisationId = '6f1c2a8e-2f4b-4c39-9f3e-6b2d6f9a1c11';
    const tokens = { accessToken: `ya29.${randomBytes(12).toString('hex')}`, refreshToken: `1//${randomBytes(12).toString('hex')}` };
    const sealed = sealPickerTokens(secrets, 'google_drive', organisationId, tokens);
    expect(sealed.startsWith('v1.')).toBe(true);
    expect(sealed).not.toContain(tokens.accessToken);
    expect(openPickerTokens(secrets, 'google_drive', organisationId, sealed)).toEqual(tokens);
    const body = Buffer.from(sealed.slice(3), 'base64');
    body[body.length - 1] = (body[body.length - 1] ?? 0) ^ 1;
    expect(() => openPickerTokens(secrets, 'google_drive', organisationId, `v1.${body.toString('base64')}`)).toThrow(SealedPickerTokensError);
    expect(() => openPickerTokens(new Secrets(randomBytes(32).toString('base64')), 'google_drive', organisationId, sealed)).toThrow(SealedPickerTokensError);
    expect(() => openPickerTokens(secrets, 'google_drive', '0b7e7d5c-3f0a-4a51-8a5e-1c2b3d4e5f60', sealed)).toThrow(SealedPickerTokensError);
    expect(() => openPickerTokens(secrets, 'sharepoint', organisationId, sealed)).toThrow(SealedPickerTokensError);
    expect(() => openPickerTokens(secrets, 'google_drive', organisationId, `v2.${sealed.slice(3)}`)).toThrow(SealedPickerTokensError);
  });
});

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { inspect } from 'node:util';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config';
import { schema } from '../src/db';
import { signPickerState } from '../src/modules/file-pickers/state';
import { openPickerTokens } from '../src/modules/file-pickers/tokens';
import { isMicrosoftDownloadUrl, tenantFromIdToken } from '../src/modules/sharepoint/client';
import { samplePdf } from '../src/seed/sample-pdf';
import { addMember, errorOf, startHarness, testEnv, type Harness, type SignedIn } from './support/harness';
import { createCompany, setPlan } from './support/product';

/**
 * The SharePoint / OneDrive picker connection, against a mocked Microsoft identity platform and
 * Graph. The client id, secret and every token are made here for this run. Every name is
 * fictional (Kestrel Pay). No request leaves the process.
 */
const CLIENT_ID = randomUUID();
const CLIENT_SECRET = `${randomBytes(4).toString('hex')}~${randomBytes(18).toString('hex')}`;
const TENANT_ID = randomUUID();
const USER_EMAIL = 'tunde.bello@kestrelpay.example';
const SECRET_LINE = 'Kestrel Pay confidential cap table line';
const LOGIN = 'https://login.microsoftonline.com/organizations/oauth2/v2.0';
const GRAPH = 'https://graph.microsoft.com/v1.0';
const DRIVE_ID = `b!${randomBytes(24).toString('base64url').replace(/[^A-Za-z0-9_-]/g, 'x')}`;
const DOWNLOAD_HOST = 'https://kestrelpay-my.sharepoint.com';

const ENV = {
  MICROSOFT_CLIENT_ID: CLIENT_ID,
  MICROSOFT_CLIENT_SECRET: CLIENT_SECRET,
  SHAREPOINT_MAX_FILES_PER_PULL: '3',
  SHAREPOINT_MAX_FILES_PER_ORG_PER_DAY: '8',
};

interface FakeItem {
  name: string;
  mimeType: string | null;
  content: Buffer;
  size?: number;
  modified: string;
  /** Where the 302 points, to test a download host we don't trust. */
  location?: string;
}

const itemId = () => `01${randomBytes(15).toString('hex').toUpperCase()}`;

function idToken(claims: Record<string, unknown>): string {
  return `${Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.c2lnbmF0dXJl`;
}

class FakeMicrosoft {
  calls: { method: string; url: string; authorised: boolean }[] = [];
  tokenForms: URLSearchParams[] = [];
  codes = new Map<string, string>();
  access = new Set<string>();
  refresh = new Set<string>();
  issued: string[] = [];
  items = new Map<string, FakeItem>();
  downloads = new Map<string, Buffer>();
  refreshRefused: 'invalid_grant' | 'interaction_required' | null = null;

  newCode(challenge: string): string {
    const code = `0.A${randomBytes(20).toString('hex')}`;
    this.codes.set(code, challenge);
    return code;
  }

  private grant() {
    const access = `eyJ0eXAi.${randomBytes(24).toString('hex')}`;
    const refresh = `0.AXo${randomBytes(24).toString('hex')}`;
    this.access.add(access);
    this.refresh.add(refresh);
    this.issued.push(access, refresh);
    return {
      token_type: 'Bearer',
      scope: 'https://graph.microsoft.com/Files.Read openid',
      expires_in: 3599,
      access_token: access,
      refresh_token: refresh,
      id_token: idToken({ tid: TENANT_ID, oid: randomUUID(), preferred_username: USER_EMAIL, name: 'Tunde Bello' }),
    };
  }

  fetch = async (url: string, init?: RequestInit): Promise<Response> => {
    const method = init?.method ?? 'GET';
    const headers = (init?.headers ?? {}) as Record<string, string>;
    this.calls.push({ method, url, authorised: headers['authorization'] !== undefined });
    const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    const parsed = new URL(url);

    if (url === `${LOGIN}/token`) {
      const form = new URLSearchParams(init?.body instanceof URLSearchParams ? init.body.toString() : typeof init?.body === 'string' ? init.body : '');
      this.tokenForms.push(form);
      if (form.get('client_id') !== CLIENT_ID || form.get('client_secret') !== CLIENT_SECRET) return json(401, { error: 'invalid_client' });
      if (form.get('grant_type') === 'authorization_code') {
        const code = form.get('code') ?? '';
        const challenge = this.codes.get(code);
        this.codes.delete(code);
        if (!challenge || createHash('sha256').update(form.get('code_verifier') ?? '').digest('base64url') !== challenge) {
          return json(400, { error: 'invalid_grant', error_description: `AADSTS70008: code ${code} expired.` });
        }
        return json(200, this.grant());
      }
      if (form.get('grant_type') === 'refresh_token') {
        const token = form.get('refresh_token') ?? '';
        if (this.refreshRefused) return json(400, { error: this.refreshRefused, error_description: 'AADSTS50173: The provided grant has expired due to it being revoked.' });
        if (!this.refresh.delete(token)) return json(400, { error: 'invalid_grant' });
        return json(200, this.grant());
      }
      return json(400, { error: 'unsupported_grant_type' });
    }
    if (parsed.origin === DOWNLOAD_HOST || parsed.hostname.endsWith('.example')) {
      const data = this.downloads.get(parsed.pathname);
      return data ? new Response(new Uint8Array(data), { status: 200 }) : new Response('', { status: 404 });
    }
    const bearer = headers['authorization']?.replace(/^Bearer /, '') ?? '';
    if (!this.access.has(bearer)) return json(401, { error: { code: 'InvalidAuthenticationToken', message: 'Access token has expired or is not yet valid.' } });
    const match = /^\/v1\.0\/drives\/([^/]+)\/items\/([^/]+)(\/content)?$/.exec(parsed.pathname);
    const item = match && decodeURIComponent(match[1] ?? '') === DRIVE_ID ? this.items.get(decodeURIComponent(match[2] ?? '')) : undefined;
    if (!match || !item) return json(404, { error: { code: 'itemNotFound', message: 'The resource could not be found.' } });
    const id = decodeURIComponent(match[2] ?? '');
    if (match[3]) {
      if (init?.redirect !== 'manual') return json(500, { error: { code: 'test', message: 'expected a manual redirect' } });
      const path = `/personal/download/${id}`;
      this.downloads.set(path, item.content);
      return new Response(null, { status: 302, headers: { location: item.location ?? `${DOWNLOAD_HOST}${path}?tempauth=${randomBytes(8).toString('hex')}` } });
    }
    return json(200, {
      id,
      name: item.name,
      size: item.size ?? item.content.length,
      lastModifiedDateTime: item.modified,
      createdBy: { user: { email: USER_EMAIL, displayName: 'Tunde Bello' } },
      ...(item.mimeType === null ? { folder: { childCount: 3 } } : { file: { mimeType: item.mimeType } }),
    });
  };

  graphPaths(): string[] {
    return this.calls.filter((call) => call.url.startsWith(GRAPH)).map((call) => `${call.method} ${decodeURIComponent(new URL(call.url).pathname)}`);
  }
}

describe('SharePoint / OneDrive connection', () => {
  let h: Harness;
  let microsoft: FakeMicrosoft;
  let owner: SignedIn;
  let companyId: string;
  const base = (who: SignedIn = owner) => `/v1/organisations/${who.organisationId}/connections/sharepoint`;

  beforeAll(async () => {
    h = await startHarness(ENV);
    microsoft = new FakeMicrosoft();
    h.deps.microsoftFetch = (url, init) => microsoft.fetch(url, init);
  });
  afterAll(() => h.close());

  beforeEach(async () => {
    microsoft.calls = [];
    microsoft.tokenForms = [];
    microsoft.items.clear();
    microsoft.refreshRefused = null;
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
    const response = await callback(state, microsoft.newCode(challenge), who);
    expect(response.statusCode, response.body).toBe(200);
  }

  function item(extra: Partial<FakeItem> = {}): string {
    const id = itemId();
    microsoft.items.set(id, { name: 'Kestrel Pay cap table.pdf', mimeType: 'application/pdf', content: samplePdf(['Kestrel Pay Ltd', SECRET_LINE]), modified: '2026-10-21T10:00:00Z', ...extra });
    return id;
  }

  async function pull(itemIds: string[]) {
    const response = await h.request('POST', `${base()}/files`, { cookie: owner.cookie, body: { companyId, items: itemIds.map((id) => ({ driveId: DRIVE_ID, itemId: id })) } });
    await h.queue.drain();
    return response;
  }

  async function storedRow() {
    const { rows } = await h.admin.query<{ status: string; sealed_tokens: string | null; tenant_id: string | null; last_error: string | null }>(
      `SELECT status, sealed_tokens, tenant_id, last_error FROM file_picker_connection WHERE organisation_id = $1 AND provider = 'sharepoint'`,
      [owner.organisationId],
    );
    return rows[0];
  }

  async function auditRows() {
    const { rows } = await h.admin.query<{ action: string; metadata: Record<string, unknown> }>('SELECT action, metadata FROM audit_log WHERE organisation_id = $1 ORDER BY seq', [owner.organisationId]);
    return rows;
  }

  async function documents() {
    const { rows } = await h.admin.query<{ id: string; status: string; source: string; file_name: string; external_ref: string; extracted_fields: Record<string, unknown> }>(
      `SELECT id, status, source, file_name, external_ref, extracted_fields FROM document WHERE company_id = $1 ORDER BY file_name`,
      [companyId],
    );
    return rows;
  }

  it('signs in on the organizations endpoint with the narrowest scopes and PKCE, and keeps only the tenant id', async () => {
    const { state, challenge, url } = await start();
    expect(url.origin + url.pathname).toBe(`${LOGIN}/authorize`);
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      client_id: CLIENT_ID,
      response_type: 'code',
      response_mode: 'query',
      redirect_uri: 'https://api.vero.test/v1/connections/sharepoint/callback',
      scope: 'openid offline_access https://graph.microsoft.com/Files.Read',
      code_challenge_method: 'S256',
    });
    const fixed = await h.request('GET', `/v1/connections/sharepoint/callback?code=${encodeURIComponent(microsoft.newCode(challenge))}&state=${encodeURIComponent(state)}`, { cookie: owner.cookie });
    expect(fixed.statusCode).toBe(302);
    const response = await h.request('GET', String(fixed.headers['location']), { cookie: owner.cookie });
    expect(response.statusCode, response.body).toBe(200);
    expect(response.json()).toMatchObject({ provider: 'sharepoint', status: 'active', tenantId: TENANT_ID, accountDomain: null });
    expect(microsoft.tokenForms[0]?.get('code_verifier')).toMatch(/^[0-9a-f]{64}$/);
    expect(microsoft.graphPaths()).toEqual([]);
    const row = await storedRow();
    expect(row?.sealed_tokens?.startsWith('v1.')).toBe(true);
    const { rows } = await h.admin.query<{ found: string }>(`SELECT count(*)::text AS found FROM file_picker_connection t WHERE t::text LIKE '%' || $1 || '%' OR t::text LIKE '%Tunde%'`, [USER_EMAIL]);
    expect(rows[0]?.found).toBe('0');
  });

  it('refuses a replayed, expired, tampered or wrong-person state, and a Google state', async () => {
    const { state, challenge } = await start();
    const admin = await addMember(h, owner, 'admin');
    expect((await callback(state, microsoft.newCode(challenge), admin)).statusCode).toBe(400);
    // A state signed for Google Drive, for the same person, does not open the SharePoint callback.
    const google = signPickerState(h.deps, 'google_drive', { organisationId: owner.organisationId, userId: owner.userId });
    expect((await callback(google.state, microsoft.newCode(google.codeChallenge))).statusCode).toBe(400);
    const [body, signature] = state.split('.');
    expect((await callback(`${body}.${signature?.replace(/.$/, (c) => (c === '0' ? '1' : '0'))}`, microsoft.newCode(challenge))).statusCode).toBe(400);
    expect((await callback(state, microsoft.newCode(challenge))).statusCode).toBe(200);
    const replay = await callback(state, microsoft.newCode(challenge));
    expect(replay.statusCode).toBe(400);
    expect(errorOf(replay).message).toBe('This SharePoint link has expired, was already used, or is for someone else. Start connecting SharePoint again.');
    const late = await start();
    h.setNow(new Date(Date.now() + 11 * 60 * 1000));
    expect((await callback(late.state, microsoft.newCode(late.challenge))).statusCode).toBe(400);
  });

  it('says what to do when the person or their admin did not approve', async () => {
    const { state } = await start();
    const declined = await h.request('GET', `${base()}/callback?error=access_denied&state=${encodeURIComponent(state)}`, { cookie: owner.cookie });
    expect(declined.statusCode).toBe(400);
    expect(errorOf(declined).message).toMatch(/ask your IT admin/);
    expect(await storedRow()).toBeUndefined();
  });

  it('is for owners and admins only', async () => {
    const member = await addMember(h, owner, 'member');
    for (const [method, path] of [['GET', ''], ['POST', '/start'], ['DELETE', '']] as const) {
      expect((await h.request(method, `${base()}${path}`, { cookie: member.cookie })).statusCode, `${method} ${path}`).toBe(403);
    }
  });

  it('reads only the picked items, downloads through the pre-authenticated address without our token, and adds unconfirmed documents', async () => {
    await connect();
    const picked = item();
    const notPicked = item({ name: 'Kestrel Pay salaries.pdf' });
    microsoft.calls = [];
    expect((await pull([picked])).statusCode).toBe(202);
    expect(microsoft.graphPaths()).toEqual([`GET /v1.0/drives/${DRIVE_ID}/items/${picked}`, `GET /v1.0/drives/${DRIVE_ID}/items/${picked}/content`]);
    expect(microsoft.calls.some((call) => call.url.includes(notPicked))).toBe(false);
    const download = microsoft.calls.find((call) => call.url.startsWith(DOWNLOAD_HOST));
    expect(download?.authorised).toBe(false);

    const docs = await documents();
    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({ status: 'needs_confirmation', source: 'sharepoint', file_name: 'Kestrel Pay cap table.pdf', external_ref: `sharepoint:${DRIVE_ID}:${picked}:2026-10-21T10:00:00.000Z` });
    expect(docs[0]?.extracted_fields['connection']).toMatchObject({ kind: 'sharepoint', driveId: DRIVE_ID, itemId: picked, tenantId: TENANT_ID, modifiedTime: '2026-10-21T10:00:00.000Z' });
    expect(JSON.stringify(docs[0]?.extracted_fields['connection'])).not.toMatch(/tunde/i);
    const confirmed = await h.request('POST', `/v1/documents/${docs[0]?.id}/confirm`, { cookie: owner.cookie, body: { slotKey: 'gb_open_source', confirmSigned: true } });
    expect(confirmed.statusCode, confirmed.body).toBe(200);
  });

  it('refuses folders, Word files, oversized files and download addresses off Microsoft hosts', async () => {
    await connect();
    const folder = item({ name: 'Board', mimeType: null });
    const word = item({ name: 'SAFE.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const huge = item({ size: 900 * 1024 * 1024 });
    await pull([folder, word, huge]);
    const elsewhere = item({ location: 'https://downloads.attacker.example/file.pdf' });
    await pull([elsewhere]);
    expect(microsoft.calls.filter((call) => call.url.includes('/content')).map((call) => call.url)).toEqual([`${GRAPH}/drives/${encodeURIComponent(DRIVE_ID)}/items/${elsewhere}/content`]);
    expect(microsoft.calls.some((call) => call.url.includes('attacker.example'))).toBe(false);
    expect(await documents()).toEqual([]);
    const pulled = (await auditRows()).filter((row) => row.action === 'sharepoint.pulled').map((row) => row.metadata);
    expect(pulled).toEqual([expect.objectContaining({ skippedType: 2, skippedSize: 1, added: 0 }), expect.objectContaining({ failed: 1, added: 0 })]);
  });

  it('refuses a company this team only follows', async () => {
    await connect();
    await h.admin.query(`UPDATE company SET relationship = 'follow' WHERE id = $1`, [companyId]);
    const response = await h.request('POST', `${base()}/files`, { cookie: owner.cookie, body: { companyId, items: [{ driveId: DRIVE_ID, itemId: item() }] } });
    expect(response.statusCode).toBe(403);
    expect(errorOf(response)).toEqual({ code: 'follows_only', message: "You follow this company, so you can see its public record but can't add evidence for it." });
  });

  it('caps files per pick and per organisation per day', async () => {
    await connect();
    const ids = [item(), item(), item(), item()];
    const tooMany = await h.request('POST', `${base()}/files`, { cookie: owner.cookie, body: { companyId, items: ids.map((id) => ({ driveId: DRIVE_ID, itemId: id })) } });
    expect(errorOf(tooMany).message).toBe('You can bring in up to 3 files at a time.');
    expect((await pull(ids.slice(0, 3))).statusCode).toBe(202);
    expect((await pull(ids.slice(1, 4))).statusCode).toBe(202);
    expect((await pull(ids.slice(0, 3))).statusCode).toBe(429);
  });

  it('rotates the refresh token on refresh, and a revoked or MFA-blocked grant ends access with plain words', async () => {
    await connect();
    const before = openPickerTokens(h.deps.secrets, 'sharepoint', owner.organisationId, (await storedRow())?.sealed_tokens ?? '');
    await h.admin.query(`UPDATE file_picker_connection SET access_expires_at = now() + interval '1 minute' WHERE organisation_id = $1`, [owner.organisationId]);
    await pull([item()]);
    const after = openPickerTokens(h.deps.secrets, 'sharepoint', owner.organisationId, (await storedRow())?.sealed_tokens ?? '');
    expect(after.refreshToken).not.toBe(before.refreshToken);
    expect(microsoft.refresh.has(before.refreshToken)).toBe(false);
    expect(microsoft.tokenForms.at(-1)?.get('scope')).toBe('openid offline_access https://graph.microsoft.com/Files.Read');

    for (const refused of ['invalid_grant', 'interaction_required'] as const) {
      microsoft.refreshRefused = refused;
      await h.admin.query(`UPDATE file_picker_connection SET access_expires_at = now() - interval '1 minute' WHERE organisation_id = $1`, [owner.organisationId]);
      await pull([item()]);
      expect(await storedRow()).toMatchObject({ status: 'revoked', sealed_tokens: null, last_error: 'SharePoint access ended, connect again.' });
      expect((await h.request('GET', base(), { cookie: owner.cookie })).json()).toMatchObject({ status: 'revoked', message: 'SharePoint access ended, connect again.' });
      microsoft.refreshRefused = null;
      await connect();
    }
  });

  it('disconnecting deletes our row and says where to remove Vero on Microsoft\'s side', async () => {
    await connect();
    microsoft.calls = [];
    const response = await h.request('DELETE', base(), { cookie: owner.cookie });
    expect(response.json()).toMatchObject({ status: 'not_connected' });
    expect(response.json<{ message: string }>().message).toMatch(/My Apps/);
    expect(microsoft.calls).toEqual([]);
    expect(await storedRow()).toBeUndefined();
  });

  it("keeps organisations apart, and never logs or audits tokens, the secret, the user's email or file contents", async () => {
    await connect();
    await pull([item()]);
    await callback((await start()).state, '0.Acode-leak-check');
    const other = await h.signIn();
    expect((await h.request('GET', base(other), { cookie: other.cookie })).json<{ status: string }>().status).toBe('not_connected');
    expect(await h.deps.db.withOrg(other.organisationId, (tx) => tx.select().from(schema.filePickerConnection))).toEqual([]);
    const logs = h.logs.join('\n');
    const audit = JSON.stringify(await auditRows());
    const printed = `${JSON.stringify(h.config)} ${inspect(h.config, { depth: 10 })}`;
    for (const secret of [...microsoft.issued, CLIENT_SECRET, '0.Acode-leak-check', USER_EMAIL, SECRET_LINE, 'tempauth']) {
      expect(logs).not.toContain(secret);
      expect(audit).not.toContain(secret);
      expect(printed).not.toContain(secret);
    }
  });
});

describe('SharePoint / OneDrive, switched off and settings', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('says it is not connected yet and asks Microsoft nothing', async () => {
    const owner = await h.signIn();
    const base = `/v1/organisations/${owner.organisationId}/connections/sharepoint`;
    expect((await h.request('GET', base, { cookie: owner.cookie })).json()).toMatchObject({ status: 'not_available' });
    expect((await h.request('POST', `${base}/start`, { cookie: owner.cookie })).json()).toMatchObject({ status: 'not_available', authorizeUrl: null });
    expect((await h.request('GET', '/v1/connections/sharepoint/callback?state=xxxxxxxxxxxxxxxxxxxxxxxx', { cookie: owner.cookie })).statusCode).toBe(404);
  });

  it('switch on only with both id and secret, default to organizations and Files.Read, and never print the secret', () => {
    expect(loadConfig(testEnv()).sharepoint).toBeUndefined();
    const config = loadConfig(testEnv(ENV));
    expect(config.sharepoint).toMatchObject({ tenant: 'organizations', filesScope: 'Files.Read' });
    expect(loadConfig(testEnv({ ...ENV, MICROSOFT_TENANT: 'common', MICROSOFT_FILES_SCOPE: 'Files.Read.All' })).sharepoint).toMatchObject({ tenant: 'common', filesScope: 'Files.Read.All' });
    expect(() => loadConfig(testEnv({ MICROSOFT_CLIENT_ID: CLIENT_ID }))).toThrow(/both/);
    expect(() => loadConfig(testEnv({ ...ENV, MICROSOFT_FILES_SCOPE: 'Files.ReadWrite.All' }))).toThrow();
    expect(`${JSON.stringify(config)} ${inspect(config, { depth: 10 })}`).not.toContain(CLIENT_SECRET);
  });

  it('trusts only https Microsoft download hosts, and reads only the tenant id from the id token', () => {
    expect(isMicrosoftDownloadUrl('https://kestrelpay-my.sharepoint.com/personal/x/download.aspx?tempauth=1')).toBe(true);
    expect(isMicrosoftDownloadUrl('https://public.bn1302.files.1drv.com/y4m')).toBe(true);
    for (const bad of ['http://kestrelpay.sharepoint.com/x', 'https://sharepoint.com.attacker.example/x', 'https://user:pw@kestrelpay.sharepoint.com/x', 'https://kestrelpay.sharepoint.com:8443/x', 'not a url']) {
      expect(isMicrosoftDownloadUrl(bad), bad).toBe(false);
    }
    expect(tenantFromIdToken(idToken({ tid: TENANT_ID.toUpperCase(), email: USER_EMAIL }))).toBe(TENANT_ID);
    expect(tenantFromIdToken(idToken({ tid: 'not-a-guid' }))).toBeNull();
    expect(tenantFromIdToken('garbage')).toBeNull();
  });
});

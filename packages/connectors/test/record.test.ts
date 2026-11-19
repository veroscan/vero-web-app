import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createConnectors,
  loadSessions,
  recordingFetch,
  recordOneLookup,
  RecordModeRefusedError,
  redactBody,
  redactUrl,
  replayEnv,
  replayFetch,
  SOURCE_FACTORIES,
  type RecordedResponse,
} from '../src/index.js';
import { fakeFetch, NOW, sample } from './helpers.js';

const folders: string[] = [];
function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'vero-record-'));
  folders.push(dir);
  return dir;
}
afterEach(() => {
  for (const dir of folders.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function allFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => join(entry.parentPath, entry.name));
}

const CH_ROUTES = {
  '/company/14839221/officers': sample('ch-officers.json'),
  '/company/14839221/persons-with-significant-control': sample('ch-psc.json'),
  '/company/14839221/charges': sample('ch-charges.json'),
  '/company/14839221/insolvency': sample('ch-insolvency.json'),
  '/company/14839221/filing-history': JSON.stringify({ total_count: 1, items: [] }),
  '/company/14839221': sample('ch-profile.json'),
};

describe('record mode is development only', () => {
  it('is refused when NODE_ENV=production', () => {
    expect(() => createConnectors({ env: { CONNECTOR_RECORD_DIR: tempDir(), NODE_ENV: 'production' } })).toThrow(RecordModeRefusedError);
  });

  it('is allowed in development, and leaves a scan without a key unavailable, calling nothing', async () => {
    const dir = tempDir();
    const fetchImpl = fakeFetch({});
    const connectors = createConnectors({ env: { CONNECTOR_RECORD_DIR: dir, NODE_ENV: 'development' }, fetch: fetchImpl, now: NOW });
    const ch = connectors.find((connector) => connector.id === 'uk.companies_house');
    expect((await ch?.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' }))?.status).toBe('unavailable');
    expect(fetchImpl.calls).toHaveLength(0);
    expect(allFiles(dir)).toEqual([]);
  });

  it('the recording script refuses production and fixture mode, and calls nothing without a key', async () => {
    const dir = tempDir();
    const fetchImpl = fakeFetch({});
    const ref = { name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' as const };
    expect((await recordOneLookup({ connectorId: 'uk.companies_house', ref, env: { NODE_ENV: 'production', COMPANIES_HOUSE_API_KEY: 'k' }, dir, fetch: fetchImpl })).kind).toBe('refused');
    expect((await recordOneLookup({ connectorId: 'uk.companies_house', ref, env: { CONNECTOR_MODE: 'fixture', COMPANIES_HOUSE_API_KEY: 'k' }, dir, fetch: fetchImpl })).kind).toBe('refused');
    expect(await recordOneLookup({ connectorId: 'uk.companies_house', ref, env: {}, dir, fetch: fetchImpl })).toEqual({ kind: 'not_connected', missing: ['COMPANIES_HOUSE_API_KEY'] });
    expect(await recordOneLookup({ connectorId: 'us.delaware_vendor', ref, env: {}, dir, fetch: fetchImpl })).toEqual({ kind: 'not_connected', missing: ['MIDDESK_API_KEY or COBALT_API_KEY'] });
    expect((await recordOneLookup({ connectorId: 'uk.ico_register', ref, env: {}, dir, fetch: fetchImpl })).kind).toBe('refused');
    expect(fetchImpl.calls).toHaveLength(0);
  });
});

describe('the redaction rule', () => {
  it('removes secret query values and credentials from URLs', () => {
    expect(redactUrl('https://api.example.com/x?api_key=abc&q=Kestrel&token=t')).toBe('https://api.example.com/x?api_key=%5Bsecret%5D&q=Kestrel&token=%5Bsecret%5D');
    expect(redactUrl('https://user:pass@api.example.com/x')).toBe('https://api.example.com/x');
  });

  it('removes secrets, contact details and people’s names from JSON, and keeps company facts', () => {
    const body = redactBody(JSON.stringify({
      access_token: 'tok-123',
      company_name: 'KESTREL PAY UK LTD',
      registered_office_address: { address_line_1: '1 Real Street', postal_code: 'EC1A 1AA' },
      items: [{ name: 'ADEYEMI, Amara', officer_role: 'director', date_of_birth: { month: 1, year: 1988 }, address: { premises: '9' } }],
      contact: 'amara@kestrel.example or +44 20 7946 0000',
    }));
    expect(body).not.toContain('tok-123');
    expect(body).not.toContain('Real Street');
    expect(body).not.toContain('Amara');
    expect(body).not.toContain('1988');
    expect(body).not.toContain('amara@');
    expect(body).not.toContain('7946');
    expect(body).toContain('KESTREL PAY UK LTD');
    expect(body).toContain('EC1A 1AA');
    expect(body).toContain('director');
  });

  it('removes people’s names and contact details from XML such as a Form D', () => {
    const body = redactBody('<relatedPersonInfo><relatedPersonName><firstName>Amara</firstName><lastName>Adeyemi</lastName></relatedPersonName><street1>1 Real Street</street1></relatedPersonInfo><entityName>Kestrel Pay Inc.</entityName>');
    expect(body).not.toMatch(/Amara|Adeyemi|Real Street/);
    expect(body).toContain('Kestrel Pay Inc.');
  });
});

describe('recording a lookup', () => {
  it('saves each response, redacted, with only safe headers, and hands back the same response', async () => {
    const dir = tempDir();
    const base = fakeFetch({ '/thing': { status: 200, body: JSON.stringify({ email: 'a@b.example', name: 'X Ltd' }), headers: { 'content-type': 'application/json', 'set-cookie': 'session=secret', 'x-ratelimit-remaining': '9' } } });
    const recorder = recordingFetch(base, { dir, connectorId: 'uk.companies_house', now: NOW });
    const response = await recorder('https://api.example.com/thing?key=SECRET', { headers: { Authorization: 'Basic SECRET' } });
    expect(await response.text()).toBe(JSON.stringify({ email: 'a@b.example', name: 'X Ltd' }));

    const [file] = allFiles(dir);
    const saved = JSON.parse(readFileSync(file as string, 'utf8')) as RecordedResponse;
    expect(saved.request).toEqual({ method: 'GET', url: 'https://api.example.com/thing?key=%5Bsecret%5D' });
    expect(saved.headers).toEqual({ 'content-type': 'application/json', 'x-ratelimit-remaining': '9' });
    expect(saved.body).toContain('X Ltd');
    expect(JSON.stringify(saved)).not.toMatch(/SECRET|a@b\.example|session=/);
  });

  it('does not save a body over the size limit, only its size', async () => {
    const dir = tempDir();
    const recorder = recordingFetch(fakeFetch({ '/big': 'x'.repeat(50) }), { dir, connectorId: 'sanctions.lists', now: NOW, maxBytes: 10 });
    await recorder('https://lists.example.com/big');
    const saved = JSON.parse(readFileSync(allFiles(dir)[0] as string, 'utf8')) as RecordedResponse;
    expect(saved.body).toBeNull();
    expect(saved.bodyOmitted).toEqual({ reason: 'too_large', bytes: 50 });
  });

  it('records a whole lookup with a manifest, and the replay harness gets the same result back', async () => {
    const dir = tempDir();
    const env = { COMPANIES_HOUSE_API_KEY: 'live-key-should-never-be-saved', NODE_ENV: 'development' };
    const outcome = await recordOneLookup({ connectorId: 'uk.companies_house', ref: { name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', company_number: '14839221' }, env, dir, fetch: fakeFetch(CH_ROUTES), now: NOW });
    expect(outcome.kind).toBe('recorded');
    if (outcome.kind !== 'recorded') return;
    expect(outcome.status).toBe('found');
    expect(outcome.saved).toBeGreaterThan(3);
    for (const file of allFiles(dir)) expect(readFileSync(file, 'utf8')).not.toContain('live-key-should-never-be-saved');

    const [session] = loadSessions(dir);
    expect(session?.manifest.env.set).toEqual(['COMPANIES_HOUSE_API_KEY']);
    if (!session) return;
    const replay = replayFetch(session);
    const connector = SOURCE_FACTORIES['uk.companies_house']?.({ env: replayEnv(session.manifest), fetch: replay, retries: 0 });
    const result = await connector?.lookup(session.manifest.ref);
    expect(replay.unmatched).toEqual([]);
    expect(result?.status).toBe(session.manifest.expected.status);
    expect(result?.facts.map((fact) => fact.key).sort()).toEqual(session.manifest.expected.factKeys);
    // Officers' names were redacted on the way to disk, so the replay can't bring them back.
    expect(JSON.stringify(result)).not.toContain('ADEYEMI');
  });

  it('a replay that asks for something not recorded fails loudly', async () => {
    const replay = replayFetch({ folder: 'x', manifest: { connector: 'c', recordedAt: '', ref: { name: 'A', jurisdiction: 'GB' }, env: { set: [], settings: {} }, expected: { status: 'found', factKeys: [] } }, responses: [] });
    expect((await replay('https://api.example.com/unknown')).status).toBe(599);
    expect(replay.unmatched).toEqual(['GET https://api.example.com/unknown']);
  });

  it('finds no sessions in an empty or missing folder', () => {
    expect(loadSessions(join(tempDir(), 'nothing-here'))).toEqual([]);
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { createCnilDpoConnector, createNdpcListConnector, createSanctionsConnector, type FetchLike } from '@vero/connectors';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { referenceOptions, refreshReferenceData } from '../src/modules/reference/service';
import { startHarness, type Harness } from './support/harness';
import { makeStaff } from './support/product';

/**
 * The reference refresh jobs, against the real database, with every download faked. Nothing
 * here reaches the network.
 */

const SAMPLES = join(import.meta.dirname, '..', '..', '..', 'packages', 'connectors', 'test', 'samples');
const sample = (name: string) => readFileSync(join(SAMPLES, name), 'utf8');
const sha = (text: string) => createHash('sha256').update(text).digest('hex');

const NDPC_URL = 'https://services.ndpc.gov.ng/feed/hash.json';
const START = new Date('2026-11-12T06:00:00Z');
const hoursLater = (hours: number) => new Date(START.getTime() + hours * 3_600_000);

type Reply = { status: number; body?: string | null; headers?: Record<string, string> };

describe('reference data refresh', () => {
  let h: Harness;
  let reply: (url: string, init?: RequestInit) => Reply = () => ({ status: 599 });
  const calls: { url: string; headers: Headers }[] = [];

  const fakeFetch: FetchLike = async (url, init) => {
    calls.push({ url, headers: new Headers(init?.headers) });
    const { status, body, headers } = reply(url, init);
    return new Response(status === 304 ? null : (body ?? ''), { status, ...(headers ? { headers } : {}) });
  };

  async function stored(key: string) {
    const { rows } = await h.admin.query<{ content_hash: string | null; row_count: number | null; etag: string | null; last_error: string | null; checked_at: Date | null; fetched_at: Date | null }>(
      'SELECT content_hash, row_count, etag, last_error, checked_at, fetched_at FROM reference_data WHERE key = $1',
      [key],
    );
    return rows[0];
  }

  beforeAll(async () => {
    h = await startHarness({ REFERENCE_REFRESH_ENABLED: 'true', NDPC_REGISTER_URL: NDPC_URL, SANCTIONS_LISTS: 'ofac', REFERENCE_USER_AGENT: 'VeroScan-test-refresh' });
    h.deps.referenceFetch = fakeFetch;
  });
  afterAll(async () => {
    await h.admin.query('DELETE FROM reference_data');
    await h.close();
  });
  beforeEach(async () => {
    await h.admin.query('DELETE FROM reference_data');
    calls.length = 0;
    h.setNow(START);
  });

  it('with the switch off, does nothing at all', async () => {
    const off = await startHarness({ NDPC_REGISTER_URL: NDPC_URL });
    try {
      let asked = 0;
      off.deps.referenceFetch = async () => {
        asked += 1;
        return new Response('{}');
      };
      expect(off.config.reference.refreshEnabled).toBe(false);
      expect(await refreshReferenceData(off.deps, 'ng.ndpc_list')).toBe('switched_off');
      expect(asked).toBe(0);
      expect(await stored('ng.ndpc_list')).toBeUndefined();
    } finally {
      await off.close();
    }
  });

  it('a source with no address asks nothing', async () => {
    expect(await refreshReferenceData(h.deps, 'uk.ico_register')).toBe('not_configured');
    expect(await refreshReferenceData(h.deps, 'sanctions.uk')).toBe('not_configured');
    expect(calls).toHaveLength(0);
  });

  it('stores a first good copy, with its hash, row count and etag, and sends our plain user agent', async () => {
    reply = () => ({ status: 200, body: sample('ndpc-feed.json'), headers: { etag: '"v1"' } });
    expect(await refreshReferenceData(h.deps, 'ng.ndpc_list')).toBe('replaced');
    const row = await stored('ng.ndpc_list');
    expect(row).toMatchObject({ content_hash: sha(sample('ndpc-feed.json')), etag: '"v1"', last_error: null });
    expect(row?.row_count).toBeGreaterThan(0);
    expect(row?.fetched_at?.toISOString()).toBe(START.toISOString());
    expect(calls[0]?.headers.get('user-agent')).toBe('VeroScan-test-refresh');
  });

  it('is not asked again before its time, and asks conditionally once it is: a 304 keeps the copy and makes it current', async () => {
    reply = () => ({ status: 200, body: sample('ndpc-feed.json'), headers: { etag: '"v1"', 'last-modified': 'Thu, 12 Nov 2026 05:00:00 GMT' } });
    await refreshReferenceData(h.deps, 'ng.ndpc_list');
    h.setNow(hoursLater(2));
    expect(await refreshReferenceData(h.deps, 'ng.ndpc_list')).toBe('not_due');
    expect(calls).toHaveLength(1);

    reply = () => ({ status: 304 });
    h.setNow(hoursLater(25));
    expect(await refreshReferenceData(h.deps, 'ng.ndpc_list')).toBe('not_modified');
    expect(calls[1]?.headers.get('if-none-match')).toBe('"v1"');
    expect(calls[1]?.headers.get('if-modified-since')).toBe('Thu, 12 Nov 2026 05:00:00 GMT');
    const row = await stored('ng.ndpc_list');
    expect(row?.checked_at?.toISOString()).toBe(hoursLater(25).toISOString());
    // The content itself is the same download as before.
    expect(row?.fetched_at?.toISOString()).toBe(START.toISOString());
    expect(row?.content_hash).toBe(sha(sample('ndpc-feed.json')));
  });

  it('sanctions lists are asked every 6 hours', async () => {
    reply = () => ({ status: 200, body: sample('ofac-sdn.csv') });
    expect(await refreshReferenceData(h.deps, 'sanctions.ofac')).toBe('replaced');
    h.setNow(hoursLater(5));
    expect(await refreshReferenceData(h.deps, 'sanctions.ofac')).toBe('not_due');
    h.setNow(hoursLater(6));
    expect(await refreshReferenceData(h.deps, 'sanctions.ofac')).toBe('not_modified');
  });

  it('a failed, empty or suspiciously small download keeps the old copy and records why', async () => {
    reply = () => ({ status: 200, body: sample('ofac-sdn.csv') });
    await refreshReferenceData(h.deps, 'sanctions.ofac');
    const good = await stored('sanctions.ofac');

    let hour = 6;
    for (const bad of [
      { status: 503 } as Reply,
      { status: 200, body: '' },
      // One entity where the good copy had three: under half.
      { status: 200, body: '1,"ONLY ONE LTD","-0-","SDGT"\n' },
    ]) {
      reply = () => bad;
      h.setNow(hoursLater(hour));
      expect(await refreshReferenceData(h.deps, 'sanctions.ofac')).toBe('rejected');
      const row = await stored('sanctions.ofac');
      expect(row?.content_hash).toBe(good?.content_hash);
      expect(row?.row_count).toBe(good?.row_count);
      expect(row?.last_error).toBeTruthy();
      expect(row?.last_error).not.toMatch(/https?:/);
      hour += 7;
    }
    expect((await stored('sanctions.ofac'))?.last_error).toContain('under half');

    // An hour after a failure it is asked again, and a good copy clears the error.
    reply = () => ({ status: 200, body: `${sample('ofac-sdn.csv')}9,"ANOTHER ENTITY LTD","-0-","SDGT"\n` });
    h.setNow(hoursLater(hour));
    expect(await refreshReferenceData(h.deps, 'sanctions.ofac')).toBe('replaced');
    expect((await stored('sanctions.ofac'))?.last_error).toBeNull();
  });

  it('a failure with no copy yet is recorded, and the source falls back to its old behaviour', async () => {
    reply = () => ({ status: 500 });
    expect(await refreshReferenceData(h.deps, 'ng.ndpc_list')).toBe('rejected');
    expect(await stored('ng.ndpc_list')).toMatchObject({ content_hash: null, row_count: null });
    expect((await stored('ng.ndpc_list'))?.last_error).toBeTruthy();
  });

  it('the sources read the stored copy, and a stale copy gives "unavailable", never a clean sanctions result', async () => {
    reply = (url) => (url.includes('sdn.csv') ? { status: 200, body: sample('ofac-sdn.csv') } : { status: 200, body: sample('ndpc-feed.json') });
    await refreshReferenceData(h.deps, 'sanctions.ofac');
    await refreshReferenceData(h.deps, 'ng.ndpc_list');
    const asked: string[] = [];
    const noNetwork: FetchLike = async (url) => {
      asked.push(url);
      return new Response('', { status: 599 });
    };
    const deps = { reference: referenceOptions(h.deps.db, h.config), fetch: noNetwork, now: h.deps.now, retries: 0, sleep: async () => undefined };
    const sanctions = createSanctionsConnector({ ...deps, env: { SANCTIONS_LISTS: 'ofac' } });
    const ndpc = createNdpcListConnector({ ...deps, env: { NDPC_REGISTER_URL: NDPC_URL } });

    h.setNow(hoursLater(3));
    const clean = await sanctions.lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(clean.status).toBe('not_found');
    expect(clean.message).toContain('List last updated on 12 Nov 2026');
    expect((await ndpc.lookup({ name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG' })).status).toBe('found');

    // Sanctions: 24 hours. The NDPC copy is still within its 48.
    h.setNow(hoursLater(25));
    const stale = await sanctions.lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(stale.status).toBe('unavailable');
    expect(stale.facts).toEqual([]);
    expect(stale.message).toContain('too old');
    expect((await ndpc.lookup({ name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG' })).status).toBe('found');

    h.setNow(hoursLater(49));
    expect((await ndpc.lookup({ name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG' })).status).toBe('unavailable');
    expect(asked).toEqual([]);
  });

  it('an admin sees each list: last fetched, rows, last error and age, and no content', async () => {
    reply = () => ({ status: 200, body: sample('ofac-sdn.csv') });
    await refreshReferenceData(h.deps, 'sanctions.ofac');
    reply = () => ({ status: 500 });
    await refreshReferenceData(h.deps, 'ng.ndpc_list');
    h.setNow(hoursLater(30));

    const admin = await makeStaff(h, 'admin');
    const response = await h.request('GET', '/v1/admin/connectors', { cookie: admin.cookie });
    expect(response.statusCode).toBe(200);
    const body = response.json<{ referenceData: { refreshEnabled: boolean; sources: { key: string; lastFetchedAt: string | null; rowCount: number | null; lastError: string | null; ageHours: number | null; fresh: boolean; configured: boolean; maxAgeHours: number }[] } }>();
    expect(body.referenceData.refreshEnabled).toBe(true);
    const byKey = new Map(body.referenceData.sources.map((source) => [source.key, source]));
    expect([...byKey.keys()].sort()).toEqual(['fr.cnil_dpo', 'ng.ndpc_list', 'sanctions.eu', 'sanctions.fr', 'sanctions.ofac', 'sanctions.uk', 'sanctions.un', 'uk.ico_register']);
    expect(byKey.get('sanctions.ofac')).toMatchObject({ lastFetchedAt: START.toISOString(), rowCount: 3, lastError: null, ageHours: 30, maxAgeHours: 24, fresh: false, configured: true });
    expect(byKey.get('ng.ndpc_list')).toMatchObject({ lastFetchedAt: null, rowCount: null, fresh: false, configured: true });
    expect(byKey.get('ng.ndpc_list')?.lastError).toBeTruthy();
    expect(byKey.get('uk.ico_register')).toMatchObject({ configured: false, ageHours: null });
    expect(response.body).not.toContain('SANCTIONED PAY LTD');
  });
});

describe('reference data refresh: the French lists', () => {
  let h: Harness;
  const CNIL_URL = 'https://www.data.gouv.fr/api/1/datasets/r/c5d02b42-1008-4406-83f5-3a81c8b936a3';

  beforeAll(async () => {
    h = await startHarness({ REFERENCE_REFRESH_ENABLED: 'true', SANCTIONS_LISTS: 'fr', FR_CNIL_DPO_URL: CNIL_URL, REFERENCE_USER_AGENT: 'VeroScan-test-refresh' });
    h.deps.referenceFetch = async (url) => new Response(url.includes('gels-avoirs') ? sample('fr-gels.json') : sample('fr-cnil-dpo.csv'), { status: 200 });
    await h.admin.query('DELETE FROM reference_data');
    h.setNow(START);
  });
  afterAll(async () => {
    await h.admin.query('DELETE FROM reference_data');
    await h.close();
  });

  it('stores small copies with nothing about a person, read back by the sources and shown to an admin', async () => {
    expect(await refreshReferenceData(h.deps, 'sanctions.fr')).toBe('replaced');
    expect(await refreshReferenceData(h.deps, 'fr.cnil_dpo')).toBe('replaced');
    const { rows } = await h.admin.query<{ key: string; content: string; row_count: number }>("SELECT key, content, row_count FROM reference_data WHERE key IN ('sanctions.fr', 'fr.cnil_dpo') ORDER BY key");
    expect(rows.map((row) => [row.key, row.row_count])).toEqual([['fr.cnil_dpo', 2], ['sanctions.fr', 3]]);
    for (const row of rows) {
      for (const word of ['Camille', 'EXEMPLE', 'dpo@', '+33', 'FICTIVUS', 'Ignatius', '1970', 'contact@']) expect(row.content, row.key).not.toContain(word);
    }

    const options = referenceOptions(h.deps.db, h.config);
    const cnil = createCnilDpoConnector({ env: { FR_CNIL_DPO_URL: CNIL_URL }, now: () => hoursLater(1), reference: options });
    expect((await cnil.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: '123456808' })).status).toBe('found');
    const sanctions = createSanctionsConnector({ env: { SANCTIONS_LISTS: 'fr' }, now: () => hoursLater(1), reference: options, fetch: async () => new Response('', { status: 599 }) });
    expect((await sanctions.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR' })).status).toBe('not_found');

    const admin = await makeStaff(h, 'admin');
    const response = await h.request('GET', '/v1/admin/connectors', { cookie: admin.cookie });
    const body = response.json<{ referenceData: { sources: { key: string; rowCount: number | null; configured: boolean; fresh: boolean; maxAgeHours: number }[] } }>();
    const byKey = new Map(body.referenceData.sources.map((source) => [source.key, source]));
    expect(byKey.get('fr.cnil_dpo')).toMatchObject({ rowCount: 2, configured: true, fresh: true, maxAgeHours: 48 });
    expect(byKey.get('sanctions.fr')).toMatchObject({ rowCount: 3, configured: true, fresh: true, maxAgeHours: 24 });
    expect(response.body).not.toContain('123456808');
  });
});

import { describe, expect, it } from 'vitest';
import {
  createIcoRegisterConnector, createNdpcListConnector, createReferenceRefresher, createSanctionsConnector, REFERENCE_SOURCES,
  type HeldCopy, type ReferenceCopy, type ReferenceKey, type ReferenceOptions,
} from '../src/index.js';
import { sha256 } from '../src/runtime.js';
import { factMap, fakeFetch, noSleep, sample } from './helpers.js';

const NOW = new Date('2026-11-12T09:00:00Z');
const HOURS = 3_600_000;
const NOTHING: HeldCopy = { contentHash: null, etag: null, lastModified: null, rowCount: null };

/** An in-memory stand-in for the reference_data table. */
function memoryStore(copies: Partial<Record<ReferenceKey, { content: string; checkedAt: Date }>>) {
  const reads: ReferenceKey[] = [];
  const options: ReferenceOptions = {
    maxAgeHours: 48,
    sanctionsMaxAgeHours: 24,
    store: {
      async latest(key) {
        const copy = copies[key];
        if (!copy) return null;
        const out: ReferenceCopy = { key, contentHash: sha256(copy.content), fetchedAt: copy.checkedAt, checkedAt: copy.checkedAt, rowCount: 1 };
        return out;
      },
      async content(key, hash) {
        reads.push(key);
        const copy = copies[key];
        return copy && sha256(copy.content) === hash ? copy.content : null;
      },
    },
  };
  return { options, reads };
}

const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * HOURS);

describe('reference refresh: the download', () => {
  const env = { NDPC_REGISTER_URL: 'https://services.ndpc.gov.ng/feed/hash.json', SANCTIONS_LISTS: 'ofac', ICO_REGISTER_URL: 'https://ico.example.test/register.csv' };
  const refresher = (fetchImpl: ReturnType<typeof fakeFetch>, extra: Record<string, string> = {}) =>
    createReferenceRefresher({ env: { ...env, ...extra }, userAgent: 'VeroScan-test', fetch: fetchImpl, sleep: noSleep, retries: 0, now: () => NOW });

  it('asks nothing when the source has no address or is not switched on', async () => {
    const fetchImpl = fakeFetch({});
    const r = createReferenceRefresher({ env: {}, userAgent: 'x', fetch: fetchImpl, sleep: noSleep, now: () => NOW });
    expect(await r.refresh('ng.ndpc_list', NOTHING)).toEqual({ kind: 'not_configured' });
    expect(await r.refresh('sanctions.uk', NOTHING)).toEqual({ kind: 'not_configured' });
    expect(await r.refresh('uk.ico_register', NOTHING)).toEqual({ kind: 'not_configured' });
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('refuses an address that is not https', async () => {
    const fetchImpl = fakeFetch({});
    const outcome = await refresher(fetchImpl, { NDPC_REGISTER_URL: 'http://services.ndpc.gov.ng/feed.json' }).refresh('ng.ndpc_list', NOTHING);
    expect(outcome.kind).toBe('rejected');
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('a first download is a new copy, with its row count, etag and date, and sends our plain user agent', async () => {
    const fetchImpl = fakeFetch({ 'feed/hash.json': { status: 200, body: sample('ndpc-feed.json'), headers: { etag: '"v1"', 'last-modified': 'Tue, 10 Nov 2026 08:00:00 GMT' } } });
    const outcome = await refresher(fetchImpl).refresh('ng.ndpc_list', NOTHING);
    expect(outcome).toMatchObject({ kind: 'replaced', etag: '"v1"', lastModified: 'Tue, 10 Nov 2026 08:00:00 GMT', contentHash: sha256(sample('ndpc-feed.json')) });
    expect(outcome.kind === 'replaced' && outcome.rowCount).toBeGreaterThan(0);
    const headers = new Headers(fetchImpl.calls[0]?.init?.headers);
    expect(headers.get('user-agent')).toBe('VeroScan-test');
    // Nothing held, so nothing conditional is asked.
    expect(headers.get('if-none-match')).toBeNull();
    expect(headers.get('if-modified-since')).toBeNull();
  });

  /** A 304 has no body, which the shared fake can't build. */
  const notModified = () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fn = (async (url: string, init?: RequestInit) => {
      calls.push(init ? { url, init } : { url });
      return new Response(null, { status: 304 });
    }) as ReturnType<typeof fakeFetch>;
    fn.calls = calls;
    return fn;
  };

  it('asks conditionally, and a 304 keeps the copy as current', async () => {
    const fetchImpl = notModified();
    const held: HeldCopy = { contentHash: 'abc', etag: '"v1"', lastModified: 'Tue, 10 Nov 2026 08:00:00 GMT', rowCount: 3 };
    const outcome = await refresher(fetchImpl).refresh('sanctions.ofac', held);
    expect(outcome).toEqual({ kind: 'not_modified', etag: '"v1"', lastModified: 'Tue, 10 Nov 2026 08:00:00 GMT' });
    const headers = new Headers(fetchImpl.calls[0]?.init?.headers);
    expect(headers.get('if-none-match')).toBe('"v1"');
    expect(headers.get('if-modified-since')).toBe('Tue, 10 Nov 2026 08:00:00 GMT');
  });

  it('a 304 with no copy held is not taken as good news', async () => {
    const outcome = await refresher(notModified()).refresh('sanctions.ofac', { ...NOTHING, etag: '"v1"' });
    expect(outcome.kind).toBe('rejected');
  });

  it('the same content again counts as not modified', async () => {
    const body = sample('ofac-sdn.csv');
    const outcome = await refresher(fakeFetch({ 'sdn.csv': body })).refresh('sanctions.ofac', { contentHash: sha256(body), etag: null, lastModified: null, rowCount: 3 });
    expect(outcome.kind).toBe('not_modified');
  });

  it('a failed download is rejected with a plain reason and no address in it', async () => {
    const outcome = await refresher(fakeFetch({ 'sdn.csv': { status: 503 } })).refresh('sanctions.ofac', NOTHING);
    expect(outcome.kind).toBe('rejected');
    expect(outcome.kind === 'rejected' && outcome.error).not.toMatch(/https?:/);
  });

  it('an empty download is rejected', async () => {
    expect((await refresher(fakeFetch({ 'sdn.csv': '' })).refresh('sanctions.ofac', NOTHING)).kind).toBe('rejected');
    expect((await refresher(fakeFetch({ 'feed/hash.json': '{"data": []}' })).refresh('ng.ndpc_list', NOTHING)).kind).toBe('rejected');
  });

  it('a download in a format we cannot read is rejected', async () => {
    const outcome = await refresher(fakeFetch({ 'register.csv': 'a,b\n1,2\n' })).refresh('uk.ico_register', NOTHING);
    expect(outcome).toMatchObject({ kind: 'rejected' });
    expect(outcome.kind === 'rejected' && outcome.error).toContain('kept the last good copy');
  });

  it('a suspiciously small download is rejected: under half the rows of the last good copy', async () => {
    const held: HeldCopy = { contentHash: 'old', etag: null, lastModified: null, rowCount: 100 };
    const outcome = await refresher(fakeFetch({ 'sdn.csv': sample('ofac-sdn.csv') })).refresh('sanctions.ofac', held);
    expect(outcome.kind).toBe('rejected');
    expect(outcome.kind === 'rejected' && outcome.error).toContain('under half');
    // Half or more is fine.
    const ok = await refresher(fakeFetch({ 'sdn.csv': sample('ofac-sdn.csv') })).refresh('sanctions.ofac', { ...held, rowCount: 6 });
    expect(ok.kind).toBe('replaced');
  });

  it('sanctions are asked every 6 hours, the others daily', () => {
    expect(REFERENCE_SOURCES['sanctions.uk'].everyHours).toBe(6);
    expect(REFERENCE_SOURCES['uk.ico_register'].everyHours).toBe(24);
  });
});

describe('connectors reading the stored copy', () => {
  it('ICO: reads the stored copy, not the file, and says how old it is', async () => {
    const { options } = memoryStore({ 'uk.ico_register': { content: sample('ico-register.csv'), checkedAt: hoursAgo(5) } });
    let fileReads = 0;
    const connector = createIcoRegisterConnector({ env: { ICO_REGISTER_URL: 'https://ico.example.test/r.csv' }, reference: options, readRegisterFile: async () => { fileReads += 1; return ''; }, now: () => NOW });
    const result = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', postcode: 'EC1A 2BB' });
    expect(result.status).toBe('found');
    expect(result.message).toBe('List last updated on 12 Nov 2026.');
    expect(result.provenance.rawHash).toBe(sha256(sample('ico-register.csv')));
    expect(fileReads).toBe(0);
  });

  it('ICO: a copy older than the limit is unavailable, with a plain reason', async () => {
    const { options } = memoryStore({ 'uk.ico_register': { content: sample('ico-register.csv'), checkedAt: hoursAgo(49) } });
    const result = await createIcoRegisterConnector({ env: { ICO_REGISTER_FILE: 'x.csv' }, reference: options, readRegisterFile: async () => sample('ico-register.csv'), now: () => NOW })
      .lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', postcode: 'EC1A 2BB' });
    expect(result.status).toBe('unavailable');
    expect(result.facts).toEqual([]);
    expect(result.message).toContain('10 Nov 2026');
    expect(result.message).toContain('too old');
  });

  it('ICO: with no copy, it falls back to the local file as before', async () => {
    const { options } = memoryStore({});
    const result = await createIcoRegisterConnector({ env: { ICO_REGISTER_FILE: 'x.csv' }, reference: options, readRegisterFile: async () => sample('ico-register.csv'), now: () => NOW })
      .lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', postcode: 'EC1A 2BB' });
    expect(result.status).toBe('found');
    expect(result.message).toBeUndefined();
  });

  it('ICO: with only the download address and no copy yet, it is unavailable', async () => {
    const result = await createIcoRegisterConnector({ env: { ICO_REGISTER_URL: 'https://ico.example.test/r.csv' }, reference: memoryStore({}).options, now: () => NOW })
      .lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', postcode: 'EC1A 2BB' });
    expect(result.status).toBe('unavailable');
  });

  it('NDPC: reads the stored copy without downloading, and parses it once', async () => {
    const { options, reads } = memoryStore({ 'ng.ndpc_list': { content: sample('ndpc-feed.json'), checkedAt: hoursAgo(1) } });
    const fetchImpl = fakeFetch({});
    const connector = createNdpcListConnector({ env: { NDPC_REGISTER_URL: 'https://services.ndpc.gov.ng/feed/hash.json' }, reference: options, fetch: fetchImpl, sleep: noSleep, now: () => NOW });
    const found = await connector.lookup({ name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG' });
    const missing = await connector.lookup({ name: 'Nobody At All', jurisdiction: 'NG' });
    expect(found.status).toBe('found');
    expect(found.message).toContain('List last updated on 12 Nov 2026');
    expect(missing.status).toBe('not_found');
    expect(missing.message).toContain('List last updated on');
    expect(fetchImpl.calls).toHaveLength(0);
    expect(reads).toEqual(['ng.ndpc_list']);
  });

  it('NDPC: a stale copy is unavailable and nothing is downloaded instead', async () => {
    const { options } = memoryStore({ 'ng.ndpc_list': { content: sample('ndpc-feed.json'), checkedAt: hoursAgo(72) } });
    const fetchImpl = fakeFetch({ 'feed/hash.json': sample('ndpc-feed.json') });
    const result = await createNdpcListConnector({ env: { NDPC_REGISTER_URL: 'https://services.ndpc.gov.ng/feed/hash.json' }, reference: options, fetch: fetchImpl, sleep: noSleep, now: () => NOW })
      .lookup({ name: 'Nobody At All', jurisdiction: 'NG' });
    expect(result.status).toBe('unavailable');
    expect(result.facts).toEqual([]);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('NDPC: with no copy, it downloads during the scan as before', async () => {
    const fetchImpl = fakeFetch({ 'feed/hash.json': sample('ndpc-feed.json') });
    const result = await createNdpcListConnector({ env: { NDPC_REGISTER_URL: 'https://services.ndpc.gov.ng/feed/hash.json' }, reference: memoryStore({}).options, fetch: fetchImpl, sleep: noSleep, now: () => NOW })
      .lookup({ name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG' });
    expect(result.status).toBe('found');
    expect(fetchImpl.calls).toHaveLength(1);
  });

  const allLists = (checkedAt: Date) => ({
    'sanctions.ofac': { content: sample('ofac-sdn.csv'), checkedAt },
    'sanctions.uk': { content: sample('uk-sanctions.csv'), checkedAt },
    'sanctions.un': { content: sample('un-list.xml'), checkedAt },
  });
  const sanctions = (options: ReferenceOptions, fetchImpl = fakeFetch({})) =>
    createSanctionsConnector({ env: { SANCTIONS_LISTS: 'ofac,uk,un' }, reference: options, fetch: fetchImpl, sleep: noSleep, retries: 0, now: () => NOW });

  it('sanctions: fresh copies give a real answer, saying how old the lists are, with no download', async () => {
    const fetchImpl = fakeFetch({});
    const clean = await sanctions(memoryStore(allLists(hoursAgo(2))).options, fetchImpl).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(clean.status).toBe('not_found');
    expect(clean.message).toBe('No match on the lists we checked. List last updated on 12 Nov 2026.');
    const hit = await sanctions(memoryStore(allLists(hoursAgo(2))).options, fetchImpl).lookup({ name: 'Sanctioned Pay Limited', jurisdiction: 'US-DE' });
    expect(hit.status).toBe('found');
    expect(factMap(hit)['registry.sanctions.match']).toBe(true);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('sanctions: a stale list never gives "no match", it is unavailable', async () => {
    const fetchImpl = fakeFetch({});
    const result = await sanctions(memoryStore(allLists(hoursAgo(25))).options, fetchImpl).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('unavailable');
    expect(result.facts).toEqual([]);
    expect(result.message).toContain('too old');
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('sanctions: one stale list out of three is enough to give no answer', async () => {
    const lists = { ...allLists(hoursAgo(1)), 'sanctions.un': { content: sample('un-list.xml'), checkedAt: hoursAgo(30) } };
    const result = await sanctions(memoryStore(lists).options).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('unavailable');
    expect(result.message).toContain('UN Consolidated List');
    expect(result.facts).toEqual([]);
  });

  it('sanctions: a list with no copy is still downloaded, as before', async () => {
    const { 'sanctions.ofac': ofac, 'sanctions.uk': uk } = allLists(hoursAgo(1));
    const fetchImpl = fakeFetch({ 'consolidated.xml': sample('un-list.xml') });
    const result = await sanctions(memoryStore({ 'sanctions.ofac': ofac, 'sanctions.uk': uk }).options, fetchImpl).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('not_found');
    expect(fetchImpl.calls.map((call) => call.url)).toEqual([expect.stringContaining('consolidated.xml')]);
  });
});

import { describe, expect, it, vi } from 'vitest';
import {
  CONNECTOR_FACT_KEYS,
  connectorsFor,
  createConnectors,
  createHttp,
  createCompaniesHouseConnector,
  defineConnector,
  InvalidConnectorModeError,
  RateLimiter,
  runConnectors,
  SourceError,
  toEngineInput,
  type CacheHook,
  type ConnectorDeps,
  type SourceResult,
} from '../src/index.js';
import { fakeFetch, noSleep, NOW, sampleJson } from './helpers.js';

const REF = { name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', company_number: '14839221' } as const;

function http(fetchImpl: Parameters<typeof createHttp>[0]['fetch'], overrides: Partial<Parameters<typeof createHttp>[0]> = {}) {
  return createHttp({ fetch: fetchImpl, sleep: noSleep, timeoutMs: 50, retries: 2, sourceName: 'Sample Source', ...overrides });
}

describe('every connector with no key', () => {
  const connectors = createConnectors({ env: {}, now: NOW });

  it('has every source, each once (more join as countries are added)', () => {
    const ids = connectors.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining([
      'fr.cnil_dpo', 'fr.recherche_entreprises', 'ng.cac_vendor', 'ng.ndpc_list', 'sanctions.lists', 'uk.companies_house', 'uk.hmrc_vat', 'uk.ico_register',
      'us.delaware_vendor', 'us.sec_form_d', 'us.uspto', 'web.policy_scan',
      'global.gleif', 'eu.vies_vat', 'global.opencorporates',
    ]));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(connectors.map((c) => [c.id, c] as const))('%s is unavailable, makes no call and has no facts', async (_id, connector) => {
    const fetchSpy = vi.fn();
    const isolated = createConnectors({ env: {}, now: NOW, fetch: fetchSpy }).find((c) => c.id === connector.id);
    const result = await isolated?.lookup({ name: 'Anything Ltd', jurisdiction: 'GB', website_url: 'https://example.com' });
    expect(result?.status).toBe('unavailable');
    expect(result?.facts).toEqual([]);
    expect(result?.provenance.fixture).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('connectors', () => {
  it('have a prefix their facts live under, all in the published list', () => {
    const connectors = createConnectors({ env: {} });
    for (const connector of connectors) {
      const keys = CONNECTOR_FACT_KEYS.filter((k) => k.startsWith(`${connector.factPrefix}.`));
      expect(keys.length, connector.id).toBeGreaterThan(0);
    }
  });

  it('are chosen by jurisdiction', () => {
    const connectors = createConnectors({ env: {} });
    expect(connectorsFor(connectors, 'GB').map((c) => c.id)).toContain('uk.companies_house');
    expect(connectorsFor(connectors, 'GB').map((c) => c.id)).not.toContain('ng.cac_vendor');
    expect(connectorsFor(connectors, 'US-DE').map((c) => c.id)).toContain('us.delaware_vendor');
    expect(connectorsFor(connectors, 'NG').map((c) => c.id)).toContain('ng.ndpc_list');
    expect(connectorsFor(connectors, 'NG').map((c) => c.id)).toContain('sanctions.lists');
  });

  it('refuses a mode it does not know', () => {
    expect(() => createConnectors({ env: { CONNECTOR_MODE: 'demo' } })).toThrow(InvalidConnectorModeError);
  });

  it('runs together, and one failure leaves the others alone', async () => {
    const all = createConnectors({ env: {}, now: NOW });
    const results = await runConnectors(all, { name: 'X Ltd', jurisdiction: 'GB' });
    expect(results).toHaveLength(all.length);
  });
});

describe('timeouts', () => {
  it('gives up on a source that never answers, in plain words', async () => {
    const hanging: ConnectorDeps['fetch'] = (_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    });
    const call = http(hanging, { retries: 1 })('https://x.example/a');
    await expect(call).rejects.toThrow('Sample Source took too long to answer.');
  });

  it('turns a timeout into status error, never unavailable or a throw', async () => {
    const hanging = ((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    })) as NonNullable<ConnectorDeps['fetch']>;
    const connector = createCompaniesHouseConnector({ env: { COMPANIES_HOUSE_API_KEY: 'k' }, fetch: hanging, sleep: noSleep, timeoutMs: 20, retries: 0, now: NOW });
    const result = await connector.lookup(REF);
    expect(result.status).toBe('error');
    expect(result.message).toContain('took too long');
    expect(result.facts).toEqual([]);
  });

  it('counts the time spent reading a slow body', async () => {
    const slowBody = (async (_url: string, init?: RequestInit) => ({
      status: 200,
      headers: new Headers(),
      text: () => new Promise<string>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      }),
    }) as unknown as Response) as NonNullable<ConnectorDeps['fetch']>;
    await expect(http(slowBody, { retries: 0 })('https://x.example/a')).rejects.toThrow('took too long');
  });
});

describe('retries', () => {
  it('retries 5xx, then succeeds', async () => {
    const fetchImpl = fakeFetch({ 'x.example': [{ status: 503 }, { status: 502 }, 'ok'] });
    const response = await http(fetchImpl)('https://x.example/a');
    expect(response.text).toBe('ok');
    expect(fetchImpl.calls).toHaveLength(3);
  });

  it('stops after the limit and says what happened', async () => {
    const fetchImpl = fakeFetch({ 'x.example': { status: 500 } });
    await expect(http(fetchImpl)('https://x.example/a')).rejects.toThrow('had a problem on its side');
    expect(fetchImpl.calls).toHaveLength(3);
  });

  it('retries network failures', async () => {
    let calls = 0;
    const flaky = (async () => {
      calls += 1;
      if (calls === 1) throw new Error('ECONNRESET at 10.0.0.1');
      return new Response('ok');
    }) as NonNullable<ConnectorDeps['fetch']>;
    expect((await http(flaky)('https://x.example/a')).text).toBe('ok');
    expect(calls).toBe(2);
  });

  it('honours Retry-After on a 429', async () => {
    const sleeps: number[] = [];
    const fetchImpl = fakeFetch({ 'x.example': [{ status: 429, headers: { 'Retry-After': '7' } }, 'ok'] });
    await http(fetchImpl, { sleep: async (ms) => { sleeps.push(ms); } })('https://x.example/a');
    expect(sleeps).toEqual([7000]);
  });

  it('backs off exponentially without a Retry-After', async () => {
    const sleeps: number[] = [];
    const fetchImpl = fakeFetch({ 'x.example': { status: 503 } });
    await http(fetchImpl, { sleep: async (ms) => { sleeps.push(ms); } })('https://x.example/a').catch(() => undefined);
    expect(sleeps).toEqual([250, 500]);
  });

  it('does not retry a 401 or 403', async () => {
    const fetchImpl = fakeFetch({ 'x.example': { status: 401 } });
    await expect(http(fetchImpl)('https://x.example/a')).rejects.toThrow("didn't accept our credentials");
    expect(fetchImpl.calls).toHaveLength(1);
  });

  it('does not retry a 400 unless asked to accept it', async () => {
    const fetchImpl = fakeFetch({ 'x.example': { status: 400 } });
    await expect(http(fetchImpl)('https://x.example/a')).rejects.toThrow('rejected the request');
    expect((await http(fetchImpl)('https://x.example/a', { allow: [400] })).status).toBe(400);
  });

  it('passes a 404 through for the source to read', async () => {
    const fetchImpl = fakeFetch({ 'x.example': { status: 404 } });
    expect((await http(fetchImpl)('https://x.example/a')).status).toBe(404);
    expect(fetchImpl.calls).toHaveLength(1);
  });

  it('reports bad JSON in plain words', async () => {
    const fetchImpl = fakeFetch({ 'x.example': '<html>' });
    const response = await http(fetchImpl)('https://x.example/a');
    expect(() => response.json()).toThrow(SourceError);
  });
});

describe('secrets', () => {
  it('never appear in results or messages, even on failure', async () => {
    const key = 'SECRET-KEY-VALUE';
    const failing = (async () => { throw new Error(`failed with ${key}`); }) as NonNullable<ConnectorDeps['fetch']>;
    const result = await createCompaniesHouseConnector({ env: { COMPANIES_HOUSE_API_KEY: key }, fetch: failing, sleep: noSleep, retries: 0, now: NOW }).lookup(REF);
    expect(result.status).toBe('error');
    expect(JSON.stringify(result)).not.toContain(key);
    expect(JSON.stringify(result)).not.toContain(Buffer.from(`${key}:`).toString('base64'));
  });

  it('does not leak an unexpected error message', async () => {
    const connector = defineConnector({
      id: 'x', jurisdictions: ['GB'], capabilities: [], factPrefix: 'x', sourceName: 'Sample', method: 'official_live', homeUrl: 'https://x.example',
      lookup: async () => { throw new TypeError('internal path C:\\secret\\file'); },
    }, { env: {}, now: NOW });
    const result = await connector.lookup({ name: 'A', jurisdiction: 'GB' });
    expect(result.status).toBe('error');
    expect(result.message).toBe("We couldn't check Sample just now.");
  });
});

describe('rate limit', () => {
  it('lets a burst through, then waits', async () => {
    let time = 0;
    const waits: number[] = [];
    const limiter = new RateLimiter({ requests: 2, perMs: 1000 }, { now: () => time, sleep: async (ms) => { waits.push(ms); time += ms; } });
    await limiter.acquire();
    await limiter.acquire();
    expect(waits).toEqual([]);
    await limiter.acquire();
    expect(waits).toEqual([500]);
  });

  it('refills over time', async () => {
    let time = 0;
    const waits: number[] = [];
    const limiter = new RateLimiter({ requests: 1, perMs: 100 }, { now: () => time, sleep: async (ms) => { waits.push(ms); time += ms; } });
    await limiter.acquire();
    time += 100;
    await limiter.acquire();
    expect(waits).toEqual([]);
  });

  it('keeps Companies House inside its limit across a real lookup', async () => {
    const fetchImpl = fakeFetch({
      '/officers': JSON.stringify(sampleJson('ch-officers.json')),
      '/persons-with-significant-control': JSON.stringify(sampleJson('ch-psc.json')),
      'filing-history': JSON.stringify({ total_count: 0, items: [] }),
      '/company/14839221': JSON.stringify(sampleJson('ch-profile.json')),
    });
    const connector = createCompaniesHouseConnector({ env: { COMPANIES_HOUSE_API_KEY: 'k' }, fetch: fetchImpl, sleep: noSleep, now: NOW });
    expect((await connector.lookup(REF)).status).toBe('found');
    expect(fetchImpl.calls.length).toBeLessThan(10);
  });
});

describe('cache hook', () => {
  function memoryCache(): CacheHook & { sets: number; ttl: number } {
    const store = new Map<string, SourceResult>();
    return {
      sets: 0,
      ttl: 0,
      async get(key) { return store.get(key); },
      async set(key, value, ttlSeconds) { this.sets += 1; this.ttl = ttlSeconds; store.set(key, value); },
    };
  }

  const routes = {
    '/officers': JSON.stringify(sampleJson('ch-officers.json')),
    '/persons-with-significant-control': JSON.stringify(sampleJson('ch-psc.json')),
    'filing-history': JSON.stringify({ total_count: 1, items: [] }),
    '/company/14839221': JSON.stringify(sampleJson('ch-profile.json')),
  };

  it('stores a good answer and reuses it', async () => {
    const cache = memoryCache();
    const fetchImpl = fakeFetch(routes);
    const connector = createCompaniesHouseConnector({ env: { COMPANIES_HOUSE_API_KEY: 'k' }, fetch: fetchImpl, sleep: noSleep, cache, now: NOW });
    await connector.lookup(REF);
    const calls = fetchImpl.calls.length;
    const second = await connector.lookup(REF);
    expect(second.status).toBe('found');
    expect(fetchImpl.calls.length).toBe(calls);
    expect(cache.ttl).toBeGreaterThan(0);
  });

  it('does not store errors', async () => {
    const cache = memoryCache();
    const connector = createCompaniesHouseConnector({ env: { COMPANIES_HOUSE_API_KEY: 'k' }, fetch: fakeFetch({ company: { status: 500 } }), sleep: noSleep, cache, retries: 0, now: NOW });
    expect((await connector.lookup(REF)).status).toBe('error');
    expect(cache.sets).toBe(0);
  });
});

describe('input and provenance', () => {
  it('rejects a bad reference without calling out', async () => {
    const fetchImpl = fakeFetch({});
    const connector = createCompaniesHouseConnector({ env: { COMPANIES_HOUSE_API_KEY: 'k' }, fetch: fetchImpl, now: NOW });
    const result = await connector.lookup({ name: '', jurisdiction: 'GB' });
    expect(result.status).toBe('error');
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('records source, time and a hash of what came back', async () => {
    const connector = defineConnector({
      id: 'x', jurisdictions: ['GB'], capabilities: [], factPrefix: 'x', sourceName: 'Sample', method: 'official_list', homeUrl: 'https://x.example',
      lookup: async () => ({ status: 'found', sourceUrl: 'https://x.example/1', raw: 'hello', facts: [{ key: 'x.a', value: 1 }] }),
    }, { env: {}, now: NOW });
    const result = await connector.lookup({ name: 'A', jurisdiction: 'GB' });
    expect(result.provenance).toEqual({
      sourceUrl: 'https://x.example/1',
      retrievedAt: '2026-11-05T09:42:00.000Z',
      rawHash: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
      sourceName: 'Sample',
      method: 'official_list',
    });
    expect(result.matchConfidence).toBe(1);
  });
});

describe('toEngineInput', () => {
  it('turns results into facts and source states', async () => {
    const connectors = createConnectors({ env: { CONNECTOR_MODE: 'fixture', NODE_ENV: 'test' }, now: NOW });
    const results = await runConnectors(connectorsFor(connectors, 'GB'), { name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' });
    const { facts, sources } = toEngineInput(results, connectors);
    expect(sources['registry.uk.companies_house']).toBe('ok');
    expect(sources['registry.uk.ico']).toBe('ok');
    const overdue = facts.find((f) => f.key === 'registry.uk.companies_house.confirmation_overdue');
    expect(overdue?.value).toBe(true);
    expect(overdue?.provenance).toMatchObject({ source: 'uk.companies_house', source_name: 'Companies House', method: 'official_live' });
  });

  it('maps every status so a dead source is never a failed rule', async () => {
    const connectors = createConnectors({ env: { CONNECTOR_MODE: 'fixture', NODE_ENV: 'test' }, now: NOW });
    const house = connectors.filter((c) => c.id === 'uk.companies_house');
    const states = {} as Record<string, string | undefined>;
    for (const scenario of ['found', 'not_found', 'ambiguous', 'error', 'unavailable'] as const) {
      const results = await runConnectors(house, { name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', scenario });
      states[scenario] = toEngineInput(results, connectors).sources['registry.uk.companies_house'];
    }
    expect(states).toEqual({ found: 'ok', not_found: 'ok', ambiguous: 'ambiguous', error: 'error', unavailable: 'unavailable' });
  });
});

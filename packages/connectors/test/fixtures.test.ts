import { afterEach, describe, expect, it, vi } from 'vitest';
import { assertFixtureModeAllowed, CONNECTOR_FACT_KEYS, connectorsFor, createConnectors, createFixtureConnectors, FixtureModeRefusedError } from '../src/index.js';
import { factMap, NOW } from './helpers.js';

const env = { CONNECTOR_MODE: 'fixture', NODE_ENV: 'test' };
const all = () => createConnectors({ env, now: NOW });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('production guard', () => {
  it('refuses fixture mode when NODE_ENV=production', () => {
    expect(() => createConnectors({ env: { CONNECTOR_MODE: 'fixture', NODE_ENV: 'production' } })).toThrow(FixtureModeRefusedError);
    expect(() => createFixtureConnectors({ NODE_ENV: 'production' })).toThrow(FixtureModeRefusedError);
    expect(() => assertFixtureModeAllowed({ NODE_ENV: 'production' })).toThrow('must never reach a real customer');
  });

  it('allows it in development and test', () => {
    expect(() => assertFixtureModeAllowed({ NODE_ENV: 'development' })).not.toThrow();
    expect(() => assertFixtureModeAllowed({ NODE_ENV: 'test' })).not.toThrow();
    expect(() => assertFixtureModeAllowed({})).not.toThrow();
  });

  it('checks again on each call, in case the process went to production afterwards', async () => {
    const connectors = createFixtureConnectors({}, NOW);
    vi.stubEnv('NODE_ENV', 'production');
    await expect(connectors[0]?.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' })).rejects.toThrow(FixtureModeRefusedError);
  });

  it('live mode in production has no sample data and needs no guard', async () => {
    const connectors = createConnectors({ env: { NODE_ENV: 'production' }, now: NOW });
    const results = await Promise.all(connectors.map((c) => c.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' })));
    for (const result of results) {
      expect(result.status).toBe('unavailable');
      expect(result.provenance.fixture).toBeUndefined();
      expect(result.provenance.sourceUrl).not.toContain('fixture');
    }
  });

  it('is off unless asked for', () => {
    const connectors = createConnectors({ env: { NODE_ENV: 'development' } });
    // Live connectors, not fixtures: none is labelled as sample data. (The count grows with each new source.)
    expect(connectors.length).toBeGreaterThanOrEqual(15);
    for (const connector of connectors) expect(connector.id).not.toMatch(/fixture/);
  });
});

describe('fixture data', () => {
  it('has the same connectors as live', () => {
    expect(all().map((c) => c.id).sort()).toEqual(createConnectors({ env: {} }).map((c) => c.id).sort());
  });

  it('is clearly labelled on every result', async () => {
    for (const connector of all()) {
      const result = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' });
      expect(result.provenance.fixture, connector.id).toBe(true);
      expect(result.provenance.sourceUrl).toMatch(/^fixture:\/\//);
      expect(result.message).toContain('Not a real record');
    }
  });

  it.each(['found', 'not_found', 'ambiguous', 'error', 'unavailable'] as const)('every connector can return %s', async (scenario) => {
    for (const connector of all()) {
      const result = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', scenario });
      expect(result.status, connector.id).toBe(scenario);
      if (scenario === 'error' || scenario === 'unavailable' || scenario === 'ambiguous') expect(result.facts).toEqual([]);
      if (scenario === 'ambiguous') expect(result.candidates?.length).toBeGreaterThan(0);
    }
  });

  it.each([['Kestrel Pay Ghost Ltd', 'not_found'], ['Kestrel Pay Twin Ltd', 'ambiguous'], ['Kestrel Pay Broken Ltd', 'error'], ['Kestrel Pay Offline Ltd', 'unavailable']] as const)('%s gives %s', async (name, status) => {
    const house = all().find((c) => c.id === 'uk.companies_house');
    expect((await house?.lookup({ name, jurisdiction: 'GB' }))?.status).toBe(status);
  });

  it('only publishes known facts', async () => {
    const published = new Set<string>(CONNECTOR_FACT_KEYS);
    for (const connector of all()) {
      for (const scenario of ['found', 'not_found'] as const) {
        const result = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', scenario });
        for (const fact of result.facts) expect(published.has(fact.key), fact.key).toBe(true);
      }
    }
  });
});

describe('matches the design screens', () => {
  it('Kestrel Pay UK Ltd', async () => {
    const connectors = connectorsFor(all(), 'GB');
    const by = (id: string) => connectors.find((c) => c.id === id);
    const ref = { name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' } as const;
    const house = factMap((await by('uk.companies_house')?.lookup(ref))!);
    expect(house['registry.uk.companies_house.company_number']).toBe('14839221');
    expect(house['registry.uk.companies_house.confirmation_overdue']).toBe(true);
    expect(house['registry.uk.companies_house.accounts_next_due']).toBe('2027-06-30');
    expect(house['registry.uk.companies_house.directors_active_count']).toBe(2);
    expect(house['registry.uk.companies_house.directors_idv_on_record_count']).toBe(1);
    expect(house['registry.uk.companies_house.directors_idv_next_due']).toBe('2026-11-18');
    expect((await by('uk.ico_register')?.lookup(ref))?.status).toBe('not_found');
    expect((await by('uk.hmrc_vat')?.lookup(ref))?.status).toBe('found');
    expect((await by('sanctions.lists')?.lookup(ref))?.status).toBe('not_found');
  });

  it('Kestrel Pay Inc.', async () => {
    const connectors = connectorsFor(all(), 'US-DE');
    const ref = { name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' } as const;
    const vendor = await connectors.find((c) => c.id === 'us.delaware_vendor')?.lookup(ref);
    expect(factMap(vendor!)).toMatchObject({ 'registry.us.delaware_vendor.file_number': '7741209', 'registry.us.delaware_vendor.registered_agent': 'Northwood Agents LLC' });
    const tm = await connectors.find((c) => c.id === 'us.uspto')?.lookup(ref);
    expect(factMap(tm!)['registry.us.uspto.trademark_marks']).toEqual(['KESTREL PAY']);
  });

  it('Kestrel Pay Nigeria Ltd', async () => {
    const connectors = connectorsFor(all(), 'NG');
    const ref = { name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG' } as const;
    const cac = await connectors.find((c) => c.id === 'ng.cac_vendor')?.lookup(ref);
    expect(factMap(cac!)).toMatchObject({ 'registry.ng.cac.rc_number': '1849302', 'registry.ng.cac.status': 'active', 'registry.ng.cac.directors_count': 2 });
    expect((await connectors.find((c) => c.id === 'ng.ndpc_list')?.lookup(ref))?.status).toBe('not_found');
  });

  it('keeps names and roles only', async () => {
    for (const connector of all()) {
      const text = JSON.stringify(await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', scenario: 'found' }));
      expect(text).not.toMatch(/date_of_birth|home|passport/i);
    }
  });
});

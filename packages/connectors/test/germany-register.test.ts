import { describe, expect, it } from 'vitest';
import {
  CONNECTOR_FACT_KEYS, connectorsFor, createConnectors, createFixtureConnectors, createOpenRegisterConnector, DE_NOT_IN_REGISTER, missingSettings, SOURCE_FACTORIES,
  type CompanyRef,
} from '../src/index.js';
import { factMap, fakeFetch, noSleep, sample } from './helpers.js';

/**
 * de.openregister: the Handelsregister through OpenRegister, a paid licensed provider. Every
 * reply here is a hand-made fictional sample built from the public docs (docs.openregister.de,
 * read 18 Nov 2026): no real API is called, because none can be without a key. Kestrel Pay, the
 * court code X9999 and the people are made up.
 */
const NOW = () => new Date('2026-11-18T09:00:00Z');
const PEOPLE = ['Ondine', 'Fictivus', 'Ignatius', 'Exempel', 'Camille', 'Ancien', 'Beispielweg', '1990-01-01', '1985-05-05'];
const ENV = { OPENREGISTER_API_KEY: 'or-key' };
const SEARCH = '/v1/autocomplete/company';
const COMPANY = '/v1/company/DE-HRB-X9999-999999';

function build(routes: Parameters<typeof fakeFetch>[0], env: Record<string, string> = ENV) {
  const fetchImpl = fakeFetch(routes);
  return { connector: createOpenRegisterConnector({ env, fetch: fetchImpl, now: NOW, sleep: noSleep, retries: 1 }), fetchImpl };
}
const ref = (extra: Partial<CompanyRef> = {}): CompanyRef => ({ name: 'Kestrel Pay GmbH', jurisdiction: 'DE', ...extra });
const noPeople = (value: unknown) => {
  const text = JSON.stringify(value);
  for (const word of PEOPLE) expect(text, word).not.toContain(word);
};

describe('de.openregister', () => {
  it('finds a GmbH by name, reads its record, and keeps only counts of current managing directors', async () => {
    const { connector, fetchImpl } = build({ [SEARCH]: sample('de-openregister-search.json'), [COMPANY]: sample('de-openregister-company.json') });
    const result = await connector.lookup(ref());
    expect(result.status).toBe('found');
    expect(factMap(result)).toMatchObject({
      'registry.de.openregister.identified': true,
      'registry.de.openregister.company_id': 'DE-HRB-X9999-999999',
      'registry.de.openregister.status': 'active',
      'registry.de.openregister.legal_form': 'gmbh',
      'registry.de.openregister.register_type': 'HRB',
      'registry.de.openregister.register_number': '999999',
      'registry.de.openregister.capital_amount': 25000,
      'registry.de.openregister.capital_currency': 'EUR',
      'registry.de.openregister.incorporated_on': '2024-03-01',
      'registry.de.openregister.insolvency_open': false,
      // One current director: the other left in 2025, and a Prokurist is not a managing director.
      'registry.de.openregister.directors_count': 1,
      'registry.de.openregister.directors_entity_count': 0,
    });
    for (const fact of result.facts) expect(CONNECTOR_FACT_KEYS, fact.key).toContain(fact.key);
    noPeople(result.facts);
    expect(fetchImpl.calls[0]?.url).toContain('query=Kestrel%20Pay%20GmbH');
    expect(new Headers(fetchImpl.calls[0]?.init?.headers).get('authorization')).toBe('Bearer or-key');
    // Never the dearer live read.
    for (const call of fetchImpl.calls) expect(call.url).not.toContain('realtime');
  });

  it('reads liquidation and an open insolvency as they stand, with a company as liquidator counted, not named', async () => {
    const { connector } = build({ '/v1/company/DE-HRB-X9999-999998': sample('de-openregister-liquidation.json') });
    const result = await connector.lookup(ref({ name: 'Kestrel Logistik UG', registry_number: 'de-hrb-x9999-999998' }));
    expect(factMap(result)).toMatchObject({
      'registry.de.openregister.status': 'liquidation', 'registry.de.openregister.legal_form': 'ug', 'registry.de.openregister.insolvency_open': true, 'registry.de.openregister.directors_count': 0,
    });
    expect(JSON.stringify(result.facts)).not.toContain('Heron Holding');
  });

  it('takes a register number only when one search result carries it', async () => {
    const { connector } = build({ [SEARCH]: sample('de-openregister-search.json'), [COMPANY]: sample('de-openregister-company.json') });
    expect((await connector.lookup(ref({ registry_number: 'HRB 999999' }))).status).toBe('found');
    const other = await build({ [SEARCH]: sample('de-openregister-search.json') }).connector.lookup(ref({ registry_number: 'HRB 123' }));
    expect(other.status).toBe('not_found');
    expect(factMap(other)['registry.de.openregister.identified']).toBeNull();
    expect(other.message).toBe(DE_NOT_IN_REGISTER.number);
  });

  it('never keeps or offers a sole trader (e.K.)', async () => {
    const { connector } = build({ [SEARCH]: sample('de-openregister-search.json') });
    const result = await connector.lookup(ref({ name: 'Ondine Fictivus e.K.' }));
    expect(result.status).not.toBe('found');
    // Only the name typed in is echoed in the query URL; nothing from the record is kept or offered.
    noPeople([result.facts, (result as { candidates?: unknown }).candidates ?? []]);
    const direct = await build({ '/v1/company/DE-HRA-X9999-99997': JSON.stringify({ id: 'DE-HRA-X9999-99997', legal_form: 'ek', name: { name: 'Ondine Fictivus e.K.' } }) })
      .connector.lookup(ref({ registry_number: 'DE-HRA-X9999-99997' }));
    expect(direct.status).toBe('not_found');
    expect(direct.message).toBe(DE_NOT_IN_REGISTER.person);
    expect(direct.facts).toEqual([{ key: 'registry.de.openregister.identified', value: null }]);
  });

  it('a miss is "not found in this register", never "does not exist"', async () => {
    const { connector } = build({ [SEARCH]: JSON.stringify({ results: [] }) });
    const result = await connector.lookup(ref({ name: 'Nobody Here GmbH' }));
    expect(result.status).toBe('not_found');
    expect(factMap(result)['registry.de.openregister.identified']).toBeNull();
    expect(result.message).toContain("doesn't mean the company doesn't exist");
  });

  it('a refused key or an empty plan is a setup problem on our side', async () => {
    expect((await build({ [SEARCH]: { status: 401, body: '{"message":"API key is invalid"}' } }).connector.lookup(ref())).status).toBe('unavailable');
    const broke = await build({ [SEARCH]: { status: 402 } }).connector.lookup(ref());
    expect(broke.status).toBe('unavailable');
    expect(broke.message).toContain('not a problem with your company');
  });

  it('refuses a malformed number without asking anyone', async () => {
    const { connector, fetchImpl } = build({});
    const result = await connector.lookup(ref({ registry_number: '12-AB-??' }));
    expect(result.status).toBe('unsupported');
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('is registered, off by default, recordable, has a fixture, and counts as the German register only once its key is set', async () => {
    const off = createConnectors({ env: {} });
    const connector = off.find((c) => c.id === 'de.openregister');
    expect(connector?.configured).toBe(false);
    expect((await connector?.lookup(ref()))?.status).toBe('unavailable');
    expect(SOURCE_FACTORIES['de.openregister']).toBeDefined();
    expect(missingSettings('de.openregister', {})).toEqual(['OPENREGISTER_API_KEY']);
    expect(createFixtureConnectors({}, NOW).map((c) => c.id)).toContain('de.openregister');
    expect(connectorsFor(createConnectors({ env: ENV }), 'DE').map((c) => c.id)).toContain('de.openregister');
    expect(connectorsFor(off, 'KE').map((c) => c.id)).not.toContain('de.openregister');
  });
});

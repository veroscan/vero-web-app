import { describe, expect, it } from 'vitest';
import {
  connectorsFor, createConnectors, createFixtureConnectors, createGleifConnector, createOpenCorporatesConnector, createViesVatConnector, GLEIF_MISS,
  isValidLei, KESTREL_LEI, normaliseCompanyName, normaliseEuVat, OPENCORPORATES_WORDS, redactBody, redactUrl, sameCompanyName, VIES_WORDS, viesCountryCode,
} from '../src/index.js';
import { factMap, fakeFetch, sample } from './helpers.js';

/**
 * The global sources: GLEIF, EU VIES and OpenCorporates. Every response here is a hand-made
 * fictional sample: Kestrel Pay and the people in the samples are made up. The LEIs used pass the
 * LEI check and GLEIF had no record of any of them on 16 Nov 2026. No real API is called.
 */

const NOW = new Date('2026-11-05T09:42:00Z');
const UA = { PUBLIC_API_USER_AGENT: 'VeroScan-test' };
const KEY = { OPENCORPORATES_API_TOKEN: 'oc-test-token' };
const PEOPLE = ['JANE FICTIVE', 'Imaginary Close', 'Nowhere Town', 'ZZ1 9ZZ', 'AMARA FICTIVE', 'TUNDE INVENTED', 'OLD SECRETARY', '1985', 'Invented Road', 'Engineer', 'JEAN FICTIF', 'INVENTEE', 'MARSEILLE'];
const GLEIF = 'https://api.gleif.org/api/v1';

type Routes = Parameters<typeof fakeFetch>[0];

function build<T>(factory: (deps: Parameters<typeof createGleifConnector>[0]) => T, routes: Routes, env: Record<string, string>) {
  const fetchImpl = fakeFetch(routes);
  const sleeps: number[] = [];
  const connector = factory({ env, fetch: fetchImpl, now: () => NOW, sleep: async (ms) => { sleeps.push(ms); }, retries: 1 });
  return { connector, fetchImpl, sleeps };
}

function noPeople(value: unknown) {
  const stored = JSON.stringify(value);
  for (const word of PEOPLE) expect(stored, word).not.toContain(word);
}

describe('LEI check (ISO 7064 MOD 97-10)', () => {
  it('accepts real-shaped LEIs and refuses mistyped ones', () => {
    expect(isValidLei(KESTREL_LEI)).toBe(true);
    expect(isValidLei('W38RGI023J3WT1HWRP32')).toBe(true);
    expect(isValidLei('w38r gi02 3j3w t1hw rp32')).toBe(true);
    expect(isValidLei('W38RGI023J3WT1HWRP33')).toBe(false);
    expect(isValidLei('W38RGI023J3WT1HWRP3')).toBe(false);
    expect(isValidLei('')).toBe(false);
  });
});

describe('company names around the world', () => {
  it('compares names give or take their legal form', () => {
    expect(normaliseCompanyName('Siemens Aktiengesellschaft')).toBe('siemens');
    expect(sameCompanyName('Siemens AG', 'SIEMENS AKTIENGESELLSCHAFT')).toBe(true);
    expect(sameCompanyName('SE TOTALENERGIES SE', 'TotalEnergies SE')).toBe(true);
    expect(sameCompanyName('Kestrel Pay UK Ltd', 'KESTREL PAY UK LIMITED')).toBe(true);
    expect(sameCompanyName('Siemens AG', 'Siemens Energy AG')).toBe(false);
  });
});

describe('global.gleif', () => {
  const gleif = (routes: Routes, env: Record<string, string> = UA) => build(createGleifConnector, routes, env);

  it('is off until we name ourselves, and is asked for every country', async () => {
    const { connector, fetchImpl } = gleif({}, {});
    expect(connector.jurisdictions).toEqual(['*']);
    expect((await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: KESTREL_LEI })).status).toBe('unavailable');
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('looks up an LEI, keeps no address, and reads the direct parent as an LEI only', async () => {
    const { connector, fetchImpl } = gleif({
      [`/lei-records/${KESTREL_LEI}`]: sample('gleif-record.json'),
      '/direct-parent-relationship': sample('gleif-parent.json'),
    });
    const result = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: KESTREL_LEI.toLowerCase() });
    expect(result.status).toBe('found');
    expect(result.provenance.method).toBe('official_live');
    expect(fetchImpl.calls.map((call) => call.url)).toEqual([`${GLEIF}/lei-records/${KESTREL_LEI}`, `${GLEIF}/lei-records/${KESTREL_LEI}/direct-parent-relationship`]);
    expect((fetchImpl.calls[0]?.init?.headers as Record<string, string>)['User-Agent']).toBe('VeroScan-test');
    expect(factMap(result)).toEqual({
      'registry.global.gleif.identified': true,
      'registry.global.gleif.lei': KESTREL_LEI,
      'registry.global.gleif.legal_name': 'KESTREL PAY UK LTD',
      'registry.global.gleif.name_matches': true,
      'registry.global.gleif.country_matches': true,
      'registry.global.gleif.registration_status': 'LAPSED',
      'registry.global.gleif.lei_lapsed': true,
      'registry.global.gleif.entity_status': 'ACTIVE',
      'registry.global.gleif.entity_category': 'GENERAL',
      'registry.global.gleif.legal_form_code': 'H0PO',
      'registry.global.gleif.legal_jurisdiction': 'GB',
      'registry.global.gleif.legal_address_country': 'GB',
      'registry.global.gleif.registration_authority_id': 'RA000585',
      'registry.global.gleif.registered_as': '14839221',
      'registry.global.gleif.next_renewal_on': '2026-04-12',
      'registry.global.gleif.direct_parent_reported': true,
      'registry.global.gleif.direct_parent_lei': '00000KESTRELPAYSA064',
      'registry.global.gleif.ultimate_parent_reported': false,
    });
    expect(JSON.stringify(result)).not.toContain('Fictional Yard');
    expect(JSON.stringify(result)).not.toContain('EC1A');
  });

  it('a parent that cannot be read never spoils the answer', async () => {
    const { connector } = gleif({ [`/lei-records/${KESTREL_LEI}`]: sample('gleif-record.json'), '/direct-parent-relationship': { status: 404, body: '{"errors":[{"status":"404"}]}' } });
    const result = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: KESTREL_LEI });
    expect(result.status).toBe('found');
    expect(factMap(result)['registry.global.gleif.direct_parent_reported']).toBe(true);
    expect(factMap(result)['registry.global.gleif.direct_parent_lei']).toBeUndefined();
  });

  it('refuses an LEI that fails the check without asking anyone', async () => {
    const { connector, fetchImpl } = gleif({});
    const result = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: '00000KESTRELPAYUK068' });
    expect(result.status).toBe('unsupported');
    expect(result.message).toContain('LEI check');
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('an unknown LEI is a 404 HTML page (as GLEIF really sends it): not found, claims nothing', async () => {
    const { connector } = gleif({ '/lei-records/': { status: 404, body: '<!DOCTYPE html><title>Not Found</title>' } });
    const result = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: KESTREL_LEI });
    expect(result.status).toBe('not_found');
    expect(result.message).toBe(GLEIF_MISS.lei);
    expect(factMap(result)).toEqual({ 'registry.global.gleif.identified': null });
  });

  it('finds an exact name in that country, never offering a sole trader, and reads the parent', async () => {
    const { connector, fetchImpl } = gleif({ '/lei-records?filter': sample('gleif-search.json'), '/direct-parent-relationship': sample('gleif-parent.json') });
    const result = await connector.lookup({ name: 'Kestrel Pay UK Limited', jurisdiction: 'GB' });
    expect(result.status).toBe('found');
    expect(result.matchConfidence).toBe(0.9);
    expect(fetchImpl.calls[0]?.url).toContain('filter%5Bentity.legalAddress.country%5D=GB');
    expect(fetchImpl.calls[0]?.url).toContain('filter%5Bentity.legalName%5D=Kestrel%20Pay%20UK%20Limited');
    expect(factMap(result)['registry.global.gleif.lei']).toBe(KESTREL_LEI);
    noPeople(result);
  });

  it('a sole trader found by its LEI is not kept', async () => {
    const person = JSON.stringify({ data: (JSON.parse(sample('gleif-search.json')) as { data: unknown[] }).data[0] });
    const { connector } = gleif({ '/lei-records/0000FICTIVEJANE00015': person });
    const result = await connector.lookup({ name: 'Kestrel Pay UK', jurisdiction: 'GB', lei: '0000FICTIVEJANE00015' });
    expect(result.status).toBe('not_found');
    expect(result.message).toBe(GLEIF_MISS.person);
    expect(factMap(result)).toEqual({ 'registry.global.gleif.identified': null });
    noPeople(result);
  });

  it('two entities with the same name are ambiguous, with their LEIs as candidates', async () => {
    const twins = JSON.parse(sample('gleif-search.json')) as { data: Record<string, unknown>[] };
    const copy = JSON.parse(JSON.stringify(twins.data[1])) as { id: string; attributes: { lei: string } };
    copy.id = '00000KESTRELTWIN0098';
    copy.attributes.lei = '00000KESTRELTWIN0098';
    const { connector } = gleif({ '/lei-records?filter': JSON.stringify({ data: [twins.data[1], copy] }) });
    const result = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' });
    expect(result.status).toBe('ambiguous');
    expect(result.candidates?.map((c) => c.identifier).sort()).toEqual(['00000KESTRELPAYUK069', '00000KESTRELTWIN0098']);
    expect(result.facts).toEqual([]);
  });

  it('tries the long legal form when the short one finds nothing exact', async () => {
    const { connector, fetchImpl } = gleif({ '/lei-records?filter': [JSON.stringify({ data: [] }), JSON.stringify({ data: [] })] });
    const result = await connector.lookup({ name: 'Heron Fictiv AG', jurisdiction: 'DE' });
    expect(fetchImpl.calls).toHaveLength(2);
    expect(fetchImpl.calls[1]?.url).toContain('Heron%20Fictiv%20aktiengesellschaft');
    expect(result.status).toBe('not_found');
    expect(result.message).toBe(GLEIF_MISS.name);
    expect(result.message).toContain("That's normal for many companies");
    expect(factMap(result)).toEqual({ 'registry.global.gleif.identified': null });
  });

  it('down is an error in plain words, never a miss; a 429 waits as long as Retry-After says', async () => {
    const down = await gleif({ '/lei-records/': { status: 503 } }).connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: KESTREL_LEI });
    expect(down.status).toBe('error');
    expect(down.message).toBe('GLEIF had a problem on its side.');
    expect(down.facts).toEqual([]);

    const { connector, sleeps } = gleif({ [`/lei-records/${KESTREL_LEI}`]: [{ status: 429, headers: { 'retry-after': '3' } }, sample('gleif-record.json')], '/direct-parent-relationship': sample('gleif-parent.json') });
    expect((await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: KESTREL_LEI })).status).toBe('found');
    expect(sleeps).toContain(3000);
  });

  it('stays under 60 requests a minute', async () => {
    let clock = NOW.getTime();
    const fetchImpl = fakeFetch({ '/lei-records/': { status: 404, body: '<html></html>' } });
    const connector = createGleifConnector({ env: UA, fetch: fetchImpl, now: () => new Date(clock), sleep: async (ms) => { clock += ms; }, retries: 0 });
    for (let i = 0; i < 60; i += 1) await connector.lookup({ name: `Kestrel ${i}`, jurisdiction: 'GB', lei: KESTREL_LEI });
    expect(fetchImpl.calls).toHaveLength(60);
    // 50 at once, then 10 more at 50 a minute: at least 12 seconds.
    expect(clock - NOW.getTime()).toBeGreaterThanOrEqual(11_000);
  });
});

describe('eu.vies_vat', () => {
  const VIES = 'https://ec.europa.eu/taxation_customs/vies/rest-api';
  const other = JSON.parse(sample('vies-other.json')) as Record<string, unknown>;
  const reply = (key: string) => JSON.stringify(other[key]);
  const vies = (routes: Routes, env: Record<string, string> = UA) => build(createViesVatConnector, routes, env);

  it('covers the 27 member states and Northern Ireland, not Great Britain', () => {
    const { connector } = vies({});
    expect(connector.jurisdictions).toHaveLength(28);
    expect(connector.jurisdictions).toContain('GB-NIR');
    expect(connector.jurisdictions).not.toContain('GB');
    expect(viesCountryCode('GR')).toBe('EL');
    expect(viesCountryCode('GB-NIR')).toBe('XI');
    expect(viesCountryCode('NO')).toBeNull();
  });

  it('reads a VAT number with or without its country letters', () => {
    expect(normaliseEuVat('FR 40 123 456 808', 'FR')).toEqual({ country: 'FR', number: '40123456808' });
    expect(normaliseEuVat('40123456808', 'FR')).toEqual({ country: 'FR', number: '40123456808' });
    expect(normaliseEuVat('GR094000000', 'GR')).toEqual({ country: 'EL', number: '094000000' });
    expect(normaliseEuVat('094000000', 'GR')).toEqual({ country: 'EL', number: '094000000' });
    expect(normaliseEuVat('DE000000000', 'FR')).toEqual({ country: 'DE', number: '000000000' });
    expect(normaliseEuVat('1', 'FR')).toBeNull();
  });

  it('needs a VAT number, and says so plainly without asking anyone', async () => {
    const { connector, fetchImpl } = vies({});
    const none = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR' });
    expect(none.status).toBe('unsupported');
    expect(none.message).toBe(VIES_WORDS.needNumber);
    const bad = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', vat_number: 'FR!' });
    expect(bad.status).toBe('unsupported');
    expect(bad.message).toBe(VIES_WORDS.badNumber);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('is off until we name ourselves', async () => {
    expect((await vies({}, {}).connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', vat_number: 'FR40123456808' })).status).toBe('unavailable');
  });

  it('a valid number: keeps validity and date, never the name or address', async () => {
    const { connector, fetchImpl } = vies({ '/check-vat-number': sample('vies-valid.json') });
    const result = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', vat_number: 'FR 40123456808' });
    expect(result.status).toBe('found');
    expect(fetchImpl.calls[0]?.url).toBe(`${VIES}/check-vat-number`);
    expect(fetchImpl.calls[0]?.init?.method).toBe('POST');
    expect(JSON.parse(fetchImpl.calls[0]?.init?.body as string)).toEqual({ countryCode: 'FR', vatNumber: '40123456808' });
    expect(factMap(result)).toEqual({ 'registry.eu.vies_vat.valid': true, 'registry.eu.vies_vat.request_date': '2026-11-05', 'registry.eu.vies_vat.name_matches': true });
    const stored = JSON.stringify(result);
    for (const word of ['SAS KESTREL PAY', 'IMAGINAIRE', '75002', 'PARIS']) expect(stored).not.toContain(word);
  });

  it("a sole trader's name (no legal form) is never compared or kept", async () => {
    const { connector } = vies({ '/check-vat-number': reply('soleTrader') });
    const result = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', vat_number: 'FR40123456808' });
    expect(result.status).toBe('found');
    expect(factMap(result)).toEqual({ 'registry.eu.vies_vat.valid': true, 'registry.eu.vies_vat.request_date': '2026-11-05' });
    noPeople(result);
  });

  it('"not valid" only after VIES confirms that country is answering', async () => {
    const { connector, fetchImpl } = vies({ '/check-vat-number': reply('invalid'), '/check-status': reply('status') });
    const result = await connector.lookup({ name: 'Kestrel Pay GmbH', jurisdiction: 'DE', vat_number: 'DE000000000' });
    expect(result.status).toBe('not_found');
    expect(result.message).toBe(VIES_WORDS.notValid);
    expect(factMap(result)).toEqual({ 'registry.eu.vies_vat.valid': false, 'registry.eu.vies_vat.request_date': '2026-11-05' });
    expect(fetchImpl.calls.map((call) => call.url)).toEqual([`${VIES}/check-vat-number`, `${VIES}/check-status`]);
  });

  it('a "not valid" from a country VIES lists as unavailable is an error, never "invalid"', async () => {
    const cyprus = JSON.stringify({ ...(other['invalid'] as object), countryCode: 'CY', vatNumber: '00000000X' });
    const { connector } = vies({ '/check-vat-number': cyprus, '/check-status': reply('status') });
    const result = await connector.lookup({ name: 'Kestrel Pay Ltd', jurisdiction: 'CY', vat_number: 'CY00000000X' });
    expect(result.status).toBe('error');
    expect(result.message).toBe(VIES_WORDS.down('Cyprus'));
    expect(result.facts).toEqual([]);
  });

  it('member state down (MS_UNAVAILABLE, sent with HTTP 200) is an error, never "invalid"', async () => {
    const { connector } = vies({ '/check-vat-number': reply('msUnavailable') });
    const result = await connector.lookup({ name: 'Kestrel Pay GmbH', jurisdiction: 'DE', vat_number: 'DE000000000' });
    expect(result.status).toBe('error');
    expect(result.message).toContain('Germany');
    expect(result.message).toContain('says nothing about your VAT number');
    expect(result.facts).toEqual([]);
  });

  it('INVALID_INPUT asks the company to check the number', async () => {
    const { connector } = vies({ '/check-vat-number': reply('invalidInput') });
    const result = await connector.lookup({ name: 'Kestrel Pay GmbH', jurisdiction: 'DE', vat_number: 'DE000000000' });
    expect(result.status).toBe('unsupported');
    expect(result.message).toBe(VIES_WORDS.invalidInput);
  });

  it('VIES itself down, or slow to answer: an error after the retry', async () => {
    const { connector, fetchImpl, sleeps } = vies({ '/check-vat-number': { status: 503, headers: { 'retry-after': '2' } } });
    const result = await connector.lookup({ name: 'Kestrel Pay GmbH', jurisdiction: 'DE', vat_number: 'DE000000000' });
    expect(result.status).toBe('error');
    expect(result.message).toBe('VIES had a problem on its side.');
    expect(fetchImpl.calls).toHaveLength(2);
    expect(sleeps).toContain(2000);
  });
});

describe('global.opencorporates', () => {
  const OC = 'https://api.opencorporates.com/v0.4';
  const oc = (routes: Routes, env: Record<string, string> = KEY) => build(createOpenCorporatesConnector, routes, env);

  it('is off without its key', async () => {
    const { connector, fetchImpl } = oc({}, {});
    expect((await connector.lookup({ name: 'Kestrel Pay AS', jurisdiction: 'KE' })).status).toBe('unavailable');
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('skips a country with its own register source, and a US company without its state', async () => {
    const { connector, fetchImpl } = oc({});
    const uk = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' });
    expect(uk.status).toBe('unavailable');
    expect(uk.message).toBe(OPENCORPORATES_WORDS.official);
    const us = await connector.lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US' });
    expect(us.status).toBe('unsupported');
    expect(us.message).toBe(OPENCORPORATES_WORDS.needState);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('looks up a company number: officers become a count and role titles, and the key never reaches a result', async () => {
    const { connector, fetchImpl } = oc({ '/companies/ke/KP-000000': sample('opencorporates-company.json') });
    const result = await connector.lookup({ name: 'Kestrel Pay AS', jurisdiction: 'KE', registry_number: 'KP-000000' });
    expect(result.status).toBe('found');
    expect(result.provenance.method).toBe('licensed_vendor');
    expect(fetchImpl.calls[0]?.url).toBe(`${OC}/companies/ke/KP-000000?api_token=oc-test-token`);
    expect(factMap(result)).toEqual({
      'registry.global.opencorporates.identified': true,
      'registry.global.opencorporates.company_number': 'KP-000000',
      'registry.global.opencorporates.is_branch': null,
      'registry.global.opencorporates.inactive': false,
      'registry.global.opencorporates.registered_name': 'KESTREL PAY AS',
      'registry.global.opencorporates.jurisdiction_code': 'ke',
      'registry.global.opencorporates.status': 'Active',
      'registry.global.opencorporates.incorporated_on': '2024-03-01',
      'registry.global.opencorporates.company_type': 'Private limited company',
      'registry.global.opencorporates.source_register': 'Fictional Companies Registry',
      'registry.global.opencorporates.officers_count': 2,
      'registry.global.opencorporates.officers_role_titles': ['director'],
    });
    const stored = JSON.stringify(result);
    expect(stored).not.toContain('oc-test-token');
    expect(stored).not.toContain('Imaginary Street');
    noPeople(result);
  });

  it('a US company is looked up in its state', async () => {
    const { connector, fetchImpl } = oc({ '/companies/us_ca/': sample('opencorporates-company.json') });
    await connector.lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-CA', file_number: '7741209' });
    expect(fetchImpl.calls[0]?.url).toContain('/companies/us_ca/7741209?');
  });

  it('finds an exact name, never offering a sole trader, then reads the company for its officers', async () => {
    const { connector, fetchImpl } = oc({ '/companies/search': sample('opencorporates-search.json'), '/companies/ke/KP-000000': sample('opencorporates-company.json') });
    const result = await connector.lookup({ name: 'Kestrel Pay AS', jurisdiction: 'KE' });
    expect(result.status).toBe('found');
    expect(result.matchConfidence).toBe(0.9);
    expect(fetchImpl.calls[0]?.url).toContain('jurisdiction_code=ke');
    expect(fetchImpl.calls[1]?.url).toContain('/companies/ke/KP-000000?api_token=');
    noPeople(result);
  });

  it('near names are ambiguous, and a sole trader is never a candidate', async () => {
    const { connector } = oc({ '/companies/search': sample('opencorporates-search.json') });
    const result = await connector.lookup({ name: 'Kestrel Payment AS', jurisdiction: 'KE' });
    expect(result.status).toBe('ambiguous');
    expect(result.message).toBe(OPENCORPORATES_WORDS.ambiguous);
    expect(result.candidates?.map((c) => c.identifier)).not.toContain('KP-999999');
    noPeople(result);
  });

  it('a miss never says the company does not exist; a sole trader by number is not kept', async () => {
    const miss = await oc({ '/companies/ke/': { status: 404, body: '{"error":{"message":"not found"}}' } }).connector.lookup({ name: 'Heron AS', jurisdiction: 'KE', registry_number: 'KP-1' });
    expect(miss.status).toBe('not_found');
    expect(miss.message).toBe(OPENCORPORATES_WORDS.missNumber);
    expect(factMap(miss)).toEqual({ 'registry.global.opencorporates.identified': null });
    const person = JSON.stringify({ results: { company: (JSON.parse(sample('opencorporates-search.json')) as { results: { companies: { company: unknown }[] } }).results.companies[0]?.company } });
    const sole = await oc({ '/companies/ke/KP-999999': person }).connector.lookup({ name: 'Amara', jurisdiction: 'KE', registry_number: 'KP-999999' });
    expect(sole.status).toBe('not_found');
    expect(sole.message).toBe(OPENCORPORATES_WORDS.person);
    noPeople(sole);
  });

  it('403 (their rate limit) and 401 (a bad key) are errors in plain words; the key never shows', async () => {
    const limited = await oc({ '/companies/ke/': { status: 403 } }).connector.lookup({ name: 'Kestrel Pay AS', jurisdiction: 'KE', registry_number: 'KP-000000' });
    expect(limited.status).toBe('error');
    expect(limited.message).toBe(OPENCORPORATES_WORDS.allowance);
    const bad = await oc({ '/companies/ke/': { status: 401 } }).connector.lookup({ name: 'Kestrel Pay AS', jurisdiction: 'KE', registry_number: 'KP-000000' });
    expect(bad.status).toBe('error');
    expect(bad.message).toBe("OpenCorporates didn't accept our credentials.");
    expect(JSON.stringify([limited, bad])).not.toContain('oc-test-token');
  });
});

describe('the global sources in the wider engine', () => {
  it('are registered, off by default, and chosen for any country', async () => {
    const connectors = createConnectors({ env: { NODE_ENV: 'production' }, now: () => NOW });
    const ids = connectors.map((c) => c.id);
    expect(ids).toEqual(expect.arrayContaining(['global.gleif', 'eu.vies_vat', 'global.opencorporates']));
    expect(connectorsFor(connectors, 'KE').map((c) => c.id)).toEqual(expect.arrayContaining(['global.gleif', 'global.opencorporates']));
    expect(connectorsFor(connectors, 'KE').map((c) => c.id)).not.toContain('eu.vies_vat');
    expect(connectorsFor(connectors, 'DE').map((c) => c.id)).toContain('eu.vies_vat');
    for (const connector of connectors.filter((c) => ['global.gleif', 'eu.vies_vat', 'global.opencorporates'].includes(c.id))) {
      expect((await connector.lookup({ name: 'Kestrel Pay AS', jurisdiction: 'DE', vat_number: 'DE000000000', lei: KESTREL_LEI })).status).toBe('unavailable');
    }
  });

  it('OpenCorporates skips a country only while its own register source is switched on', async () => {
    const env: Record<string, string> = { ...KEY, NODE_ENV: 'test', PUBLIC_API_USER_AGENT: 'VeroScan-test/1.0' };
    const fetchImpl = fakeFetch({});
    const connectors = createConnectors({ env, fetch: fetchImpl, now: () => NOW });
    const oc = connectors.find((c) => c.id === 'global.opencorporates');
    const registers = connectors.filter((c) => c.capabilities.includes('entity_lookup') && !c.jurisdictions.includes('*'));
    const on = registers.filter((c) => c.configured).flatMap((c) => c.jurisdictions);
    const off = registers.filter((c) => !c.configured).flatMap((c) => c.jurisdictions).filter((j) => !on.includes(j));
    // Keyless registers are on (the contact setting is set); keyed ones such as Denmark's are off.
    expect(on).toEqual(expect.arrayContaining(['NO', 'FI']));
    expect(off).toEqual(expect.arrayContaining(['DK', 'NL']));
    for (const jurisdiction of on) {
      const result = await oc?.lookup({ name: 'Kestrel Pay', jurisdiction });
      expect(result?.message, jurisdiction).toBe(OPENCORPORATES_WORDS.official);
    }
    expect(fetchImpl.calls).toHaveLength(0);
    // Denmark's CVR login isn't set, so OpenCorporates is asked rather than leaving no register check.
    const danish = await oc?.lookup({ name: 'Kestrel Pay ApS', jurisdiction: 'DK' });
    expect(danish?.message).not.toBe(OPENCORPORATES_WORDS.official);
    expect(fetchImpl.calls.length).toBeGreaterThan(0);
    // Once the login is set, Denmark counts as covered.
    env['DK_CVR_USERNAME'] = 'user';
    env['DK_CVR_PASSWORD'] = 'secret';
    expect((await oc?.lookup({ name: 'Kestrel Pay ApS', jurisdiction: 'DK' }))?.message).toBe(OPENCORPORATES_WORDS.official);
  });

  it('fixture mode has clearly labelled samples for each', async () => {
    const fixtures = createFixtureConnectors({ NODE_ENV: 'test' }, () => NOW).filter((c) => ['global.gleif', 'eu.vies_vat', 'global.opencorporates'].includes(c.id));
    expect(fixtures).toHaveLength(3);
    for (const connector of fixtures) {
      const result = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' });
      expect(result.provenance.fixture).toBe(true);
      expect(result.message).toContain('Not a real record');
    }
  });

  it('recordings drop sole traders, VIES names and addresses, officers, and the OpenCorporates key', () => {
    const gleif = redactBody(sample('gleif-search.json'));
    for (const word of ['JANE FICTIVE', 'Imaginary Close', 'Nowhere Town', 'ZZ1 9ZZ']) expect(gleif).not.toContain(word);
    expect(gleif).toContain('SOLE_PROPRIETOR');
    expect(gleif).toContain('KESTREL PAY UK LTD');
    expect(gleif).toContain('14839221');

    const vat = redactBody(sample('vies-valid.json'));
    for (const word of ['SAS KESTREL PAY', 'IMAGINAIRE', '75002']) expect(vat).not.toContain(word);
    expect(vat).toContain('"valid": true');
    expect(vat).toContain('NOT_PROCESSED');

    const company = redactBody(sample('opencorporates-company.json'));
    for (const word of ['AMARA FICTIVE', 'TUNDE INVENTED', 'OLD SECRETARY', '1985-02-01', 'Invented Road', 'Imaginary Street']) expect(company).not.toContain(word);
    expect(company).toContain('KESTREL PAY AS');
    expect(company).toContain('director');

    expect(redactUrl('https://api.opencorporates.com/v0.4/companies/ke/KP-1?api_token=oc-test-token')).not.toContain('oc-test-token');
  });
});

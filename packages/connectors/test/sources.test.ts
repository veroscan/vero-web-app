import { describe, expect, it, vi } from 'vitest';
import {
  CONNECTOR_FACT_KEYS,
  createCacVendorConnector,
  createCompaniesHouseConnector,
  createDelawareVendorConnector,
  createHmrcVatConnector,
  createIcoRegisterConnector,
  createNdpcListConnector,
  createSanctionsConnector,
  createSecFormDConnector,
  createUsptoConnector,
  type SourceResult,
} from '../src/index.js';
import { parseCapitalFilings, parseCharges, parseInsolvency, parseOfficers, parseProfile, parsePscs } from '../src/sources/companies-house.js';
import { normaliseVrn, parseVatLookup } from '../src/sources/hmrc-vat.js';
import { parseIcoRegister } from '../src/sources/ico-register.js';
import { parseCacPeople, parseCacSearch } from '../src/sources/cac-vendor.js';
import { parseCobaltSearch, parseMiddeskBusiness } from '../src/sources/delaware-vendor.js';
import { parseNdpcFeed } from '../src/sources/ndpc-list.js';
import { chosenLists, LIST_DOWNLOAD_TIMEOUT_MS, parseOfacCsv, parseUkCsv, parseUnXml, screenName } from '../src/sources/sanctions.js';
import { parseFormD, parseSearchAtom, parseSubmissions } from '../src/sources/sec-form-d.js';
import { parsePatentSearch, parseTsdr } from '../src/sources/uspto.js';
import { nameSimilarity, normaliseName, normalisePostcode, parseCsv, toIsoDate } from '../src/text.js';
import { factMap, fakeFetch, noSleep, NOW, sample, sampleJson } from './helpers.js';

const CH = 'registry.uk.companies_house';
const PUBLISHED: ReadonlySet<string> = new Set(CONNECTOR_FACT_KEYS);

function assertPublished(result: SourceResult): void {
  for (const fact of result.facts) expect(PUBLISHED.has(fact.key), fact.key).toBe(true);
}

/** Strings that must never reach a stored result: home addresses, ID numbers, contact details. */
function assertNoPersonalDetails(result: SourceResult): void {
  const text = JSON.stringify(result);
  for (const banned of ['Home', 'home', '000-00-0000', '+234', 'amara@', '22222222222', '1988', '12345678-0001', 'date_of_birth', 'address_line']) {
    expect(text, banned).not.toContain(banned);
  }
}

describe('text helpers', () => {
  it('normalises names', () => {
    expect(normaliseName('Kestrel Pay UK Ltd.')).toBe('kestrel pay uk');
    expect(normaliseName('KESTREL PAY UK LIMITED')).toBe('kestrel pay uk');
    expect(normaliseName('Kestrel Pay, Inc')).toBe('kestrel pay');
    expect(normaliseName('Müller & Sons Ltd')).toBe('muller and sons');
    expect(normaliseName('Kestrel Pay Nigeria Ltd')).not.toBe(normaliseName('Kestrel Pay Inc.'));
  });

  it('scores similarity', () => {
    expect(nameSimilarity('Kestrel Pay Ltd', 'KESTREL PAY LIMITED')).toBe(1);
    expect(nameSimilarity('Kestrel Pay', 'Kestrel Payments')).toBeGreaterThan(0.6);
    expect(nameSimilarity('Kestrel Pay', 'Unrelated Group')).toBeLessThan(0.3);
    expect(nameSimilarity('', '')).toBe(0);
  });

  it('parses CSV with quotes, commas, doubled quotes and blank lines', () => {
    expect(parseCsv('a,"b,c","d ""e"""\r\n\r\n1,2,3\n')).toEqual([['a', 'b,c', 'd "e"'], ['1', '2', '3']]);
    expect(parseCsv('﻿x,y\n')).toEqual([['x', 'y']]);
    expect(parseCsv('"multi\nline",2')).toEqual([['multi\nline', '2']]);
  });

  it('reads dates, and refuses impossible ones', () => {
    expect(toIsoDate('09/08/2027')).toBe('2027-08-09');
    expect(toIsoDate('2027-08-09T00:00:00')).toBe('2027-08-09');
    expect(toIsoDate('2 March 2026')).toBe('2026-03-02');
    expect(toIsoDate('31/02/2027')).toBeNull();
    expect(toIsoDate('soon')).toBeNull();
    expect(toIsoDate('')).toBeNull();
    expect(toIsoDate(undefined)).toBeNull();
  });

  it('normalises postcodes', () => {
    expect(normalisePostcode('ec1a 1aa')).toBe('EC1A1AA');
  });
});

describe('uk.companies_house parsers', () => {
  it('reads the profile', () => {
    const facts = Object.fromEntries(parseProfile(sampleJson('ch-profile.json')).map((f) => [f.key, f.value]));
    expect(facts[`${CH}.status`]).toBe('active');
    expect(facts[`${CH}.company_number`]).toBe('14839221');
    expect(facts[`${CH}.confirmation_overdue`]).toBe(true);
    expect(facts[`${CH}.confirmation_next_due`]).toBe('2026-10-12');
    expect(facts[`${CH}.accounts_overdue`]).toBe(false);
    expect(facts[`${CH}.accounts_next_due`]).toBe('2027-06-30');
    expect(facts[`${CH}.registered_office_present`]).toBe(true);
    expect(facts[`${CH}.sic_codes`]).toEqual(['62012']);
    // Only the registered office postcode is kept, for matching on the ICO register.
    expect(facts[`${CH}.registered_office_postcode`]).toBe('EC1A 1AA');
    expect(JSON.stringify(facts)).not.toContain('address_line');
  });

  it('says nothing about overdue when the source did not', () => {
    const keys = parseProfile({ company_status: 'active' }).map((f) => f.key);
    expect(keys).not.toContain(`${CH}.confirmation_overdue`);
    expect(keys).not.toContain(`${CH}.accounts_overdue`);
  });

  it('counts directors and identity checks in every shape the API uses', () => {
    const facts = Object.fromEntries(parseOfficers(sampleJson('ch-officers.json')).map((f) => [f.key, f.value]));
    // Active directors: Adeyemi, Okafor, Self, and the corporate director.
    expect(facts[`${CH}.directors_active_count`]).toBe(4);
    // Adeyemi through an agent, Self directly through GOV.UK. The corporate director isn't counted.
    expect(facts[`${CH}.directors_idv_on_record_count`]).toBe(2);
    expect(facts[`${CH}.directors_idv_outstanding_count`]).toBe(1);
    expect(facts[`${CH}.directors_idv_next_due`]).toBe('2026-11-18');
  });

  it('leaves resigned officers and secretaries out of the identity check', () => {
    const facts = parseOfficers({ items: [{ name: 'A', officer_role: 'secretary' }, { name: 'B', officer_role: 'director', resigned_on: '2024-01-01' }] });
    const map = Object.fromEntries(facts.map((f) => [f.key, f.value]));
    expect(map[`${CH}.directors_active_count`]).toBe(0);
    expect(map[`${CH}.directors_idv_outstanding_count`]).toBe(0);
  });

  it('keeps names and roles only for officers', () => {
    const facts = parseOfficers(sampleJson('ch-officers.json'));
    const text = JSON.stringify(facts);
    expect(text).toContain('ADEYEMI, Amara (director)');
    expect(text).not.toContain('Home');
    expect(text).not.toContain('1988');
    expect(text).not.toContain('British');
  });

  it('reads PSCs, leaving out ceased ones', () => {
    const map = Object.fromEntries(parsePscs(sampleJson('ch-psc.json')).map((f) => [f.key, f.value]));
    expect(map[`${CH}.psc_active_count`]).toBe(1);
    expect(map[`${CH}.pscs`]).toEqual(['Kestrel Pay Inc.']);
    expect(map[`${CH}.psc_sanctioned`]).toBe(false);
    expect(map[`${CH}.psc_idv_outstanding_count`]).toBe(0);
  });

  it('counts part-satisfied charges as still outstanding', () => {
    const map = Object.fromEntries(parseCharges(sampleJson('ch-charges.json')).map((f) => [f.key, f.value]));
    expect(map[`${CH}.charges_total_count`]).toBe(3);
    expect(map[`${CH}.charges_outstanding_count`]).toBe(2);
  });

  it('counts insolvency cases', () => {
    expect(parseInsolvency(sampleJson('ch-insolvency.json'))[0]?.value).toBe(1);
  });

  it('finds the latest SH01', () => {
    const map = Object.fromEntries(parseCapitalFilings(sampleJson('ch-capital.json')).map((f) => [f.key, f.value]));
    expect(map[`${CH}.last_allotment_on`]).toBe('2025-03-14');
    expect(map[`${CH}.capital_filing_on_record`]).toBe(true);
  });
});

describe('uk.companies_house lookup', () => {
  const env = { COMPANIES_HOUSE_API_KEY: 'test-key' };
  const routes = {
    '/officers': JSON.stringify(sampleJson('ch-officers.json')),
    '/persons-with-significant-control': JSON.stringify(sampleJson('ch-psc.json')),
    'category=incorporation': JSON.stringify({ total_count: 1, items: [] }),
    'category=capital': JSON.stringify(sampleJson('ch-capital.json')),
    '/company/14839221': JSON.stringify(sampleJson('ch-profile.json')),
    '/search/companies': JSON.stringify(sampleJson('ch-search.json')),
  };

  it('finds by number, sends the key as Basic auth, and strips personal details', async () => {
    const fetchImpl = fakeFetch(routes);
    const result = await createCompaniesHouseConnector({ env, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', company_number: '14839221' });
    expect(result.status).toBe('found');
    expect(result.matchConfidence).toBe(1);
    const facts = factMap(result);
    expect(facts[`${CH}.charges_outstanding_count`]).toBe(0);
    expect(facts[`${CH}.insolvency_case_count`]).toBe(0);
    expect(facts[`${CH}.incorporation_filing_on_record`]).toBe(true);
    expect(result.provenance.rawHash).toMatch(/^[0-9a-f]{64}$/);
    const auth = new Headers(fetchImpl.calls[0]?.init?.headers).get('authorization');
    expect(auth).toBe(`Basic ${Buffer.from('test-key:').toString('base64')}`);
    assertPublished(result);
    assertNoPersonalDetails(result);
  });

  it('finds by name when exactly one matches', async () => {
    const result = await createCompaniesHouseConnector({ env, fetch: fakeFetch(routes), sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay UK Limited', jurisdiction: 'GB' });
    expect(result.status).toBe('found');
    expect(result.matchConfidence).toBe(0.95);
  });

  it('asks when the name is only close', async () => {
    const result = await createCompaniesHouseConnector({ env, fetch: fakeFetch(routes), sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Payments Group', jurisdiction: 'GB' });
    expect(result.status).toBe('ambiguous');
    expect(result.facts).toEqual([]);
    expect(result.candidates?.[0]?.identifier).toBeDefined();
  });

  it('says not found as a fact about the search, not about the world', async () => {
    const fetchImpl = fakeFetch({ '/search/companies': JSON.stringify({ items: [] }) });
    const result = await createCompaniesHouseConnector({ env, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Nobody At All Ltd', jurisdiction: 'GB' });
    expect(result.status).toBe('not_found');
    expect(factMap(result)[`${CH}.found`]).toBe(false);
    expect(factMap(result)[`${CH}.status`]).toBeUndefined();
    expect(result.message).toContain("didn't find");
  });

  it('handles an unknown company number', async () => {
    const result = await createCompaniesHouseConnector({ env, fetch: fakeFetch({ '/company/': { status: 404 } }), sleep: noSleep, now: NOW }).lookup({ name: 'X', jurisdiction: 'GB', company_number: '1' });
    expect(result.status).toBe('not_found');
  });

  it('leaves a section unknown when just that section fails', async () => {
    const result = await createCompaniesHouseConnector({ env, fetch: fakeFetch({ ...routes, '/officers': { status: 500 } }), sleep: noSleep, retries: 0, now: NOW }).lookup({ name: 'X', jurisdiction: 'GB', company_number: '14839221' });
    expect(result.status).toBe('found');
    expect(factMap(result)[`${CH}.directors_active_count`]).toBeUndefined();
    expect(result.message).toContain("didn't answer for every section");
  });

  it('reports a rejected key as an error', async () => {
    const result = await createCompaniesHouseConnector({ env, fetch: fakeFetch({ '/company/': { status: 401 } }), sleep: noSleep, now: NOW }).lookup({ name: 'X', jurisdiction: 'GB', company_number: '1' });
    expect(result.status).toBe('error');
    expect(result.message).toContain("didn't accept");
  });

  it('reads a PSC 404 as an empty register', async () => {
    const result = await createCompaniesHouseConnector({ env, fetch: fakeFetch({ ...routes, '/persons-with-significant-control': { status: 404 } }), sleep: noSleep, now: NOW }).lookup({ name: 'X', jurisdiction: 'GB', company_number: '14839221' });
    expect(factMap(result)[`${CH}.psc_active_count`]).toBe(0);
  });

  it('reads charges and insolvency when the profile links to them', async () => {
    const profile = { ...(sampleJson('ch-profile.json') as object), links: { charges: '/x', insolvency: '/y' } };
    const result = await createCompaniesHouseConnector({
      env,
      fetch: fakeFetch({ ...routes, '/charges': JSON.stringify(sampleJson('ch-charges.json')), '/insolvency': JSON.stringify(sampleJson('ch-insolvency.json')), '/company/14839221': JSON.stringify(profile) }),
      sleep: noSleep,
      now: NOW,
    }).lookup({ name: 'X', jurisdiction: 'GB', company_number: '14839221' });
    expect(factMap(result)[`${CH}.charges_outstanding_count`]).toBe(2);
    expect(factMap(result)[`${CH}.insolvency_case_count`]).toBe(1);
  });
});

describe('uk.ico_register', () => {
  const env = { ICO_REGISTER_FILE: 'register.csv' };
  const connector = () => createIcoRegisterConnector({ env, readRegisterFile: async () => sample('ico-register.csv'), now: NOW });

  it('parses the file, with commas in names', () => {
    const entries = parseIcoRegister(sample('ico-register.csv'));
    expect(entries).toHaveLength(4);
    expect(entries[0]?.name).toBe('Sample Widgets, Ltd');
    expect(entries[0]?.endDate).toBe('2027-08-09');
    expect(entries[1]?.tradingNames).toEqual(['Kestrel Pay']);
  });

  it('fails loudly on a header it does not know', () => {
    expect(() => parseIcoRegister('a,b\n1,2\n')).toThrow("isn't in the format");
  });

  it('matches on name and postcode', async () => {
    const result = await connector().lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', postcode: 'ec1a 2bb' });
    expect(result.status).toBe('found');
    expect(factMap(result)).toMatchObject({ 'registry.uk.ico.listed': true, 'registry.uk.ico.z_reference': 'ZA222222', 'registry.uk.ico.expires_on': '2026-08-09' });
    assertPublished(result);
  });

  it('matches a trading name', async () => {
    const result = await connector().lookup({ name: 'Kestrel Pay', jurisdiction: 'GB', postcode: 'EC1A 2BB' });
    expect(result.status).toBe('found');
  });

  it('will not guess from a name alone: with no postcode and no number it says what it needs', async () => {
    const result = await connector().lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' });
    expect(result.status).toBe('unsupported');
    expect(result.facts).toEqual([]);
    expect(result.message).toContain('postcode');
    expect(result.message).toContain('ICO registration number');
  });

  it('with a number that is not on the register and no postcode, asks rather than matching a name', async () => {
    const result = await connector().lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', ico_reference: 'ZX999999' });
    expect(result.status).toBe('ambiguous');
    expect(result.facts).toEqual([]);
  });

  it('treats the same name at another postcode as a question', async () => {
    const result = await connector().lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', postcode: 'ZZ9 9ZZ' });
    expect(result.status).toBe('ambiguous');
  });

  it('finds by Z-reference', async () => {
    const result = await connector().lookup({ name: 'Anything', jurisdiction: 'GB', ico_reference: 'za333333' });
    expect(factMap(result)['registry.uk.ico.z_reference']).toBe('ZA333333');
  });

  it('says not found kindly', async () => {
    const result = await connector().lookup({ name: 'Nobody Ltd', jurisdiction: 'GB', postcode: 'ZZ9 9ZZ' });
    expect(result.status).toBe('not_found');
    expect(factMap(result)['registry.uk.ico.listed']).toBe(false);
    expect(result.message).toContain('give it a week');
  });

  it('is an error, not "not found", when the file cannot be read', async () => {
    const result = await createIcoRegisterConnector({ env, readRegisterFile: async () => { throw new Error('ENOENT'); }, now: NOW }).lookup({ name: 'X', jurisdiction: 'GB' });
    expect(result.status).toBe('error');
    expect(result.facts).toEqual([]);
  });

  it('is an error when the file format has changed', async () => {
    const result = await createIcoRegisterConnector({ env, readRegisterFile: async () => 'surprise,columns\n1,2\n', now: NOW }).lookup({ name: 'X', jurisdiction: 'GB' });
    expect(result.status).toBe('error');
    expect(result.message).toContain("isn't in the format");
  });
});

describe('uk.hmrc_vat', () => {
  const env = { HMRC_CLIENT_ID: 'id', HMRC_CLIENT_SECRET: 'shh' };
  const tokenRoute = { '/oauth/token': JSON.stringify({ access_token: 'tok', expires_in: 14400 }) };

  it('normalises VAT numbers', () => {
    expect(normaliseVrn('GB 123 4567 89')).toBe('123456789');
    expect(normaliseVrn('123456789012')).toBe('123456789012');
    expect(normaliseVrn('12345')).toBeNull();
    expect(normaliseVrn('ABCDEFGHI')).toBeNull();
  });

  it('parses a lookup', () => {
    const facts = Object.fromEntries(parseVatLookup(sampleJson('hmrc-lookup.json')).map((f) => [f.key, f.value]));
    expect(facts['registry.uk.hmrc_vat.registered']).toBe(true);
    expect(facts['registry.uk.hmrc_vat.vat_number']).toBe('123456789');
  });

  it('gets a token once, with the right scope and headers', async () => {
    const fetchImpl = fakeFetch({ ...tokenRoute, '/lookup/': sample('hmrc-lookup.json') });
    const connector = createHmrcVatConnector({ env, fetch: fetchImpl, sleep: noSleep, now: NOW });
    const result = await connector.lookup({ name: 'K', jurisdiction: 'GB', vat_number: 'GB123456789' });
    expect(result.status).toBe('found');
    assertPublished(result);
    await connector.lookup({ name: 'K', jurisdiction: 'GB', vat_number: '987654321' });
    expect(fetchImpl.calls.filter((c) => c.url.includes('/oauth/token'))).toHaveLength(1);
    const body = fetchImpl.calls[0]?.init?.body as string;
    expect(body).toContain('grant_type=client_credentials');
    expect(body).toContain('scope=read%3Avat');
    const lookup = fetchImpl.calls.find((c) => c.url.includes('/lookup/'));
    expect(lookup?.url).toContain('/organisations/vat/check-vat-number/lookup/123456789');
    const headers = new Headers(lookup?.init?.headers);
    expect(headers.get('accept')).toBe('application/vnd.hmrc.2.0+json');
    expect(headers.get('authorization')).toBe('Bearer tok');
    expect(JSON.stringify(result)).not.toContain('shh');
  });

  it('reads 404 as not registered', async () => {
    const result = await createHmrcVatConnector({ env, fetch: fakeFetch({ ...tokenRoute, '/lookup/': { status: 404, body: '{"code":"NOT_FOUND"}' } }), sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'GB', vat_number: '123456789' });
    expect(result.status).toBe('not_found');
    expect(factMap(result)['registry.uk.hmrc_vat.registered']).toBe(false);
  });

  it('cannot search without a number, and says so', async () => {
    const fetchImpl = fakeFetch(tokenRoute);
    const result = await createHmrcVatConnector({ env, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'GB' });
    expect(result.status).toBe('unsupported');
    expect(fetchImpl.calls).toHaveLength(0);
    expect(result.message).toContain('We need your VAT number');
  });

  it('refuses a malformed number without calling HMRC', async () => {
    const result = await createHmrcVatConnector({ env, fetch: fakeFetch(tokenRoute), sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'GB', vat_number: '12' });
    expect(result.status).toBe('unsupported');
  });

  it('reports a failed token as an error', async () => {
    const result = await createHmrcVatConnector({ env, fetch: fakeFetch({ '/oauth/token': { status: 401 } }), sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'GB', vat_number: '123456789' });
    expect(result.status).toBe('error');
  });
});

describe('us.uspto', () => {
  const P = 'registry.us.uspto';

  it('parses a pending application', () => {
    const status = parseTsdr(sampleJson('uspto-tsdr.json'));
    expect(status).toMatchObject({ mark: 'KESTREL PAY', live: true, registered: false, registeredOn: null });
  });

  it('parses a registration and a dead mark', () => {
    expect(parseTsdr(sampleJson('uspto-tsdr-registered.json'))).toMatchObject({ registered: true, registeredOn: '2016-03-10', live: true });
    expect(parseTsdr(sampleJson('uspto-tsdr-dead.json'))).toMatchObject({ live: false, registered: false });
  });

  it('parses patent counts', () => {
    expect(parsePatentSearch(sampleJson('uspto-odp.json'))).toBe(2);
    expect(parsePatentSearch({ patentFileWrapperDataBag: [{}] })).toBe(1);
    expect(parsePatentSearch({})).toBeNull();
  });

  it('checks a serial number with the TSDR key header', async () => {
    const fetchImpl = fakeFetch({ '/casestatus/sn97000000/info.json': sample('uspto-tsdr.json') });
    const result = await createUsptoConnector({ env: { USPTO_TSDR_API_KEY: 'tsdr' }, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE', trademark_serials: ['97/000,000'] });
    expect(result.status).toBe('found');
    expect(factMap(result)).toMatchObject({ [`${P}.trademark_filed`]: true, [`${P}.trademark_status`]: 'live', [`${P}.trademark_marks`]: ['KESTREL PAY'] });
    expect(new Headers(fetchImpl.calls[0]?.init?.headers).get('usptO-api-key')).toBe('tsdr');
    assertPublished(result);
  });

  it('searches patents by applicant with the ODP key', async () => {
    const fetchImpl = fakeFetch({ 'applications/search': sample('uspto-odp.json') });
    const result = await createUsptoConnector({ env: { USPTO_ODP_API_KEY: 'odp' }, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel "Pay" Inc.', jurisdiction: 'US-DE' });
    expect(factMap(result)[`${P}.patent_application_count`]).toBe(2);
    expect(new Headers(fetchImpl.calls[0]?.init?.headers).get('x-api-key')).toBe('odp');
    expect(decodeURIComponent(fetchImpl.calls[0]?.url ?? '')).toContain('firstApplicantName:"Kestrel Pay Inc."');
  });

  it('publishes no trademark facts without a serial number, because it cannot know', async () => {
    const result = await createUsptoConnector({ env: { USPTO_ODP_API_KEY: 'odp' }, fetch: fakeFetch({ 'applications/search': JSON.stringify({ count: 0 }) }), sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'US-DE' });
    expect(Object.keys(factMap(result))).toEqual([`${P}.patent_application_count`]);
    expect(result.status).toBe('not_found');
  });

  it('asks for a serial when that is all it could use', async () => {
    const result = await createUsptoConnector({ env: { USPTO_TSDR_API_KEY: 'k' }, fetch: fakeFetch({}), sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'US-DE' });
    expect(result.status).toBe('unsupported');
    expect(result.message).toContain('We need your US trademark serial number');
  });

  it('treats an unknown serial as not filed', async () => {
    const result = await createUsptoConnector({ env: { USPTO_TSDR_API_KEY: 'k' }, fetch: fakeFetch({ casestatus: { status: 404 } }), sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'US-DE', trademark_serials: ['1'] });
    expect(factMap(result)[`${P}.trademark_filed`]).toBe(false);
    expect(result.status).toBe('not_found');
  });

  it('reads the ODP 404 as no results', async () => {
    const result = await createUsptoConnector({ env: { USPTO_ODP_API_KEY: 'k' }, fetch: fakeFetch({ 'applications/search': { status: 404 } }), sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'US-DE' });
    expect(factMap(result)[`${P}.patent_application_count`]).toBe(0);
  });
});

describe('us.sec_form_d', () => {
  const P = 'registry.us.sec_form_d';
  const env = { SEC_USER_AGENT: 'Vero Scan admin@example.com' };
  const base = {
    'browse-edgar': sample('sec-search-single.xml'),
    'CIK0001999999.json': sample('sec-submissions.json'),
    '/primary_doc.xml': sample('sec-form-d.xml'),
  };

  it('reads CIKs from both shapes of the search feed', () => {
    expect(parseSearchAtom(sample('sec-search-single.xml'))).toEqual(['0001999999']);
    expect(parseSearchAtom(sample('sec-search-many.xml'))).toEqual(['0001999999', '0001888888']);
    expect(parseSearchAtom('<feed></feed>')).toEqual([]);
  });

  it('keeps only Form D rows, newest first', () => {
    const { name, filings } = parseSubmissions(sampleJson('sec-submissions.json'));
    expect(name).toBe('KESTREL PAY INC.');
    expect(filings.map((f) => f.form)).toEqual(['D', 'D/A']);
    expect(filings[0]?.accession).toBe('0001999999-25-000001');
  });

  it('parses a real-shaped Form D, decoding entities', () => {
    const doc = parseFormD(sample('sec-form-d.xml'));
    expect(doc).toMatchObject({
      entityName: 'Kestrel Pay & Co, Inc.', entityType: 'Corporation', jurisdictionOfInc: 'DELAWARE', pooledFund: false,
      totalOfferingAmount: 'Indefinite', totalAmountSold: '1500000', firstSaleOn: '2025-05-20', revenueRange: 'Decline to Disclose',
    });
  });

  it('spots a pooled fund', () => {
    expect(parseFormD(sample('sec-form-d-fund.xml')).pooledFund).toBe(true);
  });

  it('goes search, submissions, form, with the declared user agent, and reads no people', async () => {
    const fetchImpl = fakeFetch(base);
    const result = await createSecFormDConnector({ env, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('found');
    expect(factMap(result)).toMatchObject({ [`${P}.filed`]: true, [`${P}.filing_count`]: 2, [`${P}.total_amount_sold`]: '1500000', [`${P}.latest_filed_on`]: '2025-06-03' });
    expect(new Headers(fetchImpl.calls[0]?.init?.headers).get('user-agent')).toBe('Vero Scan admin@example.com');
    expect(fetchImpl.calls.some((c) => c.url.includes('/1999999/000199999925000001/primary_doc.xml'))).toBe(true);
    expect(JSON.stringify(result)).not.toContain('Adeyemi');
    assertPublished(result);
  });

  it('drops candidates whose name is different', async () => {
    const fetchImpl = fakeFetch({ ...base, 'browse-edgar': sample('sec-search-many.xml'), 'CIK0001888888.json': sample('sec-submissions-other.json') });
    expect((await createSecFormDConnector({ env, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' })).status).toBe('found');
  });

  it('asks when two filers share the exact name', async () => {
    const fetchImpl = fakeFetch({ ...base, 'browse-edgar': sample('sec-search-many.xml'), 'CIK0001888888.json': sample('sec-submissions.json') });
    expect((await createSecFormDConnector({ env, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' })).status).toBe('ambiguous');
  });

  it('does not count a feeder fund as the company raising', async () => {
    const result = await createSecFormDConnector({ env, fetch: fakeFetch({ ...base, '/primary_doc.xml': sample('sec-form-d-fund.xml') }), sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('not_found');
    expect(factMap(result)[`${P}.filed`]).toBe(false);
  });

  it('says no filing without claiming no round', async () => {
    const result = await createSecFormDConnector({ env, fetch: fakeFetch({ 'browse-edgar': '<feed></feed>' }), sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('not_found');
    expect(result.message).toContain('Not every round needs one');
  });

  it('skips the search when it has a CIK', async () => {
    const fetchImpl = fakeFetch(base);
    await createSecFormDConnector({ env, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Other Name', jurisdiction: 'US-DE', cik: '1999999' });
    expect(fetchImpl.calls.some((c) => c.url.includes('browse-edgar'))).toBe(false);
  });

  it('publishes the CIK it confirmed, so the next scan can skip the name search', async () => {
    const result = await createSecFormDConnector({ env, fetch: fakeFetch(base), sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(factMap(result)[`${P}.cik`]).toBe('0001999999');
  });
});

describe('us.delaware_vendor', () => {
  const P = 'registry.us.delaware_vendor';

  it('parses a Middesk business, ignoring an unknown Delaware status', () => {
    const record = parseMiddeskBusiness(sampleJson('middesk-business.json'));
    expect(record).toMatchObject({ fileNumber: '7741209', entityType: 'CORPORATION', formedOn: '2022-08-16', registeredAgent: 'Northwood Agents LLC', otherStateCount: 1, officers: ['Amara Adeyemi (CEO)'] });
    expect(record?.status).toBeUndefined();
  });

  it('has no Delaware record when only other states are listed', () => {
    expect(parseMiddeskBusiness({ registrations: [{ state: 'CA' }] })).toBeNull();
  });

  it('parses a Cobalt search', () => {
    const [record] = parseCobaltSearch(sampleJson('cobalt-search.json'));
    expect(record).toMatchObject({ fileNumber: '7741209', nextReportDue: '2027-03-01', registeredAgent: 'Northwood Agents LLC', officers: ['Amara Adeyemi (CEO)'] });
    expect(record?.status).toBeUndefined();
  });

  it('never publishes a good standing or franchise tax fact, and no live status', () => {
    for (const key of CONNECTOR_FACT_KEYS.filter((k) => k.startsWith(P))) {
      expect(key).not.toMatch(/good_standing|franchise|live_status/);
    }
  });

  it('looks up through Middesk and strips addresses and ID numbers', async () => {
    const fetchImpl = fakeFetch({ '/v1/businesses/biz_sample': sample('middesk-business.json'), '/v1/businesses': JSON.stringify({ id: 'biz_sample' }) });
    const result = await createDelawareVendorConnector({ env: { MIDDESK_API_KEY: 'mk' }, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('found');
    expect(result.provenance.method).toBe('licensed_vendor');
    expect(factMap(result)).toMatchObject({ [`${P}.found`]: true, [`${P}.file_number`]: '7741209', [`${P}.registered_agent_present`]: true });
    expect(factMap(result)[`${P}.vendor_status`]).toBeUndefined();
    assertPublished(result);
    assertNoPersonalDetails(result);
    expect(new Headers(fetchImpl.calls[0]?.init?.headers).get('authorization')).toBe('Bearer mk');
  });

  it('treats a report that is not ready as waiting, not as missing, and keeps the reference', async () => {
    const result = await createDelawareVendorConnector({ env: { MIDDESK_API_KEY: 'k' }, fetch: fakeFetch({ '/v1/businesses/b1': sample('middesk-pending.json') }), sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'US-DE', vendor_business_id: 'b1' });
    expect(result.status).toBe('waiting');
    expect(result.facts).toEqual([]);
    expect(result.vendorBusinessId).toBe('b1');
    expect(result.message).toContain("We'll check again");
  });

  it('reuses a stored Middesk business instead of creating, and paying for, a new one', async () => {
    const fetchImpl = fakeFetch({ '/v1/businesses/biz_sample': sample('middesk-business.json'), '/v1/businesses': JSON.stringify({ id: 'should_not_be_made' }) });
    const result = await createDelawareVendorConnector({ env: { MIDDESK_API_KEY: 'mk' }, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE', vendor_business_id: 'biz_sample' });
    expect(result.status).toBe('found');
    expect(result.vendorBusinessId).toBe('biz_sample');
    expect(fetchImpl.calls.some((call) => call.init?.method === 'POST')).toBe(false);
  });

  it('hands back the reference of a business it had to create', async () => {
    const fetchImpl = fakeFetch({ '/v1/businesses/biz_new': sample('middesk-pending.json'), '/v1/businesses': JSON.stringify({ id: 'biz_new' }) });
    const result = await createDelawareVendorConnector({ env: { MIDDESK_API_KEY: 'mk' }, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('waiting');
    expect(result.vendorBusinessId).toBe('biz_new');
    expect(fetchImpl.calls.filter((call) => call.init?.method === 'POST')).toHaveLength(1);
  });

  it('creates a new business only when Middesk no longer has the stored one', async () => {
    const fetchImpl = fakeFetch({ '/v1/businesses/gone': { status: 404 }, '/v1/businesses/biz_sample': sample('middesk-business.json'), '/v1/businesses': JSON.stringify({ id: 'biz_sample' }) });
    const result = await createDelawareVendorConnector({ env: { MIDDESK_API_KEY: 'mk' }, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE', vendor_business_id: 'gone' });
    expect(result.status).toBe('found');
    expect(result.vendorBusinessId).toBe('biz_sample');
  });

  it('says a missing record does not mean there is none', async () => {
    const result = await createDelawareVendorConnector({ env: { MIDDESK_API_KEY: 'k' }, fetch: fakeFetch({ '/v1/businesses/b1': JSON.stringify({ status: 'approved', registrations: [] }) }), sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'US-DE', vendor_business_id: 'b1' });
    expect(result.status).toBe('not_found');
    expect(result.message).toContain("doesn't mean there isn't one");
  });

  it('uses Cobalt when chosen, and never asks it for live Delaware data', async () => {
    const fetchImpl = fakeFetch({ '/v1/search': sample('cobalt-search.json') });
    const result = await createDelawareVendorConnector({ env: { COBALT_API_KEY: 'ck' }, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('found');
    expect(factMap(result)[`${P}.next_report_due`]).toBe('2027-03-01');
    expect(fetchImpl.calls[0]?.url).not.toContain('liveData');
    expect(new Headers(fetchImpl.calls[0]?.init?.headers).get('x-api-key')).toBe('ck');
    assertNoPersonalDetails(result);
  });

  it('never calls Delaware itself', async () => {
    const fetchImpl = fakeFetch({ '/v1/search': sample('cobalt-search.json'), '/v1/businesses': JSON.stringify({ id: 'b', status: 'approved', registrations: [] }) });
    await createDelawareVendorConnector({ env: { COBALT_API_KEY: 'c', MIDDESK_API_KEY: 'm' }, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'US-DE' });
    for (const call of fetchImpl.calls) expect(call.url).not.toMatch(/delaware\.gov/i);
  });

  it('honours DELAWARE_VENDOR, and is unavailable if that vendor has no key', async () => {
    const result = await createDelawareVendorConnector({ env: { DELAWARE_VENDOR: 'cobalt', MIDDESK_API_KEY: 'm' }, fetch: fakeFetch({}), sleep: noSleep, now: NOW }).lookup({ name: 'K', jurisdiction: 'US-DE' });
    expect(result.status).toBe('unavailable');
  });

  it('asks when Cobalt returns only near names', async () => {
    const result = await createDelawareVendorConnector({ env: { COBALT_API_KEY: 'k' }, fetch: fakeFetch({ '/v1/search': sample('cobalt-search.json') }), sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Payments', jurisdiction: 'US-DE' });
    expect(result.status).toBe('ambiguous');
  });
});

describe('ng.cac_vendor', () => {
  const P = 'registry.ng.cac';
  const env = { MONO_SECRET_KEY: 'mono-secret' };
  const people = sample('mono-people.json');
  const routes = {
    '/v3/lookup/cac?search': sample('mono-search.json'),
    '/company/co_1/directors': people,
    '/company/co_1/shareholders': JSON.stringify({ data: [{ name: 'Kestrel Pay Inc.', phone: '+2340000' }] }),
    '/company/co_1/secretary': JSON.stringify({ data: [] }),
    '/company/co_1/psc': JSON.stringify({ data: [{ name: 'Kestrel Pay Inc.' }] }),
    '/v3/lookup/tin': sample('mono-tin.json'),
  };

  it('parses the search', () => {
    const [first] = parseCacSearch(sampleJson('mono-search.json'));
    expect(first).toMatchObject({ id: 'co_1', rcNumber: '1849302', status: 'active', incorporatedOn: '2021-06-12', addressPresent: true, shareCapitalPresent: true });
  });

  it('keeps names and roles only', () => {
    expect(parseCacPeople(sampleJson('mono-people.json'), 'director')).toEqual(['Amara Adeyemi (director)', 'Okafor Tunde (director)']);
  });

  it('builds the record, with the secret in a header and nothing personal kept', async () => {
    const fetchImpl = fakeFetch(routes);
    const result = await createCacVendorConnector({ env, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG' });
    expect(result.status).toBe('found');
    expect(factMap(result)).toMatchObject({
      [`${P}.status`]: 'active', [`${P}.rc_number`]: '1849302', [`${P}.directors_count`]: 2, [`${P}.shareholders_count`]: 1,
      [`${P}.secretary_on_record`]: false, [`${P}.psc_count`]: 1, [`${P}.tin_issued`]: true, [`${P}.registered_address_present`]: true,
    });
    expect(new Headers(fetchImpl.calls[0]?.init?.headers).get('mono-sec-key')).toBe('mono-secret');
    expect(JSON.stringify(result)).not.toContain('mono-secret');
    assertPublished(result);
    assertNoPersonalDetails(result);
    // The address itself isn't kept, only that there is one.
    expect(JSON.stringify(result)).not.toContain('Sample Close');
  });

  it('publishes nothing that says returns were filed', () => {
    expect(CONNECTOR_FACT_KEYS.filter((k) => k.startsWith(P) && /return/.test(k))).toEqual([]);
  });

  it('finds by RC number', async () => {
    const result = await createCacVendorConnector({ env, fetch: fakeFetch(routes), sleep: noSleep, now: NOW }).lookup({ name: 'Trading Name', jurisdiction: 'NG', rc_number: 'RC 1849302' });
    expect(result.status).toBe('found');
    expect(result.matchConfidence).toBe(1);
  });

  it('asks when the name is only close', async () => {
    const result = await createCacVendorConnector({ env, fetch: fakeFetch(routes), sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Nigeria Holdings', jurisdiction: 'NG' });
    expect(result.status).toBe('ambiguous');
    expect(result.facts).toEqual([]);
  });

  it('says not found kindly', async () => {
    const result = await createCacVendorConnector({ env, fetch: fakeFetch({ '/v3/lookup/cac': JSON.stringify({ data: [] }) }), sleep: noSleep, now: NOW }).lookup({ name: 'Nobody Ltd', jurisdiction: 'NG' });
    expect(result.status).toBe('not_found');
    expect(factMap(result)[`${P}.found`]).toBe(false);
    expect(factMap(result)[`${P}.status`]).toBeUndefined();
  });

  it('leaves the TIN unknown if that call fails', async () => {
    const result = await createCacVendorConnector({ env, fetch: fakeFetch({ ...routes, '/v3/lookup/tin': { status: 500 } }), sleep: noSleep, retries: 0, now: NOW }).lookup({ name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG' });
    expect(result.status).toBe('found');
    expect(factMap(result)[`${P}.tin_issued`]).toBeUndefined();
  });

  it('never calls the CAC portal', async () => {
    const fetchImpl = fakeFetch(routes);
    await createCacVendorConnector({ env, fetch: fetchImpl, sleep: noSleep, now: NOW }).lookup({ name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG' });
    for (const call of fetchImpl.calls) expect(call.url).not.toMatch(/cac\.gov\.ng/);
  });
});

describe('ng.ndpc_list', () => {
  const P = 'registry.ng.ndpc';
  const env = { NDPC_REGISTER_URL: 'https://services.ndpc.gov.ng/feed/hash.json' };
  const connector = (fetchImpl = fakeFetch({ 'feed/hash.json': sample('ndpc-feed.json') })) => createNdpcListConnector({ env, fetch: fetchImpl, sleep: noSleep, now: NOW });

  it('parses the feed in any case', () => {
    expect(parseNdpcFeed(sampleJson('ndpc-feed.json'))[0]).toEqual({ name: 'Sample Bank PLC', category: 'UHL', year: '2026' });
    expect(parseNdpcFeed([{ NAME: 'A', CATEGORY: 'ehl' }])[0]).toMatchObject({ name: 'A', category: 'EHL' });
  });

  it('fails loudly if the feed changes shape', async () => {
    const result = await connector(fakeFetch({ 'feed/hash.json': JSON.stringify({ surprise: true }) })).lookup({ name: 'X', jurisdiction: 'NG' });
    expect(result.status).toBe('error');
    expect(result.facts).toEqual([]);
  });

  it('takes the latest year when listed more than once', async () => {
    const result = await connector().lookup({ name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG' });
    expect(result.status).toBe('found');
    expect(factMap(result)).toMatchObject({ [`${P}.listed`]: true, [`${P}.category`]: 'EHL', [`${P}.year`]: '2026' });
    expect(result.provenance.method).toBe('official_list');
    assertPublished(result);
  });

  it('asks on a close match, not found otherwise', async () => {
    expect((await connector().lookup({ name: 'Twinpay Technologies Nigeria', jurisdiction: 'NG' })).status).toBe('ambiguous');
    const missing = await connector().lookup({ name: 'Nobody At All', jurisdiction: 'NG' });
    expect(missing.status).toBe('not_found');
    expect(factMap(missing)[`${P}.listed`]).toBe(false);
    expect(missing.message).toContain('listed under another name');
  });

  it('is an error if the feed has moved', async () => {
    const result = await connector(fakeFetch({ 'feed/hash.json': { status: 404 } })).lookup({ name: 'X', jurisdiction: 'NG' });
    expect(result.status).toBe('error');
    expect(result.message).toContain('moved');
  });
});

describe('sanctions.lists', () => {
  const P = 'registry.sanctions';
  const routes = {
    'sdn.csv': sample('ofac-sdn.csv'),
    'UK-Sanctions-List.csv': sample('uk-sanctions.csv'),
    'consolidated.xml': sample('un-list.xml'),
  };
  const connector = (fetchImpl = fakeFetch(routes), lists = 'ofac,uk,un') => createSanctionsConnector({ env: { SANCTIONS_LISTS: lists }, fetch: fetchImpl, sleep: noSleep, retries: 0, now: NOW });

  it('reads OFAC entities only', () => {
    expect(parseOfacCsv(sample('ofac-sdn.csv'))).toEqual(['AEROCARIBBEAN AIRLINES', 'ANGLO-CARIBBEAN CO., LTD.', 'SANCTIONED PAY LTD']);
  });

  it('reads UK entities only, skipping the report date line', () => {
    expect(parseUkCsv(sample('uk-sanctions.csv'))).toEqual(['SAMPLE MONEY EXCHANGE', 'SAMPLE EXCHANGE TWO']);
    expect(() => parseUkCsv('a,b\n1,2\n')).toThrow("isn't in the format");
  });

  it('reads UN entities and aliases, not individuals', () => {
    expect(parseUnXml(sample('un-list.xml'))).toEqual(['SAMPLE FRONT COMPANY', 'SAMPLE FRONT', 'THIRD NAME TRADING']);
    expect(() => parseUnXml('<other/>')).toThrow("isn't in the format");
  });

  it('separates exact from possible', () => {
    const listed = ['SANCTIONED PAY LTD'];
    expect(screenName('Sanctioned Pay Limited', listed).exact).toHaveLength(1);
    expect(screenName('Sanctioned Pays', listed).possible).toHaveLength(1);
    expect(screenName('Kestrel Pay', listed)).toEqual({ exact: [], possible: [] });
  });

  it('chooses lists from the env', () => {
    expect(chosenLists('ofac, UK,nope')).toEqual(['ofac', 'uk']);
    expect(chosenLists(undefined)).toEqual([]);
  });

  it('a clean result is no match, across every list', async () => {
    const result = await connector().lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('not_found');
    expect(factMap(result)).toMatchObject({ [`${P}.match`]: false, [`${P}.possible_match`]: false, [`${P}.lists_checked`]: ['OFAC SDN', 'UK Sanctions List', 'UN Consolidated List'] });
    expect(result.message).toContain('we checked today');
    assertPublished(result);
  });

  it('an exact match is flagged', async () => {
    const result = await connector().lookup({ name: 'Sanctioned Pay Limited', jurisdiction: 'US-DE' });
    expect(result.status).toBe('found');
    expect(factMap(result)[`${P}.match`]).toBe(true);
  });

  it('a near match goes to a person', async () => {
    const result = await connector().lookup({ name: 'Sanctioned Pays', jurisdiction: 'US-DE' });
    expect(result.status).toBe('ambiguous');
    expect(factMap(result)[`${P}.possible_match`]).toBe(true);
  });

  it('cannot say "no match" if a list could not be read', async () => {
    const result = await connector(fakeFetch({ ...routes, 'consolidated.xml': { status: 500 } })).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('error');
    expect(result.facts).toEqual([]);
  });

  it('cannot say "no match" if a list came back empty', async () => {
    const result = await connector(fakeFetch({ 'sdn.csv': '' }), 'ofac').lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
    expect(result.status).toBe('error');
  });

  it('downloads each list once a day, not once a lookup', async () => {
    const fetchImpl = fakeFetch(routes);
    const c = connector(fetchImpl);
    await c.lookup({ name: 'A Ltd', jurisdiction: 'GB' });
    await c.lookup({ name: 'B Ltd', jurisdiction: 'GB' });
    expect(fetchImpl.calls).toHaveLength(3);
  });

  it('gives a large list time to download, well past the usual 10 seconds', async () => {
    vi.useFakeTimers();
    try {
      const slow = (async () => {
        await new Promise((resolve) => setTimeout(resolve, 90_000));
        return new Response(sample('ofac-sdn.csv'));
      }) as NonNullable<Parameters<typeof createSanctionsConnector>[0]['fetch']>;
      const pending = createSanctionsConnector({ env: { SANCTIONS_LISTS: 'ofac' }, fetch: slow, sleep: noSleep, retries: 0, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
      await vi.advanceTimersByTimeAsync(90_000);
      expect((await pending).status).toBe('not_found');
    } finally {
      vi.useRealTimers();
    }
  });

  it('still gives up on a list that never arrives', async () => {
    vi.useFakeTimers();
    try {
      const hanging = ((_url: string, init?: RequestInit) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      })) as NonNullable<Parameters<typeof createSanctionsConnector>[0]['fetch']>;
      const pending = createSanctionsConnector({ env: { SANCTIONS_LISTS: 'ofac' }, fetch: hanging, sleep: noSleep, retries: 0, now: NOW }).lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE' });
      await vi.advanceTimersByTimeAsync(LIST_DOWNLOAD_TIMEOUT_MS);
      const result = await pending;
      expect(result.status).toBe('error');
      expect(result.facts).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('is unavailable if the setting names no real list', async () => {
    expect((await connector(fakeFetch({}), 'nope').lookup({ name: 'A', jurisdiction: 'GB' })).status).toBe('unavailable');
  });
});

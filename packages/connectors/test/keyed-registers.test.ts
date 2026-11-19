import { describe, expect, it } from 'vitest';
import {
  AU_NOT_IN_REGISTER, CA_MESSAGES, createAbrConnector, createCanadaCorporationsConnector, createConnectors, createCroConnector, createDanishCvrConnector,
  createFixtureConnectors, createKvkConnector, createNzCompaniesConnector, DK_NOT_IN_REGISTER, IE_NOT_IN_REGISTER, isValidAbn, isValidAcn, isValidCvr,
  isValidNzbn, KESTREL_NATIONAL_NUMBERS, missingSettings, NL_NOT_IN_REGISTER, NZ_NOT_IN_REGISTER, redactBody, redactUrl, SOURCE_FACTORIES, unwrapJsonp,
  type CompanyRef, type Connector, type ConnectorDeps,
} from '../src/index.js';
import { factMap, fakeFetch, noSleep, sample } from './helpers.js';

/**
 * The national registers that need a key (DK, AU, NZ, CA, NL, IE). Every reply here is a
 * hand-made fictional sample built from the official documentation: no real API is called,
 * because none can be without a key. Kestrel Pay, its numbers and the people are made up.
 */

const NOW = () => new Date('2026-11-16T09:00:00Z');
const PEOPLE = ['Ondine', 'Fictivus', 'Ignatius', 'Exempel', 'Camille', 'Dominique', 'Ancien', 'Home Lane', 'Thuisweg', 'ondine@'];
const N = KESTREL_NATIONAL_NUMBERS;

interface Spec {
  create: (deps: ConnectorDeps) => Connector;
  env: Record<string, string>;
  jurisdiction: string;
  number: string;
  host: string;
  name: string;
}

const SPECS: Record<string, Spec> = {
  'dk.cvr': { create: createDanishCvrConnector, env: { DK_CVR_USERNAME: 'vero', DK_CVR_PASSWORD: 'pw' }, jurisdiction: 'DK', number: N.DK, host: 'distribution.virk.dk', name: 'Kestrel Pay ApS' },
  'au.abr': { create: createAbrConnector, env: { AU_ABR_GUID: '00000000-guid' }, jurisdiction: 'AU', number: N.AU_ABN, host: 'abr.business.gov.au', name: 'Kestrel Pay Pty Ltd' },
  'nz.companies': { create: createNzCompaniesConnector, env: { NZ_NZBN_API_KEY: 'nz-key' }, jurisdiction: 'NZ', number: N.NZ, host: 'api.business.govt.nz', name: 'Kestrel Pay Limited' },
  'ca.corporations': { create: createCanadaCorporationsConnector, env: { CA_CORPORATIONS_API_KEY: 'ca-key' }, jurisdiction: 'CA', number: '9876543-2', host: 'ised-isde.canada.ca', name: 'Kestrel Pay Inc.' },
  'nl.kvk': { create: createKvkConnector, env: { NL_KVK_API_KEY: 'nl-key' }, jurisdiction: 'NL', number: N.NL, host: 'api.kvk.nl', name: 'Kestrel Pay B.V.' },
  'ie.cro': { create: createCroConnector, env: { IE_CRO_EMAIL: 'checks@vero.example', IE_CRO_API_KEY: 'ie-key' }, jurisdiction: 'IE', number: N.IE, host: 'services.cro.ie', name: 'Kestrel Pay Limited' },
};

function build(id: string, routes: Parameters<typeof fakeFetch>[0], env?: Record<string, string>) {
  const spec = SPECS[id] as Spec;
  const fetchImpl = fakeFetch(routes);
  const connector = spec.create({ env: env ?? spec.env, fetch: fetchImpl, now: NOW, sleep: noSleep, retries: 1 });
  return { connector, fetchImpl, spec };
}

function byNumber(spec: Spec, number = spec.number): CompanyRef {
  return { name: spec.name, jurisdiction: spec.jurisdiction, registry_number: number };
}

function noPeople(value: unknown) {
  const text = JSON.stringify(value);
  for (const word of PEOPLE) expect(text, word).not.toContain(word);
}

describe('number checks', () => {
  it('Danish CVR: 8 digits, modulus 11', () => {
    expect(isValidCvr(N.DK)).toBe(true);
    expect(isValidCvr('28866984')).toBe(true);
    expect(isValidCvr('31415927')).toBe(false);
    expect(isValidCvr('0000000')).toBe(false);
    expect(isValidCvr('01234567')).toBe(false);
  });

  it('Australian ABN and ACN, as published', () => {
    expect(isValidAbn('74 172 177 893')).toBe(true);
    expect(isValidAbn(N.AU_ABN)).toBe(true);
    expect(isValidAbn('74172177894')).toBe(false);
    expect(isValidAcn('004 085 616')).toBe(true);
    expect(isValidAcn('000000019')).toBe(true);
    expect(isValidAcn(N.AU_ACN)).toBe(true);
    expect(isValidAcn('004085617')).toBe(false);
  });

  it('NZBN: GS1 check digit', () => {
    expect(isValidNzbn('9429041752715')).toBe(true);
    expect(isValidNzbn('9429000106078')).toBe(true);
    expect(isValidNzbn(N.NZ)).toBe(true);
    expect(isValidNzbn('9429041752716')).toBe(false);
  });

  it('reads JSONP with or without a callback name', () => {
    expect(unwrapJsonp('callback({"a":1})')).toEqual({ a: 1 });
    expect(unwrapJsonp('{"a":1}')).toEqual({ a: 1 });
  });
});

describe.each(Object.keys(SPECS))('%s, common behaviour', (id) => {
  it('is off, and calls nothing, until its settings are set', async () => {
    const { connector, fetchImpl, spec } = build(id, {}, {});
    const result = await connector.lookup(byNumber(spec));
    expect(result.status).toBe('unavailable');
    expect(result.message).toContain("isn't connected yet");
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('a refused key is "unavailable" with a plain reason, never a problem with the company', async () => {
    const { connector, spec } = build(id, { [SPECS[id]!.host]: { status: 401, body: '{}' } });
    const result = await connector.lookup(byNumber(spec));
    expect(result.status).toBe('unavailable');
    expect(result.facts).toEqual([]);
    expect(result.message).toContain('not a problem with your company');
    expect(result.message).not.toMatch(/doesn't exist|not found/i);
  });

  it('a source that is down is an error, with no facts', async () => {
    const { connector, spec } = build(id, { [SPECS[id]!.host]: { status: 503 } });
    const result = await connector.lookup(byNumber(spec));
    expect(result.status).toBe('error');
    expect(result.facts).toEqual([]);
    expect(result.message).toContain('had a problem on its side');
  });

  it('a source that keeps asking us to slow down is an error, after waiting', async () => {
    const { connector, spec, fetchImpl } = build(id, { [SPECS[id]!.host]: { status: 429, headers: { 'retry-after': '1' } } });
    const result = await connector.lookup(byNumber(spec));
    expect(result.status).toBe('error');
    expect(result.message).toContain('asked us to slow down');
    expect(fetchImpl.calls.length).toBe(2);
  });

  it('refuses a malformed number without asking anyone', async () => {
    const { connector, fetchImpl, spec } = build(id, {});
    const result = await connector.lookup(byNumber(spec, '12-AB'));
    expect(result.status).toBe('unsupported');
    expect(result.message).toContain("doesn't look right");
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('is registered, off by default, and recordable', () => {
    const live = createConnectors({ env: {} });
    expect(live.map((c) => c.id)).toContain(id);
    expect(SOURCE_FACTORIES[id]).toBeDefined();
    expect(missingSettings(id, {})).toEqual(Object.keys(SPECS[id]!.env));
    expect(createFixtureConnectors({}, NOW).map((c) => c.id)).toContain(id);
  });
});

describe('dk.cvr', () => {
  it('finds a CVR number and keeps only counts of current managers', async () => {
    const { connector, fetchImpl } = build('dk.cvr', { _search: sample('dk-company.json') });
    const result = await connector.lookup(byNumber(SPECS['dk.cvr']!));
    expect(result.status).toBe('found');
    const call = fetchImpl.calls[0];
    expect(call?.url).toBe('http://distribution.virk.dk/cvr-permanent/virksomhed/_search');
    expect(call?.init?.method).toBe('POST');
    expect(JSON.parse(call?.init?.body as string)).toEqual({ query: { term: { 'Vrvirksomhed.cvrNummer': 31415926 } }, size: 1 });
    expect((call?.init?.headers as Record<string, string>)['Authorization']).toBe(`Basic ${Buffer.from('vero:pw').toString('base64')}`);
    expect(factMap(result)).toEqual({
      'registry.dk.cvr.identified': true,
      'registry.dk.cvr.cvr_number': '31415926',
      'registry.dk.cvr.registered_name': 'Kestrel Pay ApS',
      'registry.dk.cvr.legal_form_code': '80',
      'registry.dk.cvr.legal_form': 'APS',
      'registry.dk.cvr.status': 'normal',
      'registry.dk.cvr.founded_on': '2024-03-01',
      'registry.dk.cvr.industry_code': '620100',
      'registry.dk.cvr.postcode': '2100',
      'registry.dk.cvr.municipality': 'KØBENHAVN',
      'registry.dk.cvr.production_units_count': 1,
      // One current executive; the board member left in 2025; the owner company is neither.
      'registry.dk.cvr.executive_members_count': 1,
      'registry.dk.cvr.board_members_count': 0,
    });
    noPeople(result);
  });

  it('finds by name, never offers a sole proprietorship, and sends the name as a phrase, not query syntax', async () => {
    const { connector, fetchImpl } = build('dk.cvr', { _search: sample('dk-search.json') });
    const result = await connector.lookup({ name: 'KESTREL PAY A/S', jurisdiction: 'DK' });
    expect(result.status).toBe('found');
    expect(result.matchConfidence).toBe(0.95);
    const body = JSON.parse(fetchImpl.calls[0]?.init?.body as string) as { query: Record<string, unknown> };
    expect(body.query['match_phrase']).toBeDefined();
    noPeople(result);
  });

  it('several close names are ambiguous, people left out', async () => {
    const { connector } = build('dk.cvr', { _search: sample('dk-search.json') });
    const result = await connector.lookup({ name: 'Kestrel Pay Group', jurisdiction: 'DK' });
    expect(result.status).toBe('ambiguous');
    expect(result.candidates?.map((c) => c.identifier)).toEqual(['31415926', '10000009']);
    noPeople(result);
  });

  it('a sole proprietorship found by number keeps nothing', async () => {
    const one = JSON.parse(sample('dk-search.json')) as { hits: { hits: unknown[] } };
    const body = JSON.stringify({ hits: { hits: [one.hits.hits[1]] } });
    const result = await build('dk.cvr', { _search: body }).connector.lookup({ name: 'x', jurisdiction: 'DK', registry_number: '12345674' });
    expect(result.status).toBe('not_found');
    expect(factMap(result)).toEqual({ 'registry.dk.cvr.identified': null });
    expect(result.message).toBe(DK_NOT_IN_REGISTER.person);
    noPeople(result);
  });

  it('a miss never says the company does not exist', async () => {
    const result = await build('dk.cvr', { _search: JSON.stringify({ hits: { total: 0, hits: [] } }) }).connector.lookup(byNumber(SPECS['dk.cvr']!));
    expect(result.status).toBe('not_found');
    expect(factMap(result)).toEqual({ 'registry.dk.cvr.identified': null });
    expect(result.message).toContain("doesn't mean the company doesn't exist");
  });
});

describe('au.abr', () => {
  const guid = 'guid=00000000-guid';

  it('finds an ABN, and keeps the GUID out of the evidence link', async () => {
    const { connector, fetchImpl } = build('au.abr', { 'AbnDetails.aspx': sample('au-abn.json') });
    const result = await connector.lookup(byNumber(SPECS['au.abr']!, '99 987 654 320'));
    expect(result.status).toBe('found');
    expect(fetchImpl.calls[0]?.url).toBe(`https://abr.business.gov.au/json/AbnDetails.aspx?abn=99987654320&${guid}`);
    expect(result.provenance.sourceUrl).not.toContain('guid');
    expect(factMap(result)).toEqual({
      'registry.au.abr.identified': true,
      'registry.au.abr.abn': '99987654320',
      'registry.au.abr.acn': '987654320',
      'registry.au.abr.registered_name': 'KESTREL PAY PTY LTD',
      'registry.au.abr.abn_status': 'active',
      'registry.au.abr.abn_status_from': '2024-03-01',
      'registry.au.abr.entity_type_code': 'PRV',
      'registry.au.abr.entity_type': 'Australian Private Company',
      'registry.au.abr.gst_registered': true,
      'registry.au.abr.gst_registered_from': '2024-04-01',
      'registry.au.abr.state': 'NSW',
      'registry.au.abr.postcode': '2000',
    });
  });

  it('reads an ACN through AcnDetails', async () => {
    const { connector, fetchImpl } = build('au.abr', { 'AcnDetails.aspx': sample('au-abn.json') });
    const result = await connector.lookup(byNumber(SPECS['au.abr']!, N.AU_ACN));
    expect(result.status).toBe('found');
    expect(fetchImpl.calls[0]?.url).toContain('AcnDetails.aspx?acn=987654320');
  });

  it('an individual or sole trader is never kept, by number or as a candidate', async () => {
    const individual = 'callback({"Abn":"10987654320","AbnStatus":"Active","AbnStatusEffectiveFrom":"2019-01-01","Acn":"","AddressDate":null,"AddressPostcode":"3000","AddressState":"VIC","BusinessName":["KESTREL PAY"],"EntityName":"FICTIVUS, ONDINE","EntityTypeCode":"IND","EntityTypeName":"Individual/Sole Trader","Gst":null,"Message":""})';
    const direct = await build('au.abr', { 'AbnDetails.aspx': individual }).connector.lookup({ name: 'x', jurisdiction: 'AU', registry_number: '10987654320' });
    expect(direct.status).toBe('not_found');
    expect(direct.message).toBe(AU_NOT_IN_REGISTER.person);
    expect(factMap(direct)).toEqual({ 'registry.au.abr.identified': null });
    noPeople(direct);

    // Both names normalise to "kestrel pay"; once the individual is out, one company is left.
    const { connector, fetchImpl } = build('au.abr', {
      'MatchingNames.aspx': sample('au-names.json'),
      'abn=99987654320': sample('au-abn.json'),
      'abn=10987654320': individual,
    });
    const byName = await connector.lookup({ name: 'Kestrel Pay Pty Ltd', jurisdiction: 'AU' });
    expect(byName.status).toBe('found');
    expect(byName.matchConfidence).toBe(0.95);
    expect(fetchImpl.calls.map((c) => c.url).filter((u) => u.includes('AbnDetails'))).toHaveLength(2);
    noPeople(byName);
  });

  it('several companies are ambiguous', async () => {
    const other = sample('au-abn.json').replace('"Abn":"99987654320"', '"Abn":"10987654320"').replace('KESTREL PAY PTY LTD', 'KESTREL PAYMENTS PTY LTD');
    const { connector } = build('au.abr', { 'MatchingNames.aspx': sample('au-names.json'), 'abn=99987654320': sample('au-abn.json'), 'abn=10987654320': other });
    const result = await connector.lookup({ name: 'Kestrel Pay Group', jurisdiction: 'AU' });
    expect(result.status).toBe('ambiguous');
    expect(result.candidates).toEqual([{ name: 'KESTREL PAY PTY LTD', identifier: '99987654320' }, { name: 'KESTREL PAYMENTS PTY LTD', identifier: '10987654320' }]);
  });

  it('"No records found" is a miss that never says the company does not exist', async () => {
    const empty = 'callback({"Abn":"","AbnStatus":"","Acn":"","AddressDate":null,"BusinessName":[],"EntityName":"","Gst":null,"Message":"No records found"})';
    const result = await build('au.abr', { 'AbnDetails.aspx': empty }).connector.lookup(byNumber(SPECS['au.abr']!));
    expect(result.status).toBe('not_found');
    expect(result.message).toContain("doesn't mean the company doesn't exist");
    const byName = await build('au.abr', { 'MatchingNames.aspx': 'callback({"Message":"","Names":[]})' }).connector.lookup({ name: 'Nobody Pty Ltd', jurisdiction: 'AU' });
    expect(byName.status).toBe('not_found');
    expect(byName.message).toBe(AU_NOT_IN_REGISTER.name);
  });

  it('an unrecognised GUID (HTTP 200 with a message) is "unavailable", not a company problem', async () => {
    const refused = 'callback({"Abn":"","EntityName":"","Gst":null,"Message":"The GUID entered is not recognised as a Registered Party"})';
    const result = await build('au.abr', { 'AbnDetails.aspx': refused }).connector.lookup(byNumber(SPECS['au.abr']!));
    expect(result.status).toBe('unavailable');
    expect(result.message).toContain('not a problem with your company');
  });

  it('an ABN that fails the check is refused without a call', async () => {
    const { connector, fetchImpl } = build('au.abr', {});
    expect((await connector.lookup(byNumber(SPECS['au.abr']!, '99987654321'))).status).toBe('unsupported');
    expect(fetchImpl.calls).toHaveLength(0);
  });
});

describe('nz.companies', () => {
  it('finds an NZBN and counts current directors only', async () => {
    const { connector, fetchImpl } = build('nz.companies', { [`/entities/${N.NZ}`]: sample('nz-entity.json') });
    const result = await connector.lookup(byNumber(SPECS['nz.companies']!));
    expect(result.status).toBe('found');
    expect(fetchImpl.calls[0]?.url).toBe(`https://api.business.govt.nz/gateway/nzbn/v5/entities/${N.NZ}`);
    expect((fetchImpl.calls[0]?.init?.headers as Record<string, string>)['Ocp-Apim-Subscription-Key']).toBe('nz-key');
    expect(factMap(result)).toEqual({
      'registry.nz.companies.identified': true,
      'registry.nz.companies.nzbn': N.NZ,
      'registry.nz.companies.company_number': '9999901',
      'registry.nz.companies.registered_name': 'KESTREL PAY LIMITED',
      'registry.nz.companies.status_code': '50',
      'registry.nz.companies.status': 'registered',
      'registry.nz.companies.entity_type_code': 'LTD',
      'registry.nz.companies.entity_type': 'NZ Limited Company',
      'registry.nz.companies.incorporated_on': '2024-03-01',
      'registry.nz.companies.annual_return_filing_month': 3,
      'registry.nz.companies.annual_return_last_filed_on': '2026-03-12',
      'registry.nz.companies.directors_count': 2,
      'registry.nz.companies.directors_entity_count': 0,
    });
    noPeople(result);
  });

  it('finds by name; a sole trader is never offered', async () => {
    const { connector } = build('nz.companies', { '/entities?search-term=': sample('nz-search.json'), [`/entities/${N.NZ}`]: sample('nz-entity.json') });
    const result = await connector.lookup({ name: 'Kestrel Pay Ltd', jurisdiction: 'NZ' });
    expect(result.status).toBe('found');
    expect(result.matchConfidence).toBe(0.95);
    noPeople(result);
    const close = await build('nz.companies', { '/entities?search-term=': sample('nz-search.json') }).connector.lookup({ name: 'Kestrel Pay Group', jurisdiction: 'NZ' });
    expect(close.status).toBe('ambiguous');
    expect(close.candidates?.map((c) => c.identifier)).toEqual([N.NZ, '9429000001236']);
    noPeople(close);
  });

  it('finds a company number through the search, only when the result carries it', async () => {
    const { connector } = build('nz.companies', { '/entities?search-term=9999901': sample('nz-search.json'), [`/entities/${N.NZ}`]: sample('nz-entity.json') });
    expect((await connector.lookup(byNumber(SPECS['nz.companies']!, '9999901'))).status).toBe('found');
    const miss = await build('nz.companies', { '/entities?search-term=': sample('nz-search.json') }).connector.lookup(byNumber(SPECS['nz.companies']!, '1234'));
    expect(miss.status).toBe('not_found');
  });

  it('a sole trader found by NZBN keeps nothing; a 404 never says the company does not exist', async () => {
    const trader = JSON.stringify({ nzbn: '9429123456784', entityName: 'ONDINE FICTIVUS', entityTypeCode: 'Sole_Trader', entityTypeDescription: 'Sole Trader', entityStatusCode: '50' });
    const person = await build('nz.companies', { '/entities/': trader }).connector.lookup(byNumber(SPECS['nz.companies']!, '9429123456784'));
    expect(person.status).toBe('not_found');
    expect(person.message).toBe(NZ_NOT_IN_REGISTER.person);
    noPeople(person);
    const miss = await build('nz.companies', { '/entities/': { status: 404, body: '{"errorCode":"404"}' } }).connector.lookup(byNumber(SPECS['nz.companies']!));
    expect(miss.status).toBe('not_found');
    expect(factMap(miss)).toEqual({ 'registry.nz.companies.identified': null });
    expect(miss.message).toContain("doesn't mean the company doesn't exist");
  });

  it('an NZBN that fails the check is refused without a call', async () => {
    const { connector, fetchImpl } = build('nz.companies', {});
    expect((await connector.lookup(byNumber(SPECS['nz.companies']!, '9429999999997'))).status).toBe('unsupported');
    expect(fetchImpl.calls).toHaveLength(0);
  });
});

describe('ca.corporations', () => {
  it('finds a federal corporation by number and counts its directors without naming them', async () => {
    const { connector, fetchImpl } = build('ca.corporations', { '/v1/corporations/': sample('ca-corporation.json'), '/directors': sample('ca-directors.json') });
    const result = await connector.lookup(byNumber(SPECS['ca.corporations']!));
    expect(result.status).toBe('found');
    expect(fetchImpl.calls[0]?.url).toBe('https://apigateway-passerelledapi.ised-isde.canada.ca/corporations/api/v1/corporations/98765432.json?lang=eng');
    expect((fetchImpl.calls[0]?.init?.headers as Record<string, string>)['user-key']).toBe('ca-key');
    expect(factMap(result)).toEqual({
      'registry.ca.corporations.identified': true,
      'registry.ca.corporations.corporation_number': '98765432',
      'registry.ca.corporations.registered_name': 'Kestrel Pay Inc.',
      'registry.ca.corporations.status': 'active',
      'registry.ca.corporations.act': 'Canada Business Corporations Act',
      'registry.ca.corporations.incorporated_on': '2024-03-01',
      'registry.ca.corporations.last_annual_return_year': 2026,
      'registry.ca.corporations.directors_minimum': 1,
      'registry.ca.corporations.directors_maximum': 10,
      'registry.ca.corporations.directors_count': 2,
    });
    noPeople(result);
  });

  it('a name alone is "unsupported": the API has no name search, and it says the register is federal only', async () => {
    const { connector, fetchImpl } = build('ca.corporations', {});
    const result = await connector.lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'CA' });
    expect(result.status).toBe('unsupported');
    expect(result.message).toBe(CA_MESSAGES.needsNumber);
    expect(result.message).toContain('federal corporations only');
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('a miss (HTTP 200 with messages) says "not a federal corporation in this register", never "does not exist"', async () => {
    const { connector } = build('ca.corporations', { '/v1/corporations/': '["could not find corporation 98765432","Corporation 98765432 est inconnu."]' });
    const result = await connector.lookup(byNumber(SPECS['ca.corporations']!));
    expect(result.status).toBe('not_found');
    expect(factMap(result)).toEqual({ 'registry.ca.corporations.identified': null });
    expect(result.message).toContain("province's or territory's law");
    expect(result.message).toContain("doesn't mean the company doesn't exist");
  });

  it('the directors list being down leaves only that count unknown', async () => {
    const { connector } = build('ca.corporations', { '/v1/corporations/': sample('ca-corporation.json'), '/directors': { status: 500 } });
    const result = await connector.lookup(byNumber(SPECS['ca.corporations']!));
    expect(result.status).toBe('found');
    expect(factMap(result)['registry.ca.corporations.directors_count']).toBeUndefined();
  });
});

describe('nl.kvk', () => {
  it('finds a KVK number, with its establishments count', async () => {
    const { connector, fetchImpl } = build('nl.kvk', { '/basisprofielen/99912345': sample('nl-basisprofiel.json'), '/vestigingen': '{"kvkNummer":"99912345","totaalAantalVestigingen":2,"vestigingen":[]}' });
    const result = await connector.lookup(byNumber(SPECS['nl.kvk']!));
    expect(result.status).toBe('found');
    expect(fetchImpl.calls[0]?.url).toBe('https://api.kvk.nl/api/v1/basisprofielen/99912345');
    expect((fetchImpl.calls[0]?.init?.headers as Record<string, string>)['apikey']).toBe('nl-key');
    expect(factMap(result)).toEqual({
      'registry.nl.kvk.identified': true,
      'registry.nl.kvk.kvk_number': '99912345',
      'registry.nl.kvk.registered_name': 'Kestrel Pay B.V.',
      'registry.nl.kvk.legal_form': 'BeslotenVennootschap',
      'registry.nl.kvk.legal_form_detail': 'Besloten Vennootschap',
      'registry.nl.kvk.registered_on': '2024-03-01',
      'registry.nl.kvk.started_on': '2024-03-01',
      'registry.nl.kvk.active': true,
      'registry.nl.kvk.sbi_code': '62010',
      'registry.nl.kvk.sbi_codes': ['6201', '62010'],
      'registry.nl.kvk.establishments_count': 2,
    });
  });

  it('finds by name through the free search; a row with no RSIN (maybe a person) is never offered', async () => {
    const { connector, fetchImpl } = build('nl.kvk', { '/zoeken': sample('nl-zoeken.json'), '/basisprofielen/99912345': sample('nl-basisprofiel.json'), '/vestigingen': '{"totaalAantalVestigingen":1}' });
    const result = await connector.lookup({ name: 'KESTREL PAY BV', jurisdiction: 'NL' });
    expect(result.status).toBe('found');
    expect(result.matchConfidence).toBe(0.95);
    expect(fetchImpl.calls[0]?.url).toContain('/v2/zoeken?naam=KESTREL%20PAY%20BV');
    const close = await build('nl.kvk', { '/zoeken': sample('nl-zoeken.json') }).connector.lookup({ name: 'Kestrel Pay Group', jurisdiction: 'NL' });
    expect(close.status).toBe('ambiguous');
    expect(close.candidates?.map((c) => c.identifier)).toEqual(['99912345', '99912361']);
    noPeople(close);
  });

  it('an eenmanszaak keeps nothing', async () => {
    const person = JSON.stringify({ kvkNummer: '99912353', naam: 'Kestrel Pay O. Fictivus', _embedded: { eigenaar: { rechtsvorm: 'Eenmanszaak', adressen: [{ straatnaam: 'Thuisweg' }] } } });
    const result = await build('nl.kvk', { '/basisprofielen/': person }).connector.lookup(byNumber(SPECS['nl.kvk']!, '99912353'));
    expect(result.status).toBe('not_found');
    expect(result.message).toBe(NL_NOT_IN_REGISTER.person);
    noPeople(result);
  });

  it('IPD0005 is a miss; IPD1003 is a source problem; IPD0004 is a bad number', async () => {
    const reply = (status: number, code: string) => ({ status, body: JSON.stringify({ fout: [{ code, omschrijving: 'x' }] }) });
    const miss = await build('nl.kvk', { '/basisprofielen/': reply(404, 'IPD0005') }).connector.lookup(byNumber(SPECS['nl.kvk']!));
    expect(miss.status).toBe('not_found');
    expect(miss.message).toContain("doesn't mean the company doesn't exist");
    expect((await build('nl.kvk', { '/basisprofielen/': reply(404, 'IPD1003') }).connector.lookup(byNumber(SPECS['nl.kvk']!))).status).toBe('error');
    expect((await build('nl.kvk', { '/basisprofielen/': reply(400, 'IPD0004') }).connector.lookup(byNumber(SPECS['nl.kvk']!))).status).toBe('unsupported');
    const none = await build('nl.kvk', { '/zoeken': reply(404, 'IPD5200') }).connector.lookup({ name: 'Nobody B.V.', jurisdiction: 'NL' });
    expect(none.status).toBe('not_found');
    expect(none.message).toBe(NL_NOT_IN_REGISTER.name);
  });
});

describe('ie.cro', () => {
  it('finds a CRO number on the company register', async () => {
    const { connector, fetchImpl } = build('ie.cro', { '/company/999990/C': sample('ie-company.json') });
    const result = await connector.lookup(byNumber(SPECS['ie.cro']!));
    expect(result.status).toBe('found');
    expect(fetchImpl.calls[0]?.url).toBe('https://services.cro.ie/cws/company/999990/C?format=Json&htmlEnc=0');
    expect((fetchImpl.calls[0]?.init?.headers as Record<string, string>)['Authorization']).toBe(`Basic ${Buffer.from('checks@vero.example:ie-key').toString('base64')}`);
    expect(factMap(result)).toEqual({
      'registry.ie.cro.identified': true,
      'registry.ie.cro.company_number': '999990',
      'registry.ie.cro.registered_name': 'KESTREL PAY LIMITED',
      'registry.ie.cro.status': 'normal',
      'registry.ie.cro.status_code': '1',
      'registry.ie.cro.status_since': '2024-03-01',
      'registry.ie.cro.company_type': 'LTD - Private Company Limited by Shares',
      'registry.ie.cro.company_type_code': '1',
      'registry.ie.cro.registered_on': '2024-03-01',
      'registry.ie.cro.last_annual_return_on': '2026-03-01',
      'registry.ie.cro.next_annual_return_due': '2027-03-01',
      'registry.ie.cro.last_accounts_on': '2025-12-31',
    });
    expect(JSON.stringify(result)).not.toContain('FICTIVE');
  });

  it('finds by name on the company register only (never business names, where sole traders are)', async () => {
    const { connector, fetchImpl } = build('ie.cro', { '/companies?': sample('ie-companies.json') });
    const result = await connector.lookup({ name: 'Kestrel Pay Ltd', jurisdiction: 'IE' });
    expect(result.status).toBe('found');
    expect(fetchImpl.calls[0]?.url).toContain('company_name=Kestrel%20Pay&company_bus_ind=C');
    const close = await connector.lookup({ name: 'Kestrel Pay Group', jurisdiction: 'IE' });
    expect(close.status).toBe('ambiguous');
    expect(close.candidates).toEqual([{ name: 'KESTREL PAY LIMITED', identifier: '999990' }]);
    // Names come back HTML-encoded; they are compared and kept decoded.
    const encoded = await connector.lookup({ name: 'Kestrel Pay & Co. Holdings DAC', jurisdiction: 'IE' });
    expect(encoded.status).toBe('found');
    expect(factMap(encoded)['registry.ie.cro.registered_name']).toBe('KESTREL PAY & CO. HOLDINGS DAC');
  });

  it('an unknown number comes back empty: a miss that never says the company does not exist', async () => {
    const empty = JSON.stringify({ company_num: 0, company_bus_ind: null, company_name: null, company_reg_date: null });
    const result = await build('ie.cro', { '/company/': empty }).connector.lookup(byNumber(SPECS['ie.cro']!));
    expect(result.status).toBe('not_found');
    expect(result.message).toBe(IE_NOT_IN_REGISTER.number);
    expect(factMap(result)).toEqual({ 'registry.ie.cro.identified': null });
  });
});

describe('recordings of these registers', () => {
  it('drop people and the ABN Lookup GUID', () => {
    for (const name of ['dk-company.json', 'dk-search.json', 'nz-entity.json', 'nz-search.json', 'ca-directors.json', 'nl-zoeken.json']) {
      const text = redactBody(sample(name));
      for (const word of PEOPLE) expect(text, `${name}: ${word}`).not.toContain(word);
    }
    // Company records stay readable for checking the parsers.
    expect(redactBody(sample('dk-company.json'))).toContain('Kestrel Pay ApS');
    expect(redactBody(sample('nz-entity.json'))).toContain('KESTREL PAY LIMITED');
    expect(redactUrl('https://abr.business.gov.au/json/AbnDetails.aspx?abn=99987654320&guid=abc-123')).not.toContain('abc-123');
  });
});

describe('fixture mode', () => {
  it('each register has a labelled sample whose number passes the check', async () => {
    const fixtures = createFixtureConnectors({}, NOW);
    for (const [id, spec] of Object.entries(SPECS)) {
      const connector = fixtures.find((c) => c.id === id);
      const result = await connector!.lookup({ name: spec.name, jurisdiction: spec.jurisdiction });
      expect(result.status, id).toBe('found');
      expect(result.provenance.fixture).toBe(true);
    }
    expect(isValidCvr(N.DK) && isValidAbn(N.AU_ABN) && isValidAcn(N.AU_ACN) && isValidNzbn(N.NZ)).toBe(true);
  });
});

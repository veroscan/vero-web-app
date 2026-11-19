import { describe, expect, it } from 'vitest';
import {
  CH_WORDS, CONNECTOR_FACT_KEYS, createAcraConnector, createAresConnector, createBrregConnector, createConnectors, createFixtureConnectors, createKrsConnector, createPrhConnector,
  createZefixConnector, CZ_WORDS, FI_WORDS, formatSwissUid, isValidCzechIco, isValidFinnishBusinessId, isValidNorwegianOrgNumber, isValidSwissUid, KESTREL_KEYLESS_NUMBERS,
  normaliseFinnishBusinessId, normaliseNationalName, normalisePolishKrs, normaliseSingaporeUen, NO_WORDS, PL_WORDS, redactBody, SG_WORDS,
  type Connector, type ConnectorDeps, type SourceResult,
} from '../src/index.js';
import { factMap, fakeFetch, sample } from './helpers.js';

/**
 * The national registers that need no key: Norway, Finland, Czechia, Poland, Singapore and
 * Switzerland. Every response here is a hand-made sample shaped like the official documentation
 * and the real replies of 16 Nov 2026. Kestrel Pay and the people in the samples are made up;
 * the numbers pass each country's check and were confirmed unused (except Switzerland's).
 */

const NOW = new Date('2026-11-16T09:00:00Z');
const UA = { PUBLIC_API_USER_AGENT: 'VeroScan-test' };
const PUBLISHED: ReadonlySet<string> = new Set(CONNECTOR_FACT_KEYS);

type Factory = (deps: ConnectorDeps) => Connector;
type Routes = Parameters<typeof fakeFetch>[0];

function build(factory: Factory, routes: Routes, env: Record<string, string> = UA) {
  const fetchImpl = fakeFetch(routes);
  const sleeps: number[] = [];
  const connector = factory({ env, fetch: fetchImpl, now: () => NOW, sleep: async (ms) => { sleeps.push(ms); }, retries: 2 });
  return { connector, fetchImpl, sleeps };
}

function assertPublished(result: SourceResult) {
  for (const fact of result.facts) expect(PUBLISHED.has(fact.key), fact.key).toBe(true);
}

function assertNoneOf(result: SourceResult, words: readonly string[]) {
  const stored = JSON.stringify(result);
  for (const word of words) expect(stored, word).not.toContain(word);
}

const json = (value: unknown) => JSON.stringify(value);

describe('national company numbers', () => {
  it('Norway: 9 digits, mod 11', () => {
    expect(isValidNorwegianOrgNumber('923609016')).toBe(true); // Equinor ASA, real
    expect(isValidNorwegianOrgNumber('923 609 016')).toBe(true);
    expect(isValidNorwegianOrgNumber('NO 923 609 016 MVA')).toBe(true);
    expect(isValidNorwegianOrgNumber(KESTREL_KEYLESS_NUMBERS.NO)).toBe(true);
    expect(isValidNorwegianOrgNumber('923609017')).toBe(false);
    expect(isValidNorwegianOrgNumber('91234567')).toBe(false);
  });

  it('Finland: 7 digits, a dash and a check digit', () => {
    expect(isValidFinnishBusinessId('0112038-9')).toBe(true); // Nokia Oyj, real
    expect(isValidFinnishBusinessId('112038-9')).toBe(true);
    expect(normaliseFinnishBusinessId('112038-9')).toBe('0112038-9');
    expect(isValidFinnishBusinessId(KESTREL_KEYLESS_NUMBERS.FI)).toBe(true);
    expect(isValidFinnishBusinessId('0112038-8')).toBe(false);
    expect(isValidFinnishBusinessId('3456789-0')).toBe(false); // remainder 1: never issued
  });

  it('Czechia: 8 digits, mod 11', () => {
    expect(isValidCzechIco('45274649')).toBe(true); // ČEZ, real
    expect(isValidCzechIco(KESTREL_KEYLESS_NUMBERS.CZ)).toBe(true);
    expect(isValidCzechIco('45274648')).toBe(false);
  });

  it('Poland: up to 10 digits, no check digit', () => {
    expect(normalisePolishKrs('28860')).toBe('0000028860');
    expect(normalisePolishKrs('KRS 0000028860')).toBe('0000028860');
    expect(normalisePolishKrs('00000000000')).toBeNull();
    expect(normalisePolishKrs('abc')).toBeNull();
  });

  it('Singapore: the three UEN formats', () => {
    expect(normaliseSingaporeUen('197200078R')).toBe('197200078R'); // Singapore Airlines, real
    expect(normaliseSingaporeUen('53012345d')).toBe('53012345D');
    expect(normaliseSingaporeUen('T08LL1234A')).toBe('T08LL1234A');
    expect(normaliseSingaporeUen('12345')).toBeNull();
  });

  it('Switzerland: CHE and 9 digits, mod 11', () => {
    expect(isValidSwissUid('CHE-107.721.785')).toBe(true); // the OpenAPI example
    expect(isValidSwissUid(KESTREL_KEYLESS_NUMBERS.CH)).toBe(true);
    expect(isValidSwissUid('CHE-107.721.784')).toBe(false);
    expect(formatSwissUid('CHE123456788')).toBe('CHE-123.456.788');
  });

  it('names compare without their legal form', () => {
    expect(normaliseNationalName('Equinor ASA')).toBe(normaliseNationalName('EQUINOR'));
    expect(normaliseNationalName('ČEZ, a. s.')).toBe('cez');
    expect(normaliseNationalName('Kestrel Pay s. r. o.')).toBe(normaliseNationalName('KESTREL PAY, s.r.o.'));
    expect(normaliseNationalName('Kestrel Pay Pte. Ltd.')).toBe('kestrel pay');
  });
});

// ---- Shared behaviour, the same for every source ----

interface Case {
  id: string;
  jurisdiction: string;
  factory: Factory;
  words: { notFoundByName: string; notFoundByNumber: string; invalidNumber: string; person: string };
  env: Record<string, string>;
  number: string;
  badNumber: string;
  name: string;
  /** Routes for a lookup by number that finds Kestrel Pay. */
  byNumber: Routes;
  /** The route key a lookup by number calls first. */
  numberRoute: string;
  /** A reply to the number lookup that finds nothing. */
  empty: { route: string; reply: string | { status: number; body?: string } };
  expectFound: Record<string, unknown>;
  personWords: readonly string[];
}

const CASES: Case[] = [
  {
    id: 'no.brreg', jurisdiction: 'NO', factory: createBrregConnector, words: NO_WORDS, env: UA, number: KESTREL_KEYLESS_NUMBERS.NO, badNumber: '812345673', name: 'Kestrel Pay AS',
    byNumber: { '/enheter/812345672/roller': sample('no-roles.json'), '/enheter/812345672': sample('no-unit.json') }, numberRoute: '/enheter/812345672',
    empty: { route: '/enheter/812345672', reply: { status: 404 } },
    expectFound: { 'registry.no.brreg.org_number': '812345672', 'registry.no.brreg.status': 'active', 'registry.no.brreg.roles_count': 4, 'registry.no.brreg.roles_entity_count': 1 },
    personWords: ['Fiktivsen', 'Oppdiktet', 'Fratredt', '1980-01-01', '1975-05-05', '22 00 00 00', 'post@kestrelpay'],
  },
  {
    id: 'fi.prh', jurisdiction: 'FI', factory: createPrhConnector, words: FI_WORDS, env: UA, number: KESTREL_KEYLESS_NUMBERS.FI, badNumber: '1234567-2', name: 'Kestrel Pay Oy',
    byNumber: { 'businessId=1234567-1': sample('fi-company.json') }, numberRoute: 'businessId=1234567-1',
    empty: { route: 'businessId=1234567-1', reply: json({ totalResults: 0, companies: [] }) },
    expectFound: { 'registry.fi.prh.business_id': '1234567-1', 'registry.fi.prh.company_form_code': 'OY', 'registry.fi.prh.in_vat_register': true, 'registry.fi.prh.in_employer_register': false },
    personWords: ['Matti', 'Kotitie'],
  },
  {
    id: 'cz.ares', jurisdiction: 'CZ', factory: createAresConnector, words: CZ_WORDS, env: UA, number: KESTREL_KEYLESS_NUMBERS.CZ, badNumber: '87654327', name: 'Kestrel Pay s.r.o.',
    byNumber: { '/ekonomicke-subjekty/87654326': sample('cz-subject.json') }, numberRoute: '/ekonomicke-subjekty/87654326',
    empty: { route: '/ekonomicke-subjekty/87654326', reply: { status: 404, body: json({ kod: 'NENALEZENO', subKod: 'VYSTUP_SUBJEKT_NENALEZEN' }) } },
    expectFound: { 'registry.cz.ares.ico': '87654326', 'registry.cz.ares.legal_form_code': '112', 'registry.cz.ares.vat_payer': true, 'registry.cz.ares.region': 'Jihomoravský kraj' },
    personWords: ['Fiktivní', 'Domovská'],
  },
  {
    id: 'pl.krs', jurisdiction: 'PL', factory: createKrsConnector, words: PL_WORDS, env: UA, number: KESTREL_KEYLESS_NUMBERS.PL, badNumber: '12345678901', name: 'Kestrel Pay sp. z o.o.',
    byNumber: { 'OdpisAktualny/0009999999?rejestr=P': sample('pl-extract.json') }, numberRoute: 'OdpisAktualny/0009999999?rejestr=P',
    empty: { route: 'OdpisAktualny/0009999999', reply: { status: 404 } },
    expectFound: { 'registry.pl.krs.krs_number': '0009999999', 'registry.pl.krs.management_members_count': 2, 'registry.pl.krs.supervisory_members_count': 3, 'registry.pl.krs.share_capital': 5000 },
    personWords: ['F*******', 'J***', '8**********', 'FIKCYJNA', 'ANNA', '90010112345', 'O*******', 'P*******', 'BIURO@'],
  },
  {
    id: 'sg.acra', jurisdiction: 'SG', factory: createAcraConnector, words: SG_WORDS, env: UA, number: KESTREL_KEYLESS_NUMBERS.SG, badNumber: '12345', name: 'Kestrel Pay Pte. Ltd.',
    byNumber: { 'filters=%7B%22uen%22%3A%22202499999K': sample('sg-uen.json') }, numberRoute: 'filters=%7B%22uen%22%3A%22202499999K',
    empty: { route: 'filters=%7B%22uen%22', reply: sample('sg-empty.json') },
    expectFound: { 'registry.sg.acra.uen': '202499999K', 'registry.sg.acra.status': 'registered', 'registry.sg.acra.entity_type': 'Local Company' },
    personWords: ['TAN AH', 'HOME FICTIONAL'],
  },
  {
    id: 'ch.zefix', jurisdiction: 'CH', factory: createZefixConnector, words: CH_WORDS, env: { ZEFIX_USERNAME: 'test-user', ZEFIX_PASSWORD: 'test-pass' }, number: KESTREL_KEYLESS_NUMBERS.CH, badNumber: 'CHE-123.456.789', name: 'Kestrel Pay AG',
    byNumber: { '/company/uid/CHE123456788': sample('zefix-company.json') }, numberRoute: '/company/uid/CHE123456788',
    empty: { route: '/company/uid/CHE123456788', reply: { status: 404, body: json({ error: { type: 'NOT_FOUND', message: 'not found' } }) } },
    expectFound: { 'registry.ch.zefix.uid': 'CHE-123.456.788', 'registry.ch.zefix.legal_form_code': '0106', 'registry.ch.zefix.auditors_count': 1, 'registry.ch.zefix.capital_nominal': 100000 },
    personWords: ['Hans', 'Nirgendwo', 'Kollektivunterschrift', 'Fiktivstrasse'],
  },
];

describe.each(CASES)('$id', (c) => {
  const ref = { name: c.name, jurisdiction: c.jurisdiction, registry_number: c.number };

  it('is off until its setting is set, and calls nobody', async () => {
    const { connector, fetchImpl } = build(c.factory, c.byNumber, {});
    const result = await connector.lookup(ref);
    expect(result.status).toBe('unavailable');
    expect(result.facts).toEqual([]);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('is chosen only for its own country', () => {
    expect(c.factory({ env: c.env }).jurisdictions).toEqual([c.jurisdiction]);
  });

  it('finds the company by its number, with published facts only', async () => {
    const { connector, fetchImpl } = build(c.factory, c.byNumber, c.env);
    const result = await connector.lookup(ref);
    expect(result.status, result.message).toBe('found');
    expect(result.matchConfidence).toBe(1);
    expect(result.provenance.method).toBe('official_live');
    expect(fetchImpl.calls[0]?.url).toContain(c.numberRoute);
    const headers = new Headers(fetchImpl.calls[0]?.init?.headers);
    expect(headers.get('user-agent')).toBe(c.id === 'ch.zefix' ? 'VeroScan company checks' : 'VeroScan-test');
    const facts = factMap(result);
    expect(facts[`registry.${c.jurisdiction.toLowerCase()}.${c.id.split('.')[1]}.identified`]).toBe(true);
    for (const [key, value] of Object.entries(c.expectFound)) expect(facts[key], key).toEqual(value);
    assertPublished(result);
    assertNoneOf(result, c.personWords);
  });

  it('a miss by number says "not found in this register", never that the company does not exist, and claims nothing', async () => {
    const { connector } = build(c.factory, { [c.empty.route]: c.empty.reply }, c.env);
    const result = await connector.lookup(ref);
    expect(result.status).toBe('not_found');
    expect(result.message).toBe(c.words.notFoundByNumber);
    expect(result.message).toContain("doesn't mean the company doesn't exist");
    expect(Object.values(factMap(result))).toEqual([null]);
    assertPublished(result);
  });

  it('refuses a number in the wrong format, or failing its check, without asking anyone', async () => {
    const { connector, fetchImpl } = build(c.factory, c.byNumber, c.env);
    const result = await connector.lookup({ ...ref, registry_number: c.badNumber });
    expect(result.status).toBe('unsupported');
    expect(result.message).toBe(c.words.invalidNumber);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('waits as long as Retry-After says when asked to slow down, then reads the answer', async () => {
    const first = Object.keys(c.byNumber).find((key) => key === c.numberRoute) as string;
    const routes = { ...c.byNumber, [first]: [{ status: 429, headers: { 'retry-after': '2' } }, c.byNumber[first] as string] };
    const { connector, sleeps } = build(c.factory, routes, c.env);
    const result = await connector.lookup(ref);
    expect(result.status).toBe('found');
    expect(sleeps).toContain(2000);
  });

  it('a source that stays down is an error in plain words, not a miss', async () => {
    const { connector } = build(c.factory, { [c.numberRoute]: { status: 503 } }, c.env);
    const result = await connector.lookup(ref);
    expect(result.status).toBe('error');
    expect(result.facts).toEqual([]);
    expect(result.message).toMatch(/had a problem on its side\.$/);
    const slow = await build(c.factory, { [c.numberRoute]: { status: 429, headers: { 'retry-after': '1' } } }, c.env).connector.lookup(ref);
    expect(slow.status).toBe('error');
    expect(slow.message).toMatch(/asked us to slow down\.$/);
  });
});

// ---- Name lookups and privacy, source by source ----

describe('no.brreg', () => {
  it('finds a unique name, keeps role titles and counts only, and never offers a sole proprietorship', async () => {
    const { connector, fetchImpl } = build(createBrregConnector, { '/enheter?navn=': sample('no-search.json'), '/roller': sample('no-roles.json') });
    const result = await connector.lookup({ name: 'Kestrel Pay AS', jurisdiction: 'NO' });
    expect(result.status).toBe('found');
    expect(result.matchConfidence).toBe(0.95);
    expect(fetchImpl.calls[0]?.url).toBe('https://data.brreg.no/enhetsregisteret/api/enheter?navn=Kestrel%20Pay%20AS&size=20');
    expect(factMap(result)['registry.no.brreg.role_titles']).toEqual(['Daglig leder', 'Revisor', 'Styremedlem', 'Styrets leder']);
    // One resigned board member is not counted.
    expect(factMap(result)['registry.no.brreg.roles_count']).toBe(4);
    assertNoneOf(result, ['KARI FIKTIV', 'Hjemmeveien', 'Fiktivsen', '1980']);
  });

  it('two units with the same name are ambiguous, with candidates', async () => {
    const result = await build(createBrregConnector, { '/enheter?navn=': sample('no-search-many.json') }).connector.lookup({ name: 'Kestrel Pay', jurisdiction: 'NO' });
    expect(result.status).toBe('ambiguous');
    expect(result.facts).toEqual([]);
    expect(result.candidates?.map((item) => item.identifier)).toEqual(['812345672', '812345680']);
  });

  it('a name miss says to add the organisation number', async () => {
    const result = await build(createBrregConnector, { '/enheter?navn=': json({ page: { totalElements: 0 } }) }).connector.lookup({ name: 'Heron Fiktiv AS', jurisdiction: 'NO' });
    expect(result.status).toBe('not_found');
    expect(result.message).toBe(NO_WORDS.notFoundByName);
    expect(factMap(result)).toEqual({ 'registry.no.brreg.identified': null });
  });

  it('a sole proprietorship (ENK) found by number is never kept', async () => {
    const result = await build(createBrregConnector, { '/enheter/812345680': sample('no-enk.json') }).connector.lookup({ name: 'x', jurisdiction: 'NO', registry_number: '812345680' });
    expect(result.status).toBe('unsupported');
    expect(result.message).toBe(NO_WORDS.person);
    expect(result.facts).toEqual([]);
    assertNoneOf(result, ['KARI', 'Hjemmeveien']);
  });

  it('a deleted unit is found, says deleted, and asks for no roles', async () => {
    const { connector, fetchImpl } = build(createBrregConnector, { '/enheter/812345672': sample('no-deleted.json') });
    const result = await connector.lookup({ name: 'x', jurisdiction: 'NO', registry_number: '812345672' });
    expect(factMap(result)).toMatchObject({ 'registry.no.brreg.status': 'deleted', 'registry.no.brreg.deleted_on': '2026-01-31' });
    expect(factMap(result)['registry.no.brreg.roles_count']).toBeUndefined();
    expect(fetchImpl.calls).toHaveLength(1);
  });

  it('a unit removed for legal reasons (410) is a miss, not an error', async () => {
    const result = await build(createBrregConnector, { '/enheter/812345672': { status: 410, body: json({ organisasjonsnummer: '812345672', slettedato: '2020-01-01' }) } })
      .connector.lookup({ name: 'x', jurisdiction: 'NO', registry_number: '812345672' });
    expect(result.status).toBe('not_found');
  });

  it('when the roles cannot be read, the unit stands and no role fact is claimed', async () => {
    const result = await build(createBrregConnector, { '/enheter/812345672': sample('no-unit.json'), '/roller': { status: 503 } })
      .connector.lookup({ name: 'x', jurisdiction: 'NO', registry_number: '812345672' });
    expect(result.status).toBe('found');
    expect(factMap(result)['registry.no.brreg.roles_count']).toBeUndefined();
  });

  it('stays inside 5 requests a second', async () => {
    let clock = NOW.getTime();
    const fetchImpl = fakeFetch({ '/enheter?navn=': json({ page: { totalElements: 0 } }) });
    const connector = createBrregConnector({ env: UA, fetch: fetchImpl, now: () => new Date(clock), sleep: async (ms) => { clock += ms; }, retries: 0 });
    for (let i = 0; i < 10; i += 1) await connector.lookup({ name: `Heron ${i}`, jurisdiction: 'NO' });
    expect(clock - NOW.getTime()).toBeGreaterThanOrEqual(900);
  });
});

describe('fi.prh', () => {
  it('finds a unique current name, and never offers a record without a company form', async () => {
    const result = await build(createPrhConnector, { '/companies?name=': sample('fi-search.json') }).connector.lookup({ name: 'Kestrel Pay', jurisdiction: 'FI' });
    expect(result.status).toBe('found');
    expect(factMap(result)['registry.fi.prh.registered_name']).toBe('Kestrel Pay Oy');
    assertNoneOf(result, ['Matti', 'Kestrel Fintech']);
  });

  it('two companies with the same name are ambiguous', async () => {
    const result = await build(createPrhConnector, { '/companies?name=': sample('fi-search-many.json') }).connector.lookup({ name: 'Kestrel Pay Oy', jurisdiction: 'FI' });
    expect(result.status).toBe('ambiguous');
    expect(result.candidates).toHaveLength(2);
  });

  it('reads bankruptcy, and a record that looks like a person is never kept', async () => {
    const bankrupt = JSON.parse(sample('fi-search-many.json')) as { companies: unknown[] };
    const result = await build(createPrhConnector, { 'businessId=9999998-4': json({ totalResults: 1, companies: [bankrupt.companies[1]] }) }).connector.lookup({ name: 'x', jurisdiction: 'FI', registry_number: '9999998-4' });
    expect(factMap(result)['registry.fi.prh.situations']).toEqual(['bankruptcy']);

    const person = await build(createPrhConnector, { 'businessId=9999998-4': sample('fi-person.json') }).connector.lookup({ name: 'x', jurisdiction: 'FI', registry_number: '9999998-4' });
    expect(person.status).toBe('unsupported');
    expect(person.message).toBe(FI_WORDS.person);
    assertNoneOf(person, ['Matti', 'Kotitie']);
  });

  it('a name miss is unknown, never false', async () => {
    const result = await build(createPrhConnector, { '/companies?name=': json({ totalResults: 0, companies: [] }) }).connector.lookup({ name: 'Heron Oy', jurisdiction: 'FI' });
    expect(result.status).toBe('not_found');
    expect(result.message).toBe(FI_WORDS.notFoundByName);
  });
});

describe('cz.ares', () => {
  it('searches names with a POST, finds the exact one, and never offers a natural person', async () => {
    const { connector, fetchImpl } = build(createAresConnector, { '/ekonomicke-subjekty/vyhledat': sample('cz-search.json') });
    const result = await connector.lookup({ name: 'KESTREL PAY, s. r. o.', jurisdiction: 'CZ' });
    expect(result.status).toBe('found');
    expect(fetchImpl.calls[0]?.init?.method).toBe('POST');
    expect(JSON.parse(fetchImpl.calls[0]?.init?.body as string)).toEqual({ obchodniJmeno: 'KESTREL PAY, s. r. o.', start: 0, pocet: 100 });
    expect(factMap(result)['registry.cz.ares.ico']).toBe('87654326');
    assertNoneOf(result, ['Jan Fiktivní', 'Domovská']);
  });

  it('the same name twice is ambiguous; a ceased one says so', async () => {
    const result = await build(createAresConnector, { '/ekonomicke-subjekty/vyhledat': sample('cz-search-many.json') }).connector.lookup({ name: 'Kestrel Pay s.r.o.', jurisdiction: 'CZ' });
    expect(result.status).toBe('ambiguous');
    const many = JSON.parse(sample('cz-search-many.json')) as { ekonomickeSubjekty: unknown[] };
    const ceased = await build(createAresConnector, { '/ekonomicke-subjekty/87654334': json(many.ekonomickeSubjekty[1]) }).connector.lookup({ name: 'x', jurisdiction: 'CZ', registry_number: '87654334' });
    expect(factMap(ceased)).toMatchObject({ 'registry.cz.ares.status': 'ceased', 'registry.cz.ares.insolvency_record_active': true, 'registry.cz.ares.vat_payer': false });
  });

  it('a natural-person entrepreneur found by number is never kept', async () => {
    const result = await build(createAresConnector, { '/ekonomicke-subjekty/87654334': sample('cz-person.json') }).connector.lookup({ name: 'x', jurisdiction: 'CZ', registry_number: '87654334' });
    expect(result.status).toBe('unsupported');
    expect(result.message).toBe(CZ_WORDS.person);
    assertNoneOf(result, ['Jan', 'Domovská']);
  });

  it('more results than one page and no exact match asks for the IČO instead of saying "not found"', async () => {
    const result = await build(createAresConnector, { '/vyhledat': json({ pocetCelkem: 500, ekonomickeSubjekty: [] }) }).connector.lookup({ name: 'Kestrel', jurisdiction: 'CZ' });
    expect(result.status).toBe('ambiguous');
    expect(result.message).toBe(CZ_WORDS.tooMany);
  });
});

describe('pl.krs', () => {
  it('has no name search, so a name alone asks for the KRS number and calls nobody', async () => {
    const { connector, fetchImpl } = build(createKrsConnector, {});
    const result = await connector.lookup({ name: 'Kestrel Pay sp. z o.o.', jurisdiction: 'PL' });
    expect(result.status).toBe('unsupported');
    expect(result.message).toBe(PL_WORDS.needsNumber);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('keeps body names and counts, never a name, an initial or a PESEL digit', async () => {
    const result = await build(createKrsConnector, { 'rejestr=P': sample('pl-extract.json') }).connector.lookup({ name: 'x', jurisdiction: 'PL', registry_number: '9999999' });
    expect(factMap(result)).toMatchObject({
      'registry.pl.krs.management_bodies': ['ZARZĄD'], 'registry.pl.krs.supervisory_bodies': ['RADA NADZORCZA'], 'registry.pl.krs.proxies_count': 1,
      'registry.pl.krs.registered_on': '2023-03-14', 'registry.pl.krs.nip_present': true, 'registry.pl.krs.main_activity_code': '62.01.Z', 'registry.pl.krs.under_liquidation': false,
    });
    assertNoneOf(result, ['F*******', '8**********', 'ANNA', '90010112345', 'FIKCYJNA', 'FIKCYJNY', '90010154321', 'UL.', 'BIURO']);
  });

  it('reads liquidation and insolvency markers, and tries the associations register after a miss', async () => {
    const result = await build(createKrsConnector, { 'rejestr=P': sample('pl-extract-liquidation.json') }).connector.lookup({ name: 'x', jurisdiction: 'PL', registry_number: '9999999' });
    expect(factMap(result)).toMatchObject({ 'registry.pl.krs.under_liquidation': true, 'registry.pl.krs.insolvency_marker': true });
    assertNoneOf(result, ['L*******']);

    const { connector, fetchImpl } = build(createKrsConnector, { 'rejestr=P': { status: 404 }, 'rejestr=S': sample('pl-extract.json') });
    expect((await connector.lookup({ name: 'x', jurisdiction: 'PL', registry_number: '9999999' })).status).toBe('found');
    expect(fetchImpl.calls.map((call) => call.url.split('rejestr=')[1])).toEqual(['P&format=json', 'S&format=json']);
  });
});

describe('sg.acra', () => {
  it('matches a name exactly in upper case, preferring the entity still registered', async () => {
    const { connector, fetchImpl } = build(createAcraConnector, { 'entity_name': sample('sg-name.json') });
    const result = await connector.lookup({ name: 'Kestrel Pay Pte. Ltd.', jurisdiction: 'SG' });
    expect(result.status).toBe('found');
    expect(decodeURIComponent(fetchImpl.calls[0]?.url ?? '')).toContain('filters={"entity_name":"KESTREL PAY PTE. LTD."}');
    expect(factMap(result)['registry.sg.acra.uen']).toBe('202499999K');
  });

  it('two live entities with the same name are ambiguous', async () => {
    const result = await build(createAcraConnector, { 'entity_name': sample('sg-name-many.json') }).connector.lookup({ name: 'Kestrel Pay Pte. Ltd.', jurisdiction: 'SG' });
    expect(result.status).toBe('ambiguous');
  });

  it('a sole proprietorship is never kept', async () => {
    const result = await build(createAcraConnector, { 'uen': sample('sg-sole.json') }).connector.lookup({ name: 'x', jurisdiction: 'SG', registry_number: '99999999Z' });
    expect(result.status).toBe('unsupported');
    expect(result.message).toBe(SG_WORDS.person);
    assertNoneOf(result, ['TAN AH', 'HOME FICTIONAL', '000002']);
  });

  it('stays inside 4 requests per 10 seconds', async () => {
    let clock = NOW.getTime();
    const fetchImpl = fakeFetch({ datastore_search: sample('sg-empty.json') });
    const connector = createAcraConnector({ env: UA, fetch: fetchImpl, now: () => new Date(clock), sleep: async (ms) => { clock += ms; }, retries: 0 });
    for (let i = 0; i < 5; i += 1) await connector.lookup({ name: `Heron ${i}`, jurisdiction: 'SG' });
    expect(clock - NOW.getTime()).toBeGreaterThanOrEqual(6000);
  });
});

describe('ch.zefix', () => {
  const env = { ZEFIX_USERNAME: 'test-user', ZEFIX_PASSWORD: 'test-pass' };

  it('sends the credentials as Basic auth, and never reads the publication texts', async () => {
    const { connector, fetchImpl } = build(createZefixConnector, { '/company/uid/': sample('zefix-company.json') }, env);
    const result = await connector.lookup({ name: 'x', jurisdiction: 'CH', registry_number: 'CHE-123.456.788' });
    expect(new Headers(fetchImpl.calls[0]?.init?.headers).get('authorization')).toBe(`Basic ${Buffer.from('test-user:test-pass').toString('base64')}`);
    assertNoneOf(result, ['Hans', 'Kollektivunterschrift', 'test-pass']);
  });

  it('finds a name by search, then reads the full record by UID; never offers an Einzelunternehmen', async () => {
    const { connector, fetchImpl } = build(createZefixConnector, { '/company/search': sample('zefix-search.json'), '/company/uid/CHE123456788': sample('zefix-company.json') }, env);
    const result = await connector.lookup({ name: 'Kestrel Pay', jurisdiction: 'CH' });
    expect(result.status).toBe('found');
    expect(fetchImpl.calls.map((call) => call.init?.method ?? 'GET')).toEqual(['POST', 'GET']);
    assertNoneOf(result, ['Hans Fiktiv']);
  });

  it('a list too long to return asks for the UID; two exact names are ambiguous; a sole proprietorship is never kept', async () => {
    const tooMany = await build(createZefixConnector, { '/company/search': { status: 400, body: json({ error: { type: 'RESULTLIST_TO_LARGE' } }) } }, env).connector.lookup({ name: 'AG', jurisdiction: 'CH' });
    expect(tooMany.status).toBe('ambiguous');
    expect(tooMany.message).toBe(CH_WORDS.tooMany);
    const twins = await build(createZefixConnector, { '/company/search': sample('zefix-search-many.json') }, env).connector.lookup({ name: 'Kestrel Pay', jurisdiction: 'CH' });
    expect(twins.status).toBe('ambiguous');
    const sole = await build(createZefixConnector, { '/company/uid/': sample('zefix-sole.json') }, env).connector.lookup({ name: 'x', jurisdiction: 'CH', registry_number: 'CHE-987.654.326' });
    expect(sole.status).toBe('unsupported');
    assertNoneOf(sole, ['Hans']);
  });

  it('a name search with nothing found (404) is a miss in plain words', async () => {
    const result = await build(createZefixConnector, { '/company/search': { status: 404, body: json({ error: { type: 'NOT_FOUND' } }) } }, env).connector.lookup({ name: 'Heron AG', jurisdiction: 'CH' });
    expect(result.status).toBe('not_found');
    expect(result.message).toBe(CH_WORDS.notFoundByName);
  });
});

// ---- The wider engine ----

describe('national registers in the wider engine', () => {
  it('are registered, off by default, each for its own country', async () => {
    const connectors = createConnectors({ env: {}, now: () => NOW });
    for (const c of CASES) {
      const connector = connectors.find((item) => item.id === c.id);
      expect(connector, c.id).toBeDefined();
      expect(connector?.jurisdictions).toEqual([c.jurisdiction]);
      expect((await connector?.lookup({ name: c.name, jurisdiction: c.jurisdiction, registry_number: c.number }))?.status).toBe('unavailable');
    }
  });

  it('fixture mode has a fictional, labelled Kestrel Pay for each', async () => {
    const fixtures = createFixtureConnectors({ NODE_ENV: 'test' }, () => NOW);
    for (const c of CASES) {
      const fixture = fixtures.find((item) => item.id === c.id);
      expect(fixture, c.id).toBeDefined();
      const result = (await fixture?.lookup({ name: c.name, jurisdiction: c.jurisdiction })) as SourceResult;
      expect(result.provenance.fixture).toBe(true);
      expect(result.message).toContain('Not a real record');
      assertPublished(result);
    }
  });

  it('every published key of these sources is one a parser can produce', () => {
    for (const prefix of ['registry.no.brreg.', 'registry.fi.prh.', 'registry.cz.ares.', 'registry.pl.krs.', 'registry.sg.acra.', 'registry.ch.zefix.']) {
      expect(CONNECTOR_FACT_KEYS.filter((key) => key.startsWith(prefix)).length, prefix).toBeGreaterThan(5);
    }
  });

  it('recordings drop every person: role holders, sole proprietorships, natural persons, KRS people, SOGC texts', () => {
    const cases: [string, string[], string[]][] = [
      ['no-roles.json', ['Fiktivsen', 'Oppdiktet', '1980-01-01'], ['Daglig leder', 'KESTREL PAYMENTS AS']],
      ['no-unit.json', ['22 00 00 00', 'post@kestrelpay'], ['KESTREL PAY AS', '812345672']],
      ['no-search.json', ['KARI FIKTIV', 'Hjemmeveien'], ['KESTREL PAY AS', 'ENK']],
      ['fi-person.json', ['Matti', 'Kotitie'], []],
      ['cz-search.json', ['Jan Fiktivní', 'Domovská'], ['Kestrel Pay s.r.o.', '101']],
      ['pl-extract.json', ['F*******', 'J***', '8**********', 'ANNA', '90010112345', 'JAN FIKCYJNY', '90010154321', 'UL. FIKCYJNA'], ['ZARZĄD', 'PREZES ZARZĄDU', 'KESTREL PAY']],
      ['sg-sole.json', ['TAN AH', 'HOME FICTIONAL'], ['Sole Proprietorship/ Partnership']],
      ['zefix-company.json', ['Hans', 'Kollektivunterschrift'], ['Kestrel Pay AG']],
      ['zefix-sole.json', ['Hans Fiktiv'], []],
    ];
    for (const [file, gone, kept] of cases) {
      const redacted = redactBody(sample(file));
      for (const word of gone) expect(redacted, `${file}: ${word}`).not.toContain(word);
      for (const word of kept) expect(redacted, `${file}: ${word}`).toContain(word);
    }
  });
});

import { describe, expect, it } from 'vitest';
import {
  CNIL_COMPACT_HEADER, cnilColumns, compactCnilDpo, compactGels, createCnilDpoConnector, createConnectors, createCsvRowReader, createFixtureConnectors,
  createRechercheEntreprisesConnector, createReferenceRefresher, createSanctionsConnector, FR_NOT_IN_DIRECTORY, GELS_COMPACT_FORMAT, isValidSiren,
  KESTREL_FR_SIREN, luhnValid, parseCnilCompact, parseGelsJson, redactBody, REFERENCE_SOURCES,
  type HeldCopy, type ReferenceCopy, type ReferenceKey, type ReferenceOptions,
} from '../src/index.js';
import { sha256 } from '../src/runtime.js';
import { factMap, fakeFetch, noSleep, sample } from './helpers.js';

/**
 * The French data sources. Every response here is a hand-made fictional sample: Kestrel Pay
 * SAS, SIREN 123456808, and the people in the samples, are made up. No real API is called.
 */

const NOW = new Date('2026-11-14T09:00:00Z');
const HOURS = 3_600_000;
const NOTHING: HeldCopy = { contentHash: null, etag: null, lastModified: null, rowCount: null };
const UA = { FR_RECHERCHE_ENTREPRISES_USER_AGENT: 'VeroScan-test' };
const PERSONAL = ['EXEMPLE', 'Camille', 'Ondine', '1988', 'Française', 'dpo@', 'dominique', 'CONSEIL', '+33', 'Fictivus', 'Ignatius', 'Atlantide', 'JEAN FICTIF'];

function directory(routes: Parameters<typeof fakeFetch>[0], env: Record<string, string> = UA) {
  const fetchImpl = fakeFetch(routes);
  const sleeps: number[] = [];
  const connector = createRechercheEntreprisesConnector({ env, fetch: fetchImpl, now: () => NOW, sleep: async (ms) => { sleeps.push(ms); }, retries: 2 });
  return { connector, fetchImpl, sleeps };
}

function memoryStore(copies: Partial<Record<ReferenceKey, { content: string; checkedAt: Date }>>): ReferenceOptions {
  return {
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
        const copy = copies[key];
        return copy && sha256(copy.content) === hash ? copy.content : null;
      },
    },
  };
}

describe('SIREN check', () => {
  it('uses the Luhn check', () => {
    expect(luhnValid('79927398713')).toBe(true);
    expect(luhnValid('79927398710')).toBe(false);
    expect(isValidSiren(KESTREL_FR_SIREN)).toBe(true);
    expect(isValidSiren('123 456 808')).toBe(true);
    expect(isValidSiren('999999997')).toBe(false);
    expect(isValidSiren('12345678')).toBe(false);
    expect(isValidSiren('abcdefghi')).toBe(false);
  });
});

describe('fr.recherche_entreprises', () => {
  it('is off until we name ourselves', async () => {
    const { connector, fetchImpl } = directory({}, {});
    const result = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR' });
    expect(result.status).toBe('unavailable');
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('looks up a SIREN directly and keeps only counts and role titles for directors', async () => {
    const { connector, fetchImpl } = directory({ '/search?q=123456808': sample('fr-search-siren.json') });
    const result = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: '123 456 808' });
    expect(result.status).toBe('found');
    expect(result.provenance.method).toBe('official_live');
    expect(fetchImpl.calls[0]?.url).toBe('https://recherche-entreprises.api.gouv.fr/search?q=123456808');
    const headers = fetchImpl.calls[0]?.init?.headers as Record<string, string>;
    expect(headers['User-Agent']).toBe('VeroScan-test');
    expect(factMap(result)).toEqual({
      'registry.fr.recherche_entreprises.identified': true,
      'registry.fr.recherche_entreprises.siren': '123456808',
      'registry.fr.recherche_entreprises.status': 'active',
      'registry.fr.recherche_entreprises.registered_name': 'KESTREL PAY',
      'registry.fr.recherche_entreprises.created_on': '2024-02-01',
      'registry.fr.recherche_entreprises.legal_form_code': '5710',
      'registry.fr.recherche_entreprises.naf_code': '62.01Z',
      'registry.fr.recherche_entreprises.company_category': 'PME',
      'registry.fr.recherche_entreprises.size_band': '11',
      'registry.fr.recherche_entreprises.hq_postcode': '75002',
      'registry.fr.recherche_entreprises.hq_commune': 'PARIS',
      'registry.fr.recherche_entreprises.establishments_count': 2,
      'registry.fr.recherche_entreprises.establishments_open_count': 1,
      'registry.fr.recherche_entreprises.directors_count': 2,
      'registry.fr.recherche_entreprises.directors_entity_count': 1,
      'registry.fr.recherche_entreprises.directors_role_titles': ['Directeur général', 'Président de SAS'],
      'registry.fr.recherche_entreprises.partially_published': false,
    });
    // No director's name, birth date or nationality survives.
    const stored = JSON.stringify(result);
    for (const word of PERSONAL) expect(stored).not.toContain(word);
  });

  it('finds a name match and never offers a sole trader (a person) as a candidate', async () => {
    const { connector, fetchImpl } = directory({ '/search?q=': sample('fr-search-name.json') });
    const result = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR' });
    expect(result.status).toBe('found');
    expect(result.matchConfidence).toBe(0.95);
    // The light search first (the full one took 25 s against the real directory), then the full record by SIREN.
    expect(fetchImpl.calls[0]?.url).toContain('per_page=10');
    expect(fetchImpl.calls[0]?.url).toContain('minimal=true');
    expect(fetchImpl.calls[1]?.url).toMatch(/\/search\?q=\d{9}$/);
    expect(JSON.stringify(result)).not.toContain('JEAN FICTIF');
  });

  it('a partly published record has no company name and holds a person: nothing about the person is kept', async () => {
    // Shape seen in the first real reply (15 Nov 2026): no legal category, no company name, only "nom_complet".
    const person = JSON.stringify({
      results: [{
        siren: '123456824', nom_complet: 'JEAN FICTIF', nom_raison_sociale: null, nature_juridique: null, etat_administratif: null, statut_diffusion: null,
        date_creation: '1985-10-21', nombre_etablissements: 0, nombre_etablissements_ouverts: 0,
        siege: { code_postal: '75001', libelle_commune: 'PARIS', adresse: '1 RUE FICTIVE 75001 PARIS' },
        dirigeants: [{ nom: 'FICTIF', prenoms: 'Jean', type_dirigeant: 'personne physique', qualite: null }],
        complements: { est_entrepreneur_individuel: false },
      }],
      total_results: 1, page: 1, per_page: 10, total_pages: 1,
    });
    const bySiren = await directory({ '/search?q=123456824': person }).connector.lookup({ name: 'x', jurisdiction: 'FR', siren: '123456824' });
    const stored = JSON.stringify(bySiren);
    for (const word of ['FICTIF', 'Fictif', 'Jean', 'PARIS', '75001', 'FICTIVE']) expect(stored).not.toContain(word);
    expect(factMap(bySiren)['registry.fr.recherche_entreprises.registered_name']).toBeUndefined();
    expect(factMap(bySiren)['registry.fr.recherche_entreprises.hq_postcode']).toBeUndefined();

    // And never offered as a candidate when searching by name.
    const byName = await directory({ '/search?q=': person }).connector.lookup({ name: 'Jean Fictif', jurisdiction: 'FR' });
    expect(byName.status).toBe('not_found');
    expect(JSON.stringify(byName)).not.toContain('FICTIF');

    // The recorder removes the name from such a record too.
    const recorded = redactBody(person);
    expect(recorded).not.toContain('JEAN FICTIF');
    expect(recorded).not.toContain('PARIS');
  });

  it('a miss says "not in the public French directory", never that the company does not exist, and claims nothing', async () => {
    const empty = JSON.stringify({ results: [], total_results: 0, page: 1, per_page: 10, total_pages: 0 });
    const byName = await directory({ '/search?q=': empty }).connector.lookup({ name: 'Heron Fictif SAS', jurisdiction: 'FR' });
    expect(byName.status).toBe('not_found');
    expect(byName.message).toBe(FR_NOT_IN_DIRECTORY.name);
    expect(byName.message).toContain("doesn't mean the company doesn't exist");
    // Unknown, not false: a rule reading it would be "to check", never a failure.
    expect(factMap(byName)).toEqual({ 'registry.fr.recherche_entreprises.identified': null });

    const bySiren = await directory({ '/search?q=123456790': empty }).connector.lookup({ name: 'Heron Fictif SAS', jurisdiction: 'FR', siren: '123456790' });
    expect(bySiren.status).toBe('not_found');
    expect(bySiren.message).toBe(FR_NOT_IN_DIRECTORY.siren);
    expect(factMap(bySiren)).toEqual({ 'registry.fr.recherche_entreprises.identified': null });
  });

  it('refuses a SIREN that fails the check without asking anyone', async () => {
    const { connector, fetchImpl } = directory({});
    const result = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: '999999997' });
    expect(result.status).toBe('unsupported');
    expect(result.message).toContain('SIREN');
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('waits as long as Retry-After says when asked to slow down, then reads the answer', async () => {
    const { connector, fetchImpl, sleeps } = directory({
      '/search?q=123456808': [{ status: 429, headers: { 'retry-after': '2' } }, sample('fr-search-siren.json')],
    });
    const result = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: '123456808' });
    expect(result.status).toBe('found');
    expect(fetchImpl.calls).toHaveLength(2);
    expect(sleeps).toContain(2000);
  });

  it('a 429 that never stops is an error in plain words, not a miss', async () => {
    const { connector } = directory({ '/search?q=123456808': { status: 429, headers: { 'retry-after': '1' } } });
    const result = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: '123456808' });
    expect(result.status).toBe('error');
    expect(result.message).toBe('Annuaire des Entreprises asked us to slow down.');
    expect(result.facts).toEqual([]);
  });

  it('stays inside 7 requests a second', async () => {
    let clock = NOW.getTime();
    const sleeps: number[] = [];
    const fetchImpl = fakeFetch({ '/search?q=': sample('fr-search-name.json') });
    const connector = createRechercheEntreprisesConnector({
      env: UA, fetch: fetchImpl, now: () => new Date(clock), sleep: async (ms) => { sleeps.push(ms); clock += ms; }, retries: 0,
    });
    for (let i = 0; i < 10; i += 1) await connector.lookup({ name: `Kestrel Pay ${i} SAS`, jurisdiction: 'FR' });
    // These names match nothing exactly, so each lookup is the one light search.
    expect(fetchImpl.calls).toHaveLength(10);
    const elapsed = clock - NOW.getTime();
    // Ten requests at no more than 6 a second (under the published 7) take at least 4/6 of a second after the first burst of 6.
    expect(elapsed).toBeGreaterThanOrEqual(600);
  });
});

describe('fr.gels_avoirs (as the sanctions list "fr")', () => {
  it('reads the official JSON shape, keeping only entities and their aliases', () => {
    expect(parseGelsJson(sample('fr-gels.json')).sort()).toEqual(['KST Holdings', 'Kestrel Shadow Trading LLC', 'Shadow Trading Kestrel']);
  });

  it('refuses a file in another shape', () => {
    expect(() => parseGelsJson('{"something":"else"}')).toThrow("isn't in the format we expect");
    expect(() => parseGelsJson('not json')).toThrow("isn't in the format we expect");
  });

  it('the stored copy has entity names only: no person, no birth date, no address, no email', () => {
    const compact = compactGels(sample('fr-gels.json'));
    expect(JSON.parse(compact)).toEqual({ format: GELS_COMPACT_FORMAT, publishedOn: '2026-11-06T16:20:00', names: ['KST Holdings', 'Kestrel Shadow Trading LLC', 'Shadow Trading Kestrel'] });
    for (const word of ['FICTIVUS', 'Ignatius', 'Iggy', '1970', 'Atlantide', 'Imaginary', 'contact@', 'MV Fictional Star']) expect(compact).not.toContain(word);
    expect(parseGelsJson(compact)).toHaveLength(3);
  });

  it('the refresh job asks with our User-Agent and stores the compact copy', async () => {
    const fetchImpl = fakeFetch({ 'derniere-publication-fichier-json': sample('fr-gels.json') });
    const refresher = createReferenceRefresher({ env: { SANCTIONS_LISTS: 'fr' }, userAgent: 'VeroScan-test', fetch: fetchImpl, sleep: noSleep, retries: 0, now: () => NOW });
    const outcome = await refresher.refresh('sanctions.fr', NOTHING);
    expect(outcome.kind).toBe('replaced');
    if (outcome.kind !== 'replaced') return;
    expect(outcome.rowCount).toBe(3);
    expect(outcome.content).not.toContain('FICTIVUS');
    expect(outcome.contentHash).toBe(sha256(outcome.content));
    expect((fetchImpl.calls[0]?.init?.headers as Record<string, string>)['User-Agent']).toBe('VeroScan-test');
    expect(REFERENCE_SOURCES['sanctions.fr'].everyHours).toBe(6);
  });

  it('a possible match says a person must check, and never "sanctioned"', async () => {
    const reference = memoryStore({ 'sanctions.fr': { content: compactGels(sample('fr-gels.json')), checkedAt: new Date(NOW.getTime() - 2 * HOURS) } });
    const connector = createSanctionsConnector({ env: { SANCTIONS_LISTS: 'fr' }, fetch: fakeFetch({}), now: () => NOW, reference });
    const exact = await connector.lookup({ name: 'Kestrel Shadow Trading Ltd', jurisdiction: 'FR' });
    expect(exact.status).toBe('found');
    expect(exact.message).toContain('It may be another business with the same name');
    expect(exact.message?.toLowerCase()).not.toContain('sanctioned');
    const close = await connector.lookup({ name: 'Kestrel Shadow Tradings', jurisdiction: 'FR' });
    expect(close.status).toBe('ambiguous');
    expect(close.message).toContain('A person needs to check it');
    expect(close.message).toContain('List last updated on 14 Nov 2026');
    expect(close.message?.toLowerCase()).not.toContain('sanctioned');
    const clean = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR' });
    expect(clean.status).toBe('not_found');
    expect(factMap(clean)['registry.sanctions.lists_checked']).toEqual(['French asset-freeze register']);
  });

  it('a stale copy is unavailable, never "no match"', async () => {
    const reference = memoryStore({ 'sanctions.fr': { content: compactGels(sample('fr-gels.json')), checkedAt: new Date(NOW.getTime() - 30 * HOURS) } });
    const fetchImpl = fakeFetch({});
    const connector = createSanctionsConnector({ env: { SANCTIONS_LISTS: 'fr' }, fetch: fetchImpl, now: () => NOW, reference });
    const result = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR' });
    expect(result.status).toBe('unavailable');
    expect(result.facts).toEqual([]);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('with no stored copy, the download during a scan sends a User-Agent', async () => {
    const fetchImpl = fakeFetch({ 'derniere-publication-fichier-json': sample('fr-gels.json') });
    const connector = createSanctionsConnector({ env: { SANCTIONS_LISTS: 'fr' }, fetch: fetchImpl, now: () => NOW });
    const result = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR' });
    expect(result.status).toBe('not_found');
    expect((fetchImpl.calls[0]?.init?.headers as Record<string, string>)['User-Agent']).toBe('VeroScan sanctions check');
  });
});

describe('fr.cnil_dpo', () => {
  const csv = sample('fr-cnil-dpo.csv');

  it('finds its columns by name, and fails loudly when it cannot tell', () => {
    const header = (csv.split('\n')[0] as string).split(';');
    expect(cnilColumns(header)).toEqual({ siren: 1, date: 12 });
    expect(() => cnilColumns(['Nom', 'Ville'])).toThrow("isn't in the format we expect");
    expect(() => cnilColumns(['SIREN', 'Siren organisme'])).toThrow("isn't in the format we expect");
  });

  it('reads quoted separators and newlines in pieces of any size', () => {
    for (const size of [1, 7, 64, 100_000]) {
      const rows: string[][] = [];
      const reader = createCsvRowReader((row) => rows.push(row));
      for (let i = 0; i < csv.length; i += size) reader.push(csv.slice(i, i + size));
      reader.end();
      expect(rows, String(size)).toHaveLength(5);
      expect(rows[1]?.[3]).toBe('1 rue Imaginaire; bâtiment B');
      expect(rows[3]?.[3]).toBe('2 avenue Fictive\nCedex 9');
    }
  });

  it('keeps only SIRENs and the newest designation date: no names, emails or phones', async () => {
    const compact = await compactCnilDpo([csv]);
    expect(compact).toBe(`${CNIL_COMPACT_HEADER}\n123456790,2021-09-30\n123456808,2024-05-14\n`);
    for (const word of [...PERSONAL, 'KESTREL', 'HERON', 'Imaginaire', 'MARSEILLE', '75002', '999999980']) expect(compact).not.toContain(word);
    expect([...parseCnilCompact(compact)]).toEqual([['123456790', '2021-09-30'], ['123456808', '2024-05-14']]);
  });

  it('also reads a comma-separated file', async () => {
    const compact = await compactCnilDpo(['siren_organisme,email_dpo\n123456808,a@b.example\n']);
    expect(compact).toBe(`${CNIL_COMPACT_HEADER}\n123456808\n`);
  });

  it('the refresh job streams the file and stores the small copy; the size cap holds', async () => {
    const fetchImpl = fakeFetch({ 'datasets/r/': csv });
    const env = { FR_CNIL_DPO_URL: 'https://www.data.gouv.fr/api/1/datasets/r/c5d02b42-1008-4406-83f5-3a81c8b936a3' };
    const refresher = createReferenceRefresher({ env, userAgent: 'VeroScan-test', fetch: fetchImpl, sleep: noSleep, retries: 0, now: () => NOW });
    const outcome = await refresher.refresh('fr.cnil_dpo', NOTHING);
    expect(outcome.kind).toBe('replaced');
    if (outcome.kind !== 'replaced') return;
    expect(outcome.rowCount).toBe(2);
    expect(outcome.content.length).toBeLessThan(csv.length / 4);
    for (const word of PERSONAL) expect(outcome.content).not.toContain(word);
    expect((fetchImpl.calls[0]?.init?.headers as Record<string, string>)['User-Agent']).toBe('VeroScan-test');

    // The same file again is "not modified", by the hash of what we store.
    const again = await refresher.refresh('fr.cnil_dpo', { contentHash: outcome.contentHash, etag: null, lastModified: null, rowCount: 2 });
    expect(again.kind).toBe('not_modified');

    // A file in another format is rejected, and its contents never reach the reason.
    const bad = createReferenceRefresher({ env, userAgent: 'x', fetch: fakeFetch({ 'datasets/r/': 'Nom;Courriel\nCamille;dpo@kestrelpay.example\n' }), sleep: noSleep, retries: 0, now: () => NOW });
    const rejected = await bad.refresh('fr.cnil_dpo', NOTHING);
    expect(rejected.kind).toBe('rejected');
    if (rejected.kind === 'rejected') {
      expect(rejected.error).toContain("isn't in the format we expect");
      expect(rejected.error).not.toContain('Camille');
      expect(rejected.error).not.toContain('dpo@');
    }
  });

  it('a download over the size cap is refused, and a 429 is retried after Retry-After', async () => {
    const original = REFERENCE_SOURCES['fr.cnil_dpo'].streamed;
    const env = { FR_CNIL_DPO_URL: 'https://www.data.gouv.fr/api/1/datasets/r/c5d02b42-1008-4406-83f5-3a81c8b936a3' };
    try {
      (REFERENCE_SOURCES['fr.cnil_dpo'] as { streamed?: typeof original }).streamed = { maxBytes: 100, reduce: (chunks) => compactCnilDpo(chunks) };
      const big = await createReferenceRefresher({ env, userAgent: 'x', fetch: fakeFetch({ 'datasets/r/': csv }), sleep: noSleep, retries: 0, now: () => NOW }).refresh('fr.cnil_dpo', NOTHING);
      expect(big.kind).toBe('rejected');
      if (big.kind === 'rejected') expect(big.error).toContain('much bigger than expected');
    } finally {
      (REFERENCE_SOURCES['fr.cnil_dpo'] as { streamed?: typeof original }).streamed = original;
    }
    const sleeps: number[] = [];
    const slow = fakeFetch({ 'datasets/r/': [{ status: 429, headers: { 'retry-after': '3' } }, csv] });
    const retried = await createReferenceRefresher({ env, userAgent: 'x', fetch: slow, sleep: async (ms) => { sleeps.push(ms); }, retries: 1, now: () => NOW }).refresh('fr.cnil_dpo', NOTHING);
    expect(retried.kind).toBe('replaced');
    expect(sleeps).toContain(3000);
  });

  it('answers from the stored copy: on the list, not on the list, stale, none', async () => {
    const content = await compactCnilDpo([csv]);
    const env = { FR_CNIL_DPO_URL: 'https://www.data.gouv.fr/api/1/datasets/r/x' };
    const fresh = createCnilDpoConnector({ env, fetch: fakeFetch({}), now: () => NOW, reference: memoryStore({ 'fr.cnil_dpo': { content, checkedAt: new Date(NOW.getTime() - 3 * HOURS) } }) });

    const listed = await fresh.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: KESTREL_FR_SIREN });
    expect(listed.status).toBe('found');
    expect(listed.provenance.method).toBe('official_list');
    expect(factMap(listed)).toEqual({ 'registry.fr.cnil_dpo.listed': true, 'registry.fr.cnil_dpo.designated_on': '2024-05-14' });
    expect(listed.message).toContain('List last updated on 14 Nov 2026');

    const absent = await fresh.lookup({ name: 'Other Fictif SAS', jurisdiction: 'FR', siren: '999999980' });
    expect(absent.status).toBe('not_found');
    expect(factMap(absent)).toEqual({ 'registry.fr.cnil_dpo.listed': false });
    expect(absent.message).toContain("didn't find this SIREN on the CNIL list");
    expect(absent.message).toContain("isn't proof there is no DPO");
    expect(absent.message).not.toContain('has no DPO');

    const noSiren = await fresh.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR' });
    expect(noSiren.status).toBe('unsupported');

    const stale = createCnilDpoConnector({ env, now: () => NOW, reference: memoryStore({ 'fr.cnil_dpo': { content, checkedAt: new Date(NOW.getTime() - 72 * HOURS) } }) });
    const old = await stale.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: KESTREL_FR_SIREN });
    expect(old.status).toBe('unavailable');
    expect(old.facts).toEqual([]);

    const none = createCnilDpoConnector({ env, now: () => NOW, reference: memoryStore({}) });
    expect((await none.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: KESTREL_FR_SIREN })).status).toBe('unavailable');
  });
});

describe('France in the wider engine', () => {
  it('the live sources are off by default, and chosen only for France', async () => {
    const connectors = createConnectors({ env: { NODE_ENV: 'production' }, now: () => NOW });
    const french = connectors.filter((connector) => connector.jurisdictions.includes('FR')).map((connector) => connector.id).sort();
    // eu.vies_vat covers every EU member state; global sources ('*', such as sanctions) are not listed by country.
    expect(french).toEqual(['eu.vies_vat', 'fr.cnil_dpo', 'fr.recherche_entreprises']);
    for (const connector of connectors.filter((c) => c.id.startsWith('fr.'))) {
      expect(connector.jurisdictions).toEqual(['FR']);
      expect((await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: KESTREL_FR_SIREN })).status).toBe('unavailable');
    }
  });

  it('fixture mode has fictional French samples, clearly labelled', async () => {
    const fixtures = createFixtureConnectors({ NODE_ENV: 'test' }, () => NOW).filter((c) => c.id.startsWith('fr.'));
    expect(fixtures.map((c) => c.id).sort()).toEqual(['fr.cnil_dpo', 'fr.recherche_entreprises']);
    for (const connector of fixtures) {
      const result = await connector.lookup({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: KESTREL_FR_SIREN });
      expect(result.provenance.fixture).toBe(true);
      expect(result.message).toContain('Not a real record');
    }
  });

  it('recordings drop French directors, sole traders and people on the freeze list', () => {
    const directors = redactBody(sample('fr-search-siren.json'));
    for (const word of ['EXEMPLE', 'Camille', '1988', 'Française']) expect(directors).not.toContain(word);
    // Companies stay: they are public records about companies.
    expect(directors).toContain('KESTREL PAY HOLDINGS');
    expect(directors).toContain('123456808');
    expect(directors).toContain('Président de SAS');

    const soleTrader = redactBody(sample('fr-search-name.json'));
    expect(soleTrader).not.toContain('JEAN FICTIF');

    const freezes = redactBody(sample('fr-gels.json'));
    for (const word of ['FICTIVUS', 'Ignatius', 'Iggy', '1970', 'contact@shadow.example']) expect(freezes).not.toContain(word);
    expect(freezes).toContain('Kestrel Shadow Trading LLC');
  });
});

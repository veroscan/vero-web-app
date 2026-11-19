import { defineConnector, type Http } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact, FactValue, LookupOutcome } from '../types.js';
import { digitsOf, isoDate, isValidCvr, keyRefused, makeNameNormaliser, pickByName } from './keyed-registers-common.js';

/**
 * dk.cvr: Erhvervsstyrelsen's Central Business Register (CVR), through its official
 * "system-til-system" access. Free: a user id and password are issued by Erhvervsstyrelsen on
 * request (cvrselvbetjening@erst.dk). Off until DK_CVR_USERNAME and DK_CVR_PASSWORD are set.
 *
 * Checked on 16 Nov 2026 against Erhvervsstyrelsen's "Kom godt i gang med ElasticSearch"
 * (version 1, 3 Nov 2025) and its CVR index data catalogue: an Elasticsearch 6 endpoint at
 * http://distribution.virk.dk/cvr-permanent/virksomhed/_search, HTTP Basic, a Query DSL body by
 * POST, `term` on `Vrvirksomhed.cvrNummer`, replies under `hits.hits[]._source.Vrvirksomhed`,
 * company fields under `virksomhedMetadata` (`nyesteNavn.navn`, `nyesteVirksomhedsform`
 * {`virksomhedsformkode`, `kortBeskrivelse`, `langBeskrivelse`}, `sammensatStatus`,
 * `stiftelsesDato`, `nyesteBeliggenhedsadresse` {`postnummer`, `kommune.kommuneNavn`},
 * `nyesteHovedbranche.branchekode`, `antalPenheder`), and participants in `deltagerRelation`.
 * Company-form code 10 is Enkeltmandsvirksomhed (Danmarks Statistik). No numeric rate limit is
 * published: Erhvervsstyrelsen may block heavy users, so we stay at 2 requests a second.
 *
 * NOT confirmed, because no call can be made without credentials: the real reply bodies (the
 * samples in test/samples/dk-*.json are built from the catalogue); the `sammensatStatus`
 * values ("Aktiv", "NORMAL", "Ophørt"...: kept as given, lower-cased); whether management roles
 * appear in `organisationer[].hovedtype` or in `organisationsNavn[].navn` (both are read); how
 * a wrong password is answered (401 or 403 is assumed); whether https works (the official guide
 * uses plain http, so the password travels unencrypted: an owner decision, docs/NATIONAL-REGISTERS.md).
 *
 * Personal data. A sole proprietorship (Enkeltmandsvirksomhed, code 10 / "ENK") is a person's
 * business: nothing about it is kept, and it is never offered as a candidate. Participants are
 * people: only counts of current board and executive members are kept, never names.
 */

const BASE = 'http://distribution.virk.dk';
const SEARCH = `${BASE}/cvr-permanent/virksomhed/_search`;
const P = 'registry.dk.cvr';
const SOURCE = 'the Danish company register (CVR)';
const SOLE_PROPRIETORSHIP_CODE = 10;
const danishForms = makeNameNormaliser(['aps', 'as', 'ivs', 'ps', 'ks', 'is', 'smba', 'amba', 'fmba']);
/** "Kestrel Pay A/S" and "KESTREL PAY" compare equal: "A/S", "P/S", "K/S" and "I/S" are joined first. */
const normalise = (name: string) => danishForms(name.replace(/\b([apki])\s*\/\s*s\b/gi, '$1s'));

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

function metadata(company: Record<string, unknown>): Record<string, unknown> {
  return asRecord(company['virksomhedMetadata']);
}

export function isDanishSoleProprietorship(company: Record<string, unknown>): boolean {
  const form = asRecord(metadata(company)['nyesteVirksomhedsform']);
  const code = Number(form['virksomhedsformkode']);
  const short = (asString(form['kortBeskrivelse']) ?? '').toUpperCase();
  const long = (asString(form['langBeskrivelse']) ?? '').toLowerCase();
  // No form at all is treated as a person too: a record is kept only when it is clearly a company.
  if (Object.keys(form).length === 0) return true;
  return code === SOLE_PROPRIETORSHIP_CODE || short === 'ENK' || long.includes('enkeltmand');
}

function isCurrent(period: unknown): boolean {
  const p = asRecord(period);
  return Object.keys(p).length === 0 || asString(p['gyldigTil']) === undefined;
}

/** Which management body a participant sits on, now: "executive", "board" or null. Names are never read. */
function currentRole(relation: Record<string, unknown>): ('executive' | 'board')[] {
  const roles = new Set<'executive' | 'board'>();
  for (const org of asArray(relation['organisationer']).map(asRecord)) {
    const labels = [asString(org['hovedtype']), ...asArray(org['organisationsNavn']).map((n) => asString(asRecord(n)['navn']))]
      .filter((v): v is string => v !== undefined).join(' ').toLowerCase();
    const values = asArray(org['medlemsData']).map(asRecord).flatMap((m) => asArray(m['attributter']).map(asRecord))
      .flatMap((a) => asArray(a['vaerdier']).map(asRecord));
    const current = values.length === 0 ? true : values.some((v) => isCurrent(v['periode']));
    if (!current) continue;
    if (labels.includes('direktion')) roles.add('executive');
    if (labels.includes('bestyrelse')) roles.add('board');
  }
  return [...roles];
}

/** The facts for one company (never a sole proprietorship). Participants become counts here. */
export function parseDanishCompany(raw: unknown): Fact[] {
  const company = asRecord(raw);
  const meta = metadata(company);
  const form = asRecord(meta['nyesteVirksomhedsform']);
  const address = asRecord(meta['nyesteBeliggenhedsadresse']);
  const relations = asArray(company['deltagerRelation']).map(asRecord).map(currentRole);
  const facts: Fact[] = [
    fact('identified', true),
    fact('cvr_number', asString(company['cvrNummer']) ?? ''),
    fact('executive_members_count', relations.filter((r) => r.includes('executive')).length),
    fact('board_members_count', relations.filter((r) => r.includes('board')).length),
  ];
  const optional: [string, string | undefined][] = [
    ['registered_name', asString(asRecord(meta['nyesteNavn'])['navn'])],
    ['legal_form_code', asString(form['virksomhedsformkode'])],
    ['legal_form', asString(form['kortBeskrivelse'])],
    ['status', asString(meta['sammensatStatus'])?.toLowerCase()],
    ['founded_on', isoDate(meta['stiftelsesDato'])],
    ['industry_code', asString(asRecord(meta['nyesteHovedbranche'])['branchekode'])],
    // A company's registered address is public; only the postcode and municipality are kept.
    ['postcode', asString(address['postnummer'])],
    ['municipality', asString(asRecord(address['kommune'])['kommuneNavn'])],
  ];
  for (const [key, value] of optional) if (value !== undefined) facts.push(fact(key, value));
  if (typeof meta['antalPenheder'] === 'number') facts.push(fact('production_units_count', meta['antalPenheder']));
  return facts;
}

/** The words for a miss. Never "doesn't exist". */
export const DK_NOT_IN_REGISTER = {
  name: "We didn't find this name in the Danish company register (CVR). That doesn't mean the company doesn't exist: the name may be spelled differently there. Add the company's CVR number and we'll check again.",
  number: "We didn't find this CVR number in the Danish company register. That doesn't mean the company doesn't exist, so a person needs to check the number.",
  person: 'This CVR number belongs to a sole proprietorship, which is a person\'s business. We only check companies, so nothing about it is kept.',
} as const;

function hits(raw: unknown): Record<string, unknown>[] {
  return asArray(asRecord(asRecord(raw)['hits'])['hits']).map((hit) => asRecord(asRecord(asRecord(hit)['_source'])['Vrvirksomhed']));
}

async function search(http: Http, headers: Record<string, string>, body: unknown) {
  return http(SEARCH, { method: 'POST', headers, body: JSON.stringify(body), allow: [401, 403] });
}

export function createDanishCvrConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'dk.cvr',
    jurisdictions: ['DK'],
    capabilities: ['entity_lookup', 'officers'],
    factPrefix: P,
    sourceName: SOURCE,
    method: 'official_live',
    homeUrl: SEARCH,
    requiredEnv: ['DK_CVR_USERNAME', 'DK_CVR_PASSWORD'],
    rateLimit: { requests: 2, perMs: 1000 },
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      const user = (env['DK_CVR_USERNAME'] as string).trim();
      const password = (env['DK_CVR_PASSWORD'] as string).trim();
      const headers = { Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`, 'Content-Type': 'application/json', Accept: 'application/json' };

      if (ref.registry_number !== undefined) {
        const cvr = digitsOf(ref.registry_number);
        if (!isValidCvr(cvr)) {
          return { status: 'unsupported', sourceUrl: SEARCH, message: "That CVR number doesn't look right: it should be 8 digits and pass the CVR check. Correct it in your answers and we'll check again." };
        }
        const response = await search(http, headers, { query: { term: { 'Vrvirksomhed.cvrNummer': Number(cvr) } }, size: 1 });
        if (response.status === 401 || response.status === 403) return keyRefused(SOURCE, SEARCH);
        const match = response.status === 404 ? undefined : hits(response.json()).find((c) => asString(c['cvrNummer']) === cvr);
        if (!match) return { status: 'not_found', sourceUrl: SEARCH, raw: response.text, facts: [fact('identified', null)], message: DK_NOT_IN_REGISTER.number };
        if (isDanishSoleProprietorship(match)) return { status: 'not_found', sourceUrl: SEARCH, raw: response.text, facts: [fact('identified', null)], message: DK_NOT_IN_REGISTER.person };
        return { status: 'found', sourceUrl: SEARCH, raw: response.text, facts: parseDanishCompany(match), matchConfidence: 1 };
      }

      // match_phrase, not query_string: a company name is never read as search syntax.
      const response = await search(http, headers, { query: { match_phrase: { 'Vrvirksomhed.virksomhedMetadata.nyesteNavn.navn': ref.name } }, size: 10 });
      if (response.status === 401 || response.status === 403) return keyRefused(SOURCE, SEARCH);
      // Sole proprietorships are people: never offered as candidates.
      const companies = (response.status === 404 ? [] : hits(response.json())).filter((c) => !isDanishSoleProprietorship(c));
      const pick = pickByName(companies.map((c) => ({ name: asString(asRecord(metadata(c)['nyesteNavn'])['navn']) ?? '', id: asString(c['cvrNummer']) ?? '', item: c })), ref.name, normalise);
      if (pick.kind === 'one') return { status: 'found', sourceUrl: SEARCH, raw: response.text, facts: parseDanishCompany(pick.item), matchConfidence: 0.95 };
      if (pick.kind === 'many') {
        const outcome: LookupOutcome = {
          status: 'ambiguous', sourceUrl: SEARCH, raw: response.text, candidates: pick.candidates, matchConfidence: pick.confidence,
          message: 'A few companies in the Danish company register could be yours. Add your CVR number so we check the right one.',
        };
        return outcome;
      }
      return { status: 'not_found', sourceUrl: SEARCH, raw: response.text, facts: [fact('identified', null)], message: DK_NOT_IN_REGISTER.name };
    },
  }, deps);
}

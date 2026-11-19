import { defineConnector, type Http } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact, FactValue } from '../types.js';
import { digitsOf, isoDate, keyRefused } from './keyed-registers-common.js';

/**
 * ca.corporations: Corporations Canada's Federal Corporation API (Innovation, Science and
 * Economic Development Canada, ISED API Store). A key from the API Store's "Public Plan" (a My
 * ISED account with 2-step verification; no price is shown). Off until CA_CORPORATIONS_API_KEY is set.
 *
 * FEDERAL ONLY. It holds corporations under federal law (CBCA, NFP Act, Canada Cooperatives Act,
 * Boards of Trade Act...). A company incorporated under a province's or territory's law is not in
 * it, so a miss means "not a federal corporation in this register", never "doesn't exist".
 *
 * Checked on 16 Nov 2026 against the published OpenAPI 3.0.2 spec
 * (api.ised-isde.canada.ca/swagger/spec/corporations-en.json, version 2.0.0) and the API Store
 * docs: base https://apigateway-passerelledapi.ised-isde.canada.ca/corporations/api, header
 * `user-key`, GET /v1/corporations/{id}.json?lang=eng (an array [English, French]; a miss is
 * HTTP 200 with an array of message strings), fields `corporationId, act, status,
 * corporationNames[].CorporationName {name, nameType, current}, directorLimits {minimum, maximum},
 * annualReturns[].annualReturn {yearOfFiling}, activities[].activity {activity, date}`; GET
 * /v2/corporations/{id}/directors (`content[]`, or `_embedded.directors` in the spec's own
 * example). The Public Plan allows 60 calls a minute. There is no name search in the API: a
 * corporation number is needed. No check-digit rule is published, so only the shape is checked.
 *
 * NOT confirmed, because no call can be made without a key: real reply bodies (the samples
 * follow the spec); the wrapper keys' casing inside the arrays; the `status` strings (kept as
 * given, lower-cased); the `activity` words for incorporation ("Incorporation", also
 * amalgamation and continuance are read); the reply to a wrong key (401 or 403 per the spec).
 *
 * Personal data. Directors are counted, never named: their names and addresses are dropped here.
 */

const BASE = 'https://apigateway-passerelledapi.ised-isde.canada.ca/corporations/api';
const P = 'registry.ca.corporations';
const SOURCE = "Corporations Canada's federal register";

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

/** Reads `{ Key: {...} }` wrappers whatever their casing, or the object itself. */
function unwrap(item: unknown, key: string): Record<string, unknown> {
  const record = asRecord(item);
  const inner = Object.entries(record).find(([name]) => name.toLowerCase() === key.toLowerCase());
  return inner ? asRecord(inner[1]) : record;
}

const FORMATION = /^(incorporation|amalgamation|continuance)/i;

/** The facts for one federal corporation. */
export function parseFederalCorporation(raw: unknown): Fact[] {
  const corp = asRecord(raw);
  const names = asArray(corp['corporationNames']).map((n) => unwrap(n, 'CorporationName'));
  const current = names.find((n) => n['current'] === true && /primary|principal/i.test(asString(n['nameType']) ?? '')) ?? names.find((n) => n['current'] === true) ?? names[0];
  const years = asArray(corp['annualReturns']).map((r) => Number(unwrap(r, 'annualReturn')['yearOfFiling'])).filter((y) => Number.isInteger(y) && y > 1800);
  const formed = asArray(corp['activities']).map((a) => unwrap(a, 'activity'))
    .filter((a) => FORMATION.test(asString(a['activity']) ?? ''))
    .map((a) => isoDate(a['date'])).filter((d): d is string => d !== undefined).sort()[0];
  const limits = asRecord(corp['directorLimits']);
  const facts: Fact[] = [fact('identified', true), fact('corporation_number', asString(corp['corporationId']) ?? '')];
  const optional: [string, string | undefined][] = [
    ['registered_name', current ? asString(current['name']) : undefined],
    ['status', asString(corp['status'])?.toLowerCase()],
    ['act', asString(corp['act'])],
    ['incorporated_on', formed],
  ];
  for (const [key, value] of optional) if (value !== undefined) facts.push(fact(key, value));
  if (years.length > 0) facts.push(fact('last_annual_return_year', Math.max(...years)));
  if (typeof limits['minimum'] === 'number') facts.push(fact('directors_minimum', limits['minimum']));
  if (typeof limits['maximum'] === 'number') facts.push(fact('directors_maximum', limits['maximum']));
  return facts;
}

/** How many directors, from either documented shape. Their names are never read. */
export function countFederalDirectors(raw: unknown): number | null {
  const record = asRecord(raw);
  if (Array.isArray(record['content'])) return record['content'].length;
  const embedded = asRecord(record['_embedded'])['directors'];
  if (Array.isArray(embedded)) return embedded.length;
  return Array.isArray(raw) ? raw.length : null;
}

export const CA_MESSAGES = {
  needsNumber: "Corporations Canada's API can only look up a corporation number, not a name. It covers federal corporations only. Add your federal corporation number (for example 1234567-8) and we'll check it.",
  notFound: "We didn't find this corporation number in Corporations Canada's federal register. That doesn't mean the company doesn't exist: companies incorporated under a province's or territory's law aren't in this register. A person needs to check this.",
} as const;

async function directorCount(http: Http, headers: Record<string, string>, id: string): Promise<{ count: number | null; raw: string }> {
  try {
    const response = await http(`${BASE}/v2/corporations/${id}/directors`, { headers: { ...headers, 'Accept-Language': 'en' } });
    if (response.status === 404) return { count: null, raw: response.text };
    return { count: countFederalDirectors(response.json()), raw: response.text };
  } catch {
    // The directors list being down leaves that count unknown. It doesn't sink the record.
    return { count: null, raw: '' };
  }
}

export function createCanadaCorporationsConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'ca.corporations',
    jurisdictions: ['CA'],
    capabilities: ['entity_lookup', 'officers', 'filings'],
    factPrefix: P,
    sourceName: SOURCE,
    method: 'official_live',
    homeUrl: BASE,
    requiredEnv: ['CA_CORPORATIONS_API_KEY'],
    // The Public Plan allows 60 a minute. Each lookup makes two calls.
    rateLimit: { requests: 50, perMs: 60_000 },
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      if (ref.registry_number === undefined) return { status: 'unsupported', sourceUrl: BASE, message: CA_MESSAGES.needsNumber };
      // "1234567-8" as printed on a certificate, or the digits alone. Up to 8 digits; no published check digit.
      const id = digitsOf(ref.registry_number).replace(/^0+(?=\d)/, '');
      if (!/^\d{1,8}$/.test(id)) {
        return { status: 'unsupported', sourceUrl: BASE, message: "That corporation number doesn't look right: a federal corporation number is up to 8 digits, often printed as 1234567-8. Correct it in your answers and we'll check again." };
      }
      const headers = { 'user-key': (env['CA_CORPORATIONS_API_KEY'] as string).trim(), Accept: 'application/json' };
      const url = `${BASE}/v1/corporations/${id}.json?lang=eng`;
      const response = await http(url, { headers, allow: [401, 403] });
      if (response.status === 401 || response.status === 403) return keyRefused(SOURCE, BASE);
      const body = response.status === 404 ? [] : asArray(response.json());
      // A miss is HTTP 200 with message strings instead of objects.
      const record = body.map(asRecord).find((item) => asString(item['corporationId']) !== undefined);
      if (!record) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: CA_MESSAGES.notFound };
      const facts = parseFederalCorporation(record);
      const directors = await directorCount(http, headers, id);
      if (directors.count !== null) facts.push(fact('directors_count', directors.count));
      return { status: 'found', sourceUrl: url, raw: [response.text, directors.raw].join('\n'), facts, matchConfidence: 1 };
    },
  }, deps);
}

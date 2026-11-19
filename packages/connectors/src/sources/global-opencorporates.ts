import { defineConnector } from '../runtime.js';
import { asArray, asRecord, asString, toIsoDate } from '../text.js';
import type { Candidate, CompanyRef, Connector, ConnectorDeps, Fact, FactValue } from '../types.js';
import { companyNameSimilarity, sameCompanyName } from './legal-forms.js';

/**
 * global.opencorporates: the OpenCorporates API, a paid company database built from official
 * registers around the world. Our fallback register for countries with no official source built.
 *
 * Checked against the official API reference (api.opencorporates.com/documentation/API-Reference,
 * v0.4.8) on 16 Nov 2026: base https://api.opencorporates.com/v0.4; the key goes in the api_token
 * query value; GET /companies/{jurisdiction_code}/{company_number} gives results.company; GET
 * /companies/search with q, jurisdiction_code, per_page (at most 100), page and
 * normalise_company_name gives results.companies[].company and total_count. Company fields:
 * name, company_number, jurisdiction_code, incorporation_date, dissolution_date, company_type,
 * current_status, inactive, branch ("F" an out-of-jurisdiction company, "L" a local office, null
 * not a branch or not known), source.publisher, officers[].officer (name, position, start_date,
 * end_date). Jurisdiction codes are lower-case ISO: "gb", and for a state "us_de". 401 is a bad
 * key, 403 is "returned during rate limiting", 503 is overload, a missing key, or a company whose
 * details are temporarily withheld. NOT checked against a real reply: there is no key yet.
 *
 * Countries. DECIDED HERE, not left to the pipeline: this source answers only for a country with
 * no company-register source of its own. createConnectors passes the countries the other
 * entity-lookup sources cover and that are switched on (`officialCountries`); for those this answers "unavailable" with a
 * plain reason and calls nothing, so we never pay for what an official source already says. The
 * United States has no national register, so a US company needs its state ("US-DE").
 *
 * Licence. OpenCorporates data is under the Open Database Licence (share-alike, attribution)
 * unless the account is a paid commercial one: an owner decision (docs/ENGINE-ACCOUNTS-AND-KEYS.md).
 *
 * Personal data. Officers are reduced here to how many are current and their role titles: no
 * names, birth dates or addresses. A company whose type says it is a sole trader or another
 * person's own business is never kept and never offered as a candidate. Addresses aren't kept.
 */

const BASE = 'https://api.opencorporates.com/v0.4';
const P = 'registry.global.opencorporates';
/** No per-second limit is published; plans have daily and monthly allowances. We ask slowly. */
const RATE = { requests: 2, perMs: 1000 };
const PER_PAGE = 10;
/** The countries with their own company-register source today. createConnectors passes the live list. */
export const DEFAULT_OFFICIAL_COUNTRIES = ['GB', 'FR', 'US-DE', 'NG'] as const;
/** Company types that are a person's own business. Matched loosely, on purpose. */
const PERSON_TYPE = /sole|individual|natural person|enkeltperson|enkeltmand|einzel|entrepreneur individuel|auto.?entrepreneur|ditta individuale|empresario individual|eenmanszaak|toiminimi|enskild/i;

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

/** "US-DE" to "us_de", "GB" to "gb". Null for a country OpenCorporates holds only by state. */
export function openCorporatesJurisdiction(jurisdiction: string): string | null {
  if (jurisdiction === 'US') return null;
  if (jurisdiction === 'GB-NIR' || jurisdiction === 'GB-SCT' || jurisdiction === 'GB-ENG' || jurisdiction === 'GB-WLS') return 'gb';
  return jurisdiction.toLowerCase().replace('-', '_');
}

export function isOpenCorporatesPerson(company: Record<string, unknown>): boolean {
  return PERSON_TYPE.test(asString(company['company_type']) ?? '');
}

/** The facts for one company. Officers become a count and role titles right here. */
export function parseOpenCorporatesCompany(raw: unknown): Fact[] {
  const company = asRecord(raw);
  const officers = asArray(company['officers']).map((item) => asRecord(asRecord(item)['officer']));
  const current = officers.filter((officer) => asString(officer['end_date']) === undefined && officer['inactive'] !== true);
  const roles = [...new Set(current.map((officer) => asString(officer['position'])?.toLowerCase()).filter((role): role is string => role !== undefined))].sort();
  const branch = asString(company['branch']);
  const facts: Fact[] = [
    fact('identified', true),
    fact('company_number', asString(company['company_number']) ?? ''),
    fact('is_branch', branch === 'F' || branch === 'L' ? true : null),
  ];
  if (typeof company['inactive'] === 'boolean') facts.push(fact('inactive', company['inactive']));
  const optional: [string, string | undefined][] = [
    ['registered_name', asString(company['name'])],
    ['jurisdiction_code', asString(company['jurisdiction_code'])],
    ['status', asString(company['current_status'])],
    ['incorporated_on', toIsoDate(asString(company['incorporation_date'])) ?? undefined],
    ['dissolved_on', toIsoDate(asString(company['dissolution_date'])) ?? undefined],
    ['company_type', asString(company['company_type'])],
    ['branch_type', branch === 'F' ? 'out_of_jurisdiction' : branch === 'L' ? 'local_office' : undefined],
    ['source_register', asString(asRecord(company['source'])['publisher'])],
  ];
  for (const [key, value] of optional) if (value !== undefined) facts.push(fact(key, value));
  // Only when the reply carried officers at all: a search result doesn't.
  if (Array.isArray(company['officers'])) facts.push(fact('officers_count', current.length), fact('officers_role_titles', roles));
  return facts;
}

export const OPENCORPORATES_WORDS = {
  official: "We already check this country's company register through its own source, so this backup source isn't used.",
  needState: 'OpenCorporates holds US companies by state. Choose the state the company is registered in (for example US-DE) and we will check again.',
  missNumber: "We didn't find this company number in OpenCorporates for that country. That doesn't mean the company doesn't exist: OpenCorporates copies official registers and can be behind or incomplete. Check the number in your answers.",
  missName: "We didn't find this name in OpenCorporates for that country. That doesn't mean the company doesn't exist: OpenCorporates copies official registers and can be behind or incomplete. Add the company number and we'll check again.",
  person: "This record is a sole trader's, which is a person's. We don't keep records about people, so it isn't used here.",
  allowance: "OpenCorporates says we've used up our allowance for now. We'll ask again later.",
  ambiguous: 'A few companies in OpenCorporates could be yours. Add the company number so we check the right one.',
} as const;

function numberOf(ref: CompanyRef): string | undefined {
  return ref.registry_number ?? ref.company_number ?? ref.file_number ?? ref.rc_number;
}

/**
 * `officialCountries` may be a function, so a country counts as covered only while its own
 * register source is switched on (its key set). Until then OpenCorporates still answers for it.
 */
export function createOpenCorporatesConnector(deps: ConnectorDeps, options: { officialCountries?: readonly string[] | (() => readonly string[]) } = {}): Connector {
  const given = options.officialCountries ?? DEFAULT_OFFICIAL_COUNTRIES;
  const official = (): ReadonlySet<string> => new Set(typeof given === 'function' ? given() : given);
  // Object.assign, not a spread: a spread would freeze the `configured` getter at its first value.
  return Object.assign(defineConnector({
    id: 'global.opencorporates',
    jurisdictions: ['*'],
    capabilities: ['entity_lookup', 'officers'],
    factPrefix: P,
    sourceName: 'OpenCorporates',
    method: 'licensed_vendor',
    homeUrl: BASE,
    requiredEnv: ['OPENCORPORATES_API_TOKEN'],
    rateLimit: RATE,
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      if (official().has(ref.jurisdiction)) return { status: 'unavailable', sourceUrl: BASE, message: OPENCORPORATES_WORDS.official };
      const jurisdiction = openCorporatesJurisdiction(ref.jurisdiction);
      if (!jurisdiction) return { status: 'unsupported', sourceUrl: BASE, message: OPENCORPORATES_WORDS.needState };
      const token = encodeURIComponent((env['OPENCORPORATES_API_TOKEN'] as string).trim());
      const headers = { Accept: 'application/json' };
      // 403 is OpenCorporates' rate limit, not a bad key (API reference).
      const ask = (url: string) => http(`${url}${url.includes('?') ? '&' : '?'}api_token=${token}`, { headers, allow: [403] });

      async function company(number: string, matchConfidence: number, missMessage: string) {
        const url = `${BASE}/companies/${jurisdiction}/${encodeURIComponent(number)}`;
        const response = await ask(url);
        if (response.status === 403) return { status: 'error' as const, sourceUrl: url, message: OPENCORPORATES_WORDS.allowance };
        if (response.status === 404) return { status: 'not_found' as const, sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: missMessage };
        const record = asRecord(asRecord(asRecord(response.json())['results'])['company']);
        if (isOpenCorporatesPerson(record)) return { status: 'not_found' as const, sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: OPENCORPORATES_WORDS.person };
        return { status: 'found' as const, sourceUrl: url, raw: response.text, facts: parseOpenCorporatesCompany(record), matchConfidence };
      }

      const number = numberOf(ref);
      if (number) return company(number.replace(/\s+/g, ''), 1, OPENCORPORATES_WORDS.missNumber);

      const url = `${BASE}/companies/search?q=${encodeURIComponent(ref.name)}&jurisdiction_code=${jurisdiction}&per_page=${PER_PAGE}&page=1&normalise_company_name=true`;
      const response = await ask(url);
      if (response.status === 403) return { status: 'error', sourceUrl: url, message: OPENCORPORATES_WORDS.allowance };
      const found = response.status === 404 ? [] : asArray(asRecord(asRecord(response.json())['results'])['companies']).map((item) => asRecord(asRecord(item)['company']));
      // A person's own business is never offered as a candidate.
      const companies = found.filter((item) => !isOpenCorporatesPerson(item) && asString(item['company_number']));
      const name = (item: Record<string, unknown>) => asString(item['name']) ?? '';
      const exact = companies.filter((item) => sameCompanyName(name(item), ref.name));
      const active = exact.length > 1 ? exact.filter((item) => item['inactive'] === false) : exact;
      const only = active.length === 1 ? active[0] : undefined;
      if (only) {
        // The search result has no officers: the company itself is read by its number.
        const full = await company(asString(only['company_number']) as string, 0.9, OPENCORPORATES_WORDS.missName);
        if (full.status === 'found' || full.status === 'error') return full;
      }
      const close = exact.length > 1 ? exact : companies.filter((item) => companyNameSimilarity(name(item), ref.name) >= 0.6);
      if (close.length > 0) {
        const candidates: Candidate[] = close.slice(0, 5).map((item) => ({ name: name(item), identifier: asString(item['company_number']) as string }));
        return {
          status: 'ambiguous', sourceUrl: url, raw: response.text, candidates,
          matchConfidence: Math.max(...close.map((item) => companyNameSimilarity(name(item), ref.name))),
          message: OPENCORPORATES_WORDS.ambiguous,
        };
      }
      return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: OPENCORPORATES_WORDS.missName };
    },
  }, deps), { fallbackRegister: true });
}

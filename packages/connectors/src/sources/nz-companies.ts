import { defineConnector, type Http } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact, FactValue, LookupOutcome } from '../types.js';
import { digitsOf, isoDate, isValidNzbn, keyRefused, makeNameNormaliser, pickByName } from './keyed-registers-common.js';

/**
 * nz.companies: the New Zealand Companies Office register, read through the NZBN API v5 on the
 * MBIE API portal (api.business.govt.nz). The Companies Office's own Companies API is for
 * filings only and points readers to the NZBN API. Free: a subscription key from
 * portal.api.business.govt.nz. Off until NZ_NZBN_API_KEY is set.
 *
 * Checked on 16 Nov 2026 against the portal's published OpenAPI for "nzbn" (operations
 * EntitiesGet and EntitiesByNzbnGet, FullEntity schema), the official Postman guides (Aug 2024)
 * and the NZBN reference data workbook (Mar 2023): base https://api.business.govt.nz/gateway/nzbn/v5,
 * header `Ocp-Apim-Subscription-Key`, GET /entities?search-term=&page-size= (items[] with
 * `nzbn, entityName, entityTypeCode, entityStatusCode, entityStatusDescription,
 * sourceRegisterUniqueId`) and GET /entities/{nzbn} (`entityName, entityTypeCode,
 * entityTypeDescription, entityStatusCode, entityStatusDescription, registrationDate,
 * sourceRegisterUniqueIdentifier, roles[] {roleType, roleStatus, endDate, roleEntity, rolePerson},
 * "company-details" {annualReturnFilingMonth, annualReturnLastFiled}`), errors 400, 401, 403, 404.
 * Entity type `Sole_Trader` is a sole trader; `LTD` a limited company. Status 50 is Registered,
 * 80 Removed. The NZBN is a GS1 GTIN-13 (check digit verified on two documented NZBNs). No rate
 * limit is published; we stay at 2 requests a second.
 *
 * NOT confirmed, because no call can be made without a key: real reply bodies (the samples are
 * built from the schema); the date-time format; the `roleType` / `roleStatus` strings beyond
 * "Director"; whether the search term also matches a company number (it is tried, and the
 * result must carry that number); the reply to a wrong key (401 or 403 assumed).
 *
 * Personal data. Sole traders are people: never kept, never offered as candidates. Directors
 * become counts. No person's name, address or birth date leaves this file.
 */

const BASE = 'https://api.business.govt.nz/gateway/nzbn/v5';
const P = 'registry.nz.companies';
const SOURCE = 'the New Zealand Companies Office (NZBN register)';
const normalise = makeNameNormaliser(['limited', 'ltd', 'unlimited']);

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

export function isNzSoleTrader(entity: Record<string, unknown>): boolean {
  const code = (asString(entity['entityTypeCode']) ?? '').toLowerCase().replace(/[^a-z]/g, '');
  const description = (asString(entity['entityTypeDescription']) ?? '').toLowerCase();
  return code === 'soletrader' || description.includes('sole trader');
}

function isCurrentRole(role: Record<string, unknown>): boolean {
  if (asString(role['endDate']) !== undefined) return false;
  const status = (asString(role['roleStatus']) ?? '').toLowerCase();
  return status === '' || status === 'active' || status === 'current';
}

/** The facts for one entity that isn't a sole trader. Directors are counted here, never named. */
export function parseNzEntity(raw: unknown): Fact[] {
  const entity = asRecord(raw);
  const details = asRecord(entity['company-details']);
  const directors = asArray(entity['roles']).map(asRecord)
    .filter((role) => (asString(role['roleType']) ?? '').toLowerCase() === 'director' && isCurrentRole(role));
  const facts: Fact[] = [
    fact('identified', true),
    fact('nzbn', asString(entity['nzbn']) ?? ''),
    fact('directors_count', directors.length),
    fact('directors_entity_count', directors.filter((role) => Object.keys(asRecord(role['roleEntity'])).length > 0).length),
  ];
  const optional: [string, string | undefined][] = [
    ['company_number', asString(entity['sourceRegisterUniqueIdentifier'])],
    ['registered_name', asString(entity['entityName'])],
    ['status_code', asString(entity['entityStatusCode'])],
    ['status', asString(entity['entityStatusDescription'])?.toLowerCase()],
    ['entity_type_code', asString(entity['entityTypeCode'])],
    ['entity_type', asString(entity['entityTypeDescription'])],
    ['incorporated_on', isoDate(entity['registrationDate'])],
    ['annual_return_last_filed_on', isoDate(details['annualReturnLastFiled'])],
  ];
  for (const [key, value] of optional) if (value !== undefined) facts.push(fact(key, value));
  const month = Number(details['annualReturnFilingMonth']);
  if (Number.isInteger(month) && month >= 1 && month <= 12) facts.push(fact('annual_return_filing_month', month));
  return facts;
}

export const NZ_NOT_IN_REGISTER = {
  name: "We didn't find this name in the New Zealand Companies Office register. That doesn't mean the company doesn't exist: the name may be spelled differently there. Add the company's NZBN and we'll check again.",
  number: "We didn't find this number in the New Zealand Companies Office register. That doesn't mean the company doesn't exist, so a person needs to check the number.",
  person: "This number belongs to a sole trader, which is a person. We only check companies, so nothing about it is kept.",
} as const;

async function entityByNzbn(http: Http, headers: Record<string, string>, nzbn: string, confidence: number): Promise<LookupOutcome> {
  const url = `${BASE}/entities/${nzbn}`;
  const response = await http(url, { headers, allow: [401, 403] });
  if (response.status === 401 || response.status === 403) return keyRefused(SOURCE, BASE);
  if (response.status === 404) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: NZ_NOT_IN_REGISTER.number };
  const entity = asRecord(response.json());
  if (isNzSoleTrader(entity)) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: NZ_NOT_IN_REGISTER.person };
  return { status: 'found', sourceUrl: url, raw: response.text, facts: parseNzEntity(entity), matchConfidence: confidence };
}

export function createNzCompaniesConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'nz.companies',
    jurisdictions: ['NZ'],
    capabilities: ['entity_lookup', 'officers', 'filings'],
    factPrefix: P,
    sourceName: SOURCE,
    method: 'official_live',
    homeUrl: BASE,
    requiredEnv: ['NZ_NZBN_API_KEY'],
    rateLimit: { requests: 2, perMs: 1000 },
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      const headers = { 'Ocp-Apim-Subscription-Key': (env['NZ_NZBN_API_KEY'] as string).trim(), Accept: 'application/json' };
      const searchUrl = (term: string) => `${BASE}/entities?search-term=${encodeURIComponent(term)}&page-size=20`;
      const search = async (term: string) => {
        const response = await http(searchUrl(term), { headers, allow: [401, 403] });
        if (response.status === 401 || response.status === 403) return null;
        const items = response.status === 404 ? [] : asArray(asRecord(response.json())['items']).map(asRecord);
        return { response, items: items.filter((item) => !isNzSoleTrader(item)) };
      };

      if (ref.registry_number !== undefined) {
        const number = digitsOf(ref.registry_number);
        if (number.length === 13) {
          if (!isValidNzbn(number)) return { status: 'unsupported', sourceUrl: BASE, message: "That NZBN doesn't look right: it should be 13 digits and pass the NZBN check. Correct it in your answers and we'll check again." };
          return entityByNzbn(http, headers, number, 1);
        }
        if (!/^\d{1,8}$/.test(number)) {
          return { status: 'unsupported', sourceUrl: BASE, message: "That number doesn't look right: give the 13-digit NZBN or the company number. Correct it in your answers and we'll check again." };
        }
        // A company number: found through the search, and only taken when the result carries it.
        const found = await search(number);
        if (!found) return keyRefused(SOURCE, BASE);
        const match = found.items.find((item) => asString(item['sourceRegisterUniqueId']) === number || asString(item['sourceRegisterUniqueIdentifier']) === number);
        const nzbn = match ? asString(match['nzbn']) : undefined;
        if (!nzbn) return { status: 'not_found', sourceUrl: searchUrl(number), raw: found.response.text, facts: [fact('identified', null)], message: NZ_NOT_IN_REGISTER.number };
        return entityByNzbn(http, headers, nzbn, 1);
      }

      const found = await search(ref.name);
      if (!found) return keyRefused(SOURCE, BASE);
      const pick = pickByName(found.items.map((item) => ({ name: asString(item['entityName']) ?? '', id: asString(item['nzbn']) ?? '', item })), ref.name, normalise);
      if (pick.kind === 'one') return entityByNzbn(http, headers, asString(pick.item['nzbn']) as string, 0.95);
      if (pick.kind === 'many') {
        const outcome: LookupOutcome = {
          status: 'ambiguous', sourceUrl: searchUrl(ref.name), raw: found.response.text, candidates: pick.candidates, matchConfidence: pick.confidence,
          message: 'A few companies in the New Zealand Companies Office register could be yours. Add your NZBN so we check the right one.',
        };
        return outcome;
      }
      return { status: 'not_found', sourceUrl: searchUrl(ref.name), raw: found.response.text, facts: [fact('identified', null)], message: NZ_NOT_IN_REGISTER.name };
    },
  }, deps);
}

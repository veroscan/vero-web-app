import { defineConnector, type Http } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact, FactValue, LookupOutcome } from '../types.js';
import { digitsOf, isoDate, keyRefused, makeNameNormaliser, pickByName } from './keyed-registers-common.js';

/**
 * ie.cro: the Irish Companies Registration Office, through CRO Open Services (a REST API).
 * Free for company searches: an API key is issued after signing up and returning the signed
 * Open Services terms to the CRO. Only buying documents needs a paid CRO customer account, and we
 * never buy documents. Off until IE_CRO_EMAIL and IE_CRO_API_KEY are set.
 *
 * Checked on 16 Nov 2026 against the CRO's public API help (services.cro.ie/cws/help, operations
 * "companies" and "company") and its sample code (services.cro.ie/code/phpjson.txt): base
 * https://services.cro.ie/cws, HTTP Basic with the registered email and the key, GET
 * companies?company_name=&company_bus_ind=C&searchType=&max=&format=Json (searchType 1 exact,
 * 2 starts with), GET company/{number}/C?format=Json; fields `company_num, company_bus_ind,
 * company_name, company_status_code, company_status_desc, company_status_date, company_reg_date,
 * comp_type_desc, company_type_code, last_ar_date, next_ar_date, last_acc_date`. An unknown number
 * returns a company object with empty fields, not an error. `company_bus_ind` C is the company
 * register; B is the business-names register (which holds sole traders) and is never asked.
 *
 * NOT confirmed, because no call can be made without a key: real reply bodies (the samples
 * follow the documented fields); the date format (ISO, dd/mm/yyyy and "/Date(ms)/" are read);
 * the `company_status_desc` words (kept as given, lower-cased); the reply to a wrong key (401
 * assumed); any rate limit (none published; we stay at 2 requests a second). The CRO's
 * services.cro.ie overview pages refused our documentation reader, so the sign-up steps come
 * from the CRO's "Access to CRO Data" page as found by a search engine.
 *
 * Personal data. Only the company register is read. Officers are not read at all.
 */

const BASE = 'https://services.cro.ie/cws';
const P = 'registry.ie.cro';
const SOURCE = 'the Irish Companies Registration Office (CRO)';
const normalise = makeNameNormaliser(['limited', 'ltd', 'teoranta', 'teo', 'dac', 'clg', 'plc', 'uc', 'ulc', 'designated', 'activity', 'company']);

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

/** HTML entities the API may send in names. */
function decode(text: string | undefined): string | undefined {
  return text?.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

/** The facts for one company on the company register. */
export function parseCroCompany(raw: unknown): Fact[] {
  const company = asRecord(raw);
  const facts: Fact[] = [fact('identified', true), fact('company_number', asString(company['company_num']) ?? '')];
  const optional: [string, string | undefined][] = [
    ['registered_name', decode(asString(company['company_name']))],
    ['status', asString(company['company_status_desc'])?.toLowerCase()],
    ['status_code', asString(company['company_status_code'])],
    ['status_since', isoDate(company['company_status_date'])],
    ['company_type', asString(company['comp_type_desc'])],
    ['company_type_code', asString(company['company_type_code'])],
    ['registered_on', isoDate(company['company_reg_date'])],
    ['last_annual_return_on', isoDate(company['last_ar_date'])],
    ['next_annual_return_due', isoDate(company['next_ar_date'])],
    ['last_accounts_on', isoDate(company['last_acc_date'])],
  ];
  for (const [key, value] of optional) if (value !== undefined) facts.push(fact(key, value));
  return facts;
}

export const IE_NOT_IN_REGISTER = {
  name: "We didn't find this name on the Irish company register (CRO). That doesn't mean the company doesn't exist: the name may be spelled differently there. Add the company's CRO number and we'll check again.",
  number: "We didn't find this CRO number on the Irish company register. That doesn't mean the company doesn't exist, so a person needs to check the number.",
} as const;

async function get(http: Http, url: string, headers: Record<string, string>) {
  const response = await http(url, { headers, allow: [401, 403] });
  return { response, refused: response.status === 401 || response.status === 403 };
}

export function createCroConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'ie.cro',
    jurisdictions: ['IE'],
    capabilities: ['entity_lookup', 'filings'],
    factPrefix: P,
    sourceName: SOURCE,
    method: 'official_live',
    homeUrl: BASE,
    requiredEnv: ['IE_CRO_EMAIL', 'IE_CRO_API_KEY'],
    rateLimit: { requests: 2, perMs: 1000 },
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      const email = (env['IE_CRO_EMAIL'] as string).trim();
      const key = (env['IE_CRO_API_KEY'] as string).trim();
      const headers = { Authorization: `Basic ${Buffer.from(`${email}:${key}`).toString('base64')}`, Accept: 'application/json' };

      if (ref.registry_number !== undefined) {
        const number = digitsOf(ref.registry_number).replace(/^0+(?=\d)/, '');
        if (!/^\d{1,7}$/.test(number)) return { status: 'unsupported', sourceUrl: BASE, message: "That CRO number doesn't look right: it should be up to 7 digits. Correct it in your answers and we'll check again." };
        const url = `${BASE}/company/${number}/C?format=Json&htmlEnc=0`;
        const { response, refused } = await get(http, url, headers);
        if (refused) return keyRefused(SOURCE, BASE);
        const company = response.status === 404 ? {} : asRecord(response.json());
        // An unknown number comes back as a company with empty fields.
        if (asString(company['company_num']) !== number || asString(company['company_name']) === undefined) {
          return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: IE_NOT_IN_REGISTER.number };
        }
        return { status: 'found', sourceUrl: url, raw: response.text, facts: parseCroCompany(company), matchConfidence: 1 };
      }

      // "Starts with" on the name without its legal form, so "Kestrel Pay Ltd" also finds "KESTREL PAY LIMITED".
      const stem = ref.name.trim().replace(/[\s,]+(designated activity company|limited|ltd\.?|teoranta|teo\.?|dac|clg|plc|ulc|uc)$/i, '') || ref.name.trim();
      const url = `${BASE}/companies?company_name=${encodeURIComponent(stem)}&company_bus_ind=C&searchType=2&max=20&format=Json&htmlEnc=0`;
      const { response, refused } = await get(http, url, headers);
      if (refused) return keyRefused(SOURCE, BASE);
      // Companies only: business names (where sole traders are) are never asked for, and anything else is dropped.
      const rows = (response.status === 404 ? [] : asArray(response.json()).map(asRecord))
        .filter((row) => (asString(row['company_bus_ind']) ?? 'C').toUpperCase() === 'C');
      const pick = pickByName(rows.map((row) => ({ name: decode(asString(row['company_name'])) ?? '', id: asString(row['company_num']) ?? '', item: row })), ref.name, normalise);
      if (pick.kind === 'one') return { status: 'found', sourceUrl: url, raw: response.text, facts: parseCroCompany(pick.item), matchConfidence: 0.95 };
      if (pick.kind === 'many') {
        const outcome: LookupOutcome = {
          status: 'ambiguous', sourceUrl: url, raw: response.text, candidates: pick.candidates, matchConfidence: pick.confidence,
          message: 'A few companies on the Irish company register could be yours. Add your CRO number so we check the right one.',
        };
        return outcome;
      }
      return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: IE_NOT_IN_REGISTER.name };
    },
  }, deps);
}

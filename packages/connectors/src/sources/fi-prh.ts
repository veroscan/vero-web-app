import { defineConnector } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact } from '../types.js';
import { chooseByName, factIn, isValidFinnishBusinessId, normaliseFinnishBusinessId, publicUserAgent, pushDefined, registerWords, uniqueSorted } from './national-common.js';

/**
 * fi.prh: the Finnish Business Information System (YTJ) open data API v3, run by the Finnish
 * Patent and Registration Office (PRH) with the Tax Administration. Free, no key, official.
 * Licence: Creative Commons Attribution 4.0.
 *
 * Checked against the official OpenAPI description (avoindata.prh.fi/opendata-ytj-api/v3/schema,
 * "Opendata YTJ-Api", read from avoindata.prh.fi/en/ytj/swagger-ui) and its code lists
 * (/description?code=YRMU, REK, REK_KDI, STATUS3, SELTILA,SANE,KONK) on 16 Nov 2026:
 * GET /companies?businessId=... or ?name=... gives `totalResults` and `companies[]` (100 a page);
 * each has `businessId.value`, `names[]` (type "1" is the company name, `version` 1 is current),
 * `companyForms[]`, `companySituations[]` (KONK bankruptcy, SELTILA liquidation, SANE
 * re-organisation), `registeredEntries[]` (register 1 trade register, 5 prepayment register,
 * 6 VAT, 7 employer register), `tradeRegisterStatus`, `status` (1 pending, 2 valid, 5 invalidated),
 * `registrationDate`, `endDate`, `mainBusinessLine`. 429 means "too many requests"; no number is
 * published, so we stay at 2 requests a second.
 *
 * Checked against a real reply on 16 Nov 2026 (Nokia Oyj, 0112038-9): the company form's `type` is
 * the NUMBER from the YRMU list ("17" for a public limited company), not the letter code the
 * search filter takes ("OYJ"), so both are understood here.
 *
 * What it can't say. A miss means "not in this open data", never "doesn't exist": sole traders
 * (toiminimi) are not published in it at all, by design.
 *
 * Personal data. The open data holds no people. A record without a known company form (a sole
 * trader, if one ever appeared) is never kept and never offered as a candidate.
 */

const BASE = 'https://avoindata.prh.fi/opendata-ytj-api/v3';
const P = 'registry.fi.prh';
const fact = factIn(P);
/** Not published (429 is documented). Two a second. */
const RATE = { requests: 2, perMs: 1000 };

export const FI_WORDS = registerWords({
  register: 'the Finnish business register (PRH and YTJ)',
  numberLabel: 'Business ID (Y-tunnus)',
  numberFormat: '7 digits, a dash and a check digit, like 1234567-8',
});

/** The YRMU company forms: the number the API returns, and the letter code its filter takes. */
const COMPANY_FORMS: Readonly<Record<string, string>> = {
  2: 'AOY', 3: 'ASH', 4: 'ASY', 5: 'AY', 6: 'AYH', 7: 'ETS', 8: 'ETY', 9: 'HY', 10: 'KOY', 11: 'KVJ', 12: 'KVY', 13: 'KY', 14: 'OK',
  15: 'OP', 16: 'OY', 17: 'OYJ', 18: 'SÄÄ', 19: 'SL', 20: 'SP', 21: 'TYH', 22: 'VALTLL', 23: 'VOJ', 24: 'VOY', 25: 'VY', 80: 'SE', 83: 'SCE', 84: 'SCP',
};
const FORM_LETTERS = new Set(Object.values(COMPANY_FORMS));

const TRADE_REGISTER: Readonly<Record<string, string>> = { 0: 'unregistered', 1: 'registered', 2: 'removed', 3: 'start_up_not_registered', 4: 'ceased' };
const ID_STATUS: Readonly<Record<string, string>> = { 1: 'pending', 2: 'valid', 5: 'invalidated' };
const SITUATIONS: Readonly<Record<string, string>> = { KONK: 'bankruptcy', SELTILA: 'liquidation', SANE: 'reorganisation' };

const current = <T extends Record<string, unknown>>(items: T[]) => items.filter((item) => item['endDate'] === undefined || item['endDate'] === null);

function currentForm(company: Record<string, unknown>): Record<string, unknown> | undefined {
  const forms = current(asArray(company['companyForms']).map(asRecord));
  return forms.find((form) => form['version'] === 1) ?? forms[0];
}

/** The letter code of the current company form ("OYJ"), whichever way the record writes it. */
function formLetters(company: Record<string, unknown>): string | undefined {
  const type = asString(currentForm(company)?.['type']);
  if (type === undefined) return undefined;
  return COMPANY_FORMS[type] ?? (FORM_LETTERS.has(type) ? type : undefined);
}

/** Kept as a company only with a known company form and a name. */
export function isFinnishPersonRecord(company: Record<string, unknown>): boolean {
  return formLetters(company) === undefined || companyName(company) === undefined;
}

function companyName(company: Record<string, unknown>): string | undefined {
  const names = current(asArray(company['names']).map(asRecord)).filter((name) => asString(name['type']) === '1');
  return asString((names.find((name) => name['version'] === 1) ?? names[0])?.['name']);
}

function english(descriptions: unknown): string | undefined {
  const all = asArray(descriptions).map(asRecord);
  return asString((all.find((item) => asString(item['languageCode']) === '3') ?? all[0])?.['description']);
}

function onRegister(company: Record<string, unknown>, register: string): boolean | undefined {
  const entries = asArray(company['registeredEntries']).map(asRecord);
  if (entries.length === 0) return undefined;
  return current(entries).some((entry) => asString(entry['register']) === register);
}

function statusOf(company: Record<string, unknown>): string {
  const status = asString(company['status']);
  if (status === '5') return 'invalidated';
  if (asString(company['endDate'])) return 'ceased';
  const trade = asString(company['tradeRegisterStatus']);
  if (trade === '2' || trade === '4') return 'ceased';
  if (status === '1') return 'pending';
  return status === '2' ? 'active' : 'unknown';
}

export function parseFinnishCompany(raw: unknown): Fact[] {
  const company = asRecord(raw);
  const line = asRecord(company['mainBusinessLine']);
  const facts: Fact[] = [
    fact('identified', true),
    fact('business_id', asString(asRecord(company['businessId'])['value']) ?? ''),
    fact('status', statusOf(company)),
    fact('situations', uniqueSorted(current(asArray(company['companySituations']).map(asRecord)).map((item) => SITUATIONS[asString(item['type']) ?? '']))),
  ];
  pushDefined(facts, P, [
    ['registered_name', companyName(company)],
    ['company_form_code', formLetters(company)],
    ['company_form', english(currentForm(company)?.['descriptions'])],
    ['registered_on', asString(company['registrationDate'])],
    ['ended_on', asString(company['endDate'])],
    ['business_id_status', ID_STATUS[asString(company['status']) ?? '']],
    ['trade_register_status', TRADE_REGISTER[asString(company['tradeRegisterStatus']) ?? '']],
    ['in_vat_register', onRegister(company, '6')],
    ['in_prepayment_register', onRegister(company, '5')],
    ['in_employer_register', onRegister(company, '7')],
    ['main_industry_code', asString(line['type'])],
    ['main_industry', english(line['descriptions'])],
  ]);
  return facts;
}

function companiesOf(raw: unknown): Record<string, unknown>[] {
  return asArray(asRecord(raw)['companies']).map(asRecord);
}

export function createPrhConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'fi.prh',
    jurisdictions: ['FI'],
    capabilities: ['entity_lookup', 'tax_registration'],
    factPrefix: P,
    sourceName: 'the Finnish business register (PRH)',
    method: 'official_live',
    homeUrl: 'https://avoindata.prh.fi/en/ytj/swagger-ui',
    requiredEnv: ['PUBLIC_API_USER_AGENT'],
    rateLimit: RATE,
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      const headers = { Accept: 'application/json', 'User-Agent': publicUserAgent(env) };
      const identified = `${P}.identified`;

      if (ref.registry_number !== undefined) {
        const id = normaliseFinnishBusinessId(ref.registry_number);
        if (!id || !isValidFinnishBusinessId(id)) return { status: 'unsupported', sourceUrl: BASE, message: FI_WORDS.invalidNumber };
        const url = `${BASE}/companies?businessId=${id}`;
        const response = await http(url, { headers });
        const match = response.status === 404 ? undefined : companiesOf(response.json()).find((item) => asString(asRecord(item['businessId'])['value']) === id);
        if (!match) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [{ key: identified, value: null }], message: FI_WORDS.notFoundByNumber };
        if (isFinnishPersonRecord(match)) return { status: 'unsupported', sourceUrl: url, raw: response.text, message: FI_WORDS.person };
        return { status: 'found', sourceUrl: url, raw: response.text, facts: parseFinnishCompany(match), matchConfidence: 1 };
      }

      const url = `${BASE}/companies?name=${encodeURIComponent(ref.name)}`;
      const response = await http(url, { headers });
      const body = response.status === 404 ? {} : response.json();
      const all = companiesOf(body);
      const total = asRecord(body)['totalResults'];
      const chosen = chooseByName({
        ref, items: all.filter((item) => !isFinnishPersonRecord(item)), nameOf: companyName, numberOf: (item) => asString(asRecord(item['businessId'])['value']),
        truncated: typeof total === 'number' && total > all.length, words: FI_WORDS, identifiedKey: identified, sourceUrl: url, raw: response.text,
      });
      if ('match' in chosen) return { status: 'found', sourceUrl: url, raw: response.text, facts: parseFinnishCompany(chosen.match), matchConfidence: 0.95 };
      return chosen;
    },
  }, deps);
}

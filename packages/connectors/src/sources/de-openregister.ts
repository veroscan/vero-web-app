import { defineConnector, type Http } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact, FactValue, LookupOutcome } from '../types.js';
import { isoDate, keyRefused, makeNameNormaliser, pickByName } from './keyed-registers-common.js';

/**
 * de.openregister: the German Handelsregister, read through OpenRegister (openregister.de), a
 * paid licensed provider (Tier 2). There is no free official German register API: the
 * Handelsregister portal is manual, open "durch einzelne Abrufe" (HGB §9(1)), and its terms cap
 * retrievals, so it is never automated (docs/knowledge/vero-scan-germany-rule-pack-map.md, note 1).
 * Off until OPENREGISTER_API_KEY is set (docs/ENGINE-ACCOUNTS-AND-KEYS.md).
 *
 * Checked on 18 Nov 2026 against the public docs (https://docs.openregister.de, pages
 * endpoint/autocomplete-company.md, endpoint/company.md, pricing.md): base https://api.openregister.de,
 * header `Authorization: Bearer <key>`. GET /v1/autocomplete/company?query= (1 credit) gives
 * results[] {company_id, name, register_number, register_type, register_court, active,
 * legal_form, address, purpose}. GET /v1/company/{company_id} (10 credits) gives status (active,
 * inactive, liquidation), register {register_number, register_type, register_court}, name {name},
 * legal_form (gmbh, ug, ag, ek, ...), capital {amount, currency}, address {city, ...},
 * representation[] {type natural_person | legal_person, role DIRECTOR | PROKURA | ..., end_date},
 * incorporated_at, terminated_at, insolvencies[] {current_status, opened_at, closed_at}. Errors:
 * 401 (key missing, invalid, disabled, expired), 402 (no credits), 404, 429. `realtime` is never
 * asked for (it doubles the cost). No rate limit is published; we stay at 2 requests a second.
 *
 * NOT confirmed, because no call can be made without a key: real reply bodies (the samples are
 * built from the documented schema); whether `query` also matches a register number (it isn't
 * relied on: a number is only taken when a result carries it); the reply to a used-up plan.
 *
 * Personal data. An eingetragener Kaufmann (legal form `ek`) is a sole trader, a person: never
 * kept, never offered as a candidate. Representatives become counts. No name, birth date or
 * address of a person leaves this file; the company's own city is kept, its street is not.
 */

const BASE = 'https://api.openregister.de';
const P = 'registry.de.openregister';
const SOURCE = 'the German commercial register (Handelsregister, through OpenRegister)';
/** Legal-form words, as normaliseName leaves them (lower case, accents and brackets gone). */
const normalise = makeNameNormaliser(['gmbh', 'ug', 'haftungsbeschrankt', 'ag', 'se', 'kg', 'co', 'and', 'mbh', 'gesellschaft', 'mit', 'beschrankter', 'haftung']);
/** OpenRegister's company id: DE-HRB-F1103-267645 (register type, court code, number). */
const COMPANY_ID = /^DE-(HRB|HRA|PR|GnR|VR)-[A-Z0-9]+-\d+[A-Z]?$/i;
/** A register number as people write it: "HRB 12345", "HRB 12345 B", "12345". */
const REGISTER_NUMBER = /^(?:(HRB|HRA|PR|GnR|VR)\s*)?(\d{1,7})(?:\s*[A-Z]{1,3})?$/i;

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

export function isGermanSoleTrader(record: Record<string, unknown>): boolean {
  return (asString(record['legal_form']) ?? '').toLowerCase() === 'ek';
}

/** Open insolvency proceedings: any with no closing date and a status that isn't a refusal or lifting. */
function openInsolvency(record: Record<string, unknown>): boolean {
  const ended = new Set(['rejected_no_assets', 'lifted', 'discontinued', 'discharge_granted', 'discharge_denied', 'discharge_revoked']);
  return asArray(record['insolvencies']).map(asRecord).some((item) => asString(item['closed_at']) === undefined && !ended.has((asString(item['current_status']) ?? '').toLowerCase()));
}

/** The facts for one company that isn't a sole trader. Representatives are counted here, never named. */
export function parseGermanCompany(raw: unknown): Fact[] {
  const company = asRecord(raw);
  const register = asRecord(company['register']);
  const capital = asRecord(company['capital']);
  const directors = asArray(company['representation']).map(asRecord)
    .filter((item) => (asString(item['role']) ?? '').toUpperCase() === 'DIRECTOR' && asString(item['end_date']) === undefined);
  const facts: Fact[] = [
    fact('identified', true),
    fact('directors_count', directors.length),
    fact('directors_entity_count', directors.filter((item) => asString(item['type']) === 'legal_person').length),
    fact('insolvency_open', openInsolvency(company)),
  ];
  const optional: [string, string | undefined][] = [
    ['company_id', asString(company['id'])],
    ['registered_name', asString(asRecord(company['name'])['name'])],
    ['status', asString(company['status'])?.toLowerCase()],
    ['legal_form', asString(company['legal_form'])?.toLowerCase()],
    ['register_type', asString(register['register_type'])],
    ['register_number', asString(register['register_number'])],
    ['register_court', asString(register['register_court'])],
    ['capital_currency', asString(capital['currency'])],
    ['city', asString(asRecord(company['address'])['city'])],
    ['incorporated_on', isoDate(company['incorporated_at'])],
    ['terminated_on', isoDate(company['terminated_at'])],
  ];
  for (const [key, value] of optional) if (value !== undefined) facts.push(fact(key, value));
  const amount = Number(capital['amount']);
  if (capital['amount'] !== undefined && capital['amount'] !== null && Number.isFinite(amount)) facts.push(fact('capital_amount', amount));
  return facts;
}

export const DE_NOT_IN_REGISTER = {
  name: "We didn't find this name in the German commercial register. That doesn't mean the company doesn't exist: the name may be written differently there. Add the register number (for example HRB 12345) and we'll check again.",
  number: "We didn't find this register number in the German commercial register. That doesn't mean the company doesn't exist, so a person needs to check the number and the court.",
  person: 'This entry is a sole trader (eingetragener Kaufmann), which is a person. We only check companies, so nothing about it is kept.',
} as const;

function outOfCredits(): LookupOutcome {
  return {
    status: 'unavailable',
    sourceUrl: BASE,
    message: "We couldn't check the German commercial register because our OpenRegister plan has no credits left. This is a setup problem on our side, not a problem with your company.",
  };
}

async function companyById(http: Http, headers: Record<string, string>, id: string, confidence: number): Promise<LookupOutcome> {
  const url = `${BASE}/v1/company/${encodeURIComponent(id)}`;
  const response = await http(url, { headers, allow: [401, 402, 403] });
  if (response.status === 401 || response.status === 403) return keyRefused(SOURCE, BASE);
  if (response.status === 402) return outOfCredits();
  if (response.status === 404) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: DE_NOT_IN_REGISTER.number };
  const company = asRecord(response.json());
  if (isGermanSoleTrader(company)) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: DE_NOT_IN_REGISTER.person };
  return { status: 'found', sourceUrl: url, raw: response.text, facts: parseGermanCompany(company), matchConfidence: confidence };
}

export function createOpenRegisterConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'de.openregister',
    jurisdictions: ['DE'],
    capabilities: ['entity_lookup', 'officers'],
    factPrefix: P,
    sourceName: SOURCE,
    method: 'licensed_vendor',
    homeUrl: BASE,
    requiredEnv: ['OPENREGISTER_API_KEY'],
    rateLimit: { requests: 2, perMs: 1000 },
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      const headers = { Authorization: `Bearer ${(env['OPENREGISTER_API_KEY'] as string).trim()}`, Accept: 'application/json' };
      const searchUrl = (term: string) => `${BASE}/v1/autocomplete/company?query=${encodeURIComponent(term)}`;
      const search = async (term: string) => {
        const response = await http(searchUrl(term), { headers, allow: [401, 402, 403] });
        if (response.status === 401 || response.status === 403) return 'refused' as const;
        if (response.status === 402) return 'no_credits' as const;
        const items = response.status === 404 ? [] : asArray(asRecord(response.json())['results']).map(asRecord);
        return { response, items: items.filter((item) => !isGermanSoleTrader(item)) };
      };

      if (ref.registry_number !== undefined) {
        const given = ref.registry_number.trim();
        if (COMPANY_ID.test(given)) return companyById(http, headers, given.toUpperCase(), 1);
        const parts = REGISTER_NUMBER.exec(given);
        if (!parts) {
          return { status: 'unsupported', sourceUrl: BASE, message: "That register number doesn't look right: give it as it appears on the register, for example HRB 12345. Correct it in your answers and we'll check again." };
        }
        // A register number is only unique with its court, which people rarely give: search by
        // name and take the one result that carries the same number (and type, if given).
        const found = await search(ref.name);
        if (found === 'refused') return keyRefused(SOURCE, BASE);
        if (found === 'no_credits') return outOfCredits();
        const type = parts[1]?.toUpperCase();
        const matches = found.items.filter((item) => (asString(item['register_number']) ?? '').replace(/\D/g, '') === parts[2]
          && (type === undefined || (asString(item['register_type']) ?? '').toUpperCase() === type));
        const id = matches.length === 1 ? asString((matches[0] as Record<string, unknown>)['company_id']) : undefined;
        if (!id) return { status: 'not_found', sourceUrl: searchUrl(ref.name), raw: found.response.text, facts: [fact('identified', null)], message: DE_NOT_IN_REGISTER.number };
        return companyById(http, headers, id, 1);
      }

      const found = await search(ref.name);
      if (found === 'refused') return keyRefused(SOURCE, BASE);
      if (found === 'no_credits') return outOfCredits();
      const pick = pickByName(found.items.map((item) => ({ name: asString(item['name']) ?? '', id: asString(item['company_id']) ?? '', item })), ref.name, normalise);
      if (pick.kind === 'one') return companyById(http, headers, asString(pick.item['company_id']) as string, 0.95);
      if (pick.kind === 'many') {
        return {
          status: 'ambiguous', sourceUrl: searchUrl(ref.name), raw: found.response.text, candidates: pick.candidates, matchConfidence: pick.confidence,
          message: 'A few companies in the German commercial register could be yours. Add your register number (for example HRB 12345) so we check the right one.',
        };
      }
      return { status: 'not_found', sourceUrl: searchUrl(ref.name), raw: found.response.text, facts: [fact('identified', null)], message: DE_NOT_IN_REGISTER.name };
    },
  }, deps);
}

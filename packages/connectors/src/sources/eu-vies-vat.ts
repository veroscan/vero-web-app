import { defineConnector } from '../runtime.js';
import { asArray, asRecord, asString, toIsoDate } from '../text.js';
import type { Connector, ConnectorDeps, Fact, FactValue } from '../types.js';
import { companyNameSimilarity, looksLikeCompanyName } from './legal-forms.js';

/**
 * eu.vies_vat: the European Commission's VIES VAT number check (VIES on-the-Web), REST API.
 * Free, no key.
 *
 * Checked against the official OpenAPI description (ec.europa.eu/assets/taxud/vow-information/
 * swagger_publicVAT.yaml, "Vies on-the-Web Endpoint" 1.0.0) and the official WSDL
 * (ec.europa.eu/taxation_customs/vies/checkVatService.wsdl) on 16 Nov 2026: POST
 * /check-vat-number with { countryCode, vatNumber }; reply { countryCode, vatNumber, requestDate,
 * valid, requestIdentifier, name, address, trader* and trader*Match }; errors are
 * { actionSucceed: false, errorWrappers: [{ error }] } with the codes INVALID_INPUT,
 * GLOBAL_MAX_CONCURRENT_REQ, MS_MAX_CONCURRENT_REQ, SERVICE_UNAVAILABLE, MS_UNAVAILABLE and
 * TIMEOUT; GET /check-status gives each member state's availability. vatNumber must match
 * [0-9A-Za-z+*.]{2,12}. Greece is "EL" in VIES. Northern Ireland is "XI", and VIES supports it
 * (it is in the check-status list): a company we hold as GB-NIR is checked as XI. Great Britain
 * is not in VIES: HMRC covers it (uk.hmrc_vat). No rate limit is published; VIES limits
 * concurrent requests per member state, so we ask slowly.
 *
 * Checked against real replies on 16 Nov 2026 (base https://ec.europa.eu/taxation_customs/vies/
 * rest-api): errors come back as HTTP 200 with actionSucceed false (Greece sent as "GR" gave
 * INVALID_INPUT); Germany returns "---" for name and address; France returns the name and the
 * address; and Cyprus, listed as "Unavailable" by check-status at that moment, still answered
 * valid: false. So "not valid" is only said after check-status confirms that member state is
 * available. Otherwise it is an error, never "invalid".
 *
 * Terms. The VIES disclaimer limits use to confirming VAT numbers for a legitimate user's own
 * activity and forbids retransmitting its content. We keep only whether the number is valid,
 * the date, and at most whether the name roughly matches: see docs/ENGINE-ACCOUNTS-AND-KEYS.md.
 *
 * Personal data. VIES returns the trader's name and address. Neither is stored. A sole trader's
 * name is a person's name, so the name is compared only when it carries a legal-form word
 * (looksLikeCompanyName); otherwise there is no name fact at all.
 */

const BASE = 'https://ec.europa.eu/taxation_customs/vies/rest-api';
const P = 'registry.eu.vies_vat';
const RATE = { requests: 2, perMs: 1000 };

/** The 27 EU member states, as ISO 3166-1 codes, plus Northern Ireland (GB-NIR, VIES "XI"). */
export const VIES_JURISDICTIONS = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
  'GB-NIR',
] as const;

/** Our country code to the code VIES uses. */
export function viesCountryCode(jurisdiction: string): string | null {
  if (jurisdiction === 'GR') return 'EL';
  if (jurisdiction === 'GB-NIR') return 'XI';
  return (VIES_JURISDICTIONS as readonly string[]).includes(jurisdiction) ? jurisdiction : null;
}

const VIES_CODES = new Set(VIES_JURISDICTIONS.map((code) => viesCountryCode(code) as string));

/** "DE 129 274 202", "de129274202" or "129274202" to { country: "DE", number: "129274202" }. */
export function normaliseEuVat(input: string, jurisdiction: string): { country: string; number: string } | null {
  const compact = input.toUpperCase().replace(/[\s.\-/]/g, '');
  const prefix = compact.slice(0, 2);
  const own = viesCountryCode(jurisdiction);
  let country = own;
  let number = compact;
  if (/^[A-Z]{2}/.test(compact)) {
    const asVies = prefix === 'GR' ? 'EL' : prefix;
    if (VIES_CODES.has(asVies)) {
      country = asVies;
      number = compact.slice(2);
    }
  }
  if (!country || !/^[0-9A-Z+*]{2,12}$/.test(number)) return null;
  return { country, number };
}

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

const REGION_NAMES = new Intl.DisplayNames(['en'], { type: 'region' });

/** "DE" to "Germany", "EL" to "Greece", "XI" to "Northern Ireland", for the plain-English messages. */
export function countryName(viesCode: string): string {
  if (viesCode === 'XI') return 'Northern Ireland';
  try {
    return REGION_NAMES.of(viesCode === 'EL' ? 'GR' : viesCode) ?? viesCode;
  } catch {
    return viesCode;
  }
}

/** VIES writes "---" where a member state doesn't share a value. */
function shared(value: unknown): string | undefined {
  const text = asString(value);
  return text === undefined || /^-+$/.test(text) ? undefined : text;
}

export const VIES_WORDS = {
  needNumber: 'We need your VAT number to check it in the EU VIES service. Add it in your answers.',
  badNumber: "That doesn't look like an EU VAT number. It should be the country letters (for example DE or FR) followed by up to 12 letters and digits.",
  invalidInput: "VIES says that VAT number isn't written in a form it accepts. Check it in your answers.",
  down: (country: string) => `The VAT service for ${country} isn't answering right now. This says nothing about your VAT number: we'll ask again later.`,
  notValidDerived: "VIES says the VAT number we worked out from your company number isn't valid for EU trade today. That doesn't mean your company isn't registered for VAT: it may use a different number, or not be registered for trade with other EU countries. Add your VAT number in your answers and we'll check that one.",
  notValid: "VIES says this VAT number isn't valid for EU trade today. That can also mean it is registered at home but not yet for trade with other EU countries, so it needs a person to check.",
} as const;

export function createViesVatConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'eu.vies_vat',
    jurisdictions: VIES_JURISDICTIONS,
    capabilities: ['tax_registration'],
    factPrefix: P,
    sourceName: 'VIES',
    method: 'official_live',
    homeUrl: BASE,
    requiredEnv: ['PUBLIC_API_USER_AGENT'],
    rateLimit: RATE,
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      if (!ref.vat_number) return { status: 'unsupported', sourceUrl: BASE, message: VIES_WORDS.needNumber };
      const vat = normaliseEuVat(ref.vat_number, ref.jurisdiction);
      if (!vat) return { status: 'unsupported', sourceUrl: BASE, message: VIES_WORDS.badNumber };
      const userAgent = (env['PUBLIC_API_USER_AGENT'] as string).trim();

      const url = `${BASE}/check-vat-number`;
      const response = await http(url, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': userAgent },
        body: JSON.stringify({ countryCode: vat.country, vatNumber: vat.number }),
        allow: [400],
      });
      const body = asRecord(response.json());
      const errors = asArray(body['errorWrappers']).map((item) => asString(asRecord(item)['error']) ?? '');
      if (body['actionSucceed'] === false || errors.length > 0 || typeof body['valid'] !== 'boolean') {
        if (errors.includes('INVALID_INPUT')) return { status: 'unsupported', sourceUrl: url, message: VIES_WORDS.invalidInput };
        // Busy or down, or an answer we don't understand: never "invalid".
        return { status: 'error', sourceUrl: url, message: VIES_WORDS.down(countryName(vat.country)) };
      }

      const requestDate = toIsoDate(asString(body['requestDate']));
      const facts: Fact[] = [fact('valid', body['valid'])];
      // Worked out by us from the company number, not given by the company: say so in the facts.
      if (ref.vat_number_derived === true) facts.push(fact('number_derived', true));
      if (requestDate) facts.push(fact('request_date', requestDate));

      if (body['valid'] === false) {
        // Cyprus said "not valid" while VIES listed it as unavailable (16 Nov 2026), so check first.
        const status = await http(`${BASE}/check-status`, { headers: { Accept: 'application/json', 'User-Agent': userAgent } });
        const reply = asRecord(status.json());
        const state = asArray(reply['countries']).map(asRecord).find((item) => asString(item['countryCode']) === vat.country);
        if (asRecord(reply['vow'])['available'] !== true || asString(state?.['availability']) !== 'Available') {
          return { status: 'error', sourceUrl: url, message: VIES_WORDS.down(countryName(vat.country)) };
        }
        return { status: 'not_found', sourceUrl: url, raw: response.text, facts, message: ref.vat_number_derived === true ? VIES_WORDS.notValidDerived : VIES_WORDS.notValid };
      }

      // The name is never kept. A name without a legal form may be a sole trader's: not compared.
      const name = shared(body['name']);
      if (name && looksLikeCompanyName(name)) facts.push(fact('name_matches', companyNameSimilarity(name, ref.name) >= 0.8));
      return { status: 'found', sourceUrl: url, raw: response.text, facts };
    },
  }, deps);
}

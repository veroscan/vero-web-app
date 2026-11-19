import { defineConnector } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact } from '../types.js';
import { chooseByName, factIn, isValidCzechIco, normaliseCzechIco, publicUserAgent, pushDefined, registerWords, uniqueSorted } from './national-common.js';

/**
 * cz.ares: ARES, the Administrative Register of Economic Subjects of the Czech Ministry of
 * Finance. Free, no key, official. Public data under Czech open-data law.
 *
 * Checked against the official OpenAPI description (ares.gov.cz/ekonomicke-subjekty-v-be/rest/v3/
 * api-docs, "ARES: REST API - veřejné", version 1.4) on 16 Nov 2026: GET
 * /ekonomicke-subjekty/{ico} (8 digits) gives an `EkonomickySubjekt`: `ico`, `obchodniJmeno`,
 * `pravniForma` (code list PravniForma), `datumVzniku`, `datumZaniku`, `dic`, `sidlo` (with
 * `nazevKraje`), `czNace`, `seznamRegistraci` (per source: `stavZdrojeVr` public registers,
 * `stavZdrojeDph` VAT payers, `stavZdrojeIr` insolvency register, ...). 404 with `kod`
 * NENALEZENO when unknown. POST /ekonomicke-subjekty/vyhledat with `obchodniJmeno`, `start` and
 * `pocet` searches by name (`pocetCelkem`, `ekonomickeSubjekty`). The Ministry treats more than
 * 500 requests a minute as abuse (mf.gov.cz, ARES page): we stay at 4 a second.
 *
 * Checked against a real reply on 16 Nov 2026 (ČEZ, a. s., 45274649, one lookup and one name
 * search): source states are AKTIVNI, HISTORICKY, ZANIKLY or NEEXISTUJICI; the name search
 * matches any name containing the words and returns them by IČO, so an exact match can be past
 * the first page (we ask for 100 and, without an exact match among them, ask for the IČO).
 *
 * What it can't say. A miss means "not in ARES under that number or name", never "doesn't exist".
 *
 * Personal data. A natural-person entrepreneur (legal forms 101 to 108, 424 and 425: fyzická
 * osoba podnikající) is a person: the record is never kept and never offered as a candidate, and
 * neither is a record with no legal form. The basic ARES record names no people.
 */

const BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest';
const P = 'registry.cz.ares';
const fact = factIn(P);
const RATE = { requests: 4, perMs: 1000 };
const PAGE = 100;
/** PravniForma codes for natural persons, from ARES's own code list (read 16 Nov 2026). */
const PERSON_FORMS = new Set(['101', '102', '103', '104', '105', '106', '107', '108', '424', '425']);

export const CZ_WORDS = registerWords({
  register: 'the Czech register of economic subjects (ARES)',
  numberLabel: 'IČO',
  numberFormat: '8 digits that pass the IČO check',
});

export function isCzechPersonRecord(subject: Record<string, unknown>): boolean {
  const form = asString(subject['pravniForma']) ?? asString(subject['pravniFormaRos']);
  return form === undefined || form === '000' || PERSON_FORMS.has(form) || asString(subject['obchodniJmeno']) === undefined;
}

function sourceState(subject: Record<string, unknown>, key: string): boolean | undefined {
  const state = asString(asRecord(subject['seznamRegistraci'])[key]);
  return state === undefined ? undefined : state === 'AKTIVNI';
}

export function parseCzechSubject(raw: unknown): Fact[] {
  const subject = asRecord(raw);
  const seat = asRecord(subject['sidlo']);
  const ceased = asString(subject['datumZaniku']);
  const facts: Fact[] = [
    fact('identified', true),
    fact('ico', asString(subject['ico']) ?? ''),
    fact('status', ceased ? 'ceased' : sourceState(subject, 'stavZdrojeRes') === false && sourceState(subject, 'stavZdrojeRos') === false ? 'unknown' : 'active'),
    fact('nace_codes', uniqueSorted(asArray(subject['czNace']).map(asString)).slice(0, 60)),
  ];
  const vr = asArray(subject['dalsiUdaje']).map(asRecord).find((item) => asString(item['datovyZdroj']) === 'vr');
  pushDefined(facts, P, [
    ['registered_name', asString(subject['obchodniJmeno'])],
    ['legal_form_code', asString(subject['pravniForma']) ?? asString(subject['pravniFormaRos'])],
    ['established_on', asString(subject['datumVzniku'])],
    ['ceased_on', ceased],
    ['vat_payer', sourceState(subject, 'stavZdrojeDph')],
    ['vat_number_present', asString(subject['dic']) !== undefined],
    ['in_public_register', sourceState(subject, 'stavZdrojeVr')],
    ['public_register_file', asString(vr?.['spisovaZnacka'])],
    ['insolvency_record_active', sourceState(subject, 'stavZdrojeIr')],
    ['region', asString(seat['nazevKraje'])],
  ]);
  return facts;
}

export function createAresConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'cz.ares',
    jurisdictions: ['CZ'],
    capabilities: ['entity_lookup'],
    factPrefix: P,
    sourceName: 'ARES',
    method: 'official_live',
    homeUrl: 'https://ares.gov.cz',
    requiredEnv: ['PUBLIC_API_USER_AGENT'],
    rateLimit: RATE,
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      const headers = { Accept: 'application/json', 'User-Agent': publicUserAgent(env) };
      const identified = `${P}.identified`;

      if (ref.registry_number !== undefined) {
        const ico = normaliseCzechIco(ref.registry_number);
        if (!ico || !isValidCzechIco(ico)) return { status: 'unsupported', sourceUrl: BASE, message: CZ_WORDS.invalidNumber };
        const url = `${BASE}/ekonomicke-subjekty/${ico}`;
        const response = await http(url, { headers });
        if (response.status === 404) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [{ key: identified, value: null }], message: CZ_WORDS.notFoundByNumber };
        const subject = asRecord(response.json());
        if (isCzechPersonRecord(subject)) return { status: 'unsupported', sourceUrl: url, raw: response.text, message: CZ_WORDS.person };
        return { status: 'found', sourceUrl: url, raw: response.text, facts: parseCzechSubject(subject), matchConfidence: 1 };
      }

      const url = `${BASE}/ekonomicke-subjekty/vyhledat`;
      const response = await http(url, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ obchodniJmeno: ref.name, start: 0, pocet: PAGE }),
        // A documented 400 (CHYBA_VSTUPU, bad input) is read as "can't search this name": ask for the IČO.
        allow: [400],
      });
      const body = response.status === 404 || response.status === 400 ? {} : response.json();
      const subjects = asArray(asRecord(body)['ekonomickeSubjekty']).map(asRecord);
      const total = asRecord(body)['pocetCelkem'];
      const chosen = chooseByName({
        ref, items: subjects.filter((item) => !isCzechPersonRecord(item)), nameOf: (item) => asString(item['obchodniJmeno']), numberOf: (item) => asString(item['ico']),
        truncated: response.status === 400 || (typeof total === 'number' && total > subjects.length), words: CZ_WORDS, identifiedKey: identified, sourceUrl: url, raw: response.text,
      });
      if ('match' in chosen) return { status: 'found', sourceUrl: url, raw: response.text, facts: parseCzechSubject(chosen.match), matchConfidence: 0.95 };
      return chosen;
    },
  }, deps);
}

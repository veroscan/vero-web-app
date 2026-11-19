import { defineConnector } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact } from '../types.js';
import { amountOf, dottedDateToIso, factIn, normalisePolishKrs, publicUserAgent, pushDefined, registerWords, uniqueSorted } from './national-common.js';

/**
 * pl.krs: the open API of the National Court Register (Krajowy Rejestr Sądowy), run by the
 * Polish Ministry of Justice. Free, no key, official. Public data under the Polish open-data act
 * (ustawa z 11 sierpnia 2021 r. o otwartych danych).
 *
 * Checked against the official description on the Court Registers Portal (prs.ms.gov.pl/krs/
 * openApi, "Otwarte API Krajowego Rejestru Sądowego", read from the portal's own page bundle) on
 * 16 Nov 2026: GET https://api-krs.ms.gov.pl/api/krs/OdpisAktualny/{krs}?rejestr={P|S}&format=json
 * (P the register of entrepreneurs, S of associations); 200 OK, 404 "podmiot nie znaleziony",
 * 5xx service error; the model is "semantic JSON for the legal form", not specified further.
 * There is NO search by name. People's first names, surnames and PESEL numbers are published
 * partly masked ("anonymised"). No rate limit is published: we stay at 2 requests a second.
 *
 * Checked against a real reply on 16 Nov 2026 (ORLEN S.A., KRS 0000028860): `odpis.naglowekA`
 * (`numerKRS`, `dataRejestracjiWKRS` as dd.mm.yyyy, `dataOstatniegoWpisu`), `odpis.dane.dzial1`
 * (`danePodmiotu.formaPrawna`, `nazwa`, `identyfikatory.nip` and `regon`; `siedzibaIAdres.siedziba`;
 * `kapital.wysokoscKapitaluZakladowego.wartosc` with a decimal comma), `dzial2` (`reprezentacja`
 * with `nazwaOrganu` and `sklad[]`; `organNadzoru[]` with `nazwa` and `sklad[]`; `prokurenci[]`),
 * `dzial3.przedmiotDzialalnosci.przedmiotPrzewazajacejDzialalnosci[]` (PKD), `dzial6`. Every
 * person in `sklad` and `prokurenci` carries a masked name and a masked PESEL: all of it is
 * dropped here. The lesson of that reply: the free text of a proxy's type (`rodzajProkury`)
 * named other proxies IN FULL, with unmasked PESEL numbers. No free text is ever read here, and
 * the recorder keeps a KRS extract by allowlist only (record.ts, rule 12). Markers for deletion, liquidation and insolvency were NOT in that reply: they are
 * read from the section names the register uses (wykreślenie, likwidacja, upadłość,
 * restrukturyzacja) and need checking against a real record that has them.
 *
 * What it can't say. A miss in both registers means "not in the KRS under that number", never
 * "doesn't exist". Sole traders are not in the KRS at all (they are in CEIDG).
 *
 * Personal data. Board members, supervisory board members, proxies and partners are reduced to
 * the names of the bodies and how many people sit on them. Never a name, initial or PESEL digit.
 */

const BASE = 'https://api-krs.ms.gov.pl/api/krs';
const P = 'registry.pl.krs';
const fact = factIn(P);
const RATE = { requests: 2, perMs: 1000 };

export const PL_WORDS = registerWords({
  register: 'the Polish National Court Register (KRS)',
  numberLabel: 'KRS number',
  numberFormat: 'up to 10 digits, like 0000123456',
});

/** True when any key anywhere under `value` mentions one of these words (section names, not people). */
function mentions(value: unknown, pattern: RegExp): boolean {
  if (Array.isArray(value)) return value.some((item) => mentions(item, pattern));
  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).some(([key, inner]) => pattern.test(key) || mentions(inner, pattern));
  }
  return false;
}

function members(body: Record<string, unknown>): number {
  return asArray(body['sklad']).length;
}

export function parsePolishExtract(raw: unknown): Fact[] {
  const extract = asRecord(asRecord(raw)['odpis']);
  const header = asRecord(extract['naglowekA']);
  const data = asRecord(extract['dane']);
  const section1 = asRecord(data['dzial1']);
  const section2 = asRecord(data['dzial2']);
  const section6 = asRecord(data['dzial6']);
  const subject = asRecord(section1['danePodmiotu']);
  const ids = asRecord(subject['identyfikatory']);
  const seat = asRecord(asRecord(section1['siedzibaIAdres'])['siedziba']);
  const capital = asRecord(asRecord(section1['kapital'])['wysokoscKapitaluZakladowego']);
  const management = asArray(section2['reprezentacja']).map(asRecord);
  const supervision = asArray(section2['organNadzoru']).map(asRecord);
  const main = asRecord(asArray(asRecord(asRecord(data['dzial3'])['przedmiotDzialalnosci'])['przedmiotPrzewazajacejDzialalnosci'])[0]);
  const pkd = [asString(main['kodDzial']), asString(main['kodKlasa']), asString(main['kodPodklasa'])].filter(Boolean).join('.');
  const nip = asString(ids['nip']);
  const regon = asString(ids['regon']);
  const deleted = mentions(header, /wykresl/i) || asString(extract['rodzaj']) === 'Wykreslony';
  const facts: Fact[] = [
    fact('identified', true),
    fact('krs_number', asString(header['numerKRS']) ?? ''),
    fact('status', deleted ? 'deleted' : 'registered'),
    fact('nip_present', nip !== undefined),
    fact('regon_present', regon !== undefined),
    fact('management_bodies', uniqueSorted(management.map((body) => asString(body['nazwaOrganu'])))),
    fact('management_members_count', management.reduce((sum, body) => sum + members(body), 0)),
    fact('supervisory_bodies', uniqueSorted(supervision.map((body) => asString(body['nazwa'])))),
    fact('supervisory_members_count', supervision.reduce((sum, body) => sum + members(body), 0)),
    fact('proxies_count', asArray(section2['prokurenci']).length),
    fact('under_liquidation', mentions(section6, /likwidac/i)),
    fact('insolvency_marker', mentions(section6, /upadl|restruktur|sanac/i)),
  ];
  pushDefined(facts, P, [
    ['register', asString(header['rejestr'])],
    ['registered_name', asString(subject['nazwa'])],
    ['legal_form', asString(subject['formaPrawna'])],
    // The company's own tax and statistics numbers: public records about the company.
    ['nip', nip],
    ['regon', regon],
    ['registered_on', dottedDateToIso(header['dataRejestracjiWKRS'])],
    ['last_entry_on', dottedDateToIso(header['dataOstatniegoWpisu'])],
    ['seat_voivodeship', asString(seat['wojewodztwo'])],
    ['seat_town', asString(seat['miejscowosc'])],
    ['main_activity_code', pkd || undefined],
    ['share_capital', amountOf(capital['wartosc'])],
    ['share_capital_currency', asString(capital['waluta'])],
  ]);
  return facts;
}

/** Kept only when the extract names an entity with a legal form. */
export function isPolishPersonRecord(raw: unknown): boolean {
  const subject = asRecord(asRecord(asRecord(asRecord(asRecord(raw)['odpis'])['dane'])['dzial1'])['danePodmiotu']);
  return asString(subject['nazwa']) === undefined || asString(subject['formaPrawna']) === undefined;
}

export function createKrsConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'pl.krs',
    jurisdictions: ['PL'],
    capabilities: ['entity_lookup', 'officers'],
    factPrefix: P,
    sourceName: 'the Polish National Court Register (KRS)',
    method: 'official_live',
    homeUrl: 'https://prs.ms.gov.pl/krs/openApi',
    requiredEnv: ['PUBLIC_API_USER_AGENT'],
    rateLimit: RATE,
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      if (ref.registry_number === undefined) return { status: 'unsupported', sourceUrl: BASE, message: PL_WORDS.needsNumber };
      const krs = normalisePolishKrs(ref.registry_number);
      if (!krs) return { status: 'unsupported', sourceUrl: BASE, message: PL_WORDS.invalidNumber };
      const headers = { Accept: 'application/json', 'User-Agent': publicUserAgent(env) };
      let lastUrl = BASE;
      let lastText = '';
      // Most companies are in the register of entrepreneurs (P); foundations and associations in S.
      for (const register of ['P', 'S']) {
        const url = `${BASE}/OdpisAktualny/${krs}?rejestr=${register}&format=json`;
        const response = await http(url, { headers });
        lastUrl = url;
        lastText = response.text;
        if (response.status === 404) continue;
        const body = response.json();
        if (isPolishPersonRecord(body)) return { status: 'unsupported', sourceUrl: url, raw: response.text, message: PL_WORDS.person };
        return { status: 'found', sourceUrl: url, raw: response.text, facts: parsePolishExtract(body), matchConfidence: 1 };
      }
      return { status: 'not_found', sourceUrl: lastUrl, raw: lastText, facts: [{ key: `${P}.identified`, value: null }], message: PL_WORDS.notFoundByNumber };
    },
  }, deps);
}

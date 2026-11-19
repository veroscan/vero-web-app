import { defineConnector, SourceError, type Http, type HttpResponse } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact, FactValue, LookupOutcome } from '../types.js';
import { digitsOf, isoDate, keyRefused, makeNameNormaliser, pickByName } from './keyed-registers-common.js';

/**
 * nl.kvk: the Dutch Business Register (Handelsregister), through the KVK API. Paid: EUR 6.40 a
 * month per key, plus EUR 0.02 per Basisprofiel call (Zoeken is free). Only a business
 * registered in the Handelsregister can subscribe. Off until NL_KVK_API_KEY is set.
 *
 * Checked on 16 Nov 2026 against developers.kvk.nl (documentation, testing, pricing, FAQ) and the
 * published OpenAPI specs api_zoeken.yaml (2.1.0) and api_basisprofiel.yaml (1.5.0): header
 * `apikey`; GET https://api.kvk.nl/api/v2/zoeken?kvkNummer=|naam=&resultatenPerPagina= (items in
 * `resultaten[]` with `kvkNummer, rsin, naam, type, actief`); GET /api/v1/basisprofielen/{kvk}
 * (`kvkNummer, naam, statutaireNaam, formeleRegistratiedatum, materieleRegistratie {datumAanvang,
 * datumEinde}, sbiActiviteiten[] {sbiCode, indHoofdactiviteit}, _embedded.eigenaar {rechtsvorm,
 * uitgebreideRechtsvorm, datumUitschrijving}`); GET /api/v1/basisprofielen/{kvk}/vestigingen
 * (`totaalAantalVestigingen`). Errors are `{ fout: [{ code, omschrijving }] }`: IPD0004 (400)
 * invalid number, IPD0005 / IPD5200 (404) not deliverable / no results, IPD1002 / IPD1003 (404)
 * temporarily unavailable, 401 a missing or wrong key. At most 100 calls a second. A KVK number is
 * 8 digits; KVK publishes no check digit.
 *
 * NOT confirmed, because no call can be made without a key: real reply bodies (the specs carry
 * no examples; the samples follow the schemas); the `rechtsvorm` words (the Eenmanszaak test is
 * on the word "eenmanszaak", and on the record having no RSIN); the date format (yyyymmdd
 * assumed, ISO also read); whether the establishments list is charged as a separate call (it
 * is asked for, so a lookup may cost EUR 0.04).
 *
 * Personal data. An Eenmanszaak (sole proprietorship) is a person's business: nothing about it is
 * kept, and it is never offered as a candidate. A search result with no RSIN may be a person
 * (only legal entities and partnerships get one), so it is never offered either. Owners and
 * officers are not read at all.
 */

const BASE = 'https://api.kvk.nl/api';
const P = 'registry.nl.kvk';
const SOURCE = 'the Dutch Business Register (KVK)';
const dutchForms = makeNameNormaliser(['bv', 'nv', 'vof', 'cv', 'ua', 'stichting', 'cooperatie']);
/** "Kestrel Pay B.V." and "KESTREL PAY" compare equal: dotted initials (B.V., N.V., V.O.F.) are joined first. */
const normalise = (name: string) => dutchForms(name.replace(/\b([a-z])\.\s*(?=[a-z]\b)/gi, '$1'));

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

export function isEenmanszaak(profile: Record<string, unknown>): boolean {
  const owner = asRecord(asRecord(profile['_embedded'])['eigenaar']);
  const form = `${asString(owner['rechtsvorm']) ?? ''} ${asString(owner['uitgebreideRechtsvorm']) ?? ''}`.toLowerCase();
  // No legal form at all: treated as a person too. A record is kept only when it is clearly not one.
  return form.includes('eenmanszaak') || form.trim() === '';
}

/** The facts for one company that isn't an Eenmanszaak. */
export function parseKvkProfile(raw: unknown, establishments: number | null): Fact[] {
  const profile = asRecord(raw);
  const owner = asRecord(asRecord(profile['_embedded'])['eigenaar']);
  const registration = asRecord(profile['materieleRegistratie']);
  const activities = asArray(profile['sbiActiviteiten']).map(asRecord);
  const main = activities.find((a) => asString(a['indHoofdactiviteit'])?.toLowerCase() === 'ja' || a['indHoofdactiviteit'] === true) ?? activities[0];
  const ended = isoDate(registration['datumEinde']) ?? isoDate(owner['datumUitschrijving']);
  const facts: Fact[] = [
    fact('identified', true),
    fact('kvk_number', asString(profile['kvkNummer']) ?? ''),
    fact('active', ended === undefined),
    fact('sbi_codes', activities.map((a) => asString(a['sbiCode'])).filter((v): v is string => v !== undefined)),
  ];
  const optional: [string, string | undefined][] = [
    ['registered_name', asString(profile['statutaireNaam']) ?? asString(profile['naam'])],
    ['legal_form', asString(owner['rechtsvorm'])],
    ['legal_form_detail', asString(owner['uitgebreideRechtsvorm'])],
    ['registered_on', isoDate(profile['formeleRegistratiedatum'])],
    ['started_on', isoDate(registration['datumAanvang'])],
    ['ended_on', ended],
    ['sbi_code', main ? asString(main['sbiCode']) : undefined],
  ];
  for (const [key, value] of optional) if (value !== undefined) facts.push(fact(key, value));
  if (establishments !== null) facts.push(fact('establishments_count', establishments));
  return facts;
}

export const NL_NOT_IN_REGISTER = {
  name: "We didn't find this name in the Dutch Business Register (KVK). That doesn't mean the company doesn't exist: the name may be spelled differently there. Add the company's KVK number and we'll check again.",
  number: "We didn't find this KVK number in the Dutch Business Register. That doesn't mean the company doesn't exist, so a person needs to check the number.",
  person: "This KVK number belongs to a sole proprietorship (eenmanszaak), which is a person's business. We only check companies, so nothing about it is kept.",
} as const;

type Reply = { kind: 'ok'; response: HttpResponse } | { kind: 'refused' } | { kind: 'missing'; response: HttpResponse } | { kind: 'invalid'; response: HttpResponse };

function errorCode(response: HttpResponse): string {
  try {
    return asString(asRecord(asArray(asRecord(JSON.parse(response.text))['fout'])[0])['code']) ?? '';
  } catch {
    return '';
  }
}

async function call(http: Http, url: string, headers: Record<string, string>): Promise<Reply> {
  const response = await http(url, { headers, allow: [400, 401, 403] });
  if (response.status === 401 || response.status === 403) return { kind: 'refused' };
  if (response.status === 400) {
    if (errorCode(response) === 'IPD0004') return { kind: 'invalid', response };
    throw new SourceError(`${SOURCE} rejected the request.`);
  }
  if (response.status === 404) {
    const code = errorCode(response);
    // "Being processed" or "try again in 5 minutes" is a source problem, not a miss.
    if (code === 'IPD1002' || code === 'IPD1003') throw new SourceError(`${SOURCE} had a temporary problem on its side.`);
    return { kind: 'missing', response };
  }
  return { kind: 'ok', response };
}

async function establishmentsCount(http: Http, headers: Record<string, string>, kvk: string): Promise<{ count: number | null; raw: string }> {
  try {
    const reply = await call(http, `${BASE}/v1/basisprofielen/${kvk}/vestigingen`, headers);
    if (reply.kind !== 'ok') return { count: null, raw: '' };
    const total = asRecord(reply.response.json())['totaalAantalVestigingen'];
    return { count: typeof total === 'number' ? total : null, raw: reply.response.text };
  } catch {
    return { count: null, raw: '' };
  }
}

async function profileFor(http: Http, headers: Record<string, string>, kvk: string, confidence: number): Promise<LookupOutcome> {
  const url = `${BASE}/v1/basisprofielen/${kvk}`;
  const reply = await call(http, url, headers);
  if (reply.kind === 'refused') return keyRefused(SOURCE, BASE);
  if (reply.kind === 'invalid') return { status: 'unsupported', sourceUrl: url, raw: reply.response.text, message: "KVK says that KVK number isn't valid. Correct it in your answers and we'll check again." };
  if (reply.kind === 'missing') return { status: 'not_found', sourceUrl: url, raw: reply.response.text, facts: [fact('identified', null)], message: NL_NOT_IN_REGISTER.number };
  const profile = asRecord(reply.response.json());
  if (isEenmanszaak(profile)) return { status: 'not_found', sourceUrl: url, raw: reply.response.text, facts: [fact('identified', null)], message: NL_NOT_IN_REGISTER.person };
  const establishments = await establishmentsCount(http, headers, kvk);
  return { status: 'found', sourceUrl: url, raw: [reply.response.text, establishments.raw].join('\n'), facts: parseKvkProfile(profile, establishments.count), matchConfidence: confidence };
}

export function createKvkConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'nl.kvk',
    jurisdictions: ['NL'],
    capabilities: ['entity_lookup'],
    factPrefix: P,
    sourceName: SOURCE,
    method: 'official_live',
    homeUrl: BASE,
    requiredEnv: ['NL_KVK_API_KEY'],
    rateLimit: { requests: 10, perMs: 1000 },
    // Each Basisprofiel call is paid: a good answer is kept for a day.
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      const headers = { apikey: (env['NL_KVK_API_KEY'] as string).trim(), Accept: 'application/json' };

      if (ref.registry_number !== undefined) {
        const kvk = digitsOf(ref.registry_number);
        if (!/^\d{8}$/.test(kvk)) return { status: 'unsupported', sourceUrl: BASE, message: "That KVK number doesn't look right: it should be 8 digits. Correct it in your answers and we'll check again." };
        return profileFor(http, headers, kvk, 1);
      }

      // Zoeken is free; only the one company picked costs a Basisprofiel call.
      const url = `${BASE}/v2/zoeken?naam=${encodeURIComponent(ref.name)}&resultatenPerPagina=20`;
      const reply = await call(http, url, headers);
      if (reply.kind === 'refused') return keyRefused(SOURCE, BASE);
      const rows = reply.kind === 'ok' ? asArray(asRecord(reply.response.json())['resultaten']).map(asRecord) : [];
      // No RSIN: possibly a person's business. Never offered.
      const companies = rows.filter((row) => asString(row['rsin']) !== undefined && asString(row['kvkNummer']) !== undefined);
      const pick = pickByName(companies.map((row) => ({ name: asString(row['naam']) ?? '', id: asString(row['kvkNummer']) ?? '', item: row })), ref.name, normalise);
      if (pick.kind === 'one') return profileFor(http, headers, asString(pick.item['kvkNummer']) as string, 0.95);
      if (pick.kind === 'many') {
        const outcome: LookupOutcome = {
          status: 'ambiguous', sourceUrl: url, raw: reply.response.text, candidates: pick.candidates, matchConfidence: pick.confidence,
          message: 'A few companies in the Dutch Business Register could be yours. Add your KVK number so we check the right one.',
        };
        return outcome;
      }
      return { status: 'not_found', sourceUrl: url, raw: reply.response.text, facts: [fact('identified', null)], message: NL_NOT_IN_REGISTER.name };
    },
  }, deps);
}

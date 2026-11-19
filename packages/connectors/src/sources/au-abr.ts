import { defineConnector, SourceError, type Http, type HttpResponse } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact, FactValue, LookupOutcome } from '../types.js';
import { digitsOf, isoDate, isValidAbn, isValidAcn, keyRefused, makeNameNormaliser, pickByName } from './keyed-registers-common.js';

/**
 * au.abr: ABN Lookup, the Australian Business Register's web services (Australian Taxation
 * Office). Free: a GUID is issued by email after accepting the web services agreement
 * (abr.business.gov.au/Tools/WebServicesAgreement). Off until AU_ABR_GUID is set.
 *
 * Checked on 16 Nov 2026 against abr.business.gov.au/json/, /Documentation/WebServiceResponse,
 * /Documentation/Exceptions, /Documentation/ReferenceData and /Help/AbnFormat: GET
 * json/AbnDetails.aspx?abn=&guid=, json/AcnDetails.aspx?acn=&guid=, json/MatchingNames.aspx?
 * name=&maxResults=&guid=; the reply is JSONP (wrapped in `callback(...)` even when no callback is
 * asked for); AbnDetails keys `Abn, AbnStatus, AbnStatusEffectiveFrom, Acn, AddressDate,
 * AddressPostcode, AddressState, BusinessName, EntityName, EntityTypeCode, EntityTypeName, Gst,
 * Message`; a non-empty `Message` is the error signal ("The GUID entered is not recognised as a
 * Registered Party", "No records found", ...), always with HTTP 200. Entity type `IND` is
 * "Individual/Sole Trader". The ABN and ACN checks are the published ones. No rate limit is
 * published; we stay at 2 requests a second.
 *
 * NOT confirmed, because no keyed call can be made: a real reply with data (the samples are built
 * from the documented keys, and from one keyless reply with every field empty, read while
 * researching); the format of `AbnStatusEffectiveFrom` and `Gst` (read as dates, ISO assumed);
 * the `AbnStatus` strings ("Active" / "Cancelled" assumed, kept as given, lower-cased); the
 * MatchingNames item keys (`Abn, AbnStatus, IsCurrent, Name, NameType, Postcode, Score, State`,
 * from a community example, not an official schema).
 *
 * What it is and isn't. ABN Lookup is the tax register of businesses, not ASIC's company
 * register: it gives the ABN's status, entity type and GST registration, not whether the company
 * is registered or deregistered with ASIC (docs/NATIONAL-REGISTERS.md says why that isn't built).
 *
 * Personal data. ABN Lookup includes individuals ("Individual/Sole Trader", type IND). An
 * individual is never kept and never offered as a candidate. MatchingNames doesn't say what kind
 * of entity a name belongs to, so each candidate's own record is read first (at most 5).
 */

const BASE = 'https://abr.business.gov.au/json';
const P = 'registry.au.abr';
const SOURCE = 'ABN Lookup (Australian Business Register)';
const INDIVIDUAL = 'IND';
const MAX_CANDIDATES = 5;
const normalise = makeNameNormaliser(['pty', 'ltd', 'limited', 'proprietary', 'nl']);

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

/** "callback({...})" to the object inside. */
export function unwrapJsonp(text: string): unknown {
  const match = /^\s*[\w$.]*\s*\(([\s\S]*)\)\s*;?\s*$/.exec(text);
  try {
    return JSON.parse(match ? (match[1] as string) : text);
  } catch {
    throw new SourceError(`${SOURCE} sent something we couldn't read.`);
  }
}

export function isAustralianIndividual(record: Record<string, unknown>): boolean {
  const code = (asString(record['EntityTypeCode']) ?? '').toUpperCase();
  const name = (asString(record['EntityTypeName']) ?? '').toLowerCase();
  return code === INDIVIDUAL || name.includes('individual') || name.includes('sole trader');
}

/** The facts for one entity that is not an individual. */
export function parseAbnDetails(raw: unknown): Fact[] {
  const record = asRecord(raw);
  const gst = isoDate(record['Gst']);
  const facts: Fact[] = [
    fact('identified', true),
    fact('abn', asString(record['Abn']) ?? ''),
    // Gst is the date GST registration took effect, or empty when not registered.
    fact('gst_registered', gst !== undefined),
  ];
  const optional: [string, string | undefined][] = [
    ['acn', asString(record['Acn'])],
    ['registered_name', asString(record['EntityName'])],
    ['abn_status', asString(record['AbnStatus'])?.toLowerCase()],
    ['abn_status_from', isoDate(record['AbnStatusEffectiveFrom'])],
    ['entity_type_code', asString(record['EntityTypeCode'])],
    ['entity_type', asString(record['EntityTypeName'])],
    ['gst_registered_from', gst],
    // The main business location of an organisation (state and postcode only). Never kept for an individual.
    ['state', asString(record['AddressState'])],
    ['postcode', asString(record['AddressPostcode'])],
  ];
  for (const [key, value] of optional) if (value !== undefined) facts.push(fact(key, value));
  return facts;
}

export const AU_NOT_IN_REGISTER = {
  name: "We didn't find this name in ABN Lookup. That doesn't mean the company doesn't exist: the name may be spelled differently there. Add the company's ABN or ACN and we'll check again.",
  number: "We didn't find this number in ABN Lookup. That doesn't mean the company doesn't exist, so a person needs to check the number.",
  person: "This number belongs to an individual or sole trader, which is a person. We only check companies, so nothing about it is kept.",
} as const;

type Read = { kind: 'record'; record: Record<string, unknown>; text: string } | { kind: 'refused' } | { kind: 'none'; text: string } | { kind: 'invalid'; text: string };

function readReply(response: HttpResponse): Read {
  if (response.status === 401 || response.status === 403) return { kind: 'refused' };
  if (response.status === 404) return { kind: 'none', text: response.text };
  const record = asRecord(unwrapJsonp(response.text));
  const message = (asString(record['Message']) ?? '').toLowerCase();
  if (message.includes('guid') || message.includes('registered party') || message.includes('not been registered')) return { kind: 'refused' };
  if (message.includes('no record')) return { kind: 'none', text: response.text };
  if (message.includes('invalid')) return { kind: 'invalid', text: response.text };
  if (message !== '') throw new SourceError(`${SOURCE} couldn't answer this request.`);
  return { kind: 'record', record, text: response.text };
}

async function details(http: Http, guid: string, kind: 'abn' | 'acn', number: string): Promise<{ read: Read; url: string }> {
  const path = kind === 'abn' ? 'AbnDetails.aspx' : 'AcnDetails.aspx';
  const url = `${BASE}/${path}?${kind}=${number}&guid=${encodeURIComponent(guid)}`;
  return { read: readReply(await http(url, { allow: [401, 403] })), url };
}

export function createAbrConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'au.abr',
    jurisdictions: ['AU'],
    capabilities: ['entity_lookup', 'tax_registration'],
    factPrefix: P,
    sourceName: SOURCE,
    method: 'official_live',
    homeUrl: BASE,
    requiredEnv: ['AU_ABR_GUID'],
    rateLimit: { requests: 2, perMs: 1000 },
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      const guid = (env['AU_ABR_GUID'] as string).trim();
      // The GUID is a query parameter: provenance links never carry it.
      const shown = (url: string) => url.replace(/&guid=[^&]*/, '');

      if (ref.registry_number !== undefined) {
        const number = digitsOf(ref.registry_number);
        const kind = number.length === 11 && isValidAbn(number) ? 'abn' : number.length === 9 && isValidAcn(number) ? 'acn' : null;
        if (!kind) {
          return { status: 'unsupported', sourceUrl: BASE, message: "That number doesn't look right: an ABN is 11 digits and an ACN 9 digits, and each has a check digit. Correct it in your answers and we'll check again." };
        }
        const { read, url } = await details(http, guid, kind, number);
        if (read.kind === 'refused') return keyRefused(SOURCE, BASE);
        if (read.kind === 'invalid') return { status: 'unsupported', sourceUrl: shown(url), raw: read.text, message: "ABN Lookup says that number isn't valid. Correct it in your answers and we'll check again." };
        if (read.kind === 'none' || asString(read.record['Abn']) === undefined) {
          return { status: 'not_found', sourceUrl: shown(url), raw: read.text, facts: [fact('identified', null)], message: AU_NOT_IN_REGISTER.number };
        }
        if (isAustralianIndividual(read.record)) return { status: 'not_found', sourceUrl: shown(url), raw: read.text, facts: [fact('identified', null)], message: AU_NOT_IN_REGISTER.person };
        return { status: 'found', sourceUrl: shown(url), raw: read.text, facts: parseAbnDetails(read.record), matchConfidence: 1 };
      }

      const url = `${BASE}/MatchingNames.aspx?name=${encodeURIComponent(ref.name)}&maxResults=20&guid=${encodeURIComponent(guid)}`;
      const read = readReply(await http(url, { allow: [401, 403] }));
      if (read.kind === 'refused') return keyRefused(SOURCE, BASE);
      const names = read.kind === 'record' ? asArray(read.record['Names']).map(asRecord) : [];
      const active = names.filter((n) => asString(n['Abn']) !== undefined && (asString(n['AbnStatus']) ?? '').toLowerCase() !== 'cancelled');
      const pool = active.length > 0 ? active : names;
      const pick = pickByName(pool.map((n) => ({ name: asString(n['Name']) ?? '', id: digitsOf(asString(n['Abn'])), item: n })), ref.name, normalise);
      const ids = pick.kind === 'one' ? [digitsOf(asString(pick.item['Abn']))] : pick.kind === 'many' ? pick.candidates.map((c) => c.identifier as string).slice(0, MAX_CANDIDATES) : [];

      // Each candidate's own record says whether it is a person. People are dropped here.
      const checked: { abn: string; record: Record<string, unknown>; text: string; url: string }[] = [];
      for (const abn of ids) {
        const one = await details(http, guid, 'abn', abn);
        if (one.read.kind === 'refused') return keyRefused(SOURCE, BASE);
        if (one.read.kind === 'record' && !isAustralianIndividual(one.read.record)) checked.push({ abn, record: one.read.record, text: one.read.text, url: one.url });
      }
      const raw = [read.text, ...checked.map((c) => c.text)].join('\n');
      // Once people are out, exactly one organisation with the same registered name is the company.
      const wanted = normalise(ref.name);
      const same = checked.filter((c) => normalise(asString(c.record['EntityName']) ?? '') === wanted);
      const only = same.length === 1 ? same[0] : pick.kind === 'one' && checked.length === 1 ? checked[0] : undefined;
      if (only) return { status: 'found', sourceUrl: shown(only.url), raw, facts: parseAbnDetails(only.record), matchConfidence: 0.95 };
      if (pick.kind === 'many' && checked.length > 0) {
        const outcome: LookupOutcome = {
          status: 'ambiguous', sourceUrl: shown(url), raw, matchConfidence: pick.confidence,
          candidates: checked.map((c) => ({ name: asString(c.record['EntityName']) ?? '', identifier: c.abn })),
          message: 'A few businesses in ABN Lookup could be yours. Add your ABN or ACN so we check the right one.',
        };
        return outcome;
      }
      return { status: 'not_found', sourceUrl: shown(url), raw, facts: [fact('identified', null)], message: AU_NOT_IN_REGISTER.name };
    },
  }, deps);
}

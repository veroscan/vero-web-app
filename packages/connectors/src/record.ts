import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CompanyRef, Env, FetchLike, SourceResult } from './types.js';

/**
 * Record and replay: development only.
 *
 * With CONNECTOR_RECORD_DIR set, every response a live provider sends is saved to disk, so
 * the first real run produces fixtures we can check the parsers against. It is refused when
 * NODE_ENV=production, like fixture mode.
 *
 * What is saved, per response: the method, the URL with secret query values removed, the
 * status, an allowlist of harmless headers, and the body after the redaction rule below.
 * Request headers and request bodies are never saved: that is where keys, tokens and the
 * SEC contact address live.
 *
 * The redaction rule (also in docs/RECORDING-REAL-RESPONSES.md):
 * 1. Secrets. JSON keys named like a token, key, secret or password become "[secret]".
 *    URL query values whose name mentions key, token, secret, password, signature or auth
 *    become "[secret]".
 * 2. Contact and identity details. JSON keys for email, phone, fax, date or place of birth,
 *    nationality, residence, BVN, NIN, SSN, passport, street address lines, premises and
 *    PO boxes become "[redacted]", wherever they appear. In XML, the same kinds of element,
 *    plus first, middle and last names, become "[redacted]".
 * 3. People's names. Inside a JSON object that describes a person (it has an officer role, a
 *    person "kind", name parts, or a date of birth), every name field becomes "[person]".
 * 4. Anything else that looks like an email address or an international phone number,
 *    anywhere in any body, becomes "[email]" or "[phone]".
 * 5. French sources. A record marked as a natural person (a director with type_dirigeant
 *    "personne physique", a sole trader with legal category 1000, an asset-freeze entry with
 *    Nature "Personne physique") has every value in it, however deep, replaced by "[person]",
 *    except the labels that say what kind of record it is. Keys for "courriel", "naissance",
 *    "nationalité" and "passeport" are redacted wherever they appear.
 * 6. The EU sanctions list (XML). A sanctionEntity whose subjectType is "person" is replaced
 *    whole by "[person]": its names, birth dates, citizenship, addresses and identity documents
 *    all go. Entities stay.
 * 7. GLEIF. An entity whose category is SOLE_PROPRIETOR (a person trading on their own) has
 *    every value in it replaced by "[person]", like rule 5.
 * 8. VIES. In a VAT check reply, the trader's name and address (name, address, traderName,
 *    traderStreet, traderPostalCode, traderCity, traderCompanyType) become "[redacted]": the
 *    trader may be a sole trader. The match flags and the validity stay.
 * 9. OpenCorporates. An officer (a name and a position, with dates or an id) is a person: their
 *    name and address become "[person]". Inside any record treated as a person, "address" goes too.
 *    A company's "registered_address_in_full" becomes "[redacted]": it can be a sole trader's home.
 * 10. National registers with a key (DK CVR, AU ABN Lookup, NZ NZBN, CA Corporations, NL KVK).
 *    A record about a person (a CVR participant or sole proprietorship, an ABN individual, an
 *    NZBN sole trader, a KVK eenmanszaak or a KVK search row with no RSIN) has every value
 *    replaced by "[person]", like rule 5. rolePerson, roleAddress and serviceAddress become
 *    "[person]". The ABN Lookup "guid" query value becomes "[secret]" (rule 1).
 * Company names, company numbers, postcodes of registered offices, filing dates and
 * statuses are kept: the parsers need them, and they are public records about companies.
 * Bodies over CONNECTOR_RECORD_MAX_BYTES (default 2 MB, such as whole sanctions lists) are
 * not saved at all, only their size.
 *
 * This is a careful rule, not a guarantee. A person must read a recording before it leaves
 * their machine.
 */

export class RecordModeRefusedError extends Error {
  override name = 'RecordModeRefusedError';

  constructor() {
    super('CONNECTOR_RECORD_DIR is refused when NODE_ENV=production. Recording is for development only.');
  }
}

export function assertRecordModeAllowed(env: Env): void {
  if (env['NODE_ENV'] === 'production') throw new RecordModeRefusedError();
}

const SAFE_HEADERS = new Set([
  'content-type', 'content-length', 'date', 'retry-after', 'etag', 'last-modified',
  'x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset', 'ratelimit-limit', 'ratelimit-remaining', 'ratelimit-reset',
]);

const SECRET_KEY = /^(access_?token|refresh_?token|id_?token|token|client_?secret|api_?key|apikey|secret|password|authorization|sec_?key)$/i;
const SECRET_PARAM = /key|token|secret|password|signature|auth|guid/i;
const PERSONAL_KEY = /e-?mail|phone|telephone|mobile|fax|date_?of_?birth|birth|\bdob\b|nationality|country_?of_?residence|residen|\bbvn\b|\bnin\b|\bssn\b|passport|address_?line|address_in_full|premises|street|po_?box|care_?of|courriel|naissance|nationalit|passeport/i;
const PERSON_MARKER = /^(officer_role|name_elements|date_of_birth|dob|first_?name|surname|forenames?|middle_?name|last_?name)$/i;
const NAME_KEY = /^(name|full_?name|first_?name|last_?name|surname|forenames?|middle_?name|other_?names?|title|name_elements)$/i;
const XML_PERSONAL = /(<(?:[\w-]+:)?((?:first|middle|last)Name|street[12]?|phone(?:Number)?|email|dateOfBirth|nationality)\b[^>]*>)([^<]*)(<\/)/gi;
/** An EU sanctions list entry about a person (rule 6). Entries don't nest, so the lazy match is safe. */
const EU_PERSON_ENTRY = /<((?:[\w-]+:)?sanctionEntity)\b[^>]*>(?:(?!<\/(?:[\w-]+:)?sanctionEntity>)[\s\S])*?<(?:[\w-]+:)?subjectType\b[^>]*\bcode="person"[\s\S]*?<\/\1>/gi;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const INTL_PHONE = /\+\d[\d\s().-]{7,}\d/g;

export const DEFAULT_RECORD_MAX_BYTES = 2_000_000;

export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    for (const name of [...parsed.searchParams.keys()]) {
      if (SECRET_PARAM.test(name)) parsed.searchParams.set(name, '[secret]');
    }
    parsed.username = '';
    parsed.password = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

function scrubText(text: string): string {
  return text.replace(EMAIL, '[email]').replace(INTL_PHONE, '[phone]');
}

function isPerson(record: Record<string, unknown>): boolean {
  if (Object.keys(record).some((key) => PERSON_MARKER.test(key))) return true;
  const kind = record['kind'];
  return typeof kind === 'string' && kind.toLowerCase().includes('individual');
}

/**
 * French sources mark a natural person explicitly: a director with type_dirigeant "personne
 * physique", a sole trader (legal category 1000), or an asset-freeze entry with Nature "Personne
 * physique". Everything inside such a record is about that person, so every value in it goes,
 * except these few labels that say what kind of record it is.
 */
const FRENCH_PERSON_LABELS = new Set(['type_dirigeant', 'qualite', 'Nature', 'TypeChamp', 'IdRegistre', 'nature_juridique', 'category']);

function isFrenchPerson(record: Record<string, unknown>): boolean {
  const kind = record['type_dirigeant'] ?? record['Nature'];
  if (typeof kind === 'string' && kind.toLowerCase().includes('personne physique')) return true;
  if (record['nature_juridique'] === '1000') return true;
  // A directory record with no company name holds a person's name in "nom_complet" (15 Nov 2026).
  return 'nom_complet' in record && 'siren' in record && (record['nom_raison_sociale'] === null || record['nom_raison_sociale'] === undefined);
}

/** Rule 7. A GLEIF entity whose category is SOLE_PROPRIETOR is a person, with their home address. */
function isGleifSoleTrader(record: Record<string, unknown>): boolean {
  return record['category'] === 'SOLE_PROPRIETOR' && 'legalName' in record;
}

/** Rule 8. A VIES reply names the trader and gives their address: a sole trader's is a person's. */
const VIES_TRADER_KEY = /^(name|address|trader(Name|Street|PostalCode|City|CompanyType|Address))$/;

function isViesReply(record: Record<string, unknown>): boolean {
  return 'vatNumber' in record && 'countryCode' in record && 'valid' in record;
}

/** Rule 9. An OpenCorporates officer: a name and a position, with dates or an id. */
function isRegisterOfficer(record: Record<string, unknown>): boolean {
  return 'position' in record && 'name' in record && ('start_date' in record || 'end_date' in record || 'uid' in record);
}

/**
 * Rule 10. National registers that need a key (DK, AU, NZ, CA, NL). A record about a person is
 * redacted whole: a CVR participant with enhedstype PERSON, a CVR sole proprietorship (form code
 * 10), an ABN Lookup individual (IND), an NZBN sole trader, a KVK eenmanszaak, and a KVK search
 * row with no RSIN (it may be a person's business). Directors' name and address objects
 * (rolePerson, roleAddress, serviceAddress) go whole too.
 */
const PERSON_OBJECT_KEY = /^(rolePerson|roleAddress|serviceAddress)$/;

function isNationalRegisterPerson(record: Record<string, unknown>): boolean {
  if (record['enhedstype'] === 'PERSON') return true;
  const meta = record['virksomhedMetadata'];
  if ('cvrNummer' in record && meta !== null && typeof meta === 'object') {
    const form = (meta as Record<string, unknown>)['nyesteVirksomhedsform'];
    if (form !== null && typeof form === 'object' && Number((form as Record<string, unknown>)['virksomhedsformkode']) === 10) return true;
  }
  if (record['EntityTypeCode'] === 'IND') return true;
  const nzType = record['entityTypeCode'];
  if (typeof nzType === 'string' && nzType.toLowerCase().replace(/[^a-z]/g, '') === 'soletrader') return true;
  if ('kvkNummer' in record) {
    const embedded = record['_embedded'];
    const owner = embedded !== null && typeof embedded === 'object' ? (embedded as Record<string, unknown>)['eigenaar'] : undefined;
    const form = owner !== null && typeof owner === 'object' ? (owner as Record<string, unknown>)['rechtsvorm'] : undefined;
    if (typeof form === 'string' && form.toLowerCase().includes('eenmanszaak')) return true;
    if ('naam' in record && 'type' in record && !record['rsin']) return true;
  }
  return false;
}

/**
 * Rule 11. National registers that need no key (NO, FI, CZ, PL, SG, CH). Redacted whole: a
 * Brønnøysund role holder (it has `fodselsdato`) and a sole proprietorship (form ENK); a PRH record
 * with no company form; an ARES natural-person entrepreneur (legal forms 101 to 108, 424, 425); a
 * KRS person (masked `imiona`, `nazwisko`, `pesel`); an ACRA sole proprietorship; a Zefix
 * Einzelunternehmen (legal form 0101) and every SOGC publication (its text names people).
 * Brønnøysund's `telefon`, `mobil` and `epostadresse` keys are redacted wherever they appear.
 *
 * Rule 12. A KRS extract (Poland) is kept by allowlist: only the values the parser reads stay,
 * every other text becomes "[text]". The first real extract (16 Nov 2026) showed why: the free
 * text of a proxy's type (`rodzajProkury`) named other proxies in full, with unmasked PESEL numbers,
 * although the `prokurenci` entries themselves are masked.
 */
const KEYLESS_PERSON_LABELS = ['kode', 'beskrivelse', 'pravniForma', 'entity_type_desc', 'funkcjaWOrganie', 'respons_klasse'];
const KRS_KEEP = new Set([
  'rodzaj', 'rejestr', 'numerKRS', 'dataRejestracjiWKRS', 'dataOstatniegoWpisu', 'stanZDnia', 'dataCzasOdpisu', 'formaPrawna', 'nazwa', 'nip', 'regon', 'krs',
  'kraj', 'wojewodztwo', 'powiat', 'gmina', 'miejscowosc', 'wartosc', 'waluta', 'kodDzial', 'kodKlasa', 'kodPodklasa', 'nazwaOrganu', 'funkcjaWOrganie',
]);

function isKrsExtract(record: Record<string, unknown>): boolean {
  return 'naglowekA' in field(record, 'odpis');
}

function redactKrs(value: unknown, key?: string, person = false): unknown {
  if (Array.isArray(value)) return value.map((item) => redactKrs(item, key, person));
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const isPersonHere = person || 'imiona' in record || 'nazwisko' in record || 'identyfikator' in record && 'pesel' in field(record, 'identyfikator');
    const out: Record<string, unknown> = {};
    for (const [inner, item] of Object.entries(record)) out[inner] = redactKrs(item, inner, isPersonHere);
    return out;
  }
  if (typeof value !== 'string') return value;
  if (person) return key === 'funkcjaWOrganie' ? value : '[person]';
  return key !== undefined && KRS_KEEP.has(key) ? scrubText(value) : '[text]';
}
const KEYLESS_PERSONAL_KEY = /^(telefon|mobil|epostadresse|fodselsdato|pesel)$/i;
const CZECH_PERSON_FORMS = new Set(['101', '102', '103', '104', '105', '106', '107', '108', '424', '425']);
for (const label of KEYLESS_PERSON_LABELS) FRENCH_PERSON_LABELS.add(label);

function field(record: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = record[key];
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function isKeylessRegisterPerson(record: Record<string, unknown>): boolean {
  if ('fodselsdato' in record && 'navn' in record) return true;
  if ('organisasjonsnummer' in record && field(record, 'organisasjonsform')['kode'] === 'ENK') return true;
  if ('businessId' in record && 'companyForms' in record && Array.isArray(record['companyForms']) && record['companyForms'].length === 0) return true;
  if ('ico' in record && 'obchodniJmeno' in record && typeof record['pravniForma'] === 'string' && CZECH_PERSON_FORMS.has(record['pravniForma'])) return true;
  if ('imiona' in record || 'nazwisko' in record || 'pesel' in record) return true;
  if (typeof record['entity_type_desc'] === 'string' && /sole\s*propriet/i.test(record['entity_type_desc'])) return true;
  if ('legalForm' in record && 'name' in record && field(record, 'legalForm')['uid'] === '0101') return true;
  return 'sogcId' in record && 'message' in record;
}

function redactFrenchPerson(value: unknown, key?: string): unknown {
  if (Array.isArray(value)) return value.map((item) => redactFrenchPerson(item));
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [inner, item] of Object.entries(value as Record<string, unknown>)) out[inner] = redactFrenchPerson(item, inner);
    return out;
  }
  if (value === null || typeof value === 'boolean') return value;
  if (key !== undefined && FRENCH_PERSON_LABELS.has(key)) return value;
  return '[person]';
}

function redactJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactJson);
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (isKrsExtract(record)) return redactKrs(record);
    if (isFrenchPerson(record) || isGleifSoleTrader(record) || isNationalRegisterPerson(record) || isKeylessRegisterPerson(record)) return redactFrenchPerson(record);
    const person = isPerson(record) || isRegisterOfficer(record);
    const vies = isViesReply(record);
    const out: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(record)) {
      if (SECRET_KEY.test(key)) out[key] = '[secret]';
      else if (PERSON_OBJECT_KEY.test(key)) out[key] = inner === null ? null : '[person]';
      else if (PERSONAL_KEY.test(key) || KEYLESS_PERSONAL_KEY.test(key)) out[key] = inner === null ? null : '[redacted]';
      else if (person && (NAME_KEY.test(key) || key === 'address')) out[key] = inner === null ? null : '[person]';
      else if (vies && VIES_TRADER_KEY.test(key)) out[key] = inner === null ? null : '[redacted]';
      else out[key] = redactJson(inner);
    }
    return out;
  }
  return typeof value === 'string' ? scrubText(value) : value;
}

/** Applies the redaction rule above to one response body. */
export function redactBody(text: string): string {
  const trimmed = text.trimStart();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.stringify(redactJson(JSON.parse(text)), null, 2);
    } catch {
      // Not JSON after all: fall through to the text rule.
    }
  }
  return scrubText(text.replace(EU_PERSON_ENTRY, (_match, tag: string) => `<${tag}>[person]</${tag}>`).replace(XML_PERSONAL, (_match, open: string, _tag: string, _content: string, close: string) => `${open}[redacted]${close}`));
}

export interface RecordedResponse {
  connector: string;
  recordedAt: string;
  request: { method: string; url: string };
  status: number;
  headers: Record<string, string>;
  body: string | null;
  bodyOmitted?: { reason: 'too_large'; bytes: number };
}

export function safeHeaders(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, name) => {
    if (SAFE_HEADERS.has(name.toLowerCase()) || name.toLowerCase().startsWith('x-ratelimit')) out[name.toLowerCase()] = value;
  });
  return out;
}

export interface RecordingOptions {
  dir: string;
  connectorId: string;
  now?: () => Date;
  maxBytes?: number;
}

/** A session folder per connector per run: <dir>/<connector>/<timestamp>. */
export function sessionDir(options: RecordingOptions, at: Date): string {
  return join(options.dir, options.connectorId, at.toISOString().replace(/[:.]/g, '-'));
}

/**
 * Wraps fetch so every response is also written to disk, redacted. The caller gets the same
 * response it would have had. A failure to write never fails the lookup.
 */
export function recordingFetch(base: FetchLike, options: RecordingOptions): FetchLike & { session: () => string | null; saved: () => number } {
  const now = options.now ?? (() => new Date());
  let folder: string | null = null;
  let count = 0;
  const fn = (async (url: string, init?: RequestInit) => {
    const response = await base(url, init);
    const text = await response.text();
    try {
      folder ??= sessionDir(options, now());
      mkdirSync(folder, { recursive: true });
      count += 1;
      const bytes = Buffer.byteLength(text, 'utf8');
      const tooLarge = bytes > (options.maxBytes ?? DEFAULT_RECORD_MAX_BYTES);
      const record: RecordedResponse = {
        connector: options.connectorId,
        recordedAt: now().toISOString(),
        request: { method: (init?.method ?? 'GET').toUpperCase(), url: redactUrl(url) },
        status: response.status,
        headers: safeHeaders(response.headers),
        body: tooLarge ? null : redactBody(text),
        ...(tooLarge ? { bodyOmitted: { reason: 'too_large' as const, bytes } } : {}),
      };
      writeFileSync(join(folder, `${String(count).padStart(3, '0')}.json`), `${JSON.stringify(record, null, 2)}\n`);
    } catch {
      // Recording is a development aid. It never changes what the scan sees.
    }
    return new Response(text, { status: response.status, statusText: response.statusText, headers: response.headers });
  }) as FetchLike & { session: () => string | null; saved: () => number };
  fn.session = () => folder;
  fn.saved = () => count;
  return fn;
}

// ---- Sessions: what was asked, and what came back, for the replay harness ----

/** Settings that pick behaviour and hold no secret, so a replay can use the same ones. */
export const REPLAY_SETTINGS = ['SANCTIONS_LISTS', 'DELAWARE_VENDOR', 'NDPC_REGISTER_URL', 'HMRC_BASE_URL', 'MIDDESK_BASE_URL', 'FR_RECHERCHE_ENTREPRISES_USER_AGENT', 'PUBLIC_API_USER_AGENT'] as const;

/**
 * What each recordable source needs set. `all`: every one; `any`: at least one. The ICO
 * register (a downloaded file) and the website scan (the company's own site) aren't recorded.
 */
export const RECORDABLE: Readonly<Record<string, { all?: readonly string[]; any?: readonly string[] }>> = {
  'uk.companies_house': { all: ['COMPANIES_HOUSE_API_KEY'] },
  'uk.hmrc_vat': { all: ['HMRC_CLIENT_ID', 'HMRC_CLIENT_SECRET'] },
  'us.uspto': { any: ['USPTO_TSDR_API_KEY', 'USPTO_ODP_API_KEY'] },
  'us.sec_form_d': { all: ['SEC_USER_AGENT'] },
  'us.delaware_vendor': { any: ['MIDDESK_API_KEY', 'COBALT_API_KEY'] },
  'ng.cac_vendor': { all: ['MONO_SECRET_KEY'] },
  'ng.ndpc_list': { all: ['NDPC_REGISTER_URL'] },
  'sanctions.lists': { all: ['SANCTIONS_LISTS'] },
  'fr.recherche_entreprises': { all: ['FR_RECHERCHE_ENTREPRISES_USER_AGENT'] },
  'global.gleif': { all: ['PUBLIC_API_USER_AGENT'] },
  'eu.vies_vat': { all: ['PUBLIC_API_USER_AGENT'] },
  'global.opencorporates': { all: ['OPENCORPORATES_API_TOKEN'] },
  'dk.cvr': { all: ['DK_CVR_USERNAME', 'DK_CVR_PASSWORD'] },
  'au.abr': { all: ['AU_ABR_GUID'] },
  'nz.companies': { all: ['NZ_NZBN_API_KEY'] },
  'de.openregister': { all: ['OPENREGISTER_API_KEY'] },
  'ca.corporations': { all: ['CA_CORPORATIONS_API_KEY'] },
  'nl.kvk': { all: ['NL_KVK_API_KEY'] },
  'ie.cro': { all: ['IE_CRO_EMAIL', 'IE_CRO_API_KEY'] },
  'no.brreg': { all: ['PUBLIC_API_USER_AGENT'] },
  'fi.prh': { all: ['PUBLIC_API_USER_AGENT'] },
  'cz.ares': { all: ['PUBLIC_API_USER_AGENT'] },
  'pl.krs': { all: ['PUBLIC_API_USER_AGENT'] },
  'sg.acra': { all: ['PUBLIC_API_USER_AGENT'] },
  'ch.zefix': { all: ['ZEFIX_USERNAME', 'ZEFIX_PASSWORD'] },
  'eu.esma_prospectus': { all: ['PUBLIC_API_USER_AGENT'] },
};

export interface SessionManifest {
  connector: string;
  recordedAt: string;
  ref: CompanyRef;
  /** Which settings were in use: names only for secrets, values for REPLAY_SETTINGS. */
  env: { set: string[]; settings: Record<string, string> };
  expected: { status: SourceResult['status']; factKeys: string[] };
}

function isSet(env: Env, key: string): boolean {
  const value = env[key];
  return typeof value === 'string' && value.trim().length > 0;
}

/** The names of what's missing for a source, or [] when it can run. */
export function missingSettings(connectorId: string, env: Env): string[] {
  const need = RECORDABLE[connectorId];
  if (!need) return [];
  const missing = (need.all ?? []).filter((key) => !isSet(env, key));
  if (need.any && !need.any.some((key) => isSet(env, key))) missing.push(need.any.join(' or '));
  return missing;
}

export function writeManifest(folder: string, manifest: SessionManifest): void {
  writeFileSync(join(folder, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

export function buildManifest(connectorId: string, ref: CompanyRef, env: Env, result: SourceResult, at: Date): SessionManifest {
  const need = RECORDABLE[connectorId] ?? {};
  const names = [...(need.all ?? []), ...(need.any ?? [])].filter((key) => isSet(env, key));
  const settings: Record<string, string> = {};
  for (const key of REPLAY_SETTINGS) if (isSet(env, key)) settings[key] = env[key] as string;
  return {
    connector: connectorId,
    recordedAt: at.toISOString(),
    ref,
    env: { set: names, settings },
    expected: { status: result.status, factKeys: result.facts.map((fact) => fact.key).sort() },
  };
}

export interface RecordedSession {
  folder: string;
  manifest: SessionManifest;
  responses: RecordedResponse[];
}

/** Every complete session under a recordings folder. A folder without a manifest is skipped. */
export function loadSessions(dir: string): RecordedSession[] {
  const sessions: RecordedSession[] = [];
  let connectors: string[];
  try {
    connectors = readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch {
    return [];
  }
  for (const connector of connectors) {
    for (const entry of readdirSync(join(dir, connector), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const folder = join(dir, connector, entry.name);
      const files = readdirSync(folder);
      if (!files.includes('manifest.json')) continue;
      const manifest = JSON.parse(readFileSync(join(folder, 'manifest.json'), 'utf8')) as SessionManifest;
      const responses = files.filter((name) => /^\d{3}\.json$/.test(name)).sort().map((name) => JSON.parse(readFileSync(join(folder, name), 'utf8')) as RecordedResponse);
      sessions.push({ folder, manifest, responses });
    }
  }
  return sessions;
}

/**
 * A fetch that answers from a session, in order, matching method and URL with secrets removed.
 * A request the recording doesn't have fails loudly as a 599, so a parser change that asks for
 * something new shows up.
 */
export function replayFetch(session: RecordedSession): FetchLike & { unmatched: string[] } {
  const used = new Set<number>();
  const unmatched: string[] = [];
  const fn = (async (url: string, init?: RequestInit) => {
    const method = (init?.method ?? 'GET').toUpperCase();
    const wanted = redactUrl(url);
    const index = session.responses.findIndex((item, i) => !used.has(i) && item.request.method === method && item.request.url === wanted);
    const found = index === -1 ? undefined : session.responses[index];
    if (!found) {
      unmatched.push(`${method} ${wanted}`);
      return new Response('No recorded response for this request', { status: 599 });
    }
    used.add(index);
    return new Response(found.body ?? '', { status: found.status, headers: found.headers });
  }) as FetchLike & { unmatched: string[] };
  fn.unmatched = unmatched;
  return fn;
}

/** The env a replay runs with: dummy values for secrets, the recorded values for settings. */
export function replayEnv(manifest: SessionManifest): Record<string, string> {
  const env: Record<string, string> = { NODE_ENV: 'test' };
  for (const name of manifest.env.set) env[name] = 'replay-placeholder';
  return { ...env, ...manifest.env.settings };
}

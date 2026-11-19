import { XMLParser } from 'fast-xml-parser';
import { listUpdatedWords, readStored, staleListWords } from '../reference-store.js';
import { defineConnector, SourceError, type Http } from '../runtime.js';
import { asArray, asRecord, asString, nameSimilarity, normaliseName, parseCsv } from '../text.js';
import type { Connector, ConnectorDeps, Fact } from '../types.js';

/**
 * sanctions.lists: screens the company name against official lists.
 *
 * The OFAC, UK and UN formats were read live on 5 Nov 2026 and the parsers follow what came
 * back. The French register (`fr`) follows its official JSON schema only: see parseGelsJson.
 * The EU list (`eu`) follows the file's public structure, not a schema we could read: see parseEuFsfXml. "No match" only means no match on these lists today, never proof, and any
 * list that can't be read turns the result into an error rather than a clean bill.
 * We screen entities, not people: individuals' records aren't kept.
 *
 * Each list is read from the copy the refresh job stores (every 6 hours). Only a list with
 * no stored copy at all is downloaded during the scan. A copy older than
 * REFERENCE_SANCTIONS_MAX_AGE_HOURS makes the whole answer "unavailable": a stale list never
 * says "no match".
 */

const P = 'registry.sanctions';

export const SANCTIONS_LISTS = {
  ofac: { name: 'OFAC SDN', url: 'https://www.treasury.gov/ofac/downloads/sdn.csv' },
  uk: { name: 'UK Sanctions List', url: 'https://sanctionslist.fcdo.gov.uk/docs/UK-Sanctions-List.csv' },
  un: { name: 'UN Consolidated List', url: 'https://scsanctions.un.org/resources/xml/en/consolidated.xml' },
  // DG Trésor's Registre national des gels: French national, UN and EU asset freezes. Address
  // from the official structure page (gels-avoirs.dgtresor.gouv.fr/Gels/FichierStructure) and
  // the API's swagger, checked 14 Nov 2026. A User-Agent header is required since 21 Jan 2025.
  fr: { name: 'French asset-freeze register', url: 'https://gels-avoirs.dgtresor.gouv.fr/ApiPublic/api/v1/publication/derniere-publication-fichier-json' },
  // The EU consolidated financial sanctions list (asset freezes), published by the European
  // Commission (DG FISMA) on its Financial Sanctions Files site. This is the XML 1.1 file exactly
  // as listed in the official EU open-data catalogue (data.europa.eu, dataset "Consolidated list of
  // persons, groups and entities subject to EU financial sanctions", checked 15 Nov 2026), with the
  // public token the catalogue itself gives. Reuse under Commission Decision 2011/833/EU. The FSF
  // manual says each logged-in user (a free EU Login account) also gets their own token: see
  // docs/SECOND-WAVE-SOURCES.md. Second-wave (Germany and the EU) data; never read live yet.
  eu: { name: 'EU consolidated financial sanctions list', url: 'https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw' },
} as const;
export type SanctionsListId = keyof typeof SANCTIONS_LISTS;

const POSSIBLE_MATCH = 0.88;

/**
 * These are big files: on 5 Nov 2026 the UK list was 50 MB, OFAC 5.8 MB and the UN
 * list 2.2 MB, and on a slow link the UK one alone took 88 seconds. The usual 10
 * seconds would make every scan fail. Lists are downloaded once a day, so a long
 * wait here doesn't repeat. Production should still fetch them in a scheduled job.
 */
export const LIST_DOWNLOAD_TIMEOUT_MS = 5 * 60_000;

/** OFAC sdn.csv has no header: ent_num, name, type, program, ... An entity's type is "-0-". */
export function parseOfacCsv(csv: string): string[] {
  return parseCsv(csv)
    .filter((row) => (row[1] ?? '').trim() !== '' && !/individual|vessel|aircraft/i.test(row[2] ?? ''))
    .map((row) => (row[1] as string).trim());
}

/** The UK list starts with a "Report Date" line, then a header. Each alias has its own row. */
export function parseUkCsv(csv: string): string[] {
  const rows = parseCsv(csv);
  const headerIndex = rows.findIndex((row) => row.some((cell) => cell.trim() === 'Name 6'));
  if (headerIndex === -1) throw new SourceError("The UK Sanctions List isn't in the format we expect.");
  const header = (rows[headerIndex] as string[]).map((cell) => cell.trim());
  const col = (name: string) => header.indexOf(name);
  const type = col('Designation Type');
  const nameColumns = ['Name 1', 'Name 2', 'Name 3', 'Name 4', 'Name 5', 'Name 6'].map(col).filter((i) => i !== -1);
  const names = rows.slice(headerIndex + 1)
    .filter((row) => /entity/i.test(row[type] ?? ''))
    .map((row) => nameColumns.map((i) => (row[i] ?? '').trim()).filter(Boolean).join(' '))
    .filter(Boolean);
  return [...new Set(names)];
}

const xml = new XMLParser({ ignoreAttributes: true, parseTagValue: false, trimValues: true });

/** UN list: CONSOLIDATED_LIST > ENTITIES > ENTITY, with aliases. Individuals are skipped. */
export function parseUnXml(text: string): string[] {
  const root = asRecord(asRecord(xml.parse(text))['CONSOLIDATED_LIST']);
  if (Object.keys(root).length === 0) throw new SourceError("The UN list isn't in the format we expect.");
  const names: string[] = [];
  for (const entity of asArray(asRecord(root['ENTITIES'])['ENTITY']).map(asRecord)) {
    const first = asString(entity['FIRST_NAME']);
    if (first) names.push(first);
    for (const alias of asArray(entity['ENTITY_ALIAS']).map(asRecord)) {
      const name = asString(alias['ALIAS_NAME']);
      if (name) names.push(name);
    }
  }
  return names;
}

/** How we store the French register: the entity names only, never the people on it. */
export const GELS_COMPACT_FORMAT = 'vero.sanctions.fr.entities.v1';

/**
 * French register (DG Trésor), JSON. Structure from the official JSON schema published with the
 * register (data.gouv.fr "Registre national des gels", documentation file schema-json), read on
 * 14 Nov 2026: { Publications: { DatePublication, PublicationDetail: [{ IdRegistre, Nature, Nom,
 * RegistreDetail: [{ TypeChamp, Valeur: [...] }] }] } }, Nature one of "Personne physique",
 * "Personne morale", "Navire". Like the other lists, only entities ("Personne morale") are kept:
 * their name and each ALIAS. People and vessels are skipped. Never checked against a real file.
 *
 * Also reads our own compact copy (GELS_COMPACT_FORMAT), which is what the refresh job stores.
 */
export function parseGelsJson(text: string): string[] {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SourceError("The French asset-freeze register isn't in the format we expect.");
  }
  const record = asRecord(raw);
  if (record['format'] === GELS_COMPACT_FORMAT) return asArray(record['names']).map((name) => asString(name)).filter((name): name is string => name !== undefined);
  const publications = asRecord(record['Publications']);
  if (!Array.isArray(publications['PublicationDetail'])) throw new SourceError("The French asset-freeze register isn't in the format we expect.");
  const names: string[] = [];
  for (const entry of asArray(publications['PublicationDetail']).map(asRecord)) {
    if ((asString(entry['Nature']) ?? '').toLowerCase() !== 'personne morale') continue;
    const name = asString(entry['Nom']);
    if (name) names.push(name);
    for (const detail of asArray(entry['RegistreDetail']).map(asRecord)) {
      if (asString(detail['TypeChamp']) !== 'ALIAS') continue;
      for (const value of asArray(detail['Valeur']).map(asRecord)) {
        const alias = asString(value['Alias']);
        if (alias) names.push(alias);
      }
    }
  }
  return [...new Set(names)];
}

/** What the refresh job keeps of the French register: the entity names and the publication date. */
export function compactGels(text: string): string {
  const names = parseGelsJson(text);
  const published = asString(asRecord(asRecord(JSON.parse(text) as unknown)['Publications'])['DatePublication']) ?? null;
  return JSON.stringify({ format: GELS_COMPACT_FORMAT, publishedOn: published, names: [...names].sort() });
}

/** How we store the EU list: the entity names only, never the people on it. */
export const EU_FSF_COMPACT_FORMAT = 'vero.sanctions.eu.entities.v1';

const euXml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', removeNSPrefix: true, parseTagValue: false, parseAttributeValue: false, trimValues: true });

/**
 * EU consolidated financial sanctions list, XML 1.1 (export > sanctionEntity, each with a
 * subjectType whose code is "person" or "enterprise", and nameAlias elements carrying the name
 * in a wholeName attribute). NOT CONFIRMED against an official schema: the FSF site, where the
 * XSD is published, could not be read while writing this (15 Nov 2026), so the element names
 * follow the file's widely used public structure. Anything without a sanctionEntity is refused
 * loudly. Like the other lists, only entities ("enterprise") are kept; people are skipped.
 *
 * Also reads our own compact copy (EU_FSF_COMPACT_FORMAT), which is what the refresh job stores.
 */
export function parseEuFsfXml(text: string): string[] {
  const trimmed = text.trimStart();
  if (trimmed.startsWith('{')) {
    try {
      const record = asRecord(JSON.parse(trimmed) as unknown);
      if (record['format'] === EU_FSF_COMPACT_FORMAT) return asArray(record['names']).map((name) => asString(name)).filter((name): name is string => name !== undefined);
    } catch {
      // Not our compact copy: refused below.
    }
    throw new SourceError("The EU sanctions list isn't in the format we expect.");
  }
  let parsed: unknown;
  try {
    parsed = euXml.parse(text);
  } catch {
    throw new SourceError("The EU sanctions list isn't in the format we expect.");
  }
  const root = asRecord(asRecord(parsed)['export']);
  if (root['sanctionEntity'] === undefined) throw new SourceError("The EU sanctions list isn't in the format we expect.");
  const names: string[] = [];
  for (const entity of asArray(root['sanctionEntity']).map(asRecord)) {
    const kinds = asArray(entity['subjectType']).map(asRecord).map((type) => (asString(type['@_code']) ?? '').toLowerCase());
    if (!kinds.includes('enterprise')) continue;
    for (const alias of asArray(entity['nameAlias']).map(asRecord)) {
      const name = asString(alias['@_wholeName']);
      if (name) names.push(name);
    }
  }
  return [...new Set(names)];
}

/** What the refresh job keeps of the EU list: the entity names and the file's generation date. */
export function compactEuFsf(text: string): string {
  const names = parseEuFsfXml(text);
  let generated: string | null = null;
  try {
    generated = asString(asRecord(asRecord(euXml.parse(text))['export'])['@_generationDate']) ?? null;
  } catch {
    generated = null;
  }
  return JSON.stringify({ format: EU_FSF_COMPACT_FORMAT, generatedOn: generated, names: [...names].sort() });
}

export function screenName(name: string, listed: readonly string[]): { exact: string[]; possible: string[] } {
  const wanted = normaliseName(name);
  const exact: string[] = [];
  const possible: string[] = [];
  for (const entry of listed) {
    if (normaliseName(entry) === wanted) exact.push(entry);
    else if (nameSimilarity(entry, name) >= POSSIBLE_MATCH) possible.push(entry);
  }
  return { exact, possible };
}

export function parseList(id: SanctionsListId, text: string): string[] {
  switch (id) {
    case 'ofac': return parseOfacCsv(text);
    case 'uk': return parseUkCsv(text);
    case 'un': return parseUnXml(text);
    case 'fr': return parseGelsJson(text);
    case 'eu': return parseEuFsfXml(text);
  }
}

/** The DG Trésor API refuses requests without a User-Agent. A plain name, no contact details. */
const DEFAULT_LIST_USER_AGENT = 'VeroScan sanctions check';

export function chosenLists(value: string | undefined): SanctionsListId[] {
  return (value ?? '').split(',').map((v) => v.trim().toLowerCase()).filter((v): v is SanctionsListId => v in SANCTIONS_LISTS);
}

type ListRead = { names: string[]; checkedAt: Date | null } | { stale: Date };

export function createSanctionsConnector(deps: ConnectorDeps): Connector {
  const now = deps.now ?? (() => new Date());
  const loaded = new Map<SanctionsListId, { names: string[]; at: number }>();
  const fromCopy: Record<SanctionsListId, Map<string, string[]>> = { ofac: new Map(), uk: new Map(), un: new Map(), fr: new Map(), eu: new Map() };
  const DAY = 24 * 3600 * 1000;
  const listUserAgent = deps.env['REFERENCE_USER_AGENT']?.trim() || DEFAULT_LIST_USER_AGENT;

  /** The stored copy first. Only with no copy at all is the list downloaded during the scan. */
  async function namesFor(id: SanctionsListId, http: Http): Promise<ListRead> {
    const stored = await readStored(deps.reference, `sanctions.${id}`, now(), (text) => parseList(id, text), fromCopy[id]);
    if (stored.state === 'stale') return { stale: stored.copy.checkedAt };
    if (stored.state === 'fresh') {
      if (stored.data.length === 0) throw new SourceError(`Our copy of the ${SANCTIONS_LISTS[id].name} is empty.`);
      return { names: stored.data, checkedAt: stored.copy.checkedAt };
    }
    const held = loaded.get(id);
    if (held && now().getTime() - held.at < DAY) return { names: held.names, checkedAt: null };
    const response = await http(SANCTIONS_LISTS[id].url, id === 'fr' ? { headers: { 'User-Agent': listUserAgent, Accept: 'application/json' } } : id === 'eu' ? { headers: { 'User-Agent': listUserAgent } } : {});
    if (response.status !== 200) throw new SourceError(`We couldn't read the ${SANCTIONS_LISTS[id].name}.`);
    const names = parseList(id, response.text);
    if (names.length === 0) throw new SourceError(`The ${SANCTIONS_LISTS[id].name} came back empty.`);
    loaded.set(id, { names, at: now().getTime() });
    return { names, checkedAt: null };
  }

  return defineConnector({
    id: 'sanctions.lists',
    // FR: so a French company is screened too, once a French company can be scanned.
    // Screens the company name against the stored lists, whatever the country: asked for every company.
    jurisdictions: ['*'],
    capabilities: ['sanctions'],
    factPrefix: P,
    sourceName: 'official sanctions',
    method: 'official_list',
    homeUrl: SANCTIONS_LISTS.ofac.url,
    requiredEnv: ['SANCTIONS_LISTS'],
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      // The timeout for these large files is set where the connector is built, below.
      const lists = chosenLists(env['SANCTIONS_LISTS']);
      const sourceUrl = lists[0] ? SANCTIONS_LISTS[lists[0]].url : SANCTIONS_LISTS.ofac.url;
      if (lists.length === 0) return { status: 'unavailable', sourceUrl, message: 'No sanctions lists are switched on yet.' };

      // Every list is read before any screening. If one list can't be read, this throws, and
      // if one stored copy is too old the answer is "unavailable": "no match" would be untrue.
      const read: { id: SanctionsListId; names: string[]; checkedAt: Date | null }[] = [];
      const stale: { id: SanctionsListId; at: Date }[] = [];
      for (const id of lists) {
        const result = await namesFor(id, http);
        if ('stale' in result) stale.push({ id, at: result.stale });
        else read.push({ id, ...result });
      }
      const oldestStale = stale.map((item) => item.at).sort((a, b) => a.getTime() - b.getTime())[0];
      if (oldestStale) {
        const names = stale.map((item) => SANCTIONS_LISTS[item.id].name).join(' and ');
        return { status: 'unavailable', sourceUrl, message: staleListWords(names, oldestStale) };
      }

      const exact: string[] = [];
      const possible: string[] = [];
      for (const list of read) {
        const result = screenName(ref.name, list.names);
        exact.push(...result.exact);
        possible.push(...result.possible);
      }
      const oldest = read.flatMap((list) => (list.checkedAt ? [list.checkedAt] : [])).sort((a, b) => a.getTime() - b.getTime())[0];
      const note = oldest ? ` ${listUpdatedWords(oldest)}` : '';
      const checked = lists.map((id) => SANCTIONS_LISTS[id].name);
      const facts: Fact[] = [{ key: `${P}.lists_checked`, value: checked }];
      if (exact.length > 0) {
        return { status: 'found', sourceUrl, facts: [...facts, { key: `${P}.match`, value: true }], matchConfidence: 1, message: `This name matches an entry on a sanctions list. It may be another business with the same name.${note}`, candidates: [...new Set(exact)].slice(0, 5).map((name) => ({ name })) };
      }
      if (possible.length > 0) {
        return { status: 'ambiguous', sourceUrl, facts: [...facts, { key: `${P}.possible_match`, value: true }], matchConfidence: POSSIBLE_MATCH, message: `This name is close to an entry on a sanctions list. A person needs to check it.${note}`, candidates: [...new Set(possible)].slice(0, 5).map((name) => ({ name })) };
      }
      const clean = oldest ? `No match on the lists we checked.${note}` : 'No match on the lists we checked today.';
      return { status: 'not_found', sourceUrl, facts: [...facts, { key: `${P}.match`, value: false }, { key: `${P}.possible_match`, value: false }], message: clean };
    },
  }, { ...deps, timeoutMs: deps.timeoutMs ?? LIST_DOWNLOAD_TIMEOUT_MS });
}

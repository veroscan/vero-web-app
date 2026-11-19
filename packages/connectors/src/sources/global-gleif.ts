import { defineConnector, SourceError } from '../runtime.js';
import { asArray, asRecord, asString, toIsoDate } from '../text.js';
import type { Candidate, Connector, ConnectorDeps, Fact, FactValue, LookupOutcome } from '../types.js';
import { alternateLegalForm, companyNameSimilarity, sameCompanyName } from './legal-forms.js';

/**
 * global.gleif: the Global Legal Entity Identifier Foundation's public API (api.gleif.org/api/v1).
 * Free, no key. LEI data is published under CC0. Works for a company in any country.
 *
 * Checked against the official API documentation on 16 Nov 2026 (api.gleif.org/docs, which is
 * GLEIF's published Postman documentation, "GLEIF API v1.0"): JSON:API responses
 * (application/vnd.api+json); GET /lei-records/{lei}; GET /lei-records with
 * filter[entity.legalName] (every word must match), filter[entity.legalAddress.country],
 * page[size] and page[number]; relationship links under data.relationships ("direct-parent",
 * "ultimate-parent"), each with a "relationship-record" link when a parent is reported and a
 * "reporting-exception" link when the entity reported why it gives none; GET
 * /lei-records/{lei}/direct-parent-relationship (attributes.relationship.endNode.id is the
 * parent's LEI). Terms: "There is no charge for the use of GLEIF's LEI data", and "Rate limiting
 * is currently set at 60 requests, per minute, per user, for all users".
 *
 * Checked against real replies on 16 Nov 2026 (Siemens AG, LEI W38RGI023J3WT1HWRP32): the record
 * shape above, as documented; an unknown LEI is a 404 whose body is an HTML page, not JSON; a
 * parent that isn't reported is a 404 JSON:API error on the relationship route, and the record's
 * own links already say so (only "reporting-exception"), so we ask the relationship route only
 * when a parent is reported. The name filter needs every word, so "Siemens AG" doesn't find
 * "Siemens Aktiengesellschaft": a second search with the legal form written the other way is made.
 *
 * What it can't say. Most small companies have no LEI, so a miss by name means "no LEI found",
 * never "this company doesn't exist", and `identified` stays unknown (null). A lapsed LEI (the
 * entity stopped renewing it) is a fact about the LEI, not proof of anything about the company.
 *
 * Personal data. GLEIF lists some sole traders (entity category SOLE_PROPRIETOR): their legal
 * name is a person's name and their legal address can be their home. Such records are never
 * kept and never offered as candidates. For companies, only the country of the legal address is
 * kept, never the address itself. Parents are kept as their LEI only.
 */

const BASE = 'https://api.gleif.org/api/v1';
const P = 'registry.global.gleif';
/** Published: 60 a minute per user. We stay under it. */
const RATE = { requests: 50, perMs: 60_000 };
const PAGE_SIZE = 10;
const SOLE_PROPRIETOR = 'SOLE_PROPRIETOR';

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

/** ISO 17442: 18 letters or digits, then two check digits; the whole passes ISO 7064 MOD 97-10. */
export function normaliseLei(value: string | undefined): string | null {
  if (!value) return null;
  const lei = value.toUpperCase().replace(/[\s-]/g, '');
  return /^[A-Z0-9]{18}[0-9]{2}$/.test(lei) ? lei : null;
}

export function isValidLei(value: string | undefined): boolean {
  const lei = normaliseLei(value);
  if (!lei) return false;
  let remainder = 0;
  for (const ch of lei) {
    const digits = /[0-9]/.test(ch) ? ch : String(ch.charCodeAt(0) - 55);
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

function entityOf(record: Record<string, unknown>): Record<string, unknown> {
  return asRecord(asRecord(record['attributes'])['entity']);
}

function legalName(record: Record<string, unknown>): string {
  return asString(asRecord(entityOf(record)['legalName'])['name']) ?? '';
}

function allNames(record: Record<string, unknown>): string[] {
  const entity = entityOf(record);
  const others = asArray(entity['otherNames']).map((item) => asString(asRecord(item)['name']));
  return [legalName(record), ...others].filter((name): name is string => name !== undefined && name !== '');
}

/** A sole trader: a person. Never kept. */
export function isGleifPerson(record: Record<string, unknown>): boolean {
  return asString(entityOf(record)['category']) === SOLE_PROPRIETOR;
}

type ParentLinks = { reported: boolean | null; relationshipUrl: string | undefined };

function parentLinks(record: Record<string, unknown>, which: 'direct-parent' | 'ultimate-parent'): ParentLinks {
  const links = asRecord(asRecord(asRecord(record['relationships'])[which])['links']);
  const relationshipUrl = asString(links['relationship-record']);
  if (relationshipUrl) return { reported: true, relationshipUrl };
  if (asString(links['reporting-exception'])) return { reported: false, relationshipUrl: undefined };
  return { reported: null, relationshipUrl: undefined };
}

/** The facts for one LEI record about a legal entity. No address, no person. */
export function parseGleifRecord(raw: unknown, ref: { name: string; jurisdiction: string }): Fact[] {
  const record = asRecord(raw);
  const attributes = asRecord(record['attributes']);
  const entity = entityOf(record);
  const registration = asRecord(attributes['registration']);
  const registrationStatus = asString(registration['status']);
  const jurisdiction = asString(entity['jurisdiction']);
  const country = asString(asRecord(entity['legalAddress'])['country']);
  const wantedCountry = ref.jurisdiction.slice(0, 2);
  const facts: Fact[] = [
    fact('identified', true),
    fact('lei', asString(attributes['lei']) ?? asString(record['id']) ?? ''),
    fact('name_matches', allNames(record).some((name) => companyNameSimilarity(name, ref.name) >= 0.8)),
    fact('country_matches', [country, jurisdiction?.slice(0, 2)].includes(wantedCountry)),
  ];
  if (registrationStatus) facts.push(fact('registration_status', registrationStatus), fact('lei_lapsed', registrationStatus === 'LAPSED'));
  const optional: [string, string | undefined][] = [
    ['legal_name', legalName(record) || undefined],
    ['entity_status', asString(entity['status'])],
    ['entity_category', asString(entity['category'])],
    ['legal_form_code', asString(asRecord(entity['legalForm'])['id'])],
    ['legal_jurisdiction', jurisdiction],
    ['legal_address_country', country],
    ['registration_authority_id', asString(asRecord(entity['registeredAt'])['id'])],
    ['registered_as', asString(entity['registeredAs'])],
    ['next_renewal_on', toIsoDate(asString(registration['nextRenewalDate'])) ?? undefined],
  ];
  for (const [key, value] of optional) if (value !== undefined) facts.push(fact(key, value));
  for (const [which, key] of [['direct-parent', 'direct_parent_reported'], ['ultimate-parent', 'ultimate_parent_reported']] as const) {
    facts.push(fact(key, parentLinks(record, which).reported));
  }
  return facts;
}

/** The words for a miss. Most companies have no LEI, so a miss is never "doesn't exist". */
export const GLEIF_MISS = {
  name: "We didn't find an LEI for this name in the GLEIF database. That's normal for many companies: an LEI is only needed for some financial dealings. If the company has one, add it to your answers and we'll check it.",
  lei: "GLEIF has no record of this LEI. Every LEI ever issued is listed there, lapsed ones too, so please check the number in your answers.",
  person: "This LEI belongs to a sole trader, which is a person. We don't keep records about people, so it isn't used here.",
} as const;

function records(raw: unknown): Record<string, unknown>[] {
  return asArray(asRecord(raw)['data']).map(asRecord);
}

export function createGleifConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'global.gleif',
    jurisdictions: ['*'],
    capabilities: ['entity_lookup'],
    factPrefix: P,
    sourceName: 'GLEIF',
    method: 'official_live',
    homeUrl: BASE,
    // No key. Like the other keyless sources it stays off until we name ourselves.
    requiredEnv: ['PUBLIC_API_USER_AGENT'],
    rateLimit: RATE,
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      const headers = { Accept: 'application/vnd.api+json', 'User-Agent': (env['PUBLIC_API_USER_AGENT'] as string).trim() };

      /** The parent's LEI, when one is reported. A failure here never spoils the main answer. */
      async function parentLei(links: ParentLinks): Promise<string | null> {
        if (!links.relationshipUrl?.startsWith(`${BASE}/`)) return null;
        try {
          const response = await http(links.relationshipUrl, { headers });
          if (response.status !== 200) return null;
          const node = asRecord(asRecord(asRecord(asRecord(asRecord(response.json())['data'])['attributes'])['relationship'])['endNode']);
          return asString(node['type']) === 'LEI' ? asString(node['id']) ?? null : null;
        } catch {
          return null;
        }
      }

      async function found(record: Record<string, unknown>, sourceUrl: string, raw: string, matchConfidence: number): Promise<LookupOutcome> {
        const facts = parseGleifRecord(record, ref);
        for (const [which, key] of [['direct-parent', 'direct_parent_lei'], ['ultimate-parent', 'ultimate_parent_lei']] as const) {
          const lei = await parentLei(parentLinks(record, which));
          if (lei) facts.push(fact(key, lei));
        }
        return { status: 'found', sourceUrl, raw, facts, matchConfidence };
      }

      if (ref.lei !== undefined) {
        const lei = normaliseLei(ref.lei);
        if (!lei || !isValidLei(lei)) {
          return { status: 'unsupported', sourceUrl: BASE, message: "That LEI doesn't look right: it should be 20 letters and digits and pass the LEI check. Correct it in your answers and we'll check again." };
        }
        const url = `${BASE}/lei-records/${lei}`;
        const response = await http(url, { headers });
        // An unknown LEI is a 404 with an HTML page (16 Nov 2026), so it isn't read as JSON.
        if (response.status === 404) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: GLEIF_MISS.lei };
        const record = asRecord(asRecord(response.json())['data']);
        if (asString(asRecord(record['attributes'])['lei']) !== lei) throw new SourceError('GLEIF sent something we couldn\'t read.');
        if (isGleifPerson(record)) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: GLEIF_MISS.person };
        return found(record, url, response.text, 1);
      }

      const country = ref.jurisdiction.slice(0, 2);
      const searchUrl = (name: string) => `${BASE}/lei-records?filter%5Bentity.legalName%5D=${encodeURIComponent(name)}&filter%5Bentity.legalAddress.country%5D=${country}&page%5Bsize%5D=${PAGE_SIZE}&page%5Bnumber%5D=1`;
      let url = searchUrl(ref.name);
      let response = await http(url, { headers });
      let companies = (response.status === 404 ? [] : records(response.json())).filter((item) => !isGleifPerson(item) && asString(leiOf(item)));
      let exact = companies.filter((item) => allNames(item).some((name) => sameCompanyName(name, ref.name)));
      const alternate = alternateLegalForm(ref.name);
      if (exact.length === 0 && alternate) {
        // "Siemens AG" doesn't find "Siemens Aktiengesellschaft": the filter needs every word.
        url = searchUrl(alternate);
        response = await http(url, { headers });
        const more = (response.status === 404 ? [] : records(response.json())).filter((item) => !isGleifPerson(item) && asString(leiOf(item)));
        companies = [...companies, ...more.filter((item) => !companies.some((seen) => leiOf(seen) === leiOf(item)))];
        exact = companies.filter((item) => allNames(item).some((name) => sameCompanyName(name, ref.name)));
      }
      // A subdivision (US-DE) narrows by the entity's legal jurisdiction, then active entities win.
      let chosen = exact;
      if (chosen.length > 1 && ref.jurisdiction.length > 2) {
        const local = chosen.filter((item) => asString(entityOf(item)['jurisdiction']) === ref.jurisdiction);
        if (local.length > 0) chosen = local;
      }
      if (chosen.length > 1) {
        const active = chosen.filter((item) => asString(entityOf(item)['status']) === 'ACTIVE');
        if (active.length > 0) chosen = active;
      }
      const only = chosen.length === 1 ? chosen[0] : undefined;
      if (only) return found(only, url, response.text, 0.9);

      const close = exact.length > 1 ? exact : companies.filter((item) => companyNameSimilarity(legalName(item), ref.name) >= 0.6).slice(0, 5);
      if (close.length > 0) {
        const candidates: Candidate[] = close.slice(0, 5).map((item) => ({ name: legalName(item), identifier: leiOf(item) as string }));
        return {
          status: 'ambiguous', sourceUrl: url, raw: response.text, candidates,
          matchConfidence: Math.max(...close.map((item) => companyNameSimilarity(legalName(item), ref.name))),
          message: 'A few entities in the GLEIF database could be yours. Add your LEI so we check the right one.',
        };
      }
      return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: GLEIF_MISS.name };
    },
  }, deps);
}

function leiOf(record: Record<string, unknown>): string | undefined {
  return asString(asRecord(record['attributes'])['lei']) ?? asString(record['id']);
}


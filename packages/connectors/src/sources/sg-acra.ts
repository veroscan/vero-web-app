import { defineConnector } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact } from '../types.js';
import { chooseByName, factIn, normaliseSingaporeUen, publicUserAgent, pushDefined, registerWords } from './national-common.js';

/**
 * sg.acra: "Entities Registered with ACRA", the dataset the Accounting and Corporate Regulatory
 * Authority publishes on data.gov.sg (collection "Registered Entities with Unique Entity Number",
 * dataset d_3f960c10fed6145404ca7b821f263b87, updated monthly). Free, official, no key needed: a
 * data.gov.sg key only raises the rate limit. Licence: Singapore Open Data Licence.
 *
 * Checked on 16 Nov 2026 against the dataset's own metadata (api-production.data.gov.sg/v2/public/
 * api/datasets/{id}/metadata: columns uen, issuance_agency_desc, uen_status_desc, entity_name,
 * entity_type_desc, uen_issue_date, reg_street_name, reg_postal_code) and the data.gov.sg
 * developer guide (guide.data.gov.sg, "API rate limits": datastore search 4 requests per 10
 * seconds without a key, 429 when exceeded). We stay at 3 per 10 seconds.
 *
 * Checked against a real reply on 16 Nov 2026 (Singapore Airlines Limited, 197200078R):
 * GET data.gov.sg/api/action/datastore_search?resource_id=...&filters={"uen":"..."} gives
 * `success`, `result.records[]`, `result.total`. The full-text `q` search is not usable for names
 * (it matched 166,169 unrelated rows), so names are matched exactly, upper case, with `filters`.
 *
 * What it can't say. The dataset is a monthly copy, so a company registered this month may be
 * missing; and a name must match the registered name exactly. A miss is never "doesn't exist".
 * It holds the UEN status, not filings or officers (ACRA's paid BizFile service has those).
 *
 * Personal data. A sole proprietorship or partnership registered as a business is often named
 * after its owner and its address can be a home: such records ("Sole Proprietorship/
 * Partnership") are never kept and never offered as candidates. The dataset names no officers.
 */

const SEARCH = 'https://data.gov.sg/api/action/datastore_search';
const DATASET = 'd_3f960c10fed6145404ca7b821f263b87';
const P = 'registry.sg.acra';
const fact = factIn(P);
/** 4 per 10 seconds without a key (published). */
const RATE = { requests: 3, perMs: 10_000 };

export const SG_WORDS = registerWords({
  register: "ACRA's register of entities (data.gov.sg)",
  numberLabel: 'UEN',
  numberFormat: 'a Singapore UEN, like 201912345K',
});

export function isSingaporePersonRecord(record: Record<string, unknown>): boolean {
  const type = asString(record['entity_type_desc']);
  return type === undefined || /sole\s*propriet/i.test(type) || asString(record['entity_name']) === undefined;
}

export function parseSingaporeEntity(raw: unknown): Fact[] {
  const record = asRecord(raw);
  const status = asString(record['uen_status_desc']);
  const facts: Fact[] = [
    fact('identified', true),
    fact('uen', asString(record['uen']) ?? ''),
    fact('status', status ? status.toLowerCase().replace(/\s+/g, '_') : 'unknown'),
  ];
  pushDefined(facts, P, [
    ['registered_name', asString(record['entity_name'])],
    ['entity_type', asString(record['entity_type_desc'])],
    ['uen_issued_on', asString(record['uen_issue_date'])],
    ['issuing_agency', asString(record['issuance_agency_desc'])],
    // The registered office postcode of a company: public. Never kept for a person (see above).
    ['registered_postcode', asString(record['reg_postal_code'])],
  ]);
  return facts;
}

function recordsOf(raw: unknown): Record<string, unknown>[] {
  return asArray(asRecord(asRecord(raw)['result'])['records']).map(asRecord);
}

function searchUrl(filters: Record<string, string>): string {
  return `${SEARCH}?resource_id=${DATASET}&limit=20&filters=${encodeURIComponent(JSON.stringify(filters))}`;
}

export function createAcraConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'sg.acra',
    jurisdictions: ['SG'],
    capabilities: ['entity_lookup'],
    factPrefix: P,
    sourceName: 'ACRA (data.gov.sg)',
    method: 'official_live',
    homeUrl: `https://data.gov.sg/datasets/${DATASET}/view`,
    requiredEnv: ['PUBLIC_API_USER_AGENT'],
    rateLimit: RATE,
    // A monthly copy: a day is plenty.
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      const headers = { Accept: 'application/json', 'User-Agent': publicUserAgent(env) };
      const identified = `${P}.identified`;

      if (ref.registry_number !== undefined) {
        const uen = normaliseSingaporeUen(ref.registry_number);
        if (!uen) return { status: 'unsupported', sourceUrl: SEARCH, message: SG_WORDS.invalidNumber };
        const url = searchUrl({ uen });
        const response = await http(url, { headers });
        const match = response.status === 404 ? undefined : recordsOf(response.json()).find((item) => asString(item['uen']) === uen);
        if (!match) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [{ key: identified, value: null }], message: SG_WORDS.notFoundByNumber };
        if (isSingaporePersonRecord(match)) return { status: 'unsupported', sourceUrl: url, raw: response.text, message: SG_WORDS.person };
        return { status: 'found', sourceUrl: url, raw: response.text, facts: parseSingaporeEntity(match), matchConfidence: 1 };
      }

      const url = searchUrl({ entity_name: ref.name.trim().replace(/\s+/g, ' ').toUpperCase() });
      const response = await http(url, { headers });
      const records = (response.status === 404 ? [] : recordsOf(response.json())).filter((item) => !isSingaporePersonRecord(item));
      // Several entities can share a name over the years: prefer the one still registered.
      const live = records.filter((item) => /^(registered|live)/i.test(asString(item['uen_status_desc']) ?? ''));
      const chosen = chooseByName({
        ref, items: live.length === 1 ? live : records, nameOf: (item) => asString(item['entity_name']), numberOf: (item) => asString(item['uen']),
        words: SG_WORDS, identifiedKey: identified, sourceUrl: url, raw: response.text,
      });
      if ('match' in chosen) return { status: 'found', sourceUrl: url, raw: response.text, facts: parseSingaporeEntity(chosen.match), matchConfidence: 0.95 };
      return chosen;
    },
  }, deps);
}

import { listUpdatedWords, readStored, staleListWords } from '../reference-store.js';
import { defineConnector, SourceError } from '../runtime.js';
import { asArray, asRecord, firstString, nameSimilarity, normaliseName } from '../text.js';
import type { Connector, ConnectorDeps, Fact } from '../types.js';

/**
 * ng.ndpc_list: the NDPC's public register of Data Controllers and Processors of
 * Major Importance. GAID 2025 Art 9(7) requires the NDPC to publish it.
 *
 * The matrix called the JSON feed on 4 Nov 2026 (8,981 rows; Name, Category, Year),
 * but its address has a hash that can rotate, so it's set by NDPC_REGISTER_URL and
 * a scheduled job should re-read it from services.ndpc.gov.ng/repo/?flp=dcmi. The
 * register page answered when checked on 5 Nov 2026. Field names are read in any case.
 *
 * The refresh job (reference.ts) stores a copy of the feed. That copy is read first, and the
 * feed is only downloaded during a scan when no copy exists. A copy older than
 * REFERENCE_MAX_AGE_HOURS gives "unavailable", never an answer.
 */

const P = 'registry.ng.ndpc';
const HOME = 'https://services.ndpc.gov.ng/repo/?flp=dcmi';

export interface NdpcEntry { name: string; category: string | undefined; year: string | undefined }

function lowerKeys(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key.toLowerCase(), value]));
}

export function parseNdpcFeed(raw: unknown): NdpcEntry[] {
  const record = asRecord(raw);
  const rows = Array.isArray(raw) ? raw : asArray(record['data'] ?? record['rows'] ?? record['aaData']);
  if (rows.length === 0 && !Array.isArray(raw) && record['data'] === undefined) {
    throw new SourceError("The NDPC list isn't in the format we expect, so we can't read it.");
  }
  return rows.map((row) => lowerKeys(asRecord(row))).map((row) => ({
    name: firstString(row, 'name', 'organisation', 'organization', 'company') ?? '',
    category: firstString(row, 'category', 'class', 'tier')?.toUpperCase(),
    year: firstString(row, 'year'),
  })).filter((entry) => entry.name !== '');
}

/** The feed as text, as the refresh job stores it. */
export function parseNdpcText(text: string): NdpcEntry[] {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SourceError("The NDPC list isn't in the format we expect, so we can't read it.");
  }
  return parseNdpcFeed(raw);
}

export function createNdpcListConnector(deps: ConnectorDeps): Connector {
  const fromCopy = new Map<string, NdpcEntry[]>();
  return defineConnector({
    id: 'ng.ndpc_list',
    jurisdictions: ['NG'],
    capabilities: ['dp_registration'],
    factPrefix: P,
    sourceName: 'NDPC',
    method: 'official_list',
    homeUrl: HOME,
    requiredEnv: ['NDPC_REGISTER_URL'],
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env, now }) {
      // The stored copy first. A copy that is too old gives no answer at all.
      const stored = await readStored(deps.reference, 'ng.ndpc_list', now(), parseNdpcText, fromCopy);
      if (stored.state === 'stale') return { status: 'unavailable', sourceUrl: HOME, message: staleListWords('NDPC list', stored.copy.checkedAt) };
      let entries: NdpcEntry[];
      let evidence: { raw: string } | { rawHash: string };
      let note = '';
      if (stored.state === 'fresh') {
        entries = stored.data;
        evidence = { rawHash: stored.copy.contentHash };
        note = ` ${listUpdatedWords(stored.copy.checkedAt)}`;
      } else {
        const url = env['NDPC_REGISTER_URL'] as string;
        const response = await http(url, { headers: { Accept: 'application/json' } });
        if (response.status === 404) throw new SourceError("The NDPC list has moved, so we couldn't read it.");
        entries = parseNdpcFeed(response.json());
        evidence = { raw: response.text };
      }
      const wanted = normaliseName(ref.name);
      const exact = entries.filter((entry) => normaliseName(entry.name) === wanted)
        .sort((a, b) => (b.year ?? '').localeCompare(a.year ?? ''));
      const best = exact[0];
      if (best) {
        const facts: Fact[] = [{ key: `${P}.listed`, value: true }];
        if (best.category) facts.push({ key: `${P}.category`, value: best.category });
        if (best.year) facts.push({ key: `${P}.year`, value: best.year });
        return { status: 'found', sourceUrl: HOME, ...evidence, facts, matchConfidence: 0.9, ...(note ? { message: note.trim() } : {}) };
      }
      const close = entries.map((entry) => ({ entry, similarity: nameSimilarity(entry.name, ref.name) }))
        .filter((c) => c.similarity >= 0.8).sort((a, b) => b.similarity - a.similarity).slice(0, 5);
      if (close.length > 0) {
        return { status: 'ambiguous', sourceUrl: HOME, ...evidence, matchConfidence: close[0]?.similarity ?? 0, message: `We found a close match on the NDPC list. Check whether it is you.${note}`, candidates: close.map((c) => ({ name: c.entry.name })) };
      }
      return { status: 'not_found', sourceUrl: HOME, ...evidence, facts: [{ key: `${P}.listed`, value: false }], message: `We can't find this company on the NDPC list. It may be listed under another name.${note}` };
    },
  }, deps);
}

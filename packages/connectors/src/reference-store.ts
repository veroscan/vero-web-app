import { SourceError } from './runtime.js';

/**
 * Stored copies of the public lists some sources read: the ICO register file, the NDPC list
 * and the three sanctions lists. A scheduled job downloads each one into the database (see
 * reference.ts); the connectors read the stored copy first and only fall back to their old
 * behaviour (a local file, or a download during the scan) when no copy exists at all.
 *
 * A copy older than its freshness limit is never used for an answer: the source says
 * "unavailable" with a plain reason, so a stale list can't produce a clean result.
 */

export const REFERENCE_KEYS = ['uk.ico_register', 'ng.ndpc_list', 'sanctions.ofac', 'sanctions.uk', 'sanctions.un', 'sanctions.fr', 'fr.cnil_dpo', 'sanctions.eu'] as const;
export type ReferenceKey = (typeof REFERENCE_KEYS)[number];

export function isReferenceKey(value: string): value is ReferenceKey {
  return (REFERENCE_KEYS as readonly string[]).includes(value);
}

/** What is known about a stored copy, without its content. */
export interface ReferenceCopy {
  key: ReferenceKey;
  contentHash: string;
  /** When this content was downloaded. */
  fetchedAt: Date;
  /** When the publisher last confirmed it is current: a download, or a "not modified" answer. */
  checkedAt: Date;
  rowCount: number;
}

export interface ReferenceStore {
  /** The good copy for this key, or null if none has been stored yet. */
  latest(key: ReferenceKey): Promise<ReferenceCopy | null>;
  /** The content of that copy. Null if it has been replaced since `latest` was read. */
  content(key: ReferenceKey, contentHash: string): Promise<string | null>;
}

export interface ReferenceOptions {
  store: ReferenceStore;
  /** ICO, NDPC and CNIL copies older than this are not used. */
  maxAgeHours: number;
  /** Sanctions copies older than this are not used. */
  sanctionsMaxAgeHours: number;
}

export function maxAgeHoursFor(key: ReferenceKey, options: Pick<ReferenceOptions, 'maxAgeHours' | 'sanctionsMaxAgeHours'>): number {
  return key.startsWith('sanctions.') ? options.sanctionsMaxAgeHours : options.maxAgeHours;
}

const DAY_FORMAT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "10 Nov 2026". */
export function dayWords(date: Date): string {
  return DAY_FORMAT.format(date);
}

/** Said on every answer that came from a stored copy. */
export function listUpdatedWords(checkedAt: Date): string {
  return `List last updated on ${dayWords(checkedAt)}.`;
}

/** Said instead of an answer when the copy is too old. */
export function staleListWords(listName: string, checkedAt: Date): string {
  return `Our copy of the ${listName} was last updated on ${dayWords(checkedAt)}, which is too old to rely on, so we haven't checked this yet. It doesn't count for or against your score.`;
}

export type StoredRead<T> =
  | { state: 'none' }
  | { state: 'stale'; copy: ReferenceCopy }
  | { state: 'fresh'; copy: ReferenceCopy; data: T };

/**
 * Reads the stored copy for a key and parses it, keeping the parsed form for as long as the
 * content stays the same, so a large list is parsed once, not once a lookup.
 */
export async function readStored<T>(
  options: ReferenceOptions | undefined,
  key: ReferenceKey,
  now: Date,
  parse: (text: string) => T,
  parsed: Map<string, T>,
): Promise<StoredRead<T>> {
  if (!options) return { state: 'none' };
  const copy = await options.store.latest(key);
  if (!copy) return { state: 'none' };
  const ageMs = now.getTime() - copy.checkedAt.getTime();
  if (ageMs > maxAgeHoursFor(key, options) * 3_600_000) return { state: 'stale', copy };
  const held = parsed.get(copy.contentHash);
  if (held !== undefined) return { state: 'fresh', copy, data: held };
  const text = await options.store.content(key, copy.contentHash);
  if (text === null) throw new SourceError('Our copy of this list changed while we were reading it.');
  const data = parse(text);
  parsed.clear();
  parsed.set(copy.contentHash, data);
  return { state: 'fresh', copy, data };
}

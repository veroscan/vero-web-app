import { type ReferenceKey } from './reference-store.js';
import { createHttp, RateLimiter, sha256, SourceError, type Http, type HttpResponse } from './runtime.js';
import { parseIcoRegister } from './sources/ico-register.js';
import { CNIL_MAX_BYTES, compactCnilDpo, parseCnilCompact } from './sources/fr-cnil-dpo.js';
import { parseNdpcText } from './sources/ndpc-list.js';
import { chosenLists, compactEuFsf, compactGels, LIST_DOWNLOAD_TIMEOUT_MS, parseList, SANCTIONS_LISTS, type SanctionsListId } from './sources/sanctions.js';
import type { Env, FetchLike } from './types.js';

/**
 * Downloads the public lists behind the list sources (ICO, NDPC, sanctions, CNIL DPO), for a scheduled job to store. Nothing here
 * touches the database: the job hands in what it holds and gets back what to write.
 *
 * Every download is a conditional GET (If-None-Match / If-Modified-Since), through the same
 * timeout, retry and rate limit as the connectors. A download that fails, can't be read, is
 * empty, or has under half the rows of the last good copy is rejected, and the job keeps the
 * old copy and records the reason.
 */

export interface ReferenceSourceDefinition {
  key: ReferenceKey;
  /** Plain name, used in reasons. */
  name: string;
  /** Where to download it, or undefined when that isn't set or the list isn't switched on. */
  url(env: Env): string | undefined;
  /** The number of entries we can read in what is stored. Throws a SourceError if the format is wrong. */
  count(text: string): number;
  /** How often the job asks the publisher. */
  everyHours: number;
  /**
   * Turns the download into what is stored, keeping only what the source needs. Without it the
   * download is stored as sent. Throws a SourceError if the format is wrong.
   */
  store?(text: string): string;
  /**
   * For large files: the download is read in pieces and reduced as it arrives, so the whole file
   * is never held in memory or stored. A download over `maxBytes` is refused.
   */
  streamed?: { maxBytes: number; reduce(chunks: AsyncIterable<string>): Promise<string> };
}

const sanctionsSource = (id: SanctionsListId): ReferenceSourceDefinition => ({
  key: `sanctions.${id}`,
  name: SANCTIONS_LISTS[id].name,
  url: (env) => (chosenLists(env['SANCTIONS_LISTS']).includes(id) ? SANCTIONS_LISTS[id].url : undefined),
  count: (text) => parseList(id, text).length,
  everyHours: 6,
  // The French register lists people too, with birth dates and addresses: only entity names are kept.
  ...(id === 'fr' ? { store: compactGels } : {}),
  // The EU list holds people too (birth dates, citizenship, addresses): only entity names are kept.
  ...(id === 'eu' ? { store: compactEuFsf } : {}),
});

const trimmed = (value: string | undefined): string | undefined => (value && value.trim().length > 0 ? value.trim() : undefined);

export const REFERENCE_SOURCES: Readonly<Record<ReferenceKey, ReferenceSourceDefinition>> = {
  'uk.ico_register': {
    key: 'uk.ico_register',
    name: 'ICO register',
    // Not confirmed: the ICO download page refused automated fetches when checked (see ENGINE-STATUS.md).
    url: (env) => trimmed(env['ICO_REGISTER_URL']),
    count: (text) => parseIcoRegister(text).length,
    everyHours: 24,
  },
  'ng.ndpc_list': {
    key: 'ng.ndpc_list',
    name: 'NDPC list',
    url: (env) => trimmed(env['NDPC_REGISTER_URL']),
    count: (text) => parseNdpcText(text).length,
    everyHours: 24,
  },
  'sanctions.ofac': sanctionsSource('ofac'),
  'sanctions.uk': sanctionsSource('uk'),
  'sanctions.un': sanctionsSource('un'),
  'sanctions.fr': sanctionsSource('fr'),
  'sanctions.eu': sanctionsSource('eu'),
  'fr.cnil_dpo': {
    key: 'fr.cnil_dpo',
    name: 'CNIL list of organisations with a data protection officer',
    // The data.gouv.fr resource link (docs/FRANCE.md). Not set by default.
    url: (env) => trimmed(env['FR_CNIL_DPO_URL']),
    count: (text) => parseCnilCompact(text).size,
    // Published monthly; asked daily, and a "not modified" answer costs nothing.
    everyHours: 24,
    // About 32 MB with DPO contact details in it: only SIRENs and dates are kept.
    streamed: { maxBytes: CNIL_MAX_BYTES, reduce: (chunks) => compactCnilDpo(chunks) },
  },
};

/** A new download with fewer rows than this share of the last good copy is not trusted. */
export const MIN_ROW_SHARE = 0.5;

/** What the job holds for a source. All null when nothing has been stored yet. */
export interface HeldCopy {
  contentHash: string | null;
  etag: string | null;
  lastModified: string | null;
  rowCount: number | null;
}

export type RefreshOutcome =
  /** No address is set for this source, or the list isn't switched on. Nothing was asked. */
  | { kind: 'not_configured' }
  /** The publisher said nothing changed, or sent exactly what we hold. The copy is current. */
  | { kind: 'not_modified'; etag: string | null; lastModified: string | null }
  /** A good new copy, to replace the old one in one step. */
  | { kind: 'replaced'; content: string; contentHash: string; etag: string | null; lastModified: string | null; rowCount: number }
  /** Not used. The old copy stays. The reason is plain words with no address or header in it. */
  | { kind: 'rejected'; error: string };

export interface ReferenceRefresherDeps {
  env: Env;
  /** A plain name for us, sent as the User-Agent. */
  userAgent: string;
  fetch?: FetchLike;
  sleep?: (ms: number) => Promise<void>;
  now?: () => Date;
  /** Per attempt. These files are large, so the default is the same as the sanctions connector's. */
  timeoutMs?: number;
  retries?: number;
}

export interface ReferenceRefresher {
  refresh(key: ReferenceKey, held: HeldCopy): Promise<RefreshOutcome>;
}

/** One request a second per source, at most. The job asks each source once every few hours. */
const REFRESH_RATE = { requests: 1, perMs: 1000 };

export function createReferenceRefresher(deps: ReferenceRefresherDeps): ReferenceRefresher {
  const now = deps.now ?? (() => new Date());
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const clients = new Map<ReferenceKey, Http>();
  const limiters = new Map<ReferenceKey, RateLimiter>();
  const limiterFor = (definition: ReferenceSourceDefinition): RateLimiter => {
    let limiter = limiters.get(definition.key);
    if (!limiter) {
      limiter = new RateLimiter(REFRESH_RATE, { now: () => now().getTime(), sleep });
      limiters.set(definition.key, limiter);
    }
    return limiter;
  };
  const client = (definition: ReferenceSourceDefinition): Http => {
    let http = clients.get(definition.key);
    if (!http) {
      http = createHttp({
        fetch: deps.fetch ?? ((url, init) => fetch(url, init)),
        sleep,
        timeoutMs: deps.timeoutMs ?? LIST_DOWNLOAD_TIMEOUT_MS,
        retries: deps.retries ?? 2,
        limiter: limiterFor(definition),
        sourceName: `the ${definition.name}`,
      });
      clients.set(definition.key, http);
    }
    return http;
  };

  return {
    async refresh(key, held) {
      const definition = REFERENCE_SOURCES[key];
      const url = definition.url(deps.env);
      if (!url) return { kind: 'not_configured' };
      if (!url.startsWith('https://')) return { kind: 'rejected', error: `The address for the ${definition.name} must start with https://.` };

      // Only ask "has it changed?" when we really hold a copy to fall back on.
      const headers: Record<string, string> = { 'User-Agent': deps.userAgent };
      if (held.contentHash && held.etag) headers['If-None-Match'] = held.etag;
      if (held.contentHash && held.lastModified) headers['If-Modified-Since'] = held.lastModified;

      const unreadable = (error: unknown): RefreshOutcome => {
        const reason = error instanceof SourceError ? error.message : `We couldn't read the ${definition.name}.`;
        return { kind: 'rejected', error: `${reason} We kept the last good copy.` };
      };

      let got: Downloaded;
      try {
        got = definition.streamed
          ? await streamDownload(deps, sleep, limiterFor(definition), definition, url, headers)
          : await plainDownload(client(definition), url, headers);
      } catch (error) {
        return { kind: 'rejected', error: error instanceof SourceError ? error.message : `We couldn't download the ${definition.name}.` };
      }
      const { etag, lastModified } = got;
      if (got.status === 304) {
        if (!held.contentHash) return { kind: 'rejected', error: `The ${definition.name} said nothing changed, but we hold no copy of it.` };
        return { kind: 'not_modified', etag: etag ?? held.etag, lastModified: lastModified ?? held.lastModified };
      }
      if (got.status !== 200) return { kind: 'rejected', error: `The ${definition.name} wasn't at its address (status ${got.status}).` };
      if (got.empty) return { kind: 'rejected', error: `The ${definition.name} came back empty, so we kept the last good copy.` };
      if (got.failure !== undefined) return unreadable(got.failure);

      // What is stored: the download as sent, or only the part the source needs.
      let content: string;
      try {
        content = got.reduced ?? (definition.store ? definition.store(got.text) : got.text);
      } catch (error) {
        return unreadable(error);
      }

      const contentHash = sha256(content);
      if (contentHash === held.contentHash) return { kind: 'not_modified', etag, lastModified };

      let rowCount: number;
      try {
        rowCount = definition.count(content);
      } catch (error) {
        return unreadable(error);
      }
      if (rowCount === 0) return { kind: 'rejected', error: `The ${definition.name} had no entries we could read, so we kept the last good copy.` };
      if (held.rowCount !== null && held.contentHash && rowCount < held.rowCount * MIN_ROW_SHARE) {
        return {
          kind: 'rejected',
          error: `The ${definition.name} came back with ${rowCount} entries, under half of the ${held.rowCount} in our last good copy, so we kept that copy.`,
        };
      }
      return { kind: 'replaced', content, contentHash, etag, lastModified, rowCount };
    },
  };
}

/** One download, before checking. `reduced` is set for a streamed source, `text` otherwise. */
interface Downloaded {
  status: number;
  etag: string | null;
  lastModified: string | null;
  empty: boolean;
  text: string;
  reduced?: string;
  /** The streamed reader refused the content (format, size). */
  failure?: unknown;
}

async function plainDownload(http: Http, url: string, headers: Record<string, string>): Promise<Downloaded> {
  const response: HttpResponse = await http(url, { headers, allow: [304] });
  return {
    status: response.status,
    etag: response.headers.get('etag'),
    lastModified: response.headers.get('last-modified'),
    empty: response.status === 200 && response.text.trim() === '',
    text: response.text,
  };
}

const RETRYABLE = new Set([429, 500, 502, 503, 504]);

/** A download over a streamed source's size cap. */
class TooLargeError extends SourceError {
  override name = 'TooLargeError';
}
const MAX_WAIT_MS = 30_000;

/** The body in pieces, decoded as UTF-8, refusing anything over the cap. */
async function* decodeBody(body: ReadableStream<Uint8Array>, maxBytes: number, name: string): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) throw new TooLargeError(`The ${name} is much bigger than expected, so we didn't use it.`);
      yield decoder.decode(value, { stream: true });
    }
    const tail = decoder.decode();
    if (tail) yield tail;
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}

/**
 * The same timeout, retries, Retry-After and rate limit as createHttp, but the body is handed
 * to the source's reducer piece by piece instead of being read whole. Errors carry no address.
 */
async function streamDownload(
  deps: ReferenceRefresherDeps,
  sleep: (ms: number) => Promise<void>,
  limiter: RateLimiter,
  definition: ReferenceSourceDefinition,
  url: string,
  headers: Record<string, string>,
): Promise<Downloaded> {
  const streamed = definition.streamed as NonNullable<ReferenceSourceDefinition['streamed']>;
  const fetchImpl = deps.fetch ?? ((target: string, init?: RequestInit) => fetch(target, init));
  const retries = deps.retries ?? 2;
  let problem = `We couldn't reach the ${definition.name}.`;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    await limiter.acquire();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), deps.timeoutMs ?? LIST_DOWNLOAD_TIMEOUT_MS);
    let waitMs: number | null = null;
    try {
      const response = await fetchImpl(url, { headers, signal: controller.signal });
      const base = { status: response.status, etag: response.headers.get('etag'), lastModified: response.headers.get('last-modified'), text: '' };
      if (RETRYABLE.has(response.status)) {
        await response.body?.cancel().catch(() => undefined);
        problem = response.status === 429 ? `The ${definition.name} asked us to slow down.` : `The ${definition.name} had a problem on its side.`;
        const seconds = Number(response.headers.get('retry-after'));
        waitMs = Number.isFinite(seconds) && response.headers.get('retry-after') !== null ? Math.min(seconds * 1000, MAX_WAIT_MS) : null;
      } else if (response.status !== 200) {
        await response.body?.cancel().catch(() => undefined);
        if (response.status === 401 || response.status === 403) throw new SourceError(`The ${definition.name} didn't accept our request.`);
        return { ...base, empty: false };
      } else if (!response.body) {
        return { ...base, empty: true };
      } else {
        let sawText = false;
        const pieces = (async function* () {
          for await (const piece of decodeBody(response.body as ReadableStream<Uint8Array>, streamed.maxBytes, definition.name)) {
            if (piece.trim() !== '') sawText = true;
            yield piece;
          }
        })();
        try {
          const reduced = await streamed.reduce(pieces);
          return sawText ? { ...base, empty: false, reduced } : { ...base, empty: true };
        } catch (error) {
          if (error instanceof TooLargeError || (error instanceof SourceError && sawText)) return { ...base, empty: false, failure: error };
          if (error instanceof SourceError) return { ...base, empty: true };
          throw error;
        }
      }
    } catch (error) {
      if (error instanceof SourceError) throw error;
      problem = controller.signal.aborted ? `The ${definition.name} took too long to answer.` : `We couldn't reach the ${definition.name}.`;
    } finally {
      clearTimeout(timer);
    }
    if (attempt < retries) await sleep(waitMs ?? Math.min(250 * 2 ** attempt, MAX_WAIT_MS));
  }
  throw new SourceError(problem);
}

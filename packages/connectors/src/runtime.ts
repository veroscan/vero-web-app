import { createHash } from 'node:crypto';
import { CompanyRefSchema, type Capability, type CompanyRef, type Connector, type ConnectorDeps, type Env, type EvidenceMethod, type FetchLike, type LookupOutcome, type SourceResult, type SourceStatus } from './types.js';

export class SourceError extends Error {
  override name = 'SourceError';
}

export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** A token bucket, so a connector stays inside a source's published limit. */
export class RateLimiter {
  private tokens: number;
  private last: number;
  private queue: Promise<void> = Promise.resolve();
  private readonly capacity: number;
  private readonly perMs: number;
  private readonly now: () => number;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(limit: { requests: number; perMs: number }, clock: { now: () => number; sleep: (ms: number) => Promise<void> }) {
    this.capacity = limit.requests;
    this.tokens = limit.requests;
    this.perMs = limit.perMs;
    this.now = clock.now;
    this.sleep = clock.sleep;
    this.last = clock.now();
  }

  acquire(): Promise<void> {
    // Waiters queue up, so nobody overtakes.
    this.queue = this.queue.then(() => this.take());
    return this.queue;
  }

  private async take(): Promise<void> {
    const refill = () => {
      const now = this.now();
      this.tokens = Math.min(this.capacity, this.tokens + ((now - this.last) * this.capacity) / this.perMs);
      this.last = now;
    };
    refill();
    if (this.tokens < 1) {
      await this.sleep(Math.ceil(((1 - this.tokens) * this.perMs) / this.capacity));
      refill();
    }
    this.tokens -= 1;
  }
}

export interface HttpResponse {
  status: number;
  headers: Headers;
  text: string;
  json<T = unknown>(): T;
}

export interface HttpOptions extends Omit<RequestInit, 'signal'> {
  /** Don't throw on these statuses. 404 is always allowed through. */
  allow?: number[];
}

export type Http = (url: string, options?: HttpOptions) => Promise<HttpResponse>;

const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const MAX_BACKOFF_MS = 30_000;

function retryAfterMs(headers: Headers): number | null {
  const value = headers.get('retry-after');
  if (!value) return null;
  const seconds = Number(value);
  return Number.isFinite(seconds) ? Math.min(seconds * 1000, MAX_BACKOFF_MS) : null;
}

/**
 * HTTP with a timeout per attempt, retries with backoff on 429, 5xx and network
 * failures, and a rate limit. Error messages never contain URLs or headers, so
 * keys can't leak through them.
 */
export function createHttp(deps: {
  fetch: FetchLike;
  sleep: (ms: number) => Promise<void>;
  timeoutMs: number;
  retries: number;
  limiter?: RateLimiter;
  sourceName: string;
}): Http {
  return async (url, options = {}) => {
    const { allow = [], ...init } = options;
    let lastProblem = `We couldn't reach ${deps.sourceName}.`;
    for (let attempt = 0; attempt <= deps.retries; attempt += 1) {
      if (deps.limiter) await deps.limiter.acquire();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), deps.timeoutMs);
      let waitMs: number | null = null;
      try {
        const response = await deps.fetch(url, { ...init, signal: controller.signal });
        const text = await response.text();
        const status = response.status;
        if (RETRYABLE.has(status) && !allow.includes(status)) {
          lastProblem = status === 429 ? `${deps.sourceName} asked us to slow down.` : `${deps.sourceName} had a problem on its side.`;
          waitMs = retryAfterMs(response.headers);
        } else if ((status === 401 || status === 403) && !allow.includes(status)) {
          throw new SourceError(`${deps.sourceName} didn't accept our credentials.`);
        } else if (status >= 400 && status !== 404 && !allow.includes(status)) {
          throw new SourceError(`${deps.sourceName} rejected the request.`);
        } else {
          return {
            status,
            headers: response.headers,
            text,
            json<T>() {
              try {
                return JSON.parse(text) as T;
              } catch {
                throw new SourceError(`${deps.sourceName} sent something we couldn't read.`);
              }
            },
          };
        }
      } catch (error) {
        if (error instanceof SourceError) throw error;
        lastProblem = controller.signal.aborted ? `${deps.sourceName} took too long to answer.` : `We couldn't reach ${deps.sourceName}.`;
      } finally {
        clearTimeout(timer);
      }
      if (attempt < deps.retries) await deps.sleep(waitMs ?? Math.min(250 * 2 ** attempt, MAX_BACKOFF_MS));
    }
    throw new SourceError(lastProblem);
  };
}

export interface LookupContext {
  http: Http;
  env: Env;
  now: () => Date;
}

export interface ConnectorDefinition {
  id: string;
  jurisdictions: readonly string[];
  capabilities: readonly Capability[];
  factPrefix: string;
  sourceName: string;
  method: EvidenceMethod;
  /** Where this source lives, used in provenance when no call was made. */
  homeUrl: string;
  /** All of these must be set, or the connector is unavailable. */
  requiredEnv?: readonly string[];
  /** At least one of these must be set. */
  requiredEnvAny?: readonly string[];
  rateLimit?: { requests: number; perMs: number };
  /** How long a good answer may be reused. */
  ttlSeconds?: number;
  lookup(ref: CompanyRef, ctx: LookupContext): Promise<LookupOutcome>;
}

function hasEnv(env: Env, key: string): boolean {
  const value = env[key];
  return typeof value === 'string' && value.trim().length > 0;
}

const CACHEABLE: ReadonlySet<SourceStatus> = new Set(['found', 'not_found']);

/** Wraps a source with env checks, caching, rate limiting, provenance and failure handling. It never throws for a source failure. */
export function defineConnector(definition: ConnectorDefinition, deps: ConnectorDeps): Connector {
  const now = deps.now ?? (() => new Date());
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const limiter = definition.rateLimit
    ? new RateLimiter(definition.rateLimit, { now: () => now().getTime(), sleep })
    : undefined;
  const http = createHttp({
    fetch: deps.fetch ?? ((url, init) => fetch(url, init)),
    sleep,
    timeoutMs: deps.timeoutMs ?? 10_000,
    retries: deps.retries ?? 2,
    sourceName: definition.sourceName,
    ...(limiter ? { limiter } : {}),
  });

  const result = (outcome: LookupOutcome): SourceResult => {
    const out: SourceResult = {
      connector: definition.id,
      status: outcome.status,
      facts: outcome.facts ?? [],
      provenance: {
        sourceUrl: outcome.sourceUrl,
        retrievedAt: now().toISOString(),
        rawHash: outcome.rawHash ?? sha256(outcome.raw ?? ''),
        sourceName: definition.sourceName,
        method: definition.method,
      },
      matchConfidence: outcome.matchConfidence ?? (outcome.status === 'found' ? 1 : 0),
    };
    if (outcome.message) out.message = outcome.message;
    if (outcome.candidates) out.candidates = outcome.candidates;
    if (outcome.vendorBusinessId) out.vendorBusinessId = outcome.vendorBusinessId;
    return out;
  };

  // Read each time, so a setting changed after start-up is seen, as before.
  const isConfigured = (): boolean => {
    const missingAll = (definition.requiredEnv ?? []).some((key) => !hasEnv(deps.env, key));
    const anyOf = definition.requiredEnvAny ?? [];
    return !(missingAll || (anyOf.length > 0 && !anyOf.some((key) => hasEnv(deps.env, key))));
  };

  return {
    id: definition.id,
    jurisdictions: definition.jurisdictions,
    capabilities: definition.capabilities,
    factPrefix: definition.factPrefix,
    sourceName: definition.sourceName,
    get configured() {
      return isConfigured();
    },
    async lookup(input) {
      const parsed = CompanyRefSchema.safeParse(input);
      if (!parsed.success) {
        return result({ status: 'error', sourceUrl: definition.homeUrl, message: 'We need a company name to check this.' });
      }
      const ref = parsed.data;

      if (!isConfigured()) {
        return result({ status: 'unavailable', sourceUrl: definition.homeUrl, message: `${definition.sourceName} isn't connected yet.` });
      }

      const cacheKey = `${definition.id}:${JSON.stringify(ref)}`;
      if (deps.cache) {
        const cached = await deps.cache.get(cacheKey);
        if (cached) return cached;
      }

      let outcome: LookupOutcome;
      try {
        outcome = await definition.lookup(ref, { http, env: deps.env, now });
      } catch (error) {
        const message = error instanceof SourceError ? error.message : `We couldn't check ${definition.sourceName} just now.`;
        return result({ status: 'error', sourceUrl: definition.homeUrl, message });
      }
      const final = result(outcome);
      if (deps.cache && CACHEABLE.has(final.status)) {
        await deps.cache.set(cacheKey, final, definition.ttlSeconds ?? 3600);
      }
      return final;
    },
  };
}

/** Turns connector results into the engine's facts and source states, so the two packages meet without depending on each other. */
export function toEngineInput(results: readonly (SourceResult & { factPrefix?: string })[], connectors: readonly Connector[]) {
  const prefixFor = new Map(connectors.map((c) => [c.id, c.factPrefix]));
  const facts = results.flatMap((r) => r.facts.map((fact) => ({
    key: fact.key,
    value: fact.value,
    provenance: {
      source: r.connector,
      source_name: r.provenance.sourceName,
      method: r.provenance.method,
      retrieved_at: r.provenance.retrievedAt,
      source_url: r.provenance.sourceUrl,
      raw_hash: r.provenance.rawHash,
    },
  })));
  const stateOf = (status: SourceStatus) => {
    switch (status) {
      case 'found':
      case 'not_found':
        return 'ok' as const;
      case 'ambiguous':
        return 'ambiguous' as const;
      case 'error':
        return 'error' as const;
      case 'unsupported':
        return 'unsupported' as const;
      case 'waiting':
        return 'waiting' as const;
      default:
        return 'unavailable' as const;
    }
  };
  const sources: Record<string, 'ok' | 'unavailable' | 'error' | 'ambiguous' | 'unsupported' | 'waiting'> = {};
  for (const r of results) {
    const prefix = prefixFor.get(r.connector);
    if (prefix) sources[prefix] = stateOf(r.status);
  }
  return { facts, sources };
}

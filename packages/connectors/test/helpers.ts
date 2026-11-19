import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Fact, FactValue, FetchLike, SourceResult } from '../src/index.js';

export function sample(name: string): string {
  return readFileSync(join(import.meta.dirname, 'samples', name), 'utf8');
}

export function sampleJson(name: string): unknown {
  return JSON.parse(sample(name));
}

type Reply = string | { status: number; body?: string; headers?: Record<string, string> };

/**
 * A fake fetch. Routes are matched by substring, and the most specific wins: the
 * match that reaches furthest along the URL, so "/officers" beats "/company/123"
 * for /company/123/officers. Unmatched URLs fail the test loudly as a 599.
 */
export function fakeFetch(routes: Record<string, Reply | Reply[]>): FetchLike & { calls: { url: string; init?: RequestInit }[] } {
  const calls: { url: string; init?: RequestInit }[] = [];
  const keys = Object.keys(routes);
  const counters = new Map<string, number>();
  const reach = (url: string, key: string) => {
    const at = url.lastIndexOf(key);
    return at === -1 ? -1 : at + key.length;
  };
  const fn = (async (url: string, init?: RequestInit) => {
    calls.push(init ? { url, init } : { url });
    const key = keys
      .filter((k) => url.includes(k))
      .sort((a, b) => reach(url, b) - reach(url, a) || b.length - a.length)[0];
    if (key === undefined) return new Response(`No route for ${url}`, { status: 599 });
    const reply = routes[key] as Reply | Reply[];
    let chosen: Reply;
    if (Array.isArray(reply)) {
      const index = counters.get(key) ?? 0;
      counters.set(key, index + 1);
      chosen = reply[Math.min(index, reply.length - 1)] as Reply;
    } else {
      chosen = reply;
    }
    if (typeof chosen === 'string') return new Response(chosen, { status: 200 });
    const init2: { status: number; headers?: Record<string, string> } = { status: chosen.status };
    if (chosen.headers) init2.headers = chosen.headers;
    return new Response(chosen.body ?? '', init2);
  }) as FetchLike & { calls: { url: string; init?: RequestInit }[] };
  fn.calls = calls;
  return fn;
}

export const noSleep = async () => undefined;

export function factMap(result: SourceResult): Record<string, FactValue> {
  return Object.fromEntries(result.facts.map((f: Fact) => [f.key, f.value]));
}

export const NOW = () => new Date('2026-11-05T09:42:00Z');

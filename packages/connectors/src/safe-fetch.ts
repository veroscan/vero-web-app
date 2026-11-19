import { lookup as dnsLookup } from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import { isIP, type LookupFunction } from 'node:net';

/**
 * Fetching a website a customer named is a server-side request forgery risk, so
 * every hop goes through here. URLs are checked before each request and after each
 * redirect, and the address is checked again at connect time by a custom DNS lookup,
 * so a name that changes its answer (DNS rebinding) is still refused.
 */

export class BlockedUrlError extends Error {
  override name = 'BlockedUrlError';
}

const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 2_000_000;
const ALLOWED_PORTS = new Set(['', '80', '443']);
const BLOCKED_SUFFIXES = ['.localhost', '.local', '.internal', '.intranet', '.lan', '.home', '.corp', '.test', '.invalid', '.onion'];

function ipv4ToNumber(ip: string): number {
  return ip.split('.').reduce((total, part) => total * 256 + Number(part), 0);
}

const V4_BLOCKS: [string, number][] = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12],
  ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
];

function isBlockedV4(ip: string): boolean {
  const value = ipv4ToNumber(ip);
  return V4_BLOCKS.some(([base, bits]) => {
    const size = 2 ** (32 - bits);
    const start = ipv4ToNumber(base);
    return value >= start && value < start + size;
  });
}

/** Expands an IPv6 address to its eight 16-bit groups. */
function expandV6(ip: string): number[] {
  let address = ip.split('%')[0] as string;
  const dotted = /(\d+\.\d+\.\d+\.\d+)$/.exec(address);
  if (dotted) {
    const value = ipv4ToNumber(dotted[1] as string);
    address = `${address.slice(0, -(dotted[1] as string).length)}${Math.floor(value / 65536).toString(16)}:${(value % 65536).toString(16)}`;
  }
  const [head = '', tail] = address.split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const missing = address.includes('::') ? 8 - left.length - right.length : 0;
  return [...left, ...Array.from({ length: missing }, () => '0'), ...right].map((part) => parseInt(part, 16));
}

function embeddedV4(groups: number[], at: number): string {
  const high = groups[at] ?? 0;
  const low = groups[at + 1] ?? 0;
  return [high >> 8, high & 255, low >> 8, low & 255].join('.');
}

function isBlockedV6(ip: string): boolean {
  const g = expandV6(ip);
  const first = g[0] ?? 0;
  const leadingZeros = (count: number) => g.slice(0, count).every((part) => part === 0);
  if (leadingZeros(8)) return true; // ::
  if (leadingZeros(7) && g[7] === 1) return true; // ::1
  if (leadingZeros(5) && g[5] === 0xffff) return isBlockedV4(embeddedV4(g, 6)); // ::ffff:a.b.c.d
  if (leadingZeros(6)) return isBlockedV4(embeddedV4(g, 6)); // ::a.b.c.d
  if (first === 0x64 && g[1] === 0xff9b) return isBlockedV4(embeddedV4(g, 6)); // NAT64
  if (first === 0x2002) return isBlockedV4(embeddedV4(g, 1)); // 6to4
  if ((first & 0xfe00) === 0xfc00) return true; // unique local
  if ((first & 0xffc0) === 0xfe80) return true; // link local
  if ((first & 0xffc0) === 0xfec0) return true; // old site local
  if ((first & 0xff00) === 0xff00) return true; // multicast
  if (first === 0x2001 && g[1] === 0xdb8) return true; // documentation
  return false;
}

export function isBlockedAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isBlockedV4(ip);
  if (family === 6) return isBlockedV6(ip);
  return true;
}

/** Rejects anything but a plain public web address. The URL parser turns decimal and hex IPv4 forms into dotted ones first. */
export function assertSafeUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new BlockedUrlError("That isn't a web address.");
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new BlockedUrlError('Only web addresses can be read.');
  if (url.username || url.password) throw new BlockedUrlError('Web addresses with a login in them are not read.');
  if (!ALLOWED_PORTS.has(url.port)) throw new BlockedUrlError('Only standard web ports are read.');
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  const bare = host.startsWith('[') ? host.slice(1, -1) : host;
  if (isIP(bare) !== 0) {
    if (isBlockedAddress(bare)) throw new BlockedUrlError('That address is private.');
    return url;
  }
  if (bare === '' || bare === 'localhost' || !bare.includes('.') || BLOCKED_SUFFIXES.some((suffix) => bare.endsWith(suffix))) {
    throw new BlockedUrlError('That address is private.');
  }
  return url;
}

export type Resolver = (hostname: string) => Promise<{ address: string; family: number }[]>;

const defaultResolver: Resolver = (hostname) => dnsLookup(hostname, { all: true });

/** A DNS lookup for node:http that refuses to hand over a private address, used at connect time. */
export function guardedLookup(resolver: Resolver = defaultResolver): LookupFunction {
  return (hostname, options, callback) => {
    resolver(hostname).then((addresses) => {
      if (addresses.length === 0 || addresses.some((a) => isBlockedAddress(a.address))) {
        callback(new BlockedUrlError('That address is private.'), '', 0);
        return;
      }
      if (options.all) {
        callback(null, addresses);
        return;
      }
      const first = addresses[0] as { address: string; family: number };
      callback(null, first.address, first.family);
    }).catch((error: unknown) => callback(error as NodeJS.ErrnoException, '', 0));
  };
}

export interface RawResponse {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}

/** One request and no redirects. Swappable for tests. */
export type Transport = (url: URL, options: { userAgent: string; timeoutMs: number; lookup: LookupFunction }) => Promise<RawResponse>;

export const nodeTransport: Transport = (url, options) => new Promise((resolve, reject) => {
  const client = url.protocol === 'https:' ? https : http;
  const request = client.request(url, {
    method: 'GET',
    lookup: options.lookup,
    timeout: options.timeoutMs,
    headers: { 'User-Agent': options.userAgent, Accept: 'text/html,text/plain;q=0.9,*/*;q=0.5' },
  }, (response) => {
    const chunks: Buffer[] = [];
    let size = 0;
    response.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        request.destroy(new Error('Response too large'));
        return;
      }
      chunks.push(chunk);
    });
    response.on('end', () => resolve({ status: response.statusCode ?? 0, headers: response.headers, body: Buffer.concat(chunks).toString('utf8') }));
    response.on('error', reject);
  });
  request.on('timeout', () => request.destroy(new Error('Timed out')));
  request.on('error', reject);
  request.end();
});

export interface SafeResponse extends RawResponse { finalUrl: string }

export async function safeGet(input: string, options: { userAgent: string; timeoutMs?: number; transport?: Transport; resolver?: Resolver }): Promise<SafeResponse> {
  const transport = options.transport ?? nodeTransport;
  const lookup = guardedLookup(options.resolver);
  let current = assertSafeUrl(input);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await transport(current, { userAgent: options.userAgent, timeoutMs: options.timeoutMs ?? 10_000, lookup });
    const location = response.headers['location'];
    if (response.status >= 300 && response.status < 400 && typeof location === 'string') {
      // Every redirect is checked as if it were a new address.
      current = assertSafeUrl(new URL(location, current).href);
      continue;
    }
    return { ...response, finalUrl: current.href };
  }
  throw new BlockedUrlError('That site redirected too many times.');
}

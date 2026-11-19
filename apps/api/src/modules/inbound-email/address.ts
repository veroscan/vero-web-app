import { randomBytes } from 'node:crypto';
import { hashToken } from '../../lib/crypto';

/**
 * A forwarding address is "vero-" and 32 base32 characters (160 random bits), lower case so it
 * survives mail systems that change case. Only its SHA-256 hash is stored: with that much
 * randomness a fast hash is the right tool, and a database leak gives nobody a working address.
 */
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
const PREFIX = 'vero-';
export const LOCAL_PART = /^vero-[a-z2-7]{32}$/;

function base32(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function newLocalPart(): string {
  return `${PREFIX}${base32(randomBytes(20))}`;
}

export function hashLocalPart(localPart: string): string {
  return hashToken(localPart.toLowerCase());
}

/** The last four characters, to recognise the live address by. */
export function hintOf(localPart: string): string {
  return localPart.slice(-4);
}

/** "Name <someone@example.com>" or "someone@example.com" into its parts, lower case. Null if it isn't an address. */
export function parseAddress(raw: string): { local: string; domain: string } | null {
  if (raw.length > 500) return null;
  const angle = /<([^<>]+)>\s*$/.exec(raw);
  const address = (angle?.[1] ?? raw).trim().toLowerCase();
  const at = address.lastIndexOf('@');
  if (at <= 0 || at === address.length - 1) return null;
  const local = address.slice(0, at);
  const domain = address.slice(at + 1);
  if (!/^[a-z0-9.-]{1,253}$/.test(domain) || !domain.includes('.') || /\s/.test(local)) return null;
  return { local, domain };
}

/** The sender's domain only, as the email claimed it. Never the full address. */
export function senderDomainOf(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const parsed = parseAddress(raw);
  if (!parsed || !/^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(parsed.domain)) return null;
  return parsed.domain;
}

import { asString, nameSimilarity, normaliseName, toIsoDate } from '../text.js';
import type { Candidate, LookupOutcome } from '../types.js';

/**
 * Shared by the national registers that need a key (DK, AU, NZ, CA, NL, IE): number checks,
 * name matching, and the words for a refused key. Checksum rules are cited where they are used.
 */

/** Spaces, dots, dashes and slashes out. */
export function digitsOf(value: string | undefined): string {
  return (value ?? '').replace(/[\s./-]/g, '');
}

function weighted(digits: string, weights: readonly number[]): number {
  return weights.reduce((sum, weight, i) => sum + weight * Number(digits[i]), 0);
}

/**
 * Danish CVR number: 8 digits, the last a modulus-11 check digit (Danmarks Statistik). The
 * weights 2,7,6,5,4,3,2,1 (weighted sum divisible by 11) are from the HL7 DK Core guide, not ERST.
 * CVR numbers are never below 10000000.
 */
export function isValidCvr(value: string | undefined): boolean {
  const d = digitsOf(value);
  return /^[1-9]\d{7}$/.test(d) && weighted(d, [2, 7, 6, 5, 4, 3, 2, 1]) % 11 === 0;
}

/** Australian Business Number (abr.business.gov.au/Help/AbnFormat): take 1 from the first digit, weights 10,1,3,...,19, sum divisible by 89. */
export function isValidAbn(value: string | undefined): boolean {
  const d = digitsOf(value);
  if (!/^\d{11}$/.test(d) || d[0] === '0') return false;
  const adjusted = String(Number(d[0]) - 1) + d.slice(1);
  return weighted(adjusted, [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]) % 89 === 0;
}

/** Australian Company Number (ASIC EDGE spec, Appendix D): weights 8..1 over the first 8 digits, check = (10 - sum mod 10) mod 10. */
export function isValidAcn(value: string | undefined): boolean {
  const d = digitsOf(value);
  if (!/^\d{9}$/.test(d)) return false;
  return (10 - (weighted(d, [8, 7, 6, 5, 4, 3, 2, 1]) % 10)) % 10 === Number(d[8]);
}

/** NZBN: a GS1 GTIN-13. Weights 1,3,1,3... from the left over 12 digits, check = (10 - sum mod 10) mod 10. */
export function isValidNzbn(value: string | undefined): boolean {
  const d = digitsOf(value);
  if (!/^\d{13}$/.test(d)) return false;
  const sum = [...d.slice(0, 12)].reduce((total, ch, i) => total + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10 === Number(d[12]);
}

/** Legal-form words taken off either end of a name before comparing, per country. */
export function makeNameNormaliser(forms: readonly string[]): (name: string) => string {
  const set = new Set(forms);
  return (name) => {
    const words = normaliseName(name).split(' ').filter(Boolean);
    while (words.length > 1 && set.has(words[words.length - 1] as string)) words.pop();
    while (words.length > 1 && set.has(words[0] as string)) words.shift();
    return words.join(' ');
  };
}

export interface NamedItem<T> { name: string; id: string; item: T }

export type NamePick<T> =
  | { kind: 'one'; item: T }
  | { kind: 'many'; candidates: Candidate[]; confidence: number }
  | { kind: 'none' };

/**
 * Exactly one company with the same name (legal-form words ignored): that one. Several, or close
 * names: candidates to pick from (at most 5). The caller has already removed people.
 */
export function pickByName<T>(items: readonly NamedItem<T>[], wanted: string, normalise: (name: string) => string): NamePick<T> {
  const seen = new Set<string>();
  const unique = items.filter((entry) => entry.id !== '' && entry.name !== '' && !seen.has(entry.id) && seen.add(entry.id));
  const target = normalise(wanted);
  const exact = unique.filter((entry) => normalise(entry.name) === target);
  if (exact.length === 1) return { kind: 'one', item: (exact[0] as NamedItem<T>).item };
  const close = exact.length > 1 ? exact : unique.filter((entry) => nameSimilarity(entry.name, wanted) >= 0.55).slice(0, 5);
  if (close.length === 0) return { kind: 'none' };
  return {
    kind: 'many',
    candidates: close.slice(0, 5).map((entry) => ({ name: entry.name, identifier: entry.id })),
    confidence: Math.max(...close.map((entry) => nameSimilarity(entry.name, wanted))),
  };
}

/**
 * A refused key is a setup problem on our side, never a fact about the company: "unavailable",
 * with words that say so, and no facts.
 */
export function keyRefused(sourceName: string, sourceUrl: string): LookupOutcome {
  return {
    status: 'unavailable',
    sourceUrl,
    message: `${sourceName} didn't accept our access details, so we couldn't check it. This is a setup problem on our side, not a problem with your company. The account owner needs to check the key in the settings.`,
  };
}

/** ISO dates, dd/mm/yyyy, yyyymmdd, and WCF-style "/Date(ms)/" to yyyy-mm-dd. */
export function isoDate(value: unknown): string | undefined {
  const text = asString(value);
  if (!text) return undefined;
  const wcf = /\/Date\((-?\d+)/.exec(text);
  if (wcf) return new Date(Number(wcf[1])).toISOString().slice(0, 10);
  const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(text);
  return toIsoDate(compact ? `${compact[1]}-${compact[2]}-${compact[3]}` : text) ?? undefined;
}

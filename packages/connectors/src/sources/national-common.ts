import { asString, nameSimilarity, normaliseName } from '../text.js';
import type { Candidate, CompanyRef, Env, Fact, FactValue, LookupOutcome } from '../types.js';

/**
 * Helpers shared by the national company registers that need no key (docs/NATIONAL-REGISTERS.md):
 * Norway, Finland, Czechia, Poland, Singapore and Switzerland.
 *
 * Each country's company number has its own format, and most have a check digit defined by the
 * register itself. A number that fails it is refused before anyone is asked, as with the SIREN.
 */

// ---- Company numbers ----

/** Digits only, after taking out spaces, dots, dashes and slashes people type. */
export function digitsOf(value: string | undefined): string {
  return (value ?? '').replace(/[\s./-]/g, '');
}

/** Weighted sum of the digits, for the mod-11 checks below. */
function weighted(digits: string, weights: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i += 1) sum += Number(digits[i]) * (weights[i] as number);
  return sum;
}

/**
 * Norway, organisasjonsnummer: 9 digits, the last a mod-11 check digit with weights 3 2 7 6 5 4 3 2.
 * A remainder that would need "10" means the number can't exist (Brønnøysundregistrene's rule).
 */
export function normaliseNorwegianOrgNumber(value: string | undefined): string | null {
  const digits = digitsOf(value).replace(/^NO/i, '').replace(/MVA$/i, '');
  return /^\d{9}$/.test(digits) ? digits : null;
}

export function isValidNorwegianOrgNumber(value: string | undefined): boolean {
  const digits = normaliseNorwegianOrgNumber(value);
  if (!digits) return false;
  const remainder = weighted(digits, [3, 2, 7, 6, 5, 4, 3, 2]) % 11;
  const check = remainder === 0 ? 0 : 11 - remainder;
  return check !== 10 && check === Number(digits[8]);
}

/**
 * Finland, Y-tunnus (Business ID): 7 digits, a dash, and a check digit. Weights 7 9 10 5 8 4 2;
 * remainder 0 gives 0, remainder 1 can't be used, otherwise 11 minus the remainder. Older
 * six-digit IDs are written with a leading zero.
 */
export function normaliseFinnishBusinessId(value: string | undefined): string | null {
  const text = (value ?? '').replace(/\s/g, '').replace(/^FI/i, '');
  const match = /^(\d{6,7})-?(\d)$/.exec(text);
  if (!match) return null;
  return `${(match[1] as string).padStart(7, '0')}-${match[2] as string}`;
}

export function isValidFinnishBusinessId(value: string | undefined): boolean {
  const id = normaliseFinnishBusinessId(value);
  if (!id) return false;
  const remainder = weighted(id, [7, 9, 10, 5, 8, 4, 2]) % 11;
  if (remainder === 1) return false;
  const check = remainder === 0 ? 0 : 11 - remainder;
  return check === Number(id[8]);
}

/**
 * Czechia, IČO: 8 digits (shorter ones are padded with zeros). Weights 8 7 6 5 4 3 2 on the first
 * seven; the check is (11 - remainder) mod 10, so remainder 0 gives 1 and remainder 1 gives 0.
 */
export function normaliseCzechIco(value: string | undefined): string | null {
  const digits = digitsOf(value).replace(/^CZ/i, '');
  return /^\d{1,8}$/.test(digits) ? digits.padStart(8, '0') : null;
}

export function isValidCzechIco(value: string | undefined): boolean {
  const ico = normaliseCzechIco(value);
  if (!ico) return false;
  const remainder = weighted(ico, [8, 7, 6, 5, 4, 3, 2]) % 11;
  return (11 - remainder) % 10 === Number(ico[7]);
}

/** Poland, KRS number: up to 10 digits, written with leading zeros. The register defines no check digit. */
export function normalisePolishKrs(value: string | undefined): string | null {
  const digits = digitsOf(value).replace(/^KRS/i, '');
  return /^\d{1,10}$/.test(digits) && Number(digits) > 0 ? digits.padStart(10, '0') : null;
}

/**
 * Singapore, UEN. Three official formats: businesses (8 digits and a letter), local companies (a
 * year, 5 digits and a letter), and other entities ("T" or "S", two year digits, a two-letter entity
 * type, 4 digits and a letter). ACRA doesn't publish the check-letter rule, so only the format is checked.
 */
export function normaliseSingaporeUen(value: string | undefined): string | null {
  const text = (value ?? '').replace(/[\s.-]/g, '').toUpperCase();
  if (/^\d{8}[A-Z]$/.test(text)) return text;
  if (/^(18|19|20)\d{2}\d{5}[A-Z]$/.test(text)) return text;
  if (/^[TSR]\d{2}[A-Z]{2}\d{4}[A-Z]$/.test(text)) return text;
  return null;
}

/**
 * Switzerland, UID: "CHE", 9 digits, the last a mod-11 check digit with weights 5 4 3 2 7 6 5 4
 * (eCH-0097). A remainder that would need "10" is never issued. Written CHE-123.456.789.
 */
export function normaliseSwissUid(value: string | undefined): string | null {
  const text = (value ?? '').replace(/[\s.-]/g, '').toUpperCase().replace(/(MWST|TVA|IVA|HR|RC|RI)$/, '');
  const match = /^(?:CHE)?(\d{9})$/.exec(text);
  return match ? `CHE${match[1] as string}` : null;
}

export function isValidSwissUid(value: string | undefined): boolean {
  const uid = normaliseSwissUid(value);
  if (!uid) return false;
  const digits = uid.slice(3);
  const remainder = weighted(digits, [5, 4, 3, 2, 7, 6, 5, 4]) % 11;
  const check = remainder === 0 ? 0 : 11 - remainder;
  return check !== 10 && check === Number(digits[8]);
}

/** "CHE123456789" to "CHE-123.456.789", the way the register prints it. */
export function formatSwissUid(uid: string): string {
  const digits = uid.replace(/^CHE/, '');
  return `CHE-${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}`;
}

// ---- Names ----

/**
 * Legal-form words in the countries here, in the accent-free lower case normaliseName gives, taken
 * off either end of a name before comparing: "Equinor ASA" and "EQUINOR" compare equal.
 */
const NATIONAL_FORMS = new Set([
  // Norway
  'as', 'asa', 'ans', 'da', 'sa', 'nuf', 'ba', 'ks', 'stiftelse',
  // Finland
  'oy', 'oyj', 'ab', 'abp', 'ky', 'ay', 'osk', 'tmi', 'ry',
  // Czechia: "a. s.", "s. r. o.", "spol. s r.o.", "v.o.s.", "k.s.", "z.s."
  'a', 's', 'r', 'o', 'spol', 'sro', 'v', 'k', 'z', 'zs', 'vos',
  // Poland
  'spolka', 'akcyjna', 'z', 'ograniczona', 'odpowiedzialnoscia', 'sp', 'zoo', 'jawna', 'komandytowa', 'partnerska', 'sa',
  // Singapore
  'pte', 'ltd', 'limited', 'private', 'llp', 'lp',
  // Switzerland
  'ag', 'gmbh', 'sarl', 'sagl', 'sa', 'genossenschaft', 'cooperative', 'kg', 'kig',
]);

export function normaliseNationalName(name: string): string {
  const words = normaliseName(name).split(' ').filter(Boolean);
  while (words.length > 1 && NATIONAL_FORMS.has(words[words.length - 1] as string)) words.pop();
  while (words.length > 1 && NATIONAL_FORMS.has(words[0] as string)) words.shift();
  return words.join(' ');
}

// ---- Facts and words ----

export function factIn(prefix: string) {
  return (key: string, value: FactValue): Fact => ({ key: `${prefix}.${key}`, value });
}

/** Adds the optional facts that have a value. */
export function pushDefined(facts: Fact[], prefix: string, values: readonly (readonly [string, FactValue | undefined])[]): void {
  for (const [key, value] of values) if (value !== undefined) facts.push({ key: `${prefix}.${key}`, value });
}

/** The User-Agent every keyless public source is sent: a plain name for us, never a person's details. */
export function publicUserAgent(env: Env): string {
  return (env['PUBLIC_API_USER_AGENT'] ?? '').trim() || 'VeroScan company checks';
}

export interface RegisterWords {
  /** "the Norwegian Register of Business Enterprises (Brønnøysundregistrene)" */
  register: string;
  /** "organisation number" */
  numberLabel: string;
  /** "9 digits" */
  numberFormat: string;
}

/** The plain words every national register uses. A miss never says the company doesn't exist. */
export function registerWords(words: RegisterWords) {
  return {
    notFoundByName: `We didn't find this name in ${words.register}. That doesn't mean the company doesn't exist: the name may be written differently there. Add the company's ${words.numberLabel} and we'll check again.`,
    notFoundByNumber: `We didn't find this ${words.numberLabel} in ${words.register}. That doesn't mean the company doesn't exist: check the number, and a person may need to check this.`,
    invalidNumber: `That ${words.numberLabel} doesn't look right: it should be ${words.numberFormat}. Correct it in your answers and we'll check again.`,
    ambiguous: `A few companies in ${words.register} could be yours. Add your ${words.numberLabel} so we check the right one.`,
    tooMany: `Many companies in ${words.register} have a name like this. Add your ${words.numberLabel} so we check the right one.`,
    person: `This ${words.numberLabel} belongs to a business run by one person, not a company. We don't keep records about people, so it can't be checked here.`,
    needsNumber: `${capitalise(words.register)} can only be searched by ${words.numberLabel}. Add the company's ${words.numberLabel} in your answers and we'll check it.`,
  };
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * The name step every national register shares. Exactly one company with the same name (legal-form
 * words ignored) is a match; several, or close names, are "ambiguous" with candidates; nothing is
 * "not found" with `identified` unknown (null), never false.
 */
export function chooseByName<T>(options: {
  ref: CompanyRef;
  items: readonly T[];
  nameOf: (item: T) => string | undefined;
  numberOf: (item: T) => string | undefined;
  /** More results exist than were returned, so a missing exact match proves nothing. */
  truncated?: boolean;
  words: ReturnType<typeof registerWords>;
  identifiedKey: string;
  sourceUrl: string;
  raw: string;
}): { match: T } | LookupOutcome {
  const { ref, items, nameOf, numberOf, words } = options;
  const wanted = normaliseNationalName(ref.name);
  const named = items.filter((item) => nameOf(item) !== undefined && numberOf(item) !== undefined);
  const exact = named.filter((item) => normaliseNationalName(nameOf(item) as string) === wanted);
  if (exact.length === 1) return { match: exact[0] as T };
  const close = exact.length > 1 ? exact : named.filter((item) => nameSimilarity(nameOf(item) as string, ref.name) >= 0.55).slice(0, 5);
  if (close.length > 0) {
    const candidates: Candidate[] = close.slice(0, 5).map((item) => ({ name: nameOf(item) as string, identifier: numberOf(item) as string }));
    return {
      status: 'ambiguous', sourceUrl: options.sourceUrl, raw: options.raw, candidates,
      matchConfidence: Math.max(...close.map((item) => nameSimilarity(nameOf(item) as string, ref.name))),
      message: words.ambiguous,
    };
  }
  if (options.truncated) {
    return { status: 'ambiguous', sourceUrl: options.sourceUrl, raw: options.raw, candidates: [], matchConfidence: 0, message: words.tooMany };
  }
  return { status: 'not_found', sourceUrl: options.sourceUrl, raw: options.raw, facts: [{ key: options.identifiedKey, value: null }], message: words.notFoundByName };
}

/** Unique, sorted, non-empty strings. */
export function uniqueSorted(values: readonly (string | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => value !== undefined && value.trim() !== ''))].sort();
}

/** "12.03.2001" (dd.mm.yyyy, as KRS and others print dates) or ISO to yyyy-mm-dd. */
export function dottedDateToIso(value: unknown): string | undefined {
  const text = asString(value);
  if (!text) return undefined;
  const dotted = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text);
  const iso = dotted ? `${dotted[3]}-${(dotted[2] as string).padStart(2, '0')}-${(dotted[1] as string).padStart(2, '0')}` : /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : undefined;
  if (!iso) return undefined;
  const check = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(check.getTime()) && check.toISOString().slice(0, 10) === iso ? iso : undefined;
}

/** "1451177561,25" (Polish decimals) or 1451177561.25 to a number. */
export function amountOf(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = asString(value);
  if (!text) return undefined;
  const number = Number(text.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(number) ? number : undefined;
}

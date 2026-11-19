import { isAllowedByRobots } from '../robots.js';
import { defineConnector } from '../runtime.js';
import { BlockedUrlError, assertSafeUrl, safeGet, type Resolver, type SafeResponse, type Transport } from '../safe-fetch.js';
import { normaliseName, toIsoDate } from '../text.js';
import type { CompanyRef, Connector, ConnectorDeps, Fact, FactValue, LookupOutcome } from '../types.js';
import {
  DATA_PROTECTION_AUTHORITIES,
  DSA_PAGE_LINK,
  LANGUAGE_ALIASES,
  LANGUAGE_FAMILIES,
  LAST_UPDATED_LABELS,
  LINK_VOCABULARY,
  MONTH_NAMES,
  NOTICE_VOCABULARY,
  PRIVACY_PATHS,
  REGISTRATION_LABELS,
  REPRESENTATIVE_VOCABULARY,
  STOPWORDS,
  SUPPORTED_LANGUAGES,
  COOKIE_SETTINGS_WORDS,
  type DataProtectionAuthority,
  type Language,
  type RepresentativeCheck,
  type Terms,
  type Vocabulary,
} from './policy-vocabulary.js';

/**
 * web.policy_scan: reads a company's own website for its privacy notice and cookie
 * behaviour. Plain HTTP only, with an identifying user agent, respecting robots.txt,
 * low volume, and SSRF-safe through safeGet.
 *
 * What it can't see, and doesn't claim: this is the first page load with no browser.
 * Cookies set by scripts, whether reject is as easy as accept, the banner's position
 * (GAID) and GPC behaviour need the Playwright pass in matrix section 14. Those facts
 * simply aren't published, so the rules that need them come out as "verify". Where a
 * consent manager is present, tags in the page may be held back by it, so we don't
 * count them either.
 *
 * Any language: the words it looks for are in policy-vocabulary.ts, per language. The page's
 * language comes from its `lang` attribute, else the Content-Language header, else a guess
 * from its common words. Something found is reported in any language. Something missing is
 * only reported (as false) when the page is in a language we have words for: otherwise the
 * fact is left out and the rules read it as unknown, never as a gap.
 */

const P = 'web.policy';
const MIN_POLICY_WORDS = 300;

const TRACKER_COOKIES = [/^_ga/, /^_gid$/, /^_gcl/, /^_fbp$/, /^_fbc$/, /^fr$/, /^_hj/, /^ajs_/, /^mp_/, /^__hs/, /^hubspotutk$/, /^_uet/, /^_tt_/, /^_pin_/, /^li_/, /^bcookie$/, /^IDE$/];
const TRACKER_HOSTS = ['google-analytics.com', 'googletagmanager.com', 'doubleclick.net', 'connect.facebook.net', 'static.hotjar.com', 'cdn.segment.com', 'cdn.mxpnl.com', 'js.hs-scripts.com', 'bat.bing.com', 'analytics.tiktok.com', 'snap.licdn.com', 'cdn.amplitude.com'];
const CMP_MARKERS = ['onetrust', 'cookielaw.org', 'cookiebot', 'usercentrics', 'didomi', 'trustarc', 'cookieyes', 'termly', 'iubenda', 'osano', 'axeptio', 'klaro', 'complianz', '__tcfapi', '__gpp'];
/** Consent tools' own websites ("Powered by Cookiebot"): a link there is not the company's cookie policy. */
const CMP_VENDOR_HOSTS = ['cookiebot.com', 'onetrust.com', 'cookielaw.org', 'usercentrics.com', 'usercentrics.eu', 'didomi.io', 'trustarc.com', 'cookieyes.com', 'osano.com', 'axeptio.eu', 'complianz.io'];

export interface Link { href: string; text: string }

function decodeEntities(text: string): string {
  return text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

export function htmlToText(html: string): string {
  return decodeEntities(html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|head)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractLinks(html: string): Link[] {
  const links: Link[] = [];
  const pattern = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    links.push({ href: (match[1] ?? match[2] ?? '').trim(), text: htmlToText(match[3] ?? '') });
  }
  return links;
}

export function setCookieNames(headers: SafeResponse['headers']): string[] {
  const value = headers['set-cookie'];
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((cookie) => (cookie.split('=')[0] as string).trim());
}

export function trackerScripts(html: string): string[] {
  const found: string[] = [];
  for (const match of html.matchAll(/<script\b([^>]*)>/gi)) {
    const attributes = match[1] ?? '';
    // A script a consent tool holds back is marked as plain text until consent.
    if (/type\s*=\s*["']text\/plain["']/i.test(attributes) || /data-cookieconsent|data-consent/i.test(attributes)) continue;
    const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(attributes)?.[1];
    if (src && TRACKER_HOSTS.some((host) => src.includes(host))) found.push(src);
  }
  return found;
}

export function detectCmp(html: string): boolean {
  const lower = html.toLowerCase();
  return CMP_MARKERS.some((marker) => lower.includes(marker));
}

export function readLastUpdated(text: string): string | null {
  const match = /(?:last\s+(?:updated|revised|modified)|effective(?:\s+date)?)\s*(?:on)?\s*[:-]?\s*([A-Za-z0-9 ,/-]{6,30})/i.exec(text);
  if (!match) return null;
  const candidate = (match[1] as string).trim();
  const dated = /\d{1,2}\s+[A-Za-z]+\s+\d{4}|[A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/.exec(candidate);
  return dated ? toIsoDate(dated[0]) : null;
}

// ---------------------------------------------------------------------------------------------
// Words in any language: folding, term patterns and the vocabulary sets to read with.

const SPECIAL_LETTERS: Readonly<Record<string, string>> = {
  ł: 'l', Ł: 'L', ø: 'o', Ø: 'O', æ: 'ae', Æ: 'AE', œ: 'oe', Œ: 'OE', ß: 'ss', ẞ: 'SS', đ: 'd', Đ: 'D', ı: 'i', þ: 'th', Þ: 'TH', ð: 'd', Ð: 'D',
};
/** How German and Nordic letters are often spelt in web addresses. */
const ADDRESS_SPELLINGS: Readonly<Record<string, string>> = { ä: 'ae', Ä: 'AE', ö: 'oe', Ö: 'OE', ü: 'ue', Ü: 'UE', å: 'aa', Å: 'AA', ø: 'oe', Ø: 'OE' };

/** Accents off, case kept: "Confidentialité" to "Confidentialite", "Łódź" to "Lodz". */
export function foldText(text: string): string {
  return text
    .replace(/[łŁøØæÆœŒßẞđĐıþÞðÐ]/g, (letter) => SPECIAL_LETTERS[letter] ?? letter)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Letters and digits after folding: Latin, Greek and Cyrillic. Written as ranges, not \p{L},
 * because Unicode property classes make each of the few hundred patterns slow to build.
 */
const LETTERS = 'a-zA-Z0-9\\u00c0-\\u024f\\u0370-\\u03ff\\u0400-\\u04ff';
const WORD_CHAR = `[${LETTERS}]`;
const BETWEEN_WORDS = `[^${LETTERS}]*`;
const WORD_SPLIT = new RegExp(`[^${LETTERS}*]+`);
const NO_SPACE_SCRIPTS = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The text three ways: as written (for the English expressions), folded with case kept (for capitals-only terms), folded in lower case. */
interface TextForms { raw: string; folded: string; lower: string }

function formsOf(raw: string): TextForms {
  const folded = foldText(raw);
  return { raw, folded, lower: folded.toLowerCase() };
}

/**
 * A term as a pattern. Patterns never use the `i` flag: case-insensitive Unicode patterns
 * are slow to build, so lower-case terms are matched against lower-case text instead.
 */
function termSource(term: string, lower: boolean): string {
  const folded = lower ? foldText(term).toLowerCase() : foldText(term);
  // Japanese, Chinese and Korean don't put spaces between words: match the characters as they are.
  if (NO_SPACE_SCRIPTS.test(folded)) return escapeRegExp(folded.replace(/\*/g, ''));
  const words = folded.split(WORD_SPLIT).filter((word) => word.replace(/\*/g, '') !== '');
  const first = words[0];
  const last = words[words.length - 1];
  if (first === undefined || last === undefined) return '(?!)';
  const body = words.map((word) => escapeRegExp(word.replace(/\*/g, '')) + (word.endsWith('*') ? `${WORD_CHAR}*` : '')).join(BETWEEN_WORDS);
  return `${first.startsWith('*') ? '' : `(?<!${WORD_CHAR})`}${body}${last.endsWith('*') ? '' : `(?!${WORD_CHAR})`}`;
}

/** "AGB", "HRB", "ICO": three letters or fewer, all capitals, so it must be in capitals in the text. */
function isAcronym(term: string): boolean {
  const letters = term.replace(/[^\p{L}]/gu, '');
  return letters.length > 0 && letters.length <= 3 && letters === letters.toUpperCase() && letters !== letters.toLowerCase();
}

function variantsOf(term: string): string[] {
  const other = term.replace(/[äÄöÖüÜåÅøØ]/g, (letter) => ADDRESS_SPELLINGS[letter] ?? letter);
  return other === term ? [term] : [term, other];
}

interface CompiledTerms {
  /** English expressions kept from before, tested on the original text. */
  legacy: readonly RegExp[];
  /** Capitals-only terms, case kept: tested on `folded`. */
  strict: RegExp | null;
  /** Every other term, in lower case: tested on `lower`. */
  loose: RegExp | null;
  /** Every term, in lower case, for web addresses. */
  address: RegExp | null;
}

const compiledCache = new WeakMap<Terms, CompiledTerms>();

function alternation(terms: readonly string[], lower: boolean, flags = 'u'): RegExp | null {
  const sources = [...new Set(terms.flatMap(variantsOf).map((term) => termSource(term, lower)))];
  return sources.length === 0 ? null : new RegExp(sources.join('|'), flags);
}

function compile(terms: Terms): CompiledTerms {
  const cached = compiledCache.get(terms);
  if (cached) return cached;
  const words = terms.filter((term): term is string => typeof term === 'string');
  const compiled: CompiledTerms = {
    legacy: terms.filter((term): term is RegExp => term instanceof RegExp),
    strict: alternation(words.filter(isAcronym), false),
    loose: alternation(words.filter((word) => !isAcronym(word)), true),
    address: alternation(words, true),
  };
  compiledCache.set(terms, compiled);
  return compiled;
}

function termsInText(terms: Terms, text: TextForms): boolean {
  const c = compile(terms);
  return c.legacy.some((pattern) => pattern.test(text.raw)) || (c.strict?.test(text.folded) ?? false) || (c.loose?.test(text.lower) ?? false);
}

export function isSupportedLanguage(code: string | null | undefined): code is Language {
  return code !== null && code !== undefined && (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}

function familyOf(language: Language): readonly Language[] {
  return LANGUAGE_FAMILIES.find((family) => family.includes(language)) ?? [language];
}

function sameFamily(a: string, b: string): boolean {
  return a === b || (isSupportedLanguage(a) && familyOf(a).includes(b as Language));
}

/**
 * Whose words a page is read with. A page in one of our languages: English (sites mix it in)
 * plus that language and its close relatives. Any other page: every list, but only to find
 * things, never to report them missing.
 */
export function languagesToRead(code: string | null): readonly Language[] {
  return isSupportedLanguage(code) ? [...new Set<Language>(['en', ...familyOf(code)])] : SUPPORTED_LANGUAGES;
}

/** Whether a miss can be reported for this page: its language is ours and the fact has words for it. */
function canReportMissing(vocabulary: Vocabulary, code: string | null): boolean {
  if (!isSupportedLanguage(code)) return false;
  if (vocabulary.everyLanguage) return true;
  return familyOf(code).some((language) => vocabulary.terms[language] !== undefined);
}

function vocabularyInText(vocabulary: Vocabulary, languages: readonly Language[], text: TextForms): boolean {
  return languages.some((language) => {
    const terms = vocabulary.terms[language];
    return terms !== undefined && termsInText(terms, text);
  });
}

interface PageLink extends Link {
  words: TextForms;
  /** The link's path, query and fragment, decoded, folded and in lower case. Never the host name. */
  foldedPath: string;
  host: string;
  /** False for "#", "javascript:" and the like: they don't lead to a page. */
  navigates: boolean;
}

function prepareLinks(links: readonly Link[], base: string): PageLink[] {
  return links.map((link) => {
    let path = link.href;
    let host = '';
    try {
      const url = new URL(link.href, base);
      host = url.hostname.toLowerCase();
      path = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      // Not a usable address: its own text is all we have.
    }
    let decoded = path;
    try {
      decoded = decodeURIComponent(path);
    } catch {
      // Badly encoded: read it as written.
    }
    return {
      ...link,
      words: formsOf(link.text),
      foldedPath: foldText(decoded).toLowerCase(),
      host,
      navigates: link.href !== '' && !link.href.startsWith('#') && !/^(javascript|mailto|tel|data):/i.test(link.href),
    };
  });
}

function linkFits(link: PageLink, vocabulary: Vocabulary, languages: readonly Language[]): boolean {
  return languages.some((language) => {
    const terms = vocabulary.terms[language];
    if (terms === undefined) return false;
    const c = compile(terms);
    return c.legacy.some((pattern) => pattern.test(link.text) || pattern.test(link.href))
      || termsInText(terms, link.words)
      || (c.address?.test(link.foldedPath) ?? false);
  });
}

function findLink(links: readonly PageLink[], vocabulary: Vocabulary, languages: readonly Language[], onlyPages = false): PageLink | undefined {
  return links.find((link) => (!onlyPages || link.navigates) && linkFits(link, vocabulary, languages));
}

// ---------------------------------------------------------------------------------------------
// The page's language.

export interface PageLanguage {
  /** A language code ("fr", "de"), "ja" and so on for other languages, "und-Cyrl" for a script only. Null when we can't tell. */
  code: string | null;
  supported: boolean;
  source: 'html' | 'header' | 'text' | null;
}

/** "fr-FR" to "fr", "nb" to "no". Null for anything that isn't a language tag. */
export function normaliseLanguageTag(tag: string | null | undefined): string | null {
  if (!tag) return null;
  const primary = (tag.trim().toLowerCase().split(/[-_,;\s]/)[0] ?? '');
  if (!/^[a-z]{2,3}$/.test(primary)) return null;
  return LANGUAGE_ALIASES[primary] ?? primary;
}

const SCRIPTS: readonly [RegExp, string][] = [
  [/[\uac00-\ud7af]/g, 'ko'],
  [/[\u3400-\u9fff]/g, 'zh'],
  [/[\u0400-\u04ff]/g, 'und-Cyrl'],
  [/[\u0370-\u03ff]/g, 'el'],
  [/[\u0600-\u06ff]/g, 'und-Arab'],
  [/[\u0590-\u05ff]/g, 'he'],
  [/[\u0e00-\u0e7f]/g, 'th'],
  [/[\u0900-\u097f]/g, 'und-Deva'],
];

const FOLDED_STOPWORDS = new Map<Language, ReadonlySet<string>>(
  SUPPORTED_LANGUAGES.map((language) => [language, new Set(STOPWORDS[language].map((word) => foldText(word).toLowerCase()))]),
);

const LINK_CHECKS = Object.values(LINK_VOCABULARY) as readonly Vocabulary[];

export interface LanguageGuess { code: string; strong: boolean }

/**
 * Guesses the language from the text: the writing system first, then which language's common
 * words and link words appear most. Null when nothing stands out.
 */
export function guessLanguage(text: string, links: readonly Link[] = []): LanguageGuess | null {
  const sample = text.slice(0, 60_000);
  const latin = (sample.match(/[A-Za-z\u00c0-\u024f]/g) ?? []).length;
  const kana = (sample.match(/[\u3040-\u30ff]/g) ?? []).length;
  const scripts = SCRIPTS.map(([pattern, code]) => [code, (sample.match(pattern) ?? []).length] as const);
  const other = kana + scripts.reduce((total, [, count]) => total + count, 0);
  if (other >= 20 && other > latin) {
    if (kana >= 10) return { code: 'ja', strong: true };
    const [code] = [...scripts].sort((a, b) => b[1] - a[1])[0] as readonly [string, number];
    return { code, strong: true };
  }

  const scores = new Map<Language, number>(SUPPORTED_LANGUAGES.map((language) => [language, 0]));
  const words = new Map<Language, number>(SUPPORTED_LANGUAGES.map((language) => [language, 0]));
  const tokens = foldText(sample).toLowerCase().split(/[^\p{L}]+/u).filter(Boolean).slice(0, 5000);
  for (const token of tokens) {
    for (const language of SUPPORTED_LANGUAGES) {
      if (FOLDED_STOPWORDS.get(language)?.has(token)) words.set(language, (words.get(language) ?? 0) + 1);
    }
  }
  const prepared = prepareLinks(links, 'https://example.invalid/');
  for (const language of SUPPORTED_LANGUAGES) {
    const hits = LINK_CHECKS.filter((vocabulary) => {
      const terms = vocabulary.terms[language];
      return terms !== undefined && terms.length > 0 && prepared.some((link) => linkFits(link, { terms: { [language]: terms } }, [language]));
    }).length;
    scores.set(language, (words.get(language) ?? 0) + 2 * hits);
  }
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const [best, bestScore] = ranked[0] as [Language, number];
  const rival = ranked.find(([language]) => !sameFamily(best, language))?.[1] ?? 0;
  if (bestScore < 3 || bestScore < 1.5 * rival) return null;
  return { code: best, strong: (words.get(best) ?? 0) >= 12 && bestScore >= 2 * rival };
}

/**
 * The page's language: its `lang` attribute, else the Content-Language header, else a guess.
 * A declared language gives way only when the text is plainly in another one (templates often
 * keep `lang="en"` on translated sites).
 */
export function detectLanguage(html: string, headers: SafeResponse['headers'], text: string, links: readonly Link[] = []): PageLanguage {
  const attribute = normaliseLanguageTag(/<html\b[^>]*?\blang\s*=\s*["']?\s*([A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{1,8})*)/i.exec(html)?.[1]);
  const headerValue = headers['content-language'];
  const header = normaliseLanguageTag(Array.isArray(headerValue) ? headerValue[0] : headerValue);
  const guess = guessLanguage(text, links);
  const declared = attribute ? { code: attribute, source: 'html' as const } : header ? { code: header, source: 'header' as const } : null;
  if (declared && !(guess?.strong && !sameFamily(guess.code, declared.code))) {
    return { code: declared.code, supported: isSupportedLanguage(declared.code), source: declared.source };
  }
  if (guess) return { code: guess.code, supported: isSupportedLanguage(guess.code), source: 'text' };
  return { code: null, supported: false, source: null };
}

/** Words, for the length check. Japanese, Chinese and Korean have no spaces, so two characters count as a word. */
export function wordCount(text: string): number {
  const ideographic = (text.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) ?? []).length;
  return text.split(/\s+/).filter(Boolean).length + Math.floor(ideographic / 2);
}

function languageName(code: string): string {
  if (!code.startsWith('und')) {
    try {
      const name = new Intl.DisplayNames(['en'], { type: 'language' }).of(code);
      if (name && name !== code) return name;
    } catch {
      // Fall through to the plain wording.
    }
  }
  return 'a language';
}

// ---------------------------------------------------------------------------------------------
// Dates, regulators and company numbers.

function isoDate(year: number, month: number, day: number): string | null {
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const check = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(check.getTime()) && check.toISOString().slice(0, 10) === iso ? iso : null;
}

/** A date at the very start of `tail` (folded, lower case), after at most a couple of short words ("le", "am", "z dnia"). */
function dateAtStart(tail: string): string | null {
  const lead = '^[^0-9a-z]{0,6}(?:[a-z]{1,6}[^0-9a-z]{1,3}){0,2}';
  const numeric = new RegExp(`${lead}(\\d{1,2})[./ -](\\d{1,2})[./ -](\\d{4})`).exec(tail);
  if (numeric) return isoDate(Number(numeric[3]), Number(numeric[2]), Number(numeric[1]));
  const iso = new RegExp(`${lead}(\\d{4})-(\\d{2})-(\\d{2})`).exec(tail);
  if (iso) return isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const named = new RegExp(`${lead}(\\d{1,2})\\.?\\s+(?:de\\s+)?([a-z]+)\\s+(?:de\\s+)?(\\d{4})`).exec(tail);
  const namedMonth = named ? MONTH_NAMES[named[2] as string] : undefined;
  if (named && namedMonth) return isoDate(Number(named[3]), namedMonth, Number(named[1]));
  const yearFirst = new RegExp(`${lead}(\\d{4})\\.?\\s+([a-z]+)\\s+(\\d{1,2})\\.?`).exec(tail);
  const yearFirstMonth = yearFirst ? MONTH_NAMES[yearFirst[2] as string] : undefined;
  if (yearFirst && yearFirstMonth) return isoDate(Number(yearFirst[1]), yearFirstMonth, Number(yearFirst[3]));
  return null;
}

/** The notice's date, from the labels in LAST_UPDATED_LABELS. */
export function readLocalisedLastUpdated(text: string, languages: readonly Language[]): string | null {
  const folded = foldText(text).toLowerCase();
  for (const language of languages) {
    const labels = LAST_UPDATED_LABELS[language];
    if (!labels) continue;
    const pattern = alternation(labels, true, 'gu');
    if (!pattern) continue;
    for (const match of folded.matchAll(pattern)) {
      const date = dateAtStart(folded.slice((match.index ?? 0) + match[0].length, (match.index ?? 0) + match[0].length + 60));
      if (date) return date;
    }
  }
  return null;
}

interface AuthorityName { authority: DataProtectionAuthority; pattern: RegExp; strict: boolean; length: number }

let authorityNames: AuthorityName[] | undefined;

function namesLongestFirst(): AuthorityName[] {
  authorityNames ??= DATA_PROTECTION_AUTHORITIES
    .flatMap((authority) => authority.names.map((name) => {
      const strict = isAcronym(name);
      return { authority, strict, pattern: alternation([name], !strict, 'gu') as RegExp, length: foldText(name).length };
    }))
    .sort((a, b) => b.length - a.length);
  return authorityNames;
}

function blank(text: string, start: number, length: number): string {
  return `${text.slice(0, start)}${' '.repeat(length)}${text.slice(start + length)}`;
}

/**
 * Which data protection authorities a notice names, by name or website. Longer names are
 * matched first and taken out, so "Nigeria Data Protection Commission" never also reads as
 * Ireland's "Data Protection Commission".
 */
export function namedAuthorities(text: string, hrefs: readonly string[] = []): { named: boolean; countries: string[] } {
  let { folded, lower } = formsOf(text);
  const sameLength = folded.length === lower.length;
  const hits = new Set<DataProtectionAuthority>();
  for (const { authority, pattern, strict } of namesLongestFirst()) {
    const matches = [...(strict ? folded : lower).matchAll(pattern)];
    if (matches.length === 0) continue;
    hits.add(authority);
    for (const match of matches) {
      const at = match.index ?? 0;
      if (strict || sameLength) folded = blank(folded, at, match[0].length);
      if (!strict || sameLength) lower = blank(lower, at, match[0].length);
    }
  }
  const addresses = `${text} ${hrefs.join(' ')}`.toLowerCase();
  for (const authority of DATA_PROTECTION_AUTHORITIES) {
    if (authority.domains.some((domain) => new RegExp(`(?<![a-z0-9-])${escapeRegExp(domain)}(?![a-z0-9-])`).test(addresses))) hits.add(authority);
  }
  const countries = [...new Set([...hits].flatMap((authority) => authority.countries))].sort();
  return { named: hits.size > 0, countries };
}

const NUMBER = '\\d(?:[\\s./-]?\\d){3,}';
const registrationCache = new Map<Language, { strict: RegExp | null; loose: RegExp | null }>();

function registrationPatterns(language: Language): { strict: RegExp | null; loose: RegExp | null } {
  const cached = registrationCache.get(language);
  if (cached) return cached;
  const labels = REGISTRATION_LABELS[language] ?? [];
  const build = (terms: readonly string[], lower: boolean) => {
    const words = alternation(terms, lower);
    return words === null ? null : new RegExp(`(?:${words.source})[^0-9]{0,30}?${NUMBER}`, 'u');
  };
  const patterns = { strict: build(labels.filter(isAcronym), false), loose: build(labels.filter((label) => !isAcronym(label)), true) };
  registrationCache.set(language, patterns);
  return patterns;
}

/** A company number, VAT number or similar, with its label ("SIREN 552 …", "HRB 6684", "KvK 12345678"). */
export function showsRegistrationNumber(text: string, languages: readonly Language[]): boolean {
  const { folded, lower } = formsOf(text);
  return languages.some((language) => {
    const { strict, loose } = registrationPatterns(language);
    return (strict?.test(folded) ?? false) || (loose?.test(lower) ?? false);
  });
}

function compactIdentifier(identifier: string): string {
  return foldText(identifier).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Long enough to compare honestly: six digits, or six characters with letters ("HRB6684"). */
function comparable(identifier: string): boolean {
  const compact = compactIdentifier(identifier);
  return compact.replace(/\D/g, '').length >= 6 || (/[A-Z]/.test(compact) && compact.length >= 6);
}

/**
 * Whether the company's own number appears, spaced or not: "552 032 534" for a SIREN, inside
 * a SIRET or a French VAT number too, or "HRB 6684".
 */
export function showsIdentifier(text: string, identifier: string): boolean {
  const id = compactIdentifier(identifier);
  const digits = id.replace(/\D/g, '');
  if (digits.length >= 6) {
    for (const match of text.matchAll(/\d(?:[ .\-/\u00a0\u202f]?\d)*/g)) {
      const run = match[0].replace(/\D/g, '');
      if (run === digits || (digits.length >= 8 && (run.startsWith(digits) || run.endsWith(digits)))) return true;
    }
  }
  if (/[A-Z]/.test(id) && id.length >= 6) {
    const compact = foldText(text).toUpperCase().replace(/[^A-Z0-9]/g, '');
    for (let at = compact.indexOf(id); at !== -1; at = compact.indexOf(id, at + 1)) {
      if (!/\d/.test(compact[at + id.length] ?? '')) return true;
    }
  }
  return false;
}

/** The company's own numbers the scan was given, where they are long enough to compare. */
export function identifiersOf(ref: CompanyRef): string[] {
  return [ref.registry_number, ref.company_number, ref.siren, ref.vat_number, ref.rc_number]
    .filter((value): value is string => typeof value === 'string' && comparable(value));
}

// ---------------------------------------------------------------------------------------------
// The notice.

export interface PolicyReading {
  /** The notice's language code. Left out, English. Null, unknown: then nothing is reported missing. */
  language?: string | null;
  /** Link addresses in the notice, to spot a regulator's website. */
  hrefs?: readonly string[];
}

/** Checks the notice's words. Each is presence only. A person or lawyer judges whether it's any good. */
export function analysePolicy(text: string, companyName: string, reading: PolicyReading = {}): Fact[] {
  const language = reading.language === undefined ? 'en' : reading.language;
  const supported = isSupportedLanguage(language);
  const languages = languagesToRead(language);
  const forms = formsOf(text);
  const facts: Fact[] = [];
  const fact = (key: string, value: FactValue) => facts.push({ key: `${P}.${key}`, value });
  /** True is always reported; false only when we can read this language. */
  const presence = (key: string, found: boolean, canMiss: boolean) => {
    if (found) fact(key, true);
    else if (canMiss) fact(key, false);
  };
  const check = (key: keyof typeof NOTICE_VOCABULARY) => {
    const vocabulary = NOTICE_VOCABULARY[key];
    presence(key, vocabularyInText(vocabulary, languages, forms), canReportMissing(vocabulary, language));
  };

  fact('word_count', wordCount(text));
  presence('names_company', normaliseName(text).includes(normaliseName(companyName)), supported);
  check('rights_section');
  check('retention_statement');
  check('transfers_section');
  check('dpo_contact');
  presence('complaint_route_ico', /information commissioner|\bico\b/i.test(text), supported);
  presence('complaint_route_ndpc', /nigeria data protection commission|\bndpc\b/i.test(text), supported);
  check('children_section');
  // NDPR alone means the notice predates the Nigeria Data Protection Act 2023.
  presence('stale_citation', /\bNDPR\b/.test(text) && !/\bNDPA\b|data protection act,? 2023/i.test(text), supported);
  const authorities = namedAuthorities(text, reading.hrefs);
  presence('dpa_named', authorities.named, supported);
  if (authorities.countries.length > 0) fact('dpa_countries', authorities.countries);
  const updated = readLastUpdated(text) ?? readLocalisedLastUpdated(text, languages.filter((code) => code !== 'en'));
  if (updated) fact('last_updated', updated);
  return facts;
}

/** Whether the notice mentions artificial intelligence or automated decisions, in any of the page's languages. */
export function mentionsAutomatedDecisions(text: string, language: string | null): boolean {
  return vocabularyInText(NOTICE_VOCABULARY.automated_decisions, languagesToRead(language), formsOf(text));
}

const NO_NOTICE = ['rights_section', 'retention_statement', 'transfers_section', 'dpo_contact', 'complaint_route_ico', 'complaint_route_ndpc', 'children_section', 'names_company', 'dpa_named'];

/** Links nearly every site has in its footer: seeing none means the footer isn't in the page. */
const FOOTER_CHECKS: readonly Vocabulary[] = [LINK_VOCABULARY.privacy, LINK_VOCABULARY.terms_found, LINK_VOCABULARY.cookie_policy_found, LINK_VOCABULARY.legal_notice];

const HOME_LINK_CHECKS = [
  'cookie_policy_found', 'terms_found', 'refund_policy_found', 'complaints_policy_found', 'acceptable_use_found', 'accessibility_found',
  'eula_found', 'takedown_policy_found', 'opt_out_link', 'ccpa_links', 'ai_disclosure_found',
] as const;

export function createPolicyScanConnector(deps: ConnectorDeps & { transport?: Transport; resolver?: Resolver }): Connector {
  return defineConnector({
    id: 'web.policy_scan',
    // Reads the company's own website, whatever the country: asked for every company.
    jurisdictions: ['*'],
    capabilities: ['website'],
    factPrefix: P,
    sourceName: 'your website',
    method: 'official_live',
    homeUrl: 'about:blank',
    requiredEnv: ['WEB_SCAN_USER_AGENT'],
    ttlSeconds: 24 * 3600,
    async lookup(ref, { env }): Promise<LookupOutcome> {
      if (!ref.website_url) return { status: 'unsupported', sourceUrl: 'about:blank', message: "Tell us your website address and we'll read it." };
      const userAgent = env['WEB_SCAN_USER_AGENT'] as string;
      const fetchOptions = {
        userAgent,
        timeoutMs: deps.timeoutMs ?? 10_000,
        ...(deps.transport ? { transport: deps.transport } : {}),
        ...(deps.resolver ? { resolver: deps.resolver } : {}),
      };

      let start: URL;
      try {
        start = assertSafeUrl(/^[a-z][a-z0-9+.-]*:/i.test(ref.website_url) ? ref.website_url : `https://${ref.website_url}`);
      } catch (error) {
        const message = error instanceof BlockedUrlError ? error.message : "We can't read that address.";
        return { status: 'unsupported', sourceUrl: 'about:blank', message };
      }
      const origin = start.origin;
      // We only read the company's own site: the same host, or one under it.
      const ownSite = (target: URL) => target.hostname === start.hostname || target.hostname.endsWith(`.${start.hostname.replace(/^www\./, '')}`);

      try {
        // RFC 9309: a missing robots.txt allows everything. If it's erroring, we hold off.
        const robotsResponse = await safeGet(`${origin}/robots.txt`, fetchOptions);
        const robots = robotsResponse.status >= 200 && robotsResponse.status < 300 ? robotsResponse.body : '';
        if (robotsResponse.status >= 500) {
          return { status: 'unavailable', sourceUrl: `${origin}/robots.txt`, message: "Your site's robots.txt isn't answering, so we held off reading the site." };
        }
        const allowed = (path: string) => isAllowedByRobots(robots, userAgent, path);
        const homePath = start.pathname || '/';
        if (!allowed(homePath)) {
          return { status: 'unavailable', sourceUrl: origin, message: "Your site's robots.txt asks automated tools not to read it, so we didn't." };
        }

        const home = await safeGet(start.href, fetchOptions);
        if (home.status >= 400) {
          return { status: 'error', sourceUrl: start.href, message: `We couldn't load your website. It answered with an error (${home.status}).` };
        }
        const rawLinks = extractLinks(home.body);
        const links = prepareLinks(rawLinks, home.finalUrl);
        const homeText = htmlToText(home.body);
        const language = detectLanguage(home.body, home.headers, homeText, rawLinks);
        const languages = languagesToRead(language.code);
        const fact = (key: string, value: FactValue): Fact => ({ key: `${P}.${key}`, value });
        const cmp = detectCmp(home.body);
        const relLink = /<link\b[^>]*rel\s*=\s*["']privacy-policy["'][^>]*href\s*=\s*["']([^"']+)["']/i.exec(home.body)?.[1];
        // Many sites add their footer with JavaScript, which a plain page load never sees. With
        // no footer link of any kind in the page, nothing link-based is reported missing.
        const footerSeen = relLink !== undefined || links.some((link) => link.navigates && FOOTER_CHECKS.some((vocabulary) => linkFits(link, vocabulary, SUPPORTED_LANGUAGES)));
        const canMiss = (vocabulary: Vocabulary) => footerSeen && canReportMissing(vocabulary, language.code);
        const facts: Fact[] = [
          fact('cmp_detected', cmp),
          fact('cookies_before_consent_count', setCookieNames(home.headers).filter((name) => TRACKER_COOKIES.some((p) => p.test(name))).length),
        ];
        for (const key of HOME_LINK_CHECKS) {
          const vocabulary: Vocabulary = LINK_VOCABULARY[key];
          const candidates = key === 'cookie_policy_found'
            // A "Cookie settings" button that opens the consent tool, or the tool's own website,
            // isn't a cookie policy. A "Cookie policy" link that opens in a window still is.
            ? links.filter((link) => !(link.navigates ? CMP_VENDOR_HOSTS.some((host) => link.host === host || link.host.endsWith(`.${host}`)) : termsInText(COOKIE_SETTINGS_WORDS, link.words)))
            : links;
          if (findLink(candidates, vocabulary, languages) !== undefined) facts.push(fact(key, true));
          else if (canMiss(vocabulary)) facts.push(fact(key, false));
        }
        facts.push(fact('footer_links_found', footerSeen));
        facts.push(fact('language_supported', language.supported));
        if (language.code) facts.push(fact('language', language.code));
        // A consent manager may be holding these back, and we can't tell from here.
        if (!cmp) facts.push(fact('trackers_before_consent_count', trackerScripts(home.body).length));

        const anchor = findLink(links, LINK_VOCABULARY.privacy, languages, true)?.href;
        const localPaths = isSupportedLanguage(language.code) && language.code !== 'en' ? (PRIVACY_PATHS[language.code] ?? []) : [];
        const candidates = [relLink, anchor, ...localPaths, '/privacy', '/privacy-policy', '/legal/privacy'].filter((c): c is string => Boolean(c));

        const raw = [home.body];
        let noticeUrl: string | undefined;
        let noticeText: string | undefined;
        let noticeLanguage: PageLanguage = language;
        let noticeHrefs: string[] = [];
        let offSite = false;
        for (const candidate of candidates) {
          let target: URL;
          try {
            target = assertSafeUrl(new URL(candidate, home.finalUrl).href);
          } catch {
            continue;
          }
          // A notice hosted elsewhere counts as found, unread.
          if (!ownSite(target)) {
            if (candidate === relLink || candidate === anchor) offSite = true;
            noticeUrl = target.href;
            break;
          }
          if (!allowed(target.pathname)) continue;
          const page = await safeGet(target.href, fetchOptions);
          if (page.status !== 200) continue;
          const text = htmlToText(page.body);
          if (wordCount(text) < MIN_POLICY_WORDS) continue;
          noticeUrl = page.finalUrl;
          noticeText = text;
          const pageLinks = extractLinks(page.body);
          noticeHrefs = pageLinks.map((link) => link.href);
          const own = detectLanguage(page.body, page.headers, text, pageLinks);
          if (own.code) noticeLanguage = own;
          raw.push(page.body);
          break;
        }

        if (noticeUrl) facts.push(fact('privacy_notice_found', true), fact('privacy_notice_url', noticeUrl));
        else if (canMiss(LINK_VOCABULARY.privacy)) facts.push(fact('privacy_notice_found', false));
        if (noticeText) {
          facts.push(...analysePolicy(noticeText, ref.name, { language: noticeLanguage.code, hrefs: noticeHrefs }));
          if (mentionsAutomatedDecisions(noticeText, noticeLanguage.code)) {
            const index = facts.findIndex((f) => f.key === `${P}.ai_disclosure_found`);
            if (index === -1) facts.push(fact('ai_disclosure_found', true));
            else facts[index] = fact('ai_disclosure_found', true);
          }
        } else if (!offSite && canMiss(LINK_VOCABULARY.privacy)) {
          for (const key of NO_NOTICE) facts.push(fact(key, false));
          facts.push(fact('stale_citation', false));
        }

        // The legal notice (mentions légales, Impressum) and the company's particulars.
        const legalLink = findLink(links, LINK_VOCABULARY.legal_notice, languages, true);
        let legalText: string | undefined;
        let legalUnread = false;
        if (legalLink) {
          let target: URL | undefined;
          try {
            target = assertSafeUrl(new URL(legalLink.href, home.finalUrl).href);
          } catch {
            target = undefined;
          }
          if (!target) {
            legalUnread = true;
          } else if (!ownSite(target)) {
            facts.push(fact('legal_notice_url', target.href));
            legalUnread = true;
          } else if (target.href === noticeUrl && noticeText) {
            facts.push(fact('legal_notice_url', target.href));
            legalText = noticeText;
          } else if (!allowed(target.pathname)) {
            facts.push(fact('legal_notice_url', target.href));
            legalUnread = true;
          } else {
            try {
              const page = await safeGet(target.href, fetchOptions);
              facts.push(fact('legal_notice_url', page.finalUrl));
              if (page.status === 200) {
                legalText = htmlToText(page.body);
                raw.push(page.body);
              } else {
                legalUnread = true;
              }
            } catch {
              // The legal notice is a side page: if it can't be read, the rest still stands.
              facts.push(fact('legal_notice_url', target.href));
              legalUnread = true;
            }
          }
        }
        const homeParticulars = showsRegistrationNumber(homeText, languages);
        if (legalLink || homeParticulars) facts.push(fact('legal_notice_present', true));
        else if (canMiss(LINK_VOCABULARY.legal_notice)) facts.push(fact('legal_notice_present', false));

        const readPages = [homeText, legalText, noticeText].filter((text): text is string => text !== undefined);
        const particulars = homeParticulars
          || (legalText !== undefined && showsRegistrationNumber(legalText, languages))
          || (noticeText !== undefined && showsRegistrationNumber(noticeText, languagesToRead(noticeLanguage.code)));
        const identifiers = identifiersOf(ref);
        const ownNumber = readPages.some((text) => identifiers.some((identifier) => showsIdentifier(text, identifier)));
        // A miss counts only when every page we found was read, in a language we read.
        const canMissNumber = footerSeen && language.supported && !legalUnread;
        if (particulars || ownNumber) facts.push(fact('registration_number_shown', true));
        else if (canMissNumber) facts.push(fact('registration_number_shown', false));
        if (identifiers.length > 0) {
          if (ownNumber) facts.push(fact('registration_number_matches', true));
          else if (canMissNumber) facts.push(fact('registration_number_matches', false));
        }

        // Representatives and points of contact (GDPR and UK GDPR art 27, DSA arts 11 to 13).
        // They sit in the privacy notice, the legal notice, a DSA page or the terms, so the DSA
        // page (or, without one, the terms) is one more request, robots.txt permitting.
        const readSidePage = async (link: PageLink | undefined): Promise<{ text?: string; unread: boolean }> => {
          if (!link) return { unread: false };
          let target: URL;
          try {
            target = assertSafeUrl(new URL(link.href, home.finalUrl).href);
          } catch {
            return { unread: true };
          }
          if (target.href === noticeUrl) return noticeText !== undefined ? { text: noticeText, unread: false } : { unread: true };
          if (!ownSite(target) || !allowed(target.pathname)) return { unread: true };
          try {
            const page = await safeGet(target.href, fetchOptions);
            if (page.status !== 200) return { unread: true };
            raw.push(page.body);
            return { text: htmlToText(page.body), unread: false };
          } catch {
            // A side page: if it can't be read, the rest still stands, but nothing is reported missing.
            return { unread: true };
          }
        };
        const dsaLink = findLink(links, DSA_PAGE_LINK, languages, true);
        const dsaPage = await readSidePage(dsaLink);
        const termsPage = dsaLink ? { unread: false } : await readSidePage(findLink(links, LINK_VOCABULARY.terms_found, languages, true));
        const contactPages = [homeText, legalText, noticeText, dsaPage.text, termsPage.text]
          .filter((text): text is string => text !== undefined)
          .map(formsOf);
        const contactLanguages = [...new Set<Language>([...languages, ...languagesToRead(noticeLanguage.code)])];
        // A miss counts only when the notice and every side page we found were read, in a language we read.
        const pagesRead = footerSeen && noticeText !== undefined && isSupportedLanguage(noticeLanguage.code) && !legalUnread;
        for (const key of Object.keys(REPRESENTATIVE_VOCABULARY) as RepresentativeCheck[]) {
          const vocabulary: Vocabulary = REPRESENTATIVE_VOCABULARY[key];
          const found = contactPages.some((forms) => vocabularyInText(vocabulary, contactLanguages, forms));
          const isDsa = key.startsWith('dsa_');
          const canMissHere = pagesRead && canReportMissing(vocabulary, language.code) && (!isDsa || (!dsaPage.unread && !termsPage.unread));
          if (found) facts.push(fact(key, true));
          else if (canMissHere) facts.push(fact(key, false));
        }

        if (allowed('/.well-known/security.txt')) {
          const security = await safeGet(`${origin}/.well-known/security.txt`, fetchOptions);
          facts.push(fact('security_txt_found', security.status === 200 && /^\s*contact\s*:/im.test(security.body)));
        }

        const why = !language.supported
          ? (language.code ? `Your website is in ${languageName(language.code)}, which we can't read yet` : "We couldn't tell which language your website is in")
          : footerSeen ? undefined : "Your website's links seem to be added by JavaScript, which we don't run";
        const message = noticeUrl
          ? (why ? `${why}, so some checks need a person.` : undefined)
          : (why ? `${why}, so we couldn't tell whether it has a privacy notice.` : "We couldn't find a privacy notice on your website.");
        return { status: noticeUrl ? 'found' : 'not_found', sourceUrl: home.finalUrl, raw: raw.join('\n'), facts, matchConfidence: 1, ...(message ? { message } : {}) };
      } catch (error) {
        if (error instanceof BlockedUrlError) {
          return { status: 'unsupported', sourceUrl: start.href, message: 'That site points to an address we will not read.' };
        }
        return { status: 'error', sourceUrl: start.href, message: "We couldn't load your website just now." };
      }
    },
  }, deps);
}

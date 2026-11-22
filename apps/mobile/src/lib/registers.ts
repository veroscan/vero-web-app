import { COUNTRIES, COVERAGE_LEVELS, countryCoverage, countryName, countryPlace, isCountryCode, type CoverageLevel, type MvpCountry } from '@vero/shared';

/** Register words for search, confirm and scanning. Ported from apps/web/src/lib/words.ts and format.ts. */
export interface RegisterWords {
  label: string;
  numberLabel: string;
  numberExample: string;
  register: string;
}

const REGISTERS: Record<MvpCountry, RegisterWords> = {
  'US-DE': { label: 'Delaware, United States', numberLabel: 'File number', numberExample: '7741209', register: 'the Delaware register' },
  GB: { label: 'United Kingdom', numberLabel: 'Company number', numberExample: '14839221', register: 'Companies House' },
  NG: { label: 'Nigeria', numberLabel: 'RC number', numberExample: '1849302', register: 'the Corporate Affairs Commission' },
};

/** The three countries with full coverage, shown first in the picker. */
export const FEATURED_COUNTRIES = Object.keys(REGISTERS) as MvpCountry[];

/** Every register Vero can search today: the countries above the "international" level. */
export const SEARCHABLE_COUNTRIES = Object.keys(COVERAGE_LEVELS);

export function registerFor(code: string): RegisterWords {
  if (code in REGISTERS) return REGISTERS[code as MvpCountry];
  return { label: countryName(code), numberLabel: 'Registration number', numberExample: '', register: `the company register in ${countryPlace(code)}` };
}

export function isCountry(value: string | null | undefined): value is string {
  return !!value && isCountryCode(value);
}

export const LEVEL_WORDS: Record<CoverageLevel, string> = { full: 'Full coverage', registry: 'Registry coverage', international: 'International coverage' };

export function coverageOf(code: string): { level: CoverageLevel; sentence: string } {
  return countryCoverage(code);
}

/** Short names where the screens use one (apps/web/src/lib/format.ts countryShort). */
const COUNTRY_SHORT: Readonly<Record<string, string>> = { 'US-DE': 'Delaware', GB: 'UK', NG: 'Nigeria' };
export function countryShort(code: string): string {
  return COUNTRY_SHORT[code] ?? countryName(code);
}

/** Every country, featured first, then the rest of the shared list in its order. */
export const PICKER_COUNTRIES = [
  ...FEATURED_COUNTRIES.map((code) => ({ code, name: REGISTERS[code].label, coverage: coverageOf(code).level })),
  ...COUNTRIES.filter((item) => !(FEATURED_COUNTRIES as readonly string[]).includes(item.code)).map((item) => ({ code: item.code, name: item.name, coverage: item.coverage })),
];

const ENTITY_WORDS: Record<string, string> = {
  ltd: 'Limited company',
  plc: 'Public limited company',
  llp: 'Limited liability partnership',
  llc: 'Limited liability company',
  corporation: 'Corporation',
  c_corp: 'C corporation',
  s_corp: 'S corporation',
};

export function sentence(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function entityWords(value: string | null | undefined): string | null {
  if (!value) return null;
  return ENTITY_WORDS[value.toLowerCase()] ?? sentence(value);
}

const LONG = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** 14 Feb 2023. Anything that isn't a date is shown as it came. */
export function dateWords(value: string): string {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  return Number.isNaN(date.getTime()) ? value : LONG.format(date);
}

/** "today, 09:12" or "14 Feb 2023". */
export function readAtWords(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const today = new Date();
  return date.toDateString() === today.toDateString() ? `today, ${TIME.format(date)}` : LONG.format(date);
}

export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

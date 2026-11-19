import { countryCoverage, countryName, countryPlace, isCountryCode, type MvpCountry, type ScanSource } from '@vero/shared';

export type Tone = 'good' | 'watch' | 'risk' | 'none';

export function statusTone(word: string | null): Tone {
  if (word === 'Healthy') return 'good';
  if (word === 'Needs work') return 'watch';
  if (word === 'At risk') return 'risk';
  return 'none';
}

export function severityTone(severity: string): Tone {
  if (severity === 'critical') return 'risk';
  if (severity === 'high') return 'watch';
  return 'none';
}

/** The line under the score. Words only, chosen by the status the API gives. */
export function scoreSentence(word: string | null): string {
  if (word === 'Healthy') return 'A solid base. Keep it that way.';
  if (word === 'Early read') return "Good so far, but we've checked less than half of what applies.";
  if (word === 'Needs work') return 'A real base, with gaps an investor would notice.';
  if (word === 'At risk') return 'There are gaps here an investor would stop at.';
  return "We don't have enough yet to say where you stand.";
}

/** Finishes "sits in ...", for the label on the ruler. An early read sits in the Healthy band without claiming the word. */
export function bandWords(word: string | null | undefined): string {
  if (word === 'Early read') return "the top band, but it's an early read";
  return word ?? 'no band yet';
}

export interface RegisterWords {
  label: string;
  note: string;
  hint: string;
  numberLabel: string;
  /** A rough shape check, so a typing slip gets a message before a search is used up. */
  numberPattern: string;
  numberExample: string;
  numberMessage: string;
  numberWhere: string;
  register: string;
}

/** The three countries with full coverage, shown first in the picker. Every other country uses registerFor. */
export const REGISTERS: Record<MvpCountry, RegisterWords> = {
  'US-DE': {
    label: 'Delaware, United States',
    note: 'Most US startups are registered here',
    hint: "You'll upload a certificate",
    numberLabel: 'File number',
    numberPattern: '\\s*[0-9]{5,9}\\s*',
    numberExample: '7741209',
    numberMessage: 'Delaware file numbers are usually 7 digits, like 7741209.',
    numberWhere: "It's on your certificate of incorporation.",
    register: 'the Delaware register',
  },
  GB: {
    label: 'United Kingdom',
    note: 'Registered with Companies House',
    hint: 'Live from Companies House',
    numberLabel: 'Company number',
    numberPattern: '\\s*([0-9]{8}|[A-Za-z]{2}[0-9]{6})\\s*',
    numberExample: '14839221',
    numberMessage: 'UK company numbers have 8 characters, like 14839221.',
    numberWhere: "It's on your certificate of incorporation.",
    register: 'Companies House',
  },
  NG: {
    label: 'Nigeria',
    note: 'Registered with the Corporate Affairs Commission',
    hint: 'Through our licensed provider',
    numberLabel: 'RC number',
    numberPattern: '\\s*([Rr][Cc][-\\s]?)?[0-9]{4,8}\\s*',
    numberExample: '1849302',
    numberMessage: 'RC numbers are digits, sometimes with RC in front, like 1849302.',
    numberWhere: "It's on your certificate of incorporation.",
    register: 'the Corporate Affairs Commission',
  },
};

/** The featured countries, in picker order. The rest of the world comes from the shared ISO list. */
export const FEATURED_COUNTRIES = Object.keys(REGISTERS) as MvpCountry[];

function isFeatured(code: string): code is MvpCountry {
  return code in REGISTERS;
}

/** Words for any country's register. Outside the three featured, they come from the shared list and its coverage. */
export function registerFor(code: string): RegisterWords {
  if (isFeatured(code)) return REGISTERS[code];
  const place = countryPlace(code);
  return {
    label: countryName(code),
    note: countryCoverage(code).sentence,
    hint: 'Coverage shown before you start',
    numberLabel: 'Registration number',
    numberPattern: '.{1,64}',
    numberExample: '',
    numberMessage: 'Enter the number as it appears on the register.',
    numberWhere: `It's on the company's papers from ${place}.`,
    register: `the company register in ${place}`,
  };
}

/** Any ISO 3166-1 country, or a US state as US-XX (the shared list). */
export function isCountry(value: string | null): value is string {
  return value !== null && isCountryCode(value);
}

const SOURCE_WORKING: Record<string, string> = {
  'uk.companies_house': 'Reading your record at Companies House.',
  'uk.ico_register': "Looking for you on the UK's data protection register.",
  'uk.hmrc_vat': 'Checking the HMRC VAT register.',
  'us.uspto': 'Searching for trademarks in your name.',
  'us.sec_form_d': 'Looking for your fundraising filings at the SEC.',
  'us.delaware_vendor': 'Looking up your company on the Delaware register.',
  'ng.cac_vendor': 'Asking the Corporate Affairs Commission in Nigeria.',
  'ng.ndpc_list': "Looking for you on Nigeria's data protection register.",
  'sanctions.lists': 'Checking the sanctions lists.',
  'web.policy_scan': 'Reading the privacy notice on your website.',
};

export function sourceWorking(source: Pick<ScanSource, 'connectorId' | 'sourceName'>): string {
  return SOURCE_WORKING[source.connectorId] ?? `Checking ${source.sourceName}.`;
}

export interface SourceStatusWords {
  word: string;
  tone: Tone;
}

/** "Not found" is never called a problem here: it isn't proof of anything. */
export function sourceStatus(source: Pick<ScanSource, 'state' | 'connectorId'>): SourceStatusWords {
  switch (source.state) {
    case 'waiting':
      return { word: 'Waiting', tone: 'none' };
    case 'found':
      return source.connectorId === 'sanctions.lists' ? { word: 'Needs a person', tone: 'watch' } : { word: 'Done', tone: 'good' };
    case 'not_found':
      return source.connectorId === 'sanctions.lists' ? { word: 'Done', tone: 'good' } : { word: 'Not found', tone: 'watch' };
    case 'ambiguous':
      return { word: 'Needs you', tone: 'watch' };
    case 'error':
      return { word: 'Retrying', tone: 'watch' };
    case 'unavailable':
    case 'unsupported':
      return { word: 'Not connected', tone: 'none' };
  }
}

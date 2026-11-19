import { nameSimilarity, normaliseName } from '../text.js';

/**
 * Legal-form words used around the world, for the global sources (GLEIF, VIES, OpenCorporates).
 *
 * `normaliseName` in text.ts only drops English suffixes on purpose. A register outside the UK
 * writes "Siemens Aktiengesellschaft" where the company may have typed "Siemens AG", so these
 * sources compare names with the legal form taken off both ends as well.
 */

/** Long forms, in the accent-free lower case normaliseName gives, mapped to their short form. */
const LONG_FORMS: readonly (readonly [string, string])[] = [
  ['gesellschaft mit beschrankter haftung', 'gmbh'],
  ['aktiengesellschaft', 'ag'],
  ['kommanditgesellschaft auf aktien', 'kgaa'],
  ['kommanditgesellschaft', 'kg'],
  ['societe anonyme', 'sa'],
  ['societe par actions simplifiee', 'sas'],
  ['societe a responsabilite limitee', 'sarl'],
  ['societa per azioni', 'spa'],
  ['societa a responsabilita limitata', 'srl'],
  ['sociedad anonima', 'sa'],
  ['sociedad limitada', 'sl'],
  ['besloten vennootschap', 'bv'],
  ['naamloze vennootschap', 'nv'],
  ['public limited company', 'plc'],
  ['societas europaea', 'se'],
  ['aktiebolag', 'ab'],
  ['aksjeselskap', 'as'],
  ['allmennaksjeselskap', 'asa'],
  ['anpartsselskab', 'aps'],
  ['aktieselskab', 'as'],
  ['osakeyhtio', 'oy'],
];

/** The short forms, and a few words that only ever say what kind of company it is. */
const FORMS = new Set([
  'ltd', 'limited', 'inc', 'incorporated', 'llc', 'plc', 'llp', 'lp', 'corp', 'corporation', 'co', 'company',
  'ag', 'gmbh', 'kg', 'kgaa', 'ug', 'ohg', 'se', 'sa', 'sas', 'sasu', 'sarl', 'eurl', 'sca', 'snc', 'spa', 'srl', 'sl', 'slu',
  'bv', 'nv', 'cv', 'vof', 'ab', 'publ', 'as', 'asa', 'aps', 'oy', 'oyj', 'sro', 'as', 'zoo', 'sp', 'spzoo', 'kft', 'zrt', 'nyrt',
  'doo', 'dd', 'ad', 'ead', 'ood', 'eood', 'ou', 'uab', 'sia', 'lda', 'pty', 'pte', 'bhd', 'sdn', 'kk', 'gk', 'ltda', 'sae',
]);

/** Words that, in a register's name for a business, show it is a company and not a person's own trade. */
const COMPANY_WORDS = new Set([...FORMS].filter((word) => !['co', 'company', 'sp'].includes(word)));

function shorten(text: string): string {
  let out = ` ${text} `;
  for (const [long, short] of LONG_FORMS) out = out.split(` ${long} `).join(` ${short} `);
  return out.trim().replace(/\s+/g, ' ');
}

/** "Siemens AG" and "SIEMENS Aktiengesellschaft" both become "siemens". */
export function normaliseCompanyName(name: string): string {
  const words = shorten(normaliseName(name)).replace(/\bsp z o o\b/g, 'spzoo').replace(/\bs r o\b/g, 'sro').split(' ').filter(Boolean);
  while (words.length > 1 && FORMS.has(words[words.length - 1] as string)) words.pop();
  while (words.length > 1 && FORMS.has(words[0] as string)) words.shift();
  return words.join(' ');
}

/** The same company name, give or take its legal form. */
export function sameCompanyName(a: string, b: string): boolean {
  const left = normaliseCompanyName(a);
  return left.length > 0 && left === normaliseCompanyName(b);
}

/** 0 to 1: the better of the plain comparison and the one without legal forms. */
export function companyNameSimilarity(a: string, b: string): number {
  return Math.max(nameSimilarity(a, b), nameSimilarity(normaliseCompanyName(a), normaliseCompanyName(b)));
}

/** The name with a long legal form written short, or a short one written long, for a second search. */
export function alternateLegalForm(name: string): string | null {
  const words = name.trim().split(/\s+/);
  const last = (words[words.length - 1] ?? '').toLowerCase().replace(/\./g, '');
  const long = LONG_FORMS.find(([, short]) => short === last)?.[0];
  if (long && words.length > 1) return [...words.slice(0, -1), long].join(' ');
  const plain = normaliseName(name);
  const found = LONG_FORMS.find(([form]) => plain.endsWith(` ${form}`));
  if (found) return `${plain.slice(0, -found[0].length).trim()} ${found[1]}`;
  return null;
}

/**
 * True when a business name carries a legal-form word ("SE", "GmbH", "Ltd"). A sole trader's
 * registered name is usually just the person's name, so without such a word a name is treated
 * as possibly a person's and isn't compared or kept. This is a cautious guess, not a test.
 */
export function looksLikeCompanyName(name: string): boolean {
  const words = shorten(normaliseName(name)).split(' ');
  return words.some((word) => COMPANY_WORDS.has(word));
}

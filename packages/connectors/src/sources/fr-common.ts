import { normaliseName } from '../text.js';

/**
 * Small helpers shared by the French sources.
 *
 * A SIREN is the 9-digit number INSEE gives every French company. Its last digit is a Luhn
 * check digit, so a mistyped number is caught before anything is asked.
 */

/** "123 456 789" or "123-456-789" to "123456789". Null when it isn't nine digits. */
export function normaliseSiren(value: string | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/[\s.-]/g, '');
  return /^\d{9}$/.test(digits) ? digits : null;
}

/** The Luhn check used for SIREN numbers. */
export function luhnValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** Nine digits that pass the Luhn check. */
export function isValidSiren(value: string | undefined): boolean {
  const siren = normaliseSiren(value);
  return siren !== null && luhnValid(siren);
}

/** French legal-form words, taken off the end or start of a name before comparing. */
const FR_FORMS = new Set(['sas', 'sasu', 'sarl', 'eurl', 'sa', 'sca', 'scs', 'snc', 'sci', 'scop', 'selarl', 'selas', 'gie', 'sel']);

/** "Kestrel Pay SAS" and "KESTREL PAY" compare equal. */
export function normaliseFrenchName(name: string): string {
  const words = normaliseName(name).split(' ').filter(Boolean);
  while (words.length > 1 && FR_FORMS.has(words[words.length - 1] as string)) words.pop();
  while (words.length > 1 && FR_FORMS.has(words[0] as string)) words.shift();
  return words.join(' ');
}

/**
 * The key of a French intra-EU VAT number, from the official formula (Annuaire des Entreprises,
 * "Numéro de TVA intracommunautaire", annuaire-entreprises.data.gouv.fr/definitions/tva-intracommunautaire):
 * key = (12 + 3 * (SIREN mod 97)) mod 97, written on two digits. Null when the SIREN is not valid.
 */
export function frenchVatKey(sirenInput: string | undefined): string | null {
  const siren = normaliseSiren(sirenInput);
  if (siren === null || !luhnValid(siren)) return null;
  const key = (12 + 3 * (Number(siren) % 97)) % 97;
  return String(key).padStart(2, '0');
}

/**
 * "FR" + key + SIREN. A CANDIDATE only: the formula gives the number a company would carry if it
 * is registered for VAT, and says nothing about whether it is. It is meant to be put to VIES.
 */
export function deriveFrenchVatNumber(sirenInput: string | undefined): string | null {
  const siren = normaliseSiren(sirenInput);
  const key = frenchVatKey(siren ?? undefined);
  return siren !== null && key !== null ? `FR${key}${siren}` : null;
}

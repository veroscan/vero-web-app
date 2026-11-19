/** Calendar arithmetic on plain YYYY-MM-DD dates, in UTC so no timezone can shift a deadline. */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface CalendarDate { year: number; month: number; day: number }

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function parseDate(iso: string): CalendarDate {
  const match = ISO_DATE.exec(iso.slice(0, 10));
  if (!match) throw new Error(`Not a date: "${iso}"`);
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (date.month < 1 || date.month > 12 || date.day < 1 || date.day > daysInMonth(date.year, date.month)) {
    throw new Error(`Not a real date: "${iso}"`);
  }
  return date;
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE.test(value.slice(0, 10))) return false;
  try {
    parseDate(value);
    return true;
  } catch {
    return false;
  }
}

export function formatDate(date: CalendarDate): string {
  const mm = String(date.month).padStart(2, '0');
  const dd = String(date.day).padStart(2, '0');
  return `${String(date.year).padStart(4, '0')}-${mm}-${dd}`;
}

/** A date in a given month, moved back to the last day if that month is shorter (29 Feb to 28 Feb). */
export function clampedDate(year: number, month: number, day: number): string {
  return formatDate({ year, month, day: Math.min(day, daysInMonth(year, month)) });
}

/** Adds calendar months, keeping the day where it can. 30 Nov + 3 months is 28 Feb (or 29 Feb). */
export function addMonths(iso: string, months: number): string {
  const { year, month, day } = parseDate(iso);
  const index = year * 12 + (month - 1) + months;
  const nextYear = Math.floor(index / 12);
  return clampedDate(nextYear, index - nextYear * 12 + 1, day);
}

export function addDays(iso: string, days: number): string {
  const { year, month, day } = parseDate(iso);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** Whole days from one date to another; negative if `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const a = parseDate(from);
  const b = parseDate(to);
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / 86_400_000);
}

export function toIsoDate(value: Date | string): string {
  return typeof value === 'string' ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

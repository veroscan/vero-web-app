import { countryName } from '@vero/shared';

// Ported from apps/web/src/lib/format.ts (dates, plurals and short country names).

const LONG = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const SHORT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' });

function parse(value: string): Date | null {
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 14 February 2023. Anything we can't read as a date is shown as it came. */
export function longDate(value: string): string {
  const date = parse(value);
  return date ? LONG.format(date) : value;
}

/** 1 Mar */
export function shortDate(value: string): string {
  const date = parse(value);
  return date ? SHORT.format(date) : value;
}

/** Aug */
export function monthShort(value: string): string {
  const date = parse(value);
  return date ? MONTH.format(date) : value;
}

/** Today, Yesterday, or 3 Nov. */
export function whenWords(value: string, now: Date = new Date()): string {
  const date = parse(value);
  if (!date) return value;
  const day = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
  const gap = day(now) - day(date);
  if (gap <= 0) return 'Today';
  if (gap === 1) return 'Yesterday';
  return SHORT.format(date);
}

/** Whole days from today to a YYYY-MM-DD date, in the phone's own day. */
export function daysUntil(dueOn: string, now: Date = new Date()): number {
  const due = new Date(`${dueOn}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function pointsWords(points: number): string {
  return `+${points} ${points === 1 ? 'point' : 'points'}`;
}

export const POINTS_HELD_WORDS = "Fixing this won't move your score until the other urgent issues are fixed too.";

/** Short names where the screens use one. Every other code reads from the shared country list. */
const COUNTRY_SHORT: Readonly<Record<string, string>> = { 'US-DE': 'Delaware', GB: 'UK', NG: 'Nigeria' };

export function countryShort(code: string): string {
  return COUNTRY_SHORT[code] ?? countryName(code);
}

/** 184 KB, 2.4 MB */
export function sizeWords(bytes: number | null | undefined): string | null {
  if (!bytes) return null;
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** "Kestrel Pay UK" from "Kestrel Pay UK Ltd". */
export function shortName(name: string): string {
  return name.replace(/\s+(inc\.?|ltd\.?|llc|limited|plc|corp\.?)$/i, '');
}

/** Lowers a title's first letter for use mid-sentence, leaving initials such as "IP" alone. */
export function midSentence(title: string): string {
  const second = title.charAt(1);
  return second && second === second.toUpperCase() && second !== second.toLowerCase() ? title : title.charAt(0).toLowerCase() + title.slice(1);
}

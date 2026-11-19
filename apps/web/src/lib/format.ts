import { countryName, type Coverage, type ScoreView } from '@vero/shared';

const LONG = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const SHORT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' });

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

export function monthName(value: string): string {
  const date = parse(value);
  return date ? MONTH.format(date) : value;
}

/** For the "what's new" list: Today, Yesterday, or 3 Nov. */
export function whenWords(value: string, now: Date = new Date()): string {
  const date = parse(value);
  if (!date) return value;
  const day = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
  const gap = day(now) - day(date);
  if (gap <= 0) return 'Today';
  if (gap === 1) return 'Yesterday';
  return SHORT.format(date);
}

export function isThisWeek(value: string, now: Date = new Date()): boolean {
  const date = parse(value);
  return date ? now.getTime() - date.getTime() < 7 * 86_400_000 : false;
}

/** "a minute ago" style words for when a source was last tried. */
export function agoWords(value: string | null, now: Date = new Date()): string {
  const date = value ? parse(value) : null;
  if (!date) return 'not yet';
  const minutes = Math.round((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes === 1) return 'a minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
  return `on ${shortDate(value ?? '')}`;
}

/** What a score rests on. Nothing at all rather than a made-up number when the API has none. */
export function coverageWords(coverage: Coverage | null | undefined): string | null {
  if (!coverage || coverage.total === 0) return null;
  return `Based on ${coverage.counted} of ${coverage.total} ${coverage.total === 1 ? 'check' : 'checks'}.`;
}

export const HELD_WORDS = 'Your score is held here until your urgent issues are fixed.';
export const POINTS_HELD_WORDS = "Fixing this won't move your score until the other urgent issues are fixed too.";

export function pointsWords(points: number): string {
  return `+${points} ${points === 1 ? 'point' : 'points'}`;
}

export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** Short names where the screens use one. Every other code reads from the shared country list. */
export const COUNTRY_SHORT: Readonly<Record<string, string>> = { 'US-DE': 'Delaware', GB: 'UK', NG: 'Nigeria' };

export function countryShort(code: string): string {
  return COUNTRY_SHORT[code] ?? countryName(code);
}

/** The score as a single number for the V and the ruler. A range sits at its middle. */
export function scoreLevel(score: ScoreView): number {
  if (score.kind === 'exact') return score.value;
  if (score.kind === 'approximate') return Math.round((score.low + score.high) / 2);
  return 0;
}

export function scoreWords(score: ScoreView): string {
  if (score.kind === 'exact') return `${score.value}`;
  if (score.kind === 'approximate') return `${score.low} to ${score.high}`;
  return 'not scored yet';
}

/** Two letters for the account button: from the name if we have one, otherwise the email. */
export function initials(name: string | null, email: string): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  const last = words[words.length - 1];
  if (first && last && words.length > 1) return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

/** Register codes in words. Anything we don't recognise keeps its own words, with a capital. */
const ENTITY_WORDS: Record<string, string> = {
  ltd: 'Limited company',
  plc: 'Public limited company',
  llp: 'Limited liability partnership',
  llc: 'Limited liability company',
  corporation: 'Corporation',
  c_corp: 'C corporation',
  s_corp: 'S corporation',
};

export function entityWords(value: string | null): string | null {
  if (!value) return null;
  return ENTITY_WORDS[value.toLowerCase()] ?? sentence(value);
}

export function sentence(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

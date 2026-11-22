import type { Deadline, Entitlements } from '@vero/shared';
import { shortDate } from './format';

// Ported from apps/web/src/lib/deadlines.ts and apps/web/src/lib/plan-words.ts (the deadline parts).

const DAY_MS = 86_400_000;

function asDate(dueOn: string): Date {
  return new Date(`${dueOn}T00:00:00Z`);
}

/** The date in a row. A date from another year says which, so an old one can't pass for this year's. */
export function rowDate(dueOn: string, now: Date = new Date()): string {
  return dueOn.slice(0, 4) === String(now.getUTCFullYear()) ? shortDate(dueOn) : `${shortDate(dueOn)} ${dueOn.slice(0, 4)}`;
}

const BASIS_WORDS: Readonly<Record<string, string>> = {
  fixed_date: 'The law sets this date',
  source_date: 'The date comes from the register',
  calculated: 'We worked this date out from what we know',
  cadence: 'We worked this date out from how often it falls due',
};

export function basisWords(basis: string | null): string | null {
  return basis ? (BASIS_WORDS[basis] ?? null) : null;
}

/**
 * "We check this with Companies House" is only ongoing on a plan that watches dates. Elsewhere it
 * has to say when the check happens. "We'll remind you" is true on every plan.
 */
export function trackingWords(deadline: Pick<Deadline, 'monitoring' | 'howWeTrack'>, watching: boolean): string {
  return deadline.monitoring === 'auto' && !watching ? `${deadline.howWeTrack} when you run a check` : deadline.howWeTrack;
}

/** The soonest date still to come, overdue ones aside. */
export function nextDue(deadlines: readonly Deadline[]): Deadline | null {
  return [...deadlines].filter((item) => item.state === 'due_soon' || item.state === 'upcoming').sort((a, b) => a.dueOn.localeCompare(b.dueOn))[0] ?? null;
}

/** Days from today to a date, never below zero. */
export function daysTo(dueOn: string, now: Date = new Date()): number {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.round((asDate(dueOn).getTime() - today) / DAY_MS));
}

/** Deadline watching is planned and not running yet (plan-words SCALE_EXTRAS.deadlineWatching.live). */
const WATCHING_LIVE = false;

export function isWatched(entitlements: Pick<Entitlements, 'deadlineWatching'>): boolean {
  return entitlements.deadlineWatching && WATCHING_LIVE;
}

/** The line on Deadlines. Nothing at all once the plan really does watch them. */
export function watchingNote(entitlements: Pick<Entitlements, 'deadlineWatching'>): { title: string; body: string } | null {
  if (isWatched(entitlements)) return null;
  return {
    title: 'We look at these dates when you run a check.',
    body: 'Nothing re-checks a company on a timer yet. We still remind you before each date.',
  };
}

function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** A calendar file of the real dates on screen, one all-day event each. Nothing is guessed. */
export function calendarFile(deadlines: readonly Deadline[], now: Date = new Date()): string {
  const stamp = `${now.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;
  const events = deadlines
    .filter((item) => item.state !== 'done')
    .map((item) => {
      const next = new Date(asDate(item.dueOn).getTime() + DAY_MS).toISOString().slice(0, 10);
      return [
        'BEGIN:VEVENT',
        `UID:${item.id}@vero`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${item.dueOn.replace(/-/g, '')}`,
        `DTEND;VALUE=DATE:${next.replace(/-/g, '')}`,
        `SUMMARY:${icsText(`${item.title}, ${item.companyName}`)}`,
        `DESCRIPTION:${icsText(`${item.howWeTrack}. From Vero.`)}`,
        'END:VEVENT',
      ].join('\r\n');
    });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vero//Deadlines//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR', ''].join('\r\n');
}

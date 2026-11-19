import type { Deadline } from '@vero/shared';
import { longDate, shortDate } from './format';

export interface DeadlineGroup {
  id: string;
  title: string;
  late: boolean;
  rows: Deadline[];
}

const MONTH_YEAR = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const MONTH_SHORT = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' });
const MONTH_LONG = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' });

/** How many coming months get a heading of their own. The rest go under "Later in 2027". */
const MONTHS_WITH_HEADINGS = 3;
const TIMELINE_MONTHS = 10;

function asDate(dueOn: string): Date {
  return new Date(`${dueOn}T00:00:00Z`);
}

/** Overdue first, then the next few months by name, then everything later by year. */
export function groupDeadlines(deadlines: readonly Deadline[]): DeadlineGroup[] {
  const groups: DeadlineGroup[] = [];
  const overdue = deadlines.filter((item) => item.state === 'overdue');
  if (overdue.length > 0) groups.push({ id: 'overdue', title: 'Overdue', late: true, rows: overdue });

  const coming = deadlines.filter((item) => item.state === 'due_soon' || item.state === 'upcoming');
  const months: string[] = [];
  for (const item of coming) {
    const month = item.dueOn.slice(0, 7);
    if (!months.includes(month)) months.push(month);
  }
  const named = months.slice(0, MONTHS_WITH_HEADINGS);
  for (const month of named) {
    groups.push({
      id: month,
      title: MONTH_YEAR.format(asDate(`${month}-01`)),
      late: false,
      rows: coming.filter((item) => item.dueOn.startsWith(month)),
    });
  }
  const later = coming.filter((item) => !named.includes(item.dueOn.slice(0, 7)));
  for (const year of [...new Set(later.map((item) => item.dueOn.slice(0, 4)))]) {
    groups.push({ id: `later-${year}`, title: `Later in ${year}`, late: false, rows: later.filter((item) => item.dueOn.startsWith(year)) });
  }
  return groups;
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

export interface TimelineDot {
  id: string;
  left: number;
  late: boolean;
  side: 'l' | 'r' | null;
  tip: string;
  label: string;
}

export interface Timeline {
  label: string;
  months: { key: string; word: string }[];
  dots: TimelineDot[];
}

/** Ten months from this one. Real dates only, placed by day. Later dates stay in the list below. */
export function buildTimeline(deadlines: readonly Deadline[], now: Date = new Date()): Timeline {
  const startYear = now.getUTCFullYear();
  const startMonth = now.getUTCMonth();
  const monthAt = (offset: number) => new Date(Date.UTC(startYear, startMonth + offset, 1));
  const months = Array.from({ length: TIMELINE_MONTHS }, (_, offset) => {
    const month = monthAt(offset);
    return { key: month.toISOString().slice(0, 7), word: MONTH_SHORT.format(month) };
  });
  const dots: TimelineDot[] = [];
  for (const item of deadlines) {
    if (item.state === 'done') continue;
    const date = asDate(item.dueOn);
    const offset = (date.getUTCFullYear() - startYear) * 12 + date.getUTCMonth() - startMonth;
    const late = item.state === 'overdue';
    if (!late && (offset < 0 || offset >= TIMELINE_MONTHS)) continue;
    const daysInMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    const left = late ? 0 : Math.round(((offset + (date.getUTCDate() - 1) / daysInMonth) / TIMELINE_MONTHS) * 10000) / 100;
    dots.push({
      id: item.id,
      left,
      late,
      side: left < 20 ? 'l' : left > 75 ? 'r' : null,
      tip: `${rowDate(item.dueOn, now)}${late ? ', overdue' : ''}: ${item.title}`,
      label: `${longDate(item.dueOn)}${late ? ', overdue' : ''}: ${item.title}, ${item.companyName}`,
    });
  }
  return {
    label: `Timeline, ${MONTH_LONG.format(monthAt(0))} to ${MONTH_LONG.format(monthAt(TIMELINE_MONTHS - 1))}`,
    months,
    dots,
  };
}

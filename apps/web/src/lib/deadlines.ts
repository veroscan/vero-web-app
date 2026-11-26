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

// ---- v2 board: twelve months in lanes, one lane per company ----

export type LaneTone = 'late' | 'soon' | 'ok';

export interface LaneEvent {
  key: string;
  ids: string[];
  left: number;
  tone: LaneTone;
  title: string;
  sub: string;
  /** Label above or below the line. */
  place: 'up' | 'down';
  /** Label centred on the dot, or starting at it (l), or ending at it (r), so it never leaves the track. */
  align: 'c' | 'l' | 'r';
  label: string;
}

export interface Lane {
  companyId: string;
  companyName: string;
  events: LaneEvent[];
}

export interface Lanes {
  label: string;
  months: { key: string; word: string; year: boolean }[];
  /** Where today sits on the track, in percent. */
  today: number;
  lanes: Lane[];
}

const LANE_MONTHS = 12;
const DAY_MS = 86_400_000;
const TONE_RANK: Readonly<Record<LaneTone, number>> = { late: 0, soon: 1, ok: 2 };

function toneOf(item: Pick<Deadline, 'state'>): LaneTone {
  return item.state === 'overdue' ? 'late' : item.state === 'due_soon' ? 'soon' : 'ok';
}

function laneWords(items: readonly Deadline[]): { title: string; sub: string } {
  const only = items.length === 1 ? items[0] : undefined;
  if (only) {
    const late = -only.daysUntil;
    const sub = only.state === 'overdue' ? `${late} ${late === 1 ? 'day' : 'days'} late` : `${shortDate(only.dueOn)}${only.state === 'due_soon' ? ', due soon' : ''}`;
    return { title: only.title, sub };
  }
  const sorted = [...items].sort((a, b) => a.dueOn.localeCompare(b.dueOn));
  const late = sorted.filter((item) => item.state === 'overdue').length;
  const first = sorted[0]?.dueOn ?? '';
  const last = sorted[sorted.length - 1]?.dueOn ?? '';
  const sub = late === sorted.length ? 'All overdue' : late > 0 ? `${late} overdue, ${sorted.length - late} by ${shortDate(last)}` : first === last ? shortDate(first) : `${shortDate(first)} to ${shortDate(last)}`;
  return { title: `${sorted.length} dates`, sub };
}

/**
 * Twelve months from the start of this one, a lane for each company with a date in them. Overdue
 * dates sit on today, since that's when they matter. Dates that would crowd each other are joined
 * into one dot that says how many, so no label ever covers another.
 */
export function buildLanes(deadlines: readonly Deadline[], now: Date = new Date(), trackPx = 860): Lanes {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + LANE_MONTHS, 1);
  const at = (ms: number) => Math.round(((ms - start) / (end - start)) * 10000) / 100;
  const today = at(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const months = Array.from({ length: LANE_MONTHS }, (_, offset) => {
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1));
    const year = month.getUTCMonth() === 0;
    return { key: month.toISOString().slice(0, 7), word: year ? `${MONTH_SHORT.format(month)} ${month.getUTCFullYear()}` : MONTH_SHORT.format(month), year };
  });

  const order: string[] = [];
  const byCompany = new Map<string, Deadline[]>();
  for (const item of deadlines) {
    if (item.state === 'done') continue;
    const due = asDate(item.dueOn).getTime();
    if (item.state !== 'overdue' && (due < start || due >= end)) continue;
    if (!byCompany.has(item.companyId)) {
      byCompany.set(item.companyId, []);
      order.push(item.companyId);
    }
    byCompany.get(item.companyId)?.push(item);
  }

  const layout = (items: readonly Deadline[], left: number) => {
    const { title, sub } = laneWords(items);
    const width = ((Math.max(title.length * 6.9, sub.length * 6.2) + 18) / trackPx) * 100;
    const align: LaneEvent['align'] = left - width / 2 < 0 ? 'l' : left + width / 2 > 100 ? 'r' : 'c';
    const from = align === 'l' ? left : align === 'r' ? left - width : left - width / 2;
    return { title, sub, align, from, to: from + width };
  };

  const lanes: Lane[] = order.map((companyId) => {
    const placed = (byCompany.get(companyId) ?? [])
      .map((item) => ({ item, left: item.state === 'overdue' ? today : at(asDate(item.dueOn).getTime()) }))
      .sort((a, b) => a.left - b.left || TONE_RANK[toneOf(a.item)] - TONE_RANK[toneOf(b.item)]);

    // Dots closer than a dot's width become one.
    const groups: { left: number; items: Deadline[] }[] = [];
    for (const entry of placed) {
      const last = groups[groups.length - 1];
      if (last && entry.left - last.left < 3.2) last.items.push(entry.item);
      else groups.push({ left: entry.left, items: [entry.item] });
    }

    // Each label takes the first free row; one that finds none folds into the dot before it.
    const ends = { up: -Infinity, down: -Infinity };
    const built: { left: number; items: Deadline[]; place: 'up' | 'down'; title: string; sub: string; align: LaneEvent['align'] }[] = [];
    for (const group of groups) {
      const shape = layout(group.items, group.left);
      const place = ends.up < shape.from - 0.8 ? 'up' : ends.down < shape.from - 0.8 ? 'down' : null;
      const previous = built[built.length - 1];
      if (place || !previous) {
        const row = place ?? 'up';
        ends[row] = shape.to;
        built.push({ left: group.left, items: [...group.items], place: row, title: shape.title, sub: shape.sub, align: shape.align });
        continue;
      }
      previous.items.push(...group.items);
      const again = layout(previous.items, previous.left);
      Object.assign(previous, { title: again.title, sub: again.sub, align: again.align });
      ends[previous.place] = again.to;
    }

    const events: LaneEvent[] = built.map((event) => {
      const ids = event.items.map((item) => item.id);
      return {
        key: ids.join(':'),
        ids,
        left: event.left,
        tone: event.items.map(toneOf).sort((a, b) => TONE_RANK[a] - TONE_RANK[b])[0] ?? 'ok',
        title: event.title,
        sub: event.sub,
        place: event.place,
        align: event.align,
        label: event.items.map((item) => `${longDate(item.dueOn)}${item.state === 'overdue' ? ', overdue' : ''}: ${item.title}`).join('. '),
      };
    });
    return { companyId, companyName: placed[0]?.item.companyName ?? '', events };
  });

  return {
    label: `The next twelve months, ${MONTH_LONG.format(new Date(start))} to ${MONTH_LONG.format(new Date(end - DAY_MS))}`,
    months,
    today,
    lanes,
  };
}

/** The soonest date still to come, overdue ones aside. */
export function nextDue(deadlines: readonly Deadline[]): Deadline | null {
  return [...deadlines].filter((item) => item.state === 'due_soon' || item.state === 'upcoming').sort((a, b) => a.dueOn.localeCompare(b.dueOn))[0] ?? null;
}

/** The overdue date to lead with: one the register itself shows, else the most recent. */
export function leadOverdue(deadlines: readonly Deadline[]): Deadline | null {
  const late = deadlines.filter((item) => item.state === 'overdue').sort((a, b) => b.dueOn.localeCompare(a.dueOn));
  return late.find((item) => item.monitoring === 'auto') ?? late[0] ?? null;
}

/** Days from today to a date, never below zero. */
export function daysTo(dueOn: string, now: Date = new Date()): number {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.round((asDate(dueOn).getTime() - today) / DAY_MS));
}

/** The twelve months up to a date, and how many have gone. For the bar under the countdown. */
export function monthsBefore(dueOn: string, now: Date = new Date()): { words: string[]; gone: number } {
  const due = asDate(dueOn);
  const thisMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const words: string[] = [];
  let gone = 0;
  for (let back = 11; back >= 0; back -= 1) {
    const month = new Date(Date.UTC(due.getUTCFullYear(), due.getUTCMonth() - back, 1));
    words.push(MONTH_SHORT.format(month));
    if (month.getTime() < thisMonth) gone += 1;
  }
  return { words, gone };
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

/** The days offered as reminder choices. A team can keep up to 6 (the API's limit), so a stored day outside this list is shown too. */
export const REMINDER_CHOICES: readonly number[] = [30, 14, 7, 3, 1, 0];
export const REMINDER_LIMIT = 6;
export const STANDARD_DAYS: readonly number[] = [30, 7, 1];

/** The choices to show: the usual ones, plus any day already saved that isn't among them, largest first. */
export function reminderOptions(saved: readonly number[]): number[] {
  return [...new Set([...REMINDER_CHOICES, ...saved])].sort((a, b) => b - a);
}

export function leadLabel(days: number): string {
  if (days === 0) return 'On the day';
  return days === 1 ? '1 day before' : `${days} days before`;
}

/** "30, 7 and 1 days before", "On the day", or "No reminders". */
export function leadWords(days: readonly number[]): string {
  const before = [...days].filter((day) => day > 0).sort((a, b) => b - a);
  const onTheDay = days.includes(0);
  if (before.length === 0) return onTheDay ? 'On the day' : 'No reminders';
  const head = before.length === 1 ? String(before[0]) : `${before.slice(0, -1).join(', ')} and ${before[before.length - 1]}`;
  const tail = before[before.length - 1] === 1 ? 'day' : 'days';
  return `${head} ${tail} before${onTheDay ? ', and on the day' : ''}`;
}

export function sameDays(left: readonly number[], right: readonly number[]): boolean {
  const a = [...left].sort((x, y) => y - x);
  const b = [...right].sort((x, y) => y - x);
  return a.length === b.length && a.every((day, index) => day === b[index]);
}

export function reminderSourceWords(source: 'deadline' | 'organisation' | 'standard'): string {
  if (source === 'deadline') return 'Set for this date';
  if (source === 'organisation') return "Your team's choice";
  return "Vero's standard";
}

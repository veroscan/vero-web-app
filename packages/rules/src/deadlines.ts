import { addDays, addMonths, clampedDate, daysBetween, daysInMonth, isIsoDate, parseDate, toIsoDate } from './dates.js';
import { computeDerived, type Getter } from './derived.js';
import type { FactValue } from './facts.js';
import { evaluate, truthy, UNKNOWN } from './logic.js';
import type { Pack, Recurrence, Rule } from './schema.js';

export interface DeadlineCompany {
  /** Null before incorporation. Occurrences before this date are never raised. */
  incorporated_on: string | null;
  /** Financial year end. Needed for anything counted from it. */
  year_end?: { month: number; day: number } | null;
}

export type DeadlineStatus = 'overdue' | 'due_soon' | 'upcoming';

export interface Obligation {
  rule_id: string;
  title: string;
  layer: number;
  due_on: string;
  status: DeadlineStatus;
  days_until: number;
  /** "auto" means we watch a source. "reminder" means we remind you and ask for proof. */
  monitoring: 'auto' | 'reminder';
  how_we_track: string;
  /** The date rests on a rule still waiting for lawyer review. */
  needs_review: boolean;
  /** "cadence" dates are period ends, because the map gives no exact statutory day. */
  basis: 'fixed_date' | 'source_date' | 'calculated' | 'cadence';
}

export interface UndatedObligation {
  rule_id: string;
  title: string;
  monitoring: 'auto' | 'reminder';
  how_we_track: string;
  /** What we'd need to put a date on it. */
  waiting_on: string;
}

export interface DeadlineResult { dated: Obligation[]; undated: UndatedObligation[] }

const DUE_SOON_DAYS = 30;

function howWeTrack(recurrence: Recurrence): string {
  return recurrence.monitoring.mode === 'auto'
    ? `We check this with ${recurrence.monitoring.source}`
    : "We'll remind you and ask for proof";
}

function statusFor(days: number): DeadlineStatus {
  if (days < 0) return 'overdue';
  return days <= DUE_SOON_DAYS ? 'due_soon' : 'upcoming';
}

function dateFact(get: Getter, key: string | undefined): string | null {
  if (!key) return null;
  const value = get(key);
  return isIsoDate(value) ? value.slice(0, 10) : null;
}

/**
 * For a schedule with a fixed yearly date: the occurrence still owed.
 *
 * Without proof either way we show the next date, because we can't say an
 * earlier one was missed. With a "last done" date we can: if it's older than
 * the cycle before the latest due date, that due date is overdue.
 */
function nextYearly(
  occurrence: (year: number) => string,
  asOf: string,
  doneOn: string | null,
  incorporatedOn: string | null,
): string {
  const thisYear = parseDate(asOf).year;
  // Walk forward to the first occurrence on or after today.
  let year = thisYear - 1;
  while (occurrence(year) < asOf) year += 1;
  const upcoming = occurrence(year);
  const latestPassed = occurrence(year - 1);
  const cycleBefore = occurrence(year - 2);

  // Nothing was owed before the company existed.
  const pastCounts = incorporatedOn === null || latestPassed > incorporatedOn;
  if (doneOn === null || !pastCounts) return upcoming;
  return doneOn > cycleBefore ? upcoming : latestPassed;
}

function yearEndOccurrence(company: DeadlineCompany, months: number, days = 0, dayOfMonth?: number): ((year: number) => string) | null {
  const yearEnd = company.year_end;
  if (!yearEnd) return null;
  return (year) => {
    const start = clampedDate(year, yearEnd.month, yearEnd.day);
    const startParts = parseDate(start);
    const base = addMonths(start, months);
    const parts = parseDate(base);
    // A year end on the last day of a month stays on the last day of a month:
    // 30 June + 9 months is 31 March, and 28 Feb 2027 + 12 months is 29 Feb 2028.
    const endOfMonth = startParts.day === daysInMonth(startParts.year, startParts.month);
    const landedDay = dayOfMonth ?? (endOfMonth ? daysInMonth(parts.year, parts.month) : parts.day);
    const landed = clampedDate(parts.year, parts.month, landedDay);
    return days === 0 ? landed : addDays(landed, days);
  };
}

interface DueDate { due_on: string; basis: Obligation['basis'] }

function computeDue(recurrence: Recurrence, company: DeadlineCompany, get: Getter, asOf: string): DueDate | string {
  const doneOn = dateFact(get, recurrence.done_fact);
  const incorporatedOn = company.incorporated_on;
  switch (recurrence.type) {
    case 'annual_fixed': {
      const occurrence = (year: number) => clampedDate(year, recurrence.month, recurrence.day);
      return { due_on: nextYearly(occurrence, asOf, doneOn, incorporatedOn), basis: 'fixed_date' };
    }
    case 'after_year_end': {
      const occurrence = yearEndOccurrence(company, recurrence.months, recurrence.days, recurrence.day_of_month);
      if (!occurrence) return 'your financial year end';
      return { due_on: nextYearly(occurrence, asOf, doneOn, incorporatedOn), basis: 'calculated' };
    }
    case 'after_incorporation': {
      if (!incorporatedOn) return 'your incorporation date';
      const first = addMonths(incorporatedOn, recurrence.months);
      if (first >= asOf || !recurrence.then_after_year_end_months) return { due_on: first, basis: 'calculated' };
      const occurrence = yearEndOccurrence(company, recurrence.then_after_year_end_months);
      if (!occurrence) return 'your financial year end';
      return { due_on: nextYearly(occurrence, asOf, doneOn, incorporatedOn), basis: 'calculated' };
    }
    case 'periodic': {
      const { year, month } = parseDate(asOf);
      const period = recurrence.every_months;
      // The end of the current calendar month or quarter.
      const endMonth = Math.ceil(month / period) * period;
      return { due_on: clampedDate(year, endMonth, 31), basis: 'cadence' };
    }
    case 'registry_date': {
      const due = dateFact(get, recurrence.fact);
      return due ? { due_on: due, basis: 'source_date' } : 'a date from the source';
    }
    case 'after_event': {
      const event = dateFact(get, recurrence.event_fact);
      return event ? { due_on: addDays(event, recurrence.days), basis: 'calculated' } : 'the date it happened';
    }
    case 'every_years': {
      const from = dateFact(get, recurrence.from_fact);
      if (!from) {
        if (recurrence.from_fact.startsWith('answers.')) return 'the date you last filed it';
        return recurrence.from_fact.startsWith('vault.') ? 'the date on your document' : 'the date it was registered';
      }
      let due = addMonths(from, recurrence.years * 12);
      while (due < asOf) due = addMonths(due, recurrence.years * 12);
      return { due_on: due, basis: 'calculated' };
    }
    case 'expiry': {
      const expires = dateFact(get, recurrence.fact);
      return expires ? { due_on: expires, basis: 'calculated' } : 'the expiry date on your document';
    }
  }
}

function applies(rule: Rule, get: Getter, derived: Record<string, FactValue>, asOf: string, stage: number): boolean {
  if ((rule.effective_from && asOf < rule.effective_from) || (rule.effective_to && asOf >= rule.effective_to)) return false;
  if (stage < rule.stage_from) return false;
  const value = evaluate(rule.applies_when, (key) => {
    const raw = key.startsWith('derived.') ? derived[key] : get(key);
    return raw === undefined || raw === null ? UNKNOWN : raw;
  });
  // We don't know it applies, so we don't put it in the calendar yet.
  return value !== UNKNOWN && truthy(value);
}

/**
 * Turns the recurrence on each applicable rule into dated obligations for one
 * company. Dates are never moved for weekends or holidays, because the maps
 * don't say to.
 */
export function computeDeadlines(
  packs: readonly Pack[],
  input: {
    facts: Readonly<Record<string, FactValue>>;
    company: DeadlineCompany;
    stage: number;
    as_of: Date | string;
    /** Keys or prefixes of sources that are down this scan. */
    unavailable_prefixes?: readonly string[];
  },
): DeadlineResult {
  const asOf = toIsoDate(input.as_of);
  const down = input.unavailable_prefixes ?? [];
  const get: Getter = (key) => (down.some((p) => key === p || key.startsWith(`${p}.`)) ? undefined : input.facts[key]);
  const derived = computeDerived(get, asOf);

  const dated: Obligation[] = [];
  const undated: UndatedObligation[] = [];
  for (const rule of packs.flatMap((pack) => pack.rules)) {
    const recurrence = rule.recurrence;
    if (!recurrence || !applies(rule, get, derived, asOf, input.stage)) continue;
    const due = computeDue(recurrence, input.company, get, asOf);
    if (typeof due === 'string') {
      undated.push({
        rule_id: rule.id,
        title: rule.title,
        monitoring: recurrence.monitoring.mode,
        how_we_track: howWeTrack(recurrence),
        waiting_on: due,
      });
      continue;
    }
    const days = daysBetween(asOf, due.due_on);
    dated.push({
      rule_id: rule.id,
      title: rule.title,
      layer: rule.layer,
      due_on: due.due_on,
      status: statusFor(days),
      days_until: days,
      monitoring: recurrence.monitoring.mode,
      how_we_track: howWeTrack(recurrence),
      needs_review: rule.confidence === 'needs_review',
      basis: due.basis,
    });
  }
  dated.sort((a, b) => a.due_on.localeCompare(b.due_on) || a.rule_id.localeCompare(b.rule_id));
  return { dated, undated };
}

/** Links each finding to its deadline, which feeds the priority ranking. */
export function attachDeadlines<F extends { rule_id: string; due_on?: string | null }>(findings: readonly F[], deadlines: DeadlineResult): F[] {
  const byRule = new Map(deadlines.dated.map((d) => [d.rule_id, d.due_on]));
  return findings.map((f) => ({ ...f, due_on: byRule.get(f.rule_id) ?? f.due_on ?? null }));
}

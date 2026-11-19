import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  attachDeadlines,
  clampedDate,
  computeDeadlines,
  daysBetween,
  isIsoDate,
  loadPack,
  packsFor,
  parseDate,
  type FactValue,
  type Pack,
  type Recurrence,
  type Rule,
} from '../src/index.js';

const CH = 'registry.uk.companies_house';

/** One rule with a chosen recurrence, always applicable. */
function packWith(recurrence: Recurrence, overrides: Partial<Rule> = {}): Pack {
  const base = loadPack('GB');
  const rule = { ...(base.rules[0] as Rule), id: 'GB.TEST.RULE', applies_when: true, stage_from: 1, effective_from: null, effective_to: null, recurrence, ...overrides };
  return { ...base, rules: [rule] };
}

function due(recurrence: Recurrence, asOf: string, facts: Record<string, FactValue> = {}, company: { incorporated_on: string | null; year_end?: { month: number; day: number } | null } = { incorporated_on: '2020-01-15', year_end: { month: 12, day: 31 } }) {
  const result = computeDeadlines([packWith(recurrence)], { facts, company, stage: 2, as_of: asOf });
  return result.dated[0];
}

const remind = { mode: 'reminder' } as const;
const auto = { mode: 'auto', source: 'Companies House' } as const;

describe('date helpers', () => {
  it('adds months and clamps to the end of a short month', () => {
    expect(addMonths('2026-11-30', 3)).toBe('2027-02-28');
    expect(addMonths('2027-11-30', 3)).toBe('2028-02-29');
    expect(addMonths('2026-12-31', 1)).toBe('2027-01-31');
    expect(addMonths('2026-01-31', -2)).toBe('2025-11-30');
  });

  it('adds days across a year', () => {
    expect(addDays('2026-12-20', 30)).toBe('2027-01-19');
    expect(addDays('2028-02-15', 30)).toBe('2028-03-16');
  });

  it('counts days', () => {
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    expect(daysBetween('2027-01-01', '2026-12-31')).toBe(-1);
  });

  it('checks real dates', () => {
    expect(isIsoDate('2026-02-31')).toBe(false);
    expect(isIsoDate('2028-02-29')).toBe(true);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate(20260101)).toBe(false);
    expect(() => parseDate('soon')).toThrow();
    expect(clampedDate(2027, 2, 31)).toBe('2027-02-28');
  });
});

describe('annual on a fixed date', () => {
  const march1: Recurrence = { type: 'annual_fixed', month: 3, day: 1, monitoring: remind, done_fact: 'answers.paid_on' };

  it('crosses the year boundary', () => {
    expect(due(march1, '2026-11-05')?.due_on).toBe('2027-03-01');
    expect(due(march1, '2026-12-31')?.due_on).toBe('2027-03-01');
    expect(due(march1, '2027-01-01')?.due_on).toBe('2027-03-01');
  });

  it('is due today on the day', () => {
    const today = due(march1, '2027-03-01');
    expect(today?.due_on).toBe('2027-03-01');
    expect(today?.days_until).toBe(0);
    expect(today?.status).toBe('due_soon');
  });

  it('moves on when the date has passed and we have no proof either way', () => {
    expect(due(march1, '2027-03-02')?.due_on).toBe('2028-03-01');
  });

  it('calls it overdue when your last payment was before the cycle', () => {
    const late = due(march1, '2027-03-02', { 'answers.paid_on': '2026-02-20' });
    expect(late?.due_on).toBe('2027-03-01');
    expect(late?.status).toBe('overdue');
    expect(late?.days_until).toBe(-1);
  });

  it('moves on when your last payment covers it', () => {
    expect(due(march1, '2027-03-02', { 'answers.paid_on': '2027-02-20' })?.due_on).toBe('2028-03-01');
  });

  it('never raises a date from before the company existed', () => {
    const company = { incorporated_on: '2026-12-31', year_end: null };
    expect(due(march1, '2027-01-15', {}, company)?.due_on).toBe('2027-03-01');
    expect(due(march1, '2027-03-05', { 'answers.paid_on': '2020-01-01' }, { incorporated_on: '2027-03-02' })?.due_on).toBe('2028-03-01');
  });

  it('handles 29 February', () => {
    const feb29: Recurrence = { type: 'annual_fixed', month: 2, day: 29, monitoring: remind };
    expect(due(feb29, '2026-11-05')?.due_on).toBe('2027-02-28');
    expect(due(feb29, '2027-11-05')?.due_on).toBe('2028-02-29');
  });
});

describe('counted from the year end', () => {
  it('does 15 April for a December year end, and rolls over', () => {
    const r: Recurrence = { type: 'after_year_end', months: 4, day_of_month: 15, monitoring: remind };
    // Year ending 31 Dec 2025 is due 15 Apr 2026, already gone, so 31 Dec 2026 gives 15 Apr 2027.
    expect(due(r, '2026-11-05')?.due_on).toBe('2027-04-15');
    expect(due(r, '2027-04-15')?.due_on).toBe('2027-04-15');
    expect(due(r, '2027-04-16')?.due_on).toBe('2028-04-15');
  });

  it('follows a June year end', () => {
    const r: Recurrence = { type: 'after_year_end', months: 4, day_of_month: 15, monitoring: remind };
    expect(due(r, '2026-11-05', {}, { incorporated_on: '2020-01-01', year_end: { month: 6, day: 30 } })?.due_on).toBe('2027-10-15');
  });

  it('does 9 months and a day', () => {
    const r: Recurrence = { type: 'after_year_end', months: 9, days: 1, monitoring: remind };
    expect(due(r, '2026-08-01')?.due_on).toBe('2026-10-01');
  });

  it('crosses into the next calendar year', () => {
    const r: Recurrence = { type: 'after_year_end', months: 12, monitoring: remind };
    expect(due(r, '2026-12-31')?.due_on).toBe('2026-12-31');
    expect(due(r, '2027-01-01')?.due_on).toBe('2027-12-31');
  });

  it('clamps a 28 February year end in a leap year', () => {
    const r: Recurrence = { type: 'after_year_end', months: 12, monitoring: remind };
    expect(due(r, '2027-06-01', {}, { incorporated_on: '2020-01-01', year_end: { month: 2, day: 29 } })?.due_on).toBe('2028-02-29');
  });

  it('waits when we have no year end', () => {
    const r: Recurrence = { type: 'after_year_end', months: 9, monitoring: remind };
    const result = computeDeadlines([packWith(r)], { facts: {}, company: { incorporated_on: '2020-01-01' }, stage: 2, as_of: '2026-11-05' });
    expect(result.dated).toHaveLength(0);
    expect(result.undated[0]?.waiting_on).toBe('your financial year end');
  });
});

describe('counted from incorporation', () => {
  const r: Recurrence = { type: 'after_incorporation', months: 21, then_after_year_end_months: 9, monitoring: remind };

  it('uses the first date, then the year end', () => {
    expect(due(r, '2026-11-05', {}, { incorporated_on: '2026-03-31', year_end: { month: 3, day: 31 } })?.due_on).toBe('2027-12-31');
    expect(due(r, '2028-01-05', {}, { incorporated_on: '2026-03-31', year_end: { month: 3, day: 31 } })?.due_on).toBe('2028-12-31');
  });

  it('waits when there is no date', () => {
    const result = computeDeadlines([packWith(r)], { facts: {}, company: { incorporated_on: null }, stage: 2, as_of: '2026-11-05' });
    expect(result.undated[0]?.waiting_on).toBe('your incorporation date');
  });
});

describe('cadence', () => {
  it('reminds at quarter end and crosses the year', () => {
    const q: Recurrence = { type: 'periodic', every_months: 3, monitoring: remind };
    expect(due(q, '2026-11-05')?.due_on).toBe('2026-12-31');
    expect(due(q, '2026-12-31')?.due_on).toBe('2026-12-31');
    expect(due(q, '2027-01-01')?.due_on).toBe('2027-03-31');
    expect(due(q, '2026-11-05')?.basis).toBe('cadence');
  });

  it('reminds at month end, including leap years', () => {
    const m: Recurrence = { type: 'periodic', every_months: 1, monitoring: remind };
    expect(due(m, '2027-02-10')?.due_on).toBe('2027-02-28');
    expect(due(m, '2028-02-10')?.due_on).toBe('2028-02-29');
    expect(due(m, '2026-12-15')?.due_on).toBe('2026-12-31');
  });
});

describe('dates from a source', () => {
  const r: Recurrence = { type: 'registry_date', fact: `${CH}.confirmation_next_due`, monitoring: auto };

  it('reads the date, and can be overdue', () => {
    const late = due(r, '2026-11-05', { [`${CH}.confirmation_next_due`]: '2026-10-12' });
    expect(late?.status).toBe('overdue');
    expect(late?.how_we_track).toBe('We check this with Companies House');
    expect(late?.monitoring).toBe('auto');
    expect(late?.basis).toBe('source_date');
  });

  it('has no date when the source is down', () => {
    const result = computeDeadlines([packWith(r)], {
      facts: { [`${CH}.confirmation_next_due`]: '2026-10-12' },
      company: { incorporated_on: '2020-01-01' },
      stage: 2,
      as_of: '2026-11-05',
      unavailable_prefixes: [CH],
    });
    expect(result.dated).toHaveLength(0);
    expect(result.undated[0]?.how_we_track).toBe('We check this with Companies House');
  });
});

describe('from an event, every N years, expiry', () => {
  it('counts days from an event across a year', () => {
    const r: Recurrence = { type: 'after_event', event_fact: 'answers.granted_on', days: 30, monitoring: remind };
    expect(due(r, '2026-12-25', { 'answers.granted_on': '2026-12-20' })?.due_on).toBe('2027-01-19');
    const result = computeDeadlines([packWith(r)], { facts: {}, company: { incorporated_on: null }, stage: 2, as_of: '2026-11-05' });
    expect(result.undated[0]?.waiting_on).toBe('the date it happened');
  });

  it.each([
    ['answers.last_annual_return_on', 'the date you last filed it'],
    ['vault.de_good_standing.dated', 'the date on your document'],
    ['registry.us.uspto.trademark_registered_on', 'the date it was registered'],
  ])('with no date from %s, it asks for %s', (from_fact, words) => {
    const r: Recurrence = { type: 'every_years', from_fact, years: 1, monitoring: remind };
    const result = computeDeadlines([packWith(r)], { facts: {}, company: { incorporated_on: null }, stage: 2, as_of: '2026-11-05' });
    expect(result.undated[0]?.waiting_on).toBe(words);
  });

  it('moves a 10-year renewal to the next one due', () => {
    const r: Recurrence = { type: 'every_years', from_fact: 'x.registered_on', years: 10, monitoring: auto };
    expect(due(r, '2026-11-05', { 'x.registered_on': '2020-03-10' })?.due_on).toBe('2030-03-10');
    expect(due(r, '2026-11-05', { 'x.registered_on': '2006-03-10' })?.due_on).toBe('2036-03-10');
    expect(due(r, '2030-03-10', { 'x.registered_on': '2020-03-10' })?.due_on).toBe('2030-03-10');
  });

  it('uses the expiry date on a document', () => {
    const r: Recurrence = { type: 'expiry', fact: 'vault.x.expires_on', monitoring: remind };
    expect(due(r, '2026-11-05', { 'vault.x.expires_on': '2027-01-31' })?.due_on).toBe('2027-01-31');
    expect(due(r, '2026-11-05', { 'vault.x.expires_on': '2026-01-31' })?.status).toBe('overdue');
  });
});

describe('the real packs', () => {
  const asOf = '2026-11-05';

  it('matches the Delaware calendar: reminded, not monitored', () => {
    const { dated } = computeDeadlines(packsFor('US-DE'), {
      facts: { 'company.entity_type': 'c_corp', 'answers.foreign_ownership_25_plus': true },
      company: { incorporated_on: '2023-02-01', year_end: { month: 12, day: 31 } },
      stage: 3,
      as_of: asOf,
    });
    const tax = dated.find((d) => d.rule_id === 'US-DE.CORP.FRANCHISE_TAX');
    expect(tax?.due_on).toBe('2027-03-01');
    expect(tax?.monitoring).toBe('reminder');
    expect(tax?.how_we_track).toBe("We'll remind you and ask for proof");
    const form5472 = dated.find((d) => d.rule_id === 'US.TAX.FORM_5472');
    expect(form5472?.due_on).toBe('2027-04-15');
  });

  it('gives LLCs 1 June, not 1 March', () => {
    const { dated } = computeDeadlines(packsFor('US-DE'), {
      facts: { 'company.entity_type': 'llc' },
      company: { incorporated_on: '2023-02-01' },
      stage: 2,
      as_of: asOf,
    });
    expect(dated.find((d) => d.rule_id === 'US-DE.CORP.LLC_TAX')?.due_on).toBe('2027-06-01');
    expect(dated.find((d) => d.rule_id === 'US-DE.CORP.FRANCHISE_TAX')).toBeUndefined();
  });

  it('matches the UK calendar: Companies House and ICO monitored', () => {
    const { dated } = computeDeadlines([loadPack('GB')], {
      facts: {
        'answers.processes_personal_data': true,
        [`${CH}.confirmation_next_due`]: '2026-10-12',
        [`${CH}.accounts_next_due`]: '2027-06-30',
        [`${CH}.directors_idv_next_due`]: '2026-11-18',
        'registry.uk.ico.expires_on': '2027-08-09',
      },
      company: { incorporated_on: '2023-04-12', year_end: { month: 3, day: 31 } },
      stage: 3,
      as_of: asOf,
    });
    const byId = new Map(dated.map((d) => [d.rule_id, d]));
    expect(byId.get('GB.CORP.CONFIRMATION_STATEMENT')).toMatchObject({ due_on: '2026-10-12', status: 'overdue', monitoring: 'auto' });
    expect(byId.get('GB.CORP.ACCOUNTS')).toMatchObject({ due_on: '2027-06-30', monitoring: 'auto' });
    expect(byId.get('GB.CORP.DIRECTOR_IDV')).toMatchObject({ due_on: '2026-11-18', status: 'due_soon' });
    expect(byId.get('GB.DP.ICO_FEE')).toMatchObject({ how_we_track: 'We check this with the ICO register' });
  });

  it('matches the Nigeria calendar: 31 March reminded', () => {
    const { dated } = computeDeadlines([loadPack('NG')], {
      facts: { 'registry.ng.ndpc.category': 'EHL' },
      company: { incorporated_on: '2023-01-01' },
      stage: 2,
      as_of: asOf,
    });
    expect(dated.find((d) => d.rule_id === 'NG.DP.AUDIT_RETURN')).toMatchObject({ due_on: '2027-03-31', monitoring: 'reminder' });
  });

  it('sorts by date and flags dates resting on unreviewed rules', () => {
    const { dated } = computeDeadlines([loadPack('NG')], {
      facts: { 'answers.last_annual_return_on': '2026-06-12', 'answers.has_employees': true },
      company: { incorporated_on: '2023-01-01' },
      stage: 3,
      as_of: asOf,
    });
    const sorted = [...dated].sort((a, b) => a.due_on.localeCompare(b.due_on));
    expect(dated).toEqual(sorted);
    expect(dated.find((d) => d.rule_id === 'NG.CORP.ANNUAL_RETURNS')).toMatchObject({ due_on: '2027-06-12', needs_review: true });
  });

  it('leaves out rules that do not apply, or that we do not know apply', () => {
    const none = computeDeadlines([loadPack('GB')], { facts: {}, company: { incorporated_on: '2023-01-01' }, stage: 2, as_of: asOf });
    expect(none.dated.find((d) => d.rule_id === 'GB.EMP.LIABILITY_INSURANCE')).toBeUndefined();
    expect(none.undated.find((d) => d.rule_id === 'GB.EMP.LIABILITY_INSURANCE')).toBeUndefined();
  });

  it('feeds deadlines back to findings for the priority ranking', () => {
    const out = attachDeadlines([{ rule_id: 'a', due_on: null }, { rule_id: 'b' }], {
      dated: [{ rule_id: 'a', title: 'A', layer: 1, due_on: '2027-01-01', status: 'upcoming', days_until: 10, monitoring: 'auto', how_we_track: 'x', needs_review: false, basis: 'source_date' }],
      undated: [],
    });
    expect(out[0]?.due_on).toBe('2027-01-01');
    expect(out[1]?.due_on).toBeNull();
  });
});

import type { FactValue } from '@vero/rules';
import { describe, expect, it } from 'vitest';
import { diffResults, meaningfulReasons, monitoringNotice, type BeforeSnapshot, type DiffInput, type FindingState } from '../src/modules/monitoring/changes';

/** The change rules, without a database. */

const STATUS = 'registry.uk.companies_house.status';

function finding(ruleKey: string, outcome: string, severity = 'high'): FindingState {
  return { ruleKey, outcome, severity, headline: `Headline for ${ruleKey}` };
}

function before(overrides: Partial<BeforeSnapshot> = {}): BeforeSnapshot {
  return {
    previousScanId: 'previous',
    scoreBefore: 70,
    findings: [finding('a', 'pass'), finding('b', 'gap', 'medium'), finding('c', 'pass', 'critical')],
    facts: new Map<string, FactValue>([[STATUS, 'active'], ['registry.uk.companies_house.officers', ['A PERSON (director)']]]),
    deadlines: new Set(['r1|2027-01-01']),
    sources: new Map([['uk.companies_house', 'found'], ['sanctions.lists', 'not_found']]),
    ...overrides,
  };
}

function input(overrides: Partial<DiffInput> = {}): DiffInput {
  const was = before();
  return {
    before: was,
    factsAfter: new Map(was.facts),
    findingsAfter: was.findings,
    scoreAfter: 70,
    deadlinesAfter: [{ ruleKey: 'r1', dueOn: '2027-01-01', title: 'File' }],
    sourcesAfter: new Map(was.sources),
    ...overrides,
  };
}

describe('monitoring: what counts as a change', () => {
  it('nothing changed: nothing to say', () => {
    const diff = diffResults(input());
    expect(diff.factsChanged).toEqual([]);
    expect(diff.findingsNew).toEqual([]);
    expect(diff.findingsResolved).toEqual([]);
    expect(meaningfulReasons(diff)).toEqual([]);
  });

  it('a source that could not be checked is not a change: no new issue, nothing resolved, nothing to notify', () => {
    // Companies House is down this time: its rules come out "to check", its facts aren't replaced.
    const diff = diffResults(input({
      findingsAfter: [finding('a', 'verify'), finding('b', 'verify', 'medium'), finding('c', 'verify', 'critical')],
      sourcesAfter: new Map([['uk.companies_house', 'error'], ['sanctions.lists', 'unavailable']]),
      scoreAfter: 40,
    }));
    expect(diff.findingsNew).toEqual([]);
    expect(diff.findingsResolved).toEqual([]);
    expect(diff.statusChanges).toEqual([]);
    expect(diff.sanctionsNewMatch).toBeNull();
    expect(diff.notChecked).toEqual(['sanctions.lists', 'uk.companies_house']);
    // Even a big score movement isn't a change when it comes only from checks we couldn't make.
    expect(meaningfulReasons(diff)).toEqual([]);
  });

  it('a new urgent or important issue is meaningful; a new minor one is recorded but not notified', () => {
    const high = diffResults(input({ findingsAfter: [finding('a', 'gap', 'high'), finding('b', 'gap', 'medium'), finding('c', 'pass', 'critical')] }));
    expect(high.findingsNew.map((item) => item.ruleKey)).toEqual(['a']);
    expect(meaningfulReasons(high)).toEqual(['new_urgent_finding']);

    const minor = diffResults(input({ findingsAfter: [finding('a', 'defect', 'low'), finding('b', 'gap', 'medium'), finding('c', 'pass', 'critical')] }));
    expect(minor.findingsNew).toHaveLength(1);
    expect(meaningfulReasons(minor)).toEqual([]);
  });

  it('a problem that now passes is resolved; one that is now "to check" is not', () => {
    const fixed = diffResults(input({ findingsAfter: [finding('a', 'pass'), finding('b', 'pass', 'medium'), finding('c', 'pass', 'critical')] }));
    expect(fixed.findingsResolved.map((item) => item.ruleKey)).toEqual(['b']);
    const unknown = diffResults(input({ findingsAfter: [finding('a', 'pass'), finding('b', 'verify', 'medium'), finding('c', 'pass', 'critical')] }));
    expect(unknown.findingsResolved).toEqual([]);
  });

  it('a change of company status is meaningful; a status that appears or disappears is not', () => {
    const dissolved = diffResults(input({ factsAfter: new Map<string, FactValue>([[STATUS, 'dissolved']]) }));
    expect(dissolved.statusChanges).toEqual([{ key: STATUS, who: 'Companies House', before: 'active', after: 'dissolved' }]);
    expect(meaningfulReasons(dissolved)).toContain('status_change');

    const gone = diffResults(input({ factsAfter: new Map<string, FactValue>() }));
    expect(gone.statusChanges).toEqual([]);
    expect(meaningfulReasons(gone)).toEqual([]);
  });

  it("keeps no one's name: personal facts are stored by key only", () => {
    const diff = diffResults(input({ factsAfter: new Map<string, FactValue>([[STATUS, 'active'], ['registry.uk.companies_house.officers', ['SOMEONE ELSE (director)']]]) }));
    expect(diff.factsChanged).toEqual([{ key: 'registry.uk.companies_house.officers' }]);
    expect(JSON.stringify(diff)).not.toContain('SOMEONE ELSE');
  });

  it('a new possible sanctions match is meaningful; one already known, or a list that was down, is not', () => {
    const possible = diffResults(input({ sourcesAfter: new Map([['uk.companies_house', 'found'], ['sanctions.lists', 'ambiguous']]) }));
    expect(possible.sanctionsNewMatch).toBe('possible');
    expect(meaningfulReasons(possible)).toEqual(['sanctions_match']);

    const known = diffResults(input({ before: before({ sources: new Map([['sanctions.lists', 'ambiguous']]) }), sourcesAfter: new Map([['sanctions.lists', 'ambiguous']]) }));
    expect(meaningfulReasons(known)).toEqual([]);

    const down = diffResults(input({ sourcesAfter: new Map([['uk.companies_house', 'found'], ['sanctions.lists', 'error']]) }));
    expect(down.sanctionsNewMatch).toBeNull();
    expect(meaningfulReasons(down)).toEqual([]);
  });

  it('a score drop of 5 or more with a new issue is meaningful; a smaller drop, or one with no new issue, is not', () => {
    const withIssue = (scoreAfter: number) => diffResults(input({ scoreAfter, findingsAfter: [finding('a', 'gap', 'low'), finding('b', 'gap', 'medium'), finding('c', 'pass', 'critical')] }));
    expect(meaningfulReasons(withIssue(65))).toEqual(['score_drop']);
    expect(meaningfulReasons(withIssue(66))).toEqual([]);
    expect(meaningfulReasons(diffResults(input({ scoreAfter: 50 })))).toEqual([]);
  });

  it('records new deadlines', () => {
    const diff = diffResults(input({ deadlinesAfter: [{ ruleKey: 'r1', dueOn: '2027-01-01', title: 'File' }, { ruleKey: 'r2', dueOn: '2027-03-01', title: 'Pay' }] }));
    expect(diff.deadlinesNew).toEqual([{ ruleKey: 'r2', dueOn: '2027-03-01', title: 'Pay' }]);
  });
});

describe('monitoring: what people are told', () => {
  it('says what changed and what to do, and that a source that was down is not a change', () => {
    const diff = diffResults(input({
      factsAfter: new Map<string, FactValue>([[STATUS, 'dissolved']]),
      sourcesAfter: new Map([['uk.companies_house', 'found'], ['sanctions.lists', 'error']]),
    }));
    const notice = monitoringNotice('Kestrel Pay UK Ltd', diff, meaningfulReasons(diff), true);
    expect(notice.title).toBe("Kestrel Pay UK Ltd's status has changed");
    expect(notice.body).toContain('Companies House now shows the company status as "dissolved". It was "active".');
    expect(notice.body).toContain("1 source couldn't be checked this time. That isn't counted as a change.");
    expect(notice.body).toContain('Open Kestrel Pay UK Ltd to see what changed and what to do next.');
    expect(notice.body).not.toMatch(/sanction/i);
  });

  it('a possible sanctions match is never called a confirmed one', () => {
    const diff = diffResults(input({ sourcesAfter: new Map([['uk.companies_house', 'found'], ['sanctions.lists', 'ambiguous']]) }));
    const notice = monitoringNotice('Kestrel Pay UK Ltd', diff, meaningfulReasons(diff), true);
    expect(notice.body).toContain('is close to an entry on a sanctions list. It may be another business with the same name');
  });

  it('names the new issues, and gives no exact score to a plan without one', () => {
    const diff = diffResults(input({ scoreAfter: 60, findingsAfter: [finding('a', 'gap', 'high'), finding('b', 'gap', 'medium'), finding('c', 'gap', 'critical')] }));
    const reasons = meaningfulReasons(diff);
    expect(reasons).toEqual(['new_urgent_finding', 'score_drop']);
    const exact = monitoringNotice('Heron', diff, reasons, true);
    expect(exact.title).toBe('We re-checked Heron and found changes');
    expect(exact.body).toContain('2 new urgent or important issues: Headline for a; Headline for c.');
    expect(exact.body).toContain('Your score went down from 70 to 60.');
    expect(monitoringNotice('Heron', diff, reasons, false).body).not.toContain('70');
  });
});

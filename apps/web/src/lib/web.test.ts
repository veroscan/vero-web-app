import { connectorWords, packWords, reportPackWords, WORK_KIND_WORDS, WORK_STATUSES } from './desk';
import { COMPARE_ROWS, isWatched, priceWords, SCALE_EXTRAS, watchingNote } from './plan-words';
import { areaOpenWords, badgeRows, checkedStatus, checkedWords as publicCheckedWords, earnedBadge, expiryWords, ROLE_WORDS, shareUrl, verifiedUrl } from './trust';
import type { CompanyRecordsResponse, Deadline, RecordItem, ScanSource } from '@vero/shared';
import { buildTimeline, groupDeadlines, rowDate, trackingWords } from './deadlines';
import { entitlementsOf } from './entitlements';
import { checkedWords, recordRows, sourceWords, splitStatusNote } from './records';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { QuestionnaireResponse, IssueSummary, SlotState } from '@vero/shared';
import { confirmFieldsFor, groupSlots, isInPlace, isToDo, midSentence, slotTone } from './documents';
import { describe, expect, it } from 'vitest';
import { coverageWords, entityWords, initials, scoreLevel, whenWords } from './format';
import { groupBySeverity, isOpenIssue, pointsLabel } from './issues';
import { safeNext } from './next-path';
import { sharedAnswers, startingIndex, stepsFrom, toggleMulti } from './questions';
import { bandWords, scoreSentence, sourceStatus, statusTone } from './words';

describe('an early read', () => {
  it('has its own honest sentence and no green', () => {
    expect(scoreSentence('Early read')).toBe("Good so far, but we've checked less than half of what applies.");
    expect(statusTone('Early read')).toBe('none');
  });

  it("doesn't say it sits in a band called Early read", () => {
    expect(bandWords('Early read')).toBe("the top band, but it's an early read");
    expect(bandWords('Needs work')).toBe('Needs work');
    expect(bandWords(null)).toBe('no band yet');
  });
});

const ROOT = resolve(import.meta.dirname, '..', '..', '..', '..');

describe('where sign-in may send someone', () => {
  it('keeps paths on this site', () => {
    expect(safeNext('/issues?x=1')).toBe('/issues?x=1');
  });

  it.each(['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '/a\nb', '', null, undefined])('refuses %s', (value) => {
    expect(safeNext(value)).toBeNull();
  });

  it('never goes back to a sign-in page', () => {
    expect(safeNext('/sign-in')).toBeNull();
    expect(safeNext('/sign-in/verify?token=x')).toBeNull();
  });
});

function field(id: string, type: QuestionnaireResponse['questions'][number]['fields'][number]['type'], value: QuestionnaireResponse['questions'][number]['fields'][number]['value'] = null, label = `Label for ${id}`) {
  return { id, label, help: null, type, options: type === 'multi' || type === 'single' ? [{ value: 'a', label: 'A' }] : null, value };
}

function questionnaire(questions: QuestionnaireResponse['questions']): QuestionnaireResponse {
  return { version: '1', questions, answeredFields: 0, visibleFields: 0, complete: false, rescoreQueued: false };
}

describe('question steps', () => {
  const response = questionnaire([
    { number: 1, id: 'company', title: 'About the company', whyWeAsk: 'Why', fields: [field('jurisdiction', 'single', 'a'), field('incorporated', 'boolean', true), field('entity_type_gb', 'single')] },
    { number: 2, id: 'users', title: 'Where are your users?', whyWeAsk: 'Why', fields: [field('user_countries', 'multi', null, 'Choose all that apply')] },
    { number: 3, id: 'team', title: 'Team', whyWeAsk: 'Why', fields: [field('has_employees', 'boolean', true), field('last_hire_on', 'date')] },
  ]);

  it('never asks what the company record already says', () => {
    expect(stepsFrom(response).map((step) => step.field.id)).toEqual(['entity_type_gb', 'user_countries', 'has_employees', 'last_hire_on']);
  });

  it('leaves out what a related company already has, and numbers only what is left', () => {
    const steps = stepsFrom(response, new Set(['entity_type_gb', 'user_countries']));
    expect(steps.map((step) => step.field.id)).toEqual(['has_employees', 'last_hire_on']);
    expect(steps.map((step) => `${step.questionIndex}/${step.questionTotal}`)).toEqual(['1/1', '1/1']);
  });

  it('uses the question title when the field label is not a heading', () => {
    const step = stepsFrom(response)[1];
    expect(step?.title).toBe('Where are your users?');
    expect(step?.how).toBe('Choose all that apply.');
  });

  it('counts questions, not fields', () => {
    expect(stepsFrom(response).map((step) => `${step.questionIndex}/${step.questionTotal}`)).toEqual(['1/3', '2/3', '3/3', '3/3']);
  });

  it('starts at the first unanswered screen, or the last when all are done', () => {
    expect(startingIndex(stepsFrom(response))).toBe(0);
    const done = questionnaire([{ number: 1, id: 'q', title: 'Q', whyWeAsk: 'W', fields: [field('a', 'boolean', true), field('b', 'boolean', false)] }]);
    expect(startingIndex(stepsFrom(done))).toBe(1);
  });

  it('makes "none" exclusive', () => {
    expect(toggleMulti(['a', 'b'], 'none')).toEqual(['none']);
    expect(toggleMulti(['none'], 'a')).toEqual(['a']);
    expect(toggleMulti(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('shares only answers the related company shows and has not answered', () => {
    const parent = questionnaire([{ number: 1, id: 'q', title: 'Q', whyWeAsk: 'W', fields: [field('jurisdiction', 'single', 'US-DE'), field('a', 'boolean', true), field('b', 'boolean', false), field('c', 'boolean', true)] }]);
    const related = questionnaire([{ number: 1, id: 'q', title: 'Q', whyWeAsk: 'W', fields: [field('jurisdiction', 'single', 'GB'), field('a', 'boolean'), field('b', 'boolean', true), field('d', 'boolean')] }]);
    expect(sharedAnswers(parent, related)).toEqual({ a: true });
  });
});

function issue(severity: IssueSummary['severity'], points: number | null, outcome: IssueSummary['outcome'] = 'gap'): IssueSummary {
  return { ruleKey: `GB.X.${severity.toUpperCase()}`, companyId: '00000000-0000-4000-8000-000000000000', companyName: 'Co', headline: 'H', layer: 1, layerName: 'L', area: 'A', severity, severityWord: 'W', outcome, outcomeWord: 'O', country: 'GB', countryLabel: 'United Kingdom', appliesBecause: 'incorporated', points, dueOn: null, actionType: 'upload', quickOrder: null, howWeKnow: [] };
}

describe('issues', () => {
  it('groups by the plain severity words, keeping the order and dropping empty groups', () => {
    const groups = groupBySeverity([issue('low', 1), issue('critical', 8), issue('medium', 2)]);
    expect(groups.map((group) => group.title)).toEqual(['Urgent', 'Worth doing']);
    expect(groups[1]?.issues.map((item) => item.severity)).toEqual(['low', 'medium']);
  });

  it('never shows "+0 points"', () => {
    expect(pointsLabel({ points: 0 })).toBeNull();
    expect(pointsLabel({ points: null })).toBeNull();
    expect(pointsLabel({ points: 1 })).toBe('+1 point');
    expect(pointsLabel({ points: 8 })).toBe('+8 points');
  });

  it('only gaps and defects are open', () => {
    expect(isOpenIssue(issue('high', 1, 'defect'))).toBe(true);
    expect(isOpenIssue(issue('high', 0, 'verify'))).toBe(false);
  });
});

describe('words', () => {
  it('never calls "not found" a clean result, except on a sanctions list', () => {
    expect(sourceStatus({ state: 'not_found', connectorId: 'ng.ndpc_list' })).toEqual({ word: 'Not found', tone: 'watch' });
    expect(sourceStatus({ state: 'not_found', connectorId: 'sanctions.lists' }).tone).toBe('good');
    expect(sourceStatus({ state: 'found', connectorId: 'sanctions.lists' }).tone).toBe('watch');
  });

  it('says what a score rests on, and invents nothing when it can\'t', () => {
    expect(coverageWords({ counted: 16, total: 73 })).toBe('Based on 16 of 73 checks.');
    expect(coverageWords({ counted: 1, total: 1 })).toBe('Based on 1 of 1 check.');
    expect(coverageWords(null)).toBeNull();
    expect(coverageWords({ counted: 0, total: 0 })).toBeNull();
  });

  it('shows a range at its middle on the V', () => {
    expect(scoreLevel({ kind: 'approximate', low: 58, high: 70 })).toBe(64);
    expect(scoreLevel({ kind: 'none' })).toBe(0);
  });

  it('makes initials without inventing a name', () => {
    expect(initials('Amara Okafor', 'a@b.co')).toBe('AO');
    expect(initials(null, 'pat@b.co')).toBe('PA');
  });

  it('keeps register words it does not know', () => {
    expect(entityWords('ltd')).toBe('Limited company');
    expect(entityWords('private company limited by shares')).toBe('Private company limited by shares');
    expect(entityWords(null)).toBeNull();
  });

  it('says when in plain words', () => {
    const now = new Date(2026, 10, 6, 12);
    expect(whenWords(new Date(2026, 10, 6, 1).toISOString(), now)).toBe('Today');
    expect(whenWords(new Date(2026, 10, 5, 23).toISOString(), now)).toBe('Yesterday');
  });
});

describe('documents', () => {
  const slot = (key: string, state: SlotState, layer = 1) => ({ key, label: key, reason: 'r', layer, layerName: `Layer ${layer}`, jurisdiction: 'GB', expires: false, state, stateWord: state, documentId: null, ruleKeys: [] });

  it('an empty slot is on the to-do list, and plain rather than red', () => {
    expect(isToDo('missing')).toBe(true);
    expect(slotTone('missing')).toBe('none');
    expect(isToDo('declared_missing')).toBe(true);
    expect(slotTone('declared_missing')).toBe('risk');
    expect(isInPlace('missing')).toBe(false);
    expect(isInPlace('read')).toBe(true);
    expect(slotTone('read')).toBe('good');
  });

  it('groups by area, with the most to do first', () => {
    const groups = groupSlots([slot('a', 'read', 1), slot('b', 'missing', 2), slot('c', 'missing', 2), slot('d', 'missing', 1)]);
    expect(groups.map((group) => group.layer)).toEqual([2, 1]);
    expect(groups[1]).toMatchObject({ inPlace: 1, toDo: 1 });
  });

  it('asks only for the dates the API will insist on', () => {
    expect(confirmFieldsFor({ key: 'de_good_standing', expires: true })).toEqual({ needsDocumentDate: true, needsExpiry: false, canValidate: true });
    expect(confirmFieldsFor({ key: 'x', expires: true })).toEqual({ needsDocumentDate: false, needsExpiry: true, canValidate: false });
    expect(confirmFieldsFor(undefined)).toEqual({ needsDocumentDate: false, needsExpiry: false, canValidate: false });
  });

  it('leaves initials alone when a title goes mid-sentence', () => {
    expect(midSentence("Founders' IP assignment")).toBe("founders' IP assignment");
    expect(midSentence('IP assignment from contractors')).toBe('IP assignment from contractors');
  });
});

describe('sharp stays out', () => {
  const lock = JSON.parse(readFileSync(resolve(ROOT, 'package-lock.json'), 'utf8')) as { packages: Record<string, { version?: string; resolved?: string; link?: boolean }> };

  it('the lockfile never fetches sharp or its LGPL binaries', () => {
    for (const [path, entry] of Object.entries(lock.packages)) {
      expect(path).not.toMatch(/node_modules\/@img\/sharp-/);
      if (/node_modules\/sharp$/.test(path)) expect(entry.link).toBe(true);
      expect(entry.resolved ?? '').not.toMatch(/registry\.npmjs\.org\/(sharp|@img\/sharp)/);
    }
  });

  it('whatever sits at node_modules/sharp holds no image code', () => {
    const installed = resolve(ROOT, 'node_modules', 'sharp', 'package.json');
    if (existsSync(installed)) {
      expect((JSON.parse(readFileSync(installed, 'utf8')) as { version: string }).version).toBe('0.0.0-vero-none');
    }
    expect(existsSync(resolve(ROOT, 'node_modules', '@img', 'sharp-win32-x64'))).toBe(false);
  });

  it('Next.js is told not to optimise images', () => {
    expect(readFileSync(resolve(ROOT, 'apps', 'web', 'next.config.ts'), 'utf8')).toMatch(/images:\s*\{\s*unoptimized:\s*true\s*\}/);
  });
});

describe('deadlines', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  const make = (id: string, dueOn: string, state: Deadline['state']): Deadline => ({
    id, companyId: 'c', companyName: 'Co', ruleKey: null, title: id, layer: null, dueOn, state, daysUntil: 0, monitoring: 'auto', howWeTrack: 'We check this with Companies House', basis: null, needsReview: false,
  });

  it('puts overdue first, names the next three months, then groups the rest by year', () => {
    const groups = groupDeadlines([
      make('late', '2026-10-12', 'overdue'),
      make('a', '2026-11-18', 'due_soon'),
      make('b', '2027-03-01', 'upcoming'),
      make('c', '2027-04-15', 'upcoming'),
      make('d', '2027-06-12', 'upcoming'),
      make('e', '2027-06-30', 'upcoming'),
      make('f', '2028-01-02', 'upcoming'),
      make('gone', '2026-01-01', 'done'),
    ]);
    expect(groups.map((group) => group.title)).toEqual(['Overdue', 'November 2026', 'March 2027', 'April 2027', 'Later in 2027', 'Later in 2028']);
    expect(groups.flatMap((group) => group.rows).map((row) => row.id)).not.toContain('gone');
    expect(groups[4]?.rows.map((row) => row.id)).toEqual(['d', 'e']);
  });

  it('places dots by real date, as the design does, and leaves later dates to the list', () => {
    const line = buildTimeline([make('late', '2026-10-12', 'overdue'), make('soon', '2026-11-18', 'due_soon'), make('mar', '2027-03-01', 'upcoming'), make('far', '2027-09-01', 'upcoming')], now);
    expect(line.months.map((month) => month.word)).toEqual(['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']);
    expect(line.label).toBe('Timeline, November to August');
    expect(line.dots.map((dot) => [dot.id, dot.left, dot.late])).toEqual([['late', 0, true], ['soon', 5.67, false], ['mar', 40, false]]);
  });

  it("says when a check happens unless the plan watches, and leaves reminders alone", () => {
    expect(trackingWords({ monitoring: 'auto', howWeTrack: 'We check this with Companies House' }, false)).toBe('We check this with Companies House when you run a check');
    expect(trackingWords({ monitoring: 'auto', howWeTrack: 'We check this with Companies House' }, true)).toBe('We check this with Companies House');
    expect(trackingWords({ monitoring: 'reminder', howWeTrack: "We'll remind you and ask for proof" }, false)).toBe("We'll remind you and ask for proof");
  });

  it('shows the year on a date from another year', () => {
    expect(rowDate('2026-10-12', now)).toBe('12 Oct');
    expect(rowDate('2025-10-12', now)).toBe('12 Oct 2025');
  });

  it('reads watching from the plan rules, not from the screen', () => {
    expect(entitlementsOf('scale').deadlineWatching).toBe(true);
    expect(entitlementsOf('growth').deadlineWatching).toBe(false);
    expect(entitlementsOf(undefined).vault).toBe(false);
  });
});

describe('company records', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  const item = (key: string, value: string, extra: Partial<RecordItem> = {}): RecordItem => ({
    key, label: key, value, needsYou: false, source: 'Companies House', retrievedAt: '2026-11-06T09:00:00.000Z', howWeKnow: 'Checked with Companies House today', sampleData: false, ...extra,
  });
  const records = (items: RecordItem[], sources: CompanyRecordsResponse['sources'] = []): CompanyRecordsResponse => ({
    companyId: 'c', legalName: 'Acme Ltd', country: 'GB', checkedAt: null, items, sources, statusNote: null, sampleData: false,
  });
  const source = (connectorId: string, state: ScanSource['state'], down = false): ScanSource => ({
    connectorId, sourceName: connectorId, title: connectorId, state, summary: `Summary of ${state}.`, down, lastTriedAt: '2026-11-03T09:00:00.000Z', sampleData: false,
  });

  it('never calls a "No" from a register anything but not found, and never proof', () => {
    const list = { source: 'ICO register', howWeKnow: 'Found on the ICO register list' };
    const [row] = recordRows(records([item('registry.uk.ico.listed', 'No', list)]), { now });
    expect(row?.value).toBe('Not found');
    expect(row?.tone).toBe('watch');
    expect(row?.body).toContain("That isn't proof");
    expect(row?.source).toBe('Checked the ICO register today');
    expect(recordRows(records([item('registry.uk.ico.listed', 'Yes', list)]), { now })[0]?.value).toBe('On the ICO register');
  });

  it('only links to an issue that is really open', () => {
    const list = { source: 'ICO register', howWeKnow: 'Found on the ICO register list' };
    const closed = recordRows(records([item('registry.uk.ico.listed', 'No', list)]), { now, issues: [] })[0];
    expect(closed?.links).toEqual([]);
    expect(closed?.needsYou).toBe(false);
    const open = recordRows(records([item('registry.uk.ico.listed', 'No', list)]), { now, issues: [{ ruleKey: 'GB.DP.ICO_FEE', points: 3 } as IssueSummary] })[0];
    expect(open?.needsYou).toBe(true);
    expect(open?.links[0]?.href).toBe('/issues/c/GB.DP.ICO_FEE');
    expect(open?.links[0]?.label).toContain('+3');
  });

  it('offers an upload only when the plan has one', () => {
    const list = { source: 'ICO register', howWeKnow: 'Found on the ICO register list' };
    const label = (canUpload: boolean) => recordRows(records([item('registry.uk.ico.listed', 'No', list)]), { now, canUpload })[0]?.links.map((link) => link.label);
    expect(label(true)).toEqual(['Upload your receipt']);
    expect(label(false)).toEqual([]);
  });

  it('works out overdue from the real date, and says when otherwise', () => {
    const key = 'registry.uk.companies_house.confirmation_next_due';
    const late = recordRows(records([item(key, '2026-10-12')]), { now })[0];
    expect(late?.value).toBe('Overdue since 12 October 2026');
    expect(late?.tone).toBe('risk');
    expect(late?.needsYou).toBe(true);
    expect(late?.label).toBe('Confirmation statement');
    expect(recordRows(records([item(key, '2027-10-12')]), { now })[0]?.value).toBe('Due 12 October 2027');
  });

  it('always says where a fact came from and when', () => {
    expect(sourceWords(item('k', 'v'), now)).toBe('Checked with Companies House today');
    expect(sourceWords(item('k', 'v', { source: 'our licensed data provider', howWeKnow: 'From our licensed data provider', retrievedAt: '2026-11-03T09:00:00.000Z' }), now)).toBe('From our licensed data provider. Retrieved on 3 Nov 2026');
    expect(sourceWords(item('k', 'v', { source: 'CAC, through our licensed data provider', howWeKnow: 'From our licensed data provider' }), now)).toBe('CAC, through our licensed data provider. Retrieved today');
    expect(sourceWords(item('k', 'v', { source: 'official sanctions', howWeKnow: 'Found on the official sanctions list' }), now)).toBe('Checked the official sanctions lists today');
    expect(sourceWords(item('k', 'v', { howWeKnow: 'Checked with Companies House today (sample data, not a real record)', sampleData: true }), now)).toBe('Checked with Companies House today (sample data, not a real record)');
    expect(sourceWords(item('k', 'v', { source: 'x', howWeKnow: 'From our licensed data provider (sample data, not a real record)', sampleData: true }), now)).toBe('From our licensed data provider. Retrieved today (sample data, not a real record)');
    expect(sourceWords(item('k', 'v', { source: null, retrievedAt: null, howWeKnow: 'Upload your certificate.' }), now)).toBe('Upload your certificate.');
  });

  it('gives a source with no facts a row saying what happened, and warns when facts may be old', () => {
    const rows = recordRows(records([item('registry.uk.companies_house.status', 'active')], [source('uk.companies_house', 'error', true), source('uk.ico_register', 'not_found'), source('uk.hmrc_vat', 'unavailable', true), source('web.policy_scan', 'found')]), { now });
    expect(rows.map((row) => row.key)).toEqual(['registry.uk.companies_house.status', 'source:uk.ico_register', 'source:uk.hmrc_vat']);
    expect(rows[0]?.source).toContain('may be out of date');
    expect(rows[1]?.value).toBe('Not found');
    expect(rows[1]?.source).toContain('Last tried on 3 Nov 2026');
    expect(rows[2]?.value).toBe('Not connected');
    expect(recordRows(records([], [source('sanctions.lists', 'not_found')]), { now })[0]?.value).toBe('No matches');
  });

  it('keeps a certificate to "Certified", from the API, and splits the Delaware note', () => {
    const row = recordRows(records([item('good_standing', 'Certified 12 Oct 2026', { source: 'Your Certificate of Good Standing', howWeKnow: 'You uploaded this and we read it' })]), { now })[0];
    expect(row?.value).toBe('Certified 12 Oct 2026');
    expect(row?.tone).toBe('good');
    const note = splitStatusNote("Delaware doesn't allow automatic status checks, so we go by your Certificate of Good Standing. Send a new one every year so it stays current.");
    expect(note.title).toBe("Delaware doesn't allow automatic status checks");
    expect(note.body).toBe('We go by your Certificate of Good Standing. Send a new one every year so it stays current.');
    expect(splitStatusNote('Plain note.').body).toBe('Plain note.');
  });

  it('says when nothing has been checked', () => {
    expect(checkedWords(null, now)).toBe('Not checked yet.');
    expect(checkedWords('2026-11-06T09:42:00.000Z', now)).toMatch(/^Checked today at \d\d:\d\d\.$/);
    expect(checkedWords('2026-11-02T09:42:00.000Z', now)).toMatch(/^Checked on 2 Nov 2026 at \d\d:\d\d\.$/);
  });
});

describe('plan words', () => {
  it('never shows a price the API did not send', () => {
    expect(priceWords({ code: 'free', priceMinor: null, currency: null })).toBe('Nothing to pay');
    expect(priceWords({ code: 'growth', priceMinor: null, currency: null })).toBe('Not set yet');
    expect(priceWords({ code: 'scale', priceMinor: 1000, currency: null })).toBe('Not set yet');
    expect(priceWords({ code: 'growth', priceMinor: 12_000, currency: 'GBP' })).toBe('£120.00');
  });

  it("doesn't promise what isn't running, on any plan", () => {
    expect(isWatched(entitlementsOf('scale'))).toBe(SCALE_EXTRAS.deadlineWatching.live);
    expect(isWatched(entitlementsOf('growth'))).toBe(false);
    const note = watchingNote(entitlementsOf('scale'), 'Scale');
    if (!SCALE_EXTRAS.deadlineWatching.live) {
      expect(note?.body).toContain('Nothing re-checks a company on a timer yet.');
      expect(note?.planLink).toBe(false);
    }
    for (const row of COMPARE_ROWS.filter((item) => item.key in SCALE_EXTRAS)) {
      const extra = SCALE_EXTRAS[row.key as keyof typeof SCALE_EXTRAS];
      expect(row.cell(entitlementsOf('free')).word).toBe('No');
      expect(row.cell(entitlementsOf('growth')).word).toBe('No');
      expect(row.cell(entitlementsOf('scale'))).toEqual(extra.live ? { included: true } : { word: 'Planned' });
    }
  });

  it('reads every comparison from the plan rules', () => {
    const cell = (key: string, code: 'free' | 'growth' | 'scale') => COMPARE_ROWS.find((row) => row.key === key)?.cell(entitlementsOf(code));
    expect(cell('gaps', 'free')).toEqual({ word: 'Top 3' });
    expect(cell('gaps', 'growth')).toEqual({ word: 'Every gap' });
    expect(cell('vault', 'free')).toEqual({ word: 'No' });
    expect(cell('vault', 'growth')).toEqual({ included: true });
    expect(cell('lawyer', 'free')).toBeUndefined();
    for (const row of COMPARE_ROWS) expect(`${row.label} ${row.body}`, row.key).not.toMatch(/lawyer|Code & Clause/i);
  });
});

describe('trust', () => {
  const now = new Date('2026-11-06T12:00:00Z');
  const requirements = { minScore: 80, currentScore: 72, minCoveragePercent: 50, coverage: { counted: 40, total: 100 }, openUrgent: 1, lastFullScanOn: '2026-11-03', fullScanWithinDays: 90 };

  it('gives each badge requirement its real number, or says the plan hides it', () => {
    const rows = badgeRows({ requirements }, now);
    expect(rows.map((row) => row.status)).toEqual(["You're at 72", '40 of 100 counted', '1 open', 'Last scanned 3 November 2026']);
    expect(rows.map((row) => row.tone)).toEqual(['watch', 'watch', 'risk', 'good']);
    const hidden = badgeRows({ requirements: { ...requirements, currentScore: null, coverage: null, openUrgent: null, lastFullScanOn: null } }, now);
    expect(hidden.map((row) => row.status)).toEqual(['Shown on a paid plan', 'Shown on a paid plan', 'Shown on a paid plan', 'Not yet']);
    expect(hidden.map((row) => row.tone)).toEqual(['none', 'none', 'none', 'watch']);
  });

  it('treats a scan over 90 days old, and no checks at all, as not met', () => {
    const rows = badgeRows({ requirements: { ...requirements, coverage: { counted: 0, total: 0 }, lastFullScanOn: '2026-08-07' } }, now);
    expect(badgeRows({ requirements: { ...requirements, lastFullScanOn: '2026-08-08' } }, now)[3]?.tone).toBe('good');
    expect(rows[1]?.tone).toBe('watch');
    expect(rows[3]?.tone).toBe('watch');
    expect(badgeRows({ requirements: { ...requirements, currentScore: 80, coverage: { counted: 50, total: 100 }, openUrgent: 0 } }, now).map((row) => row.tone)).toEqual(['good', 'good', 'good', 'good']);
  });

  it('only calls a badge earned when the API says it is live', () => {
    const badge = { id: 'x', issuedAt: '', expiresAt: '', scoreAtIssue: 90, active: true };
    expect(earnedBadge({ badge })).toBe(badge);
    expect(earnedBadge({ badge: { ...badge, active: false } })).toBeNull();
    expect(earnedBadge({ badge: null })).toBeNull();
  });

  it('names no lawyer anywhere a customer reads', () => {
    expect(ROLE_WORDS.lawyer).toBe('Read only');
  });

  it('says what a public area has open, as counts only', () => {
    expect(areaOpenWords({ openUrgent: 1, openImportant: 0, openWorthDoing: 1 })).toBe("1 urgent issue and 1 worth doing are open. An urgent issue keeps an area below 50 until it's fixed, however much else is in order.");
    expect(areaOpenWords({ openUrgent: 0, openImportant: 2, openWorthDoing: 0 })).toBe('2 important issues are open.');
    expect(areaOpenWords({ openUrgent: 0, openImportant: 0, openWorthDoing: 1 })).toBe('1 issue worth doing is open.');
    expect(areaOpenWords({ openUrgent: 0, openImportant: 0, openWorthDoing: 0 })).toBe('Nothing is open here.');
  });

  it('reads out dates and says when a public check did not happen', () => {
    expect(publicCheckedWords('Certificate, dated 2026-10-12. We read it.')).toBe('Certificate, dated 12 October 2026. We read it.');
    expect(checkedStatus("Not checked: the register couldn't be reached.").word).toBe('Not checked');
    expect(checkedStatus('No certificate of good standing on file.').word).toBe('Not checked');
    expect(checkedStatus('Checked with Companies House.').word).toBe('Checked');
    expect(expiryWords('2026-11-13T12:00:00Z', now)).toBe('Link expires in 7 days.');
    expect(expiryWords('2026-11-07T00:00:00Z', now)).toBe('Link expires tomorrow.');
    expect(expiryWords('2026-11-01T00:00:00Z', now)).toBe('This link has expired.');
  });

  it('builds public links with no ids of ours', () => {
    expect(shareUrl('abc/def', 'https://x.test')).toBe('https://x.test/r/abc%2Fdef');
    expect(verifiedUrl('abc', 'https://x.test')).toBe('https://x.test/verified/abc');
  });
});

describe('the desk', () => {
  it('only ever calls a pack approved when the API says so, with a name and a date', () => {
    expect(packWords({ status: 'approved', approvedBy: 'Ada', approvedAt: '2026-10-01T00:00:00Z' })).toMatchObject({ word: 'Approved', approved: true, line: 'Approved by Ada on 1 October 2026' });
    expect(packWords({ status: 'draft', approvedBy: 'Ada', approvedAt: '2026-10-01T00:00:00Z' })).toMatchObject({ word: 'Draft', approved: false });
    expect(packWords({ status: 'approved', approvedBy: null, approvedAt: null })).toMatchObject({ word: 'Draft', approved: false });
    expect(packWords({ status: 'retired', approvedBy: 'Ada', approvedAt: '2026-10-01T00:00:00Z' }).word).toBe('Retired');
    expect(reportPackWords({ jurisdiction: 'GB', version: '1.0.0', status: 'draft' })).toBe('GB 1.0.0, draft, not yet reviewed');
    expect(reportPackWords({ jurisdiction: 'GB', version: '1.0.0', status: 'approved' })).toBe('GB 1.0.0, reviewed');
  });

  it('the staff feed only carries company look-ups', () => {
    expect(Object.keys(WORK_STATUSES)).toEqual(['lookup_request']);
    expect(WORK_KIND_WORDS.lookup_request).toBe('Company look-up');
  });

  it('says what a source really did, and sample data can\'t pass for working', () => {
    const connector = { id: 'x', sourceName: 'X', jurisdictions: ['GB'], lastStatus: 'found', lastCheckedAt: '2026-10-01T00:00:00Z', lastOkAt: null, lastFailureAt: null, consecutiveFailures: 0 };
    expect(connectorWords(connector, 'live').word).toBe('Working');
    expect(connectorWords(connector, 'fixture').word).toBe('Sample data');
    expect(connectorWords({ ...connector, lastStatus: 'error', consecutiveFailures: 2 }, 'live')).toMatchObject({ word: 'Not responding', tone: 'risk' });
    expect(connectorWords({ ...connector, lastStatus: 'error', consecutiveFailures: 2 }, 'live').line).toContain('2 failures in a row');
    expect(connectorWords({ ...connector, lastStatus: null, lastCheckedAt: null }, 'live')).toMatchObject({ word: 'Not checked yet', line: 'GB. No check has run yet' });
  });
});

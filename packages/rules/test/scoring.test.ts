import { describe, expect, it } from 'vitest';
import {
  badgeEligibility,
  freePlanRange,
  overallFromLayers,
  pointsForFinding,
  priorityOf,
  rankPriorities,
  roundScore,
  scoreFindings,
  scoreLayer,
  SCORING,
  statusWord,
  type Outcome,
  type ScorableFinding,
  type Severity,
} from '../src/index.js';

function f(id: string, layer: number, outcome: Outcome, severity: Severity, more: Partial<ScorableFinding> = {}): ScorableFinding {
  return { rule_id: id, layer, outcome, severity, scored: outcome === 'pass' || outcome === 'gap' || outcome === 'defect', ...more };
}

describe('config', () => {
  it('holds the numbers from the brief', () => {
    expect(SCORING.severity_weights).toEqual({ critical: 10, high: 6, medium: 3, low: 1 });
    expect(SCORING.layer_weights).toEqual({ 1: 20, 2: 20, 3: 20, 4: 15, 5: 10, 6: 15 });
    expect(Object.values(SCORING.layer_weights).reduce((a, b) => a + b, 0)).toBe(100);
    expect(SCORING.critical_cap).toBe(49);
    expect(SCORING.badge.min_score).toBe(80);
  });
});

describe('overall score', () => {
  it("matches the design: layers 84, 49, 68, 86, 74, 79 give 72", () => {
    // 16.8 + 9.8 + 13.6 + 12.9 + 7.4 + 11.85 = 72.35
    const { overall } = overallFromLayers({ 1: 84, 2: 49, 3: 68, 4: 86, 5: 74, 6: 79 });
    expect(overall).toBe(72);
  });

  it('redistributes weight from layers with no applicable rules', () => {
    // Fundraising and AI gone. (20x80 + 20x60 + 20x40 + 15x100) / 75 = 5100 / 75 = 68
    const { overall, weights_used } = overallFromLayers({ 1: 80, 2: 60, 3: 40, 4: 100, 5: null, 6: null });
    expect(overall).toBe(68);
    expect(Object.values(weights_used).reduce((a, b) => a + b, 0)).toBeCloseTo(100);
    expect(weights_used[1]).toBeCloseTo(26.667, 2);
    expect(weights_used[4]).toBe(20);
  });

  it('gives the one layer all the weight', () => {
    expect(overallFromLayers({ 1: null, 2: null, 3: 55, 4: null, 5: null, 6: null }).overall).toBe(55);
  });

  it('has no score when nothing can be scored', () => {
    expect(overallFromLayers({ 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }).overall).toBeNull();
    const result = scoreFindings([f('a', 1, 'verify', 'high'), f('b', 2, 'not_applicable', 'low')]);
    expect(result.overall).toBeNull();
    expect(result.status).toBeNull();
  });

  it('rounds half up, and guards against float drift', () => {
    expect(overallFromLayers({ 1: 72.5, 2: 72.5, 3: 72.5, 4: 72.5, 5: 72.5, 6: 72.5 }).overall).toBe(73);
    expect(roundScore(72.4999)).toBe(72);
    expect(roundScore(74.5)).toBe(75);
    expect(roundScore(0.1 + 0.2 + 72.2)).toBe(73);
  });
});

describe('layer score', () => {
  it('is 100 x passed weight / applicable scored weight', () => {
    const layer = scoreLayer(1, [f('a', 1, 'pass', 'high'), f('b', 1, 'gap', 'medium'), f('c', 1, 'pass', 'low')]);
    // (6 + 1) / (6 + 3 + 1) = 70
    expect(layer.score).toBe(70);
  });

  it('leaves out verify and not_applicable', () => {
    const layer = scoreLayer(1, [
      f('a', 1, 'pass', 'high'), f('b', 1, 'gap', 'high'),
      f('c', 1, 'verify', 'critical'), f('d', 1, 'not_applicable', 'critical'),
    ]);
    expect(layer.score).toBe(50);
    expect(layer.open_critical).toBe(0);
  });

  it('counts a defect like a gap', () => {
    expect(scoreLayer(1, [f('a', 1, 'pass', 'low'), f('b', 1, 'defect', 'low')]).score).toBe(50);
  });

  it('has no score when no rule applies', () => {
    expect(scoreLayer(5, [f('a', 1, 'pass', 'low')]).score).toBeNull();
  });
});

describe('critical cap', () => {
  it('holds a layer at 49 when an open critical finding would leave it higher', () => {
    // Everything but the critical passes: 10 / 20 = 50, which caps to 49.
    const layer = scoreLayer(2, [f('c', 2, 'gap', 'critical'), f('h', 2, 'pass', 'high'), f('m', 2, 'pass', 'medium'), f('l', 2, 'pass', 'low')]);
    expect(layer.score).toBe(49);
    expect(layer.capped).toBe(true);
    expect(layer.open_critical).toBe(1);
  });

  it('caps however many passes surround it', () => {
    const passes = Array.from({ length: 50 }, (_, i) => f(`p${i}`, 2, 'pass', 'high'));
    expect(scoreLayer(2, [f('c', 2, 'defect', 'critical'), ...passes]).score).toBe(49);
  });

  it('leaves a lower score alone', () => {
    const layer = scoreLayer(2, [f('c', 2, 'gap', 'critical'), f('l', 2, 'gap', 'high'), f('p', 2, 'pass', 'medium')]);
    // 3 / 19 = 15.8
    expect(layer.score).toBe(16);
    expect(layer.capped).toBe(false);
  });

  it('does not cap on a critical that passes, or that is only verify', () => {
    expect(scoreLayer(2, [f('c', 2, 'pass', 'critical'), f('h', 2, 'gap', 'high')]).score).toBe(63);
    expect(scoreLayer(2, [f('c', 2, 'verify', 'critical'), f('h', 2, 'pass', 'high')]).score).toBe(100);
  });

  it('flows through to the overall score', () => {
    const result = scoreFindings([f('c', 2, 'gap', 'critical'), f('p', 2, 'pass', 'critical'), f('h', 1, 'pass', 'high'), f('h2', 1, 'pass', 'high'), f('h3', 1, 'pass', 'high')]);
    // Layer 2 is 50, capped to 49. Layer 1 is 100. They weigh the same: 74.5 rounds to 75, and
    // the urgent cap then holds it at 74, so the word can't be Healthy.
    expect(result.layers.find((l) => l.layer === 2)?.score).toBe(49);
    expect(result).toMatchObject({ overall: 74, status: 'Needs work', held_by_urgent: true, open_critical: 1 });
  });
});

describe('status words', () => {
  it.each([[100, 'Healthy'], [75, 'Healthy'], [74, 'Needs work'], [50, 'Needs work'], [49, 'At risk'], [0, 'At risk']] as const)('%i is %s', (score, word) => {
    expect(statusWord(score)).toBe(word);
  });

  it.each([
    [{ counted: 49, total: 100 }, 'Early read'],
    [{ counted: 50, total: 100 }, 'Healthy'],
    [{ counted: 0, total: 0 }, 'Healthy'],
  ] as const)('a high score waits for evidence: %o says %s', (coverage, word) => {
    expect(statusWord(90, coverage)).toBe(word);
  });

  it.each([[74, 'Needs work'], [49, 'At risk']] as const)("only Healthy waits: thin evidence doesn't soften %i", (score, word) => {
    expect(statusWord(score, { counted: 1, total: 100 })).toBe(word);
  });

  it('reaches the score itself, counting checks we could not call yet', () => {
    const passes = [1, 2, 3].map((n) => f(`p${n}`, 1, 'pass', 'high'));
    const unknown = [1, 2, 3, 4].map((n) => f(`v${n}`, 1, 'verify', 'high'));
    expect(scoreFindings([...passes, ...unknown])).toMatchObject({ overall: 100, status: 'Early read', coverage: { counted: 3, total: 7 } });
    expect(scoreFindings([...passes, ...unknown.slice(0, 3)]).status).toBe('Healthy');
  });

  it('follows the rounded number people see', () => {
    // Layer 2 passes 49 of 100, with nothing critical open. With layer 1 at 100, that's 74.5,
    // which rounds to 75, so the word has to say Healthy.
    const passed = [...[1, 2, 3, 4].map((n) => f(`c${n}`, 2, 'pass', 'critical')), f('h', 2, 'pass', 'high'), f('m', 2, 'pass', 'medium')];
    const open = [...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => f(`g${n}`, 2, 'gap', 'high')), f('g9', 2, 'gap', 'medium')];
    const result = scoreFindings([...passed, ...open, f('h1', 1, 'pass', 'high'), f('h2', 1, 'pass', 'high'), f('h3', 1, 'pass', 'high')]);
    expect(result.overall).toBe(75);
    expect(result.status).toBe('Healthy');
  });
});

describe('thin areas', () => {
  // Three important checks clear the full mark of 15.
  const solid = (layer: number) => [1, 2, 3].map((n) => f(`s${layer}.${n}`, layer, 'pass', 'high'));
  const others = [1, 2, 3, 4, 5].flatMap(solid);

  it('stops one small check carrying a whole area', () => {
    const findings = [...others, f('ai', 6, 'gap', 'medium')];
    // Area 6 earns 15 x 3/15 = 3 of its 15, against 85 for the rest: 100 x 85/88.
    expect(scoreFindings(findings).overall).toBe(97);
    expect(pointsForFinding('ai', findings)).toBe(3);
    expect(scoreFindings(findings).weights_used[6]).toBeCloseTo((100 * 3) / 88);
  });

  it('gives a stronger check more of the weight, and the full mark all of it', () => {
    const lone = (severity: Severity) => scoreFindings([...others, f('x', 6, 'gap', severity)]).overall;
    expect(lone('low')).toBeGreaterThan(lone('medium') ?? 0);
    expect(lone('medium')).toBeGreaterThan(lone('high') ?? 0);
    const full = [...others, f('a', 6, 'gap', 'high'), f('b', 6, 'gap', 'high'), f('c', 6, 'gap', 'medium')];
    expect(full.filter((item) => item.layer === 6).reduce((sum, item) => sum + SCORING.severity_weights[item.severity], 0)).toBe(SCORING.full_layer_weight_from);
    expect(scoreFindings(full).overall).toBe(85);
    expect(scoreFindings(full).weights_used[6]).toBeCloseTo(15);
  });

  it('leaves a score alone when every area is deep enough', () => {
    const findings = [...others, ...solid(6)];
    expect(scoreFindings(findings).overall).toBe(100);
    expect(scoreFindings(findings).weights_used).toEqual(Object.fromEntries(Object.entries(SCORING.layer_weights).map(([layer, weight]) => [layer, weight])));
  });

  it("doesn't invent a score: a company with one check still gets that check's score", () => {
    expect(scoreFindings([f('only', 3, 'gap', 'low')]).overall).toBe(0);
    expect(scoreFindings([f('only', 3, 'pass', 'low')]).overall).toBe(100);
  });

  it('still holds the score while something urgent is open, even in a thin area', () => {
    const result = scoreFindings([...others, f('urgent', 6, 'gap', 'critical')]);
    expect(result).toMatchObject({ overall: 74, held_by_urgent: true, open_critical: 1 });
  });
});

describe('points for a fix', () => {
  it('is calculated: fixing the one critical lifts the cap', () => {
    const findings = [f('c', 1, 'gap', 'critical'), f('h', 1, 'pass', 'high'), f('m', 1, 'pass', 'medium'), f('l', 1, 'pass', 'low')];
    expect(scoreFindings(findings).overall).toBe(49);
    expect(pointsForFinding('c', findings)).toBe(51);
  });

  it('works across layers', () => {
    // Layer 1 at 100. Layer 3 at 18/21 = 85.71. Equal weight: 92.86 rounds to 93. Fixed: 100.
    const deep = (layer: number) => [1, 2, 3].map((n) => f(`p${layer}.${n}`, layer, 'pass', 'high'));
    const findings = [...deep(1), ...deep(3), f('c', 3, 'gap', 'medium')];
    expect(pointsForFinding('c', findings)).toBe(7);
  });

  it('is zero for anything already fine, or not scored, or unknown', () => {
    const findings = [f('a', 1, 'pass', 'high'), f('b', 1, 'gap', 'low'), f('v', 1, 'verify', 'high')];
    expect(pointsForFinding('a', findings)).toBe(0);
    expect(pointsForFinding('v', findings)).toBe(0);
    expect(pointsForFinding('nope', findings)).toBe(0);
  });

  it('can be zero for a tiny fix among big ones, because it reports what people see', () => {
    const big = Array.from({ length: 60 }, (_, i) => f(`p${i}`, 1, 'pass', 'critical'));
    expect(pointsForFinding('b', [...big, f('b', 1, 'gap', 'low')])).toBe(0);
  });
});

describe('free plan range', () => {
  it('uses only public data and answers', () => {
    const findings = [
      f('pub', 1, 'pass', 'high', { free_plan_evidence: true }),
      f('pub2', 1, 'gap', 'high', { free_plan_evidence: true }),
      f('doc', 1, 'gap', 'critical', { free_plan_evidence: false }),
    ];
    // Public only: 50. Half width 7.5 gives 42.5 to 57.5, which snap to 45 and 60 (rounding .5 up).
    expect(freePlanRange(findings)).toEqual({ low: 45, high: 60, basis: 'questionnaire_and_public_data', coverage: { counted: 2, total: 3 }, held_by_urgent: false });
  });

  it('gives the example from the plan', () => {
    const findings = [
      ...Array.from({ length: 31 }, (_, i) => f(`p${i}`, 3, 'pass', 'low', { free_plan_evidence: true })),
      ...Array.from({ length: 19 }, (_, i) => f(`g${i}`, 3, 'gap', 'low', { free_plan_evidence: true })),
    ];
    // 31 of 50 is 62, shown as 55 to 70.
    expect(freePlanRange(findings)).toMatchObject({ low: 55, high: 70 });
  });

  it('stays inside 0 to 100', () => {
    expect(freePlanRange([f('a', 1, 'pass', 'low', { free_plan_evidence: true })])).toMatchObject({ high: 100 });
    expect(freePlanRange([f('a', 1, 'gap', 'low', { free_plan_evidence: true })])).toMatchObject({ low: 0 });
  });

  it('has no range without public evidence', () => {
    expect(freePlanRange([f('a', 1, 'pass', 'low', { free_plan_evidence: false })])).toBeNull();
  });
});

describe('verified badge', () => {
  const clean = [f('a', 1, 'pass', 'critical')];
  const base = { overall: 80, findings: clean, last_full_scan_on: '2026-11-01T09:00:00.000Z', as_of: '2026-11-05' };

  it('is earned at 80 with no open critical, half the checks counted and a recent full scan', () => {
    expect(badgeEligibility(base)).toEqual({ eligible: true, blockers: [] });
  });

  it('needs the score', () => {
    expect(badgeEligibility({ ...base, overall: 79 }).blockers).toEqual(['The score needs to be 80 or more.']);
    expect(badgeEligibility({ ...base, overall: null }).eligible).toBe(false);
  });

  it('needs no open critical', () => {
    expect(badgeEligibility({ ...base, findings: [f('c', 1, 'gap', 'critical')] }).blockers).toContain('Every urgent issue needs to be fixed first.');
  });

  it('needs half of what applies to have been checked, and says how far along it is', () => {
    const unknown = (n: number) => Array.from({ length: n }, (_, i) => f(`v${i}`, 1, 'verify', 'high'));
    expect(badgeEligibility({ ...base, findings: [...clean, ...unknown(1)] }).eligible).toBe(true);
    const thin = badgeEligibility({ ...base, findings: [...clean, ...unknown(2)] });
    expect(thin.eligible).toBe(false);
    expect(thin.blockers).toEqual(["At least half of the checks that apply need to count first. So far that's 1 of 3."]);
  });

  it('needs a full scan in the last 90 days: day 90 counts, day 91 does not', () => {
    expect(badgeEligibility({ ...base, last_full_scan_on: '2026-08-07' }).eligible).toBe(true);
    const old = badgeEligibility({ ...base, last_full_scan_on: '2026-08-06' });
    expect(old.blockers).toEqual(['The last full scan is more than 90 days old. Run a new one.']);
    expect(badgeEligibility({ ...base, last_full_scan_on: null }).blockers).toEqual(['Run a full scan first.']);
  });

  it('has no lawyer condition', () => {
    for (const blocker of badgeEligibility({ ...base, overall: 10, last_full_scan_on: null }).blockers) expect(blocker).not.toMatch(/lawyer/i);
  });

  it('lists every blocker', () => {
    expect(badgeEligibility({ overall: 10, findings: [f('c', 1, 'gap', 'critical')], last_full_scan_on: null, as_of: '2026-11-05' }).blockers).toHaveLength(3);
  });
});

describe('priority', () => {
  const none = { penalty: 'none', fundraising_relevant: false } as const;

  it('is severity times the cost-of-delay factor', () => {
    expect(priorityOf(f('a', 1, 'gap', 'high', { cost_of_delay: none }), '2026-11-05')).toBe(6);
    // 10 x (1 + overdue 1.0 + severe 0.5 + fundraising 0.5) = 30
    expect(priorityOf(f('a', 1, 'gap', 'critical', { due_on: '2026-10-12', cost_of_delay: { penalty: 'severe', fundraising_relevant: true } }), '2026-11-05')).toBe(30);
  });

  it('rises as a deadline gets closer', () => {
    const at = (due_on: string) => priorityOf(f('a', 1, 'gap', 'medium', { due_on, cost_of_delay: none }), '2026-11-05');
    expect(at('2028-01-01')).toBe(3);
    expect(at('2027-06-01')).toBeCloseTo(3.3);
    expect(at('2027-01-15')).toBeCloseTo(4.2);
    expect(at('2026-11-20')).toBeCloseTo(5.25);
    expect(at('2026-11-05')).toBeCloseTo(5.25);
    expect(at('2026-11-04')).toBeCloseTo(6);
  });

  it('shows the top 5 open findings, biggest first, with points', () => {
    const findings = [
      f('low', 1, 'gap', 'low'),
      f('crit', 2, 'gap', 'critical', { cost_of_delay: { penalty: 'none', fundraising_relevant: true } }),
      f('over', 1, 'defect', 'high', { due_on: '2026-10-12' }),
      f('med1', 3, 'gap', 'medium'),
      f('med2', 3, 'gap', 'medium'),
      f('med3', 3, 'gap', 'medium'),
      f('pass', 1, 'pass', 'critical'),
      f('v', 1, 'verify', 'critical'),
    ];
    const ranked = rankPriorities(findings, '2026-11-05');
    expect(ranked).toHaveLength(5);
    expect(ranked[0]?.finding.rule_id).toBe('crit');
    expect(ranked[1]?.finding.rule_id).toBe('over');
    expect(ranked.map((r) => r.finding.rule_id)).not.toContain('pass');
    expect(ranked.map((r) => r.finding.rule_id)).not.toContain('v');
    expect(ranked.map((r) => r.finding.rule_id)).not.toContain('low');
    expect(ranked[0]?.severity_word).toBe('Urgent');
    expect(ranked[0]?.points).toBeGreaterThan(0);
  });
});

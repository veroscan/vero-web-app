import { daysBetween, toIsoDate } from '../dates.js';
import type { Outcome, Severity } from '../schema.js';
import { LAYER_NAMES, SCORING, SEVERITY_WORDS } from './config.js';

/** The parts of a finding that scoring reads. */
export interface ScorableFinding {
  rule_id: string;
  layer: number;
  outcome: Outcome;
  severity: Severity;
  /** False when the finding is verify or not_applicable, or a rule still needs lawyer review. */
  scored: boolean;
  cost_of_delay?: { penalty: 'none' | 'moderate' | 'severe'; fundraising_relevant: boolean };
  /** Earliest deadline tied to this finding, if there is one. */
  due_on?: string | null;
  /** True when the evidence is public data or an answer, which a free scan can use. */
  free_plan_evidence?: boolean;
}

export type StatusWord = 'Healthy' | 'Early read' | 'Needs work' | 'At risk';

/** What a score rests on: "Based on 16 of 118 checks". */
export interface Coverage {
  /** Findings that really counted: pass, gap or defect. */
  counted: number;
  /** Those, plus the checks we couldn't call yet. Rules that don't apply aren't included. */
  total: number;
}

export function coverageOf(findings: readonly ScorableFinding[]): Coverage {
  const counted = findings.filter((f) => f.scored && (f.outcome === 'pass' || f.outcome === 'gap' || f.outcome === 'defect')).length;
  return { counted, total: counted + findings.filter((f) => f.outcome === 'verify').length };
}

export interface LayerScore {
  layer: number;
  name: string;
  /** Null when no scored rule applies to this layer. */
  score: number | null;
  /** Unrounded, used for the overall score. */
  raw: number | null;
  capped: boolean;
  open_critical: number;
  coverage: Coverage;
  /** Severity weight of the checks that counted here. Below the full mark, the layer's weight shrinks. */
  scored_weight: number;
}

export interface ScoreResult {
  overall: number | null;
  status: StatusWord | null;
  layers: LayerScore[];
  method_version: string;
  /** Layer weights after redistribution, summing to 100. */
  weights_used: Record<number, number>;
  coverage: Coverage;
  /** Scored critical findings still open, in any layer. */
  open_critical: number;
  /** True when the overall cap is what's holding the score down. */
  held_by_urgent: boolean;
}

/** Guards against 72.49999999 style drift before rounding to a whole number. */
export function roundScore(value: number): number {
  return Math.round(Number(value.toFixed(9)));
}

function isOpen(finding: ScorableFinding): boolean {
  return finding.outcome === 'gap' || finding.outcome === 'defect';
}

/**
 * Layer score = 100 x passed weight / applicable scored weight. Verify and
 * not_applicable don't count. An open critical finding caps the layer at 49.
 */
export function scoreLayer(layer: number, findings: readonly ScorableFinding[]): LayerScore {
  const inLayer = findings.filter((f) => f.layer === layer && f.scored && f.outcome !== 'verify' && f.outcome !== 'not_applicable');
  const name = LAYER_NAMES[layer] ?? `Layer ${layer}`;
  const total = inLayer.reduce((sum, f) => sum + SCORING.severity_weights[f.severity], 0);
  const coverage = coverageOf(findings.filter((f) => f.layer === layer));
  if (total === 0) return { layer, name, score: null, raw: null, capped: false, open_critical: 0, coverage, scored_weight: 0 };

  const passed = inLayer.filter((f) => f.outcome === 'pass').reduce((sum, f) => sum + SCORING.severity_weights[f.severity], 0);
  const openCritical = inLayer.filter((f) => isOpen(f) && f.severity === 'critical').length;
  const uncapped = (100 * passed) / total;
  const capped = openCritical > 0 && uncapped > SCORING.critical_cap;
  const raw = capped ? SCORING.critical_cap : uncapped;
  return { layer, name, score: roundScore(raw), raw, capped, open_critical: openCritical, coverage, scored_weight: total };
}

/**
 * Weighted mean of layer scores. A layer with no score hands its weight to the others in proportion,
 * and so does a thin one, for the part of its weight it hasn't earned. Without `scoredWeights`, every
 * layer counts in full.
 */
export function overallFromLayers(
  layerScores: Record<number, number | null>,
  scoredWeights?: Record<number, number>,
): { overall: number | null; weights_used: Record<number, number> } {
  const present = Object.keys(SCORING.layer_weights).map(Number).filter((layer) => {
    const score = layerScores[layer];
    return score !== null && score !== undefined;
  });
  const earned = (layer: number) => {
    const full = SCORING.layer_weights[layer] ?? 0;
    return scoredWeights ? full * Math.min(1, (scoredWeights[layer] ?? 0) / SCORING.full_layer_weight_from) : full;
  };
  const totalWeight = present.reduce((sum, layer) => sum + earned(layer), 0);
  if (totalWeight === 0) return { overall: null, weights_used: {} };

  const weights: Record<number, number> = {};
  let weighted = 0;
  for (const layer of present) {
    const share = earned(layer) / totalWeight;
    weights[layer] = share * 100;
    weighted += share * (layerScores[layer] as number);
  }
  return { overall: roundScore(weighted), weights_used: weights };
}

/** With `coverage`, a score can't say Healthy until enough of the checks have counted. */
export function statusWord(score: number, coverage?: Coverage): StatusWord {
  if (score >= SCORING.status.healthy_from) {
    const thin = coverage !== undefined && coverage.counted < coverage.total * SCORING.status.healthy_needs_coverage;
    return thin ? 'Early read' : 'Healthy';
  }
  if (score >= SCORING.status.needs_work_from) return 'Needs work';
  return 'At risk';
}

export function scoreFindings(findings: readonly ScorableFinding[]): ScoreResult {
  const layers = Object.keys(SCORING.layer_weights).map((layer) => scoreLayer(Number(layer), findings));
  const raw: Record<number, number | null> = {};
  const scoredWeights: Record<number, number> = {};
  for (const layer of layers) {
    raw[layer.layer] = layer.raw;
    scoredWeights[layer.layer] = layer.scored_weight;
  }
  const { overall: uncapped, weights_used } = overallFromLayers(raw, scoredWeights);
  // Every path to an overall score comes through here, so points, projections and groups agree.
  const openCritical = layers.reduce((sum, layer) => sum + layer.open_critical, 0);
  const overall = uncapped !== null && openCritical > 0 ? Math.min(uncapped, SCORING.overall_critical_cap) : uncapped;
  const coverage = coverageOf(findings);
  return {
    overall,
    status: overall === null ? null : statusWord(overall, coverage),
    layers,
    method_version: SCORING.method_version,
    weights_used,
    coverage,
    open_critical: openCritical,
    held_by_urgent: openCritical > 0 && uncapped !== null && uncapped > SCORING.overall_critical_cap,
  };
}

/**
 * "Points" for a fix: how much the overall score rises if this finding alone
 * passed. Always calculated. Compares the whole numbers people see, so the
 * badge agrees with the score on screen. Zero when the finding is already fine.
 */
export function pointsForFinding(ruleId: string, findings: readonly ScorableFinding[]): number {
  const target = findings.find((f) => f.rule_id === ruleId);
  if (!target || !isOpen(target) || !target.scored) return 0;
  const before = scoreFindings(findings).overall;
  const after = scoreFindings(
    findings.map((f) => (f.rule_id === ruleId ? { ...f, outcome: 'pass' as const } : f)),
  ).overall;
  if (before === null || after === null) return 0;
  return Math.max(0, after - before);
}

export interface ScoreRange {
  low: number;
  high: number;
  basis: 'questionnaire_and_public_data';
  /** What the range actually used, out of every check that applies. A thin read must look thin. */
  coverage: Coverage;
  /** True when the urgent cap cut the top of the range. */
  held_by_urgent: boolean;
}

/** The free plan's approximate score: public data and answers only, shown as a range. */
export function freePlanRange(findings: readonly ScorableFinding[]): ScoreRange | null {
  const { overall, open_critical: openCritical, coverage: used } = scoreFindings(findings.filter((f) => f.free_plan_evidence === true));
  if (overall === null) return null;
  const { half_width: half, round_to: step } = SCORING.free_plan;
  const snap = (value: number) => Math.round(value / step) * step;
  const top = Math.min(100, snap(overall + half));
  // A range can read "65 to 74": its top respects the urgent cap too.
  const high = openCritical > 0 ? Math.min(top, SCORING.overall_critical_cap) : top;
  return {
    low: Math.min(Math.max(0, snap(overall - half)), high),
    high,
    basis: 'questionnaire_and_public_data',
    coverage: { counted: used.counted, total: coverageOf(findings).total },
    held_by_urgent: high < top,
  };
}

export interface BadgeCheck {
  eligible: boolean;
  /** What's stopping it, in plain words. Empty when eligible. */
  blockers: string[];
}

/**
 * The verified badge (owner's decision, 19 Nov 2026): a score of at least 80, no open urgent
 * issue, at least half the applicable checks counted, and a full scan in the last 90 days. No
 * lawyer condition. A scan exactly 90 days old still counts; one 91 days old doesn't.
 */
export function badgeEligibility(input: {
  overall: number | null;
  findings: readonly ScorableFinding[];
  /** When the newest finished full scan ran (date or timestamp), or null if none has. */
  last_full_scan_on: string | null;
  as_of: Date | string;
}): BadgeCheck {
  const blockers: string[] = [];
  const { min_score: minScore, min_coverage: minCoverage, full_scan_valid_days: scanDays } = SCORING.badge;
  if (input.overall === null || input.overall < minScore) {
    blockers.push(`The score needs to be ${minScore} or more.`);
  }
  const { counted, total } = coverageOf(input.findings);
  if (counted < total * minCoverage) {
    blockers.push(`At least half of the checks that apply need to count first. So far that's ${counted} of ${total}.`);
  }
  if (input.findings.some((f) => f.scored && isOpen(f) && f.severity === 'critical')) {
    blockers.push('Every urgent issue needs to be fixed first.');
  }
  const today = toIsoDate(input.as_of);
  const scanned = input.last_full_scan_on;
  if (scanned === null) {
    blockers.push('Run a full scan first.');
  } else if (daysBetween(scanned.slice(0, 10), today) > scanDays) {
    blockers.push(`The last full scan is more than ${scanDays} days old. Run a new one.`);
  }
  return { eligible: blockers.length === 0, blockers };
}

/** Severity weight times the cost-of-delay factor. */
export function priorityOf(finding: ScorableFinding, asOf: Date | string): number {
  const today = toIsoDate(asOf);
  const config = SCORING.cost_of_delay;
  let factor = 1;
  if (finding.due_on) {
    const days = daysBetween(today, finding.due_on.slice(0, 10));
    const band = days < 0
      ? config.deadline.find((d) => d.overdue)
      : config.deadline.find((d) => !d.overdue && days <= d.within_days);
    factor += band?.factor ?? 0;
  }
  if (finding.cost_of_delay) {
    factor += config.penalty[finding.cost_of_delay.penalty];
    if (finding.cost_of_delay.fundraising_relevant) factor += config.fundraising_relevant;
  }
  return SCORING.severity_weights[finding.severity] * factor;
}

export interface RankedAction<F extends ScorableFinding> {
  finding: F;
  priority: number;
  points: number;
  severity_word: string;
}

/** Open findings, biggest first. Ties go to whichever fix moves the score most, then to rule id. */
export function rankPriorities<F extends ScorableFinding>(findings: readonly F[], asOf: Date | string, limit: number = SCORING.top_actions): RankedAction<F>[] {
  return findings
    .filter((f) => isOpen(f) && f.scored)
    .map((finding) => ({
      finding,
      priority: priorityOf(finding, asOf),
      points: pointsForFinding(finding.rule_id, findings),
      severity_word: SEVERITY_WORDS[finding.severity],
    }))
    .sort((a, b) => b.priority - a.priority || b.points - a.points || a.finding.rule_id.localeCompare(b.finding.rule_id))
    .slice(0, limit);
}

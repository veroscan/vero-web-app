import type { Severity } from '../schema.js';

/**
 * Every scoring number lives here. These are proposals pending Client approval
 * (plan 11.5, build brief). Change a number here and nowhere else. Bump
 * `method_version` when you do, because every snapshot records it.
 */
export const SCORING = {
  method_version: '2026.11-draft.7',

  severity_weights: { critical: 10, high: 6, medium: 3, low: 1 } satisfies Record<Severity, number>,

  /** Layer weights as percentages, in layer order 1 to 6. They add up to 100. */
  layer_weights: { 1: 20, 2: 20, 3: 20, 4: 15, 5: 10, 6: 15 } as Record<number, number>,

  /**
   * A layer earns its full weight once its scored checks add up to this, in severity weights. Below
   * it the weight shrinks in proportion, so one small check can't carry a whole layer. A lone medium
   * check counts for a fifth of its layer's weight.
   */
  full_layer_weight_from: 15,

  /** An open critical finding holds its layer at this score or below. */
  critical_cap: 49,

  /**
   * While any scored critical finding is open, the overall score can't go above this, so the
   * word can't be Healthy. It must stay below status.healthy_from.
   */
  overall_critical_cap: 74,

  /**
   * `healthy_needs_coverage`: the share of applicable checks that must count before a score can
   * say Healthy. Below it, the word is "Early read". The other words don't wait: a gap is a gap.
   */
  status: { healthy_from: 75, needs_work_from: 50, healthy_needs_coverage: 0.5 },

  free_plan: {
    /** A score of 62 shows as "55 to 70". */
    half_width: 7.5,
    round_to: 5,
  },

  badge: {
    min_score: 80,
    /** The share of applicable checks that must count first. A public claim needs at least what "Healthy" needs. */
    min_coverage: 0.5,
    /**
     * The newest full scan must be at most this many days old (owner's decision, 19 Nov 2026).
     * There is no lawyer condition: the badge says only what Vero checked.
     */
    full_scan_valid_days: 90,
  },

  /** A finding's priority is its severity weight times (1 + the sum of these). */
  cost_of_delay: {
    deadline: [
      { overdue: true, within_days: 0, factor: 1.0 },
      { overdue: false, within_days: 30, factor: 0.75 },
      { overdue: false, within_days: 90, factor: 0.4 },
      { overdue: false, within_days: 365, factor: 0.1 },
    ],
    penalty: { none: 0, moderate: 0.25, severe: 0.5 },
    fundraising_relevant: 0.5,
  },

  top_actions: 5,
} as const;

export const LAYER_NAMES: Record<number, string> = {
  1: 'Company foundations',
  2: 'Intellectual property',
  3: 'Compliance',
  4: 'Contracts',
  5: 'Fundraising',
  6: 'AI and data',
};

export const SEVERITY_WORDS: Record<Severity, string> = {
  critical: 'Urgent',
  high: 'Important',
  medium: 'Worth doing',
  low: 'Worth doing',
};

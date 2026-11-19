import { z } from 'zod';
import { uuidSchema } from './common';

export const PLAN_CODES = ['free', 'growth', 'scale'] as const;
export type PlanCode = (typeof PLAN_CODES)[number];
export const planCodeSchema = z.enum(PLAN_CODES, { error: 'That plan does not exist.' });

export interface Entitlements {
  /** Free sees an approximate score, shown as a range. */
  exactScore: boolean;
  /** How many gaps can be read. Null means every gap. */
  gapLimit: number | null;
  /** The document vault: uploading, and everything built on it. */
  vault: boolean;
  /** Per-area scores and the whole six-area report. */
  fullReport: boolean;
  /** The ranked list, points per fix and "what if I fix these". */
  priorityList: boolean;
  rulesChangeAlerts: boolean;
  deadlineWatching: boolean;
  annualVerification: boolean;
  /** The public share link and the verified badge. */
  publicSharing: boolean;
  /**
   * How many companies the organisation can follow (watchlist), on top of its own. Proposed
   * numbers (19 Nov 2026), pending the Client's decision: Free 3, Growth 25, Scale 100.
   */
  followLimit: number;
}

/**
 * The one place plan rules live. From the Client's product document: Free is a public data
 * scan plus the questionnaire, with an approximate score, the top three gaps and no upload.
 * Growth adds the vault, the full report and the priority list. Scale adds monitoring,
 * rule-change alerts and yearly verification. There is no lawyer review (removed, 19 Nov 2026).
 *
 * Prices are not here on purpose: they come from Stripe (STRIPE_PRICE_*), never from code.
 */
export const PLAN_ENTITLEMENTS: Record<PlanCode, Entitlements> = {
  free: {
    exactScore: false,
    gapLimit: 3,
    vault: false,
    fullReport: false,
    priorityList: false,
    rulesChangeAlerts: false,
    deadlineWatching: false,
    annualVerification: false,
    publicSharing: false,
    followLimit: 3,
  },
  growth: {
    exactScore: true,
    gapLimit: null,
    vault: true,
    fullReport: true,
    priorityList: true,
    rulesChangeAlerts: false,
    deadlineWatching: false,
    annualVerification: false,
    publicSharing: true,
    followLimit: 25,
  },
  scale: {
    exactScore: true,
    gapLimit: null,
    vault: true,
    fullReport: true,
    priorityList: true,
    rulesChangeAlerts: true,
    deadlineWatching: true,
    annualVerification: true,
    publicSharing: true,
    followLimit: 100,
  },
};

export const PLAN_NAMES: Record<PlanCode, string> = { free: 'Free', growth: 'Growth', scale: 'Scale' };

export const entitlementsSchema = z.object({
  exactScore: z.boolean(),
  gapLimit: z.number().int().nullable(),
  vault: z.boolean(),
  fullReport: z.boolean(),
  priorityList: z.boolean(),
  rulesChangeAlerts: z.boolean(),
  deadlineWatching: z.boolean(),
  annualVerification: z.boolean(),
  publicSharing: z.boolean(),
  followLimit: z.number().int(),
});

export const planSchema = z.object({
  code: planCodeSchema,
  name: z.string(),
  /** Always null until the Client sets a price and a billing provider exists. */
  priceMinor: z.number().int().nullable(),
  currency: z.string().nullable(),
  entitlements: entitlementsSchema,
});
export type Plan = z.infer<typeof planSchema>;

export const planListResponseSchema = z.object({
  current: planCodeSchema,
  plans: z.array(planSchema),
});
export type PlanListResponse = z.infer<typeof planListResponseSchema>;

export const setPlanParamsSchema = z.object({ organisationId: uuidSchema });
export const setPlanBodySchema = z.object({ plan: planCodeSchema });
export const setPlanResponseSchema = z.object({ organisationId: uuidSchema, plan: planCodeSchema });

// ---- Billing (Stripe). Off until the keys are set; then the plan follows Stripe. ----

export const PAID_PLAN_CODES = ['growth', 'scale'] as const;
export const checkoutBodySchema = z.object({
  plan: z.enum(PAID_PLAN_CODES, { error: 'Choose Growth or Scale.' }),
});
export type CheckoutBody = z.infer<typeof checkoutBodySchema>;
/** Stripe's own hosted page. The plan changes only when Stripe tells us the payment went through. */
export const billingRedirectResponseSchema = z.object({ url: z.url() });
export type BillingRedirectResponse = z.infer<typeof billingRedirectResponseSchema>;

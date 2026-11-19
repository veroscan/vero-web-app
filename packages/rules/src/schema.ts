import { z } from 'zod';
import { isIsoDate } from './dates.js';
import { logicProblems, type Logic } from './logic.js';

const logic = z.custom<Logic>((value) => logicProblems(value).length === 0, {
  error: (issue) => `Invalid JSONLogic: ${logicProblems(issue.input).join('; ')}`,
});
const isoDate = z.string().refine(isIsoDate, 'Must be a real YYYY-MM-DD date');
const plainText = z.string().trim().min(8, 'Too short to help anyone');

/**
 * What a pack, rule or slot belongs to: "INTL" for the International pack, or a country code
 * such as "GB", "US" or "US-DE". Any country can be scored: packsFor decides which packs apply.
 * The packs that exist are listed by JURISDICTIONS (packs/index.ts).
 */
export const JURISDICTION_PATTERN = /^(INTL|[A-Z]{2}(-[A-Z0-9]{1,3})?)$/;
export const JurisdictionSchema = z.string().regex(JURISDICTION_PATTERN, 'A pack belongs to INTL or a country code such as GB or US-DE');
export type Jurisdiction = string;

export const SeveritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export type Severity = z.infer<typeof SeveritySchema>;

export const OutcomeSchema = z.enum(['pass', 'gap', 'defect', 'verify', 'not_applicable']);
export type Outcome = z.infer<typeof OutcomeSchema>;

export const REMEDIATION_ACTIONS = [
  'upload', 'attest', 'file', 'register', 'renew', 'pay', 'draft', 'review', 'fix_website', 'screen', 'answer',
] as const;

const monitoring = z.strictObject({
  mode: z.enum(['auto', 'reminder']),
  /** Plain name for the screen: "We check this with {source}". Required when mode is auto. */
  source: z.string().min(2).optional(),
}).refine((m) => m.mode !== 'auto' || m.source !== undefined, 'Automatic monitoring must name its source');

const scheduleFields = {
  monitoring,
  /** A date fact holding when this was last done, used to tell "done" from "overdue". */
  done_fact: z.string().optional(),
};

export const RecurrenceSchema = z.discriminatedUnion('type', [
  /** Same date every year: 1 March. */
  z.strictObject({ type: z.literal('annual_fixed'), month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(31), ...scheduleFields }),
  /** Counted from the financial year end: 9 months after, or the 15th of the 4th month after. */
  z.strictObject({
    type: z.literal('after_year_end'),
    months: z.number().int().min(0).max(36),
    /** Extra days after the month count (9 months + 1 day). */
    days: z.number().int().min(0).max(31).optional(),
    /** Use this day of the landing month instead of the year-end's day. */
    day_of_month: z.number().int().min(1).max(31).optional(),
    ...scheduleFields,
  }),
  /** Counted once from incorporation; later periods can count from the year end. */
  z.strictObject({
    type: z.literal('after_incorporation'),
    months: z.number().int().min(1).max(120),
    then_after_year_end_months: z.number().int().min(1).max(36).optional(),
    ...scheduleFields,
  }),
  /** Monthly or quarterly returns. The map gives the cadence but no exact day, so we remind at period end. */
  z.strictObject({ type: z.literal('periodic'), every_months: z.union([z.literal(1), z.literal(3)]), ...scheduleFields }),
  /** A due date a source gives us: Companies House next_due. */
  z.strictObject({ type: z.literal('registry_date'), fact: z.string().min(3), ...scheduleFields }),
  /** A fixed number of days after something happens: new hire, stock grant, agreement. */
  z.strictObject({ type: z.literal('after_event'), event_fact: z.string().min(3), days: z.number().int().min(1).max(730), ...scheduleFields }),
  /** Every N years from a date: trade mark renewal. */
  z.strictObject({ type: z.literal('every_years'), from_fact: z.string().min(3), years: z.number().int().min(1).max(20), ...scheduleFields }),
  /** Runs out on a date we read from an upload: insurance, a certificate. */
  z.strictObject({ type: z.literal('expiry'), fact: z.string().min(3), ...scheduleFields }),
]);
export type Recurrence = z.infer<typeof RecurrenceSchema>;

export const RuleSourceSchema = z.strictObject({
  /** Path from the repo root of the map this rule is encoded from. */
  doc: z.string().regex(/^docs\/knowledge\/.+\.md$/),
  /** The section heading it sits under. */
  section: z.string().min(3),
  /** Text that appears on the map line. A test proves the line exists. */
  line: z.string().min(3),
});
export type RuleSource = z.infer<typeof RuleSourceSchema>;

export const PlainTextSchema = z.strictObject({
  /** The problem in one line. May contain {company}. */
  headline: plainText,
  missing: plainText,
  why: plainText,
  if_left: plainText,
  fix: plainText,
});
export type PlainText = z.infer<typeof PlainTextSchema>;

export const RuleSchema = z.strictObject({
  id: z.string().regex(/^(INTL|[A-Z]{2}(-[A-Z0-9]{1,3})?)(\.[A-Z0-9_]+)+$/, 'Rule ids look like GB.CORP.CONFIRMATION_STATEMENT'),
  jurisdiction: JurisdictionSchema,
  layer: z.number().int().min(1).max(6),
  area: z.string().min(2),
  title: z.string().min(3),
  instruments: z.array(z.strictObject({ law: z.string().min(2), cite: z.string().optional() })),
  regulator: z.string().min(2).nullable(),
  /** S1 pre-incorporation to S5 post-raise. */
  stage_from: z.number().int().min(1).max(5),
  applies_when: logic,
  satisfied_when: logic,
  /** Optional: something exists but is wrong (overdue, dissolved). Checked after satisfied_when. */
  defect_when: logic.optional(),
  /** Optional: we only have a proxy and shouldn't call this either way. */
  verify_when: logic.optional(),
  recurrence: RecurrenceSchema.nullable(),
  evidence: z.array(z.string().min(2)).min(1),
  severity: SeveritySchema,
  /** How we verify it: 1 official live, 2 licensed vendor, 3 official list, 4 document, 5 attested. */
  tier: z.number().int().min(1).max(5),
  confidence: z.enum(['verified', 'needs_review']),
  text: PlainTextSchema,
  remediation: z.strictObject({
    action_type: z.enum(REMEDIATION_ACTIONS),
    quick_order: z.string().optional(),
  }),
  /** Inputs to the priority ranking. */
  cost_of_delay: z.strictObject({
    penalty: z.enum(['none', 'moderate', 'severe']),
    fundraising_relevant: z.boolean(),
  }),
  /**
   * Does this follow a company into a country where it isn't incorporated? Left out, layers 3
   * and 6 do and the rest don't. "employees_here" means only where it employs people.
   */
  market_overlay: z.enum(['market', 'employees_here', 'never']).optional(),
  /** Set when other packs ask for the same thing. Only the first one evaluated counts. */
  shared_obligation: z.string().min(2).optional(),
  /** Questions that answer this directly: yes is "You told us", no is a real gap on any plan. */
  answered_by: z.array(z.strictObject({ fact: z.string().regex(/^answers\.[a-z0-9_]+$/), when: logic.optional() })).min(1).optional(),
  /** Numbers kept with the rule for the lawyer to confirm. Not read by logic. */
  parameters: z.record(z.string(), z.unknown()).optional(),
  effective_from: isoDate.nullable(),
  effective_to: isoDate.nullable(),
  sources: z.array(RuleSourceSchema).min(1),
  status: z.literal('draft'),
}).refine((r) => r.id.startsWith(`${r.jurisdiction}.`), 'Rule id must start with its jurisdiction')
  .refine((r) => r.effective_from === null || r.effective_to === null || r.effective_from < r.effective_to,
    'effective_from must be before effective_to');
export type Rule = z.infer<typeof RuleSchema>;

export const VaultSlotSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9_]+$/),
  jurisdiction: JurisdictionSchema,
  layer: z.number().int().min(1).max(6),
  label: z.string().min(3),
  /** Why we ask for this, in plain words. */
  reason: plainText,
  rule_ids: z.array(z.string()).min(1),
  /** How we treat it: 4 we read it and check it, 5 you've told us and we hold it. */
  tier: z.number().int().min(4).max(5),
  /** It runs out, so we ask for the expiry date. */
  expires: z.boolean(),
});
export type VaultSlot = z.infer<typeof VaultSlotSchema>;

export const PackSchema = z.strictObject({
  jurisdiction: JurisdictionSchema,
  name: z.string().min(3),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  /**
   * Only "draft" exists in code. A pack goes live when a named Code & Clause
   * approver signs it off through the admin tool; nothing here can do that.
   */
  status: z.literal('draft'),
  inherits: z.array(JurisdictionSchema),
  rules: z.array(RuleSchema).min(1),
}).superRefine((pack, ctx) => {
  const seen = new Set<string>();
  for (const rule of pack.rules) {
    if (seen.has(rule.id)) ctx.addIssue({ code: 'custom', message: `Duplicate rule id ${rule.id}` });
    seen.add(rule.id);
    if (rule.jurisdiction !== pack.jurisdiction) {
      ctx.addIssue({ code: 'custom', message: `${rule.id} doesn't belong in the ${pack.jurisdiction} pack` });
    }
  }
});
export type Pack = z.infer<typeof PackSchema>;

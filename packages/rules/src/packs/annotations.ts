import type { Logic } from '../logic.js';
import type { Rule } from '../schema.js';

/**
 * Two things about a rule that aren't in the country maps, kept apart so a lawyer can read
 * them in one place. Both are proposals for Code & Clause to confirm: see COVERAGE.md.
 */

const yes = (key: string): Logic => ({ '==': [{ var: key }, true] });

/**
 * Rules whose default for a company that isn't incorporated in that country is wrong. By
 * default, layers 3 and 6 follow a company into each country where it has users or operates,
 * and everything else stays with the country of incorporation.
 *
 * - never: tied to being a company there, such as tax registration or premises.
 * - employees_here: only when the company employs people in that country.
 */
const OVERLAY_RULES: readonly { pattern: RegExp; mode: NonNullable<Rule['market_overlay']> }[] = [
  // Tax registrations and returns belong to the entity that is registered there.
  { pattern: /^[A-Z-]+\.TAX\./, mode: 'never' },
  // State registrations, premises and expatriate quotas assume a company on the ground.
  { pattern: /^US-DE\.STATE\./, mode: 'never' },
  { pattern: /^[A-Z-]+\.PREMISES\./, mode: 'never' },
  { pattern: /^NG\.FOREIGN\./, mode: 'never' },
  // Security policies aren't one country's law. The same document would count once per pack.
  { pattern: /^[A-Z-]+\.SEC\./, mode: 'never' },
  // Employer duties follow where the staff are, not where the users are.
  { pattern: /^[A-Z-]+\.EMP\./, mode: 'employees_here' },
];

export function overlayModeFor(ruleId: string): Rule['market_overlay'] {
  return OVERLAY_RULES.find((item) => item.pattern.test(ruleId))?.mode;
}

/**
 * One policy that serves every country. When two packs ask for it, only the first one
 * evaluated counts, so a company isn't asked for, or marked down for, the same thing twice.
 * Data protection rules aren't here on purpose: each is a different country's law.
 */
const SHARED_OBLIGATIONS: Readonly<Record<string, string>> = {
  'GB.AI.GOVERNANCE': 'ai_governance',
  'US-DE.AI.GOVERNANCE': 'ai_governance',
  'NG.AI.GOVERNANCE': 'ai_governance',
  'US-DE.AI.ACCEPTABLE_USE': 'ai_use_policy',
  'NG.AI.USE_POLICY': 'ai_use_policy',
  'GB.AI.RISK_ASSESSMENT': 'ai_risk_assessment',
  'US-DE.AI.RISK_ASSESSMENT': 'ai_risk_assessment',
  'GB.AI.MODEL_DOCS': 'ai_model_docs',
  'US-DE.AI.MODEL_DOCS': 'ai_model_docs',
  'GB.AI.VENDORS': 'ai_vendors',
  'US-DE.AI.VENDOR_AGREEMENTS': 'ai_vendors',
  'GB.AI.TRANSPARENCY': 'ai_transparency',
  'US-DE.AI.TRANSPARENCY': 'ai_transparency',
  'NG.AI.TRANSPARENCY': 'ai_transparency',
  // The International pack is evaluated last, so a country's own AI rule counts first.
  'INTL.AI.GOVERNANCE': 'ai_governance',
  'INTL.AI.USE_POLICY': 'ai_use_policy',
  'INTL.AI.TRANSPARENCY': 'ai_transparency',
  'INTL.AI.VENDORS': 'ai_vendors',
};

export function sharedObligationFor(ruleId: string): string | undefined {
  return SHARED_OBLIGATIONS[ruleId];
}

/**
 * The questionnaire asks directly about some documents. "Yes" is accepted as "You told us", and
 * "no" is a real gap on any plan. `when` keeps a follow-up that wasn't asked from counting: a
 * hidden follow-up defaults to false, which is not someone saying no.
 */
const RULE_ANSWERS: Readonly<Record<string, NonNullable<Rule['answered_by']>>> = {
  'GB.IP.FOUNDER_ASSIGNMENT': [{ fact: 'answers.ip_founders_signed' }],
  'NG.IP.FOUNDER_ASSIGNMENT': [{ fact: 'answers.ip_founders_signed' }],
  'US-DE.IP.FOUNDER_ASSIGNMENT': [{ fact: 'answers.ip_founders_signed' }],
  'INTL.IP.OWNER_ASSIGNMENT': [{ fact: 'answers.ip_founders_signed' }],
  'INTL.IP.STAFF_ASSIGNMENT': [{ fact: 'answers.ip_employees_signed' }],
  'INTL.IP.CONTRACTOR_ASSIGNMENT': [{ fact: 'answers.ip_contractors_signed' }],
  'GB.IP.CONTRACTOR_ASSIGNMENT': [{ fact: 'answers.ip_contractors_signed' }],
  // They stand in for INTL.IP.CONTRACTOR_ASSIGNMENT, so they keep its answer.
  'CZ.IP.CONTRACTOR_WORKS': [{ fact: 'answers.ip_contractors_signed' }],
  'PL.IP.CONTRACTOR_ASSIGNMENT': [{ fact: 'answers.ip_contractors_signed' }],
  'US-DE.IP.WORK_FOR_HIRE': [{ fact: 'answers.ip_contractors_signed' }],
  'US-DE.IP.PIIA': [{ fact: 'answers.ip_employees_signed' }],
  'NG.IP.TEAM_ASSIGNMENT': [
    { fact: 'answers.ip_employees_signed', when: yes('derived.employees') },
    { fact: 'answers.ip_contractors_signed', when: yes('derived.contractors') },
  ],
  'GB.FIN.FCA_AUTHORISATION': [{ fact: 'answers.has_partner_agreement', when: yes('derived.payments_via_partner_only') }],
  'NG.FIN.CBN_LICENCE': [{ fact: 'answers.has_partner_agreement', when: yes('derived.payments_via_partner_only') }],
  'US.FIN.MONEY_TRANSMITTER': [{ fact: 'answers.has_partner_agreement', when: yes('derived.payments_via_partner_only') }],
};

export function answersFor(ruleId: string): Rule['answered_by'] {
  return RULE_ANSWERS[ruleId];
}

/** Ids named above, so a test can prove none has gone stale. */
export const ANNOTATED_RULE_IDS: readonly string[] = [...Object.keys(SHARED_OBLIGATIONS), ...Object.keys(RULE_ANSWERS)];

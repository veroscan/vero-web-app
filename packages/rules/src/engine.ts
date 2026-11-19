import { z } from 'zod';
import { toIsoDate } from './dates.js';
import { computeDerived, DERIVED_INPUTS, type Getter } from './derived.js';
import { FactSchema, howWeKnow, isClosedWorld, isPublicOrAnswer, SourceStateSchema, type Fact, type FactValue, type Provenance, type SourceState } from './facts.js';
import { evaluate, truthy, UNKNOWN, varsIn, type FactResolver, type Logic, type Tri } from './logic.js';
import type { Outcome, Pack, Rule, Severity } from './schema.js';
import { SEVERITY_WORDS } from './scoring/config.js';
import type { ScorableFinding } from './scoring/scoring.js';

export type VerifyReason =
  | 'needs_review'
  | 'source_unavailable'
  | 'source_error'
  | 'source_ambiguous'
  /** A source needs an identifier from the company, such as a VAT number. */
  | 'needs_identifier'
  /** A paid vendor is still preparing its report. */
  | 'source_waiting'
  | 'not_answered'
  | 'no_data'
  | 'proxy_only'
  | 'not_seen_yet';

export type NotApplicableReason = 'trigger_off' | 'before_stage' | 'not_in_force';

export interface FactUsed {
  key: string;
  value: FactValue | undefined;
  known: boolean;
  how_we_know: string | null;
}

export interface Finding extends ScorableFinding {
  jurisdiction: string;
  area: string;
  title: string;
  severity_word: string;
  tier: number;
  confidence: Rule['confidence'];
  reason: VerifyReason | NotApplicableReason | null;
  /**
   * For a reason that comes from a source (down, waiting, or short of an identifier): that
   * source's fact prefix, so the app can show the source's own words, such as "We need your
   * VAT number to check this".
   */
  reason_source: string | null;
  text: Rule['text'];
  remediation: Rule['remediation'];
  evidence: string[];
  instruments: Rule['instruments'];
  regulator: string | null;
  facts_used: FactUsed[];
  sources: Rule['sources'];
  rule_status: Rule['status'];
  /** Decided by a document alone, so "we don't have this" can be said about it. */
  document_rule: boolean;
  /** The person has told us they don't have it. */
  declared_missing: boolean;
}

export const EngineInputSchema = z.strictObject({
  facts: z.array(FactSchema),
  /** What happened to each source this scan, keyed by a fact prefix such as "registry.uk.ico". */
  sources: z.record(z.string(), SourceStateSchema).default({}),
  stage: z.number().int().min(1).max(5),
  company_name: z.string().min(1).optional(),
  as_of: z.union([z.date(), z.string().min(10)]),
  /** Rules whose document the person has told us they don't have. These are real gaps. */
  declared_missing: z.array(z.string()).default([]),
});
export type EngineInput = z.input<typeof EngineInputSchema>;

interface Context {
  values: Map<string, FactValue>;
  provenance: Map<string, Provenance>;
  sources: Record<string, SourceState>;
  stage: number;
  companyName: string;
  asOf: string;
  asOfDate: Date;
  derived: Record<string, FactValue>;
  declaredMissing: ReadonlySet<string>;
}

function stateOf(key: string, sources: Record<string, SourceState>): SourceState {
  let best: SourceState = 'ok';
  let bestLength = -1;
  for (const [prefix, state] of Object.entries(sources)) {
    if ((key === prefix || key.startsWith(`${prefix}.`)) && prefix.length > bestLength) {
      best = state;
      bestLength = prefix.length;
    }
  }
  return best;
}

function buildContext(parsed: z.output<typeof EngineInputSchema>): Context {
  const values = new Map<string, FactValue>();
  const provenance = new Map<string, Provenance>();
  for (const fact of parsed.facts) {
    values.set(fact.key, fact.value);
    if (fact.provenance) provenance.set(fact.key, fact.provenance);
  }
  const asOfDate = typeof parsed.as_of === 'string' ? new Date(parsed.as_of) : parsed.as_of;
  if (Number.isNaN(asOfDate.getTime())) throw new Error(`Not a date: ${String(parsed.as_of)}`);
  const asOf = toIsoDate(asOfDate);

  // A fact from a source that's down is unknown, even if an older value was passed in.
  const get: Getter = (key) => (stateOf(key, parsed.sources) === 'ok' ? values.get(key) : undefined);
  return {
    values,
    provenance,
    sources: parsed.sources,
    stage: parsed.stage,
    companyName: parsed.company_name ?? 'your company',
    asOf,
    asOfDate,
    derived: computeDerived(get, asOf),
    declaredMissing: new Set(parsed.declared_missing),
  };
}

function resolverFor(ctx: Context): FactResolver {
  return (key) => {
    if (key.startsWith('derived.')) {
      // Worked out only from documents we haven't seen: we can't say either way.
      const inputs = DERIVED_INPUTS.get(key) ?? [];
      if (inputs.length > 0 && inputs.every((input) => isClosedWorld(input) && !ctx.values.has(input))) return UNKNOWN;
      const value = ctx.derived[key];
      return value === null || value === undefined ? UNKNOWN : value;
    }
    if (stateOf(key, ctx.sources) !== 'ok') return UNKNOWN;
    const value = ctx.values.get(key);
    if (value === undefined || value === null) {
      // A document we hold that doesn't carry this detail: that much we do know.
      const held = /^vault\.([^.]+)\.(?!present$)/.exec(key)?.[1];
      return held !== undefined && ctx.values.get(`vault.${held}.present`) === true ? false : UNKNOWN;
    }
    return value;
  };
}

/** The real facts behind a key, following derived facts back to what they read. */
function rootInputs(key: string): string[] {
  const inputs = DERIVED_INPUTS.get(key);
  return inputs ? [...inputs] : [key];
}

function reasonForUnknown(logics: Logic[], ctx: Context, resolve: FactResolver): VerifyReason {
  const unknownKeys = logics.flatMap(varsIn).filter((key) => resolve(key) === UNKNOWN);
  const states = unknownKeys.flatMap(rootInputs).map((key) => ({ key, state: stateOf(key, ctx.sources) }));
  // Something the company can fix comes first, so the reason says what to do.
  if (states.some((s) => s.state === 'unsupported')) return 'needs_identifier';
  if (states.some((s) => s.state === 'waiting')) return 'source_waiting';
  if (states.some((s) => s.state === 'unavailable')) return 'source_unavailable';
  if (states.some((s) => s.state === 'error')) return 'source_error';
  if (states.some((s) => s.state === 'ambiguous')) return 'source_ambiguous';
  const roots = unknownKeys.flatMap(rootInputs);
  if (roots.length > 0 && roots.every((key) => key.startsWith('answers.') || key.startsWith('company.'))) return 'not_answered';
  if (roots.some(isClosedWorld)) return 'not_seen_yet';
  return 'no_data';
}

function prefixOf(key: string, sources: Record<string, SourceState>): string | null {
  let best: string | null = null;
  for (const prefix of Object.keys(sources)) {
    if ((key === prefix || key.startsWith(`${prefix}.`)) && (best === null || prefix.length > best.length)) best = prefix;
  }
  return best;
}

const STATE_FOR_REASON: Partial<Record<VerifyReason, SourceState>> = {
  needs_identifier: 'unsupported',
  source_waiting: 'waiting',
  source_unavailable: 'unavailable',
  source_error: 'error',
  source_ambiguous: 'ambiguous',
};

/** The source (by fact prefix) whose state gave this reason, so its own plain message can be shown. */
function sourceBehind(reason: VerifyReason, logics: Logic[], ctx: Context, resolve: FactResolver): string | null {
  const wanted = STATE_FOR_REASON[reason];
  if (!wanted) return null;
  const keys = logics.flatMap(varsIn).filter((key) => resolve(key) === UNKNOWN).flatMap(rootInputs);
  for (const key of keys) {
    const prefix = prefixOf(key, ctx.sources);
    if (prefix !== null && ctx.sources[prefix] === wanted) return prefix;
  }
  return null;
}

function isTrue(value: Tri): boolean {
  return value !== UNKNOWN && truthy(value);
}

/**
 * Rules decided by a document and nothing else. These are the ones a person can answer with
 * "we don't have this". A rule still waiting on a lawyer isn't called either way, so it's out.
 */
export function isDocumentRule(rule: Rule): boolean {
  if (rule.confidence === 'needs_review') return false;
  const keys = varsIn(rule.satisfied_when);
  return keys.length > 0 && keys.every((key) => key.startsWith('vault.') || (DERIVED_INPUTS.get(key)?.every((input) => input.startsWith('vault.')) ?? false));
}

/** What the company said about this directly. Only questions that were really asked count. */
function answerTo(rule: Rule, resolve: FactResolver): 'yes' | 'no' | null {
  const asked = (rule.answered_by ?? []).filter((item) => item.when === undefined || isTrue(evaluate(item.when, resolve)));
  if (asked.length === 0) return null;
  const answers = asked.map((item) => resolve(item.fact));
  if (answers.some((answer) => answer === false)) return 'no';
  return answers.every((answer) => answer === true) ? 'yes' : null;
}

/**
 * The rule with the documents we haven't seen taken out, leaving what we do know. So "the
 * register says no, or a receipt would do" is still a no: the empty slot isn't what's lowering
 * the score, the register is. Returns null when nothing is left.
 */
function withoutUnseen(logic: Logic, resolve: FactResolver): Logic | null {
  if (logic !== null && typeof logic === 'object' && !Array.isArray(logic)) {
    const [op, raw] = Object.entries(logic)[0] as [string, Logic];
    if ((op === 'and' || op === 'or') && Array.isArray(raw)) {
      const kept = raw.map((item) => withoutUnseen(item, resolve)).filter((item) => item !== null);
      return kept.length === 0 ? null : { [op]: kept };
    }
  }
  const keys = varsIn(logic);
  return keys.length > 0 && keys.every((key) => isClosedWorld(key) && resolve(key) === UNKNOWN) ? null : logic;
}

function knownToFail(logic: Logic, resolve: FactResolver): boolean {
  const known = withoutUnseen(logic, resolve);
  if (known === null) return false;
  const result = evaluate(known, resolve);
  return result !== UNKNOWN && !truthy(result);
}

function decide(rule: Rule, ctx: Context, resolve: FactResolver): { outcome: Outcome; reason: Finding['reason']; reason_source?: string | null } {
  if ((rule.effective_from && ctx.asOf < rule.effective_from) || (rule.effective_to && ctx.asOf >= rule.effective_to)) {
    return { outcome: 'not_applicable', reason: 'not_in_force' };
  }
  if (ctx.stage < rule.stage_from) return { outcome: 'not_applicable', reason: 'before_stage' };

  const applies = evaluate(rule.applies_when, resolve);
  if (applies === UNKNOWN) {
    const why = reasonForUnknown([rule.applies_when], ctx, resolve);
    return { outcome: 'verify', reason: why, reason_source: sourceBehind(why, [rule.applies_when], ctx, resolve) };
  }
  if (!truthy(applies)) return { outcome: 'not_applicable', reason: 'trigger_off' };

  // Not yet confirmed by a lawyer: we can show the facts, but we don't call it either way.
  if (rule.confidence === 'needs_review') return { outcome: 'verify', reason: 'needs_review' };

  const satisfied = evaluate(rule.satisfied_when, resolve);
  if (isTrue(satisfied)) return { outcome: 'pass', reason: null };
  // Their own statement that they don't have it is more specific than any general answer.
  if (ctx.declaredMissing.has(rule.id) && isDocumentRule(rule)) return { outcome: 'gap', reason: null };
  const told = answerTo(rule, resolve);
  if (told === 'yes') return { outcome: 'pass', reason: null };
  if (rule.defect_when !== undefined && isTrue(evaluate(rule.defect_when, resolve))) return { outcome: 'defect', reason: null };
  if (told === 'no') return { outcome: 'gap', reason: null };
  if (rule.verify_when !== undefined && isTrue(evaluate(rule.verify_when, resolve))) return { outcome: 'verify', reason: 'proxy_only' };
  if (satisfied === UNKNOWN) {
    if (knownToFail(rule.satisfied_when, resolve)) return { outcome: 'gap', reason: null };
    const why = reasonForUnknown([rule.satisfied_when], ctx, resolve);
    return { outcome: 'verify', reason: why, reason_source: sourceBehind(why, [rule.satisfied_when], ctx, resolve) };
  }
  return { outcome: 'gap', reason: null };
}

function fill(text: string, companyName: string): string {
  return text.replaceAll('{company}', companyName);
}

function factsUsed(rule: Rule, ctx: Context, resolve: FactResolver): FactUsed[] {
  const logics: Logic[] = [rule.satisfied_when];
  if (rule.defect_when !== undefined) logics.push(rule.defect_when);
  if (rule.verify_when !== undefined) logics.push(rule.verify_when);
  const answered = (rule.answered_by ?? []).filter((item) => item.when === undefined || isTrue(evaluate(item.when, resolve))).map((item) => item.fact);
  const keys = [...new Set([...logics.flatMap(varsIn), ...answered])];
  return keys.map((key) => {
    const resolved = resolve(key);
    const known = resolved !== UNKNOWN;
    return {
      key,
      value: known ? (resolved as FactValue) : undefined,
      known,
      how_we_know: known && !key.startsWith('derived.') && ctx.values.has(key) ? howWeKnow(ctx.provenance.get(key), ctx.asOfDate) : null,
    };
  });
}

function evaluateRule(rule: Rule, ctx: Context): Finding {
  const resolve = resolverFor(ctx);
  const { outcome, reason, reason_source: reasonSource = null } = decide(rule, ctx, resolve);
  const severity: Severity = rule.severity;
  const scored = outcome === 'pass' || outcome === 'gap' || outcome === 'defect';
  const satisfiedVars = varsIn(rule.satisfied_when);
  const declared = outcome === 'gap' && ctx.declaredMissing.has(rule.id) && isDocumentRule(rule);
  return {
    rule_id: rule.id,
    jurisdiction: rule.jurisdiction,
    layer: rule.layer,
    area: rule.area,
    title: rule.title,
    outcome,
    severity,
    severity_word: SEVERITY_WORDS[severity],
    scored,
    tier: rule.tier,
    confidence: rule.confidence,
    reason,
    reason_source: reasonSource,
    text: {
      headline: fill(rule.text.headline, ctx.companyName),
      missing: fill(rule.text.missing, ctx.companyName),
      why: fill(rule.text.why, ctx.companyName),
      if_left: fill(rule.text.if_left, ctx.companyName),
      fix: fill(rule.text.fix, ctx.companyName),
    },
    remediation: rule.remediation,
    evidence: rule.evidence,
    instruments: rule.instruments,
    regulator: rule.regulator,
    facts_used: declared ? [{ key: 'declared_missing', value: undefined, known: true, how_we_know: "You told us you don't have this" }, ...factsUsed(rule, ctx, resolve)] : factsUsed(rule, ctx, resolve),
    cost_of_delay: rule.cost_of_delay,
    // An answer to the question itself is evidence a free scan can use. No answer isn't.
    // A worked-out fact counts as what it was worked out from: one read from documents isn't public.
    free_plan_evidence: satisfiedVars.flatMap(rootInputs).some(isPublicOrAnswer) || answerTo(rule, resolve) !== null || declared,
    sources: rule.sources,
    rule_status: rule.status,
    document_rule: isDocumentRule(rule),
    declared_missing: declared,
    due_on: null,
  };
}

export interface EngineResult {
  findings: Finding[];
  /** Version of each pack used, for the score snapshot. */
  pack_versions: Record<string, string>;
  as_of: string;
  derived: Record<string, FactValue>;
}

/** Facts in, findings out. Pure: no clocks, no network, no database. */
export function runEngine(packs: readonly Pack[], input: EngineInput): EngineResult {
  const parsed = EngineInputSchema.parse(input);
  const ctx = buildContext(parsed);
  const findings = packs.flatMap((pack) => pack.rules.map((rule) => evaluateRule(rule, ctx)));
  return {
    findings,
    pack_versions: Object.fromEntries(packs.map((pack) => [pack.jurisdiction, pack.version])),
    as_of: ctx.asOf,
    derived: ctx.derived,
  };
}

export type { Fact };

import {
  freePlanRange,
  LAYER_NAMES,
  pointsForFinding,
  rankPriorities,
  scoreFindings,
  SCORING,
  SEVERITY_WORDS,
  statusWord,
  type PackUse,
  type RankedAction,
  type ScorableFinding,
  type ScoreResult,
  type Severity,
  type StatusWord,
} from '@vero/rules';
import {
  AREA_DESCRIPTIONS,
  countryName,
  PLAN_ENTITLEMENTS,
  type AreaResponse,
  type Coverage,
  type Entitlements,
  type IssueDetail,
  type IssueListResponse,
  type IssueSummary,
  type OverviewResponse,
  type PlanCode,
  type ProjectionResponse,
  type ScoreView,
} from '@vero/shared';
import { and, asc, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { isOwned } from '../companies/ownership';
import { whatChangedSinceLastLook } from '../monitoring/summary';
import { planOf, requireEntitlement } from '../plans/service';
import { proofFor } from '../vault/service';
import { issueHistory } from './activity';
import { coverageFor, isDown, latestSources, requireCompany, type CompanyRow } from '../scans/facts';
import type { FindingDetail } from '../scans/pipeline';

const { scan, finding, scoreSnapshot, company: companyTable, deadline, rulePack } = schema;

export const NOT_LEGAL_ADVICE =
  "This is a guide to help you prepare, not legal advice. The rules behind it are drafts that haven't been reviewed yet.";

const OUTCOME_WORDS: Record<string, string> = {
  pass: 'In good shape',
  gap: 'Needs fixing',
  defect: 'Needs fixing',
  verify: 'Not checked yet',
  not_applicable: "Doesn't apply",
};

const REASON_WORDS: Record<string, string> = {
  needs_review: "We don't score this yet: how this check works hasn't been confirmed.",
  source_unavailable: "One of our sources isn't available right now, so this doesn't count for or against your score.",
  source_error: "We couldn't reach one of our sources, so this doesn't count for or against your score. We'll keep trying.",
  source_ambiguous: 'We found more than one possible match, so we need you to confirm which is yours.',
  needs_identifier: "We need a number from you, such as a VAT or registration number, to check this. It doesn't count for or against your score until then.",
  source_waiting: "Our data provider is still preparing this. We'll check again, and it doesn't count for or against your score until then.",
  not_answered: "We need an answer from you before we can check this.",
  no_data: "We don't have enough to check this yet.",
  proxy_only: 'We can only see part of this, so we need something more from you.',
  not_seen_yet: "We haven't seen this yet. It doesn't count for or against your score.",
};

type FindingRow = typeof finding.$inferSelect;

export interface LoadedFinding extends ScorableFinding {
  row: FindingRow;
  detail: FindingDetail;
  company: CompanyRow;
}

export interface ResultSet {
  plan: PlanCode;
  entitlements: Entitlements;
  companies: CompanyRow[];
  findings: LoadedFinding[];
  scans: (typeof scan.$inferSelect)[];
  score: ScoreResult;
  asOf: Date;
}

/** The company, plus whatever hangs off it when asked for the group. */
async function companiesInScope(tx: Tx, root: CompanyRow, scope: 'company' | 'group'): Promise<CompanyRow[]> {
  if (scope === 'company') return [root];
  const children = await tx.select().from(companyTable).where(eq(companyTable.parentCompanyId, root.id)).orderBy(asc(companyTable.createdAt));
  return [root, ...children];
}

/** The newest result per company. Findings are keyed so two entities can share a rule. */
export async function loadResults(deps: AppDeps, tx: Tx, organisationId: string, companyId: string, scope: 'company' | 'group'): Promise<ResultSet> {
  const root = await requireCompany(tx, companyId);
  const companies = await companiesInScope(tx, root, scope);
  const plan = await planOf(tx, organisationId, deps.config);

  const scans: (typeof scan.$inferSelect)[] = [];
  const findings: LoadedFinding[] = [];
  for (const entity of companies) {
    const [latest] = await tx
      .select()
      .from(scan)
      .where(and(eq(scan.companyId, entity.id), isNotNull(scan.finalisedSeq)))
      .orderBy(desc(scan.finalisedSeq))
      .limit(1);
    if (!latest) continue;
    scans.push(latest);
    const rows = await tx.select().from(finding).where(eq(finding.scanId, latest.id));
    for (const row of rows) {
      const detail = row.detail as FindingDetail;
      findings.push({
        rule_id: `${entity.id}|${row.ruleKey}`,
        layer: row.layer,
        outcome: row.outcome as ScorableFinding['outcome'],
        severity: row.severity as Severity,
        scored: row.scored,
        due_on: detail.due_on,
        free_plan_evidence: row.freePlanEvidence,
        ...(detail.cost_of_delay ? { cost_of_delay: detail.cost_of_delay } : {}),
        row,
        detail,
        company: entity,
      });
    }
  }
  return {
    plan,
    entitlements: PLAN_ENTITLEMENTS[plan],
    companies,
    findings,
    scans,
    score: scoreFindings(findings),
    asOf: deps.now(),
  };
}

const COUNTRY_WORDS: Record<string, string> = { GB: 'United Kingdom', NG: 'Nigeria', 'US-DE': 'Delaware', US: 'United States', INTL: 'International' };

/**
 * The market a finding is for. Federal rules sit with the company's own US state, or with
 * Delaware for a company from elsewhere with US users, which is how people filter them.
 * International rules say INTL: they aren't any one country's.
 */
function marketOf(item: LoadedFinding): string {
  if (item.detail.jurisdiction !== 'US') return item.detail.jurisdiction;
  const home = item.company.incorporationCountry;
  return home === 'US' || home.startsWith('US-') ? home : 'US-DE';
}

function howWeKnow(item: LoadedFinding): string[] {
  return [...new Set(item.detail.facts_used.flatMap((used) => (used.how_we_know ? [used.how_we_know] : [])))];
}

function summary(item: LoadedFinding, points: number | null, heldByUrgent = false): IssueSummary {
  return {
    ruleKey: item.row.ruleKey,
    companyId: item.company.id,
    companyName: item.company.legalName,
    title: item.detail.title,
    headline: item.detail.headline,
    layer: item.row.layer,
    layerName: LAYER_NAMES[item.row.layer] ?? '',
    area: item.detail.area,
    severity: item.severity,
    severityWord: SEVERITY_WORDS[item.severity],
    outcome: item.outcome,
    outcomeWord: OUTCOME_WORDS[item.outcome] ?? '',
    country: marketOf(item),
    countryLabel: COUNTRY_WORDS[item.detail.jurisdiction] ?? countryName(item.detail.jurisdiction),
    appliesBecause: item.detail.applies_because,
    points,
    pointsHeldByUrgent: heldByUrgent && points === 0 && isOpen(item),
    canDeclareMissing: item.detail.document_rule && item.outcome === 'verify' && item.detail.reason === 'not_seen_yet',
    declaredMissing: item.detail.declared_missing,
    dueOn: item.detail.due_on,
    // Vero sells no documents, so a rule's old order code never reaches a customer.
    actionType: item.detail.remediation.action_type,
    howWeKnow: howWeKnow(item),
  };
}

function isOpen(item: ScorableFinding): boolean {
  return item.scored && (item.outcome === 'gap' || item.outcome === 'defect');
}

/** Free sees only gaps from public data and answers, and at most its limit of them. */
function rank(set: ResultSet): RankedAction<LoadedFinding>[] {
  if (set.entitlements.gapLimit !== null) {
    return rankPriorities(set.findings.filter((item) => item.free_plan_evidence === true), set.asOf, set.entitlements.gapLimit);
  }
  return rankPriorities(set.findings, set.asOf, Number.POSITIVE_INFINITY);
}

function scoreView(set: ResultSet): ScoreView {
  if (set.entitlements.exactScore) {
    return set.score.overall === null ? { kind: 'none' } : { kind: 'exact', value: set.score.overall };
  }
  const range = freePlanRange(set.findings);
  return range ? { kind: 'approximate', low: range.low, high: range.high } : { kind: 'none' };
}

/** What the score on screen rests on. A range counts only what the range used. */
function scoreBasis(set: ResultSet): { coverage: Coverage | null; heldByUrgent: boolean } {
  if (set.scans.length === 0) return { coverage: null, heldByUrgent: false };
  if (set.entitlements.exactScore) return { coverage: set.score.coverage, heldByUrgent: set.score.held_by_urgent };
  const range = freePlanRange(set.findings);
  return { coverage: range?.coverage ?? { counted: 0, total: 0 }, heldByUrgent: range?.held_by_urgent ?? false };
}

function wordFor(view: ScoreView, coverage: Coverage | null): StatusWord | null {
  if (view.kind === 'exact') return statusWord(view.value, coverage ?? undefined);
  if (view.kind === 'approximate') return statusWord(Math.round((view.low + view.high) / 2), coverage ?? undefined);
  return null;
}

export function deadlineState(status: string, dueOn: string, today: string): 'overdue' | 'due_soon' | 'upcoming' | 'done' {
  if (status === 'done') return 'done';
  if (dueOn < today) return 'overdue';
  const days = (Date.parse(dueOn) - Date.parse(today)) / 86_400_000;
  return days <= 30 ? 'due_soon' : 'upcoming';
}

/**
 * `viewer`: the person looking, so "what changed" can be since their last look. Without one
 * (the seed's checks), nothing is recorded and whatChanged is null.
 */
export async function buildOverview(deps: AppDeps, tx: Tx, organisationId: string, companyId: string, scope: 'company' | 'group', viewer?: string): Promise<OverviewResponse> {
  const set = await loadResults(deps, tx, organisationId, companyId, scope);
  const companyIds = set.companies.map((item) => item.id);
  const today = set.asOf.toISOString().slice(0, 10);
  const view = scoreView(set);
  const ranked = rank(set);
  const paid = set.entitlements.fullReport;

  const areas = set.score.layers.map((layer) => {
    const inLayer = set.findings.filter((item) => item.layer === layer.layer);
    const top = ranked.find((item) => item.finding.layer === layer.layer);
    return {
      layer: layer.layer,
      name: layer.name,
      description: AREA_DESCRIPTIONS[layer.layer] ?? '',
      score: paid ? layer.score : null,
      statusWord: paid && layer.score !== null ? statusWord(layer.score, layer.coverage) : null,
      capped: paid && layer.capped,
      locked: !paid,
      coverage: paid ? layer.coverage : null,
      openCount: paid ? inLayer.filter(isOpen).length : null,
      topIssue: top && paid ? { ruleKey: top.finding.row.ruleKey, headline: top.finding.detail.headline, points: top.points } : null,
    };
  });

  const next = ranked[0];
  const deadlines = companyIds.length === 0 ? [] : await tx
    .select({ id: deadline.id, companyId: deadline.companyId, title: deadline.title, dueOn: deadline.dueOn, status: deadline.status })
    .from(deadline)
    .where(and(inArray(deadline.companyId, companyIds), eq(deadline.status, 'upcoming')))
    .orderBy(asc(deadline.dueOn))
    .limit(3);
  const names = new Map(set.companies.map((item) => [item.id, item.legalName]));

  let trend: OverviewResponse['trend'] = null;
  if (scope === 'company' && set.entitlements.exactScore) {
    const since = new Date(set.asOf.getTime() - 90 * 86_400_000);
    const [oldest] = await tx
      .select({ overall: scoreSnapshot.overall, createdAt: scoreSnapshot.createdAt })
      .from(scoreSnapshot)
      .where(and(eq(scoreSnapshot.companyId, companyId), sql`${scoreSnapshot.createdAt} >= ${since.toISOString()}::timestamptz`, isNotNull(scoreSnapshot.overall)))
      .orderBy(asc(scoreSnapshot.createdAt), asc(scoreSnapshot.id))
      .limit(1);
    if (oldest && set.score.overall !== null && set.scans.length > 0) {
      const count = await tx.select({ id: scoreSnapshot.id }).from(scoreSnapshot).where(eq(scoreSnapshot.companyId, companyId)).limit(2);
      if (count.length > 1) trend = { delta: set.score.overall - Math.round(Number(oldest.overall)), since: oldest.createdAt.toISOString() };
    }
  }

  // One after another: a transaction has one connection, and it can't run two queries at once.
  const allSources = [];
  for (const id of companyIds) allSources.push(...(await latestSources(tx, id)));
  const sourcesDown = allSources
    .filter((source) => isDown(source.status))
    .map((source) => ({ sourceName: source.sourceName ?? source.connectorId, lastTriedAt: source.retrievedAt.toISOString() }));

  const sampleRows = await tx
    .select({ id: schema.fact.id })
    .from(schema.fact)
    .where(and(inArray(schema.fact.companyId, companyIds), eq(schema.fact.isFixture, true)))
    .limit(1);

  const used = new Map<string, PackUse>();
  for (const item of set.scans) {
    for (const use of item.packsUsed as PackUse[]) {
      // Across a group, a pack that's the home of one entity counts as "full".
      if (use.mode === 'full' || !used.has(use.jurisdiction)) used.set(use.jurisdiction, use);
    }
  }
  const packRows = used.size === 0 ? [] : await tx.select().from(rulePack).where(inArray(rulePack.jurisdictionCode, [...used.keys()]));
  const rulePacks = packRows.flatMap((pack) => {
    const use = used.get(pack.jurisdictionCode);
    return use?.version === pack.version ? [{ jurisdiction: pack.jurisdictionCode, version: pack.version, status: pack.status, mode: use.mode }] : [];
  });

  const latest = [...set.scans].sort((a, b) => (b.finalisedSeq ?? 0) - (a.finalisedSeq ?? 0))[0];
  // For the company the overview is about (the root, for a group).
  const whatChanged = viewer
    ? await whatChangedSinceLastLook(tx, { organisationId, companyId, userId: viewer, exact: set.entitlements.exactScore, now: set.asOf })
    : null;
  return {
    companyId,
    scope,
    plan: set.plan,
    hasResult: set.scans.length > 0,
    score: view,
    statusWord: wordFor(view, scoreBasis(set).coverage),
    ...scoreBasis(set),
    verifiedThreshold: SCORING.badge.min_score,
    trend,
    areas,
    nextAction: next
      ? {
          ruleKey: next.finding.row.ruleKey,
          companyId: next.finding.company.id,
          title: next.finding.detail.headline,
          why: next.finding.row.whyItMatters ?? '',
          points: set.entitlements.priorityList ? next.points : null,
          actionType: next.finding.detail.remediation.action_type,
        }
      : null,
    topDeadlines: deadlines.map((row) => ({
      id: row.id,
      companyName: names.get(row.companyId) ?? '',
      title: row.title,
      dueOn: row.dueOn,
      state: deadlineState(row.status, row.dueOn, today),
    })),
    sourcesDown,
    sampleData: sampleRows.length > 0,
    rulePacks,
    countryCoverage: coverageFor((set.companies.find((item) => item.id === companyId) ?? set.companies[0])?.incorporationCountry ?? '', deps.connectors),
    methodVersion: latest ? SCORING.method_version : null,
    scannedAt: latest?.completedAt?.toISOString() ?? null,
    whatChanged,
    notLegalAdvice: NOT_LEGAL_ADVICE,
  };
}

export async function buildIssueList(
  deps: AppDeps,
  tx: Tx,
  organisationId: string,
  companyId: string,
  query: { scope: 'company' | 'group'; layer?: number; severity?: string; country?: string; outcome: 'open' | 'passed' | 'to_check' | 'all' },
): Promise<IssueListResponse> {
  const set = await loadResults(deps, tx, organisationId, companyId, query.scope);
  const ranked = rank(set);
  const limited = set.entitlements.gapLimit !== null;
  const open = set.findings.filter(isOpen);
  const filter = (item: LoadedFinding) =>
    (query.layer === undefined || item.layer === query.layer) &&
    (query.severity === undefined || item.severity === query.severity) &&
    (query.country === undefined || marketOf(item) === query.country);

  let issues: IssueSummary[];
  if (limited) {
    // Whatever was asked for, a limited plan only ever gets its few gaps, with no points.
    issues = query.outcome === 'open' || query.outcome === 'all' ? ranked.filter((item) => filter(item.finding)).map((item) => summary(item.finding, null)) : [];
  } else {
    const rows: IssueSummary[] = [];
    if (query.outcome === 'open' || query.outcome === 'all') {
      rows.push(...ranked.filter((item) => filter(item.finding)).map((item) => summary(item.finding, item.points, set.score.open_critical > 0)));
    }
    if (query.outcome === 'passed' || query.outcome === 'all') {
      rows.push(...set.findings.filter((item) => item.outcome === 'pass' && filter(item)).map((item) => summary(item, 0)));
    }
    if (query.outcome === 'to_check' || query.outcome === 'all') {
      rows.push(...set.findings.filter((item) => item.outcome === 'verify' && filter(item)).map((item) => summary(item, 0)));
    }
    issues = rows;
  }
  return {
    issues,
    total: limited ? issues.length : issues.length,
    lockedCount: limited ? Math.max(0, open.length - ranked.length) : 0,
    passedCount: limited ? null : set.findings.filter((item) => item.outcome === 'pass').length,
    score: scoreView(set),
  };
}

export async function buildIssueDetail(deps: AppDeps, tx: Tx, organisationId: string, companyId: string, ruleKey: string): Promise<IssueDetail> {
  const set = await loadResults(deps, tx, organisationId, companyId, 'company');
  const item = set.findings.find((candidate) => candidate.row.ruleKey === ruleKey);
  if (!item) throw errors.notFound('That issue');
  const limited = set.entitlements.gapLimit !== null;
  if (limited && !rank(set).some((candidate) => candidate.finding === item)) {
    throw errors.planUpgrade('Seeing every issue');
  }
  const showPoints = set.entitlements.priorityList;
  const points = showPoints ? pointsForFinding(item.rule_id, set.findings) : null;
  const from = set.score.overall;
  const history = await issueHistory(tx, item.company, ruleKey);
  return {
    ...summary(item, points, set.score.open_critical > 0),
    lastCheckedAt: history.lastCheckedAt,
    activity: history.activity,
    missing: item.row.whatIsMissing ?? '',
    why: item.row.whyItMatters ?? '',
    ifLeft: item.row.ifLeft ?? '',
    fix: item.row.fix ?? '',
    reasonWords: item.outcome === 'verify' ? (item.detail.reason_detail ?? REASON_WORDS[item.detail.reason ?? ''] ?? REASON_WORDS.no_data ?? null) : null,
    evidence: item.detail.evidence,
    law: item.detail.instruments.map((instrument) => ({ law: instrument.law, cite: instrument.cite ?? null })),
    regulator: item.detail.regulator,
    projection: showPoints && points !== null && from !== null ? { from, to: from + points } : null,
    rulePackVersion: item.row.rulePackVersion,
    ruleStatus: item.detail.rule_status,
    // What proof clears it is said to everyone; only an owning team on a plan with the vault can upload it.
    proof: await proofFor(tx, item.company, ruleKey),
    canAddEvidence: isOwned(item.company) && set.entitlements.vault,
    notLegalAdvice: NOT_LEGAL_ADVICE,
  };
}

export async function buildArea(deps: AppDeps, tx: Tx, organisationId: string, companyId: string, layer: number, scope: 'company' | 'group' = 'company'): Promise<AreaResponse> {
  const set = await loadResults(deps, tx, organisationId, companyId, scope);
  requireEntitlement(set.entitlements, 'fullReport', 'The report on each area');
  const scored = set.score.layers.find((item) => item.layer === layer);
  const inLayer = set.findings.filter((item) => item.layer === layer);
  const ranked = rank(set).filter((item) => item.finding.layer === layer);
  return {
    layer,
    name: LAYER_NAMES[layer] ?? '',
    description: AREA_DESCRIPTIONS[layer] ?? '',
    score: scored?.score ?? null,
    statusWord: scored?.score === null || scored?.score === undefined ? null : statusWord(scored.score, scored.coverage),
    capped: scored?.capped ?? false,
    coverage: scored?.coverage ?? { counted: 0, total: 0 },
    cappedExplanation: scored?.capped ? "An urgent issue keeps an area below 50 until it's fixed, however much else is in order." : null,
    toFix: ranked.map((item) => summary(item.finding, item.points, set.score.open_critical > 0)),
    inGoodShape: inLayer.filter((item) => item.outcome === 'pass').map((item) => summary(item, 0)),
    toCheck: inLayer.filter((item) => item.outcome === 'verify').map((item) => summary(item, 0)),
  };
}

export async function buildProjection(
  deps: AppDeps,
  tx: Tx,
  organisationId: string,
  companyId: string,
  input: { scope?: 'company' | 'group'; ruleKeys?: string[] | undefined; fixes?: { companyId: string; ruleKey: string }[] | undefined },
): Promise<ProjectionResponse> {
  const set = await loadResults(deps, tx, organisationId, companyId, input.scope ?? 'company');
  requireEntitlement(set.entitlements, 'priorityList', 'Seeing what a fix would do');
  // Findings are keyed per company, so the same rule on two entities stays two fixes.
  const chosen = new Set([
    ...(input.ruleKeys ?? []).map((ruleKey) => `${companyId}|${ruleKey}`),
    ...(input.fixes ?? []).map((fix) => `${fix.companyId}|${fix.ruleKey}`),
  ]);
  for (const key of chosen) {
    const item = set.findings.find((candidate) => candidate.rule_id === key);
    if (!item) throw errors.notFound('That issue');
    if (!isOpen(item)) throw errors.invalidInput("That issue isn't open, so fixing it wouldn't change your score.");
  }
  const current = set.score.overall;
  if (current === null) throw errors.invalidState("There's no score yet.");
  const after = scoreFindings(set.findings.map((item) => (chosen.has(item.rule_id) ? { ...item, outcome: 'pass' as const } : item)));
  const projected = after.overall ?? current;
  return {
    current,
    projected,
    gain: projected - current,
    reachesVerification: projected >= SCORING.badge.min_score,
    heldByUrgent: after.open_critical > 0,
  };
}

export { isOpen as isOpenFinding, rank as rankResults, scoreView };

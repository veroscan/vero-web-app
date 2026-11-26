import { freePlanRange, scoreFindings, statusWord, type ScorableFinding } from '@vero/rules';
import type { CompanyHistoryResponse, ScoreHistoryPoint, ScoreHistoryResponse } from '@vero/shared';
import { and, asc, eq, inArray, isNotNull } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { changeSummaries, finishedScans, snapshotsFor, snapshotView } from '../monitoring/summary';
import { entitlementsOf } from '../plans/service';
import { requireCompany } from '../scans/facts';

/** The scan history screen shows at most this many, newest first. */
export const HISTORY_LIMIT = 100;

/**
 * Every finished scan of one company, newest first: when, what started it, the score (exact or a
 * range, by plan), its word and what it rests on, the method and rule-pack versions, and what it
 * changed from the scan before. A company with no finished scan has an empty list.
 */
export async function companyHistory(deps: AppDeps, tx: Tx, organisationId: string, companyId: string): Promise<CompanyHistoryResponse> {
  await requireCompany(tx, companyId);
  const { exactScore } = await entitlementsOf(tx, organisationId, deps.config);
  const scans = await finishedScans(tx, companyId, { limit: HISTORY_LIMIT });
  const snapshots = await snapshotsFor(tx, scans.map((item) => item.id));
  const changes = await changeSummaries(tx, companyId, scans, exactScore);
  return {
    companyId,
    scans: scans.flatMap((item) => {
      const snapshot = snapshots.get(item.id);
      // A finished scan always has its snapshot. One without (a failed scan) isn't a result.
      if (!snapshot) return [];
      const view = snapshotView(snapshot, exactScore);
      return [
        {
          scanId: item.id,
          kind: item.kind === 'rescore' ? ('rescore' as const) : ('full' as const),
          trigger: item.trigger,
          finishedAt: (item.completedAt ?? item.createdAt).toISOString(),
          score: view.score,
          statusWord: view.statusWord,
          coverage: view.coverage,
          methodVersion: snapshot.methodVersion,
          rulePackVersions: snapshot.rulePackVersions as Record<string, string>,
          change: changes.get(item.id) ?? null,
        },
      ];
    }),
  };
}

type GroupFinding = ScorableFinding;

/** One scan's findings, keyed by company so two companies can share a rule, as the overview does. */
async function scanFindings(tx: Tx, companyId: string, scanId: string): Promise<GroupFinding[]> {
  const rows = await tx.select().from(schema.finding).where(eq(schema.finding.scanId, scanId));
  return rows.map((row) => {
    const detail = row.detail as { due_on?: string | null; cost_of_delay?: ScorableFinding['cost_of_delay'] };
    return {
      rule_id: `${companyId}|${row.ruleKey}`,
      layer: row.layer,
      outcome: row.outcome as ScorableFinding['outcome'],
      severity: row.severity as ScorableFinding['severity'],
      scored: row.scored,
      due_on: detail.due_on ?? null,
      free_plan_evidence: row.freePlanEvidence,
      ...(detail.cost_of_delay ? { cost_of_delay: detail.cost_of_delay } : {}),
    };
  });
}

/**
 * The score over time, oldest first, for the chart. For one company each point is a finished
 * scan's own stored result. For a group each point is a finished scan of any company in it, and
 * its score is every company's newest result at that moment scored together, which is how the
 * overview scores a group today. Nothing is estimated: a point exists only where a scan finished.
 */
export async function scoreHistory(deps: AppDeps, tx: Tx, organisationId: string, companyId: string, scope: 'company' | 'group'): Promise<ScoreHistoryResponse> {
  const root = await requireCompany(tx, companyId);
  const { exactScore } = await entitlementsOf(tx, organisationId, deps.config);
  const children = scope === 'group' ? await tx.select({ id: schema.company.id }).from(schema.company).where(eq(schema.company.parentCompanyId, root.id)) : [];

  if (children.length === 0) {
    const scans = await finishedScans(tx, root.id, { limit: HISTORY_LIMIT });
    const snapshots = await snapshotsFor(tx, scans.map((item) => item.id));
    const points: ScoreHistoryPoint[] = scans.flatMap((item) => {
      const snapshot = snapshots.get(item.id);
      if (!snapshot) return [];
      return [{ scanId: item.id, companyId: root.id, at: (item.completedAt ?? item.createdAt).toISOString(), ...snapshotView(snapshot, exactScore) }];
    });
    return { companyId: root.id, scope, points: points.reverse() };
  }

  const ids = [root.id, ...children.map((item) => item.id)];
  const scans = await tx
    .select({ id: schema.scan.id, companyId: schema.scan.companyId, completedAt: schema.scan.completedAt, createdAt: schema.scan.createdAt, seq: schema.scan.finalisedSeq })
    .from(schema.scan)
    .where(and(inArray(schema.scan.companyId, ids), isNotNull(schema.scan.finalisedSeq)))
    .orderBy(asc(schema.scan.finalisedSeq));
  // Every scan moves the picture on, but only the newest HISTORY_LIMIT are points on the chart.
  const firstShown = Math.max(0, scans.length - HISTORY_LIMIT);
  const newest = new Map<string, string>();
  const loaded = new Map<string, GroupFinding[]>();
  const points: ScoreHistoryPoint[] = [];
  for (const [index, item] of scans.entries()) {
    newest.set(item.companyId, item.id);
    if (index < firstShown) continue;
    const findings: GroupFinding[] = [];
    for (const [entityId, scanId] of newest) {
      let rows = loaded.get(scanId);
      if (!rows) {
        rows = await scanFindings(tx, entityId, scanId);
        loaded.set(scanId, rows);
      }
      findings.push(...rows);
    }
    // Findings of scans no longer anyone's newest aren't needed again.
    const live = new Set(newest.values());
    for (const key of loaded.keys()) if (!live.has(key)) loaded.delete(key);

    let view: Pick<ScoreHistoryPoint, 'score' | 'statusWord' | 'coverage'>;
    if (exactScore) {
      const result = scoreFindings(findings);
      view = result.overall === null
        ? { score: { kind: 'none' }, statusWord: null, coverage: result.coverage }
        : { score: { kind: 'exact', value: result.overall }, statusWord: statusWord(result.overall, result.coverage), coverage: result.coverage };
    } else {
      const range = freePlanRange(findings);
      view = range
        ? { score: { kind: 'approximate', low: range.low, high: range.high }, statusWord: statusWord(Math.round((range.low + range.high) / 2), range.coverage), coverage: range.coverage }
        : { score: { kind: 'none' }, statusWord: null, coverage: { counted: 0, total: 0 } };
    }
    points.push({ scanId: item.id, companyId: item.companyId, at: (item.completedAt ?? item.createdAt).toISOString(), ...view });
  }
  return { companyId: root.id, scope, points };
}

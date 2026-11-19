import { statusWord, type Coverage, type StatusWord } from '@vero/rules';
import type { ChangeSummary, ScoreView } from '@vero/shared';
import { and, desc, eq, gt, inArray, isNotNull, lt } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import { isDown } from '../scans/facts';

/**
 * What each finished scan changed, for the scan history, the home screen's "what changed" and
 * the watchlist. A monitoring scan already has its change stored (monitoring_change, written in
 * the scan's own transaction), so that is used as it is. Any other scan is compared with the
 * finished scan before it, by the same rules: a problem now that wasn't one before is new; a
 * problem before that now passes or no longer applies is resolved; "to check" is neither. A
 * source that couldn't be checked is never a change, only counted.
 *
 * Counts only, never issue text: a plan that shows only a few issues learns nothing more here.
 */

const { scan, finding, scoreSnapshot, monitoringChange, sourceResult, companyLastSeen } = schema;

const PROBLEM = new Set(['gap', 'defect']);
const SETTLED = new Set(['pass', 'not_applicable']);
const URGENT = new Set(['critical', 'high']);
const SCORE_DROP_POINTS = 5;

export type FinishedScan = Pick<typeof scan.$inferSelect, 'id' | 'kind' | 'trigger' | 'completedAt' | 'finalisedSeq' | 'createdAt'>;
type Snapshot = typeof scoreSnapshot.$inferSelect;

interface FreeRange {
  low: number;
  high: number;
  coverage?: Coverage;
}

const SCAN_COLUMNS = {
  id: scan.id,
  kind: scan.kind,
  trigger: scan.trigger,
  completedAt: scan.completedAt,
  finalisedSeq: scan.finalisedSeq,
  createdAt: scan.createdAt,
};

/** Finished scans of one company, newest first. Only those after `afterSeq`, when given. */
export async function finishedScans(tx: Tx, companyId: string, options: { limit: number; afterSeq?: number | null }): Promise<FinishedScan[]> {
  return tx
    .select(SCAN_COLUMNS)
    .from(scan)
    .where(
      and(
        eq(scan.companyId, companyId),
        isNotNull(scan.finalisedSeq),
        options.afterSeq === undefined || options.afterSeq === null ? undefined : gt(scan.finalisedSeq, options.afterSeq),
      ),
    )
    .orderBy(desc(scan.finalisedSeq))
    .limit(options.limit);
}

/** The finished scan just before this sequence number, if any. */
async function scanBefore(tx: Tx, companyId: string, seq: number): Promise<FinishedScan | null> {
  const [row] = await tx
    .select(SCAN_COLUMNS)
    .from(scan)
    .where(and(eq(scan.companyId, companyId), isNotNull(scan.finalisedSeq), lt(scan.finalisedSeq, seq)))
    .orderBy(desc(scan.finalisedSeq))
    .limit(1);
  return row ?? null;
}

export async function snapshotsFor(tx: Tx, scanIds: string[]): Promise<Map<string, Snapshot>> {
  if (scanIds.length === 0) return new Map();
  const rows = await tx.select().from(scoreSnapshot).where(inArray(scoreSnapshot.scanId, scanIds));
  return new Map(rows.map((row) => [row.scanId, row]));
}

function rounded(value: string | null | undefined): number | null {
  return value === null || value === undefined ? null : Math.round(Number(value));
}

function freeRangeOf(snapshot: Snapshot | undefined): FreeRange | null {
  const range = snapshot?.freeRange as Partial<FreeRange> | null | undefined;
  return range && typeof range.low === 'number' && typeof range.high === 'number' ? { low: range.low, high: range.high, ...(range.coverage ? { coverage: range.coverage } : {}) } : null;
}

/** The score a snapshot shows on this plan: exact, a range, or none. */
export function snapshotView(snapshot: Snapshot | undefined, exact: boolean): { score: ScoreView; statusWord: StatusWord | null; coverage: Coverage | null } {
  if (!snapshot) return { score: { kind: 'none' }, statusWord: null, coverage: null };
  if (exact) {
    const value = rounded(snapshot.overall);
    const coverage = snapshot.coverage as Coverage;
    return value === null ? { score: { kind: 'none' }, statusWord: null, coverage } : { score: { kind: 'exact', value }, statusWord: statusWord(value, coverage), coverage };
  }
  const range = freeRangeOf(snapshot);
  if (!range) return { score: { kind: 'none' }, statusWord: null, coverage: { counted: 0, total: 0 } };
  const coverage = range.coverage ?? { counted: 0, total: 0 };
  return { score: { kind: 'approximate', low: range.low, high: range.high }, statusWord: statusWord(Math.round((range.low + range.high) / 2), coverage), coverage };
}

interface Counts {
  newIssues: number;
  newUrgent: number;
  resolvedIssues: number;
  statusChanged: boolean;
  sanctionsMatch: boolean;
  notChecked: number;
  meaningful: boolean;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

function sentence(counts: Counts, scoreBefore: number | null, scoreAfter: number | null): string {
  const lines: string[] = [];
  if (counts.newIssues > 0) {
    const urgent = counts.newUrgent > 0 ? `, ${counts.newUrgent === counts.newIssues && counts.newIssues === 1 ? 'urgent or important' : `${counts.newUrgent} of them urgent or important`}` : '';
    lines.push(`${plural(counts.newIssues, 'new issue', 'new issues')}${urgent}.`);
  }
  if (counts.resolvedIssues > 0) lines.push(`${plural(counts.resolvedIssues, 'issue', 'issues')} no longer open.`);
  if (counts.statusChanged) lines.push('The company status changed on the register.');
  if (counts.sanctionsMatch) lines.push('A possible sanctions match needs a person to check it.');
  if (scoreBefore !== null && scoreAfter !== null && scoreBefore !== scoreAfter) {
    lines.push(`The score went ${scoreAfter > scoreBefore ? 'up' : 'down'} from ${scoreBefore} to ${scoreAfter}.`);
  }
  if (counts.notChecked > 0) {
    lines.push(`${counts.notChecked === 1 ? "1 source couldn't" : `${counts.notChecked} sources couldn't`} be checked this time. That isn't counted as a change.`);
  }
  return lines.join(' ');
}

/**
 * The change each scan made, newest first, or null where nothing changed (and for the first
 * scan). `scans` must be newest first. `exact` says whether this plan sees exact scores.
 */
export async function changeSummaries(tx: Tx, companyId: string, scans: readonly FinishedScan[], exact: boolean): Promise<Map<string, ChangeSummary | null>> {
  const result = new Map<string, ChangeSummary | null>();
  if (scans.length === 0) return result;
  const oldest = scans[scans.length - 1];
  const before = oldest?.finalisedSeq === null || oldest?.finalisedSeq === undefined ? null : await scanBefore(tx, companyId, oldest.finalisedSeq);
  const previousOf = new Map<string, FinishedScan | null>();
  scans.forEach((item, index) => previousOf.set(item.id, scans[index + 1] ?? before));

  const ids = scans.map((item) => item.id);
  const stored = await tx.select().from(monitoringChange).where(inArray(monitoringChange.scanId, ids));
  const monitoring = new Map(stored.map((row) => [row.scanId, row]));

  const toCompare = scans.filter((item) => !monitoring.has(item.id) && previousOf.get(item.id));
  const compareIds = [...new Set(toCompare.flatMap((item) => [item.id, previousOf.get(item.id)?.id ?? item.id]))];
  const findings = compareIds.length === 0 ? [] : await tx
    .select({ scanId: finding.scanId, ruleKey: finding.ruleKey, outcome: finding.outcome, severity: finding.severity })
    .from(finding)
    .where(inArray(finding.scanId, compareIds));
  const byScan = new Map<string, Map<string, { outcome: string; severity: string }>>();
  for (const row of findings) {
    const map = byScan.get(row.scanId) ?? new Map<string, { outcome: string; severity: string }>();
    map.set(row.ruleKey, { outcome: row.outcome, severity: row.severity });
    byScan.set(row.scanId, map);
  }
  const sources = toCompare.length === 0 ? [] : await tx
    .select({ scanId: sourceResult.scanId, status: sourceResult.status })
    .from(sourceResult)
    .where(inArray(sourceResult.scanId, toCompare.map((item) => item.id)));
  const downCount = new Map<string, number>();
  for (const row of sources) if (isDown(row.status)) downCount.set(row.scanId, (downCount.get(row.scanId) ?? 0) + 1);

  const snapshots = await snapshotsFor(tx, [...new Set([...ids, ...[...previousOf.values()].flatMap((item) => (item ? [item.id] : []))])]);

  for (const item of scans) {
    const previous = previousOf.get(item.id) ?? null;
    const at = (item.completedAt ?? item.createdAt).toISOString();
    const stored = monitoring.get(item.id);
    let counts: Counts;
    let scoreBefore: number | null;
    let scoreAfter: number | null;
    if (stored) {
      const added = stored.findingsNew as { severity?: string }[];
      counts = {
        newIssues: added.length,
        newUrgent: added.filter((row) => URGENT.has(row.severity ?? '')).length,
        resolvedIssues: (stored.findingsResolved as unknown[]).length,
        statusChanged: stored.meaningful.includes('status_change'),
        sanctionsMatch: stored.meaningful.includes('sanctions_match'),
        notChecked: stored.notChecked.length,
        meaningful: stored.meaningful.length > 0,
      };
      scoreBefore = rounded(stored.scoreBefore);
      scoreAfter = rounded(stored.scoreAfter);
    } else if (previous) {
      const now = byScan.get(item.id) ?? new Map<string, { outcome: string; severity: string }>();
      const was = byScan.get(previous.id) ?? new Map<string, { outcome: string; severity: string }>();
      const added = [...now.entries()].filter(([key, row]) => PROBLEM.has(row.outcome) && !PROBLEM.has(was.get(key)?.outcome ?? ''));
      const resolved = [...was.entries()].filter(([key, row]) => PROBLEM.has(row.outcome) && SETTLED.has(now.get(key)?.outcome ?? ''));
      scoreBefore = rounded(snapshots.get(previous.id)?.overall);
      scoreAfter = rounded(snapshots.get(item.id)?.overall);
      const newUrgent = added.filter(([, row]) => URGENT.has(row.severity)).length;
      const drop = scoreBefore !== null && scoreAfter !== null ? scoreBefore - scoreAfter : 0;
      counts = {
        newIssues: added.length,
        newUrgent,
        resolvedIssues: resolved.length,
        statusChanged: false,
        sanctionsMatch: false,
        notChecked: downCount.get(item.id) ?? 0,
        meaningful: newUrgent > 0 || (drop >= SCORE_DROP_POINTS && added.length > 0),
      };
    } else {
      result.set(item.id, null);
      continue;
    }
    // A plan that sees a range never gets an exact number this way.
    if (!exact) {
      scoreBefore = null;
      scoreAfter = null;
    }
    const nothing =
      counts.newIssues === 0 &&
      counts.resolvedIssues === 0 &&
      !counts.statusChanged &&
      !counts.sanctionsMatch &&
      (scoreBefore === null || scoreAfter === null || scoreBefore === scoreAfter);
    result.set(
      item.id,
      nothing
        ? null
        : { scanId: item.id, at, trigger: item.trigger, ...counts, scoreBefore, scoreAfter, summary: sentence(counts, scoreBefore, scoreAfter) },
    );
  }
  return result;
}

/** The newest scan, of the newest `limit`, that changed something. */
export async function latestChange(tx: Tx, companyId: string, exact: boolean, afterSeq: number | null = null, limit = 10): Promise<ChangeSummary | null> {
  const scans = await finishedScans(tx, companyId, { limit, afterSeq });
  const summaries = await changeSummaries(tx, companyId, scans, exact);
  for (const item of scans) {
    const summary = summaries.get(item.id);
    if (summary) return summary;
  }
  return null;
}

/**
 * "What changed since you last looked". Each look records the newest finished scan. When a newer
 * scan has finished since the person's last look, that look becomes the baseline, so the change
 * keeps showing on every visit until another scan lands. Never looked: the newest change shows.
 */
export async function whatChangedSinceLastLook(tx: Tx, input: { organisationId: string; companyId: string; userId: string; exact: boolean; now: Date }): Promise<ChangeSummary | null> {
  const [latest] = await finishedScans(tx, input.companyId, { limit: 1 });
  const latestSeq = latest?.finalisedSeq ?? null;
  const [seen] = await tx
    .select()
    .from(companyLastSeen)
    .where(and(eq(companyLastSeen.companyId, input.companyId), eq(companyLastSeen.userId, input.userId)));

  let baseline: number | null;
  if (!seen) {
    baseline = null;
    await tx
      .insert(companyLastSeen)
      .values({ organisationId: input.organisationId, companyId: input.companyId, userId: input.userId, seenSeq: latestSeq, previousSeenSeq: null, seenAt: input.now })
      .onConflictDoNothing();
  } else if (latestSeq !== null && (seen.seenSeq === null || latestSeq > seen.seenSeq)) {
    baseline = seen.seenSeq;
    await tx
      .update(companyLastSeen)
      .set({ seenSeq: latestSeq, previousSeenSeq: seen.seenSeq, seenAt: input.now })
      .where(and(eq(companyLastSeen.companyId, input.companyId), eq(companyLastSeen.userId, input.userId)));
  } else {
    baseline = seen.previousSeenSeq;
  }
  if (latestSeq === null) return null;
  return latestChange(tx, input.companyId, input.exact, baseline);
}

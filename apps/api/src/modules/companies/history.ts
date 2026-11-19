import type { CompanyHistoryResponse } from '@vero/shared';
import type { Tx } from '../../db';
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

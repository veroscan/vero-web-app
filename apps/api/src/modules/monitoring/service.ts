import { PLAN_ENTITLEMENTS, type PlanCode } from '@vero/shared';
import { and, eq, inArray, isNotNull, max } from 'drizzle-orm';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { writeAudit } from '../audit/service';
import { planOf } from '../plans/service';
import { startFullScan } from '../scans/pipeline';

const { scan, companySweep, organisation, company } = schema;

export const MONITORING_TRIGGER = 'monitoring';

const DAY_SECONDS = 24 * 60 * 60;
const DAY_MS = DAY_SECONDS * 1000;

/**
 * How often a plan's companies are re-scanned on our own, or null for no monitoring.
 *
 * Scale is the plan that promises monitoring ("We re-check your filing and payment dates on our
 * own", deadlineWatching in the plan rules). Neither the plan rules nor the plan words name an
 * interval, so weekly is an assumption, written down in docs/ENGINE-STATUS.md.
 */
export function monitoringCadenceDays(plan: PlanCode): number | null {
  return PLAN_ENTITLEMENTS[plan].deadlineWatching ? 7 : null;
}

export interface MonitoringRun {
  switchedOff: boolean;
  queued: number;
  /** Due, but over the per-organisation or global daily cap. They come up again tomorrow. */
  capped: number;
  /** One company or organisation that failed. The others carried on. */
  failed: number;
}

interface DueCompanies {
  companyIds: string[];
}

/** Companies of one organisation whose last full scan is older than the plan's interval. */
async function dueInOrganisation(deps: AppDeps, organisationId: string, companyIds: string[], now: Date): Promise<DueCompanies> {
  return deps.db.withOrg(organisationId, async (tx) => {
    const [org] = await tx.select({ isDemo: organisation.isDemo }).from(organisation).where(eq(organisation.id, organisationId));
    // The demo organisation holds sample data. It is never re-scanned as if it were real.
    if (!org || org.isDemo) return { companyIds: [] };
    const cadence = monitoringCadenceDays(await planOf(tx, organisationId, deps.config));
    if (cadence === null) return { companyIds: [] };

    const last = await tx
      .select({ companyId: scan.companyId, completedAt: max(scan.completedAt) })
      .from(scan)
      .where(and(inArray(scan.companyId, companyIds), eq(scan.kind, 'full'), isNotNull(scan.finalisedSeq)))
      .groupBy(scan.companyId);
    const active = await tx
      .select({ companyId: scan.companyId })
      .from(scan)
      .where(and(inArray(scan.companyId, companyIds), eq(scan.kind, 'full'), inArray(scan.status, ['queued', 'running'])));
    const busy = new Set(active.map((row) => row.companyId));
    // Followed companies are re-scanned on the same cadence, under the same caps. The team's own
    // companies go first, so a long watchlist never pushes them past the daily cap.
    const held = await tx.select({ id: company.id, relationship: company.relationship }).from(company).where(inArray(company.id, companyIds));
    const followed = new Set(held.filter((row) => row.relationship === 'follow').map((row) => row.id));
    const cutoff = now.getTime() - cadence * DAY_MS;
    return {
      companyIds: last
        .filter((row) => row.completedAt !== null && row.completedAt.getTime() <= cutoff && !busy.has(row.companyId))
        .map((row) => row.companyId)
        .sort((a, b) => Number(followed.has(a)) - Number(followed.has(b)) || a.localeCompare(b)),
    };
  });
}

/**
 * The monitoring.rescan-due job. For organisations on a plan that promises monitoring, queues a
 * normal full scan, marked `monitoring`, for each company whose last full scan is older than the
 * plan's interval: its own companies and the ones it follows, own first. A company is queued at most once a day, so running this twice does nothing
 * the second time. Each organisation and each company is tried on its own: one failure doesn't
 * stop the rest.
 *
 * Cost: the scan reuses a paid vendor's kept answer and pays again only once that answer has
 * expired (see runSources). The daily caps bound how many scans this can start at all.
 */
export async function queueDueMonitoringScans(
  deps: AppDeps,
  /** Limits the run to these organisations. The scheduled job passes nothing; tests use it to stay in their own data. */
  options: { onlyOrganisations?: readonly string[] } = {},
): Promise<MonitoringRun> {
  const run: MonitoringRun = { switchedOff: false, queued: 0, capped: 0, failed: 0 };
  if (!deps.config.monitoring.enabled) return { ...run, switchedOff: true };
  const now = deps.now();
  const { maxScansPerOrgPerDay, maxScansPerDay } = deps.config.monitoring;

  // Ids only: which companies have been scanned, and whose they are.
  const only = options.onlyOrganisations;
  if (only && only.length === 0) return run;
  const rows = await deps.db.withSystem((tx) =>
    tx
      .select({ companyId: companySweep.companyId, tenantId: companySweep.tenantId })
      .from(companySweep)
      .where(only ? inArray(companySweep.tenantId, [...only]) : undefined)
      .orderBy(companySweep.tenantId, companySweep.companyId),
  );
  const byTenant = new Map<string, string[]>();
  for (const row of rows) byTenant.set(row.tenantId, [...(byTenant.get(row.tenantId) ?? []), row.companyId]);

  for (const [organisationId, companyIds] of byTenant) {
    let due: string[];
    try {
      due = (await dueInOrganisation(deps, organisationId, companyIds, now)).companyIds;
    } catch {
      run.failed += 1;
      continue;
    }
    for (const companyId of due) {
      try {
        // Once a day per company, whatever happens next: this is what makes a second run harmless.
        const once = await deps.limiter.hit(`monitoring:company:${companyId}`, 1, DAY_SECONDS);
        if (!once.allowed) continue;
        const org = await deps.limiter.hit(`monitoring:org:${organisationId}`, maxScansPerOrgPerDay, DAY_SECONDS);
        if (!org.allowed) {
          run.capped += 1;
          continue;
        }
        const global = await deps.limiter.hit('monitoring:global', maxScansPerDay, DAY_SECONDS);
        if (!global.allowed) {
          run.capped += 1;
          continue;
        }
        const scanId = await startFullScan(deps, organisationId, companyId, { trigger: MONITORING_TRIGGER });
        await deps.db.withOrg(organisationId, (tx) =>
          writeAudit(tx, { organisationId, action: 'monitoring.scan_queued', target: scanId, metadata: { companyId } }),
        );
        run.queued += 1;
      } catch {
        run.failed += 1;
      }
    }
  }
  return run;
}

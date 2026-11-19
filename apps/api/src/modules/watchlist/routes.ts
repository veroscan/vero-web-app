import { contract, PLAN_ENTITLEMENTS, type Company, type WatchlistItem } from '@vero/shared';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { isUniqueViolation, schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError, errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import { writeAudit } from '../audit/service';
import { isOwned } from '../companies/ownership';
import { toDto } from '../companies/routes';
import { finishedScans, latestChange, snapshotsFor, snapshotView } from '../monitoring/summary';
import { planOf } from '../plans/service';
import { coverageFor } from '../scans/facts';
import { startFullScan } from '../scans/pipeline';

/**
 * The watchlist (owner's decision, 19 Nov 2026): anyone can follow any company, in any country,
 * and see its public record. A followed company is a row of the follower's own organisation,
 * marked `follow`, under the same row-level security as everything else: nothing is shared
 * across organisations, and the follower can't add evidence for it.
 */

const { company, scan } = schema;

/** Each follow starts a scan, which can reach a paid source, so adding is limited per hour too. */
export const FOLLOWS_PER_ORG_PER_HOUR = 30;
export const FOLLOW_TRIGGER = 'follow';

function limitReached(limit: number): AppError {
  return new AppError(
    403,
    'follow_limit_reached',
    `Your plan lets you follow ${limit} ${limit === 1 ? 'company' : 'companies'}. Stop following one to add another, or move to a bigger plan.`,
  );
}

function alreadyThere(owned: boolean): AppError {
  return new AppError(
    409,
    'company_exists',
    owned ? 'This company is already one of yours, so there is no need to follow it.' : 'You already follow this company.',
  );
}

async function followCount(tx: Tx): Promise<number> {
  const [row] = await tx.select({ count: sql<number>`count(*)::int` }).from(company).where(eq(company.relationship, 'follow'));
  return row?.count ?? 0;
}

async function watchlistItem(tx: Tx, row: typeof company.$inferSelect, exact: boolean, deps: AppDeps, busy: ReadonlySet<string>): Promise<WatchlistItem> {
  const [latest] = await finishedScans(tx, row.id, { limit: 1 });
  const snapshot = latest ? (await snapshotsFor(tx, [latest.id])).get(latest.id) : undefined;
  const view = snapshotView(snapshot, exact);
  return {
    companyId: row.id,
    legalName: row.legalName,
    registrationNumber: row.registrationNumber,
    incorporationCountry: row.incorporationCountry,
    countryCoverage: coverageFor(row.incorporationCountry, deps.connectors),
    score: view.score,
    statusWord: view.statusWord,
    coverage: view.coverage,
    lastScannedAt: latest ? (latest.completedAt ?? latest.createdAt).toISOString() : null,
    scanInProgress: busy.has(row.id),
    lastChange: latest ? await latestChange(tx, row.id, exact) : null,
    followedAt: row.createdAt.toISOString(),
  };
}

export function registerWatchlistRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.watchlist.list, { auth: 'org', permission: 'companies.read' }, async ({ org }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const entitlements = PLAN_ENTITLEMENTS[await planOf(tx, org.organisationId, deps.config)];
      const rows = await tx.select().from(company).where(eq(company.relationship, 'follow')).orderBy(asc(company.createdAt), asc(company.id));
      const active = rows.length === 0 ? [] : await tx
        .select({ companyId: scan.companyId })
        .from(scan)
        .where(and(inArray(scan.companyId, rows.map((row) => row.id)), inArray(scan.status, ['queued', 'running'])));
      const busy = new Set(active.map((item) => item.companyId));
      // One after another: a transaction has one connection.
      const companies: WatchlistItem[] = [];
      for (const row of rows) companies.push(await watchlistItem(tx, row, entitlements.exactScore, deps, busy));
      return { companies, used: rows.length, limit: entitlements.followLimit };
    }),
  );

  defineRoute(app, deps, contract.watchlist.add, { auth: 'org', permission: 'companies.write' }, async ({ org, session, body, meta }) => {
    await deps.limiter.enforce(`watchlist-add:${org.organisationId}`, FOLLOWS_PER_ORG_PER_HOUR, 3600);
    let created: Company;
    try {
      created = await deps.db.withOrg(org.organisationId, async (tx) => {
        // One add at a time per organisation, so two at once can't both squeeze under the limit.
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${`watchlist:${org.organisationId}`}, 0))`);
        const limit = PLAN_ENTITLEMENTS[await planOf(tx, org.organisationId, deps.config)].followLimit;

        const sameCountry = eq(company.incorporationCountry, body.incorporationCountry);
        const [existing] = await tx
          .select({ relationship: company.relationship })
          .from(company)
          .where(
            and(
              sameCountry,
              body.registrationNumber
                ? eq(company.registrationNumber, body.registrationNumber)
                : sql`lower(${company.legalName}) = lower(${body.legalName}) AND ${company.registrationNumber} IS NULL`,
            ),
          )
          .limit(1);
        if (existing) throw alreadyThere(isOwned(existing));
        if ((await followCount(tx)) >= limit) throw limitReached(limit);

        const [row] = await tx
          .insert(company)
          .values({
            organisationId: org.organisationId,
            legalName: body.legalName,
            incorporationCountry: body.incorporationCountry,
            registrationNumber: body.registrationNumber ?? null,
            entityType: body.entityType ?? null,
            website: body.website ?? null,
            createdBy: session.userId,
            relationship: 'follow',
          })
          .returning();
        if (!row) throw errors.internal();
        // The country, not the name: who an organisation follows is its own business.
        await writeAudit(tx, {
          organisationId: org.organisationId,
          actorId: session.userId,
          action: 'company.followed',
          target: row.id,
          metadata: { country: row.incorporationCountry },
          meta,
        });
        return toDto(row, [], deps.connectors);
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw alreadyThere(false);
      throw error;
    }
    // A public-data scan: the follower has no answers or documents for it, so those checks stay "to check".
    const scanId = await startFullScan(deps, org.organisationId, created.id, { trigger: FOLLOW_TRIGGER, requestedBy: session.userId });
    return { company: created, scanId };
  });

  defineRoute(app, deps, contract.watchlist.remove, { auth: 'org', permission: 'companies.write' }, async ({ org, session, params, meta }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const [row] = await tx.select().from(company).where(eq(company.id, params.companyId));
      if (!row) throw errors.notFound('That company');
      if (isOwned(row)) throw errors.invalidState("This is one of your own companies, not one you follow, so it can't be taken off the watchlist.");
      // Its scans, facts and findings go with it. It never had answers or documents.
      await tx.delete(company).where(eq(company.id, row.id));
      await writeAudit(tx, {
        organisationId: org.organisationId,
        actorId: session.userId,
        action: 'company.unfollowed',
        target: row.id,
        metadata: { country: row.incorporationCountry },
        meta,
      });
      return { ok: true as const };
    }),
  );
}

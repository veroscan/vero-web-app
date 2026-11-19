import { loadPack, type Jurisdiction } from '@vero/rules';
import { contract, type PlanCode, type RulePack } from '@vero/shared';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema, withAdminDirectory, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute, type RequestMeta } from '../../http/route';
import { writeAudit } from '../audit/service';
import { notifyOrganisation } from '../notifications/service';
import { referenceStatus } from '../reference/service';

const { rulePack, rule, connectorHealth, user, membership, organisation, platformStaff, plan } = schema;
const ADMIN = { auth: 'staff' as const, staffRoles: ['admin' as const] };

function packDto(row: typeof rulePack.$inferSelect, ruleCount: number): RulePack {
  const code: Jurisdiction = row.jurisdictionCode;
  const pack = loadPack(code);
  return {
    jurisdiction: code,
    name: pack.name,
    version: row.version,
    status: row.status as RulePack['status'],
    approvedBy: row.approvedBy,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    ruleCount,
    needsReviewCount: pack.version === row.version ? pack.rules.filter((item) => item.confidence === 'needs_review').length : 0,
  };
}

async function listPacks(tx: Tx): Promise<RulePack[]> {
  const rows = await tx.select().from(rulePack).orderBy(asc(rulePack.jurisdictionCode), asc(rulePack.version));
  const counts = await tx.select({ id: rule.rulePackId, n: sql<number>`count(*)::int` }).from(rule).groupBy(rule.rulePackId);
  const byId = new Map(counts.map((row) => [row.id, row.n]));
  return rows.map((row) => packDto(row, byId.get(row.id) ?? 0));
}

/** Moves an organisation to a plan. Findings don't depend on the plan, so nothing is re-scored. */
export async function changePlan(deps: AppDeps, organisationId: string, code: PlanCode, actorId: string, meta: RequestMeta): Promise<void> {
  const changed = await deps.db.withOrg(organisationId, async (tx) => {
    const [target] = await tx.select({ id: plan.id }).from(plan).where(eq(plan.code, code));
    if (!target) throw errors.internal();
    const rows = await tx.update(organisation).set({ planId: target.id }).where(eq(organisation.id, organisationId)).returning({ id: organisation.id });
    if (rows.length === 0) return false;
    await writeAudit(tx, { organisationId, actorId, action: 'plan.changed', target: organisationId, metadata: { plan: code }, meta });
    await notifyOrganisation(tx, organisationId, { kind: 'system', title: `You're now on the ${code} plan` });
    return true;
  });
  if (!changed) throw errors.notFound('That organisation');
}

export function registerAdminRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.admin.rulePacks, ADMIN, async () => ({ packs: await deps.db.withSystem(listPacks) }));

  defineRoute(app, deps, contract.admin.approveRulePack, ADMIN, async ({ staff, params, body, meta }) =>
    deps.db.withSystem(async (tx) => {
      const [existing] = await tx
        .select()
        .from(rulePack)
        .where(and(eq(rulePack.jurisdictionCode, params.jurisdiction), eq(rulePack.version, params.version)));
      if (!existing) throw errors.notFound('That rule pack');
      if (existing.status !== 'draft') throw errors.invalidState(`This rule pack is already ${existing.status}.`);
      await tx.execute(sql`select approve_rule_pack(${params.jurisdiction}, ${params.version}, ${body.approverName})`);
      await writeAudit(tx, {
        actorId: staff.userId,
        action: 'rule_pack.approved',
        target: `${params.jurisdiction}@${params.version}`,
        // The name is what the approval rests on, and it is a professional sign-off.
        metadata: { approverName: body.approverName },
        meta,
      });
      const packs = await listPacks(tx);
      const updated = packs.find((pack) => pack.jurisdiction === params.jurisdiction && pack.version === params.version);
      if (!updated) throw errors.internal();
      return updated;
    }),
  );

  defineRoute(app, deps, contract.admin.connectors, ADMIN, async () => {
    const rows = await deps.db.withSystem((tx) => tx.select().from(connectorHealth));
    const byId = new Map(rows.map((row) => [row.connectorId, row]));
    return {
      mode: deps.config.connectorMode,
      referenceData: await referenceStatus(deps),
      connectors: deps.connectors.map((connector) => {
        const row = byId.get(connector.id);
        return {
          id: connector.id,
          sourceName: connector.sourceName,
          jurisdictions: [...connector.jurisdictions],
          lastStatus: row?.lastStatus ?? null,
          lastCheckedAt: row?.lastCheckedAt.toISOString() ?? null,
          lastOkAt: row?.lastOkAt?.toISOString() ?? null,
          lastFailureAt: row?.lastFailureAt?.toISOString() ?? null,
          consecutiveFailures: row?.consecutiveFailures ?? 0,
        };
      }),
    };
  });

  defineRoute(app, deps, contract.admin.users, ADMIN, async ({ staff, query, meta }) => {
    const { users, hasMore } = await withAdminDirectory(deps.db, async (tx) => {
      const rows = await tx.select().from(user).orderBy(asc(user.createdAt), asc(user.id)).limit(query.limit + 1).offset(query.offset);
      const page = rows.slice(0, query.limit);
      const ids = page.map((row) => row.id);
      const memberships = ids.length === 0 ? [] : await tx
        .select({ userId: membership.userId, role: membership.role, id: organisation.id, name: organisation.name, isDemo: organisation.isDemo })
        .from(membership)
        .innerJoin(organisation, eq(organisation.id, membership.organisationId))
        .where(inArray(membership.userId, ids));
      const staffRows = ids.length === 0 ? [] : await tx.select().from(platformStaff).where(inArray(platformStaff.userId, ids));
      const staffRoles = new Map(staffRows.map((row) => [row.userId, row.role]));
      await writeAudit(tx, { actorId: staff.userId, action: 'admin.users_viewed', metadata: { rows: page.length }, meta });
      return {
        hasMore: rows.length > query.limit,
        // Who and where only: no sign-in details, no two-step secrets.
        users: page.map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          staffRole: (staffRoles.get(row.id) ?? null) as 'lawyer' | 'admin' | null,
          organisations: memberships
            .filter((item) => item.userId === row.id)
            .map((item) => ({ id: item.id, name: item.name, role: item.role, isDemo: item.isDemo })),
        })),
      };
    });
    return { users, hasMore };
  });

  defineRoute(app, deps, contract.admin.setPlan, ADMIN, async ({ staff, params, body, meta }) => {
    await changePlan(deps, params.organisationId, body.plan, staff.userId, meta);
    return { organisationId: params.organisationId, plan: body.plan };
  });

  defineRoute(app, deps, contract.admin.grantStaff, ADMIN, async ({ staff, body, meta }) =>
    deps.db.withSystem(async (tx) => {
      const [person] = await tx.select({ id: user.id }).from(user).where(eq(user.id, body.userId));
      if (!person) throw errors.notFound('That person');
      await tx
        .insert(platformStaff)
        .values({ userId: body.userId, role: body.role, grantedBy: staff.userId })
        .onConflictDoUpdate({ target: platformStaff.userId, set: { role: body.role, grantedBy: staff.userId } });
      await writeAudit(tx, { actorId: staff.userId, action: 'staff.granted', target: body.userId, metadata: { role: body.role }, meta });
      return { ok: true as const };
    }),
  );

  defineRoute(app, deps, contract.admin.revokeStaff, ADMIN, async ({ staff, params, meta }) =>
    deps.db.withSystem(async (tx) => {
      if (params.userId === staff.userId) throw errors.invalidState("You can't remove your own access. Ask another admin.");
      const rows = await tx.delete(platformStaff).where(eq(platformStaff.userId, params.userId)).returning({ id: platformStaff.userId });
      if (rows.length === 0) throw errors.notFound('That person');
      await writeAudit(tx, { actorId: staff.userId, action: 'staff.revoked', target: params.userId, meta });
      return { ok: true as const };
    }),
  );
}

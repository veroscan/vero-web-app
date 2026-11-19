import { computeDeadlines, daysBetween, toIsoDate } from '@vero/rules';
import { contract, type Deadline, type DeadlineListResponse } from '@vero/shared';
import { and, asc, eq, inArray, lte, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import { writeAudit } from '../audit/service';
import { requireOwnedCompany } from '../companies/ownership';
import { createNotification } from '../notifications/service';
import { deadlineState } from '../reports/results';
import { connectorsForSelection, incorporatedOn, latestSources, loadEngineFacts, selectCompanyPacks, sourceStates, stageOf, type CompanyRow } from '../scans/facts';

const { deadline, company: companyTable, membership, companySweep } = schema;

function toDto(row: typeof deadline.$inferSelect, companyName: string, today: string): Deadline {
  return {
    id: row.id,
    companyId: row.companyId,
    companyName,
    ruleKey: row.ruleKey,
    title: row.title,
    layer: row.layer,
    dueOn: row.dueOn,
    state: deadlineState(row.status, row.dueOn, today),
    daysUntil: daysBetween(today, row.dueOn),
    monitoring: (row.monitoring ?? 'reminder') as Deadline['monitoring'],
    howWeTrack: row.howWeTrack ?? "We'll remind you and ask for proof",
    basis: row.basis,
    needsReview: row.needsReview,
  };
}

/** Obligations we know about but can't put a date on yet, worked out from current facts. */
async function undatedFor(deps: AppDeps, tx: Tx, company: CompanyRow, now: Date): Promise<DeadlineListResponse['undated']> {
  const selection = await selectCompanyPacks(tx, company);
  const relevant = connectorsForSelection(deps.connectors, company, selection);
  const { values } = await loadEngineFacts(tx, company.id);
  const states = sourceStates(relevant, await latestSources(tx, company.id));
  const result = computeDeadlines(selection.packs, {
    facts: values,
    company: {
      incorporated_on: incorporatedOn(company, values),
      year_end: company.yearEndMonth && company.yearEndDay ? { month: company.yearEndMonth, day: company.yearEndDay } : null,
    },
    stage: stageOf(company, values),
    as_of: now,
    unavailable_prefixes: Object.entries(states).filter(([, state]) => state !== 'ok').map(([prefix]) => prefix),
  });
  return result.undated.map((item) => ({
    companyId: company.id,
    ruleKey: item.rule_id,
    title: item.title,
    monitoring: item.monitoring,
    howWeTrack: item.how_we_track,
    waitingOn: item.waiting_on,
  }));
}

const REMINDER_BANDS = [
  { band: 'overdue', atMostDays: -1 },
  { band: '1d', atMostDays: 1 },
  { band: '7d', atMostDays: 7 },
  { band: '30d', atMostDays: 30 },
] as const;

function reminderWords(band: (typeof REMINDER_BANDS)[number]['band'], title: string, dueOn: string): { title: string; body: string } {
  switch (band) {
    case 'overdue':
      return { title: `${title} is overdue`, body: `It was due on ${dueOn}.` };
    case '1d':
      return { title: `${title} is due tomorrow`, body: `It is due on ${dueOn}.` };
    case '7d':
      return { title: `${title} is due within a week`, body: `It is due on ${dueOn}.` };
    case '30d':
      return { title: `${title} is due within a month`, body: `It is due on ${dueOn}.` };
  }
}

/**
 * Tells the people running each company about dates coming up. Runs on a timer. Each
 * deadline can only produce one notification per band, however many times this runs.
 */
export async function sendDeadlineReminders(deps: AppDeps): Promise<number> {
  const now = deps.now();
  const today = toIsoDate(now);
  const horizon = toIsoDate(new Date(now.getTime() + 30 * 86_400_000));
  const organisations = await deps.db.withSystem((tx) =>
    tx.selectDistinct({ organisationId: companySweep.tenantId }).from(companySweep),
  );
  let sent = 0;
  for (const { organisationId } of organisations) {
    await deps.db.withOrg(organisationId, async (tx) => {
      const rows = await tx
        .select({ row: deadline, name: companyTable.legalName })
        .from(deadline)
        .innerJoin(companyTable, eq(companyTable.id, deadline.companyId))
        // Followed companies are left out: followers hear of changes through watchlist alerts only.
        .where(and(eq(deadline.status, 'upcoming'), lte(deadline.dueOn, horizon), eq(companyTable.relationship, 'own')));
      if (rows.length === 0) return;
      const people = await tx.select({ userId: membership.userId }).from(membership).where(inArray(membership.role, ['owner', 'admin']));
      for (const { row, name } of rows) {
        const days = daysBetween(today, row.dueOn);
        const band = REMINDER_BANDS.find((item) => days <= item.atMostDays)?.band;
        if (!band) continue;
        const words = reminderWords(band, row.title, row.dueOn);
        for (const person of people) {
          await createNotification(tx, {
            organisationId,
            userId: person.userId,
            kind: 'deadline',
            title: words.title,
            body: `${name}. ${words.body}`,
            link: '/deadlines',
            dedupeKey: `deadline:${row.id}:${band}`,
          });
          sent += 1;
        }
      }
    });
  }
  return sent;
}

export function registerDeadlineRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.deadlines.list, { auth: 'org', permission: 'companies.read' }, async ({ org, query }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const now = deps.now();
      const today = toIsoDate(now);
      const companies = await tx
        .select()
        .from(companyTable)
        .where(query.companyId ? eq(companyTable.id, query.companyId) : undefined);
      if (query.companyId && companies.length === 0) throw errors.notFound('That company');
      const names = new Map(companies.map((item) => [item.id, item.legalName]));
      const rows = await tx
        .select()
        .from(deadline)
        .where(and(query.companyId ? eq(deadline.companyId, query.companyId) : undefined, sql`${deadline.status} IN ('upcoming', 'done')`))
        .orderBy(asc(deadline.dueOn), asc(deadline.id));
      const deadlines = rows
        .map((row) => toDto(row, names.get(row.companyId) ?? '', today))
        .filter((item) => query.state === undefined || item.state === query.state);
      const undated: DeadlineListResponse['undated'] = [];
      for (const company of companies) undated.push(...(await undatedFor(deps, tx, company, now)));
      return { deadlines, undated };
    }),
  );

  defineRoute(app, deps, contract.deadlines.done, { auth: 'org', permission: 'deadlines.write' }, async ({ org, session, params, meta }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const [row] = await tx.select().from(deadline).where(eq(deadline.id, params.deadlineId));
      if (!row) throw errors.notFound('That deadline');
      await requireOwnedCompany(tx, row.companyId);
      // We read this one from the source, so saying it's done wouldn't make it so.
      if (row.monitoring === 'auto') throw errors.invalidState(`We check this one ourselves. ${row.howWeTrack ?? ''}`.trim());
      const [updated] = await tx.update(deadline).set({ status: 'done', completedAt: deps.now() }).where(eq(deadline.id, row.id)).returning();
      if (!updated) throw errors.internal();
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'deadline.done', target: row.id, meta });
      const [company] = await tx.select({ name: companyTable.legalName }).from(companyTable).where(eq(companyTable.id, row.companyId));
      return toDto(updated, company?.name ?? '', toIsoDate(deps.now()));
    }),
  );

  defineRoute(app, deps, contract.deadlines.undone, { auth: 'org', permission: 'deadlines.write' }, async ({ org, session, params, meta }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const [row] = await tx.select().from(deadline).where(eq(deadline.id, params.deadlineId));
      if (!row) throw errors.notFound('That deadline');
      await requireOwnedCompany(tx, row.companyId);
      const [company] = await tx.select({ name: companyTable.legalName }).from(companyTable).where(eq(companyTable.id, row.companyId));
      // Asking twice changes nothing and writes no second audit line.
      if (row.status !== 'done') return toDto(row, company?.name ?? '', toIsoDate(deps.now()));
      const [updated] = await tx.update(deadline).set({ status: 'upcoming', completedAt: null }).where(eq(deadline.id, row.id)).returning();
      if (!updated) throw errors.internal();
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'deadline.undone', target: row.id, meta });
      return toDto(updated, company?.name ?? '', toIsoDate(deps.now()));
    }),
  );
}

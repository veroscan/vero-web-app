import { computeDeadlines, daysBetween, toIsoDate } from '@vero/rules';
import { contract, STANDARD_REMINDER_DAYS, type Deadline, type DeadlineListResponse, type DeadlineReminders, type ReminderDefaultsResponse } from '@vero/shared';
import { and, asc, eq, inArray, isNull, lte, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import { enforceWriteLimit } from '../../http/write-limit';
import { writeAudit } from '../audit/service';
import { requireOwnedCompany } from '../companies/ownership';
import { notifyPeople, organisationLeads, sendNoticeEmails, type NoticeEmail } from '../notifications/service';
import { deadlineState } from '../reports/results';
import { connectorsForSelection, incorporatedOn, latestSources, loadEngineFacts, selectCompanyPacks, sourceStates, stageOf, type CompanyRow } from '../scans/facts';

const { deadline, company: companyTable, companySweep, deadlineReminderSetting, fact } = schema;

const DAY_MS = 86_400_000;

/**
 * "Last filed", only where the register itself holds that date. Each entry says what the date
 * is, because a register's own date isn't always the day the filing arrived. A deadline whose
 * rule isn't here has no such date, and says null rather than a guess.
 */
const LAST_FILED: Readonly<Record<string, { fact: string; note: string }>> = {
  'GB.CORP.CONFIRMATION_STATEMENT': {
    fact: 'registry.uk.companies_house.confirmation_last_made_up_to',
    note: 'The date the last confirmation statement was made up to, from Companies House.',
  },
  'IE.CORP.ANNUAL_RETURN': {
    fact: 'registry.ie.cro.last_annual_return_on',
    note: 'The date of the last annual return, from the Companies Registration Office.',
  },
  'NZ.CORP.ANNUAL_RETURN': {
    fact: 'registry.nz.companies.annual_return_last_filed_on',
    note: 'The date the last annual return was filed, from the New Zealand Companies Office.',
  },
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** What a deadline row needs beyond its own columns: reminder choices, who owns the company, and register dates. */
interface Extras {
  own: ReadonlySet<string>;
  perDeadline: ReadonlyMap<string, number[]>;
  organisationDefault: number[] | null;
  /** company id + fact key, to the date the register gave. */
  filed: ReadonlyMap<string, string>;
}

async function reminderSettings(tx: Tx): Promise<Pick<Extras, 'perDeadline' | 'organisationDefault'>> {
  const rows = await tx.select({ deadlineId: deadlineReminderSetting.deadlineId, leadDays: deadlineReminderSetting.leadDays }).from(deadlineReminderSetting);
  const perDeadline = new Map<string, number[]>();
  let organisationDefault: number[] | null = null;
  for (const row of rows) {
    if (row.deadlineId) perDeadline.set(row.deadlineId, row.leadDays);
    else organisationDefault = row.leadDays;
  }
  return { perDeadline, organisationDefault };
}

async function loadExtras(tx: Tx, companies: readonly { id: string; relationship: string }[]): Promise<Extras> {
  const ids = companies.map((item) => item.id);
  const keys = Object.values(LAST_FILED).map((item) => item.fact);
  const rows = ids.length === 0 ? [] : await tx
    .select({ companyId: fact.companyId, key: fact.key, value: fact.value })
    .from(fact)
    .where(and(inArray(fact.companyId, ids), inArray(fact.key, keys), eq(fact.origin, 'connector')));
  const filed = new Map<string, string>();
  for (const row of rows) if (typeof row.value === 'string' && ISO_DATE.test(row.value)) filed.set(`${row.companyId}|${row.key}`, row.value);
  return { ...(await reminderSettings(tx)), own: new Set(companies.filter((item) => item.relationship === 'own').map((item) => item.id)), filed };
}

function leadDaysFor(deadlineId: string, settings: Pick<Extras, 'perDeadline' | 'organisationDefault'>): Pick<DeadlineReminders, 'leadDays' | 'source'> {
  const own = settings.perDeadline.get(deadlineId);
  if (own) return { leadDays: own, source: 'deadline' };
  if (settings.organisationDefault) return { leadDays: settings.organisationDefault, source: 'organisation' };
  return { leadDays: [...STANDARD_REMINDER_DAYS], source: 'standard' };
}

/** The lead time whose reminder is due now: the nearest one already reached. Null before the first. */
export function dueLead(leadDays: readonly number[], daysUntil: number): number | null {
  const reached = leadDays.filter((lead) => daysUntil <= lead);
  return reached.length === 0 ? null : Math.min(...reached);
}

function remindersFor(row: typeof deadline.$inferSelect, today: string, extras: Extras): DeadlineReminders | null {
  // Followers hear of changes through watchlist alerts only, so no reminders are sent for these.
  if (!extras.own.has(row.companyId)) return null;
  const chosen = leadDaysFor(row.id, extras);
  const days = daysBetween(today, row.dueOn);
  const ahead = row.status === 'upcoming' ? chosen.leadDays.filter((lead) => lead < days) : [];
  const next = ahead.length === 0 ? null : toIsoDate(new Date(Date.parse(`${row.dueOn}T00:00:00Z`) - Math.max(...ahead) * DAY_MS));
  return { ...chosen, nextReminderOn: next };
}

function toDto(row: typeof deadline.$inferSelect, companyName: string, today: string, extras: Extras): Deadline {
  const lastFiled = row.ruleKey ? LAST_FILED[row.ruleKey] : undefined;
  const lastFiledOn = lastFiled ? (extras.filed.get(`${row.companyId}|${lastFiled.fact}`) ?? null) : null;
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
    reminders: remindersFor(row, today, extras),
    lastFiledOn,
    lastFiledNote: lastFiledOn && lastFiled ? lastFiled.note : null,
  };
}

/** One deadline with everything the screen shows, for the routes that change a single date. */
async function oneDto(tx: Tx, row: typeof deadline.$inferSelect, today: string): Promise<Deadline> {
  const [company] = await tx.select({ id: companyTable.id, name: companyTable.legalName, relationship: companyTable.relationship }).from(companyTable).where(eq(companyTable.id, row.companyId));
  return toDto(row, company?.name ?? '', today, await loadExtras(tx, company ? [company] : []));
}

function defaultsDto(organisationDefault: number[] | null): ReminderDefaultsResponse {
  return {
    leadDays: organisationDefault ?? [...STANDARD_REMINDER_DAYS],
    source: organisationDefault ? 'organisation' : 'standard',
    standardLeadDays: [...STANDARD_REMINDER_DAYS],
    channels: ['in_app', 'email'],
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

function reminderWords(lead: number | 'overdue', days: number, title: string, dueOn: string): { title: string; body: string } {
  if (lead === 'overdue') return { title: `${title} is overdue`, body: `It was due on ${dueOn}.` };
  const body = `It is due on ${dueOn}.`;
  if (days === 0) return { title: `${title} is due today`, body };
  if (days === 1) return { title: `${title} is due tomorrow`, body };
  if (lead === 7) return { title: `${title} is due within a week`, body };
  if (lead === 30) return { title: `${title} is due within a month`, body };
  return { title: `${title} is due in ${days} days`, body };
}

/**
 * Tells the people running each company about dates coming up, in the app and by email. Runs on
 * a timer. The lead times are the date's own, else the organisation's default, else 30, 7 and 1
 * days. Each deadline can only produce one reminder per lead time, however many times this
 * runs: the notification's dedupe key holds both, and an email goes only with a new notification.
 * An overdue date is always flagged, once.
 */
export async function sendDeadlineReminders(deps: AppDeps): Promise<number> {
  const now = deps.now();
  const today = toIsoDate(now);
  const organisations = await deps.db.withSystem((tx) =>
    tx.selectDistinct({ organisationId: companySweep.tenantId }).from(companySweep),
  );
  let sent = 0;
  for (const { organisationId } of organisations) {
    const emails = await deps.db.withOrg(organisationId, async (tx): Promise<NoticeEmail[]> => {
      const settings = await reminderSettings(tx);
      const longest = Math.max(...STANDARD_REMINDER_DAYS, ...(settings.organisationDefault ?? []), ...[...settings.perDeadline.values()].flat());
      const horizon = toIsoDate(new Date(now.getTime() + longest * DAY_MS));
      const rows = await tx
        .select({ row: deadline, name: companyTable.legalName })
        .from(deadline)
        .innerJoin(companyTable, eq(companyTable.id, deadline.companyId))
        // Followed companies are left out: followers hear of changes through watchlist alerts only.
        .where(and(eq(deadline.status, 'upcoming'), lte(deadline.dueOn, horizon), eq(companyTable.relationship, 'own')));
      if (rows.length === 0) return [];
      const people = await organisationLeads(tx);
      const owed: NoticeEmail[] = [];
      for (const { row, name } of rows) {
        const days = daysBetween(today, row.dueOn);
        const lead = days < 0 ? 'overdue' : dueLead(leadDaysFor(row.id, settings).leadDays, days);
        if (lead === null) continue;
        const words = reminderWords(lead, days, row.title, row.dueOn);
        owed.push(
          ...(await notifyPeople(tx, organisationId, people, {
            kind: 'deadline',
            title: words.title,
            body: `${name}. ${words.body}`,
            link: '/deadlines',
            dedupeKey: `deadline:${row.id}:${lead === 'overdue' ? lead : `${lead}d`}`,
          })),
        );
        sent += people.length;
      }
      return owed;
    });
    await sendNoticeEmails(deps, emails);
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
      const extras = await loadExtras(tx, companies);
      const rows = await tx
        .select()
        .from(deadline)
        .where(and(query.companyId ? eq(deadline.companyId, query.companyId) : undefined, sql`${deadline.status} IN ('upcoming', 'done')`))
        .orderBy(asc(deadline.dueOn), asc(deadline.id));
      const deadlines = rows
        .map((row) => toDto(row, names.get(row.companyId) ?? '', today, extras))
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
      return oneDto(tx, updated, toIsoDate(deps.now()));
    }),
  );

  defineRoute(app, deps, contract.deadlines.undone, { auth: 'org', permission: 'deadlines.write' }, async ({ org, session, params, meta }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const [row] = await tx.select().from(deadline).where(eq(deadline.id, params.deadlineId));
      if (!row) throw errors.notFound('That deadline');
      await requireOwnedCompany(tx, row.companyId);
      // Asking twice changes nothing and writes no second audit line.
      if (row.status !== 'done') return oneDto(tx, row, toIsoDate(deps.now()));
      const [updated] = await tx.update(deadline).set({ status: 'upcoming', completedAt: null }).where(eq(deadline.id, row.id)).returning();
      if (!updated) throw errors.internal();
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'deadline.undone', target: row.id, meta });
      return oneDto(tx, updated, toIsoDate(deps.now()));
    }),
  );

  // ---- Reminders ----

  defineRoute(app, deps, contract.deadlines.reminderDefaults, { auth: 'org', permission: 'companies.read' }, async ({ org }) =>
    deps.db.withOrg(org.organisationId, async (tx) => defaultsDto((await reminderSettings(tx)).organisationDefault)),
  );

  defineRoute(app, deps, contract.deadlines.setReminderDefaults, { auth: 'org', permission: 'deadlines.write' }, async ({ org, session, body, meta }) => {
    await enforceWriteLimit(deps, 'deadline-reminders', session.userId);
    return deps.db.withOrg(org.organisationId, async (tx) => {
      // One writer at a time per organisation, so two saves at once can't both insert the default.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${`reminders:${org.organisationId}`}, 0))`);
      await tx.delete(deadlineReminderSetting).where(isNull(deadlineReminderSetting.deadlineId));
      if (body.leadDays !== null) {
        await tx.insert(deadlineReminderSetting).values({ organisationId: org.organisationId, deadlineId: null, leadDays: body.leadDays, setBy: session.userId });
      }
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'deadline.reminder_defaults_set', metadata: { leadDays: body.leadDays }, meta });
      return defaultsDto(body.leadDays);
    });
  });

  defineRoute(app, deps, contract.deadlines.setReminders, { auth: 'org', permission: 'deadlines.write' }, async ({ org, session, params, body, meta }) => {
    await enforceWriteLimit(deps, 'deadline-reminders', session.userId);
    return deps.db.withOrg(org.organisationId, async (tx) => {
      // Locks the deadline's row, so two saves at once for one date go one after the other.
      const [row] = await tx.select().from(deadline).where(eq(deadline.id, params.deadlineId)).for('update');
      if (!row) throw errors.notFound('That deadline');
      await requireOwnedCompany(tx, row.companyId);
      await tx.delete(deadlineReminderSetting).where(eq(deadlineReminderSetting.deadlineId, row.id));
      if (body.leadDays !== null) {
        await tx.insert(deadlineReminderSetting).values({ organisationId: org.organisationId, deadlineId: row.id, leadDays: body.leadDays, setBy: session.userId });
      }
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'deadline.reminders_set', target: row.id, metadata: { leadDays: body.leadDays }, meta });
      return oneDto(tx, row, toIsoDate(deps.now()));
    });
  });
}

import type { Connector } from '@vero/connectors';
import { contract, type Company, type CompanyMarket, type CreateCompanyBody } from '@vero/shared';
import { and, asc, eq, inArray } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { isUniqueViolation, schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError, errors } from '../../http/errors';
import { defineRoute, type RequestMeta } from '../../http/route';
import { writeAudit } from '../audit/service';
import { coverageFor } from '../scans/facts';
import { requestRescore } from '../scans/pipeline';
import { companyHistory } from './history';
import { isOwned, relationshipOf, requireOwned } from './ownership';
import { registerRegistryRoutes } from './registry';

const { company, companyMarket } = schema;

function duplicateCompany(): AppError {
  return new AppError(409, 'company_exists', 'You already have a company with that registration number in that country.');
}

export function toDto(row: typeof company.$inferSelect, markets: CompanyMarket[], connectors: readonly Connector[]): Company {
  return {
    id: row.id,
    organisationId: row.organisationId,
    legalName: row.legalName,
    registrationNumber: row.registrationNumber,
    entityType: row.entityType,
    incorporationCountry: row.incorporationCountry,
    incorporationState: row.incorporationState,
    stage: row.stage as Company['stage'],
    sectors: row.sector,
    website: row.website,
    preIncorporation: row.preIncorporation,
    parentCompanyId: row.parentCompanyId,
    yearEnd: row.yearEndMonth && row.yearEndDay ? { month: row.yearEndMonth, day: row.yearEndDay } : null,
    markets,
    countryCoverage: coverageFor(row.incorporationCountry, connectors),
    relationship: relationshipOf(row),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function marketsFor(tx: Tx, companyIds: string[]): Promise<Map<string, CompanyMarket[]>> {
  const result = new Map<string, CompanyMarket[]>();
  if (companyIds.length === 0) return result;
  const rows = await tx
    .select()
    .from(companyMarket)
    .where(inArray(companyMarket.companyId, companyIds))
    .orderBy(asc(companyMarket.country), asc(companyMarket.kind));
  for (const row of rows) {
    const list = result.get(row.companyId) ?? [];
    list.push({ country: row.country, kind: row.kind as CompanyMarket['kind'] });
    result.set(row.companyId, list);
  }
  return result;
}

async function replaceMarkets(
  tx: Tx,
  organisationId: string,
  companyId: string,
  markets: CompanyMarket[],
): Promise<void> {
  await tx.delete(companyMarket).where(eq(companyMarket.companyId, companyId));
  if (markets.length > 0) {
    await tx.insert(companyMarket).values(markets.map((market) => ({ organisationId, companyId, ...market })));
  }
}

/**
 * The parent must be a company in this same organisation (row-level security sees to that),
 * and one this team owns: a group is the owner's own information about a company.
 */
async function requireParent(tx: Tx, parentId: string): Promise<void> {
  const [parent] = await tx.select({ id: company.id, relationship: company.relationship }).from(company).where(eq(company.id, parentId));
  if (!parent) throw errors.notFound('That parent company');
  requireOwned(parent);
}

async function insertCompany(
  tx: Tx,
  input: { organisationId: string; userId: string; body: CreateCompanyBody; parentCompanyId: string | null; meta: RequestMeta; connectors: readonly Connector[] },
): Promise<Company> {
  const { body, organisationId } = input;
  const [row] = await tx
    .insert(company)
    .values({
      organisationId,
      legalName: body.legalName,
      incorporationCountry: body.incorporationCountry,
      registrationNumber: body.registrationNumber ?? null,
      entityType: body.entityType ?? null,
      stage: body.stage ?? null,
      sector: body.sectors ?? [],
      website: body.website ?? null,
      createdBy: input.userId,
      preIncorporation: body.preIncorporation ?? false,
      parentCompanyId: input.parentCompanyId,
      yearEndMonth: body.yearEnd?.month ?? null,
      yearEndDay: body.yearEnd?.day ?? null,
    })
    .returning();
  if (!row) throw errors.internal();
  await replaceMarkets(tx, organisationId, row.id, body.markets ?? []);
  await writeAudit(tx, { organisationId, actorId: input.userId, action: 'company.created', target: row.id, meta: input.meta });
  const markets = await marketsFor(tx, [row.id]);
  return toDto(row, markets.get(row.id) ?? [], input.connectors);
}

export function registerCompanyRoutes(app: FastifyInstance, deps: AppDeps): void {
  registerRegistryRoutes(app, deps);

  defineRoute(app, deps, contract.companies.list, { auth: 'org', permission: 'companies.read' }, async ({ org, query }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const rows = await tx
        .select()
        .from(company)
        .where(query.relationship === 'all' ? undefined : eq(company.relationship, query.relationship))
        .orderBy(asc(company.createdAt), asc(company.id));
      const markets = await marketsFor(tx, rows.map((row) => row.id));
      return { companies: rows.map((row) => toDto(row, markets.get(row.id) ?? [], deps.connectors)) };
    }),
  );

  defineRoute(
    app,
    deps,
    contract.companies.get,
    { auth: 'org', permission: 'companies.read' },
    async ({ org, params }) =>
      deps.db.withOrg(org.organisationId, async (tx) => {
        const [row] = await tx.select().from(company).where(eq(company.id, params.companyId));
        if (!row) throw errors.notFound('That company');
        const markets = await marketsFor(tx, [row.id]);
        return toDto(row, markets.get(row.id) ?? [], deps.connectors);
      }),
  );

  defineRoute(
    app,
    deps,
    contract.companies.create,
    { auth: 'org', permission: 'companies.write' },
    async ({ org, session, body, meta }) => {
      try {
        return await deps.db.withOrg(org.organisationId, async (tx) => {
          if (body.parentCompanyId) await requireParent(tx, body.parentCompanyId);
          return insertCompany(tx, {
            connectors: deps.connectors,
            organisationId: org.organisationId,
            userId: session.userId,
            body,
            parentCompanyId: body.parentCompanyId ?? null,
            meta,
          });
        });
      } catch (error) {
        if (isUniqueViolation(error)) throw duplicateCompany();
        throw error;
      }
    },
  );

  defineRoute(
    app,
    deps,
    contract.companies.update,
    { auth: 'org', permission: 'companies.write' },
    async ({ org, session, params, body, meta }) => {
      const { markets: newMarkets, sectors, yearEnd, ...fields } = body;
      const changes = {
        ...fields,
        ...(sectors === undefined ? {} : { sector: sectors }),
        ...(yearEnd === undefined ? {} : { yearEndMonth: yearEnd?.month ?? null, yearEndDay: yearEnd?.day ?? null }),
      };
      try {
        const updated = await deps.db.withOrg(org.organisationId, async (tx) => {
          const [existing] = await tx.select().from(company).where(eq(company.id, params.companyId));
          if (!existing) throw errors.notFound('That company');

          let row = existing;
          if (Object.keys(changes).length > 0) {
            const [updated] = await tx.update(company).set(changes).where(eq(company.id, existing.id)).returning();
            if (!updated) throw errors.internal();
            row = updated;
          }
          if (newMarkets) await replaceMarkets(tx, org.organisationId, existing.id, newMarkets);

          await writeAudit(tx, {
            organisationId: org.organisationId,
            actorId: session.userId,
            action: 'company.updated',
            target: existing.id,
            // Which fields changed, not their values.
            metadata: { fields: Object.keys(body) },
            meta,
          });
          const markets = await marketsFor(tx, [existing.id]);
          return toDto(row, markets.get(existing.id) ?? [], deps.connectors);
        });
        await requestRescore(deps, org.organisationId, updated.id, 'company');
        return updated;
      } catch (error) {
        if (isUniqueViolation(error)) throw duplicateCompany();
        throw error;
      }
    },
  );

  defineRoute(app, deps, contract.companies.own, { auth: 'org', permission: 'companies.write' }, async ({ org, session, params, meta }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const [existing] = await tx.select().from(company).where(eq(company.id, params.companyId));
      if (!existing) throw errors.notFound('That company');
      let row = existing;
      // Owning it twice changes nothing and writes no second audit line.
      if (!isOwned(existing)) {
        const [updated] = await tx.update(company).set({ relationship: 'own' }).where(eq(company.id, existing.id)).returning();
        if (!updated) throw errors.internal();
        row = updated;
        // Not yet checked that the claim is genuine (owner's decision, 19 Nov 2026), so it is on the record.
        await writeAudit(tx, {
          organisationId: org.organisationId,
          actorId: session.userId,
          action: 'company.owned',
          target: existing.id,
          metadata: { from: 'follow', to: 'own' },
          meta,
        });
      }
      const markets = await marketsFor(tx, [row.id]);
      return toDto(row, markets.get(row.id) ?? [], deps.connectors);
    }),
  );

  defineRoute(app, deps, contract.companies.history, { auth: 'org', permission: 'results.read' }, async ({ org, params }) =>
    deps.db.withOrg(org.organisationId, (tx) => companyHistory(deps, tx, org.organisationId, params.companyId)),
  );

  defineRoute(app, deps, contract.companies.related, { auth: 'org', permission: 'companies.read' }, async ({ org, params }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const [parent] = await tx.select().from(company).where(eq(company.id, params.companyId));
      if (!parent) throw errors.notFound('That company');
      const rows = await tx
        .select()
        .from(company)
        .where(and(eq(company.parentCompanyId, parent.id)))
        .orderBy(asc(company.createdAt), asc(company.id));
      const markets = await marketsFor(tx, rows.map((row) => row.id));
      return { companies: rows.map((row) => toDto(row, markets.get(row.id) ?? [], deps.connectors)) };
    }),
  );

  defineRoute(
    app,
    deps,
    contract.companies.addRelated,
    { auth: 'org', permission: 'companies.write' },
    async ({ org, session, params, body, meta }) => {
      try {
        return await deps.db.withOrg(org.organisationId, async (tx) => {
          await requireParent(tx, params.companyId);
          return insertCompany(tx, { organisationId: org.organisationId, userId: session.userId, body, parentCompanyId: params.companyId, meta, connectors: deps.connectors });
        });
      } catch (error) {
        if (isUniqueViolation(error)) throw duplicateCompany();
        throw error;
      }
    },
  );
}

import { contract, type SearchResponse } from '@vero/shared';
import { and, asc, ilike, inArray, or } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { defineRoute } from '../../http/route';
import { rankResults, loadResults, type LoadedFinding } from '../reports/results';

const { company, document, deadline } = schema;
const LIMIT = 8;

/** Treats %, _ and \ as plain characters, so a search can't become a pattern. */
function likePattern(text: string): string {
  return `%${text.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}

export function registerSearchRoutes(app: FastifyInstance, deps: AppDeps): void {
  // Row-level security keeps this to one organisation. The plan decides which issues are searchable.
  defineRoute(app, deps, contract.search.query, { auth: 'org', permission: 'results.read' }, async ({ org, query }) =>
    deps.db.withOrg(org.organisationId, async (tx): Promise<SearchResponse> => {
      const needle = query.q.toLowerCase();
      const pattern = likePattern(query.q);
      const companies = await tx.select({ id: company.id, name: company.legalName }).from(company).orderBy(asc(company.createdAt));
      const names = new Map(companies.map((item) => [item.id, item.name]));

      const issues: SearchResponse['issues'] = [];
      let vaultAllowed = false;
      for (const entity of companies) {
        const set = await loadResults(deps, tx, org.organisationId, entity.id, 'company');
        vaultAllowed = set.entitlements.vault;
        // The same list the issues page would show, so search can't reveal anything more.
        const visible: LoadedFinding[] = rankResults(set).map((item) => item.finding);
        for (const item of visible) {
          if (item.detail.headline.toLowerCase().includes(needle) || item.detail.title.toLowerCase().includes(needle)) {
            issues.push({ ruleKey: item.row.ruleKey, companyId: entity.id, title: item.detail.headline, subtitle: `${item.company.legalName}, ${item.detail.area}` });
          }
        }
      }

      const documents = vaultAllowed && companies.length > 0
        ? await tx
            .select({ id: document.id, companyId: document.companyId, title: document.fileName, classification: document.classification })
            .from(document)
            .where(and(inArray(document.companyId, companies.map((item) => item.id)), or(ilike(document.fileName, pattern), ilike(document.classification, pattern))))
            .orderBy(asc(document.createdAt))
            .limit(LIMIT)
        : [];

      const deadlines = await tx
        .select({ id: deadline.id, companyId: deadline.companyId, title: deadline.title, dueOn: deadline.dueOn })
        .from(deadline)
        .where(ilike(deadline.title, pattern))
        .orderBy(asc(deadline.dueOn))
        .limit(LIMIT);

      return {
        issues: issues.slice(0, LIMIT),
        documents: documents.map((item) => ({
          id: item.id,
          companyId: item.companyId,
          title: item.title ?? 'Document',
          subtitle: names.get(item.companyId) ?? '',
        })),
        deadlines: deadlines.map((item) => ({
          id: item.id,
          companyId: item.companyId,
          title: item.title,
          subtitle: `${names.get(item.companyId) ?? ''}, due ${item.dueOn}`,
        })),
      };
    }),
  );
}

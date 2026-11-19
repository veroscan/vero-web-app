import { contract } from '@vero/shared';
import { desc, lt } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { defineRoute } from '../../http/route';

export function registerAuditRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.audit.list, { auth: 'org', permission: 'audit.read' }, async ({ org, query }) => {
    const rows = await deps.db.withOrg(org.organisationId, (tx) =>
      tx
        .select()
        .from(schema.auditLog)
        .where(query.cursor ? lt(schema.auditLog.seq, Number(query.cursor)) : undefined)
        .orderBy(desc(schema.auditLog.seq))
        .limit(query.limit + 1),
    );
    const page = rows.slice(0, query.limit);
    return {
      entries: page.map((row) => ({
        id: row.id,
        actorId: row.actorId,
        action: row.action,
        target: row.target,
        ip: row.ip,
        userAgent: row.userAgent,
        metadata: row.metadata,
        createdAt: row.createdAt.toISOString(),
      })),
      nextCursor: rows.length > query.limit ? String(page.at(-1)?.seq) : null,
    };
  });
}

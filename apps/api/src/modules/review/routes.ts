import { contract } from '@vero/shared';
import { and, desc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import { writeAudit } from '../audit/service';
import { notifyOrganisation } from '../notifications/service';

/**
 * Staff work. The document review desk, orders and bookings were removed with the lawyer service
 * (owner's decision, 19 Nov 2026): their tables stay, unused, and nothing writes to them. What is
 * left is the feed of companies people asked us to look up by hand, because their register
 * couldn't be searched. Rule-pack approval lives in the admin routes.
 */

const { staffNotification } = schema;

const STAFF: readonly ('lawyer' | 'admin')[] = ['lawyer', 'admin'];
const LOOKUP = 'lookup_request';
const LOOKUP_STATUSES = new Set(['in_progress', 'completed', 'cancelled']);

export function registerReviewRoutes(app: FastifyInstance, deps: AppDeps): void {
  const staffOnly = { auth: 'staff' as const, staffRoles: STAFF };

  defineRoute(app, deps, contract.review.work, staffOnly, async () => {
    const rows = await deps.db.withSystem((tx) =>
      tx.select().from(staffNotification).where(eq(staffNotification.kind, LOOKUP)).orderBy(desc(staffNotification.createdAt)).limit(100),
    );
    return {
      items: rows.map((row) => ({
        id: row.id,
        kind: 'lookup_request' as const,
        title: row.title,
        body: row.body,
        read: row.readAt !== null,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  });

  defineRoute(app, deps, contract.review.updateWork, staffOnly, async ({ staff, params, body, meta }) => {
    const [item] = await deps.db.withSystem((tx) =>
      tx.select().from(staffNotification).where(and(eq(staffNotification.id, params.workId), eq(staffNotification.kind, LOOKUP))),
    );
    if (!item?.tenantId) throw errors.notFound('That item');
    if (!LOOKUP_STATUSES.has(body.status)) throw errors.invalidInput('That status does not apply here.');
    const organisationId = item.tenantId;

    // Only the one row the notification names, inside that client's tenant.
    await deps.db.withOrg(organisationId, async (tx) => {
      const rows = await tx.update(schema.lookupRequest).set({ status: body.status }).where(eq(schema.lookupRequest.id, item.refId)).returning({ id: schema.lookupRequest.id });
      if (rows.length === 0) throw errors.notFound('That request');
      await writeAudit(tx, {
        organisationId,
        actorId: staff.userId,
        action: 'staff.work_updated',
        target: item.refId,
        metadata: { kind: item.kind, status: body.status, staffRole: staff.role },
        meta,
      });
      await notifyOrganisation(tx, organisationId, {
        // Kind code kept for filtering; the words never say lawyer.
        kind: 'lawyer',
        title: `Your company look-up is now ${body.status.replace('_', ' ')}`,
        dedupeKey: `work:${item.refId}:${body.status}`,
      });
    });
    await deps.db.withSystem((tx) => tx.update(staffNotification).set({ readAt: deps.now() }).where(eq(staffNotification.id, item.id)));
    return { id: item.id, status: body.status };
  });
}

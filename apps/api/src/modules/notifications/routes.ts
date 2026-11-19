import { contract, type Notification } from '@vero/shared';
import { and, count, desc, eq, isNull, lt } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';

const { notification } = schema;

function toDto(row: typeof notification.$inferSelect): Notification {
  return {
    id: row.id,
    kind: row.kind as Notification['kind'],
    title: row.title,
    body: row.body,
    link: row.link,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function registerNotificationRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(
    app,
    deps,
    contract.notifications.list,
    { auth: 'org', permission: 'notifications.read' },
    async ({ org, session, query }) =>
      deps.db.withOrg(org.organisationId, async (tx) => {
        // Row-level security limits this to the organisation; these are also personal.
        const mine = eq(notification.userId, session.userId);
        const rows = await tx
          .select()
          .from(notification)
          .where(
            and(
              mine,
              query.unreadOnly ? isNull(notification.readAt) : undefined,
              query.kind ? eq(notification.kind, query.kind) : undefined,
              query.cursor ? lt(notification.seq, Number(query.cursor)) : undefined,
            ),
          )
          .orderBy(desc(notification.seq))
          .limit(query.limit + 1);
        const [unread] = await tx
          .select({ value: count() })
          .from(notification)
          .where(and(mine, isNull(notification.readAt)));
        const page = rows.slice(0, query.limit);
        return {
          notifications: page.map(toDto),
          unreadCount: unread?.value ?? 0,
          nextCursor: rows.length > query.limit ? String(page.at(-1)?.seq) : null,
        };
      }),
  );

  defineRoute(
    app,
    deps,
    contract.notifications.markRead,
    { auth: 'org', permission: 'notifications.read' },
    async ({ org, session, params }) => {
      const [row] = await deps.db.withOrg(org.organisationId, async (tx) => {
        const [found] = await tx
          .select()
          .from(notification)
          .where(and(eq(notification.id, params.notificationId), eq(notification.userId, session.userId)));
        if (!found) return [];
        // Reading twice keeps the first read time.
        if (found.readAt) return [found];
        return tx
          .update(notification)
          .set({ readAt: deps.now() })
          .where(eq(notification.id, found.id))
          .returning();
      });
      if (!row) throw errors.notFound('That notification');
      return toDto(row);
    },
  );

  defineRoute(
    app,
    deps,
    contract.notifications.markAllRead,
    { auth: 'org', permission: 'notifications.read' },
    async ({ org, session }) => {
      const rows = await deps.db.withOrg(org.organisationId, (tx) =>
        tx
          .update(notification)
          .set({ readAt: deps.now() })
          .where(and(eq(notification.userId, session.userId), isNull(notification.readAt)))
          .returning({ id: notification.id }),
      );
      return { updated: rows.length };
    },
  );
}

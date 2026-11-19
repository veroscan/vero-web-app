import { contract } from '@vero/shared';
import { desc, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema, withAdminDirectory } from '../../db';
import type { AppDeps } from '../../deps';
import { defineRoute } from '../../http/route';
import { writeAudit } from '../audit/service';

const { waitlistEntry } = schema;

/** The website's form posts here. app.ts lets the website's own origin call this path, and only this one. */
export const WAITLIST_PATH = '/v1/public/waitlist';

/**
 * The website's "Join the waitlist" form (19 Nov 2026).
 * - One answer for everyone: a repeat address gets the same "ok" as a new one, so the form can't be
 *   used to find out who is on the list. A repeat refreshes the row and counts the submission.
 * - The hidden `website` field is a bot trap: when it's filled in, nothing is stored, and the
 *   answer is still "ok" so the bot learns nothing.
 * - Rate limited per address like the other public routes.
 */
export function registerWaitlistRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.public.joinWaitlist, { auth: 'public', skipOriginCheck: true }, async ({ body, meta }) => {
    await deps.limiter.enforce(`waitlist:${deps.secrets.hmac('rate-limit', meta.ip)}`, deps.config.rateLimits.publicPerIpPerMinute, 60);
    if (body.website && body.website.trim() !== '') return { ok: true as const };
    const email = body.email.trim().toLowerCase();
    const details = { ...(body.need ? { need: body.need } : {}), ...(body.budget ? { budget: body.budget } : {}) };
    await deps.db.withSystem((tx) =>
      tx
        .insert(waitlistEntry)
        .values({ email, name: body.name, company: body.company ?? null, message: body.message ?? null, details })
        .onConflictDoUpdate({
          target: waitlistEntry.email,
          set: {
            name: body.name,
            company: sql`coalesce(${body.company ?? null}::text, ${waitlistEntry.company})`,
            message: sql`coalesce(${body.message ?? null}::text, ${waitlistEntry.message})`,
            details: sql`${waitlistEntry.details} || ${JSON.stringify(details)}::jsonb`,
            submissions: sql`${waitlistEntry.submissions} + 1`,
          },
        }),
    );
    return { ok: true as const };
  });

  defineRoute(app, deps, contract.admin.waitlist, { auth: 'staff', staffRoles: ['admin'] }, async ({ staff, query, meta }) =>
    withAdminDirectory(deps.db, async (tx) => {
      const rows = await tx.select().from(waitlistEntry).orderBy(desc(waitlistEntry.createdAt), desc(waitlistEntry.id)).limit(query.limit + 1).offset(query.offset);
      const [count] = await tx.select({ total: sql<number>`count(*)::int` }).from(waitlistEntry);
      await writeAudit(tx, { actorId: staff.userId, action: 'admin.waitlist_viewed', metadata: { rows: Math.min(rows.length, query.limit) }, meta });
      const page = rows.slice(0, query.limit);
      return {
        total: count?.total ?? 0,
        hasMore: rows.length > query.limit,
        entries: page.map((row) => {
          const details = (row.details ?? {}) as { need?: string; budget?: string };
          return {
            id: row.id,
            email: row.email,
            name: row.name,
            company: row.company,
            message: row.message,
            need: details.need ?? null,
            budget: details.budget ?? null,
            submissions: row.submissions,
            invitedAt: row.invitedAt ? row.invitedAt.toISOString() : null,
            createdAt: row.createdAt.toISOString(),
          };
        }),
      };
    }),
  );
}

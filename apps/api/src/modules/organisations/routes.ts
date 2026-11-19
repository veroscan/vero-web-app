import { can, contract, type Invitation, type Member, type Organisation, type Role } from '@vero/shared';
import { and, asc, desc, eq, gt, isNull, lte } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { isUniqueViolation, schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError, errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import { randomToken, hashToken } from '../../lib/crypto';
import { writeAudit } from '../audit/service';
import { createNotification } from '../notifications/service';
import { acceptInvitationInTx, parseInvitationToken } from './service';

const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_SECONDS = 86400;
const { invitation, membership, organisation, user } = schema;

function organisationDto(row: typeof organisation.$inferSelect, role: Role): Organisation {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Organisation['type'],
    region: row.region,
    isDemo: row.isDemo,
    role,
    createdAt: row.createdAt.toISOString(),
  };
}

function invitationDto(row: typeof invitation.$inferSelect): Invitation {
  return {
    id: row.id,
    email: row.email,
    role: row.role as Role,
    invitedBy: row.invitedBy,
    expiresAt: row.expiresAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

function lastOwner(): AppError {
  return new AppError(409, 'last_owner', 'Every organisation needs an owner. Make someone else an owner first.');
}

/** Locks the owners, so two owners stepping down at once cannot leave none. */
async function otherOwnersExist(tx: Tx, organisationId: string, userId: string): Promise<boolean> {
  const owners = await tx
    .select({ userId: membership.userId })
    .from(membership)
    .where(and(eq(membership.organisationId, organisationId), eq(membership.role, 'owner')))
    .for('update');
  return owners.some((owner) => owner.userId !== userId);
}

export function registerOrganisationRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.organisations.list, { auth: 'session' }, async ({ session }) => {
    const rows = await deps.db.withUser(session.userId, (tx) =>
      tx
        .select({ org: organisation, role: membership.role })
        .from(membership)
        .innerJoin(organisation, eq(organisation.id, membership.organisationId))
        .where(eq(membership.userId, session.userId))
        .orderBy(asc(membership.createdAt)),
    );
    return { organisations: rows.map((row) => organisationDto(row.org, row.role as Role)) };
  });

  defineRoute(
    app,
    deps,
    contract.organisations.current,
    { auth: 'org', permission: 'organisation.read' },
    async ({ org }) => {
      const [row] = await deps.db.withOrg(org.organisationId, (tx) => tx.select().from(organisation));
      if (!row) throw errors.noOrganisation();
      return organisationDto(row, org.role);
    },
  );

  defineRoute(
    app,
    deps,
    contract.organisations.updateCurrent,
    { auth: 'org', permission: 'organisation.update' },
    async ({ org, session, body, meta }) =>
      deps.db.withOrg(org.organisationId, async (tx) => {
        const [row] = await tx
          .update(organisation)
          .set({ name: body.name })
          .where(eq(organisation.id, org.organisationId))
          .returning();
        if (!row) throw errors.noOrganisation();
        await writeAudit(tx, {
          organisationId: org.organisationId,
          actorId: session.userId,
          action: 'organisation.updated',
          target: org.organisationId,
          metadata: { fields: ['name'] },
          meta,
        });
        return organisationDto(row, org.role);
      }),
  );

  defineRoute(app, deps, contract.organisations.switch, { auth: 'session' }, async ({ session, body, meta }) => {
    const [mine] = await deps.db.withOrg(body.organisationId, (tx) =>
      tx.select({ id: membership.id }).from(membership).where(eq(membership.userId, session.userId)),
    );
    if (!mine) throw errors.notAMember();
    await deps.db.withSystem(async (tx) => {
      await tx
        .update(schema.session)
        .set({ activeOrganisationId: body.organisationId })
        .where(eq(schema.session.id, session.sessionId));
      await writeAudit(tx, {
        organisationId: body.organisationId,
        actorId: session.userId,
        action: 'organisation.switched',
        target: body.organisationId,
        meta,
      });
    });
    return { activeOrganisationId: body.organisationId };
  });

  // ---- Members ----

  defineRoute(app, deps, contract.members.list, { auth: 'org', permission: 'members.read' }, async ({ org }) => {
    const rows = await deps.db.withOrg(org.organisationId, (tx) =>
      tx
        .select({
          userId: membership.userId,
          role: membership.role,
          joinedAt: membership.createdAt,
          email: user.email,
          name: user.name,
        })
        .from(membership)
        .innerJoin(user, eq(user.id, membership.userId))
        .orderBy(asc(membership.createdAt)),
    );
    return {
      members: rows.map((row): Member => ({ ...row, role: row.role as Role, joinedAt: row.joinedAt.toISOString() })),
    };
  });

  defineRoute(
    app,
    deps,
    contract.members.update,
    { auth: 'org', permission: 'members.manage' },
    async ({ org, session, params, body, meta }) =>
      deps.db.withOrg(org.organisationId, async (tx) => {
        const [target] = await tx
          .select({ role: membership.role, email: user.email, name: user.name, joinedAt: membership.createdAt })
          .from(membership)
          .innerJoin(user, eq(user.id, membership.userId))
          .where(eq(membership.userId, params.userId));
        if (!target) throw errors.notFound('That team member');

        const touchesOwner = target.role === 'owner' || body.role === 'owner';
        if (touchesOwner && !can(org.role, 'members.manageOwners')) throw errors.forbidden();
        if (target.role === 'owner' && body.role !== 'owner') {
          if (!(await otherOwnersExist(tx, org.organisationId, params.userId))) throw lastOwner();
        }

        await tx.update(membership).set({ role: body.role }).where(eq(membership.userId, params.userId));
        await writeAudit(tx, {
          organisationId: org.organisationId,
          actorId: session.userId,
          action: 'member.role_changed',
          target: params.userId,
          metadata: { from: target.role, to: body.role },
          meta,
        });
        if (params.userId !== session.userId) {
          await createNotification(tx, {
            organisationId: org.organisationId,
            userId: params.userId,
            kind: 'team',
            title: 'Your role has changed',
            body: `You are now: ${body.role}.`,
          });
        }
        return {
          userId: params.userId,
          email: target.email,
          name: target.name,
          role: body.role,
          joinedAt: target.joinedAt.toISOString(),
        };
      }),
  );

  // Anyone can leave. Removing someone else needs permission.
  defineRoute(app, deps, contract.members.remove, { auth: 'org' }, async ({ org, session, params, meta }) => {
    const isSelf = params.userId === session.userId;
    if (!isSelf && !can(org.role, 'members.manage')) throw errors.forbidden();

    await deps.db.withOrg(org.organisationId, async (tx) => {
      const [target] = await tx
        .select({ role: membership.role })
        .from(membership)
        .where(eq(membership.userId, params.userId));
      if (!target) throw errors.notFound('That team member');
      if (target.role === 'owner') {
        if (!isSelf && !can(org.role, 'members.manageOwners')) throw errors.forbidden();
        if (!(await otherOwnersExist(tx, org.organisationId, params.userId))) throw lastOwner();
      }
      await tx.delete(membership).where(eq(membership.userId, params.userId));
      await writeAudit(tx, {
        organisationId: org.organisationId,
        actorId: session.userId,
        action: isSelf ? 'member.left' : 'member.removed',
        target: params.userId,
        meta,
      });
    });

    // Their sessions should stop pointing at an organisation they have left.
    await deps.db.withSystem((tx) =>
      tx
        .update(schema.session)
        .set({ activeOrganisationId: null })
        .where(
          and(eq(schema.session.userId, params.userId), eq(schema.session.activeOrganisationId, org.organisationId)),
        ),
    );
    return { ok: true as const };
  });

  // ---- Invitations ----

  defineRoute(app, deps, contract.invitations.list, { auth: 'org', permission: 'invitations.read' }, async ({ org }) => {
    const rows = await deps.db.withOrg(org.organisationId, (tx) =>
      tx
        .select()
        .from(invitation)
        .where(and(isNull(invitation.acceptedAt), isNull(invitation.revokedAt), gt(invitation.expiresAt, deps.now())))
        .orderBy(desc(invitation.createdAt)),
    );
    return { invitations: rows.map(invitationDto) };
  });

  defineRoute(
    app,
    deps,
    contract.invitations.create,
    { auth: 'org', permission: 'invitations.manage' },
    async ({ org, session, body, meta }) => {
      if (body.role === 'owner' && !can(org.role, 'members.manageOwners')) throw errors.forbidden();
      await deps.limiter.enforce(
        `invite:org:${org.organisationId}`,
        deps.config.rateLimits.invitationsPerOrgPerDay,
        DAY_SECONDS,
      );

      const secret = randomToken();
      const token = `${org.organisationId}.${secret}`;
      const now = deps.now();
      const { row, organisationName } = await deps.db
        .withOrg(org.organisationId, async (tx) => {
          const [existingMember] = await tx
            .select({ id: membership.id })
            .from(membership)
            .innerJoin(user, eq(user.id, membership.userId))
            .where(eq(user.email, body.email));
          if (existingMember) {
            throw new AppError(409, 'already_member', 'That person is already on your team.');
          }
          // An old invitation that ran out must not block a new one.
          await tx
            .update(invitation)
            .set({ revokedAt: now })
            .where(
              and(
                eq(invitation.email, body.email),
                isNull(invitation.acceptedAt),
                isNull(invitation.revokedAt),
                // Only the expired ones. A live invitation hits the unique index below.
                lte(invitation.expiresAt, now),
              ),
            );
          const [created] = await tx
            .insert(invitation)
            .values({
              organisationId: org.organisationId,
              email: body.email,
              role: body.role,
              tokenHash: hashToken(token),
              invitedBy: session.userId,
              expiresAt: new Date(now.getTime() + INVITATION_LIFETIME_MS),
            })
            .returning();
          if (!created) throw errors.internal();
          const [current] = await tx.select({ name: organisation.name }).from(organisation);
          await writeAudit(tx, {
            organisationId: org.organisationId,
            actorId: session.userId,
            action: 'invitation.created',
            target: created.id,
            metadata: { role: body.role },
            meta,
          });
          return { row: created, organisationName: current?.name ?? 'your team' };
        })
        .catch((error: unknown) => {
          if (isUniqueViolation(error)) {
            throw new AppError(409, 'invitation_exists', 'That person already has an invitation waiting.');
          }
          throw error;
        });

      const link = `${deps.config.webBaseUrl}/invitations/accept?token=${encodeURIComponent(token)}`;
      await deps.mailer.send({
        to: body.email,
        subject: `Join ${organisationName} on Vero`,
        template: 'invitation',
        link,
        organisationId: org.organisationId,
        text: [
          `You've been invited to join ${organisationName} on Vero.`,
          '',
          link,
          '',
          'This link expires in 7 days. If you were not expecting it, you can ignore this email.',
        ].join('\n'),
      });
      return invitationDto(row);
    },
  );

  defineRoute(
    app,
    deps,
    contract.invitations.revoke,
    { auth: 'org', permission: 'invitations.manage' },
    async ({ org, session, params, meta }) => {
      await deps.db.withOrg(org.organisationId, async (tx) => {
        const [revoked] = await tx
          .update(invitation)
          .set({ revokedAt: deps.now() })
          .where(and(eq(invitation.id, params.invitationId), isNull(invitation.acceptedAt), isNull(invitation.revokedAt)))
          .returning({ id: invitation.id });
        if (!revoked) throw errors.notFound('That invitation');
        await writeAudit(tx, {
          organisationId: org.organisationId,
          actorId: session.userId,
          action: 'invitation.revoked',
          target: revoked.id,
          meta,
        });
      });
      return { ok: true as const };
    },
  );

  defineRoute(app, deps, contract.invitations.accept, { auth: 'session' }, async ({ session, body }) => {
    const invalid = new AppError(400, 'invitation_invalid', 'This invitation has expired or has already been used.');
    const parsed = parseInvitationToken(body.token);
    if (!parsed) throw invalid;

    const result = await deps.db.withOrg(parsed.organisationId, async (tx) => {
      const outcome = await acceptInvitationInTx(tx, {
        organisationId: parsed.organisationId,
        tokenHash: parsed.tokenHash,
        userId: session.userId,
        email: session.email,
        now: deps.now(),
      });
      // Undo the claim, so the link is not burnt by someone who is already a member.
      if (outcome.status === 'already_member') {
        throw new AppError(409, 'already_member', "You're already on this team.");
      }
      return outcome;
    });

    if (result.status === 'wrong_email') {
      throw new AppError(403, 'invitation_wrong_email', 'This invitation was sent to a different email address.');
    }
    if (result.status !== 'accepted') throw invalid;

    await deps.db.withSystem((tx) =>
      tx
        .update(schema.session)
        .set({ activeOrganisationId: parsed.organisationId })
        .where(eq(schema.session.id, session.sessionId)),
    );
    return { organisationId: parsed.organisationId, role: result.role };
  });
}

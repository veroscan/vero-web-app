// Brings in the cookie types for anything that compiles this file, such as the worker.
import type {} from '@fastify/cookie';
import { staffRoleSchema, type Role, type StaffRole } from '@vero/shared';
import { and, eq, gt, isNull } from 'drizzle-orm';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Config } from '../../config';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { hashToken, randomToken } from '../../lib/crypto';

export const SESSION_COOKIE = 'vero_session';
export const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
/** Avoids a database write on every request: the expiry only rolls once an hour. */
const ROLL_AFTER_MS = 60 * 60 * 1000;

export interface SessionContext {
  sessionId: string;
  userId: string;
  email: string;
  mfaEnabled: boolean;
  activeOrganisationId: string | null;
}

export interface OrgContext {
  organisationId: string;
  role: Role;
}

export interface StaffContext {
  userId: string;
  role: StaffRole;
}

function cookieOptions(config: Config) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: config.cookieSecure,
    path: '/',
  };
}

export function setSessionCookie(reply: FastifyReply, config: Config, token: string): void {
  reply.setCookie(SESSION_COOKIE, token, {
    ...cookieOptions(config),
    maxAge: Math.floor(SESSION_LIFETIME_MS / 1000),
  });
}

export function clearSessionCookie(reply: FastifyReply, config: Config): void {
  reply.clearCookie(SESSION_COOKIE, cookieOptions(config));
}

export async function createSession(
  tx: Tx,
  input: {
    userId: string;
    activeOrganisationId: string | null;
    now: Date;
    ip: string;
    userAgent: string | null;
  },
): Promise<string> {
  const token = randomToken();
  await tx.insert(schema.session).values({
    userId: input.userId,
    tokenHash: hashToken(token),
    activeOrganisationId: input.activeOrganisationId,
    expiresAt: new Date(input.now.getTime() + SESSION_LIFETIME_MS),
    lastSeenAt: input.now,
    ip: input.ip,
    userAgent: input.userAgent,
  });
  return token;
}

/** Checks the cookie against the database on every request, so revocation is immediate. */
export async function authenticate(
  deps: AppDeps,
  request: FastifyRequest,
  reply: FastifyReply,
  options: { allowMfaPending: boolean },
): Promise<SessionContext> {
  const token = request.cookies[SESSION_COOKIE];
  if (!token) throw errors.unauthenticated();

  const now = deps.now();
  const tokenHash = hashToken(token);
  const row = await deps.db.withSystem(async (tx) => {
    const [found] = await tx
      .select({
        sessionId: schema.session.id,
        userId: schema.session.userId,
        activeOrganisationId: schema.session.activeOrganisationId,
        mfaVerifiedAt: schema.session.mfaVerifiedAt,
        expiresAt: schema.session.expiresAt,
        email: schema.user.email,
        mfaEnabled: schema.user.mfaEnabled,
      })
      .from(schema.session)
      .innerJoin(schema.user, eq(schema.user.id, schema.session.userId))
      .where(
        and(eq(schema.session.tokenHash, tokenHash), isNull(schema.session.revokedAt), gt(schema.session.expiresAt, now)),
      );
    if (!found) return null;

    if (found.expiresAt.getTime() - now.getTime() < SESSION_LIFETIME_MS - ROLL_AFTER_MS) {
      await tx
        .update(schema.session)
        .set({ expiresAt: new Date(now.getTime() + SESSION_LIFETIME_MS), lastSeenAt: now })
        .where(eq(schema.session.id, found.sessionId));
      setSessionCookie(reply, deps.config, token);
    }
    return found;
  });

  if (!row) {
    clearSessionCookie(reply, deps.config);
    throw errors.unauthenticated();
  }
  if (row.mfaEnabled && !row.mfaVerifiedAt && !options.allowMfaPending) throw errors.mfaRequired();

  return {
    sessionId: row.sessionId,
    userId: row.userId,
    email: row.email,
    mfaEnabled: row.mfaEnabled,
    activeOrganisationId: row.activeOrganisationId,
  };
}

/** Re-reads the membership every request, so a removal or role change applies at once. */
export async function resolveOrg(deps: AppDeps, session: SessionContext): Promise<OrgContext> {
  const organisationId = session.activeOrganisationId;
  if (!organisationId) throw errors.noOrganisation();
  const [membership] = await deps.db.withOrg(organisationId, (tx) =>
    tx
      .select({ role: schema.membership.role })
      .from(schema.membership)
      .where(eq(schema.membership.userId, session.userId)),
  );
  if (!membership) throw errors.notAMember();
  return { organisationId, role: membership.role as Role };
}

/**
 * The review desk and admin pages. Looks only at platform_staff: a customer can make someone
 * "lawyer" or "admin" of their own organisation, and that must open nothing here. A refused
 * attempt is recorded.
 */
export async function resolveStaff(
  deps: AppDeps,
  session: SessionContext,
  allowed: readonly StaffRole[],
  meta: { ip: string; userAgent: string | null },
): Promise<StaffContext> {
  return deps.db.withSystem(async (tx) => {
    const [row] = await tx
      .select({ role: schema.platformStaff.role })
      .from(schema.platformStaff)
      .where(eq(schema.platformStaff.userId, session.userId));
    const role = row ? staffRoleSchema.parse(row.role) : null;
    if (role && allowed.includes(role)) return { userId: session.userId, role };
    await tx.insert(schema.auditLog).values({
      actorId: session.userId,
      action: 'staff.access_denied',
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
    return null;
  }).then((staff) => {
    if (!staff) throw errors.forbidden();
    return staff;
  });
}

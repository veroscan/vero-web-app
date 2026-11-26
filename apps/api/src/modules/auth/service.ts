import type { MeResponse, SessionInfo, SignInResponse, User } from '@vero/shared';
import { and, asc, eq, gt, isNull, lt, ne, or } from 'drizzle-orm';
import { enterOrg, enterUser, schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError, errors } from '../../http/errors';
import type { RequestMeta } from '../../http/route';
import { hashToken, randomToken } from '../../lib/crypto';
import { writeAudit } from '../audit/service';
import {
  acceptInvitationInTx,
  createPersonalOrganisation,
  parseInvitationToken,
} from '../organisations/service';
import { createSession, type SessionContext } from './session';
import { deviceLabel } from './devices';
import { clearRecoveryCodes, replaceRecoveryCodes } from './recovery';
import { matchTotpStep, newTotpSecret, totpUri } from './totp';

const MAGIC_LINK_LIFETIME_MS = 15 * 60 * 1000;
const HOUR_SECONDS = 3600;
const FIFTEEN_MINUTES_SECONDS = 900;
const TOTP_PURPOSE = 'totp';

export function toUserDto(row: typeof schema.user.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    locale: row.locale,
    mfaEnabled: row.mfaEnabled,
    createdAt: row.createdAt.toISOString(),
  };
}

function totpInvalid(): AppError {
  return new AppError(400, 'totp_invalid', "That code didn't work. Check your authenticator app and try again.");
}

// ---- Magic link ----

/**
 * Never looks at whether the person has an account, so the response and the work done are
 * the same either way. The account itself is created when the link is used.
 */
export async function requestMagicLink(
  deps: AppDeps,
  input: { email: string; invitationToken?: string; app?: boolean },
  meta: RequestMeta,
): Promise<void> {
  const { rateLimits } = deps.config;
  const emailHash = deps.secrets.hmac('email', input.email);
  const ipHash = deps.secrets.hmac('ip', meta.ip);
  await deps.limiter.enforce(`magic:ip:${ipHash}`, rateLimits.magicLinkPerIpPerHour, HOUR_SECONDS);
  await deps.limiter.enforce(`magic:email:${emailHash}`, rateLimits.magicLinkPerEmailPerHour, HOUR_SECONDS);

  const token = randomToken();
  const now = deps.now();
  const invitation = input.invitationToken ? parseInvitationToken(input.invitationToken) : null;

  await deps.db.withSystem(async (tx) => {
    // Only the newest link works.
    await tx
      .update(schema.magicLink)
      .set({ usedAt: now })
      .where(and(eq(schema.magicLink.email, input.email), isNull(schema.magicLink.usedAt)));
    await tx.insert(schema.magicLink).values({
      email: input.email,
      tokenHash: hashToken(token),
      expiresAt: new Date(now.getTime() + MAGIC_LINK_LIFETIME_MS),
      invitationOrgId: invitation?.organisationId ?? null,
      invitationTokenHash: invitation?.tokenHash ?? null,
      ip: meta.ip,
    });
    await writeAudit(tx, { action: 'auth.magic_link.requested', target: `email:${emailHash}`, meta });
  });

  // From the phone app, the web page this opens hands the link on to the app instead of signing the browser in.
  const link = `${deps.config.webBaseUrl}/sign-in/verify?token=${encodeURIComponent(token)}${input.app ? '&app=1' : ''}`;
  await deps.mailer.send({
    to: input.email,
    subject: 'Your Vero sign-in link',
    template: 'magic-link',
    link,
    text: [
      'Use this link to sign in to Vero. It works once and expires in 15 minutes.',
      '',
      link,
      '',
      "If you didn't ask for this, you can ignore this email. Nobody can sign in without the link.",
    ].join('\n'),
  });
}

interface SignInOutcome {
  response: SignInResponse;
  sessionToken: string;
}

/** Everything happens in one transaction: a person is never left half signed up. */
export async function verifyMagicLink(deps: AppDeps, token: string, meta: RequestMeta): Promise<SignInOutcome> {
  const ipHash = deps.secrets.hmac('ip', meta.ip);
  await deps.limiter.enforce(`verify:ip:${ipHash}`, deps.config.rateLimits.verifyPerIpPer15Min, FIFTEEN_MINUTES_SECONDS);

  const now = deps.now();
  const outcome = await deps.db.withSystem(async (tx): Promise<SignInOutcome | null> => {
    // One atomic claim: of any number of simultaneous attempts, exactly one gets the row.
    const [link] = await tx
      .update(schema.magicLink)
      .set({ usedAt: now })
      .where(
        and(
          eq(schema.magicLink.tokenHash, hashToken(token)),
          isNull(schema.magicLink.usedAt),
          gt(schema.magicLink.expiresAt, now),
        ),
      )
      .returning();
    if (!link) return null;

    const [existing] = await tx.select().from(schema.user).where(eq(schema.user.email, link.email));
    const isNewUser = !existing;
    const inserted = existing ? undefined : (await tx.insert(schema.user).values({ email: link.email }).returning())[0];
    const user = existing ?? inserted;
    if (!user) throw errors.internal();

    const activeOrganisationId = await resolveActiveOrganisation(tx, {
      userId: user.id,
      email: user.email,
      now,
      invitationOrgId: link.invitationOrgId,
      invitationTokenHash: link.invitationTokenHash,
    });

    const sessionToken = await createSession(tx, {
      userId: user.id,
      activeOrganisationId,
      now,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
    await tx.update(schema.user).set({ lastSignInAt: now }).where(eq(schema.user.id, user.id));
    await writeAudit(tx, {
      organisationId: activeOrganisationId,
      actorId: user.id,
      action: isNewUser ? 'auth.signed_up' : 'auth.signed_in',
      metadata: { method: 'magic_link' },
      meta,
    });
    return {
      sessionToken,
      response: { user: toUserDto(user), mfaRequired: user.mfaEnabled, isNewUser, activeOrganisationId },
    };
  });

  if (!outcome) {
    // Written outside the transaction above, which saw nothing worth keeping.
    await deps.db.withSystem((tx) => writeAudit(tx, { action: 'auth.magic_link.rejected', meta }));
    // Only someone holding the real link learns which: a made-up token gets neither.
    const [known] = await deps.db.withSystem((tx) =>
      tx.select({ usedAt: schema.magicLink.usedAt }).from(schema.magicLink).where(eq(schema.magicLink.tokenHash, hashToken(token))),
    );
    const reason = known ? (known.usedAt ? 'used' : 'expired') : undefined;
    throw new AppError(400, 'magic_link_invalid', 'This link has expired or has already been used. Ask for a new one.', undefined, reason);
  }
  return outcome;
}

async function resolveActiveOrganisation(
  tx: Tx,
  input: {
    userId: string;
    email: string;
    now: Date;
    invitationOrgId: string | null;
    invitationTokenHash: string | null;
  },
): Promise<string> {
  if (input.invitationOrgId && input.invitationTokenHash) {
    await enterOrg(tx, input.invitationOrgId);
    const result = await acceptInvitationInTx(tx, {
      organisationId: input.invitationOrgId,
      tokenHash: input.invitationTokenHash,
      userId: input.userId,
      email: input.email,
      now: input.now,
    });
    if (result.status === 'accepted') return input.invitationOrgId;
  }

  await enterUser(tx, input.userId);
  const [first] = await tx
    .select({ organisationId: schema.membership.organisationId })
    .from(schema.membership)
    .where(eq(schema.membership.userId, input.userId))
    .orderBy(asc(schema.membership.createdAt))
    .limit(1);
  return first?.organisationId ?? createPersonalOrganisation(tx, input.userId);
}

// ---- Sessions ----

export async function logout(deps: AppDeps, session: SessionContext, meta: RequestMeta): Promise<void> {
  await deps.db.withSystem(async (tx) => {
    await tx.update(schema.session).set({ revokedAt: deps.now() }).where(eq(schema.session.id, session.sessionId));
    await writeAudit(tx, {
      organisationId: session.activeOrganisationId,
      actorId: session.userId,
      action: 'auth.signed_out',
      meta,
    });
  });
}

export async function logoutEverywhere(deps: AppDeps, session: SessionContext, meta: RequestMeta): Promise<void> {
  await deps.db.withSystem(async (tx) => {
    const revoked = await tx
      .update(schema.session)
      .set({ revokedAt: deps.now() })
      .where(and(eq(schema.session.userId, session.userId), isNull(schema.session.revokedAt)))
      .returning({ id: schema.session.id });
    await writeAudit(tx, {
      organisationId: session.activeOrganisationId,
      actorId: session.userId,
      action: 'auth.signed_out_everywhere',
      metadata: { sessions: revoked.length },
      meta,
    });
  });
}

// ---- Sessions ----

/** Where this person is signed in now: this session first, then the most recently used. No address or location. */
export async function listSessions(deps: AppDeps, session: SessionContext): Promise<SessionInfo[]> {
  const now = deps.now();
  const rows = await deps.db.withSystem((tx) =>
    tx
      .select({ id: schema.session.id, createdAt: schema.session.createdAt, lastSeenAt: schema.session.lastSeenAt, userAgent: schema.session.userAgent, expiresAt: schema.session.expiresAt })
      .from(schema.session)
      .where(and(eq(schema.session.userId, session.userId), isNull(schema.session.revokedAt), gt(schema.session.expiresAt, now))),
  );
  return rows
    .map((row) => ({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      lastUsedAt: row.lastSeenAt.toISOString(),
      device: deviceLabel(row.userAgent),
      current: row.id === session.sessionId,
      expiresAt: row.expiresAt.toISOString(),
    }))
    .sort((a, b) => Number(b.current) - Number(a.current) || b.lastUsedAt.localeCompare(a.lastUsedAt) || a.id.localeCompare(b.id));
}

/** Signs one of this person's other sessions out. Someone else's session is "not found", like one that doesn't exist. */
export async function revokeSession(deps: AppDeps, session: SessionContext, sessionId: string, meta: RequestMeta): Promise<void> {
  if (sessionId === session.sessionId) {
    throw errors.invalidState("That's the session you're using now. To end it, sign out.");
  }
  const now = deps.now();
  await deps.db.withSystem(async (tx) => {
    const revoked = await tx
      .update(schema.session)
      .set({ revokedAt: now })
      .where(and(eq(schema.session.id, sessionId), eq(schema.session.userId, session.userId), isNull(schema.session.revokedAt), gt(schema.session.expiresAt, now)))
      .returning({ id: schema.session.id });
    if (revoked.length === 0) throw errors.notFound('That session');
    await writeAudit(tx, { organisationId: session.activeOrganisationId, actorId: session.userId, action: 'auth.session_revoked', target: sessionId, meta });
  });
}

// ---- Profile ----

export async function getMe(deps: AppDeps, session: SessionContext): Promise<MeResponse> {
  return deps.db.withUser(session.userId, async (tx) => {
    const [user] = await tx.select().from(schema.user).where(eq(schema.user.id, session.userId));
    if (!user) throw errors.unauthenticated();
    const organisations = await tx
      .select({
        id: schema.organisation.id,
        name: schema.organisation.name,
        isDemo: schema.organisation.isDemo,
        role: schema.membership.role,
      })
      .from(schema.membership)
      .innerJoin(schema.organisation, eq(schema.organisation.id, schema.membership.organisationId))
      .where(eq(schema.membership.userId, session.userId))
      .orderBy(asc(schema.membership.createdAt));
    return {
      user: toUserDto(user),
      activeOrganisationId: session.activeOrganisationId,
      organisations: organisations.map((org) => ({ ...org, role: org.role as MeResponse['organisations'][number]['role'] })),
    };
  });
}

// ---- TOTP ----

/** Attempts are limited per person, so a stolen session cannot guess its way through. */
async function checkTotpCode(deps: AppDeps, userId: string, code: string): Promise<void> {
  await deps.limiter.enforce(`totp:${userId}`, deps.config.rateLimits.totpPerUserPer15Min, FIFTEEN_MINUTES_SECONDS);
  const now = deps.now();
  const consumed = await deps.db.withSystem(async (tx) => {
    const [user] = await tx.select().from(schema.user).where(eq(schema.user.id, userId));
    if (!user?.totpSecretEncrypted) return false;
    const secret = deps.secrets.decryptString(TOTP_PURPOSE, user.totpSecretEncrypted);
    const step = matchTotpStep(secret, code, now);
    if (step === null) return false;
    // Atomic, so the same code cannot be used twice, even at the same moment.
    const updated = await tx
      .update(schema.user)
      .set({ totpLastUsedStep: step })
      .where(
        and(
          eq(schema.user.id, userId),
          or(isNull(schema.user.totpLastUsedStep), lt(schema.user.totpLastUsedStep, step)),
        ),
      )
      .returning({ id: schema.user.id });
    return updated.length > 0;
  });
  if (!consumed) {
    await deps.db.withSystem((tx) => writeAudit(tx, { actorId: userId, action: 'auth.mfa.failed' }));
    throw totpInvalid();
  }
}

export async function startTotpEnrolment(
  deps: AppDeps,
  session: SessionContext,
  meta: RequestMeta,
): Promise<{ secret: string; otpauthUri: string }> {
  if (session.mfaEnabled) {
    throw new AppError(409, 'mfa_already_enabled', 'Two-step sign-in is already on.');
  }
  const secret = newTotpSecret();
  await deps.db.withSystem(async (tx) => {
    await tx
      .update(schema.user)
      .set({
        totpSecretEncrypted: deps.secrets.encryptString(TOTP_PURPOSE, secret),
        totpConfirmedAt: null,
        totpLastUsedStep: null,
      })
      .where(eq(schema.user.id, session.userId));
    await writeAudit(tx, {
      organisationId: session.activeOrganisationId,
      actorId: session.userId,
      action: 'auth.mfa.enrolment_started',
      meta,
    });
  });
  return { secret, otpauthUri: totpUri(secret, session.email) };
}

/** Switching on two-step sign-in signs out every other device. */
export async function confirmTotpEnrolment(
  deps: AppDeps,
  session: SessionContext,
  code: string,
  meta: RequestMeta,
): Promise<string[]> {
  if (session.mfaEnabled) {
    throw new AppError(409, 'mfa_already_enabled', 'Two-step sign-in is already on.');
  }
  const [user] = await deps.db.withSystem((tx) =>
    tx.select({ secret: schema.user.totpSecretEncrypted }).from(schema.user).where(eq(schema.user.id, session.userId)),
  );
  if (!user?.secret) {
    throw new AppError(409, 'mfa_not_started', 'Start setting up two-step sign-in first.');
  }
  await checkTotpCode(deps, session.userId, code);
  const now = deps.now();
  return deps.db.withSystem(async (tx) => {
    await tx
      .update(schema.user)
      .set({ mfaEnabled: true, totpConfirmedAt: now })
      .where(eq(schema.user.id, session.userId));
    await tx.update(schema.session).set({ mfaVerifiedAt: now }).where(eq(schema.session.id, session.sessionId));
    await tx
      .update(schema.session)
      .set({ revokedAt: now })
      .where(
        and(
          eq(schema.session.userId, session.userId),
          ne(schema.session.id, session.sessionId),
          isNull(schema.session.revokedAt),
        ),
      );
    await writeAudit(tx, {
      organisationId: session.activeOrganisationId,
      actorId: session.userId,
      action: 'auth.mfa.enabled',
      meta,
    });
    // Ten one-time recovery codes, shown once with this answer.
    return replaceRecoveryCodes(deps, tx, { userId: session.userId, organisationId: session.activeOrganisationId, meta });
  });
}

/** New recovery codes. Needs a current code from the app, so a stolen session alone can't make them. */
export async function regenerateRecoveryCodes(deps: AppDeps, session: SessionContext, code: string, meta: RequestMeta): Promise<string[]> {
  if (!session.mfaEnabled) throw new AppError(409, 'mfa_not_enabled', 'Two-step sign-in is not on.');
  await checkTotpCode(deps, session.userId, code);
  return deps.db.withSystem((tx) => replaceRecoveryCodes(deps, tx, { userId: session.userId, organisationId: session.activeOrganisationId, meta }));
}

export async function completeTotpChallenge(
  deps: AppDeps,
  session: SessionContext,
  code: string,
  meta: RequestMeta,
): Promise<void> {
  if (!session.mfaEnabled) throw new AppError(409, 'mfa_not_enabled', 'Two-step sign-in is not on.');
  await checkTotpCode(deps, session.userId, code);
  await deps.db.withSystem(async (tx) => {
    await tx.update(schema.session).set({ mfaVerifiedAt: deps.now() }).where(eq(schema.session.id, session.sessionId));
    await writeAudit(tx, {
      organisationId: session.activeOrganisationId,
      actorId: session.userId,
      action: 'auth.mfa.verified',
      meta,
    });
  });
}

export async function disableTotp(
  deps: AppDeps,
  session: SessionContext,
  code: string,
  meta: RequestMeta,
): Promise<void> {
  if (!session.mfaEnabled) throw new AppError(409, 'mfa_not_enabled', 'Two-step sign-in is not on.');
  await checkTotpCode(deps, session.userId, code);
  await deps.db.withSystem(async (tx) => {
    await tx
      .update(schema.user)
      .set({ mfaEnabled: false, totpSecretEncrypted: null, totpConfirmedAt: null, totpLastUsedStep: null })
      .where(eq(schema.user.id, session.userId));
    await clearRecoveryCodes(tx, session.userId);
    await writeAudit(tx, {
      organisationId: session.activeOrganisationId,
      actorId: session.userId,
      action: 'auth.mfa.disabled',
      meta,
    });
  });
}

// ---- Account deletion ----

/**
 * Real deletion, in one transaction. Organisations where this person is alone go too, with
 * everything in them, and so do their stored files. A sole owner with teammates has to hand
 * over first, otherwise a team would be left with nobody in charge. Audit rows stay, holding
 * only an opaque id that no longer resolves to anyone.
 */
export async function deleteAccount(
  deps: AppDeps,
  session: SessionContext,
  input: { confirmEmail: string; totpCode?: string },
  meta: RequestMeta,
  log: (context: Record<string, unknown>, message: string) => void,
): Promise<void> {
  if (input.confirmEmail !== session.email) {
    throw new AppError(400, 'confirmation_mismatch', "That email doesn't match your account.");
  }
  if (session.mfaEnabled) {
    if (!input.totpCode) throw totpInvalid();
    await checkTotpCode(deps, session.userId, input.totpCode);
  }

  const storageKeys: string[] = [];
  await deps.db.withSystem(async (tx) => {
    await enterUser(tx, session.userId);
    const mine = await tx
      .select({ organisationId: schema.membership.organisationId, role: schema.membership.role })
      .from(schema.membership)
      .where(eq(schema.membership.userId, session.userId));

    for (const { organisationId, role } of mine) {
      await enterOrg(tx, organisationId);
      // Locked, so two people deleting at once cannot both believe the other stays.
      const everyone = await tx
        .select({ userId: schema.membership.userId, role: schema.membership.role })
        .from(schema.membership)
        .where(eq(schema.membership.organisationId, organisationId))
        .for('update');
      const others = everyone.filter((member) => member.userId !== session.userId);

      if (others.length === 0) {
        const documents = await tx.select({ key: schema.document.storageKey }).from(schema.document);
        storageKeys.push(...documents.flatMap((doc) => (doc.key ? [doc.key] : [])));
        await writeAudit(tx, {
          organisationId,
          actorId: session.userId,
          action: 'organisation.deleted',
          target: organisationId,
          meta,
        });
        await tx.delete(schema.organisation).where(eq(schema.organisation.id, organisationId));
        continue;
      }
      if (role === 'owner' && !others.some((member) => member.role === 'owner')) {
        throw new AppError(
          409,
          'ownership_transfer_required',
          'You are the only owner of a team. Make someone else an owner before deleting your account.',
        );
      }
      await tx
        .delete(schema.membership)
        .where(and(eq(schema.membership.organisationId, organisationId), eq(schema.membership.userId, session.userId)));
      await writeAudit(tx, {
        organisationId,
        actorId: session.userId,
        action: 'member.left',
        target: session.userId,
        metadata: { reason: 'account_deleted' },
        meta,
      });
    }

    await tx.delete(schema.magicLink).where(eq(schema.magicLink.email, session.email));
    await tx.delete(schema.outbox).where(eq(schema.outbox.toEmail, session.email));
    // Cascades to sessions; rows that merely mention this person keep a null.
    await tx.delete(schema.user).where(eq(schema.user.id, session.userId));
    await writeAudit(tx, { actorId: session.userId, action: 'account.deleted', meta });
  });

  // After commit: a file that fails to delete must not undo the account deletion.
  const results = await Promise.allSettled(storageKeys.map((key) => deps.files.delete(key)));
  const failed = results.filter((result) => result.status === 'rejected').length;
  if (failed > 0) log({ failed }, 'some files could not be deleted during account deletion');
}

import { randomInt } from 'node:crypto';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError } from '../../http/errors';
import type { RequestMeta } from '../../http/route';
import { writeAudit } from '../audit/service';
import type { SessionContext } from './session';

/**
 * Two-step sign-in recovery codes (audit fix, 19 Nov 2026): ten one-time codes, made when
 * two-step sign-in is switched on and again whenever the person asks. Shown once, stored only as
 * keyed hashes, each usable once instead of a code from the app. Making new ones ends the old.
 */

export const RECOVERY_CODE_COUNT = 10;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
const PURPOSE = 'mfa-recovery-code';
const FIFTEEN_MINUTES_SECONDS = 15 * 60;

function newCode(): string {
  let code = '';
  for (let i = 0; i < 10; i += 1) code += ALPHABET[randomInt(ALPHABET.length)];
  return `${code.slice(0, 5)}-${code.slice(5)}`;
}

/** Keyed by the person too, so the same code for two people never collides or links them. */
function hashCode(deps: AppDeps, userId: string, normalised: string): string {
  return deps.secrets.hmac(PURPOSE, `${userId}:${normalised}`);
}

/** Replaces the person's codes, in the caller's system-scope transaction. Returns them, the only time they are seen. */
export async function replaceRecoveryCodes(deps: AppDeps, tx: Tx, input: { userId: string; organisationId: string | null; meta?: RequestMeta }): Promise<string[]> {
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, newCode);
  await tx.delete(schema.mfaRecoveryCode).where(eq(schema.mfaRecoveryCode.userId, input.userId));
  await tx.insert(schema.mfaRecoveryCode).values(codes.map((code) => ({ userId: input.userId, codeHash: hashCode(deps, input.userId, code.replace('-', '')) })));
  await writeAudit(tx, {
    organisationId: input.organisationId,
    actorId: input.userId,
    action: 'auth.mfa.recovery_codes_created',
    metadata: { count: RECOVERY_CODE_COUNT },
    ...(input.meta ? { meta: input.meta } : {}),
  });
  return codes;
}

export async function clearRecoveryCodes(tx: Tx, userId: string): Promise<void> {
  await tx.delete(schema.mfaRecoveryCode).where(eq(schema.mfaRecoveryCode.userId, userId));
}

function codeRefused(): AppError {
  return new AppError(400, 'totp_invalid', "That recovery code didn't work. Each one works only once.");
}

/** The second step of sign-in with a recovery code. Shares the app code's rate limit. */
export async function useRecoveryCode(deps: AppDeps, session: SessionContext, code: string, meta: RequestMeta): Promise<number> {
  if (!session.mfaEnabled) throw new AppError(409, 'mfa_not_enabled', 'Two-step sign-in is not on.');
  await deps.limiter.enforce(`totp:${session.userId}`, deps.config.rateLimits.totpPerUserPer15Min, FIFTEEN_MINUTES_SECONDS);
  const now = deps.now();
  const left = await deps.db.withSystem(async (tx) => {
    const used = await tx
      .update(schema.mfaRecoveryCode)
      .set({ usedAt: now })
      .where(and(eq(schema.mfaRecoveryCode.userId, session.userId), eq(schema.mfaRecoveryCode.codeHash, hashCode(deps, session.userId, code)), isNull(schema.mfaRecoveryCode.usedAt)))
      .returning({ id: schema.mfaRecoveryCode.id });
    if (used.length === 0) return null;
    await tx.update(schema.session).set({ mfaVerifiedAt: now }).where(eq(schema.session.id, session.sessionId));
    const [remaining] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.mfaRecoveryCode)
      .where(and(eq(schema.mfaRecoveryCode.userId, session.userId), isNull(schema.mfaRecoveryCode.usedAt)));
    const count = remaining?.count ?? 0;
    await writeAudit(tx, { organisationId: session.activeOrganisationId, actorId: session.userId, action: 'auth.mfa.recovery_code_used', metadata: { left: count }, meta });
    return count;
  });
  if (left === null) {
    await deps.db.withSystem((tx) => writeAudit(tx, { organisationId: session.activeOrganisationId, actorId: session.userId, action: 'auth.mfa.failed', metadata: { with: 'recovery_code' }, meta }));
    throw codeRefused();
  }
  return left;
}

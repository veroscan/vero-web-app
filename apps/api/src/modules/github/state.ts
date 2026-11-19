import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { safeEqual } from '../../lib/crypto';

/**
 * The `state` carried through GitHub's install page. Signed with a key derived from
 * APP_ENCRYPTION_KEY for this purpose only, bound to one organisation and one person, valid for
 * ten minutes and usable once. GitHub hands it back unchanged on the callback.
 */
const PURPOSE = 'github-install-state';
export const STATE_TTL_SECONDS = 10 * 60;

const payloadSchema = z.strictObject({
  o: z.uuid(),
  u: z.uuid(),
  n: z.string().regex(/^[A-Za-z0-9_-]{22}$/),
  e: z.number().int().positive(),
});

export const STATE_REFUSED = 'This GitHub link has expired, was already used, or is for someone else. Start connecting GitHub again.';

export function signInstallState(deps: Pick<AppDeps, 'secrets' | 'now'>, binding: { organisationId: string; userId: string }): { state: string; expiresAt: Date } {
  const expiresAt = new Date(deps.now().getTime() + STATE_TTL_SECONDS * 1000);
  const payload = { o: binding.organisationId, u: binding.userId, n: randomBytes(16).toString('base64url'), e: Math.floor(expiresAt.getTime() / 1000) };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return { state: `${body}.${deps.secrets.hmac(PURPOSE, body)}`, expiresAt };
}

/**
 * Which organisation a state belongs to, if its signature is ours. Used only to send the
 * person on to that organisation's callback; it neither checks expiry nor uses the state up.
 */
export function stateOrganisation(deps: Pick<AppDeps, 'secrets'>, state: string): string | null {
  const [body, signature, extra] = state.split('.');
  if (!body || !signature || extra !== undefined || !safeEqual(signature, deps.secrets.hmac(PURPOSE, body))) return null;
  try {
    return payloadSchema.parse(JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))).o;
  } catch {
    return null;
  }
}

/** Checks everything first, and only then uses the state up, so a wrong attempt can't burn a good link. */
export async function consumeInstallState(
  deps: Pick<AppDeps, 'secrets' | 'now' | 'db'>,
  state: string,
  binding: { organisationId: string; userId: string },
): Promise<{ issuedAt: Date }> {
  const [body, signature, extra] = state.split('.');
  if (!body || !signature || extra !== undefined || !safeEqual(signature, deps.secrets.hmac(PURPOSE, body))) throw errors.invalidInput(STATE_REFUSED);
  let parsed: z.infer<typeof payloadSchema>;
  try {
    parsed = payloadSchema.parse(JSON.parse(Buffer.from(body, 'base64url').toString('utf8')));
  } catch {
    throw errors.invalidInput(STATE_REFUSED);
  }
  if (parsed.e * 1000 <= deps.now().getTime()) throw errors.invalidInput(STATE_REFUSED);
  if (parsed.o !== binding.organisationId || parsed.u !== binding.userId) throw errors.invalidInput(STATE_REFUSED);
  const expiresAt = new Date(parsed.e * 1000);
  const used = await deps.db.withSystem((tx) =>
    tx.insert(schema.githubInstallStateUse).values({ nonce: parsed.n, expiresAt }).onConflictDoNothing().returning({ nonce: schema.githubInstallStateUse.nonce }),
  );
  if (used.length === 0) throw errors.invalidInput(STATE_REFUSED);
  return { issuedAt: new Date(expiresAt.getTime() - STATE_TTL_SECONDS * 1000) };
}

import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { safeEqual } from '../../lib/crypto';

/**
 * The OAuth `state` carried through DocuSign's sign-in page, exactly like GitHub's install
 * state: signed with a key derived from APP_ENCRYPTION_KEY for this purpose only, bound to one
 * organisation and one person, valid for ten minutes and usable once.
 */
const PURPOSE = 'docusign-oauth-state';
export const DOCUSIGN_STATE_TTL_SECONDS = 10 * 60;

const payloadSchema = z.strictObject({
  o: z.uuid(),
  u: z.uuid(),
  n: z.string().regex(/^[A-Za-z0-9_-]{22}$/),
  e: z.number().int().positive(),
});

export const DOCUSIGN_STATE_REFUSED = 'This DocuSign link has expired, was already used, or is for someone else. Start connecting DocuSign again.';

export function signDocusignState(deps: Pick<AppDeps, 'secrets' | 'now'>, binding: { organisationId: string; userId: string }): { state: string; expiresAt: Date } {
  const expiresAt = new Date(deps.now().getTime() + DOCUSIGN_STATE_TTL_SECONDS * 1000);
  const payload = { o: binding.organisationId, u: binding.userId, n: randomBytes(16).toString('base64url'), e: Math.floor(expiresAt.getTime() / 1000) };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return { state: `${body}.${deps.secrets.hmac(PURPOSE, body)}`, expiresAt };
}

function readState(deps: Pick<AppDeps, 'secrets'>, state: string): z.infer<typeof payloadSchema> | null {
  const [body, signature, extra] = state.split('.');
  if (!body || !signature || extra !== undefined || !safeEqual(signature, deps.secrets.hmac(PURPOSE, body))) return null;
  try {
    return payloadSchema.parse(JSON.parse(Buffer.from(body, 'base64url').toString('utf8')));
  } catch {
    return null;
  }
}

/** Which organisation a state names, if its signature is ours. Only to forward the person on; it neither checks expiry nor uses it up. */
export function docusignStateOrganisation(deps: Pick<AppDeps, 'secrets'>, state: string): string | null {
  return readState(deps, state)?.o ?? null;
}

/** Checks everything first, and only then uses the state up, so a wrong attempt can't burn a good link. */
export async function consumeDocusignState(deps: Pick<AppDeps, 'secrets' | 'now' | 'db'>, state: string, binding: { organisationId: string; userId: string }): Promise<void> {
  const parsed = readState(deps, state);
  if (!parsed) throw errors.invalidInput(DOCUSIGN_STATE_REFUSED);
  if (parsed.e * 1000 <= deps.now().getTime()) throw errors.invalidInput(DOCUSIGN_STATE_REFUSED);
  if (parsed.o !== binding.organisationId || parsed.u !== binding.userId) throw errors.invalidInput(DOCUSIGN_STATE_REFUSED);
  const used = await deps.db.withSystem((tx) =>
    tx.insert(schema.docusignOauthStateUse).values({ nonce: parsed.n, expiresAt: new Date(parsed.e * 1000) }).onConflictDoNothing().returning({ nonce: schema.docusignOauthStateUse.nonce }),
  );
  if (used.length === 0) throw errors.invalidInput(DOCUSIGN_STATE_REFUSED);
}

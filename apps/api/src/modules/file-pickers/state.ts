import { createHash, randomBytes } from 'node:crypto';
import type { FilePickerProvider } from '@vero/shared';
import { z } from 'zod';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { safeEqual } from '../../lib/crypto';

/**
 * The OAuth `state` for the Google Drive and SharePoint sign-ins, exactly like DocuSign's and
 * GitHub's: signed with a key derived from APP_ENCRYPTION_KEY for this purpose and this provider
 * only, bound to one organisation and one person, valid for ten minutes and usable once.
 *
 * PKCE: the code verifier is never sent anywhere until the code is exchanged, and never stored.
 * It is derived from the state's random nonce with a key only we hold, so the callback can
 * rebuild it, and someone who sees the state (it travels through the browser) cannot.
 */
export const PICKER_STATE_TTL_SECONDS = 10 * 60;

const payloadSchema = z.strictObject({
  p: z.enum(['google_drive', 'sharepoint']),
  o: z.uuid(),
  u: z.uuid(),
  n: z.string().regex(/^[A-Za-z0-9_-]{22}$/),
  e: z.number().int().positive(),
});
type Payload = z.infer<typeof payloadSchema>;

const purpose = (provider: FilePickerProvider) => `file-picker-oauth-state:${provider}`;
const pkcePurpose = (provider: FilePickerProvider) => `file-picker-pkce:${provider}`;

export function stateRefusedMessage(name: string): string {
  return `This ${name} link has expired, was already used, or is for someone else. Start connecting ${name} again.`;
}

/** The S256 challenge for a verifier (RFC 7636): base64url of its SHA-256, no padding. */
export function pkceChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

function verifierFor(deps: Pick<AppDeps, 'secrets'>, provider: FilePickerProvider, nonce: string): string {
  // 64 hex characters: within RFC 7636's 43 to 128 unreserved characters.
  return deps.secrets.hmac(pkcePurpose(provider), nonce);
}

export function signPickerState(
  deps: Pick<AppDeps, 'secrets' | 'now'>,
  provider: FilePickerProvider,
  binding: { organisationId: string; userId: string },
): { state: string; expiresAt: Date; codeChallenge: string } {
  const expiresAt = new Date(deps.now().getTime() + PICKER_STATE_TTL_SECONDS * 1000);
  const payload: Payload = { p: provider, o: binding.organisationId, u: binding.userId, n: randomBytes(16).toString('base64url'), e: Math.floor(expiresAt.getTime() / 1000) };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return { state: `${body}.${deps.secrets.hmac(purpose(provider), body)}`, expiresAt, codeChallenge: pkceChallenge(verifierFor(deps, provider, payload.n)) };
}

function readState(deps: Pick<AppDeps, 'secrets'>, provider: FilePickerProvider, state: string): Payload | null {
  const [body, signature, extra] = state.split('.');
  if (!body || !signature || extra !== undefined || !safeEqual(signature, deps.secrets.hmac(purpose(provider), body))) return null;
  try {
    const parsed = payloadSchema.parse(JSON.parse(Buffer.from(body, 'base64url').toString('utf8')));
    return parsed.p === provider ? parsed : null;
  } catch {
    return null;
  }
}

/** Which organisation a state names, if its signature is ours. Only to forward the person on; it neither checks expiry nor uses it up. */
export function pickerStateOrganisation(deps: Pick<AppDeps, 'secrets'>, provider: FilePickerProvider, state: string): string | null {
  return readState(deps, provider, state)?.o ?? null;
}

/**
 * Checks everything first, and only then uses the state up, so a wrong attempt can't burn a
 * good link. Returns the PKCE code verifier for the code exchange.
 */
export async function consumePickerState(
  deps: Pick<AppDeps, 'secrets' | 'now' | 'db'>,
  provider: FilePickerProvider,
  name: string,
  state: string,
  binding: { organisationId: string; userId: string },
): Promise<{ codeVerifier: string }> {
  const refused = () => errors.invalidInput(stateRefusedMessage(name));
  const parsed = readState(deps, provider, state);
  if (!parsed) throw refused();
  if (parsed.e * 1000 <= deps.now().getTime()) throw refused();
  if (parsed.o !== binding.organisationId || parsed.u !== binding.userId) throw refused();
  const used = await deps.db.withSystem((tx) =>
    tx
      .insert(schema.filePickerOauthStateUse)
      .values({ nonce: parsed.n, provider, expiresAt: new Date(parsed.e * 1000) })
      .onConflictDoNothing()
      .returning({ nonce: schema.filePickerOauthStateUse.nonce }),
  );
  if (used.length === 0) throw refused();
  return { codeVerifier: verifierFor(deps, provider, parsed.n) };
}

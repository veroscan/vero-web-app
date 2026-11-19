import { z } from 'zod';
import type { Secrets } from '../../lib/crypto';

/**
 * DocuSign's tokens, sealed at rest. AES-256-GCM (the project's `Secrets`) under a key derived
 * from APP_ENCRYPTION_KEY for this purpose and this organisation, so a sealed value copied to
 * another organisation's row, or changed by one bit, does not open. The stored form is
 * versioned ("v1." then base64) so the scheme can change later without guessing.
 */
const VERSION = 'v1';
const PURPOSE = 'docusign-tokens';

export interface DocusignTokens {
  accessToken: string;
  refreshToken: string;
}

const sealedSchema = z.strictObject({ a: z.string().min(1).max(8000), r: z.string().min(1).max(8000) });

/** Thrown when a sealed value can't be opened. Its message never contains the value. */
export class SealedTokensError extends Error {
  override name = 'SealedTokensError';
  constructor() {
    super('The stored DocuSign access could not be read.');
  }
}

export function sealTokens(secrets: Secrets, organisationId: string, tokens: DocusignTokens): string {
  const plain = JSON.stringify({ a: tokens.accessToken, r: tokens.refreshToken });
  return `${VERSION}.${secrets.encryptString(`${PURPOSE}:${organisationId}`, plain)}`;
}

export function openTokens(secrets: Secrets, organisationId: string, sealed: string): DocusignTokens {
  const dot = sealed.indexOf('.');
  if (dot < 0 || sealed.slice(0, dot) !== VERSION) throw new SealedTokensError();
  try {
    const parsed = sealedSchema.parse(JSON.parse(secrets.decryptString(`${PURPOSE}:${organisationId}`, sealed.slice(dot + 1))));
    return { accessToken: parsed.a, refreshToken: parsed.r };
  } catch {
    throw new SealedTokensError();
  }
}

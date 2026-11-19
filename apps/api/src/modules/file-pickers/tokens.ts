import type { FilePickerProvider } from '@vero/shared';
import { z } from 'zod';
import type { Secrets } from '../../lib/crypto';

/**
 * A picker connection's tokens, sealed at rest the same way as DocuSign's: AES-256-GCM (the
 * project's `Secrets`) under a key derived from APP_ENCRYPTION_KEY for this purpose, this
 * provider and this organisation. A sealed value copied to another organisation's row, to the
 * other provider, or changed by one bit does not open. Stored as "v1." then base64.
 */
const VERSION = 'v1';
const purpose = (provider: FilePickerProvider, organisationId: string) => `file-picker-tokens:${provider}:${organisationId}`;

export interface PickerTokens {
  accessToken: string;
  refreshToken: string;
}

const sealedSchema = z.strictObject({ a: z.string().min(1).max(16000), r: z.string().min(1).max(16000) });

/** Thrown when a sealed value can't be opened. Its message never contains the value. */
export class SealedPickerTokensError extends Error {
  override name = 'SealedPickerTokensError';
  constructor() {
    super('The stored access could not be read.');
  }
}

export function sealPickerTokens(secrets: Secrets, provider: FilePickerProvider, organisationId: string, tokens: PickerTokens): string {
  return `${VERSION}.${secrets.encryptString(purpose(provider, organisationId), JSON.stringify({ a: tokens.accessToken, r: tokens.refreshToken }))}`;
}

export function openPickerTokens(secrets: Secrets, provider: FilePickerProvider, organisationId: string, sealed: string): PickerTokens {
  const dot = sealed.indexOf('.');
  if (dot < 0 || sealed.slice(0, dot) !== VERSION) throw new SealedPickerTokensError();
  try {
    const parsed = sealedSchema.parse(JSON.parse(secrets.decryptString(purpose(provider, organisationId), sealed.slice(dot + 1))));
    return { accessToken: parsed.a, refreshToken: parsed.r };
  } catch {
    throw new SealedPickerTokensError();
  }
}

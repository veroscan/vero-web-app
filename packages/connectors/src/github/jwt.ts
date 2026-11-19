import { createPrivateKey, sign, type KeyObject } from 'node:crypto';

/** GitHub refuses app tokens that live longer than 10 minutes. We use 9, with the clock set back a minute for drift. */
export const APP_JWT_LIFETIME_SECONDS = 9 * 60;
const CLOCK_DRIFT_SECONDS = 60;

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

/**
 * The GitHub App's own token: RS256, signed with node:crypto, no library. It only proves we
 * are the app; it reads nothing from any repository.
 */
export function createAppJwt(appId: string, privateKey: KeyObject, now: Date): string {
  const issuedAt = Math.floor(now.getTime() / 1000) - CLOCK_DRIFT_SECONDS;
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ iat: issuedAt, exp: issuedAt + CLOCK_DRIFT_SECONDS + APP_JWT_LIFETIME_SECONDS, iss: appId }));
  const signature = sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), privateKey);
  return `${header}.${payload}.${base64url(signature)}`;
}

export class InvalidPrivateKeyError extends Error {
  override name = 'InvalidPrivateKeyError';
  constructor() {
    // Never the key, or any part of it.
    super('The GitHub App private key could not be read. It must be the PEM file GitHub gave you.');
  }
}

/**
 * Reads the PEM. Accepts a literal with `\n` escapes, as environment variables often carry it.
 * The result is a KeyObject: it prints as an empty object, so it cannot leak through a log line.
 */
export function parseGithubPrivateKey(pem: string): KeyObject {
  const text = pem.includes('\\n') ? pem.replace(/\\n/g, '\n') : pem;
  try {
    const key = createPrivateKey({ key: text.trim(), format: 'pem' });
    if (key.asymmetricKeyType !== 'rsa') throw new InvalidPrivateKeyError();
    return key;
  } catch {
    throw new InvalidPrivateKeyError();
  }
}

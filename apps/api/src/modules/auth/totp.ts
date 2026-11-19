import { Secret, TOTP } from 'otpauth';

const PERIOD_SECONDS = 30;

function totpFor(base32Secret: string, label: string): TOTP {
  return new TOTP({
    issuer: 'Vero',
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: PERIOD_SECONDS,
    secret: Secret.fromBase32(base32Secret),
  });
}

export function newTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

export function totpUri(base32Secret: string, email: string): string {
  return totpFor(base32Secret, email).toString();
}

/**
 * Checks a code, allowing one step either side for clock drift. Returns the time step the
 * code belongs to, or null. The caller records the step so the same code cannot be reused.
 */
export function matchTotpStep(base32Secret: string, code: string, now: Date): number | null {
  const delta = totpFor(base32Secret, 'check').validate({ token: code, timestamp: now.getTime(), window: 1 });
  if (delta === null) return null;
  return Math.floor(now.getTime() / 1000 / PERIOD_SECONDS) + delta;
}

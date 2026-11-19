import { z } from 'zod';
import { RedactedSecret } from '../docusign/config';

const emptyToUndefined = (value: unknown): unknown => (value === '' ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());

const envSchema = z.object({
  /** Stripe's secret key (sk_live_... or sk_test_...). Never logged. */
  STRIPE_SECRET_KEY: optionalString,
  /** The signing secret Stripe shows for this webhook endpoint (whsec_...). Never logged. */
  STRIPE_WEBHOOK_SECRET: optionalString,
  /** Stripe price ids for each paid plan. Amounts come from Stripe, never from here. */
  STRIPE_PRICE_GROWTH: optionalString,
  STRIPE_PRICE_SCALE: optionalString,
});

export interface BillingConfig {
  secretKey: RedactedSecret;
  webhookSecret: RedactedSecret;
  prices: { growth: string; scale: string };
}

const NAMES = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PRICE_GROWTH', 'STRIPE_PRICE_SCALE'] as const;

/**
 * Payments are on only when all four Stripe settings are set (owner's decision, 19 Nov 2026).
 * None set: off, and an admin changes plans by hand. Some but not all: refuse to start, so a
 * half-set-up checkout can never take money it can't record.
 */
export function resolveBilling(source: NodeJS.ProcessEnv): BillingConfig | undefined {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) throw new Error('Invalid configuration. The STRIPE_* settings could not be read.');
  const env = parsed.data;
  const set = NAMES.filter((name) => env[name] !== undefined);
  if (set.length === 0) return undefined;
  if (set.length !== NAMES.length) {
    const missing = NAMES.filter((name) => env[name] === undefined);
    throw new Error(`Set all of the Stripe settings, or none. Missing: ${missing.join(', ')}.`);
  }
  if (!/^(sk|rk)_(live|test)_/.test(env.STRIPE_SECRET_KEY ?? '')) throw new Error('STRIPE_SECRET_KEY must be a Stripe secret or restricted key.');
  if (!(env.STRIPE_WEBHOOK_SECRET ?? '').startsWith('whsec_')) throw new Error('STRIPE_WEBHOOK_SECRET must be the signing secret Stripe shows for the webhook.');
  for (const name of ['STRIPE_PRICE_GROWTH', 'STRIPE_PRICE_SCALE'] as const) {
    if (!(env[name] ?? '').startsWith('price_')) throw new Error(`${name} must be a Stripe price id (price_...).`);
  }
  return {
    secretKey: new RedactedSecret(env.STRIPE_SECRET_KEY ?? ''),
    webhookSecret: new RedactedSecret(env.STRIPE_WEBHOOK_SECRET ?? ''),
    prices: { growth: env.STRIPE_PRICE_GROWTH ?? '', scale: env.STRIPE_PRICE_SCALE ?? '' },
  };
}

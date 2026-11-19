import { z } from 'zod';
import { RedactedSecret } from '../docusign/config';

const emptyToUndefined = (value: unknown): unknown => (value === '' ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const positiveInt = (fallback: number) => z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(fallback));

const envSchema = z.object({
  /** The domain the forwarding addresses live on, for example in.<your domain>. Its MX records point at Resend. */
  INBOUND_EMAIL_DOMAIN: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .toLowerCase()
      .regex(/^(?=.{4,200}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/, { error: 'INBOUND_EMAIL_DOMAIN must be a plain domain name' })
      .optional(),
  ),
  /** The signing secret Resend shows for the receiving webhook (starts with whsec_). Never logged. */
  INBOUND_EMAIL_WEBHOOK_SECRET: optionalString,
  /** Optional: a separate Resend key allowed to read received emails. Otherwise RESEND_API_KEY is used. */
  INBOUND_EMAIL_RESEND_API_KEY: optionalString,
  RESEND_API_KEY: optionalString,
  INBOUND_EMAIL_RESEND_API_URL: z.preprocess(emptyToUndefined, z.url().default('https://api.resend.com')),
  INBOUND_EMAIL_MAX_ATTACHMENTS: positiveInt(10),
  INBOUND_EMAIL_MAX_DOCUMENTS_PER_ORG_PER_DAY: positiveInt(50),
  /** All the attachments of one email together. */
  INBOUND_EMAIL_MAX_TOTAL_MB: positiveInt(50),
});

export interface InboundEmailConfig {
  domain: string;
  /** The decoded Svix signing key. */
  webhookKey: RedactedSecret;
  resendApiKey: RedactedSecret;
  resendApiUrl: string;
  maxAttachments: number;
  maxDocumentsPerOrgPerDay: number;
  maxTotalBytes: number;
  /** How old a signed webhook may be before it is refused. */
  toleranceSeconds: number;
}

/** Resend signs webhooks with Svix: the secret is "whsec_" and then the key in base64. */
function decodeSigningSecret(secret: string): string {
  const key = Buffer.from(secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret, 'base64');
  if (key.length < 16) throw new Error('INBOUND_EMAIL_WEBHOOK_SECRET must be the signing secret Resend shows for the webhook.');
  return key.toString('base64');
}

/**
 * Forwarding by email, only when the domain, the webhook signing secret and a Resend key are all
 * set. Otherwise it is off and every route says so.
 */
export function resolveInboundEmail(source: NodeJS.ProcessEnv): InboundEmailConfig | undefined {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid configuration. ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
  }
  const env = parsed.data;
  const apiKey = env.INBOUND_EMAIL_RESEND_API_KEY ?? env.RESEND_API_KEY;
  if (!env.INBOUND_EMAIL_DOMAIN || !env.INBOUND_EMAIL_WEBHOOK_SECRET || !apiKey) return undefined;
  const url = new URL(env.INBOUND_EMAIL_RESEND_API_URL);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('INBOUND_EMAIL_RESEND_API_URL must be a plain https address.');
  return {
    domain: env.INBOUND_EMAIL_DOMAIN,
    webhookKey: new RedactedSecret(decodeSigningSecret(env.INBOUND_EMAIL_WEBHOOK_SECRET)),
    resendApiKey: new RedactedSecret(apiKey),
    resendApiUrl: env.INBOUND_EMAIL_RESEND_API_URL.replace(/\/+$/, ''),
    maxAttachments: Math.min(env.INBOUND_EMAIL_MAX_ATTACHMENTS, 50),
    maxDocumentsPerOrgPerDay: env.INBOUND_EMAIL_MAX_DOCUMENTS_PER_ORG_PER_DAY,
    maxTotalBytes: env.INBOUND_EMAIL_MAX_TOTAL_MB * 1024 * 1024,
    toleranceSeconds: 5 * 60,
  };
}

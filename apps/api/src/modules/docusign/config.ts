import { inspect } from 'node:util';
import { z } from 'zod';

/**
 * A value that refuses to be printed: JSON, string conversion and util.inspect all give
 * [redacted]. Only reveal() gives it, and only the code that sends it to the provider calls it.
 */
export class RedactedSecret {
  readonly #value: string;
  constructor(value: string) {
    this.#value = value;
  }
  reveal(): string {
    return this.#value;
  }
  toJSON(): string {
    return '[redacted]';
  }
  toString(): string {
    return '[redacted]';
  }
  [inspect.custom](): string {
    return '[redacted]';
  }
}

const emptyToUndefined = (value: unknown): unknown => (value === '' ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const positiveInt = (fallback: number) => z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(fallback));

const envSchema = z.object({
  /** The integration key (client id) from DocuSign's Apps and Keys page. */
  DOCUSIGN_INTEGRATION_KEY: z.preprocess(emptyToUndefined, z.string().regex(/^[0-9A-Fa-f-]{36}$/, { error: 'DOCUSIGN_INTEGRATION_KEY must be the integration key DocuSign shows (a GUID)' }).optional()),
  /** The secret key for that integration key. Never logged. */
  DOCUSIGN_SECRET_KEY: optionalString,
  /** demo: DocuSign's developer environment. production: only after DocuSign's go-live review. */
  DOCUSIGN_ENV: z.preprocess(emptyToUndefined, z.enum(['demo', 'production']).default('demo')),
  /** How far back the list of completed envelopes looks. */
  DOCUSIGN_LIST_DAYS: positiveInt(90),
  /** The most completed envelopes listed at once for the person to pick from. */
  DOCUSIGN_MAX_ENVELOPES_LISTED: positiveInt(50),
  /** The most envelopes brought in by one pick. */
  DOCUSIGN_MAX_ENVELOPES_PER_PULL: positiveInt(10),
  /** The most envelopes one organisation can bring in per day. */
  DOCUSIGN_MAX_ENVELOPES_PER_ORG_PER_DAY: positiveInt(50),
});

export interface DocusignConfig {
  integrationKey: string;
  secretKey: RedactedSecret;
  environment: 'demo' | 'production';
  /** DocuSign's account server: sign-in, tokens and userinfo. */
  oauthUrl: string;
  /** Must be registered on the integration key exactly as written. */
  redirectUri: string;
  listDays: number;
  maxEnvelopesListed: number;
  maxEnvelopesPerPull: number;
  maxEnvelopesPerOrgPerDay: number;
}

/** DocuSign's account servers, from its Authorization Code Grant guide. */
export const DOCUSIGN_OAUTH_HOSTS = { demo: 'https://account-d.docusign.com', production: 'https://account.docusign.com' } as const;

/** The fixed address DocuSign sends people back to. Register it on the integration key. */
export const DOCUSIGN_REDIRECT_PATH = '/v1/connections/docusign/callback';

/**
 * DocuSign, only when both the integration key and its secret are set. Neither set means the
 * connection is off, not an error. Only one of them set stops start-up, with a message that
 * never contains either value.
 */
export function resolveDocusign(source: NodeJS.ProcessEnv, apiBaseUrl: string): DocusignConfig | undefined {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid configuration. ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
  }
  const env = parsed.data;
  if (!env.DOCUSIGN_INTEGRATION_KEY && !env.DOCUSIGN_SECRET_KEY) return undefined;
  if (!env.DOCUSIGN_INTEGRATION_KEY || !env.DOCUSIGN_SECRET_KEY) throw new Error('Set both DOCUSIGN_INTEGRATION_KEY and DOCUSIGN_SECRET_KEY, or neither.');
  return {
    integrationKey: env.DOCUSIGN_INTEGRATION_KEY,
    secretKey: new RedactedSecret(env.DOCUSIGN_SECRET_KEY),
    environment: env.DOCUSIGN_ENV,
    oauthUrl: DOCUSIGN_OAUTH_HOSTS[env.DOCUSIGN_ENV],
    redirectUri: `${apiBaseUrl.replace(/\/+$/, '')}${DOCUSIGN_REDIRECT_PATH}`,
    listDays: env.DOCUSIGN_LIST_DAYS,
    maxEnvelopesListed: Math.min(env.DOCUSIGN_MAX_ENVELOPES_LISTED, 100),
    maxEnvelopesPerPull: env.DOCUSIGN_MAX_ENVELOPES_PER_PULL,
    maxEnvelopesPerOrgPerDay: env.DOCUSIGN_MAX_ENVELOPES_PER_ORG_PER_DAY,
  };
}

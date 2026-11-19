import type { KeyObject } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { inspect } from 'node:util';
import { InvalidPrivateKeyError, parseGithubPrivateKey } from '@vero/connectors';
import { resolve } from 'node:path';
import { z } from 'zod';
import { resolveDocusign, type DocusignConfig } from './modules/docusign/config';
import { resolveBilling, type BillingConfig } from './modules/billing/config';
import { resolveInboundEmail, type InboundEmailConfig } from './modules/inbound-email/config';
import { resolveGoogleDrive, type GoogleDriveConfig } from './modules/google-drive/config';
import { resolveSharepoint, type SharepointConfig } from './modules/sharepoint/config';

const REPO_ROOT = resolve(import.meta.dirname, '..', '..', '..');

/**
 * Local convenience: reads .env, or .env.example when there is no .env. Values already in
 * the environment win. In production nothing is read from files.
 */
export function loadLocalEnv(rootDir: string = REPO_ROOT): void {
  if (process.env.NODE_ENV === 'production') return;
  for (const name of ['.env', '.env.example']) {
    const file = resolve(rootDir, name);
    if (existsSync(file)) {
      process.loadEnvFile(file);
      return;
    }
  }
}

const emptyToUndefined = (value: unknown): unknown => (value === '' ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const flag = (fallback: boolean) =>
  z.preprocess(emptyToUndefined, z.enum(['true', 'false']).default(fallback ? 'true' : 'false')).transform((v) => v === 'true');
const positiveInt = (fallback: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(fallback));

const envSchema = z.object({
  NODE_ENV: z.preprocess(emptyToUndefined, z.enum(['development', 'test', 'production']).default('development')),
  LOG_LEVEL: z.preprocess(
    emptyToUndefined,
    z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  ),
  API_HOST: z.preprocess(emptyToUndefined, z.string().default('127.0.0.1')),
  API_PORT: positiveInt(4000),
  API_BASE_URL: z.url(),
  WEB_BASE_URL: z.url(),
  ALLOWED_ORIGINS: z.string().min(1),
  TRUST_PROXY: flag(false),
  COOKIE_SECURE: flag(true),
  DATABASE_URL: z.string().min(1),
  APP_ENCRYPTION_KEY: z.string().refine((value) => Buffer.from(value, 'base64').length === 32, {
    error: 'APP_ENCRYPTION_KEY must be 32 bytes, base64 encoded',
  }),
  RATE_LIMIT_GLOBAL_PER_MINUTE: positiveInt(300),
  RATE_LIMIT_MAGIC_LINK_PER_EMAIL_PER_HOUR: positiveInt(5),
  RATE_LIMIT_MAGIC_LINK_PER_IP_PER_HOUR: positiveInt(30),
  RATE_LIMIT_VERIFY_PER_IP_PER_15_MIN: positiveInt(30),
  RATE_LIMIT_TOTP_PER_USER_PER_15_MIN: positiveInt(5),
  RATE_LIMIT_INVITATIONS_PER_ORG_PER_DAY: positiveInt(50),
  RESEND_API_KEY: optionalString,
  MAIL_FROM: z.preprocess(emptyToUndefined, z.string().default('Vero <no-reply@vero.example>')),
  VALKEY_URL: optionalString,
  SPACES_ENDPOINT: optionalString,
  SPACES_REGION: optionalString,
  SPACES_BUCKET: optionalString,
  SPACES_KEY: optionalString,
  SPACES_SECRET: optionalString,
  LOCAL_FILE_DIR: z.preprocess(emptyToUndefined, z.string().default('.data/files')),
  CONNECTOR_MODE: optionalString,
  CONNECTOR_TIMEOUT_MS: positiveInt(20_000),
  SCAN_LEASE_SECONDS: positiveInt(300),
  SOURCE_RETRY_MINUTES: positiveInt(15),
  /** How long a paid vendor's good answer is reused before we pay for a new one. */
  VENDOR_CACHE_DAYS: positiveInt(30),
  /** Development only: save live provider responses here, with secrets and personal data removed. */
  CONNECTOR_RECORD_DIR: optionalString,
  MAX_UPLOAD_MB: positiveInt(25),
  RATE_LIMIT_CHECK_AGAIN_PER_COMPANY_PER_HOUR: positiveInt(6),
  RATE_LIMIT_REGISTRY_SEARCH_PER_ORG_PER_HOUR: positiveInt(120),
  RATE_LIMIT_PUBLIC_PER_IP_PER_MINUTE: positiveInt(30),
  RATE_LIMIT_LOOKUP_REQUESTS_PER_ORG_PER_DAY: positiveInt(20),
  /** Development only. Production refuses to start with this set. */
  PLAN_OVERRIDE: z.preprocess(emptyToUndefined, z.enum(['free', 'growth', 'scale']).optional()),
  /** Where order and booking alerts are emailed. Without it they only reach the review desk feed. */
  /** Off until the owner says so: with it off, the reference refresh jobs download nothing. */
  REFERENCE_REFRESH_ENABLED: flag(false),
  /** A plain name for us, sent when downloading the public lists. No contact details. */
  REFERENCE_USER_AGENT: z.preprocess(emptyToUndefined, z.string().min(1).max(200).default('VeroScan reference-data refresh')),
  /** ICO and NDPC copies older than this give "unavailable", not an answer. */
  REFERENCE_MAX_AGE_HOURS: positiveInt(48),
  /** Sanctions copies older than this give "unavailable", never "no match". */
  REFERENCE_SANCTIONS_MAX_AGE_HOURS: positiveInt(24),
  /** Where the refresh job downloads the ICO register file from. Not set by default: see ENGINE-ACCOUNTS-AND-KEYS.md. */
  ICO_REGISTER_URL: optionalString,
  /** Also read by the NDPC connector. */
  NDPC_REGISTER_URL: optionalString,
  /** Also read by the sanctions connector: any of ofac,uk,un,fr (fr: the French asset-freeze register). */
  SANCTIONS_LISTS: optionalString,
  /** Where the refresh job downloads the CNIL DPO list (France). Also switches the fr.cnil_dpo source on. */
  FR_CNIL_DPO_URL: optionalString,
  /** Off until the owner says so: with it off, no monitoring re-scan is queued. */
  MONITORING_ENABLED: flag(false),
  MONITORING_MAX_SCANS_PER_ORG_PER_DAY: positiveInt(20),
  /** Across every organisation, per day. */
  MONITORING_MAX_SCANS_PER_DAY: positiveInt(500),
  /** Off until the owner says so. Even on, an organisation must also switch it on for itself. */
  AI_DOCUMENT_HELPER_ENABLED: flag(false),
  /** Read only to tell whether it is set. The SDK reads the value itself; we never hold or log it. */
  ANTHROPIC_API_KEY: optionalString,
  /** An owner cost decision: a cheaper tier (claude-sonnet-5-5, claude-haiku-5-5) is just this setting. */
  CLAUDE_MODEL: z.preprocess(emptyToUndefined, z.string().regex(/^[a-z0-9.-]+$/).default('claude-opus-5-5')),
  DOCUMENT_HELPER_EFFORT: z.preprocess(emptyToUndefined, z.enum(['low', 'medium', 'high', 'xhigh', 'max']).default('medium')),
  DOCUMENT_HELPER_MAX_PAGES: positiveInt(50),
  DOCUMENT_HELPER_MAX_PER_ORG_PER_DAY: positiveInt(100),
  DOCUMENT_HELPER_TIMEOUT_MS: positiveInt(90_000),
  DOCUMENT_HELPER_MAX_TOKENS: positiveInt(8_000),
  /** Not set by default: whether documents must stay in one region is an open owner decision. */
  ANTHROPIC_INFERENCE_GEO: optionalString,
  /** The GitHub App. All four of id, slug, private key and webhook secret must be set, or the GitHub connection is off. */
  GITHUB_APP_ID: z.preprocess(emptyToUndefined, z.string().regex(/^\d{1,12}$/, { error: 'GITHUB_APP_ID must be the number GitHub shows for the app' }).optional()),
  GITHUB_APP_SLUG: z.preprocess(emptyToUndefined, z.string().regex(/^[a-z0-9][a-z0-9-]{0,99}$/, { error: 'GITHUB_APP_SLUG must be the app name as it appears in its GitHub address' }).optional()),
  /** The PEM itself, with newlines written as \n. Prefer GITHUB_APP_PRIVATE_KEY_FILE. Never logged. */
  GITHUB_APP_PRIVATE_KEY: optionalString,
  GITHUB_APP_PRIVATE_KEY_FILE: optionalString,
  /** Never logged. */
  GITHUB_WEBHOOK_SECRET: optionalString,
  GITHUB_API_URL: z.preprocess(emptyToUndefined, z.url().default('https://api.github.com')),
  /** Where people install the app. github.com, or the GitHub Enterprise address. */
  GITHUB_WEB_URL: z.preprocess(emptyToUndefined, z.url().default('https://github.com')),
  GITHUB_MAX_REPOS_PER_ORG: positiveInt(25),
  /** File requests per sync, across all repositories. Each repository asks for at most 27 allowlisted paths. */
  GITHUB_MAX_FILES_PER_SYNC: positiveInt(800),
});

export interface SpacesConfig {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
}

export interface RateLimits {
  globalPerMinute: number;
  magicLinkPerEmailPerHour: number;
  magicLinkPerIpPerHour: number;
  verifyPerIpPer15Min: number;
  totpPerUserPer15Min: number;
  invitationsPerOrgPerDay: number;
  checkAgainPerCompanyPerHour: number;
  registrySearchPerOrgPerHour: number;
  publicPerIpPerMinute: number;
  lookupRequestsPerOrgPerDay: number;
}

export interface Config {
  nodeEnv: 'development' | 'test' | 'production';
  logLevel: string;
  host: string;
  port: number;
  apiBaseUrl: string;
  webBaseUrl: string;
  allowedOrigins: string[];
  trustProxy: boolean;
  cookieSecure: boolean;
  databaseUrl: string;
  encryptionKey: string;
  rateLimits: RateLimits;
  /** Never printed: SecretText gives [redacted] to JSON, strings and logs. */
  resendApiKey?: SecretText;
  mailFrom: string;
  valkeyUrl?: string;
  spaces?: SpacesConfig;
  localFileDir: string;
  connectorMode: 'live' | 'fixture';
  connectorTimeoutMs: number;
  scanLeaseSeconds: number;
  sourceRetryMinutes: number;
  vendorCacheDays: number;
  maxUploadBytes: number;
  planOverride?: 'free' | 'growth' | 'scale';
  reference: ReferenceConfig;
  monitoring: MonitoringConfig;
  documentHelper: DocumentHelperConfig;
  /** Only when every GitHub App setting is present. Otherwise the GitHub connection says "not connected yet". */
  github?: GithubConfig;
  /** Only when DOCUSIGN_INTEGRATION_KEY and DOCUSIGN_SECRET_KEY are both set. */
  docusign?: DocusignConfig;
  /** Only when INBOUND_EMAIL_DOMAIN, INBOUND_EMAIL_WEBHOOK_SECRET and a Resend key are all set. */
  inboundEmail?: InboundEmailConfig;
  /** Only when the Google OAuth client, the Picker's browser key and the project number are all set. */
  googleDrive?: GoogleDriveConfig;
  /** Only when MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET are both set. */
  sharepoint?: SharepointConfig;
  /** Stripe, only when all four STRIPE_* settings are set. Otherwise payments are off and an admin changes plans. */
  billing?: BillingConfig;
}

/**
 * A secret that refuses to be printed: JSON, string conversion and util.inspect all give
 * [redacted]. Only reveal() gives the value, and only the webhook check calls it.
 */
export class SecretText {
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

export interface GithubConfig {
  appId: string;
  slug: string;
  /** A KeyObject: it prints as an empty object, so it cannot leak through a log line. */
  privateKey: KeyObject;
  webhookSecret: SecretText;
  apiUrl: string;
  webUrl: string;
  maxReposPerOrg: number;
  maxFilesPerSync: number;
}

export type DocumentHelperEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

/** The Claude document helper. It holds no key: only whether one is set. */
export interface DocumentHelperConfig {
  enabled: boolean;
  apiKeySet: boolean;
  model: string;
  effort: DocumentHelperEffort;
  maxPages: number;
  maxPerOrgPerDay: number;
  timeoutMs: number;
  maxTokens: number;
  inferenceGeo?: string;
}

export interface ReferenceConfig {
  refreshEnabled: boolean;
  userAgent: string;
  maxAgeHours: number;
  sanctionsMaxAgeHours: number;
  /** The settings the refresh job reads its addresses from. */
  sourceEnv: { ICO_REGISTER_URL?: string; NDPC_REGISTER_URL?: string; SANCTIONS_LISTS?: string; FR_CNIL_DPO_URL?: string };
}

export interface MonitoringConfig {
  enabled: boolean;
  maxScansPerOrgPerDay: number;
  maxScansPerDay: number;
}

/** https only, except a local address for tests and development. */
function assertGithubUrl(name: string, value: string): void {
  const url = new URL(value);
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) throw new Error(`${name} must use https.`);
  if (url.username || url.password || url.search || url.hash) throw new Error(`${name} must be a plain address.`);
}

/**
 * The GitHub App, only when id, slug, private key and webhook secret are all set. Any missing
 * means the connection is off, not an error. A key that is set but unreadable stops start-up,
 * with a message that never contains the key.
 */
function resolveGithub(env: z.output<typeof envSchema>): GithubConfig | undefined {
  assertGithubUrl('GITHUB_API_URL', env.GITHUB_API_URL);
  assertGithubUrl('GITHUB_WEB_URL', env.GITHUB_WEB_URL);
  if (env.GITHUB_APP_PRIVATE_KEY && env.GITHUB_APP_PRIVATE_KEY_FILE) {
    throw new Error('Set GITHUB_APP_PRIVATE_KEY or GITHUB_APP_PRIVATE_KEY_FILE, not both.');
  }
  let pem = env.GITHUB_APP_PRIVATE_KEY;
  if (env.GITHUB_APP_PRIVATE_KEY_FILE) {
    try {
      pem = readFileSync(resolve(REPO_ROOT, env.GITHUB_APP_PRIVATE_KEY_FILE), 'utf8');
    } catch {
      throw new Error('GITHUB_APP_PRIVATE_KEY_FILE could not be read.');
    }
  }
  if (!env.GITHUB_APP_ID || !env.GITHUB_APP_SLUG || !pem || !env.GITHUB_WEBHOOK_SECRET) return undefined;
  if (env.GITHUB_WEBHOOK_SECRET.length < 20) throw new Error('GITHUB_WEBHOOK_SECRET must be at least 20 characters.');
  let privateKey: KeyObject;
  try {
    privateKey = parseGithubPrivateKey(pem);
  } catch (error) {
    if (error instanceof InvalidPrivateKeyError) throw new Error(error.message);
    throw new Error('The GitHub App private key could not be read.');
  }
  return {
    appId: env.GITHUB_APP_ID,
    slug: env.GITHUB_APP_SLUG,
    privateKey,
    webhookSecret: new SecretText(env.GITHUB_WEBHOOK_SECRET),
    apiUrl: env.GITHUB_API_URL.replace(/\/+$/, ''),
    webUrl: env.GITHUB_WEB_URL.replace(/\/+$/, ''),
    maxReposPerOrg: env.GITHUB_MAX_REPOS_PER_ORG,
    maxFilesPerSync: env.GITHUB_MAX_FILES_PER_SYNC,
  };
}

function resolveSpaces(env: z.output<typeof envSchema>): SpacesConfig | undefined {
  const values = [env.SPACES_ENDPOINT, env.SPACES_REGION, env.SPACES_BUCKET, env.SPACES_KEY, env.SPACES_SECRET];
  const set = values.filter((value) => value !== undefined).length;
  if (set === 0) return undefined;
  if (set !== values.length) {
    throw new Error('Set all of SPACES_ENDPOINT, SPACES_REGION, SPACES_BUCKET, SPACES_KEY and SPACES_SECRET, or none.');
  }
  return {
    endpoint: env.SPACES_ENDPOINT as string,
    region: env.SPACES_REGION as string,
    bucket: env.SPACES_BUCKET as string,
    accessKeyId: env.SPACES_KEY as string,
    secretAccessKey: env.SPACES_SECRET as string,
  };
}

/** Production refuses to start on anything meant for development. */
function assertProductionSafe(env: z.output<typeof envSchema>, spaces: SpacesConfig | undefined): void {
  const problems: string[] = [];
  if (!env.COOKIE_SECURE) problems.push('COOKIE_SECURE must be true');
  if (!env.RESEND_API_KEY) problems.push('RESEND_API_KEY is required');
  if (!env.VALKEY_URL) problems.push('VALKEY_URL is required');
  if (!spaces) problems.push('SPACES_* settings are required');
  if (env.CONNECTOR_MODE === 'fixture') problems.push('CONNECTOR_MODE=fixture is not allowed');
  if (env.CONNECTOR_RECORD_DIR) problems.push('CONNECTOR_RECORD_DIR is not allowed');
  if (env.PLAN_OVERRIDE) problems.push('PLAN_OVERRIDE is not allowed');
  if (env.DATABASE_URL.includes('dev-only')) problems.push('DATABASE_URL still has a development password');
  if (Buffer.from(env.APP_ENCRYPTION_KEY, 'base64').toString('latin1').includes('dev-only')) {
    problems.push('APP_ENCRYPTION_KEY is the development key');
  }
  for (const origin of [...env.ALLOWED_ORIGINS.split(','), env.WEB_BASE_URL, env.API_BASE_URL]) {
    if (!origin.trim().startsWith('https://')) problems.push(`${origin.trim()} must use https`);
  }
  if (problems.length > 0) {
    throw new Error(`Refusing to start in production: ${problems.join('; ')}.`);
  }
}

export function loadConfig(source: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    // Names only. Values could be secrets.
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid configuration. ${issues.join('; ')}`);
  }
  const env = parsed.data;
  const spaces = resolveSpaces(env);
  const github = resolveGithub(env);
  const docusign = resolveDocusign(source, env.API_BASE_URL);
  const inboundEmail = resolveInboundEmail(source);
  const billing = resolveBilling(source);
  const googleDrive = resolveGoogleDrive(source, env.API_BASE_URL);
  const sharepoint = resolveSharepoint(source, env.API_BASE_URL);
  if (env.NODE_ENV === 'production') assertProductionSafe(env, spaces);

  return {
    nodeEnv: env.NODE_ENV,
    logLevel: env.LOG_LEVEL,
    host: env.API_HOST,
    port: env.API_PORT,
    apiBaseUrl: env.API_BASE_URL.replace(/\/$/, ''),
    webBaseUrl: env.WEB_BASE_URL.replace(/\/$/, ''),
    allowedOrigins: env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
    trustProxy: env.TRUST_PROXY,
    cookieSecure: env.COOKIE_SECURE,
    databaseUrl: env.DATABASE_URL,
    encryptionKey: env.APP_ENCRYPTION_KEY,
    rateLimits: {
      globalPerMinute: env.RATE_LIMIT_GLOBAL_PER_MINUTE,
      magicLinkPerEmailPerHour: env.RATE_LIMIT_MAGIC_LINK_PER_EMAIL_PER_HOUR,
      magicLinkPerIpPerHour: env.RATE_LIMIT_MAGIC_LINK_PER_IP_PER_HOUR,
      verifyPerIpPer15Min: env.RATE_LIMIT_VERIFY_PER_IP_PER_15_MIN,
      totpPerUserPer15Min: env.RATE_LIMIT_TOTP_PER_USER_PER_15_MIN,
      invitationsPerOrgPerDay: env.RATE_LIMIT_INVITATIONS_PER_ORG_PER_DAY,
      checkAgainPerCompanyPerHour: env.RATE_LIMIT_CHECK_AGAIN_PER_COMPANY_PER_HOUR,
      registrySearchPerOrgPerHour: env.RATE_LIMIT_REGISTRY_SEARCH_PER_ORG_PER_HOUR,
      publicPerIpPerMinute: env.RATE_LIMIT_PUBLIC_PER_IP_PER_MINUTE,
      lookupRequestsPerOrgPerDay: env.RATE_LIMIT_LOOKUP_REQUESTS_PER_ORG_PER_DAY,
    },
    resendApiKey: env.RESEND_API_KEY ? new SecretText(env.RESEND_API_KEY) : undefined,
    mailFrom: env.MAIL_FROM,
    valkeyUrl: env.VALKEY_URL,
    spaces,
    localFileDir: resolve(REPO_ROOT, env.LOCAL_FILE_DIR),
    connectorMode: env.CONNECTOR_MODE === 'fixture' ? 'fixture' : 'live',
    connectorTimeoutMs: env.CONNECTOR_TIMEOUT_MS,
    scanLeaseSeconds: env.SCAN_LEASE_SECONDS,
    sourceRetryMinutes: env.SOURCE_RETRY_MINUTES,
    vendorCacheDays: env.VENDOR_CACHE_DAYS,
    maxUploadBytes: env.MAX_UPLOAD_MB * 1024 * 1024,
    planOverride: env.PLAN_OVERRIDE,
    reference: {
      refreshEnabled: env.REFERENCE_REFRESH_ENABLED,
      userAgent: env.REFERENCE_USER_AGENT,
      maxAgeHours: env.REFERENCE_MAX_AGE_HOURS,
      sanctionsMaxAgeHours: env.REFERENCE_SANCTIONS_MAX_AGE_HOURS,
      sourceEnv: {
        ...(env.ICO_REGISTER_URL ? { ICO_REGISTER_URL: env.ICO_REGISTER_URL } : {}),
        ...(env.NDPC_REGISTER_URL ? { NDPC_REGISTER_URL: env.NDPC_REGISTER_URL } : {}),
        ...(env.SANCTIONS_LISTS ? { SANCTIONS_LISTS: env.SANCTIONS_LISTS } : {}),
        ...(env.FR_CNIL_DPO_URL ? { FR_CNIL_DPO_URL: env.FR_CNIL_DPO_URL } : {}),
      },
    },
    monitoring: {
      enabled: env.MONITORING_ENABLED,
      maxScansPerOrgPerDay: env.MONITORING_MAX_SCANS_PER_ORG_PER_DAY,
      maxScansPerDay: env.MONITORING_MAX_SCANS_PER_DAY,
    },
    documentHelper: {
      enabled: env.AI_DOCUMENT_HELPER_ENABLED,
      apiKeySet: env.ANTHROPIC_API_KEY !== undefined,
      model: env.CLAUDE_MODEL,
      effort: env.DOCUMENT_HELPER_EFFORT,
      maxPages: env.DOCUMENT_HELPER_MAX_PAGES,
      maxPerOrgPerDay: env.DOCUMENT_HELPER_MAX_PER_ORG_PER_DAY,
      timeoutMs: env.DOCUMENT_HELPER_TIMEOUT_MS,
      maxTokens: env.DOCUMENT_HELPER_MAX_TOKENS,
      ...(env.ANTHROPIC_INFERENCE_GEO ? { inferenceGeo: env.ANTHROPIC_INFERENCE_GEO } : {}),
    },
    ...(github ? { github } : {}),
    ...(docusign ? { docusign } : {}),
    ...(inboundEmail ? { inboundEmail } : {}),
    ...(googleDrive ? { googleDrive } : {}),
    ...(sharepoint ? { sharepoint } : {}),
    ...(billing ? { billing } : {}),
  };
}

import { createStripeProvider, type BillingApi } from '../../src/modules/billing/stripe';
import { randomBytes, randomUUID } from 'node:crypto';
import { createConnectors, type Connector, type FetchLike } from '@vero/connectors';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FastifyInstance, LightMyRequestResponse } from 'fastify';
import pg from 'pg';
import { inject } from 'vitest';
import { buildApp } from '../../src/app';
import { loadConfig, type Config } from '../../src/config';
import { Database } from '../../src/db';
import type { AppDeps } from '../../src/deps';
import { RateLimiter } from '../../src/http/rate-limit';
import { DevOutboxMailer, HeuristicClassifier, InProcessQueue, LocalEncryptedFileStore, type Mailer } from '../../src/infra';
import { Secrets } from '../../src/lib/crypto';
import { SESSION_COOKIE } from '../../src/modules/auth/session';
import { createGithubClient } from '../../src/modules/github/service';

export const ALLOWED_ORIGIN = 'https://app.vero.test';

export function testEnv(overrides: Record<string, string> = {}): NodeJS.ProcessEnv {
  return {
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    API_BASE_URL: 'https://api.vero.test',
    WEB_BASE_URL: ALLOWED_ORIGIN,
    ALLOWED_ORIGINS: ALLOWED_ORIGIN,
    DATABASE_URL: inject('appUrl'),
    APP_ENCRYPTION_KEY: randomBytes(32).toString('base64'),
    // High, so only the tests about limits ever meet one.
    RATE_LIMIT_GLOBAL_PER_MINUTE: '100000',
    RATE_LIMIT_MAGIC_LINK_PER_EMAIL_PER_HOUR: '1000',
    RATE_LIMIT_MAGIC_LINK_PER_IP_PER_HOUR: '100000',
    RATE_LIMIT_VERIFY_PER_IP_PER_15_MIN: '100000',
    RATE_LIMIT_TOTP_PER_USER_PER_15_MIN: '1000',
    RATE_LIMIT_INVITATIONS_PER_ORG_PER_DAY: '100000',
    ...overrides,
  };
}

export interface RequestOptions {
  body?: unknown;
  cookie?: string;
  ip?: string;
  /** null sends no Origin header at all. */
  origin?: string | null;
  headers?: Record<string, string>;
}

export interface SignedIn {
  cookie: string;
  userId: string;
  email: string;
  organisationId: string;
}

export interface Harness {
  app: FastifyInstance;
  deps: AppDeps;
  config: Config;
  /** Superuser connection for checking what is really stored. It bypasses RLS. */
  admin: pg.Pool;
  logs: string[];
  /** Where uploaded files really land, to check what is on disk. */
  fileDir: string;
  queue: InProcessQueue;
  /** Moves the API's clock. Sessions and links are compared against this. */
  setNow(date: Date | null): void;
  request(method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, options?: RequestOptions): Promise<LightMyRequestResponse>;
  latestToken(email: string): Promise<string>;
  requestLink(email: string, invitationToken?: string): Promise<string>;
  signIn(email?: string, invitationToken?: string): Promise<SignedIn>;
  close(): Promise<void>;
}

export function uniqueEmail(prefix = 'person'): string {
  return `${prefix}-${randomUUID().slice(0, 12)}@example.test`;
}

/** The session cookie as a Cookie header value, taken from a Set-Cookie response. */
export function sessionCookieFrom(response: LightMyRequestResponse): string {
  const found = response.cookies.find((cookie) => cookie.name === SESSION_COOKIE);
  if (!found) throw new Error('No session cookie in the response');
  return `${SESSION_COOKIE}=${found.value}`;
}

export function randomIp(): string {
  const part = () => Math.floor(Math.random() * 250) + 1;
  return `10.${part()}.${part()}.${part()}`;
}

/** Real Fastify, real Postgres as the non-superuser role, real mailer writing to the outbox. */
export async function startHarness(
  envOverrides: Record<string, string> = {},
  options: {
    mailer?: (db: Database) => Mailer;
    connectors?: (fixtures: Connector[]) => Connector[];
    /** GitHub, mocked. Without it any GitHub request fails at once: tests never reach the network. */
    githubFetch?: FetchLike;
    /** Stripe's network calls, mocked. Signatures are still checked by the real package. */
    billingApi?: BillingApi;
  } = {},
): Promise<Harness> {
  const config = loadConfig(testEnv(envOverrides));
  const db = new Database(config.databaseUrl, { maxConnections: 5 });
  const secrets = new Secrets(config.encryptionKey);
  const admin = new pg.Pool({ connectionString: inject('superuserUrl'), max: 3 });
  const fileDir = mkdtempSync(join(tmpdir(), 'vero-files-'));

  let fixedNow: Date | null = null;
  const now = () => fixedNow ?? new Date();

  const fixtures = createConnectors({ env: { CONNECTOR_MODE: 'fixture', NODE_ENV: 'test' }, now });
  const queue = new InProcessQueue({ backoffMs: 1 });
  const deps: AppDeps = {
    config,
    db,
    secrets,
    now,
    limiter: new RateLimiter(db, now),
    mailer: options.mailer ? options.mailer(db) : new DevOutboxMailer(db),
    queue,
    files: new LocalEncryptedFileStore(fileDir, secrets, config.apiBaseUrl, now),
    connectors: options.connectors ? options.connectors(fixtures) : fixtures,
    classifier: new HeuristicClassifier(),
    ...(config.github
      ? {
          github: createGithubClient(config.github, {
            fetch: options.githubFetch ?? (() => Promise.reject(new Error('No network in tests'))),
            now,
            sleep: async () => undefined,
          }),
        }
      : {}),
    ...(config.billing
      ? {
          billing: createStripeProvider(config.billing, {
            api: options.billingApi ?? {
              createCheckoutSession: () => Promise.reject(new Error('No network in tests')),
              createPortalSession: () => Promise.reject(new Error('No network in tests')),
              getPrice: () => Promise.reject(new Error('No network in tests')),
            },
          }),
        }
      : {}),
  };

  const logs: string[] = [];
  const app = await buildApp(deps, { logStream: { write: (line: string) => void logs.push(line) } });

  const request: Harness['request'] = (method, url, requestOptions = {}) => {
    const headers: Record<string, string> = { ...requestOptions.headers };
    if (requestOptions.origin !== null) headers.origin = requestOptions.origin ?? ALLOWED_ORIGIN;
    if (requestOptions.cookie) headers.cookie = requestOptions.cookie;
    return app.inject({
      method,
      url,
      headers,
      remoteAddress: requestOptions.ip ?? randomIp(),
      ...(requestOptions.body === undefined ? {} : { payload: requestOptions.body as object }),
    });
  };

  const latestToken = async (email: string): Promise<string> => {
    const { rows } = await admin.query<{ body_text: string }>(
      'SELECT body_text FROM outbox WHERE to_email = $1 ORDER BY created_at DESC, id LIMIT 1',
      [email],
    );
    const match = /token=([^\s]+)/.exec(rows[0]?.body_text ?? '');
    if (!match?.[1]) throw new Error(`No link found in the outbox for ${email}`);
    return decodeURIComponent(match[1]);
  };

  const requestLink = async (email: string, invitationToken?: string): Promise<string> => {
    const response = await request('POST', '/v1/auth/magic-link/request', { body: { email, invitationToken } });
    if (response.statusCode !== 202) throw new Error(`Link request failed: ${response.statusCode} ${response.body}`);
    return latestToken(email);
  };

  const signIn = async (email = uniqueEmail(), invitationToken?: string): Promise<SignedIn> => {
    const token = await requestLink(email, invitationToken);
    const response = await request('POST', '/v1/auth/magic-link/verify', { body: { token } });
    if (response.statusCode !== 200) throw new Error(`Sign-in failed: ${response.statusCode} ${response.body}`);
    const body = response.json<{ user: { id: string }; activeOrganisationId: string }>();
    return {
      cookie: sessionCookieFrom(response),
      userId: body.user.id,
      email,
      organisationId: body.activeOrganisationId,
    };
  };

  return {
    app,
    deps,
    config,
    admin,
    logs,
    fileDir,
    queue,
    setNow: (date) => {
      fixedNow = date;
    },
    request,
    latestToken,
    requestLink,
    signIn,
    close: async () => {
      await app.close();
      await deps.queue.close();
      await db.close();
      await admin.end();
      rmSync(fileDir, { recursive: true, force: true });
    },
  };
}

/** Invites an email into the inviter's organisation and returns the raw link token. */
export async function invite(harness: Harness, inviter: SignedIn, email: string, role = 'member'): Promise<string> {
  const response = await harness.request('POST', '/v1/invitations', { cookie: inviter.cookie, body: { email, role } });
  if (response.statusCode !== 201) throw new Error(`Invite failed: ${response.statusCode} ${response.body}`);
  return harness.latestToken(email);
}

/** Signs a new person in through an invitation, so they join with the given role. */
export async function addMember(harness: Harness, owner: SignedIn, role: string): Promise<SignedIn> {
  const email = uniqueEmail(role);
  const token = await invite(harness, owner, email, role);
  return harness.signIn(email, token);
}

export function errorOf(response: LightMyRequestResponse): { code: string; message: string } {
  return response.json<{ error: { code: string; message: string } }>().error;
}

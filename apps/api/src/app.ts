import { randomUUID } from 'node:crypto';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify';
import { z } from 'zod';
import { pgErrorCode } from './db';
import type { AppDeps } from './deps';
import { AppError, errors } from './http/errors';
import { InProcessQueue, LocalEncryptedFileStore } from './infra';
import { registerJobHandlers } from './jobs';
import { registerAdminRoutes } from './modules/admin/routes';
import { registerAuditRoutes } from './modules/audit/routes';
import { registerAuthRoutes } from './modules/auth/routes';
import { registerBillingRoutes } from './modules/billing/routes';
import { registerCompanyRoutes } from './modules/companies/routes';
import { registerDeadlineRoutes } from './modules/deadlines/routes';
import { registerNotificationRoutes } from './modules/notifications/routes';
import { registerQuestionnaireRoutes } from './modules/questionnaire/routes';
import { registerRecordRoutes } from './modules/records/routes';
import { registerReportRoutes } from './modules/reports/routes';
import { registerReviewRoutes } from './modules/review/routes';
import { registerScanRoutes } from './modules/scans/routes';
import { registerSearchRoutes } from './modules/search/routes';
import { registerGithubRoutes } from './modules/github/routes';
import { registerDocusignRoutes } from './modules/docusign/routes';
import { registerInboundEmailRoutes } from './modules/inbound-email/routes';
import { registerGoogleDriveRoutes } from './modules/google-drive/routes';
import { registerSharepointRoutes } from './modules/sharepoint/routes';
import { registerVaultRoutes } from './modules/vault/routes';
import { registerWatchlistRoutes } from './modules/watchlist/routes';
import { registerOrganisationRoutes } from './modules/organisations/routes';

const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

declare module 'fastify' {
  interface FastifyContextConfig {
    /**
     * For a server-to-server webhook only. It carries no cookie, so the Origin check has nothing
     * to protect; its own signature check is what lets it in.
     */
    skipOriginCheck?: boolean;
  }
}

export interface BuildAppOptions {
  /** Where log lines go. Defaults to stdout; tests capture them to prove what is not logged. */
  logStream?: { write(line: string): void };
}

/**
 * What may be logged about a failure: its type, driver code and code location. Never the
 * message, because a database error's message includes the query parameters.
 */
function safeFailure(error: unknown): Record<string, unknown> {
  const failure = error as { name?: unknown; stack?: unknown };
  const frames = typeof failure?.stack === 'string' ? failure.stack.split('\n').filter((l) => l.trimStart().startsWith('at ')) : [];
  return { name: failure?.name, pgCode: pgErrorCode(error), frames: frames.slice(0, 8) };
}

function originOf(request: FastifyRequest): string | null {
  const origin = request.headers.origin;
  if (origin) return origin;
  const referer = request.headers.referer;
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/** Fastify's own errors, translated to plain messages in the standard format. */
function frameworkError(error: { statusCode?: number; code?: string }): AppError | null {
  switch (error.code) {
    case 'FST_ERR_CTP_INVALID_MEDIA_TYPE':
      return new AppError(415, 'unsupported_media_type', 'Please send JSON.');
    case 'FST_ERR_CTP_BODY_TOO_LARGE':
      return new AppError(413, 'payload_too_large', 'That request is too large.');
    case 'FST_ERR_CTP_EMPTY_JSON_BODY':
    case 'FST_ERR_CTP_INVALID_JSON_BODY':
      return new AppError(400, 'invalid_json', "We couldn't read that request.");
    default:
      break;
  }
  if (error instanceof SyntaxError && error.statusCode === 400) {
    return new AppError(400, 'invalid_json', "We couldn't read that request.");
  }
  return null;
}

export { purgeExpired } from './jobs/purge';

export async function buildApp(deps: AppDeps, options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const { config } = deps;
  const app = Fastify({
    logger: {
      level: config.logLevel,
      ...(options.logStream ? { stream: options.logStream } : {}),
      // A second line of defence behind the fact that nothing below logs these.
      redact: {
        paths: [
          'req.headers.cookie',
          'req.headers.authorization',
          'req.headers["x-hub-signature-256"]',
          'token',
          'body',
          'privateKey',
          'webhookSecret',
          'config.github',
          'req.headers["svix-signature"]',
          'secretKey',
          'config.docusign',
          'config.inboundEmail',
          'config.googleDrive',
          'config.sharepoint',
          'clientSecret',
          'accessToken',
          'refreshToken',
        ],
        remove: true,
      },
    },
    // The built-in request log prints the full URL, query string included.
    disableRequestLogging: true,
    trustProxy: config.trustProxy,
    bodyLimit: 1024 * 1024,
    genReqId: () => randomUUID(),
  });

  // Route pattern only: never the query string, headers, cookies or body.
  app.addHook('onResponse', async (request, reply) => {
    request.log.info(
      {
        method: request.method,
        route: request.routeOptions.url ?? 'unmatched',
        status: reply.statusCode,
        ms: Math.round(reply.elapsedTime),
      },
      'request',
    );
  });

  app.setErrorHandler((error: unknown, request, reply) => {
    let known: AppError | null = error instanceof AppError ? error : null;
    known ??= frameworkError(error as { statusCode?: number; code?: string });
    if (!known) {
      request.log.error({ failure: safeFailure(error) }, 'request failed');
      known = errors.internal();
    }
    if (known.headers) void reply.headers(known.headers);
    return reply.code(known.statusCode).send({ error: { code: known.code, message: known.message, ...(known.reason ? { reason: known.reason } : {}) } });
  });

  app.setNotFoundHandler((_request, reply) =>
    reply.code(404).send({ error: { code: 'not_found', message: 'That page could not be found.' } }),
  );

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cookie);
  await app.register(cors, {
    origin: config.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
  // Per-instance safety net for every route. Sign-in limits are stricter and live in Postgres.
  await app.register(rateLimit, {
    global: true,
    max: config.rateLimits.globalPerMinute,
    timeWindow: 60_000,
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: (_request, context) => errors.rateLimited(Math.ceil(context.ttl / 1000)),
  });

  // Browsers always send Origin on these, and cookies make them dangerous from another site.
  // A request with neither Origin nor Referer is refused too: nothing legitimate lacks both.
  app.addHook('onRequest', async (request) => {
    if (!STATE_CHANGING.has(request.method)) return;
    if (request.routeOptions.config?.skipOriginCheck === true) return;
    const origin = originOf(request);
    if (!origin || !config.allowedOrigins.includes(origin)) throw errors.originNotAllowed();
  });

  // API responses can hold personal data and must not sit in shared caches.
  app.addHook('onSend', async (_request, reply) => {
    void reply.header('cache-control', 'no-store');
  });

  app.get('/healthz', { config: { rateLimit: false } }, async (_request, reply) => {
    try {
      await deps.db.ping();
      return { ok: true };
    } catch {
      return reply.code(503).send({ error: { code: 'internal_error', message: 'The database is not reachable.' } });
    }
  });

  if (deps.files instanceof LocalEncryptedFileStore) {
    const store = deps.files;
    const query = z.object({ key: z.string().max(512), exp: z.coerce.number().int(), sig: z.string().max(128) });
    // Stands in for S3 signed links in development. The signature is the only credential.
    app.get('/v1/files/local', async (request, reply) => {
      const parsed = query.safeParse(request.query);
      if (!parsed.success || !store.verifySignedUrl(parsed.data.key, parsed.data.exp, parsed.data.sig)) {
        throw errors.forbidden();
      }
      const body = await store.get(parsed.data.key);
      if (!body) throw errors.notFound('That file');
      return reply
        .header('content-type', 'application/octet-stream')
        .header('content-disposition', 'attachment')
        .send(body);
    });
  }

  registerAuthRoutes(app, deps);
  registerOrganisationRoutes(app, deps);
  registerCompanyRoutes(app, deps);
  registerWatchlistRoutes(app, deps);
  registerAuditRoutes(app, deps);
  registerNotificationRoutes(app, deps);
  registerQuestionnaireRoutes(app, deps);
  registerScanRoutes(app, deps);
  registerReportRoutes(app, deps);
  registerBillingRoutes(app, deps);
  registerVaultRoutes(app, deps);
  registerGithubRoutes(app, deps);
  registerDocusignRoutes(app, deps);
  registerInboundEmailRoutes(app, deps);
  registerGoogleDriveRoutes(app, deps);
  registerSharepointRoutes(app, deps);
  registerDeadlineRoutes(app, deps);
  registerRecordRoutes(app, deps);
  registerReviewRoutes(app, deps);
  registerAdminRoutes(app, deps);
  registerSearchRoutes(app, deps);

  // With a real queue, the worker process runs these. In-process, this process does.
  if (deps.queue instanceof InProcessQueue) registerJobHandlers(deps);

  await app.ready();
  return app;
}

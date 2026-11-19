import { createHmac, timingSafeEqual } from 'node:crypto';
import { and, eq, inArray } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError, errors } from '../../http/errors';
import { writeAudit } from '../audit/service';
import { loadInstallation, markFactsDisconnected, storeAvailableRepositories } from './service';

const { githubInstallation, githubRepository, githubInstallationIndex, githubWebhookDelivery } = schema;

export const GITHUB_WEBHOOK_PATH = '/v1/webhooks/github';
/** GitHub caps payloads at 25 MB; the two events we read are far smaller. */
const WEBHOOK_BODY_LIMIT = 2 * 1024 * 1024;
const HANDLED = new Set(['installation', 'installation_repositories']);
const REMOVED = 'The Vero app was removed from this GitHub account, so nothing can be read. Disconnect here, or install it again.';

const notSigned = () => new AppError(401, 'unauthenticated', "That webhook isn't signed correctly.");

/** Constant-time check of X-Hub-Signature-256 over the exact bytes received. */
export function verifyGithubSignature(secret: string, body: Buffer, header: string | undefined): boolean {
  if (!header || !/^sha256=[0-9a-f]{64}$/.test(header)) return false;
  const expected = Buffer.from(`sha256=${createHmac('sha256', secret).update(body).digest('hex')}`);
  const given = Buffer.from(header);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const repoSchema = z.object({ id: z.number().int().positive(), full_name: z.string().min(3).max(141) });
const payloadSchema = z.object({
  action: z.string().max(60),
  installation: z.object({ id: z.number().int().positive() }),
  repositories_added: z.array(repoSchema).max(5000).optional(),
  repositories_removed: z.array(z.object({ id: z.number().int().positive() })).max(5000).optional(),
});

function header(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

async function handleEvent(deps: AppDeps, event: string, payload: z.infer<typeof payloadSchema>): Promise<void> {
  const installationId = payload.installation.id;
  const [owner] = await deps.db.withSystem((tx) =>
    tx.select({ tenantId: githubInstallationIndex.tenantId }).from(githubInstallationIndex).where(eq(githubInstallationIndex.installationId, installationId)),
  );
  // An installation nobody here connected: acknowledged and ignored.
  if (!owner) return;
  const organisationId = owner.tenantId;
  const now = deps.now();

  await deps.db.withOrg(organisationId, async (tx) => {
    const installation = await loadInstallation(tx);
    if (!installation || installation.installationId !== installationId) return;

    if (event === 'installation') {
      const change =
        payload.action === 'suspend'
          ? { set: { status: 'suspended', suspendedAt: now, lastError: null }, action: 'github.suspended' }
          : payload.action === 'unsuspend'
            ? { set: { status: 'active', suspendedAt: null, lastError: null }, action: 'github.unsuspended' }
            : payload.action === 'deleted'
              ? { set: { status: 'revoked', lastError: REMOVED }, action: 'github.removed_on_github' }
              : null;
      if (!change) return;
      await tx.update(githubInstallation).set(change.set).where(eq(githubInstallation.id, installation.id));
      if (payload.action === 'deleted') await markFactsDisconnected(tx);
      await writeAudit(tx, { organisationId, action: change.action, target: installation.id, metadata: { installationId, via: 'github_webhook' } });
      return;
    }

    // installation_repositories: GitHub's own list changed. Our selection only ever shrinks here.
    const added = (payload.repositories_added ?? []).map((repo) => ({ id: repo.id, fullName: repo.full_name, defaultBranch: null, private: true }));
    const removed = (payload.repositories_removed ?? []).map((repo) => repo.id);
    if (added.length > 0) await storeAvailableRepositories(tx, organisationId, installation, added, false);
    if (removed.length > 0) {
      await tx.delete(githubRepository).where(and(eq(githubRepository.installationId, installation.id), inArray(githubRepository.repoId, removed)));
    }
    await writeAudit(tx, { organisationId, action: 'github.repositories_changed_on_github', target: installation.id, metadata: { added: added.length, removed: removed.length } });
  });
  if (event === 'installation' && (payload.action === 'deleted' || payload.action === 'suspend')) deps.github?.forgetInstallation(installationId);
}

/**
 * GitHub's webhook. The signature is checked on the raw bytes, in constant time, before
 * anything is parsed. Only installation and installation_repositories events do anything;
 * every other event is acknowledged and ignored. A delivery id already handled is
 * acknowledged and not handled again.
 */
export function registerGithubWebhook(app: FastifyInstance, deps: AppDeps): void {
  void app.register(async (scope) => {
    // Only in this scope is a JSON body kept as raw bytes, so the signature covers exactly what arrived.
    scope.addContentTypeParser('application/json', { parseAs: 'buffer', bodyLimit: WEBHOOK_BODY_LIMIT }, (_request, body, done) => done(null, body));
    scope.post(GITHUB_WEBHOOK_PATH, { bodyLimit: WEBHOOK_BODY_LIMIT, config: { skipOriginCheck: true } }, async (request, reply) => {
      const github = deps.config.github;
      if (!github) throw errors.notFound('That page');
      const body = request.body;
      if (!Buffer.isBuffer(body)) throw notSigned();
      if (!verifyGithubSignature(github.webhookSecret.reveal(), body, header(request.headers['x-hub-signature-256']))) throw notSigned();

      const event = header(request.headers['x-github-event']);
      const delivery = header(request.headers['x-github-delivery']);
      if (!event || !/^[a-z_]{1,60}$/.test(event) || !delivery || !/^[A-Za-z0-9-]{1,100}$/.test(delivery)) {
        throw errors.invalidInput("That webhook is missing GitHub's event or delivery id.");
      }
      if (!HANDLED.has(event)) return reply.code(202).send({ ok: true });

      let payload: z.infer<typeof payloadSchema>;
      try {
        payload = payloadSchema.parse(JSON.parse(body.toString('utf8')));
      } catch {
        throw errors.invalidInput("We couldn't read that webhook.");
      }

      const fresh = await deps.db.withSystem((tx) =>
        tx.insert(githubWebhookDelivery).values({ deliveryId: delivery, event }).onConflictDoNothing().returning({ id: githubWebhookDelivery.deliveryId }),
      );
      if (fresh.length === 0) return reply.code(200).send({ ok: true });
      try {
        await handleEvent(deps, event, payload);
      } catch (error) {
        // Not handled after all, so GitHub's retry of this delivery is let through.
        await deps.db.withSystem((tx) => tx.delete(githubWebhookDelivery).where(eq(githubWebhookDelivery.deliveryId, delivery)));
        throw error;
      }
      return reply.code(200).send({ ok: true });
    });
  });
}

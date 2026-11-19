import { contract } from '@vero/shared';
import { eq, inArray } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError, errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import type { OrgContext } from '../auth/session';
import { hashLocalPart, LOCAL_PART, parseAddress, senderDomainOf } from './address';
import { verifySvixSignature } from './resend';
import { createAddress, emailStatus, revokeAddress } from './service';

const { inboundEmailAddressIndex, inboundEmailDelivery } = schema;

export const INBOUND_EMAIL_WEBHOOK_PATH = '/v1/webhooks/inbound-email';
/** The webhook carries metadata only; attachments are fetched afterwards. */
const WEBHOOK_BODY_LIMIT = 512 * 1024;

function sameOrganisation(org: OrgContext, id: string): string {
  if (org.organisationId !== id) throw errors.notAMember();
  return id;
}

const notSigned = () => new AppError(401, 'unauthenticated', "That webhook isn't signed correctly.");

const addressList = z.union([z.string().max(1000), z.array(z.string().max(1000)).max(200)]).optional().nullable();
const payloadSchema = z.object({
  type: z.string().max(100),
  created_at: z.string().max(60).optional(),
  data: z
    .object({
      email_id: z.string().regex(/^[A-Za-z0-9-]{1,100}$/),
      created_at: z.string().max(60).optional(),
      from: z.string().max(1000).optional().nullable(),
      to: addressList,
      cc: addressList,
      bcc: addressList,
      received_for: addressList,
      attachments: z.array(z.unknown()).max(1000).optional().nullable(),
    })
    .optional(),
});

function header(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asList(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(',');
}

function receivedAt(...values: (string | undefined)[]): string | null {
  for (const value of values) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

/**
 * Resend's receiving webhook. The Svix signature is checked on the raw bytes, in constant time,
 * with its timestamp, before anything is parsed. A delivery already handled is acknowledged and
 * not handled again. An address that is unknown, rotated or revoked gets the same 200 as a good
 * one and nothing is stored, so the answer never says which addresses exist. Nothing in the
 * email is read as an instruction, and no reply is ever sent.
 */
function registerWebhook(app: FastifyInstance, deps: AppDeps): void {
  void app.register(async (scope) => {
    scope.addContentTypeParser('application/json', { parseAs: 'buffer', bodyLimit: WEBHOOK_BODY_LIMIT }, (_request, body, done) => done(null, body));
    scope.post(INBOUND_EMAIL_WEBHOOK_PATH, { bodyLimit: WEBHOOK_BODY_LIMIT, config: { skipOriginCheck: true } }, async (request, reply) => {
      const config = deps.config.inboundEmail;
      if (!config) throw errors.notFound('That page');
      const body = request.body;
      if (!Buffer.isBuffer(body)) throw notSigned();
      const delivery = header(request.headers['svix-id']);
      const signed = verifySvixSignature(
        config.webhookKey.reveal(),
        { id: delivery, timestamp: header(request.headers['svix-timestamp']), signature: header(request.headers['svix-signature']) },
        body,
        deps.now(),
        config.toleranceSeconds,
      );
      if (!signed || !delivery || !/^[A-Za-z0-9_-]{1,100}$/.test(delivery)) throw notSigned();

      let payload: z.infer<typeof payloadSchema>;
      try {
        payload = payloadSchema.parse(JSON.parse(body.toString('utf8')));
      } catch {
        throw errors.invalidInput("We couldn't read that webhook.");
      }
      if (payload.type !== 'email.received' || !payload.data) return reply.code(200).send({ ok: true });
      const data = payload.data;

      const fresh = await deps.db.withSystem((tx) =>
        tx.insert(inboundEmailDelivery).values({ deliveryId: delivery }).onConflictDoNothing().returning({ id: inboundEmailDelivery.deliveryId }),
      );
      if (fresh.length === 0) return reply.code(200).send({ ok: true });

      try {
        // Our addresses among the recipients, as hashes. Anything else is ignored.
        const hashes = new Set<string>();
        for (const raw of [...asList(data.to), ...asList(data.cc), ...asList(data.bcc), ...asList(data.received_for)]) {
          const parsed = parseAddress(raw);
          if (parsed && parsed.domain === config.domain && LOCAL_PART.test(parsed.local)) hashes.add(hashLocalPart(parsed.local));
          if (hashes.size >= 10) break;
        }
        if (hashes.size === 0) return reply.code(200).send({ ok: true });
        const owners = await deps.db.withSystem((tx) =>
          tx.select({ tenantId: inboundEmailAddressIndex.tenantId, addressId: inboundEmailAddressIndex.addressId }).from(inboundEmailAddressIndex).where(inArray(inboundEmailAddressIndex.addressHash, [...hashes])),
        );
        const when = receivedAt(data.created_at, payload.created_at) ?? deps.now().toISOString();
        const senderDomain = senderDomainOf(data.from);
        for (const owner of owners) {
          await deps.queue.enqueue('inbound-email.receive', { organisationId: owner.tenantId, addressId: owner.addressId, emailId: data.email_id, receivedAt: when, senderDomain });
        }
      } catch (error) {
        // Not handled after all, so the provider's retry of this delivery is let through.
        await deps.db.withSystem((tx) => tx.delete(inboundEmailDelivery).where(eq(inboundEmailDelivery.deliveryId, delivery)));
        throw error;
      }
      return reply.code(200).send({ ok: true });
    });
  });
}

/** Owners and admins only. Each says forwarding isn't switched on until it is configured. */
export function registerInboundEmailRoutes(app: FastifyInstance, deps: AppDeps): void {
  const options = { auth: 'org', permission: 'connections.manage' } as const;
  const routes = contract.documentConnections;

  defineRoute(app, deps, routes.emailStatus, options, async ({ org, params }) => emailStatus(deps, sameOrganisation(org, params.id)));

  defineRoute(app, deps, routes.emailCreate, options, async ({ org, params, body, session, meta }) =>
    createAddress(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, body, meta }),
  );

  defineRoute(app, deps, routes.emailRevoke, options, async ({ org, params, session, meta }) =>
    revokeAddress(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, meta }),
  );

  registerWebhook(app, deps);
}

import { contract, type PlanCode } from '@vero/shared';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError, errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import { writeAudit } from '../audit/service';
import { notifyOrganisation } from '../notifications/service';
import type { BillingProvider } from './stripe';

/**
 * Stripe billing (owner's decision, 19 Nov 2026). Off until all four STRIPE_* settings are set:
 * then checkout and the portal say plainly that payments aren't on, the webhook doesn't exist,
 * and an admin still changes plans by hand. The plan changes only when Stripe's signed webhook
 * says so. Prices are read from Stripe, never written in code.
 */

const { billingAccount, stripeEvent, organisation, plan } = schema;

export const STRIPE_WEBHOOK_PATH = '/v1/webhooks/stripe';
const WEBHOOK_BODY_LIMIT = 512 * 1024;
const CHECKOUTS_PER_ORG_PER_HOUR = 10;
const PRICE_CACHE_MS = 10 * 60 * 1000;

export function paymentsOff(): AppError {
  return new AppError(503, 'payments_off', "Payments aren't switched on yet. Your plan can be changed by our team.");
}

function requireBilling(deps: AppDeps): BillingProvider {
  if (!deps.billing) throw paymentsOff();
  return deps.billing;
}

const notSigned = () => new AppError(401, 'unauthenticated', "That webhook isn't signed correctly.");

/** Stripe statuses where the paid plan stands; anything else ends it. past_due keeps it while Stripe retries. */
const KEEPS_PLAN = new Set(['active', 'trialing', 'past_due']);

const id = z.string().min(1).max(255);
const ref = z.union([id, z.object({ id }).transform((value) => value.id)]);
const eventSchema = z.object({ id, type: z.string().max(100), data: z.object({ object: z.unknown() }) });
const checkoutSchema = z.object({
  mode: z.string().optional(),
  client_reference_id: z.uuid().nullable().optional(),
  customer: ref.nullable().optional(),
  subscription: ref.nullable().optional(),
  metadata: z.record(z.string(), z.string()).nullable().optional(),
});
const subscriptionSchema = z.object({
  id,
  customer: ref,
  status: z.string().max(40),
  current_period_end: z.number().int().nullable().optional(),
  items: z.object({ data: z.array(z.object({ price: z.object({ id }), current_period_end: z.number().int().nullable().optional() })) }).optional(),
});

function planOfPrice(provider: BillingProvider, priceId: string | undefined): PlanCode | null {
  if (priceId === provider.prices.growth) return 'growth';
  if (priceId === provider.prices.scale) return 'scale';
  return null;
}

/** Sets the plan inside the organisation's own tenant, audited, and tells its people once. */
async function syncPlan(deps: AppDeps, organisationId: string, code: PlanCode, eventType: string, eventId: string): Promise<void> {
  await deps.db.withOrg(organisationId, async (tx) => {
    const [target] = await tx.select({ id: plan.id }).from(plan).where(eq(plan.code, code));
    if (!target) throw errors.internal();
    const [current] = await tx.select({ planId: organisation.planId }).from(organisation).where(eq(organisation.id, organisationId));
    if (!current) return;
    await writeAudit(tx, { organisationId, action: 'billing.event_handled', target: organisationId, metadata: { event: eventType, plan: code } });
    if (current.planId === target.id) return;
    await tx.update(organisation).set({ planId: target.id }).where(eq(organisation.id, organisationId));
    await writeAudit(tx, { organisationId, action: 'plan.changed', target: organisationId, metadata: { plan: code, source: 'stripe', event: eventType } });
    await notifyOrganisation(tx, organisationId, { kind: 'system', title: `You're now on the ${code} plan`, dedupeKey: `billing:${eventId}` });
  });
}

async function accountByCustomer(deps: AppDeps, customerId: string): Promise<string | null> {
  const [row] = await deps.db.withSystem((tx) =>
    tx.select({ organisationId: billingAccount.organisationId }).from(billingAccount).where(eq(billingAccount.stripeCustomerId, customerId)),
  );
  return row?.organisationId ?? null;
}

async function handleEvent(deps: AppDeps, provider: BillingProvider, event: z.infer<typeof eventSchema>): Promise<'handled' | 'ignored'> {
  if (event.type === 'checkout.session.completed') {
    const session = checkoutSchema.parse(event.data.object);
    const organisationId = session.client_reference_id ?? null;
    const customerId = session.customer ?? null;
    const code = session.metadata?.plan === 'growth' || session.metadata?.plan === 'scale' ? session.metadata.plan : null;
    if (session.mode !== 'subscription' || !organisationId || !customerId || !code) return 'ignored';
    // The organisation must exist. A customer already tied to another organisation is never moved.
    const known = await accountByCustomer(deps, customerId);
    if (known && known !== organisationId) return 'ignored';
    const exists = await deps.db.withOrg(organisationId, (tx) => tx.select({ id: organisation.id }).from(organisation).where(eq(organisation.id, organisationId)));
    if (exists.length === 0) return 'ignored';
    await deps.db.withSystem((tx) =>
      tx
        .insert(billingAccount)
        .values({ organisationId, stripeCustomerId: customerId, stripeSubscriptionId: session.subscription ?? null, status: 'active' })
        .onConflictDoUpdate({ target: billingAccount.organisationId, set: { stripeCustomerId: customerId, stripeSubscriptionId: session.subscription ?? null, status: 'active' } }),
    );
    await syncPlan(deps, organisationId, code, event.type, event.id);
    return 'handled';
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = subscriptionSchema.parse(event.data.object);
    const organisationId = await accountByCustomer(deps, subscription.customer);
    // A customer we don't know: acknowledged, and nothing changes.
    if (!organisationId) return 'ignored';
    const item = subscription.items?.data[0];
    const periodEnd = subscription.current_period_end ?? item?.current_period_end ?? null;
    await deps.db.withSystem((tx) =>
      tx
        .update(billingAccount)
        .set({
          stripeSubscriptionId: subscription.id,
          status: event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status,
          priceId: item?.price.id ?? null,
          currentPeriodEnd: periodEnd === null ? null : new Date(periodEnd * 1000),
        })
        .where(eq(billingAccount.organisationId, organisationId)),
    );
    const ended = event.type === 'customer.subscription.deleted' || !KEEPS_PLAN.has(subscription.status);
    const code = ended ? 'free' : planOfPrice(provider, item?.price.id);
    if (code === null) {
      // A price that isn't one of ours: the plan stays as it is, and it's on the record.
      await deps.db.withOrg(organisationId, (tx) => writeAudit(tx, { organisationId, action: 'billing.unknown_price', target: organisationId, metadata: { event: event.type } }));
      return 'handled';
    }
    await syncPlan(deps, organisationId, code, event.type, event.id);
    return 'handled';
  }
  return 'ignored';
}

const priceCache = new Map<string, { at: number; value: { unitAmount: number | null; currency: string } | null }>();

/** What each paid plan costs, read from Stripe (cached for ten minutes). Null when payments are off or Stripe can't say. */
export async function planPrices(deps: AppDeps): Promise<Record<PlanCode, { priceMinor: number | null; currency: string | null }>> {
  const none = { priceMinor: null, currency: null };
  const result: Record<PlanCode, { priceMinor: number | null; currency: string | null }> = { free: { priceMinor: 0, currency: null }, growth: none, scale: none };
  if (!deps.billing) return { ...result, free: none };
  for (const code of ['growth', 'scale'] as const) {
    const priceId = deps.billing.prices[code];
    const cached = priceCache.get(priceId);
    let value = cached && deps.now().getTime() - cached.at < PRICE_CACHE_MS ? cached.value : undefined;
    if (value === undefined) {
      value = await deps.billing.getPrice(priceId).catch(() => null);
      priceCache.set(priceId, { at: deps.now().getTime(), value });
    }
    result[code] = value ? { priceMinor: value.unitAmount, currency: value.currency.toUpperCase() } : none;
  }
  return result;
}

export function registerBillingRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.billing.checkout, { auth: 'org', permission: 'organisation.update' }, async ({ org, session, body, meta }) => {
    const provider = requireBilling(deps);
    await deps.limiter.enforce(`billing-checkout:${org.organisationId}`, CHECKOUTS_PER_ORG_PER_HOUR, 3600);
    const [account] = await deps.db.withSystem((tx) =>
      tx.select({ customerId: billingAccount.stripeCustomerId }).from(billingAccount).where(eq(billingAccount.organisationId, org.organisationId)),
    );
    const checkout = await provider.createCheckoutSession({
      priceId: provider.prices[body.plan],
      customerId: account?.customerId ?? null,
      email: session.email,
      organisationId: org.organisationId,
      plan: body.plan,
      successUrl: `${deps.config.webBaseUrl}/plan?checkout=done`,
      cancelUrl: `${deps.config.webBaseUrl}/plan?checkout=cancelled`,
    });
    if (!checkout.url) throw errors.internal();
    await deps.db.withOrg(org.organisationId, (tx) =>
      writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'billing.checkout_started', target: org.organisationId, metadata: { plan: body.plan }, meta }),
    );
    return { url: checkout.url };
  });

  defineRoute(app, deps, contract.billing.portal, { auth: 'org', permission: 'organisation.update' }, async ({ org, session, meta }) => {
    const provider = requireBilling(deps);
    const [account] = await deps.db.withSystem((tx) =>
      tx.select({ customerId: billingAccount.stripeCustomerId }).from(billingAccount).where(eq(billingAccount.organisationId, org.organisationId)),
    );
    if (!account) throw errors.invalidState("You don't pay for a plan through Stripe yet, so there's nothing to manage there.");
    const portal = await provider.createPortalSession({ customerId: account.customerId, returnUrl: `${deps.config.webBaseUrl}/plan` });
    await deps.db.withOrg(org.organisationId, (tx) =>
      writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'billing.portal_opened', target: org.organisationId, meta }),
    );
    return { url: portal.url };
  });

  void app.register(async (scope) => {
    // Only in this scope is a JSON body kept as raw bytes, so the signature covers exactly what arrived.
    scope.addContentTypeParser('application/json', { parseAs: 'buffer', bodyLimit: WEBHOOK_BODY_LIMIT }, (_request, body, done) => done(null, body));
    scope.post(STRIPE_WEBHOOK_PATH, { bodyLimit: WEBHOOK_BODY_LIMIT, config: { skipOriginCheck: true } }, async (request, reply) => {
      const provider = deps.billing;
      if (!provider) throw errors.notFound('That page');
      const body = request.body;
      const signature = request.headers['stripe-signature'];
      if (!Buffer.isBuffer(body) || typeof signature !== 'string') throw notSigned();
      let verified: unknown;
      try {
        verified = provider.verifyWebhook(body, signature);
      } catch {
        throw notSigned();
      }
      const parsed = eventSchema.safeParse(verified);
      if (!parsed.success) throw errors.invalidInput("We couldn't read that webhook.");
      const event = parsed.data;

      // Each event once, by Stripe's own id.
      const fresh = await deps.db.withSystem((tx) =>
        tx.insert(stripeEvent).values({ eventId: event.id, type: event.type }).onConflictDoNothing().returning({ id: stripeEvent.eventId }),
      );
      if (fresh.length === 0) return reply.code(200).send({ received: true });
      try {
        const outcome = await handleEvent(deps, provider, event);
        return await reply.code(200).send({ received: true, handled: outcome === 'handled' });
      } catch (error) {
        // Not handled after all, so Stripe's retry of this event is let through.
        await deps.db.withSystem((tx) => tx.delete(stripeEvent).where(eq(stripeEvent.eventId, event.id)));
        if (error instanceof z.ZodError) throw errors.invalidInput("We couldn't read that webhook.");
        throw error;
      }
    });
  });
}

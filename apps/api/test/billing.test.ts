import Stripe from 'stripe';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config';
import type { BillingApi } from '../src/modules/billing/stripe';
import { addMember, errorOf, startHarness, testEnv, type Harness, type SignedIn } from './support/harness';
import { makeStaff, setPlan } from './support/product';

/**
 * Stripe billing (docs/BACKEND-V2-PLAN.md, step 10). Stripe's network calls are mocked; every
 * webhook is signed with Stripe's own test-header helper and checked by the real package.
 */

const SECRET_KEY = 'sk_test_vero_billing_tests_only_0001';
const WEBHOOK_SECRET = 'whsec_vero_billing_tests_only_0001';
const STRIPE_ENV = { STRIPE_SECRET_KEY: SECRET_KEY, STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET, STRIPE_PRICE_GROWTH: 'price_growth_test', STRIPE_PRICE_SCALE: 'price_scale_test' };
const OFF = { code: 'payments_off', message: "Payments aren't switched on yet. Your plan can be changed by our team." };
const signer = new Stripe(SECRET_KEY);

let eventSeq = 0;
function event(type: string, object: Record<string, unknown>, id = `evt_test_${++eventSeq}`): string {
  return JSON.stringify({ id, object: 'event', type, data: { object } });
}

describe('billing, switched off', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('checkout and the portal say plainly that payments are off; the webhook does not exist', async () => {
    const owner = await h.signIn();
    for (const [url, body] of [['/v1/billing/checkout', { plan: 'growth' }], ['/v1/billing/portal', undefined]] as const) {
      const response = await h.request('POST', url, { cookie: owner.cookie, ...(body ? { body } : {}) });
      expect(response.statusCode, url).toBe(503);
      expect(errorOf(response), url).toEqual(OFF);
    }
    const hook = await h.request('POST', '/v1/webhooks/stripe', { origin: null, body: event('checkout.session.completed', {}), headers: { 'content-type': 'application/json', 'stripe-signature': 't=1,v1=x' } });
    expect(hook.statusCode).toBe(404);
  });

  it('an admin still changes a plan by hand', async () => {
    const owner = await h.signIn();
    const admin = await makeStaff(h, 'admin');
    const changed = await h.request('PATCH', `/v1/admin/organisations/${owner.organisationId}/plan`, { cookie: admin.cookie, body: { plan: 'growth' } });
    expect(changed.statusCode).toBe(200);
    const plans = (await h.request('GET', '/v1/plans', { cookie: owner.cookie })).json<{ current: string; plans: { priceMinor: number | null }[] }>();
    expect(plans.current).toBe('growth');
    // No prices are ever invented.
    expect(plans.plans.every((item) => item.priceMinor === null)).toBe(true);
  });

  it('refuses a half-set-up Stripe, and keys in the wrong shape', () => {
    expect(() => loadConfig(testEnv({ STRIPE_SECRET_KEY: SECRET_KEY }))).toThrow(/Set all of the Stripe settings, or none. Missing: STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_GROWTH, STRIPE_PRICE_SCALE/);
    expect(() => loadConfig(testEnv({ ...STRIPE_ENV, STRIPE_SECRET_KEY: 'pk_test_wrong' }))).toThrow(/secret or restricted key/);
    expect(() => loadConfig(testEnv({ ...STRIPE_ENV, STRIPE_PRICE_SCALE: '4900' }))).toThrow(/price id/);
    const config = loadConfig(testEnv(STRIPE_ENV));
    expect(JSON.stringify(config)).not.toContain(SECRET_KEY);
    expect(JSON.stringify(config)).not.toContain(WEBHOOK_SECRET);
  });
});

describe('billing, switched on', () => {
  let h: Harness;
  let owner: SignedIn;
  const calls: { checkout: Parameters<BillingApi['createCheckoutSession']>[0][]; portal: Parameters<BillingApi['createPortalSession']>[0][] } = { checkout: [], portal: [] };
  const api: BillingApi = {
    createCheckoutSession: async (input) => {
      calls.checkout.push(input);
      return { url: 'https://checkout.stripe.test/c/session_1' };
    },
    createPortalSession: async (input) => {
      calls.portal.push(input);
      return { url: 'https://billing.stripe.test/p/session_1' };
    },
    getPrice: async (priceId) => ({ unitAmount: priceId === 'price_growth_test' ? 4900 : 14900, currency: 'gbp' }),
  };

  const webhook = (payload: string, signature = signer.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET })) =>
    h.request('POST', '/v1/webhooks/stripe', { origin: null, body: payload, headers: { 'content-type': 'application/json', 'stripe-signature': signature } });
  const currentPlan = async (who: SignedIn) => (await h.request('GET', '/v1/plans', { cookie: who.cookie })).json<{ current: string }>().current;
  const audits = async (organisationId: string, action: string) =>
    (await h.admin.query<{ metadata: Record<string, unknown> }>(`SELECT metadata FROM audit_log WHERE organisation_id = $1 AND action = $2 ORDER BY seq`, [organisationId, action])).rows;
  const completed = (organisationId: string, customer: string, plan = 'growth') =>
    event('checkout.session.completed', { id: 'cs_test_1', object: 'checkout.session', mode: 'subscription', client_reference_id: organisationId, customer, subscription: `sub_${customer}`, metadata: { organisationId, plan } });
  const subscription = (type: string, customer: string, status: string, price: string) =>
    event(type, { id: `sub_${customer}`, object: 'subscription', customer, status, items: { data: [{ price: { id: price }, current_period_end: 1_900_000_000 }] } });

  beforeAll(async () => {
    h = await startHarness(STRIPE_ENV, { billingApi: api });
    owner = await h.signIn();
  });
  afterAll(() => h.close());

  it('starts a Checkout session for the chosen plan, with the price id from config, audited', async () => {
    const response = await h.request('POST', '/v1/billing/checkout', { cookie: owner.cookie, body: { plan: 'growth' } });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ url: 'https://checkout.stripe.test/c/session_1' });
    expect(calls.checkout.at(-1)).toMatchObject({ priceId: 'price_growth_test', customerId: null, email: owner.email, organisationId: owner.organisationId, plan: 'growth' });
    expect(calls.checkout.at(-1)?.successUrl).toMatch(/\/plan\?checkout=done$/);
    expect(await audits(owner.organisationId, 'billing.checkout_started')).toEqual([{ metadata: { plan: 'growth' } }]);
    // Asking for checkout changes nothing until Stripe says it was paid.
    expect(await currentPlan(owner)).toBe('free');
    expect((await h.request('POST', '/v1/billing/checkout', { cookie: owner.cookie, body: { plan: 'free' } })).statusCode).toBe(400);
  });

  it('only owners and admins can start one; signed out is 401', async () => {
    const member = await addMember(h, owner, 'member');
    expect((await h.request('POST', '/v1/billing/checkout', { cookie: member.cookie, body: { plan: 'growth' } })).statusCode).toBe(403);
    expect((await h.request('POST', '/v1/billing/portal', { cookie: member.cookie })).statusCode).toBe(403);
    expect((await h.request('POST', '/v1/billing/checkout', { body: { plan: 'growth' } })).statusCode).toBe(401);
  });

  it('shows the prices Stripe holds, never ones written in code', async () => {
    const plans = (await h.request('GET', '/v1/plans', { cookie: owner.cookie })).json<{ plans: { code: string; priceMinor: number | null; currency: string | null }[] }>().plans;
    expect(plans.find((item) => item.code === 'growth')).toMatchObject({ priceMinor: 4900, currency: 'GBP' });
    expect(plans.find((item) => item.code === 'scale')).toMatchObject({ priceMinor: 14900, currency: 'GBP' });
  });

  it('a paid checkout moves the plan, once, however often Stripe sends it', async () => {
    const before = await h.request('POST', '/v1/billing/portal', { cookie: owner.cookie });
    expect(before.statusCode).toBe(409);
    const payload = completed(owner.organisationId, 'cus_owner');
    const first = await webhook(payload);
    expect(first.statusCode).toBe(200);
    expect(first.json()).toEqual({ received: true, handled: true });
    expect(await currentPlan(owner)).toBe('growth');
    const replay = await webhook(payload);
    expect(replay.statusCode).toBe(200);
    expect(await audits(owner.organisationId, 'plan.changed')).toEqual([{ metadata: { plan: 'growth', source: 'stripe', event: 'checkout.session.completed' } }]);
    const { rows } = await h.admin.query(`SELECT 1 FROM stripe_event`);
    expect(rows.length).toBeGreaterThan(0);
    const notes = await h.admin.query<{ title: string }>(`SELECT title FROM notification WHERE organisation_id = $1 AND title LIKE 'You''re now on%'`, [owner.organisationId]);
    expect(notes.rows.map((row) => row.title)).toContain("You're now on the growth plan");

    const portal = await h.request('POST', '/v1/billing/portal', { cookie: owner.cookie });
    expect(portal.json()).toEqual({ url: 'https://billing.stripe.test/p/session_1' });
    expect(calls.portal.at(-1)).toMatchObject({ customerId: 'cus_owner' });
    expect(await audits(owner.organisationId, 'billing.portal_opened')).toHaveLength(1);
    await h.request('POST', '/v1/billing/checkout', { cookie: owner.cookie, body: { plan: 'scale' } });
    expect(calls.checkout.at(-1)?.customerId).toBe('cus_owner');
  });

  it('a subscription change follows the price; unpaid or deleted goes back to Free', async () => {
    expect((await webhook(subscription('customer.subscription.updated', 'cus_owner', 'active', 'price_scale_test'))).statusCode).toBe(200);
    expect(await currentPlan(owner)).toBe('scale');
    expect((await webhook(subscription('customer.subscription.updated', 'cus_owner', 'past_due', 'price_scale_test'))).statusCode).toBe(200);
    expect(await currentPlan(owner)).toBe('scale');
    expect((await webhook(subscription('customer.subscription.updated', 'cus_owner', 'unpaid', 'price_scale_test'))).statusCode).toBe(200);
    expect(await currentPlan(owner)).toBe('free');
    await webhook(subscription('customer.subscription.updated', 'cus_owner', 'active', 'price_growth_test'));
    expect(await currentPlan(owner)).toBe('growth');
    await webhook(subscription('customer.subscription.deleted', 'cus_owner', 'canceled', 'price_growth_test'));
    expect(await currentPlan(owner)).toBe('free');
    const { rows } = await h.admin.query<{ status: string; price_id: string }>(`SELECT status, price_id FROM billing_account WHERE organisation_id = $1`, [owner.organisationId]);
    expect(rows[0]).toMatchObject({ status: 'canceled', price_id: 'price_growth_test' });
  });

  it('a price that is not ours leaves the plan alone, on the record', async () => {
    await webhook(subscription('customer.subscription.updated', 'cus_owner', 'active', 'price_growth_test'));
    await webhook(subscription('customer.subscription.updated', 'cus_owner', 'active', 'price_someone_else'));
    expect(await currentPlan(owner)).toBe('growth');
    expect(await audits(owner.organisationId, 'billing.unknown_price')).toHaveLength(1);
  });

  it('an unknown customer changes nothing; a known customer is never moved to another organisation', async () => {
    const unknown = await webhook(subscription('customer.subscription.updated', 'cus_nobody', 'active', 'price_scale_test'));
    expect(unknown.json()).toEqual({ received: true, handled: false });
    const other = await h.signIn();
    await setPlan(h, other.organisationId, 'free');
    const stolen = await webhook(completed(other.organisationId, 'cus_owner', 'scale'));
    expect(stolen.json()).toEqual({ received: true, handled: false });
    expect(await currentPlan(other)).toBe('free');
    expect(await currentPlan(owner)).toBe('growth');
    // A checkout naming an organisation that doesn't exist does nothing either.
    const ghost = await webhook(completed('11111111-1111-4111-8111-111111111111', 'cus_ghost'));
    expect(ghost.json()).toEqual({ received: true, handled: false });
  });

  it('refuses a bad signature, a changed body and a stale timestamp, and changes nothing', async () => {
    const payload = subscription('customer.subscription.deleted', 'cus_owner', 'canceled', 'price_growth_test');
    const wrongSecret = signer.webhooks.generateTestHeaderString({ payload, secret: 'whsec_someone_else' });
    expect((await webhook(payload, wrongSecret)).statusCode).toBe(401);
    const signed = signer.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
    expect((await webhook(payload.replace('canceled', 'cancelled'), signed)).statusCode).toBe(401);
    const old = signer.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET, timestamp: Math.floor(Date.now() / 1000) - 3600 });
    expect((await webhook(payload, old)).statusCode).toBe(401);
    expect((await h.request('POST', '/v1/webhooks/stripe', { origin: null, body: payload, headers: { 'content-type': 'application/json' } })).statusCode).toBe(401);
    expect(errorOf(await webhook(payload, wrongSecret)).message).toBe("That webhook isn't signed correctly.");
    expect(await currentPlan(owner)).toBe('growth');
  });

  it('ignores other events, and never logs a key or a secret', async () => {
    expect((await webhook(event('invoice.paid', { id: 'in_1' }))).json()).toEqual({ received: true, handled: false });
    const logs = h.logs.join('\n');
    expect(logs).not.toContain(SECRET_KEY);
    expect(logs).not.toContain(WEBHOOK_SECRET);
  });
});

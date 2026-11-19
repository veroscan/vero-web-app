import Stripe from 'stripe';
import type { BillingConfig } from './config';

/**
 * What Vero needs from Stripe, and nothing more. The real one uses the official `stripe` package.
 * Tests replace only the network calls (`api`): webhook signatures are always checked by the
 * package's own code, against the raw bytes received.
 */
export interface BillingApi {
  createCheckoutSession(input: {
    priceId: string;
    customerId: string | null;
    email: string;
    organisationId: string;
    plan: 'growth' | 'scale';
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string | null }>;
  createPortalSession(input: { customerId: string; returnUrl: string }): Promise<{ url: string }>;
  /** The amount and currency Stripe holds for a price. Never stored in code. */
  getPrice(priceId: string): Promise<{ unitAmount: number | null; currency: string }>;
}

export interface BillingProvider extends BillingApi {
  /** Throws when the signature isn't Stripe's, for exactly these bytes and this secret. */
  verifyWebhook(rawBody: Buffer, signatureHeader: string): unknown;
  prices: BillingConfig['prices'];
}

function realApi(stripe: Stripe): BillingApi {
  return {
    async createCheckoutSession(input) {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: input.priceId, quantity: 1 }],
        ...(input.customerId ? { customer: input.customerId } : { customer_email: input.email }),
        client_reference_id: input.organisationId,
        metadata: { organisationId: input.organisationId, plan: input.plan },
        subscription_data: { metadata: { organisationId: input.organisationId, plan: input.plan } },
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
      });
      return { url: session.url };
    },
    async createPortalSession(input) {
      const session = await stripe.billingPortal.sessions.create({ customer: input.customerId, return_url: input.returnUrl });
      return { url: session.url };
    },
    async getPrice(priceId) {
      const price = await stripe.prices.retrieve(priceId);
      return { unitAmount: price.unit_amount, currency: price.currency };
    },
  };
}

export function createStripeProvider(config: BillingConfig, options: { api?: BillingApi } = {}): BillingProvider {
  // The client is built even when the network calls are replaced, so signature checks are always Stripe's own.
  const stripe = new Stripe(config.secretKey.reveal(), { maxNetworkRetries: 2, timeout: 15_000 });
  const api = options.api ?? realApi(stripe);
  return {
    ...api,
    prices: config.prices,
    verifyWebhook: (rawBody, signatureHeader) => stripe.webhooks.constructEvent(rawBody, signatureHeader, config.webhookSecret.reveal()),
  };
}

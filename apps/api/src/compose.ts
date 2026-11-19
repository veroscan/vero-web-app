import { createConnectors } from '@vero/connectors';
import type { Config } from './config';
import { Database } from './db';
import type { AppDeps } from './deps';
import { RateLimiter } from './http/rate-limit';
import { createClassifier, createDocumentHelper, createFileStore, createJobQueue, createMailer } from './infra';
import { Secrets } from './lib/crypto';
import { createStripeProvider } from './modules/billing/stripe';
import { createGithubClient } from './modules/github/service';
import { referenceOptions } from './modules/reference/service';

/** Picks each integration from the environment: with a key it is real, without it local. */
export function composeDeps(config: Config, logLink?: (line: string) => void): AppDeps {
  const db = new Database(config.databaseUrl);
  const secrets = new Secrets(config.encryptionKey);
  const now = () => new Date();
  const documentHelper = createDocumentHelper(config);
  return {
    config,
    db,
    secrets,
    now,
    limiter: new RateLimiter(db, now),
    mailer: createMailer(config, db, logLink),
    queue: createJobQueue(config),
    files: createFileStore(config, secrets),
    // ICO, NDPC and sanctions read the copies the reference.refresh job stores, when there are any.
    connectors: createConnectors({ env: process.env, now, timeoutMs: config.connectorTimeoutMs, reference: referenceOptions(db, config) }),
    classifier: createClassifier(config),
    // Off unless switched on and keyed. Each organisation must also switch it on for itself.
    ...(documentHelper ? { documentHelper } : {}),
    // Off unless the GitHub App is registered and all its settings are in place.
    ...(config.github ? { github: createGithubClient(config.github, { now, timeoutMs: config.connectorTimeoutMs }) } : {}),
    // Off until all four STRIPE_* settings are set.
    ...(config.billing ? { billing: createStripeProvider(config.billing) } : {}),
  };
}

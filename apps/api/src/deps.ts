import type { Connector, FetchLike, GithubAppClient } from '@vero/connectors';
import type { Config } from './config';
import type { Database } from './db';
import type { Classifier, FileStore, JobQueue, Mailer } from './infra';
import type { Secrets } from './lib/crypto';
import type { RateLimiter } from './http/rate-limit';
import type { BillingProvider } from './modules/billing/stripe';

/** Everything a module may use. Passed in, so tests run the same code with real parts. */
export interface AppDeps {
  config: Config;
  db: Database;
  secrets: Secrets;
  mailer: Mailer;
  queue: JobQueue;
  files: FileStore;
  limiter: RateLimiter;
  /** The data sources for this environment. Each reports "unavailable" until its key is set. */
  connectors: readonly Connector[];
  classifier: Classifier;
  /**
   * The Claude document helper, only when AI_DOCUMENT_HELPER_ENABLED is true and
   * ANTHROPIC_API_KEY is set. Used for an organisation only once it has switched it on.
   */
  documentHelper?: Classifier;
  /** Injected so time-based rules such as TOTP steps can be tested exactly. */
  now: () => Date;
  /** How the reference refresh job downloads the public lists. Tests pass a fake; unset means the real fetch. */
  referenceFetch?: FetchLike;
  /**
   * The read-only GitHub App, only when every GITHUB_APP_* setting is present. It holds the
   * short-lived installation tokens in memory; nothing it holds is ever stored or logged.
   */
  github?: GithubAppClient;
  /** How the DocuSign connection reaches DocuSign. Tests pass a fake; unset means the real fetch. */
  docusignFetch?: FetchLike;
  /** How forwarding by email reads received attachments from Resend. Tests pass a fake; unset means the real fetch. */
  inboundEmailFetch?: FetchLike;
  /** How the Google Drive connection reaches Google. Tests pass a fake; unset means the real fetch. */
  googleDriveFetch?: FetchLike;
  /** How the SharePoint / OneDrive connection reaches Microsoft. Tests pass a fake; unset means the real fetch. */
  microsoftFetch?: FetchLike;
  /** Stripe, only when all four STRIPE_* settings are set. Without it payments are off. */
  billing?: BillingProvider;
}

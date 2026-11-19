import type { Config } from '../config';
import { schema, type Database } from '../db';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  /** Template name, kept for the record. */
  template: string;
  /** The action link in the message, so the dev mailer can print it. */
  link?: string;
  organisationId?: string | null;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

/**
 * Development and tests: nothing leaves the machine. The message goes to the outbox table,
 * and the link is printed when `logLink` is given. Config refuses to run this in production.
 */
export class DevOutboxMailer implements Mailer {
  constructor(
    private readonly db: Database,
    private readonly logLink?: (line: string) => void,
  ) {}

  async send(message: MailMessage): Promise<void> {
    await this.db.withSystem((tx) =>
      tx.insert(schema.outbox).values({
        organisationId: message.organisationId ?? null,
        toEmail: message.to,
        template: message.template,
        subject: message.subject,
        bodyText: message.text,
        status: 'captured',
        provider: 'dev-outbox',
      }),
    );
    if (message.link) this.logLink?.(`[dev mail] ${message.template}: ${message.link}`);
  }
}

/** Real delivery. The outbox keeps a record of the send, never the body: it can hold a sign-in link. */
export class ResendMailer implements Mailer {
  constructor(
    private readonly db: Database,
    private readonly apiKey: string,
    private readonly from: string,
    private readonly fetchFn: typeof globalThis.fetch = globalThis.fetch,
  ) {}

  private async record(message: MailMessage, status: 'sent' | 'failed', providerId?: string): Promise<void> {
    await this.db.withSystem((tx) =>
      tx.insert(schema.outbox).values({
        organisationId: message.organisationId ?? null,
        toEmail: message.to,
        template: message.template,
        subject: message.subject,
        bodyText: null,
        status,
        provider: 'resend',
        providerId: providerId ?? null,
        sentAt: status === 'sent' ? new Date() : null,
      }),
    );
  }

  async send(message: MailMessage): Promise<void> {
    let response: Response;
    try {
      response = await this.fetchFn('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${this.apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from: this.from, to: [message.to], subject: message.subject, text: message.text }),
      });
    } catch {
      await this.record(message, 'failed');
      throw new Error('Could not reach the email provider');
    }
    if (!response.ok) {
      await this.record(message, 'failed');
      // Status only. The provider's response could echo the message back.
      throw new Error(`Email provider refused the message (status ${response.status})`);
    }
    const body = (await response.json().catch(() => ({}))) as { id?: unknown };
    await this.record(message, 'sent', typeof body.id === 'string' ? body.id : undefined);
  }
}

export function createMailer(config: Config, db: Database, logLink?: (line: string) => void): Mailer {
  if (config.resendApiKey) return new ResendMailer(db, config.resendApiKey.reveal(), config.mailFrom);
  return new DevOutboxMailer(db, config.nodeEnv === 'development' ? logLink : undefined);
}

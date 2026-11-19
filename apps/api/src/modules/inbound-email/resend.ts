import { createHmac, timingSafeEqual } from 'node:crypto';
import type { FetchLike } from '@vero/connectors';
import { asRecord, readCapped, str, TooLargeError } from '../docusign/http';
import type { InboundEmailConfig } from './config';

/**
 * Resend's receiving, as documented on resend.com/docs (checked 15 Nov 2026):
 * - the `email.received` webhook carries metadata only (email_id, from, to, cc, bcc, subject,
 *   attachment metadata), never the body or attachment contents;
 * - GET {api}/emails/receiving/{email_id}/attachments lists the attachments, each with a
 *   `download_url` valid for an hour;
 * - webhooks are signed with Svix: HMAC-SHA256, keyed with the base64 part of the "whsec_"
 *   secret, over "{svix-id}.{svix-timestamp}.{raw body}", sent base64 in svix-signature as
 *   space-separated "v1,<signature>" entries.
 *
 * We never fetch the email itself (its body or headers), only the attachment list.
 */

export class ResendError extends Error {
  override name = 'ResendError';
  constructor(readonly kind: 'unavailable' | 'rejected' | 'too_large') {
    super(kind === 'too_large' ? 'That attachment is too large.' : "We couldn't read that email's attachments from Resend.");
  }
}

/** Constant-time check of Svix's signature over the exact bytes received, and its timestamp. */
export function verifySvixSignature(
  key: string,
  headers: { id: string | undefined; timestamp: string | undefined; signature: string | undefined },
  body: Buffer,
  now: Date,
  toleranceSeconds: number,
): boolean {
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature || !/^\d{1,12}$/.test(timestamp) || signature.length > 2000) return false;
  if (Math.abs(now.getTime() / 1000 - Number(timestamp)) > toleranceSeconds) return false;
  const signed = Buffer.concat([Buffer.from(`${id}.${timestamp}.`), body]);
  const expected = Buffer.from(createHmac('sha256', Buffer.from(key, 'base64')).update(signed).digest('base64'));
  let matched = false;
  for (const entry of signature.split(' ')) {
    const [version, value] = entry.split(',');
    if (version !== 'v1' || !value) continue;
    const given = Buffer.from(value);
    if (given.length === expected.length && timingSafeEqual(given, expected)) matched = true;
  }
  return matched;
}

export interface ReceivedAttachment {
  id: string;
  filename: string | null;
  contentType: string | null;
  size: number | null;
  downloadUrl: string | null;
}

export class ResendReceivingClient {
  private readonly fetch: FetchLike;

  constructor(
    private readonly config: InboundEmailConfig,
    options: { fetch?: FetchLike; timeoutMs?: number } = {},
  ) {
    this.fetch = options.fetch ?? ((url, init) => fetch(url, init));
    this.timeoutMs = options.timeoutMs ?? 20_000;
  }

  private readonly timeoutMs: number;

  private async send(url: string, init: RequestInit): Promise<Response> {
    try {
      return await this.fetch(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(this.timeoutMs) });
    } catch {
      throw new ResendError('unavailable');
    }
  }

  async listAttachments(emailId: string, max: number): Promise<{ attachments: ReceivedAttachment[]; more: boolean }> {
    if (!/^[A-Za-z0-9-]{1,100}$/.test(emailId)) throw new ResendError('rejected');
    const response = await this.send(`${this.config.resendApiUrl}/emails/receiving/${emailId}/attachments`, {
      method: 'GET',
      headers: { authorization: `Bearer ${this.config.resendApiKey.reveal()}`, accept: 'application/json' },
    });
    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      throw new ResendError(response.status >= 500 || response.status === 429 ? 'unavailable' : 'rejected');
    }
    let body: Record<string, unknown>;
    try {
      body = asRecord(JSON.parse((await readCapped(response, 1024 * 1024)).toString('utf8')));
    } catch {
      throw new ResendError('unavailable');
    }
    const list = Array.isArray(body['data']) ? body['data'].map(asRecord) : [];
    const attachments: ReceivedAttachment[] = [];
    for (const item of list) {
      const id = str(item['id'], 100);
      if (!id) continue;
      const size = typeof item['size'] === 'number' && Number.isSafeInteger(item['size']) && item['size'] >= 0 ? item['size'] : null;
      attachments.push({ id, filename: str(item['filename'], 300), contentType: str(item['content_type'], 200)?.toLowerCase() ?? null, size, downloadUrl: str(item['download_url'], 4000) });
    }
    return { attachments: attachments.slice(0, max), more: attachments.length > max || body['has_more'] === true };
  }

  /** Fetches one attachment from its temporary https link. Our Resend key is never sent there. */
  async download(downloadUrl: string, maxBytes: number): Promise<Buffer> {
    let url: URL;
    try {
      url = new URL(downloadUrl);
    } catch {
      throw new ResendError('rejected');
    }
    if (url.protocol !== 'https:' || url.username || url.password) throw new ResendError('rejected');
    const response = await this.send(url.toString(), { method: 'GET' });
    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      throw new ResendError('unavailable');
    }
    try {
      return await readCapped(response, maxBytes);
    } catch (error) {
      if (error instanceof TooLargeError) throw new ResendError('too_large');
      throw new ResendError('unavailable');
    }
  }
}

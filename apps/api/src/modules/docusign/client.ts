import type { FetchLike } from '@vero/connectors';
import type { DocusignConfig } from './config';
import { asRecord, readCapped, str, TooLargeError } from './http';

/**
 * DocuSign's OAuth (Authorization Code Grant) and the few eSignature REST calls we need, as
 * documented on developers.docusign.com (checked 15 Nov 2026):
 * - sign-in:  {account server}/oauth/auth?response_type=code&scope=...&client_id=...&redirect_uri=...&state=...
 * - tokens:   POST {account server}/oauth/token, Basic auth of integration key and secret,
 *             grant_type=authorization_code (code) or refresh_token (refresh_token)
 * - userinfo: GET {account server}/oauth/userinfo, which names the accounts and each one's base_uri
 * - list:     GET {base_uri}/restapi/v2.1/accounts/{accountId}/envelopes?from_date=...&status=completed
 * - envelope: GET .../envelopes/{envelopeId}?include=recipients
 * - files:    GET .../envelopes/{envelopeId}/documents/combined (certificate not included by
 *             default) and .../documents/certificate (the certificate of completion only)
 *
 * Nothing here is logged. Tokens are passed in and out as values; error messages are fixed and
 * never contain a token, a URL or anything DocuSign sent.
 */

/** The only eSignature scope DocuSign offers: it has no read-only variant. */
export const DOCUSIGN_SCOPE = 'signature';

export type DocusignFailureKind = 'invalid_grant' | 'unauthorized' | 'rate_limited' | 'not_found' | 'too_large' | 'unavailable' | 'rejected';

const PLAIN: Record<DocusignFailureKind, string> = {
  invalid_grant: 'DocuSign access ended, connect again.',
  unauthorized: 'DocuSign access ended, connect again.',
  rate_limited: 'DocuSign asked us to slow down. Please try again later.',
  not_found: "DocuSign says that envelope isn't there, or this account can't see it.",
  too_large: 'That file from DocuSign is larger than we can take.',
  unavailable: "We couldn't reach DocuSign just now. Please try again.",
  rejected: 'DocuSign refused the request.',
};

export class DocusignError extends Error {
  override name = 'DocusignError';
  readonly kind: DocusignFailureKind;
  constructor(kind: DocusignFailureKind) {
    super(PLAIN[kind]);
    this.kind = kind;
  }
}

export interface TokenGrant {
  accessToken: string;
  /** DocuSign may send a new refresh token; when it doesn't, the old one is still the one to use. */
  refreshToken: string | null;
  expiresInSeconds: number;
  scope: string | null;
}

export interface DocusignAccount {
  accountId: string;
  accountName: string | null;
  baseUri: string;
}

export interface EnvelopeSummary {
  envelopeId: string;
  subject: string | null;
  completedAt: string | null;
}

export interface EnvelopeDetails {
  envelopeId: string;
  status: string;
  completedAt: string | null;
  /** How many signers DocuSign lists. Names and emails are read past, never kept. */
  signerCount: number;
}

const GUID = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;

/** DocuSign's API hosts are on docusign.net (demo.docusign.net, na2.docusign.net, eu.docusign.net ...). */
export function isDocusignBaseUri(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && url.port === '' && (url.hostname === 'docusign.net' || url.hostname.endsWith('.docusign.net'));
  } catch {
    return false;
  }
}

/** Control characters out, so a name or subject reads as plain text. */
function plain(value: string, replacement: string): string {
  return [...value]
    .map((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code < 0x20 || code === 0x7f ? replacement : character;
    })
    .join('');
}

function isoOrNull(value: unknown): string | null {
  const text = str(value, 60);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export class DocusignClient {
  private readonly fetch: FetchLike;
  private readonly timeoutMs: number;
  /** How many requests this client has sent. */
  requestsSent = 0;

  constructor(
    private readonly config: DocusignConfig,
    options: { fetch?: FetchLike; timeoutMs?: number } = {},
  ) {
    this.fetch = options.fetch ?? ((url, init) => fetch(url, init));
    this.timeoutMs = options.timeoutMs ?? 20_000;
  }

  authorizeUrl(state: string): string {
    const query = new URLSearchParams({
      response_type: 'code',
      scope: DOCUSIGN_SCOPE,
      client_id: this.config.integrationKey,
      redirect_uri: this.config.redirectUri,
      state,
    });
    return `${this.config.oauthUrl}/oauth/auth?${query.toString()}`;
  }

  private async send(url: string, init: RequestInit): Promise<Response> {
    this.requestsSent += 1;
    let response: Response;
    try {
      response = await this.fetch(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(this.timeoutMs) });
    } catch {
      throw new DocusignError('unavailable');
    }
    if (response.status === 429 || (response.headers.get('x-ratelimit-remaining') === '0' && !response.ok)) {
      await response.body?.cancel().catch(() => undefined);
      throw new DocusignError('rate_limited');
    }
    return response;
  }

  private async json(response: Response): Promise<Record<string, unknown>> {
    try {
      return asRecord(JSON.parse((await readCapped(response, 2 * 1024 * 1024)).toString('utf8')));
    } catch {
      throw new DocusignError('unavailable');
    }
  }

  private async failure(response: Response): Promise<never> {
    const status = response.status;
    const body = await this.json(response).catch((): Record<string, unknown> => ({}));
    const code = str(body['error'], 100) ?? str(body['errorCode'], 100) ?? '';
    if (status === 400 && code === 'invalid_grant') throw new DocusignError('invalid_grant');
    if (status === 401) throw new DocusignError('unauthorized');
    if (/HOURLY_APIINVOCATION_LIMIT_EXCEEDED|BURST_APIINVOCATION_LIMIT_EXCEEDED|API_REQUEST_IS_THROTTLED|Polling_Limit_Exceeded|Envelope_Limit_Exceeded/i.test(code)) throw new DocusignError('rate_limited');
    if (status === 404) throw new DocusignError('not_found');
    if (status >= 500) throw new DocusignError('unavailable');
    throw new DocusignError('rejected');
  }

  private async token(form: Record<string, string>): Promise<TokenGrant> {
    const basic = Buffer.from(`${this.config.integrationKey}:${this.config.secretKey.reveal()}`).toString('base64');
    const response = await this.send(`${this.config.oauthUrl}/oauth/token`, {
      method: 'POST',
      headers: { authorization: `Basic ${basic}`, 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      body: new URLSearchParams(form).toString(),
    });
    if (!response.ok) return this.failure(response);
    const body = await this.json(response);
    const accessToken = str(body['access_token'], 8000);
    const expires = typeof body['expires_in'] === 'number' ? body['expires_in'] : Number(body['expires_in']);
    if (!accessToken || !Number.isFinite(expires) || expires <= 0) throw new DocusignError('unavailable');
    return { accessToken, refreshToken: str(body['refresh_token'], 8000), expiresInSeconds: Math.min(expires, 7 * 24 * 3600), scope: str(body['scope'], 200) };
  }

  exchangeCode(code: string): Promise<TokenGrant> {
    return this.token({ grant_type: 'authorization_code', code });
  }

  refresh(refreshToken: string): Promise<TokenGrant> {
    return this.token({ grant_type: 'refresh_token', refresh_token: refreshToken });
  }

  /** The person's default DocuSign account, with the API address DocuSign gives for it. */
  async defaultAccount(accessToken: string): Promise<DocusignAccount> {
    const response = await this.send(`${this.config.oauthUrl}/oauth/userinfo`, { method: 'GET', headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' } });
    if (!response.ok) return this.failure(response);
    const body = await this.json(response);
    const accounts = Array.isArray(body['accounts']) ? body['accounts'].map(asRecord) : [];
    const chosen = accounts.find((item) => item['is_default'] === true || item['is_default'] === 'true') ?? accounts[0];
    const accountId = chosen ? str(chosen['account_id'], 60) : null;
    const baseUri = chosen ? str(chosen['base_uri'], 200)?.replace(/\/+$/, '') : undefined;
    if (!chosen || !accountId || !GUID.test(accountId) || !baseUri || !isDocusignBaseUri(baseUri)) throw new DocusignError('rejected');
    const name = str(chosen['account_name'], 200);
    return { accountId, accountName: name ? plain(name, '').trim() || null : null, baseUri };
  }

  private accountUrl(account: { accountId: string; baseUri: string }): string {
    if (!GUID.test(account.accountId) || !isDocusignBaseUri(account.baseUri)) throw new DocusignError('rejected');
    return `${account.baseUri}/restapi/v2.1/accounts/${account.accountId}`;
  }

  /** Recent completed envelopes, newest first. Subjects are passed through for the person to pick from, never kept. */
  async listCompleted(accessToken: string, account: { accountId: string; baseUri: string }, fromDate: Date, count: number): Promise<{ envelopes: EnvelopeSummary[]; complete: boolean }> {
    const query = new URLSearchParams({ from_date: fromDate.toISOString(), status: 'completed', count: String(count), order_by: 'completed', order: 'desc' });
    const response = await this.send(`${this.accountUrl(account)}/envelopes?${query.toString()}`, { method: 'GET', headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' } });
    if (!response.ok) return this.failure(response);
    const body = await this.json(response);
    const list = Array.isArray(body['envelopes']) ? body['envelopes'].map(asRecord) : [];
    const envelopes: EnvelopeSummary[] = [];
    for (const item of list.slice(0, count)) {
      const envelopeId = str(item['envelopeId'], 60);
      if (!envelopeId || !GUID.test(envelopeId) || str(item['status'], 40) !== 'completed') continue;
      const subject = str(item['emailSubject'], 300);
      envelopes.push({ envelopeId: envelopeId.toLowerCase(), subject: subject ? plain(subject, ' ').trim() : null, completedAt: isoOrNull(item['completedDateTime']) });
    }
    const total = Number(body['totalSetSize']);
    return { envelopes, complete: !(Number.isFinite(total) && total > list.length) && !str(body['nextUri'], 2000) };
  }

  async getEnvelope(accessToken: string, account: { accountId: string; baseUri: string }, envelopeId: string): Promise<EnvelopeDetails> {
    if (!GUID.test(envelopeId)) throw new DocusignError('rejected');
    const response = await this.send(`${this.accountUrl(account)}/envelopes/${envelopeId}?include=recipients`, { method: 'GET', headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' } });
    if (!response.ok) return this.failure(response);
    const body = await this.json(response);
    const recipients = asRecord(body['recipients']);
    const signers = Array.isArray(recipients['signers']) ? recipients['signers'] : [];
    return { envelopeId, status: str(body['status'], 40) ?? 'unknown', completedAt: isoOrNull(body['completedDateTime']), signerCount: signers.length };
  }

  /** The combined signed PDF (without the certificate), or the certificate of completion on its own. */
  async getDocument(accessToken: string, account: { accountId: string; baseUri: string }, envelopeId: string, part: 'combined' | 'certificate', maxBytes: number): Promise<Buffer> {
    if (!GUID.test(envelopeId)) throw new DocusignError('rejected');
    const suffix = part === 'combined' ? 'combined?certificate=false' : 'certificate';
    const response = await this.send(`${this.accountUrl(account)}/envelopes/${envelopeId}/documents/${suffix}`, { method: 'GET', headers: { authorization: `Bearer ${accessToken}`, accept: 'application/pdf' } });
    if (!response.ok) return this.failure(response);
    try {
      return await readCapped(response, maxBytes);
    } catch (error) {
      if (error instanceof TooLargeError) throw new DocusignError('too_large');
      throw new DocusignError('unavailable');
    }
  }
}

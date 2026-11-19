import type { FetchLike } from '@vero/connectors';
import { asRecord, readCapped, str, TooLargeError } from '../docusign/http';
import { PickerHttpClient, type PickerFailureKind, type TokenGrant } from '../file-pickers/client-base';
import type { SharepointConfig } from './config';

/**
 * The Microsoft identity platform (OAuth 2.0 authorization code flow with PKCE, v2.0
 * endpoints) and the two Microsoft Graph calls we need, as documented on learn.microsoft.com
 * (checked 15 Nov 2026):
 * - sign-in:  https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize (response_mode=query, S256)
 * - tokens:   POST .../{tenant}/oauth2/v2.0/token with client_secret and code_verifier; a refresh
 *             returns a new refresh token, which replaces the old one
 * - metadata: GET https://graph.microsoft.com/v1.0/drives/{drive-id}/items/{item-id}
 * - content:  GET .../drives/{drive-id}/items/{item-id}/content, which answers 302 to a
 *             pre-authenticated download address that needs no Authorization header
 *
 * Only the drive and item ids the person picked are ever asked for: nothing here lists,
 * searches or browses a drive. Microsoft offers no Graph permission limited to picked files that
 * may be used for direct Graph calls (Files.Read.Selected is only for Office file handlers), so
 * that limit is enforced here, in code.
 */
export const GRAPH_API = 'https://graph.microsoft.com/v1.0';
export const MICROSOFT_LOGIN = 'https://login.microsoftonline.com';
/** The tenant id Microsoft uses for personal Microsoft accounts. */
export const MICROSOFT_CONSUMER_TENANT = '9188040d-6c67-4c5b-b112-36a304b66dad';

const ID = /^[A-Za-z0-9!_.-]{1,200}$/;
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const PLAIN: Record<PickerFailureKind, string> = {
  invalid_grant: 'SharePoint access ended, connect again.',
  unauthorized: 'SharePoint access ended, connect again.',
  rate_limited: 'Microsoft asked us to slow down. Please try again later.',
  not_found: "Microsoft says that file isn't there, or this account can't open it. Pick it again.",
  too_large: 'That file from SharePoint or OneDrive is larger than we can take.',
  unavailable: "We couldn't reach Microsoft just now. Please try again.",
  rejected: 'Microsoft refused the request.',
  not_allowed: 'We can take PDF, PNG, JPEG and plain text files from here.',
};

export interface DriveItemMeta {
  id: string;
  name: string | null;
  mimeType: string | null;
  size: number | null;
  modifiedTime: string | null;
  isFile: boolean;
}

/**
 * Microsoft's pre-authenticated download addresses. Microsoft doesn't publish a list of these
 * hosts; its examples use *.files.1drv.com, and SharePoint downloads come from *.sharepoint.com.
 */
export function isMicrosoftDownloadUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && !url.username && !url.password && url.port === '' && (host.endsWith('.sharepoint.com') || host.endsWith('.1drv.com'));
  } catch {
    return false;
  }
}

/**
 * The tenant id from the id token Microsoft returned to us directly over TLS from its token
 * endpoint. Read for that one claim and then dropped: never stored, never used to decide access.
 */
export function tenantFromIdToken(idToken: string | null): string | null {
  const payload = idToken?.split('.')[1];
  if (!payload) return null;
  try {
    const tid = str(asRecord(JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')))['tid'], 60)?.toLowerCase() ?? null;
    return tid && GUID.test(tid) ? tid : null;
  } catch {
    return null;
  }
}

function isoOrNull(value: unknown): string | null {
  const text = str(value, 60);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export class MicrosoftGraphClient extends PickerHttpClient {
  constructor(
    private readonly config: SharepointConfig,
    options: { fetch?: FetchLike; timeoutMs?: number } = {},
  ) {
    super(options);
  }

  protected plain(kind: PickerFailureKind): string {
    return PLAIN[kind];
  }

  /** openid for the tenant id only; offline_access for a refresh token; one Files permission. */
  scopes(): string {
    return `openid offline_access https://graph.microsoft.com/${this.config.filesScope}`;
  }

  private loginUrl(path: 'authorize' | 'token'): string {
    return `${MICROSOFT_LOGIN}/${encodeURIComponent(this.config.tenant)}/oauth2/v2.0/${path}`;
  }

  authorizeUrl(state: string, codeChallenge: string): string {
    const query = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      response_mode: 'query',
      scope: this.scopes(),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return `${this.loginUrl('authorize')}?${query.toString()}`;
  }

  private async failure(response: Response): Promise<never> {
    const status = response.status;
    const body = await this.json(response).catch((): Record<string, unknown> => ({}));
    const oauthError = str(body['error'], 100);
    const graphCode = str(asRecord(body['error'])['code'], 100) ?? '';
    // A refused, expired or revoked grant, or one that now needs the person (MFA, consent).
    if (oauthError === 'invalid_grant' || oauthError === 'interaction_required' || oauthError === 'consent_required') throw this.fail('invalid_grant');
    if (status === 401) throw this.fail('unauthorized');
    if (/activityLimitReached|throttled/i.test(graphCode)) throw this.fail('rate_limited');
    if (status === 404 || status === 403 || graphCode === 'itemNotFound' || graphCode === 'accessDenied') throw this.fail('not_found');
    if (status >= 500) throw this.fail('unavailable');
    throw this.fail('rejected');
  }

  private async token(form: Record<string, string>): Promise<TokenGrant> {
    const response = await this.send(this.loginUrl('token'), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      body: new URLSearchParams({ client_id: this.config.clientId, client_secret: this.config.clientSecret.reveal(), scope: this.scopes(), ...form }).toString(),
    });
    if (!response.ok) return this.failure(response);
    return this.grantFrom(response);
  }

  exchangeCode(code: string, codeVerifier: string): Promise<TokenGrant> {
    return this.token({ grant_type: 'authorization_code', code, code_verifier: codeVerifier, redirect_uri: this.config.redirectUri });
  }

  refresh(refreshToken: string): Promise<TokenGrant> {
    return this.token({ grant_type: 'refresh_token', refresh_token: refreshToken });
  }

  private itemUrl(driveId: string, itemId: string): string {
    if (!ID.test(driveId) || !ID.test(itemId)) throw this.fail('rejected');
    return `${GRAPH_API}/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}`;
  }

  /** One picked item's metadata. */
  async itemMetadata(accessToken: string, driveId: string, itemId: string): Promise<DriveItemMeta> {
    const query = new URLSearchParams({ $select: 'id,name,size,file,lastModifiedDateTime' });
    const response = await this.send(`${this.itemUrl(driveId, itemId)}?${query.toString()}`, { method: 'GET', headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' } });
    if (!response.ok) return this.failure(response);
    const body = await this.json(response);
    const id = str(body['id'], 200);
    if (!id || id.toLowerCase() !== itemId.toLowerCase()) throw this.fail('rejected');
    const file = body['file'] === undefined || body['file'] === null ? null : asRecord(body['file']);
    const size = Number(body['size']);
    return {
      id,
      name: str(body['name'], 1000),
      mimeType: file ? str(file['mimeType'], 200) : null,
      size: Number.isFinite(size) && size >= 0 ? size : null,
      modifiedTime: isoOrNull(body['lastModifiedDateTime']),
      isFile: file !== null,
    };
  }

  /**
   * The item's bytes. Graph answers 302 to a short-lived pre-authenticated address; that
   * address must be https on a Microsoft download host, and it is fetched without our token.
   */
  async download(accessToken: string, driveId: string, itemId: string, maxBytes: number): Promise<Buffer> {
    const first = await this.send(`${this.itemUrl(driveId, itemId)}/content`, { method: 'GET', headers: { authorization: `Bearer ${accessToken}` } }, 'manual');
    let response = first;
    if (first.status >= 300 && first.status < 400) {
      const location = first.headers.get('location') ?? '';
      await first.body?.cancel().catch(() => undefined);
      if (!isMicrosoftDownloadUrl(location)) throw this.fail('rejected');
      response = await this.send(location, { method: 'GET' });
    }
    if (!response.ok) return this.failure(response);
    try {
      return await readCapped(response, maxBytes);
    } catch (error) {
      if (error instanceof TooLargeError) throw this.fail('too_large');
      throw this.fail('unavailable');
    }
  }
}

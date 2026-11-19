import type { FetchLike } from '@vero/connectors';
import { asRecord, readCapped, str, TooLargeError } from '../docusign/http';
import { PickerHttpClient, type PickerFailureKind, type TokenGrant } from '../file-pickers/client-base';
import type { GoogleDriveConfig } from './config';

/**
 * Google's OAuth 2.0 for web server apps and the few Drive API v3 calls we need, as documented
 * on developers.google.com (checked 15 Nov 2026):
 * - sign-in:  https://accounts.google.com/o/oauth2/v2/auth with access_type=offline, PKCE (S256)
 * - tokens:   POST https://oauth2.googleapis.com/token (authorization_code with code_verifier, or refresh_token)
 * - revoke:   POST https://oauth2.googleapis.com/revoke, token=..., form encoded; 200 means done
 * - account:  GET  /drive/v3/about?fields=user(emailAddress) (fields is required). Only the domain is kept.
 * - metadata: GET  /drive/v3/files/{id}?fields=...&supportsAllDrives=true
 * - content:  GET  /drive/v3/files/{id}?alt=media, or for a Google Doc, Sheet, Slides file or
 *             Drawing GET /drive/v3/files/{id}/export?mimeType=application/pdf (exports are
 *             limited to 10 MB by Google)
 *
 * Scope: drive.file only, which Google classes as non-sensitive and which reaches only files
 * the person picked with the Picker (or that the app created; Vero creates none). Every file
 * request is for an id the person picked; nothing here lists or searches Drive.
 */
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const GOOGLE_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
export const GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3';
/** Google's own limit on exported content. */
export const GOOGLE_EXPORT_LIMIT_BYTES = 10 * 1024 * 1024;

/** Google Workspace types Google can export to PDF. */
export const GOOGLE_EXPORTABLE = new Set([
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation',
  'application/vnd.google-apps.drawing',
]);

const FILE_ID = /^[A-Za-z0-9_-]{10,200}$/;

const PLAIN: Record<PickerFailureKind, string> = {
  invalid_grant: 'Google Drive access ended, connect again.',
  unauthorized: 'Google Drive access ended, connect again.',
  rate_limited: 'Google Drive asked us to slow down. Please try again later.',
  not_found: "Google Drive says that file isn't there, or Vero wasn't given it. Pick it again in Google Drive.",
  too_large: 'That file from Google Drive is larger than we can take.',
  unavailable: "We couldn't reach Google Drive just now. Please try again.",
  rejected: 'Google refused the request.',
  not_allowed: 'We can take PDF, PNG, JPEG and plain text files, and Google Docs, Sheets and Slides as PDFs.',
};

export interface DriveFileMeta {
  id: string;
  name: string | null;
  mimeType: string | null;
  size: number | null;
  modifiedTime: string | null;
  trashed: boolean;
}

function isoOrNull(value: unknown): string | null {
  const text = str(value, 60);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** The domain of an address, lower case, or null. The address itself is never returned. */
export function domainOf(address: string | null): string | null {
  if (!address) return null;
  const at = address.lastIndexOf('@');
  const domain = at >= 0 ? address.slice(at + 1).trim().toLowerCase() : '';
  return /^[a-z0-9.-]{1,253}$/.test(domain) && domain.includes('.') ? domain : null;
}

export class GoogleDriveClient extends PickerHttpClient {
  constructor(
    private readonly config: GoogleDriveConfig,
    options: { fetch?: FetchLike; timeoutMs?: number } = {},
  ) {
    super(options);
  }

  protected plain(kind: PickerFailureKind): string {
    return PLAIN[kind];
  }

  authorizeUrl(state: string, codeChallenge: string): string {
    const query = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: GOOGLE_DRIVE_SCOPE,
      access_type: 'offline',
      // Always ask, so a reconnect gets a refresh token again.
      prompt: 'consent',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    return `${GOOGLE_AUTHORIZE_URL}?${query.toString()}`;
  }

  /** Google's error reasons, read only to choose our own words. */
  private async failure(response: Response): Promise<never> {
    const status = response.status;
    const body = await this.json(response).catch((): Record<string, unknown> => ({}));
    const oauthError = str(body['error'], 100);
    const error = asRecord(body['error']);
    const reasons = (Array.isArray(error['errors']) ? error['errors'] : []).map((item) => str(asRecord(item)['reason'], 100) ?? '');
    if (oauthError === 'invalid_grant') throw this.fail('invalid_grant');
    if (status === 401) throw this.fail('unauthorized');
    if (reasons.some((reason) => /rateLimitExceeded|userRateLimitExceeded|dailyLimitExceeded/.test(reason))) throw this.fail('rate_limited');
    if (reasons.includes('exportSizeLimitExceeded')) throw this.fail('too_large');
    if (reasons.some((reason) => /cannotDownloadAbusiveFile|fileNotDownloadable|cannotExportFile|fileNotExportable/.test(reason))) throw this.fail('not_allowed');
    if (status === 404 || (status === 403 && reasons.some((reason) => /appNotAuthorizedToFile|insufficientFilePermissions|forbidden/.test(reason)))) throw this.fail('not_found');
    if (status >= 500) throw this.fail('unavailable');
    throw this.fail('rejected');
  }

  private async token(form: Record<string, string>): Promise<TokenGrant> {
    const response = await this.send(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      body: new URLSearchParams({ client_id: this.config.clientId, client_secret: this.config.clientSecret.reveal(), ...form }).toString(),
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

  /** Asks Google to revoke the grant. True when Google said it was done. Never throws. */
  async revoke(token: string): Promise<boolean> {
    try {
      const response = await this.send(GOOGLE_REVOKE_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token }).toString(),
      });
      await response.body?.cancel().catch(() => undefined);
      return response.ok;
    } catch {
      return false;
    }
  }

  private auth(accessToken: string): Record<string, string> {
    return { authorization: `Bearer ${accessToken}`, accept: 'application/json' };
  }

  /** The domain of the Google account that signed in. The address is read past, never kept. */
  async accountDomain(accessToken: string): Promise<string | null> {
    const response = await this.send(`${GOOGLE_DRIVE_API}/about?fields=${encodeURIComponent('user(emailAddress)')}`, { method: 'GET', headers: this.auth(accessToken) });
    if (!response.ok) return this.failure(response);
    const body = await this.json(response);
    return domainOf(str(asRecord(body['user'])['emailAddress'], 320));
  }

  private fileUrl(fileId: string): string {
    if (!FILE_ID.test(fileId)) throw this.fail('rejected');
    return `${GOOGLE_DRIVE_API}/files/${fileId}`;
  }

  /** One picked file's metadata. */
  async fileMetadata(accessToken: string, fileId: string): Promise<DriveFileMeta> {
    const query = new URLSearchParams({ fields: 'id,name,mimeType,size,modifiedTime,trashed', supportsAllDrives: 'true' });
    const response = await this.send(`${this.fileUrl(fileId)}?${query.toString()}`, { method: 'GET', headers: this.auth(accessToken) });
    if (!response.ok) return this.failure(response);
    const body = await this.json(response);
    const id = str(body['id'], 200);
    if (id !== fileId) throw this.fail('rejected');
    const size = Number(body['size']);
    return {
      id,
      name: str(body['name'], 1000),
      mimeType: str(body['mimeType'], 200),
      size: Number.isFinite(size) && size >= 0 ? size : null,
      modifiedTime: isoOrNull(body['modifiedTime']),
      trashed: body['trashed'] === true,
    };
  }

  private async content(url: string, accessToken: string, maxBytes: number): Promise<Buffer> {
    const response = await this.send(url, { method: 'GET', headers: { authorization: `Bearer ${accessToken}` } });
    if (!response.ok) return this.failure(response);
    try {
      return await readCapped(response, maxBytes);
    } catch (error) {
      if (error instanceof TooLargeError) throw this.fail('too_large');
      throw this.fail('unavailable');
    }
  }

  /** A regular file's bytes. */
  download(accessToken: string, fileId: string, maxBytes: number): Promise<Buffer> {
    return this.content(`${this.fileUrl(fileId)}?${new URLSearchParams({ alt: 'media', supportsAllDrives: 'true' }).toString()}`, accessToken, maxBytes);
  }

  /** A Google Doc, Sheet, Slides file or Drawing, as Google's PDF export. */
  exportPdf(accessToken: string, fileId: string, maxBytes: number): Promise<Buffer> {
    return this.content(`${this.fileUrl(fileId)}/export?${new URLSearchParams({ mimeType: 'application/pdf' }).toString()}`, accessToken, Math.min(maxBytes, GOOGLE_EXPORT_LIMIT_BYTES));
  }
}

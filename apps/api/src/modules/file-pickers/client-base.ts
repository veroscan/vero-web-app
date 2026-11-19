import type { FetchLike } from '@vero/connectors';
import { asRecord, readCapped, str } from '../docusign/http';

/**
 * What the Google Drive and Microsoft Graph clients share: a fixed set of failure kinds with
 * plain words, a token grant, and one way to send a request (time-limited, never following a
 * redirect on its own, counting what it sent). Error messages never contain a token, a URL, a
 * file name or anything the provider sent.
 */
export type PickerFailureKind = 'invalid_grant' | 'unauthorized' | 'rate_limited' | 'not_found' | 'too_large' | 'unavailable' | 'rejected' | 'not_allowed';

export class PickerError extends Error {
  override name = 'PickerError';
  readonly kind: PickerFailureKind;
  constructor(kind: PickerFailureKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

export interface TokenGrant {
  accessToken: string;
  /** A rotated refresh token, when the provider sends one; otherwise the old one still stands. */
  refreshToken: string | null;
  expiresInSeconds: number;
  scope: string | null;
  /** Microsoft only: the id token, read once for the tenant id and then dropped. */
  idToken: string | null;
}

/** Most JSON we read from a provider: 2 MB is far more than any answer we ask for. */
export const MAX_JSON_BYTES = 2 * 1024 * 1024;

export abstract class PickerHttpClient {
  protected readonly fetch: FetchLike;
  protected readonly timeoutMs: number;
  /** How many requests this client has sent. */
  requestsSent = 0;

  constructor(options: { fetch?: FetchLike; timeoutMs?: number }) {
    this.fetch = options.fetch ?? ((url, init) => fetch(url, init));
    this.timeoutMs = options.timeoutMs ?? 20_000;
  }

  /** The plain words for each failure, in the provider's name. */
  protected abstract plain(kind: PickerFailureKind): string;

  protected fail(kind: PickerFailureKind): PickerError {
    return new PickerError(kind, this.plain(kind));
  }

  /** `redirect` is 'error' unless the caller handles a redirect itself (Graph's download). */
  protected async send(url: string, init: RequestInit, redirect: 'error' | 'manual' = 'error'): Promise<Response> {
    this.requestsSent += 1;
    let response: Response;
    try {
      response = await this.fetch(url, { ...init, redirect, signal: AbortSignal.timeout(this.timeoutMs) });
    } catch {
      throw this.fail('unavailable');
    }
    if (response.status === 429) {
      await response.body?.cancel().catch(() => undefined);
      throw this.fail('rate_limited');
    }
    return response;
  }

  protected async json(response: Response): Promise<Record<string, unknown>> {
    try {
      return asRecord(JSON.parse((await readCapped(response, MAX_JSON_BYTES)).toString('utf8')));
    } catch {
      throw this.fail('unavailable');
    }
  }

  /** Reads a standard OAuth token answer. */
  protected async grantFrom(response: Response): Promise<TokenGrant> {
    const body = await this.json(response);
    const accessToken = str(body['access_token'], 16000);
    const expires = typeof body['expires_in'] === 'number' ? body['expires_in'] : Number(body['expires_in']);
    if (!accessToken || !Number.isFinite(expires) || expires <= 0) throw this.fail('unavailable');
    return {
      accessToken,
      refreshToken: str(body['refresh_token'], 16000),
      expiresInSeconds: Math.min(expires, 24 * 3600),
      scope: str(body['scope'], 300),
      idToken: str(body['id_token'], 16000),
    };
  }
}

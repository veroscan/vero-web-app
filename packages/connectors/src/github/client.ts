import type { KeyObject } from 'node:crypto';
import { createHttp, type Http, type HttpResponse } from '../runtime.js';
import type { FetchLike } from '../types.js';
import { assertAllowedGithubPath, GITHUB_MAX_FILE_BYTES, isSafeRef, isValidRepoFullName } from './allowlist.js';
import { createAppJwt } from './jwt.js';

/**
 * - not_found: GitHub says it isn't there, or the app can no longer see it.
 * - revoked: the installation is gone or no longer accepts the app.
 * - suspended: the customer suspended the app on GitHub.
 * - rate_limited: GitHub asked us to wait longer than we are willing to.
 * - unavailable: GitHub didn't answer, or answered with something we couldn't read.
 * - rejected: GitHub refused the request for another reason.
 */
export type GithubFailureKind = 'not_found' | 'revoked' | 'suspended' | 'rate_limited' | 'unavailable' | 'rejected';

const PLAIN: Record<GithubFailureKind, string> = {
  not_found: 'GitHub says this is not there, or our app can no longer see it.',
  revoked: 'The GitHub app is no longer installed on this account, so we could not read it.',
  suspended: 'The GitHub app is suspended on this account, so we could not read it.',
  rate_limited: 'GitHub asked us to slow down. We will try again later.',
  unavailable: "We couldn't reach GitHub just now.",
  rejected: 'GitHub refused the request.',
};

/** Messages are plain and fixed: never a URL, a header, a token or anything GitHub sent. */
export class GithubError extends Error {
  override name = 'GithubError';
  readonly kind: GithubFailureKind;
  readonly resetAt?: Date;
  constructor(kind: GithubFailureKind, resetAt?: Date) {
    super(PLAIN[kind]);
    this.kind = kind;
    if (resetAt) this.resetAt = resetAt;
  }
}

export interface GithubClientOptions {
  appId: string;
  privateKey: KeyObject;
  /** https://api.github.com, or a GitHub Enterprise address such as https://github.example/api/v3. */
  apiUrl: string;
  fetch?: FetchLike;
  now?: () => Date;
  sleep?: (ms: number) => Promise<void>;
  timeoutMs?: number;
  retries?: number;
  /** The longest we wait for GitHub's rate limit to reset before giving up for this run. */
  maxRateLimitWaitMs?: number;
  userAgent?: string;
}

export interface GithubInstallationInfo {
  id: number;
  accountLogin: string;
  accountType: string;
  suspended: boolean;
  /** When it was installed or last changed on GitHub, the later of the two. */
  lastChangedAt: Date | null;
}

export interface GithubRepoSummary {
  id: number;
  fullName: string;
  defaultBranch: string | null;
  private: boolean;
}

export interface GithubRepoDetails extends GithubRepoSummary {
  archived: boolean;
  visibility: 'private' | 'public' | 'internal' | null;
  pushedAt: string | null;
  /** GitHub's own detection, as it reports it. NOASSERTION means GitHub couldn't tell. */
  licenceSpdx: string | null;
}

export type GithubFile =
  | { status: 'found'; content: Buffer; sha: string; size: number; etag: string | null }
  | { status: 'not_modified' }
  | { status: 'missing' }
  | { status: 'too_large'; size: number }
  | { status: 'not_a_file' };

interface CachedToken {
  token: string;
  expiresAt: number;
}

/** A token with less than this left is replaced before use. */
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const API_VERSION = '2022-11-28';
const LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function positiveInt(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

/**
 * The GitHub App, read-only. The app's own JWT is used only to look up or remove an
 * installation and to exchange for a short-lived installation token. That token lives in
 * this object's memory until shortly before it expires: it is never stored, logged or
 * returned. Every file request is checked against the allowlist before anything is sent.
 */
export class GithubAppClient {
  private readonly http: Http;
  private readonly apiUrl: string;
  private readonly now: () => Date;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly maxWaitMs: number;
  private readonly tokens = new Map<number, CachedToken>();
  /** What GitHub last told us about each credential's remaining requests. */
  private readonly budget = new Map<string, { remaining: number; resetAt: number }>();
  /** How many requests this client has sent. Tests use it to prove a refusal sent nothing. */
  requestsSent = 0;

  private readonly options: GithubClientOptions;

  constructor(options: GithubClientOptions) {
    this.options = options;
    this.apiUrl = options.apiUrl.replace(/\/+$/, '');
    this.now = options.now ?? (() => new Date());
    this.sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
    this.maxWaitMs = options.maxRateLimitWaitMs ?? 60_000;
    const baseFetch = options.fetch ?? ((url: string, init?: RequestInit) => fetch(url, init));
    const counted: FetchLike = (url, init) => {
      this.requestsSent += 1;
      return baseFetch(url, init);
    };
    this.http = createHttp({
      fetch: counted,
      sleep: this.sleep,
      timeoutMs: options.timeoutMs ?? 15_000,
      retries: options.retries ?? 2,
      sourceName: 'GitHub',
    });
  }

  /** Whether a usable installation token is held in memory. For tests. */
  hasCachedToken(installationId: number): boolean {
    const cached = this.tokens.get(installationId);
    return cached !== undefined && cached.expiresAt - this.now().getTime() > TOKEN_REFRESH_MARGIN_MS;
  }

  /** Drops any token held for this installation, for example after it was removed. */
  forgetInstallation(installationId: number): void {
    this.tokens.delete(installationId);
  }

  private appJwt(): string {
    return createAppJwt(this.options.appId, this.options.privateKey, this.now());
  }

  private noteBudget(key: string, headers: Headers): void {
    const remaining = Number(headers.get('x-ratelimit-remaining'));
    const reset = Number(headers.get('x-ratelimit-reset'));
    if (headers.has('x-ratelimit-remaining') && Number.isFinite(remaining) && Number.isFinite(reset)) {
      this.budget.set(key, { remaining, resetAt: reset * 1000 });
    }
  }

  /** How long GitHub wants us to wait, from Retry-After or the reset time. */
  private waitFor(headers: Headers): number {
    const retryAfter = Number(headers.get('retry-after'));
    if (headers.has('retry-after') && Number.isFinite(retryAfter)) return Math.max(0, retryAfter * 1000);
    const reset = Number(headers.get('x-ratelimit-reset'));
    if (headers.has('x-ratelimit-reset') && Number.isFinite(reset)) return Math.max(0, reset * 1000 - this.now().getTime());
    return 60_000;
  }

  private isRateLimited(response: HttpResponse): boolean {
    if (response.status === 429) return true;
    if (response.status !== 403) return false;
    return response.headers.get('x-ratelimit-remaining') === '0' || response.headers.has('retry-after');
  }

  /** Waits for the reset if the budget is spent and the wait is short; gives up otherwise. */
  private async respectBudget(key: string): Promise<void> {
    const known = this.budget.get(key);
    if (!known || known.remaining > 0) return;
    const wait = known.resetAt - this.now().getTime();
    if (wait <= 0) return;
    if (wait > this.maxWaitMs) throw new GithubError('rate_limited', new Date(known.resetAt));
    await this.sleep(wait);
    this.budget.delete(key);
  }

  private async send(
    path: string,
    credential: { kind: 'app' } | { kind: 'installation'; installationId: number },
    init: { method?: string; accept?: string; etag?: string | null; allowBodyless?: boolean } = {},
  ): Promise<HttpResponse> {
    const key = credential.kind === 'app' ? 'app' : `installation:${credential.installationId}`;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await this.respectBudget(key);
      const authorization = credential.kind === 'app' ? `Bearer ${this.appJwt()}` : `token ${await this.installationToken(credential.installationId)}`;
      const headers: Record<string, string> = {
        accept: init.accept ?? 'application/vnd.github+json',
        'x-github-api-version': API_VERSION,
        'user-agent': this.options.userAgent ?? 'VeroScan-GitHub-App',
        authorization,
      };
      if (init.etag) headers['if-none-match'] = init.etag;
      let response: HttpResponse;
      try {
        response = await this.http(`${this.apiUrl}${path}`, { method: init.method ?? 'GET', headers, allow: [304, 401, 403, 409, 422, 429] });
      } catch {
        // Timeouts, network failures and GitHub's own 5xx after retries. Nothing of the URL or headers is kept.
        throw new GithubError('unavailable');
      }
      this.noteBudget(key, response.headers);
      if (this.isRateLimited(response)) {
        const wait = this.waitFor(response.headers);
        if (attempt === 0 && wait <= this.maxWaitMs) {
          await this.sleep(wait);
          this.budget.delete(key);
          continue;
        }
        throw new GithubError('rate_limited', new Date(this.now().getTime() + wait));
      }
      return response;
    }
    throw new GithubError('rate_limited');
  }

  private json(response: HttpResponse): unknown {
    try {
      return response.json();
    } catch {
      throw new GithubError('unavailable');
    }
  }

  /** A short-lived installation token, from memory if one is still good. */
  private async installationToken(installationId: number): Promise<string> {
    const cached = this.tokens.get(installationId);
    if (cached && cached.expiresAt - this.now().getTime() > TOKEN_REFRESH_MARGIN_MS) return cached.token;
    const response = await this.send(`/app/installations/${installationId}/access_tokens`, { kind: 'app' }, { method: 'POST' });
    if (response.status === 404 || response.status === 401) throw new GithubError('revoked');
    if (response.status === 403) throw new GithubError('suspended');
    if (response.status !== 201 && response.status !== 200) throw new GithubError('rejected');
    const body = asRecord(this.json(response));
    const token = str(body['token']);
    const expiresAt = Date.parse(str(body['expires_at']) ?? '');
    if (!token || !Number.isFinite(expiresAt)) throw new GithubError('unavailable');
    this.tokens.set(installationId, { token, expiresAt });
    return token;
  }

  /** The installation as GitHub knows it: whose account, and whether it is suspended. */
  async getInstallation(installationId: number): Promise<GithubInstallationInfo> {
    const response = await this.send(`/app/installations/${installationId}`, { kind: 'app' });
    if (response.status === 404) throw new GithubError('not_found');
    if (response.status === 401 || response.status === 403) throw new GithubError('rejected');
    if (response.status !== 200) throw new GithubError('rejected');
    const body = asRecord(this.json(response));
    const account = asRecord(body['account']);
    const id = positiveInt(body['id']);
    const login = str(account['login']);
    const type = str(account['type']);
    if (id !== installationId || !login || !LOGIN.test(login) || !type) throw new GithubError('unavailable');
    const times = [str(body['created_at']), str(body['updated_at'])].map((value) => Date.parse(value ?? '')).filter((value) => Number.isFinite(value));
    return {
      id,
      accountLogin: login,
      accountType: type,
      suspended: body['suspended_at'] !== null && body['suspended_at'] !== undefined,
      lastChangedAt: times.length > 0 ? new Date(Math.max(...times)) : null,
    };
  }

  /** Removes the app from the customer's account. Best effort: false when GitHub didn't confirm. */
  async deleteInstallation(installationId: number): Promise<boolean> {
    this.tokens.delete(installationId);
    try {
      const response = await this.send(`/app/installations/${installationId}`, { kind: 'app' }, { method: 'DELETE' });
      return response.status === 204 || response.status === 404;
    } catch {
      return false;
    }
  }

  /** The repositories the customer let the app see, up to `max`. */
  async listRepositories(installationId: number, max: number): Promise<{ repositories: GithubRepoSummary[]; complete: boolean }> {
    const repositories: GithubRepoSummary[] = [];
    for (let page = 1; repositories.length < max; page += 1) {
      const response = await this.send(`/installation/repositories?per_page=100&page=${page}`, { kind: 'installation', installationId });
      if (response.status === 404 || response.status === 401) throw new GithubError('revoked');
      if (response.status === 403) throw new GithubError('suspended');
      if (response.status !== 200) throw new GithubError('rejected');
      const body = asRecord(this.json(response));
      const items = Array.isArray(body['repositories']) ? body['repositories'] : [];
      for (const item of items) {
        const summary = this.summary(item);
        if (summary) repositories.push(summary);
      }
      const total = typeof body['total_count'] === 'number' ? body['total_count'] : repositories.length;
      if (items.length < 100 || page * 100 >= total) return { repositories: repositories.slice(0, max), complete: repositories.length <= max };
    }
    return { repositories: repositories.slice(0, max), complete: false };
  }

  private summary(raw: unknown): GithubRepoSummary | null {
    const item = asRecord(raw);
    const id = positiveInt(item['id']);
    const fullName = str(item['full_name']);
    if (!id || !fullName || !isValidRepoFullName(fullName)) return null;
    const branch = str(item['default_branch']);
    return { id, fullName, defaultBranch: branch && isSafeRef(branch) ? branch : null, private: item['private'] === true };
  }

  /** Repository facts: visibility, archived, last push and GitHub's licence detection. By id, so a rename doesn't lose it. */
  async getRepository(installationId: number, repositoryId: number): Promise<GithubRepoDetails> {
    const response = await this.send(`/repositories/${repositoryId}`, { kind: 'installation', installationId });
    if (response.status === 404) throw new GithubError('not_found');
    if (response.status === 401) throw new GithubError('revoked');
    if (response.status === 403) throw new GithubError('suspended');
    if (response.status !== 200) throw new GithubError('rejected');
    const body = asRecord(this.json(response));
    const summary = this.summary(body);
    if (!summary || summary.id !== repositoryId) throw new GithubError('unavailable');
    const visibility = str(body['visibility']);
    const licence = asRecord(body['license']);
    const spdx = str(licence['spdx_id']);
    return {
      ...summary,
      archived: body['archived'] === true,
      visibility: visibility === 'private' || visibility === 'public' || visibility === 'internal' ? visibility : summary.private ? 'private' : 'public',
      pushedAt: str(body['pushed_at']),
      licenceSpdx: spdx && /^[A-Za-z0-9.+-]{1,64}$/.test(spdx) ? spdx : null,
    };
  }

  /** The commit the default branch points at, so each file read is tied to one commit. */
  async getBranchSha(installationId: number, fullName: string, branch: string): Promise<string | null> {
    if (!isValidRepoFullName(fullName) || !isSafeRef(branch)) throw new GithubError('rejected');
    const response = await this.send(`/repos/${fullName}/branches/${encodePath(branch)}`, { kind: 'installation', installationId });
    if (response.status === 404) return null;
    if (response.status === 401) throw new GithubError('revoked');
    if (response.status !== 200) throw new GithubError('rejected');
    const sha = str(asRecord(asRecord(this.json(response))['commit'])['sha']);
    return sha && /^[0-9a-f]{40,64}$/.test(sha) ? sha : null;
  }

  /**
   * One allowlisted file at one commit. Refuses any other path before a request is made.
   * Over 256 KB it is skipped, never decoded. With an ETag, an unchanged file costs GitHub
   * nothing and comes back as not_modified.
   */
  async getFile(installationId: number, fullName: string, path: string, ref: string, etag?: string | null): Promise<GithubFile> {
    assertAllowedGithubPath(path);
    if (!isValidRepoFullName(fullName) || !isSafeRef(ref)) throw new GithubError('rejected');
    const response = await this.send(`/repos/${fullName}/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`, { kind: 'installation', installationId }, { etag: etag ?? null });
    if (response.status === 304) return { status: 'not_modified' };
    if (response.status === 404) return { status: 'missing' };
    if (response.status === 401) throw new GithubError('revoked');
    if (response.status === 403) throw new GithubError('suspended');
    if (response.status !== 200) throw new GithubError('rejected');
    const parsed = this.json(response);
    if (Array.isArray(parsed)) return { status: 'not_a_file' };
    const body = asRecord(parsed);
    if (body['type'] !== 'file') return { status: 'not_a_file' };
    const size = typeof body['size'] === 'number' && body['size'] >= 0 ? body['size'] : Number.POSITIVE_INFINITY;
    if (size > GITHUB_MAX_FILE_BYTES) return { status: 'too_large', size };
    const sha = str(body['sha']);
    const encoded = str(body['content']) ?? '';
    if (!sha || body['encoding'] !== 'base64') return { status: 'too_large', size };
    const content = Buffer.from(encoded.replace(/\s+/g, ''), 'base64');
    if (content.length > GITHUB_MAX_FILE_BYTES) return { status: 'too_large', size: content.length };
    return { status: 'found', content, sha, size: content.length, etag: response.headers.get('etag') };
  }

  /** Public logins of the people GitHub lists as contributors (first 100), bots left out. */
  async listContributors(installationId: number, fullName: string): Promise<{ logins: string[]; complete: boolean }> {
    if (!isValidRepoFullName(fullName)) throw new GithubError('rejected');
    const response = await this.send(`/repos/${fullName}/contributors?per_page=100`, { kind: 'installation', installationId });
    if (response.status === 204 || response.status === 404) return { logins: [], complete: true };
    if (response.status === 401) throw new GithubError('revoked');
    if (response.status !== 200) throw new GithubError('rejected');
    const items = this.json(response);
    const logins = (Array.isArray(items) ? items : [])
      .map((item) => asRecord(item))
      .filter((item) => item['type'] === 'User')
      .map((item) => str(item['login']))
      .filter((login): login is string => login !== null && LOGIN.test(login));
    const complete = !/rel="next"/.test(response.headers.get('link') ?? '');
    return { logins: [...new Set(logins)], complete };
  }
}

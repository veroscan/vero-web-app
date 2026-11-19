import { generateKeyPairSync, verify } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  APP_JWT_LIFETIME_SECONDS,
  createAppJwt,
  GITHUB_ALLOWED_PATHS,
  GITHUB_MAX_FILE_BYTES,
  GithubAppClient,
  GithubError,
  isAllowedGithubPath,
  parseGithubPrivateKey,
  PathNotAllowedError,
} from '../src/index.js';

/** A throwaway key made for this run only. No key is ever stored in the repository. */
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const NOW = new Date('2026-11-12T10:00:00Z');
const API = 'https://api.github.test';
const TOKEN = 'ghs_fictional_installation_token_kestrel';

interface Call {
  url: string;
  method: string;
  headers: Record<string, string>;
}

function json(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(status === 204 || status === 304 ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}

/** Mocked GitHub. Routes are matched on method and path; anything unknown is a 404. Nothing leaves the process. */
function fakeGithub(routes: Record<string, (call: Call) => Response>) {
  const calls: Call[] = [];
  const fetch = async (url: string, init?: RequestInit): Promise<Response> => {
    const headers = Object.fromEntries(Object.entries((init?.headers ?? {}) as Record<string, string>).map(([k, v]) => [k.toLowerCase(), v]));
    const call = { url, method: init?.method ?? 'GET', headers };
    calls.push(call);
    const path = url.slice(API.length).split('?')[0] ?? '';
    const handler = routes[`${call.method} ${path}`];
    return handler ? handler(call) : json(404, { message: 'Not Found' });
  };
  return { fetch, calls };
}

const tokenRoute = () => json(201, { token: TOKEN, expires_at: new Date(NOW.getTime() + 60 * 60 * 1000).toISOString() });

function client(fetch: (url: string, init?: RequestInit) => Promise<Response>, extra: { now?: () => Date; sleeps?: number[]; maxRateLimitWaitMs?: number } = {}) {
  return new GithubAppClient({
    appId: '123456',
    privateKey,
    apiUrl: API,
    fetch,
    now: extra.now ?? (() => NOW),
    sleep: async (ms) => {
      extra.sleeps?.push(ms);
    },
    retries: 0,
    ...(extra.maxRateLimitWaitMs !== undefined ? { maxRateLimitWaitMs: extra.maxRateLimitWaitMs } : {}),
  });
}

function decode(part: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as Record<string, unknown>;
}

describe('GitHub App JWT', () => {
  it('is RS256, issued by the app, and expires within 10 minutes', () => {
    const jwt = createAppJwt('123456', privateKey, NOW);
    const [header, payload, signature] = jwt.split('.');
    expect(decode(header ?? '')).toEqual({ alg: 'RS256', typ: 'JWT' });
    const claims = decode(payload ?? '') as { iat: number; exp: number; iss: string };
    const now = NOW.getTime() / 1000;
    expect(claims.iss).toBe('123456');
    expect(claims.iat).toBe(now - 60);
    expect(claims.exp).toBe(now + APP_JWT_LIFETIME_SECONDS);
    expect(claims.exp - now).toBeLessThanOrEqual(9 * 60);
    expect(claims.exp - claims.iat).toBeLessThanOrEqual(10 * 60);
    expect(verify('RSA-SHA256', Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(signature ?? '', 'base64url'))).toBe(true);
  });

  it('reads a PEM given with \\n escapes, and refuses anything else without echoing it', () => {
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    const key = parseGithubPrivateKey(pem.replace(/\n/g, '\\n'));
    expect(key.asymmetricKeyType).toBe('rsa');
    expect(JSON.stringify({ key })).not.toContain('PRIVATE');
    const attempt = () => parseGithubPrivateKey('-----BEGIN PRIVATE KEY-----\nnot-a-key-kestrel\n-----END PRIVATE KEY-----');
    expect(attempt).toThrow(/could not be read/);
    try {
      attempt();
    } catch (error) {
      expect(String(error)).not.toContain('not-a-key-kestrel');
    }
  });
});

describe('installation tokens', () => {
  it('are fetched once and reused from memory until shortly before they expire', async () => {
    const github = fakeGithub({
      'POST /app/installations/77/access_tokens': tokenRoute,
      'GET /repos/kestrel-pay/api/contributors': () => json(200, []),
    });
    let now = NOW;
    const gh = client(github.fetch, { now: () => now });
    await gh.listContributors(77, 'kestrel-pay/api');
    await gh.listContributors(77, 'kestrel-pay/api');
    expect(github.calls.filter((call) => call.url.endsWith('/access_tokens'))).toHaveLength(1);
    expect(gh.hasCachedToken(77)).toBe(true);
    // The app JWT is only used to get the token; repository calls use the token.
    expect(github.calls.find((call) => call.url.endsWith('/access_tokens'))?.headers['authorization']).toMatch(/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/);
    expect(github.calls.at(-1)?.headers['authorization']).toBe(`token ${TOKEN}`);
    // 56 minutes later only 4 are left, so a new one is fetched.
    now = new Date(NOW.getTime() + 56 * 60 * 1000);
    await gh.listContributors(77, 'kestrel-pay/api');
    expect(github.calls.filter((call) => call.url.endsWith('/access_tokens'))).toHaveLength(2);
  });

  it('a removed installation is "revoked", and the error carries nothing GitHub sent', async () => {
    const github = fakeGithub({ 'POST /app/installations/77/access_tokens': () => json(404, { message: 'Integration not found https://internal.example' }) });
    const error = await client(github.fetch).getRepository(77, 1).catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(GithubError);
    expect((error as GithubError).kind).toBe('revoked');
    expect((error as GithubError).message).not.toMatch(/http|Integration|ghs_/);
  });
});

describe('the allowlist', () => {
  it('lists only the agreed files', () => {
    expect([...GITHUB_ALLOWED_PATHS].sort()).toEqual(
      [
        'LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING', 'NOTICE', 'PRIVACY.md', 'TERMS.md', 'CLA.md', 'package.json',
        'requirements.txt', 'go.mod', 'Cargo.toml', 'pom.xml', 'Gemfile', 'composer.json',
        'SECURITY.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'CODEOWNERS',
        '.github/SECURITY.md', '.github/CONTRIBUTING.md', '.github/CODE_OF_CONDUCT.md', '.github/CODEOWNERS',
        'docs/SECURITY.md', 'docs/CONTRIBUTING.md', 'docs/CODE_OF_CONDUCT.md', 'docs/CODEOWNERS',
      ].sort(),
    );
  });

  it.each([
    'src/index.ts', '.env', 'config/secrets.yml', '../LICENSE', '/LICENSE', 'license', 'LICENSE?ref=x', 'docs/../src/app.ts',
    '.git/config', 'docs/LICENSE', '.github/workflows/deploy.yml', 'package-lock.json', '', 'LICENSE ',
  ])('refuses %j before any request is made', async (path) => {
    const github = fakeGithub({ 'POST /app/installations/77/access_tokens': tokenRoute });
    const gh = client(github.fetch);
    expect(isAllowedGithubPath(path)).toBe(false);
    await expect(gh.getFile(77, 'kestrel-pay/api', path, 'a'.repeat(40))).rejects.toBeInstanceOf(PathNotAllowedError);
    expect(github.calls).toHaveLength(0);
    expect(gh.requestsSent).toBe(0);
  });

  it('refuses repository names and refs that could change the address', async () => {
    const github = fakeGithub({});
    const gh = client(github.fetch);
    await expect(gh.getFile(77, 'kestrel-pay/../../user', 'LICENSE', 'main')).rejects.toBeInstanceOf(GithubError);
    await expect(gh.getFile(77, 'kestrel-pay/api', 'LICENSE', '../main')).rejects.toBeInstanceOf(GithubError);
    expect(github.calls).toHaveLength(0);
  });
});

describe('reading a file', () => {
  const sha = 'b'.repeat(40);
  it('decodes an allowlisted file, keeps its ETag, and uses it next time', async () => {
    const github = fakeGithub({
      'POST /app/installations/77/access_tokens': tokenRoute,
      'GET /repos/kestrel-pay/api/contents/LICENSE': (call) =>
        call.headers['if-none-match'] === '"v1"'
          ? json(304, null)
          : json(200, { type: 'file', size: 11, sha: 'c'.repeat(40), encoding: 'base64', content: Buffer.from('MIT License').toString('base64') }, { etag: '"v1"' }),
    });
    const gh = client(github.fetch);
    const first = await gh.getFile(77, 'kestrel-pay/api', 'LICENSE', sha);
    expect(first).toMatchObject({ status: 'found', etag: '"v1"', size: 11 });
    expect(first.status === 'found' && first.content.toString()).toBe('MIT License');
    expect(await gh.getFile(77, 'kestrel-pay/api', 'LICENSE', sha, '"v1"')).toEqual({ status: 'not_modified' });
    expect(github.calls.at(-1)?.url).toBe(`${API}/repos/kestrel-pay/api/contents/LICENSE?ref=${sha}`);
  });

  it('skips a file over 256 KB without decoding it', async () => {
    const github = fakeGithub({
      'POST /app/installations/77/access_tokens': tokenRoute,
      'GET /repos/kestrel-pay/api/contents/NOTICE': () => json(200, { type: 'file', size: GITHUB_MAX_FILE_BYTES + 1, sha: 'c'.repeat(40), encoding: 'base64', content: 'QUFB' }),
      'GET /repos/kestrel-pay/api/contents/COPYING': () => json(200, { type: 'file', size: 2_000_000, sha: 'c'.repeat(40), encoding: 'none', content: '' }),
    });
    const gh = client(github.fetch);
    expect(await gh.getFile(77, 'kestrel-pay/api', 'NOTICE', sha)).toEqual({ status: 'too_large', size: GITHUB_MAX_FILE_BYTES + 1 });
    expect(await gh.getFile(77, 'kestrel-pay/api', 'COPYING', sha)).toEqual({ status: 'too_large', size: 2_000_000 });
  });

  it('a missing file is "missing", and a directory is not a file', async () => {
    const github = fakeGithub({
      'POST /app/installations/77/access_tokens': tokenRoute,
      'GET /repos/kestrel-pay/api/contents/docs/SECURITY.md': () => json(200, [{ name: 'x' }]),
    });
    const gh = client(github.fetch);
    expect(await gh.getFile(77, 'kestrel-pay/api', 'SECURITY.md', sha)).toEqual({ status: 'missing' });
    expect(await gh.getFile(77, 'kestrel-pay/api', 'docs/SECURITY.md', sha)).toEqual({ status: 'not_a_file' });
  });
});

describe('rate limits', () => {
  it('waits for the reset GitHub names, then tries again', async () => {
    let first = true;
    const reset = String(NOW.getTime() / 1000 + 2);
    const github = fakeGithub({
      'POST /app/installations/77/access_tokens': tokenRoute,
      'GET /repositories/9': () => {
        if (first) {
          first = false;
          return json(403, { message: 'API rate limit exceeded' }, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': reset });
        }
        return json(200, { id: 9, full_name: 'kestrel-pay/api', default_branch: 'main', private: true, visibility: 'private', archived: false, pushed_at: '2026-11-01T00:00:00Z', license: { spdx_id: 'MIT' } }, { 'x-ratelimit-remaining': '4999', 'x-ratelimit-reset': reset });
      },
    });
    const sleeps: number[] = [];
    const repo = await client(github.fetch, { sleeps }).getRepository(77, 9);
    expect(repo).toMatchObject({ fullName: 'kestrel-pay/api', licenceSpdx: 'MIT', visibility: 'private' });
    expect(sleeps).toEqual([2000]);
  });

  it('gives up for this run when the wait is too long, and backs off before asking again', async () => {
    const reset = String(NOW.getTime() / 1000 + 3600);
    const github = fakeGithub({
      'POST /app/installations/77/access_tokens': tokenRoute,
      'GET /repositories/9': () => json(429, {}, { 'retry-after': '3600' }),
      'GET /repos/kestrel-pay/api/contributors': () => json(200, [], { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': reset }),
    });
    const gh = client(github.fetch, { maxRateLimitWaitMs: 60_000 });
    const error = await gh.getRepository(77, 9).catch((reason: unknown) => reason);
    expect((error as GithubError).kind).toBe('rate_limited');
    // A spent budget stops the next request before it is sent.
    await gh.listContributors(77, 'kestrel-pay/api');
    const sent = github.calls.length;
    await expect(gh.listContributors(77, 'kestrel-pay/api')).rejects.toMatchObject({ kind: 'rate_limited' });
    expect(github.calls.length).toBe(sent);
  });
});

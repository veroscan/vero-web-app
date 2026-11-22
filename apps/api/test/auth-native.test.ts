import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SESSION_COOKIE } from '../src/modules/auth/session';
import { errorOf, startHarness, uniqueEmail, type Harness } from './support/harness';

/** The phone app: no cookies, a marked request and a Bearer token kept in the device's secure store. */
describe('sign-in from the phone app', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  const NATIVE = { 'x-vero-client': 'mobile' };

  async function linkFor(email: string): Promise<{ token: string; text: string }> {
    const { rows } = await h.admin.query<{ body_text: string }>(
      'SELECT body_text FROM outbox WHERE to_email = $1 ORDER BY created_at DESC, id LIMIT 1',
      [email],
    );
    const text = rows[0]?.body_text ?? '';
    const token = /token=([^\s&]+)/.exec(text)?.[1];
    if (!token) throw new Error('no link in the outbox');
    return { token: decodeURIComponent(token), text };
  }

  async function signInNative(email = uniqueEmail()): Promise<string> {
    const asked = await h.request('POST', '/v1/auth/magic-link/request', { origin: null, headers: NATIVE, body: { email, app: true } });
    expect(asked.statusCode).toBe(202);
    const { token } = await linkFor(email);
    const response = await h.request('POST', '/v1/auth/magic-link/verify', { origin: null, headers: NATIVE, body: { token } });
    expect(response.statusCode).toBe(200);
    const sessionToken = response.json<{ sessionToken?: string }>().sessionToken;
    if (!sessionToken) throw new Error('no session token');
    return sessionToken;
  }

  it('asks for a link without an Origin, and the link says it came from the app', async () => {
    const email = uniqueEmail();
    const asked = await h.request('POST', '/v1/auth/magic-link/request', { origin: null, headers: NATIVE, body: { email, app: true } });
    expect(asked.statusCode).toBe(202);
    const { text } = await linkFor(email);
    expect(text).toMatch(/sign-in\/verify\?token=[^\s&]+&app=1/);
  });

  it('returns the session token in the body and sets no cookie', async () => {
    const email = uniqueEmail();
    await h.request('POST', '/v1/auth/magic-link/request', { origin: null, headers: NATIVE, body: { email, app: true } });
    const { token } = await linkFor(email);
    const response = await h.request('POST', '/v1/auth/magic-link/verify', { origin: null, headers: NATIVE, body: { token } });
    expect(response.statusCode).toBe(200);
    expect(typeof response.json<{ sessionToken?: string }>().sessionToken).toBe('string');
    expect(response.cookies.find((cookie) => cookie.name === SESSION_COOKIE)).toBeUndefined();
  });

  it('a browser sign-in never sees the token', async () => {
    const token = await h.requestLink(uniqueEmail());
    const response = await h.request('POST', '/v1/auth/magic-link/verify', { body: { token } });
    expect(response.statusCode).toBe(200);
    expect(response.json<Record<string, unknown>>()).not.toHaveProperty('sessionToken');
  });

  it('the Bearer token works for reads and writes from the app', async () => {
    const sessionToken = await signInNative();
    const auth = { ...NATIVE, authorization: `Bearer ${sessionToken}` };
    const me = await h.request('GET', '/v1/me', { origin: null, headers: auth });
    expect(me.statusCode).toBe(200);
    const out = await h.request('POST', '/v1/auth/logout', { origin: null, headers: auth });
    expect(out.statusCode).toBe(200);
    expect((await h.request('GET', '/v1/me', { origin: null, headers: auth })).statusCode).toBe(401);
  });

  it('ignores a Bearer token on a request that is not marked as the app', async () => {
    const sessionToken = await signInNative();
    const response = await h.request('GET', '/v1/me', { origin: null, headers: { authorization: `Bearer ${sessionToken}` } });
    expect(response.statusCode).toBe(401);
    expect(errorOf(response).code).toBe('unauthenticated');
  });

  it('still refuses a browser write with no Origin', async () => {
    const response = await h.request('POST', '/v1/auth/magic-link/request', { origin: null, body: { email: uniqueEmail() } });
    expect(response.statusCode).toBe(403);
    expect(errorOf(response).code).toBe('origin_not_allowed');
  });

  it('a marked request that carries a cookie still needs an allowed Origin', async () => {
    const person = await h.signIn();
    const response = await h.request('POST', '/v1/auth/logout', { origin: 'https://evil.example', cookie: person.cookie, headers: NATIVE });
    expect(response.statusCode).toBe(403);
    expect(errorOf(response).code).toBe('origin_not_allowed');
  });

  it('refuses the app header from a site the API does not know (CORS preflight)', async () => {
    const response = await h.app.inject({
      method: 'OPTIONS',
      url: '/v1/me',
      headers: { origin: 'https://evil.example', 'access-control-request-method': 'GET', 'access-control-request-headers': 'x-vero-client,authorization' },
    });
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});

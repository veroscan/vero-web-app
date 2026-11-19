import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { hashToken } from '../src/lib/crypto';
import { SESSION_COOKIE } from '../src/modules/auth/session';
import { errorOf, startHarness, uniqueEmail, type Harness } from './support/harness';

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

describe('sessions', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  const me = (cookie?: string) => h.request('GET', '/v1/me', { cookie });

  it('sets a cookie that is HttpOnly, Secure, SameSite=Lax and lasts 30 days', async () => {
    const token = await h.requestLink(uniqueEmail());
    const response = await h.request('POST', '/v1/auth/magic-link/verify', { body: { token } });
    const cookie = response.cookies.find((item) => item.name === SESSION_COOKIE);

    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.secure).toBe(true);
    expect(cookie?.sameSite).toBe('Lax');
    expect(cookie?.path).toBe('/');
    expect(cookie?.maxAge).toBe(THIRTY_DAYS_SECONDS);
  });

  it('stores only a hash of the cookie value', async () => {
    const person = await h.signIn();
    const raw = person.cookie.split('=')[1] as string;
    const { rows } = await h.admin.query<{ token_hash: string }>('SELECT token_hash FROM session WHERE user_id = $1', [person.userId]);
    expect(rows[0]?.token_hash).toBe(hashToken(raw));
    expect(JSON.stringify(rows)).not.toContain(raw);
  });

  it('refuses a request with no cookie', async () => {
    const response = await me();
    expect(response.statusCode).toBe(401);
    expect(errorOf(response).code).toBe('unauthenticated');
  });

  it('refuses a made-up cookie and clears it', async () => {
    const response = await me(`${SESSION_COOKIE}=not-a-real-session`);
    expect(response.statusCode).toBe(401);
    const cleared = response.cookies.find((item) => item.name === SESSION_COOKIE);
    expect(cleared?.value).toBe('');
  });

  it('refuses an expired session', async () => {
    const person = await h.signIn();
    await h.admin.query(`UPDATE session SET expires_at = now() - interval '1 second' WHERE user_id = $1`, [person.userId]);
    expect((await me(person.cookie)).statusCode).toBe(401);
  });

  it('rolls the 30-day expiry forward when used', async () => {
    const person = await h.signIn();
    await h.admin.query(`UPDATE session SET expires_at = now() + interval '10 days' WHERE user_id = $1`, [person.userId]);

    const response = await me(person.cookie);
    expect(response.statusCode).toBe(200);
    expect(response.cookies.find((item) => item.name === SESSION_COOKIE)?.maxAge).toBe(THIRTY_DAYS_SECONDS);

    const { rows } = await h.admin.query<{ days: string }>(
      `SELECT EXTRACT(EPOCH FROM (expires_at - now())) / 86400 AS days FROM session WHERE user_id = $1`,
      [person.userId],
    );
    expect(Number(rows[0]?.days)).toBeGreaterThan(29.9);
  });

  it('does not rewrite the session on every request', async () => {
    const person = await h.signIn();
    const response = await me(person.cookie);
    expect(response.cookies.find((item) => item.name === SESSION_COOKIE)).toBeUndefined();
  });

  it('logout revokes the session on the server, not just the cookie', async () => {
    const person = await h.signIn();
    const out = await h.request('POST', '/v1/auth/logout', { cookie: person.cookie });
    expect(out.statusCode).toBe(200);
    expect(out.cookies.find((item) => item.name === SESSION_COOKIE)?.value).toBe('');
    // The old cookie value replayed by an attacker.
    expect((await me(person.cookie)).statusCode).toBe(401);
  });

  it('logout leaves other devices signed in', async () => {
    const laptop = await h.signIn();
    const phone = await h.signIn(laptop.email);
    await h.request('POST', '/v1/auth/logout', { cookie: laptop.cookie });
    expect((await me(phone.cookie)).statusCode).toBe(200);
  });

  it('logout everywhere revokes every session of that person only', async () => {
    const laptop = await h.signIn();
    const phone = await h.signIn(laptop.email);
    const someoneElse = await h.signIn();

    const out = await h.request('POST', '/v1/auth/logout-everywhere', { cookie: laptop.cookie });
    expect(out.statusCode).toBe(200);
    expect((await me(laptop.cookie)).statusCode).toBe(401);
    expect((await me(phone.cookie)).statusCode).toBe(401);
    expect((await me(someoneElse.cookie)).statusCode).toBe(200);
  });

  it('logout needs a session', async () => {
    expect((await h.request('POST', '/v1/auth/logout')).statusCode).toBe(401);
    expect((await h.request('POST', '/v1/auth/logout-everywhere')).statusCode).toBe(401);
  });

  it('records logout and logout everywhere in the audit log', async () => {
    const person = await h.signIn();
    const other = await h.signIn(person.email);
    await h.request('POST', '/v1/auth/logout', { cookie: person.cookie });
    await h.request('POST', '/v1/auth/logout-everywhere', { cookie: other.cookie });
    const { rows } = await h.admin.query<{ action: string }>('SELECT action FROM audit_log WHERE actor_id = $1', [person.userId]);
    const actions = rows.map((row) => row.action);
    expect(actions).toContain('auth.signed_out');
    expect(actions).toContain('auth.signed_out_everywhere');
  });

  it('updates the profile and validates it', async () => {
    const person = await h.signIn();
    const ok = await h.request('PATCH', '/v1/me', { cookie: person.cookie, body: { name: 'Ada', locale: 'en-NG' } });
    expect(ok.statusCode).toBe(200);
    expect(ok.json<{ user: { name: string; locale: string } }>().user).toMatchObject({ name: 'Ada', locale: 'en-NG' });

    const empty = await h.request('PATCH', '/v1/me', { cookie: person.cookie, body: {} });
    expect(empty.statusCode).toBe(400);
    const bad = await h.request('PATCH', '/v1/me', { cookie: person.cookie, body: { locale: 'nonsense!' } });
    expect(bad.statusCode).toBe(400);
  });
});

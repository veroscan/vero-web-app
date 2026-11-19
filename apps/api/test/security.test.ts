import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { hashToken } from '../src/lib/crypto';
import { ALLOWED_ORIGIN, errorOf, randomIp, startHarness, uniqueEmail, type Harness } from './support/harness';

describe('origin check', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  const body = () => ({ email: uniqueEmail() });
  const url = '/v1/auth/magic-link/request';

  it('allows a state-changing request from the web app', async () => {
    expect((await h.request('POST', url, { body: body() })).statusCode).toBe(202);
  });

  it('refuses another origin, and does nothing', async () => {
    const email = uniqueEmail();
    const response = await h.request('POST', url, { body: { email }, origin: 'https://evil.example' });
    expect(response.statusCode).toBe(403);
    expect(errorOf(response).code).toBe('origin_not_allowed');
    const { rows } = await h.admin.query('SELECT 1 FROM magic_link WHERE email = $1', [email]);
    expect(rows).toHaveLength(0);
  });

  it('refuses lookalike origins', async () => {
    for (const origin of [`${ALLOWED_ORIGIN}.evil.example`, 'http://app.vero.test', `${ALLOWED_ORIGIN}:8443`, 'null']) {
      const response = await h.request('POST', url, { body: body(), origin });
      expect(response.statusCode, origin).toBe(403);
    }
  });

  it('refuses a request with neither Origin nor Referer', async () => {
    expect((await h.request('POST', url, { body: body(), origin: null })).statusCode).toBe(403);
  });

  it('falls back to the Referer when Origin is missing', async () => {
    const good = await h.request('POST', url, { body: body(), origin: null, headers: { referer: `${ALLOWED_ORIGIN}/sign-in` } });
    expect(good.statusCode).toBe(202);
    const bad = await h.request('POST', url, { body: body(), origin: null, headers: { referer: 'https://evil.example/x' } });
    expect(bad.statusCode).toBe(403);
    const junk = await h.request('POST', url, { body: body(), origin: null, headers: { referer: 'not a url' } });
    expect(junk.statusCode).toBe(403);
  });

  it('blocks a signed-in cross-site PATCH and DELETE, even with a valid cookie', async () => {
    const person = await h.signIn();
    const patch = await h.request('PATCH', '/v1/me', { cookie: person.cookie, body: { name: 'Hacked' }, origin: 'https://evil.example' });
    expect(patch.statusCode).toBe(403);
    const del = await h.request('DELETE', `/v1/members/${person.userId}`, { cookie: person.cookie, origin: 'https://evil.example' });
    expect(del.statusCode).toBe(403);
  });

  it('does not apply to reads', async () => {
    const person = await h.signIn();
    expect((await h.request('GET', '/v1/me', { cookie: person.cookie, origin: null })).statusCode).toBe(200);
  });

  it('answers CORS preflight for the web app only', async () => {
    const good = await h.app.inject({
      method: 'OPTIONS',
      url,
      headers: { origin: ALLOWED_ORIGIN, 'access-control-request-method': 'POST' },
    });
    expect(good.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(good.headers['access-control-allow-credentials']).toBe('true');
    const bad = await h.app.inject({
      method: 'OPTIONS',
      url,
      headers: { origin: 'https://evil.example', 'access-control-request-method': 'POST' },
    });
    expect(bad.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('sign-in rate limits', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness({
      RATE_LIMIT_MAGIC_LINK_PER_EMAIL_PER_HOUR: '3',
      RATE_LIMIT_MAGIC_LINK_PER_IP_PER_HOUR: '5',
      RATE_LIMIT_VERIFY_PER_IP_PER_15_MIN: '4',
    });
  });
  afterAll(() => h.close());

  const ask = (email: string, ip: string) => h.request('POST', '/v1/auth/magic-link/request', { body: { email }, ip });

  it('limits by email, across different IP addresses', async () => {
    const email = uniqueEmail();
    for (let i = 0; i < 3; i += 1) expect((await ask(email, randomIp())).statusCode).toBe(202);

    const blocked = await ask(email, randomIp());
    expect(blocked.statusCode).toBe(429);
    expect(errorOf(blocked).code).toBe('rate_limited');
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('counts different spellings of an email as the same address', async () => {
    const email = uniqueEmail();
    for (const spelling of [email, email.toUpperCase(), ` ${email} `]) {
      expect((await ask(spelling, randomIp())).statusCode).toBe(202);
    }
    expect((await ask(email, randomIp())).statusCode).toBe(429);
  });

  it('limits by IP address, across different emails', async () => {
    const ip = randomIp();
    for (let i = 0; i < 5; i += 1) expect((await ask(uniqueEmail(), ip)).statusCode).toBe(202);
    expect((await ask(uniqueEmail(), ip)).statusCode).toBe(429);
    // Someone else is not affected.
    expect((await ask(uniqueEmail(), randomIp())).statusCode).toBe(202);
  });

  it('sends no email once limited', async () => {
    const email = uniqueEmail();
    for (let i = 0; i < 5; i += 1) await ask(email, randomIp());
    const { rows } = await h.admin.query('SELECT 1 FROM outbox WHERE to_email = $1', [email]);
    expect(rows).toHaveLength(3);
  });

  it('limits guessing at the verify step', async () => {
    const ip = randomIp();
    const guess = () => h.request('POST', '/v1/auth/magic-link/verify', { body: { token: 'g'.repeat(43) }, ip });
    for (let i = 0; i < 4; i += 1) expect((await guess()).statusCode).toBe(400);
    expect((await guess()).statusCode).toBe(429);
  });

  it('cannot be dodged by sending a spoofed X-Forwarded-For', async () => {
    const ip = randomIp();
    const spoofed = () =>
      h.request('POST', '/v1/auth/magic-link/request', {
        body: { email: uniqueEmail() },
        ip,
        headers: { 'x-forwarded-for': randomIp() },
      });
    for (let i = 0; i < 5; i += 1) expect((await spoofed()).statusCode).toBe(202);
    expect((await spoofed()).statusCode).toBe(429);
  });

  it('stores hashes, not emails or IP addresses, in the limiter', async () => {
    const email = uniqueEmail();
    const ip = randomIp();
    await ask(email, ip);
    const { rows } = await h.admin.query<{ key: string }>('SELECT key FROM rate_limit_bucket');
    const keys = rows.map((row) => row.key).join();
    expect(keys).not.toContain(email);
    expect(keys).not.toContain(ip);
  });

  it('starts counting again in the next window', async () => {
    const email = uniqueEmail();
    for (let i = 0; i < 4; i += 1) await ask(email, randomIp());
    expect((await ask(email, randomIp())).statusCode).toBe(429);
    h.setNow(new Date(Date.now() + 2 * 60 * 60 * 1000));
    expect((await ask(email, randomIp())).statusCode).toBe(202);
    h.setNow(null);
  });
});

describe('global rate limit', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness({ RATE_LIMIT_GLOBAL_PER_MINUTE: '3' });
  });
  afterAll(() => h.close());

  it('applies to every route and uses the standard error format', async () => {
    const ip = randomIp();
    for (let i = 0; i < 3; i += 1) expect((await h.request('GET', '/v1/me', { ip })).statusCode).toBe(401);
    const blocked = await h.request('GET', '/v1/me', { ip });
    expect(blocked.statusCode).toBe(429);
    expect(errorOf(blocked).code).toBe('rate_limited');
    expect(errorOf(blocked).message).toMatch(/too many/i);
  });
});

describe('logging', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness({ LOG_LEVEL: 'trace' });
  });
  afterAll(() => h.close());

  it('never logs tokens, cookies, emails or request bodies', async () => {
    const email = uniqueEmail('logged');
    const token = await h.requestLink(email);
    const verified = await h.request('POST', '/v1/auth/magic-link/verify', { body: { token } });
    const cookieValue = verified.cookies.find((cookie) => cookie.name === 'vero_session')?.value as string;
    const cookie = `vero_session=${cookieValue}`;

    const company = await h.request('POST', '/v1/companies', {
      cookie,
      body: { legalName: 'Very Secret Company Name Ltd', incorporationCountry: 'GB' },
    });
    expect(company.statusCode).toBe(201);
    // Secrets offered in a query string and bad input must not reach the log either.
    await h.request('GET', '/v1/me?token=query-string-secret-value', { cookie });
    await h.request('POST', '/v1/auth/magic-link/verify', { body: { token: 'rejected-token-value-aaaaaaaaaaaaa' } });
    await h.request('GET', '/v1/me', { headers: { authorization: 'Bearer header-secret-value' } });
    await h.request('POST', '/v1/invitations', { cookie, body: { email: uniqueEmail('invitee') } });

    const log = h.logs.join('');
    expect(h.logs.length).toBeGreaterThan(0);
    expect(log).toContain('/v1/companies');
    for (const secret of [
      token,
      hashToken(token),
      cookieValue,
      hashToken(cookieValue),
      email,
      'Very Secret Company Name',
      'query-string-secret-value',
      'rejected-token-value',
      'header-secret-value',
      'invitee-',
    ]) {
      expect(log, `log contains ${secret}`).not.toContain(secret);
    }
  });

  it('logs the route pattern, not the real URL', async () => {
    const person = await h.signIn();
    const id = '11111111-1111-4111-8111-111111111111';
    await h.request('GET', `/v1/companies/${id}`, { cookie: person.cookie });
    const log = h.logs.join('');
    expect(log).toContain('/v1/companies/:companyId');
    expect(log).not.toContain(id);
  });

  it('a database failure returns a plain 500 and logs no query values', async () => {
    const original = h.deps.db.withUser.bind(h.deps.db);
    const person = await h.signIn();
    const secretValue = 'sensitive-query-parameter';
    h.deps.db.withUser = () =>
      Promise.reject(Object.assign(new Error(`Failed query: select ... params: ${secretValue}`), { code: '23000' }));
    try {
      const response = await h.request('GET', '/v1/me', { cookie: person.cookie });
      expect(response.statusCode).toBe(500);
      expect(errorOf(response).code).toBe('internal_error');
      expect(response.body).not.toContain(secretValue);
      expect(h.logs.join('')).not.toContain(secretValue);
      expect(h.logs.join('')).toContain('23000');
    } finally {
      h.deps.db.withUser = original;
    }
  });
});

describe('error format and headers', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('unknown routes use the standard format', async () => {
    const response = await h.request('GET', '/v1/does-not-exist');
    expect(response.statusCode).toBe(404);
    expect(errorOf(response).code).toBe('not_found');
  });

  it('broken JSON is a 400, not a 500', async () => {
    const response = await h.app.inject({
      method: 'POST',
      url: '/v1/auth/magic-link/request',
      headers: { origin: ALLOWED_ORIGIN, 'content-type': 'application/json' },
      payload: '{ not json',
    });
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('invalid_json');
  });

  it('a body that is too large is refused', async () => {
    const response = await h.request('POST', '/v1/auth/magic-link/request', { body: { email: 'a'.repeat(2 * 1024 * 1024) } });
    expect(response.statusCode).toBe(413);
    expect(errorOf(response).code).toBe('payload_too_large');
  });

  it('an unsupported content type is refused', async () => {
    const response = await h.app.inject({
      method: 'POST',
      url: '/v1/auth/magic-link/request',
      headers: { origin: ALLOWED_ORIGIN, 'content-type': 'application/xml' },
      payload: '<a/>',
    });
    expect(response.statusCode).toBe(415);
    expect(errorOf(response).code).toBe('unsupported_media_type');
  });

  it('responses are not cacheable and carry security headers', async () => {
    const response = await h.request('GET', '/v1/me');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('health check works without a session', async () => {
    const response = await h.request('GET', '/healthz');
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });

  it('there are no social sign-in routes', async () => {
    for (const url of ['/v1/auth/google/start', '/v1/auth/google/callback', '/v1/auth/config']) {
      expect((await h.request('GET', url)).statusCode, url).toBe(404);
    }
  });
});

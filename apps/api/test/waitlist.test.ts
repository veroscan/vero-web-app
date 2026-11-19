import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeStaff } from './support/product';
import { startHarness, type Harness } from './support/harness';

const WEBSITE = 'https://vero-site.example';

describe('website waitlist', () => {
  let h: Harness;
  const join = (body: unknown, options: { ip?: string; origin?: string | null } = {}) =>
    h.request('POST', '/v1/public/waitlist', { body, origin: options.origin === undefined ? WEBSITE : options.origin, ...(options.ip ? { ip: options.ip } : {}) });
  const rows = async (email: string) =>
    (await h.admin.query<{ name: string; company: string | null; details: Record<string, string>; submissions: number }>(`SELECT name, company, details, submissions FROM waitlist_entry WHERE email = $1`, [email])).rows;

  beforeAll(async () => {
    h = await startHarness({ WEBSITE_ORIGINS: WEBSITE, RATE_LIMIT_PUBLIC_PER_IP_PER_MINUTE: '4' });
  });
  afterAll(() => h.close());

  it('stores what the website form sends, from the website, with no sign-in', async () => {
    const response = await join({ name: 'Ada Example', email: 'Ada@Example.com', company: 'Example Ltd', message: 'Checking a supplier', need: 'Investor', budget: 'Growth', website: '', recaptchaToken: 'x' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
    expect(await rows('ada@example.com')).toEqual([{ name: 'Ada Example', company: 'Example Ltd', details: { need: 'Investor', budget: 'Growth' }, submissions: 1 }]);
  });

  it('gives a repeat address the same answer and counts it, without telling anyone it was there', async () => {
    const response = await join({ name: 'Ada E.', email: 'ada@example.com' }, { ip: '10.0.0.2' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
    const [row] = await rows('ada@example.com');
    expect(row?.submissions).toBe(2);
    expect(row?.name).toBe('Ada E.');
    expect(row?.company).toBe('Example Ltd');
  });

  it('stores nothing when the hidden bot field is filled, and still says ok', async () => {
    const response = await join({ name: 'Bot', email: 'bot@example.com', website: 'http://spam.example' }, { ip: '10.0.0.3' });
    expect(response.statusCode).toBe(200);
    expect(await rows('bot@example.com')).toEqual([]);
  });

  it('answers a bad form with a plain message', async () => {
    const response = await join({ name: 'A', email: 'not-an-email' }, { ip: '10.0.0.4' });
    expect(response.statusCode).toBe(400);
    expect(response.json<{ error: { message: string } }>().error.message).toMatch(/\w/);
  });

  it('lets the website origin through CORS for this path only, without credentials', async () => {
    const preflight = await h.request('OPTIONS' as 'POST', '/v1/public/waitlist', { origin: WEBSITE, headers: { 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' } });
    expect(preflight.headers['access-control-allow-origin']).toBe(WEBSITE);
    expect(preflight.headers['access-control-allow-credentials']).toBeUndefined();
    const other = await h.request('GET', '/v1/me', { origin: WEBSITE });
    expect(other.headers['access-control-allow-origin']).toBeUndefined();
    const stranger = await h.request('OPTIONS' as 'POST', '/v1/public/waitlist', { origin: 'https://evil.example', headers: { 'access-control-request-method': 'POST' } });
    expect(stranger.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('is rate limited per address', async () => {
    const codes: number[] = [];
    for (let i = 0; i < 6; i += 1) codes.push((await join({ name: 'Rate Test', email: `rate${i}@example.com` }, { ip: '10.0.0.9' })).statusCode);
    expect(codes).toContain(429);
  });

  it('shows the list to Vero admins only', async () => {
    const admin = await makeStaff(h, 'admin');
    const lawyer = await makeStaff(h, 'lawyer');
    const someone = await h.signIn();
    const list = await h.request('GET', '/v1/admin/waitlist?limit=50', { cookie: admin.cookie });
    expect(list.statusCode).toBe(200);
    const body = list.json<{ total: number; entries: { email: string; need: string | null }[] }>();
    expect(body.entries.find((entry) => entry.email === 'ada@example.com')?.need).toBe('Investor');
    expect(body.total).toBeGreaterThanOrEqual(1);
    expect((await h.request('GET', '/v1/admin/waitlist', { cookie: lawyer.cookie })).statusCode).toBe(403);
    expect((await h.request('GET', '/v1/admin/waitlist', { cookie: someone.cookie })).statusCode).toBe(403);
  });
});

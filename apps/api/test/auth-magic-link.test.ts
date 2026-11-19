import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { hashToken } from '../src/lib/crypto';
import { errorOf, sessionCookieFrom, startHarness, uniqueEmail, type Harness } from './support/harness';

describe('magic link', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  const verify = (token: string) => h.request('POST', '/v1/auth/magic-link/verify', { body: { token } });

  it('signs a new person in, and creates their organisation with them as owner', async () => {
    const email = uniqueEmail();
    const token = await h.requestLink(email);
    const response = await verify(token);

    expect(response.statusCode).toBe(200);
    const body = response.json<{
      user: { email: string };
      isNewUser: boolean;
      mfaRequired: boolean;
      activeOrganisationId: string;
    }>();
    expect(body.user.email).toBe(email);
    expect(body.isNewUser).toBe(true);
    expect(body.mfaRequired).toBe(false);

    const me = await h.request('GET', '/v1/me', { cookie: sessionCookieFrom(response) });
    expect(me.statusCode).toBe(200);
    expect(me.json<{ organisations: { id: string; role: string }[] }>().organisations).toEqual([
      expect.objectContaining({ id: body.activeOrganisationId, role: 'owner' }),
    ]);
  });

  it('does not create a second organisation on a later sign-in', async () => {
    const first = await h.signIn();
    const second = await h.signIn(first.email);
    expect(second.organisationId).toBe(first.organisationId);
    expect(second.userId).toBe(first.userId);
  });

  it('stores only a hash of the token, never the token itself', async () => {
    const email = uniqueEmail();
    const token = await h.requestLink(email);
    const { rows } = await h.admin.query<{ token_hash: string }>('SELECT token_hash FROM magic_link WHERE email = $1', [email]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.token_hash).toBe(hashToken(token));
    expect(rows[0]?.token_hash).not.toContain(token);
  });

  it('expires 15 minutes after it was created', async () => {
    const email = uniqueEmail();
    await h.requestLink(email);
    const { rows } = await h.admin.query<{ minutes: string }>(
      `SELECT EXTRACT(EPOCH FROM (expires_at - created_at)) / 60 AS minutes FROM magic_link WHERE email = $1`,
      [email],
    );
    expect(Number(rows[0]?.minutes)).toBeCloseTo(15, 0);
  });

  it('works only once: reuse is refused', async () => {
    const token = await h.requestLink(uniqueEmail());
    expect((await verify(token)).statusCode).toBe(200);

    const reused = await verify(token);
    expect(reused.statusCode).toBe(400);
    expect(errorOf(reused).code).toBe('magic_link_invalid');
    expect(reused.cookies).toHaveLength(0);
  });

  it('gives exactly one session when the same link is used at the same moment', async () => {
    const token = await h.requestLink(uniqueEmail());
    const results = await Promise.all([verify(token), verify(token), verify(token), verify(token)]);
    const codes = results.map((response) => response.statusCode).sort();
    expect(codes).toEqual([200, 400, 400, 400]);
  });

  it('is refused after expiry', async () => {
    const email = uniqueEmail();
    const token = await h.requestLink(email);
    await h.admin.query(`UPDATE magic_link SET expires_at = now() - interval '1 second' WHERE email = $1`, [email]);

    const response = await verify(token);
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('magic_link_invalid');
    const { rows } = await h.admin.query('SELECT 1 FROM "user" WHERE email = $1', [email]);
    expect(rows).toHaveLength(0);
  });

  it('is cancelled when a newer link is requested', async () => {
    const email = uniqueEmail();
    const older = await h.requestLink(email);
    const newer = await h.requestLink(email);
    expect(older).not.toBe(newer);
    expect((await verify(older)).statusCode).toBe(400);
    expect((await verify(newer)).statusCode).toBe(200);
  });

  it('refuses a token that never existed', async () => {
    const response = await verify('x'.repeat(43));
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('magic_link_invalid');
  });

  it('answers the same whether or not the person has an account', async () => {
    const existing = await h.signIn();
    const known = await h.request('POST', '/v1/auth/magic-link/request', { body: { email: existing.email } });
    const unknown = await h.request('POST', '/v1/auth/magic-link/request', { body: { email: uniqueEmail() } });
    expect(known.statusCode).toBe(202);
    expect(unknown.statusCode).toBe(202);
    expect(known.body).toBe(unknown.body);
  });

  it('treats email case and surrounding spaces as the same person', async () => {
    const email = uniqueEmail();
    const first = await h.signIn(email);
    await h.request('POST', '/v1/auth/magic-link/request', { body: { email: `  ${email.toUpperCase()}  ` } });
    const response = await verify(await h.latestToken(email));
    expect(response.json<{ user: { id: string } }>().user.id).toBe(first.userId);
  });

  it.each([
    ['not an email', { email: 'nope' }],
    ['missing email', {}],
    ['wrong type', { email: 42 }],
    ['too long', { email: `${'a'.repeat(250)}@example.test` }],
  ])('rejects invalid input: %s', async (_label, body) => {
    const response = await h.request('POST', '/v1/auth/magic-link/request', { body });
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('invalid_input');
  });

  it.each([
    ['too short', { token: 'short' }],
    ['missing', {}],
    ['wrong type', { token: 123 }],
  ])('rejects an invalid verify body: %s', async (_label, body) => {
    const response = await h.request('POST', '/v1/auth/magic-link/verify', { body });
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('invalid_input');
  });

  it('writes the sign-in events to the audit log without the email or token', async () => {
    const email = uniqueEmail();
    const token = await h.requestLink(email);
    const response = await verify(token);
    const userId = response.json<{ user: { id: string } }>().user.id;
    await verify(token);

    const { rows } = await h.admin.query<{ action: string }>('SELECT action FROM audit_log WHERE actor_id = $1', [userId]);
    expect(rows.map((row) => row.action)).toContain('auth.signed_up');

    const { rows: all } = await h.admin.query<{ text: string }>('SELECT audit_log::text AS text FROM audit_log');
    const everything = all.map((row) => row.text).join('\n');
    expect(everything).not.toContain(email);
    expect(everything).not.toContain(token);
  });
});

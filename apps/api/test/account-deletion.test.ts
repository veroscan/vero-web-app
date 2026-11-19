import { Secret, TOTP } from 'otpauth';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addMember, errorOf, startHarness, type Harness } from './support/harness';

describe('account deletion', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  const remove = (cookie: string, body: unknown) => h.request('POST', '/v1/me/delete', { cookie, body });

  it('removes access at once, on every device', async () => {
    const laptop = await h.signIn();
    const phone = await h.signIn(laptop.email);
    const response = await remove(laptop.cookie, { confirmEmail: laptop.email });
    expect(response.statusCode).toBe(200);
    expect((await h.request('GET', '/v1/me', { cookie: laptop.cookie })).statusCode).toBe(401);
    expect((await h.request('GET', '/v1/me', { cookie: phone.cookie })).statusCode).toBe(401);
  });

  it('deletes the person and their sessions, links and mail from the database', async () => {
    const person = await h.signIn();
    await remove(person.cookie, { confirmEmail: person.email });
    for (const [sql, value] of [
      ['SELECT 1 FROM "user" WHERE id = $1', person.userId],
      ['SELECT 1 FROM session WHERE user_id = $1', person.userId],
      ['SELECT 1 FROM magic_link WHERE email = $1', person.email],
      ['SELECT 1 FROM outbox WHERE to_email = $1', person.email],
    ] as const) {
      const { rows } = await h.admin.query(sql, [value]);
      expect(rows, sql).toHaveLength(0);
    }
  });

  it('a link requested before deletion cannot bring the account back', async () => {
    const person = await h.signIn();
    const token = await h.requestLink(person.email);
    await remove(person.cookie, { confirmEmail: person.email });
    const response = await h.request('POST', '/v1/auth/magic-link/verify', { body: { token } });
    expect(response.statusCode).toBe(400);
  });

  it('deletes an organisation where the person was alone, with its companies and files', async () => {
    const person = await h.signIn();
    const created = await h.request('POST', '/v1/companies', {
      cookie: person.cookie,
      body: { legalName: 'Solo Ltd', incorporationCountry: 'GB' },
    });
    const companyId = created.json<{ id: string }>().id;
    const key = `${person.organisationId}/doc.pdf`;
    await h.deps.files.put(key, Buffer.from('private document'));
    await h.admin.query(
      `INSERT INTO document (organisation_id, company_id, storage_key, source) VALUES ($1, $2, $3, 'upload')`,
      [person.organisationId, companyId, key],
    );

    expect((await remove(person.cookie, { confirmEmail: person.email })).statusCode).toBe(200);

    for (const table of ['organisation', 'company', 'document', 'membership']) {
      const column = table === 'organisation' ? 'id' : 'organisation_id';
      const { rows } = await h.admin.query(`SELECT 1 FROM ${table} WHERE ${column} = $1`, [person.organisationId]);
      expect(rows, table).toHaveLength(0);
    }
    expect(await h.deps.files.get(key)).toBeNull();
  });

  it('keeps the audit trail, with an id that no longer points at anyone', async () => {
    const person = await h.signIn();
    await remove(person.cookie, { confirmEmail: person.email });
    const { rows } = await h.admin.query<{ action: string; text: string }>(
      'SELECT action, audit_log::text AS text FROM audit_log WHERE actor_id = $1',
      [person.userId],
    );
    expect(rows.map((row) => row.action)).toContain('account.deleted');
    expect(rows.map((row) => row.text).join()).not.toContain(person.email);
  });

  it('a sole owner with teammates must hand over first, and nothing is deleted', async () => {
    const owner = await h.signIn();
    const teammate = await addMember(h, owner, 'member');
    const response = await remove(owner.cookie, { confirmEmail: owner.email });
    expect(response.statusCode).toBe(409);
    expect(errorOf(response).code).toBe('ownership_transfer_required');
    expect((await h.request('GET', '/v1/me', { cookie: owner.cookie })).statusCode).toBe(200);
    expect((await h.request('GET', '/v1/members', { cookie: teammate.cookie })).json<{ members: unknown[] }>().members).toHaveLength(2);
  });

  it('leaves the team intact when a member deletes their account', async () => {
    const owner = await h.signIn();
    const teammate = await addMember(h, owner, 'member');
    expect((await remove(teammate.cookie, { confirmEmail: teammate.email })).statusCode).toBe(200);
    const members = await h.request('GET', '/v1/members', { cookie: owner.cookie });
    expect(members.json<{ members: { userId: string }[] }>().members.map((m) => m.userId)).toEqual([owner.userId]);
  });

  it('a person who signs up again afterwards starts completely fresh', async () => {
    const person = await h.signIn();
    await remove(person.cookie, { confirmEmail: person.email });
    const again = await h.signIn(person.email);
    expect(again.userId).not.toBe(person.userId);
    expect(again.organisationId).not.toBe(person.organisationId);
  });

  it('refuses when the typed email does not match', async () => {
    const person = await h.signIn();
    const response = await remove(person.cookie, { confirmEmail: 'someone-else@example.test' });
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('confirmation_mismatch');
    expect((await h.request('GET', '/v1/me', { cookie: person.cookie })).statusCode).toBe(200);
  });

  it('refuses invalid input and a missing session', async () => {
    const person = await h.signIn();
    expect((await remove(person.cookie, {})).statusCode).toBe(400);
    expect((await h.request('POST', '/v1/me/delete', { body: { confirmEmail: person.email } })).statusCode).toBe(401);
  });

  it('needs a valid code when two-step sign-in is on', async () => {
    const person = await h.signIn();
    const enrol = await h.request('POST', '/v1/auth/mfa/totp/enrol', { cookie: person.cookie });
    const secret = enrol.json<{ secret: string }>().secret;
    const totp = new TOTP({ secret: Secret.fromBase32(secret), digits: 6, period: 30, algorithm: 'SHA1' });
    // A frozen clock, so the two codes always fall in different time steps.
    const now = new Date();
    h.setNow(now);
    try {
      await h.request('POST', '/v1/auth/mfa/totp/verify', {
        cookie: person.cookie,
        body: { code: totp.generate({ timestamp: now.getTime() - 30_000 }) },
      });

      expect((await remove(person.cookie, { confirmEmail: person.email })).statusCode).toBe(400);
      expect((await remove(person.cookie, { confirmEmail: person.email, totpCode: '000000' })).statusCode).toBe(400);
      expect((await h.request('GET', '/v1/me', { cookie: person.cookie })).statusCode).toBe(200);

      const ok = await remove(person.cookie, {
        confirmEmail: person.email,
        totpCode: totp.generate({ timestamp: now.getTime() }),
      });
      expect(ok.statusCode).toBe(200);
    } finally {
      h.setNow(null);
    }
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { hashToken } from '../src/lib/crypto';
import { addMember, errorOf, invite, startHarness, uniqueEmail, type Harness, type SignedIn } from './support/harness';

describe('organisations', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  const roleOf = async (viewer: SignedIn, userId: string): Promise<string | undefined> => {
    const response = await h.request('GET', '/v1/members', { cookie: viewer.cookie });
    return response.json<{ members: { userId: string; role: string }[] }>().members.find((m) => m.userId === userId)?.role;
  };

  describe('the organisation itself', () => {
    it('is created automatically at first sign-up, once', async () => {
      const person = await h.signIn();
      const list = await h.request('GET', '/v1/organisations', { cookie: person.cookie });
      expect(list.json<{ organisations: { id: string; role: string; isDemo: boolean }[] }>().organisations).toEqual([
        expect.objectContaining({ id: person.organisationId, role: 'owner', isDemo: false }),
      ]);
    });

    it('can be read and renamed, with the rename audited', async () => {
      const person = await h.signIn();
      const renamed = await h.request('PATCH', '/v1/organisations/current', { cookie: person.cookie, body: { name: 'Kite Ltd' } });
      expect(renamed.statusCode).toBe(200);
      const current = await h.request('GET', '/v1/organisations/current', { cookie: person.cookie });
      expect(current.json<{ name: string; role: string }>()).toMatchObject({ name: 'Kite Ltd', role: 'owner' });
      const { rows } = await h.admin.query(`SELECT 1 FROM audit_log WHERE organisation_id = $1 AND action = 'organisation.updated'`, [person.organisationId]);
      expect(rows).toHaveLength(1);
    });

    it.each([['blank', { name: '   ' }], ['missing', {}], ['too long', { name: 'x'.repeat(201) }]])(
      'rejects a bad name: %s',
      async (_label, body) => {
        const person = await h.signIn();
        const response = await h.request('PATCH', '/v1/organisations/current', { cookie: person.cookie, body });
        expect(response.statusCode).toBe(400);
        expect(errorOf(response).code).toBe('invalid_input');
      },
    );

    it('needs a session', async () => {
      expect((await h.request('GET', '/v1/organisations')).statusCode).toBe(401);
      expect((await h.request('GET', '/v1/members')).statusCode).toBe(401);
    });
  });

  describe('invitations', () => {
    it('a new person invited by email joins that team, with no organisation of their own', async () => {
      const owner = await h.signIn();
      const email = uniqueEmail('new');
      const token = await invite(h, owner, email, 'lawyer');
      const joined = await h.signIn(email, token);

      expect(joined.organisationId).toBe(owner.organisationId);
      const list = await h.request('GET', '/v1/organisations', { cookie: joined.cookie });
      expect(list.json<{ organisations: { id: string; role: string }[] }>().organisations).toEqual([
        expect.objectContaining({ id: owner.organisationId, role: 'lawyer' }),
      ]);
    });

    it('an existing person can accept and is moved into that team', async () => {
      const owner = await h.signIn();
      const existing = await h.signIn();
      const token = await invite(h, owner, existing.email);
      const accepted = await h.request('POST', '/v1/invitations/accept', { cookie: existing.cookie, body: { token } });
      expect(accepted.statusCode).toBe(200);
      expect(accepted.json<{ organisationId: string; role: string }>()).toEqual({ organisationId: owner.organisationId, role: 'member' });
      expect((await h.request('GET', '/v1/me', { cookie: existing.cookie })).json<{ activeOrganisationId: string }>().activeOrganisationId).toBe(owner.organisationId);
    });

    it('stores only a hash of the token, and never returns it from the API', async () => {
      const owner = await h.signIn();
      const email = uniqueEmail();
      const created = await h.request('POST', '/v1/invitations', { cookie: owner.cookie, body: { email } });
      const token = await h.latestToken(email);
      expect(created.body).not.toContain(token);
      expect(created.body).not.toContain('token');
      const { rows } = await h.admin.query<{ text: string }>('SELECT invitation::text AS text FROM invitation WHERE email = $1', [email]);
      expect(rows[0]?.text).not.toContain(token.split('.')[1]);
      const list = await h.request('GET', '/v1/invitations', { cookie: owner.cookie });
      expect(list.body).not.toContain('token');
    });

    it('works once only', async () => {
      const owner = await h.signIn();
      const person = await h.signIn();
      const token = await invite(h, owner, person.email);
      expect((await h.request('POST', '/v1/invitations/accept', { cookie: person.cookie, body: { token } })).statusCode).toBe(200);
      const again = await h.request('POST', '/v1/invitations/accept', { cookie: person.cookie, body: { token } });
      expect(again.statusCode).toBe(400);
      expect(errorOf(again).code).toBe('invitation_invalid');
    });

    it('cannot be used by a different email address', async () => {
      const owner = await h.signIn();
      const token = await invite(h, owner, uniqueEmail('intended'));
      const stranger = await h.signIn();
      const response = await h.request('POST', '/v1/invitations/accept', { cookie: stranger.cookie, body: { token } });
      expect(response.statusCode).toBe(403);
      expect(errorOf(response).code).toBe('invitation_wrong_email');
      expect(await roleOf(owner, stranger.userId)).toBeUndefined();
    });

    it('an invitation token for the wrong email does not join through sign-in either', async () => {
      const owner = await h.signIn();
      const token = await invite(h, owner, uniqueEmail('intended'));
      const stranger = await h.signIn(uniqueEmail('stranger'), token);
      expect(stranger.organisationId).not.toBe(owner.organisationId);
      expect(await roleOf(owner, stranger.userId)).toBeUndefined();
    });

    it('expires', async () => {
      const owner = await h.signIn();
      const person = await h.signIn();
      const token = await invite(h, owner, person.email);
      await h.admin.query(`UPDATE invitation SET expires_at = now() - interval '1 second' WHERE email = $1`, [person.email]);
      const response = await h.request('POST', '/v1/invitations/accept', { cookie: person.cookie, body: { token } });
      expect(response.statusCode).toBe(400);
      expect(errorOf(response).code).toBe('invitation_invalid');
    });

    it('an expired invitation can be replaced', async () => {
      const owner = await h.signIn();
      const email = uniqueEmail();
      await invite(h, owner, email);
      await h.admin.query(`UPDATE invitation SET expires_at = now() - interval '1 second' WHERE email = $1`, [email]);
      const again = await h.request('POST', '/v1/invitations', { cookie: owner.cookie, body: { email } });
      expect(again.statusCode).toBe(201);
    });

    it('can be revoked, after which it stops working', async () => {
      const owner = await h.signIn();
      const person = await h.signIn();
      const token = await invite(h, owner, person.email);
      const list = await h.request('GET', '/v1/invitations', { cookie: owner.cookie });
      const id = list.json<{ invitations: { id: string }[] }>().invitations[0]?.id;
      expect((await h.request('DELETE', `/v1/invitations/${id}`, { cookie: owner.cookie })).statusCode).toBe(200);
      expect((await h.request('DELETE', `/v1/invitations/${id}`, { cookie: owner.cookie })).statusCode).toBe(404);
      expect((await h.request('POST', '/v1/invitations/accept', { cookie: person.cookie, body: { token } })).statusCode).toBe(400);
      expect((await h.request('GET', '/v1/invitations', { cookie: owner.cookie })).json<{ invitations: unknown[] }>().invitations).toEqual([]);
    });

    it('refuses a second open invitation, and inviting someone already on the team', async () => {
      const owner = await h.signIn();
      const email = uniqueEmail();
      await invite(h, owner, email);
      const twice = await h.request('POST', '/v1/invitations', { cookie: owner.cookie, body: { email } });
      expect(twice.statusCode).toBe(409);
      expect(errorOf(twice).code).toBe('invitation_exists');
      const self = await h.request('POST', '/v1/invitations', { cookie: owner.cookie, body: { email: owner.email } });
      expect(self.statusCode).toBe(409);
      expect(errorOf(self).code).toBe('already_member');
    });

    it('a person already on the team cannot burn an invitation', async () => {
      const owner = await h.signIn();
      const member = await addMember(h, owner, 'member');
      const token = `${owner.organisationId}.${'s'.repeat(30)}`;
      await h.admin.query(
        `INSERT INTO invitation (organisation_id, email, role, token_hash, expires_at) VALUES ($1, $2, 'admin', $3, now() + interval '1 day')`,
        [owner.organisationId, member.email, hashToken(token)],
      );
      const response = await h.request('POST', '/v1/invitations/accept', { cookie: member.cookie, body: { token } });
      expect(response.statusCode).toBe(409);
      expect(errorOf(response).code).toBe('already_member');
      expect(await roleOf(owner, member.userId)).toBe('member');
      // By hash: this person also has the earlier invitation they joined through.
      const { rows } = await h.admin.query<{ accepted_at: Date | null }>('SELECT accepted_at FROM invitation WHERE token_hash = $1', [hashToken(token)]);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.accepted_at).toBeNull();
    });

    it.each([['not an email', { email: 'nope' }], ['bad role', { email: 'a@example.test', role: 'superuser' }], ['empty', {}]])(
      'rejects invalid input: %s',
      async (_label, body) => {
        const owner = await h.signIn();
        const response = await h.request('POST', '/v1/invitations', { cookie: owner.cookie, body });
        expect(response.statusCode).toBe(400);
      },
    );

    it('rejects a malformed token', async () => {
      const person = await h.signIn();
      const response = await h.request('POST', '/v1/invitations/accept', { cookie: person.cookie, body: { token: 'x'.repeat(40) } });
      expect(response.statusCode).toBe(400);
      expect(errorOf(response).code).toBe('invitation_invalid');
    });

    it('limits invitations per organisation per day', async () => {
      const limited = await startHarness({ RATE_LIMIT_INVITATIONS_PER_ORG_PER_DAY: '2' });
      try {
        const owner = await limited.signIn();
        const send = () => limited.request('POST', '/v1/invitations', { cookie: owner.cookie, body: { email: uniqueEmail() } });
        expect((await send()).statusCode).toBe(201);
        expect((await send()).statusCode).toBe(201);
        expect((await send()).statusCode).toBe(429);
      } finally {
        await limited.close();
      }
    });
  });

  describe('role permissions', () => {
    let owner: SignedIn;
    let admin: SignedIn;
    let member: SignedIn;
    let lawyer: SignedIn;

    beforeAll(async () => {
      owner = await h.signIn();
      admin = await addMember(h, owner, 'admin');
      member = await addMember(h, owner, 'member');
      lawyer = await addMember(h, owner, 'lawyer');
    });

    const people = () => ({ owner, admin, member, lawyer });
    type RoleName = 'owner' | 'admin' | 'member' | 'lawyer';

    it.each<[string, 'GET' | 'POST' | 'PATCH', string, unknown, Record<RoleName, boolean>]>([
      ['read the organisation', 'GET', '/v1/organisations/current', undefined, { owner: true, admin: true, member: true, lawyer: true }],
      ['rename the organisation', 'PATCH', '/v1/organisations/current', { name: 'Renamed' }, { owner: true, admin: true, member: false, lawyer: false }],
      ['list members', 'GET', '/v1/members', undefined, { owner: true, admin: true, member: true, lawyer: true }],
      ['list invitations', 'GET', '/v1/invitations', undefined, { owner: true, admin: true, member: false, lawyer: false }],
      ['read companies', 'GET', '/v1/companies', undefined, { owner: true, admin: true, member: true, lawyer: true }],
      ['read the audit log', 'GET', '/v1/audit', undefined, { owner: true, admin: true, member: false, lawyer: false }],
      ['read notifications', 'GET', '/v1/notifications', undefined, { owner: true, admin: true, member: true, lawyer: true }],
    ])('%s', async (_label, method, url, body, allowed) => {
      for (const [role, person] of Object.entries(people()) as [RoleName, SignedIn][]) {
        const response = await h.request(method, url, { cookie: person.cookie, body });
        if (allowed[role]) {
          expect(response.statusCode, role).toBe(200);
        } else {
          expect(response.statusCode, role).toBe(403);
          expect(errorOf(response).code, role).toBe('forbidden');
        }
      }
    });

    it('creating an invitation: owner and admin only', async () => {
      for (const [role, person, status] of [
        ['owner', owner, 201],
        ['admin', admin, 201],
        ['member', member, 403],
        ['lawyer', lawyer, 403],
      ] as const) {
        const response = await h.request('POST', '/v1/invitations', { cookie: person.cookie, body: { email: uniqueEmail() } });
        expect(response.statusCode, role).toBe(status);
      }
    });

    it('creating a company: not lawyers', async () => {
      for (const [role, person, status] of [
        ['owner', owner, 201],
        ['admin', admin, 201],
        ['member', member, 201],
        ['lawyer', lawyer, 403],
      ] as const) {
        const response = await h.request('POST', '/v1/companies', {
          cookie: person.cookie,
          body: { legalName: `Co ${role}`, incorporationCountry: 'GB' },
        });
        expect(response.statusCode, role).toBe(status);
      }
    });

    it('only an owner can invite an owner', async () => {
      const byAdmin = await h.request('POST', '/v1/invitations', { cookie: admin.cookie, body: { email: uniqueEmail(), role: 'owner' } });
      expect(byAdmin.statusCode).toBe(403);
      const byOwner = await h.request('POST', '/v1/invitations', { cookie: owner.cookie, body: { email: uniqueEmail(), role: 'owner' } });
      expect(byOwner.statusCode).toBe(201);
    });

    it('members and lawyers cannot change roles', async () => {
      for (const person of [member, lawyer]) {
        const response = await h.request('PATCH', `/v1/members/${admin.userId}`, { cookie: person.cookie, body: { role: 'member' } });
        expect(response.statusCode).toBe(403);
      }
      expect(await roleOf(owner, admin.userId)).toBe('admin');
    });

    it('a member cannot promote themselves', async () => {
      const response = await h.request('PATCH', `/v1/members/${member.userId}`, { cookie: member.cookie, body: { role: 'owner' } });
      expect(response.statusCode).toBe(403);
      expect(await roleOf(owner, member.userId)).toBe('member');
    });

    it('an admin cannot touch an owner or make one', async () => {
      const demote = await h.request('PATCH', `/v1/members/${owner.userId}`, { cookie: admin.cookie, body: { role: 'member' } });
      expect(demote.statusCode).toBe(403);
      const remove = await h.request('DELETE', `/v1/members/${owner.userId}`, { cookie: admin.cookie });
      expect(remove.statusCode).toBe(403);
      const promote = await h.request('PATCH', `/v1/members/${admin.userId}`, { cookie: admin.cookie, body: { role: 'owner' } });
      expect(promote.statusCode).toBe(403);
      expect(await roleOf(owner, owner.userId)).toBe('owner');
    });

    it('a role change applies immediately, without a new sign-in', async () => {
      const person = await addMember(h, owner, 'member');
      expect((await h.request('GET', '/v1/audit', { cookie: person.cookie })).statusCode).toBe(403);
      const changed = await h.request('PATCH', `/v1/members/${person.userId}`, { cookie: owner.cookie, body: { role: 'admin' } });
      expect(changed.statusCode).toBe(200);
      expect(changed.json<{ role: string }>().role).toBe('admin');
      expect((await h.request('GET', '/v1/audit', { cookie: person.cookie })).statusCode).toBe(200);
    });

    it('a role change is audited and tells the person', async () => {
      const person = await addMember(h, owner, 'member');
      await h.request('PATCH', `/v1/members/${person.userId}`, { cookie: owner.cookie, body: { role: 'lawyer' } });
      const { rows } = await h.admin.query<{ metadata: unknown }>(
        `SELECT metadata FROM audit_log WHERE action = 'member.role_changed' AND target = $1`,
        [person.userId],
      );
      expect(rows[0]?.metadata).toEqual({ from: 'member', to: 'lawyer' });
      const notes = await h.request('GET', '/v1/notifications', { cookie: person.cookie });
      expect(notes.json<{ notifications: { title: string }[] }>().notifications[0]?.title).toBe('Your role has changed');
    });

    it('rejects an unknown role and a bad id', async () => {
      const bad = await h.request('PATCH', `/v1/members/${member.userId}`, { cookie: owner.cookie, body: { role: 'emperor' } });
      expect(bad.statusCode).toBe(400);
      const badId = await h.request('PATCH', '/v1/members/not-a-uuid', { cookie: owner.cookie, body: { role: 'member' } });
      expect(badId.statusCode).toBe(400);
    });
  });

  describe('owners and leaving', () => {
    it('the last owner cannot step down or leave', async () => {
      const owner = await h.signIn();
      await addMember(h, owner, 'member');
      const demote = await h.request('PATCH', `/v1/members/${owner.userId}`, { cookie: owner.cookie, body: { role: 'admin' } });
      expect(demote.statusCode).toBe(409);
      expect(errorOf(demote).code).toBe('last_owner');
      const leave = await h.request('DELETE', `/v1/members/${owner.userId}`, { cookie: owner.cookie });
      expect(leave.statusCode).toBe(409);
      expect(await roleOf(owner, owner.userId)).toBe('owner');
    });

    it('two owners stepping down at once still leaves one', async () => {
      const owner = await h.signIn();
      const second = await addMember(h, owner, 'owner');
      const results = await Promise.all([
        h.request('PATCH', `/v1/members/${owner.userId}`, { cookie: owner.cookie, body: { role: 'member' } }),
        h.request('PATCH', `/v1/members/${second.userId}`, { cookie: second.cookie, body: { role: 'member' } }),
      ]);
      expect(results.map((r) => r.statusCode).sort()).toEqual([200, 409]);
      const { rows } = await h.admin.query(`SELECT 1 FROM membership WHERE organisation_id = $1 AND role = 'owner'`, [owner.organisationId]);
      expect(rows).toHaveLength(1);
    });

    it('with a second owner, an owner can step down', async () => {
      const owner = await h.signIn();
      await addMember(h, owner, 'owner');
      const demote = await h.request('PATCH', `/v1/members/${owner.userId}`, { cookie: owner.cookie, body: { role: 'member' } });
      expect(demote.statusCode).toBe(200);
    });

    it('a removed person loses access at once, keeps their account, and gets an organisation on next sign-in', async () => {
      const owner = await h.signIn();
      const member = await addMember(h, owner, 'member');
      expect((await h.request('DELETE', `/v1/members/${member.userId}`, { cookie: owner.cookie })).statusCode).toBe(200);

      const blocked = await h.request('GET', '/v1/companies', { cookie: member.cookie });
      expect(blocked.statusCode).toBe(403);
      expect(errorOf(blocked).code).toBe('no_organisation');
      expect((await h.request('GET', '/v1/me', { cookie: member.cookie })).statusCode).toBe(200);

      const again = await h.signIn(member.email);
      expect(again.organisationId).not.toBe(owner.organisationId);
      expect((await h.request('GET', '/v1/companies', { cookie: again.cookie })).statusCode).toBe(200);
    });

    it('a member can leave but cannot remove others', async () => {
      const owner = await h.signIn();
      const a = await addMember(h, owner, 'member');
      const b = await addMember(h, owner, 'member');
      expect((await h.request('DELETE', `/v1/members/${b.userId}`, { cookie: a.cookie })).statusCode).toBe(403);
      expect((await h.request('DELETE', `/v1/members/${a.userId}`, { cookie: a.cookie })).statusCode).toBe(200);
    });

    it('removing someone who is not there is a 404', async () => {
      const owner = await h.signIn();
      const response = await h.request('DELETE', '/v1/members/11111111-1111-4111-8111-111111111111', { cookie: owner.cookie });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('switching organisation', () => {
    it('moves the session to another organisation the person belongs to', async () => {
      const owner = await h.signIn();
      const person = await h.signIn();
      const home = person.organisationId;
      const token = await invite(h, owner, person.email);
      await h.request('POST', '/v1/invitations/accept', { cookie: person.cookie, body: { token } });

      const back = await h.request('POST', '/v1/organisations/switch', { cookie: person.cookie, body: { organisationId: home } });
      expect(back.statusCode).toBe(200);
      const current = await h.request('GET', '/v1/organisations/current', { cookie: person.cookie });
      expect(current.json<{ id: string; role: string }>()).toMatchObject({ id: home, role: 'owner' });
    });

    it('rejects an invalid id', async () => {
      const person = await h.signIn();
      const response = await h.request('POST', '/v1/organisations/switch', { cookie: person.cookie, body: { organisationId: 'nope' } });
      expect(response.statusCode).toBe(400);
    });
  });
});

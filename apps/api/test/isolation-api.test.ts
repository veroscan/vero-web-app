import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { errorOf, invite, startHarness, uniqueEmail, type Harness, type SignedIn } from './support/harness';

/** Organisation A attacks organisation B through every route that takes an id. */
describe('tenant isolation at the API', () => {
  let h: Harness;
  let a: SignedIn;
  let b: SignedIn;
  let bCompanyId: string;
  let bInvitationId: string;
  let bNotificationId: string;

  beforeAll(async () => {
    h = await startHarness();
    a = await h.signIn();
    b = await h.signIn();
    const company = await h.request('POST', '/v1/companies', {
      cookie: b.cookie,
      body: { legalName: 'Organisation B Secret Ltd', incorporationCountry: 'GB', registrationNumber: 'B-1', markets: [{ country: 'GB', kind: 'operates' }] },
    });
    bCompanyId = company.json<{ id: string }>().id;
    const created = await h.request('POST', '/v1/invitations', { cookie: b.cookie, body: { email: uniqueEmail('b-invite') } });
    bInvitationId = created.json<{ id: string }>().id;
    const { rows } = await h.admin.query<{ id: string }>(
      `INSERT INTO notification (organisation_id, user_id, kind, title) VALUES ($1, $2, 'score', 'B only') RETURNING id`,
      [b.organisationId, b.userId],
    );
    bNotificationId = rows[0]?.id as string;
  });
  afterAll(() => h.close());

  it('A cannot read B’s company', async () => {
    const response = await h.request('GET', `/v1/companies/${bCompanyId}`, { cookie: a.cookie });
    expect(response.statusCode).toBe(404);
    expect(response.body).not.toContain('Organisation B Secret');
  });

  it('A’s answer is the same as for an id that does not exist, so ids reveal nothing', async () => {
    const theirs = await h.request('GET', `/v1/companies/${bCompanyId}`, { cookie: a.cookie });
    const nothing = await h.request('GET', '/v1/companies/11111111-1111-4111-8111-111111111111', { cookie: a.cookie });
    expect(theirs.statusCode).toBe(nothing.statusCode);
    expect(theirs.body).toBe(nothing.body);
  });

  it('A’s company list does not include B’s', async () => {
    const response = await h.request('GET', '/v1/companies', { cookie: a.cookie });
    expect(response.body).not.toContain(bCompanyId);
    expect(response.body).not.toContain('Organisation B Secret');
  });

  it('A cannot change B’s company, and B’s data is untouched', async () => {
    const response = await h.request('PATCH', `/v1/companies/${bCompanyId}`, {
      cookie: a.cookie,
      body: { legalName: 'Hacked', markets: [] },
    });
    expect(response.statusCode).toBe(404);
    const own = await h.request('GET', `/v1/companies/${bCompanyId}`, { cookie: b.cookie });
    expect(own.json<{ legalName: string; markets: unknown[] }>()).toMatchObject({
      legalName: 'Organisation B Secret Ltd',
      markets: [{ country: 'GB', kind: 'operates' }],
    });
  });

  it('A cannot see B’s people', async () => {
    const response = await h.request('GET', '/v1/members', { cookie: a.cookie });
    expect(response.body).not.toContain(b.email);
    expect(response.body).not.toContain(b.userId);
  });

  it('A cannot change the role of, or remove, someone in B', async () => {
    const role = await h.request('PATCH', `/v1/members/${b.userId}`, { cookie: a.cookie, body: { role: 'member' } });
    expect(role.statusCode).toBe(404);
    const remove = await h.request('DELETE', `/v1/members/${b.userId}`, { cookie: a.cookie });
    expect(remove.statusCode).toBe(404);
    const members = await h.request('GET', '/v1/members', { cookie: b.cookie });
    expect(members.json<{ members: { role: string }[] }>().members[0]?.role).toBe('owner');
  });

  it('A cannot see or revoke B’s invitations', async () => {
    const list = await h.request('GET', '/v1/invitations', { cookie: a.cookie });
    expect(list.body).not.toContain(bInvitationId);
    const revoke = await h.request('DELETE', `/v1/invitations/${bInvitationId}`, { cookie: a.cookie });
    expect(revoke.statusCode).toBe(404);
    const theirs = await h.request('GET', '/v1/invitations', { cookie: b.cookie });
    expect(theirs.body).toContain(bInvitationId);
  });

  it('A cannot read or mark B’s notifications', async () => {
    const list = await h.request('GET', '/v1/notifications', { cookie: a.cookie });
    expect(list.body).not.toContain('B only');
    const read = await h.request('POST', `/v1/notifications/${bNotificationId}/read`, { cookie: a.cookie });
    expect(read.statusCode).toBe(404);
    const { rows } = await h.admin.query<{ read_at: Date | null }>('SELECT read_at FROM notification WHERE id = $1', [bNotificationId]);
    expect(rows[0]?.read_at).toBeNull();
  });

  it('A’s audit log has none of B’s events', async () => {
    const response = await h.request('GET', '/v1/audit?limit=100', { cookie: a.cookie });
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toContain(bCompanyId);
    expect(response.body).not.toContain(b.userId);
  });

  it('A cannot switch into B', async () => {
    const response = await h.request('POST', '/v1/organisations/switch', { cookie: a.cookie, body: { organisationId: b.organisationId } });
    expect(response.statusCode).toBe(403);
    expect(errorOf(response).code).toBe('not_a_member');
    const current = await h.request('GET', '/v1/organisations/current', { cookie: a.cookie });
    expect(current.json<{ id: string }>().id).toBe(a.organisationId);
  });

  it('A’s organisation list does not include B', async () => {
    const response = await h.request('GET', '/v1/organisations', { cookie: a.cookie });
    expect(response.body).not.toContain(b.organisationId);
    const me = await h.request('GET', '/v1/me', { cookie: a.cookie });
    expect(me.body).not.toContain(b.organisationId);
  });

  it('renaming A’s organisation does not touch B’s', async () => {
    await h.request('PATCH', '/v1/organisations/current', { cookie: a.cookie, body: { name: 'A renamed' } });
    const theirs = await h.request('GET', '/v1/organisations/current', { cookie: b.cookie });
    expect(theirs.json<{ name: string }>().name).not.toBe('A renamed');
  });

  it('sending B’s organisation id in a body or query changes nothing', async () => {
    const created = await h.request('POST', '/v1/companies', {
      cookie: a.cookie,
      body: { legalName: 'Mine Ltd', incorporationCountry: 'GB', organisationId: b.organisationId },
    });
    expect(created.json<{ organisationId: string }>().organisationId).toBe(a.organisationId);
    const list = await h.request('GET', `/v1/companies?organisationId=${b.organisationId}`, { cookie: a.cookie });
    expect(list.body).not.toContain(bCompanyId);
  });

  it('an invitation token with another organisation’s id in it gets nowhere', async () => {
    const email = uniqueEmail('forged');
    const token = await invite(h, b, email);
    const secret = token.split('.')[1] as string;
    const person = await h.signIn(email);
    const forged = `${a.organisationId}.${secret}`;
    const response = await h.request('POST', '/v1/invitations/accept', { cookie: person.cookie, body: { token: forged } });
    expect(response.statusCode).toBe(400);
    const made = `${b.organisationId}.${'z'.repeat(43)}`;
    const guessed = await h.request('POST', '/v1/invitations/accept', { cookie: person.cookie, body: { token: made } });
    expect(guessed.statusCode).toBe(400);
  });

  it('someone in both organisations sees only the active one', async () => {
    const shared = await h.signIn();
    const token = await invite(h, b, shared.email);
    await h.request('POST', '/v1/invitations/accept', { cookie: shared.cookie, body: { token } });
    expect((await h.request('GET', `/v1/companies/${bCompanyId}`, { cookie: shared.cookie })).statusCode).toBe(200);

    await h.request('POST', '/v1/organisations/switch', { cookie: shared.cookie, body: { organisationId: shared.organisationId } });
    expect((await h.request('GET', `/v1/companies/${bCompanyId}`, { cookie: shared.cookie })).statusCode).toBe(404);
  });

  it('a session forced to point at another organisation is refused', async () => {
    const victim = await h.signIn();
    const attacker = await h.signIn();
    await h.admin.query('UPDATE session SET active_organisation_id = $1 WHERE user_id = $2', [victim.organisationId, attacker.userId]);
    const response = await h.request('GET', '/v1/companies', { cookie: attacker.cookie });
    expect(response.statusCode).toBe(403);
    expect(errorOf(response).code).toBe('not_a_member');
  });
});

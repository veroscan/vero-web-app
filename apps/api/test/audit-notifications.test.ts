import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addMember, errorOf, startHarness, type Harness, type SignedIn } from './support/harness';

describe('audit log', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('lists events newest first, in pages', async () => {
    const owner = await h.signIn();
    for (let i = 0; i < 3; i += 1) {
      await h.request('POST', '/v1/companies', { cookie: owner.cookie, body: { legalName: `Co ${i}`, incorporationCountry: 'GB' } });
    }
    const first = await h.request('GET', '/v1/audit?limit=2', { cookie: owner.cookie });
    expect(first.statusCode).toBe(200);
    const page = first.json<{ entries: { action: string; actorId: string }[]; nextCursor: string }>();
    expect(page.entries).toHaveLength(2);
    expect(page.entries[0]).toMatchObject({ action: 'company.created', actorId: owner.userId });

    const rest = await h.request('GET', `/v1/audit?limit=100&cursor=${page.nextCursor}`, { cookie: owner.cookie });
    const restPage = rest.json<{ entries: { id: string; action: string }[]; nextCursor: string | null }>();
    expect(restPage.nextCursor).toBeNull();
    expect(restPage.entries.map((entry) => entry.action)).toContain('organisation.created');
  });

  it('records the IP address and browser', async () => {
    const owner = await h.signIn();
    await h.request('POST', '/v1/companies', {
      cookie: owner.cookie,
      ip: '10.9.8.7',
      headers: { 'user-agent': 'TestBrowser/1.0' },
      body: { legalName: 'Tracked Ltd', incorporationCountry: 'GB' },
    });
    const response = await h.request('GET', '/v1/audit?limit=1', { cookie: owner.cookie });
    expect(response.json<{ entries: { ip: string; userAgent: string }[] }>().entries[0]).toMatchObject({
      ip: '10.9.8.7',
      userAgent: 'TestBrowser/1.0',
    });
  });

  it.each([['limit too big', 'limit=1000'], ['limit zero', 'limit=0'], ['not a number', 'limit=abc'], ['bad cursor', 'cursor=abc']])(
    'rejects %s',
    async (_label, query) => {
      const owner = await h.signIn();
      const response = await h.request('GET', `/v1/audit?${query}`, { cookie: owner.cookie });
      expect(response.statusCode).toBe(400);
      expect(errorOf(response).code).toBe('invalid_input');
    },
  );

  it('is append-only, even for the superuser', async () => {
    await expect(h.admin.query(`UPDATE audit_log SET action = 'tampered'`)).rejects.toThrow(/append-only/);
    await expect(h.admin.query('DELETE FROM audit_log')).rejects.toThrow(/append-only/);
    await expect(h.admin.query('TRUNCATE audit_log')).rejects.toThrow(/append-only/);
  });

  it('there is no route that changes it', async () => {
    const owner = await h.signIn();
    for (const method of ['POST', 'PATCH', 'DELETE'] as const) {
      const response = await h.request(method, '/v1/audit', { cookie: owner.cookie, body: method === 'DELETE' ? undefined : {} });
      expect(response.statusCode, method).toBe(404);
    }
  });
});

describe('notifications', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  async function notify(person: SignedIn, title: string): Promise<string> {
    const { rows } = await h.admin.query<{ id: string }>(
      `INSERT INTO notification (organisation_id, user_id, kind, title) VALUES ($1, $2, 'score', $3) RETURNING id`,
      [person.organisationId, person.userId, title],
    );
    return rows[0]?.id as string;
  }

  const list = (person: SignedIn, query = '') =>
    h.request('GET', `/v1/notifications${query}`, { cookie: person.cookie });
  type ListBody = { notifications: { id: string; title: string; readAt: string | null }[]; unreadCount: number; nextCursor: string | null };

  it('starts empty', async () => {
    const person = await h.signIn();
    expect((await list(person)).json<ListBody>()).toEqual({ notifications: [], unreadCount: 0, nextCursor: null });
  });

  it('lists newest first with an unread count', async () => {
    const person = await h.signIn();
    await notify(person, 'First');
    await notify(person, 'Second');
    const body = (await list(person)).json<ListBody>();
    expect(body.notifications.map((n) => n.title)).toEqual(['Second', 'First']);
    expect(body.unreadCount).toBe(2);
  });

  it('pages through results', async () => {
    const person = await h.signIn();
    for (const title of ['A', 'B', 'C']) await notify(person, title);
    const first = (await list(person, '?limit=2')).json<ListBody>();
    expect(first.notifications.map((n) => n.title)).toEqual(['C', 'B']);
    const second = (await list(person, `?limit=2&cursor=${first.nextCursor}`)).json<ListBody>();
    expect(second.notifications.map((n) => n.title)).toEqual(['A']);
    expect(second.nextCursor).toBeNull();
  });

  it('marks one as read, keeping the first read time', async () => {
    const person = await h.signIn();
    const id = await notify(person, 'Read me');
    const read = await h.request('POST', `/v1/notifications/${id}/read`, { cookie: person.cookie });
    expect(read.statusCode).toBe(200);
    const readAt = read.json<{ readAt: string }>().readAt;
    expect(readAt).toBeTruthy();
    const again = await h.request('POST', `/v1/notifications/${id}/read`, { cookie: person.cookie });
    expect(again.json<{ readAt: string }>().readAt).toBe(readAt);
    expect((await list(person)).json<ListBody>().unreadCount).toBe(0);
  });

  it('marks all as read, and can filter to unread', async () => {
    const person = await h.signIn();
    const id = await notify(person, 'One');
    await notify(person, 'Two');
    await h.request('POST', `/v1/notifications/${id}/read`, { cookie: person.cookie });
    const unread = (await list(person, '?unreadOnly=true')).json<ListBody>();
    expect(unread.notifications.map((n) => n.title)).toEqual(['Two']);

    const all = await h.request('POST', '/v1/notifications/read-all', { cookie: person.cookie });
    expect(all.json<{ updated: number }>().updated).toBe(1);
    expect((await list(person, '?unreadOnly=true')).json<ListBody>().notifications).toEqual([]);
  });

  it('a teammate cannot see or mark my notifications', async () => {
    const owner = await h.signIn();
    const teammate = await addMember(h, owner, 'member');
    const id = await notify(owner, 'Private');
    // The owner also has "Someone accepted your invitation", so compare before and after.
    const unreadBefore = (await list(owner)).json<ListBody>().unreadCount;
    expect(unreadBefore).toBeGreaterThan(0);

    expect((await list(teammate)).json<ListBody>().notifications).toEqual([]);
    const response = await h.request('POST', `/v1/notifications/${id}/read`, { cookie: teammate.cookie });
    expect(response.statusCode).toBe(404);
    expect((await list(owner)).json<ListBody>().unreadCount).toBe(unreadBefore);
    await h.request('POST', '/v1/notifications/read-all', { cookie: teammate.cookie });
    expect((await list(owner)).json<ListBody>().unreadCount).toBe(unreadBefore);
  });

  it('rejects bad input and a missing session', async () => {
    const person = await h.signIn();
    expect((await h.request('POST', '/v1/notifications/not-an-id/read', { cookie: person.cookie })).statusCode).toBe(400);
    expect((await list(person, '?unreadOnly=maybe')).statusCode).toBe(400);
    expect((await h.request('GET', '/v1/notifications')).statusCode).toBe(401);
  });

  it('the database refuses an unknown kind', async () => {
    const person = await h.signIn();
    await expect(
      h.admin.query(`INSERT INTO notification (organisation_id, user_id, kind, title) VALUES ($1, $2, 'spam', 'x')`, [person.organisationId, person.userId]),
    ).rejects.toThrow(/check constraint/);
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addMember, errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { MISSING_ID, scannedCompany, setPlan, type CompanyBody } from './support/product';

/** Share links: an optional name, and a count of public opens with no viewer data (migration 0026). */

interface ShareBody {
  id: string;
  name: string | null;
  viewCount: number;
  lastViewedAt: string | null;
  active: boolean;
  token?: string;
}

describe('share link names and views', () => {
  let h: Harness;
  let owner: SignedIn;
  let company: CompanyBody;

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    company = await scannedCompany(h, owner, { legalName: 'Kestrel Pay UK Ltd' });
  });
  afterAll(() => h.close());

  const create = async (body: Record<string, unknown> = {}) => h.request('POST', `/v1/companies/${company.id}/shares`, { cookie: owner.cookie, body });
  const links = async () => (await h.request('GET', `/v1/companies/${company.id}/shares`, { cookie: owner.cookie })).json<{ links: ShareBody[] }>().links;
  const link = async (id: string) => (await links()).find((item) => item.id === id);
  const open = (token: string, cookie?: string) => h.request('GET', `/v1/public/reports/${token}`, cookie ? { cookie } : {});

  it('makes a link with or without a name, and starts the count at nothing', async () => {
    const named = await create({ name: '  For the seed round  ' });
    expect(named.statusCode).toBe(201);
    expect(named.json<ShareBody>()).toMatchObject({ name: 'For the seed round', viewCount: 0, lastViewedAt: null, active: true });
    const plain = await create();
    expect(plain.json<ShareBody>()).toMatchObject({ name: null, viewCount: 0, lastViewedAt: null });
    expect(errorOf(await create({ name: 'x'.repeat(81) })).message).toBe('That name is too long. Keep it under 80 characters.');
    expect(errorOf(await create({ name: '   ' })).message).toBe('Enter a name for the link, or leave it out.');
  });

  it('counts a public open, and when it last happened', async () => {
    const created = (await create({ name: 'Counted' })).json<ShareBody>();
    const token = created.token ?? '';
    expect((await open(token)).statusCode).toBe(200);
    const once = await link(created.id);
    expect(once?.viewCount).toBe(1);
    expect(Date.parse(once?.lastViewedAt ?? '')).toBeGreaterThan(Date.now() - 60_000);

    expect((await open(token)).statusCode).toBe(200);
    expect((await link(created.id))?.viewCount).toBe(2);
    // The public answer says nothing about the count or the name.
    const publicBody = (await open(token)).body;
    expect(publicBody).not.toContain('viewCount');
    expect(publicBody).not.toContain('Counted');
  });

  it("does not count the team's own preview, but does count someone signed in elsewhere", async () => {
    const created = (await create()).json<ShareBody>();
    const token = created.token ?? '';
    const teammate = await addMember(h, owner, 'member');
    expect((await open(token, owner.cookie)).statusCode).toBe(200);
    expect((await open(token, teammate.cookie)).statusCode).toBe(200);
    expect(await link(created.id)).toMatchObject({ viewCount: 0, lastViewedAt: null });

    const outsider = await h.signIn();
    expect((await open(token, outsider.cookie)).statusCode).toBe(200);
    expect((await link(created.id))?.viewCount).toBe(1);
    // A signed-out session is just the public again.
    await h.request('POST', '/v1/auth/logout', { cookie: outsider.cookie });
    expect((await open(token, outsider.cookie)).statusCode).toBe(200);
    expect((await link(created.id))?.viewCount).toBe(2);
  });

  it('keeps nothing about who opened it', async () => {
    const created = (await create()).json<ShareBody>();
    await h.request('GET', `/v1/public/reports/${created.token}`, { ip: '203.0.113.77', headers: { 'user-agent': 'ViewerBrowser/1.0' } });
    const { rows } = await h.admin.query<Record<string, unknown>>(`SELECT * FROM shared_report WHERE id = $1`, [created.id]);
    expect(rows[0]?.view_count).toBe(1);
    const stored = JSON.stringify(rows[0]);
    expect(stored).not.toContain('203.0.113.77');
    expect(stored).not.toContain('ViewerBrowser');
    const audit = await h.admin.query(`SELECT 1 FROM audit_log WHERE ip = '203.0.113.77' OR user_agent = 'ViewerBrowser/1.0'`);
    expect(audit.rows).toHaveLength(0);
  });

  it('does not count an open of a link that no longer works', async () => {
    const created = (await create()).json<ShareBody>();
    await h.request('DELETE', `/v1/shares/${created.id}`, { cookie: owner.cookie });
    expect((await open(created.token ?? '')).statusCode).toBe(404);
    expect(await link(created.id)).toMatchObject({ viewCount: 0, lastViewedAt: null, active: false });
  });

  it('renames a link, and takes the name away', async () => {
    const created = (await create()).json<ShareBody>();
    const renamed = await h.request('PATCH', `/v1/shares/${created.id}`, { cookie: owner.cookie, body: { name: 'Board pack' } });
    expect(renamed.statusCode).toBe(200);
    expect(renamed.json<ShareBody>()).toMatchObject({ id: created.id, name: 'Board pack' });
    expect(renamed.body).not.toContain('token');
    expect((await link(created.id))?.name).toBe('Board pack');
    const cleared = await h.request('PATCH', `/v1/shares/${created.id}`, { cookie: owner.cookie, body: { name: null } });
    expect(cleared.json<ShareBody>().name).toBeNull();
    expect((await h.request('PATCH', `/v1/shares/${created.id}`, { cookie: owner.cookie, body: {} })).statusCode).toBe(400);
    const { rows } = await h.admin.query(`SELECT 1 FROM audit_log WHERE action = 'share.renamed' AND target = $1`, [created.id]);
    expect(rows).toHaveLength(2);
  });

  it('lets only the people who manage sharing rename, and only their own links', async () => {
    const created = (await create()).json<ShareBody>();
    const member = await addMember(h, owner, 'member');
    expect((await h.request('PATCH', `/v1/shares/${created.id}`, { cookie: member.cookie, body: { name: 'Mine now' } })).statusCode).toBe(403);
    const stranger = await h.signIn();
    await setPlan(h, stranger.organisationId, 'growth');
    expect((await h.request('PATCH', `/v1/shares/${created.id}`, { cookie: stranger.cookie, body: { name: 'Mine now' } })).statusCode).toBe(404);
    expect((await h.request('PATCH', `/v1/shares/${MISSING_ID}`, { cookie: owner.cookie, body: { name: 'Nothing' } })).statusCode).toBe(404);
    expect((await h.request('PATCH', `/v1/shares/${created.id}`, { body: { name: 'Nobody' } })).statusCode).toBe(401);
    expect((await link(created.id))?.name).toBeNull();
  });
});

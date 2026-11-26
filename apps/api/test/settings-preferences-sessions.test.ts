import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { deviceLabel } from '../src/modules/auth/devices';
import { sendDeadlineReminders } from '../src/modules/deadlines/routes';
import { addMember, errorOf, sessionCookieFrom, startHarness, type Harness, type SignedIn } from './support/harness';
import { createCompany, MISSING_ID, scanNow } from './support/product';

/** Settings: which notifications also send email (migration 0027), and the list of active sessions. */

const DAY = 86_400_000;
const ALL_ON = { email: { deadline: true, score: true, team: true, lookup: true, system: true } };

describe('email notification preferences', () => {
  let h: Harness;
  let owner: SignedIn;
  let companyId: string;

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    companyId = (await createCompany(h, owner, { legalName: 'Heron Pay Ltd' })).id;
    await scanNow(h, owner, companyId);
  });
  afterAll(() => h.close());

  const get = (who: SignedIn) => h.request('GET', '/v1/notifications/preferences', { cookie: who.cookie });
  const put = (who: SignedIn, email: unknown) => h.request('PUT', '/v1/notifications/preferences', { cookie: who.cookie, body: { email } });
  const mailTo = async (email: string, template: string, subjectLike = '%') =>
    (await h.admin.query<{ subject: string }>(`SELECT subject FROM outbox WHERE to_email = $1 AND template = $2 AND subject LIKE $3`, [email, template, subjectLike])).rows;
  async function addDeadline(title: string, days: number): Promise<void> {
    await h.admin.query(`INSERT INTO deadline (organisation_id, company_id, rule_key, title, due_on, monitoring) VALUES ($1, $2, $3, $4, $5, 'reminder')`, [
      owner.organisationId,
      companyId,
      `GB.TEST.${title.toUpperCase().replace(/[^A-Z]/g, '_')}`,
      title,
      new Date(Date.now() + days * DAY).toISOString().slice(0, 10),
    ]);
  }

  it('starts with every kind on, and changes only what is sent', async () => {
    expect((await get(owner)).json()).toEqual(ALL_ON);
    const saved = await put(owner, { score: false });
    expect(saved.statusCode).toBe(200);
    expect(saved.json()).toEqual({ email: { ...ALL_ON.email, score: false } });
    expect((await put(owner, { team: false })).json()).toEqual({ email: { ...ALL_ON.email, score: false, team: false } });
    expect((await get(owner)).json()).toEqual({ email: { ...ALL_ON.email, score: false, team: false } });
    expect((await put(owner, { score: true, team: true })).json()).toEqual(ALL_ON);
    const { rows } = await h.admin.query(`SELECT 1 FROM audit_log WHERE organisation_id = $1 AND actor_id = $2 AND action = 'notifications.email_preferences_set'`, [owner.organisationId, owner.userId]);
    expect(rows).toHaveLength(3);
  });

  it('refuses input that is not a choice', async () => {
    expect(errorOf(await put(owner, { deadline: 'no' })).message).toBe('Each email choice is on or off.');
    expect(errorOf(await put(owner, {})).message).toBe('Nothing to change.');
    expect(errorOf(await put(owner, { marketing: true })).message).toBe('Nothing to change.');
    expect((await h.request('PUT', '/v1/notifications/preferences', { cookie: owner.cookie, body: {} })).statusCode).toBe(400);
    expect((await h.request('GET', '/v1/notifications/preferences')).statusCode).toBe(401);
  });

  it("is each person's own, in their own organisation", async () => {
    const teammate = await addMember(h, owner, 'admin');
    await put(teammate, { deadline: false });
    expect((await get(owner)).json()).toEqual(ALL_ON);
    expect((await get(teammate)).json()).toEqual({ email: { ...ALL_ON.email, deadline: false } });
    const stranger = await h.signIn();
    expect((await get(stranger)).json()).toEqual(ALL_ON);
    const { rows } = await h.admin.query<{ organisation_id: string; user_id: string }>(`SELECT organisation_id, user_id FROM notification_preference WHERE user_id = $1`, [teammate.userId]);
    expect(rows).toEqual([{ organisation_id: owner.organisationId, user_id: teammate.userId }]);
  });

  it('the reminder sender emails only the people who want deadline emails, and still notifies everyone in the app', async () => {
    const quiet = await addMember(h, owner, 'admin');
    await put(quiet, { deadline: false });
    await addDeadline('Preference check', 6);
    await sendDeadlineReminders(h.deps);

    const inApp = await h.admin.query<{ user_id: string }>(`SELECT user_id FROM notification WHERE organisation_id = $1 AND title LIKE 'Preference check%'`, [owner.organisationId]);
    expect(inApp.rows.map((row) => row.user_id)).toEqual(expect.arrayContaining([owner.userId, quiet.userId]));
    expect(await mailTo(owner.email, 'notification-deadline', 'Preference check%')).toHaveLength(1);
    expect(await mailTo(quiet.email, 'notification-deadline', 'Preference check%')).toHaveLength(0);
  });

  it('the scan result email honours the "score" choice', async () => {
    const team = await h.signIn();
    const second = await addMember(h, team, 'admin');
    await put(second, { score: false });
    const company = await createCompany(h, team, { legalName: 'Kestrel Pay UK Ltd' });
    await scanNow(h, team, company.id);
    expect(await mailTo(team.email, 'scan-result')).toHaveLength(1);
    expect(await mailTo(second.email, 'scan-result')).toHaveLength(0);
    // The in-app notification still reaches both.
    const inApp = await h.admin.query<{ user_id: string }>(`SELECT user_id FROM notification WHERE organisation_id = $1 AND kind = 'score'`, [team.organisationId]);
    expect(inApp.rows.map((row) => row.user_id)).toEqual(expect.arrayContaining([team.userId, second.userId]));
  });
});

describe('device labels', () => {
  it('names the browser family and system, and nothing finer', () => {
    expect(deviceLabel('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36')).toBe('Chrome on Windows');
    expect(deviceLabel('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0')).toBe('Edge on Windows');
    expect(deviceLabel('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15')).toBe('Safari on Mac');
    expect(deviceLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1')).toBe('Safari on iPhone');
    expect(deviceLabel('Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36')).toBe('Chrome on Android');
    expect(deviceLabel('Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0')).toBe('Firefox on Linux');
  });

  it('says nothing when it cannot tell', () => {
    expect(deviceLabel(null)).toBeNull();
    expect(deviceLabel('')).toBeNull();
    expect(deviceLabel('lightMyRequest')).toBeNull();
    expect(deviceLabel('curl/8.9.0')).toBeNull();
  });
});

describe('active sessions', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  interface SessionBody {
    id: string;
    createdAt: string;
    lastUsedAt: string;
    device: string | null;
    current: boolean;
    expiresAt: string;
  }
  const FIREFOX = 'Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0';
  const list = async (cookie: string) => h.request('GET', '/v1/me/sessions', { cookie });

  /** A second sign-in for the same person, from another browser. */
  async function signInAgain(email: string, userAgent?: string): Promise<string> {
    const token = await h.requestLink(email);
    const response = await h.request('POST', '/v1/auth/magic-link/verify', { body: { token }, ...(userAgent ? { headers: { 'user-agent': userAgent } } : {}) });
    expect(response.statusCode).toBe(200);
    return sessionCookieFrom(response);
  }

  it('lists where the person is signed in: this one first, with a coarse device label and no address', async () => {
    const person = await h.signIn();
    const second = await signInAgain(person.email, FIREFOX);
    const response = await list(second);
    expect(response.statusCode).toBe(200);
    const sessions = response.json<{ sessions: SessionBody[] }>().sessions;
    expect(sessions).toHaveLength(2);
    expect(sessions[0]).toMatchObject({ current: true, device: 'Firefox on Linux' });
    expect(sessions[1]).toMatchObject({ current: false, device: null });
    expect(Date.parse(sessions[0]?.expiresAt ?? '')).toBeGreaterThan(Date.now() + 29 * DAY);
    expect(Object.keys(sessions[0] ?? {}).sort()).toEqual(['createdAt', 'current', 'device', 'expiresAt', 'id', 'lastUsedAt']);
    expect(response.body).not.toContain('Mozilla');
    // From the first browser, the same two, with the other one marked as this one.
    const fromFirst = (await list(person.cookie)).json<{ sessions: SessionBody[] }>().sessions;
    expect(fromFirst.find((item) => item.current)?.id).toBe(sessions[1]?.id);
  });

  it('revokes one other session, at once, and leaves the rest', async () => {
    const person = await h.signIn();
    const second = await signInAgain(person.email, FIREFOX);
    const third = await signInAgain(person.email);
    const other = (await list(person.cookie)).json<{ sessions: SessionBody[] }>().sessions.find((item) => item.device === 'Firefox on Linux');
    const revoked = await h.request('DELETE', `/v1/me/sessions/${other?.id}`, { cookie: person.cookie });
    expect(revoked.statusCode).toBe(200);
    expect(revoked.json()).toEqual({ ok: true });
    expect((await h.request('GET', '/v1/me', { cookie: second })).statusCode).toBe(401);
    expect((await h.request('GET', '/v1/me', { cookie: third })).statusCode).toBe(200);
    expect((await h.request('GET', '/v1/me', { cookie: person.cookie })).statusCode).toBe(200);
    expect((await list(person.cookie)).json<{ sessions: SessionBody[] }>().sessions).toHaveLength(2);
    // Twice is "not found": it is already gone.
    expect((await h.request('DELETE', `/v1/me/sessions/${other?.id}`, { cookie: person.cookie })).statusCode).toBe(404);
    const { rows } = await h.admin.query(`SELECT 1 FROM audit_log WHERE action = 'auth.session_revoked' AND actor_id = $1 AND target = $2`, [person.userId, other?.id]);
    expect(rows).toHaveLength(1);
  });

  it("won't revoke the session in use, someone else's, or one that doesn't exist", async () => {
    const person = await h.signIn();
    const stranger = await h.signIn();
    const mine = (await list(person.cookie)).json<{ sessions: SessionBody[] }>().sessions[0];
    const current = await h.request('DELETE', `/v1/me/sessions/${mine?.id}`, { cookie: person.cookie });
    expect(current.statusCode).toBe(409);
    expect(errorOf(current).message).toBe("That's the session you're using now. To end it, sign out.");
    // Someone else's session looks exactly like one that isn't there, and stays signed in.
    expect((await h.request('DELETE', `/v1/me/sessions/${mine?.id}`, { cookie: stranger.cookie })).statusCode).toBe(404);
    expect((await h.request('GET', '/v1/me', { cookie: person.cookie })).statusCode).toBe(200);
    expect((await h.request('DELETE', `/v1/me/sessions/${MISSING_ID}`, { cookie: person.cookie })).statusCode).toBe(404);
    expect((await h.request('DELETE', '/v1/me/sessions/not-an-id', { cookie: person.cookie })).statusCode).toBe(400);
    expect((await h.request('GET', '/v1/me/sessions')).statusCode).toBe(401);
    // A stranger never sees this person's sessions.
    const theirs = (await list(stranger.cookie)).json<{ sessions: SessionBody[] }>().sessions;
    expect(theirs.map((item) => item.id)).not.toContain(mine?.id);
  });

  it('leaves out sessions that have ended', async () => {
    const person = await h.signIn();
    const second = await signInAgain(person.email);
    await h.request('POST', '/v1/auth/logout', { cookie: second });
    expect((await list(person.cookie)).json<{ sessions: SessionBody[] }>().sessions).toHaveLength(1);
    h.setNow(new Date(Date.now() + 31 * DAY));
    try {
      expect((await list(person.cookie)).statusCode).toBe(401);
    } finally {
      h.setNow(null);
    }
  });
});

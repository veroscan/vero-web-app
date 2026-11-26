import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { dueLead, sendDeadlineReminders } from '../src/modules/deadlines/routes';
import { addMember, errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { createCompany, MISSING_ID, scanNow } from './support/product';

/**
 * Reminders people choose (migration 0024): lead times per deadline or as the organisation's
 * default, sent once each, in the app and by email. And "last filed", only where the register
 * holds it.
 */

const DAY = 86_400_000;

interface DeadlineBody {
  id: string;
  ruleKey: string | null;
  title: string;
  dueOn: string;
  reminders: { leadDays: number[]; source: string; nextReminderOn: string | null } | null;
  lastFiledOn: string | null;
  lastFiledNote: string | null;
}

describe('deadline reminders', () => {
  let h: Harness;
  let owner: SignedIn;
  let companyId: string;

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    const company = await createCompany(h, owner, { legalName: 'Heron Pay Ltd' });
    companyId = company.id;
    await scanNow(h, owner, companyId);
  });
  afterAll(() => h.close());

  const inDays = (days: number) => new Date(Date.now() + days * DAY).toISOString().slice(0, 10);
  const list = async (who = owner) => (await h.request('GET', `/v1/deadlines?companyId=${companyId}`, { cookie: who.cookie })).json<{ deadlines: DeadlineBody[] }>().deadlines;
  async function addDeadline(title: string, days: number, organisationId = owner.organisationId, company = companyId): Promise<string> {
    const { rows } = await h.admin.query<{ id: string }>(
      `INSERT INTO deadline (organisation_id, company_id, rule_key, title, due_on, monitoring) VALUES ($1, $2, $3, $4, $5, 'reminder') RETURNING id`,
      [organisationId, company, `GB.TEST.${title.toUpperCase().replace(/[^A-Z]/g, '_')}`, title, inDays(days)],
    );
    return rows[0]?.id ?? '';
  }
  const notices = async (title: string) =>
    (await h.admin.query<{ title: string; dedupe_key: string }>(`SELECT title, dedupe_key FROM notification WHERE organisation_id = $1 AND title LIKE $2 ORDER BY created_at, seq`, [owner.organisationId, `${title}%`])).rows;
  const emails = async (title: string) =>
    (await h.admin.query<{ subject: string; to_email: string; body_text: string }>(`SELECT subject, to_email, body_text FROM outbox WHERE template = 'notification-deadline' AND subject LIKE $1 ORDER BY created_at`, [`${title}%`])).rows;

  it('works out which reminder is due: the nearest lead time already reached', () => {
    expect(dueLead([30, 14, 7, 1], 40)).toBeNull();
    expect(dueLead([30, 14, 7, 1], 30)).toBe(30);
    expect(dueLead([30, 14, 7, 1], 10)).toBe(14);
    expect(dueLead([30, 14, 7, 1], 0)).toBe(1);
    expect(dueLead([], 0)).toBeNull();
  });

  it('starts on the standard 30, 7 and 1 days, and lets the organisation choose its own', async () => {
    const before = await h.request('GET', '/v1/deadlines/reminders', { cookie: owner.cookie });
    expect(before.json()).toEqual({ leadDays: [30, 7, 1], source: 'standard', standardLeadDays: [30, 7, 1], channels: ['in_app', 'email'] });

    const saved = await h.request('PUT', '/v1/deadlines/reminders', { cookie: owner.cookie, body: { leadDays: [7, 30, 14, 14, 1] } });
    expect(saved.statusCode).toBe(200);
    expect(saved.json()).toMatchObject({ leadDays: [30, 14, 7, 1], source: 'organisation' });
    expect((await h.request('GET', '/v1/deadlines/reminders', { cookie: owner.cookie })).json()).toMatchObject({ leadDays: [30, 14, 7, 1], source: 'organisation' });

    const { rows } = await h.admin.query(`SELECT 1 FROM audit_log WHERE organisation_id = $1 AND action = 'deadline.reminder_defaults_set'`, [owner.organisationId]);
    expect(rows).toHaveLength(1);

    const back = await h.request('PUT', '/v1/deadlines/reminders', { cookie: owner.cookie, body: { leadDays: null } });
    expect(back.json()).toMatchObject({ leadDays: [30, 7, 1], source: 'standard' });
  });

  it('refuses lead times that make no sense, in plain words', async () => {
    const put = (leadDays: unknown) => h.request('PUT', '/v1/deadlines/reminders', { cookie: owner.cookie, body: { leadDays } });
    expect(errorOf(await put([-1])).message).toBe("A reminder can't be after the date.");
    expect(errorOf(await put([400])).message).toBe('A reminder can be up to 365 days before.');
    expect(errorOf(await put([1.5])).message).toBe('Each reminder is a whole number of days.');
    expect(errorOf(await put([1, 2, 3, 4, 5, 6, 7])).message).toBe('Choose up to 6 reminders.');
    expect((await h.request('PUT', '/v1/deadlines/reminders', { cookie: owner.cookie, body: {} })).statusCode).toBe(400);
  });

  it('keeps reminder choices to people who can change deadlines, and to their own organisation', async () => {
    const reader = await addMember(h, owner, 'lawyer');
    expect((await h.request('PUT', '/v1/deadlines/reminders', { cookie: reader.cookie, body: { leadDays: [3] } })).statusCode).toBe(403);
    expect((await h.request('GET', '/v1/deadlines/reminders', { cookie: reader.cookie })).statusCode).toBe(200);
    expect((await h.request('GET', '/v1/deadlines/reminders')).statusCode).toBe(401);

    const id = await addDeadline('Private date', 50);
    const stranger = await h.signIn();
    const other = await h.request('PUT', `/v1/deadlines/${id}/reminders`, { cookie: stranger.cookie, body: { leadDays: [3] } });
    expect(other.statusCode).toBe(404);
    expect((await h.request('PUT', `/v1/deadlines/${MISSING_ID}/reminders`, { cookie: owner.cookie, body: { leadDays: [3] } })).statusCode).toBe(404);
    const { rows } = await h.admin.query(`SELECT 1 FROM deadline_reminder_setting WHERE deadline_id = $1`, [id]);
    expect(rows).toHaveLength(0);
    // The stranger's own default is theirs alone.
    await h.request('PUT', '/v1/deadlines/reminders', { cookie: stranger.cookie, body: { leadDays: [2] } });
    expect((await h.request('GET', '/v1/deadlines/reminders', { cookie: owner.cookie })).json()).toMatchObject({ source: 'standard' });
  });

  it("gives one date its own lead times, shows the next reminder, and goes back to the default", async () => {
    const id = await addDeadline('Own choice', 20);
    const first = (await list()).find((item) => item.id === id);
    expect(first?.reminders).toEqual({ leadDays: [30, 7, 1], source: 'standard', nextReminderOn: inDays(13) });

    const saved = await h.request('PUT', `/v1/deadlines/${id}/reminders`, { cookie: owner.cookie, body: { leadDays: [3, 10] } });
    expect(saved.statusCode).toBe(200);
    expect(saved.json<DeadlineBody>().reminders).toEqual({ leadDays: [10, 3], source: 'deadline', nextReminderOn: inDays(10) });
    expect((await list()).find((item) => item.id === id)?.reminders?.source).toBe('deadline');

    // No reminders at all for this one date.
    const none = await h.request('PUT', `/v1/deadlines/${id}/reminders`, { cookie: owner.cookie, body: { leadDays: [] } });
    expect(none.json<DeadlineBody>().reminders).toEqual({ leadDays: [], source: 'deadline', nextReminderOn: null });

    const back = await h.request('PUT', `/v1/deadlines/${id}/reminders`, { cookie: owner.cookie, body: { leadDays: null } });
    expect(back.json<DeadlineBody>().reminders?.source).toBe('standard');
    const { rows } = await h.admin.query(`SELECT 1 FROM audit_log WHERE organisation_id = $1 AND action = 'deadline.reminders_set' AND target = $2`, [owner.organisationId, id]);
    expect(rows).toHaveLength(3);
  });

  it('sends each chosen reminder once, in the app and by email', async () => {
    const id = await addDeadline('Chosen leads', 10);
    await h.request('PUT', `/v1/deadlines/${id}/reminders`, { cookie: owner.cookie, body: { leadDays: [14, 3] } });

    await sendDeadlineReminders(h.deps);
    await sendDeadlineReminders(h.deps);
    expect(await notices('Chosen leads')).toEqual([{ title: 'Chosen leads is due in 10 days', dedupe_key: `deadline:${id}:14d` }]);
    const firstMail = await emails('Chosen leads');
    expect(firstMail).toHaveLength(1);
    expect(firstMail[0]).toMatchObject({ subject: 'Chosen leads is due in 10 days', to_email: owner.email });
    expect(firstMail[0]?.body_text).toContain('Heron Pay Ltd');
    expect(firstMail[0]?.body_text).toContain(`${h.config.webBaseUrl}/deadlines`);

    // Seven days on, three days are left: the second reminder, and only that.
    h.setNow(new Date(Date.now() + 7 * DAY));
    try {
      await sendDeadlineReminders(h.deps);
      await sendDeadlineReminders(h.deps);
    } finally {
      h.setNow(null);
    }
    expect((await notices('Chosen leads')).map((row) => row.title)).toEqual(['Chosen leads is due in 10 days', 'Chosen leads is due in 3 days']);
    expect(await emails('Chosen leads')).toHaveLength(2);
  });

  it('sends nothing for a date whose reminders are switched off, until it is overdue', async () => {
    const id = await addDeadline('Quiet date', 5);
    await h.request('PUT', `/v1/deadlines/${id}/reminders`, { cookie: owner.cookie, body: { leadDays: [] } });
    await sendDeadlineReminders(h.deps);
    expect(await notices('Quiet date')).toEqual([]);
    expect(await emails('Quiet date')).toEqual([]);
    h.setNow(new Date(Date.now() + 6 * DAY));
    try {
      await sendDeadlineReminders(h.deps);
    } finally {
      h.setNow(null);
    }
    expect((await notices('Quiet date')).map((row) => row.title)).toEqual(['Quiet date is overdue']);
  });

  it('uses the organisation default where a date has no choice of its own', async () => {
    const team = await h.signIn();
    const company = await createCompany(h, team, { legalName: 'Kestrel Pay UK Ltd' });
    await scanNow(h, team, company.id);
    await h.request('PUT', '/v1/deadlines/reminders', { cookie: team.cookie, body: { leadDays: [60] } });
    const id = await addDeadline('Default leads', 45, team.organisationId, company.id);
    await sendDeadlineReminders(h.deps);
    const { rows } = await h.admin.query<{ title: string; dedupe_key: string }>(`SELECT title, dedupe_key FROM notification WHERE organisation_id = $1 AND title LIKE 'Default leads%'`, [team.organisationId]);
    expect(rows).toEqual([{ title: 'Default leads is due in 45 days', dedupe_key: `deadline:${id}:60d` }]);
  });

  it('gives the last filed date only where the register holds one', async () => {
    const deadlines = await list();
    const confirmation = deadlines.find((item) => item.ruleKey === 'GB.CORP.CONFIRMATION_STATEMENT');
    const { rows } = await h.admin.query<{ value: string }>(
      `SELECT value #>> '{}' AS value FROM fact WHERE company_id = $1 AND key = 'registry.uk.companies_house.confirmation_last_made_up_to'`,
      [companyId],
    );
    expect(rows[0]?.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(confirmation?.lastFiledOn).toBe(rows[0]?.value);
    expect(confirmation?.lastFiledNote).toContain('Companies House');
    // Every other date says null rather than a guess.
    for (const item of deadlines.filter((entry) => entry.ruleKey !== 'GB.CORP.CONFIRMATION_STATEMENT')) {
      expect(item.lastFiledOn, item.ruleKey ?? item.title).toBeNull();
      expect(item.lastFiledNote).toBeNull();
    }
  });

  it('says no reminders go out for a company the team only follows', async () => {
    const follower = await h.signIn();
    const followed = await h.request('POST', '/v1/watchlist', { cookie: follower.cookie, body: { legalName: 'Heron Pay Ltd', incorporationCountry: 'GB' } });
    expect(followed.statusCode).toBe(201);
    await h.queue.drain();
    const followedId = followed.json<{ company: { id: string } }>().company.id;
    const deadlines = (await h.request('GET', `/v1/deadlines?companyId=${followedId}`, { cookie: follower.cookie })).json<{ deadlines: DeadlineBody[] }>().deadlines;
    expect(deadlines.length).toBeGreaterThan(0);
    for (const item of deadlines) expect(item.reminders).toBeNull();
    const refused = await h.request('PUT', `/v1/deadlines/${deadlines[0]?.id}/reminders`, { cookie: follower.cookie, body: { leadDays: [3] } });
    expect(errorOf(refused).code).toBe('follows_only');
  });
});

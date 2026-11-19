import { freePlanRange, pointsForFinding, rankPriorities, scoreFindings, type ScorableFinding } from '@vero/rules';
import { PLAN_ENTITLEMENTS } from '@vero/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config';
import { planOf } from '../src/modules/plans/service';
import { addMember, errorOf, startHarness, testEnv, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, fileDocument, GB_ANSWERS, makeStaff, MISSING_ID, overview, scanNow, scannedCompany, setPlan, type CompanyBody } from './support/product';

interface Issue {
  ruleKey: string;
  headline: string;
  points: number | null;
  severity: string;
  severityWord: string;
  outcome: string;
  outcomeWord: string;
  layer: number;
  country: string;
  howWeKnow: string[];
}
interface IssueList {
  issues: Issue[];
  total: number;
  lockedCount: number;
  passedCount: number | null;
  score: { kind: string; value?: number; low?: number; high?: number };
}

/** The real stored findings, for checking the API against the rules package itself. */
async function storedFindings(h: Harness, companyId: string): Promise<(ScorableFinding & { rule_id: string })[]> {
  const { rows } = await h.admin.query<{ rule_key: string; layer: number; outcome: ScorableFinding['outcome']; severity: ScorableFinding['severity']; scored: boolean; free_plan_evidence: boolean; detail: { due_on: string | null; cost_of_delay?: ScorableFinding['cost_of_delay'] } }>(
    `SELECT f.rule_key, f.layer, f.outcome, f.severity, f.scored, f.free_plan_evidence, f.detail FROM finding f JOIN scan s ON s.id = f.scan_id
     WHERE f.company_id = $1 AND s.finalised_seq = (SELECT max(finalised_seq) FROM scan WHERE company_id = $1)`,
    [companyId],
  );
  return rows.map((row) => ({
    rule_id: row.rule_key,
    layer: row.layer,
    outcome: row.outcome,
    severity: row.severity,
    scored: row.scored,
    free_plan_evidence: row.free_plan_evidence,
    due_on: row.detail.due_on,
    ...(row.detail.cost_of_delay ? { cost_of_delay: row.detail.cost_of_delay } : {}),
  }));
}

describe('results on a paid plan', () => {
  let h: Harness;
  let owner: SignedIn;
  let company: CompanyBody;

  const issues = (query = '', who = owner, id = company.id) => h.request('GET', `/v1/companies/${id}/issues${query}`, { cookie: who.cookie });

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    company = await scannedCompany(h, owner, { legalName: 'Kestrel Pay UK Ltd', registrationNumber: 'R-1' });
  });
  afterAll(() => h.close());

  it('the overview has a score, status word, six areas, next action, deadlines and review progress', async () => {
    const body = await overview(h, owner, company.id);
    expect(body.score.kind).toBe('exact');
    expect(['Healthy', 'Early read', 'Needs work', 'At risk']).toContain(body.statusWord);
    expect(body.areas.map((area) => area.name)).toEqual(['Company foundations', 'Intellectual property', 'Compliance', 'Contracts', 'Fundraising', 'AI and data']);
    expect(body.areas.every((area) => !area.locked)).toBe(true);
    expect(body.nextAction?.points).toBeGreaterThanOrEqual(0);
    expect(body).not.toHaveProperty('reviewProgress');
    expect(body.topDeadlines.length).toBeGreaterThan(0);
    expect(body.rulePacks).toEqual([{ jurisdiction: 'GB', version: expect.any(String) as string, status: 'draft', mode: 'full' }]);
    expect(body.methodVersion).toBe('2026.11-draft.7');
  });

  it('the score and points are exactly what the rules package calculates', async () => {
    const findings = await storedFindings(h, company.id);
    const expected = scoreFindings(findings);
    const body = await overview(h, owner, company.id);
    expect(body.score.value).toBe(expected.overall);
    for (const layer of expected.layers) {
      expect(body.areas.find((area) => area.layer === layer.layer)?.score).toBe(layer.score);
    }
    const list = (await issues()).json<IssueList>();
    const ranked = rankPriorities(findings, new Date(), Number.POSITIVE_INFINITY);
    expect(list.issues.map((issue) => issue.ruleKey)).toEqual(ranked.map((item) => item.finding.rule_id));
    for (const issue of list.issues.slice(0, 10)) {
      expect(issue.points).toBe(pointsForFinding(issue.ruleKey, findings));
    }
  });

  it('an open critical finding caps its area at 49', async () => {
    const said = await createCompany(h, owner, { legalName: 'Said No Ltd' });
    await answer(h, owner, said.id, { ...GB_ANSWERS, ip_founders_signed: false });
    await scanNow(h, owner, said.id);
    const body = await overview(h, owner, said.id);
    const findings = await storedFindings(h, said.id);
    const layers = new Set(findings.filter((item) => item.severity === 'critical' && item.scored && (item.outcome === 'gap' || item.outcome === 'defect')).map((item) => item.layer));
    expect(layers.size).toBeGreaterThan(0);
    for (const layer of layers) expect(body.areas.find((area) => area.layer === layer)?.score).toBeLessThanOrEqual(49);
  });

  it('lists all issues in plain words with filters', async () => {
    const all = (await issues()).json<IssueList>();
    expect(all.issues.length).toBeGreaterThan(5);
    expect(all.lockedCount).toBe(0);
    expect(all.passedCount).toBeGreaterThan(0);
    for (const issue of all.issues) {
      expect(['Urgent', 'Important', 'Worth doing']).toContain(issue.severityWord);
      expect(issue.outcomeWord).toBe('Needs fixing');
      expect(JSON.stringify(issue)).not.toMatch(/Tier \d/);
    }
    const urgent = (await issues('?severity=critical')).json<IssueList>();
    expect(urgent.issues.every((issue) => issue.severity === 'critical')).toBe(true);
    const layer2 = (await issues('?layer=2')).json<IssueList>();
    expect(layer2.issues.every((issue) => issue.layer === 2)).toBe(true);
    expect((await issues('?country=NG')).json<IssueList>().issues).toEqual([]);
    expect((await issues('?country=GB')).json<IssueList>().issues.length).toBe(all.issues.length);
    const passed = (await issues('?outcome=passed')).json<IssueList>();
    expect(passed.issues.every((issue) => issue.outcome === 'pass')).toBe(true);
    const toCheck = (await issues('?outcome=to_check')).json<IssueList>();
    expect(toCheck.issues.every((issue) => issue.outcome === 'verify' && issue.outcomeWord === 'Not checked yet')).toBe(true);
    expect(toCheck.issues.length).toBeGreaterThan(0);
  });

  it.each([
    ['?layer=9'],
    ['?layer=x'],
    ['?severity=bad'],
    ['?outcome=bad'],
    ['?scope=everyone'],
  ])('refuses the filter %s', async (query) => {
    const response = await issues(query);
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('invalid_input');
  });

  it('one issue has what is missing, why, what if left, the fix, how we know and calculated points', async () => {
    const response = await h.request('GET', `/v1/companies/${company.id}/issues/GB.DP.ICO_FEE`, { cookie: owner.cookie });
    expect(response.statusCode).toBe(200);
    const issue = response.json<Issue & { missing: string; why: string; ifLeft: string; fix: string; law: unknown[]; projection: { from: number; to: number }; rulePackVersion: string; notLegalAdvice: string }>();
    expect(issue.headline).toBe("We can't find Kestrel Pay UK Ltd on the ICO register");
    for (const text of [issue.missing, issue.why, issue.ifLeft, issue.fix]) expect(text.length).toBeGreaterThan(8);
    expect(issue.howWeKnow.join(' ')).toMatch(/ICO register.*sample data/);
    expect(issue.howWeKnow.join(' ')).not.toMatch(/Tier/);
    expect(issue.projection.to - issue.projection.from).toBe(issue.points);
    const findings = await storedFindings(h, company.id);
    expect(issue.points).toBe(pointsForFinding('GB.DP.ICO_FEE', findings));
    expect(issue.notLegalAdvice).toMatch(/not legal advice/);
    expect(issue.rulePackVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('a rule not reviewed yet says so, in words with no lawyer, and is not scored', async () => {
    const list = (await issues('?outcome=to_check')).json<IssueList>();
    const details = await Promise.all(
      list.issues.slice(0, 40).map(async (item) =>
        (await h.request('GET', `/v1/companies/${company.id}/issues/${item.ruleKey}`, { cookie: owner.cookie })).json<{ reasonWords: string | null }>(),
      ),
    );
    expect(details.some((item) => item.reasonWords?.includes("how this check works hasn't been confirmed"))).toBe(true);
    for (const item of details) {
      expect(item.reasonWords).toBeTruthy();
      expect(item.reasonWords).not.toMatch(/lawyer/i);
    }
  });

  it('one area', async () => {
    const response = await h.request('GET', `/v1/companies/${company.id}/areas/2`, { cookie: owner.cookie });
    expect(response.statusCode).toBe(200);
    const area = response.json<{ name: string; toFix: Issue[]; inGoodShape: Issue[]; capped: boolean; cappedExplanation: string | null }>();
    expect(area.name).toBe('Intellectual property');
    expect(area.toFix.every((issue) => issue.layer === 2)).toBe(true);
    if (area.capped) expect(area.cappedExplanation).toMatch(/below 50/);
    expect((await h.request('GET', `/v1/companies/${company.id}/areas/7`, { cookie: owner.cookie })).statusCode).toBe(400);
  });

  it('"what if I fix these" adds up, using the same calculation', async () => {
    const list = (await issues()).json<IssueList>();
    const chosen = list.issues.slice(0, 2).map((issue) => issue.ruleKey);
    const response = await h.request('POST', `/v1/companies/${company.id}/projection`, { cookie: owner.cookie, body: { ruleKeys: chosen } });
    expect(response.statusCode).toBe(200);
    const body = response.json<{ current: number; projected: number; gain: number; reachesVerification: boolean }>();
    const findings = await storedFindings(h, company.id);
    expect(body.current).toBe(scoreFindings(findings).overall);
    expect(body.projected).toBe(scoreFindings(findings.map((item) => (chosen.includes(item.rule_id) ? { ...item, outcome: 'pass' as const } : item))).overall);
    expect(body.gain).toBe(body.projected - body.current);
    expect(body.gain).toBeGreaterThan(0);
  });

  it('refuses a projection on anything that is not an open issue', async () => {
    const post = (ruleKeys: unknown) => h.request('POST', `/v1/companies/${company.id}/projection`, { cookie: owner.cookie, body: { ruleKeys } });
    expect((await post([])).statusCode).toBe(400);
    expect((await post('x')).statusCode).toBe(400);
    expect((await post(['GB.NOT.A_RULE'])).statusCode).toBe(404);
    expect((await post(['GB.CORP.STATUS'])).statusCode).toBe(400);
  });

  it('not found, not a member, not signed in', async () => {
    expect((await h.request('GET', `/v1/companies/${MISSING_ID}/overview`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${company.id}/issues/GB.NOT.REAL`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${company.id}/issues/lower.case`, { cookie: owner.cookie })).statusCode).toBe(400);
    expect((await h.request('GET', `/v1/companies/${company.id}/overview`)).statusCode).toBe(401);
  });

  it('a person in another organisation reaches none of it', async () => {
    const stranger = await h.signIn();
    await setPlan(h, stranger.organisationId, 'scale');
    for (const url of ['overview', 'issues', 'issues/GB.DP.ICO_FEE', 'areas/1', 'questionnaire', 'records', 'documents', 'badge', 'shares', 'orders', 'bookings', 'related', 'scans']) {
      const response = await h.request('GET', `/v1/companies/${company.id}/${url}`, { cookie: stranger.cookie });
      expect(response.statusCode, url).toBe(404);
    }
    const projection = await h.request('POST', `/v1/companies/${company.id}/projection`, { cookie: stranger.cookie, body: { ruleKeys: ['GB.DP.ICO_FEE'] } });
    expect(projection.statusCode).toBe(404);
  });

  it('a group view adds the related companies, and two entities can share a rule', async () => {
    const first = await overview(h, owner, company.id);
    const child = await scannedCompany(h, owner, { legalName: 'Kestrel Sub Ltd', parentCompanyId: company.id });
    const group = await h.request('GET', `/v1/companies/${company.id}/issues?scope=group`, { cookie: owner.cookie });
    const list = group.json<Omit<IssueList, 'issues'> & { issues: (Issue & { companyId: string })[] }>();
    expect(new Set(list.issues.map((issue) => issue.companyId))).toEqual(new Set([company.id, child.id]));
    // The same rule, once per entity.
    expect(list.issues.filter((issue) => issue.ruleKey === 'GB.CORP.CONFIRMATION_STATEMENT').length).toBe(2);
    const body = (await h.request('GET', `/v1/companies/${company.id}/overview?scope=group`, { cookie: owner.cookie })).json<{ scope: string; score: { kind: string }; trend: unknown }>();
    expect(body.scope).toBe('group');
    expect(body.score.kind).toBe('exact');
    expect(body.trend).toBeNull();
    // The company's own view hasn't changed.
    expect((await overview(h, owner, company.id)).score).toEqual(first.score);
  });

  it('a score moving up shows as a trend and a notification', async () => {
    const person = await h.signIn();
    await setPlan(h, person.organisationId, 'growth');
    const target = await scannedCompany(h, person, { legalName: 'Trend Ltd' });
    expect((await overview(h, person, target.id)).trend).toBeNull();
    await fileDocument(h, person, target.id, 'gb_founder_ip_assignment');
    const after = await overview(h, person, target.id);
    expect(after.trend?.delta).toBeGreaterThan(0);
    const feed = await h.request('GET', '/v1/notifications?kind=score', { cookie: person.cookie });
    const titles = feed.json<{ notifications: { title: string; body: string }[] }>().notifications;
    expect(titles[0]?.title).toMatch(/Your score went up \d+ points?/);
    expect(titles[0]?.body).toMatch(/after your documents changed/);
    expect(titles.at(-1)?.title).toBe('Your first read is ready');
  });
});

describe('Free plan, enforced on the server', () => {
  let h: Harness;
  let free: SignedIn;
  let company: CompanyBody;

  beforeAll(async () => {
    h = await startHarness();
    free = await h.signIn();
    company = await scannedCompany(h, free, { legalName: 'Kestrel Pay UK Ltd' });
  });
  afterAll(() => h.close());

  it('sends a range, and the exact score appears nowhere in the overview', async () => {
    const response = await h.request('GET', `/v1/companies/${company.id}/overview`, { cookie: free.cookie });
    const body = response.json<{ score: { kind: string; low: number; high: number; value?: number } }>();
    const findings = await storedFindings(h, company.id);
    expect(body.score.kind).toBe('approximate');
    expect(body.score.value).toBeUndefined();
    const range = freePlanRange(findings);
    expect({ low: body.score.low, high: body.score.high }).toEqual({ low: range?.low, high: range?.high });
    expect(body.score.high - body.score.low).toBe(15);
    expect(response.body).not.toContain('"value"');
  });

  it('sends no area scores or counts, so the score cannot be worked back', async () => {
    const body = await overview(h, free, company.id);
    for (const area of body.areas) {
      expect(area).toMatchObject({ score: null, statusWord: null, locked: true, openCount: null, topIssue: null });
    }
    expect(body.nextAction?.points).toBeNull();
    expect(body.trend).toBeNull();
  });

  it('lists the top 3 gaps only, with no points, and gives only a count for the rest', async () => {
    const response = await h.request('GET', `/v1/companies/${company.id}/issues`, { cookie: free.cookie });
    const list = response.json<IssueList>();
    expect(list.issues).toHaveLength(PLAN_ENTITLEMENTS.free.gapLimit ?? 0);
    expect(list.issues.every((issue) => issue.points === null)).toBe(true);
    expect(list.lockedCount).toBeGreaterThan(0);
    expect(list.passedCount).toBeNull();
    const findings = await storedFindings(h, company.id);
    const expected = rankPriorities(findings.filter((item) => item.free_plan_evidence), new Date(), 3);
    expect(list.issues.map((issue) => issue.ruleKey)).toEqual(expected.map((item) => item.finding.rule_id));
  });

  it('asking for more through filters does not help', async () => {
    const top = (await h.request('GET', `/v1/companies/${company.id}/issues`, { cookie: free.cookie })).json<IssueList>().issues.map((issue) => issue.ruleKey);
    for (const query of ['?outcome=all', '?outcome=passed', '?outcome=to_check', '?severity=low', '?layer=4', '?country=GB']) {
      const list = (await h.request('GET', `/v1/companies/${company.id}/issues${query}`, { cookie: free.cookie })).json<IssueList>();
      expect(list.issues.length, query).toBeLessThanOrEqual(3);
      for (const issue of list.issues) expect(top).toContain(issue.ruleKey);
    }
  });

  it('opens a top issue, without points, and refuses any other by its id', async () => {
    const list = (await h.request('GET', `/v1/companies/${company.id}/issues`, { cookie: free.cookie })).json<IssueList>();
    const first = list.issues[0];
    const allowed = await h.request('GET', `/v1/companies/${company.id}/issues/${first?.ruleKey}`, { cookie: free.cookie });
    expect(allowed.statusCode).toBe(200);
    expect(allowed.json<{ points: number | null; projection: unknown }>()).toMatchObject({ points: null, projection: null });

    const { rows } = await h.admin.query<{ rule_key: string }>(`SELECT rule_key FROM finding WHERE company_id = $1 AND outcome IN ('gap', 'defect')`, [company.id]);
    const hidden = rows.map((row) => row.rule_key).filter((key) => !list.issues.some((issue) => issue.ruleKey === key));
    expect(hidden.length).toBeGreaterThan(0);
    for (const key of hidden.slice(0, 5)) {
      const refused = await h.request('GET', `/v1/companies/${company.id}/issues/${key}`, { cookie: free.cookie });
      expect(refused.statusCode).toBe(403);
      expect(errorOf(refused).code).toBe('plan_upgrade_required');
    }
  });

  it('refuses areas, projections, upload, sharing and the badge', async () => {
    const area = await h.request('GET', `/v1/companies/${company.id}/areas/1`, { cookie: free.cookie });
    expect(area.statusCode).toBe(403);
    expect(errorOf(area).code).toBe('plan_upgrade_required');
    const projection = await h.request('POST', `/v1/companies/${company.id}/projection`, { cookie: free.cookie, body: { ruleKeys: ['GB.DP.ICO_FEE'] } });
    expect(errorOf(projection).code).toBe('plan_upgrade_required');
    const share = await h.request('POST', `/v1/companies/${company.id}/shares`, { cookie: free.cookie, body: {} });
    expect(errorOf(share).code).toBe('plan_upgrade_required');
    const badge = await h.request('POST', `/v1/companies/${company.id}/badge`, { cookie: free.cookie });
    expect(badge.statusCode).toBe(409);
    const status = (await h.request('GET', `/v1/companies/${company.id}/badge`, { cookie: free.cookie })).json<{ requirements: { currentScore: number | null; openUrgent: number | null } }>();
    expect(status.requirements).toMatchObject({ currentScore: null, openUrgent: null });
  });

  it('notifications do not give away the exact score', async () => {
    const person = await h.signIn();
    const target = await scannedCompany(h, person, { legalName: 'Free Notified Ltd' });
    await h.request('PATCH', `/v1/companies/${target.id}/questionnaire`, { cookie: person.cookie, body: { answers: { ip_founders_signed: false, has_contractors: false, sectors: ['payments'] } } });
    await h.queue.drain();
    const feed = await h.request('GET', '/v1/notifications', { cookie: person.cookie });
    const text = JSON.stringify(feed.json());
    expect(text).not.toMatch(/Your score went/);
    expect(text).toMatch(/first read/);
  });

  it('search returns only what the plan shows', async () => {
    const list = (await h.request('GET', `/v1/companies/${company.id}/issues`, { cookie: free.cookie })).json<IssueList>();
    const { rows } = await h.admin.query<{ headline: string; rule_key: string }>(
      `SELECT detail->>'headline' AS headline, rule_key FROM finding WHERE company_id = $1 AND outcome IN ('gap', 'defect')`,
      [company.id],
    );
    const hidden = rows.find((row) => !list.issues.some((issue) => issue.ruleKey === row.rule_key));
    const search = await h.request('GET', `/v1/search?q=${encodeURIComponent(hidden?.headline ?? '')}`, { cookie: free.cookie });
    expect(search.statusCode).toBe(200);
    expect(search.json<{ issues: { ruleKey: string }[] }>().issues.map((issue) => issue.ruleKey)).not.toContain(hidden?.rule_key);
    const top = list.issues[0];
    const found = await h.request('GET', `/v1/search?q=${encodeURIComponent(top?.headline ?? '')}`, { cookie: free.cookie });
    expect(found.json<{ issues: { ruleKey: string }[] }>().issues.map((issue) => issue.ruleKey)).toContain(top?.ruleKey);
  });

  it('upgrading through an admin reveals the full result, from the data already stored', async () => {
    const person = await h.signIn();
    const target = await scannedCompany(h, person, { legalName: 'Upgrade Ltd' });
    const admin = await makeStaff(h, 'admin');
    const change = await h.request('PATCH', `/v1/admin/organisations/${person.organisationId}/plan`, { cookie: admin.cookie, body: { plan: 'growth' } });
    expect(change.statusCode).toBe(200);
    await h.queue.drain();
    const body = await overview(h, person, target.id);
    expect(body.plan).toBe('growth');
    expect(body.score.kind).toBe('exact');
    expect(body.areas[0]?.locked).toBe(false);
  });
});

describe('plan entitlements', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('match the product document', () => {
    expect(PLAN_ENTITLEMENTS.free).toMatchObject({ exactScore: false, gapLimit: 3, vault: false });
    expect(PLAN_ENTITLEMENTS.growth).toMatchObject({ exactScore: true, gapLimit: null, vault: true, fullReport: true, priorityList: true, rulesChangeAlerts: false });
    expect(PLAN_ENTITLEMENTS.scale).toMatchObject({ rulesChangeAlerts: true, deadlineWatching: true, annualVerification: true });
  });

  it('lists the plans with no invented price', async () => {
    const person = await h.signIn();
    const response = await h.request('GET', '/v1/plans', { cookie: person.cookie });
    const body = response.json<{ current: string; plans: { code: string; priceMinor: number | null; currency: string | null }[] }>();
    expect(body.current).toBe('free');
    expect(body.plans.map((plan) => plan.code)).toEqual(['free', 'growth', 'scale']);
    for (const plan of body.plans) expect(plan).toMatchObject({ priceMinor: null, currency: null });
    expect((await h.request('GET', '/v1/plans')).statusCode).toBe(401);
  });

  it('only a platform admin can change a plan, not an owner, a lawyer or an organisation admin', async () => {
    const owner = await h.signIn();
    const orgAdmin = await addMember(h, owner, 'admin');
    const lawyer = await makeStaff(h, 'lawyer');
    const url = `/v1/admin/organisations/${owner.organisationId}/plan`;
    for (const who of [owner, orgAdmin, lawyer]) {
      const refused = await h.request('PATCH', url, { cookie: who.cookie, body: { plan: 'scale' } });
      expect(refused.statusCode).toBe(403);
    }
    expect((await h.request('PATCH', url, { body: { plan: 'scale' } })).statusCode).toBe(401);
    const { rows } = await h.admin.query<{ plan_id: string | null }>('SELECT plan_id FROM organisation WHERE id = $1', [owner.organisationId]);
    expect(rows[0]?.plan_id).toBeNull();
  });

  it('checks input and existence, and audits the change', async () => {
    const admin = await makeStaff(h, 'admin');
    const owner = await h.signIn();
    expect((await h.request('PATCH', `/v1/admin/organisations/${owner.organisationId}/plan`, { cookie: admin.cookie, body: { plan: 'platinum' } })).statusCode).toBe(400);
    expect((await h.request('PATCH', `/v1/admin/organisations/${MISSING_ID}/plan`, { cookie: admin.cookie, body: { plan: 'scale' } })).statusCode).toBe(404);
    const ok = await h.request('PATCH', `/v1/admin/organisations/${owner.organisationId}/plan`, { cookie: admin.cookie, body: { plan: 'scale' } });
    expect(ok.json()).toEqual({ organisationId: owner.organisationId, plan: 'scale' });
    const { rows } = await h.admin.query<{ actor_id: string }>(`SELECT actor_id FROM audit_log WHERE organisation_id = $1 AND action = 'plan.changed'`, [owner.organisationId]);
    expect(rows[0]?.actor_id).toBe(admin.userId);
  });

  it('PLAN_OVERRIDE works in development and is refused in production', async () => {
    const production = {
      NODE_ENV: 'production',
      API_BASE_URL: 'https://api.vero.example',
      WEB_BASE_URL: 'https://app.vero.example',
      ALLOWED_ORIGINS: 'https://app.vero.example',
      DATABASE_URL: 'postgres://app:real@db.example/vero',
      APP_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
      RESEND_API_KEY: 'x',
      VALKEY_URL: 'redis://v',
      SPACES_ENDPOINT: 'https://s',
      SPACES_REGION: 'r',
      SPACES_BUCKET: 'b',
      SPACES_KEY: 'k',
      SPACES_SECRET: 's',
    };
    expect(() => loadConfig(production)).not.toThrow();
    expect(() => loadConfig({ ...production, PLAN_OVERRIDE: 'scale' })).toThrow(/PLAN_OVERRIDE is not allowed/);
    expect(() => loadConfig(testEnv({ PLAN_OVERRIDE: 'platinum' }))).toThrow();

    const local = await startHarness({ PLAN_OVERRIDE: 'growth' });
    try {
      const person = await local.signIn();
      const company = await scannedCompany(local, person, { legalName: 'Override Ltd' });
      expect((await overview(local, person, company.id)).plan).toBe('growth');
    } finally {
      await local.close();
    }
    // If it ever slipped through, the plan lookup still ignores it in production.
    const fakeTx = { select: () => ({ from: () => ({ innerJoin: () => ({ where: () => Promise.resolve([]) }) }) }) };
    await expect(planOf(fakeTx as never, MISSING_ID, { planOverride: 'scale', nodeEnv: 'production' })).resolves.toBe('free');
  });
});

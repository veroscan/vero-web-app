import { freePlanRange, scoreFindings, SCORING, type ScorableFinding } from '@vero/rules';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';
import { addMember, errorOf, sessionCookieFrom, startHarness, uniqueEmail, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, fileDocument, GB_ANSWERS, makeStaff, MISSING_ID, overview, scanNow, scannedCompany, setPlan, type CompanyBody } from './support/product';

/** A document-only rule that is scored, so "we don't have this" can be said about it. */
const DOC_RULE = 'GB.IP.NDA';
const DOC_SLOT = 'gb_nda';

const stored = async (h: Harness, companyId: string, ruleKey: string) =>
  (
    await h.admin.query<{ outcome: string; scored: boolean; reason: string | null; declared: string }>(
      `SELECT f.outcome, f.scored, f.detail->>'reason' AS reason, f.detail->>'declared_missing' AS declared FROM finding f JOIN scan s ON s.id = f.scan_id
       WHERE f.company_id = $1 AND f.rule_key = $2 AND s.finalised_seq = (SELECT max(finalised_seq) FROM scan WHERE company_id = $1)`,
      [companyId, ruleKey],
    )
  ).rows[0];

async function scorable(h: Harness, companyId: string): Promise<(ScorableFinding & { rule_id: string })[]> {
  const { rows } = await h.admin.query<{ rule_key: string; layer: number; outcome: ScorableFinding['outcome']; severity: ScorableFinding['severity']; scored: boolean; free_plan_evidence: boolean }>(
    `SELECT f.rule_key, f.layer, f.outcome, f.severity, f.scored, f.free_plan_evidence FROM finding f JOIN scan s ON s.id = f.scan_id
     WHERE f.company_id = $1 AND s.finalised_seq = (SELECT max(finalised_seq) FROM scan WHERE company_id = $1)`,
    [companyId],
  );
  return rows.map((row) => ({ rule_id: row.rule_key, layer: row.layer, outcome: row.outcome, severity: row.severity, scored: row.scored, free_plan_evidence: row.free_plan_evidence }));
}

describe('empty document slots', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  const ANSWERS = { ...GB_ANSWERS, ip_founders_signed: true, ip_contractors_signed: true, ip_employees_signed: true };

  async function on(plan: 'free' | 'growth' | 'scale'): Promise<{ who: SignedIn; company: CompanyBody }> {
    const who = await h.signIn();
    await setPlan(h, who.organisationId, plan);
    const company = await createCompany(h, who, { legalName: 'Same Company Ltd' });
    await answer(h, who, company.id, ANSWERS);
    await scanNow(h, who, company.id);
    return { who, company };
  }

  it('an empty paid account scores about the same as the same company on Free', async () => {
    const free = await on('free');
    const growth = await on('growth');
    const scale = await on('scale');
    const freeBody = await overview(h, free.who, free.company.id);
    const growthBody = await overview(h, growth.who, growth.company.id);
    const scaleBody = await overview(h, scale.who, scale.company.id);
    expect(freeBody.score.kind).toBe('approximate');
    expect(growthBody.score.kind).toBe('exact');
    expect(growthBody.score.value).toBe(scaleBody.score.value);
    // The same findings underneath, whatever the plan.
    expect((await scorable(h, growth.company.id)).map((item) => [item.rule_id, item.outcome]).sort()).toEqual(
      (await scorable(h, free.company.id)).map((item) => [item.rule_id, item.outcome]).sort(),
    );
    expect(growthBody.score.value ?? -1).toBeGreaterThanOrEqual(freeBody.score.low ?? 0);
    expect(growthBody.score.value ?? 101).toBeLessThanOrEqual(freeBody.score.high ?? 100);
  });

  it('upgrading alone never lowers a score, and changes no finding', async () => {
    const { who, company } = await on('free');
    const before = await scorable(h, company.id);
    const range = freePlanRange(before);
    const admin = await makeStaff(h, 'admin');
    for (const plan of ['growth', 'scale', 'free', 'growth']) {
      const change = await h.request('PATCH', `/v1/admin/organisations/${who.organisationId}/plan`, { cookie: admin.cookie, body: { plan } });
      expect(change.statusCode).toBe(200);
      await h.queue.drain();
    }
    expect((await scorable(h, company.id)).map((item) => [item.rule_id, item.outcome]).sort()).toEqual(before.map((item) => [item.rule_id, item.outcome]).sort());
    const body = await overview(h, who, company.id);
    expect(body.score.value ?? -1).toBeGreaterThanOrEqual(range?.low ?? 0);
    const scans = await h.admin.query(`SELECT 1 FROM scan WHERE company_id = $1`, [company.id]);
    expect(scans.rows).toHaveLength(1);
  });

  it.each(['free', 'growth'] as const)('on %s, an empty slot is "not checked yet", and says so', async (plan) => {
    const { who, company } = await on(plan);
    expect(await stored(h, company.id, DOC_RULE)).toMatchObject({ outcome: 'verify', scored: false, reason: 'not_seen_yet' });
    if (plan === 'growth') {
      const view = await h.request('GET', `/v1/companies/${company.id}/documents`, { cookie: who.cookie });
      const slot = view.json<{ slots: { key: string; state: string; stateWord: string }[] }>().slots.find((item) => item.key === DOC_SLOT);
      expect(slot).toMatchObject({ state: 'missing', stateWord: 'Not checked yet' });
    }
  });

  it('a no in the questionnaire stays a gap, and a yes stays attested, on any plan', async () => {
    for (const plan of ['free', 'growth'] as const) {
      const who = await h.signIn();
      await setPlan(h, who.organisationId, plan);
      const no = await createCompany(h, who, { legalName: 'Said No Ltd' });
      await answer(h, who, no.id, { ...GB_ANSWERS, ip_contractors_signed: false });
      await scanNow(h, who, no.id);
      expect(await stored(h, no.id, 'GB.IP.CONTRACTOR_ASSIGNMENT')).toMatchObject({ outcome: 'gap', scored: true });
      const yes = await createCompany(h, who, { legalName: 'Said Yes Ltd' });
      await answer(h, who, yes.id, { ...GB_ANSWERS, ip_contractors_signed: true });
      await scanNow(h, who, yes.id);
      expect(await stored(h, yes.id, 'GB.IP.CONTRACTOR_ASSIGNMENT')).toMatchObject({ outcome: 'pass', scored: true });
    }
  });

  it('coverage: what the score rests on, on each plan, and a free read counts what it used out of every check', async () => {
    const free = await on('free');
    const growth = await on('growth');
    const freeFindings = await scorable(h, free.company.id);
    const paidFindings = await scorable(h, growth.company.id);
    const paid = scoreFindings(paidFindings).coverage;
    expect(paid.counted).toBe(paidFindings.filter((item) => ['pass', 'gap', 'defect'].includes(item.outcome)).length);
    expect(paid.total).toBe(paid.counted + paidFindings.filter((item) => item.outcome === 'verify').length);
    expect((await overview(h, growth.who, growth.company.id) as unknown as { coverage: unknown }).coverage).toEqual(paid);

    const usedForRange = freeFindings.filter((item) => item.free_plan_evidence);
    const body = (await overview(h, free.who, free.company.id)) as unknown as { coverage: { counted: number; total: number } };
    expect(body.coverage).toEqual(freePlanRange(freeFindings)?.coverage);
    expect(body.coverage.counted).toBe(usedForRange.filter((item) => ['pass', 'gap', 'defect'].includes(item.outcome)).length);
    expect(body.coverage.total).toBe(scoreFindings(freeFindings).coverage.total);
    expect(body.coverage.counted).toBeLessThan(body.coverage.total);
    // Whichever word it earns, a read on under half the checks can't claim Healthy.
    const word = (body as unknown as { statusWord: string }).statusWord;
    if (body.coverage.counted < body.coverage.total / 2) expect(word).not.toBe('Healthy');

    const snapshot = await h.admin.query<{ coverage: unknown; free_range: { coverage: unknown } }>(`SELECT coverage, free_range FROM score_snapshot WHERE company_id = $1`, [growth.company.id]);
    expect(snapshot.rows[0]?.coverage).toEqual(paid);
    expect(snapshot.rows[0]?.free_range.coverage).toEqual(freePlanRange(paidFindings)?.coverage);
  });

  it('coverage adds up across a group, and on each area', async () => {
    const who = await h.signIn();
    await setPlan(h, who.organisationId, 'growth');
    const parent = await createCompany(h, who, { legalName: 'Group Parent Ltd' });
    await answer(h, who, parent.id, ANSWERS);
    await scanNow(h, who, parent.id);
    const child = await createCompany(h, who, { legalName: 'Group Child Ltd', parentCompanyId: parent.id });
    await answer(h, who, child.id, ANSWERS);
    await scanNow(h, who, child.id);
    const one = scoreFindings(await scorable(h, parent.id)).coverage;
    const two = scoreFindings(await scorable(h, child.id)).coverage;
    const group = (await h.request('GET', `/v1/companies/${parent.id}/overview?scope=group`, { cookie: who.cookie })).json<{ coverage: { counted: number; total: number } }>();
    expect(group.coverage).toEqual({ counted: one.counted + two.counted, total: one.total + two.total });
    const area = (await h.request('GET', `/v1/companies/${parent.id}/areas/3`, { cookie: who.cookie })).json<{ coverage: { counted: number; total: number } }>();
    expect(area.coverage.total).toBeGreaterThan(0);
    const groupArea = (await h.request('GET', `/v1/companies/${parent.id}/areas/3?scope=group`, { cookie: who.cookie })).json<{ coverage: { total: number }; toFix: { companyId: string }[] }>();
    expect(groupArea.coverage.total).toBe(area.coverage.total * 2);
    expect((await h.request('GET', `/v1/companies/${parent.id}/areas/3?scope=everyone`, { cookie: who.cookie })).statusCode).toBe(400);
  });

  it('a projection works across a group, and keeps the same rule on two companies apart', async () => {
    const who = await h.signIn();
    await setPlan(h, who.organisationId, 'growth');
    const parent = await createCompany(h, who, { legalName: 'Kestrel Pay UK Ltd' });
    await answer(h, who, parent.id, ANSWERS);
    await scanNow(h, who, parent.id);
    const child = await createCompany(h, who, { legalName: 'Kestrel Pay UK Ltd', parentCompanyId: parent.id });
    await answer(h, who, child.id, ANSWERS);
    await scanNow(h, who, child.id);
    const post = (query: string, body: unknown) => h.request('POST', `/v1/companies/${parent.id}/projection${query}`, { cookie: who.cookie, body });
    const one = await post('?scope=group', { fixes: [{ companyId: parent.id, ruleKey: 'GB.DP.ICO_FEE' }] });
    const both = await post('?scope=group', { fixes: [{ companyId: parent.id, ruleKey: 'GB.DP.ICO_FEE' }, { companyId: child.id, ruleKey: 'GB.DP.ICO_FEE' }] });
    expect(one.statusCode).toBe(200);
    expect(both.json<{ gain: number }>().gain).toBeGreaterThanOrEqual(one.json<{ gain: number }>().gain);
    // A company outside the group, or a fix on one when asking about one company, isn't found.
    expect((await post('', { fixes: [{ companyId: child.id, ruleKey: 'GB.DP.ICO_FEE' }] })).statusCode).toBe(404);
    expect((await post('?scope=group', { fixes: [{ companyId: MISSING_ID, ruleKey: 'GB.DP.ICO_FEE' }] })).statusCode).toBe(404);
    expect((await post('?scope=group', {})).statusCode).toBe(400);
  });
});

describe('the urgent cap', () => {
  const finding = (rule_id: string, layer: number, severity: ScorableFinding['severity'], outcome: ScorableFinding['outcome']): ScorableFinding => ({
    rule_id,
    layer,
    severity,
    outcome,
    scored: true,
    free_plan_evidence: true,
  });
  /** Everything passes in every layer, apart from what's added. */
  const healthy = [1, 2, 3, 4, 5, 6].flatMap((layer) => [1, 2, 3, 4, 5, 6, 7, 8].map((n) => finding(`L${layer}.${n}`, layer, 'high', 'pass')));

  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('stays below Healthy, and every path agrees', async () => {
    expect(SCORING.overall_critical_cap).toBe(74);
    expect(SCORING.overall_critical_cap).toBeLessThan(SCORING.status.healthy_from);
    const clean = scoreFindings(healthy);
    expect(clean).toMatchObject({ overall: 100, status: 'Healthy', held_by_urgent: false, open_critical: 0 });
    const urgent = scoreFindings([...healthy, finding('L1.U', 1, 'critical', 'gap')]);
    expect(urgent).toMatchObject({ overall: 74, status: 'Needs work', held_by_urgent: true, open_critical: 1 });
    // The layer cap is still there.
    expect(urgent.layers[0]?.score).toBeLessThanOrEqual(100);
  });

  it('a Free range respects it, and can read 65 to 74', () => {
    const range = freePlanRange([...healthy, finding('L1.U', 1, 'critical', 'gap')]);
    expect(range).toMatchObject({ low: 65, high: 74, held_by_urgent: true });
    expect(freePlanRange(healthy)).toMatchObject({ high: 100, held_by_urgent: false });
    // No urgent issue in what the range used, so nothing to hold it.
    const notUsed = freePlanRange([...healthy, { ...finding('L1.U', 1, 'critical', 'gap'), free_plan_evidence: false }]);
    expect(notUsed?.held_by_urgent).toBe(false);
  });

  it('through the API: the score, the word and the flag, for a company whose only trouble is urgent', async () => {
    const who = await h.signIn();
    await setPlan(h, who.organisationId, 'growth');
    const company = await createCompany(h, who, { legalName: 'Held Ltd' });
    await answer(h, who, company.id, { ...GB_ANSWERS, ip_founders_signed: false });
    await scanNow(h, who, company.id);
    const findings = await scorable(h, company.id);
    const expected = scoreFindings(findings);
    const body = (await overview(h, who, company.id)) as unknown as { score: { value: number }; statusWord: string; heldByUrgent: boolean };
    expect(body.score.value).toBe(expected.overall);
    expect(body.score.value).toBeLessThanOrEqual(74);
    expect(body.statusWord).not.toBe('Healthy');
    expect(body.heldByUrgent).toBe(expected.held_by_urgent);

    const snapshot = await h.admin.query<{ overall: string; held_by_urgent: boolean }>(`SELECT overall, held_by_urgent FROM score_snapshot WHERE company_id = $1`, [company.id]);
    expect(Math.round(Number(snapshot.rows[0]?.overall))).toBe(expected.overall);
    expect(snapshot.rows[0]?.held_by_urgent).toBe(expected.held_by_urgent);

    const share = await h.request('POST', `/v1/companies/${company.id}/shares`, { cookie: who.cookie, body: {} });
    const report = await h.request('GET', `/v1/public/reports/${encodeURIComponent(share.json<{ token: string }>().token)}`);
    expect(report.json()).toMatchObject({ score: expected.overall, heldByUrgent: expected.held_by_urgent, coverage: expected.coverage });
    expect(report.json<{ statusWord: string }>().statusWord).not.toBe('Healthy');
  });

  it('with two urgent issues open, fixing one can show no points, and says why', async () => {
    const two = [...healthy, finding('L1.U', 1, 'critical', 'gap'), finding('L2.U', 2, 'critical', 'gap')];
    const { pointsForFinding } = await import('@vero/rules');
    expect(scoreFindings(two).overall).toBe(74);
    expect(pointsForFinding('L1.U', two)).toBe(0);
    expect(pointsForFinding('L1.U', [...healthy, finding('L1.U', 1, 'critical', 'gap')])).toBe(26);

    const who = await h.signIn();
    await setPlan(h, who.organisationId, 'growth');
    const company = await createCompany(h, who, { legalName: 'Two Urgent Ltd' });
    await answer(h, who, company.id, { ...GB_ANSWERS, ip_founders_signed: false, ip_contractors_signed: false });
    await scanNow(h, who, company.id);
    const list = (await h.request('GET', `/v1/companies/${company.id}/issues`, { cookie: who.cookie })).json<{ issues: { ruleKey: string; points: number; pointsHeldByUrgent: boolean; title: string }[] }>();
    for (const issue of list.issues) {
      expect(issue.pointsHeldByUrgent).toBe(issue.points === 0);
      expect(issue.title.length).toBeGreaterThan(2);
    }
  });
});

describe('"We don\'t have this"', () => {
  let h: Harness;
  let owner: SignedIn;
  let company: CompanyBody;
  const url = (ruleKey = DOC_RULE, id = company.id) => `/v1/companies/${id}/issues/${ruleKey}/missing`;

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    company = await scannedCompany(h, owner, { legalName: 'Statements Ltd' });
  });
  afterAll(() => h.close());

  const issue = async (ruleKey = DOC_RULE) =>
    (await h.request('GET', `/v1/companies/${company.id}/issues/${ruleKey}`, { cookie: owner.cookie })).json<{ outcome: string; canDeclareMissing: boolean; declaredMissing: boolean; howWeKnow: string[] }>();

  it('offers it only on a document-only check nobody has seen', async () => {
    expect(await issue()).toMatchObject({ outcome: 'verify', canDeclareMissing: true, declaredMissing: false });
    // Reads a register, so the question doesn't arise.
    expect(await issue('GB.CORP.STATUS')).toMatchObject({ canDeclareMissing: false });
  });

  it('turns it into a real gap and re-scores, and the undo puts it back', async () => {
    const before = await overview(h, owner, company.id);
    const said = await h.request('POST', url(), { cookie: owner.cookie });
    expect(said.statusCode).toBe(200);
    expect(said.json()).toEqual({ ruleKey: DOC_RULE, declaredMissing: true, rescoreQueued: true });
    await h.queue.drain();
    const gap = await issue();
    expect(gap).toMatchObject({ outcome: 'gap', canDeclareMissing: false, declaredMissing: true });
    expect(gap.howWeKnow).toContain("You told us you don't have this");
    expect(gap.howWeKnow).not.toContain("We haven't seen this yet");
    const after = await overview(h, owner, company.id);
    expect(after.score.value ?? 100).toBeLessThan(before.score.value ?? 0);
    const view = (await h.request('GET', `/v1/companies/${company.id}/documents`, { cookie: owner.cookie })).json<{ slots: { key: string; state: string; stateWord: string }[] }>();
    expect(view.slots.find((slot) => slot.key === DOC_SLOT)).toMatchObject({ state: 'declared_missing', stateWord: "You don't have this" });

    // Saying it twice is fine, and leaves one row.
    expect((await h.request('POST', url(), { cookie: owner.cookie })).statusCode).toBe(200);
    await h.queue.drain();
    const rows = await h.admin.query<{ stated_by: string }>(`SELECT stated_by FROM missing_document_statement WHERE company_id = $1`, [company.id]);
    expect(rows.rows).toEqual([{ stated_by: owner.userId }]);

    const undone = await h.request('DELETE', url(), { cookie: owner.cookie });
    expect(undone.json()).toEqual({ ruleKey: DOC_RULE, declaredMissing: false, rescoreQueued: true });
    await h.queue.drain();
    expect(await issue()).toMatchObject({ outcome: 'verify', canDeclareMissing: true, declaredMissing: false });
    expect((await overview(h, owner, company.id)).score).toEqual(before.score);
  });

  it('is audited, with who and which rule', async () => {
    const person = await h.signIn();
    await setPlan(h, person.organisationId, 'growth');
    const target = await scannedCompany(h, person, { legalName: 'Audit Statement Ltd' });
    await h.request('POST', url(DOC_RULE, target.id), { cookie: person.cookie });
    await h.request('DELETE', url(DOC_RULE, target.id), { cookie: person.cookie });
    await h.queue.drain();
    const { rows } = await h.admin.query<{ action: string; actor_id: string; metadata: { ruleKey: string } }>(
      `SELECT action, actor_id, metadata FROM audit_log WHERE target = $1 AND action LIKE 'document.%declared%' ORDER BY seq`,
      [target.id],
    );
    expect(rows.map((row) => row.action)).toEqual(['document.declared_missing', 'document.undeclared_missing']);
    for (const row of rows) expect(row).toMatchObject({ actor_id: person.userId, metadata: { ruleKey: DOC_RULE } });
  });

  it('counts on Free too', async () => {
    const person = await h.signIn();
    const target = await scannedCompany(h, person, { legalName: 'Free Statement Ltd' });
    expect((await h.request('POST', url(DOC_RULE, target.id), { cookie: person.cookie })).statusCode).toBe(200);
    await h.queue.drain();
    expect(await stored(h, target.id, DOC_RULE)).toMatchObject({ outcome: 'gap', scored: true });
    const findings = await scorable(h, target.id);
    expect(findings.find((item) => item.rule_id === DOC_RULE)?.free_plan_evidence).toBe(true);
  });

  it('uploading the document wins, and clears the statement', async () => {
    const person = await h.signIn();
    await setPlan(h, person.organisationId, 'growth');
    const target = await scannedCompany(h, person, { legalName: 'Doc Wins Ltd' });
    await h.request('POST', url(DOC_RULE, target.id), { cookie: person.cookie });
    await h.queue.drain();
    await fileDocument(h, person, target.id, DOC_SLOT);
    expect(await stored(h, target.id, DOC_RULE)).toMatchObject({ outcome: 'pass' });
    const { rows } = await h.admin.query(`SELECT 1 FROM missing_document_statement WHERE company_id = $1`, [target.id]);
    expect(rows).toEqual([]);
    const audit = await h.admin.query(`SELECT 1 FROM audit_log WHERE target = $1 AND action = 'document.statement_cleared'`, [target.id]);
    expect(audit.rows).toHaveLength(1);

    // And once a document is there, the statement is refused.
    const refused = await h.request('POST', url(DOC_RULE, target.id), { cookie: person.cookie });
    expect(refused.statusCode).toBe(409);
    expect(errorOf(refused).code).toBe('invalid_state');
  });

  it('refuses anything but a document-only rule that applies to this company', async () => {
    // Registers decide this one.
    expect((await h.request('POST', url('GB.CORP.STATUS'), { cookie: owner.cookie })).statusCode).toBe(400);
    // A rule that's real, but not in this company's packs.
    expect((await h.request('POST', url('NG.IP.FOUNDER_ASSIGNMENT'), { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('POST', url('GB.NOT.REAL'), { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('POST', url('lower.case'), { cookie: owner.cookie })).statusCode).toBe(400);
    expect((await h.request('POST', url(DOC_RULE, 'not-an-id'), { cookie: owner.cookie })).statusCode).toBe(400);
    expect((await h.request('POST', url(DOC_RULE, MISSING_ID), { cookie: owner.cookie })).statusCode).toBe(404);
    // Nothing to undo.
    expect((await h.request('DELETE', url('GB.IP.OPEN_SOURCE'), { cookie: owner.cookie })).statusCode).toBe(404);
  });

  it('permissions and tenancy, through the API', async () => {
    expect((await h.request('POST', url())).statusCode).toBe(401);
    expect((await h.request('DELETE', url())).statusCode).toBe(401);
    const lawyer = await addMember(h, owner, 'lawyer');
    expect((await h.request('POST', url(), { cookie: lawyer.cookie })).statusCode).toBe(403);
    const member = await addMember(h, owner, 'member');
    expect((await h.request('POST', url(), { cookie: member.cookie })).statusCode).toBe(200);
    await h.queue.drain();

    const stranger = await h.signIn();
    expect((await h.request('POST', url(), { cookie: stranger.cookie })).statusCode).toBe(404);
    expect((await h.request('DELETE', url(), { cookie: stranger.cookie })).statusCode).toBe(404);
    const { rows } = await h.admin.query(`SELECT 1 FROM missing_document_statement WHERE company_id = $1`, [company.id]);
    expect(rows).toHaveLength(1);
    expect((await h.request('DELETE', url(), { cookie: member.cookie })).statusCode).toBe(200);
    await h.queue.drain();
  });

  it('tenancy, directly in the database as the API role', async () => {
    const person = await h.signIn();
    await setPlan(h, person.organisationId, 'growth');
    const theirs = await scannedCompany(h, person, { legalName: 'Theirs Ltd' });
    await h.request('POST', url(DOC_RULE, theirs.id), { cookie: person.cookie });
    await h.queue.drain();

    const app = new pg.Client({ connectionString: inject('appUrl') });
    await app.connect();
    try {
      expect((await app.query('SELECT * FROM missing_document_statement')).rows).toEqual([]);
      await app.query('BEGIN');
      await app.query(`SELECT set_config('app.organisation_id', $1, true)`, [owner.organisationId]);
      expect((await app.query('SELECT 1 FROM missing_document_statement WHERE company_id = $1', [theirs.id])).rows).toEqual([]);
      expect((await app.query('DELETE FROM missing_document_statement WHERE company_id = $1', [theirs.id])).rowCount).toBe(0);
      await app.query('SAVEPOINT a');
      const planted = await app
        .query(`INSERT INTO missing_document_statement (organisation_id, company_id, rule_key) VALUES ($1, $2, 'GB.X')`, [person.organisationId, theirs.id])
        .then(() => null, (reason: Error & { code?: string }) => reason);
      expect(planted?.code).toBe('42501');
      await app.query('ROLLBACK TO SAVEPOINT a');
      const crossed = await app
        .query(`INSERT INTO missing_document_statement (organisation_id, company_id, rule_key) VALUES ($1, $2, 'GB.X')`, [owner.organisationId, theirs.id])
        .then(() => null, (reason: Error & { code?: string }) => reason);
      expect(crossed?.code).toBe('23503');
      await app.query('ROLLBACK');
    } finally {
      await app.end();
    }
  });
});

describe('backend gaps closed', () => {
  let h: Harness;
  let owner: SignedIn;
  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
  });
  afterAll(() => h.close());

  it('a sign-in link says whether it was used or has expired, and a made-up one says neither', async () => {
    const email = uniqueEmail('link');
    const token = await h.requestLink(email);
    const first = await h.request('POST', '/v1/auth/magic-link/verify', { body: { token } });
    expect(sessionCookieFrom(first)).toBeTruthy();
    const used = await h.request('POST', '/v1/auth/magic-link/verify', { body: { token } });
    expect(used.json()).toMatchObject({ error: { code: 'magic_link_invalid', reason: 'used' } });

    const expiring = await h.requestLink(uniqueEmail('old'));
    h.setNow(new Date(Date.now() + 20 * 60_000));
    try {
      const expired = await h.request('POST', '/v1/auth/magic-link/verify', { body: { token: expiring } });
      expect(expired.json()).toMatchObject({ error: { code: 'magic_link_invalid', reason: 'expired' } });
    } finally {
      h.setNow(null);
    }
    const madeUp = await h.request('POST', '/v1/auth/magic-link/verify', { body: { token: 'a'.repeat(43) } });
    expect(errorOf(madeUp).code).toBe('magic_link_invalid');
    expect(madeUp.json<{ error: { reason?: string } }>().error.reason).toBeUndefined();
  });

  it('passed checks have their own title', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Titles Ltd' });
    const list = (await h.request('GET', `/v1/companies/${company.id}/issues?outcome=passed`, { cookie: owner.cookie })).json<{ issues: { title: string; headline: string }[] }>();
    expect(list.issues.length).toBeGreaterThan(0);
    for (const issue of list.issues) expect(issue.title).not.toBe(issue.headline);
  });

  it('emails when a scan finishes, once, without a score in it', async () => {
    const person = await h.signIn();
    await setPlan(h, person.organisationId, 'growth');
    await scannedCompany(h, person, { legalName: 'Mailed Ltd' });
    const { rows } = await h.admin.query<{ subject: string; body_text: string; template: string }>(`SELECT subject, body_text, template FROM outbox WHERE to_email = $1 AND template = 'scan-result'`, [person.email]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.subject).toBe('Your scan of Mailed Ltd is ready');
    expect(rows[0]?.body_text).toContain(h.config.webBaseUrl);
    expect(rows[0]?.body_text).not.toMatch(/\d+ points|score of \d/);
  });

  it('a mail provider that is down does not cost the result', async () => {
    const local = await startHarness({}, { mailer: (db) => {
      const send: { send: (message: { template: string; to: string; subject: string; text: string; link?: string }) => Promise<void> } = {
        send: async (message) => {
          if (message.template === 'scan-result') throw new Error('provider down');
          const { DevOutboxMailer } = await import('../src/infra');
          await new DevOutboxMailer(db).send(message);
        },
      };
      return send;
    } });
    try {
      const person = await local.signIn();
      const company = await scannedCompany(local, person, { legalName: 'Mail Down Ltd' });
      expect((await overview(local, person, company.id)).hasResult).toBe(true);
    } finally {
      await local.close();
    }
  });

  it('a source that recovers sends an email too, and a mere re-score does not', async () => {
    const down = new Set<string>(['uk.ico_register']);
    const local = await startHarness({}, {
      connectors: (fixtures) =>
        fixtures.map((connector) => ({
          ...connector,
          lookup: (ref) => connector.lookup(down.has(connector.id) ? { ...ref, scenario: 'error' } : ref),
        })),
    });
    try {
      const person = await local.signIn();
      const company = await scannedCompany(local, person, { legalName: 'Recover Ltd' });
      const subjects = async () => (await local.admin.query<{ subject: string }>(`SELECT subject FROM outbox WHERE to_email = $1 AND template = 'scan-result' ORDER BY created_at`, [person.email])).rows.map((row) => row.subject);
      expect(await subjects()).toEqual(['Your scan of Recover Ltd is ready']);
      await answer(local, person, company.id, { has_app: true });
      await local.queue.drain();
      expect(await subjects()).toHaveLength(1);

      const { retryDownSources } = await import('../src/modules/scans/pipeline');
      down.clear();
      local.setNow(new Date(Date.now() + 20 * 60_000));
      try {
        await retryDownSources(local.deps);
        await local.queue.drain();
      } finally {
        local.setNow(null);
      }
      expect(await subjects()).toEqual(['Your scan of Recover Ltd is ready', "We've updated Recover Ltd's result"]);
    } finally {
      await local.close();
    }
  });

  it('a source that is down is not counted as done', async () => {
    const local = await startHarness({}, {
      connectors: (fixtures) => fixtures.map((connector) => (connector.id === 'uk.ico_register' ? { ...connector, lookup: (ref) => connector.lookup({ ...ref, scenario: 'unavailable' }) } : connector)),
    });
    try {
      const person = await local.signIn();
      const company = await createCompany(local, person, { legalName: 'Partly Ltd' });
      const scan = (await scanNow(local, person, company.id)) as unknown as { status: string; checksDone: number; checksDown: number; checksTotal: number; sources: { connectorId: string; title: string; sourceName: string }[] };
      expect(scan.status).toBe('partial');
      // The UK's five sources, plus every source covering every country (GLEIF and the like), but not
      // a backup register (OpenCorporates): the UK's own register is on.
      const total = local.deps.connectors.filter((connector) => (connector.jurisdictions.includes('GB') || connector.jurisdictions.includes('*')) && !connector.fallbackRegister).length;
      expect(scan).toMatchObject({ checksDone: total - 1, checksDown: 1, checksTotal: total });
      expect(scan.sources.find((source) => source.connectorId === 'sanctions.lists')).toMatchObject({ title: 'Sanctions lists', sourceName: 'official sanctions' });
    } finally {
      await local.close();
    }
  });

  it('the register search carries the registered agent where there is one', async () => {
    const delaware = await h.request('GET', '/v1/registry/search?country=US-DE&q=Kestrel', { cookie: owner.cookie });
    expect(delaware.json<{ candidates: { registeredAgent: string }[] }>().candidates[0]?.registeredAgent).toBe('Northwood Agents LLC');
    const uk = await h.request('GET', '/v1/registry/search?country=GB&q=Kestrel', { cookie: owner.cookie });
    expect(uk.json<{ candidates: { registeredAgent: string | null }[] }>().candidates[0]?.registeredAgent).toBeNull();
  });

  describe('"a person will look it up"', () => {
    const post = (who: SignedIn, body: unknown) => h.request('POST', '/v1/registry/lookup-requests', { cookie: who.cookie, body });

    it('reaches the lawyer team without the private note, and the client hears back', async () => {
      const person = await h.signIn();
      const lawyer = await makeStaff(h, 'lawyer');
      const created = await post(person, { country: 'NG', legalName: 'Hard To Find Ltd', registrationNumber: 'RC-1', note: 'Private note about Ada' });
      expect(created.statusCode).toBe(201);
      expect(created.json()).toMatchObject({ country: 'NG', legalName: 'Hard To Find Ltd', status: 'requested' });
      const id = created.json<{ id: string }>().id;

      const work = (await h.request('GET', '/v1/review/work', { cookie: lawyer.cookie })).json<{ items: { id: string; kind: string; body: string }[] }>();
      const item = work.items.find((row) => row.kind === 'lookup_request' && row.body.includes('Hard To Find'));
      expect(item?.body).not.toContain('Ada');
      expect((await h.request('PATCH', `/v1/review/work/${item?.id}`, { cookie: lawyer.cookie, body: { status: 'delivered' } })).statusCode).toBe(400);
      expect((await h.request('PATCH', `/v1/review/work/${item?.id}`, { cookie: lawyer.cookie, body: { status: 'completed' } })).statusCode).toBe(200);
      const list = await h.request('GET', '/v1/registry/lookup-requests', { cookie: person.cookie });
      expect(list.json<{ requests: { id: string; status: string }[] }>().requests).toEqual([expect.objectContaining({ id, status: 'completed' })]);
      const feed = await h.request('GET', '/v1/notifications?kind=lawyer', { cookie: person.cookie });
      expect(feed.body).toContain('look-up');
    });

    it('checks input, permissions and tenancy', async () => {
      const person = await h.signIn();
      for (const body of [{}, { country: 'ZZ', legalName: 'A' }, { country: 'GB' }, { country: 'GB', legalName: '' }, { country: 'GB', legalName: 'A', note: 'x'.repeat(2001) }]) {
        expect((await post(person, body)).statusCode, JSON.stringify(body)).toBe(400);
      }
      expect((await h.request('POST', '/v1/registry/lookup-requests', { body: { country: 'GB', legalName: 'A' } })).statusCode).toBe(401);
      const lawyer = await addMember(h, person, 'lawyer');
      expect((await post(lawyer, { country: 'GB', legalName: 'A' })).statusCode).toBe(403);
      await post(person, { country: 'GB', legalName: 'Only Mine Ltd' });
      const stranger = await h.signIn();
      expect((await h.request('GET', '/v1/registry/lookup-requests', { cookie: stranger.cookie })).json()).toEqual({ requests: [] });
    });

    it('is rate limited', async () => {
      const local = await startHarness({ RATE_LIMIT_LOOKUP_REQUESTS_PER_ORG_PER_DAY: '1' });
      try {
        const person = await local.signIn();
        const go = () => local.request('POST', '/v1/registry/lookup-requests', { cookie: person.cookie, body: { country: 'GB', legalName: 'A Ltd' } });
        expect((await go()).statusCode).toBe(201);
        expect((await go()).statusCode).toBe(429);
      } finally {
        await local.close();
      }
    });
  });
});

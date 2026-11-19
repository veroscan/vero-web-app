import { JURISDICTIONS, loadPack } from '@vero/rules';
import { contract, publicReportResponseSchema } from '@vero/shared';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';
import pg from 'pg';
import { hashToken } from '../src/lib/crypto';
import { DEMO_EMAIL, DEMO_ORGANISATION_ID, seedDemoData } from '../src/db/seed';
import { seedDemoJourney } from '../src/seed/journey';
import { startWorker } from '../../worker/src/worker';
import { addMember, errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, fileDocument, GB_ANSWERS, makeStaff, MISSING_ID, overview, scanNow, scannedCompany, setPlan, type CompanyBody } from './support/product';

describe('public share link', () => {
  let h: Harness;
  let owner: SignedIn;
  let company: CompanyBody;
  let docName: string;

  const report = (token: string, ip?: string) => h.request('GET', `/v1/public/reports/${encodeURIComponent(token)}`, ip ? { ip } : {});
  const create = async (body: unknown = {}, who = owner, id = company.id) =>
    h.request('POST', `/v1/companies/${id}/shares`, { cookie: who.cookie, body });

  beforeAll(async () => {
    h = await startHarness({ RATE_LIMIT_PUBLIC_PER_IP_PER_MINUTE: '5' });
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    company = await scannedCompany(h, owner, { legalName: 'Kestrel Pay UK Ltd' });
    docName = 'very-private-founder-document.pdf';
    await fileDocument(h, owner, company.id, 'gb_founder_ip_assignment', {}, docName);
  });
  afterAll(() => h.close());

  it('needs no sign-in, gives the summary and counts from the design, and marks sample data', async () => {
    const created = await create();
    expect(created.statusCode).toBe(201);
    const { token, expiresAt } = created.json<{ token: string; expiresAt: string }>();
    expect(new Date(expiresAt).getTime()).toBeGreaterThan(Date.now() + 29 * 86_400_000);
    const response = await report(token);
    expect(response.statusCode).toBe(200);
    const body = response.json<{ companyName: string; score: number; statusWord: string; openIssues: { total: number; urgent: number }; areas: { name: string }[]; checked: { country: string; howWeKnow: string }[]; sampleData: boolean; notLegalAdvice: string }>();
    expect(body.companyName).toBe('Kestrel Pay UK Ltd');
    expect(body.score).toBe((await overview(h, owner, company.id)).score.value);
    expect(body.openIssues.total).toBeGreaterThan(0);
    expect(body.areas).toHaveLength(6);
    expect(body.checked[0]?.country).toBe('United Kingdom');
    expect(body.sampleData).toBe(true);
    expect(body.notLegalAdvice).toMatch(/not legal advice/);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).not.toMatch(/lawyer|Code & Clause/i);
  });

  it('leaks nothing: no documents, issue details, rules, people or ids', async () => {
    const { token } = (await create()).json<{ token: string }>();
    const response = await report(token);
    const text = response.body;
    expect(Object.keys(response.json<object>()).sort()).toEqual(
      Object.keys(publicReportResponseSchema.shape).sort(),
    );
    const { rows } = await h.admin.query<{ rule_key: string; headline: string; what_is_missing: string; fix: string }>(
      `SELECT rule_key, detail->>'headline' AS headline, what_is_missing, fix FROM finding WHERE company_id = $1`,
      [company.id],
    );
    for (const row of rows) {
      expect(text).not.toContain(row.rule_key);
      expect(text).not.toContain(row.headline);
      expect(text).not.toContain(row.what_is_missing);
      expect(text).not.toContain(row.fix);
    }
    for (const secret of [docName, 'storage', 'org/', owner.organisationId, owner.userId, owner.email, company.id, 'ADEYEMI', 'OKAFOR', 'registry.', 'vault.']) {
      expect(text, secret).not.toContain(secret);
    }
  });

  it('even a summary with something extra stored can never send it', async () => {
    const { token, id } = (await create()).json<{ token: string; id: string }>();
    await h.admin.query(`UPDATE shared_report SET summary = summary || '{"secretField": "do not send", "documents": ["x.pdf"]}'::jsonb WHERE id = $1`, [id]);
    const response = await report(token);
    expect(response.statusCode).toBe(200);
    expect(response.body).not.toContain('do not send');
    expect(response.body).not.toContain('x.pdf');
  });

  it('is frozen: later changes do not appear in an old link', async () => {
    const { token } = (await create()).json<{ token: string }>();
    const before = (await report(token)).json<{ score: number }>();
    // A new urgent gap is certain to move the score.
    await h.request('POST', `/v1/companies/${company.id}/issues/GB.IP.CONTRACTOR_ASSIGNMENT/missing`, { cookie: owner.cookie });
    await h.queue.drain();
    expect((await overview(h, owner, company.id)).score.value).not.toBe(before.score);
    await h.request('DELETE', `/v1/companies/${company.id}/issues/GB.IP.CONTRACTOR_ASSIGNMENT/missing`, { cookie: owner.cookie });
    await h.queue.drain();
    expect((await report(token)).json<{ score: number }>().score).toBe(before.score);
  });

  it('the token is random, stored only as a hash, and works only as given', async () => {
    const first = (await create()).json<{ token: string; id: string }>();
    const second = (await create()).json<{ token: string }>();
    expect(first.token).not.toBe(second.token);
    // Opaque: no organisation id, nothing of ours, just 256 random bits (audit fix, 19 Nov 2026).
    expect(first.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(first.token).not.toContain(owner.organisationId);
    const { rows } = await h.admin.query<{ text: string }>(`SELECT shared_report::text AS text FROM shared_report WHERE id = $1`, [first.id]);
    expect(rows[0]?.text).not.toContain(first.token);
    const list = await h.request('GET', `/v1/companies/${company.id}/shares`, { cookie: owner.cookie });
    expect(list.body).not.toContain(first.token);
    expect(list.body).not.toContain('tokenHash');

    for (const bad of [`${first.token}x`, first.token.slice(0, -1), `${owner.organisationId}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`, `${MISSING_ID}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`, 'not-a-real-token-at-all-really', "'; DROP TABLE shared_report; --xxxxxx"]) {
      const response = await report(bad);
      expect(response.statusCode, bad).toBe(404);
      expect(errorOf(response).code).toBe('not_found');
    }
    expect((await report('short')).statusCode).toBe(400);
  });

  it('finds its tenant through the system-scope index, keeps old links working, and holds tenancy', async () => {
    const created = (await create()).json<{ token: string; id: string }>();
    const index = await h.admin.query<{ kind: string; tenant_id: string; ref_id: string; token_hash: string }>(`SELECT kind, tenant_id, ref_id, token_hash FROM public_token_index WHERE ref_id = $1`, [created.id]);
    expect(index.rows[0]).toMatchObject({ kind: 'share', tenant_id: owner.organisationId, ref_id: created.id });
    expect(index.rows[0]?.token_hash).toBe(hashToken(created.token));
    // The API role sees nothing in the index without system scope, even inside the tenant.
    const app = new pg.Client({ connectionString: inject('appUrl') });
    await app.connect();
    try {
      await app.query('BEGIN');
      await app.query(`SELECT set_config('app.organisation_id', $1, true)`, [owner.organisationId]);
      expect((await app.query('SELECT * FROM public_token_index')).rows).toEqual([]);
      await app.query('ROLLBACK');
    } finally {
      await app.end();
    }
    // An index row pointing at another organisation opens nothing there.
    const stranger = await h.signIn();
    await h.admin.query(`UPDATE public_token_index SET tenant_id = $1 WHERE ref_id = $2`, [stranger.organisationId, created.id]);
    expect((await report(created.token)).statusCode).toBe(404);
    await h.admin.query(`UPDATE public_token_index SET tenant_id = $1 WHERE ref_id = $2`, [owner.organisationId, created.id]);
    expect((await report(created.token)).statusCode).toBe(200);
    // A share token is not a badge token.
    expect((await h.request('GET', `/v1/public/badges/${encodeURIComponent(created.token)}`)).statusCode).toBe(404);

    // A link made before the fix still opens.
    const legacy = `${owner.organisationId}.${'L'.repeat(43)}`;
    await h.admin.query(`UPDATE shared_report SET token_hash = $1 WHERE id = $2`, [hashToken(legacy), created.id]);
    expect((await report(legacy)).statusCode).toBe(200);
  });

  it('expires, with the same answer as a link that never existed', async () => {
    const { token } = (await create({ expiresInDays: 1 })).json<{ token: string }>();
    expect((await report(token)).statusCode).toBe(200);
    h.setNow(new Date(Date.now() + 2 * 86_400_000));
    try {
      const expired = await report(token);
      expect(expired.statusCode).toBe(404);
      expect(errorOf(expired).message).toBe(errorOf(await report(`${MISSING_ID}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`)).message);
    } finally {
      h.setNow(null);
    }
  });

  it('can be revoked straight away', async () => {
    const created = (await create()).json<{ token: string; id: string }>();
    expect((await report(created.token)).statusCode).toBe(200);
    const revoked = await h.request('DELETE', `/v1/shares/${created.id}`, { cookie: owner.cookie });
    expect(revoked.statusCode).toBe(200);
    expect((await report(created.token)).statusCode).toBe(404);
    const list = await h.request('GET', `/v1/companies/${company.id}/shares`, { cookie: owner.cookie });
    expect(list.json<{ links: { id: string; active: boolean }[] }>().links.find((link) => link.id === created.id)?.active).toBe(false);
  });

  it('stops answering if the organisation moves to Free', async () => {
    const { token } = (await create()).json<{ token: string }>();
    await setPlan(h, owner.organisationId, 'free');
    try {
      expect((await report(token)).statusCode).toBe(404);
    } finally {
      await setPlan(h, owner.organisationId, 'growth');
    }
    expect((await report(token)).statusCode).toBe(200);
  });

  it('is rate limited by address', async () => {
    const { token } = (await create()).json<{ token: string }>();
    const ip = '10.200.1.1';
    const results: number[] = [];
    for (let attempt = 0; attempt < 7; attempt += 1) results.push((await report(token, ip)).statusCode);
    expect(results.slice(0, 5).every((code) => code === 200)).toBe(true);
    expect(results.at(-1)).toBe(429);
    // Bad tokens count too, so nobody can guess freely.
    const guesser = '10.200.1.2';
    const guesses: number[] = [];
    for (let attempt = 0; attempt < 7; attempt += 1) guesses.push((await report(`${MISSING_ID}.AAAAAAAAAAAAAAAAAAAAAAAAAAAA${attempt}`, guesser)).statusCode);
    expect(guesses.at(-1)).toBe(429);
    expect((await report(token, '10.200.1.3')).statusCode).toBe(200);
  });

  it('input, not found, permissions and tenancy', async () => {
    expect((await create({ expiresInDays: 0 })).statusCode).toBe(400);
    expect((await create({ expiresInDays: 91 })).statusCode).toBe(400);
    expect((await create({ expiresInDays: 'soon' })).statusCode).toBe(400);
    expect((await create({}, owner, MISSING_ID)).statusCode).toBe(404);
    expect((await h.request('DELETE', `/v1/shares/${MISSING_ID}`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('POST', `/v1/companies/${company.id}/shares`, { body: {} })).statusCode).toBe(401);

    const member = await addMember(h, owner, 'member');
    expect((await create({}, member)).statusCode).toBe(403);
    const stranger = await h.signIn();
    await setPlan(h, stranger.organisationId, 'growth');
    expect((await create({}, stranger)).statusCode).toBe(404);
    const { id } = (await create()).json<{ id: string }>();
    expect((await h.request('DELETE', `/v1/shares/${id}`, { cookie: stranger.cookie })).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${company.id}/shares`, { cookie: stranger.cookie })).statusCode).toBe(404);
  });

  it('with no result yet there is nothing to share', async () => {
    const person = await h.signIn();
    await setPlan(h, person.organisationId, 'growth');
    const created = await h.request('POST', '/v1/companies', { cookie: person.cookie, body: { legalName: 'New Ltd', incorporationCountry: 'GB' } });
    const response = await create({}, person, created.json<{ id: string }>().id);
    expect(response.statusCode).toBe(409);
  });

  it('a Delaware report says "certificate", never a live status', async () => {
    const delaware = await scannedCompany(h, owner, { legalName: 'Heron Inc.', incorporationCountry: 'US-DE' });
    const { token } = (await create({}, owner, delaware.id)).json<{ token: string }>();
    const before = (await report(token)).json<{ checked: { howWeKnow: string }[] }>();
    expect(before.checked[0]?.howWeKnow).toMatch(/No certificate of good standing on file/);
    await fileDocument(h, owner, delaware.id, 'de_good_standing', { documentDate: '2026-10-12', validated: true });
    const after = (await create({}, owner, delaware.id)).json<{ token: string }>();
    const body = (await report(after.token)).json<{ checked: { howWeKnow: string }[] }>();
    expect(body.checked[0]?.howWeKnow).toMatch(/dated 2026-10-12/);
  });
});

describe('badge', () => {
  let h: Harness;
  let owner: SignedIn;
  let lawyer: SignedIn;

  interface BadgeBody {
    eligible: boolean;
    blockers: string[];
    requirements: { minScore: number; currentScore: number | null; minCoveragePercent: number; coverage: { counted: number; total: number } | null; openUrgent: number | null; lastFullScanOn: string | null; fullScanWithinDays: number };
    badge: { id: string; active: boolean; scoreAtIssue: number } | null;
    publicToken?: string;
  }
  const status = async (id: string, who = owner) => (await h.request('GET', `/v1/companies/${id}/badge`, { cookie: who.cookie })).json<BadgeBody>();

  /**
   * Passes every rule that can be scored, so the real conditions can be tested honestly. With
   * `unknowns: false` the checks nobody could call stay that way, which leaves a thin read.
   */
  async function earnEverything(companyId: string, { unknowns = true }: { unknowns?: boolean } = {}): Promise<void> {
    // There is no review service any more, so a test-only sign-off is written straight to the
    // tables the engine still reads. The score still comes from the real calculation.
    const task = await h.admin.query<{ id: string }>(
      `INSERT INTO review_task (organisation_id, company_id, status) VALUES ($1, $2, 'done') RETURNING id`,
      [owner.organisationId, companyId],
    );
    const taskId = task.rows[0]?.id ?? '';
    const open = await h.admin.query<{ rule_key: string }>(
      `SELECT f.rule_key FROM finding f JOIN scan s ON s.id = f.scan_id
       WHERE f.company_id = $1 AND s.finalised_seq = (SELECT max(finalised_seq) FROM scan WHERE company_id = $1) AND f.outcome = ANY($2::text[])`,
      [companyId, unknowns ? ['gap', 'defect', 'verify'] : ['gap', 'defect']],
    );
    await h.admin.query(
      `INSERT INTO review_verdict (organisation_id, review_task_id, company_id, rule_key, verdict, override_outcome, note, reviewer_id)
       SELECT $1, $2, $3, unnest($4::text[]), 'overridden', 'pass', 'Test sign-off', $5`,
      [owner.organisationId, taskId, companyId, open.rows.map((row) => row.rule_key), lawyer.userId],
    );
    await h.request('PATCH', `/v1/companies/${companyId}/questionnaire`, { cookie: owner.cookie, body: { answers: { has_app: true } } });
    await h.queue.drain();
  }

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    lawyer = await makeStaff(h, 'lawyer');
  });
  afterAll(() => h.close());

  it('says what is stopping it, from the rules package', async () => {
    const company = await createCompany(h, owner, { legalName: 'Not Yet Inc Ltd' });
    await answer(h, owner, company.id, { ...GB_ANSWERS, ip_founders_signed: false });
    await scanNow(h, owner, company.id);
    const body = await status(company.id);
    expect(body.eligible).toBe(false);
    expect(body.blockers).toContain('The score needs to be 80 or more.');
    expect(body.blockers).toContain('Every urgent issue needs to be fixed first.');
    // No lawyer condition any more (owner's decision, 19 Nov 2026): a fresh full scan is enough.
    expect(body.blockers.join(' ')).not.toMatch(/lawyer/i);
    expect(body.requirements.minScore).toBe(80);
    expect(body.requirements.fullScanWithinDays).toBe(90);
    expect(body.requirements.lastFullScanOn).toBe(new Date().toISOString().slice(0, 10));
    const refused = await h.request('POST', `/v1/companies/${company.id}/badge`, { cookie: owner.cookie });
    expect(refused.statusCode).toBe(409);
    expect(errorOf(refused).code).toBe('not_eligible');
  });

  it('issues once all four are met; the public page shows only the summary; it expires and can be revoked', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Earned Ltd' });
    await fileDocument(h, owner, company.id, 'gb_founder_ip_assignment');
    await earnEverything(company.id);
    const ready = await status(company.id);
    expect(ready).toMatchObject({ eligible: true, blockers: [] });
    expect(ready.requirements.currentScore).toBeGreaterThanOrEqual(80);
    expect(ready.requirements.openUrgent).toBe(0);

    const issued = await h.request('POST', `/v1/companies/${company.id}/badge`, { cookie: owner.cookie });
    expect(issued.statusCode).toBe(201);
    const body = issued.json<BadgeBody>();
    expect(body.badge?.active).toBe(true);
    const token = body.publicToken ?? '';
    const { rows } = await h.admin.query<{ public_token: string; expires_at: Date; issued_at: Date }>(`SELECT public_token, expires_at, issued_at FROM verification_badge WHERE company_id = $1`, [company.id]);
    expect(rows[0]?.public_token).not.toBe(token);
    // Good until the full scan behind it is 90 days old.
    const days = ((rows[0]?.expires_at.getTime() ?? 0) - (rows[0]?.issued_at.getTime() ?? 0)) / 86_400_000;
    expect(days).toBeGreaterThan(90);
    expect(days).toBeLessThanOrEqual(91);

    const page = await h.request('GET', `/v1/public/badges/${encodeURIComponent(token)}`);
    expect(page.statusCode).toBe(200);
    expect(page.json()).toMatchObject({ companyName: 'Earned Ltd', verified: true, reviewedBy: 'Vero' });
    for (const secret of [company.id, owner.organisationId, 'GB.', 'vault', 'storage']) expect(page.body).not.toContain(secret);

    expect((await status(company.id)).badge?.active).toBe(true);
    h.setNow(new Date(Date.now() + 92 * 86_400_000));
    try {
      expect((await h.request('GET', `/v1/public/badges/${encodeURIComponent(token)}`)).statusCode).toBe(404);
    } finally {
      h.setNow(null);
    }

    const revoke = await h.request('DELETE', `/v1/companies/${company.id}/badge`, { cookie: owner.cookie });
    expect(revoke.statusCode).toBe(200);
    expect((await h.request('GET', `/v1/public/badges/${encodeURIComponent(token)}`)).statusCode).toBe(404);
    expect((await status(company.id)).badge?.active).toBe(false);
  });

  it('a high score on under half the checks earns no badge, and says how far along it is', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Thin Read Ltd' });
    await fileDocument(h, owner, company.id, 'gb_founder_ip_assignment');
    await earnEverything(company.id, { unknowns: false });
    const body = await status(company.id);
    const coverage = body.requirements.coverage ?? { counted: 0, total: 0 };
    expect(body.requirements.minCoveragePercent).toBe(50);
    expect(coverage.counted).toBeLessThan(coverage.total / 2);
    expect(body.requirements.currentScore).toBeGreaterThanOrEqual(80);
    expect(body.requirements.openUrgent).toBe(0);
    expect(body).toMatchObject({ eligible: false, blockers: [`At least half of the checks that apply need to count first. So far that's ${coverage.counted} of ${coverage.total}.`] });
    const refused = await h.request('POST', `/v1/companies/${company.id}/badge`, { cookie: owner.cookie });
    expect(refused.statusCode).toBe(409);
    expect(errorOf(refused).code).toBe('not_eligible');
  });

  it('needs a full scan in the last 90 days: day 90 still counts, day 91 does not, and re-scores never count', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Old Scan Ltd' });
    await fileDocument(h, owner, company.id, 'gb_founder_ip_assignment');
    await earnEverything(company.id);
    expect((await status(company.id)).eligible).toBe(true);
    // Sessions expire, so the scan is moved back in time rather than the clock forward.
    const age = (days: number) => h.admin.query(`UPDATE scan SET completed_at = now() - make_interval(days => $2) WHERE company_id = $1 AND kind = 'full'`, [company.id, days]);
    await age(90);
    expect((await status(company.id)).eligible).toBe(true);
    await age(91);
    const body = await status(company.id);
    expect(body.eligible).toBe(false);
    expect(body.blockers).toEqual(['The last full scan is more than 90 days old. Run a new one.']);
    // A re-score (new answers) asks no source again, so it doesn't count as a full scan.
    await h.request('PATCH', `/v1/companies/${company.id}/questionnaire`, { cookie: owner.cookie, body: { answers: { has_app: true } } });
    await h.queue.drain();
    expect((await status(company.id)).blockers).toContain('The last full scan is more than 90 days old. Run a new one.');
    // A new full scan renews it.
    await scanNow(h, owner, company.id);
    expect((await status(company.id)).blockers).not.toContain('The last full scan is more than 90 days old. Run a new one.');
  });

  it('bad links, not found, permissions and tenancy', async () => {
    expect((await h.request('GET', `/v1/public/badges/${MISSING_ID}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`)).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/public/badges/nonsense-but-long-enough-to-pass`)).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${MISSING_ID}/badge`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('POST', `/v1/companies/${MISSING_ID}/badge`, { cookie: owner.cookie })).statusCode).toBe(404);
    const company = await scannedCompany(h, owner, { legalName: 'Badge Guard Ltd' });
    expect((await h.request('GET', `/v1/companies/${company.id}/badge`)).statusCode).toBe(401);
    const stranger = await h.signIn();
    expect((await h.request('GET', `/v1/companies/${company.id}/badge`, { cookie: stranger.cookie })).statusCode).toBe(404);
    expect((await h.request('POST', `/v1/companies/${company.id}/badge`, { cookie: stranger.cookie })).statusCode).toBe(404);
    const member = await addMember(h, owner, 'member');
    expect((await h.request('POST', `/v1/companies/${company.id}/badge`, { cookie: member.cookie })).statusCode).toBe(403);
  });
});

describe('admin', () => {
  let h: Harness;
  let admin: SignedIn;
  let lawyer: SignedIn;
  let person: SignedIn;

  beforeAll(async () => {
    h = await startHarness();
    admin = await makeStaff(h, 'admin');
    lawyer = await makeStaff(h, 'lawyer');
    person = await h.signIn();
    await scannedCompany(h, person, { legalName: 'Health Ltd' });
  });
  afterAll(() => h.close());

  const ROUTES = [
    ['GET', '/v1/admin/rule-packs'],
    ['GET', '/v1/admin/connectors'],
    ['GET', '/v1/admin/users'],
    ['POST', '/v1/admin/rule-packs/GB/1.0.0/approve'],
    ['POST', '/v1/admin/staff'],
    ['DELETE', `/v1/admin/staff/${MISSING_ID}`],
    ['PATCH', `/v1/admin/organisations/${MISSING_ID}/plan`],
  ] as const;

  it.each(ROUTES)('%s %s is for platform admins only', async (method, url) => {
    const options = method === 'GET' || method === 'DELETE' ? {} : { body: {} };
    expect((await h.request(method, url, options)).statusCode).toBe(401);
    expect((await h.request(method, url, { ...options, cookie: person.cookie })).statusCode).toBe(403);
    expect((await h.request(method, url, { ...options, cookie: lawyer.cookie })).statusCode).toBe(403);
    const orgAdmin = await addMember(h, person, 'admin');
    expect((await h.request(method, url, { ...options, cookie: orgAdmin.cookie })).statusCode).toBe(403);
  });

  it('lists packs as drafts, with versions and rule counts', async () => {
    const response = await h.request('GET', '/v1/admin/rule-packs', { cookie: admin.cookie });
    const packs = response.json<{ packs: { jurisdiction: string; version: string; status: string; ruleCount: number; needsReviewCount: number; approvedBy: string | null }[] }>().packs;
    // Every pack in code, draft country packs included (16 Nov 2026: CH, SG, AU, NZ, CA and others).
    expect(packs.map((pack) => pack.jurisdiction).sort()).toEqual([...JURISDICTIONS].sort());
    for (const code of ['GB', 'INTL', 'NG', 'US', 'US-DE', 'CH', 'SG', 'AU', 'NZ', 'CA']) expect(packs.map((pack) => pack.jurisdiction), code).toContain(code);
    const gb = packs.find((pack) => pack.jurisdiction === 'GB');
    expect(gb).toMatchObject({ ruleCount: 127, needsReviewCount: 18, approvedBy: null });
    expect(['draft', 'approved']).toContain(gb?.status);
  });

  it('approval records a named approver, once, and the API role cannot do it any other way', async () => {
    const packs = (await h.request('GET', '/v1/admin/rule-packs', { cookie: admin.cookie })).json<{ packs: { jurisdiction: string; version: string; status: string }[] }>().packs;
    const us = packs.find((pack) => pack.jurisdiction === 'US');
    const url = `/v1/admin/rule-packs/US/${us?.version}/approve`;

    for (const body of [{}, { approverName: '' }, { approverName: 'x' }]) {
      expect((await h.request('POST', url, { cookie: admin.cookie, body })).statusCode).toBe(400);
    }
    expect((await h.request('POST', '/v1/admin/rule-packs/US/9.9.9/approve', { cookie: admin.cookie, body: { approverName: 'A Lawyer' } })).statusCode).toBe(404);
    expect((await h.request('POST', '/v1/admin/rule-packs/fr/1.0.0/approve', { cookie: admin.cookie, body: { approverName: 'A Lawyer' } })).statusCode).toBe(400);
    // A well-formed country with no pack of its own has nothing to approve.
    expect((await h.request('POST', '/v1/admin/rule-packs/FR/1.0.0/approve', { cookie: admin.cookie, body: { approverName: 'A Lawyer' } })).statusCode).toBe(404);

    const response = await h.request('POST', url, { cookie: admin.cookie, body: { approverName: 'Ngozi Adeyemi, Code & Clause' } });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'approved', approvedBy: 'Ngozi Adeyemi, Code & Clause' });
    expect(response.json<{ approvedAt: string }>().approvedAt).toBeTruthy();
    const twice = await h.request('POST', url, { cookie: admin.cookie, body: { approverName: 'Someone Else' } });
    expect(twice.statusCode).toBe(409);
    const audit = await h.admin.query<{ actor_id: string; metadata: { approverName: string } }>(`SELECT actor_id, metadata FROM audit_log WHERE action = 'rule_pack.approved'`);
    expect(audit.rows[0]).toMatchObject({ actor_id: admin.userId, metadata: { approverName: 'Ngozi Adeyemi, Code & Clause' } });

    // The other packs stay as they were, and put it back for the other tests in this run.
    const others = await h.admin.query<{ status: string }>(`SELECT status FROM rule_pack WHERE jurisdiction_code = 'GB'`);
    expect(others.rows[0]?.status).toBe('draft');
    await h.admin.query(`UPDATE rule_pack SET status = 'draft', approved_by = NULL, approved_at = NULL WHERE jurisdiction_code = 'US'`);
  });

  it('the database function refuses without system scope or without a name', async () => {
    const app = new pg.Client({ connectionString: inject('appUrl') });
    await app.connect();
    try {
      await expect(app.query(`SELECT approve_rule_pack('NG', '1.0.0', 'A Lawyer')`)).rejects.toMatchObject({ code: '42501' });
      await app.query('BEGIN');
      await app.query(`SELECT set_config('app.scope', 'system', true)`);
      await expect(app.query(`SELECT approve_rule_pack('NG', '1.0.0', ' ')`)).rejects.toMatchObject({ code: '22023' });
      await app.query('ROLLBACK');
    } finally {
      await app.end();
    }
    const { rows } = await h.admin.query<{ status: string }>(`SELECT status FROM rule_pack WHERE jurisdiction_code = 'NG'`);
    expect(rows[0]?.status).toBe('draft');
  });

  it('connector health shows each source and its last result, with no customer data', async () => {
    const response = await h.request('GET', '/v1/admin/connectors', { cookie: admin.cookie });
    expect(response.statusCode).toBe(200);
    const body = response.json<{ connectors: { id: string; lastStatus: string | null; lastCheckedAt: string | null }[] }>();
    expect(body.connectors.length).toBeGreaterThanOrEqual(12);
    expect(body.connectors).toHaveLength(h.deps.connectors.length);
    const ch = body.connectors.find((item) => item.id === 'uk.companies_house');
    // Other test files share this table, and some of them take this source down on purpose.
    expect(['found', 'error', 'unavailable', 'not_found', 'ambiguous']).toContain(ch?.lastStatus);
    expect(ch?.lastCheckedAt).toBeTruthy();
    expect(response.body).not.toContain('Health Ltd');
    const columns = await h.admin.query<{ column_name: string }>(`SELECT column_name FROM information_schema.columns WHERE table_name = 'connector_health'`);
    expect(columns.rows.map((row) => row.column_name)).not.toContain('company_id');
  });

  it('users: who and where, with no sign-in secrets, audited', async () => {
    const response = await h.request('GET', '/v1/admin/users?limit=100', { cookie: admin.cookie });
    expect(response.statusCode).toBe(200);
    type UsersBody = { users: { id: string; email: string; staffRole: string | null; organisations: { id: string; role: string }[] }[]; hasMore: boolean };
    // Oldest first, and other test files share the database, so read every page.
    const everyone: UsersBody['users'] = [...response.json<UsersBody>().users];
    for (let offset = 100, more = response.json<UsersBody>().hasMore; more; offset += 100) {
      const page = (await h.request('GET', `/v1/admin/users?limit=100&offset=${offset}`, { cookie: admin.cookie })).json<UsersBody>();
      everyone.push(...page.users);
      more = page.hasMore;
    }
    const found = everyone.find((item) => item.id === person.userId);
    expect(found?.email).toBe(person.email);
    expect(found?.organisations[0]).toMatchObject({ id: person.organisationId, role: 'owner' });
    expect(everyone.find((item) => item.id === lawyer.userId)?.staffRole).toBe('lawyer');
    expect(response.body).not.toMatch(/totp|token|secret/i);
    expect((await h.request('GET', '/v1/admin/users?limit=0', { cookie: admin.cookie })).statusCode).toBe(400);
    const paged = await h.request('GET', '/v1/admin/users?limit=1', { cookie: admin.cookie });
    expect(paged.json<{ users: unknown[]; hasMore: boolean }>()).toMatchObject({ hasMore: true });
    const audit = await h.admin.query(`SELECT 1 FROM audit_log WHERE action = 'admin.users_viewed' AND actor_id = $1`, [admin.userId]);
    expect(audit.rows.length).toBeGreaterThan(0);
  });

  it('the admin directory opens only people and memberships, read-only', async () => {
    const app = new pg.Client({ connectionString: inject('appUrl') });
    await app.connect();
    try {
      await app.query('BEGIN');
      await app.query(`SELECT set_config('app.admin_directory', 'on', true)`);
      expect((await app.query('SELECT id FROM "user"')).rows.length).toBeGreaterThan(0);
      expect((await app.query('SELECT id FROM membership')).rows.length).toBeGreaterThan(0);
      for (const table of ['company', 'document', 'finding', 'fact', 'scan', 'answer', 'review_task', 'notification']) {
        expect((await app.query(`SELECT * FROM ${table}`)).rows, table).toEqual([]);
      }
      expect((await app.query(`UPDATE membership SET role = 'owner'`)).rowCount).toBe(0);
      expect((await app.query(`UPDATE organisation SET name = 'x'`)).rowCount).toBe(0);
      expect((await app.query(`DELETE FROM organisation`)).rowCount).toBe(0);
      await app.query('ROLLBACK');
    } finally {
      await app.end();
    }
  });

  it('staff are granted and removed by an admin, and it takes effect at once', async () => {
    const newcomer = await h.signIn();
    expect((await h.request('GET', '/v1/review/work', { cookie: newcomer.cookie })).statusCode).toBe(403);
    const grant = await h.request('POST', '/v1/admin/staff', { cookie: admin.cookie, body: { userId: newcomer.userId, role: 'lawyer' } });
    expect(grant.statusCode).toBe(200);
    expect((await h.request('GET', '/v1/review/work', { cookie: newcomer.cookie })).statusCode).toBe(200);
    expect((await h.request('POST', '/v1/admin/staff', { cookie: admin.cookie, body: { userId: MISSING_ID, role: 'lawyer' } })).statusCode).toBe(404);
    expect((await h.request('POST', '/v1/admin/staff', { cookie: admin.cookie, body: { userId: newcomer.userId, role: 'owner' } })).statusCode).toBe(400);
    expect((await h.request('DELETE', `/v1/admin/staff/${newcomer.userId}`, { cookie: admin.cookie })).statusCode).toBe(200);
    expect((await h.request('GET', '/v1/review/work', { cookie: newcomer.cookie })).statusCode).toBe(403);
    expect((await h.request('DELETE', `/v1/admin/staff/${newcomer.userId}`, { cookie: admin.cookie })).statusCode).toBe(404);
    expect((await h.request('DELETE', `/v1/admin/staff/${admin.userId}`, { cookie: admin.cookie })).statusCode).toBe(409);
  });
});

describe('worker and reference data', () => {
  it('apps/worker runs the same job handlers', async () => {
    const h = await startHarness();
    try {
      const errors: string[] = [];
      const stop = startWorker(h.deps, (name) => errors.push(name));
      const owner = await h.signIn();
      const company = await scannedCompany(h, owner, { legalName: 'Worker Ltd' });
      stop();
      const { rows } = await h.admin.query<{ status: string }>(`SELECT status FROM scan WHERE company_id = $1`, [company.id]);
      expect(rows[0]?.status).toBe('completed');
      expect(errors).toEqual([]);
    } finally {
      await h.close();
    }
  });

  it('the rule packs, vault slots, plans and questions are all in place, in draft', async () => {
    const admin = new pg.Client({ connectionString: inject('superuserUrl') });
    await admin.connect();
    try {
      const counts = async (table: string) => Number((await admin.query<{ n: string }>(`SELECT count(*) AS n FROM ${table}`)).rows[0]?.n);
      // US, US-DE, GB, NG, the International pack, and every draft country pack.
      expect(await counts('rule_pack')).toBe(JURISDICTIONS.length);
      expect(await counts('rule')).toBe(JURISDICTIONS.reduce((sum, code) => sum + loadPack(code).rules.length, 0));
      expect(await counts('plan')).toBe(3);
      expect(await counts('question')).toBeGreaterThan(50);
      expect(await counts('vault_slot')).toBeGreaterThan(50);
    } finally {
      await admin.end();
    }
  });

  it('syncing again changes nothing, and refuses an approved pack whose content changed', async () => {
    const { syncReferenceData } = await import('../src/db/reference-sync');
    const admin = new pg.Client({ connectionString: inject('superuserUrl') });
    await admin.connect();
    try {
      const before = await admin.query(`SELECT count(*) AS n FROM rule`);
      await syncReferenceData(inject('migratorUrl'));
      const after = await admin.query(`SELECT count(*) AS n FROM rule`);
      expect(after.rows).toEqual(before.rows);
      await admin.query(`UPDATE rule_pack SET status = 'approved', approved_by = 'Test', approved_at = now(), content_hash = 'other' WHERE jurisdiction_code = 'NG'`);
      await expect(syncReferenceData(inject('migratorUrl'))).rejects.toThrow(/Bump its version/);
    } finally {
      await admin.query(`UPDATE rule_pack SET status = 'draft', approved_by = NULL, approved_at = NULL WHERE jurisdiction_code = 'NG'`);
      await syncReferenceData(inject('migratorUrl'));
      await admin.end();
    }
  });

  it('every contract group has its routes, and the upload is the only binary one', () => {
    const endpoints = Object.values(contract).flatMap((group) => Object.values(group) as { binary?: boolean; path: string }[]);
    expect(endpoints.filter((endpoint) => endpoint.binary).map((endpoint) => endpoint.path)).toEqual(['/v1/companies/:companyId/documents']);
  });
});

describe('demo seed through the real pipeline', () => {
  it('reaches a realistic state with no score written directly, and refuses anything but fixture mode', { timeout: 300_000 }, async () => {
    const live = await startHarness();
    try {
      await expect(seedDemoJourney(live.deps)).rejects.toThrow(/CONNECTOR_MODE=fixture/);
    } finally {
      await live.close();
    }

    const h = await startHarness({ CONNECTOR_MODE: 'fixture' });
    try {
      await seedDemoData(h.deps.db);
      const report = await seedDemoJourney(h.deps);
      expect(report.ran).toBe(true);
      // Believable, from the real pipeline: a Free range, then a Growth score with the lead
      // developer's assignment open. These are bands, because no number is written anywhere.
      for (const read of report.firstRead) expect(read.low, read.company).not.toBeNull();
      expect(report.firstReadGroup.low ?? 0).toBeGreaterThanOrEqual(50);
      expect(report.firstReadGroup.high ?? 100).toBeLessThanOrEqual(90);
      expect(report.free.low).not.toBeNull();
      expect(report.documentsFiled).toBeGreaterThan(40);
      expect(report.group ?? 0).toBeGreaterThanOrEqual(55);
      expect(report.group ?? 100).toBeLessThanOrEqual(85);
      const urgent = await h.admin.query<{ rule_key: string; outcome: string }>(
        `SELECT f.rule_key, f.outcome FROM finding f JOIN scan s ON s.id = f.scan_id
         WHERE f.organisation_id = $1 AND f.rule_key IN ('US-DE.IP.WORK_FOR_HIRE', 'GB.IP.CONTRACTOR_ASSIGNMENT', 'NG.IP.TEAM_ASSIGNMENT')
           AND s.finalised_seq = (SELECT max(finalised_seq) FROM scan WHERE company_id = f.company_id)`,
        [DEMO_ORGANISATION_ID],
      );
      expect(urgent.rows.length).toBe(3);
      for (const row of urgent.rows) expect(row.outcome).toBe('gap');
      const amara = await h.signIn(DEMO_EMAIL);
      expect(amara.organisationId).toBe(DEMO_ORGANISATION_ID);

      const companies = await h.request('GET', '/v1/companies', { cookie: amara.cookie });
      for (const company of companies.json<{ companies: { id: string }[] }>().companies) {
        const body = await overview(h, amara, company.id);
        expect(body.hasResult).toBe(true);
        expect(body.score.kind).toBe('exact');
        expect(body.sampleData).toBe(true);
      }
      const group = await h.request('GET', `/v1/companies/00000000-0000-4000-8000-00000000c001/issues?scope=group`, { cookie: amara.cookie });
      expect(new Set(group.json<{ issues: { companyId: string }[] }>().issues.map((issue) => issue.companyId)).size).toBe(3);
      const records = await h.request('GET', '/v1/companies/00000000-0000-4000-8000-00000000c001/records', { cookie: amara.cookie });
      expect(records.json<{ items: { value: string }[] }>().items[0]?.value).toBe('Certified 12 Oct 2026');

      // Every score came from a finalised scan, with its findings and rule pack versions.
      const { rows } = await h.admin.query<{ scan_id: string; findings: string; versions: Record<string, string> }>(
        `SELECT s.scan_id, s.rule_pack_versions AS versions, (SELECT count(*) FROM finding f WHERE f.scan_id = s.scan_id) AS findings
         FROM score_snapshot s WHERE s.organisation_id = $1`,
        [DEMO_ORGANISATION_ID],
      );
      expect(rows.length).toBeGreaterThanOrEqual(3);
      for (const row of rows) {
        expect(Number(row.findings)).toBeGreaterThan(100);
        expect(Object.keys(row.versions).length).toBeGreaterThan(0);
      }
      // No lawyer reads anything in the demo any more.
      const verdicts = await h.admin.query(`SELECT 1 FROM review_verdict WHERE organisation_id = $1`, [DEMO_ORGANISATION_ID]);
      expect(verdicts.rows).toEqual([]);
      const packs = await h.admin.query<{ status: string }>(`SELECT DISTINCT status FROM rule_pack`);
      expect(packs.rows).toEqual([{ status: 'draft' }]);

      // Twice is safe.
      const before = await h.admin.query(`SELECT count(*) AS n FROM scan WHERE organisation_id = $1`, [DEMO_ORGANISATION_ID]);
      expect((await seedDemoJourney(h.deps)).ran).toBe(false);
      const after = await h.admin.query(`SELECT count(*) AS n FROM scan WHERE organisation_id = $1`, [DEMO_ORGANISATION_ID]);
      expect(after.rows).toEqual(before.rows);
    } finally {
      await h.close();
    }
  });
});

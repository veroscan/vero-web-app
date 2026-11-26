import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { sendDeadlineReminders } from '../src/modules/deadlines/routes';
import { addMember, errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, fileDocument, GB_ANSWERS, MISSING_ID, pdfFile, scanNow, scannedCompany, setPlan, upload } from './support/product';

/**
 * Own and follow (docs/BACKEND-V2-PLAN.md, steps 1 to 3 and 7). A followed company is a row of
 * the follower's own organisation, read-only: every route that adds evidence refuses it with
 * one plain answer, and nothing about it is shared with any other organisation.
 */

const FOLLOWS_ONLY = "You follow this company, so you can see its public record but can't add evidence for it.";
const DOC_RULE = 'GB.IP.NDA';

interface CompanyDto {
  id: string;
  legalName: string;
  relationship?: string;
}

interface WatchlistBody {
  companies: {
    companyId: string;
    legalName: string;
    score: { kind: string; value?: number; low?: number; high?: number };
    statusWord: string | null;
    coverage: { counted: number; total: number } | null;
    countryCoverage: { level: string; sentence: string };
    lastScannedAt: string | null;
    scanInProgress: boolean;
    lastChange: unknown;
  }[];
  used: number;
  limit: number;
}

function follow(h: Harness, who: SignedIn, body: Record<string, unknown>) {
  return h.request('POST', '/v1/watchlist', { cookie: who.cookie, body });
}

async function followed(h: Harness, who: SignedIn, body: Record<string, unknown>): Promise<CompanyDto> {
  const response = await follow(h, who, body);
  if (response.statusCode !== 201) throw new Error(`Follow failed: ${response.statusCode} ${response.body}`);
  await h.queue.drain();
  return response.json<{ company: CompanyDto }>().company;
}

async function watchlist(h: Harness, who: SignedIn): Promise<WatchlistBody> {
  const response = await h.request('GET', '/v1/watchlist', { cookie: who.cookie });
  expect(response.statusCode).toBe(200);
  return response.json<WatchlistBody>();
}

describe('own and follow: the data', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('every company is "own" unless followed, and the column takes nothing else', async () => {
    const owner = await h.signIn();
    const company = await createCompany(h, owner, { legalName: 'Default Own Ltd' });
    expect(company).toMatchObject({ relationship: 'own' });
    const { rows } = await h.admin.query<{ relationship: string }>(`SELECT relationship FROM company WHERE id = $1`, [company.id]);
    expect(rows[0]?.relationship).toBe('own');
    await expect(h.admin.query(`UPDATE company SET relationship = 'borrow' WHERE id = $1`, [company.id])).rejects.toThrow(/check/i);
  });

  it('keeps when each person last looked under forced row-level security', async () => {
    const { rows } = await h.admin.query<{ relrowsecurity: boolean; relforcerowsecurity: boolean }>(
      `SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'company_last_seen'`,
    );
    expect(rows[0]).toEqual({ relrowsecurity: true, relforcerowsecurity: true });
  });

  it('one organisation never sees another one\'s last looks', async () => {
    const a = await h.signIn();
    const b = await h.signIn();
    const company = await scannedCompany(h, a, { legalName: 'Looked At Ltd' });
    expect((await h.request('GET', `/v1/companies/${company.id}/overview`, { cookie: a.cookie })).statusCode).toBe(200);
    const stored = await h.admin.query(`SELECT 1 FROM company_last_seen WHERE company_id = $1`, [company.id]);
    expect(stored.rows).toHaveLength(1);
    // b's own overview call can't reach a's company at all.
    expect((await h.request('GET', `/v1/companies/${company.id}/overview`, { cookie: b.cookie })).statusCode).toBe(404);
    const seenByB = await h.admin.query(`SELECT 1 FROM company_last_seen WHERE organisation_id = $1`, [b.organisationId]);
    expect(seenByB.rows).toHaveLength(0);
  });
});

describe('the evidence guard', () => {
  let h: Harness;
  let owner: SignedIn;
  let member: SignedIn;
  let lawyerRole: SignedIn;
  let company: CompanyDto;
  let documentId: string;
  let deadlineId: string;

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    member = await addMember(h, owner, 'member');
    lawyerRole = await addMember(h, owner, 'lawyer');
    company = await scannedCompany(h, owner, { legalName: 'Guarded Ltd' });
    const uploaded = await upload(h, owner, company.id, 'nda.pdf', pdfFile(['Mutual non-disclosure agreement']));
    documentId = uploaded.json<{ id: string }>().id;
    await h.queue.drain();
    const due = new Date(Date.now() + 40 * 86_400_000).toISOString().slice(0, 10);
    const inserted = await h.admin.query<{ id: string }>(
      `INSERT INTO deadline (organisation_id, company_id, rule_key, title, due_on, monitoring) VALUES ($1, $2, 'GB.TEST.GUARD', 'Guard test', $3, 'reminder') RETURNING id`,
      [owner.organisationId, company.id, due],
    );
    deadlineId = inserted.rows[0]?.id ?? '';
    // As if this team had followed it rather than added it as its own.
    await h.admin.query(`UPDATE company SET relationship = 'follow' WHERE id = $1`, [company.id]);
  });
  afterAll(() => h.close());

  const evidenceRoutes = () => [
    { name: 'answers', send: (who: SignedIn) => h.request('PATCH', `/v1/companies/${company.id}/questionnaire`, { cookie: who.cookie, body: { answers: { has_app: true } } }) },
    { name: 'attestation', send: (who: SignedIn) => h.request('POST', `/v1/companies/${company.id}/attestations`, { cookie: who.cookie, body: { key: 'gb_rights_procedure', value: true } }) },
    { name: 'upload', send: (who: SignedIn) => upload(h, who, company.id, 'more.pdf', pdfFile(['Another'])) },
    { name: 'confirm', send: (who: SignedIn) => h.request('POST', `/v1/documents/${documentId}/confirm`, { cookie: who.cookie, body: { slotKey: 'gb_founder_ip_assignment', confirmSigned: true } }) },
    { name: 'delete', send: (who: SignedIn) => h.request('DELETE', `/v1/documents/${documentId}`, { cookie: who.cookie }) },
    { name: 'missing', send: (who: SignedIn) => h.request('POST', `/v1/companies/${company.id}/issues/${DOC_RULE}/missing`, { cookie: who.cookie }) },
    { name: 'not missing', send: (who: SignedIn) => h.request('DELETE', `/v1/companies/${company.id}/issues/${DOC_RULE}/missing`, { cookie: who.cookie }) },
    { name: 'deadline done', send: (who: SignedIn) => h.request('POST', `/v1/deadlines/${deadlineId}/done`, { cookie: who.cookie }) },
    { name: 'deadline undone', send: (who: SignedIn) => h.request('DELETE', `/v1/deadlines/${deadlineId}/done`, { cookie: who.cookie }) },
    { name: 'badge', send: (who: SignedIn) => h.request('POST', `/v1/companies/${company.id}/badge`, { cookie: who.cookie }) },
    { name: 'share link', send: (who: SignedIn) => h.request('POST', `/v1/companies/${company.id}/shares`, { cookie: who.cookie, body: { expiresInDays: 30 } }) },
  ];

  it('refuses every route that adds evidence, with one plain answer, and changes nothing', async () => {
    const before = await h.admin.query(`SELECT (SELECT count(*) FROM answer WHERE company_id = $1) AS answers, (SELECT count(*) FROM document WHERE company_id = $1) AS documents, (SELECT count(*) FROM missing_document_statement WHERE company_id = $1) AS statements`, [company.id]);
    for (const route of evidenceRoutes()) {
      const response = await route.send(owner);
      expect(response.statusCode, route.name).toBe(403);
      expect(errorOf(response), route.name).toEqual({ code: 'follows_only', message: FOLLOWS_ONLY });
    }
    const after = await h.admin.query(`SELECT (SELECT count(*) FROM answer WHERE company_id = $1) AS answers, (SELECT count(*) FROM document WHERE company_id = $1) AS documents, (SELECT count(*) FROM missing_document_statement WHERE company_id = $1) AS statements`, [company.id]);
    expect(after.rows).toEqual(before.rows);
    const { rows } = await h.admin.query<{ status: string }>(`SELECT status FROM deadline WHERE id = $1`, [deadlineId]);
    expect(rows[0]?.status).toBe('upcoming');
  });

  it('gives a member the same answer, turns the read-only role away by permission first, and shows a stranger nothing', async () => {
    for (const name of ['answers', 'upload', 'deadline done', 'missing']) {
      const route = evidenceRoutes().find((item) => item.name === name);
      const response = await route?.send(member);
      expect(response?.statusCode, name).toBe(403);
      expect(response ? errorOf(response).code : null, name).toBe('follows_only');
    }
    const refused = await evidenceRoutes()[0]?.send(lawyerRole);
    expect(refused?.statusCode).toBe(403);
    expect(refused ? errorOf(refused).code : null).toBe('forbidden');
    const stranger = await h.signIn();
    for (const route of evidenceRoutes()) expect((await route.send(stranger)).statusCode, route.name).toBe(404);
  });

  it('still lets the follower read everything Vero found, and says why there is no badge', async () => {
    for (const path of ['overview', 'issues', 'questionnaire', 'history', 'records']) {
      expect((await h.request('GET', `/v1/companies/${company.id}/${path}`, { cookie: member.cookie })).statusCode, path).toBe(200);
    }
    const read = await h.request('GET', `/v1/companies/${company.id}`, { cookie: owner.cookie });
    expect(read.json<CompanyDto>().relationship).toBe('follow');
    const badge = (await h.request('GET', `/v1/companies/${company.id}/badge`, { cookie: owner.cookie })).json<{ eligible: boolean; blockers: string[] }>();
    expect(badge).toMatchObject({ eligible: false, blockers: ["You follow this company, so it can't have a badge here. Only the team that owns it can take one."] });
    // A related company can't be hung off a company this team only follows.
    const related = await h.request('POST', `/v1/companies/${company.id}/related`, { cookie: owner.cookie, body: { legalName: 'Child Ltd', incorporationCountry: 'GB' } });
    expect(errorOf(related).code).toBe('follows_only');
  });

  it('once owned, the same routes work again; owning is audited once', async () => {
    const lawyerTry = await h.request('POST', `/v1/companies/${company.id}/own`, { cookie: lawyerRole.cookie });
    expect(lawyerTry.statusCode).toBe(403);
    const stranger = await h.signIn();
    expect((await h.request('POST', `/v1/companies/${company.id}/own`, { cookie: stranger.cookie })).statusCode).toBe(404);
    expect((await h.request('POST', `/v1/companies/${MISSING_ID}/own`, { cookie: owner.cookie })).statusCode).toBe(404);

    const owned = await h.request('POST', `/v1/companies/${company.id}/own`, { cookie: owner.cookie });
    expect(owned.statusCode).toBe(200);
    expect(owned.json<CompanyDto>().relationship).toBe('own');
    expect((await h.request('POST', `/v1/companies/${company.id}/own`, { cookie: owner.cookie })).statusCode).toBe(200);
    const audit = await h.admin.query<{ metadata: Record<string, unknown> }>(`SELECT metadata FROM audit_log WHERE action = 'company.owned' AND target = $1`, [company.id]);
    expect(audit.rows).toEqual([{ metadata: { from: 'follow', to: 'own' } }]);

    const routes = evidenceRoutes();
    expect((await routes.find((item) => item.name === 'answers')?.send(member))?.statusCode).toBe(200);
    expect((await routes.find((item) => item.name === 'attestation')?.send(member))?.statusCode).toBe(200);
    expect((await routes.find((item) => item.name === 'deadline done')?.send(member))?.statusCode).toBe(200);
    expect((await routes.find((item) => item.name === 'deadline undone')?.send(member))?.statusCode).toBe(200);
    expect((await routes.find((item) => item.name === 'upload')?.send(member))?.statusCode).toBe(202);
    await h.queue.drain();
  });
});

describe('the watchlist', () => {
  let h: Harness;
  let owner: SignedIn;

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
  });
  afterAll(() => h.close());

  it('is empty at first, and says how many the plan allows', async () => {
    expect(await watchlist(h, owner)).toMatchObject({ companies: [], used: 0, limit: 25, monitoring: { on: false } });
  });

  it('follows a registry candidate, scans its public record, and keeps it off the company list', async () => {
    const response = await follow(h, owner, { legalName: 'Kestrel Pay UK Ltd', incorporationCountry: 'GB', registrationNumber: '09876543' });
    expect(response.statusCode).toBe(201);
    const body = response.json<{ company: CompanyDto; scanId: string }>();
    expect(body.company).toMatchObject({ legalName: 'Kestrel Pay UK Ltd', relationship: 'follow' });
    await h.queue.drain();

    const scan = (await h.request('GET', `/v1/scans/${body.scanId}`, { cookie: owner.cookie })).json<{ status: string }>();
    expect(scan.status).toMatch(/completed|partial/);
    const [item] = (await watchlist(h, owner)).companies;
    expect(item).toMatchObject({ companyId: body.company.id, legalName: 'Kestrel Pay UK Ltd', scanInProgress: false, countryCoverage: { level: 'full' } });
    expect(item?.score.kind).toBe('exact');
    expect(item?.coverage?.total).toBeGreaterThan(0);
    expect(item?.lastScannedAt).not.toBeNull();
    // The follower has no answers or documents for it, so nothing that needs them counts.
    const evidence = await h.admin.query(`SELECT 1 FROM answer WHERE company_id = $1`, [body.company.id]);
    expect(evidence.rows).toHaveLength(0);

    const own = (await h.request('GET', '/v1/companies', { cookie: owner.cookie })).json<{ companies: CompanyDto[] }>();
    expect(own.companies.map((row) => row.id)).not.toContain(body.company.id);
    const follows = (await h.request('GET', '/v1/companies?relationship=follow', { cookie: owner.cookie })).json<{ companies: CompanyDto[] }>();
    expect(follows.companies.map((row) => row.id)).toEqual([body.company.id]);
    const all = (await h.request('GET', '/v1/companies?relationship=all', { cookie: owner.cookie })).json<{ companies: CompanyDto[] }>();
    expect(all.companies.map((row) => row.id)).toContain(body.company.id);
    expect((await h.request('GET', '/v1/companies?relationship=borrow', { cookie: owner.cookie })).statusCode).toBe(400);

    // Who you follow is your business: the audit line has the country, not the name.
    const audit = await h.admin.query<{ metadata: Record<string, unknown> }>(`SELECT metadata FROM audit_log WHERE action = 'company.followed' AND target = $1`, [body.company.id]);
    expect(audit.rows).toEqual([{ metadata: { country: 'GB' } }]);
  });

  it('follows a company in any country, with its coverage level', async () => {
    const company = await followed(h, owner, { legalName: 'Serengeti Logistics Ltd', incorporationCountry: 'TZ' });
    const item = (await watchlist(h, owner)).companies.find((row) => row.companyId === company.id);
    expect(item?.countryCoverage.level).toBe('international');
    expect(item?.countryCoverage.sentence).toMatch(/Tanzania/);
    expect((await follow(h, owner, { legalName: 'Nowhere Ltd', incorporationCountry: 'XX' })).statusCode).toBe(400);
    expect((await follow(h, owner, { incorporationCountry: 'GB' })).statusCode).toBe(400);
  });

  it('refuses a company already followed, or already owned', async () => {
    const again = await follow(h, owner, { legalName: 'Kestrel Pay UK Ltd', incorporationCountry: 'GB', registrationNumber: '09876543' });
    expect(again.statusCode).toBe(409);
    expect(errorOf(again)).toEqual({ code: 'company_exists', message: 'You already follow this company.' });
    const byName = await follow(h, owner, { legalName: 'serengeti logistics ltd', incorporationCountry: 'TZ' });
    expect(errorOf(byName).code).toBe('company_exists');
    await createCompany(h, owner, { legalName: 'Mine Ltd', incorporationCountry: 'GB', registrationNumber: '11112222' });
    const mine = await follow(h, owner, { legalName: 'Mine Ltd', incorporationCountry: 'GB', registrationNumber: '11112222' });
    expect(errorOf(mine)).toEqual({ code: 'company_exists', message: 'This company is already one of yours, so there is no need to follow it.' });
    // The same number in another country is another company.
    expect((await follow(h, owner, { legalName: 'Kestrel Pay Ltd', incorporationCountry: 'NG', registrationNumber: '09876543' })).statusCode).toBe(201);
    await h.queue.drain();
  });

  it('stops at the plan limit, and a Free plan sees a range', async () => {
    const free = await h.signIn();
    for (const name of ['One Ltd', 'Two Ltd', 'Three Ltd']) await followed(h, free, { legalName: name, incorporationCountry: 'GB' });
    const fourth = await follow(h, free, { legalName: 'Four Ltd', incorporationCountry: 'GB' });
    expect(fourth.statusCode).toBe(403);
    expect(errorOf(fourth)).toEqual({ code: 'follow_limit_reached', message: 'Your plan lets you follow 3 companies. Stop following one to add another, or move to a bigger plan.' });
    const list = await watchlist(h, free);
    expect(list).toMatchObject({ used: 3, limit: 3 });
    for (const item of list.companies) {
      expect(item.score.kind).not.toBe('exact');
      expect(item.score.value).toBeUndefined();
    }
    // Own companies don't count towards it.
    await createCompany(h, free, { legalName: 'Free Own Ltd' });
    expect((await follow(h, free, { legalName: 'Five Ltd', incorporationCountry: 'GB' })).statusCode).toBe(403);
  });

  it('stops following: the company and its scans go; your own companies are not removed this way', async () => {
    const company = await followed(h, owner, { legalName: 'Short Stay Ltd', incorporationCountry: 'GB' });
    const removed = await h.request('DELETE', `/v1/watchlist/${company.id}`, { cookie: owner.cookie });
    expect(removed.statusCode).toBe(200);
    expect((await h.request('GET', `/v1/companies/${company.id}`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.admin.query(`SELECT 1 FROM scan WHERE company_id = $1`, [company.id])).rows).toHaveLength(0);
    expect((await h.admin.query(`SELECT 1 FROM audit_log WHERE action = 'company.unfollowed' AND target = $1`, [company.id])).rows).toHaveLength(1);
    expect((await h.request('DELETE', `/v1/watchlist/${company.id}`, { cookie: owner.cookie })).statusCode).toBe(404);

    const mine = await createCompany(h, owner, { legalName: 'Keep Me Ltd' });
    const refused = await h.request('DELETE', `/v1/watchlist/${mine.id}`, { cookie: owner.cookie });
    expect(refused.statusCode).toBe(409);
    expect(errorOf(refused).code).toBe('invalid_state');
  });

  it('permissions and tenancy', async () => {
    const company = await followed(h, owner, { legalName: 'Shared Interest Ltd', incorporationCountry: 'GB' });
    const member = await addMember(h, owner, 'member');
    const readOnly = await addMember(h, owner, 'lawyer');
    expect((await follow(h, readOnly, { legalName: 'Not Allowed Ltd', incorporationCountry: 'GB' })).statusCode).toBe(403);
    expect((await h.request('DELETE', `/v1/watchlist/${company.id}`, { cookie: readOnly.cookie })).statusCode).toBe(403);
    expect((await watchlist(h, readOnly)).companies.map((row) => row.companyId)).toContain(company.id);
    expect((await follow(h, member, { legalName: 'Member Pick Ltd', incorporationCountry: 'GB' })).statusCode).toBe(201);
    await h.queue.drain();

    // Another organisation can follow the same company: its own row, its own scan, nothing shared.
    const stranger = await h.signIn();
    expect((await watchlist(h, stranger)).companies).toEqual([]);
    expect((await h.request('DELETE', `/v1/watchlist/${company.id}`, { cookie: stranger.cookie })).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${company.id}/history`, { cookie: stranger.cookie })).statusCode).toBe(404);
    const theirs = await followed(h, stranger, { legalName: 'Shared Interest Ltd', incorporationCountry: 'GB' });
    expect(theirs.id).not.toBe(company.id);
    expect((await watchlist(h, owner)).companies.map((row) => row.companyId)).not.toContain(theirs.id);
    expect((await h.request('GET', '/v1/watchlist')).statusCode).toBe(401);
  });
});

describe('proof on an issue', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  interface Detail {
    proof: { slotKey: string; label: string; state: string }[];
    canAddEvidence: boolean;
  }
  const detail = async (who: SignedIn, companyId: string, ruleKey: string) =>
    (await h.request('GET', `/v1/companies/${companyId}/issues/${ruleKey}`, { cookie: who.cookie })).json<Detail>();

  it('lists the documents that clear it, and an owning team on a vault plan can add them', async () => {
    const owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    const company = await scannedCompany(h, owner, { legalName: 'Proof Ltd' });
    const vault = (await h.request('GET', `/v1/companies/${company.id}/documents`, { cookie: owner.cookie })).json<{ slots: { key: string; label: string; ruleKeys: string[] }[] }>();
    const slot = vault.slots.find((item) => item.ruleKeys.includes(DOC_RULE));
    expect(slot).toBeDefined();
    const before = await detail(owner, company.id, DOC_RULE);
    expect(before.canAddEvidence).toBe(true);
    expect(before.proof).toContainEqual({ slotKey: slot?.key, label: slot?.label, state: 'missing' });

    await fileDocument(h, owner, company.id, slot?.key ?? '');
    const after = await detail(owner, company.id, DOC_RULE);
    expect(after.proof.find((item) => item.slotKey === slot?.key)?.state).not.toBe('missing');

    // Followed: the same list, and no upload.
    await h.admin.query(`UPDATE company SET relationship = 'follow' WHERE id = $1`, [company.id]);
    const followedView = await detail(owner, company.id, DOC_RULE);
    expect(followedView.canAddEvidence).toBe(false);
    expect(followedView.proof.map((item) => item.slotKey)).toContain(slot?.key);
  });

  it('on Free the list is there, without the upload', async () => {
    const free = await h.signIn();
    const company = await scannedCompany(h, free, { legalName: 'Free Proof Ltd' });
    const issues = (await h.request('GET', `/v1/companies/${company.id}/issues`, { cookie: free.cookie })).json<{ issues: { ruleKey: string }[] }>();
    const first = issues.issues[0];
    expect(first).toBeDefined();
    const body = await detail(free, company.id, first?.ruleKey ?? '');
    expect(body.canAddEvidence).toBe(false);
    expect(Array.isArray(body.proof)).toBe(true);
  });
});

describe('history and what changed', () => {
  let h: Harness;
  let owner: SignedIn;
  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
  });
  afterAll(() => h.close());

  interface History {
    companyId: string;
    scans: {
      scanId: string;
      kind: string;
      trigger: string;
      finishedAt: string;
      score: { kind: string; value?: number };
      statusWord: string | null;
      coverage: { counted: number; total: number } | null;
      methodVersion: string;
      rulePackVersions: Record<string, string>;
      change: { newIssues: number; newUrgent: number; resolvedIssues: number; scoreBefore: number | null; scoreAfter: number | null; summary: string; trigger: string } | null;
    }[];
  }
  const history = async (who: SignedIn, companyId: string) => {
    const response = await h.request('GET', `/v1/companies/${companyId}/history`, { cookie: who.cookie });
    expect(response.statusCode).toBe(200);
    return response.json<History>();
  };
  const whatChanged = async (who: SignedIn, companyId: string) =>
    (await h.request('GET', `/v1/companies/${companyId}/overview`, { cookie: who.cookie })).json<{ whatChanged: { newIssues: number; summary: string; trigger: string } | null }>().whatChanged;

  it('a company with no scans has an empty history, and nothing changed', async () => {
    const company = await createCompany(h, owner, { legalName: 'Unscanned Ltd' });
    expect(await history(owner, company.id)).toEqual({ companyId: company.id, scans: [] });
    expect(await whatChanged(owner, company.id)).toBeNull();
    expect((await h.request('GET', `/v1/companies/${MISSING_ID}/history`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${company.id}/history`)).statusCode).toBe(401);
  });

  it('lists every finished scan newest first, with versions and what each one changed', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'History Ltd' });
    const first = await history(owner, company.id);
    expect(first.scans).toHaveLength(1);
    expect(first.scans[0]).toMatchObject({ kind: 'full', trigger: 'user', methodVersion: '2026.11-draft.7', change: null });
    expect(first.scans[0]?.score.kind).toBe('exact');
    expect(Object.keys(first.scans[0]?.rulePackVersions ?? {})).toContain('GB');
    // The first look: nothing to compare with yet.
    expect(await whatChanged(owner, company.id)).toBeNull();

    // A new answer opens an urgent issue.
    await answer(h, owner, company.id, { ...GB_ANSWERS, ip_founders_signed: false });
    await h.queue.drain();
    const second = await history(owner, company.id);
    expect(second.scans.map((item) => item.kind)).toEqual(['rescore', 'full']);
    const change = second.scans[0]?.change;
    expect(change).toMatchObject({ trigger: 'answers' });
    expect(change?.newIssues).toBeGreaterThan(0);
    expect(change?.scoreBefore).toBe(first.scans[0]?.score.value);
    expect(change?.scoreAfter).toBe(second.scans[0]?.score.value);
    expect(change?.summary).toMatch(/new issue/);
    expect((second.scans[0]?.finishedAt ?? '') >= (second.scans[1]?.finishedAt ?? '')).toBe(true);

    // Home says so, and keeps saying so on the next visit, until another scan lands.
    expect((await whatChanged(owner, company.id))?.newIssues).toBe(change?.newIssues);
    expect((await whatChanged(owner, company.id))?.newIssues).toBe(change?.newIssues);
    // Someone who has never looked sees the newest change too.
    const colleague = await addMember(h, owner, 'member');
    expect((await whatChanged(colleague, company.id))?.newIssues).toBe(change?.newIssues);

    // A manual scan that finds the same: nothing new since the last look.
    await scanNow(h, owner, company.id);
    expect(await whatChanged(owner, company.id)).toBeNull();
    expect((await history(owner, company.id)).scans).toHaveLength(3);
  });

  it('on Free, scores are ranges and no exact number leaks through a change', async () => {
    const free = await h.signIn();
    const company = await scannedCompany(h, free, { legalName: 'Free History Ltd' });
    await answer(h, free, company.id, { ...GB_ANSWERS, ip_founders_signed: false });
    await h.queue.drain();
    const body = await history(free, company.id);
    expect(body.scans).toHaveLength(2);
    for (const item of body.scans) {
      expect(item.score.kind).not.toBe('exact');
      expect(item.score.value).toBeUndefined();
    }
    expect(body.scans[0]?.change?.scoreBefore ?? null).toBeNull();
    expect(body.scans[0]?.change?.scoreAfter ?? null).toBeNull();
    const stranger = await h.signIn();
    expect((await h.request('GET', `/v1/companies/${company.id}/history`, { cookie: stranger.cookie })).statusCode).toBe(404);
  });
});

describe('deadline reminders', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('skip followed companies: followers hear of changes through watchlist alerts only', async () => {
    const owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    const mine = await scannedCompany(h, owner, { legalName: 'Remind Me Ltd' });
    const theirs = await followed(h, owner, { legalName: 'Not My Filing Ltd', incorporationCountry: 'GB' });
    const due = new Date(Date.now() + 20 * 86_400_000).toISOString().slice(0, 10);
    for (const [companyId, title] of [[mine.id, 'Own reminder'], [theirs.id, 'Followed reminder']] as const) {
      await h.admin.query(`INSERT INTO deadline (organisation_id, company_id, rule_key, title, due_on, monitoring) VALUES ($1, $2, 'GB.TEST.REMIND', $3, $4, 'reminder')`, [owner.organisationId, companyId, title, due]);
    }
    await sendDeadlineReminders(h.deps);
    const { rows } = await h.admin.query<{ title: string; body: string }>(`SELECT title, body FROM notification WHERE organisation_id = $1 AND kind = 'deadline'`, [owner.organisationId]);
    expect(rows.map((row) => row.title)).toContain('Own reminder is due within a month');
    // Nothing about the followed company: not its own filing dates, nor the one added here.
    expect(rows.filter((row) => row.body.startsWith('Not My Filing Ltd') || row.title.startsWith('Followed reminder'))).toEqual([]);
  });
});

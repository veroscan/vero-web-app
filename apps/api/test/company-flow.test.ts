import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addMember, errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, fileDocument, GB_ANSWERS, makeStaff, MISSING_ID, scanNow, scannedCompany, setPlan, type CompanyBody } from './support/product';

interface SearchBody {
  outcome: string;
  sourceName: string;
  message: string;
  candidates: { name: string; registrationNumber: string | null; incorporatedOn: string | null; matchConfidence: number }[];
  sampleData: boolean;
}
interface QuestionnaireBody {
  questions: { id: string; title: string; fields: { id: string; value: unknown; type: string }[] }[];
  answeredFields: number;
  visibleFields: number;
  complete: boolean;
  rescoreQueued: boolean;
}

describe('company search and confirm', () => {
  let h: Harness;
  let owner: SignedIn;
  const search = (query: string, who = owner) => h.request('GET', `/v1/registry/search?${query}`, { cookie: who.cookie });

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
  });
  afterAll(() => h.close());

  it.each([
    ['GB', 'Kestrel Pay UK Ltd', 'Companies House', '14839221'],
    ['US-DE', 'Kestrel Pay Inc.', 'our licensed data provider', '7741209'],
    ['NG', 'Kestrel Pay Nigeria Ltd', 'CAC, through our licensed data provider', '1849302'],
  ])('finds a company on the %s register, and marks fixture data as a sample', async (country, q, sourceName, number) => {
    const response = await search(`country=${country}&q=${encodeURIComponent(q)}`);
    expect(response.statusCode).toBe(200);
    const body = response.json<SearchBody>();
    expect(body).toMatchObject({ outcome: 'found', sourceName, sampleData: true });
    expect(body.candidates[0]).toMatchObject({ registrationNumber: number, matchConfidence: 1 });
  });

  it('also searches by number', async () => {
    const response = await search('country=GB&q=14839221');
    expect(response.json<SearchBody>().outcome).toBe('found');
  });

  it('never presents "not found" as proof of absence', async () => {
    const body = (await search('country=GB&q=Ghost%20Ltd')).json<SearchBody>();
    expect(body.outcome).toBe('not_found');
    expect(body.message).toMatch(/doesn't prove it isn't registered/);
    expect(body.candidates).toEqual([]);
  });

  it('gives choices when more than one matches', async () => {
    const body = (await search('country=NG&q=Twin%20Co')).json<SearchBody>();
    expect(body.outcome).toBe('ambiguous');
    expect(body.candidates.length).toBeGreaterThan(1);
  });

  it.each(['Broken Ltd', 'Offline Ltd'])('says plainly when the register is down: %s', async (name) => {
    const body = (await search(`country=GB&q=${encodeURIComponent(name)}`)).json<SearchBody>();
    expect(body.outcome).toBe('source_down');
    expect(body.message).toMatch(/can't reach/);
  });

  it.each([
    ['no country', 'q=Kestrel'],
    ['an unknown country code', 'country=ZZ&q=Kestrel'],
    ['no search', 'country=GB'],
    ['a search too short', 'country=GB&q=K'],
  ])('refuses %s', async (_label, query) => {
    const response = await search(query);
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('invalid_input');
  });

  it('needs permission, and is rate limited', async () => {
    expect((await h.request('GET', '/v1/registry/search?country=GB&q=Kestrel')).statusCode).toBe(401);
    const lawyer = await addMember(h, owner, 'lawyer');
    expect((await search('country=GB&q=Kestrel', lawyer)).statusCode).toBe(403);

    const limited = await startHarness({ RATE_LIMIT_REGISTRY_SEARCH_PER_ORG_PER_HOUR: '2' });
    try {
      const person = await limited.signIn();
      const go = () => limited.request('GET', '/v1/registry/search?country=GB&q=Kestrel', { cookie: person.cookie });
      expect((await go()).statusCode).toBe(200);
      expect((await go()).statusCode).toBe(200);
      const third = await go();
      expect(third.statusCode).toBe(429);
      expect(errorOf(third).code).toBe('rate_limited');
    } finally {
      await limited.close();
    }
  });

  it('confirms a found company as a company, with its year end', async () => {
    const response = await h.request('POST', '/v1/companies', {
      cookie: owner.cookie,
      body: { legalName: 'Confirmed Ltd', incorporationCountry: 'GB', registrationNumber: '14839221', yearEnd: { month: 3, day: 31 } },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ registrationNumber: '14839221', preIncorporation: false, parentCompanyId: null, yearEnd: { month: 3, day: 31 } });
    const bad = await h.request('POST', '/v1/companies', { cookie: owner.cookie, body: { legalName: 'Bad', incorporationCountry: 'GB', yearEnd: { month: 2, day: 31 } } });
    expect(bad.statusCode).toBe(400);
  });

  it('starts a company that does not exist yet, and asks only what applies', async () => {
    const company = await createCompany(h, owner, { legalName: 'Not Yet Ltd', preIncorporation: true });
    const scan = await scanNow(h, owner, company.id);
    expect(scan.status).toBe('completed');
    const facts = await h.admin.query<{ value: unknown }>(`SELECT value FROM fact WHERE company_id = $1 AND key = 'company.incorporated'`, [company.id]);
    expect(facts.rows[0]?.value).toBe(false);
    // Stage 1: nothing that starts at incorporation applies yet.
    const findings = await h.admin.query<{ detail: { reason: string } }>(`SELECT detail FROM finding WHERE scan_id = $1 AND rule_key = 'GB.CORP.STATUS'`, [scan.id]);
    expect(findings.rows[0]?.detail.reason).toBe('before_stage');
  });

  it('adds related companies, and keeps them in the family', async () => {
    const parent = await createCompany(h, owner, { legalName: 'Parent Inc.', incorporationCountry: 'US-DE' });
    const added = await h.request('POST', `/v1/companies/${parent.id}/related`, {
      cookie: owner.cookie,
      body: { legalName: 'Child Ltd', incorporationCountry: 'GB' },
    });
    expect(added.statusCode).toBe(201);
    expect(added.json()).toMatchObject({ parentCompanyId: parent.id });
    const list = await h.request('GET', `/v1/companies/${parent.id}/related`, { cookie: owner.cookie });
    expect(list.json<{ companies: CompanyBody[] }>().companies.map((item) => item.legalName)).toEqual(['Child Ltd']);

    expect((await h.request('POST', `/v1/companies/${parent.id}/related`, { cookie: owner.cookie, body: { legalName: 'X' } })).statusCode).toBe(400);
    expect((await h.request('POST', `/v1/companies/${MISSING_ID}/related`, { cookie: owner.cookie, body: { legalName: 'X', incorporationCountry: 'GB' } })).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${MISSING_ID}/related`, { cookie: owner.cookie })).statusCode).toBe(404);
  });

  it('a parent must be in the same organisation', async () => {
    const stranger = await h.signIn();
    const theirs = await createCompany(h, stranger, { legalName: 'Theirs Ltd' });
    const viaBody = await h.request('POST', '/v1/companies', { cookie: owner.cookie, body: { legalName: 'Sneak Ltd', incorporationCountry: 'GB', parentCompanyId: theirs.id } });
    expect(viaBody.statusCode).toBe(404);
    const viaRoute = await h.request('POST', `/v1/companies/${theirs.id}/related`, { cookie: owner.cookie, body: { legalName: 'Sneak Ltd', incorporationCountry: 'GB' } });
    expect(viaRoute.statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${theirs.id}/related`, { cookie: owner.cookie })).statusCode).toBe(404);
    // And the database agrees, even without the API.
    await expect(
      h.admin.query(`INSERT INTO company (organisation_id, legal_name, incorporation_country, parent_company_id) VALUES ($1, 'Direct', 'GB', $2)`, [owner.organisationId, theirs.id]),
    ).rejects.toThrow(/foreign key/);
  });
});

describe('questionnaire', () => {
  let h: Harness;
  let owner: SignedIn;
  let company: CompanyBody;
  const read = async (id = company.id, who = owner) => (await h.request('GET', `/v1/companies/${id}/questionnaire`, { cookie: who.cookie })).json<QuestionnaireBody>();
  const save = (answers: unknown, id = company.id, who = owner) => h.request('PATCH', `/v1/companies/${id}/questionnaire`, { cookie: who.cookie, body: { answers } });
  const fieldIds = (body: QuestionnaireBody) => body.questions.flatMap((question) => question.fields.map((field) => field.id));

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    company = await createCompany(h, owner, { legalName: 'Questions Ltd' });
  });
  afterAll(() => h.close());

  it('serves the questions, with the company’s own details already filled in', async () => {
    const body = await read();
    expect(body.questions[0]?.title).toBe('Tell us about this company');
    const first = body.questions[0]?.fields ?? [];
    expect(first.find((field) => field.id === 'jurisdiction')?.value).toBe('GB');
    expect(first.find((field) => field.id === 'incorporated')?.value).toBe(true);
    expect(body.complete).toBe(false);
  });

  it('asks only what applies to this country', async () => {
    const ids = fieldIds(await read());
    expect(ids).toContain('entity_type_gb');
    expect(ids).toContain('has_premises');
    expect(ids).not.toContain('entity_type_us');
    expect(ids).not.toContain('ng_small_company');
    const nigeria = await createCompany(h, owner, { legalName: 'Nigeria Ltd', incorporationCountry: 'NG' });
    expect(fieldIds(await read(nigeria.id))).toContain('ng_small_company');
  });

  it('follow-up questions appear and disappear with the answers', async () => {
    const person = await h.signIn();
    const target = await createCompany(h, person);
    expect(fieldIds(await read(target.id, person))).not.toContain('employee_countries');
    const answered = await save({ has_employees: true }, target.id, person);
    expect(answered.statusCode).toBe(200);
    expect(fieldIds(answered.json<QuestionnaireBody>())).toContain('employee_countries');
    const off = await save({ has_employees: false }, target.id, person);
    expect(fieldIds(off.json<QuestionnaireBody>())).not.toContain('employee_countries');
  });

  it('answers become facts, and a hidden follow-up takes its stated default', async () => {
    const person = await h.signIn();
    const target = await createCompany(h, person);
    await save({ has_employees: false, processes_personal_data: true, has_contractors: true }, target.id, person);
    const { rows } = await h.admin.query<{ key: string; value: unknown; origin: string; verification_tier: number; source: string }>(
      `SELECT key, value, origin, verification_tier, source FROM fact WHERE company_id = $1`,
      [target.id],
    );
    const facts = new Map(rows.map((row) => [row.key, row]));
    expect(facts.get('answers.has_employees')).toMatchObject({ value: false, origin: 'answer', verification_tier: 5, source: 'questionnaire' });
    expect(facts.get('company.jurisdiction')?.value).toBe('GB');
    // Hidden, so it says what "no employees" means rather than staying unknown.
    expect(facts.get('answers.has_foreign_workers')?.value).toBe(false);
    expect(facts.get('answers.employee_countries')?.value).toEqual([]);
  });

  it('editing replaces, and null clears', async () => {
    const person = await h.signIn();
    const target = await createCompany(h, person);
    await save({ revenue_band: 'none' }, target.id, person);
    await save({ revenue_band: 'under_1m' }, target.id, person);
    const value = async () => (await read(target.id, person)).questions.flatMap((question) => question.fields).find((field) => field.id === 'revenue_band')?.value;
    expect(await value()).toBe('under_1m');
    await save({ revenue_band: null }, target.id, person);
    expect(await value()).toBeNull();
    const count = await h.admin.query<{ n: string }>(`SELECT count(*) AS n FROM fact WHERE company_id = $1 AND key = 'answers.revenue_band'`, [target.id]);
    expect(count.rows[0]?.n).toBe('0');
  });

  /** Text fields with a format need an answer in that format. */
  const TEXT_ANSWERS: Record<string, string> = { vat_number: 'GB123456789', ico_registration_number: 'ZA123456', us_trademark_serials: '97123456', eu_trademark_numbers: '018123456', lei: '5493001KJTIIGC8Y1R12' };

  it('reaches complete when everything showing has an answer', async () => {
    const person = await h.signIn();
    const target = await createCompany(h, person);
    await answer(h, person, target.id);
    let body = await read(target.id, person);
    const missing = () => body.questions.flatMap((question) => question.fields).filter((field) => field.value === null);
    for (let round = 0; round < 6 && missing().length > 0; round += 1) {
      const fill: Record<string, unknown> = {};
      for (const field of missing()) {
        const options = body.questions.flatMap((q) => q.fields).find((item) => item.id === field.id) as unknown as { options: { value: string }[] | null };
        fill[field.id] =
          field.type === 'boolean' ? false
          : field.type === 'number' ? 1
          : field.type === 'date' ? '2026-01-01'
          : field.type === 'text' ? (TEXT_ANSWERS[field.id] ?? 'https://a.example')
          : field.type === 'multi' ? [options.options?.[0]?.value ?? '']
          : options.options?.[0]?.value;
      }
      expect((await save(fill, target.id, person)).statusCode).toBe(200);
      body = await read(target.id, person);
    }
    expect(body.complete).toBe(true);
    expect(body.answeredFields).toBe(body.visibleFields);
  });

  it.each([
    ['a question we do not ask', { made_up: true }],
    ['the wrong type', { has_employees: 'yes' }],
    ['an option that does not exist', { revenue_band: 'billions' }],
    ['a date that does not exist', { has_employees: true, last_hire_on: '2026-02-31' }],
    ['a negative number', { processes_personal_data: true, data_subjects_gb_12m: -1 }],
    ['a list with a bad value', { user_countries: ['MARS'] }],
    ['another country', { jurisdiction: 'NG' }],
    ['nothing at all', {}],
    ['not a list of answers', 'nope'],
  ])('refuses %s', async (_label, answers) => {
    const person = await h.signIn();
    const target = await createCompany(h, person);
    const response = await save(answers, target.id, person);
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('invalid_input');
  });

  it('a follow-up that is invalid and also showing is refused; saving what is wrong leaves nothing behind', async () => {
    const person = await h.signIn();
    const target = await createCompany(h, person);
    await save({ has_employees: true, last_hire_on: 'soon' }, target.id, person);
    const { rows } = await h.admin.query(`SELECT 1 FROM answer WHERE company_id = $1`, [target.id]);
    expect(rows).toEqual([]);
  });

  it('attestations: "you told us", only for what the rules ask', async () => {
    const person = await h.signIn();
    await setPlan(h, person.organisationId, 'growth');
    const target = await scannedCompany(h, person, { legalName: 'Attest Ltd' });
    const attest = (body: unknown) => h.request('POST', `/v1/companies/${target.id}/attestations`, { cookie: person.cookie, body });
    const ok = await attest({ key: 'gb_rights_procedure', value: true });
    expect(ok.statusCode).toBe(200);
    expect(ok.json()).toMatchObject({ rescoreQueued: true });
    await h.queue.drain();
    const { rows } = await h.admin.query<{ verification_tier: number; origin: string }>(`SELECT verification_tier, origin FROM fact WHERE company_id = $1 AND key = 'attest.gb_rights_procedure'`, [target.id]);
    expect(rows[0]).toEqual({ verification_tier: 5, origin: 'answer' });
    expect((await attest({ key: 'made_up', value: true })).statusCode).toBe(400);
    expect((await attest({ key: 'gb_rights_procedure' })).statusCode).toBe(400);
    // "No" is kept: it's a definite answer, not an empty one.
    expect((await attest({ key: 'gb_rights_procedure', value: false })).statusCode).toBe(200);
    await h.queue.drain();
    const after = await h.admin.query<{ value: unknown }>(`SELECT value FROM fact WHERE company_id = $1 AND key = 'attest.gb_rights_procedure'`, [target.id]);
    expect(after.rows).toEqual([{ value: false }]);
  });

  it('permissions and tenancy', async () => {
    expect((await h.request('GET', `/v1/companies/${company.id}/questionnaire`)).statusCode).toBe(401);
    expect((await h.request('GET', `/v1/companies/${MISSING_ID}/questionnaire`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await save({ has_app: true }, MISSING_ID)).statusCode).toBe(404);
    const lawyer = await addMember(h, owner, 'lawyer');
    expect((await h.request('GET', `/v1/companies/${company.id}/questionnaire`, { cookie: lawyer.cookie })).statusCode).toBe(200);
    expect((await save({ has_app: true }, company.id, lawyer)).statusCode).toBe(403);
    const stranger = await h.signIn();
    expect((await h.request('GET', `/v1/companies/${company.id}/questionnaire`, { cookie: stranger.cookie })).statusCode).toBe(404);
    expect((await save({ has_app: true }, company.id, stranger)).statusCode).toBe(404);
    expect((await h.request('POST', `/v1/companies/${company.id}/attestations`, { cookie: stranger.cookie, body: { key: 'gb_rights_procedure', value: true } })).statusCode).toBe(404);
  });

  it('audit records which questions changed, never the answers', async () => {
    const person = await h.signIn();
    const target = await createCompany(h, person);
    await save({ has_website: true, website_url: 'https://very-private-address.example' }, target.id, person);
    const { rows } = await h.admin.query<{ text: string }>(`SELECT audit_log::text AS text FROM audit_log WHERE target = $1 AND action = 'answers.updated'`, [target.id]);
    expect(rows[0]?.text).toContain('website_url');
    expect(rows[0]?.text).not.toContain('very-private-address');
  });
});

describe('deadlines', () => {
  let h: Harness;
  let owner: SignedIn;
  let company: CompanyBody;

  interface DeadlineBody {
    id: string;
    ruleKey: string;
    title: string;
    dueOn: string;
    state: string;
    daysUntil: number;
    monitoring: string;
    howWeTrack: string;
    needsReview: boolean;
  }
  const list = async (query = '', who = owner) => (await h.request('GET', `/v1/deadlines${query}`, { cookie: who.cookie })).json<{ deadlines: DeadlineBody[]; undated: { ruleKey: string; waitingOn: string }[] }>();

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    company = await createCompany(h, owner, { legalName: 'Kestrel Pay UK Ltd', yearEnd: { month: 3, day: 31 } });
    await answer(h, owner, company.id);
    await scanNow(h, owner, company.id);
  });
  afterAll(() => h.close());

  it('turns rule recurrence into dated obligations, sorted, with automatic and reminded apart', async () => {
    const { deadlines, undated } = await list(`?companyId=${company.id}`);
    expect(deadlines.length).toBeGreaterThan(3);
    const dates = deadlines.map((item) => item.dueOn);
    expect([...dates].sort()).toEqual(dates);
    const confirmation = deadlines.find((item) => item.ruleKey === 'GB.CORP.CONFIRMATION_STATEMENT');
    expect(confirmation).toMatchObject({ dueOn: '2026-10-12', state: 'overdue', monitoring: 'auto', howWeTrack: 'We check this with Companies House' });
    expect(confirmation?.daysUntil).toBeLessThan(0);
    expect(deadlines.some((item) => item.monitoring === 'reminder' && item.howWeTrack === "We'll remind you and ask for proof")).toBe(true);
    expect(Array.isArray(undated)).toBe(true);
    for (const item of undated) expect(item.waitingOn.length).toBeGreaterThan(3);
  });

  it('filters by state', async () => {
    const overdue = await list(`?companyId=${company.id}&state=overdue`);
    expect(overdue.deadlines.every((item) => item.state === 'overdue')).toBe(true);
    expect(overdue.deadlines.length).toBeGreaterThan(0);
    expect((await h.request('GET', '/v1/deadlines?state=soon', { cookie: owner.cookie })).statusCode).toBe(400);
  });

  it('re-scoring does not duplicate a date', async () => {
    const before = await h.admin.query<{ n: string }>(`SELECT count(*) AS n FROM deadline WHERE company_id = $1`, [company.id]);
    await h.request('PATCH', `/v1/companies/${company.id}/questionnaire`, { cookie: owner.cookie, body: { answers: { has_app: true } } });
    await h.queue.drain();
    const after = await h.admin.query<{ n: string }>(`SELECT count(*) AS n FROM deadline WHERE company_id = $1`, [company.id]);
    expect(after.rows[0]?.n).toBe(before.rows[0]?.n);
  });

  it('reminders go out once per band, however often the job runs', async () => {
    const { sendDeadlineReminders } = await import('../src/modules/deadlines/routes');
    await sendDeadlineReminders(h.deps);
    await sendDeadlineReminders(h.deps);
    const { rows } = await h.admin.query<{ title: string; n: string }>(
      `SELECT title, count(*) AS n FROM notification WHERE organisation_id = $1 AND kind = 'deadline' GROUP BY title`,
      [owner.organisationId],
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row.n).toBe('1');
    expect(rows.map((row) => row.title).join()).toMatch(/overdue/);
  });

  it('a later band is a new reminder, for the same date', async () => {
    const { sendDeadlineReminders } = await import('../src/modules/deadlines/routes');
    const person = await h.signIn();
    const target = await createCompany(h, person, { legalName: 'Band Ltd' });
    await scanNow(h, person, target.id);
    const due = new Date(Date.now() + 25 * 86_400_000).toISOString().slice(0, 10);
    await h.admin.query(`INSERT INTO deadline (organisation_id, company_id, rule_key, title, due_on, monitoring) VALUES ($1, $2, 'GB.TEST.BAND', 'Band test', $3, 'reminder')`, [person.organisationId, target.id, due]);
    await sendDeadlineReminders(h.deps);
    h.setNow(new Date(Date.now() + 19 * 86_400_000));
    try {
      await sendDeadlineReminders(h.deps);
      await sendDeadlineReminders(h.deps);
    } finally {
      h.setNow(null);
    }
    const { rows } = await h.admin.query<{ title: string }>(`SELECT title FROM notification WHERE organisation_id = $1 AND title LIKE 'Band test%' ORDER BY created_at`, [person.organisationId]);
    expect(rows.map((row) => row.title)).toEqual(['Band test is due within a month', 'Band test is due within a week']);
  });

  it('a reminded date can be marked done; one we check ourselves cannot', async () => {
    const { deadlines } = await list(`?companyId=${company.id}`);
    const reminded = deadlines.find((item) => item.monitoring === 'reminder');
    const automatic = deadlines.find((item) => item.monitoring === 'auto');
    const done = await h.request('POST', `/v1/deadlines/${reminded?.id}/done`, { cookie: owner.cookie });
    expect(done.statusCode).toBe(200);
    expect(done.json<DeadlineBody>().state).toBe('done');
    const refused = await h.request('POST', `/v1/deadlines/${automatic?.id}/done`, { cookie: owner.cookie });
    expect(refused.statusCode).toBe(409);
    expect(errorOf(refused).code).toBe('invalid_state');
    // It stays done after a re-score.
    await h.request('PATCH', `/v1/companies/${company.id}/questionnaire`, { cookie: owner.cookie, body: { answers: { has_app: false } } });
    await h.queue.drain();
    expect((await list(`?companyId=${company.id}`)).deadlines.find((item) => item.id === reminded?.id)?.state).toBe('done');

    // Taking it back works once, and asking again changes nothing.
    const undone = await h.request('DELETE', `/v1/deadlines/${reminded?.id}/done`, { cookie: owner.cookie });
    expect(undone.statusCode).toBe(200);
    expect(undone.json<DeadlineBody>().state).not.toBe('done');
    expect((await h.request('DELETE', `/v1/deadlines/${reminded?.id}/done`, { cookie: owner.cookie })).statusCode).toBe(200);
    const audit = await h.admin.query(`SELECT 1 FROM audit_log WHERE action = 'deadline.undone' AND target = $1`, [reminded?.id]);
    expect(audit.rows).toHaveLength(1);
    expect((await h.request('POST', `/v1/deadlines/${reminded?.id}/done`, { cookie: owner.cookie })).statusCode).toBe(200);
  });

  it('undoing a date follows the same permissions and tenancy', async () => {
    const { deadlines } = await list(`?companyId=${company.id}`);
    const target = deadlines.find((item) => item.monitoring === 'reminder');
    expect((await h.request('DELETE', `/v1/deadlines/${MISSING_ID}/done`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('DELETE', `/v1/deadlines/${target?.id}/done`)).statusCode).toBe(401);
    const stranger = await h.signIn();
    expect((await h.request('DELETE', `/v1/deadlines/${target?.id}/done`, { cookie: stranger.cookie })).statusCode).toBe(404);
    const lawyer = await addMember(h, owner, 'lawyer');
    expect((await h.request('DELETE', `/v1/deadlines/${target?.id}/done`, { cookie: lawyer.cookie })).statusCode).toBe(403);
  });

  it('input, not found, permissions and tenancy', async () => {
    expect((await h.request('GET', '/v1/deadlines?companyId=nope', { cookie: owner.cookie })).statusCode).toBe(400);
    expect((await h.request('GET', `/v1/deadlines?companyId=${MISSING_ID}`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('POST', `/v1/deadlines/${MISSING_ID}/done`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('GET', '/v1/deadlines')).statusCode).toBe(401);
    const stranger = await h.signIn();
    expect((await list('', stranger)).deadlines).toEqual([]);
    expect((await h.request('GET', `/v1/deadlines?companyId=${company.id}`, { cookie: stranger.cookie })).statusCode).toBe(404);
    const { deadlines } = await list(`?companyId=${company.id}&state=upcoming`);
    expect((await h.request('POST', `/v1/deadlines/${deadlines[0]?.id}/done`, { cookie: stranger.cookie })).statusCode).toBe(404);
    const lawyer = await addMember(h, owner, 'lawyer');
    expect((await h.request('POST', `/v1/deadlines/${deadlines[0]?.id}/done`, { cookie: lawyer.cookie })).statusCode).toBe(403);
  });
});

describe('records', () => {
  let h: Harness;
  let owner: SignedIn;
  interface RecordsBody {
    items: { key: string; label: string; value: string; howWeKnow: string; source: string | null; retrievedAt: string | null; needsYou: boolean; sampleData: boolean }[];
    sources: { connectorId: string; state: string }[];
    statusNote: string | null;
    checkedAt: string | null;
    sampleData: boolean;
  }
  const records = async (id: string, who = owner) => (await h.request('GET', `/v1/companies/${id}/records`, { cookie: who.cookie })).json<RecordsBody>();

  beforeAll(async () => {
    h = await startHarness({ RATE_LIMIT_CHECK_AGAIN_PER_COMPANY_PER_HOUR: '2' });
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
  });
  afterAll(() => h.close());

  it('shows each fact with source, date and plain words on how we know', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Kestrel Pay UK Ltd' });
    const body = await records(company.id);
    const status = body.items.find((item) => item.label === 'Status');
    expect(status).toMatchObject({ value: 'active', source: 'Companies House', sampleData: true });
    expect(status?.howWeKnow).toMatch(/^Checked with Companies House today \(sample data/);
    expect(status?.retrievedAt).toBeTruthy();
    expect(body.statusNote).toBeNull();
    expect(body.checkedAt).toBeTruthy();
    expect(body.sampleData).toBe(true);
    expect(JSON.stringify(body)).not.toMatch(/Tier \d/);
    expect(body.items.find((item) => item.label === 'On the ICO register')).toMatchObject({ value: 'No' });
    expect(body.items.find((item) => item.label === 'Sanctions lists')).toMatchObject({ value: 'No matches' });
  });

  it('shows the rest of what a register holds, each with its source', async () => {
    const uk = await records((await scannedCompany(h, owner, { legalName: 'Kestrel Pay UK Ltd' })).id);
    const value = (body: RecordsBody, label: string) => body.items.find((item) => item.label === label);
    expect(value(uk, 'People with significant control')).toMatchObject({ value: 'Kestrel Pay Inc.', source: 'Companies House', sampleData: true });
    expect(value(uk, 'Director identity checks')?.value).toBe('1');
    expect(value(uk, 'Outstanding charges')?.value).toBe('0');
    expect(value(uk, 'Insolvency cases')?.value).toBe('0');

    const ng = await records((await scannedCompany(h, owner, { legalName: 'Kestrel Pay Nigeria Ltd', incorporationCountry: 'NG' })).id);
    expect(value(ng, 'Shareholders')?.value).toBe('Kestrel Pay Inc. (shareholder)');
    expect(value(ng, 'People with significant control')?.value).toBe('1');
    expect(value(ng, 'Tax ID (TIN)')?.value).toBe('Yes');
  });

  it('Delaware is never live: no certificate says so, and a validated one says "Certified {date}"', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Kestrel Pay Inc.', incorporationCountry: 'US-DE' });
    const before = await records(company.id);
    expect(before.statusNote).toMatch(/Delaware doesn't allow automatic status checks/);
    expect(before.items[0]).toMatchObject({ key: 'good_standing', value: 'No certificate on file', needsYou: true });
    expect(before.items.some((item) => /status/i.test(item.label) && item.key !== 'good_standing')).toBe(false);
    expect(JSON.stringify(before.items)).not.toMatch(/\b(active|in good standing)\b/i);

    // A certificate the person hasn't said they checked isn't enough.
    const unvalidated = await fileDocument(h, owner, company.id, 'de_good_standing', { documentDate: '2026-10-12' });
    expect((await records(company.id)).items[0]?.value).toBe('No certificate on file');
    await h.request('DELETE', `/v1/documents/${unvalidated}`, { cookie: owner.cookie });
    await h.queue.drain();

    await fileDocument(h, owner, company.id, 'de_good_standing', { documentDate: '2026-10-12', validated: true });
    const after = await records(company.id);
    expect(after.items[0]).toMatchObject({ value: 'Certified 12 Oct 2026', needsYou: false, howWeKnow: 'You uploaded this and we read it' });
  });

  it('a vendor status is never shown as Delaware’s status', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Vendor Status Inc.', incorporationCountry: 'US-DE' });
    await h.admin.query(
      `INSERT INTO fact (organisation_id, company_id, key, value, origin, source, source_name, retrieved_at, verification_tier)
       VALUES ($1, $2, 'registry.us.delaware_vendor.vendor_status', '"active"', 'connector', 'us.delaware_vendor', 'our licensed data provider', now(), 2)`,
      [owner.organisationId, company.id],
    );
    const text = JSON.stringify((await records(company.id)).items);
    expect(text).not.toContain('vendor_status');
    expect(text).not.toContain('"active"');
  });

  it('"check again" re-runs that entity’s sources, and is rate limited', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Again Ltd' });
    const go = () => h.request('POST', `/v1/companies/${company.id}/records/check-again`, { cookie: owner.cookie });
    const first = await go();
    expect(first.statusCode).toBe(202);
    await h.queue.drain();
    const { rows } = await h.admin.query<{ kind: string; trigger: string }>(`SELECT kind, trigger FROM scan WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1`, [company.id]);
    expect(rows[0]).toEqual({ kind: 'full', trigger: 'check_again' });
    expect((await go()).statusCode).toBe(202);
    await h.queue.drain();
    const third = await go();
    expect(third.statusCode).toBe(429);
    expect(errorOf(third).code).toBe('rate_limited');
    const audit = await h.admin.query(`SELECT 1 FROM audit_log WHERE target = $1 AND action = 'records.check_again'`, [company.id]);
    expect(audit.rows.length).toBe(2);
  });

  it('with nothing scanned yet, it just says so', async () => {
    const company = await createCompany(h, owner, { legalName: 'Empty Ltd' });
    const body = await records(company.id);
    expect(body.items).toEqual([]);
    expect(body.checkedAt).toBeNull();
    expect(body.sources.every((source) => source.state === 'waiting')).toBe(true);
  });

  it('input, not found, permissions and tenancy', async () => {
    const company = await createCompany(h, owner, { legalName: 'Records Guard Ltd' });
    expect((await h.request('GET', '/v1/companies/nope/records', { cookie: owner.cookie })).statusCode).toBe(400);
    expect((await h.request('GET', `/v1/companies/${MISSING_ID}/records`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('POST', `/v1/companies/${MISSING_ID}/records/check-again`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${company.id}/records`)).statusCode).toBe(401);
    const stranger = await h.signIn();
    expect((await h.request('GET', `/v1/companies/${company.id}/records`, { cookie: stranger.cookie })).statusCode).toBe(404);
    expect((await h.request('POST', `/v1/companies/${company.id}/records/check-again`, { cookie: stranger.cookie })).statusCode).toBe(404);
    const lawyer = await addMember(h, owner, 'lawyer');
    expect((await h.request('GET', `/v1/companies/${company.id}/records`, { cookie: lawyer.cookie })).statusCode).toBe(200);
    expect((await h.request('POST', `/v1/companies/${company.id}/records/check-again`, { cookie: lawyer.cookie })).statusCode).toBe(403);
  });
});

describe('the lawyer service is gone', () => {
  let h: Harness;
  let owner: SignedIn;
  let company: CompanyBody;

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    company = await scannedCompany(h, owner, { legalName: 'No Lawyer Ltd' });
  });
  afterAll(() => h.close());

  it('orders, bookings, document review and the review desk answer 404, and write nothing', async () => {
    const lawyer = await makeStaff(h, 'lawyer');
    const removed: ['GET' | 'POST', string, SignedIn, unknown?][] = [
      ['GET', `/v1/companies/${company.id}/orders`, owner],
      ['POST', `/v1/companies/${company.id}/orders`, owner, { documentType: 'nda', title: 'An NDA' }],
      ['POST', `/v1/orders/${MISSING_ID}/cancel`, owner],
      ['GET', `/v1/companies/${company.id}/bookings`, owner],
      ['POST', `/v1/companies/${company.id}/bookings`, owner, { topic: 'Help me' }],
      ['POST', `/v1/bookings/${MISSING_ID}/cancel`, owner],
      ['POST', `/v1/documents/${MISSING_ID}/review`, owner],
      ['GET', '/v1/review/queue', lawyer],
      ['POST', `/v1/review/tasks/${MISSING_ID}/claim`, lawyer],
      ['GET', `/v1/review/tasks/${MISSING_ID}`, lawyer],
      ['POST', `/v1/review/tasks/${MISSING_ID}/verdict`, lawyer, { verdict: 'sufficient' }],
    ];
    for (const [method, url, who, body] of removed) {
      expect((await h.request(method, url, { cookie: who.cookie, ...(body === undefined ? {} : { body }) })).statusCode, `${method} ${url}`).toBe(404);
    }
    for (const table of ['document_order', 'lawyer_booking', 'review_task']) {
      expect((await h.admin.query(`SELECT 1 FROM ${table} WHERE organisation_id = $1`, [owner.organisationId])).rows, table).toEqual([]);
    }
  });

  it('a filed document goes to no lawyer, and nothing a customer reads mentions one', async () => {
    await fileDocument(h, owner, company.id, 'gb_founder_ip_assignment');
    expect((await h.admin.query(`SELECT 1 FROM review_task WHERE company_id = $1`, [company.id])).rows).toEqual([]);
    for (const path of ['overview', 'issues', 'documents', 'records', 'badge', 'history', 'questionnaire']) {
      const response = await h.request('GET', `/v1/companies/${company.id}/${path}`, { cookie: owner.cookie });
      expect(response.statusCode, path).toBe(200);
      expect(response.body, path).not.toMatch(/Code & Clause|Code and Clause|reviewProgress|lawyerVerdict|lawyerRead/);
    }
    const plans = await h.request('GET', '/v1/plans', { cookie: owner.cookie });
    expect(plans.body).not.toMatch(/lawyer/i);
  });

  it('the staff feed still carries look-up requests, and the client hears in plain words', async () => {
    const lawyer = await makeStaff(h, 'lawyer');
    const asked = await h.request('POST', '/v1/registry/lookup-requests', { cookie: owner.cookie, body: { country: 'GB', legalName: 'Hard To Find Ltd' } });
    expect(asked.statusCode).toBe(201);
    const work = await h.request('GET', '/v1/review/work', { cookie: lawyer.cookie });
    const item = work.json<{ items: { id: string; kind: string }[] }>().items.find((row) => row.kind === 'lookup_request');
    expect(item).toBeDefined();
    expect((await h.request('PATCH', `/v1/review/work/${item?.id}`, { cookie: lawyer.cookie, body: { status: 'delivered' } })).statusCode).toBe(400);
    const moved = await h.request('PATCH', `/v1/review/work/${item?.id}`, { cookie: lawyer.cookie, body: { status: 'completed' } });
    expect(moved.statusCode).toBe(200);
    expect((await h.request('PATCH', `/v1/review/work/${MISSING_ID}`, { cookie: lawyer.cookie, body: { status: 'completed' } })).statusCode).toBe(404);
    const mine = (await h.request('GET', '/v1/notifications', { cookie: owner.cookie })).json<{ notifications: { kind: string; title: string }[] }>().notifications;
    const titles = mine.map((row) => row.title).join(' ');
    expect(titles).toContain('Your company look-up is now completed');
    expect(titles).not.toMatch(/lawyer|Code & Clause/i);
    expect((await h.request('GET', '/v1/review/work', { cookie: owner.cookie })).statusCode).toBe(403);
  });
});

describe('search and the notification feed', () => {
  let h: Harness;
  let owner: SignedIn;
  let company: CompanyBody;
  interface SearchResult {
    issues: { ruleKey: string; title: string; companyId: string }[];
    documents: { id: string; title: string }[];
    deadlines: { id: string; title: string }[];
  }
  const search = async (q: string, who = owner) => (await h.request('GET', `/v1/search?q=${encodeURIComponent(q)}`, { cookie: who.cookie })).json<SearchResult>();

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    company = await createCompany(h, owner, { legalName: 'Kestrel Pay UK Ltd', yearEnd: { month: 3, day: 31 } });
    await answer(h, owner, company.id, GB_ANSWERS);
    await scanNow(h, owner, company.id);
    await fileDocument(h, owner, company.id, 'gb_founder_ip_assignment', {}, 'unique-zebra-assignment.pdf');
  });
  afterAll(() => h.close());

  it('finds issues, documents and deadlines', async () => {
    const issues = await search('ICO register');
    expect(issues.issues.map((item) => item.ruleKey)).toContain('GB.DP.ICO_FEE');
    expect((await search('zebra')).documents[0]?.title).toBe('unique-zebra-assignment.pdf');
    expect((await search('confirmation statement')).deadlines.length).toBeGreaterThan(0);
    expect(await search('nothing-matches-this')).toEqual({ issues: [], documents: [], deadlines: [] });
  });

  it('treats search text as plain text, not a pattern or a query', async () => {
    expect(await search('%%')).toEqual({ issues: [], documents: [], deadlines: [] });
    expect(await search('__')).toEqual({ issues: [], documents: [], deadlines: [] });
    const injection = await h.request('GET', `/v1/search?q=${encodeURIComponent("' OR 1=1 --")}`, { cookie: owner.cookie });
    expect(injection.statusCode).toBe(200);
    expect(injection.json<SearchResult>().documents).toEqual([]);
  });

  it('input, sign-in and permissions', async () => {
    expect((await h.request('GET', '/v1/search', { cookie: owner.cookie })).statusCode).toBe(400);
    expect((await h.request('GET', '/v1/search?q=a', { cookie: owner.cookie })).statusCode).toBe(400);
    expect((await h.request('GET', `/v1/search?q=${'x'.repeat(101)}`, { cookie: owner.cookie })).statusCode).toBe(400);
    expect((await h.request('GET', '/v1/search?q=ICO')).statusCode).toBe(401);
  });

  it('never crosses organisations', async () => {
    const stranger = await h.signIn();
    await setPlan(h, stranger.organisationId, 'growth');
    await createCompany(h, stranger, { legalName: 'Other Ltd' });
    expect(await search('zebra', stranger)).toEqual({ issues: [], documents: [], deadlines: [] });
    expect(await search('ICO register', stranger)).toEqual({ issues: [], documents: [], deadlines: [] });
    expect(await search('confirmation statement', stranger)).toEqual({ issues: [], documents: [], deadlines: [] });
  });

  it('the feed filters by kind, and collects from everything above', async () => {
    const all = await h.request('GET', '/v1/notifications', { cookie: owner.cookie });
    const kinds = new Set(all.json<{ notifications: { kind: string }[] }>().notifications.map((item) => item.kind));
    expect(kinds.has('score')).toBe(true);
    const filtered = await h.request('GET', '/v1/notifications?kind=score', { cookie: owner.cookie });
    expect(filtered.json<{ notifications: { kind: string }[] }>().notifications.every((item) => item.kind === 'score')).toBe(true);
    expect((await h.request('GET', '/v1/notifications?kind=nope', { cookie: owner.cookie })).statusCode).toBe(400);
  });
});

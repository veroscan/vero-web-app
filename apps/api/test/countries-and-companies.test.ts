import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { createCompany, scanNow, scannedCompany, setPlan } from './support/product';

/**
 * Countries (docs/BACKEND-V2-PLAN.md, step 11) and "add another company" (step 12). Any ISO
 * 3166-1 country or US-XX state can be used, and every answer says how much a scan can check there.
 */

interface Coverage {
  level: string;
  sentence: string;
}

describe('any country, with its coverage, everywhere a company is picked', () => {
  let h: Harness;
  let owner: SignedIn;
  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
  });
  afterAll(() => h.close());

  it('creates a company in any country or US state, and says what a scan checks there', async () => {
    for (const [code, level] of [['KE', 'international'], ['US-CA', 'international'], ['GB', 'full']] as const) {
      const created = await h.request('POST', '/v1/companies', { cookie: owner.cookie, body: { legalName: `Coverage ${code} Ltd`, incorporationCountry: code } });
      expect(created.statusCode, code).toBe(201);
      expect(created.json<{ countryCoverage: Coverage }>().countryCoverage.level, code).toBe(level);
    }
    const bad = await h.request('POST', '/v1/companies', { cookie: owner.cookie, body: { legalName: 'Nowhere Ltd', incorporationCountry: 'ZZ' } });
    expect(bad.statusCode).toBe(400);
    expect(errorOf(bad).message).toBe("We don't recognise that country code.");
  });

  it('registry search answers for any country, with its coverage, and never pretends to search a register it can\'t', async () => {
    const kenya = (await h.request('GET', '/v1/registry/search?country=KE&q=Safari%20Pay', { cookie: owner.cookie })).json<{ outcome: string; countryCoverage: Coverage; message: string }>();
    expect(kenya.outcome).toBe('not_available');
    expect(kenya.countryCoverage.level).toBe('international');
    expect(kenya.countryCoverage.sentence).toMatch(/Kenya/);
    const uk = (await h.request('GET', '/v1/registry/search?country=GB&q=Kestrel%20Pay', { cookie: owner.cookie })).json<{ countryCoverage: Coverage }>();
    expect(uk.countryCoverage.level).toBe('full');
    expect((await h.request('GET', '/v1/registry/search?country=ZZ&q=Kestrel', { cookie: owner.cookie })).statusCode).toBe(400);
  });

  it('the overview says it too', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Overview Kenya Ltd', incorporationCountry: 'KE' });
    const overview = (await h.request('GET', `/v1/companies/${company.id}/overview`, { cookie: owner.cookie })).json<{ countryCoverage: Coverage; hasResult: boolean }>();
    expect(overview.hasResult).toBe(true);
    expect(overview.countryCoverage.level).toBe('international');
  });
});

describe('add another company', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('an owned company joins the group, gets its own questions and scan, and shows in the group', async () => {
    const owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    const root = await scannedCompany(h, owner, { legalName: 'Group Parent Ltd' });
    const added = await h.request('POST', `/v1/companies/${root.id}/related`, { cookie: owner.cookie, body: { legalName: 'Group Kenya Ltd', incorporationCountry: 'KE' } });
    expect(added.statusCode).toBe(201);
    const child = added.json<{ id: string; parentCompanyId: string; relationship: string }>();
    expect(child).toMatchObject({ parentCompanyId: root.id, relationship: 'own' });

    const answered = await h.request('PATCH', `/v1/companies/${child.id}/questionnaire`, { cookie: owner.cookie, body: { answers: { has_employees: false } } });
    expect(answered.statusCode).toBe(200);
    const scan = await scanNow(h, owner, child.id);
    expect(scan.status).toMatch(/completed|partial/);

    const list = (await h.request('GET', '/v1/companies', { cookie: owner.cookie })).json<{ companies: { id: string }[] }>().companies.map((row) => row.id);
    expect(list).toEqual(expect.arrayContaining([root.id, child.id]));
    const related = (await h.request('GET', `/v1/companies/${root.id}/related`, { cookie: owner.cookie })).json<{ companies: { id: string }[] }>();
    expect(related.companies.map((row) => row.id)).toEqual([child.id]);
    const group = (await h.request('GET', `/v1/companies/${root.id}/overview?scope=group`, { cookie: owner.cookie })).json<{ scope: string; hasResult: boolean; score: { kind: string } }>();
    expect(group).toMatchObject({ scope: 'group', hasResult: true });
    expect((await h.request('GET', `/v1/companies/${child.id}/history`, { cookie: owner.cookie })).json<{ scans: unknown[] }>().scans).toHaveLength(1);
  });

  it('keeps to the plan: Free sees the new company as a range too', async () => {
    const free = await h.signIn();
    const root = await createCompany(h, free, { legalName: 'Free Parent Ltd' });
    const child = (await h.request('POST', `/v1/companies/${root.id}/related`, { cookie: free.cookie, body: { legalName: 'Free Child Ltd', incorporationCountry: 'NG' } })).json<{ id: string }>();
    await scanNow(h, free, child.id);
    const overview = (await h.request('GET', `/v1/companies/${child.id}/overview`, { cookie: free.cookie })).json<{ score: { kind: string } }>();
    expect(overview.score.kind).not.toBe('exact');
  });

  it('permissions and tenancy', async () => {
    const owner = await h.signIn();
    const root = await createCompany(h, owner, { legalName: 'Tenancy Parent Ltd' });
    const stranger = await h.signIn();
    expect((await h.request('POST', `/v1/companies/${root.id}/related`, { cookie: stranger.cookie, body: { legalName: 'Sneaky Ltd', incorporationCountry: 'GB' } })).statusCode).toBe(404);
    expect((await h.request('POST', `/v1/companies/${root.id}/related`, { body: { legalName: 'Anon Ltd', incorporationCountry: 'GB' } })).statusCode).toBe(401);
  });
});

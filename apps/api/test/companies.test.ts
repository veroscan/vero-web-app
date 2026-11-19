import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { errorOf, startHarness, type Harness, type SignedIn } from './support/harness';

interface CompanyBody {
  id: string;
  organisationId: string;
  legalName: string;
  incorporationCountry: string;
  incorporationState: string | null;
  registrationNumber: string | null;
  stage: string | null;
  sectors: string[];
  website: string | null;
  markets: { country: string; kind: string }[];
}

describe('companies', () => {
  let h: Harness;
  let owner: SignedIn;

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
  });
  afterAll(() => h.close());

  const create = (body: unknown, cookie = owner.cookie) => h.request('POST', '/v1/companies', { cookie, body });
  const patch = (id: string, body: unknown, cookie = owner.cookie) => h.request('PATCH', `/v1/companies/${id}`, { cookie, body });

  it('creates a company with all its details', async () => {
    const response = await create({
      legalName: '  Heron Pay Inc.  ',
      incorporationCountry: 'US-DE',
      registrationNumber: 'DE-1',
      entityType: 'Corporation',
      stage: 'seed',
      sectors: ['fintech'],
      website: 'https://heron.example',
      markets: [
        { country: 'GB', kind: 'users' },
        { country: 'NG', kind: 'operates' },
      ],
    });
    expect(response.statusCode).toBe(201);
    const company = response.json<CompanyBody>();
    expect(company).toMatchObject({
      organisationId: owner.organisationId,
      legalName: 'Heron Pay Inc.',
      incorporationCountry: 'US-DE',
      incorporationState: 'DE',
      stage: 'seed',
      sectors: ['fintech'],
    });
    expect(company.markets).toHaveLength(2);
  });

  it('allows several companies in one organisation, one per legal entity', async () => {
    const person = await h.signIn();
    for (const [legalName, incorporationCountry] of [
      ['Wren Inc.', 'US-DE'],
      ['Wren UK Ltd', 'GB'],
      ['Wren Nigeria Ltd', 'NG'],
    ]) {
      expect((await create({ legalName, incorporationCountry }, person.cookie)).statusCode).toBe(201);
    }
    const list = await h.request('GET', '/v1/companies', { cookie: person.cookie });
    const names = list.json<{ companies: CompanyBody[] }>().companies.map((c) => c.legalName);
    expect(names).toEqual(['Wren Inc.', 'Wren UK Ltd', 'Wren Nigeria Ltd']);
  });

  it('starts with an empty list', async () => {
    const person = await h.signIn();
    const list = await h.request('GET', '/v1/companies', { cookie: person.cookie });
    expect(list.json<{ companies: unknown[] }>().companies).toEqual([]);
  });

  it.each(['XX', 'US-ZZ', 'gb', '', 'NIGERIA', 'INTL'])('refuses the unknown country code %j', async (incorporationCountry) => {
    const response = await create({ legalName: 'Elsewhere Ltd', incorporationCountry });
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('invalid_input');
    expect(errorOf(response).message).toBe("We don't recognise that country code.");
  });

  it('the database refuses an unknown country too, even if the API were bypassed', async () => {
    await expect(
      h.admin.query(`INSERT INTO company (organisation_id, legal_name, incorporation_country) VALUES ($1, 'X', 'XX')`, [owner.organisationId]),
    ).rejects.toThrow(/foreign key/);
  });

  it.each([
    ['missing name', { incorporationCountry: 'GB' }],
    ['blank name', { legalName: '   ', incorporationCountry: 'GB' }],
    ['name too long', { legalName: 'x'.repeat(301), incorporationCountry: 'GB' }],
    ['missing country', { legalName: 'A' }],
    ['bad stage', { legalName: 'A', incorporationCountry: 'GB', stage: 'unicorn' }],
    ['website not http', { legalName: 'A', incorporationCountry: 'GB', website: 'javascript:alert(1)' }],
    ['sectors not a list', { legalName: 'A', incorporationCountry: 'GB', sectors: 'fintech' }],
    ['market country unknown', { legalName: 'A', incorporationCountry: 'GB', markets: [{ country: 'ZZ', kind: 'users' }] }],
    ['market kind unknown', { legalName: 'A', incorporationCountry: 'GB', markets: [{ country: 'GB', kind: 'moon' }] }],
    ['same market twice', { legalName: 'A', incorporationCountry: 'GB', markets: [{ country: 'GB', kind: 'users' }, { country: 'GB', kind: 'users' }] }],
  ])('rejects invalid input: %s', async (_label, body) => {
    const response = await create(body);
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('invalid_input');
  });

  it('refuses a duplicate registration number in the same country, but not in another', async () => {
    const person = await h.signIn();
    const body = { legalName: 'Dup Ltd', incorporationCountry: 'GB', registrationNumber: '123' };
    expect((await create(body, person.cookie)).statusCode).toBe(201);
    const twice = await create(body, person.cookie);
    expect(twice.statusCode).toBe(409);
    expect(errorOf(twice).code).toBe('company_exists');
    expect((await create({ ...body, incorporationCountry: 'NG' }, person.cookie)).statusCode).toBe(201);
    // A failed create leaves nothing behind.
    const list = await h.request('GET', '/v1/companies', { cookie: person.cookie });
    expect(list.json<{ companies: unknown[] }>().companies).toHaveLength(2);
  });

  it('two organisations can hold the same registration number', async () => {
    const a = await h.signIn();
    const b = await h.signIn();
    const body = { legalName: 'Same Ltd', incorporationCountry: 'GB', registrationNumber: 'SHARED' };
    expect((await create(body, a.cookie)).statusCode).toBe(201);
    expect((await create(body, b.cookie)).statusCode).toBe(201);
  });

  it('reads one company', async () => {
    const created = (await create({ legalName: 'Read Ltd', incorporationCountry: 'NG' })).json<CompanyBody>();
    const response = await h.request('GET', `/v1/companies/${created.id}`, { cookie: owner.cookie });
    expect(response.statusCode).toBe(200);
    expect(response.json<CompanyBody>().legalName).toBe('Read Ltd');
    expect(response.json<CompanyBody>().incorporationState).toBeNull();
  });

  it('returns 404 for an id that does not exist, and 400 for one that is not an id', async () => {
    const missing = await h.request('GET', '/v1/companies/11111111-1111-4111-8111-111111111111', { cookie: owner.cookie });
    expect(missing.statusCode).toBe(404);
    expect(errorOf(missing).code).toBe('not_found');
    const bad = await h.request('GET', '/v1/companies/not-an-id', { cookie: owner.cookie });
    expect(bad.statusCode).toBe(400);
  });

  it('updates only the fields sent, and null clears a field', async () => {
    const created = (
      await create({ legalName: 'Old Ltd', incorporationCountry: 'GB', website: 'https://old.example', stage: 'seed' })
    ).json<CompanyBody>();
    const response = await patch(created.id, { legalName: 'New Ltd', website: null });
    expect(response.statusCode).toBe(200);
    expect(response.json<CompanyBody>()).toMatchObject({ legalName: 'New Ltd', website: null, stage: 'seed', incorporationCountry: 'GB' });
  });

  it('replaces markets when sent, and leaves them alone when not', async () => {
    const created = (
      await create({ legalName: 'Markets Ltd', incorporationCountry: 'GB', markets: [{ country: 'GB', kind: 'operates' }] })
    ).json<CompanyBody>();

    const renamed = await patch(created.id, { legalName: 'Markets Two Ltd' });
    expect(renamed.json<CompanyBody>().markets).toEqual([{ country: 'GB', kind: 'operates' }]);

    const replaced = await patch(created.id, { markets: [{ country: 'NG', kind: 'investors' }] });
    expect(replaced.json<CompanyBody>().markets).toEqual([{ country: 'NG', kind: 'investors' }]);

    const cleared = await patch(created.id, { markets: [] });
    expect(cleared.json<CompanyBody>().markets).toEqual([]);
  });

  it('correcting the country updates the derived state', async () => {
    const created = (await create({ legalName: 'Move Ltd', incorporationCountry: 'GB' })).json<CompanyBody>();
    const moved = await patch(created.id, { incorporationCountry: 'US-DE' });
    expect(moved.json<CompanyBody>().incorporationState).toBe('DE');
  });

  it('refuses invalid updates', async () => {
    const created = (await create({ legalName: 'Valid Ltd', incorporationCountry: 'GB' })).json<CompanyBody>();
    expect((await patch(created.id, {})).statusCode).toBe(400);
    expect((await patch(created.id, { incorporationCountry: 'ZZ' })).statusCode).toBe(400);
    expect((await patch(created.id, { legalName: '' })).statusCode).toBe(400);
    expect((await patch('11111111-1111-4111-8111-111111111111', { legalName: 'Ghost' })).statusCode).toBe(404);
  });

  it('a duplicate caused by an update is a 409', async () => {
    const person = await h.signIn();
    await create({ legalName: 'One', incorporationCountry: 'GB', registrationNumber: 'R1' }, person.cookie);
    const second = (await create({ legalName: 'Two', incorporationCountry: 'GB', registrationNumber: 'R2' }, person.cookie)).json<CompanyBody>();
    const response = await patch(second.id, { registrationNumber: 'R1' }, person.cookie);
    expect(response.statusCode).toBe(409);
  });

  it('ignores fields the contract does not allow', async () => {
    const other = await h.signIn();
    const response = await create({ legalName: 'Sneaky Ltd', incorporationCountry: 'GB', organisationId: other.organisationId, id: other.userId });
    expect(response.statusCode).toBe(201);
    expect(response.json<CompanyBody>().organisationId).toBe(owner.organisationId);
    expect(response.json<CompanyBody>().id).not.toBe(other.userId);
  });

  it('audits changes, recording which fields but not their values', async () => {
    const created = (await create({ legalName: 'Audited Ltd', incorporationCountry: 'GB' })).json<CompanyBody>();
    await patch(created.id, { legalName: 'Private New Name Ltd' });
    const { rows } = await h.admin.query<{ action: string; text: string }>(
      `SELECT action, audit_log::text AS text FROM audit_log WHERE target = $1`,
      [created.id],
    );
    expect(rows.map((row) => row.action).sort()).toEqual(['company.created', 'company.updated']);
    expect(rows.map((row) => row.text).join()).not.toContain('Private New Name');
  });

  it('needs a session', async () => {
    expect((await h.request('GET', '/v1/companies')).statusCode).toBe(401);
    expect((await h.request('POST', '/v1/companies', { body: { legalName: 'A', incorporationCountry: 'GB' } })).statusCode).toBe(401);
  });
});

import { randomBytes } from 'node:crypto';
import { copyFileSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';
import { MIGRATIONS_DIR, runMigrations } from '../src/db/migrate';
import { errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, overview, scanNow, setPlan } from './support/product';

/** Answers that aren't about any one country. */
const ANY_COUNTRY_ANSWERS = {
  user_countries: ['other'],
  investor_countries: ['none'],
  has_raised_or_raising: false,
  has_employees: true,
  employee_countries: ['other'],
  has_contractors: true,
  contractor_countries: ['other'],
  has_foreign_workers: false,
  revenue_band: 'under_1m',
  headcount_band: '1_10',
  processes_personal_data: true,
  sensitive_data: ['none'],
  data_hosted_abroad: true,
  uses_processors: true,
  has_website: true,
  has_app: false,
  ai_roles: ['deployer'],
  ai_uses_third_party_models: true,
  staff_use_ai: true,
  automated_decisions: false,
  payments_mode: ['psp_only'],
  sectors: ['none'],
  customer_type: 'b2b',
  has_subscriptions: true,
  sells_to_enterprise: true,
  offers_api: true,
  user_generated_content: false,
  ip_founders_signed: true,
  ip_employees_signed: true,
  ip_contractors_signed: false,
};

interface CompanyBody {
  id: string;
  incorporationCountry: string;
  incorporationState: string | null;
  countryCoverage?: { level: string; sentence: string };
}

interface FindingRow {
  rule_key: string;
  outcome: string;
  detail: { jurisdiction: string; instruments: unknown[]; regulator: string | null; headline: string; title: string };
}

describe('a company in any country', () => {
  let h: Harness;
  let owner: SignedIn;

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
  });
  afterAll(() => h.close());

  const findingsOf = async (scanId: string) =>
    (await h.admin.query<FindingRow>(`SELECT rule_key, outcome, detail FROM finding WHERE scan_id = $1`, [scanId])).rows;

  it('a Tanzanian company is created, scanned on sample data and scored by the international rules alone', async () => {
    const company = (await createCompany(h, owner, { legalName: 'Kestrel Pay Tanzania Ltd', incorporationCountry: 'TZ', registrationNumber: 'PVT-SAMPLE01' })) as unknown as CompanyBody;
    expect(company.incorporationCountry).toBe('TZ');
    expect(company.incorporationState).toBeNull();
    expect(company.countryCoverage).toEqual({
      level: 'international',
      sentence: "We can check international rules and sanctions for companies in Tanzania, but not yet Tanzania's own company register or laws.",
    });

    await answer(h, owner, company.id, ANY_COUNTRY_ANSWERS);
    const scan = await scanNow(h, owner, company.id);
    expect(['completed', 'partial']).toContain(scan.status);
    expect(Object.keys(scan.rulePackVersions)).toEqual(['INTL']);

    // Only sources that cover every country ran: no country's register was asked about a Tanzanian company.
    const ids = scan.sources.map((source) => source.connectorId);
    for (const id of ['sanctions.lists', 'web.policy_scan']) expect(ids).toContain(id);
    const global = new Set(h.deps.connectors.filter((connector) => connector.jurisdictions.includes('*')).map((connector) => connector.id));
    for (const id of ids) expect(global.has(id), id).toBe(true);
    for (const source of scan.sources) expect(source.sampleData).toBe(true);

    const findings = await findingsOf(scan.id);
    expect(findings.length).toBeGreaterThan(10);
    for (const row of findings) {
      expect(row.rule_key.startsWith('INTL.'), row.rule_key).toBe(true);
      expect(row.detail.jurisdiction).toBe('INTL');
      // No rule claims a Tanzanian law, or any country's.
      expect(row.detail.instruments, row.rule_key).toEqual([]);
      expect(row.detail.regulator).toBeNull();
      expect(`${row.detail.title} ${row.detail.headline}`.replaceAll('Kestrel Pay Tanzania Ltd', '{company}')).not.toMatch(/Tanzania/);
    }
    expect(findings.find((row) => row.rule_key === 'INTL.IP.CONTRACTOR_ASSIGNMENT')?.outcome).toBe('gap');

    const body = await overview(h, owner, company.id);
    expect(body.hasResult).toBe(true);
    expect(body.rulePacks.map((pack) => [pack.jurisdiction, pack.status])).toEqual([['INTL', 'draft']]);
    expect((body as unknown as { countryCoverage: { level: string } }).countryCoverage.level).toBe('international');

    const records = await h.request('GET', `/v1/companies/${company.id}/records`, { cookie: owner.cookie });
    expect(records.statusCode).toBe(200);
    expect(records.json<{ country: string; countryCoverage: { level: string } }>()).toMatchObject({ country: 'TZ', countryCoverage: { level: 'international' } });

    const issues = await h.request('GET', `/v1/companies/${company.id}/issues?outcome=all`, { cookie: owner.cookie });
    expect(issues.statusCode).toBe(200);
    for (const issue of issues.json<{ issues: { country: string; countryLabel: string }[] }>().issues) {
      expect(issue).toMatchObject({ country: 'INTL', countryLabel: 'International' });
    }
  });

  it('a California company gets the US federal rules and the international rules', async () => {
    const company = (await createCompany(h, owner, { legalName: 'Heron Labs Inc.', incorporationCountry: 'US-CA' })) as unknown as CompanyBody;
    expect(company.incorporationState).toBe('CA');
    expect(company.countryCoverage?.level).toBe('international');
    expect(company.countryCoverage?.sentence).toContain('US federal rules');

    await answer(h, owner, company.id, { ...ANY_COUNTRY_ANSWERS, user_countries: ['other'], entity_type_us: 'c_corp' });
    const scan = await scanNow(h, owner, company.id);
    expect(Object.keys(scan.rulePackVersions).sort()).toEqual(['INTL', 'US']);
    const keys = (await findingsOf(scan.id)).map((row) => row.rule_key);
    expect(keys).toContain('US.SANCT.SCREENING');
    expect(keys).not.toContain('INTL.SANCT.SCREENING');
    expect(keys.some((key) => key.startsWith('US-DE.'))).toBe(false);
    expect(keys.some((key) => key.startsWith('INTL.'))).toBe(true);
    // Federal sources cover every state; Delaware's register does not.
    const ids = scan.sources.map((source) => source.connectorId);
    expect(ids).toContain('us.uspto');
    expect(ids).not.toContain('us.delaware_vendor');
  });

  it('a French company is at registry level', async () => {
    const company = (await createCompany(h, owner, { legalName: 'Kestrel Pay SAS', incorporationCountry: 'FR' })) as unknown as CompanyBody;
    expect(company.countryCoverage?.level).toBe('registry');
    expect(company.countryCoverage?.sentence).toContain("France's company register");
    // Once a draft French pack exists, the sentence names its rules and says they are not yet reviewed.
    expect(company.countryCoverage?.sentence).toMatch(/not yet France's own laws|France's own rules \(not yet reviewed\)/);
  });

  it('refuses an unknown country code in plain words', async () => {
    const response = await h.request('POST', '/v1/companies', { cookie: owner.cookie, body: { legalName: 'Nowhere Ltd', incorporationCountry: 'ZZ' } });
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).message).toBe("We don't recognise that country code.");
  });

  it('register search says plainly when a country has no register to search, so the company is entered by hand', async () => {
    const response = await h.request('GET', '/v1/registry/search?country=TZ&q=Kestrel%20Pay', { cookie: owner.cookie });
    expect(response.statusCode).toBe(200);
    const body = response.json<{ outcome: string; message: string; candidates: unknown[]; sampleData: boolean }>();
    expect(body.outcome).toBe('not_available');
    expect(body.message).toContain("We can't search the company register in Tanzania yet");
    expect(body.message).toContain('Enter the company');
    expect(body.candidates).toEqual([]);
    expect(body.sampleData).toBe(false);
  });

  it('a market can be anywhere, and a look-up request can be for anywhere', async () => {
    const company = await createCompany(h, owner, { legalName: 'Wren Global Ltd', markets: [{ country: 'TZ', kind: 'users' }, { country: 'US-TX', kind: 'operates' }] });
    expect(company.id).toBeTruthy();
    const lookup = await h.request('POST', '/v1/registry/lookup-requests', { cookie: owner.cookie, body: { country: 'TZ', legalName: 'Kestrel Pay Tanzania Ltd' } });
    expect([200, 201]).toContain(lookup.statusCode);
  });
});

describe('migration 0020', () => {
  it('applies on top of a database holding data from before, and that data still passes', async () => {
    const name = `vero_mig_${randomBytes(4).toString('hex')}`;
    const superuser = new URL(inject('superuserUrl'));
    const migrator = new URL(inject('migratorUrl'));
    const maintenance = new URL(superuser);
    maintenance.pathname = '/postgres';
    superuser.pathname = `/${name}`;
    migrator.pathname = `/${name}`;
    const before = mkdtempSync(join(tmpdir(), 'vero-mig-'));
    const admin = new pg.Client({ connectionString: maintenance.toString() });
    await admin.connect();
    await admin.query(`CREATE DATABASE ${name} OWNER ${migrator.username}`);
    const db = new pg.Client({ connectionString: superuser.toString() });
    try {
      const files = readdirSync(MIGRATIONS_DIR).filter((file) => file.endsWith('.sql')).sort();
      for (const file of files.filter((item) => item < '0020')) copyFileSync(join(MIGRATIONS_DIR, file), join(before, file));
      await runMigrations(migrator.toString(), before);

      await db.connect();
      const org = (await db.query<{ id: string }>(`INSERT INTO organisation (name) VALUES ('Old Data Ltd') RETURNING id`)).rows[0]?.id;
      for (const [country, legal] of [['US-DE', 'Old Inc.'], ['GB', 'Old UK Ltd'], ['NG', 'Old Nigeria Ltd']]) {
        const company = (await db.query<{ id: string }>(
          `INSERT INTO company (organisation_id, legal_name, incorporation_country) VALUES ($1, $2, $3) RETURNING id`, [org, legal, country],
        )).rows[0]?.id;
        await db.query(`INSERT INTO company_market (organisation_id, company_id, country, kind) VALUES ($1, $2, 'GB', 'users')`, [org, company]);
      }
      await db.query(`INSERT INTO lookup_request (organisation_id, country, legal_name) VALUES ($1, 'NG', 'Old Lookup Ltd')`, [org]);
      await expect(db.query(`INSERT INTO company (organisation_id, legal_name, incorporation_country) VALUES ($1, 'Too Early', 'TZ')`, [org])).rejects.toThrow();

      copyFileSync(join(MIGRATIONS_DIR, '0020_any_country.sql'), join(before, '0020_any_country.sql'));
      const result = await runMigrations(migrator.toString(), before);
      expect(result.applied).toEqual(['0020_any_country.sql']);

      // Old rows are untouched and still valid; Delaware still gets "DE".
      const old = await db.query<{ incorporation_country: string; incorporation_state: string | null }>(
        `SELECT incorporation_country, incorporation_state FROM company ORDER BY incorporation_country`,
      );
      expect(old.rows).toEqual([
        { incorporation_country: 'GB', incorporation_state: null },
        { incorporation_country: 'NG', incorporation_state: null },
        { incorporation_country: 'US-DE', incorporation_state: 'DE' },
      ]);
      expect((await db.query(`SELECT 1 FROM company_market`)).rowCount).toBe(3);
      expect((await db.query(`SELECT 1 FROM lookup_request`)).rowCount).toBe(1);

      // Any listed country is accepted, an unlisted one still isn't.
      await db.query(`INSERT INTO company (organisation_id, legal_name, incorporation_country) VALUES ($1, 'New Tanzania Ltd', 'TZ'), ($1, 'New Texas Inc.', 'US-TX')`, [org]);
      const texas = await db.query<{ incorporation_state: string }>(`SELECT incorporation_state FROM company WHERE incorporation_country = 'US-TX'`);
      expect(texas.rows[0]?.incorporation_state).toBe('TX');
      await expect(db.query(`INSERT INTO company (organisation_id, legal_name, incorporation_country) VALUES ($1, 'X', 'XX')`, [org])).rejects.toThrow(/foreign key/);
      await expect(db.query(`INSERT INTO lookup_request (organisation_id, country, legal_name) VALUES ($1, 'XX', 'X')`, [org])).rejects.toThrow(/foreign key/);

      const counts = await db.query<{ countries: string; states: string; intl: string }>(
        `SELECT count(*) FILTER (WHERE parent_code IS NULL AND code <> 'INTL') AS countries,
                count(*) FILTER (WHERE parent_code = 'US') AS states,
                count(*) FILTER (WHERE code = 'INTL') AS intl FROM jurisdiction`,
      );
      expect(counts.rows[0]).toEqual({ countries: '249', states: '51', intl: '1' });

      // Row-level security is still forced on the company tables.
      const rls = await db.query<{ relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean }>(
        `SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname IN ('company', 'company_market', 'lookup_request') ORDER BY relname`,
      );
      for (const row of rls.rows) expect(row, row.relname).toMatchObject({ relrowsecurity: true, relforcerowsecurity: true });
    } finally {
      await db.end().catch(() => undefined);
      await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
      await admin.end();
      rmSync(before, { recursive: true, force: true });
    }
    // Nineteen migrations on a fresh database: slow on a busy machine.
  }, 180_000);
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startHarness, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, fileDocument, GB_ANSWERS, overview, scanNow, setPlan, upload, pdfFile } from './support/product';

interface Finding {
  rule_key: string;
  outcome: string;
  scored: boolean;
  detail: { jurisdiction: string; applies_because: string; reason: string | null; facts_used: { how_we_know: string | null }[] };
}

const DELAWARE_ANSWERS = {
  entity_type_us: 'c_corp',
  has_employees: false,
  has_contractors: true,
  contractor_countries: ['US'],
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
  payments_mode: ['none'],
  sectors: ['none'],
  customer_type: 'b2b',
  revenue_band: 'under_1m',
  has_raised_or_raising: false,
  raised_priced_round: false,
  foreign_ownership_25_plus: false,
  foreign_entity_registered_in_us: false,
  operates_in_delaware: false,
  does_business_in_other_states: false,
  founders_restricted_stock: false,
  sells_to_enterprise: false,
  offers_api: false,
  has_subscriptions: false,
  user_generated_content: false,
};

describe('countries where a company has users or operates', () => {
  let h: Harness;
  let owner: SignedIn;

  async function latest(companyId: string): Promise<Finding[]> {
    const { rows } = await h.admin.query<Finding>(
      `SELECT f.rule_key, f.outcome, f.scored, f.detail FROM finding f JOIN scan s ON s.id = f.scan_id
       WHERE f.company_id = $1 AND s.finalised_seq = (SELECT max(finalised_seq) FROM scan WHERE company_id = $1)`,
      [companyId],
    );
    return rows;
  }

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
  });
  afterAll(() => h.close());

  it('a Delaware company with UK users gets UK compliance rules, and no UK filing rules', async () => {
    const company = await createCompany(h, owner, { legalName: 'Heron Inc.', incorporationCountry: 'US-DE' });
    await answer(h, owner, company.id, { ...DELAWARE_ANSWERS, user_countries: ['GB'], data_subjects_gb_12m: 500 });
    const scan = await scanNow(h, owner, company.id);

    const findings = await latest(company.id);
    const keys = findings.map((item) => item.rule_key);
    expect(keys).toContain('GB.DP.ICO_FEE');
    expect(keys).toContain('GB.DP.ROPA');
    for (const key of keys.filter((item) => item.startsWith('GB.'))) {
      expect(key).not.toMatch(/^GB\.(CORP|TAX|IP|EQUITY|FUND|PREMISES|EMP)\./);
    }
    expect(findings.find((item) => item.rule_key === 'GB.DP.ICO_FEE')?.detail).toMatchObject({ jurisdiction: 'GB', applies_because: 'market' });
    expect(findings.find((item) => item.rule_key.startsWith('US-DE.CORP'))?.detail).toMatchObject({ jurisdiction: 'US-DE', applies_because: 'incorporated' });
    expect(new Set(keys).size).toBe(keys.length);

    // The UK's data protection register is asked. Its company register is not.
    const ids = scan.sources.map((source) => source.connectorId);
    expect(ids).toContain('uk.ico_register');
    expect(ids).not.toContain('uk.companies_house');
    expect(ids).not.toContain('uk.hmrc_vat');
    expect(ids).toContain('us.delaware_vendor');
    const ico = await h.admin.query(`SELECT 1 FROM fact WHERE company_id = $1 AND key = 'registry.uk.ico.listed'`, [company.id]);
    expect(ico.rows.length).toBe(1);
    const house = await h.admin.query(`SELECT 1 FROM fact WHERE company_id = $1 AND key LIKE 'registry.uk.companies_house.%'`, [company.id]);
    expect(house.rows).toEqual([]);
  });

  it('each scan records the packs it used, and how', async () => {
    const company = await createCompany(h, owner, { legalName: 'Packs Inc.', incorporationCountry: 'US-DE', markets: [{ country: 'NG', kind: 'operates' }] });
    await answer(h, owner, company.id, { ...DELAWARE_ANSWERS, user_countries: ['GB'] });
    const scan = await scanNow(h, owner, company.id);
    const { rows } = await h.admin.query<{ packs_used: { jurisdiction: string; mode: string; rules: number; version: string }[]; rule_pack_versions: Record<string, string> }>(
      `SELECT packs_used, rule_pack_versions FROM scan WHERE id = $1`,
      [scan.id],
    );
    expect(rows[0]?.packs_used.map((use) => [use.jurisdiction, use.mode])).toEqual([['US', 'full'], ['US-DE', 'full'], ['GB', 'overlay'], ['NG', 'overlay']]);
    expect(Object.keys(rows[0]?.rule_pack_versions ?? {}).sort()).toEqual(['GB', 'NG', 'US', 'US-DE']);
    const findingCount = await h.admin.query<{ n: string }>(`SELECT count(*) AS n FROM finding WHERE scan_id = $1`, [scan.id]);
    expect(Number(findingCount.rows[0]?.n)).toBe(rows[0]?.packs_used.reduce((sum, use) => sum + use.rules, 0));
    const body = await overview(h, owner, company.id);
    expect(body.rulePacks.find((pack) => pack.jurisdiction === 'GB')).toMatchObject({ status: 'draft', mode: 'overlay' });
  });

  it('an investor market adds nothing', async () => {
    const company = await createCompany(h, owner, { legalName: 'Investors Ltd', markets: [{ country: 'NG', kind: 'investors' }] });
    await answer(h, owner, company.id, { ...GB_ANSWERS, investor_countries: ['NG'] });
    await scanNow(h, owner, company.id);
    const findings = await latest(company.id);
    expect(findings.filter((item) => item.rule_key.startsWith('NG.'))).toEqual([]);
  });

  it('findings say which country they are for, and filter by it', async () => {
    const company = await createCompany(h, owner, { legalName: 'Filter Inc.', incorporationCountry: 'US-DE' });
    await answer(h, owner, company.id, { ...DELAWARE_ANSWERS, user_countries: ['GB'] });
    await scanNow(h, owner, company.id);
    const read = async (query: string) =>
      (await h.request('GET', `/v1/companies/${company.id}/issues${query}`, { cookie: owner.cookie })).json<{ issues: { ruleKey: string; country: string; countryLabel: string; appliesBecause: string }[] }>().issues;
    const uk = await read('?country=GB&outcome=all');
    expect(uk.length).toBeGreaterThan(0);
    for (const issue of uk) expect(issue).toMatchObject({ country: 'GB', countryLabel: 'United Kingdom', appliesBecause: 'market' });
    const home = await read('?country=US-DE&outcome=all');
    for (const issue of home) {
      expect(issue.country).toBe('US-DE');
      expect(issue.appliesBecause).toBe('incorporated');
      expect(['Delaware', 'United States']).toContain(issue.countryLabel);
    }
  });

  it('adding a market through an answer brings its rules and its register on the next score', async () => {
    const company = await createCompany(h, owner, { legalName: 'Grows Inc.', incorporationCountry: 'US-DE' });
    await answer(h, owner, company.id, { ...DELAWARE_ANSWERS, user_countries: ['US'] });
    await scanNow(h, owner, company.id);
    expect((await latest(company.id)).some((item) => item.rule_key.startsWith('GB.'))).toBe(false);
    await answer(h, owner, company.id, { user_countries: ['US', 'GB'] });
    await h.queue.drain();
    expect((await latest(company.id)).some((item) => item.rule_key === 'GB.DP.ICO_FEE')).toBe(true);
    const asked = await h.admin.query(`SELECT 1 FROM source_result WHERE company_id = $1 AND connector_id = 'uk.ico_register'`, [company.id]);
    expect(asked.rows.length).toBe(1);
  });

  it('employer rules follow the staff', async () => {
    const company = await createCompany(h, owner, { legalName: 'Staff Inc.', incorporationCountry: 'US-DE' });
    await answer(h, owner, company.id, { ...DELAWARE_ANSWERS, user_countries: ['GB'], has_employees: true, employee_countries: ['US'], has_foreign_workers: false, has_delaware_employees: false });
    await scanNow(h, owner, company.id);
    expect((await latest(company.id)).some((item) => item.rule_key === 'GB.EMP.PENSION')).toBe(false);
    await answer(h, owner, company.id, { employee_countries: ['US', 'GB'] });
    await h.queue.drain();
    expect((await latest(company.id)).find((item) => item.rule_key === 'GB.EMP.PENSION')?.detail.jurisdiction).toBe('GB');
  });

  it('the vault asks for that market’s documents too, not its filings, and they count', async () => {
    const company = await createCompany(h, owner, { legalName: 'Vault Inc.', incorporationCountry: 'US-DE' });
    await answer(h, owner, company.id, { ...DELAWARE_ANSWERS, user_countries: ['GB'] });
    await scanNow(h, owner, company.id);
    const view = (await h.request('GET', `/v1/companies/${company.id}/documents`, { cookie: owner.cookie })).json<{ slots: { key: string }[] }>();
    const keys = view.slots.map((slot) => slot.key);
    expect(keys).toContain('gb_ropa');
    expect(keys).not.toContain('gb_ct_registration');
    await fileDocument(h, owner, company.id, 'gb_ropa');
    expect((await latest(company.id)).find((item) => item.rule_key === 'GB.DP.ROPA')?.outcome).toBe('pass');
    const refused = await upload(h, owner, company.id, 'a.pdf', pdfFile(), 'gb_ct_registration');
    expect(refused.statusCode).toBe(400);
  });
});

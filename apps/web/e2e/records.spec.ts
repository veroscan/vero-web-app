import type { Page } from '@playwright/test';
import { apiJson, calm, expect, expectAccessible, expectNoSideways, seedScanned, signIn, sql, test } from './support/helpers';

const GB_ANSWERS = { entity_type_gb: 'ltd', processes_personal_data: true };

interface Seed {
  companyId: string;
  organisationId: string;
  scanId: string;
}

/** A company in any of the three countries, through the real API and a real scan. */
async function seedCompany(page: Page, name: string, country: 'GB' | 'US-DE' | 'NG', options: { plan?: 'free' | 'growth' | 'scale'; parent?: string } = {}): Promise<Seed> {
  const company = await apiJson<{ id: string; organisationId: string }>(page, 'post', '/v1/companies', {
    legalName: name,
    incorporationCountry: country,
    registrationNumber: `${Date.now()}`.slice(-8),
    ...(options.parent ? { parentCompanyId: options.parent } : {}),
  });
  if (country === 'GB') await apiJson(page, 'patch', `/v1/companies/${company.id}/questionnaire`, { answers: GB_ANSWERS });
  const scan = await apiJson<{ id: string }>(page, 'post', `/v1/companies/${company.id}/scans`);
  await expect.poll(async () => (await apiJson<{ status: string }>(page, 'get', `/v1/scans/${scan.id}`)).status, { timeout: 60_000 }).toMatch(/completed|partial/);
  if (options.plan) await sql(`UPDATE organisation SET plan_id = (SELECT id FROM plan WHERE code = $1) WHERE id = $2`, [options.plan, company.organisationId]);
  return { companyId: company.id, organisationId: company.organisationId, scanId: scan.id };
}

async function putFact(companyId: string, key: string, value: string, source: string, method: string, fixture: boolean): Promise<void> {
  await sql(`DELETE FROM fact WHERE company_id = $1 AND key = $2`, [companyId, key]);
  await sql(
    `INSERT INTO fact (organisation_id, company_id, key, value, origin, source, source_name, evidence_method, retrieved_at, verification_tier, is_fixture)
     SELECT organisation_id, id, $2, $3::jsonb, $7, $4, $4, $5, now(), 1, $6 FROM company WHERE id = $1`,
    [companyId, key, value, source, method, fixture, method === 'document' ? 'document' : 'connector'],
  );
}

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

function factRow(page: Page, key: string) {
  return page.locator(`[data-testid="fact-row"][data-key="${key}"]`);
}

/** What a fact says, without its source line. */
function factValue(page: Page, key: string) {
  return factRow(page, key).locator('dd > span').first();
}

async function checkScreen(page: Page): Promise<void> {
  await expectAccessible(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoSideways(page);
  await page.setViewportSize({ width: 1440, height: 900 });
}

// ---- Deadlines ----

test('deadlines: overdue first, real dates, grouped by month, and a timeline that jumps to the row', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page);
  const list = await apiJson<{ deadlines: { id: string; title: string; state: string; ruleKey: string | null }[] }>(page, 'get', '/v1/deadlines');
  expect(list.deadlines.length).toBeGreaterThan(1);
  const [first, second] = list.deadlines;
  await sql('UPDATE deadline SET due_on = $1 WHERE id = $2', [isoDaysFromNow(-20), first?.id]);
  await sql('UPDATE deadline SET due_on = $1 WHERE id = $2', [isoDaysFromNow(9), second?.id]);

  await page.goto('/deadlines');
  await expect(page.getByRole('heading', { level: 1, name: 'Deadlines' })).toBeVisible();
  await expect(page.getByTestId('sample-note')).toBeVisible();
  await expect(page.getByTestId('deadline-group').first().getByRole('row').first()).toHaveText('Overdue');
  await expect(page.getByTestId('deadline-row')).toHaveCount(list.deadlines.length);

  const overdue = page.locator(`#d-${first?.id ?? ''}`);
  await expect(overdue).toHaveAttribute('data-state', 'overdue');
  const fix = overdue.getByRole('link', { name: 'Fix this' });
  await expect(fix).toHaveAttribute('href', new RegExp(`/issues/${companyId}/`));
  const dot = page.getByTestId('deadline-timeline').locator(`a[href="#d-${first?.id ?? ''}"]`);
  await dot.focus();
  await expect(dot).toHaveAccessibleName(/overdue/);
  // The dot itself: the link's own box is empty, its dot and label sit around it.
  await dot.locator('i').click();
  await expect(page).toHaveURL(new RegExp(`#d-${first?.id ?? ''}$`));

  // Every Fix this goes to a real issue, on this plan or to its upgrade path, and never to nothing.
  await fix.click();
  await page.waitForURL(`**/issues/${companyId}/**`);
  await expect(page.getByTestId('empty-state')).toHaveCount(0);
});

test('deadlines: nothing promises watching on any plan until it runs', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { organisationId } = await seedScanned(page, { plan: 'growth' });

  await page.goto('/deadlines');
  const plan = page.getByTestId('deadlines-plan');
  await expect(plan).toContainText('We look at these dates when you run a check.');
  await expect(plan).toContainText('Nothing re-checks a company on a timer yet.');
  const rule = page.locator('[data-testid="deadline-row"]', { hasText: 'We check this with' }).first();
  await expect(rule).toContainText('when you run a check');

  await sql(`UPDATE organisation SET plan_id = (SELECT id FROM plan WHERE code = 'scale') WHERE id = $1`, [organisationId]);
  await page.reload();
  await expect(page.getByTestId('deadline-row').first()).toBeVisible();
  // Scale includes it, but it isn't running yet, so the words stay the same.
  await expect(page.getByTestId('deadlines-plan')).toContainText('Nothing re-checks a company on a timer yet.');
  await expect(page.locator('[data-testid="deadline-row"]', { hasText: 'We check this with' }).first()).toContainText('when you run a check');
});

test("deadlines: one with no real date stays undated, and a person's done is theirs", async ({ page }) => {
  await calm(page);
  await signIn(page);
  await seedScanned(page);
  const list = await apiJson<{ deadlines: { id: string; title: string; monitoring: string }[]; undated: { title: string; waitingOn: string }[] }>(page, 'get', '/v1/deadlines');
  const reminder = list.deadlines.find((item) => item.monitoring === 'reminder');
  const auto = list.deadlines.find((item) => item.monitoring === 'auto');
  expect(reminder, 'the fixtures give a reminder deadline').toBeTruthy();
  expect(auto, 'the fixtures give a checked deadline').toBeTruthy();

  await page.goto('/deadlines');
  if (list.undated.length > 0) {
    const undated = page.getByTestId('undated-row');
    await expect(undated).toHaveCount(list.undated.length);
    await expect(undated.first()).toContainText('No date');
    await expect(undated.first()).toContainText(list.undated[0]?.waitingOn ?? '');
    await expect(page.getByTestId('deadlines-undated')).toContainText("won't guess a date");
  }

  // A date we read from a source can't be ticked off here.
  await expect(page.locator(`#d-${auto?.id ?? ''}`).getByRole('button', { name: 'Mark as done' })).toHaveCount(0);

  const row = page.locator(`#d-${reminder?.id ?? ''}`);
  await row.getByRole('button', { name: 'Mark as done' }).click();
  const doneRow = page.getByTestId('done-row');
  await expect(doneRow).toContainText(reminder?.title ?? '');
  await expect(page.getByTestId('deadlines-done')).toContainText('Dates you told Vero are done.');
  await expect(page.locator(`#d-${reminder?.id ?? ''}`)).toHaveCount(0);

  // A mistake is one click to take back.
  await doneRow.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator(`#d-${reminder?.id ?? ''}`).getByRole('button', { name: 'Mark as done' })).toBeVisible();
  await expect(doneRow).toHaveCount(0);
});

test('deadlines: undated rows from the API are never given a date', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await seedScanned(page);
  const real = await apiJson<{ deadlines: unknown[] }>(page, 'get', '/v1/deadlines');
  const companies = await apiJson<{ companies: { id: string }[] }>(page, 'get', '/v1/companies');
  await page.route('**/v1/deadlines', (route) =>
    route.fulfill({
      json: {
        deadlines: real.deadlines,
        undated: [{ companyId: companies.companies[0]?.id, ruleKey: 'X.Y', title: 'A date we cannot know', monitoring: 'reminder', howWeTrack: "We'll remind you and ask for proof", waitingOn: 'the date it happened' }],
      },
    }),
  );
  await page.goto('/deadlines');
  const row = page.getByTestId('undated-row');
  await expect(row).toContainText('A date we cannot know');
  await expect(row).toContainText('We need the date it happened');
  await expect(row).toContainText('No date');
  await expect(row).not.toContainText(/\b\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/);
});

test('deadlines: loading, nothing known yet, and an error with a retry', async ({ page, watch }) => {
  await calm(page);
  await signIn(page);
  await seedScanned(page);

  // Nothing yet never says nothing is due.
  await page.route('**/v1/deadlines', (route) => route.fulfill({ json: { deadlines: [], undated: [] } }));
  await page.goto('/deadlines');
  const empty = page.getByTestId('deadlines-empty');
  await expect(empty).toContainText("We don't have any dates yet");
  await expect(empty).toContainText("That doesn't mean nothing is due");
  await empty.getByRole('link', { name: 'See your registry records' }).click();
  await page.waitForURL('**/company');
  await expect(page.getByTestId('company-records')).toBeVisible();
  await page.unroute('**/v1/deadlines');

  watch.allow(/Failed to load resource/);
  let fail = true;
  await page.route('**/v1/deadlines', async (route) => {
    if (fail) return route.fulfill({ status: 500, json: { error: { code: 'internal', message: 'Something went wrong.' } } });
    await new Promise((resolve) => setTimeout(resolve, 600));
    return route.continue();
  });
  await page.goto('/deadlines');
  await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: /try again/i }).click();
  await expect(page.getByText('Getting your deadlines')).toBeVisible();
  await expect(page.getByTestId('deadline-row').first()).toBeVisible();
});

test('deadlines: a group filters by company, and a link can ask for one', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const root = await seedCompany(page, 'Kestrel Pay Inc.', 'US-DE', { plan: 'growth' });
  const uk = await seedCompany(page, 'Kestrel Pay UK Ltd', 'GB', { parent: root.companyId });

  await page.goto('/deadlines');
  await expect(page.getByRole('group', { name: 'Filter by company' }).getByRole('button')).toHaveCount(3);
  await page.getByRole('group', { name: 'Filter by company' }).getByRole('button', { name: 'Kestrel Pay UK Ltd' }).click();
  await expect(page.getByTestId('deadline-row').first()).toContainText('Kestrel Pay UK Ltd');
  for (const row of await page.getByTestId('deadline-row').all()) await expect(row).toContainText('Kestrel Pay UK Ltd');

  await page.goto(`/deadlines?company=${uk.companyId}`);
  await expect(page.getByRole('button', { name: 'Kestrel Pay UK Ltd' })).toHaveAttribute('aria-pressed', 'true');
});

test('deadlines: a date with its year stays in its own column on a phone', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await seedScanned(page);
  const list = await apiJson<{ deadlines: { id: string }[] }>(page, 'get', '/v1/deadlines');
  await sql('UPDATE deadline SET due_on = $1 WHERE id = $2', [`${new Date().getUTCFullYear() + 1}-06-30`, list.deadlines[0]?.id]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/deadlines');
  const row = page.locator(`#d-${list.deadlines[0]?.id ?? ''}`);
  const dateCell = row.getByRole('cell').nth(0);
  await expect(dateCell).toContainText(String(new Date().getUTCFullYear() + 1));
  const date = await dateCell.boundingBox();
  const words = await row.getByRole('cell').nth(1).boundingBox();
  expect((date?.x ?? 0) + (date?.width ?? 0)).toBeLessThanOrEqual(words?.x ?? 0);
  const fits = await dateCell.evaluate((node) => node.scrollWidth <= node.clientWidth);
  expect(fits, 'the date fits its column').toBe(true);
});

// ---- Company records ----

test('records UK: facts with their source and date, and "Not found" is never proof', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedCompany(page, 'Kestrel Pay UK Ltd', 'GB', { plan: 'growth' });

  await page.goto('/');
  const nav = page.getByRole('complementary', { name: 'Main' }).getByRole('navigation');
  await nav.getByRole('link', { name: 'Registry records' }).click();
  await page.waitForURL('**/company');
  const screen = page.getByTestId('company-records');
  await expect(screen).toHaveAttribute('data-country', 'GB');
  await expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('Registry records');
  await expect(screen.getByRole('link', { name: /Kestrel Pay UK Ltd/ })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Registry records' })).toHaveClass(/on/);
  await expect(page.getByTestId('sample-note')).toBeVisible();
  await expect(page.getByTestId('records-checked')).toContainText(/Checked today at \d\d:\d\d\./);

  await expect(factRow(page, 'registry.uk.companies_house.status')).toContainText('Active');
  await expect(factRow(page, 'registry.uk.companies_house.company_number')).toContainText('14839221');
  await expect(factRow(page, 'registry.uk.companies_house.directors_active_count')).toContainText('2 on record');

  // Every fact says where it came from and when, and keeps its sample note.
  const sources = page.getByTestId('fact-source');
  expect(await sources.count()).toBeGreaterThan(5);
  for (const source of await sources.all()) {
    await expect(source).toContainText(/today|on \d{1,2} \w{3} \d{4}/);
    await expect(source).toContainText('(sample data, not a real record)');
  }

  const ico = factRow(page, 'registry.uk.ico.listed');
  await expect(ico).toContainText('Data protection fee');
  await expect(factValue(page, 'registry.uk.ico.listed')).toHaveText('Not found');
  await expect(ico.getByTestId('fact-source')).toContainText('Checked the ICO register today');
  await expect(ico).not.toContainText('Found on the');
  await expect(ico).toContainText("That isn't proof it isn't there");
  await expect(ico.getByRole('link', { name: 'Upload your receipt' })).toHaveAttribute('href', `/documents/add?company=${companyId}&slot=gb_ico_receipt`);
  await expect(factValue(page, 'registry.sanctions.match')).toHaveText('No matches');
  await expect(screen.getByText(/^(No|Yes)$/)).toHaveCount(0);

  // An overdue date explains itself, and its links lead somewhere real.
  const list = await apiJson<{ deadlines: { state: string; ruleKey: string | null }[] }>(page, 'get', '/v1/deadlines');
  const confirmation = factRow(page, 'registry.uk.companies_house.confirmation_next_due');
  if (list.deadlines.some((item) => item.ruleKey === 'GB.CORP.CONFIRMATION_STATEMENT' && item.state === 'overdue')) {
    await expect(factValue(page, 'registry.uk.companies_house.confirmation_next_due')).toContainText('Overdue since');
    await expect(confirmation).toContainText('File it on the Companies House website');
    await expect(page.getByTestId('records-checked')).toContainText(/\d+ things? needs? you\./);
    await expect(confirmation.getByRole('link', { name: 'See it in your deadlines' })).toHaveAttribute('href', `/deadlines?company=${companyId}`);
    await confirmation.getByRole('link', { name: /How to fix this/ }).click();
    await page.waitForURL(`**/issues/${companyId}/GB.CORP.CONFIRMATION_STATEMENT`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
});

test('records UK: Check again really runs, and a limit or failure is said plainly', async ({ page, watch }) => {
  await calm(page);
  await signIn(page);
  const { companyId, scanId } = await seedCompany(page, 'Kestrel Pay UK Ltd', 'GB');
  await sql(`UPDATE source_result SET retrieved_at = now() - interval '3 days' WHERE scan_id = $1`, [scanId]);

  await page.goto(`/company/${companyId}`);
  await expect(page.getByTestId('records-checked')).toContainText(/Checked on \d{1,2} \w{3} \d{4} at/);
  const before = await sql<{ count: string }>('SELECT count(*) FROM scan WHERE company_id = $1', [companyId]);
  await page.getByTestId('check-again').click();
  await expect(page.getByText('Checked again just now.')).toBeVisible({ timeout: 60_000 });
  const after = await sql<{ count: string }>('SELECT count(*) FROM scan WHERE company_id = $1', [companyId]);
  expect(Number(after[0]?.count)).toBe(Number(before[0]?.count) + 1);
  await expect(page.getByTestId('records-checked')).toContainText(/Checked today at/);

  watch.allow(/Failed to load resource/);
  await page.route('**/records/check-again', (route) => route.fulfill({ status: 429, json: { error: { code: 'rate_limited', message: "You've checked this a lot in the last hour. Try again later." } } }));
  await page.getByTestId('check-again').click();
  await expect(page.getByTestId('check-again-problem')).toContainText("You've checked this a lot");
  await expect(page.getByTestId('company-records')).toBeVisible();
});

test('records Delaware: never a live status, only "Certified {date}" from a certificate', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedCompany(page, 'Kestrel Pay Inc.', 'US-DE', { plan: 'growth' });
  // Even when the provider's status exists, it isn't to be shown as Delaware's status.
  await putFact(companyId, 'registry.us.delaware_vendor.vendor_status', '"Good standing, live"', 'our licensed data provider', 'licensed_vendor', true);

  await page.goto('/company');
  const screen = page.getByTestId('company-records');
  await expect(screen).toHaveAttribute('data-country', 'US-DE');
  await expect(screen).not.toContainText('Good standing, live');
  await expect(screen).not.toContainText('Active');
  await expect(factValue(page, 'good_standing')).toHaveText('No certificate on file');
  const note = page.getByTestId('records-delaware-note');
  await expect(note).toContainText("Delaware doesn't allow automatic status checks");
  await expect(note).toContainText('We go by your Certificate of Good Standing');
  await expect(note.getByRole('link', { name: 'Upload your certificate' })).toHaveAttribute('href', `/documents/add?company=${companyId}&slot=de_good_standing`);
  await expect(factRow(page, 'registry.us.delaware_vendor.registered_agent')).toContainText('Northwood Agents LLC');
  await expect(factRow(page, 'registry.us.delaware_vendor.registered_agent').getByTestId('fact-source')).toContainText('From our licensed data provider. Retrieved today');
  await expect(factRow(page, 'registry.us.delaware_vendor.entity_type')).toContainText('Corporation');

  // With a checked certificate, it says Certified and its date, and nothing about being live.
  await putFact(companyId, 'vault.de_good_standing.validated', 'true', 'Your Certificate of Good Standing', 'document', false);
  await putFact(companyId, 'vault.de_good_standing.dated', '"2026-10-12"', 'Your Certificate of Good Standing', 'document', false);
  await page.reload();
  await expect(factValue(page, 'good_standing')).toHaveText('Certified 12 Oct 2026');
  await expect(factRow(page, 'good_standing').getByTestId('fact-source')).toContainText('You uploaded this and we read it');
  await expect(page.getByTestId('records-delaware-note').getByRole('link', { name: 'Upload a new certificate' })).toBeVisible();
});

test('records Nigeria: "Active" is explained, and a status report is the way to settle it', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedCompany(page, 'Kestrel Pay Nigeria Ltd', 'NG', { plan: 'growth' });

  await page.goto(`/company/${companyId}`);
  const screen = page.getByTestId('company-records');
  await expect(screen).toHaveAttribute('data-country', 'NG');
  await expect(factValue(page, 'registry.ng.cac.status')).toHaveText('Active');
  await expect(factRow(page, 'registry.ng.cac.status').getByTestId('fact-source')).toContainText('CAC, through our licensed data provider. Retrieved today');
  await expect(factRow(page, 'registry.ng.cac.rc_number')).toContainText('1849302');
  await expect(factRow(page, 'registry.ng.cac.directors_count')).toContainText('2 on record');

  const note = page.getByTestId('records-nigeria-note');
  await expect(note).toContainText("\"Active\" doesn't always mean up to date");
  await expect(note.getByRole('link', { name: 'Upload a status report' })).toHaveAttribute('href', `/documents/add?company=${companyId}&slot=ng_cac_status_report`);

  const ndpc = factRow(page, 'registry.ng.ndpc.listed');
  await expect(factValue(page, 'registry.ng.ndpc.listed')).toHaveText('Not found');
  await expect(ndpc).toContainText("That isn't proof it isn't there");
  await expect(ndpc.getByTestId('fact-source')).toContainText('Checked the NDPC list today');
});

test('records: a source that is down says so, and a company nobody found is never called absent', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId, scanId } = await seedCompany(page, 'Kestrel Pay UK Ltd', 'GB');
  await sql(`UPDATE source_result SET status = 'error' WHERE scan_id = $1 AND connector_id = 'uk.hmrc_vat'`, [scanId]);
  await sql(`DELETE FROM fact WHERE company_id = $1 AND key LIKE 'registry.uk.hmrc_vat.%'`, [companyId]);

  await page.goto(`/company/${companyId}`);
  const down = page.getByTestId('sources-down');
  await expect(down).toContainText('One source is down.');
  await expect(down).toContainText('HMRC');
  await expect(down).toContainText("won't count for or against your score");
  const source = factRow(page, 'source:uk.hmrc_vat');
  await expect(factValue(page, 'source:uk.hmrc_vat')).toHaveText('Retrying');
  await expect(source).toContainText("We couldn't reach this source just now");
  await expect(factRow(page, 'registry.uk.companies_house.status')).toContainText('Active');

  // The same state reaches Deadlines.
  await page.goto('/deadlines');
  await expect(page.getByTestId('sources-down')).toContainText('One source is down.');
});

test('records: a company the registers could not find, and one they could not reach', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const ghost = await seedCompany(page, 'Ghost Widgets Ltd', 'GB');
  const broken = await seedCompany(page, 'Broken Widgets Ltd', 'GB', { parent: ghost.companyId });

  await page.goto(`/company/${ghost.companyId}`);
  const house = factRow(page, 'source:uk.companies_house');
  await expect(factValue(page, 'source:uk.companies_house')).toHaveText('Not found');
  await expect(house).toContainText("That isn't proof there isn't one");
  await expect(page.getByTestId('company-records')).not.toContainText(/doesn't exist|does not exist|no such company/i);

  await page.goto(`/company/${broken.companyId}`);
  await expect(page.getByTestId('sources-down')).toContainText(/sources? (is|are) down/);
  await expect(factValue(page, 'source:uk.companies_house')).toHaveText('Retrying');
  await expect(page.getByTestId('company-records')).not.toContainText('Not found');
});

test('records: tabs between companies, and old links reach the right company', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const root = await seedCompany(page, 'Kestrel Pay Inc.', 'US-DE', { plan: 'growth' });
  const uk = await seedCompany(page, 'Kestrel Pay UK Ltd', 'GB', { parent: root.companyId });
  const ng = await seedCompany(page, 'Kestrel Pay Nigeria Ltd', 'NG', { parent: root.companyId });

  await page.goto('/company');
  const tabs = page.getByRole('navigation', { name: 'Companies' });
  await expect(tabs.getByRole('link')).toHaveText([/^Kestrel Pay Inc\.\s*Delaware/, /^Kestrel Pay UK Ltd\s*United Kingdom/, /^Kestrel Pay Nigeria Ltd\s*Nigeria/]);
  await expect(tabs.getByRole('link', { name: /Delaware/ })).toHaveAttribute('aria-current', 'page');
  await tabs.getByRole('link', { name: /United Kingdom/ }).click();
  await page.waitForURL(`**/company/${uk.companyId}`);
  await expect(page.getByTestId('company-records')).toHaveAttribute('data-country', 'GB');
  await expect(tabs.getByRole('link', { name: /United Kingdom/ })).toHaveAttribute('aria-current', 'page');
  await tabs.getByRole('link', { name: /Nigeria/ }).click();
  await page.waitForURL(`**/company/${ng.companyId}`);
  await expect(page.getByTestId('company-records')).toHaveAttribute('data-country', 'NG');

  await page.goto(`/companies/${uk.companyId}`);
  await page.waitForURL(`**/company/${uk.companyId}`);
  await page.goto(`/companies/${uk.companyId}/deadlines`);
  await page.waitForURL(`**/deadlines?company=${uk.companyId}`);
  // Old links to orders, from before the lawyer service was removed, land on the company.
  await page.goto(`/companies/${uk.companyId}/orders`);
  await page.waitForURL(`**/company/${uk.companyId}`);
});

test('records: Free sees the facts, with uploading behind the plan; loading and errors are plain', async ({ page, watch }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedCompany(page, 'Kestrel Pay Inc.', 'US-DE');

  await page.goto('/company');
  await expect(factValue(page, 'good_standing')).toHaveText('No certificate on file');
  const locked = page.getByTestId('records-upload-locked');
  await expect(locked).toContainText('part of a paid plan');
  await expect(locked.getByRole('link', { name: 'See the plans' })).toHaveAttribute('href', '/plan');
  await expect(page.getByTestId('records-delaware-note').getByRole('link', { name: /Upload/ })).toHaveCount(0);

  watch.allow(/Failed to load resource/);
  let fail = true;
  await page.route(`**/v1/companies/${companyId}/records`, async (route) => {
    if (fail) return route.fulfill({ status: 500, json: { error: { code: 'internal', message: 'Something went wrong.' } } });
    await new Promise((resolve) => setTimeout(resolve, 600));
    return route.continue();
  });
  await page.goto('/company');
  await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: /try again/i }).click();
  await expect(page.getByText('Getting your company records')).toBeVisible();
  await expect(page.getByTestId('company-records')).toBeVisible();
  await page.unroute(`**/v1/companies/${companyId}/records`);

  // No facts from any source yet: says so, and says nothing about the company.
  await page.route(`**/v1/companies/${companyId}/records`, async (route) => {
    const response = await route.fetch();
    const body = (await response.json()) as Record<string, unknown>;
    await route.fulfill({ json: { ...body, items: [], sources: [], checkedAt: null, sampleData: false } });
  });
  await page.goto('/company');
  await expect(page.getByTestId('records-empty')).toContainText("We haven't got any records for this company yet");
  await expect(page.getByTestId('records-checked')).toHaveText('Not checked yet.');
});

test('a role that can only read sees the dates and facts, without the buttons', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId, organisationId } = await seedScanned(page);
  await sql(`UPDATE membership SET role = 'lawyer' WHERE organisation_id = $1`, [organisationId]);

  await page.goto(`/company/${companyId}`);
  await expect(page.getByTestId('company-records')).toBeVisible();
  await expect(page.getByTestId('check-again')).toHaveCount(0);
  await page.goto('/deadlines');
  await expect(page.getByTestId('deadline-row').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark as done' })).toHaveCount(0);
});

for (const theme of ['light', 'dark'] as const) {
  test(`deadlines and every country's records pass axe and fit a phone, in ${theme}`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await signIn(page);
    const root = await seedCompany(page, 'Kestrel Pay Inc.', 'US-DE', { plan: 'growth' });
    const uk = await seedCompany(page, 'Kestrel Pay UK Ltd', 'GB', { parent: root.companyId });
    const ng = await seedCompany(page, 'Kestrel Pay Nigeria Ltd', 'NG', { parent: root.companyId });
    const list = await apiJson<{ deadlines: { id: string }[] }>(page, 'get', '/v1/deadlines');
    await sql('UPDATE deadline SET due_on = $1 WHERE id = $2', [isoDaysFromNow(-5), list.deadlines[0]?.id]);
    // So the screen has a row with the two-step "done" on it, whichever deadlines these companies get.
    await sql(`UPDATE deadline SET monitoring = 'reminder' WHERE id = $1`, [list.deadlines[1]?.id]);

    await page.goto('/deadlines');
    await expect(page.getByTestId('deadline-row').first()).toBeVisible();
    await checkScreen(page);
    const mark = page.getByRole('button', { name: 'Mark as done' }).first();
    await mark.click();
    await checkScreen(page);

    for (const [id, country] of [[root.companyId, 'US-DE'], [uk.companyId, 'GB'], [ng.companyId, 'NG']] as const) {
      await page.goto(`/company/${id}`);
      await expect(page.getByTestId('company-records')).toHaveAttribute('data-country', country);
      await checkScreen(page);
    }
  });
}

test('the Free states of both screens pass axe', async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await signIn(page);
  await seedCompany(page, 'Kestrel Pay Inc.', 'US-DE');
  await page.goto('/company');
  await expect(page.getByTestId('records-upload-locked')).toBeVisible();
  await checkScreen(page);
  await page.goto('/deadlines');
  await expect(page.getByRole('heading', { level: 1, name: 'Deadlines' })).toBeVisible();
  await expect(page.getByText('Getting your deadlines')).toHaveCount(0);
  await checkScreen(page);
});

import type { Browser, Page } from '@playwright/test';
import { WEB_URL } from './support/env';
import { apiJson, calm, chooseOption, expect, expectAccessible, expectNoSideways, seedPlain, seedScanned, signIn, sql, test, uniqueEmail } from './support/helpers';

async function checkScreen(page: Page): Promise<void> {
  await expectAccessible(page);
  for (const width of [390, 375]) {
    await page.setViewportSize({ width, height: 844 });
    await expectNoSideways(page);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
}

/** Someone on the review desk: a real account, on the staff list the API checks. */
async function staffPage(browser: Browser, role: 'lawyer' | 'admin', colorScheme: 'light' | 'dark' = 'light'): Promise<{ page: Page; email: string }> {
  const context = await browser.newContext({ baseURL: WEB_URL, reducedMotion: 'reduce', colorScheme });
  const page = await context.newPage();
  const email = await signIn(page, uniqueEmail(role));
  await sql(`INSERT INTO platform_staff (user_id, role) SELECT id, $2 FROM "user" WHERE email = $1`, [email, role]);
  return { page, email };
}

async function auditActions(organisationId: string | null, actorEmail: string): Promise<string[]> {
  const rows = await sql<{ action: string }>(
    `SELECT a.action FROM audit_log a JOIN "user" u ON u.id = a.actor_id WHERE u.email = $1 AND ($2::uuid IS NULL OR a.organisation_id = $2::uuid)`,
    [actorEmail, organisationId],
  );
  return rows.map((row) => row.action);
}

const DESK_ROUTES = ['/review/work', '/admin'];

// ---- Permission ----

test('someone without staff access gets a plain refusal on every desk route, and never sees the screen', async ({ page, watch }) => {
  await calm(page);
  watch.allow(/status of 403/);
  const email = await signIn(page);
  await seedScanned(page);
  for (const route of DESK_ROUTES) {
    await page.goto(route);
    const refused = page.getByTestId('staff-refused');
    await expect(refused).toContainText("You don't have access to this");
    await expect(page.getByRole('navigation', { name: 'Review desk' })).toHaveCount(0);
    await expect(page.getByText('Rule packs and data')).toHaveCount(0);
    await expect(page.getByTestId('audit-note')).toHaveCount(0);
  }
  await expect.poll(async () => (await auditActions(null, email)).filter((action) => action === 'staff.access_denied').length).toBeGreaterThanOrEqual(DESK_ROUTES.length);
  await page.getByRole('link', { name: 'Go to your home page' }).click();
  await page.waitForURL((url) => url.pathname === '/');
});

test('signed out, the desk goes to sign-in; a lawyer gets the desk but not admin', async ({ page, browser, watch }) => {
  await calm(page);
  await page.goto('/review/work');
  await page.waitForURL('**/sign-in**');
  await page.goto('/admin');
  await page.waitForURL('**/sign-in**');

  watch.allow(/status of 403/);
  const lawyer = await staffPage(browser, 'lawyer');
  await lawyer.page.goto('/review/work');
  await expect(lawyer.page.getByTestId('staff-work')).toBeVisible();
  await lawyer.page.goto('/admin');
  await expect(lawyer.page.getByTestId('staff-refused')).toContainText("Vero's admins");
  await expect(lawyer.page.getByTestId('admin')).toHaveCount(0);
  await lawyer.page.context().close();
});

// ---- Company look-ups ----

test('company look-ups: an update really reaches the client, and is audited; nothing yet says so', async ({ page, browser }) => {
  test.setTimeout(120_000);
  await calm(page);
  await signIn(page);
  const { organisationId } = await seedPlain(page);
  const lookup = await apiJson<{ id: string }>(page, 'post', '/v1/registry/lookup-requests', { country: 'GB', legalName: 'Ghost Trading Ltd' });
  const [work] = await sql<{ id: string }>('SELECT id FROM staff_notification WHERE tenant_id = $1 AND ref_id = $2', [organisationId, lookup.id]);

  const { page: desk, email } = await staffPage(browser, 'lawyer');
  await desk.goto('/review/work');
  await expect(desk.getByRole('navigation', { name: 'Review desk' }).getByRole('link', { name: 'Company look-ups' })).toHaveAttribute('aria-current', 'page');
  const row = desk.locator(`[data-work="${work?.id ?? ''}"]`);
  await expect(row).toContainText('Company look-up');
  await expect(row).toContainText('Ghost Trading Ltd, GB.');
  await expect(row.locator('.st')).toHaveText('New');
  const update = row.getByRole('button', { name: 'Update' });
  await expect(update).toBeDisabled();
  await chooseOption(desk, row.getByLabel('Set it to'), 'Completed');
  await update.click();
  await expect(desk.getByText('Updated. The client has been told.')).toBeVisible();
  await expect(row.locator('.st')).toHaveText('Updated before');
  await expect.poll(async () => (await sql<{ status: string }>('SELECT status FROM lookup_request WHERE id = $1', [lookup.id]))[0]?.status).toBe('completed');
  await expect.poll(async () => auditActions(organisationId, email)).toContain('staff.work_updated');

  await desk.route('**/v1/review/work', (route) => route.fulfill({ json: { items: [] } }));
  await desk.reload();
  await expect(desk.getByTestId('work-empty')).toContainText('Nothing has been asked for yet');
  await desk.context().close();
});

// ---- Admin ----

test('admin: a pack is never called approved unless the API says so, and approving takes a real confirmation', async ({ browser }) => {
  test.setTimeout(120_000);
  const { page: desk, email } = await staffPage(browser, 'admin');
  // Its own pack, so the real ones stay as they are for everything else.
  const version = `9.${Date.now() % 100000}.0`;
  await sql(`INSERT INTO rule_pack (jurisdiction_code, version) VALUES ('US', $1)`, [version]);
  try {
    await desk.goto('/admin');
    await expect(desk.getByTestId('audit-note')).toContainText('Everything here is audited.');
    const list = await apiJson<{ packs: { jurisdiction: string; version: string; status: string }[] }>(desk, 'get', '/v1/admin/rule-packs');
    await expect(desk.getByTestId('admin-pack')).toHaveCount(list.packs.length);
    for (const pack of list.packs) {
      const row = desk.locator(`[data-pack="${pack.jurisdiction}@${pack.version}"]`);
      await expect(row.getByTestId('pack-status')).toHaveText(pack.status === 'approved' ? 'Approved' : pack.status === 'retired' ? 'Retired' : 'Draft');
    }

    const row = desk.locator(`[data-pack="US@${version}"]`);
    await expect(row).toContainText('Not approved by a lawyer yet.');
    await row.locator('summary').click();
    await row.getByRole('button', { name: 'Approve this pack' }).click();
    const form = row.getByTestId('approve-form');
    await expect(form).toContainText("It's a professional sign-off, under the name of the lawyer you enter here.");
    await expect(form).toContainText("can't be undone");
    const confirm = form.getByTestId('approve-confirm');
    await expect(confirm).toBeDisabled();
    await form.getByLabel('The name of the lawyer approving this').fill('Ada Eze');
    await expect(confirm).toBeDisabled();
    await form.getByRole('checkbox').check();
    await form.getByRole('button', { name: 'Cancel' }).click();
    expect((await sql<{ status: string }>(`SELECT status FROM rule_pack WHERE version = $1`, [version]))[0]?.status).toBe('draft');

    await row.getByRole('button', { name: 'Approve this pack' }).click();
    await form.getByLabel('The name of the lawyer approving this').fill('Ada Eze');
    await form.getByRole('checkbox').check();
    await confirm.click();
    await expect(row.getByTestId('pack-status')).toHaveText('Approved');
    await expect(row).toContainText('Approved by Ada Eze on');
    const [saved] = await sql<{ status: string; approved_by: string }>(`SELECT status, approved_by FROM rule_pack WHERE version = $1`, [version]);
    expect(saved).toEqual({ status: 'approved', approved_by: 'Ada Eze' });
    await expect.poll(async () => auditActions(null, email)).toContain('rule_pack.approved');
    await row.locator('summary').click();
    await expect(row.getByRole('button', { name: 'Approve this pack' })).toHaveCount(0);

    // Even a draft that somehow carries a name stays a draft on this screen.
    await desk.route('**/v1/admin/rule-packs', (route) => route.fulfill({ json: { packs: [{ jurisdiction: 'GB', name: 'United Kingdom', version: '1.0.0', status: 'draft', approvedBy: 'Someone', approvedAt: new Date().toISOString(), ruleCount: 3, needsReviewCount: 1 }] } }));
    await desk.reload();
    const draft = desk.getByTestId('admin-pack');
    await expect(draft.getByTestId('pack-status')).toHaveText('Draft');
    await expect(draft).not.toContainText('Approved by');
    await draft.locator('summary').click();
    await draft.getByRole('button', { name: 'Approve this pack' }).click();
    await expect(desk.getByTestId('approve-needs-review')).toContainText('1 of them are still marked for a lawyer to check');
  } finally {
    await sql(`DELETE FROM rule_pack WHERE version = $1`, [version]);
    await desk.context().close();
  }
});

test('admin: connector health says what it knows, and a sample run is labelled', async ({ browser }) => {
  const { page: desk } = await staffPage(browser, 'admin');
  await desk.goto('/admin');
  const health = await apiJson<{ mode: string; connectors: { id: string }[] }>(desk, 'get', '/v1/admin/connectors');
  await expect(desk.getByTestId('admin-source')).toHaveCount(health.connectors.length);
  expect(health.mode).toBe('fixture');
  await expect(desk.getByTestId('admin-sources').getByTestId('sample-note')).toContainText('made-up records');
  await expect(desk.getByTestId('admin-sources')).not.toContainText('Working');

  const now = new Date().toISOString();
  const row = (id: string, lastStatus: string | null, failures: number) => ({ id, sourceName: id, jurisdictions: ['GB'], lastStatus, lastCheckedAt: lastStatus ? now : null, lastOkAt: null, lastFailureAt: null, consecutiveFailures: failures });
  await desk.route('**/v1/admin/connectors', (route) => route.fulfill({ json: { mode: 'live', connectors: [row('up', 'found', 0), row('down', 'error', 3), row('off', 'unavailable', 0), row('new', null, 0)] } }));
  await desk.reload();
  await expect(desk.locator('[data-connector="up"] .st')).toHaveText('Working');
  await expect(desk.locator('[data-connector="down"] .st')).toHaveText('Not responding');
  await expect(desk.locator('[data-connector="down"]')).toContainText('3 failures in a row');
  await expect(desk.locator('[data-connector="off"] .st')).toHaveText('Not connected');
  await expect(desk.locator('[data-connector="new"] .st')).toHaveText('Not checked yet');
  await expect(desk.getByTestId('admin-sources').getByTestId('sample-note')).toHaveCount(0);
  await desk.context().close();
});

test('admin: staff access and a plan really change, and paging works', async ({ page, browser, watch }) => {
  test.setTimeout(120_000);
  await calm(page);
  watch.allow(/status of 403/);
  const email = await signIn(page);
  const { organisationId } = await seedScanned(page);
  const { page: desk, email: adminEmail } = await staffPage(browser, 'admin');

  const [position] = await sql<{ n: string }>(`SELECT count(*) AS n FROM "user" WHERE (created_at, id) < (SELECT created_at, id FROM "user" WHERE email = $1)`, [email]);
  const from = Math.floor(Number(position?.n ?? 0) / 50) * 50;
  await desk.goto(`/admin?from=${from}`);
  const person = desk.locator(`[data-testid="admin-user"][data-email="${email}"]`);
  await expect(person.getByTestId('admin-staff-role')).toHaveText('Not staff');
  await person.locator('summary').click();

  await page.goto('/review/work');
  await expect(page.getByTestId('staff-refused')).toBeVisible();
  await chooseOption(desk, person.getByLabel('Staff access'), 'Lawyer');
  await expect(person.getByTestId('admin-staff-role')).toHaveText('Staff: lawyer');
  await page.goto('/review/work');
  await expect(page.getByTestId('staff-work')).toBeVisible();
  await chooseOption(desk, person.getByLabel('Staff access'), 'Not staff');
  await expect(person.getByTestId('admin-staff-role')).toHaveText('Not staff');
  await page.goto('/review/work');
  await expect(page.getByTestId('staff-refused')).toBeVisible();

  const org = person.locator(`[data-org="${organisationId}"]`);
  await chooseOption(desk, org.getByLabel(/Plan for/), 'Growth');
  await org.getByRole('button', { name: 'Set plan' }).click();
  await expect(desk.getByText(/is now on Growth\. They've been told\./)).toBeVisible();
  expect((await apiJson<{ current: string }>(page, 'get', '/v1/plans')).current).toBe('growth');
  await expect.poll(async () => auditActions(organisationId, adminEmail)).toContain('plan.changed');

  // An admin can't take away their own access.
  const [self] = await sql<{ n: string }>(`SELECT count(*) AS n FROM "user" WHERE (created_at, id) < (SELECT created_at, id FROM "user" WHERE email = $1)`, [adminEmail]);
  await desk.goto(`/admin?from=${Math.floor(Number(self?.n ?? 0) / 50) * 50}`);
  const me = desk.locator(`[data-testid="admin-user"][data-email="${adminEmail}"]`);
  await me.locator('summary').click();
  await chooseOption(desk, me.getByLabel('Staff access'), 'Not staff');
  await expect(me.getByRole('alert')).toContainText("You can't remove your own access");

  await desk.route('**/v1/admin/users**', (route) => route.fulfill({ json: { users: [], hasMore: false } }));
  await desk.goto('/admin?from=100');
  await expect(desk.getByTestId('users-empty')).toBeVisible();
  await expect(desk.getByRole('link', { name: 'Earlier people' })).toHaveAttribute('href', '/admin?from=50');
  await expect(desk.getByRole('link', { name: 'More people' })).toHaveCount(0);
  await desk.context().close();
});

test('admin: loading and an error with a retry', async ({ browser }) => {
  const { page: desk } = await staffPage(browser, 'admin');
  let fail = true;
  await desk.route('**/v1/admin/rule-packs', async (route) => {
    if (fail) return route.fulfill({ status: 500, json: { error: { code: 'internal', message: 'Something went wrong.' } } });
    await new Promise((resolve) => setTimeout(resolve, 500));
    return route.fulfill({ json: { packs: [] } });
  });
  await desk.goto('/admin');
  await expect(desk.getByTestId('error-state')).toBeVisible();
  fail = false;
  await desk.getByRole('button', { name: 'Try again' }).click();
  await expect(desk.getByText('Getting rule packs and data')).toBeVisible();
  await expect(desk.getByTestId('packs-empty')).toBeVisible();
  await desk.context().close();
});

// ---- The report ----

test('the report: Free points at the plans', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await seedScanned(page);
  await page.goto('/report');
  const locked = page.getByTestId('report-locked');
  await expect(locked).toContainText('part of a paid plan');
  await expect(locked.getByRole('link', { name: 'See the plans' })).toHaveAttribute('href', '/plan');
  await expect(page.getByTestId('report-print')).toHaveCount(0);
  await page.goto('/');
  await expect(page.getByTestId('home-report')).toHaveCount(0);
});

test('the report: real data, every required line, a truthful print button, and a real two-page print', async ({ page }) => {
  test.setTimeout(120_000);
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  const overview = await apiJson<{ score: { kind: string; value: number }; coverage: { counted: number; total: number }; notLegalAdvice: string; methodVersion: string; scannedAt: string; rulePacks: { jurisdiction: string; version: string; status: string }[]; areas: unknown[] }>(page, 'get', `/v1/companies/${companyId}/overview?scope=company`);

  await page.addInitScript(() => {
    (window as unknown as { printed: number }).printed = 0;
    window.print = () => {
      (window as unknown as { printed: number }).printed += 1;
    };
  });
  await page.goto('/');
  await page.getByTestId('home-report').click();
  await page.waitForURL('**/report');

  const report = page.getByTestId('report');
  await expect(page.getByTestId('report-score')).toHaveText(String(overview.score.value));
  await expect(page.getByTestId('report-date')).toHaveText(new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(overview.scannedAt)));
  await expect(page.getByTestId('report-coverage')).toContainText(`${overview.coverage.counted} of ${overview.coverage.total}`);
  await expect(page.getByTestId('report-not-advice')).toHaveText(overview.notLegalAdvice);
  await expect(report).toContainText('not legal advice');
  await expect(page.getByTestId('sample-note')).toContainText('made-up records');
  await expect(page.getByTestId('report-method')).toHaveText(`Version ${overview.methodVersion}`);
  for (const pack of overview.rulePacks) {
    await expect(page.getByTestId('report-packs')).toContainText(`${pack.jurisdiction} ${pack.version}, ${pack.status === 'approved' ? 'reviewed' : 'draft'}`);
  }
  await expect(page.getByTestId('report-area')).toHaveCount(overview.areas.length);
  await expect(page.getByTestId('report-fix')).not.toHaveCount(0);
  expect(await page.getByTestId('report-fix').count()).toBeLessThanOrEqual(5);

  const button = page.getByTestId('report-print');
  await expect(button).toHaveText('Print or save as PDF');
  await expect(page.getByTestId('report-tools')).toContainText("browser's print window");
  await expect(page.getByTestId('report-tools')).not.toContainText(/download/i);
  await button.click();
  expect(await page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(1);

  // On paper, the buttons go and the report stays.
  await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  await expect(page.getByTestId('report-tools')).toBeHidden();
  await expect(page.getByTestId('report-page-2')).toBeVisible();
  // Nothing is cut off: each sheet fits on its A4 page, footer and all.
  await page.setViewportSize({ width: 794, height: 1123 });
  for (const id of ['report-page-1', 'report-page-2']) {
    const box = await page.getByTestId(id).boundingBox();
    expect(box?.height ?? 9999, `${id} fits an A4 page`).toBeLessThanOrEqual(1123);
    await expect(page.getByTestId(id).locator('.rp-foot')).toBeVisible();
  }
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  expect(pdf.subarray(0, 4).toString()).toBe('%PDF');
  const pages = pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length ?? 0;
  expect(pages, 'the two sheets print on two pages').toBe(2);
});

test('the report: a group names its companies, and no date on it reads "today"', async ({ page }) => {
  test.setTimeout(120_000);
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  const child = await apiJson<{ id: string }>(page, 'post', '/v1/companies', { legalName: 'Kestrel Pay Nigeria Ltd', incorporationCountry: 'NG', registrationNumber: '1849302', parentCompanyId: companyId });
  const scan = await apiJson<{ id: string }>(page, 'post', `/v1/companies/${child.id}/scans`);
  await expect.poll(async () => (await apiJson<{ status: string }>(page, 'get', `/v1/scans/${scan.id}`)).status, { timeout: 60_000 }).toMatch(/completed|partial/);

  await page.goto('/report');
  await expect(page.getByTestId('report-page-1')).toContainText('health report, with its companies in Nigeria');
  const how = page.getByTestId('report-how');
  await expect(how).toHaveCount(2);
  await expect(how.nth(1)).toContainText('Kestrel Pay Nigeria Ltd');
  await expect(page.getByTestId('report')).not.toContainText(/\btoday\b/);
});

test('the report: an approved pack says that, and errors can be retried', async ({ page, watch }) => {
  test.setTimeout(120_000);
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  watch.allow(/Failed to load resource/);
  let fail = true;
  // The app's own session reads the overview too, so the failure is on what only the report asks for.
  await page.route(`**/v1/companies/${companyId}/issues**`, async (route) => {
    if (fail) return route.fulfill({ status: 500, json: { error: { code: 'internal', message: 'Something went wrong.' } } });
    await new Promise((resolve) => setTimeout(resolve, 500));
    return route.continue();
  });
  await page.route(`**/v1/companies/${companyId}/overview**`, async (route) => {
    const response = await route.fetch();
    const body = (await response.json()) as { rulePacks: { status: string }[] };
    return route.fulfill({ json: { ...body, rulePacks: body.rulePacks.map((pack) => ({ ...pack, status: 'approved' })) } });
  });
  await page.goto('/report');
  await expect(page.getByTestId('error-state')).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Getting your report')).toBeVisible();
  await expect(page.getByTestId('report-packs')).toContainText('reviewed');
  await expect(page.getByTestId('report-packs')).not.toContainText('draft');
});

// ---- No dead links, for staff too ----

test('no dead links on the desk, for staff', async ({ browser }) => {
  test.setTimeout(240_000);
  const { page: desk } = await staffPage(browser, 'admin');
  const seen = new Set<string>();
  for (const path of ['/review/work', '/admin']) {
    await desk.goto(path);
    await expect(desk.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(desk.getByRole('navigation', { name: 'Review desk' })).toBeVisible();
    for (const href of await desk.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))) seen.add(href.split('#')[0] ?? href);
  }
  for (const route of ['/review/work', '/admin']) expect(seen).toContain(route);
  for (const href of seen) {
    if (!href || href.startsWith('/v1/')) continue;
    const response = await desk.request.get(`${WEB_URL}${href}`);
    expect(response.status(), `${href} opens`).toBeLessThan(400);
  }
  await desk.context().close();
});

// ---- Accessibility and phones ----

for (const theme of ['light', 'dark'] as const) {
  test(`the desk, admin and report pass axe and fit a phone, in ${theme}`, async ({ page, browser, watch }) => {
    test.setTimeout(420_000);
    watch.allow(/status of 403/);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await signIn(page);
    await seedPlain(page);

    await page.goto('/review/work');
    await expect(page.getByTestId('staff-refused')).toBeVisible();
    await checkScreen(page);

    await page.goto('/report');
    await expect(page.getByTestId('report-page-2')).toBeVisible();
    await checkScreen(page);

    const { page: desk } = await staffPage(browser, 'admin', theme);
    await desk.goto('/review/work');
    await expect(desk.getByTestId('staff-work')).toBeVisible();
    await checkScreen(desk);

    await desk.goto('/admin');
    await expect(desk.getByTestId('admin')).toBeVisible();
    await checkScreen(desk);
    const pack = desk.getByTestId('admin-pack').first();
    await pack.locator('summary').click();
    const approve = pack.getByRole('button', { name: 'Approve this pack' });
    if (await approve.isVisible()) await approve.click();
    await desk.getByTestId('admin-user').first().locator('summary').click();
    await checkScreen(desk);
    await desk.context().close();
  });
}

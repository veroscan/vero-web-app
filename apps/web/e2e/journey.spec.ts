import { answerQuestions, calm, expect, linkFromOutbox, requestLink, seedAnswered, seedScanned, signIn, sql, test, turnOffRelated, uniqueEmail } from './support/helpers';

test('a new person goes from the magic link to Home, through a full fixture scan', async ({ page }) => {
  await calm(page);
  const email = uniqueEmail('journey');
  await page.goto('/sign-in');
  await expect(page.getByRole('button', { name: /google/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /google/i })).toHaveCount(0);
  await requestLink(page, email);
  await page.goto(await linkFromOutbox(email));

  await page.waitForURL('**/onboarding/company');
  await expect(page.getByRole('heading', { name: 'Where is your company registered?' })).toBeVisible();
  await page.getByRole('radio', { name: /United Kingdom/ }).click();
  await page.getByLabel('Company name').fill('Kestrel Pay UK Ltd');
  await expect(page.getByTestId('sample-note')).toBeVisible();
  await page.getByRole('link', { name: /Kestrel Pay UK Ltd/ }).click();

  await page.waitForURL('**/onboarding/confirm**');
  await expect(page.getByRole('heading', { name: 'Is this your company?' })).toBeVisible();
  await expect(page.getByText('14839221')).toBeVisible();
  await turnOffRelated(page);
  await page.getByRole('button', { name: "Yes, that's us" }).click();

  await page.waitForURL('**/onboarding/questions**');
  // Conditional logic from the API: answering yes to employees shows what follows from it.
  const seen = await answerQuestions(page);
  expect(seen).not.toContain('jurisdiction');
  expect(seen).toContain('has_employees');
  expect(seen).toContain('employee_countries');

  await page.waitForURL('**/onboarding/scanning');
  await expect(page.getByTestId('scan-row').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Scan finished' })).toBeVisible();
  await expect(page.getByTestId('scan-count')).toContainText(/\d+ of \d+ checks done/);
  await expect(page.getByTestId('sample-note')).toBeVisible();
  // The email the scanning screen promised has really gone out.
  await expect.poll(async () => (await sql('SELECT 1 FROM outbox WHERE to_email = $1 AND template = $2', [email, 'scan-result'])).length).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'See your result' }).click();

  await page.waitForURL('**/first-result');
  await expect(page.getByTestId('first-score')).toHaveAttribute('aria-label', /^\d+ to \d+ out of 100$/);
  await expect(page.getByTestId('top-issue')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: "Why it's a range" })).toBeVisible();
  await page.getByRole('link', { name: 'Look around first' }).click();

  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.getByTestId('home-score')).toContainText('–');
  await expect(page.getByTestId('area-row')).toHaveCount(6);
  await expect(page.getByTestId('next-action')).toBeVisible();
});

test('answering no hides the questions that depend on it', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await page.getByRole('radio', { name: /United Kingdom/ }).click();
  await page.getByLabel('Company name').fill('Kestrel Pay UK Ltd');
  await page.getByRole('link', { name: /Kestrel Pay UK Ltd/ }).click();
  await turnOffRelated(page);
  await page.getByRole('button', { name: "Yes, that's us" }).click();
  const seen = await answerQuestions(page, (id) => (id === 'has_employees' ? 2 : 1));
  expect(seen).toContain('has_employees');
  expect(seen).not.toContain('employee_countries');
  expect(seen).not.toContain('last_hire_on');
});

test('a related company is only asked what it has not been told, and answers stick to it', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const root = await seedAnswered(page, 'Kestrel Pay UK Ltd');
  const origin = new URL(page.url()).origin;
  const made = await page.request.post(`/v1/companies/${root.id}/related`, { headers: { origin }, data: { legalName: 'Kestrel Pay Nigeria Ltd', incorporationCountry: 'NG' } });
  const child = (await made.json()) as { id: string };

  await page.goto(`/onboarding/questions?company=${child.id}`);
  await expect(page.getByText('Kestrel Pay Nigeria Ltd')).toBeVisible();
  const seen = await answerQuestions(page);
  // has_employees was answered for the main company, so it isn't asked again. Nigeria-only ones are.
  expect(seen).not.toContain('has_employees');
  expect(seen).toContain('ng_small_company');
  await page.waitForURL('**/onboarding/scanning');

  const reply = (await (await page.request.get(`/v1/companies/${child.id}/questionnaire`)).json()) as { questions: { fields: { id: string; value: unknown }[] }[] };
  const fields = reply.questions.flatMap((question) => question.fields);
  expect(fields.find((field) => field.id === 'ng_small_company')?.value).toBe(true);
  expect(fields.find((field) => field.id === 'has_employees')?.value).toBe(true);
});

test('filters, ticks and the projected score use real numbers from the API', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  await page.goto('/issues');

  const row = page.getByTestId('issue-row').first();
  await expect(row).toBeVisible();
  const before = Number((await page.getByTestId('issues-score').innerText()).trim());
  const points = Number(/\+(\d+)/.exec(await row.locator('.pts').innerText())?.[1]);
  expect(before).toBeGreaterThan(0);

  const planbar = page.getByTestId('planbar');
  await expect(planbar).not.toHaveClass(/\bon\b/);
  await row.locator('.tick').check();
  await expect(planbar).toHaveClass(/\bon\b/);
  await expect(planbar).toContainText('1 fix');

  // What the screen shows is what the API works out, not a sum of our own.
  const ruleKey = decodeURIComponent((await row.locator('a').getAttribute('href'))?.split('/').pop() ?? '');
  const reply = await page.request.post(`/v1/companies/${companyId}/projection`, { headers: { origin: new URL(page.url()).origin }, data: { ruleKeys: [ruleKey] } });
  const { projected } = (await reply.json()) as { projected: number };
  await expect(page.getByTestId('plan-score')).toHaveText(String(projected));
  await expect(page.getByTestId('issues-score')).toHaveText(String(projected));
  expect(Math.abs(projected - (before + points))).toBeLessThanOrEqual(1);

  await row.locator('.tick').uncheck();
  await expect(planbar).not.toHaveClass(/\bon\b/);
  await expect(page.getByTestId('issues-score')).toHaveText(String(before));

});

test('the country filter narrows a group of companies', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId, organisationId } = await seedScanned(page, { plan: 'growth' });
  const related = await page.request.post(`/v1/companies/${companyId}/related`, { headers: { origin: new URL(page.url()).origin }, data: { legalName: 'Kestrel Pay Nigeria Ltd', incorporationCountry: 'NG', registrationNumber: `${Date.now()}`.slice(-7) } });
  const child = (await related.json()) as { id: string };
  const scan = await page.request.post(`/v1/companies/${child.id}/scans`, { headers: { origin: new URL(page.url()).origin } });
  expect(scan.status()).toBe(202);
  await expect.poll(async () => (await sql<{ status: string }>('SELECT status FROM scan WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1', [child.id]))[0]?.status).toMatch(/completed|partial/);
  expect(organisationId).toBeTruthy();

  await page.goto('/issues');
  const filters = page.getByRole('group', { name: 'Filter by country' });
  await expect(filters).toBeVisible();
  const allCount = await page.getByTestId('issue-row').count();
  await filters.getByRole('button', { name: 'Nigeria' }).click();
  await expect(filters.getByRole('button', { name: 'Nigeria' })).toHaveAttribute('aria-pressed', 'true');
  const nigeria = await page.getByTestId('issue-row').count();
  expect(nigeria).toBeGreaterThan(0);
  expect(nigeria).toBeLessThan(allCount);
  for (const line of await page.getByTestId('issue-row').locator('.row-s').allInnerTexts()) expect(line).toContain('Nigeria');
  await expect(page.getByTestId('issue-count')).toContainText(String(nigeria));
  await filters.getByRole('button', { name: 'All' }).click();
  await expect(page.getByTestId('issue-row')).toHaveCount(allCount);
});

test('one issue reads in plain words, and verify items are honest', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  await page.goto('/issues');
  await page.getByTestId('issue-row').first().locator('a').click();
  await page.waitForURL('**/issues/**');
  await expect(page.getByRole('heading', { name: "What's missing" })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why it matters' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What happens if you leave it' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How we know' })).toBeVisible();
  await expect(page.getByTestId('fix-projection')).toContainText(/from \d+ to about \d+/);
  await expect(page.locator('body')).not.toContainText(/Tier \d/);

  await page.goto('/issues');
  const toCheck = page.getByTestId('group-to-check');
  await expect(toCheck.getByRole('heading', { name: "We haven't seen this yet" })).toBeVisible();
  await toCheck.locator('summary').first().click();
  const check = toCheck.getByTestId('area-check').first();
  await check.locator('summary').click();
  await check.getByRole('link', { name: 'See the details' }).click();
  await expect(page.getByTestId('not-seen')).toContainText("We haven't seen this yet.");
  expect(companyId).toBeTruthy();
});

test('Home: score, one next action with calculated points, six areas, and the bell', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  await page.goto('/');
  const overview = (await (await page.request.get(`/v1/companies/${companyId}/overview`)).json()) as { score: { value: number }; nextAction: { points: number } };
  await expect(page.getByTestId('home-score')).toHaveText(String(overview.score.value));
  await expect(page.getByTestId('next-points')).toContainText(String(overview.nextAction.points));
  await expect(page.locator('[data-v3d="fill"]').first()).toHaveAttribute('data-value', String(overview.score.value));
  await expect(page.locator('.v3d-fallback svg').first()).toBeVisible();

  const rows = page.getByTestId('area-row');
  await expect(rows).toHaveCount(6);
  await rows.first().locator('summary').click();
  await expect(rows.first()).toHaveAttribute('open', '');
  await expect(rows.first().getByRole('link', { name: 'See this whole area' })).toBeVisible();
  await rows.nth(1).locator('summary').click();
  await expect(rows.first()).not.toHaveAttribute('open', '');

  await expect(page.getByTestId('bell-count')).toHaveText(/^\d+$/);
  await page.getByTestId('bell').click();
  await page.waitForURL('**/notifications');
  await expect(page.getByTestId('notification').first()).toBeVisible();
  await page.getByRole('button', { name: 'Mark all as read' }).click();
  await expect(page.getByTestId('unread-line')).toHaveText("You're all caught up.");
  await expect(page.getByTestId('bell-count')).toHaveCount(0);
});

test('one area shows what to fix, what passed and what is unchecked', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await seedScanned(page, { plan: 'growth' });
  await page.goto('/');
  const row = page.getByTestId('area-row').first();
  await row.locator('summary').click();
  await row.getByRole('link', { name: 'See this whole area' }).click();
  await page.waitForURL('**/areas/*');
  await expect(page.getByRole('heading', { name: 'To fix' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'In good shape' })).toBeVisible();
  await expect(page.getByTestId('area-score')).toHaveText(/^\d+$/);

  // A check that passed must not be named with the problem it didn't find.
  await page.goto('/areas/1');
  const passed = page.getByTestId('area-check').filter({ hasText: 'Passed' });
  await expect(passed.first()).toBeVisible();
  for (const name of await passed.locator('.row-t').allInnerTexts()) expect(name).not.toMatch(/overdue|can't find|has no |doesn't show|problem with|has an outstanding/i);
  await passed.first().locator('summary').click();
  await passed.first().getByRole('link', { name: 'See the details' }).click();
  await expect(page.getByTestId('issue-chip')).toHaveText('In good shape');
  await expect(page.getByRole('heading', { name: "What's missing" })).toHaveCount(0);
});

test('Ctrl+K searches for real, and a route that does not exist says so', async ({ page, watch }) => {
  await calm(page);
  await signIn(page);
  await seedScanned(page, { plan: 'growth' });
  await page.goto('/');
  await expect(page.getByTestId('home-score')).toBeVisible();
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Search' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox').fill('zzzz-nothing');
  await expect(dialog).toContainText('Nothing matches that.');
  const issues = (await (await page.request.get('/v1/search?q=confirmation')).json()) as { issues: { title: string }[]; deadlines: { title: string }[] };
  await dialog.getByRole('textbox').fill('confirmation');
  const first = issues.issues[0]?.title ?? issues.deadlines[0]?.title ?? '';
  expect(first).not.toBe('');
  await expect(dialog).toContainText(first);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  watch.allow(/status of 404/);
  await page.goto('/there-is-nothing-here');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('coming-next')).toHaveCount(0);
});

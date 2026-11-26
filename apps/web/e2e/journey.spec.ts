import { answerQuestions, calm, chooseCountry, expect, linkFromOutbox, requestLink, seedAnswered, seedScanned, signIn, sql, test, turnOffRelated, uniqueEmail } from './support/helpers';

test('a new person goes from the magic link to Home, through a full fixture scan', async ({ page }) => {
  await calm(page);
  const email = uniqueEmail('journey');
  await page.goto('/sign-in');
  await expect(page.getByRole('button', { name: /google/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /google/i })).toHaveCount(0);
  await requestLink(page, email);
  await page.goto(await linkFromOutbox(email));

  await page.waitForURL('**/onboarding/company');
  await expect(page.getByRole('heading', { name: 'Find your company' })).toBeVisible();
  await chooseCountry(page, 'United Kingdom');
  await page.getByLabel('Company name').fill('Kestrel Pay UK Ltd');
  await expect(page.getByTestId('sample-note')).toBeVisible();
  await page.getByRole('link', { name: /Kestrel Pay UK Ltd/ }).click();

  await page.waitForURL('**/onboarding/confirm**');
  await expect(page.getByRole('heading', { name: 'Is this the right company?' })).toBeVisible();
  await expect(page.getByText('14839221').first()).toBeVisible();
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(/is scanned$/);
  await expect(page.getByTestId('scan-count')).toHaveText(/^(\d+)\s*of\s*\1 steps? done$/);
  await expect(page.getByTestId('sample-note')).toBeVisible();
  // The email the scanning screen promised has really gone out.
  await expect.poll(async () => (await sql('SELECT 1 FROM outbox WHERE to_email = $1 AND template = $2', [email, 'scan-result'])).length).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'See your result' }).click();

  await page.waitForURL('**/first-result');
  await expect(page.getByTestId('first-score')).toHaveAttribute('aria-label', /^\d+ to \d+ out of 100$/);
  await expect(page.getByTestId('top-issue')).toHaveCount(3);
  // On Free the score is a range, and the screen says so.
  await expect(page.getByText('A range on this plan.')).toBeVisible();
  await page.getByRole('link', { name: 'Go to overview' }).click();

  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.getByTestId('home-score')).toHaveAttribute('aria-label', /^\d+ to \d+$/);
  await expect(page.getByTestId('area-row')).toHaveCount(6);
  await expect(page.getByTestId('next-action')).toBeVisible();
});

test('answering no hides the questions that depend on it', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await chooseCountry(page, 'United Kingdom');
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('A few questions about Kestrel Pay Nigeria Ltd');
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

test('the points on offer and the projected score use real numbers from the API', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  // What the screen shows is what the API works out, not a sum of our own.
  const projectionReply = page.waitForResponse((response) => response.url().includes(`/v1/companies/${companyId}/projection`) && response.request().method() === 'POST');
  await page.goto('/issues');

  const overview = (await (await page.request.get(`/v1/companies/${companyId}/overview`)).json()) as { score: { value: number } };
  const before = overview.score.value;
  expect(before).toBeGreaterThan(0);
  await expect(page.getByTestId('issues-score')).toHaveText(String(before));

  const { projected } = (await (await projectionReply).json()) as { projected: number };
  expect(projected).toBeGreaterThanOrEqual(before);
  await expect(page.getByText(`and the score goes from ${before} to ${projected}.`, { exact: false })).toBeVisible();

  // One finding's points, in the drawer, are the API's points for it.
  const row = page.getByTestId('issue-row').filter({ hasText: /\+\d+/ }).first();
  await expect(row).toBeVisible();
  const points = Number(/\+(\d+)/.exec(await row.innerText())?.[1]);
  expect(points).toBeGreaterThan(0);
  await row.click();
  const drawer = page.getByTestId('finding-drawer');
  await expect(drawer).toHaveAttribute('aria-hidden', 'false');
  await expect(drawer).toContainText('Clearing this adds');
  await expect(drawer).toContainText(`+${points}`);
  const href = (await drawer.getByRole('link', { name: 'Open full page' }).getAttribute('href')) ?? '';
  const ruleKey = decodeURIComponent(href.split('/').pop() ?? '');
  const single = await page.request.post(`/v1/companies/${companyId}/projection`, { headers: { origin: new URL(page.url()).origin }, data: { ruleKeys: [ruleKey] } });
  const one = (await single.json()) as { projected: number };
  expect(Math.abs(one.projected - (before + points))).toBeLessThanOrEqual(1);
  await drawer.getByRole('button', { name: 'Close' }).click();
  await expect(drawer).toHaveAttribute('aria-hidden', 'true');
});

test('the search narrows a group of companies to one of them', async ({ page }) => {
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
  // The list covers the whole group: find a tab with findings from both companies.
  await expect(page.getByTestId('issue-row').first()).toBeVisible();
  const rows = page.getByTestId('issue-row');
  let allCount = 0;
  for (const tab of await page.getByRole('tablist', { name: 'Filter findings' }).getByRole('tab').all()) {
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    allCount = await rows.count();
    const fromNigeria = await rows.filter({ hasText: 'Kestrel Pay Nigeria' }).count();
    if (fromNigeria > 0 && fromNigeria < allCount) break;
    allCount = 0;
  }
  expect(allCount, 'a tab lists findings from both companies').toBeGreaterThan(0);
  const search = page.getByRole('searchbox', { name: 'Search findings' });
  await search.fill('Kestrel Pay Nigeria');
  await expect.poll(async () => page.getByTestId('issue-row').count()).toBeLessThan(allCount);
  const nigeria = await page.getByTestId('issue-row').count();
  expect(nigeria).toBeGreaterThan(0);
  for (const line of await page.getByTestId('issue-row').locator('small').allInnerTexts()) expect(line).toContain('Kestrel Pay Nigeria');
  await search.fill('');
  await expect(page.getByTestId('issue-row')).toHaveCount(allCount);
});

test('one issue reads in plain words, and verify items are honest', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  await page.goto('/issues');
  // A finding that moves the score, so its page can say by how much.
  await page.getByTestId('issue-row').filter({ hasText: /\+\d+/ }).first().click();
  await page.getByTestId('finding-drawer').getByRole('link', { name: 'Open full page' }).click();
  await page.waitForURL('**/issues/**');
  await expect(page.getByRole('heading', { name: 'What we found' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why it matters' })).toBeVisible();
  await expect(page.getByText(/^If it's left: /)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Where we looked' })).toBeVisible();
  await expect(page.getByTestId('fix-projection')).toContainText(/Adds \d+ points?|Lifts the urgent cap/);
  await expect(page.locator('body')).not.toContainText(/Tier \d/);

  await page.goto('/issues');
  const toCheck = page.getByTestId('group-to-check');
  await expect(toCheck).toContainText('Not seen yet');
  await toCheck.click();
  await expect(toCheck).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('group-unseen')).toBeVisible();
  await page.getByTestId('issue-row').first().click();
  await expect(page.getByTestId('finding-drawer')).toContainText('Not seen yet');
  await page.getByTestId('finding-drawer').getByRole('link', { name: 'Open full page' }).click();
  await page.waitForURL('**/issues/**');
  await expect(page.getByTestId('not-seen')).toContainText("Vero hasn't seen this yet.");
  expect(companyId).toBeTruthy();
});

test('Home: score, one next action with calculated points, six areas, and the bell', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  await page.goto('/');
  const overview = (await (await page.request.get(`/v1/companies/${companyId}/overview`)).json()) as { score: { value: number }; nextAction: { points: number } };
  await expect(page.getByTestId('home-score')).toHaveText(String(overview.score.value));
  await expect(page.getByTestId('next-points')).toHaveText(`this one fix adds ${overview.nextAction.points} ${overview.nextAction.points === 1 ? 'point' : 'points'}`);

  // Six areas, each one a row that opens that area.
  const rows = page.getByTestId('area-row');
  await expect(rows).toHaveCount(6);
  await rows.first().click();
  await page.waitForURL('**/areas/*');
  await expect(page.getByTestId('area-score')).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId('home-score')).toBeVisible();

  await expect(page.getByTestId('bell-count')).toBeVisible();
  await expect(page.getByTestId('bell')).toHaveAttribute('aria-label', /^What's new, \d+ unread$/);
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
  await page.getByTestId('area-row').first().click();
  await page.waitForURL('**/areas/*');
  await expect(page.getByRole('heading', { name: 'Checks in this area' })).toBeVisible();
  await expect(page.getByTestId('area-score')).toHaveText(/^\d+$/);

  // One table holds what to fix, what nobody has seen yet, and what passed.
  await page.goto('/areas/1');
  await expect(page.getByTestId('area-fix').first()).toBeVisible();
  const unseen = page.getByTestId('area-check').filter({ hasText: 'Not seen yet' }).first();
  // A table row can't carry aria-expanded, so the row's own button says whether it is open.
  await expect(unseen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  await unseen.click();
  await expect(unseen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('link', { name: 'See the details' })).toBeVisible();

  // A check that passed must not be named with the problem it didn't find.
  const passed = page.getByTestId('area-check').filter({ hasText: 'In good shape' });
  await expect(passed.first()).toBeVisible();
  for (const name of await passed.locator('b').allInnerTexts()) expect(name).not.toMatch(/overdue|can't find|has no |doesn't show|problem with|has an outstanding/i);
  await passed.first().click();
  await page.waitForURL('**/issues/**');
  await expect(page.getByTestId('issue-chip')).toContainText('Cleared');
  await expect(page.getByRole('heading', { name: 'What we found' })).toHaveCount(0);
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
  await dialog.getByRole('combobox').fill('zzzz-nothing');
  await expect(dialog).toContainText('Nothing matches that.');
  const issues = (await (await page.request.get('/v1/search?q=confirmation')).json()) as { issues: { title: string }[]; deadlines: { title: string }[] };
  await dialog.getByRole('combobox').fill('confirmation');
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

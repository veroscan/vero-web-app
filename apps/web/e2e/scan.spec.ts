import { calm, expect, seedAnswered, signIn, sql, test } from './support/helpers';

test('when every source is down, the scan says so and the person can enter details themselves', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await page.getByRole('radio', { name: /United Kingdom/ }).click();
  // In fixture mode, a name with "broken" in it makes every source fail.
  await page.getByLabel('Company name').fill('Broken Widgets Ltd');
  await expect(page.getByTestId('search-source-down')).toBeVisible();
  await page.getByRole('link', { name: 'Enter the details yourself' }).click();

  await page.waitForURL('**/onboarding/confirm**');
  await expect(page.getByRole('heading', { name: 'Tell us about your company' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL('**/onboarding/questions**');

  await page.goto('/onboarding/scanning');
  const partial = page.getByTestId('scan-partial');
  await expect(partial).toBeVisible();
  await expect(partial.getByRole('heading', { level: 1 })).toContainText(/^0 of \d+ checks are done$/);
  await expect(partial).toContainText("won't count for or against your score");
  await expect(partial.locator('.st').first()).toHaveText('Retrying');
  await partial.getByRole('link', { name: 'See your result' }).click();

  await page.waitForURL('**/first-result');
  await expect(page.getByTestId('sources-down')).toBeVisible();
});

test('when one source is down, the rest of the result still stands', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const company = await seedAnswered(page, 'Kestrel Pay UK Ltd');
  const start = await page.request.post(`/v1/companies/${company.id}/scans`, { headers: { origin: new URL(page.url()).origin } });
  const scan = (await start.json()) as { id: string };
  await expect.poll(async () => (await sql<{ status: string }>('SELECT status FROM scan WHERE id = $1', [scan.id]))[0]?.status).toMatch(/completed|partial/);
  await sql(`UPDATE source_result SET status = 'error' WHERE scan_id = $1 AND connector_id = 'uk.ico_register'`, [scan.id]);
  await sql(`UPDATE scan SET status = 'partial' WHERE id = $1`, [scan.id]);

  await page.goto('/onboarding/scanning');
  const partial = page.getByTestId('scan-partial');
  await expect(partial.getByRole('heading', { level: 1 })).toHaveText(/^\d+ of \d+ checks are done$/);
  await expect(partial).toContainText('ICO register');
  await expect(partial).toContainText("We'll email you when it updates.");
  await expect(partial).toContainText('Not responding');
  await expect(partial.getByRole('listitem')).toHaveCount(1);
});

test('a company the register can\'t find is never called non-existent', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await page.getByRole('radio', { name: /United Kingdom/ }).click();
  await page.getByLabel('Company name').fill('Ghost Trading Ltd');
  await expect(page.getByTestId('search-not-found')).toContainText("doesn't prove it isn't registered");
  await page.getByTestId('search-not-found').getByRole('link', { name: 'Search another way' }).click();

  await page.waitForURL('**/onboarding/not-found**');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ghost Trading Ltd');
  await expect(page.locator('main')).toContainText("doesn't mean your company isn't registered");

  // A number in the wrong shape gets the plain message before a search is spent.
  await page.getByLabel(/Try your company number/).fill('123');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('UK company numbers have 8 characters')).toBeVisible();
  await expect(page.getByRole('link', { name: /It's registered in another country/ })).toBeVisible();

  await page.getByRole('button', { name: /We haven't registered yet/ }).click();
  await page.waitForURL('**/onboarding/questions**');
  await expect(page.locator('[data-step]')).toBeVisible();
});

test('Delaware shows the registered agent the register gave', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await page.getByRole('radio', { name: /Delaware/ }).click();
  await page.getByLabel('Company name').fill('Kestrel Pay Inc.');
  await page.getByRole('link', { name: /Kestrel Pay Inc\./ }).click();
  await page.waitForURL('**/onboarding/confirm**');
  await expect(page.getByText('Registered agent')).toBeVisible();
  await expect(page.getByText('Northwood Agents LLC')).toBeVisible();
  await expect(page.getByTestId('sample-note')).toBeVisible();
});

test('asking a person to look it up sends a real request', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await page.goto('/onboarding/not-found?country=GB&q=Ghost%20Trading%20Ltd');
  await page.getByRole('button', { name: /I'm sure it's registered/ }).click();
  const form = page.getByTestId('lookup-form');
  await expect(form.getByLabel('Company name')).toHaveValue('Ghost Trading Ltd');
  await form.getByLabel(/Company number/).fill('12345678');
  await form.getByRole('button', { name: 'Ask a person to look it up' }).click();
  const list = page.getByTestId('lookup-requests');
  await expect(list).toContainText('Ghost Trading Ltd');
  await expect(list).toContainText('Waiting for a person');
  const saved = (await (await page.request.get('/v1/registry/lookup-requests')).json()) as { requests: { legalName: string; registrationNumber: string }[] };
  expect(saved.requests[0]).toMatchObject({ legalName: 'Ghost Trading Ltd', registrationNumber: '12345678' });
});

test('several possible matches are all offered', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await page.getByRole('radio', { name: /United Kingdom/ }).click();
  await page.getByLabel('Company name').fill('Twin Traders');
  await expect(page.getByRole('group', { name: 'Matches' }).getByRole('link')).toHaveCount(2);
});

import type { Page } from '@playwright/test';
import { calm, expect, expectAccessible, expectNoSideways, seedScanned, signIn, test } from './support/helpers';

/** Every screen with real data, once a company has been scanned on a paid plan. */
async function scannedScreens(page: Page, companyId: string): Promise<{ name: string; path: string; ready: () => Promise<void> }[]> {
  const list = (await (await page.request.get(`/v1/companies/${companyId}/issues`)).json()) as { issues: { ruleKey: string }[] };
  const rule = list.issues[0]?.ruleKey ?? '';
  return [
    { name: 'first result', path: '/first-result', ready: () => expect(page.getByTestId('top-issue').first()).toBeVisible() },
    { name: 'home', path: '/', ready: () => expect(page.getByTestId('home-score')).toBeVisible() },
    { name: 'all issues', path: '/issues', ready: () => expect(page.getByTestId('issue-row').first()).toBeVisible() },
    { name: 'one issue', path: `/issues/${companyId}/${encodeURIComponent(rule)}`, ready: () => expect(page.getByRole('heading', { name: 'Where we looked' })).toBeVisible() },
    { name: 'one area', path: '/areas/1', ready: () => expect(page.getByRole('heading', { name: 'Checks in this area' })).toBeVisible() },
    { name: 'notifications', path: '/notifications', ready: () => expect(page.getByTestId('notification').first()).toBeVisible() },
  ];
}

function onboardingScreens(page: Page): { name: string; path: string; ready: () => Promise<void> }[] {
  return [
    { name: 'home for a new user', path: '/', ready: () => expect(page.getByRole('link', { name: /Scan your company/ })).toBeVisible() },
    { name: 'find company', path: '/onboarding/company', ready: () => expect(page.getByLabel('Country of registration')).toBeVisible() },
    { name: 'not found', path: '/onboarding/not-found?country=GB&q=Ghost', ready: () => expect(page.getByRole('heading', { level: 1 })).toContainText('Ghost') },
    { name: 'confirm', path: '/onboarding/confirm?country=GB&name=Kestrel%20Pay%20UK%20Ltd&number=14839221&type=ltd&formed=2023-04-12&sample=1', ready: () => expect(page.getByRole('button', { name: "Yes, that's us" })).toBeVisible() },
  ];
}

for (const theme of ['light', 'dark'] as const) {
  test(`every screen passes axe and fits a phone, in ${theme}`, async ({ page }) => {
    test.setTimeout(420_000);
    await calm(page);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });

    await page.goto('/sign-in');
    await expect(page.getByLabel('Work email')).toBeVisible();
    await expectAccessible(page);

    await signIn(page);
    for (const screen of onboardingScreens(page)) {
      await test.step(screen.name, async () => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(screen.path);
        await screen.ready();
        await expectAccessible(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await expectNoSideways(page);
      });
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    const { companyId } = await seedScanned(page, { plan: 'growth' });
    await page.goto('/onboarding/questions');
    await expect(page.locator('[data-step]')).toBeVisible();
    await expectAccessible(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoSideways(page);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/onboarding/scanning');
    await expect(page.getByRole('link', { name: 'See your result' })).toBeVisible();
    await expectAccessible(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await expectNoSideways(page);

    for (const screen of await scannedScreens(page, companyId)) {
      await test.step(screen.name, async () => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(screen.path);
        await screen.ready();
        await expectAccessible(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await expectNoSideways(page);
      });
    }
  });
}

test('the theme follows the system first, then the saved choice, with no flash', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/sign-in');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: 'Switch between light and dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: 'Switch between light and dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // Set by the inline script in the first HTML, before any app code or stylesheet paints.
  const html = await (await page.request.get('/sign-in')).text();
  expect(html.indexOf('vero-theme')).toBeGreaterThan(-1);
  expect(html.indexOf('vero-theme')).toBeLessThan(html.indexOf('<body'));
  const painted = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  // The dark theme's own background (--bg in kit-dark.css), not the light one.
  expect(painted).toBe('rgb(1, 1, 42)');
});

test('empty states: a new person sees the welcome, toasts and nothing invented', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: "Let's see where your company stands." })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('Kestrel');
  await expect(page.locator('body')).not.toContainText('Amara');
  // Before the first scan the other screens are shut, and say when they open.
  const findings = page.getByRole('complementary', { name: 'Main' }).getByRole('link', { name: 'Findings' });
  await expect(findings).toHaveAttribute('aria-disabled', 'true');
  await expect(findings).toHaveAttribute('title', 'After your first scan');
  await expect(findings).toHaveAttribute('href', '/');

  await page.goto('/notifications');
  await expect(page.getByTestId('empty-state')).toContainText('Nothing here yet');
  await expect(page.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
});

test('the Free plan limits come from the API', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await seedScanned(page, { plan: 'free' });
  await page.goto('/issues');
  // A range on Free: no exact score to project from, and the screen says why.
  await expect(page.getByText('What clearing each finding is worth is part of a paid plan.')).toBeVisible();
  await expect(page.getByTestId('issues-score')).toHaveCount(0);
  await expect(page.getByTestId('issue-row')).toHaveCount(3);
  await expect(page.getByTestId('locked-count')).toContainText('on a paid plan');

  await page.goto('/');
  await expect(page.getByTestId('area-row').first()).toContainText('Paid plan');
  await page.goto('/areas/1');
  await expect(page.getByTestId('area-locked')).toContainText('part of a paid plan');
});

test('a server failure and a lost connection get the plain error state, and retry works', async ({ page, watch }) => {
  watch.allow(/status of 500|ERR_FAILED|Failed to fetch/);
  await calm(page);
  await signIn(page);
  await seedScanned(page, { plan: 'growth' });

  await page.route('**/v1/companies/*/issues**', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { code: 'internal_error', message: 'Something went wrong on our side. Please try again.' } }) }));
  await page.goto('/issues');
  await expect(page.getByTestId('error-state')).toContainText('Something went wrong on our side');
  await page.unroute('**/v1/companies/*/issues**');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByTestId('issue-row').first()).toBeVisible();

  await page.route('**/v1/companies/*/issues**', (route) => route.abort());
  await page.goto('/issues');
  await expect(page.getByTestId('error-state')).toContainText("We couldn't reach Vero");
});

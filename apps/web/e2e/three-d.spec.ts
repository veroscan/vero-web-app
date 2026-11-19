import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import type { Browser } from '@playwright/test';
import { REPO_ROOT, WEB_URL } from './support/env';
import { expect, linkFromOutbox, seedScanned, test, uniqueEmail } from './support/helpers';

const LAUNCHER = resolve(REPO_ROOT, '..', 'vero-build', 'studio', '3d', 'scripts', 'pw.cjs');

test('the fallback V is there when the 3D script is blocked', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.locator('[data-v3d="hero"] .v3d-fallback svg')).toBeVisible();
  await expect(page.locator('[data-v3d="hero"] canvas')).toHaveCount(0);
});

test('the 3D script only loads on a screen with a V', async ({ page }) => {
  await page.goto('/legal/terms');
  await expect(page.getByTestId('coming-next')).toBeVisible();
  await expect(page.locator('script[src="/vero-3d.js"]')).toHaveCount(0);
  await page.goto('/sign-in');
  await expect(page.locator('script[src="/vero-3d.js"]')).toHaveCount(1);
});

// Real GPU, through the launcher the 3D work uses. Everything else blocks the script.
test('live 3D appears on a real GPU, and the fill follows the real score', async ({ request: _request }) => {
  test.skip(!existsSync(LAUNCHER), 'The 3D launcher is outside this repo and is not here.');
  test.setTimeout(300_000);
  const { launch } = createRequire(import.meta.url)(LAUNCHER) as { launch: () => Promise<Browser> };
  const browser = await launch();
  try {
    const context = await browser.newContext({ baseURL: WEB_URL, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/sign-in');
    await expect(page.locator('[data-v3d="hero"].v3d-live canvas')).toBeVisible({ timeout: 120_000 });

    const email = uniqueEmail('gpu');
    await page.getByLabel('Work email').fill(email);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByTestId('check-email')).toBeVisible();
    await page.goto(await linkFromOutbox(email));
    await page.waitForURL((url) => !url.pathname.startsWith('/sign-in'));
    const { companyId } = await seedScanned(page, { plan: 'growth' });

    await page.goto('/');
    const overview = (await (await page.request.get(`/v1/companies/${companyId}/overview`)).json()) as { score: { value: number } };
    const gauge = page.locator('[data-v3d="fill"]').first();
    await expect(gauge).toHaveAttribute('data-value', String(overview.score.value));
    await expect(page.locator('[data-v3d="fill"].v3d-live canvas').first()).toBeVisible({ timeout: 120_000 });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

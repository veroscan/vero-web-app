import * as OTPAuth from 'otpauth';
import { calm, expect, linkFromOutbox, requestLink, seedScanned, signIn, sql, test, uniqueEmail } from './support/helpers';
import { WEB_URL } from './support/env';

test('a protected page sends you to sign in, and back to it afterwards', async ({ page }) => {
  await calm(page);
  const email = await signIn(page);
  await seedScanned(page, { plan: 'growth' });
  await page.goto('/');
  await page.getByRole('button', { name: /account menu/ }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.waitForURL('**/sign-in');

  await page.goto('/issues');
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fissues/);
  await requestLink(page, email);
  await page.goto(await linkFromOutbox(email));
  await page.waitForURL('**/issues');
  await expect(page.getByTestId('issue-count')).toBeVisible();
});

test('a new person asking for a deep page starts onboarding first', async ({ page }) => {
  await calm(page);
  const email = uniqueEmail('deep');
  await page.goto('/issues');
  await expect(page).toHaveURL(/next=%2Fissues/);
  await requestLink(page, email);
  await page.goto(await linkFromOutbox(email));
  await page.waitForURL('**/onboarding/company**');
  await expect(page.getByRole('heading', { name: 'Find your company' })).toBeVisible();
});

test('an expired link says so, and offers a new one', async ({ page, watch }) => {
  watch.allow(/status of 400/);
  await calm(page);
  const email = uniqueEmail('expired');
  await page.goto('/sign-in');
  await requestLink(page, email);
  const link = await linkFromOutbox(email);
  await sql(`UPDATE magic_link SET expires_at = now() - interval '1 minute' WHERE email = $1`, [email]);
  await page.goto(link);
  await expect(page.getByTestId('link-expired')).toContainText('This link has expired');
  await page.getByLabel('Work email').fill(email);
  await page.getByRole('button', { name: 'Send a new link' }).click();
  await expect(page.getByTestId('check-email')).toBeVisible();
  await page.goto(await linkFromOutbox(email));
  await page.waitForURL((url) => !url.pathname.startsWith('/sign-in'));
});

test('a used link says so in any browser, and a made-up one is not called used', async ({ page, browser, watch }) => {
  watch.allow(/status of 400/);
  await calm(page);
  const email = uniqueEmail('used');
  await page.goto('/sign-in');
  await requestLink(page, email);
  const link = await linkFromOutbox(email);
  await page.goto(link);
  await page.waitForURL((url) => !url.pathname.startsWith('/sign-in'));

  await page.goto(link);
  await expect(page.getByTestId('link-used')).toContainText('This link has already been used');

  // The API says which it was, so another browser knows too.
  const other = await browser.newContext();
  const elsewhere = await other.newPage();
  await elsewhere.goto(link);
  await expect(elsewhere.getByTestId('link-used')).toContainText('already been used');
  await other.close();

  await page.goto('/sign-in/verify?token=this-token-was-never-issued-by-anyone');
  await expect(page.getByTestId('link-invalid')).toContainText("This link isn't valid");
});

test('a revoked session goes back to sign in rather than showing an error', async ({ page }) => {
  await calm(page);
  const email = await signIn(page);
  await seedScanned(page, { plan: 'growth' });
  await page.goto('/');
  await expect(page.getByTestId('home-score')).toBeVisible();
  await sql(`UPDATE session SET revoked_at = now() WHERE user_id = (SELECT id FROM "user" WHERE email = $1)`, [email]);
  page.removeAllListeners('console');
  await page.goto('/issues');
  await page.waitForURL('**/sign-in**');
  await expect(page.getByRole('heading', { name: 'Sign in to Vero' })).toBeVisible();
});

test('two-step sign-in asks for the code when it is switched on', async ({ page, watch }) => {
  // A wrong code is refused on purpose, and a session waiting for its code is refused too.
  watch.allow(/status of 40[03]/);
  await calm(page);
  const email = await signIn(page);
  const headers = { origin: WEB_URL };
  const enrol = (await (await page.request.post('/v1/auth/mfa/totp/enrol', { headers })).json()) as { secret: string };
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(enrol.secret) });
  expect((await page.request.post('/v1/auth/mfa/totp/verify', { headers, data: { code: totp.generate() } })).ok()).toBe(true);
  // Leave the app first: signing out behind an open page makes its next background call a 401.
  await page.goto('about:blank');
  await page.request.post(`${WEB_URL}/v1/auth/logout`, { headers });

  await page.goto('/sign-in');
  await requestLink(page, email);
  await page.goto(await linkFromOutbox(email));
  await page.waitForURL('**/sign-in/two-step**');
  await page.getByLabel('6-digit code').fill('000000');
  await page.getByRole('button', { name: 'Continue' }).click();
  // Not getByRole('alert'): Next.js keeps its own route announcer on the page with that role.
  await expect(page.locator('#code-problem')).toContainText("That code didn't work");
  // The last code was used to switch it on, and a code only works once, so use the next one.
  await page.getByLabel('6-digit code').fill(totp.generate({ timestamp: Date.now() + 30_000 }));
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/sign-in'));
});

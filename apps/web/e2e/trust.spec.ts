import { createHmac } from 'node:crypto';
import type { Browser, Page } from '@playwright/test';
import { WEB_URL } from './support/env';
import { apiJson, calm, expect, expectAccessible, expectNoSideways, holdWithUrgentGaps, linkFromOutbox, requestLink, seedPlain, seedScanned, signIn, sql, test, uniqueEmail } from './support/helpers';

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

async function checkScreen(page: Page): Promise<void> {
  await expectAccessible(page);
  for (const width of [390, 375]) {
    await page.setViewportSize({ width, height: 844 });
    await expectNoSideways(page);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
}

/** Everything passes: the state the badge really asks for. */
async function makeEligible(seed: { organisationId: string; companyId: string; scanId: string }): Promise<void> {
  // Anything that re-scores in the background is waited for, so this covers its result too.
  await expect.poll(async () => (await sql(`SELECT 1 FROM scan WHERE company_id = $1 AND status IN ('queued', 'running')`, [seed.companyId])).length, { timeout: 60_000 }).toBe(0);
  for (const scan of await sql<{ id: string }>('SELECT id FROM scan WHERE company_id = $1', [seed.companyId])) await holdWithUrgentGaps(scan.id, []);
}

async function freshPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ baseURL: WEB_URL, reducedMotion: 'reduce' });
  return context.newPage();
}

function base32Decode(secret: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of secret.replace(/=+$/, '').toUpperCase()) bits += alphabet.indexOf(char).toString(2).padStart(5, '0');
  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) bytes.push(parseInt(bits.slice(index, index + 8), 2));
  return Buffer.from(bytes);
}

/** A standard authenticator's code. */
function totp(secret: string, offsetSteps = 0): string {
  const step = Math.floor(Date.now() / 30_000) + offsetSteps;
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = (digest[digest.length - 1] ?? 0) & 0xf;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0');
}

// ---- Badge ----

test('badge: Free shows the blocker as sent, hides numbers it may not show, and is never earned', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page);
  const status = await apiJson<{ blockers: string[] }>(page, 'get', `/v1/companies/${companyId}/badge`);

  await page.goto('/badge');
  const hero = page.getByTestId('badge-hero');
  await expect(hero).toHaveAttribute('data-earned', 'no');
  await expect(page.getByTestId('badge-state')).toContainText('Not earned yet');
  await expect(page.getByTestId('badge-state')).not.toContainText('Verified');
  await expect(page.getByTestId('badge-blocker')).toHaveText(status.blockers);
  await expect(page.locator('[data-testid="badge-requirement"][data-key="score"] .stw')).toHaveText('Shown on a paid plan');
  await expect(page.locator('[data-testid="badge-requirement"][data-key="coverage"] .stw')).toHaveText('Shown on a paid plan');
  await expect(page.getByTestId('badge-plan')).toHaveAttribute('href', '/plan');
  await expect(page.getByTestId('badge-issue')).toHaveCount(0);
  await expect(page.getByTestId('share-links')).toHaveCount(0);
});

test('badge: on a paid plan, every blocker as sent, with the real numbers and coverage', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  const status = await apiJson<{ blockers: string[]; requirements: { minScore: number; currentScore: number; minCoveragePercent: number; coverage: { counted: number; total: number }; openUrgent: number } }>(page, 'get', `/v1/companies/${companyId}/badge`);
  expect(status.blockers.length).toBeGreaterThan(0);

  await page.goto('/badge');
  await expect(page.getByTestId('badge-blocker')).toHaveText(status.blockers);
  const { requirements: need } = status;
  const row = (key: string) => page.locator(`[data-testid="badge-requirement"][data-key="${key}"]`);
  await expect(row('score')).toContainText(`Score of ${need.minScore} or more`);
  await expect(row('score').locator('.stw')).toHaveText(`You're at ${need.currentScore}`);
  await expect(row('coverage')).toContainText(`At least ${need.minCoveragePercent}% of the checks that apply counted`);
  await expect(row('coverage').locator('.stw')).toHaveText(`${need.coverage.counted} of ${need.coverage.total} counted`);
  await expect(row('urgent').locator('.stw')).toHaveText(need.openUrgent === 0 ? 'None open' : `${need.openUrgent} open`);
  await expect(page.getByTestId('badge-state')).toContainText('Not earned yet');
  await expect(page.getByTestId('badge-issue')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'See what to fix' })).toHaveAttribute('href', '/issues');
});

test('badge: eligible is not earned until issued, its link works once, and withdrawing ends it', async ({ page, browser }) => {
  test.setTimeout(150_000);
  await calm(page);
  await signIn(page);
  const seed = await seedPlain(page);
  await makeEligible(seed);

  await page.goto('/badge');
  const hero = page.getByTestId('badge-hero');
  await expect(page.getByTestId('badge-issue')).toBeVisible();
  await expect(hero).toHaveAttribute('data-earned', 'no');
  await expect(page.getByTestId('badge-state')).toContainText('Not earned yet');
  await expect(hero).toContainText("It isn't live until it's issued.");
  await expect(page.getByTestId('badge-blockers')).toHaveCount(0);

  await page.getByTestId('badge-issue').click();
  await expect(hero).toHaveAttribute('data-earned', 'yes');
  await expect(page.getByTestId('badge-state')).toContainText('Verified');
  const url = await page.getByTestId('badge-link').locator('input').inputValue();
  expect(url).toContain('/verified/');
  const status = await apiJson<{ badge: { active: boolean } | null }>(page, 'get', `/v1/companies/${seed.companyId}/badge`);
  expect(status.badge?.active).toBe(true);

  const stranger = await freshPage(browser);
  await stranger.goto(url);
  const verified = stranger.getByTestId('verified-badge');
  await expect(verified).toContainText('Plain Widgets Ltd');
  await expect(verified).toContainText('Checked by Vero');
  await expect(stranger.getByTestId('verified-not-advice')).not.toBeEmpty();
  await expect(stranger.getByRole('button', { name: /account menu/ })).toHaveCount(0);

  // It's only shown once, so a reload can't show it.
  await page.reload();
  await expect(page.getByTestId('badge-link')).toHaveCount(0);
  await expect(page.getByTestId('badge-link-gone')).toBeVisible();

  await page.getByTestId('badge-revoke').click();
  await page.getByTestId('badge-revoke-yes').click();
  await expect(hero).toHaveAttribute('data-earned', 'no');
  await expect(page.getByTestId('badge-ended')).toBeVisible();
  await stranger.reload();
  await expect(stranger.getByTestId('verified-gone')).toContainText("This badge isn't live");
  await stranger.context().close();
});

test('badge: someone without the right role can look, but not issue or share', async ({ page }) => {
  test.setTimeout(120_000);
  await calm(page);
  await signIn(page);
  const seed = await seedPlain(page);
  await makeEligible(seed);
  await sql(`UPDATE membership SET role = 'member' WHERE organisation_id = $1`, [seed.organisationId]);

  await page.goto('/badge');
  await expect(page.getByTestId('badge-no-permission')).toContainText('Only an owner or admin');
  await expect(page.getByTestId('badge-issue')).toHaveCount(0);
  await expect(page.getByTestId('share-no-permission')).toBeVisible();
  await expect(page.getByTestId('share-links')).toHaveCount(0);
});

test('badge: an error with a retry', async ({ page, watch }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page);
  watch.allow(/Failed to load resource/);
  let fail = true;
  await page.route(`**/v1/companies/${companyId}/badge`, async (route) => {
    if (fail) return route.fulfill({ status: 500, json: { error: { code: 'internal', message: 'Something went wrong.' } } });
    await new Promise((resolve) => setTimeout(resolve, 500));
    return route.continue();
  });
  await page.goto('/badge');
  await expect(page.getByTestId('error-state')).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Getting your badge')).toBeVisible();
  await expect(page.getByTestId('badge-hero')).toBeVisible();
});

// ---- The shared report ----

test('shared report: opens with no sign-in, keeps its notes, shows no ids, and ends when withdrawn', async ({ page, browser }) => {
  test.setTimeout(150_000);
  await calm(page);
  await signIn(page);
  await seedPlain(page);

  await page.goto('/badge');
  await expect(page.getByTestId('share-none')).toBeVisible();
  await page.getByRole('group', { name: 'How long it stays open' }).getByRole('button', { name: '7 days' }).click();
  await page.getByRole('button', { name: 'Make a public link' }).click();
  const url = await page.getByTestId('share-fresh').locator('input').inputValue();
  expect(url).toContain('/r/');
  await expect(page.getByTestId('share-row')).toHaveCount(1);

  const stranger = await freshPage(browser);
  const answer = stranger.waitForResponse((response) => response.url().includes('/v1/public/reports/'));
  await stranger.goto(url);
  const body = await (await answer).text();
  expect(body, 'the API sends no internal ids').not.toMatch(UUID);
  const report = JSON.parse(body) as { companyName: string; notLegalAdvice: string; coverage: { counted: number; total: number }; openIssues: { total: number; urgent: number; important: number; worthDoing: number }; areas: { name: string }[] };

  const screen = stranger.getByTestId('shared-report');
  await expect(stranger).toHaveURL(url);
  await expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(report.companyName);
  await expect(stranger.getByTestId('report-not-advice')).toHaveText(report.notLegalAdvice);
  await expect(stranger.getByTestId('report-not-advice')).toContainText('not legal advice');
  await expect(stranger.getByTestId('report-coverage')).toContainText(`${report.coverage.counted} of ${report.coverage.total}`);
  await expect(stranger.getByTestId('sample-note')).toBeVisible();
  await expect(stranger.getByTestId('report-dates')).toContainText('Link expires in 7 days.');
  await expect(stranger.getByText(`Shared by ${report.companyName}`)).toBeVisible();
  await expect(stranger.getByTestId('report-area')).toHaveCount(report.areas.length);
  await expect(screen.getByRole('complementary', { name: 'Open issues' }).locator('.pixel')).toHaveText([report.openIssues.urgent, report.openIssues.important, report.openIssues.worthDoing].map(String));
  await expect(stranger.locator('body')).not.toContainText(UUID);
  await expect(stranger.getByRole('button', { name: /account menu/ })).toHaveCount(0);
  await expect(stranger.getByRole('button', { name: /request documents/i })).toHaveCount(0);

  await page.getByTestId('share-row').getByRole('button', { name: 'Withdraw' }).click();
  await page.getByTestId('share-row').getByRole('button', { name: 'Yes, withdraw it' }).click();
  // A withdrawn link stays listed as ended, and nothing is open.
  await expect(page.getByTestId('share-row')).toHaveCount(0);
  await expect(page.getByTestId('share-ended')).toContainText('Withdrawn');
  await stranger.reload();
  await expect(stranger.getByTestId('report-gone')).toContainText("This link isn't open any more");
  await stranger.context().close();
});

test('shared report: a bad link, a slow answer, a failure, and no score are all said plainly', async ({ page, watch }) => {
  await calm(page);
  watch.allow(/Failed to load resource/);
  await page.goto('/r/not-a-real-link-but-long-enough');
  await expect(page.getByTestId('report-gone')).toBeVisible();
  await expect(page).toHaveURL(/\/r\//);

  let fail = true;
  await page.route('**/v1/public/reports/*', async (route) => {
    if (fail) return route.fulfill({ status: 500, json: { error: { code: 'internal', message: 'Something went wrong.' } } });
    await new Promise((resolve) => setTimeout(resolve, 500));
    return route.fulfill({
      json: {
        companyName: 'Acme Ltd', score: null, statusWord: null, coverage: null, heldByUrgent: false, reportDate: new Date().toISOString(), expiresAt: new Date(Date.now() + 86_400_000 * 2).toISOString(),
        openIssues: { total: 1, urgent: 1, important: 0, worthDoing: 0 }, areas: [], checked: [{ country: 'Delaware', howWeKnow: 'Certificate of good standing, dated 2026-10-12. The company uploaded this and we read it.' }, { country: 'Nigeria', howWeKnow: "Not checked: the register couldn't be reached." }],
        sampleData: false, notLegalAdvice: 'This is a signal, not legal advice.',
      },
    });
  });
  await page.goto('/r/another-link-long-enough-to-pass');
  await expect(page.getByTestId('error-state')).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Getting this report')).toBeVisible();
  await expect(page.getByTestId('report-no-score')).toHaveText('No score yet.');
  await expect(page.getByTestId('sample-note')).toHaveCount(0);
  const checked = page.getByTestId('report-checked');
  await expect(checked.first()).toContainText('dated 12 October 2026');
  await expect(checked.first().locator('em')).toHaveText('Checked');
  await expect(checked.nth(1).locator('em')).toHaveText('Not checked');
  await expect(page.getByTestId('report-what-vero-checked')).toHaveText('This shows only what Vero checked: public records, and the answers and documents the company added.');
});

// ---- Settings ----

test('settings: your name, your companies, and the sections all reach somewhere real', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page);
  await page.goto('/settings');
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  await expect(page.getByTestId('settings-company')).toHaveAttribute('href', `/company/${companyId}`);
  await expect(page.getByTestId('settings-plan')).toHaveAttribute('href', '/plan');
  await expect(page.getByText('Your plan', { exact: true }).locator('..')).toContainText('Free');
  await expect(page.getByTestId('settings-notifications')).toContainText('Switch one on and it is emailed to you');

  await page.getByLabel('Your name').fill('Amara Okafor');
  await page.getByRole('button', { name: 'Save your name' }).click();
  await expect(page.getByText('Saved.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Your name')).toHaveValue('Amara Okafor');

  await page.getByRole('group', { name: 'Display' }).getByRole('button', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('navigation', { name: 'Settings sections' }).getByRole('link', { name: 'Team' }).click();
  await expect(page).toHaveURL(/#team$/);
});

test('settings: a real invite, a real email, joining with a new account, changing a role, removing', async ({ page, browser, watch }) => {
  test.setTimeout(180_000);
  // The refused deletion below is on purpose, and the browser logs it.
  watch.allow(/Failed to load resource/);
  await calm(page);
  await signIn(page);
  const { organisationId } = await seedScanned(page);
  const email = uniqueEmail('teammate');

  await page.goto('/settings');
  await page.getByRole('button', { name: 'Invite someone' }).click();
  await page.getByLabel('Their work email').fill(email);
  await page.getByLabel('What they can do').selectOption('member');
  await page.getByRole('button', { name: 'Send invite' }).click();
  await expect(page.getByText("Invite sent. They'll get an email from us.")).toBeVisible();
  const pending = page.locator(`[data-testid="pending-row"][data-email="${email}"]`);
  await expect(pending).toContainText("We've emailed them.");

  await expect.poll(async () => (await sql(`SELECT 1 FROM outbox WHERE to_email = $1 AND body_text LIKE '%/invitations/accept%'`, [email])).length, { timeout: 30_000 }).toBeGreaterThan(0);
  const [mail] = await sql<{ body_text: string }>(`SELECT body_text FROM outbox WHERE to_email = $1`, [email]);
  const invite = /https?:\/\/\S*\/invitations\/accept\?token=\S+/.exec(mail?.body_text ?? '')?.[0] ?? '';
  expect(invite).not.toBe('');
  await sql('DELETE FROM outbox WHERE to_email = $1', [email]);

  // Someone with no account yet: the link goes through sign-in, and back to the invite.
  const teammate = await freshPage(browser);
  await teammate.goto(invite);
  await teammate.waitForURL('**/sign-in**');
  await requestLink(teammate, email);
  await teammate.goto(await linkFromOutbox(email));
  await teammate.waitForURL('**/invitations/accept**');
  await teammate.getByRole('button', { name: 'Join the team' }).click();
  await teammate.waitForURL((url) => !url.pathname.startsWith('/invitations'));
  await expect.poll(async () => (await sql('SELECT 1 FROM membership m JOIN "user" u ON u.id = m.user_id WHERE u.email = $1 AND m.organisation_id = $2', [email, organisationId])).length).toBe(1);

  await page.reload();
  const row = page.locator(`[data-testid="member-row"][data-email="${email}"]`);
  await expect(row).toBeVisible();
  await expect(page.locator(`[data-testid="pending-row"][data-email="${email}"]`)).toHaveCount(0);
  await row.getByRole('combobox').selectOption('admin');
  await expect(page.getByText(/is now admin\./)).toBeVisible();
  await expect.poll(async () => (await sql<{ role: string }>('SELECT m.role FROM membership m JOIN "user" u ON u.id = m.user_id WHERE u.email = $1 AND m.organisation_id = $2', [email, organisationId]))[0]?.role).toBe('admin');

  // A teammate means the last owner can't just delete their account.
  await page.getByTestId('delete-account').locator('summary').click();
  const me = await apiJson<{ user: { email: string } }>(page, 'get', '/v1/me');
  await page.getByLabel(/Type your email to confirm/).fill(me.user.email);
  await page.getByTestId('delete-confirm').click();
  await expect(page.getByTestId('delete-account').getByRole('alert')).toContainText('only owner');
  expect((await sql('SELECT 1 FROM "user" WHERE email = $1', [me.user.email])).length).toBe(1);

  await row.getByRole('button', { name: 'Remove' }).click();
  await row.getByRole('button', { name: 'Yes, remove' }).click();
  await expect(row).toHaveCount(0);
  await teammate.context().close();
});

test('settings: an invite can be withdrawn, and one for someone else is refused plainly', async ({ page, browser }) => {
  test.setTimeout(120_000);
  await calm(page);
  await signIn(page);
  await seedScanned(page);
  const email = uniqueEmail('teammate');
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Invite someone' }).click();
  await page.getByLabel('Their work email').fill(email);
  await page.getByRole('button', { name: 'Send invite' }).click();
  const pending = page.locator(`[data-testid="pending-row"][data-email="${email}"]`);
  await expect(pending).toBeVisible();
  await expect.poll(async () => (await sql(`SELECT 1 FROM outbox WHERE to_email = $1`, [email])).length, { timeout: 30_000 }).toBeGreaterThan(0);
  const [mail] = await sql<{ body_text: string }>(`SELECT body_text FROM outbox WHERE to_email = $1`, [email]);
  const invite = /https?:\/\/\S*\/invitations\/accept\?token=\S+/.exec(mail?.body_text ?? '')?.[0] ?? '';

  const other = await freshPage(browser);
  await signIn(other);
  await other.goto(invite);
  await other.getByRole('button', { name: 'Join the team' }).click();
  await expect(other.getByTestId('invitation-problem')).toContainText('different email address');
  await expect(other.getByRole('button', { name: 'Sign in with another email' })).toBeVisible();
  await other.context().close();

  await pending.getByRole('button', { name: 'Withdraw' }).click();
  await expect(pending).toHaveCount(0);

  const stray = await freshPage(browser);
  await signIn(stray);
  await stray.goto('/invitations/accept');
  await expect(stray.getByTestId('invitation-problem')).toContainText("isn't complete");
  await stray.context().close();
});

test('settings: a member sees the team, without the controls; a team error can be retried', async ({ page, watch }) => {
  await calm(page);
  await signIn(page);
  const { organisationId } = await seedScanned(page);
  await sql(`UPDATE membership SET role = 'member' WHERE organisation_id = $1`, [organisationId]);

  await page.goto('/settings');
  await expect(page.getByTestId('member-row')).toHaveCount(1);
  await expect(page.getByTestId('team-no-permission')).toContainText('Only an owner or admin');
  await expect(page.getByRole('button', { name: 'Invite someone' })).toHaveCount(0);
  await expect(page.getByTestId('member-row').getByRole('combobox')).toHaveCount(0);

  watch.allow(/Failed to load resource/);
  let fail = true;
  await page.route('**/v1/members', (route) => (fail ? route.fulfill({ status: 500, json: { error: { code: 'internal', message: 'Something went wrong.' } } }) : route.continue()));
  await page.reload();
  await expect(page.getByTestId('team-error')).toBeVisible();
  fail = false;
  await page.getByTestId('team-error').getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByTestId('member-row')).toHaveCount(1);
});

test('settings: two-step sign-in goes on only with a real code, and off the same way', async ({ page, watch }) => {
  test.setTimeout(150_000);
  // The wrong code below is on purpose, and the browser logs its refusal.
  watch.allow(/Failed to load resource/);
  await calm(page);
  const email = await signIn(page);
  await seedScanned(page);

  await page.goto('/settings');
  const box = page.getByTestId('two-step');
  await expect(page.getByTestId('two-step-state')).toHaveText('Off');
  await box.getByRole('button', { name: 'Set up two-step sign-in' }).click();
  const secret = (await page.getByTestId('two-step-secret').innerText()).trim();
  await expect(page.getByTestId('two-step-state')).toHaveText('Off');

  const wrong = totp(secret) === '000000' ? '000001' : '000000';
  await box.getByLabel('The 6-digit code from your app').fill(wrong);
  await box.getByRole('button', { name: 'Turn it on' }).click();
  await expect(box.getByRole('alert')).toBeVisible();
  await expect(page.getByTestId('two-step-state')).toHaveText('Off');

  await box.getByLabel('The 6-digit code from your app').fill(totp(secret));
  await box.getByRole('button', { name: 'Turn it on' }).click();
  await expect(page.getByTestId('two-step-state')).toHaveText('On');
  await expect.poll(async () => (await sql<{ mfa_enabled: boolean }>('SELECT mfa_enabled FROM "user" WHERE email = $1', [email]))[0]?.mfa_enabled).toBe(true);

  // A code can only be used once, so this waits for the next one.
  await page.waitForTimeout(31_000);
  await box.getByRole('button', { name: 'Turn off two-step sign-in' }).click();
  await box.getByLabel('The 6-digit code from your app').fill(totp(secret));
  await box.getByRole('button', { name: 'Turn it off' }).click();
  await expect(page.getByTestId('two-step-state')).toHaveText('Off');
});

test('settings: signing out everywhere really ends the session', async ({ page, watch }) => {
  // This session ends too, so a call already on its way can come back 401 before the page leaves.
  watch.allow(/status of 401/);
  await calm(page);
  await signIn(page);
  await seedScanned(page);
  await page.goto('/settings');
  await page.getByTestId('sign-out-everywhere').click();
  await page.waitForURL('**/sign-in**');
  await page.goto('/settings');
  await page.waitForURL('**/sign-in**');
});

test('settings: deleting the account takes your exact email, then really deletes it', async ({ page }) => {
  await calm(page);
  const email = await signIn(page);
  const { organisationId } = await seedScanned(page);
  await page.goto('/settings');
  await page.getByTestId('delete-account').locator('summary').click();
  const button = page.getByTestId('delete-confirm');
  await expect(page.getByTestId('delete-account')).toContainText("you can't undo it");
  await expect(button).toBeDisabled();
  await page.getByLabel(/Type your email to confirm/).fill('someone-else@example.test');
  await expect(button).toBeDisabled();
  await page.getByLabel(/Type your email to confirm/).fill(email);
  await expect(button).toBeEnabled();
  await button.click();
  await page.waitForURL('**/sign-in**');
  expect((await sql('SELECT 1 FROM "user" WHERE email = $1', [email])).length).toBe(0);
  expect((await sql('SELECT 1 FROM organisation WHERE id = $1', [organisationId])).length).toBe(0);
});

test('settings: a sole owner sees why they cannot leave, and a second owner brings the button back', async ({ page, browser }) => {
  test.setTimeout(120_000);
  await calm(page);
  const email = await signIn(page);
  const { organisationId } = await seedScanned(page);
  await page.goto('/settings');
  const mine = page.locator(`[data-testid="member-row"][data-email="${email}"]`);
  await expect(mine.getByTestId('sole-owner-note')).toBeVisible();
  await expect(mine.getByRole('button', { name: 'Leave' })).toHaveCount(0);

  const other = await freshPage(browser);
  const otherEmail = await signIn(other);
  await sql(`INSERT INTO membership (organisation_id, user_id, role) SELECT $1, id, 'owner' FROM "user" WHERE email = $2`, [organisationId, otherEmail]);
  await other.context().close();
  await page.reload();
  await expect(mine).toBeVisible();
  await expect(mine.getByTestId('sole-owner-note')).toHaveCount(0);
  await expect(mine.getByRole('button', { name: 'Leave' })).toBeVisible();
});

// ---- Plan ----

test("plan: no invented prices, checkout is Stripe's own, and it says what really happens", async ({ page, watch }) => {
  // Payments aren't switched on here, so the checkout below is refused on purpose, and the browser logs it.
  watch.allow(/status of 503/);
  await calm(page);
  await signIn(page);
  await seedScanned(page);
  const plans = await apiJson<{ plans: { code: string; priceMinor: number | null }[] }>(page, 'get', '/v1/plans');
  expect(plans.plans.every((plan) => plan.priceMinor === null)).toBe(true);

  await page.goto('/plan');
  const screen = page.getByTestId('plan-page');
  await expect(screen).toHaveAttribute('data-current', 'free');
  await expect(page.getByTestId('plan-price')).toHaveText(['Nothing to pay', 'Not set yet', 'Not set yet']);
  await expect(screen).not.toContainText(/[$£€₦]\s?\d/);
  await expect(screen).not.toContainText('[PRICE]');
  await expect(page.getByTestId('plan-change')).toContainText("Payments go through Stripe's own checkout");
  await expect(page.getByTestId('plan-change')).toContainText('our team can change your plan by hand');
  await expect(page.locator('[data-plan="free"]').getByText('Your plan')).toBeVisible();
  await expect(page.getByTestId('plan-score')).toContainText('Your read today');

  const scale = page.locator('[data-testid="plan-card"][data-plan="scale"]');
  await expect(scale).toContainText("aren't running yet");
  await expect(screen).not.toContainText(/automatic monitoring|all year|someone watching/i);
  // The columns follow the plan cards: free, growth, scale.
  await expect(page.getByTestId('plan-card')).toHaveCount(3);
  await expect(page.getByTestId('plan-card').nth(0)).toHaveAttribute('data-plan', 'free');
  await expect(page.getByTestId('plan-card').nth(2)).toHaveAttribute('data-plan', 'scale');
  const cell = (key: string, column: number) => page.locator(`[data-testid="compare-row"][data-key="${key}"]`).getByRole('cell').nth(column);
  for (const key of ['deadlineWatching', 'rulesChangeAlerts', 'annualVerification']) {
    await expect(cell(key, 3)).toContainText('Planned');
    await expect(cell(key, 2)).toContainText('Not included');
    await expect(cell(key, 0)).toContainText('not running yet');
  }
  await expect(cell('gaps', 1)).toContainText('Top 3');
  await expect(cell('score', 1)).toContainText('Approximate');

  // Moving starts checkout. With payments not switched on, it says so plainly, and the plan stays as it was.
  const move = page.getByTestId('checkout-growth');
  await expect(move).toHaveText('Move to Growth');
  await move.click();
  await expect(page.getByRole('alert').filter({ hasText: "Payments aren't switched on yet." })).toBeVisible();
  await expect(page).toHaveURL(/\/plan$/);
  const after = await apiJson<{ current: string }>(page, 'get', '/v1/plans');
  expect(after.current).toBe('free');
});

test('plan: on Growth it says so, before a first scan it says that, and a failure can be retried', async ({ page, browser, watch }) => {
  await calm(page);
  await signIn(page);
  await seedScanned(page, { plan: 'growth' });
  await page.goto('/plan');
  await expect(page.getByTestId('plan-page')).toHaveAttribute('data-current', 'growth');
  await expect(page.locator('[data-testid="plan-card"][data-plan="growth"]')).toContainText('Your plan');
  await expect(page.locator('[data-testid="plan-card"][data-plan="growth"]').getByRole('link')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Move to Scale' })).toBeVisible();

  watch.allow(/Failed to load resource/);
  let fail = true;
  await page.route('**/v1/plans', async (route) => {
    if (fail) return route.fulfill({ status: 500, json: { error: { code: 'internal', message: 'Something went wrong.' } } });
    await new Promise((resolve) => setTimeout(resolve, 500));
    return route.continue();
  });
  await page.reload();
  await expect(page.getByTestId('error-state')).toBeVisible();
  fail = false;
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Getting the plans')).toBeVisible();
  await expect(page.getByTestId('plan-page')).toBeVisible();

  const fresh = await freshPage(browser);
  await signIn(fresh);
  await fresh.goto('/plan');
  await expect(fresh.getByRole('link', { name: 'Start with your first scan' })).toHaveCount(2);
  await expect(fresh.getByRole('button', { name: /Move to/ })).toHaveCount(0);
  await fresh.context().close();
});

// ---- No dead links ----

for (const plan of ['free', 'growth'] as const) {
  test(`no dead links in the app on ${plan}`, async ({ page }) => {
    test.setTimeout(180_000);
    await calm(page);
    await signIn(page);
    await seedScanned(page, { plan });
    const pages = ['/', '/issues', '/documents', '/deadlines', '/company', '/badge', '/plan', '/settings', '/notifications', '/report'];
    const seen = new Set<string>();
    for (const path of pages) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
      for (const href of hrefs) seen.add(href.split('#')[0] ?? href);
    }
    expect(seen.size).toBeGreaterThan(pages.length);
    for (const href of seen) {
      if (!href) continue;
      const response = await page.request.get(`${WEB_URL}${href}`);
      expect(response.status(), `${href} opens`).toBeLessThan(400);
    }
  });
}

// ---- Accessibility and phones ----

for (const theme of ['light', 'dark'] as const) {
  test(`trust and account screens pass axe and fit a phone, in ${theme}`, async ({ page, browser }) => {
    test.setTimeout(420_000);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await signIn(page);
    const seed = await seedPlain(page);
    await makeEligible(seed);

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await checkScreen(page);

    await page.goto('/badge');
    await expect(page.getByTestId('badge-issue')).toBeVisible();
    await checkScreen(page);
    await page.getByTestId('badge-issue').click();
    await expect(page.getByTestId('badge-link')).toBeVisible();
    await checkScreen(page);
    const verified = await page.getByTestId('badge-link').locator('input').inputValue();

    await page.getByRole('button', { name: 'Make a public link' }).click();
    const shared = await page.getByTestId('share-fresh').locator('input').inputValue();
    await checkScreen(page);

    const stranger = await browser.newContext({ baseURL: WEB_URL, colorScheme: theme, reducedMotion: 'reduce' });
    const public1 = await stranger.newPage();
    await public1.goto(shared);
    await expect(public1.getByTestId('shared-report')).toBeVisible();
    await checkScreen(public1);
    await public1.getByTestId('report-area').first().locator('summary').click();
    await checkScreen(public1);
    await public1.goto(verified);
    await expect(public1.getByTestId('verified-badge')).toBeVisible();
    await checkScreen(public1);
    await public1.goto('/r/not-a-real-link-but-long-enough');
    await expect(public1.getByTestId('report-gone')).toBeVisible();
    await checkScreen(public1);
    await stranger.close();

    await page.goto('/settings');
    await expect(page.getByTestId('member-row')).toHaveCount(1);
    await checkScreen(page);
    await page.getByRole('button', { name: 'Invite someone' }).click();
    await page.getByTestId('two-step').getByRole('button', { name: 'Set up two-step sign-in' }).click();
    await expect(page.getByTestId('two-step-setup')).toBeVisible();
    await page.getByTestId('delete-account').locator('summary').click();
    await checkScreen(page);

    await page.goto('/plan');
    await expect(page.getByTestId('plan-page')).toBeVisible();
    await checkScreen(page);
  });
}

test('the Free states pass axe, and the main menu fits a 375px phone', async ({ page }) => {
  test.setTimeout(150_000);
  await calm(page);
  await signIn(page);
  await seedScanned(page);
  for (const [path, ready] of [['/badge', 'badge-hero'], ['/plan', 'plan-page'], ['/settings', 'settings']] as const) {
    await page.goto(path);
    await expect(page.getByTestId(ready)).toBeVisible();
    await checkScreen(page);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/settings');
  // On a phone the side menu opens as a drawer.
  await page.getByRole('button', { name: 'Open the menu' }).click();
  const nav = page.getByRole('complementary', { name: 'Main' }).getByRole('navigation');
  for (const name of ['Overview', 'Findings', 'Documents', 'Deadlines', 'Registry records']) {
    const box = await nav.getByRole('link', { name }).boundingBox();
    expect(box, `${name} is on the page`).not.toBeNull();
    expect((box?.x ?? 0) + (box?.width ?? 0), `${name} fits a 375px phone`).toBeLessThanOrEqual(375);
  }
});

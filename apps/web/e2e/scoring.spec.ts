import type { Page } from '@playwright/test';
import { WEB_URL } from './support/env';
import { calm, expect, expectAccessible, expectNoSideways, holdWithUrgentGaps, seedPlain, seedScanned, signIn, test } from './support/helpers';

const FOUNDERS = 'GB.IP.FOUNDER_ASSIGNMENT';
const CONTRACTORS = 'GB.IP.CONTRACTOR_ASSIGNMENT';

interface Coverage {
  counted: number;
  total: number;
}
interface Overview {
  score: { kind: string; value?: number; low?: number; high?: number };
  statusWord: string | null;
  heldByUrgent: boolean;
  coverage: Coverage | null;
}

async function getJson<T>(page: Page, path: string): Promise<T> {
  const response = await page.request.get(`${WEB_URL}${path}`);
  expect(response.ok(), path).toBe(true);
  return (await response.json()) as T;
}

const overviewOf = (page: Page, companyId: string) => getJson<Overview>(page, `/v1/companies/${companyId}/overview`);

function basedOn(coverage: Coverage | null): string {
  if (!coverage) throw new Error('The API sent no coverage');
  return `Based on ${coverage.counted} of ${coverage.total} checks.`;
}

/** The short form beside a score: "N of M checks". */
function ofChecks(coverage: Coverage | null): string {
  if (!coverage) throw new Error('The API sent no coverage');
  return `${coverage.counted} of ${coverage.total} checks`;
}

/** Where each screen says an urgent gap is holding the score at 74. */
function heldLine(page: Page, path: string) {
  if (path === '/first-result') return page.getByText('Capped at 74 by an urgent gap');
  if (path === '/issues') return page.getByText(/the score stays capped at 74\.$/);
  return page.getByText('An urgent gap holds it at 74 or below.', { exact: false });
}

/** Says "we don't have it" through the API, and waits until the new score is in. */
async function declare(page: Page, companyId: string, ruleKey: string): Promise<void> {
  const reply = await page.request.post(`${WEB_URL}/v1/companies/${companyId}/issues/${ruleKey}/missing`, { headers: { origin: WEB_URL } });
  expect(reply.ok()).toBe(true);
  await expect.poll(async () => (await getJson<{ declaredMissing: boolean }>(page, `/v1/companies/${companyId}/issues/${ruleKey}`)).declaredMissing, { timeout: 60_000 }).toBe(true);
}

test('every score says what it rests on, on a paid plan', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  const overview = await overviewOf(page, companyId);
  const words = basedOn(overview.coverage);
  const short = ofChecks(overview.coverage);

  await page.goto('/first-result');
  await expect(page.getByText(words, { exact: true })).toBeVisible();
  await page.goto('/');
  await expect(page.getByTestId('score-basis')).toHaveText(short);
  await expect(page.getByTestId('score-basis')).toHaveCount(1);
  await page.goto('/issues');
  await expect(page.getByTestId('score-basis')).toHaveText(short);
  await expect(page.getByTestId('score-basis')).toHaveCount(1);

  const area = await getJson<{ coverage: Coverage }>(page, `/v1/companies/${companyId}/areas/1?scope=company`);
  await page.goto('/areas/1');
  await expect(page.getByTestId('score-basis')).toContainText(`Scored on ${ofChecks(area.coverage)}.`);
});

test('a Free range says what it used, out of every check that applies', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'free' });
  const overview = await overviewOf(page, companyId);
  expect(overview.score.kind).toBe('approximate');
  const words = basedOn(overview.coverage);
  const short = ofChecks(overview.coverage);

  await page.goto('/first-result');
  await expect(page.getByTestId('first-score')).toHaveAttribute('aria-label', /to \d+ out of 100/);
  await expect(page.getByText(words, { exact: true })).toBeVisible();
  await page.goto('/');
  await expect(page.getByTestId('score-basis')).toHaveText(short);
  await page.goto('/issues');
  await expect(page.getByTestId('score-basis')).toHaveText(short);
});

test('an open urgent gap holds the score, and the screens say so', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId, scanId } = await seedPlain(page);
  expect((await overviewOf(page, companyId)).heldByUrgent).toBe(false);
  await page.goto('/');
  await expect(page.getByTestId('home-score')).toBeVisible();
  await expect(heldLine(page, '/')).toHaveCount(0);

  await holdWithUrgentGaps(scanId, [FOUNDERS]);
  const overview = await overviewOf(page, companyId);
  expect(overview.heldByUrgent).toBe(true);
  expect(overview.score.value).toBe(74);
  expect(overview.statusWord).toBe('Needs work');

  for (const path of ['/', '/first-result', '/issues']) {
    await page.goto(path);
    await expect(heldLine(page, path)).toBeVisible();
  }
});

test('saying "we don\'t have it" explains itself first, lowers the score, and can be undone', async ({ page, watch }) => {
  watch.allow(/status of 500/);
  await calm(page);
  await signIn(page);
  const { companyId } = await seedPlain(page);
  const before = (await overviewOf(page, companyId)).score.value ?? -1;
  expect(before).toBeGreaterThan(74);

  await page.goto(`/issues/${companyId}/${encodeURIComponent(FOUNDERS)}`);
  const choice = page.getByTestId('declare-missing');
  await expect(choice).toContainText('it becomes a gap, which may lower your score');
  // Said once, even though the API's reason opens with the same words.
  expect((await page.getByTestId('not-seen').innerText()).match(/(We|Vero) ha(ve|s)n't seen this yet/g)).toHaveLength(1);
  await expect(choice.getByRole('link', { name: 'Add the document' })).toHaveAttribute('href', /\/documents\/add\?company=/);

  // A failure leaves everything as it was, and says so.
  await page.route('**/issues/*/missing', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { code: 'internal_error', message: 'Something went wrong on our side. Please try again.' } }) }));
  await choice.getByRole('button', { name: "We don't have it" }).click();
  await expect(page.getByTestId('missing-problem')).toContainText('Something went wrong on our side');
  await expect(choice.getByRole('button', { name: "We don't have it" })).toBeEnabled();
  expect((await overviewOf(page, companyId)).score.value).toBe(before);
  await page.unroute('**/issues/*/missing');

  await choice.getByRole('button', { name: "We don't have it" }).click();
  const declared = page.getByTestId('declared-missing');
  await expect(declared).toContainText("You told us you don't have this.", { timeout: 60_000 });
  await expect(page.getByTestId('issue-chip')).toContainText('Urgent');

  const lowered = (await overviewOf(page, companyId)).score.value ?? -1;
  expect(lowered).toBeLessThan(before);
  await page.goto('/');
  await expect(page.getByTestId('home-score')).toHaveText(String(lowered));
  await page.goto('/issues');
  await expect(page.getByTestId('issue-row').filter({ hasText: "You told us you don't have this" })).toHaveCount(1);

  await page.goto(`/issues/${companyId}/${encodeURIComponent(FOUNDERS)}`);
  await page.getByRole('button', { name: 'Undo this' }).click();
  await expect(page.getByTestId('declare-missing')).toBeVisible({ timeout: 60_000 });
  expect((await overviewOf(page, companyId)).score.value).toBe(before);
  await page.goto('/');
  await expect(page.getByTestId('home-score')).toHaveText(String(before));
  await expect(heldLine(page, '/')).toHaveCount(0);
});

test('two urgent gaps: no "+0 points" anywhere, and each says why', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId, scanId } = await seedPlain(page);
  await holdWithUrgentGaps(scanId, [FOUNDERS, CONTRACTORS]);

  const heldWords = "Fixing this won't move your score until the other urgent issues are fixed too.";
  const detail = await getJson<{ points: number; pointsHeldByUrgent: boolean }>(page, `/v1/companies/${companyId}/issues/${FOUNDERS}`);
  expect(detail.points).toBe(0);
  expect(detail.pointsHeldByUrgent).toBe(true);

  await page.goto('/issues');
  // The points panel says both urgent ones come first, and each urgent row says why it adds nothing yet.
  await expect(page.getByText('The urgent ones come first: until they are cleared, the score stays capped at 74.')).toBeVisible();
  const urgentRows = page.getByTestId('issue-row').filter({ hasText: 'Urgent' });
  await expect(urgentRows).toHaveCount(2);
  for (const row of await urgentRows.all()) {
    await row.click();
    await expect(page.getByTestId('finding-drawer')).toContainText('Counts once the urgent findings are cleared');
    await page.getByTestId('finding-drawer').getByRole('button', { name: 'Close' }).click();
  }
  await expect(page.locator('main')).not.toContainText('+0');

  await page.goto(`/issues/${companyId}/${encodeURIComponent(FOUNDERS)}`);
  await expect(page.getByTestId('points-held')).toContainText(heldWords);
  await expect(page.locator('main')).not.toContainText('+0');

  await page.goto('/areas/2');
  const held = page.getByTestId('area-fix').getByTestId('points-held');
  await expect(held).toHaveCount(2);
  for (const one of await held.all()) await expect(one).toHaveAttribute('title', heldWords);
  await expect(page.locator('main')).not.toContainText('+0');

  await page.goto('/');
  // Fixing one alone moves nothing, so the next step says what clearing both urgent gaps does.
  await expect(page.getByTestId('next-action').getByTestId('points-held')).toHaveText(/lifting the cap$|^Fixing this won't move your score until the other urgent issues are fixed too\.$/);
  await expect(page.locator('main')).not.toContainText('+0');
});

for (const theme of ['light', 'dark'] as const) {
  test(`what's new here passes axe and fits a phone, in ${theme}`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await signIn(page);
    const { companyId, scanId } = await seedPlain(page);

    const check = async () => {
      await expectAccessible(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await expectNoSideways(page);
      await page.setViewportSize({ width: 1440, height: 900 });
    };

    await page.goto(`/issues/${companyId}/${encodeURIComponent(FOUNDERS)}`);
    await expect(page.getByTestId('declare-missing')).toBeVisible();
    await check();

    await page.goto('/issues');
    await page.getByTestId('group-to-check').click();
    await page.getByTestId('issue-row').first().click();
    await expect(page.getByTestId('finding-drawer')).toContainText('Not seen yet');
    await check();

    // On the area, an unseen check opens in place. Not every one is a document, so find one that offers the choice.
    await page.goto('/areas/2');
    const unseen = page.getByTestId('area-check').filter({ hasText: 'Not seen yet' });
    await expect(unseen.first()).toBeVisible();
    for (const row of await unseen.all()) {
      await row.click();
      if (await page.getByTestId('declare-missing').isVisible()) break;
    }
    await expect(page.getByTestId('declare-missing')).toBeVisible();
    await check();

    await declare(page, companyId, FOUNDERS);
    await page.goto(`/issues/${companyId}/${encodeURIComponent(FOUNDERS)}`);
    await expect(page.getByTestId('declared-missing')).toBeVisible();
    await check();

    const latest = (await getJson<{ scans: { id: string }[] }>(page, `/v1/companies/${companyId}/scans`)).scans[0]?.id ?? scanId;
    await holdWithUrgentGaps(latest, [FOUNDERS, CONTRACTORS]);
    for (const path of ['/', '/issues', '/areas/2', '/first-result']) {
      await page.goto(path);
      await expect(page.getByTestId('score-basis')).toBeVisible();
      await check();
    }
  });
}

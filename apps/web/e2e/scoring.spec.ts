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

  await page.goto('/first-result');
  await expect(page.getByTestId('score-basis')).toHaveText(words);
  await page.goto('/');
  await expect(page.getByTestId('score-basis')).toHaveText(words);
  await expect(page.getByTestId('score-basis')).toHaveCount(1);
  await page.goto('/issues');
  await expect(page.getByTestId('score-basis')).toHaveText(words);
  await expect(page.getByTestId('score-basis')).toHaveCount(1);

  const area = await getJson<{ coverage: Coverage }>(page, `/v1/companies/${companyId}/areas/1?scope=company`);
  await page.goto('/areas/1');
  await expect(page.getByTestId('score-basis')).toHaveText(basedOn(area.coverage));
});

test('a Free range says what it used, out of every check that applies', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'free' });
  const overview = await overviewOf(page, companyId);
  expect(overview.score.kind).toBe('approximate');
  const words = basedOn(overview.coverage);

  await page.goto('/first-result');
  await expect(page.getByTestId('first-score')).toHaveAttribute('aria-label', /to \d+ out of 100/);
  await expect(page.getByTestId('score-basis')).toHaveText(words);
  await page.goto('/');
  await expect(page.getByTestId('score-basis')).toHaveText(words);
  await page.goto('/issues');
  await expect(page.getByTestId('score-basis')).toHaveText(words);
});

test('an open urgent gap holds the score, and the screens say so', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId, scanId } = await seedPlain(page);
  expect((await overviewOf(page, companyId)).heldByUrgent).toBe(false);
  await page.goto('/');
  await expect(page.getByTestId('score-held')).toHaveCount(0);

  await holdWithUrgentGaps(scanId, [FOUNDERS]);
  const overview = await overviewOf(page, companyId);
  expect(overview.heldByUrgent).toBe(true);
  expect(overview.score.value).toBe(74);
  expect(overview.statusWord).toBe('Needs work');

  for (const path of ['/', '/first-result', '/issues']) {
    await page.goto(path);
    await expect(page.getByTestId('score-held')).toHaveText('Your score is held here until your urgent issues are fixed.');
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
  expect((await page.getByTestId('not-seen').innerText()).match(/We haven't seen this yet/g)).toHaveLength(1);
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
  await expect(page.getByTestId('issue-chip')).toHaveText('Urgent');

  const lowered = (await overviewOf(page, companyId)).score.value ?? -1;
  expect(lowered).toBeLessThan(before);
  await page.goto('/');
  await expect(page.getByTestId('home-score')).toHaveText(String(lowered));
  await page.goto('/issues');
  await expect(page.getByTestId('issue-row').filter({ hasText: "You told us you don't have this." })).toHaveCount(1);

  await page.goto(`/issues/${companyId}/${encodeURIComponent(FOUNDERS)}`);
  await page.getByRole('button', { name: 'Undo this' }).click();
  await expect(page.getByTestId('declare-missing')).toBeVisible({ timeout: 60_000 });
  expect((await overviewOf(page, companyId)).score.value).toBe(before);
  await page.goto('/');
  await expect(page.getByTestId('home-score')).toHaveText(String(before));
  await expect(page.getByTestId('score-held')).toHaveCount(0);
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
  const urgent = page.getByTestId('group-urgent');
  await expect(urgent.getByTestId('points-held').first()).toHaveText(heldWords);
  await expect(urgent.getByTestId('points-held')).toHaveCount(2);
  await expect(page.locator('main')).not.toContainText('+0');

  await page.goto(`/issues/${companyId}/${encodeURIComponent(FOUNDERS)}`);
  await expect(page.getByTestId('points-held')).toHaveText(heldWords);
  await expect(page.locator('main')).not.toContainText('+0');

  await page.goto('/areas/2');
  await expect(page.getByTestId('area-fix').first()).toContainText(heldWords);
  await expect(page.locator('main')).not.toContainText('+0');

  await page.goto('/');
  await expect(page.getByTestId('next-action')).toContainText(heldWords);
  for (const row of await page.getByTestId('area-row').all()) await row.locator('summary').click();
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
    const toDo = page.getByTestId('group-to-check');
    await toDo.locator('summary').first().click();
    // Not every unchecked item is a document, so find one that offers the choice.
    const row = toDo.getByTestId('area-check').filter({ has: page.getByTestId('declare-missing') }).first();
    await row.locator('summary').click();
    await expect(row.getByTestId('declare-missing')).toBeVisible();
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

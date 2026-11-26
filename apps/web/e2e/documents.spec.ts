import type { Page } from '@playwright/test';
import { samplePdf } from '../../api/src/seed/sample-pdf';
import { WEB_URL } from './support/env';
import { calm, chooseOption, expect, expectAccessible, expectNoSideways, seedPlain, seedScanned, signIn, sql, test } from './support/helpers';

const FOUNDER_SLOT = 'gb_founder_ip_assignment';
const FOUNDER_RULE = 'GB.IP.FOUNDER_ASSIGNMENT';

function signedPdf(): { name: string; mimeType: string; buffer: Buffer } {
  return { name: 'founder-ip-assignment.pdf', mimeType: 'application/pdf', buffer: samplePdf(["Founders' IP assignment", 'Signed by Amara Okafor']) };
}

interface VaultDoc {
  id: string;
  status: string;
  slotKey: string | null;
  fileName: string | null;
}

async function documentsOf(page: Page, companyId: string): Promise<VaultDoc[]> {
  return ((await (await page.request.get(`${WEB_URL}/v1/companies/${companyId}/documents`)).json()) as { documents: VaultDoc[] }).documents;
}

async function checkScreen(page: Page): Promise<void> {
  await expectAccessible(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoSideways(page);
  await page.setViewportSize({ width: 1440, height: 900 });
}

/** The row for one slot, showing more of the list until it's there. */
async function slotRow(page: Page, slotKey: string) {
  const row = page.locator(`[data-slot="${slotKey}"]`);
  await expect(page.getByTestId('slot-row').first()).toBeVisible();
  const more = page.getByRole('button', { name: /^Show \d+ more of \d+$/ });
  while ((await row.count()) === 0 && (await more.count()) > 0) await more.click();
  await expect(row).toBeVisible();
  return row;
}

/** The row's status word, in its own column. */
function statusOf(row: ReturnType<Page['locator']>) {
  return row.getByRole('cell').nth(4);
}

/** Opens the row and gives back what it shows underneath. */
async function openSlot(page: Page, slotKey: string) {
  const row = await slotRow(page, slotKey);
  await row.getByTestId('slot-toggle').click();
  await expect(row.getByTestId('slot-toggle')).toHaveAttribute('aria-expanded', 'true');
  return { row, body: page.locator(`#slot-${slotKey}`) };
}

test('Documents lists the slots, with an empty one as "Not checked yet" and never held against you', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedPlain(page);
  await page.goto('/documents');
  await expect(page.getByTestId('documents-count')).toHaveText(/^0 of \d+ documents in place$/);
  await expect(page.locator('main')).toContainText('Empty slots never lower the score.');
  await expect(page.locator('main')).not.toContainText('counts as a gap until');

  const { row, body } = await openSlot(page, FOUNDER_SLOT);
  await expect(statusOf(row)).toHaveText('Not checked yet');
  // Only saying "we don't have it" makes an empty slot count, and it says so first.
  await expect(body.getByTestId('declare-missing')).toContainText('If you don\'t have it, tell us and it becomes a gap');
  await expect(row.getByRole('link', { name: 'Upload', exact: true })).toHaveAttribute('href', new RegExp(`slot=${FOUNDER_SLOT}`));

  // The list really filters.
  const filters = page.getByRole('tablist', { name: 'Filter documents' });
  await filters.getByRole('tab', { name: /^In order/ }).click();
  await expect(page.getByTestId('empty-state')).toContainText('Nothing in order yet');
  await filters.getByRole('tab', { name: /^Missing/ }).click();
  await expect(page.getByTestId('slot-row').first()).toBeAttached();
  expect(companyId).toBeTruthy();
});

test('"We don\'t have it" on a slot shows as declared, and can be undone', async ({ page }) => {
  await calm(page);
  await signIn(page);
  await seedPlain(page);
  await page.goto('/documents');
  const { row, body } = await openSlot(page, FOUNDER_SLOT);
  await expect(body).toContainText('it becomes a gap, which may lower your score');
  await body.getByRole('button', { name: "We don't have it" }).click();
  await expect(statusOf(row)).toHaveText("You don't have this", { timeout: 60_000 });
  await expect(body.getByRole('button', { name: 'Undo this' })).toHaveCount(1);
});

test('adding a document: upload, read, confirm, filed, and it can be downloaded and removed', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedPlain(page);
  await page.goto(`/documents/add?company=${companyId}&slot=${FOUNDER_SLOT}&rule=${encodeURIComponent(FOUNDER_RULE)}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(/^Add the founders' IP assignments?$/);
  await expect(page.getByTestId('connection-row').first()).toContainText("isn't connected yet");

  await page.locator('input[type="file"]').setInputFiles(signedPdf());
  const confirm = page.getByTestId('confirm-document');
  await expect(confirm).toBeVisible({ timeout: 60_000 });
  await expect(confirm).toContainText('founder-ip-assignment.pdf');
  await expect(page.locator('body')).not.toContainText('Coming next');

  // Nothing counts until a person says so.
  expect((await documentsOf(page, companyId))[0]?.status).toBe('needs_confirmation');
  await confirm.getByRole('button', { name: 'Yes, file it' }).click();
  await expect(page.getByTestId('drop-done')).toContainText("Filed as the founders' IP assignment");
  await expect(page.getByTestId('drop-done').getByRole('link', { name: 'Back to the finding' })).toBeVisible();
  expect((await documentsOf(page, companyId))[0]).toMatchObject({ status: 'filed', slotKey: FOUNDER_SLOT });

  await page.goto('/documents');
  await expect(page.getByTestId('documents-count')).toHaveText(/^1 of \d+ documents in place$/);
  const { row, body } = await openSlot(page, FOUNDER_SLOT);
  await expect(statusOf(row)).toHaveText('We read it');
  await expect(row).toContainText('Shared by you');
  await expect(row).toContainText('Read and in order');
  await expect(body).toContainText('founder-ip-assignment.pdf');
  await expect(row.getByRole('button', { name: 'Download' })).toBeVisible();

  const direct = await page.request.get(`${WEB_URL}/v1/documents/${(await documentsOf(page, companyId))[0]?.id ?? ''}/download`);
  expect(direct.ok()).toBe(true);

  await body.getByRole('button', { name: 'Remove this document' }).click();
  await expect(body.getByTestId('remove-confirm')).toContainText('It will stop counting towards the score.');
  await body.getByRole('button', { name: 'Yes, remove it' }).click();
  await expect(page.getByTestId('documents-count')).toHaveText(/^0 of \d+ documents in place$/);
  expect(await documentsOf(page, companyId)).toHaveLength(0);
});

test('"No, it\'s something else" lets the person choose where it belongs', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedPlain(page);
  await page.goto(`/documents/add?company=${companyId}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Add a document');
  await page.locator('input[type="file"]').setInputFiles(signedPdf());
  const confirm = page.getByTestId('confirm-document');
  await expect(confirm).toBeVisible({ timeout: 60_000 });
  await confirm.getByRole('button', { name: "No, it's something else" }).click();
  const select = confirm.getByLabel('Where does it belong?');
  await chooseOption(page, select, { value: 'gb_contractor_ip_assignment' });
  await confirm.getByRole('button', { name: 'File it here' }).click();
  await expect(page.getByTestId('drop-done')).toBeVisible();
  expect((await documentsOf(page, companyId))[0]?.slotKey).toBe('gb_contractor_ip_assignment');
});

test('a document waiting on its confirmation can be picked up from Documents', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedPlain(page);
  await page.goto(`/documents/add?company=${companyId}`);
  await page.locator('input[type="file"]').setInputFiles(signedPdf());
  await expect(page.getByTestId('confirm-document')).toBeVisible({ timeout: 60_000 });

  await page.goto('/documents');
  const waiting = page.getByTestId('documents-waiting');
  await expect(waiting).toContainText('It counts once you confirm where it belongs.');
  await waiting.getByRole('link', { name: 'Confirm' }).click();
  await page.waitForURL('**/documents/add**');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Where does this belong?');
  await expect(page.getByTestId('confirm-document')).toBeVisible();
});

test('an unsigned copy gets the not-accepted screen, says it was kept, and a person has the last word', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedPlain(page);
  await page.goto(`/documents/add?company=${companyId}&slot=${FOUNDER_SLOT}`);
  await page.locator('input[type="file"]').setInputFiles({ name: 'ip-draft.pdf', mimeType: 'application/pdf', buffer: samplePdf(["Founders' IP assignment", 'DRAFT', 'Signature: ____________']) });
  const confirm = page.getByTestId('confirm-document');
  await expect(confirm).toBeVisible({ timeout: 60_000 });

  const [document] = await documentsOf(page, companyId);
  const id = document?.id ?? '';
  // The hint decides nothing by itself, so a looks-unsigned reading is set directly to be sure of it.
  await sql(`UPDATE document SET extracted_fields = extracted_fields || '{"signature":"looks_unsigned"}'::jsonb WHERE id = $1`, [id]);
  await page.goto(`/documents/add?company=${companyId}&document=${id}&slot=${FOUNDER_SLOT}`);
  await page.getByTestId('confirm-document').getByRole('button', { name: /file it/i }).click();

  await page.waitForURL(`**/documents/${id}/rejected`);
  const screen = page.getByTestId('document-rejected');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName("This copy doesn't count yet");
  await expect(screen).toContainText("doesn't look signed yet");
  await expect(screen).toContainText('Vero kept this copy in your documents');
  expect(((await screen.innerText()).match(/you have the last word/gi) ?? []).length, 'never said twice').toBeLessThanOrEqual(1);
  await expect(screen.getByRole('link', { name: 'Upload the signed copy' })).toHaveAttribute('href', new RegExp(`slot=${FOUNDER_SLOT}`));
  expect((await documentsOf(page, companyId))[0]?.status).toBe('rejected');

  await screen.getByRole('button', { name: 'It is signed, file it' }).click();
  await page.waitForURL('**/documents');
  expect((await documentsOf(page, companyId))[0]?.status).toBe('filed');

  await page.goto(`/documents/${id}/rejected`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('This document was not turned away');
  await expect(page.getByTestId('not-rejected')).toContainText('Nothing to fix here');
});

test('Free has no vault: Documents and Add a document show the way to upgrade', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'free' });
  await page.goto('/documents');
  await expect(page.getByTestId('documents-locked')).toContainText('part of a paid plan');
  await expect(page.getByTestId('documents-locked').getByRole('link', { name: 'See the plans' })).toHaveAttribute('href', '/plan');
  await expect(page.getByTestId('slot-row')).toHaveCount(0);
  await expect(page.getByTestId('drop-zone')).toHaveCount(0);
  await page.goto(`/documents/add?company=${companyId}`);
  await expect(page.getByTestId('add-locked')).toContainText('part of a paid plan');
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
});

test('Documents and Add a document say so when they can\'t load, and retry', async ({ page, watch }) => {
  watch.allow(/status of 500/);
  await calm(page);
  await signIn(page);
  const { companyId } = await seedPlain(page);
  const failing = '**/v1/companies/*/documents';
  await page.route(failing, (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { code: 'internal_error', message: 'Something went wrong on our side. Please try again.' } }) }));
  await page.goto('/documents');
  await expect(page.getByTestId('error-state')).toContainText('Something went wrong on our side');
  await page.goto(`/documents/add?company=${companyId}`);
  await expect(page.getByTestId('error-state')).toBeVisible();
  await page.unroute(failing);
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByTestId('drop-zone')).toBeVisible();
});

for (const theme of ['light', 'dark'] as const) {
  test(`the documents flow passes axe and fits a phone, in ${theme}`, async ({ page }) => {
    test.setTimeout(420_000);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await signIn(page);
    const { companyId } = await seedPlain(page);

    await page.goto('/documents');
    await expect(page.getByTestId('documents-count')).toBeVisible();
    await checkScreen(page);
    await openSlot(page, FOUNDER_SLOT);
    await checkScreen(page);

    await page.goto(`/documents/add?company=${companyId}&slot=${FOUNDER_SLOT}`);
    await expect(page.getByTestId('drop-zone')).toBeVisible();
    await checkScreen(page);
    await page.locator('input[type="file"]').setInputFiles(signedPdf());
    await expect(page.getByTestId('confirm-document')).toBeVisible({ timeout: 60_000 });
    await checkScreen(page);
    await page.getByTestId('confirm-document').getByRole('button', { name: "No, it's something else" }).click();
    await checkScreen(page);

    const [document] = await documentsOf(page, companyId);
    await sql(`UPDATE document SET status = 'rejected', slot_id = (SELECT id FROM vault_slot WHERE key = $2 LIMIT 1), rejection_reason = 'This copy doesn''t look signed yet, so it doesn''t count.' WHERE id = $1`, [document?.id, FOUNDER_SLOT]);
    await page.goto(`/documents/${document?.id ?? ''}/rejected`);
    await expect(page.getByTestId('document-rejected')).toBeVisible();
    await checkScreen(page);
  });
}

test('Free screens pass axe too', async ({ page }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'free' });
  await page.goto('/documents');
  await expect(page.getByTestId('documents-locked')).toBeVisible();
  await checkScreen(page);
  await page.goto(`/documents/add?company=${companyId}`);
  await expect(page.getByTestId('add-locked')).toBeVisible();
  await checkScreen(page);
});

test('one failed read of a document in progress does not fail the upload', async ({ page, watch }) => {
  await calm(page);
  await signIn(page);
  const { companyId } = await seedPlain(page);
  watch.allow(/Failed to load resource/);
  let failures = 1;
  await page.route('**/v1/documents/*', (route) => {
    if (route.request().method() === 'GET' && failures > 0) {
      failures -= 1;
      return route.fulfill({ status: 500, json: { error: { code: 'internal', message: 'Something went wrong.' } } });
    }
    return route.continue();
  });
  await page.goto(`/documents/add?company=${companyId}&slot=${FOUNDER_SLOT}`);
  await page.locator('input[type="file"]').setInputFiles(signedPdf());
  await expect(page.getByTestId('confirm-document')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId('drop-failed')).toHaveCount(0);
  expect(failures).toBe(0);
});

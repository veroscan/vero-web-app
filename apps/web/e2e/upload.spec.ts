import { samplePdf } from '../../api/src/seed/sample-pdf';
import { WEB_URL } from './support/env';
import { calm, expect, seedScanned, signIn, test } from './support/helpers';

const MB = 1024 * 1024;

/** A real PDF, padded with a comment to the size asked for, as a person's large scan would be. */
function pdfOfSize(bytes: number): Buffer {
  const pdf = samplePdf(['Founders IP assignment', 'Signed by a made-up person, for a test']);
  return Buffer.concat([pdf, Buffer.from('\n%'), Buffer.alloc(bytes - pdf.length - 2, 0x20)]);
}

// Over the /v1 rewrite, Next.js cut every body at 10 MB, whatever the connection speed.
test('a 25 MB document uploads through the web server, even on a slow connection', async ({ page }) => {
  test.setTimeout(420_000);
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  await page.goto(`/documents/add?company=${companyId}`);
  await expect(page.getByTestId('drop-zone')).toBeVisible();

  // 3 Mbps takes about 70 seconds, well past the 30-second limit on a quiet connection to the API.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: (3 * 1_000_000) / 8 });

  const size = 25 * MB;
  const started = Date.now();
  await page.locator('input[type="file"]').setInputFiles({ name: 'large-scan.pdf', mimeType: 'application/pdf', buffer: pdfOfSize(size) });
  await expect(page.getByText('Reading your document').or(page.getByTestId('drop-done')).or(page.getByTestId('drop-failed')).first()).toBeVisible({ timeout: 240_000 });
  const took = Date.now() - started;
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  await expect(page.getByTestId('drop-failed')).toHaveCount(0);
  expect(took, 'the upload really was slow').toBeGreaterThan(30_000);

  const vault = (await (await page.request.get(`${WEB_URL}/v1/companies/${companyId}/documents`)).json()) as { documents: { fileName: string; sizeBytes: number }[] };
  const stored = vault.documents.find((document) => document.fileName === 'large-scan.pdf');
  expect(stored?.sizeBytes, 'every byte arrived').toBe(size);
});

test('a file one byte over the limit is refused before anything is sent', async ({ page }) => {
  test.setTimeout(180_000);
  await calm(page);
  await signIn(page);
  const { companyId } = await seedScanned(page, { plan: 'growth' });
  await page.goto(`/documents/add?company=${companyId}`);
  await expect(page.getByTestId('drop-zone')).toBeVisible();
  // Sent, the API's refusal can race the rewrite and come back as a 500. So it must never be sent.
  let sent = false;
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('too-big.pdf')) sent = true;
  });
  await page.locator('input[type="file"]').setInputFiles({ name: 'too-big.pdf', mimeType: 'application/pdf', buffer: pdfOfSize(25 * MB + 1) });
  await expect(page.getByTestId('drop-failed')).toContainText('That file is too big to upload. The limit is 25 MB');
  expect(sent, 'the file stayed in the browser').toBe(false);
});

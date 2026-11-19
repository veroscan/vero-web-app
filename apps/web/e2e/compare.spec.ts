import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import type { Browser, Page } from '@playwright/test';
import { REPO_ROOT, WEB_DIR, WEB_URL as WEB_URL_FOR_COMPARE } from './support/env';
import { samplePdf } from '../../api/src/seed/sample-pdf';
import { apiJson, expect, holdWithUrgentGaps, linkFromOutbox, requestLink, seedAnswered, seedPlain, signIn, sql, test, uniqueEmail } from './support/helpers';

const OUT = resolve(WEB_DIR, 'e2e', '.out', 'compare');
const DESIGN_DIR = resolve(REPO_ROOT, 'docs', 'design');
const FONT_DIR = resolve(REPO_ROOT, 'node_modules', '@fontsource', 'figtree', 'files');
const TYPES: Record<string, string> = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

/** Draws an approved design the way its runtime would, with the 3D script left out. */
async function renderDesign(browser: Browser, file: string, theme: 'light' | 'dark', height: number): Promise<Buffer> {
  const context = await browser.newContext({ viewport: { width: 1440, height }, colorScheme: theme, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const source = readFileSync(resolve(DESIGN_DIR, `${file}.dc.html`), 'utf8');
  const helmet = /<helmet>([\s\S]*?)<\/helmet>/.exec(source)?.[1] ?? '';
  const body = (/<x-dc>[\s\S]*?<\/helmet>([\s\S]*?)<\/x-dc>/.exec(source)?.[1] ?? '').replaceAll('{{theme}}', theme);
  const fonts = [400, 500, 600, 700].map((weight) => `@font-face{font-family:Figtree;font-weight:${weight};src:url(/figtree/figtree-latin-${weight}-normal.woff2)}`).join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${fonts}</style><link rel="stylesheet" href="/vero.css">${helmet.replace(/<link[^>]*fonts\.googleapis[^>]*>/, '')}</head><body>${body}<script src="/vero-ui.js"></script></body></html>`;
  await page.route('http://design.local/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/') return route.fulfill({ contentType: 'text/html', body: html });
    const full = path.startsWith('/figtree/') ? resolve(FONT_DIR, path.slice('/figtree/'.length)) : resolve(DESIGN_DIR, path.slice(1));
    return route.fulfill({ contentType: TYPES[extname(full)] ?? 'application/octet-stream', body: readFileSync(full) });
  });
  await page.goto('http://design.local/');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForTimeout(600);
  const shot = await page.screenshot({ fullPage: true });
  await context.close();
  return shot;
}

async function sideBySide(page: Page, name: string, built: Buffer, design: Buffer): Promise<void> {
  const tile = (label: string, png: Buffer) => `<figure style="margin:0;width:50%"><figcaption style="font:600 18px sans-serif;padding:8px;background:#222;color:#fff">${label}</figcaption><img style="width:100%;display:block" src="data:image/png;base64,${png.toString('base64')}"></figure>`;
  const sheet = await page.context().newPage();
  await sheet.setViewportSize({ width: 1600, height: 900 });
  await sheet.setContent(`<body style="margin:0;display:flex;align-items:flex-start;background:#888">${tile('BUILT', built)}${tile('DESIGN', design)}</body>`);
  await sheet.waitForTimeout(150);
  writeFileSync(resolve(OUT, `${name}.png`), await sheet.screenshot({ fullPage: true }));
  await sheet.close();
}

const seen = (page: Page) => page.waitForLoadState('networkidle').catch(() => undefined);

test('built screens beside their designs, light and dark', async ({ page, browser, watch }) => {
  test.setTimeout(900_000);
  watch.allow(/status of 400/);
  mkdirSync(OUT, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const shoot = async (name: string, file: string, ready: () => Promise<void>, height = 900) => {
    for (const theme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 1440, height });
      await page.reload();
      await ready();
      await seen(page);
      await page.waitForTimeout(500);
      const built = await page.screenshot({ fullPage: true });
      await sideBySide(page, `${name}-${theme}`, built, await renderDesign(browser, file, theme, height));
    }
  };

  await page.goto('/sign-in');
  await shoot('01-sign-in', 'SignIn', () => expect(page.getByLabel('Work email')).toBeVisible());

  const email = uniqueEmail('compare');
  await requestLink(page, email);
  // A reload would lose this state, so the theme changes in place.
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.waitForTimeout(400);
    await sideBySide(page, `01b-check-email-${theme}`, await page.screenshot({ fullPage: true }), await renderDesign(browser, 'SignIn', theme, 900));
  }
  const link = await linkFromOutbox(email);
  await sql(`UPDATE magic_link SET expires_at = now() - interval '1 minute' WHERE email = $1`, [email]);
  await page.goto(link);
  await shoot('01c-expired-link', 'SignIn', () => expect(page.getByTestId('link-expired')).toBeVisible());
  await page.goto('/sign-in');
  await requestLink(page, email);
  await page.goto(await linkFromOutbox(email));
  await page.waitForURL('**/onboarding/company');

  await page.goto('/');
  await shoot('02-home-empty', 'HomeEmpty', () => expect(page.getByRole('link', { name: /Scan your company/ })).toBeVisible());

  await page.goto('/onboarding/company');
  await shoot('03-find-company', 'FindCompany', () => expect(page.getByRole('radiogroup')).toBeVisible());
  await page.goto('/onboarding/not-found?country=GB&q=Kestrel%20Pay&source=Companies%20House');
  await shoot('04-not-found', 'NotFound', () => expect(page.getByRole('heading', { level: 1 })).toBeVisible(), 969);
  await page.goto('/onboarding/confirm?country=US-DE&name=Kestrel%20Pay%20Inc.&number=7741209&type=corporation&formed=2022-08-16&agent=Northwood%20Agents%20LLC&source=our%20licensed%20data%20provider&sample=1');
  await shoot('05-confirm', 'ConfirmCompany', () => expect(page.getByRole('button', { name: "Yes, that's us" })).toBeVisible(), 1000);

  const company = await seedAnswered(page, 'Kestrel Pay UK Ltd');
  await page.goto('/onboarding/questions');
  await shoot('06-question', 'Question', () => expect(page.locator('[data-step]')).toBeVisible());
  await page.goto('/onboarding/scanning');
  await shoot('07-scanning', 'Scanning', () => expect(page.getByRole('link', { name: 'See your result' })).toBeVisible());

  const [scan] = await sql<{ id: string }>('SELECT id FROM scan WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1', [company.id]);
  await sql(`UPDATE source_result SET status = 'error' WHERE scan_id = $1 AND connector_id = 'uk.ico_register'`, [scan?.id]);
  await sql(`UPDATE scan SET status = 'partial' WHERE id = $1`, [scan?.id]);
  await page.goto('/onboarding/scanning');
  await shoot('08-scan-partial', 'ScanPartial', () => expect(page.getByTestId('scan-partial')).toBeVisible());

  await page.goto('/first-result');
  await shoot('09-first-result', 'FirstResult', () => expect(page.getByTestId('top-issue').first()).toBeVisible(), 1000);

  await sql(`UPDATE organisation SET plan_id = (SELECT id FROM plan WHERE code = 'growth') WHERE id = $1`, [company.organisationId]);
  await page.goto('/');
  await shoot('10-home', 'Main', () => expect(page.getByTestId('home-score')).toBeVisible(), 1451);
  await page.goto('/issues');
  await shoot('11-issues', 'Issues', () => expect(page.getByTestId('issue-row').first()).toBeVisible(), 2037);
  const list = (await (await page.request.get(`/v1/companies/${company.id}/issues`)).json()) as { issues: { ruleKey: string }[] };
  await page.goto(`/issues/${company.id}/${encodeURIComponent(list.issues[0]?.ruleKey ?? '')}`);
  await shoot('12-issue', 'Issue', () => expect(page.getByRole('heading', { name: 'How we know' })).toBeVisible(), 1305);
  await page.goto('/areas/2');
  await shoot('13-area', 'Area', () => expect(page.getByRole('heading', { name: 'To fix' })).toBeVisible(), 1284);
  await page.goto('/areas/1');
  await shoot('13b-area-scored', 'Area', () => expect(page.getByTestId('area-score')).toBeVisible(), 1284);
  // The new states: a document we haven't seen, then an urgent gap holding the score.
  const founders = 'GB.IP.FOUNDER_ASSIGNMENT';
  await page.goto(`/issues/${company.id}/${encodeURIComponent(founders)}`);
  await shoot('15-issue-not-seen', 'Issue', () => expect(page.getByTestId('declare-missing')).toBeVisible(), 1305);
  await page.getByRole('button', { name: "We don't have it" }).click();
  await expect(page.getByTestId('declared-missing')).toBeVisible({ timeout: 60_000 });
  await shoot('16-issue-declared', 'Issue', () => expect(page.getByTestId('declared-missing')).toBeVisible(), 1305);
  // Declaring it lowers this company past the cap, so the hold needs everything else passing.
  const [latest] = await sql<{ id: string }>('SELECT id FROM scan WHERE company_id = $1 ORDER BY finalised_seq DESC NULLS LAST LIMIT 1', [company.id]);
  await holdWithUrgentGaps(latest?.id ?? '', [founders]);
  await page.goto('/');
  await shoot('17-home-held', 'Main', () => expect(page.getByTestId('score-held')).toBeVisible(), 1451);
  await page.goto('/notifications');
  await shoot('14-notifications', 'Notifications', () => expect(page.getByTestId('notification').first()).toBeVisible(), 1100);
});

test('the documents flow beside its designs, light and dark', async ({ page, browser }) => {
  test.setTimeout(600_000);
  mkdirSync(OUT, { recursive: true });
  const shoot = async (name: string, file: string, ready: () => Promise<void>, height = 900, reload = true) => {
    for (const theme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 1440, height });
      if (reload) await page.reload();
      await ready();
      await seen(page);
      await page.waitForTimeout(400);
      await sideBySide(page, `${name}-${theme}`, await page.screenshot({ fullPage: true }), await renderDesign(browser, file, theme, height));
    }
  };
  await signIn(page);
  const { companyId } = await seedPlain(page);
  const rule = encodeURIComponent('GB.IP.FOUNDER_ASSIGNMENT');
  await page.goto('/documents');
  await shoot('20-documents', 'Documents', () => expect(page.getByTestId('documents-count')).toBeVisible(), 1841);
  await page.goto(`/documents/add?company=${companyId}&slot=gb_founder_ip_assignment&rule=${rule}`);
  await shoot('21-add-document', 'AddDocument', () => expect(page.getByTestId('drop-zone')).toBeVisible(), 911);
  await page.locator('input[type="file"]').setInputFiles({ name: 'founder-ip-assignment.pdf', mimeType: 'application/pdf', buffer: samplePdf(["Founders' IP assignment", 'Signed by Amara Okafor']) });
  await expect(page.getByTestId('confirm-document')).toBeVisible({ timeout: 60_000 });
  await shoot('22-add-confirm', 'AddDocument', () => expect(page.getByTestId('confirm-document')).toBeVisible(), 911, false);
  const [document] = await sql<{ id: string }>('SELECT id FROM document WHERE company_id = $1', [companyId]);
  await sql(`UPDATE document SET status = 'rejected', extracted_fields = extracted_fields || '{"signature":"looks_unsigned"}'::jsonb, slot_id = (SELECT id FROM vault_slot WHERE key = 'gb_founder_ip_assignment' LIMIT 1), rejection_reason = 'This copy doesn''t look signed yet, so it doesn''t count. We''ve kept it here. Upload the signed copy, or tell us it is signed.' WHERE id = $1`, [document?.id]);
  await page.goto(`/documents/${document?.id ?? ''}/rejected`);
  await shoot('23-rejected', 'DocumentRejected', () => expect(page.getByTestId('document-rejected')).toBeVisible());
  await page.goto('/documents');
  await shoot('28-documents-after', 'Documents', () => expect(page.getByTestId('documents-count')).toBeVisible(), 1841);

  // Phone width, built only: there's no phone design for these.
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByTestId('slot-row').first()).toBeVisible();
  await page.getByTestId('slot-toggle').first().click();
  await page.waitForTimeout(300);
  writeFileSync(resolve(OUT, '29-documents-phone.png'), await page.screenshot({ clip: { x: 0, y: 0, width: 390, height: 1500 }, fullPage: true }));
  await page.goto(`/documents/${document?.id ?? ''}/rejected`);
  await expect(page.getByTestId('document-rejected')).toBeVisible();
  writeFileSync(resolve(OUT, '31-rejected-phone.png'), await page.screenshot({ fullPage: true }));
});

test('deadlines and company records beside their designs, light and dark', async ({ page, browser }) => {
  test.setTimeout(600_000);
  mkdirSync(OUT, { recursive: true });
  const shoot = async (name: string, file: string, ready: () => Promise<void>, height: number) => {
    for (const theme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 1440, height });
      await page.reload();
      await ready();
      await seen(page);
      await page.waitForTimeout(400);
      await sideBySide(page, `${name}-${theme}`, await page.screenshot({ fullPage: true }), await renderDesign(browser, file, theme, height));
    }
  };
  const seed = async (legalName: string, incorporationCountry: string, parentCompanyId?: string) => {
    const company = await apiJson<{ id: string; organisationId: string }>(page, 'post', '/v1/companies', { legalName, incorporationCountry, registrationNumber: `${Date.now()}`.slice(-8), ...(parentCompanyId ? { parentCompanyId } : {}) });
    const scan = await apiJson<{ id: string }>(page, 'post', `/v1/companies/${company.id}/scans`);
    await expect.poll(async () => (await apiJson<{ status: string }>(page, 'get', `/v1/scans/${scan.id}`)).status, { timeout: 60_000 }).toMatch(/completed|partial/);
    return company;
  };
  await signIn(page);
  const inc = await seed('Kestrel Pay Inc.', 'US-DE');
  const uk = await seed('Kestrel Pay UK Ltd', 'GB', inc.id);
  const ng = await seed('Kestrel Pay Nigeria Ltd', 'NG', inc.id);
  await sql(`UPDATE organisation SET plan_id = (SELECT id FROM plan WHERE code = 'growth') WHERE id = $1`, [inc.organisationId]);

  await page.goto('/deadlines');
  await shoot('32-deadlines', 'Deadlines', () => expect(page.getByRole('heading', { level: 1, name: 'Deadlines' })).toBeVisible(), 1764);
  await page.goto(`/company/${inc.id}`);
  await shoot('33-records-delaware', 'RecordsDelaware', () => expect(page.getByTestId('records-list')).toBeVisible(), 1242);
  await page.goto(`/company/${uk.id}`);
  await shoot('34-records-uk', 'RecordsUK', () => expect(page.getByTestId('records-list')).toBeVisible(), 1192);
  await page.goto(`/company/${ng.id}`);
  await shoot('35-records-nigeria', 'RecordsNigeria', () => expect(page.getByTestId('records-list')).toBeVisible(), 1242);

  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/deadlines');
  await expect(page.getByTestId('deadline-row').first()).toBeVisible();
  writeFileSync(resolve(OUT, '36-deadlines-phone.png'), await page.screenshot({ fullPage: true }));
  await page.goto(`/company/${uk.id}`);
  await expect(page.getByTestId('records-list')).toBeVisible();
  writeFileSync(resolve(OUT, '37-records-phone.png'), await page.screenshot({ fullPage: true }));
});

test('trust and account beside their designs, light and dark', async ({ page, browser }) => {
  test.setTimeout(600_000);
  mkdirSync(OUT, { recursive: true });
  const shoot = async (name: string, file: string, ready: () => Promise<void>, height: number) => {
    for (const theme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 1440, height });
      await page.reload();
      await ready();
      await seen(page);
      await page.waitForTimeout(400);
      await sideBySide(page, `${name}-${theme}`, await page.screenshot({ fullPage: true }), await renderDesign(browser, file, theme, height));
    }
  };
  await signIn(page);
  const seed = await seedPlain(page);
  await page.goto(`/documents/add?company=${seed.companyId}&slot=gb_founder_ip_assignment`);
  await page.locator('input[type="file"]').setInputFiles({ name: 'founder-ip-assignment.pdf', mimeType: 'application/pdf', buffer: samplePdf(["Founders' IP assignment", 'Signed by Amara Okafor']) });
  await page.getByTestId('confirm-document').getByRole('button', { name: 'Yes, file it' }).click({ timeout: 60_000 });
  await expect(page.getByTestId('drop-done')).toBeVisible({ timeout: 60_000 });

  await page.goto('/badge');
  await shoot('39-badge', 'Badge', () => expect(page.getByTestId('badge-hero')).toBeVisible(), 1210);
  await page.getByRole('button', { name: 'Make a public link' }).click();
  const shared = await page.getByTestId('share-fresh').locator('input').inputValue();
  await page.goto(shared);
  await shoot('40-shared-report', 'SharedReport', () => expect(page.getByTestId('shared-report')).toBeVisible(), 1500);
  await page.goto('/settings');
  await shoot('41-settings', 'Settings', () => expect(page.getByTestId('member-row')).toHaveCount(1), 1500);
  await page.goto('/plan');
  await shoot('42-plan', 'Plan', () => expect(page.getByTestId('plan-page')).toBeVisible(), 1500);

  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 812 });
  for (const [name, path, ready] of [['44-badge-phone', '/badge', 'badge-hero'], ['45-report-phone', shared, 'shared-report'], ['46-settings-phone', '/settings', 'settings'], ['47-plan-phone', '/plan', 'plan-page']] as const) {
    await page.goto(path);
    await expect(page.getByTestId(ready)).toBeVisible();
    await page.waitForTimeout(500);
    writeFileSync(resolve(OUT, `${name}.png`), await page.screenshot({ fullPage: true }));
  }
});

test('admin and report beside their designs, light and dark', async ({ page, browser }) => {
  test.setTimeout(600_000);
  mkdirSync(OUT, { recursive: true });
  await signIn(page);
  await seedPlain(page);

  const shots = async (target: Page, name: string, file: string, ready: () => Promise<void>, height: number, width = 1440) => {
    for (const theme of ['light', 'dark'] as const) {
      await target.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await target.setViewportSize({ width, height });
      await target.reload();
      await ready();
      await seen(target);
      await target.waitForTimeout(400);
      await sideBySide(target, `${name}-${theme}`, await target.screenshot({ fullPage: true }), await renderDesign(browser, file, theme, height));
    }
  };
  await page.goto('/report');
  await shots(page, '48-report', 'ReportPDF', () => expect(page.getByTestId('report-page-2')).toBeVisible(), 1123);

  const context = await browser.newContext({ baseURL: WEB_URL_FOR_COMPARE, reducedMotion: 'reduce' });
  const desk = await context.newPage();
  const email = await signIn(desk, uniqueEmail('admin'));
  await sql(`INSERT INTO platform_staff (user_id, role) SELECT id, 'admin' FROM "user" WHERE email = $1`, [email]);
  await desk.goto('/admin');
  await shots(desk, '51-admin', 'Admin', () => expect(desk.getByTestId('admin')).toBeVisible(), 1400);

  await desk.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await desk.setViewportSize({ width: 375, height: 812 });
  for (const [name, path, ready] of [['54-admin-phone', '/admin', 'admin']] as const) {
    await desk.goto(path);
    await expect(desk.getByTestId(ready)).toBeVisible();
    await desk.waitForTimeout(400);
    writeFileSync(resolve(OUT, `${name}.png`), await desk.screenshot({ fullPage: name !== '54-admin-phone' }));
  }
  await context.close();
  await page.emulateMedia({ colorScheme: 'light', media: 'print', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.goto('/report');
  await expect(page.getByTestId('report-page-2')).toBeVisible();
  await page.waitForTimeout(400);
  writeFileSync(resolve(OUT, '55-report-print.png'), await page.screenshot({ fullPage: true }));
  await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/report');
  await expect(page.getByTestId('report-page-2')).toBeVisible();
  writeFileSync(resolve(OUT, '56-report-phone.png'), await page.screenshot({ fullPage: true }));
});

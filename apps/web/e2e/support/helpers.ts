import { AxeBuilder } from '@axe-core/playwright';
import { test as base, expect, type Locator, type Page } from '@playwright/test';
import pg from 'pg';
import { SUPERUSER_URL, WEB_URL } from './env';

let counter = 0;
export function uniqueEmail(label: string): string {
  counter += 1;
  return `${label}-${Date.now()}-${process.pid}-${counter}@example.test`;
}

export async function sql<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, values: unknown[] = []): Promise<T[]> {
  const client = new pg.Client({ connectionString: SUPERUSER_URL });
  await client.connect();
  try {
    return (await client.query<T>(text, values)).rows;
  } finally {
    await client.end();
  }
}

/** The link from the real outbox, as a person would get it by email. */
export async function linkFromOutbox(email: string): Promise<string> {
  await expect
    .poll(async () => (await sql('SELECT 1 FROM outbox WHERE to_email = $1', [email])).length, { timeout: 30_000 })
    .toBeGreaterThan(0);
  const [row] = await sql<{ body_text: string }>('SELECT body_text FROM outbox WHERE to_email = $1 ORDER BY created_at DESC LIMIT 1', [email]);
  const link = /https?:\/\/\S*\/sign-in\/verify\?token=\S+/.exec(row?.body_text ?? '')?.[0];
  if (!link) throw new Error('No sign-in link in the outbox');
  return link;
}

export interface Watch {
  /** Failures this test causes on purpose, such as a refused link. */
  allow: (pattern: RegExp) => void;
}

interface Fixtures {
  watch: Watch;
}

/** Every test fails on any console error. */
export const test = base.extend<Fixtures>({
  watch: [
    async ({ page }, use) => {
      const problems: string[] = [];
      const allowed: RegExp[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') problems.push(`console: ${message.text()}`);
      });
      page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
      await use({ allow: (pattern) => allowed.push(pattern) });
      const real = problems.filter((problem) => !allowed.some((pattern) => pattern.test(problem)));
      expect(real, 'no console errors on this screen').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

/** Motion off, so screens settle at once and checks read final colours. */
export async function calm(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

export async function requestLink(page: Page, email: string): Promise<void> {
  await page.getByLabel('Work email').fill(email);
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click();
  await expect(page.getByTestId('check-email')).toBeVisible();
}

export async function signIn(page: Page, email: string = uniqueEmail('user')): Promise<string> {
  await page.goto('/sign-in');
  await requestLink(page, email);
  await page.goto(await linkFromOutbox(email));
  await page.waitForURL((url) => !url.pathname.startsWith('/sign-in'));
  return email;
}

export async function apiJson<T>(page: Page, method: 'post' | 'patch' | 'get', path: string, data?: unknown): Promise<T> {
  const response = await page.request[method](`${WEB_URL}${path}`, { headers: { origin: WEB_URL }, ...(data === undefined ? {} : { data }) });
  if (!response.ok()) throw new Error(`${method} ${path}: ${response.status()} ${await response.text()}`);
  return (await response.json()) as T;
}

const GB_ANSWERS = {
  entity_type_gb: 'ltd', user_countries: ['GB', 'NG'], investor_countries: ['none'], has_raised_or_raising: true, raised_priced_round: false,
  has_employees: true, employee_countries: ['GB'], has_contractors: true, contractor_countries: ['GB'], has_foreign_workers: false,
  revenue_band: 'under_1m', headcount_band: '1_10', processes_personal_data: true, data_subjects_gb_12m: 500, sensitive_data: ['none'],
  data_hosted_abroad: true, uses_processors: true, has_website: true, has_app: false, ai_roles: ['deployer'], ai_uses_third_party_models: true,
  staff_use_ai: true, automated_decisions: false, payments_mode: ['psp_only'], sectors: ['none'], customer_type: 'b2b', has_subscriptions: true,
  sells_to_enterprise: true, offers_api: true, user_generated_content: false,
};

export interface Seeded {
  companyId: string;
  organisationId: string;
  scanId: string;
}

/** A company with a finished scan, made through the real API. Quicker than the whole journey. */
export async function seedScanned(page: Page, options: { name?: string; plan?: 'free' | 'growth' | 'scale' } = {}): Promise<Seeded> {
  const { name = 'Kestrel Pay UK Ltd', plan = 'free' } = options;
  const company = await apiJson<{ id: string; organisationId: string }>(page, 'post', '/v1/companies', { legalName: name, incorporationCountry: 'GB', registrationNumber: `${Date.now()}`.slice(-8), yearEnd: { month: 3, day: 31 } });
  await apiJson(page, 'patch', `/v1/companies/${company.id}/questionnaire`, { answers: GB_ANSWERS });
  const scan = await apiJson<{ id: string }>(page, 'post', `/v1/companies/${company.id}/scans`);
  await expect
    .poll(async () => (await apiJson<{ status: string }>(page, 'get', `/v1/scans/${scan.id}`)).status, { timeout: 60_000 })
    .toMatch(/completed|partial/);
  if (plan !== 'free') await sql(`UPDATE organisation SET plan_id = (SELECT id FROM plan WHERE code = $1) WHERE id = $2`, [plan, company.organisationId]);
  return { companyId: company.id, organisationId: company.organisationId, scanId: scan.id };
}

/** Few rules apply, so few things are open: it scores high until something urgent is declared. */
const PLAIN_ANSWERS = {
  entity_type_gb: 'ltd', investor_countries: ['none'], has_raised_or_raising: false, has_employees: false, has_contractors: true, contractor_countries: ['GB'],
  revenue_band: 'under_1m', headcount_band: '1_10', processes_personal_data: false, has_website: false, has_app: false, ai_roles: ['none'], payments_mode: ['none'],
  sectors: ['none'], customer_type: 'b2b', has_subscriptions: false, sells_to_enterprise: false, offers_api: false, user_generated_content: false, user_countries: ['GB'],
};

/** Through the real pipeline, on a paid plan. */
export async function seedPlain(page: Page): Promise<Seeded> {
  const company = await apiJson<{ id: string; organisationId: string }>(page, 'post', '/v1/companies', { legalName: 'Plain Widgets Ltd', incorporationCountry: 'GB', registrationNumber: `${Date.now()}`.slice(-8) });
  await apiJson(page, 'patch', `/v1/companies/${company.id}/questionnaire`, { answers: PLAIN_ANSWERS });
  const scan = await apiJson<{ id: string }>(page, 'post', `/v1/companies/${company.id}/scans`);
  await expect.poll(async () => (await apiJson<{ status: string }>(page, 'get', `/v1/scans/${scan.id}`)).status, { timeout: 60_000 }).toMatch(/completed|partial/);
  await sql(`UPDATE organisation SET plan_id = (SELECT id FROM plan WHERE code = 'growth') WHERE id = $1`, [company.organisationId]);
  return { companyId: company.id, organisationId: company.organisationId, scanId: scan.id };
}

/**
 * Makes the urgent cap really bite: everything on the scan passes except these rules. The fixtures
 * can't reach this state, because a company with passes in every area needs real documents. The API
 * still works out every score and point from these rows. A re-score would replace them.
 */
export async function holdWithUrgentGaps(scanId: string, ruleKeys: string[]): Promise<void> {
  await sql(`UPDATE finding SET outcome = 'pass', scored = true WHERE scan_id = $1 AND outcome <> 'not_applicable'`, [scanId]);
  await sql(`UPDATE finding SET outcome = 'gap', scored = true WHERE scan_id = $1 AND rule_key = ANY($2)`, [scanId, ruleKeys]);
}

/** A company, but stopped before the scan: useful for driving the scanning screen itself. */
export async function seedAnswered(page: Page, name: string): Promise<{ id: string; organisationId: string }> {
  const company = await apiJson<{ id: string; organisationId: string }>(page, 'post', '/v1/companies', { legalName: name, incorporationCountry: 'GB' });
  await apiJson(page, 'patch', `/v1/companies/${company.id}/questionnaire`, { answers: GB_ANSWERS });
  return company;
}

/**
 * Switches off the related companies offered on the confirm screen. They come from real register
 * searches, so they arrive after the page does, and each click removes one from this list.
 */
export async function turnOffRelated(page: Page): Promise<void> {
  const on = page.getByRole('switch', { name: /^Include / }).and(page.locator('[aria-checked="true"]'));
  await expect(on.first()).toBeVisible();
  while ((await on.count()) > 0) await on.first().click();
}

/** The one country picker on the search screens, by the name it shows. */
export async function chooseCountry(page: Page, label: string): Promise<void> {
  await chooseOption(page, page.getByLabel('Country of registration'), label);
}

/**
 * Picks from the app's own dropdown (`@/components/Select`): opens it, then clicks the option shown
 * as `label`, or the one carrying `{ value }`. The list is drawn at the page root, so it is found from the page.
 */
export async function chooseOption(page: Page, trigger: Locator | string, choice: string | { value: string }): Promise<void> {
  const button = typeof trigger === 'string' ? page.getByTestId(trigger) : trigger;
  await button.click();
  const list = page.getByRole('listbox');
  await expect(list).toBeVisible();
  const options = list.getByRole('option');
  if (typeof choice === 'string') await options.filter({ has: page.getByText(choice, { exact: true }) }).click();
  else await options.and(page.locator(`[data-value="${choice.value}"]`)).click();
  await expect(list).toBeHidden();
}

/** Answers on screen until the flow moves on: the first choice, or Continue where there's none. */
export async function answerQuestions(page: Page, chooser: (fieldId: string) => number | 'skip' = () => 1): Promise<string[]> {
  const seen: string[] = [];
  for (let guard = 0; guard < 200; guard += 1) {
    const step = page.locator('[data-step]');
    await expect(step.or(page.getByTestId('q-continue')).or(page.getByTestId('scan-row')).or(page.getByText('Starting the scan')).first()).toBeVisible();
    if (!page.url().includes('/onboarding/questions')) return seen;
    if ((await step.count()) === 0) {
      // "Nothing more to ask": only the Continue button is left.
      if (await page.getByTestId('q-continue').isVisible().catch(() => false)) await page.getByTestId('q-continue').click().catch(() => undefined);
      continue;
    }
    const id = (await step.getAttribute('data-field').catch(() => null)) ?? '';
    if (!id) continue;
    seen.push(id);
    const choice = chooser(id);
    const options = step.locator('[role="radio"], [role="checkbox"]');
    const count = await options.count();
    const radio = count > 0 && (await options.first().getAttribute('role')) === 'radio';
    if (choice !== 'skip' && count > 0) await page.keyboard.press(String(choice));
    if (choice === 'skip' || !radio) {
      if (count > 0 && choice !== 'skip') await expect(options.nth(choice - 1)).toHaveAttribute('aria-checked', 'true');
      await page.getByTestId('q-continue').click();
    }
    await expect
      .poll(async () => {
        if (!page.url().includes('/onboarding/questions')) return 'left';
        return (await page.locator('[data-step]').getAttribute('data-field', { timeout: 1000 }).catch(() => id)) ?? id;
      })
      .not.toBe(id);
  }
  throw new Error('The questions never ended');
}

/** Fails on serious or critical problems. Motion is off first, so colours aren't mid-fade. */
export async function expectAccessible(page: Page): Promise<void> {
  // axe's peer dependency resolves to its own playwright-core, whose types differ only in name.
  const results = await new AxeBuilder({ page: page as never }).analyze();
  const bad = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
  expect(bad.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.slice(0, 3).map((node) => `${node.target.join(' ')}: ${node.failureSummary ?? ''}`) }))).toEqual([]);
}

/** No sideways scrolling at this width. */
export async function expectNoSideways(page: Page): Promise<void> {
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(sizes.scroll, 'page width against the window').toBeLessThanOrEqual(sizes.client);
}

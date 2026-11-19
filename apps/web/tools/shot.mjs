// Screenshots a page of the running dev app (http://localhost:3000) as the fictional demo user.
//
//   node apps/web/tools/shot.mjs <route without leading slash, or home> <out.png> [light|dark] [--email someone@example] [--width 1440] [--full] [--wait 2500]
//
// Signs in through the real magic link: asks the local API for a link, reads it from the dev
// outbox table, opens it, and keeps the session in tools/.shots/<email>.json for the next run.
// Development only: it talks to the local embedded Postgres with the dev superuser password.
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import pg from 'pg';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : fallback;
};
const VALUED = new Set(['--email', '--width', '--wait']);
const [path = '/', out = 'shot.png', theme = 'light'] = args.filter((a, i) => !a.startsWith('--') && !VALUED.has(args[i - 1]));
// Git Bash turns "/x" into a Windows path, so a route may be given without its slash ("issues", "home" for "/").
const route = /^[A-Za-z]:/.test(path) ? '/' : path === 'home' ? '/' : path.startsWith('/') ? path : `/${path}`;
const email = flag('email', 'amara@kestrelpay.example');
const width = Number(flag('width', '1440'));
const wait = Number(flag('wait', '2500'));
const full = args.includes('--full');
const base = process.env.WEB_URL ?? 'http://localhost:3000';
const here = dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const stateFile = resolve(here, '.shots', `${email.replace(/[^a-z0-9]/gi, '_')}.json`);
const dbUrl = process.env.SHOT_DB_URL ?? 'postgres://postgres:dev-only-superuser-password@localhost:54329/vero';

async function signIn(context) {
  const page = await context.newPage();
  const since = new Date(Date.now() - 2000);
  const response = await page.request.post(`${base}/v1/auth/magic-link/request`, { data: { email }, headers: { origin: base } });
  if (!response.ok()) throw new Error(`magic link request failed: ${response.status()}`);
  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  let link = null;
  for (let i = 0; i < 40 && !link; i += 1) {
    const { rows } = await client.query(`select body_text from outbox where to_email = $1 and created_at >= $2 order by created_at desc limit 1`, [email, since]);
    link = rows[0]?.body_text?.match(/https?:\/\/\S+sign-in\/verify\?token=[\w-]+/)?.[0] ?? null;
    if (!link) await new Promise((r) => setTimeout(r, 250));
  }
  await client.end();
  if (!link) throw new Error('no sign-in link reached the outbox');
  await page.goto(link.replace(/^https?:\/\/[^/]+/, base));
  await page.waitForURL((url) => !url.pathname.startsWith('/sign-in'), { timeout: 60000 });
  await page.close();
}

const browser = await chromium.launch();
try {
  mkdirSync(dirname(stateFile), { recursive: true });
  const fresh = !existsSync(stateFile);
  let context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme === 'dark' ? 'dark' : 'light', storageState: fresh ? undefined : stateFile });
  await context.addInitScript((t) => {
    try {
      localStorage.setItem('vero-theme', t);
    } catch {}
  }, theme);
  if (fresh) await signIn(context);
  const page = await context.newPage();
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 120000 });
  if (new URL(page.url()).pathname.startsWith('/sign-in') && !route.startsWith('/sign-in')) {
    await context.close();
    context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme === 'dark' ? 'dark' : 'light' });
    await context.addInitScript((t) => {
      try {
        localStorage.setItem('vero-theme', t);
      } catch {}
    }, theme);
    await signIn(context);
    const again = await context.newPage();
    await again.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 120000 });
    await again.waitForTimeout(wait);
    await again.screenshot({ path: out, fullPage: full });
  } else {
    await page.waitForTimeout(wait);
    await page.screenshot({ path: out, fullPage: full });
  }
  await context.storageState({ path: stateFile });
  console.log(`saved ${out} (${route}, ${theme}, ${email})`);
} finally {
  await browser.close();
}

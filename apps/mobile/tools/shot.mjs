// Screenshots a screen of the phone app's web preview (Expo on http://localhost:8081) at 390 x 844,
// signed in as a fictional demo user through the real native sign-in (link from the dev outbox,
// verified with the app's header, token put where the app keeps it on web).
//
//   node apps/mobile/tools/shot.mjs <route without leading slash, or home> <out.png> [light|dark] [--email x] [--wait 2500] [--full] [--signed-out]
//
// Development only: reads the local embedded Postgres with the dev superuser password.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../web/package.json', import.meta.url));
const { chromium } = require('@playwright/test');
const pg = require('pg');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : fallback;
};
const VALUED = new Set(['--email', '--wait']);
const [path = 'home', out = 'shot.png', theme = 'light'] = args.filter((a, i) => !a.startsWith('--') && !VALUED.has(args[i - 1]));
const route = path === 'home' ? '/' : `/${path.replace(/^[A-Za-z]:.*?\/Git\//, '').replace(/^\//, '')}`;
const email = flag('email', 'amara@kestrelpay.example');
const wait = Number(flag('wait', '2500'));
const full = args.includes('--full');
const signedOut = args.includes('--signed-out');
const app = process.env.MOBILE_URL ?? 'http://localhost:8081';
const apiUrl = process.env.API_URL ?? 'http://localhost:4000';
const dbUrl = process.env.SHOT_DB_URL ?? 'postgres://postgres:dev-only-superuser-password@localhost:54329/vero';
const NATIVE = { 'content-type': 'application/json', 'x-vero-client': 'mobile' };

async function nativeToken() {
  const since = new Date(Date.now() - 2000);
  const asked = await fetch(`${apiUrl}/v1/auth/magic-link/request`, { method: 'POST', headers: NATIVE, body: JSON.stringify({ email, app: true }) });
  if (asked.status !== 202) throw new Error(`link request failed: ${asked.status} ${await asked.text()}`);
  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();
  let token = null;
  for (let i = 0; i < 40 && !token; i += 1) {
    const { rows } = await client.query('select body_text from outbox where to_email = $1 and created_at >= $2 order by created_at desc limit 1', [email, since]);
    token = /token=([^\s&]+)/.exec(rows[0]?.body_text ?? '')?.[1] ?? null;
    if (!token) await new Promise((r) => setTimeout(r, 250));
  }
  await client.end();
  if (!token) throw new Error('no sign-in link reached the outbox');
  const verified = await fetch(`${apiUrl}/v1/auth/magic-link/verify`, { method: 'POST', headers: NATIVE, body: JSON.stringify({ token: decodeURIComponent(token) }) });
  const body = await verified.json();
  if (!body.sessionToken) throw new Error(`verify failed: ${verified.status} ${JSON.stringify(body)}`);
  return body.sessionToken;
}

// Sign-in links are rate limited per hour, so a working session is kept in tools/.shots and reused.
const cacheDir = new URL('./.shots/', import.meta.url);
const cacheFile = new URL(`${email.replace(/[^a-z0-9]/gi, '_')}.token`, cacheDir);
async function cachedToken() {
  try {
    const saved = readFileSync(cacheFile, 'utf8').trim();
    const me = await fetch(`${apiUrl}/v1/me`, { headers: { 'x-vero-client': 'mobile', authorization: `Bearer ${saved}` } });
    if (me.ok) return saved;
  } catch {}
  const fresh = await nativeToken();
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(cacheFile, fresh);
  return fresh;
}
const session = signedOut ? null : await cachedToken();
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: theme === 'dark' ? 'dark' : 'light', isMobile: true, hasTouch: true });
  await context.addInitScript(([t, s]) => {
    try {
      localStorage.setItem('vero.theme', t);
      if (s) localStorage.setItem('vero.session', s);
      else localStorage.removeItem('vero.session');
    } catch {}
  }, [theme, session]);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto(`${app}${route}`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: out, fullPage: full });
  console.log(`saved ${out} (${route}, ${theme}${signedOut ? ', signed out' : `, ${email}`})`);
  if (errors.length) console.log(`console errors:\n  ${errors.slice(0, 8).join('\n  ')}`);
} finally {
  await browser.close();
}

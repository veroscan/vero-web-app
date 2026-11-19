import { execSync, spawn } from 'node:child_process';
import { mkdirSync, openSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { bootstrapDatabase } from '../../../api/src/db/bootstrap';
import { clusterExists, initCluster, isClusterRunning, startCluster } from '../../../api/src/db/embedded';
import { runMigrations } from '../../../api/src/db/migrate';
import { syncReferenceData } from '../../../api/src/db/reference-sync';
import { API_DIR, API_URL, apiEnv, APP_URL, MIGRATOR_URL, PG_DIR, PG_PORT, PIDS_FILE, SUPER_PASSWORD, SUPERUSER_BOOTSTRAP_URL, WEB_DIR, WEB_PORT, WEB_URL, webEnv } from './env';

async function waitFor(what: string, url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status < 500) return;
    } catch {
      // Not up yet.
    }
    await new Promise((done) => setTimeout(done, 500));
  }
  throw new Error(`Timed out waiting for ${what} at ${url}`);
}

export default async function globalSetup(): Promise<void> {
  mkdirSync(dirname(PIDS_FILE), { recursive: true });
  mkdirSync(dirname(PG_DIR), { recursive: true });

  if (!clusterExists(PG_DIR)) await initCluster(PG_DIR, SUPER_PASSWORD);
  if (!(await isClusterRunning(PG_DIR))) await startCluster(PG_DIR, PG_PORT, resolve(dirname(PG_DIR), 'pg.log'));
  await bootstrapDatabase({ superuserUrl: SUPERUSER_BOOTSTRAP_URL, migratorUrl: MIGRATOR_URL, appUrl: APP_URL });
  await runMigrations(MIGRATOR_URL);
  await syncReferenceData(MIGRATOR_URL);

  // The web app reads the API's address when it's built, so each run builds against this one.
  // E2E_SKIP_BUILD=1 reuses the last build, for repeat runs with no change to the web app's code.
  if (process.env.E2E_SKIP_BUILD !== '1') execSync('npx next build', { cwd: WEB_DIR, env: webEnv(), stdio: 'inherit' });

  const apiLog = openSync(resolve(dirname(PIDS_FILE), 'api.log'), 'w');
  const api = spawn('npx', ['tsx', 'src/server.ts'], { cwd: API_DIR, env: apiEnv(), shell: true, stdio: ['ignore', apiLog, apiLog], windowsHide: true });
  const webLog = openSync(resolve(dirname(PIDS_FILE), 'web.log'), 'w');
  // The tests' own API client doesn't retry a socket the server has just closed, as browsers do, so
  // the 5-second default made its calls fail at random with ECONNRESET.
  const web = spawn('npx', ['next', 'start', '--port', String(WEB_PORT), '--keepAliveTimeout', '120000'], { cwd: WEB_DIR, env: webEnv(), shell: true, stdio: ['ignore', webLog, webLog], windowsHide: true });
  writeFileSync(PIDS_FILE, JSON.stringify({ api: api.pid, web: web.pid }));

  await waitFor('the API', `${API_URL}/healthz`, 180_000);
  await waitFor('the web app', `${WEB_URL}/sign-in`, 180_000);
}

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { clusterExists, isClusterRunning, stopCluster } from '../../../api/src/db/embedded';
import { PG_DIR, PIDS_FILE } from './env';

function stopTree(pid: number | undefined): void {
  if (!pid) return;
  try {
    if (process.platform === 'win32') execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    else process.kill(pid, 'SIGTERM');
  } catch {
    // Already gone.
  }
}

/** Leaves nothing running: the API, the web server and this run's own Postgres. */
export default async function globalTeardown(): Promise<void> {
  if (existsSync(PIDS_FILE)) {
    const pids = JSON.parse(readFileSync(PIDS_FILE, 'utf8')) as { api?: number; web?: number };
    stopTree(pids.web);
    stopTree(pids.api);
  }
  if (clusterExists(PG_DIR) && (await isClusterRunning(PG_DIR))) await stopCluster(PG_DIR);
}

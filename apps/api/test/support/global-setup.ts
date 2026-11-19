import { randomBytes } from 'node:crypto';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createServer } from 'node:net';
import { join, resolve } from 'node:path';
import type { TestProject } from 'vitest/node';
import { bootstrapDatabase } from '../../src/db/bootstrap';
import { initCluster, startCluster, stopCluster } from '../../src/db/embedded';
import { runMigrations } from '../../src/db/migrate';
import { syncReferenceData } from '../../src/db/reference-sync';

const OLD_RUN_MS = 6 * 60 * 60 * 1000;

declare module 'vitest' {
  export interface ProvidedContext {
    appUrl: string;
    migratorUrl: string;
    superuserUrl: string;
  }
}

function freePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolvePort(port));
    });
  });
}

/** A throwaway real Postgres with random passwords, using the same migrations as production. */
export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  const root = resolve(import.meta.dirname, '..', '..', '..', '..', '.data', 'test');
  mkdirSync(root, { recursive: true });
  sweepOldRuns(root);

  const runId = randomBytes(6).toString('hex');
  const dataDir = join(root, `pg-${runId}`);
  const logFile = join(root, `pg-${runId}.log`);
  const port = await freePort();
  const superPassword = randomBytes(18).toString('hex');
  const migratorPassword = randomBytes(18).toString('hex');
  const appPassword = randomBytes(18).toString('hex');

  await initCluster(dataDir, superPassword);
  await startCluster(dataDir, port, logFile);

  const superuserBase = `postgres://postgres:${superPassword}@localhost:${port}`;
  const migratorUrl = `postgres://vero_migrator:${migratorPassword}@localhost:${port}/vero_test`;
  const appUrl = `postgres://vero_app:${appPassword}@localhost:${port}/vero_test`;
  await bootstrapDatabase({ superuserUrl: `${superuserBase}/postgres`, migratorUrl, appUrl });
  await runMigrations(migratorUrl);
  await syncReferenceData(migratorUrl);

  project.provide('appUrl', appUrl);
  project.provide('migratorUrl', migratorUrl);
  // Superuser access is for test assertions only: it can look past RLS to check what is stored.
  project.provide('superuserUrl', `${superuserBase}/vero_test`);

  return async () => {
    // A server left running is a real problem, so a failure to stop still fails the run.
    await stopCluster(dataDir);
    removeQuietly(dataDir);
    removeQuietly(logFile);
  };
}

/**
 * Windows can hold a just-stopped server's folder locked for a while. A throwaway folder
 * that outlives a run says nothing about the code under test, so it must not fail the run:
 * the next run sweeps it up once it is old.
 */
function removeQuietly(path: string): void {
  try {
    rmSync(path, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  } catch {
    console.warn(`Could not remove ${path} yet. A later test run will clear it.`);
  }
}

/** Age-based, so a second test run started at the same moment cannot delete a live database. */
function sweepOldRuns(root: string): void {
  const cutoff = Date.now() - OLD_RUN_MS;
  for (const name of readdirSync(root)) {
    const path = join(root, name);
    if (statSync(path).mtimeMs < cutoff) removeQuietly(path);
  }
}

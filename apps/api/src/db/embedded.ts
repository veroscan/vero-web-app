import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

/**
 * Development and test only: runs the real Postgres binaries from the embedded-postgres
 * npm packages. Driving pg_ctl directly gives a server that outlives `npm run db:start`
 * and shuts down cleanly, which also releases the data folder on Windows.
 * Not exported from the package entry, so production code never loads it.
 */
interface Binaries {
  initdb: string;
  pg_ctl: string;
}

async function binaries(): Promise<Binaries> {
  const platform = process.platform === 'win32' ? 'windows' : process.platform;
  const module = (await import(`@embedded-postgres/${platform}-${process.arch}`)) as Binaries;
  return { initdb: module.initdb, pg_ctl: module.pg_ctl };
}

/**
 * Waits on exit rather than stream close: the server inherits handles from pg_ctl, so
 * waiting for streams to close would hang for as long as the server runs.
 */
function run(command: string, args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'ignore', windowsHide: true });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

export function clusterExists(dataDir: string): boolean {
  return existsSync(join(dataDir, 'PG_VERSION'));
}

export async function initCluster(dataDir: string, superuserPassword: string): Promise<void> {
  const { initdb } = await binaries();
  mkdirSync(dataDir, { recursive: true });
  const passwordFile = join(tmpdir(), `vero-pg-${randomBytes(8).toString('hex')}`);
  writeFileSync(passwordFile, superuserPassword, { mode: 0o600 });
  try {
    const code = await run(initdb, [
      `--pgdata=${dataDir}`,
      '--username=postgres',
      `--pwfile=${passwordFile}`,
      '--auth=scram-sha-256',
      '--encoding=UTF8',
      '--locale=C',
    ]);
    if (code !== 0) throw new Error(`initdb failed with exit code ${code}`);
  } finally {
    rmSync(passwordFile, { force: true });
  }
}

export async function isClusterRunning(dataDir: string): Promise<boolean> {
  const { pg_ctl } = await binaries();
  return (await run(pg_ctl, ['status', '-D', dataDir])) === 0;
}

export async function startCluster(dataDir: string, port: number, logFile: string): Promise<void> {
  const { pg_ctl } = await binaries();
  const code = await run(pg_ctl, [
    'start',
    '-w',
    '-t',
    '60',
    '-D',
    dataDir,
    '-l',
    logFile,
    // Local connections only: this server is never reachable from the network.
    '-o',
    `-p ${port} -c listen_addresses=localhost`,
  ]);
  if (code !== 0) throw new Error(`Postgres did not start (exit code ${code}). See ${logFile}`);
}

export async function stopCluster(dataDir: string): Promise<void> {
  const { pg_ctl } = await binaries();
  const code = await run(pg_ctl, ['stop', '-w', '-t', '60', '-m', 'fast', '-D', dataDir]);
  if (code !== 0) throw new Error(`Postgres did not stop cleanly (exit code ${code})`);
}

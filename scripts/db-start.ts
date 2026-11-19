/** Starts the local Postgres under .data/pg and makes sure its roles and database exist. */
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { bootstrapDatabase } from '../apps/api/src/db/bootstrap';
import { clusterExists, initCluster, isClusterRunning, startCluster } from '../apps/api/src/db/embedded';
import { loadLocalEnv } from '../apps/api/src/config';

loadLocalEnv();

if (process.env.NODE_ENV === 'production') {
  throw new Error('The embedded database is for development only.');
}
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Copy .env.example to .env.`);
  return value;
}

const dataRoot = resolve(import.meta.dirname, '..', '.data');
const dataDir = resolve(dataRoot, 'pg');
const port = Number(required('EMBEDDED_PG_PORT'));
const superPassword = required('EMBEDDED_PG_SUPERUSER_PASSWORD');
mkdirSync(dataRoot, { recursive: true });

if (!clusterExists(dataDir)) {
  console.log('Creating a new local database in .data/pg');
  await initCluster(dataDir, superPassword);
}
if (await isClusterRunning(dataDir)) {
  console.log('Local database is already running.');
} else {
  await startCluster(dataDir, port, resolve(dataRoot, 'pg.log'));
  console.log(`Local database started on port ${port}.`);
}

await bootstrapDatabase({
  superuserUrl: `postgres://postgres:${encodeURIComponent(superPassword)}@localhost:${port}/postgres`,
  migratorUrl: required('DATABASE_MIGRATOR_URL'),
  appUrl: required('DATABASE_URL'),
});
console.log('Roles and database are ready. Next: npm run db:migrate');

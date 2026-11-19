/** Stops the local Postgres. Data stays in .data/pg. */
import { resolve } from 'node:path';
import { clusterExists, isClusterRunning, stopCluster } from '../apps/api/src/db/embedded';

const dataDir = resolve(import.meta.dirname, '..', '.data', 'pg');

if (!clusterExists(dataDir) || !(await isClusterRunning(dataDir))) {
  console.log('Local database is not running.');
} else {
  await stopCluster(dataDir);
  console.log('Local database stopped.');
}

import { buildApp } from './app';
import { composeDeps } from './compose';
import { loadConfig, loadLocalEnv } from './config';
import { InProcessQueue } from './infra';
import { scheduleMaintenance } from './jobs';

loadLocalEnv();
const config = loadConfig();

// The brief's development sign-in path: the link goes to the terminal, nowhere else.
// createMailer only passes this through when NODE_ENV=development.
const deps = composeDeps(config, (line) => process.stdout.write(`${line}\n`));
const app = await buildApp(deps);

// With a real queue, the worker process keeps these timers.
const stopMaintenance =
  deps.queue instanceof InProcessQueue ? scheduleMaintenance(deps, () => app.log.error('could not queue a maintenance job')) : () => undefined;

let stopping = false;
async function shutdown(): Promise<void> {
  if (stopping) return;
  stopping = true;
  stopMaintenance();
  await app.close();
  await deps.queue.close();
  await deps.db.close();
}
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

await app.listen({ host: config.host, port: config.port });

import { composeDeps } from '@vero/api/compose';
import { loadConfig, loadLocalEnv } from '@vero/api/config';
import { startWorker } from './worker';

loadLocalEnv();
const deps = composeDeps(loadConfig());
const stop = startWorker(deps, (name) => process.stderr.write(`could not queue ${name}\n`));
process.stdout.write('Worker running.\n');

let stopping = false;
async function shutdown(): Promise<void> {
  if (stopping) return;
  stopping = true;
  stop();
  await deps.queue.close();
  await deps.db.close();
}
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

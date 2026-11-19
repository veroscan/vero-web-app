import type { AppDeps } from '@vero/api/deps';
import { registerJobHandlers, scheduleMaintenance } from '@vero/api/jobs';

/**
 * The worker runs exactly the same handlers as the API does in development, against the same
 * queue. Starting it twice is safe: every job can run more than once without harm.
 */
export function startWorker(deps: AppDeps, onError: (name: string) => void): () => void {
  registerJobHandlers(deps);
  return scheduleMaintenance(deps, onError);
}

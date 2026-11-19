import { REFERENCE_KEYS } from '@vero/connectors';
import type { AppDeps } from '../deps';
import type { JobName, JobPayloads } from '../infra';
import { sendDeadlineReminders } from '../modules/deadlines/routes';
import { runGithubSync } from '../modules/github/sync';
import { runDocusignPull } from '../modules/docusign/pull';
import { runInboundEmail } from '../modules/inbound-email/receive';
import { runGoogleDrivePull } from '../modules/google-drive/service';
import { runSharepointPull } from '../modules/sharepoint/service';
import { queueDueMonitoringScans } from '../modules/monitoring/service';
import { refreshReferenceData } from '../modules/reference/service';
import { recoverScans, retryDownSources, runScan } from '../modules/scans/pipeline';
import { processDocument } from '../modules/vault/service';
import { purgeExpired } from './purge';

/**
 * Every background job. The API process registers these when the queue is in-process, so one
 * process is enough in development. With Valkey, apps/worker registers them instead.
 */
export function registerJobHandlers(deps: AppDeps): void {
  deps.queue.register('scan.run', (payload) => runScan(deps, payload));
  deps.queue.register('document.process', (payload) => processDocument(deps, payload));
  deps.queue.register('maintenance.purge-expired', () => purgeExpired(deps));
  deps.queue.register('maintenance.recover-scans', async () => {
    await recoverScans(deps);
  });
  deps.queue.register('maintenance.retry-sources', async () => {
    await retryDownSources(deps);
  });
  deps.queue.register('maintenance.deadline-reminders', async () => {
    await sendDeadlineReminders(deps);
  });
  // Both do nothing until switched on: REFERENCE_REFRESH_ENABLED and MONITORING_ENABLED.
  deps.queue.register('reference.refresh', async (payload) => {
    await refreshReferenceData(deps, payload.source);
  });
  deps.queue.register('monitoring.rescan-due', async () => {
    await queueDueMonitoringScans(deps);
  });
  // Does nothing unless the GitHub App is configured and the organisation has chosen repositories.
  deps.queue.register('github.sync', async (payload) => {
    await runGithubSync(deps, payload);
  });
  // Both do nothing unless configured: DocuSign's integration key, and the forwarding domain.
  deps.queue.register('docusign.pull', async (payload) => {
    await runDocusignPull(deps, payload);
  });
  deps.queue.register('inbound-email.receive', async (payload) => {
    await runInboundEmail(deps, payload);
  });
  // Both do nothing unless configured: Google Drive's OAuth client, and Microsoft's app registration.
  deps.queue.register('google-drive.pull', async (payload) => {
    await runGoogleDrivePull(deps, payload);
  });
  deps.queue.register('sharepoint.pull', async (payload) => {
    await runSharepointPull(deps, payload);
  });
}

type Scheduled = { [N in JobName]: { name: N; everyMs: number; payload: JobPayloads[N] } }[JobName];

const HOUR = 60 * 60 * 1000;

/**
 * The reference and monitoring jobs tick every hour and decide for themselves whether anything
 * is due: each list is asked daily (sanctions every 6 hours), and each company is re-scanned
 * at most once a day. A restart therefore never pushes a daily run back by a day.
 */
const SCHEDULE: readonly Scheduled[] = [
  { name: 'maintenance.purge-expired', everyMs: HOUR, payload: {} },
  { name: 'maintenance.recover-scans', everyMs: 60 * 1000, payload: {} },
  { name: 'maintenance.retry-sources', everyMs: 5 * 60 * 1000, payload: {} },
  { name: 'maintenance.deadline-reminders', everyMs: HOUR, payload: {} },
  ...REFERENCE_KEYS.map((source): Scheduled => ({ name: 'reference.refresh', everyMs: HOUR, payload: { source } })),
  { name: 'monitoring.rescan-due', everyMs: HOUR, payload: {} },
];

/** Queues the regular jobs on timers. Returns a function that stops them. */
export function scheduleMaintenance(deps: Pick<AppDeps, 'queue'>, onError: (name: JobName) => void): () => void {
  const timers = SCHEDULE.map((job) => {
    const timer = setInterval(() => {
      // TypeScript can't tie the payload to the name through the union, hence the cast.
      (deps.queue.enqueue as (name: JobName, payload: JobPayloads[JobName]) => Promise<unknown>)(job.name, job.payload).catch(() => onError(job.name));
    }, job.everyMs);
    timer.unref();
    return timer;
  });
  return () => {
    for (const timer of timers) clearInterval(timer);
  };
}

import { randomUUID } from 'node:crypto';
import { Queue, Worker } from 'bullmq';
import type { ReferenceKey } from '@vero/connectors';
import { Redis } from 'ioredis';
import type { Config } from '../config';

/** Every background job and its payload. Payloads carry ids only, never document content. */
export interface JobPayloads {
  'maintenance.purge-expired': Record<string, never>;
  'scan.run': { organisationId: string; scanId: string };
  'document.process': { organisationId: string; documentId: string };
  'maintenance.recover-scans': Record<string, never>;
  'maintenance.retry-sources': Record<string, never>;
  'maintenance.deadline-reminders': Record<string, never>;
  /** One public list: ICO, NDPC, or one of the sanctions lists. */
  'reference.refresh': { source: ReferenceKey };
  'monitoring.rescan-due': Record<string, never>;
  /** Reads the chosen GitHub repositories of one organisation. Ids only. */
  'github.sync': { organisationId: string; requestedBy: string | null };
  /** Brings in the DocuSign envelopes a person picked. Ids only. */
  'docusign.pull': { organisationId: string; companyId: string; envelopeIds: string[]; requestedBy: string | null };
  /** Reads the attachments of one email sent to an organisation's forwarding address. Ids, a date and a domain only. */
  'inbound-email.receive': { organisationId: string; addressId: string; emailId: string; receivedAt: string; senderDomain: string | null };
  /** Brings in the Google Drive files a person picked. Ids only. */
  'google-drive.pull': { organisationId: string; companyId: string; fileIds: string[]; requestedBy: string | null };
  /** Brings in the SharePoint / OneDrive files a person picked. Ids only. */
  'sharepoint.pull': { organisationId: string; companyId: string; items: { driveId: string; itemId: string }[]; requestedBy: string | null };
}
export type JobName = keyof JobPayloads;
export type JobHandler<N extends JobName> = (payload: JobPayloads[N]) => Promise<void>;

export interface EnqueueOptions {
  delayMs?: number;
  /** Same id twice means one job. */
  jobId?: string;
}

export interface JobQueue {
  enqueue<N extends JobName>(name: N, payload: JobPayloads[N], options?: EnqueueOptions): Promise<{ id: string }>;
  register<N extends JobName>(name: N, handler: JobHandler<N>): void;
  close(): Promise<void>;
}

interface PendingJob {
  id: string;
  run: (handler: (payload: never) => Promise<void>) => Promise<void>;
}

/** Runs jobs in this process, with retries. For development and tests. */
export class InProcessQueue implements JobQueue {
  private readonly handlers = new Map<JobName, (payload: never) => Promise<void>>();
  private readonly waiting = new Map<JobName, PendingJob[]>();
  private readonly seenIds = new Set<string>();
  private readonly running = new Set<Promise<void>>();
  private closed = false;

  constructor(
    private readonly options: {
      attempts?: number;
      backoffMs?: number;
      /** Called once a job has used up its attempts. Gets the job name and id only. */
      onFailed?: (name: JobName, id: string) => void;
    } = {},
  ) {}

  register<N extends JobName>(name: N, handler: JobHandler<N>): void {
    this.handlers.set(name, handler);
    const jobs = this.waiting.get(name) ?? [];
    this.waiting.delete(name);
    for (const job of jobs) this.start(name, job);
  }

  enqueue<N extends JobName>(name: N, payload: JobPayloads[N], options: EnqueueOptions = {}): Promise<{ id: string }> {
    if (this.closed) return Promise.reject(new Error('Queue is closed'));
    const id = options.jobId ?? randomUUID();
    if (this.seenIds.has(id)) return Promise.resolve({ id });
    this.seenIds.add(id);

    const job: PendingJob = {
      id,
      run: async (handler) => {
        if (options.delayMs) await new Promise((resolve) => setTimeout(resolve, options.delayMs));
        await this.runWithRetries(name, id, () => handler(payload as never));
      },
    };
    if (this.handlers.has(name)) {
      this.start(name, job);
    } else {
      // No worker yet. Hold the job, as a real queue would.
      this.waiting.set(name, [...(this.waiting.get(name) ?? []), job]);
    }
    return Promise.resolve({ id });
  }

  private start(name: JobName, job: PendingJob): void {
    const handler = this.handlers.get(name);
    if (!handler) return;
    const task: Promise<void> = new Promise<void>((resolve) => setImmediate(resolve))
      .then(() => job.run(handler))
      .finally(() => this.running.delete(task));
    this.running.add(task);
  }

  private async runWithRetries(name: JobName, id: string, attempt: () => Promise<void>): Promise<void> {
    const attempts = this.options.attempts ?? 3;
    for (let tries = 1; tries <= attempts; tries += 1) {
      try {
        await attempt();
        return;
      } catch {
        if (tries === attempts) {
          this.options.onFailed?.(name, id);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, (this.options.backoffMs ?? 200) * tries));
      }
    }
  }

  /** Waits until everything started so far has finished. */
  async drain(): Promise<void> {
    while (this.running.size > 0) await Promise.all(this.running);
  }

  async close(): Promise<void> {
    this.closed = true;
    await this.drain();
  }
}

/**
 * BullMQ on Valkey. Connects lazily, so creating it opens no socket.
 * Use Valkey here: Redis 7.4 and later are licensed in a way this project does not allow.
 */
export class BullMQQueue implements JobQueue {
  private readonly queues = new Map<string, Queue>();
  private readonly workers: Worker[] = [];
  private readonly connections: Redis[] = [];

  constructor(private readonly url: string) {}

  private connection(): Redis {
    // BullMQ requires maxRetriesPerRequest null for blocking worker commands.
    const connection = new Redis(this.url, { maxRetriesPerRequest: null, lazyConnect: true });
    this.connections.push(connection);
    return connection;
  }

  private queue(name: JobName): Queue {
    let queue = this.queues.get(name);
    if (!queue) {
      queue = new Queue(name, { connection: this.connection() });
      this.queues.set(name, queue);
    }
    return queue;
  }

  async enqueue<N extends JobName>(name: N, payload: JobPayloads[N], options: EnqueueOptions = {}): Promise<{ id: string }> {
    const job = await this.queue(name).add(name, payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
      delay: options.delayMs,
      jobId: options.jobId,
    });
    return { id: String(job.id) };
  }

  register<N extends JobName>(name: N, handler: JobHandler<N>): void {
    this.workers.push(
      new Worker(name, (job) => handler(job.data as JobPayloads[N]), { connection: this.connection() }),
    );
  }

  async close(): Promise<void> {
    await Promise.all(this.workers.map((worker) => worker.close()));
    await Promise.all([...this.queues.values()].map((queue) => queue.close()));
    for (const connection of this.connections) connection.disconnect();
  }
}

export function createJobQueue(config: Pick<Config, 'valkeyUrl'>): JobQueue {
  return config.valkeyUrl ? new BullMQQueue(config.valkeyUrl) : new InProcessQueue();
}

import {
  createReferenceRefresher, maxAgeHoursFor, REFERENCE_KEYS, REFERENCE_SOURCES,
  type HeldCopy, type ReferenceKey, type ReferenceOptions, type ReferenceRefresher, type ReferenceStore,
} from '@vero/connectors';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import type { Config } from '../../config';
import { schema, type Database } from '../../db';
import type { AppDeps } from '../../deps';
import { writeAudit } from '../audit/service';

const { referenceData } = schema;

/** After a download that wasn't used, wait this long before asking again. */
const RETRY_AFTER_FAILURE_MS = 60 * 60 * 1000;

/** The connectors read the stored copies through this. Reading never needs a tenant. */
export function createReferenceStore(db: Database): ReferenceStore {
  return {
    async latest(key) {
      const [row] = await db.withSystem((tx) =>
        tx
          .select({ contentHash: referenceData.contentHash, fetchedAt: referenceData.fetchedAt, checkedAt: referenceData.checkedAt, rowCount: referenceData.rowCount })
          .from(referenceData)
          .where(and(eq(referenceData.key, key), isNotNull(referenceData.contentHash))),
      );
      if (!row?.contentHash || !row.fetchedAt || !row.checkedAt || row.rowCount === null) return null;
      return { key, contentHash: row.contentHash, fetchedAt: row.fetchedAt, checkedAt: row.checkedAt, rowCount: row.rowCount };
    },
    async content(key, contentHash) {
      const [row] = await db.withSystem((tx) =>
        tx
          .select({ content: referenceData.content })
          .from(referenceData)
          .where(and(eq(referenceData.key, key), eq(referenceData.contentHash, contentHash))),
      );
      return row?.content ?? null;
    },
  };
}

export function referenceOptions(db: Database, config: Pick<Config, 'reference'>): ReferenceOptions {
  return { store: createReferenceStore(db), maxAgeHours: config.reference.maxAgeHours, sanctionsMaxAgeHours: config.reference.sanctionsMaxAgeHours };
}

const refreshers = new WeakMap<AppDeps, ReferenceRefresher>();

function refresherFor(deps: AppDeps): ReferenceRefresher {
  let refresher = refreshers.get(deps);
  if (!refresher) {
    refresher = createReferenceRefresher({
      env: deps.config.reference.sourceEnv,
      userAgent: deps.config.reference.userAgent,
      // The rate limit runs on the real clock, so a test's frozen clock can't stall it.
      ...(deps.referenceFetch ? { fetch: deps.referenceFetch } : {}),
    });
    refreshers.set(deps, refresher);
  }
  return refresher;
}

export type RefreshResult = 'switched_off' | 'not_configured' | 'not_due' | 'replaced' | 'not_modified' | 'rejected';

/**
 * The reference.refresh job, for one source. Asks the publisher whether the list changed and
 * stores a good new copy in one step. Anything wrong with the download leaves the old copy as
 * it was and records why. With REFERENCE_REFRESH_ENABLED off, it does nothing at all.
 */
export async function refreshReferenceData(deps: AppDeps, source: ReferenceKey): Promise<RefreshResult> {
  if (!deps.config.reference.refreshEnabled) return 'switched_off';
  const definition = REFERENCE_SOURCES[source];
  const now = deps.now();
  const [row] = await deps.db.withSystem((tx) => tx.select().from(referenceData).where(eq(referenceData.key, source)));

  // The timer ticks every hour. The publisher is asked once per period, and an hour after a failure.
  const sinceCheck = row?.checkedAt ? now.getTime() - row.checkedAt.getTime() : Number.POSITIVE_INFINITY;
  const failedLast = row?.lastErrorAt && (!row.checkedAt || row.lastErrorAt > row.checkedAt);
  if (sinceCheck < definition.everyHours * 3_600_000) return 'not_due';
  if (failedLast && row.lastErrorAt && now.getTime() - row.lastErrorAt.getTime() < RETRY_AFTER_FAILURE_MS) return 'not_due';

  const held: HeldCopy = {
    contentHash: row?.contentHash ?? null,
    etag: row?.etag ?? null,
    lastModified: row?.lastModified ?? null,
    rowCount: row?.rowCount ?? null,
  };
  const outcome = await refresherFor(deps).refresh(source, held);
  if (outcome.kind === 'not_configured') return 'not_configured';

  const at = now.toISOString();
  await deps.db.withSystem(async (tx) => {
    switch (outcome.kind) {
      case 'replaced':
        await tx.execute(
          sql`select reference_data_replace(${source}, ${outcome.content}, ${outcome.contentHash}, ${outcome.etag}, ${outcome.lastModified}, ${outcome.rowCount}::integer, ${at}::timestamptz)`,
        );
        await writeAudit(tx, { action: 'reference.replaced', target: source, metadata: { rows: outcome.rowCount, previousRows: held.rowCount } });
        break;
      case 'not_modified':
        await tx.execute(sql`select reference_data_confirm(${source}, ${outcome.etag}, ${outcome.lastModified}, ${at}::timestamptz)`);
        break;
      case 'rejected':
        await tx.execute(sql`select reference_data_fail(${source}, ${outcome.error}, ${at}::timestamptz)`);
        await writeAudit(tx, { action: 'reference.refresh_failed', target: source, metadata: { reason: outcome.error } });
        break;
    }
  });
  return outcome.kind;
}

export interface ReferenceStatus {
  key: ReferenceKey;
  name: string;
  /** An address is set, or the list is switched on. */
  configured: boolean;
  lastFetchedAt: string | null;
  lastCheckedAt: string | null;
  rowCount: number | null;
  lastError: string | null;
  lastErrorAt: string | null;
  /** Hours since the publisher last confirmed the copy. Null with no copy. */
  ageHours: number | null;
  maxAgeHours: number;
  /** Whether the sources will use the copy. */
  fresh: boolean;
}

/** For the admin page: each stored list, how old it is and what went wrong last. Holds no content. */
export async function referenceStatus(deps: AppDeps): Promise<{ refreshEnabled: boolean; sources: ReferenceStatus[] }> {
  const rows = await deps.db.withSystem((tx) =>
    tx
      .select({
        key: referenceData.key,
        fetchedAt: referenceData.fetchedAt,
        checkedAt: referenceData.checkedAt,
        rowCount: referenceData.rowCount,
        lastError: referenceData.lastError,
        lastErrorAt: referenceData.lastErrorAt,
      })
      .from(referenceData),
  );
  const byKey = new Map(rows.map((row) => [row.key, row]));
  const now = deps.now().getTime();
  return {
    refreshEnabled: deps.config.reference.refreshEnabled,
    sources: REFERENCE_KEYS.map((key) => {
      const row = byKey.get(key);
      const maxAgeHours = maxAgeHoursFor(key, deps.config.reference);
      const ageHours = row?.checkedAt ? Math.round(((now - row.checkedAt.getTime()) / 3_600_000) * 10) / 10 : null;
      return {
        key,
        name: REFERENCE_SOURCES[key].name,
        configured: REFERENCE_SOURCES[key].url(deps.config.reference.sourceEnv) !== undefined,
        lastFetchedAt: row?.fetchedAt?.toISOString() ?? null,
        lastCheckedAt: row?.checkedAt?.toISOString() ?? null,
        rowCount: row?.rowCount ?? null,
        lastError: row?.lastError ?? null,
        lastErrorAt: row?.lastErrorAt?.toISOString() ?? null,
        ageHours,
        maxAgeHours,
        fresh: ageHours !== null && ageHours <= maxAgeHours,
      };
    }),
  };
}

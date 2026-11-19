import { sql } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

type Db = NodePgDatabase<typeof schema>;
/** A transaction handle. The only way modules ever touch the database. */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertUuid(value: string, label: string): void {
  if (!UUID_PATTERN.test(value)) throw new Error(`${label} must be a UUID`);
}

/** Switches the current transaction into a tenant. Lasts until the transaction ends. */
export async function enterOrg(tx: Tx, organisationId: string): Promise<void> {
  assertUuid(organisationId, 'organisationId');
  await tx.execute(sql`select set_config('app.organisation_id', ${organisationId}, true)`);
}

/** Lets the current transaction read this person's own memberships and profile. */
export async function enterUser(tx: Tx, userId: string): Promise<void> {
  assertUuid(userId, 'userId');
  await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
}

/**
 * The only door to the database. There is deliberately no way to get a bare connection:
 * every query runs inside a transaction that has declared its context, and row-level
 * security returns nothing for a query that has not. ESLint blocks importing `pg` or the
 * Drizzle driver outside this folder.
 *
 * Context uses set_config(..., true), which ends with the transaction, so it cannot leak
 * to the next request on a pooled connection.
 */
export class Database {
  private readonly pool: pg.Pool;
  private readonly db: Db;

  constructor(connectionString: string, options: { maxConnections?: number } = {}) {
    this.pool = new pg.Pool({ connectionString, max: options.maxConnections ?? 10 });
    // An idle client losing its connection must not take the process down.
    this.pool.on('error', () => undefined);
    this.db = drizzle(this.pool, { schema });
  }

  /** Tenant work. Sees exactly one organisation's rows. */
  withOrg<T>(organisationId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
    assertUuid(organisationId, 'organisationId');
    return this.db.transaction(async (tx) => {
      await enterOrg(tx, organisationId);
      return fn(tx);
    });
  }

  /** Work on behalf of a person, before a tenant is chosen. Sees only their own rows. */
  withUser<T>(userId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
    assertUuid(userId, 'userId');
    return this.db.transaction(async (tx) => {
      await enterUser(tx, userId);
      return fn(tx);
    });
  }

  /**
   * Platform tables: sessions, sign-in links, outbox, rate limits, and looking people up
   * by email at sign-in. It grants no access to tenant tables; use enterOrg for those.
   */
  withSystem<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`select set_config('app.scope', 'system', true)`);
      return fn(tx);
    });
  }

  /** Liveness check. Touches no table. */
  async ping(): Promise<void> {
    await this.pool.query('select 1');
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

/**
 * The review desk's queue. Reads review_task across organisations and nothing else: every other
 * tenant table keeps returning nothing, because no organisation is set. The caller must have
 * checked platform_staff and must write an audit entry.
 */
export function withReviewQueue<T>(db: Database, role: 'lawyer' | 'admin', userId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.withUser(userId, async (tx) => {
    await tx.execute(sql`select set_config('app.review_queue_role', ${role}, true)`);
    return fn(tx);
  });
}

/**
 * One review task. Row-level security lets this see that task and, once it is assigned to this
 * person, its document and linked findings. Nothing else of the client's is visible.
 */
export function withReviewTask<T>(db: Database, role: 'lawyer' | 'admin', userId: string, taskId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  assertUuid(taskId, 'taskId');
  return db.withUser(userId, async (tx) => {
    await tx.execute(sql`select set_config('app.review_task_role', ${role}, true)`);
    await tx.execute(sql`select set_config('app.review_task_id', ${taskId}, true)`);
    return fn(tx);
  });
}

/** Read-only list of who has an account and where, for platform admins. Audited by the route. */
export function withAdminDirectory<T>(db: Database, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.withSystem(async (tx) => {
    await tx.execute(sql`select set_config('app.admin_directory', 'on', true)`);
    return fn(tx);
  });
}

/** Postgres error code, looking through the wrapper Drizzle puts around driver errors. */
export function pgErrorCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current && typeof current === 'object'; depth += 1) {
    const candidate = current as { code?: unknown; cause?: unknown };
    if (typeof candidate.code === 'string') return candidate.code;
    current = candidate.cause;
  }
  return undefined;
}

export function isUniqueViolation(error: unknown): boolean {
  return pgErrorCode(error) === '23505';
}

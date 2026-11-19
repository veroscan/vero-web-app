import { lt, sql } from 'drizzle-orm';
import { schema, type Database } from '../db';
import { errors } from './errors';

export interface LimitResult {
  allowed: boolean;
  count: number;
  retryAfterSeconds: number;
}

/**
 * Fixed-window counters in Postgres, used for sign-in and other sensitive actions. Being in
 * the database they are shared by every API instance, survive restarts, and need no Valkey.
 * Keys hold keyed hashes, not raw emails or IP addresses.
 */
export class RateLimiter {
  constructor(
    private readonly db: Database,
    private readonly now: () => Date,
  ) {}

  async hit(key: string, max: number, windowSeconds: number): Promise<LimitResult> {
    const nowMs = this.now().getTime();
    const windowMs = windowSeconds * 1000;
    const windowStart = new Date(Math.floor(nowMs / windowMs) * windowMs);
    const expiresAt = new Date(windowStart.getTime() + windowMs);
    // Runs in its own transaction, so a count survives when the request itself then fails.
    const [row] = await this.db.withSystem((tx) =>
      tx
        .insert(schema.rateLimitBucket)
        .values({ key, windowStart, count: 1, expiresAt })
        .onConflictDoUpdate({
          target: [schema.rateLimitBucket.key, schema.rateLimitBucket.windowStart],
          set: { count: sql`${schema.rateLimitBucket.count} + 1` },
        })
        .returning({ count: schema.rateLimitBucket.count }),
    );
    const count = row?.count ?? max + 1;
    return {
      allowed: count <= max,
      count,
      retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - nowMs) / 1000)),
    };
  }

  /** Throws a 429 once the limit is passed. */
  async enforce(key: string, max: number, windowSeconds: number): Promise<void> {
    const result = await this.hit(key, max, windowSeconds);
    if (!result.allowed) throw errors.rateLimited(result.retryAfterSeconds);
  }

  async purgeExpired(): Promise<void> {
    await this.db.withSystem((tx) =>
      tx.delete(schema.rateLimitBucket).where(lt(schema.rateLimitBucket.expiresAt, this.now())),
    );
  }
}

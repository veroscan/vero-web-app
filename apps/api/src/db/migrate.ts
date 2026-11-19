import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

export const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'db', 'migrations');

export interface MigrationResult {
  applied: string[];
  skipped: string[];
}

/**
 * Applies the plain SQL files in order, each in its own transaction, as the migrator role.
 * A file that changed after being applied stops the run: fix forward with a new file.
 */
export async function runMigrations(migratorUrl: string, dir: string = MIGRATIONS_DIR): Promise<MigrationResult> {
  const client = new pg.Client({ connectionString: migratorUrl });
  await client.connect();
  const result: MigrationResult = { applied: [], skipped: [] };
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )`);
    const done = await client.query<{ name: string; checksum: string }>(
      'SELECT name, checksum FROM schema_migrations',
    );
    const known = new Map(done.rows.map((row) => [row.name, row.checksum]));

    const files = readdirSync(dir).filter((file) => file.endsWith('.sql')).sort();
    for (const file of files) {
      const body = readFileSync(join(dir, file), 'utf8');
      // Line endings must not count as a change between Windows and Linux checkouts.
      const checksum = createHash('sha256').update(body.replaceAll('\r\n', '\n')).digest('hex');
      const previous = known.get(file);
      if (previous !== undefined) {
        if (previous !== checksum) {
          throw new Error(`Migration ${file} changed after it was applied. Add a new migration instead.`);
        }
        result.skipped.push(file);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(body);
        await client.query('INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)', [file, checksum]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${(error as Error).message}`, { cause: error });
      }
      result.applied.push(file);
    }
    return result;
  } finally {
    await client.end();
  }
}

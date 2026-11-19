import { getTableColumns, getTableName, isTable } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';
import { runMigrations } from '../src/db/migrate';
import * as schema from '../src/db/schema';

describe('database schema', () => {
  const admin = new pg.Client({ connectionString: inject('superuserUrl') });
  beforeAll(() => admin.connect());
  afterAll(() => admin.end());

  it('has exactly the same tables and columns in Drizzle and in the SQL migrations', async () => {
    const { rows } = await admin.query<{ table_name: string; column_name: string }>(
      `SELECT table_name, column_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name <> 'schema_migrations'`,
    );
    const inDatabase = rows.map((row) => `${row.table_name}.${row.column_name}`).sort();

    const inDrizzle = (Object.values(schema) as unknown[])
      .filter((value): value is PgTable => isTable(value))
      .flatMap((table) =>
        Object.values(getTableColumns(table) as Record<string, PgColumn>).map(
          (column) => `${getTableName(table)}.${column.name}`,
        ),
      )
      .sort();

    expect(inDrizzle).toEqual(inDatabase);
  });

  it('creates every entity from plan section 7 and the brief', async () => {
    const { rows } = await admin.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
    );
    const tables = rows.map((row) => row.table_name);
    for (const expected of [
      'organisation', 'user', 'membership', 'company', 'company_market', 'jurisdiction', 'rule_pack', 'rule',
      'question_set', 'question', 'answer', 'scan', 'source_result', 'fact', 'finding', 'score_snapshot',
      'action_item', 'vault_slot', 'document', 'vault_connection', 'review_task', 'review_verdict',
      'verification_badge', 'investor_scan_consent', 'plan', 'subscription', 'invoice', 'audit_log', 'job_run',
      'connector_cache', 'session', 'magic_link', 'outbox', 'notification', 'document_order', 'lawyer_booking',
      'deadline',
    ]) {
      expect(tables, `missing table ${expected}`).toContain(expected);
    }
  });

  it('has no social sign-in column', async () => {
    const { rows } = await admin.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND column_name ILIKE '%google%'`,
    );
    expect(rows).toHaveLength(0);
  });

  it('re-running migrations applies nothing', async () => {
    const result = await runMigrations(inject('migratorUrl'));
    expect(result.applied).toEqual([]);
    expect(result.skipped.length).toBeGreaterThan(0);
  });

  it('new rule packs start as draft, and approved needs a recorded approver', async () => {
    const { rows } = await admin.query<{ column_default: string }>(
      `SELECT column_default FROM information_schema.columns WHERE table_name = 'rule_pack' AND column_name = 'status'`,
    );
    expect(rows[0]?.column_default).toContain('draft');
    await expect(
      admin.query(`INSERT INTO rule_pack (jurisdiction_code, version, status) VALUES ('GB', 'drift-test', 'approved')`),
    ).rejects.toThrow(/rule_pack_approval_recorded/);
  });
});

import { eq } from 'drizzle-orm';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';
import { Database, enterOrg, enterUser, schema } from '../src/db';
import { startHarness, type Harness, type SignedIn } from './support/harness';

/**
 * These tests talk straight to Postgres as the real API role, with no API code in the way.
 * They prove the database itself refuses, so a bug in a route could not leak another
 * tenant's data.
 */
const PLATFORM_TABLES = ['user', 'session', 'magic_link', 'outbox', 'rate_limit_bucket', 'connector_cache', 'job_run'];

describe('row-level security, directly in the database, as the API role', () => {
  let h: Harness;
  let a: SignedIn;
  let b: SignedIn;
  let aCompanyId: string;
  let bCompanyId: string;
  let app: pg.Client;
  let tenantTables: string[];

  /** Runs a block in one transaction as the API role, with the given settings. Always rolls back. */
  async function asApp<T>(settings: Record<string, string>, fn: () => Promise<T>): Promise<T> {
    await app.query('BEGIN');
    try {
      for (const [name, value] of Object.entries(settings)) {
        await app.query('SELECT set_config($1, $2, true)', [name, value]);
      }
      return await fn();
    } finally {
      await app.query('ROLLBACK');
    }
  }

  const orgA = () => ({ 'app.organisation_id': a.organisationId });

  /** Asserts the statement fails, then lets the surrounding block carry on. */
  async function expectDenied(sql: string, params: unknown[], code: string | RegExp): Promise<void> {
    await app.query('SAVEPOINT attempt');
    const error = await app.query(sql, params).then(
      () => null,
      (reason: Error & { code?: string }) => reason,
    );
    await app.query('ROLLBACK TO SAVEPOINT attempt');
    expect(error, `expected failure: ${sql}`).not.toBeNull();
    if (typeof code === 'string') expect(error?.code).toBe(code);
    else expect(error?.message).toMatch(code);
  }

  beforeAll(async () => {
    h = await startHarness();
    a = await h.signIn();
    b = await h.signIn();
    const make = async (person: SignedIn, legalName: string) =>
      (
        await h.request('POST', '/v1/companies', {
          cookie: person.cookie,
          body: { legalName, incorporationCountry: 'GB', markets: [{ country: 'GB', kind: 'operates' }] },
        })
      ).json<{ id: string }>().id;
    aCompanyId = await make(a, 'A Ltd');
    bCompanyId = await make(b, 'B Ltd');

    // Put a row in several more tenant tables for both organisations.
    for (const [person, companyId] of [
      [a, aCompanyId],
      [b, bCompanyId],
    ] as const) {
      const org = person.organisationId;
      const scan = await h.admin.query<{ id: string }>(
        `INSERT INTO scan (organisation_id, company_id) VALUES ($1, $2) RETURNING id`,
        [org, companyId],
      );
      await h.admin.query(
        `INSERT INTO fact (organisation_id, company_id, key, value, origin, source, retrieved_at, verification_tier)
         VALUES ($1, $2, 'entity.status', '"active"', 'answer', 'You told us', now(), 5)`,
        [org, companyId],
      );
      await h.admin.query(
        `INSERT INTO finding (organisation_id, scan_id, rule_key, rule_pack_version, outcome, layer, severity)
         VALUES ($1, $2, 'GB.TEST', '0.1', 'gap', 1, 'high')`,
        [org, scan.rows[0]?.id],
      );
      await h.admin.query(`INSERT INTO document (organisation_id, company_id, storage_key, source) VALUES ($1, $2, 'k', 'upload')`, [org, companyId]);
      await h.admin.query(`INSERT INTO deadline (organisation_id, company_id, title, due_on) VALUES ($1, $2, 'File', now())`, [org, companyId]);
      await h.admin.query(`INSERT INTO notification (organisation_id, user_id, kind, title) VALUES ($1, $2, 'score', 't')`, [org, person.userId]);
    }

    const { rows } = await h.admin.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.columns
       WHERE table_schema = 'public' AND column_name = 'organisation_id'`,
    );
    tenantTables = rows.map((row) => row.table_name);

    app = new pg.Client({ connectionString: inject('appUrl') });
    await app.connect();
  });
  afterAll(async () => {
    await app.end();
    await h.close();
  });

  describe('the API role itself', () => {
    it('is not a superuser, cannot bypass RLS and cannot create roles or databases', async () => {
      const { rows } = await app.query<Record<string, boolean | string>>(
        `SELECT rolname, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb FROM pg_roles WHERE rolname = current_user`,
      );
      expect(rows[0]).toEqual({ rolname: 'vero_app', rolsuper: false, rolbypassrls: false, rolcreaterole: false, rolcreatedb: false });
    });

    it('owns no tables, so it cannot turn a policy off', async () => {
      const { rows } = await h.admin.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tableowner = 'vero_app'`);
      expect(rows).toEqual([]);
      await asApp({}, async () => {
        await expectDenied('ALTER TABLE company DISABLE ROW LEVEL SECURITY', [], '42501');
        await expectDenied('ALTER TABLE company NO FORCE ROW LEVEL SECURITY', [], '42501');
        await expectDenied('DROP POLICY tenant_isolation ON company', [], '42501');
        await expectDenied('DROP TABLE company', [], '42501');
      });
    });

    it('cannot create objects or become another role', async () => {
      await asApp({}, async () => {
        await expectDenied('CREATE TABLE sneaky (id int)', [], '42501');
        await expectDenied('SET ROLE vero_migrator', [], '42501');
        await expectDenied('SET ROLE postgres', [], '42501');
      });
    });

    it('turning row_security off gives an error, not the data', async () => {
      await asApp({}, async () => {
        await app.query('SET LOCAL row_security = off');
        await expectDenied('SELECT * FROM company', [], '42501');
      });
    });

    it('cannot change reference data', async () => {
      await asApp({}, async () => {
        await expectDenied(`INSERT INTO jurisdiction (code, name) VALUES ('XX', 'Nowhere')`, [], '42501');
        await expectDenied(`UPDATE rule_pack SET status = 'approved'`, [], '42501');
        const { rows } = await app.query('SELECT code FROM jurisdiction');
        expect(rows.length).toBeGreaterThan(0);
      });
    });

    it('can read stored public lists but only change them through the refresh functions, in system scope', async () => {
      await asApp({}, async () => {
        await expectDenied(`INSERT INTO reference_data (key, last_error) VALUES ('ng.ndpc_list', 'x')`, [], '42501');
        await expectDenied(`UPDATE reference_data SET content = 'planted'`, [], '42501');
        await expectDenied(`SELECT reference_data_fail('ng.ndpc_list', 'x', now())`, [], '42501');
        await app.query('SELECT key FROM reference_data');
      });
      await asApp({ 'app.organisation_id': a.organisationId }, () =>
        expectDenied(`SELECT reference_data_replace('ng.ndpc_list', 'c', repeat('a', 64), null, null, 1, now())`, [], '42501'),
      );
    });

    it('cannot read the migration history', async () => {
      await asApp({}, () => expectDenied('SELECT * FROM schema_migrations', [], '42501'));
    });

    it('cannot change or delete audit history', async () => {
      await asApp(orgA(), async () => {
        await expectDenied(`UPDATE audit_log SET action = 'x'`, [], '42501');
        await expectDenied('DELETE FROM audit_log', [], '42501');
        await expectDenied('TRUNCATE audit_log', [], '42501');
      });
    });
  });

  describe('coverage', () => {
    it('every table with organisation_id has RLS enabled and forced, with a policy', async () => {
      expect(tenantTables.length).toBeGreaterThan(20);
      const { rows } = await h.admin.query<{ relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean; policies: string }>(
        `SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity,
                (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS policies
         FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = ANY($1)`,
        [[...tenantTables, 'organisation', ...PLATFORM_TABLES]],
      );
      expect(rows).toHaveLength(new Set([...tenantTables, 'organisation', ...PLATFORM_TABLES]).size);
      for (const row of rows) {
        expect(row.relrowsecurity, `${row.relname} RLS`).toBe(true);
        expect(row.relforcerowsecurity, `${row.relname} forced`).toBe(true);
        expect(Number(row.policies), `${row.relname} policies`).toBeGreaterThan(0);
      }
    });

    it('every table without RLS is reference data or the migration log', async () => {
      const { rows } = await h.admin.query<{ relname: string }>(
        `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity ORDER BY 1`,
      );
      expect(rows.map((row) => row.relname).sort()).toEqual(
        ['jurisdiction', 'plan', 'question', 'question_set', 'reference_data', 'rule', 'rule_pack', 'schema_migrations', 'vault_slot'].sort(),
      );
    });

    it('the test data really exists, so "returns nothing" below means something', async () => {
      for (const table of ['company', 'company_market', 'scan', 'fact', 'finding', 'document', 'deadline', 'notification', 'membership', 'audit_log']) {
        const { rows } = await h.admin.query<{ n: string }>(`SELECT count(*) AS n FROM ${table} WHERE organisation_id = $1`, [b.organisationId]);
        expect(Number(rows[0]?.n), table).toBeGreaterThan(0);
      }
    });
  });

  describe('no tenant context', () => {
    it('a query on any tenant table returns nothing', async () => {
      for (const table of [...tenantTables, 'organisation']) {
        const { rows } = await app.query(`SELECT * FROM "${table}"`);
        expect(rows, table).toEqual([]);
      }
    });

    it('a query on any platform table returns nothing, including people and sessions', async () => {
      for (const table of PLATFORM_TABLES) {
        const { rows } = await app.query(`SELECT * FROM "${table}"`);
        expect(rows, table).toEqual([]);
      }
    });

    it('filtering by id does not help', async () => {
      const { rows } = await app.query('SELECT * FROM company WHERE id = $1', [bCompanyId]);
      expect(rows).toEqual([]);
    });

    it('updates and deletes touch nothing', async () => {
      const update = await app.query(`UPDATE company SET legal_name = 'x'`);
      const del = await app.query('DELETE FROM company');
      expect(update.rowCount).toBe(0);
      expect(del.rowCount).toBe(0);
    });

    it('inserts are refused', async () => {
      await asApp({}, () =>
        expectDenied(`INSERT INTO company (organisation_id, legal_name, incorporation_country) VALUES ($1, 'X', 'GB')`, [a.organisationId], '42501'),
      );
    });

    it('an empty setting is the same as none', async () => {
      await asApp({ 'app.organisation_id': '' }, async () => {
        expect((await app.query('SELECT * FROM company')).rows).toEqual([]);
      });
    });

    it('a garbage setting fails closed with an error', async () => {
      await asApp({ 'app.organisation_id': "x' OR '1'='1" }, () => expectDenied('SELECT * FROM company', [], '22P02'));
    });

    it('the migrator owns the tables and is bound by RLS too', async () => {
      const migrator = new pg.Client({ connectionString: inject('migratorUrl') });
      await migrator.connect();
      try {
        expect((await migrator.query('SELECT * FROM company')).rows).toEqual([]);
        expect((await migrator.query('SELECT * FROM "user"')).rows).toEqual([]);
      } finally {
        await migrator.end();
      }
    });
  });

  describe('in organisation A', () => {
    it('sees A’s rows and none of B’s, on every tenant table', async () => {
      await asApp(orgA(), async () => {
        for (const table of tenantTables) {
          if (table === 'investor_scan_consent') continue;
          const { rows } = await app.query<{ organisation_id: string | null }>(`SELECT organisation_id FROM "${table}"`);
          for (const row of rows) expect(row.organisation_id, table).toBe(a.organisationId);
        }
        const companies = await app.query<{ id: string }>('SELECT id FROM company');
        expect(companies.rows.map((row) => row.id)).toEqual([aCompanyId]);
      });
    });

    it('asking for B by id or organisation returns nothing', async () => {
      await asApp(orgA(), async () => {
        expect((await app.query('SELECT * FROM company WHERE id = $1', [bCompanyId])).rows).toEqual([]);
        expect((await app.query('SELECT * FROM company WHERE organisation_id = $1', [b.organisationId])).rows).toEqual([]);
        expect((await app.query('SELECT * FROM organisation WHERE id = $1', [b.organisationId])).rows).toEqual([]);
        expect((await app.query('SELECT * FROM membership WHERE organisation_id = $1', [b.organisationId])).rows).toEqual([]);
        expect((await app.query('SELECT * FROM audit_log WHERE organisation_id = $1', [b.organisationId])).rows).toEqual([]);
      });
    });

    it('a join cannot reach across', async () => {
      await asApp(orgA(), async () => {
        const { rows } = await app.query<{ id: string }>(
          `SELECT c.id FROM company c JOIN company_market m ON m.company_id = c.id WHERE c.id = $1 OR m.company_id = $1`,
          [bCompanyId],
        );
        expect(rows).toEqual([]);
      });
    });

    it('cannot update or delete B’s rows', async () => {
      await asApp(orgA(), async () => {
        const update = await app.query(`UPDATE company SET legal_name = 'Hacked' WHERE id = $1`, [bCompanyId]);
        const del = await app.query('DELETE FROM company WHERE id = $1', [bCompanyId]);
        const org = await app.query(`UPDATE organisation SET name = 'Hacked' WHERE id = $1`, [b.organisationId]);
        const member = await app.query(`UPDATE membership SET role = 'member' WHERE user_id = $1`, [b.userId]);
        expect([update.rowCount, del.rowCount, org.rowCount, member.rowCount]).toEqual([0, 0, 0, 0]);
      });
      const { rows } = await h.admin.query<{ legal_name: string }>('SELECT legal_name FROM company WHERE id = $1', [bCompanyId]);
      expect(rows[0]?.legal_name).toBe('B Ltd');
    });

    it('cannot insert a row into B', async () => {
      await asApp(orgA(), async () => {
        await expectDenied(`INSERT INTO company (organisation_id, legal_name, incorporation_country) VALUES ($1, 'Planted', 'GB')`, [b.organisationId], '42501');
        await expectDenied(`INSERT INTO membership (organisation_id, user_id, role) VALUES ($1, $2, 'owner')`, [b.organisationId, a.userId], '42501');
        await expectDenied(`INSERT INTO audit_log (organisation_id, action) VALUES ($1, 'forged')`, [b.organisationId], '42501');
      });
    });

    it('cannot move its own row into B', async () => {
      await asApp(orgA(), () =>
        expectDenied('UPDATE company SET organisation_id = $1 WHERE id = $2', [b.organisationId, aCompanyId], '42501'),
      );
    });

    it('cannot point its own row at B’s company', async () => {
      await asApp(orgA(), async () => {
        await expectDenied(
          `INSERT INTO company_market (organisation_id, company_id, country, kind) VALUES ($1, $2, 'GB', 'users')`,
          [a.organisationId, bCompanyId],
          '23503',
        );
        await expectDenied(`INSERT INTO scan (organisation_id, company_id) VALUES ($1, $2)`, [a.organisationId, bCompanyId], '23503');
      });
    });

    it('can do normal work on its own rows', async () => {
      await asApp(orgA(), async () => {
        const update = await app.query(`UPDATE company SET legal_name = 'A Renamed' WHERE id = $1`, [aCompanyId]);
        expect(update.rowCount).toBe(1);
        const insert = await app.query(
          `INSERT INTO company (organisation_id, legal_name, incorporation_country) VALUES ($1, 'A Two', 'NG') RETURNING id`,
          [a.organisationId],
        );
        expect(insert.rowCount).toBe(1);
      });
    });

    it('sees only teammates in the people table', async () => {
      await asApp(orgA(), async () => {
        const { rows } = await app.query<{ id: string }>('SELECT id FROM "user"');
        expect(rows.map((row) => row.id)).toEqual([a.userId]);
      });
    });

    it('system scope alone does not open tenant data', async () => {
      // Tables whose only door is the system scope (billing accounts, Stripe events, the waitlist, ...) are platform
      // tables that happen to mention an organisation. Read from the database, so a new one can't be forgotten here.
      const systemOnly = await h.admin.query<{ relname: string }>(
        `SELECT c.relname FROM pg_policy p JOIN pg_class c ON c.oid = p.polrelid WHERE p.polname = 'system_scope_only'`,
      );
      const platform = new Set(['outbox', 'job_run', ...systemOnly.rows.map((row) => row.relname)]);
      await asApp({ 'app.scope': 'system' }, async () => {
        for (const table of tenantTables.filter((name) => !platform.has(name))) {
          const { rows } = await app.query(`SELECT 1 FROM "${table}" WHERE organisation_id IS NOT NULL`);
          expect(rows, table).toEqual([]);
        }
      });
    });

    it('a wrong value for app.scope opens nothing', async () => {
      await asApp({ 'app.scope': 'SYSTEM ' }, async () => {
        expect((await app.query('SELECT * FROM session')).rows).toEqual([]);
      });
    });
  });

  describe('user context', () => {
    it('shows a person only their own membership, organisation and profile', async () => {
      await asApp({ 'app.user_id': a.userId }, async () => {
        const memberships = await app.query<{ user_id: string }>('SELECT user_id FROM membership');
        expect(memberships.rows.map((row) => row.user_id)).toEqual([a.userId]);
        const organisations = await app.query<{ id: string }>('SELECT id FROM organisation');
        expect(organisations.rows.map((row) => row.id)).toEqual([a.organisationId]);
        const people = await app.query<{ id: string }>('SELECT id FROM "user"');
        expect(people.rows.map((row) => row.id)).toEqual([a.userId]);
      });
    });

    it('opens no tenant data and allows no membership changes', async () => {
      await asApp({ 'app.user_id': a.userId }, async () => {
        expect((await app.query('SELECT * FROM company')).rows).toEqual([]);
        const update = await app.query(`UPDATE membership SET role = 'admin'`);
        expect(update.rowCount).toBe(0);
      });
    });
  });

  describe('the Database class', () => {
    it('context does not outlive its transaction, on the same pooled connection', async () => {
      const db = new Database(inject('appUrl'), { maxConnections: 1 });
      try {
        const inside = await db.withOrg(a.organisationId, (tx) => tx.select().from(schema.company));
        expect(inside.map((row) => row.id)).toEqual([aCompanyId]);

        // One connection only, so this is certainly the same session as above.
        const afterwards = await db.withSystem((tx) => tx.select().from(schema.company));
        expect(afterwards).toEqual([]);
        const asUser = await db.withUser(a.userId, (tx) => tx.select().from(schema.company));
        expect(asUser).toEqual([]);
      } finally {
        await db.close();
      }
    });

    it('context does not survive a failed transaction either', async () => {
      const db = new Database(inject('appUrl'), { maxConnections: 1 });
      try {
        await expect(
          db.withOrg(a.organisationId, () => Promise.reject(new Error('boom'))),
        ).rejects.toThrow('boom');
        expect(await db.withSystem((tx) => tx.select().from(schema.company))).toEqual([]);
      } finally {
        await db.close();
      }
    });

    it('withOrg sees exactly one organisation, and rolls back on error', async () => {
      const db = new Database(inject('appUrl'), { maxConnections: 2 });
      try {
        await expect(
          db.withOrg(a.organisationId, async (tx) => {
            await tx.update(schema.company).set({ legalName: 'Rolled Back' }).where(eq(schema.company.id, aCompanyId));
            throw new Error('boom');
          }),
        ).rejects.toThrow('boom');
        const [row] = await db.withOrg(a.organisationId, (tx) => tx.select().from(schema.company));
        expect(row?.legalName).toBe('A Ltd');

        const other = await db.withOrg(b.organisationId, (tx) =>
          tx.select().from(schema.company).where(eq(schema.company.id, aCompanyId)),
        );
        expect(other).toEqual([]);
      } finally {
        await db.close();
      }
    });

    it('refuses an id that is not a UUID before touching the database', async () => {
      const db = new Database(inject('appUrl'), { maxConnections: 1 });
      try {
        expect(() => db.withOrg("x' OR '1'='1", () => Promise.resolve(null))).toThrow(/UUID/);
        expect(() => db.withUser('nope', () => Promise.resolve(null))).toThrow(/UUID/);
        await expect(db.withSystem((tx) => enterOrg(tx, 'nope'))).rejects.toThrow(/UUID/);
        await expect(db.withSystem((tx) => enterUser(tx, 'nope'))).rejects.toThrow(/UUID/);
      } finally {
        await db.close();
      }
    });

    it('exposes no way to run a query outside a declared context', () => {
      const db = new Database(inject('appUrl'), { maxConnections: 1 });
      const publicMethods = Object.getOwnPropertyNames(Database.prototype).filter((name) => name !== 'constructor');
      expect(publicMethods.sort()).toEqual(['close', 'ping', 'withOrg', 'withSystem', 'withUser']);
      return db.close();
    });
  });
});

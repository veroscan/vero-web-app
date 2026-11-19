import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { assertSeedAllowed, DEMO_EMAIL, DEMO_ORGANISATION_ID, seedDemoData } from '../src/db/seed';
import { startHarness, type Harness } from './support/harness';

const run = promisify(execFile);
const ROOT = resolve(import.meta.dirname, '..', '..', '..');
const LOCAL_DB = 'postgres://vero_app:x@localhost:5432/vero';

describe('demo seed', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
    await seedDemoData(h.deps.db);
  });
  afterAll(() => h.close());

  it('refuses production and unknown environments, and remote databases', () => {
    expect(() => assertSeedAllowed('production', LOCAL_DB)).toThrow(/production/);
    // Production is the reason given even when nothing else is configured.
    expect(() => assertSeedAllowed('production', undefined)).toThrow(/production/);
    expect(() => assertSeedAllowed('development', undefined)).toThrow(/DATABASE_URL/);
    expect(() => assertSeedAllowed('staging', LOCAL_DB)).toThrow(/NODE_ENV/);
    expect(() => assertSeedAllowed('development', 'postgres://u:p@db.example.com/vero')).toThrow(/this machine/);
    expect(() => assertSeedAllowed('development', LOCAL_DB)).not.toThrow();
    expect(() => assertSeedAllowed(undefined, LOCAL_DB)).not.toThrow();
  });

  it('the real script exits with failure under NODE_ENV=production, before connecting', async () => {
    const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const failure = await run(npx, ['tsx', 'scripts/db-seed.ts'], {
      cwd: ROOT,
      shell: process.platform === 'win32',
      env: { ...process.env, NODE_ENV: 'production', DATABASE_URL: 'postgres://nobody:x@127.0.0.1:1/none' },
    }).then(
      () => null,
      (error: Error & { code?: number; stderr?: string }) => error,
    );
    expect(failure).not.toBeNull();
    expect(failure?.stderr).toMatch(/Refusing to seed: NODE_ENV is production/);
    expect(failure?.stderr).not.toMatch(/ECONNREFUSED/);
  }, 90_000);

  it('creates the fictional organisation, labelled as a demo, with three companies', async () => {
    const orgs = await h.admin.query<{ name: string; is_demo: boolean }>('SELECT name, is_demo FROM organisation WHERE id = $1', [DEMO_ORGANISATION_ID]);
    expect(orgs.rows[0]).toEqual({ name: 'Kestrel Pay (demo)', is_demo: true });
    const companies = await h.admin.query<{ legal_name: string; incorporation_country: string }>(
      'SELECT legal_name, incorporation_country FROM company WHERE organisation_id = $1 ORDER BY legal_name',
      [DEMO_ORGANISATION_ID],
    );
    expect(companies.rows).toEqual([
      { legal_name: 'Kestrel Pay Inc.', incorporation_country: 'US-DE' },
      { legal_name: 'Kestrel Pay Nigeria Ltd', incorporation_country: 'NG' },
      { legal_name: 'Kestrel Pay UK Ltd', incorporation_country: 'GB' },
    ]);
  });

  it('can be run twice without changing anything', async () => {
    const count = async () =>
      (await h.admin.query<{ n: string }>('SELECT count(*) AS n FROM company WHERE organisation_id = $1', [DEMO_ORGANISATION_ID])).rows[0]?.n;
    const before = await count();
    await seedDemoData(h.deps.db);
    expect(await count()).toBe(before);
  });

  it('the demo user can sign in by magic link and sees the demo data, flagged', async () => {
    const amara = await h.signIn(DEMO_EMAIL);
    expect(amara.organisationId).toBe(DEMO_ORGANISATION_ID);
    const me = await h.request('GET', '/v1/me', { cookie: amara.cookie });
    expect(me.json<{ organisations: { isDemo: boolean; role: string }[] }>().organisations[0]).toMatchObject({ isDemo: true, role: 'owner' });
    const companies = await h.request('GET', '/v1/companies', { cookie: amara.cookie });
    expect(companies.json<{ companies: unknown[] }>().companies).toHaveLength(3);
  });

  it('adds no real-looking registration numbers', async () => {
    const { rows } = await h.admin.query<{ registration_number: string }>('SELECT registration_number FROM company WHERE organisation_id = $1', [DEMO_ORGANISATION_ID]);
    for (const row of rows) expect(row.registration_number).toMatch(/^DEMO-/);
  });
});

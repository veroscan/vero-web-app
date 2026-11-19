import pg from 'pg';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';
import { addMember, errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { makeStaff, MISSING_ID, scannedCompany, setPlan, type CompanyBody } from './support/product';

/**
 * Staff work after the lawyer service was removed (19 Nov 2026): only the feed of companies people
 * asked us to look up by hand. Customers never reach it, whatever role they hold in their own
 * organisation, and staff reach no client data through it.
 */
describe('staff work', () => {
  let h: Harness;
  let client: SignedIn;
  let company: CompanyBody;
  let staff: SignedIn;

  const desk = [
    ['GET', '/v1/review/work'],
    ['PATCH', `/v1/review/work/${MISSING_ID}`],
  ] as const;

  beforeAll(async () => {
    h = await startHarness();
    client = await h.signIn();
    await setPlan(h, client.organisationId, 'growth');
    company = await scannedCompany(h, client, { legalName: 'Client One Ltd' });
    staff = await makeStaff(h, 'lawyer');
  });
  afterAll(() => h.close());

  it('no customer reaches it, not even an owner, and the refusal is audited', async () => {
    for (const [method, url] of desk) {
      const response = await h.request(method, url, { cookie: client.cookie, ...(method === 'GET' ? {} : { body: { status: 'completed' } }) });
      expect(response.statusCode, url).toBe(403);
      expect(errorOf(response).code).toBe('forbidden');
    }
    const denied = await h.admin.query(`SELECT 1 FROM audit_log WHERE action = 'staff.access_denied' AND actor_id = $1`, [client.userId]);
    expect(denied.rows.length).toBeGreaterThan(0);
  });

  it('a customer cannot become staff by giving someone a role in their own organisation', async () => {
    for (const role of ['admin', 'lawyer']) {
      const who = await addMember(h, client, role);
      for (const [method, url] of desk) {
        expect((await h.request(method, url, { cookie: who.cookie, ...(method === 'GET' ? {} : { body: { status: 'completed' } }) })).statusCode, url).toBe(403);
      }
      expect((await h.request('GET', '/v1/admin/users', { cookie: who.cookie })).statusCode).toBe(403);
    }
  });

  it('signed out gets 401', async () => {
    for (const [method, url] of desk) expect((await h.request(method, url, method === 'GET' ? {} : { body: { status: 'completed' } })).statusCode, url).toBe(401);
  });

  it('staff reach nothing of a client, and are not admins', async () => {
    for (const url of ['overview', 'issues', 'questionnaire', 'records', 'documents', 'badge', 'shares', 'scans', 'related', 'history']) {
      expect((await h.request('GET', `/v1/companies/${company.id}/${url}`, { cookie: staff.cookie })).statusCode, url).toBe(404);
    }
    expect((await h.request('GET', `/v1/companies/${company.id}`, { cookie: staff.cookie })).statusCode).toBe(404);
    for (const url of ['/v1/admin/users', '/v1/admin/rule-packs', '/v1/admin/connectors']) {
      expect((await h.request('GET', url, { cookie: staff.cookie })).statusCode, url).toBe(403);
    }
  });

  it('staff tables are closed to the API role without system scope, even inside a tenant', async () => {
    const app = new pg.Client({ connectionString: inject('appUrl') });
    await app.connect();
    try {
      for (const settings of [{}, { 'app.organisation_id': client.organisationId }]) {
        await app.query('BEGIN');
        try {
          for (const [name, value] of Object.entries(settings)) await app.query('SELECT set_config($1, $2, true)', [name, value]);
          for (const table of ['platform_staff', 'staff_notification', 'connector_health', 'company_sweep']) {
            expect((await app.query(`SELECT * FROM "${table}"`)).rows, table).toEqual([]);
          }
          await app.query('SAVEPOINT b');
          const error = await app.query(`INSERT INTO platform_staff (user_id, role) VALUES ($1, 'admin')`, [client.userId]).then(() => null, (reason: Error & { code?: string }) => reason);
          await app.query('ROLLBACK TO SAVEPOINT b');
          expect(error?.code).toBe('42501');
        } finally {
          await app.query('ROLLBACK');
        }
      }
    } finally {
      await app.end();
    }
  });
});

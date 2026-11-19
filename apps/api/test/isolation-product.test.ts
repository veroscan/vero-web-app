import pg from 'pg';
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest';
import { startHarness, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, fileDocument, scanNow, setPlan, type CompanyBody } from './support/product';

/**
 * Two organisations with the whole product behind them: scans, facts, findings, documents,
 * deadlines, look-up requests and share links. (Orders, bookings and reviews are gone: their
 * tables stay, unused, and the attempts below still prove nothing crosses into them.) Then, directly in Postgres as the API
 * role, the tables written by the core product are checked one by one.
 */
const PRODUCT_TABLES = [
  'company', 'answer', 'scan', 'source_result', 'fact', 'finding', 'score_snapshot', 'action_item', 'document',
  'deadline', 'notification', 'lookup_request', 'shared_report',
];

describe('tenant isolation of the core product, in the database', () => {
  let h: Harness;
  let app: pg.Client;
  const people: { who: SignedIn; company: CompanyBody }[] = [];

  async function fullStory(name: string): Promise<{ who: SignedIn; company: CompanyBody }> {
    const who = await h.signIn();
    await setPlan(h, who.organisationId, 'growth');
    const company = await createCompany(h, who, { legalName: name, yearEnd: { month: 3, day: 31 } });
    await answer(h, who, company.id);
    await scanNow(h, who, company.id);
    const documentId = await fileDocument(h, who, company.id, 'gb_founder_ip_assignment');
    expect(documentId).toBeTruthy();
    await h.request('POST', '/v1/registry/lookup-requests', { cookie: who.cookie, body: { country: 'GB', legalName: `${name} Holdings` } });
    const share = await h.request('POST', `/v1/companies/${company.id}/shares`, { cookie: who.cookie, body: {} });
    expect(share.statusCode).toBe(201);
    return { who, company };
  }

  async function asOrg<T>(organisationId: string, fn: () => Promise<T>): Promise<T> {
    await app.query('BEGIN');
    try {
      await app.query(`SELECT set_config('app.organisation_id', $1, true)`, [organisationId]);
      return await fn();
    } finally {
      await app.query('ROLLBACK');
    }
  }

  beforeAll(async () => {
    h = await startHarness();
    people.push(await fullStory('Organisation A Ltd'), await fullStory('Organisation B Ltd'));
    app = new pg.Client({ connectionString: inject('appUrl') });
    await app.connect();
  }, 120_000);
  afterAll(async () => {
    await app.end();
    await h.close();
  });

  it.each(PRODUCT_TABLES)('%s: the data exists, and each organisation sees only its own', async (table) => {
    const [a, b] = people;
    if (!a || !b) throw new Error('Set-up failed');
    for (const { who } of [a, b]) {
      const stored = await h.admin.query<{ n: string }>(`SELECT count(*) AS n FROM "${table}" WHERE organisation_id = $1`, [who.organisationId]);
      expect(Number(stored.rows[0]?.n), `${table} is empty, so this would prove nothing`).toBeGreaterThan(0);
    }
    await asOrg(a.who.organisationId, async () => {
      const { rows } = await app.query<{ organisation_id: string }>(`SELECT organisation_id FROM "${table}"`);
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) expect(row.organisation_id).toBe(a.who.organisationId);
      const leak = await app.query(`SELECT 1 FROM "${table}" WHERE organisation_id = $1`, [b.who.organisationId]);
      expect(leak.rows).toEqual([]);
    });
  });

  it.each(PRODUCT_TABLES)('%s: with no organisation set, nothing at all', async (table) => {
    expect((await app.query(`SELECT 1 FROM "${table}"`)).rows).toEqual([]);
  });

  it.each(PRODUCT_TABLES)('%s: cannot be changed or deleted across organisations', async (table) => {
    const [a, b] = people;
    if (!a || !b) throw new Error('Set-up failed');
    await asOrg(a.who.organisationId, async () => {
      const update = await app.query(`UPDATE "${table}" SET updated_at = now() WHERE organisation_id = $1`, [b.who.organisationId]);
      const del = await app.query(`DELETE FROM "${table}" WHERE organisation_id = $1`, [b.who.organisationId]);
      expect([update.rowCount, del.rowCount]).toEqual([0, 0]);
    });
  });

  it('cannot point a row at another organisation’s company, scan or document', async () => {
    const [a, b] = people;
    if (!a || !b) throw new Error('Set-up failed');
    const [{ id: scanId }] = (await h.admin.query<{ id: string }>('SELECT id FROM scan WHERE company_id = $1 LIMIT 1', [b.company.id])).rows as [{ id: string }];
    const [{ id: documentId }] = (await h.admin.query<{ id: string }>('SELECT id FROM document WHERE company_id = $1 LIMIT 1', [b.company.id])).rows as [{ id: string }];
    await asOrg(a.who.organisationId, async () => {
      const attempts: [string, unknown[]][] = [
        [`INSERT INTO scan (organisation_id, company_id) VALUES ($1, $2)`, [a.who.organisationId, b.company.id]],
        [`INSERT INTO finding (organisation_id, scan_id, rule_key, rule_pack_version, outcome, layer, severity) VALUES ($1, $2, 'GB.X', '1', 'gap', 1, 'low')`, [a.who.organisationId, scanId]],
        [`INSERT INTO source_result (organisation_id, scan_id, connector_id, status, retrieved_at) VALUES ($1, $2, 'x', 'found', now())`, [a.who.organisationId, scanId]],
        [`INSERT INTO shared_report (organisation_id, company_id, token_hash, summary, expires_at) VALUES ($1, $2, 'h', '{}', now())`, [a.who.organisationId, b.company.id]],
        [`INSERT INTO document_order (organisation_id, company_id, document_type, title) VALUES ($1, $2, 'x', 'y')`, [a.who.organisationId, b.company.id]],
        [`INSERT INTO review_task (organisation_id, document_id) VALUES ($1, $2)`, [a.who.organisationId, documentId]],
      ];
      for (const [statement, params] of attempts) {
        await app.query('SAVEPOINT attempt');
        const error = await app.query(statement, params).then(() => null, (reason: Error & { code?: string }) => reason);
        await app.query('ROLLBACK TO SAVEPOINT attempt');
        expect(error?.code, statement).toBe('23503');
      }
    });
  });

  it('a share link’s token can only be found inside its own organisation', async () => {
    const [a, b] = people;
    if (!a || !b) throw new Error('Set-up failed');
    const { rows } = await h.admin.query<{ token_hash: string }>('SELECT token_hash FROM shared_report WHERE organisation_id = $1', [b.who.organisationId]);
    await asOrg(a.who.organisationId, async () => {
      expect((await app.query('SELECT 1 FROM shared_report WHERE token_hash = $1', [rows[0]?.token_hash])).rows).toEqual([]);
    });
  });

  it('a stored finding holds how we know, never an officer’s name', async () => {
    const [a] = people;
    if (!a) throw new Error('Set-up failed');
    const { rows } = await h.admin.query<{ detail: string }>(`SELECT detail::text AS detail FROM finding WHERE company_id = $1`, [a.company.id]);
    for (const row of rows) {
      expect(row.detail).not.toContain('ADEYEMI');
      expect(row.detail).not.toContain('OKAFOR');
    }
  });
});

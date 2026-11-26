import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { medianOf } from '../src/modules/scans/routes';
import { transitions } from '../src/modules/reports/activity';
import { errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, GB_ANSWERS, scannedCompany, setPlan } from './support/product';

/** Cancelling a scan (migration 0028), honest progress, and what has happened to an issue. */

interface ScanDetail {
  id: string;
  status: string;
  cancelledAt: string | null;
  progress: { stepsDone: number; stepsTotal: number; etaSeconds: number | null; etaBasedOnScans: number | null };
}

describe('scan cancel, progress and issue activity', () => {
  let h: Harness;
  let owner: SignedIn;

  beforeAll(async () => {
    h = await startHarness();
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
  });
  afterAll(() => h.close());

  it('cancels a queued scan, writes no result, and is safe to ask twice', async () => {
    const company = await createCompany(h, owner, { legalName: 'Cancel Me Ltd' });
    await answer(h, owner, company.id, GB_ANSWERS);
    const started = (await h.request('POST', `/v1/companies/${company.id}/scans`, { cookie: owner.cookie })).json<ScanDetail>();
    const first = await h.request('POST', `/v1/scans/${started.id}/cancel`, { cookie: owner.cookie });
    expect(first.statusCode).toBe(200);
    expect(first.json<ScanDetail>()).toMatchObject({ status: 'cancelled' });
    expect(first.json<ScanDetail>().cancelledAt).not.toBeNull();
    await h.queue.drain();
    const again = await h.request('POST', `/v1/scans/${started.id}/cancel`, { cookie: owner.cookie });
    expect(again.statusCode).toBe(200);
    expect(again.json<ScanDetail>().status).toBe('cancelled');
    const { rows } = await h.admin.query<{ n: number }>(`SELECT count(*)::int AS n FROM finding WHERE scan_id = $1`, [started.id]);
    expect(rows[0]?.n).toBe(0);
    const audits = await h.admin.query<{ n: number }>(`SELECT count(*)::int AS n FROM audit_log WHERE action = 'scan.cancelled' AND target = $1`, [started.id]);
    expect(audits.rows[0]?.n).toBe(1);
    // A new scan can start straight away.
    expect((await h.request('POST', `/v1/companies/${company.id}/scans`, { cookie: owner.cookie })).statusCode).toBe(202);
    await h.queue.drain();
  });

  it('refuses to cancel a finished scan, and a missing one', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Done Ltd' });
    const list = (await h.request('GET', `/v1/companies/${company.id}/scans`, { cookie: owner.cookie })).json<{ scans: ScanDetail[] }>();
    const done = list.scans[0] as ScanDetail;
    expect(errorOf(await h.request('POST', `/v1/scans/${done.id}/cancel`, { cookie: owner.cookie })).code).toBe('invalid_state');
    expect((await h.request('POST', `/v1/scans/11111111-1111-4111-8111-111111111111/cancel`, { cookie: owner.cookie })).statusCode).toBe(404);
    expect(done.progress.stepsDone).toBe(done.progress.stepsTotal);
    expect(done.progress.etaSeconds).toBeNull();
  });

  it('gives an issue its last-checked time and a real activity log', async () => {
    const company = await scannedCompany(h, owner, { legalName: 'Log Ltd' });
    const issues = (await h.request('GET', `/v1/companies/${company.id}/issues`, { cookie: owner.cookie })).json<{ issues: { ruleKey: string }[] }>();
    const ruleKey = issues.issues[0]?.ruleKey;
    expect(ruleKey).toBeTruthy();
    const detail = (await h.request('GET', `/v1/companies/${company.id}/issues/${ruleKey}`, { cookie: owner.cookie })).json<{ lastCheckedAt: string | null; activity: { kind: string }[] }>();
    expect(detail.lastCheckedAt).not.toBeNull();
    expect(detail.activity.map((item) => item.kind)).toContain('opened');
  });

  it('works out transitions and a median from real values only', () => {
    expect(medianOf([10, 30, 20])).toBe(20);
    expect(medianOf([10, 20, 30, 40])).toBe(25);
    const at = (n: number) => new Date(Date.UTC(2026, 0, n));
    const kinds = transitions([
      { scanId: 'a', at: at(1), open: false },
      { scanId: 'b', at: at(2), open: true },
      { scanId: 'c', at: at(3), open: true },
      { scanId: 'd', at: at(4), open: false },
      { scanId: 'e', at: at(5), open: true },
    ]).map((item) => item.kind);
    expect(kinds).toEqual(['opened', 'cleared', 'reopened']);
  });
});

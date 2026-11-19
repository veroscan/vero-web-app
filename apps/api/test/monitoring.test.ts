import type { Connector, SourceResult } from '@vero/connectors';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { queueDueMonitoringScans } from '../src/modules/monitoring/service';
import { startHarness, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, GB_ANSWERS, scanNow, setPlan } from './support/product';

/**
 * Scale monitoring, against the real database with fixture sources. Every run is limited to
 * this file's own organisations, so other test files' companies are never touched.
 */

const DAY = 86_400_000;
type Tweak = (ref: Parameters<Connector['lookup']>[0], result: SourceResult) => SourceResult;

/** Fixture sources, with a hook to change what one of them answers, and a count of calls. */
function controllable() {
  const tweaks = new Map<string, Tweak>();
  const calls = new Map<string, string[]>();
  const wrap = (fixtures: Connector[]): Connector[] =>
    fixtures.map((connector) => ({
      ...connector,
      lookup: async (ref) => {
        calls.set(connector.id, [...(calls.get(connector.id) ?? []), ref.name]);
        const result = await connector.lookup(ref);
        const tweak = tweaks.get(connector.id);
        return tweak ? tweak(ref, result) : result;
      },
    }));
  return { tweaks, calls, wrap };
}

/** A real vendor answer is kept for VENDOR_CACHE_DAYS. Fixture answers never are, so these pretend to be real. */
const asRealVendor: Tweak = (ref, result) => {
  if (ref.name.startsWith('Errorpay')) return { ...result, status: 'error', facts: [], message: 'Down' };
  const { fixture: _sample, ...provenance } = result.provenance;
  return { ...result, provenance };
};

describe('monitoring re-scans', () => {
  let h: Harness;
  const control = controllable();
  const T0 = new Date(Date.now() - 400 * DAY);
  const at = (days: number) => new Date(T0.getTime() + days * DAY);

  beforeAll(async () => {
    h = await startHarness({ MONITORING_ENABLED: 'true' }, { connectors: control.wrap });
  });
  afterAll(() => h.close());

  async function scaleOrg(plan: 'scale' | 'growth' = 'scale'): Promise<SignedIn> {
    const who = await h.signIn();
    await setPlan(h, who.organisationId, plan);
    return who;
  }

  async function scannedAt(who: SignedIn, day: number, body: Record<string, unknown> = { legalName: 'Kestrel Pay UK Ltd', incorporationCountry: 'GB' }) {
    h.setNow(at(day));
    const company = await createCompany(h, who, body);
    if (body.incorporationCountry === 'GB') await answer(h, who, company.id, GB_ANSWERS);
    await scanNow(h, who, company.id);
    return company.id;
  }

  async function monitoringScans(companyId: string) {
    const { rows } = await h.admin.query<{ id: string; status: string; connectors: string[] }>(
      `SELECT id, status, connectors FROM scan WHERE company_id = $1 AND trigger = 'monitoring' ORDER BY created_at`,
      [companyId],
    );
    return rows;
  }

  async function run(day: number, orgs: SignedIn[]) {
    h.setNow(at(day));
    const result = await queueDueMonitoringScans(h.deps, { onlyOrganisations: orgs.map((org) => org.organisationId) });
    await h.queue.drain();
    return result;
  }

  it('with the switch off, queues nothing', async () => {
    const off = await startHarness();
    try {
      expect(off.config.monitoring.enabled).toBe(false);
      expect(await queueDueMonitoringScans(off.deps)).toEqual({ switchedOff: true, queued: 0, capped: 0, failed: 0 });
    } finally {
      await off.close();
    }
  });

  it('queues a monitoring scan only for a monitoring plan whose last full scan is older than a week, and only once a day', async () => {
    const scale = await scaleOrg();
    const growth = await scaleOrg('growth');
    const old = await scannedAt(scale, 0);
    const recent = await scannedAt(scale, 5);
    const notMonitored = await scannedAt(growth, 0);

    const first = await run(8, [scale, growth]);
    expect(first).toMatchObject({ queued: 1, failed: 0 });
    expect(await monitoringScans(old)).toHaveLength(1);
    expect((await monitoringScans(old))[0]?.status).toMatch(/completed|partial/);
    expect(await monitoringScans(recent)).toHaveLength(0);
    expect(await monitoringScans(notMonitored)).toHaveLength(0);

    // Twice in a day: nothing more.
    expect((await run(8, [scale, growth])).queued).toBe(0);
    expect(await monitoringScans(old)).toHaveLength(1);

    // The audit trail says a monitoring scan was queued.
    const audit = await h.admin.query(`SELECT 1 FROM audit_log WHERE organisation_id = $1 AND action = 'monitoring.scan_queued'`, [scale.organisationId]);
    expect(audit.rows).toHaveLength(1);

    // Next week, both are due again.
    expect((await run(16, [scale, growth])).queued).toBe(2);
  });

  it('one company failing does not stop the others', async () => {
    const scale = await scaleOrg();
    const a = await scannedAt(scale, 20);
    const b = await scannedAt(scale, 20);
    const [broken] = [a, b].sort();
    const realHit = h.deps.limiter.hit.bind(h.deps.limiter);
    h.deps.limiter.hit = async (key, maxCount, windowSeconds) => {
      if (key === `monitoring:company:${broken}`) throw new Error('boom');
      return realHit(key, maxCount, windowSeconds);
    };
    try {
      const result = await run(28, [scale]);
      expect(result).toMatchObject({ queued: 1, failed: 1 });
      const other = broken === a ? b : a;
      expect(await monitoringScans(other)).toHaveLength(1);
    } finally {
      h.deps.limiter.hit = realHit;
    }
  });

  it('reuses a paid vendor\'s kept answer, pays again only once it has expired, and never opens a new paid lookup', async () => {
    control.tweaks.set('us.delaware_vendor', asRealVendor);
    try {
      const scale = await scaleOrg();
      const kept = await scannedAt(scale, 40, { legalName: 'Kestrel Pay Inc.', incorporationCountry: 'US-DE' });
      const never = await scannedAt(scale, 40, { legalName: 'Errorpay Inc.', incorporationCountry: 'US-DE' });
      const vendorCalls = () => control.calls.get('us.delaware_vendor') ?? [];
      const callsFor = (name: string) => vendorCalls().filter((item) => item === name).length;
      expect(callsFor('Kestrel Pay Inc.')).toBe(1);
      expect(callsFor('Errorpay Inc.')).toBe(1);

      // A week on: the kept answer is reused, nothing is paid.
      expect((await run(48, [scale])).queued).toBe(2);
      expect(callsFor('Kestrel Pay Inc.')).toBe(1);
      const [reused] = await monitoringScans(kept);
      const { rows } = await h.admin.query<{ status: string }>(`SELECT status FROM source_result WHERE scan_id = $1 AND connector_id = 'us.delaware_vendor'`, [reused?.id]);
      expect(rows[0]?.status).toBe('found');

      // With no kept answer, the vendor isn't asked at all, and the scan doesn't list it.
      expect(callsFor('Errorpay Inc.')).toBe(1);
      const [skipped] = await monitoringScans(never);
      expect(skipped?.connectors).not.toContain('us.delaware_vendor');
      expect((await h.admin.query(`SELECT 1 FROM source_result WHERE scan_id = $1 AND connector_id = 'us.delaware_vendor'`, [skipped?.id])).rows).toHaveLength(0);
      // Free sources are asked again.
      expect((await h.admin.query(`SELECT 1 FROM source_result WHERE scan_id = $1 AND connector_id = 'sanctions.lists'`, [skipped?.id])).rows).toHaveLength(1);

      // Past VENDOR_CACHE_DAYS (30): the kept answer has expired, so this one lookup is paid for.
      expect((await run(72, [scale])).queued).toBe(2);
      expect(callsFor('Kestrel Pay Inc.')).toBe(2);
      expect(callsFor('Errorpay Inc.')).toBe(1);
    } finally {
      control.tweaks.delete('us.delaware_vendor');
    }
  });

  describe('change detection', () => {
    async function latestChange(companyId: string) {
      const { rows } = await h.admin.query<{ scan_id: string; meaningful: string[]; notified: boolean; not_checked: string[]; facts_changed: { key: string; before?: unknown; after?: unknown }[]; findings_resolved: unknown[] }>(
        `SELECT scan_id, meaningful, notified, not_checked, facts_changed, findings_resolved FROM monitoring_change WHERE company_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [companyId],
      );
      return rows[0];
    }
    const notices = async (scanId: string) =>
      (await h.admin.query<{ title: string; body: string }>(`SELECT title, body FROM notification WHERE dedupe_key = $1`, [`monitoring:${scanId}`])).rows;
    const scoreNotices = async (scanId: string) => (await h.admin.query<{ one: number }>(`SELECT 1 AS one FROM notification WHERE dedupe_key = $1`, [`scan:${scanId}`])).rows;

    it('nothing changed: the diff is stored, nobody is told', async () => {
      const scale = await scaleOrg();
      const company = await scannedAt(scale, 100);
      await run(108, [scale]);
      const change = await latestChange(company);
      expect(change).toMatchObject({ meaningful: [], notified: false, facts_changed: [] });
      expect(await notices(change?.scan_id ?? '')).toEqual([]);
      expect(await scoreNotices(change?.scan_id ?? '')).toEqual([]);
      const audit = await h.admin.query(`SELECT metadata FROM audit_log WHERE action = 'monitoring.changes_recorded' AND target = $1`, [change?.scan_id]);
      expect(audit.rows).toHaveLength(1);
    });

    it('a company that is no longer active is a meaningful change, told in plain words', async () => {
      const scale = await scaleOrg();
      const company = await scannedAt(scale, 120);
      control.tweaks.set('uk.companies_house', (_ref, result) => ({
        ...result,
        facts: result.facts.map((fact) => (fact.key === 'registry.uk.companies_house.status' ? { ...fact, value: 'dissolved' } : fact)),
      }));
      try {
        await run(128, [scale]);
      } finally {
        control.tweaks.delete('uk.companies_house');
      }
      const change = await latestChange(company);
      expect(change?.meaningful).toContain('status_change');
      expect(change?.notified).toBe(true);
      expect(change?.facts_changed).toContainEqual({ key: 'registry.uk.companies_house.status', before: 'active', after: 'dissolved' });
      const [notice] = await notices(change?.scan_id ?? '');
      expect(notice?.body).toContain('Companies House now shows the company status as "dissolved". It was "active".');
      expect(notice?.body).toContain('what to do next');
      // Monitoring speaks once, not through the ordinary score notification too.
      expect(await scoreNotices(change?.scan_id ?? '')).toEqual([]);
    });

    it('a source that could not be checked is not a change, and nobody is told there is a problem', async () => {
      const scale = await scaleOrg();
      const company = await scannedAt(scale, 140);
      control.tweaks.set('uk.companies_house', (_ref, result) => ({ ...result, status: 'error', facts: [], message: 'Down' }));
      try {
        await run(148, [scale]);
      } finally {
        control.tweaks.delete('uk.companies_house');
      }
      const change = await latestChange(company);
      expect(change?.not_checked).toContain('uk.companies_house');
      expect(change?.facts_changed).toEqual([]);
      expect(change?.findings_resolved).toEqual([]);
      expect(change?.meaningful).toEqual([]);
      expect(change?.notified).toBe(false);
      expect(await notices(change?.scan_id ?? '')).toEqual([]);
    });

    it('a new possible sanctions match is told, as something a person needs to check', async () => {
      const scale = await scaleOrg();
      const company = await scannedAt(scale, 160);
      control.tweaks.set('sanctions.lists', (_ref, result) => ({ ...result, status: 'ambiguous', facts: [{ key: 'registry.sanctions.possible_match', value: true }] }));
      try {
        await run(168, [scale]);
      } finally {
        control.tweaks.delete('sanctions.lists');
      }
      const change = await latestChange(company);
      expect(change?.meaningful).toContain('sanctions_match');
      const [notice] = await notices(change?.scan_id ?? '');
      expect(notice?.body).toContain('a person needs to check it');
    });
  });
});

describe('monitoring caps', () => {
  let h: Harness;
  const T0 = new Date(Date.now() - 800 * DAY);
  const at = (days: number) => new Date(T0.getTime() + days * DAY);
  beforeAll(async () => {
    h = await startHarness({ MONITORING_ENABLED: 'true', MONITORING_MAX_SCANS_PER_ORG_PER_DAY: '1', MONITORING_MAX_SCANS_PER_DAY: '2' });
  });
  afterAll(() => h.close());

  it('stops at the per-organisation and the global daily cap', async () => {
    h.setNow(at(0));
    const orgs: SignedIn[] = [];
    for (const companies of [2, 2, 1]) {
      const who = await h.signIn();
      await setPlan(h, who.organisationId, 'scale');
      orgs.push(who);
      for (let i = 0; i < companies; i += 1) {
        const company = await createCompany(h, who, { legalName: 'Kestrel Pay UK Ltd', incorporationCountry: 'GB' });
        await answer(h, who, company.id, GB_ANSWERS);
        await scanNow(h, who, company.id);
      }
    }
    h.setNow(at(8));
    const result = await queueDueMonitoringScans(h.deps, { onlyOrganisations: orgs.map((org) => org.organisationId) });
    await h.queue.drain();
    expect(result).toMatchObject({ queued: 2, capped: 3, failed: 0 });
    const { rows } = await h.admin.query<{ organisation_id: string; n: string }>(
      `SELECT organisation_id, count(*) AS n FROM scan WHERE trigger = 'monitoring' AND organisation_id = ANY($1) GROUP BY organisation_id`,
      [orgs.map((org) => org.organisationId)],
    );
    expect(rows.every((row) => Number(row.n) === 1)).toBe(true);
    expect(rows).toHaveLength(2);
  });
});

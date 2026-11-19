import type { Connector, SourceResult } from '@vero/connectors';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { queueDueMonitoringScans } from '../src/modules/monitoring/service';
import { startHarness, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, GB_ANSWERS, scanNow, setPlan } from './support/product';

/**
 * Followed companies under Scale monitoring (docs/BACKEND-V2-PLAN.md, step 4): re-scanned on
 * the follower's plan cadence, under the same caps and cost guard, by the same change rules, and
 * the alert goes to the follower's own people. Runs are limited to this file's organisations.
 */

const DAY = 86_400_000;
type Tweak = (ref: Parameters<Connector['lookup']>[0], result: SourceResult) => SourceResult;

describe('followed companies under monitoring', () => {
  let h: Harness;
  const tweaks = new Map<string, Tweak>();
  const T0 = new Date(Date.now() - 600 * DAY);
  const at = (days: number) => new Date(T0.getTime() + days * DAY);

  beforeAll(async () => {
    h = await startHarness(
      { MONITORING_ENABLED: 'true', MONITORING_MAX_SCANS_PER_ORG_PER_DAY: '1' },
      {
        connectors: (fixtures) =>
          fixtures.map((connector) => ({
            ...connector,
            lookup: async (ref) => {
              const result = await connector.lookup(ref);
              const tweak = tweaks.get(connector.id);
              return tweak ? tweak(ref, result) : result;
            },
          })),
      },
    );
  });
  afterAll(() => h.close());

  async function org(plan: 'scale' | 'growth'): Promise<SignedIn> {
    const who = await h.signIn();
    await setPlan(h, who.organisationId, plan);
    return who;
  }

  async function followAt(who: SignedIn, day: number, legalName = 'Kestrel Pay UK Ltd'): Promise<string> {
    h.setNow(at(day));
    const response = await h.request('POST', '/v1/watchlist', { cookie: who.cookie, body: { legalName, incorporationCountry: 'GB' } });
    if (response.statusCode !== 201) throw new Error(`Follow failed: ${response.statusCode} ${response.body}`);
    await h.queue.drain();
    return response.json<{ company: { id: string } }>().company.id;
  }

  async function run(day: number, orgs: SignedIn[]) {
    h.setNow(at(day));
    const result = await queueDueMonitoringScans(h.deps, { onlyOrganisations: orgs.map((item) => item.organisationId) });
    await h.queue.drain();
    return result;
  }

  const monitoringScans = async (companyId: string) =>
    (await h.admin.query<{ id: string }>(`SELECT id FROM scan WHERE company_id = $1 AND trigger = 'monitoring' ORDER BY created_at`, [companyId])).rows;
  const alerts = async (scanId: string) =>
    (await h.admin.query<{ user_id: string; organisation_id: string; title: string; body: string }>(`SELECT user_id, organisation_id, title, body FROM notification WHERE dedupe_key = $1`, [`monitoring:${scanId}`])).rows;

  it('re-scans a followed company weekly on Scale, and tells the follower about a meaningful change', async () => {
    const follower = await org('scale');
    const companyId = await followAt(follower, 0);
    expect((await run(5, [follower])).queued).toBe(0);

    tweaks.set('uk.companies_house', (_ref, result) => ({
      ...result,
      facts: result.facts.map((fact) => (fact.key === 'registry.uk.companies_house.status' ? { ...fact, value: 'dissolved' } : fact)),
    }));
    try {
      expect((await run(8, [follower])).queued).toBe(1);
    } finally {
      tweaks.delete('uk.companies_house');
    }
    const [scan] = await monitoringScans(companyId);
    const [alert] = await alerts(scan?.id ?? '');
    expect(alert).toMatchObject({ user_id: follower.userId, organisation_id: follower.organisationId });
    expect(alert?.title).toContain('Kestrel Pay UK Ltd');
    expect(alert?.body).toContain('Companies House now shows the company status as "dissolved"');

    // The same change, in the history and on the home screen.
    const history = (await h.request('GET', `/v1/companies/${companyId}/history`, { cookie: follower.cookie })).json<{ scans: { trigger: string; change: { statusChanged: boolean; meaningful: boolean } | null }[] }>();
    expect(history.scans[0]).toMatchObject({ trigger: 'monitoring', change: { statusChanged: true, meaningful: true } });
    expect(history.scans[1]?.trigger).toBe('follow');
    const overview = (await h.request('GET', `/v1/companies/${companyId}/overview`, { cookie: follower.cookie })).json<{ whatChanged: { trigger: string; statusChanged: boolean } | null }>();
    expect(overview.whatChanged).toMatchObject({ trigger: 'monitoring', statusChanged: true });
    const list = (await h.request('GET', '/v1/watchlist', { cookie: follower.cookie })).json<{ companies: { companyId: string; lastChange: { trigger: string } | null }[] }>();
    expect(list.companies.find((item) => item.companyId === companyId)?.lastChange?.trigger).toBe('monitoring');
  });

  it('says nothing when a source could not be checked', async () => {
    const follower = await org('scale');
    const companyId = await followAt(follower, 20);
    tweaks.set('uk.companies_house', (_ref, result) => ({ ...result, status: 'error', facts: [], message: 'Down' }));
    try {
      expect((await run(28, [follower])).queued).toBe(1);
    } finally {
      tweaks.delete('uk.companies_house');
    }
    const [scan] = await monitoringScans(companyId);
    expect(await alerts(scan?.id ?? '')).toEqual([]);
    const { rows } = await h.admin.query<{ meaningful: string[]; not_checked: string[] }>(`SELECT meaningful, not_checked FROM monitoring_change WHERE scan_id = $1`, [scan?.id]);
    expect(rows[0]).toMatchObject({ meaningful: [] });
    expect(rows[0]?.not_checked).toContain('uk.companies_house');
  });

  it('keeps the daily cap, with the team\'s own companies first', async () => {
    const team = await org('scale');
    h.setNow(at(40));
    const own = await createCompany(h, team, { legalName: 'Kestrel Pay UK Ltd', incorporationCountry: 'GB' });
    await answer(h, team, own.id, GB_ANSWERS);
    await scanNow(h, team, own.id);
    const followedId = await followAt(team, 40, 'Heron Pay Ltd');
    const result = await run(48, [team]);
    expect(result).toMatchObject({ queued: 1, capped: 1 });
    expect(await monitoringScans(own.id)).toHaveLength(1);
    expect(await monitoringScans(followedId)).toHaveLength(0);
    // The capped one comes up the next day.
    expect((await run(49, [team])).queued).toBe(1);
    expect(await monitoringScans(followedId)).toHaveLength(1);
  });

  it('does not re-scan followed companies on a plan without monitoring', async () => {
    const follower = await org('growth');
    const companyId = await followAt(follower, 60);
    expect((await run(70, [follower])).queued).toBe(0);
    expect(await monitoringScans(companyId)).toHaveLength(0);
  });
});

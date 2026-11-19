import { createDelawareVendorConnector, createHmrcVatConnector, type Connector, type FetchLike, type SourceResult } from '@vero/connectors';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { companyRef, resolveIdentifiers, retryDownSources, STAGE_TWO } from '../src/modules/scans/pipeline';
import type { CompanyRow } from '../src/modules/scans/facts';
import { errorOf, startHarness, type Harness, type SignedIn } from './support/harness';
import { answer, createCompany, GB_ANSWERS, scanNow, setPlan } from './support/product';

/**
 * Two-stage lookups and paid-vendor hygiene, end to end against real Postgres. Every provider
 * here is a fake fetch: no real API is called.
 */

const POSTCODE_KEY = 'registry.uk.companies_house.registered_office_postcode';

interface Call { url: string; method: string }

/** A tiny fake provider: routes by substring, records every call. */
function fakeProvider(route: (url: string, method: string) => Response | Promise<Response>): FetchLike & { calls: Call[] } {
  const calls: Call[] = [];
  const fn = (async (url: string, init?: RequestInit) => {
    const method = init?.method ?? 'GET';
    calls.push({ url, method });
    return route(url, method);
  }) as FetchLike & { calls: Call[] };
  fn.calls = calls;
  return fn;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const MIDDESK_DONE = {
  status: 'approved',
  registrations: [{ state: 'DE', name: 'Heron Labs Inc.', file_number: '7000001', entity_type: 'CORPORATION', registration_date: '2022-08-16', registered_agent: { name: 'Northwood Agents LLC' }, officers: [] }],
};

describe('two-stage lookups', () => {
  let h: Harness;
  let owner: SignedIn;
  /** The order sources started and finished in, for the current scan. */
  const timeline: string[] = [];
  /** What each stage-two source was asked. */
  const asked = new Map<string, Parameters<Connector['lookup']>[0]>();
  const hmrcFetch = fakeProvider((url) => {
    if (url.includes('/oauth/token')) return json({ access_token: 'test-token', expires_in: 14400 });
    if (url.includes('/lookup/123456789')) return json({ target: { name: 'Heron Pay Ltd', vatNumber: '123456789' } });
    return json({ code: 'NOT_FOUND' }, 404);
  });
  let middeskMode: 'pending' | 'done' | 'down' = 'pending';
  const middeskFetch = fakeProvider((url, method) => {
    if (middeskMode === 'down') return new Response('', { status: 503 });
    if (method === 'POST') return json({ id: `biz_${middeskFetch.calls.filter((call) => call.method === 'POST').length}` });
    return json(middeskMode === 'pending' ? { status: 'pending' } : MIDDESK_DONE);
  });

  beforeAll(async () => {
    h = await startHarness({ CONNECTOR_TIMEOUT_MS: '2000', VENDOR_CACHE_DAYS: '30' }, {
      connectors: (fixtures) => {
        const env = { HMRC_CLIENT_ID: 'test-id', HMRC_CLIENT_SECRET: 'test-secret', MIDDESK_API_KEY: 'test-key' };
        const real: Record<string, Connector> = {
          'uk.hmrc_vat': createHmrcVatConnector({ env, fetch: hmrcFetch, retries: 0, sleep: async () => undefined }),
          'us.delaware_vendor': createDelawareVendorConnector({ env, fetch: middeskFetch, retries: 0, sleep: async () => undefined }),
        };
        return fixtures.map((connector) => {
          const base = real[connector.id] ?? connector;
          return {
            ...base,
            lookup: async (ref) => {
              timeline.push(`start ${connector.id}`);
              if (STAGE_TWO.has(connector.id)) asked.set(connector.id, ref);
              // Stage one takes a moment, so a stage-two source starting early would show.
              if (connector.id === 'uk.companies_house') await new Promise((resolve) => setTimeout(resolve, 30));
              let result: SourceResult = await base.lookup(ref);
              if (connector.id === 'uk.companies_house' && result.status === 'found') {
                result = { ...result, facts: [...result.facts, { key: POSTCODE_KEY, value: 'EC1A 2BB' }] };
              }
              timeline.push(`end ${connector.id}`);
              return result;
            },
          };
        });
      },
    });
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
  });
  afterAll(() => h.close());
  beforeEach(() => {
    timeline.length = 0;
    asked.clear();
  });

  it('runs the registers first, then the sources that need what they found, each stage in parallel', async () => {
    const company = await createCompany(h, owner, { legalName: 'Heron Stage Ltd' });
    await answer(h, owner, company.id);
    await scanNow(h, owner, company.id);

    const lastStageOneEnd = Math.max(...['uk.companies_house', 'sanctions.lists', 'web.policy_scan'].map((id) => timeline.indexOf(`end ${id}`)));
    for (const id of ['uk.ico_register', 'uk.hmrc_vat']) {
      expect(timeline.indexOf(`start ${id}`), id).toBeGreaterThan(lastStageOneEnd);
    }
    // Stage two starts both before either finishes.
    const starts = ['uk.ico_register', 'uk.hmrc_vat'].map((id) => timeline.indexOf(`start ${id}`));
    const ends = ['uk.ico_register', 'uk.hmrc_vat'].map((id) => timeline.indexOf(`end ${id}`));
    expect(Math.max(...starts)).toBeLessThan(Math.min(...ends));
    // The ICO register got the postcode Companies House returned.
    expect(asked.get('uk.ico_register')?.postcode).toBe('EC1A 2BB');
  });

  it('with no VAT number, HMRC says what it needs, the finding is "to check" with that reason, and nothing is guessed', async () => {
    const company = await createCompany(h, owner, { legalName: 'Heron Vat Ltd' });
    await answer(h, owner, company.id, { ...GB_ANSWERS, revenue_band: '1m_to_26m' });
    hmrcFetch.calls.length = 0;
    const scan = await scanNow(h, owner, company.id);

    expect(asked.get('uk.hmrc_vat')?.vat_number).toBeUndefined();
    expect(hmrcFetch.calls).toHaveLength(0);
    const hmrc = scan.sources.find((source) => source.connectorId === 'uk.hmrc_vat');
    expect(hmrc?.state).toBe('unsupported');
    expect(hmrc?.summary).toContain('We need your VAT number');
    expect(scan.status).toBe('partial');

    const finding = await h.admin.query<{ outcome: string; scored: boolean; detail: { reason: string; reason_detail: string | null } }>(
      `SELECT outcome, scored, detail FROM finding WHERE scan_id = $1 AND rule_key = 'GB.TAX.VAT_RETURNS'`,
      [scan.id],
    );
    expect(finding.rows[0]?.outcome).toBe('verify');
    expect(finding.rows[0]?.scored).toBe(false);
    expect(finding.rows[0]?.detail.reason).toBe('needs_identifier');
    expect(finding.rows[0]?.detail.reason_detail).toContain('We need your VAT number');

    const issue = await h.request('GET', `/v1/companies/${company.id}/issues/GB.TAX.VAT_RETURNS`, { cookie: owner.cookie });
    expect(issue.statusCode).toBe(200);
    expect(issue.json<{ reasonWords: string }>().reasonWords).toContain('We need your VAT number');
  });

  it('once the VAT number is given, the retry job asks HMRC with it and the result is re-scored', async () => {
    const company = await createCompany(h, owner, { legalName: 'Heron Pay Ltd' });
    await answer(h, owner, company.id, { ...GB_ANSWERS, revenue_band: '1m_to_26m' });
    await scanNow(h, owner, company.id);

    await answer(h, owner, company.id, { vat_number: 'GB 123 4567 89' });
    const sweep = await h.admin.query<{ next_source_retry_at: Date }>(`SELECT next_source_retry_at FROM company_sweep WHERE company_id = $1`, [company.id]);
    expect(sweep.rows[0]?.next_source_retry_at.getTime()).toBeLessThanOrEqual(Date.now());

    await retryDownSources(h.deps);
    await h.queue.drain();
    expect(asked.get('uk.hmrc_vat')?.vat_number).toBe('GB 123 4567 89');
    const latest = await h.admin.query<{ status: string }>(
      `SELECT status FROM source_result WHERE company_id = $1 AND connector_id = 'uk.hmrc_vat' ORDER BY retrieved_at DESC LIMIT 1`,
      [company.id],
    );
    expect(latest.rows[0]?.status).toBe('found');
    const registered = await h.admin.query<{ value: unknown }>(`SELECT value FROM fact WHERE company_id = $1 AND key = 'registry.uk.hmrc_vat.registered'`, [company.id]);
    expect(registered.rows[0]?.value).toBe(true);
    const scans = await h.admin.query<{ trigger: string }>(`SELECT trigger FROM scan WHERE company_id = $1 ORDER BY created_at`, [company.id]);
    expect(scans.rows.map((row) => row.trigger)).toContain('source_recovered');
  });

  it('refuses a malformed VAT number in the answers with a plain message', async () => {
    const company = await createCompany(h, owner, { legalName: 'Heron Typo Ltd' });
    const response = await h.request('PATCH', `/v1/companies/${company.id}/questionnaire`, { cookie: owner.cookie, body: { answers: { vat_number: '12345' } } });
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).message).toContain('9 digits');
  });

  it('leaves the optional numbers out of "complete"', async () => {
    const company = await createCompany(h, owner, { legalName: 'Heron Optional Ltd' });
    const body = (await h.request('GET', `/v1/companies/${company.id}/questionnaire`, { cookie: owner.cookie })).json<{ visibleFields: number; questions: { fields: { id: string }[] }[] }>();
    const shown = body.questions.flatMap((question) => question.fields.map((field) => field.id));
    expect(shown).toContain('vat_number');
    // The VAT number, the EU trade mark numbers and the LEI are all optional.
    expect(shown).toContain('lei');
    expect(shown).toContain('eu_trademark_numbers');
    expect(body.visibleFields).toBe(shown.length - 3);
  });

  it('keeps each company’s numbers to itself', async () => {
    const company = await createCompany(h, owner, { legalName: 'Heron Private Ltd' });
    await answer(h, owner, company.id, { vat_number: '987654321' });
    const stranger = await h.signIn();
    const read = await h.request('GET', `/v1/companies/${company.id}/questionnaire`, { cookie: stranger.cookie });
    expect(read.statusCode).toBe(404);
    const write = await h.request('PATCH', `/v1/companies/${company.id}/questionnaire`, { cookie: stranger.cookie, body: { answers: { vat_number: '123456789' } } });
    expect(write.statusCode).toBe(404);
  });

  describe('paid vendor (Middesk)', () => {
    it('a report that is not ready is waiting, keeps the business id, and the retry job reuses it', async () => {
      middeskMode = 'pending';
      middeskFetch.calls.length = 0;
      const company = await createCompany(h, owner, { legalName: 'Heron Labs Inc.', incorporationCountry: 'US-DE' });
      const scan = await scanNow(h, owner, company.id);
      const source = scan.sources.find((item) => item.connectorId === 'us.delaware_vendor');
      expect(source?.state).toBe('waiting');
      expect(source?.down).toBe(false);
      expect(scan.status).toBe('partial');
      expect(middeskFetch.calls.filter((call) => call.method === 'POST')).toHaveLength(1);
      const stored = await h.admin.query<{ vendor_business_id: string; cached_result: unknown }>(`SELECT vendor_business_id, cached_result FROM vendor_record WHERE company_id = $1`, [company.id]);
      expect(stored.rows[0]?.vendor_business_id).toMatch(/^biz_/);
      // A wait is never cached.
      expect(stored.rows[0]?.cached_result).toBeNull();

      const sweep = await h.admin.query<{ next_source_retry_at: Date | null }>(`SELECT next_source_retry_at FROM company_sweep WHERE company_id = $1`, [company.id]);
      expect(sweep.rows[0]?.next_source_retry_at).toBeInstanceOf(Date);

      middeskMode = 'done';
      h.setNow(new Date(Date.now() + 20 * 60_000));
      try {
        await retryDownSources(h.deps);
        await h.queue.drain();
      } finally {
        h.setNow(null);
      }
      // Asked again with the same business: no second order.
      expect(middeskFetch.calls.filter((call) => call.method === 'POST')).toHaveLength(1);
      expect(middeskFetch.calls.at(-1)?.url).toContain(`/v1/businesses/${stored.rows[0]?.vendor_business_id ?? ''}`);
      const latest = await h.admin.query<{ status: string }>(`SELECT status FROM source_result WHERE company_id = $1 AND connector_id = 'us.delaware_vendor' ORDER BY retrieved_at DESC LIMIT 1`, [company.id]);
      expect(latest.rows[0]?.status).toBe('found');
    });

    it('reuses a good answer for repeated scans, and "check again" pays for a fresh one', async () => {
      middeskMode = 'done';
      const company = await createCompany(h, owner, { legalName: 'Heron Cache Inc.', incorporationCountry: 'US-DE' });
      middeskFetch.calls.length = 0;
      await scanNow(h, owner, company.id);
      const first = middeskFetch.calls.length;
      expect(first).toBeGreaterThan(0);
      const cached = await h.admin.query<{ cached_at: Date | null }>(`SELECT cached_at FROM vendor_record WHERE company_id = $1`, [company.id]);
      expect(cached.rows[0]?.cached_at).toBeInstanceOf(Date);

      const again = await scanNow(h, owner, company.id);
      expect(middeskFetch.calls.length).toBe(first);
      expect(again.sources.find((item) => item.connectorId === 'us.delaware_vendor')?.state).toBe('found');

      const checkAgain = await h.request('POST', `/v1/companies/${company.id}/records/check-again`, { cookie: owner.cookie });
      expect(checkAgain.statusCode).toBe(202);
      await h.queue.drain();
      expect(middeskFetch.calls.length).toBeGreaterThan(first);
      // The business made the first time is reused, not made again.
      expect(middeskFetch.calls.filter((call) => call.method === 'POST')).toHaveLength(1);
    });

    it('a cached answer expires after VENDOR_CACHE_DAYS', async () => {
      middeskMode = 'done';
      const company = await createCompany(h, owner, { legalName: 'Heron Expiry Inc.', incorporationCountry: 'US-DE' });
      await scanNow(h, owner, company.id);
      middeskFetch.calls.length = 0;
      // 29 days old: still reused.
      await h.admin.query(`UPDATE vendor_record SET cached_at = now() - interval '29 days' WHERE company_id = $1`, [company.id]);
      await scanNow(h, owner, company.id);
      expect(middeskFetch.calls).toHaveLength(0);
      // 31 days old: asked again.
      await h.admin.query(`UPDATE vendor_record SET cached_at = now() - interval '31 days' WHERE company_id = $1`, [company.id]);
      await scanNow(h, owner, company.id);
      expect(middeskFetch.calls.length).toBeGreaterThan(0);
    });

    it('never caches an error, and a vendor that is down never counts for or against the score', async () => {
      middeskMode = 'down';
      const company = await createCompany(h, owner, { legalName: 'Heron Down Inc.', incorporationCountry: 'US-DE' });
      const scan = await scanNow(h, owner, company.id);
      expect(scan.sources.find((item) => item.connectorId === 'us.delaware_vendor')?.state).toBe('error');
      const stored = await h.admin.query(`SELECT 1 FROM vendor_record WHERE company_id = $1 AND cached_result IS NOT NULL`, [company.id]);
      expect(stored.rows).toEqual([]);
      const scored = await h.admin.query(
        `SELECT 1 FROM finding WHERE scan_id = $1 AND scored AND detail->>'reason' IS NULL AND rule_key = 'US-DE.CORP.ENTITY_ON_RECORD' AND outcome IN ('gap', 'defect')`,
        [scan.id],
      );
      expect(scored.rows).toEqual([]);
      middeskMode = 'done';
    });

    it('one organisation can never read another’s vendor records', async () => {
      middeskMode = 'done';
      const company = await createCompany(h, owner, { legalName: 'Heron Tenant Inc.', incorporationCountry: 'US-DE' });
      await scanNow(h, owner, company.id);
      const stranger = await h.signIn();
      const seen = await h.deps.db.withOrg(stranger.organisationId, (tx) => tx.execute('SELECT count(*)::int AS n FROM vendor_record'));
      expect((seen as unknown as { rows: { n: number }[] }).rows[0]?.n).toBe(0);
      const own = await h.deps.db.withOrg(owner.organisationId, (tx) => tx.execute('SELECT count(*)::int AS n FROM vendor_record'));
      expect((own as unknown as { rows: { n: number }[] }).rows[0]?.n).toBeGreaterThan(0);
    });
  });
});

describe('identifier resolution', () => {
  const found = (connectorId: string, key: string, value: unknown) => ({ connectorId, status: 'found', facts: [{ key, value }] });

  it('takes numbers from the answers and from what official sources returned', () => {
    const ids = resolveIdentifiers(
      { vat_number: ' 123456789 ', ico_registration_number: 'za123456', us_trademark_serials: '97123456, 97123457' },
      [found('uk.companies_house', POSTCODE_KEY, 'EC1A 2BB'), found('us.sec_form_d', 'registry.us.sec_form_d.cik', '0001999999')],
    );
    expect(ids).toEqual({ vat_number: '123456789', ico_reference: 'ZA123456', trademark_serials: ['97123456', '97123457'], postcode: 'EC1A 2BB', cik: '0001999999' });
  });

  it('never guesses: nothing given, nothing found, nothing resolved', () => {
    expect(resolveIdentifiers({}, [])).toEqual({});
    // A source that didn't find the company tells us nothing about it.
    expect(resolveIdentifiers({}, [{ connectorId: 'uk.companies_house', status: 'not_found', facts: [{ key: POSTCODE_KEY, value: 'EC1A 2BB' }] }])).toEqual({});
    expect(resolveIdentifiers({ vat_number: '   ', us_trademark_serials: 'none' }, [])).toEqual({});
  });

  it('only gives each source the identifier it reads', () => {
    const company = { legalName: 'Heron Ltd', incorporationCountry: 'GB', registrationNumber: '01234567' } as CompanyRow;
    const ids = { vat_number: '123456789', postcode: 'EC1A 2BB', ico_reference: 'ZA123456', cik: '1', trademark_serials: ['97123456'] };
    const of = (id: string) => companyRef(company, null, { id, jurisdictions: id.startsWith('us.') ? ['US', 'US-DE'] : ['GB'], capabilities: [], factPrefix: id, sourceName: id, lookup: async () => { throw new Error('unused'); } }, { identifiers: ids });
    expect(of('uk.hmrc_vat')).toMatchObject({ vat_number: '123456789' });
    expect(of('uk.hmrc_vat')).not.toHaveProperty('postcode');
    expect(of('uk.ico_register')).toMatchObject({ postcode: 'EC1A 2BB', ico_reference: 'ZA123456' });
    expect(of('uk.companies_house')).not.toHaveProperty('vat_number');
    // The website scan checks the VAT number a site shows against the company's own.
    expect(of('web.policy_scan')).toMatchObject({ vat_number: '123456789' });
    expect(of('web.policy_scan')).not.toHaveProperty('postcode');
    expect(of('us.uspto')).toMatchObject({ trademark_serials: ['97123456'] });
    expect(of('us.sec_form_d')).toMatchObject({ cik: '1' });
  });
});

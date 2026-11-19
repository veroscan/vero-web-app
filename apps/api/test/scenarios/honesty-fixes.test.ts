import { SOURCE_FACTORIES, toEngineInput, type FetchLike } from '@vero/connectors';
import { packsFor, runEngine } from '@vero/rules';
import { describe, expect, it } from 'vitest';

/**
 * Engine bugs found by the scenario audit (docs/SCENARIO-AUDIT.md), one test each. A fake
 * fetch stands in for the provider: no real request is made.
 */

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('Companies House record with no company status', () => {
  const fetch: FetchLike = async (url) => {
    if (url.endsWith('/company/00000001')) return json({ company_number: '00000001', company_name: 'HERON SCENARIO LTD', type: 'ltd', registered_office_address: { postal_code: 'EC1A 1AA' } });
    return json({}, 404);
  };
  const connector = SOURCE_FACTORIES['uk.companies_house']?.({ env: { COMPANIES_HOUSE_API_KEY: 'test-key' }, fetch, retries: 0, sleep: async () => undefined });

  it('publishes no status at all, rather than "unknown"', async () => {
    const result = await connector?.lookup({ name: 'Heron Scenario Ltd', jurisdiction: 'GB', company_number: '00000001' });
    expect(result?.status).toBe('found');
    expect(result?.facts.find((fact) => fact.key === 'registry.uk.companies_house.status')).toBeUndefined();
  });

  it('so the urgent "not active" finding is "to check", not a defect (bug fixed: a missing status read as not active)', async () => {
    const result = await connector?.lookup({ name: 'Heron Scenario Ltd', jurisdiction: 'GB', company_number: '00000001' });
    if (!result) throw new Error('no connector');
    const input = toEngineInput([result], [connector as NonNullable<typeof connector>]);
    const engine = runEngine(packsFor('GB'), { ...input, stage: 2, as_of: '2026-11-15' });
    const status = engine.findings.find((item) => item.rule_id === 'GB.CORP.STATUS');
    expect(status?.outcome).toBe('verify');
    expect(status?.scored).toBe(false);
  });
});

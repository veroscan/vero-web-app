import type { Connector, SourceResult } from '@vero/connectors';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { registryDifferences, type HeldFact } from '../src/modules/records/changes';
import { startHarness, type Harness, type SignedIn } from './support/harness';
import { createCompany, MISSING_ID, scanNow } from './support/product';

/** Registry change history (migration 0025): what a scan found changed on the register, field by field. */

type Tweak = (result: SourceResult) => SourceResult;

interface ChangeBody {
  id: string;
  scanId: string;
  field: string;
  label: string;
  oldValue: string | null;
  newValue: string | null;
  detailWithheld: boolean;
  changedAt: string;
  source: string | null;
  sampleData: boolean;
}

const held = (key: string, value: HeldFact['value'], source = 'uk.companies_house'): HeldFact => ({ key, value, source, sourceName: 'Companies House', isFixture: false });

describe('what counts as a register change', () => {
  it('keeps a changed value, with old and new', () => {
    const changes = registryDifferences([held('registry.uk.companies_house.status', 'active')], [held('registry.uk.companies_house.status', 'dissolved')]);
    expect(changes).toEqual([
      { field: 'registry.uk.companies_house.status', oldValue: 'active', newValue: 'dissolved', detailWithheld: false, source: 'uk.companies_house', sourceName: 'Companies House', isFixture: false },
    ]);
  });

  it('never counts a first answer, or a source that did not answer this time', () => {
    expect(registryDifferences([], [held('registry.uk.companies_house.status', 'active')])).toEqual([]);
    expect(registryDifferences([held('registry.uk.companies_house.status', 'active')], [])).toEqual([]);
    // Another source answering doesn't make the silent one a change.
    expect(registryDifferences([held('registry.uk.companies_house.status', 'active')], [held('registry.sanctions.match', false, 'sanctions.lists')])).toEqual([]);
  });

  it('keeps a field that appears or goes while its source keeps answering', () => {
    const before = [held('registry.uk.companies_house.status', 'active')];
    const after = [held('registry.uk.companies_house.status', 'active'), held('registry.uk.companies_house.accounts_next_due', '2027-06-30')];
    expect(registryDifferences(before, after)).toMatchObject([{ field: 'registry.uk.companies_house.accounts_next_due', oldValue: null, newValue: '2027-06-30' }]);
    expect(registryDifferences(after, before)).toMatchObject([{ field: 'registry.uk.companies_house.accounts_next_due', oldValue: '2027-06-30', newValue: null }]);
  });

  it('keeps only the key for a field that holds people\'s names', () => {
    const changes = registryDifferences([held('registry.uk.companies_house.officers', ['A Person'])], [held('registry.uk.companies_house.officers', ['A Person', 'B Person'])]);
    expect(changes).toMatchObject([{ field: 'registry.uk.companies_house.officers', oldValue: null, newValue: null, detailWithheld: true }]);
  });
});

describe('registry change history', () => {
  let h: Harness;
  let owner: SignedIn;
  let companyId: string;
  const tweaks = new Map<string, Tweak>();

  beforeAll(async () => {
    h = await startHarness(
      { RATE_LIMIT_CHECK_AGAIN_PER_COMPANY_PER_HOUR: '1000' },
      {
        connectors: (fixtures) =>
          fixtures.map((connector): Connector => ({
            ...connector,
            lookup: async (ref) => {
              const result = await connector.lookup(ref);
              const tweak = tweaks.get(connector.id);
              return tweak ? tweak(result) : result;
            },
          })),
      },
    );
    owner = await h.signIn();
    companyId = (await createCompany(h, owner, { legalName: 'Heron Pay Ltd' })).id;
  });
  afterAll(() => h.close());

  const changes = async (who = owner, id = companyId) => h.request('GET', `/v1/companies/${id}/records/changes`, { cookie: who.cookie });
  const setFact = (key: string, value: unknown): Tweak => (result) => ({ ...result, facts: result.facts.map((fact) => (fact.key === key ? { ...fact, value: value as never } : fact)) });

  it('is empty after a first scan: a first answer is not a change', async () => {
    await scanNow(h, owner, companyId);
    const response = await changes();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ companyId, changes: [], sampleData: false });
  });

  it('records what the next scan found different: field, old, new, when and source', async () => {
    tweaks.set('uk.companies_house', (result) =>
      setFact('registry.uk.companies_house.officers', ['Sample Person One'])(setFact('registry.uk.companies_house.status', 'dissolved')(result)),
    );
    let scanId: string;
    try {
      scanId = (await scanNow(h, owner, companyId)).id;
    } finally {
      tweaks.delete('uk.companies_house');
    }
    const body = (await changes()).json<{ changes: ChangeBody[]; sampleData: boolean }>();
    const status = body.changes.find((item) => item.field === 'registry.uk.companies_house.status');
    expect(status).toMatchObject({ label: 'Status', newValue: 'dissolved', detailWithheld: false, scanId, sampleData: true });
    expect(status?.oldValue).toBeTruthy();
    expect(status?.oldValue).not.toBe('dissolved');
    expect(status?.source).toBeTruthy();
    expect(Date.parse(status?.changedAt ?? '')).toBeGreaterThan(Date.now() - 120_000);
    // Officers' names never reach the history: only that the list changed.
    const officers = body.changes.find((item) => item.field === 'registry.uk.companies_house.officers');
    expect(officers).toMatchObject({ label: 'Officers', oldValue: null, newValue: null, detailWithheld: true });
    expect(JSON.stringify(body)).not.toContain('Sample Person One');
    expect(body.sampleData).toBe(true);

    const { rows } = await h.admin.query<{ metadata: { registerChanges: number } }>(`SELECT metadata FROM audit_log WHERE action = 'scan.finalised' AND target = $1`, [scanId]);
    expect(rows[0]?.metadata.registerChanges).toBe(body.changes.length);
  });

  it('records the change back, and nothing when a source could not be checked', async () => {
    // The register is back to what it said first: that is a second change, newest first.
    await scanNow(h, owner, companyId);
    const afterBack = (await changes()).json<{ changes: ChangeBody[] }>().changes.filter((item) => item.field === 'registry.uk.companies_house.status');
    expect(afterBack).toHaveLength(2);
    expect(afterBack[0]?.oldValue).toBe('dissolved');
    expect(Date.parse(afterBack[0]?.changedAt ?? '')).toBeGreaterThanOrEqual(Date.parse(afterBack[1]?.changedAt ?? ''));

    const before = (await changes()).json<{ changes: ChangeBody[] }>().changes.length;
    tweaks.set('uk.companies_house', (result) => ({ ...result, status: 'error', facts: [], message: 'Down' }));
    try {
      await scanNow(h, owner, companyId);
    } finally {
      tweaks.delete('uk.companies_house');
    }
    expect((await changes()).json<{ changes: ChangeBody[] }>().changes).toHaveLength(before);
  });

  it('does not treat "not found" as the record having changed', async () => {
    const before = (await changes()).json<{ changes: ChangeBody[] }>().changes.length;
    tweaks.set('uk.companies_house', (result) => ({ ...result, status: 'not_found', facts: [] }));
    try {
      await scanNow(h, owner, companyId);
    } finally {
      tweaks.delete('uk.companies_house');
    }
    expect((await changes()).json<{ changes: ChangeBody[] }>().changes).toHaveLength(before);
  });

  it('is only for the organisation that holds the company', async () => {
    const stranger = await h.signIn();
    expect((await changes(stranger)).statusCode).toBe(404);
    expect((await changes(owner, MISSING_ID)).statusCode).toBe(404);
    expect((await h.request('GET', `/v1/companies/${companyId}/records/changes`)).statusCode).toBe(401);
    const { rows } = await h.admin.query<{ n: string }>(`SELECT count(*) AS n FROM registry_change WHERE organisation_id <> $1 AND company_id = $2`, [owner.organisationId, companyId]);
    expect(rows[0]?.n).toBe('0');
  });
});

import { compactEuFsf, connectorsFor, createConnectors, createSanctionsConnector, toEngineInput, type Connector, type ReferenceOptions } from '@vero/connectors';
import { runEngine, scoreFindings, selectPacks, type Fact, type SourceState } from '@vero/rules';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { companyRef } from '../src/modules/scans/pipeline';
import type { CompanyRow } from '../src/modules/scans/facts';

/**
 * Second-wave sources (docs/SECOND-WAVE-SOURCES.md). The only one built is the EU consolidated
 * financial sanctions list, as the list "eu" of sanctions.lists. Its facts are the existing
 * registry.sanctions.* facts. Switching it on adds names to the screen but, for a clean name,
 * changes no finding and no score. Fictional sample only; nothing real is called.
 */

const NOW = new Date('2026-11-15T09:00:00Z');
const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');
const fixtures = createConnectors({ env: { CONNECTOR_MODE: 'fixture', NODE_ENV: 'test' }, now: () => NOW });
const euSample = readFileSync(join(import.meta.dirname, '..', '..', '..', 'packages', 'connectors', 'test', 'samples', 'eu-fsf.xml'), 'utf8');

function euCopy(): ReferenceOptions {
  const content = compactEuFsf(euSample);
  const checkedAt = new Date(NOW.getTime() - 3_600_000);
  return {
    maxAgeHours: 48,
    sanctionsMaxAgeHours: 24,
    store: {
      async latest(key) {
        return key === 'sanctions.eu' ? { key, contentHash: sha256(content), fetchedAt: checkedAt, checkedAt, rowCount: 3 } : null;
      },
      async content(key, hash) {
        return key === 'sanctions.eu' && hash === sha256(content) ? content : null;
      },
    },
  };
}

describe('second-wave sources: the EU sanctions list', () => {
  it('a clean name screened against the EU list too gives the same findings and score', async () => {
    const gb = { incorporationCountry: 'GB', registrationNumber: '14839221', legalName: 'Kestrel Pay UK Ltd' } as CompanyRow;
    const connectors = connectorsFor(fixtures, 'GB');
    const results = await Promise.all(connectors.map((connector: Connector) => connector.lookup(companyRef(gb, null, connector))));
    const base = toEngineInput(results, connectors);

    const eu = createSanctionsConnector({ env: { SANCTIONS_LISTS: 'eu' }, now: () => NOW, reference: euCopy(), fetch: async () => new Response('', { status: 599 }) });
    const euResult = await eu.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' });
    expect(euResult.status).toBe('not_found');
    const euInput = toEngineInput([euResult], [eu]);
    const withEu = [...base.facts.filter((fact) => !fact.key.startsWith('registry.sanctions.')), ...euInput.facts];

    const packs = selectPacks({ incorporation: 'GB', markets: [] }).packs;
    const run = (facts: Fact[], sources: Record<string, SourceState>) => {
      const engine = runEngine(packs, { facts, sources, stage: 2, company_name: 'Kestrel Pay UK Ltd', as_of: NOW, declared_missing: [] });
      return { findings: engine.findings.map((f) => [f.rule_id, f.outcome, f.scored]), score: scoreFindings(engine.findings) };
    };
    expect(run(withEu as Fact[], { ...base.sources, ...euInput.sources })).toEqual(run(base.facts as Fact[], base.sources));
  });

  it('no country prefix was added for Germany, South Africa, Kenya or Ghana, and no rule mentions one', () => {
    for (const country of ['GB', 'NG', 'US-DE'] as const) {
      const packs = JSON.stringify(selectPacks({ incorporation: country, markets: [] }).packs);
      for (const prefix of ['registry.de.', 'registry.za.', 'registry.ke.', 'registry.gh.']) expect(packs).not.toContain(prefix);
    }
  });
});

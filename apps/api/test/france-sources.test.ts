import { connectorsFor, createConnectors, KESTREL_FR_SIREN, toEngineInput, type Connector } from '@vero/connectors';
import { runEngine, scoreFindings, selectPacks, type Fact, type SourceState } from '@vero/rules';
import { describe, expect, it } from 'vitest';
import { companyRef, resolveIdentifiers, STAGE_TWO } from '../src/modules/scans/pipeline';
import { connectorsForSelection, type CompanyRow } from '../src/modules/scans/facts';

/**
 * France at the data level only (docs/FRANCE.md). The fixture connectors serve fictional
 * Kestrel Pay SAS data; nothing real is called and no database row is needed: a company can't
 * be created in France yet, so this drives the pipeline's own pieces directly.
 */

const NOW = new Date('2026-11-14T09:00:00Z');
const fixtures = createConnectors({ env: { CONNECTOR_MODE: 'fixture', NODE_ENV: 'test' }, now: () => NOW });

function company(country: string, registrationNumber: string | null): CompanyRow {
  return { incorporationCountry: country, registrationNumber, legalName: country === 'FR' ? 'Kestrel Pay SAS' : 'Kestrel Pay UK Ltd' } as CompanyRow;
}

async function scanFacts(connectors: readonly Connector[], refFor: (connector: Connector) => Parameters<Connector['lookup']>[0]) {
  const results = await Promise.all(connectors.map((connector) => connector.lookup(refFor(connector))));
  return { results, ...toEngineInput(results, connectors) };
}

describe('France: data sources only', () => {
  it('an FR scan with fixtures produces the French facts, with tiers from the evidence method', async () => {
    const french = connectorsFor(fixtures, 'FR');
    // France's own sources, plus the EU VAT register, plus every source covering every country.
    expect(french.filter((c) => !c.jurisdictions.includes('*')).map((c) => c.id).sort()).toEqual(['eu.vies_vat', 'fr.cnil_dpo', 'fr.recherche_entreprises']);
    expect(french.map((c) => c.id)).toContain('sanctions.lists');
    expect(STAGE_TWO.has('fr.cnil_dpo')).toBe(true);

    // Stage one: the directory, by name only.
    const kestrel = company('FR', null);
    const first = french.filter((c) => !STAGE_TWO.has(c.id));
    const one = await scanFacts(first, (connector) => companyRef(kestrel, null, connector));
    const directory = one.results.find((r) => r.connector === 'fr.recherche_entreprises');
    expect(directory?.status).toBe('found');
    expect(directory?.provenance.method).toBe('official_live');

    // The SIREN it returned reaches the CNIL list in stage two, and nothing else.
    const ids = resolveIdentifiers({}, one.results.map((r) => ({ connectorId: r.connector, status: r.status, facts: r.facts })));
    expect(ids.siren).toBe(KESTREL_FR_SIREN);
    const cnil = french.find((c) => c.id === 'fr.cnil_dpo') as Connector;
    expect(companyRef(kestrel, null, cnil, { identifiers: ids }).siren).toBe(KESTREL_FR_SIREN);
    expect(companyRef(kestrel, null, french.find((c) => c.id === 'sanctions.lists') as Connector, { identifiers: ids }).siren).toBeUndefined();
    // A SIREN never goes to a company registered elsewhere.
    expect(companyRef(company('GB', null), null, cnil, { identifiers: ids }).siren).toBeUndefined();

    const two = await scanFacts([cnil], (connector) => companyRef(kestrel, null, connector, { identifiers: ids }));
    expect(two.results[0]?.status).toBe('found');
    expect(two.results[0]?.provenance.method).toBe('official_list');

    const keys = [...one.facts, ...two.facts].map((f) => f.key);
    for (const key of [
      'registry.fr.recherche_entreprises.identified', 'registry.fr.recherche_entreprises.siren', 'registry.fr.recherche_entreprises.status',
      'registry.fr.recherche_entreprises.created_on', 'registry.fr.recherche_entreprises.legal_form_code', 'registry.fr.recherche_entreprises.naf_code',
      'registry.fr.recherche_entreprises.hq_postcode', 'registry.fr.recherche_entreprises.directors_count', 'registry.fr.cnil_dpo.listed',
    ]) expect(keys).toContain(key);
  });

  it('a French company number is its SIREN', () => {
    const cnil = fixtures.find((c) => c.id === 'fr.cnil_dpo') as Connector;
    expect(companyRef(company('FR', KESTREL_FR_SIREN), null, cnil)).toMatchObject({ jurisdiction: 'FR', siren: KESTREL_FR_SIREN });
  });

  it('a company in GB, NG or Delaware never asks the French company directory, and no rule it gets reads a French fact', () => {
    // France has a draft pack since 16 Nov 2026, so French users bring its data rules, and with
    // them the CNIL list (a data protection register). The rules reading that list stay with
    // French companies (overlay "never"): it is matched on a SIREN.
    for (const country of ['GB', 'NG', 'US-DE'] as const) {
      const selection = selectPacks({ incorporation: country, markets: ['FR', 'GB', 'NG', 'US-DE'] });
      const chosen = connectorsForSelection(fixtures, { incorporationCountry: country }, selection).map((c) => c.id);
      expect(chosen.filter((id) => id.startsWith('fr.') && id !== 'fr.cnil_dpo')).toEqual([]);
      const reads = selection.packs.flatMap((pack) => pack.rules).flatMap((rule) => JSON.stringify([rule.applies_when, rule.satisfied_when, rule.defect_when, rule.verify_when]).match(/registry\.fr\.[a-z_.]+/g) ?? []);
      expect(reads, country).toEqual([]);
    }
  });

  it('French facts change no score: no rule reads them', async () => {
    const gb = company('GB', '14839221');
    const gbConnectors = connectorsFor(fixtures, 'GB');
    const base = await scanFacts(gbConnectors, (connector) => companyRef(gb, null, connector));
    const fr = await scanFacts(connectorsFor(fixtures, 'FR').filter((c) => c.id.startsWith('fr.')), () => ({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: KESTREL_FR_SIREN }));
    expect(fr.facts.length).toBeGreaterThan(10);

    const packs = selectPacks({ incorporation: 'GB', markets: [] }).packs;
    const run = (facts: Fact[], sources: Record<string, SourceState>) => {
      const engine = runEngine(packs, { facts, sources, stage: 2, company_name: 'Kestrel Pay UK Ltd', as_of: NOW, declared_missing: [] });
      return { findings: engine.findings.map((f) => [f.rule_id, f.outcome, f.scored]), score: scoreFindings(engine.findings) };
    };
    const without = run(base.facts, base.sources);
    const withFrance = run([...base.facts, ...fr.facts] as Fact[], { ...base.sources, ...fr.sources });
    expect(withFrance).toEqual(without);

    // And no rule in any pack mentions a French fact.
    for (const country of ['GB', 'NG', 'US-DE'] as const) {
      expect(JSON.stringify(selectPacks({ incorporation: country, markets: [] }).packs)).not.toContain('registry.fr.');
    }
  });
});

describe('France: VAT number worked out from the SIREN', () => {
  const vies = fixtures.find((c) => c.id === 'eu.vies_vat') as Connector;
  const hmrc = fixtures.find((c) => c.id === 'uk.hmrc_vat') as Connector;
  const web = fixtures.find((c) => c.id === 'web.policy_scan') as Connector;
  const directory = [{ connectorId: 'fr.recherche_entreprises', status: 'found', facts: [{ key: 'registry.fr.recherche_entreprises.siren', value: '552032534' }] }];

  it('VIES runs in the second stage, once the directory has returned the SIREN', () => {
    expect(STAGE_TWO.has('eu.vies_vat')).toBe(true);
  });

  it('a French company with a SIREN and no VAT number is asked about the derived number, marked as derived', () => {
    expect(companyRef(company('FR', '552081317'), null, vies)).toMatchObject({ vat_number: 'FR03552081317', vat_number_derived: true });
  });

  it('the SIREN the directory returned is used when the company gave none', () => {
    const ids = resolveIdentifiers({}, directory);
    expect(ids.vat_derived).toBe('FR27552032534');
    expect(ids.vat_number).toBeUndefined();
    expect(companyRef(company('FR', null), null, vies, { identifiers: ids })).toMatchObject({ vat_number: 'FR27552032534', vat_number_derived: true });
  });

  it('a VAT number the company gave wins, and is not marked as derived', () => {
    const ids = resolveIdentifiers({ vat_number: 'FR 40 123456808' }, directory);
    expect(ids.vat_derived).toBeUndefined();
    const ref = companyRef(company('FR', '552081317'), null, vies, { identifiers: ids });
    expect(ref.vat_number).toBe('FR 40 123456808');
    expect(ref.vat_number_derived).toBeUndefined();
  });

  it('the candidate goes only to VIES, only for a French company, and never to the website comparison', () => {
    const ids = resolveIdentifiers({}, directory);
    expect(companyRef(company('FR', '552081317'), 'https://example.fr', web, { identifiers: ids }).vat_number).toBeUndefined();
    expect(companyRef(company('FR', '552081317'), null, hmrc, { identifiers: ids }).vat_number).toBeUndefined();
    expect(companyRef(company('DE', '552081317'), null, vies, { identifiers: ids }).vat_number).toBeUndefined();
    expect(resolveIdentifiers({}, []).vat_derived).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import {
  ANNOTATED_RULE_IDS,
  answersToFacts,
  coverageOf,
  isDocumentRule,
  JURISDICTIONS,
  loadPack,
  overlayMode,
  packsFor,
  runEngine,
  selectPacks,
  varsIn,
  vaultSlotsForPacks,
  visibleQuestions,
  type Fact,
  type Rule,
} from '../src/index.js';

const ids = (selection: ReturnType<typeof selectPacks>) => selection.packs.flatMap((pack) => pack.rules.map((rule) => rule.id));
const COMPANY_REGISTERS = ['registry.uk.companies_house', 'registry.uk.hmrc_vat', 'registry.ng.cac', 'registry.us.delaware_vendor'];

describe('which rules a company is measured against', () => {
  it('with no other market, it is the country of incorporation in full', () => {
    const selection = selectPacks({ incorporation: 'GB', markets: ['GB'] });
    expect(selection.used).toEqual([{ jurisdiction: 'GB', version: loadPack('GB').version, mode: 'full', rules: loadPack('GB').rules.length }]);
    expect(selection.overlay_markets).toEqual([]);
  });

  it('a Delaware company with UK users gets UK compliance rules, and no UK filing rules', () => {
    const selection = selectPacks({ incorporation: 'US-DE', markets: ['GB'] });
    const all = ids(selection);
    expect(selection.used.map((use) => [use.jurisdiction, use.mode])).toEqual([['US', 'full'], ['US-DE', 'full'], ['GB', 'overlay']]);
    for (const id of ['GB.DP.ICO_FEE', 'GB.DP.PRIVACY_NOTICE', 'GB.DP.ROPA', 'GB.AI.DPIA']) expect(all).toContain(id);
    const uk = all.filter((id) => id.startsWith('GB.'));
    for (const id of uk) expect(id).not.toMatch(/^GB\.(CORP|TAX|EQUITY|FUND|IP|PREMISES)\./);
    expect(all).not.toContain('GB.CORP.CONFIRMATION_STATEMENT');
    expect(all).not.toContain('GB.TAX.CT_REGISTRATION');
    // Every Delaware and federal rule is still there.
    expect(all.filter((id) => id.startsWith('US')).length).toBe(loadPack('US').rules.length + loadPack('US-DE').rules.length);
  });

  it('a market answered as "US" brings the federal and Delaware rules for a UK company, without their filings', () => {
    const all = ids(selectPacks({ incorporation: 'GB', markets: ['US'] }));
    expect(all).toContain('US.CONSUMER.COPPA');
    expect(all).toContain('US-DE.DP.CCPA_CHOICES');
    for (const id of ['US.TAX.EIN', 'US.TAX.FORM_5472', 'US-DE.CORP.ANNUAL_REPORT', 'US-DE.TAX.RETURNS', 'US-DE.STATE.SALES_TAX']) expect(all).not.toContain(id);
  });

  it('employer rules apply only where the company employs people', () => {
    const usersOnly = ids(selectPacks({ incorporation: 'US-DE', markets: ['GB'] }));
    expect(usersOnly).not.toContain('GB.EMP.PENSION');
    const withStaff = ids(selectPacks({ incorporation: 'US-DE', markets: ['GB'], employee_countries: ['GB'] }));
    expect(withStaff).toContain('GB.EMP.PENSION');
    // Staff there counts as operating there, whatever else was said.
    expect(ids(selectPacks({ incorporation: 'US-DE', markets: [], employee_countries: ['NG'] }))).toContain('NG.EMP.PENCOM');
  });

  it('ignores anywhere outside the three countries, and repeats', () => {
    const selection = selectPacks({ incorporation: 'GB', markets: ['other', 'BR', 'GB', 'NG', 'NG'] });
    expect(selection.overlay_markets).toEqual(['NG']);
  });

  it('no rule is counted twice, in any combination', () => {
    const countries = ['GB', 'NG', 'US-DE'] as const;
    for (const incorporation of countries) {
      const selection = selectPacks({ incorporation, markets: ['GB', 'NG', 'US', 'US-DE'], employee_countries: ['GB', 'NG', 'US'] });
      const all = ids(selection);
      expect(new Set(all).size).toBe(all.length);
      expect(new Set(selection.used.map((use) => use.jurisdiction)).size).toBe(selection.used.length);
      const shared = selection.packs.flatMap((pack) => pack.rules).flatMap((rule) => (rule.shared_obligation ? [rule.shared_obligation] : []));
      expect(new Set(shared).size, incorporation).toBe(shared.length);
    }
  });

  it('a shared policy stays with the country of incorporation', () => {
    const all = ids(selectPacks({ incorporation: 'GB', markets: ['NG', 'US'] }));
    expect(all).toContain('GB.AI.GOVERNANCE');
    expect(all).not.toContain('NG.AI.GOVERNANCE');
    expect(all).not.toContain('US-DE.AI.GOVERNANCE');
  });

  it('no rule that can follow a company abroad reads a company register', () => {
    for (const jurisdiction of JURISDICTIONS) {
      for (const rule of loadPack(jurisdiction).rules) {
        if (overlayMode(rule) === 'never') continue;
        const logics = [rule.applies_when, rule.satisfied_when, ...(rule.defect_when === undefined ? [] : [rule.defect_when]), ...(rule.verify_when === undefined ? [] : [rule.verify_when])];
        for (const key of logics.flatMap(varsIn)) {
          expect(COMPANY_REGISTERS.some((prefix) => key.startsWith(`${prefix}.`)), `${rule.id} reads ${key}`).toBe(false);
        }
      }
    }
  });

  it('by default layers 3 and 6 follow a company, and a rule can opt in or out', () => {
    expect(overlayMode({ layer: 3 })).toBe('market');
    expect(overlayMode({ layer: 6 })).toBe('market');
    for (const layer of [1, 2, 4, 5]) expect(overlayMode({ layer })).toBe('never');
    expect(overlayMode({ layer: 3, market_overlay: 'never' })).toBe('never');
    expect(overlayMode({ layer: 4, market_overlay: 'market' })).toBe('market');
  });

  it('every rule named in the annotations exists', () => {
    const known = new Set(JURISDICTIONS.flatMap((code) => loadPack(code).rules.map((rule) => rule.id)));
    for (const id of ANNOTATED_RULE_IDS) expect(known, id).toContain(id);
  });

  it('nothing in the packs follows investor countries, so nothing has been invented', () => {
    for (const jurisdiction of JURISDICTIONS) {
      for (const rule of loadPack(jurisdiction).rules) {
        expect(varsIn(rule.applies_when), rule.id).not.toContain('answers.investor_countries');
      }
    }
  });

  it('the vault follows the rules in play, and asks for no filing slot from abroad', () => {
    const selection = selectPacks({ incorporation: 'US-DE', markets: ['GB'] });
    const slots = vaultSlotsForPacks(selection.packs);
    const keys = slots.map((slot) => slot.id);
    expect(keys).toContain('gb_ropa');
    expect(keys).toContain('de_good_standing');
    expect(keys).not.toContain('gb_ct_registration');
    expect(new Set(keys).size).toBe(keys.length);
    const allowed = new Set(ids(selection));
    for (const slot of slots) for (const ruleId of slot.rule_ids) expect(allowed).toContain(ruleId);
  });

  it('the questionnaire asks about a country with users, even when registered elsewhere', () => {
    const fields = (answers: Parameters<typeof visibleQuestions>[0]) => visibleQuestions(answers).flatMap((question) => question.fields.map((field) => field.id));
    const base = { jurisdiction: 'US-DE', processes_personal_data: true };
    expect(fields({ ...base, user_countries: ['NG'] })).toContain('data_subjects_ng_6m');
    expect(fields({ ...base, user_countries: ['GB'] })).toContain('data_subjects_gb_12m');
    expect(fields({ ...base, user_countries: ['US'] })).not.toContain('data_subjects_ng_6m');
  });

  it('every pack still loads whole on its own', () => {
    for (const code of ['GB', 'NG', 'US-DE'] as const) {
      expect(selectPacks({ incorporation: code, markets: [] }).packs).toEqual(packsFor(code));
    }
  });
});

describe('an unseen document is unknown, not missing', () => {
  const AS_OF = '2026-11-05';
  const pack = [loadPack('GB')];
  const run = (facts: Fact[], declared: string[] = []) =>
    new Map(
      runEngine(pack, { facts, stage: 3, as_of: AS_OF, declared_missing: declared, sources: { 'web.policy': 'unavailable', 'registry.uk': 'unavailable', 'registry.sanctions': 'unavailable' } }).findings.map((item) => [item.rule_id, item]),
    );
  const answers = (values: Parameters<typeof answersToFacts>[0]) => answersToFacts({ jurisdiction: 'GB', incorporated: true, ...values }).facts;
  const RULE = 'GB.IP.CONTRACTOR_ASSIGNMENT';
  const contractors = { has_contractors: true };

  it('no document and no answer: "we haven\'t seen this yet", and not scored', () => {
    expect(run(answers(contractors)).get(RULE)).toMatchObject({ outcome: 'verify', reason: 'not_seen_yet', scored: false });
  });

  it('saying you don\'t have it makes it a real gap', () => {
    expect(run(answers(contractors), [RULE]).get(RULE)).toMatchObject({ outcome: 'gap', scored: true, declared_missing: true });
  });

  it('a definite no is a real gap', () => {
    expect(run(answers({ ...contractors, ip_contractors_signed: false })).get(RULE)).toMatchObject({ outcome: 'gap', scored: true, free_plan_evidence: true });
  });

  it('a yes passes, and says "You told us"', () => {
    const finding = run(answers({ ...contractors, ip_contractors_signed: true })).get(RULE);
    expect(finding).toMatchObject({ outcome: 'pass', scored: true });
    expect(finding?.facts_used.find((item) => item.key === 'answers.ip_contractors_signed')?.how_we_know).toBe('You told us');
  });

  it('a document beats a no', () => {
    const facts = [...answers({ ...contractors, ip_contractors_signed: false }), { key: 'vault.gb_contractor_ip_assignment.present', value: true }];
    expect(run(facts).get(RULE)?.outcome).toBe('pass');
  });

  it('a follow-up nobody was asked is not a no', () => {
    // No contractors, so the question was hidden and defaulted to false. The rule doesn't apply.
    expect(run(answers({ has_contractors: false })).get(RULE)?.outcome).toBe('not_applicable');
    // The partner question is hidden for someone who holds money themselves: their FCA rule stays unseen.
    expect(run(answers({ sectors: ['payments'], payments_mode: ['hold_funds'] })).get('GB.FIN.FCA_AUTHORISATION')?.outcome).toBe('verify');
  });

  it('a rule waiting for a lawyer stays that way, whatever was said', () => {
    const rule = loadPack('GB').rules.find((item: Rule) => item.confidence === 'needs_review');
    const finding = run(answers({}), [rule?.id ?? '']).get(rule?.id ?? '');
    expect(finding?.outcome === 'verify' || finding?.outcome === 'not_applicable').toBe(true);
    expect(finding?.scored).toBe(false);
    expect(finding?.document_rule).toBe(false);
  });

  it('a Delaware certificate we have not seen is unknown, not failed', () => {
    const read = (facts: Fact[]) => runEngine(packsFor('US-DE'), { facts, stage: 3, as_of: AS_OF }).findings.find((item) => item.rule_id.endsWith('GOOD_STANDING'));
    expect(read([])).toMatchObject({ outcome: 'verify', reason: 'not_seen_yet' });
    // Uploaded but not checked by the person is a different kind of "can't say".
    expect(read([{ key: 'vault.de_good_standing.present', value: true }, { key: 'vault.de_good_standing.dated', value: '2026-10-12' }])).toMatchObject({ outcome: 'verify', reason: 'proxy_only' });
  });

  it('a register that says no is a gap, even though a document could have answered it', () => {
    const facts = [...answers({ processes_personal_data: true }), { key: 'registry.uk.ico.listed', value: false }];
    const findings = runEngine(pack, { facts, stage: 3, as_of: AS_OF }).findings;
    expect(findings.find((item) => item.rule_id === 'GB.DP.ICO_FEE')?.outcome).toBe('gap');
    // And one that couldn't be reached decides nothing.
    const down = runEngine(pack, { facts, sources: { 'registry.uk.ico': 'unavailable' }, stage: 3, as_of: AS_OF }).findings;
    expect(down.find((item) => item.rule_id === 'GB.DP.ICO_FEE')?.outcome).toBe('verify');
  });

  it('a rule needing both a statement and a website stays unseen when only the website is known', () => {
    const facts = [...answers({ processes_personal_data: true }), { key: 'web.policy.rights_section', value: true }];
    const finding = runEngine(pack, { facts, stage: 3, as_of: AS_OF }).findings.find((item) => item.rule_id === 'GB.DP.RIGHTS');
    expect(finding).toMatchObject({ outcome: 'verify', reason: 'not_seen_yet' });
  });

  it('only rules decided by documents alone can be answered with "we don\'t have this"', () => {
    const rules = JURISDICTIONS.flatMap((code) => loadPack(code).rules);
    const eligible = rules.filter(isDocumentRule);
    expect(eligible.length).toBeGreaterThan(150);
    for (const rule of eligible) {
      expect(rule.confidence, rule.id).toBe('verified');
      expect(varsIn(rule.satisfied_when).some((key) => key.startsWith('registry.') || key.startsWith('web.') || key.startsWith('attest.')), rule.id).toBe(false);
    }
    expect(eligible.map((rule) => rule.id)).not.toContain('GB.DP.ICO_FEE');
    expect(eligible.map((rule) => rule.id)).toContain('GB.IP.NDA');
  });

  it('counts what a score rests on: not_applicable is left out', () => {
    const finding = (outcome: Parameters<typeof coverageOf>[0][number]['outcome'], scored: boolean) => ({ rule_id: outcome, layer: 1, severity: 'high' as const, outcome, scored });
    expect(coverageOf([finding('pass', true), finding('gap', true), finding('defect', true), finding('verify', false), finding('not_applicable', false)])).toEqual({ counted: 3, total: 4 });
  });
});

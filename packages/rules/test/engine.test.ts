import { describe, expect, it } from 'vitest';
import {
  howWeKnow,
  isClosedWorld,
  loadPack,
  packsFor,
  REGISTRY_FACT_KEYS,
  runEngine,
  varsIn,
  type Fact,
  type FactValue,
  type Finding,
  type Pack,
  type Rule,
} from '../src/index.js';

const AS_OF = '2026-11-05';
const CH = 'registry.uk.companies_house';

function facts(values: Record<string, FactValue>): Fact[] {
  return Object.entries(values).map(([key, value]) => ({ key, value }));
}

function run(packs: Pack[], values: Record<string, FactValue>, extra: { sources?: Record<string, 'ok' | 'unavailable' | 'error' | 'ambiguous' | 'unsupported' | 'waiting'>; stage?: number; as_of?: string; company_name?: string } = {}) {
  return runEngine(packs, { facts: facts(values), stage: extra.stage ?? 3, as_of: extra.as_of ?? AS_OF, sources: extra.sources ?? {}, ...(extra.company_name ? { company_name: extra.company_name } : {}) });
}

function find(findings: Finding[], id: string): Finding {
  const finding = findings.find((f) => f.rule_id === id);
  if (!finding) throw new Error(`No finding for ${id}`);
  return finding;
}

const gb = [loadPack('GB')];
const ng = [loadPack('NG')];
const de = packsFor('US-DE');

describe('outcomes', () => {
  it('passes when satisfied', () => {
    const { findings } = run(gb, { [`${CH}.confirmation_overdue`]: false });
    const f = find(findings, 'GB.CORP.CONFIRMATION_STATEMENT');
    expect(f.outcome).toBe('pass');
    expect(f.scored).toBe(true);
    expect(f.reason).toBeNull();
  });

  it('is a defect when something exists but is wrong', () => {
    const { findings } = run(gb, { [`${CH}.confirmation_overdue`]: true });
    const f = find(findings, 'GB.CORP.CONFIRMATION_STATEMENT');
    expect(f.outcome).toBe('defect');
    expect(f.scored).toBe(true);
  });

  it('is not checked yet when nothing is on file, and not scored', () => {
    const { findings } = run(gb, {});
    const f = find(findings, 'GB.IP.FOUNDER_ASSIGNMENT');
    expect(f).toMatchObject({ outcome: 'verify', reason: 'not_seen_yet', scored: false, document_rule: true, declared_missing: false });
    expect(f.severity_word).toBe('Urgent');
  });

  it('is a gap once the person says they do not have it, and a document beats that', () => {
    const said = runEngine(gb, { facts: [], stage: 3, as_of: AS_OF, declared_missing: ['GB.IP.FOUNDER_ASSIGNMENT'] });
    const f = find(said.findings, 'GB.IP.FOUNDER_ASSIGNMENT');
    expect(f).toMatchObject({ outcome: 'gap', scored: true, declared_missing: true, free_plan_evidence: true });
    expect(f.facts_used[0]?.how_we_know).toBe("You told us you don't have this");
    const held = runEngine(gb, { facts: facts({ 'vault.gb_founder_ip_assignment.present': true }), stage: 3, as_of: AS_OF, declared_missing: ['GB.IP.FOUNDER_ASSIGNMENT'] });
    expect(find(held.findings, 'GB.IP.FOUNDER_ASSIGNMENT')).toMatchObject({ outcome: 'pass', declared_missing: false });
  });

  it('a statement only counts on a rule decided by documents alone', () => {
    const said = runEngine(gb, { facts: facts({ 'answers.processes_personal_data': true }), stage: 3, as_of: AS_OF, declared_missing: ['GB.DP.ICO_FEE'] });
    expect(find(said.findings, 'GB.DP.ICO_FEE')).toMatchObject({ document_rule: false, declared_missing: false, outcome: 'verify' });
  });

  it('passes once the document is in the vault', () => {
    const { findings } = run(gb, { 'vault.gb_founder_ip_assignment.present': true });
    expect(find(findings, 'GB.IP.FOUNDER_ASSIGNMENT').outcome).toBe('pass');
  });

  it('shows a proxy as verify, not as a pass', () => {
    const { findings } = run(gb, {
      [`${CH}.directors_idv_outstanding_count`]: 1,
      [`${CH}.directors_idv_next_due`]: '2026-11-18',
    });
    const f = find(findings, 'GB.CORP.DIRECTOR_IDV');
    expect(f.outcome).toBe('verify');
    expect(f.reason).toBe('proxy_only');
    expect(f.scored).toBe(false);
  });

  it('calls a director check a gap only once the date has passed', () => {
    const { findings } = run(gb, {
      [`${CH}.directors_idv_outstanding_count`]: 1,
      [`${CH}.directors_idv_next_due`]: '2026-10-01',
    });
    expect(find(findings, 'GB.CORP.DIRECTOR_IDV').outcome).toBe('gap');
  });

  it('fills in the company name', () => {
    const { findings } = run(gb, {}, { company_name: 'Kestrel Pay UK Ltd' });
    expect(find(findings, 'GB.IP.FOUNDER_ASSIGNMENT').text.headline).toBe("Your founders haven't signed their work over to Kestrel Pay UK Ltd");
  });
});

describe('triggers', () => {
  it('turns employee rules on and off', () => {
    expect(find(run(gb, { 'answers.has_employees': true }).findings, 'GB.EMP.LIABILITY_INSURANCE').reason).toBe('not_seen_yet');
    const off = find(run(gb, { 'answers.has_employees': false }).findings, 'GB.EMP.LIABILITY_INSURANCE');
    expect(off.outcome).toBe('not_applicable');
    expect(off.reason).toBe('trigger_off');
  });

  it('asks rather than guesses when a trigger has not been answered', () => {
    const f = find(run(gb, {}).findings, 'GB.EMP.LIABILITY_INSURANCE');
    expect(f.outcome).toBe('verify');
    expect(f.reason).toBe('not_answered');
    expect(f.scored).toBe(false);
  });

  it('switches foreign ownership on for Delaware', () => {
    expect(find(run(de, { 'answers.foreign_ownership_25_plus': true }).findings, 'US.TAX.FORM_5472').reason).toBe('not_seen_yet');
    expect(find(run(de, { 'answers.foreign_ownership_25_plus': false }).findings, 'US.TAX.FORM_5472').outcome).toBe('not_applicable');
  });

  it('separates corporations from LLCs', () => {
    const corp = run(de, { 'company.entity_type': 'c_corp' }).findings;
    expect(find(corp, 'US-DE.CORP.FRANCHISE_TAX').reason).toBe('not_seen_yet');
    expect(find(corp, 'US-DE.CORP.LLC_TAX').outcome).toBe('not_applicable');
    const llc = run(de, { 'company.entity_type': 'llc' }).findings;
    expect(find(llc, 'US-DE.CORP.FRANCHISE_TAX').outcome).toBe('not_applicable');
    expect(find(llc, 'US-DE.CORP.LLC_TAX').reason).toBe('not_seen_yet');
  });

  it('does not ask for a Delaware licence just because the company is incorporated there', () => {
    expect(find(run(de, { 'answers.operates_in_delaware': false }).findings, 'US-DE.TAX.BUSINESS_LICENSE').outcome).toBe('not_applicable');
  });

  it('asks a partner-only fintech for the agreement', () => {
    const modes = { 'answers.payments_mode': ['psp_only'], 'answers.sectors': ['none'] };
    expect(find(run(ng, modes).findings, 'NG.FIN.CBN_LICENCE').reason).toBe('not_seen_yet');
    expect(find(run(ng, { ...modes, 'vault.ng_licensed_partner_agreement.present': true }).findings, 'NG.FIN.CBN_LICENCE').outcome).toBe('pass');
    expect(find(run(ng, { 'answers.payments_mode': ['none'], 'answers.sectors': ['none'] }).findings, 'NG.FIN.CBN_LICENCE').outcome).toBe('not_applicable');
  });

  it('skips rules for a later stage', () => {
    const f = find(run(gb, {}, { stage: 2 }).findings, 'GB.COM.SLA');
    expect(f.outcome).toBe('not_applicable');
    expect(f.reason).toBe('before_stage');
  });
});

describe('confidence: needs_review', () => {
  it('returns verify and is never scored, however good or bad the facts are', () => {
    const low = find(run(ng, { 'answers.processes_personal_data': true, 'answers.data_subjects_ng_6m': 500, 'registry.ng.ndpc.listed': false }).findings, 'NG.DP.DCPMI_REGISTRATION');
    expect(low.confidence).toBe('needs_review');
    expect(low.outcome).toBe('verify');
    expect(low.reason).toBe('needs_review');
    expect(low.scored).toBe(false);
    const high = find(run(ng, { 'registry.ng.ndpc.listed': true }).findings, 'NG.DP.DCPMI_REGISTRATION');
    expect(high.outcome).toBe('verify');
  });

  it('stays not_applicable when its trigger is off', () => {
    const f = find(run(ng, { 'answers.processes_personal_data': false }).findings, 'NG.DP.DCPMI_REGISTRATION');
    expect(f.outcome).toBe('not_applicable');
  });

  it('still shows the facts behind it', () => {
    const f = find(run(ng, { 'answers.processes_personal_data': true, 'answers.data_subjects_ng_6m': 500, 'registry.ng.ndpc.listed': false }).findings, 'NG.DP.DCPMI_REGISTRATION');
    expect(f.facts_used.find((u) => u.key === 'registry.ng.ndpc.listed')?.value).toBe(false);
  });
});

describe('unavailable sources', () => {
  it('is verify, not a failure, when the source is down', () => {
    const { findings } = run(gb, {}, { sources: { [CH]: 'unavailable' } });
    const f = find(findings, 'GB.CORP.CONFIRMATION_STATEMENT');
    expect(f.outcome).toBe('verify');
    expect(f.reason).toBe('source_unavailable');
    expect(f.scored).toBe(false);
  });

  it('ignores a value from a source marked down, even if one is passed in', () => {
    const { findings } = run(gb, { [`${CH}.confirmation_overdue`]: true }, { sources: { [CH]: 'unavailable' } });
    expect(find(findings, 'GB.CORP.CONFIRMATION_STATEMENT').outcome).toBe('verify');
  });

  it('reports errors and ambiguity separately', () => {
    expect(find(run(gb, {}, { sources: { [CH]: 'error' } }).findings, 'GB.CORP.STATUS').reason).toBe('source_error');
    expect(find(run(gb, {}, { sources: { [CH]: 'ambiguous' } }).findings, 'GB.CORP.STATUS').reason).toBe('source_ambiguous');
  });

  it('says a missing identifier is what stops a check, never a failure', () => {
    const vat = 'registry.uk.hmrc_vat';
    // Even with an old value passed in, a source that couldn't run tells us nothing.
    const finding = find(run(gb, { [`${vat}.registered`]: true }, { sources: { [vat]: 'unsupported' } }).findings, 'GB.TAX.VAT_RETURNS');
    expect(finding.outcome).toBe('verify');
    expect(finding.reason).toBe('needs_identifier');
    expect(finding.reason_source).toBe(vat);
    expect(finding.scored).toBe(false);
  });

  it('says a vendor report that is still being prepared is waiting', () => {
    const finding = find(run(de, {}, { sources: { 'registry.us.delaware_vendor': 'waiting' } }).findings, 'US-DE.CORP.ENTITY_ON_RECORD');
    expect(finding.outcome).toBe('verify');
    expect(finding.reason).toBe('source_waiting');
  });

  it('lets a document clear a rule whose source is down', () => {
    const { findings } = run(de, { 'vault.de_certificate_of_incorporation.present': true }, { sources: { 'registry.us.delaware_vendor': 'unavailable' } });
    expect(find(findings, 'US-DE.CORP.ENTITY_ON_RECORD').outcome).toBe('pass');
  });

  it('stays verify when a source is down and no document is on file', () => {
    const { findings } = run(de, {}, { sources: { 'registry.us.delaware_vendor': 'unavailable' } });
    const f = find(findings, 'US-DE.CORP.ENTITY_ON_RECORD');
    expect(f.outcome).toBe('verify');
    expect(f.reason).toBe('source_unavailable');
  });

  it('follows derived facts back to the source that is down', () => {
    const { findings } = run(gb, { 'answers.has_website': true }, { sources: { 'web.policy': 'unavailable' } });
    const f = find(findings, 'GB.DP.COOKIE_CONSENT');
    expect(f.outcome).toBe('verify');
    expect(f.reason).toBe('source_unavailable');
  });

  it('a source that really found nothing is a gap, because that is a different thing', () => {
    const { findings } = run(gb, { 'answers.processes_personal_data': true, 'registry.uk.ico.listed': false });
    expect(find(findings, 'GB.DP.ICO_FEE').outcome).toBe('gap');
  });

  it.each(['GB', 'NG', 'US-DE'] as const)('%s: with every source down, no rule resting only on a source can fail', (jurisdiction) => {
    const packs = packsFor(jurisdiction);
    // Switch on every trigger we can, then take every source away.
    const answers: Record<string, FactValue> = {
      'company.entity_type': 'c_corp', 'answers.has_website': true, 'answers.has_app': true, 'answers.processes_personal_data': true,
      'answers.has_employees': true, 'answers.has_contractors': true, 'answers.customer_type': 'both',
    };
    const sources = { registry: 'unavailable', web: 'unavailable' } as const;
    const { findings } = run(packs, answers, { sources, stage: 5 });
    const rules = new Map(packs.flatMap((p) => p.rules.map((r) => [r.id, r] as [string, Rule])));
    const sourceOnly = (rule: Rule) => {
      const vars = varsIn(rule.satisfied_when);
      return vars.length > 0 && vars.every((key) => key.startsWith('registry.') || key.startsWith('web.') || key.startsWith('derived.web.') || key.startsWith('derived.uk.'));
    };
    const checked = findings.filter((f) => sourceOnly(rules.get(f.rule_id) as Rule));
    expect(checked.length).toBeGreaterThan(3);
    for (const f of checked) {
      expect(['verify', 'not_applicable'], `${f.rule_id} was ${f.outcome}`).toContain(f.outcome);
      expect(f.scored).toBe(false);
    }
  });
});

describe('effective dates', () => {
  it('does not apply a rule before it comes into force', () => {
    const before = find(run(gb, { 'answers.has_website': true }, { as_of: '2026-02-04' }).findings, 'GB.DP.COOKIE_CONSENT');
    expect(before.outcome).toBe('not_applicable');
    expect(before.reason).toBe('not_in_force');
    const on = find(run(gb, { 'answers.has_website': true, 'web.policy.cookies_before_consent_count': 1 }, { as_of: '2026-02-05' }).findings, 'GB.DP.COOKIE_CONSENT');
    expect(on.outcome).toBe('defect');
  });

  it('stops a rule on its end date', () => {
    const rule = { ...(loadPack('GB').rules[0] as Rule), effective_to: '2026-11-05' };
    const pack = { ...loadPack('GB'), rules: [rule] };
    expect((run([pack], {}, { as_of: '2026-11-04' }).findings[0] as Finding).reason).not.toBe('not_in_force');
    expect((run([pack], {}, { as_of: '2026-11-05' }).findings[0] as Finding).reason).toBe('not_in_force');
  });

  it('accepts a Date as well as a string', () => {
    const result = runEngine(gb, { facts: [], stage: 2, as_of: new Date('2026-11-05T09:42:00Z') });
    expect(result.as_of).toBe('2026-11-05');
  });
});

describe('Delaware honesty', () => {
  it('passes good standing only on a validated, recent certificate', () => {
    const present = { 'vault.de_good_standing.present': true };
    expect(find(run(de, present).findings, 'US-DE.CORP.GOOD_STANDING').outcome).toBe('verify');
    expect(find(run(de, { ...present, 'vault.de_good_standing.validated': true, 'vault.de_good_standing.dated': '2026-10-12' }).findings, 'US-DE.CORP.GOOD_STANDING').outcome).toBe('pass');
    expect(find(run(de, { ...present, 'vault.de_good_standing.validated': true, 'vault.de_good_standing.dated': '2024-10-12' }).findings, 'US-DE.CORP.GOOD_STANDING').outcome).toBe('gap');
  });

  it('has no live status fact to read', () => {
    expect(REGISTRY_FACT_KEYS.filter((k) => k.includes('delaware_vendor') && /good_standing|franchise/.test(k))).toEqual([]);
    const reads = packsFor('US-DE').flatMap((p) => p.rules.flatMap((r) => varsIn(r.satisfied_when)));
    expect(reads).not.toContain('registry.us.delaware_vendor.vendor_status');
  });

  it('says the US BOI duty no longer applies to a domestic company', () => {
    expect(find(run(de, { 'answers.foreign_entity_registered_in_us': false }).findings, 'US.CORP.BOI_FOREIGN_ENTITY').outcome).toBe('not_applicable');
  });
});

describe('Nigeria annual returns (proxy)', () => {
  it('never claims returns are filed from "active" alone', () => {
    const f = find(run(ng, { 'registry.ng.cac.status': 'active' }).findings, 'NG.CORP.ANNUAL_RETURNS');
    expect(f.outcome).toBe('verify');
  });
});

describe('how we know', () => {
  const asOf = new Date('2026-11-05T12:00:00Z');
  const base = { source: 'x.y', retrieved_at: '2026-11-05T09:42:00Z' };

  it('uses the approved plain words', () => {
    expect(howWeKnow({ ...base, source_name: 'Companies House', method: 'official_live' }, asOf)).toBe('Checked with Companies House today');
    expect(howWeKnow({ ...base, source_name: 'CAC', method: 'licensed_vendor' }, asOf)).toBe('From our licensed data provider');
    expect(howWeKnow({ ...base, source_name: 'NDPC', method: 'official_list' }, asOf)).toBe('Found on the NDPC list');
    expect(howWeKnow({ ...base, source_name: 'you', method: 'document' }, asOf)).toBe('You uploaded this and we read it');
    expect(howWeKnow({ ...base, source_name: 'you', method: 'attested' }, asOf)).toBe('You told us');
    expect(howWeKnow({ ...base, source_name: 'lawyer', method: 'lawyer' }, asOf)).toBe('You uploaded this and it was reviewed');
  });

  it('gives the date when it was not today', () => {
    expect(howWeKnow({ ...base, source_name: 'Companies House', method: 'official_live', retrieved_at: '2026-10-12T09:00:00Z' }, asOf)).toBe('Checked with Companies House on 12 October 2026');
  });

  it('treats a fact with no provenance as something you told us', () => {
    expect(howWeKnow(undefined, asOf)).toBe('You told us');
    const { findings } = run(gb, { [`${CH}.confirmation_overdue`]: false });
    expect(find(findings, 'GB.CORP.CONFIRMATION_STATEMENT').facts_used[0]?.how_we_know).toBe('You told us');
  });

  it('attaches provenance to the finding', () => {
    const result = runEngine(gb, {
      facts: [{ key: `${CH}.confirmation_overdue`, value: false, provenance: { source: 'uk.companies_house', source_name: 'Companies House', method: 'official_live', retrieved_at: '2026-11-05T09:42:00Z' } }],
      stage: 2,
      as_of: AS_OF,
    });
    expect(find(result.findings, 'GB.CORP.CONFIRMATION_STATEMENT').facts_used[0]?.how_we_know).toBe('Checked with Companies House today');
  });
});

describe('engine boundaries', () => {
  it('records pack versions for the snapshot', () => {
    expect(run(de, {}).pack_versions).toEqual({ US: '0.2.0', 'US-DE': '0.2.0' });
  });

  it('rejects bad input', () => {
    expect(() => runEngine(gb, { facts: [], stage: 9, as_of: AS_OF })).toThrow();
    expect(() => runEngine(gb, { facts: [{ key: 'has space', value: 1 }], stage: 2, as_of: AS_OF })).toThrow();
    expect(() => runEngine(gb, { facts: [], stage: 2, as_of: 'not-a-date' })).toThrow();
  });

  it('knows which evidence is the company\'s own', () => {
    expect(isClosedWorld('vault.x.present')).toBe(true);
    expect(isClosedWorld('attest.x')).toBe(true);
    expect(isClosedWorld('registry.x')).toBe(false);
  });

  it('marks what a free scan can use', () => {
    const { findings } = run(gb, {});
    expect(find(findings, 'GB.CORP.STATUS').free_plan_evidence).toBe(true);
    expect(find(findings, 'GB.IP.FOUNDER_ASSIGNMENT').free_plan_evidence).toBe(false);
  });
});

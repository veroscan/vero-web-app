import { describe, expect, it } from 'vitest';
import {
  answersToFacts,
  computeDerived,
  INTERNATIONAL,
  loadPack,
  packsFor,
  runEngine,
  selectPacks,
  validatePack,
  vaultSlotsFor,
  varsIn,
  visibleQuestions,
  type Fact,
  type FactValue,
  type Rule,
  type SourceState,
} from '../src/index.js';

/**
 * The draft packs for Switzerland, Singapore, Australia, New Zealand and Canada (16 Nov 2026).
 * Each is a draft until a lawyer approves it. These tests hold them to the rules they were
 * written under: a register decides a status only in its own words, a source that is off or
 * wasn't asked gives "verify", and nothing uncertain on the map can fail a company.
 */
const AS_OF = '2026-12-15';
const COUNTRIES = ['CH', 'SG', 'AU', 'NZ', 'CA'] as const;
type Country = (typeof COUNTRIES)[number];

const facts = (prefix: string, values: Record<string, FactValue>): Fact[] => Object.entries(values).map(([key, value]) => ({ key: `${prefix}.${key}`, value }));
const logicOf = (rule: Rule) => [rule.applies_when, rule.satisfied_when, ...(rule.defect_when === undefined ? [] : [rule.defect_when]), ...(rule.verify_when === undefined ? [] : [rule.verify_when])];

function finding(country: Country, ruleId: string, input: Fact[], sources: Record<string, SourceState> = {}) {
  const result = runEngine([loadPack(country)], { facts: input, sources, stage: 5, as_of: AS_OF });
  const found = result.findings.find((item) => item.rule_id === ruleId);
  if (!found) throw new Error(`${ruleId} not evaluated`);
  return found;
}

/** The rule each register decides, the facts of a live company, and those of a company that is gone. */
const STATUS: Record<Country, { rule: string; prefix: string; live: Record<string, FactValue>; gone: Record<string, FactValue>; odd: Record<string, FactValue> }> = {
  CH: { rule: 'CH.CORP.STATUS', prefix: 'registry.ch.zefix', live: { identified: true, status: 'active' }, gone: { identified: true, status: 'cancelled' }, odd: { identified: true, status: 'unknown' } },
  SG: { rule: 'SG.CORP.STATUS', prefix: 'registry.sg.acra', live: { identified: true, status: 'registered' }, gone: { identified: true, status: 'deregistered' }, odd: { identified: true, status: 'gazetted' } },
  // ABN Lookup is the tax register: it decides the ABN, never the company.
  AU: { rule: 'AU.TAX.ABN', prefix: 'registry.au.abr', live: { identified: true, abn_status: 'active' }, gone: { identified: true, abn_status: 'cancelled' }, odd: { identified: true, abn_status: 'suspended' } },
  NZ: { rule: 'NZ.CORP.STATUS', prefix: 'registry.nz.companies', live: { identified: true, status_code: '50' }, gone: { identified: true, status_code: '80' }, odd: { identified: true, status_code: '62' } },
  CA: { rule: 'CA.CORP.STATUS', prefix: 'registry.ca.corporations', live: { identified: true, status: 'active' }, gone: { identified: true, status: 'dissolved' }, odd: { identified: true, status: 'inactive' } },
};

describe.each(COUNTRIES)('the %s draft pack', (country) => {
  const pack = loadPack(country);
  const spec = STATUS[country];

  it('loads, validates and stays a draft at 0.1.0, with the International pack after it', () => {
    expect(() => validatePack(pack)).not.toThrow();
    expect(pack.status).toBe('draft');
    expect(pack.version).toBe('0.1.0');
    expect(pack.rules.length).toBeGreaterThanOrEqual(10);
    for (const rule of pack.rules) expect(rule.status).toBe('draft');
    expect(packsFor(country).map((item) => item.jurisdiction)).toEqual([country, INTERNATIONAL]);
  });

  it('passes a company the register shows as live', () => {
    expect(finding(country, spec.rule, facts(spec.prefix, spec.live)).outcome).toBe('pass');
  });

  it('gives the defect when the register itself says the company (or ABN) is gone', () => {
    expect(finding(country, spec.rule, facts(spec.prefix, spec.gone)).outcome).toBe('defect');
  });

  it('gives verify when the source is off, was not asked, missed the company, or used a word we have not confirmed', () => {
    const off = finding(country, spec.rule, facts(spec.prefix, spec.gone), { [spec.prefix]: 'unavailable' });
    expect(off).toMatchObject({ outcome: 'verify', reason: 'source_unavailable', reason_source: spec.prefix });
    expect(finding(country, spec.rule, []).outcome).toBe('verify');
    // A miss is stored as no fact: "not found in this register", never "doesn't exist".
    expect(finding(country, spec.rule, facts(spec.prefix, { identified: null })).outcome).toBe('verify');
    expect(finding(country, spec.rule, facts(spec.prefix, spec.odd)).outcome).toBe('verify');
  });

  it('never lets an uncertain line of the map fail a company', () => {
    const answers = answersToFacts({
      jurisdiction: country, incorporated: true, entity_type_ch: country === 'CH' ? 'ag' : undefined, has_employees: true, has_contractors: true,
      processes_personal_data: true, sensitive_data: ['health'], uses_processors: true, has_website: true, has_app: true, marketing_consent: 'opt_in',
      ai_roles: ['deployer'], automated_decisions: true, has_raised_or_raising: true, au_privacy_act: 'yes', sg_cpf_employees: true, sg_nominees: true,
    }).facts;
    const result = runEngine([pack], { facts: answers, stage: 5, as_of: AS_OF, declared_missing: pack.rules.map((rule) => rule.id) });
    const review = pack.rules.filter((rule) => rule.confidence === 'needs_review');
    expect(review.length).toBeGreaterThan(0);
    for (const rule of review) {
      expect(['verify', 'not_applicable'], rule.id).toContain(result.findings.find((item) => item.rule_id === rule.id)?.outcome);
      // No number from an uncertain line is stored with the rule, and none sets a schedule.
      expect(rule.parameters, rule.id).toBeUndefined();
      expect(rule.recurrence, rule.id).toBeNull();
    }
  });

  it('writes for people: no "founder", no lawyer or law firm named, no dashes', () => {
    for (const rule of pack.rules) {
      expect([rule.title, ...Object.values(rule.text)].join(' '), rule.id).not.toMatch(/founder|lawyer|Code & Clause|—/i);
    }
    for (const slot of vaultSlotsFor(country)) {
      expect(slot.id.startsWith(`${country.toLowerCase()}_`), slot.id).toBe(true);
      expect(`${slot.label} ${slot.reason}`, slot.id).not.toMatch(/founder|lawyer|Code & Clause|—/i);
    }
  });

  it('keeps critical for a status its register can prove, and nothing else', () => {
    const critical = pack.rules.filter((rule) => rule.severity === 'critical').map((rule) => rule.id);
    expect(critical).toEqual(country === 'AU' ? [] : [spec.rule]);
  });

  it('asks nothing twice: no rule id twice, and the International rule gives way where this pack asks the same', () => {
    const selection = selectPacks({ incorporation: country, markets: [] });
    expect(selection.used.map((use) => [use.jurisdiction, use.mode])).toEqual([[country, 'full'], [INTERNATIONAL, 'full']]);
    const ids = selection.packs.flatMap((item) => item.rules.map((rule) => rule.id));
    expect(new Set(ids).size).toBe(ids.length);
    const gone: Partial<Record<Country, string[]>> = {
      CH: ['INTL.SEC.INCIDENT_RESPONSE'], NZ: ['INTL.SEC.INCIDENT_RESPONSE', 'INTL.EQUITY.CAP_TABLE'], SG: ['INTL.DP.PROCESSING_AGREEMENTS'],
    };
    for (const id of gone[country] ?? []) expect(ids, id).not.toContain(id);
    // Everything else from the International pack still applies.
    expect(ids).toContain('INTL.SANCT.SCREENING');
    expect(ids).toContain('INTL.DP.PRIVACY_NOTICE');
  });

  it('follows a company abroad only with rules that read no company register', () => {
    const selection = selectPacks({ incorporation: 'GB', markets: [country] });
    const abroad = selection.packs.find((item) => item.jurisdiction === country)?.rules ?? [];
    for (const rule of abroad) {
      expect(rule.layer === 3 || rule.layer === 6 || rule.market_overlay !== undefined, rule.id).toBe(true);
      for (const key of logicOf(rule).flatMap(varsIn)) expect(key.startsWith('registry.'), `${rule.id} reads ${key}`).toBe(false);
    }
  });
});

describe('what the draft packs must not claim', () => {
  const all = COUNTRIES.flatMap((country) => loadPack(country).rules);
  const reads = (rule: Rule) => logicOf(rule).flatMap(varsIn);
  const text = (id: string) => {
    const rule = all.find((item) => item.id === id);
    if (!rule) throw new Error(id);
    return [rule.title, ...Object.values(rule.text)].join(' ');
  };

  it('reads no uncertain figure: Swiss capital, or cookies set before consent', () => {
    for (const rule of all) {
      expect(reads(rule), rule.id).not.toContain('registry.ch.zefix.capital_nominal');
      expect(reads(rule), rule.id).not.toContain('web.policy.cookies_before_consent_count');
      expect(reads(rule), rule.id).not.toContain('derived.web.trackers_before_consent');
    }
  });

  it('never reads ABN Lookup as the company\'s own status', () => {
    for (const rule of all.filter((item) => item.id.startsWith('AU.CORP.'))) {
      expect(reads(rule).some((key) => key.startsWith('registry.au.abr.')), rule.id).toBe(false);
    }
    expect(text('AU.TAX.ABN')).toContain('not the company');
  });

  it('states no deadline or threshold the map marks for checking', () => {
    const unsure: Record<string, RegExp> = {
      'CH.CORP.TRANSPARENCY_REGISTER': /\d+ months?/,
      'CH.CORP.BENEFICIAL_OWNER_LIST': /\d+ ?%/,
      'CH.FUND.PROSPECTUS_EXEMPTION': /500|CHF ?8/,
      'SG.CORP.ANNUAL_RETURN': /\d+ months?/,
      'SG.CORP.AUDITOR': /S\$ ?10|50 or fewer/,
      'SG.DP.DO_NOT_CALL': /\d+ days?/,
      'AU.CORP.ASIC_CHANGES': /\d+ days?/,
      'AU.FUND.OFFER_EXEMPTION': /\b20\b|A\$ ?2/,
      'NZ.FUND.OFFER_EXCLUSION': /\b20\b|NZ\$ ?2/,
      'CA.CORP.SIGNIFICANT_CONTROL_FILING': /\d+ days?/,
      'CA.FUND.PROSPECTUS_EXEMPTION': /\d+ days?/,
    };
    for (const [id, pattern] of Object.entries(unsure)) expect(text(id), id).not.toMatch(pattern);
  });

  it('gives verify, not a gap, where only the company knows the answer', () => {
    // No audit firm on Zefix: an opting-out is allowed, and Zefix can't show it.
    expect(finding('CH', 'CH.CORP.AUDIT', facts('registry.ch.zefix', { identified: true, auditors_count: 0 })).outcome).toBe('verify');
    expect(finding('CH', 'CH.CORP.AUDIT', facts('registry.ch.zefix', { identified: true, auditors_count: 1 })).outcome).toBe('pass');
    // Not registered for GST is fine below the threshold, which only the company knows.
    expect(finding('AU', 'AU.TAX.GST', facts('registry.au.abr', { identified: true, gst_registered: false })).outcome).toBe('verify');
    expect(finding('AU', 'AU.TAX.GST', facts('registry.au.abr', { identified: true, gst_registered: true })).outcome).toBe('pass');
    // Another legal form is outside the pack, not wrong.
    expect(finding('CH', 'CH.CORP.LEGAL_FORM', facts('registry.ch.zefix', { identified: true, legal_form_code: '0108' })).outcome).toBe('verify');
    expect(finding('NZ', 'NZ.CORP.ENTITY_TYPE', facts('registry.nz.companies', { identified: true, entity_type_code: 'LTD' })).outcome).toBe('pass');
  });
});

describe('annual returns worked out from the register', () => {
  const nz = (values: Record<string, FactValue>, asOf: string) => computeDerived((key) => values[key], asOf)['derived.nz.annual_return_overdue'];
  const ca = (values: Record<string, FactValue>, asOf: string) => computeDerived((key) => values[key], asOf)['derived.ca.annual_return_overdue'];
  const N = 'registry.nz.companies';
  const C = 'registry.ca.corporations';

  it('New Zealand: overdue once the filing month has ended with no return in it', () => {
    const base = { [`${N}.annual_return_filing_month`]: 3, [`${N}.incorporated_on`]: '2024-03-01' };
    expect(nz({ ...base, [`${N}.annual_return_last_filed_on`]: '2026-03-12' }, '2026-11-16')).toBe(false);
    expect(nz({ ...base, [`${N}.annual_return_last_filed_on`]: '2025-03-10' }, '2026-11-16')).toBe(true);
    // During this year's filing month, last year's return is the one that counts.
    expect(nz({ ...base, [`${N}.annual_return_last_filed_on`]: '2025-03-10' }, '2026-03-20')).toBe(false);
    // The first return is due the calendar year after incorporation.
    expect(nz({ ...base, [`${N}.incorporated_on`]: '2026-01-10' }, '2026-11-16')).toBe(false);
    expect(nz(base, '2026-11-16')).toBeNull();
    expect(nz({ [`${N}.annual_return_last_filed_on`]: '2025-03-10' }, '2026-11-16')).toBeNull();
  });

  it('Canada: overdue once the 60 days after the anniversary have passed with no return for that year', () => {
    const base = { [`${C}.incorporated_on`]: '2024-03-01' };
    expect(ca({ ...base, [`${C}.last_annual_return_year`]: 2026 }, '2026-11-16')).toBe(false);
    expect(ca({ ...base, [`${C}.last_annual_return_year`]: 2025 }, '2026-11-16')).toBe(true);
    // Inside the 60 days, last year's return is the one that counts.
    expect(ca({ ...base, [`${C}.last_annual_return_year`]: 2025 }, '2026-04-01')).toBe(false);
    expect(ca({ ...base, [`${C}.last_annual_return_year`]: 2024 }, '2026-04-01')).toBe(true);
    expect(ca({ [`${C}.incorporated_on`]: '2026-01-01' }, '2026-11-16')).toBe(false);
    expect(ca(base, '2026-11-16')).toBeNull();
  });

  it('turns an overdue return into a defect, and an unknown one into verify', () => {
    const overdue = facts(N, { identified: true, annual_return_filing_month: 3, incorporated_on: '2024-03-01', annual_return_last_filed_on: '2025-03-10' });
    expect(finding('NZ', 'NZ.CORP.ANNUAL_RETURN', overdue).outcome).toBe('defect');
    expect(finding('NZ', 'NZ.CORP.ANNUAL_RETURN', overdue, { [N]: 'unavailable' }).outcome).toBe('verify');
    const filed = facts(C, { identified: true, incorporated_on: '2024-03-01', last_annual_return_year: 2026 });
    expect(finding('CA', 'CA.CORP.ANNUAL_RETURN', filed).outcome).toBe('pass');
    expect(finding('CA', 'CA.CORP.ANNUAL_RETURN', []).outcome).toBe('verify');
  });
});

describe('country questions for the draft packs', () => {
  const ids = (answers: Parameters<typeof visibleQuestions>[0]) => visibleQuestions(answers).flatMap((question) => question.fields.map((field) => field.id));

  it('asks each country its own trigger questions, and nobody else', () => {
    expect(ids({ jurisdiction: 'CH' })).toContain('entity_type_ch');
    expect(ids({ jurisdiction: 'SG', has_employees: true })).toEqual(expect.arrayContaining(['sg_nominees', 'sg_cpf_employees']));
    expect(ids({ jurisdiction: 'AU', processes_personal_data: true })).toContain('au_privacy_act');
    const kenya = ids({ jurisdiction: 'KE', processes_personal_data: true, has_employees: true });
    for (const id of ['entity_type_ch', 'sg_nominees', 'sg_cpf_employees', 'au_privacy_act']) expect(kenya, id).not.toContain(id);
  });

  it('turns the answers into the packs\' triggers, and "not sure" stays unknown', () => {
    const derived = (answers: Parameters<typeof answersToFacts>[0]) => {
      const { values } = answersToFacts(answers);
      return computeDerived((key) => values[key], AS_OF);
    };
    expect(derived({ jurisdiction: 'CH', entity_type_ch: 'ag' })['derived.ch.is_ag']).toBe(true);
    expect(derived({ jurisdiction: 'AU', processes_personal_data: true, au_privacy_act: 'yes' })['derived.au.privacy_act']).toBe(true);
    expect(derived({ jurisdiction: 'AU', processes_personal_data: true, au_privacy_act: 'not_sure' })['derived.au.privacy_act']).toBeNull();
    expect(derived({ jurisdiction: 'AU', processes_personal_data: false })['derived.au.privacy_act']).toBe(false);
    expect(derived({ jurisdiction: 'SG', has_employees: false })['derived.sg.cpf_employees']).toBe(false);
    expect(derived({ jurisdiction: 'KE', marketing_consent: 'none' })['derived.sends_marketing']).toBe(false);
    // The register's legal form wins over the answer.
    expect(computeDerived((key) => ({ 'registry.ch.zefix.legal_form_code': '0107', 'company.entity_type': 'ag' } as Record<string, FactValue>)[key], AS_OF)['derived.ch.is_ag']).toBe(false);
  });
});

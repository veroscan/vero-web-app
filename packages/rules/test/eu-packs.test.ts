import { describe, expect, it } from 'vitest';
import {
  answersToFacts,
  INTL_EQUIVALENTS,
  loadPack,
  packsFor,
  runEngine,
  selectPacks,
  validatePack,
  varsIn,
  visibleQuestions,
  type Fact,
  type FactValue,
  type Logic,
  type Pack,
  type Rule,
} from '../src/index.js';
import { euObligation, EU_KEYS } from '../src/packs/eu-common.js';

const AS_OF = '2026-11-16';
const EU_PACKS = ['FR', 'FI', 'DK', 'NL', 'IE', 'CZ', 'PL', 'DE'] as const;
const ALL_PACKS = [...EU_PACKS, 'NO'] as const;
type SourceState = 'ok' | 'unavailable' | 'error' | 'ambiguous' | 'unsupported' | 'waiting';

const facts = (values: Record<string, FactValue>): Fact[] => Object.entries(values).map(([key, value]) => ({ key, value }));

function outcome(pack: Pack, id: string, values: Record<string, FactValue>, sources: Record<string, SourceState> = {}, asOf = AS_OF) {
  const rule = pack.rules.find((r) => r.id === id);
  if (!rule) throw new Error(`No rule ${id}`);
  const finding = runEngine([{ ...pack, rules: [rule] }], { facts: facts(values), sources, stage: 4, as_of: asOf }).findings[0];
  return finding?.outcome;
}

describe('the EU and EEA country packs', () => {
  it.each(ALL_PACKS)('%s loads, validates, is a draft (0.2.0, or 0.1.0 for Norway and the new German pack) and comes with the International pack', (cc) => {
    const pack = loadPack(cc);
    expect(() => validatePack(pack)).not.toThrow();
    expect(pack.status).toBe('draft');
    // The EU members went to 0.2.0 on 18 Nov 2026 (EU representative and DSA rules); Norway gets none of them.
    expect(pack.version).toBe(cc === 'NO' || cc === 'DE' ? '0.1.0' : '0.2.0');
    expect(pack.rules.length).toBeGreaterThan(40);
    expect(packsFor(cc).map((p) => p.jurisdiction)).toEqual([cc, 'INTL']);
    for (const rule of pack.rules) expect(rule.status).toBe('draft');
  });

  it.each(ALL_PACKS)('%s uses plain words: never "founder", no lawyer and no law firm', (cc) => {
    for (const rule of loadPack(cc).rules) {
      expect([rule.title, ...Object.values(rule.text)].join(' '), rule.id).not.toMatch(/founder|lawyer|Code & Clause/i);
    }
  });

  it('Norway gets the GDPR and consumer rules, but no AI Act, VIES or other EU-only rule', () => {
    const ids = loadPack('NO').rules.map((r) => r.id);
    for (const id of ['NO.DP.PRIVACY_NOTICE', 'NO.DP.ROPA', 'NO.DP.COOKIE_CONSENT', 'NO.CONSUMER.WITHDRAWAL']) expect(ids).toContain(id);
    for (const id of ['NO.AI.PROHIBITED_PRACTICES', 'NO.AI.LITERACY', 'NO.AI.HIGH_RISK', 'NO.AI.HIGH_RISK_PRODUCTS', 'NO.TAX.VAT_VIES', 'NO.CONSUMER.WITHDRAWAL_FUNCTION', 'NO.CONSUMER.ACCESSIBILITY', 'NO.FUND.PROSPECTUS_EXEMPTION']) {
      expect(ids).not.toContain(id);
    }
    expect(loadPack('FR').rules.map((r) => r.id)).toContain('FR.AI.HIGH_RISK');
  });
});

describe('company status from the national registers', () => {
  const cases: { cc: string; id: string; source: string; active: Record<string, FactValue>; ended?: Record<string, FactValue>[]; unconfirmed?: Record<string, FactValue>[] }[] = [
    { cc: 'FR', id: 'FR.CORP.STATUS', source: 'registry.fr.recherche_entreprises', active: { status: 'active' }, ended: [{ status: 'ceased' }] },
    { cc: 'NO', id: 'NO.CORP.STATUS', source: 'registry.no.brreg', active: { status: 'active' }, ended: [{ status: 'deleted' }, { status: 'bankrupt' }, { status: 'under_compulsory_dissolution' }] },
    { cc: 'FI', id: 'FI.CORP.STATUS', source: 'registry.fi.prh', active: { status: 'active', situations: [] }, ended: [{ status: 'ceased', situations: [] }, { status: 'active', situations: ['bankruptcy'] }] },
    { cc: 'CZ', id: 'CZ.CORP.STATUS', source: 'registry.cz.ares', active: { status: 'active' }, ended: [{ status: 'ceased' }] },
    // Not checked against a real reply, or the end markers unconfirmed: never a defect, a person checks.
    { cc: 'DK', id: 'DK.CORP.STATUS', source: 'registry.dk.cvr', active: { status: 'normal' }, unconfirmed: [{ status: 'ophørt' }, { status: 'under konkurs' }] },
    { cc: 'NL', id: 'NL.CORP.STATUS', source: 'registry.nl.kvk', active: { active: true }, unconfirmed: [{ active: false, ended_on: '2025-01-31' }] },
    { cc: 'IE', id: 'IE.CORP.STATUS', source: 'registry.ie.cro', active: { status: 'normal' }, unconfirmed: [{ status: 'dissolved' }, { status: 'strike off listed' }] },
    { cc: 'PL', id: 'PL.CORP.STATUS', source: 'registry.pl.krs', active: { status: 'registered', under_liquidation: false, insolvency_marker: false }, unconfirmed: [{ status: 'deleted', under_liquidation: false, insolvency_marker: false }, { status: 'registered', under_liquidation: true, insolvency_marker: false }] },
    // Germany through a paid provider, never tried against a real reply: liquidation or insolvency is for a person to read.
    { cc: 'DE', id: 'DE.CORP.STATUS', source: 'registry.de.openregister', active: { status: 'active', insolvency_open: false }, unconfirmed: [{ status: 'liquidation', insolvency_open: false }, { status: 'active', insolvency_open: true }, { status: 'inactive', insolvency_open: false }] },
  ];
  const prefixed = (source: string, values: Record<string, FactValue>) => Object.fromEntries(Object.entries({ identified: true, ...values }).map(([k, v]) => [`${source}.${k}`, v]));

  it.each(cases)('$id: a found, active company passes', ({ cc, id, source, active }) => {
    expect(outcome(loadPack(cc), id, prefixed(source, active), { [source]: 'ok' })).toBe('pass');
  });

  it.each(cases.filter((c) => c.ended))('$id: a deleted, ceased or bankrupt company is a defect, and the rule is critical', ({ cc, id, source, ended }) => {
    const pack = loadPack(cc);
    expect(pack.rules.find((r) => r.id === id)?.severity).toBe('critical');
    for (const values of ended ?? []) expect(outcome(pack, id, prefixed(source, values), { [source]: 'ok' }), JSON.stringify(values)).toBe('defect');
  });

  it.each(cases.filter((c) => c.unconfirmed))('$id: an end state we have not confirmed is "to check", never a defect, and the rule is not critical', ({ cc, id, source, unconfirmed }) => {
    const pack = loadPack(cc);
    expect(pack.rules.find((r) => r.id === id)?.severity).not.toBe('critical');
    for (const values of unconfirmed ?? []) expect(outcome(pack, id, prefixed(source, values), { [source]: 'ok' }), JSON.stringify(values)).toBe('verify');
  });

  it.each(cases)('$id: a source switched off, down or not asked gives verify', ({ cc, id, source, active }) => {
    const pack = loadPack(cc);
    for (const state of ['unavailable', 'error', 'unsupported'] as const) expect(outcome(pack, id, prefixed(source, active), { [source]: state }), state).toBe('verify');
    expect(outcome(pack, id, {}, {})).toBe('verify');
    // A miss: the source answered, but `identified` is null, so stored as no fact.
    expect(outcome(pack, id, {}, { [source]: 'ok' })).toBe('verify');
  });
});

describe('France: a miss is never a problem with the company', () => {
  const fr = loadPack('FR');
  const DIR = 'registry.fr.recherche_entreprises';
  const answers = answersToFacts({
    jurisdiction: 'FR', incorporated: true, entity_type_fr: 'sas', processes_personal_data: true, sensitive_data: ['health'], has_employees: true,
    has_website: true, has_app: false, customer_type: 'b2c', ai_roles: ['deployer'],
  }).values;

  it('the business directory not finding the company never gives a gap or a defect', () => {
    const findings = runEngine([fr], { facts: facts(answers), sources: { [DIR]: 'ok', 'registry.fr.cnil_dpo': 'ok' }, stage: 4, as_of: AS_OF }).findings;
    const directoryRules = fr.rules.filter((rule) => [rule.satisfied_when, rule.defect_when ?? null, rule.applies_when].flatMap((l) => varsIn(l)).some((key) => key.startsWith(`${DIR}.`)));
    expect(directoryRules.length).toBeGreaterThanOrEqual(3);
    for (const rule of directoryRules) {
      const finding = findings.find((f) => f.rule_id === rule.id);
      expect(['verify', 'not_applicable'], rule.id).toContain(finding?.outcome);
    }
  });

  it('not being on the CNIL DPO list is never "no DPO"', () => {
    expect(outcome(fr, 'FR.DP.DPO', { ...answers, 'registry.fr.cnil_dpo.listed': false }, { 'registry.fr.cnil_dpo': 'ok' })).toBe('verify');
    expect(outcome(fr, 'FR.DP.DPO', { ...answers, 'registry.fr.cnil_dpo.listed': true }, { 'registry.fr.cnil_dpo': 'ok' })).toBe('pass');
  });

  it('a privacy notice missing on a site in a language the scan reads is a gap; in one it cannot read, "to check"', () => {
    const site = { 'answers.has_website': true, 'answers.has_app': false, 'web.policy.privacy_notice_found': false };
    expect(outcome(fr, 'FR.DP.PRIVACY_NOTICE', { ...site, 'web.policy.language_supported': true })).toBe('gap');
    expect(outcome(fr, 'FR.DP.PRIVACY_NOTICE', { ...site, 'web.policy.language_supported': false })).toBe('verify');
    expect(outcome(loadPack('IE'), 'IE.DP.PRIVACY_NOTICE', { ...site, 'web.policy.language_supported': true })).toBe('gap');
    // The website scan not asked at all: nothing is known, so nothing is marked down.
    expect(outcome(fr, 'FR.DP.PRIVACY_NOTICE', { 'answers.has_website': true, 'answers.has_app': false })).toBe('verify');
  });
});

describe('no rule enforces a [verify] number', () => {
  const numeric = (logic: Logic): boolean => {
    if (Array.isArray(logic)) return logic.some(numeric);
    if (logic === null || typeof logic !== 'object') return false;
    return Object.entries(logic).some(([op, args]) => (['>', '>=', '<', '<='].includes(op) || (op === '==' && Array.isArray(args) && args.some((a) => typeof a === 'number'))) || numeric(args));
  };
  const rules: Rule[] = ALL_PACKS.flatMap((cc) => loadPack(cc).rules);

  it('a rule comparing a number cites only lines with no [verify] on them, or can never fail', () => {
    const withNumbers = rules.filter((rule) => [rule.applies_when, rule.satisfied_when, rule.defect_when ?? null, rule.verify_when ?? null].some((l) => numeric(l)));
    expect(withNumbers.length).toBeGreaterThan(0);
    for (const rule of withNumbers.filter((r) => r.confidence === 'needs_review')) {
      // Even with the number plainly missed, a rule awaiting review only says "to check".
      const zeroes = Object.fromEntries([rule.satisfied_when, rule.defect_when ?? null].flatMap((l) => varsIn(l)).map((key) => [key, 0] as const));
      const applies = Object.fromEntries(varsIn(rule.applies_when).map((key) => [key, true] as const));
      expect(outcome(loadPack(rule.jurisdiction), rule.id, { ...applies, ...zeroes, 'company.entity_type': 'as' }), rule.id).not.toMatch(/gap|defect/);
    }
  });

  it('a rule resting on a [verify] line can only ever say "to check"', () => {
    const review = rules.filter((rule) => rule.confidence === 'needs_review');
    expect(review.length).toBeGreaterThan(0);
    const everything = Object.fromEntries(rules.flatMap((rule) => varsIn(rule.applies_when)).map((key) => [key, true] as const));
    for (const rule of review) {
      const pack = loadPack(rule.jurisdiction);
      const result = outcome(pack, rule.id, { ...everything, 'answers.has_employees': true, 'answers.processes_personal_data': true }, {}, '2030-01-01');
      expect(['verify', 'not_applicable'], rule.id).toContain(result);
    }
  });
});

describe('EU common rules appear once per company', () => {
  const euObligations = new Set(EU_KEYS.map(euObligation));
  const sharedOf = (selection: ReturnType<typeof selectPacks>) => selection.packs.flatMap((p) => p.rules).flatMap((r) => (r.shared_obligation ? [r.shared_obligation] : []));

  it.each(ALL_PACKS)('a company in %s with users and staff across the EU is asked each EU rule once', (cc) => {
    const selection = selectPacks({ incorporation: cc, markets: [...ALL_PACKS, 'GB', 'US'], employee_countries: ['NL', 'PL'] });
    const shared = sharedOf(selection);
    expect(new Set(shared).size).toBe(shared.length);
    const ids = selection.packs.flatMap((p) => p.rules.map((r) => r.id));
    expect(new Set(ids).size).toBe(ids.length);
    // The home country's version is the one that counts.
    for (const rule of selection.packs.flatMap((p) => p.rules)) {
      if (rule.shared_obligation && euObligations.has(rule.shared_obligation) && loadPack(cc).rules.some((r) => r.shared_obligation === rule.shared_obligation)) {
        expect(rule.jurisdiction, rule.id).toBe(cc);
      }
    }
  });

  it('the International privacy notice, processing agreements and incident plan give way to the EU rules', () => {
    for (const cc of ALL_PACKS) {
      const ids = selectPacks({ incorporation: cc, markets: [] }).packs.flatMap((p) => p.rules.map((r) => r.id));
      for (const id of ['INTL.DP.PRIVACY_NOTICE', 'INTL.DP.PROCESSING_AGREEMENTS', 'INTL.SEC.INCIDENT_RESPONSE', 'INTL.CORP.CONSTITUTION']) expect(ids, `${cc} ${id}`).not.toContain(id);
      expect(ids).toContain('INTL.SANCT.SCREENING');
      expect(INTL_EQUIVALENTS['INTL.DP.PRIVACY_NOTICE']).toContain(`${cc}.DP.PRIVACY_NOTICE`);
    }
  });

  it('a UK company with French and Dutch users gets the EU data rules once, and no French company filings', () => {
    const selection = selectPacks({ incorporation: 'GB', markets: ['FR', 'NL'] });
    const shared = sharedOf(selection);
    expect(new Set(shared).size).toBe(shared.length);
    const ids = selection.packs.flatMap((p) => p.rules.map((r) => r.id));
    expect(ids).toContain('FR.DP.ROPA');
    expect(ids).not.toContain('NL.DP.ROPA');
    expect(ids).not.toContain('FR.CORP.STATUS');
    expect(ids).not.toContain('FR.TAX.VAT_VIES');
  });
});

describe('AI Act dates as amended by Regulation (EU) 2026/1744', () => {
  const fr = loadPack('FR');
  const ai = { 'answers.ai_roles': ['provider'], 'answers.ai_use_cases': ['hiring', 'generative'], 'answers.sectors': ['healthtech'] };

  it('Annex III high-risk duties apply from 2 Dec 2027, Annex I from 2 Aug 2028, the new bans from 2 Dec 2026', () => {
    const rule = (id: string) => fr.rules.find((r) => r.id === id);
    expect(rule('FR.AI.HIGH_RISK')?.effective_from).toBe('2027-12-02');
    expect(rule('FR.AI.HIGH_RISK_PRODUCTS')?.effective_from).toBe('2028-08-02');
    expect(rule('FR.AI.PROHIBITED_GENERATIVE')?.effective_from).toBe('2026-12-02');
    expect(outcome(fr, 'FR.AI.HIGH_RISK', ai)).toBe('not_applicable');
    expect(outcome(fr, 'FR.AI.HIGH_RISK', ai, {}, '2027-12-02')).toBe('verify');
    expect(outcome(fr, 'FR.AI.HIGH_RISK_PRODUCTS', ai, {}, '2028-08-01')).toBe('not_applicable');
    expect(outcome(fr, 'FR.AI.PROHIBITED_GENERATIVE', ai, {}, '2026-12-01')).toBe('not_applicable');
    expect(outcome(fr, 'FR.AI.PROHIBITED_GENERATIVE', ai, {}, '2026-12-02')).toBe('verify');
  });
});

describe('questionnaire', () => {
  const ids = (answers: Parameters<typeof visibleQuestions>[0]) => visibleQuestions(answers).flatMap((q) => q.fields.map((f) => f.id));

  it('asks about data leaving the EEA only for an EU or EEA company with data abroad', () => {
    const base = { processes_personal_data: true, data_hosted_abroad: true };
    expect(ids({ jurisdiction: 'FR', ...base })).toContain('data_outside_eea');
    expect(ids({ jurisdiction: 'NO', ...base })).toContain('data_outside_eea');
    expect(ids({ jurisdiction: 'GB', ...base })).not.toContain('data_outside_eea');
    expect(ids({ jurisdiction: 'FR', processes_personal_data: true, data_hosted_abroad: false })).not.toContain('data_outside_eea');
  });

  it('asks the company form in France, Denmark, Czechia and Poland', () => {
    for (const [cc, id] of [['FR', 'entity_type_fr'], ['DK', 'entity_type_dk'], ['CZ', 'entity_type_cz'], ['PL', 'entity_type_pl']] as const) {
      expect(ids({ jurisdiction: cc })).toContain(id);
      expect(ids({ jurisdiction: 'KE' })).not.toContain(id);
    }
  });
});

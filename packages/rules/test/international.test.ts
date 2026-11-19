import { describe, expect, it } from 'vitest';
import {
  answersToFacts,
  hasCountryPack,
  INTERNATIONAL,
  INTL_EQUIVALENTS,
  JURISDICTIONS,
  loadPack,
  packsFor,
  runEngine,
  scoreFindings,
  SCORING,
  selectPacks,
  vaultSlotsForPacks,
  type Fact,
} from '../src/index.js';

const ids = (selection: ReturnType<typeof selectPacks>) => selection.packs.flatMap((pack) => pack.rules.map((rule) => rule.id));
const intl = () => loadPack(INTERNATIONAL);

describe('which packs a company in any country gets', () => {
  it('keeps the first three countries exactly as they were', () => {
    expect(packsFor('US-DE').map((pack) => pack.jurisdiction)).toEqual(['US', 'US-DE']);
    expect(packsFor('GB').map((pack) => pack.jurisdiction)).toEqual(['GB']);
    expect(packsFor('NG').map((pack) => pack.jurisdiction)).toEqual(['NG']);
  });

  it('gives any other US state the federal pack and the International pack', () => {
    for (const code of ['US-CA', 'US-NY', 'US-DC', 'US']) expect(packsFor(code).map((pack) => pack.jurisdiction), code).toEqual(['US', 'INTL']);
  });

  it('gives every other country the International pack only, until it has a pack of its own', () => {
    for (const code of ['TZ', 'BR', 'JP', 'EG']) {
      expect(hasCountryPack(code)).toBe(false);
      expect(packsFor(code).map((pack) => pack.jurisdiction), code).toEqual(['INTL']);
    }
    expect(hasCountryPack('GB')).toBe(true);
    expect(hasCountryPack('INTL')).toBe(false);
  });

  it('scores a Tanzanian company against the International pack alone', () => {
    const selection = selectPacks({ incorporation: 'TZ', markets: ['TZ', 'other'] });
    expect(selection.used).toEqual([{ jurisdiction: 'INTL', version: intl().version, mode: 'full', rules: intl().rules.length }]);
    expect(selection.overlay_markets).toEqual([]);
  });

  it('a California company gets federal and international rules, and nothing asked twice', () => {
    const selection = selectPacks({ incorporation: 'US-CA', markets: [] });
    expect(selection.used.map((use) => [use.jurisdiction, use.mode])).toEqual([['US', 'full'], ['INTL', 'full']]);
    const all = ids(selection);
    expect(all).toContain('US.SANCT.SCREENING');
    expect(all).not.toContain('INTL.SANCT.SCREENING');
    expect(all).toContain('US.CONSUMER.PRIVACY_DISCLOSURES');
    expect(all).not.toContain('INTL.DP.PRIVACY_NOTICE');
    // Delaware's own rules don't follow a California company.
    expect(all.some((id) => id.startsWith('US-DE.'))).toBe(false);
    expect(all).toContain('INTL.IP.OWNER_ASSIGNMENT');
    expect(new Set(all).size).toBe(all.length);
  });

  it('a market with a pack of its own adds its compliance rules, and the international rule gives way', () => {
    const selection = selectPacks({ incorporation: 'TZ', markets: ['GB'] });
    expect(selection.used.map((use) => [use.jurisdiction, use.mode])).toEqual([['GB', 'overlay'], ['INTL', 'full']]);
    const all = ids(selection);
    expect(all).toContain('GB.DP.PRIVACY_NOTICE');
    expect(all).not.toContain('INTL.DP.PRIVACY_NOTICE');
    expect(all).toContain('GB.AI.GOVERNANCE');
    expect(all).not.toContain('INTL.AI.GOVERNANCE');
    // Company foundations stay with the country of incorporation.
    expect(all).toContain('INTL.CORP.CONSTITUTION');
    expect(all).not.toContain('GB.CORP.ARTICLES');
    const shared = selection.packs.flatMap((pack) => pack.rules).flatMap((rule) => (rule.shared_obligation ? [rule.shared_obligation] : []));
    expect(new Set(shared).size).toBe(shared.length);
  });

  it('the first three countries never get the International pack, even with markets', () => {
    for (const code of ['GB', 'NG', 'US-DE'] as const) {
      const selection = selectPacks({ incorporation: code, markets: ['GB', 'NG', 'US', 'TZ'] });
      expect(selection.used.map((use) => use.jurisdiction)).not.toContain('INTL');
    }
  });
});

describe('the International pack is honest', () => {
  const rules = intl().rules;
  const words = (rule: (typeof rules)[number]) => [rule.title, ...Object.values(rule.text)].join(' ');

  it('is a draft, like every pack', () => {
    expect(intl().status).toBe('draft');
    for (const rule of rules) expect(rule.status).toBe('draft');
  });

  it('is built from checks that exist in the country packs, and names each one it stands for', () => {
    const known = new Set(JURISDICTIONS.filter((code) => code !== INTERNATIONAL).flatMap((code) => loadPack(code).rules.map((rule) => rule.id)));
    const own = new Set(rules.map((rule) => rule.id));
    for (const [id, equivalents] of Object.entries(INTL_EQUIVALENTS)) {
      expect(own, id).toContain(id);
      for (const equivalent of equivalents) expect(known, `${id} stands for ${equivalent}`).toContain(equivalent);
    }
    for (const rule of rules) {
      expect(Boolean(INTL_EQUIVALENTS[rule.id]) || Boolean(rule.shared_obligation), `${rule.id} has no country rule behind it`).toBe(true);
    }
  });

  it('cites no statute, names no regulator, and names no country or its law', () => {
    const COUNTRY_WORDS = /\b(UK|United Kingdom|British|Nigeria|Nigerian|Delaware|US|USA|United States|American|California|GDPR|HMRC|ICO|NDPC|CAC|IRS|OFAC|SEC|FTC|USPTO|Companies House|EU|European)\b/;
    for (const rule of rules) {
      expect(rule.instruments, rule.id).toEqual([]);
      expect(rule.regulator, rule.id).toBeNull();
      expect(words(rule), rule.id).not.toMatch(COUNTRY_WORDS);
    }
    for (const slot of vaultSlotsForPacks([intl()])) expect(`${slot.label} ${slot.reason}`, slot.id).not.toMatch(COUNTRY_WORDS);
  });

  it('claims no legal duty: only good practice, what investors ask, or what many countries do', () => {
    for (const rule of rules) {
      expect(words(rule), rule.id).not.toMatch(/\b(the law requires|required by law|you must by law|is illegal|legally required|criminal offence)\b/i);
      expect(rule.severity, rule.id).not.toBe('critical');
    }
  });

  it('uses plain words for people: never "founder", and no law firm named', () => {
    for (const rule of rules) expect(words(rule), rule.id).not.toMatch(/founder|Code & Clause/i);
    for (const slot of vaultSlotsForPacks([intl()])) expect(`${slot.label} ${slot.reason}`, slot.id).not.toMatch(/founder/i);
  });

  it('has its own document slots, each pointing at its own rules', () => {
    const slots = vaultSlotsForPacks(packsFor('TZ'));
    expect(slots.length).toBeGreaterThan(15);
    const own = new Set(rules.map((rule) => rule.id));
    for (const slot of slots) {
      expect(slot.id.startsWith('intl_'), slot.id).toBe(true);
      expect(slot.jurisdiction).toBe('INTL');
      for (const id of slot.rule_ids) expect(own).toContain(id);
    }
  });
});

describe('scoring a Tanzanian company', () => {
  const asOf = '2026-11-16';
  const facts = (values: Record<string, Fact['value']>, method: 'attested' | 'official_list' = 'attested'): Fact[] =>
    Object.entries(values).map(([key, value]) => ({ key, value, provenance: { source: 'test', source_name: 'test', method, retrieved_at: `${asOf}T00:00:00.000Z` } }));

  it('runs the International rules only, with the owner\'s scoring rules untouched', () => {
    const answers = answersToFacts({
      jurisdiction: 'TZ', incorporated: true, has_employees: false, has_contractors: true, processes_personal_data: true, has_website: false, has_app: false,
      ai_roles: ['none'], staff_use_ai: false, has_raised_or_raising: false, ip_founders_signed: true, ip_contractors_signed: false,
    }).facts.map((fact) => ({ ...fact, provenance: { source: 'questionnaire', source_name: 'You told us', method: 'attested' as const, retrieved_at: `${asOf}T00:00:00.000Z` } }));
    const sanctions = facts({ 'registry.sanctions.match': false, 'registry.sanctions.possible_match': false }, 'official_list');
    const { packs } = selectPacks({ incorporation: 'TZ', markets: [] });
    const engine = runEngine(packs, { facts: [...answers, ...sanctions], sources: { 'registry.sanctions': 'ok' }, stage: 2, company_name: 'Kestrel Pay Tanzania Ltd', as_of: asOf });
    expect(engine.findings.length).toBeGreaterThan(0);
    for (const finding of engine.findings) expect(finding.rule_id.startsWith('INTL.'), finding.rule_id).toBe(true);
    expect(engine.findings.find((finding) => finding.rule_id === 'INTL.SANCT.SCREENING')?.outcome).toBe('pass');
    expect(engine.findings.find((finding) => finding.rule_id === 'INTL.IP.CONTRACTOR_ASSIGNMENT')?.outcome).toBe('gap');

    const score = scoreFindings(engine.findings);
    expect(score.coverage.total).toBeGreaterThan(0);
    expect(score.coverage.counted).toBeLessThanOrEqual(score.coverage.total);
    expect(SCORING.overall_critical_cap).toBe(74);
    expect(SCORING.status.healthy_needs_coverage).toBe(0.5);
  });
});

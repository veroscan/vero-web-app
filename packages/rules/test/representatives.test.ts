import { describe, expect, it } from 'vitest';
import { loadPack, runEngine, selectPacks, visibleQuestions, type Fact, type FactValue, type Pack } from '../src/index.js';

/**
 * EU and UK representatives (GDPR and UK GDPR art 27, DSA art 13) and the DSA points of contact
 * (arts 11 and 12), added 18 Nov 2026. A rule fails only when the answers show it applies and the
 * website was read in a language the scan supports; a missing fact is "to check".
 */

const AS_OF = '2026-11-18';
type SourceState = 'ok' | 'unavailable' | 'error' | 'ambiguous' | 'unsupported' | 'waiting';
const facts = (values: Record<string, FactValue>): Fact[] => Object.entries(values).map(([key, value]) => ({ key, value }));

function outcome(pack: Pack, id: string, values: Record<string, FactValue>, sources: Record<string, SourceState> = {}) {
  const rule = pack.rules.find((r) => r.id === id);
  if (!rule) throw new Error(`No rule ${id}`);
  return runEngine([{ ...pack, rules: [rule] }], { facts: facts(values), sources, stage: 4, as_of: AS_OF }).findings[0]?.outcome;
}

/** A Delaware company with EU users, no office in the EU, a website the scan read in English. */
const US_WITH_EU_USERS: Record<string, FactValue> = {
  'company.jurisdiction': 'US-DE',
  'answers.processes_personal_data': true,
  'answers.eu_offers_services': true,
  'answers.eu_establishment': false,
  'web.policy.language_supported': true,
};
const PLATFORM: Record<string, FactValue> = { 'answers.sectors': ['platform'], 'answers.user_generated_content': true };

describe('EU representative (GDPR art 27)', () => {
  const fr = loadPack('FR');
  const id = 'FR.DP.EU_REPRESENTATIVE';

  it('is a draft citing the EU map line, EU members only', () => {
    const rule = fr.rules.find((r) => r.id === id);
    expect(rule?.status).toBe('draft');
    expect(rule?.sources[0]?.line).toBe('EU representative appointed');
    expect(rule?.shared_obligation).toBe('eu_eu_representative');
    expect(loadPack('NO').rules.some((r) => r.id === 'NO.DP.EU_REPRESENTATIVE')).toBe(false);
  });
  it('passes when the site names an EU representative', () => {
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, 'web.policy.eu_representative_named': true })).toBe('pass');
  });
  it('is a gap only when the site was read in a supported language and names none', () => {
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, 'web.policy.eu_representative_named': false })).toBe('gap');
  });
  it('is "to check" on a site in a language the scan cannot read', () => {
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, 'web.policy.language_supported': false, 'web.policy.eu_representative_named': false })).toBe('verify');
  });
  it('is "to check" when the fact is missing or the scan was down', () => {
    expect(outcome(fr, id, US_WITH_EU_USERS)).toBe('verify');
    expect(outcome(fr, id, US_WITH_EU_USERS, { 'web.policy': 'unavailable' })).toBe('verify');
  });
  it('is "to check" while the applicability answers are missing', () => {
    const { 'answers.eu_establishment': _gone, ...rest } = US_WITH_EU_USERS;
    expect(outcome(fr, id, { ...rest, 'web.policy.eu_representative_named': false })).toBe('verify');
  });
  it('does not apply to a company registered or established in the EU, or with no EU offer', () => {
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, 'company.jurisdiction': 'FR', 'web.policy.eu_representative_named': false })).toBe('not_applicable');
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, 'answers.eu_establishment': true, 'web.policy.eu_representative_named': false })).toBe('not_applicable');
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, 'answers.eu_offers_services': false, 'web.policy.eu_representative_named': false })).toBe('not_applicable');
  });
  it('the company can confirm it has one, or that the exemption applies', () => {
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, 'web.policy.eu_representative_named': false, 'attest.eu_gdpr_representative': true })).toBe('pass');
  });
});

describe('DSA legal representative (art 13) and points of contact (arts 11, 12)', () => {
  const fr = loadPack('FR');

  it('the legal representative applies to a platform outside the EU only', () => {
    const id = 'FR.COM.DSA_REPRESENTATIVE';
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, ...PLATFORM, 'web.policy.dsa_legal_representative_named': false })).toBe('gap');
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, ...PLATFORM, 'web.policy.dsa_legal_representative_named': true })).toBe('pass');
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, ...PLATFORM, 'web.policy.language_supported': false, 'web.policy.dsa_legal_representative_named': false })).toBe('verify');
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, ...PLATFORM })).toBe('verify');
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, 'answers.sectors': ['none'], 'answers.user_generated_content': false, 'web.policy.dsa_legal_representative_named': false })).toBe('not_applicable');
    expect(outcome(fr, id, { ...US_WITH_EU_USERS, ...PLATFORM, 'company.jurisdiction': 'FR', 'web.policy.dsa_legal_representative_named': false })).toBe('not_applicable');
  });
  it('the points of contact apply to any platform, and a miss counts only on a site read in a supported language', () => {
    const id = 'FR.COM.DSA_POINTS_OF_CONTACT';
    const home = { 'company.jurisdiction': 'FR', ...PLATFORM, 'web.policy.language_supported': true };
    expect(outcome(fr, id, { ...home, 'web.policy.dsa_contact_point_named': true })).toBe('pass');
    expect(outcome(fr, id, { ...home, 'web.policy.dsa_contact_point_named': false })).toBe('gap');
    expect(outcome(fr, id, { ...home, 'web.policy.language_supported': false, 'web.policy.dsa_contact_point_named': false })).toBe('verify');
    expect(outcome(fr, id, home)).toBe('verify');
  });
});

describe('the rules follow a company outside the EU into its EU markets, once', () => {
  it('a Delaware company with French and Danish users is asked each EU representative rule once', () => {
    const ids = selectPacks({ incorporation: 'US-DE', markets: ['FR', 'DK'] }).packs.flatMap((pack) => pack.rules.map((rule) => rule.id));
    for (const suffix of ['DP.EU_REPRESENTATIVE', 'COM.DSA_REPRESENTATIVE', 'COM.DSA_POINTS_OF_CONTACT']) {
      const asked = ids.filter((ruleId) => ruleId.endsWith(suffix));
      expect(asked).toHaveLength(1);
      expect(['FR', 'DK']).toContain(asked[0]?.split('.')[0]);
    }
  });
  it('a company outside the UK with UK users gets the UK representative rule', () => {
    const ids = selectPacks({ incorporation: 'US-DE', markets: ['GB'] }).packs.flatMap((pack) => pack.rules.map((rule) => rule.id));
    expect(ids).toContain('GB.DP.UK_REPRESENTATIVE');
  });
});

describe('UK representative (UK GDPR art 27)', () => {
  const gb = loadPack('GB');
  const id = 'GB.DP.UK_REPRESENTATIVE';
  const base: Record<string, FactValue> = {
    'company.jurisdiction': 'US-DE', 'answers.processes_personal_data': true, 'answers.user_countries': ['GB'], 'answers.uk_establishment': false, 'web.policy.language_supported': true,
  };

  it('is a draft citing the UK map line', () => {
    const rule = gb.rules.find((r) => r.id === id);
    expect(rule?.status).toBe('draft');
    expect(rule?.sources[0]?.line).toContain('UK representative appointed');
    expect(gb.version).toBe('0.3.0');
  });
  it('passes, fails or says "to check" as the facts allow', () => {
    expect(outcome(gb, id, { ...base, 'web.policy.uk_representative_named': true })).toBe('pass');
    expect(outcome(gb, id, { ...base, 'web.policy.uk_representative_named': false })).toBe('gap');
    expect(outcome(gb, id, { ...base, 'web.policy.language_supported': false, 'web.policy.uk_representative_named': false })).toBe('verify');
    expect(outcome(gb, id, base)).toBe('verify');
  });
  it('does not apply to a UK company, one with an office in the UK, or one with no UK users', () => {
    expect(outcome(gb, id, { ...base, 'company.jurisdiction': 'GB', 'web.policy.uk_representative_named': false })).toBe('not_applicable');
    expect(outcome(gb, id, { ...base, 'answers.uk_establishment': true, 'web.policy.uk_representative_named': false })).toBe('not_applicable');
    expect(outcome(gb, id, { ...base, 'answers.user_countries': ['US'], 'web.policy.uk_representative_named': false })).toBe('not_applicable');
  });
});

describe('the questions', () => {
  const fields = (answers: Record<string, FactValue>) => visibleQuestions(answers).flatMap((question) => question.fields.map((field) => field.id));

  it('asks a company outside the EU whether it offers services there, and then about an office', () => {
    expect(fields({ jurisdiction: 'US-DE' })).toContain('eu_offers_services');
    expect(fields({ jurisdiction: 'US-DE' })).not.toContain('eu_establishment');
    expect(fields({ jurisdiction: 'US-DE', eu_offers_services: true })).toContain('eu_establishment');
    expect(fields({ jurisdiction: 'FR' })).not.toContain('eu_offers_services');
  });
  it('asks a company outside the UK with UK users about an office in the UK', () => {
    expect(fields({ jurisdiction: 'US-DE', user_countries: ['GB'] })).toContain('uk_establishment');
    expect(fields({ jurisdiction: 'GB', user_countries: ['GB'] })).not.toContain('uk_establishment');
    expect(fields({ jurisdiction: 'US-DE', user_countries: ['US'] })).not.toContain('uk_establishment');
  });
  it('offers the EU trade mark numbers question to everyone', () => {
    expect(fields({ jurisdiction: 'KE' })).toContain('eu_trademark_numbers');
  });
});

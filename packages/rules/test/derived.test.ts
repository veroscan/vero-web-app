import { describe, expect, it } from 'vitest';
import { computeDerived, DERIVED_FACTS, type FactValue } from '../src/index.js';

const AS_OF = '2026-11-05';
function derive(facts: Record<string, FactValue>): Record<string, FactValue> {
  return computeDerived((key) => facts[key], AS_OF);
}

describe('derived facts', () => {
  it('are all null, or false for closed-world evidence, with no input', () => {
    const out = derive({});
    for (const [key, value] of Object.entries(out)) {
      if (key === 'derived.us.good_standing_current') expect(value).toBe(false);
      else expect(value, key).toBeNull();
    }
  });

  it('every derived fact has an input list', () => {
    for (const d of DERIVED_FACTS) expect(d.inputs.length, d.key).toBeGreaterThan(0);
  });

  describe('entity type', () => {
    it('sorts corporations and LLCs', () => {
      expect(derive({ 'company.entity_type': 'c_corp' })['derived.is_corp']).toBe(true);
      expect(derive({ 'company.entity_type': 's_corp' })['derived.is_corp']).toBe(true);
      expect(derive({ 'company.entity_type': 'llc' })['derived.is_corp']).toBe(false);
      expect(derive({ 'company.entity_type': 'llc' })['derived.is_llc']).toBe(true);
    });
  });

  describe('payments', () => {
    it('using only a licensed provider is not moving money', () => {
      const out = derive({ 'answers.payments_mode': ['psp_only'], 'answers.sectors': ['none'] });
      expect(out['derived.moves_money']).toBe(false);
      expect(out['derived.payments_via_partner_only']).toBe(true);
      expect(out['derived.sector.payments']).toBe(false);
      expect(out['derived.takes_payments']).toBe(true);
    });

    it('holding funds is', () => {
      const out = derive({ 'answers.payments_mode': ['psp_only', 'hold_funds'], 'answers.sectors': ['none'] });
      expect(out['derived.moves_money']).toBe(true);
      expect(out['derived.payments_via_partner_only']).toBe(false);
      expect(out['derived.sector.payments']).toBe(true);
    });

    it('stays unknown when only half the inputs are in and none says yes', () => {
      expect(derive({ 'answers.sectors': ['none'] })['derived.sector.payments']).toBeNull();
      expect(derive({ 'answers.sectors': ['payments'] })['derived.sector.payments']).toBe(true);
    });
  });

  describe('AI', () => {
    it('reads the roles', () => {
      expect(derive({ 'answers.ai_roles': ['none'] })['derived.uses_ai']).toBe(false);
      expect(derive({ 'answers.ai_roles': ['deployer'] })['derived.uses_ai']).toBe(true);
    });

    it('counts staff tools for the use policy', () => {
      expect(derive({ 'answers.ai_roles': ['none'], 'answers.staff_use_ai': true })['derived.ai_or_staff_ai']).toBe(true);
      expect(derive({ 'answers.ai_roles': ['none'], 'answers.staff_use_ai': false })['derived.ai_or_staff_ai']).toBe(false);
    });
  });

  describe('Nigeria', () => {
    it('applies the 200 data subject line', () => {
      const facts = { 'answers.processes_personal_data': true };
      expect(derive({ ...facts, 'answers.data_subjects_ng_6m': 199 })['derived.ng.dcpmi_in_scope']).toBe(false);
      expect(derive({ ...facts, 'answers.data_subjects_ng_6m': 200 })['derived.ng.dcpmi_in_scope']).toBe(true);
    });

    it('is in scope if already listed, whatever the count', () => {
      expect(derive({ 'registry.ng.ndpc.listed': true, 'answers.data_subjects_ng_6m': 0 })['derived.ng.dcpmi_in_scope']).toBe(true);
    });

    it('takes the tier from the register, then the answer, and never guesses above OHL', () => {
      expect(derive({ 'registry.ng.ndpc.category': 'uhl' })['derived.ng.ndpc_tier']).toBe('UHL');
      expect(derive({ 'answers.ndpc_category': 'EHL' })['derived.ng.ndpc_tier']).toBe('EHL');
      expect(derive({ 'answers.ndpc_category': 'dont_know', 'answers.data_subjects_ng_6m': 500_000 })['derived.ng.ndpc_tier']).toBe('OHL_OR_HIGHER');
      expect(derive({ 'answers.data_subjects_ng_6m': 3 })['derived.ng.ndpc_tier']).toBe('BELOW_THRESHOLD');
    });

    it('only asks for a DPCO when the category is known to need one', () => {
      expect(derive({ 'registry.ng.ndpc.category': 'OHL' })['derived.ng.audit_through_dpco']).toBe(false);
      expect(derive({ 'registry.ng.ndpc.category': 'EHL' })['derived.ng.audit_through_dpco']).toBe(true);
      expect(derive({ 'answers.ndpc_category': 'dont_know' })['derived.ng.audit_through_dpco']).toBeNull();
    });
  });

  describe('United States', () => {
    it('applies the proposed Delaware privacy thresholds', () => {
      const base = { 'answers.processes_personal_data': true };
      expect(derive({ ...base, 'answers.data_subjects_us_de_12m': 35_000 })['derived.us.dpdpa_in_scope']).toBe(true);
      expect(derive({ ...base, 'answers.data_subjects_us_de_12m': 9_999 })['derived.us.dpdpa_in_scope']).toBe(false);
      expect(derive({ ...base, 'answers.data_subjects_us_de_12m': 10_000, 'answers.over_20_percent_revenue_from_selling_data': true })['derived.us.dpdpa_in_scope']).toBe(true);
      expect(derive({ ...base, 'answers.data_subjects_us_de_12m': 10_000, 'answers.over_20_percent_revenue_from_selling_data': false })['derived.us.dpdpa_in_scope']).toBe(false);
      expect(derive({ ...base, 'answers.data_subjects_us_de_12m': 10_000 })['derived.us.dpdpa_in_scope']).toBeNull();
    });

    it('applies the CCPA test', () => {
      const none = { 'answers.processes_personal_data': true, 'answers.revenue_band': 'under_1m', 'answers.data_subjects_ca_12m': 10, 'answers.half_revenue_from_selling_data': false };
      expect(derive(none)['derived.us.is_ccpa_business']).toBe(false);
      expect(derive({ ...none, 'answers.revenue_band': 'over_26m' })['derived.us.is_ccpa_business']).toBe(true);
      expect(derive({ ...none, 'answers.data_subjects_ca_12m': 100_000 })['derived.us.is_ccpa_business']).toBe(true);
      expect(derive({ ...none, 'answers.half_revenue_from_selling_data': true })['derived.us.is_ccpa_business']).toBe(true);
      expect(derive({ 'answers.processes_personal_data': false })['derived.us.is_ccpa_business']).toBe(false);
    });

    it('treats a good standing certificate as current for 12 months once validated', () => {
      const key = 'derived.us.good_standing_current';
      const ok = { 'vault.de_good_standing.validated': true };
      expect(derive({ ...ok, 'vault.de_good_standing.dated': '2026-10-12' })[key]).toBe(true);
      expect(derive({ ...ok, 'vault.de_good_standing.dated': '2025-11-05' })[key]).toBe(true);
      expect(derive({ ...ok, 'vault.de_good_standing.dated': '2025-11-04' })[key]).toBe(false);
      expect(derive({ 'vault.de_good_standing.dated': '2026-10-12' })[key]).toBe(false);
    });
  });

  describe('United Kingdom', () => {
    it('reads identity check counts and dates', () => {
      const ch = 'registry.uk.companies_house';
      expect(derive({ [`${ch}.directors_idv_outstanding_count`]: 0 })['derived.uk.directors_idv_complete']).toBe(true);
      expect(derive({ [`${ch}.directors_idv_outstanding_count`]: 1 })['derived.uk.directors_idv_complete']).toBe(false);
      expect(derive({ [`${ch}.directors_idv_next_due`]: '2026-11-18' })['derived.uk.directors_idv_past_due']).toBe(false);
      expect(derive({ [`${ch}.directors_idv_next_due`]: AS_OF })['derived.uk.directors_idv_past_due']).toBe(false);
      expect(derive({ [`${ch}.directors_idv_next_due`]: '2026-11-04' })['derived.uk.directors_idv_past_due']).toBe(true);
    });

    it('reads the ICO end date', () => {
      expect(derive({ 'registry.uk.ico.listed': true, 'registry.uk.ico.expires_on': '2027-08-09' })['derived.uk.ico_current']).toBe(true);
      expect(derive({ 'registry.uk.ico.listed': true, 'registry.uk.ico.expires_on': '2026-08-09' })['derived.uk.ico_current']).toBe(false);
      expect(derive({ 'registry.uk.ico.listed': true, 'registry.uk.ico.expires_on': '2026-08-09' })['derived.uk.ico_lapsed']).toBe(true);
      expect(derive({ 'registry.uk.ico.listed': false })['derived.uk.ico_current']).toBe(false);
      expect(derive({ 'registry.uk.ico.listed': false })['derived.uk.ico_lapsed']).toBe(false);
      expect(derive({})['derived.uk.ico_current']).toBeNull();
    });
  });

  it('flags trackers set before consent', () => {
    expect(derive({ 'web.policy.cookies_before_consent_count': 0, 'web.policy.trackers_before_consent_count': 0 })['derived.web.trackers_before_consent']).toBe(false);
    expect(derive({ 'web.policy.cookies_before_consent_count': 2 })['derived.web.trackers_before_consent']).toBe(true);
    expect(derive({})['derived.web.trackers_before_consent']).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import {
  answersToFacts,
  attachDeadlines,
  computeDeadlines,
  freePlanRange,
  loadPack,
  packsFor,
  pointsForFinding,
  rankPriorities,
  runEngine,
  scoreFindings,
  type Fact,
  type FactValue,
} from '../src/index.js';

const AS_OF = '2026-11-05';
const CH = 'registry.uk.companies_house';

function toFacts(values: Record<string, FactValue>): Fact[] {
  return Object.entries(values).map(([key, value]) => ({ key, value }));
}

/** The fictional Kestrel Pay UK Ltd from the design: confirmation overdue, one director unverified, not on the ICO list. */
const kestrelUk: Record<string, FactValue> = {
  [`${CH}.found`]: true,
  [`${CH}.status`]: 'active',
  [`${CH}.registered_office_present`]: true,
  [`${CH}.registered_office_in_dispute`]: false,
  [`${CH}.undeliverable_registered_office`]: false,
  [`${CH}.sic_codes`]: ['62012'],
  [`${CH}.confirmation_overdue`]: true,
  [`${CH}.confirmation_next_due`]: '2026-10-12',
  [`${CH}.accounts_overdue`]: false,
  [`${CH}.accounts_next_due`]: '2027-06-30',
  [`${CH}.directors_active_count`]: 2,
  [`${CH}.directors_idv_on_record_count`]: 1,
  [`${CH}.directors_idv_outstanding_count`]: 1,
  [`${CH}.directors_idv_next_due`]: '2026-11-18',
  [`${CH}.psc_active_count`]: 1,
  [`${CH}.psc_idv_outstanding_count`]: 0,
  [`${CH}.charges_outstanding_count`]: 0,
  [`${CH}.insolvency_case_count`]: 0,
  [`${CH}.incorporation_filing_on_record`]: true,
  [`${CH}.capital_filing_on_record`]: true,
  'registry.uk.ico.listed': false,
  'registry.uk.hmrc_vat.registered': true,
};

describe('one company through the whole pipeline', () => {
  const { facts: answerFacts, values } = answersToFacts({
    jurisdiction: 'GB', incorporated: true, entity_type_gb: 'ltd', user_countries: ['GB', 'NG'],
    // Saying no is what makes an unseen assignment a real, urgent gap.
    ip_founders_signed: false,
    has_employees: true, has_contractors: true, processes_personal_data: true, has_website: true, has_app: false,
    ai_roles: ['deployer'], ai_uses_third_party_models: true, staff_use_ai: true, payments_mode: ['psp_only'], sectors: ['none'],
    customer_type: 'b2b', sells_to_enterprise: true, offers_api: true, has_raised_or_raising: true,
    has_subscriptions: true, user_generated_content: false, sensitive_data: ['none'], uses_processors: true, data_hosted_abroad: true,
    automated_decisions: false,
  });

  const result = runEngine([loadPack('GB')], {
    facts: [...answerFacts, ...toFacts(kestrelUk)],
    sources: { 'web.policy': 'unavailable' },
    stage: 3,
    company_name: 'Kestrel Pay UK Ltd',
    as_of: AS_OF,
    // What this company says it doesn't have: real gaps, so there's a list to rank.
    declared_missing: ['GB.IP.NDA', 'GB.IP.OPEN_SOURCE', 'GB.IP.SOFTWARE_LICENSING'],
  });
  const byId = new Map(result.findings.map((f) => [f.rule_id, f]));

  it('agrees with the design on the record page', () => {
    expect(byId.get('GB.CORP.STATUS')?.outcome).toBe('pass');
    expect(byId.get('GB.CORP.CONFIRMATION_STATEMENT')?.outcome).toBe('defect');
    expect(byId.get('GB.CORP.ACCOUNTS')?.outcome).toBe('pass');
    expect(byId.get('GB.CORP.DIRECTOR_IDV')?.outcome).toBe('verify');
    expect(byId.get('GB.DP.ICO_FEE')?.outcome).toBe('gap');
    expect(byId.get('GB.DP.ICO_FEE')?.text.headline).toBe("We can't find Kestrel Pay UK Ltd on the ICO register");
  });

  it('shows the website as "one source is down", not as failing', () => {
    expect(byId.get('GB.DP.PRIVACY_NOTICE')?.outcome).toBe('verify');
    expect(byId.get('GB.DP.PRIVACY_NOTICE')?.reason).toBe('source_unavailable');
  });

  it('scores, ranks and calculates points', () => {
    const deadlines = computeDeadlines([loadPack('GB')], {
      facts: { ...values, ...kestrelUk },
      company: { incorporated_on: '2023-04-12', year_end: { month: 3, day: 31 } },
      stage: 3,
      as_of: AS_OF,
    });
    const findings = attachDeadlines(result.findings, deadlines);
    const score = scoreFindings(findings);
    expect(score.overall).toBeGreaterThan(0);
    expect(score.overall).toBeLessThan(100);
    expect(score.layers).toHaveLength(6);
    expect(score.method_version).toBe('2026.11-draft.7');

    // The founders' IP assignment is open and urgent, so its layer sits at 49 or below.
    const ipLayer = score.layers.find((l) => l.layer === 2);
    expect(ipLayer?.open_critical).toBeGreaterThan(0);
    expect(ipLayer?.score).toBeLessThanOrEqual(49);

    const top = rankPriorities(findings, AS_OF);
    expect(top).toHaveLength(5);
    expect(top[0]?.finding.severity).toBe('critical');
    for (const action of top) expect(action.points).toBe(pointsForFinding(action.finding.rule_id, findings));
    expect(top[0]?.points).toBeGreaterThan(0);

    const range = freePlanRange(findings);
    expect(range).not.toBeNull();
    expect((range?.high ?? 0) - (range?.low ?? 0)).toBe(15);
  });

  it('never scores a rule that is waiting for a lawyer', () => {
    for (const finding of result.findings) {
      if (finding.confidence === 'needs_review') expect(finding.scored).toBe(false);
    }
  });
});

describe('Delaware end to end', () => {
  it('gives the Delaware design: certified good standing, franchise tax not proved', () => {
    const { facts } = answersToFacts({ jurisdiction: 'US-DE', incorporated: true, entity_type_us: 'c_corp', foreign_ownership_25_plus: true });
    const { findings } = runEngine(packsFor('US-DE'), {
      facts: [...facts, ...toFacts({
        'registry.us.delaware_vendor.found': true,
        'registry.us.delaware_vendor.registered_agent_present': true,
        'registry.us.uspto.trademark_filed': true,
        'registry.sanctions.match': false,
        'vault.de_good_standing.present': true,
        'vault.de_good_standing.validated': true,
        'vault.de_good_standing.dated': '2026-10-12',
        'vault.ein_letter.present': true,
      })],
      stage: 3,
      as_of: AS_OF,
    });
    const byId = new Map(findings.map((f) => [f.rule_id, f]));
    expect(byId.get('US-DE.CORP.GOOD_STANDING')?.outcome).toBe('pass');
    expect(byId.get('US-DE.CORP.FRANCHISE_TAX')).toMatchObject({ outcome: 'verify', reason: 'not_seen_yet' });
    expect(byId.get('US.TAX.EIN')?.outcome).toBe('pass');
    expect(byId.get('US.IP.TRADEMARK')?.outcome).toBe('pass');
    expect(byId.get('US.SANCT.SCREENING')?.outcome).toBe('pass');
    expect(byId.get('US.TAX.FORM_5472')).toMatchObject({ outcome: 'verify', reason: 'not_seen_yet' });
  });
});

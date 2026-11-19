/**
 * A small, made-up world for the scenario specification: one company per MVP country, with
 * the facts a healthy company would have, and helpers to break it one way at a time. Every
 * value here is fictional. Nothing is read from a provider.
 */
import {
  answersToFacts,
  attachDeadlines,
  computeDeadlines,
  freePlanRange,
  runEngine,
  scoreFindings,
  selectPacks,
  varsIn,
  type Answers,
  type EvidenceMethod,
  type Fact,
  type FactValue,
  type Finding,
  type MvpMarket,
  type SourceState,
} from '../../src/index.js';

export const AS_OF = '2026-11-15T12:00:00.000Z';
const RETRIEVED = '2026-11-15T11:00:00.000Z';

export interface SourceSpec {
  prefix: string;
  name: string;
  method: EvidenceMethod;
}

export const SOURCES = {
  ch: { prefix: 'registry.uk.companies_house', name: 'Companies House', method: 'official_live' },
  ico: { prefix: 'registry.uk.ico', name: 'ICO register', method: 'official_list' },
  vat: { prefix: 'registry.uk.hmrc_vat', name: 'HMRC', method: 'official_live' },
  cac: { prefix: 'registry.ng.cac', name: 'CAC, through our licensed data provider', method: 'licensed_vendor' },
  ndpc: { prefix: 'registry.ng.ndpc', name: 'NDPC', method: 'official_list' },
  de: { prefix: 'registry.us.delaware_vendor', name: 'our licensed data provider', method: 'licensed_vendor' },
  uspto: { prefix: 'registry.us.uspto', name: 'the USPTO', method: 'official_live' },
  sec: { prefix: 'registry.us.sec_form_d', name: 'SEC EDGAR', method: 'official_live' },
  sanctions: { prefix: 'registry.sanctions', name: 'official sanctions', method: 'official_list' },
  web: { prefix: 'web.policy', name: 'your website', method: 'official_live' },
} as const satisfies Record<string, SourceSpec>;
export type SourceKey = keyof typeof SOURCES;

/** What a clean, healthy company's sources say. */
export const CLEAN: Record<SourceKey, Record<string, FactValue>> = {
  ch: {
    found: true, company_number: '00000001', company_name: 'Heron Scenario Ltd', status: 'active', type: 'ltd', incorporated_on: '2023-04-12', sic_codes: ['62012'],
    registered_office_present: true, registered_office_in_dispute: false, undeliverable_registered_office: false,
    confirmation_next_due: '2027-04-12', confirmation_overdue: false, confirmation_last_made_up_to: '2026-04-12',
    accounts_next_due: '2027-06-30', accounts_overdue: false, accounts_last_type: 'micro-entity',
    officers: ['SAMPLE, Person (director)'], directors_active_count: 2, directors_idv_on_record_count: 2, directors_idv_outstanding_count: 0, directors_idv_next_due: '2027-11-18',
    psc_active_count: 1, pscs: ['Sample Holdings'], psc_idv_outstanding_count: 0, psc_idv_next_due: '2027-11-18', psc_sanctioned: false,
    charges_total_count: 0, charges_outstanding_count: 0, insolvency_case_count: 0,
    incorporation_filing_on_record: true, capital_filing_on_record: true, last_allotment_on: '2025-03-14',
  },
  ico: { listed: true, z_reference: 'ZA000000', expires_on: '2027-08-09', tier: '1' },
  vat: { registered: true, vat_number: '000000000', name: 'Heron Scenario Ltd' },
  cac: {
    found: true, name: 'Heron Scenario Nigeria Ltd', rc_number: '0000001', status: 'active', type: 'private company limited by shares', incorporated_on: '2021-06-12',
    registered_address_present: true, share_capital_on_record: true, officers: ['Sample Person (director)'], directors_count: 2, shareholders_count: 1,
    shareholders: ['Sample Holdings (shareholder)'], secretary_on_record: true, psc_count: 1, tin_issued: true,
  },
  ndpc: { listed: true, category: 'OHL', year: '2026' },
  de: { found: true, name: 'Heron Scenario Inc.', file_number: '0000001', entity_type: 'corporation', formed_on: '2022-08-16', registered_agent_present: true, registered_agent: 'Sample Agents LLC', other_state_registration_count: 0, officers: ['Sample Person (CEO)'] },
  uspto: { trademark_filed: true, trademark_registered: true, trademark_marks: ['HERON'], trademark_status: 'live', patent_application_count: 0 },
  sec: { filed: true, filing_count: 1, latest_filed_on: '2025-06-03', total_offering_amount: '1500000', total_amount_sold: '1500000', first_sale_on: '2025-05-20' },
  sanctions: { match: false, possible_match: false, lists_checked: ['OFAC SDN', 'UK Sanctions List', 'UN Consolidated List'] },
  web: {
    privacy_notice_found: true, privacy_notice_url: 'fixture://heron.example/privacy', word_count: 1840, last_updated: '2026-03-02', names_company: true,
    rights_section: true, retention_statement: true, transfers_section: true, dpo_contact: true, complaint_route_ico: true, complaint_route_ndpc: true, ccpa_links: true, children_section: true, stale_citation: false,
    cookie_policy_found: true, terms_found: true, refund_policy_found: true, complaints_policy_found: true, acceptable_use_found: true, accessibility_found: true, security_txt_found: true,
    ai_disclosure_found: true, eula_found: true, takedown_policy_found: true, opt_out_link: true, cmp_detected: true, cookies_before_consent_count: 0, trackers_before_consent_count: 0,
  },
};

/** The registers each country's company is looked up in. */
export const HOME_SOURCES: Record<MvpMarket, SourceKey[]> = {
  GB: ['ch', 'ico', 'vat', 'sanctions', 'web'],
  NG: ['cac', 'ndpc', 'sanctions', 'web'],
  'US-DE': ['de', 'uspto', 'sec', 'sanctions', 'web'],
};

const BASE_ANSWERS: Answers = {
  investor_countries: ['none'],
  has_raised_or_raising: false,
  has_employees: true,
  has_contractors: true,
  has_foreign_workers: false,
  revenue_band: 'under_1m',
  headcount_band: '1_10',
  processes_personal_data: true,
  data_subjects_gb_12m: 500,
  data_subjects_ng_6m: 500,
  sensitive_data: ['none'],
  data_hosted_abroad: false,
  uses_processors: true,
  has_website: true,
  has_app: false,
  ai_roles: ['none'],
  staff_use_ai: false,
  automated_decisions: false,
  payments_mode: ['none'],
  sectors: ['none'],
  customer_type: 'b2b',
  has_subscriptions: false,
  sells_to_enterprise: false,
  offers_api: false,
  user_generated_content: false,
};

export function answersFor(country: MvpMarket, users: string[] = [country === 'US-DE' ? 'US' : country]): Answers {
  const entity = country === 'US-DE' ? { entity_type_us: 'c_corp' } : country === 'GB' ? { entity_type_gb: 'ltd' } : { entity_type_ng: 'ltd', ng_small_company: true };
  return { ...BASE_ANSWERS, ...entity, user_countries: users, employee_countries: [country === 'US-DE' ? 'US' : country] };
}

function provenance(spec: SourceSpec) {
  return { source: spec.prefix, source_name: spec.name, method: spec.method, retrieved_at: RETRIEVED };
}

export function sourceFacts(key: SourceKey, values: Record<string, FactValue> = CLEAN[key]): Fact[] {
  const spec = SOURCES[key];
  return Object.entries(values).map(([name, value]) => ({ key: `${spec.prefix}.${name}`, value, provenance: provenance(spec) }));
}

export interface WorldOptions {
  country: MvpMarket;
  /** Markets the company has users or operates in. Countries outside the MVP are ignored by the engine. */
  markets?: string[];
  answers?: Answers;
  /** Per source: its facts (default CLEAN), or omit it to leave it out entirely. */
  registry?: Partial<Record<SourceKey, Record<string, FactValue> | null>>;
  /** Per source prefix: what became of it on this scan. Default "ok" for every source that has facts. */
  states?: Partial<Record<SourceKey, SourceState>>;
  /** Every document slot and every "you told us" fact the rules read, filled in. */
  allDocuments?: boolean;
  /** Extra facts, such as GitHub or French data. */
  extra?: Fact[];
  declaredMissing?: string[];
  stage?: number;
  asOf?: string;
}

/** Every vault and attest key the packs read, filled as a company with everything on file would. */
export function everythingOnFile(packs: ReturnType<typeof selectPacks>['packs']): Fact[] {
  const keys = new Set(packs.flatMap((pack) => pack.rules.flatMap((rule) => [rule.satisfied_when, ...(rule.answered_by ?? []).map((item) => ({ var: item.fact }))].flatMap(varsIn))));
  const out: Fact[] = [];
  for (const key of keys) {
    if (key.startsWith('vault.')) {
      const slot = key.split('.')[1] as string;
      out.push({ key: `vault.${slot}.present`, value: true, provenance: { source: 'vault', source_name: 'your documents', method: 'document', retrieved_at: RETRIEVED } });
      out.push({ key: `vault.${slot}.validated`, value: true, provenance: { source: 'vault', source_name: 'your documents', method: 'document', retrieved_at: RETRIEVED } });
      out.push({ key: `vault.${slot}.dated`, value: '2026-10-01', provenance: { source: 'vault', source_name: 'your documents', method: 'document', retrieved_at: RETRIEVED } });
      out.push({ key: `vault.${slot}.expires_on`, value: '2027-10-01', provenance: { source: 'vault', source_name: 'your documents', method: 'document', retrieved_at: RETRIEVED } });
    } else if (key.startsWith('attest.')) {
      out.push({ key, value: true, provenance: { source: 'attestation', source_name: 'You told us', method: 'attested', retrieved_at: RETRIEVED } });
    }
  }
  // One fact per key.
  return [...new Map(out.map((fact) => [fact.key, fact])).values()];
}

export function world(options: WorldOptions) {
  const { country } = options;
  const answers = options.answers ?? answersFor(country);
  const markets = options.markets ?? [];
  const selection = selectPacks({
    incorporation: country,
    markets: [...markets, ...((answers['user_countries'] as string[] | undefined) ?? [])],
    employee_countries: (answers['employee_countries'] as string[] | undefined) ?? [],
  });
  const answerFacts = answersToFacts({ ...answers, jurisdiction: country, incorporated: true }).facts;
  const registry: Fact[] = [];
  const states: Record<string, SourceState> = {};
  for (const key of HOME_SOURCES[country]) {
    const given = options.registry?.[key];
    if (given === null) continue;
    registry.push(...sourceFacts(key, given ?? CLEAN[key]));
    states[SOURCES[key].prefix] = 'ok';
  }
  for (const [key, state] of Object.entries(options.states ?? {})) states[SOURCES[key as SourceKey].prefix] = state;
  const documents = options.allDocuments ? everythingOnFile(selection.packs) : [];
  const facts = [...answerFacts, ...registry, ...documents, ...(options.extra ?? [])];
  const asOf = options.asOf ?? AS_OF;
  const stage = options.stage ?? 3;
  const engine = runEngine(selection.packs, { facts, sources: states, stage, company_name: 'Heron Scenario', as_of: asOf, declared_missing: options.declaredMissing ?? [] });
  const values = Object.fromEntries(facts.map((fact) => [fact.key, fact.value]));
  const deadlines = computeDeadlines(selection.packs, {
    facts: values,
    company: { incorporated_on: '2023-04-12', year_end: { month: 3, day: 31 } },
    stage,
    as_of: asOf,
    unavailable_prefixes: Object.entries(states).filter(([, state]) => state !== 'ok').map(([prefix]) => prefix),
  });
  const findings: Finding[] = attachDeadlines(engine.findings, deadlines);
  return { selection, facts, states, engine, findings, deadlines, score: scoreFindings(findings), range: freePlanRange(findings) };
}

export const byRule = (findings: readonly Finding[], id: string): Finding => {
  const found = findings.find((item) => item.rule_id === id);
  if (!found) throw new Error(`No finding for ${id}`);
  return found;
};

/** Findings that read a fact under this prefix. */
export function readingPrefix(findings: readonly Finding[], prefix: string): Finding[] {
  return findings.filter((item) => item.facts_used.some((used) => used.key === prefix || used.key.startsWith(`${prefix}.`)));
}

/** Every word a person could read on a finding. */
export function wordsOf(finding: Finding): string {
  return [finding.title, ...Object.values(finding.text)].join(' ');
}

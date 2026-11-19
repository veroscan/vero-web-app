import { addDays, addMonths, clampedDate, isIsoDate, parseDate } from './dates.js';
import type { FactValue } from './facts.js';
import { EU_VAT_COUNTRIES } from './questionnaire.js';

/**
 * Derived facts: worked out once here, tested in test/derived.test.ts, so rules
 * stay short. A derived fact is null when we can't tell yet, and the engine
 * treats null as unknown, which leads to "verify" and not to a failed rule.
 */

export type Getter = (key: string) => FactValue | undefined;

export interface DerivedFact {
  key: string;
  /** Facts this one reads, so the engine can say why it's unknown. */
  inputs: readonly string[];
  compute: (get: Getter, asOf: string) => FactValue;
}

/** Thresholds used by derived facts. Each is quoted from a map or the matrix. */
export const DERIVED_THRESHOLDS = {
  /** Nigeria map section 7: OHL from 200 data subjects in 6 months. */
  ndpcDataSubjectsSixMonths: 200,
  /** Delaware map section 7, tagged [verify], so the rules using it stay needs_review. */
  dpdpaConsumers: 35_000,
  dpdpaConsumersWithSales: 10_000,
  /** Verification matrix section 6: CCPA thresholds. */
  ccpaConsumers: 100_000,
  /** Delaware map section 2: 25% or more foreign ownership. */
  foreignOwnershipPercent: 25,
  /** Canada map CA-1.10: the annual return is filed within 60 days after the anniversary. */
  caAnnualReturnDays: 60,
} as const;

function bool(get: Getter, key: string): boolean | null {
  const value = get(key);
  return typeof value === 'boolean' ? value : null;
}

function list(get: Getter, key: string): string[] | null {
  const value = get(key);
  return Array.isArray(value) ? value : null;
}

function num(get: Getter, key: string): number | null {
  const value = get(key);
  return typeof value === 'number' ? value : null;
}

function str(get: Getter, key: string): string | null {
  const value = get(key);
  return typeof value === 'string' ? value : null;
}

/** Any true wins, otherwise any unknown stays unknown. */
function anyOf(...values: (boolean | null)[]): boolean | null {
  if (values.some((v) => v === true)) return true;
  return values.some((v) => v === null) ? null : false;
}

function passthrough(key: string, input: string): DerivedFact {
  return { key, inputs: [input], compute: (get) => bool(get, input) };
}

function includesAny(get: Getter, key: string, ...wanted: string[]): boolean | null {
  const values = list(get, key);
  return values === null ? null : wanted.some((w) => values.includes(w));
}

function sector(name: string, ...options: string[]): DerivedFact {
  return {
    key: `derived.sector.${name}`,
    inputs: ['answers.sectors'],
    compute: (get) => includesAny(get, 'answers.sectors', ...options),
  };
}

/** Holding funds, running wallets or FX means you move money yourself. A licensed PSP alone doesn't. */
const MOVES_MONEY = ['hold_funds', 'wallet', 'fx'];

export const DERIVED_FACTS: readonly DerivedFact[] = [
  {
    key: 'derived.is_corp',
    inputs: ['company.entity_type'],
    compute: (get) => {
      const type = str(get, 'company.entity_type');
      return type === null ? null : type === 'c_corp' || type === 's_corp';
    },
  },
  {
    key: 'derived.is_llc',
    inputs: ['company.entity_type'],
    compute: (get) => {
      const type = str(get, 'company.entity_type');
      return type === null ? null : type === 'llc';
    },
  },
  passthrough('derived.has_website', 'answers.has_website'),
  passthrough('derived.has_app', 'answers.has_app'),
  {
    key: 'derived.has_website_or_app',
    inputs: ['answers.has_website', 'answers.has_app'],
    compute: (get) => anyOf(bool(get, 'answers.has_website'), bool(get, 'answers.has_app')),
  },
  passthrough('derived.personal_data', 'answers.processes_personal_data'),
  {
    key: 'derived.sensitive_data',
    inputs: ['answers.processes_personal_data', 'answers.sensitive_data'],
    compute: (get) => {
      if (bool(get, 'answers.processes_personal_data') === false) return false;
      const values = list(get, 'answers.sensitive_data');
      return values === null ? null : values.some((v) => v !== 'none');
    },
  },
  passthrough('derived.employees', 'answers.has_employees'),
  passthrough('derived.contractors', 'answers.has_contractors'),
  {
    key: 'derived.team_or_contractors',
    inputs: ['answers.has_employees', 'answers.has_contractors'],
    compute: (get) => anyOf(bool(get, 'answers.has_employees'), bool(get, 'answers.has_contractors')),
  },
  passthrough('derived.foreign_workers', 'answers.has_foreign_workers'),
  passthrough('derived.premises', 'answers.has_premises'),
  passthrough('derived.foreign_owned', 'answers.foreign_ownership_25_plus'),
  {
    // Nigeria's FOREIGN trigger: foreign shareholders, directors or expatriate staff.
    key: 'derived.foreign_any',
    inputs: ['answers.foreign_shareholders_or_directors', 'answers.has_foreign_workers'],
    compute: (get) => anyOf(bool(get, 'answers.foreign_shareholders_or_directors'), bool(get, 'answers.has_foreign_workers')),
  },
  passthrough('derived.foreign_tech', 'answers.pays_foreign_for_technology'),
  passthrough('derived.invested', 'answers.has_raised_or_raising'),
  passthrough('derived.exports', 'answers.exports_controlled_tech'),
  passthrough('derived.has_api', 'answers.offers_api'),
  passthrough('derived.enterprise', 'answers.sells_to_enterprise'),
  passthrough('derived.gov_supplier', 'answers.supplies_government'),
  passthrough('derived.subscriptions', 'answers.has_subscriptions'),
  passthrough('derived.children', 'answers.users_under_13'),
  passthrough('derived.has_processors', 'answers.uses_processors'),
  passthrough('derived.sms_or_calls', 'answers.sends_sms_or_calls'),
  passthrough('derived.physical_products', 'answers.sells_physical_products'),
  passthrough('derived.founder_restricted_stock', 'answers.founders_restricted_stock'),
  passthrough('derived.equity_incentives', 'answers.grants_equity_to_staff'),
  passthrough('derived.priced_round', 'answers.raised_priced_round'),
  passthrough('derived.automated_decisions', 'answers.automated_decisions'),
  {
    key: 'derived.sends_marketing',
    inputs: ['answers.marketing_consent'],
    compute: (get) => {
      const consent = str(get, 'answers.marketing_consent');
      return consent === null ? null : consent !== 'none';
    },
  },
  // Country triggers for the draft packs (16 Nov 2026). Each reads the register where it can.
  {
    /** An AG (eCH-0097 code 0106). The register's legal form wins over the answer. */
    key: 'derived.ch.is_ag',
    inputs: ['registry.ch.zefix.legal_form_code', 'company.entity_type'],
    compute: (get) => {
      const code = str(get, 'registry.ch.zefix.legal_form_code');
      if (code !== null) return code === '0106';
      const type = str(get, 'company.entity_type');
      return type === null ? null : type === 'ag';
    },
  },
  {
    /** Covered by Australia's Privacy Act, as the company answered. "Not sure" stays unknown. */
    key: 'derived.au.privacy_act',
    inputs: ['answers.processes_personal_data', 'answers.au_privacy_act'],
    compute: (get) => {
      if (bool(get, 'answers.processes_personal_data') === false) return false;
      const answer = str(get, 'answers.au_privacy_act');
      return answer === 'yes' ? true : answer === 'no' ? false : null;
    },
  },
  {
    key: 'derived.sg.cpf_employees',
    inputs: ['answers.has_employees', 'answers.sg_cpf_employees'],
    compute: (get) => (bool(get, 'answers.has_employees') === false ? false : bool(get, 'answers.sg_cpf_employees')),
  },
  passthrough('derived.sg.nominees', 'answers.sg_nominees'),
  {
    /**
     * Established in the EU (GDPR art 3, DSA art 13): registered in a member state, or, for a company
     * registered elsewhere, its answer about an office, branch or staff in the EU. Unknown otherwise.
     */
    key: 'derived.eu_established',
    inputs: ['company.jurisdiction', 'answers.eu_establishment'],
    compute: (get) => {
      const country = str(get, 'company.jurisdiction');
      if (country !== null && (EU_VAT_COUNTRIES as readonly string[]).includes(country)) return true;
      return country === null ? null : bool(get, 'answers.eu_establishment');
    },
  },
  {
    /** Established in the UK (UK GDPR art 3): registered there, or its answer about an office, branch or staff there. */
    key: 'derived.uk_established',
    inputs: ['company.jurisdiction', 'answers.uk_establishment'],
    compute: (get) => {
      const country = str(get, 'company.jurisdiction');
      if (country === 'GB' || country?.startsWith('GB-')) return true;
      return country === null ? null : bool(get, 'answers.uk_establishment');
    },
  },
  {
    /**
     * New Zealand map NZ-1.08: the annual return is filed in the company's filing month each
     * year, from the calendar year after incorporation. Overdue when the latest filing month that
     * has ended has no return on or after its first day. Unknown without the register's dates.
     */
    key: 'derived.nz.annual_return_overdue',
    inputs: ['registry.nz.companies.annual_return_filing_month', 'registry.nz.companies.annual_return_last_filed_on', 'registry.nz.companies.incorporated_on'],
    compute: (get, asOf) => {
      const month = num(get, 'registry.nz.companies.annual_return_filing_month');
      const incorporated = get('registry.nz.companies.incorporated_on');
      if (month === null || !Number.isInteger(month) || month < 1 || month > 12 || !isIsoDate(incorporated)) return null;
      const today = parseDate(asOf);
      const year = today.month > month ? today.year : today.year - 1;
      if (year <= parseDate(incorporated).year) return false;
      const filed = get('registry.nz.companies.annual_return_last_filed_on');
      if (!isIsoDate(filed)) return null;
      return filed.slice(0, 10) < clampedDate(year, month, 1);
    },
  },
  {
    /**
     * Canada map CA-1.10: the annual return is filed within 60 days after each anniversary of
     * incorporation. Overdue when the latest anniversary whose 60 days have passed is later than
     * the latest annual return year on the register. Unknown without the register's dates.
     */
    key: 'derived.ca.annual_return_overdue',
    inputs: ['registry.ca.corporations.incorporated_on', 'registry.ca.corporations.last_annual_return_year'],
    compute: (get, asOf) => {
      const incorporated = get('registry.ca.corporations.incorporated_on');
      if (!isIsoDate(incorporated)) return null;
      const formed = parseDate(incorporated);
      const today = parseDate(asOf);
      const windowOpen = addDays(clampedDate(today.year, formed.month, formed.day), DERIVED_THRESHOLDS.caAnnualReturnDays) >= asOf;
      const year = windowOpen ? today.year - 1 : today.year;
      if (year <= formed.year) return false;
      const last = num(get, 'registry.ca.corporations.last_annual_return_year');
      return last === null ? null : last < year;
    },
  },
  {
    key: 'derived.consumer',
    inputs: ['answers.customer_type'],
    compute: (get) => {
      const type = str(get, 'answers.customer_type');
      return type === null ? null : type === 'b2c' || type === 'both';
    },
  },
  {
    key: 'derived.uses_ai',
    inputs: ['answers.ai_roles'],
    compute: (get) => {
      const roles = list(get, 'answers.ai_roles');
      return roles === null ? null : roles.some((r) => r !== 'none');
    },
  },
  {
    key: 'derived.ai_or_staff_ai',
    inputs: ['answers.ai_roles', 'answers.staff_use_ai'],
    compute: (get) => {
      const roles = list(get, 'answers.ai_roles');
      return anyOf(roles === null ? null : roles.some((r) => r !== 'none'), bool(get, 'answers.staff_use_ai'));
    },
  },
  {
    key: 'derived.ai_third_party_models',
    inputs: ['answers.ai_roles', 'answers.ai_uses_third_party_models'],
    compute: (get) => {
      const roles = list(get, 'answers.ai_roles');
      if (roles !== null && roles.every((r) => r === 'none')) return false;
      return bool(get, 'answers.ai_uses_third_party_models');
    },
  },
  {
    // High-risk processing: AI, automated decisions, sensitive data.
    key: 'derived.high_risk_processing',
    inputs: ['answers.processes_personal_data', 'answers.ai_roles', 'answers.automated_decisions', 'answers.sensitive_data'],
    compute: (get) => {
      if (bool(get, 'answers.processes_personal_data') === false) return false;
      const roles = list(get, 'answers.ai_roles');
      const sensitive = list(get, 'answers.sensitive_data');
      return anyOf(
        roles === null ? null : roles.some((r) => r !== 'none'),
        bool(get, 'answers.automated_decisions'),
        sensitive === null ? null : sensitive.some((s) => s !== 'none'),
      );
    },
  },
  {
    key: 'derived.data_outside_home',
    inputs: ['answers.processes_personal_data', 'answers.data_hosted_abroad'],
    compute: (get) => {
      if (bool(get, 'answers.processes_personal_data') === false) return false;
      return bool(get, 'answers.data_hosted_abroad');
    },
  },
  {
    key: 'derived.moves_money',
    inputs: ['answers.payments_mode'],
    compute: (get) => includesAny(get, 'answers.payments_mode', ...MOVES_MONEY),
  },
  {
    key: 'derived.payments_via_partner_only',
    inputs: ['answers.payments_mode'],
    compute: (get) => {
      const modes = list(get, 'answers.payments_mode');
      return modes === null ? null : modes.includes('psp_only') && !modes.some((m) => MOVES_MONEY.includes(m));
    },
  },
  {
    key: 'derived.takes_payments',
    inputs: ['answers.payments_mode'],
    compute: (get) => {
      const modes = list(get, 'answers.payments_mode');
      return modes === null ? null : modes.some((m) => m !== 'none');
    },
  },
  {
    key: 'derived.sector.payments',
    inputs: ['answers.sectors', 'answers.payments_mode'],
    compute: (get) => anyOf(
      includesAny(get, 'answers.sectors', 'payments'),
      includesAny(get, 'answers.payments_mode', ...MOVES_MONEY),
    ),
  },
  {
    key: 'derived.sector.lending',
    inputs: ['answers.sectors', 'answers.payments_mode'],
    compute: (get) => anyOf(
      includesAny(get, 'answers.sectors', 'lending'),
      includesAny(get, 'answers.payments_mode', 'lending'),
    ),
  },
  {
    key: 'derived.sector.crypto',
    inputs: ['answers.sectors', 'answers.payments_mode'],
    compute: (get) => anyOf(
      includesAny(get, 'answers.sectors', 'crypto'),
      includesAny(get, 'answers.payments_mode', 'crypto'),
    ),
  },
  sector('banking', 'banking'),
  sector('securities', 'securities'),
  sector('derivatives', 'derivatives'),
  sector('insurtech', 'insurtech'),
  sector('telecoms', 'telecoms'),
  sector('healthtech', 'healthtech'),
  sector('professional', 'professional'),
  sector('gambling', 'gambling'),
  sector('energy', 'energy'),
  sector('payment_system', 'payment_system'),
  {
    key: 'derived.sector.platform',
    inputs: ['answers.sectors', 'answers.user_generated_content'],
    compute: (get) => anyOf(includesAny(get, 'answers.sectors', 'platform'), bool(get, 'answers.user_generated_content')),
  },
  {
    // Any UK financial sector pack: section 4 of the UK map is triggered by SECTOR.*.
    key: 'derived.sector.uk_financial',
    inputs: ['answers.sectors', 'answers.payments_mode'],
    compute: (get) => anyOf(
      includesAny(get, 'answers.sectors', 'payments', 'lending', 'crypto', 'banking'),
      includesAny(get, 'answers.payments_mode', ...MOVES_MONEY, 'lending', 'crypto'),
    ),
  },
  {
    key: 'derived.sector.us_aml',
    inputs: ['answers.sectors', 'answers.payments_mode'],
    compute: (get) => anyOf(
      includesAny(get, 'answers.sectors', 'payments', 'securities', 'lending'),
      includesAny(get, 'answers.payments_mode', ...MOVES_MONEY, 'lending'),
    ),
  },
  {
    key: 'derived.sector.ng_levy',
    inputs: ['answers.sectors', 'answers.payments_mode'],
    compute: (get) => anyOf(
      includesAny(get, 'answers.sectors', 'payments', 'banking', 'telecoms', 'insurtech'),
      includesAny(get, 'answers.payments_mode', ...MOVES_MONEY),
    ),
  },
  {
    key: 'derived.sanctions_exposure',
    inputs: ['answers.sectors', 'answers.payments_mode', 'answers.exports_controlled_tech'],
    compute: (get) => anyOf(
      includesAny(get, 'answers.sectors', 'payments', 'securities', 'crypto'),
      includesAny(get, 'answers.payments_mode', ...MOVES_MONEY, 'crypto'),
      bool(get, 'answers.exports_controlled_tech'),
    ),
  },
  {
    // Delaware's "Certified {date}": a validated certificate from the last 12 months.
    key: 'derived.us.good_standing_current',
    inputs: ['vault.de_good_standing.validated', 'vault.de_good_standing.dated'],
    compute: (get, asOf) => {
      if (get('vault.de_good_standing.validated') !== true) return false;
      const dated = get('vault.de_good_standing.dated');
      return isIsoDate(dated) && addMonths(dated.slice(0, 10), 12) >= asOf;
    },
  },
  passthrough('derived.us.de_operations', 'answers.operates_in_delaware'),
  passthrough('derived.us.de_employees', 'answers.has_delaware_employees'),
  passthrough('derived.us.multi_state', 'answers.does_business_in_other_states'),
  passthrough('derived.us.foreign_entity_us_registered', 'answers.foreign_entity_registered_in_us'),
  {
    key: 'derived.us.dpdpa_in_scope',
    inputs: ['answers.processes_personal_data', 'answers.data_subjects_us_de_12m', 'answers.over_20_percent_revenue_from_selling_data'],
    compute: (get) => {
      if (bool(get, 'answers.processes_personal_data') === false) return false;
      const consumers = num(get, 'answers.data_subjects_us_de_12m');
      if (consumers === null) return null;
      if (consumers >= DERIVED_THRESHOLDS.dpdpaConsumers) return true;
      if (consumers < DERIVED_THRESHOLDS.dpdpaConsumersWithSales) return false;
      return bool(get, 'answers.over_20_percent_revenue_from_selling_data');
    },
  },
  {
    key: 'derived.us.is_ccpa_business',
    inputs: ['answers.processes_personal_data', 'answers.revenue_band', 'answers.data_subjects_ca_12m', 'answers.half_revenue_from_selling_data'],
    compute: (get) => {
      if (bool(get, 'answers.processes_personal_data') === false) return false;
      const band = str(get, 'answers.revenue_band');
      const consumers = num(get, 'answers.data_subjects_ca_12m');
      return anyOf(
        band === null ? null : band === 'over_26m',
        consumers === null ? null : consumers >= DERIVED_THRESHOLDS.ccpaConsumers,
        bool(get, 'answers.half_revenue_from_selling_data'),
      );
    },
  },
  {
    key: 'derived.ng.dcpmi_in_scope',
    inputs: ['answers.processes_personal_data', 'answers.data_subjects_ng_6m', 'registry.ng.ndpc.listed'],
    compute: (get) => {
      if (bool(get, 'registry.ng.ndpc.listed') === true) return true;
      if (bool(get, 'answers.processes_personal_data') === false) return false;
      const subjects = num(get, 'answers.data_subjects_ng_6m');
      return subjects === null ? null : subjects >= DERIVED_THRESHOLDS.ndpcDataSubjectsSixMonths;
    },
  },
  {
    /**
     * Nigeria's tier. The register gives UHL, EHL or OHL for listed firms. For
     * firms not listed we can only say the OHL floor is met: the EHL and UHL
     * thresholds are tagged [verify] in the map, so we don't guess at them.
     */
    key: 'derived.ng.ndpc_tier',
    inputs: ['registry.ng.ndpc.category', 'answers.data_subjects_ng_6m', 'answers.ndpc_category'],
    compute: (get) => {
      const listed = str(get, 'registry.ng.ndpc.category');
      if (listed !== null) return listed.toUpperCase();
      const told = str(get, 'answers.ndpc_category');
      if (told !== null && told !== 'dont_know') return told.toUpperCase();
      const subjects = num(get, 'answers.data_subjects_ng_6m');
      if (subjects === null) return null;
      return subjects >= DERIVED_THRESHOLDS.ndpcDataSubjectsSixMonths ? 'OHL_OR_HIGHER' : 'BELOW_THRESHOLD';
    },
  },
  {
    key: 'derived.ng.audit_through_dpco',
    inputs: ['registry.ng.ndpc.category', 'answers.data_subjects_ng_6m', 'answers.ndpc_category'],
    compute: (get) => {
      const listed = str(get, 'registry.ng.ndpc.category') ?? str(get, 'answers.ndpc_category');
      if (listed === null || listed === 'dont_know') return null;
      return ['UHL', 'EHL'].includes(listed.toUpperCase());
    },
  },
  {
    key: 'derived.uk.directors_idv_complete',
    inputs: ['registry.uk.companies_house.directors_idv_outstanding_count'],
    compute: (get) => {
      const outstanding = num(get, 'registry.uk.companies_house.directors_idv_outstanding_count');
      return outstanding === null ? null : outstanding === 0;
    },
  },
  {
    key: 'derived.uk.directors_idv_past_due',
    inputs: ['registry.uk.companies_house.directors_idv_next_due'],
    compute: (get, asOf) => {
      const due = get('registry.uk.companies_house.directors_idv_next_due');
      return isIsoDate(due) ? due.slice(0, 10) < asOf : null;
    },
  },
  {
    key: 'derived.uk.psc_idv_complete',
    inputs: ['registry.uk.companies_house.psc_idv_outstanding_count'],
    compute: (get) => {
      const outstanding = num(get, 'registry.uk.companies_house.psc_idv_outstanding_count');
      return outstanding === null ? null : outstanding === 0;
    },
  },
  {
    key: 'derived.uk.psc_idv_past_due',
    inputs: ['registry.uk.companies_house.psc_idv_next_due'],
    compute: (get, asOf) => {
      const due = get('registry.uk.companies_house.psc_idv_next_due');
      return isIsoDate(due) ? due.slice(0, 10) < asOf : null;
    },
  },
  {
    key: 'derived.uk.ico_current',
    inputs: ['registry.uk.ico.listed', 'registry.uk.ico.expires_on'],
    compute: (get, asOf) => {
      const listed = bool(get, 'registry.uk.ico.listed');
      if (listed === null) return null;
      if (!listed) return false;
      const expires = get('registry.uk.ico.expires_on');
      return isIsoDate(expires) ? expires.slice(0, 10) >= asOf : true;
    },
  },
  {
    key: 'derived.uk.ico_lapsed',
    inputs: ['registry.uk.ico.listed', 'registry.uk.ico.expires_on'],
    compute: (get, asOf) => {
      const listed = bool(get, 'registry.uk.ico.listed');
      if (listed === null) return null;
      const expires = get('registry.uk.ico.expires_on');
      return listed && isIsoDate(expires) ? expires.slice(0, 10) < asOf : false;
    },
  },
  {
    key: 'derived.web.trackers_before_consent',
    inputs: ['web.policy.cookies_before_consent_count', 'web.policy.trackers_before_consent_count'],
    compute: (get) => {
      const cookies = num(get, 'web.policy.cookies_before_consent_count');
      const trackers = num(get, 'web.policy.trackers_before_consent_count');
      if (cookies === null && trackers === null) return null;
      return (cookies ?? 0) + (trackers ?? 0) > 0;
    },
  },
  {
    /**
     * Norway map Section 3: accounts go to Regnskapsregisteret within a month of adoption, so by
     * 31 July for a calendar year. After 31 July the last accounts filed should be for last year;
     * before it, for the year before. Only a hint (a company may not use the calendar year), so
     * the rule reading it never calls false a gap.
     */
    key: 'derived.no.accounts_filed_recently',
    inputs: ['registry.no.brreg.last_accounts_year'],
    compute: (get, asOf) => {
      const raw = get('registry.no.brreg.last_accounts_year');
      const filed = typeof raw === 'number' ? raw : typeof raw === 'string' && /^\d{4}$/.test(raw.trim()) ? Number(raw.trim()) : null;
      if (filed === null) return null;
      const year = Number(asOf.slice(0, 4));
      return filed >= (asOf.slice(5, 10) > '07-31' ? year - 1 : year - 2);
    },
  },
];

export const DERIVED_INPUTS: ReadonlyMap<string, readonly string[]> = new Map(DERIVED_FACTS.map((d) => [d.key, d.inputs]));
export const DERIVED_KEYS: readonly string[] = DERIVED_FACTS.map((d) => d.key);

/** Computes every derived fact. Keys holding null are unknown. */
export function computeDerived(get: Getter, asOf: string): Record<string, FactValue> {
  const out: Record<string, FactValue> = {};
  for (const derived of DERIVED_FACTS) out[derived.key] = derived.compute(get, asOf);
  return out;
}

import { sha256 } from './runtime.js';
import { nameSimilarity } from './text.js';
import type { CompanyRef, Connector, Env, Fact, FactValue, Provenance, SourceResult, SourceStatus } from './types.js';

/**
 * Fixture mode: fictional Kestrel Pay data for development and demos. Everything
 * here is made up. Each result says so in `provenance.fixture` and its message, and
 * its source address is fixture://. It's refused when NODE_ENV=production.
 */

export class FixtureModeRefusedError extends Error {
  override name = 'FixtureModeRefusedError';

  constructor() {
    super('CONNECTOR_MODE=fixture is refused when NODE_ENV=production. Sample data must never reach a real customer.');
  }
}

export function assertFixtureModeAllowed(env: Env): void {
  if (env['NODE_ENV'] === 'production') throw new FixtureModeRefusedError();
}

const SAMPLE_NOTE = 'Sample data for Kestrel Pay, a made-up company. Not a real record.';

type Scenario = 'found' | 'not_found' | 'ambiguous' | 'error' | 'unavailable';

interface FixtureSpec {
  id: string;
  jurisdictions: readonly string[];
  capabilities: Connector['capabilities'];
  factPrefix: string;
  sourceName: string;
  method: Provenance['method'];
  found: Record<string, FactValue>;
  notFound: Record<string, FactValue>;
  /** The outcome this source gives the named Kestrel Pay companies, to match the design's screens. */
  defaults?: Partial<Record<string, Scenario>>;
  /** A backup register, asked only where the country's own register isn't on (see Connector). */
  fallbackRegister?: true;
}

const KESTREL_UK = 'Kestrel Pay UK Ltd';
const KESTREL_NG = 'Kestrel Pay Nigeria Ltd';
/** Made up, and deliberately artificial; it passes the SIREN (Luhn) check. */
export const KESTREL_FR_SIREN = '123456808';
/** Made up; passes the LEI check (ISO 7064 MOD 97-10), and GLEIF had no record of it on 16 Nov 2026. */
export const KESTREL_LEI = '00000KESTRELPAYUK069';
/**
 * Made-up Kestrel Pay numbers for the national registers that need a key. Each passes its
 * country's check (where there is one). How each was chosen not to be a real company (16 Nov 2026):
 * - AU: ABN 99 987 654 320 — ABN Lookup's free public search says "No record found". Its ACN,
 *   987 654 320, is far above the ACNs ASIC has issued so far.
 * - CA: 9876543-2 — Corporations Canada's free public search shows no corporation for it.
 * - DK 31415926, NZ 9429999999996, NL 99912345, IE 999990: the public searches could not be read
 *   by a program (refused, or a page built in the browser), so these are NOT confirmed unused.
 *   They were picked to look artificial, and the NZ and IE ones sit far above the numbers issued so far.
 */
export const KESTREL_NATIONAL_NUMBERS = {
  DK: '31415926', AU_ABN: '99987654320', AU_ACN: '987654320', NZ: '9429999999996', CA: '98765432', NL: '99912345', IE: '999990',
} as const;
/**
 * Made-up Kestrel Pay numbers for the national registers that need no key. Each passes its
 * country's check, and a real lookup on 16 Nov 2026 found nothing for it (Brønnøysund 404, PRH 0
 * results, ARES 404 NENALEZENO, KRS 404 in both registers, ACRA's dataset 0 rows), except CH:
 * Zefix needs credentials we don't have, so CHE-123.456.788 is NOT confirmed unused.
 */
export const KESTREL_KEYLESS_NUMBERS = {
  NO: '812345672', FI: '1234567-1', CZ: '87654326', PL: '0009999999', SG: '202499999K', CH: 'CHE-123.456.788',
} as const;

const SPECS: FixtureSpec[] = [
  {
    id: 'uk.companies_house', jurisdictions: ['GB'], capabilities: ['entity_lookup', 'officers', 'filings'], factPrefix: 'registry.uk.companies_house', sourceName: 'Companies House', method: 'official_live',
    found: {
      found: true, company_number: '14839221', company_name: KESTREL_UK, status: 'active', type: 'ltd', incorporated_on: '2023-04-12', sic_codes: ['62012'],
      registered_office_present: true, registered_office_in_dispute: false, undeliverable_registered_office: false,
      confirmation_next_due: '2026-10-12', confirmation_overdue: true, confirmation_last_made_up_to: '2025-09-28',
      accounts_next_due: '2027-06-30', accounts_overdue: false, accounts_last_type: 'micro-entity',
      officers: ['ADEYEMI, Amara (director)', 'OKAFOR, Tunde (director)'], directors_active_count: 2, directors_idv_on_record_count: 1, directors_idv_outstanding_count: 1, directors_idv_next_due: '2026-11-18',
      psc_active_count: 1, pscs: ['Kestrel Pay Inc.'], psc_idv_outstanding_count: 0, psc_sanctioned: false,
      charges_total_count: 0, charges_outstanding_count: 0, insolvency_case_count: 0,
      incorporation_filing_on_record: true, capital_filing_on_record: true, last_allotment_on: '2025-03-14',
    },
    notFound: { found: false },
  },
  {
    id: 'uk.ico_register', jurisdictions: ['GB'], capabilities: ['dp_registration'], factPrefix: 'registry.uk.ico', sourceName: 'ICO register', method: 'official_list',
    found: { listed: true, z_reference: 'ZA000000', expires_on: '2027-08-09', tier: '1' },
    notFound: { listed: false },
    defaults: { [KESTREL_UK]: 'not_found' },
  },
  {
    id: 'uk.hmrc_vat', jurisdictions: ['GB'], capabilities: ['tax_registration'], factPrefix: 'registry.uk.hmrc_vat', sourceName: 'HMRC', method: 'official_live',
    found: { registered: true, vat_number: '000000000', name: KESTREL_UK },
    notFound: { registered: false },
  },
  {
    id: 'us.uspto', jurisdictions: ['US', 'US-DE'], capabilities: ['trademarks', 'patents'], factPrefix: 'registry.us.uspto', sourceName: 'the USPTO', method: 'official_live',
    found: { trademark_filed: true, trademark_registered: false, trademark_marks: ['KESTREL PAY'], trademark_status: 'live', patent_application_count: 0 },
    notFound: { trademark_filed: false, trademark_registered: false, trademark_marks: [], patent_application_count: 0 },
  },
  {
    id: 'us.sec_form_d', jurisdictions: ['US', 'US-DE'], capabilities: ['fundraising'], factPrefix: 'registry.us.sec_form_d', sourceName: 'SEC EDGAR', method: 'official_live',
    found: { filed: true, filing_count: 1, latest_filed_on: '2025-06-03', total_offering_amount: '1500000', total_amount_sold: '1500000', first_sale_on: '2025-05-20', revenue_range: 'Decline to Disclose' },
    notFound: { filed: false, filing_count: 0 },
  },
  {
    id: 'us.delaware_vendor', jurisdictions: ['US-DE'], capabilities: ['entity_lookup', 'officers'], factPrefix: 'registry.us.delaware_vendor', sourceName: 'our licensed data provider', method: 'licensed_vendor',
    found: { found: true, name: 'Kestrel Pay Inc.', file_number: '7741209', entity_type: 'corporation', formed_on: '2022-08-16', registered_agent_present: true, registered_agent: 'Northwood Agents LLC', other_state_registration_count: 0, officers: ['Amara Adeyemi (CEO)'] },
    notFound: { found: false },
  },
  {
    id: 'ng.cac_vendor', jurisdictions: ['NG'], capabilities: ['entity_lookup', 'officers', 'filings'], factPrefix: 'registry.ng.cac', sourceName: 'CAC, through our licensed data provider', method: 'licensed_vendor',
    found: {
      found: true, name: KESTREL_NG, rc_number: '1849302', status: 'active', type: 'private company limited by shares', incorporated_on: '2021-06-12',
      registered_address_present: true, share_capital_on_record: true, officers: ['Amara Adeyemi (director)', 'Tunde Okafor (director)', 'Kestrel Pay Inc. (person with significant control)'],
      directors_count: 2, shareholders_count: 1, shareholders: ['Kestrel Pay Inc. (shareholder)'], secretary_on_record: false, psc_count: 1, tin_issued: true,
    },
    notFound: { found: false },
  },
  {
    id: 'ng.ndpc_list', jurisdictions: ['NG'], capabilities: ['dp_registration'], factPrefix: 'registry.ng.ndpc', sourceName: 'NDPC', method: 'official_list',
    found: { listed: true, category: 'OHL', year: '2026' },
    notFound: { listed: false },
    defaults: { [KESTREL_NG]: 'not_found' },
  },
  {
    id: 'sanctions.lists', jurisdictions: ['*'], capabilities: ['sanctions'], factPrefix: 'registry.sanctions', sourceName: 'official sanctions', method: 'official_list',
    // On this list, "found" would be bad news, so Kestrel Pay gets a clean result by default.
    found: { match: true, lists_checked: ['OFAC SDN', 'UK Sanctions List', 'UN Consolidated List'] },
    notFound: { match: false, possible_match: false, lists_checked: ['OFAC SDN', 'UK Sanctions List', 'UN Consolidated List'] },
    defaults: { [KESTREL_UK]: 'not_found', [KESTREL_NG]: 'not_found', 'Kestrel Pay Inc.': 'not_found', 'Kestrel Pay SAS': 'not_found' },
  },
  // France: data sources only, no rules. Kestrel Pay SAS and its SIREN are made up: 123456808 is a
  // deliberately artificial number that passes the SIREN check.
  {
    id: 'fr.recherche_entreprises', jurisdictions: ['FR'], capabilities: ['entity_lookup', 'officers'], factPrefix: 'registry.fr.recherche_entreprises', sourceName: 'Annuaire des Entreprises', method: 'official_live',
    found: {
      identified: true, siren: KESTREL_FR_SIREN, registered_name: 'KESTREL PAY', status: 'active', created_on: '2024-02-01', legal_form_code: '5710', naf_code: '62.01Z',
      company_category: 'PME', size_band: '11', hq_postcode: '75002', hq_commune: 'PARIS', establishments_count: 1, establishments_open_count: 1,
      directors_count: 2, directors_entity_count: 1, directors_role_titles: ['Directeur général', 'Président de SAS'], partially_published: false,
    },
    notFound: { identified: null },
  },
  {
    id: 'fr.cnil_dpo', jurisdictions: ['FR'], capabilities: ['dp_registration'], factPrefix: 'registry.fr.cnil_dpo', sourceName: 'CNIL DPO', method: 'official_list',
    found: { listed: true, designated_on: '2024-05-14' },
    notFound: { listed: false },
  },
  // Global sources. KESTREL_LEI is made up: it passes the LEI check and GLEIF had no record of it on 16 Nov 2026.
  {
    id: 'global.gleif', jurisdictions: ['*'], capabilities: ['entity_lookup'], factPrefix: 'registry.global.gleif', sourceName: 'GLEIF', method: 'official_live',
    found: {
      identified: true, lei: KESTREL_LEI, legal_name: 'KESTREL PAY UK LTD', name_matches: true, country_matches: true, registration_status: 'ISSUED', lei_lapsed: false,
      entity_status: 'ACTIVE', entity_category: 'GENERAL', legal_form_code: 'H0PO', legal_jurisdiction: 'GB', legal_address_country: 'GB',
      registration_authority_id: 'RA000585', registered_as: '14839221', next_renewal_on: '2027-04-12', direct_parent_reported: false, ultimate_parent_reported: false,
    },
    notFound: { identified: null },
  },
  {
    id: 'eu.vies_vat', jurisdictions: ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'GB-NIR'],
    capabilities: ['tax_registration'], factPrefix: 'registry.eu.vies_vat', sourceName: 'VIES', method: 'official_live',
    found: { valid: true, request_date: '2026-11-05', name_matches: true },
    notFound: { valid: false, request_date: '2026-11-05' },
  },
  // EU trade marks and the EU prospectus register (18 Nov 2026). The mark and dates are made up.
  {
    id: 'eu.euipo', jurisdictions: ['*'], capabilities: ['trademarks'], factPrefix: 'registry.eu.euipo', sourceName: 'the EUIPO', method: 'official_live',
    found: { numbers_checked: 1, found_count: 1, registered_count: 1, pending_count: 0, dead_count: 0, marks: ['KESTREL PAY'], next_expiry_on: '2034-03-01' },
    notFound: { numbers_checked: 1, found_count: 0 },
  },
  {
    id: 'eu.esma_prospectus', jurisdictions: ['*'], capabilities: ['fundraising'], factPrefix: 'registry.eu.esma_prospectus', sourceName: "ESMA's prospectus register", method: 'official_live',
    found: { documents_found: 1, latest_approval_on: '2026-02-10', first_approval_on: '2026-02-10', approval_countries: ['IE'], document_types: ['STDA'] },
    notFound: { documents_found: 0 },
    defaults: { [KESTREL_UK]: 'not_found', [KESTREL_NG]: 'not_found', 'Kestrel Pay Inc.': 'not_found', 'Kestrel Pay SAS': 'not_found' },
  },
  {
    id: 'global.opencorporates', jurisdictions: ['*'], capabilities: ['entity_lookup', 'officers'], factPrefix: 'registry.global.opencorporates', sourceName: 'OpenCorporates', method: 'licensed_vendor', fallbackRegister: true,
    found: {
      identified: true, company_number: 'KP-000000', registered_name: 'Kestrel Pay AS', jurisdiction_code: 'ke', status: 'Active', inactive: false, incorporated_on: '2024-03-01',
      company_type: 'Private limited company', is_branch: null, officers_count: 2, officers_role_titles: ['director'], source_register: 'Sample register',
    },
    notFound: { identified: null },
  },
  // National registers that need a key (docs/NATIONAL-REGISTERS.md). Every Kestrel Pay number here is
  // made up and passes that country's check; see KESTREL_NATIONAL_NUMBERS for how each was chosen.
  {
    id: 'dk.cvr', jurisdictions: ['DK'], capabilities: ['entity_lookup', 'officers'], factPrefix: 'registry.dk.cvr', sourceName: 'the Danish company register (CVR)', method: 'official_live',
    found: {
      identified: true, cvr_number: KESTREL_NATIONAL_NUMBERS.DK, registered_name: 'Kestrel Pay ApS', legal_form_code: '80', legal_form: 'APS', status: 'normal', founded_on: '2024-03-01',
      industry_code: '620100', postcode: '2100', municipality: 'KØBENHAVN', production_units_count: 1, executive_members_count: 1, board_members_count: 0,
    },
    notFound: { identified: null },
  },
  {
    id: 'au.abr', jurisdictions: ['AU'], capabilities: ['entity_lookup', 'tax_registration'], factPrefix: 'registry.au.abr', sourceName: 'ABN Lookup (Australian Business Register)', method: 'official_live',
    found: {
      identified: true, abn: KESTREL_NATIONAL_NUMBERS.AU_ABN, acn: KESTREL_NATIONAL_NUMBERS.AU_ACN, registered_name: 'KESTREL PAY PTY LTD', abn_status: 'active', abn_status_from: '2024-03-01',
      entity_type_code: 'PRV', entity_type: 'Australian Private Company', gst_registered: true, gst_registered_from: '2024-04-01', state: 'NSW', postcode: '2000',
    },
    notFound: { identified: null },
  },
  {
    id: 'nz.companies', jurisdictions: ['NZ'], capabilities: ['entity_lookup', 'officers', 'filings'], factPrefix: 'registry.nz.companies', sourceName: 'the New Zealand Companies Office (NZBN register)', method: 'official_live',
    found: {
      identified: true, nzbn: KESTREL_NATIONAL_NUMBERS.NZ, company_number: '9999901', registered_name: 'KESTREL PAY LIMITED', status_code: '50', status: 'registered', entity_type_code: 'LTD',
      entity_type: 'NZ Limited Company', incorporated_on: '2024-03-01', annual_return_filing_month: 3, annual_return_last_filed_on: '2026-03-12', directors_count: 2, directors_entity_count: 0,
    },
    notFound: { identified: null },
  },
  {
    // A made-up court code (X9999) and number: no German register court has that code.
    id: 'de.openregister', jurisdictions: ['DE'], capabilities: ['entity_lookup', 'officers'], factPrefix: 'registry.de.openregister', sourceName: 'the German commercial register (Handelsregister, through OpenRegister)', method: 'licensed_vendor',
    found: {
      identified: true, company_id: 'DE-HRB-X9999-999999', registered_name: 'Kestrel Pay GmbH', status: 'active', legal_form: 'gmbh', register_type: 'HRB', register_number: '999999',
      register_court: 'Musterstadt', capital_amount: 25000, capital_currency: 'EUR', city: 'Musterstadt', incorporated_on: '2024-03-01', insolvency_open: false, directors_count: 1, directors_entity_count: 0,
    },
    notFound: { identified: null },
  },
  {
    id: 'ca.corporations', jurisdictions: ['CA'], capabilities: ['entity_lookup', 'officers', 'filings'], factPrefix: 'registry.ca.corporations', sourceName: "Corporations Canada's federal register", method: 'official_live',
    found: {
      identified: true, corporation_number: KESTREL_NATIONAL_NUMBERS.CA, registered_name: 'Kestrel Pay Inc.', status: 'active', act: 'Canada Business Corporations Act', incorporated_on: '2024-03-01',
      last_annual_return_year: 2026, directors_minimum: 1, directors_maximum: 10, directors_count: 2,
    },
    notFound: { identified: null },
  },
  {
    id: 'nl.kvk', jurisdictions: ['NL'], capabilities: ['entity_lookup'], factPrefix: 'registry.nl.kvk', sourceName: 'the Dutch Business Register (KVK)', method: 'official_live',
    found: {
      identified: true, kvk_number: KESTREL_NATIONAL_NUMBERS.NL, registered_name: 'Kestrel Pay B.V.', legal_form: 'Besloten Vennootschap', legal_form_detail: 'Besloten Vennootschap',
      registered_on: '2024-03-01', started_on: '2024-03-01', active: true, sbi_code: '62010', sbi_codes: ['62010'], establishments_count: 1,
    },
    notFound: { identified: null },
  },
  {
    id: 'ie.cro', jurisdictions: ['IE'], capabilities: ['entity_lookup', 'filings'], factPrefix: 'registry.ie.cro', sourceName: 'the Irish Companies Registration Office (CRO)', method: 'official_live',
    found: {
      identified: true, company_number: KESTREL_NATIONAL_NUMBERS.IE, registered_name: 'KESTREL PAY LIMITED', status: 'normal', status_code: '1', status_since: '2024-03-01',
      company_type: 'LTD - Private Company Limited by Shares', company_type_code: '1', registered_on: '2024-03-01', last_annual_return_on: '2026-03-01', next_annual_return_due: '2027-03-01', last_accounts_on: '2025-12-31',
    },
    notFound: { identified: null },
  },
  // National registers that need no key (docs/NATIONAL-REGISTERS.md). Every number is made up,
  // passes its country's check, and was confirmed unused; see KESTREL_KEYLESS_NUMBERS.
  {
    id: 'no.brreg', jurisdictions: ['NO'], capabilities: ['entity_lookup', 'officers'], factPrefix: 'registry.no.brreg', sourceName: 'Brønnøysundregistrene', method: 'official_live',
    found: {
      identified: true, org_number: KESTREL_KEYLESS_NUMBERS.NO, registered_name: 'KESTREL PAY AS', status: 'active', organisation_form_code: 'AS', bankrupt: false, under_liquidation: false,
      under_compulsory_dissolution: false, in_business_register: true, in_vat_register: true, founded_on: '2023-02-14', registered_on: '2023-03-01', nace_code: '62.010', employees_band: '10-49',
      municipality: 'OSLO', municipality_number: '0301', share_capital: 30000, share_capital_currency: 'NOK', part_of_group: false, last_accounts_year: '2025',
      roles_count: 4, roles_entity_count: 1, role_titles: ['Daglig leder', 'Revisor', 'Styremedlem', 'Styrets leder'],
    },
    notFound: { identified: null },
  },
  {
    id: 'fi.prh', jurisdictions: ['FI'], capabilities: ['entity_lookup', 'tax_registration'], factPrefix: 'registry.fi.prh', sourceName: 'the Finnish business register (PRH)', method: 'official_live',
    found: {
      identified: true, business_id: KESTREL_KEYLESS_NUMBERS.FI, registered_name: 'Kestrel Pay Oy', status: 'active', situations: [], company_form_code: 'OY', company_form: 'Limited company',
      registered_on: '2023-05-02', business_id_status: 'valid', trade_register_status: 'registered', in_vat_register: true, in_prepayment_register: true, in_employer_register: false,
      main_industry_code: '62010', main_industry: 'Computer programming activities',
    },
    notFound: { identified: null },
  },
  {
    id: 'cz.ares', jurisdictions: ['CZ'], capabilities: ['entity_lookup'], factPrefix: 'registry.cz.ares', sourceName: 'ARES', method: 'official_live',
    found: {
      identified: true, ico: KESTREL_KEYLESS_NUMBERS.CZ, registered_name: 'Kestrel Pay s.r.o.', status: 'active', legal_form_code: '112', established_on: '2023-04-03', vat_payer: true,
      vat_number_present: true, in_public_register: true, public_register_file: 'C 999999/KSBR', insolvency_record_active: false, region: 'Jihomoravský kraj', nace_codes: ['62', '62010', '63110'],
    },
    notFound: { identified: null },
  },
  {
    id: 'pl.krs', jurisdictions: ['PL'], capabilities: ['entity_lookup', 'officers'], factPrefix: 'registry.pl.krs', sourceName: 'the Polish National Court Register (KRS)', method: 'official_live',
    found: {
      identified: true, krs_number: KESTREL_KEYLESS_NUMBERS.PL, register: 'RejP', registered_name: 'KESTREL PAY SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ', legal_form: 'SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ',
      status: 'registered', registered_on: '2023-03-14', last_entry_on: '2026-10-01', nip_present: true, regon_present: true, seat_voivodeship: 'MAZOWIECKIE', seat_town: 'WARSZAWA',
      main_activity_code: '62.01.Z', share_capital: 5000, share_capital_currency: 'PLN', management_bodies: ['ZARZĄD'], management_members_count: 2, supervisory_bodies: [], supervisory_members_count: 0,
      proxies_count: 0, under_liquidation: false, insolvency_marker: false,
    },
    notFound: { identified: null },
  },
  {
    id: 'sg.acra', jurisdictions: ['SG'], capabilities: ['entity_lookup'], factPrefix: 'registry.sg.acra', sourceName: 'ACRA (data.gov.sg)', method: 'official_live',
    found: {
      identified: true, uen: KESTREL_KEYLESS_NUMBERS.SG, registered_name: 'KESTREL PAY PTE. LTD.', status: 'registered', entity_type: 'Local Company', uen_issued_on: '2024-03-01', issuing_agency: 'ACRA',
    },
    notFound: { identified: null },
  },
  {
    id: 'ch.zefix', jurisdictions: ['CH'], capabilities: ['entity_lookup'], factPrefix: 'registry.ch.zefix', sourceName: 'Zefix', method: 'official_live',
    found: {
      identified: true, uid: KESTREL_KEYLESS_NUMBERS.CH, registered_name: 'Kestrel Pay AG', status: 'active', legal_form_code: '0106', legal_form: 'Ltd', legal_seat: 'Zürich', canton: 'ZH',
      capital_nominal: 100000, capital_currency: 'CHF', auditors_count: 1, branch_offices_count: 0,
    },
    notFound: { identified: null },
  },
  {
    id: 'web.policy_scan', jurisdictions: ['*'], capabilities: ['website'], factPrefix: 'web.policy', sourceName: 'your website', method: 'official_live',
    found: {
      privacy_notice_found: true, privacy_notice_url: 'fixture://kestrelpay.example/privacy', word_count: 1840, last_updated: '2026-03-02', names_company: true,
      rights_section: true, retention_statement: true, transfers_section: true, dpo_contact: false, complaint_route_ico: true, complaint_route_ndpc: false, ccpa_links: false, children_section: false, stale_citation: false,
      cookie_policy_found: true, terms_found: true, refund_policy_found: false, complaints_policy_found: false, acceptable_use_found: false, accessibility_found: false, security_txt_found: false,
      ai_disclosure_found: false, eula_found: false, takedown_policy_found: false, opt_out_link: false, cmp_detected: true, cookies_before_consent_count: 0,
      footer_links_found: true, language: 'en', language_supported: true, dpa_named: true, dpa_countries: ['GB'], legal_notice_present: true, registration_number_shown: true,
    },
    notFound: { privacy_notice_found: false },
  },
];

function scenarioFor(ref: CompanyRef, spec: FixtureSpec): Scenario {
  if (ref.scenario) return ref.scenario;
  const lower = ref.name.toLowerCase();
  if (lower.includes('ghost')) return 'not_found';
  if (lower.includes('twin')) return 'ambiguous';
  if (lower.includes('broken')) return 'error';
  if (lower.includes('offline')) return 'unavailable';
  const known = Object.entries(spec.defaults ?? {}).find(([name]) => nameSimilarity(name, ref.name) === 1)?.[1];
  return known ?? 'found';
}

function toFacts(prefix: string, values: Record<string, FactValue>): Fact[] {
  return Object.entries(values).map(([key, value]) => ({ key: `${prefix}.${key}`, value }));
}

function fixtureConnector(spec: FixtureSpec, env: Env, now: () => Date): Connector {
  return {
    id: spec.id,
    jurisdictions: spec.jurisdictions,
    capabilities: spec.capabilities,
    factPrefix: spec.factPrefix,
    sourceName: spec.sourceName,
    ...(spec.fallbackRegister ? { fallbackRegister: true } : {}),
    async lookup(ref) {
      // Checked on every call too, in case the environment changed after startup.
      assertFixtureModeAllowed({ NODE_ENV: env['NODE_ENV'] ?? process.env['NODE_ENV'] });
      const scenario = scenarioFor(ref, spec);
      const status: SourceStatus = scenario;
      const facts = scenario === 'found' ? toFacts(spec.factPrefix, spec.found)
        : scenario === 'not_found' ? toFacts(spec.factPrefix, spec.notFound)
          : [];
      const result: SourceResult = {
        connector: spec.id,
        status,
        facts,
        provenance: {
          sourceUrl: `fixture://${spec.id}`,
          retrievedAt: now().toISOString(),
          rawHash: sha256(JSON.stringify({ fixture: spec.id, scenario })),
          sourceName: spec.sourceName,
          method: spec.method,
          fixture: true,
        },
        matchConfidence: scenario === 'found' ? 1 : scenario === 'ambiguous' ? 0.5 : 0,
        message: SAMPLE_NOTE,
      };
      if (scenario === 'ambiguous') {
        result.candidates = [{ name: 'Kestrel Pay Holdings Ltd', identifier: 'SAMPLE-1' }, { name: 'Kestrel Payments Ltd', identifier: 'SAMPLE-2' }];
      }
      return result;
    },
  };
}

export function createFixtureConnectors(env: Env, now: () => Date = () => new Date()): Connector[] {
  assertFixtureModeAllowed(env);
  return SPECS.map((spec) => fixtureConnector(spec, env, now));
}

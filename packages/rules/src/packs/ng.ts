import { all, any, atLeast, eq, held, MAPS, no, packBuilder, remind, told, yes } from './helper.js';

const b = packBuilder('NG', MAPS.nigeria, { name: 'Nigeria', version: '0.2.0' });

const CAC = 'registry.ng.cac';
const SITE = yes('derived.has_website_or_app');
const WEB = yes('derived.has_website');
const PD = yes('derived.personal_data');
const STAFF = yes('derived.employees');
const CONTRACTORS = yes('derived.contractors');
const FOREIGN = yes('derived.foreign_any');
const FOREIGN_TECH = yes('derived.foreign_tech');
const CONSUMER = yes('derived.consumer');
const ENTERPRISE = yes('derived.enterprise');
const AI = yes('derived.uses_ai');
const PAYMENTS = yes('derived.sector.payments');
const HEALTH = yes('derived.sector.healthtech');
const TELECOMS = yes('derived.sector.telecoms');
const PLATFORM = yes('derived.sector.platform');

// --- Section 1: CAC --------------------------------------------------------------------------------

b.doc({
  id: 'NG.CORP.NAME_RESERVATION', layer: 1, area: 'formation', stage: 1, title: 'Name reservation approval', sev: 'low', tier: 5, regulator: 'Corporate Affairs Commission', when: no('company.incorporated'),
  src: [['Section 1 —', 'Name availability search and reservation']],
  slot: { id: 'ng_name_reservation', label: 'Name reservation approval', reason: 'Before you incorporate, this shows the name you want is held for you.' },
});
b.rule({
  id: 'NG.CORP.CAC_REGISTRATION', layer: 1, area: 'standing', stage: 2, title: 'CAC registration', sev: 'critical', tier: 2, regulator: 'Corporate Affairs Commission',
  src: [['Section 1 —', 'Company incorporation; Certificate of Incorporation'], ['5. The core set', 'CAC registration active, with directors, shareholders and PSC on record']],
  sat: any(eq(`${CAC}.status`, 'active'), held('ng_certificate_of_incorporation')), evidence: ['CAC record through our licensed data provider', 'Certificate of Incorporation'],
  defect: eq(`${CAC}.status`, 'inactive'),
  slot: { id: 'ng_certificate_of_incorporation', label: 'Certificate of Incorporation', reason: "It's the document that created your company. If our data provider can't find you, it settles the question.", tier: 4 },
  text: [
    "{company} doesn't show as active at the CAC",
    "Our licensed data provider returned {company} as inactive, or couldn't find it, and you haven't uploaded your certificate. A company not filing its annual returns can be marked inactive.",
    'Anyone checking your company, banks and investors included, looks at this status first.',
    'You can run into trouble opening accounts, signing contracts and raising money.',
    'Upload your certificate, and check your annual returns with the CAC. An accredited agent can sort it out.',
  ],
});
b.doc({
  id: 'NG.CORP.MEMART', layer: 1, area: 'governance', stage: 2, title: 'Memorandum and Articles (MEMART)', noun: 'MEMART', sev: 'high', tier: 4, regulator: 'Corporate Affairs Commission',
  src: [['Section 1 —', 'Memorandum and Articles (MEMART)'], ['5. The core set', 'MEMART, statutory registers, board resolutions']],
  slot: { id: 'ng_memart', label: 'Memorandum and Articles (MEMART)', reason: 'These are the rules for how your company is run. A certified copy can be ordered through an accredited agent.', tier: 4 },
});
b.rule({
  id: 'NG.CORP.DIRECTORS', layer: 1, area: 'officers', stage: 2, title: 'Directors on record', sev: 'high', tier: 2, regulator: 'Corporate Affairs Commission',
  src: [['Section 1 —', 'Particulars of directors'], ['5. The core set', 'CAC registration active, with directors, shareholders and PSC on record']],
  sat: atLeast(`${CAC}.directors_count`, 1), evidence: ['CAC record through our licensed data provider'], action: 'file',
  text: [
    "We can't see {company}'s directors at the CAC",
    "Our licensed data provider didn't return any directors for {company}.",
    'Your directors are the people legally responsible for the company, and banks and investors will check them.',
    'Missing details can hold up onboarding and due diligence.',
    'Check your record with the CAC and file any changes.',
  ],
});
b.rule({
  id: 'NG.CORP.SHAREHOLDERS', layer: 1, area: 'shareholders', stage: 2, title: 'Shareholders on record', sev: 'high', tier: 2, regulator: 'Corporate Affairs Commission',
  src: [['Section 1 —', 'Particulars of shareholders'], ['5. The core set', 'CAC registration active, with directors, shareholders and PSC on record']],
  sat: atLeast(`${CAC}.shareholders_count`, 1), evidence: ['CAC record through our licensed data provider'], action: 'file',
  text: [
    "We can't see {company}'s shareholders at the CAC",
    "Our licensed data provider didn't return any shareholders for {company}.",
    'Investors need the CAC record to match your cap table.',
    'A mismatch has to be fixed before a round can close, and that can take time.',
    'Check your record with the CAC and file what is missing.',
  ],
});
b.doc({
  id: 'NG.CORP.SECRETARY', layer: 1, area: 'officers', stage: 2, title: 'Company secretary', sev: 'low', tier: 2, regulator: 'Corporate Affairs Commission', when: no('answers.ng_small_company'),
  sat: any(yes(`${CAC}.secretary_on_record`), held('ng_company_secretary')),
  src: [['Section 1 —', 'Particulars of company secretary'], ['Section 26 —', 'Company Secretary documentation']],
  slot: { id: 'ng_company_secretary', label: 'Company secretary details', reason: 'Small companies are exempt, but others need to appoint one.' },
});
b.rule({
  id: 'NG.CORP.REGISTERED_OFFICE', layer: 1, area: 'filings', stage: 2, title: 'Registered office address', sev: 'medium', tier: 2, regulator: 'Corporate Affairs Commission',
  src: [['Section 1 —', 'Registered office address']],
  sat: yes(`${CAC}.registered_address_present`), evidence: ['CAC record through our licensed data provider'], action: 'file',
  text: [
    "We can't see {company}'s registered address at the CAC",
    "Our licensed data provider didn't return a registered address for {company}.",
    'This is where official post and legal papers go.',
    'You can miss official letters, and it can hold up onboarding.',
    'Check your record with the CAC and update the address.',
  ],
});
b.rule({
  id: 'NG.CORP.SHARE_CAPITAL', layer: 1, area: 'filings', stage: 2, title: 'Statement of share capital', sev: 'medium', tier: 2, regulator: 'Corporate Affairs Commission',
  src: [['Section 1 —', 'Statement of share capital']],
  sat: yes(`${CAC}.share_capital_on_record`), evidence: ['CAC record through our licensed data provider'], action: 'file',
  text: [
    "We can't see {company}'s share capital at the CAC",
    "Our licensed data provider didn't return share capital for {company}.",
    'It needs to match the shares on your cap table.',
    'A mismatch will come up in due diligence.',
    'Check your record with the CAC and file any changes.',
  ],
});
b.doc({
  id: 'NG.CORP.CERTIFIED_DOCS', layer: 1, area: 'formation', stage: 2, title: 'Certified incorporation documents', noun: 'certified incorporation documents', sev: 'low', tier: 4, regulator: 'Corporate Affairs Commission',
  src: [['Section 1 —', 'Certified incorporation documents']],
  slot: { id: 'ng_certified_docs', label: 'Certified incorporation documents', reason: 'Banks and investors often ask for certified copies rather than plain ones.', tier: 4 },
});
b.rule({
  id: 'NG.CORP.PSC', layer: 1, area: 'officers', stage: 2, title: 'People with significant control', sev: 'high', tier: 2, regulator: 'Corporate Affairs Commission',
  src: [['Section 1 —', 'PSC registration and disclosure'], ['5. The core set', 'CAC registration active, with directors, shareholders and PSC on record']],
  sat: atLeast(`${CAC}.psc_count`, 1), evidence: ['CAC record through our licensed data provider'], action: 'file',
  text: [
    "We can't see a person with significant control for {company}",
    "Our licensed data provider didn't return a person with significant control for {company}.",
    'Companies have to disclose who controls them.',
    'Banks and investors will ask, and they can stop until it is on record.',
    'File your person with significant control with the CAC.',
  ],
});
b.doc({
  id: 'NG.CORP.STATUTORY_REGISTERS', layer: 1, area: 'governance', stage: 2, title: 'Statutory registers', noun: 'statutory registers', sev: 'medium', tier: 5,
  src: [['Section 1 —', 'Register of Members'], ['Section 1 —', 'Register of Directors'], ['Section 1 —', 'Register of PSCs'], ['5. The core set', 'MEMART, statutory registers, board resolutions']],
  slot: { id: 'ng_statutory_registers', label: 'Statutory registers', reason: 'Every company keeps these. They are the record of who owns and runs it.' },
});
b.doc({
  id: 'NG.CORP.SHARE_CERTIFICATES', layer: 1, area: 'shareholders', stage: 2, title: 'Share certificates', noun: 'share certificates', sev: 'low', tier: 5,
  src: [['Section 1 —', 'Share certificates']],
  slot: { id: 'ng_share_certificates', label: 'Share certificates', reason: 'They are what shareholders hold to show what they own.' },
});
b.doc({
  id: 'NG.CORP.RESOLUTIONS', layer: 1, area: 'governance', stage: 2, title: 'Board and shareholder resolutions', noun: 'board and shareholder resolutions', sev: 'medium', tier: 5,
  src: [['Section 1 —', 'Board resolutions'], ['Section 26 —', 'Board resolutions; shareholder resolutions'], ['5. The core set', 'MEMART, statutory registers, board resolutions']],
  slot: { id: 'ng_resolutions', label: 'Board and shareholder resolutions', reason: 'These are the record of the big decisions your company has made.' },
});
b.rule({
  id: 'NG.CORP.ANNUAL_RETURNS', layer: 1, area: 'filings', stage: 2, title: 'CAC annual returns', sev: 'high', tier: 4, regulator: 'Corporate Affairs Commission', review: true, penalty: 'moderate',
  src: [['Section 1 —', 'Annual returns'], ['5. The core set', 'CAC standing (annual returns)'], ['6. Thresholds', 'first annual-return due date']],
  rec: { type: 'every_years', from_fact: 'answers.last_annual_return_on', years: 1, monitoring: remind },
  sat: held('ng_cac_status_report'), defect: eq(`${CAC}.status`, 'inactive'), verify: eq(`${CAC}.status`, 'active'),
  evidence: ['CAC status report'], order: 'cac_status_report',
  slot: { id: 'ng_cac_status_report', label: 'CAC status report', reason: "\"Active\" doesn't always mean up to date. Only a status report confirms your annual returns are filed.", tier: 4 },
  text: [
    "We can't confirm {company}'s annual returns are filed",
    'The register shows your company as active, but only a CAC status report confirms your annual returns are filed.',
    'The CAC marks non-filers as inactive, and no public source shows filings by year, so we say "active" and not "filed".',
    "Investors will ask for a status report. If returns are behind, the company can be marked inactive.",
    'Request a status report from the CAC and upload it. If it shows your returns are filed, this clears.',
  ],
});

// --- Sections 2 and 3: tax -------------------------------------------------------------------------

b.rule({
  id: 'NG.TAX.TIN', layer: 3, area: 'tax', stage: 2, title: 'Tax number (TIN)', sev: 'high', tier: 2, regulator: 'Nigeria Revenue Service',
  src: [['Sections 2 and 3', 'Tax Identification Number (TIN)'], ['5. The core set', 'TIN issued']],
  sat: any(yes(`${CAC}.tin_issued`), held('ng_tin_evidence')), evidence: ['TIN lookup through our licensed data provider', 'Tax registration evidence'], action: 'register',
  slot: { id: 'ng_tin_evidence', label: 'TIN evidence', reason: 'If our provider has no record, this shows your tax number.', tier: 4 },
  text: [
    "We can't find a tax number for {company}",
    "Our licensed data provider didn't return a TIN for {company}, and you haven't added one.",
    'Your TIN is issued when you incorporate, and you need it for banking and tax.',
    "You'll run into it the first time a bank, client or investor asks.",
    'Add your TIN evidence, or ask the Nigeria Revenue Service.',
  ],
});
b.doc({
  id: 'NG.TAX.TAXPRO_ACTIVATION', layer: 3, area: 'tax', stage: 2, title: 'Tax registration and activation (TaxPro Max)', noun: 'tax registration evidence', sev: 'medium', tier: 4, regulator: 'Nigeria Revenue Service',
  src: [['Sections 2 and 3', 'Tax registration and activation (TaxPro Max)']],
  slot: { id: 'ng_taxpro', label: 'TaxPro Max registration evidence', reason: 'A TIN alone does not mean the tax account is active.', tier: 4 },
});
b.doc({
  id: 'NG.TAX.CIT', layer: 3, area: 'tax', stage: 2, title: 'Company Income Tax registration', sev: 'medium', tier: 4, regulator: 'Nigeria Revenue Service', review: true,
  src: [['Sections 2 and 3', 'Company Income Tax registration'], ['6. Thresholds', 'small-company reliefs and the VAT registration threshold']],
  slot: { id: 'ng_cit', label: 'Company Income Tax registration', reason: 'Small companies may have reliefs, but registration is still expected.', tier: 4 },
});
b.doc({
  id: 'NG.TAX.VAT', layer: 3, area: 'tax', stage: 2, title: 'VAT registration', sev: 'medium', tier: 4, regulator: 'Nigeria Revenue Service', review: true,
  src: [['Sections 2 and 3', 'VAT registration'], ['6. Thresholds', 'small-company reliefs and the VAT registration threshold']],
  slot: { id: 'ng_vat', label: 'VAT registration', reason: 'A registration threshold applies under the 2025 tax acts.', tier: 4 },
});
b.doc({
  id: 'NG.TAX.PAYE', layer: 3, area: 'employment_tax', stage: 2, title: 'PAYE registration', sev: 'high', tier: 4, regulator: 'State Internal Revenue Service', when: STAFF,
  src: [['Sections 2 and 3', 'PAYE registration (federal and state)'], ['Sections 20–24', 'State IRS PAYE registration']],
  slot: { id: 'ng_paye', label: 'State PAYE registration', reason: 'Employers register with the state where staff work.', tier: 4 },
});
b.doc({
  id: 'NG.TAX.PAYE_RETURNS', layer: 3, area: 'employment_tax', stage: 2, title: 'PAYE returns and remittance receipts', noun: 'PAYE returns and receipts', sev: 'medium', tier: 5, regulator: 'State Internal Revenue Service', when: STAFF,
  src: [['Sections 20–24', 'State IRS PAYE registration; employee tax registration; PAYE returns; remittance receipts']],
  rec: { type: 'periodic', every_months: 1, monitoring: remind },
  slot: { id: 'ng_paye_returns', label: 'PAYE returns and remittance receipts', reason: 'These show you have paid over what you deducted from staff.' },
});
b.rule({
  id: 'NG.TAX.WITHHOLDING', layer: 3, area: 'tax', stage: 3, title: 'Withholding tax', sev: 'medium', tier: 5, regulator: 'Nigeria Revenue Service', when: yes('derived.team_or_contractors'),
  src: [['Sections 2 and 3', 'Withholding tax registration and compliance']],
  sat: told('ng_withholding_tax'), evidence: ['Your confirmation', 'Remittance evidence'], action: 'attest',
  text: [
    "You haven't confirmed {company} handles withholding tax",
    "We don't have your confirmation that you deduct and remit withholding tax when you pay vendors or contractors.",
    'It applies when you pay vendors or contractors.',
    'It often comes up in a tax review or in due diligence, going back several years.',
    'Check with your accountant, then confirm here.',
  ],
});
b.doc({
  id: 'NG.TAX.CLEARANCE', layer: 3, area: 'tax', stage: 3, title: 'Tax Clearance Certificate', sev: 'high', tier: 4, regulator: 'Nigeria Revenue Service', review: true,
  src: [['Sections 2 and 3', 'Tax Clearance Certificate'], ['6. Thresholds', 'whether TCCs can be verified online']],
  rec: { type: 'expiry', fact: 'vault.ng_tcc.expires_on', monitoring: remind },
  slot: { id: 'ng_tcc', label: 'Tax Clearance Certificate', reason: 'Clients, banks and investors often ask for a current one.', tier: 4, expires: true },
});
b.doc({
  id: 'NG.TAX.RETURNS', layer: 3, area: 'tax', stage: 3, title: 'Tax returns and payment receipts', noun: 'tax returns and receipts', sev: 'high', tier: 5, regulator: 'Nigeria Revenue Service',
  src: [['Sections 2 and 3', 'Tax returns; assessment records; payment receipts']],
  slot: { id: 'ng_tax_returns', label: 'Tax returns and payment receipts', reason: 'Investors check these. They show you have filed each year.' },
});

// --- Sections 4, 5, 19: foreign ownership ------------------------------------------------------------

b.doc({
  id: 'NG.FOREIGN.NIPC', layer: 1, area: 'foreign_investment', stage: 2, title: 'NIPC registration', sev: 'high', tier: 4, regulator: 'Nigerian Investment Promotion Commission', when: FOREIGN, review: true,
  src: [['Section 4 —', 'NIPC registration; certificate; application'], ['6. Thresholds', 'NIPC and the Startup Portal']],
  slot: { id: 'ng_nipc', label: 'NIPC certificate', reason: 'Foreign shareholders usually mean registering with the NIPC.', tier: 4 },
});
b.rule({
  id: 'NG.FOREIGN.CCI', layer: 5, area: 'foreign_investment', stage: 2, title: 'Certificate of Capital Importation', sev: 'high', tier: 4, regulator: 'Central Bank of Nigeria', when: FOREIGN,
  src: [['Section 4 —', 'Evidence of foreign investment; Certificate of Capital Importation'], ['Section 6 —', 'Certificate of Capital Importation']],
  sat: held('ng_cci'), evidence: ['Bank-issued Certificate of Capital Importation'],
  slot: { id: 'ng_cci', label: 'Certificate of Capital Importation', reason: 'Your bank issues this when foreign investment comes in. It is the record of that money.', tier: 4 },
  text: [
    "We can't see a Certificate of Capital Importation for {company}",
    "You told us you have foreign investors or directors, and we don't have a Certificate of Capital Importation.",
    'It is the bank-issued record that foreign money came into Nigeria.',
    "Foreign investors will ask for it. It's hard to obtain long after the money came in.",
    'Ask the bank that received the funds to issue it, then upload it here.',
  ],
});
b.doc({
  id: 'NG.FOREIGN.EXPATRIATE_QUOTA', layer: 3, area: 'immigration', stage: 2, title: 'Expatriate Quota approval', sev: 'high', tier: 4, regulator: 'Federal Ministry of Interior', when: yes('derived.foreign_workers'),
  src: [['Section 5 —', 'Expatriate Quota approval; application'], ['Section 4 —', 'Expatriate Quota approval']],
  slot: { id: 'ng_expatriate_quota', label: 'Expatriate Quota approval', reason: 'You need this to employ expatriate staff.', tier: 4 },
});
b.doc({
  id: 'NG.FOREIGN.BUSINESS_PERMIT', layer: 1, area: 'foreign_investment', stage: 2, title: 'Business Permit', sev: 'high', tier: 4, regulator: 'Federal Ministry of Interior', when: yes('answers.foreign_shareholders_or_directors'),
  src: [['Section 5 —', 'Business Permit; application']],
  slot: { id: 'ng_business_permit', label: 'Business Permit', reason: 'Foreign-owned companies need this from the Ministry of Interior.', tier: 4 },
});
b.rule({
  id: 'NG.FOREIGN.IMMIGRATION_DOCS', layer: 3, area: 'immigration', stage: 2, title: 'Expatriate immigration documents', sev: 'high', tier: 5, regulator: 'Nigeria Immigration Service', when: FOREIGN,
  src: [['Section 19 —', 'Business visa; STR visa; CERPAC; residence permit; work authorisation; expatriate immigration documentation'], ['Section 5 —', 'Immigration and employment authorisation documentation']],
  sat: told('ng_immigration_docs_held'), evidence: ['Held or not held, per role'], action: 'attest',
  text: [
    "You haven't confirmed your foreign staff and directors have their documents",
    "You told us you have foreign directors or staff, and we don't have your confirmation that they hold their visas and permits.",
    "These are personal documents, so we only ask whether they're held, not for copies.",
    'Gaps can affect the person concerned and your standing as an employer.',
    'Check each role, then confirm here.',
  ],
});

// --- Section 6: CBN ---------------------------------------------------------------------------------

b.rule({
  id: 'NG.FIN.CBN_LICENCE', layer: 3, area: 'payments', stage: 2, title: 'CBN payments licence', sev: 'critical', tier: 3, regulator: 'Central Bank of Nigeria', when: any(PAYMENTS, yes('derived.payments_via_partner_only')), penalty: 'severe',
  src: [['Section 6 —', 'PSP / PSSP / Switching / MMO / PTSP licences'], ['Section 6 —', '"CBN Fintech licence"']],
  sat: any(held('ng_cbn_licence'), held('ng_licensed_partner_agreement')), evidence: ['CBN licence letter', 'Agreement with a licensed partner'], action: 'register',
  slot: [
    { id: 'ng_cbn_licence', label: 'CBN licence letter', reason: 'Must be held before go-live. There is no single "fintech licence": it depends on what you do.', tier: 4 },
    { id: 'ng_licensed_partner_agreement', label: 'Agreement with your licensed payments partner', reason: 'If a licensed partner moves the money, this shows you are covered. You told us about it, and we need to see it.' },
  ],
  text: [
    "We can't see how {company} is covered to handle payments",
    "We don't have a CBN licence letter or an agreement with a licensed partner. If you use a partner, you've told us, but we haven't seen the agreement.",
    'You must hold the right licence before you go live. There is no single "fintech licence": it depends on what you do.',
    'Operating without cover can stop your business, and investors will not close until it is clear.',
    "Add your licence letter, or your agreement with a licensed partner, so we can confirm you're covered.",
  ],
});
b.doc({
  id: 'NG.FIN.BANKING_LICENCE', layer: 3, area: 'banking', stage: 2, title: 'Microfinance or Payment Service Bank licence', noun: 'bank licence', sev: 'critical', tier: 3, regulator: 'Central Bank of Nigeria', when: yes('derived.sector.banking'), review: true,
  src: [['Section 6 —', 'Microfinance Bank licence; Payment Service Bank licence']],
  slot: { id: 'ng_bank_licence', label: 'Microfinance or Payment Service Bank licence', reason: 'Only applies if the company itself takes deposits or operates as a bank.', tier: 4 },
});
b.doc({
  id: 'NG.FIN.CBN_COMPLIANCE', layer: 3, area: 'payments', stage: 3, title: 'CBN compliance records', noun: 'CBN compliance records', sev: 'high', tier: 5, regulator: 'Central Bank of Nigeria', when: PAYMENTS,
  src: [['Section 6 —', 'CBN-approved compliance documentation']],
  slot: { id: 'ng_cbn_compliance', label: 'CBN compliance records', reason: 'Licensed firms have to keep these up to date.' },
});

// --- Section 7: NDPC --------------------------------------------------------------------------------

b.rule({
  id: 'NG.DP.DCPMI_REGISTRATION', layer: 3, area: 'data_protection', stage: 2, title: 'NDPC registration', sev: 'high', tier: 1, regulator: 'Nigeria Data Protection Commission', when: yes('derived.ng.dcpmi_in_scope'), review: true,
  src: [['Section 7 —', 'Registration as DCPMI'], ['5. The core set', 'NDPC DCPMI registration if above the data-subject threshold'], ['6. Thresholds', 'EHL and UHL thresholds and fees']],
  law: [['Nigeria Data Protection Act 2023'], ['GAID 2025']],
  params: { ohl_from_data_subjects_in_6_months: 200 },
  sat: any(yes('registry.ng.ndpc.listed'), held('ng_ndpc_certificate')), evidence: ['NDPC register', 'NDPC certificate'], action: 'register', order: 'ndpc_registration',
  slot: { id: 'ng_ndpc_certificate', label: 'NDPC registration certificate', reason: 'If you are newly registered and not on the list yet, your certificate shows it.', tier: 4 },
  text: [
    "We can't find {company} on the NDPC's list",
    "We can't find {company} on the Nigeria Data Protection Commission's list. We match on name, so it may be listed differently.",
    'Companies that handle data on 200 or more people in 6 months have to register.',
    'The list is public, so anyone can see you are not on it.',
    "Register with the Commission. Once you're listed, we'll see it here.",
  ],
});
b.rule({
  id: 'NG.DP.DPO', layer: 3, area: 'data_protection', stage: 2, title: 'Data protection officer', sev: 'medium', tier: 5, regulator: 'Nigeria Data Protection Commission', when: all(PD, yes('derived.ng.dcpmi_in_scope')),
  src: [['Section 7 —', 'DPO appointment']], law: [['GAID 2025', 'Art 11(2)']],
  sat: all(told('ng_dpo_appointed'), yes('web.policy.dpo_contact')), evidence: ['Your confirmation', 'DPO contact in your notice'], action: 'attest',
  text: [
    "We can't confirm {company}'s data protection officer",
    "We don't have your confirmation of a data protection officer, or we couldn't find their contact in your notice.",
    'Controllers of major importance need a DPO, and their contact has to be published.',
    'It is one of the first things the Commission looks for.',
    'Appoint a DPO, publish their contact, and confirm here.',
  ],
});
b.doc({
  id: 'NG.AI.DPIA', layer: 6, area: 'data_governance', stage: 2, title: 'Data protection impact assessment', sev: 'high', tier: 5, regulator: 'Nigeria Data Protection Commission', when: all(PD, yes('derived.high_risk_processing')),
  src: [['Section 7 —', '| DPIA |']],
  slot: { id: 'ng_dpia', label: 'Data protection impact assessment', reason: 'High-risk processing, AI and cross-border transfers call for this in writing.' },
});
b.rule({
  id: 'NG.DP.AUDIT_RETURN', layer: 3, area: 'data_protection', stage: 2, title: 'Data protection audit return', sev: 'high', tier: 4, regulator: 'Nigeria Data Protection Commission', when: yes('derived.ng.audit_through_dpco'), penalty: 'moderate',
  src: [['Section 7 —', 'Data Protection Compliance Audit; Audit Report; Compliance Certificate']],
  rec: { type: 'annual_fixed', month: 3, day: 31, monitoring: remind, done_fact: 'answers.ndpc_audit_return_on' },
  sat: held('ng_car_receipt'), evidence: ['Audit return filing receipt'], action: 'file',
  slot: { id: 'ng_car_receipt', label: 'Audit return filing receipt', reason: "The NDPC's published list of audited firms was empty when we checked, so your receipt is the proof.", tier: 4 },
  text: [
    "We can't see {company}'s data protection audit return",
    "You haven't added a filing receipt for your annual audit return.",
    'Larger firms file this through a licensed data protection compliance organisation by 31 March each year.',
    "It's a regular check, and the Commission can see who hasn't filed.",
    'Engage a licensed organisation, file the return, and upload the receipt. The next one is due 31 March.',
  ],
});
b.doc({
  id: 'NG.DP.DPCO', layer: 3, area: 'data_protection', stage: 2, title: 'Licensed data protection compliance organisation', noun: 'DPCO engagement letter', sev: 'medium', tier: 3, regulator: 'Nigeria Data Protection Commission', when: yes('derived.ng.audit_through_dpco'),
  src: [['Section 7 —', 'DPCO engagement']],
  slot: { id: 'ng_dpco', label: 'DPCO engagement letter', reason: 'Give us the name and we can check it against the licensed list.' },
});
b.rule({
  id: 'NG.DP.PRIVACY_POLICY', layer: 3, area: 'data_protection', stage: 2, title: 'Privacy policy', sev: 'high', tier: 1, regulator: 'Nigeria Data Protection Commission', when: SITE,
  src: [['Section 7 —', '| Privacy Policy |'], ['5. The core set', 'Privacy policy and cookie notice compliant with GAID']],
  law: [['Nigeria Data Protection Act 2023', 's27'], ['GAID 2025', 'Art 7']], order: 'privacy_notice',
  sat: yes('web.policy.privacy_notice_found'), defect: yes('web.policy.stale_citation'), evidence: ['Your published privacy policy'], action: 'fix_website',
  text: [
    "{company}'s privacy policy is missing or out of date",
    "We couldn't find a privacy policy on your website, or it cites an old law such as the NDPR.",
    "If you have users, you need to tell them what you do with their data, in plain language.",
    "It's public, so regulators, customers and investors can all see the gap.",
    'Publish a policy written for the Nigeria Data Protection Act and GAID.',
  ],
});
b.doc({
  id: 'NG.DP.PROCESSING_AGREEMENT', layer: 3, area: 'data_protection', stage: 2, title: 'Data processing agreements', noun: 'data processing agreements', sev: 'medium', tier: 5, when: all(PD, yes('derived.has_processors')),
  src: [['Section 7 —', 'Data Processing Agreement']],
  slot: { id: 'ng_dpa', label: 'Data processing agreements', reason: 'If vendors handle personal data for you, this agreement sets the rules.' },
});
b.doc({
  id: 'NG.DP.ROPA', layer: 3, area: 'data_protection', stage: 2, title: 'Records of processing activities', noun: 'records of processing', sev: 'medium', tier: 5, when: PD,
  src: [['Section 7 —', 'Records of Processing Activities']],
  slot: { id: 'ng_ropa', label: 'Records of processing activities', reason: 'It is the list of what personal data you hold and why.' },
});
b.doc({
  id: 'NG.DP.BREACH', layer: 3, area: 'data_protection', stage: 2, title: 'Data breach response policy', sev: 'medium', tier: 5, when: PD,
  src: [['Section 7 —', 'Data breach response policy'], ['Section 7 —', 'Data breach notification documentation']],
  slot: { id: 'ng_breach_policy', label: 'Data breach response policy and records', reason: 'You need to know who does what before something goes wrong.' },
});
b.rule({
  id: 'NG.DP.RIGHTS', layer: 3, area: 'data_protection', stage: 2, title: 'Data subject rights procedures', sev: 'medium', tier: 5, when: PD,
  src: [['Section 7 —', 'Data subject rights procedures']],
  sat: all(told('ng_rights_procedure'), yes('web.policy.rights_section')), evidence: ['Your confirmation', 'Rights section in your policy'], action: 'attest',
  text: [
    "We can't confirm how {company} handles people's data requests",
    "We don't have your confirmation of a process, or your policy doesn't explain people's rights.",
    'People can ask to see or delete their data, and you have to answer them.',
    "When the first request arrives you'll be working it out under a deadline.",
    'Write down your process, explain the rights in your policy, and confirm here.',
  ],
});
b.doc({
  id: 'NG.DP.TRANSFERS', layer: 3, area: 'data_protection', stage: 2, title: 'Cross-border data transfer records', noun: 'cross-border data transfer records', sev: 'medium', tier: 5, when: yes('derived.data_outside_home'),
  src: [['Section 7 —', 'Cross-border data transfer documentation']], law: [['GAID 2025', 'Art 45']],
  slot: { id: 'ng_transfers', label: 'Cross-border data transfer records', reason: 'If your data is hosted outside Nigeria, you need a basis for the transfer.' },
});
b.rule({
  id: 'NG.DP.CONSENT_COOKIES', layer: 3, area: 'cookies', stage: 2, title: 'Cookie consent', sev: 'high', tier: 1, regulator: 'Nigeria Data Protection Commission', when: SITE,
  src: [['Section 7 —', 'Consent records'], ['5. The core set', 'Privacy policy and cookie notice compliant with GAID']],
  law: [['GAID 2025', 'Art 19']],
  sat: no('derived.web.trackers_before_consent'), defect: yes('derived.web.trackers_before_consent'), evidence: ['What your site set before anyone agreed'], action: 'fix_website',
  text: [
    "{company}'s website sets cookies before anyone has agreed",
    'We loaded your site and it set non-essential cookies or loaded trackers before anyone agreed.',
    'GAID expects a clear choice to accept or reject, with the purpose stated.',
    "Anyone can see this from outside, regulators included.",
    'Set up your consent banner to hold those tags back until someone agrees.',
  ],
});
b.rule({
  id: 'NG.DP.COOKIE_POLICY', layer: 3, area: 'cookies', stage: 2, title: 'Cookie policy', sev: 'medium', tier: 1, when: WEB,
  src: [['Section 27 —', 'Cookie Policy'], ['5. The core set', 'Privacy policy and cookie notice compliant with GAID']],
  law: [['GAID 2025', 'Arts 7, 19']],
  sat: yes('web.policy.cookie_policy_found'), evidence: ['Your published cookie policy'], action: 'fix_website',
  text: [
    "We can't find a cookie policy on {company}'s website",
    "We couldn't find a cookie policy on your website.",
    'People should be able to see which cookies you use and why.',
    "It's public, so it's one of the first things someone checks.",
    'Publish a cookie policy and link it from your footer.',
  ],
});
b.rule({
  id: 'NG.DP.RETENTION', layer: 3, area: 'data_protection', stage: 2, title: 'Data retention policy', sev: 'low', tier: 5, when: PD,
  src: [['Section 7 —', 'Data retention policy']],
  sat: all(told('ng_retention_policy'), yes('web.policy.retention_statement')), evidence: ['Your confirmation', 'Retention statement in your policy'], action: 'attest',
  text: [
    "We can't confirm how long {company} keeps people's data",
    "We don't have your confirmation of a retention policy, or your policy doesn't say how long you keep data.",
    "You shouldn't keep personal data for longer than you need it.",
    'The more you keep, the more you have to answer for if something goes wrong.',
    'Set your retention periods, add them to your policy, and confirm here.',
  ],
});
b.doc({
  id: 'NG.DP.TRAINING', layer: 3, area: 'data_protection', stage: 3, title: 'Data protection training records', noun: 'data protection training records', sev: 'low', tier: 5, when: PD,
  src: [['Section 7 —', 'Data protection training records']],
  slot: { id: 'ng_dp_training', label: 'Data protection training records', reason: 'It shows your team knows what to do.' },
});

// --- Sections 8 and 18: NITDA ---------------------------------------------------------------------

b.doc({
  id: 'NG.SECTOR.NITDA_PROVIDER', layer: 3, area: 'government_supply', stage: 3, title: 'NITDA IT service provider registration', noun: 'NITDA registration', sev: 'medium', tier: 4, regulator: 'NITDA', when: yes('derived.gov_supplier'),
  src: [['Sections 8 and 18', 'NITDA IT service provider registration']],
  slot: { id: 'ng_nitda_provider', label: 'NITDA registration', reason: 'You need this to supply IT services to government bodies.', tier: 4 },
});
b.doc({
  id: 'NG.SECTOR.NITDA_CODE', layer: 3, area: 'platform', stage: 3, title: 'NITDA Code of Practice records', noun: 'NITDA Code of Practice records', sev: 'medium', tier: 5, regulator: 'NITDA', when: PLATFORM,
  src: [['Sections 8 and 18', 'NITDA Code of Practice compliance documentation']],
  slot: { id: 'ng_nitda_code', label: 'NITDA Code of Practice records', reason: 'Platforms with user content have duties under the Code.' },
});
b.rule({
  id: 'NG.SECTOR.LOCAL_LIAISON', layer: 3, area: 'platform', stage: 3, title: 'Local liaison appointment', sev: 'medium', tier: 5, regulator: 'NITDA', when: all(PLATFORM, FOREIGN),
  src: [['Sections 8 and 18', 'Local liaison appointment']],
  sat: told('ng_local_liaison'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has a local liaison",
    "You run a platform with foreign links, and we don't have your confirmation of a local liaison.",
    'The Code expects a local point of contact.',
    'Regulators want someone in the country they can reach.',
    'Appoint your liaison, then confirm here.',
  ],
});
b.rule({
  id: 'NG.SECTOR.TAKEDOWN', layer: 3, area: 'platform', stage: 3, title: 'Content moderation and takedown policy', sev: 'medium', tier: 1, regulator: 'NITDA', when: PLATFORM,
  src: [['Sections 8 and 18', 'Content moderation and takedown policy']],
  sat: any(yes('web.policy.takedown_policy_found'), told('ng_takedown_policy')), evidence: ['Published policy', 'Your confirmation'], action: 'fix_website',
  text: [
    "We can't find a takedown policy for {company}",
    "You host user content, and we couldn't find a moderation and takedown policy.",
    'People need a way to report content, and you need a process to deal with it.',
    'Without one, complaints can turn into regulator attention.',
    'Publish a policy and confirm here.',
  ],
});

// --- Sections 9, 10, 11: IP ----------------------------------------------------------------------

b.doc({
  id: 'NG.IP.COPYRIGHT_RECORDS', layer: 2, area: 'copyright', stage: 2, title: 'Copyright ownership records', noun: 'copyright ownership records', sev: 'medium', tier: 5, regulator: 'Nigerian Copyright Commission',
  src: [['Section 9 —', 'Copyright ownership documentation; software copyright records']],
  slot: { id: 'ng_copyright_records', label: 'Copyright ownership records', reason: 'Copyright arises automatically, so records of who made what are your proof.' },
});
b.rule({
  id: 'NG.IP.FOUNDER_ASSIGNMENT', layer: 2, area: 'ip_ownership', stage: 1, title: "Founders' IP assignment", sev: 'critical', tier: 5,
  src: [['Section 25 —', 'IP Assignment Agreement (founders; pre-incorporation IP)'], ['Section 9 —', 'Copyright assignment agreements'], ['5. The core set', "Founders' agreement, founders' IP assignment, NDA template"]],
  law: [['Copyright Act 2022']],
  sat: held('ng_founder_ip_assignment'), evidence: ['Signed IP assignment from each founder'], order: 'ip_assignment',
  slot: { id: 'ng_founder_ip_assignment', label: "Founders' IP assignments", reason: 'This is what makes the company the owner of what founders built, including before incorporation.' },
  text: [
    "Your founders haven't signed their work over to {company}",
    "You don't have a signed IP assignment from each founder.",
    'Without it, the founder may still own the code. Your company may not legally own the technology it is selling.',
    'It will be flagged in your first investor due diligence, and it has to be fixed before any round can close.',
    'Put a short assignment in writing, have each founder sign it, and add it here.',
  ],
});
b.rule({
  id: 'NG.IP.TEAM_ASSIGNMENT', layer: 2, area: 'ip_ownership', stage: 2, title: 'Invention and IP assignment from your team', sev: 'critical', tier: 5, when: yes('derived.team_or_contractors'),
  src: [['Section 25 —', 'Invention Assignment Agreement'], ['Section 25 —', 'Software Development Agreement'], ['Section 9 —', 'Copyright assignment agreements']],
  law: [['Copyright Act 2022']],
  sat: held('ng_team_ip_assignment'), evidence: ['Signed assignment from each employee and contractor'], order: 'ip_assignment',
  slot: { id: 'ng_team_ip_assignment', label: 'IP assignments from employees and contractors', reason: 'Everyone who builds your product should have signed it over to the company. It can be a clause in their contract.' },
  text: [
    "Your team hasn't all signed their work over to {company}",
    "You don't have a signed IP assignment from everyone who has worked on your product.",
    'Without it, the person who did the work may still own it. Your company may not legally own what it is selling.',
    'It will be flagged in your first investor due diligence, and it has to be fixed before any round can close.',
    'Add a standard IP clause to every contract, have everyone sign it, and add the copies here.',
  ],
});
b.doc({
  id: 'NG.IP.TRADEMARK_SEARCH', layer: 2, area: 'trademarks', stage: 2, title: 'Trade mark search report', sev: 'low', tier: 5, regulator: 'Trademarks Registry',
  src: [['Section 10 —', 'Trademark search']],
  slot: { id: 'ng_trademark_search', label: 'Trade mark search report', reason: 'An accredited agent can show whether someone already has a mark close to yours.' },
});
b.rule({
  id: 'NG.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'Nigerian trade mark', sev: 'high', tier: 4, regulator: 'Trademarks Registry',
  src: [['Section 10 —', 'Trademark application'], ['Section 10 —', 'Trademark registration certificate'], ['5. The core set', 'Trademark filed for the brand']],
  sat: held('ng_trademark'), evidence: ['Acknowledgement, acceptance letter or certificate'], action: 'file', order: 'ng_trademark_filing',
  slot: { id: 'ng_trademark', label: 'Trade mark acknowledgement or certificate', reason: "Nigeria has no online trade mark search we can use, so we rely on your document. An accredited agent can confirm it at the registry.", tier: 4 },
  text: [
    "We can't see a Nigerian trade mark for {company}",
    "You haven't added a trade mark application or certificate. Nigeria has no online register we can check, so we need it from you.",
    "Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand later costs far more than a filing today.',
    "File through an accredited agent, or upload what you have.",
  ],
});
b.doc({
  id: 'NG.IP.TRADEMARK_LICENCE', layer: 2, area: 'trademarks', stage: 3, title: 'Trade mark licences', noun: 'trade mark licences', sev: 'low', tier: 5, regulator: 'Trademarks Registry', when: yes(`attest.ng_licenses_marks`),
  src: [['Section 10 —', 'Trademark licence documentation']],
  slot: { id: 'ng_trademark_licence', label: 'Trade mark licences', reason: 'If others use your brand, or you use theirs, there should be a licence.' },
});
b.doc({
  id: 'NG.IP.FOREIGN_TECH_AGREEMENTS', layer: 2, area: 'technology_transfer', stage: 2, title: 'Technology transfer and foreign services agreements', noun: 'technology and foreign services agreements', sev: 'high', tier: 5, regulator: 'NOTAP', when: FOREIGN_TECH,
  src: [['Section 11 —', 'Technology Transfer, Software Licence, Technical Services, Management Services, Royalty agreements'], ['Section 25 —', 'Technology Transfer Agreement']],
  slot: { id: 'ng_foreign_tech_agreements', label: 'Technology transfer and foreign services agreements', reason: 'If you pay a foreign party for technology, these have to be registered with NOTAP.' },
});
b.rule({
  id: 'NG.IP.NOTAP', layer: 2, area: 'technology_transfer', stage: 2, title: 'NOTAP registration', sev: 'high', tier: 4, regulator: 'NOTAP', when: FOREIGN_TECH, penalty: 'moderate',
  src: [['Section 11 —', 'NOTAP registration application; certificate']],
  rec: { type: 'after_event', event_fact: 'answers.foreign_tech_agreement_on', days: 30, monitoring: remind },
  sat: held('ng_notap'), evidence: ['NOTAP certificate'], action: 'register',
  slot: { id: 'ng_notap', label: 'NOTAP certificate', reason: "NOTAP has no public register, so your certificate is the proof. Register within 30 days of the agreement.", tier: 4 },
  text: [
    "We can't see a NOTAP certificate for {company}",
    "You told us you pay a foreign party for technology or services, and you haven't added a NOTAP certificate.",
    'These agreements are registered with NOTAP within 30 days of being signed.',
    'It often comes up when you pay your foreign parent or a foreign supplier, and in due diligence.',
    'Register the agreement with NOTAP and upload the certificate.',
  ],
});

// --- Section 12 to 17: sector regulators -------------------------------------------------------------

b.doc({
  id: 'NG.SECTOR.NCC_LICENCE', layer: 3, area: 'telecoms', stage: 2, title: 'NCC licence', sev: 'critical', tier: 3, regulator: 'Nigerian Communications Commission', when: TELECOMS, review: true,
  src: [['Section 12 —', 'Telecommunications operating licence; ISP; VAS; Unified Access Service'], ['6. Thresholds', 'NCC, NAICOM, NAFDAC, NHIA, MDCN']],
  slot: { id: 'ng_ncc_licence', label: 'NCC licence', reason: 'Telecoms, internet and value-added services need this.', tier: 4 },
});
b.doc({
  id: 'NG.SECTOR.NCC_APPROVALS', layer: 3, area: 'telecoms', stage: 3, title: 'NCC infrastructure sharing and spectrum approvals', noun: 'NCC approvals', sev: 'high', tier: 4, regulator: 'Nigerian Communications Commission', when: TELECOMS,
  src: [['Section 12 —', 'Infrastructure sharing approval; spectrum licence']],
  slot: { id: 'ng_ncc_approvals', label: 'NCC approvals', reason: 'Only applies if you share infrastructure or use spectrum.', tier: 4 },
});
b.doc({
  id: 'NG.SECTOR.SEC_DIGITAL_ASSETS', layer: 3, area: 'crypto', stage: 2, title: 'SEC digital asset licence', noun: 'SEC digital asset licence', sev: 'critical', tier: 3, regulator: 'Securities and Exchange Commission (Nigeria)', when: yes('derived.sector.crypto'),
  src: [['Section 13 —', 'Digital Asset Operator, Exchange, Custodian licences; issuance approval; registration']],
  slot: { id: 'ng_sec_digital_assets', label: 'SEC digital asset licence', reason: 'Crypto businesses need this. The SEC publishes registered operators.', tier: 4 },
});
b.doc({
  id: 'NG.SECTOR.SEC_INVESTMENT', layer: 3, area: 'securities', stage: 2, title: 'SEC capital market or crowdfunding registration', noun: 'SEC registration', sev: 'critical', tier: 3, regulator: 'Securities and Exchange Commission (Nigeria)', when: yes('derived.sector.securities'),
  src: [['Section 13 —', 'Capital Market Operator; Investment Adviser registration'], ['Section 13 —', 'Crowdfunding Intermediary registration']],
  slot: { id: 'ng_sec_investment', label: 'SEC registration', reason: 'Investment and crowdfunding businesses need this. The SEC publishes registered operators.', tier: 4 },
});
b.doc({
  id: 'NG.SECTOR.FCCPC_LENDING', layer: 3, area: 'lending', stage: 2, title: 'FCCPC digital lending approval', noun: 'FCCPC lending approval', sev: 'critical', tier: 3, regulator: 'FCCPC', when: yes('derived.sector.lending'), penalty: 'severe',
  src: [['Section 14 —', 'Digital lending registration; approval']],
  slot: { id: 'ng_fccpc', label: 'FCCPC lending approval', reason: 'Digital lenders need this before they launch. The FCCPC publishes who is approved, on a watch list or delisted.', tier: 4 },
});
b.doc({
  id: 'NG.CONSUMER.COMPLIANCE', layer: 4, area: 'consumer_protection', stage: 3, title: 'Consumer protection records', noun: 'consumer protection records', sev: 'medium', tier: 5, regulator: 'FCCPC', when: CONSUMER,
  src: [['Section 14 —', 'Consumer protection compliance documentation'], ['Section 14 —', 'Product and service disclosure documentation']],
  slot: { id: 'ng_consumer_records', label: 'Consumer protection and product disclosure records', reason: 'If you sell to consumers, you should be able to show what you told them.' },
});
b.rule({
  id: 'NG.CONSUMER.COMPLAINTS', layer: 4, area: 'consumer_terms', stage: 3, title: 'Consumer complaints policy', sev: 'medium', tier: 1, regulator: 'FCCPC', when: CONSUMER,
  src: [['Section 14 —', 'Consumer complaints handling policy']],
  sat: any(yes('web.policy.complaints_policy_found'), told('ng_complaints_policy')), evidence: ['Published policy', 'Your confirmation'], action: 'fix_website',
  text: [
    "We can't find a complaints policy for {company}",
    "We couldn't find a complaints policy on your website.",
    'Consumers need to know how to complain.',
    'Without one, complaints tend to go straight to the regulator.',
    'Publish the policy and link it from your site footer.',
  ],
});
b.rule({
  id: 'NG.CONSUMER.REFUNDS', layer: 4, area: 'consumer_terms', stage: 3, title: 'Refund and cancellation policy', sev: 'medium', tier: 1, regulator: 'FCCPC', when: CONSUMER,
  src: [['Section 14 —', 'Refund and cancellation policy']],
  sat: yes('web.policy.refund_policy_found'), evidence: ['Published policy'], action: 'fix_website',
  text: [
    "We can't find a refund and cancellation policy for {company}",
    "We couldn't find a refund and cancellation policy on your website.",
    'Consumers need to know how to get their money back.',
    'Disputes get harder to settle without one.',
    'Publish the policy and link it from your site footer.',
  ],
});
b.doc({
  id: 'NG.SECTOR.NAICOM_LICENCE', layer: 3, area: 'insurtech', stage: 2, title: 'Insurance broker or agent licence', noun: 'NAICOM licence', sev: 'critical', tier: 3, regulator: 'NAICOM', when: yes('derived.sector.insurtech'), review: true,
  src: [['Section 15 —', 'Insurance Broker licence; Insurance Agent registration'], ['6. Thresholds', 'NCC, NAICOM, NAFDAC, NHIA, MDCN']],
  slot: { id: 'ng_naicom', label: 'NAICOM licence', reason: 'Selling or arranging insurance needs this.', tier: 4 },
});
b.doc({
  id: 'NG.SECTOR.INSURTECH_APPROVAL', layer: 3, area: 'insurtech', stage: 2, title: 'Insurtech and partnership approval', noun: 'insurtech approval', sev: 'high', tier: 4, regulator: 'NAICOM', when: yes('derived.sector.insurtech'),
  src: [['Section 15 —', 'Insurtech approval; partnership approval']],
  slot: { id: 'ng_insurtech_approval', label: 'Insurtech and partnership approval', reason: 'These show your insurance arrangements have been approved.', tier: 4 },
});
b.doc({
  id: 'NG.HEALTH.NAFDAC_PRODUCT', layer: 3, area: 'healthtech', stage: 3, title: 'NAFDAC product registration', noun: 'NAFDAC product registration', sev: 'critical', tier: 3, regulator: 'NAFDAC', when: HEALTH, review: true,
  src: [['Section 16 —', 'Product registration; approval'], ['6. Thresholds', 'NCC, NAICOM, NAFDAC, NHIA, MDCN']],
  slot: { id: 'ng_nafdac_product', label: 'NAFDAC product registration', reason: 'Regulated health products need this.', tier: 4 },
});
b.doc({
  id: 'NG.HEALTH.NAFDAC_ESTABLISHMENT', layer: 3, area: 'healthtech', stage: 2, title: 'NAFDAC establishment registration', noun: 'NAFDAC establishment registration', sev: 'high', tier: 4, regulator: 'NAFDAC', when: HEALTH,
  src: [['Section 16 —', 'Establishment registration']],
  slot: { id: 'ng_nafdac_establishment', label: 'NAFDAC establishment registration', reason: 'Health businesses dealing in regulated products need this.', tier: 4 },
});
b.doc({
  id: 'NG.HEALTH.DEVICE_APPROVAL', layer: 3, area: 'healthtech', stage: 3, title: 'Software or medical device approval', noun: 'device approval', sev: 'critical', tier: 4, regulator: 'NAFDAC', when: HEALTH,
  src: [['Section 16 —', 'Software or medical device approvals']],
  slot: { id: 'ng_device_approval', label: 'Software or medical device approval', reason: 'Software that works as a medical device needs approval.', tier: 4 },
});
b.doc({
  id: 'NG.HEALTH.MDCN', layer: 3, area: 'healthtech', stage: 2, title: 'MDCN registration or approvals', noun: 'MDCN approval', sev: 'high', tier: 4, regulator: 'Medical and Dental Council of Nigeria', when: HEALTH, review: true,
  src: [['Section 17 —', 'MDCN registration or approvals'], ['6. Thresholds', 'NCC, NAICOM, NAFDAC, NHIA, MDCN']],
  slot: { id: 'ng_mdcn', label: 'MDCN approval', reason: 'Clinical services need this.', tier: 4 },
});
b.doc({
  id: 'NG.HEALTH.NHIA', layer: 3, area: 'healthtech', stage: 2, title: 'NHIA registration or approvals', noun: 'NHIA approval', sev: 'high', tier: 4, regulator: 'National Health Insurance Authority', when: HEALTH, review: true,
  src: [['Section 17 —', 'NHIA registration or approvals'], ['6. Thresholds', 'NCC, NAICOM, NAFDAC, NHIA, MDCN']],
  slot: { id: 'ng_nhia', label: 'NHIA approval', reason: 'Health insurance businesses need this.', tier: 4 },
});
b.doc({
  id: 'NG.HEALTH.FACILITY', layer: 3, area: 'healthtech', stage: 2, title: 'Health facility registration', sev: 'medium', tier: 4, regulator: 'State health regulators', when: HEALTH,
  src: [['Section 17 —', 'Health facility registration']],
  slot: { id: 'ng_health_facility', label: 'Health facility registration', reason: 'Only applies if you run a health facility.', tier: 4 },
});

// --- Sections 20 to 24: employer schemes ----------------------------------------------------------------

b.rule({
  id: 'NG.EMP.NSITF', layer: 3, area: 'employment', stage: 2, title: 'NSITF Employee Compensation Scheme', sev: 'high', tier: 4, regulator: 'NSITF', when: STAFF, review: true,
  src: [['Sections 20–24', 'NSITF employer registration; Employee Compensation Scheme registration'], ['6. Thresholds', 'NSITF and NHF: any online compliance verification']],
  sat: held('ng_nsitf'), evidence: ['ECS compliance certificate'], action: 'register',
  slot: { id: 'ng_nsitf', label: 'NSITF compliance certificate', reason: 'From your first employee, you register for the Employee Compensation Scheme.', tier: 4, expires: true },
  text: [
    "We can't see {company}'s NSITF certificate",
    "You have employees, and you haven't added your NSITF compliance certificate.",
    'Employers register for the Employee Compensation Scheme from their first employee.',
    'Government clients and bigger customers often ask to see this certificate.',
    'Register with NSITF and upload your certificate.',
  ],
});
b.doc({
  id: 'NG.EMP.PENCOM', layer: 3, area: 'employment', stage: 2, title: 'Pension Clearance Certificate', sev: 'high', tier: 4, regulator: 'PenCom', when: STAFF, review: true,
  src: [['Sections 20–24', 'PenCom pension registration; PFA engagement'], ['6. Thresholds', 'PenCom and ITF: statutory headcount']],
  slot: { id: 'ng_pencom', label: 'Pension Clearance Certificate', reason: 'A headcount threshold applies, and this certificate is the usual proof.', tier: 4, expires: true },
});
b.doc({
  id: 'NG.EMP.ITF', layer: 3, area: 'employment', stage: 2, title: 'ITF compliance certificate', sev: 'medium', tier: 4, regulator: 'Industrial Training Fund', when: STAFF, review: true,
  src: [['Sections 20–24', 'ITF employer registration; compliance documentation; contribution records'], ['6. Thresholds', 'PenCom and ITF: statutory headcount']],
  slot: { id: 'ng_itf', label: 'ITF compliance certificate', reason: 'A headcount or turnover threshold applies.', tier: 4, expires: true },
});
b.doc({
  id: 'NG.EMP.NHF', layer: 3, area: 'employment', stage: 2, title: 'NHF compliance certificate', sev: 'medium', tier: 4, regulator: 'National Housing Fund', when: STAFF, review: true,
  src: [['Sections 20–24', 'NHF registration; contribution records; employer compliance documentation'], ['6. Thresholds', 'NSITF and NHF: any online compliance verification']],
  slot: { id: 'ng_nhf', label: 'NHF compliance certificate', reason: 'Employers register for the National Housing Fund.', tier: 4, expires: true },
});

// --- Sections 25 and 26: agreements --------------------------------------------------------------------

b.doc({
  id: 'NG.CORP.FOUNDERS_AGREEMENT', layer: 1, area: 'founders', stage: 1, title: "Founders' agreement", sev: 'high', tier: 5,
  src: [['Section 25 —', "Founders' Agreement"], ['5. The core set', "Founders' agreement, founders' IP assignment, NDA template"]],
  slot: { id: 'ng_founders_agreement', label: "Founders' agreement", reason: 'It settles who owns what and what happens if a founder leaves.' },
});
b.doc({
  id: 'NG.EQUITY.SHAREHOLDERS_AGREEMENT', layer: 5, area: 'shareholders', stage: 2, title: "Shareholders' agreement", sev: 'medium', tier: 5,
  src: [['Section 25 —', "Shareholders' Agreement"]],
  slot: { id: 'ng_shareholders_agreement', label: "Shareholders' agreement", reason: 'It sets out what happens when a shareholder leaves or wants to sell.' },
});
b.doc({
  id: 'NG.EQUITY.VESTING', layer: 5, area: 'founder_equity', stage: 1, title: "Founders' vesting agreement", sev: 'medium', tier: 5,
  src: [['Section 25 —', "Founders' Vesting Agreement"]],
  slot: { id: 'ng_vesting', label: "Founders' vesting agreement", reason: 'Investors want to know a founder who leaves early does not keep all their shares.' },
});
b.doc({
  id: 'NG.EQUITY.ALLOTMENTS', layer: 5, area: 'cap_table', stage: 2, title: 'Share allotment records', noun: 'share allotment records', sev: 'medium', tier: 2,
  src: [['Section 26 —', 'Share allotment documentation']],
  slot: { id: 'ng_allotments', label: 'Share allotment records', reason: 'These should match what the CAC shows, and investors will compare the two.' },
});
b.doc({
  id: 'NG.IP.SOFTWARE_LICENCE', layer: 2, area: 'ip_ownership', stage: 3, title: 'Software licence agreements', noun: 'software licence agreements', sev: 'medium', tier: 5,
  src: [['Section 25 —', 'Software Licence Agreement']],
  slot: { id: 'ng_software_licence', label: 'Software licence agreements', reason: 'Investors want to see what you license in and out.' },
});
b.doc({
  id: 'NG.IP.SOURCE_CODE_LICENCE', layer: 2, area: 'enterprise', stage: 3, title: 'Source code licence agreement', sev: 'low', tier: 5, when: ENTERPRISE,
  src: [['Section 25 —', 'Source Code Licence Agreement']],
  slot: { id: 'ng_source_code_licence', label: 'Source code licence agreement', reason: 'Enterprise customers sometimes need rights to your source code.' },
});
b.doc({
  id: 'NG.IP.ESCROW', layer: 2, area: 'enterprise', stage: 5, title: 'Source code escrow agreement', sev: 'low', tier: 5, when: all(ENTERPRISE, yes('answers.enterprise_demands_escrow')),
  src: [['Section 25 —', 'Source Code Escrow Agreement']],
  slot: { id: 'ng_escrow', label: 'Source code escrow agreement', reason: 'Some enterprise customers ask for this.' },
});
b.doc({
  id: 'NG.IP.NDA', layer: 2, area: 'confidentiality', stage: 1, title: 'NDA template', sev: 'medium', tier: 5,
  src: [['Section 25 —', 'Non-Disclosure Agreement'], ['5. The core set', "Founders' agreement, founders' IP assignment, NDA template"]],
  slot: { id: 'ng_nda', label: 'NDA template', reason: 'You need one before you share anything sensitive with partners, investors or hires.' },
});
b.doc({
  id: 'NG.COM.SAAS', layer: 4, area: 'contracts', stage: 3, title: 'SaaS agreement', sev: 'medium', tier: 5, when: yes('derived.takes_payments'),
  src: [['Section 25 —', 'SaaS Agreement']],
  slot: { id: 'ng_saas', label: 'SaaS agreement', reason: 'It is the contract your customers sign, so investors read it.' },
});
b.doc({
  id: 'NG.COM.API_LICENCE', layer: 4, area: 'terms', stage: 3, title: 'API licence agreement', sev: 'medium', tier: 5, when: yes('derived.has_api'),
  src: [['Section 25 —', 'API Licence Agreement']],
  slot: { id: 'ng_api_licence', label: 'API licence agreement', reason: 'If others build on your API, this sets the rules.' },
});
b.doc({
  id: 'NG.EMP.CONTRACTOR_AGREEMENTS', layer: 4, area: 'employment_contracts', stage: 2, title: 'Contractor agreements', noun: 'contractor agreements', sev: 'high', tier: 5, when: CONTRACTORS,
  src: [['Section 25 —', 'Contractor Agreement']],
  slot: { id: 'ng_contractor_agreements', label: 'Contractor agreements', reason: 'Each should cover classification, IP and payment terms.' },
});
b.doc({
  id: 'NG.EMP.AGREEMENTS', layer: 4, area: 'employment_contracts', stage: 2, title: 'Employment agreements', noun: 'employment agreements', sev: 'high', tier: 5, when: STAFF,
  src: [['Section 25 —', 'Employment Agreement']],
  slot: { id: 'ng_employment_agreements', label: 'Employment agreements', reason: 'Each employee should have one, with an IP clause.' },
});
b.doc({
  id: 'NG.EMP.HANDBOOK', layer: 4, area: 'employment_contracts', stage: 5, title: 'Staff handbook', sev: 'low', tier: 5, when: STAFF,
  src: [['Section 26 —', 'Staff handbook']],
  slot: { id: 'ng_handbook', label: 'Staff handbook', reason: 'As you grow, it keeps your policies in one place.' },
});
b.doc({
  id: 'NG.CORP.GOVERNANCE_POLICY', layer: 1, area: 'governance', stage: 5, title: 'Corporate governance policy', sev: 'low', tier: 5,
  src: [['Section 26 —', 'Corporate governance policy']],
  slot: { id: 'ng_governance_policy', label: 'Corporate governance policy', reason: 'As you scale, this shows how decisions get made.' },
});
b.doc({
  id: 'NG.CORP.DELEGATION', layer: 1, area: 'governance', stage: 5, title: 'Delegation of authority', sev: 'low', tier: 5,
  src: [['Section 26 —', 'Delegation of Authority']], noun: 'delegation of authority',
  slot: { id: 'ng_delegation', label: 'Delegation of authority', reason: 'It says who can sign and approve what.' },
});
b.doc({
  id: 'NG.CORP.CONFLICTS', layer: 1, area: 'governance', stage: 4, title: 'Conflict of interest policy', sev: 'low', tier: 5,
  src: [['Section 26 —', 'Conflict of Interest Policy']],
  slot: { id: 'ng_conflicts', label: 'Conflict of interest policy', reason: 'Investors ask for this when they raise.' },
});
b.doc({
  id: 'NG.CORP.DIRECTOR_SERVICE', layer: 1, area: 'governance', stage: 5, title: "Directors' service agreements", noun: "directors' service agreements", sev: 'low', tier: 5,
  src: [['Section 26 —', "Directors' service agreements"]],
  slot: { id: 'ng_director_service', label: "Directors' service agreements", reason: 'As the board grows, these set out what each director is there to do.' },
});

// --- Section 27: website and AI documents -----------------------------------------------------------------

b.rule({
  id: 'NG.COM.TERMS', layer: 4, area: 'terms', stage: 3, title: 'Terms of service', sev: 'high', tier: 1, when: SITE,
  src: [['Section 27 —', 'Terms of Service']],
  sat: yes('web.policy.terms_found'), evidence: ['Published terms'], action: 'fix_website', order: 'terms_of_service',
  text: [
    "We can't find terms of service on {company}'s website",
    "We couldn't find published terms of service.",
    'Your terms set the limits of what you owe your customers.',
    "Customers and investors will ask for them, and it's public, so it's easy to spot.",
    'Publish your terms and link them from your site footer.',
  ],
});
b.rule({
  id: 'NG.COM.EULA', layer: 4, area: 'terms', stage: 3, title: 'End user licence agreement', sev: 'medium', tier: 1, when: yes('derived.has_app'),
  src: [['Section 27 —', 'End User Licence Agreement']],
  sat: yes('web.policy.eula_found'), evidence: ['Published EULA or App Store listing'], action: 'fix_website',
  text: [
    "We can't find an end user licence for {company}'s app",
    "You told us you have an app, and we couldn't find a published licence for it.",
    'It sets the terms on which people can use your app.',
    'App stores and larger customers can ask for it.',
    'Publish your licence and link it from your site and your App Store listing.',
  ],
});
b.rule({
  id: 'NG.COM.ACCEPTABLE_USE', layer: 4, area: 'terms', stage: 3, title: 'Acceptable use policy', sev: 'low', tier: 1, when: SITE,
  src: [['Section 27 —', 'Acceptable Use Policy']],
  sat: yes('web.policy.acceptable_use_found'), evidence: ['Published policy'], action: 'fix_website',
  text: [
    "We can't find an acceptable use policy on {company}'s website",
    "We couldn't find a published acceptable use policy.",
    'It says what users can and cannot do with your product.',
    'Without it, it is harder to act when someone misuses your service.',
    'Publish a short policy and link it from your terms.',
  ],
});
b.doc({
  id: 'NG.AI.USE_POLICY', layer: 6, area: 'ai_governance', stage: 2, title: 'AI use policy', sev: 'medium', tier: 5, when: yes('derived.ai_or_staff_ai'),
  src: [['Section 27 —', 'AI Use Policy (internal)']],
  slot: { id: 'ng_ai_use_policy', label: 'AI use policy', reason: 'It tells your team what they can and cannot put into AI tools.' },
});
b.doc({
  id: 'NG.AI.GOVERNANCE', layer: 6, area: 'ai_governance', stage: 5, title: 'AI governance policy', sev: 'medium', tier: 5, when: AI,
  src: [['Section 27 —', 'AI Governance Policy']],
  slot: { id: 'ng_ai_governance', label: 'AI governance policy', reason: 'As you scale, this shows who is responsible for your AI decisions.' },
});
b.rule({
  id: 'NG.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI transparency', sev: 'medium', tier: 1, when: AI,
  src: [['Section 27 —', 'AI Transparency and Disclosure Documentation']],
  sat: any(yes('web.policy.ai_disclosure_found'), held('ng_ai_transparency')), evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'ng_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI.' },
  text: [
    "We can't find AI disclosures for {company}",
    "You told us you use AI, and we couldn't find anything on your website that tells users about it.",
    'People should know when and how AI is being used in your product.',
    'Enterprise customers and investors are starting to ask for this.',
    'Add a short AI section to your site, or add the record here.',
  ],
});

// --- Sections 27 and 28: security ------------------------------------------------------------------------

b.doc({
  id: 'NG.SEC.POLICIES', layer: 3, area: 'security', stage: 3, title: 'Information security and cybersecurity policies', noun: 'security policies', sev: 'medium', tier: 5,
  src: [['Section 27 —', 'Information Security Policy'], ['Section 27 —', 'Cybersecurity Policy'], ['Section 28 —', 'Cybersecurity compliance documentation; Cybercrime compliance documentation']],
  slot: { id: 'ng_security_policies', label: 'Information security and cybersecurity policies', reason: 'Enterprise customers and investors expect these in writing.' },
});
b.doc({
  id: 'NG.SEC.INCIDENT_RESPONSE', layer: 3, area: 'security', stage: 3, title: 'Incident response policy', sev: 'high', tier: 5,
  src: [['Section 27 —', 'Incident Response Policy']],
  slot: { id: 'ng_incident_response', label: 'Incident response policy', reason: 'You need to know who does what before something goes wrong.' },
});
b.doc({
  id: 'NG.SEC.INCIDENT_REPORTING', layer: 3, area: 'security', stage: 3, title: 'Cyber incident reporting procedures', noun: 'incident reporting procedures', sev: 'medium', tier: 5, review: true,
  src: [['Section 28 —', 'Cybersecurity incident reporting procedures'], ['6. Thresholds', 'incident-reporting duty']],
  slot: { id: 'ng_incident_reporting', label: 'Cyber incident reporting procedures', reason: "There's a duty to report incidents to the national CERT." },
});
b.doc({
  id: 'NG.SEC.RISK_ASSESSMENT', layer: 3, area: 'security', stage: 3, title: 'Cybersecurity risk assessment and audit records', noun: 'cybersecurity risk assessment', sev: 'medium', tier: 5,
  src: [['Section 28 —', 'Cybersecurity risk assessment; information security audit documentation; vulnerability management policy']],
  slot: { id: 'ng_cyber_risk', label: 'Cybersecurity risk assessment and audit records', reason: 'It shows you know where your weak spots are.' },
});
b.doc({
  id: 'NG.SEC.PEN_TESTS', layer: 3, area: 'security', stage: 4, title: 'Penetration test records', noun: 'penetration test records', sev: 'medium', tier: 5, raising: true,
  src: [['Section 28 —', 'Penetration testing documentation']],
  slot: { id: 'ng_pen_tests', label: 'Penetration test records', reason: 'Investors and enterprise customers expect to see these.' },
});
b.doc({
  id: 'NG.SEC.INCIDENT_REGISTER', layer: 3, area: 'security', stage: 3, title: 'Security incident register', sev: 'low', tier: 5,
  src: [['Section 28 —', 'Security incident register']],
  slot: { id: 'ng_incident_register', label: 'Security incident register', reason: 'A simple log of what happened and what you did about it.' },
});
b.doc({
  id: 'NG.SEC.CONTINUITY', layer: 3, area: 'security', stage: 5, title: 'Business continuity and disaster recovery plans', noun: 'continuity and disaster recovery plans', sev: 'low', tier: 5,
  src: [['Section 27 —', 'Business Continuity Plan; Disaster Recovery Plan']],
  slot: { id: 'ng_continuity', label: 'Business continuity and disaster recovery plans', reason: 'Larger customers ask what happens if your systems go down.' },
});
b.rule({
  id: 'NG.SEC.CYBERCRIMES_LEVY', layer: 3, area: 'security', stage: 3, title: 'Cybercrimes Act levy', sev: 'medium', tier: 5, when: yes('derived.sector.ng_levy'), review: true,
  src: [['Section 28 —', 'Cybercrimes Act levy compliance'], ['6. Thresholds', 'the schedule of businesses subject to the levy']],
  sat: told('ng_cybercrimes_levy'), evidence: ['Your confirmation', 'Remittance evidence'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s Cybercrimes Act levy position",
    "We don't have your confirmation on the levy, and your sector may be named in the Act's schedule.",
    'Businesses named in the schedule remit a levy.',
    'It tends to come up with your bank or partners.',
    'Check whether it applies with your accountant, then confirm here.',
  ],
});

export const ng = b.build();

import { all, any, auto, atLeast, eq, held, MAPS, no, not, packBuilder, remind, told, yes, zero } from './helper.js';

const b = packBuilder('GB', MAPS.uk, { name: 'United Kingdom', version: '0.3.0' });

const CH = 'registry.uk.companies_house';
const SITE = yes('derived.has_website_or_app');
const WEB = yes('derived.has_website');
const PD = yes('derived.personal_data');
const STAFF = yes('derived.employees');
const CONTRACTORS = yes('derived.contractors');
const CONSUMER = yes('derived.consumer');
const ENTERPRISE = yes('derived.enterprise');
const AI = yes('derived.uses_ai');
const FIN = yes('derived.sector.uk_financial');
const TELECOMS = yes('derived.sector.telecoms');
const HEALTH = yes('derived.sector.healthtech');
const PREMISES = yes('derived.premises');
const EXPORTS = yes('derived.exports');
const CHECK_CH = 'Companies House';

// --- Section 1: Companies House ------------------------------------------------------------------

b.rule({
  id: 'GB.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company status', sev: 'critical', tier: 1, regulator: CHECK_CH,
  src: [['Section 1 —', 'Incorporation application; Certificate of Incorporation; company registration number'], ['5. The core set', 'Company active; confirmation statement and accounts not overdue']],
  sat: eq(`${CH}.status`, 'active'), defect: all(yes(`${CH}.found`), not(eq(`${CH}.status`, 'active'))),
  evidence: ['Companies House record'], action: 'review',
  text: [
    "{company} doesn't show as active at Companies House",
    "We read {company}'s record from Companies House, and it doesn't show as active.",
    'Anyone who looks up the company, investors and banks included, sees this status first.',
    "If it's being struck off or wound up, the company can lose its assets and contracts along with its status.",
    'Check the record on Companies House today and deal with what it shows, starting with anything overdue.',
  ],
});
b.rule({
  id: 'GB.CORP.ARTICLES', layer: 1, area: 'governance', stage: 2, title: 'Memorandum and articles of association', sev: 'high', tier: 1, regulator: CHECK_CH,
  src: [['Section 1 —', 'Memorandum of Association; Articles of Association'], ['5. The core set', 'Articles, statutory registers, board resolutions']],
  sat: any(yes(`${CH}.incorporation_filing_on_record`), held('gb_articles')), evidence: ['Companies House filing history', 'Your articles'],
  slot: { id: 'gb_articles', label: 'Articles of association', reason: 'If yours were amended and not filed, we need the current version.', tier: 4 },
  text: [
    "We can't find {company}'s articles of association",
    "We couldn't find your incorporation documents in the Companies House filing history, and you haven't added your articles.",
    'Your articles are the rules for how the company is run, and investors will read them.',
    "It'll come up in due diligence, and investors usually ask for changes to them.",
    'Add your current articles here.',
  ],
});
b.rule({
  id: 'GB.CORP.STATEMENT_OF_CAPITAL', layer: 1, area: 'filings', stage: 2, title: 'Statement of capital', sev: 'medium', tier: 1, regulator: CHECK_CH,
  src: [['Section 1 —', 'Statement of Capital']],
  sat: yes(`${CH}.capital_filing_on_record`), evidence: ['Companies House filing history'], action: 'file',
  text: [
    "We can't find a statement of capital for {company}",
    "We couldn't find a capital filing in {company}'s Companies House history.",
    'It is the public record of the shares your company has issued.',
    "If it doesn't match your own records, you'll have to explain why in due diligence.",
    'Check your filing history at Companies House and file anything missing.',
  ],
});
b.rule({
  id: 'GB.CORP.REGISTERED_OFFICE', layer: 1, area: 'filings', stage: 2, title: 'Registered office address', sev: 'high', tier: 1, regulator: CHECK_CH,
  src: [['Section 1 —', 'Registered office address']],
  sat: all(yes(`${CH}.registered_office_present`), no(`${CH}.registered_office_in_dispute`), no(`${CH}.undeliverable_registered_office`)),
  defect: any(yes(`${CH}.registered_office_in_dispute`), yes(`${CH}.undeliverable_registered_office`)),
  evidence: ['Companies House record'], action: 'file',
  text: [
    "There's a problem with {company}'s registered office address",
    'Companies House shows your registered office as disputed or undeliverable, or has no address for you.',
    'This is where official post and legal papers go.',
    "You can miss official letters, and investors who look up the company will see it's flagged.",
    'Update your registered office with Companies House.',
  ],
});
b.rule({
  id: 'GB.CORP.REGISTERED_EMAIL', layer: 1, area: 'filings', stage: 2, title: 'Registered email address', sev: 'low', tier: 5, regulator: CHECK_CH,
  src: [['Section 1 —', 'Registered email address']],
  sat: told('gb_registered_email'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s registered email address",
    "We don't have your confirmation that a registered email is set. Companies House doesn't publish it, so we can't check.",
    'Companies House uses this address to contact you.',
    'Official messages can go unread if it is out of date.',
    'Check it in your Companies House account, then confirm here.',
  ],
});
b.rule({
  id: 'GB.CORP.SIC_CODE', layer: 1, area: 'filings', stage: 2, title: 'SIC code', sev: 'low', tier: 1, regulator: CHECK_CH,
  src: [['Section 1 —', 'SIC code']],
  sat: { '!!': [{ var: `${CH}.sic_codes` }] }, evidence: ['Companies House record'], action: 'file',
  text: [
    "{company} has no SIC code at Companies House",
    "We couldn't find a SIC code on {company}'s Companies House record.",
    'It tells people what your company does.',
    'Banks and investors use it as a first check of what kind of business you are.',
    'Add the right code with your next confirmation statement.',
  ],
});
b.rule({
  id: 'GB.CORP.DIRECTORS', layer: 1, area: 'officers', stage: 2, title: 'Directors on record', sev: 'high', tier: 1, regulator: CHECK_CH,
  src: [['Section 1 —', 'Director appointment documentation'], ['5. The core set', 'Directors and PSCs on record']],
  sat: atLeast(`${CH}.directors_active_count`, 1), evidence: ['Companies House officers record'], action: 'file',
  text: [
    "{company} has no active director at Companies House",
    'We read your officers from Companies House, and none shows as an active director.',
    'A UK company needs a director on record to act and to file.',
    'Nobody can sign for the company, and you may not be able to file on time.',
    'Appoint a director and file it with Companies House.',
  ],
});
b.rule({
  id: 'GB.CORP.SHAREHOLDERS', layer: 1, area: 'shareholders', stage: 2, title: 'Shareholder details', sev: 'medium', tier: 1, regulator: CHECK_CH, review: true,
  src: [['Section 1 —', 'Shareholder details'], ['6. Thresholds', 'Whether shareholder details can be reliably parsed']],
  sat: held('gb_register_of_members'), evidence: ['Register of members'],
  slot: { id: 'gb_register_of_members', label: 'Register of members', reason: 'Shareholders appear on the confirmation statement, but your register is the reliable record of who owns what.' },
  text: [
    "We can't confirm who owns {company}",
    "You haven't added your register of members, and we can't reliably read shareholders from filings yet.",
    'Investors need to know exactly who owns the company.',
    'A mismatch between your register and your filings can hold up a round.',
    'Add your register of members.',
  ],
});
b.rule({
  id: 'GB.CORP.PSC', layer: 1, area: 'officers', stage: 2, title: 'People with significant control', sev: 'high', tier: 1, regulator: CHECK_CH,
  src: [['Section 1 —', 'PSC registration'], ['5. The core set', 'Directors and PSCs on record']],
  sat: atLeast(`${CH}.psc_active_count`, 1), defect: yes(`${CH}.psc_sanctioned`), evidence: ['Companies House PSC record'], action: 'file',
  text: [
    "{company} has no person with significant control on record",
    'We read your record from Companies House and found no active person with significant control.',
    'Companies have to tell Companies House who controls them. Investors and banks look at this.',
    'Banks can stop onboarding, and investors will ask why it is empty.',
    'File your person with significant control with Companies House.',
  ],
});
b.rule({
  id: 'GB.CORP.DIRECTOR_IDV', layer: 1, area: 'officers', stage: 2, title: 'Director identity checks', sev: 'high', tier: 1, regulator: CHECK_CH, from: '2025-11-18',
  src: [['Section 1 —', 'Director identity verification'], ['5. The core set', 'with identity verification complete after the transition deadline'], ['Section 18 —', 'Confirmation Statement']],
  rec: { type: 'registry_date', fact: `${CH}.directors_idv_next_due`, monitoring: auto(CHECK_CH) },
  sat: yes('derived.uk.directors_idv_complete'),
  verify: all(no('derived.uk.directors_idv_complete'), no('derived.uk.directors_idv_past_due')),
  evidence: ['Companies House officers record'], action: 'file',
  text: [
    "One of {company}'s directors isn't showing as verified",
    "Companies House doesn't show a completed identity check for at least one of your directors, and their date has passed.",
    'Directors have to verify their identity with Companies House. They do it themselves, online.',
    "Investors who look up the company can see it. Companies House can also take action against the director and the company.",
    "Ask your director to verify on GOV.UK. We'll see it here once it's done. If they already have, it may not be showing yet.",
  ],
});
b.rule({
  id: 'GB.CORP.PSC_IDV', layer: 1, area: 'officers', stage: 2, title: 'PSC identity checks', sev: 'high', tier: 1, regulator: CHECK_CH, from: '2025-11-18',
  src: [['Section 1 —', 'PSC identity verification']],
  rec: { type: 'registry_date', fact: `${CH}.psc_idv_next_due`, monitoring: auto(CHECK_CH) },
  sat: yes('derived.uk.psc_idv_complete'),
  verify: all(no('derived.uk.psc_idv_complete'), no('derived.uk.psc_idv_past_due')),
  evidence: ['Companies House PSC record'], action: 'file',
  text: [
    "One of {company}'s people with significant control isn't showing as verified",
    "Companies House doesn't show a completed identity check for someone with significant control, and their date has passed.",
    'People with significant control have to verify their identity, just as directors do.',
    "It's visible to anyone who looks up the company.",
    "Ask them to verify on GOV.UK. We'll see it here once it's done.",
  ],
});
b.rule({
  id: 'GB.CORP.PERSONAL_CODES', layer: 1, area: 'officers', stage: 2, title: 'Companies House personal codes', sev: 'low', tier: 5, regulator: CHECK_CH,
  src: [['Section 1 —', 'Companies House personal codes']],
  sat: told('gb_personal_codes_held'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed your directors have their personal codes",
    "We don't have your confirmation that each director has their Companies House personal code. They're not published, and we don't need to see them.",
    'Directors use this code for filings.',
    'A filing can get held up if a director has lost theirs.',
    'Ask each director to check they have it, then confirm here.',
  ],
});
b.rule({
  id: 'GB.CORP.CONFIRMATION_STATEMENT', layer: 1, area: 'filings', stage: 2, title: 'Confirmation statement', sev: 'high', tier: 1, regulator: CHECK_CH, penalty: 'moderate',
  src: [['Section 1 —', 'Confirmation Statement'], ['Section 18 —', 'Confirmation Statement'], ['5. The core set', 'Company active; confirmation statement and accounts not overdue']],
  params: { fee_gbp: 50, fee_from: '2026-02-01' },
  rec: { type: 'registry_date', fact: `${CH}.confirmation_next_due`, monitoring: auto(CHECK_CH) },
  sat: no(`${CH}.confirmation_overdue`), defect: yes(`${CH}.confirmation_overdue`), evidence: ['Companies House record'], action: 'file',
  text: [
    "{company}'s confirmation statement is overdue",
    'Companies House shows your confirmation statement as overdue.',
    'You file this every year to confirm your company details are right.',
    'Until you do, anyone who looks up the company, investors included, sees it as overdue.',
    'File it on the Companies House website. It costs £50.',
  ],
});
b.rule({
  id: 'GB.CORP.ACCOUNTS', layer: 1, area: 'filings', stage: 2, title: 'Annual accounts', sev: 'high', tier: 1, regulator: CHECK_CH, penalty: 'moderate',
  src: [['Section 1 —', 'Annual accounts'], ['Section 18 —', 'Annual accounts'], ['5. The core set', 'Company active; confirmation statement and accounts not overdue']],
  params: { first_accounts_months_after_incorporation: 21, then_months_after_year_end: 9 },
  rec: { type: 'registry_date', fact: `${CH}.accounts_next_due`, monitoring: auto(CHECK_CH) },
  sat: no(`${CH}.accounts_overdue`), defect: yes(`${CH}.accounts_overdue`), evidence: ['Companies House record'], action: 'file',
  text: [
    "{company}'s annual accounts are overdue",
    'Companies House shows your annual accounts as overdue.',
    'First accounts are due 21 months after incorporation, then 9 months after each year end.',
    "It's public. Lenders, investors and customers can all see it, and it gets worse the longer it's left.",
    'File your accounts with Companies House. Your accountant can do it for you.',
  ],
});
b.doc({
  id: 'GB.CORP.STATUTORY_REGISTERS', layer: 1, area: 'governance', stage: 2, title: 'Statutory registers', noun: 'statutory registers', sev: 'medium', tier: 5, review: true,
  src: [['Section 1 —', 'Register of Members; Register of Directors; Register of PSCs'], ['5. The core set', 'Articles, statutory registers, board resolutions']],
  slot: { id: 'gb_statutory_registers', label: 'Statutory registers', reason: 'Every company keeps these, unless they are held on the central register at Companies House.' },
});
b.rule({
  id: 'GB.CORP.CHARGES_INSOLVENCY', layer: 1, area: 'standing', stage: 2, title: 'Charges and insolvency', sev: 'high', tier: 1, regulator: CHECK_CH,
  src: [['Section 1 —', 'Register of Charges'], ['5. The core set', 'No outstanding charges or insolvency events']],
  sat: all(zero(`${CH}.charges_outstanding_count`), zero(`${CH}.insolvency_case_count`)), evidence: ['Companies House charges and insolvency records'], action: 'review',
  text: [
    "{company} has an outstanding charge or an insolvency record",
    'Companies House shows an outstanding charge or an insolvency case for {company}.',
    "A charge means a lender has a claim over company assets. That can be normal, but investors will want to understand it.",
    'It will come up in due diligence, and an old charge that has been paid off and never cleared can hold things up.',
    "If the charge has been paid off, file to have it marked as satisfied. For an insolvency record, check the case details on Companies House and in The Gazette.",
  ],
});
b.doc({
  id: 'GB.CORP.RESOLUTIONS', layer: 1, area: 'governance', stage: 2, title: 'Board and shareholder resolutions', noun: 'board and shareholder resolutions', sev: 'medium', tier: 5,
  src: [['Section 1 —', 'Board resolutions; shareholder resolutions'], ['5. The core set', 'Articles, statutory registers, board resolutions']],
  slot: { id: 'gb_resolutions', label: 'Board and shareholder resolutions', reason: 'These are the record of the big decisions your company has made.' },
});
b.doc({
  id: 'GB.CORP.FOUNDERS_AGREEMENT', layer: 1, area: 'founders', stage: 1, title: "Founders' agreement", sev: 'high', tier: 5,
  src: [['Section 17 —', "Founders' Agreement; Founders' Vesting Agreement"], ['5. The core set', "Founders' agreement, founders' IP assignment, NDA template"]],
  slot: { id: 'gb_founders_agreement', label: "Founders' agreement and vesting", reason: 'It settles who owns what and what happens if a founder leaves.' },
});
b.doc({
  id: 'GB.CORP.DIRECTOR_SERVICE', layer: 1, area: 'governance', stage: 5, title: 'Director service agreements', noun: 'director service agreements', sev: 'low', tier: 5,
  src: [['Section 17 —', 'Director Service Agreements']],
  slot: { id: 'gb_director_service', label: 'Director service agreements', reason: 'As the board grows, these set out what each director is there to do.' },
});

// --- Section 2: HMRC -----------------------------------------------------------------------------

b.doc({
  id: 'GB.TAX.CT_REGISTRATION', layer: 3, area: 'tax', stage: 2, title: 'Corporation Tax registration', sev: 'high', tier: 4, regulator: 'HMRC', review: true,
  src: [['Section 2 —', 'Corporation Tax registration; UTR'], ['6. Thresholds', 'Corporation Tax registration window']],
  slot: { id: 'gb_ct_registration', label: 'HMRC letter with your UTR', reason: "Your tax reference isn't public, so this letter is how we confirm it.", tier: 4 },
});
b.doc({
  id: 'GB.TAX.CT_RETURNS', layer: 3, area: 'tax', stage: 3, title: 'Corporation Tax returns', noun: 'Corporation Tax returns', sev: 'high', tier: 5, regulator: 'HMRC',
  src: [['Section 2 —', 'Corporation Tax payment records; returns'], ['Section 18 —', 'Corporation Tax returns and payments']],
  params: { return_months_after_year_end: 12, payment: '9 months and 1 day after year end' },
  rec: { type: 'after_year_end', months: 12, monitoring: remind },
  slot: { id: 'gb_ct_returns', label: 'Corporation Tax returns and payment records', reason: 'Investors check these, and they show you are up to date with HMRC.' },
});
b.rule({
  id: 'GB.TAX.VAT', layer: 3, area: 'tax', stage: 3, title: 'VAT registration', sev: 'high', tier: 1, regulator: 'HMRC', review: true,
  src: [['Section 2 —', 'VAT registration; VAT certificate'], ['6. Thresholds', 'VAT registration threshold']],
  sat: any(yes('registry.uk.hmrc_vat.registered'), held('gb_vat_certificate')), evidence: ['HMRC VAT check', 'VAT certificate'], action: 'register',
  slot: { id: 'gb_vat_certificate', label: 'VAT certificate', reason: "If you're registered, give us your VAT number and we'll check it with HMRC.", tier: 4 },
  text: [
    "We can't confirm {company}'s VAT registration",
    "We don't have a VAT number for {company} that we could check with HMRC.",
    'You register once your taxable turnover passes the threshold.',
    'Late registration can mean paying VAT you never charged your customers.',
    'Give us your VAT number, or talk to your accountant about whether you need to register.',
  ],
});
b.doc({
  id: 'GB.TAX.VAT_RETURNS', layer: 3, area: 'tax', stage: 3, title: 'VAT returns', noun: 'VAT returns', sev: 'medium', tier: 5, regulator: 'HMRC', when: yes('registry.uk.hmrc_vat.registered'),
  src: [['Section 2 —', '| VAT returns |'], ['Section 18 —', 'VAT returns']],
  rec: { type: 'periodic', every_months: 3, monitoring: remind },
  slot: { id: 'gb_vat_returns', label: 'VAT returns', reason: 'VAT-registered companies file these quarterly.' },
});
b.rule({
  id: 'GB.TAX.MTD', layer: 3, area: 'tax', stage: 3, title: 'Making Tax Digital', sev: 'low', tier: 5, regulator: 'HMRC', when: yes('registry.uk.hmrc_vat.registered'),
  src: [['Section 2 —', 'Making Tax Digital compliance']],
  sat: told('gb_mtd_software'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} uses Making Tax Digital software",
    "We don't have your confirmation that you use compatible software for your VAT.",
    'VAT-registered companies keep digital records and file through compatible software.',
    'A question you can answer in a minute now can be a nuisance when HMRC asks.',
    'Check with your accountant, then confirm here.',
  ],
});
b.doc({
  id: 'GB.TAX.PAYE', layer: 3, area: 'employment_tax', stage: 2, title: 'PAYE registration', sev: 'high', tier: 4, regulator: 'HMRC', when: STAFF,
  src: [['Section 2 —', 'PAYE registration; PAYE reference; Accounts Office reference']],
  slot: { id: 'gb_paye', label: 'HMRC PAYE letter', reason: "You register before your first payday, and the reference isn't public.", tier: 4 },
});
b.doc({
  id: 'GB.TAX.PAYROLL_RECORDS', layer: 3, area: 'employment_tax', stage: 2, title: 'Payroll records and employer National Insurance', noun: 'payroll records', sev: 'medium', tier: 5, regulator: 'HMRC', when: STAFF,
  src: [['Section 2 —', 'PAYE payroll records; employer National Insurance'], ['Section 18 —', 'PAYE returns and remittances; employer NI']],
  rec: { type: 'periodic', every_months: 1, monitoring: remind },
  slot: { id: 'gb_payroll_records', label: 'Payroll records', reason: 'These returns and payments are due monthly.' },
});
b.doc({
  id: 'GB.EQUITY.EIS_SEIS', layer: 5, area: 'fundraising', stage: 4, title: 'EIS or SEIS advance assurance', sev: 'medium', tier: 4, regulator: 'HMRC', when: yes('derived.invested'),
  src: [['Section 2 —', 'EIS advance assurance; SEIS advance assurance']],
  slot: { id: 'gb_eis_seis', label: 'EIS or SEIS advance assurance letter', reason: "UK angels and VCs often ask for it. It's not public, so we need your letter.", tier: 4 },
});

// --- Section 3: ICO ---------------------------------------------------------------------------------

b.rule({
  id: 'GB.DP.ICO_FEE', layer: 3, area: 'data_protection', stage: 2, title: 'ICO data protection fee', sev: 'high', tier: 3, regulator: 'Information Commissioner\'s Office', when: PD, penalty: 'moderate',
  src: [['Section 3 —', 'ICO data protection fee registration; registration confirmation; fee renewal'], ['Section 18 —', 'ICO fee renewal'], ['5. The core set', 'ICO fee registration current']],
  params: { tiers_gbp: [52, 78, 3763] },
  rec: { type: 'registry_date', fact: 'registry.uk.ico.expires_on', monitoring: auto('the ICO register') },
  sat: any(yes('derived.uk.ico_current'), held('gb_ico_receipt')), defect: yes('derived.uk.ico_lapsed'), evidence: ['ICO register', 'Fee receipt'], action: 'pay',
  slot: { id: 'gb_ico_receipt', label: 'ICO fee receipt', reason: "If you've just paid, it can take a week to show on the register.", tier: 4 },
  text: [
    "We can't find {company} on the ICO register",
    "We can't find {company} on the ICO register. That may not mean you haven't paid: we match on name and postcode.",
    "Companies that process personal data pay the ICO a fee every year, unless they're exempt. It starts at £52.",
    "It's a public register, so anyone can check, and it's one of the first things a regulator looks at.",
    'Pay the fee on the ICO website. If you paid recently, give it a week to appear, or upload your receipt.',
  ],
});
b.doc({
  id: 'GB.DP.COMPLIANCE_DOCS', layer: 3, area: 'data_protection', stage: 2, title: 'Data protection records', noun: 'data protection records', sev: 'medium', tier: 5, regulator: "Information Commissioner's Office", when: PD,
  src: [['Section 3 —', 'Data protection compliance documentation']],
  slot: { id: 'gb_dp_docs', label: 'Data protection records', reason: 'You have to be able to show how you comply, not just comply.' },
});
b.rule({
  id: 'GB.DP.DPO', layer: 3, area: 'data_protection', stage: 2, title: 'Data protection officer', sev: 'medium', tier: 5, regulator: "Information Commissioner's Office", when: all(PD, yes('derived.sensitive_data')),
  src: [['Section 3 —', 'DPO appointment']], law: [['UK GDPR', 'Art 37']],
  sat: all(told('gb_dpo_appointed'), yes('web.policy.dpo_contact')), evidence: ['Your confirmation', 'DPO contact in your notice'], action: 'attest',
  text: [
    "We can't confirm whether {company} needs a data protection officer",
    "You handle sensitive data, and we don't have your confirmation of a data protection officer, or a contact in your notice.",
    'Large-scale monitoring or special-category data can mean you need one.',
    "If you need one and don't have one, you'd be exposed the first time the ICO looks.",
    "Decide whether you need one, keep a note of why, and add the contact to your notice.",
  ],
});
b.rule({
  id: 'GB.DP.PRIVACY_NOTICE', layer: 3, area: 'data_protection', stage: 2, title: 'Privacy notice', sev: 'high', tier: 1, regulator: "Information Commissioner's Office", when: SITE,
  src: [['Section 3 —', 'Privacy Policy / Privacy Notice'], ['5. The core set', 'Privacy notice and cookie consent compliant']],
  law: [['UK GDPR', 'Arts 13/14']], order: 'privacy_notice',
  sat: all(yes('web.policy.privacy_notice_found'), yes('web.policy.complaint_route_ico')), defect: all(yes('web.policy.privacy_notice_found'), no('web.policy.complaint_route_ico')),
  evidence: ['Your published privacy notice'], action: 'fix_website',
  text: [
    "{company}'s privacy notice is missing or doesn't mention the ICO",
    "We looked at your website and either couldn't find a privacy notice, or it doesn't tell people they can complain to the ICO.",
    'People have to be told what you do with their data, and where to complain.',
    "It's public, so regulators, customers and investors can all see the gap.",
    'Publish a notice with the required details.',
  ],
});
// Added 18 Nov 2026. For a company outside the UK with UK users: layer 3, so it follows the
// company into the UK market. It fails only when the answers show it applies and the website was
// read in a language the scan supports; a missing fact, or a site in another language, is "to check".
b.rule({
  id: 'GB.DP.UK_REPRESENTATIVE', layer: 3, area: 'data_protection', stage: 2, title: 'UK representative for a company outside the UK', sev: 'medium', tier: 1, regulator: "Information Commissioner's Office",
  when: all(PD, no('derived.uk_established'), { in: ['GB', { var: 'answers.user_countries' }] }),
  src: [['Section 3 —', 'UK representative appointed (added 18 Nov 2026)']],
  law: [['UK GDPR', 'Arts 3(2), 13(1)(a), 27']],
  sat: any(yes('web.policy.uk_representative_named'), told('gb_uk_representative')),
  verify: all(no('web.policy.uk_representative_named'), no('web.policy.language_supported')),
  evidence: ['Your published privacy notice', 'Your confirmation'], action: 'fix_website',
  text: [
    "We can't see {company}'s UK representative",
    "You told us you have users in the UK and no office there, and we couldn't find a UK representative named in your privacy notice or legal pages. You haven't confirmed you have one.",
    'A company outside the UK that offers goods or services to people in the UK, or tracks their behaviour there, must name a representative in the UK in writing, and give its contact details in the privacy notice. Occasional, low-risk processing is exempt.',
    'The ICO and people in the UK have nobody to contact, and the ICO can act on it.',
    'Appoint a UK representative, add its name and contact details to your privacy notice, then confirm here. If the exemption applies, confirm that instead.',
  ],
});
b.doc({
  id: 'GB.DP.PROCESSING_AGREEMENT', layer: 3, area: 'data_protection', stage: 2, title: 'Data processing agreements', noun: 'data processing agreements', sev: 'medium', tier: 5, when: all(PD, yes('derived.has_processors')),
  src: [['Section 3 —', 'Data Processing Agreement']],
  slot: { id: 'gb_dpa', label: 'Data processing agreements', reason: 'If vendors handle personal data for you, this agreement sets the rules.' },
});
b.doc({
  id: 'GB.DP.ROPA', layer: 3, area: 'data_protection', stage: 2, title: 'Records of processing activities', noun: 'records of processing', sev: 'medium', tier: 5, when: PD,
  src: [['Section 3 —', 'Records of Processing Activities']],
  slot: { id: 'gb_ropa', label: 'Records of processing activities', reason: 'It is the list of what personal data you hold and why.' },
});
b.doc({
  id: 'GB.AI.DPIA', layer: 6, area: 'data_governance', stage: 2, title: 'Data protection impact assessment', sev: 'high', tier: 5, regulator: "Information Commissioner's Office", when: all(PD, yes('derived.high_risk_processing')),
  src: [['Section 3 —', '| DPIA |']],
  slot: { id: 'gb_dpia', label: 'Data protection impact assessment', reason: 'High-risk processing, AI and profiling call for this in writing.' },
});
b.doc({
  id: 'GB.DP.BREACH', layer: 3, area: 'data_protection', stage: 2, title: 'Data breach response policy', sev: 'medium', tier: 5, regulator: "Information Commissioner's Office", when: PD,
  src: [['Section 3 —', 'Data breach response policy; breach notification records']],
  slot: { id: 'gb_breach_policy', label: 'Data breach response policy and records', reason: 'Breaches can have to be reported to the ICO within 72 hours, so you need a plan first.' },
});
b.rule({
  id: 'GB.DP.RIGHTS', layer: 3, area: 'data_protection', stage: 2, title: 'Data subject rights procedures', sev: 'medium', tier: 5, when: PD,
  src: [['Section 3 —', 'Data subject access request procedures; data subject rights procedures']],
  sat: all(told('gb_rights_procedure'), yes('web.policy.rights_section')), evidence: ['Your confirmation', 'Rights section in your notice'], action: 'attest',
  text: [
    "We can't confirm how {company} handles people's data requests",
    "We don't have your confirmation of a process, or your notice doesn't explain people's rights.",
    'People can ask to see or delete their data, and you have to answer them.',
    "When the first request arrives you'll be working it out under a deadline.",
    'Write down your process, explain the rights in your notice, and confirm here.',
  ],
});
b.rule({
  id: 'GB.DP.RETENTION', layer: 3, area: 'data_protection', stage: 2, title: 'Data retention policy', sev: 'low', tier: 5, when: PD,
  src: [['Section 3 —', 'Data retention policy; data deletion policy']],
  sat: all(told('gb_retention_policy'), yes('web.policy.retention_statement')), evidence: ['Your confirmation', 'Retention statement in your notice'], action: 'attest',
  text: [
    "We can't confirm how long {company} keeps people's data",
    "We don't have your confirmation of a retention policy, or your notice doesn't say how long you keep data.",
    "You shouldn't keep personal data for longer than you need it.",
    'The more you keep, the more you have to answer for if something goes wrong.',
    'Set your retention periods, add them to your notice, and confirm here.',
  ],
});
b.rule({
  id: 'GB.DP.COOKIE_POLICY', layer: 3, area: 'cookies', stage: 2, title: 'Cookie policy', sev: 'medium', tier: 1, when: WEB,
  src: [['Section 3 —', '| Cookie Policy |']],
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
  id: 'GB.DP.COOKIE_CONSENT', layer: 3, area: 'cookies', stage: 2, title: 'Cookie consent', sev: 'high', tier: 1, regulator: "Information Commissioner's Office", when: WEB, from: '2026-02-05',
  src: [['Section 3 —', 'Cookie consent mechanism'], ['5. The core set', 'Privacy notice and cookie consent compliant']],
  law: [['PECR, as amended by the Data (Use and Access) Act 2025']],
  sat: no('derived.web.trackers_before_consent'), defect: yes('derived.web.trackers_before_consent'), evidence: ['What your site set before anyone agreed'], action: 'fix_website',
  text: [
    "{company}'s website sets cookies before anyone has agreed",
    'We loaded your site and it set non-essential cookies or loaded trackers before anyone agreed.',
    'Non-essential cookies have to wait for consent, and rejecting has to be as easy as accepting.',
    "Anyone can see this from outside, and it's one of the things the ICO checks.",
    'Set up your consent banner to hold those tags back until someone agrees.',
  ],
});
b.doc({
  id: 'GB.DP.TRANSFERS', layer: 3, area: 'data_protection', stage: 2, title: 'International data transfer records', noun: 'international data transfer records', sev: 'medium', tier: 5, when: yes('derived.data_outside_home'),
  src: [['Section 3 —', 'International data transfer documentation; IDTA; UK Addendum to EU SCCs']],
  slot: { id: 'gb_transfers', label: 'International data transfer records (IDTA or UK Addendum)', reason: 'If data leaves the UK, you need one of these in place.' },
});
b.doc({
  id: 'GB.DP.AUDIT_TRAINING', layer: 3, area: 'data_protection', stage: 3, title: 'Data protection audit and training records', noun: 'data protection audit and training records', sev: 'low', tier: 5, when: PD,
  src: [['Section 3 —', 'Data protection audit documentation; training records']],
  slot: { id: 'gb_dp_training', label: 'Data protection audit and training records', reason: 'It shows your team knows what to do.' },
});
b.rule({
  id: 'GB.DP.COMPLAINTS', layer: 3, area: 'data_protection', stage: 2, title: 'Data protection complaints procedure', sev: 'medium', tier: 5, regulator: "Information Commissioner's Office", when: PD, review: true, from: '2026-06-19',
  src: [['Section 3 —', 'Data protection complaint handling procedures'], ['6. Thresholds', 'complaints-handling duty commencement']],
  sat: told('gb_dp_complaints'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed how {company} handles data protection complaints",
    "We don't have your confirmation of a complaints route for data protection.",
    'People should be able to complain to you directly about how you use their data.',
    'Without one, complaints go straight to the regulator.',
    'Add a complaints route to your notice, then confirm here.',
  ],
});

// --- Section 4: FCA ---------------------------------------------------------------------------------

b.rule({
  id: 'GB.FIN.FCA_AUTHORISATION', layer: 3, area: 'financial_regulation', stage: 2, title: 'FCA authorisation', sev: 'critical', tier: 1, regulator: 'Financial Conduct Authority', when: FIN, penalty: 'severe',
  src: [['Section 4 —', 'FCA authorisation; registration; confirmation; permissions; Financial Services Register entry']],
  sat: any(held('gb_fca_authorisation'), held('gb_licensed_partner_agreement')), evidence: ['Financial Services Register entry', 'Agreement with authorised partner'], action: 'register',
  slot: [
    { id: 'gb_fca_authorisation', label: 'FCA authorisation (give us your FRN)', reason: 'You must have this before any regulated activity. We check your firm number on the register.', tier: 4 },
    { id: 'gb_licensed_partner_agreement', label: 'Agreement with your authorised partner', reason: 'If an authorised firm does the regulated part, this shows you are covered.' },
  ],
  text: [
    "We can't see how {company} is authorised for regulated financial services",
    "You told us you work in financial services, and we don't have an FCA firm number or an agreement with an authorised partner.",
    'You need this before you carry out any regulated activity.',
    'Operating without it is a serious matter, and no investor will close until it is clear.',
    "Give us your FRN, or add the agreement with your authorised partner. If you're not sure you need it, check the FCA's guidance on regulated activities before you go on.",
  ],
});
b.doc({
  id: 'GB.FIN.PAYMENT_INSTITUTION', layer: 3, area: 'payments', stage: 2, title: 'Payment or e-money institution authorisation', noun: 'payment or e-money authorisation', sev: 'critical', tier: 1, regulator: 'Financial Conduct Authority', when: yes('derived.moves_money'),
  sat: any(held('gb_payment_institution'), held('gb_licensed_partner_agreement')),
  src: [['Section 4 —', 'Payment Institution authorisation; Small PI registration; EMI authorisation; Small EMI registration']],
  slot: { id: 'gb_payment_institution', label: 'Payment or e-money institution authorisation', reason: 'If you move money yourself, you need one of these.', tier: 4 },
});
b.doc({
  id: 'GB.FIN.AISP', layer: 3, area: 'payments', stage: 2, title: 'Account information service registration', noun: 'account information or Open Banking registration', sev: 'high', tier: 1, regulator: 'Financial Conduct Authority', when: yes('answers.offers_account_information_services'),
  src: [['Section 4 —', 'AISP registration; Open Banking registration']],
  slot: { id: 'gb_aisp', label: 'Account information or Open Banking registration', reason: 'You need this to read customers\' bank data.', tier: 4 },
});
b.doc({
  id: 'GB.FIN.CONSUMER_CREDIT', layer: 3, area: 'lending', stage: 2, title: 'Consumer credit permissions', noun: 'consumer credit permissions', sev: 'critical', tier: 1, regulator: 'Financial Conduct Authority', when: yes('derived.sector.lending'),
  src: [['Section 4 —', 'Consumer Credit permissions']],
  slot: { id: 'gb_consumer_credit', label: 'Consumer credit permissions', reason: 'Lending to consumers needs FCA permission.', tier: 4 },
});
b.doc({
  id: 'GB.FIN.CRYPTO', layer: 3, area: 'crypto', stage: 2, title: 'Cryptoasset business registration', sev: 'critical', tier: 1, regulator: 'Financial Conduct Authority', when: yes('derived.sector.crypto'), review: true,
  src: [['Section 4 —', 'Cryptoasset business registration'], ['6. Thresholds', 'cryptoasset authorisation regime timing']],
  slot: { id: 'gb_crypto_registration', label: 'Cryptoasset business registration', reason: 'Crypto businesses register with the FCA, and a fuller regime is expected.', tier: 4 },
});
b.doc({
  id: 'GB.FIN.AML_REGISTRATION', layer: 3, area: 'financial_crime', stage: 2, title: 'AML registration', sev: 'high', tier: 4, when: yes('derived.sector.crypto'),
  src: [['Section 4 —', 'AML registration']],
  slot: { id: 'gb_aml_registration', label: 'AML registration', reason: 'Businesses under the money laundering rules have to register with a supervisor.', tier: 4 },
});
b.doc({
  id: 'GB.FIN.APPROVED_PERSONS', layer: 3, area: 'financial_regulation', stage: 2, title: 'Approved persons and senior management functions', noun: 'senior manager approvals', sev: 'high', tier: 1, regulator: 'Financial Conduct Authority', when: FIN,
  src: [['Section 4 —', 'Approved Person / Senior Management Function approvals']],
  slot: { id: 'gb_approved_persons', label: 'Senior manager approvals', reason: 'Authorised firms have named, approved senior people.', tier: 4 },
});
b.doc({
  id: 'GB.FIN.COMPLIANCE_MANUAL', layer: 3, area: 'financial_crime', stage: 2, title: 'Compliance manual and AML policies', noun: 'compliance manual and AML policies', sev: 'high', tier: 5, when: FIN,
  src: [['Section 4 —', 'Compliance Manual; AML Policy; CDD and KYC procedures; sanctions screening policy; financial crime risk assessment']],
  slot: { id: 'gb_compliance_manual', label: 'Compliance manual and AML policies', reason: 'Financial businesses need written procedures for financial crime.' },
});
b.doc({
  id: 'GB.FIN.COMPLAINTS', layer: 4, area: 'financial_regulation', stage: 3, title: 'Complaints handling policy', sev: 'medium', tier: 5, when: FIN,
  src: [['Section 4 —', 'Complaints handling policy']],
  slot: { id: 'gb_fin_complaints', label: 'Complaints handling policy', reason: 'Regulated firms need one.' },
});
b.doc({
  id: 'GB.FIN.CONSUMER_DUTY', layer: 3, area: 'financial_regulation', stage: 3, title: 'Consumer Duty records', noun: 'Consumer Duty records', sev: 'high', tier: 5, regulator: 'Financial Conduct Authority', when: all(FIN, CONSUMER),
  src: [['Section 4 —', 'Consumer Duty compliance documentation']],
  slot: { id: 'gb_consumer_duty', label: 'Consumer Duty records', reason: 'Firms with retail customers have to show they get good outcomes.' },
});
b.doc({
  id: 'GB.FIN.REPORTING', layer: 3, area: 'financial_regulation', stage: 3, title: 'Regulatory reporting records', noun: 'regulatory reporting records', sev: 'medium', tier: 5, regulator: 'Financial Conduct Authority', when: FIN,
  src: [['Section 4 —', 'Regulatory reporting documentation'], ['Section 18 —', 'FCA regulatory returns and annual fees']],
  slot: { id: 'gb_fin_reporting', label: 'Regulatory reporting records', reason: 'Returns and fees vary by firm type, so keep a record of what you file.' },
});
b.doc({
  id: 'GB.FIN.SAFEGUARDING', layer: 3, area: 'payments', stage: 3, title: 'Safeguarding records', noun: 'safeguarding records', sev: 'high', tier: 5, regulator: 'Financial Conduct Authority', when: yes('derived.moves_money'), from: '2026-05-07',
  src: [['Section 4 —', 'Safeguarding documentation']],
  params: { audit_threshold_gbp: 100_000 },
  slot: { id: 'gb_safeguarding', label: 'Safeguarding records and audit', reason: "If you hold customers' money, it has to be kept safe and, above £100k, audited each year." },
});
b.doc({
  id: 'GB.FIN.WIND_DOWN', layer: 3, area: 'financial_regulation', stage: 3, title: 'Wind-down plan and capital records', noun: 'wind-down plan and capital records', sev: 'medium', tier: 5, regulator: 'Financial Conduct Authority', when: FIN,
  src: [['Section 4 —', 'Wind-down plan; regulatory capital documentation']],
  slot: { id: 'gb_wind_down', label: 'Wind-down plan and capital records', reason: 'Authorised firms should show they could close safely.' },
});

// --- Sections 5 and 6: payment systems and telecoms --------------------------------------------------

b.doc({
  id: 'GB.SECTOR.PSR', layer: 3, area: 'payments', stage: 3, title: 'Payment system regulator records', noun: 'payment system regulator records', sev: 'medium', tier: 5, regulator: 'Payment Systems Regulator', when: yes('derived.sector.payment_system'),
  src: [['Section 5 —', 'Payment system regulatory compliance documentation; PSR notifications']],
  slot: { id: 'gb_psr', label: 'Payment system regulator records', reason: 'Only applies if you run a designated payment system.' },
});
b.rule({
  id: 'GB.SECTOR.OFCOM_CONDITIONS', layer: 3, area: 'telecoms', stage: 2, title: 'Ofcom General Conditions', sev: 'high', tier: 5, regulator: 'Ofcom', when: TELECOMS, review: true,
  src: [['Section 6 —', 'General Conditions of Entitlement compliance'], ['2. Consolidation notes', '"Ofcom telecommunications licence" is not a licence']],
  sat: told('gb_ofcom_general_conditions'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} meets Ofcom's General Conditions",
    "You told us you are in telecoms, and we don't have your confirmation you meet the General Conditions.",
    "There's no general telecoms licence. Providers operate under these conditions instead.",
    "Ofcom expects you to meet them from your first day, even though there's nothing to apply for.",
    'Check the conditions against how you operate, then confirm here.',
  ],
});
b.doc({
  id: 'GB.SECTOR.TELECOMS_DOCS', layer: 3, area: 'telecoms', stage: 3, title: 'Emergency call and equipment records', noun: 'emergency call and equipment records', sev: 'medium', tier: 5, regulator: 'Ofcom', when: TELECOMS,
  src: [['Section 6 —', 'Emergency communications compliance; telecommunications equipment compliance']],
  slot: { id: 'gb_telecoms_docs', label: 'Emergency call and equipment records', reason: 'Telecoms providers keep these on file.' },
});
b.doc({
  id: 'GB.SECTOR.OFCOM_REPORTING', layer: 3, area: 'telecoms', stage: 3, title: 'Ofcom regulatory reporting', noun: 'Ofcom returns', sev: 'medium', tier: 5, regulator: 'Ofcom', when: TELECOMS,
  src: [['Section 6 —', 'Ofcom regulatory reporting']],
  slot: { id: 'gb_ofcom_reporting', label: 'Ofcom returns', reason: 'These are filed annually.' },
});

// --- Sections 7 and 13: employer --------------------------------------------------------------------

b.rule({
  id: 'GB.EMP.PENSION', layer: 3, area: 'employment', stage: 2, title: 'Workplace pension and auto-enrolment', sev: 'high', tier: 4, regulator: 'The Pensions Regulator', when: STAFF, review: true, penalty: 'moderate',
  src: [['Sections 7 and 13', 'Workplace pension scheme; scheme registration'], ['6. Thresholds', 'Pensions: declaration-of-compliance deadline']],
  rec: { type: 'periodic', every_months: 1, monitoring: remind },
  sat: held('gb_pension_declaration'), evidence: ['Declaration of compliance'],
  slot: { id: 'gb_pension_declaration', label: 'Pension declaration of compliance', reason: "The Pensions Regulator doesn't publish it, so your declaration is the proof.", tier: 4 },
  text: [
    "We can't see {company}'s pension declaration",
    "You have employees, and you haven't added your declaration of compliance.",
    "Pension duties start on your first employee's start date, and a declaration of compliance is due within 5 months.",
    "It's an easy thing to miss when you are busy hiring.",
    'Complete the declaration with The Pensions Regulator and upload it here.',
  ],
});
b.doc({
  id: 'GB.EMP.CONTRACTS', layer: 4, area: 'employment_contracts', stage: 2, title: 'Employment contracts', noun: 'employment contracts', sev: 'high', tier: 5, when: STAFF,
  src: [['Sections 7 and 13', '| Employment contracts |']],
  slot: { id: 'gb_employment_contracts', label: 'Employment contracts', reason: 'Written statements are due by day one, and they should cover IP.' },
});
b.doc({
  id: 'GB.EMP.HANDBOOK', layer: 4, area: 'employment_contracts', stage: 5, title: 'Staff handbook', sev: 'low', tier: 5, when: STAFF,
  src: [['Sections 7 and 13', 'Employee handbook / staff handbook']],
  slot: { id: 'gb_handbook', label: 'Staff handbook', reason: 'As you grow, it keeps your policies in one place.' },
});
b.rule({
  id: 'GB.EMP.RIGHT_TO_WORK', layer: 3, area: 'employment', stage: 2, title: 'Right to work checks', sev: 'high', tier: 5, regulator: 'Home Office', when: STAFF,
  src: [['Sections 7 and 13', 'Right to Work verification records; checks']],
  sat: told('gb_right_to_work_checks'), evidence: ['Your confirmation for each hire'], action: 'attest',
  text: [
    "You haven't confirmed right to work checks for your team",
    "We don't have your confirmation that every employee has had a right to work check.",
    'Employers check and keep a record of this for each hire.',
    "It's a common question in due diligence, and it's hard to fix late.",
    'Check your records, complete anything missing, and confirm here.',
  ],
});
b.doc({
  id: 'GB.EMP.MIN_WAGE', layer: 3, area: 'employment', stage: 2, title: 'National Minimum Wage records', noun: 'National Minimum Wage records', sev: 'medium', tier: 5, when: STAFF,
  src: [['Sections 7 and 13', 'National Minimum Wage compliance documentation']],
  slot: { id: 'gb_min_wage', label: 'National Minimum Wage records', reason: 'Employers keep a record that they pay at least the minimum.' },
});
b.doc({
  id: 'GB.EMP.WORKING_TIME', layer: 3, area: 'employment', stage: 2, title: 'Holiday and working time records', noun: 'holiday and working time records', sev: 'low', tier: 5, when: STAFF,
  src: [['Sections 7 and 13', 'Holiday and working time records']],
  slot: { id: 'gb_working_time', label: 'Holiday and working time records', reason: 'Employers keep these for their staff.' },
});
b.rule({
  id: 'GB.EMP.LIABILITY_INSURANCE', layer: 3, area: 'employment', stage: 2, title: "Employers' liability insurance", sev: 'high', tier: 4, when: STAFF, penalty: 'moderate',
  src: [['Sections 7 and 13', "Employers' Liability Insurance certificate"], ['Section 18 —', 'Licence renewals; insurance renewals']],
  params: { minimum_cover_gbp: 5_000_000 },
  rec: { type: 'expiry', fact: 'vault.gb_el_insurance.expires_on', monitoring: remind },
  sat: held('gb_el_insurance'), evidence: ['Insurance certificate'],
  slot: { id: 'gb_el_insurance', label: "Employers' liability insurance certificate", reason: "It's compulsory for most employers, with at least £5m of cover.", tier: 4, expires: true },
  text: [
    "We can't see {company}'s employers' liability insurance",
    "You have employees, and you haven't added an employers' liability certificate.",
    "It's compulsory for most employers, with at least £5m of cover, and it has to be available to your staff.",
    'If someone is hurt at work, the company could be left paying without cover.',
    'Buy the cover if you need to, and upload the certificate. We read the expiry date from it and remind you.',
  ],
});
b.doc({
  id: 'GB.EMP.CONTRACTOR_AGREEMENTS', layer: 4, area: 'employment_contracts', stage: 2, title: 'Contractor agreements', noun: 'contractor agreements', sev: 'high', tier: 5, when: CONTRACTORS,
  src: [['Sections 7 and 13', '| Contractor agreements |'], ['Section 17 —', 'Consultancy Agreement']],
  slot: { id: 'gb_contractor_agreements', label: 'Contractor and consultancy agreements', reason: 'Each should have a written IP assignment, and a note on IR35 status.' },
});
b.doc({
  id: 'GB.EMP.ONBOARDING', layer: 4, area: 'employment_contracts', stage: 2, title: 'Employee onboarding records', noun: 'employee onboarding records', sev: 'low', tier: 5, when: STAFF,
  src: [['Sections 7 and 13', 'Employee onboarding documentation']],
  slot: { id: 'gb_onboarding', label: 'Employee onboarding records', reason: 'A simple checklist means no new hire misses a signature.' },
});
b.doc({
  id: 'GB.EMP.SPONSOR_LICENCE', layer: 3, area: 'immigration', stage: 3, title: 'Sponsor licence', sev: 'high', tier: 3, regulator: 'Home Office', when: yes('derived.foreign_workers'), review: true,
  src: [['Sections 7 and 13', '| Sponsor licence |'], ['6. Thresholds', 'Home Office sponsor register']],
  slot: { id: 'gb_sponsor_licence', label: 'Sponsor licence', reason: "If you sponsor workers from outside the UK, you need a licence. It's on a public register.", tier: 4, expires: true },
});
b.rule({
  id: 'GB.EMP.VISA_RECORDS', layer: 3, area: 'immigration', stage: 3, title: 'Certificates of sponsorship and visa records', sev: 'high', tier: 5, regulator: 'Home Office', when: yes('derived.foreign_workers'),
  src: [['Sections 7 and 13', 'Certificate of Sponsorship; Skilled Worker visa documentation; immigration compliance records']],
  sat: told('gb_visa_records_held'), evidence: ['Held or not held, per role'], action: 'attest',
  text: [
    "You haven't confirmed you hold visa records for sponsored staff",
    "You told us you sponsor workers, and we don't have your confirmation that records are held for each role.",
    "These are personal documents, so we only ask whether you hold them, not for copies.",
    'Missing records can put your sponsor licence at risk.',
    'Check your records for each sponsored role, then confirm here.',
  ],
});
b.doc({
  id: 'GB.EMP.POLICIES', layer: 4, area: 'employment_contracts', stage: 3, title: 'Equality and grievance policies', noun: 'equality, disciplinary and grievance policies', sev: 'low', tier: 5, when: STAFF,
  src: [['Sections 7 and 13', 'Equality and diversity policy; disciplinary and grievance procedures']],
  slot: { id: 'gb_hr_policies', label: 'Equality, disciplinary and grievance policies', reason: 'These help you handle people problems fairly when they come up.' },
});
b.doc({
  id: 'GB.EMP.WHISTLEBLOWING', layer: 4, area: 'employment_contracts', stage: 5, title: 'Whistleblowing policy', sev: 'low', tier: 5, when: STAFF,
  src: [['Sections 7 and 13', 'Whistleblowing policy']],
  slot: { id: 'gb_whistleblowing', label: 'Whistleblowing policy', reason: 'It gives staff a safe way to raise concerns.' },
});

// --- Section 8: exports and sanctions ----------------------------------------------------------------

b.doc({
  id: 'GB.EXPORT.LICENCE', layer: 3, area: 'export_control', stage: 3, title: 'Export licence', sev: 'high', tier: 4, regulator: 'Department for Business and Trade', when: EXPORTS,
  src: [['Section 8 —', 'Export licence; strategic export control licence; dual-use technology export authorisation']],
  slot: { id: 'gb_export_licence', label: 'Export licence or OGEL registration', reason: "Encryption, AI or other controlled technology sold abroad can need a licence, and these aren't public.", tier: 4 },
});
b.doc({
  id: 'GB.EXPORT.IMPORT_LICENCE', layer: 3, area: 'export_control', stage: 3, title: 'Import licence', sev: 'medium', tier: 4, regulator: 'Department for Business and Trade', when: EXPORTS,
  src: [['Section 8 —', 'Import licence']],
  slot: { id: 'gb_import_licence', label: 'Import licence', reason: 'Controlled goods coming into the UK can need one.', tier: 4 },
});
b.rule({
  id: 'GB.SANCT.SCREENING', layer: 3, area: 'sanctions', stage: 3, title: 'Sanctions and export control records', sev: 'high', tier: 5, regulator: 'Department for Business and Trade', when: yes('derived.sanctions_exposure'),
  src: [['Section 8 —', 'UK trade sanctions compliance documentation; export control compliance documentation']],
  sat: all(held('gb_sanctions_docs'), no('registry.sanctions.match')), defect: yes('registry.sanctions.match'), verify: yes('registry.sanctions.possible_match'),
  evidence: ['Sanctions records', 'Screening against the UK Sanctions List'],
  slot: { id: 'gb_sanctions_docs', label: 'Sanctions and export control records', reason: 'If you export or move money, you should screen who you deal with.' },
  text: [
    "We can't confirm how {company} handles sanctions",
    "We don't have your sanctions records, or your name matched an entry on a sanctions list. A match may be another business with a similar name.",
    'If you export or move money, you should check who you are dealing with.',
    'Banks and payment partners will ask, and an unresolved match can stop your payments.',
    'Add your policy and records. If there is a match, compare the entry with your details before you go on.',
  ],
});

// --- Section 9: IP ------------------------------------------------------------------------------------

b.doc({
  id: 'GB.IP.TRADEMARK_SEARCH', layer: 2, area: 'trademarks', stage: 2, title: 'Trade mark search report', sev: 'low', tier: 5, regulator: 'UK Intellectual Property Office',
  src: [['Section 9 —', 'Trademark search']],
  slot: { id: 'gb_trademark_search', label: 'Trade mark search report', reason: 'A search shows whether someone else already has a mark close to yours.' },
});
b.rule({
  id: 'GB.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'UK trade mark', sev: 'high', tier: 4, regulator: 'UK Intellectual Property Office',
  src: [['Section 9 —', 'Trademark application; registration certificate'], ['5. The core set', 'Trademark filed for the brand']],
  rec: { type: 'every_years', from_fact: 'vault.gb_trademark.dated', years: 10, monitoring: auto('the UK IPO') },
  sat: held('gb_trademark'), evidence: ['Trade mark certificate'], action: 'file', order: 'uk_trademark_filing',
  slot: { id: 'gb_trademark', label: 'UK trade mark application or certificate', reason: "The IPO has no public API, so we read your certificate and check its number on the IPO's page.", tier: 4 },
  text: [
    "We can't see a UK trade mark for {company}",
    "You haven't added a UK trade mark application or certificate. The UK IPO has no public lookup we can use, so we need it from you.",
    "Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.',
    "File for your brand with the UK IPO, or upload your certificate. We'll check its number on the IPO's page.",
  ],
});
b.doc({
  id: 'GB.IP.PATENTS', layer: 2, area: 'patents', stage: 3, title: 'Patent filings', noun: 'patent filings', sev: 'low', tier: 4, regulator: 'UK Intellectual Property Office', when: yes('answers.has_patentable_technology'), review: true,
  src: [['Section 9 —', 'Patent application; patent grant; assignment documentation'], ['6. Thresholds', 'Espacenet / EPO OPS terms']],
  slot: { id: 'gb_patents', label: 'Patent filing or grant', reason: 'You told us you have technology you might patent. Unpublished applications need an upload.', tier: 4 },
});
b.rule({
  id: 'GB.IP.FOUNDER_ASSIGNMENT', layer: 2, area: 'ip_ownership', stage: 1, title: "Founders' IP assignment", sev: 'critical', tier: 5,
  src: [['Section 9 —', 'Copyright ownership records; copyright assignment agreements; IP ownership and transfer documentation'], ['Section 17 —', 'Intellectual Property Assignment Agreement; Invention Assignment Agreement'], ['5. The core set', "Founders' agreement, founders' IP assignment, NDA template"]],
  sat: held('gb_founder_ip_assignment'), evidence: ['Signed IP assignment from each founder'], order: 'ip_assignment',
  slot: { id: 'gb_founder_ip_assignment', label: "Founders' IP assignments", reason: 'This is what makes the company the owner of what founders built, including before incorporation.' },
  text: [
    "Your founders haven't signed their work over to {company}",
    "You don't have a signed IP assignment from each founder.",
    'Without it, the founder may still own the code. Your company may not legally own the technology it is selling.',
    'It will be flagged in your first investor due diligence, and it has to be fixed before any round can close.',
    'Put a short assignment in writing, have each founder sign it, and add it here.',
  ],
});
b.rule({
  id: 'GB.IP.CONTRACTOR_ASSIGNMENT', layer: 2, area: 'ip_ownership', stage: 2, title: 'IP assignment from contractors', sev: 'critical', tier: 5, when: CONTRACTORS,
  src: [['Sections 7 and 13', '| Contractor agreements |'], ['Section 17 —', 'Intellectual Property Assignment Agreement; Invention Assignment Agreement']],
  law: [['Copyright, Designs and Patents Act 1988', 's90(3)']],
  sat: held('gb_contractor_ip_assignment'), evidence: ['Signed IP assignment from each contractor'], order: 'ip_assignment',
  slot: { id: 'gb_contractor_ip_assignment', label: 'Contractor IP assignments', reason: "Copyright stays with a contractor unless it's assigned in writing." },
  text: [
    "Your contractors may still own what they built for {company}",
    "You don't have a signed IP assignment from each contractor who has worked on your product.",
    "A contractor's work stays theirs unless they assign it to you in writing. A payment doesn't do it.",
    'It will be flagged in your first investor due diligence, and it has to be fixed before any round can close.',
    'Put an assignment in writing, have each contractor sign it, and add it here.',
  ],
});
b.doc({
  id: 'GB.IP.NDA', layer: 2, area: 'confidentiality', stage: 1, title: 'NDA template', sev: 'medium', tier: 5,
  src: [['Section 17 —', 'Non-Disclosure Agreement; Confidentiality Agreement'], ['5. The core set', "Founders' agreement, founders' IP assignment, NDA template"]],
  slot: { id: 'gb_nda', label: 'NDA template', reason: 'You need one before you share anything sensitive with partners, investors or hires.' },
});
b.doc({
  id: 'GB.IP.SOFTWARE_DEVELOPMENT', layer: 2, area: 'ip_ownership', stage: 2, title: 'Software development agreements', noun: 'software development agreements', sev: 'high', tier: 5, when: CONTRACTORS,
  src: [['Section 16 —', 'Software Development Agreement']],
  slot: { id: 'gb_software_dev', label: 'Software development agreements', reason: 'If an outside developer builds your product, this sets out what you own.' },
});
b.doc({
  id: 'GB.IP.SOFTWARE_LICENSING', layer: 2, area: 'ip_ownership', stage: 3, title: 'Software licences', noun: 'software licences', sev: 'medium', tier: 5,
  src: [['Section 9 —', 'Software licensing documentation'], ['Section 16 —', 'Software Licence Agreement']],
  slot: { id: 'gb_software_licences', label: 'Software licences', reason: 'Investors want to see what you license in and out.' },
});
b.doc({
  id: 'GB.IP.OPEN_SOURCE', layer: 2, area: 'open_source', stage: 3, title: 'Open source policy and licence register', noun: 'open source policy', sev: 'medium', tier: 5,
  src: [['Section 16 —', 'Open Source Software Policy; Open Source Software Licence Register']],
  slot: { id: 'gb_open_source', label: 'Open source policy and licence register', reason: 'Investors want to know your code has no licence problems hiding in it.' },
});
b.doc({
  id: 'GB.IP.ESCROW', layer: 2, area: 'enterprise', stage: 5, title: 'Software escrow agreement', sev: 'low', tier: 5, when: all(ENTERPRISE, yes('answers.enterprise_demands_escrow')),
  src: [['Section 16 —', 'Software Escrow Agreement']],
  slot: { id: 'gb_escrow', label: 'Software escrow agreement', reason: 'Some enterprise customers ask for this.' },
});

// --- Section 10: security ------------------------------------------------------------------------------

b.doc({
  id: 'GB.SEC.CYBER_ESSENTIALS', layer: 3, area: 'security', stage: 3, title: 'Cyber Essentials', noun: 'Cyber Essentials certificate', sev: 'medium', tier: 3, regulator: 'NCSC', when: ENTERPRISE, review: true,
  src: [['Section 10 —', 'Cyber Essentials certification; Cyber Essentials Plus'], ['6. Thresholds', 'IASME Cyber Essentials register']],
  slot: { id: 'gb_cyber_essentials', label: 'Cyber Essentials certificate', reason: 'Many public-sector contracts require it, and it renews every year.', tier: 4, expires: true },
});
b.doc({
  id: 'GB.SEC.POLICIES', layer: 3, area: 'security', stage: 3, title: 'Information security policies', noun: 'information security policies', sev: 'medium', tier: 5,
  src: [['Section 10 —', 'Cybersecurity compliance documentation; risk assessment; Information Security Policy'], ['Section 16 —', 'Cybersecurity Policy; Software Security Documentation']],
  slot: { id: 'gb_security_policies', label: 'Information security policies', reason: 'Enterprise customers and investors expect these in writing.' },
});
b.doc({
  id: 'GB.SEC.INCIDENT_RESPONSE', layer: 3, area: 'security', stage: 3, title: 'Incident response plan', sev: 'high', tier: 5,
  src: [['Section 10 —', 'Incident Response Plan']],
  slot: { id: 'gb_incident_response', label: 'Incident response plan', reason: 'You need to know who does what before something goes wrong.' },
});
b.doc({
  id: 'GB.SEC.CONTINUITY', layer: 3, area: 'security', stage: 5, title: 'Business continuity and disaster recovery plans', noun: 'continuity and disaster recovery plans', sev: 'low', tier: 5,
  src: [['Section 10 —', 'Business Continuity Plan; Disaster Recovery Plan']],
  slot: { id: 'gb_continuity', label: 'Business continuity and disaster recovery plans', reason: 'Larger customers ask what happens if your systems go down.' },
});
b.doc({
  id: 'GB.SEC.PEN_TESTS', layer: 3, area: 'security', stage: 4, title: 'Penetration test reports', noun: 'penetration test reports', sev: 'medium', tier: 5, raising: true,
  src: [['Section 10 —', 'Penetration testing reports']],
  slot: { id: 'gb_pen_tests', label: 'Penetration test reports', reason: 'Investors and enterprise customers expect to see these.' },
});
b.rule({
  id: 'GB.SEC.VULNERABILITY_DISCLOSURE', layer: 3, area: 'security', stage: 3, title: 'Vulnerability disclosure policy', sev: 'low', tier: 1, when: SITE,
  src: [['Section 16 —', 'Vulnerability Disclosure Policy']],
  sat: yes('web.policy.security_txt_found'), evidence: ['/.well-known/security.txt or a published policy'], action: 'fix_website',
  text: [
    "We can't find a way to report security issues to {company}",
    "We couldn't find a security.txt file or a published vulnerability policy on your site.",
    'It gives people who find a security problem a clear way to tell you.',
    'If they have no way to reach you, a problem can stay open or end up public.',
    'Publish a short policy and add a security.txt file to your site.',
  ],
});

// --- Sections 11 and 12: premises and health and safety ----------------------------------------------

b.doc({
  id: 'GB.PREMISES.PERMISSIONS', layer: 3, area: 'premises', stage: 2, title: 'Business premises permissions', noun: 'premises permissions', sev: 'low', tier: 4, regulator: 'Local authority', when: PREMISES,
  src: [['Section 11 —', 'Business premises registration; planning permission; change of use approval']],
  slot: { id: 'gb_premises', label: 'Business premises permissions', reason: 'What you need varies by council. Add what applies to your premises.', tier: 4 },
});
b.doc({
  id: 'GB.PREMISES.SAFETY', layer: 3, area: 'premises', stage: 2, title: 'Fire safety and premises safety records', noun: 'fire and premises safety records', sev: 'medium', tier: 5, regulator: 'Local authority', when: PREMISES,
  src: [['Section 11 —', 'Fire safety documentation; health and safety compliance documentation; waste management documentation']],
  slot: { id: 'gb_premises_safety', label: 'Fire and premises safety records', reason: 'If you occupy premises, you keep these on file.' },
});
b.doc({
  id: 'GB.EMP.HS_POLICY', layer: 3, area: 'health_safety', stage: 2, title: 'Health and safety policy', sev: 'medium', tier: 5, regulator: 'Health and Safety Executive', when: STAFF,
  src: [['Section 12 —', 'Health and Safety Policy']],
  slot: { id: 'gb_hs_policy', label: 'Health and safety policy', reason: 'A written policy is required at 5 or more employees.' },
});
b.doc({
  id: 'GB.EMP.RISK_ASSESSMENT', layer: 3, area: 'health_safety', stage: 2, title: 'Workplace risk assessments', noun: 'workplace risk assessments', sev: 'medium', tier: 5, regulator: 'Health and Safety Executive', when: any(STAFF, PREMISES),
  src: [['Section 12 —', 'Workplace risk assessment; DSE assessment; fire risk assessment']],
  slot: { id: 'gb_risk_assessments', label: 'Workplace risk assessments', reason: 'Screen work and fire risks count, even in an office.' },
});
b.doc({
  id: 'GB.EMP.ACCIDENT_RECORDS', layer: 3, area: 'health_safety', stage: 2, title: 'Accident and incident records', noun: 'accident records', sev: 'low', tier: 5, regulator: 'Health and Safety Executive', when: STAFF,
  src: [['Section 12 —', 'Accident and incident records; RIDDOR reporting']],
  slot: { id: 'gb_accident_records', label: 'Accident and incident records', reason: 'Employers keep these, and some incidents have to be reported.' },
});
b.doc({
  id: 'GB.EMP.SAFETY_TRAINING', layer: 3, area: 'health_safety', stage: 3, title: 'Workplace safety training records', noun: 'safety training records', sev: 'low', tier: 5, regulator: 'Health and Safety Executive', when: STAFF,
  src: [['Section 12 —', 'Workplace safety training records']],
  slot: { id: 'gb_safety_training', label: 'Safety training records', reason: 'Employers keep a record of what their team was shown.' },
});

// --- Sections 15 and 14: healthtech and other regulators --------------------------------------------

b.doc({
  id: 'GB.HEALTH.MHRA', layer: 3, area: 'healthtech', stage: 3, title: 'MHRA medical device registration', noun: 'MHRA registration', sev: 'critical', tier: 3, regulator: 'MHRA', when: HEALTH, review: true,
  src: [['Sections 15 and 14', 'MHRA medical device registration'], ['6. Thresholds', 'MHRA PARD export']],
  slot: { id: 'gb_mhra', label: 'MHRA registration', reason: 'Devices and software as a medical device are registered before going on the market.', tier: 4 },
});
b.doc({
  id: 'GB.HEALTH.CONFORMITY', layer: 3, area: 'healthtech', stage: 3, title: 'Conformity assessment and marking', noun: 'conformity assessment and marking records', sev: 'high', tier: 5, regulator: 'MHRA', when: HEALTH,
  src: [['Sections 15 and 14', 'Conformity assessment; UKCA marking; CE marking']],
  slot: { id: 'gb_conformity', label: 'Declaration of Conformity and technical documents', reason: 'These are what lets a medical device carry its mark.' },
});
b.doc({
  id: 'GB.HEALTH.CLINICAL_INVESTIGATION', layer: 3, area: 'healthtech', stage: 3, title: 'Clinical investigation approval', sev: 'high', tier: 4, regulator: 'MHRA', when: HEALTH,
  src: [['Sections 15 and 14', 'Clinical investigation approval']],
  slot: { id: 'gb_clinical_investigation', label: 'Clinical investigation approval', reason: 'Only applies if you run clinical investigations.', tier: 4 },
});
b.doc({
  id: 'GB.HEALTH.CQC', layer: 3, area: 'healthtech', stage: 2, title: 'CQC registration', sev: 'critical', tier: 1, regulator: 'Care Quality Commission', when: HEALTH, review: true,
  src: [['Sections 15 and 14', 'CQC registration'], ['6. Thresholds', 'CQC API status']],
  slot: { id: 'gb_cqc', label: 'CQC registration', reason: 'Regulated health activities need this.', tier: 4 },
});
b.doc({
  id: 'GB.HEALTH.NHS', layer: 3, area: 'healthtech', stage: 3, title: 'NHS compliance records', noun: 'NHS compliance records (DSPT, DTAC, DCB0129)', sev: 'high', tier: 4, regulator: 'NHS England', when: HEALTH, review: true,
  src: [['Sections 15 and 14', 'NHS England compliance documentation; DSPT; DTAC; DCB0129; DCB0160'], ['6. Thresholds', 'DSPT published status']],
  slot: { id: 'gb_nhs', label: 'NHS compliance records', reason: 'NHS customers ask for these before they buy.' },
});
b.doc({
  id: 'GB.SECTOR.PRA', layer: 3, area: 'banking', stage: 2, title: 'PRA authorisation', sev: 'critical', tier: 1, regulator: 'Prudential Regulation Authority', when: yes('derived.sector.banking'),
  src: [['Section 14 —', 'PRA authorisation']],
  slot: { id: 'gb_pra', label: 'PRA authorisation', reason: 'Only applies if the company itself is a bank.', tier: 4 },
});
b.doc({
  id: 'GB.SECTOR.GAMBLING', layer: 3, area: 'gambling', stage: 2, title: 'Gambling operating licence', sev: 'critical', tier: 3, regulator: 'Gambling Commission', when: yes('derived.sector.gambling'), review: true,
  src: [['Section 14 —', 'Gambling operating licence'], ['6. Thresholds', 'Gambling Commission and Ofgem register exports']],
  slot: { id: 'gb_gambling', label: 'Gambling operating licence', reason: 'Gambling products need this.', tier: 4 },
});
b.doc({
  id: 'GB.SECTOR.OFGEM', layer: 3, area: 'energy', stage: 2, title: 'Ofgem energy licence', sev: 'critical', tier: 3, regulator: 'Ofgem', when: yes('derived.sector.energy'), review: true,
  src: [['Section 14 —', 'Ofgem energy licence'], ['6. Thresholds', 'Gambling Commission and Ofgem register exports']],
  slot: { id: 'gb_ofgem', label: 'Ofgem energy licence', reason: 'Energy supply needs this.', tier: 4 },
});
b.doc({
  id: 'GB.CONSUMER.ASA', layer: 4, area: 'marketing', stage: 3, title: 'Advertising code compliance', noun: 'advertising compliance records', sev: 'low', tier: 5, regulator: 'Advertising Standards Authority', when: CONSUMER, review: true,
  src: [['Section 14 —', 'ASA Advertising Code compliance']],
  slot: { id: 'gb_asa', label: 'Advertising compliance records', reason: 'If you sell to consumers, your marketing should meet the Advertising Code.' },
});
b.doc({
  id: 'GB.CONSUMER.CMA', layer: 4, area: 'consumer_protection', stage: 3, title: 'Consumer law compliance', noun: 'consumer law records', sev: 'medium', tier: 5, regulator: 'Competition and Markets Authority', when: CONSUMER,
  src: [['Section 14 —', 'CMA competition and consumer law compliance']],
  law: [['Digital Markets, Competition and Consumers Act 2024']],
  slot: { id: 'gb_cma', label: 'Consumer law records', reason: 'Consumer law covers things like drip pricing and fake reviews.' },
});
b.doc({
  id: 'GB.CONSUMER.TRADING_STANDARDS', layer: 4, area: 'consumer_protection', stage: 3, title: 'Product and consumer compliance', noun: 'product compliance records', sev: 'medium', tier: 5, regulator: 'Trading Standards', when: all(CONSUMER, yes('derived.physical_products')),
  src: [['Section 14 —', 'Trading Standards product and consumer compliance']],
  slot: { id: 'gb_trading_standards', label: 'Product compliance records', reason: 'Physical products sold to consumers have their own safety rules.' },
});

// --- Section 16: AI and software ----------------------------------------------------------------------

b.doc({
  id: 'GB.AI.GOVERNANCE', layer: 6, area: 'ai_governance', stage: 5, title: 'AI governance policy', sev: 'medium', tier: 5, when: AI,
  src: [['Section 16 —', 'AI Governance Policy']],
  slot: { id: 'gb_ai_governance', label: 'AI governance policy', reason: 'As you scale, this shows who is responsible for your AI decisions.' },
});
b.doc({
  id: 'GB.AI.RISK_ASSESSMENT', layer: 6, area: 'ai_governance', stage: 3, title: 'AI risk and impact assessment', sev: 'medium', tier: 5, when: AI,
  law: [['UK GDPR', 'Art 22A-D']],
  src: [['Section 16 —', 'AI Risk Assessment; AI Impact Assessment']],
  slot: { id: 'gb_ai_risk', label: 'AI risk and impact assessment', reason: 'It records what could go wrong with your AI, and links to your DPIA.' },
});
b.rule({
  id: 'GB.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI transparency', sev: 'medium', tier: 1, when: AI,
  src: [['Section 16 —', 'AI Transparency Documentation']],
  sat: any(yes('web.policy.ai_disclosure_found'), held('gb_ai_transparency')), evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'gb_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI.' },
  text: [
    "We can't find AI disclosures for {company}",
    "You told us you use AI, and we couldn't find anything on your website that tells users about it.",
    'People should know when and how AI is being used in your product.',
    'Enterprise customers and investors are starting to ask for this.',
    'Add a short AI section to your site, or add the record here.',
  ],
});
b.doc({
  id: 'GB.AI.MODEL_DOCS', layer: 6, area: 'ai_governance', stage: 3, title: 'AI model and training data records', noun: 'AI model and training data records', sev: 'medium', tier: 5, when: AI,
  src: [['Section 16 —', 'AI Model Documentation; AI Training Data Documentation; AI Copyright and Licensing Records']],
  slot: { id: 'gb_ai_model_docs', label: 'AI model, training data and licensing records', reason: 'These show you have the rights to what your models were trained on.' },
});
b.doc({
  id: 'GB.AI.VENDORS', layer: 6, area: 'ai_governance', stage: 3, title: 'AI supplier agreements', noun: 'AI supplier agreements', sev: 'medium', tier: 5, when: yes('derived.ai_third_party_models'),
  src: [['Section 16 —', 'AI Supplier and Vendor Agreements']],
  slot: { id: 'gb_ai_vendors', label: 'AI supplier agreements', reason: 'If you use third-party models, these say what happens to your data and who owns the output.' },
});

// --- Sections 16 and 17: commercial documents and fundraising ---------------------------------------

b.rule({
  id: 'GB.COM.TERMS', layer: 4, area: 'terms', stage: 2, title: 'Website terms', sev: 'high', tier: 1, when: WEB,
  src: [['Section 17 —', 'Website Terms and Conditions'], ['Section 16 —', '| Terms of Service |']],
  sat: yes('web.policy.terms_found'), evidence: ['Published terms'], action: 'fix_website', order: 'terms_of_service',
  text: [
    "We can't find terms on {company}'s website",
    "We couldn't find published terms on your website.",
    'Your terms set the limits of what you owe your customers.',
    "Customers and investors will ask for them, and it's public, so it's easy to spot.",
    'Publish your terms and link them from your site footer.',
  ],
});
b.doc({
  id: 'GB.COM.SAAS', layer: 4, area: 'contracts', stage: 3, title: 'SaaS agreement', sev: 'medium', tier: 5, when: yes('derived.takes_payments'),
  src: [['Section 16 —', 'SaaS Agreement']],
  slot: { id: 'gb_saas', label: 'SaaS agreement', reason: 'It is the contract your customers sign, so investors read it.' },
});
b.doc({
  id: 'GB.COM.API_TERMS', layer: 4, area: 'terms', stage: 3, title: 'API terms', sev: 'medium', tier: 5, when: yes('derived.has_api'),
  src: [['Section 16 —', 'API Terms and Conditions']],
  slot: { id: 'gb_api_terms', label: 'API terms', reason: 'If others build on your API, this sets the rules.' },
});
b.rule({
  id: 'GB.COM.EULA', layer: 4, area: 'terms', stage: 3, title: 'End user licence agreement', sev: 'medium', tier: 1, when: yes('derived.has_app'),
  src: [['Section 16 —', 'End User Licence Agreement']],
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
  id: 'GB.COM.ACCEPTABLE_USE', layer: 4, area: 'terms', stage: 3, title: 'Acceptable use policy', sev: 'low', tier: 1, when: SITE,
  src: [['Section 16 —', 'Acceptable Use Policy']],
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
  id: 'GB.COM.SLA', layer: 4, area: 'contracts', stage: 3, title: 'Service level agreement', sev: 'low', tier: 5, when: ENTERPRISE,
  src: [['Section 16 —', 'Service Level Agreement']],
  slot: { id: 'gb_sla', label: 'Service level agreement', reason: 'Enterprise customers will want this before they sign.' },
});
b.doc({
  id: 'GB.COM.PRODUCT_LIABILITY', layer: 4, area: 'consumer_protection', stage: 3, title: 'Product liability and consumer records', noun: 'product liability records', sev: 'low', tier: 5, when: CONSUMER,
  src: [['Section 16 —', 'Product Liability and Consumer Compliance Documentation']],
  slot: { id: 'gb_product_liability', label: 'Product liability records', reason: 'If you sell to consumers, it helps to know where you stand.' },
});
b.doc({
  id: 'GB.COM.SUPPLIER', layer: 4, area: 'contracts', stage: 3, title: 'Commercial services and supplier agreements', noun: 'supplier agreements', sev: 'low', tier: 5,
  src: [['Section 17 —', 'Commercial Services Agreement; Supplier Agreement']],
  slot: { id: 'gb_supplier', label: 'Commercial and supplier agreements', reason: 'Investors want to see what you have agreed with your main partners.' },
});
b.rule({
  id: 'GB.CONSUMER.TERMS', layer: 4, area: 'consumer_terms', stage: 3, title: 'Consumer terms, refunds and complaints', sev: 'medium', tier: 1, when: CONSUMER, review: true,
  src: [['Section 17 —', 'Consumer Terms and Conditions; Refund and Cancellation Policy; Complaints Policy'], ['6. Thresholds', 'DMCC Act subscription-contract rules commencement']],
  law: [['Consumer Rights Act 2015'], ['Digital Markets, Competition and Consumers Act 2024']],
  sat: all(yes('web.policy.terms_found'), yes('web.policy.refund_policy_found'), yes('web.policy.complaints_policy_found')), evidence: ['Published consumer terms and policies'], action: 'fix_website',
  text: [
    "We can't find all of {company}'s consumer terms",
    "We couldn't find all of your consumer terms, refund policy and complaints policy on your website.",
    'Consumers need to see their rights, how to get a refund and how to complain.',
    'Disputes get harder to settle without them.',
    'Publish all three and link them from your site footer.',
  ],
});
b.rule({
  id: 'GB.COM.ACCESSIBILITY', layer: 4, area: 'accessibility', stage: 3, title: 'Accessibility statement', sev: 'low', tier: 1, when: WEB,
  src: [['Section 17 —', 'Website Accessibility Statement']],
  sat: yes('web.policy.accessibility_found'), evidence: ['Published statement'], action: 'fix_website',
  text: [
    "We can't find an accessibility statement on {company}'s website",
    "We couldn't find an accessibility statement.",
    'Public-sector bodies must have one, and others may need one by contract or as good practice.',
    'Public-sector and larger customers can ask for it.',
    'Publish a statement giving the WCAG version, conformance level, contact and date.',
  ],
});
b.doc({
  id: 'GB.EQUITY.SHAREHOLDERS_AGREEMENT', layer: 5, area: 'shareholders', stage: 2, title: "Shareholders' agreement", sev: 'medium', tier: 5,
  src: [['Section 17 —', "Shareholders' Agreement"]],
  slot: { id: 'gb_shareholders_agreement', label: "Shareholders' agreement", reason: 'It sets out what happens when a shareholder leaves or wants to sell.' },
});
b.doc({
  id: 'GB.EQUITY.OPTION_SCHEME', layer: 5, area: 'employee_equity', stage: 4, title: 'Share option scheme', sev: 'medium', tier: 5, when: yes('derived.equity_incentives'),
  src: [['Section 17 —', 'Share Option Plan; EMI Share Option Scheme documentation']],
  slot: { id: 'gb_option_scheme', label: 'Share option plan and EMI records', reason: 'Investors will check every option has a plan behind it, and EMI options have to be notified to HMRC.' },
});
b.rule({
  id: 'GB.FUND.ROUND_DOCUMENTS', layer: 5, area: 'fundraising', stage: 4, title: 'Round documents', sev: 'high', tier: 5, when: yes('derived.invested'),
  src: [['Section 17 —', 'Investment Agreement; SAFE Agreement; Convertible Loan Note Agreement; Subscription Agreement'], ['Section 1 —', 'Share allotment filings (SH01)']],
  sat: held('gb_round_documents'), evidence: ['Investment agreements', 'SH01 filings'],
  slot: { id: 'gb_round_documents', label: 'Investment, SAFE and loan note agreements', reason: 'These gave investors their rights. SH01 filings can back them up.' },
  text: [
    "We don't have the documents from {company}'s earlier rounds",
    "You told us you have raised or are raising, and you haven't added your investment documents.",
    'These show what investors were promised, and they should match the share allotments filed at Companies House.',
    'Investors in your next round will want the paper trail for every earlier one.',
    'Add your investment agreements, SAFEs or loan notes.',
  ],
});

export const gb = b.build();

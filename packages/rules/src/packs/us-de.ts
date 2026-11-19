import { all, any, auto, atLeast, held, MAPS, no, packBuilder, remind, told, yes } from './helper.js';

/** Delaware. Status never comes from scraping: see the map's "Delaware constraint". */
const b = packBuilder('US-DE', MAPS.delaware, { name: 'United States: Delaware', version: '0.2.0', inherits: ['US'] });

const V = 'registry.us.delaware_vendor';
const IS_CORP = yes('derived.is_corp');
const IS_LLC = yes('derived.is_llc');
const SITE = yes('derived.has_website_or_app');
const PD = yes('derived.personal_data');
const STAFF = yes('derived.employees');
const CONTRACTORS = yes('derived.contractors');
const DE_OPS = yes('derived.us.de_operations');
const DE_STAFF = yes('derived.us.de_employees');
const MULTI = yes('derived.us.multi_state');
const AI = yes('derived.uses_ai');
const DPDPA = yes('derived.us.dpdpa_in_scope');
const ENTERPRISE = yes('derived.enterprise');

// --- Section 1: Division of Corporations ---------------------------------------------------------

b.doc({
  id: 'US-DE.CORP.NAME_RESERVATION', layer: 1, area: 'formation', stage: 1, title: 'Company name reservation', sev: 'low', tier: 5, regulator: 'Delaware Division of Corporations', when: no('company.incorporated'),
  src: [['Section 1 —', 'Company name availability search; name reservation']],
  slot: { id: 'de_name_reservation', label: 'Name reservation receipt', reason: "Before you incorporate, this shows the name you want is held for you." },
});

b.rule({
  id: 'US-DE.CORP.ENTITY_ON_RECORD', layer: 1, area: 'formation', stage: 2, title: 'Delaware company record', sev: 'high', tier: 2, regulator: 'Delaware Division of Corporations',
  src: [['Section 1 —', 'Certificate of Incorporation (corporations) / Certificate of Formation (LLCs)'], ['5. The core set', 'Entity exists with a registered agent']],
  sat: any(yes(`${V}.found`), held('de_certificate_of_incorporation')), evidence: ['Licensed data provider record', 'Certificate of Incorporation or Formation'],
  slot: { id: 'de_certificate_of_incorporation', label: 'Certificate of Incorporation or Formation', reason: "It's the document that created your company. If our data provider can't find you, it settles the question.", tier: 4 },
  text: [
    "We can't find {company}'s Delaware record",
    "Our licensed data provider didn't return a record for {company}, and you haven't uploaded your certificate. That doesn't mean the company doesn't exist.",
    'Everything else in this scan rests on knowing the company is who it says it is.',
    "Banks and investors will ask for it first, and we can't check your other Delaware items without it.",
    'Upload your Certificate of Incorporation or Formation. We read the file number and date from it.',
  ],
});

b.rule({
  id: 'US-DE.CORP.REGISTERED_AGENT', layer: 1, area: 'formation', stage: 2, title: 'Registered agent in Delaware', sev: 'high', tier: 2, regulator: 'Delaware Division of Corporations',
  src: [['Section 1 —', 'Registered Agent appointment; Registered Office in Delaware'], ['5. The core set', 'Entity exists with a registered agent']],
  sat: any(yes(`${V}.registered_agent_present`), held('de_certificate_of_incorporation')), evidence: ['Licensed data provider record', 'Certificate of Incorporation or Formation'],
  text: [
    "We can't confirm {company}'s registered agent",
    "We couldn't confirm a registered agent and Delaware registered office for {company}.",
    'Every Delaware company has to keep an agent in the state to receive legal papers.',
    'If nobody receives legal papers for you, a claim or a tax notice can go unanswered.',
    'Upload your certificate or a letter from your agent, or appoint one if you no longer have one.',
  ],
});

b.doc({
  id: 'US-DE.CORP.INCORPORATOR', layer: 1, area: 'formation', stage: 2, title: 'Incorporator details', sev: 'low', tier: 4, regulator: 'Delaware Division of Corporations',
  src: [['Section 1 —', 'Incorporator details']], sat: held('de_certificate_of_incorporation'),
  slot: { id: 'de_certificate_of_incorporation', label: 'Certificate of Incorporation or Formation', reason: "It's the document that created your company. If our data provider can't find you, it settles the question.", tier: 4 },
});

b.rule({
  id: 'US-DE.CORP.GOOD_STANDING', layer: 1, area: 'standing', stage: 2, title: 'Certificate of Good Standing', sev: 'high', tier: 4, regulator: 'Delaware Division of Corporations',
  src: [['Section 1 —', '| Certificate of Good Standing |'], ['5. The core set', 'Certificate of Good Standing on file and validated'], ['1. How to read the map', 'The Delaware constraint']],
  rec: { type: 'every_years', from_fact: 'vault.de_good_standing.dated', years: 1, monitoring: remind },
  sat: yes('derived.us.good_standing_current'), verify: all(held('de_good_standing'), no('vault.de_good_standing.validated')),
  evidence: ['Certificate of Good Standing, confirmed on Delaware\'s validator'], order: 'de_good_standing',
  slot: { id: 'de_good_standing', label: 'Certificate of Good Standing', reason: "Delaware doesn't allow automatic status checks, so your certificate is how we know. Send a new one each year.", tier: 4, expires: true },
  text: [
    "We don't have a current Certificate of Good Standing for {company}",
    "You don't have a Certificate of Good Standing from the last 12 months on file.",
    "Delaware doesn't allow automatic status checks, so this certificate is the proof that your company is in good standing.",
    "Investors and banks will ask for a recent one, and you'll need one before every financing.",
    "Order one from Delaware and upload it. We'll confirm its number on Delaware's own website, then show it as certified on that date.",
  ],
});

b.doc({
  id: 'US-DE.CORP.CERTIFIED_COPIES', layer: 1, area: 'formation', stage: 2, title: 'Certified copies of incorporation documents', noun: 'certified incorporation documents', sev: 'low', tier: 4, regulator: 'Delaware Division of Corporations',
  src: [['Section 1 —', 'Certified copies of incorporation documents']],
  slot: { id: 'de_certified_copies', label: 'Certified copies of incorporation documents', reason: 'Banks and investors often ask for certified copies rather than plain ones.', tier: 4 },
});

b.doc({
  id: 'US-DE.CORP.BYLAWS', layer: 1, area: 'governance', stage: 2, title: 'Corporate bylaws', sev: 'high', tier: 5, when: IS_CORP,
  src: [['Section 1 —', 'Corporate Bylaws (corporations) / Operating Agreement (LLCs)'], ['5. The core set', 'Bylaws, organisational resolutions, stock ledger']],
  slot: { id: 'de_bylaws', label: 'Corporate bylaws', reason: "They're the rules for how your corporation is run, and investors read them." },
});
b.doc({
  id: 'US-DE.CORP.OPERATING_AGREEMENT', layer: 1, area: 'governance', stage: 2, title: 'LLC operating agreement', sev: 'high', tier: 5, when: IS_LLC,
  src: [['Section 1 —', 'Corporate Bylaws (corporations) / Operating Agreement (LLCs)']],
  slot: { id: 'de_operating_agreement', label: 'LLC operating agreement', reason: 'It sets out who owns the LLC and how decisions are made.' },
});
b.doc({
  id: 'US-DE.CORP.ORGANISATIONAL_RESOLUTIONS', layer: 1, area: 'governance', stage: 2, title: 'Organisational board and shareholder resolutions', noun: 'organisational resolutions', sev: 'high', tier: 5, when: IS_CORP,
  src: [['Section 1 —', 'Initial Board of Directors appointment; Initial Board Resolutions; Initial Shareholder Resolutions'], ['5. The core set', 'Bylaws, organisational resolutions, stock ledger']],
  slot: { id: 'de_organisational_resolutions', label: 'Organisational resolutions', reason: 'These are the first decisions that appointed your board and officers and issued your shares.' },
});
b.doc({
  id: 'US-DE.EQUITY.STOCK_ISSUANCE', layer: 5, area: 'cap_table', stage: 2, title: 'Stock issuance records', noun: 'stock issuance records', sev: 'high', tier: 5, when: IS_CORP,
  src: [['Section 1 —', 'Stock issuance documentation; stock certificates or electronic share records']],
  slot: { id: 'de_stock_issuance', label: 'Stock issuance records', reason: 'These show that your shares were properly issued, which every investor will check.' },
});
b.doc({
  id: 'US-DE.EQUITY.STOCK_LEDGER', layer: 5, area: 'cap_table', stage: 2, title: 'Stock ledger and cap table', sev: 'high', tier: 5, when: IS_CORP,
  src: [['Section 1 —', 'Stock ledger; register of shareholders'], ['5. The core set', 'Bylaws, organisational resolutions, stock ledger']],
  slot: { id: 'de_stock_ledger', label: 'Stock ledger or cap table', reason: 'It is the record of who owns what. Investors will not move without it.' },
});
b.doc({
  id: 'US-DE.CORP.OFFICER_RECORDS', layer: 1, area: 'governance', stage: 2, title: 'Director and officer records', noun: 'director and officer records', sev: 'medium', tier: 5,
  src: [['Section 1 —', 'Director and officer records']],
  slot: { id: 'de_officer_records', label: 'Director and officer records', reason: "Delaware doesn't publish directors except on the annual report, so we rely on your records." },
});
b.doc({
  id: 'US-DE.EQUITY.SHAREHOLDER_AGREEMENT', layer: 5, area: 'shareholders', stage: 2, title: 'Shareholder agreement', sev: 'medium', tier: 5, when: IS_CORP,
  src: [['Section 1 —', 'Shareholder Agreement']],
  slot: { id: 'de_shareholder_agreement', label: 'Shareholder agreement', reason: 'It sets out what happens when a shareholder leaves or wants to sell.' },
});

b.rule({
  id: 'US-DE.CORP.FRANCHISE_TAX', layer: 1, area: 'filings', stage: 2, title: 'Delaware annual report and franchise tax', sev: 'high', tier: 4, regulator: 'Delaware Division of Corporations', when: IS_CORP, penalty: 'moderate',
  src: [['Section 1 —', 'Annual Franchise Tax Report (corporations)'], ['Section 1 —', 'Annual Franchise Tax payment'], ['Section 24 —', 'Delaware Corporation Annual Report; Franchise Tax by 1 March']],
  params: { due: '1 March', report_fee_usd: 50, minimum_tax_usd: [175, 400], late_penalty_usd: 200, monthly_interest_percent: 1.5 },
  rec: { type: 'annual_fixed', month: 3, day: 1, monitoring: remind, done_fact: 'answers.franchise_tax_paid_on' },
  sat: held('de_franchise_tax'), evidence: ['Filed report or "Tax & History" lookup'], action: 'pay',
  slot: { id: 'de_franchise_tax', label: 'Franchise tax receipt or Tax & History lookup', reason: "Delaware keeps this behind a paid lookup, so we can't check it ourselves. Your receipt clears it.", tier: 4 },
  text: [
    "We can't see proof that {company}'s franchise tax is paid",
    "You haven't uploaded a receipt or Delaware's Tax & History lookup for your annual report and franchise tax.",
    "It's due on 1 March every year. Delaware keeps this behind a paid lookup, so we can't check it ourselves.",
    "Paying late costs a $200 penalty plus 1.5% interest a month, and an unpaid company loses its good standing.",
    'Upload the receipt from your last payment and this clears. The next payment is due 1 March.',
  ],
});
b.rule({
  id: 'US-DE.CORP.LLC_TAX', layer: 1, area: 'filings', stage: 2, title: 'Delaware LLC annual tax', sev: 'high', tier: 4, regulator: 'Delaware Division of Corporations', when: IS_LLC, penalty: 'moderate',
  src: [['Section 1 —', 'Annual LLC tax payment'], ['Section 24 —', 'Delaware LLC tax by 1 June']],
  params: { due: '1 June', amount_usd: 300 },
  rec: { type: 'annual_fixed', month: 6, day: 1, monitoring: remind, done_fact: 'answers.franchise_tax_paid_on' },
  sat: held('de_llc_tax'), evidence: ['LLC tax receipt'], action: 'pay',
  slot: { id: 'de_llc_tax', label: 'LLC tax receipt', reason: "Delaware doesn't publish this, so your receipt is the proof.", tier: 4 },
  text: [
    "We can't see proof that {company}'s LLC tax is paid",
    "You haven't uploaded a receipt for your Delaware LLC tax.",
    'Delaware LLCs pay $300 by 1 June every year.',
    "It affects your standing with the state, and you'll be asked for proof in due diligence.",
    'Upload your receipt and this clears. The next payment is due 1 June.',
  ],
});

// --- Section 3: Division of Revenue ----------------------------------------------------------------

b.doc({
  id: 'US-DE.TAX.BUSINESS_LICENSE', layer: 3, area: 'state_licence', stage: 2, title: 'Delaware business licence', sev: 'medium', tier: 4, regulator: 'Delaware Division of Revenue', when: DE_OPS, review: true,
  src: [['Section 3 —', 'Delaware Business License'], ['2. Consolidation notes', 'a Delaware business licence depends on doing business in Delaware'], ['6. Thresholds', 'Delaware business licence search']],
  rec: { type: 'expiry', fact: 'vault.de_business_license.expires_on', monitoring: remind },
  slot: { id: 'de_business_license',label: 'Delaware business licence', reason: 'You need one if you do business in Delaware, not just because you are incorporated there.', tier: 4, expires: true },
});
b.doc({
  id: 'US-DE.TAX.REGISTRATIONS', layer: 3, area: 'state_tax', stage: 2, title: 'Delaware tax registrations', noun: 'Delaware tax registrations', sev: 'medium', tier: 4, regulator: 'Delaware Division of Revenue', when: DE_OPS,
  src: [['Section 3 —', 'Business tax registration; Gross Receipts Tax registration']],
  slot: { id: 'de_tax_registrations', label: 'Delaware tax registrations (One Stop confirmation)', reason: 'Doing business in Delaware brings in gross receipts and corporate income tax registrations.', tier: 4 },
});
b.doc({
  id: 'US-DE.TAX.RETURNS', layer: 3, area: 'state_tax', stage: 3, title: 'Delaware tax returns', noun: 'Delaware tax returns', sev: 'medium', tier: 5, regulator: 'Delaware Division of Revenue', when: DE_OPS,
  src: [['Section 3 —', 'Delaware tax returns; Gross Receipts Tax returns'], ['Section 24 —', 'Delaware business licence renewal; Gross Receipts and corporate income tax returns']],
  rec: { type: 'periodic', every_months: 3, monitoring: remind },
  slot: { id: 'de_tax_returns', label: 'Delaware tax returns and payment records', reason: 'Once you operate in Delaware, you file these regularly.' },
});

// --- Section 5: Department of Labor ----------------------------------------------------------------

b.doc({
  id: 'US-DE.EMP.UI_REGISTRATION', layer: 3, area: 'employment', stage: 2, title: 'Delaware employer and unemployment insurance registration', noun: 'Delaware employer registration', sev: 'high', tier: 4, regulator: 'Delaware Department of Labor', when: DE_STAFF,
  src: [['Section 5 —', 'Employer registration; unemployment insurance registration and account number']],
  slot: { id: 'de_employer_registration', label: 'Delaware employer and unemployment insurance registration', reason: 'You need this if you have employees in Delaware.', tier: 4 },
});
b.doc({
  id: 'US-DE.EMP.WORKERS_COMP', layer: 3, area: 'employment', stage: 2, title: "Workers' compensation insurance", sev: 'high', tier: 4, regulator: 'Delaware Department of Labor', when: DE_STAFF, review: true,
  src: [['Section 5 —', "Workers' compensation registration; insurance policy"], ['6. Thresholds', 'Delaware workers']],
  rec: { type: 'expiry', fact: 'vault.de_workers_comp.expires_on', monitoring: remind },
  slot: { id: 'de_workers_comp', label: "Workers' compensation policy", reason: 'Employers with Delaware staff need this cover.', tier: 4, expires: true },
});
b.rule({
  id: 'US-DE.EMP.NEW_HIRE_REPORTING', layer: 3, area: 'employment', stage: 2, title: 'New hire reporting', sev: 'low', tier: 5, regulator: 'Delaware Department of Labor', when: DE_STAFF,
  src: [['Section 5 —', 'New hire reporting']],
  rec: { type: 'after_event', event_fact: 'answers.last_hire_on', days: 20, monitoring: remind },
  sat: told('de_new_hires_reported'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed your Delaware new hires are reported",
    "We don't have your confirmation that new Delaware hires are reported.",
    'Each new hire is reported within 20 days of starting.',
    "It's a simple step that's easy to forget as you hire.",
    'Report any missing hires, then confirm here.',
  ],
});
b.doc({
  id: 'US-DE.EMP.PAYROLL_RECORDS', layer: 3, area: 'employment', stage: 2, title: 'Delaware payroll and wage records', noun: 'Delaware payroll and wage records', sev: 'medium', tier: 5, regulator: 'Delaware Department of Labor', when: DE_STAFF,
  src: [['Section 5 —', 'Payroll records; employee wage records; UI contribution returns']],
  rec: { type: 'periodic', every_months: 3, monitoring: remind },
  slot: { id: 'de_payroll_records', label: 'Payroll, wage and unemployment contribution records', reason: 'Employers keep these and file contribution returns.' },
});
b.doc({
  id: 'US-DE.EMP.COMPLIANCE_DOCS', layer: 3, area: 'employment', stage: 2, title: 'Employment and workplace safety records', noun: 'employment and workplace safety records', sev: 'low', tier: 5, regulator: 'Delaware Department of Labor', when: STAFF,
  src: [['Section 5 —', 'Employment compliance documentation; workplace safety documentation']],
  slot: { id: 'de_employment_compliance', label: 'Employment and workplace safety records', reason: 'Any employer should be able to show how they look after their team.' },
});

// --- Section 6: Department of Insurance, Section 8: professional regulation -----------------------

b.doc({
  id: 'US-DE.SECTOR.INSURANCE_LICENCE', layer: 3, area: 'insurtech', stage: 2, title: 'Insurance producer, broker or agency licence', noun: 'insurance licence', sev: 'critical', tier: 3, regulator: 'Delaware Department of Insurance', when: yes('derived.sector.insurtech'), review: true,
  src: [['Section 6 —', 'Insurance producer, broker, agency licences'], ['6. Thresholds', 'DOI and NIPR access']],
  slot: { id: 'de_insurance_licence', label: 'Insurance licence', reason: 'Selling or arranging insurance needs a licence.', tier: 4 },
});
b.doc({
  id: 'US-DE.SECTOR.INSURTECH_APPROVALS', layer: 3, area: 'insurtech', stage: 2, title: 'Insurtech approvals and partnership approvals', noun: 'insurtech approvals', sev: 'high', tier: 4, regulator: 'Delaware Department of Insurance', when: yes('derived.sector.insurtech'),
  src: [['Section 6 —', 'Insurtech approvals; partnership approvals; insurance compliance documentation']],
  slot: { id: 'de_insurtech_approvals', label: 'Insurtech and partnership approvals', reason: 'These show that your insurance arrangements have been approved.', tier: 4 },
});
b.doc({
  id: 'US-DE.SECTOR.PROFESSIONAL_LICENCE', layer: 3, area: 'professional', stage: 2, title: 'Professional business licence', sev: 'high', tier: 3, regulator: 'Delaware Division of Professional Regulation', when: yes('derived.sector.professional'), review: true,
  src: [['Section 8 —', 'Professional business licence; provider registration; practice approvals; certifications'], ['6. Thresholds', 'DELPROS export']],
  slot: { id: 'de_professional_licence', label: 'Professional licence and approvals', reason: 'Regulated professions such as telehealth, accounting and engineering need these.', tier: 4 },
});
b.doc({
  id: 'US-DE.SECTOR.PROFESSIONAL_INSURANCE', layer: 3, area: 'professional', stage: 2, title: 'Professional liability insurance', sev: 'medium', tier: 4, regulator: 'Delaware Division of Professional Regulation', when: yes('derived.sector.professional'),
  src: [['Section 8 —', 'Professional liability insurance']],
  rec: { type: 'expiry', fact: 'vault.de_professional_insurance.expires_on', monitoring: remind },
  slot: { id: 'de_professional_insurance', label: 'Professional liability insurance certificate', reason: 'Regulated professions are expected to hold this cover.', tier: 4, expires: true },
});

// --- Section 7: Delaware privacy law, Section 22: cookie policy, data processing --------------------

b.doc({
  id: 'US-DE.DP.DPDPA', layer: 3, area: 'privacy', stage: 3, title: 'Delaware Personal Data Privacy Act compliance', noun: 'Delaware privacy law records', sev: 'high', tier: 5, regulator: 'Delaware Department of Justice', when: DPDPA, review: true, from: '2025-01-01',
  src: [['Section 7 —', 'Delaware Personal Data Privacy Act compliance'], ['6. Thresholds', 'DPDPA applicability thresholds']],
  params: { proposed_thresholds: { consumers: 35_000, consumers_with_sales: 10_000, sales_revenue_percent: 20 } },
  slot: { id: 'dpdpa_records', label: 'Delaware privacy law compliance records', reason: 'It applies once you hold data on enough Delaware consumers.' },
});
b.rule({
  id: 'US-DE.DP.PRIVACY_NOTICE', layer: 3, area: 'privacy', stage: 2, title: 'Privacy notice', sev: 'high', tier: 1, regulator: 'Delaware Department of Justice', when: SITE,
  src: [['Section 7 —', '| Privacy Notice |'], ['5. The core set', 'Privacy notice and cookie behaviour compliant']],
  sat: yes('web.policy.privacy_notice_found'), evidence: ['Your published privacy notice'], action: 'fix_website', order: 'privacy_notice',
  text: [
    "We can't find a privacy notice on {company}'s website",
    "We looked for a privacy notice on your website and couldn't find one.",
    'If you have users, you need to tell them what you do with their data. This is the first thing a regulator or partner looks at.',
    'Enterprise customers and investors will ask for it, and it is public, so anyone can see it is missing.',
    'Publish a privacy notice and link it from every page.',
  ],
});
b.rule({
  id: 'US-DE.DP.CCPA_CHOICES', layer: 3, area: 'privacy', stage: 3, title: 'California privacy choices', sev: 'high', tier: 1, regulator: 'California Privacy Protection Agency', when: yes('derived.us.is_ccpa_business'),
  src: [['Section 7 —', '| Privacy Notice |']],
  law: [['California Consumer Privacy Act']],
  sat: yes('web.policy.ccpa_links'), evidence: ['Links on your published website'], action: 'fix_website',
  text: [
    "We can't find the California privacy links on your website",
    "You appear to be above the California privacy law's thresholds, and we couldn't find the privacy links it expects on your site.",
    'Businesses in scope offer California users clear privacy choices on their website.',
    'It is visible to anyone who checks your site, regulators included.',
    'Add the links and the California details to your notice, then run the scan again.',
  ],
});
b.rule({
  id: 'US-DE.DP.CONSUMER_RIGHTS', layer: 3, area: 'privacy', stage: 3, title: 'Consumer data rights procedures', sev: 'medium', tier: 5, regulator: 'Delaware Department of Justice', when: DPDPA,
  src: [['Section 7 —', 'Consumer data rights procedures; access, deletion and correction procedures']],
  sat: all(told('de_consumer_rights_procedure'), yes('web.policy.rights_section')), evidence: ['Your confirmation', 'Rights section in your notice'], action: 'attest',
  text: [
    "We can't confirm how {company} handles data requests",
    "We don't have your confirmation of how you handle requests, or your notice doesn't explain people's rights.",
    'Consumers can ask to see, correct or delete their data, and you need a way to answer them.',
    "When the first request arrives you'll be working it out under a deadline.",
    'Write down your process, explain the rights in your notice, and confirm here.',
  ],
});
b.rule({
  id: 'US-DE.DP.OPT_OUT', layer: 3, area: 'privacy', stage: 3, title: 'Opt-out for targeted advertising and sales', sev: 'medium', tier: 1, regulator: 'Delaware Department of Justice', when: DPDPA, review: true,
  src: [['Section 7 —', 'Opt-out mechanisms for targeted advertising and sales'], ['6. Thresholds', 'universal opt-out effective date']],
  sat: yes('web.policy.opt_out_link'), evidence: ['Opt-out link on your site'], action: 'fix_website',
  text: [
    "We can't find an opt-out link on {company}'s website",
    "We couldn't find a way for consumers to opt out of targeted advertising or sales of their data.",
    'Companies in scope have to offer an opt-out and honour browser opt-out signals.',
    'It is easy to see from outside, so it is an easy thing for a regulator to find.',
    'Add an opt-out link and make sure your tags respect browser signals.',
  ],
});
b.rule({
  id: 'US-DE.DP.SENSITIVE_CONSENT', layer: 3, area: 'privacy', stage: 3, title: 'Consent for sensitive data', sev: 'high', tier: 5, regulator: 'Delaware Department of Justice', when: all(PD, yes('derived.sensitive_data')),
  src: [['Section 7 —', 'Sensitive data processing consent']],
  sat: told('sensitive_data_consent'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed you get consent for sensitive data",
    "You told us you handle sensitive data, and we don't have your confirmation that users consent to it.",
    'Sensitive categories need consent before you process them.',
    'Data collected without consent can be hard to keep using, and that can reach into your product.',
    'Check your sign-up flows ask for consent, then confirm here.',
  ],
});
b.doc({
  id: 'US-DE.DP.RISK_ASSESSMENTS', layer: 6, area: 'data_governance', stage: 3, title: 'Data protection risk assessments', noun: 'data protection risk assessments', sev: 'medium', tier: 5, regulator: 'Delaware Department of Justice', when: all(PD, yes('derived.high_risk_processing')),
  src: [['Section 7 —', 'Data protection risk assessments']],
  slot: { id: 'de_dp_risk_assessment', label: 'Data protection risk assessment', reason: 'Targeted advertising, sales, profiling and sensitive data call for a written risk assessment.' },
});
b.doc({
  id: 'US-DE.DP.COMPLAINTS', layer: 3, area: 'privacy', stage: 3, title: 'Privacy complaint handling procedures', noun: 'privacy complaint procedures', sev: 'low', tier: 5, regulator: 'Delaware Department of Justice', when: PD,
  src: [['Section 7 —', 'Consumer complaint handling procedures; privacy compliance documentation']],
  slot: { id: 'de_privacy_complaints', label: 'Privacy complaint procedures', reason: 'It helps to know who answers a privacy complaint before one arrives.' },
});
b.rule({
  id: 'US-DE.DP.COOKIE_POLICY', layer: 3, area: 'cookies', stage: 2, title: 'Cookie policy and behaviour', sev: 'medium', tier: 1, when: yes('derived.has_website'),
  src: [['Section 22 —', 'Privacy Policy; Cookie Policy; Terms of Service; Acceptable Use Policy'], ['5. The core set', 'Privacy notice and cookie behaviour compliant']],
  sat: yes('web.policy.cookie_policy_found'), evidence: ['Your published cookie policy'], action: 'fix_website',
  text: [
    "We can't find a cookie policy on {company}'s website",
    "We couldn't find a cookie policy on your website.",
    'People should be able to see which cookies you use and why.',
    "It's public, so it's one of the first things someone checks.",
    'Publish a cookie policy and link it from your footer. Check it matches the cookies you actually set.',
  ],
});
b.doc({
  id: 'US-DE.DP.PROCESSING_AGREEMENT', layer: 3, area: 'privacy', stage: 2, title: 'Data processing agreements', noun: 'data processing agreements', sev: 'medium', tier: 5, when: all(PD, yes('derived.has_processors')),
  src: [['Section 22 —', 'Data Processing Agreement']],
  slot: { id: 'de_dpa', label: 'Data processing agreements', reason: 'If vendors handle personal data for you, or you handle it for customers, this agreement sets the rules.' },
});

// --- Section 10 and sections 16/17: IP from people ---------------------------------------------------

b.rule({
  id: 'US-DE.IP.FOUNDER_ASSIGNMENT', layer: 2, area: 'ip_ownership', stage: 1, title: "Founders' IP assignment", sev: 'critical', tier: 5,
  src: [['Section 10 —', 'Copyright ownership documentation; assignment agreements; licensing agreements'], ['Sections 16 and 17', 'Employee Confidentiality Agreements; IP Assignment Agreements'], ['5. The core set', 'PIIA signed by every founder, employee and contractor']],
  law: [['17 U.S.C.', 's204(a)']],
  sat: held('de_founder_ip_assignment'), evidence: ['Signed IP assignment from each founder'], order: 'ip_assignment',
  slot: { id: 'de_founder_ip_assignment', label: "Founders' IP assignments", reason: 'A transfer of copyright has to be in writing, so this is what makes the company the owner of what founders built.' },
  text: [
    "Your founders haven't signed their work over to {company}",
    "You don't have a signed IP assignment from each founder for what they built, including anything from before the company existed.",
    'Without it, the founder may still own the code. Your company may not legally own the technology it is selling.',
    'It will be flagged in your first investor due diligence, and it has to be fixed before any round can close.',
    'Put a short assignment in writing, have each founder sign it, and add it here.',
  ],
});
b.rule({
  id: 'US-DE.IP.PIIA', layer: 2, area: 'ip_ownership', stage: 2, title: 'IP and confidentiality agreements with your team', sev: 'critical', tier: 5, when: yes('derived.team_or_contractors'),
  src: [['Sections 16 and 17', 'Employee Confidentiality Agreements; IP Assignment Agreements; Employee Invention Assignment Agreements'], ['5. The core set', 'PIIA signed by every founder, employee and contractor']],
  law: [['California Labor Code', 's2870']],
  sat: held('de_piia'), evidence: ['Signed agreement from each employee and contractor'], order: 'ip_assignment',
  slot: { id: 'de_piia', label: 'Signed invention assignment agreements (PIIA or CIIAA)', reason: 'Everyone who writes code or creates work for you should have signed it over to the company.' },
  text: [
    "Your team hasn't all signed their work over to {company}",
    "You don't have a signed invention assignment from everyone who has worked on your product.",
    'Without a signed agreement, the person who did the work may still own it.',
    'It will be flagged in due diligence, and getting signatures gets harder once someone has moved on.',
    'Use one standard agreement, have everyone sign it, and add the copies here.',
  ],
});
b.rule({
  id: 'US-DE.IP.WORK_FOR_HIRE', layer: 2, area: 'ip_ownership', stage: 2, title: 'Written assignment from contractors', sev: 'high', tier: 5, when: CONTRACTORS,
  src: [['Section 10 —', 'Work-for-hire agreements']],
  law: [['17 U.S.C.', 's204(a)'], ['California Labor Code', 's3351.5(c)']],
  sat: held('de_contractor_ip_assignment'), evidence: ['Contractor agreements with a written IP assignment'], order: 'ip_assignment',
  slot: { id: 'de_contractor_ip_assignment', label: 'Contractor agreements with written IP assignment', reason: "Contractor software usually isn't work-for-hire, so a written assignment is what moves ownership to you." },
  text: [
    "Your contractors may still own what they built for {company}",
    "You don't have contractor agreements with a written IP assignment on file.",
    "Software from a contractor usually isn't work-for-hire, so without a written assignment the contractor may still own it. A work-for-hire clause with a California contractor can also make them an employee.",
    'It will be flagged in your next due diligence, and it can hold up a round.',
    'Check that each contractor agreement assigns the IP in writing, get any missing assignments signed, and add them here.',
  ],
});
b.doc({
  id: 'US-DE.IP.SOFTWARE_DEVELOPMENT', layer: 2, area: 'ip_ownership', stage: 2, title: 'Software development agreements', noun: 'software development agreements', sev: 'high', tier: 5, when: CONTRACTORS,
  src: [['Section 21 —', 'Software Development Agreement']],
  slot: { id: 'de_software_dev_agreement', label: 'Software development agreements', reason: 'If an outside developer builds your product, this sets out what you own.' },
});
b.doc({
  id: 'US-DE.IP.TECH_TRANSFER', layer: 2, area: 'ip_ownership', stage: 2, title: 'Software IP assignment and technology transfer agreements', noun: 'technology transfer agreements', sev: 'high', tier: 5, when: yes('derived.foreign_tech'),
  src: [['Section 21 —', 'Software IP Assignment Agreement; Technology Transfer Agreement']],
  slot: { id: 'de_tech_transfer', label: 'Technology transfer agreements', reason: 'If IP moved across borders, such as from a Nigerian company to a Delaware parent, this is the record of it.' },
});
b.doc({
  id: 'US-DE.IP.NDA', layer: 2, area: 'confidentiality', stage: 1, title: 'NDA template', sev: 'medium', tier: 5,
  src: [['Section 22 —', 'NDA; Confidentiality Agreement'], ['5. The core set', 'NDA template']],
  slot: { id: 'de_nda', label: 'NDA template', reason: 'You need one before you share anything sensitive with partners, investors or hires.' },
});
b.doc({
  id: 'US-DE.IP.OPEN_SOURCE', layer: 2, area: 'open_source', stage: 3, title: 'Open source policy', sev: 'medium', tier: 5,
  src: [['Section 19 —', 'Open Source Software Compliance Policy']],
  slot: { id: 'de_open_source_policy', label: 'Open source policy or audit report', reason: 'Investors want to know your code has no licence problems hiding in it.' },
});
b.doc({
  id: 'US-DE.IP.ESCROW', layer: 2, area: 'enterprise', stage: 5, title: 'Source code escrow agreement', sev: 'low', tier: 5, when: all(ENTERPRISE, yes('answers.enterprise_demands_escrow')),
  src: [['Section 21 —', 'Source Code Escrow Agreement']],
  slot: { id: 'de_escrow', label: 'Source code escrow agreement', reason: 'Some enterprise customers ask for this.' },
});

// --- Section 15: other states --------------------------------------------------------------------------

b.rule({
  id: 'US-DE.STATE.FOREIGN_QUALIFICATION', layer: 1, area: 'state_registration', stage: 2, title: 'Registration in other states', sev: 'high', tier: 2, when: MULTI,
  src: [['Section 15 —', 'Foreign qualification in each state; Certificate of Authority'], ['Section 15 —', 'Registered agent in each state']],
  sat: any(atLeast(`${V}.other_state_registration_count`, 1), held('state_foreign_qualification')), evidence: ['Licensed data provider record', 'Certificate of Authority'], action: 'register',
  slot: { id: 'state_foreign_qualification', label: 'Certificates of Authority from other states', reason: 'If you do business in other states, you register there too. Our data provider may not cover every state.', tier: 4 },
  text: [
    "We can't see {company} registered in the other states you work in",
    "You told us you do business outside Delaware, and we can't see a registration in those states.",
    'Doing business in a state usually means registering there and keeping a registered agent in that state.',
    'A state can suspend your rights to do business there, which can surface when you try to enforce a contract.',
    'Register in each state where you do business, then upload the certificates.',
  ],
});
b.doc({
  id: 'US-DE.STATE.LICENCES_AND_TAX', layer: 3, area: 'state_tax', stage: 2, title: 'State business licences and tax registrations', noun: 'state licences and tax registrations', sev: 'medium', tier: 4, when: MULTI,
  src: [['Section 15 —', 'State business licence; state tax registration; state income tax registration']],
  slot: { id: 'state_tax_registrations', label: 'State business licences and tax registrations', reason: 'Each state where you operate has its own.', tier: 4 },
});
b.doc({
  id: 'US-DE.STATE.SALES_TAX', layer: 3, area: 'state_tax', stage: 3, title: 'Sales and use tax registration', noun: 'sales tax permits', sev: 'medium', tier: 4, when: MULTI, review: true,
  src: [['Section 15 —', 'Sales and Use Tax registration'], ['6. Thresholds', 'Economic-nexus thresholds for sales tax']],
  rec: { type: 'periodic', every_months: 3, monitoring: remind },
  slot: { id: 'state_sales_tax', label: 'Sales tax permits', reason: 'SaaS is taxable in some states once your sales there pass a threshold.', tier: 4 },
});
b.doc({
  id: 'US-DE.STATE.EMPLOYER', layer: 3, area: 'employment', stage: 2, title: 'State employer registrations', noun: 'state employer registrations', sev: 'high', tier: 4, when: all(STAFF, MULTI),
  src: [['Section 15 —', 'State employer registration; state unemployment insurance']],
  slot: { id: 'state_employer', label: 'State employer, unemployment and workers\' compensation registrations', reason: 'Every state where you employ someone has its own registrations.', tier: 4 },
});
b.rule({
  id: 'US-DE.STATE.ANNUAL_REPORTS', layer: 1, area: 'state_registration', stage: 2, title: 'State annual reports', sev: 'medium', tier: 2, when: MULTI,
  src: [['Section 15 —', 'State annual reports; state franchise tax returns'], ['Section 24 —', 'State foreign qualification renewals; state annual reports; state franchise tax']],
  rec: { type: 'registry_date', fact: `${V}.next_report_due`, monitoring: auto('our licensed data provider') },
  sat: held('state_annual_reports'), evidence: ['Filed state reports'], action: 'file',
  slot: { id: 'state_annual_reports', label: 'State annual reports and franchise tax returns', reason: 'Each state has its own annual filing, and missing one can suspend you there.', tier: 4 },
  text: [
    "We don't have {company}'s state annual reports on file",
    "You don't have annual reports on file for the other states you work in.",
    'States where you are registered usually ask for their own annual filing.',
    'A missed filing can suspend your registration in that state.',
    "Add your latest filings. Where our data provider gives a date, we'll track the next one.",
  ],
});

// --- Sections 16/17: employment documents ----------------------------------------------------------------

b.doc({
  id: 'US-DE.EMP.AGREEMENTS', layer: 4, area: 'employment_contracts', stage: 2, title: 'Employment agreements', noun: 'employment agreements', sev: 'high', tier: 5, when: STAFF,
  src: [['Sections 16 and 17', '| Employment agreements |']],
  slot: { id: 'de_employment_agreements', label: 'Employment agreements', reason: 'Each employee should have one, with IP assignment in the offer letter.' },
});
b.doc({
  id: 'US-DE.EMP.CONTRACTOR_AGREEMENTS', layer: 4, area: 'employment_contracts', stage: 2, title: 'Independent contractor agreements', noun: 'contractor agreements', sev: 'high', tier: 5, when: CONTRACTORS,
  src: [['Sections 16 and 17', 'Independent Contractor Agreements']],
  slot: { id: 'de_contractor_agreements', label: 'Independent contractor agreements', reason: 'Each contractor should have one, with IP assignment and clear terms.' },
});
b.doc({
  id: 'US-DE.EMP.HANDBOOK', layer: 4, area: 'employment_contracts', stage: 5, title: 'Employee handbook', sev: 'low', tier: 5, when: STAFF,
  src: [['Sections 16 and 17', 'Employee Handbook']],
  slot: { id: 'de_handbook', label: 'Employee handbook', reason: 'As you grow, it keeps your policies in one place.' },
});
b.doc({
  id: 'US-DE.EMP.ONBOARDING', layer: 4, area: 'employment_contracts', stage: 2, title: 'Employee onboarding records', noun: 'employee onboarding records', sev: 'low', tier: 5, when: STAFF,
  src: [['Sections 16 and 17', 'Employee onboarding documentation']],
  slot: { id: 'de_onboarding', label: 'Employee onboarding records', reason: 'A simple checklist means no new hire misses a signature.' },
});

// --- Section 19: security ---------------------------------------------------------------------------------

b.doc({
  id: 'US-DE.SEC.POLICIES', layer: 3, area: 'security', stage: 3, title: 'Information security policies', noun: 'information security policies', sev: 'medium', tier: 5,
  src: [['Section 19 —', 'Cybersecurity Policy; Information Security Policy; Access Control Policy']],
  slot: { id: 'de_security_policies', label: 'Information security policies', reason: 'Enterprise customers and investors expect these in writing.' },
});
b.doc({
  id: 'US-DE.SEC.INCIDENT_RESPONSE', layer: 3, area: 'security', stage: 3, title: 'Incident response plan', sev: 'high', tier: 5,
  src: [['Section 19 —', 'Incident Response Plan; Data Breach Response Policy']],
  slot: { id: 'de_incident_response', label: 'Incident response and data breach plan', reason: 'State breach-notification laws apply in all 50 states, so you need a plan before something happens.' },
});
b.doc({
  id: 'US-DE.SEC.CONTINUITY', layer: 3, area: 'security', stage: 5, title: 'Business continuity and disaster recovery plans', noun: 'continuity and disaster recovery plans', sev: 'low', tier: 5,
  src: [['Section 19 —', 'Business Continuity Plan; Disaster Recovery Plan']],
  slot: { id: 'de_continuity', label: 'Business continuity and disaster recovery plans', reason: 'Larger customers ask what happens if your systems go down.' },
});
b.rule({
  id: 'US-DE.SEC.VULNERABILITY_DISCLOSURE', layer: 3, area: 'security', stage: 3, title: 'Vulnerability disclosure policy', sev: 'low', tier: 1, when: SITE,
  src: [['Section 19 —', 'Vulnerability Disclosure Policy']],
  sat: yes('web.policy.security_txt_found'), evidence: ['/.well-known/security.txt or a published policy'], action: 'fix_website',
  text: [
    "We can't find a way to report security issues to {company}",
    "We couldn't find a security.txt file or a published vulnerability policy on your site.",
    'It gives people who find a security problem a clear way to tell you.',
    'If they have no way to reach you, a problem can stay open or end up public.',
    'Publish a short policy and add a security.txt file to your site.',
  ],
});
b.doc({
  id: 'US-DE.SEC.PEN_TESTS', layer: 3, area: 'security', stage: 4, title: 'Penetration test and security audit reports', noun: 'penetration test and security audit reports', sev: 'medium', tier: 5, raising: true,
  src: [['Section 19 —', 'Penetration Testing Reports; Security Audit Reports; Vendor Security Assessment']],
  slot: { id: 'de_pen_tests', label: 'Penetration test and security audit reports', reason: 'Investors and enterprise customers expect to see these.' },
});
b.doc({
  id: 'US-DE.SEC.SOC2', layer: 3, area: 'security', stage: 4, title: 'SOC 2 report', sev: 'medium', tier: 4, when: ENTERPRISE,
  src: [['Section 19 —', 'SOC 2 Type I / Type II reports']],
  slot: { id: 'de_soc2', label: 'SOC 2 report', reason: "Enterprise customers often ask for one. It's confidential, so we keep it private.", tier: 4, expires: true },
});
b.doc({
  id: 'US-DE.SEC.ISO27001', layer: 3, area: 'security', stage: 5, title: 'ISO 27001 or 27701 certificate', sev: 'low', tier: 4, when: ENTERPRISE, review: true,
  src: [['Section 19 —', 'ISO/IEC 27001; ISO/IEC 27701 certification'], ['6. Thresholds', 'IAF CertSearch']],
  slot: { id: 'de_iso27001', label: 'ISO 27001 or 27701 certificate', reason: 'Some enterprise customers ask for it.', tier: 4, expires: true },
});
b.doc({
  id: 'US-DE.SEC.PCI', layer: 3, area: 'security', stage: 3, title: 'PCI DSS attestation', sev: 'high', tier: 4, when: yes('derived.sector.payments'), review: true,
  src: [['Section 19 —', 'PCI DSS compliance'], ['6. Thresholds', 'card-network PCI service-provider lists']],
  slot: { id: 'de_pci', label: 'PCI DSS Attestation of Compliance', reason: 'If you handle or store card data, card networks expect this.', tier: 4, expires: true },
});
b.doc({
  id: 'US-DE.SEC.TRAINING', layer: 3, area: 'security', stage: 3, title: 'Security awareness training records', noun: 'security training records', sev: 'low', tier: 5, when: STAFF,
  src: [['Section 19 —', 'Security Awareness Training']],
  slot: { id: 'de_security_training', label: 'Security training records', reason: 'Enterprise questionnaires ask whether your team is trained.' },
});

// --- Section 21: AI and software --------------------------------------------------------------------------

b.doc({
  id: 'US-DE.AI.ACCEPTABLE_USE', layer: 6, area: 'ai_governance', stage: 2, title: 'AI acceptable use policy', sev: 'medium', tier: 5, when: yes('derived.ai_or_staff_ai'),
  src: [['Section 21 —', 'AI Acceptable Use Policy']],
  slot: { id: 'de_ai_aup', label: 'AI acceptable use policy', reason: 'It tells your team what they can and cannot put into AI tools.' },
});
b.doc({
  id: 'US-DE.AI.RISK_ASSESSMENT', layer: 6, area: 'ai_governance', stage: 3, title: 'AI risk assessment', sev: 'medium', tier: 5, when: AI, review: true,
  src: [['Section 21 —', 'AI Risk Assessment'], ['6. Thresholds', 'Colorado SB 26-189 effective date']],
  slot: { id: 'de_ai_risk', label: 'AI risk assessment', reason: 'It records what could go wrong with your AI and what you do about it.' },
});
b.doc({
  id: 'US-DE.AI.MODEL_DOCS', layer: 6, area: 'ai_governance', stage: 3, title: 'AI model and training data records', noun: 'AI model and training data records', sev: 'medium', tier: 5, when: AI,
  src: [['Section 21 —', 'AI Model Documentation; AI Training Data Documentation; AI Copyright and Licensing Records']],
  slot: { id: 'de_ai_model_docs', label: 'AI model, training data and licensing records', reason: 'These show you have the rights to what your models were trained on.' },
});
b.rule({
  id: 'US-DE.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI transparency', sev: 'medium', tier: 1, when: AI, review: true,
  src: [['Section 21 —', 'AI Transparency Documentation'], ['6. Thresholds', 'California AI Transparency Act timing']],
  sat: any(yes('web.policy.ai_disclosure_found'), held('de_ai_transparency')), evidence: ['Published AI disclosures'], action: 'fix_website',
  slot: { id: 'de_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI.' },
  text: [
    "We can't find AI disclosures for {company}",
    "You told us you use AI, and we couldn't find anything on your website that tells users about it.",
    'People should know when and how AI is being used in your product.',
    'Enterprise customers and investors are starting to ask for this.',
    'Add a short AI section to your site, or add the record here.',
  ],
});
b.doc({
  id: 'US-DE.AI.VENDOR_AGREEMENTS', layer: 6, area: 'ai_governance', stage: 3, title: 'AI vendor agreements', noun: 'AI vendor agreements', sev: 'medium', tier: 5, when: yes('derived.ai_third_party_models'),
  src: [['Section 21 —', 'AI Vendor Agreements; AI Supplier Agreements']],
  slot: { id: 'de_ai_vendors', label: 'AI vendor agreements', reason: 'If you use third-party models, these say what happens to your data and who owns the output.' },
});
b.doc({
  id: 'US-DE.AI.GOVERNANCE', layer: 6, area: 'ai_governance', stage: 5, title: 'AI governance policy', sev: 'medium', tier: 5, when: AI,
  src: [['Section 21 —', 'AI Governance Policy; AI Safety and Security Policy']],
  slot: { id: 'de_ai_governance', label: 'AI governance policy', reason: 'As you scale, this shows who is responsible for your AI decisions.' },
});

// --- Commercial documents -----------------------------------------------------------------------------------

b.rule({
  id: 'US-DE.COM.TERMS', layer: 4, area: 'terms', stage: 3, title: 'Terms of service', sev: 'high', tier: 1, when: SITE,
  src: [['Section 21 —', 'SaaS Agreement; Product Terms and Conditions; Website Terms of Service']],
  sat: yes('web.policy.terms_found'), evidence: ['Published terms'], action: 'fix_website', order: 'terms_of_service',
  text: [
    "We can't find terms of service on {company}'s website",
    "We couldn't find published terms of service.",
    'Your terms set the limits of what you owe your customers. Without them, you may have no limit on liability.',
    "Customers and investors will ask for them, and it's public, so it's easy to spot.",
    'Publish your terms and link them from your site footer.',
  ],
});
b.rule({
  id: 'US-DE.COM.API_LICENCE', layer: 4, area: 'terms', stage: 3, title: 'API licence agreement', sev: 'medium', tier: 5, when: yes('derived.has_api'),
  src: [['Section 21 —', 'API Licence Agreement']],
  sat: any(held('de_api_licence')), evidence: ['API terms'],
  slot: { id: 'de_api_licence', label: 'API licence agreement', reason: 'If others build on your API, this sets the rules.' },
  text: [
    "We don't have {company}'s API terms on file",
    "You offer an API, and you don't have API licence terms on file.",
    'These say what developers can do with your API, and what you are responsible for.',
    'It tends to come up when a larger partner reads your paperwork.',
    'Add your API terms here. If you publish them, tell us where.',
  ],
});
b.rule({
  id: 'US-DE.COM.EULA', layer: 4, area: 'terms', stage: 3, title: 'End user licence agreement', sev: 'medium', tier: 1, when: yes('derived.has_app'),
  src: [['Section 21 —', 'End User Licence Agreement']],
  sat: yes('web.policy.eula_found'), evidence: ['Published EULA or App Store listing'], action: 'fix_website',
  text: [
    "We can't find an end user licence for {company}'s app",
    "You told us you have an app, and we couldn't find a published licence for it.",
    'It sets the terms on which people can use your app.',
    'App stores and larger customers can ask for it.',
    'Publish your licence and link it from your site and your App Store listing.',
  ],
});
b.doc({
  id: 'US-DE.COM.ENTERPRISE_CONTRACTS', layer: 4, area: 'contracts', stage: 3, title: 'Software licence, cloud services and service level agreements', noun: 'software licence and service level agreements', sev: 'medium', tier: 5, when: ENTERPRISE,
  src: [['Section 21 —', 'Software Licence Agreement; Cloud Services Agreement; Service Level Agreement']],
  slot: { id: 'de_enterprise_contracts', label: 'Software licence, cloud and service level agreements', reason: 'Enterprise customers will want these before they sign.' },
});
b.doc({
  id: 'US-DE.COM.COMMERCIAL_AGREEMENTS', layer: 4, area: 'contracts', stage: 3, title: 'Commercial agreements', noun: 'commercial agreements', sev: 'low', tier: 5,
  src: [['Section 22 —', 'Consultancy Agreement; Supplier Agreement; Commercial Partnership Agreement']],
  slot: { id: 'de_commercial_agreements', label: 'Supplier, partner and reseller agreements', reason: 'Investors want to see what you have agreed with your main partners.' },
});
b.doc({
  id: 'US-DE.COM.MERCHANT', layer: 4, area: 'payments', stage: 3, title: 'Merchant and payment processor agreements', noun: 'payment processor agreements', sev: 'medium', tier: 5, when: yes('derived.takes_payments'),
  src: [['Section 23 —', 'Merchant account; payment processor agreements; Stripe or gateway onboarding documentation']],
  slot: { id: 'de_merchant', label: 'Merchant and payment processor agreements', reason: 'These are what lets you take payments, and they can end quickly if you breach them.' },
});

// --- Section 22: founders and fundraising ----------------------------------------------------------------------

b.doc({
  id: 'US-DE.CORP.FOUNDERS_AGREEMENT', layer: 1, area: 'founders', stage: 1, title: "Founders' agreement", sev: 'high', tier: 5,
  src: [['Section 22 —', "Founders' Agreement; Founder Vesting Agreement"]],
  slot: { id: 'de_founders_agreement', label: "Founders' agreement and vesting", reason: 'It settles who owns what and what happens if a founder leaves.' },
});
b.doc({
  id: 'US-DE.EQUITY.STOCK_PURCHASE', layer: 5, area: 'founder_equity', stage: 2, title: 'Founder stock purchase agreements', noun: 'founder stock purchase agreements', sev: 'high', tier: 5, when: IS_CORP,
  src: [['Section 22 —', 'Stock Purchase Agreement; Restricted Stock Purchase Agreement']],
  slot: { id: 'de_stock_purchase', label: 'Founder stock purchase agreements', reason: 'These show how founders got their shares, and any vesting.' },
});
b.doc({
  id: 'US-DE.EQUITY.OPTION_PLAN', layer: 5, area: 'employee_equity', stage: 4, title: 'Stock option plan', sev: 'medium', tier: 5, when: all(IS_CORP, yes('derived.equity_incentives')),
  src: [['Section 22 —', 'Stock Option Plan; Equity Incentive Plan; Stock Option Grant Agreements']],
  slot: { id: 'de_option_plan', label: 'Stock option plan and grants', reason: 'Investors will check every option has a plan and a board approval behind it.' },
});
b.doc({
  id: 'US-DE.EQUITY.INVESTOR_AGREEMENTS', layer: 5, area: 'fundraising', stage: 4, title: 'Investor rights, voting and co-sale agreements', noun: 'priced round agreements', sev: 'high', tier: 5, when: yes('derived.priced_round'),
  src: [['Section 22 —', 'Investor Rights Agreement; Voting Agreement; ROFR and Co-Sale Agreement']],
  slot: { id: 'de_investor_agreements', label: 'Investor rights, voting and co-sale agreements', reason: 'These set out the rights your investors hold.' },
});
b.doc({
  id: 'US-DE.CORP.DIRECTOR_SERVICE', layer: 1, area: 'governance', stage: 5, title: 'Director service agreements', noun: 'director service agreements', sev: 'low', tier: 5,
  src: [['Section 22 —', 'Director Service Agreements']],
  slot: { id: 'de_director_service', label: 'Director service agreements', reason: 'As the board grows, these set out what each director is there to do.' },
});

// --- Section 23: banking ---------------------------------------------------------------------------------------------

b.rule({
  id: 'US-DE.CORP.BANK_ACCOUNT', layer: 1, area: 'banking', stage: 2, title: 'Corporate bank account', sev: 'medium', tier: 5,
  src: [['Section 23 —', 'Corporate bank account; bank account authorisation; wire transfer authorisation']],
  sat: told('corporate_bank_account'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has its own bank account",
    "We don't have your confirmation that a bank account is open in the company's name.",
    "A separate account keeps company and personal money apart.",
    'Investors will expect one, and they send money to the company, not to a founder.',
    'Open an account in the company name, then confirm here.',
  ],
});
b.doc({
  id: 'US-DE.CORP.BANK_RESOLUTION', layer: 1, area: 'banking', stage: 2, title: 'Board resolution for the bank account', sev: 'low', tier: 5, when: IS_CORP,
  src: [['Section 23 —', 'Board resolution authorising the bank account']],
  slot: { id: 'de_bank_resolution', label: 'Board resolution for the bank account', reason: 'Banks ask for it, and it shows who can sign for the company.' },
});
b.doc({
  id: 'US-DE.CORP.FINANCIAL_RECORDS', layer: 1, area: 'finance', stage: 3, title: 'Corporate financial records', noun: 'financial records', sev: 'medium', tier: 5,
  src: [['Section 23 —', 'Business credit documentation; corporate financial records']],
  rec: { type: 'after_year_end', months: 12, monitoring: remind },
  slot: { id: 'de_financial_records', label: 'Annual financial statements and records', reason: 'Investors will want to see these.' },
});

export const usDelaware = b.build();

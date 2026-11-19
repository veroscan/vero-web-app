import { all, any, held, MAPS, no, packBuilder, remind, told, yes } from './helper.js';

/**
 * Kenya (private company limited by shares, Companies Act 2015). Draft, version 0.1.0: every rule
 * waits for a Kenyan lawyer. Encoded from docs/knowledge/vero-scan-kenya-rule-pack-map.md; the
 * items left out, and why, are listed at the end of that map ("Not encoded").
 *
 * No Kenyan register is connected: BRS publishes no company-search API, the official search
 * (CR12) needs an eCitizen login and a fee, and the ODPC's list of registered data handlers sits
 * behind a bot check (map note 1). So registration, officers and filings are documents, and ODPC
 * registration is proved by its certificate.
 */
const b = packBuilder('KE', MAPS.kenya, { name: 'Kenya', version: '0.1.0' });

const BRS = 'Business Registration Service';
const ODPC = 'Office of the Data Protection Commissioner';
const KRA = 'Kenya Revenue Authority';
const S1 = 'Section 1 —';
const S2 = 'Section 2 —';
const S3 = 'Section 3 —';
const S4 = 'Section 4 —';
const S5 = 'Section 5 —';
const S6 = 'Section 6 —';
const S7 = 'Section 7 —';
const S8 = 'Section 8 —';
const S9 = 'Section 9 —';
const S10 = 'Section 10 —';
const S11 = 'Section 11 —';

const PD = yes('derived.personal_data');
const STAFF = yes('derived.employees');
const CONSUMER = yes('derived.consumer');
const SITE = yes('derived.has_website_or_app');
const INVESTED = yes('derived.invested');

const CR12 = {
  id: 'ke_cr12', label: 'Official search (CR12) from BRS, recent', tier: 4 as const,
  reason: 'The BRS register is not connected. A recent CR12 shows the current directors, secretary and shareholders.',
};

// --- Section 1: register and status -----------------------------------------------------------------

b.doc({
  id: 'KE.CORP.INCORPORATION', layer: 1, area: 'standing', stage: 2, title: 'Certificate of incorporation', noun: 'certificate of incorporation', sev: 'high', tier: 4, regulator: BRS,
  src: [[S1, 'Incorporated by the Registrar of Companies through BRS eCitizen'], [S1, 'Private limited company name ends with "limited" or "ltd."']],
  slot: { id: 'ke_incorporation_certificate', label: 'Certificate of incorporation', reason: 'It shows the company was registered by the Registrar of Companies, under a name ending in "Limited".', tier: 4 },
  ifLeft: "It's the first thing a bank, investor or buyer asks for.",
  fix: 'Download the certificate from your BRS account on eCitizen and add it here.',
});
b.rule({
  id: 'KE.CORP.REGISTERED_OFFICE', layer: 1, area: 'filings', stage: 2, title: 'Registered office kept', sev: 'medium', tier: 5, regulator: BRS,
  src: [[S1, 'Registered office kept at all times for communications and notices']],
  sat: told('ke_registered_office'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps its registered office up to date",
    "We don't have your confirmation that the company has a registered office for notices, and that the Registrar has the current address.",
    'Every company keeps a registered office at all times. A new address takes effect only once the Registrar registers it.',
    'Official notices and legal papers go there, and a stale address means you miss them.',
    'Check the address on your CR12, file a change through BRS if needed, then confirm here.',
  ],
});
b.rule({
  id: 'KE.CORP.OPERATING_LIST', layer: 1, area: 'standing', stage: 2, title: "Not on the Registrar's list of companies that may not be operating", sev: 'high', tier: 5, regulator: BRS,
  src: [[S1, "Not named on the Registrar's list of companies that may not be operating"]],
  sat: told('ke_not_on_operating_list'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} is not on the Registrar's notice of companies that may not be operating",
    "We don't have your confirmation that the company is not named on the Registrar's notice. We don't search the BRS site ourselves.",
    'The Registrar publishes companies that may not be operating, for example for missing filings, and can strike them off.',
    'A company struck off loses its legal existence and its assets.',
    "Check the company's name on the BRS Compliance Check search, then confirm here.",
  ],
});

// --- Section 2: articles, members and beneficial owners ------------------------------------------------

b.doc({
  id: 'KE.CORP.ARTICLES', layer: 1, area: 'governance', stage: 2, title: 'Articles of association', noun: 'articles of association', sev: 'high', tier: 4, regulator: BRS,
  src: [[S2, 'Memorandum and articles lodged with the registration application']],
  slot: { id: 'ke_articles', label: 'Memorandum and articles of association, current version', reason: 'The articles lodged with the registration are the company\'s constitution. The model articles fill any gap.', tier: 4 },
  ifLeft: 'Banks and investors ask for them, and a gap in your company records can hold up a round.',
  fix: 'Add the current memorandum and articles, with every change lodged since.',
});
b.rule({
  id: 'KE.CORP.MEMBERS_REGISTER', layer: 1, area: 'shareholders', stage: 2, title: 'Register of members, lodged with the Registrar', sev: 'high', tier: 4, regulator: BRS,
  src: [[S2, 'Register of members kept with names, addresses, dates and shareholdings'], [S2, 'Copy of the register of members lodged with the Registrar within 30 days']],
  params: { days_to_lodge: 30, days_to_lodge_amendment: 14 },
  sat: any(held('ke_members_register'), told('ke_members_register')), evidence: ['Register of members and lodgement', 'Your confirmation'], action: 'upload',
  slot: { id: 'ke_members_register', label: 'Register of members, with the Registrar\'s lodgement acknowledgement', reason: 'The company keeps a register of members and lodges a copy with the Registrar within 30 days, and each change within 14 days.', tier: 4 },
  text: [
    "We can't see {company}'s register of members",
    "You haven't added the register of members, or confirmed it is kept and lodged with the Registrar.",
    'A company keeps a register of every member and their shares, lodges a copy with the Registrar within 30 days, and lodges each change within 14 days.',
    'It is the proof of who owns the company, and late lodging is fined.',
    'Bring the register up to date, lodge it through BRS, and add it here or confirm.',
  ],
});
b.rule({
  id: 'KE.CORP.BO_REGISTER', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Register of beneficial owners kept', sev: 'medium', tier: 5,
  src: [[S2, 'Register of beneficial owners kept by the company']],
  sat: told('ke_bo_register'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps a register of beneficial owners",
    "We don't have your confirmation that the company keeps a register of the people who ultimately own or control it.",
    'Every company keeps a register of its beneficial owners with the details the regulations set.',
    'Banks check it when they onboard you, and the Registrar can act on a missing register.',
    'Identify your beneficial owners, record them, then confirm here.',
  ],
});
b.doc({
  id: 'KE.CORP.BO_FILING', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owners lodged with the Registrar', noun: 'beneficial ownership lodgement acknowledgement', sev: 'high', tier: 4, regulator: BRS,
  src: [[S2, 'Beneficial owners register lodged with the Registrar within 30 days of preparation']],
  params: { days_to_lodge: 30 },
  slot: { id: 'ke_bo_filing', label: 'BRS acknowledgement of the beneficial ownership filing', reason: 'A copy of the beneficial owners register goes to the Registrar within 30 days of preparing it. It is not public, so we need your acknowledgement.', tier: 4 },
  ifLeft: 'The Registrar lists companies with missing beneficial ownership filings, and banks ask for it.',
  fix: 'Lodge your beneficial owners through BRS on eCitizen, and add the acknowledgement here.',
});
b.rule({
  id: 'KE.CORP.BO_CHANGES', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial-owner changes lodged within 14 days', sev: 'medium', tier: 5, regulator: BRS,
  src: [[S2, 'Beneficial-owner changes lodged within 14 days of amending the register']],
  params: { days_to_lodge: 14 },
  sat: told('ke_bo_changes'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s beneficial-owner changes reach the Registrar",
    "We don't have your confirmation that each change to the beneficial owners register was lodged with the Registrar.",
    'The company lodges each amendment within 14 days, and owners and directors tell the company of changes in time.',
    'Out-of-date details mislead banks and can be fined.',
    'Lodge any change through BRS after each change in ownership, then confirm here.',
  ],
});

// --- Section 3: annual return and financial statements -----------------------------------------------------

b.doc({
  id: 'KE.CORP.ANNUAL_RETURN', layer: 1, area: 'filings', stage: 2, title: 'Annual return lodged', noun: 'latest annual return filing receipt', sev: 'high', tier: 4, regulator: BRS, penalty: 'moderate',
  src: [[S3, 'Annual return lodged within 28 days after its return date']],
  params: { days_after_return_date: 28 },
  slot: { id: 'ke_annual_return', label: 'Latest annual return filing receipt from eCitizen', reason: 'The annual return is lodged within 28 days after the return date, the anniversary of incorporation.', tier: 4 },
  why: 'Every company lodges an annual return within 28 days after its return date, the anniversary of incorporation.',
  ifLeft: 'Late returns are fined, and a company that stops filing can be struck off.',
  fix: 'File the annual return through BRS on eCitizen, and add the receipt here.',
});
b.doc({
  id: 'KE.CORP.FINANCIAL_STATEMENTS', layer: 1, area: 'filings', stage: 3, title: 'Financial statements lodged within 9 months', noun: 'lodged financial statements', sev: 'medium', tier: 4, regulator: BRS,
  src: [[S3, 'Financial statements lodged within 9 months of the accounting reference period (private company)'], [S3, 'Small company lodges at least its balance sheet']],
  rec: { type: 'after_year_end', months: 9, monitoring: remind },
  params: { months_after_year_end: 9 },
  slot: { id: 'ke_financial_statements', label: 'Lodged financial statements (or balance sheet, for a small company), with the filing receipt', reason: 'A private company lodges its financial statements within 9 months of its year end. A small company may lodge just the balance sheet.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Lodge the statements through BRS, and add them and the receipt here.',
});

// --- Section 4: directors, secretary and audit --------------------------------------------------------------

b.doc({
  id: 'KE.CORP.DIRECTORS', layer: 1, area: 'officers', stage: 2, title: 'At least one director, a natural person', noun: 'recent CR12 official search', sev: 'high', tier: 4, regulator: BRS,
  src: [[S4, 'Private company has at least one director'], [S4, 'At least one director is a natural person']],
  slot: CR12,
  why: 'A private company has at least one director, and at least one director is a natural person.',
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Get a recent CR12 from BRS, check the directors are right, and add it here.',
});
b.rule({
  id: 'KE.CORP.DIRECTORS_OF_AGE', layer: 1, area: 'officers', stage: 2, title: 'Directors are adults', sev: 'low', tier: 5,
  src: [[S4, 'Directors are at least 18 years old']],
  sat: told('ke_directors_of_age'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s directors are adults",
    "We don't have your confirmation that every director is at least 18. We don't keep birth dates, so we can't check.",
    'A director must be at least 18. Appointing someone younger is void.',
    'A void appointment can call board decisions into question.',
    'Check each director is at least 18, then confirm here.',
  ],
});
b.rule({
  id: 'KE.CORP.DIRECTOR_REGISTERS', layer: 1, area: 'officers', stage: 2, title: 'Registers of directors kept', sev: 'low', tier: 5,
  src: [[S4, "Register of directors and register of directors' residential addresses"]],
  sat: told('ke_director_registers'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps its registers of directors",
    "We don't have your confirmation that the company keeps a register of directors and a separate register of their home addresses.",
    'A company keeps both registers, and the register of directors is open for inspection.',
    'Missing registers can be fined and slow down due diligence.',
    'Set up both registers, then confirm here.',
  ],
});
b.rule({
  id: 'KE.CORP.SECRETARY', layer: 1, area: 'officers', stage: 2, title: 'Company secretary, once paid-up capital reaches KES 5 million', sev: 'medium', tier: 4, regulator: BRS,
  src: [[S4, 'Company secretary required once paid-up capital is KES 5 million or more']],
  params: { paid_up_capital_kes: 5_000_000 },
  sat: any(told('ke_secretary_appointed'), told('ke_capital_below_secretary_threshold')), evidence: ['CR12 official search', 'Your confirmation'], action: 'attest',
  text: [
    "You haven't told us about {company}'s company secretary",
    "We don't have your confirmation that the company has a secretary, or that its paid-up capital is below KES 5 million.",
    'A private company with paid-up capital of KES 5 million or more has a company secretary.',
    'Without one, filings and minutes have nobody responsible for them, and investors ask.',
    'Appoint a secretary if you are over the limit, or confirm here that you are below it.',
  ],
});
b.rule({
  id: 'KE.CORP.AUDIT', layer: 1, area: 'filings', stage: 3, title: 'Audit, unless the company is exempt', sev: 'medium', tier: 4,
  src: [[S4, 'Financial statements audited unless the company is exempt'], [S4, 'Small company audit exemption: small, turnover up to KES 50 million and net assets up to KES 20 million']],
  params: { turnover_kes: 50_000_000, net_assets_kes: 20_000_000 },
  sat: any(held('ke_audit_report'), told('ke_audit_exempt')), evidence: ["Auditor's report", 'Your confirmation'], action: 'upload',
  slot: { id: 'ke_audit_report', label: "Auditor's report, or the balance sheet with the directors' exemption statement", reason: 'Financial statements are audited unless the company is small, with turnover up to KES 50 million and net assets up to KES 20 million.', tier: 4 },
  text: [
    "We don't have {company}'s audit report or exemption",
    "You haven't added an auditor's report, or confirmed that the company is exempt from audit.",
    'A company is audited unless it is small and its turnover is no more than KES 50 million and net assets no more than KES 20 million. The exemption is stated on the balance sheet.',
    'Statements that needed an audit are incomplete, and banks and investors ask for it.',
    "Add the auditor's report, or confirm here that the company is exempt.",
  ],
});

// --- Section 5: intellectual property --------------------------------------------------------------------

b.rule({
  id: 'KE.IP.EMPLOYEE_WORKS', layer: 2, area: 'ip_ownership', stage: 2, title: 'Work made by employees belongs to the company', sev: 'medium', tier: 5, when: STAFF,
  src: [[S5, "Copyright in employees' work made in the course of employment passes to the employer"]],
  sat: any(held('ke_employee_ip_clause'), told('ke_employee_ip_clause')), evidence: ['Employment contract IP clause', 'Your confirmation'], action: 'attest',
  slot: { id: 'ke_employee_ip_clause', label: 'Employment contract IP clause', reason: 'Copyright in work made in the course of employment passes to the employer, unless a contract limits it. A clause makes it clear.' },
  text: [
    "We can't see how {company}'s employment contracts handle IP",
    "You haven't added an employment contract IP clause, or confirmed that your contracts leave the work with the company.",
    'Copyright in work made in the course of employment, software included, passes to the employer unless an agreement limits it.',
    'A contract that limits it leaves the product with the employee, and investors check this.',
    'Check your contracts keep IP with the company. Add the clause here or confirm.',
  ],
});

// --- Section 6: data protection --------------------------------------------------------------------------

b.rule({
  id: 'KE.DP.ODPC_REGISTRATION', layer: 3, area: 'data_protection', stage: 2, title: 'Registered with the Data Protection Commissioner', sev: 'high', tier: 4, regulator: ODPC, when: PD,
  src: [
    [S6, 'Registered with the ODPC before acting as data controller or processor'], [S6, 'Exempt from registration only below KES 5 million turnover and under 10 employees'],
    [S6, 'Third Schedule purposes need registration whatever the size'], [S6, 'ODPC certificate valid for 24 months, then renewed'],
  ],
  law: [['Data Protection Act 2019', 's 18'], ['Data Protection (Registration of Data Controllers and Data Processors) Regulations 2021', 'regs 9, 13']],
  params: { exempt_below_turnover_kes: 5_000_000, exempt_below_employees: 10, certificate_months: 24 },
  rec: { type: 'every_years', from_fact: 'vault.ke_odpc_certificate.dated', years: 2, monitoring: remind },
  sat: any(held('ke_odpc_certificate'), told('ke_odpc_exempt')), evidence: ['ODPC certificate of registration', 'Your confirmation'], action: 'register',
  slot: { id: 'ke_odpc_certificate', label: 'ODPC certificate of registration (current)', reason: 'Controllers and processors register with the ODPC before handling personal data. The certificate lasts 24 months. The public list sits behind a bot check, so we read your certificate.', tier: 4, expires: true },
  text: [
    "We can't see {company}'s registration with the Data Protection Commissioner",
    "You haven't added a current ODPC certificate, or confirmed the company is exempt.",
    'A company that handles personal data registers with the ODPC, unless its turnover is below KES 5 million and it has fewer than 10 employees. Some purposes, such as health, education, financial services and direct marketing, always need registration. The certificate lasts 24 months.',
    'Handling personal data without a needed registration is an offence, and customers ask for the certificate.',
    'Register on the ODPC portal, renew before the 24 months run out, and add the certificate here, or confirm the exemption.',
  ],
});
b.rule({
  id: 'KE.DP.ODPC_CHANGES', layer: 3, area: 'data_protection', stage: 2, title: 'Changes notified to the ODPC within 14 days', sev: 'low', tier: 5, regulator: ODPC, when: PD,
  src: [[S6, 'Changes to registered particulars notified to the ODPC within 14 days']],
  params: { days_to_notify: 14 },
  sat: any(told('ke_odpc_changes'), told('ke_odpc_exempt')), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s ODPC details are current",
    "We don't have your confirmation that every change to your registered details, such as new purposes or data, was notified to the ODPC.",
    'Changes to the particulars you registered are notified to the ODPC within 14 days.',
    'An out-of-date registration may not cover what you do with data.',
    'Check your registration against what you do today, notify any change, then confirm here.',
  ],
});
b.rule({
  id: 'KE.DP.PRIVACY_NOTICE', layer: 3, area: 'data_protection', stage: 2, title: 'Privacy notice (Data Protection Act)', sev: 'high', tier: 1, regulator: ODPC, when: SITE,
  src: [[S6, 'Privacy notice tells people what section 29 requires before collection']], law: [['Data Protection Act 2019', 's 29']],
  sat: yes('web.policy.privacy_notice_found'), verify: all(no('web.policy.privacy_notice_found'), no('web.policy.language_supported')),
  evidence: ['Your published privacy notice'], action: 'fix_website',
  text: [
    "We can't find a privacy notice on {company}'s website",
    "We looked at your website and couldn't find a privacy notice.",
    'Before collecting personal data, people are told their rights, that it is being collected, why, who gets it, how to contact you, and any transfer abroad.',
    "It's public, so customers, partners and the ODPC can all see the gap.",
    'Publish a notice with those details and link it from every page.',
  ],
});
b.rule({
  id: 'KE.DP.CONSENT', layer: 3, area: 'data_protection', stage: 2, title: 'Consent you can prove and people can withdraw', sev: 'medium', tier: 5, regulator: ODPC, when: PD,
  src: [[S6, 'Consent provable and withdrawable at any time']],
  sat: told('ke_consent'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} can prove consent and lets people withdraw it",
    "We don't have your confirmation that, where you rely on consent, you keep a record of it and people can withdraw it at any time.",
    'Where consent is the basis, the company must be able to prove it, and people may withdraw it at any time.',
    'Data used without consent you can prove has no legal basis.',
    'Record how and when each consent was given, offer a simple way to withdraw, then confirm here.',
  ],
});
b.rule({
  id: 'KE.DP.CHILDREN', layer: 3, area: 'data_protection', stage: 2, title: "Parent consent for children's data", sev: 'medium', tier: 5, regulator: ODPC, when: all(PD, yes('answers.users_under_18')),
  src: [[S6, "Children's data: parent or guardian consent and age verification"]], law: [['Data Protection Act 2019', 's 33']],
  sat: told('ke_children_consent'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed how {company} handles children's data",
    "We don't have your confirmation that a parent or guardian consents, and that you check ages, before using children's data.",
    "Children's data needs a parent's or guardian's consent, an age check, and processing in the child's best interests.",
    "Children's data is watched closely, and the ODPC can act on it.",
    'Set up an age check and a parent consent step, then confirm here.',
  ],
});
b.doc({
  id: 'KE.DP.IMPACT_ASSESSMENT', layer: 6, area: 'data_governance', stage: 2, title: 'Data protection impact assessment', noun: 'data protection impact assessment', sev: 'high', tier: 5, regulator: ODPC, when: all(PD, yes('derived.high_risk_processing')),
  src: [[S6, 'Impact assessment before high-risk processing, report 60 days ahead'], [S11, 'Profiling or new-technology processing triggers an impact assessment']],
  law: [['Data Protection Act 2019', 's 31']],
  params: { days_before_processing: 60 },
  slot: { id: 'ke_dpia', label: 'Data protection impact assessment', reason: 'Profiling, automated decisions, large-scale, biometric or children\'s data need an assessment, reported to the ODPC 60 days before you start.' },
  fix: 'Write the assessment for each high-risk use, send it to the ODPC in time, and add it here.',
});
b.doc({
  id: 'KE.DP.BREACH', layer: 3, area: 'data_protection', stage: 2, title: 'Data breach plan (72 hours)', noun: 'data breach plan and log', sev: 'medium', tier: 5, regulator: ODPC, when: PD,
  src: [[S6, 'Breach reported to the Data Commissioner within 72 hours']], law: [['Data Protection Act 2019', 's 43']],
  params: { hours_to_report: 72 },
  slot: { id: 'ke_breach_plan', label: 'Data breach response plan and breach log', reason: 'A breach with a real risk of harm is reported to the Data Commissioner within 72 hours, so you need to know who does what first.' },
  fix: 'Write a short plan saying who decides, who tells the ODPC and the people affected, and how fast, keep a log, and add both here.',
});
b.rule({
  id: 'KE.DP.TRANSFERS', layer: 3, area: 'data_protection', stage: 2, title: 'Safeguards for data sent out of Kenya', sev: 'medium', tier: 5, regulator: ODPC, when: all(PD, yes('derived.data_outside_home')),
  src: [[S6, 'Transfers out of Kenya need proof of safeguards or a listed necessity']], law: [['Data Protection Act 2019', 's 48']],
  sat: told('ke_transfers'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s safeguards for data sent out of Kenya",
    'You told us personal data is held outside Kenya, and we have no confirmation of the safeguards for it.',
    'Personal data leaves Kenya only with proof of appropriate safeguards given to the Data Commissioner, or on a listed necessity. Sensitive data also needs consent.',
    'Transfers without safeguards are a breach of the Act, and customers ask about them.',
    'Check each provider abroad has a contract with data protection terms, keep the proof, then confirm here.',
  ],
});
b.rule({
  id: 'KE.DP.DIRECT_MARKETING', layer: 3, area: 'marketing', stage: 2, title: 'Consent and opt-out for marketing', sev: 'medium', tier: 5, regulator: ODPC, when: yes('derived.sends_marketing'),
  src: [[S6, 'Commercial use and direct marketing need consent and an opt-out']], law: [['Data Protection Act 2019', 's 37']],
  sat: told('ke_direct_marketing'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s marketing meets the consent rules",
    "We don't have your confirmation that your marketing has consent and that every message offers a free way to opt out.",
    'Using personal data for commercial purposes needs express consent, and each direct marketing message offers a simple, free opt-out.',
    'People who did not agree can complain to the ODPC.',
    'Check how you collect consent and handle opt-outs, keep records, then confirm here.',
  ],
});

// --- Section 7: tax and payroll -----------------------------------------------------------------------------

b.doc({
  id: 'KE.TAX.KRA_PIN', layer: 3, area: 'tax', stage: 2, title: 'Company KRA PIN', noun: 'KRA PIN certificate', sev: 'high', tier: 4, regulator: KRA,
  src: [[S7, 'Company KRA PIN registered on iTax']],
  slot: { id: 'ke_kra_pin', label: 'KRA PIN certificate for the company', reason: 'A company with, or expecting, an income tax liability registers for a PIN on iTax.', tier: 4 },
  fix: 'Register the company on iTax, and add the PIN certificate here.',
});
b.rule({
  id: 'KE.TAX.VAT_REGISTRATION', layer: 3, area: 'tax', stage: 3, title: 'VAT registration at KES 5 million', sev: 'medium', tier: 4, regulator: KRA,
  src: [[S7, 'VAT registration within 30 days once taxable supplies reach KES 5 million in 12 months']], law: [['VAT Act 2013', 's 34']],
  params: { threshold_kes_12_months: 5_000_000, days_to_apply: 30 },
  sat: any(held('ke_vat_certificate'), told('ke_vat_below_threshold')), evidence: ['VAT registration certificate', 'Your confirmation'], action: 'register',
  slot: { id: 'ke_vat_certificate', label: 'VAT registration certificate', reason: 'A company registers for VAT within 30 days once its taxable supplies reach KES 5 million in 12 months.', tier: 4 },
  text: [
    "We can't see {company}'s VAT registration",
    "You haven't added a VAT registration certificate, or confirmed your taxable sales are below KES 5 million in 12 months.",
    'A company applies for VAT registration within 30 days once its taxable supplies reach, or are expected to reach, KES 5 million in 12 months.',
    'VAT not charged is still owed, with penalties and interest.',
    'Register on iTax if you are over the limit and add the certificate, or confirm here that you are below it.',
  ],
});
b.rule({
  id: 'KE.TAX.VAT_RETURNS', layer: 3, area: 'tax', stage: 3, title: 'VAT returns by the 20th', sev: 'medium', tier: 5, regulator: KRA,
  src: [[S7, 'VAT return and payment by the 20th of the following month']],
  sat: any(told('ke_vat_returns'), told('ke_vat_below_threshold')), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} files its VAT returns",
    "We don't have your confirmation that VAT returns are filed and paid on iTax by the 20th of each following month, or that you are not registered.",
    'A VAT-registered company files and pays by the 20th of the month after each period.',
    'Late returns bring penalties and interest.',
    'Check with your accountant that every month is filed, then confirm here.',
  ],
});
b.rule({
  id: 'KE.TAX.ETIMS', layer: 3, area: 'tax', stage: 2, title: 'Electronic tax invoices (eTIMS)', sev: 'medium', tier: 5, regulator: KRA,
  src: [[S7, 'eTIMS onboarding and electronic tax invoices']],
  sat: told('ke_etims'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} issues invoices through eTIMS",
    "We don't have your confirmation that the company is onboarded on eTIMS and issues electronic tax invoices.",
    'KRA requires every business to onboard eTIMS and issue electronic tax invoices, whether or not it is VAT registered.',
    'Expenses without eTIMS invoices may not be deductible, and customers ask for them.',
    'Onboard on eTIMS, issue invoices through it, then confirm here.',
  ],
});
b.rule({
  id: 'KE.TAX.INCOME_TAX_RETURN', layer: 3, area: 'tax', stage: 3, title: 'Company income tax return within 6 months', sev: 'medium', tier: 5, regulator: KRA,
  src: [[S7, 'Company income tax return within 6 months of year end'], [S7, 'Instalment tax on the 20th of months 4, 6, 9 and 12']],
  rec: { type: 'after_year_end', months: 6, monitoring: remind },
  sat: told('ke_income_tax_return'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} files its income tax return and instalments",
    "We don't have your confirmation that the company return is filed within 6 months of the year end, with instalment tax paid during the year.",
    'Companies file their income tax return on iTax within 6 months of the year end, and pay instalment tax in the 4th, 6th, 9th and 12th months.',
    'Late returns and short instalments bring penalties and interest.',
    'Check with your accountant that the return and instalments are up to date, then confirm here.',
  ],
});
b.rule({
  id: 'KE.EMP.MONTHLY_PAYROLL', layer: 3, area: 'employment', stage: 2, title: 'PAYE, Housing Levy, SHIF and NSSF paid by the 9th', sev: 'high', tier: 5, regulator: KRA, when: STAFF,
  src: [
    [S7, 'PAYE employer registration and monthly return by the 9th'], [S7, 'Affordable Housing Levy: 1.5% employee plus 1.5% employer'],
    [S7, 'SHIF contributions deducted and remitted by the 9th'], [S7, 'NSSF employer and employee registration, contributions by the 9th'],
  ],
  sat: told('ke_monthly_payroll'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} pays its monthly payroll deductions",
    "We don't have your confirmation that PAYE, the Housing Levy, SHIF and NSSF are deducted, filed and paid each month.",
    'Employers register for PAYE and NSSF, and pay PAYE, SHIF and NSSF by the 9th of the next month, with the Housing Levy of 1.5% from each side by the 9th working day.',
    'Late payments bring penalties, and staff lose health and pension cover.',
    'Check with your payroll provider that every month is filed and paid, then confirm here.',
  ],
});

// --- Section 8: sector licences ------------------------------------------------------------------------------

b.doc({
  id: 'KE.FIN.PAYMENT_AUTHORISATION', layer: 3, area: 'payments', stage: 2, title: 'Payment service authorisation (CBK)', noun: 'CBK payment service authorisation', sev: 'high', tier: 4, regulator: 'Central Bank of Kenya', when: yes('derived.moves_money'),
  src: [[S8, 'Payment service provider authorisation from CBK']],
  slot: { id: 'ke_payment_authorisation', label: 'CBK payment service provider authorisation', reason: "Holding or moving customers' money needs an authorisation from the Central Bank of Kenya, or a licensed partner.", tier: 4 },
  fix: 'Add your CBK authorisation, or the agreement with the licensed partner that covers you.',
});
b.doc({
  id: 'KE.FIN.DIGITAL_CREDIT_LICENCE', layer: 3, area: 'lending', stage: 2, title: 'Digital credit provider licence (CBK)', noun: 'digital credit provider licence', sev: 'high', tier: 4, regulator: 'Central Bank of Kenya', when: yes('derived.sector.lending'),
  src: [[S8, 'Digital credit provider licence from CBK']],
  slot: { id: 'ke_digital_credit_licence', label: 'CBK digital credit provider licence', reason: 'Lending through digital channels needs a licence from the Central Bank of Kenya.', tier: 4 },
  fix: 'Add your CBK licence, or the agreement with the licensed lender that covers you.',
});
b.doc({
  id: 'KE.FIN.VASP_LICENCE', layer: 3, area: 'crypto', stage: 2, title: 'Virtual asset service provider licence', noun: 'virtual asset service provider licence', sev: 'high', tier: 4, regulator: 'Central Bank of Kenya or Capital Markets Authority', when: yes('derived.sector.crypto'),
  src: [[S8, 'Virtual asset service provider licence from CBK or CMA']],
  slot: { id: 'ke_vasp_licence', label: 'Virtual asset service provider licence', reason: 'Since 4 November 2025, virtual asset services need a licence from the Central Bank of Kenya or the Capital Markets Authority.', tier: 4 },
  fix: 'Add your licence, or the agreement with the licensed provider that covers you.',
});

// --- Section 9: website and consumers --------------------------------------------------------------------

b.rule({
  id: 'KE.COM.COMPANY_DETAILS', layer: 4, area: 'website_information', stage: 2, title: 'Company name and details in communications', sev: 'low', tier: 5,
  src: [[S9, 'Company name and prescribed information displayed and stated in communications']],
  sat: told('ke_company_details'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} shows its name and details where it should",
    "We don't have your confirmation that the company's name is shown at its offices and in its letters, invoices and other communications, with the details the regulations require.",
    'A company displays its name and states it, with the prescribed details, in its communications.',
    'Leaving them off can be fined, and it makes the company look less established.',
    'Add the name and details to your templates and website, then confirm here.',
  ],
});
b.rule({
  id: 'KE.CONSUMER.FAIR_DEALING', layer: 4, area: 'consumer_protection', stage: 3, title: 'No misleading claims or unfair conduct towards consumers', sev: 'medium', tier: 5, regulator: 'Competition Authority of Kenya', when: CONSUMER,
  src: [[S9, 'No false or misleading representations to consumers'], [S9, 'No unconscionable conduct towards consumers']],
  law: [['Competition Act', 'ss 55-57']],
  sat: told('ke_fair_dealing'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s marketing and dealings with consumers are fair",
    "We don't have your confirmation that your advertising and online statements are accurate, and that you deal fairly with consumers.",
    'False or misleading claims to consumers, online ones included, and unconscionable conduct are banned.',
    'The Competition Authority can fine the company and order it to correct what it said.',
    'Review your website and adverts for claims you cannot back up, then confirm here.',
  ],
});

// --- Section 10: fundraising --------------------------------------------------------------------------------

b.doc({
  id: 'KE.FUND.ALLOTMENT', layer: 5, area: 'fundraising', stage: 4, title: 'Share allotment authorised and returned to the Registrar', noun: 'allotment resolution and return of allotment', sev: 'high', tier: 4, regulator: BRS, when: INVESTED,
  src: [[S10, "Directors' authority to allot shares"], [S10, 'Return of allotment with a statement of capital within one month']],
  params: { months_to_return: 1 },
  slot: { id: 'ke_allotment', label: 'Board resolution and lodged return of allotment for each share issue', reason: 'Directors allot shares with the authority the articles or a resolution give, and lodge a return of allotment with a statement of capital within one month.', tier: 4 },
  fix: 'Add the resolution behind each allotment and the lodged return of allotment.',
});
b.rule({
  id: 'KE.FUND.ALLOTMENT_REGISTERED', layer: 5, area: 'fundraising', stage: 4, title: 'Allotments registered and the members register updated', sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'Allotment registered within two months'], [S10, 'Members register updated and lodged within 14 days after the issue']],
  sat: told('ke_allotment_registered'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s new shares are registered",
    "We don't have your confirmation that each allotment was registered within two months, and the register of members updated and lodged after the issue.",
    'An allotment is registered within two months, and the change to the members register is lodged within 14 days.',
    'Investors could find their shares are not on record.',
    'Update the register after each issue, lodge it through BRS, then confirm here.',
  ],
});
b.rule({
  id: 'KE.FUND.NO_PUBLIC_OFFER', layer: 5, area: 'fundraising', stage: 4, title: 'No offer of shares to the public', sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'Private company may not offer its securities to the public']],
  sat: told('ke_no_public_offer'), evidence: ['Your confirmation, with your investor list'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s rounds were not public offers",
    "We don't have your confirmation that each round went only to people you approached privately, not to the public.",
    'A private company may not offer its shares or other securities to the public.',
    'An offer to the public can be stopped, and investors can ask for their money back.',
    'Keep a list of who each offer went to, then confirm here.',
  ],
});

// --- Section 11: AI ---------------------------------------------------------------------------------------

b.rule({
  id: 'KE.AI.AUTOMATED_DECISIONS', layer: 6, area: 'data_governance', stage: 3, title: 'Automated decisions about people', sev: 'medium', tier: 5, regulator: ODPC, when: all(yes('derived.uses_ai'), PD, yes('answers.automated_decisions')),
  src: [[S11, 'Right not to be subject to solely automated decisions with significant effect']], law: [['Data Protection Act 2019', 's 35']],
  sat: told('ke_automated_decisions'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s basis for automated decisions",
    'You told us software makes big decisions about people by itself, and we have no confirmation of the basis for it.',
    'People have a right not to be subject to decisions with significant effect made only by automated processing, unless it is needed for a contract, authorised by law with safeguards, or based on consent.',
    'A decision without a basis can be challenged, and the ODPC can act on it.',
    'Check the basis for each automated decision, explain it in your notice, then confirm here.',
  ],
});

export const ke = b.build();

/** International rules the Kenyan pack asks for in its own way. */
export const KE_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  'INTL.CORP.CONSTITUTION': ['KE.CORP.ARTICLES'],
  'INTL.EQUITY.CAP_TABLE': ['KE.CORP.MEMBERS_REGISTER'],
  'INTL.DP.PRIVACY_NOTICE': ['KE.DP.PRIVACY_NOTICE'],
  'INTL.SEC.INCIDENT_RESPONSE': ['KE.DP.BREACH'],
};

import { all, any, held, MAPS, no, packBuilder, remind, told, yes } from './helper.js';

/**
 * Ghana (private company limited by shares, Companies Act 2019, Act 992). Draft, version 0.1.0:
 * every rule waits for a Ghanaian lawyer. Encoded from docs/knowledge/vero-scan-ghana-rule-pack-map.md;
 * the items left out, and why, are listed at the end of that map ("Not encoded").
 *
 * No Ghanaian register is connected: the ORC publishes no API, its online search shows names
 * only, and detailed company information now takes a formal request (map note 1). The Data
 * Protection Commission's public register is an HTML table with no file or API (map note 2), so
 * DPC registration is proved by the certificate.
 */
const b = packBuilder('GH', MAPS.ghana, { name: 'Ghana', version: '0.1.0' });

const ORC = 'Office of the Registrar of Companies';
const DPC = 'Data Protection Commission';
const GRA = 'Ghana Revenue Authority';
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
const ONLINE_SALES = all(SITE, yes('derived.takes_payments'));
const INVESTED = yes('derived.invested');
const pageCheck = (fact: string) => all(no(fact), no('web.policy.language_supported'));

// --- Section 1: register and status -----------------------------------------------------------------

b.doc({
  id: 'GH.CORP.INCORPORATION', layer: 1, area: 'standing', stage: 2, title: 'Certificate of incorporation', noun: 'certificate of incorporation', sev: 'high', tier: 4, regulator: ORC,
  src: [[S1, 'Incorporated by the Registrar of Companies under Act 992'], [S1, 'Name ends with "Limited Company" or "LTD"']],
  slot: { id: 'gh_incorporation_certificate', label: 'Certificate of incorporation', reason: 'The ORC register is not connected, so the certificate shows the company is registered, under a name ending in "Limited Company" or "LTD".', tier: 4 },
  ifLeft: "It's the first thing a bank, investor or buyer asks for.",
  fix: 'Add the certificate of incorporation from the ORC.',
});
b.rule({
  id: 'GH.CORP.REGISTERED_OFFICE', layer: 1, area: 'filings', stage: 2, title: 'Registered office and contact details notified', sev: 'medium', tier: 5, regulator: ORC,
  src: [[S1, 'Registered office, phone and postal or digital address within 28 days of incorporation']],
  params: { days_to_notify: 28 },
  sat: told('gh_registered_office'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s registered office details are with the Registrar",
    "We don't have your confirmation that the Registrar has the company's registered office, phone, postal or digital address, email and website.",
    'These are notified within 28 days of incorporation, and each change within 28 days.',
    'Notices go there, and default brings a daily penalty.',
    'Check your details with the ORC, notify any change, then confirm here.',
  ],
});
b.rule({
  id: 'GH.CORP.NAME_SHOWN', layer: 1, area: 'governance', stage: 2, title: 'Company name on offices, letters and invoices', sev: 'low', tier: 5,
  src: [[S1, 'Name painted at offices and printed on letters, invoices and receipts']],
  sat: told('gh_name_shown'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s name appears where it should",
    "We don't have your confirmation that the company's name is shown at its offices and on its letters, invoices, receipts and other publications.",
    'A company shows its name outside its offices and on its letters, invoices, receipts, cheques, orders and publications.',
    'Leaving it off can be fined, and it makes the company look less established.',
    'Add the full name to your templates and signs, then confirm here.',
  ],
});
b.rule({
  id: 'GH.CORP.NOT_STRUCK_OFF', layer: 1, area: 'standing', stage: 2, title: 'Not struck off as a non-operating company', sev: 'high', tier: 5, regulator: ORC,
  src: [[S1, 'Not struck off by the Registrar as a non-operating company']],
  sat: told('gh_not_struck_off'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has not been struck off",
    "We don't have your confirmation that the company is still on the register and has had no strike-off letters from the Registrar. The ORC register isn't connected, so we can't check.",
    'The Registrar can strike off a company it believes is not operating, after two letters and a notice in the Companies Bulletin.',
    'A company struck off loses its legal existence and its assets.',
    'Answer any letter from the Registrar, keep your filings current, then confirm here.',
  ],
});

// --- Section 2: constitution, members and beneficial owners ------------------------------------------------

b.rule({
  id: 'GH.CORP.CONSTITUTION', layer: 1, area: 'governance', stage: 2, title: 'Constitution, or the standard one', sev: 'medium', tier: 4,
  src: [[S2, 'Registered constitution is optional; otherwise the Second Schedule applies']],
  sat: any(held('gh_constitution'), told('gh_standard_constitution')), evidence: ['Registered constitution', 'Your confirmation'], action: 'upload',
  slot: { id: 'gh_constitution', label: 'Registered constitution', reason: "A company may register its own constitution. Without one, the Act's standard constitution applies.", tier: 4 },
  text: [
    "We don't have {company}'s constitution",
    "You haven't added the company's registered constitution, or confirmed that it uses the standard one in the Act.",
    "A company may register its own constitution. If it doesn't, the Second Schedule of the Companies Act is its constitution.",
    'Banks and investors ask which rules govern the company.',
    'Add the registered constitution, or confirm here that the standard one applies.',
  ],
});
b.rule({
  id: 'GH.CORP.MEMBERS_REGISTER', layer: 1, area: 'shareholders', stage: 2, title: 'Register of members kept in Ghana', sev: 'high', tier: 5,
  src: [[S2, 'Register of members kept in Ghana, entries within 28 days']],
  params: { days_to_enter: 28 },
  sat: any(held('gh_members_register'), told('gh_members_register')), evidence: ['Register of members', 'Your confirmation'], action: 'attest',
  slot: { id: 'gh_members_register', label: 'Register of members', reason: 'The company keeps a register of its members in Ghana, with each entry made within 28 days.' },
  text: [
    "We can't see {company}'s register of members",
    "You haven't added the register of members, or confirmed it is kept in Ghana and up to date.",
    'A company keeps a register of members in Ghana: names, addresses, shares held and paid, and dates, with each entry made within 28 days.',
    'It is the proof of who owns the company, and investors check it against every share issue.',
    'Bring the register up to date, and add it here or confirm.',
  ],
});
b.rule({
  id: 'GH.CORP.BO_PARTICULARS', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owners recorded in the register of members', sev: 'medium', tier: 5,
  src: [[S2, 'Beneficial-owner particulars held in the register of members']],
  sat: told('gh_bo_particulars'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} records its beneficial owners",
    "We don't have your confirmation that the register of members holds the details of each beneficial owner.",
    'The register of members records each beneficial owner, the nature of their interest, and whether they are a politically exposed person.',
    'The same details go to the Registrar, and banks check them.',
    'Add the beneficial owners to the register, then confirm here.',
  ],
});
b.doc({
  id: 'GH.CORP.BO_FILING', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owners filed with the Registrar', noun: 'ORC beneficial ownership filing', sev: 'high', tier: 4, regulator: ORC,
  src: [[S2, 'Beneficial owners filed with the Registrar at incorporation']],
  slot: { id: 'gh_bo_filing', label: 'ORC beneficial ownership filing', reason: 'New companies give their beneficial owners during registration, and the Registrar keeps them in the central register. It is not public online, so we need your filing.', tier: 4 },
  ifLeft: 'Banks ask for it when they onboard you, and missing filings are penalised.',
  fix: 'Add the beneficial ownership filing from your ORC registration.',
});
b.rule({
  id: 'GH.CORP.BO_CHANGES', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial-owner changes filed in time', sev: 'medium', tier: 5, regulator: ORC,
  src: [[S2, 'Beneficial-owner changes reach the Registrar in 28-day steps']],
  params: { days_per_step: 28 },
  sat: told('gh_bo_changes'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s beneficial-owner changes reach the Registrar",
    "We don't have your confirmation that each change in who owns or controls the company was entered and sent to the Registrar.",
    'A member tells the company of a change within 28 days, the company enters it within 28 days, and then notifies the Registrar.',
    'Out-of-date details mislead banks and are penalised.',
    'Notify the ORC after each change in ownership, then confirm here.',
  ],
});

// --- Section 3: accounts, AGM and annual return -------------------------------------------------------------

b.rule({
  id: 'GH.CORP.ACCOUNTING_RECORDS', layer: 1, area: 'filings', stage: 2, title: 'Proper accounting records kept', sev: 'medium', tier: 5,
  src: [[S3, 'Proper accounting records kept']],
  sat: told('gh_accounting_records'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps proper accounting records",
    "We don't have your confirmation that the company keeps proper accounting records.",
    'Every company keeps proper accounting records.',
    'Without them the accounts, the audit and any due diligence fall apart.',
    'Check your bookkeeping is up to date, then confirm here.',
  ],
});
b.rule({
  id: 'GH.CORP.FINANCIAL_STATEMENTS', layer: 1, area: 'filings', stage: 3, title: 'Audited financial statements sent to members', sev: 'high', tier: 4,
  src: [[S3, 'Audited financial statements sent to members within 18 months, then yearly']],
  params: { first_months: 18, max_months_apart: 15 },
  sat: any(held('gh_financial_statements'), told('gh_financial_statements_sent')), evidence: ['Audited financial statements', 'Your confirmation'], action: 'upload',
  slot: { id: 'gh_financial_statements', label: "Audited financial statements, with the auditor's report", reason: 'The first audited statements go to members within 18 months of incorporation, then every calendar year, no more than 15 months apart.', tier: 4 },
  text: [
    "We don't have {company}'s latest audited financial statements",
    "You haven't added the latest audited financial statements, or confirmed they were sent to members on time.",
    "A company sends members its financial statements, with the auditor's report, within 18 months of incorporation and then every year, no more than 15 months apart.",
    'They go with the annual return, and banks and investors ask for them.',
    'Have the statements audited and sent to members, and add them here.',
  ],
});
b.doc({
  id: 'GH.CORP.AGM', layer: 1, area: 'governance', stage: 3, title: 'Annual general meeting held', noun: 'AGM minutes', sev: 'medium', tier: 4,
  src: [[S3, 'Annual general meeting each year, no more than 15 months apart']],
  slot: { id: 'gh_agm_minutes', label: 'AGM minutes, or the written agreement to do without the meeting', reason: 'A company holds an AGM each year, no more than 15 months apart, unless members and auditors agree in writing to do without it.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Hold the meeting, or record the written agreement to skip it, and add it here.',
});
b.doc({
  id: 'GH.CORP.ANNUAL_RETURN', layer: 1, area: 'filings', stage: 3, title: 'Annual return filed with the Registrar', noun: 'latest filed annual return', sev: 'high', tier: 4, regulator: ORC, penalty: 'moderate',
  src: [[S3, 'Annual return to the Registrar every year, within 36 days of sending the accounts'], [S3, 'Private company return carries the accounts and two certifications']],
  params: { days_after_accounts_sent: 36 },
  slot: { id: 'gh_annual_return', label: 'Latest annual return filed with the ORC, or its receipt', reason: 'Every year the company files an annual return within 36 days of sending its financial statements to members, with the statements attached.', tier: 4 },
  why: 'Every year a company files an annual return with the Registrar within 36 days of sending its financial statements to members. A private company attaches the statements and certifies it made no public offer.',
  ifLeft: 'Late returns are penalised, and a company that stops filing can be struck off.',
  fix: 'File the annual return with the ORC, and add it or the receipt here.',
});

// --- Section 4: directors, secretary and auditor --------------------------------------------------------------

b.rule({
  id: 'GH.CORP.DIRECTORS', layer: 1, area: 'officers', stage: 2, title: 'Two directors, one living in Ghana', sev: 'high', tier: 5, regulator: ORC,
  src: [[S4, 'At least two directors, one ordinarily resident in Ghana'], [S4, 'One director resident in the Republic at all times']],
  params: { min_directors: 2, min_resident: 1 },
  sat: told('gh_directors'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has two directors, one living in Ghana",
    "We don't have your confirmation that the company has at least two directors, and that at least one lives in Ghana at all times. We don't keep people's addresses, so we can't check.",
    'A company has at least two directors, and at least one of them is ordinarily resident in Ghana at all times.',
    'While no director lives in Ghana, the company cannot enforce the contracts it makes, and fewer than two directors brings a daily penalty.',
    'Check your directors and where they live, appoint another if needed, then confirm here.',
  ],
});
b.doc({
  id: 'GH.CORP.DIRECTOR_DECLARATIONS', layer: 1, area: 'officers', stage: 2, title: "Directors' statutory declarations", noun: "directors' statutory declarations", sev: 'medium', tier: 4, regulator: ORC,
  src: [[S4, 'Statutory declaration by each director before appointment']],
  slot: { id: 'gh_director_declarations', label: "Each director's statutory declaration and consent", reason: 'Each director makes a statutory declaration before appointment, for example that they have no fraud or dishonesty conviction in the past five years.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: "Add each director's signed declaration, as filed with the ORC.",
});
b.rule({
  id: 'GH.CORP.OFFICER_CHANGES', layer: 1, area: 'filings', stage: 2, title: 'Director and secretary changes notified within 28 days', sev: 'medium', tier: 5, regulator: ORC,
  src: [[S4, 'Director and secretary changes notified within 28 days']],
  params: { days_to_notify: 28 },
  sat: told('gh_officer_changes'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s director changes reach the Registrar",
    "We don't have your confirmation that every change of director or secretary was notified to the Registrar within 28 days.",
    'Each change of director or secretary is notified to the Registrar within 28 days.',
    'Default brings a daily penalty, and a person who left can still appear to act for the company.',
    'Compare the ORC record with who runs the company today, notify anything missing, then confirm here.',
  ],
});
b.doc({
  id: 'GH.CORP.SECRETARY', layer: 1, area: 'officers', stage: 2, title: 'Qualified company secretary', noun: "company secretary's consent and qualification", sev: 'medium', tier: 4, regulator: ORC,
  src: [[S4, 'Company Secretary appointed with a qualification listed in s 211']],
  slot: { id: 'gh_secretary', label: "Company secretary's written consent and proof of qualification", reason: 'Every company has a secretary, a person or firm holding one of the qualifications the Act lists.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: "Appoint a qualified secretary if you have none, and add their consent and qualification here.",
});
b.doc({
  id: 'GH.CORP.AUDITOR', layer: 1, area: 'officers', stage: 2, title: 'Auditor appointed', noun: "auditor's consent and appointment", sev: 'medium', tier: 4,
  src: [[S4, 'Auditor appointed with written consent']],
  slot: { id: 'gh_auditor', label: "Auditor's written consent and appointment", reason: 'The directors may appoint the first auditor; after that the members appoint by ordinary resolution. The auditor consents in writing.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: "Appoint an auditor, and add their written consent and the appointment here.",
});

// --- Section 5: intellectual property --------------------------------------------------------------------

b.rule({
  id: 'GH.IP.EMPLOYEE_WORKS', layer: 2, area: 'ip_ownership', stage: 2, title: 'Work made by employees belongs to the company', sev: 'medium', tier: 5, when: STAFF,
  src: [[S5, 'Copyright in employee and commissioned works vests in the employer or commissioner']],
  sat: any(held('gh_employee_ip_clause'), told('gh_employee_ip_clause')), evidence: ['Employment contract IP clause', 'Your confirmation'], action: 'attest',
  slot: { id: 'gh_employee_ip_clause', label: 'Employment contract IP clause', reason: 'Rights in work made in the course of employment, or on commission, vest in the employer or commissioner unless a contract says otherwise.' },
  text: [
    "We can't see how {company}'s employment contracts handle IP",
    "You haven't added an employment contract IP clause, or confirmed that your contracts leave the work with the company.",
    'Economic rights in work made in the course of employment vest in the employer, unless the contract says otherwise.',
    'A contract that says otherwise leaves the product with the employee, and investors check this.',
    'Check your contracts keep IP with the company. Add the clause here or confirm.',
  ],
});

// --- Section 6: data protection --------------------------------------------------------------------------

b.rule({
  id: 'GH.DP.DPC_REGISTRATION', layer: 3, area: 'data_protection', stage: 2, title: 'Registered with the Data Protection Commission', sev: 'high', tier: 4, regulator: DPC, when: PD, penalty: 'severe',
  src: [[S6, 'Data controller registered with the Data Protection Commission before processing'], [S6, 'DPC registration renewed every two years']],
  law: [['Data Protection Act 2012 (Act 843)', 'ss 27, 50, 53, 56']],
  rec: { type: 'every_years', from_fact: 'vault.gh_dpc_certificate.dated', years: 2, monitoring: remind },
  sat: held('gh_dpc_certificate'), evidence: ['DPC registration certificate'], action: 'register',
  slot: { id: 'gh_dpc_certificate', label: 'Data Protection Commission registration certificate (current)', reason: 'A company registers with the DPC before it processes personal data, and renews every two years. We read your certificate for its dates.', tier: 4, expires: true },
  text: [
    "We can't see {company}'s registration with the Data Protection Commission",
    "You haven't added a current registration certificate from the Data Protection Commission.",
    'A company registers with the Data Protection Commission before processing personal data, and renews every two years. Processing without registration is an offence.',
    'The DPC publishes who is registered, and customers and partners check it.',
    'Register or renew with the DPC, and add the certificate here.',
  ],
});
b.rule({
  id: 'GH.DP.DPC_CHANGES', layer: 3, area: 'data_protection', stage: 2, title: 'Changes notified to the DPC within 14 days', sev: 'low', tier: 5, regulator: DPC, when: PD,
  src: [[S6, 'Changes to registered particulars notified within 14 days']],
  params: { days_to_notify: 14 },
  sat: told('gh_dpc_changes'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s DPC registration is current",
    "We don't have your confirmation that every change to your registered details was notified to the Data Protection Commission.",
    'Changes to the particulars you registered are notified to the DPC within 14 days.',
    'An out-of-date registration may not cover what you do with data.',
    'Check your registration against what you do today, notify any change, then confirm here.',
  ],
});
b.rule({
  id: 'GH.DP.PRIVACY_NOTICE', layer: 3, area: 'data_protection', stage: 2, title: 'Privacy notice (Data Protection Act)', sev: 'high', tier: 1, regulator: DPC, when: SITE,
  src: [[S6, 'Privacy notice covers the s 27(2) collection points']], law: [['Data Protection Act 2012 (Act 843)', 's 27(2)']],
  sat: yes('web.policy.privacy_notice_found'), verify: pageCheck('web.policy.privacy_notice_found'),
  evidence: ['Your published privacy notice'], action: 'fix_website',
  text: [
    "We can't find a privacy notice on {company}'s website",
    "We looked at your website and couldn't find a privacy notice.",
    'People are told what data you collect, who you are, why you collect it, who gets it and their rights.',
    "It's public, so customers, partners and the DPC can all see the gap.",
    'Publish a notice with those details and link it from every page.',
  ],
});
b.rule({
  id: 'GH.DP.RETENTION', layer: 3, area: 'data_protection', stage: 2, title: 'Personal data kept no longer than needed', sev: 'low', tier: 5, regulator: DPC, when: PD,
  src: [[S6, 'Personal data kept no longer than necessary']],
  sat: told('gh_retention'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} deletes personal data it no longer needs",
    "We don't have your confirmation that personal data is kept only as long as needed, unless a law or contract requires longer.",
    'Personal data is not kept longer than the purpose needs, with exceptions for law, contract and similar reasons.',
    'Old data you no longer need is a liability in a breach.',
    'Set retention periods for each kind of data and delete on schedule, then confirm here.',
  ],
});
b.doc({
  id: 'GH.DP.BREACH', layer: 3, area: 'data_protection', stage: 2, title: 'Security compromise plan', noun: 'security compromise plan', sev: 'medium', tier: 5, regulator: DPC, when: PD,
  src: [[S6, 'Security compromise notified to the DPC and the data subject']], law: [['Data Protection Act 2012 (Act 843)', 's 31']],
  slot: { id: 'gh_breach_plan', label: 'Security compromise response plan and log', reason: 'A compromise is reported to the DPC and the people affected as soon as reasonably practicable, so you need to know who does what first.' },
  fix: 'Write a short plan saying who decides, who tells the DPC and the people affected, and how fast, keep a log, and add both here.',
});
b.rule({
  id: 'GH.DP.DIRECT_MARKETING', layer: 3, area: 'marketing', stage: 2, title: 'Prior consent and opt-out for marketing', sev: 'medium', tier: 5, regulator: DPC, when: yes('derived.sends_marketing'),
  src: [[S6, 'Prior written consent for direct marketing'], [S9, 'Unsolicited commercial messages need prior consent and an opt-out']],
  law: [['Data Protection Act 2012 (Act 843)', 's 40'], ['Electronic Transactions Act 2008 (Act 772)', 's 50']],
  sat: told('gh_direct_marketing'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s marketing meets the consent rules",
    "We don't have your confirmation that your marketing has prior consent and that every message offers a way to unsubscribe.",
    'Direct marketing needs the person\'s prior written consent, and they can stop it at any time. Commercial messages offer an unsubscribe and, on request, where you got their details.',
    'People who did not agree can complain to the DPC.',
    'Check how you collect consent and handle unsubscribes, keep records, then confirm here.',
  ],
});

// --- Section 7: tax and payroll ------------------------------------------------------------------------------

b.doc({
  id: 'GH.TAX.GRA_REGISTRATION', layer: 3, area: 'tax', stage: 2, title: 'Registered with the GRA', noun: 'GRA registration or TIN evidence', sev: 'high', tier: 4, regulator: GRA,
  src: [[S7, 'Company registered with the GRA for tax']],
  slot: { id: 'gh_gra_registration', label: 'GRA registration or company TIN evidence', reason: 'A company registers with the Ghana Revenue Authority for its taxes.', tier: 4 },
  fix: 'Add your GRA registration or the document showing the company TIN.',
});
b.rule({
  id: 'GH.TAX.VAT_REGISTRATION', layer: 3, area: 'tax', stage: 3, title: 'VAT registration for goods above GHS 750,000', sev: 'medium', tier: 4, regulator: GRA,
  src: [[S7, 'VAT registration for goods suppliers above GHS 750,000']],
  params: { goods_threshold_ghs: 750_000 },
  sat: any(held('gh_vat_certificate'), told('gh_vat_below_threshold')), evidence: ['VAT registration certificate', 'Your confirmation'], action: 'register',
  slot: { id: 'gh_vat_certificate', label: 'VAT registration certificate', reason: 'Under the VAT Act 2025, a company supplying goods registers for VAT once its turnover passes GHS 750,000.', tier: 4 },
  text: [
    "We can't see {company}'s VAT registration",
    "You haven't added a VAT registration certificate, or confirmed the company is not over the registration threshold.",
    'From 1 January 2026, a company supplying goods registers for VAT once its turnover passes GHS 750,000.',
    'VAT not charged is still owed, with penalties and interest.',
    'Register with the GRA if you are over the limit and add the certificate, or confirm here that you are not.',
  ],
});
b.rule({
  id: 'GH.EMP.MONTHLY_PAYROLL', layer: 3, area: 'employment', stage: 2, title: 'PAYE and SSNIT paid each month', sev: 'high', tier: 5, regulator: GRA, when: STAFF,
  src: [[S7, 'PAYE return and payment by the 15th of the following month'], [S7, 'Social security at 18.5% of basic salary, 13.5% to SSNIT within 14 days']],
  params: { paye_day: 15, ssnit_days: 14, total_percent: 18.5, employee_percent: 5.5, employer_percent: 13 },
  sat: told('gh_monthly_payroll'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} pays PAYE and social security each month",
    "We don't have your confirmation that PAYE is filed and paid by the 15th, and social security paid to SSNIT within 14 days of each following month.",
    'Employers pay PAYE by the 15th of the next month. Social security is 18.5% of basic salary, 5.5% from the employee and 13% from the employer, with 13.5% to SSNIT within 14 days.',
    'Late payments bring penalties, and staff lose pension cover.',
    'Check with your payroll provider that every month is filed and paid, then confirm here.',
  ],
});
b.doc({
  id: 'GH.EMP.TIER_TWO_PENSION', layer: 3, area: 'employment', stage: 2, title: 'Second-tier pension scheme', noun: 'second-tier pension scheme agreement', sev: 'medium', tier: 4, when: STAFF,
  src: [[S7, 'Second-tier 5% paid to a corporate trustee scheme']],
  slot: { id: 'gh_tier_two_scheme', label: 'Second-tier pension trustee scheme agreement', reason: '5% of basic salary goes to a second-tier scheme run by a corporate trustee.', tier: 4 },
  fix: 'Join a licensed corporate trustee scheme, and add the agreement here.',
});
b.doc({
  id: 'GH.EMP.WRITTEN_TERMS', layer: 3, area: 'employment', stage: 2, title: 'Written contracts and statements of terms', noun: 'employment contracts and statements of terms', sev: 'medium', tier: 4, when: STAFF,
  src: [[S7, 'Written contract for employment of six months or more'], [S7, 'Written statement of main terms within two months of starting']],
  slot: { id: 'gh_employment_terms', label: 'Employment contracts, or signed statements of main terms', reason: 'Employment of six months or more is in a written contract, and each worker gets a signed statement of the main terms within two months of starting.', tier: 4 },
  fix: 'Give every worker a written contract or signed statement, keep them, and add a sample here.',
});

// --- Section 8: sector licences ----------------------------------------------------------------------------

b.doc({
  id: 'GH.FIN.PAYMENT_LICENCE', layer: 3, area: 'payments', stage: 2, title: 'Payment service licence (Bank of Ghana)', noun: 'Bank of Ghana payment licence', sev: 'high', tier: 4, regulator: 'Bank of Ghana', when: yes('derived.moves_money'),
  src: [[S8, 'Payment service provider licence under Act 987'], [S8, 'Dedicated electronic money issuer (DEMI) licence']],
  slot: { id: 'gh_payment_licence', label: 'Bank of Ghana payment service provider or electronic money issuer licence', reason: "Holding or moving customers' money needs a licence from the Bank of Ghana, or a licensed partner.", tier: 4 },
  fix: 'Add your Bank of Ghana licence, or the agreement with the licensed partner that covers you.',
});

// --- Section 9: online sales -----------------------------------------------------------------------------

b.rule({
  id: 'GH.COM.SUPPLIER_DETAILS', layer: 4, area: 'website_information', stage: 2, title: 'Who you are, on your website', sev: 'medium', tier: 1, when: ONLINE_SALES,
  src: [[S9, 'Online supplier shows full name, legal status, address, phone, email and registration number']], law: [['Electronic Transactions Act 2008 (Act 772)', 's 47(1)']],
  sat: any(all(yes('web.policy.legal_notice_present'), yes('web.policy.registration_number_shown')), told('gh_supplier_details')),
  // Details are often in a footer, not a legal notice page: only a read site with a page and no number can fail.
  verify: any(no('web.policy.legal_notice_present'), no('web.policy.language_supported')),
  evidence: ['Your website', 'Your confirmation'], action: 'fix_website',
  text: [
    "We can't see {company}'s supplier details on its website",
    "We found a legal page on your website but no company registration number, and you haven't confirmed the details are there.",
    'A business selling online shows its full name, legal status, physical address, phone, email and registration number.',
    'Customers can cancel within 14 days if the details are missing.',
    'Add the details to a legal or about page linked from every page, then confirm here.',
  ],
});
b.rule({
  id: 'GH.CONSUMER.SALE_INFORMATION', layer: 4, area: 'consumer_protection', stage: 3, title: 'Price, terms and refund policy on your website', sev: 'medium', tier: 1, when: ONLINE_SALES,
  src: [[S9, 'Online supplier shows price, payment, delivery time, terms and refund policy'], [S9, 'Missing s 47 information lets the consumer cancel within 14 days']],
  sat: any(all(yes('web.policy.terms_found'), yes('web.policy.refund_policy_found')), told('gh_sale_information')),
  verify: no('web.policy.language_supported'),
  evidence: ['Your published terms and refund policy', 'Your confirmation'], action: 'fix_website',
  text: [
    "We can't find {company}'s terms and refund policy on its website",
    "We couldn't find both terms and a refund policy on your website, and you haven't confirmed where customers see them.",
    'Before an online sale, customers see the full price, how to pay, the delivery time, the terms and the refund policy.',
    'Customers can cancel within 14 days if the information is missing.',
    'Publish your terms and refund policy and link them from checkout, or confirm here where customers see them.',
  ],
});
b.rule({
  id: 'GH.CONSUMER.GRACE_PERIOD', layer: 4, area: 'consumer_protection', stage: 3, title: 'Grace period: 14 days for goods, 7 for services', sev: 'medium', tier: 1, when: all(CONSUMER, ONLINE_SALES),
  src: [[S9, 'Grace period of 14 days for goods and 7 days for services']], law: [['Electronic Transactions Act 2008 (Act 772)', 's 49']],
  params: { goods_days: 14, services_days: 7 },
  sat: any(yes('web.policy.refund_policy_found'), told('gh_grace_period')), verify: pageCheck('web.policy.refund_policy_found'),
  evidence: ['Your published refund or cancellation page', 'Your confirmation'], action: 'fix_website',
  text: [
    "We can't see where {company} explains the right to cancel",
    "We couldn't find a refund or cancellation page on your website, and you haven't confirmed how customers are told about cancelling.",
    'Consumers buying online can cancel without reason within 14 days for goods and 7 days for services, paying only the direct cost of return.',
    'Refusing a valid cancellation leads to complaints and disputes.',
    'Publish your cancellation and refund terms and link them from checkout, or confirm here how you tell people.',
  ],
});
b.rule({
  id: 'GH.CONSUMER.ORDERING', layer: 4, area: 'consumer_protection', stage: 3, title: 'Orders reviewed before purchase and delivered in 14 days', sev: 'low', tier: 5, when: ONLINE_SALES,
  src: [[S9, 'Consumer can review terms, correct errors and withdraw before contracting'], [S9, 'Orders executed within 14 days unless agreed otherwise']],
  sat: told('gh_ordering'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed how {company} handles online orders",
    "We don't have your confirmation that customers can review and correct an order before it is placed, and that orders are delivered within 14 days unless agreed otherwise.",
    'Customers can review the terms, fix mistakes and withdraw before contracting. Orders are executed within 14 days, and if something is unavailable the customer is told at once and refunded within 7 days.',
    'Mistaken and late orders lead to disputes and refunds.',
    'Add a review step to checkout and track delivery times, then confirm here.',
  ],
});

// --- Section 10: fundraising ------------------------------------------------------------------------------

b.doc({
  id: 'GH.FUND.RETURN_OF_ISSUE', layer: 5, area: 'fundraising', stage: 4, title: 'Return of share issue filed', noun: 'return of share issue', sev: 'high', tier: 4, regulator: ORC, when: INVESTED,
  src: [[S10, 'Return of share issue to the Registrar within 28 days']],
  params: { days_to_file: 28 },
  slot: { id: 'gh_return_of_issue', label: 'Return of share issue filed with the ORC', reason: 'Each issue of shares is returned to the Registrar within 28 days, with the stated capital and the shares issued.', tier: 4 },
  fix: 'File the return of issue with the ORC for each round, and add it here.',
});
b.rule({
  id: 'GH.FUND.REGISTER_UPDATED', layer: 5, area: 'fundraising', stage: 4, title: 'New shareholders entered within 28 days', sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'New shareholders entered in the register within 28 days']],
  sat: told('gh_register_updated'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s register shows its new shareholders",
    "We don't have your confirmation that new shareholders were entered in the register of members within 28 days.",
    'New shareholders are entered in the register of members within 28 days.',
    'Investors check the register against every share issue, and gaps hold up a round.',
    'Update the register after each issue, then confirm here.',
  ],
});
b.rule({
  id: 'GH.FUND.PRIVATE_LIMITS', layer: 5, area: 'fundraising', stage: 4, title: 'No public offer, and 50 members or fewer', sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'Private company makes no public invitation and keeps 50 members or fewer']],
  params: { max_members: 50 },
  sat: told('gh_private_limits'), evidence: ['Your confirmation, with your investor list'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s rounds kept within the private company limits",
    "We don't have your confirmation that no round invited the public to buy shares, and that the company has 50 members or fewer.",
    'A private company makes no invitation to the public for its shares and keeps to 50 members, not counting employees, and certifies this with each annual return.',
    'Breaking the limits puts the company outside its form and can unwind a round.',
    'Count your members and check how each round was offered, then confirm here.',
  ],
});

// --- Section 11: AI ---------------------------------------------------------------------------------------

b.rule({
  id: 'GH.AI.AUTOMATED_DECISIONS', layer: 6, area: 'data_governance', stage: 3, title: 'Objections to automated decisions', sev: 'medium', tier: 5, regulator: DPC, when: all(yes('derived.uses_ai'), PD, yes('answers.automated_decisions')),
  src: [[S11, 'Right to object to decisions based solely on automated processing']],
  sat: told('gh_automated_decisions'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} handles objections to automated decisions",
    'You told us software makes big decisions about people by itself, and we have no confirmation of how you handle objections.',
    'A person can require, by written notice, that a decision that significantly affects them is not based only on automated processing.',
    'Ignoring such a notice is a breach of the Act, and the DPC can act on it.',
    'Set up a way to receive these notices and have a person review the decision, then confirm here.',
  ],
});

export const gh = b.build();

/** International rules the Ghanaian pack asks for in its own way. */
export const GH_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  'INTL.CORP.CONSTITUTION': ['GH.CORP.CONSTITUTION'],
  'INTL.EQUITY.CAP_TABLE': ['GH.CORP.MEMBERS_REGISTER'],
  'INTL.DP.PRIVACY_NOTICE': ['GH.DP.PRIVACY_NOTICE'],
  'INTL.SEC.INCIDENT_RESPONSE': ['GH.DP.BREACH'],
};

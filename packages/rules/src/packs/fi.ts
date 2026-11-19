import type { Logic } from '../logic.js';
import { addEuCommon, euIntlEquivalents, type EuKey } from './eu-common.js';
import { all, any, eq, held, MAPS, no, not, packBuilder, remind, told, yes } from './helper.js';

/**
 * Finland (osakeyhtiö, Oy). Draft, version 0.2.0 (EU representative and DSA rules added 18 Nov 2026): every rule waits for a lawyer. Encoded from
 * docs/knowledge/vero-scan-finland-rule-pack-map.md, plus the EU common rules (eu-common.ts).
 * Items left out, and why, are listed at the end of the Finland map ("Not encoded"). A rule
 * citing a [verify] line is needs_review, so it can only ever say "a person needs to check this".
 *
 * PRH open data (fi.prh, checked against a real reply on 16 Nov 2026) leaves out sole traders and
 * holds no people and no accounts. A miss there is "not in this open data": its `identified` fact
 * stays unknown and every rule reading it comes out "to check". Only an end state PRH states in
 * its own data (ceased, an invalidated Business ID, bankruptcy, liquidation) is called a problem.
 * Being off the VAT or employer register is never a gap on its own: below the threshold, or as an
 * occasional employer, a company need not be on them.
 */
const b = packBuilder('FI', MAPS.finland, { name: 'Finland', version: '0.2.0' });

const P = 'registry.fi.prh';
const PRH = 'PRH';
const TAX_OFFICE = 'the Finnish Tax Administration';
const OMBUDSMAN = 'the Data Protection Ombudsman';
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
const CORE = '5. The core set';

const oneOf = (key: string, values: string[]): Logic => ({ in: [{ var: key }, values] });
const includes = (value: string, key: string): Logic => ({ in: [value, { var: key }] });
const STAFF = yes('derived.employees');
const AI = yes('derived.uses_ai');
const INVESTED = yes('derived.invested');
const FOUND = yes(`${P}.identified`);
const STATUS = `${P}.status`;
const SITUATIONS = `${P}.situations`;
/** FIN-FSA's sectors (map section 8): payments, credit, crypto, investment, insurance. */
const REGULATED = any(...['payments', 'lending', 'crypto', 'securities', 'insurtech'].map((name) => yes(`derived.sector.${name}`)));

// Finland writes none of the EU common rules itself.
const OMIT: EuKey[] = [];

addEuCommon(b, {
  cc: 'FI', eu: true, authority: OMBUDSMAN, english: false, consentAge: 13, omit: OMIT,
  extraSrc: {
    PRIVACY_NOTICE: [[CORE, 'Privacy notice and cookie consent that meet the GDPR and section 205']],
    NOTICE_AUTHORITY: [[S6, 'Supervisory authority is the Data Protection Ombudsman']],
    CHILD_CONSENT: [[S6, "Children's consent age 13 for information society services"]],
    COOKIE_CONSENT: [[S6, 'Cookie consent under Act on Electronic Communications Services s 205'], [CORE, 'Privacy notice and cookie consent that meet the GDPR and section 205']],
    COOKIE_POLICY: [[S6, 'Cookie consent under Act on Electronic Communications Services s 205']],
    CONSUMER_INFO: [[S9, 'Online store pre-contract information (Consumer Protection Act ch 6)']],
    WITHDRAWAL: [[S9, '14-day withdrawal; extended to 12 months if the procedure is not explained']],
    WITHDRAWAL_FUNCTION: [[S9, 'Withdrawal function on the same interface, from 19 June 2026']],
    VAT_VIES: [[S7, 'VAT registration once turnover exceeds EUR 20,000 in a calendar year']],
  },
});

// --- Section 1: company register and status ------------------------------------------------------

b.rule({
  id: 'FI.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company status in the Finnish business register', sev: 'critical', tier: 1, regulator: PRH,
  src: [[S1, 'Company active, not in bankruptcy, liquidation or reorganisation'], [CORE, 'Registered in the Trade Register, active, a private Oy']],
  sat: all(
    eq(STATUS, 'active'),
    not(includes('bankruptcy', SITUATIONS)), not(includes('liquidation', SITUATIONS)), not(includes('reorganisation', SITUATIONS)),
  ),
  // PRH says so in its own data: the company has ceased, its Business ID is invalidated, or it is in bankruptcy or liquidation.
  defect: all(FOUND, any(oneOf(STATUS, ['ceased', 'invalidated']), includes('bankruptcy', SITUATIONS), includes('liquidation', SITUATIONS))),
  // Pending, in reorganisation, or a status we can't read: a person looks.
  verify: FOUND,
  evidence: ['Finnish business register (PRH) record'], action: 'review',
  text: [
    '{company} shows as ceased, bankrupt or in liquidation in the Finnish business register',
    "We read {company}'s record in the Finnish business register (PRH), and it shows the company as ceased, its Business ID as invalidated, or a bankruptcy or liquidation.",
    'Anyone who looks the company up, banks and investors included, sees this status first.',
    'A company in this state can have trouble with its bank, its contracts and any fundraising.',
    'Check the record on ytj.fi. If it is wrong, ask PRH to correct it; if not, get qualified advice today.',
  ],
});
b.rule({
  id: 'FI.CORP.TRADE_REGISTER', layer: 1, area: 'standing', stage: 2, title: 'Entered in the Trade Register', sev: 'high', tier: 1, regulator: PRH,
  src: [[S1, 'Registration with the Trade Register within 3 months of signing the memorandum'], [CORE, 'Registered in the Trade Register, active, a private Oy']],
  params: { months_to_notify_incorporation: 3 },
  sat: eq(`${P}.trade_register_status`, 'registered'),
  // The open data can't show the memorandum date or why a company isn't registered: a person looks.
  verify: FOUND,
  evidence: ['Finnish business register (PRH) record'], action: 'register',
  text: [
    "We can't see {company} as entered in the Finnish Trade Register",
    "We read {company}'s record in the Finnish business register (PRH), and it doesn't show the company as entered in the Trade Register.",
    'A new Oy is notified to the Trade Register within 3 months of signing the memorandum of association, or the incorporation lapses.',
    'Until it is registered, the company is not fully formed, and banks and investors will hold back.',
    'Check the record on ytj.fi. If the company was never notified, get advice on whether it has to be set up again.',
  ],
});
b.rule({
  id: 'FI.CORP.COMPANY_FORM', layer: 1, area: 'standing', stage: 2, title: 'Company form: private limited company (Oy)', sev: 'low', tier: 1, regulator: PRH,
  src: [[S1, 'Company form is a private limited company (Oy)'], [CORE, 'Registered in the Trade Register, active, a private Oy']],
  // Another form (a public Oyj, say) isn't wrong, just outside this pack: a person looks.
  sat: eq(`${P}.company_form_code`, 'OY'), verify: FOUND,
  evidence: ['Finnish business register (PRH) record'], action: 'review',
  text: [
    "{company} isn't recorded as a private limited company (Oy)",
    "We read {company}'s record in the Finnish business register (PRH), and its company form is not a private limited company.",
    'Our Finnish checks are written for a private limited company. Other forms, such as a public company (Oyj), have duties we do not cover yet.',
    'Some results may not fit the company, and some duties may be missing from them.',
    'Check the company form on ytj.fi. If it is not an Oy, read these results as a starting point only.',
  ],
});
b.doc({
  id: 'FI.CORP.REGISTER_EXTRACT', layer: 1, area: 'officers', stage: 2, title: 'Trade Register extract showing your office and board', noun: 'Trade Register extract', sev: 'medium', tier: 4, regulator: PRH,
  src: [[S1, 'Registered office and address on record'], [S4, 'Board of 1 to 5 members; a deputy member if fewer than 3'], [CORE, 'Board on record']],
  params: { board_members_min: 1, board_members_max: 5, deputy_needed_below: 3 },
  slot: { id: 'fi_trade_register_extract', label: 'Trade Register extract (kaupparekisteriote)', reason: 'PRH open data has no address and no board, so the extract is how we see your registered office and who sits on your board.', tier: 4 },
  why: 'The Trade Register holds your registered office and your board. A board has 1 to 5 members unless your articles say otherwise, and a deputy member if it has fewer than 3.',
  ifLeft: 'PRH can charge a fee when an address or a board is missing after it asks, and banks check both.',
  fix: 'Order a Trade Register extract from PRH and add it here. If your address or board is out of date, file the change with PRH.',
});
b.rule({
  id: 'FI.CORP.ANNUAL_REVIEW', layer: 1, area: 'filings', stage: 2, title: 'Yearly review of your Trade Register details', sev: 'medium', tier: 5, regulator: PRH, from: '2027-01-01',
  src: [[S1, 'Annual review of Trade Register information']],
  rec: { type: 'annual_fixed', month: 12, day: 31, monitoring: remind },
  sat: told('fi_trade_register_review'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} reviewed its Trade Register details this year",
    "We don't have your confirmation that you checked {company}'s Trade Register details this year and confirmed them to PRH.",
    'From 2027, PRH asks every company to review its Trade Register details once a year, by the end of the year.',
    'PRH can charge a fee if the review is not done after it asks.',
    'Check your details in the PRH online service, confirm or correct them, then confirm here.',
  ],
});

// --- Section 2: constitution, share register and beneficial owners ------------------------------

b.doc({
  id: 'FI.CORP.ARTICLES', layer: 1, area: 'governance', stage: 2, title: 'Articles of association (yhtiöjärjestys)', noun: 'articles of association', sev: 'high', tier: 4,
  src: [[S2, 'Memorandum of association and articles of association (yhtiöjärjestys)']],
  slot: { id: 'fi_articles', label: 'Articles of association (certified copy from PRH, or the signed memorandum)', reason: 'The articles set out how the company is run. A change takes effect only once PRH registers it.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Add the current articles as registered with PRH, or the signed memorandum of association with the articles attached.',
});
b.doc({
  id: 'FI.CORP.SHAREHOLDER_REGISTER', layer: 1, area: 'shareholders', stage: 2, title: 'Shareholder register (osakasluettelo)', noun: 'shareholder register', sev: 'high', tier: 4,
  src: [[S2, 'Shareholder register (osakasluettelo) kept by the board'], [CORE, 'Shareholder register kept']],
  slot: { id: 'fi_shareholder_register', label: 'Shareholder register (osakasluettelo)', reason: 'The board keeps a register of every shareholder and their shares, and anyone may see it at the head office.', tier: 4 },
  why: 'The board sets up the shareholder register without delay after incorporation, keeps it reliably, and lets anyone see it at the head office.',
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Bring the register up to date with every shareholder and every share, and add it here.',
});
b.rule({
  id: 'FI.CORP.SHARE_TRANSFERS', layer: 1, area: 'shareholders', stage: 2, title: 'Share transfers entered in the shareholder register', sev: 'medium', tier: 5,
  src: [[S2, 'Share transfers entered in the register; sole shareholder notified within 2 months']],
  params: { sole_shareholder_months: 2 },
  sat: told('fi_share_transfers_entered'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s share transfers are in its shareholder register",
    "We don't have your confirmation that each share transfer was entered in the shareholder register without delay.",
    "Transfers are entered without delay. A sole shareholder's holding is entered no later than two months after the shares were acquired.",
    'A transfer missing from the register is hard to prove, and investors check the register in due diligence.',
    'Enter every transfer since the company was set up, then confirm here.',
  ],
});
b.doc({
  id: 'FI.CORP.UBO', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owner notification to PRH', noun: 'beneficial owner extract', sev: 'high', tier: 4, regulator: PRH,
  src: [[S2, 'Beneficial owner notification filed with PRH'], [CORE, 'Beneficial owner notification filed']],
  slot: { id: 'fi_ubo_extract', label: 'Beneficial owner extract from PRH', reason: 'Only whether a notification exists is public, not the details, so we read your extract. Board members and the managing director can download it free.', tier: 4 },
  why: 'Every Oy tells PRH who its beneficial owners are, even when it has none, and files any change without delay.',
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Download the beneficial owner extract from PRH and add it here. If no notification was ever made, file it with PRH now.',
});
b.rule({
  id: 'FI.CORP.MINUTES', layer: 1, area: 'governance', stage: 2, title: 'Board and shareholder decisions minuted', sev: 'medium', tier: 5,
  src: [[S2, 'Board and shareholder decisions minuted']],
  sat: any(held('fi_minutes'), told('fi_minutes_kept')), evidence: ['Minutes of board and shareholder decisions', 'Your confirmation'], action: 'attest',
  slot: { id: 'fi_minutes', label: 'Minutes of board meetings and shareholder decisions', reason: 'Board and shareholder decisions are recorded in signed minutes, and banks and investors ask to see them.' },
  text: [
    "We can't see {company}'s board and shareholder minutes",
    "You haven't added the minutes of board and shareholder decisions, or confirmed that you keep them.",
    'Board meetings and shareholder decisions are recorded in minutes that are signed and kept.',
    'A decision with no minutes is hard to prove, and investors and banks ask for them.',
    'Keep signed minutes of every decision, and add them here or confirm you keep them.',
  ],
});

// --- Section 3: annual accounts and general meeting ------------------------------------------------

b.rule({
  id: 'FI.CORP.GENERAL_MEETING', layer: 1, area: 'filings', stage: 2, title: 'Annual general meeting within 6 months of the year end', sev: 'medium', tier: 5,
  src: [[S3, 'Ordinary general meeting within 6 months of financial year end']],
  rec: { type: 'after_year_end', months: 6, monitoring: remind },
  sat: told('fi_general_meeting'), evidence: ['Your confirmation', 'Minutes of the general meeting'], action: 'attest',
  text: [
    "You haven't confirmed {company} held its annual general meeting",
    "We don't have your confirmation that the ordinary general meeting was held within 6 months of the end of the financial year.",
    'The ordinary general meeting adopts the financial statements and decides how the profit is used, within 6 months of the year end.',
    'Accounts that were never adopted cannot be filed with PRH on time.',
    'Hold the meeting, keep the minutes, then confirm here.',
  ],
});
b.doc({
  id: 'FI.CORP.ACCOUNTS_FILING', layer: 1, area: 'filings', stage: 2, title: 'Financial statements filed with PRH', noun: 'financial statements filing receipt', sev: 'high', tier: 4, regulator: PRH, penalty: 'moderate',
  src: [
    [S3, 'Financial statements filed with the Trade Register within 8 months of year end'], [S3, 'Documents filed with the accounts'],
    [CORE, 'Financial statements filed within 8 months of each year end'],
  ],
  rec: { type: 'after_year_end', months: 8, monitoring: remind },
  params: { months_after_year_end: 8, months_after_adoption: 2 },
  slot: { id: 'fi_accounts_filing', label: 'PRH filing receipt for the financial statements, or a Trade Register extract showing them', reason: 'Financial statements reach PRH within 8 months of the year end, even for a company that did not trade. PRH open data has no accounts, so we need the receipt.', tier: 4 },
  ifLeft: 'PRH charges a late filing fee that grows with the delay and doubles after two missed years, and it can later remove the company from the register.',
  fix: 'File the adopted financial statements with PRH, signed and with any audit report, and add the receipt here.',
});

// --- Section 4: board, managing director and auditor ----------------------------------------------

b.rule({
  id: 'FI.CORP.EEA_RESIDENCY', layer: 1, area: 'officers', stage: 2, title: 'Board and managing director meet the EEA residency rule', sev: 'medium', tier: 5, regulator: PRH, review: true,
  src: [
    [S4, 'At least one board member resident in the EEA, or a PRH exemption'], [S4, 'Managing director (if appointed) resident in the EEA, or a PRH exemption'],
    [CORE, 'Board on record, with at least one EEA-resident member or a PRH exemption'],
  ],
  sat: told('fi_eea_residency'), evidence: ['Your confirmation', 'PRH exemption decision, if any'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s board meets the EEA residency rule",
    "We don't have your confirmation that the board, and the managing director if you have one, meet the rule on living in the EEA. Where people live is not published.",
    'Finnish company law asks that the managing director, and a set part of the board, live in the EEA, unless PRH grants an exemption.',
    'Registrations and bank checks can be held up until it is sorted out.',
    'Check where each board member and the managing director live. If someone lives outside the EEA, ask PRH for an exemption. Then confirm here.',
  ],
});
b.rule({
  id: 'FI.CORP.BOARD_ELIGIBILITY', layer: 1, area: 'officers', stage: 2, title: 'Board members who can lawfully serve', sev: 'low', tier: 5,
  src: [[S4, 'Board members are natural persons, adult, not bankrupt or under business prohibition']],
  sat: told('fi_board_eligible'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s board members can serve",
    "We don't have your confirmation that each board member is a person rather than a company, an adult, not bankrupt and not banned from business.",
    'Only people can sit on the board of an Oy, and each must be an adult who is not bankrupt or under a business prohibition.',
    'An appointment that breaks this rule is not valid, which can put board decisions in doubt.',
    'Check each board member against these points, then confirm here.',
  ],
});
b.rule({
  id: 'FI.CORP.AUDITOR', layer: 1, area: 'filings', stage: 3, title: 'Auditor appointed when the company passes the size limits', sev: 'medium', tier: 5, review: true,
  src: [[S4, 'Auditor appointed when two of three thresholds are exceeded']],
  sat: told('fi_auditor_checked'), evidence: ['Your confirmation', 'Audit report filed with the accounts'], action: 'attest',
  text: [
    "You haven't confirmed whether {company} needs an auditor",
    "We don't have your confirmation that you checked whether the company has passed the size limits that call for an auditor, or whether your articles ask for one.",
    'A company that passes two of three size limits (balance sheet, net sales and staff) in both of its last two financial years must appoint an auditor.',
    'Accounts filed without a required audit report are incomplete, and investors and banks look for it.',
    'Check your last two years against the limits. If you need an auditor, appoint one and file the audit report with your accounts. Then confirm here.',
  ],
});

// --- Section 5: intellectual property --------------------------------------------------------------

b.rule({
  id: 'FI.IP.EMPLOYEE_SOFTWARE', layer: 2, area: 'ip_ownership', stage: 2, title: 'Code written by employees as part of their job', sev: 'low', tier: 5, when: STAFF,
  src: [[S5, 'Software written by employees belongs to the employer by law']],
  sat: told('fi_employee_code_in_duties'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s code is written as part of employees' jobs",
    "We don't have your confirmation that the software your employees write is part of their job duties.",
    'Finnish law gives the employer the copyright in programs, related works and databases that employees make as part of their duties. It does not cover contractors or anyone who is not an employee.',
    "Code written outside someone's duties may stay theirs, and investors check who owns the product.",
    'Make sure job descriptions or contracts cover the code each employee writes, then confirm here.',
  ],
});
b.rule({
  id: 'FI.IP.EMPLOYEE_INVENTIONS', layer: 2, area: 'ip_ownership', stage: 3, title: 'Employee inventions reported and claimed in time', sev: 'medium', tier: 5, when: all(STAFF, yes('answers.has_patentable_technology')),
  src: [[S5, 'Employee inventions: notice to employer; employer claims within 4 months; reasonable compensation']],
  params: { months_to_claim: 4 },
  sat: any(held('fi_invention_policy'), told('fi_invention_policy')), evidence: ['Invention policy and notices', 'Your confirmation'], action: 'attest',
  slot: { id: 'fi_invention_policy', label: 'Employee invention policy and invention notices', reason: 'Employees report inventions in writing, and the company has 4 months from the notice to claim them.' },
  text: [
    "We can't see how {company} handles employee inventions",
    "You haven't added an invention policy, or confirmed how employees report inventions and how you claim them.",
    'An employee who makes an invention must tell the employer in writing without delay. The employer has 4 months from the notice to claim it, and owes reasonable pay for it.',
    'An invention not claimed in time stays with the employee, and investors check this for patentable technology.',
    'Set up a short invention policy with a notice form and a claim step, and add it here or confirm you have one.',
  ],
});
b.rule({
  id: 'FI.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'Trade mark (Finnish or EU)', sev: 'medium', tier: 4, regulator: PRH,
  src: [
    [S5, 'Finnish trademark registered with PRH'],
    ['EU Section 11 —', 'Brand protected by an EU trade mark or a national mark in each operating market', MAPS.eu], ['EU Section 11 —', 'Renewal every 10 years from filing', MAPS.eu],
  ],
  rec: { type: 'every_years', from_fact: 'vault.fi_trademark.dated', years: 10, monitoring: remind },
  sat: held('fi_trademark'), evidence: ['Trade mark certificate'], action: 'file',
  slot: { id: 'fi_trademark', label: 'PRH or EU trade mark registration certificate', reason: 'There is no PRH trade mark lookup we can use yet, so we read your certificate. A mark lasts 10 years and can be renewed.', tier: 4 },
  text: [
    "We can't see a trade mark for {company}",
    "You haven't added a Finnish or EU trade mark certificate, and we can't look marks up at PRH yet.",
    "Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.',
    'File your brand with PRH, or as an EU trade mark, or add your certificate here. Renew it every 10 years.',
  ],
});

// --- Section 7: tax and employer registration ------------------------------------------------------

b.rule({
  id: 'FI.TAX.VAT_REGISTER', layer: 3, area: 'tax', stage: 3, title: 'On the VAT register once sales pass the threshold', sev: 'medium', tier: 1, regulator: TAX_OFFICE,
  src: [[S7, 'VAT registration once turnover exceeds EUR 20,000 in a calendar year']],
  params: { threshold_eur_per_calendar_year: 20000 },
  // Below the threshold, registering is optional: off the register is "to check", never a gap.
  sat: any(yes(`${P}.in_vat_register`), told('fi_vat_below_threshold')), verify: no(`${P}.in_vat_register`),
  evidence: ['Finnish business register (PRH) record', 'Your confirmation'], action: 'register',
  text: [
    "{company} isn't on the Finnish VAT register",
    "We read {company}'s record in the Finnish business register, and it isn't on the VAT register. You haven't told us your sales are below the threshold.",
    'A company registers for VAT once its sales pass EUR 20,000 in a calendar year, from the day they pass it.',
    "Late registration is backdated to that day, so VAT you didn't charge can still be due.",
    'Check your sales this year. If they are over EUR 20,000, register with the Tax Administration. If not, confirm here.',
  ],
});
b.rule({
  id: 'FI.EMP.EMPLOYER_REGISTER', layer: 3, area: 'employment', stage: 2, title: 'On the employer register as a regular employer', sev: 'medium', tier: 1, regulator: TAX_OFFICE, when: STAFF,
  src: [[S7, 'Employer register for regular employers'], [CORE, 'Employer register entry once a regular employer']],
  // An occasional employer need not register, so off the register is "to check", never a gap.
  sat: any(yes(`${P}.in_employer_register`), told('fi_occasional_employer')), verify: no(`${P}.in_employer_register`),
  evidence: ['Finnish business register (PRH) record', 'Your confirmation'], action: 'register',
  text: [
    "{company} isn't on the Finnish employer register",
    "We read {company}'s record in the Finnish business register, and it isn't on the employer register. You haven't told us you only employ people now and then.",
    'A regular employer must be on the employer register: one that regularly pays 2 or more employees, or 1 plus temporary staff, or 6 or more at once.',
    "The register is public, so partners and customers who check it won't find you there.",
    'If you are a regular employer, register with the Tax Administration. If you only employ people now and then, confirm here.',
  ],
});
b.rule({
  id: 'FI.EMP.INCOMES_REGISTER', layer: 3, area: 'employment', stage: 2, title: 'Wages reported to the Incomes Register', sev: 'medium', tier: 5, when: STAFF, review: true,
  src: [[S7, 'Wages and contributions reported to the Incomes Register']],
  sat: told('fi_incomes_register'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} reports wages to the Incomes Register",
    "We don't have your confirmation that each wage payment, and the contributions on it, is reported to the Incomes Register.",
    'Employers in Finland report wages and contributions to the Incomes Register.',
    'Gaps in reporting come up in tax audits and when staff claim benefits.',
    'Check with your payroll provider that every payment is reported, then confirm here.',
  ],
});

// --- Section 8: sector licences --------------------------------------------------------------------

b.doc({
  id: 'FI.FIN.AUTHORISATION', layer: 3, area: 'payments', stage: 2, title: 'FIN-FSA authorisation or notification', noun: 'FIN-FSA authorisation or notification', sev: 'high', tier: 4, regulator: 'FIN-FSA',
  when: REGULATED, review: true,
  src: [[S8, 'FIN-FSA authorisation or notification before a regulated financial activity']],
  slot: { id: 'fi_fin_fsa_authorisation', label: 'FIN-FSA authorisation or notification', reason: 'Payments, credit, crypto, investment and insurance business needs an authorisation from FIN-FSA, or a notification to it, before it starts.', tier: 4 },
  fix: 'Add your FIN-FSA authorisation or notification, or the agreement with the licensed partner that covers you.',
});

// --- Section 10: fundraising -----------------------------------------------------------------------

b.doc({
  id: 'FI.FUND.SHARE_ISSUE_DECISION', layer: 5, area: 'fundraising', stage: 4, title: 'Decision behind each share issue', noun: 'share issue decisions', sev: 'high', tier: 5, when: INVESTED,
  src: [[S10, 'Share issue decided by the general meeting, or by the board under an authorisation']],
  params: { months_to_register_authorisation: 1 },
  slot: { id: 'fi_share_issue_decision', label: 'Share issue decisions (general meeting, or board under an authorisation)', reason: 'Each share issue is decided by the general meeting, or by the board under an authorisation that is notified for registration within a month.' },
  fix: 'Add the decision behind each share issue, and the authorisation if the board made the decision.',
});
b.doc({
  id: 'FI.FUND.SHARE_ISSUE_REGISTERED', layer: 5, area: 'fundraising', stage: 4, title: 'Share issues registered with PRH', noun: 'Trade Register extract showing your share issues', sev: 'high', tier: 4, regulator: PRH, when: INVESTED,
  src: [[S10, 'Share issue decision notified for registration within one month'], [S10, 'New shares registered once paid, within 5 years of the decision or they lapse']],
  params: { months_to_notify: 1, years_to_register_shares: 5 },
  slot: { id: 'fi_share_issue_registration', label: 'Trade Register extract showing each share issue', reason: 'A share issue decision is notified for registration within a month, and the new shares are registered once paid. Shares not registered in time lapse.', tier: 4 },
  ifLeft: 'Shares that were never registered may not exist, and an investor will find that in due diligence.',
  fix: 'Order a Trade Register extract that shows each share issue, and add it here.',
});
b.rule({
  id: 'FI.FUND.REGISTER_UPDATED', layer: 5, area: 'fundraising', stage: 4, title: 'Shareholder register updated after each share issue', sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'Shareholder register updated after the issue']],
  sat: told('fi_register_updated_after_issue'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s shareholder register shows its new shares",
    "We don't have your confirmation that the shareholder register was updated after each share issue.",
    'The board keeps the shareholder register up to date, so each new shareholder and share is entered after an issue.',
    'Investors compare the register with the share issues, and a mismatch holds up a round.',
    'Enter the shares from each issue in the register, then confirm here.',
  ],
});

// --- Section 11: AI --------------------------------------------------------------------------------

b.rule({
  id: 'FI.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI use disclosed to users', sev: 'low', tier: 1, regulator: 'Traficom', when: AI, from: '2026-08-02',
  shared: 'ai_transparency',
  src: [[S11, 'AI transparency duties supervised by Traficom']],
  // The scan may not recognise every wording: a miss on a Finnish or Swedish site is "to check".
  sat: any(yes('web.policy.ai_disclosure_found'), held('fi_ai_transparency')), verify: no('web.policy.ai_disclosure_found'),
  evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'fi_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI, and AI-made content has to be marked.' },
  text: [
    "We can't see where {company} tells people it uses AI",
    "We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.",
    'Since 2 August 2026, people must be told when they deal with AI from the first contact, AI-made content is marked, and deep fakes are labelled. Traficom supervises this.',
    'Enterprise customers and investors are starting to ask, and you would have no answer ready.',
    'Say on your website where your product uses AI, or add your transparency records here.',
  ],
});

export const fi = b.build();

/** International rules the Finnish pack asks for in its own way. */
export const FI_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  ...euIntlEquivalents('FI', true, OMIT),
  'INTL.CORP.CONSTITUTION': ['FI.CORP.ARTICLES'],
  'INTL.CORP.RESOLUTIONS': ['FI.CORP.MINUTES'],
  'INTL.EQUITY.CAP_TABLE': ['FI.CORP.SHAREHOLDER_REGISTER'],
};

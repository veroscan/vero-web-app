import type { Logic } from '../logic.js';
import { addEuCommon, euIntlEquivalents, euObligation, type EuKey } from './eu-common.js';
import { all, any, atLeast, held, MAPS, no, packBuilder, remind, told, yes } from './helper.js';

/**
 * Denmark (anpartsselskab ApS, aktieselskab A/S). Draft, version 0.2.0 (EU representative and DSA rules added 18 Nov 2026): every rule waits for a
 * lawyer. Encoded from docs/knowledge/vero-scan-denmark-rule-pack-map.md, plus the EU common
 * rules (eu-common.ts). Items left out, and why, are listed at the end of the Denmark map ("Not
 * encoded"). A rule citing a [verify] line is needs_review, so it can only ever say "a person
 * needs to check this".
 *
 * The CVR source (dk.cvr) has never been tried against a real reply, and it is off until its
 * credentials are set. Its status words ("NORMAL", "Aktiv", "Ophørt"...) and how it labels the
 * management bodies are unconfirmed, so nothing it says is ever called a problem: a status we
 * can read as active passes, and anything else found is "to check". A miss, or the source being
 * off, leaves `identified` unknown, which the engine reads as "to check" too.
 */
const b = packBuilder('DK', MAPS.denmark, { name: 'Denmark', version: '0.2.0' });

const P = 'registry.dk.cvr';
const ERST = 'Erhvervsstyrelsen';
const DATATILSYNET = 'Datatilsynet';
const S1 = 'Section 1 —';
const S2 = 'Section 2 —';
const S3 = 'Section 3 —';
const S4 = 'Section 4 —';
const S5 = 'Section 5 —';
const S6 = 'Section 6 —';
const S7 = 'Section 7 —';
const S9 = 'Section 9 —';
const S10 = 'Section 10 —';
const S11 = 'Section 11 —';
const CORE = '5. The core set';

const oneOf = (key: string, values: string[]): Logic => ({ in: [{ var: key }, values] });
/** Company form from the questionnaire: an aktieselskab. */
const AS = oneOf('company.entity_type', ['as']);
const PD = yes('derived.personal_data');
const STAFF = yes('derived.employees');
const AI = yes('derived.uses_ai');
const INVESTED = yes('derived.invested');
const CONSUMER = yes('derived.consumer');
const SITE = yes('derived.has_website_or_app');
const FOUND = yes(`${P}.identified`);
/**
 * Status words that clearly mean active. CVR keeps the status as given, lower-cased here; the
 * source notes name "NORMAL" and "Aktiv" (docs/NATIONAL-REGISTERS.md). Map the rest after the
 * first real reply.
 */
const ACTIVE_WORDS = ['normal', 'aktiv'];

// EU common rules Denmark writes itself, with the same shared obligation.
const OMIT: EuKey[] = ['UBO_ANNUAL_CHECK'];

addEuCommon(b, {
  cc: 'DK', eu: true, authority: DATATILSYNET, english: false, consentAge: 13, omit: OMIT,
  extraSrc: {
    PRIVACY_NOTICE: [[S6, '| Privacy notice published |'], [CORE, 'Privacy notice and prior cookie consent on the website']],
    CHILD_CONSENT: [[S6, "Children's consent: age 13 for online services offered directly to children"]],
    COOKIE_CONSENT: [[S6, 'Cookie consent after full information, before non-essential storage'], [CORE, 'Privacy notice and prior cookie consent on the website']],
    COOKIE_POLICY: [[S6, 'Cookie consent after full information, before non-essential storage']],
    WEBSITE_IDENTITY: [[S9, 'Website and e-mails show name, registered office (hjemsted) and CVR number'], [CORE, 'Name, hjemsted, CVR number, address and e-mail on the website']],
    COMPANY_PARTICULARS: [[S9, 'Website and e-mails show name, registered office (hjemsted) and CVR number']],
  },
});

// --- Section 1: company register and status ------------------------------------------------------

b.rule({
  id: 'DK.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company status in the Danish company register (CVR)', sev: 'high', tier: 1, regulator: ERST,
  src: [[S1, 'Registered with Erhvervsstyrelsen within 2 weeks of signing the founding document'], [S1, '| Company active |'], [CORE, 'In CVR as ApS or A/S, active']],
  params: { weeks_to_register: 2 },
  sat: oneOf(`${P}.status`, ACTIVE_WORDS),
  // The status words are unconfirmed: any other status found is for a person to read, never a problem.
  verify: FOUND,
  evidence: ['Danish company register (CVR) record'], action: 'review',
  text: [
    "We can't confirm {company} is active in the Danish company register",
    "We read {company}'s record in the Danish company register (CVR), and its status is not one we can read as active yet.",
    'Anyone who looks the company up, banks and investors included, sees this status first.',
    'If the company is no longer active, it can have trouble with its bank, its contracts and any fundraising.',
    'Check the record on datacvr.virk.dk. If the status is wrong, contact Erhvervsstyrelsen; if not, get qualified advice.',
  ],
});
b.rule({
  id: 'DK.CORP.LEGAL_FORM', layer: 1, area: 'standing', stage: 2, title: 'Company form: ApS or A/S', sev: 'low', tier: 1, regulator: ERST,
  src: [[S1, 'Company form is ApS or A/S, and the name says so'], [CORE, 'In CVR as ApS or A/S, active']],
  // Company-form codes 60 (aktieselskab) and 80 (anpartsselskab), Danmarks Statistik's list. Anything else isn't wrong, just outside this pack.
  sat: oneOf(`${P}.legal_form_code`, ['60', '80']), verify: FOUND,
  evidence: ['Danish company register (CVR) record'], action: 'review',
  text: [
    "{company} isn't recorded as an ApS or an A/S",
    "We read {company}'s record in the Danish company register (CVR), and its company form is not one we read as an ApS or an A/S.",
    'Our Danish checks are written for an anpartsselskab (ApS) or an aktieselskab (A/S), and the name has to show which one it is.',
    'Some results may not fit the company, and some duties may be missing from them.',
    'Check the company form and name on datacvr.virk.dk. If it is not an ApS or A/S, read these results as a starting point only.',
  ],
});
b.rule({
  id: 'DK.CORP.CHANGES_FILED', layer: 1, area: 'filings', stage: 2, title: 'Changes registered within 2 weeks', sev: 'medium', tier: 5, regulator: ERST,
  src: [[S1, 'Registrable changes filed within 2 weeks']],
  params: { weeks_to_file: 2 },
  sat: told('dk_changes_filed'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} registers its changes on time",
    "We don't have your confirmation that each change the law asks you to register, such as new management or new articles, went to Erhvervsstyrelsen within 2 weeks of the decision.",
    'Changes that have to be registered are filed within 2 weeks of the decision.',
    'An out-of-date register misleads banks, customers and investors who rely on it.',
    'Check the register against your decisions since the company was set up, file anything missing, then confirm here.',
  ],
});

// --- Section 2: constitution, capital, owners and beneficial owners ------------------------------

b.doc({
  id: 'DK.CORP.ARTICLES', layer: 1, area: 'governance', stage: 2, title: 'Articles of association (vedtægter)', noun: 'articles of association', sev: 'high', tier: 4,
  src: [[S2, 'Articles (vedtægter) state name, object, capital'], [CORE, 'Articles, owner register, significant owners and beneficial owners registered']],
  slot: { id: 'dk_articles', label: 'Articles of association (vedtægter), current version', reason: 'The articles state the name, object, share capital and share rights, and are part of the signed founding document.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Add the current articles, with every change made since the company was set up.',
});
b.rule({
  id: 'DK.CORP.SHARE_CAPITAL', layer: 1, area: 'shareholders', stage: 2, title: 'Minimum share capital, paid in', sev: 'medium', tier: 4,
  src: [
    [S2, 'Share capital at least DKK 20,000 (ApS) or DKK 400,000 (A/S)'], [S2, 'At least 25% of capital, and at least DKK 20,000, paid in at registration'],
    [CORE, 'Capital at least DKK 20,000 (ApS) or 400,000 (A/S), at least 25% paid'],
  ],
  params: { aps_minimum_dkk: 20000, as_minimum_dkk: 400000, paid_in_share: 0.25, paid_in_minimum_dkk: 20000 },
  sat: any(held('dk_capital_payment'), told('dk_share_capital')), evidence: ['Proof the capital was paid in', 'Your confirmation'], action: 'attest',
  slot: { id: 'dk_capital_payment', label: 'Proof the share capital was paid in (bank statement or auditor statement)', reason: 'At least a quarter of the capital, and at least DKK 20,000, is paid in when the company is registered, and must stay paid.', tier: 4 },
  text: [
    "We can't see that {company}'s share capital meets the minimum",
    "You haven't added proof the share capital was paid in, or confirmed it meets the minimum. CVR's capital figures aren't read yet.",
    'An ApS has at least DKK 20,000 of share capital and an A/S at least DKK 400,000. At least 25% of it, and at least DKK 20,000, is paid in at registration and stays paid.',
    'Capital below the minimum, or not paid in, can stop the company being registered, and banks and investors check it.',
    'Add proof of payment here, or confirm the capital meets the minimum and is paid in as required.',
  ],
});
b.rule({
  id: 'DK.CORP.OWNER_REGISTER', layer: 1, area: 'shareholders', stage: 2, title: 'Owner register (ejerbog)', sev: 'medium', tier: 5,
  src: [[S2, 'Owner register (ejerbog) set up as soon as possible, kept in the EU/EEA'], [CORE, 'Articles, owner register, significant owners and beneficial owners registered']],
  sat: told('dk_owner_register'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps its owner register",
    "We don't have your confirmation that the company set up its owner register (ejerbog), keeps it in the EU or EEA, and keeps it up to date.",
    "Every company keeps a register of its shareholders as soon as possible after it is set up. It can be kept in Erhvervsstyrelsen's IT system, and public authorities may ask to see it.",
    'Without it, who owns which shares is hard to prove, and investors check it in due diligence.',
    'Set up the register with every shareholder and share, then confirm here.',
  ],
});
b.rule({
  id: 'DK.CORP.MAJOR_HOLDINGS', layer: 1, area: 'shareholders', stage: 2, title: 'Holders of 5% or more tell the company', sev: 'low', tier: 5,
  src: [[S2, 'Holders of 5% or more notify the company within 2 weeks']],
  params: { weeks_to_notify: 2, thresholds_percent: [5, 10, 15, 20, 25, 50, 90, 100], thresholds_fraction: ['1/3', '2/3'] },
  sat: told('dk_holdings_notified'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has the notices from its larger shareholders",
    "We don't have your confirmation that each shareholder with 5% or more told the company within 2 weeks, and again at each further threshold.",
    'Shareholders tell the company within 2 weeks when they reach 5%, and when they cross 10, 15, 20, 25, 50, 90 or 100%, or a third or two thirds.',
    'The company relies on these notices to keep its owner records right.',
    'Check you have a notice for each larger shareholder and each change, then confirm here.',
  ],
});
b.rule({
  id: 'DK.CORP.SIGNIFICANT_OWNERS', layer: 1, area: 'shareholders', stage: 2, title: 'Significant owners in the public owner register', sev: 'medium', tier: 5, regulator: ERST,
  src: [[S2, 'Significant owners (or "none") registered'], [CORE, 'Articles, owner register, significant owners and beneficial owners registered']],
  sat: told('dk_significant_owners_registered'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s significant owners are registered",
    "We don't have your confirmation that the company's significant owners, or the fact that it has none, are in Erhvervsstyrelsen's public owner register.",
    'Significant owners are registered when the company is set up, and each change as soon as possible.',
    'Banks and investors read the public owner register, and a gap there raises questions.',
    'Check the register on datacvr.virk.dk, update it on virk.dk if needed, then confirm here.',
  ],
});
b.rule({
  id: 'DK.CORP.UBO', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owners identified and registered', sev: 'high', tier: 5, regulator: ERST,
  src: [
    [S2, 'Beneficial owners identified and registered as soon as possible'], [S2, 'Beneficial-owner evidence kept 5 years'],
    [CORE, 'Articles, owner register, significant owners and beneficial owners registered'],
  ],
  params: { evidence_kept_years: 5 },
  sat: told('dk_beneficial_owners_registered'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has registered its beneficial owners",
    "We don't have your confirmation that the company identified its beneficial owners, registered them with Erhvervsstyrelsen, and keeps the evidence. The register is not public.",
    'Every company registers its beneficial owners as soon as possible. If none can be identified, the executive managers are registered instead. The evidence is kept for 5 years.',
    'Banks and other businesses that must check their customers ask for it when they onboard you.',
    'Identify who ultimately owns or controls the company, register them on virk.dk, keep your notes, then confirm here.',
  ],
});
b.rule({
  id: 'DK.CORP.UBO_ANNUAL_CHECK', layer: 1, area: 'beneficial_ownership', stage: 3, title: 'Yearly review of beneficial owners', sev: 'medium', tier: 5,
  shared: euObligation('UBO_ANNUAL_CHECK'),
  src: [[S2, 'Beneficial owners reviewed at least once a year'], ['EU Section 6 —', 'Annual check that the information is current (from 10 Jul 2027)', MAPS.eu]],
  law: [['Selskabsloven', '§58a(4)'], ['Regulation (EU) 2024/1624', 'Art 63']],
  sat: any(held('dk_ubo_review_minutes'), told('eu_ubo_annual_check')), evidence: ['Minutes of the annual meeting', 'Your confirmation'], action: 'attest',
  slot: { id: 'dk_ubo_review_minutes', label: 'Minutes showing the yearly beneficial-owner review', reason: 'The yearly review of beneficial owners is presented at the general meeting that approves the annual report.' },
  text: [
    "You haven't confirmed {company} reviewed its beneficial owners this year",
    "We don't have your confirmation that the beneficial owners were reviewed this year and the result presented at the meeting that approved the annual report.",
    'Danish companies review their beneficial-owner information at least once a year, and present the result at the annual general meeting.',
    'Out-of-date details mislead the banks and authorities that rely on them.',
    'Check the registered details, update any change, record the review in the minutes, and add them here or confirm.',
  ],
});

// --- Section 3: annual report and general meeting ------------------------------------------------

b.doc({
  id: 'DK.CORP.ANNUAL_REPORT', layer: 1, area: 'filings', stage: 3, title: 'Annual report filed with Erhvervsstyrelsen', noun: 'annual report', sev: 'high', tier: 4, regulator: ERST,
  src: [[S3, 'Annual report filed with Erhvervsstyrelsen without undue delay after approval'], [CORE, 'Annual report filed within 6 months']],
  rec: { type: 'after_year_end', months: 6, monitoring: remind },
  params: { months_after_year_end: 6, months_after_year_end_class_d: 4 },
  slot: { id: 'dk_annual_report', label: 'Approved annual report, or the CVR filing receipt', reason: 'The approved annual report reaches Erhvervsstyrelsen within 6 months of the year end, with no extension. Filed reports are not read yet, so we need yours.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'File the approved annual report with Erhvervsstyrelsen and add it, or the filing receipt, here.',
});
b.doc({
  id: 'DK.CORP.GENERAL_MEETING', layer: 1, area: 'governance', stage: 3, title: 'Annual general meeting minutes', noun: 'annual general meeting minutes', sev: 'medium', tier: 4,
  src: [[S3, 'Ordinary general meeting in time to file the approved report']],
  slot: { id: 'dk_agm_minutes', label: 'Minutes of the ordinary general meeting', reason: 'The ordinary general meeting approves the annual report and decides on profit or loss, in time for the report to be filed.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Hold the meeting in time to file the report, and add the signed minutes here.',
});

// --- Section 4: management and auditor -----------------------------------------------------------

b.rule({
  id: 'DK.CORP.MANAGEMENT', layer: 1, area: 'officers', stage: 2, title: 'Executive management on record', sev: 'high', tier: 1, regulator: ERST,
  src: [[S4, 'A recognised management structure'], [S1, 'Management and auditor registered'], [CORE, 'Management registered; an A/S board of at least 3']],
  sat: atLeast(`${P}.executive_members_count`, 1),
  // How CVR labels management bodies is unconfirmed: a count of none is for a person to read.
  verify: FOUND,
  evidence: ['Danish company register (CVR) record'], action: 'file',
  text: [
    "We can't see {company}'s management in the Danish company register",
    "We read {company}'s record in the Danish company register (CVR) and found no member of the executive management (direktion).",
    'Every ApS and A/S has an executive management, alone or with a board, and its members are registered with Erhvervsstyrelsen.',
    'Nobody shows as able to run and sign for the company, which holds up banks and investors.',
    'Check the record on datacvr.virk.dk, and register the management with Erhvervsstyrelsen if it is missing.',
  ],
});
b.rule({
  id: 'DK.CORP.AS_BOARD', layer: 1, area: 'officers', stage: 2, title: 'A/S board of at least 3 members', sev: 'medium', tier: 1, regulator: ERST, when: AS, review: true,
  src: [[S4, 'A/S board or supervisory board has at least 3 members'], [CORE, 'Management registered; an A/S board of at least 3']],
  params: { min_members: 3 },
  sat: atLeast(`${P}.board_members_count`, 3),
  evidence: ['Danish company register (CVR) record'], action: 'file',
  text: [
    "We can't see a board of at least 3 for {company} in the Danish company register",
    "We read {company}'s record in the Danish company register (CVR) and found fewer than 3 board members.",
    'An A/S has a board, or a supervisory board, of at least 3 members.',
    'Decisions made by a board that is too small can be challenged, and investors check it.',
    'Check the record on datacvr.virk.dk, and appoint and register the missing members if the board is too small.',
  ],
});
b.rule({
  id: 'DK.CORP.AS_BOARD_INDEPENDENCE', layer: 1, area: 'officers', stage: 2, title: 'A/S board: most members are not executives', sev: 'low', tier: 5, when: AS,
  src: [[S4, 'A/S: majority of the board are not executives; an executive cannot chair']],
  sat: told('dk_as_board_majority'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s board is mostly people who are not executives",
    "We don't have your confirmation that most of the board are not executives, and that the chair is not an executive. The register shows counts, not who holds both roles.",
    'In an A/S with a board and an executive management, most of the board must not be executives, and an executive cannot chair the board.',
    'A board set up the wrong way can have its decisions questioned.',
    'Check who sits on both bodies, change the board if needed, then confirm here.',
  ],
});
b.rule({
  id: 'DK.CORP.AUDIT', layer: 1, area: 'filings', stage: 2, title: 'Audit, or a valid audit opt-out', sev: 'medium', tier: 4, regulator: ERST,
  src: [
    [S4, 'Audit, unless a valid opt-out'], [S1, 'Management and auditor registered'],
    [CORE, 'Annual report filed within 6 months, with audit or a valid opt-out'],
  ],
  params: { opt_out_balance_dkk: 4_000_000, opt_out_revenue_dkk: 8_000_000, opt_out_staff: 12, opt_out_consecutive_years: 2, no_opt_out_balance_dkk: 50_000_000 },
  sat: held('dk_audit'), evidence: ["Auditor's report, or the opt-out statement"], action: 'upload',
  slot: { id: 'dk_audit', label: "Auditor's report, or the audit opt-out statement in your annual report", reason: 'A company is audited unless it may opt out, and the annual report says which. An auditor you appoint is registered with Erhvervsstyrelsen.', tier: 4 },
  text: [
    "We don't have {company}'s audit report or audit opt-out on file",
    "You haven't added an auditor's report, or the statement in your annual report that the company opted out of audit.",
    'A class B company may opt out of audit if, two years running, it stays under two of these: DKK 4m balance sheet, DKK 8m net revenue, 12 full-time staff. Above DKK 50m balance sheet two years running, it cannot.',
    'An annual report without a required audit is incomplete, and banks and investors ask for it.',
    "Add the auditor's report, or the page of your annual report with the opt-out statement. If you have an auditor, check they are registered.",
  ],
});

// --- Section 5: intellectual property --------------------------------------------------------------

b.doc({
  id: 'DK.IP.EMPLOYEE_INVENTIONS', layer: 2, area: 'ip_ownership', stage: 2, title: 'Employee inventions: your right to claim them', noun: 'employment contract clause on inventions', sev: 'medium', tier: 5, when: STAFF,
  src: [[S5, "Employee inventions: employer's right to claim"]],
  params: { months_to_claim: 4, months_after_leaving_presumed: 6 },
  slot: { id: 'dk_employee_ip_clause', label: 'Employment contract clause on inventions and IP', reason: 'You can claim an invention an employee makes in their work, if you do it within 4 months of being told. A clear clause sets out how.' },
  why: 'An employee tells you about an invention made in their work without undue delay. You can claim it within 4 months of the notice, and reasonable pay is due to them even if you agreed otherwise.',
  fix: 'Add a clause on inventions and IP to your employment contracts, with a way for employees to report inventions, and add it here.',
});
b.rule({
  id: 'DK.IP.EMPLOYEE_SOFTWARE', layer: 2, area: 'ip_ownership', stage: 2, title: 'Code written by employees at work', sev: 'low', tier: 5, when: STAFF,
  src: [[S5, 'Software written by employees belongs to the employer']],
  sat: told('dk_employee_code_at_work'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s code is written by employees at work",
    "We don't have your confirmation that the software your employees write is made as part of their work or on your instructions.",
    'Danish law passes to the employer the copyright in a program an employee makes at work or on its instructions. It does not cover other kinds of work, or contractors.',
    'Code written outside that may stay with the person who wrote it, and investors check who owns the product.',
    'Make sure contracts cover the code each employee writes, then confirm here.',
  ],
});
b.rule({
  id: 'DK.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'Trade mark (Danish or EU)', sev: 'medium', tier: 4, regulator: 'DKPTO', review: true,
  src: [[S5, 'Trademark registered with DKPTO, or an EU trade mark'], ['EU Section 11 —', 'Brand protected by an EU trade mark or a national mark in each operating market', MAPS.eu]],
  sat: held('dk_trademark'), evidence: ['Trade mark certificate'], action: 'file',
  slot: { id: 'dk_trademark', label: 'DKPTO or EU trade mark registration certificate', reason: 'There is no DKPTO trade mark lookup we can use yet, so we read your certificate.', tier: 4 },
  text: [
    "We can't see a trade mark for {company}",
    "You haven't added a Danish or EU trade mark certificate, and we can't look marks up at DKPTO yet.",
    "Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.',
    'File your brand with DKPTO, or as an EU trade mark, or add your certificate here.',
  ],
});

// --- Section 6: data protection --------------------------------------------------------------------

b.rule({
  id: 'DK.DP.CPR_NUMBERS', layer: 3, area: 'data_protection', stage: 2, title: 'CPR numbers used only where the law allows', sev: 'medium', tier: 5, regulator: DATATILSYNET, when: PD,
  src: [[S6, 'CPR numbers processed only on a listed ground']],
  sat: told('dk_cpr_numbers'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} uses CPR numbers only where allowed",
    "We don't have your confirmation that, if you handle Danish personal ID numbers (CPR numbers), you do so only where the law allows.",
    'A private company may process CPR numbers only where the law requires it, with the person\'s consent, or on another ground the Danish Data Protection Act lists.',
    'Using them without a ground breaks the Danish Data Protection Act, and Datatilsynet can act on it.',
    'Check where you collect CPR numbers and on what ground. Stop where there is none, then confirm here.',
  ],
});

// --- Section 7: employer registration ------------------------------------------------------------

b.doc({
  id: 'DK.EMP.EMPLOYER_REGISTRATION', layer: 3, area: 'employment', stage: 2, title: 'Registered as an employer before the first payroll', noun: 'employer registration receipt', sev: 'medium', tier: 4, regulator: 'Skattestyrelsen', when: STAFF,
  src: [[S7, 'Registered as employer on virk.dk before the first payroll']],
  slot: { id: 'dk_employer_registration', label: 'Employer registration receipt from virk.dk', reason: 'A company registers as an employer on virk.dk before it first pays wages, which opens its access to eIndkomst.', tier: 4 },
  fix: 'Register as an employer on virk.dk before the first payday, and add the receipt here.',
});
b.rule({
  id: 'DK.EMP.EINDKOMST', layer: 3, area: 'employment', stage: 2, title: 'Monthly payroll reporting (eIndkomst)', sev: 'medium', tier: 5, regulator: 'Skattestyrelsen', when: STAFF, review: true,
  src: [[S7, 'Monthly eIndkomst reporting, A-skat and AM-bidrag paid']],
  sat: told('dk_eindkomst'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} reports its payroll each month",
    "We don't have your confirmation that pay is reported to eIndkomst each month, with A-skat and AM-bidrag paid.",
    'Employers report pay to eIndkomst every month, and report zero in a month with no pay.',
    "Missed reports leave your staff's tax records wrong, and Skattestyrelsen follows them up.",
    'Check with your payroll provider that every month is reported and paid, then confirm here.',
  ],
});

// --- Section 9: consumer terms and website information -------------------------------------------

b.rule({
  id: 'DK.COM.CAPITAL_SHOWN', layer: 4, area: 'website_information', stage: 2, title: 'Share capital shown in full where you show it', sev: 'low', tier: 5, when: SITE,
  src: [[S9, 'If share capital is shown, both subscribed and paid-up capital are shown']],
  sat: told('dk_capital_display'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed how {company} shows its share capital",
    "We don't have your confirmation that, where your website or papers show the share capital, they show both the subscribed and the paid-up amount.",
    'If a company shows its share capital, it must show both what was subscribed and what has been paid up.',
    'A figure that suggests more capital than was paid in misleads customers and lenders.',
    'Show both figures, or neither, then confirm here.',
  ],
});
b.rule({
  id: 'DK.CONSUMER.ORDER_CONFIRMATION', layer: 4, area: 'consumer_protection', stage: 3, title: 'Online orders confirmed at once', sev: 'low', tier: 5,
  when: all(CONSUMER, SITE, yes('derived.takes_payments')),
  src: [[S9, 'Order confirmed electronically at once']],
  sat: told('dk_order_confirmation'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} confirms each order straight away",
    "We don't have your confirmation that consumers get an electronic confirmation as soon as they place an order.",
    'Consumers who order online must get an electronic confirmation of the order at once.',
    'Without it, orders are disputed more often, and consumer authorities check it.',
    'Send an automatic order confirmation by email, then confirm here.',
  ],
});
b.rule({
  id: 'DK.CONSUMER.TERMS_DOWNLOAD', layer: 4, area: 'consumer_protection', stage: 3, title: 'Consumer terms that can be downloaded', sev: 'low', tier: 1, when: all(CONSUMER, SITE),
  src: [[S9, 'Terms available to download']],
  // The scan may not recognise every wording, and can't see the file format: a missing page is "to check".
  sat: all(yes('web.policy.terms_found'), told('dk_terms_downloadable')), verify: no('web.policy.terms_found'),
  evidence: ['Your published terms', 'Your confirmation'], action: 'fix_website',
  text: [
    "You haven't confirmed consumers can download {company}'s terms",
    "We haven't seen terms on your website, or you haven't confirmed consumers can download them. Our scan may not recognise every wording, so a person will check.",
    'Consumers must be able to save your terms, so they are offered in a form that can be downloaded and kept.',
    'Without a copy, consumers can dispute what they agreed to, and consumer authorities check it.',
    'Publish your terms in a form people can download, such as a PDF, link them from checkout, then confirm here.',
  ],
});

// --- Section 10: fundraising -----------------------------------------------------------------------

b.doc({
  id: 'DK.FUND.CAPITAL_INCREASE', layer: 5, area: 'fundraising', stage: 4, title: 'Capital increase decided and registered', noun: 'capital increase records', sev: 'high', tier: 4, regulator: ERST, when: INVESTED,
  src: [[S10, 'Capital increase decision registered within 2 weeks']],
  params: { weeks_to_register: 2 },
  slot: { id: 'dk_capital_increase', label: 'General meeting minutes and CVR registration for each capital increase', reason: 'A capital increase decision is registered within 2 weeks, and the increase is registered as done only once the capital is paid.', tier: 4 },
  fix: 'Add the minutes of each capital increase and its registration with Erhvervsstyrelsen, with proof of payment for cash.',
});
b.rule({
  id: 'DK.FUND.PRE_EMPTION', layer: 5, area: 'fundraising', stage: 4, title: "Shareholders' right to subscribe first", sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'Pre-emption rights respected or validly waived']],
  sat: told('dk_pre_emption'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} respected its shareholders' right to subscribe first",
    "We don't have your confirmation that, in each cash capital increase, existing shareholders could subscribe in proportion to their holdings, or that the right was validly waived.",
    'Existing owners have a right to their share of a cash increase, unless it is waived by the majority needed to change the articles.',
    'An increase that ignored the right can be challenged by the shareholders who lost out.',
    'Check each capital increase, record the waiver where there was one, then confirm here.',
  ],
});
b.rule({
  id: 'DK.FUND.DEBT_CONVERSION', layer: 5, area: 'fundraising', stage: 4, title: 'Debt turned into shares, decided properly', sev: 'low', tier: 5, when: INVESTED,
  src: [[S10, 'Debt conversion: decision and board statement']],
  sat: told('dk_debt_conversion'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed how {company} turned any debt into shares",
    "We don't have your confirmation that, where a loan or note became shares, there was a proper decision with a statement from the board.",
    'A capital increase paid by turning debt into shares needs its own decision and a board statement on the debt.',
    'A conversion done without them can be challenged, and investors check how each share was paid for.',
    'If you converted debt, check the decision and statement are in place. Then confirm here, or confirm you have not converted any.',
  ],
});
b.rule({
  id: 'DK.FUND.WARRANT_REGISTRATION', layer: 5, area: 'fundraising', stage: 4, title: 'Shares from warrants and convertibles registered each year', sev: 'medium', tier: 5,
  when: any(INVESTED, yes('derived.equity_incentives')),
  src: [[S10, 'Warrant or convertible increases registered within 4 weeks after year end']],
  params: { weeks_after_year_end: 4, subscription_period_over_months: 12 },
  sat: told('dk_warrant_registration'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} registers shares issued under warrants or convertibles",
    "We don't have your confirmation that shares issued under warrants or convertible loans were registered within 4 weeks after the year end.",
    'Where the subscription period runs over 12 months, the capital increases from warrants and convertibles are registered within 4 weeks after each year end.',
    'Unregistered increases leave the register and your cap table out of step.',
    'Check what was exercised or converted last year, register it, then confirm here.',
  ],
});

// --- Section 11: AI --------------------------------------------------------------------------------

b.rule({
  id: 'DK.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI use disclosed on your website', sev: 'low', tier: 1, when: all(AI, SITE),
  shared: 'ai_transparency',
  src: [[S11, 'AI use disclosed on the website']],
  // The scan may not recognise every wording: a miss on a Danish site is "to check".
  sat: any(yes('web.policy.ai_disclosure_found'), held('dk_ai_transparency')), verify: no('web.policy.ai_disclosure_found'),
  evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'dk_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI.' },
  text: [
    "We can't see where {company} tells people it uses AI",
    "We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.",
    'People must be told when they are dealing with an AI system, and AI-made content has to be marked.',
    'Enterprise customers and investors are starting to ask, and you would have no answer ready.',
    'Say on your website where your product uses AI, or add your transparency records here.',
  ],
});

export const dk = b.build();

/** International rules the Danish pack asks for in its own way. */
export const DK_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  ...euIntlEquivalents('DK', true, OMIT),
  'INTL.CORP.CONSTITUTION': ['DK.CORP.ARTICLES'],
};

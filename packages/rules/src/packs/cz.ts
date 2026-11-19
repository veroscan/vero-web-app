import type { Logic } from '../logic.js';
import { addEuCommon, euIntlEquivalents, type EuKey } from './eu-common.js';
import { all, any, eq, held, MAPS, no, not, packBuilder, remind, told, yes } from './helper.js';

/**
 * Czechia (s.r.o.). Draft, version 0.2.0 (EU representative and DSA rules added 18 Nov 2026): every rule waits for a lawyer. Encoded from
 * docs/knowledge/vero-scan-czechia-rule-pack-map.md, plus the EU common rules (eu-common.ts).
 * Items left out, and why, are listed at the end of the Czechia map ("Not encoded"). A rule
 * citing a [verify] line is needs_review, so it can only ever say "a person needs to check this".
 *
 * The only register is ARES (Ministry of Finance), checked against a real reply. ARES keeps no
 * directors, members, beneficial owners or filed accounts, so those are documents or your word.
 * A miss in ARES leaves `identified` unknown, and every rule reading it comes out "to check".
 * Only "ceased", ARES's own word, can be a problem with the company; an active insolvency
 * register record is "to check", because a record is not a finding that the company is insolvent.
 *
 * Rules that only an s.r.o. has (list of members, general meeting, jednatel, capital increase)
 * read company.entity_type: 'sro' (s.r.o.), 'as' (a.s.) or 'other'.
 */
const b = packBuilder('CZ', MAPS.czechia, { name: 'Czechia', version: '0.2.0' });

const A = 'registry.cz.ares';
const ARES = 'ARES';
const UOOU = 'the ÚOOÚ';
const S1 = 'Section 1 —';
const S2 = 'Section 2 —';
const S3 = 'Section 3 —';
const S4 = 'Section 4 —';
const S5 = 'Section 5 —';
const S6 = 'Section 6 —';
const S7 = 'Section 7 —';
const S10 = 'Section 10 —';
const S11 = 'Section 11 —';
const CORE = '5. The core set';
const CORE_STATUS = 'Company found in ARES, active, in the public register, no active insolvency record';

const oneOf = (key: string, values: string[]): Logic => ({ in: [{ var: key }, values] });
const SRO = oneOf('company.entity_type', ['sro']);
const STAFF = yes('derived.employees');
const CONTRACTORS = yes('derived.contractors');
const CONSUMER = yes('derived.consumer');
const AI = yes('derived.uses_ai');
const INVESTED = yes('derived.invested');
const FOUND = yes(`${A}.identified`);
const STATUS = `${A}.status`;

// Czechia writes no EU common rule itself: its lines only add citations.
const OMIT: EuKey[] = [];

addEuCommon(b, {
  cc: 'CZ', eu: true, authority: UOOU, english: false, consentAge: 15, omit: OMIT,
  extraSrc: {
    PRIVACY_NOTICE: [[CORE, 'Privacy notice and cookie consent before non-essential cookies']],
    NOTICE_AUTHORITY: [[S6, 'Supervisory authority named in the notice']],
    CHILD_CONSENT: [[S6, "Child's consent age 15"]],
    DPO: [[S6, '| DPO designation |']],
    BREACH: [[S6, 'Breach notified to ÚOOÚ']],
    COOKIE_CONSENT: [[CORE, 'Privacy notice and cookie consent before non-essential cookies']],
    ADS_IDENTIFIABLE: [[S6, 'Marketing e-mail: opt-out for own customers']],
    WEBSITE_IDENTITY: [[CORE, 'Name and seat shown on the website']],
    VAT_VIES: [[S7, 'VAT payer once turnover exceeds CZK 2m']],
  },
});

// --- Section 1: company register and status ------------------------------------------------------

b.rule({
  id: 'CZ.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company status in ARES', sev: 'critical', tier: 1, regulator: ARES,
  src: [[S1, 'Company active, not ceased'], [CORE, CORE_STATUS]],
  sat: eq(STATUS, 'active'),
  // ARES says so in its own words: the company has an end date, so it has ceased.
  defect: all(FOUND, eq(STATUS, 'ceased')),
  // "unknown", or any other word: a person reads the record.
  verify: all(FOUND, not(oneOf(STATUS, ['active', 'ceased']))),
  evidence: ['ARES record'], action: 'review',
  text: [
    '{company} shows as ceased in ARES',
    "We read {company}'s record in ARES, the Czech register of economic subjects, and it shows the company as ceased.",
    'Anyone who looks the company up, banks and investors included, sees this status first.',
    'A company recorded as ceased can have trouble with its bank, its contracts and any fundraising.',
    'Check the record on ares.gov.cz and in the commercial register at or.justice.cz. If it is wrong, ask the registry court to correct it; if not, get advice today.',
  ],
});
b.rule({
  id: 'CZ.CORP.PUBLIC_REGISTER', layer: 1, area: 'standing', stage: 2, title: 'Entered in the commercial register', sev: 'high', tier: 1, regulator: ARES,
  src: [[S1, 'Company registered in the commercial register'], [CORE, CORE_STATUS]],
  law: [['Act 304/2013 Sb.', '§ 48']],
  sat: yes(`${A}.in_public_register`),
  // Found in ARES but with no active public-register record: never a gap, a person looks.
  verify: FOUND,
  evidence: ['ARES record'], action: 'review',
  text: [
    "We can't confirm {company} is in the Czech commercial register",
    'ARES does not show an active record for {company} in the public registers.',
    'Every company is entered in the commercial register, and banks, customers and investors rely on that entry.',
    'Without a current entry, others may doubt the company can act and sign in its own name.',
    'Look the company up at or.justice.cz. If the entry is missing or out of date, ask the registry court to correct it.',
  ],
});
b.rule({
  id: 'CZ.CORP.INSOLVENCY_RECORD', layer: 1, area: 'standing', stage: 2, title: 'No active record in the insolvency register', sev: 'high', tier: 1, regulator: ARES,
  src: [[S1, 'No active insolvency record'], [CORE, CORE_STATUS]],
  sat: no(`${A}.insolvency_record_active`),
  // A record is not a finding of insolvency: a person reads what the matter is.
  verify: yes(`${A}.insolvency_record_active`),
  evidence: ['ARES record'], action: 'review',
  text: [
    'ARES shows an active insolvency register record for {company}',
    'ARES shows {company} with an active record in the insolvency register. That is not by itself a finding that the company is insolvent.',
    'The insolvency register is public, and banks, investors and suppliers check it before they deal with a company.',
    'An open matter there can hold up a bank account, a contract or a round until it is explained.',
    'Look up the matter in the insolvency register (insolvenční rejstřík), find out what it is about and where it stands, and get advice on it.',
  ],
});
b.rule({
  id: 'CZ.CORP.REGISTER_CURRENT', layer: 1, area: 'filings', stage: 2, title: 'Changes filed with the commercial register', sev: 'medium', tier: 5,
  src: [[S1, 'Register entries kept current']],
  law: [['Act 304/2013 Sb.', '§ 11']],
  sat: told('cz_register_changes'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s entry in the commercial register is up to date",
    "We don't have your confirmation that every change, such as a new director, a new seat or new members, has been filed with the commercial register.",
    'Changes are filed without undue delay after they happen. After 15 days, anyone with a legal interest can file them instead.',
    'Banks, customers and investors rely on the register, and an old entry can show people who no longer act for the company.',
    'Compare your entry at or.justice.cz with how the company is run today, file anything missing, then confirm here.',
  ],
});
b.rule({
  id: 'CZ.CORP.REGISTERED_OFFICE', layer: 1, area: 'filings', stage: 2, title: 'Registered office (sídlo) on record', sev: 'low', tier: 1, regulator: ARES,
  src: [[S1, 'Registered office (sídlo)']],
  law: [['Act 304/2013 Sb.', '§ 25']],
  sat: { '!!': [{ var: `${A}.region` }] },
  evidence: ['ARES record'], action: 'file',
  text: [
    "We can't see {company}'s registered office in ARES",
    "We read {company}'s record in ARES and found no seat for the company.",
    'Every company has a registered office (sídlo), recorded in the commercial register, at an address where post reaches it.',
    'Official letters and court papers go there, and banks check it matches.',
    'Check the seat in your entry at or.justice.cz, and file a correction with the registry court if it is missing.',
  ],
});
b.doc({
  id: 'CZ.CORP.REGISTER_EXTRACT', layer: 1, area: 'officers', stage: 2, title: 'Commercial register extract (výpis z obchodního rejstříku)', noun: 'commercial register extract', sev: 'medium', tier: 4,
  src: [[S1, 'Commercial-register extract (výpis)'], [S4, 'At least one jednatel'], [CORE, 'Commercial-register extract showing at least one jednatel']],
  law: [['Act 90/2012 Sb. (ZOK)', '§ 194']],
  slot: { id: 'cz_register_extract', label: 'Commercial register extract (výpis z obchodního rejstříku)', reason: 'ARES does not list who runs the company. The extract shows your directors and what the register holds, and banks and investors ask for it.', tier: 4 },
  why: 'ARES does not list directors, so the extract is how we see who runs the company. An s.r.o. is run by one or more jednatelé.',
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Download a current extract from or.justice.cz and add it here. Check it shows at least one director.',
});

// --- Section 2: constitution, list of members and beneficial owners ------------------------------

b.doc({
  id: 'CZ.CORP.FOUNDING_CONTRACT', layer: 1, area: 'governance', stage: 2, title: 'Founding contract as a notarial deed', noun: 'founding contract', sev: 'high', tier: 4,
  src: [[S2, 'Founding contract filed in the sbírka listin'], [CORE, 'Founding contract as a notarial deed, filed in the sbírka listin'], [S10, 'Updated founding contract and list of members']],
  law: [['Act 90/2012 Sb. (ZOK)', '§ 8'], ['Act 304/2013 Sb.', '§ 66(a)']],
  slot: { id: 'cz_founding_contract', label: 'Founding contract (společenská smlouva): notarial deed and full current text', reason: 'A capital company is founded by a notarial deed. The deed and each change, with a full updated text, are filed in the collection of documents (sbírka listin).', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Add the notarial deed of your founding contract and the latest full text filed in the sbírka listin. Filed copies can be downloaded from or.justice.cz.',
});
b.rule({
  id: 'CZ.CORP.CONTRIBUTIONS', layer: 1, area: 'shareholders', stage: 2, title: "Members' contributions meet the founding contract", sev: 'low', tier: 5, when: SRO,
  src: [[S2, 'Minimum contribution']],
  law: [['Act 90/2012 Sb. (ZOK)', '§ 142']],
  params: { minimum_contribution_czk: 1 },
  sat: told('cz_contributions'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s members' contributions meet its founding contract",
    "We don't have your confirmation that each member's contribution is at least what the founding contract sets.",
    'In an s.r.o. the minimum contribution is CZK 1, unless the founding contract sets more.',
    'Investors check that the capital on the register matches what members actually put in.',
    'Check each contribution against the founding contract, then confirm here.',
  ],
});
b.doc({
  id: 'CZ.CORP.MEMBERS_LIST', layer: 1, area: 'shareholders', stage: 2, title: 'List of members (seznam společníků)', noun: 'list of members', sev: 'medium', tier: 4, when: SRO,
  src: [[S2, 'List of members (seznam společníků) kept'], [CORE, 'list of members kept'], [S10, 'Updated founding contract and list of members']],
  law: [['Act 90/2012 Sb. (ZOK)', '§ 139']],
  slot: { id: 'cz_members_list', label: 'List of members (seznam společníků)', reason: 'An s.r.o. keeps its own list of members and their shares. It should match the commercial register and every transfer.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Bring the list of members up to date with every transfer and new share, and add it here.',
});
b.doc({
  id: 'CZ.CORP.UBO', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owner registered (evidence skutečných majitelů)', noun: 'beneficial-owner register extract', sev: 'high', tier: 4, penalty: 'moderate',
  src: [[S2, '| Beneficial owner registered |'], [CORE, 'Beneficial owner registered (Tier 4']],
  law: [['Act 37/2021 Sb.', '§§ 8-9']],
  slot: { id: 'cz_ubo_extract', label: 'Full extract from the register of beneficial owners (evidence skutečných majitelů)', reason: 'The register of beneficial owners is no longer public, so your own full extract is the way to show the owner is registered.', tier: 4 },
  why: 'Every company registers the people who ultimately own or control it, without undue delay. The register closed to the public on 17 December 2025, so we need your own extract.',
  ifLeft: 'An owner who is not registered gets no share of profit and cannot vote, and the company can be fined up to CZK 500,000.',
  fix: 'Download your full extract from esm.justice.cz and add it here. If the owner was never registered, register them there now.',
});
b.rule({
  id: 'CZ.CORP.UBO_CURRENT', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial-owner details updated after a change', sev: 'medium', tier: 5,
  src: [[S2, 'Beneficial owner data kept current']],
  law: [['Act 37/2021 Sb.', '§ 9(1)']],
  sat: told('cz_ubo_current'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s beneficial-owner details are up to date",
    "We don't have your confirmation that the register of beneficial owners was updated after the last change in who owns or controls the company.",
    'A change in beneficial owners is registered without undue delay, and the new extract replaces the old one.',
    'An owner left off the register loses profit shares and votes, and the company can be fined.',
    'After each change, update the register, add the new extract here, and confirm.',
  ],
});

// --- Section 3: annual accounts and general meeting ----------------------------------------------

b.rule({
  id: 'CZ.CORP.ANNUAL_MEETING', layer: 1, area: 'filings', stage: 2, title: 'General meeting reviews the accounts within 6 months', sev: 'medium', tier: 5, when: SRO,
  src: [[S3, 'Annual general meeting approves the accounts'], [CORE, 'general meeting within 6 months and accounts filed']],
  law: [['Act 90/2012 Sb. (ZOK)', '§ 181']],
  rec: { type: 'after_year_end', months: 6, monitoring: remind },
  sat: any(held('cz_agm_minutes'), told('cz_accounts_approved')), evidence: ['Minutes of the general meeting', 'Your confirmation'], action: 'attest',
  slot: { id: 'cz_agm_minutes', label: 'Minutes of the general meeting that reviewed the accounts', reason: 'The general meeting of an s.r.o. reviews the regular accounts within 6 months of the end of the accounting period.' },
  text: [
    "We can't see that {company}'s general meeting reviewed last year's accounts",
    "You haven't added the minutes, or confirmed that the general meeting reviewed the accounts within 6 months of the year end.",
    'An s.r.o. holds a general meeting at least once each accounting period, and it reviews the regular accounts within 6 months of the year end.',
    'Accounts that were never approved hold up the filing, and investors and banks ask for the minutes.',
    'Hold the meeting, keep the minutes, and add them here or confirm it took place.',
  ],
});
b.doc({
  id: 'CZ.CORP.ACCOUNTS_FILING', layer: 1, area: 'filings', stage: 2, title: 'Annual accounts filed in the collection of documents (sbírka listin)', noun: 'filed annual accounts', sev: 'high', tier: 4, penalty: 'moderate',
  src: [[S3, 'Annual accounts filed in the sbírka listin'], [CORE, 'general meeting within 6 months and accounts filed']],
  law: [['Act 563/1991 Sb.', '§ 21a'], ['Act 304/2013 Sb.', '§ 66(c)']],
  slot: { id: 'cz_accounts_filing', label: 'Annual accounts (účetní závěrka), with proof of filing in the sbírka listin', reason: 'Companies in the commercial register publish their accounts by filing them in the collection of documents. ARES does not show the filing, so we need your copy.', tier: 4 },
  ifLeft: 'If two years in a row go unfiled, the court orders the filing, and a company that still does not file can be dissolved.',
  fix: 'File the approved accounts in the sbírka listin through the registry court, and add them here with the proof of filing.',
});

// --- Section 4: directors ------------------------------------------------------------------------

b.rule({
  id: 'CZ.CORP.DIRECTOR_VACANCY', layer: 1, area: 'officers', stage: 2, title: 'A vacant director post filled within a month', sev: 'low', tier: 5, when: SRO,
  src: [[S4, 'Vacant jednatel replaced within 1 month']],
  law: [['Act 90/2012 Sb. (ZOK)', '§ 198(1)']],
  params: { months_to_replace: 1 },
  sat: told('cz_director_vacancy'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} fills a vacant director post in time",
    "We don't have your confirmation that, whenever a director (jednatel) left with no successor, the general meeting elected a new one within a month.",
    "If a director's office ends without a successor, the general meeting elects a new one within 1 month.",
    'Without a director, nobody can sign for the company, and banks and courts will notice.',
    'If a post is empty, hold the general meeting and elect a new director, then confirm here.',
  ],
});
b.rule({
  id: 'CZ.CORP.DIRECTORS_ELIGIBLE', layer: 1, area: 'officers', stage: 2, title: 'Directors free to serve', sev: 'medium', tier: 5,
  src: [[S4, 'Directors not disqualified']],
  law: [['Act 90/2012 Sb. (ZOK)', '§ 46']],
  sat: told('cz_directors_eligible'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s directors are free to serve",
    "We don't have your confirmation that none of the company's directors is barred from office, for example by a disqualification order.",
    'Czech company law sets out who cannot serve as a director, such as a person disqualified by a court.',
    "A director who is barred can put the company's decisions in doubt.",
    'Check each director against the rules on who may serve, then confirm here.',
  ],
});
b.doc({
  id: 'CZ.CORP.DIRECTOR_DECISIONS', layer: 1, area: 'officers', stage: 2, title: 'Director appointment decisions filed', noun: 'filed director appointment decisions', sev: 'low', tier: 4,
  src: [[S4, 'Director appointment decisions filed']],
  law: [['Act 304/2013 Sb.', '§ 66(b)']],
  slot: { id: 'cz_director_decisions', label: 'Decisions appointing and removing directors, as filed in the sbírka listin', reason: 'Each decision that appoints or removes a director goes into the collection of documents of the commercial register.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Add the decisions that appointed your current directors, and check each one is filed in the sbírka listin.',
});

// --- Section 5: intellectual property ------------------------------------------------------------

b.rule({
  id: 'CZ.IP.EMPLOYEE_WORKS', layer: 2, area: 'ip_ownership', stage: 2, title: "Employees' work made within their duties", sev: 'medium', tier: 5, when: STAFF,
  src: [[S5, 'Employee works: employer exercises the rights']],
  law: [['Act 121/2000 Sb.', '§ 58(1)']],
  sat: told('cz_employee_works'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s staff create their work as part of their job",
    "We don't have your confirmation that the code, designs and other work your employees create is made within their duties, so the company can use it.",
    'The employer exercises the economic rights to work an employee creates within their duties, in its own name, unless agreed otherwise. The employee keeps the moral rights.',
    "Work made outside the job, or under a contract that says otherwise, may not be the company's to use, and investors check this.",
    'Check your employment contracts and job descriptions cover the work people do, then confirm here.',
  ],
});
b.rule({
  id: 'CZ.IP.CONTRACTOR_WORKS', layer: 2, area: 'ip_ownership', stage: 2, title: 'Rights to work made by contractors', sev: 'high', tier: 5, when: CONTRACTORS,
  src: [[S5, 'Commissioned software treated as employee work'], [S5, 'Other commissioned works: licence only'], [CORE, "contractors' IP position"]],
  law: [['Act 121/2000 Sb.', '§ 58(7), § 61']],
  sat: any(held('cz_contractor_ip'), told('cz_contractor_ip')), evidence: ['Contractor agreements', 'Your confirmation'], action: 'upload',
  slot: { id: 'cz_contractor_ip', label: 'Contractor agreements with IP terms (assignment or broad licence)', reason: 'Software made to order counts as the company\'s to use, but other work by contractors needs a written assignment or a broad licence.' },
  text: [
    "We can't see that {company} has the rights to what its contractors made",
    "You haven't added your contractor agreements, or confirmed they give the company the work it paid for.",
    'Software and databases made to order are treated as employee work, so the company exercises the rights. For designs, text and other work, the author is presumed to grant a licence only for the purpose of the contract.',
    'Without a written assignment or a broad licence, the company may not be free to reuse or sell that work, and investors check this.',
    'Add a written assignment or broad licence to each contractor agreement, and add the agreements here or confirm.',
  ],
});
b.rule({
  id: 'CZ.IP.EMPLOYEE_INVENTIONS', layer: 2, area: 'ip_ownership', stage: 3, title: 'Employee inventions reported and claimed', sev: 'low', tier: 5, when: STAFF,
  src: [[S5, 'Employee inventions: notice and 3-month claim']],
  law: [['Act 527/1990 Sb.', '§ 9']],
  params: { claim_months: 3 },
  sat: told('cz_employee_inventions'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has a process for employee inventions",
    "We don't have your confirmation that employees report inventions in writing and that the company claims them in time.",
    "The right to a patent for an employee's invention passes to the employer unless agreed otherwise. The employee reports it in writing, and if the employer does not claim it within 3 months the right goes back. The employee is owed reasonable pay for it.",
    'An invention the company failed to claim in time can stay with the employee.',
    'Set up a simple written invention report and a claim step within 3 months, then confirm here.',
  ],
});
b.rule({
  id: 'CZ.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'Trade mark (Czech or EU)', sev: 'medium', tier: 4, regulator: 'ÚPV',
  src: [[S5, '| Czech trade mark |'], ['EU Section 11 —', 'Brand protected by an EU trade mark or a national mark in each operating market', MAPS.eu], ['EU Section 11 —', 'Renewal every 10 years from filing', MAPS.eu]],
  rec: { type: 'every_years', from_fact: 'vault.cz_trademark.dated', years: 10, monitoring: remind },
  sat: held('cz_trademark'), evidence: ['Trade mark certificate'], action: 'file',
  slot: { id: 'cz_trademark', label: 'ÚPV or EU trade mark certificate', reason: 'There is no ÚPV lookup we can use yet, so we read your certificate. A mark lasts 10 years and can be renewed.', tier: 4 },
  text: [
    "We can't see a trade mark for {company}",
    "You haven't added a Czech or EU trade mark certificate, and we can't look marks up at the Industrial Property Office (ÚPV) yet.",
    "Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.',
    'File your brand at the ÚPV, or as an EU trade mark, or add your certificate here.',
  ],
});

// --- Section 6: marketing e-mail -----------------------------------------------------------------

b.rule({
  id: 'CZ.COM.MARKETING_EMAIL', layer: 4, area: 'marketing', stage: 3, title: 'Marketing e-mails with a free way to refuse', sev: 'low', tier: 5, when: all(CONSUMER, yes('derived.sends_marketing')),
  src: [[S6, 'Marketing e-mail: opt-out for own customers']],
  law: [['Act 480/2004 Sb.', '§ 7']],
  sat: told('cz_marketing_email_refusal'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s marketing e-mails offer a free way out",
    "We don't have your confirmation that customers can refuse marketing e-mails simply and free, when you collect their address and in every message.",
    'You may e-mail your own customers about similar products of your own only if they can refuse simply and free, at collection and in every message.',
    'Marketing sent without that choice breaks the rule, and people who get it can complain.',
    'Add a clear unsubscribe link to every message and a refusal option where you collect addresses, then confirm here.',
  ],
});

// --- Section 7: tax and employer registration ----------------------------------------------------

b.rule({
  id: 'CZ.TAX.REGISTRATION', layer: 3, area: 'tax', stage: 2, title: 'Registered with the tax office (DIČ)', sev: 'medium', tier: 1, regulator: ARES, review: true,
  src: [[S7, 'Registered with the tax office (DIČ)']],
  sat: yes(`${A}.vat_number_present`),
  // No DIČ on the ARES record is a reason to look, not proof the company never registered.
  verify: no(`${A}.vat_number_present`),
  evidence: ['ARES record'], action: 'register',
  text: [
    "We can't see a tax number (DIČ) for {company} in ARES",
    'ARES shows no DIČ, the tax identification number, for {company}.',
    'A company registers with its tax office, which gives it a tax number (DIČ).',
    'Without it, tax returns and business invoicing run into trouble.',
    'Check with your tax office (finanční úřad) that the company is registered, and keep the registration letter.',
  ],
});
b.rule({
  id: 'CZ.TAX.VAT_PAYER', layer: 3, area: 'tax', stage: 3, title: 'VAT payer once turnover passes CZK 2 million', sev: 'medium', tier: 1, regulator: ARES,
  src: [[S7, 'VAT payer once turnover exceeds CZK 2m']],
  law: [['Act 235/2004 Sb.', '§ 6']],
  params: { threshold_czk: 2_000_000, current_year_limit_czk: 2_536_500 },
  sat: any(yes(`${A}.vat_payer`), told('cz_vat_below_threshold')),
  // Turnover is not public: not being a VAT payer is only a reason to ask.
  verify: no(`${A}.vat_payer`),
  evidence: ['ARES record', 'Your confirmation'], action: 'register',
  text: [
    "We can't see {company} as a VAT payer",
    "ARES doesn't show {company} as a VAT payer, and you haven't confirmed your turnover is below the threshold.",
    'A company becomes a VAT payer from 1 January after a calendar year with Czech turnover over CZK 2,000,000, or from the day after its turnover in the current year passes CZK 2,536,500.',
    'Becoming a VAT payer late can mean paying VAT you never charged your customers.',
    'If you are a VAT payer, check your registration. If your turnover is below the threshold, confirm that here.',
  ],
});
b.doc({
  id: 'CZ.EMP.CSSZ_EMPLOYER', layer: 3, area: 'employment', stage: 2, title: 'Employer registration with the ČSSZ', noun: 'ČSSZ employer registration', sev: 'high', tier: 4, regulator: 'ČSSZ', when: STAFF,
  src: [[S7, 'Employer registered with ČSSZ before the first employee starts']],
  slot: { id: 'cz_cssz_registration', label: 'ČSSZ employer registration confirmation', reason: 'An employer registers with the Czech Social Security Administration (ČSSZ) before its first employee starts. Since 1 July 2026 this is done online, at least 2 working days before.', tier: 4 },
  fix: 'Register through the ČSSZ e-podání service before the first employee starts, and add the confirmation here.',
});
b.rule({
  id: 'CZ.EMP.EMPLOYEE_REGISTRATION', layer: 3, area: 'employment', stage: 2, title: 'Each employee registered before starting', sev: 'medium', tier: 5, regulator: 'ČSSZ', when: STAFF,
  src: [[S7, 'Each employee registered before starting']],
  sat: told('cz_employees_registered'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} registers each employee before they start",
    "We don't have your confirmation that each employee was registered with the ČSSZ before their first day.",
    'Since 1 July 2026 every employee is registered before work starts, no earlier than 8 days before, and the registration is completed within 8 days of the start.',
    'An employee who starts unregistered is a gap a ČSSZ inspection will find.',
    'Register each new hire with the ČSSZ before they start, then confirm here.',
  ],
});
b.rule({
  id: 'CZ.EMP.HEALTH_INSURANCE', layer: 3, area: 'employment', stage: 2, title: "Registered with employees' health insurers", sev: 'medium', tier: 5, when: STAFF, review: true,
  src: [[S7, 'Employer registered with health insurers']],
  sat: told('cz_health_insurers'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} is registered with its employees' health insurers",
    "We don't have your confirmation that the company is registered as an employer with each health insurance company its employees use.",
    "Employers register with their employees' health insurers and pay health insurance for them.",
    'Missing registrations come up in insurer checks, and unpaid insurance builds up.',
    "Register with each employee's health insurer, then confirm here.",
  ],
});

// --- Section 10: fundraising ---------------------------------------------------------------------

b.doc({
  id: 'CZ.FUND.CAPITAL_INCREASE', layer: 5, area: 'fundraising', stage: 4, title: 'General meeting resolution on each capital increase', noun: 'capital increase resolutions', sev: 'high', tier: 4, when: all(INVESTED, SRO), review: true,
  src: [[S10, 'Capital increase resolved by the general meeting']],
  law: [['Act 90/2012 Sb. (ZOK)', '§§ 171-172, 216']],
  slot: { id: 'cz_capital_increase', label: 'Notarial record of the general meeting resolution on each capital increase', reason: 'A capital increase is decided by the general meeting, and because it changes the founding contract, the resolution is recorded by a notary.', tier: 4 },
  fix: 'Add the notarial record of the general meeting resolution behind each capital increase.',
});
b.doc({
  id: 'CZ.FUND.CAPITAL_INCREASE_FILED', layer: 5, area: 'fundraising', stage: 4, title: 'Capital increase entered in the commercial register', noun: 'register extract after the capital increase', sev: 'high', tier: 4, when: all(INVESTED, SRO), review: true,
  src: [[S10, 'Increase filed with the register within 2 months']],
  law: [['Act 90/2012 Sb. (ZOK)', '§ 218']],
  slot: { id: 'cz_capital_increase_extract', label: 'Commercial register extract showing the increased capital', reason: 'A capital increase is filed with the commercial register soon after the resolution. If it is not filed in time, the resolution can lapse.', tier: 4 },
  fix: 'File the increase with the registry court, then download the new extract from or.justice.cz and add it here.',
});

// --- Section 11: AI ------------------------------------------------------------------------------

b.rule({
  id: 'CZ.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI use disclosed to users', sev: 'low', tier: 1, when: AI,
  shared: 'ai_transparency',
  src: [[S11, 'AI transparency notice on the site']],
  // The scan may not recognise every wording: a miss on a Czech site is "to check".
  sat: any(yes('web.policy.ai_disclosure_found'), held('cz_ai_transparency')), verify: no('web.policy.ai_disclosure_found'),
  evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'cz_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI.' },
  text: [
    "We can't see where {company} tells people it uses AI",
    "We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.",
    'People must be told when they are dealing with an AI system, and AI-made content has to be marked.',
    'Enterprise customers and investors are starting to ask, and you would have no answer ready.',
    'Say on your website where your product uses AI, or add your transparency records here.',
  ],
});

export const cz = b.build();

/** International rules the Czech pack asks for in its own way. */
export const CZ_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  ...euIntlEquivalents('CZ', true, OMIT),
  'INTL.CORP.CONSTITUTION': ['CZ.CORP.FOUNDING_CONTRACT'],
  'INTL.IP.CONTRACTOR_ASSIGNMENT': ['CZ.IP.CONTRACTOR_WORKS'],
};

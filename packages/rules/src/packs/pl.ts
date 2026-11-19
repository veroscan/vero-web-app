import type { Logic } from '../logic.js';
import { addEuCommon, euIntlEquivalents, euObligation, type EuKey } from './eu-common.js';
import { all, any, atLeast, eq, held, MAPS, no, not, packBuilder, remind, told, yes } from './helper.js';

/**
 * Poland (sp. z o.o.). Draft, version 0.2.0 (EU representative and DSA rules added 18 Nov 2026): every rule waits for a lawyer. Encoded from
 * docs/knowledge/vero-scan-poland-rule-pack-map.md, plus the EU common rules (eu-common.ts).
 * Items left out, and why, are listed at the end of the Poland map ("Not encoded"). A rule
 * citing a [verify] line is needs_review, so it can only ever say "a person needs to check this".
 *
 * The only register is the KRS open API, checked against a real reply (ORLEN). It needs the KRS
 * number: given only a name, the source is "unsupported" and every rule reading it comes out "to
 * check". The deletion, liquidation and insolvency markers were NOT in that reply and are read
 * from section names, so none of them is ever a problem with the company: each is "to check".
 * The KRS extract has no filed accounts, shareholder list or beneficial owners: those are
 * documents or your word.
 *
 * Rules that only an sp. z o.o. has (minimum capital, share book, shareholder list, meeting
 * notices, capital increase) read company.entity_type: 'sp_zoo', 'sa', 'psa' or 'other'.
 */
const b = packBuilder('PL', MAPS.poland, { name: 'Poland', version: '0.2.0' });

const K = 'registry.pl.krs';
const KRS = 'KRS';
const VIES = 'registry.eu.vies_vat';
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
const SPZOO = oneOf('company.entity_type', ['sp_zoo']);
const PD = yes('derived.personal_data');
const STAFF = yes('derived.employees');
const CONTRACTORS = yes('derived.contractors');
const AI = yes('derived.uses_ai');
const INVESTED = yes('derived.invested');
const FOUND = yes(`${K}.identified`);

// EU common rules Poland writes itself, with the same shared obligation.
const OMIT: EuKey[] = ['DPO', 'COMPANY_PARTICULARS'];

addEuCommon(b, {
  cc: 'PL', eu: true, authority: 'UODO', english: false, omit: OMIT,
  extraSrc: {
    PRIVACY_NOTICE: [[S6, '| Privacy notice |'], [CORE, 'Privacy notice; cookie consent before non-essential storage']],
    NOTICE_AUTHORITY: [[S6, '| Privacy notice |']],
    COOKIE_CONSENT: [[CORE, 'Privacy notice; cookie consent before non-essential storage']],
    COOKIE_POLICY: [[S6, '| Cookie policy published |']],
    WEBSITE_IDENTITY: [[S9, 'E-services information (art. 5)'], [CORE, 'Company particulars and e-services information on the website']],
    REGULATOR_NAMED: [[S9, 'E-services information (art. 5)']],
    CONSUMER_INFO: [[S9, 'Pre-contract information for distance contracts']],
    WITHDRAWAL: [[S9, '14-day withdrawal right']],
    CONSUMER_COMPLAINTS: [[S9, '| Complaints route |']],
    VAT_VIES: [[S7, 'VAT registration before the first taxable sale']],
  },
});

// --- Section 1: company register and status ------------------------------------------------------

b.rule({
  id: 'PL.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company status in the KRS', sev: 'high', tier: 1, regulator: KRS,
  src: [[S1, 'Company registered in the KRS'], [S1, 'Company not deleted'], [CORE, 'Company found in the KRS, registered (not deleted), no liquidation or insolvency marker']],
  sat: all(eq(`${K}.status`, 'registered'), no(`${K}.under_liquidation`), no(`${K}.insolvency_marker`)),
  // The deletion, liquidation and insolvency markers are unconfirmed: anything but a clean
  // "registered" is for a person to read, never a problem we call.
  verify: FOUND,
  evidence: ['KRS extract'], action: 'review',
  text: [
    "We can't confirm {company} is registered and trading normally in the KRS",
    "We read {company}'s extract from the KRS, the Polish National Court Register, and it shows the company as deleted, or with a liquidation or insolvency section. We read these from section names, so a person checks them.",
    'Anyone who looks the company up, banks and investors included, sees this first.',
    'A company that is deleted, or in liquidation or insolvency, can have trouble with its bank, its contracts and any fundraising.',
    'Check your extract on the Court Registers Portal (prs.ms.gov.pl). If it is wrong, ask the registry court to correct it; if not, get advice today.',
  ],
});
b.rule({
  id: 'PL.CORP.REGISTER_CHANGES', layer: 1, area: 'filings', stage: 2, title: 'Changes filed with the KRS within 7 days', sev: 'medium', tier: 5,
  src: [[S1, 'Register changes filed within 7 days']],
  law: [['KRS Act', 'arts. 22, 24']],
  params: { days_after_event: 7 },
  sat: told('pl_register_changes'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s changes are filed with the KRS",
    "We don't have your confirmation that every change, such as a new board member, a new seat or new articles, was filed with the registry court.",
    'A change to a KRS entry is filed within 7 days of the event, unless a special rule says otherwise. The court can call for it with a further 7 days.',
    'Banks, customers and investors rely on the KRS, and an old entry can show people who no longer act for the company.',
    'Compare your KRS extract with how the company is run today, file anything missing, then confirm here.',
  ],
});
b.rule({
  id: 'PL.TAX.NIP_REGON', layer: 3, area: 'tax', stage: 2, title: 'Tax number (NIP) and statistics number (REGON)', sev: 'medium', tier: 1, regulator: KRS,
  src: [[S1, 'NIP and REGON assigned'], [CORE, 'NIP and REGON assigned']],
  sat: all(yes(`${K}.nip_present`), yes(`${K}.regon_present`)),
  // Found without one of the numbers: a person reads the extract.
  verify: FOUND,
  evidence: ['KRS extract'], action: 'review',
  text: [
    "We can't see {company}'s NIP or REGON in the KRS",
    "The KRS extract for {company} doesn't show a tax number (NIP), or a statistics number (REGON).",
    'A company has a NIP for tax and a REGON for statistics, and both are on its KRS record.',
    'Banks, customers and tax forms ask for both numbers.',
    'Check your KRS extract. If a number is missing, ask the tax office or the statistics office, then have the record corrected.',
  ],
});
b.rule({
  id: 'PL.CORP.REGISTERED_SEAT', layer: 1, area: 'filings', stage: 2, title: 'Registered seat on record', sev: 'low', tier: 1, regulator: KRS,
  src: [[S1, '| Registered seat |']],
  sat: { '!!': [{ var: `${K}.seat_town` }] },
  evidence: ['KRS extract'], action: 'file',
  text: [
    "We can't see {company}'s registered seat in the KRS",
    "We read {company}'s KRS extract and found no seat for the company.",
    'Every company has a registered seat, stated in its articles and recorded in the KRS.',
    'Official letters and court papers go there, and banks check it matches.',
    'Check the seat on your KRS extract, and file a correction with the registry court if it is missing.',
  ],
});

// --- Section 2: articles, share book and beneficial owners ---------------------------------------

b.doc({
  id: 'PL.CORP.ARTICLES', layer: 1, area: 'governance', stage: 2, title: 'Articles of association (umowa spółki)', noun: 'articles of association', sev: 'high', tier: 4,
  src: [[S2, 'Articles (umowa spółki) by notarial deed or S24 template'], [S2, 'Articles contain the required terms'], [CORE, 'Articles by notarial deed or S24; share book kept']],
  law: [['Commercial Companies Code (KSH)', 'arts. 157, 157¹']],
  slot: { id: 'pl_articles', label: 'Articles of association (umowa spółki), notarial deed or S24 record', reason: "The articles are made as a notarial deed, or online on the S24 template, and set out the name, seat, objects, share capital and each shareholder's shares.", tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Add the current articles, with every amendment made since the company was set up.',
});
b.rule({
  id: 'PL.CORP.SHARE_CAPITAL', layer: 1, area: 'shareholders', stage: 2, title: 'Share capital of at least PLN 5,000', sev: 'medium', tier: 1, regulator: KRS, when: SPZOO,
  src: [[S2, 'Share capital at least PLN 5,000'], [CORE, 'Share capital at least PLN 5,000']],
  law: [['Commercial Companies Code (KSH)', 'art. 154']],
  params: { minimum_pln: 5000, minimum_per_share_pln: 50 },
  sat: all(atLeast(`${K}.share_capital`, 5000), eq(`${K}.share_capital_currency`, 'PLN')),
  // A currency we don't read as PLN is for a person, not a shortfall.
  verify: all(FOUND, not(eq(`${K}.share_capital_currency`, 'PLN'))),
  evidence: ['KRS extract'], action: 'review',
  text: [
    "{company}'s share capital in the KRS is below PLN 5,000",
    "The KRS shows {company}'s share capital below PLN 5,000, the minimum for an sp. z o.o.",
    'An sp. z o.o. has share capital of at least PLN 5,000, and each share is worth at least PLN 50.',
    'A capital below the minimum suggests the record, or the company form we have, is wrong, and investors will ask.',
    'Check the capital on your KRS extract and in your articles, and tell us if the company is not an sp. z o.o.',
  ],
});
b.doc({
  id: 'PL.CORP.SHARE_BOOK', layer: 1, area: 'shareholders', stage: 2, title: 'Share book (księga udziałów)', noun: 'share book', sev: 'medium', tier: 4, when: SPZOO,
  src: [[S2, 'Share book (księga udziałów) kept'], [CORE, 'share book kept']],
  law: [['Commercial Companies Code (KSH)', 'art. 188 §§ 1-2']],
  slot: { id: 'pl_share_book', label: 'Share book (księga udziałów)', reason: 'The management board keeps a share book recording every shareholder, their shares and every change. Each shareholder may inspect it.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Bring the share book up to date with every transfer and new share, and add it here.',
});
b.doc({
  id: 'PL.CORP.SHAREHOLDER_LIST', layer: 1, area: 'shareholders', stage: 2, title: 'Latest shareholder list filed with the registry court', noun: 'latest shareholder list', sev: 'medium', tier: 4, when: SPZOO,
  src: [[S2, 'New shareholder list filed after each change'], [S10, 'New shareholder list after the round']],
  law: [['Commercial Companies Code (KSH)', 'art. 188 §§ 3-4']],
  slot: { id: 'pl_shareholder_list', label: 'Shareholder list (lista wspólników), as filed with the registry court', reason: 'After each change in shareholders, the board files a new list, signed by every board member, with the registry court.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Add the latest list as filed. If a change was never filed, file a new list with the registry court now.',
});
b.doc({
  id: 'PL.CORP.UBO', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owners reported to the CRBR', noun: 'CRBR filing confirmation', sev: 'high', tier: 4,
  src: [[CORE, 'Beneficial owners in the CRBR within 14 days of registration']],
  law: [['AML Act', 'art. 60']],
  slot: { id: 'pl_crbr_confirmation', label: 'CRBR filing confirmation (potwierdzenie zgłoszenia)', reason: 'Every company reports its beneficial owners to the Central Register of Beneficial Owners (CRBR) soon after it is entered in the KRS.', tier: 4 },
  why: 'Every company reports the people who ultimately own or control it to the CRBR, within 14 days of its KRS registration.',
  ifLeft: 'Missing or wrong CRBR data can be fined heavily, and banks check it when you open an account.',
  fix: 'File the report on the CRBR website and add the confirmation here.',
});
b.rule({
  id: 'PL.CORP.UBO_CURRENT', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'CRBR updated after a change', sev: 'medium', tier: 5,
  src: [[S2, 'CRBR updated within 14 days of a change']],
  law: [['AML Act', 'art. 60(2)']],
  sat: told('pl_crbr_current'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s CRBR entry is up to date",
    "We don't have your confirmation that the CRBR was updated after the last change in who owns or controls the company.",
    'A change in beneficial owners is reported to the CRBR within 14 days of the KRS change, or of the change itself where no KRS entry is needed.',
    'Out-of-date details can be fined, and banks rely on them when they onboard you.',
    'After each change, update the CRBR, add the new confirmation here, and confirm.',
  ],
});

// --- Section 3: annual accounts and shareholders' meeting ----------------------------------------

b.rule({
  id: 'PL.CORP.ACCOUNTS_PREPARED', layer: 1, area: 'filings', stage: 2, title: 'Accounts prepared within 3 months', sev: 'medium', tier: 5,
  src: [[S3, 'Accounts prepared within 3 months'], [CORE, 'accounts within 3 months']],
  law: [['Accounting Act', 'art. 52']],
  rec: { type: 'after_year_end', months: 3, monitoring: remind },
  sat: told('pl_accounts_prepared'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s accounts were prepared within 3 months",
    "We don't have your confirmation that last year's accounts were prepared within 3 months of the year end and signed by the bookkeeper and the management board.",
    'Accounts are prepared within 3 months of the balance-sheet date, in the electronic structured format, and signed by the person keeping the books and the management board.',
    'Late accounts push back the meeting and the KRS filing that follow.',
    'Check with your accountant that the accounts were prepared and signed in time, then confirm here.',
  ],
});
b.doc({
  id: 'PL.CORP.ANNUAL_MEETING', layer: 1, area: 'filings', stage: 2, title: "Annual shareholders' meeting within 6 months", noun: "resolution of the annual shareholders' meeting", sev: 'medium', tier: 4,
  src: [[S3, "Annual shareholders' meeting within 6 months"], [CORE, 'meeting within 6 months']],
  law: [['Commercial Companies Code (KSH)', 'art. 231'], ['Accounting Act', 'art. 53(1)']],
  rec: { type: 'after_year_end', months: 6, monitoring: remind },
  slot: { id: 'pl_agm_resolution', label: "Resolution of the annual shareholders' meeting approving the accounts", reason: "The annual meeting is held within 6 months of the year end to approve the accounts and the board's report, decide on profit or loss and grant discharge.", tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Hold the meeting, adopt the resolutions, and add the resolution approving the accounts here.',
});
b.doc({
  id: 'PL.CORP.ACCOUNTS_FILING', layer: 1, area: 'filings', stage: 2, title: 'Annual accounts filed with the KRS', noun: 'KRS accounts filing confirmation', sev: 'high', tier: 4,
  src: [[S3, 'Accounts filed with the KRS within 15 days of approval'], [CORE, 'KRS filing within 15 days of approval']],
  law: [['Accounting Act', 'art. 69(1)']],
  params: { days_after_approval: 15 },
  slot: { id: 'pl_accounts_filing', label: 'Annual accounts with the KRS filing confirmation', reason: 'The accounts, the approving resolution, the board report and any audit report are filed with the KRS within 15 days of approval. The KRS extract does not show this, so we need the confirmation.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'File the documents in the KRS financial documents repository (Repozytorium Dokumentów Finansowych) and add the confirmation here.',
});
b.rule({
  id: 'PL.CORP.MEETING_NOTICES', layer: 1, area: 'governance', stage: 2, title: "Shareholders' meetings called properly", sev: 'low', tier: 5, when: SPZOO,
  src: [[S3, "Shareholders' meeting notices"]],
  law: [['Commercial Companies Code (KSH)', 'art. 238 § 1']],
  params: { notice_weeks: 2 },
  sat: told('pl_meeting_notices'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} calls its shareholders' meetings properly",
    "We don't have your confirmation that shareholders get notice of each meeting at least two weeks before, in a form the law allows.",
    'Notice goes by registered letter or courier at least two weeks before the meeting. From 3 December 2026 it can also go to an e-delivery address or by e-mail, where the shareholder agreed in documentary form.',
    'Resolutions passed at a meeting called the wrong way can be challenged.',
    'Check how you send notices, collect consents where you use e-mail, then confirm here.',
  ],
});

// --- Section 4: management board -----------------------------------------------------------------

b.rule({
  id: 'PL.CORP.MANAGEMENT', layer: 1, area: 'officers', stage: 2, title: 'A management board on record', sev: 'high', tier: 1, regulator: KRS,
  src: [[S4, 'Management board in place'], [CORE, 'management board with at least one member']],
  law: [['Commercial Companies Code (KSH)', 'art. 201']],
  sat: atLeast(`${K}.management_members_count`, 1),
  evidence: ['KRS extract'], action: 'file',
  text: [
    "We can't see a management board for {company} in the KRS",
    "We read {company}'s KRS extract and found nobody on the management board.",
    'A company has a management board of one or more members, appointed by the shareholders unless the articles say otherwise.',
    'Nobody shows as able to sign for the company, which holds up banks and investors.',
    'Check the extract and file the board appointment with the registry court if it is missing.',
  ],
});
b.rule({
  id: 'PL.CORP.BOARD_ELIGIBLE', layer: 1, area: 'officers', stage: 2, title: 'Board members free to serve', sev: 'medium', tier: 5,
  src: [[S4, 'Board members are natural persons with full capacity'], [S4, 'Board members not disqualified']],
  law: [['Commercial Companies Code (KSH)', 'art. 18']],
  sat: told('pl_board_eligible'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s board members are free to serve",
    "We don't have your confirmation that each board member is a person with full legal capacity who has not been convicted of an offence that bars office.",
    'Only a natural person with full legal capacity can sit on the board, and people convicted of certain offences cannot.',
    "A board member who is barred can put the company's decisions in doubt.",
    'Check each board member against these rules, then confirm here.',
  ],
});

// --- Section 5: intellectual property ------------------------------------------------------------

b.rule({
  id: 'PL.IP.EMPLOYEE_SOFTWARE', layer: 2, area: 'ip_ownership', stage: 2, title: 'Software written by employees in their job', sev: 'medium', tier: 5, when: STAFF,
  src: [[S5, 'Employee software belongs to the employer']],
  law: [['Copyright Act', 'art. 74(3)']],
  sat: told('pl_employee_software'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s employees write its software as part of their job",
    "We don't have your confirmation that the software your employees write is made in performing their employment duties.",
    'The economic rights in a program an employee writes in performing their duties belong to the employer, unless agreed otherwise.',
    "Code written outside the job, or under a contract that says otherwise, may not be the company's, and investors check this.",
    'Check your employment contracts cover the software people write for you, then confirm here.',
  ],
});
b.rule({
  id: 'PL.IP.EMPLOYEE_WORKS', layer: 2, area: 'ip_ownership', stage: 2, title: "Employees' other work accepted by the company", sev: 'medium', tier: 5, when: STAFF, review: true,
  src: [[S5, 'Employee works: employer acquires rights']],
  law: [['Copyright Act', 'art. 12(1)']],
  sat: told('pl_employee_works'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} acquires its employees' other work",
    "We don't have your confirmation that designs, text and other work your employees create is accepted by the company within the purpose of their contracts.",
    'For work other than software, the employer acquires the economic rights when it accepts the work, within the purpose of the employment contract, unless the law or the contract says otherwise.',
    "Work outside that purpose may not be the company's to use, and investors check this.",
    'Add an IP clause covering all work to your employment contracts, then confirm here.',
  ],
});
b.rule({
  id: 'PL.IP.CONTRACTOR_ASSIGNMENT', layer: 2, area: 'ip_ownership', stage: 2, title: 'Written IP transfer from contractors', sev: 'high', tier: 5, when: CONTRACTORS,
  src: [[CORE, 'Contractor IP assigned in writing with fields of exploitation']],
  law: [['Copyright Act', 'arts. 41, 53']],
  sat: any(held('pl_contractor_ip'), told('pl_contractor_ip')), evidence: ['Contractor agreements', 'Your confirmation'], action: 'upload',
  slot: { id: 'pl_contractor_ip', label: 'Contractor agreements with a written IP transfer naming the fields of exploitation', reason: 'There is no default rule for contractors: a transfer of rights must be in writing and covers only the fields of exploitation it names.' },
  text: [
    'Your contractors may still own what they built for {company}',
    "You haven't added your contractor agreements, or confirmed they transfer the rights in writing.",
    'There is no default rule for contractors, including on B2B contracts. A transfer of rights must be in writing or it is void, and it covers only the fields of exploitation it names.',
    'Without it, the company may not own its code or designs, and investors check this before a round.',
    'Add a written transfer listing the fields of exploitation to each contractor agreement, and add them here or confirm.',
  ],
});
b.rule({
  id: 'PL.IP.INVENTIONS', layer: 2, area: 'ip_ownership', stage: 3, title: 'Inventions made by staff and contractors', sev: 'low', tier: 5, when: yes('derived.team_or_contractors'),
  src: [[S5, 'Inventions go to the employer or commissioning party']],
  law: [['Industrial Property Law', 'arts. 11(3), 12(2)']],
  sat: told('pl_inventions'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed who owns {company}'s inventions",
    "We don't have your confirmation that inventions made by your staff and contractors belong to the company, and that any transfer is in writing.",
    'The right to a patent for an invention made in performing employment duties or another contract belongs to the employer or the party that commissioned it, unless agreed otherwise. A transfer of that right needs written form.',
    'A contract that agrees otherwise can leave an invention outside the company.',
    'Check what your employment and contractor agreements say about inventions, then confirm here.',
  ],
});
b.rule({
  id: 'PL.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'Trade mark (Polish or EU)', sev: 'medium', tier: 4, regulator: 'UPRP', review: true,
  src: [[S5, 'Polish trade mark (UPRP)'], ['EU Section 11 —', 'Brand protected by an EU trade mark or a national mark in each operating market', MAPS.eu], ['EU Section 11 —', 'Renewal every 10 years from filing', MAPS.eu]],
  rec: { type: 'every_years', from_fact: 'vault.pl_trademark.dated', years: 10, monitoring: remind },
  sat: held('pl_trademark'), evidence: ['Trade mark certificate'], action: 'file',
  slot: { id: 'pl_trademark', label: 'UPRP or EU trade mark registration certificate', reason: 'There is no UPRP lookup we can use yet, so we read your certificate. A mark lasts 10 years and can be renewed.', tier: 4 },
  text: [
    "We can't see a trade mark for {company}",
    "You haven't added a Polish or EU trade mark certificate, and we can't look marks up at the Polish Patent Office (UPRP) yet.",
    "Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.',
    'File your brand at the UPRP, or as an EU trade mark, or add your certificate here.',
  ],
});

// --- Section 6: data protection ------------------------------------------------------------------

b.rule({
  id: 'PL.DP.DPO', layer: 3, area: 'data_protection', stage: 2, title: 'Data protection officer notified to UODO', sev: 'medium', tier: 4, regulator: 'UODO', when: all(PD, yes('derived.sensitive_data')),
  shared: euObligation('DPO'),
  src: [[S6, 'DPO notified to UODO within 14 days'], [S6, 'DPO contact published on the website'], ['EU Section 1 —', 'DPO designated where required', MAPS.eu]],
  law: [['GDPR', 'Art 37'], ['Personal Data Protection Act 2018', 'arts. 10-11']],
  params: { days_after_designation: 14 },
  sat: any(held('pl_dpo_notification'), told('eu_dpo')), evidence: ['UODO notification confirmation', 'Your confirmation'], action: 'attest',
  slot: { id: 'pl_dpo_notification', label: 'UODO confirmation of the data protection officer notification', reason: "A company that designates a data protection officer notifies the President of UODO within 14 days, with the officer's name and e-mail or phone." },
  text: [
    "You haven't confirmed whether {company} needs a data protection officer",
    "You told us you handle sensitive data. We don't have a UODO confirmation for an officer, or your confirmation that you checked whether you need one.",
    'Companies whose core work is monitoring people at scale, or handling sensitive data at scale, must name an officer, notify UODO within 14 days and publish the contact on their website.',
    "If you need one and haven't notified UODO, it can act on it.",
    'Check whether the tests apply. If they do, notify UODO, publish the contact, and add the confirmation here. If you need none, confirm here.',
  ],
});

// --- Section 7: tax and employer registration ----------------------------------------------------

b.rule({
  id: 'PL.TAX.VAT_REGISTRATION', layer: 3, area: 'tax', stage: 3, title: 'VAT registration (VAT-R)', sev: 'medium', tier: 4, regulator: 'the tax office',
  src: [[S7, 'VAT registration before the first taxable sale']],
  law: [['VAT Act', 'art. 96(1)']],
  sat: any(held('pl_vat_registration'), yes(`${VIES}.valid`)),
  // Relying on the small-business exemption: whether it is open to the business is for a person.
  verify: told('pl_vat_exempt'),
  evidence: ['VAT-R confirmation', 'VIES check of your VAT number'], action: 'register',
  slot: { id: 'pl_vat_registration', label: 'VAT registration confirmation (VAT-R)', reason: 'A company files its VAT registration with the tax office before its first taxable sale. The domestic VAT list has no lookup we can use yet, so we need the confirmation.', tier: 4 },
  text: [
    "We can't see {company}'s Polish VAT registration",
    "You haven't added the VAT-R confirmation, and VIES doesn't show your number as valid for EU trade.",
    'A company registers for VAT with the tax office before its first taxable sale, unless it is exempt. VIES shows only EU registration, not domestic VAT status.',
    'Registering late can mean paying VAT you never charged your customers.',
    'Add your VAT-R confirmation here. If you rely on the small-business exemption, confirm that, and a person will check it fits your business.',
  ],
});
b.doc({
  id: 'PL.EMP.ZUS_PAYER', layer: 3, area: 'employment', stage: 2, title: 'Registered with ZUS as a contribution payer', noun: 'ZUS payer registration', sev: 'high', tier: 4, regulator: 'ZUS', when: STAFF, review: true,
  src: [[S7, 'Registered as contribution payer with ZUS within 7 days']],
  law: [['Social Insurance System Act', 'art. 43']],
  slot: { id: 'pl_zus_registration', label: 'ZUS confirmation of registration as a contribution payer', reason: 'An employer registers with ZUS, the social insurance institution, as a contribution payer within 7 days of employing its first employee.', tier: 4 },
  fix: 'Register with ZUS through its online service, and add the confirmation here.',
});
b.rule({
  id: 'PL.EMP.ZUS_EMPLOYEES', layer: 3, area: 'employment', stage: 2, title: 'Each employee reported to ZUS within 7 days', sev: 'medium', tier: 5, regulator: 'ZUS', when: STAFF,
  src: [[S7, 'Each employee reported to ZUS within 7 days']],
  law: [['Social Insurance System Act', 'art. 36(4)']],
  params: { days_after_insurance_starts: 7 },
  sat: told('pl_zus_employees'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} reports each employee to ZUS",
    "We don't have your confirmation that each employee was reported to ZUS within 7 days of their insurance starting.",
    'Each employee is reported to ZUS for social insurance within 7 days of the duty arising.',
    'Late reporting comes up in ZUS checks and can leave staff without cover.',
    'Check with your payroll provider that every employee was reported in time, then confirm here.',
  ],
});

// --- Section 9: website information --------------------------------------------------------------

b.rule({
  id: 'PL.CORP.COMPANY_PARTICULARS', layer: 1, area: 'governance', stage: 2, title: 'Company details on website, letters and order forms', sev: 'low', tier: 5,
  shared: euObligation('COMPANY_PARTICULARS'),
  src: [[S9, 'Company particulars on the website'], [CORE, 'Company particulars and e-services information on the website'], ['EU Section 3 —', 'Company particulars on letters, order forms and website', MAPS.eu]],
  law: [['Commercial Companies Code (KSH)', 'art. 206 § 1'], ['Directive (EU) 2017/1132', 'Art 26']],
  sat: told('eu_company_particulars'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s website and paperwork carry its company details",
    "We don't have your confirmation that your website, letters and order forms show the company's name, seat and address, registry court and KRS number, NIP and share capital.",
    'Polish company law lists the details a company shows, including group membership where there is one. A company set up on S24 also says if contributions are not yet made.',
    'Customers and partners look for these details, and missing ones make the company look less established.',
    'Add the details to your website footer and your letter and invoice templates, then confirm here.',
  ],
});

// --- Section 10: fundraising ---------------------------------------------------------------------

b.doc({
  id: 'PL.FUND.CAPITAL_INCREASE', layer: 5, area: 'fundraising', stage: 4, title: 'Shareholder resolution on each capital increase', noun: 'capital increase resolutions', sev: 'high', tier: 4, when: all(INVESTED, SPZOO),
  src: [[S10, 'Capital increase by amending the articles']],
  law: [['Commercial Companies Code (KSH)', 'arts. 255, 257']],
  slot: { id: 'pl_capital_increase', label: 'Notarial protocol of each capital increase resolution (or the S24 resolution)', reason: 'Unless the articles already allow it, a capital increase amends the articles, and the resolution is recorded by a notary, or on S24 for an S24 company.', tier: 4 },
  fix: 'Add the notarial protocol, or the S24 resolution, behind each capital increase.',
});
b.doc({
  id: 'PL.FUND.CAPITAL_INCREASE_FILED', layer: 5, area: 'fundraising', stage: 4, title: 'Capital increase entered in the KRS', noun: 'capital increase filing', sev: 'high', tier: 4, when: all(INVESTED, SPZOO), review: true,
  src: [[S10, 'Increase filed with the registry court']],
  law: [['Commercial Companies Code (KSH)', 'art. 262'], ['KRS Act', 'art. 22']],
  slot: { id: 'pl_capital_increase_filing', label: 'Registry court filing for the capital increase, with the board statement on contributions', reason: 'The board files the increase with the resolution, the subscription statements and its statement that contributions are paid. The increase takes effect only once registered.', tier: 4 },
  fix: 'File the increase with the registry court, add the filing here, and check the new capital shows on your KRS extract.',
});

// --- Section 11: AI ------------------------------------------------------------------------------

b.rule({
  id: 'PL.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI use disclosed to users', sev: 'low', tier: 1, when: AI,
  shared: 'ai_transparency',
  src: [[S11, 'AI transparency notice on the site']],
  // The scan may not recognise every wording: a miss on a Polish site is "to check".
  sat: any(yes('web.policy.ai_disclosure_found'), held('pl_ai_transparency')), verify: no('web.policy.ai_disclosure_found'),
  evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'pl_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI.' },
  text: [
    "We can't see where {company} tells people it uses AI",
    "We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.",
    'People must be told when they are dealing with an AI system, and AI-made content has to be marked.',
    'Enterprise customers and investors are starting to ask, and you would have no answer ready.',
    'Say on your website where your product uses AI, or add your transparency records here.',
  ],
});

export const pl = b.build();

/** International rules the Polish pack asks for in its own way. */
export const PL_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  ...euIntlEquivalents('PL', true, OMIT),
  'INTL.CORP.CONSTITUTION': ['PL.CORP.ARTICLES'],
  'INTL.IP.CONTRACTOR_ASSIGNMENT': ['PL.IP.CONTRACTOR_ASSIGNMENT'],
};

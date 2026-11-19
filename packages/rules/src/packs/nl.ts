import type { Logic } from '../logic.js';
import { addEuCommon, euIntlEquivalents, euObligation, type EuKey } from './eu-common.js';
import { all, any, held, MAPS, no, packBuilder, remind, told, yes } from './helper.js';

/**
 * Netherlands (BV only; NVs are out of scope). Draft, version 0.2.0 (EU representative and DSA rules added 18 Nov 2026): every rule waits for legal
 * review. Encoded from docs/knowledge/vero-scan-netherlands-rule-pack-map.md, plus the EU common
 * rules (eu-common.ts). Items left out, and why, are listed at the end of the Netherlands map
 * ("Not encoded"). A rule citing a [verify] line is needs_review, so it can only ever say "a
 * person needs to check this".
 *
 * The KVK source (nl.kvk) is paid and off until its key is set, and none of its facts has been
 * checked against a real reply. A miss there is "not found" (`identified` stays unknown), never
 * "doesn't exist", so every rule reading it comes out "to check". An ended registration is read
 * from documented fields but is still unconfirmed, so it is "to check" as well, never a gap.
 * The website scan may not recognise every Dutch wording, so a page we didn't find is "to check" where a rule says so.
 */
const b = packBuilder('NL', MAPS.netherlands, { name: 'Netherlands', version: '0.2.0' });

const K = 'registry.nl.kvk';
const KVK = 'KVK Business Register';
const AP = 'the Autoriteit Persoonsgegevens';
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
const S12 = 'Section 12 —';
const CORE = '5. The core set';

const includes = (value: string, key: string): Logic => ({ in: [value, { var: key }] });
const STAFF = yes('derived.employees');
const INVESTED = yes('derived.invested');
const SITE = yes('derived.has_website_or_app');
const FOUND = yes(`${K}.identified`);
const ACTIVE = `${K}.active`;
const LEGAL_FORM = `${K}.legal_form`;

// EU common rules the Netherlands writes itself, with the same shared obligation.
const OMIT: EuKey[] = ['WITHDRAWAL_FUNCTION'];

addEuCommon(b, {
  cc: 'NL', eu: true, authority: AP, english: false, omit: OMIT,
  extraSrc: {
    PRIVACY_NOTICE: [[CORE, 'Privacy notice and cookie consent that meet the GDPR and art 11.7a']],
    NOTICE_AUTHORITY: [[S6, 'Supervisory authority is the Autoriteit Persoonsgegevens']],
    COOKIE_CONSENT: [[CORE, 'Privacy notice and cookie consent that meet the GDPR and art 11.7a']],
    WEBSITE_IDENTITY: [[S9, 'Website identity details (BW 3:15d)'], [CORE, 'Website identity details under BW 3:15d']],
    REGULATOR_NAMED: [[S9, 'Website identity details (BW 3:15d)']],
    PRICES: [[S9, 'Website identity details (BW 3:15d)']],
    COMPANY_PARTICULARS: [[S1, 'KVK number on letters, orders, invoices and quotes']],
    CONSUMER_INFO: [[S9, 'Pre-contract information for distance contracts (BW 6:230m)']],
    WITHDRAWAL: [[S9, '14-day withdrawal right (BW 6:230o)']],
  },
});

// --- Section 1: company register and status ------------------------------------------------------

b.rule({
  id: 'NL.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company registration active in the Business Register', sev: 'high', tier: 1, regulator: KVK,
  src: [[S1, 'Registered in the Handelsregister within one week'], [CORE, 'Registered in the Handelsregister as an active BV']],
  law: [['Handelsregisterwet 2007', 'art 20']],
  sat: yes(ACTIVE),
  // KVK shows an end date for the registration. The field is documented but no real reply has
  // been checked yet, so a person reads the record before anyone calls it a problem.
  verify: all(FOUND, no(ACTIVE)),
  evidence: ['KVK Business Register record'], action: 'review',
  text: [
    "We can't confirm {company} is active in the Dutch Business Register",
    "We couldn't confirm from {company}'s KVK record that its registration is active. The record may show an end date, or we may not have found the company yet.",
    'Every BV is registered in the Handelsregister, and anyone who looks the company up, banks and investors included, sees whether the registration is still running.',
    'A registration shown as ended can hold up your bank, your contracts and any fundraising.',
    'Check the record on kvk.nl. If it shows an end date by mistake, ask KVK to correct it. If it is right, get advice today.',
  ],
});
b.rule({
  id: 'NL.CORP.LEGAL_FORM', layer: 1, area: 'standing', stage: 2, title: 'Legal form: BV', sev: 'low', tier: 1, regulator: KVK,
  src: [[S1, 'Legal form is a BV']],
  // The exact words KVK returns are not confirmed: anything else is "to check", never wrong.
  sat: any(includes('Besloten Vennootschap', LEGAL_FORM), includes('besloten vennootschap', LEGAL_FORM)), verify: FOUND,
  evidence: ['KVK Business Register record'], action: 'review',
  text: [
    "We couldn't confirm {company} is a BV",
    "{company}'s KVK record doesn't show the legal form as a private limited company (besloten vennootschap, BV).",
    'The Dutch checks here are written for a BV. Other legal forms have different duties.',
    'Some of the checks we show may not fit your company.',
    'Check the legal form on your KVK record. A person will look at which checks apply.',
  ],
});
b.doc({
  id: 'NL.CORP.DEED_OF_INCORPORATION', layer: 1, area: 'governance', stage: 2, title: 'Deed of incorporation (akte van oprichting)', noun: 'deed of incorporation', sev: 'high', tier: 4,
  src: [[S1, 'BV incorporated by notarial deed'], [CORE, 'Deed of incorporation and current articles']],
  law: [['Burgerlijk Wetboek Book 2', 'art 175(2)']],
  slot: { id: 'nl_deed_of_incorporation', label: 'Deed of incorporation (akte van oprichting)', reason: 'A BV is set up by a notarial deed signed by everyone who set it up. It is the proof the company was formed properly.', tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and banks and investors want to see how the company was formed.",
  fix: 'Ask the notary who set up the company for a copy of the deed of incorporation, and add it here.',
});

// --- Section 2: constitution, share register and beneficial owners -------------------------------

b.doc({
  id: 'NL.CORP.ARTICLES', layer: 1, area: 'governance', stage: 2, title: 'Articles of association (statuten)', noun: 'articles of association', sev: 'high', tier: 4,
  src: [[S2, 'Articles of association (statuten) in the deed'], [CORE, 'Deed of incorporation and current articles']],
  law: [['Burgerlijk Wetboek Book 2', 'art 234']],
  slot: { id: 'nl_articles', label: 'Current articles of association (statuten)', reason: 'The articles set out how the company is run and what its shares carry. Each change needs a new notarial deed in Dutch.', tier: 4 },
  ifLeft: "You'll be asked for them in due diligence, and a change made without a notarial deed is not valid.",
  fix: 'Add the current articles, as last changed by notarial deed. Your notary can give you the latest consolidated version.',
});
b.rule({
  id: 'NL.CORP.VOTING_SHARE', layer: 1, area: 'shareholders', stage: 2, title: 'A voting share held by someone other than the company', sev: 'low', tier: 5,
  src: [[S2, 'At least one voting share held by someone other than the company']],
  law: [['Burgerlijk Wetboek Book 2', 'art 175(1)']],
  sat: told('nl_voting_share'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has a voting share held by someone else",
    "We don't have your confirmation that at least one share with voting rights is held by someone other than the company itself.",
    'A BV must always have at least one voting share held by a person or company other than itself.',
    'If only the company holds voting shares, nobody outside it can vote at the general meeting.',
    'Check your shareholder register, then confirm here.',
  ],
});
b.doc({
  id: 'NL.CORP.SHAREHOLDER_REGISTER', layer: 1, area: 'shareholders', stage: 2, title: 'Shareholder register (aandeelhoudersregister)', noun: 'shareholder register', sev: 'high', tier: 4,
  src: [[S2, 'Shareholder register (aandeelhoudersregister) kept by the board'], [CORE, 'Shareholder register kept'], [S10, 'Shareholder register updated after the issue']],
  law: [['Burgerlijk Wetboek Book 2', 'art 194']],
  slot: { id: 'nl_shareholder_register', label: 'Shareholder register (aandeelhoudersregister)', reason: 'The board keeps a register of every shareholder, their shares and what was paid, kept up to date after each issue or transfer.', tier: 4 },
  ifLeft: 'Investors will not move without it, and the register is the first place a dispute over who owns what is settled.',
  fix: 'Bring the register up to date with every issue, transfer and pledge, and add it here.',
});
b.rule({
  id: 'NL.CORP.SHARE_TRANSFERS', layer: 1, area: 'shareholders', stage: 2, title: 'Share transfers made by notarial deed', sev: 'medium', tier: 4,
  src: [[S2, 'Share transfers by notarial deed']],
  law: [['Burgerlijk Wetboek Book 2', 'art 196(1)']],
  sat: any(held('nl_transfer_deeds'), told('nl_share_transfers_by_deed')), evidence: ['Deeds of transfer', 'Your confirmation'], action: 'attest',
  slot: { id: 'nl_transfer_deeds', label: 'Deeds of transfer of shares (akte van levering)', reason: 'Shares in a BV change hands only through a deed signed before a notary established in the Netherlands.', tier: 4 },
  text: [
    "We can't see that {company}'s share transfers were made by notarial deed",
    "You haven't added the deeds for share transfers, or confirmed that every transfer was made by deed or that none has happened.",
    'A transfer of BV shares needs a deed signed before a notary in the Netherlands.',
    'A transfer made without a deed has not taken place, so the register and the real owners can differ.',
    'Add the deed for each transfer, or confirm here that every transfer had one or that none has happened.',
  ],
});
b.doc({
  id: 'NL.CORP.UBO', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owners registered (UBO extract)', noun: 'UBO register extract', sev: 'high', tier: 4, regulator: KVK,
  src: [[CORE, 'UBOs registered']],
  law: [['Handelsregisterwet 2007', 'art 15a']],
  slot: { id: 'nl_ubo_extract', label: 'KVK extract of your own UBO registration', reason: 'Every BV registers its ultimate beneficial owners with KVK. The register is not public, so your own certified extract is how to show it was done.', tier: 4 },
  why: 'Every BV registers the people who ultimately own or control it with KVK. The register is not open to the public, so we need your copy.',
  ifLeft: 'Banks ask for it when they open or review an account, and a missing registration holds that up.',
  fix: 'Order the certified extract of your own UBO data from KVK and add it here. If the UBOs were never registered, register them with KVK now.',
});

// --- Section 3: annual accounts, general meeting and deposit ---------------------------------------

b.rule({
  id: 'NL.CORP.ACCOUNTS_PREPARED', layer: 1, area: 'filings', stage: 2, title: 'Annual accounts prepared within 5 months', sev: 'medium', tier: 5,
  src: [[S3, 'Board prepares the annual accounts within 5 months of year end'], [S12, '| Annual accounts prepared |']],
  law: [['Burgerlijk Wetboek Book 2', 'art 210(1)']],
  params: { months_after_year_end: 5, extension_months: 5 },
  rec: { type: 'after_year_end', months: 5, monitoring: remind },
  sat: told('nl_accounts_prepared'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s board prepared last year's accounts",
    "We don't have your confirmation that the board prepared the annual accounts within 5 months of the year end.",
    'The board prepares the accounts within 5 months of the year end. The general meeting can extend this by up to 5 months for special reasons.',
    'Late accounts push back adoption and the deposit at KVK, and banks and investors ask for them.',
    'Have the accounts prepared, or record the extension, then confirm here.',
  ],
});
b.rule({
  id: 'NL.CORP.ACCOUNTS_ADOPTED', layer: 1, area: 'filings', stage: 2, title: 'Annual accounts adopted by the general meeting', sev: 'medium', tier: 5,
  src: [[S3, 'General meeting adopts the accounts']],
  law: [['Burgerlijk Wetboek Book 2', 'art 210(3), (5)']],
  sat: told('nl_accounts_adopted'), evidence: ['Your confirmation', 'Shareholder resolution adopting the accounts'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s shareholders adopted last year's accounts",
    "We don't have your confirmation that the general meeting adopted the annual accounts.",
    'The general meeting adopts the accounts. Where every shareholder is also a director, all directors signing can count as adoption, under set conditions.',
    'Accounts that were never adopted are deposited marked "not yet adopted", which banks and investors notice.',
    'Hold the meeting or pass a written resolution adopting the accounts, then confirm here.',
  ],
});
b.rule({
  id: 'NL.CORP.GENERAL_MEETING', layer: 1, area: 'governance', stage: 2, title: 'A general meeting each financial year', sev: 'low', tier: 5,
  src: [[S3, 'At least one general meeting (or written resolution) each financial year'], [S12, '| General meeting |']],
  law: [['Burgerlijk Wetboek Book 2', 'art 218']],
  sat: told('nl_general_meeting'), evidence: ['Your confirmation', 'Minutes or written resolution'], action: 'attest',
  text: [
    "You haven't confirmed {company} held its general meeting this year",
    "We don't have your confirmation that the company held at least one general meeting, or passed a written resolution instead, in the last financial year.",
    'A BV holds at least one general meeting each financial year, or its shareholders decide in writing.',
    'Without it, decisions such as adopting the accounts are harder to prove.',
    'Hold the meeting or pass the written resolution, keep the record, then confirm here.',
  ],
});
b.doc({
  id: 'NL.CORP.ACCOUNTS_DEPOSIT', layer: 1, area: 'filings', stage: 2, title: 'Annual accounts deposited at KVK', noun: 'KVK accounts deposit confirmation', sev: 'high', tier: 4, regulator: KVK,
  src: [[S3, 'Accounts deposited at KVK within 8 days of adoption'], [S3, 'Accounts in Dutch, or in French, German or English'], [CORE, 'Accounts deposited at KVK each year'], [S12, '| Accounts deposited at KVK |']],
  law: [['Burgerlijk Wetboek Book 2', 'arts 394, 396(8)']],
  params: { days_after_adoption: 8, latest_months_after_year_end: 12 },
  rec: { type: 'after_year_end', months: 12, monitoring: remind },
  slot: { id: 'nl_accounts_deposit', label: 'KVK confirmation that the annual accounts were deposited', reason: 'Accounts are deposited at KVK within 8 days of adoption, and no later than 12 months after the year end. We cannot read deposited accounts yet, so we need the confirmation.', tier: 4 },
  ifLeft: 'Anyone can look up deposited accounts at KVK, so a missing deposit shows, and banks and investors ask for the accounts.',
  fix: 'Deposit the adopted accounts at KVK (a small company files a short balance sheet and notes), in Dutch, English, French or German, and add the confirmation here.',
});

// --- Section 4: directors ---------------------------------------------------------------------

b.doc({
  id: 'NL.CORP.DIRECTORS', layer: 1, area: 'officers', stage: 2, title: 'Directors registered in the Business Register', noun: 'KVK extract showing your directors', sev: 'medium', tier: 4, regulator: KVK,
  src: [[S4, 'Directors (bestuurders) registered in the Handelsregister'], [S12, '| Handelsregister and UBO changes |']],
  law: [['Handelsregisterwet 2007', 'art 20']],
  slot: { id: 'nl_kvk_extract', label: 'Recent KVK extract (uittreksel)', reason: 'Directors are recorded in the Handelsregister, and changes are filed within a week. We cannot read directors from KVK yet, so we need a recent extract.', tier: 4 },
  ifLeft: 'Banks and partners check who can sign for the company, and an out-of-date record holds that up.',
  fix: 'Download a recent extract from kvk.nl, check the directors are right, and add it here.',
});

// --- Section 5: intellectual property -------------------------------------------------------------

b.rule({
  id: 'NL.IP.EMPLOYEE_WORKS', layer: 2, area: 'ip_ownership', stage: 2, title: "Employees' work owned by the company", sev: 'medium', tier: 5, when: STAFF, review: true,
  src: [[S5, 'Works made by employees: the employer is the author by law']],
  law: [['Auteurswet', 'art 7']],
  sat: told('nl_employee_works'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} owns what its employees make",
    "We don't have your confirmation that your employees' work, code included, is made in the course of their job and that no contract gives it back to them.",
    'Where making the work is part of the job, the employer counts as its maker by law, unless agreed otherwise.',
    'Investors check who owns the code, and any doubt has to be settled before a round can close.',
    'Check your employment contracts describe the work and keep it with the company, then confirm here.',
  ],
});
b.rule({
  id: 'NL.IP.EMPLOYEE_INVENTIONS', layer: 2, area: 'ip_ownership', stage: 3, title: 'Employee inventions and fair pay', sev: 'medium', tier: 5,
  when: all(STAFF, yes('answers.has_patentable_technology')),
  src: [[S5, 'Employee inventions: patent belongs to the employer where the job is to invent']],
  law: [['Octrooiwet 1995', 'art 12']],
  sat: any(held('nl_invention_policy'), told('nl_employee_inventions')), evidence: ['Employment contracts or invention policy', 'Your confirmation'], action: 'attest',
  slot: { id: 'nl_invention_policy', label: 'Invention clause or invention policy', reason: 'The employer is entitled to a patent where the job is to invent, and the inventor is owed fair pay if their salary does not cover it.' },
  text: [
    "We can't see how {company} deals with employee inventions",
    "You told us you have technology that could be patented, and you haven't added an invention clause or policy, or confirmed how inventions are handled.",
    'Where the job is to invent, the employer is entitled to the patent. The inventor is still owed a fair amount if their salary does not cover it, and that cannot be excluded.',
    'Unclear ownership of an invention comes up in due diligence, and an inventor can claim pay for up to 3 years after the patent is granted.',
    'Add an invention clause to your employment contracts, or a short policy, and add it here or confirm you have one.',
  ],
});
b.rule({
  id: 'NL.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'Trade mark (Benelux or EU)', sev: 'medium', tier: 4, regulator: 'BOIP',
  src: [
    [S5, 'Benelux trademark registered with BOIP'], [S12, '| Trademark renewal |'],
    ['EU Section 11 —', 'Brand protected by an EU trade mark or a national mark in each operating market', MAPS.eu], ['EU Section 11 —', 'Renewal every 10 years from filing', MAPS.eu],
  ],
  rec: { type: 'every_years', from_fact: 'vault.nl_trademark.dated', years: 10, monitoring: remind },
  sat: held('nl_trademark'), evidence: ['Trade mark certificate'], action: 'file',
  slot: { id: 'nl_trademark', label: 'BOIP or EU trade mark certificate', reason: 'There is no BOIP lookup we can use yet, so we read your certificate. A Benelux mark lasts 10 years, can be renewed, and must be used within 5 years.', tier: 4 },
  text: [
    "We can't see a trade mark for {company}",
    "You haven't added a Benelux or EU trade mark certificate, and we can't look marks up at BOIP yet.",
    "Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.',
    'File your brand with BOIP, or as an EU trade mark, or add your certificate here.',
  ],
});

// --- Section 7: employer registration and contractors --------------------------------------------

b.doc({
  id: 'NL.EMP.PAYROLL_TAX_REGISTRATION', layer: 3, area: 'employment_tax', stage: 2, title: 'Registered as an employer for payroll taxes', noun: 'payroll tax registration letter', sev: 'high', tier: 4, regulator: 'Belastingdienst', when: STAFF,
  src: [[S7, 'Employer registration (loonheffingennummer) by the first employee']],
  slot: { id: 'nl_payroll_tax_number', label: 'Belastingdienst letter with your loonheffingennummer', reason: 'An employer registers with the Belastingdienst no later than the day its first employee starts. The number is not public, so we need the letter.', tier: 4 },
  ifLeft: 'Paying staff without a payroll tax number leaves tax and contributions unpaid, and the Belastingdienst can add penalties.',
  fix: 'Register with the form "Melding Loonheffingen Aanmelding werkgever" if you have not, and add the letter with your loonheffingennummer here.',
});
b.rule({
  id: 'NL.EMP.CONTRACTOR_STATUS', layer: 3, area: 'employment', stage: 2, title: 'Contractors who are truly self-employed', sev: 'medium', tier: 5, regulator: 'Belastingdienst',
  when: yes('derived.contractors'), review: true,
  src: [[S7, 'Contractor status (no hidden employment)']],
  sat: told('nl_contractor_status'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s contractors are really self-employed",
    "We don't have your confirmation that the people you hire as contractors (zzp'ers) work as independent businesses and not as hidden employees.",
    'Someone who works like an employee can be treated as one, whatever the contract calls them.',
    'The company can then owe payroll taxes and contributions for past work, with penalties.',
    'Check how each contractor works with you (their own clients, tools and hours), then confirm here.',
  ],
});

// --- Section 8: sector licences ---------------------------------------------------------------

b.doc({
  id: 'NL.FIN.PAYMENT_LICENCE', layer: 3, area: 'payments', stage: 2, title: 'DNB licence for payment or e-money services', noun: 'payment or e-money licence', sev: 'high', tier: 4, regulator: 'DNB',
  when: yes('derived.moves_money'),
  src: [[S8, 'DNB licence or registration for payment or e-money services']],
  slot: { id: 'nl_payment_licence', label: 'DNB payment or e-money licence, or your licensed partner agreement', reason: "Holding or moving customers' money needs a DNB licence or registration, or a licensed partner that covers you.", tier: 4 },
  fix: 'Add your DNB licence or registration, or the agreement with the licensed partner that covers you.',
});
b.doc({
  id: 'NL.FIN.AFM_LICENCE', layer: 3, area: 'financial_regulation', stage: 2, title: 'AFM licence for investment, crypto or credit services', noun: 'AFM licence', sev: 'high', tier: 4, regulator: 'AFM',
  when: any(yes('derived.sector.securities'), yes('derived.sector.crypto'), yes('derived.sector.lending')), review: true,
  src: [[S8, 'AFM licence (investment services, crypto-asset services)']],
  slot: { id: 'nl_afm_licence', label: 'AFM licence or notification', reason: 'Investment services, crypto-asset services and consumer credit need a licence from the AFM, or a licensed partner.', tier: 4 },
  fix: 'Add your AFM licence or notification, or the agreement with the licensed partner that covers you.',
});

// --- Section 9: consumer terms --------------------------------------------------------------------

b.rule({
  id: 'NL.CONSUMER.WITHDRAWAL_FUNCTION', layer: 4, area: 'consumer_protection', stage: 3, title: 'Online withdrawal button', sev: 'medium', tier: 5, when: all(yes('derived.consumer'), SITE), review: true,
  shared: euObligation('WITHDRAWAL_FUNCTION'),
  // No Dutch provision was found (map note 2), so the date is left out and a person checks.
  src: [[S9, 'Withdrawal function for online contracts'], ['EU Section 4 —', 'Online withdrawal function ("withdraw from contract here"), from 19 Jun 2026', MAPS.eu]],
  law: [['Directive (EU) 2023/2673', 'Art 11a of Directive 2011/83/EU']],
  sat: told('eu_withdrawal_function'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has an online withdrawal button",
    "We don't have your confirmation that consumers who signed up online can withdraw online, with a clear button and a confirmation step.",
    'EU law asks for a clear way to withdraw from contracts made online. We have not yet confirmed where and from when Dutch law puts this in place.',
    'Once it applies, consumer authorities can act on it, and consumers can complain that withdrawing was made hard.',
    'Add a clearly labelled withdrawal button with a confirm step and an emailed acknowledgement, then confirm here.',
  ],
});

// --- Section 10: fundraising ---------------------------------------------------------------------

b.doc({
  id: 'NL.FUND.ISSUE_RESOLUTION', layer: 5, area: 'fundraising', stage: 4, title: 'Resolution behind each share issue', noun: 'share issue resolutions', sev: 'high', tier: 5, when: INVESTED,
  src: [[S10, 'Share issue decided by the general meeting']],
  law: [['Burgerlijk Wetboek Book 2', 'art 206']],
  slot: { id: 'nl_issue_resolution', label: 'Resolutions to issue shares or grant rights to shares', reason: 'Each share issue, and each grant of a right to take shares, is decided by the general meeting or the body the articles name.' },
  fix: 'Add the resolution behind each share issue and each grant of rights to shares.',
});
b.doc({
  id: 'NL.FUND.DEED_OF_ISSUE', layer: 5, area: 'fundraising', stage: 4, title: 'Notarial deed for each share issue', noun: 'deeds of issue', sev: 'high', tier: 4, when: INVESTED,
  src: [[S10, 'New shares issued by notarial deed']],
  law: [['Burgerlijk Wetboek Book 2', 'art 196(1)']],
  slot: { id: 'nl_deed_of_issue', label: 'Deeds of issue (akte van uitgifte)', reason: 'New BV shares are issued only by a deed signed before a notary established in the Netherlands.', tier: 4 },
  fix: 'Ask your notary for the deed of issue for each round, and add them here.',
});

// --- Section 11: AI ----------------------------------------------------------------------------

b.rule({
  id: 'NL.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI use disclosed to users', sev: 'low', tier: 1, when: yes('derived.uses_ai'),
  shared: 'ai_transparency',
  src: [[S11, 'AI transparency disclosure on the website or app']],
  // The scan may not recognise every wording: a page in Dutch may not show up, so a miss is "to check".
  sat: any(yes('web.policy.ai_disclosure_found'), held('nl_ai_transparency')), verify: no('web.policy.ai_disclosure_found'),
  evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'nl_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI, and AI-made content has to be marked.' },
  text: [
    "We can't see where {company} tells people it uses AI",
    "We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.",
    'People must be told when they are dealing with an AI system, and AI-made content has to be marked.',
    'Enterprise customers and investors are starting to ask, and you would have no answer ready.',
    'Say on your website where your product uses AI, or add your transparency records here.',
  ],
});

export const nl = b.build();

/** International rules the Dutch pack asks for in its own way. */
export const NL_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  ...euIntlEquivalents('NL', true, OMIT),
  'INTL.CORP.CONSTITUTION': ['NL.CORP.ARTICLES'],
  'INTL.EQUITY.CAP_TABLE': ['NL.CORP.SHAREHOLDER_REGISTER'],
};

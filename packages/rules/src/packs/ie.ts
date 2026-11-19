import type { Logic } from '../logic.js';
import { addEuCommon, euIntlEquivalents, euObligation, type EuKey } from './eu-common.js';
import { all, any, auto, eq, held, MAPS, not, packBuilder, remind, told, yes } from './helper.js';

/**
 * Ireland (private company limited by shares, LTD; DACs, PLCs and unlimited companies are out of
 * scope). Draft, version 0.2.0 (EU representative and DSA rules added 18 Nov 2026): every rule waits for legal review. Encoded from
 * docs/knowledge/vero-scan-ireland-rule-pack-map.md, plus the EU common rules (eu-common.ts).
 * Items left out, and why, are listed at the end of the Ireland map ("Not encoded"). A rule
 * citing a [verify] line is needs_review, so it can only ever say "a person needs to check this".
 *
 * The CRO source (ie.cro) is off until its key is set and has not been tried against a real
 * reply, so its status words are unconfirmed: a "normal" status passes, any other status is "to
 * check", and nothing the CRO says is called a problem yet. A miss there is "not found"
 * (`identified` stays unknown), never "doesn't exist". The CRO's next annual return date drives
 * the annual return deadline; there is no fact yet that says a return is overdue.
 */
const b = packBuilder('IE', MAPS.ireland, { name: 'Ireland', version: '0.2.0' });

const C = 'registry.ie.cro';
const CRO = 'Companies Registration Office (CRO)';
const DPC = 'the Data Protection Commission';
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

const STAFF = yes('derived.employees');
const INVESTED = yes('derived.invested');
const SITE = yes('derived.has_website_or_app');
const FOUND = yes(`${C}.identified`);
/** The CRO's usual word for a company in good order. Its status words are not yet confirmed. */
const NORMAL: Logic = eq(`${C}.status`, 'normal');

// EU common rules Ireland writes itself, with the same shared obligation.
const OMIT: EuKey[] = ['COMPANY_PARTICULARS', 'WITHDRAWAL_FUNCTION'];

addEuCommon(b, {
  cc: 'IE', eu: true, authority: DPC, english: true, consentAge: 16, omit: OMIT,
  extraSrc: {
    PRIVACY_NOTICE: [[S6, '| Privacy notice published |'], [CORE, 'Privacy notice and cookie consent']],
    NOTICE_AUTHORITY: [[S6, '| Privacy notice published |']],
    CHILD_CONSENT: [[S6, 'Age of digital consent is 16']],
    DPO: [[S6, 'DPO details notified to the DPC']],
    COOKIE_CONSENT: [[S6, 'Consent before non-essential cookies'], [CORE, 'Privacy notice and cookie consent']],
    COOKIE_POLICY: [[S6, '| Cookie policy |']],
    WEBSITE_IDENTITY: [[S9, 'E-commerce service-provider information'], [CORE, 'Website shows the Companies Act particulars and e-commerce information']],
    PRICES: [[S9, 'E-commerce service-provider information']],
    REGULATOR_NAMED: [[S8, 'Activity authorisation shown on the website']],
    WITHDRAWAL: [[S9, 'Refund, cancellation and complaints pages']],
    CONSUMER_COMPLAINTS: [[S9, 'Refund, cancellation and complaints pages']],
    VAT_VIES: [[S7, 'VAT registration once over the threshold']],
  },
});

// --- Section 1: company register and status ------------------------------------------------------

b.rule({
  id: 'IE.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company status on the CRO register', sev: 'high', tier: 1, regulator: CRO,
  src: [[CORE, 'On the CRO register with normal status']],
  sat: NORMAL,
  // The CRO's status words are not confirmed against a real reply: any status other than
  // "normal" is read by a person, never called a problem here.
  verify: all(FOUND, not(NORMAL)),
  evidence: ['CRO company record'], action: 'review',
  text: [
    "We can't confirm {company} has a normal status at the CRO",
    "We couldn't confirm from {company}'s record at the Companies Registration Office that its status is normal. It may show another status, or we may not have found the company yet.",
    'Anyone who looks the company up, banks and investors included, sees its CRO status first.',
    'A company listed for strike-off, or struck off, can lose the right to trade and to hold assets in its own name.',
    'Check the record on cro.ie today. If the status is not normal, find out why and get advice on putting it right.',
  ],
});

// --- Section 2: constitution, members and beneficial owners ---------------------------------------

b.doc({
  id: 'IE.CORP.CONSTITUTION', layer: 1, area: 'governance', stage: 2, title: 'Constitution', noun: 'constitution', sev: 'high', tier: 4,
  src: [[S2, 'Constitution (single document)'], [CORE, 'Constitution uploaded']],
  law: [['Companies Act 2014', 's.19']],
  slot: { id: 'ie_constitution', label: 'Constitution (current version)', reason: "An LTD has a single-document constitution stating its name, its limited liability, its share capital and each subscriber's shares.", tier: 4 },
  ifLeft: "You'll be asked for it in due diligence, and banks and investors read it to see how the company is run.",
  fix: 'Add the current constitution, with every change made since the company was set up.',
});
b.rule({
  id: 'IE.CORP.REGISTER_OF_MEMBERS', layer: 1, area: 'shareholders', stage: 2, title: 'Register of members', sev: 'medium', tier: 5,
  src: [[S2, 'Register of members kept'], [CORE, 'Constitution uploaded; register of members kept'], [S10, 'Register of members updated after the issue'], [S12, '| Register of members |']],
  law: [['Companies Act 2014', 's.169']],
  params: { days_to_enter_change: 28 },
  sat: any(held('ie_register_of_members'), told('ie_register_of_members')), evidence: ['Register of members', 'Your confirmation'], action: 'attest',
  slot: { id: 'ie_register_of_members', label: 'Register of members', reason: 'The company keeps a register of its members: names, addresses, shares, amounts paid, and the dates each joined and left.' },
  text: [
    "We can't see {company}'s register of members",
    "You haven't added the register of members, or confirmed that you keep it up to date.",
    'Every company keeps a register of its members. New members and leavers are entered within 28 days.',
    'It is the record of who owns the company, so investors and banks ask for it.',
    'Bring the register up to date with every issue and transfer, and add it here or confirm you keep it.',
  ],
});
b.rule({
  id: 'IE.CORP.UBO_REGISTER', layer: 1, area: 'beneficial_ownership', stage: 2, title: "The company's own beneficial-ownership register", sev: 'medium', tier: 5,
  src: [[S2, 'Internal beneficial-ownership register kept']],
  law: [['S.I. 110/2019', 'reg 5']],
  sat: told('ie_ubo_register'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps its own register of beneficial owners",
    "We don't have your confirmation that the company keeps its own register of the people who ultimately own or control it.",
    'Every company takes reasonable steps to identify its beneficial owners and keeps its own register of them.',
    'The central filing is made from this register, and banks ask for it when they onboard you.',
    'Set up the register from your shareholder records, then confirm here.',
  ],
});
b.doc({
  id: 'IE.CORP.RBO_FILING', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owners filed with the RBO', noun: 'RBO filing confirmation', sev: 'high', tier: 4, regulator: 'Register of Beneficial Ownership (RBO)',
  src: [[CORE, 'Beneficial owners filed with the RBO']],
  law: [['S.I. 110/2019', 'reg 20(2)']],
  slot: { id: 'ie_rbo_filing', label: 'RBO filing confirmation', reason: 'Beneficial owners are filed with the central register (the RBO) within 5 months of incorporation. We cannot read the register, so we need the confirmation.', tier: 4 },
  ifLeft: 'Banks check the RBO before they open or review an account, and a missing filing holds that up.',
  fix: 'File your beneficial owners with the RBO online if you have not, and add the confirmation here.',
});
b.doc({
  id: 'IE.CORP.UBO_CHANGES', layer: 1, area: 'beneficial_ownership', stage: 4, title: 'Beneficial-owner update after a change', noun: 'RBO update confirmation', sev: 'medium', tier: 4, regulator: 'Register of Beneficial Ownership (RBO)', when: INVESTED,
  src: [[S10, 'Beneficial-owner update after the round'], [S12, '| Beneficial-owner updates |']],
  law: [['S.I. 110/2019', 'reg 23']],
  slot: { id: 'ie_rbo_update', label: 'RBO update confirmation', reason: 'A change in who owns or controls the company, such as after a round, is reflected in the central register too.', tier: 4 },
  ifLeft: 'An out-of-date filing shows the wrong owners to the banks that rely on it.',
  fix: 'After each change in ownership, update your filing with the RBO and add the confirmation here.',
});

// --- Section 3: annual return, accounts and meetings ---------------------------------------------

b.rule({
  id: 'IE.CORP.ANNUAL_RETURN', layer: 1, area: 'filings', stage: 2, title: 'Annual return with financial statements', sev: 'high', tier: 5, regulator: CRO,
  src: [
    [S3, 'First annual return date 6 months after incorporation'], [S3, 'Financial statements annexed to the annual return'],
    [S12, '| Annual return (B1) |'], [S12, '| Financial statements |'], [CORE, 'annual return not overdue'],
  ],
  law: [['Companies Act 2014', 'ss.343, 345, 347']],
  params: { first_return_date_months_after_incorporation: 6, days_after_return_date: 56, accounts_made_up_within_months: 9 },
  // The due date is read from the CRO. There is no fact yet that says a return is overdue, so
  // whether it was delivered is your word until one exists.
  rec: { type: 'registry_date', fact: `${C}.next_annual_return_due`, monitoring: auto('the CRO') },
  sat: told('ie_annual_return_filed'), evidence: ['Your confirmation', 'CRO annual return dates'], action: 'attest',
  text: [
    "You haven't confirmed {company} delivered its last annual return on time",
    "We don't have your confirmation that the last annual return reached the CRO within 56 days of its annual return date, with the financial statements attached.",
    'Every company delivers an annual return each year. The first annual return date is 6 months after incorporation, and the return is due within 56 days of each one.',
    'A late return is an offence, and it can cost the company its audit exemption.',
    'Check your next annual return date with the CRO, deliver the return with the statements on time, then confirm here.',
  ],
});
b.rule({
  id: 'IE.CORP.AGM', layer: 1, area: 'governance', stage: 2, title: 'Annual general meeting, or a written resolution instead', sev: 'medium', tier: 5,
  src: [[S3, 'Annual general meeting held, or dispensed with in writing'], [S12, '| AGM |']],
  law: [['Companies Act 2014', 's.175']],
  params: { max_months_between_meetings: 15, first_meeting_within_months: 18 },
  sat: told('ie_agm'), evidence: ['Your confirmation', 'Minutes or written resolution'], action: 'attest',
  text: [
    "You haven't confirmed {company} held its annual general meeting",
    "We don't have your confirmation that the company held its AGM this year, or that all voting members signed a written resolution instead.",
    'An AGM is held each year, no more than 15 months after the last, and the first within 18 months of incorporation. All voting members can agree in writing to skip it.',
    'Without it, approving the accounts and keeping the auditor are harder to show.',
    'Hold the AGM, or have every voting member sign the written resolution, then confirm here.',
  ],
});
b.rule({
  id: 'IE.CORP.AUDIT', layer: 1, area: 'filings', stage: 3, title: 'Audit, or an audit exemption you qualify for', sev: 'medium', tier: 4,
  src: [[S3, 'Audit exemption claimed only when qualifying'], [S4, 'Statutory auditor appointed unless exempt']],
  law: [['Companies Act 2014', 'ss.347, 358']],
  sat: any(held('ie_audit_report'), told('ie_audit_exemption_qualifies')), evidence: ["Auditor's report", 'Your confirmation'], action: 'attest',
  slot: { id: 'ie_audit_report', label: "Auditor's report on the financial statements", reason: 'Financial statements are audited, and the report annexed to the annual return, unless a small company claims the audit exemption.', tier: 4 },
  text: [
    "We can't see an audit report, or a confirmed exemption, for {company}",
    "You haven't added an auditor's report, or confirmed that the company qualifies for the small-company audit exemption it claims.",
    'Financial statements are audited unless the company is small and claims the exemption. A company in a group qualifies only if the group is small too.',
    'Claiming the exemption without qualifying leaves the company without the audit the law asks for, and the annual return incomplete.',
    "Add your auditor's report, or check the company meets the small-company tests and confirm here.",
  ],
});

// --- Section 4: directors and secretary ------------------------------------------------------------

const OFFICERS_SLOT = { id: 'ie_officers_register', label: 'Register of directors and secretaries, or a CRO company printout', reason: 'It shows who the directors and the secretary are, and where each director lives. We cannot read officers from the CRO yet.', tier: 4 as const };

b.doc({
  id: 'IE.CORP.DIRECTORS', layer: 1, area: 'officers', stage: 2, title: 'At least one director, and a secretary who is not the sole director', noun: 'register of directors and secretaries', sev: 'high', tier: 4, regulator: CRO,
  src: [[S4, 'At least one director'], [S4, 'A company secretary, not the sole director'], [CORE, 'At least one director, a secretary who is not the sole director']],
  law: [['Companies Act 2014', 'ss.128, 129']],
  slot: OFFICERS_SLOT,
  why: 'An LTD has at least one director and a company secretary. A sole director cannot also be the secretary, and the secretary needs the skills or support to do the job.',
  ifLeft: 'Going 28 days without a director is an offence, and banks and investors check who can sign for the company.',
  fix: 'Add your register of directors and secretaries, or a CRO company printout. If you have no secretary, or your sole director is also the secretary, appoint one and notify the CRO.',
});
b.rule({
  id: 'IE.CORP.EEA_DIRECTOR', layer: 1, area: 'officers', stage: 2, title: 'An EEA-resident director, a bond, or a CRO certificate', sev: 'high', tier: 4, regulator: CRO,
  src: [
    [S4, 'At least one EEA-resident director'], [S4, 'Bond of €25,000 in place instead'], [S4, 'Or a CRO certificate of a real and continuous economic link with Ireland'],
    [CORE, 'an EEA-resident director or a bond or s.140 certificate'],
  ],
  law: [['Companies Act 2014', 'ss.137, 140']],
  sat: any(held('ie_officers_register'), held('ie_director_bond'), held('ie_economic_link_certificate')),
  evidence: ['Register of directors showing residence', 'Bond', 'CRO certificate of economic link'], action: 'upload',
  slot: [
    OFFICERS_SLOT,
    { id: 'ie_director_bond', label: 'Bond of €25,000 in the prescribed form', reason: 'A company with no director living in the EEA can hold a bond of €25,000 instead.', tier: 4 },
    { id: 'ie_economic_link_certificate', label: 'CRO certificate of a real and continuous economic link with Ireland', reason: 'A company with no director living in the EEA can instead hold a CRO certificate that it has a real economic link with Ireland.', tier: 4 },
  ],
  text: [
    "We can't see that {company} has a director living in the EEA, or a bond or certificate instead",
    "You haven't added a register showing a director who lives in the EEA, a €25,000 bond, or a CRO certificate of a real economic link with Ireland.",
    'At least one director must live in the EEA. Alternate directors do not count. Otherwise the company needs the bond or the certificate.',
    'It is an offence, and a company without one of the three is not set up the way Irish law asks.',
    'Add your register of directors, or put the bond in place or apply to the CRO for the certificate, and add it here.',
  ],
});

// --- Section 5: intellectual property -------------------------------------------------------------

b.rule({
  id: 'IE.IP.EMPLOYEE_WORKS', layer: 2, area: 'ip_ownership', stage: 2, title: "Employees' work, code included, owned by the company", sev: 'low', tier: 5, when: STAFF,
  src: [[S5, 'Employee works (including code) owned by the company']],
  law: [['Copyright and Related Rights Act 2000', 's.23(1)(a)']],
  sat: told('ie_employee_works'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} owns what its employees make",
    "We don't have your confirmation that your employees' work, code included, is made in the course of their job and that no agreement gives it to them.",
    'The employer owns the copyright in work an employee makes in the course of the job, computer programs included, unless agreed otherwise.',
    'Investors check who owns the code, and any agreement that says otherwise has to be found before a round.',
    'Check your employment contracts keep this default in place, then confirm here.',
  ],
});
b.rule({
  id: 'IE.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'Trade mark (Irish or EU)', sev: 'medium', tier: 4, regulator: 'IPOI',
  // The map is unsure when an Irish mark's 10-year term starts, so no renewal date is set here.
  src: [[CORE, 'trademark filed'], ['EU Section 11 —', 'Brand protected by an EU trade mark or a national mark in each operating market', MAPS.eu]],
  sat: held('ie_trademark'), evidence: ['Trade mark certificate'], action: 'file',
  slot: { id: 'ie_trademark', label: 'IPOI or EU trade mark certificate', reason: 'There is no IPOI lookup we can use yet, so we read your certificate. A mark lasts 10 years and can be renewed.', tier: 4 },
  text: [
    "We can't see a trade mark for {company}",
    "You haven't added an Irish or EU trade mark certificate, and we can't look marks up at the IPOI yet.",
    "Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.',
    'File your brand at the IPOI, or as an EU trade mark, or add your certificate here.',
  ],
});

// --- Section 6: data protection and marketing ----------------------------------------------------

b.rule({
  id: 'IE.COM.MARKETING_OPT_OUT', layer: 3, area: 'marketing', stage: 2, title: 'Marketing opt-out shown where contact details are collected', sev: 'low', tier: 5,
  when: all(SITE, yes('derived.sends_marketing')),
  // An Irish e-commerce rule for providers established in Ireland: it doesn't follow a company abroad.
  overlay: 'never',
  src: [[S6, 'Opt-out choice shown where personal data is collected for marketing']],
  law: [['S.I. 68/2003', 'reg 7(1)(d)']],
  // The scan finds opt-out wording on a page, not at every form: your word decides.
  sat: told('ie_marketing_opt_out'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} shows a marketing opt-out wherever it collects details",
    "You told us you send marketing, and we don't have your confirmation that every sign-up or contact form tells people how to opt out of it.",
    'Wherever personal data is collected, people must be told how to register their choice about receiving marketing.',
    'Marketing sent without that choice leads to complaints, and the rules on unsolicited messages are enforced.',
    'Add a clear opt-out choice to each form that collects contact details, then confirm here.',
  ],
});

// --- Section 7: employer registration and payroll -------------------------------------------------

b.doc({
  id: 'IE.EMP.EMPLOYER_REGISTRATION', layer: 3, area: 'employment_tax', stage: 2, title: 'Registered with Revenue as an employer', noun: 'Revenue employer registration confirmation', sev: 'high', tier: 4, regulator: 'Revenue', when: STAFF, review: true,
  src: [[S7, 'Registered as an employer before paying staff']],
  slot: { id: 'ie_employer_registration', label: 'Revenue employer registration confirmation', reason: 'A company registers with Revenue as an employer before it pays staff. The registration is not public, so we need the confirmation.', tier: 4 },
  ifLeft: 'Paying staff without registering leaves tax unpaid, and Revenue can add interest and penalties.',
  fix: 'Register as an employer through Revenue Online Service if you have not, and add the confirmation here.',
});
b.rule({
  id: 'IE.EMP.PAYROLL_REPORTING', layer: 3, area: 'employment', stage: 2, title: 'Pay reported to Revenue on or before each payday', sev: 'high', tier: 5, regulator: 'Revenue', when: STAFF,
  src: [[S7, 'Pay reported to Revenue on or before each payday'], [S12, '| Payroll |']],
  rec: { type: 'periodic', every_months: 1, monitoring: remind },
  sat: told('ie_payroll_reported'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} reports pay to Revenue each payday",
    "We don't have your confirmation that each payment to staff is reported to Revenue on or before the payday, with income tax, PRSI and USC deducted.",
    "Employers report each employee's pay and deductions to Revenue on or before every payday, and register each employment.",
    'Late or missing reports bring penalties and interest, and staff records with Revenue go wrong.',
    'Check with your payroll provider that each payday is reported, then confirm here.',
  ],
});

// --- Section 8: sector licences ---------------------------------------------------------------

b.doc({
  id: 'IE.FIN.CENTRAL_BANK_AUTHORISATION', layer: 3, area: 'payments', stage: 2, title: 'Central Bank authorisation for payments, e-money or crypto', noun: 'Central Bank authorisation', sev: 'high', tier: 4, regulator: 'Central Bank of Ireland',
  when: any(yes('derived.moves_money'), yes('derived.sector.crypto')), review: true,
  src: [[S8, 'Central Bank authorisation for payment, e-money or crypto-asset services']],
  slot: { id: 'ie_central_bank_authorisation', label: 'Central Bank of Ireland authorisation, or your licensed partner agreement', reason: "Holding or moving customers' money, or offering crypto-asset services, needs Central Bank authorisation or a licensed partner.", tier: 4 },
  fix: 'Add your Central Bank authorisation, or the agreement with the licensed partner that covers you.',
});

// --- Section 9: website and consumer -------------------------------------------------------------

b.rule({
  id: 'IE.CORP.COMPANY_PARTICULARS', layer: 1, area: 'governance', stage: 2, title: 'Company details on the website, letters and order forms', sev: 'low', tier: 5,
  shared: euObligation('COMPANY_PARTICULARS'),
  src: [
    [S9, 'Company particulars on the website'], [S9, 'Company particulars and directors on letters and order forms'],
    [CORE, 'Website shows the Companies Act particulars and e-commerce information'], ['EU Section 3 —', 'Company particulars on letters, order forms and website', MAPS.eu],
  ],
  law: [['Companies Act 2014', 's.151']],
  sat: told('eu_company_particulars'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s website and letters carry its company details",
    "We don't have your confirmation that your website, letters and order forms show the company's name, legal form, place of registration, number and registered office, and that letters name the directors. We can't check this yet.",
    'The details must be shown prominently on the website. Letters also name the directors, with their nationality if not Irish. Any share capital shown must be the paid-up capital.',
    'Leaving them out is an offence, and it makes the company look less established.',
    'Add the details to your website footer and your letter and order templates, then confirm here.',
  ],
});
b.rule({
  id: 'IE.CONSUMER.WITHDRAWAL_FUNCTION', layer: 4, area: 'consumer_protection', stage: 3, title: 'Online withdrawal button', sev: 'medium', tier: 5, when: all(yes('derived.consumer'), SITE), review: true,
  shared: euObligation('WITHDRAWAL_FUNCTION'),
  // The Irish text putting the EU rule in place, and its date, were not read: a person checks.
  src: [[S9, '| Withdrawal function |'], ['EU Section 4 —', 'Online withdrawal function ("withdraw from contract here"), from 19 Jun 2026', MAPS.eu]],
  law: [['Directive (EU) 2023/2673', 'Art 11a of Directive 2011/83/EU']],
  sat: told('eu_withdrawal_function'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has an online withdrawal button",
    "We don't have your confirmation that consumers who signed up online can withdraw online, with a clear button and a confirmation step.",
    'EU law asks for a clear way to withdraw from contracts made online. We have not yet confirmed where and from when Irish law puts this in place.',
    'Once it applies, consumer authorities can act on it, and consumers can complain that withdrawing was made hard.',
    'Add a clearly labelled withdrawal button with a confirm step and an emailed acknowledgement, then confirm here.',
  ],
});

// --- Section 10: fundraising -----------------------------------------------------------------------

b.doc({
  id: 'IE.FUND.ALLOTMENT_AUTHORITY', layer: 5, area: 'fundraising', stage: 4, title: 'Directors authorised to allot shares', noun: 'authority to allot shares', sev: 'high', tier: 5, when: INVESTED,
  src: [[S10, 'Directors authorised to allot shares']],
  law: [['Companies Act 2014', 's.69(1)-(5)']],
  slot: { id: 'ie_allotment_authority', label: 'Ordinary resolution or constitution clause authorising the directors to allot shares', reason: 'Directors may allot shares only with authority from the members or the constitution, and within any authorised capital.' },
  fix: 'Add the resolution or the constitution clause that gave the directors authority for each allotment.',
});
b.doc({
  id: 'IE.FUND.PRE_EMPTION', layer: 5, area: 'fundraising', stage: 4, title: 'Pre-emption offer made, or disapplied', noun: 'pre-emption records', sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'Pre-emption offer made or disapplied']],
  law: [['Companies Act 2014', 's.69(6), (12)']],
  slot: { id: 'ie_pre_emption', label: 'Pre-emption offer, or the special resolution or constitution clause disapplying it', reason: 'Shares issued for cash are first offered to existing holders for at least 14 days, unless the constitution or a special resolution disapplies it.' },
  fix: 'Add the pre-emption offer for each cash issue, or the resolution or constitution clause that disapplied it.',
});
b.doc({
  id: 'IE.FUND.RETURN_OF_ALLOTMENTS', layer: 5, area: 'fundraising', stage: 4, title: 'Return of allotments delivered to the CRO', noun: 'return of allotments receipt', sev: 'medium', tier: 4, regulator: CRO, when: INVESTED, review: true,
  src: [[S10, 'Return of allotments delivered within 30 days'], [S12, '| Return of allotments |']],
  law: [['Companies Act 2014', 's.70(7)']],
  params: { days_after_allotment: 30 },
  slot: { id: 'ie_return_of_allotments', label: 'CRO receipt for the return of allotments', reason: 'Each allotment of shares is reported to the CRO within 30 days.', tier: 4 },
  fix: 'Deliver the return of allotments to the CRO for each allotment, and add the receipt here.',
});
b.rule({
  id: 'IE.FUND.NO_PUBLIC_OFFER', layer: 5, area: 'fundraising', stage: 4, title: 'No public offer of shares by an LTD', sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'No public offer of shares outside the exemptions']],
  law: [['Companies Act 2014', 's.68']],
  sat: told('ie_no_public_offer'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s share offers stayed private",
    "We don't have your confirmation that the company has not offered its shares to the public outside the allowed exemptions.",
    'An LTD may not offer shares to the public. Offers to qualified investors, or to 149 or fewer other people, are allowed.',
    'An offer outside the exemptions is an offence, and it can unsettle the round.',
    'Check each offer, including any crowdfunding or wide investor outreach, fits an exemption, then confirm here.',
  ],
});

// --- Section 11: AI ----------------------------------------------------------------------------

b.rule({
  id: 'IE.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI use disclosed to users', sev: 'low', tier: 1, when: yes('derived.uses_ai'),
  shared: 'ai_transparency',
  src: [[S11, 'AI use disclosed to users']],
  sat: any(yes('web.policy.ai_disclosure_found'), held('ie_ai_transparency')),
  evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'ie_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI, and AI-made content has to be marked.' },
  text: [
    "We can't see where {company} tells people it uses AI",
    "We couldn't find an AI disclosure on your website, and you haven't added transparency records.",
    'People must be told when they are dealing with an AI system, and AI-made content has to be marked.',
    'Enterprise customers and investors are starting to ask, and you would have no answer ready.',
    'Say on your website where your product uses AI, or add your transparency records here.',
  ],
});

export const ie = b.build();

/** International rules the Irish pack asks for in its own way. */
export const IE_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  ...euIntlEquivalents('IE', true, OMIT),
  'INTL.CORP.CONSTITUTION': ['IE.CORP.CONSTITUTION'],
  'INTL.EQUITY.CAP_TABLE': ['IE.CORP.REGISTER_OF_MEMBERS'],
};

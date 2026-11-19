import type { Logic } from '../logic.js';
import { all, any, held, MAPS, not, packBuilder, told, yes } from './helper.js';

/**
 * Singapore (private company limited by shares). Draft, version 0.1.0: every rule waits for a
 * Singapore lawyer. Encoded from docs/knowledge/vero-scan-singapore-rule-pack-map.md; the items
 * left out, and why, are listed at the end of that map ("Not encoded"). A rule citing a [verify]
 * line is needs_review, so it can only ever say "a person needs to check this". The only register
 * is ACRA's monthly open dataset: no officers, members or filings, and a miss is never a problem.
 */
const b = packBuilder('SG', MAPS.singapore, { name: 'Singapore', version: '0.1.0' });

const A = 'registry.sg.acra';
const ACRA = 'ACRA';
const PD = yes('derived.personal_data');
const INVESTED = yes('derived.invested');
const MARKETING = yes('derived.sends_marketing');
const L1 = '3.1 Layer 1';
const L3 = '3.3 Layer 3';
const L5 = '3.5 Layer 5';
const CORE = '5. Core set';

const oneOf = (key: string, values: string[]): Logic => ({ in: [{ var: key }, values] });
const STATUS = `${A}.status`;
/** The dataset's own words for a live UEN, lower-cased. "registered" was read in a real reply. */
const LIVE = ['registered', 'live', 'live_company'];
/** Its words for a UEN that is no longer live. Any other word is left to a person. */
const GONE = ['deregistered', 'de-registered', 'struck_off', 'struck-off'];

/** One ACRA business profile evidences officers, office, capital, members and the last return. */
const PROFILE = {
  id: 'sg_business_profile', label: 'ACRA business profile (BizFile)', tier: 4 as const,
  reason: "ACRA's open data has no officers, members or filings. One recent business profile shows them all.",
};

// --- Layer 1: company foundations -------------------------------------------------------------

b.rule({
  id: 'SG.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company registered with ACRA', sev: 'critical', tier: 1, regulator: ACRA,
  src: [[L1, 'SG-1.01'], [CORE, 'Registered with ACRA, UEN live, local private company']],
  sat: any(oneOf(STATUS, LIVE), held(PROFILE.id)),
  defect: all(yes(`${A}.identified`), oneOf(STATUS, GONE)),
  verify: all(yes(`${A}.identified`), not(oneOf(STATUS, [...LIVE, ...GONE]))),
  evidence: ["ACRA's register of entities", 'ACRA business profile'], action: 'review', slot: PROFILE,
  text: [
    "{company}'s UEN doesn't show as live with ACRA",
    "ACRA's register of entities shows {company}'s UEN as deregistered or struck off.",
    'Anyone who looks the company up, banks and investors included, sees this status first.',
    'A company that has been struck off can lose its assets and its right to trade.',
    "Check the company on ACRA's BizFile today and get qualified advice on what can still be done. If the record is out of date, add a recent business profile.",
  ],
});
b.rule({
  id: 'SG.CORP.ENTITY_TYPE', layer: 1, area: 'standing', stage: 2, title: 'Local private company', sev: 'low', tier: 1, regulator: ACRA,
  src: [[L1, 'SG-1.02']],
  sat: all({ '==': [{ var: `${A}.entity_type` }, 'Local Company'] }, { in: ['PTE', { var: `${A}.registered_name` }] }),
  // Another kind of entity isn't wrong, just outside this pack.
  verify: yes(`${A}.identified`),
  evidence: ["ACRA's register of entities"], action: 'review',
  text: [
    "We couldn't confirm {company} is a local private company",
    "ACRA's register doesn't show {company} as a local company with Pte. Ltd. in its name.",
    'The Singapore checks here are written for private companies limited by shares.',
    'Some of the checks we show may not fit your company.',
    'Check the entity type on BizFile. A person will look at which checks apply.',
  ],
});
b.rule({
  id: 'SG.CORP.REGISTERED_OFFICE', layer: 1, area: 'filings', stage: 2, title: 'Registered office in Singapore', sev: 'medium', tier: 1, regulator: ACRA, review: true,
  src: [[L1, 'SG-1.04'], [CORE, 'Registered office present']],
  sat: any({ '!!': [{ var: `${A}.registered_postcode` }] }, held(PROFILE.id)), evidence: ["ACRA's register of entities", 'ACRA business profile'], action: 'file', slot: PROFILE,
  text: [
    "We can't see a registered office for {company}",
    "ACRA's register shows no registered office postcode for {company}, and you haven't added a business profile.",
    'A Singapore company has a registered office in Singapore, and keeps registers such as its register of controllers there.',
    'Official letters and legal papers may not reach you.',
    'Check the registered office on BizFile and update it if it is missing.',
  ],
});
b.rule({
  id: 'SG.CORP.RESIDENT_DIRECTOR', layer: 1, area: 'officers', stage: 2, title: 'A director living in Singapore', sev: 'high', tier: 5, review: true,
  src: [[L1, 'SG-1.05'], [CORE, 'Resident director, secretary within 6 months, auditor within 3 months unless exempt']],
  sat: told('sg_resident_director'), evidence: ['Your confirmation', 'ACRA business profile'], action: 'attest',
  text: [
    "You haven't confirmed {company} has a director living in Singapore",
    "We don't have your confirmation that at least one director ordinarily lives in Singapore. We don't keep people's details, so we can't check.",
    'Every Singapore company needs at least one director who ordinarily lives in Singapore.',
    'Without one, the company is not set up the way ACRA requires, and banks will ask.',
    'Check your directors on BizFile, then confirm here.',
  ],
});
b.rule({
  id: 'SG.CORP.SECRETARY', layer: 1, area: 'officers', stage: 2, title: 'Company secretary', sev: 'medium', tier: 5, review: true,
  src: [[L1, 'SG-1.06']],
  sat: told('sg_secretary'), evidence: ['Your confirmation', 'ACRA business profile'], action: 'attest',
  text: [
    "You haven't confirmed {company} has a company secretary",
    "We don't have your confirmation that the company has appointed a secretary.",
    'A Singapore company appoints a secretary within 6 months of incorporation. The secretary is a person, and not the sole director.',
    'The post cannot stay empty for more than 6 months.',
    'Check the secretary on BizFile, appoint one if needed, then confirm here.',
  ],
});
b.rule({
  id: 'SG.CORP.AUDITOR', layer: 1, area: 'officers', stage: 2, title: 'Auditor, or an audit exemption', sev: 'medium', tier: 5,
  src: [[L1, 'SG-1.07'], [CORE, 'Resident director, secretary within 6 months, auditor within 3 months unless exempt']],
  sat: any(told('sg_auditor'), told('sg_small_company')), evidence: ['Your confirmation', 'ACRA business profile'], action: 'attest',
  text: [
    "You haven't confirmed {company} has an auditor, or is exempt",
    "We don't have your confirmation that the company appointed an auditor, or that it is exempt from audit.",
    'A Singapore company appoints an auditor within 3 months of incorporation, unless it qualifies as exempt from audit.',
    'If you are not exempt, your accounts will not meet ACRA\'s rules without an audit.',
    'Confirm the auditor you appointed, or confirm the company is exempt. A person will check the exemption applies.',
  ],
});
b.rule({
  id: 'SG.CORP.ELECTRONIC_REGISTERS', layer: 1, area: 'filings', stage: 2, title: "ACRA's registers of members and officers kept up to date", sev: 'medium', tier: 4, regulator: ACRA,
  src: [[L1, 'SG-1.08']],
  sat: held(PROFILE.id), evidence: ['ACRA business profile'], action: 'file', slot: PROFILE,
  text: [
    "We can't see {company}'s members and officers as ACRA holds them",
    "You haven't added a recent ACRA business profile, so we can't see the registers ACRA keeps for the company.",
    'ACRA keeps the registers of members, directors, secretaries and auditors. Changes are filed through BizFile within 14 days.',
    "If these registers are out of date, they don't match who really owns and runs the company.",
    'Buy a current business profile on BizFile, check it, and add it here.',
  ],
});
b.rule({
  id: 'SG.CORP.CONTROLLERS_REGISTER', layer: 1, area: 'officers', stage: 2, title: 'Register of registrable controllers', sev: 'high', tier: 5,
  src: [[L1, 'SG-1.09'], [CORE, 'RORC kept and filed with the central register']],
  sat: told('sg_rorc'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps a register of its controllers",
    "We don't have your confirmation that the company keeps its register of registrable controllers. It isn't public, so we can't check.",
    'A Singapore company keeps a register of the people who control it, from the day it is registered, and updates it within 7 days of a confirmed change.',
    'Banks and investors ask about the people who control a company before they work with it.',
    'Set up or update the register at your registered office, send the yearly notices to each controller, then confirm here.',
  ],
});
b.rule({
  id: 'SG.CORP.CENTRAL_CONTROLLERS', layer: 1, area: 'officers', stage: 2, title: "Controllers filed with ACRA's central register", sev: 'high', tier: 5, regulator: ACRA,
  src: [[L1, 'SG-1.10'], [CORE, 'RORC kept and filed with the central register']],
  sat: told('sg_central_rorc'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s controllers are filed with ACRA",
    "We don't have your confirmation that the company's controller information is filed with ACRA's central register.",
    "Each update to the company's own register is filed with ACRA within 2 business days. There is no extension.",
    "Without it, ACRA's record of who controls the company is out of date.",
    'File any update through BizFile, then confirm here.',
  ],
});
b.rule({
  id: 'SG.CORP.NOMINEE_REGISTERS', layer: 1, area: 'officers', stage: 2, title: 'Registers of nominee directors and shareholders', sev: 'high', tier: 5,
  when: yes('derived.sg.nominees'),
  src: [[L1, 'SG-1.11']],
  sat: told('sg_nominee_registers'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps its nominee registers",
    "You told us the company has a nominee director or shareholder, and we don't have your confirmation that the nominee registers are kept and filed.",
    'Nominee directors and shareholders are recorded in registers updated within 7 days, and filed with ACRA within 2 business days.',
    'Who really stands behind a nominee is one of the first things a bank checks.',
    'Update the registers and file them through BizFile, then confirm here.',
  ],
});
b.rule({
  id: 'SG.CORP.AGM', layer: 1, area: 'filings', stage: 3, title: 'Annual general meeting', sev: 'medium', tier: 5, review: true,
  src: [[L1, 'SG-1.12']],
  sat: told('sg_agm'), evidence: ['Your confirmation', 'ACRA business profile'], action: 'attest',
  text: [
    "You haven't confirmed {company} held its annual general meeting",
    "We don't have your confirmation that the company held its annual general meeting, or did what replaces it.",
    'A Singapore company holds an annual general meeting after each financial year end, unless it is allowed to do without one.',
    'Investors check that the company keeps up with its yearly meetings.',
    'Check the date of your last meeting, then confirm here.',
  ],
});
b.rule({
  id: 'SG.CORP.ANNUAL_RETURN', layer: 1, area: 'filings', stage: 3, title: 'Annual return', sev: 'high', tier: 4, regulator: ACRA, review: true, penalty: 'moderate',
  src: [[L1, 'SG-1.13']],
  sat: held(PROFILE.id), evidence: ['ACRA business profile'], action: 'file', slot: PROFILE,
  text: [
    "We can't see {company}'s last annual return",
    "ACRA's open data has no filings, and you haven't added a business profile showing the last annual return.",
    'A Singapore company files an annual return with ACRA each year after its financial year end.',
    'Late filing is fined, and investors check that filings are up to date.',
    'Buy a current business profile on BizFile, check the last annual return date, and add it here.',
  ],
});
b.rule({
  id: 'SG.CORP.FINANCIAL_STATEMENTS', layer: 1, area: 'filings', stage: 3, title: 'Financial statements filed', sev: 'medium', tier: 4, regulator: ACRA, review: true,
  src: [[L1, 'SG-1.14']],
  sat: held('sg_financial_statements'), evidence: ['Financial statements'], action: 'file',
  slot: { id: 'sg_financial_statements', label: 'Financial statements filed with ACRA', reason: 'They are filed with the annual return, and investors read them first.', tier: 4 },
  text: [
    "We don't have {company}'s financial statements",
    "You haven't added the financial statements filed with your last annual return.",
    'A Singapore company prepares financial statements each year and files them with its annual return.',
    'Investors and banks ask for them before anything else.',
    'Add the statements you filed with ACRA.',
  ],
});

// --- Layer 3: compliance ----------------------------------------------------------------------

b.rule({
  id: 'SG.DP.DPO', layer: 3, area: 'privacy', stage: 2, title: 'Data protection officer', sev: 'high', tier: 5, when: PD,
  src: [[L3, 'SG-3.01'], [CORE, 'DPO designated with public contact details']],
  law: [['Personal Data Protection Act 2012']], regulator: 'PDPC',
  sat: told('sg_dpo'), evidence: ['Your confirmation', 'Contact details on your website'], action: 'attest',
  text: [
    "You haven't confirmed {company} has a data protection officer",
    "We don't have your confirmation that the company designated a data protection officer and registered them with the PDPC.",
    'A Singapore organisation that handles personal data designates at least one data protection officer, publishes how to reach them, and keeps their registration with the PDPC active.',
    'Without one, people have nobody to ask about their data, and anyone can see that.',
    'Name a data protection officer, register them through BizFile or the PDPC form, publish a contact address, then confirm here.',
  ],
});
b.rule({
  id: 'SG.DP.PROCESSING_AGREEMENTS', layer: 3, area: 'privacy', stage: 2, title: 'Data protection terms with data intermediaries', sev: 'medium', tier: 5,
  when: all(PD, yes('derived.has_processors')),
  src: [[L3, 'SG-3.05']],
  law: [['Personal Data Protection Act 2012']], regulator: 'PDPC',
  sat: held('sg_dpa'), evidence: ['Data protection terms with each vendor'],
  slot: { id: 'sg_dpa', label: 'Data protection terms with vendors (data intermediaries)', reason: 'Vendors that handle personal data for you need contract terms that protect it.' },
  text: [
    "We don't have {company}'s data protection terms with its vendors",
    "You haven't added the contract terms that cover how vendors handle personal data for you.",
    "Singapore's data protection rules expect your contract with each vendor to cover how they protect personal data.",
    "If a vendor loses your customers' data, you would have no terms to point to.",
    'Collect the data protection terms from each vendor that handles personal data for you, and add them here.',
  ],
});
b.rule({
  id: 'SG.DP.DO_NOT_CALL', layer: 3, area: 'marketing', stage: 3, title: 'Do Not Call Register checks', sev: 'medium', tier: 5, review: true, when: MARKETING,
  src: [[L3, 'SG-3.06']],
  law: [['Personal Data Protection Act 2012']], regulator: 'PDPC',
  sat: told('sg_dnc_checks'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} checks the Do Not Call Register",
    "We don't have your confirmation that numbers are checked against the Do Not Call Register before marketing messages or calls.",
    'Before a marketing message or call to a Singapore number, the number is checked against the register, unless the person clearly agreed in a form you can show.',
    'A message to a number on the register breaks the rules unless the person clearly agreed.',
    'Check numbers before each campaign, keep the results, honour opt-outs, then confirm here.',
  ],
});

// --- Tax and employment -----------------------------------------------------------------------

b.rule({
  id: 'SG.TAX.GST', layer: 3, area: 'tax', stage: 3, title: 'GST registration', sev: 'medium', tier: 4, regulator: 'IRAS',
  src: [[L3, 'SG-3.07']], params: { threshold_sgd: 1_000_000 },
  sat: any(held('sg_gst_registration'), told('sg_gst_below_threshold')), evidence: ['IRAS GST registration', 'Your confirmation'], action: 'register',
  slot: { id: 'sg_gst_registration', label: 'GST registration letter (IRAS)', reason: 'It shows the company is registered for GST with IRAS.', tier: 4 },
  text: [
    "We can't see {company}'s GST registration",
    "You haven't added the IRAS GST registration, or confirmed the company is below the threshold.",
    'A company registers for GST when its taxable turnover goes over S$1 million, looking back over the calendar year or ahead over the next 12 months.',
    'Registering late can mean paying GST you never charged your customers.',
    'If you are registered, add the IRAS letter. If you are below the threshold, confirm that here.',
  ],
});
b.rule({
  id: 'SG.EMP.CPF', layer: 3, area: 'employment', stage: 2, title: 'CPF contributions', sev: 'high', tier: 4, regulator: 'CPF Board',
  when: yes('derived.sg.cpf_employees'),
  src: [[L3, 'SG-3.08']],
  sat: held('sg_cpf_csn'), evidence: ['CPF letter with your CPF Submission Number'], action: 'register',
  slot: { id: 'sg_cpf_csn', label: 'CPF Submission Number letter', reason: 'You need a CPF Submission Number before you can pay contributions for your staff.', tier: 4 },
  text: [
    "We can't see {company}'s CPF Submission Number",
    "You told us you employ Singapore citizens or permanent residents, and you haven't added the CPF letter with the company's CPF Submission Number.",
    'Employers pay CPF contributions for Singapore citizen and permanent resident employees earning more than S$50 a month, by the last day of each month.',
    'Staff see missing contributions in their own CPF accounts.',
    'Get your CPF Submission Number from the CPF Board if you need one, and add the letter here.',
  ],
});

// --- Layer 5: fundraising ---------------------------------------------------------------------

b.rule({
  id: 'SG.EQUITY.ALLOTMENT_RECORDED', layer: 5, area: 'shareholders', stage: 4, title: 'New shares recorded with ACRA', sev: 'high', tier: 4, regulator: ACRA, review: true, when: INVESTED,
  src: [[L5, 'SG-5.01']],
  sat: held(PROFILE.id), evidence: ['ACRA business profile'], action: 'file', slot: PROFILE,
  text: [
    "We can't see {company}'s new shares in ACRA's register",
    "You haven't added a business profile showing the members and share capital after your round.",
    "For a private company, new shares only take effect when ACRA updates its register of members, and the date can't be backdated.",
    'Until then, your new investors may not legally hold their shares.',
    'File the allotment through BizFile, buy a business profile once it shows, and add it here.',
  ],
});
b.rule({
  id: 'SG.EQUITY.REGISTERS_AFTER_ROUND', layer: 5, area: 'shareholders', stage: 4, title: 'Registers updated after a round', sev: 'medium', tier: 5, when: INVESTED,
  src: [[L5, 'SG-5.03']],
  sat: told('sg_registers_updated_after_round'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s registers were updated after the round",
    "We don't have your confirmation that the register of controllers, the nominee registers and ACRA's register of members were updated after new shares were issued.",
    'A round can change who controls the company, and each register has to show it.',
    'The next investor or bank will check them against your round documents.',
    'Update each one after every round, then confirm here.',
  ],
});

export const sg = b.build();

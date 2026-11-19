import type { Logic } from '../logic.js';
import { all, any, eq, held, MAPS, no, not, packBuilder, told, yes } from './helper.js';

/**
 * Canada: corporations under the Canada Business Corporations Act (CBCA), federal law only.
 * Draft, version 0.1.0: every rule waits for a Canadian lawyer. Encoded from
 * docs/knowledge/vero-scan-canada-rule-pack-map.md; the items left out, and why, are listed at the
 * end of that map ("Not encoded"). A rule citing a [verify] line is needs_review, so it can only
 * ever say "a person needs to check this". Provinces are out of scope. The register is
 * Corporations Canada's federal API: a provincial corporation is simply not in it, which is never
 * read as a problem.
 */
const b = packBuilder('CA', MAPS.canada, { name: 'Canada (federal)', version: '0.1.0' });

const C = 'registry.ca.corporations';
const CC = 'Corporations Canada';
const PD = yes('derived.personal_data');
const INVESTED = yes('derived.invested');
const MARKETING = yes('derived.sends_marketing');
const L1 = '3.1 Layer 1';
const L3 = '3.3 Layer 3';
const L4 = '3.4 Layer 4';
const L5 = '3.5 Layer 5';
const CORE = '5. Core set';

const v = (key: string): Logic => ({ var: key });
const STATUS = `${C}.status`;
/** The status words aren't confirmed yet: "active" passes, any word with "dissolved" in it is a dissolution, the rest a person reads. */
const DISSOLVED: Logic = { in: ['dissolved', v(STATUS)] };

// --- Layer 1: company foundations -------------------------------------------------------------

b.rule({
  id: 'CA.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Federal corporation active', sev: 'critical', tier: 1, regulator: CC,
  src: [[L1, 'CA-1.01'], [CORE, 'Active CBCA corporation']],
  sat: eq(STATUS, 'active'),
  defect: all(yes(`${C}.identified`), DISSOLVED),
  verify: all(yes(`${C}.identified`), not(any(eq(STATUS, 'active'), DISSOLVED))),
  evidence: ["Corporations Canada's federal register"], action: 'review',
  text: [
    "{company} shows as dissolved in Corporations Canada's register",
    "We read {company}'s record from Corporations Canada, and it shows the corporation as dissolved.",
    'Anyone who looks the corporation up, banks and investors included, sees this status first.',
    'A dissolved corporation can lose its property and can no longer carry on business.',
    'Check the record on the Corporations Canada website today and get qualified advice on reviving the corporation.',
  ],
});
b.rule({
  id: 'CA.CORP.ACT', layer: 1, area: 'standing', stage: 2, title: 'Incorporated under the CBCA', sev: 'low', tier: 1, regulator: CC,
  src: [[L1, 'CA-1.02']],
  sat: any(eq(`${C}.act`, 'Canada Business Corporations Act'), eq(`${C}.act`, 'CBCA')),
  // Another federal Act isn't wrong, just outside this pack.
  verify: yes(`${C}.identified`),
  evidence: ["Corporations Canada's federal register"], action: 'review',
  text: [
    "We couldn't confirm {company} is a CBCA corporation",
    "Corporations Canada's record doesn't show {company} under the Canada Business Corporations Act.",
    'The Canadian checks here are written for business corporations under that Act.',
    'Some of the checks we show may not fit your corporation.',
    'Check the Act on your certificate of incorporation. A person will look at which checks apply.',
  ],
});
b.rule({
  id: 'CA.CORP.BOARD_SIZE', layer: 1, area: 'officers', stage: 2, title: 'Number of directors within the articles', sev: 'high', tier: 1, regulator: CC, review: true,
  src: [[L1, 'CA-1.03'], [CORE, 'Board size within the articles']],
  sat: all({ '>=': [v(`${C}.directors_count`), v(`${C}.directors_minimum`)] }, { '<=': [v(`${C}.directors_count`), v(`${C}.directors_maximum`)] }),
  evidence: ["Corporations Canada's federal register"], action: 'file',
  text: [
    "{company}'s number of directors doesn't match its articles",
    "Corporations Canada's record shows a number of directors outside the minimum or maximum set in {company}'s articles.",
    'The articles set how many directors the corporation has. The board has to stay within that range.',
    'Investors check the board matches the articles before they sign.',
    'Appoint or remove directors so the board is within the range, and notify Corporations Canada.',
  ],
});
b.rule({
  id: 'CA.CORP.RESIDENT_DIRECTORS', layer: 1, area: 'officers', stage: 2, title: 'Resident Canadian directors', sev: 'high', tier: 5, regulator: CC,
  src: [[L1, 'CA-1.04'], [CORE, 'resident Canadian directors']],
  law: [['Canada Business Corporations Act', 's 105(3)']],
  sat: told('ca_resident_directors'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has enough resident Canadian directors",
    "We don't have your confirmation that at least a quarter of the directors are resident Canadians. We don't keep people's details, so we can't check.",
    'At least 25% of the directors of a CBCA corporation must be resident Canadians, or at least one if there are fewer than four. Some sectors need a majority.',
    'A board without enough resident Canadians is not set up the way the Act requires.',
    'Check where your directors live, then confirm here.',
  ],
});
b.rule({
  id: 'CA.CORP.SIGNIFICANT_CONTROL_REGISTER', layer: 1, area: 'officers', stage: 2, title: 'Register of individuals with significant control', sev: 'high', tier: 5, regulator: CC,
  src: [[L1, 'CA-1.08'], [CORE, 'ISC register kept and ISC information filed']],
  sat: told('ca_isc_register'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps its register of individuals with significant control",
    "We don't have your confirmation that the corporation keeps a register of the people with significant control over it. It isn't public, so we can't check.",
    'A CBCA corporation keeps this register, updates it at least once a year, and within 15 days of learning of a change.',
    'Banks and investors ask who really controls a corporation before they work with it.',
    'Bring the register up to date, then confirm here.',
  ],
});
b.rule({
  id: 'CA.CORP.SIGNIFICANT_CONTROL_FILING', layer: 1, area: 'officers', stage: 2, title: 'Individuals with significant control filed with Corporations Canada', sev: 'high', tier: 4, regulator: CC, review: true,
  from: '2024-01-22',
  src: [[L1, 'CA-1.09'], [CORE, 'ISC register kept and ISC information filed']],
  sat: any(held('ca_isc_filing_confirmation'), told('ca_isc_filed')), evidence: ['Corporations Canada filing confirmation', 'Your confirmation'], action: 'file',
  slot: { id: 'ca_isc_filing_confirmation', label: 'Corporations Canada confirmation of significant control filing', reason: 'These filings are not public, so the confirmation is how you show it was made.', tier: 4 },
  text: [
    "We can't see that {company} filed its individuals with significant control",
    "You haven't added the confirmation that the corporation filed its significant control information with Corporations Canada.",
    'Since 22 January 2024 this information is filed at incorporation, with every annual return, and after each change in the register.',
    'Corporations Canada can refuse a certificate of compliance, or dissolve a corporation that does not file.',
    'File it through Corporations Canada Online Filing, and add the confirmation here.',
  ],
});
b.rule({
  id: 'CA.CORP.ANNUAL_RETURN', layer: 1, area: 'filings', stage: 3, title: 'Annual return', sev: 'high', tier: 1, regulator: CC, penalty: 'moderate',
  src: [[L1, 'CA-1.10'], [CORE, 'Annual return filed within 60 days of the anniversary']],
  params: { days_after_anniversary: 60, fee_cad: 12 },
  // Worked out from the anniversary and the latest annual return year, both read from the register.
  sat: no('derived.ca.annual_return_overdue'), defect: yes('derived.ca.annual_return_overdue'),
  evidence: ["Corporations Canada's federal register"], action: 'file',
  text: [
    "{company}'s annual return looks overdue",
    "Corporations Canada's record shows no annual return for {company}'s latest anniversary, and the 60 days to file it have passed.",
    'A CBCA corporation files an annual return within 60 days after each anniversary of its incorporation. It costs C$12 online.',
    'Corporations Canada dissolves corporations that stop filing, after a final notice.',
    'File the annual return through Corporations Canada Online Filing now. It is filed together with your significant control information.',
  ],
});
b.rule({
  id: 'CA.CORP.AUDITOR', layer: 1, area: 'filings', stage: 3, title: 'Auditor, or a resolution not to appoint one', sev: 'medium', tier: 5,
  src: [[L1, 'CA-1.13']],
  law: [['Canada Business Corporations Act', 's 163']],
  sat: any(told('ca_auditor_appointed'), told('ca_audit_exemption'), held('ca_audit_exemption_resolution')), evidence: ['Your confirmation', 'Shareholder resolution'], action: 'attest',
  slot: { id: 'ca_audit_exemption_resolution', label: 'Shareholder resolution not to appoint an auditor', reason: 'It shows every shareholder agreed not to appoint an auditor until the next annual meeting.', tier: 4 },
  text: [
    "You haven't confirmed {company} has an auditor, or agreed not to appoint one",
    "We don't have your confirmation that the corporation appointed an auditor, or that its shareholders resolved not to.",
    'A corporation that does not offer shares to the public can skip the auditor only if every shareholder agrees, including those without a vote. The decision lasts until the next annual meeting.',
    'Investors and banks ask for audited statements, or proof that every shareholder agreed to skip the audit.',
    'Confirm your auditor, or add this year\'s signed shareholder resolution.',
  ],
});

// --- Layer 3: compliance ----------------------------------------------------------------------

b.rule({
  id: 'CA.DP.PRIVACY_LAWS', layer: 3, area: 'privacy', stage: 2, title: 'Which privacy laws apply', sev: 'low', tier: 5, when: PD,
  src: [[L3, 'CA-3.01']],
  law: [['Personal Information Protection and Electronic Documents Act']], regulator: 'Office of the Privacy Commissioner of Canada',
  sat: told('ca_privacy_laws'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed which privacy laws apply to {company}",
    "We don't have your confirmation of which Canadian privacy laws cover the personal information the corporation handles.",
    'The federal privacy law covers personal information in commercial activity. In Alberta, British Columbia and Quebec a provincial law applies instead within the province, and the federal law still covers dealings across borders.',
    'Each law has its own rules, and you need to know which ones you follow.',
    'Work out where you collect personal information and which laws apply, then confirm here.',
  ],
});

// --- Tax --------------------------------------------------------------------------------------

b.rule({
  id: 'CA.TAX.GST_HST', layer: 3, area: 'tax', stage: 3, title: 'GST/HST registration', sev: 'medium', tier: 4, regulator: 'Canada Revenue Agency',
  src: [[L3, 'CA-3.05']], params: { small_supplier_cad: 30_000, days_to_register: 29 },
  sat: any(held('ca_gst_hst_registration'), told('ca_small_supplier')), evidence: ['CRA GST/HST registration', 'Your confirmation'], action: 'register',
  slot: { id: 'ca_gst_hst_registration', label: 'GST/HST registration (CRA)', reason: 'It shows the corporation is registered for GST/HST, with its account number.', tier: 4 },
  text: [
    "We can't see {company}'s GST/HST registration",
    "You haven't added the CRA GST/HST registration, or confirmed the corporation is a small supplier.",
    'A business registers within 29 days once its taxable supplies go over C$30,000 in one calendar quarter, or over the last four quarters together.',
    'Registering late can mean paying tax you never charged your customers.',
    'If you are registered, add the CRA confirmation. If you are a small supplier, confirm that here.',
  ],
});

// --- Layer 4: commercial ----------------------------------------------------------------------

b.rule({
  id: 'CA.COM.ANTI_SPAM', layer: 4, area: 'marketing', stage: 3, title: 'Consent and unsubscribe for marketing messages', sev: 'medium', tier: 5, when: MARKETING,
  src: [[L4, 'CA-4.01']],
  law: [["Canada's Anti-Spam Legislation"]], regulator: 'CRTC',
  sat: told('ca_casl'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s marketing messages meet Canada's anti-spam law",
    "We don't have your confirmation that every marketing email and message has consent, names the sender and has a working unsubscribe.",
    'Each commercial electronic message needs consent, clear sender details and a free, easy unsubscribe that works for at least 60 days and is honoured within 10 business days.',
    'People who did not agree to your messages can complain to the CRTC.',
    'Check how you collect consent and handle unsubscribes, keep records, then confirm here.',
  ],
});

// --- Layer 5: fundraising ---------------------------------------------------------------------

b.rule({
  id: 'CA.FUND.PROSPECTUS_EXEMPTION', layer: 5, area: 'fundraising', stage: 4, title: 'Exemption relied on when issuing shares', sev: 'medium', tier: 5, review: true, when: INVESTED,
  src: [[L5, 'CA-5.02']],
  law: [['National Instrument 45-106']],
  sat: any(held('ca_45106f1'), told('ca_prospectus_exemption')), evidence: ['Report of exempt distribution', 'Your confirmation'], action: 'attest',
  slot: { id: 'ca_45106f1', label: 'Report of exempt distribution (Form 45-106F1)', reason: 'Most exemptions need this report filed after the round, in each province where investors are.', tier: 4 },
  text: [
    "You haven't told us which exemption {company} relied on to issue shares",
    "We don't have your confirmation of the prospectus exemption the corporation relied on, or the report filed for it.",
    'Issuing shares needs a prospectus unless an exemption applies, such as the private issuer or accredited investor exemptions. Some need a report filed after the round.',
    'Investors and their advisers will ask which exemption each round relied on.',
    'Write down the exemption each round used, add any report you filed, then confirm here.',
  ],
});

export const ca = b.build();

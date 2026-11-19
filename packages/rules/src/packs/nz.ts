import type { Logic } from '../logic.js';
import { all, any, eq, held, MAPS, no, not, packBuilder, told, yes } from './helper.js';

/**
 * New Zealand (limited company). Draft, version 0.1.0: every rule waits for a New Zealand
 * lawyer. Encoded from docs/knowledge/vero-scan-new-zealand-rule-pack-map.md; the items left out,
 * and why, are listed at the end of that map ("Not encoded"). A rule citing a [verify] line is
 * needs_review, so it can only ever say "a person needs to check this". The register is the
 * Companies Office, read through the NZBN API: status, entity type, the annual return month and
 * last filing date, and how many directors there are (never who).
 */
const b = packBuilder('NZ', MAPS.newZealand, { name: 'New Zealand', version: '0.1.0' });

const N = 'registry.nz.companies';
const OFFICE = 'New Zealand Companies Office';
const PD = yes('derived.personal_data');
const INVESTED = yes('derived.invested');
const L1 = '3.1 Layer 1';
const L3 = '3.3 Layer 3';
const L5 = '3.5 Layer 5';
const CORE = '5. Core set';

const oneOf = (key: string, values: string[]): Logic => ({ in: [{ var: key }, values] });
/** Documented status codes: 50 Registered, 80 Removed. The liquidation and receivership codes are left to a person. */
const STATUS_CODE = `${N}.status_code`;

// --- Layer 1: company foundations -------------------------------------------------------------

b.rule({
  id: 'NZ.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company registered with the Companies Office', sev: 'critical', tier: 1, regulator: OFFICE,
  src: [[L1, 'NZ-1.01'], [CORE, 'Registered, a limited company, not removed or in liquidation']],
  sat: eq(STATUS_CODE, '50'),
  defect: all(yes(`${N}.identified`), eq(STATUS_CODE, '80')),
  verify: all(yes(`${N}.identified`), not(oneOf(STATUS_CODE, ['50', '80']))),
  evidence: ['Companies Office register'], action: 'review',
  text: [
    "{company} shows as removed from the Companies Register",
    "We read {company}'s entry in the New Zealand Companies Office register, and it shows the company as removed.",
    'Anyone who looks the company up, banks and investors included, sees this status first.',
    'A removed company can lose its assets and can no longer trade in its own name.',
    'Check the entry on the Companies Office website today and get qualified advice on restoring the company.',
  ],
});
b.rule({
  id: 'NZ.CORP.ENTITY_TYPE', layer: 1, area: 'standing', stage: 2, title: 'Limited company', sev: 'low', tier: 1, regulator: OFFICE,
  src: [[L1, 'NZ-1.02']],
  sat: eq(`${N}.entity_type_code`, 'LTD'),
  // Another kind of entity isn't wrong, just outside this pack.
  verify: yes(`${N}.identified`),
  evidence: ['Companies Office register'], action: 'review',
  text: [
    "We couldn't confirm {company} is a limited company",
    "The Companies Office register doesn't show {company} as a New Zealand limited company.",
    'The New Zealand checks here are written for limited companies.',
    'Some of the checks we show may not fit your company.',
    'Check the entity type on the register. A person will look at which checks apply.',
  ],
});
b.rule({
  id: 'NZ.CORP.RESIDENT_DIRECTOR', layer: 1, area: 'officers', stage: 2, title: 'A director living in New Zealand, or in Australia', sev: 'high', tier: 5, regulator: OFFICE,
  src: [[L1, 'NZ-1.05'], [CORE, 'A director living in New Zealand or Australia']],
  sat: told('nz_resident_director'), evidence: ['Your confirmation', 'Companies Office register'], action: 'attest',
  text: [
    "You haven't confirmed {company} has a director living in New Zealand",
    "We don't have your confirmation that at least one director lives in New Zealand, or lives in Australia and is a director of an Australian company. We don't keep people's details, so we can't check.",
    'Every New Zealand company needs such a director. More than 183 days in New Zealand in 12 months is generally treated as living there.',
    'A sole director who meets the rule cannot leave until a new one who meets it is appointed.',
    'Check where your directors live, then confirm here.',
  ],
});
b.rule({
  id: 'NZ.CORP.ANNUAL_RETURN', layer: 1, area: 'filings', stage: 3, title: 'Annual return', sev: 'high', tier: 1, regulator: OFFICE, penalty: 'moderate',
  src: [[L1, 'NZ-1.08'], [CORE, 'Annual return filed in its filing month']],
  // Worked out from the filing month and the date of the last return, both read from the register.
  sat: no('derived.nz.annual_return_overdue'), defect: yes('derived.nz.annual_return_overdue'),
  evidence: ['Companies Office register'], action: 'file',
  text: [
    "{company}'s annual return looks overdue",
    "The Companies Office register shows no annual return filed since {company}'s last filing month.",
    'A New Zealand company files an annual return each year during its filing month, starting the calendar year after it was incorporated.',
    'The Registrar can remove a company that does not file.',
    'File the annual return on the Companies Office website now. If you were given more time, a person will check.',
  ],
});
b.rule({
  id: 'NZ.CORP.SHARE_REGISTER', layer: 1, area: 'shareholders', stage: 2, title: 'Share register kept in New Zealand', sev: 'medium', tier: 5,
  src: [[L1, 'NZ-1.09'], [CORE, 'Share register kept and share issues notified']],
  sat: told('nz_share_register'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps its share register",
    "We don't have your confirmation that the company keeps a share register, with every share issue recorded.",
    'A New Zealand company keeps its share register in New Zealand, at its registered office unless its constitution allows otherwise.',
    'It is the record of who owns the company. Investors check it against every share issue.',
    'Bring the share register up to date, keep it at the registered office, then confirm here.',
  ],
});

// --- Layer 3: compliance ----------------------------------------------------------------------

b.rule({
  id: 'NZ.DP.PRIVACY_OFFICER', layer: 3, area: 'privacy', stage: 2, title: 'Privacy officer', sev: 'medium', tier: 5, review: true, when: PD,
  src: [[L3, 'NZ-3.02'], [CORE, 'Privacy officer and privacy statement']],
  law: [['Privacy Act 2020']], regulator: 'Office of the Privacy Commissioner',
  sat: told('nz_privacy_officer'), evidence: ['Your confirmation', 'Contact details on your website'], action: 'attest',
  text: [
    "You haven't confirmed {company} has a privacy officer",
    "We don't have your confirmation that someone is the company's privacy officer.",
    'New Zealand organisations that handle personal information have a privacy officer who looks after it and answers requests.',
    'People who ask about their information need someone to answer them.',
    'Name a privacy officer, publish how to reach them, then confirm here.',
  ],
});
b.rule({
  id: 'NZ.DP.INDIRECT_COLLECTION', layer: 3, area: 'privacy', stage: 2, title: 'Telling people when you collect their information from someone else', sev: 'medium', tier: 5,
  from: '2026-05-01', when: PD,
  src: [[L3, 'NZ-3.04']],
  law: [['Privacy Act 2020', 'IPP 3A']], regulator: 'Office of the Privacy Commissioner',
  sat: told('nz_ipp3a'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed how {company} tells people about information it gets from others",
    "We don't have your confirmation that people are told when the company collects their personal information from someone else.",
    'From 1 May 2026, when you collect personal information from someone other than the person it is about, you tell that person who you are and how to reach you, among other things, unless an exception applies.',
    'It applies to information collected from 1 May 2026, so new data sources need it now.',
    'Check where you get personal information from other sources, add a notice where it is needed, then confirm here.',
  ],
});
b.rule({
  id: 'NZ.DP.BREACH', layer: 3, area: 'privacy', stage: 2, title: 'Privacy breach plan', sev: 'medium', tier: 5, when: PD,
  src: [[L3, 'NZ-3.05']],
  law: [['Privacy Act 2020']], regulator: 'Office of the Privacy Commissioner',
  sat: held('nz_breach_plan'), evidence: ['Privacy breach plan'],
  slot: { id: 'nz_breach_plan', label: 'Privacy breach plan', reason: 'A serious breach has to be reported to the Privacy Commissioner as soon as practicable, so you need to know who does what.' },
  text: [
    "We don't have {company}'s privacy breach plan",
    "You haven't added a plan for what happens when personal information is lost or exposed.",
    'A breach likely to cause serious harm is reported to the Privacy Commissioner, and the people affected, as soon as practicable. The Commissioner expects it within 72 hours.',
    'Not reporting without a good reason is an offence.',
    'Write a short plan saying who decides, who reports and how fast, and add it here.',
  ],
});

// --- Tax --------------------------------------------------------------------------------------

b.rule({
  id: 'NZ.TAX.GST', layer: 3, area: 'tax', stage: 3, title: 'GST registration', sev: 'medium', tier: 4, regulator: 'Inland Revenue',
  src: [[L3, 'NZ-3.07']], params: { threshold_nzd: 60_000, days_to_register: 21 },
  sat: any(held('nz_gst_registration'), told('nz_gst_below_threshold')), evidence: ['Inland Revenue GST registration', 'Your confirmation'], action: 'register',
  slot: { id: 'nz_gst_registration', label: 'GST registration (Inland Revenue)', reason: 'It shows the company is registered for GST, with its GST number.', tier: 4 },
  text: [
    "We can't see {company}'s GST registration",
    "You haven't added the Inland Revenue GST registration, or confirmed the company is below the threshold.",
    'A business registers for GST within 21 days once its turnover was over NZ$60,000 in the last 12 months, or is expected to go over it in the next 12.',
    'Registering late can mean paying GST you never charged your customers.',
    'If you are registered, add the confirmation. If you are below the threshold, confirm that here.',
  ],
});

// --- Layer 5: fundraising ---------------------------------------------------------------------

b.rule({
  id: 'NZ.EQUITY.SHARE_ISSUE_NOTICE', layer: 5, area: 'shareholders', stage: 4, title: 'Share issues notified to the Companies Office', sev: 'high', tier: 4, regulator: OFFICE, when: INVESTED,
  src: [[L5, 'NZ-5.01'], [CORE, 'Share register kept and share issues notified']],
  sat: any(held('nz_share_issue_notice'), told('nz_share_issues_notified')), evidence: ['Companies Office confirmation', 'Your confirmation'], action: 'file',
  slot: { id: 'nz_share_issue_notice', label: 'Companies Office confirmation of a share issue', reason: 'It shows each share issue was notified to the Companies Office.', tier: 4 },
  text: [
    "We can't see that {company}'s share issues were notified",
    "You haven't added the Companies Office confirmation for your share issue, or confirmed it was notified.",
    'Each share issue is notified to the Companies Office within 10 working days, new shareholders are registered at the same time, and the share register is updated.',
    "Investors check the public register matches the shares they paid for.",
    'Notify the issue on the Companies Office website if you haven\'t, and add the confirmation here.',
  ],
});
b.rule({
  id: 'NZ.FUND.OFFER_EXCLUSION', layer: 5, area: 'fundraising', stage: 4, title: 'Exclusion relied on when offering shares', sev: 'medium', tier: 5, review: true, when: INVESTED,
  // The FMA summary behind this line is from 2014, and the map's sources flag it for checking.
  src: [[L5, 'NZ-5.02'], ['7. Sources', '| NZ-S20 |']],
  law: [['Financial Markets Conduct Act 2013', 'Schedule 1']], regulator: 'Financial Markets Authority',
  sat: any(told('nz_small_offers'), held('nz_fma_notice')), evidence: ['Your confirmation', 'Notice to the FMA'], action: 'attest',
  slot: { id: 'nz_fma_notice', label: 'Notice to the FMA of a small offer', reason: 'It shows the FMA was told about an offer made under the small offers exclusion.', tier: 4 },
  text: [
    "You haven't told us which exclusion {company} relied on to offer shares",
    "We don't have your confirmation of the exclusion that let the company offer shares without a disclosure document.",
    'Offering shares needs a disclosure document unless an exclusion applies, such as small personal offers, which also need a warning to investors and a notice to the FMA.',
    'Investors and their advisers will ask which exclusion each round relied on.',
    'Write down which exclusion each round used, then confirm here.',
  ],
});

export const nz = b.build();

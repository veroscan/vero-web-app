import type { Logic } from '../logic.js';
import { all, any, atLeast, eq, held, MAPS, not, packBuilder, told, yes, zero } from './helper.js';

/**
 * Switzerland (AG and GmbH). Draft, version 0.1.0: every rule waits for a Swiss lawyer. Encoded
 * from docs/knowledge/vero-scan-switzerland-rule-pack-map.md; the items left out, and why, are
 * listed at the end of that map ("Not encoded"). A rule citing a [verify] line is needs_review,
 * so it can only ever say "a person needs to check this". The only register is Zefix: it keeps
 * no people and Swiss companies file no annual return, so most checks are a document or your word.
 */
const b = packBuilder('CH', MAPS.switzerland, { name: 'Switzerland', version: '0.1.0' });

const Z = 'registry.ch.zefix';
const ZEFIX = 'Swiss commercial register (Zefix)';
const PD = yes('derived.personal_data');
const INVESTED = yes('derived.invested');
const L1 = '3.1 Layer 1';
const L3 = '3.3 Layer 3';
const L5 = '3.5 Layer 5';
const CORE = '5. Core set';

const oneOf = (key: string, values: string[]): Logic => ({ in: [{ var: key }, values] });
const STATUS = `${Z}.status`;
const KNOWN_STATUS = ['active', 'being_cancelled', 'cancelled'];

// --- Layer 1: company foundations -------------------------------------------------------------

b.rule({
  id: 'CH.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company status in the commercial register', sev: 'critical', tier: 1, regulator: ZEFIX,
  src: [[L1, 'CH-1.01'], [CORE, 'Registered and active; AG or GmbH; seat in Switzerland']],
  sat: eq(STATUS, 'active'),
  // Zefix says so in its own words: the company is being struck off, or has been.
  defect: all(yes(`${Z}.identified`), oneOf(STATUS, ['being_cancelled', 'cancelled'])),
  // Any other status is a word we haven't confirmed: a person reads it.
  verify: all(yes(`${Z}.identified`), not(oneOf(STATUS, KNOWN_STATUS))),
  evidence: ['Zefix record'], action: 'review',
  text: [
    "{company} doesn't show as active in the Swiss commercial register",
    "We read {company}'s entry in Zefix, and it shows the company as being removed from the register, or already removed.",
    'Anyone who looks the company up, banks and investors included, sees this status first.',
    'A company removed from the register can lose the right to act, sign contracts and hold assets in its own name.',
    'Check the entry on zefix.ch today and get qualified advice on what can still be done.',
  ],
});
b.rule({
  id: 'CH.CORP.LEGAL_FORM', layer: 1, area: 'standing', stage: 2, title: 'Legal form: AG or GmbH', sev: 'low', tier: 1, regulator: ZEFIX,
  src: [[L1, 'CH-1.02']],
  // eCH-0097 codes: 0106 is an AG, 0107 a GmbH. Anything else isn't wrong, just outside this pack.
  sat: oneOf(`${Z}.legal_form_code`, ['0106', '0107']), verify: yes(`${Z}.identified`),
  evidence: ['Zefix record'], action: 'review',
  text: [
    "We couldn't confirm {company} is an AG or a GmbH",
    "Zefix doesn't show {company} as a company limited by shares (AG) or a limited liability company (GmbH).",
    'The Swiss checks here are written for those two kinds of company. Other forms have different duties.',
    'Some of the checks we show may not fit your company.',
    'Check the legal form on your Zefix entry. A person will look at which checks apply.',
  ],
});
b.rule({
  id: 'CH.CORP.SEAT', layer: 1, area: 'filings', stage: 2, title: 'Registered seat in Switzerland', sev: 'medium', tier: 1, regulator: ZEFIX,
  src: [[L1, 'CH-1.05']],
  sat: { '!!': [{ var: `${Z}.legal_seat` }] }, evidence: ['Zefix record'], action: 'file',
  text: [
    "We can't see a registered seat for {company}",
    "{company}'s Zefix entry doesn't show a registered seat.",
    'A Swiss company has its legal seat in a Swiss municipality. It decides which register and court it belongs to.',
    'Official letters and legal papers may not reach you.',
    'Check the seat in your entry and ask the commercial register to correct it if it is missing.',
  ],
});
b.rule({
  id: 'CH.CORP.RESIDENT_REPRESENTATIVE', layer: 1, area: 'officers', stage: 2, title: 'A person living in Switzerland who can represent the company', sev: 'high', tier: 5,
  when: yes('derived.ch.is_ag'),
  src: [[L1, 'CH-1.06'], [CORE, 'A person resident in Switzerland who can represent the company']],
  law: [['Code of Obligations', 'Art. 718(4)']],
  sat: told('ch_resident_representative'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed someone living in Switzerland can represent {company}",
    "We don't have your confirmation that a board member or director who lives in Switzerland can represent the company. Zefix doesn't show where people live, so we can't check.",
    "An AG must always have at least one person living in Switzerland who can act for it, with access to the share register and the list of beneficial owners.",
    'If nobody living in Switzerland can act for the company, it is not set up the way Swiss law asks.',
    'Check who signs for the company and where they live, then confirm here.',
  ],
});
b.rule({
  id: 'CH.CORP.TRANSPARENCY_REGISTER', layer: 1, area: 'officers', stage: 2, title: 'Beneficial owners reported to the Transparency Register', sev: 'high', tier: 4, review: true,
  from: '2026-10-01', regulator: 'Swiss Transparency Register',
  src: [[L1, 'CH-1.09'], [CORE, 'Transparency Register report made']],
  law: [['Federal Act on the Transparency of Legal Entities']],
  sat: any(held('ch_transparency_register_confirmation'), told('ch_transparency_register_reported')),
  evidence: ['EasyGov filing confirmation', 'Your confirmation'], action: 'file',
  slot: { id: 'ch_transparency_register_confirmation', label: 'Transparency Register filing confirmation (EasyGov)', reason: 'The register is not public, so the EasyGov confirmation is the only way to show the report was made.', tier: 4 },
  text: [
    "We can't see that {company} has reported its beneficial owners",
    "You haven't added the confirmation that the company reported its beneficial owners to the Swiss Transparency Register.",
    'Since 1 October 2026 every AG and GmbH must report the people who ultimately own or control it, online through EasyGov. Deadlines are staggered by company type.',
    'The register is new, so banks and investors will start asking for proof soon.',
    'Check your deadline on transpareg.admin.ch, make the report through EasyGov, and add the confirmation here.',
  ],
});
b.rule({
  id: 'CH.CORP.BENEFICIAL_OWNER_LIST', layer: 1, area: 'shareholders', stage: 2, title: "The company's own list of beneficial owners", sev: 'medium', tier: 5, review: true,
  src: [[L1, 'CH-1.10'], [CORE, 'Share register and beneficial-owner list kept']],
  sat: told('ch_beneficial_owner_list'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps a list of its beneficial owners",
    "We don't have your confirmation that the company keeps a list of the people its shareholders have reported as beneficial owners.",
    'Shareholders with a large stake tell the company who really owns their shares, and the company keeps that list.',
    "It's asked for when a bank opens an account or an investor checks ownership.",
    'Keep the list with your share register, then confirm here.',
  ],
});
b.rule({
  id: 'CH.CORP.AUDIT', layer: 1, area: 'filings', stage: 2, title: 'Audit firm, or a valid opting-out', sev: 'medium', tier: 1, regulator: ZEFIX,
  src: [[L1, 'CH-1.12'], [L1, 'CH-1.13'], [CORE, 'Audit firm on the register, or a valid opting-out']],
  law: [['Code of Obligations', 'Art. 727a']],
  sat: any(atLeast(`${Z}.auditors_count`, 1), held('ch_opting_out')),
  // No audit firm on the register is allowed, but only with a valid opting-out, which Zefix can't show.
  verify: zero(`${Z}.auditors_count`),
  evidence: ['Zefix record', 'Opting-out consent and declaration'], action: 'upload',
  slot: { id: 'ch_opting_out', label: 'Opting-out of the limited audit (shareholder consent and declaration)', reason: 'With no audit firm on the register, this shows every shareholder agreed to opt out.', tier: 4 },
  text: [
    "We can't see an audit firm or an opting-out for {company}",
    "Zefix shows no audit firm for {company}, and you haven't added the shareholders' consent to opt out of the audit.",
    'A Swiss company has its accounts audited, unless every shareholder agrees to opt out and it has no more than 10 full-time posts on average.',
    'Investors and banks ask for audited accounts, or for proof of the opting-out.',
    'If you opted out, add the shareholders\' consent and the declaration here. If not, appoint an audit firm.',
  ],
});
b.rule({
  id: 'CH.CORP.CHANGES_REGISTERED', layer: 1, area: 'filings', stage: 2, title: 'Changes entered in the commercial register', sev: 'low', tier: 5, regulator: ZEFIX,
  src: [[L1, 'CH-1.14']],
  sat: told('ch_changes_registered'), evidence: ['Your confirmation', 'Zefix record'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s changes are on the register",
    "We don't have your confirmation that every change to the board, signatories, seat, articles or capital has been entered in the commercial register.",
    'Banks, customers and investors rely on the register to show who runs the company.',
    'A person who left can still appear to sign for the company, and a bank may refuse a new signatory.',
    'Compare your Zefix entry with how the company is run today, register anything missing, then confirm here.',
  ],
});

// --- Layer 3: compliance ----------------------------------------------------------------------

b.rule({
  id: 'CH.DP.ROPA', layer: 3, area: 'privacy', stage: 2, title: 'Record of processing activities', sev: 'medium', tier: 5, review: true, when: PD,
  src: [[L3, 'CH-3.03']],
  law: [['Federal Act on Data Protection']], regulator: 'FDPIC',
  sat: any(held('ch_ropa'), told('ch_ropa_exemption')), evidence: ['Record of processing activities', 'Your confirmation'],
  slot: { id: 'ch_ropa', label: 'Record of processing activities', reason: 'It lists what personal data you handle, why, and where it goes.' },
  text: [
    "We don't have {company}'s record of processing activities",
    "You haven't added a record of processing activities, or confirmed the company doesn't need one.",
    'Swiss data protection law expects a written record of how you handle personal data. Small companies with low-risk processing may not need one.',
    'If the regulator asks, you would have nothing to show.',
    'Write a short record of what data you handle and why, and add it here. If you think you are exempt, confirm that instead.',
  ],
});
b.rule({
  id: 'CH.DP.BREACH', layer: 3, area: 'privacy', stage: 2, title: 'Data breach plan', sev: 'medium', tier: 5, when: PD,
  src: [[L3, 'CH-3.04']],
  law: [['Federal Act on Data Protection', 'Art. 24']], regulator: 'FDPIC',
  sat: held('ch_breach_plan'), evidence: ['Data breach plan'],
  slot: { id: 'ch_breach_plan', label: 'Data breach plan', reason: 'A serious breach has to be reported to the FDPIC as soon as possible, so you need to know who does what.' },
  text: [
    "We don't have {company}'s data breach plan",
    "You haven't added a plan for what happens when personal data is lost or exposed.",
    'A breach likely to cause a high risk to people must be reported to the FDPIC as soon as possible, through its online portal, and people told where needed.',
    "Working it out during a breach costs time you won't have.",
    'Write a short plan saying who decides, who reports to the FDPIC and how fast, and add it here.',
  ],
});

// --- Tax --------------------------------------------------------------------------------------

b.rule({
  id: 'CH.TAX.VAT', layer: 3, area: 'tax', stage: 3, title: 'VAT registration', sev: 'medium', tier: 4,
  src: [[L3, 'CH-3.08']],
  regulator: 'Federal Tax Administration (ESTV)', params: { threshold_chf: 100_000 },
  sat: any(held('ch_vat_registration'), told('ch_vat_below_threshold')), evidence: ['ESTV registration confirmation', 'Your confirmation'], action: 'register',
  slot: { id: 'ch_vat_registration', label: 'VAT registration confirmation (ESTV)', reason: 'It shows the company is registered for Swiss VAT, with its CHE number ending in MWST.', tier: 4 },
  text: [
    "We can't see {company}'s Swiss VAT registration",
    "You haven't added the ESTV confirmation of VAT registration, or confirmed the company is below the threshold.",
    'A company registers for VAT once its worldwide turnover reaches CHF 100,000 a year. A new business is exempt while it expects to stay below that for the next 12 months.',
    'Registering late can mean paying VAT you never charged your customers.',
    'If you are registered, add the ESTV confirmation. If you are below the threshold, confirm that here.',
  ],
});

// --- Layer 5: fundraising ---------------------------------------------------------------------

b.rule({
  id: 'CH.FUND.PROSPECTUS_EXEMPTION', layer: 5, area: 'fundraising', stage: 4, title: 'Exemption relied on when offering shares', sev: 'medium', tier: 5, review: true, when: INVESTED,
  src: [[L5, 'CH-5.02']],
  law: [['Financial Services Act', 'Art. 36']],
  sat: told('ch_prospectus_exemption'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't told us which exemption {company} relies on to offer shares",
    "We don't have your confirmation of the exemption that lets the company offer shares without a prospectus.",
    'Offering shares to the public needs a prospectus unless an exemption applies, for example a small number of investors or professional investors only.',
    'Investors and their advisers will ask which exemption the round relied on.',
    'Write down which exemption each round relied on, then confirm here.',
  ],
});
b.rule({
  id: 'CH.EQUITY.REGISTERS_AFTER_ROUND', layer: 5, area: 'shareholders', stage: 4, title: 'Registers updated after a round', sev: 'medium', tier: 5, when: INVESTED,
  src: [[L5, 'CH-5.03']],
  sat: told('ch_registers_updated_after_round'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s registers were updated after the round",
    "We don't have your confirmation that the share register, the list of beneficial owners and the Transparency Register were updated after new shares were issued.",
    'A round changes who owns the company, and each of these records has to show it.',
    'The next investor or bank will check them against your round documents.',
    'Update each one after every round, then confirm here.',
  ],
});

export const ch = b.build();

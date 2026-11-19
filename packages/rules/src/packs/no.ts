import type { Logic } from '../logic.js';
import { addEuCommon, euIntlEquivalents } from './eu-common.js';
import { all, any, atLeast, auto, eq, held, MAPS, no, not, packBuilder, remind, told, yes } from './helper.js';

/**
 * Norway (aksjeselskap, AS). Draft, version 0.1.0: every rule waits for a lawyer. Encoded from
 * docs/knowledge/vero-scan-norway-rule-pack-map.md, plus the EU common rules that reach Norway
 * through the EEA Agreement and Norwegian law (eu-common.ts, `eu: false`): GDPR, cookies,
 * e-commerce, consumer and company-law duties. The AI Act was not Norwegian law on 16 Nov 2026
 * (map Section 11), so no AI Act rule is here; neither are VIES (Norway isn't in it), the EU trade
 * mark, the AMLR, accessibility or prospectus rules. Items left out are listed at the end of the
 * Norway map ("Not encoded").
 *
 * Brønnøysundregistrene was checked against a real reply (docs/NATIONAL-REGISTERS.md). A miss
 * there leaves `identified` unknown, so every rule reading it is "to check", never a gap.
 */
const b = packBuilder('NO', MAPS.norway, { name: 'Norway', version: '0.1.0' });

const R = 'registry.no.brreg';
const BRREG = 'Brønnøysundregistrene';
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
const hasRole = (title: string): Logic => ({ in: [title, { var: `${R}.role_titles` }] });
const STAFF = yes('derived.employees');
const INVESTED = yes('derived.invested');
const FOUND = yes(`${R}.identified`);
const ENDED = ['deleted', 'bankrupt', 'under_liquidation', 'under_compulsory_dissolution'];
const RECORDS: [string, string][] = [[S6, 'Records, DPIA, processor agreements, breach notification']];

addEuCommon(b, {
  cc: 'NO', eu: false, authority: 'Datatilsynet', english: false, consentAge: 13,
  extraSrc: {
    PRIVACY_NOTICE: [[S6, '| Privacy notice published |']],
    CHILD_CONSENT: [[S6, "Children's consent: age 13 for online services"]],
    ROPA: RECORDS,
    PROCESSING_AGREEMENTS: RECORDS,
    DPIA: RECORDS,
    BREACH: RECORDS,
    COOKIE_CONSENT: [[S6, 'Cookie consent to the GDPR standard before non-essential storage']],
    COOKIE_POLICY: [[S6, 'Cookie consent to the GDPR standard before non-essential storage']],
    WEBSITE_IDENTITY: [[S9, 'Website shows name, address, email, business register, organisation number and VAT status'], [CORE, 'Website shows ehandelsloven §8 information']],
    CONSUMER_INFO: [[S9, 'Pre-contract information for distance sales']],
    WITHDRAWAL: [[S9, '14-day right of withdrawal explained']],
  },
});

// --- Section 1: register and status -----------------------------------------------------------

b.rule({
  id: 'NO.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company status in Enhetsregisteret', sev: 'critical', tier: 1, regulator: BRREG,
  // The status line itself carries a [verify] on the legal grounds for dissolution, which this rule
  // doesn't decide: it reads the register's own flags, as the core set line states them.
  src: [[CORE, 'Registered in Foretaksregisteret, form AS, active with no bankruptcy, liquidation or dissolution flag']],
  sat: eq(`${R}.status`, 'active'),
  defect: all(FOUND, oneOf(`${R}.status`, ENDED)),
  verify: all(FOUND, not(oneOf(`${R}.status`, ['active', ...ENDED]))),
  evidence: ['Brønnøysundregistrene record'], action: 'review',
  text: [
    "{company} doesn't show as active in the Norwegian register",
    "We read {company}'s record from Brønnøysundregistrene, and it shows the company as bankrupt, in liquidation, under compulsory dissolution, or deleted.",
    'Anyone who looks the company up, banks and investors included, sees this status first.',
    'A company in this state can lose control of its assets and contracts, and may stop existing.',
    'Check the record at brreg.no today and get advice on what can still be done.',
  ],
});
b.rule({
  id: 'NO.CORP.BUSINESS_REGISTER', layer: 1, area: 'standing', stage: 2, title: 'Registered in the Register of Business Enterprises', sev: 'high', tier: 1, regulator: BRREG,
  src: [[S1, 'Registered in Foretaksregisteret within 3 months of signing the founding document']],
  sat: yes(`${R}.in_business_register`), evidence: ['Brønnøysundregistrene record'], action: 'register',
  text: [
    "{company} isn't showing in the Register of Business Enterprises",
    "We read {company}'s record from Brønnøysundregistrene, and it isn't in Foretaksregisteret.",
    'An AS is registered there within 3 months of signing its founding document. If that window is missed, it cannot be registered.',
    'Until it is registered, the company is not properly formed, and banks and investors will stop there.',
    'Check the record at brreg.no and file the registration through Altinn if it is missing.',
  ],
});
b.rule({
  id: 'NO.CORP.LEGAL_FORM', layer: 1, area: 'standing', stage: 2, title: 'Company form: AS', sev: 'low', tier: 1, regulator: BRREG,
  src: [[S1, 'Company form is AS']],
  // Another form isn't wrong, only outside this pack: a person looks at which checks apply.
  sat: eq(`${R}.organisation_form_code`, 'AS'), verify: FOUND,
  evidence: ['Brønnøysundregistrene record'], action: 'review',
  text: [
    "We couldn't confirm {company} is an AS",
    "Brønnøysundregistrene doesn't show {company} as an aksjeselskap (AS).",
    'The Norwegian checks here are written for an AS. Other forms have different duties.',
    'Some of the checks we show may not fit your company.',
    'Check the company form on your record. A person will look at which checks apply.',
  ],
});

// --- Section 2: articles, capital, share register and beneficial owners -------------------------------

b.doc({
  id: 'NO.CORP.ARTICLES', layer: 1, area: 'governance', stage: 2, title: 'Articles of association (vedtekter)', noun: 'articles of association (vedtekter)', sev: 'high', tier: 4, regulator: BRREG,
  src: [[S2, 'Articles (vedtekter) state name, business activity, share capital and nominal value per share'], [CORE, 'Articles and share register in place']],
  slot: { id: 'no_articles', label: 'Articles of association (vedtekter)', reason: 'They state the name, business activity, share capital and the nominal value of each share.', tier: 4 },
  ifLeft: 'Banks and investors ask for them, and a gap in your company records can hold up a round.',
  fix: 'Add the current vedtekter, with every change made since the company was set up.',
});
b.rule({
  id: 'NO.CORP.SHARE_CAPITAL', layer: 1, area: 'standing', stage: 2, title: 'Share capital of at least NOK 30,000', sev: 'high', tier: 1, regulator: BRREG,
  src: [[S2, 'Share capital at least NOK 30,000'], [CORE, 'Share capital at least NOK 30,000']],
  params: { minimum_nok: 30_000 },
  sat: all(atLeast(`${R}.share_capital`, 30_000), eq(`${R}.share_capital_currency`, 'NOK')),
  // Capital in another currency can't be compared here.
  verify: all(FOUND, not(eq(`${R}.share_capital_currency`, 'NOK'))),
  evidence: ['Brønnøysundregistrene record'], action: 'file',
  text: [
    "{company}'s registered share capital is below NOK 30,000",
    "Brønnøysundregistrene shows {company}'s share capital as less than NOK 30,000.",
    'An AS must have a share capital of at least NOK 30,000.',
    'A company below the minimum can be ordered to fix it, and investors will ask why.',
    'Raise the share capital to at least NOK 30,000 and register the change.',
  ],
});
b.rule({
  id: 'NO.CORP.SHARE_REGISTER', layer: 1, area: 'shareholders', stage: 2, title: 'Share register (aksjeeierbok)', sev: 'medium', tier: 5,
  src: [[S2, 'Share register (aksjeeierbok) set up promptly after incorporation'], [CORE, 'Articles and share register in place']],
  sat: any(held('no_share_register'), told('no_share_register')), evidence: ['Share register', 'Your confirmation'], action: 'attest',
  slot: { id: 'no_share_register', label: 'Share register (aksjeeierbok)', reason: 'The board keeps a reliable record of every shareholder and their shares. It is not public, so we need yours.' },
  text: [
    "We can't see {company}'s share register",
    "You haven't added the share register (aksjeeierbok), or confirmed that the board keeps one.",
    "The board sets it up right after incorporation and keeps it reliable: each shareholder, their shares and share numbers.",
    'It is the proof of who owns the company, and investors check it against every share issue.',
    'Bring the register up to date, and add it here or confirm the board keeps it.',
  ],
});
b.doc({
  id: 'NO.CORP.UBO', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owners registered', noun: 'beneficial-owner registration receipt', sev: 'high', tier: 4, regulator: BRREG,
  src: [[S2, 'Beneficial owners registered with Brønnøysund within 14 days'], [CORE, 'Beneficial owners registered within 14 days, even if none']],
  params: { days_after_registration: 14 },
  slot: { id: 'no_ubo_receipt', label: 'Receipt from the register of beneficial owners', reason: 'Every AS registers its beneficial owners, even if it has none. The register is not public, so we need your receipt.', tier: 4 },
  why: 'Every AS registers its beneficial owners within 14 days of being registered, even if it has none. The register is not public.',
  ifLeft: 'Banks ask for it when they onboard you, and daily fines are possible for a missing registration.',
  fix: 'Register your beneficial owners through Altinn, or that there are none, and add the receipt here.',
});
b.rule({
  id: 'NO.CORP.UBO_CHANGES', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial-owner changes registered', sev: 'medium', tier: 5, regulator: BRREG,
  src: [[S2, 'Beneficial-owner changes registered within 14 days']],
  params: { days_after_change: 14 },
  sat: told('no_ubo_changes'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s beneficial-owner details are current",
    "We don't have your confirmation that every change in who owns or controls the company was registered.",
    'A change is registered without delay, and within 14 days at the latest.',
    'Daily fines are possible, and banks rely on these details.',
    'Check the registered details after each change in ownership, update them, then confirm here.',
  ],
});

// --- Section 3: accounts and general meeting -----------------------------------------------------

b.rule({
  id: 'NO.CORP.ACCOUNTS_ADOPTED', layer: 1, area: 'filings', stage: 3, title: 'Annual accounts adopted within 6 months', sev: 'medium', tier: 5,
  src: [[S3, 'Annual accounts adopted within 6 months of year end']],
  rec: { type: 'after_year_end', months: 6, monitoring: remind },
  sat: told('no_accounts_adopted'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} adopted last year's accounts",
    "We don't have your confirmation that the accounts were adopted within 6 months of the year end.",
    'Annual accounts are adopted within 6 months of the year end: by 30 June for a calendar year.',
    'The filing deadline runs from adoption, and late accounts are fined.',
    'Adopt the accounts at the general meeting, then confirm here.',
  ],
});
b.doc({
  id: 'NO.CORP.GENERAL_MEETING', layer: 1, area: 'governance', stage: 3, title: 'Minutes of the ordinary general meeting', noun: 'general meeting minutes', sev: 'medium', tier: 4,
  src: [[S3, 'Ordinary general meeting within 6 months of year end']],
  slot: { id: 'no_general_meeting', label: 'Minutes of the ordinary general meeting (generalforsamlingsprotokoll)', reason: 'The meeting is held within 6 months of the year end and approves the accounts and any dividend.', tier: 4 },
  ifLeft: 'A dividend paid without an approved meeting can be challenged, and investors ask for the minutes.',
  fix: 'Hold the meeting, sign the minutes, and add them here.',
});
b.rule({
  id: 'NO.CORP.ACCOUNTS_FILED', layer: 1, area: 'filings', stage: 3, title: 'Annual accounts sent to Regnskapsregisteret', sev: 'high', tier: 1, regulator: BRREG,
  src: [[S3, 'Annual accounts sent to Regnskapsregisteret within 1 month of adoption']],
  rec: { type: 'annual_fixed', month: 7, day: 31, monitoring: auto(BRREG) },
  // The register gives only the year of the last accounts, a hint: older than expected is "to check".
  sat: yes('derived.no.accounts_filed_recently'), verify: no('derived.no.accounts_filed_recently'),
  evidence: ['Brønnøysundregistrene record'], action: 'file',
  text: [
    "{company}'s latest annual accounts may not have reached Regnskapsregisteret",
    "The last accounts Brønnøysundregistrene shows for {company} are older than we would expect for a company with a calendar year.",
    'Accounts go to Regnskapsregisteret within a month of adoption: by 31 July for a calendar year.',
    'Late accounts are fined, and filed accounts are public, so investors notice a gap.',
    'Check the filing at brreg.no and send the accounts through Altinn if they are missing.',
  ],
});

// --- Section 4: board, manager and auditor --------------------------------------------------------

b.rule({
  id: 'NO.CORP.BOARD', layer: 1, area: 'officers', stage: 2, title: 'Board on record', sev: 'high', tier: 1, regulator: BRREG,
  // The board-size rule (aksjeloven §6-1) is unread, so only "a board is on record" is decided.
  src: [[CORE, 'Board and, where required, a daily manager on record']],
  sat: any(hasRole('Styrets leder'), hasRole('Styremedlem')),
  evidence: ['Brønnøysundregistrene roles'], action: 'file',
  text: [
    "We can't see a board for {company} in the Norwegian register",
    "We read {company}'s roles from Brønnøysundregistrene and found no board chair or board member.",
    'An AS has a board, and its members are registered.',
    'Nobody shows as able to act for the company, which holds up banks and investors.',
    'Register the board through Altinn.',
  ],
});
b.rule({
  id: 'NO.CORP.RESIDENCY', layer: 1, area: 'officers', stage: 2, title: 'Daily manager and half the board resident in the EEA, UK or Switzerland', sev: 'medium', tier: 5,
  src: [[S4, 'Daily manager and at least half the board resident in the EEA, UK or Switzerland']],
  sat: any(told('no_residency_rule_met'), held('no_residency_exemption')), evidence: ['Your confirmation', 'Exemption decision'], action: 'attest',
  slot: { id: 'no_residency_exemption', label: 'Ministry exemption from the residency rule', reason: 'If your daily manager or board doesn\'t meet the residency rule, an exemption from the ministry is the proof you may rely on it.', tier: 4 },
  text: [
    "You haven't confirmed {company} meets the residency rule for its management",
    "We don't have your confirmation that the daily manager and at least half the board live in the EEA, the UK or Switzerland. We don't keep people's addresses, so we can't check.",
    'Norwegian law sets this rule for every AS, unless the ministry grants an exemption.',
    'Registration of new board members can be refused, and the company can be ordered to fix it.',
    'Check where your daily manager and board members live, then confirm here, or add your exemption.',
  ],
});
b.rule({
  id: 'NO.CORP.BOARD_OF_AGE', layer: 1, area: 'officers', stage: 2, title: 'Board members are adults', sev: 'low', tier: 5,
  src: [[S4, 'Board members are of age']],
  sat: told('no_board_of_age'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s board members are adults",
    "We don't have your confirmation that every board member is of age. We don't keep birth dates, so we can't check.",
    'Board members of an AS must be of age.',
    'An invalid appointment can call board decisions into question.',
    'Check each board member is of age, then confirm here.',
  ],
});
b.rule({
  id: 'NO.CORP.AUDITOR', layer: 1, area: 'officers', stage: 2, title: 'Auditor appointed, or audit validly opted out', sev: 'medium', tier: 1, regulator: BRREG,
  src: [[S4, 'Auditor appointed, unless audit validly opted out'], [CORE, 'Auditor on record, or a valid opt-out']],
  // Many small companies opt out; the thresholds for that are unconfirmed, so no auditor on record is "to check".
  sat: any(hasRole('Revisor'), held('no_audit_opt_out')), verify: all(FOUND, not(hasRole('Revisor'))),
  evidence: ['Brønnøysundregistrene roles', 'General meeting decision to opt out'], action: 'review',
  slot: { id: 'no_audit_opt_out', label: 'General meeting decision to opt out of audit', reason: 'A small AS can choose not to have an auditor, by a general meeting decision. Without an auditor on record, this decision is the proof.', tier: 4 },
  text: [
    "We can't see an auditor for {company}, or a decision to opt out",
    "Brønnøysundregistrene shows no auditor for {company}, and you haven't added a decision to opt out of audit.",
    'An AS has an auditor unless the general meeting validly decided to opt out, which only small companies can do.',
    'Accounts that should have been audited are a problem for banks, investors and the tax office.',
    'Add the opt-out decision here, or appoint an auditor and register it.',
  ],
});

// --- Section 5: intellectual property --------------------------------------------------------------

b.rule({
  id: 'NO.IP.EMPLOYEE_WORKS', layer: 2, area: 'ip_ownership', stage: 2, title: 'Employee inventions and software', sev: 'medium', tier: 5, when: STAFF,
  src: [[S5, "Employee inventions: employer's right to claim"], [S5, 'Software written by employees belongs to the employer']],
  sat: any(held('no_employee_ip_clause'), told('no_employee_ip_clause')), evidence: ['Employment contract IP clause', 'Your confirmation'], action: 'attest',
  slot: { id: 'no_employee_ip_clause', label: 'Employment contract IP clause', reason: 'Employee software goes to the company by law, but inventions have to be claimed in writing in time, and other work needs a clause.' },
  text: [
    "We can't see how {company}'s employment contracts handle IP",
    "You haven't added an employment contract IP clause, or confirmed that your contracts deal with inventions and other work.",
    'Software employees write at work belongs to the company. Inventions must be claimed in writing within 4 months of notice, and earn fair pay.',
    'A missed claim leaves the invention with the employee, and investors check this.',
    'Add an IP clause covering inventions and all other work to your contracts. Add it here or confirm.',
  ],
});
b.rule({
  id: 'NO.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'Norwegian trade mark', sev: 'medium', tier: 4, regulator: 'Patentstyret',
  src: [[S5, 'Trademark registered with Patentstyret']],
  rec: { type: 'every_years', from_fact: 'vault.no_trademark.dated', years: 10, monitoring: remind },
  sat: held('no_trademark'), evidence: ['Trade mark certificate'], action: 'file',
  slot: { id: 'no_trademark', label: 'Patentstyret trade mark certificate', reason: 'A Norwegian mark covers Norway only and lasts 10 years. We read your certificate for its dates.', tier: 4 },
  text: [
    "We can't see a Norwegian trade mark for {company}",
    "You haven't added a trade mark certificate from Patentstyret.",
    "Without one, someone else could register a name close to yours in Norway, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.',
    'File your brand with Patentstyret, or add your certificate here.',
  ],
});

// --- Section 7: tax and employer duties -----------------------------------------------------------

b.rule({
  id: 'NO.TAX.VAT_REGISTRATION', layer: 3, area: 'tax', stage: 3, title: 'VAT registration', sev: 'medium', tier: 1, regulator: 'Skatteetaten',
  src: [[S7, 'VAT registration once taxable turnover passes NOK 50,000 in 12 months']],
  params: { threshold_nok_12_months: 50_000 },
  // Turnover isn't public: not on the VAT register is "to check", unless you tell us you are below it.
  sat: any(yes(`${R}.in_vat_register`), told('no_vat_below_threshold')), verify: no(`${R}.in_vat_register`),
  evidence: ['Brønnøysundregistrene record', 'Your confirmation'], action: 'register',
  text: [
    "{company} isn't on the Norwegian VAT register",
    "Brønnøysundregistrene doesn't show {company} in the VAT register, and you haven't confirmed your sales are below the limit.",
    'A company registers for VAT once its taxable sales pass NOK 50,000 in 12 months.',
    'VAT not charged is still owed, with interest and penalties.',
    'Register for VAT through Altinn if you are over the limit, or confirm here that you are below it.',
  ],
});
b.rule({
  id: 'NO.EMP.A_MELDING', layer: 3, area: 'employment', stage: 2, title: 'Monthly a-melding', sev: 'high', tier: 5, regulator: 'Skatteetaten', when: STAFF, review: true,
  src: [[S7, 'Monthly a-melding to Nav, SSB and Skatteetaten']],
  sat: told('no_a_melding'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} files its monthly a-melding",
    "We don't have your confirmation that the a-melding is filed every month.",
    'Employers report pay, tax deductions and employment details each month in the a-melding.',
    'Missing reports bring fines and can affect your staff\'s benefits.',
    'Check with your payroll provider that each month is filed, then confirm here.',
  ],
});
b.doc({
  id: 'NO.EMP.PENSION', layer: 3, area: 'employment', stage: 2, title: 'Mandatory occupational pension (OTP)', noun: 'pension scheme agreement', sev: 'high', tier: 4, when: STAFF,
  src: [[S7, 'Mandatory occupational pension (OTP) scheme']],
  slot: { id: 'no_otp_agreement', label: 'Occupational pension scheme agreement (OTP)', reason: 'Most employers must have a pension scheme for their staff, for example once two people work 75% or more of a full position.', tier: 4 },
  ifLeft: 'Missing pension savings have to be paid back, and the tax office can fine the company.',
  fix: 'Set up an OTP scheme with a pension provider and add the agreement here.',
});

// --- Section 8: sector licences -------------------------------------------------------------------

b.doc({
  id: 'NO.FIN.PAYMENT_LICENCE', layer: 3, area: 'payments', stage: 2, title: 'Payment or e-money licence (Finanstilsynet)', noun: 'payment or e-money licence', sev: 'high', tier: 4, regulator: 'Finanstilsynet', when: yes('derived.moves_money'),
  src: [[S8, 'Payment institution licence (betalingsforetak)'], [S8, 'E-money institution licence (e-pengeforetak)']],
  slot: { id: 'no_payment_licence', label: 'Finanstilsynet payment or e-money licence', reason: 'Holding or moving customers\' money needs a licence from Finanstilsynet, or a licensed partner.', tier: 4 },
  fix: 'Add your Finanstilsynet licence, or the agreement with the licensed partner that covers you.',
});
b.doc({
  id: 'NO.FIN.LENDING_LICENCE', layer: 3, area: 'lending', stage: 2, title: 'Lending licence (Finanstilsynet)', noun: 'lending licence', sev: 'high', tier: 4, regulator: 'Finanstilsynet', when: yes('derived.sector.lending'),
  src: [[S8, 'Lending and lending intermediation']],
  slot: { id: 'no_lending_licence', label: 'Finanstilsynet lending licence', reason: 'Lending, or arranging loans, needs a licence from Finanstilsynet.', tier: 4 },
  fix: 'Add your licence, or the agreement with the licensed partner that covers you.',
});

// --- Section 10: fundraising -----------------------------------------------------------------------

b.doc({
  id: 'NO.FUND.CAPITAL_INCREASE', layer: 5, area: 'fundraising', stage: 4, title: 'General meeting decision on each capital increase', noun: 'capital increase minutes', sev: 'high', tier: 4, when: INVESTED,
  src: [[S10, 'Share capital increase decided by the general meeting']],
  slot: { id: 'no_capital_increase', label: 'General meeting minutes for each capital increase', reason: 'Each capital increase is decided by the general meeting, with the amount, price, who may subscribe and the deadline.', tier: 4 },
  fix: 'Add the signed minutes of the general meeting behind each capital increase.',
});
b.rule({
  id: 'NO.FUND.CAPITAL_INCREASE_REGISTERED', layer: 5, area: 'fundraising', stage: 4, title: 'Capital increase registered in time', sev: 'high', tier: 5, regulator: BRREG, when: INVESTED,
  src: [[S10, 'Capital increase registered within 3 months after the subscription deadline']],
  params: { months_after_subscription_deadline: 3 },
  sat: told('no_capital_increase_registered'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s capital increases were registered in time",
    "We don't have your confirmation that each capital increase was registered within 3 months of the subscription deadline.",
    'If it is registered late, it cannot be registered at all and the subscriptions lapse.',
    'Investors could find their shares were never validly issued.',
    'Check each increase shows in the register, then confirm here.',
  ],
});
b.rule({
  id: 'NO.FUND.SHARE_REGISTER_UPDATED', layer: 5, area: 'fundraising', stage: 4, title: 'Share register updated after each issue', sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'Share register updated after the issue']],
  sat: told('no_share_register_updated'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s share register shows its new shareholders",
    "We don't have your confirmation that the share register was updated after each share issue.",
    'New shares and their holders go into the share register after each issue.',
    'Investors check the register against every share issue, and gaps hold up a round.',
    'Update the register after each issue, then confirm here.',
  ],
});

// --- Section 11: AI ------------------------------------------------------------------------------

b.rule({
  id: 'NO.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI use disclosed on the website', sev: 'low', tier: 1, when: all(yes('derived.uses_ai'), yes('derived.has_website')),
  shared: 'ai_transparency',
  src: [[S11, 'AI use disclosed on the website']],
  // The scan matches "AI", not the Norwegian "KI": a miss is "to check".
  sat: any(yes('web.policy.ai_disclosure_found'), held('no_ai_transparency')), verify: no('web.policy.ai_disclosure_found'),
  evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'no_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI.' },
  text: [
    "We can't see where {company} tells people it uses AI",
    "We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.",
    'Customers increasingly expect to be told when they are dealing with AI, and EU customers will ask under the EU rules.',
    'Enterprise customers and investors are starting to ask, and you would have no answer ready.',
    'Say on your website where your product uses AI, or add your transparency records here.',
  ],
});

export const norway = b.build();

/** International rules the Norwegian pack asks for in its own way. */
export const NO_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  ...euIntlEquivalents('NO', false),
  'INTL.CORP.CONSTITUTION': ['NO.CORP.ARTICLES'],
};

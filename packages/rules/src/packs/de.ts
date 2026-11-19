import { addEuCommon, euIntlEquivalents, euObligation, type EuKey } from './eu-common.js';
import { all, any, atLeast, eq, held, MAPS, no, packBuilder, remind, told, yes } from './helper.js';

/**
 * Germany (GmbH, and the UG (haftungsbeschränkt) where it differs). Draft, version 0.1.0: every
 * rule waits for a lawyer. Encoded from docs/knowledge/vero-scan-germany-rule-pack-map.md, plus
 * the EU common rules (eu-common.ts). Items left out, and why, are listed at the end of the
 * Germany map ("Not encoded"). No rule here rests on a [verify] line.
 *
 * There is no free official German register API (map note 1). The Handelsregister is read through
 * OpenRegister, a paid licensed provider (de.openregister, Tier 2), off until its key is set and
 * never tried against a real reply. So nothing it says is ever called a problem on its own: an
 * active status passes, and anything else it finds is "to check". With the source off, a current
 * Handelsregister extract (a document) answers the same rules.
 */
const b = packBuilder('DE', MAPS.germany, { name: 'Germany', version: '0.1.0' });

const R = 'registry.de.openregister';
const REGISTER = 'Registergericht (Handelsregister)';
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

const PD = yes('derived.personal_data');
const STAFF = yes('derived.employees');
const CONSUMER = yes('derived.consumer');
const SITE = yes('derived.has_website_or_app');
const INVESTED = yes('derived.invested');
const FOUND = yes(`${R}.identified`);

const EXTRACT = {
  id: 'de_register_extract', label: 'Current Handelsregister extract (aktueller Ausdruck)', tier: 4 as const,
  reason: 'It shows the company is registered, its status, its capital and its managing directors. We read it when the register source is off.',
};

// EU common rules Germany writes itself, with the same shared obligation: the DPO test is set by BDSG §38.
const OMIT: EuKey[] = ['DPO'];

addEuCommon(b, {
  cc: 'DE', eu: true, authority: 'the data protection authority of your Land', english: false, consentAge: 16, omit: OMIT,
  extraSrc: {
    PRIVACY_NOTICE: [[S6, 'Privacy notice published, read in German'], [CORE, 'Impressum under DDG §5, privacy notice naming the competent authority']],
    NOTICE_AUTHORITY: [[S6, 'Notice names the competent German supervisory authority']],
    CHILD_CONSENT: [[S6, "Children's consent: age 16 for information society services"]],
    DPIA: [[S6, 'DPIA required for operations on the DSK list']],
    COOKIE_CONSENT: [[S6, 'Cookie consent under TDDDG §25'], [CORE, 'TDDDG §25 cookie consent on the website']],
    COOKIE_POLICY: [[S6, 'Cookie consent under TDDDG §25']],
    WEBSITE_IDENTITY: [[S9, 'Impressum under DDG §5 (name, address, legal form, representative, email, register number, USt-IdNr)'], [CORE, 'Impressum under DDG §5']],
    COMPANY_PARTICULARS: [[S1, 'Company particulars on business letters and order forms']],
    ORDER_BUTTON: [[S9, 'Order button labelled "zahlungspflichtig bestellen"']],
    WITHDRAWAL: [[S9, '14-day withdrawal period; sending in time is enough']],
    DIGITAL_CONTENT: [[S9, 'Withdrawal start, the 12 months and 14 days cap, early expiry for digital content']],
    ACCESSIBILITY: [[S9, 'Accessibility of consumer e-commerce services (BFSG)']],
    VAT_VIES: [[S7, 'VAT ID (USt-IdNr) issued by the BZSt on application'], [CORE, 'a USt-IdNr valid in VIES once VAT-registered']],
    AI_ROLES: [[S11, 'AI Act obligations apply directly in Germany']],
  },
});

// --- Section 1: register and status --------------------------------------------------------------

b.rule({
  id: 'DE.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company status in the Handelsregister', sev: 'high', tier: 2, regulator: REGISTER,
  // The status line in Section 1 carries a [verify] on the grounds for dissolution, which this rule
  // doesn't decide: it reads the provider's status, as the core set line states the duty.
  src: [[CORE, 'Entered in the Handelsregister, active, not in liquidation or insolvency'], [S1, 'Register status read through OpenRegister (licensed vendor)']],
  sat: any(all(eq(`${R}.status`, 'active'), no(`${R}.insolvency_open`)), held(EXTRACT.id)),
  // The provider's words are unconfirmed: any other status, or open proceedings, is for a person to read.
  verify: FOUND,
  evidence: ['Handelsregister record (through OpenRegister)', 'Handelsregister extract'], action: 'review', slot: EXTRACT,
  text: [
    "We can't confirm {company} is active in the German commercial register",
    "We read {company}'s Handelsregister record through OpenRegister, and it doesn't show the company as active with no insolvency proceedings, or you haven't added a current extract.",
    'Anyone who looks the company up, banks and investors included, sees this status first.',
    'A company in liquidation or insolvency can lose control of its assets and contracts.',
    'Check the record at handelsregister.de and add a current extract here. If the status is wrong, contact the register court.',
  ],
});
b.rule({
  id: 'DE.CORP.NAME_SUFFIX', layer: 1, area: 'standing', stage: 2, title: 'Legal form in the company name', sev: 'low', tier: 5,
  src: [[S1, 'Legal-form suffix "Gesellschaft mit beschränkter Haftung" or a recognisable abbreviation in the name'], [S1, 'UG name "Unternehmergesellschaft (haftungsbeschränkt)" or "UG (haftungsbeschränkt)"']],
  sat: told('de_name_suffix'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s name shows its legal form",
    "We don't have your confirmation that the company's name carries \"GmbH\", or \"UG (haftungsbeschränkt)\" for a UG, wherever it is used.",
    'A GmbH carries the words or a clear short form of them. A UG with less than EUR 25,000 of capital must call itself "UG (haftungsbeschränkt)".',
    'Using the name without the legal form can make the people acting for the company personally liable.',
    'Check the name on your website, contracts and invoices, then confirm here.',
  ],
});

// --- Section 2: articles, capital, shareholder list and beneficial owners -------------------------

b.doc({
  id: 'DE.CORP.ARTICLES', layer: 1, area: 'governance', stage: 2, title: 'Notarised articles of association (Gesellschaftsvertrag)', noun: 'notarised articles of association', sev: 'high', tier: 4,
  src: [[S2, 'Articles of association (Gesellschaftsvertrag) in notarial form, signed by all shareholders'], [S2, 'Amendments to the articles by three-quarters of votes cast, notarised'], [CORE, 'Notarised articles']],
  slot: { id: 'de_articles', label: 'Articles of association (Gesellschaftsvertrag) or model protocol, current version', reason: 'The articles are signed by every shareholder before a notary, and each change needs a notarised resolution.', tier: 4 },
  ifLeft: 'Banks and investors ask for them, and a gap in your company records can hold up a round.',
  fix: 'Add the current notarised articles, or the model protocol, with every change made since.',
});
b.rule({
  id: 'DE.CORP.SHARE_CAPITAL', layer: 1, area: 'standing', stage: 2, title: 'Share capital of at least EUR 25,000, or a UG', sev: 'high', tier: 2, regulator: REGISTER,
  src: [[S2, 'Stammkapital of at least EUR 25,000'], [S2, 'Paid in before filing: a quarter of each share, and EUR 12,500 in total'], [CORE, 'GmbH capital at least EUR 25,000 with the minimum paid in']],
  params: { minimum_eur: 25_000, paid_in_minimum_eur: 12_500, paid_in_share: 0.25 },
  sat: any(
    all(eq(`${R}.legal_form`, 'gmbh'), atLeast(`${R}.capital_amount`, 25_000), eq(`${R}.capital_currency`, 'EUR')),
    eq(`${R}.legal_form`, 'ug'),
    told('de_share_capital'),
  ),
  // A figure the provider gives can't be relied on yet, and other forms are outside this rule.
  verify: FOUND,
  evidence: ['Handelsregister record (through OpenRegister)', 'Your confirmation'], action: 'attest',
  text: [
    "We can't confirm {company}'s share capital meets the GmbH minimum",
    "The register record we read doesn't show a GmbH with at least EUR 25,000 of capital, or a UG, and you haven't confirmed the capital and how much was paid in.",
    'A GmbH has at least EUR 25,000 of share capital. Before registration a quarter of each share, and at least EUR 12,500 in total, is paid in. A UG may have less, but pays it in full.',
    'Capital below the minimum, or not paid in, can make shareholders liable for the difference, and investors check it.',
    'Check the capital on your register extract and your payment records, then confirm here.',
  ],
});
b.doc({
  id: 'DE.CORP.SHAREHOLDER_LIST', layer: 1, area: 'shareholders', stage: 2, title: 'Shareholder list (Gesellschafterliste) on the register', noun: 'current shareholder list', sev: 'high', tier: 4, regulator: REGISTER,
  src: [[S2, 'Shareholder list (Gesellschafterliste) filed after every change'], [CORE, 'Current shareholder list on the register']],
  slot: { id: 'de_shareholder_list', label: 'Latest shareholder list (Gesellschafterliste) from the Handelsregister', reason: 'The managing directors, or the notary, file a new list after every change in shareholders or stakes. Only shareholders on the list count against the company.', tier: 4 },
  ifLeft: 'Investors rely on the list to see who owns the company, and directors are liable for an out-of-date one.',
  fix: 'Download the latest list from the Handelsregister, check it against your cap table, and add it here.',
});
b.doc({
  id: 'DE.CORP.UBO', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owners reported to the Transparenzregister', noun: 'Transparenzregister confirmation', sev: 'high', tier: 4, regulator: 'Bundesverwaltungsamt',
  src: [[S2, 'Beneficial owners reported to the Transparenzregister without undue delay'], [CORE, 'Beneficial owners reported to the Transparenzregister']],
  slot: { id: 'de_transparency_register', label: 'Confirmation of your Transparenzregister entry', reason: 'Every GmbH and UG reports its beneficial owners itself, since the register stopped taking them from other registers in 2021. It is not public, so we need your confirmation.', tier: 4 },
  why: 'Every GmbH and UG reports its beneficial owners to the Transparenzregister without undue delay, and keeps the entry current. It is not open to the public.',
  ifLeft: 'Banks ask for it when they onboard you, and a missing entry can be fined.',
  fix: 'Report your beneficial owners at transparenzregister.de, and add the confirmation here.',
});

// --- Section 3: accounts ---------------------------------------------------------------------------

b.rule({
  id: 'DE.CORP.BOOKS', layer: 1, area: 'filings', stage: 2, title: 'Proper books kept', sev: 'medium', tier: 5,
  src: [[S3, 'Managing directors keep proper books']],
  sat: told('de_books'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps proper books",
    "We don't have your confirmation that the managing directors keep the company's books.",
    "The managing directors are responsible for keeping the company's accounting records properly.",
    'Without them the accounts, the tax returns and any due diligence fall apart.',
    'Check your bookkeeping is up to date, then confirm here.',
  ],
});
b.doc({
  id: 'DE.CORP.ACCOUNTS_ADOPTED', layer: 1, area: 'filings', stage: 3, title: 'Annual accounts adopted by the shareholders', noun: 'shareholder resolution adopting the accounts', sev: 'medium', tier: 4,
  src: [[S3, 'Shareholders adopt the accounts within 8 months (small company: 11 months)'], [S3, 'Accounts and management report prepared within 3 months (small company: 6 months)'], [CORE, 'Accounts adopted and submitted to the Unternehmensregister each year']],
  params: { months_after_year_end: 8, months_after_year_end_small: 11 },
  slot: { id: 'de_accounts_resolution', label: "Shareholders' resolution adopting the annual accounts", reason: 'The shareholders adopt the accounts and decide on the profit within 8 months of the year end, or 11 for a small company.', tier: 4 },
  ifLeft: 'A profit paid out without adopted accounts can be challenged, and banks and investors ask for the resolution.',
  fix: 'Hold the shareholder vote on the accounts in time, and add the signed resolution here.',
});
b.doc({
  id: 'DE.CORP.ACCOUNTS_FILED', layer: 1, area: 'filings', stage: 3, title: 'Accounts sent to the Unternehmensregister', noun: 'Unternehmensregister submission confirmation', sev: 'high', tier: 4, regulator: 'Unternehmensregister',
  src: [[S3, 'Accounts submitted to the Unternehmensregister within 12 months of year end'], [CORE, 'Accounts adopted and submitted to the Unternehmensregister each year']],
  rec: { type: 'after_year_end', months: 12, monitoring: remind },
  params: { months_after_year_end: 12 },
  slot: { id: 'de_accounts_submission', label: 'Unternehmensregister submission confirmation for the latest accounts', reason: 'Accounts are submitted electronically, in German, at the latest one year after the balance sheet date. Small and micro companies file less. Filed accounts are not read yet, so we need yours.', tier: 4 },
  ifLeft: 'Late accounts bring fines, and filed accounts are public, so investors and customers notice a gap.',
  fix: 'Submit the accounts to the Unternehmensregister and add the confirmation here.',
});
b.rule({
  id: 'DE.CORP.AUDIT', layer: 1, area: 'filings', stage: 3, title: 'Audit, unless the company is small', sev: 'medium', tier: 4,
  src: [[S3, 'Statutory audit for companies that are not small'], [S3, 'Size classes: small up to EUR 7.5m balance sheet, EUR 15m turnover, 50 employees']],
  params: { small_balance_sheet_eur: 7_500_000, small_turnover_eur: 15_000_000, small_employees: 50 },
  sat: any(held('de_audit_report'), told('de_small_company')), evidence: ["Auditor's report", 'Your confirmation'], action: 'upload',
  slot: { id: 'de_audit_report', label: "Auditor's report on the annual accounts", reason: 'A company that is not small has its accounts audited, and they cannot be adopted without it.', tier: 4 },
  text: [
    "We don't have {company}'s audit report, or your confirmation that the company is small",
    "You haven't added an auditor's report, or confirmed the company is small enough not to need one.",
    'A company is small if it stays under two of these: EUR 7.5m balance sheet, EUR 15m turnover, 50 employees. Larger companies are audited.',
    'Accounts that needed an audit cannot be adopted without one, and banks and investors ask for it.',
    "Add the auditor's report, or confirm here that the company is small.",
  ],
});

// --- Section 4: managing directors -------------------------------------------------------------------

b.rule({
  id: 'DE.CORP.MANAGING_DIRECTOR', layer: 1, area: 'officers', stage: 2, title: 'Managing director on the register', sev: 'high', tier: 2, regulator: REGISTER,
  src: [[S4, 'One or more managing directors (Geschäftsführer), each a natural person with full capacity'], [CORE, 'At least one eligible managing director on the register']],
  sat: any(atLeast(`${R}.directors_count`, 1), held(EXTRACT.id)),
  // A count of none from an unconfirmed provider is for a person to read.
  verify: FOUND,
  evidence: ['Handelsregister record (through OpenRegister)', 'Handelsregister extract'], action: 'review', slot: EXTRACT,
  text: [
    "We can't see a managing director for {company} on the register",
    "The register record we read shows no current managing director (Geschäftsführer), and you haven't added a current extract.",
    'Every GmbH has at least one managing director, a person with full legal capacity, and each one is registered.',
    'Nobody shows as able to act for the company, which holds up banks and investors.',
    'Check the record at handelsregister.de, file any missing appointment through a notary, and add a current extract here.',
  ],
});
b.rule({
  id: 'DE.CORP.DIRECTOR_ELIGIBLE', layer: 1, area: 'officers', stage: 2, title: 'Managing directors not disqualified', sev: 'medium', tier: 5,
  src: [[S4, 'Disqualification of managing directors (convictions, professional bans)']],
  sat: told('de_directors_eligible'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s managing directors may hold the role",
    "We don't have your confirmation that no managing director is barred by a conviction, a professional ban or a court-ordered consent requirement. We don't keep people's records, so we can't check.",
    'Some convictions and bans rule a person out as managing director for five years, and each director declares this when registered.',
    'An appointment that breaks the rule is void, and a false declaration is an offence.',
    'Ask each managing director to check, then confirm here.',
  ],
});
b.doc({
  id: 'DE.CORP.DIRECTOR_CHANGES', layer: 1, area: 'filings', stage: 2, title: 'Managing director changes registered', noun: 'register extract showing the current managing directors', sev: 'medium', tier: 4, regulator: REGISTER,
  src: [[S4, 'Director changes filed for the Handelsregister']],
  slot: EXTRACT,
  why: 'Every appointment and every end of a managing director\'s power to represent the company is filed with the register.',
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Compare the register with who runs the company today, file any change through a notary, and add a current extract here.',
});

// --- Section 5: intellectual property --------------------------------------------------------------

b.rule({
  id: 'DE.IP.EMPLOYEE_INVENTIONS', layer: 2, area: 'ip_ownership', stage: 2, title: 'Employee inventions reported and claimed', sev: 'medium', tier: 5, when: STAFF,
  src: [[S5, 'Employee must report a service invention separately, in text form'], [S5, 'Service invention deemed claimed 4 months after a proper report']],
  params: { months_deemed_claimed: 4 },
  sat: any(held('de_invention_policy'), told('de_employee_inventions')), evidence: ['Invention reporting policy', 'Your confirmation'], action: 'attest',
  slot: { id: 'de_invention_policy', label: 'Employee invention reporting policy', reason: 'Employees report service inventions in text form, and the company holds them unless it releases them within 4 months.' },
  text: [
    "We can't see how {company} handles employee inventions",
    "You haven't added an invention reporting policy, or confirmed how employees report inventions and how you handle them.",
    'Employees report each service invention separately in text form. It counts as claimed by the company unless it is released in text form within 4 months, and the employee is paid for it.',
    'An invention released by mistake stays with the employee, and investors check this.',
    'Set up a simple way to report inventions and track the 4 months. Add the policy here or confirm.',
  ],
});
b.rule({
  id: 'DE.IP.EMPLOYEE_SOFTWARE', layer: 2, area: 'ip_ownership', stage: 2, title: 'Code written by employees at work', sev: 'low', tier: 5, when: STAFF,
  src: [[S5, 'Software written by employees: the employer holds all economic rights']],
  sat: told('de_employee_code_at_work'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s code is written by employees as part of their work",
    "We don't have your confirmation that the software your employees write is made in their duties or on your instructions.",
    'German law gives the employer all economic rights in a program an employee writes in their duties, unless agreed otherwise. It does not cover freelancers.',
    'Code written outside that may stay with the person who wrote it, and investors check who owns the product.',
    'Make sure contracts cover the code each employee writes, then confirm here.',
  ],
});
b.rule({
  id: 'DE.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'German trade mark', sev: 'medium', tier: 4, regulator: 'DPMA',
  src: [[S5, 'German trade mark at the DPMA: 10 years from filing, renewable']],
  rec: { type: 'every_years', from_fact: 'vault.de_trademark.dated', years: 10, monitoring: remind },
  sat: held('de_trademark'), evidence: ['Trade mark certificate'], action: 'file',
  slot: { id: 'de_trademark', label: 'DPMA trade mark registration certificate', reason: 'A German mark lasts 10 years from filing and is renewed for 10 more. We read your certificate for its dates.', tier: 4 },
  text: [
    "We can't see a German trade mark for {company}",
    "You haven't added a trade mark certificate from the DPMA.",
    "Without one, someone else could register a name close to yours in Germany, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.',
    'File your brand with the DPMA, or as an EU trade mark, or add your certificate here.',
  ],
});

// --- Section 6: data protection --------------------------------------------------------------------

b.rule({
  id: 'DE.DP.DPO', layer: 3, area: 'data_protection', stage: 2, title: 'Data protection officer (BDSG threshold)', sev: 'medium', tier: 5, regulator: 'the data protection authority of your Land', when: PD,
  shared: euObligation('DPO'),
  src: [[S6, 'DPO where 20 or more persons regularly process personal data by automated means'], ['EU Section 1 —', 'DPO designated where required', MAPS.eu]],
  law: [['BDSG', '§38(1)'], ['GDPR', 'Art 37']],
  params: { persons_regularly_processing: 20 },
  sat: any(told('eu_dpo'), yes('web.policy.dpo_contact')), evidence: ['Your confirmation', 'Your published privacy notice'], action: 'attest',
  text: [
    "You haven't confirmed whether {company} needs a data protection officer",
    "We don't have your confirmation that you checked whether you need a data protection officer, and we couldn't find a DPO contact in your privacy notice.",
    'In Germany a company names a data protection officer once 20 or more people regularly handle personal data by computer, and whatever its size if it needs impact assessments or trades in data.',
    'If you need one and have not named one, the data protection authority of your Land can act on it.',
    'Count the people who handle personal data. If the test is met, name your officer, publish the contact, tell your Land authority, and confirm here.',
  ],
});
b.rule({
  id: 'DE.DP.EMPLOYEE_DATA', layer: 3, area: 'data_protection', stage: 2, title: 'Employee data used only as employment needs', sev: 'low', tier: 5, when: STAFF,
  src: [[S6, 'Processing employee data for employment purposes (BDSG §26)']],
  sat: told('de_employee_data'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed how {company} handles its staff's personal data",
    "We don't have your confirmation that you use employees' data only as hiring, running or ending their employment needs, and that any consent is in writing with the right to withdraw.",
    "Employers may use staff data as the job needs it. Consent counts only if it is truly free, given the employee's position.",
    'Staff data is one of the first things a works council or authority asks about.',
    'Check what you collect about staff and why, then confirm here.',
  ],
});

// --- Section 7: tax and employer duties ----------------------------------------------------------------

b.doc({
  id: 'DE.TAX.REGISTRATION', layer: 3, area: 'tax', stage: 2, title: 'Registered with the tax office', noun: 'tax office letter with your tax number', sev: 'high', tier: 4, regulator: 'Finanzamt',
  src: [[S7, 'Tax registration questionnaire within one month of starting business'], [CORE, 'Tax registration within one month']],
  params: { months_to_register: 1 },
  slot: { id: 'de_tax_registration', label: 'Tax office letter giving your tax number (Steuernummer)', reason: 'A new company tells the tax office within one month of starting business, through the ELSTER registration form, and gets its tax number.', tier: 4 },
  ifLeft: 'Without a tax number you cannot invoice properly or file returns, and late registration can be fined.',
  fix: 'File the registration form for a new company on ELSTER, and add the letter with your tax number here.',
});
b.rule({
  id: 'DE.TAX.VAT_RETURNS', layer: 3, area: 'tax', stage: 3, title: 'VAT returns filed, or small-business exemption used', sev: 'medium', tier: 5, regulator: 'Finanzamt',
  src: [[S7, 'VAT advance returns by the 10th day; quarterly by default, monthly above EUR 9,000'], [S7, 'Small-business VAT exemption (Kleinunternehmer): EUR 25,000 prior year and EUR 100,000 current year']],
  params: { small_business_prior_year_eur: 25_000, small_business_current_year_eur: 100_000 },
  sat: any(told('de_vat_returns'), told('de_small_business_vat')), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} files its VAT returns",
    "We don't have your confirmation that VAT advance returns are filed on time, or that the company uses the small-business exemption.",
    'VAT advance returns are filed electronically by the 10th day after each month or quarter. Below EUR 25,000 of turnover last year and EUR 100,000 this year, a company may choose not to charge VAT.',
    'Late returns bring surcharges and interest, and VAT not charged is still owed.',
    'Check with your tax adviser that every period is filed, or that you use the exemption, then confirm here.',
  ],
});
b.doc({
  id: 'DE.EMP.BETRIEBSNUMMER', layer: 3, area: 'employment', stage: 2, title: 'Employer number (Betriebsnummer)', noun: 'Betriebsnummer letter', sev: 'medium', tier: 4, regulator: 'Bundesagentur für Arbeit', when: STAFF,
  src: [[S7, 'Betriebsnummer from the Bundesagentur für Arbeit']],
  slot: { id: 'de_betriebsnummer', label: 'Betriebsnummer letter from the Bundesagentur für Arbeit', reason: 'An employer applies for a Betriebsnummer for each establishment before reporting staff to social insurance.', tier: 4 },
  fix: 'Apply for your Betriebsnummer with the Bundesagentur für Arbeit, and add the letter here.',
});
b.rule({
  id: 'DE.EMP.SOCIAL_INSURANCE', layer: 3, area: 'employment', stage: 2, title: 'Staff reported to social insurance', sev: 'high', tier: 5, when: STAFF,
  src: [[S7, 'Social insurance reports to the collection agency (Krankenkasse)']],
  sat: told('de_social_insurance'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} reports its staff to social insurance",
    "We don't have your confirmation that each start and end of employment is reported electronically to the employee's health insurer.",
    'Employers report every employee to the collecting health insurer, with their Betriebsnummer, when employment starts, ends or changes.',
    'Unreported employment brings back payments and fines, and can leave staff uninsured.',
    'Check with your payroll provider that every employee is reported, then confirm here.',
  ],
});
b.rule({
  id: 'DE.EMP.WAGE_TAX', layer: 3, area: 'employment', stage: 2, title: 'Wage tax returns (Lohnsteuer-Anmeldung)', sev: 'high', tier: 5, regulator: 'Finanzamt', when: STAFF,
  src: [[S7, 'Wage tax return (Lohnsteuer-Anmeldung) by the 10th day after each period']],
  sat: told('de_wage_tax'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} files its wage tax returns",
    "We don't have your confirmation that wage tax is reported and paid by the 10th day after each period.",
    'Employers file the wage tax return electronically, monthly by default, and pay the tax withheld from wages.',
    'Late returns bring surcharges, and the managing directors can be liable for unpaid wage tax.',
    'Check with your payroll provider that every period is filed, then confirm here.',
  ],
});
b.rule({
  id: 'DE.EMP.WRITTEN_TERMS', layer: 3, area: 'employment', stage: 2, title: 'Written record of employment terms', sev: 'medium', tier: 5, when: STAFF,
  src: [[S7, 'Written record of essential terms (Nachweisgesetz)']],
  sat: told('de_written_terms'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} gives staff their terms in writing",
    "We don't have your confirmation that each employee gets their essential terms in writing on time.",
    'Pay, working time and the parties are recorded by the first working day, the start date, place and duties within 7 days, and the rest within a month.',
    'Missing records can be fined and weaken your position in any dispute.',
    'Check every employee has a signed contract or written statement covering these points, then confirm here.',
  ],
});
b.rule({
  id: 'DE.EMP.MINIMUM_WAGE', layer: 3, area: 'employment', stage: 2, title: 'Minimum wage paid', sev: 'high', tier: 5, when: STAFF, from: '2026-01-01',
  src: [[S7, 'Minimum wage EUR 13.90 an hour from 1 Jan 2026']],
  params: { eur_per_hour_2026: 13.9, eur_per_hour_from_2027: 14.6 },
  sat: told('de_minimum_wage'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} pays at least the minimum wage",
    "We don't have your confirmation that every employee is paid at least the statutory minimum wage.",
    'The minimum wage is EUR 13.90 an hour from 1 January 2026, and EUR 14.60 from 1 January 2027.',
    'Underpayment is fined and the difference has to be paid back.',
    'Check the hourly pay of everyone on payroll, interns and part-time staff included, then confirm here.',
  ],
});
b.rule({
  id: 'DE.EMP.OVERTIME_RECORDS', layer: 3, area: 'employment', stage: 2, title: 'Overtime recorded and kept', sev: 'low', tier: 5, when: STAFF,
  src: [[S7, 'Overtime records beyond the ArbZG §3 daily limit, kept 2 years']],
  params: { years_kept: 2 },
  sat: told('de_overtime_records'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} records overtime",
    "We don't have your confirmation that time worked beyond the daily limit is recorded and the records kept for 2 years.",
    'Employers record working time beyond the daily limit and keep those records for 2 years.',
    'Missing records are fined, and labour inspectors ask for them.',
    'Set up time records for your staff, keep them 2 years, then confirm here.',
  ],
});

// --- Section 8: sector licences --------------------------------------------------------------------

b.doc({
  id: 'DE.FIN.PAYMENT_LICENCE', layer: 3, area: 'payments', stage: 2, title: 'Payment or e-money licence (BaFin)', noun: 'payment or e-money licence', sev: 'high', tier: 4, regulator: 'BaFin', when: yes('derived.moves_money'),
  src: [[S8, 'Payment services licence from BaFin'], [S8, 'E-money business licence from BaFin']],
  slot: { id: 'de_payment_licence', label: 'BaFin payment or e-money licence', reason: "Holding or moving customers' money needs a licence from BaFin, or a licensed partner.", tier: 4 },
  fix: 'Add your BaFin licence, or the agreement with the licensed partner that covers you.',
});
b.doc({
  id: 'DE.FIN.LENDING_LICENCE', layer: 3, area: 'lending', stage: 2, title: 'Banking or financial services permission (BaFin)', noun: 'BaFin permission', sev: 'high', tier: 4, regulator: 'BaFin', when: yes('derived.sector.lending'),
  src: [[S8, 'Banking business or financial services permission from BaFin (including lending)']],
  slot: { id: 'de_lending_licence', label: 'BaFin banking or financial services permission', reason: 'Lending as a business, and many financial services, need written permission from BaFin.', tier: 4 },
  fix: 'Add your BaFin permission, or the agreement with the licensed partner that covers you.',
});

// --- Section 9: consumers and website ----------------------------------------------------------------

b.rule({
  id: 'DE.CONSUMER.DISPUTE_STATEMENT', layer: 4, area: 'consumer_protection', stage: 3, title: 'Statement on consumer dispute resolution', sev: 'low', tier: 5, when: all(CONSUMER, SITE),
  src: [[S9, 'Consumer dispute resolution statement on the website and in the terms (VSBG §36)']],
  params: { exempt_up_to_employees: 10 },
  sat: told('de_dispute_statement'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} says whether it takes part in consumer arbitration",
    "We don't have your confirmation that your website and terms say whether you will take part in consumer dispute resolution, or that you are exempt.",
    'A company selling to consumers states on its website and in its terms whether it will use a consumer arbitration body, and names it if it does. Companies with 10 or fewer employees are exempt.',
    'Missing statements draw warning letters from competitors and consumer groups.',
    'Add a short statement to your website and terms, or confirm here that you are exempt.',
  ],
});

// --- Section 10: fundraising ---------------------------------------------------------------------------

b.doc({
  id: 'DE.FUND.CAPITAL_INCREASE', layer: 5, area: 'fundraising', stage: 4, title: 'Capital increase notarised and registered', noun: 'capital increase records', sev: 'high', tier: 4, regulator: REGISTER, when: INVESTED,
  src: [
    [S10, 'Capital increase resolution notarised, three-quarters majority'], [S10, 'Subscription declaration (Übernahmeerklärung) notarised or certified'],
    [S10, 'Registration of the capital increase once the shares are taken up'],
  ],
  slot: { id: 'de_capital_increase', label: 'Notarised resolution, subscription declarations and register entry for each capital increase', reason: 'A capital increase is a notarised change to the articles. Each investor signs a notarised subscription, and the increase counts only once registered.', tier: 4 },
  fix: 'Add the notarised resolution, the subscription declarations and the register entry for each round.',
});
b.rule({
  id: 'DE.FUND.SHARE_TRANSFERS', layer: 5, area: 'fundraising', stage: 4, title: 'Share transfers by notarial deed', sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'Secondary share sales to investors by notarial deed'], [S2, 'Share transfer and agreement to transfer in notarial form']],
  sat: told('de_share_transfers_notarised'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s share transfers were notarised",
    "We don't have your confirmation that every sale or transfer of shares, and every agreement to transfer, was made before a notary.",
    'GmbH shares pass only by notarial deed, and the new shareholder list is filed afterwards.',
    'A transfer without a notary is void, so the buyer may not own the shares at all.',
    'Check each transfer since the company was set up was notarised, then confirm here.',
  ],
});
b.doc({
  id: 'DE.FUND.SHAREHOLDER_LIST_UPDATED', layer: 5, area: 'fundraising', stage: 4, title: 'New shareholder list after each round', noun: 'shareholder list filed after the round', sev: 'medium', tier: 4, when: INVESTED,
  src: [[S10, 'New shareholder list after the round']],
  slot: { id: 'de_shareholder_list', label: 'Latest shareholder list (Gesellschafterliste) from the Handelsregister', reason: 'The managing directors, or the notary, file a new list after every change in shareholders or stakes. Only shareholders on the list count against the company.', tier: 4 },
  fix: 'Download the list filed after your latest round and add it here.',
});

// --- Section 11: AI --------------------------------------------------------------------------------

b.rule({
  id: 'DE.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI use disclosed on your website', sev: 'low', tier: 1, when: all(yes('derived.uses_ai'), yes('derived.has_website')),
  shared: 'ai_transparency',
  src: [[S11, 'AI use disclosed on the website']],
  // The scan reads German, but may not recognise every wording ("KI"): a miss is "to check".
  sat: any(yes('web.policy.ai_disclosure_found'), held('de_ai_transparency')), verify: no('web.policy.ai_disclosure_found'),
  evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'de_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI.' },
  text: [
    "We can't see where {company} tells people it uses AI",
    "We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.",
    'People must be told when they are dealing with an AI system, and AI-made content has to be marked.',
    'Enterprise customers and investors are starting to ask, and you would have no answer ready.',
    'Say on your website where your product uses AI, or add your transparency records here.',
  ],
});

export const de = b.build();

/** International rules the German pack asks for in its own way. */
export const DE_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  ...euIntlEquivalents('DE', true, OMIT),
  'INTL.CORP.CONSTITUTION': ['DE.CORP.ARTICLES'],
};

import type { Logic } from '../logic.js';
import { addEuCommon, euIntlEquivalents, euObligation, type EuKey } from './eu-common.js';
import { all, any, atLeast, eq, held, MAPS, no, not, packBuilder, remind, told, yes } from './helper.js';

/**
 * France (SAS, SASU, SARL, EURL). Draft, version 0.2.0 (EU representative and DSA rules added 18 Nov 2026): every rule waits for a lawyer. Encoded
 * from docs/knowledge/vero-scan-france-rule-pack-map.md, plus the EU common rules
 * (eu-common.ts). Items left out, and why, are listed at the end of the France map ("Not
 * encoded"). A rule citing a [verify] line is needs_review, so it can only ever say "a person
 * needs to check this".
 *
 * The French business directory (docs/FRANCE.md) leaves out companies that asked not to be
 * public, so a miss there is "not in the public directory", never a problem with the company:
 * its `identified` fact stays unknown and every rule reading it comes out "to check". The CNIL's
 * DPO list can't match a designation made without a SIREN, so a miss there is never "no DPO".
 */
const b = packBuilder('FR', MAPS.france, { name: 'France', version: '0.2.0' });

const D = 'registry.fr.recherche_entreprises';
const DIRECTORY = 'Annuaire des Entreprises';
const CNIL = 'the CNIL';
const S1 = 'Section 1 —';
const S2 = 'Section 2 —';
const S3 = 'Section 3 —';
const S5 = 'Section 5 —';
const S6 = 'Section 6 —';
const S7 = 'Section 7 —';
const S8 = 'Section 8 —';
const S9 = 'Section 9 —';
const S10 = 'Section 10 —';
const S11 = 'Section 11 —';
const CORE = '5. The core set';

const oneOf = (key: string, values: string[]): Logic => ({ in: [{ var: key }, values] });
const SAS = oneOf('company.entity_type', ['sas', 'sasu']);
const SARL = oneOf('company.entity_type', ['sarl', 'eurl']);
const PD = yes('derived.personal_data');
const STAFF = yes('derived.employees');
const AI = yes('derived.uses_ai');
const INVESTED = yes('derived.invested');
const FOUND = yes(`${D}.identified`);
/** The directory hides some details of companies published only in part. */
const PARTIAL = yes(`${D}.partially_published`);

// EU common rules France writes itself, with the same shared obligation.
const OMIT: EuKey[] = ['DPO', 'WEBSITE_IDENTITY'];

addEuCommon(b, {
  cc: 'FR', eu: true, authority: CNIL, english: false, consentAge: 15, omit: OMIT,
  extraSrc: {
    PRIVACY_NOTICE: [[S6, '| Privacy notice published |']],
    CHILD_CONSENT: [[S6, 'Age of digital consent is 15']],
    ROPA: [[S6, '| Record of processing activities |']],
    COOKIE_CONSENT: [[S6, 'Cookie consent per CNIL rules']],
    COOKIE_POLICY: [[S6, '| Cookie policy |']],
    CONSUMER_INFO: [[S9, 'Consumer pre-contract information (CGV)']],
    WITHDRAWAL: [[S9, 'Refund, cancellation and complaints pages']],
    CONSUMER_COMPLAINTS: [[S9, 'Refund, cancellation and complaints pages']],
    VAT_VIES: [[S7, 'VAT: registered once above the franchise thresholds']],
  },
});

// --- Section 1: company register and status ------------------------------------------------------

b.rule({
  id: 'FR.CORP.STATUS', layer: 1, area: 'standing', stage: 2, title: 'Company status in the national register', sev: 'critical', tier: 1, regulator: DIRECTORY,
  src: [[S1, 'Registered in the national register of companies (RNE)'], [S1, 'Company active, not ceased'], [CORE, 'In the RNE and active']],
  sat: eq(`${D}.status`, 'active'),
  // The directory says so in its own words: the company has ceased.
  defect: all(FOUND, eq(`${D}.status`, 'ceased')),
  verify: all(FOUND, not(oneOf(`${D}.status`, ['active', 'ceased']))),
  evidence: ['French business directory record'], action: 'review',
  text: [
    "{company} shows as ceased in the French business directory",
    "We read {company}'s record in the Annuaire des Entreprises, and it shows the company as ceased.",
    'Anyone who looks the company up, banks and investors included, sees this status first.',
    'A company recorded as ceased can have trouble with its bank, its contracts and any fundraising.',
    'Check the record on annuaire-entreprises.data.gouv.fr. If it is wrong, ask the registry to correct it; if not, get advice today.',
  ],
});
b.doc({
  id: 'FR.CORP.PROOF_OF_REGISTRATION', layer: 1, area: 'standing', stage: 2, title: 'Proof of registration (RNE attestation or Kbis)', noun: 'proof of registration', sev: 'medium', tier: 4,
  src: [[S1, 'Proof of registration (RNE attestation or Kbis extract)']],
  slot: { id: 'fr_registration_proof', label: 'RNE registration attestation or Kbis extract', reason: 'Banks, investors and large customers ask for an official extract showing the company is registered.', tier: 4 },
  ifLeft: 'Banks and investors ask for it, and a gap in your company records can hold up a round or a new bank account.',
  fix: 'Download the free registration attestation from INPI, or order a Kbis extract from the greffe, and add it here.',
});
b.rule({
  id: 'FR.CORP.REGISTERED_OFFICE', layer: 1, area: 'filings', stage: 2, title: 'Registered office on record', sev: 'low', tier: 1, regulator: DIRECTORY,
  src: [[S1, 'Registered office (siège social) stated in the statuts']],
  sat: { '!!': [{ var: `${D}.hq_commune` }] }, verify: PARTIAL,
  evidence: ['French business directory record'], action: 'file',
  text: [
    "We can't see {company}'s registered office in the French business directory",
    "We read {company}'s record in the Annuaire des Entreprises and found no head office town.",
    'Every company has a registered office, stated in its statuts and on the register.',
    'Official letters and legal papers go there, and banks check it matches.',
    'Check the record and update the registered office on the Guichet unique if it is missing.',
  ],
});

// --- Section 2: constitution, registers and beneficial owners ------------------------------------

b.doc({
  id: 'FR.CORP.STATUTS', layer: 1, area: 'governance', stage: 2, title: 'Statuts', noun: 'statuts', sev: 'high', tier: 4,
  src: [[S2, 'Statuts adopted and up to date'], [CORE, 'Statuts and proof of registration uploaded']],
  slot: { id: 'fr_statuts', label: 'Statuts (current, certified copy)', reason: 'The statuts set out how the company is run, who decides what, and how shares can be transferred.', tier: 4 },
  ifLeft: 'Banks and investors ask for it, and a gap in your company records can hold up a round or a new bank account.',
  fix: 'Add the current statuts, with every change made since the company was set up.',
});
b.rule({
  id: 'FR.CORP.SHARE_MOVEMENTS_REGISTER', layer: 1, area: 'shareholders', stage: 2, title: 'Register of share movements', sev: 'medium', tier: 5, when: SAS,
  src: [[S2, 'Register of share movements (registre des mouvements de titres)']],
  sat: told('fr_share_movements_register'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps its register of share movements",
    "We don't have your confirmation that {company} keeps a register recording each share transfer, with its date, holders and number of shares.",
    'In a SAS, a share transfer binds the company only once it is entered in this register.',
    'A transfer that was never entered can be disputed, and investors check the register in due diligence.',
    'Bring the register up to date with every transfer since the company was set up, then confirm here.',
  ],
});
b.rule({
  id: 'FR.CORP.DECISIONS_REGISTER', layer: 1, area: 'governance', stage: 2, title: 'Register of shareholder decisions', sev: 'medium', tier: 5,
  src: [[S2, 'Register of shareholder decisions (procès-verbaux)']],
  sat: any(held('fr_decisions_register'), told('fr_decisions_register')), evidence: ['Register of decisions', 'Your confirmation'], action: 'attest',
  slot: { id: 'fr_decisions_register', label: 'Register of shareholder decisions (procès-verbaux)', reason: 'It is the official record of every shareholder decision, kept on numbered sheets or in a time-stamped electronic form.' },
  text: [
    "We can't see {company}'s register of shareholder decisions",
    "You haven't added the register of shareholder decisions, or confirmed that you keep one.",
    'Shareholder decisions are recorded in minutes kept on numbered sheets or in a time-stamped electronic form.',
    'A decision with no minutes is hard to prove, and investors and banks ask for them.',
    'Keep the minutes of every decision in the register, and add it here or confirm you keep it.',
  ],
});
b.doc({
  id: 'FR.CORP.UBO', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial-owner declaration', noun: 'beneficial-owner declaration', sev: 'high', tier: 4,
  src: [[S2, 'Beneficial owners declared at registration'], [CORE, 'Beneficial-owner declaration uploaded']],
  slot: { id: 'fr_ubo_declaration', label: 'Beneficial-owner declaration (from the Guichet unique)', reason: 'The register of beneficial owners is not public, so your copy of the declaration is the only way to show it was made.', tier: 4 },
  why: 'Every company declares the people who own more than 25% of it, or control it. The register is not public, so we need your copy.',
  ifLeft: 'Banks and investors ask for it, and a gap in your company records can hold up a round or a new bank account.',
  fix: 'Download your declaration from the Guichet unique and add it here. If it was never filed, file it there now.',
});
b.doc({
  id: 'FR.CORP.UBO_CHANGES', layer: 1, area: 'beneficial_ownership', stage: 4, title: 'Beneficial-owner update after a change', noun: 'beneficial-owner update', sev: 'medium', tier: 4, when: INVESTED,
  src: [[S2, 'Beneficial-owner changes filed within 30 days'], [S10, 'Beneficial-owner update after a round']],
  params: { days_after_change: 30 },
  slot: { id: 'fr_ubo_update', label: 'Beneficial-owner update filing receipt', reason: 'A change in who owns or controls the company, such as after a round, is filed within 30 days.', tier: 4 },
  ifLeft: 'Late or missing updates can be fined, and the company can be struck off after formal notice.',
  fix: 'After each change in ownership, file the update on the Guichet unique and add the receipt here.',
});

// --- Section 3: accounts and meetings --------------------------------------------------------------

b.rule({
  id: 'FR.CORP.ACCOUNTS_APPROVAL_SARL', layer: 1, area: 'filings', stage: 2, title: 'Accounts approved within 6 months (SARL)', sev: 'medium', tier: 5, when: SARL,
  src: [[S3, 'Accounts approved within 6 months of year end']],
  rec: { type: 'after_year_end', months: 6, monitoring: remind },
  sat: told('fr_accounts_approved'), evidence: ['Your confirmation', 'Minutes of the annual meeting'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s partners approved last year's accounts",
    "We don't have your confirmation that the partners approved the accounts within 6 months of the year end.",
    'A SARL holds its annual meeting to approve the accounts within 6 months of the year end, unless the court extends it.',
    'Not putting the accounts to the partners can be fined, and the filing deadline runs from the approval.',
    'Hold the meeting, keep the minutes, then confirm here.',
  ],
});
b.rule({
  id: 'FR.CORP.ACCOUNTS_APPROVAL_SAS', layer: 1, area: 'filings', stage: 2, title: 'Accounts approved within the period in the statuts (SAS)', sev: 'medium', tier: 5, when: SAS,
  src: [[S3, 'Accounts approved within the period set by the statuts']],
  sat: told('fr_accounts_approved'), evidence: ['Your confirmation', 'Record of the shareholder decision'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s shareholders approved last year's accounts",
    "We don't have your confirmation that the shareholders approved the accounts within the period your statuts set.",
    'In a SAS, the statuts set when the accounts are approved. Dividends have to be paid within 9 months of the year end.',
    'Late approval delays the filing at the greffe, and investors look for approved accounts.',
    'Approve the accounts by the date in your statuts, record the decision, then confirm here.',
  ],
});
b.doc({
  id: 'FR.CORP.ACCOUNTS_FILING', layer: 1, area: 'filings', stage: 2, title: 'Annual accounts filed with the greffe', noun: 'accounts filing receipt', sev: 'high', tier: 4, penalty: 'moderate',
  src: [[S3, 'Annual accounts filed with the greffe']],
  params: { months_after_approval: 1, months_after_approval_online: 2 },
  slot: { id: 'fr_accounts_filing', label: 'Accounts filing receipt (récépissé de dépôt)', reason: 'Accounts are filed with the greffe within a month of approval, two if filed online. We cannot read the filing yet, so we need the receipt.', tier: 4 },
  ifLeft: 'A late filing can be fined, and the court can order it with a daily penalty.',
  fix: 'File the approved accounts with the greffe, online or on paper, and add the receipt here.',
});
b.rule({
  id: 'FR.CORP.BOOKS', layer: 1, area: 'filings', stage: 2, title: 'Accounting books kept', sev: 'low', tier: 5,
  src: [[S3, 'Books kept (livre-journal, grand livre, annual inventory)']],
  sat: told('fr_books_kept'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps its accounting books",
    "We don't have your confirmation that the company keeps a journal, a general ledger and a yearly inventory.",
    'Every company keeps these books, and keeps them for 10 years after the year end.',
    'Without them, accounts and tax returns are hard to back up if anyone asks.',
    'Check your accountant keeps them for you, then confirm here.',
  ],
});

// --- Section 4: directors and managers -------------------------------------------------------------

b.rule({
  id: 'FR.CORP.MANAGEMENT', layer: 1, area: 'officers', stage: 2, title: 'A président or gérant on record', sev: 'high', tier: 1, regulator: DIRECTORY,
  src: [[CORE, 'A président (SAS) or natural-person gérant (SARL) on record']],
  sat: atLeast(`${D}.directors_count`, 1), verify: PARTIAL,
  evidence: ['French business directory record'], action: 'file',
  text: [
    "We can't see who runs {company} in the French business directory",
    "We read {company}'s record in the Annuaire des Entreprises and found no director on it.",
    'A SAS is run by a président, and a SARL by one or more gérants. They are recorded on the register.',
    'Nobody shows as able to sign for the company, which holds up banks and investors.',
    'Check the record and file the appointment on the Guichet unique if it is missing.',
  ],
});

// --- Section 5: intellectual property --------------------------------------------------------------

b.rule({
  id: 'FR.IP.EMPLOYEE_WORKS', layer: 2, area: 'ip_ownership', stage: 2, title: 'What French law gives you of employees\' work', sev: 'medium', tier: 5, when: STAFF,
  src: [[S5, 'Employee-written software belongs to the company'], [S5, '| Employee inventions |']],
  sat: told('fr_employee_ip_clauses'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s employment contracts cover IP beyond software",
    "We don't have your confirmation that your employment contracts give the company employees' designs, text and other work, and deal with inventions.",
    'Software written by employees in their job belongs to the company, but other work needs a clause in the contract. Employees who invent get extra pay.',
    "Without the clause, the company may not own its designs and content, and investors check this.",
    'Add an IP clause covering all work, and the invention pay rules, to your employment contracts. Then confirm here.',
  ],
});
b.rule({
  id: 'FR.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'Trade mark (French or EU)', sev: 'medium', tier: 4, regulator: 'INPI',
  src: [[S5, 'Trademark filed at INPI (or as an EU trade mark)'], ['EU Section 11 —', 'Brand protected by an EU trade mark or a national mark in each operating market', MAPS.eu], ['EU Section 11 —', 'Renewal every 10 years from filing', MAPS.eu]],
  rec: { type: 'every_years', from_fact: 'vault.fr_trademark.dated', years: 10, monitoring: remind },
  sat: held('fr_trademark'), evidence: ['Trade mark certificate'], action: 'file',
  slot: { id: 'fr_trademark', label: 'INPI or EU trade mark certificate', reason: 'There is no INPI lookup we can use yet, so we read your certificate. A mark lasts 10 years and can be renewed.', tier: 4 },
  text: [
    "We can't see a trade mark for {company}",
    "You haven't added a French or EU trade mark certificate, and we can't look marks up at INPI yet.",
    "Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.',
    'File your brand at INPI, or as an EU trade mark, or add your certificate here.',
  ],
});

// --- Section 6: data protection --------------------------------------------------------------------

b.rule({
  id: 'FR.DP.DPO', layer: 3, area: 'data_protection', stage: 2, title: 'Data protection officer declared to the CNIL', sev: 'medium', tier: 3, regulator: CNIL, when: all(PD, yes('derived.sensitive_data')),
  shared: euObligation('DPO'),
  // The CNIL list is matched on a SIREN: it says nothing about a company registered elsewhere.
  overlay: 'never',
  src: [[S6, 'DPO designated and declared to the CNIL online'], ['EU Section 1 —', 'DPO designated where required', MAPS.eu]],
  law: [['GDPR', 'Art 37']],
  // On the CNIL list is a pass. Not on it is never "no DPO": a designation made without a SIREN can't be matched.
  sat: any(yes('registry.fr.cnil_dpo.listed'), told('eu_dpo')), verify: no('registry.fr.cnil_dpo.listed'),
  evidence: ['CNIL list of designated DPOs', 'Your confirmation'], action: 'attest',
  text: [
    "We can't confirm whether {company} has declared a data protection officer",
    "You told us you handle sensitive data. We didn't find the company's SIREN on the CNIL's list of designated officers, and you haven't confirmed whether you need one.",
    'Companies whose core work is monitoring people at scale, or handling sensitive data at scale, must name an officer and declare them to the CNIL online.',
    'If you need one and haven\'t declared one, the CNIL can act on it.',
    'Check whether the tests apply. If they do, declare your officer on the CNIL website. If you already have, confirm here.',
  ],
});
b.rule({
  id: 'FR.DP.DPO_CONTACT', layer: 3, area: 'data_protection', stage: 2, title: 'Officer contact in the privacy notice', sev: 'low', tier: 1, regulator: CNIL, when: all(PD, yes('derived.has_website_or_app'), yes('registry.fr.cnil_dpo.listed')),
  src: [[S6, 'DPO contact in the privacy notice']], overlay: 'never',
  // The scan matches "data protection officer" or "DPO" only, not the French words: a miss is "to check".
  sat: yes('web.policy.dpo_contact'), verify: no('web.policy.dpo_contact'),
  evidence: ['Your published privacy notice'], action: 'fix_website',
  text: [
    "We can't see your data protection officer's contact in {company}'s privacy notice",
    "Your officer is on the CNIL's list, and we couldn't find their contact in your privacy notice. Our scan may not recognise every wording, so a person will check.",
    'The notice has to give a way to contact your data protection officer.',
    'People with questions about their data have no direct way to reach the right person.',
    "Add the officer's contact (an email address is enough) to your privacy notice.",
  ],
});
b.rule({
  id: 'FR.DP.AUDIENCE_MEASUREMENT', layer: 3, area: 'cookies', stage: 2, title: 'Analytics cookies without consent', sev: 'low', tier: 5, regulator: CNIL,
  when: all(yes('derived.has_website'), { in: ['analytics', { var: 'answers.trackers' }] }),
  src: [[S6, 'Audience-measurement cookies without consent only if exempt']],
  sat: told('fr_audience_measurement_exempt'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s analytics can run without consent",
    "You told us you use analytics, and we don't have your confirmation that it is set up so it can run before people agree.",
    "Analytics can skip consent only if it is used just for your own anonymous statistics, isn't shared and doesn't follow people across sites.",
    'Otherwise it needs consent like any other tracker, and the CNIL checks this.',
    'Set your analytics up to meet those conditions, or put it behind your consent banner. Then confirm here.',
  ],
});

// --- Section 7: tax and employer registration ------------------------------------------------------

b.rule({
  id: 'FR.TAX.E_INVOICE_RECEIVE', layer: 3, area: 'tax', stage: 2, title: 'Ready to receive e-invoices', sev: 'medium', tier: 5, regulator: 'DGFiP', from: '2026-09-01',
  src: [[S7, 'Able to receive e-invoices through an approved platform'], [CORE, 'Able to receive e-invoices']],
  sat: told('fr_e_invoice_platform'), evidence: ['Your confirmation, with the name of your platform'], action: 'attest',
  text: [
    "You haven't confirmed {company} can receive e-invoices",
    "We don't have your confirmation that the company has chosen an approved platform to receive electronic invoices.",
    'Since 1 September 2026, every company that pays VAT in France must be able to receive e-invoices through an approved platform.',
    'Suppliers will start sending invoices you have no way to receive.',
    'Choose an approved platform (plateforme agréée), connect it, then confirm here with its name.',
  ],
});
b.rule({
  id: 'FR.TAX.E_INVOICE_ISSUE', layer: 3, area: 'tax', stage: 2, title: 'Sending e-invoices', sev: 'medium', tier: 5, regulator: 'DGFiP', from: '2027-09-01',
  src: [[S7, 'Able to receive e-invoices through an approved platform']],
  sat: told('fr_e_invoice_issue'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} sends its invoices electronically",
    "We don't have your confirmation that the company issues e-invoices and reports through its approved platform.",
    'From 1 September 2027, small and mid-sized companies must also send e-invoices and report transactions.',
    'Paper or PDF invoices stop being accepted, and penalties apply per invoice.',
    'Switch your invoicing to your approved platform, then confirm here.',
  ],
});
b.rule({
  id: 'FR.EMP.DPAE', layer: 3, area: 'employment', stage: 2, title: 'Pre-hiring declaration for each hire', sev: 'high', tier: 5, regulator: 'URSSAF', when: STAFF, review: true,
  src: [[S7, 'Pre-hiring declaration (DPAE) for each hire']],
  sat: told('fr_dpae'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} declares each hire before they start",
    "We don't have your confirmation that a pre-hiring declaration (DPAE) went to URSSAF before each employee started.",
    'Each hire is declared to URSSAF before the first day. The first one opens your employer account.',
    'Missing declarations can be fined per employee and count as undeclared work.',
    'Check a DPAE was sent for every employee, then confirm here.',
  ],
});
b.rule({
  id: 'FR.EMP.DSN', layer: 3, area: 'employment', stage: 2, title: 'Monthly social declaration and pension affiliation', sev: 'high', tier: 5, regulator: 'URSSAF', when: STAFF,
  src: [[S7, 'Monthly social declaration (DSN) and supplementary pension affiliation']],
  rec: { type: 'periodic', every_months: 1, monitoring: remind },
  sat: told('fr_dsn'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} files its monthly social declaration",
    "We don't have your confirmation that the monthly social declaration (DSN) is filed, with your supplementary pension affiliation.",
    'Employers file the DSN every month. It reports pay and contributions, and handles pension affiliation.',
    'Late or missing declarations bring penalties and can leave staff without pension rights.',
    'Check with your payroll provider that each month is filed, then confirm here.',
  ],
});
b.rule({
  id: 'FR.EMP.STAFF_REGISTER', layer: 3, area: 'employment', stage: 2, title: 'Single staff register', sev: 'medium', tier: 5, when: STAFF,
  src: [[S7, 'Single staff register (registre unique du personnel)']],
  sat: told('fr_staff_register'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps a staff register",
    "We don't have your confirmation that the company keeps a single staff register.",
    'Every employer keeps one from the first employee or intern, and keeps each entry 5 years after the person leaves.',
    'It is one of the first things a labour inspector asks for.',
    'Set up the register with everyone who has worked for you, then confirm here.',
  ],
});
b.rule({
  id: 'FR.EMP.RISK_ASSESSMENT', layer: 3, area: 'employment', stage: 2, title: 'Workplace risk assessment (DUERP)', sev: 'medium', tier: 5, when: STAFF,
  src: [[S7, 'Occupational risk assessment (DUERP)']],
  sat: any(held('fr_duerp'), told('fr_duerp')), evidence: ['Your risk assessment', 'Your confirmation'], action: 'attest',
  slot: { id: 'fr_duerp', label: 'Workplace risk assessment (DUERP)', reason: 'Every employer writes down the risks to its staff and what it does about them, and updates it each year from 11 staff.' },
  text: [
    "We can't see {company}'s workplace risk assessment",
    "You haven't added your workplace risk assessment (DUERP), or confirmed that you have one.",
    'Every employer writes down the risks to staff and how it reduces them.',
    'Not having one can be fined, and it counts against you after any workplace accident.',
    'Write the assessment, even a short one for office work, and add it here or confirm you have it.',
  ],
});
b.rule({
  id: 'FR.EMP.HEALTH_VISIT', layer: 3, area: 'employment', stage: 2, title: 'Health visit for each new hire', sev: 'low', tier: 5, when: STAFF,
  src: [[S7, 'Occupational health visit for each hire']],
  sat: told('fr_health_visits'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s new hires had their health visit",
    "We don't have your confirmation that each new hire had an occupational health visit.",
    'Each new employee sees the occupational health service after hiring.',
    'Missed visits come up in labour inspections and after accidents.',
    'Join an occupational health service and book a visit for each hire, then confirm here.',
  ],
});

// --- Section 8: sector licences --------------------------------------------------------------------

b.doc({
  id: 'FR.FIN.PAYMENT_AUTHORISATION', layer: 3, area: 'payments', stage: 2, title: 'Payment or e-money authorisation (ACPR)', noun: 'payment or e-money authorisation', sev: 'high', tier: 4, regulator: 'ACPR',
  when: yes('derived.moves_money'), review: true,
  src: [[S8, 'Payment or e-money institution authorisation (ACPR)']],
  slot: { id: 'fr_payment_authorisation', label: 'ACPR payment or e-money authorisation', reason: 'Holding or moving customers\' money needs an authorisation from the ACPR, or a licensed partner.', tier: 4 },
  fix: 'Add your ACPR authorisation, or the agreement with the licensed partner that covers you.',
});

// --- Section 9: website and consumer -------------------------------------------------------------

b.rule({
  id: 'FR.COM.LEGAL_NOTICE', layer: 4, area: 'website_information', stage: 2, title: 'Legal notice on your website (mentions légales)', sev: 'medium', tier: 1, when: yes('derived.has_website_or_app'),
  shared: euObligation('WEBSITE_IDENTITY'),
  src: [[S9, 'Website legal notice (mentions légales)'], [CORE, 'Website legal notice (mentions légales) published'], ['EU Section 3 —', 'Provider identity on the website: name, geographic address, email', MAPS.eu]],
  law: [['LCEN', 'Art 1-1']],
  // The scan sees a legal notice page and the company number on the site, not the rest of its content.
  sat: any(all(yes('web.policy.legal_notice_present'), yes('web.policy.registration_number_shown')), told('eu_website_identity')),
  evidence: ['Your website legal notice', 'Your confirmation'], action: 'fix_website',
  text: [
    "We can't see {company}'s legal notice (mentions légales)",
    "We couldn't find a legal notice (mentions légales) with your company number on your website, and you haven't confirmed you have one.",
    "It must show the company's name, registered office, phone, register number, share capital, the person responsible for publication, and the host's name, address and phone.",
    'A missing or incomplete legal notice can be fined, and customers look for it.',
    'Add a "Mentions légales" page with those details, link it from every page, then confirm here.',
  ],
});
b.rule({
  id: 'FR.CONSUMER.TERMINATION_FUNCTION', layer: 4, area: 'consumer_protection', stage: 3, title: 'Online cancellation button', sev: 'medium', tier: 5, when: all(yes('derived.consumer'), yes('derived.subscriptions')), review: true,
  src: [[S9, 'Online termination function ("résilier votre contrat")']],
  sat: told('fr_termination_function'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} lets consumers cancel online",
    "We don't have your confirmation that consumers who can sign up online can also cancel online, free, with an acknowledgement.",
    'Contracts that can be made online must be easy to end online, through a free and clearly labelled function.',
    'Consumer authorities check this, and making cancelling hard leads to complaints.',
    'Add a clearly labelled cancel function with an emailed acknowledgement, then confirm here.',
  ],
});

// --- Section 10: fundraising -----------------------------------------------------------------------

b.doc({
  id: 'FR.FUND.CAPITAL_INCREASE', layer: 5, area: 'fundraising', stage: 4, title: 'Shareholder decision on each capital increase', noun: 'capital increase decisions', sev: 'high', tier: 5, when: INVESTED,
  src: [[S10, 'Capital increase decided by the shareholders']],
  slot: { id: 'fr_capital_increase', label: 'Minutes of each capital increase decision', reason: 'Each capital increase is decided by the shareholders, by the majority the statuts or the law set.' },
  fix: 'Add the minutes of the shareholder decision behind each capital increase.',
});
b.doc({
  id: 'FR.FUND.PREFERENTIAL_RIGHTS', layer: 5, area: 'fundraising', stage: 4, title: 'Shareholders\' right to subscribe first (SAS)', noun: 'records of the right to subscribe first', sev: 'medium', tier: 5, when: all(INVESTED, SAS),
  src: [[S10, 'Preferential subscription right respected (SAS)']],
  slot: { id: 'fr_preferential_rights', label: 'Waivers or exercise records of the preferential subscription right', reason: 'A cash capital increase that ignores the shareholders\' right to subscribe first is not valid.' },
  fix: 'Add each shareholder\'s waiver, or the record of how the right was used, for each capital increase.',
});
b.doc({
  id: 'FR.FUND.CAPITAL_INCREASE_FILING', layer: 5, area: 'fundraising', stage: 4, title: 'Capital increase published and filed', noun: 'capital increase filing', sev: 'medium', tier: 4, when: INVESTED, review: true,
  src: [[S10, 'Legal notice published and change filed on the Guichet unique']],
  slot: { id: 'fr_capital_increase_filing', label: 'Legal notice and Guichet unique filing receipt for the capital increase', reason: 'A capital increase is published in a legal notice and filed with the updated statuts.', tier: 4 },
  fix: 'Add the legal notice certificate and the filing receipt for each capital increase.',
});
b.rule({
  id: 'FR.FUND.SAS_NO_PUBLIC_OFFER', layer: 5, area: 'fundraising', stage: 4, title: 'No public offer of shares by a SAS', sev: 'medium', tier: 5, when: all(INVESTED, SAS),
  src: [[S10, 'SAS makes no public offer outside the allowed exemptions']],
  sat: told('fr_sas_no_public_offer'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s share offers stayed private",
    "We don't have your confirmation that the company has made no public offer of its shares outside the allowed exemptions.",
    'A SAS may not offer its shares to the public, except under the narrow exemptions the law allows.',
    'An offer outside them can be cancelled, and the people behind it can be fined.',
    'Check each offer, including any crowdfunding, fits an allowed exemption, then confirm here.',
  ],
});

// --- Section 11: AI ----------------------------------------------------------------------------

b.doc({
  id: 'FR.AI.CNIL_GUIDANCE', layer: 6, area: 'data_governance', stage: 3, title: 'AI built on personal data, following the CNIL guidance', noun: 'record of how your AI follows the CNIL guidance', sev: 'low', tier: 5, regulator: CNIL, when: all(AI, PD),
  src: [[S11, 'AI built on personal data follows CNIL AI guidance']],
  slot: { id: 'fr_ai_cnil_guidance', label: 'AI and personal data record (legal basis, DPIA, information, rights)', reason: 'The CNIL has practical guidance on AI built with personal data. It is guidance, not law, but the CNIL reads your AI against it.' },
  fix: 'Write down the legal basis, your DPIA, how you inform people and handle their rights, and any scraping safeguards. Add it here.',
});
b.rule({
  id: 'FR.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI use disclosed to users', sev: 'low', tier: 1, when: AI,
  shared: 'ai_transparency',
  src: [[S11, 'AI use disclosed to users']],
  // The scan matches "AI", not the French "IA": a miss is "to check".
  sat: any(yes('web.policy.ai_disclosure_found'), held('fr_ai_transparency')), verify: no('web.policy.ai_disclosure_found'),
  evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'fr_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI.' },
  text: [
    "We can't see where {company} tells people it uses AI",
    "We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.",
    'People must be told when they are dealing with an AI system, and AI-made content has to be marked.',
    'Enterprise customers and investors are starting to ask, and you would have no answer ready.',
    'Say on your website where your product uses AI, or add your transparency records here.',
  ],
});

export const fr = b.build();

/** International rules the French pack asks for in its own way. */
export const FR_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  ...euIntlEquivalents('FR', true, OMIT),
  'INTL.CORP.CONSTITUTION': ['FR.CORP.STATUTS'],
  'INTL.CORP.RESOLUTIONS': ['FR.CORP.DECISIONS_REGISTER'],
};

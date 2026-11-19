import { all, any, held, MAPS, no, packBuilder, remind, told, yes } from './helper.js';

/**
 * South Africa (private company, (Pty) Ltd, Companies Act 71 of 2008). Draft, version 0.1.0:
 * every rule waits for a South African lawyer. Encoded from
 * docs/knowledge/vero-scan-south-africa-rule-pack-map.md; the items left out, and why, are listed
 * at the end of that map ("Not encoded"). A rule citing a [verify] line is needs_review, so it can
 * only ever say "a person needs to check this".
 *
 * No South African register is connected: CIPC's Companies API sits behind sign-in and a
 * subscription, its documentation could not be read, and its eServices terms bar automated
 * searching (map note 1 and 2). So registration, directors and filings are documents, and the
 * Information Officer's registration is proved by the Regulator's certificate.
 */
const b = packBuilder('ZA', MAPS.southAfrica, { name: 'South Africa', version: '0.1.0' });

const CIPC = 'CIPC';
const REGULATOR = 'Information Regulator';
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

const PD = yes('derived.personal_data');
const STAFF = yes('derived.employees');
const CONSUMER = yes('derived.consumer');
const SITE = yes('derived.has_website_or_app');
const ONLINE_SALES = all(SITE, yes('derived.takes_payments'));
const INVESTED = yes('derived.invested');
const AI = yes('derived.uses_ai');
/** A page the scan looks for: on a site in a language it can't read, not finding it is "to check". */
const pageCheck = (fact: string) => all(no(fact), no('web.policy.language_supported'));

const CERTIFICATE = {
  id: 'za_cipc_certificate', label: 'CIPC registration certificate (and latest company disclosure)', tier: 4 as const,
  reason: "The CIPC register isn't connected, so the certificate shows the company is registered, its name and number, and the disclosure shows its directors.",
};

// --- Section 1: register and status -----------------------------------------------------------------

b.doc({
  id: 'ZA.CORP.CIPC_REGISTRATION', layer: 1, area: 'standing', stage: 2, title: 'Company registered with CIPC', noun: 'CIPC registration certificate', sev: 'high', tier: 4, regulator: CIPC,
  src: [[S1, 'Company registered with CIPC and gives its name or registration number on demand'], [S1, 'Private company name ends with "Proprietary Limited" or "(Pty) Ltd."']],
  slot: CERTIFICATE,
  why: 'The certificate shows the company is registered with CIPC under a name ending in "(Pty) Ltd", with its registration number.',
  ifLeft: "It's the first thing a bank, investor or buyer asks for.",
  fix: 'Download the registration certificate and a current company disclosure from CIPC, and add them here.',
});
b.rule({
  id: 'ZA.CORP.REGISTERED_OFFICE', layer: 1, area: 'filings', stage: 2, title: 'Registered office in South Africa', sev: 'medium', tier: 5, regulator: CIPC,
  src: [[S1, 'Registered office continuously maintained in South Africa']],
  sat: told('za_registered_office'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} keeps a registered office in South Africa",
    "We don't have your confirmation that the company keeps a registered office in South Africa, and that CIPC has the current address.",
    'Every company keeps a registered office in South Africa. A change is filed with CIPC and takes effect at the earliest 5 business days after filing.',
    'Official notices and legal papers go there, and a stale address means you miss them.',
    'Check the address on your CIPC record, file a change if it is out of date, then confirm here.',
  ],
});
b.rule({
  id: 'ZA.CORP.STANDING', layer: 1, area: 'standing', stage: 2, title: 'Not in business rescue or liquidation', sev: 'high', tier: 5, regulator: CIPC,
  src: [[S1, 'Business rescue begun by board resolution']],
  sat: told('za_not_in_rescue'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} is not in business rescue or liquidation",
    "We don't have your confirmation that the company is not in business rescue or being wound up. The CIPC register isn't connected, so we can't check.",
    'A board can start business rescue by filing a resolution when the company is in financial distress.',
    'Banks, investors and customers will ask, and contracts often end on rescue or liquidation.',
    'Check your status on the CIPC record, then confirm here.',
  ],
});

// --- Section 2: MOI, securities register and beneficial owners -----------------------------------------

b.doc({
  id: 'ZA.CORP.MOI', layer: 1, area: 'governance', stage: 2, title: 'Memorandum of Incorporation', noun: 'Memorandum of Incorporation', sev: 'high', tier: 4, regulator: CIPC,
  src: [[S2, 'Memorandum of Incorporation consistent with the Act']],
  slot: { id: 'za_moi', label: 'Memorandum of Incorporation (MOI), current version', reason: 'The MOI is the company\'s constitution. Any part of it that breaks the Companies Act is void.', tier: 4 },
  ifLeft: 'Banks and investors ask for it, and a gap in your company records can hold up a round.',
  fix: 'Add the current MOI, with every amendment filed with CIPC.',
});
b.doc({
  id: 'ZA.CORP.SECURITIES_REGISTER', layer: 1, area: 'shareholders', stage: 2, title: 'Securities register', noun: 'securities register', sev: 'high', tier: 4,
  src: [[S2, 'Securities register established in the prescribed form']],
  slot: { id: 'za_securities_register', label: 'Securities register (share register)', reason: 'It records every shareholder and the shares issued to each, as soon as practicable after an issue. It is not public, so we need yours.', tier: 4 },
  ifLeft: 'It is the proof of who owns the company, and investors check it against every share issue.',
  fix: 'Bring the register up to date with every issue and transfer, and add it here.',
});
b.rule({
  id: 'ZA.CORP.BO_IN_REGISTER', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial owners recorded in the securities register', sev: 'medium', tier: 5,
  src: [[S2, 'Natural-person beneficial owners recorded in the securities register']],
  sat: told('za_bo_in_register'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} records its beneficial owners",
    "We don't have your confirmation that the securities register records the people who ultimately own or control the company, and is updated after each change.",
    'A private company records the prescribed details of its beneficial owners in its securities register, and keeps them current.',
    'The same details go to CIPC, and a mismatch stops your annual return.',
    'Add the beneficial owners to the register, then confirm here.',
  ],
});
b.doc({
  id: 'ZA.CORP.BO_FILING', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial ownership filed with CIPC', noun: 'CIPC beneficial ownership filing confirmation', sev: 'high', tier: 4, regulator: CIPC,
  src: [[S2, 'Beneficial ownership filed with CIPC within 10 business days of incorporation'], [S3, 'BO declaration must be current before the annual return can be filed']],
  params: { business_days_after_incorporation: 10 },
  slot: { id: 'za_bo_filing', label: 'CIPC beneficial ownership filing confirmation', reason: 'Companies file their beneficial owners with CIPC, within 10 business days for companies set up since 24 May 2023. CIPC blocks the annual return until it is current.', tier: 4 },
  ifLeft: 'CIPC will not accept your annual return without it, and banks ask for it when they onboard you.',
  fix: 'File your beneficial ownership on the CIPC portal, and add the confirmation here.',
});
b.rule({
  id: 'ZA.CORP.BO_CHANGES', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial-owner changes filed within 10 business days', sev: 'medium', tier: 5, regulator: CIPC,
  src: [[S2, 'Amended BO declaration within 10 business days of a change']],
  params: { business_days_after_change: 10 },
  sat: told('za_bo_changes'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s beneficial-owner changes reach CIPC",
    "We don't have your confirmation that every change in who owns or controls the company was filed with CIPC.",
    'An amended beneficial ownership declaration goes to CIPC within 10 business days of a change.',
    'An out-of-date declaration blocks your annual return and misleads banks.',
    'File any change on the CIPC portal after each change in ownership, then confirm here.',
  ],
});

// --- Section 3: financial statements and annual return ---------------------------------------------------

b.rule({
  id: 'ZA.CORP.AFS', layer: 1, area: 'filings', stage: 3, title: 'Annual financial statements within 6 months', sev: 'medium', tier: 4,
  src: [[S3, 'Annual financial statements prepared within 6 months of year end'], [S3, 'Board approval and director signature on the AFS']],
  rec: { type: 'after_year_end', months: 6, monitoring: remind },
  sat: any(held('za_signed_afs'), told('za_afs_prepared')), evidence: ['Signed annual financial statements', 'Your confirmation'], action: 'upload',
  slot: { id: 'za_signed_afs', label: 'Signed annual financial statements, with the directors\' report', reason: 'The statements are prepared within 6 months of the year end; the board approves them and a director signs.', tier: 4 },
  text: [
    "We don't have {company}'s latest annual financial statements",
    "You haven't added last year's signed financial statements, or confirmed they were prepared within 6 months of the year end.",
    'Every company prepares annual financial statements, with a directors\' report, within 6 months of its year end. The board approves them and a director signs.',
    'They go with your CIPC annual return, and banks and investors ask for them.',
    'Prepare and sign the statements, and add them here.',
  ],
});
b.doc({
  id: 'ZA.CORP.ANNUAL_RETURN', layer: 1, area: 'filings', stage: 2, title: 'CIPC annual return filed', noun: 'latest CIPC annual return filing certificate', sev: 'high', tier: 4, regulator: CIPC, penalty: 'moderate',
  src: [
    [S3, 'CIPC annual return within 30 business days after the incorporation anniversary'], [S3, 'Financial accountability supplement or AFS filed with the annual return'],
    [S1, 'Deregistration risk after two years of missing annual returns'],
  ],
  params: { business_days_after_anniversary: 30 },
  slot: { id: 'za_annual_return', label: 'Latest CIPC annual return filing certificate', reason: 'The annual return is filed within 30 business days after each anniversary of incorporation, with the financial statements or the financial accountability supplement.', tier: 4 },
  why: 'Every company files an annual return with CIPC within 30 business days after its incorporation anniversary. Two or more years missed and CIPC can deregister the company.',
  ifLeft: 'Late returns cost penalties, and a deregistered company loses its legal existence.',
  fix: 'File the annual return on the CIPC portal, and add the filing certificate here.',
});
b.rule({
  id: 'ZA.CORP.COMPLIANCE_PERSON', layer: 1, area: 'governance', stage: 2, title: 'Person responsible for Companies Act compliance named', sev: 'low', tier: 5,
  src: [[S3, 'Compliance person designated in each annual return']],
  sat: told('za_compliance_person'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed who is responsible for {company}'s Companies Act compliance",
    "We don't have your confirmation that each annual return names a director, employee or other person responsible for the company's compliance.",
    'Each annual return designates the person responsible for compliance with the filing duties.',
    'Without a named person, filings slip and nobody is accountable for them.',
    'Name the person on your next annual return, then confirm here.',
  ],
});

// --- Section 4: directors and audit ----------------------------------------------------------------------

b.doc({
  id: 'ZA.CORP.DIRECTORS', layer: 1, area: 'officers', stage: 2, title: 'At least one director on record', noun: 'CIPC company disclosure showing the directors', sev: 'high', tier: 4, regulator: CIPC,
  src: [[S4, 'Board of at least one director']],
  slot: CERTIFICATE,
  why: 'A private company has at least one director, or more if its MOI says so, and CIPC records them.',
  ifLeft: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  fix: 'Download a current company disclosure from CIPC, check the directors are right, and add it here.',
});
b.rule({
  id: 'ZA.CORP.AUDIT_OR_REVIEW', layer: 1, area: 'filings', stage: 3, title: 'Audit or independent review, unless owner-managed', sev: 'medium', tier: 4,
  src: [[S4, 'Audit or independent review of the AFS, unless owner-managed']],
  sat: any(held('za_audit_or_review'), told('za_owner_managed')), evidence: ["Auditor's or independent reviewer's report", 'Your confirmation'], action: 'upload',
  slot: { id: 'za_audit_or_review', label: "Auditor's report or independent review report", reason: 'Most private companies have their statements audited or independently reviewed. Where every shareholder is also a director, neither may be needed.', tier: 4 },
  text: [
    "We don't have {company}'s audit or independent review report",
    "You haven't added an audit or independent review report, or confirmed that every shareholder is also a director.",
    'A private company has its financial statements audited, or independently reviewed, unless every shareholder is also a director and no rule requires an audit.',
    'Statements without the report they need are incomplete, and banks and investors ask for it.',
    'Add the report, or confirm here that every shareholder is a director.',
  ],
});

// --- Section 5: intellectual property --------------------------------------------------------------------

b.rule({
  id: 'ZA.IP.EMPLOYEE_WORKS', layer: 2, area: 'ip_ownership', stage: 2, title: 'Work made by employees belongs to the company', sev: 'medium', tier: 5, when: STAFF,
  src: [[S5, 'Works made by employees in the course of employment belong to the employer']],
  sat: any(held('za_employee_ip_clause'), told('za_employee_ip_clause')), evidence: ['Employment contract IP clause', 'Your confirmation'], action: 'attest',
  slot: { id: 'za_employee_ip_clause', label: 'Employment contract IP clause', reason: 'Work made in the course of employment belongs to the employer, unless a contract says otherwise. A clause makes it clear.' },
  text: [
    "We can't see how {company}'s employment contracts handle IP",
    "You haven't added an employment contract IP clause, or confirmed that your contracts leave the work with the company.",
    'Copyright in work made in the course of employment belongs to the employer, unless the contract excludes it.',
    'A contract that gives it back leaves the product with the employee, and investors check this.',
    'Check your contracts keep IP with the company. Add the clause here or confirm.',
  ],
});
b.doc({
  id: 'ZA.IP.ASSIGNMENT', layer: 2, area: 'ip_ownership', stage: 1, title: 'IP assigned to the company in writing', noun: 'signed IP assignments', sev: 'high', tier: 4,
  src: [[S5, 'Copyright assignment only valid in writing, signed by the assignor']],
  slot: { id: 'za_ip_assignment', label: 'Signed IP assignment agreements (from the people who started the company and contractors)', reason: 'A copyright assignment is valid only in writing, signed by the person assigning it.', tier: 4 },
  why: 'Work by the people who started the company, or by contractors, passes to the company only by a written assignment they sign.',
  fix: 'Have each person who wrote code or content for the company sign an IP assignment, and add the signed copies here.',
});
b.rule({
  id: 'ZA.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'South African trade mark', sev: 'medium', tier: 4, regulator: CIPC,
  src: [[S5, 'Trade mark registration lasts 10 years, renewable for 10-year periods']],
  rec: { type: 'every_years', from_fact: 'vault.za_trademark.dated', years: 10, monitoring: remind },
  sat: held('za_trademark'), evidence: ['Trade mark certificate'], action: 'file',
  slot: { id: 'za_trademark', label: 'South African trade mark registration certificate', reason: 'A registration lasts 10 years and is renewed for 10 more. We read your certificate for its dates.', tier: 4 },
  text: [
    "We can't see a South African trade mark for {company}",
    "You haven't added a South African trade mark certificate.",
    "Without one, someone else could register a name close to yours, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing today.',
    'File your brand at the trade marks office, or add your certificate here.',
  ],
});

// --- Section 6: POPIA and PAIA ---------------------------------------------------------------------------

b.rule({
  id: 'ZA.DP.PRIVACY_NOTICE', layer: 3, area: 'data_protection', stage: 2, title: 'Privacy notice (POPIA)', sev: 'high', tier: 1, regulator: REGULATOR, when: SITE,
  src: [[S6, 'Privacy notice given when collecting personal information']], law: [['POPIA', 's 18']],
  sat: yes('web.policy.privacy_notice_found'), verify: pageCheck('web.policy.privacy_notice_found'),
  evidence: ['Your published privacy notice'], action: 'fix_website',
  text: [
    "We can't find a privacy notice on {company}'s website",
    "We looked at your website and couldn't find a privacy notice.",
    'People must be told who you are, what you collect and why, who gets it, whether it leaves South Africa, and their rights.',
    "It's public, so customers, partners and the Information Regulator can all see the gap.",
    'Publish a notice with those details and link it from every page.',
  ],
});
b.rule({
  id: 'ZA.DP.REGULATOR_NAMED', layer: 3, area: 'data_protection', stage: 2, title: 'Privacy notice names the Information Regulator', sev: 'low', tier: 1, regulator: REGULATOR, when: all(SITE, PD),
  src: [[S6, 'Complaint route to the Information Regulator named in the notice']], law: [['POPIA', 's 18(1)(h)(v)']],
  sat: any(yes('web.policy.dpa_named'), told('za_notice_names_regulator')), verify: all(no('web.policy.dpa_named'), no('web.policy.language_supported')),
  evidence: ['Your published privacy notice', 'Your confirmation'], action: 'fix_website',
  text: [
    "{company}'s privacy notice doesn't say people can complain to the Information Regulator",
    "We couldn't find the Information Regulator named in your privacy notice, and you haven't confirmed it is there.",
    'People must be told they can complain to the Information Regulator, with its contact details.',
    'A notice without it is incomplete, and anyone who reads it can see that.',
    'Add a line naming the Information Regulator and how to reach it, then confirm here.',
  ],
});
b.doc({
  id: 'ZA.DP.INFORMATION_OFFICER', layer: 3, area: 'data_protection', stage: 2, title: 'Information Officer registered with the Regulator', noun: 'Information Officer registration certificate', sev: 'high', tier: 4, regulator: REGULATOR,
  src: [[S6, 'Information Officer registered with the Regulator before taking up duties']], law: [['POPIA', 's 55(2)']],
  slot: { id: 'za_information_officer', label: 'Information Regulator registration certificate for your Information Officer', reason: 'The head of the company is its Information Officer, and may act only once registered with the Information Regulator. There is no public list to check, so we need your certificate.', tier: 4 },
  why: 'Every company has an Information Officer, normally its head, who may take up the role only once registered with the Information Regulator. Registration is not optional.',
  ifLeft: 'The Regulator asks for it first in any complaint, and customers ask for it in due diligence.',
  fix: 'Register your Information Officer on the Regulator\'s eServices portal, and add the certificate here.',
});
b.doc({
  id: 'ZA.DP.PAIA_MANUAL', layer: 3, area: 'data_protection', stage: 2, title: 'PAIA manual published', noun: 'PAIA manual', sev: 'medium', tier: 4, regulator: REGULATOR,
  src: [[S6, 'PAIA manual compiled, kept updated and published on the website'], [S6, 'Small private companies no longer exempt from the PAIA manual since 1 January 2022']],
  slot: { id: 'za_paia_manual', label: 'PAIA manual', reason: 'Every private body has had to keep a PAIA manual since 1 January 2022, with its contact details and how it processes personal information, published on its website.', tier: 4 },
  fix: 'Write the manual from the Regulator\'s template, publish it on your website, and add it here.',
});
b.doc({
  id: 'ZA.DP.OPERATOR_AGREEMENTS', layer: 3, area: 'data_protection', stage: 2, title: 'Written contracts with operators', noun: 'operator agreements', sev: 'medium', tier: 5, regulator: REGULATOR, when: all(PD, yes('derived.has_processors')),
  src: [[S6, 'Security safeguards, with a written contract for every operator']], law: [['POPIA', 'ss 19, 21']],
  slot: { id: 'za_operator_agreements', label: 'Operator agreements (data processing terms)', reason: 'Each vendor that handles personal information for you (an operator) is bound by a written contract to keep it secure.' },
  fix: 'Collect the data processing terms from each vendor that handles personal information for you, and add them here.',
});
b.doc({
  id: 'ZA.DP.BREACH', layer: 3, area: 'data_protection', stage: 2, title: 'Security compromise plan', noun: 'security compromise plan', sev: 'medium', tier: 5, regulator: REGULATOR, when: PD,
  src: [[S6, 'Breach (security compromise) notified to the Regulator and data subjects']], law: [['POPIA', 's 22']],
  slot: { id: 'za_breach_plan', label: 'Security compromise response plan and log', reason: 'A compromise is reported to the Regulator and the people affected as soon as reasonably possible, so you need to know who does what first.' },
  fix: 'Write a short plan saying who decides, who tells the Regulator and the people affected, and how fast, keep a log, and add both here.',
});
b.rule({
  id: 'ZA.DP.CHILDREN', layer: 3, area: 'data_protection', stage: 2, title: "Consent for children's information", sev: 'medium', tier: 5, regulator: REGULATOR, when: all(PD, yes('answers.users_under_18')),
  src: [[S6, "Children's information needs prior consent of a competent person"]], law: [['POPIA', 'ss 34, 35']],
  sat: told('za_children_consent'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed how {company} gets consent for children's information",
    "We don't have your confirmation of how you get a parent's or guardian's consent before using information about children.",
    'Information about anyone under 18 needs the prior consent of a parent or guardian, unless another ground in the Act applies.',
    "Children's information is watched closely, and the Regulator can act on it.",
    'Set up an age check and a parent consent step, then confirm here.',
  ],
});
b.rule({
  id: 'ZA.DP.DIRECT_MARKETING', layer: 3, area: 'marketing', stage: 2, title: 'Consent and opt-out for electronic marketing', sev: 'medium', tier: 5, regulator: REGULATOR, when: yes('derived.sends_marketing'),
  src: [[S6, 'Electronic direct marketing only with consent or to existing customers'], [S9, 'Unsolicited commercial email offers an unsubscribe and the data source'], [S9, 'Procedure to stop direct marketing on demand']],
  law: [['POPIA', 's 69'], ['ECTA', 's 45'], ['Consumer Protection Act', 's 11']],
  sat: told('za_direct_marketing'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s marketing messages meet the consent rules",
    "We don't have your confirmation that every marketing email or SMS has consent, or goes to an existing customer about similar products, and carries a working opt-out.",
    'Electronic marketing needs consent, asked for once, or an existing customer relationship. Each message names the sender and gives a way to opt out, and opt-outs are honoured.',
    'People who did not agree can complain to the Regulator, and sending after an opt-out is an offence.',
    'Check how you collect consent and handle opt-outs, keep records, then confirm here.',
  ],
});
b.rule({
  id: 'ZA.DP.TRANSFERS', layer: 3, area: 'data_protection', stage: 2, title: 'Lawful basis for information sent abroad', sev: 'medium', tier: 5, regulator: REGULATOR, when: all(PD, yes('derived.data_outside_home')),
  src: [[S6, 'Transfers outside South Africa on a lawful basis']], law: [['POPIA', 's 72']],
  sat: told('za_transfers'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s basis for sending personal information abroad",
    'You told us personal information is held outside South Africa, and we have no confirmation of the basis for sending it there.',
    'Personal information may leave South Africa only to a place with adequate protection, under binding rules or an agreement, with consent, or on another listed ground.',
    'Transfers without a basis are a breach of POPIA, and customers ask about them.',
    'Check each provider abroad has a contract with data protection terms, then confirm here.',
  ],
});

// --- Section 7: tax and employer duties ------------------------------------------------------------------

b.rule({
  id: 'ZA.TAX.INCOME_TAX', layer: 3, area: 'tax', stage: 2, title: 'Income tax reference number', sev: 'medium', tier: 5, regulator: 'SARS',
  src: [[S7, 'Income tax registration happens automatically through CIPC']],
  sat: told('za_income_tax_number'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} has its income tax reference number",
    "We don't have your confirmation that the company has its SARS income tax reference number.",
    'Companies registered with CIPC are registered for income tax through a link between CIPC and SARS, with no separate application.',
    'Without the number you cannot file returns or get a tax clearance, which banks and customers ask for.',
    'Check the number on SARS eFiling, then confirm here.',
  ],
});
b.rule({
  id: 'ZA.TAX.PROVISIONAL', layer: 3, area: 'tax', stage: 3, title: 'Provisional tax twice a year', sev: 'medium', tier: 5, regulator: 'SARS',
  src: [[S7, 'Provisional tax returns twice a year']],
  sat: told('za_provisional_tax'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} files its provisional tax",
    "We don't have your confirmation that provisional tax returns are filed and paid on time.",
    'A company files a provisional tax return six months into its year and another at year end, with payment.',
    'Late or low payments bring penalties and interest.',
    'Check with your accountant that both returns were filed and paid, then confirm here.',
  ],
});
b.rule({
  id: 'ZA.TAX.VAT_REGISTRATION', layer: 3, area: 'tax', stage: 3, title: 'VAT registration over the compulsory threshold', sev: 'medium', tier: 5, regulator: 'SARS', review: true,
  // The threshold SARS applies is not yet promulgated (map Section 7, a [verify] note): "to check" only.
  src: [[S7, 'VAT registration once taxable supplies pass R2.3 million a year'], [S7, 'Legal basis of the R2.3 million VAT figure']],
  sat: any(told('za_vat_registered'), told('za_vat_below_threshold')), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed whether {company} must register for VAT",
    "We don't have your confirmation that the company is registered for VAT, or that its taxable sales are below the compulsory threshold.",
    'A company registers for VAT once its taxable sales in 12 months pass the compulsory threshold SARS applies.',
    'VAT not charged is still owed, with penalties and interest.',
    'Check your taxable sales against the current SARS threshold, register on eFiling if you are over it, then confirm here.',
  ],
});
b.doc({
  id: 'ZA.EMP.EMPLOYER_REGISTRATION', layer: 3, area: 'employment', stage: 2, title: 'Registered as an employer with SARS', noun: 'SARS employer registration', sev: 'high', tier: 4, regulator: 'SARS', when: STAFF,
  src: [[S7, "Employer registration for employees' tax within 21 business days"]],
  params: { business_days_to_register: 21 },
  slot: { id: 'za_employer_registration', label: 'SARS employer registration (PAYE reference)', reason: 'A company registers as an employer with SARS within 21 business days of taking on staff, unless none of them pays tax.', tier: 4 },
  fix: 'Register for PAYE on SARS eFiling, and add the registration here.',
});
b.rule({
  id: 'ZA.EMP.MONTHLY_PAYROLL', layer: 3, area: 'employment', stage: 2, title: 'Monthly PAYE, SDL and UIF paid (EMP201)', sev: 'high', tier: 5, regulator: 'SARS', when: STAFF,
  src: [[S7, 'Monthly EMP201 payment within 7 days after month end'], [S7, 'UIF contributions registered with SARS or the UI Commissioner'], [S7, 'Skills Development Levy registration above R500,000 payroll']],
  params: { days_after_month_end: 7 },
  sat: told('za_emp201'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} pays its monthly payroll taxes",
    "We don't have your confirmation that employees' tax, the skills levy where it applies, and UIF are declared and paid each month.",
    'Employers file the EMP201 and pay within 7 days after each month end. The skills levy applies once payroll is expected to pass R500,000 a year.',
    'Late payments bring penalties and interest, and staff lose UIF cover.',
    'Check with your payroll provider that every month is filed and paid, then confirm here.',
  ],
});
b.doc({
  id: 'ZA.EMP.WRITTEN_PARTICULARS', layer: 3, area: 'employment', stage: 2, title: 'Written particulars of employment', noun: 'employment contracts with written particulars', sev: 'medium', tier: 4, when: STAFF,
  src: [[S7, 'Written particulars of employment given at the start']], law: [['Basic Conditions of Employment Act', 's 29']],
  slot: { id: 'za_employment_particulars', label: 'Employment contracts or written particulars', reason: 'Each employee gets written particulars of their job when they start, revised when they change, and kept for 3 years after they leave.', tier: 4 },
  fix: 'Give every employee written particulars, keep them, and add a sample here.',
});
b.rule({
  id: 'ZA.EMP.MINIMUM_WAGE', layer: 3, area: 'employment', stage: 2, title: 'National minimum wage paid', sev: 'high', tier: 5, when: STAFF, from: '2026-03-01',
  src: [[S7, 'National minimum wage of R30.23 per ordinary hour from 1 March 2026']],
  params: { zar_per_hour: 30.23 },
  sat: told('za_minimum_wage'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company} pays at least the national minimum wage",
    "We don't have your confirmation that every employee is paid at least the national minimum wage.",
    'The national minimum wage is R30.23 for each ordinary hour worked from 1 March 2026.',
    'Underpayment has to be paid back, and labour inspectors can act on it.',
    'Check the hourly pay of everyone on payroll, then confirm here.',
  ],
});

// --- Section 9: online sales and consumers ----------------------------------------------------------------

b.rule({
  id: 'ZA.COM.SUPPLIER_DETAILS', layer: 4, area: 'website_information', stage: 2, title: 'Who you are, on your website (ECTA)', sev: 'medium', tier: 1, when: ONLINE_SALES,
  src: [[S9, 'Supplier details on the website where goods or services are sold']], law: [['ECTA', 's 43(1)']],
  sat: any(all(yes('web.policy.legal_notice_present'), yes('web.policy.registration_number_shown')), told('za_supplier_details')),
  // South African sites often put these details in a footer, not a legal notice page: only a read site with a page and no number can fail.
  verify: any(no('web.policy.legal_notice_present'), no('web.policy.language_supported')),
  evidence: ['Your website', 'Your confirmation'], action: 'fix_website',
  text: [
    "We can't see {company}'s supplier details on its website",
    "We found a legal page on your website but no company registration number, and you haven't confirmed the details are there.",
    'A business selling online shows its full name and legal status, physical address, phone, email, registration number and where it is registered.',
    'Customers can cancel within 14 days if the details are missing.',
    'Add the details to a legal or about page linked from every page, then confirm here.',
  ],
});
b.rule({
  id: 'ZA.CONSUMER.SALE_INFORMATION', layer: 4, area: 'consumer_protection', stage: 3, title: 'Price, terms and returns policy on your website', sev: 'medium', tier: 1, when: ONLINE_SALES,
  src: [[S9, 'Price, payment, delivery and policy information on the website']], law: [['ECTA', 's 43(1)']],
  sat: any(all(yes('web.policy.terms_found'), yes('web.policy.refund_policy_found')), told('za_sale_information')),
  verify: no('web.policy.language_supported'),
  evidence: ['Your published terms and returns policy', 'Your confirmation'], action: 'fix_website',
  text: [
    "We can't find {company}'s terms and returns policy on its website",
    "We couldn't find both terms and a returns or refund policy on your website, and you haven't confirmed where customers see them.",
    'Before an online sale, customers see the full price, how to pay, delivery times, the terms, the returns policy and their cooling-off rights.',
    'Customers can cancel within 14 days if the information is missing.',
    'Publish your terms and returns policy and link them from checkout, or confirm here where customers see them.',
  ],
});
b.rule({
  id: 'ZA.CONSUMER.COOLING_OFF', layer: 4, area: 'consumer_protection', stage: 3, title: 'Seven-day cooling-off for online sales', sev: 'medium', tier: 1, when: all(CONSUMER, ONLINE_SALES),
  src: [[S9, 'Seven-day cooling-off for online sales']], law: [['ECTA', 's 44']],
  params: { days: 7, refund_days: 30 },
  sat: any(yes('web.policy.refund_policy_found'), told('za_cooling_off')), verify: pageCheck('web.policy.refund_policy_found'),
  evidence: ['Your published refund or cancellation page', 'Your confirmation'], action: 'fix_website',
  text: [
    "We can't see where {company} explains the cooling-off right",
    "We couldn't find a refund or cancellation page on your website, and you haven't confirmed how customers are told about cooling off.",
    'Consumers buying online can cancel without reason within 7 days, paying only the direct cost of return, and are refunded within 30 days.',
    'Refusing a valid cancellation leads to complaints and disputes.',
    'Publish your cancellation and refund terms and link them from checkout, or confirm here how you tell people.',
  ],
});
b.rule({
  id: 'ZA.CONSUMER.PLAIN_LANGUAGE', layer: 4, area: 'consumer_protection', stage: 3, title: 'Consumer documents in plain language', sev: 'low', tier: 5, when: CONSUMER,
  src: [[S9, 'Consumer documents in plain language']], law: [['Consumer Protection Act', 's 22']],
  sat: told('za_plain_language'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s consumer documents are in plain language",
    "We don't have your confirmation that your terms and notices for consumers are written in plain language.",
    'Documents for consumers must be in plain language that an ordinary consumer can understand.',
    'Unclear terms can be read against you in a dispute.',
    'Read your consumer terms as a customer would, simplify them, then confirm here.',
  ],
});
b.rule({
  id: 'ZA.COM.NUMBER_ON_INVOICES', layer: 4, area: 'website_information', stage: 2, title: 'Name and registration number on invoices and notices', sev: 'low', tier: 5,
  src: [[S9, 'Name and registration number on electronic notices and invoices']], law: [['Companies Act', 's 32(4)']],
  sat: told('za_number_on_invoices'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s invoices show its name and registration number",
    "We don't have your confirmation that your invoices, receipts, letters and electronic notices show the company's name and registration number.",
    'Every notice and official publication, electronic ones included, and every letter, invoice and receipt, carries the name and registration number.',
    'Leaving them off is an offence, and it makes the company look less established.',
    'Add both to your invoice, email and letter templates, then confirm here.',
  ],
});

// --- Section 10: fundraising ------------------------------------------------------------------------------

b.doc({
  id: 'ZA.FUND.SHARE_ISSUE', layer: 5, area: 'fundraising', stage: 4, title: 'Board resolution for each share issue', noun: 'board resolution for the share issue', sev: 'high', tier: 4, when: INVESTED,
  src: [[S10, 'Share issue resolved by the board within MOI-authorised shares']], law: [['Companies Act', 's 38']],
  slot: { id: 'za_share_issue_resolution', label: 'Board resolution for each share issue', reason: 'The board issues shares only within the number the MOI authorises. Shares issued beyond it are void unless authorised in time.', tier: 4 },
  fix: 'Add the board resolution behind each share issue, and check the MOI authorised enough shares.',
});
b.rule({
  id: 'ZA.FUND.REGISTER_UPDATED', layer: 5, area: 'fundraising', stage: 4, title: 'Securities register updated after each issue', sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'Register of securities updated after the issue']],
  sat: told('za_register_updated'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s securities register shows its new shareholders",
    "We don't have your confirmation that the securities register was updated after each share issue.",
    'New shares and their holders are entered in the securities register as soon as practicable after each issue.',
    'Investors check the register against every share issue, and gaps hold up a round.',
    'Update the register after each issue, then confirm here.',
  ],
});
b.rule({
  id: 'ZA.FUND.FINANCIAL_ASSISTANCE', layer: 5, area: 'fundraising', stage: 4, title: 'Special resolution for financial assistance', sev: 'medium', tier: 4, when: INVESTED,
  src: [[S10, 'Financial assistance for subscribing securities needs a special resolution'], [S10, 'Loans and other assistance to directors and related parties (s 45)']],
  sat: any(held('za_financial_assistance'), told('za_no_financial_assistance')), evidence: ['Special resolution', 'Your confirmation'], action: 'attest',
  slot: { id: 'za_financial_assistance', label: 'Special resolution approving financial assistance', reason: 'Lending to, or guaranteeing, people buying shares, or directors and related companies, needs a special resolution and a solvency test by the board.', tier: 4 },
  text: [
    "You haven't confirmed how {company} approved any financial assistance",
    "We don't have the special resolution for any loan or guarantee given to people buying shares, directors or related companies, or your confirmation that there was none.",
    'Financial assistance for buying shares, and to directors and related companies, needs a special resolution and a board finding on solvency and fair terms.',
    'Assistance given without them can be void, and directors can be liable.',
    'Add the special resolution, or confirm here that the company gave no such assistance.',
  ],
});
b.rule({
  id: 'ZA.FUND.NO_PUBLIC_OFFER', layer: 5, area: 'fundraising', stage: 4, title: 'Share offers within the exemptions from a prospectus', sev: 'medium', tier: 5, when: INVESTED,
  src: [[S10, 'Offer of unlisted securities to the public needs a registered prospectus']], law: [['Companies Act', 'ss 96, 99']],
  sat: told('za_no_public_offer'), evidence: ['Your confirmation, with your investor list'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s share offers needed no prospectus",
    "We don't have your confirmation that each offer of shares went only to people the Act excludes from a public offer, such as professional investors or existing shareholders.",
    'An offer of unlisted shares to the public needs a registered prospectus. Offers to the groups the Act lists are not offers to the public.',
    'An offer made without one can be stopped, and investors can ask for their money back.',
    'Keep a list of who each offer went to, check it fits an exclusion, then confirm here.',
  ],
});

// --- Section 11: AI -------------------------------------------------------------------------------------

b.rule({
  id: 'ZA.AI.AUTOMATED_DECISIONS', layer: 6, area: 'data_governance', stage: 3, title: 'Automated decisions about people', sev: 'medium', tier: 5, regulator: REGULATOR, when: all(AI, PD, yes('answers.automated_decisions')),
  src: [[S11, 'Automated decisions with legal or substantial effect']], law: [['POPIA', 's 71']],
  sat: told('za_automated_decisions'), evidence: ['Your confirmation'], action: 'attest',
  text: [
    "You haven't confirmed {company}'s safeguards for automated decisions",
    'You told us software makes big decisions about people by itself, and we have no confirmation of your safeguards.',
    'A decision with legal or substantial effect based only on automated profiling needs a contract, a law or code, and a chance for the person to make representations.',
    'A decision made without those safeguards can be challenged, and the Regulator can act on it.',
    'Explain these decisions in your notice, let people make representations, then confirm here.',
  ],
});
b.rule({
  id: 'ZA.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI use disclosed on your website', sev: 'low', tier: 1, when: all(AI, yes('derived.has_website')),
  shared: 'ai_transparency',
  src: [[S11, 'AI use disclosed on the website']],
  sat: any(yes('web.policy.ai_disclosure_found'), held('za_ai_transparency')), verify: no('web.policy.ai_disclosure_found'),
  evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'za_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI.' },
  text: [
    "We can't see where {company} tells people it uses AI",
    "We couldn't find an AI disclosure on your website, and you haven't added transparency records. Our scan may not recognise every wording, so a person will check.",
    'Customers increasingly expect to be told when they are dealing with AI, and EU customers will ask under the EU rules.',
    'Enterprise customers and investors are starting to ask, and you would have no answer ready.',
    'Say on your website where your product uses AI, or add your transparency records here.',
  ],
});

export const za = b.build();

/** International rules the South African pack asks for in its own way. */
export const ZA_INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  'INTL.CORP.CONSTITUTION': ['ZA.CORP.MOI'],
  'INTL.EQUITY.CAP_TABLE': ['ZA.CORP.SECURITIES_REGISTER'],
  'INTL.IP.OWNER_ASSIGNMENT': ['ZA.IP.ASSIGNMENT'],
  'INTL.IP.CONTRACTOR_ASSIGNMENT': ['ZA.IP.ASSIGNMENT'],
  'INTL.DP.PRIVACY_NOTICE': ['ZA.DP.PRIVACY_NOTICE'],
  'INTL.DP.PROCESSING_AGREEMENTS': ['ZA.DP.OPERATOR_AGREEMENTS'],
  'INTL.SEC.INCIDENT_RESPONSE': ['ZA.DP.BREACH'],
};

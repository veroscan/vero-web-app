import { all, any, auto, eq, held, MAPS, no, packBuilder, remind, yes } from './helper.js';

/** Federal items the Delaware map needs. The Delaware pack inherits this one. */
const b = packBuilder('US', MAPS.delaware, { name: 'United States (federal)', version: '0.2.0' });

const USPTO = 'registry.us.uspto';
const SANCTIONS = 'registry.sanctions';

// --- Section 2: IRS -----------------------------------------------------------------------------

b.rule({
  id: 'US.TAX.EIN', layer: 3, area: 'tax', stage: 2, title: 'Tax number (EIN)', sev: 'high', tier: 4, regulator: 'Internal Revenue Service',
  src: [['Section 2 —', 'Employer Identification Number; federal tax registration'], ['5. The core set', 'EIN letter on file']],
  sat: held('ein_letter'), evidence: ['IRS CP575 or 147C letter'],
  slot: { id: 'ein_letter', label: 'IRS letter with your EIN (CP575 or 147C)', reason: 'Your tax number is never public, so this letter is the only way we can confirm it.', tier: 4 },
  text: [
    "We don't have the IRS letter showing {company}'s tax number",
    "You haven't uploaded the IRS letter that gives your Employer Identification Number (EIN).",
    "Your EIN is never published, so this letter is the only proof. Banks, investors and your payroll provider all ask for it.",
    "You'll be asked for it when you open accounts or go through due diligence, and getting a copy from the IRS takes time.",
    'Upload your CP575 or 147C letter. We read the number and check the company name matches.',
  ],
});

b.doc({
  id: 'US.TAX.INCOME_RETURNS', layer: 3, area: 'tax', stage: 3, title: 'Federal income tax returns', noun: 'federal income tax returns', sev: 'high', tier: 5, regulator: 'Internal Revenue Service',
  src: [['Section 2 —', 'Form 1120 (C-corp) / 1120-S (S-corp) / 1065'], ['Section 2 —', 'Federal income tax returns; estimated tax payments']],
  rec: { type: 'after_year_end', months: 4, day_of_month: 15, monitoring: remind, done_fact: 'answers.federal_return_filed_on' },
  slot: { id: 'federal_tax_returns', label: 'Federal tax returns (Form 1120, 1120-S or 1065)', reason: 'Investors check these first, and they show the company has filed every year.' },
});

b.doc({
  id: 'US.TAX.PAYROLL_RETURNS', layer: 3, area: 'employment_tax', stage: 2, title: 'Payroll tax registration and returns', noun: 'payroll tax returns', sev: 'high', tier: 5, regulator: 'Internal Revenue Service', when: yes('derived.employees'),
  src: [['Section 2 —', 'Payroll tax registration; federal employment tax returns; Form 941; Form 940']],
  rec: { type: 'periodic', every_months: 3, monitoring: remind },
  slot: { id: 'payroll_returns', label: 'Payroll tax returns (Forms 941 and 940)', reason: 'Once you have employees you file Form 941 each quarter and Form 940 each year.' },
});

b.doc({
  id: 'US.TAX.W2_W4', layer: 3, area: 'employment_tax', stage: 2, title: 'Employee tax forms (W-2 and W-4)', noun: 'W-2 and W-4 records', sev: 'medium', tier: 5, regulator: 'Internal Revenue Service', when: yes('derived.employees'),
  src: [['Section 2 —', 'Form W-2; Form W-4']],
  slot: { id: 'w2_w4_records', label: 'W-2 and W-4 records', reason: 'These are the tax forms every employee should have on record.' },
});

b.doc({
  id: 'US.TAX.1099', layer: 3, area: 'contractor_tax', stage: 3, title: 'Contractor tax forms (1099)', noun: '1099 records', sev: 'medium', tier: 5, regulator: 'Internal Revenue Service', when: yes('derived.contractors'), review: true,
  src: [['Section 2 —', 'Form 1099-NEC; Form 1099-MISC'], ['6. Thresholds', 'Form 1099-NEC reporting threshold']],
  params: { proposed_threshold_usd: 600, note: 'Map says changed by 2025 legislation; figure to be confirmed.' },
  slot: { id: '1099_records', label: 'Form 1099 records for US contractors', reason: 'US contractors paid above the reporting threshold need a 1099 each year.' },
});

b.rule({
  id: 'US.TAX.FORM_5472', layer: 3, area: 'international_tax', stage: 3, title: 'Form 5472 for foreign owners', sev: 'high', tier: 5, regulator: 'Internal Revenue Service', when: yes('derived.foreign_owned'), penalty: 'severe',
  src: [['Section 2 —', 'Form 5472']], params: { penalty_usd_per_form: 25_000 },
  rec: { type: 'after_year_end', months: 4, day_of_month: 15, monitoring: remind, done_fact: 'answers.federal_return_filed_on' },
  sat: held('form_5472'), evidence: ['Filed Form 5472'],
  slot: { id: 'form_5472', label: 'Form 5472', reason: 'Companies with 25% or more foreign ownership file this with their tax return.' },
  text: [
    "We can't see a Form 5472 for {company}",
    "You told us the company has foreign owners, and you haven't added a Form 5472 to your documents.",
    'A company with 25% or more foreign ownership files this form every year with its tax return. It is common for Nigerian-founded Delaware companies.',
    'The penalty for missing it is $25,000 per form.',
    'Ask your accountant to file it with your next return, then add a copy here.',
  ],
});

b.doc({
  id: 'US.TAX.TRANSFER_PRICING', layer: 3, area: 'international_tax', stage: 5, title: 'Transfer pricing documentation', sev: 'medium', tier: 5, regulator: 'Internal Revenue Service', when: yes('derived.foreign_owned'),
  src: [['Section 2 —', 'International tax reporting documentation; transfer pricing documentation']],
  slot: { id: 'transfer_pricing', label: 'Transfer pricing and international tax records', reason: 'Once money moves between related companies across borders, you need a record of how the prices were set.' },
});

// --- Section 4: FinCEN --------------------------------------------------------------------------

b.rule({
  id: 'US.CORP.BOI_FOREIGN_ENTITY', layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Beneficial ownership report', sev: 'medium', tier: 5, regulator: 'FinCEN', when: yes('derived.us.foreign_entity_us_registered'),
  src: [['Section 4 —', 'Beneficial ownership reporting'], ['2. Consolidation notes', 'Section 4 (FinCEN BOI) is now a non-item for US entities']],
  sat: yes('attest.boi_report_filed'), evidence: ['Your confirmation that the report is filed'], action: 'attest',
  text: [
    "You haven't told us the beneficial ownership report is filed",
    "{company} is a non-US company registered to do business in a US state, and you haven't confirmed its beneficial ownership report is filed.",
    "US-formed companies no longer file this, but foreign companies registered in a state still do. FinCEN doesn't publish reports, so we can't check it ourselves.",
    "If you're asked, you won't have anything on record to show you've dealt with it.",
    'File the report with FinCEN if you need to, then confirm it here.',
  ],
});

// --- Section 9: USPTO ---------------------------------------------------------------------------

b.doc({
  id: 'US.IP.TRADEMARK_SEARCH', layer: 2, area: 'trademarks', stage: 2, title: 'Trademark search report', sev: 'low', tier: 5, regulator: 'USPTO',
  src: [['Section 9 —', 'Trademark search']],
  slot: { id: 'us_trademark_search', label: 'Trademark search report', reason: 'A search shows whether someone else already has a mark close to yours.' },
});

b.rule({
  id: 'US.IP.TRADEMARK', layer: 2, area: 'trademarks', stage: 2, title: 'US trademark filing', sev: 'high', tier: 1, regulator: 'USPTO',
  src: [['Section 9 —', 'Federal trademark application; registration certificate'], ['5. The core set', 'USPTO trademark filed']],
  sat: any(yes(`${USPTO}.trademark_filed`), held('us_trademark_certificate')), evidence: ['USPTO record', 'Registration certificate'], action: 'file', order: 'us_trademark_filing',
  slot: { id: 'us_trademark_certificate', label: 'US trademark application or registration', reason: 'Give us the serial number or upload the certificate so we can check it on the USPTO register.', tier: 4 },
  text: [
    "We can't find a US trademark filing for {company}",
    "We couldn't find a USPTO filing for your brand, and you haven't added one. That doesn't prove there isn't one: give us the serial number if you've filed.",
    "Without a filing, someone else could register a name close to yours, and you'd have a weaker position to stop them.",
    'It tends to come up in due diligence, and a rebrand after launch costs far more than a filing does today.',
    'File for your brand name with the USPTO, or give us the serial number if you already have.',
  ],
});

b.rule({
  id: 'US.IP.TRADEMARK_RENEWAL', layer: 2, area: 'trademarks', stage: 3, title: 'US trademark renewal', sev: 'medium', tier: 1, regulator: 'USPTO', when: yes(`${USPTO}.trademark_registered`),
  src: [['Section 9 —', 'Trademark renewal'], ['Section 24 —', 'Intellectual property renewals']],
  rec: { type: 'every_years', from_fact: `${USPTO}.trademark_registered_on`, years: 10, monitoring: auto('the USPTO') },
  params: { section_8_window_years: [5, 6], renewal_every_years: 10 },
  sat: eq(`${USPTO}.trademark_status`, 'live'), evidence: ['USPTO status and maintenance events'], action: 'renew',
  text: [
    "Your US trademark doesn't show as live",
    "The USPTO record for your trademark doesn't show it as live.",
    'Registered marks need a filing between years 5 and 6, and a renewal every 10 years, or they lapse.',
    'If it has lapsed, you lose the protection of the registration and may have to file again.',
    'Check the record on the USPTO site and make the maintenance filing. If the deadline has passed, the USPTO explains whether the mark can still be revived.',
  ],
});

b.rule({
  id: 'US.IP.PATENTS', layer: 2, area: 'patents', stage: 3, title: 'US patent filings', sev: 'low', tier: 1, regulator: 'USPTO', when: yes('answers.has_patentable_technology'),
  src: [['Section 9 —', 'Patent application; utility patent; design patent'], ['5. The core set', 'patents where relevant']],
  sat: any({ '>': [{ var: `${USPTO}.patent_application_count` }, 0] }, held('us_patent_filing')), evidence: ['USPTO record', 'Patent filing receipt'], action: 'file',
  slot: { id: 'us_patent_filing', label: 'US patent application or grant', reason: "You told us you have technology you might patent. Unpublished applications won't show on the register, so upload the receipt.", tier: 4 },
  text: [
    "We can't find a US patent filing for {company}",
    "You told us you have technology you might patent, and we couldn't find an application in {company}'s name. Recent applications may not show yet.",
    'Patents are optional, but if your edge is a technical invention, a filing is what protects it.',
    'Public disclosure can affect whether you can still file, so it is worth deciding early.',
    "Decide whether to file before you show the invention in public. If you already have, upload the receipt.",
  ],
});

b.doc({
  id: 'US.IP.ASSIGNMENT_RECORDS', layer: 2, area: 'ip_ownership', stage: 3, title: 'Recorded patent and trademark assignments', noun: 'recorded IP assignments', sev: 'medium', tier: 3, regulator: 'USPTO', when: any(yes(`${USPTO}.trademark_filed`), yes('answers.has_patentable_technology')), review: true,
  src: [['Section 9 —', 'Patent assignment documentation; trademark assignment documentation'], ['6. Thresholds', 'USPTO assignment data in the Open Data Portal']],
  slot: { id: 'us_ip_assignment_records', label: 'Recorded patent or trademark assignments', reason: "If IP started out in a founder's name, the transfer to the company should be recorded." },
});

b.doc({
  id: 'US.IP.OWNERSHIP_LICENCES', layer: 2, area: 'ip_ownership', stage: 3, title: 'IP ownership records and licences', noun: 'IP ownership records and licences', sev: 'medium', tier: 5,
  src: [['Section 9 —', 'IP ownership records; patent and trademark licensing agreements']],
  slot: { id: 'ip_ownership_records', label: 'IP ownership records and licences', reason: 'A short record of what the company owns and licenses answers the first question investors ask about IP.' },
});

// --- Section 10: Copyright ----------------------------------------------------------------------

b.doc({
  id: 'US.IP.COPYRIGHT_REGISTRATION', layer: 2, area: 'copyright', stage: 3, title: 'Copyright registration', sev: 'low', tier: 3, regulator: 'US Copyright Office', review: true,
  src: [['Section 10 —', 'Copyright registration; software registration; website and content registration'], ['6. Thresholds', 'Copyright Office records API']],
  slot: { id: 'us_copyright_certificate', label: 'Copyright registration certificate', reason: "It's optional, but you need a registration before you can sue for infringement.", tier: 4 },
});

// --- Section 11: FTC ----------------------------------------------------------------------------

b.doc({
  id: 'US.CONSUMER.FTC', layer: 4, area: 'consumer_protection', stage: 3, title: 'Marketing claims and consumer protection records', noun: 'consumer protection and marketing records', sev: 'medium', tier: 5, regulator: 'Federal Trade Commission', when: yes('derived.consumer'),
  src: [['Section 11 —', 'FTC Act compliance; consumer protection; advertising compliance']],
  slot: { id: 'ftc_marketing_records', label: 'Marketing claims and consumer protection records', reason: 'If you sell to consumers, you should be able to back up what your marketing says.' },
});

b.rule({
  id: 'US.CONSUMER.PRIVACY_DISCLOSURES', layer: 3, area: 'privacy', stage: 2, title: 'End-user privacy disclosures', sev: 'high', tier: 1, regulator: 'Federal Trade Commission', when: yes('derived.has_website_or_app'),
  src: [['Section 11 —', 'End-user privacy disclosures']],
  sat: yes('web.policy.privacy_notice_found'), evidence: ['Your published privacy notice'], action: 'fix_website',
  text: [
    "We can't find privacy disclosures for {company}'s users",
    "We couldn't find a privacy notice on your website.",
    'What you tell users about their data has to match what your product really does.',
    'A missing or wrong notice is one of the first things a regulator, a partner or an app store notices.',
    'Publish a privacy notice that matches your real data flows and link it from every page.',
  ],
});

b.rule({
  id: 'US.CONSUMER.COPPA', layer: 3, area: 'children', stage: 3, title: "Children's privacy (COPPA)", sev: 'high', tier: 5, regulator: 'Federal Trade Commission', when: yes('derived.children'), review: true,
  src: [['Section 11 —', 'COPPA compliance; COPPA Rule compliance'], ['6. Thresholds', 'COPPA amended-rule compliance date']],
  law: [['COPPA Rule']],
  sat: all(held('coppa_records'), yes('web.policy.children_section')), evidence: ['COPPA records', "Children's section in your privacy notice"],
  slot: { id: 'coppa_records', label: 'COPPA records, including parental consent', reason: 'You told us children under 13 use your product, which brings in special consent rules.' },
  text: [
    "We can't confirm {company} meets the children's privacy rules",
    "You told us children under 13 use your product, and we don't have your parental consent records or a children's section in your privacy notice.",
    'Services used by children under 13 need verifiable parental consent before collecting their data.',
    'Regulators pay close attention to this one, and it is hard to fix after the data is collected.',
    "Add a children's section to your notice, set up parental consent, and add the records here.",
  ],
});

b.rule({
  id: 'US.CONSUMER.AUTO_RENEWAL', layer: 4, area: 'consumer_terms', stage: 3, title: 'Subscription and auto-renewal terms', sev: 'medium', tier: 1, regulator: 'Federal Trade Commission', when: all(yes('derived.consumer'), yes('derived.subscriptions')),
  src: [['Section 11 —', 'Subscription and automatic renewal compliance']],
  sat: yes('web.policy.terms_found'), evidence: ['Published terms with renewal and cancellation details'], action: 'fix_website',
  text: [
    "We can't find your renewal and cancellation terms",
    "You sell subscriptions to consumers, and we couldn't find published terms covering renewal and how to cancel.",
    "State auto-renewal laws such as California's expect clear renewal disclosures and an easy way to cancel.",
    'Unclear renewals are a common source of complaints and refund disputes.',
    'Publish your renewal terms and a simple cancellation path, then run the scan again.',
  ],
});

b.rule({
  id: 'US.CONSUMER.REFUNDS', layer: 4, area: 'consumer_terms', stage: 3, title: 'Refund, cancellation and complaints policy', sev: 'medium', tier: 1, regulator: 'Federal Trade Commission', when: yes('derived.consumer'),
  src: [['Section 11 —', 'Consumer complaint handling policy; refund and cancellation policy']],
  sat: yes('web.policy.refund_policy_found'), evidence: ['Published refund and cancellation policy'], action: 'fix_website',
  text: [
    "We can't find a refund and cancellation policy on your website",
    "We couldn't find a published refund and cancellation policy.",
    'Consumers need to know how to get their money back and how to complain.',
    'Without one, disputes get harder to settle and tend to reach your payment provider or a regulator.',
    'Publish the policy and link it from your site footer.',
  ],
});

b.doc({
  id: 'US.CONSUMER.DATA_SECURITY', layer: 3, area: 'security', stage: 3, title: 'Data security records', noun: 'data security records', sev: 'medium', tier: 5, regulator: 'Federal Trade Commission', when: yes('derived.consumer'),
  src: [['Section 11 —', 'Data security compliance documentation']],
  slot: { id: 'ftc_data_security', label: 'Data security records', reason: 'If you hold consumer data, you should be able to show how you protect it.' },
});

// --- Section 12: FCC ----------------------------------------------------------------------------

b.doc({
  id: 'US.TELECOMS.FRN', layer: 3, area: 'telecoms', stage: 2, title: 'FCC registration (FRN)', noun: 'FCC registration', sev: 'high', tier: 3, regulator: 'Federal Communications Commission', when: yes('derived.sector.telecoms'), review: true,
  src: [['Section 12 —', 'FCC registration (FRN)'], ['6. Thresholds', 'FCC CORES export']],
  slot: { id: 'fcc_frn', label: 'FCC registration number (FRN)', reason: 'Telecoms businesses need an FCC registration number.', tier: 4 },
});
b.doc({
  id: 'US.TELECOMS.AUTHORITY', layer: 3, area: 'telecoms', stage: 2, title: 'Telecoms operating authority', noun: 'telecoms operating authority', sev: 'critical', tier: 3, regulator: 'Federal Communications Commission', when: yes('derived.sector.telecoms'), review: true,
  src: [['Section 12 —', 'Telecommunications operating authority; International Section 214 authorisation']],
  slot: { id: 'fcc_214', label: 'Telecoms operating authority or Section 214 authorisation', reason: 'Carriers and VoIP providers need this authority to operate.', tier: 4 },
});
b.doc({
  id: 'US.TELECOMS.DOCS', layer: 3, area: 'telecoms', stage: 3, title: 'Telecoms compliance records', noun: 'telecoms compliance records', sev: 'medium', tier: 5, regulator: 'Federal Communications Commission', when: yes('derived.sector.telecoms'),
  src: [['Section 12 —', 'Telecommunications compliance documentation']],
  slot: { id: 'fcc_compliance', label: 'Telecoms compliance records', reason: 'These show how you meet your FCC duties.' },
});
b.doc({
  id: 'US.TELECOMS.USF', layer: 3, area: 'telecoms', stage: 3, title: 'Universal Service Fund compliance', noun: 'Universal Service Fund records', sev: 'medium', tier: 3, regulator: 'Federal Communications Commission', when: yes('derived.sector.telecoms'),
  src: [['Section 12 —', 'Universal Service Fund compliance']],
  slot: { id: 'fcc_usf', label: 'Universal Service Fund records (Form 499)', reason: 'Telecoms providers file Form 499, and the FCC publishes who has.' },
});
b.doc({
  id: 'US.CONSUMER.TCPA', layer: 4, area: 'marketing', stage: 3, title: 'Text and call marketing compliance (TCPA)', noun: 'text and call marketing records', sev: 'medium', tier: 5, regulator: 'Federal Communications Commission', when: all(yes('derived.consumer'), yes('derived.sms_or_calls')),
  src: [['Section 12 —', 'TCPA compliance; robocall and automated messaging compliance']],
  slot: { id: 'tcpa_records', label: 'Text and call consent records', reason: 'If you text or call US consumers, you should keep a record of their consent.' },
});

// --- Sections 13 and 14: financial regulation ---------------------------------------------------

b.doc({
  id: 'US.FIN.BROKER_DEALER', layer: 3, area: 'securities', stage: 2, title: 'SEC broker-dealer registration and FINRA membership', noun: 'broker-dealer registration', sev: 'critical', tier: 3, regulator: 'SEC and FINRA', when: yes('derived.sector.securities'), review: true,
  src: [['Sections 13 and 14', 'SEC broker-dealer registration; FINRA membership'], ['6. Thresholds', 'FINRA BrokerCheck']],
  slot: { id: 'sec_broker_dealer', label: 'Broker-dealer registration and FINRA membership', reason: 'Brokerage and crowdfunding portals need this registration.', tier: 4 },
});
b.doc({
  id: 'US.FIN.INVESTMENT_ADVISER', layer: 3, area: 'securities', stage: 2, title: 'SEC investment adviser registration', noun: 'investment adviser registration', sev: 'critical', tier: 3, regulator: 'SEC', when: yes('derived.sector.securities'),
  src: [['Sections 13 and 14', 'SEC investment adviser registration']],
  slot: { id: 'sec_adviser', label: 'Investment adviser registration', reason: 'Advisory technology companies may need this. The SEC publishes the register.', tier: 4 },
});
b.doc({
  id: 'US.FIN.EXCHANGE_ATS', layer: 3, area: 'securities', stage: 2, title: 'Exchange or ATS registration', noun: 'exchange or ATS registration', sev: 'critical', tier: 3, regulator: 'SEC', when: yes('derived.sector.securities'),
  src: [['Sections 13 and 14', 'Exchange or ATS registration']],
  slot: { id: 'sec_ats', label: 'Exchange or ATS registration', reason: 'Trading platforms need this registration. The SEC publishes the lists.', tier: 4 },
});
b.rule({
  id: 'US.FIN.MSB', layer: 3, area: 'payments', stage: 2, title: 'FinCEN Money Services Business registration', sev: 'critical', tier: 3, regulator: 'FinCEN', when: yes('derived.moves_money'), penalty: 'severe',
  src: [['Sections 13 and 14', 'FinCEN Money Services Business registration']],
  rec: { type: 'after_event', event_fact: 'answers.money_services_started_on', days: 180, monitoring: remind },
  sat: held('fincen_msb'), evidence: ['FinCEN MSB registration'], action: 'register',
  slot: { id: 'fincen_msb', label: 'FinCEN MSB registration', reason: 'Money transmission and convertible virtual currency businesses register within 180 days of starting.', tier: 4 },
  text: [
    "We can't see {company}'s FinCEN registration",
    "You told us you hold or move money, and you haven't added a FinCEN Money Services Business registration.",
    'Businesses that transmit money or convertible virtual currency have to register within 180 days of starting.',
    "Banks and partners check this. If you're operating without it, they can stop working with you.",
    'Register with FinCEN, or tell us how you are exempt, then add the confirmation here.',
  ],
});
b.doc({
  id: 'US.FIN.BANK_CHARTER', layer: 3, area: 'banking', stage: 2, title: 'Bank charter and deposit insurance approvals', noun: 'bank charter and approvals', sev: 'critical', tier: 3, regulator: 'OCC, Federal Reserve and FDIC', when: yes('derived.sector.banking'),
  src: [['Sections 13 and 14', 'OCC national bank charter; Federal Reserve approvals; FDIC deposit insurance']],
  slot: { id: 'us_bank_charter', label: 'Bank charter and approvals', reason: 'Only applies if the company itself is a bank. Most startups work through a partner bank.', tier: 4 },
});
b.doc({
  id: 'US.FIN.CFPB', layer: 3, area: 'lending', stage: 3, title: 'Consumer finance compliance (CFPB)', noun: 'consumer finance compliance records', sev: 'high', tier: 5, regulator: 'CFPB', when: yes('derived.sector.lending'),
  src: [['Sections 13 and 14', 'CFPB consumer finance compliance']],
  slot: { id: 'cfpb_records', label: 'Consumer finance compliance records', reason: 'Lending to consumers brings in federal consumer finance rules.' },
});
b.doc({
  id: 'US.FIN.CFTC', layer: 3, area: 'derivatives', stage: 2, title: 'CFTC registration', sev: 'critical', tier: 3, regulator: 'CFTC', when: yes('derived.sector.derivatives'),
  src: [['Sections 13 and 14', 'CFTC registration']],
  slot: { id: 'cftc_registration', label: 'CFTC registration', reason: 'Derivatives businesses need this. It can be checked on NFA BASIC.', tier: 4 },
});
b.rule({
  id: 'US.SANCT.SCREENING', layer: 3, area: 'sanctions', stage: 2, title: 'Sanctions lists', sev: 'critical', tier: 3, regulator: 'OFAC',
  src: [['5. The core set', 'No sanctions or restricted-party matches'], ['Sections 13 and 14', 'OFAC sanctions compliance; OFAC screening']],
  sat: no(`${SANCTIONS}.match`), defect: yes(`${SANCTIONS}.match`), verify: yes(`${SANCTIONS}.possible_match`),
  evidence: ['Screening against official sanctions lists'], action: 'review',
  text: [
    "{company}'s name matches an entry on a sanctions list",
    'Your company name matched an entry on an official sanctions list. It may be another business with a similar name.',
    'Banks, investors and payment providers will not work with a sanctioned party, so this needs a clear answer quickly.',
    'If it stays unresolved, it can stop your bank account, your payments and any fundraising.',
    "Compare the entry with your company's details today. If it is a false match, we'll record why, so you have the answer when you're asked.",
  ],
});
b.doc({
  id: 'US.SANCT.POLICY', layer: 3, area: 'sanctions', stage: 3, title: 'Sanctions screening policy', sev: 'high', tier: 5, regulator: 'OFAC', when: yes('derived.sanctions_exposure'),
  src: [['Sections 13 and 14', 'OFAC sanctions compliance; OFAC screening']],
  slot: { id: 'ofac_policy', label: 'Sanctions screening policy', reason: 'If you move money, deal in securities or export, you should screen who you deal with.' },
});
b.rule({
  id: 'US.FIN.MONEY_TRANSMITTER', layer: 3, area: 'payments', stage: 2, title: 'State money transmitter licences', sev: 'critical', tier: 5, regulator: 'State regulators (NMLS)', when: yes('derived.moves_money'), penalty: 'severe',
  src: [['Sections 13 and 14', 'Money Transmitter Licence; state-by-state licences; NMLS registration']],
  sat: any(held('state_mtl'), held('licensed_partner_agreement')), evidence: ['NMLS ID and state licences', 'Sponsor-bank or agent-of-payee agreement'], action: 'register',
  slot: [
    { id: 'state_mtl', label: 'Money transmitter licences and NMLS ID', reason: 'Money transmission is licensed state by state, and the NMLS register can only be checked with the ID you give us.', tier: 4 },
    { id: 'licensed_partner_agreement', label: 'Agreement with your licensed payments partner', reason: 'If a licensed partner moves the money, this agreement shows you are covered. You told us about it, and we need to see it.' },
  ],
  text: [
    "We can't see how {company} is licensed to move money",
    "You told us you hold or move funds for others, and we don't have your state licences or an agreement with a sponsor bank.",
    'Money transmission is licensed state by state. You must hold a licence, or use a sponsor bank or agent-of-payee structure, before you start.',
    'Operating without cover can shut your payments down, and investors will not close until it is clear.',
    'Add your NMLS ID and licences, or the agreement with your licensed partner.',
  ],
});
b.doc({
  id: 'US.FIN.PAYMENT_AGREEMENTS', layer: 4, area: 'payments', stage: 3, title: 'Bank partnership and payment processing agreements', noun: 'bank partner and payment agreements', sev: 'high', tier: 5, when: yes('derived.sector.payments'),
  src: [['Sections 13 and 14', 'Bank partnership agreements; payment processing agreements; electronic payment compliance documentation']],
  slot: { id: 'us_payment_agreements', label: 'Bank partner and payment processing agreements', reason: 'These are what your payments business runs on, and investors read them closely.' },
});
b.doc({
  id: 'US.FIN.AML', layer: 3, area: 'financial_crime', stage: 2, title: 'AML and KYC policies', noun: 'AML and KYC policies', sev: 'high', tier: 5, regulator: 'FinCEN', when: yes('derived.sector.us_aml'),
  src: [['Sections 13 and 14', 'BSA compliance; AML Policy; KYC Policy; CDD procedures; SAR procedures']],
  slot: { id: 'us_aml_policy', label: 'AML and KYC policies', reason: 'Payments, securities and lending businesses need written anti-money-laundering procedures.' },
});
b.doc({
  id: 'US.FIN.SAFEGUARDING', layer: 3, area: 'payments', stage: 3, title: 'Safeguarding and custody records', noun: 'safeguarding and custody records', sev: 'high', tier: 5, when: yes('derived.sector.payments'),
  src: [['Sections 13 and 14', 'Consumer financial protection compliance; safeguarding and custody documentation']],
  slot: { id: 'us_safeguarding', label: 'Safeguarding and custody records', reason: "If you hold customers' money, you should show how it is kept safe." },
});

// --- Sections 16 and 17: employment and immigration (federal parts) -------------------------------

b.rule({
  id: 'US.EMP.I9', layer: 3, area: 'employment', stage: 2, title: 'Employment eligibility (Form I-9)', sev: 'high', tier: 5, regulator: 'USCIS', when: yes('derived.employees'),
  src: [['Sections 16 and 17', 'Form I-9; employment eligibility verification; Form I-9 compliance']],
  rec: { type: 'after_event', event_fact: 'answers.last_hire_on', days: 3, monitoring: remind },
  sat: yes('attest.i9_for_every_hire'), evidence: ['Your confirmation for each hire'], action: 'attest',
  text: [
    "You haven't confirmed Form I-9s are done for your team",
    "We don't have your confirmation that every US hire has a completed Form I-9.",
    'Each new hire needs one within 3 days of starting.',
    "It's a common finding in due diligence, and it is easy to lose track of as you grow.",
    'Complete any missing forms, keep them with your HR records, and confirm here.',
  ],
});
b.doc({
  id: 'US.EMP.BENEFITS', layer: 4, area: 'employment', stage: 5, title: 'Employee benefits records', noun: 'employee benefits records', sev: 'medium', tier: 5, when: yes('derived.employees'), review: true,
  src: [['Sections 16 and 17', 'Employee benefits documentation; health insurance arrangements'], ['6. Thresholds', 'ACA employer mandate, EEO-1 and FMLA headcount thresholds']],
  slot: { id: 'us_benefits', label: 'Employee benefits and health insurance records', reason: 'Larger employers have duties here, and investors will ask.' },
});
b.doc({
  id: 'US.EMP.OSHA', layer: 3, area: 'employment', stage: 3, title: 'Workplace safety compliance (OSHA)', noun: 'workplace safety records', sev: 'low', tier: 5, regulator: 'OSHA', when: yes('derived.employees'),
  src: [['Sections 16 and 17', 'OSHA compliance']],
  slot: { id: 'osha_records', label: 'Workplace safety records', reason: 'Employers should keep a record of how they meet workplace safety rules.' },
});
b.doc({
  id: 'US.EMP.EEO', layer: 3, area: 'employment', stage: 3, title: 'Equal employment records', noun: 'equal employment records', sev: 'low', tier: 5, regulator: 'EEOC', when: yes('derived.employees'), review: true,
  src: [['Sections 16 and 17', 'EEO compliance'], ['6. Thresholds', 'ACA employer mandate, EEO-1 and FMLA headcount thresholds']],
  slot: { id: 'eeo_records', label: 'Equal employment records', reason: 'Employers have equal opportunity duties, and larger ones file an EEO-1 report.' },
});
b.doc({
  id: 'US.EMP.FMLA', layer: 3, area: 'employment', stage: 5, title: 'Family and medical leave compliance', noun: 'family and medical leave records', sev: 'low', tier: 5, regulator: 'Department of Labor', when: yes('derived.employees'), review: true,
  src: [['Sections 16 and 17', 'FMLA compliance'], ['6. Thresholds', 'ACA employer mandate, EEO-1 and FMLA headcount thresholds']],
  slot: { id: 'fmla_records', label: 'Family and medical leave records', reason: 'This applies at 50 or more employees.' },
});
b.rule({
  id: 'US.EMP.IMMIGRATION', layer: 3, area: 'immigration', stage: 3, title: 'Visa sponsorship records', sev: 'high', tier: 5, regulator: 'USCIS', when: yes('derived.foreign_workers'), review: true,
  src: [['Sections 16 and 17', 'Immigration sponsorship documentation; H-1B, L-1, O-1, E-2 visa documentation']],
  sat: yes('attest.visa_records_held'), evidence: ['Held or not held, per role'], action: 'attest',
  text: [
    "You haven't confirmed you hold visa records for sponsored staff",
    "You told us you sponsor workers, and we don't have your confirmation that visa records are held for each role.",
    "These are personal documents, so we only ask whether you hold them, not for copies.",
    'Missing records can affect both the employee and your ability to sponsor others.',
    'Check your records for each sponsored role, then confirm here.',
  ],
});
b.doc({
  id: 'US.EMP.EVERIFY', layer: 3, area: 'immigration', stage: 2, title: 'E-Verify registration', sev: 'medium', tier: 3, regulator: 'USCIS', when: yes('derived.employees'), review: true,
  src: [['Sections 16 and 17', 'E-Verify registration'], ['6. Thresholds', 'USCIS E-Verify employer list']],
  slot: { id: 'everify', label: 'E-Verify registration', reason: 'It is mandatory for federal contractors and in some states.', tier: 4 },
});

// --- Section 18: export control -----------------------------------------------------------------

b.doc({
  id: 'US.EXPORT.CLASSIFICATION', layer: 3, area: 'export_control', stage: 3, title: 'Encryption and export classification', noun: 'export classification', sev: 'high', tier: 5, regulator: 'Bureau of Industry and Security', when: yes('derived.exports'),
  src: [['Section 18 —', 'ECCN determination; encryption export classification']],
  slot: { id: 'eccn_classification', label: 'Export classification (ECCN) or self-classification report', reason: 'Most software using encryption, including SaaS used abroad, needs a classification.' },
});
b.doc({
  id: 'US.EXPORT.LICENCE', layer: 3, area: 'export_control', stage: 3, title: 'Export licence', sev: 'high', tier: 4, regulator: 'Bureau of Industry and Security', when: yes('derived.exports'),
  src: [['Section 18 —', 'Export licence application; technology export authorisation']],
  slot: { id: 'us_export_licence', label: 'Export licence or authorisation', reason: "Controlled items or destinations need a licence, and these aren't public.", tier: 4 },
});
b.doc({
  id: 'US.EXPORT.PROGRAMME', layer: 3, area: 'export_control', stage: 3, title: 'Export compliance programme', sev: 'medium', tier: 5, regulator: 'Bureau of Industry and Security', when: yes('derived.exports'),
  src: [['Section 18 —', 'Export compliance programme; export documentation; end-user verification records'], ['Section 18 —', 'Restricted-party screening']],
  slot: { id: 'us_export_programme', label: 'Export compliance programme and screening records', reason: 'This shows who you checked and how you stop sales to restricted parties.' },
});

// --- Section 20: healthtech -----------------------------------------------------------------------

b.doc({
  id: 'US.HEALTH.FDA_REGISTRATION', layer: 3, area: 'healthtech', stage: 3, title: 'FDA registration and device listing', noun: 'FDA registration and device listing', sev: 'critical', tier: 3, regulator: 'FDA', when: yes('derived.sector.healthtech'),
  src: [['Section 20 —', 'FDA establishment registration and device listing'], ['Section 24 —', 'Regulatory licence renewals']],
  rec: { type: 'expiry', fact: 'vault.fda_registration.expires_on', monitoring: remind },
  slot: { id: 'fda_registration', label: 'FDA registration and device listing', reason: 'Device and software-as-a-medical-device makers register before marketing, and renew each year.', tier: 4, expires: true },
});
b.doc({
  id: 'US.HEALTH.FDA_CLEARANCE', layer: 3, area: 'healthtech', stage: 3, title: 'FDA premarket clearance', noun: 'FDA premarket clearance', sev: 'critical', tier: 3, regulator: 'FDA', when: yes('derived.sector.healthtech'),
  src: [['Section 20 —', '510(k) premarket notification; PMA; De Novo classification']],
  slot: { id: 'fda_clearance', label: '510(k), PMA or De Novo decision', reason: 'A regulated device needs one of these before it reaches the market.', tier: 4 },
});
b.doc({
  id: 'US.HEALTH.QMSR', layer: 3, area: 'healthtech', stage: 3, title: 'Software as a medical device and quality records', noun: 'medical device quality records', sev: 'high', tier: 5, regulator: 'FDA', when: yes('derived.sector.healthtech'), review: true,
  src: [['Section 20 —', 'SaMD regulatory compliance; QMSR compliance'], ['6. Thresholds', 'FDA QMSR effective date']],
  slot: { id: 'fda_qms', label: 'Medical device quality records', reason: 'Medical device software needs a quality management system.' },
});
b.doc({
  id: 'US.HEALTH.HIPAA', layer: 3, area: 'healthtech', stage: 2, title: 'HIPAA compliance and business associate agreements', noun: 'HIPAA records and business associate agreements', sev: 'critical', tier: 5, regulator: 'HHS', when: yes('derived.sector.healthtech'),
  src: [['Section 20 —', 'HIPAA compliance; Privacy Rule; Security Rule; Breach Notification Rule']],
  slot: { id: 'hipaa_baa', label: 'HIPAA records and business associate agreements', reason: 'If you handle health data for covered entities, you need a business associate agreement with each one.' },
});
b.doc({
  id: 'US.HEALTH.CMS', layer: 3, area: 'healthtech', stage: 3, title: 'CMS programme registration', sev: 'medium', tier: 4, regulator: 'CMS', when: yes('derived.sector.healthtech'),
  src: [['Section 20 —', 'CMS programme registration']],
  slot: { id: 'cms_enrolment', label: 'CMS enrolment', reason: 'Only applies if you bill Medicare or Medicaid.', tier: 4 },
});
b.doc({
  id: 'US.HEALTH.FACILITY', layer: 3, area: 'healthtech', stage: 2, title: 'State healthcare facility licence', sev: 'medium', tier: 4, regulator: 'State health regulators', when: yes('derived.sector.healthtech'),
  src: [['Section 20 —', 'State healthcare facility licensing']],
  slot: { id: 'us_health_facility', label: 'State healthcare facility licence', reason: 'Only applies if you run a healthcare facility.', tier: 4 },
});

// --- Section 22: equity and fundraising (federal parts) --------------------------------------------

b.rule({
  id: 'US.EQUITY.ELECTION_83B', layer: 5, area: 'founder_equity', stage: 2, title: '83(b) elections', sev: 'high', tier: 4, regulator: 'Internal Revenue Service', when: yes('derived.founder_restricted_stock'), penalty: 'severe',
  src: [['Section 22 —', '83(b) election'], ['5. The core set', '83(b) elections for founders with restricted stock'], ['2. Consolidation notes', 'the 83(b) election']],
  rec: { type: 'after_event', event_fact: 'answers.founder_stock_granted_on', days: 30, monitoring: remind },
  sat: held('election_83b'), evidence: ['83(b) election', 'Form 15620', 'Certified-mail receipt'],
  slot: { id: 'election_83b', label: '83(b) election, Form 15620 and certified-mail receipt', reason: "It has to be mailed within 30 days of the stock grant, and it's never public, so the receipt is the proof.", tier: 4 },
  text: [
    "We can't see the 83(b) elections for {company}'s founders",
    'You told us founders received stock that vests, and we have no 83(b) election or mailing receipt on file.',
    'The election has to be postmarked within 30 days of the stock grant. After that, the window has closed.',
    'Investors check for this in due diligence, and founders can face a tax bill as their shares vest if it was missed.',
    "Upload each election with its Form 15620 and certified-mail receipt. If it was never filed, get tax advice now.",
  ],
});

b.rule({
  id: 'US.FUND.FORM_D', layer: 5, area: 'fundraising', stage: 4, title: 'SEC Form D for your round', sev: 'medium', tier: 1, regulator: 'SEC', when: yes('derived.invested'),
  src: [['Section 22 —', 'SAFE Agreement; Convertible Note Agreement; Subscription Agreement'], ['4. Counts by tier', 'SEC Form D']],
  sat: any(yes('registry.us.sec_form_d.filed'), held('investment_docs')), evidence: ['SEC EDGAR Form D', 'Round documents'], action: 'file',
  slot: { id: 'investment_docs', label: 'SAFEs, notes and subscription agreements', reason: 'These are the agreements that gave investors their rights. Form D filings can back them up.' },
  text: [
    "We can't find a Form D or round documents for {company}",
    "You told us you have raised or are raising, and we couldn't find a Form D on SEC EDGAR or your round documents here. Not every round needs one, so this may be fine.",
    'A Form D is the public record of a private round. Together with your SAFEs or notes, it shows investors what was sold.',
    'Investors in your next round will want the paper trail for every earlier one.',
    'Add your SAFEs, notes or subscription agreements, and check whether a Form D was due.',
  ],
});

export const usFederal = b.build();

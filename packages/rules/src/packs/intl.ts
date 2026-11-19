import { all, any, held, MAPS, no, packBuilder, yes } from './helper.js';

/**
 * The International pack: the checks that are not one country's law, for a company in any
 * country. Every rule here is taken from a rule already in the Delaware, UK or Nigeria pack and
 * cites the same map line, but its words name no country's statute and claim no legal duty.
 * Where something is the law only in some places, it is written as good practice at a lower
 * severity. Draft, like every pack, until a lawyer approves it. See docs/GLOBAL-COVERAGE.md.
 *
 * It stands in for a country's own pack, so it is not added for Delaware, the UK or Nigeria,
 * whose packs already hold these checks. With a US state's federal pack, or a market's overlay,
 * an international rule gives way to the country rule asking for the same thing
 * (INTL_EQUIVALENTS below, and the shared obligations in annotations.ts).
 */
const b = packBuilder('INTL', MAPS.delaware, { name: 'International', version: '0.1.0' });

const SITE = yes('derived.has_website_or_app');
const PD = yes('derived.personal_data');
const STAFF = yes('derived.employees');
const CONTRACTORS = yes('derived.contractors');
const AI = yes('derived.uses_ai');
const INVESTED = yes('derived.invested');
const SANCTIONS = 'registry.sanctions';

// --- Layer 1: company foundations -------------------------------------------------------------

b.doc({
  id: 'INTL.CORP.CONSTITUTION', layer: 1, area: 'governance', stage: 2, title: "The company's constitution", noun: "company's constitution", sev: 'medium', tier: 5,
  src: [['Section 1 —', 'Corporate Bylaws (corporations) / Operating Agreement (LLCs)'], ['Section 1 —', 'Memorandum of Association; Articles of Association', MAPS.uk]],
  slot: { id: 'intl_constitution', label: 'Company constitution (articles, bylaws or statutes)', reason: 'It sets out how the company is run and what its shares carry. Banks and investors ask for it.' },
  fix: 'Add the current version of your constitution, with any changes made since the company was set up.',
});
b.doc({
  id: 'INTL.CORP.OWNERS_AGREEMENT', layer: 1, area: 'shareholders', stage: 1, title: "Agreement between the company's first owners", noun: "agreement between the company's first owners", sev: 'medium', tier: 5,
  src: [['Section 22 —', "Founders' Agreement; Founder Vesting Agreement"]],
  slot: { id: 'intl_owners_agreement', label: "Agreement between the company's first owners, with vesting", reason: 'It settles who owns what, and what happens to their shares if one of the people who started the company leaves.' },
  fix: 'Agree it in writing, have everyone who holds shares from the start sign it, and add it here.',
});
b.doc({
  id: 'INTL.CORP.RESOLUTIONS', layer: 1, area: 'governance', stage: 2, title: 'Board and shareholder decisions', noun: 'board and shareholder decisions', sev: 'medium', tier: 5,
  src: [['Section 1 —', 'Initial Board of Directors appointment; Initial Board Resolutions; Initial Shareholder Resolutions']],
  slot: { id: 'intl_resolutions', label: 'Board and shareholder decisions (resolutions or minutes)', reason: 'They record the big decisions: who runs the company, and every time shares were issued.' },
  fix: 'Gather the signed decisions, starting with the ones that appointed your directors and issued your first shares, and add them here.',
});

// --- Layer 2: intellectual property -----------------------------------------------------------

b.rule({
  id: 'INTL.IP.OWNER_ASSIGNMENT', layer: 2, area: 'ip_ownership', stage: 1, title: 'IP assignment from the people who started the company', sev: 'high', tier: 5,
  src: [['Section 10 —', 'Copyright ownership documentation; assignment agreements; licensing agreements'], ['5. The core set', 'PIIA signed by every founder, employee and contractor']],
  sat: held('intl_owner_ip_assignment'), evidence: ['Signed IP assignment from each person who started the company'],
  slot: { id: 'intl_owner_ip_assignment', label: 'IP assignments from the people who started the company', reason: 'It makes the company the owner of what they built, including work done before it was set up.' },
  text: [
    "The people who started {company} haven't signed their work over to it",
    "You don't have a signed IP assignment from each person who started the company.",
    'In many countries, the person who wrote the code or made the work owns it until they sign it over. The company may not own the technology it sells.',
    'Investors check this early, and it usually has to be fixed before money can come in.',
    'Have each of them sign a short IP assignment to the company, and add it here.',
  ],
});
b.rule({
  id: 'INTL.IP.STAFF_ASSIGNMENT', layer: 2, area: 'ip_ownership', stage: 2, title: 'IP assignment from employees', sev: 'medium', tier: 5, when: STAFF,
  src: [['Sections 16 and 17', 'Employee Confidentiality Agreements; IP Assignment Agreements; Employee Invention Assignment Agreements']],
  sat: held('intl_staff_ip_assignment'), evidence: ['Employment contracts or agreements with an IP clause'],
  slot: { id: 'intl_staff_ip_assignment', label: 'Employee IP and confidentiality agreements', reason: 'A clear written clause removes any doubt about who owns what your team makes.' },
  text: [
    "We can't see that {company}'s employees have signed their work over",
    "You haven't added employment contracts or agreements that give the company what employees make at work.",
    "Who owns an employee's work depends on the country. A written clause settles it everywhere.",
    "Investors and buyers ask for it, and gaps are slower to fix once people have left.",
    'Make sure each employment contract has an IP and confidentiality clause, and add the signed versions here.',
  ],
});
b.rule({
  id: 'INTL.IP.CONTRACTOR_ASSIGNMENT', layer: 2, area: 'ip_ownership', stage: 2, title: 'IP assignment from contractors', sev: 'high', tier: 5, when: CONTRACTORS,
  src: [['Section 10 —', 'Work-for-hire agreements']],
  sat: held('intl_contractor_ip_assignment'), evidence: ['Signed IP assignment from each contractor'],
  slot: { id: 'intl_contractor_ip_assignment', label: 'Contractor IP assignments', reason: "In many countries a contractor's work stays theirs unless they assign it in writing." },
  text: [
    'Your contractors may still own what they built for {company}',
    "You don't have a signed IP assignment from each contractor who has worked on your product.",
    "In many countries a contractor's work stays theirs unless they sign it over in writing. Paying for it doesn't move it.",
    'Investors check this early, and it usually has to be fixed before money can come in.',
    'Have each contractor sign an IP assignment to the company, and add it here.',
  ],
});
b.doc({
  id: 'INTL.IP.NDA', layer: 2, area: 'confidentiality', stage: 1, title: 'NDA template', sev: 'medium', tier: 5,
  src: [['Section 22 —', 'NDA; Confidentiality Agreement']],
  slot: { id: 'intl_nda', label: 'NDA template', reason: 'You need one before you share anything sensitive with partners, investors or new hires.' },
  fix: 'Add the NDA you use. If you don\'t have one yet, put a standard mutual NDA in place before your next sensitive conversation.',
});
b.doc({
  id: 'INTL.IP.OPEN_SOURCE', layer: 2, area: 'open_source', stage: 3, title: 'Open source policy', noun: 'open source policy', sev: 'low', tier: 5,
  src: [['Section 19 —', 'Open Source Software Compliance Policy']],
  slot: { id: 'intl_open_source', label: 'Open source policy or licence list', reason: 'Investors want to know your code has no licence problems hiding in it.' },
  fix: 'Write down which open source licences you allow, list what your product uses, and add it here.',
});

// --- Layer 3: compliance ----------------------------------------------------------------------

b.rule({
  id: 'INTL.SANCT.SCREENING', layer: 3, area: 'sanctions', stage: 2, title: 'Sanctions lists', sev: 'high', tier: 3,
  src: [['5. The core set', 'No sanctions or restricted-party matches']],
  sat: no(`${SANCTIONS}.match`), defect: yes(`${SANCTIONS}.match`), verify: yes(`${SANCTIONS}.possible_match`),
  evidence: ['Screening against official sanctions lists'], action: 'review',
  text: [
    "{company}'s name matches an entry on a sanctions list",
    'Your company name matched an entry on an official sanctions list. It may be another business with a similar name.',
    'Banks, investors and payment providers in most countries will not work with a party on these lists, so this needs a clear answer quickly.',
    'If it stays unresolved, it can stop your bank account, your payments and any fundraising.',
    'Get qualified advice today. If it is a false match, keep a note of why, so you have the answer when a bank asks.',
  ],
});
b.rule({
  id: 'INTL.DP.PRIVACY_NOTICE', layer: 3, area: 'privacy', stage: 2, title: 'Privacy notice', sev: 'medium', tier: 1, when: SITE,
  src: [['Section 7 —', '| Privacy Notice |']],
  sat: yes('web.policy.privacy_notice_found'), evidence: ['Your published privacy notice'], action: 'fix_website',
  text: [
    "We can't find a privacy notice on {company}'s website",
    "We looked at your website and couldn't find a privacy notice.",
    'Most countries expect a business to tell people what it does with their data. Customers and app stores look for one too.',
    "It's public, so customers, partners and investors can all see the gap.",
    'Publish a notice that says what data you collect, why, who you share it with and how people can reach you.',
  ],
});
b.doc({
  id: 'INTL.DP.PROCESSING_AGREEMENTS', layer: 3, area: 'privacy', stage: 2, title: 'Data processing agreements', noun: 'data processing agreements', sev: 'low', tier: 5, when: all(PD, yes('derived.has_processors')),
  src: [['Section 22 —', 'Data Processing Agreement']],
  slot: { id: 'intl_dpa', label: 'Data processing agreements', reason: 'If vendors handle personal data for you, this agreement says what they may do with it.' },
  fix: 'Collect the data processing terms from each vendor that handles personal data for you, and add them here.',
});
b.doc({
  id: 'INTL.SEC.INCIDENT_RESPONSE', layer: 3, area: 'security', stage: 3, title: 'Incident and data breach plan', noun: 'incident and data breach plan', sev: 'medium', tier: 5,
  src: [['Section 19 —', 'Incident Response Plan; Data Breach Response Policy']],
  slot: { id: 'intl_incident_response', label: 'Incident and data breach plan', reason: 'Many countries set short deadlines to report a breach, so you need to know who does what first.' },
  fix: 'Write a short plan saying who decides, who you tell and how fast, and add it here.',
});
b.doc({
  id: 'INTL.SEC.POLICIES', layer: 3, area: 'security', stage: 3, title: 'Information security policies', noun: 'information security policies', sev: 'low', tier: 5,
  src: [['Section 19 —', 'Cybersecurity Policy; Information Security Policy; Access Control Policy']],
  slot: { id: 'intl_security_policies', label: 'Information security policies', reason: 'Enterprise customers and investors expect these in writing.' },
  fix: 'Write down how you control access, protect data and handle devices, and add it here.',
});

// --- Layer 4: contracts -----------------------------------------------------------------------

b.rule({
  id: 'INTL.COM.TERMS', layer: 4, area: 'terms', stage: 2, title: 'Terms of service', sev: 'medium', tier: 1, when: SITE,
  src: [['Section 21 —', 'SaaS Agreement; Product Terms and Conditions; Website Terms of Service']],
  sat: yes('web.policy.terms_found'), evidence: ['Published terms'], action: 'fix_website',
  text: [
    "We can't find terms of service on {company}'s website",
    "We looked at your website and couldn't find terms of service.",
    'Terms set the rules for using your product and limit what you can be blamed for.',
    'Without them, a dispute with a customer is decided without the limits you would have chosen.',
    'Publish terms of service on your website and link to them where people sign up.',
  ],
});
b.doc({
  id: 'INTL.COM.CUSTOMER_CONTRACTS', layer: 4, area: 'contracts', stage: 3, title: 'Customer contract', noun: 'customer contract', sev: 'medium', tier: 5, when: any(yes('derived.enterprise'), yes('derived.takes_payments')),
  src: [['Section 21 —', 'Software Licence Agreement; Cloud Services Agreement; Service Level Agreement']],
  slot: { id: 'intl_customer_contracts', label: 'Customer contract (SaaS, licence or service agreement)', reason: 'It is what your customers sign, so investors and buyers read it.' },
  fix: 'Add the standard contract your customers sign, and any version a large customer changed.',
});
b.doc({
  id: 'INTL.COM.SUPPLIERS', layer: 4, area: 'contracts', stage: 3, title: 'Supplier and partner agreements', noun: 'supplier and partner agreements', sev: 'low', tier: 5,
  src: [['Section 22 —', 'Consultancy Agreement; Supplier Agreement; Commercial Partnership Agreement']],
  slot: { id: 'intl_suppliers', label: 'Supplier, partner and reseller agreements', reason: 'Investors want to see what you have agreed with your main partners.' },
  fix: 'Add the agreements with the suppliers and partners your business depends on.',
});
b.doc({
  id: 'INTL.EMP.CONTRACTS', layer: 4, area: 'employment_contracts', stage: 2, title: 'Employment contracts', noun: 'employment contracts', sev: 'medium', tier: 5, when: STAFF,
  src: [['Sections 16 and 17', '| Employment agreements |']],
  slot: { id: 'intl_employment_contracts', label: 'Employment contracts', reason: 'Each employee should have written terms, including pay, notice and who owns their work.' },
  fix: 'Give each employee signed written terms, and add them here.',
});
b.doc({
  id: 'INTL.EMP.CONTRACTOR_AGREEMENTS', layer: 4, area: 'employment_contracts', stage: 2, title: 'Contractor agreements', noun: 'contractor agreements', sev: 'medium', tier: 5, when: CONTRACTORS,
  src: [['Sections 16 and 17', 'Independent Contractor Agreements']],
  slot: { id: 'intl_contractor_agreements', label: 'Contractor agreements', reason: 'Each contractor should have one, with clear terms and an IP assignment.' },
  fix: 'Put a signed agreement in place with each contractor, and add it here.',
});

// --- Layer 5: fundraising ---------------------------------------------------------------------

b.doc({
  id: 'INTL.EQUITY.CAP_TABLE', layer: 5, area: 'cap_table', stage: 2, title: 'Shareholder register and cap table', noun: 'shareholder register and cap table', sev: 'high', tier: 5,
  src: [['Section 1 —', 'Stock ledger; register of shareholders']],
  slot: { id: 'intl_cap_table', label: 'Shareholder register or cap table', reason: 'It is the record of who owns what. It should match every share issue, and investors will not move without it.' },
  fix: 'Bring your cap table up to date, check it against every share issue, and add it here.',
});
b.doc({
  id: 'INTL.EQUITY.SHAREHOLDER_AGREEMENT', layer: 5, area: 'shareholders', stage: 2, title: 'Shareholder agreement', noun: 'shareholder agreement', sev: 'medium', tier: 5, when: INVESTED,
  src: [['Section 1 —', 'Shareholder Agreement']],
  slot: { id: 'intl_shareholder_agreement', label: 'Shareholder agreement', reason: 'It sets out what happens when a shareholder leaves or wants to sell.' },
  fix: 'Add your signed shareholder agreement. If you have outside shareholders and no agreement, agree one before the next round.',
});
b.doc({
  id: 'INTL.FUND.ROUND_DOCUMENTS', layer: 5, area: 'fundraising', stage: 4, title: 'Investment documents', noun: 'investment documents', sev: 'high', tier: 5, when: INVESTED,
  src: [['Section 22 —', 'SAFE Agreement; Convertible Note Agreement; Subscription Agreement']],
  slot: { id: 'intl_round_documents', label: 'SAFEs, notes and subscription agreements', reason: 'These are the agreements that gave investors their rights.' },
  fix: 'Add every signed investment agreement, and check each one appears in your cap table.',
});
b.doc({
  id: 'INTL.EQUITY.OPTION_PLAN', layer: 5, area: 'employee_equity', stage: 4, title: 'Share option plan', noun: 'share option plan', sev: 'medium', tier: 5, when: yes('derived.equity_incentives'),
  src: [['Section 22 —', 'Stock Option Plan; Equity Incentive Plan; Stock Option Grant Agreements']],
  slot: { id: 'intl_option_plan', label: 'Share option plan and grants', reason: 'Investors will check every option has a plan and an approval behind it.' },
  fix: 'Add the plan and each signed grant, with the decision that approved them.',
});

// --- Layer 6: AI and data ---------------------------------------------------------------------

b.doc({
  id: 'INTL.AI.USE_POLICY', layer: 6, area: 'ai_governance', stage: 2, title: 'AI use policy', noun: 'AI use policy', sev: 'medium', tier: 5, when: yes('derived.ai_or_staff_ai'),
  src: [['Section 21 —', 'AI Acceptable Use Policy']],
  slot: { id: 'intl_ai_use_policy', label: 'AI use policy', reason: 'It tells your team what they can and cannot put into AI tools.' },
  fix: 'Write a short policy on which AI tools your team may use and what they must never put into them, and add it here.',
});
b.doc({
  id: 'INTL.AI.GOVERNANCE', layer: 6, area: 'ai_governance', stage: 5, title: 'AI governance policy', noun: 'AI governance policy', sev: 'low', tier: 5, when: AI,
  src: [['Section 21 —', 'AI Governance Policy; AI Safety and Security Policy']],
  slot: { id: 'intl_ai_governance', label: 'AI governance policy', reason: 'As you grow, this shows who is responsible for your AI decisions.' },
  fix: 'Name who decides how AI is used in your product, write down how, and add it here.',
});
b.rule({
  id: 'INTL.AI.TRANSPARENCY', layer: 6, area: 'ai_governance', stage: 3, title: 'AI transparency', sev: 'low', tier: 1, when: AI,
  src: [['Section 16 —', 'AI Transparency Documentation', MAPS.uk]],
  sat: any(yes('web.policy.ai_disclosure_found'), held('intl_ai_transparency')), evidence: ['Published AI disclosures', 'Transparency records'], action: 'fix_website',
  slot: { id: 'intl_ai_transparency', label: 'AI transparency records', reason: 'People should know when they are dealing with AI.' },
  text: [
    "We can't see where {company} tells people it uses AI",
    "We couldn't find an AI disclosure on your website, and you haven't added transparency records.",
    'Some countries already require it, and customers increasingly expect to be told when they are dealing with AI.',
    'Enterprise customers and investors are starting to ask, and you would have no answer ready.',
    'Say on your website where your product uses AI, or add your transparency records here.',
  ],
});
b.doc({
  id: 'INTL.AI.VENDORS', layer: 6, area: 'ai_governance', stage: 3, title: 'AI supplier agreements', noun: 'AI supplier agreements', sev: 'low', tier: 5, when: yes('derived.ai_third_party_models'),
  src: [['Section 21 —', 'AI Vendor Agreements; AI Supplier Agreements']],
  slot: { id: 'intl_ai_vendors', label: 'AI supplier agreements', reason: 'If you use models from another company, these say what happens to your data and who owns the output.' },
  fix: 'Save the terms of each AI model or API you use, and add them here.',
});

export const intl = b.build();

/**
 * Country rules that ask for the same thing as an international rule. When any of them is in a
 * company's selection (a US state's federal pack, or a market's overlay), the international rule
 * is left out, so nobody is asked twice. A later country pack adds its own ids here.
 */
export const INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = {
  'INTL.CORP.CONSTITUTION': ['GB.CORP.ARTICLES', 'US-DE.CORP.BYLAWS', 'US-DE.CORP.OPERATING_AGREEMENT', 'NG.CORP.MEMART'],
  'INTL.CORP.OWNERS_AGREEMENT': ['GB.CORP.FOUNDERS_AGREEMENT', 'US-DE.CORP.FOUNDERS_AGREEMENT', 'NG.CORP.FOUNDERS_AGREEMENT'],
  'INTL.CORP.RESOLUTIONS': ['GB.CORP.RESOLUTIONS', 'NG.CORP.RESOLUTIONS', 'US-DE.CORP.ORGANISATIONAL_RESOLUTIONS'],
  'INTL.IP.OWNER_ASSIGNMENT': ['GB.IP.FOUNDER_ASSIGNMENT', 'US-DE.IP.FOUNDER_ASSIGNMENT', 'NG.IP.FOUNDER_ASSIGNMENT'],
  'INTL.IP.STAFF_ASSIGNMENT': ['US-DE.IP.PIIA', 'NG.IP.TEAM_ASSIGNMENT'],
  'INTL.IP.CONTRACTOR_ASSIGNMENT': ['GB.IP.CONTRACTOR_ASSIGNMENT', 'US-DE.IP.WORK_FOR_HIRE', 'NG.IP.TEAM_ASSIGNMENT'],
  'INTL.IP.NDA': ['GB.IP.NDA', 'US-DE.IP.NDA', 'NG.IP.NDA'],
  'INTL.IP.OPEN_SOURCE': ['GB.IP.OPEN_SOURCE', 'US-DE.IP.OPEN_SOURCE'],
  'INTL.SANCT.SCREENING': ['US.SANCT.SCREENING', 'GB.SANCT.SCREENING'],
  'INTL.DP.PRIVACY_NOTICE': ['GB.DP.PRIVACY_NOTICE', 'US-DE.DP.PRIVACY_NOTICE', 'NG.DP.PRIVACY_POLICY', 'US.CONSUMER.PRIVACY_DISCLOSURES'],
  'INTL.DP.PROCESSING_AGREEMENTS': ['GB.DP.PROCESSING_AGREEMENT', 'US-DE.DP.PROCESSING_AGREEMENT', 'NG.DP.PROCESSING_AGREEMENT', 'SG.DP.PROCESSING_AGREEMENTS'],
  'INTL.SEC.INCIDENT_RESPONSE': ['GB.SEC.INCIDENT_RESPONSE', 'US-DE.SEC.INCIDENT_RESPONSE', 'NG.SEC.INCIDENT_RESPONSE', 'GB.DP.BREACH', 'NG.DP.BREACH', 'CH.DP.BREACH', 'NZ.DP.BREACH'],
  'INTL.SEC.POLICIES': ['GB.SEC.POLICIES', 'US-DE.SEC.POLICIES', 'NG.SEC.POLICIES', 'US.CONSUMER.DATA_SECURITY'],
  'INTL.COM.TERMS': ['GB.COM.TERMS', 'US-DE.COM.TERMS', 'NG.COM.TERMS'],
  'INTL.COM.CUSTOMER_CONTRACTS': ['GB.COM.SAAS', 'NG.COM.SAAS', 'US-DE.COM.ENTERPRISE_CONTRACTS'],
  'INTL.COM.SUPPLIERS': ['GB.COM.SUPPLIER', 'US-DE.COM.COMMERCIAL_AGREEMENTS'],
  'INTL.EMP.CONTRACTS': ['GB.EMP.CONTRACTS', 'US-DE.EMP.AGREEMENTS', 'NG.EMP.AGREEMENTS'],
  'INTL.EMP.CONTRACTOR_AGREEMENTS': ['GB.EMP.CONTRACTOR_AGREEMENTS', 'US-DE.EMP.CONTRACTOR_AGREEMENTS', 'NG.EMP.CONTRACTOR_AGREEMENTS'],
  'INTL.EQUITY.CAP_TABLE': ['US-DE.EQUITY.STOCK_LEDGER', 'GB.CORP.STATUTORY_REGISTERS', 'NG.CORP.STATUTORY_REGISTERS', 'NG.EQUITY.ALLOTMENTS', 'NZ.CORP.SHARE_REGISTER'],
  'INTL.EQUITY.SHAREHOLDER_AGREEMENT': ['US-DE.EQUITY.SHAREHOLDER_AGREEMENT'],
  'INTL.FUND.ROUND_DOCUMENTS': ['GB.FUND.ROUND_DOCUMENTS', 'US-DE.EQUITY.INVESTOR_AGREEMENTS'],
  'INTL.EQUITY.OPTION_PLAN': ['GB.EQUITY.OPTION_SCHEME', 'US-DE.EQUITY.OPTION_PLAN'],
};

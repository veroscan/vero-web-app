import type { Logic } from '../logic.js';
import { all, any, eq, MAPS, no, told, yes, type packBuilder } from './helper.js';

/**
 * The rules that are the same in every EU member state, and the part of them that reaches the
 * EEA, written once and added to each EU or EEA country's own pack by addEuCommon. Encoded from
 * docs/knowledge/vero-scan-eu-common-rule-pack-map.md; items left out, and why, are listed at the
 * end of that map ("Not encoded"). Draft, like every pack, until a lawyer approves it.
 *
 * Each rule carries the country's prefix (FR.DP.ROPA, NL.DP.ROPA) because a rule belongs to one
 * pack, and each carries a shared obligation (eu_ropa), so a company is asked once: its home
 * country's rule counts, and the same rule in another EU country's pack, brought in by users
 * there, gives way (overlay.ts). Attestations use one key for every country (attest.eu_*).
 *
 * Norway is EEA, not EU (map note 2): the GDPR, ePrivacy, e-commerce, consumer and company-law
 * rules reach it through Norwegian law, but the VAT Directive, VIES, the AI Act (not Norwegian law
 * on 16 Nov 2026), the accessibility act, the AMLR, the prospectus rules and the DSA are left out
 * for an EEA-only country, and so is the 2023/2673 withdrawal function, whose Norwegian status the
 * maps don't give.
 */

type Builder = ReturnType<typeof packBuilder>;

const EU = MAPS.eu;
const S1 = 'EU Section 1 —';
const S2 = 'EU Section 2 —';
const S3 = 'EU Section 3 —';
const S4 = 'EU Section 4 —';
const S5 = 'EU Section 5 —';
const S6 = 'EU Section 6 —';
const S7 = 'EU Section 7 —';
const S8 = 'EU Section 8 —';
const S10 = 'EU Section 10 —';
const S12 = 'EU Section 12 —';
const CORE = '5. The EU core set';

/** EU member states (the ones VIES covers), and the EEA countries that are not EU members. */
export const EU_MEMBER_STATES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
] as const;
export const EEA_ONLY = ['NO', 'IS', 'LI'] as const;

/** Every EU common rule, by its key. A country can leave one out and write its own (see `omit`). */
export const EU_KEYS = [
  'PRIVACY_NOTICE', 'NOTICE_AUTHORITY', 'RIGHT_TO_OBJECT', 'CHILD_CONSENT', 'ROPA', 'PROCESSING_AGREEMENTS', 'BY_DESIGN', 'DPIA',
  'AUTOMATED_DECISIONS', 'DPO', 'BREACH', 'TRANSFERS', 'COOKIE_CONSENT', 'COOKIE_POLICY', 'WEBSITE_IDENTITY', 'REGULATOR_NAMED',
  'PRICES', 'ADS_IDENTIFIABLE', 'ORDERING_STEPS', 'COMPANY_PARTICULARS', 'CONSUMER_INFO', 'ORDER_BUTTON', 'WITHDRAWAL',
  'DIGITAL_CONTENT', 'WITHDRAWAL_FUNCTION', 'CONSUMER_COMPLAINTS', 'VAT_VIES', 'UBO_ANNUAL_CHECK', 'AI_ROLES', 'AI_PROHIBITED',
  'AI_PROHIBITED_GENERATIVE', 'AI_LITERACY', 'AI_HIGH_RISK', 'AI_ANNEX_I', 'ACCESSIBILITY', 'PROSPECTUS', 'DSA_CONTACT',
  // Added 18 Nov 2026: representatives for companies outside the EU, and the DSA points of contact.
  'EU_REPRESENTATIVE', 'DSA_REPRESENTATIVE', 'DSA_POINTS_OF_CONTACT',
] as const;
export type EuKey = (typeof EU_KEYS)[number];

/** The shared obligation behind each EU common rule: one per company, whichever EU pack asks. */
export function euObligation(key: EuKey): string {
  return `eu_${key.toLowerCase()}`;
}

/** Rule id of an EU common rule in one country's pack: FR.DP.ROPA. */
export function euRuleId(cc: string, key: EuKey): string {
  return `${cc}.${ID_PART[key]}`;
}

const ID_PART: Record<EuKey, string> = {
  PRIVACY_NOTICE: 'DP.PRIVACY_NOTICE',
  NOTICE_AUTHORITY: 'DP.NOTICE_AUTHORITY',
  RIGHT_TO_OBJECT: 'DP.RIGHT_TO_OBJECT',
  CHILD_CONSENT: 'DP.CHILD_CONSENT',
  ROPA: 'DP.ROPA',
  PROCESSING_AGREEMENTS: 'DP.PROCESSING_AGREEMENTS',
  BY_DESIGN: 'DP.BY_DESIGN',
  DPIA: 'AI.DPIA',
  AUTOMATED_DECISIONS: 'AI.AUTOMATED_DECISIONS',
  DPO: 'DP.DPO',
  BREACH: 'DP.BREACH',
  TRANSFERS: 'DP.TRANSFERS',
  COOKIE_CONSENT: 'DP.COOKIE_CONSENT',
  COOKIE_POLICY: 'DP.COOKIE_POLICY',
  WEBSITE_IDENTITY: 'COM.WEBSITE_IDENTITY',
  REGULATOR_NAMED: 'COM.REGULATOR_NAMED',
  PRICES: 'CONSUMER.PRICES',
  ADS_IDENTIFIABLE: 'CONSUMER.ADS_IDENTIFIABLE',
  ORDERING_STEPS: 'CONSUMER.ORDERING_STEPS',
  COMPANY_PARTICULARS: 'CORP.COMPANY_PARTICULARS',
  CONSUMER_INFO: 'CONSUMER.PRE_CONTRACT_INFO',
  ORDER_BUTTON: 'CONSUMER.ORDER_BUTTON',
  WITHDRAWAL: 'CONSUMER.WITHDRAWAL',
  DIGITAL_CONTENT: 'CONSUMER.DIGITAL_CONTENT',
  WITHDRAWAL_FUNCTION: 'CONSUMER.WITHDRAWAL_FUNCTION',
  CONSUMER_COMPLAINTS: 'CONSUMER.COMPLAINTS',
  VAT_VIES: 'TAX.VAT_VIES',
  UBO_ANNUAL_CHECK: 'CORP.UBO_ANNUAL_CHECK',
  AI_ROLES: 'AI.ROLES',
  AI_PROHIBITED: 'AI.PROHIBITED_PRACTICES',
  AI_PROHIBITED_GENERATIVE: 'AI.PROHIBITED_GENERATIVE',
  AI_LITERACY: 'AI.LITERACY',
  AI_HIGH_RISK: 'AI.HIGH_RISK',
  AI_ANNEX_I: 'AI.HIGH_RISK_PRODUCTS',
  ACCESSIBILITY: 'CONSUMER.ACCESSIBILITY',
  PROSPECTUS: 'FUND.PROSPECTUS_EXEMPTION',
  DSA_CONTACT: 'COM.DSA_CONTACT',
  EU_REPRESENTATIVE: 'DP.EU_REPRESENTATIVE',
  DSA_REPRESENTATIVE: 'COM.DSA_REPRESENTATIVE',
  DSA_POINTS_OF_CONTACT: 'COM.DSA_POINTS_OF_CONTACT',
};

/** EEA-wide: these reach Norway through Norwegian law. Everything else is EU only. */
const EEA_KEYS: ReadonlySet<EuKey> = new Set<EuKey>([
  'PRIVACY_NOTICE', 'NOTICE_AUTHORITY', 'RIGHT_TO_OBJECT', 'CHILD_CONSENT', 'ROPA', 'PROCESSING_AGREEMENTS', 'BY_DESIGN', 'DPIA',
  'AUTOMATED_DECISIONS', 'DPO', 'BREACH', 'TRANSFERS', 'COOKIE_CONSENT', 'COOKIE_POLICY', 'WEBSITE_IDENTITY', 'REGULATOR_NAMED',
  'PRICES', 'ADS_IDENTIFIABLE', 'ORDERING_STEPS', 'COMPANY_PARTICULARS', 'CONSUMER_INFO', 'ORDER_BUTTON', 'WITHDRAWAL',
  'DIGITAL_CONTENT', 'CONSUMER_COMPLAINTS',
]);

export interface EuOptions {
  /** The country's code, as its pack: FR. */
  cc: string;
  /** EU member (true), or EEA only (false: Norway). */
  eu: boolean;
  /** The national data protection authority, as people know it: the CNIL, Datatilsynet. */
  authority: string;
  /**
   * Whether the country's sites are mostly in English. Information only: the website scan reads the
   * main EU languages and never reports a page missing on a site in a language it can't read, and a
   * page missing where web.policy.language_supported is false is "to check", never a gap.
   */
  english: boolean;
  /** National age of digital consent, only where the country map gives it without [verify]. */
  consentAge?: number;
  /** Rules the country writes itself, with euObligation(key) as their shared obligation. */
  omit?: readonly EuKey[];
  /** Lines in the country's own map (no [verify] on them) that a rule also rests on. */
  extraSrc?: Partial<Record<EuKey, [string, string][]>>;
}

const SITE = yes('derived.has_website_or_app');
const WEB = yes('derived.has_website');
const PD = yes('derived.personal_data');
const CONSUMER = yes('derived.consumer');
const AI = yes('derived.uses_ai');
const INVESTED = yes('derived.invested');
const ONLINE_ORDERS = all(SITE, yes('derived.takes_payments'));
const oneOf = (key: string, values: string[]): Logic => ({ in: [{ var: key }, values] });
const includes = (value: string, key: string): Logic => ({ in: [value, { var: key }] });
const MARKETING = oneOf('answers.marketing_consent', ['opt_in', 'opt_out']);
const REGULATED = any(...['payments', 'lending', 'crypto', 'banking', 'insurtech', 'securities'].map((name) => yes(`derived.sector.${name}`)));
/** Annex III uses the questionnaire can see: hiring, credit, education, insurance, biometrics. */
const ANNEX_III = any(...['hiring', 'credit', 'education', 'insurance', 'biometrics'].map((use) => includes(use, 'answers.ai_use_cases')));
/** Clearly not a microenterprise (EU map Section 8): more than 10 people, or revenue over $26m. */
const ABOVE_MICRO = any(oneOf('answers.headcount_band', ['11_50', '51_100', 'over_100']), eq('answers.revenue_band', 'over_26m'));
const VIES = 'registry.eu.vies_vat';
/** An intermediary service (hosting users' content, a platform): the DSA's trigger. */
const PLATFORM = yes('derived.sector.platform');
/** No establishment in the EU (`derived.eu_established`: registered in a member state, or an office, branch or staff there). */
const NOT_IN_EU = no('derived.eu_established');

export function addEuCommon(b: Builder, o: EuOptions): void {
  const lc = o.cc.toLowerCase();
  const skip = new Set(o.omit ?? []);
  const wants = (key: EuKey) => !skip.has(key) && (o.eu || EEA_KEYS.has(key));
  const src = (key: EuKey, ...lines: [string, string][]): [string, string, string?][] => [
    ...lines.map(([section, line]): [string, string, string] => [section, line, EU]),
    ...(o.extraSrc?.[key] ?? []),
  ];
  const common = (key: EuKey) => ({ id: euRuleId(o.cc, key), shared: euObligation(key) });
  /** A page the scan looks for: on a site in another language, not finding it is "to check". */
  const pageCheck = (fact: string) => ({ verify: all(no(fact), no('web.policy.language_supported')) });
  const dpa = o.authority;

  // --- EU Section 1: GDPR ------------------------------------------------------------------------

  if (wants('PRIVACY_NOTICE')) b.rule({
    ...common('PRIVACY_NOTICE'), layer: 3, area: 'data_protection', stage: 2, title: 'Privacy notice', sev: 'high', tier: 1, regulator: dpa, when: SITE,
    src: src('PRIVACY_NOTICE', [S1, 'Privacy notice with the Article 13 information']), law: [['GDPR', 'Arts 12-13']],
    sat: yes('web.policy.privacy_notice_found'), ...pageCheck('web.policy.privacy_notice_found'),
    evidence: ['Your published privacy notice'], action: 'fix_website',
    text: [
      "We can't find a privacy notice on {company}'s website",
      "We looked at your website and couldn't find a privacy notice.",
      'People have to be told who you are, what data you use and why, who gets it, how long you keep it, and what their rights are.',
      "It's public, so customers, partners and the data protection authority can all see the gap.",
      'Publish a notice with those details and link it from every page. If you have one, check it is linked from your footer.',
    ],
  });
  if (wants('NOTICE_AUTHORITY')) b.rule({
    ...common('NOTICE_AUTHORITY'), layer: 3, area: 'data_protection', stage: 2, title: 'Privacy notice names the data protection authority', sev: 'low', tier: 1, regulator: dpa, when: all(SITE, PD),
    src: src('NOTICE_AUTHORITY', [S1, 'Notice names the national supervisory authority']), law: [['GDPR', 'Art 13(2)(d)']],
    sat: any(yes('web.policy.dpa_named'), told('eu_notice_names_authority')), evidence: ['Your published privacy notice', 'Your confirmation'], action: 'fix_website',
    text: [
      "You haven't confirmed {company}'s privacy notice says where people can complain",
      `We couldn't find a data protection authority named in your privacy notice, and you haven't confirmed it tells people they can complain to ${dpa}.`,
      'People must be told they can complain to a data protection authority.',
      'A notice without it is incomplete, and anyone who reads it can see that.',
      `Add a line naming ${dpa} and how to reach it, then confirm here.`,
    ],
  });
  if (wants('RIGHT_TO_OBJECT')) b.rule({
    ...common('RIGHT_TO_OBJECT'), layer: 3, area: 'data_protection', stage: 2, title: 'Right to object shown clearly', sev: 'low', tier: 5, regulator: dpa, when: PD,
    src: src('RIGHT_TO_OBJECT', [S1, 'Right to object shown explicitly']), law: [['GDPR', 'Art 21(4)']],
    sat: told('eu_right_to_object'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company} tells people they can object",
      "We don't have your confirmation that people are told, clearly and apart from other information, that they can object.",
      'If you rely on legitimate interests or send direct marketing, people can object, and they must be told so plainly.',
      'People who never saw the choice can complain, and marketing sent after an objection is a breach.',
      'Show the right to object clearly in your notice and in your marketing, then confirm here.',
    ],
  });
  if (wants('CHILD_CONSENT')) {
    const age = o.consentAge;
    b.rule({
      ...common('CHILD_CONSENT'), layer: 3, area: 'data_protection', stage: 2, title: "Children's consent online", sev: 'medium', tier: 5, regulator: dpa, when: all(PD, yes('answers.users_under_18')),
      src: src('CHILD_CONSENT', [S1, 'Age of digital consent for online services to children']), law: [['GDPR', 'Art 8(1)']],
      ...(age !== undefined ? { params: { age_of_digital_consent: age } } : {}),
      sat: told('eu_child_consent'), evidence: ['Your confirmation'], action: 'attest',
      text: [
        "You haven't confirmed how {company} gets consent for children",
        "We don't have your confirmation of how you handle consent from children who use your service.",
        age !== undefined
          ? `Below ${age}, consent for an online service has to come from a parent as well, where you rely on consent.`
          : 'Below a national age, consent for an online service has to come from a parent, where you rely on consent.',
        "Data collected without valid consent has no legal basis, and children's data is watched closely.",
        'Set up an age check and a parent consent step where you need one, then confirm here.',
      ],
    });
  }
  if (wants('ROPA')) b.doc({
    ...common('ROPA'), layer: 3, area: 'data_protection', stage: 2, title: 'Records of processing activities', noun: 'records of processing', sev: 'medium', tier: 5, regulator: dpa, when: PD,
    src: src('ROPA', [S1, '| Records of processing activities |']), law: [['GDPR', 'Art 30']],
    slot: { id: `${lc}_ropa`, label: 'Records of processing activities', reason: 'It is the list of what personal data you hold, why, and who it goes to. Most companies that hold customer data need one.' },
    fix: 'Write down each kind of personal data you use, why, who gets it and how long you keep it, and add it here.',
  });
  if (wants('PROCESSING_AGREEMENTS')) b.doc({
    ...common('PROCESSING_AGREEMENTS'), layer: 3, area: 'data_protection', stage: 2, title: 'Data processing agreements', noun: 'data processing agreements', sev: 'medium', tier: 5, regulator: dpa, when: all(PD, yes('derived.has_processors')),
    src: src('PROCESSING_AGREEMENTS', [S1, 'Processor agreements (DPAs)']), law: [['GDPR', 'Art 28(3)']],
    slot: { id: `${lc}_dpa`, label: 'Data processing agreements', reason: 'Each vendor that handles personal data for you needs a written agreement saying what it may do with it.' },
    fix: 'Collect the data processing terms from each vendor that handles personal data for you, and add them here.',
  });
  if (wants('BY_DESIGN')) b.rule({
    ...common('BY_DESIGN'), layer: 3, area: 'data_protection', stage: 2, title: 'Data protection by design and by default', sev: 'low', tier: 5, regulator: dpa, when: PD,
    src: src('BY_DESIGN', [S1, 'Data protection by design and by default']), law: [['GDPR', 'Art 25']],
    sat: told('eu_privacy_by_design'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company} builds privacy into its product",
      "We don't have your confirmation that your product collects only what it needs and starts from the most private settings.",
      'Privacy has to be part of how the product is built, not added afterwards.',
      'It is hard to show after the fact, and it comes up whenever something goes wrong.',
      'Check your product collects the least data it needs, with private defaults, then confirm here.',
    ],
  });
  if (wants('DPIA')) b.doc({
    ...common('DPIA'), layer: 6, area: 'data_governance', stage: 2, title: 'Data protection impact assessment', noun: 'data protection impact assessment', sev: 'high', tier: 5, regulator: dpa, when: all(PD, yes('derived.high_risk_processing')),
    src: src('DPIA', [S1, 'DPIA for high-risk processing']), law: [['GDPR', 'Art 35']],
    slot: { id: `${lc}_dpia`, label: 'Data protection impact assessment', reason: 'Profiling, AI, sensitive data and monitoring people call for a written assessment before you start.' },
    fix: 'Write the assessment for each high-risk use: what you do, the risks to people, and how you reduce them. Add it here.',
  });
  if (wants('AUTOMATED_DECISIONS')) b.rule({
    ...common('AUTOMATED_DECISIONS'), layer: 6, area: 'data_governance', stage: 3, title: 'Automated decisions about people', sev: 'medium', tier: 5, regulator: dpa, when: all(AI, PD, yes('answers.automated_decisions')),
    src: src('AUTOMATED_DECISIONS', [S1, 'Automated decisions: safeguards and notice']), law: [['GDPR', 'Art 22(1), Art 13(2)(f)']],
    sat: told('eu_automated_decisions'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company}'s safeguards for automated decisions",
      'You told us software makes big decisions about people by itself, and we have no confirmation of your safeguards.',
      'People must be told about these decisions, and be able to ask a person to look again and to challenge the result.',
      'A decision made without those safeguards can be challenged, and the authority can stop the processing.',
      'Tell people in your notice, offer a human review, then confirm here.',
    ],
  });
  if (wants('DPO')) b.rule({
    ...common('DPO'), layer: 3, area: 'data_protection', stage: 2, title: 'Data protection officer', sev: 'medium', tier: 5, regulator: dpa, when: all(PD, yes('derived.sensitive_data')),
    src: src('DPO', [S1, 'DPO designated where required']), law: [['GDPR', 'Art 37']],
    sat: told('eu_dpo'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed whether {company} needs a data protection officer",
      "You told us you handle sensitive data, and we don't have your confirmation that you checked whether you need a data protection officer.",
      'Companies whose core work is monitoring people at scale, or handling sensitive data at scale, must name one and publish the contact.',
      `If you need one and haven't named one, ${dpa} can act on it.`,
      `Check whether the tests apply to you. If they do, name your officer, publish the contact, tell ${dpa}, and confirm here.`,
    ],
  });
  if (wants('BREACH')) b.doc({
    ...common('BREACH'), layer: 3, area: 'data_protection', stage: 2, title: 'Data breach plan and log', noun: 'data breach plan and log', sev: 'medium', tier: 5, regulator: dpa, when: PD,
    src: src('BREACH', [S1, 'Breach notification within 72 hours; breach log']), law: [['GDPR', 'Art 33']],
    slot: { id: `${lc}_breach_plan`, label: 'Data breach response plan and breach log', reason: `A breach can have to be reported to ${dpa} within 72 hours, so you need to know who does what first, and keep a log.` },
    fix: 'Write a short plan saying who decides, who tells the authority and how fast, keep a log of every breach, and add both here.',
  });
  if (wants('TRANSFERS')) b.doc({
    ...common('TRANSFERS'), layer: 3, area: 'data_protection', stage: 2, title: 'Safeguards for data leaving the EEA', noun: 'safeguards for data leaving the EEA', sev: 'medium', tier: 5, regulator: dpa, when: all(PD, yes('answers.data_outside_eea')),
    src: src('TRANSFERS', [S1, 'International transfer safeguards (SCCs or other Art 46 tool)']), law: [['GDPR', 'Arts 44, 46']],
    slot: { id: `${lc}_transfers`, label: 'Data transfer safeguards (standard contractual clauses or similar)', reason: 'Personal data sent outside the EEA needs a safeguard in place, such as the EU standard contractual clauses.' },
    fix: 'Put standard contractual clauses or another approved safeguard in place with each recipient outside the EEA, and add them here.',
  });

  // --- EU Section 2: ePrivacy and cookies --------------------------------------------------------

  if (wants('COOKIE_CONSENT')) b.rule({
    ...common('COOKIE_CONSENT'), layer: 3, area: 'cookies', stage: 2, title: 'Cookie consent', sev: 'high', tier: 1, regulator: dpa, when: WEB,
    src: src('COOKIE_CONSENT', [S2, 'Consent before non-essential cookies or similar storage'], [CORE, 'No non-essential cookies or trackers before consent; consent tool present']),
    law: [['Directive 2002/58/EC', 'Art 5(3)']],
    sat: no('derived.web.trackers_before_consent'), evidence: ['What your site set before anyone agreed'], action: 'fix_website',
    text: [
      "{company}'s website sets cookies before anyone has agreed",
      'We loaded your site and it set non-essential cookies or loaded trackers before anyone agreed.',
      'Cookies and trackers that are not strictly needed have to wait until the person agrees.',
      'Anyone can see this from outside, and it is one of the first things a data protection authority checks.',
      'Set up your consent banner to hold those tags back until someone agrees.',
    ],
  });
  if (wants('COOKIE_POLICY')) b.rule({
    ...common('COOKIE_POLICY'), layer: 3, area: 'cookies', stage: 2, title: 'Cookie information', sev: 'medium', tier: 1, regulator: dpa, when: WEB,
    src: src('COOKIE_POLICY', [S2, 'Cookie information (purposes, who sets them)']), law: [['Directive 2002/58/EC', 'Art 5(3)']],
    sat: yes('web.policy.cookie_policy_found'), ...pageCheck('web.policy.cookie_policy_found'), evidence: ['Your published cookie policy'], action: 'fix_website',
    text: [
      "We can't find cookie information on {company}'s website",
      "We couldn't find a cookie policy on your website.",
      'People must get clear information on what each cookie is for and who sets it.',
      "It's public, so it's one of the first things someone checks.",
      'Publish a cookie policy and link it from your footer and your consent banner.',
    ],
  });

  // --- EU Section 3: e-commerce information duties -------------------------------------------------

  if (wants('WEBSITE_IDENTITY')) b.rule({
    ...common('WEBSITE_IDENTITY'), layer: 4, area: 'website_information', stage: 2, title: 'Who you are, on your website', sev: 'medium', tier: 1, when: SITE,
    src: src('WEBSITE_IDENTITY', [S3, 'Provider identity on the website: name, geographic address, email'], [S3, 'Trade register and registration number on the website'], [S3, 'VAT number on the website']),
    law: [['Directive 2000/31/EC', 'Art 5(1)']],
    // The scan sees a legal notice page and the company number on the site, not the rest of its content.
    sat: any(all(yes('web.policy.legal_notice_present'), yes('web.policy.registration_number_shown')), told('eu_website_identity')),
    evidence: ['Your website legal notice', 'Your confirmation'], action: 'fix_website',
    text: [
      "We can't see who runs {company} on its website",
      "We don't have your confirmation that your website shows the company's name, address, email, register and company number, and VAT number if you have one. We couldn't find a legal notice with your company number on your site.",
      'Anyone using an online service must be able to find out, easily, who runs it.',
      'Customers and partners look for it, and missing details can be fined in most EU countries.',
      'Add a legal notice page with those details, link it from every page, then confirm here.',
    ],
  });
  if (wants('REGULATOR_NAMED')) b.rule({
    ...common('REGULATOR_NAMED'), layer: 4, area: 'website_information', stage: 2, title: 'Your licensing authority, on your website', sev: 'low', tier: 5, when: all(SITE, REGULATED),
    src: src('REGULATOR_NAMED', [S3, 'Supervisory authority named']), law: [['Directive 2000/31/EC', 'Art 5(1)(e)']],
    sat: told('eu_regulator_named'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company}'s website names the authority that licenses it",
      "You told us you are in a regulated sector, and we don't have your confirmation that your website names the authority that supervises you.",
      'Where an activity needs a licence, the website has to say which authority supervises it.',
      'Customers and partners check this before they trust you with money or data.',
      'Name your supervising authority and your licence on your legal notice page, then confirm here.',
    ],
  });
  if (wants('PRICES')) b.rule({
    ...common('PRICES'), layer: 4, area: 'consumer_protection', stage: 3, title: 'Clear prices', sev: 'medium', tier: 5, when: all(SITE, CONSUMER),
    src: src('PRICES', [S3, 'Prices clear, with tax and delivery stated']), law: [['Directive 2000/31/EC', 'Art 5(2)']],
    sat: told('eu_prices_clear'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company}'s prices are shown in full",
      "We don't have your confirmation that your prices say clearly whether tax and delivery are included.",
      'Prices shown to consumers online have to be clear, including tax and any delivery costs.',
      'Unclear prices lead to complaints and refunds, and consumer authorities act on them.',
      'Show the full price with tax, and any extra costs, before people buy. Then confirm here.',
    ],
  });
  if (wants('ADS_IDENTIFIABLE')) b.rule({
    ...common('ADS_IDENTIFIABLE'), layer: 4, area: 'marketing', stage: 3, title: 'Marketing you can recognise as marketing', sev: 'low', tier: 5, when: all(SITE, MARKETING),
    src: src('ADS_IDENTIFIABLE', [S3, 'Commercial communications identifiable as such']), law: [['Directive 2000/31/EC', 'Art 6']],
    sat: told('eu_ads_identifiable'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company}'s marketing is clearly marked",
      "We don't have your confirmation that your marketing messages are clearly marked as marketing, and say who sends them.",
      'People must be able to tell an advert or offer from other content, and see who it comes from.',
      'Hidden marketing is a consumer law breach and damages trust.',
      'Mark offers and adverts as such, with your company name, then confirm here.',
    ],
  });
  if (wants('ORDERING_STEPS')) b.rule({
    ...common('ORDERING_STEPS'), layer: 4, area: 'consumer_protection', stage: 3, title: 'Ordering steps shown before an order', sev: 'low', tier: 5, when: ONLINE_ORDERS,
    src: src('ORDERING_STEPS', [S3, 'Ordering steps, error correction and contract languages shown before an order']), law: [['Directive 2000/31/EC', 'Art 10(1)']],
    sat: told('eu_ordering_steps'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company} explains how ordering works",
      "We don't have your confirmation that your site explains the steps to order, how to fix a mistake, and which languages the contract comes in.",
      'Before an online order, people must be told the steps, how to correct errors, and the contract languages.',
      'Mistaken orders are harder to resolve, and the information is a legal duty.',
      'Add this to your checkout or terms, then confirm here.',
    ],
  });
  if (wants('COMPANY_PARTICULARS')) b.rule({
    ...common('COMPANY_PARTICULARS'), layer: 1, area: 'governance', stage: 2, title: 'Company details on letters, forms and website', sev: 'low', tier: 5,
    src: src('COMPANY_PARTICULARS', [S3, 'Company particulars on letters, order forms and website']), law: [['Directive (EU) 2017/1132', 'Art 26']],
    sat: told('eu_company_particulars'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company}'s letters and website carry its company details",
      "We don't have your confirmation that your letters, order forms and website show the register, company number, legal form and registered office.",
      'Company law asks every company to show these details on its paperwork and website.',
      'Missing details can be fined, and they make the company look less established.',
      'Add the details to your letter and invoice templates and your website footer, then confirm here.',
    ],
  });

  // --- EU Section 4: consumer law ---------------------------------------------------------------

  if (wants('CONSUMER_INFO')) b.rule({
    ...common('CONSUMER_INFO'), layer: 4, area: 'consumer_protection', stage: 3, title: 'Information before a consumer buys', sev: 'medium', tier: 5, when: CONSUMER,
    src: src('CONSUMER_INFO', [S4, 'Consumer terms with the pre-contract information']), law: [['Directive 2011/83/EU', 'Art 6(1)']],
    sat: told('eu_consumer_info'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company}'s consumer terms give the required information",
      "We don't have your confirmation that consumers see who you are, the total price, and their right to withdraw, before they buy.",
      'Consumers buying at a distance must get a set list of information first.',
      'Missing information can extend the withdrawal period and put the burden on you in a dispute.',
      'Check your consumer terms and checkout against the list, then confirm here.',
    ],
  });
  if (wants('ORDER_BUTTON')) b.rule({
    ...common('ORDER_BUTTON'), layer: 4, area: 'consumer_protection', stage: 3, title: 'Order button wording', sev: 'medium', tier: 5, when: all(CONSUMER, ONLINE_ORDERS),
    src: src('ORDER_BUTTON', [S4, 'Order button says "order with obligation to pay"']), law: [['Directive 2011/83/EU', 'Art 8(2)']],
    sat: told('eu_order_button'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company}'s order button says it means paying",
      "We don't have your confirmation that the button that places an order says plainly that it means paying.",
      'The final button must say the order comes with an obligation to pay, or words that mean the same.',
      'If it does not, the consumer is not bound by the order.',
      'Label the button with words like "Order and pay", then confirm here.',
    ],
  });
  if (wants('WITHDRAWAL')) b.rule({
    ...common('WITHDRAWAL'), layer: 4, area: 'consumer_protection', stage: 3, title: '14-day right to withdraw', sev: 'medium', tier: 1, when: CONSUMER,
    src: src('WITHDRAWAL', [S4, '14-day withdrawal right explained; refund policy']), law: [['Directive 2011/83/EU', 'Art 9(1)']],
    sat: any(yes('web.policy.refund_policy_found'), told('eu_withdrawal_info')), ...pageCheck('web.policy.refund_policy_found'),
    evidence: ['Your published refund or cancellation page', 'Your confirmation'], action: 'fix_website',
    text: [
      "We can't see where {company} explains the right to withdraw",
      "We couldn't find a refund or cancellation page on your website, and you haven't confirmed how consumers are told about withdrawal.",
      'Consumers buying online can usually withdraw within 14 days, and must be told how.',
      'If they are not told, the withdrawal period can run on for up to a year.',
      'Publish your withdrawal and refund terms and link them from checkout, or confirm here how you tell people.',
    ],
  });
  if (wants('DIGITAL_CONTENT')) b.rule({
    ...common('DIGITAL_CONTENT'), layer: 4, area: 'consumer_protection', stage: 3, title: 'Consent before supplying digital content at once', sev: 'medium', tier: 5, when: all(CONSUMER, SITE),
    src: src('DIGITAL_CONTENT', [S4, 'Digital content: consent and acknowledgement before immediate supply']), law: [['Directive 2011/83/EU', 'Art 16(m)']],
    sat: told('eu_digital_content_consent'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company} asks before starting a digital service at once",
      "We don't have your confirmation that consumers agree, and confirm they understand they lose the right to withdraw, before you supply digital content or a service straight away.",
      'Without that consent and confirmation, a consumer keeps the right to withdraw after using what you supplied.',
      'Consumers can ask for their money back after using the product.',
      'Add a tick box and a confirmation step before access starts, then confirm here.',
    ],
  });
  if (wants('WITHDRAWAL_FUNCTION')) b.rule({
    ...common('WITHDRAWAL_FUNCTION'), layer: 4, area: 'consumer_protection', stage: 3, title: 'Online withdrawal button', sev: 'medium', tier: 5, when: all(CONSUMER, SITE), from: '2026-06-19',
    src: src('WITHDRAWAL_FUNCTION', [S4, 'Online withdrawal function ("withdraw from contract here"), from 19 Jun 2026']), law: [['Directive (EU) 2023/2673', 'Art 11a of Directive 2011/83/EU']],
    sat: told('eu_withdrawal_function'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company} has an online withdrawal button",
      "We don't have your confirmation that consumers who signed up online can withdraw online, with a clear button and a confirmation step.",
      'Since 19 June 2026, contracts made online need a clear way to withdraw online, with an acknowledgement sent to the consumer.',
      'Consumer authorities can act on it, and consumers can complain that withdrawing was made hard.',
      'Add a clearly labelled withdrawal button with a confirm step and an emailed acknowledgement, then confirm here.',
    ],
  });
  if (wants('CONSUMER_COMPLAINTS')) b.rule({
    ...common('CONSUMER_COMPLAINTS'), layer: 4, area: 'consumer_protection', stage: 3, title: 'How consumers can complain', sev: 'low', tier: 1, when: CONSUMER,
    src: src('CONSUMER_COMPLAINTS', [S4, 'Complaints route for consumers']),
    sat: any(yes('web.policy.complaints_policy_found'), told('eu_consumer_complaints')), ...pageCheck('web.policy.complaints_policy_found'),
    evidence: ['Your published complaints page', 'Your confirmation'], action: 'fix_website',
    text: [
      "We can't see how consumers can complain to {company}",
      "We couldn't find a complaints page on your website, and you haven't confirmed how consumers can complain.",
      'Consumers should be able to find out how to complain, and who can help if you disagree.',
      'Complaints with nowhere to go end up with consumer authorities.',
      'Publish how to complain and link it from your footer, or confirm here how you tell people.',
    ],
  });

  // --- EU Section 5: VAT (EU members only; not Norway) -------------------------------------------

  if (wants('VAT_VIES')) b.rule({
    ...common('VAT_VIES'), layer: 3, area: 'tax', stage: 3, title: 'VAT number valid for EU trade', sev: 'medium', tier: 1, regulator: 'VIES',
    src: src('VAT_VIES', [S5, 'VAT number valid in VIES']),
    // VIES saying "not valid" can mean registered at home but not for EU trade: a person checks it.
    sat: yes(`${VIES}.valid`), verify: no(`${VIES}.valid`), evidence: ['VIES check of your VAT number'], action: 'review',
    text: [
      "VIES doesn't show {company}'s VAT number as valid",
      'We checked your VAT number with VIES, the EU VAT number service, and it did not come back as valid for EU trade today.',
      'Customers and suppliers in other EU countries check this number before they invoice you without VAT.',
      'Business customers may refuse to deal with you without VAT, or ask for your registration papers.',
      'Check the number in your answers. If it is right, ask your tax office to switch it on for EU trade.',
    ],
  });

  // --- EU Section 6: beneficial ownership (AMLR, from 10 Jul 2027) ---------------------------------

  if (wants('UBO_ANNUAL_CHECK')) b.rule({
    ...common('UBO_ANNUAL_CHECK'), layer: 1, area: 'beneficial_ownership', stage: 2, title: 'Yearly check of beneficial-owner details', sev: 'medium', tier: 5, from: '2027-07-10',
    src: src('UBO_ANNUAL_CHECK', [S6, 'Annual check that the information is current (from 10 Jul 2027)']), law: [['Regulation (EU) 2024/1624', 'Art 63']],
    sat: told('eu_ubo_annual_check'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company} checked its beneficial-owner details this year",
      "We don't have your confirmation that you checked this year that the beneficial-owner details you filed are still right.",
      'From 10 July 2027, companies check every year that their beneficial-owner information is current.',
      'Out-of-date details can be fined, and banks rely on them when they onboard you.',
      'Check the details on the register against your cap table, update any change, then confirm here.',
    ],
  });

  // --- EU Section 7: AI Act, as amended by Regulation (EU) 2026/1744 (not Norway) -----------------

  if (wants('AI_ROLES')) b.doc({
    ...common('AI_ROLES'), layer: 6, area: 'ai_governance', stage: 2, title: 'AI systems list with your role for each', noun: 'list of AI systems', sev: 'low', tier: 5, when: AI,
    src: src('AI_ROLES', [S7, 'Role identified: provider, deployer, importer or distributor of each AI system']), law: [['Regulation (EU) 2024/1689']],
    slot: { id: `${lc}_ai_inventory`, label: 'List of AI systems, with your role for each', reason: 'What the EU AI Act asks of you depends on whether you build, use, import or sell each AI system.' },
    fix: 'List each AI system you build or use, say whether you provide it, use it, import it or sell it on, and add the list here.',
  });
  if (wants('AI_PROHIBITED')) b.rule({
    ...common('AI_PROHIBITED'), layer: 6, area: 'ai_governance', stage: 2, title: 'No banned AI practices', sev: 'high', tier: 5, when: AI, from: '2025-02-02',
    src: src('AI_PROHIBITED', [S7, 'No prohibited AI practices (since 2 Feb 2025)'], [CORE, 'AI literacy measures and no prohibited practices']), law: [['Regulation (EU) 2024/1689', 'Art 5']],
    sat: told('eu_no_prohibited_ai'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company} uses no banned AI practices",
      "We don't have your confirmation that none of your AI does anything the EU AI Act bans.",
      'Since 2 February 2025, some uses of AI are banned outright, such as manipulating people, social scoring and some uses of facial recognition and emotion recognition.',
      'These carry the highest fines in the AI Act.',
      'Check each AI system against the banned list, then confirm here.',
    ],
  });
  if (wants('AI_PROHIBITED_GENERATIVE')) b.rule({
    ...common('AI_PROHIBITED_GENERATIVE'), layer: 6, area: 'ai_governance', stage: 2, title: 'No AI that makes abusive images of real people', sev: 'high', tier: 5,
    when: all(AI, includes('generative', 'answers.ai_use_cases')), from: '2026-12-02',
    src: src('AI_PROHIBITED_GENERATIVE', [S7, 'New prohibitions: AI that generates non-consensual intimate imagery']), law: [['Regulation (EU) 2026/1744', 'Art 5(1)(ba)-(bb) of Regulation (EU) 2024/1689']],
    sat: told('eu_no_prohibited_generative_ai'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company}'s AI can't make banned images",
      "You told us your AI generates content, and we don't have your confirmation it can't make intimate images of real people without consent, or child abuse material.",
      'From 2 December 2026, AI systems that generate this content are banned in the EU.',
      'These carry the highest fines in the AI Act.',
      'Check your safeguards block this content, then confirm here.',
    ],
  });
  if (wants('AI_LITERACY')) b.rule({
    ...common('AI_LITERACY'), layer: 6, area: 'ai_governance', stage: 2, title: 'AI literacy for your team', sev: 'medium', tier: 5, when: AI,
    src: src('AI_LITERACY', [S7, 'AI literacy measures for staff and others operating AI for the company'], [CORE, 'AI literacy measures and no prohibited practices']), law: [['Regulation (EU) 2026/1744', 'Art 4 of Regulation (EU) 2024/1689']],
    sat: told('eu_ai_literacy'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company} trains its team on AI",
      "We don't have your confirmation that you take steps to help the people who build or run your AI understand it.",
      'Companies that build or use AI must take measures to support AI literacy among the people who operate it for them.',
      'It is one of the first things a customer or authority asks about your AI.',
      'Give your team short training on how your AI works and its limits, keep a record, then confirm here.',
    ],
  });
  if (wants('AI_HIGH_RISK')) b.doc({
    ...common('AI_HIGH_RISK'), layer: 6, area: 'ai_governance', stage: 3, title: 'High-risk AI documentation', noun: 'high-risk AI documentation', sev: 'high', tier: 5, when: all(AI, ANNEX_III), from: '2027-12-02',
    src: src('AI_HIGH_RISK', [S7, 'High-risk AI (Annex III uses: employment, credit scoring, education']), law: [['Regulation (EU) 2024/1689', 'Chapter III, as amended by Regulation (EU) 2026/1744']],
    slot: { id: `${lc}_ai_high_risk`, label: 'High-risk AI documentation (risk management, technical file, conformity, registration)', reason: 'AI used for hiring, credit, education, insurance or biometrics is high-risk. From 2 December 2027 it needs a risk system, technical documents, human oversight and registration.' },
    fix: 'Build the risk management file, technical documentation and conformity declaration for each high-risk system, register it, and add them here.',
  });
  if (wants('AI_ANNEX_I')) b.doc({
    ...common('AI_ANNEX_I'), layer: 6, area: 'ai_governance', stage: 3, title: 'High-risk AI in regulated products', noun: 'documentation for AI in regulated products', sev: 'high', tier: 5,
    when: all(AI, yes('derived.sector.healthtech')), from: '2028-08-02',
    src: src('AI_ANNEX_I', [S7, 'High-risk AI in products under Annex I law (for example medical devices) (from 2 Aug 2028)']), law: [['Regulation (EU) 2024/1689', 'Art 6(1), as amended by Regulation (EU) 2026/1744']],
    slot: { id: `${lc}_ai_annex_i`, label: 'AI documentation for regulated products (such as medical devices)', reason: 'AI inside a product such as a medical device is high-risk. From 2 August 2028 it needs the high-risk documents as part of the product approval.' },
    fix: 'Add the AI to your product file: risk management, technical documentation and conformity, and add them here.',
  });

  // --- EU Section 8: accessibility (not Norway) ---------------------------------------------------

  if (wants('ACCESSIBILITY')) b.rule({
    ...common('ACCESSIBILITY'), layer: 4, area: 'accessibility', stage: 3, title: 'Accessibility statement', sev: 'medium', tier: 1, when: all(CONSUMER, SITE, ABOVE_MICRO), from: '2025-06-28',
    src: src('ACCESSIBILITY', [S8, 'Accessible e-commerce service and accessibility information (from 28 Jun 2025)'], [S8, 'Microenterprise exemption for services']), law: [['Directive (EU) 2019/882']],
    sat: any(yes('web.policy.accessibility_found'), told('eu_accessibility')), ...pageCheck('web.policy.accessibility_found'),
    evidence: ['Your published accessibility statement', 'Your confirmation'], action: 'fix_website',
    text: [
      "We can't find an accessibility statement on {company}'s website",
      "We couldn't find an accessibility statement on your website, and you haven't confirmed your service meets the accessibility rules.",
      'Since 28 June 2025, online shops and similar services for consumers must be accessible and say how. Very small businesses are exempt.',
      'Consumer authorities can act on it, and people who can\'t use your service go elsewhere.',
      'Publish an accessibility statement and fix the main barriers, or confirm here.',
    ],
  });

  // --- EU Section 10: fundraising (not Norway) -----------------------------------------------------

  if (wants('PROSPECTUS')) b.rule({
    ...common('PROSPECTUS'), layer: 5, area: 'fundraising', stage: 4, title: 'Share offers within a no-prospectus exemption', sev: 'medium', tier: 5, when: INVESTED,
    src: src('PROSPECTUS', [S10, 'Offer only to qualified investors: no prospectus'], [S10, 'Offer to fewer than 150 non-qualified investors per member state: no prospectus']),
    law: [['Regulation (EU) 2017/1129', 'Art 1(4)(a)-(b)']],
    sat: told('eu_prospectus_exempt'), evidence: ['Your confirmation, with your investor list'], action: 'attest',
    text: [
      "You haven't confirmed {company}'s share offers need no prospectus",
      "We don't have your confirmation that each offer of shares went only to professional investors, or to fewer than 150 other people in each EU country.",
      'An offer of shares to the public needs an approved prospectus, unless an exemption applies.',
      'An offer made without one can be stopped, and investors can ask for their money back.',
      'Keep a list of who each offer went to, check it fits an exemption, then confirm here.',
    ],
  });

  // --- EU Section 12: Digital Services Act (not Norway) --------------------------------------------

  if (wants('DSA_CONTACT')) b.rule({
    ...common('DSA_CONTACT'), layer: 4, area: 'platform', stage: 3, title: 'Contact point and content rules for your platform', sev: 'medium', tier: 5, when: yes('derived.sector.platform'),
    src: src('DSA_CONTACT', [S12, 'Digital Services Act: point of contact for authorities and users; clear terms on content restrictions']), law: [['Regulation (EU) 2022/2065', 'Arts 11, 12, 14']],
    // The scan can see a terms or takedown page, not what it says: the content is your word.
    sat: told('eu_dsa_contact'), evidence: ['Your confirmation'], action: 'attest',
    text: [
      "You haven't confirmed {company}'s platform has a contact point and content rules",
      "We don't have your confirmation that your platform names a contact point for authorities and users, and says in its terms what content you restrict and how.",
      'Services that host content for users must have a published contact point and clear rules on content.',
      'The authority that supervises platforms can act on it, and users have nowhere to report illegal content.',
      'Publish a contact point and your content rules, link them from your terms, then confirm here.',
    ],
  });

  // --- Representatives and points of contact (added 18 Nov 2026; EU members only, not Norway) -----
  // For a company outside the EU these follow it into each EU market (a market overlay), and the
  // shared obligation means one EU pack asks. A rule fails only when the answers show it applies and
  // the website was read in a language the scan supports; a missing fact is "to check".

  if (wants('EU_REPRESENTATIVE')) b.rule({
    ...common('EU_REPRESENTATIVE'), layer: 3, area: 'data_protection', stage: 2, title: 'EU representative for a company outside the EU', sev: 'medium', tier: 1, regulator: dpa,
    when: all(PD, NOT_IN_EU, yes('answers.eu_offers_services')),
    src: src('EU_REPRESENTATIVE', [S1, 'EU representative appointed']), law: [['GDPR', 'Arts 3(2), 13(1)(a), 27']],
    sat: any(yes('web.policy.eu_representative_named'), told('eu_gdpr_representative')), ...pageCheck('web.policy.eu_representative_named'),
    evidence: ['Your published privacy notice', 'Your confirmation'], action: 'fix_website',
    text: [
      "We can't see {company}'s EU representative",
      "You told us you offer services to people in the EU without an office there, and we couldn't find an EU representative named in your privacy notice or legal pages. You haven't confirmed you have one.",
      'A company outside the EU that offers goods or services to people in the EU, or tracks their behaviour there, must name a representative in an EU country in writing, and give its contact details in the privacy notice. Occasional, low-risk processing is exempt.',
      'EU data protection authorities and people in the EU have nobody to contact, and authorities can act on it.',
      'Appoint an EU representative in a country where your users are, add its name and contact details to your privacy notice, then confirm here. If the exemption applies, confirm that instead.',
    ],
  });
  if (wants('DSA_REPRESENTATIVE')) b.rule({
    ...common('DSA_REPRESENTATIVE'), layer: 4, area: 'platform', stage: 3, title: 'EU legal representative for a platform outside the EU', sev: 'medium', tier: 1, overlay: 'market',
    when: all(PLATFORM, NOT_IN_EU, yes('answers.eu_offers_services')),
    src: src('DSA_REPRESENTATIVE', [S12, 'DSA legal representative in the EU']), law: [['Regulation (EU) 2022/2065', 'Art 13']],
    sat: any(yes('web.policy.dsa_legal_representative_named'), told('eu_dsa_representative')), ...pageCheck('web.policy.dsa_legal_representative_named'),
    evidence: ['Your published legal or Digital Services Act page', 'Your confirmation'], action: 'fix_website',
    text: [
      "We can't see {company}'s legal representative under the Digital Services Act",
      "You told us you offer an online service with user content in the EU without an office there, and we couldn't find a legal representative under the Digital Services Act on your website. You haven't confirmed you have one.",
      "A service that hosts users' content, with no establishment in the EU but offering its service there, must name a legal representative in an EU country, tell that country's Digital Services Coordinator, and keep the representative's contact details public.",
      'The representative can be held liable, and the authority can act against a service that has none.',
      'Appoint a legal representative in an EU country where you offer the service, notify the Digital Services Coordinator there, publish the details on your website, then confirm here.',
    ],
  });
  if (wants('DSA_POINTS_OF_CONTACT')) b.rule({
    ...common('DSA_POINTS_OF_CONTACT'), layer: 4, area: 'platform', stage: 3, title: 'Published points of contact under the Digital Services Act', sev: 'low', tier: 1, overlay: 'market',
    when: PLATFORM,
    src: src('DSA_POINTS_OF_CONTACT', [S12, 'DSA single points of contact for authorities (art 11) and for users (art 12), made public']), law: [['Regulation (EU) 2022/2065', 'Arts 11, 12']],
    sat: any(yes('web.policy.dsa_contact_point_named'), told('eu_dsa_points_of_contact')), ...pageCheck('web.policy.dsa_contact_point_named'),
    evidence: ['Your published legal or Digital Services Act page', 'Your confirmation'], action: 'fix_website',
    text: [
      "We can't see {company}'s points of contact under the Digital Services Act",
      "We couldn't find a single point of contact for authorities or for users on your website, and you haven't confirmed you publish one.",
      'Online services that host or pass on content must name a single point of contact for authorities and one for their users, and make the details public, with the languages they can be reached in.',
      'Authorities and users have no clear way to reach you, and the authority that supervises platforms can act on it.',
      'Publish your points of contact (an email address or form, and the languages you answer in) on a legal or Digital Services Act page linked from your footer, then confirm here.',
    ],
  });
}

/**
 * International rules that an EU common rule asks for in the same way. With the country's rule
 * in play, the international one gives way, so the same thing is never counted twice.
 */
export function euIntlEquivalents(cc: string, eu: boolean, omit: readonly EuKey[] = []): Record<string, string[]> {
  const has = (key: EuKey) => !omit.includes(key) && (eu || EEA_KEYS.has(key));
  const out: Record<string, string[]> = {};
  const add = (intlId: string, key: EuKey) => {
    if (has(key)) out[intlId] = [...(out[intlId] ?? []), euRuleId(cc, key)];
  };
  add('INTL.DP.PRIVACY_NOTICE', 'PRIVACY_NOTICE');
  add('INTL.DP.PROCESSING_AGREEMENTS', 'PROCESSING_AGREEMENTS');
  add('INTL.SEC.INCIDENT_RESPONSE', 'BREACH');
  return out;
}

/** The ids of every EU common rule a country's pack holds. */
export function euRuleIds(cc: string, eu: boolean, omit: readonly EuKey[] = []): string[] {
  return EU_KEYS.filter((key) => !omit.includes(key) && (eu || EEA_KEYS.has(key))).map((key) => euRuleId(cc, key));
}

import { z } from 'zod';
import { isIsoDate } from './dates.js';
import type { Fact, FactValue } from './facts.js';
import { evaluate, logicProblems, truthy, UNKNOWN, type Logic } from './logic.js';

/**
 * Questionnaire v1: the 22 questions from plan 11.3, plus question 23: optional reference
 * numbers that registers can only be searched by (VAT, ICO, US trademark serials, LEI).
 * Any country gets a sensible set: the questions that aren't about one country show for
 * everyone, and a country's own questions only where its rule pack exists.
 * Stored as data. Each field writes one fact, and `show_when` is JSONLogic over
 * the facts answered so far. When a field is hidden, `if_hidden` says what its
 * fact is, so "no employees" doesn't leave the follow-ups unknown.
 */

const OptionSchema = z.strictObject({ value: z.string().min(1), label: z.string().min(1) });

export const FieldSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9_]+$/),
  label: z.string().min(3),
  help: z.string().optional(),
  type: z.enum(['boolean', 'single', 'multi', 'number', 'date', 'text']),
  options: z.array(OptionSchema).optional(),
  /** The fact this answer becomes. */
  fact: z.string().regex(/^(answers|company)\.[a-z0-9_]+$/),
  show_when: z.custom<Logic>((value) => logicProblems(value).length === 0).optional(),
  if_hidden: z.union([z.boolean(), z.number(), z.string(), z.array(z.string())]).optional(),
  /** May be left empty for good: it doesn't count towards "complete". */
  optional: z.boolean().optional(),
  /** Text answers only: the shape a good answer has, and what to say when it doesn't. */
  format: z.strictObject({ pattern: z.string().min(1), message: z.string().min(10) }).optional(),
}).refine((f) => (f.type === 'single' || f.type === 'multi') === (f.options !== undefined), 'Only single and multi fields have options')
  .refine((f) => f.format === undefined || f.type === 'text', 'Only text fields have a format');
export type Field = z.infer<typeof FieldSchema>;

export const QuestionSchema = z.strictObject({
  number: z.number().int().min(1),
  id: z.string().regex(/^[a-z0-9_]+$/),
  title: z.string().min(3),
  why_we_ask: z.string().min(10),
  show_when: z.custom<Logic>((value) => logicProblems(value).length === 0).optional(),
  fields: z.array(FieldSchema).min(1),
});
export type Question = z.infer<typeof QuestionSchema>;

const v = (key: string): Logic => ({ var: key });
const isTrue = (key: string): Logic => ({ '==': [v(key), true] });
const isJurisdiction = (...codes: string[]): Logic => ({ in: [v('company.jurisdiction'), codes] });
const includes = (value: string, key: string): Logic => ({ in: [value, v(key)] });
const and = (...items: Logic[]): Logic => ({ and: items });
/** Registered there, or has users there: either way that country's data rules are in play. */
const activeIn = (code: string): Logic => ({ or: [isJurisdiction(code), includes(code, 'answers.user_countries')] });
/** Registered in a US state, or in "US": the federal rules apply. */
const isUS: Logic = { or: [isJurisdiction('US'), { in: ['US-', v('company.jurisdiction')] }] };

/** EU member states, by ISO code: the EU VAT register (VIES) can check a VAT number from these. */
export const EU_VAT_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
] as const;

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'other', label: 'Somewhere else' },
];

const raw: Question[] = [
  {
    number: 1, id: 'company', title: 'Tell us about this company',
    why_we_ask: 'The rules depend on where a company is registered and what kind of company it is.',
    fields: [
      // Settled by the company record, so screens don't ask it. Any country code a company can have.
      { id: 'jurisdiction', label: 'Where is it registered?', type: 'text', fact: 'company.jurisdiction',
        format: { pattern: '^[A-Z]{2}(-[A-Z0-9]{1,3})?$', message: "That doesn't look like a country code, such as GB or US-DE." } },
      { id: 'incorporated', label: 'Has it been registered yet?', type: 'boolean', fact: 'company.incorporated' },
      { id: 'entity_type_us', label: 'What kind of company is it?', type: 'single', fact: 'company.entity_type', show_when: isUS, options: [
        { value: 'c_corp', label: 'C corporation' },
        { value: 's_corp', label: 'S corporation' },
        { value: 'llc', label: 'LLC' },
      ] },
      { id: 'entity_type_gb', label: 'What kind of company is it?', type: 'single', fact: 'company.entity_type', show_when: isJurisdiction('GB'), options: [
        { value: 'ltd', label: 'Private limited company (Ltd)' },
        { value: 'plc', label: 'Public limited company (PLC)' },
        { value: 'llp', label: 'Limited liability partnership (LLP)' },
      ] },
      { id: 'entity_type_ng', label: 'What kind of company is it?', type: 'single', fact: 'company.entity_type', show_when: isJurisdiction('NG'), options: [
        { value: 'ltd', label: 'Private company limited by shares (Ltd)' },
        { value: 'plc', label: 'Public company (PLC)' },
        { value: 'llp', label: 'Limited liability partnership (LLP)' },
      ] },
      { id: 'entity_type_fr', label: 'What kind of company is it?', type: 'single', fact: 'company.entity_type', show_when: isJurisdiction('FR'), options: [
        { value: 'sas', label: 'Société par actions simplifiée (SAS)' },
        { value: 'sasu', label: 'SAS with one shareholder (SASU)' },
        { value: 'sarl', label: 'Société à responsabilité limitée (SARL)' },
        { value: 'eurl', label: 'SARL with one partner (EURL)' },
      ] },
      { id: 'entity_type_dk', label: 'What kind of company is it?', type: 'single', fact: 'company.entity_type', show_when: isJurisdiction('DK'), options: [
        { value: 'aps', label: 'Anpartsselskab (ApS)' },
        { value: 'as', label: 'Aktieselskab (A/S)' },
      ] },
      { id: 'entity_type_cz', label: 'What kind of company is it?', type: 'single', fact: 'company.entity_type', show_when: isJurisdiction('CZ'), options: [
        { value: 'sro', label: 'Společnost s ručením omezeným (s.r.o.)' },
        { value: 'as', label: 'Akciová společnost (a.s.)' },
        { value: 'other', label: 'Something else' },
      ] },
      { id: 'entity_type_pl', label: 'What kind of company is it?', type: 'single', fact: 'company.entity_type', show_when: isJurisdiction('PL'), options: [
        { value: 'sp_zoo', label: 'Spółka z ograniczoną odpowiedzialnością (sp. z o.o.)' },
        { value: 'sa', label: 'Spółka akcyjna (S.A.)' },
        { value: 'psa', label: 'Prosta spółka akcyjna (P.S.A.)' },
        { value: 'other', label: 'Something else' },
      ] },
      { id: 'ng_small_company', label: 'Is it a small company under CAC rules?', help: "Small companies don't have to appoint a company secretary.", type: 'boolean', fact: 'answers.ng_small_company', show_when: isJurisdiction('NG'), if_hidden: false },
      { id: 'entity_type_ch', label: 'What kind of company is it?', type: 'single', fact: 'company.entity_type', show_when: isJurisdiction('CH'), options: [
        { value: 'ag', label: 'Company limited by shares (AG or SA)' },
        { value: 'gmbh', label: 'Limited liability company (GmbH or Sàrl)' },
        { value: 'other', label: 'Something else' },
      ] },
      { id: 'sg_nominees', label: 'Does the company have a nominee director or a nominee shareholder?', help: 'A nominee holds the post or the shares on behalf of someone else.', type: 'boolean', fact: 'answers.sg_nominees', show_when: isJurisdiction('SG'), if_hidden: false },
    ],
  },
  {
    number: 2, id: 'user_countries', title: 'Where are your users or customers?',
    why_we_ask: 'Data and consumer laws can follow your users, not just your company.',
    fields: [
      { id: 'user_countries', label: 'Choose all that apply', type: 'multi', fact: 'answers.user_countries', options: COUNTRIES },
      // A company with no establishment in the EU or the UK that offers services there needs a
      // representative there (GDPR and UK GDPR art 27, DSA art 13). Registered there is established.
      { id: 'eu_offers_services', label: 'Do you offer goods or services to people in the EU, or track how they use your website or app?', help: 'For example, selling to EU customers, a site in an EU language, or prices in euros.', type: 'boolean', fact: 'answers.eu_offers_services', show_when: { '!': [isJurisdiction(...EU_VAT_COUNTRIES)] } },
      { id: 'eu_establishment', label: 'Does the company have an office, branch or staff in an EU country?', help: 'A representative or a reseller there does not count.', type: 'boolean', fact: 'answers.eu_establishment', show_when: and({ '!': [isJurisdiction(...EU_VAT_COUNTRIES)] }, isTrue('answers.eu_offers_services')) },
      { id: 'uk_establishment', label: 'Does the company have an office, branch or staff in the UK?', help: 'A representative or a reseller there does not count.', type: 'boolean', fact: 'answers.uk_establishment', show_when: and({ '!': [isJurisdiction('GB')] }, includes('GB', 'answers.user_countries')) },
    ],
  },
  {
    number: 3, id: 'us_states', title: 'Which US states are your users in?',
    why_we_ask: 'California, Colorado and Delaware each have their own privacy rules.',
    show_when: includes('US', 'answers.user_countries'),
    fields: [
      { id: 'us_states', label: 'Choose all that apply', type: 'multi', fact: 'answers.us_states', if_hidden: [], options: [
        { value: 'CA', label: 'California' },
        { value: 'CO', label: 'Colorado' },
        { value: 'DE', label: 'Delaware' },
        { value: 'other', label: 'Other states' },
      ] },
      { id: 'data_subjects_ca_12m', label: 'About how many California consumers do you hold data on?', type: 'number', fact: 'answers.data_subjects_ca_12m', if_hidden: 0, show_when: includes('CA', 'answers.us_states') },
      { id: 'data_subjects_us_de_12m', label: 'About how many Delaware consumers do you hold data on?', type: 'number', fact: 'answers.data_subjects_us_de_12m', if_hidden: 0, show_when: includes('DE', 'answers.us_states') },
      { id: 'half_revenue_from_selling_data', label: 'Does half or more of your revenue come from selling or sharing personal data?', type: 'boolean', fact: 'answers.half_revenue_from_selling_data', if_hidden: false, show_when: includes('CA', 'answers.us_states') },
      { id: 'over_20_percent_revenue_from_selling_data', label: 'Does over 20% of your revenue come from selling personal data?', type: 'boolean', fact: 'answers.over_20_percent_revenue_from_selling_data', if_hidden: false, show_when: includes('DE', 'answers.us_states') },
    ],
  },
  {
    number: 4, id: 'investors_owners', title: 'Who owns the company?',
    why_we_ask: 'Foreign owners and investors bring extra filings. For example, a US company with foreign owners files Form 5472 every year.',
    fields: [
      { id: 'investor_countries', label: 'Which countries are your investors or parent company in?', type: 'multi', fact: 'answers.investor_countries', options: [...COUNTRIES, { value: 'none', label: 'No outside investors or parent yet' }] },
      { id: 'foreign_ownership_25_plus', label: 'Do foreign owners hold 25% or more of a US company, or solely own a US LLC?', type: 'boolean', fact: 'answers.foreign_ownership_25_plus', show_when: isUS, if_hidden: false },
      { id: 'foreign_entity_registered_in_us', label: 'Is this a non-US company registered to do business in a US state?', type: 'boolean', fact: 'answers.foreign_entity_registered_in_us', show_when: isUS, if_hidden: false },
      { id: 'foreign_shareholders_or_directors', label: 'Does the company have foreign shareholders or directors?', type: 'boolean', fact: 'answers.foreign_shareholders_or_directors', show_when: isJurisdiction('NG'), if_hidden: false },
      { id: 'has_raised_or_raising', label: 'Have you raised money, or are you raising now?', help: 'That includes SAFEs and convertibles.', type: 'boolean', fact: 'answers.has_raised_or_raising' },
      { id: 'raised_priced_round', label: 'Was any of it a priced round?', type: 'boolean', fact: 'answers.raised_priced_round', show_when: isTrue('answers.has_raised_or_raising'), if_hidden: false },
    ],
  },
  {
    number: 5, id: 'team', title: 'Who works for the company?',
    why_we_ask: 'Having employees switches on payroll, pension and insurance duties. Contractors matter for who owns the work.',
    fields: [
      { id: 'has_employees', label: 'Do you have employees?', type: 'boolean', fact: 'answers.has_employees' },
      { id: 'employee_countries', label: 'Which countries are they in?', type: 'multi', fact: 'answers.employee_countries', options: COUNTRIES, show_when: isTrue('answers.has_employees'), if_hidden: [] },
      { id: 'last_hire_on', label: 'When did your latest hire start?', type: 'date', fact: 'answers.last_hire_on', show_when: isTrue('answers.has_employees') },
      { id: 'has_contractors', label: 'Do you use contractors or outside developers?', type: 'boolean', fact: 'answers.has_contractors' },
      { id: 'contractor_countries', label: 'Which countries are they in?', type: 'multi', fact: 'answers.contractor_countries', options: COUNTRIES, show_when: isTrue('answers.has_contractors'), if_hidden: [] },
      { id: 'has_foreign_workers', label: 'Do you sponsor workers from other countries, or employ expatriates?', type: 'boolean', fact: 'answers.has_foreign_workers', show_when: isTrue('answers.has_employees'), if_hidden: false },
      { id: 'sg_cpf_employees', label: 'Are any of your employees Singapore citizens or permanent residents?', help: 'Their employer pays CPF contributions for them.', type: 'boolean', fact: 'answers.sg_cpf_employees', show_when: and(isJurisdiction('SG'), isTrue('answers.has_employees')), if_hidden: false },
      { id: 'has_delaware_employees', label: 'Do you have employees in Delaware?', type: 'boolean', fact: 'answers.has_delaware_employees', show_when: and(isJurisdiction('US-DE'), isTrue('answers.has_employees')), if_hidden: false },
      { id: 'operates_in_delaware', label: 'Do you actually work in Delaware, with an office, staff or sales there?', help: 'Being incorporated there doesn\'t count.', type: 'boolean', fact: 'answers.operates_in_delaware', show_when: isJurisdiction('US-DE'), if_hidden: false },
      { id: 'does_business_in_other_states', label: 'Do you do business in other US states?', type: 'boolean', fact: 'answers.does_business_in_other_states', show_when: isJurisdiction('US-DE'), if_hidden: false },
      { id: 'has_premises', label: 'Do you occupy business premises, rather than working from home?', type: 'boolean', fact: 'answers.has_premises', show_when: isJurisdiction('GB'), if_hidden: false },
    ],
  },
  {
    number: 6, id: 'size', title: 'How big is the company?',
    why_we_ask: 'Some rules only start above a certain size, so this stops us asking about ones that do not apply.',
    fields: [
      { id: 'revenue_band', label: 'Annual revenue, roughly', type: 'single', fact: 'answers.revenue_band', options: [
        { value: 'none', label: 'No revenue yet' },
        { value: 'under_1m', label: 'Under $1m' },
        { value: '1m_to_26m', label: '$1m to $26m' },
        { value: 'over_26m', label: 'Over $26m' },
      ] },
      { id: 'headcount_band', label: 'People on the team', type: 'single', fact: 'answers.headcount_band', options: [
        { value: '1_10', label: '1 to 10' },
        { value: '11_50', label: '11 to 50' },
        { value: '51_100', label: '51 to 100' },
        { value: 'over_100', label: 'Over 100' },
      ] },
    ],
  },
  {
    number: 7, id: 'personal_data', title: 'Do you handle personal data?',
    why_we_ask: 'This decides which data protection duties apply. In Nigeria, handling data on 200 or more people in 6 months means registering with the NDPC.',
    fields: [
      { id: 'processes_personal_data', label: 'Do you hold or use information about people, such as names, emails or logins?', type: 'boolean', fact: 'answers.processes_personal_data' },
      { id: 'data_subjects_ng_6m', label: 'About how many people in Nigeria, in the last 6 months?', type: 'number', fact: 'answers.data_subjects_ng_6m', show_when: and(isTrue('answers.processes_personal_data'), activeIn('NG')), if_hidden: 0 },
      { id: 'data_subjects_ng_12m', label: 'And in the last 12 months?', type: 'number', fact: 'answers.data_subjects_ng_12m', show_when: and(isTrue('answers.processes_personal_data'), activeIn('NG')), if_hidden: 0 },
      { id: 'data_subjects_gb_12m', label: 'About how many people in the UK, in the last 12 months?', type: 'number', fact: 'answers.data_subjects_gb_12m', show_when: and(isTrue('answers.processes_personal_data'), activeIn('GB')), if_hidden: 0 },
      { id: 'au_privacy_act', label: "Is the company covered by Australia's Privacy Act?", help: 'Most businesses with annual turnover of A$3 million or less are not, unless an exception applies, for example a health service, trading in personal information, or being related to a covered business.', type: 'single', fact: 'answers.au_privacy_act', show_when: and(isTrue('answers.processes_personal_data'), activeIn('AU')), if_hidden: 'not_sure', options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: "I'm not sure" },
      ] },
      { id: 'ndpc_category', label: 'Do you know your NDPC category?', type: 'single', fact: 'answers.ndpc_category', show_when: and(isTrue('answers.processes_personal_data'), activeIn('NG')), if_hidden: 'dont_know', options: [
        { value: 'UHL', label: 'Ultra-high level' },
        { value: 'EHL', label: 'Extra-high level' },
        { value: 'OHL', label: 'Ordinary-high level' },
        { value: 'dont_know', label: "I don't know" },
      ] },
    ],
  },
  {
    number: 8, id: 'sensitive_data', title: 'Is any of it sensitive?',
    why_we_ask: 'Sensitive data usually needs consent, and can mean you need a risk assessment or a data protection officer.',
    show_when: isTrue('answers.processes_personal_data'),
    fields: [{ id: 'sensitive_data', label: 'Choose all that apply', type: 'multi', fact: 'answers.sensitive_data', if_hidden: ['none'], options: [
      { value: 'health', label: 'Health' },
      { value: 'biometrics', label: 'Biometrics' },
      { value: 'financial', label: 'Financial' },
      { value: 'children', label: "Children's data" },
      { value: 'location', label: 'Precise location' },
      { value: 'none', label: 'None of these' },
    ] }],
  },
  {
    number: 9, id: 'hosting', title: 'Where is the data kept, and who handles it for you?',
    why_we_ask: 'Moving data across borders needs its own paperwork, and vendors who handle data need an agreement with you.',
    show_when: isTrue('answers.processes_personal_data'),
    fields: [
      { id: 'data_hosted_abroad', label: 'Is any of it kept outside the country where the company is registered?', type: 'boolean', fact: 'answers.data_hosted_abroad', if_hidden: false },
      { id: 'uses_processors', label: 'Do vendors or cloud providers handle it for you?', type: 'boolean', fact: 'answers.uses_processors', if_hidden: false },
      // EU and EEA data rules ask about data leaving the EEA, not just the home country.
      { id: 'data_outside_eea', label: 'Is any of it kept or sent outside the EU, Norway, Iceland and Liechtenstein?', type: 'boolean', fact: 'answers.data_outside_eea', show_when: and(isTrue('answers.data_hosted_abroad'), isJurisdiction(...EU_VAT_COUNTRIES, 'NO', 'IS', 'LI')), if_hidden: false },
    ],
  },
  {
    number: 10, id: 'website_tracking', title: 'Your website and app',
    why_we_ask: "We read your public website to check your privacy notice and cookies. If you don't have one, we skip those checks.",
    fields: [
      { id: 'has_website', label: 'Do you have a public website?', type: 'boolean', fact: 'answers.has_website' },
      { id: 'website_url', label: "What's the address?", type: 'text', fact: 'answers.website_url', show_when: isTrue('answers.has_website') },
      { id: 'has_app', label: 'Do you have a published app?', type: 'boolean', fact: 'answers.has_app' },
      { id: 'trackers', label: 'Which of these do you use?', type: 'multi', fact: 'answers.trackers', show_when: isTrue('answers.has_website'), if_hidden: [], options: [
        { value: 'analytics', label: 'Analytics' },
        { value: 'ads', label: 'Advertising pixels' },
        { value: 'sdks', label: 'Third-party SDKs' },
        { value: 'none', label: 'None of these' },
      ] },
    ],
  },
  {
    number: 11, id: 'marketing', title: 'Do you send marketing messages?',
    why_we_ask: 'Marketing emails, texts and calls have consent rules, which differ by country.',
    fields: [
      { id: 'marketing_consent', label: 'How do people sign up?', type: 'single', fact: 'answers.marketing_consent', options: [
        { value: 'none', label: "We don't send marketing" },
        { value: 'opt_in', label: 'They choose to join' },
        { value: 'opt_out', label: 'They are added and can leave' },
      ] },
      { id: 'sends_sms_or_calls', label: 'Do you text or call people?', type: 'boolean', fact: 'answers.sends_sms_or_calls' },
    ],
  },
  {
    number: 12, id: 'ai_use', title: 'Do you use AI?',
    why_we_ask: 'Investors and customers increasingly ask about AI, and using it can bring in risk assessments and disclosures.',
    fields: [
      { id: 'ai_roles', label: 'How do you use it in your product?', type: 'multi', fact: 'answers.ai_roles', options: [
        { value: 'provider', label: 'We build AI models or products' },
        { value: 'deployer', label: 'We use AI from others in our product' },
        { value: 'trainer', label: 'We train models' },
        { value: 'none', label: 'No AI in our product' },
      ] },
      { id: 'ai_use_cases', label: 'What for?', type: 'multi', fact: 'answers.ai_use_cases', show_when: { '!': [includes('none', 'answers.ai_roles')] }, if_hidden: [], options: [
        { value: 'chatbot', label: 'Chatbot' },
        { value: 'generative', label: 'Generating content' },
        { value: 'hiring', label: 'Hiring' },
        { value: 'credit', label: 'Credit decisions' },
        { value: 'biometrics', label: 'Biometrics' },
        { value: 'education', label: 'Education' },
        { value: 'insurance', label: 'Insurance' },
        { value: 'moderation', label: 'Content moderation' },
        { value: 'other', label: 'Something else' },
      ] },
      { id: 'ai_uses_third_party_models', label: 'Do you use models or APIs from another company?', type: 'boolean', fact: 'answers.ai_uses_third_party_models', show_when: { '!': [includes('none', 'answers.ai_roles')] }, if_hidden: false },
      { id: 'staff_use_ai', label: 'Does your team use AI tools at work?', type: 'boolean', fact: 'answers.staff_use_ai' },
    ],
  },
  {
    number: 13, id: 'automated_decisions', title: 'Does software make big decisions about people by itself?',
    why_we_ask: 'Decisions that seriously affect people, with no human review, have their own rules in many countries.',
    show_when: isTrue('answers.processes_personal_data'),
    fields: [{ id: 'automated_decisions', label: 'For example, approving credit or rejecting a job applicant', type: 'boolean', fact: 'answers.automated_decisions', if_hidden: false }],
  },
  {
    number: 14, id: 'payments', title: 'How does money move through your product?',
    why_we_ask: 'Holding or moving money yourself usually needs a licence. Using a licensed provider usually means you rely on theirs.',
    fields: [
      { id: 'payments_mode', label: 'Choose all that apply', type: 'multi', fact: 'answers.payments_mode', options: [
        { value: 'none', label: "We don't take payments" },
        { value: 'psp_only', label: 'Only through a licensed provider such as Stripe or Paystack' },
        { value: 'hold_funds', label: "We hold customers' money" },
        { value: 'wallet', label: 'We run a wallet' },
        { value: 'lending', label: 'We lend money' },
        { value: 'crypto', label: 'We handle crypto' },
        { value: 'fx', label: 'We exchange currencies' },
      ] },
      { id: 'money_services_started_on', label: 'When did you start moving money?', type: 'date', fact: 'answers.money_services_started_on', show_when: and(isUS, { or: [includes('hold_funds', 'answers.payments_mode'), includes('wallet', 'answers.payments_mode'), includes('fx', 'answers.payments_mode')] }) },
      { id: 'offers_account_information_services', label: "Do you read customers' bank account data?", type: 'boolean', fact: 'answers.offers_account_information_services', show_when: activeIn('GB'), if_hidden: false },
    ],
  },
  {
    number: 15, id: 'partner_agreement', title: 'Your agreement with your licensed partner',
    why_we_ask: "If a partner's licence covers you, the agreement is how we confirm it. Until we see it, this rests on your word alone.",
    show_when: includes('psp_only', 'answers.payments_mode'),
    fields: [{ id: 'has_partner_agreement', label: 'Do you have a signed agreement with them? You can upload it under Documents.', type: 'boolean', fact: 'answers.has_partner_agreement', if_hidden: false }],
  },
  {
    number: 16, id: 'sector', title: 'Are you in a regulated sector?',
    why_we_ask: 'Each regulated sector has its own licences and regulators.',
    fields: [{ id: 'sectors', label: 'Choose all that apply', type: 'multi', fact: 'answers.sectors', options: [
      { value: 'payments', label: 'Payments' },
      { value: 'lending', label: 'Lending or credit' },
      { value: 'crypto', label: 'Crypto or digital assets' },
      { value: 'banking', label: 'Banking' },
      { value: 'securities', label: 'Investments or securities' },
      { value: 'derivatives', label: 'Derivatives' },
      { value: 'insurtech', label: 'Insurance' },
      { value: 'healthtech', label: 'Health' },
      { value: 'telecoms', label: 'Telecoms' },
      { value: 'professional', label: 'A regulated profession' },
      { value: 'gambling', label: 'Gambling' },
      { value: 'energy', label: 'Energy' },
      { value: 'payment_system', label: 'Running a payment system' },
      { value: 'platform', label: 'Online platform' },
      { value: 'none', label: 'None of these' },
    ] }],
  },
  {
    number: 17, id: 'customers', title: 'Who do you sell to?',
    why_we_ask: 'Selling to consumers brings in consumer law. Enterprise customers ask for more security and contract paperwork.',
    fields: [
      { id: 'customer_type', label: 'Businesses, consumers or both?', type: 'single', fact: 'answers.customer_type', options: [
        { value: 'b2b', label: 'Businesses' },
        { value: 'b2c', label: 'Consumers' },
        { value: 'both', label: 'Both' },
      ] },
      { id: 'has_subscriptions', label: 'Do you sell subscriptions that renew automatically?', type: 'boolean', fact: 'answers.has_subscriptions' },
      { id: 'sells_to_enterprise', label: 'Do you sell to enterprise or public-sector customers?', type: 'boolean', fact: 'answers.sells_to_enterprise' },
      { id: 'enterprise_demands_escrow', label: 'Has a customer asked for source code escrow?', type: 'boolean', fact: 'answers.enterprise_demands_escrow', show_when: isTrue('answers.sells_to_enterprise'), if_hidden: false },
      { id: 'supplies_government', label: 'Do you supply IT services to government bodies?', type: 'boolean', fact: 'answers.supplies_government', show_when: isJurisdiction('NG'), if_hidden: false },
      { id: 'offers_api', label: 'Do you offer an API to other companies?', type: 'boolean', fact: 'answers.offers_api' },
      { id: 'sells_physical_products', label: 'Do you sell physical products?', type: 'boolean', fact: 'answers.sells_physical_products' },
    ],
  },
  {
    number: 18, id: 'ugc', title: 'Do users post content or trade with each other?',
    why_we_ask: 'Platforms have their own duties, such as a way to report and take down content.',
    fields: [{ id: 'user_generated_content', label: 'For example, reviews, posts or a marketplace', type: 'boolean', fact: 'answers.user_generated_content' }],
  },
  {
    number: 19, id: 'minors', title: 'Do children use your product?',
    why_we_ask: "Children's data has extra protection. In the US, under-13s need parental consent.",
    fields: [
      { id: 'users_under_18', label: 'Are any of your users under 18?', type: 'boolean', fact: 'answers.users_under_18' },
      { id: 'users_under_13', label: 'Are any of them under 13?', type: 'boolean', fact: 'answers.users_under_13', show_when: isTrue('answers.users_under_18'), if_hidden: false },
    ],
  },
  {
    number: 20, id: 'ip_people', title: 'Who has signed their work over to the company?',
    why_we_ask: 'Without a signed assignment, whoever built your product may still own it. Investors check this first.',
    fields: [
      { id: 'ip_founders_signed', label: 'Have all founders signed an IP assignment?', type: 'boolean', fact: 'answers.ip_founders_signed' },
      { id: 'ip_employees_signed', label: 'Have all employees?', type: 'boolean', fact: 'answers.ip_employees_signed', show_when: isTrue('answers.has_employees'), if_hidden: false },
      { id: 'ip_contractors_signed', label: 'Have all contractors?', type: 'boolean', fact: 'answers.ip_contractors_signed', show_when: isTrue('answers.has_contractors'), if_hidden: false },
      { id: 'ip_preincorp_assigned', label: 'Was anything built before the company existed moved into it?', type: 'boolean', fact: 'answers.ip_preincorp_assigned' },
      { id: 'has_patentable_technology', label: 'Do you have technology you might want to patent?', type: 'boolean', fact: 'answers.has_patentable_technology' },
      { id: 'founders_restricted_stock', label: 'Did founders get shares that vest over time?', type: 'boolean', fact: 'answers.founders_restricted_stock', show_when: isUS, if_hidden: false },
      { id: 'founder_stock_granted_on', label: 'When were they granted?', type: 'date', fact: 'answers.founder_stock_granted_on', show_when: isTrue('answers.founders_restricted_stock') },
      { id: 'grants_equity_to_staff', label: 'Do you give, or plan to give, shares or options to staff?', type: 'boolean', fact: 'answers.grants_equity_to_staff' },
    ],
  },
  {
    number: 21, id: 'cross_border', title: 'Does anything cross borders inside the group?',
    why_we_ask: "Paying a foreign company for technology can need registering, and in Nigeria that goes to NOTAP within 30 days.",
    fields: [
      { id: 'pays_foreign_for_technology', label: 'Do you pay a foreign company for software, IP, or technical or management services?', type: 'boolean', fact: 'answers.pays_foreign_for_technology' },
      { id: 'foreign_tech_agreement_on', label: 'When was the latest agreement signed?', type: 'date', fact: 'answers.foreign_tech_agreement_on', show_when: and(isTrue('answers.pays_foreign_for_technology'), isJurisdiction('NG')) },
      { id: 'ip_moved_offshore', label: 'Has any IP moved to another country?', type: 'boolean', fact: 'answers.ip_moved_offshore' },
      { id: 'exports_controlled_tech', label: 'Do you sell software with encryption, or other controlled technology, abroad?', type: 'boolean', fact: 'answers.exports_controlled_tech' },
    ],
  },
  {
    number: 22, id: 'last_filings', title: 'When did you last file?',
    why_we_ask: "This helps us work out your next deadlines. Skip any you don't know: we'll find out or ask you for proof.",
    fields: [
      { id: 'franchise_tax_paid_on', label: 'Delaware franchise or LLC tax, last paid', type: 'date', fact: 'answers.franchise_tax_paid_on', show_when: isJurisdiction('US-DE') },
      { id: 'federal_return_filed_on', label: 'US federal tax return, last filed', type: 'date', fact: 'answers.federal_return_filed_on', show_when: isUS },
      { id: 'bo_filing_on', label: 'Beneficial ownership report, last filed', type: 'date', fact: 'answers.bo_filing_on', show_when: isTrue('answers.foreign_entity_registered_in_us') },
      { id: 'last_confirmation_on', label: 'Confirmation statement, last filed', type: 'date', fact: 'answers.last_confirmation_on', show_when: isJurisdiction('GB') },
      { id: 'last_annual_return_on', label: 'CAC annual return, last filed', type: 'date', fact: 'answers.last_annual_return_on', show_when: isJurisdiction('NG') },
      { id: 'dp_registration_on', label: 'Data protection registration, last renewed', type: 'date', fact: 'answers.dp_registration_on', show_when: and(isTrue('answers.processes_personal_data'), { or: [activeIn('GB'), activeIn('NG')] }) },
      { id: 'ndpc_audit_return_on', label: 'NDPC audit return, last filed', type: 'date', fact: 'answers.ndpc_audit_return_on', show_when: and(isTrue('answers.processes_personal_data'), activeIn('NG')) },
    ],
  },
  {
    number: 23, id: 'reference_numbers', title: 'Numbers that help us check official records',
    why_we_ask: "Some registers can only be searched by a number, not by your company's name. With the number we can check the record itself. Without it, we mark the check as not done yet. We never guess.",
    fields: [
      {
        id: 'vat_number', label: "What is the company's VAT number?", type: 'text', fact: 'answers.vat_number', optional: true,
        help: "In the UK it's 9 digits, sometimes with GB in front. In the EU it starts with the country's two letters, such as FR or DE. Leave it empty if you aren't registered for VAT. We use it only to check your registration with the official VAT register.",
        // The UK (HMRC) and the EU member states (VIES) have a VAT register we can check.
        show_when: isJurisdiction('GB', ...EU_VAT_COUNTRIES),
        format: {
          pattern: '^\\s*(([Gg][Bb])?\\s*(\\d\\s*){9}((\\d\\s*){3})?|[A-Za-z]{2}\\s*[0-9A-Za-z+*][0-9A-Za-z+*\\s]{1,13})\\s*$',
          message: "That doesn't look like a VAT number. A UK one is 9 digits, sometimes with GB in front. An EU one starts with the country's two letters, such as FR or DE.",
        },
      },
      {
        id: 'ico_registration_number', label: 'If you know it, what is your ICO registration number?', type: 'text', fact: 'answers.ico_registration_number', optional: true,
        help: "It starts with Z and is on your ICO receipt or certificate. Without it we match on your name and registered office postcode.",
        show_when: and(isTrue('answers.processes_personal_data'), activeIn('GB')),
        format: { pattern: '^\\s*[Zz][A-Za-z0-9]{7}\\s*$', message: "That doesn't look like an ICO registration number. It starts with Z and has 8 characters, such as ZA123456." },
      },
      {
        id: 'us_trademark_serials', label: 'Do you have US trademark applications or registrations? Give their serial numbers.', type: 'text', fact: 'answers.us_trademark_serials', optional: true,
        help: 'Each serial number has 8 digits. Separate several with commas. The USPTO can only be checked by number, so without one we mark trademarks as not checked yet.',
        show_when: isUS,
        format: { pattern: '^\\s*\\d{8}(\\s*[,;\\s]\\s*\\d{8})*\\s*$', message: 'Give each serial number as 8 digits, separated by commas, for example 97123456, 97123457.' },
      },
      {
        id: 'eu_trademark_numbers', label: 'Do you have EU trade mark applications or registrations? Give their numbers.', type: 'text', fact: 'answers.eu_trademark_numbers', optional: true,
        help: 'Each EU trade mark number has up to 9 digits, such as 018123456. Separate several with commas. The EUIPO is checked by number, so without one we mark EU trade marks as not checked yet.',
        format: { pattern: '^\\s*(EUTM\\s*)?\\d{6,9}(\\s*[,;\\s]\\s*(EUTM\\s*)?\\d{6,9})*\\s*$', message: 'Give each EU trade mark number as up to 9 digits, separated by commas, for example 018123456, 018123457.' },
      },
      {
        id: 'lei', label: 'If the company has one, what is its Legal Entity Identifier (LEI)?', type: 'text', fact: 'answers.lei', optional: true,
        help: "It's 20 letters and numbers, used by banks and in trade. Leave it empty if the company doesn't have one. We use it only to find the company on the global LEI register (GLEIF).",
        format: { pattern: '^\\s*[A-Za-z0-9]{18}\\d{2}\\s*$', message: "That doesn't look like an LEI. It has 20 letters and numbers, such as 5493001KJTIIGC8Y1R12." },
      },
    ],
  },
];

/** The serial numbers in an answer such as "97123456, 97123457". Anything else is dropped. */
export function trademarkSerials(value: FactValue | undefined): string[] {
  if (typeof value !== 'string') return [];
  return [...new Set(value.split(/[,;\s]+/).map((item) => item.trim()).filter((item) => /^\d{8}$/.test(item)))];
}

export const QUESTIONNAIRE_VERSION = '1.0.0-draft';
export const QUESTIONNAIRE: readonly Question[] = z.array(QuestionSchema).parse(raw);

export type Answers = Record<string, FactValue | undefined>;

function isVisible(logic: Logic | undefined, facts: Readonly<Record<string, FactValue>>): boolean {
  if (logic === undefined) return true;
  const result = evaluate(logic, (key) => {
    const value = facts[key];
    return value === undefined || value === null ? UNKNOWN : value;
  });
  // Not answered yet means not shown yet.
  return result !== UNKNOWN && truthy(result);
}

function validAnswer(field: Field, value: FactValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  switch (field.type) {
    case 'boolean': return typeof value === 'boolean';
    case 'number': return typeof value === 'number' && Number.isFinite(value) && value >= 0;
    case 'date': return isIsoDate(value);
    case 'text': return typeof value === 'string' && value.trim().length > 0 && (field.format === undefined || new RegExp(field.format.pattern).test(value));
    case 'single': return typeof value === 'string' && (field.options ?? []).some((o) => o.value === value);
    case 'multi': return Array.isArray(value) && value.every((item) => (field.options ?? []).some((o) => o.value === item));
  }
}

export interface QuestionnaireProblem { field: string; message: string }

/**
 * Turns answers (keyed by field id) into facts. Fields that aren't showing take
 * their `if_hidden` value, or are left out. Bad answers are returned as problems.
 */
export function answersToFacts(answers: Answers): { facts: Fact[]; problems: QuestionnaireProblem[]; values: Record<string, FactValue> } {
  const values: Record<string, FactValue> = {};
  const problems: QuestionnaireProblem[] = [];
  // Questions come in order, and later show_when only reads earlier answers.
  for (const question of QUESTIONNAIRE) {
    const questionVisible = isVisible(question.show_when, values);
    for (const field of question.fields) {
      const visible = questionVisible && isVisible(field.show_when, values);
      const answer = answers[field.id];
      if (visible && answer !== undefined) {
        if (validAnswer(field, answer)) values[field.fact] = answer;
        else problems.push({ field: field.id, message: field.format && typeof answer === 'string' && answer.trim().length > 0 ? field.format.message : `"${field.label}" has an answer we can't use.` });
      } else if (!visible && field.if_hidden !== undefined && values[field.fact] === undefined) {
        values[field.fact] = field.if_hidden;
      }
    }
  }
  return {
    facts: Object.entries(values).map(([key, value]) => ({ key, value })),
    problems,
    values,
  };
}

/** The questions to show now, given the answers so far. Hidden fields are removed. */
export function visibleQuestions(answers: Answers): Question[] {
  const { values } = answersToFacts(answers);
  return QUESTIONNAIRE.flatMap((question) => {
    if (!isVisible(question.show_when, values)) return [];
    const fields = question.fields.filter((field) => isVisible(field.show_when, values));
    return fields.length > 0 ? [{ ...question, fields }] : [];
  });
}

/** Every fact the questionnaire can write. */
export const QUESTIONNAIRE_FACT_KEYS: readonly string[] = [...new Set(QUESTIONNAIRE.flatMap((q) => q.fields.map((f) => f.fact)))];

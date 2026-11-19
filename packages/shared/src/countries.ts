import { z } from 'zod';

/**
 * Every country a company can be registered in: each ISO 3166-1 alpha-2 country, plus the
 * US states and DC as "US-XX". docs/GLOBAL-COVERAGE.md says what a scan checks at each level.
 *
 * To raise a country's level once its register (or its laws) can be checked, add one line to
 * COVERAGE_LEVELS below. Nothing else needs to change.
 */

/**
 * - full: the country's own rule pack, its official company register and its other sources.
 * - registry: international rules, plus the country's official company register.
 * - international: international rules only (sanctions, LEI, EU VAT where it applies, the
 *   website and the uploaded documents).
 */
export const COVERAGE_LEVELS_ORDER = ['full', 'registry', 'international'] as const;
export type CoverageLevel = (typeof COVERAGE_LEVELS_ORDER)[number];

/** Countries above the default "international" level. One line per country. */
export const COVERAGE_LEVELS: Readonly<Record<string, CoverageLevel>> = {
  'US-DE': 'full',
  GB: 'full',
  NG: 'full',
  FR: 'registry',
};

/**
 * [code, ISO English short name, takes "the", everyday name for sentences].
 * The name drops ISO's trailing "(the)" marker; the third item keeps that meaning.
 */
type Row = readonly [code: string, name: string, the?: boolean, short?: string];

const ISO_COUNTRIES: readonly Row[] = [
  ['AF', 'Afghanistan'],
  ['AX', 'Åland Islands'],
  ['AL', 'Albania'],
  ['DZ', 'Algeria'],
  ['AS', 'American Samoa'],
  ['AD', 'Andorra'],
  ['AO', 'Angola'],
  ['AI', 'Anguilla'],
  ['AQ', 'Antarctica'],
  ['AG', 'Antigua and Barbuda'],
  ['AR', 'Argentina'],
  ['AM', 'Armenia'],
  ['AW', 'Aruba'],
  ['AU', 'Australia'],
  ['AT', 'Austria'],
  ['AZ', 'Azerbaijan'],
  ['BS', 'Bahamas', true],
  ['BH', 'Bahrain'],
  ['BD', 'Bangladesh'],
  ['BB', 'Barbados'],
  ['BY', 'Belarus'],
  ['BE', 'Belgium'],
  ['BZ', 'Belize'],
  ['BJ', 'Benin'],
  ['BM', 'Bermuda'],
  ['BT', 'Bhutan'],
  ['BO', 'Bolivia (Plurinational State of)', false, 'Bolivia'],
  ['BQ', 'Bonaire, Sint Eustatius and Saba'],
  ['BA', 'Bosnia and Herzegovina'],
  ['BW', 'Botswana'],
  ['BV', 'Bouvet Island'],
  ['BR', 'Brazil'],
  ['IO', 'British Indian Ocean Territory', true],
  ['BN', 'Brunei Darussalam'],
  ['BG', 'Bulgaria'],
  ['BF', 'Burkina Faso'],
  ['BI', 'Burundi'],
  ['CV', 'Cabo Verde'],
  ['KH', 'Cambodia'],
  ['CM', 'Cameroon'],
  ['CA', 'Canada'],
  ['KY', 'Cayman Islands', true],
  ['CF', 'Central African Republic', true],
  ['TD', 'Chad'],
  ['CL', 'Chile'],
  ['CN', 'China'],
  ['CX', 'Christmas Island'],
  ['CC', 'Cocos (Keeling) Islands', true],
  ['CO', 'Colombia'],
  ['KM', 'Comoros', true],
  ['CD', 'Congo (the Democratic Republic of the)', true, 'Democratic Republic of the Congo'],
  ['CG', 'Congo', true, 'Republic of the Congo'],
  ['CK', 'Cook Islands', true],
  ['CR', 'Costa Rica'],
  ['CI', "Côte d'Ivoire"],
  ['HR', 'Croatia'],
  ['CU', 'Cuba'],
  ['CW', 'Curaçao'],
  ['CY', 'Cyprus'],
  ['CZ', 'Czechia'],
  ['DK', 'Denmark'],
  ['DJ', 'Djibouti'],
  ['DM', 'Dominica'],
  ['DO', 'Dominican Republic', true],
  ['EC', 'Ecuador'],
  ['EG', 'Egypt'],
  ['SV', 'El Salvador'],
  ['GQ', 'Equatorial Guinea'],
  ['ER', 'Eritrea'],
  ['EE', 'Estonia'],
  ['SZ', 'Eswatini'],
  ['ET', 'Ethiopia'],
  ['FK', 'Falkland Islands (Malvinas)', true, 'Falkland Islands'],
  ['FO', 'Faroe Islands', true],
  ['FJ', 'Fiji'],
  ['FI', 'Finland'],
  ['FR', 'France'],
  ['GF', 'French Guiana'],
  ['PF', 'French Polynesia'],
  ['TF', 'French Southern Territories', true],
  ['GA', 'Gabon'],
  ['GM', 'Gambia', true],
  ['GE', 'Georgia'],
  ['DE', 'Germany'],
  ['GH', 'Ghana'],
  ['GI', 'Gibraltar'],
  ['GR', 'Greece'],
  ['GL', 'Greenland'],
  ['GD', 'Grenada'],
  ['GP', 'Guadeloupe'],
  ['GU', 'Guam'],
  ['GT', 'Guatemala'],
  ['GG', 'Guernsey'],
  ['GN', 'Guinea'],
  ['GW', 'Guinea-Bissau'],
  ['GY', 'Guyana'],
  ['HT', 'Haiti'],
  ['HM', 'Heard Island and McDonald Islands'],
  ['VA', 'Holy See', true],
  ['HN', 'Honduras'],
  ['HK', 'Hong Kong'],
  ['HU', 'Hungary'],
  ['IS', 'Iceland'],
  ['IN', 'India'],
  ['ID', 'Indonesia'],
  ['IR', 'Iran (Islamic Republic of)', false, 'Iran'],
  ['IQ', 'Iraq'],
  ['IE', 'Ireland'],
  ['IM', 'Isle of Man', true],
  ['IL', 'Israel'],
  ['IT', 'Italy'],
  ['JM', 'Jamaica'],
  ['JP', 'Japan'],
  ['JE', 'Jersey'],
  ['JO', 'Jordan'],
  ['KZ', 'Kazakhstan'],
  ['KE', 'Kenya'],
  ['KI', 'Kiribati'],
  ['KP', "Korea (the Democratic People's Republic of)", false, 'North Korea'],
  ['KR', 'Korea (the Republic of)', false, 'South Korea'],
  ['KW', 'Kuwait'],
  ['KG', 'Kyrgyzstan'],
  ['LA', "Lao People's Democratic Republic", true, 'Laos'],
  ['LV', 'Latvia'],
  ['LB', 'Lebanon'],
  ['LS', 'Lesotho'],
  ['LR', 'Liberia'],
  ['LY', 'Libya'],
  ['LI', 'Liechtenstein'],
  ['LT', 'Lithuania'],
  ['LU', 'Luxembourg'],
  ['MO', 'Macao'],
  ['MG', 'Madagascar'],
  ['MW', 'Malawi'],
  ['MY', 'Malaysia'],
  ['MV', 'Maldives'],
  ['ML', 'Mali'],
  ['MT', 'Malta'],
  ['MH', 'Marshall Islands', true],
  ['MQ', 'Martinique'],
  ['MR', 'Mauritania'],
  ['MU', 'Mauritius'],
  ['YT', 'Mayotte'],
  ['MX', 'Mexico'],
  ['FM', 'Micronesia (Federated States of)', false, 'Micronesia'],
  ['MD', 'Moldova (the Republic of)', false, 'Moldova'],
  ['MC', 'Monaco'],
  ['MN', 'Mongolia'],
  ['ME', 'Montenegro'],
  ['MS', 'Montserrat'],
  ['MA', 'Morocco'],
  ['MZ', 'Mozambique'],
  ['MM', 'Myanmar'],
  ['NA', 'Namibia'],
  ['NR', 'Nauru'],
  ['NP', 'Nepal'],
  ['NL', 'Netherlands (Kingdom of the)', true, 'Netherlands'],
  ['NC', 'New Caledonia'],
  ['NZ', 'New Zealand'],
  ['NI', 'Nicaragua'],
  ['NE', 'Niger', true],
  ['NG', 'Nigeria'],
  ['NU', 'Niue'],
  ['NF', 'Norfolk Island'],
  ['MK', 'North Macedonia'],
  ['MP', 'Northern Mariana Islands', true],
  ['NO', 'Norway'],
  ['OM', 'Oman'],
  ['PK', 'Pakistan'],
  ['PW', 'Palau'],
  ['PS', 'Palestine, State of', false, 'Palestine'],
  ['PA', 'Panama'],
  ['PG', 'Papua New Guinea'],
  ['PY', 'Paraguay'],
  ['PE', 'Peru'],
  ['PH', 'Philippines', true],
  ['PN', 'Pitcairn'],
  ['PL', 'Poland'],
  ['PT', 'Portugal'],
  ['PR', 'Puerto Rico'],
  ['QA', 'Qatar'],
  ['RE', 'Réunion'],
  ['RO', 'Romania'],
  ['RU', 'Russian Federation', true, 'Russia'],
  ['RW', 'Rwanda'],
  ['BL', 'Saint Barthélemy'],
  ['SH', 'Saint Helena, Ascension and Tristan da Cunha'],
  ['KN', 'Saint Kitts and Nevis'],
  ['LC', 'Saint Lucia'],
  ['MF', 'Saint Martin (French part)'],
  ['PM', 'Saint Pierre and Miquelon'],
  ['VC', 'Saint Vincent and the Grenadines'],
  ['WS', 'Samoa'],
  ['SM', 'San Marino'],
  ['ST', 'Sao Tome and Principe'],
  ['SA', 'Saudi Arabia'],
  ['SN', 'Senegal'],
  ['RS', 'Serbia'],
  ['SC', 'Seychelles'],
  ['SL', 'Sierra Leone'],
  ['SG', 'Singapore'],
  ['SX', 'Sint Maarten (Dutch part)'],
  ['SK', 'Slovakia'],
  ['SI', 'Slovenia'],
  ['SB', 'Solomon Islands'],
  ['SO', 'Somalia'],
  ['ZA', 'South Africa'],
  ['GS', 'South Georgia and the South Sandwich Islands'],
  ['SS', 'South Sudan'],
  ['ES', 'Spain'],
  ['LK', 'Sri Lanka'],
  ['SD', 'Sudan', true],
  ['SR', 'Suriname'],
  ['SJ', 'Svalbard and Jan Mayen'],
  ['SE', 'Sweden'],
  ['CH', 'Switzerland'],
  ['SY', 'Syrian Arab Republic', true, 'Syria'],
  ['TW', 'Taiwan (Province of China)', false, 'Taiwan'],
  ['TJ', 'Tajikistan'],
  ['TZ', 'Tanzania, the United Republic of', false, 'Tanzania'],
  ['TH', 'Thailand'],
  ['TL', 'Timor-Leste'],
  ['TG', 'Togo'],
  ['TK', 'Tokelau'],
  ['TO', 'Tonga'],
  ['TT', 'Trinidad and Tobago'],
  ['TN', 'Tunisia'],
  ['TR', 'Türkiye'],
  ['TM', 'Turkmenistan'],
  ['TC', 'Turks and Caicos Islands', true],
  ['TV', 'Tuvalu'],
  ['UG', 'Uganda'],
  ['UA', 'Ukraine'],
  ['AE', 'United Arab Emirates', true],
  ['GB', 'United Kingdom of Great Britain and Northern Ireland', true, 'United Kingdom'],
  ['UM', 'United States Minor Outlying Islands', true],
  ['US', 'United States of America', true, 'United States'],
  ['UY', 'Uruguay'],
  ['UZ', 'Uzbekistan'],
  ['VU', 'Vanuatu'],
  ['VE', 'Venezuela (Bolivarian Republic of)', false, 'Venezuela'],
  ['VN', 'Viet Nam'],
  ['VG', 'Virgin Islands (British)', true, 'British Virgin Islands'],
  ['VI', 'Virgin Islands (U.S.)', true, 'US Virgin Islands'],
  ['WF', 'Wallis and Futuna'],
  ['EH', 'Western Sahara'],
  ['YE', 'Yemen'],
  ['ZM', 'Zambia'],
  ['ZW', 'Zimbabwe'],
];

/** The 50 US states and the District of Columbia (ISO 3166-2:US). */
const US_STATES: readonly Row[] = [
  ['US-AL', 'Alabama'], ['US-AK', 'Alaska'], ['US-AZ', 'Arizona'], ['US-AR', 'Arkansas'], ['US-CA', 'California'],
  ['US-CO', 'Colorado'], ['US-CT', 'Connecticut'], ['US-DE', 'Delaware'], ['US-DC', 'District of Columbia', true],
  ['US-FL', 'Florida'], ['US-GA', 'Georgia'], ['US-HI', 'Hawaii'], ['US-ID', 'Idaho'], ['US-IL', 'Illinois'],
  ['US-IN', 'Indiana'], ['US-IA', 'Iowa'], ['US-KS', 'Kansas'], ['US-KY', 'Kentucky'], ['US-LA', 'Louisiana'],
  ['US-ME', 'Maine'], ['US-MD', 'Maryland'], ['US-MA', 'Massachusetts'], ['US-MI', 'Michigan'], ['US-MN', 'Minnesota'],
  ['US-MS', 'Mississippi'], ['US-MO', 'Missouri'], ['US-MT', 'Montana'], ['US-NE', 'Nebraska'], ['US-NV', 'Nevada'],
  ['US-NH', 'New Hampshire'], ['US-NJ', 'New Jersey'], ['US-NM', 'New Mexico'], ['US-NY', 'New York'],
  ['US-NC', 'North Carolina'], ['US-ND', 'North Dakota'], ['US-OH', 'Ohio'], ['US-OK', 'Oklahoma'], ['US-OR', 'Oregon'],
  ['US-PA', 'Pennsylvania'], ['US-RI', 'Rhode Island'], ['US-SC', 'South Carolina'], ['US-SD', 'South Dakota'],
  ['US-TN', 'Tennessee'], ['US-TX', 'Texas'], ['US-UT', 'Utah'], ['US-VT', 'Vermont'], ['US-VA', 'Virginia'],
  ['US-WA', 'Washington'], ['US-WV', 'West Virginia'], ['US-WI', 'Wisconsin'], ['US-WY', 'Wyoming'],
];

export interface Country {
  code: string;
  /** ISO English short name, or the US state's name. */
  name: string;
  /** "US" for a US state. Null for a country. */
  parentCode: string | null;
  coverage: CoverageLevel;
}

/** Plain words for a place in a sentence: "Kenya", "the United Kingdom", "California". */
function placeOf(row: Row): string {
  const [, name, the, short] = row;
  return `${the ? 'the ' : ''}${short ?? name}`;
}

const ROWS: readonly Row[] = [...ISO_COUNTRIES, ...US_STATES];
const BY_CODE = new Map(ROWS.map((row) => [row[0], row]));

export const COUNTRIES: readonly Country[] = ROWS.map(([code, name]) => ({
  code,
  name,
  parentCode: code.startsWith('US-') ? 'US' : null,
  coverage: COVERAGE_LEVELS[code] ?? 'international',
}));

/** Every code a company can be registered in. */
export const COUNTRY_CODES = ROWS.map((row) => row[0]) as [string, ...string[]];
export type CountryCode = string;

export const countryCodeSchema = z.enum(COUNTRY_CODES, { error: "We don't recognise that country code." });

export function isCountryCode(code: string): boolean {
  return BY_CODE.has(code);
}

/** The everyday name: "United Kingdom", "Kenya", "California". Falls back to the code itself. */
export function countryName(code: string): string {
  const row = BY_CODE.get(code);
  return row ? (row[3] ?? row[1]) : code;
}

/** For use inside a sentence: "the United Kingdom", "Kenya". */
export function countryPlace(code: string): string {
  const row = BY_CODE.get(code);
  return row ? placeOf(row) : code;
}

/**
 * The level for a company registered here. `registryOn`, when the caller knows it, says whether
 * the country's own official company register is switched on (the API works it out from the
 * sources it built). Then "registry" is honest only while that register is on, and a country
 * without one stays "international". "full" is never raised or lowered by it. Without
 * `registryOn` (the web app, for example), COVERAGE_LEVELS is the default.
 */
export function coverageLevelOf(code: string, registryOn?: boolean): CoverageLevel {
  const listed = COVERAGE_LEVELS[code] ?? 'international';
  if (listed === 'full' || registryOn === undefined) return listed;
  return registryOn ? 'registry' : 'international';
}

export const countryCoverageSchema = z.object({
  level: z.enum(COVERAGE_LEVELS_ORDER),
  /** One plain sentence saying what a scan can check for a company there, and what it can't yet. */
  sentence: z.string(),
});
export type CountryCoverage = z.infer<typeof countryCoverageSchema>;

function possessive(place: string): string {
  return place.endsWith('s') ? `${place}'` : `${place}'s`;
}

/**
 * What a scan can check for a company registered here, in one sentence. It says what can be
 * checked, never that a check happened. `countryRules` is true when a rule pack of the
 * country's own exists (a draft pack counts: every pack is a draft until a lawyer approves it),
 * and the sentence then says those rules are not yet reviewed. `registryOn`: see coverageLevelOf.
 */
export function countryCoverage(code: string, options: { countryRules?: boolean; registryOn?: boolean } = {}): CountryCoverage {
  const level = coverageLevelOf(code, options.registryOn);
  const place = countryPlace(code);
  const own = possessive(place);
  if (level === 'full') {
    return { level, sentence: `We can check ${own} own company register and laws, and sanctions lists, for companies in ${place}.` };
  }
  if (level === 'registry') {
    return {
      level,
      sentence: options.countryRules
        ? `We can check international rules, sanctions, ${own} company register and a first set of ${own} own rules (not yet reviewed) for companies in ${place}.`
        : `We can check international rules, sanctions and ${own} company register for companies in ${place}, but not yet ${own} own laws.`,
    };
  }
  if (code === 'US') {
    return { level, sentence: "We can check US federal rules, international rules and sanctions for companies in the United States, but not yet a state's company register or state laws." };
  }
  if (code.startsWith('US-')) {
    return { level, sentence: `We can check US federal rules, international rules and sanctions for companies in ${place}, but not yet ${own} own company register or state laws.` };
  }
  return {
    level,
    sentence: options.countryRules
      ? `We can check international rules, sanctions and a first set of ${own} own rules (not yet reviewed) for companies in ${place}, but not yet ${own} own company register.`
      : `We can check international rules and sanctions for companies in ${place}, but not yet ${own} own company register or laws.`,
  };
}

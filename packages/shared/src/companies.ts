import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './common';
import { COMPANY_RELATIONSHIPS, COMPANY_STAGES, MARKET_KINDS } from './constants';
import { countryCodeSchema, countryCoverageSchema } from './countries';

/** Any country in COUNTRIES. docs/GLOBAL-COVERAGE.md says what a scan checks in each. */
const countrySchema = countryCodeSchema;

export const companyMarketSchema = z.object({
  country: countrySchema,
  kind: z.enum(MARKET_KINDS, { error: 'That market type does not exist.' }),
});
export type CompanyMarket = z.infer<typeof companyMarketSchema>;

export const companySchema = z.object({
  id: uuidSchema,
  organisationId: uuidSchema,
  legalName: z.string(),
  registrationNumber: z.string().nullable(),
  entityType: z.string().nullable(),
  incorporationCountry: countrySchema,
  /** The US state for a US company ("DE", "CA"), otherwise null. Derived by the database. */
  incorporationState: z.string().nullable(),
  stage: z.enum(COMPANY_STAGES).nullable(),
  sectors: z.array(z.string()),
  website: z.string().nullable(),
  /** Not registered yet: the company is still being set up. */
  preIncorporation: z.boolean(),
  /** The parent, when this entity belongs to a group. */
  parentCompanyId: uuidSchema.nullable(),
  yearEnd: z.object({ month: z.number().int(), day: z.number().int() }).nullable(),
  markets: z.array(companyMarketSchema),
  /** How much a scan can check in the country of incorporation, in plain words. Always sent. */
  countryCoverage: countryCoverageSchema.optional(),
  /**
   * `own`: this team runs the company and can add evidence. `follow`: a read-only public-data
   * scan of someone else's company. Always sent; optional only so older screens still compile.
   */
  relationship: z.enum(COMPANY_RELATIONSHIPS).optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type Company = z.infer<typeof companySchema>;

export const companyListResponseSchema = z.object({ companies: z.array(companySchema) });
export type CompanyListResponse = z.infer<typeof companyListResponseSchema>;

export const companyParamsSchema = z.object({ companyId: uuidSchema });

/** The company list holds the companies you own. The watchlist (`GET /v1/watchlist`) holds the ones you follow. */
export const companyListQuerySchema = z.object({
  relationship: z.enum([...COMPANY_RELATIONSHIPS, 'all'], { error: 'Choose own, follow or all.' }).default('own'),
});

const legalNameSchema = z
  .string({ error: 'Enter the company name.' })
  .trim()
  .min(1, { error: 'Enter the company name.' })
  .max(300, { error: 'That company name is too long.' });
const registrationNumberSchema = z
  .string()
  .trim()
  .min(1, { error: 'Enter the registration number, or leave it out.' })
  .max(64, { error: 'That registration number is too long.' });
const entityTypeSchema = z
  .string()
  .trim()
  .min(1, { error: 'Enter the entity type, or leave it out.' })
  .max(100, { error: 'That entity type is too long.' });
const stageSchema = z.enum(COMPANY_STAGES, { error: 'That company stage does not exist.' });
const sectorsSchema = z
  .array(z.string().trim().min(1).max(80), { error: 'Sectors must be a list.' })
  .max(20, { error: 'Choose 20 sectors or fewer.' });
const websiteSchema = z
  .url({ protocol: /^https?$/, error: 'Enter a full web address, starting with https://.' })
  .max(500, { error: 'That web address is too long.' });
const marketsSchema = z
  .array(companyMarketSchema, { error: 'Markets must be a list.' })
  .max(30, { error: 'That is too many markets.' })
  .refine(
    (markets) => new Set(markets.map((m) => `${m.country}/${m.kind}`)).size === markets.length,
    { error: 'The same market is listed twice.' },
  );

const yearEndSchema = z
  .object({
    month: z.number({ error: 'Choose a month.' }).int().min(1, { error: 'Choose a month.' }).max(12, { error: 'Choose a month.' }),
    day: z.number({ error: 'Choose a day.' }).int().min(1, { error: 'Choose a day.' }).max(31, { error: 'Choose a day.' }),
  })
  .refine(({ month, day }) => day <= new Date(Date.UTC(2024, month, 0)).getUTCDate(), { error: 'That date does not exist.' });

export const createCompanyBodySchema = z.object({
  legalName: legalNameSchema,
  incorporationCountry: countrySchema,
  registrationNumber: registrationNumberSchema.optional(),
  entityType: entityTypeSchema.optional(),
  stage: stageSchema.optional(),
  sectors: sectorsSchema.optional(),
  website: websiteSchema.optional(),
  markets: marketsSchema.optional(),
  preIncorporation: z.boolean({ error: 'Say whether the company is registered yet.' }).optional(),
  parentCompanyId: uuidSchema.optional(),
  yearEnd: yearEndSchema.optional(),
});
export type CreateCompanyBody = z.infer<typeof createCompanyBodySchema>;

/**
 * Partial update. `null` clears an optional field. `markets`, when present,
 * replaces the whole list. The country of incorporation can be corrected too.
 */
export const updateCompanyBodySchema = z
  .object({
    legalName: legalNameSchema.optional(),
    incorporationCountry: countrySchema.optional(),
    registrationNumber: registrationNumberSchema.nullable().optional(),
    entityType: entityTypeSchema.nullable().optional(),
    stage: stageSchema.nullable().optional(),
    sectors: sectorsSchema.optional(),
    website: websiteSchema.nullable().optional(),
    markets: marketsSchema.optional(),
    preIncorporation: z.boolean({ error: 'Say whether the company is registered yet.' }).optional(),
    yearEnd: yearEndSchema.nullable().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { error: 'Nothing to change.' });
export type UpdateCompanyBody = z.infer<typeof updateCompanyBodySchema>;

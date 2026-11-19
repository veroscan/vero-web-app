import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './common';
import { changeSummarySchema } from './changes';
import { companySchema } from './companies';
import { countryCodeSchema, countryCoverageSchema } from './countries';
import { coverageSchema, scoreViewSchema, statusWordSchema } from './product';

/**
 * The watchlist: companies an organisation follows, read-only (owner's decision, 19 Nov 2026).
 * Anyone can follow any company. Only the team that owns a company can add evidence for it.
 */

export const watchlistItemSchema = z.object({
  companyId: uuidSchema,
  legalName: z.string(),
  registrationNumber: z.string().nullable(),
  incorporationCountry: countryCodeSchema,
  /** How much a scan can check in that country, in plain words. */
  countryCoverage: countryCoverageSchema,
  /** Exact or a range, by plan. "none" before the first result. */
  score: scoreViewSchema,
  statusWord: statusWordSchema.nullable(),
  /** What the score rests on. Null before the first result. */
  coverage: coverageSchema.nullable(),
  lastScannedAt: isoDateTimeSchema.nullable(),
  scanInProgress: z.boolean(),
  /** The newest scan that changed something, or null. */
  lastChange: changeSummarySchema.nullable(),
  followedAt: isoDateTimeSchema,
});
export type WatchlistItem = z.infer<typeof watchlistItemSchema>;

export const watchlistResponseSchema = z.object({
  companies: z.array(watchlistItemSchema),
  /** Companies followed now, and how many the plan allows. */
  used: z.number().int(),
  limit: z.number().int(),
});
export type WatchlistResponse = z.infer<typeof watchlistResponseSchema>;

/** A registry candidate (name and number) or just a country and a name. */
export const followCompanyBodySchema = z.object({
  legalName: z
    .string({ error: 'Enter the company name.' })
    .trim()
    .min(1, { error: 'Enter the company name.' })
    .max(300, { error: 'That company name is too long.' }),
  incorporationCountry: countryCodeSchema,
  registrationNumber: z
    .string()
    .trim()
    .min(1, { error: 'Enter the registration number, or leave it out.' })
    .max(64, { error: 'That registration number is too long.' })
    .optional(),
  entityType: z.string().trim().min(1).max(100, { error: 'That entity type is too long.' }).optional(),
  website: z
    .url({ protocol: /^https?$/, error: 'Enter a full web address, starting with https://.' })
    .max(500, { error: 'That web address is too long.' })
    .optional(),
});
export type FollowCompanyBody = z.infer<typeof followCompanyBodySchema>;

export const followCompanyResponseSchema = z.object({
  company: companySchema,
  /** The public-data scan started for it. */
  scanId: uuidSchema,
});
export type FollowCompanyResponse = z.infer<typeof followCompanyResponseSchema>;

export const watchlistParamsSchema = z.object({ companyId: uuidSchema });

// ---- Scan history ----

export const companyHistoryItemSchema = z.object({
  scanId: uuidSchema,
  /** full: the sources were asked again. rescore: the same facts, scored again after a change. */
  kind: z.enum(['full', 'rescore']),
  trigger: z.string(),
  finishedAt: isoDateTimeSchema,
  /** Exact or a range, by plan. */
  score: scoreViewSchema,
  statusWord: statusWordSchema.nullable(),
  coverage: coverageSchema.nullable(),
  methodVersion: z.string(),
  rulePackVersions: z.record(z.string(), z.string()),
  /** What this scan changed from the one before. Null for the first scan. */
  change: changeSummarySchema.nullable(),
});
export type CompanyHistoryItem = z.infer<typeof companyHistoryItemSchema>;

export const companyHistoryResponseSchema = z.object({
  companyId: uuidSchema,
  /** Newest first. Empty before the first scan finishes. */
  scans: z.array(companyHistoryItemSchema),
});
export type CompanyHistoryResponse = z.infer<typeof companyHistoryResponseSchema>;

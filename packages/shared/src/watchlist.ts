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

export const watchlistMonitoringSchema = z.object({
  on: z.boolean(),
  /** not_switched_on: regular re-checks aren't running yet. plan: this plan has none. sample: a sample organisation. */
  reason: z.enum(['on', 'not_switched_on', 'plan', 'sample']),
  /** How often each company is re-checked, in days. Null when off. */
  everyDays: z.number().int().nullable(),
  /** The same, in plain words for the screen. */
  note: z.string(),
});
export type WatchlistMonitoring = z.infer<typeof watchlistMonitoringSchema>;

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
  /** Open urgent issues in the newest result. A count only. Null before the first result. Always sent. */
  urgentGapCount: z.number().int().min(0).nullable().optional(),
  /**
   * When the next regular re-check is due, from the monitoring schedule. Null when monitoring is
   * off (see `monitoring` on the list) or no full scan has finished yet. It is when the company
   * becomes due, not a promise of the minute: re-checks run hourly, under a daily cap. Always sent.
   */
  nextScanDueAt: isoDateTimeSchema.nullable().optional(),
});
export type WatchlistItem = z.infer<typeof watchlistItemSchema>;

export const watchlistResponseSchema = z.object({
  companies: z.array(watchlistItemSchema),
  /** Companies followed now, and how many the plan allows. */
  used: z.number().int(),
  limit: z.number().int(),
  /** Whether followed companies are re-checked on our own, and if not, why. Always sent. */
  monitoring: watchlistMonitoringSchema.optional(),
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

// ---- Score history, for one company or its group ----

export const scoreHistoryQuerySchema = z.object({
  /** "group" adds the related companies to this one, scored together as the overview does. */
  scope: z.enum(['company', 'group'], { error: 'Scope must be company or group.' }).default('company'),
});

export const scoreHistoryPointSchema = z.object({
  /** The finished scan that produced this point, and whose company it was. */
  scanId: uuidSchema,
  companyId: uuidSchema,
  at: isoDateTimeSchema,
  /** Exact or a range, by plan. For a group: every company's newest result at that moment, scored together. */
  score: scoreViewSchema,
  statusWord: statusWordSchema.nullable(),
  coverage: coverageSchema.nullable(),
});
export type ScoreHistoryPoint = z.infer<typeof scoreHistoryPointSchema>;

export const scoreHistoryResponseSchema = z.object({
  companyId: uuidSchema,
  scope: z.enum(['company', 'group']),
  /** Oldest first. Empty before the first scan finishes. */
  points: z.array(scoreHistoryPointSchema),
});
export type ScoreHistoryResponse = z.infer<typeof scoreHistoryResponseSchema>;

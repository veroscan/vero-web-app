/**
 * Request and response schemas for the core product: register search, questionnaire, scans,
 * results, deadlines, records, orders, badge and sharing, and search. Every shape the API
 * sends or accepts for these lives here, so the web app and the API can't drift apart.
 */
import { z } from 'zod';
import { isoDateTimeSchema, paginationQuerySchema, uuidSchema } from './common';
import { changeSummarySchema } from './changes';
import { countryCodeSchema, countryCoverageSchema } from './countries';
import { planCodeSchema } from './plans';
import { SLOT_STATES } from './constants';

/** Any country in COUNTRIES (countries.ts). An unknown code gets "We don't recognise that country code." */
export const countrySchema = countryCodeSchema;
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Dates look like 2026-11-05.' });
/** A rule id such as GB.CORP.CONFIRMATION_STATEMENT. Stable across re-scores, unlike a finding id. */
export const ruleKeySchema = z.string().regex(/^[A-Z][A-Z0-9_-]*(\.[A-Z0-9_]+)+$/, { error: 'That issue does not exist.' }).max(120);

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
export const severitySchema = z.enum(SEVERITIES, { error: 'That severity does not exist.' });
export const OUTCOMES = ['pass', 'gap', 'defect', 'verify', 'not_applicable'] as const;
export const outcomeSchema = z.enum(OUTCOMES, { error: 'That outcome does not exist.' });

export const AREA_DESCRIPTIONS: Record<number, string> = {
  1: 'Registration, directors and filings',
  2: 'Who owns your code, brand and ideas',
  3: 'Data protection and the licences you need',
  4: 'What you sign with customers, staff and suppliers',
  5: 'Your cap table, SAFEs and investor documents',
  6: 'How you use and train AI',
};

// ---- Register search ----

export const registrySearchQuerySchema = z.object({
  country: countrySchema,
  q: z
    .string({ error: 'Enter a company name or number.' })
    .trim()
    .min(2, { error: 'Enter at least two characters.' })
    .max(200, { error: 'That search is too long.' }),
});

export const registryCandidateSchema = z.object({
  name: z.string(),
  registrationNumber: z.string().nullable(),
  /** Delaware only, from the licensed provider. */
  registeredAgent: z.string().nullable(),
  entityType: z.string().nullable(),
  incorporatedOn: z.string().nullable(),
  matchConfidence: z.number().min(0).max(1),
});

export const registrySearchResponseSchema = z.object({
  /**
   * "not_found" is never proof of absence, and the message says so. "not_available" means we
   * can't search that country's register yet: the company is entered by hand.
   */
  outcome: z.enum(['found', 'ambiguous', 'not_found', 'source_down', 'not_available']),
  sourceName: z.string(),
  message: z.string(),
  candidates: z.array(registryCandidateSchema),
  /** How much a scan can check in the searched country, in plain words. Always sent. */
  countryCoverage: countryCoverageSchema.optional(),
  checkedAt: isoDateTimeSchema,
  /** True when this came from fixture data, so the screen can say it isn't a real record. */
  sampleData: z.boolean(),
});
export type RegistrySearchResponse = z.infer<typeof registrySearchResponseSchema>;

// ---- Questionnaire ----

export const lookupRequestBodySchema = z.object({
  country: countrySchema,
  legalName: z.string({ error: 'Enter the company name.' }).trim().min(1, { error: 'Enter the company name.' }).max(300, { error: 'That company name is too long.' }),
  registrationNumber: z.string().trim().min(1).max(64, { error: 'That registration number is too long.' }).optional(),
  note: z.string().trim().max(2000, { error: 'That note is too long.' }).optional(),
});
export const lookupRequestSchema = z.object({
  id: uuidSchema,
  country: countrySchema,
  legalName: z.string(),
  registrationNumber: z.string().nullable(),
  status: z.enum(['requested', 'in_progress', 'completed', 'cancelled']),
  createdAt: isoDateTimeSchema,
});
export type LookupRequest = z.infer<typeof lookupRequestSchema>;
export const lookupRequestListResponseSchema = z.object({ requests: z.array(lookupRequestSchema) });

export const answerValueSchema = z.union([z.string().max(2000), z.number(), z.boolean(), z.array(z.string().max(200)).max(50)]);

export const questionnaireFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  help: z.string().nullable(),
  type: z.enum(['boolean', 'single', 'multi', 'number', 'date', 'text']),
  options: z.array(z.object({ value: z.string(), label: z.string() })).nullable(),
  value: answerValueSchema.nullable(),
});

export const questionnaireResponseSchema = z.object({
  version: z.string(),
  questions: z.array(
    z.object({
      number: z.number().int(),
      id: z.string(),
      title: z.string(),
      whyWeAsk: z.string(),
      fields: z.array(questionnaireFieldSchema),
    }),
  ),
  answeredFields: z.number().int(),
  visibleFields: z.number().int(),
  complete: z.boolean(),
  /** True when this save queued a new score. */
  rescoreQueued: z.boolean(),
});
export type QuestionnaireResponse = z.infer<typeof questionnaireResponseSchema>;

export const updateAnswersBodySchema = z.object({
  answers: z
    .record(z.string().regex(/^[a-z0-9_]+$/).max(80), answerValueSchema.nullable(), { error: 'Answers must be a list of fields and values.' })
    .refine((answers) => Object.keys(answers).length > 0, { error: 'Nothing to save.' }),
});
export type UpdateAnswersBody = z.infer<typeof updateAnswersBodySchema>;

export const attestationBodySchema = z.object({
  key: z.string().regex(/^[a-z0-9_]+$/, { error: 'We do not ask about that.' }).max(80),
  value: z.boolean({ error: 'Say yes or no.' }),
});
export const attestationResponseSchema = z.object({ key: z.string(), value: z.boolean(), rescoreQueued: z.boolean() });

// ---- Scans ----

export const SCAN_STATUSES = ['queued', 'running', 'partial', 'completed', 'failed'] as const;
export const SOURCE_STATES = ['waiting', 'found', 'not_found', 'ambiguous', 'error', 'unsupported', 'unavailable'] as const;

export const scanSourceSchema = z.object({
  connectorId: z.string(),
  sourceName: z.string(),
  state: z.enum(SOURCE_STATES),
  /** A name that stands alone on a row, such as "Sanctions lists". */
  title: z.string(),
  /** Plain words for the scanning screen. */
  summary: z.string(),
  /** True for error and unavailable: "one source is down". It doesn't count for or against the score. */
  down: z.boolean(),
  lastTriedAt: isoDateTimeSchema.nullable(),
  sampleData: z.boolean(),
});
export type ScanSource = z.infer<typeof scanSourceSchema>;

export const scanSchema = z.object({
  id: uuidSchema,
  companyId: uuidSchema,
  kind: z.enum(['full', 'rescore']),
  trigger: z.string(),
  status: z.enum(SCAN_STATUSES),
  startedAt: isoDateTimeSchema.nullable(),
  completedAt: isoDateTimeSchema.nullable(),
  /** Sources that really answered. One that's down isn't done. */
  checksDone: z.number().int(),
  /** Sources that are down or not connected. */
  checksDown: z.number().int(),
  checksTotal: z.number().int(),
  sources: z.array(scanSourceSchema),
  rulePackVersions: z.record(z.string(), z.string()),
  /** How long to wait before asking again. Zero once the scan has finished. */
  pollAfterMs: z.number().int(),
});
export type Scan = z.infer<typeof scanSchema>;

export const scanParamsSchema = z.object({ scanId: uuidSchema });
export const scanListResponseSchema = z.object({ scans: z.array(scanSchema) });

// ---- Results ----

export const scoreViewSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('exact'), value: z.number().int() }),
  /** Free plan. The exact number is never sent. */
  z.object({ kind: z.literal('approximate'), low: z.number().int(), high: z.number().int() }),
  /** Nothing scored yet. */
  z.object({ kind: z.literal('none') }),
]);
export type ScoreView = z.infer<typeof scoreViewSchema>;

export const statusWordSchema = z.enum(['Healthy', 'Early read', 'Needs work', 'At risk']);

/** What a score rests on: "Based on 16 of 118 checks". */
export const coverageSchema = z.object({ counted: z.number().int(), total: z.number().int() });
export type Coverage = z.infer<typeof coverageSchema>;

export const issueSummarySchema = z.object({
  ruleKey: z.string(),
  companyId: uuidSchema,
  companyName: z.string(),
  /** The rule's own name, such as "Annual accounts". Use this beside "Passed". Always sent. */
  title: z.string().optional(),
  /** Always describes the problem, so don't show it beside a passed check. */
  headline: z.string(),
  layer: z.number().int(),
  layerName: z.string(),
  area: z.string(),
  severity: severitySchema,
  severityWord: z.string(),
  outcome: outcomeSchema,
  /** Words for the row: "Needs fixing", "In good shape", "Not checked yet". */
  outcomeWord: z.string(),
  /** The market this is for: a country code such as GB or US-DE, or INTL for the international rules. */
  country: z.string(),
  countryLabel: z.string(),
  /** "incorporated" is the company's home country. "market" means it has users or operates there. */
  appliesBecause: z.enum(['incorporated', 'market']),
  /** How much the overall score rises if this alone were fixed. Null when the plan hides it. */
  points: z.number().int().nullable(),
  /** True when points is 0 because another urgent issue is holding the score. Always sent. */
  pointsHeldByUrgent: z.boolean().optional(),
  /** A document-only check we haven't seen, so offer "We don't have this". Always sent. */
  canDeclareMissing: z.boolean().optional(),
  /** They've told us they don't have it, so offer the undo. Always sent. */
  declaredMissing: z.boolean().optional(),
  dueOn: z.string().nullable(),
  actionType: z.string(),
  quickOrder: z.string().nullable(),
  howWeKnow: z.array(z.string()),
});
export type IssueSummary = z.infer<typeof issueSummarySchema>;

export const resultsScopeQuerySchema = z.object({
  /** "group" adds the related companies to this one. */
  scope: z.enum(['company', 'group'], { error: 'Scope must be company or group.' }).default('company'),
});

export const overviewResponseSchema = z.object({
  companyId: uuidSchema,
  scope: z.enum(['company', 'group']),
  plan: planCodeSchema,
  hasResult: z.boolean(),
  score: scoreViewSchema,
  statusWord: statusWordSchema.nullable(),
  /** For a range, only what the range used. Null with no result yet. */
  coverage: coverageSchema.nullable(),
  /** The urgent cap is what's holding this score down. */
  heldByUrgent: z.boolean(),
  verifiedThreshold: z.number().int(),
  trend: z.object({ delta: z.number().int(), since: isoDateTimeSchema }).nullable(),
  areas: z.array(
    z.object({
      layer: z.number().int(),
      name: z.string(),
      description: z.string(),
      /** Null when no scored rule applies, or the plan doesn't include area scores. */
      score: z.number().int().nullable(),
      statusWord: statusWordSchema.nullable(),
      capped: z.boolean(),
      locked: z.boolean(),
      coverage: coverageSchema.nullable(),
      openCount: z.number().int().nullable(),
      topIssue: z.object({ ruleKey: z.string(), headline: z.string(), points: z.number().int().nullable() }).nullable(),
    }),
  ),
  nextAction: z
    .object({
      ruleKey: z.string(),
      companyId: uuidSchema,
      title: z.string(),
      why: z.string(),
      points: z.number().int().nullable(),
      actionType: z.string(),
    })
    .nullable(),
  topDeadlines: z.array(
    z.object({
      id: uuidSchema,
      companyName: z.string(),
      title: z.string(),
      dueOn: z.string(),
      state: z.enum(['overdue', 'due_soon', 'upcoming', 'done']),
    }),
  ),
  sourcesDown: z.array(z.object({ sourceName: z.string(), lastTriedAt: isoDateTimeSchema.nullable() })),
  /** The result rests on fixture data. The screen must say so. */
  sampleData: z.boolean(),
  rulePacks: z.array(z.object({ jurisdiction: z.string(), version: z.string(), status: z.string(), mode: z.enum(['full', 'overlay']) })),
  /** How much a scan can check in the country of incorporation, in plain words. Always sent. */
  countryCoverage: countryCoverageSchema.optional(),
  methodVersion: z.string().nullable(),
  scannedAt: isoDateTimeSchema.nullable(),
  /** The newest change since this person last looked at the company, or null. */
  whatChanged: changeSummarySchema.nullable(),
  notLegalAdvice: z.string(),
});
export type OverviewResponse = z.infer<typeof overviewResponseSchema>;

export const issueListQuerySchema = resultsScopeQuerySchema.extend({
  layer: z.coerce.number({ error: 'That area does not exist.' }).int().min(1, { error: 'That area does not exist.' }).max(6, { error: 'That area does not exist.' }).optional(),
  severity: severitySchema.optional(),
  country: z.string().max(10).optional(),
  outcome: z.enum(['open', 'passed', 'to_check', 'all'], { error: 'That filter does not exist.' }).default('open'),
});

export const issueListResponseSchema = z.object({
  issues: z.array(issueSummarySchema),
  total: z.number().int(),
  /** Gaps this plan doesn't show. A count only: nothing about them is sent. */
  lockedCount: z.number().int(),
  passedCount: z.number().int().nullable(),
  score: scoreViewSchema,
});
export type IssueListResponse = z.infer<typeof issueListResponseSchema>;

export const companyIssueParamsSchema = z.object({ companyId: uuidSchema, ruleKey: ruleKeySchema });

export const issueDetailSchema = issueSummarySchema.extend({
  missing: z.string(),
  why: z.string(),
  ifLeft: z.string(),
  fix: z.string(),
  /** Why we couldn't call it, in plain words, when the outcome is "verify". */
  reasonWords: z.string().nullable(),
  evidence: z.array(z.string()),
  law: z.array(z.object({ law: z.string(), cite: z.string().nullable() })),
  regulator: z.string().nullable(),
  /** Score now and if this were fixed. Null when the plan hides it. */
  projection: z.object({ from: z.number().int(), to: z.number().int() }).nullable(),
  rulePackVersion: z.string(),
  ruleStatus: z.string(),
  /** The documents that clear this issue, and where each one stands. Empty when no document can. */
  proof: z.array(z.object({ slotKey: z.string(), label: z.string(), state: z.enum(SLOT_STATES) })),
  /** This team owns the company and its plan includes the vault, so it can upload the proof. */
  canAddEvidence: z.boolean(),
  notLegalAdvice: z.string(),
});
export type IssueDetail = z.infer<typeof issueDetailSchema>;

export const areaParamsSchema = z.object({
  companyId: uuidSchema,
  layer: z.coerce.number({ error: 'That area does not exist.' }).int().min(1, { error: 'That area does not exist.' }).max(6, { error: 'That area does not exist.' }),
});

export const areaResponseSchema = z.object({
  layer: z.number().int(),
  name: z.string(),
  description: z.string(),
  score: z.number().int().nullable(),
  statusWord: statusWordSchema.nullable(),
  capped: z.boolean(),
  coverage: coverageSchema,
  cappedExplanation: z.string().nullable(),
  toFix: z.array(issueSummarySchema),
  inGoodShape: z.array(issueSummarySchema),
  toCheck: z.array(issueSummarySchema),
});
export type AreaResponse = z.infer<typeof areaResponseSchema>;

/** One company: ruleKeys. A group: fixes, because the same rule can be open on two companies. */
export const projectionBodySchema = z
  .object({
    ruleKeys: z.array(ruleKeySchema, { error: 'Choose at least one issue.' }).min(1, { error: 'Choose at least one issue.' }).max(100, { error: 'That is too many issues.' }).optional(),
    fixes: z
      .array(z.object({ companyId: uuidSchema, ruleKey: ruleKeySchema }), { error: 'Choose at least one issue.' })
      .min(1, { error: 'Choose at least one issue.' })
      .max(300, { error: 'That is too many issues.' })
      .optional(),
  })
  .refine((body) => body.ruleKeys !== undefined || body.fixes !== undefined, { error: 'Choose at least one issue.' });
export const projectionResponseSchema = z.object({
  current: z.number().int(),
  projected: z.number().int(),
  gain: z.number().int(),
  reachesVerification: z.boolean(),
  /** After these fixes, an urgent issue would still be holding the score. */
  heldByUrgent: z.boolean(),
});
export const declareMissingResponseSchema = z.object({
  ruleKey: z.string(),
  declaredMissing: z.boolean(),
  rescoreQueued: z.boolean(),
});
export type ProjectionResponse = z.infer<typeof projectionResponseSchema>;

// ---- Deadlines ----

export const deadlineStateSchema = z.enum(['overdue', 'due_soon', 'upcoming', 'done']);

export const deadlineSchema = z.object({
  id: uuidSchema,
  companyId: uuidSchema,
  companyName: z.string(),
  ruleKey: z.string().nullable(),
  title: z.string(),
  layer: z.number().int().nullable(),
  dueOn: z.string(),
  state: deadlineStateSchema,
  daysUntil: z.number().int(),
  /** "auto" means we watch a source. "reminder" means we remind you and ask for proof. */
  monitoring: z.enum(['auto', 'reminder']),
  howWeTrack: z.string(),
  basis: z.string().nullable(),
  /** The date rests on a rule whose content hasn't been reviewed yet. */
  needsReview: z.boolean(),
});
export type Deadline = z.infer<typeof deadlineSchema>;

export const deadlineListQuerySchema = z.object({
  companyId: uuidSchema.optional(),
  state: deadlineStateSchema.optional(),
});
export const deadlineListResponseSchema = z.object({
  deadlines: z.array(deadlineSchema),
  /** Obligations we can't date yet, and what we'd need to. */
  undated: z.array(
    z.object({
      companyId: uuidSchema,
      ruleKey: z.string(),
      title: z.string(),
      monitoring: z.enum(['auto', 'reminder']),
      howWeTrack: z.string(),
      waitingOn: z.string(),
    }),
  ),
});
export type DeadlineListResponse = z.infer<typeof deadlineListResponseSchema>;
export const deadlineParamsSchema = z.object({ deadlineId: uuidSchema });

// ---- Company records ----

export const recordItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.string(),
  /** Needs the person to do something, such as upload a receipt. */
  needsYou: z.boolean(),
  source: z.string().nullable(),
  retrievedAt: isoDateTimeSchema.nullable(),
  howWeKnow: z.string(),
  sampleData: z.boolean(),
});
export type RecordItem = z.infer<typeof recordItemSchema>;

export const companyRecordsResponseSchema = z.object({
  companyId: uuidSchema,
  legalName: z.string(),
  country: countrySchema,
  checkedAt: isoDateTimeSchema.nullable(),
  items: z.array(recordItemSchema),
  sources: z.array(scanSourceSchema),
  /** Delaware only: why the status isn't live, in plain words. */
  statusNote: z.string().nullable(),
  /** How much a scan can check in this country, in plain words. Always sent. */
  countryCoverage: countryCoverageSchema.optional(),
  sampleData: z.boolean(),
});
export type CompanyRecordsResponse = z.infer<typeof companyRecordsResponseSchema>;

// ---- Badge and shared report ----

export const badgeStatusResponseSchema = z.object({
  companyId: uuidSchema,
  eligible: z.boolean(),
  blockers: z.array(z.string()),
  requirements: z.object({
    minScore: z.number().int(),
    /** Null on plans that only see a range. */
    currentScore: z.number().int().nullable(),
    /** The share of applicable checks that must count, as a whole percentage. */
    minCoveragePercent: z.number().int(),
    /** Null on plans that only see a range. */
    coverage: coverageSchema.nullable(),
    openUrgent: z.number().int().nullable(),
    /** The date of the newest finished full scan, or null before the first one. */
    lastFullScanOn: z.string().nullable(),
    /** The badge needs a full scan within this many days. */
    fullScanWithinDays: z.number().int(),
  }),
  badge: z
    .object({
      id: uuidSchema,
      issuedAt: isoDateTimeSchema,
      expiresAt: isoDateTimeSchema,
      scoreAtIssue: z.number().int(),
      active: z.boolean(),
    })
    .nullable(),
});
export type BadgeStatusResponse = z.infer<typeof badgeStatusResponseSchema>;

export const badgeIssuedResponseSchema = badgeStatusResponseSchema.extend({
  /** The public link's token. Shown once: only its hash is kept. */
  publicToken: z.string(),
});

export const publicBadgeResponseSchema = z.object({
  companyName: z.string(),
  verified: z.literal(true),
  reviewedBy: z.string(),
  issuedAt: isoDateTimeSchema,
  expiresAt: isoDateTimeSchema,
  scoreAtIssue: z.number().int(),
  notLegalAdvice: z.string(),
});
export type PublicBadgeResponse = z.infer<typeof publicBadgeResponseSchema>;

export const createShareBodySchema = z.object({
  expiresInDays: z
    .number({ error: 'Choose how many days the link lasts.' })
    .int({ error: 'Choose a whole number of days.' })
    .min(1, { error: 'A link lasts at least one day.' })
    .max(90, { error: 'A link can last up to 90 days.' })
    .default(30),
});
export const shareLinkSchema = z.object({
  id: uuidSchema,
  companyId: uuidSchema,
  expiresAt: isoDateTimeSchema,
  revokedAt: isoDateTimeSchema.nullable(),
  createdAt: isoDateTimeSchema,
  active: z.boolean(),
});
export type ShareLink = z.infer<typeof shareLinkSchema>;
export const shareCreatedResponseSchema = shareLinkSchema.extend({
  /** The public link's token. Shown once: only its hash is kept. */
  token: z.string(),
});
export const shareListResponseSchema = z.object({ links: z.array(shareLinkSchema) });
export const shareParamsSchema = z.object({ shareId: uuidSchema });

/**
 * Everything the public can ever see. A summary and counts, as in the design, and never
 * documents, issue details or rule names. The route passes its answer through this, so a
 * field not listed here cannot leave the server.
 */
export const publicReportResponseSchema = z.object({
  companyName: z.string(),
  score: z.number().int().nullable(),
  statusWord: statusWordSchema.nullable(),
  /** Links made before these existed don't have them. */
  coverage: coverageSchema.nullable().default(null),
  heldByUrgent: z.boolean().default(false),
  reportDate: isoDateTimeSchema,
  expiresAt: isoDateTimeSchema,
  openIssues: z.object({
    total: z.number().int(),
    urgent: z.number().int(),
    important: z.number().int(),
    worthDoing: z.number().int(),
  }),
  areas: z.array(
    z.object({
      name: z.string(),
      score: z.number().int().nullable(),
      statusWord: statusWordSchema.nullable(),
      openUrgent: z.number().int(),
      openImportant: z.number().int(),
      openWorthDoing: z.number().int(),
    }),
  ),
  checked: z.array(z.object({ country: z.string(), howWeKnow: z.string() })),
  /** How much a scan can check in the country of incorporation. Links made before this existed don't have it. */
  countryCoverage: countryCoverageSchema.optional(),
  sampleData: z.boolean(),
  notLegalAdvice: z.string(),
});
export type PublicReportResponse = z.infer<typeof publicReportResponseSchema>;

export const publicTokenParamsSchema = z.object({
  token: z.string().min(20, { error: 'That link is not valid.' }).max(200, { error: 'That link is not valid.' }),
});

// ---- Search ----

export const searchQuerySchema = z.object({
  q: z.string({ error: 'Type something to search for.' }).trim().min(2, { error: 'Type at least two characters.' }).max(100, { error: 'That search is too long.' }),
});
export const searchResponseSchema = z.object({
  issues: z.array(z.object({ ruleKey: z.string(), companyId: uuidSchema, title: z.string(), subtitle: z.string() })),
  documents: z.array(z.object({ id: uuidSchema, companyId: uuidSchema, title: z.string(), subtitle: z.string() })),
  deadlines: z.array(z.object({ id: uuidSchema, companyId: uuidSchema, title: z.string(), subtitle: z.string() })),
});
export type SearchResponse = z.infer<typeof searchResponseSchema>;

// ---- Admin and review desk ----

export const STAFF_ROLES = ['lawyer', 'admin'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export const staffRoleSchema = z.enum(STAFF_ROLES, { error: 'That staff role does not exist.' });

export const rulePackSchema = z.object({
  jurisdiction: z.string(),
  name: z.string().nullable(),
  version: z.string(),
  status: z.enum(['draft', 'approved', 'retired']),
  approvedBy: z.string().nullable(),
  approvedAt: isoDateTimeSchema.nullable(),
  ruleCount: z.number().int(),
  needsReviewCount: z.number().int(),
});
export type RulePack = z.infer<typeof rulePackSchema>;
export const rulePackListResponseSchema = z.object({ packs: z.array(rulePackSchema) });
export const rulePackParamsSchema = z.object({
  /** A country code such as GB or US-DE, or INTL for the international pack. */
  jurisdiction: z.string().regex(/^(INTL|[A-Z]{2}(-[A-Z0-9]{1,3})?)$/, { error: 'That rule pack does not exist.' }),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, { error: 'That rule pack does not exist.' }),
});
export const approveRulePackBodySchema = z.object({
  approverName: z.string({ error: 'Name the person approving this.' }).trim().min(2, { error: 'Name the person approving this.' }).max(200),
});

export const connectorHealthResponseSchema = z.object({
  mode: z.enum(['live', 'fixture']),
  connectors: z.array(
    z.object({
      id: z.string(),
      sourceName: z.string(),
      jurisdictions: z.array(z.string()),
      lastStatus: z.string().nullable(),
      lastCheckedAt: isoDateTimeSchema.nullable(),
      lastOkAt: isoDateTimeSchema.nullable(),
      lastFailureAt: isoDateTimeSchema.nullable(),
      consecutiveFailures: z.number().int(),
    }),
  ),
  /** The stored public lists behind the ICO, NDPC and sanctions sources. Added later, so it defaults to empty. */
  referenceData: z
    .object({
      refreshEnabled: z.boolean(),
      sources: z.array(
        z.object({
          key: z.string(),
          name: z.string(),
          configured: z.boolean(),
          lastFetchedAt: isoDateTimeSchema.nullable(),
          lastCheckedAt: isoDateTimeSchema.nullable(),
          rowCount: z.number().int().nullable(),
          lastError: z.string().nullable(),
          lastErrorAt: isoDateTimeSchema.nullable(),
          ageHours: z.number().nullable(),
          maxAgeHours: z.number().int(),
          fresh: z.boolean(),
        }),
      ),
    })
    .default({ refreshEnabled: false, sources: [] }),
});
export type ConnectorHealthResponse = z.infer<typeof connectorHealthResponseSchema>;

export const adminUsersQuerySchema = paginationQuerySchema.pick({ limit: true }).extend({
  offset: z.coerce.number({ error: 'That page is not valid.' }).int().min(0, { error: 'That page is not valid.' }).max(100000).default(0),
});
export const adminUsersResponseSchema = z.object({
  users: z.array(
    z.object({
      id: uuidSchema,
      name: z.string().nullable(),
      email: z.string(),
      staffRole: staffRoleSchema.nullable(),
      organisations: z.array(z.object({ id: uuidSchema, name: z.string(), role: z.string(), isDemo: z.boolean() })),
    }),
  ),
  hasMore: z.boolean(),
});
export type AdminUsersResponse = z.infer<typeof adminUsersResponseSchema>;

export const grantStaffBodySchema = z.object({ userId: uuidSchema, role: staffRoleSchema });
export const staffMemberParamsSchema = z.object({ userId: uuidSchema });

export const staffWorkResponseSchema = z.object({
  items: z.array(
    z.object({
      id: uuidSchema,
      kind: z.literal('lookup_request'),
      title: z.string(),
      body: z.string().nullable(),
      read: z.boolean(),
      createdAt: isoDateTimeSchema,
    }),
  ),
});
export const staffWorkParamsSchema = z.object({ workId: uuidSchema });
export const updateStaffWorkBodySchema = z.object({
  status: z.enum(['in_progress', 'completed', 'cancelled'], { error: 'That status does not exist.' }),
  note: z.string().trim().max(1000).optional(),
});
export const updateStaffWorkResponseSchema = z.object({ id: uuidSchema, status: z.string() });

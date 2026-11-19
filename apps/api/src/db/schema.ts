/**
 * Drizzle view of the database, for typed queries only. The SQL files in db/migrations are
 * the source of truth; test/schema-drift.test.ts fails if the two ever disagree.
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

const ts = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });
const id = () => uuid('id').primaryKey().defaultRandom();
const organisationId = () => uuid('organisation_id').notNull();
const timestamps = {
  createdAt: ts('created_at').notNull().defaultNow(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
};

// ---- Reference data ----

export const jurisdiction = pgTable('jurisdiction', {
  id: id(),
  code: text('code').notNull(),
  parentCode: text('parent_code'),
  name: text('name').notNull(),
  ...timestamps,
});

export const rulePack = pgTable('rule_pack', {
  contentHash: text('content_hash'),
  id: id(),
  jurisdictionCode: text('jurisdiction_code').notNull(),
  version: text('version').notNull(),
  status: text('status').notNull().default('draft'),
  approvedBy: text('approved_by'),
  approvedAt: ts('approved_at'),
  ...timestamps,
});

export const rule = pgTable('rule', {
  id: id(),
  rulePackId: uuid('rule_pack_id').notNull(),
  ruleKey: text('rule_key').notNull(),
  layer: smallint('layer').notNull(),
  area: text('area'),
  definition: jsonb('definition').notNull(),
  severity: text('severity').notNull(),
  confidence: text('confidence'),
  effectiveFrom: date('effective_from'),
  effectiveTo: date('effective_to'),
  ...timestamps,
});

export const questionSet = pgTable('question_set', {
  id: id(),
  version: text('version').notNull(),
  status: text('status').notNull().default('draft'),
  ...timestamps,
});

export const question = pgTable('question', {
  id: id(),
  questionSetId: uuid('question_set_id').notNull(),
  key: text('key').notNull(),
  type: text('type').notNull(),
  options: jsonb('options'),
  showIf: jsonb('show_if'),
  ...timestamps,
});

export const vaultSlot = pgTable('vault_slot', {
  id: id(),
  layer: smallint('layer').notNull(),
  key: text('key').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  requiredWhen: jsonb('required_when'),
  ...timestamps,
});

export const plan = pgTable('plan', {
  id: id(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  ...timestamps,
});

// ---- Identity ----

export const organisation = pgTable('organisation', {
  id: id(),
  name: text('name').notNull(),
  type: text('type').notNull().default('company'),
  planId: uuid('plan_id'),
  region: text('region'),
  isDemo: boolean('is_demo').notNull().default(false),
  ...timestamps,
});

export const user = pgTable('user', {
  id: id(),
  email: text('email').notNull(),
  name: text('name'),
  locale: text('locale').notNull().default('en-GB'),
  mfaEnabled: boolean('mfa_enabled').notNull().default(false),
  totpSecretEncrypted: text('totp_secret_encrypted'),
  totpConfirmedAt: ts('totp_confirmed_at'),
  totpLastUsedStep: bigint('totp_last_used_step', { mode: 'number' }),
  lastSignInAt: ts('last_sign_in_at'),
  ...timestamps,
});

export const membership = pgTable('membership', {
  id: id(),
  organisationId: organisationId(),
  userId: uuid('user_id').notNull(),
  role: text('role').notNull(),
  ...timestamps,
});

export const invitation = pgTable('invitation', {
  id: id(),
  organisationId: organisationId(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  tokenHash: text('token_hash').notNull(),
  invitedBy: uuid('invited_by'),
  expiresAt: ts('expires_at').notNull(),
  acceptedAt: ts('accepted_at'),
  acceptedBy: uuid('accepted_by'),
  revokedAt: ts('revoked_at'),
  ...timestamps,
});

export const session = pgTable('session', {
  id: id(),
  userId: uuid('user_id').notNull(),
  tokenHash: text('token_hash').notNull(),
  activeOrganisationId: uuid('active_organisation_id'),
  mfaVerifiedAt: ts('mfa_verified_at'),
  expiresAt: ts('expires_at').notNull(),
  revokedAt: ts('revoked_at'),
  lastSeenAt: ts('last_seen_at').notNull().defaultNow(),
  ip: text('ip'),
  userAgent: text('user_agent'),
  ...timestamps,
});

export const magicLink = pgTable('magic_link', {
  id: id(),
  email: text('email').notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: ts('expires_at').notNull(),
  usedAt: ts('used_at'),
  invitationOrgId: uuid('invitation_org_id'),
  invitationTokenHash: text('invitation_token_hash'),
  ip: text('ip'),
  ...timestamps,
});

// ---- Company ----

export const company = pgTable('company', {
  preIncorporation: boolean('pre_incorporation').notNull().default(false),
  parentCompanyId: uuid('parent_company_id'),
  yearEndMonth: smallint('year_end_month'),
  yearEndDay: smallint('year_end_day'),
  id: id(),
  organisationId: organisationId(),
  legalName: text('legal_name').notNull(),
  registrationNumber: text('registration_number'),
  entityType: text('entity_type'),
  incorporationCountry: text('incorporation_country').notNull(),
  incorporationState: text('incorporation_state').generatedAlwaysAs(
    sql`CASE WHEN incorporation_country LIKE 'US-%' THEN substr(incorporation_country, 4) END`,
  ),
  stage: text('stage'),
  sector: text('sector').array().notNull().default(sql`'{}'`),
  website: text('website'),
  createdBy: uuid('created_by'),
  /** 'own' or 'follow'. See migration 0021. */
  relationship: text('relationship').notNull().default('own'),
  ...timestamps,
});

/** When each person last looked at a company, as scan sequence numbers. See migration 0021. */
export const companyLastSeen = pgTable(
  'company_last_seen',
  {
    organisationId: organisationId(),
    companyId: uuid('company_id').notNull(),
    userId: uuid('user_id').notNull(),
    seenSeq: bigint('seen_seq', { mode: 'number' }),
    previousSeenSeq: bigint('previous_seen_seq', { mode: 'number' }),
    seenAt: ts('seen_at').notNull().defaultNow(),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.companyId, table.userId] })],
);

export const companyMarket = pgTable('company_market', {
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  country: text('country').notNull(),
  kind: text('kind').notNull(),
  ...timestamps,
});

export const answer = pgTable('answer', {
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  questionId: uuid('question_id').notNull(),
  value: jsonb('value').notNull(),
  answeredBy: uuid('answered_by'),
  answeredAt: ts('answered_at').notNull().defaultNow(),
  ...timestamps,
});

// ---- Scans ----

export const scan = pgTable('scan', {
  packsUsed: jsonb('packs_used').notNull().default([]),
  kind: text('kind').notNull().default('full'),
  trigger: text('trigger').notNull().default('user'),
  connectors: text('connectors').array().notNull().default(sql`'{}'`),
  attempts: integer('attempts').notNull().default(0),
  leaseUntil: ts('lease_until'),
  finalisedSeq: bigint('finalised_seq', { mode: 'number' }),
  requestedBy: uuid('requested_by'),
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  type: text('type').notNull().default('self'),
  status: text('status').notNull().default('queued'),
  startedAt: ts('started_at'),
  completedAt: ts('completed_at'),
  rulePackVersions: jsonb('rule_pack_versions').notNull().default({}),
  ...timestamps,
});

export const sourceResult = pgTable('source_result', {
  companyId: uuid('company_id'),
  sourceName: text('source_name'),
  evidenceMethod: text('evidence_method'),
  message: text('message'),
  isFixture: boolean('is_fixture').notNull().default(false),
  candidates: jsonb('candidates').notNull().default([]),
  attempts: integer('attempts').notNull().default(1),
  id: id(),
  organisationId: organisationId(),
  scanId: uuid('scan_id').notNull(),
  connectorId: text('connector_id').notNull(),
  status: text('status').notNull(),
  facts: jsonb('facts').notNull().default([]),
  sourceUrl: text('source_url'),
  retrievedAt: ts('retrieved_at').notNull(),
  rawHash: text('raw_hash'),
  matchConfidence: numeric('match_confidence', { precision: 4, scale: 3 }),
  ...timestamps,
});

export const fact = pgTable('fact', {
  sourceName: text('source_name'),
  evidenceMethod: text('evidence_method'),
  isFixture: boolean('is_fixture').notNull().default(false),
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  origin: text('origin').notNull(),
  originRef: text('origin_ref'),
  source: text('source').notNull(),
  sourceUrl: text('source_url'),
  retrievedAt: ts('retrieved_at').notNull(),
  verificationTier: smallint('verification_tier').notNull(),
  matchConfidence: numeric('match_confidence', { precision: 4, scale: 3 }),
  validFrom: ts('valid_from').notNull().defaultNow(),
  ...timestamps,
});

export const finding = pgTable('finding', {
  companyId: uuid('company_id'),
  scored: boolean('scored').notNull().default(false),
  freePlanEvidence: boolean('free_plan_evidence').notNull().default(false),
  detail: jsonb('detail').notNull().default({}),
  id: id(),
  organisationId: organisationId(),
  scanId: uuid('scan_id').notNull(),
  ruleId: uuid('rule_id'),
  ruleKey: text('rule_key').notNull(),
  rulePackVersion: text('rule_pack_version').notNull(),
  outcome: text('outcome').notNull(),
  layer: smallint('layer').notNull(),
  severity: text('severity').notNull(),
  explanation: text('explanation'),
  whatIsMissing: text('what_is_missing'),
  whyItMatters: text('why_it_matters'),
  ifLeft: text('if_left'),
  fix: text('fix'),
  evidenceRefs: jsonb('evidence_refs').notNull().default([]),
  ...timestamps,
});

export const scoreSnapshot = pgTable('score_snapshot', {
  coverage: jsonb('coverage').notNull().default({ counted: 0, total: 0 }),
  heldByUrgent: boolean('held_by_urgent').notNull().default(false),
  companyId: uuid('company_id'),
  freeRange: jsonb('free_range'),
  id: id(),
  organisationId: organisationId(),
  scanId: uuid('scan_id').notNull(),
  overall: numeric('overall', { precision: 5, scale: 2 }),
  layerScores: jsonb('layer_scores').notNull(),
  methodVersion: text('method_version').notNull(),
  rulePackVersions: jsonb('rule_pack_versions').notNull(),
  ...timestamps,
});

export const actionItem = pgTable('action_item', {
  id: id(),
  organisationId: organisationId(),
  scanId: uuid('scan_id').notNull(),
  findingId: uuid('finding_id').notNull(),
  rank: integer('rank').notNull(),
  title: text('title').notNull(),
  actionType: text('action_type').notNull(),
  priority: numeric('priority', { precision: 8, scale: 3 }),
  points: numeric('points', { precision: 5, scale: 2 }),
  status: text('status').notNull().default('open'),
  ...timestamps,
});

// ---- Vault ----

export const document = pgTable('document', {
  rejectionReason: text('rejection_reason'),
  documentDate: date('document_date'),
  expiresOn: date('expires_on'),
  validated: boolean('validated').notNull().default(false),
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  slotId: uuid('slot_id'),
  storageKey: text('storage_key'),
  externalRef: text('external_ref'),
  source: text('source').notNull(),
  fileName: text('file_name'),
  fileHash: text('file_hash'),
  mime: text('mime'),
  sizeBytes: bigint('size_bytes', { mode: 'number' }),
  pages: integer('pages'),
  classification: text('classification'),
  classificationConfidence: numeric('classification_confidence', { precision: 4, scale: 3 }),
  classificationConfirmedBy: uuid('classification_confirmed_by'),
  classificationConfirmedAt: ts('classification_confirmed_at'),
  extractedFields: jsonb('extracted_fields').notNull().default({}),
  status: text('status').notNull().default('pending'),
  uploadedBy: uuid('uploaded_by'),
  ...timestamps,
});

export const vaultConnection = pgTable('vault_connection', {
  id: id(),
  organisationId: organisationId(),
  provider: text('provider').notNull(),
  encryptedCredentials: text('encrypted_credentials').notNull(),
  scopes: text('scopes').array().notNull().default(sql`'{}'`),
  status: text('status').notNull().default('active'),
  lastSyncedAt: ts('last_synced_at'),
  ...timestamps,
});

// ---- Review ----

/** Unused since 19 Nov 2026: the lawyer service was removed. Kept, not dropped, so no data is lost (migration 0022). */
export const reviewTask = pgTable('review_task', {
  companyId: uuid('company_id'),
  documentId: uuid('document_id'),
  organisationName: text('organisation_name'),
  companyName: text('company_name'),
  country: text('country'),
  documentTitle: text('document_title'),
  slotKey: text('slot_key'),
  ruleKeys: text('rule_keys').array().notNull().default(sql`'{}'`),
  completedAt: ts('completed_at'),
  id: id(),
  organisationId: organisationId(),
  scanId: uuid('scan_id'),
  assignedTo: uuid('assigned_to'),
  status: text('status').notNull().default('open'),
  dueAt: ts('due_at'),
  ...timestamps,
});

/**
 * No new rows since 19 Nov 2026 (the lawyer service was removed). Kept: the engine still reads
 * verdicts written before then (migration 0022).
 */
export const reviewVerdict = pgTable('review_verdict', {
  companyId: uuid('company_id'),
  documentId: uuid('document_id'),
  ruleKey: text('rule_key'),
  overrideOutcome: text('override_outcome'),
  id: id(),
  organisationId: organisationId(),
  reviewTaskId: uuid('review_task_id').notNull(),
  findingId: uuid('finding_id'),
  verdict: text('verdict').notNull(),
  note: text('note'),
  reviewerId: uuid('reviewer_id'),
  ...timestamps,
});

export const verificationBadge = pgTable('verification_badge', {
  revokedAt: ts('revoked_at'),
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  issuedAt: ts('issued_at').notNull(),
  expiresAt: ts('expires_at').notNull(),
  scoreAtIssue: numeric('score_at_issue', { precision: 5, scale: 2 }).notNull(),
  publicToken: text('public_token').notNull(),
  ...timestamps,
});

export const investorScanConsent = pgTable('investor_scan_consent', {
  id: id(),
  organisationId: organisationId(),
  targetCompanyId: uuid('target_company_id').notNull(),
  requesterOrgId: uuid('requester_org_id').notNull(),
  consentStatus: text('consent_status').notNull().default('pending'),
  documentsShared: boolean('documents_shared').notNull().default(false),
  ...timestamps,
});

// ---- Billing ----

export const subscription = pgTable('subscription', {
  id: id(),
  organisationId: organisationId(),
  planId: uuid('plan_id').notNull(),
  provider: text('provider'),
  providerRef: text('provider_ref'),
  status: text('status').notNull(),
  currentPeriodStart: ts('current_period_start'),
  currentPeriodEnd: ts('current_period_end'),
  ...timestamps,
});

export const invoice = pgTable('invoice', {
  id: id(),
  organisationId: organisationId(),
  subscriptionId: uuid('subscription_id'),
  provider: text('provider'),
  providerRef: text('provider_ref'),
  status: text('status').notNull(),
  amountMinor: bigint('amount_minor', { mode: 'number' }),
  currency: text('currency'),
  periodStart: ts('period_start'),
  periodEnd: ts('period_end'),
  ...timestamps,
});

// ---- Orders, bookings, deadlines ----

/** Unused since 19 Nov 2026: the lawyer service was removed. Kept, not dropped, so no data is lost (migration 0022). */
export const documentOrder = pgTable('document_order', {
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  findingId: uuid('finding_id'),
  deliveredDocumentId: uuid('delivered_document_id'),
  requestedBy: uuid('requested_by'),
  documentType: text('document_type').notNull(),
  title: text('title').notNull(),
  status: text('status').notNull().default('draft'),
  priceMinor: bigint('price_minor', { mode: 'number' }),
  currency: text('currency'),
  notes: text('notes'),
  orderedAt: ts('ordered_at'),
  deliveredAt: ts('delivered_at'),
  ...timestamps,
});

/** Unused since 19 Nov 2026: the lawyer service was removed. Kept, not dropped, so no data is lost (migration 0022). */
export const lawyerBooking = pgTable('lawyer_booking', {
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  findingId: uuid('finding_id'),
  requestedBy: uuid('requested_by'),
  lawyerName: text('lawyer_name'),
  topic: text('topic').notNull(),
  scheduledAt: ts('scheduled_at'),
  durationMinutes: integer('duration_minutes'),
  status: text('status').notNull().default('requested'),
  meetingUrl: text('meeting_url'),
  notes: text('notes'),
  ...timestamps,
});

export const deadline = pgTable('deadline', {
  monitoring: text('monitoring'),
  howWeTrack: text('how_we_track'),
  basis: text('basis'),
  needsReview: boolean('needs_review').notNull().default(false),
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  findingId: uuid('finding_id'),
  ruleKey: text('rule_key'),
  title: text('title').notNull(),
  description: text('description'),
  layer: smallint('layer'),
  dueOn: date('due_on').notNull(),
  status: text('status').notNull().default('upcoming'),
  source: text('source'),
  sourceUrl: text('source_url'),
  recurrence: text('recurrence'),
  penaltyNote: text('penalty_note'),
  completedAt: ts('completed_at'),
  ...timestamps,
});

// ---- Notifications and system ----

export const notification = pgTable('notification', {
  dedupeKey: text('dedupe_key'),
  id: id(),
  seq: bigint('seq', { mode: 'number' }).generatedAlwaysAsIdentity(),
  organisationId: organisationId(),
  userId: uuid('user_id').notNull(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  link: text('link'),
  readAt: ts('read_at'),
  ...timestamps,
});

export const auditLog = pgTable('audit_log', {
  id: id(),
  seq: bigint('seq', { mode: 'number' }).generatedAlwaysAsIdentity(),
  organisationId: uuid('organisation_id'),
  actorId: uuid('actor_id'),
  action: text('action').notNull(),
  target: text('target'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const outbox = pgTable('outbox', {
  id: id(),
  organisationId: uuid('organisation_id'),
  toEmail: text('to_email').notNull(),
  template: text('template').notNull(),
  subject: text('subject').notNull(),
  bodyText: text('body_text'),
  status: text('status').notNull(),
  provider: text('provider').notNull(),
  providerId: text('provider_id'),
  sentAt: ts('sent_at'),
  ...timestamps,
});

export const rateLimitBucket = pgTable(
  'rate_limit_bucket',
  {
    key: text('key').notNull(),
    windowStart: ts('window_start').notNull(),
    count: integer('count').notNull(),
    expiresAt: ts('expires_at').notNull(),
  },
  (table) => [primaryKey({ columns: [table.key, table.windowStart] })],
);

export const jobRun = pgTable('job_run', {
  id: id(),
  organisationId: uuid('organisation_id'),
  queue: text('queue').notNull(),
  jobId: text('job_id').notNull(),
  status: text('status').notNull(),
  attempts: integer('attempts').notNull().default(0),
  error: text('error'),
  ...timestamps,
});

export const connectorCache = pgTable('connector_cache', {
  id: id(),
  connectorId: text('connector_id').notNull(),
  requestHash: text('request_hash').notNull(),
  response: jsonb('response').notNull(),
  expiresAt: ts('expires_at').notNull(),
  ...timestamps,
});

export const sharedReport = pgTable('shared_report', {
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  tokenHash: text('token_hash').notNull(),
  summary: jsonb('summary').notNull(),
  createdBy: uuid('created_by'),
  expiresAt: ts('expires_at').notNull(),
  revokedAt: ts('revoked_at'),
  ...timestamps,
});

export const platformStaff = pgTable('platform_staff', {
  userId: uuid('user_id').primaryKey(),
  role: text('role').notNull(),
  grantedBy: uuid('granted_by'),
  ...timestamps,
});

export const staffNotification = pgTable('staff_notification', {
  id: id(),
  tenantId: uuid('tenant_id'),
  kind: text('kind').notNull(),
  refId: uuid('ref_id').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  readAt: ts('read_at'),
  ...timestamps,
});

export const connectorHealth = pgTable('connector_health', {
  connectorId: text('connector_id').primaryKey(),
  lastStatus: text('last_status').notNull(),
  lastCheckedAt: ts('last_checked_at').notNull(),
  lastOkAt: ts('last_ok_at'),
  lastFailureAt: ts('last_failure_at'),
  consecutiveFailures: integer('consecutive_failures').notNull().default(0),
  ...timestamps,
});

export const companySweep = pgTable('company_sweep', {
  companyId: uuid('company_id').primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  nextSourceRetryAt: ts('next_source_retry_at'),
  sourceRetryCount: integer('source_retry_count').notNull().default(0),
  scanInFlightId: uuid('scan_in_flight_id'),
  scanInFlightUntil: ts('scan_in_flight_until'),
  ...timestamps,
});

/** A paid vendor's reference for a company, and its last good answer. See migration 0010. */
export const vendorRecord = pgTable('vendor_record', {
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  connectorId: text('connector_id').notNull(),
  vendorBusinessId: text('vendor_business_id'),
  cachedResult: jsonb('cached_result'),
  cachedAt: ts('cached_at'),
  ...timestamps,
});

/** Stored copies of the public lists (ICO, NDPC, sanctions). See migration 0011. Written only through its functions. */
export const referenceData = pgTable('reference_data', {
  key: text('key').primaryKey(),
  content: text('content'),
  contentHash: text('content_hash'),
  etag: text('etag'),
  lastModified: text('last_modified'),
  fetchedAt: ts('fetched_at'),
  checkedAt: ts('checked_at'),
  rowCount: integer('row_count'),
  lastError: text('last_error'),
  lastErrorAt: ts('last_error_at'),
  ...timestamps,
});

/** What a monitoring re-scan changed. See migration 0012. */
export const monitoringChange = pgTable('monitoring_change', {
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  scanId: uuid('scan_id').notNull(),
  previousScanId: uuid('previous_scan_id'),
  factsChanged: jsonb('facts_changed').notNull().default([]),
  findingsNew: jsonb('findings_new').notNull().default([]),
  findingsResolved: jsonb('findings_resolved').notNull().default([]),
  scoreBefore: numeric('score_before', { precision: 5, scale: 2 }),
  scoreAfter: numeric('score_after', { precision: 5, scale: 2 }),
  deadlinesNew: jsonb('deadlines_new').notNull().default([]),
  notChecked: text('not_checked').array().notNull().default(sql`'{}'`),
  meaningful: text('meaningful').array().notNull().default(sql`'{}'`),
  notified: boolean('notified').notNull().default(false),
  ...timestamps,
});

export const missingDocumentStatement = pgTable('missing_document_statement', {
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  ruleKey: text('rule_key').notNull(),
  statedBy: uuid('stated_by'),
  ...timestamps,
});

/** An organisation's own switches. No row means all off. See migration 0013. */
export const organisationSetting = pgTable('organisation_setting', {
  organisationId: uuid('organisation_id').primaryKey(),
  documentHelperEnabled: boolean('document_helper_enabled').notNull().default(false),
  documentHelperSetBy: uuid('document_helper_set_by'),
  documentHelperSetAt: ts('document_helper_set_at'),
  ...timestamps,
});

export const lookupRequest = pgTable('lookup_request', {
  id: id(),
  organisationId: organisationId(),
  country: text('country').notNull(),
  legalName: text('legal_name').notNull(),
  registrationNumber: text('registration_number'),
  note: text('note'),
  status: text('status').notNull().default('requested'),
  requestedBy: uuid('requested_by'),
  ...timestamps,
});

// ---- GitHub connection (migration 0014). No tokens, keys or file contents are stored. ----

export const githubInstallation = pgTable('github_installation', {
  id: id(),
  organisationId: organisationId(),
  installationId: bigint('installation_id', { mode: 'number' }).notNull(),
  accountLogin: text('account_login').notNull(),
  accountType: text('account_type').notNull(),
  status: text('status').notNull().default('active'),
  lastError: text('last_error'),
  connectedBy: uuid('connected_by'),
  connectedAt: ts('connected_at').notNull().defaultNow(),
  suspendedAt: ts('suspended_at'),
  lastSyncedAt: ts('last_synced_at'),
  ...timestamps,
});

export const githubRepository = pgTable('github_repository', {
  id: id(),
  organisationId: organisationId(),
  installationId: uuid('installation_id').notNull(),
  repoId: bigint('repo_id', { mode: 'number' }).notNull(),
  fullName: text('full_name').notNull(),
  selected: boolean('selected').notNull().default(false),
  companyId: uuid('company_id'),
  defaultBranch: text('default_branch'),
  lastSyncedAt: ts('last_synced_at'),
  lastError: text('last_error'),
  fileState: jsonb('file_state').notNull().default({}),
  ...timestamps,
});

/** Installation number to tenant, ids only, for the webhook. System scope. */
export const githubInstallationIndex = pgTable('github_installation_index', {
  installationId: bigint('installation_id', { mode: 'number' }).primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  ...timestamps,
});

/** Webhook deliveries already handled. System scope. */
export const githubWebhookDelivery = pgTable('github_webhook_delivery', {
  deliveryId: text('delivery_id').primaryKey(),
  event: text('event').notNull(),
  receivedAt: ts('received_at').notNull().defaultNow(),
  ...timestamps,
});

/** Install links already used, so each is single use. System scope. */
export const githubInstallStateUse = pgTable('github_install_state_use', {
  nonce: text('nonce').primaryKey(),
  expiresAt: ts('expires_at').notNull(),
  ...timestamps,
});

// ---- DocuSign and forwarding by email (migration 0016). Tokens only sealed; addresses only hashed. ----

export const docusignConnection = pgTable('docusign_connection', {
  id: id(),
  organisationId: organisationId(),
  accountId: text('account_id').notNull(),
  accountName: text('account_name'),
  baseUri: text('base_uri').notNull(),
  status: text('status').notNull().default('active'),
  /** "v1." + AES-256-GCM. Never selected into a response. */
  sealedTokens: text('sealed_tokens'),
  accessExpiresAt: ts('access_expires_at'),
  scope: text('scope'),
  lastError: text('last_error'),
  connectedBy: uuid('connected_by'),
  connectedAt: ts('connected_at').notNull().defaultNow(),
  lastPulledAt: ts('last_pulled_at'),
  ...timestamps,
});

export const docusignEnvelopePull = pgTable('docusign_envelope_pull', {
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  accountId: text('account_id').notNull(),
  envelopeId: text('envelope_id').notNull(),
  completedAt: ts('completed_at').notNull(),
  signerCount: integer('signer_count').notNull(),
  certificateRetrieved: boolean('certificate_retrieved').notNull().default(false),
  documentsAdded: integer('documents_added').notNull().default(0),
  pulledBy: uuid('pulled_by'),
  pulledAt: ts('pulled_at').notNull().defaultNow(),
  ...timestamps,
});

/** DocuSign sign-in links already used. System scope. */
export const docusignOauthStateUse = pgTable('docusign_oauth_state_use', {
  nonce: text('nonce').primaryKey(),
  expiresAt: ts('expires_at').notNull(),
  ...timestamps,
});

export const inboundEmailAddress = pgTable('inbound_email_address', {
  id: id(),
  organisationId: organisationId(),
  companyId: uuid('company_id').notNull(),
  status: text('status').notNull().default('active'),
  hint: text('hint').notNull(),
  createdBy: uuid('created_by'),
  revokedAt: ts('revoked_at'),
  lastReceivedAt: ts('last_received_at'),
  receivedCount: integer('received_count').notNull().default(0),
  ...timestamps,
});

/** Address hash to tenant, ids only, for the webhook. System scope. */
export const inboundEmailAddressIndex = pgTable('inbound_email_address_index', {
  addressHash: text('address_hash').primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  addressId: uuid('address_id').notNull(),
  ...timestamps,
});

/** Webhook deliveries already handled. System scope. */
export const inboundEmailDelivery = pgTable('inbound_email_delivery', {
  deliveryId: text('delivery_id').primaryKey(),
  receivedAt: ts('received_at').notNull().defaultNow(),
  ...timestamps,
});

/** Google Drive and SharePoint / OneDrive picker connections (migration 0019). Tenant table. */
export const filePickerConnection = pgTable('file_picker_connection', {
  id: id(),
  organisationId: organisationId(),
  provider: text('provider').notNull(),
  /** Google only: the account's domain, never its address. */
  accountDomain: text('account_domain'),
  /** Microsoft only: the tenant id. */
  tenantId: text('tenant_id'),
  status: text('status').notNull().default('active'),
  /** "v1." + AES-256-GCM. Never selected into a response. */
  sealedTokens: text('sealed_tokens'),
  accessExpiresAt: ts('access_expires_at'),
  scope: text('scope'),
  lastError: text('last_error'),
  connectedBy: uuid('connected_by'),
  connectedAt: ts('connected_at').notNull().defaultNow(),
  lastPulledAt: ts('last_pulled_at'),
  ...timestamps,
});

/** Picker sign-in states already used. System scope. */
export const filePickerOauthStateUse = pgTable('file_picker_oauth_state_use', {
  nonce: text('nonce').primaryKey(),
  provider: text('provider').notNull(),
  expiresAt: ts('expires_at').notNull(),
  ...timestamps,
});

// ---- Billing, public links and recovery codes (migration 0022). All system scope, ids only. ----

/** Which Stripe customer is which organisation. The webhook finds the tenant here. */
export const billingAccount = pgTable('billing_account', {
  organisationId: uuid('organisation_id').primaryKey(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status'),
  priceId: text('price_id'),
  currentPeriodEnd: ts('current_period_end'),
  ...timestamps,
});

/** Each Stripe webhook event, once. */
export const stripeEvent = pgTable('stripe_event', {
  eventId: text('event_id').primaryKey(),
  type: text('type').notNull(),
  receivedAt: ts('received_at').notNull().defaultNow(),
  ...timestamps,
});

/** A public share or badge token's hash, to its tenant and row. The token itself carries no id of ours. */
export const publicTokenIndex = pgTable('public_token_index', {
  tokenHash: text('token_hash').primaryKey(),
  kind: text('kind').notNull(),
  tenantId: uuid('tenant_id').notNull(),
  refId: uuid('ref_id').notNull(),
  ...timestamps,
});

/** Two-step sign-in recovery codes, as hashes. Each works once. */
export const mfaRecoveryCode = pgTable('mfa_recovery_code', {
  id: id(),
  userId: uuid('user_id').notNull(),
  codeHash: text('code_hash').notNull(),
  usedAt: ts('used_at'),
  ...timestamps,
});

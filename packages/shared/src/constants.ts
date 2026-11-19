/**
 * Fixed vocabularies shared by the API, the database checks and the web app.
 * The database enforces the same lists with CHECK constraints.
 */

/**
 * @deprecated The first three countries, kept so older screens compile. A company can now be
 * in any country in COUNTRIES (countries.ts); use countryCodeSchema and countryName instead.
 */
export const MVP_COUNTRIES = ['US-DE', 'GB', 'NG'] as const;
/** @deprecated See MVP_COUNTRIES. */
export type MvpCountry = (typeof MVP_COUNTRIES)[number];

/** @deprecated Use countryName(code), which knows every country. */
export const COUNTRY_LABELS: Record<MvpCountry, string> = {
  'US-DE': 'Delaware',
  GB: 'United Kingdom',
  NG: 'Nigeria',
};

/**
 * How an organisation holds a company. `own`: the team runs it and can add evidence. `follow`:
 * a public-data scan of someone else's company, read-only (owner's decision, 19 Nov 2026).
 */
export const COMPANY_RELATIONSHIPS = ['own', 'follow'] as const;
export type CompanyRelationship = (typeof COMPANY_RELATIONSHIPS)[number];

/** What a document slot shows. Kept here so both the vault and the issue detail can use it. */
export const SLOT_STATES = ['missing', 'declared_missing', 'reading', 'needs_confirmation', 'read', 'not_accepted'] as const;
export type SlotState = (typeof SLOT_STATES)[number];

export const MARKET_KINDS = ['operates', 'users', 'investors'] as const;
export type MarketKind = (typeof MARKET_KINDS)[number];

export const COMPANY_STAGES = ['idea', 'pre_seed', 'seed', 'series_a', 'series_b_plus'] as const;
export type CompanyStage = (typeof COMPANY_STAGES)[number];

export const ROLES = ['owner', 'admin', 'member', 'lawyer'] as const;
export type Role = (typeof ROLES)[number];

export const ORGANISATION_TYPES = ['company', 'investor', 'individual'] as const;
export type OrganisationType = (typeof ORGANISATION_TYPES)[number];

/** 'lawyer' is now only the code for look-up updates (kept so filters still work); no notification's words say lawyer. */
export const NOTIFICATION_KINDS = ['deadline', 'lawyer', 'score', 'team', 'system'] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

/** Every machine-readable error code the API can return. */
export const ERROR_CODES = [
  'already_member',
  'already_decided',
  'company_exists',
  'confirmation_mismatch',
  'file_type_not_allowed',
  'file_unsafe',
  'follow_limit_reached',
  'follows_only',
  'forbidden',
  'internal_error',
  'invalid_input',
  'invalid_json',
  'invalid_state',
  'invitation_exists',
  'invitation_invalid',
  'invitation_wrong_email',
  'last_owner',
  'magic_link_invalid',
  'method_not_allowed',
  'mfa_already_enabled',
  'mfa_not_enabled',
  'mfa_not_started',
  'mfa_required',
  'no_organisation',
  'not_eligible',
  'not_a_member',
  'not_found',
  'origin_not_allowed',
  'ownership_transfer_required',
  'payload_too_large',
  'payments_off',
  'plan_upgrade_required',
  'rate_limited',
  'review_quota_used',
  'totp_invalid',
  'unauthenticated',
  'unsupported_media_type',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './common';

/**
 * Google Drive and SharePoint / OneDrive, both picker-based: the person chooses files in the
 * provider's own picker and only those files are read. Each becomes an unconfirmed vault
 * document for a person to confirm. Nothing they bring in ever says a document is genuine,
 * validly signed or legally sufficient, and nothing earns a verified badge.
 */
export const FILE_PICKER_EVIDENCE_NOTICE =
  'We read only the files you pick, and each one waits for you to confirm it, exactly like a file you upload. Bringing a file in from Google Drive or SharePoint is not a check that it is genuine, signed or legally sufficient, and it is never a verified result.';

export const FILE_PICKER_PROVIDERS = ['google_drive', 'sharepoint'] as const;
export type FilePickerProvider = (typeof FILE_PICKER_PROVIDERS)[number];

export const FILE_PICKER_CONNECTION_STATUSES = ['not_available', 'not_connected', 'active', 'revoked'] as const;

export const filePickerConnectionSchema = z.object({
  provider: z.enum(FILE_PICKER_PROVIDERS),
  status: z.enum(FILE_PICKER_CONNECTION_STATUSES),
  message: z.string(),
  /** Google Drive only: the account's domain, never its address. */
  accountDomain: z.string().nullable(),
  /** SharePoint / OneDrive only: the Microsoft tenant id. */
  tenantId: z.string().nullable(),
  connectedAt: isoDateTimeSchema.nullable(),
  lastPulledAt: isoDateTimeSchema.nullable(),
  lastError: z.string().nullable(),
  maxFilesPerPull: z.number().int(),
  notice: z.string(),
});
export type FilePickerConnection = z.infer<typeof filePickerConnectionSchema>;

export const filePickerStartResponseSchema = z.object({
  status: z.enum(['ready', 'not_available']),
  message: z.string(),
  /** The provider's own sign-in page. Null when the feature is off. */
  authorizeUrl: z.string().nullable(),
  expiresAt: isoDateTimeSchema.nullable(),
});
export type FilePickerStartResponse = z.infer<typeof filePickerStartResponseSchema>;

export const filePickerCallbackQuerySchema = z.object({
  code: z.string().min(1).max(4000).optional(),
  state: z.string().min(20).max(1000),
  /** Sent instead of a code when the person said no. */
  error: z.string().max(100).optional(),
});

/**
 * What the Google Picker needs in the browser, and nothing more: a short-lived access token
 * limited to drive.file, the browser API key, the Cloud project number (the Picker's app id)
 * and the OAuth client id. Never the refresh token or the client secret.
 */
export const googleDrivePickerTokenResponseSchema = z.object({
  accessToken: z.string(),
  expiresAt: isoDateTimeSchema,
  scope: z.string(),
  developerKey: z.string(),
  appId: z.string(),
  clientId: z.string(),
});
export type GoogleDrivePickerTokenResponse = z.infer<typeof googleDrivePickerTokenResponseSchema>;

/** Google Drive file ids: letters, digits, "-" and "_". */
export const googleDriveFileIdSchema = z.string().regex(/^[A-Za-z0-9_-]{10,200}$/, { error: 'That is not a Google Drive file id.' });

export const googleDriveFilesBodySchema = z.object({
  companyId: uuidSchema,
  /** The ids the Google Picker returned for the files the person picked. */
  fileIds: z.array(googleDriveFileIdSchema).min(1, { error: 'Pick at least one file.' }).max(100, { error: 'That is too many files.' }),
});
export type GoogleDriveFilesBody = z.infer<typeof googleDriveFilesBodySchema>;

/** Drive and item ids from the Microsoft file picker (parentReference.driveId and id). */
const microsoftIdSchema = z.string().regex(/^[A-Za-z0-9!_.-]{1,200}$/, { error: 'That is not a SharePoint or OneDrive id.' });

export const sharepointFilesBodySchema = z.object({
  companyId: uuidSchema,
  items: z
    .array(z.object({ driveId: microsoftIdSchema, itemId: microsoftIdSchema }))
    .min(1, { error: 'Pick at least one file.' })
    .max(100, { error: 'That is too many files.' }),
});
export type SharepointFilesBody = z.infer<typeof sharepointFilesBodySchema>;

export const filePickerFilesResponseSchema = z.object({ queued: z.boolean(), message: z.string() });
export type FilePickerFilesResponse = z.infer<typeof filePickerFilesResponseSchema>;

/** Where a vault document from Google Drive came from. Never the account's email. */
export const googleDriveDocumentOriginSchema = z.object({
  kind: z.literal('google_drive'),
  fileId: z.string(),
  /** When Google Drive says the file was last changed. */
  modifiedTime: isoDateTimeSchema.nullable(),
  /** The Google account's domain, never its address. */
  accountDomain: z.string().nullable(),
  /** True when it was a Google Doc, Sheet or Slides file that Google turned into a PDF for us. */
  exportedToPdf: z.boolean(),
  fetchedAt: isoDateTimeSchema,
  statement: z.string(),
});

/** Where a vault document from SharePoint or OneDrive came from. Never the person's email. */
export const sharepointDocumentOriginSchema = z.object({
  kind: z.literal('sharepoint'),
  driveId: z.string(),
  itemId: z.string(),
  modifiedTime: isoDateTimeSchema.nullable(),
  tenantId: z.string().nullable(),
  fetchedAt: isoDateTimeSchema,
  statement: z.string(),
});

import { z } from 'zod';
import { RedactedSecret } from '../docusign/config';

const emptyToUndefined = (value: unknown): unknown => (value === '' ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const positiveInt = (fallback: number) => z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(fallback));

const envSchema = z.object({
  /** The OAuth client id of a "Web application" client in the Client's Google Cloud project. */
  GOOGLE_DRIVE_CLIENT_ID: z.preprocess(
    emptyToUndefined,
    z.string().regex(/^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/, { error: 'GOOGLE_DRIVE_CLIENT_ID must be the client id Google shows (ending .apps.googleusercontent.com)' }).optional(),
  ),
  /** That client's secret. Never logged. */
  GOOGLE_DRIVE_CLIENT_SECRET: optionalString,
  /**
   * The browser API key the Google Picker needs (setDeveloperKey). Google treats it as public;
   * restrict it to the web app's address and to the Picker API in the Cloud console.
   */
  GOOGLE_PICKER_API_KEY: optionalString,
  /** The Cloud project number (digits), the Picker's app id. Required for drive.file. */
  GOOGLE_CLOUD_PROJECT_NUMBER: z.preprocess(emptyToUndefined, z.string().regex(/^[0-9]{6,20}$/, { error: 'GOOGLE_CLOUD_PROJECT_NUMBER must be the project number (digits), not the project id' }).optional()),
  /** The most files brought in by one pick. */
  GOOGLE_DRIVE_MAX_FILES_PER_PULL: positiveInt(10),
  /** The most files one organisation can bring in per day. */
  GOOGLE_DRIVE_MAX_FILES_PER_ORG_PER_DAY: positiveInt(50),
});

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: RedactedSecret;
  pickerApiKey: string;
  projectNumber: string;
  /** Must be registered on the OAuth client exactly as written. */
  redirectUri: string;
  maxFilesPerPull: number;
  maxFilesPerOrgPerDay: number;
}

/** The fixed address Google sends people back to. Register it on the OAuth client. */
export const GOOGLE_DRIVE_REDIRECT_PATH = '/v1/connections/google-drive/callback';

const NAMES = ['GOOGLE_DRIVE_CLIENT_ID', 'GOOGLE_DRIVE_CLIENT_SECRET', 'GOOGLE_PICKER_API_KEY', 'GOOGLE_CLOUD_PROJECT_NUMBER'] as const;

/**
 * Google Drive, only when the client id, its secret, the Picker's browser key and the project
 * number are all set. None set means the connection is off, not an error. Some but not all
 * stops start-up, with a message that never contains a value.
 */
export function resolveGoogleDrive(source: NodeJS.ProcessEnv, apiBaseUrl: string): GoogleDriveConfig | undefined {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid configuration. ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
  }
  const env = parsed.data;
  const set = NAMES.filter((name) => env[name] !== undefined);
  if (set.length === 0) return undefined;
  if (set.length !== NAMES.length) throw new Error(`Set all of ${NAMES.join(', ')}, or none.`);
  return {
    clientId: env.GOOGLE_DRIVE_CLIENT_ID as string,
    clientSecret: new RedactedSecret(env.GOOGLE_DRIVE_CLIENT_SECRET as string),
    pickerApiKey: env.GOOGLE_PICKER_API_KEY as string,
    projectNumber: env.GOOGLE_CLOUD_PROJECT_NUMBER as string,
    redirectUri: `${apiBaseUrl.replace(/\/+$/, '')}${GOOGLE_DRIVE_REDIRECT_PATH}`,
    maxFilesPerPull: env.GOOGLE_DRIVE_MAX_FILES_PER_PULL,
    maxFilesPerOrgPerDay: env.GOOGLE_DRIVE_MAX_FILES_PER_ORG_PER_DAY,
  };
}

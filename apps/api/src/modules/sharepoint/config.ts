import { z } from 'zod';
import { RedactedSecret } from '../docusign/config';

const emptyToUndefined = (value: unknown): unknown => (value === '' ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const positiveInt = (fallback: number) => z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(fallback));
const GUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * The Graph file permission. Files.Read (the default) reads the signed-in person's own files,
 * which covers OneDrive for work or school and personal OneDrive. Files.Read.All also reaches
 * files in SharePoint sites and files shared with the person. Microsoft lists neither as needing
 * admin consent, but a tenant can turn user consent off, and then an admin must consent.
 */
export const MICROSOFT_FILE_SCOPES = ['Files.Read', 'Files.Read.All'] as const;

const envSchema = z.object({
  /** The Application (client) id of the Entra app registration. */
  MICROSOFT_CLIENT_ID: z.preprocess(emptyToUndefined, z.string().regex(GUID, { error: 'MICROSOFT_CLIENT_ID must be the Application (client) ID Entra shows (a GUID)' }).optional()),
  /** A client secret of that registration. Never logged. */
  MICROSOFT_CLIENT_SECRET: optionalString,
  /** organisations (work or school only, the default), common (work, school and personal), consumers (personal only) or one tenant id. */
  MICROSOFT_TENANT: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .refine((value) => ['organizations', 'common', 'consumers'].includes(value) || GUID.test(value), { error: 'MICROSOFT_TENANT must be organizations, common, consumers or a tenant id (GUID)' })
      .default('organizations'),
  ),
  MICROSOFT_FILES_SCOPE: z.preprocess(emptyToUndefined, z.enum(MICROSOFT_FILE_SCOPES).default('Files.Read')),
  /** The most files brought in by one pick. */
  SHAREPOINT_MAX_FILES_PER_PULL: positiveInt(10),
  /** The most files one organisation can bring in per day. */
  SHAREPOINT_MAX_FILES_PER_ORG_PER_DAY: positiveInt(50),
});

export interface SharepointConfig {
  clientId: string;
  clientSecret: RedactedSecret;
  tenant: string;
  filesScope: (typeof MICROSOFT_FILE_SCOPES)[number];
  /** Must be registered on the app registration (platform "Web") exactly as written. */
  redirectUri: string;
  maxFilesPerPull: number;
  maxFilesPerOrgPerDay: number;
}

/** The fixed address Microsoft sends people back to. Register it on the app registration. */
export const SHAREPOINT_REDIRECT_PATH = '/v1/connections/sharepoint/callback';

/**
 * SharePoint / OneDrive, only when the client id and its secret are both set. Neither set means
 * the connection is off, not an error. One without the other stops start-up.
 */
export function resolveSharepoint(source: NodeJS.ProcessEnv, apiBaseUrl: string): SharepointConfig | undefined {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid configuration. ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
  }
  const env = parsed.data;
  if (!env.MICROSOFT_CLIENT_ID && !env.MICROSOFT_CLIENT_SECRET) return undefined;
  if (!env.MICROSOFT_CLIENT_ID || !env.MICROSOFT_CLIENT_SECRET) throw new Error('Set both MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET, or neither.');
  return {
    clientId: env.MICROSOFT_CLIENT_ID,
    clientSecret: new RedactedSecret(env.MICROSOFT_CLIENT_SECRET),
    tenant: env.MICROSOFT_TENANT,
    filesScope: env.MICROSOFT_FILES_SCOPE,
    redirectUri: `${apiBaseUrl.replace(/\/+$/, '')}${SHAREPOINT_REDIRECT_PATH}`,
    maxFilesPerPull: env.SHAREPOINT_MAX_FILES_PER_PULL,
    maxFilesPerOrgPerDay: env.SHAREPOINT_MAX_FILES_PER_ORG_PER_DAY,
  };
}

import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './common';

/** Shown wherever GitHub evidence appears. GitHub evidence never earns a verified badge. */
export const GITHUB_EVIDENCE_NOTICE =
  'What we read from GitHub is evidence for a person to confirm. It is not a legal check and it is never a verified result.';

export const GITHUB_CONNECTION_STATUSES = ['not_connected', 'active', 'suspended', 'revoked'] as const;
export type GithubConnectionStatus = (typeof GITHUB_CONNECTION_STATUSES)[number];

/** not_included: the customer hasn't chosen it. not_checked_yet: chosen, not read yet. problem: the last read failed. */
export const GITHUB_REPOSITORY_STATES = ['not_included', 'not_checked_yet', 'checked', 'problem'] as const;
export type GithubRepositoryState = (typeof GITHUB_REPOSITORY_STATES)[number];

export const organisationIdParamsSchema = z.object({ id: uuidSchema });

export const githubStartResponseSchema = z.object({
  status: z.enum(['ready', 'not_connected']),
  message: z.string(),
  /** GitHub's own install page, where the customer picks repositories. Null when the feature is off. */
  installUrl: z.string().nullable(),
  expiresAt: isoDateTimeSchema.nullable(),
});
export type GithubStartResponse = z.infer<typeof githubStartResponseSchema>;

export const githubCallbackQuerySchema = z.object({
  installation_id: z.string().regex(/^\d{1,12}$/, { error: 'That GitHub installation number is not valid.' }),
  state: z.string().min(20).max(1000),
  setup_action: z.string().max(20).optional(),
});

export const githubRepositorySchema = z.object({
  repositoryId: z.number().int().positive(),
  fullName: z.string(),
  selected: z.boolean(),
  companyId: uuidSchema.nullable(),
  defaultBranch: z.string().nullable(),
  lastSyncedAt: isoDateTimeSchema.nullable(),
  lastError: z.string().nullable(),
  state: z.enum(GITHUB_REPOSITORY_STATES),
  stateWord: z.string(),
});
export type GithubRepository = z.infer<typeof githubRepositorySchema>;

export const githubConnectionSchema = z.object({
  status: z.enum(GITHUB_CONNECTION_STATUSES),
  message: z.string(),
  account: z.object({ login: z.string(), type: z.string() }).nullable(),
  connectedAt: isoDateTimeSchema.nullable(),
  lastSyncedAt: isoDateTimeSchema.nullable(),
  lastError: z.string().nullable(),
  repositories: z.array(githubRepositorySchema),
  maxRepositories: z.number().int(),
  notice: z.string(),
});
export type GithubConnection = z.infer<typeof githubConnectionSchema>;

export const githubSelectRepositoriesBodySchema = z.object({
  /** The repositories to include, each with the company it is evidence for. Anything not listed is left out. */
  repositories: z
    .array(z.object({ repositoryId: z.number().int().positive(), companyId: uuidSchema }))
    .max(500, { error: 'That is too many repositories.' }),
});
export type GithubSelectRepositoriesBody = z.infer<typeof githubSelectRepositoriesBodySchema>;

export const githubSyncResponseSchema = z.object({ queued: z.boolean(), message: z.string() });
export type GithubSyncResponse = z.infer<typeof githubSyncResponseSchema>;

/** Where a vault document read from GitHub came from. */
export const githubDocumentOriginSchema = z.object({
  repository: z.string(),
  path: z.string(),
  commitSha: z.string().nullable(),
  fetchedAt: isoDateTimeSchema,
});
export type GithubDocumentOrigin = z.infer<typeof githubDocumentOriginSchema>;

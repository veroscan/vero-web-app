import type { ConnectedDocumentOrigin, FilePickerConnection, FilePickerStartResponse, GoogleDriveFilesBody, GoogleDrivePickerTokenResponse } from '@vero/shared';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import type { RequestMeta } from '../../http/route';
import { writeAudit } from '../audit/service';
import { PickerError } from '../file-pickers/client-base';
import { claimedKind, limitFor, pickedFileName, TYPE_REFUSED, type PickedKind } from '../file-pickers/files';
import {
  deletePickerConnection,
  getPickerAccess,
  loadPickerConnection,
  pickerProblem,
  pickerView,
  queuePickerPull,
  runPickerPull,
  savePickerGrant,
  storedRefreshToken,
  type PickerAdapter,
  type PickerPullRun,
  type PlannedFile,
} from '../file-pickers/service';
import { consumePickerState, signPickerState } from '../file-pickers/state';
import { GOOGLE_DRIVE_SCOPE, GOOGLE_EXPORTABLE, GOOGLE_EXPORT_LIMIT_BYTES, GoogleDriveClient } from './client';
import type { GoogleDriveConfig } from './config';

export const GOOGLE_DRIVE_NAME = 'Google Drive';
export const GOOGLE_DRIVE_NOT_AVAILABLE = "Google Drive isn't connected yet. You can upload the file from your computer for now.";
export const GOOGLE_DRIVE_ACCESS_ENDED = 'Google Drive access ended, connect again.';
const DISCONNECTED = 'Disconnected. We asked Google to remove Vero\'s access and deleted our copy of it. You can check under Third-party apps and services in your Google Account.';
const DISCONNECTED_REVOKE_FAILED =
  "Disconnected, and we deleted our copy of the access. Google didn't confirm it removed Vero's access, so please remove Vero under Third-party apps and services in your Google Account.";
/** Google access tokens last about an hour. Refresh with ten minutes to spare, so a picker token is always good for a while. */
const REFRESH_MARGIN_MS = 10 * 60 * 1000;

export interface GoogleDriveParts {
  config: GoogleDriveConfig;
  client: GoogleDriveClient;
  adapter: PickerAdapter;
}

/** The settings, a client and the shared picker adapter; null while Google Drive is off. */
export function googleDriveParts(deps: AppDeps): GoogleDriveParts | null {
  const config = deps.config.googleDrive;
  if (!config) return null;
  const client = new GoogleDriveClient(config, { ...(deps.googleDriveFetch ? { fetch: deps.googleDriveFetch } : {}), timeoutMs: deps.config.connectorTimeoutMs });
  const adapter: PickerAdapter = {
    provider: 'google_drive',
    name: GOOGLE_DRIVE_NAME,
    auditPrefix: 'google_drive',
    notAvailable: GOOGLE_DRIVE_NOT_AVAILABLE,
    accessEnded: GOOGLE_DRIVE_ACCESS_ENDED,
    maxFilesPerPull: config.maxFilesPerPull,
    maxFilesPerOrgPerDay: config.maxFilesPerOrgPerDay,
    refreshMarginMs: REFRESH_MARGIN_MS,
    refresh: (refreshToken) => client.refresh(refreshToken),
  };
  return { config, client, adapter };
}

export async function googleDriveStatus(deps: AppDeps, organisationId: string, message?: string): Promise<FilePickerConnection> {
  const parts = googleDriveParts(deps);
  return deps.db.withOrg(organisationId, async (tx) => pickerView(parts?.adapter ?? null, 'google_drive', GOOGLE_DRIVE_NOT_AVAILABLE, parts ? await loadPickerConnection(tx, 'google_drive') : undefined, message));
}

/** Google's own sign-in page, carrying a signed state and a PKCE challenge for this organisation and this person. */
export function startGoogleDrive(deps: AppDeps, binding: { organisationId: string; userId: string }): FilePickerStartResponse {
  const parts = googleDriveParts(deps);
  if (!parts) return { status: 'not_available', message: GOOGLE_DRIVE_NOT_AVAILABLE, authorizeUrl: null, expiresAt: null };
  const { state, expiresAt, codeChallenge } = signPickerState(deps, 'google_drive', binding);
  return {
    status: 'ready',
    message: "Sign in on Google's page and allow Vero to open the files you pick. Nothing is brought in until you pick files.",
    authorizeUrl: parts.client.authorizeUrl(state, codeChallenge),
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * Google's callback. The state is checked and used up first, then the code is exchanged (with
 * the PKCE verifier), the granted scope is checked to be drive.file, and the account's domain is
 * read. The tokens are sealed before they touch the database.
 */
export async function completeGoogleDrive(
  deps: AppDeps,
  input: { organisationId: string; userId: string; code: string | undefined; state: string; error: string | undefined; meta: RequestMeta },
): Promise<FilePickerConnection> {
  const parts = googleDriveParts(deps);
  if (!parts) throw errors.invalidState(GOOGLE_DRIVE_NOT_AVAILABLE);
  const { codeVerifier } = await consumePickerState(deps, 'google_drive', GOOGLE_DRIVE_NAME, input.state, input);
  if (input.error || !input.code) throw errors.invalidInput('Google sign-in was not completed, so nothing was connected. Start connecting Google Drive again.');
  try {
    const grant = await parts.client.exchangeCode(input.code, codeVerifier);
    const scopes = (grant.scope ?? '').split(/\s+/);
    if (!scopes.includes(GOOGLE_DRIVE_SCOPE)) {
      // The person unticked the one permission we asked for. Hand the grant back.
      await parts.client.revoke(grant.refreshToken ?? grant.accessToken);
      throw errors.invalidInput("You didn't allow Vero to open the files you pick, so nothing was connected. Start connecting Google Drive again and leave that box ticked.");
    }
    if (!grant.refreshToken) throw errors.invalidState("Google didn't give us lasting access. Start connecting Google Drive again.");
    const accountDomain = await parts.client.accountDomain(grant.accessToken);
    await savePickerGrant(deps, parts.adapter, { organisationId: input.organisationId, userId: input.userId, meta: input.meta, grant: { ...grant, refreshToken: grant.refreshToken, scope: GOOGLE_DRIVE_SCOPE }, accountDomain, tenantId: null });
  } catch (error) {
    if (error instanceof PickerError && (error.kind === 'invalid_grant' || error.kind === 'rejected')) {
      throw errors.invalidInput("Google didn't accept that sign-in. Start connecting Google Drive again.");
    }
    throw pickerProblem(parts.adapter, error);
  }
  return googleDriveStatus(deps, input.organisationId);
}

/**
 * What the Google Picker needs in the browser: a short-lived access token (drive.file, so it
 * can only reach files the person picks or has picked before), the browser API key, the project
 * number and the client id. Never the refresh token or the client secret.
 */
export async function googleDrivePickerToken(deps: AppDeps, input: { organisationId: string; userId: string; meta: RequestMeta }): Promise<GoogleDrivePickerTokenResponse> {
  const parts = googleDriveParts(deps);
  if (!parts) throw errors.invalidState(GOOGLE_DRIVE_NOT_AVAILABLE);
  let access;
  try {
    access = await getPickerAccess(deps, parts.adapter, input.organisationId, false);
  } catch (error) {
    throw pickerProblem(parts.adapter, error);
  }
  await deps.db.withOrg(input.organisationId, (tx) =>
    writeAudit(tx, { organisationId: input.organisationId, actorId: input.userId, action: 'google_drive.picker_opened', target: access.connection.id, meta: input.meta }),
  );
  return {
    accessToken: access.accessToken,
    expiresAt: (access.connection.accessExpiresAt ?? new Date(deps.now().getTime() + REFRESH_MARGIN_MS)).toISOString(),
    scope: GOOGLE_DRIVE_SCOPE,
    developerKey: parts.config.pickerApiKey,
    appId: parts.config.projectNumber,
    clientId: parts.config.clientId,
  };
}

/** Queues bringing in the files picked, and only those. */
export async function queueGoogleDriveFiles(deps: AppDeps, input: { organisationId: string; userId: string; body: GoogleDriveFilesBody; meta: RequestMeta }): Promise<{ queued: boolean; message: string }> {
  const parts = googleDriveParts(deps);
  if (!parts) throw errors.invalidState(GOOGLE_DRIVE_NOT_AVAILABLE);
  const fileIds = [...new Set(input.body.fileIds)];
  const { organisationId, userId } = input;
  const companyId = input.body.companyId;
  return queuePickerPull(deps, parts.adapter, {
    organisationId,
    userId,
    companyId,
    items: fileIds,
    meta: input.meta,
    enqueue: (items) => deps.queue.enqueue('google-drive.pull', { organisationId, companyId, fileIds: items, requestedBy: userId }),
  });
}

export function googleDriveStatement(modifiedTime: string | null, exported: boolean): string {
  const changed = modifiedTime ? ` Google Drive says it was last changed on ${modifiedTime.slice(0, 10)}.` : '';
  const how = exported ? ' Google turned it into a PDF for us.' : '';
  return `You picked this file in Google Drive.${changed}${how} That is not a check that it is genuine, signed or legally sufficient.`;
}

/** The google-drive.pull job: only the picked ids, each one's metadata and then its content or PDF export. */
export async function runGoogleDrivePull(
  deps: AppDeps,
  payload: { organisationId: string; companyId: string; fileIds: string[]; requestedBy: string | null },
): Promise<PickerPullRun | null> {
  const parts = googleDriveParts(deps);
  if (!parts) return null;
  const { client } = parts;
  const maxBytes = deps.config.maxUploadBytes;
  return runPickerPull(deps, parts.adapter, { ...payload, items: payload.fileIds }, async (access, fileId): Promise<PlannedFile> => {
    const meta = await client.fileMetadata(access.accessToken, fileId);
    if (meta.trashed) throw new PickerError('not_found', "That file is in Google Drive's bin.");
    const exported = meta.mimeType !== null && GOOGLE_EXPORTABLE.has(meta.mimeType);
    const kind: PickedKind | null = exported ? 'pdf' : claimedKind(meta.mimeType, meta.name);
    if (!kind) throw new PickerError('not_allowed', TYPE_REFUSED);
    const limit = exported ? Math.min(maxBytes, GOOGLE_EXPORT_LIMIT_BYTES) : limitFor(kind, maxBytes);
    if (!exported && meta.size !== null && meta.size > limit) throw new PickerError('too_large', 'That file from Google Drive is larger than we can take.');
    const fetchedAt = deps.now().toISOString();
    const origin: ConnectedDocumentOrigin = {
      kind: 'google_drive',
      fileId,
      modifiedTime: meta.modifiedTime,
      accountDomain: access.connection.accountDomain,
      exportedToPdf: exported,
      fetchedAt,
      statement: googleDriveStatement(meta.modifiedTime, exported),
    };
    return {
      externalRef: `google_drive:${fileId}:${meta.modifiedTime ?? 'unknown'}`,
      kind,
      fileName: pickedFileName(meta.name, kind, `google-drive-${fileId.slice(0, 8)}`),
      origin,
      download: (fresh) => (exported ? client.exportPdf(fresh.accessToken, fileId, limit) : client.download(fresh.accessToken, fileId, limit)),
    };
  });
}

/**
 * Asks Google to revoke the grant (Google documents a revoke endpoint), then deletes our row and
 * the sealed tokens. If Google doesn't confirm, the person is told where to remove Vero.
 * Documents already in the vault stay until someone deletes them.
 */
export async function disconnectGoogleDrive(deps: AppDeps, input: { organisationId: string; userId: string; meta: RequestMeta }): Promise<FilePickerConnection> {
  const parts = googleDriveParts(deps);
  const refreshToken = parts ? await storedRefreshToken(deps, 'google_drive', input.organisationId) : null;
  const revoked = parts && refreshToken ? await parts.client.revoke(refreshToken) : null;
  const deleted = await deletePickerConnection(deps, { provider: 'google_drive', auditPrefix: 'google_drive' }, { ...input, revokedAtProvider: revoked });
  if (!deleted) return googleDriveStatus(deps, input.organisationId);
  return googleDriveStatus(deps, input.organisationId, revoked ? DISCONNECTED : DISCONNECTED_REVOKE_FAILED);
}

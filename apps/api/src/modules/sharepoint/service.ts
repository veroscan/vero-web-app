import type { ConnectedDocumentOrigin, FilePickerConnection, FilePickerStartResponse, SharepointFilesBody } from '@vero/shared';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import type { RequestMeta } from '../../http/route';
import { PickerError } from '../file-pickers/client-base';
import { claimedKind, limitFor, pickedFileName, TYPE_REFUSED } from '../file-pickers/files';
import {
  deletePickerConnection,
  loadPickerConnection,
  pickerProblem,
  pickerView,
  queuePickerPull,
  runPickerPull,
  savePickerGrant,
  type PickerAdapter,
  type PickerPullRun,
  type PlannedFile,
} from '../file-pickers/service';
import { consumePickerState, signPickerState } from '../file-pickers/state';
import { MicrosoftGraphClient, tenantFromIdToken } from './client';
import type { SharepointConfig } from './config';

export const SHAREPOINT_NAME = 'SharePoint';
export const SHAREPOINT_NOT_AVAILABLE = "SharePoint and OneDrive aren't connected yet. You can upload the file from your computer for now.";
export const SHAREPOINT_ACCESS_ENDED = 'SharePoint access ended, connect again.';
/** Microsoft documents no call that withdraws one person's consent to an app, so the person is told where to do it. */
const DISCONNECTED =
  "Disconnected, and we deleted the access Microsoft gave us. Microsoft doesn't let us withdraw that access from our side: to remove Vero from your account too, open My Apps (myapps.microsoft.com) for a work or school account, or your Microsoft account's privacy settings for a personal one, and remove Vero there. Your IT admin can also remove it for everyone in Microsoft Entra.";
/** Microsoft access tokens last about an hour. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

export interface SharepointParts {
  config: SharepointConfig;
  client: MicrosoftGraphClient;
  adapter: PickerAdapter;
}

/** The settings, a client and the shared picker adapter; null while SharePoint is off. */
export function sharepointParts(deps: AppDeps): SharepointParts | null {
  const config = deps.config.sharepoint;
  if (!config) return null;
  const client = new MicrosoftGraphClient(config, { ...(deps.microsoftFetch ? { fetch: deps.microsoftFetch } : {}), timeoutMs: deps.config.connectorTimeoutMs });
  const adapter: PickerAdapter = {
    provider: 'sharepoint',
    name: SHAREPOINT_NAME,
    auditPrefix: 'sharepoint',
    notAvailable: SHAREPOINT_NOT_AVAILABLE,
    accessEnded: SHAREPOINT_ACCESS_ENDED,
    maxFilesPerPull: config.maxFilesPerPull,
    maxFilesPerOrgPerDay: config.maxFilesPerOrgPerDay,
    refreshMarginMs: REFRESH_MARGIN_MS,
    refresh: (refreshToken) => client.refresh(refreshToken),
  };
  return { config, client, adapter };
}

export async function sharepointStatus(deps: AppDeps, organisationId: string, message?: string): Promise<FilePickerConnection> {
  const parts = sharepointParts(deps);
  return deps.db.withOrg(organisationId, async (tx) => pickerView(parts?.adapter ?? null, 'sharepoint', SHAREPOINT_NOT_AVAILABLE, parts ? await loadPickerConnection(tx, 'sharepoint') : undefined, message));
}

export function startSharepoint(deps: AppDeps, binding: { organisationId: string; userId: string }): FilePickerStartResponse {
  const parts = sharepointParts(deps);
  if (!parts) return { status: 'not_available', message: SHAREPOINT_NOT_AVAILABLE, authorizeUrl: null, expiresAt: null };
  const { state, expiresAt, codeChallenge } = signPickerState(deps, 'sharepoint', binding);
  return {
    status: 'ready',
    message: "Sign in on Microsoft's page and allow Vero. Nothing is brought in until you pick files.",
    authorizeUrl: parts.client.authorizeUrl(state, codeChallenge),
    expiresAt: expiresAt.toISOString(),
  };
}

/** Microsoft's callback: the state first, then the code with the PKCE verifier; tokens sealed before they are stored. */
export async function completeSharepoint(
  deps: AppDeps,
  input: { organisationId: string; userId: string; code: string | undefined; state: string; error: string | undefined; meta: RequestMeta },
): Promise<FilePickerConnection> {
  const parts = sharepointParts(deps);
  if (!parts) throw errors.invalidState(SHAREPOINT_NOT_AVAILABLE);
  const { codeVerifier } = await consumePickerState(deps, 'sharepoint', SHAREPOINT_NAME, input.state, input);
  if (input.error || !input.code) {
    throw errors.invalidInput(
      'Microsoft sign-in was not completed, so nothing was connected. If your organisation needs an admin to approve new apps, ask your IT admin, then start connecting SharePoint again.',
    );
  }
  try {
    const grant = await parts.client.exchangeCode(input.code, codeVerifier);
    if (!grant.refreshToken) throw errors.invalidState("Microsoft didn't give us lasting access. Start connecting SharePoint again.");
    await savePickerGrant(deps, parts.adapter, {
      organisationId: input.organisationId,
      userId: input.userId,
      meta: input.meta,
      grant: { ...grant, refreshToken: grant.refreshToken },
      accountDomain: null,
      tenantId: tenantFromIdToken(grant.idToken),
    });
  } catch (error) {
    if (error instanceof PickerError && (error.kind === 'invalid_grant' || error.kind === 'rejected')) {
      throw errors.invalidInput("Microsoft didn't accept that sign-in. Start connecting SharePoint again.");
    }
    throw pickerProblem(parts.adapter, error);
  }
  return sharepointStatus(deps, input.organisationId);
}

export async function queueSharepointFiles(deps: AppDeps, input: { organisationId: string; userId: string; body: SharepointFilesBody; meta: RequestMeta }): Promise<{ queued: boolean; message: string }> {
  const parts = sharepointParts(deps);
  if (!parts) throw errors.invalidState(SHAREPOINT_NOT_AVAILABLE);
  const seen = new Set<string>();
  const items = input.body.items.filter((item) => {
    const key = `${item.driveId}\n${item.itemId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const { organisationId, userId } = input;
  const companyId = input.body.companyId;
  return queuePickerPull(deps, parts.adapter, {
    organisationId,
    userId,
    companyId,
    items,
    meta: input.meta,
    enqueue: (picked) => deps.queue.enqueue('sharepoint.pull', { organisationId, companyId, items: picked, requestedBy: userId }),
  });
}

export function sharepointStatement(modifiedTime: string | null): string {
  const changed = modifiedTime ? ` Microsoft says it was last changed on ${modifiedTime.slice(0, 10)}.` : '';
  return `You picked this file in SharePoint or OneDrive.${changed} That is not a check that it is genuine, signed or legally sufficient.`;
}

/** The sharepoint.pull job: only the picked drive and item ids, each one's metadata and then its content. */
export async function runSharepointPull(
  deps: AppDeps,
  payload: { organisationId: string; companyId: string; items: { driveId: string; itemId: string }[]; requestedBy: string | null },
): Promise<PickerPullRun | null> {
  const parts = sharepointParts(deps);
  if (!parts) return null;
  const { client } = parts;
  const maxBytes = deps.config.maxUploadBytes;
  return runPickerPull(deps, parts.adapter, payload, async (access, item): Promise<PlannedFile> => {
    const meta = await client.itemMetadata(access.accessToken, item.driveId, item.itemId);
    // A folder or anything that isn't a file: nothing inside it is read.
    if (!meta.isFile) throw new PickerError('not_allowed', TYPE_REFUSED);
    const kind = claimedKind(meta.mimeType, meta.name);
    if (!kind) throw new PickerError('not_allowed', TYPE_REFUSED);
    const limit = limitFor(kind, maxBytes);
    if (meta.size !== null && meta.size > limit) throw new PickerError('too_large', 'That file from SharePoint or OneDrive is larger than we can take.');
    const origin: ConnectedDocumentOrigin = {
      kind: 'sharepoint',
      driveId: item.driveId,
      itemId: item.itemId,
      modifiedTime: meta.modifiedTime,
      tenantId: access.connection.tenantId,
      fetchedAt: deps.now().toISOString(),
      statement: sharepointStatement(meta.modifiedTime),
    };
    return {
      externalRef: `sharepoint:${item.driveId}:${item.itemId}:${meta.modifiedTime ?? 'unknown'}`,
      kind,
      fileName: pickedFileName(meta.name, kind, `sharepoint-${item.itemId.slice(0, 8)}`),
      origin,
      download: (fresh) => client.download(fresh.accessToken, item.driveId, item.itemId, limit),
    };
  });
}

/** Deletes our row and the sealed tokens, and tells the person where to remove Vero on Microsoft's side. */
export async function disconnectSharepoint(deps: AppDeps, input: { organisationId: string; userId: string; meta: RequestMeta }): Promise<FilePickerConnection> {
  const deleted = await deletePickerConnection(deps, { provider: 'sharepoint', auditPrefix: 'sharepoint' }, { ...input, revokedAtProvider: null });
  return sharepointStatus(deps, input.organisationId, deleted ? DISCONNECTED : undefined);
}

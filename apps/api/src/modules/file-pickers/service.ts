import { FILE_PICKER_EVIDENCE_NOTICE, type ConnectedDocumentOrigin, type FilePickerConnection, type FilePickerProvider } from '@vero/shared';
import { and, eq } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError, errors } from '../../http/errors';
import type { RequestMeta } from '../../http/route';
import { requireOwned } from '../companies/ownership';
import { writeAudit } from '../audit/service';
import { entitlementsOf, requireEntitlement } from '../plans/service';
import { requireCompany } from '../scans/facts';
import { addConnectedDocument } from '../vault/service';
import { PickerError, type TokenGrant } from './client-base';
import { actualKind, PICKED_MIME, type PickedKind } from './files';
import { openPickerTokens, SealedPickerTokensError, sealPickerTokens } from './tokens';

/**
 * What Google Drive and SharePoint / OneDrive share: one connection row per organisation and
 * provider (migration 0019, row-level security), sealed tokens refreshed under a row lock, the
 * "access ended" path, the caps, and the pull loop that turns each picked file into an
 * unconfirmed vault document. Each provider supplies its own client through `PickerAdapter`.
 */
const { filePickerConnection, document } = schema;
export type PickerConnectionRow = typeof filePickerConnection.$inferSelect;

export interface PickerAdapter {
  provider: FilePickerProvider;
  /** "Google Drive" or "SharePoint". */
  name: string;
  /** The audit action prefix: google_drive or sharepoint. */
  auditPrefix: string;
  notAvailable: string;
  accessEnded: string;
  maxFilesPerPull: number;
  maxFilesPerOrgPerDay: number;
  /** Refresh this long before the access token expires. */
  refreshMarginMs: number;
  refresh(refreshToken: string): Promise<TokenGrant>;
}

export interface PickerAccess {
  accessToken: string;
  connection: PickerConnectionRow;
}

/** A provider failure as a plain, safe API error. Nothing the provider sent reaches the caller. */
export function pickerProblem(adapter: Pick<PickerAdapter, 'name' | 'accessEnded'>, error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof PickerError) {
    if (error.kind === 'invalid_grant' || error.kind === 'unauthorized') return errors.invalidState(adapter.accessEnded);
    if (error.kind === 'rate_limited') return new AppError(429, 'rate_limited', error.message);
    return errors.invalidState(error.message);
  }
  return errors.invalidState(`We couldn't reach ${adapter.name} just now. Please try again.`);
}

export async function loadPickerConnection(tx: Tx, provider: FilePickerProvider): Promise<PickerConnectionRow | undefined> {
  const [row] = await tx.select().from(filePickerConnection).where(eq(filePickerConnection.provider, provider)).limit(1);
  return row;
}

export function pickerView(
  adapter: Pick<PickerAdapter, 'provider' | 'name' | 'notAvailable' | 'accessEnded' | 'maxFilesPerPull'> | null,
  provider: FilePickerProvider,
  notAvailable: string,
  row: PickerConnectionRow | undefined,
  message?: string,
): FilePickerConnection {
  const base = { provider, maxFilesPerPull: adapter?.maxFilesPerPull ?? 0, notice: FILE_PICKER_EVIDENCE_NOTICE };
  const empty = { accountDomain: null, tenantId: null, connectedAt: null, lastPulledAt: null, lastError: null };
  if (!adapter) return { ...base, ...empty, status: 'not_available', message: notAvailable };
  if (!row) return { ...base, ...empty, status: 'not_connected', message: message ?? `${adapter.name} is not connected. Connect it to pick files to bring in.` };
  const active = row.status === 'active';
  return {
    ...base,
    status: active ? 'active' : 'revoked',
    message: message ?? (active ? `Connected. We bring in only the files you pick in ${adapter.name}, and each one waits for you to confirm it.` : adapter.accessEnded),
    accountDomain: row.accountDomain,
    tenantId: row.tenantId,
    connectedAt: row.connectedAt.toISOString(),
    lastPulledAt: row.lastPulledAt?.toISOString() ?? null,
    lastError: row.lastError,
  };
}

/** Saves a new grant, sealed before it touches the database. The tokens, code and state are never audited. */
export async function savePickerGrant(
  deps: AppDeps,
  adapter: PickerAdapter,
  input: { organisationId: string; userId: string; grant: TokenGrant & { refreshToken: string }; accountDomain: string | null; tenantId: string | null; meta: RequestMeta },
): Promise<PickerConnectionRow> {
  const { organisationId } = input;
  const sealed = sealPickerTokens(deps.secrets, adapter.provider, organisationId, { accessToken: input.grant.accessToken, refreshToken: input.grant.refreshToken });
  return deps.db.withOrg(organisationId, async (tx) => {
    const existing = await loadPickerConnection(tx, adapter.provider);
    const now = deps.now();
    const values = {
      accountDomain: input.accountDomain,
      tenantId: input.tenantId,
      status: 'active',
      sealedTokens: sealed,
      accessExpiresAt: new Date(now.getTime() + input.grant.expiresInSeconds * 1000),
      scope: input.grant.scope,
      lastError: null,
      connectedBy: input.userId,
      connectedAt: now,
    };
    const [row] = existing
      ? await tx.update(filePickerConnection).set(values).where(eq(filePickerConnection.id, existing.id)).returning()
      : await tx.insert(filePickerConnection).values({ organisationId, provider: adapter.provider, ...values }).returning();
    if (!row) throw errors.internal();
    await writeAudit(tx, { organisationId, actorId: input.userId, action: `${adapter.auditPrefix}.connected`, target: row.id, metadata: { reconnected: existing !== undefined }, meta: input.meta });
    return row;
  });
}

async function markAccessEnded(deps: AppDeps, adapter: PickerAdapter, organisationId: string, connectionId: string): Promise<void> {
  await deps.db.withOrg(organisationId, async (tx) => {
    const updated = await tx
      .update(filePickerConnection)
      .set({ status: 'revoked', sealedTokens: null, accessExpiresAt: null, lastError: adapter.accessEnded })
      .where(and(eq(filePickerConnection.id, connectionId), eq(filePickerConnection.status, 'active')))
      .returning({ id: filePickerConnection.id });
    if (updated.length > 0) await writeAudit(tx, { organisationId, action: `${adapter.auditPrefix}.access_ended`, target: connectionId });
  });
}

type AccessResult = { ok: true; access: PickerAccess } | { ok: false; ended: string | null };

/**
 * A usable access token, refreshed when it is near expiry (or when `force`). The row is locked
 * while refreshing, so two refreshes never race with the same refresh token. A rotated refresh
 * token replaces the old one. A refresh the provider refuses ends the connection.
 */
export async function getPickerAccess(deps: AppDeps, adapter: PickerAdapter, organisationId: string, force: boolean): Promise<PickerAccess> {
  const result: AccessResult = await deps.db.withOrg(organisationId, async (tx): Promise<AccessResult> => {
    const [row] = await tx.select().from(filePickerConnection).where(eq(filePickerConnection.provider, adapter.provider)).limit(1).for('update');
    if (!row) throw errors.invalidState(`Connect ${adapter.name} first.`);
    if (row.status !== 'active' || !row.sealedTokens) return { ok: false, ended: null };
    let tokens;
    try {
      tokens = openPickerTokens(deps.secrets, adapter.provider, organisationId, row.sealedTokens);
    } catch (error) {
      if (error instanceof SealedPickerTokensError) return { ok: false, ended: row.id };
      throw error;
    }
    const fresh = row.accessExpiresAt && row.accessExpiresAt.getTime() - deps.now().getTime() > adapter.refreshMarginMs;
    if (fresh && !force) return { ok: true, access: { accessToken: tokens.accessToken, connection: row } };
    let grant: TokenGrant;
    try {
      grant = await adapter.refresh(tokens.refreshToken);
    } catch (error) {
      if (error instanceof PickerError && (error.kind === 'invalid_grant' || error.kind === 'unauthorized')) return { ok: false, ended: row.id };
      throw error;
    }
    const next = { accessToken: grant.accessToken, refreshToken: grant.refreshToken ?? tokens.refreshToken };
    const [updated] = await tx
      .update(filePickerConnection)
      .set({ sealedTokens: sealPickerTokens(deps.secrets, adapter.provider, organisationId, next), accessExpiresAt: new Date(deps.now().getTime() + grant.expiresInSeconds * 1000), lastError: null })
      .where(eq(filePickerConnection.id, row.id))
      .returning();
    return { ok: true, access: { accessToken: next.accessToken, connection: updated ?? row } };
  });
  if (result.ok) return result.access;
  if (result.ended) await markAccessEnded(deps, adapter, organisationId, result.ended);
  throw new PickerError('invalid_grant', adapter.accessEnded);
}

/** Runs one provider call with a good token. A 401 gets one refresh and one retry; a second ends the connection. */
export async function withPickerAccess<T>(deps: AppDeps, adapter: PickerAdapter, organisationId: string, call: (access: PickerAccess) => Promise<T>): Promise<T> {
  const access = await getPickerAccess(deps, adapter, organisationId, false);
  try {
    return await call(access);
  } catch (error) {
    if (!(error instanceof PickerError) || error.kind !== 'unauthorized') throw error;
  }
  const retried = await getPickerAccess(deps, adapter, organisationId, true);
  try {
    return await call(retried);
  } catch (error) {
    if (error instanceof PickerError && error.kind === 'unauthorized') {
      await markAccessEnded(deps, adapter, organisationId, retried.connection.id);
      throw new PickerError('invalid_grant', adapter.accessEnded);
    }
    throw error;
  }
}

/**
 * Queues bringing in the picked files, and only those. Capped per pick and per organisation per
 * day; needs the company, a plan with the vault and an active connection.
 */
export async function queuePickerPull<T>(
  deps: AppDeps,
  adapter: PickerAdapter,
  input: { organisationId: string; userId: string; companyId: string; items: T[]; meta: RequestMeta; enqueue: (items: T[]) => Promise<unknown> },
): Promise<{ queued: boolean; message: string }> {
  const { organisationId } = input;
  if (input.items.length > adapter.maxFilesPerPull) throw errors.invalidInput(`You can bring in up to ${adapter.maxFilesPerPull} files at a time.`);
  await deps.db.withOrg(organisationId, async (tx) => {
    requireOwned(await requireCompany(tx, input.companyId));
    requireEntitlement(await entitlementsOf(tx, organisationId, deps.config), 'vault', 'Adding documents');
    const row = await loadPickerConnection(tx, adapter.provider);
    if (!row) throw errors.invalidState(`Connect ${adapter.name} first.`);
    if (row.status !== 'active') throw errors.invalidState(adapter.accessEnded);
  });
  for (let index = 0; index < input.items.length; index += 1) {
    await deps.limiter.enforce(`${adapter.provider}-pull:org:${organisationId}`, adapter.maxFilesPerOrgPerDay, 24 * 60 * 60);
  }
  await input.enqueue(input.items);
  await deps.db.withOrg(organisationId, (tx) =>
    writeAudit(tx, { organisationId, actorId: input.userId, action: `${adapter.auditPrefix}.pull_requested`, target: input.companyId, metadata: { files: input.items.length }, meta: input.meta }),
  );
  return { queued: true, message: "We're bringing in the files you picked. Each one will wait for you to confirm it." };
}

/** What a provider found out about one picked file before downloading it. */
export interface PlannedFile {
  /** The same file version is never added twice: provider, file and its modified time. */
  externalRef: string;
  kind: PickedKind;
  fileName: string;
  origin: ConnectedDocumentOrigin;
  download: (access: PickerAccess) => Promise<Buffer>;
}

export interface PickerPullRun {
  files: number;
  added: number;
  alreadyThere: number;
  skippedType: number;
  skippedSize: number;
  notFound: number;
  failed: number;
  notChecked: number;
}

/**
 * The pull job for either provider. For each picked file, and only those: the provider's
 * metadata (`plan`), then its content, checked like an upload, then an unconfirmed vault
 * document. One file failing never stops the others; the provider asking us to slow down, or
 * the access ending, stops the run.
 */
export async function runPickerPull<T>(
  deps: AppDeps,
  adapter: PickerAdapter,
  payload: { organisationId: string; companyId: string; items: T[]; requestedBy: string | null },
  plan: (access: PickerAccess, item: T) => Promise<PlannedFile>,
): Promise<PickerPullRun | null> {
  const { organisationId, companyId } = payload;
  const setup = await deps.db.withOrg(organisationId, async (tx) => {
    const row = await loadPickerConnection(tx, adapter.provider);
    if (!row || row.status !== 'active') return null;
    await requireCompany(tx, companyId);
    if (!(await entitlementsOf(tx, organisationId, deps.config)).vault) return null;
    return row;
  });
  if (!setup) return null;

  const items = payload.items.slice(0, adapter.maxFilesPerPull);
  const run: PickerPullRun = { files: items.length, added: 0, alreadyThere: 0, skippedType: 0, skippedSize: 0, notFound: 0, failed: 0, notChecked: 0 };
  let stopped: PickerError | null = null;

  for (const item of items) {
    if (stopped) {
      run.notChecked += 1;
      continue;
    }
    try {
      const planned = await withPickerAccess(deps, adapter, organisationId, (access) => plan(access, item));
      const [already] = await deps.db.withOrg(organisationId, (tx) =>
        tx.select({ id: document.id }).from(document).where(and(eq(document.companyId, companyId), eq(document.externalRef, planned.externalRef))).limit(1),
      );
      if (already) {
        run.alreadyThere += 1;
        continue;
      }
      const data = await withPickerAccess(deps, adapter, organisationId, (access) => planned.download(access));
      if (actualKind(data, planned.kind) !== planned.kind) {
        run.skippedType += 1;
        continue;
      }
      await addConnectedDocument(deps, {
        organisationId,
        companyId,
        data,
        fileName: planned.fileName,
        mime: PICKED_MIME[planned.kind],
        source: adapter.provider,
        origin: planned.origin,
        externalRef: planned.externalRef,
        auditAction: `document.added_from_${adapter.auditPrefix}`,
      });
      run.added += 1;
    } catch (error) {
      if (!(error instanceof PickerError)) throw error;
      if (error.kind === 'too_large') run.skippedSize += 1;
      else if (error.kind === 'not_allowed') run.skippedType += 1;
      else if (error.kind === 'not_found') run.notFound += 1;
      else run.failed += 1;
      if (error.kind === 'rate_limited' || error.kind === 'invalid_grant') stopped = error;
    }
  }

  const stop: PickerError | null = stopped;
  await deps.db.withOrg(organisationId, async (tx) => {
    const lastError = stop ? (stop.kind === 'invalid_grant' ? adapter.accessEnded : stop.message) : null;
    await tx.update(filePickerConnection).set({ lastPulledAt: deps.now(), ...(stop?.kind === 'invalid_grant' ? {} : { lastError }) }).where(eq(filePickerConnection.id, setup.id));
    // Counts only: never a token, a file name, a file id or an account.
    await writeAudit(tx, { organisationId, actorId: payload.requestedBy, action: `${adapter.auditPrefix}.pulled`, target: companyId, metadata: { ...run, stoppedBy: stop?.kind ?? null } });
  });
  return run;
}

/** Deletes our row and its sealed tokens. Returns the tokens so the caller can ask the provider to revoke them first, where it can. */
export async function deletePickerConnection(
  deps: AppDeps,
  adapter: Pick<PickerAdapter, 'provider' | 'auditPrefix'>,
  input: { organisationId: string; userId: string; meta: RequestMeta; revokedAtProvider: boolean | null },
): Promise<boolean> {
  const { organisationId } = input;
  return deps.db.withOrg(organisationId, async (tx) => {
    const row = await loadPickerConnection(tx, adapter.provider);
    if (!row) return false;
    await tx.delete(filePickerConnection).where(eq(filePickerConnection.id, row.id));
    await writeAudit(tx, {
      organisationId,
      actorId: input.userId,
      action: `${adapter.auditPrefix}.disconnected`,
      target: row.id,
      metadata: { wasActive: row.status === 'active', revokedAtProvider: input.revokedAtProvider },
      meta: input.meta,
    });
    return true;
  });
}

/** The stored refresh token, for a revoke call on disconnect. Null when there is none or it can't be opened. */
export async function storedRefreshToken(deps: AppDeps, provider: FilePickerProvider, organisationId: string): Promise<string | null> {
  const row = await deps.db.withOrg(organisationId, (tx) => loadPickerConnection(tx, provider));
  if (!row?.sealedTokens) return null;
  try {
    return openPickerTokens(deps.secrets, provider, organisationId, row.sealedTokens).refreshToken;
  } catch {
    return null;
  }
}

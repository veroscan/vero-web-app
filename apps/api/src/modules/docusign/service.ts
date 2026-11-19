import { DOCUSIGN_EVIDENCE_NOTICE, type DocusignConnection, type DocusignEnvelopeListResponse, type DocusignPullBody } from '@vero/shared';
import { and, eq, inArray } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError, errors } from '../../http/errors';
import type { RequestMeta } from '../../http/route';
import { requireOwned } from '../companies/ownership';
import { writeAudit } from '../audit/service';
import { entitlementsOf, requireEntitlement } from '../plans/service';
import { requireCompany } from '../scans/facts';
import { DocusignClient, DocusignError, type DocusignAccount } from './client';
import type { DocusignConfig } from './config';
import { consumeDocusignState, signDocusignState } from './state';
import { openTokens, SealedTokensError, sealTokens } from './tokens';

const { docusignConnection, docusignEnvelopePull } = schema;
export type DocusignConnectionRow = typeof docusignConnection.$inferSelect;

export const DOCUSIGN_SOURCE = 'docusign';
export const DOCUSIGN_SOURCE_NAME = 'DocuSign';
export const DOCUSIGN_DISCONNECTED_SOURCE_NAME = 'DocuSign (disconnected)';

export const DOCUSIGN_NOT_AVAILABLE = "DocuSign isn't connected yet. You can upload the files from your computer for now.";
export const DOCUSIGN_ACCESS_ENDED = 'DocuSign access ended, connect again.';
const NOT_CONNECTED = 'Connect DocuSign first.';
const CONNECTED = 'Connected. We bring in only the completed envelopes you pick, and each file waits for you to confirm it.';
const DISCONNECTED =
  "Disconnected, and we deleted the access DocuSign gave us. DocuSign doesn't let us withdraw that access from our side, so to remove Vero from your DocuSign account too, open your DocuSign profile, then Connected Apps, and revoke Vero there.";
/** DocuSign suggests refreshing when an access token is within about 30 minutes of expiring. */
const REFRESH_MARGIN_MS = 30 * 60 * 1000;

export interface DocusignParts {
  config: DocusignConfig;
  client: DocusignClient;
}

/** Both the settings and a client; null while DocuSign is off. */
export function docusignParts(deps: AppDeps): DocusignParts | null {
  const config = deps.config.docusign;
  if (!config) return null;
  return { config, client: new DocusignClient(config, { ...(deps.docusignFetch ? { fetch: deps.docusignFetch } : {}), timeoutMs: deps.config.connectorTimeoutMs }) };
}

/** A DocuSign failure as a plain, safe API error. Nothing DocuSign sent reaches the caller. */
export function docusignProblem(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof DocusignError) {
    if (error.kind === 'invalid_grant' || error.kind === 'unauthorized') return errors.invalidState(DOCUSIGN_ACCESS_ENDED);
    if (error.kind === 'not_found') return errors.invalidInput(error.message);
    return errors.invalidState(error.message);
  }
  return errors.invalidState("We couldn't reach DocuSign just now. Please try again.");
}

async function loadConnection(tx: Tx): Promise<DocusignConnectionRow | undefined> {
  const [row] = await tx.select().from(docusignConnection).limit(1);
  return row;
}

function view(deps: AppDeps, row: DocusignConnectionRow | undefined, message?: string): DocusignConnection {
  const config = deps.config.docusign;
  const base = {
    environment: config?.environment ?? null,
    maxEnvelopesPerPull: config?.maxEnvelopesPerPull ?? 0,
    notice: DOCUSIGN_EVIDENCE_NOTICE,
  };
  if (!config) return { ...base, status: 'not_available', message: DOCUSIGN_NOT_AVAILABLE, account: null, connectedAt: null, lastPulledAt: null, lastError: null };
  if (!row) return { ...base, status: 'not_connected', message: message ?? 'DocuSign is not connected. Connect it to pick completed envelopes to bring in.', account: null, connectedAt: null, lastPulledAt: null, lastError: null };
  const active = row.status === 'active';
  return {
    ...base,
    status: active ? 'active' : 'revoked',
    message: message ?? (active ? CONNECTED : DOCUSIGN_ACCESS_ENDED),
    account: { id: row.accountId, name: row.accountName },
    connectedAt: row.connectedAt.toISOString(),
    lastPulledAt: row.lastPulledAt?.toISOString() ?? null,
    lastError: row.lastError,
  };
}

export async function docusignStatus(deps: AppDeps, organisationId: string): Promise<DocusignConnection> {
  return deps.db.withOrg(organisationId, async (tx) => view(deps, await loadConnection(tx)));
}

/** DocuSign's own sign-in page, carrying a signed state for this organisation and this person. */
export function startConnect(deps: AppDeps, binding: { organisationId: string; userId: string }) {
  const parts = docusignParts(deps);
  if (!parts) return { status: 'not_available' as const, message: DOCUSIGN_NOT_AVAILABLE, authorizeUrl: null, expiresAt: null };
  const { state, expiresAt } = signDocusignState(deps, binding);
  return {
    status: 'ready' as const,
    message: "Sign in on DocuSign's page and allow Vero. Nothing is brought in until you pick envelopes here.",
    authorizeUrl: parts.client.authorizeUrl(state),
    expiresAt: expiresAt.toISOString(),
  };
}

/**
 * DocuSign's callback. The state is checked and used up first, then the code is exchanged for
 * tokens, which are sealed before they touch the database. The account is DocuSign's own
 * default account for the person who signed in.
 */
export async function completeConnect(
  deps: AppDeps,
  input: { organisationId: string; userId: string; code: string | undefined; state: string; error: string | undefined; meta: RequestMeta },
): Promise<DocusignConnection> {
  const parts = docusignParts(deps);
  if (!parts) throw errors.invalidState(DOCUSIGN_NOT_AVAILABLE);
  const { organisationId } = input;
  await consumeDocusignState(deps, input.state, { organisationId, userId: input.userId });
  if (input.error || !input.code) throw errors.invalidInput('DocuSign sign-in was not completed, so nothing was connected. Start connecting DocuSign again.');

  let account: DocusignAccount;
  let sealed: string;
  let expiresAt: Date;
  let scope: string | null;
  try {
    const grant = await parts.client.exchangeCode(input.code);
    if (!grant.refreshToken) throw errors.invalidState("DocuSign didn't give us lasting access. Start connecting DocuSign again.");
    account = await parts.client.defaultAccount(grant.accessToken);
    sealed = sealTokens(deps.secrets, organisationId, { accessToken: grant.accessToken, refreshToken: grant.refreshToken });
    expiresAt = new Date(deps.now().getTime() + grant.expiresInSeconds * 1000);
    scope = grant.scope;
  } catch (error) {
    if (error instanceof DocusignError && (error.kind === 'invalid_grant' || error.kind === 'rejected')) {
      throw errors.invalidInput("DocuSign didn't accept that sign-in. Start connecting DocuSign again.");
    }
    throw docusignProblem(error);
  }

  return deps.db.withOrg(organisationId, async (tx) => {
    const existing = await loadConnection(tx);
    const now = deps.now();
    const values = {
      accountId: account.accountId,
      accountName: account.accountName,
      baseUri: account.baseUri,
      status: 'active',
      sealedTokens: sealed,
      accessExpiresAt: expiresAt,
      scope,
      lastError: null,
    };
    const [row] = existing
      ? await tx.update(docusignConnection).set({ ...values, connectedBy: input.userId, connectedAt: now }).where(eq(docusignConnection.id, existing.id)).returning()
      : await tx.insert(docusignConnection).values({ organisationId, connectedBy: input.userId, connectedAt: now, ...values }).returning();
    if (!row) throw errors.internal();
    // Never the tokens, the code or the state.
    await writeAudit(tx, {
      organisationId,
      actorId: input.userId,
      action: 'docusign.connected',
      target: row.id,
      metadata: { environment: parts.config.environment, reconnected: existing !== undefined, sameAccount: existing?.accountId === account.accountId },
      meta: input.meta,
    });
    return view(deps, row);
  });
}

async function markAccessEnded(deps: AppDeps, organisationId: string, connectionId: string): Promise<void> {
  await deps.db.withOrg(organisationId, async (tx) => {
    const updated = await tx
      .update(docusignConnection)
      .set({ status: 'revoked', sealedTokens: null, accessExpiresAt: null, lastError: DOCUSIGN_ACCESS_ENDED })
      .where(and(eq(docusignConnection.id, connectionId), eq(docusignConnection.status, 'active')))
      .returning({ id: docusignConnection.id });
    if (updated.length > 0) await writeAudit(tx, { organisationId, action: 'docusign.access_ended', target: connectionId });
  });
}

interface Access {
  accessToken: string;
  account: { accountId: string; baseUri: string; accountName: string | null };
  connectionId: string;
}

type AccessResult = { ok: true; access: Access } | { ok: false; ended: string | null };

/**
 * A usable access token, refreshed when it is near expiry (or when `force`). The row is locked
 * while refreshing, so two refreshes never race with the same refresh token. A refresh DocuSign
 * refuses ends the connection: the person must connect again.
 */
async function getAccess(deps: AppDeps, parts: DocusignParts, organisationId: string, force: boolean): Promise<Access> {
  const result: AccessResult = await deps.db.withOrg(organisationId, async (tx): Promise<AccessResult> => {
    const [row] = await tx.select().from(docusignConnection).limit(1).for('update');
    if (!row) throw errors.invalidState(NOT_CONNECTED);
    if (row.status !== 'active' || !row.sealedTokens) return { ok: false, ended: null };
    let tokens;
    try {
      tokens = openTokens(deps.secrets, organisationId, row.sealedTokens);
    } catch (error) {
      if (error instanceof SealedTokensError) return { ok: false, ended: row.id };
      throw error;
    }
    const account = { accountId: row.accountId, baseUri: row.baseUri, accountName: row.accountName };
    const fresh = row.accessExpiresAt && row.accessExpiresAt.getTime() - deps.now().getTime() > REFRESH_MARGIN_MS;
    if (fresh && !force) return { ok: true, access: { accessToken: tokens.accessToken, account, connectionId: row.id } };
    let grant;
    try {
      grant = await parts.client.refresh(tokens.refreshToken);
    } catch (error) {
      if (error instanceof DocusignError && (error.kind === 'invalid_grant' || error.kind === 'unauthorized')) return { ok: false, ended: row.id };
      throw error;
    }
    // DocuSign may rotate the refresh token. If it sends none, the one we have still stands.
    const next = { accessToken: grant.accessToken, refreshToken: grant.refreshToken ?? tokens.refreshToken };
    await tx
      .update(docusignConnection)
      .set({ sealedTokens: sealTokens(deps.secrets, organisationId, next), accessExpiresAt: new Date(deps.now().getTime() + grant.expiresInSeconds * 1000), lastError: null })
      .where(eq(docusignConnection.id, row.id));
    return { ok: true, access: { accessToken: next.accessToken, account, connectionId: row.id } };
  });
  if (result.ok) return result.access;
  if (result.ended) await markAccessEnded(deps, organisationId, result.ended);
  throw new DocusignError('invalid_grant');
}

/** Runs one DocuSign call with a good token. A 401 gets one refresh and one retry; a second ends the connection. */
export async function withDocusign<T>(deps: AppDeps, parts: DocusignParts, organisationId: string, call: (access: Access) => Promise<T>): Promise<T> {
  const access = await getAccess(deps, parts, organisationId, false);
  try {
    return await call(access);
  } catch (error) {
    if (!(error instanceof DocusignError) || error.kind !== 'unauthorized') throw error;
  }
  const retried = await getAccess(deps, parts, organisationId, true);
  try {
    return await call(retried);
  } catch (error) {
    if (error instanceof DocusignError && error.kind === 'unauthorized') {
      await markAccessEnded(deps, organisationId, retried.connectionId);
      throw new DocusignError('invalid_grant');
    }
    throw error;
  }
}

/** Recent completed envelopes, for the person to pick from. Listing brings nothing in and stores nothing. */
export async function listEnvelopes(deps: AppDeps, organisationId: string): Promise<DocusignEnvelopeListResponse> {
  const parts = docusignParts(deps);
  if (!parts) throw errors.invalidState(DOCUSIGN_NOT_AVAILABLE);
  const from = new Date(deps.now().getTime() - parts.config.listDays * 24 * 60 * 60 * 1000);
  let listed;
  try {
    listed = await withDocusign(deps, parts, organisationId, (access) => parts.client.listCompleted(access.accessToken, access.account, from, parts.config.maxEnvelopesListed));
  } catch (error) {
    throw docusignProblem(error);
  }
  const ids = listed.envelopes.map((item) => item.envelopeId);
  const pulled = ids.length === 0
    ? new Set<string>()
    : new Set(
        (await deps.db.withOrg(organisationId, (tx) => tx.select({ envelopeId: docusignEnvelopePull.envelopeId }).from(docusignEnvelopePull).where(inArray(docusignEnvelopePull.envelopeId, ids)))).map((row) => row.envelopeId),
      );
  return {
    envelopes: listed.envelopes.map((item) => ({ ...item, alreadyPulled: pulled.has(item.envelopeId) })),
    complete: listed.complete,
    message:
      listed.envelopes.length === 0
        ? `We found no completed envelopes in the last ${parts.config.listDays} days.`
        : 'Pick the envelopes to bring in. Only the ones you pick are read.',
    notice: DOCUSIGN_EVIDENCE_NOTICE,
  };
}

/** Queues bringing in the envelopes picked, and only those. Capped per pick and per organisation per day. */
export async function queuePull(deps: AppDeps, input: { organisationId: string; userId: string; body: DocusignPullBody; meta: RequestMeta }): Promise<{ queued: boolean; message: string }> {
  const parts = docusignParts(deps);
  if (!parts) throw errors.invalidState(DOCUSIGN_NOT_AVAILABLE);
  const { organisationId, body } = input;
  const envelopeIds = [...new Set(body.envelopeIds.map((id) => id.toLowerCase()))];
  if (envelopeIds.length > parts.config.maxEnvelopesPerPull) throw errors.invalidInput(`You can bring in up to ${parts.config.maxEnvelopesPerPull} envelopes at a time.`);
  await deps.db.withOrg(organisationId, async (tx) => {
    requireOwned(await requireCompany(tx, body.companyId));
    requireEntitlement(await entitlementsOf(tx, organisationId, deps.config), 'vault', 'Adding documents');
    const row = await loadConnection(tx);
    if (!row) throw errors.invalidState(NOT_CONNECTED);
    if (row.status !== 'active') throw errors.invalidState(DOCUSIGN_ACCESS_ENDED);
  });
  for (let index = 0; index < envelopeIds.length; index += 1) {
    await deps.limiter.enforce(`docusign-pull:org:${organisationId}`, parts.config.maxEnvelopesPerOrgPerDay, 24 * 60 * 60);
  }
  await deps.queue.enqueue('docusign.pull', { organisationId, companyId: body.companyId, envelopeIds, requestedBy: input.userId });
  await deps.db.withOrg(organisationId, (tx) =>
    writeAudit(tx, { organisationId, actorId: input.userId, action: 'docusign.pull_requested', target: body.companyId, metadata: { envelopes: envelopeIds.length }, meta: input.meta }),
  );
  return { queued: true, message: "We're bringing in the envelopes you picked. Each file will wait for you to confirm it." };
}

/** Facts already made stay, marked as from a DocuSign connection that is gone. */
async function markFactsDisconnected(tx: Tx): Promise<void> {
  await tx.update(schema.fact).set({ sourceName: DOCUSIGN_DISCONNECTED_SOURCE_NAME }).where(and(eq(schema.fact.origin, 'connector'), eq(schema.fact.source, DOCUSIGN_SOURCE)));
}

/**
 * Deletes our connection row and with it the sealed tokens. DocuSign documents no API call to
 * withdraw a user's consent or revoke a refresh token, so the person is told how to revoke it on
 * DocuSign's side. Facts stay, marked as from a disconnected source; documents stay in the vault.
 */
export async function disconnect(deps: AppDeps, input: { organisationId: string; userId: string; meta: RequestMeta }): Promise<DocusignConnection> {
  const { organisationId } = input;
  return deps.db.withOrg(organisationId, async (tx) => {
    const row = await loadConnection(tx);
    if (!row) return view(deps, undefined);
    await tx.delete(docusignConnection).where(eq(docusignConnection.id, row.id));
    await markFactsDisconnected(tx);
    await writeAudit(tx, { organisationId, actorId: input.userId, action: 'docusign.disconnected', target: row.id, metadata: { wasActive: row.status === 'active' }, meta: input.meta });
    return view(deps, undefined, DISCONNECTED);
  });
}

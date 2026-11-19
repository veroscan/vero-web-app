import { GithubAppClient, GithubError, type FetchLike, type GithubRepoSummary } from '@vero/connectors';
import { GITHUB_EVIDENCE_NOTICE, type GithubConnection, type GithubRepository, type GithubRepositoryState, type GithubSelectRepositoriesBody } from '@vero/shared';
import { and, eq, inArray, notInArray } from 'drizzle-orm';
import type { GithubConfig } from '../../config';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError, errors } from '../../http/errors';
import type { RequestMeta } from '../../http/route';
import { requireOwned } from '../companies/ownership';
import { writeAudit } from '../audit/service';
import { requireCompany } from '../scans/facts';
import { consumeInstallState, signInstallState } from './state';

const { githubInstallation, githubRepository, githubInstallationIndex } = schema;
export type InstallationRow = typeof githubInstallation.$inferSelect;
export type RepositoryRow = typeof githubRepository.$inferSelect;

export const GITHUB_SOURCE = 'github';
export const GITHUB_SOURCE_NAME = 'GitHub';
export const GITHUB_DISCONNECTED_SOURCE_NAME = 'GitHub (disconnected)';

export const NOT_CONNECTED = "GitHub isn't connected yet. You can upload the files from your computer for now.";
const NOT_SET_UP = 'Connect GitHub first.';
/** How many repositories we keep on the list of what the customer could include. */
const AVAILABLE_LIST_MAX = 500;
const SYNC_REQUESTS_PER_ORG_PER_HOUR = 6;
/** Allowance between GitHub's clock and ours. */
const INSTALL_CLOCK_SKEW_MS = 2 * 60 * 1000;

export function createGithubClient(config: GithubConfig, options: { fetch?: FetchLike; now?: () => Date; sleep?: (ms: number) => Promise<void>; timeoutMs?: number } = {}): GithubAppClient {
  return new GithubAppClient({
    appId: config.appId,
    privateKey: config.privateKey,
    apiUrl: config.apiUrl,
    ...(options.fetch ? { fetch: options.fetch } : {}),
    ...(options.now ? { now: options.now } : {}),
    ...(options.sleep ? { sleep: options.sleep } : {}),
    ...(options.timeoutMs ? { timeoutMs: options.timeoutMs } : {}),
  });
}

/** Both parts must be there: the settings, and the client built from them. */
export function githubParts(deps: AppDeps): { client: GithubAppClient; config: GithubConfig } | null {
  return deps.github && deps.config.github ? { client: deps.github, config: deps.config.github } : null;
}

/** A GitHub failure as a plain, safe API error. Nothing GitHub sent reaches the caller. */
export function githubProblem(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof GithubError) {
    if (error.kind === 'not_found') return errors.invalidInput("GitHub doesn't know that installation. Start connecting GitHub again.");
    if (error.kind === 'rate_limited') return errors.invalidState(error.message);
    return errors.invalidState("We couldn't check this with GitHub just now. Please try again.");
  }
  return errors.invalidState("We couldn't check this with GitHub just now. Please try again.");
}

const REPOSITORY_WORDS: Record<GithubRepositoryState, string> = {
  not_included: 'Not included',
  not_checked_yet: 'Not checked yet',
  checked: 'Read from GitHub',
  problem: "We couldn't read it",
};

function repositoryState(row: RepositoryRow): GithubRepositoryState {
  if (!row.selected) return 'not_included';
  if (row.lastError) return 'problem';
  return row.lastSyncedAt ? 'checked' : 'not_checked_yet';
}

function emptyView(deps: AppDeps, message: string): GithubConnection {
  return {
    status: 'not_connected',
    message,
    account: null,
    connectedAt: null,
    lastSyncedAt: null,
    lastError: null,
    repositories: [],
    maxRepositories: deps.config.github?.maxReposPerOrg ?? 0,
    notice: GITHUB_EVIDENCE_NOTICE,
  };
}

function statusMessage(row: InstallationRow): string {
  switch (row.status) {
    case 'active':
      return 'Connected. We read only the files listed in our GitHub guide, from the repositories you include.';
    case 'suspended':
      return 'The Vero app is suspended on GitHub, so nothing is read until it is turned back on there.';
    default:
      return row.lastError ?? 'The Vero app is no longer installed on this GitHub account, so nothing can be read.';
  }
}

export async function loadInstallation(tx: Tx): Promise<InstallationRow | undefined> {
  const [row] = await tx.select().from(githubInstallation).limit(1);
  return row;
}

export async function connectionView(deps: AppDeps, tx: Tx): Promise<GithubConnection> {
  if (!githubParts(deps)) return emptyView(deps, NOT_CONNECTED);
  const installation = await loadInstallation(tx);
  if (!installation) return emptyView(deps, NOT_CONNECTED);
  const rows = await tx.select().from(githubRepository).where(eq(githubRepository.installationId, installation.id)).orderBy(githubRepository.fullName);
  const repositories: GithubRepository[] = rows.map((row) => {
    const state = repositoryState(row);
    return {
      repositoryId: row.repoId,
      fullName: row.fullName,
      selected: row.selected,
      companyId: row.companyId,
      defaultBranch: row.defaultBranch,
      lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
      lastError: row.lastError,
      state,
      stateWord: REPOSITORY_WORDS[state],
    };
  });
  return {
    status: installation.status as GithubConnection['status'],
    message: statusMessage(installation),
    account: { login: installation.accountLogin, type: installation.accountType },
    connectedAt: installation.connectedAt.toISOString(),
    lastSyncedAt: installation.lastSyncedAt?.toISOString() ?? null,
    lastError: installation.lastError,
    repositories,
    maxRepositories: deps.config.github?.maxReposPerOrg ?? 0,
    notice: GITHUB_EVIDENCE_NOTICE,
  };
}

export async function githubStatus(deps: AppDeps, organisationId: string): Promise<GithubConnection> {
  return deps.db.withOrg(organisationId, (tx) => connectionView(deps, tx));
}

/** GitHub's own install page, carrying a signed state for this organisation and this person. */
export function startInstall(deps: AppDeps, binding: { organisationId: string; userId: string }) {
  const parts = githubParts(deps);
  if (!parts) return { status: 'not_connected' as const, message: NOT_CONNECTED, installUrl: null, expiresAt: null };
  const { state, expiresAt } = signInstallState(deps, binding);
  const installUrl = `${parts.config.webUrl}/apps/${encodeURIComponent(parts.config.slug)}/installations/new?state=${encodeURIComponent(state)}`;
  return {
    status: 'ready' as const,
    message: "On GitHub's page, choose the account and the repositories. Nothing is read until you also include them here.",
    installUrl,
    expiresAt: expiresAt.toISOString(),
  };
}

/** Keeps the list of what the customer could include in step with GitHub. Never selects anything. */
export async function storeAvailableRepositories(tx: Tx, organisationId: string, installation: InstallationRow, repositories: readonly GithubRepoSummary[], complete: boolean): Promise<void> {
  for (const repo of repositories) {
    await tx
      .insert(githubRepository)
      .values({ organisationId, installationId: installation.id, repoId: repo.id, fullName: repo.fullName, defaultBranch: repo.defaultBranch })
      .onConflictDoUpdate({ target: [githubRepository.organisationId, githubRepository.repoId], set: { fullName: repo.fullName, defaultBranch: repo.defaultBranch, installationId: installation.id } });
  }
  // A repository GitHub no longer shows us is dropped, unless the list was cut short.
  if (complete) {
    const keep = repositories.map((repo) => repo.id);
    await tx
      .delete(githubRepository)
      .where(keep.length > 0 ? and(eq(githubRepository.installationId, installation.id), notInArray(githubRepository.repoId, keep)) : eq(githubRepository.installationId, installation.id));
  }
}

/**
 * GitHub's callback. The state is checked and used up first; then GitHub itself, with the app's
 * own token, confirms the installation exists and says whose account it is. Only then is it
 * stored. Nothing is selected: the customer chooses repositories here afterwards.
 */
export async function completeInstall(
  deps: AppDeps,
  input: { organisationId: string; userId: string; installationId: number; state: string; meta: RequestMeta },
): Promise<GithubConnection> {
  const parts = githubParts(deps);
  if (!parts) throw errors.invalidState(NOT_CONNECTED);
  const { organisationId, installationId } = input;
  const { issuedAt } = await consumeInstallState(deps, input.state, { organisationId, userId: input.userId });

  let info;
  try {
    info = await parts.client.getInstallation(installationId);
  } catch (error) {
    throw githubProblem(error);
  }

  const [claimed] = await deps.db.withSystem((tx) =>
    tx.select({ tenantId: githubInstallationIndex.tenantId }).from(githubInstallationIndex).where(eq(githubInstallationIndex.installationId, installationId)),
  );
  if (claimed && claimed.tenantId !== organisationId) {
    throw errors.invalidState('This GitHub account is already connected to another Vero organisation.');
  }

  const installation = await deps.db.withOrg(organisationId, async (tx) => {
    const existing = await loadInstallation(tx);
    if (existing && existing.installationId !== installationId) {
      throw errors.invalidState('Another GitHub account is already connected. Disconnect it first.');
    }
    // The installation number arrives in the address, so anyone could type another account's.
    // A new one is only taken if GitHub says it was installed or changed after this link was
    // made, which is what following the link does. See docs/ENGINE-STATUS.md (open decisions).
    if (!existing && (!info.lastChangedAt || info.lastChangedAt.getTime() < issuedAt.getTime() - INSTALL_CLOCK_SKEW_MS)) {
      throw errors.invalidInput("This GitHub installation wasn't made from this link. Start connecting GitHub again, and install or configure the app on GitHub's page.");
    }
    const now = deps.now();
    const values = {
      accountLogin: info.accountLogin,
      accountType: info.accountType,
      status: info.suspended ? 'suspended' : 'active',
      suspendedAt: info.suspended ? now : null,
      lastError: null,
    };
    const [row] = existing
      ? await tx.update(githubInstallation).set(values).where(eq(githubInstallation.id, existing.id)).returning()
      : await tx.insert(githubInstallation).values({ organisationId, installationId, connectedBy: input.userId, connectedAt: now, ...values }).returning();
    if (!row) throw errors.internal();
    await writeAudit(tx, {
      organisationId,
      actorId: input.userId,
      action: 'github.connected',
      target: row.id,
      metadata: { installationId, accountType: info.accountType, suspended: info.suspended, reconnected: existing !== undefined },
      meta: input.meta,
    });
    return row;
  });
  await deps.db.withSystem((tx) => tx.insert(githubInstallationIndex).values({ installationId, tenantId: organisationId }).onConflictDoNothing());

  if (!info.suspended) {
    try {
      const listed = await parts.client.listRepositories(installationId, AVAILABLE_LIST_MAX);
      await deps.db.withOrg(organisationId, (tx) => storeAvailableRepositories(tx, organisationId, installation, listed.repositories, listed.complete));
    } catch (error) {
      const message = error instanceof GithubError ? error.message : "We couldn't list the repositories just now.";
      await deps.db.withOrg(organisationId, (tx) => tx.update(githubInstallation).set({ lastError: message }).where(eq(githubInstallation.id, installation.id)));
    }
  }
  return githubStatus(deps, organisationId);
}

/** The customer's own choice of repositories, each tied to the company it is evidence for. Everything else is left out. */
export async function selectRepositories(
  deps: AppDeps,
  input: { organisationId: string; userId: string; body: GithubSelectRepositoriesBody; meta: RequestMeta },
): Promise<GithubConnection> {
  const parts = githubParts(deps);
  if (!parts) throw errors.invalidState(NOT_CONNECTED);
  const { organisationId, body } = input;
  const ids = body.repositories.map((item) => item.repositoryId);
  if (new Set(ids).size !== ids.length) throw errors.invalidInput('Each repository can only be included once.');
  if (ids.length > parts.config.maxReposPerOrg) throw errors.invalidInput(`You can include up to ${parts.config.maxReposPerOrg} repositories.`);

  return deps.db.withOrg(organisationId, async (tx) => {
    const installation = await loadInstallation(tx);
    if (!installation) throw errors.invalidState(NOT_SET_UP);
    const known = ids.length === 0 ? [] : await tx.select({ repoId: githubRepository.repoId }).from(githubRepository).where(and(eq(githubRepository.installationId, installation.id), inArray(githubRepository.repoId, ids)));
    if (known.length !== ids.length) throw errors.invalidInput('One of those repositories is not shared with Vero on GitHub.');
    // A followed company can't take evidence, so no repository is tied to one.
    for (const companyId of new Set(body.repositories.map((item) => item.companyId))) requireOwned(await requireCompany(tx, companyId));

    await tx.update(githubRepository).set({ selected: false, companyId: null }).where(eq(githubRepository.installationId, installation.id));
    for (const item of body.repositories) {
      await tx
        .update(githubRepository)
        .set({ selected: true, companyId: item.companyId })
        .where(and(eq(githubRepository.installationId, installation.id), eq(githubRepository.repoId, item.repositoryId)));
    }
    await writeAudit(tx, {
      organisationId,
      actorId: input.userId,
      action: 'github.repositories_selected',
      target: installation.id,
      metadata: { selected: ids.length, companies: new Set(body.repositories.map((item) => item.companyId)).size },
      meta: input.meta,
    });
    return connectionView(deps, tx);
  });
}

/** Queues a read of the chosen repositories. Limited per organisation per hour. */
export async function queueSync(deps: AppDeps, input: { organisationId: string; userId: string | null }): Promise<{ queued: boolean; message: string }> {
  if (!githubParts(deps)) throw errors.invalidState(NOT_CONNECTED);
  const { organisationId } = input;
  const ready = await deps.db.withOrg(organisationId, async (tx) => {
    const installation = await loadInstallation(tx);
    if (!installation) throw errors.invalidState(NOT_SET_UP);
    if (installation.status !== 'active') throw errors.invalidState(statusMessage(installation));
    const [chosen] = await tx.select({ id: githubRepository.id }).from(githubRepository).where(and(eq(githubRepository.installationId, installation.id), eq(githubRepository.selected, true))).limit(1);
    return chosen !== undefined;
  });
  if (!ready) return { queued: false, message: 'Include at least one repository first. Nothing is read until you do.' };
  await deps.limiter.enforce(`github-sync:org:${organisationId}`, SYNC_REQUESTS_PER_ORG_PER_HOUR, 60 * 60);
  await deps.queue.enqueue('github.sync', { organisationId, requestedBy: input.userId });
  return { queued: true, message: "We're reading the repositories you included. The files we find will wait for you to confirm them." };
}

/** Facts already derived stay, marked as coming from a GitHub connection that is gone. */
export async function markFactsDisconnected(tx: Tx): Promise<void> {
  await tx
    .update(schema.fact)
    .set({ sourceName: GITHUB_DISCONNECTED_SOURCE_NAME })
    .where(and(eq(schema.fact.origin, 'connector'), eq(schema.fact.source, GITHUB_SOURCE)));
}

/**
 * Removes our stored rows and, best effort, the app from the customer's GitHub account. Facts
 * already derived are kept and marked as from a disconnected source; documents already in the
 * vault stay there, like any upload, until a person deletes them.
 */
export async function disconnect(deps: AppDeps, input: { organisationId: string; userId: string; meta: RequestMeta }): Promise<GithubConnection> {
  const { organisationId } = input;
  const installation = await deps.db.withOrg(organisationId, (tx) => loadInstallation(tx));
  if (!installation) return githubStatus(deps, organisationId);

  const removedOnGithub = deps.github ? await deps.github.deleteInstallation(installation.installationId) : false;
  await deps.db.withOrg(organisationId, async (tx) => {
    const repositories = await tx.select({ id: githubRepository.id }).from(githubRepository).where(eq(githubRepository.installationId, installation.id));
    await tx.delete(githubInstallation).where(eq(githubInstallation.id, installation.id));
    await markFactsDisconnected(tx);
    await writeAudit(tx, {
      organisationId,
      actorId: input.userId,
      action: 'github.disconnected',
      target: installation.id,
      metadata: { installationId: installation.installationId, repositories: repositories.length, removedOnGithub },
      meta: input.meta,
    });
  });
  await deps.db.withSystem((tx) => tx.delete(githubInstallationIndex).where(eq(githubInstallationIndex.installationId, installation.installationId)));
  return githubStatus(deps, organisationId);
}

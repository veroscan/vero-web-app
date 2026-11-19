import { GITHUB_ALLOWED_PATHS, GithubError, type GithubAppClient, type GithubRepoDetails } from '@vero/connectors';
import type { FactValue } from '@vero/rules';
import { and, eq } from 'drizzle-orm';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError } from '../../http/errors';
import { writeAudit } from '../audit/service';
import { entitlementsOf } from '../plans/service';
import { requireCompany, slotsFor } from '../scans/facts';
import { addGithubDocument } from '../vault/service';
import { GITHUB_SOURCE, GITHUB_SOURCE_NAME, githubParts, loadInstallation, type InstallationRow, type RepositoryRow } from './service';

const { githubInstallation, githubRepository, fact, document } = schema;

/** What we remember per allowlisted path, for conditional requests. Never content. */
interface PathState {
  present: boolean;
  sha?: string;
  size?: number;
  etag?: string | null;
  tooLarge?: boolean;
  /** package.json only: its declared licence, so an unchanged file needn't be read again. */
  declaredLicence?: string | null;
}
type FileState = Record<string, PathState>;

interface RepoReading {
  repo: RepositoryRow;
  details: GithubRepoDetails;
  commitSha: string | null;
  state: FileState;
  /** Files read this time, held in memory only while this sync runs. */
  found: Map<string, { content: Buffer; sha: string }>;
  contributors: { logins: string[]; complete: boolean };
}

const inThreePlaces = (name: string) => ['', '.github/', 'docs/'].map((dir) => `${dir}${name}`);
const LICENCE_FILES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING'];
const MANIFESTS = ['package.json', 'requirements.txt', 'go.mod', 'Cargo.toml', 'pom.xml', 'Gemfile', 'composer.json'];

const OPEN_SOURCE_SLOTS = ['de_open_source_policy', 'gb_open_source'] as const;
const SECURITY_POLICY_SLOTS = ['de_security_policies', 'gb_security_policies', 'ng_security_policies'] as const;

/**
 * Which files may become vault documents, and the only slots each may be suggested for.
 * Deliberately narrow: a repository's licence and notice files for the open source slot, and
 * its security policy for the security policies slot. Nothing else: CODEOWNERS, CONTRIBUTING,
 * the CLA template, PRIVACY, TERMS and manifests are read only as facts. The person still
 * confirms each document, exactly like an upload.
 */
export const GITHUB_DOCUMENT_SLOTS: Readonly<Record<string, readonly string[]>> = {
  ...Object.fromEntries([...LICENCE_FILES, 'NOTICE'].map((path) => [path, OPEN_SOURCE_SLOTS])),
  ...Object.fromEntries(inThreePlaces('SECURITY.md').map((path) => [path, SECURITY_POLICY_SLOTS])),
};

const BUDGET_SPENT = 'We read as many files as we may in one go. This repository will be read next time.';
const UNEXPECTED = "We couldn't read this repository just now. We will try again next time.";

class BudgetSpent extends Error {}

function cleanLicenceText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.replace(/[^\x20-\x7e]/g, '').trim().slice(0, 100);
  return text.length > 0 ? text : null;
}

/** The licence field a package.json declares, as written. Nothing is concluded from it. */
export function declaredPackageLicence(content: Buffer): string | null {
  try {
    const parsed = JSON.parse(content.toString('utf8')) as Record<string, unknown>;
    const direct = cleanLicenceText(parsed['license']);
    if (direct) return direct;
    const nested = parsed['license'] as Record<string, unknown> | undefined;
    const nestedType = nested && typeof nested === 'object' ? cleanLicenceText(nested['type']) : null;
    if (nestedType) return nestedType;
    if (Array.isArray(parsed['licenses'])) {
      const types = (parsed['licenses'] as unknown[]).map((item) => cleanLicenceText((item as Record<string, unknown> | null)?.['type'])).filter((item): item is string => item !== null);
      if (types.length > 0) return types.join(', ').slice(0, 100);
    }
    return null;
  } catch {
    return null;
  }
}

async function readRepository(client: GithubAppClient, installationId: number, repo: RepositoryRow, budget: { remaining: number }): Promise<RepoReading> {
  const details = await client.getRepository(installationId, repo.repoId);
  const previous = (repo.fileState ?? {}) as FileState;
  const commitSha = details.defaultBranch ? await client.getBranchSha(installationId, details.fullName, details.defaultBranch) : null;
  const state: FileState = {};
  const found = new Map<string, { content: Buffer; sha: string }>();
  if (commitSha) {
    // All or nothing per repository, so a repository is never half read.
    if (budget.remaining < GITHUB_ALLOWED_PATHS.length) throw new BudgetSpent();
    for (const path of GITHUB_ALLOWED_PATHS) {
      budget.remaining -= 1;
      const before = previous[path];
      const file = await client.getFile(installationId, details.fullName, path, commitSha, before?.present ? (before.etag ?? null) : null);
      switch (file.status) {
        case 'found':
          state[path] = {
            present: true,
            sha: file.sha,
            size: file.size,
            etag: file.etag,
            ...(path === 'package.json' ? { declaredLicence: declaredPackageLicence(file.content) } : {}),
          };
          found.set(path, { content: file.content, sha: file.sha });
          break;
        case 'not_modified':
          state[path] = before ?? { present: true };
          break;
        case 'too_large':
          state[path] = { present: true, tooLarge: true, size: file.size };
          break;
        default:
          state[path] = { present: false };
      }
    }
  }
  const contributors = await client.listContributors(installationId, details.fullName);
  return { repo, details, commitSha, state, found, contributors };
}

function present(reading: RepoReading, paths: readonly string[]): boolean {
  return paths.some((path) => reading.state[path]?.present === true);
}

const sorted = (values: Iterable<string>) => [...new Set(values)].sort();

/**
 * The company's GitHub facts, across the repositories read this time. Lists of repository
 * names, never a judgement: nothing here says a licence is right, wrong or compatible.
 * `confidence` is how sure we are GitHub said it, not that it is legally so.
 */
export function companyFacts(readings: readonly RepoReading[], notChecked: readonly string[]): { key: string; value: FactValue; confidence: number }[] {
  const name = (reading: RepoReading) => reading.details.fullName;
  const where = (paths: readonly string[]) => sorted(readings.filter((reading) => present(reading, paths)).map(name));
  const logins = sorted(readings.flatMap((reading) => reading.contributors.logins));
  const pushed = readings.map((reading) => reading.details.pushedAt).filter((value): value is string => value !== null).sort();
  const latestPush = pushed.at(-1);
  const facts: { key: string; value: FactValue; confidence: number }[] = [
    { key: 'github.repositories', value: sorted(readings.map(name)), confidence: 1 },
    // GitHub's own licence detection is a best guess from the file's text.
    { key: 'github.licence_spdx', value: readings.map((reading) => `${name(reading)}: ${reading.details.licenceSpdx ?? 'none detected'}`).sort(), confidence: 0.8 },
    { key: 'github.licence_file_repos', value: where(LICENCE_FILES), confidence: 1 },
    { key: 'github.security_policy_repos', value: where(inThreePlaces('SECURITY.md')), confidence: 1 },
    { key: 'github.codeowners_repos', value: where(inThreePlaces('CODEOWNERS')), confidence: 1 },
    { key: 'github.contributing_repos', value: where(inThreePlaces('CONTRIBUTING.md')), confidence: 1 },
    { key: 'github.cla_repos', value: where(['CLA.md']), confidence: 1 },
    { key: 'github.private_repos', value: sorted(readings.filter((reading) => reading.details.visibility !== 'public').map(name)), confidence: 1 },
    { key: 'github.public_repos', value: sorted(readings.filter((reading) => reading.details.visibility === 'public').map(name)), confidence: 1 },
    { key: 'github.archived_repos', value: sorted(readings.filter((reading) => reading.details.archived).map(name)), confidence: 1 },
    { key: 'github.contributor_count', value: logins.length, confidence: 1 },
    // Public logins, for a person to compare against IP assignments. Not a finding on its own.
    { key: 'github.contributor_logins', value: logins.slice(0, 200), confidence: 1 },
    { key: 'github.contributor_list_complete', value: readings.every((reading) => reading.contributors.complete) && logins.length <= 200, confidence: 1 },
    {
      key: 'github.package_json_licences',
      value: readings
        .map((reading) => ({ repo: name(reading), licence: reading.state['package.json']?.declaredLicence ?? null }))
        .filter((item) => item.licence !== null)
        .map((item) => `${item.repo}: ${item.licence}`)
        .sort(),
      confidence: 1,
    },
    { key: 'github.dependency_manifests', value: readings.flatMap((reading) => MANIFESTS.filter((path) => reading.state[path]?.present === true).map((path) => `${name(reading)}: ${path}`)).sort(), confidence: 1 },
  ];
  if (latestPush) facts.push({ key: 'github.last_pushed_on', value: latestPush.slice(0, 10), confidence: 1 });
  if (notChecked.length > 0) facts.push({ key: 'github.repositories_not_checked', value: sorted(notChecked), confidence: 1 });
  return facts;
}

function documentFileName(fullName: string, path: string): string {
  const repo = fullName.split('/')[1] ?? 'repository';
  return `${repo}-${path.replace(/\//g, '-').replace(/^\./, '')}`;
}

/** New versions of the matched files become vault documents waiting for a person. Same version twice is skipped. */
async function addDocuments(
  deps: AppDeps,
  organisationId: string,
  companyId: string,
  reading: RepoReading,
  allowedSlots: ReadonlySet<string>,
  fetchedAt: Date,
): Promise<number> {
  let added = 0;
  for (const [path, file] of reading.found) {
    const candidateSlots = (GITHUB_DOCUMENT_SLOTS[path] ?? []).filter((slot) => allowedSlots.has(slot));
    if (candidateSlots.length === 0) continue;
    const externalRef = `github:${reading.repo.repoId}:${path}@${file.sha}`;
    const [already] = await deps.db.withOrg(organisationId, (tx) =>
      tx.select({ id: document.id }).from(document).where(and(eq(document.companyId, companyId), eq(document.externalRef, externalRef))).limit(1),
    );
    if (already) continue;
    try {
      await addGithubDocument(deps, {
        organisationId,
        companyId,
        data: file.content,
        fileName: documentFileName(reading.details.fullName, path),
        origin: { repository: reading.details.fullName, path, commitSha: reading.commitSha, fetchedAt: fetchedAt.toISOString() },
        externalRef,
        candidateSlots,
      });
      added += 1;
    } catch (error) {
      // A file that isn't plain text is simply not taken.
      if (!(error instanceof AppError)) throw error;
    }
  }
  return added;
}

export interface GithubSyncRun {
  repositories: number;
  read: number;
  failed: number;
  notChecked: number;
  documentsAdded: number;
  filesRequested: number;
}

/**
 * The github.sync job. Reads each chosen repository: its metadata and only the allowlisted
 * files. One repository failing never stops the others. A removed or suspended installation
 * stops the run, with a plain reason on the installation; so does GitHub asking us to wait.
 * A repository that couldn't be read is "not checked yet": never a pass, never a fail.
 */
export async function runGithubSync(deps: AppDeps, payload: { organisationId: string; requestedBy: string | null }): Promise<GithubSyncRun | null> {
  const parts = githubParts(deps);
  if (!parts) return null;
  const { organisationId } = payload;
  const setup = await deps.db.withOrg(organisationId, async (tx) => {
    const installation = await loadInstallation(tx);
    if (!installation || installation.status !== 'active') return null;
    const repositories = await tx
      .select()
      .from(githubRepository)
      .where(and(eq(githubRepository.installationId, installation.id), eq(githubRepository.selected, true)))
      .orderBy(githubRepository.fullName)
      .limit(parts.config.maxReposPerOrg);
    const vault = (await entitlementsOf(tx, organisationId, deps.config)).vault;
    return { installation, repositories, vault };
  });
  if (!setup) return null;
  const { installation, repositories } = setup;

  const budget = { remaining: parts.config.maxFilesPerSync };
  const run: GithubSyncRun = { repositories: repositories.length, read: 0, failed: 0, notChecked: 0, documentsAdded: 0, filesRequested: 0 };
  const readings = new Map<string, RepoReading[]>();
  const missed = new Map<string, string[]>();
  let stopped: GithubError | null = null;
  const now = deps.now();

  for (const repo of repositories) {
    const companyId = repo.companyId;
    if (!companyId) continue;
    const miss = (message: string) => {
      missed.set(companyId, [...(missed.get(companyId) ?? []), repo.fullName]);
      return deps.db.withOrg(organisationId, (tx) => tx.update(githubRepository).set({ lastError: message }).where(eq(githubRepository.id, repo.id)));
    };
    if (stopped) {
      run.notChecked += 1;
      await miss(stopped.message);
      continue;
    }
    const before = budget.remaining;
    try {
      const reading = await readRepository(parts.client, installation.installationId, repo, budget);
      await deps.db.withOrg(organisationId, (tx) =>
        tx
          .update(githubRepository)
          .set({ fullName: reading.details.fullName, defaultBranch: reading.details.defaultBranch, fileState: reading.state, lastSyncedAt: now, lastError: null })
          .where(eq(githubRepository.id, repo.id)),
      );
      readings.set(companyId, [...(readings.get(companyId) ?? []), reading]);
      run.read += 1;
    } catch (error) {
      if (error instanceof BudgetSpent) {
        run.notChecked += 1;
        await miss(BUDGET_SPENT);
        continue;
      }
      const problem = error instanceof GithubError ? error : null;
      run.failed += 1;
      await miss(problem?.message ?? UNEXPECTED);
      if (problem && (problem.kind === 'revoked' || problem.kind === 'suspended' || problem.kind === 'rate_limited')) stopped = problem;
    } finally {
      run.filesRequested += before - budget.remaining;
    }
  }

  // Facts and documents, company by company. A company with nothing read keeps its facts as they were.
  for (const [companyId, list] of readings) {
    try {
      const allowedSlots = await deps.db.withOrg(organisationId, async (tx) => {
        const company = await requireCompany(tx, companyId);
        await tx.delete(fact).where(and(eq(fact.companyId, companyId), eq(fact.origin, 'connector'), eq(fact.source, GITHUB_SOURCE)));
        await tx.insert(fact).values(
          companyFacts(list, missed.get(companyId) ?? []).map((item) => ({
            organisationId,
            companyId,
            key: item.key,
            value: item.value,
            origin: 'connector',
            originRef: `github:installation:${installation.installationId}`,
            source: GITHUB_SOURCE,
            sourceName: GITHUB_SOURCE_NAME,
            sourceUrl: `${parts.config.webUrl}/${installation.accountLogin}`,
            // Read from the customer's own repository: evidence, not an official register.
            evidenceMethod: 'document',
            retrievedAt: now,
            verificationTier: 4,
            matchConfidence: String(item.confidence),
          })),
        );
        return setup.vault ? new Set((await slotsFor(tx, company)).map((slot) => slot.id)) : new Set<string>();
      });
      for (const reading of list) run.documentsAdded += await addDocuments(deps, organisationId, companyId, reading, allowedSlots, now);
    } catch {
      run.failed += 1;
    }
  }

  const stop: GithubError | null = stopped;
  await deps.db.withOrg(organisationId, async (tx) => {
    const update: Partial<InstallationRow> = { lastSyncedAt: now, lastError: stop?.message ?? null };
    if (stop?.kind === 'revoked') update.status = 'revoked';
    if (stop?.kind === 'suspended') Object.assign(update, { status: 'suspended', suspendedAt: now });
    await tx.update(githubInstallation).set(update).where(eq(githubInstallation.id, installation.id));
    // Counts only: never a file, a name from a file, a token or a key.
    await writeAudit(tx, { organisationId, actorId: payload.requestedBy, action: 'github.synced', target: installation.id, metadata: { ...run, stoppedBy: stop?.kind ?? null } });
  });
  if (stop && stop.kind !== 'rate_limited') parts.client.forgetInstallation(installation.installationId);
  return run;
}

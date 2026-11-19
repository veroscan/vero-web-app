import { createHash, createHmac, generateKeyPairSync, randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspect } from 'node:util';
import { GITHUB_ALLOWED_PATHS } from '@vero/connectors';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config';
import { schema } from '../src/db';
import { addMember, errorOf, startHarness, testEnv, type Harness, type SignedIn } from './support/harness';
import { createCompany, setPlan } from './support/product';

/**
 * The GitHub connection, against a mocked GitHub. The RSA key is made here for this run and
 * never stored. Every name is fictional (Kestrel Pay). No request leaves the process.
 */
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const PEM = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const WEBHOOK_SECRET = randomBytes(24).toString('hex');
const API = 'https://api.github.test';
const TOKEN = `ghs_${randomBytes(18).toString('hex')}`;
const COMMIT = 'a'.repeat(40);
const MIT_TEXT = 'MIT License\n\nCopyright (c) 2026 Kestrel Pay Ltd\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction.';
const SECURITY_TEXT = '# Security policy\n\nPlease report vulnerabilities in Kestrel Pay to our security team through the private reporting form. We respond within five working days.';

const ENV = {
  GITHUB_APP_ID: '123456',
  GITHUB_APP_SLUG: 'vero-scan-test',
  GITHUB_APP_PRIVATE_KEY: PEM.replace(/\n/g, '\\n'),
  GITHUB_WEBHOOK_SECRET: WEBHOOK_SECRET,
  GITHUB_API_URL: API,
  GITHUB_MAX_REPOS_PER_ORG: '3',
};

interface FakeRepo {
  id: number;
  fullName: string;
  visibility: 'private' | 'public';
  archived: boolean;
  spdx: string | null;
  files: Record<string, string>;
  contributors: string[];
  /** Answer this status for the repository itself. */
  fail?: number;
}

/** A small stand-in for GitHub's REST API. It records every request it receives. */
class FakeGithub {
  calls: { method: string; path: string; auth: string }[] = [];
  installations = new Map<number, { login: string; type: string; repos: number[]; revoked?: boolean; createdAt?: string }>();
  repos = new Map<number, FakeRepo>();
  rateLimitRepo: number | null = null;

  fetch = async (url: string, init?: RequestInit): Promise<Response> => {
    const method = init?.method ?? 'GET';
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const parsed = new URL(url);
    const path = decodeURIComponent(parsed.pathname);
    this.calls.push({ method, path, auth: headers['authorization'] ?? '' });
    const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
      new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...extra } });

    let match = /^\/app\/installations\/(\d+)$/.exec(path);
    if (match) {
      const installation = this.installations.get(Number(match[1]));
      if (!installation) return json(404, { message: 'Not Found' });
      if (method === 'DELETE') return json(204, null);
      const changed = installation.createdAt ?? new Date().toISOString();
      return json(200, { id: Number(match[1]), account: { login: installation.login, type: installation.type }, suspended_at: null, created_at: changed, updated_at: changed });
    }
    match = /^\/app\/installations\/(\d+)\/access_tokens$/.exec(path);
    if (match) {
      const installation = this.installations.get(Number(match[1]));
      if (!installation || installation.revoked) return json(404, { message: 'Not Found' });
      return json(201, { token: TOKEN, expires_at: new Date(Date.now() + 3600_000).toISOString() });
    }
    const revoked = [...this.installations.values()].some((item) => item.revoked);
    if (revoked && headers['authorization']?.startsWith('token ')) return json(401, { message: 'Bad credentials' });
    if (path === '/installation/repositories') {
      const installation = [...this.installations.values()][0];
      const list = (installation?.repos ?? []).map((id) => this.repos.get(id)).filter((repo): repo is FakeRepo => repo !== undefined);
      return json(200, { total_count: list.length, repositories: list.map((repo) => ({ id: repo.id, full_name: repo.fullName, default_branch: 'main', private: repo.visibility === 'private' })) });
    }
    match = /^\/repositories\/(\d+)$/.exec(path);
    if (match) {
      const repo = this.repos.get(Number(match[1]));
      if (!repo) return json(404, { message: 'Not Found' });
      if (this.rateLimitRepo === repo.id) return json(403, { message: 'API rate limit exceeded' }, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600) });
      if (repo.fail) return json(repo.fail, { message: 'Server Error' });
      return json(200, {
        id: repo.id, full_name: repo.fullName, default_branch: 'main', private: repo.visibility === 'private', visibility: repo.visibility,
        archived: repo.archived, pushed_at: '2026-11-01T09:30:00Z', license: repo.spdx ? { spdx_id: repo.spdx } : null,
      });
    }
    const repo = [...this.repos.values()].find((candidate) => path.startsWith(`/repos/${candidate.fullName}/`));
    if (repo) {
      const rest = path.slice(`/repos/${repo.fullName}/`.length);
      if (rest === 'branches/main') return json(200, { name: 'main', commit: { sha: COMMIT } });
      if (rest === 'contributors') return json(200, repo.contributors.map((login) => ({ login, type: 'User' })).concat([{ login: 'kestrel-bot', type: 'Bot' }]));
      if (rest.startsWith('contents/')) {
        const file = rest.slice('contents/'.length);
        const content = repo.files[file];
        if (content === undefined) return json(404, { message: 'Not Found' });
        const data = Buffer.from(content);
        return json(200, { type: 'file', size: data.length, sha: createHash('sha1').update(data).digest('hex'), encoding: 'base64', content: data.toString('base64') }, { etag: `"${file}-v1"` });
      }
    }
    return json(404, { message: 'Not Found' });
  };

  contentPaths(): string[] {
    return this.calls.filter((call) => call.path.includes('/contents/')).map((call) => call.path.split('/contents/')[1] ?? '');
  }
}

function sign(body: string, secret = WEBHOOK_SECRET): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

describe('GitHub connection', () => {
  let h: Harness;
  let github: FakeGithub;
  let owner: SignedIn;
  let companyId: string;
  /** A fresh GitHub installation number per test: one installation belongs to one organisation. */
  let iid = 1000 + Math.floor(Math.random() * 1_000_000);
  const base = () => `/v1/organisations/${owner.organisationId}/connections/github`;

  beforeAll(async () => {
    github = new FakeGithub();
    h = await startHarness(ENV, { githubFetch: (url, init) => github.fetch(url, init) });
  });
  afterAll(() => h.close());

  beforeEach(async () => {
    github.calls = [];
    github.installations.clear();
    github.repos.clear();
    github.rateLimitRepo = null;
    h.setNow(null);
    iid += 1;
    owner = await h.signIn();
    await setPlan(h, owner.organisationId, 'growth');
    companyId = (await createCompany(h, owner, { legalName: 'Kestrel Pay Ltd' })).id;
  });

  function addInstallation(installationId: number, repos: FakeRepo[]): void {
    for (const repo of repos) github.repos.set(repo.id, repo);
    github.installations.set(installationId, { login: 'kestrel-pay', type: 'Organization', repos: repos.map((repo) => repo.id) });
  }

  const repo = (id: number, name: string, extra: Partial<FakeRepo> = {}): FakeRepo => ({
    id, fullName: `kestrel-pay/${name}`, visibility: 'private', archived: false, spdx: 'MIT',
    files: { LICENSE: MIT_TEXT, '.github/SECURITY.md': SECURITY_TEXT, 'package.json': JSON.stringify({ name, license: 'MIT' }), CODEOWNERS: '* @kestrel-pay/core' },
    contributors: ['amara-okafor', 'tunde-bello'], ...extra,
  });

  async function startState(who: SignedIn = owner): Promise<string> {
    const started = await h.request('POST', `/v1/organisations/${who.organisationId}/connections/github/start`, { cookie: who.cookie });
    expect(started.statusCode).toBe(200);
    const body = started.json<{ status: string; installUrl: string }>();
    expect(body.status).toBe('ready');
    expect(body.installUrl.startsWith('https://github.com/apps/vero-scan-test/installations/new?state=')).toBe(true);
    return new URL(body.installUrl).searchParams.get('state') ?? '';
  }

  function callback(state: string, installationId = iid, who: SignedIn = owner) {
    return h.request('GET', `/v1/organisations/${who.organisationId}/connections/github/callback?installation_id=${installationId}&state=${encodeURIComponent(state)}`, { cookie: who.cookie });
  }

  async function connect(repos: FakeRepo[], installationId = iid): Promise<void> {
    addInstallation(installationId, repos);
    const response = await callback(await startState(), installationId);
    expect(response.statusCode, response.body).toBe(200);
  }

  async function include(ids: number[]) {
    return h.request('PUT', `${base()}/repositories`, { cookie: owner.cookie, body: { repositories: ids.map((repositoryId) => ({ repositoryId, companyId })) } });
  }

  async function syncNow(): Promise<void> {
    const queued = await h.request('POST', `${base()}/sync`, { cookie: owner.cookie });
    expect(queued.statusCode, queued.body).toBe(202);
    expect(queued.json<{ queued: boolean }>().queued).toBe(true);
    await h.queue.drain();
  }

  async function auditActions(): Promise<string[]> {
    const { rows } = await h.admin.query<{ action: string }>('SELECT action FROM audit_log WHERE organisation_id = $1 ORDER BY seq', [owner.organisationId]);
    return rows.map((row) => row.action);
  }

  describe('connecting', () => {
    it('stores the installation GitHub confirms, with no repository included by default', async () => {
      await connect([repo(1, 'api'), repo(2, 'web')]);
      const status = await h.request('GET', base(), { cookie: owner.cookie });
      const body = status.json<{ status: string; account: { login: string }; repositories: { selected: boolean; state: string }[]; notice: string }>();
      expect(body.status).toBe('active');
      expect(body.account.login).toBe('kestrel-pay');
      expect(body.repositories).toHaveLength(2);
      expect(body.repositories.every((item) => !item.selected && item.state === 'not_included')).toBe(true);
      expect(body.notice).toMatch(/not a legal check/);
      // The installation was checked with the app's own JWT, not taken on trust from the query.
      expect(github.calls.find((call) => call.path === `/app/installations/${iid}`)?.auth).toMatch(/^Bearer /);
      expect(await auditActions()).toContain('github.connected');
      // Nothing was read from any repository yet.
      expect(github.contentPaths()).toEqual([]);
    });

    it("refuses someone else's installation number, made before the link", async () => {
      addInstallation(iid, [repo(1, 'api')]);
      const installation = github.installations.get(iid);
      if (installation) installation.createdAt = '2025-01-01T00:00:00Z';
      const response = await callback(await startState());
      expect(response.statusCode).toBe(400);
      expect(errorOf(response).message).toMatch(/wasn't made from this link/);
      const { rows } = await h.admin.query('SELECT 1 FROM github_installation WHERE organisation_id = $1', [owner.organisationId]);
      expect(rows).toHaveLength(0);
    });

    it('refuses an installation GitHub does not know', async () => {
      const response = await callback(await startState(), 999);
      expect(response.statusCode).toBe(400);
      const { rows } = await h.admin.query('SELECT 1 FROM github_installation WHERE organisation_id = $1', [owner.organisationId]);
      expect(rows).toHaveLength(0);
    });
  });

  describe('the install state', () => {
    beforeEach(() => addInstallation(iid, [repo(1, 'api')]));

    it("GitHub's fixed Setup URL passes the person on to their organisation's callback", async () => {
      const state = await startState();
      const setup = await h.request('GET', `/v1/connections/github/setup?installation_id=${iid}&state=${encodeURIComponent(state)}&setup_action=install`, { cookie: owner.cookie });
      expect(setup.statusCode).toBe(302);
      expect(setup.headers['location']).toBe(`${base()}/callback?installation_id=${iid}&state=${encodeURIComponent(state)}`);
      expect((await h.request('GET', `/v1/connections/github/setup?installation_id=${iid}&state=${'x'.repeat(40)}`)).statusCode).toBe(400);
      // Passing on used nothing up.
      expect((await callback(state)).statusCode).toBe(200);
    });

    it('is single use', async () => {
      const state = await startState();
      expect((await callback(state)).statusCode).toBe(200);
      const again = await callback(state);
      expect(again.statusCode).toBe(400);
      expect(errorOf(again).message).toMatch(/expired, was already used/);
    });

    it('expires after 10 minutes', async () => {
      const state = await startState();
      h.setNow(new Date(Date.now() + 11 * 60 * 1000));
      expect((await callback(state)).statusCode).toBe(400);
    });

    it('is refused when changed in any way', async () => {
      const state = await startState();
      const [body, signature] = state.split('.');
      const flipped = `${body}.${(signature ?? '').replace(/^./, (c) => (c === 'a' ? 'b' : 'a'))}`;
      expect((await callback(flipped)).statusCode).toBe(400);
      expect((await callback(`${body}x.${signature}`)).statusCode).toBe(400);
      // The good one still works: a bad attempt doesn't use it up.
      expect((await callback(state)).statusCode).toBe(200);
    });

    it('only works for the organisation and person it was made for', async () => {
      const state = await startState();
      const other = await h.signIn();
      // Another organisation's owner, on their own organisation's path.
      const elsewhere = await callback(state, iid, other);
      expect(elsewhere.statusCode).toBe(400);
      // And on ours: they aren't a member.
      const ours = await h.request('GET', `${base()}/callback?installation_id=${iid}&state=${encodeURIComponent(state)}`, { cookie: other.cookie });
      expect(ours.statusCode).toBe(403);
      // Another admin of ours cannot use the owner's link either.
      const admin = await addMember(h, owner, 'admin');
      expect((await callback(state, iid, admin)).statusCode).toBe(400);
      expect((await callback(state)).statusCode).toBe(200);
    });
  });

  describe('who may do it', () => {
    it('only owners and admins', async () => {
      const member = await addMember(h, owner, 'member');
      const lawyer = await addMember(h, owner, 'lawyer');
      for (const who of [member, lawyer]) {
        expect((await h.request('GET', base(), { cookie: who.cookie })).statusCode).toBe(403);
        expect((await h.request('POST', `${base()}/start`, { cookie: who.cookie })).statusCode).toBe(403);
        expect((await h.request('POST', `${base()}/sync`, { cookie: who.cookie })).statusCode).toBe(403);
        expect((await h.request('DELETE', base(), { cookie: who.cookie })).statusCode).toBe(403);
        expect((await h.request('PUT', `${base()}/repositories`, { cookie: who.cookie, body: { repositories: [] } })).statusCode).toBe(403);
      }
      const admin = await addMember(h, owner, 'admin');
      expect((await h.request('GET', base(), { cookie: admin.cookie })).statusCode).toBe(200);
      expect((await h.request('GET', base())).statusCode).toBe(401);
    });
  });

  describe('choosing repositories', () => {
    it('keeps only what is chosen, within the cap', async () => {
      await connect([repo(1, 'api'), repo(2, 'web'), repo(3, 'docs'), repo(4, 'infra')]);
      expect((await include([1, 2, 3, 4])).statusCode).toBe(400);
      expect((await include([99])).statusCode).toBe(400);
      const chosen = await include([2]);
      expect(chosen.statusCode).toBe(200);
      const repositories = chosen.json<{ repositories: { repositoryId: number; selected: boolean; companyId: string | null }[] }>().repositories;
      expect(repositories.filter((item) => item.selected)).toEqual([expect.objectContaining({ repositoryId: 2, companyId })]);
      const { rows } = await h.admin.query<{ metadata: Record<string, unknown> }>(`SELECT metadata FROM audit_log WHERE organisation_id = $1 AND action = 'github.repositories_selected'`, [owner.organisationId]);
      expect(rows[0]?.metadata).toEqual({ selected: 1, companies: 1 });
    });

    it('refuses to tie a repository to a company this team only follows', async () => {
      await connect([repo(1, 'api')]);
      await h.admin.query(`UPDATE company SET relationship = 'follow' WHERE id = $1`, [companyId]);
      const refused = await include([1]);
      expect(refused.statusCode).toBe(403);
      expect(errorOf(refused)).toEqual({ code: 'follows_only', message: "You follow this company, so you can see its public record but can't add evidence for it." });
      const { rows } = await h.admin.query(`SELECT 1 FROM github_repository WHERE company_id = $1`, [companyId]);
      expect(rows).toHaveLength(0);
    });

    it('a sync with nothing chosen reads nothing', async () => {
      await connect([repo(1, 'api')]);
      const response = await h.request('POST', `${base()}/sync`, { cookie: owner.cookie });
      expect(response.json<{ queued: boolean }>().queued).toBe(false);
      await h.queue.drain();
      expect(github.calls.filter((call) => call.path.startsWith('/repos') || call.path.startsWith('/repositories'))).toEqual([]);
    });
  });

  describe('syncing', () => {
    it('reads only allowlisted files and writes facts and unconfirmed vault documents', async () => {
      await connect([repo(1, 'api'), repo(2, 'web', { visibility: 'public', spdx: null, files: { NOTICE: 'Kestrel Pay includes third-party notices.' }, contributors: ['amara-okafor'] })]);
      expect((await include([1, 2])).statusCode).toBe(200);
      await syncNow();

      const allowed = new Set(GITHUB_ALLOWED_PATHS);
      expect(github.contentPaths().length).toBe(GITHUB_ALLOWED_PATHS.length * 2);
      expect(github.contentPaths().every((path) => allowed.has(path))).toBe(true);

      const { rows: facts } = await h.admin.query<{ key: string; value: unknown; evidence_method: string; verification_tier: number; source: string }>(
        `SELECT key, value, evidence_method, verification_tier, source FROM fact WHERE company_id = $1 AND source = 'github'`,
        [companyId],
      );
      const value = (key: string) => facts.find((row) => row.key === key)?.value;
      expect(facts.every((row) => row.evidence_method === 'document' && row.verification_tier === 4)).toBe(true);
      expect(value('github.repositories')).toEqual(['kestrel-pay/api', 'kestrel-pay/web']);
      expect(value('github.licence_spdx')).toEqual(['kestrel-pay/api: MIT', 'kestrel-pay/web: none detected']);
      expect(value('github.licence_file_repos')).toEqual(['kestrel-pay/api']);
      expect(value('github.security_policy_repos')).toEqual(['kestrel-pay/api']);
      expect(value('github.codeowners_repos')).toEqual(['kestrel-pay/api']);
      expect(value('github.cla_repos')).toEqual([]);
      expect(value('github.public_repos')).toEqual(['kestrel-pay/web']);
      expect(value('github.private_repos')).toEqual(['kestrel-pay/api']);
      expect(value('github.contributor_count')).toBe(2);
      expect(value('github.contributor_logins')).toEqual(['amara-okafor', 'tunde-bello']);
      expect(value('github.package_json_licences')).toEqual(['kestrel-pay/api: MIT']);
      expect(value('github.last_pushed_on')).toBe('2026-11-01');
      // Facts only: nothing about legal sufficiency, and no vault facts until a person confirms.
      expect(facts.some((row) => /compliant|compatible|verified/.test(JSON.stringify(row.value)))).toBe(false);
      const { rows: vaultFacts } = await h.admin.query(`SELECT key FROM fact WHERE company_id = $1 AND key LIKE 'vault.%'`, [companyId]);
      expect(vaultFacts).toEqual([]);

      const { rows: docs } = await h.admin.query<{ id: string; status: string; source: string; mime: string; external_ref: string; extracted_fields: Record<string, unknown> }>(
        `SELECT id, status, source, mime, external_ref, extracted_fields FROM document WHERE company_id = $1 ORDER BY file_name`,
        [companyId],
      );
      // The two licence-type files and one security policy; CODEOWNERS and package.json are facts only.
      expect(docs.map((doc) => doc.external_ref.split('@')[0]).sort()).toEqual(['github:1:.github/SECURITY.md', 'github:1:LICENSE', 'github:2:NOTICE']);
      expect(docs.every((doc) => doc.status === 'needs_confirmation' && doc.source === 'github')).toBe(true);
      const license = docs.find((doc) => doc.external_ref.startsWith('github:1:LICENSE'));
      expect(license?.extracted_fields['github']).toMatchObject({ repository: 'kestrel-pay/api', path: 'LICENSE', commitSha: COMMIT });
      expect(license?.extracted_fields['candidateSlots']).toEqual(['gb_open_source']);
      // The classifier only suggests the slot the file was matched to.
      expect([null, 'gb_open_source']).toContain(license?.extracted_fields['suggestedSlot']);

      const dto = await h.request('GET', `/v1/documents/${license?.id}`, { cookie: owner.cookie });
      expect(dto.json<{ fromGithub: { path: string }; state: string }>()).toMatchObject({ fromGithub: { path: 'LICENSE' }, state: 'needs_confirmation' });

      // The confirm path is the same as for an upload: only now does it count.
      const confirmed = await h.request('POST', `/v1/documents/${license?.id}/confirm`, { cookie: owner.cookie, body: { slotKey: 'gb_open_source' } });
      expect(confirmed.statusCode, confirmed.body).toBe(200);
      await h.queue.drain();
      const { rows: filed } = await h.admin.query<{ status: string; classification_confirmed_by: string }>(`SELECT status, classification_confirmed_by FROM document WHERE id = $1`, [license?.id]);
      expect(filed[0]).toEqual({ status: 'filed', classification_confirmed_by: owner.userId });

      // A second sync of unchanged files adds no new documents and sends ETags.
      github.calls = [];
      await syncNow();
      const { rows: again } = await h.admin.query(`SELECT 1 FROM document WHERE company_id = $1`, [companyId]);
      expect(again).toHaveLength(3);

      const actions = await auditActions();
      expect(actions.filter((action) => action === 'github.synced')).toHaveLength(2);
      const { rows: synced } = await h.admin.query<{ metadata: Record<string, unknown> }>(`SELECT metadata FROM audit_log WHERE organisation_id = $1 AND action = 'github.synced' ORDER BY seq LIMIT 1`, [owner.organisationId]);
      expect(synced[0]?.metadata).toMatchObject({ repositories: 2, read: 2, failed: 0, documentsAdded: 3 });
    });

    it('one repository failing does not stop the others, and a 404 is a plain "couldn\'t read", never a result', async () => {
      await connect([repo(1, 'api', { fail: 500 }), repo(2, 'web'), repo(3, 'gone')]);
      expect((await include([1, 2, 3])).statusCode).toBe(200);
      github.repos.delete(3);
      await syncNow();
      const status = (await h.request('GET', base(), { cookie: owner.cookie })).json<{ repositories: { fullName: string; state: string; lastError: string | null }[] }>();
      const byName = new Map(status.repositories.map((item) => [item.fullName, item]));
      expect(byName.get('kestrel-pay/web')?.state).toBe('checked');
      expect(byName.get('kestrel-pay/api')).toMatchObject({ state: 'problem', lastError: "We couldn't reach GitHub just now." });
      expect(byName.get('kestrel-pay/gone')?.state).toBe('problem');
      expect(byName.get('kestrel-pay/gone')?.lastError).toMatch(/not there/);
      const { rows } = await h.admin.query<{ key: string; value: unknown }>(`SELECT key, value FROM fact WHERE company_id = $1 AND key IN ('github.repositories', 'github.repositories_not_checked')`, [companyId]);
      expect(Object.fromEntries(rows.map((row) => [row.key, row.value]))).toEqual({
        'github.repositories': ['kestrel-pay/web'],
        'github.repositories_not_checked': ['kestrel-pay/api', 'kestrel-pay/gone'],
      });
    });

    it('a revoked installation stops the run and says so plainly', async () => {
      await connect([repo(1, 'api'), repo(2, 'web')]);
      await include([1, 2]);
      const installation = github.installations.get(iid);
      if (installation) installation.revoked = true;
      await syncNow();
      const status = (await h.request('GET', base(), { cookie: owner.cookie })).json<{ status: string; lastError: string; repositories: { state: string }[] }>();
      expect(status.status).toBe('revoked');
      expect(status.lastError).toMatch(/no longer installed/);
      expect(status.repositories.every((item) => item.state === 'problem')).toBe(true);
      const { rows } = await h.admin.query(`SELECT 1 FROM fact WHERE company_id = $1 AND source = 'github'`, [companyId]);
      expect(rows).toHaveLength(0);
      expect((await h.request('POST', `${base()}/sync`, { cookie: owner.cookie })).statusCode).toBe(409);
    });

    it('backs off when GitHub says the rate limit is spent, leaving the rest "not checked yet"', async () => {
      await connect([repo(1, 'api'), repo(2, 'web')]);
      await include([1, 2]);
      github.rateLimitRepo = 1;
      await syncNow();
      expect(github.calls.filter((call) => call.path === '/repositories/2')).toHaveLength(0);
      const status = (await h.request('GET', base(), { cookie: owner.cookie })).json<{ lastError: string; repositories: { lastError: string }[] }>();
      expect(status.lastError).toMatch(/slow down/);
      expect(status.repositories.every((item) => /slow down/.test(item.lastError))).toBe(true);
    });
  });

  describe('disconnecting', () => {
    it('removes our rows, asks GitHub to remove the app, and keeps facts marked as disconnected', async () => {
      await connect([repo(1, 'api')]);
      await include([1]);
      await syncNow();
      const response = await h.request('DELETE', base(), { cookie: owner.cookie });
      expect(response.statusCode).toBe(200);
      expect(response.json<{ status: string }>().status).toBe('not_connected');
      expect(github.calls.some((call) => call.method === 'DELETE' && call.path === `/app/installations/${iid}`)).toBe(true);
      for (const table of ['github_installation', 'github_repository']) {
        const { rows } = await h.admin.query(`SELECT 1 FROM ${table} WHERE organisation_id = $1`, [owner.organisationId]);
        expect(rows, table).toHaveLength(0);
      }
      const { rows: index } = await h.admin.query('SELECT 1 FROM github_installation_index WHERE installation_id = $1', [iid]);
      expect(index).toHaveLength(0);
      const { rows: facts } = await h.admin.query<{ source_name: string }>(`SELECT DISTINCT source_name FROM fact WHERE company_id = $1 AND source = 'github'`, [companyId]);
      expect(facts).toEqual([{ source_name: 'GitHub (disconnected)' }]);
      expect(await auditActions()).toContain('github.disconnected');
    });
  });

  describe('the webhook', () => {
    const post = (body: string, headers: Record<string, string>) =>
      h.request('POST', '/v1/webhooks/github', { origin: null, body, headers: { 'content-type': 'application/json', ...headers } });
    const event = (action: string, id = iid) => JSON.stringify({ action, installation: { id } });

    it('acts on a correctly signed suspension, once per delivery', async () => {
      await connect([repo(1, 'api'), repo(2, 'web')]);
      const body = event('suspend');
      const headers = { 'x-hub-signature-256': sign(body), 'x-github-event': 'installation', 'x-github-delivery': 'delivery-kestrel-1' };
      expect((await post(body, headers)).statusCode).toBe(200);
      const { rows } = await h.admin.query<{ status: string }>('SELECT status FROM github_installation WHERE organisation_id = $1', [owner.organisationId]);
      expect(rows[0]?.status).toBe('suspended');
      // Replayed: acknowledged, not handled again.
      expect((await post(body, headers)).statusCode).toBe(200);
      expect((await auditActions()).filter((action) => action === 'github.suspended')).toHaveLength(1);

      const unsuspend = event('unsuspend');
      expect((await post(unsuspend, { ...headers, 'x-github-delivery': 'delivery-kestrel-2', 'x-hub-signature-256': sign(unsuspend) })).statusCode).toBe(200);
      expect((await auditActions())).toContain('github.unsuspended');

      const removed = JSON.stringify({ action: 'removed', installation: { id: iid }, repositories_removed: [{ id: 2 }], repositories_added: [] });
      expect((await post(removed, { 'x-github-event': 'installation_repositories', 'x-github-delivery': 'delivery-kestrel-3', 'x-hub-signature-256': sign(removed) })).statusCode).toBe(200);
      const { rows: left } = await h.admin.query<{ repo_id: string }>('SELECT repo_id FROM github_repository WHERE organisation_id = $1', [owner.organisationId]);
      expect(left.map((row) => Number(row.repo_id))).toEqual([1]);
    });

    it('refuses a bad or missing signature, on the raw bytes', async () => {
      await connect([repo(1, 'api')]);
      const body = event('suspend');
      const headers = { 'x-github-event': 'installation', 'x-github-delivery': 'delivery-kestrel-4' };
      expect((await post(body, headers)).statusCode).toBe(401);
      expect((await post(body, { ...headers, 'x-hub-signature-256': sign(body, 'not-the-secret-kestrel') })).statusCode).toBe(401);
      // Same JSON, different bytes: the signature no longer matches.
      expect((await post(` ${body}`, { ...headers, 'x-hub-signature-256': sign(body) })).statusCode).toBe(401);
      expect((await post(body, { ...headers, 'x-hub-signature-256': 'sha256=zz' })).statusCode).toBe(401);
      const { rows } = await h.admin.query<{ status: string }>('SELECT status FROM github_installation WHERE organisation_id = $1', [owner.organisationId]);
      expect(rows[0]?.status).toBe('active');
    });

    it('acknowledges and ignores every other event', async () => {
      const body = JSON.stringify({ ref: 'refs/heads/main' });
      const response = await post(body, { 'x-hub-signature-256': sign(body), 'x-github-event': 'push', 'x-github-delivery': 'delivery-kestrel-5' });
      expect(response.statusCode).toBe(202);
    });
  });

  describe('tenancy and secrets', () => {
    it('one organisation never sees another organisation\'s connection, even in the database', async () => {
      await connect([repo(1, 'api')]);
      const other = await h.signIn();
      const theirs = await h.request('GET', `/v1/organisations/${other.organisationId}/connections/github`, { cookie: other.cookie });
      expect(theirs.json<{ status: string }>().status).toBe('not_connected');
      expect((await h.request('GET', base(), { cookie: other.cookie })).statusCode).toBe(403);
      const seen = await h.deps.db.withOrg(other.organisationId, async (tx) => ({
        installations: await tx.select().from(schema.githubInstallation),
        repositories: await tx.select().from(schema.githubRepository),
        index: await tx.select().from(schema.githubInstallationIndex),
      }));
      expect(seen).toEqual({ installations: [], repositories: [], index: [] });
      const mine = await h.deps.db.withOrg(owner.organisationId, (tx) => tx.select().from(schema.githubInstallation).where(eq(schema.githubInstallation.installationId, iid)));
      expect(mine).toHaveLength(1);
      await expect(
        h.deps.db.withOrg(other.organisationId, (tx) =>
          tx.insert(schema.githubRepository).values({ organisationId: owner.organisationId, installationId: mine[0]?.id ?? '', repoId: 5, fullName: 'kestrel-pay/x' }),
        ),
      ).rejects.toThrow();
      // A second organisation can't claim the same GitHub installation.
      const state = (
        await h.request('POST', `/v1/organisations/${other.organisationId}/connections/github/start`, { cookie: other.cookie })
      ).json<{ installUrl: string }>().installUrl;
      const claim = await callback(new URL(state).searchParams.get('state') ?? '', iid, other);
      expect(claim.statusCode).toBe(409);
    });

    it('never writes the token, key, webhook secret or file contents to logs, audit, the database or errors', async () => {
      await connect([repo(1, 'api')]);
      await include([1]);
      await syncNow();
      const bad = await h.request('POST', '/v1/webhooks/github', { origin: null, body: '{}', headers: { 'content-type': 'application/json', 'x-hub-signature-256': sign('{}', 'x'.repeat(30)) } });
      expect(bad.body).not.toContain(WEBHOOK_SECRET);
      const pemBody = PEM.split('\n')[1] ?? '';
      const logs = h.logs.join('\n');
      for (const secret of [TOKEN, WEBHOOK_SECRET, pemBody]) {
        expect(logs).not.toContain(secret);
        expect(JSON.stringify(h.config)).not.toContain(secret);
      }
      const { rows: audit } = await h.admin.query<{ metadata: unknown }>('SELECT metadata FROM audit_log WHERE organisation_id = $1', [owner.organisationId]);
      const auditText = JSON.stringify(audit);
      for (const secret of [TOKEN, WEBHOOK_SECRET, pemBody, 'Permission is hereby granted', 'Security policy']) expect(auditText).not.toContain(secret);
      for (const table of ['github_installation', 'github_repository', 'fact', 'document', 'github_installation_index', 'github_webhook_delivery', 'rate_limit_bucket']) {
        const { rows } = await h.admin.query<{ found: string }>(`SELECT count(*)::text AS found FROM ${table} t WHERE t::text LIKE '%' || $1 || '%'`, [TOKEN]);
        expect(rows[0]?.found, table).toBe('0');
      }
      const { rows: state } = await h.admin.query<{ file_state: unknown }>('SELECT file_state FROM github_repository WHERE organisation_id = $1', [owner.organisationId]);
      expect(JSON.stringify(state)).not.toContain('Permission is hereby granted');
    });
  });
});

describe('GitHub connection, switched off', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());

  it('says "not connected yet" and reads nothing when the app is not configured', async () => {
    const owner = await h.signIn();
    const base = `/v1/organisations/${owner.organisationId}/connections/github`;
    const status = await h.request('GET', base, { cookie: owner.cookie });
    expect(status.statusCode).toBe(200);
    const off = status.json<{ status: string; message: string }>();
    expect(off.status).toBe('not_connected');
    expect(off.message).toMatch(/isn't connected yet/);
    const start = await h.request('POST', `${base}/start`, { cookie: owner.cookie });
    expect(start.json<{ status: string; installUrl: string | null }>()).toMatchObject({ status: 'not_connected', installUrl: null });
    expect((await h.request('POST', `${base}/sync`, { cookie: owner.cookie })).statusCode).toBe(409);
    expect((await h.request('PUT', `${base}/repositories`, { cookie: owner.cookie, body: { repositories: [] } })).statusCode).toBe(409);
    const body = JSON.stringify({ action: 'suspend', installation: { id: 1 } });
    const hook = await h.request('POST', '/v1/webhooks/github', { origin: null, body, headers: { 'content-type': 'application/json', 'x-hub-signature-256': sign(body) } });
    expect(hook.statusCode).toBe(404);
    expect(h.deps.github).toBeUndefined();
  });
});

describe('GitHub settings', () => {
  it('switch the connection on only when all four are set', () => {
    expect(loadConfig(testEnv(ENV)).github).toBeDefined();
    for (const name of ['GITHUB_APP_ID', 'GITHUB_APP_SLUG', 'GITHUB_APP_PRIVATE_KEY', 'GITHUB_WEBHOOK_SECRET']) {
      expect(loadConfig(testEnv({ ...ENV, [name]: '' })).github, name).toBeUndefined();
    }
  });

  it('refuse an address that is not https, except a local one', () => {
    expect(() => loadConfig(testEnv({ ...ENV, GITHUB_API_URL: 'http://api.github.test' }))).toThrow(/GITHUB_API_URL must use https/);
    expect(loadConfig(testEnv({ ...ENV, GITHUB_API_URL: 'http://localhost:9999' })).github?.apiUrl).toBe('http://localhost:9999');
  });

  it('read the key from a file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'vero-gh-'));
    try {
      const file = join(dir, 'app.pem');
      writeFileSync(file, PEM);
      const config = loadConfig(testEnv({ ...ENV, GITHUB_APP_PRIVATE_KEY: '', GITHUB_APP_PRIVATE_KEY_FILE: file }));
      expect(config.github?.privateKey.asymmetricKeyType).toBe('rsa');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('never repeat the key or the secret, in errors or when printed', () => {
    const broken = '-----BEGIN PRIVATE KEY-----\nkestrel-not-a-real-key\n-----END PRIVATE KEY-----';
    let message = '';
    try {
      loadConfig(testEnv({ ...ENV, GITHUB_APP_PRIVATE_KEY: broken }));
    } catch (error) {
      message = String(error);
    }
    expect(message).toMatch(/could not be read/);
    expect(message).not.toContain('kestrel-not-a-real-key');
    const config = loadConfig(testEnv(ENV));
    const printed = [JSON.stringify(config), inspect(config, { depth: 10 }), String(config.github?.webhookSecret)].join('\n');
    expect(printed).not.toContain(WEBHOOK_SECRET);
    expect(printed).not.toContain(PEM.split('\n')[1] ?? '');
  });
});

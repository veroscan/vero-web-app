/**
 * The only repository paths we ever ask GitHub for. GitHub's "Contents: read" permission
 * cannot be limited by path, so this list is the limit, enforced in code before any request
 * is made. Never source code, never other paths, never history, never secrets.
 *
 * Root only, for licences, notices, policies and dependency manifests. The community files
 * GitHub itself looks for in three places (the root, `.github/` and `docs/`) are asked for
 * in exactly those three places.
 */
const ROOT_ONLY = [
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
  'COPYING',
  'NOTICE',
  'PRIVACY.md',
  'TERMS.md',
  'CLA.md',
  'package.json',
  'requirements.txt',
  'go.mod',
  'Cargo.toml',
  'pom.xml',
  'Gemfile',
  'composer.json',
] as const;

const COMMUNITY_FILES = ['SECURITY.md', 'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'CODEOWNERS'] as const;
const COMMUNITY_DIRS = ['', '.github/', 'docs/'] as const;

export const GITHUB_ALLOWED_PATHS: readonly string[] = Object.freeze([
  ...ROOT_ONLY,
  ...COMMUNITY_DIRS.flatMap((dir) => COMMUNITY_FILES.map((name) => `${dir}${name}`)),
]);

const ALLOWED = new Set<string>(GITHUB_ALLOWED_PATHS);

/** Files over this are skipped with a plain reason, never read. */
export const GITHUB_MAX_FILE_BYTES = 256 * 1024;

export class PathNotAllowedError extends Error {
  override name = 'PathNotAllowedError';
  constructor() {
    // The path itself is not repeated: it came from somewhere we don't trust.
    super('That file is not on the list of files we may read from GitHub.');
  }
}

/** Exact match only: no case folding, no `..`, no leading slash, no query or fragment. */
export function isAllowedGithubPath(path: string): boolean {
  return ALLOWED.has(path);
}

export function assertAllowedGithubPath(path: string): void {
  if (!isAllowedGithubPath(path)) throw new PathNotAllowedError();
}

/** GitHub's `owner/name`. Letters, digits, `.`, `-` and `_` only, so nothing can change the URL's shape. */
export function isValidRepoFullName(fullName: string): boolean {
  const name = fullName.split('/')[1];
  return /^[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/.test(fullName) && name !== '.' && name !== '..';
}

/** A branch name or commit sha as GitHub returns it, kept to characters that are safe in a URL path. */
export function isSafeRef(ref: string): boolean {
  return /^[A-Za-z0-9._/-]{1,255}$/.test(ref) && !ref.includes('..') && !ref.startsWith('/') && !ref.endsWith('/');
}

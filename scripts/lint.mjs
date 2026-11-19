/**
 * `npm run lint`: ESLint with the same config and the same rules as before, run once per
 * workspace in its own Node process, one after the other, then once for everything left over
 * (root scripts, config files, and any new top-level folder, so nothing can escape lint).
 *
 * Why: type-aware rules build one TypeScript program per tsconfig, and a single process keeps
 * every program in memory at the same time (about 2.2 GB for this repo). One process per
 * workspace frees each program before the next starts, so the peak is the largest single
 * workspace. See "Lint" in docs/BUILD-BRIEF.md.
 *
 * Extra arguments are passed through to ESLint (for example `npm run lint -- --fix`).
 * Every pass runs even if an earlier one fails, so one run shows every problem.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const eslintBin = join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
const extraArgs = process.argv.slice(2);

const workspaces = ['apps', 'packages'].flatMap((group) =>
  readdirSync(join(root, group), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(root, group, entry.name, 'package.json')))
    .map((entry) => `${group}/${entry.name}`),
);

const passes = [
  ...workspaces.map((workspace) => ({ name: workspace, args: [workspace] })),
  {
    name: 'everything else',
    args: ['.', ...workspaces.flatMap((workspace) => ['--ignore-pattern', `${workspace}/**`])],
  },
];

let worst = 0;
for (const pass of passes) {
  const started = Date.now();
  process.stdout.write(`\nlint: ${pass.name}\n`);
  const result = spawnSync(
    process.execPath,
    ['--max-old-space-size=3072', eslintBin, ...pass.args, '--max-warnings', '0', ...extraArgs],
    { cwd: root, stdio: 'inherit' },
  );
  const status = result.status ?? 2;
  const seconds = ((Date.now() - started) / 1000).toFixed(0);
  process.stdout.write(`lint: ${pass.name} ${status === 0 ? 'ok' : `FAILED (exit ${status})`} in ${seconds}s\n`);
  worst = Math.max(worst, status);
}

process.exit(worst);

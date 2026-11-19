/**
 * Fails on GPL, AGPL, LGPL, SSPL and the banned list. Reads package-lock.json, because it
 * lists every dependency including those for other platforms that are not installed here.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { findViolations, type PackageInfo } from './licence-check';

interface LockEntry {
  version?: string;
  license?: string;
  link?: boolean;
}

const lockPath = resolve(import.meta.dirname, '..', 'package-lock.json');
const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as { packages: Record<string, LockEntry> };

const packages: PackageInfo[] = [];
for (const [path, entry] of Object.entries(lock.packages)) {
  const marker = 'node_modules/';
  const at = path.lastIndexOf(marker);
  // The root and workspace folders are our own code, not dependencies.
  if (at === -1 || entry.link) continue;
  packages.push({ name: path.slice(at + marker.length), version: entry.version ?? '0.0.0', license: entry.license });
}

const violations = findViolations(packages);
if (violations.length > 0) {
  console.error(`Licence check FAILED: ${violations.length} problem(s) in ${packages.length} packages.`);
  for (const v of violations) console.error(`  ${v.name}@${v.version}: ${v.reason}`);
  process.exit(1);
}
console.log(`Licence check passed: ${packages.length} packages, none GPL, AGPL, LGPL, SSPL or banned.`);

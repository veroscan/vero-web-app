export interface PackageInfo {
  name: string;
  version: string;
  license: string | undefined;
}

export interface Violation {
  name: string;
  version: string;
  reason: string;
}

const COPYLEFT = /\b(A?GPL|LGPL|SSPL)\b/i;

/** Banned by name whatever licence they declare (brief: Poppler, Ghostscript, MuPDF, node-canvas, sharp). */
const BANNED_NAMES = [
  /^sharp$/,
  /^@img\/sharp-/,
  /^canvas$/,
  /^node-canvas$/,
  /poppler/i,
  /ghostscript/i,
  /^gs$/,
  /mupdf/i,
];

/** A package needs only one acceptable side of an OR. AND means every part applies. */
export function licenceIsAllowed(expression: string): boolean {
  const alternatives = expression.replace(/[()]/g, ' ').split(/\s+OR\s+/i);
  return alternatives.some((alternative) => !COPYLEFT.test(alternative));
}

function isBannedRedis(pkg: PackageInfo): boolean {
  // The npm client called "redis" is fine at low majors; Redis 8 itself is what is banned.
  return pkg.name === 'redis' && Number(pkg.version.split('.')[0]) >= 8;
}

export function findViolations(packages: PackageInfo[]): Violation[] {
  const violations: Violation[] = [];
  for (const pkg of packages) {
    const base = { name: pkg.name, version: pkg.version };
    if (BANNED_NAMES.some((pattern) => pattern.test(pkg.name)) || isBannedRedis(pkg)) {
      violations.push({ ...base, reason: 'on the banned list' });
    } else if (!pkg.license) {
      violations.push({ ...base, reason: 'no licence declared' });
    } else if (!licenceIsAllowed(pkg.license)) {
      violations.push({ ...base, reason: `licence ${pkg.license}` });
    }
  }
  return violations;
}

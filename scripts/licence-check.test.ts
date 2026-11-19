import { describe, expect, it } from 'vitest';
import { findViolations, licenceIsAllowed } from './licence-check';

const pkg = (name: string, license: string | undefined, version = '1.0.0') => ({ name, version, license });

describe('licence check', () => {
  it.each(['GPL-3.0', 'GPL-2.0-only', 'AGPL-3.0-or-later', 'LGPL-2.1', 'SSPL-1.0', 'gpl-3.0'])('refuses %s', (license) => {
    expect(licenceIsAllowed(license)).toBe(false);
    expect(findViolations([pkg('some-package', license)])).toHaveLength(1);
  });

  it.each(['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC', '0BSD', '(MIT OR Apache-2.0)', 'MPL-2.0'])('allows %s', (license) => {
    expect(licenceIsAllowed(license)).toBe(true);
    expect(findViolations([pkg('some-package', license)])).toEqual([]);
  });

  it('accepts a dual licence when one side is permissive', () => {
    expect(licenceIsAllowed('(MIT OR GPL-3.0-or-later)')).toBe(true);
  });

  it('refuses a licence that requires copyleft with AND', () => {
    expect(licenceIsAllowed('MIT AND LGPL-3.0')).toBe(false);
  });

  it.each(['sharp', '@img/sharp-win32-x64', 'canvas', 'node-canvas', 'node-poppler', 'ghostscript-node', 'mupdf'])(
    'refuses banned package %s even with a permissive licence',
    (name) => {
      expect(findViolations([pkg(name, 'MIT')])[0]?.reason).toBe('on the banned list');
    },
  );

  it('refuses Redis 8 but not an older client', () => {
    expect(findViolations([pkg('redis', 'MIT', '8.0.0')])).toHaveLength(1);
    expect(findViolations([pkg('redis', 'MIT', '5.0.0')])).toEqual([]);
  });

  it('refuses a package that declares no licence', () => {
    expect(findViolations([pkg('mystery', undefined)])[0]?.reason).toBe('no licence declared');
  });
});

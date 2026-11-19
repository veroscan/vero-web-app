import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packContentHash } from '../apps/api/src/db/reference-sync';
import { buildReview, describeLogic, fileName, orderedPacks, REVIEW_DIR } from './rules-review';

describe('npm run rules:review', () => {
  const files = buildReview();
  const packs = orderedPacks();

  it('docs/review matches the rule code (run npm run rules:review after changing a rule)', () => {
    for (const [name, text] of files) expect(readFileSync(resolve(REVIEW_DIR, name), 'utf8'), name).toBe(text);
  });

  it('covers every pack and every rule once, International first', () => {
    expect(packs[0]?.jurisdiction).toBe('INTL');
    for (const pack of packs) expect(files.has(fileName(pack)), pack.jurisdiction).toBe(true);
    const rows = (files.get('decisions.csv') ?? '').trim().split('\r\n').slice(1);
    const ids = rows.map((row) => row.split(',')[3]);
    const all = packs.flatMap((pack) => pack.rules.map((rule) => rule.id));
    expect(ids).toEqual(all);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('prints the same fingerprint the reference sync stores, which an approval is given for', () => {
    for (const pack of packs) {
      const hash = packContentHash(pack);
      expect(files.get(fileName(pack))).toContain(hash);
      expect(files.get('decisions.csv')).toContain(`${pack.jurisdiction},${pack.version},${hash},`);
    }
  });

  it('says the logic in plain words', () => {
    expect(describeLogic({ '==': [{ var: 'registry.no.brreg.status' }, 'active'] })).toBe('`registry.no.brreg.status` is “active”');
    expect(describeLogic({ and: [{ var: 'a.b' }, { '!': { var: 'c.d' } }] })).toBe('all of: (`a.b`) and (not (`c.d`))');
    expect(describeLogic({ in: [{ var: 'x.y' }, ['a', 'b']] })).toBe('`x.y` is one of “a”, “b”');
    expect(describeLogic({ '>=': [{ var: 'x.n' }, 15] })).toBe('`x.n` is at least 15');
    expect(describeLogic(true)).toBe('yes');
  });

  it('never claims to be approved, and says it is not legal advice', () => {
    for (const pack of packs) {
      const text = files.get(fileName(pack)) ?? '';
      expect(text).toContain('Draft for lawyer review. Not legal advice.');
      expect(text).not.toMatch(/\bapproved by\b/i);
    }
  });
});

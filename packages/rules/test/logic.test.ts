import jsonLogic from 'json-logic-js';
import { describe, expect, it } from 'vitest';
import { evaluate, logicProblems, UNKNOWN, varsIn, type FactResolver, type Logic } from '../src/logic.js';

const facts: Record<string, unknown> = { a: true, b: false, n: 5, s: 'x', list: ['x', 'y'], empty: [] };
const resolve: FactResolver = (key) => (key in facts ? (facts[key] as never) : UNKNOWN);

describe('three-valued logic', () => {
  it('keeps a missing fact unknown instead of false', () => {
    expect(evaluate({ '==': [{ var: 'missing' }, true] }, resolve)).toBe(UNKNOWN);
    expect(evaluate({ '!': [{ var: 'missing' }] }, resolve)).toBe(UNKNOWN);
    expect(evaluate({ '>': [{ var: 'missing' }, 1] }, resolve)).toBe(UNKNOWN);
    expect(evaluate({ in: ['x', { var: 'missing' }] }, resolve)).toBe(UNKNOWN);
    expect(evaluate({ if: [{ var: 'missing' }, 1, 2] }, resolve)).toBe(UNKNOWN);
  });

  it('"and" is false if any part is false, even when another is unknown', () => {
    expect(evaluate({ and: [{ var: 'missing' }, { var: 'b' }] }, resolve)).toBe(false);
    expect(evaluate({ and: [{ var: 'missing' }, { var: 'a' }] }, resolve)).toBe(UNKNOWN);
    expect(evaluate({ and: [{ var: 'a' }, { var: 'n' }] }, resolve)).toBe(true);
  });

  it('"or" is true if any part is true, even when another is unknown', () => {
    expect(evaluate({ or: [{ var: 'missing' }, { var: 'a' }] }, resolve)).toBe(true);
    expect(evaluate({ or: [{ var: 'missing' }, { var: 'b' }] }, resolve)).toBe(UNKNOWN);
    expect(evaluate({ or: [{ var: 'b' }, { var: 'empty' }] }, resolve)).toBe(false);
  });

  it('compares strictly', () => {
    expect(evaluate({ '==': ['5', { var: 'n' }] }, resolve)).toBe(false);
    expect(evaluate({ '==': [5, { var: 'n' }] }, resolve)).toBe(true);
  });

  it('treats non-numbers as failing a numeric comparison', () => {
    expect(evaluate({ '>': [{ var: 's' }, 1] }, resolve)).toBe(false);
  });
});

describe('agrees with json-logic-js when every fact is known', () => {
  const cases: Logic[] = [
    { and: [{ var: 'a' }, { '>': [{ var: 'n' }, 3] }] },
    { or: [{ var: 'b' }, { '<': [{ var: 'n' }, 3] }] },
    { '!': [{ var: 'b' }] },
    { '!!': [{ var: 'list' }] },
    { '!!': [{ var: 'empty' }] },
    { in: ['y', { var: 'list' }] },
    { in: ['z', { var: 'list' }] },
    { '>=': [{ var: 'n' }, 5] },
    { '<=': [{ var: 'n' }, 4] },
    { '===': [{ var: 's' }, 'x'] },
    { '!==': [{ var: 's' }, 'x'] },
    { '!=': [{ var: 'n' }, 6] },
    { if: [{ var: 'a' }, 'yes', 'no'] },
    { if: [{ var: 'b' }, 'yes', 'no'] },
    { and: [{ or: [{ var: 'b' }, { var: 'a' }] }, { '!': [{ var: 'b' }] }] },
  ];

  it.each(cases.map((c) => [JSON.stringify(c), c] as const))('%s', (_name, logic) => {
    const ours = evaluate(logic, resolve);
    const theirs = jsonLogic.apply(logic, facts);
    // Standard "and"/"or" return the deciding value, not a boolean; compare truthiness of those.
    if (typeof theirs === 'string' && typeof ours === 'string') expect(ours).toBe(theirs);
    else expect(Boolean(ours)).toBe(jsonLogic.truthy(theirs));
  });
});

describe('validation', () => {
  it('accepts sound logic', () => {
    expect(logicProblems({ and: [{ '==': [{ var: 'a.b' }, true] }, { in: ['x', { var: 'c' }] }] })).toEqual([]);
    expect(logicProblems(true)).toEqual([]);
  });

  it('rejects operators outside the allowlist', () => {
    expect(logicProblems({ method: [{ var: 'a' }, 'toString'] })[0]).toContain('method');
    expect(logicProblems({ log: ['x'] })[0]).toContain('log');
  });

  it('rejects malformed operations', () => {
    expect(logicProblems({ '==': [1] })[0]).toContain('takes 2');
    expect(logicProblems({ and: [], or: [] })[0]).toContain('exactly one');
    expect(logicProblems({ var: ['a', 'default'] })[0]).toContain('no default');
    expect(logicProblems({ var: '' })[0]).toContain('exactly one fact');
    expect(logicProblems({ and: [{ nope: 1 }] })[0]).toContain('$.and[0]');
  });

  it('throws if asked to run an operator it does not know', () => {
    expect(() => evaluate({ nope: 1 }, resolve)).toThrow(/nope/);
  });

  it('lists the facts a rule reads', () => {
    expect(varsIn({ and: [{ var: 'a' }, { or: [{ '==': [{ var: 'b' }, 1] }, { var: 'a' }] }] }).sort()).toEqual(['a', 'b']);
  });
});

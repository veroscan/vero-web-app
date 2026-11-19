import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { JURISDICTIONS, loadPack, REGISTRY_FACT_KEYS, varsIn, type Rule } from '../src/index.js';

/**
 * The rules read facts the connectors write, and neither package depends on the other. The
 * contract that matters: every registry or website fact a rule reads is one a connector
 * publishes, and nothing in this package's mirror is a key no connector publishes any more.
 * A new source's keys don't have to be copied here until a rule reads them (copy them with
 * the whole list when you do). Skipped if this package is ever tested on its own.
 */
const file = join(import.meta.dirname, '..', '..', 'connectors', 'src', 'fact-keys.ts');

function logicOf(rule: Rule) {
  return [rule.applies_when, rule.satisfied_when, ...(rule.defect_when === undefined ? [] : [rule.defect_when]), ...(rule.verify_when === undefined ? [] : [rule.verify_when])];
}

describe.skipIf(!existsSync(file))('connector contract', () => {
  const published = async () => new Set(((await import(pathToFileURL(file).href)) as { CONNECTOR_FACT_KEYS: readonly string[] }).CONNECTOR_FACT_KEYS);

  it('every fact key mirrored here is one a connector publishes', async () => {
    const keys = await published();
    for (const key of REGISTRY_FACT_KEYS) expect(keys.has(key), key).toBe(true);
  });

  it('every registry or website fact a rule reads is published by a connector', async () => {
    const keys = await published();
    for (const jurisdiction of JURISDICTIONS) {
      for (const rule of loadPack(jurisdiction).rules) {
        for (const key of logicOf(rule).flatMap(varsIn)) {
          if (key.startsWith('registry.') || key.startsWith('web.')) expect(keys.has(key), `${rule.id} reads ${key}`).toBe(true);
        }
      }
    }
  });
});

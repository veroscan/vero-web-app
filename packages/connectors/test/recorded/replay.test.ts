import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONNECTOR_FACT_KEYS, loadSessions, replayEnv, replayFetch, SOURCE_FACTORIES } from '../../src/index.js';

/**
 * Replays every recorded real provider response through its connector's parser.
 *
 * Recordings come from `npm run connectors:record` (docs/RECORDING-REAL-RESPONSES.md) and live
 * in test/recorded/data/<source>/<session>/. Each session has the responses, redacted, and a
 * manifest of what was asked and what the connector made of it then. A replay must give the
 * same status and the same fact names, use only published fact names, and ask for nothing
 * that wasn't recorded. When there are no recordings yet, this file is skipped and says why.
 */

const DIR = process.env['CONNECTOR_REPLAY_DIR'] ?? join(import.meta.dirname, 'data');
const sessions = loadSessions(DIR);
const PUBLISHED: ReadonlySet<string> = new Set(CONNECTOR_FACT_KEYS);

describe('replay of recorded real provider responses', () => {
  if (sessions.length === 0) {
    it.skip(`skipped: no recorded responses in ${DIR} yet. Run npm run connectors:record once a provider key is set (docs/RECORDING-REAL-RESPONSES.md).`, () => undefined);
    return;
  }

  for (const session of sessions) {
    const { manifest } = session;
    it(`${manifest.connector}, recorded ${manifest.recordedAt}: parses to the same result`, async () => {
      const factory = SOURCE_FACTORIES[manifest.connector];
      expect(factory, `no connector called ${manifest.connector}`).toBeDefined();
      if (!factory) return;
      const fetchImpl = replayFetch(session);
      const connector = factory({ env: replayEnv(manifest), fetch: fetchImpl, retries: 0, sleep: async () => undefined });
      const result = await connector.lookup(manifest.ref);

      expect(fetchImpl.unmatched, 'the connector asked for something that was not recorded').toEqual([]);
      expect(result.status).toBe(manifest.expected.status);
      expect(result.facts.map((fact) => fact.key).sort()).toEqual(manifest.expected.factKeys);
      for (const fact of result.facts) expect(PUBLISHED.has(fact.key), fact.key).toBe(true);
    });
  }
});

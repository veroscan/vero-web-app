import { describe, expect, it } from 'vitest';
import {
  compactEuFsf, createReferenceRefresher, createSanctionsConnector, EU_FSF_COMPACT_FORMAT, parseEuFsfXml, redactBody, REFERENCE_KEYS, REFERENCE_SOURCES,
  type HeldCopy, type ReferenceCopy, type ReferenceKey, type ReferenceOptions,
} from '../src/index.js';
import { SANCTIONS_LISTS } from '../src/sources/sanctions.js';
import { sha256 } from '../src/runtime.js';
import { factMap, fakeFetch, noSleep, sample } from './helpers.js';

/**
 * Second-wave sources (docs/SECOND-WAVE-SOURCES.md). Only the EU consolidated financial
 * sanctions list was confirmed as official, free and machine-readable, so it is the only one
 * built, as the list "eu" of sanctions.lists. Every response here is a fictional sample
 * (test/samples/eu-fsf.xml): no real list is read.
 */

const NOW = new Date('2026-11-15T09:00:00Z');
const HOURS = 3_600_000;
const NOTHING: HeldCopy = { contentHash: null, etag: null, lastModified: null, rowCount: null };
const PEOPLE = ['FABULIX', 'Orsolya', 'Orsi', '1971', 'Invented Lane', 'Nowhere Town', 'orsi@'];
const ENTITIES = ['KUT Holdings', 'Kestrel Umbra Trading GmbH', 'Umbra Shipping Lines (Pty) Ltd'];

function memoryStore(copies: Partial<Record<ReferenceKey, { content: string; checkedAt: Date }>>): ReferenceOptions {
  return {
    maxAgeHours: 48,
    sanctionsMaxAgeHours: 24,
    store: {
      async latest(key) {
        const copy = copies[key];
        if (!copy) return null;
        const out: ReferenceCopy = { key, contentHash: sha256(copy.content), fetchedAt: copy.checkedAt, checkedAt: copy.checkedAt, rowCount: 1 };
        return out;
      },
      async content(key, hash) {
        const copy = copies[key];
        return copy && sha256(copy.content) === hash ? copy.content : null;
      },
    },
  };
}

describe('sanctions list "eu" (EU consolidated financial sanctions list)', () => {
  it('reads entities and their aliases, and skips people', () => {
    expect(parseEuFsfXml(sample('eu-fsf.xml')).sort()).toEqual(ENTITIES);
  });

  it('refuses a file in another shape, loudly', () => {
    expect(() => parseEuFsfXml('<other><thing/></other>')).toThrow("isn't in the format we expect");
    expect(() => parseEuFsfXml('{"format":"something else"}')).toThrow("isn't in the format we expect");
    expect(() => parseEuFsfXml('not xml at all')).toThrow("isn't in the format we expect");
  });

  it('the stored copy has entity names only: nothing about a person', () => {
    const compact = compactEuFsf(sample('eu-fsf.xml'));
    expect(JSON.parse(compact)).toEqual({ format: EU_FSF_COMPACT_FORMAT, generatedOn: '2026-11-12T18:00:00.000+01:00', names: ENTITIES });
    for (const word of PEOPLE) expect(compact).not.toContain(word);
    // Company addresses aren't kept either: the screen needs names only.
    expect(compact).not.toContain('Fictional Strasse');
    expect(parseEuFsfXml(compact)).toHaveLength(3);
  });

  it('is off until named in SANCTIONS_LISTS; the refresh job stores the compact copy every 6 hours', async () => {
    expect(REFERENCE_KEYS).toContain('sanctions.eu');
    expect(REFERENCE_SOURCES['sanctions.eu'].url({})).toBeUndefined();
    expect(REFERENCE_SOURCES['sanctions.eu'].url({ SANCTIONS_LISTS: 'ofac,uk,un,fr' })).toBeUndefined();
    expect(REFERENCE_SOURCES['sanctions.eu'].url({ SANCTIONS_LISTS: 'eu' })).toBe(SANCTIONS_LISTS.eu.url);
    expect(REFERENCE_SOURCES['sanctions.eu'].everyHours).toBe(6);

    const off = createReferenceRefresher({ env: {}, userAgent: 'VeroScan-test', fetch: fakeFetch({}), sleep: noSleep, retries: 0, now: () => NOW });
    expect((await off.refresh('sanctions.eu', NOTHING)).kind).toBe('not_configured');

    const fetchImpl = fakeFetch({ 'xmlFullSanctionsList_1_1': sample('eu-fsf.xml') });
    const refresher = createReferenceRefresher({ env: { SANCTIONS_LISTS: 'eu' }, userAgent: 'VeroScan-test', fetch: fetchImpl, sleep: noSleep, retries: 0, now: () => NOW });
    const outcome = await refresher.refresh('sanctions.eu', NOTHING);
    expect(outcome.kind).toBe('replaced');
    if (outcome.kind !== 'replaced') return;
    expect(outcome.rowCount).toBe(3);
    for (const word of PEOPLE) expect(outcome.content).not.toContain(word);
    expect((fetchImpl.calls[0]?.init?.headers as Record<string, string>)['User-Agent']).toBe('VeroScan-test');
  });

  it('a match says it may be another business; a close name asks a person; never "sanctioned"', async () => {
    const reference = memoryStore({ 'sanctions.eu': { content: compactEuFsf(sample('eu-fsf.xml')), checkedAt: new Date(NOW.getTime() - 2 * HOURS) } });
    const connector = createSanctionsConnector({ env: { SANCTIONS_LISTS: 'eu' }, fetch: fakeFetch({}), now: () => NOW, reference });
    const exact = await connector.lookup({ name: 'Kestrel Umbra Trading GmbH', jurisdiction: 'GB' });
    expect(exact.status).toBe('found');
    expect(exact.message).toContain('It may be another business with the same name');
    expect(exact.message?.toLowerCase()).not.toContain('sanctioned');
    const close = await connector.lookup({ name: 'Kestrel Umbra Tradings GmbH', jurisdiction: 'GB' });
    expect(close.status).toBe('ambiguous');
    expect(close.message).toContain('A person needs to check it');
    // A person's name on the list is never screened or offered, however close.
    const person = await connector.lookup({ name: 'Orsolya Fabulix Ltd', jurisdiction: 'GB' });
    expect(person.status).toBe('not_found');
    const clean = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' });
    expect(clean.status).toBe('not_found');
    expect(factMap(clean)).toEqual({
      'registry.sanctions.lists_checked': ['EU consolidated financial sanctions list'],
      'registry.sanctions.match': false,
      'registry.sanctions.possible_match': false,
    });
    expect(clean.message).toContain('List last updated on 15 Nov 2026');
  });

  it('a stale copy is unavailable, never "no match", and nothing is downloaded', async () => {
    const reference = memoryStore({ 'sanctions.eu': { content: compactEuFsf(sample('eu-fsf.xml')), checkedAt: new Date(NOW.getTime() - 30 * HOURS) } });
    const fetchImpl = fakeFetch({});
    const connector = createSanctionsConnector({ env: { SANCTIONS_LISTS: 'eu' }, fetch: fetchImpl, now: () => NOW, reference });
    const result = await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' });
    expect(result.status).toBe('unavailable');
    expect(result.facts).toEqual([]);
    expect(fetchImpl.calls).toHaveLength(0);
  });

  it('with no stored copy, the download during a scan sends a plain User-Agent', async () => {
    const fetchImpl = fakeFetch({ 'xmlFullSanctionsList_1_1': sample('eu-fsf.xml') });
    const connector = createSanctionsConnector({ env: { SANCTIONS_LISTS: 'eu' }, fetch: fetchImpl, now: () => NOW });
    expect((await connector.lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' })).status).toBe('not_found');
    expect((fetchImpl.calls[0]?.init?.headers as Record<string, string>)['User-Agent']).toBe('VeroScan sanctions check');
  });

  it('recordings drop every person on the list, whole, and keep the entities', () => {
    const redacted = redactBody(sample('eu-fsf.xml'));
    for (const word of PEOPLE) expect(redacted).not.toContain(word);
    for (const name of ENTITIES) expect(redacted).toContain(name);
    expect(redacted).toContain('<sanctionEntity>[person]</sanctionEntity>');
  });
});

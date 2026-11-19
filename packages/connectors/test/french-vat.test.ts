import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createRechercheEntreprisesConnector, createViesVatConnector, deriveFrenchVatNumber, frenchVatKey, VIES_WORDS } from '../src/index.js';
import { factMap, fakeFetch, sample } from './helpers.js';

/**
 * French VAT. The number is worked out from the SIREN as a CANDIDATE for VIES: it never says a
 * company is registered for VAT. The formula and the two published pairs are checked here.
 */

const NOW = new Date('2026-11-16T09:00:00Z');
const RECORDING = new URL('./recorded/data/fr.recherche_entreprises/2026-11-15T07-18-15-464Z/001.json', import.meta.url);

function recordedBody(): string {
  return (JSON.parse(readFileSync(RECORDING, 'utf8')) as { body: string }).body;
}

describe('French VAT number from the SIREN', () => {
  it('matches two published pairs', () => {
    // 1. Annuaire des Entreprises, "Numéro de TVA intracommunautaire" (annuaire-entreprises.data.gouv.fr):
    //    EDF, SIREN 552081317, FR 03 552081317.
    expect(frenchVatKey('552081317')).toBe('03');
    expect(deriveFrenchVatNumber('552 081 317')).toBe('FR03552081317');
    // 2. The same directory's API reply, recorded on 15 Nov 2026 (this folder's recorded data):
    //    Danone, SIREN 552032534, "tva": ["FR27552032534"].
    const recorded = JSON.parse(recordedBody()) as { results: { siren: string; tva: string[] }[] };
    expect(recorded.results[0]?.tva).toEqual(['FR27552032534']);
    expect(deriveFrenchVatNumber(recorded.results[0]?.siren)).toBe('FR27552032534');
  });

  it('pads the key to two digits and refuses a number that is not a valid SIREN', () => {
    expect(frenchVatKey('552081317')).toHaveLength(2);
    expect(deriveFrenchVatNumber('552081318')).toBeNull();
    expect(deriveFrenchVatNumber('12345')).toBeNull();
    expect(deriveFrenchVatNumber(undefined)).toBeNull();
  });
});

describe('fr.recherche_entreprises VAT number', () => {
  it('keeps the number the directory lists as "listed", never as "registered for VAT"', async () => {
    const connector = createRechercheEntreprisesConnector({ env: { FR_RECHERCHE_ENTREPRISES_USER_AGENT: 'VeroScan-test' }, fetch: fakeFetch({ '/search': recordedBody() }), now: () => NOW, sleep: async () => undefined, retries: 1 });
    const result = await connector.lookup({ name: 'Danone', jurisdiction: 'FR', siren: '552032534' });
    expect(result.status).toBe('found');
    const facts = factMap(result);
    expect(facts['registry.fr.recherche_entreprises.vat_number_listed']).toBe('FR27552032534');
    expect(Object.keys(facts).filter((key) => /vat_registered|is_registered/.test(key))).toEqual([]);
  });
});

describe('VIES asked about a derived number', () => {
  const other = JSON.parse(sample('vies-other.json')) as Record<string, unknown>;
  const reply = (key: string) => JSON.stringify(other[key]);
  const vies = (routes: Parameters<typeof fakeFetch>[0]) =>
    createViesVatConnector({ env: { PUBLIC_API_USER_AGENT: 'VeroScan-test' }, fetch: fakeFetch(routes), now: () => NOW, sleep: async () => undefined, retries: 1 });

  it('"not valid" for a derived number says so, and never that the company is not registered', async () => {
    const connector = vies({ '/check-vat-number': reply('invalid'), '/check-status': reply('status') });
    const result = await connector.lookup({ name: 'Kestrel Pay GmbH', jurisdiction: 'DE', vat_number: 'DE000000000', vat_number_derived: true });
    expect(result.status).toBe('not_found');
    expect(result.message).toBe(VIES_WORDS.notValidDerived);
    expect(result.message).toContain("doesn't mean your company isn't registered for VAT");
    expect(factMap(result)).toMatchObject({ 'registry.eu.vies_vat.valid': false, 'registry.eu.vies_vat.number_derived': true });
  });

  it('a number the company gave keeps the ordinary wording and no "derived" fact', async () => {
    const connector = vies({ '/check-vat-number': reply('invalid'), '/check-status': reply('status') });
    const result = await connector.lookup({ name: 'Kestrel Pay GmbH', jurisdiction: 'DE', vat_number: 'DE000000000' });
    expect(result.message).toBe(VIES_WORDS.notValid);
    expect(factMap(result)).not.toHaveProperty('registry.eu.vies_vat.number_derived');
  });
});

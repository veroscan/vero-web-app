import { createConnectors } from '@vero/connectors';
import { hasCountryPack } from '@vero/rules';
import { countryCoverage } from '@vero/shared';
import { describe, expect, it } from 'vitest';
import { coverageFor, registryOnFor } from '../src/modules/scans/facts';

/**
 * The coverage level a response reports comes from the sources this API actually built: a
 * country is "registry" only while its own official register is switched on. No database needed.
 */
const live = (env: Record<string, string> = {}) => createConnectors({ env: { NODE_ENV: 'test', ...env }, now: () => new Date('2026-11-16T09:00:00Z') });

describe('honest coverage level, from the connectors that were built', () => {
  it('keeps US-DE, GB and NG at full, whatever is switched on', () => {
    for (const code of ['US-DE', 'GB', 'NG']) {
      expect(coverageFor(code, live()).level, code).toBe('full');
      expect(coverageFor(code, live()).sentence).toBe(countryCoverage(code).sentence);
    }
  });

  it('puts Australia at international without its ABN Lookup key, and at registry with it', () => {
    expect(registryOnFor(live(), 'AU')).toBe(false);
    expect(coverageFor('AU', live()).level).toBe('international');
    expect(coverageFor('AU', live({ AU_ABR_GUID: 'test-guid' })).level).toBe('registry');
  });

  it('reads the setting on each call, so setting a key raises the country with no restart', () => {
    const env: Record<string, string> = { NODE_ENV: 'test' };
    const connectors = createConnectors({ env });
    expect(coverageFor('NZ', connectors).level).toBe('international');
    env['NZ_NZBN_API_KEY'] = 'test-key';
    expect(coverageFor('NZ', connectors).level).toBe('registry');
  });

  it('puts Norway at registry when the public API contact is set, and not before', () => {
    expect(coverageFor('NO', live()).level).toBe('international');
    expect(coverageFor('NO', live({ PUBLIC_API_USER_AGENT: 'Vero test' })).level).toBe('registry');
    expect(coverageFor('SG', live({ PUBLIC_API_USER_AGENT: 'Vero test' })).level).toBe('registry');
  });

  it('each keyed register counts only once its own settings are set', () => {
    const keys: Record<string, Record<string, string>> = {
      DK: { DK_CVR_USERNAME: 'u', DK_CVR_PASSWORD: 'p' },
      CA: { CA_CORPORATIONS_API_KEY: 'k' },
      NL: { NL_KVK_API_KEY: 'k' },
      IE: { IE_CRO_EMAIL: 'test@example.com', IE_CRO_API_KEY: 'k' },
      CH: { ZEFIX_USERNAME: 'u', ZEFIX_PASSWORD: 'p' },
    };
    for (const [code, env] of Object.entries(keys)) {
      expect(coverageFor(code, live()).level, code).toBe('international');
      expect(coverageFor(code, live(env)).level, code).toBe('registry');
    }
  });

  it('never counts a global source as a country register', () => {
    const connectors = live({ PUBLIC_API_USER_AGENT: 'Vero test', OPENCORPORATES_API_TOKEN: 'token' });
    expect(coverageFor('KE', connectors).level).toBe('international');
    expect(coverageFor('US-CA', connectors).level).toBe('international');
  });

  it('keeps the shared default when no connectors are known', () => {
    expect(coverageFor('FR').level).toBe('registry');
    expect(coverageFor('AU').level).toBe('international');
  });

  it('says what can be checked, never that it was, and that draft country rules are not yet reviewed', () => {
    const withRegister = coverageFor('AU', live({ AU_ABR_GUID: 'test-guid' })).sentence;
    expect(withRegister).toContain("Australia's company register");
    expect(withRegister).toContain('not yet reviewed');
    expect(withRegister.startsWith('We can check')).toBe(true);
    const without = coverageFor('CH', live()).sentence;
    expect(without).toContain('not yet reviewed');
    expect(without).toContain("not yet Switzerland's own company register");
    // Only a country with a draft pack of its own mentions country rules, and says they are not yet reviewed.
    for (const code of ['NO', 'KE', 'SG', 'NZ', 'CA']) {
      const sentence = coverageFor(code, live({ PUBLIC_API_USER_AGENT: 'Vero test' })).sentence;
      expect(sentence.includes('first set') && sentence.includes('not yet reviewed'), code).toBe(hasCountryPack(code));
    }
    for (const code of ['AU', 'CH', 'SG', 'NZ', 'CA', 'NO', 'KE']) {
      expect(coverageFor(code, live()).sentence, code).not.toMatch(/founder|lawyer|Code & Clause|—|we checked|was checked/i);
    }
  });
});

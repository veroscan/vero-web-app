import { describe, expect, it } from 'vitest';
import { DEFAULT_DIR, refFromArgs } from './connectors-record';

describe('npm run connectors:record', () => {
  it('builds the lookup from the arguments, putting each number where its register reads it', () => {
    expect(refFromArgs({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', number: '14839221', vat: 'GB123456789' })).toEqual({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', company_number: '14839221', vat_number: 'GB123456789' });
    expect(refFromArgs({ name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG', number: '1849302' })).toEqual({ name: 'Kestrel Pay Nigeria Ltd', jurisdiction: 'NG', rc_number: '1849302' });
    expect(refFromArgs({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE', serials: '97123456, 97123457', business: 'biz_1' })).toEqual({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE', trademark_serials: ['97123456', '97123457'], vendor_business_id: 'biz_1' });
  });

  it('says plainly what is missing', () => {
    expect(refFromArgs({ jurisdiction: 'GB' })).toContain('--name');
    expect(refFromArgs({ name: 'X', jurisdiction: 'DE' })).toContain('--jurisdiction');
    // France: data sources only (docs/FRANCE.md).
    expect(refFromArgs({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: '123456808' })).toEqual({ name: 'Kestrel Pay SAS', jurisdiction: 'FR', siren: '123456808' });
    // National registers without a key (docs/NATIONAL-REGISTERS.md) read the national number.
    expect(refFromArgs({ name: 'Kestrel Pay AS', jurisdiction: 'NO', 'registry-number': '812345672' })).toEqual({ name: 'Kestrel Pay AS', jurisdiction: 'NO', registry_number: '812345672' });
  });

  it('saves into the connectors package, where the replay harness looks', () => {
    expect(DEFAULT_DIR.split('\\').join('/')).toMatch(/packages\/connectors\/test\/recorded\/data$/);
  });
});

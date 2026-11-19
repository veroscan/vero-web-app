import { describe, expect, it } from 'vitest';
import {
  CONNECTOR_FACT_KEYS, createEsmaProspectusConnector, createEuipoConnector, euTrademarkNumbers, KESTREL_LEI, normaliseEuTrademarkNumber, parseEsmaProspectuses,
} from '../src/index.js';
import { parseCapitalFilings } from '../src/sources/companies-house.js';
import { factMap, fakeFetch, noSleep, NOW, sample, sampleJson } from './helpers.js';

/**
 * EU trade marks (EUIPO), ESMA's prospectus register and the UK share allotments (SH01) count,
 * added 18 Nov 2026. Samples are hand-built and fictional: the ESMA one follows the shape of the
 * real replies seen on 18 Nov 2026; the EUIPO one follows the field names of an open-source client
 * (the EUIPO portal could not be read), so it is not confirmed.
 */

const UA = { PUBLIC_API_USER_AGENT: 'VeroScan company checks' };
const EUIPO_ENV = { EUIPO_CLIENT_ID: 'test-client', EUIPO_CLIENT_SECRET: 'test-secret' };
const TOKEN = JSON.stringify({ access_token: 'test-token', expires_in: 7200 });

function keysKnown(result: { facts: { key: string }[] }) {
  for (const fact of result.facts) expect(CONNECTOR_FACT_KEYS as readonly string[]).toContain(fact.key);
}

describe('eu.esma_prospectus', () => {
  const make = (fetch: ReturnType<typeof fakeFetch>, env: Record<string, string> = UA) => createEsmaProspectusConnector({ env, fetch, now: NOW, sleep: noSleep });

  it('stays off until PUBLIC_API_USER_AGENT is set', async () => {
    const result = await make(fakeFetch({}), {}).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: KESTREL_LEI });
    expect(result.status).toBe('unavailable');
  });

  it('needs a valid LEI, and never searches by name', async () => {
    const fetch = fakeFetch({});
    expect((await make(fetch).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' })).status).toBe('unsupported');
    expect((await make(fetch).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: '00000KESTRELPAYUK000' })).status).toBe('unsupported');
    expect(fetch.calls).toHaveLength(0);
  });

  it('reads counts, dates and codes from the block-join reply', async () => {
    const fetch = fakeFetch({ '/solr/esma_registers_priii_documents/select': sample('esma-prospectus.json') });
    const result = await make(fetch).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: KESTREL_LEI });
    expect(result.status).toBe('found');
    const facts = factMap(result);
    expect(facts['registry.eu.esma_prospectus.documents_found']).toBe(2);
    expect(facts['registry.eu.esma_prospectus.latest_approval_on']).toBe('2026-08-11');
    expect(facts['registry.eu.esma_prospectus.first_approval_on']).toBe('2025-03-04');
    expect(facts['registry.eu.esma_prospectus.approval_countries']).toEqual(['IE', 'LU']);
    expect(facts['registry.eu.esma_prospectus.document_types']).toEqual(['STDA', 'SUPP']);
    keysKnown(result);
    const params = new URL(fetch.calls[0]?.url ?? 'https://invalid.example/').searchParams;
    expect(params.get('q')).toBe(`{!parent which="type_s:parent"}issuer_lei:${KESTREL_LEI}`);
    // Only codes and dates are asked for: never party names, which can be people.
    expect(params.get('fl')).toBe('type_s,approval_filing_date,document_type,home_member_state_code');
  });

  it('a miss is "no prospectus for this LEI", never "has not raised"', async () => {
    const result = await make(fakeFetch({ '/select': sample('esma-empty.json') })).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: KESTREL_LEI });
    expect(result.status).toBe('not_found');
    expect(factMap(result)['registry.eu.esma_prospectus.documents_found']).toBe(0);
    expect(result.message).toMatch(/isn't proof/);
  });

  it('leaves out the first date when not every document was read', () => {
    const raw = sampleJson('esma-prospectus.json') as { response: { numFound: number } };
    raw.response.numFound = 250;
    const keys = parseEsmaProspectuses(raw).facts.map((fact) => fact.key);
    expect(keys).not.toContain('registry.eu.esma_prospectus.first_approval_on');
    expect(keys).toContain('registry.eu.esma_prospectus.latest_approval_on');
  });

  it('an unreadable reply is an error, not a miss', async () => {
    const result = await make(fakeFetch({ '/select': '{"responseHeader":{"status":1}}' })).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', lei: KESTREL_LEI });
    expect(result.status).toBe('error');
  });
});

describe('eu.euipo', () => {
  const make = (fetch: ReturnType<typeof fakeFetch>, env: Record<string, string> = EUIPO_ENV) => createEuipoConnector({ env, fetch, now: NOW, sleep: noSleep });

  it('reads EU trade mark numbers from an answer', () => {
    expect(euTrademarkNumbers('018123456, 18123457; EUTM 099999901')).toEqual(['018123456', '018123457', '099999901']);
    expect(normaliseEuTrademarkNumber('1234567890')).toBeNull();
    expect(euTrademarkNumbers(undefined)).toEqual([]);
  });

  it('stays off until both settings are set', async () => {
    const result = await make(fakeFetch({}), { EUIPO_CLIENT_ID: 'x' }).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', eu_trademark_numbers: ['099999901'] });
    expect(result.status).toBe('unavailable');
  });

  it('needs a number: without one it is unsupported and asks nothing', async () => {
    const fetch = fakeFetch({});
    const result = await make(fetch).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB' });
    expect(result.status).toBe('unsupported');
    expect(fetch.calls).toHaveLength(0);
  });

  it('reads the mark, its state and its expiry, and never the applicant', async () => {
    const fetch = fakeFetch({ '/oidc/accessToken': TOKEN, '/trademarks/099999901': sample('euipo-trademark.json') });
    const result = await make(fetch).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', eu_trademark_numbers: ['99999901'] });
    expect(result.status).toBe('found');
    const facts = factMap(result);
    expect(facts['registry.eu.euipo.registered_count']).toBe(1);
    expect(facts['registry.eu.euipo.marks']).toEqual(['KESTREL PAY']);
    expect(facts['registry.eu.euipo.next_expiry_on']).toBe('2034-03-01');
    expect(JSON.stringify(result.facts)).not.toContain('Sample Applicant Person');
    keysKnown(result);
    const call = fetch.calls.find((item) => item.url.includes('/trademarks/'));
    const headers = call?.init?.headers as Record<string, string>;
    expect(headers['X-IBM-Client-Id']).toBe('test-client');
    expect(headers['Authorization']).toBe('Bearer test-token');
  });

  it('a number the EUIPO does not know is "not found", with nothing concluded about the brand', async () => {
    const result = await make(fakeFetch({ '/oidc/accessToken': TOKEN, '/trademarks/': { status: 404 } })).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', eu_trademark_numbers: ['099999901'] });
    expect(result.status).toBe('not_found');
    expect(factMap(result)['registry.eu.euipo.found_count']).toBe(0);
  });

  it('refused credentials are a setup problem, not a company problem', async () => {
    const result = await make(fakeFetch({ '/oidc/accessToken': { status: 401 } })).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', eu_trademark_numbers: ['099999901'] });
    expect(result.status).toBe('error');
    expect(result.facts).toEqual([]);
  });
});

describe('uk.companies_house share allotments (SH01)', () => {
  it('counts allotment returns and keeps the first and last dates, never amounts', () => {
    const facts = Object.fromEntries(parseCapitalFilings({
      total_count: 3,
      items: [
        { type: 'SH01', date: '2025-03-14', description: 'capital-allotment-shares', description_values: { capital: [{ figure: '100', currency: 'GBP' }] } },
        { type: 'SH01', date: '2024-06-01', description: 'capital-allotment-shares' },
        { type: 'SH02', date: '2024-01-10' },
      ],
    }).map((fact) => [fact.key, fact.value]));
    expect(facts['registry.uk.companies_house.allotment_filings_count']).toBe(2);
    expect(facts['registry.uk.companies_house.first_allotment_on']).toBe('2024-06-01');
    expect(facts['registry.uk.companies_house.last_allotment_on']).toBe('2025-03-14');
    expect(JSON.stringify(facts)).not.toContain('GBP');
  });

  it('gives no count when not every capital filing was read', () => {
    const keys = parseCapitalFilings({ total_count: 150, items: [{ type: 'SH01', date: '2025-03-14' }] }).map((fact) => fact.key);
    expect(keys).not.toContain('registry.uk.companies_house.allotment_filings_count');
    expect(keys).toContain('registry.uk.companies_house.last_allotment_on');
  });
});

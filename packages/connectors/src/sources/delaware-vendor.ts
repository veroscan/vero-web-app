import { defineConnector, SourceError, type Http } from '../runtime.js';
import { asArray, asRecord, asString, firstString, normaliseName, personLabel, toIsoDate } from '../text.js';
import type { Candidate, CompanyRef, Connector, ConnectorDeps, Env, Fact } from '../types.js';

/**
 * us.delaware_vendor: Delaware entity data through a licensed vendor.
 *
 * We never touch Delaware's entity search. The Division of Corporations "strictly
 * prohibits mining data" and customer consent doesn't change that. Status comes
 * only from a Certificate of Good Standing the user uploads and validates, so this
 * connector publishes no good-standing or franchise-tax fact. `vendor_status` is
 * a label for reference, and no rule reads it. Middesk's docs say Delaware status
 * is often "unknown", and when it is we leave the fact out.
 *
 * Middesk: the registration field names are from docs.middesk.com/reference/registration,
 * checked 5 Nov 2026. Couldn't confirm without a key: the request body and whether
 * a business report comes back at once. A report that isn't ready is "waiting", and the
 * retry job asks again. Creating a business is an order that costs money, so Middesk's
 * business id is handed back (vendorBusinessId), stored per company by the app, and
 * reused: we only create another when Middesk says the stored one no longer exists.
 *
 * Cobalt: the search route and `nextReportDueDate` come from the matrix and we couldn't
 * confirm them without a key. Cobalt's `liveData=true` pulls from state sites, and for
 * Delaware that would be automated access to the very site that forbids it, so we
 * never set it for Delaware. Whether cached Cobalt data for Delaware is acceptable
 * needs a written answer from the vendor before anyone turns this on.
 */

const P = 'registry.us.delaware_vendor';

export interface VendorRecord {
  name: string | undefined;
  fileNumber: string | undefined;
  entityType: string | undefined;
  formedOn: string | null;
  registeredAgent: string | undefined;
  status: string | undefined;
  otherStateCount: number;
  nextReportDue: string | null;
  officers: string[];
}

/** `businessId` is the vendor's reference for this company, kept so the next lookup reuses it. */
export type VendorAnswer = ({ kind: 'record'; record: VendorRecord; raw: string; url: string }
  | { kind: 'not_found'; raw: string; url: string }
  | { kind: 'ambiguous'; candidates: Candidate[]; raw: string; url: string }
  | { kind: 'pending'; url: string }) & { businessId?: string };

export interface DelawareVendor {
  name: string;
  lookup(ref: CompanyRef, http: Http, env: Env): Promise<VendorAnswer>;
}

function agentName(value: unknown): string | undefined {
  return asString(value) ?? firstString(asRecord(value), 'name', 'full_name');
}

function officerLabels(value: unknown): string[] {
  return asArray(value).map(asRecord).map((officer) => {
    const roles = asArray(officer['roles']).map(String).join(', ');
    // Names and roles only. Addresses and ID numbers never get past this line.
    return personLabel(firstString(officer, 'name', 'full_name'), roles || firstString(officer, 'title', 'role'));
  }).filter((label): label is string => label !== null);
}

/** Middesk's `registrations[]`, one record per state. */
export function parseMiddeskBusiness(raw: unknown): VendorRecord | null {
  const registrations = asArray(asRecord(raw)['registrations']).map(asRecord);
  const delaware = registrations.find((r) => (asString(r['state']) ?? '').toUpperCase() === 'DE');
  if (!delaware) return null;
  const substatus = asString(delaware['sub_status']);
  const status = asString(delaware['status']);
  return {
    name: asString(delaware['name']),
    fileNumber: asString(delaware['file_number']),
    entityType: asString(delaware['entity_type']),
    formedOn: toIsoDate(asString(delaware['registration_date'])),
    registeredAgent: agentName(delaware['registered_agent']),
    status: substatus ?? (status && status !== 'unknown' ? status : undefined),
    otherStateCount: registrations.filter((r) => (asString(r['state']) ?? '').toUpperCase() !== 'DE').length,
    nextReportDue: null,
    officers: officerLabels(delaware['officers']),
  };
}

export const middesk: DelawareVendor = {
  name: 'middesk',
  async lookup(ref, http, env) {
    const base = env['MIDDESK_BASE_URL'] || 'https://api.middesk.com';
    const headers = { Authorization: `Bearer ${env['MIDDESK_API_KEY'] as string}`, 'Content-Type': 'application/json', Accept: 'application/json' };

    const read = async (id: string): Promise<VendorAnswer | null> => {
      const url = `${base}/v1/businesses/${encodeURIComponent(id)}`;
      const response = await http(url, { headers });
      if (response.status === 404) return null;
      const business = response.json();
      const state = asString(asRecord(business)['status']);
      // Middesk is still working on it. The retry job asks again with the same id.
      if (state === 'open' || state === 'pending') return { kind: 'pending', url, businessId: id };
      const record = parseMiddeskBusiness(business);
      return record ? { kind: 'record', record, raw: response.text, url, businessId: id } : { kind: 'not_found', raw: response.text, url, businessId: id };
    };

    // Each new business is a new order, so a stored reference is always tried first.
    if (ref.vendor_business_id) {
      const known = await read(ref.vendor_business_id);
      if (known) return known;
      // Middesk no longer has that reference. Only then do we create another.
    }
    const created = await http(`${base}/v1/businesses`, { method: 'POST', headers, body: JSON.stringify({ name: ref.name }), allow: [400, 422] });
    if (created.status === 400 || created.status === 422) throw new SourceError('Our data provider needs more details about this company, such as an address.');
    const id = asString(asRecord(created.json())['id']);
    if (!id) throw new SourceError("Our data provider didn't give us a reference.");
    return (await read(id)) ?? { kind: 'not_found', raw: '', url: `${base}/v1/businesses/${encodeURIComponent(id)}`, businessId: id };
  },
};

/** Cobalt's search results. Field names unconfirmed: see the note at the top. */
export function parseCobaltSearch(raw: unknown): VendorRecord[] {
  const record = asRecord(raw);
  const results = asArray(record['results'] ?? record['data'] ?? (Object.keys(record).length > 0 ? record : []));
  return results.map(asRecord).filter((r) => Object.keys(r).length > 0).map((r) => {
    const status = firstString(r, 'status');
    return {
      name: firstString(r, 'title', 'name', 'entityName'),
      fileNumber: firstString(r, 'sosId', 'fileNumber', 'entityNumber'),
      entityType: firstString(r, 'entityType', 'type'),
      formedOn: toIsoDate(firstString(r, 'filingDate', 'formationDate')),
      registeredAgent: firstString(r, 'agentName', 'registeredAgent') ?? agentName(r['agent']),
      status: status && status.toLowerCase() !== 'unknown' ? status : undefined,
      otherStateCount: 0,
      nextReportDue: toIsoDate(firstString(r, 'nextReportDueDate')),
      officers: officerLabels(r['officers']),
    };
  });
}

export const cobalt: DelawareVendor = {
  name: 'cobalt',
  async lookup(ref, http, env) {
    // liveData is deliberately absent. See the note at the top of this file.
    const url = `https://apigateway.cobaltintelligence.com/v1/search?searchQuery=${encodeURIComponent(ref.name)}&state=DE`;
    const response = await http(url, { headers: { 'x-api-key': env['COBALT_API_KEY'] as string, Accept: 'application/json' } });
    if (response.status === 404) return { kind: 'not_found', raw: response.text, url };
    const records = parseCobaltSearch(response.json());
    const wanted = normaliseName(ref.name);
    const exact = records.filter((r) => normaliseName(r.name ?? '') === wanted);
    if (exact.length === 1) return { kind: 'record', record: exact[0] as VendorRecord, raw: response.text, url };
    if (exact.length > 1 || records.length > 0) {
      return { kind: 'ambiguous', raw: response.text, url, candidates: (exact.length > 1 ? exact : records).slice(0, 5).map((r) => ({ name: r.name ?? 'Unnamed', ...(r.fileNumber ? { identifier: r.fileNumber } : {}) })) };
    }
    return { kind: 'not_found', raw: response.text, url };
  },
};

export function vendorRecordFacts(record: VendorRecord): Fact[] {
  const facts: Fact[] = [
    { key: `${P}.found`, value: true },
    { key: `${P}.registered_agent_present`, value: record.registeredAgent !== undefined },
    { key: `${P}.other_state_registration_count`, value: record.otherStateCount },
    { key: `${P}.officers`, value: record.officers },
  ];
  const optional: [string, string | null | undefined][] = [
    ['name', record.name],
    ['file_number', record.fileNumber],
    ['entity_type', record.entityType],
    ['formed_on', record.formedOn],
    ['registered_agent', record.registeredAgent],
    ['vendor_status', record.status],
    ['next_report_due', record.nextReportDue],
  ];
  for (const [key, value] of optional) if (value) facts.push({ key: `${P}.${key}`, value });
  return facts;
}

function chooseVendor(env: Env): DelawareVendor {
  const choice = env['DELAWARE_VENDOR']?.toLowerCase();
  if (choice === 'cobalt') return cobalt;
  if (choice === 'middesk') return middesk;
  return env['MIDDESK_API_KEY'] ? middesk : cobalt;
}

export function createDelawareVendorConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'us.delaware_vendor',
    jurisdictions: ['US-DE'],
    capabilities: ['entity_lookup', 'officers'],
    factPrefix: P,
    sourceName: 'our licensed data provider',
    method: 'licensed_vendor',
    homeUrl: 'https://www.middesk.com',
    requiredEnvAny: ['MIDDESK_API_KEY', 'COBALT_API_KEY'],
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      const vendor = chooseVendor(env);
      const key = vendor.name === 'middesk' ? env['MIDDESK_API_KEY'] : env['COBALT_API_KEY'];
      if (!key) return { status: 'unavailable', sourceUrl: 'https://www.middesk.com', message: "Our licensed data provider isn't connected yet." };
      const answer = await vendor.lookup(ref, http, env);
      const reference = answer.businessId ? { vendorBusinessId: answer.businessId } : {};
      switch (answer.kind) {
        case 'pending':
          return { status: 'waiting', sourceUrl: answer.url, message: "Our data provider is still preparing this. We'll check again and update your result.", ...reference };
        case 'not_found':
          return { status: 'not_found', sourceUrl: answer.url, raw: answer.raw, facts: [{ key: `${P}.found`, value: false }], message: "Our data provider didn't return a Delaware record. That doesn't mean there isn't one: upload your certificate to settle it.", ...reference };
        case 'ambiguous':
          return { status: 'ambiguous', sourceUrl: answer.url, raw: answer.raw, matchConfidence: 0.5, candidates: answer.candidates, message: 'A few Delaware companies could be yours. Pick the right one.', ...reference };
        case 'record':
          return { status: 'found', sourceUrl: answer.url, raw: answer.raw, facts: vendorRecordFacts(answer.record), matchConfidence: 0.9, ...reference };
      }
    },
  }, deps);
}

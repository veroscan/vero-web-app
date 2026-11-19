import { defineConnector, type Http } from '../runtime.js';
import { asArray, asRecord, asString, firstString, nameSimilarity, normaliseName, personLabel, toIsoDate } from '../text.js';
import type { CompanyRef, Connector, ConnectorDeps, Fact } from '../types.js';

/**
 * ng.cac_vendor: CAC records through Mono, the primary vendor per the plan. We
 * never scrape the CAC's portal: its terms forbid it.
 *
 * Couldn't confirm: Mono's public docs weren't reachable when this was written
 * (docs.mono.co returned 404), and Mono Lookup needs a registered Nigerian business
 * for a key. The routes come from the matrix, and the mono-sec-key header from Mono's
 * own blog. The parsers read several likely field names. test/samples/ are hand-built.
 *
 * Annual returns: "active" is only a proxy, so we publish the status and nothing
 * about filings. Names and roles only: phone, email, home address and date of
 * birth are dropped here, as the NDPA and the matrix require. So is the TIN itself:
 * we only record that one was issued.
 */

const P = 'registry.ng.cac';
const BASE = 'https://api.withmono.com';

function dataOf(raw: unknown): unknown {
  const record = asRecord(raw);
  return record['data'] ?? raw;
}

export interface CacCompany {
  id: string | undefined;
  name: string | undefined;
  rcNumber: string | undefined;
  status: string | undefined;
  type: string | undefined;
  incorporatedOn: string | null;
  addressPresent: boolean;
  shareCapitalPresent: boolean;
}

export function parseCacCompany(raw: unknown): CacCompany {
  const r = asRecord(raw);
  const capital = firstString(r, 'share_capital', 'shareCapital', 'share_capital_in_words');
  return {
    id: firstString(r, 'id', '_id', 'company_id'),
    name: firstString(r, 'name', 'company_name', 'approved_name', 'approvedName'),
    rcNumber: firstString(r, 'rc_number', 'rcNumber', 'registration_number'),
    status: firstString(r, 'status', 'company_status')?.toLowerCase(),
    type: firstString(r, 'type', 'company_type', 'classification'),
    incorporatedOn: toIsoDate(firstString(r, 'registration_date', 'date_of_registration', 'registrationDate')),
    addressPresent: firstString(r, 'address', 'registered_address', 'head_office_address') !== undefined,
    shareCapitalPresent: capital !== undefined,
  };
}

export function parseCacSearch(raw: unknown): CacCompany[] {
  const data = dataOf(raw);
  const items = Array.isArray(data) ? data : asArray(asRecord(data)['companies'] ?? asRecord(data)['results'] ?? (Object.keys(asRecord(data)).length > 0 ? data : []));
  return items.map(parseCacCompany);
}

/** People, as "Name (role)". Everything else about them is dropped on purpose. */
export function parseCacPeople(raw: unknown, fallbackRole: string): string[] {
  const data = dataOf(raw);
  return asArray(data).map(asRecord).map((person) => {
    const name = firstString(person, 'name', 'full_name', 'fullName')
      ?? ([asString(person['surname']), asString(person['first_name'] ?? person['firstname']), asString(person['last_name'])].filter(Boolean).join(' ') || undefined);
    return personLabel(name, firstString(person, 'role', 'designation', 'type') ?? fallbackRole);
  }).filter((label): label is string => label !== null);
}

async function people(http: Http, url: string, headers: Record<string, string>, role: string): Promise<{ list: string[] | null; raw: string }> {
  try {
    const response = await http(url, { headers, allow: [400] });
    if (response.status === 404 || response.status === 400) return { list: null, raw: response.text };
    return { list: parseCacPeople(response.json(), role), raw: response.text };
  } catch {
    return { list: null, raw: '' };
  }
}

function pick(companies: CacCompany[], ref: CompanyRef): { match?: CacCompany; candidates?: CacCompany[]; confidence: number } {
  if (ref.rc_number) {
    const wanted = ref.rc_number.replace(/\D/g, '');
    const byNumber = companies.find((c) => c.rcNumber?.replace(/\D/g, '') === wanted);
    if (byNumber) return { match: byNumber, confidence: 1 };
  }
  const exact = companies.filter((c) => normaliseName(c.name ?? '') === normaliseName(ref.name));
  if (exact.length === 1) return { match: exact[0], confidence: 0.9 };
  if (exact.length > 1) return { candidates: exact, confidence: 0.5 };
  const close = companies.filter((c) => nameSimilarity(c.name ?? '', ref.name) >= 0.55);
  return close.length > 0 ? { candidates: close, confidence: 0.5 } : { confidence: 0 };
}

export function createCacVendorConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'ng.cac_vendor',
    jurisdictions: ['NG'],
    capabilities: ['entity_lookup', 'officers', 'filings'],
    factPrefix: P,
    sourceName: 'CAC, through our licensed data provider',
    method: 'licensed_vendor',
    homeUrl: BASE,
    requiredEnv: ['MONO_SECRET_KEY'],
    rateLimit: { requests: 5, perMs: 1000 },
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      const headers = { 'mono-sec-key': env['MONO_SECRET_KEY'] as string, Accept: 'application/json' };
      const url = `${BASE}/v3/lookup/cac?search=${encodeURIComponent(ref.rc_number ?? ref.name)}`;
      const search = await http(url, { headers });
      const companies = search.status === 404 ? [] : parseCacSearch(search.json());
      const { match, candidates, confidence } = pick(companies, ref);

      if (candidates) {
        return { status: 'ambiguous', sourceUrl: url, raw: search.text, matchConfidence: confidence, message: 'A few companies at the CAC could be yours. Pick the right one.', candidates: candidates.slice(0, 5).map((c) => ({ name: c.name ?? 'Unnamed', ...(c.rcNumber ? { identifier: c.rcNumber } : {}) })) };
      }
      if (!match) {
        return { status: 'not_found', sourceUrl: url, raw: search.text, facts: [{ key: `${P}.found`, value: false }], message: "We didn't find this name at the CAC through our data provider. Add your RC number, or upload your certificate." };
      }

      const facts: Fact[] = [
        { key: `${P}.found`, value: true },
        { key: `${P}.registered_address_present`, value: match.addressPresent },
        { key: `${P}.share_capital_on_record`, value: match.shareCapitalPresent },
      ];
      const optional: [string, string | null | undefined][] = [['name', match.name], ['rc_number', match.rcNumber], ['status', match.status], ['type', match.type], ['incorporated_on', match.incorporatedOn]];
      for (const [key, value] of optional) if (value) facts.push({ key: `${P}.${key}`, value });

      const raw = [search.text];
      if (match.id) {
        const base = `${BASE}/v3/lookup/cac/company/${encodeURIComponent(match.id)}`;
        const [directors, shareholders, secretary, psc] = await Promise.all([
          people(http, `${base}/directors`, headers, 'director'),
          people(http, `${base}/shareholders`, headers, 'shareholder'),
          people(http, `${base}/secretary`, headers, 'secretary'),
          people(http, `${base}/psc`, headers, 'person with significant control'),
        ]);
        raw.push(directors.raw, shareholders.raw, secretary.raw, psc.raw);
        if (directors.list) facts.push({ key: `${P}.directors_count`, value: directors.list.length });
        if (shareholders.list) facts.push({ key: `${P}.shareholders_count`, value: shareholders.list.length }, { key: `${P}.shareholders`, value: shareholders.list });
        if (secretary.list) facts.push({ key: `${P}.secretary_on_record`, value: secretary.list.length > 0 });
        if (psc.list) facts.push({ key: `${P}.psc_count`, value: psc.list.length });
        const officers = [...(directors.list ?? []), ...(secretary.list ?? []), ...(psc.list ?? [])];
        if (officers.length > 0) facts.push({ key: `${P}.officers`, value: officers });
      }

      const rc = match.rcNumber ?? ref.rc_number;
      if (rc) {
        try {
          const tin = await http(`${BASE}/v3/lookup/tin`, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ number: rc, channel: 'cac' }), allow: [400] });
          if (tin.status === 200) {
            const issued = firstString(asRecord(dataOf(tin.json())), 'firs_tin', 'firstin', 'tin', 'jtb_tin', 'jtbtin') !== undefined;
            facts.push({ key: `${P}.tin_issued`, value: issued });
          } else if (tin.status === 404) {
            facts.push({ key: `${P}.tin_issued`, value: false });
          }
        } catch {
          // The TIN stays unknown, and the rest of the record still stands.
        }
      }
      return { status: 'found', sourceUrl: url, raw: raw.join('\n'), facts, matchConfidence: confidence };
    },
  }, deps);
}

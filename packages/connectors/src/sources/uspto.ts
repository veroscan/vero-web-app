import { defineConnector } from '../runtime.js';
import { asArray, asRecord, firstString, toIsoDate } from '../text.js';
import type { Connector, ConnectorDeps, Fact } from '../types.js';

/**
 * us.uspto: trademarks through TSDR, patents through the Open Data Portal (ODP).
 *
 * Confirmed on 5 Nov 2026: both routes answer 401 without a key, so they exist.
 * TSDR: GET tsdrapi.uspto.gov/ts/cd/casestatus/sn{serial}/info.json with header
 * USPTO-API-KEY. ODP: api.uspto.gov/api/v1/patent/applications/search with header
 * X-API-KEY. They're separate keys.
 *
 * Couldn't confirm without a key: the exact response field names for either, so
 * the parsers read several likely names and leave a fact out rather than guess.
 * test/samples/ are hand-built, not recorded. TSDR's rate limit is also unclear:
 * the matrix says 60 a minute, a 2020 USPTO guide says 120. We use the lower one.
 *
 * Trademarks by owner name need the bulk TRCFECO2 index (no REST route exists),
 * which isn't built yet. So with no serial number we publish no trademark facts:
 * that's "we don't know", which is true, and not "no trademark". The serials come
 * from the questionnaire (answers.us_trademark_serials). With no serial and no
 * patent key, the source is "unsupported" with a plain reason.
 */

const P = 'registry.us.uspto';
const TSDR = 'https://tsdrapi.uspto.gov/ts/cd/casestatus';
const ODP = 'https://api.uspto.gov/api/v1/patent/applications/search';

export interface TrademarkStatus {
  mark: string | undefined;
  live: boolean | null;
  statusText: string | undefined;
  registered: boolean;
  registeredOn: string | null;
}

export function parseTsdr(raw: unknown): TrademarkStatus | null {
  const record = asRecord(raw);
  const first = asRecord(asArray(record['trademarks'])[0] ?? record);
  const status = asRecord(first['status'] ?? first);
  if (Object.keys(status).length === 0) return null;
  const statusText = firstString(status, 'tm5StatusDesc', 'extStatusDesc', 'statusDescEx', 'status_description', 'statusDescription');
  const upper = statusText?.toUpperCase() ?? '';
  const live = upper.includes('DEAD') ? false : upper.includes('LIVE') ? true : null;
  const registeredOn = toIsoDate(firstString(status, 'usRegistrationDate', 'registrationDate'));
  const regNumber = firstString(status, 'usRegistrationNumber', 'registrationNumber');
  const hasNumber = regNumber !== undefined && !/^0+$/.test(regNumber);
  return { mark: firstString(status, 'markElement', 'mark', 'markText'), live, statusText, registered: hasNumber || registeredOn !== null, registeredOn };
}

export function parsePatentSearch(raw: unknown): number | null {
  const record = asRecord(raw);
  if (typeof record['count'] === 'number') return record['count'];
  if (typeof record['totalCount'] === 'number') return record['totalCount'];
  const bag = record['patentFileWrapperDataBag'];
  return Array.isArray(bag) ? bag.length : null;
}

export function createUsptoConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'us.uspto',
    jurisdictions: ['US', 'US-DE'],
    capabilities: ['trademarks', 'patents'],
    factPrefix: P,
    sourceName: 'the USPTO',
    method: 'official_live',
    homeUrl: 'https://tsdr.uspto.gov',
    requiredEnvAny: ['USPTO_TSDR_API_KEY', 'USPTO_ODP_API_KEY'],
    rateLimit: { requests: 60, perMs: 60_000 },
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      const facts: Fact[] = [];
      const raw: string[] = [];
      let found = false;
      let sourceUrl = 'https://tsdr.uspto.gov';

      const tsdrKey = env['USPTO_TSDR_API_KEY'];
      const serials = ref.trademark_serials ?? [];
      if (tsdrKey && serials.length > 0) {
        const marks: string[] = [];
        let live: boolean | null = null;
        let registeredOn: string | null = null;
        let registered = false;
        let filed = false;
        for (const serial of serials) {
          const digits = serial.replace(/\D/g, '');
          const url = `${TSDR}/sn${digits}/info.json`;
          sourceUrl = url;
          const response = await http(url, { headers: { 'USPTO-API-KEY': tsdrKey, Accept: 'application/json' } });
          raw.push(response.text);
          if (response.status === 404) continue;
          const status = parseTsdr(response.json());
          if (!status) continue;
          filed = true;
          if (status.mark) marks.push(status.mark);
          if (status.live === true || live === null) live = status.live ?? live;
          registered ||= status.registered;
          registeredOn ??= status.registeredOn;
        }
        facts.push({ key: `${P}.trademark_filed`, value: filed }, { key: `${P}.trademark_registered`, value: registered }, { key: `${P}.trademark_marks`, value: marks });
        if (live !== null) facts.push({ key: `${P}.trademark_status`, value: live ? 'live' : 'dead' });
        if (registeredOn) facts.push({ key: `${P}.trademark_registered_on`, value: registeredOn });
        found ||= filed;
      }

      const odpKey = env['USPTO_ODP_API_KEY'];
      if (odpKey) {
        const query = `applicationMetaData.firstApplicantName:"${ref.name.replace(/"/g, '')}"`;
        const url = `${ODP}?q=${encodeURIComponent(query)}&limit=1`;
        sourceUrl = serials.length > 0 ? sourceUrl : url;
        const response = await http(url, { headers: { 'X-API-KEY': odpKey, Accept: 'application/json' } });
        raw.push(response.text);
        // The ODP answers 404 when a search matches nothing.
        const count = response.status === 404 ? 0 : parsePatentSearch(response.json());
        if (count !== null) {
          facts.push({ key: `${P}.patent_application_count`, value: count });
          found ||= count > 0;
        }
      }

      if (facts.length === 0) {
        return { status: 'unsupported', sourceUrl, message: 'We need your US trademark serial number to check this with the USPTO. Add it in your answers.' };
      }
      return {
        status: found ? 'found' : 'not_found',
        sourceUrl,
        raw: raw.join('\n'),
        facts,
        ...(found ? {} : { message: "We didn't find anything at the USPTO. Recent filings may not show yet." }),
      };
    },
  }, deps);
}

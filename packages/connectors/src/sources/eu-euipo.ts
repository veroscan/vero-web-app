import { defineConnector, SourceError, type Http } from '../runtime.js';
import { asRecord, asString, toIsoDate } from '../text.js';
import type { Connector, ConnectorDeps, Env, Fact, FactValue } from '../types.js';

/**
 * eu.euipo: EU trade marks, through the EUIPO's Trademark Search API (OpenAPI 1.1.0, on the EUIPO
 * API portal, dev.euipo.europa.eu). Looked up by the EU trade mark number the company gives
 * (answers.eu_trademark_numbers): the API has no owner search we would trust with a company name.
 *
 * NOT CONFIRMED against the official page. On 18 Nov 2026 the portal (dev.euipo.europa.eu) did not
 * resolve from here, and neither did the API host without a key. What is built comes from the
 * portal's product name and an open-source client written against that OpenAPI description, so the
 * parser reads the field names it uses and leaves a fact out rather than guess:
 * - production https://api.euipo.europa.eu/trademark-search, sandbox
 *   https://api-sandbox.euipo.europa.eu/trademark-search (EUIPO_BASE_URL);
 * - GET /trademarks/{applicationNumber}, header `X-IBM-Client-Id` plus a bearer token;
 * - OAuth 2 client credentials, scope "uid", token from
 *   https://euipo.europa.eu/cas-server-webapp/oidc/accessToken (sandbox
 *   https://auth-sandbox.euipo.europa.eu/oidc/accessToken; EUIPO_TOKEN_URL);
 * - fields applicationNumber, wordMarkSpecification.verbalElement, status, applicationDate,
 *   registrationDate, expiryDate, niceClasses. Status words seen: REGISTERED,
 *   CANCELLATION_PENDING (still registered), WITHDRAWN, REFUSED, CANCELLED, SURRENDERED, EXPIRED,
 *   REMOVED_FROM_REGISTER; anything else is taken as still pending.
 * Off until EUIPO_CLIENT_ID and EUIPO_CLIENT_SECRET are set (free account, subscription approved by
 * hand). Applicants can be people: the applicant's name is never read or kept.
 */

const P = 'registry.eu.euipo';
const HOME = 'https://euipo.europa.eu/eSearch/';
const DEFAULT_BASE = 'https://api.euipo.europa.eu/trademark-search';
const DEFAULT_TOKEN_URL = 'https://euipo.europa.eu/cas-server-webapp/oidc/accessToken';
/** At most this many numbers are checked per scan. */
const MAX_NUMBERS = 10;

const DEAD = new Set(['WITHDRAWN', 'REFUSED', 'CANCELLED', 'SURRENDERED', 'EXPIRED', 'REMOVED_FROM_REGISTER']);
const REGISTERED = new Set(['REGISTERED', 'CANCELLATION_PENDING']);

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

/** "18123456", "018123456" or "EUTM 018123456" to the 9-digit number. Null when it isn't one. */
export function normaliseEuTrademarkNumber(input: string): string | null {
  const digits = input.toUpperCase().replace(/^\s*(EUTM|EU|TM)\s*/, '').replace(/[\s.-]/g, '');
  return /^\d{1,9}$/.test(digits) ? digits.padStart(9, '0') : null;
}

/** The EU trade mark numbers in an answer such as "018123456, 018123457". Anything else is dropped. */
export function euTrademarkNumbers(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  return [...new Set(value.split(/[,;\s]+/).map((item) => normaliseEuTrademarkNumber(item)).filter((item): item is string => item !== null))];
}

export interface EuTrademark {
  number: string;
  mark: string | undefined;
  status: string | undefined;
  state: 'registered' | 'pending' | 'dead' | null;
  registeredOn: string | null;
  expiresOn: string | null;
}

export function parseEuipoTrademark(raw: unknown): EuTrademark | null {
  const record = asRecord(raw);
  const number = asString(record['applicationNumber']);
  if (!number) return null;
  const status = asString(record['status'])?.toUpperCase();
  const state = status === undefined ? null : REGISTERED.has(status) ? 'registered' : DEAD.has(status) ? 'dead' : 'pending';
  return {
    number,
    mark: asString(asRecord(record['wordMarkSpecification'])['verbalElement']),
    status,
    state,
    registeredOn: toIsoDate(asString(record['registrationDate'])?.slice(0, 10)),
    expiresOn: toIsoDate(asString(record['expiryDate'])?.slice(0, 10)),
  };
}

export function createEuipoConnector(deps: ConnectorDeps): Connector {
  let token: { value: string; expires: number } | undefined;
  const now = deps.now ?? (() => new Date());

  async function bearer(http: Http, env: Env): Promise<string> {
    if (token && token.expires > now().getTime()) return token.value;
    const response = await http(env['EUIPO_TOKEN_URL'] || DEFAULT_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: env['EUIPO_CLIENT_ID'] as string,
        client_secret: env['EUIPO_CLIENT_SECRET'] as string,
        scope: 'uid',
      }).toString(),
    });
    if (response.status !== 200) throw new SourceError("The EUIPO didn't accept our credentials.");
    const body = asRecord(response.json());
    const value = asString(body['access_token']);
    if (!value) throw new SourceError("The EUIPO didn't give us a token.");
    const seconds = typeof body['expires_in'] === 'number' ? body['expires_in'] : 3600;
    token = { value, expires: now().getTime() + Math.max(seconds - 60, 30) * 1000 };
    return value;
  }

  return defineConnector({
    id: 'eu.euipo',
    // An EU trade mark can be held by a company anywhere.
    jurisdictions: ['*'],
    capabilities: ['trademarks'],
    factPrefix: P,
    sourceName: 'the EUIPO',
    method: 'official_live',
    homeUrl: HOME,
    requiredEnv: ['EUIPO_CLIENT_ID', 'EUIPO_CLIENT_SECRET'],
    // The default plan is reported at 25,000 calls a day; we stay far below.
    rateLimit: { requests: 2, perMs: 1000 },
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      const numbers = (ref.eu_trademark_numbers ?? []).map(normaliseEuTrademarkNumber).filter((item): item is string => item !== null).slice(0, MAX_NUMBERS);
      if (numbers.length === 0) {
        return { status: 'unsupported', sourceUrl: HOME, message: 'We need your EU trade mark number to check it with the EUIPO. Add it in your answers.' };
      }
      const base = (env['EUIPO_BASE_URL'] || DEFAULT_BASE).replace(/\/+$/, '');
      const headers = { Accept: 'application/json', 'accept-language': 'en', 'X-IBM-Client-Id': env['EUIPO_CLIENT_ID'] as string, Authorization: `Bearer ${await bearer(http, env)}` };
      const raw: string[] = [];
      const marks: EuTrademark[] = [];
      for (const number of numbers) {
        const response = await http(`${base}/trademarks/${number}`, { headers });
        raw.push(response.text);
        if (response.status === 404) continue;
        const mark = parseEuipoTrademark(response.json());
        if (mark) marks.push(mark);
      }
      if (marks.length === 0) {
        return {
          status: 'not_found', sourceUrl: HOME, raw: raw.join('\n'),
          facts: [fact('numbers_checked', numbers.length), fact('found_count', 0)],
          message: "We didn't find that EU trade mark number at the EUIPO. Check the number in your answers: a very recent filing may not show yet.",
        };
      }
      const facts: Fact[] = [
        fact('numbers_checked', numbers.length),
        fact('found_count', marks.length),
        fact('registered_count', marks.filter((mark) => mark.state === 'registered').length),
        fact('pending_count', marks.filter((mark) => mark.state === 'pending').length),
        fact('dead_count', marks.filter((mark) => mark.state === 'dead').length),
        fact('marks', marks.map((mark) => mark.mark).filter((mark): mark is string => mark !== undefined)),
      ];
      const expiries = marks.filter((mark) => mark.state === 'registered').map((mark) => mark.expiresOn).filter((date): date is string => date !== null).sort();
      if (expiries[0]) facts.push(fact('next_expiry_on', expiries[0]));
      return { status: 'found', sourceUrl: HOME, raw: raw.join('\n'), facts, matchConfidence: 1 };
    },
  }, deps);
}

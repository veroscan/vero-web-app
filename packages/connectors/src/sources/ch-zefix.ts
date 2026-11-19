import { defineConnector } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact, LookupOutcome } from '../types.js';
import { amountOf, chooseByName, factIn, formatSwissUid, isValidSwissUid, normaliseSwissUid, publicUserAgent, pushDefined, registerWords } from './national-common.js';

/**
 * ch.zefix: the Zefix PublicREST API, the central business name index of the Swiss commercial
 * registers, run by the Federal Registry of Commerce at the Federal Office of Justice. Free, but
 * it needs a username and password, given on request (HTTP basic authentication). Licence:
 * "OGD Open use. Must provide the source." (opendata.swiss terms).
 *
 * Checked against the official OpenAPI description (www.zefix.admin.ch/ZefixPublicREST/v3/
 * api-docs, "Zefix PublicREST API" 2.7.2.4, security scheme "Zefix-Credentials": http basic) on
 * 16 Nov 2026: GET /api/v1/company/uid/{id} (example "CHE107721785") gives an array of
 * `CompanyFull`: `name`, `uid`, `legalSeat`, `canton`, `legalForm` (`uid` is the eCH-0097 code,
 * `shortName` in de/fr/it/en), `status` (ACTIVE, BEING_CANCELLED, CANCELLED), `deletionDate`,
 * `sogcDate`, `capitalNominal`, `capitalCurrency`, `auditCompanies[]`, `branchOffices[]`,
 * `sogcPub[]` (publication texts). POST /api/v1/company/search with `name` gives `CompanyShort[]`;
 * errors are `{ error: { type } }` with NOT_FOUND (404) or RESULTLIST_TO_LARGE (400). No rate
 * limit is published: we stay at 2 requests a second.
 *
 * NOT checked against a real reply: we have no credentials. The fictional UID in the tests could
 * not be checked as unused either.
 *
 * Personal data. A sole proprietorship (Einzelunternehmen, eCH-0097 code 0101) carries its
 * owner's surname in its name: never kept and never offered as a candidate. SOGC publication
 * texts name board members and signatories: they are never read. Audit firms are only counted.
 */

const BASE = 'https://www.zefix.admin.ch/ZefixPublicREST';
const P = 'registry.ch.zefix';
const fact = factIn(P);
const RATE = { requests: 2, perMs: 1000 };
const SOLE_PROPRIETORSHIP = '0101';

export const CH_WORDS = registerWords({
  register: 'the Swiss central business name index (Zefix)',
  numberLabel: 'UID',
  numberFormat: 'CHE followed by 9 digits that pass the UID check, like CHE-123.456.789',
});

const STATUS: Readonly<Record<string, string>> = { ACTIVE: 'active', BEING_CANCELLED: 'being_cancelled', CANCELLED: 'cancelled' };

function legalFormCode(company: Record<string, unknown>): string | undefined {
  return asString(asRecord(company['legalForm'])['uid']);
}

export function isSwissPersonRecord(company: Record<string, unknown>): boolean {
  const code = legalFormCode(company);
  const german = asString(asRecord(asRecord(company['legalForm'])['name'])['de']) ?? '';
  return code === SOLE_PROPRIETORSHIP || /einzelunternehmen/i.test(german) || asString(company['name']) === undefined || (code === undefined && german === '');
}

export function parseSwissCompany(raw: unknown): Fact[] {
  const company = asRecord(raw);
  const form = asRecord(company['legalForm']);
  const facts: Fact[] = [
    fact('identified', true),
    fact('uid', asString(company['uid']) ? formatSwissUid(normaliseSwissUid(asString(company['uid'])) ?? '') : ''),
    fact('status', STATUS[asString(company['status']) ?? ''] ?? 'unknown'),
    fact('auditors_count', asArray(company['auditCompanies']).length),
    fact('branch_offices_count', asArray(company['branchOffices']).length),
  ];
  pushDefined(facts, P, [
    ['registered_name', asString(company['name'])],
    ['legal_form_code', legalFormCode(company)],
    ['legal_form', asString(asRecord(form['shortName'])['en']) ?? asString(asRecord(form['shortName'])['de'])],
    ['legal_seat', asString(company['legalSeat'])],
    ['canton', asString(company['canton'])],
    ['deleted_on', asString(company['deletionDate'])],
    ['last_sogc_publication_on', asString(company['sogcDate'])],
    ['capital_nominal', amountOf(company['capitalNominal'])],
    ['capital_currency', asString(company['capitalCurrency'])],
  ]);
  return facts;
}

export function createZefixConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'ch.zefix',
    jurisdictions: ['CH'],
    capabilities: ['entity_lookup'],
    factPrefix: P,
    sourceName: 'Zefix',
    method: 'official_live',
    homeUrl: 'https://www.zefix.admin.ch',
    // Free, but credentials are given on request by the Federal Office of Justice.
    requiredEnv: ['ZEFIX_USERNAME', 'ZEFIX_PASSWORD'],
    rateLimit: RATE,
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      const credentials = Buffer.from(`${(env['ZEFIX_USERNAME'] as string).trim()}:${(env['ZEFIX_PASSWORD'] as string).trim()}`).toString('base64');
      const headers = { Accept: 'application/json', Authorization: `Basic ${credentials}`, 'User-Agent': publicUserAgent(env) };
      const identified = `${P}.identified`;

      const full = async (uid: string, confidence: number, notFound: () => LookupOutcome): Promise<LookupOutcome> => {
        const url = `${BASE}/api/v1/company/uid/${uid}`;
        const response = await http(url, { headers });
        const match = response.status === 404 ? undefined : asArray(response.json()).map(asRecord).find((item) => normaliseSwissUid(asString(item['uid'])) === uid);
        if (!match) return notFound();
        if (isSwissPersonRecord(match)) return { status: 'unsupported', sourceUrl: url, raw: response.text, message: CH_WORDS.person };
        return { status: 'found', sourceUrl: url, raw: response.text, facts: parseSwissCompany(match), matchConfidence: confidence };
      };

      if (ref.registry_number !== undefined) {
        const uid = normaliseSwissUid(ref.registry_number);
        if (!uid || !isValidSwissUid(uid)) return { status: 'unsupported', sourceUrl: BASE, message: CH_WORDS.invalidNumber };
        return full(uid, 1, () => ({ status: 'not_found', sourceUrl: `${BASE}/api/v1/company/uid/${uid}`, facts: [{ key: identified, value: null }], message: CH_WORDS.notFoundByNumber }));
      }

      const url = `${BASE}/api/v1/company/search`;
      const response = await http(url, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: ref.name, activeOnly: false }),
        allow: [400],
      });
      const tooMany = response.status === 400 && /RESULTLIST_TO_LARGE/.test(response.text);
      if (response.status === 400 && !tooMany) return { status: 'error', sourceUrl: url, message: 'Zefix rejected the request.' };
      const companies = response.status === 200 ? asArray(response.json()).map(asRecord) : [];
      const chosen = chooseByName({
        ref, items: companies.filter((item) => !isSwissPersonRecord(item)), nameOf: (item) => asString(item['name']), numberOf: (item) => asString(item['uid']),
        truncated: tooMany, words: CH_WORDS, identifiedKey: identified, sourceUrl: url, raw: response.text,
      });
      if (!('match' in chosen)) return chosen;
      const uid = normaliseSwissUid(asString(chosen.match['uid']));
      if (!uid) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [{ key: identified, value: null }], message: CH_WORDS.notFoundByName };
      return full(uid, 0.95, () => ({ status: 'not_found', sourceUrl: url, raw: response.text, facts: [{ key: identified, value: null }], message: CH_WORDS.notFoundByName }));
    },
  }, deps);
}

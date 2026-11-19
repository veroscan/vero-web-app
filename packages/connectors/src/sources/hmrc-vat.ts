import { defineConnector, SourceError, type Http } from '../runtime.js';
import { asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Env, Fact } from '../types.js';

/**
 * uk.hmrc_vat: HMRC's Check a UK VAT number API, version 2.
 *
 * Checked against HMRC's published spec on 5 Nov 2026: application-restricted
 * OAuth, client credentials, scope read:vat; GET
 * /organisations/vat/check-vat-number/lookup/{targetVrn}; Accept
 * application/vnd.hmrc.2.0+json; target.{name,vatNumber,address}; 404 NOT_FOUND
 * for a number that isn't registered; 400 for a malformed number.
 * Version 1 was removed on 17 Feb 2025. Couldn't confirm without a key: a live
 * response. HMRC needs a VAT number: it can't search by company name, so the
 * scan asks for it in the questionnaire (answers.vat_number) and, without it, this
 * source says "unsupported" with a plain reason. It never guesses a number.
 */

const P = 'registry.uk.hmrc_vat';
const DEFAULT_BASE = 'https://api.service.hmrc.gov.uk';

export function normaliseVrn(input: string): string | null {
  const digits = input.toUpperCase().replace(/^GB/, '').replace(/[\s-]/g, '');
  return /^(\d{9}|\d{12})$/.test(digits) ? digits : null;
}

export function parseVatLookup(raw: unknown): Fact[] {
  const target = asRecord(asRecord(raw)['target']);
  const facts: Fact[] = [{ key: `${P}.registered`, value: true }];
  const vat = asString(target['vatNumber']);
  const name = asString(target['name']);
  if (vat) facts.push({ key: `${P}.vat_number`, value: vat });
  if (name) facts.push({ key: `${P}.name`, value: name });
  return facts;
}

export function createHmrcVatConnector(deps: ConnectorDeps): Connector {
  let token: { value: string; expires: number } | undefined;
  const now = deps.now ?? (() => new Date());

  async function bearer(http: Http, env: Env, base: string): Promise<string> {
    if (token && token.expires > now().getTime()) return token.value;
    const response = await http(`${base}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env['HMRC_CLIENT_ID'] as string,
        client_secret: env['HMRC_CLIENT_SECRET'] as string,
        grant_type: 'client_credentials',
        scope: 'read:vat',
      }).toString(),
    });
    if (response.status !== 200) throw new SourceError("HMRC didn't accept our credentials.");
    const body = asRecord(response.json());
    const value = asString(body['access_token']);
    if (!value) throw new SourceError("HMRC didn't give us a token.");
    const seconds = typeof body['expires_in'] === 'number' ? body['expires_in'] : 3600;
    // Refresh a minute early.
    token = { value, expires: now().getTime() + (seconds - 60) * 1000 };
    return value;
  }

  return defineConnector({
    id: 'uk.hmrc_vat',
    jurisdictions: ['GB'],
    capabilities: ['tax_registration'],
    factPrefix: P,
    sourceName: 'HMRC',
    method: 'official_live',
    homeUrl: DEFAULT_BASE,
    requiredEnv: ['HMRC_CLIENT_ID', 'HMRC_CLIENT_SECRET'],
    rateLimit: { requests: 3, perMs: 1000 },
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      const base = env['HMRC_BASE_URL'] || DEFAULT_BASE;
      if (!ref.vat_number) {
        return { status: 'unsupported', sourceUrl: base, message: 'We need your VAT number to check this with HMRC. Add it in your answers.' };
      }
      const vrn = normaliseVrn(ref.vat_number);
      if (!vrn) return { status: 'unsupported', sourceUrl: base, message: "That doesn't look like a UK VAT number. It should have 9 or 12 digits." };

      const url = `${base}/organisations/vat/check-vat-number/lookup/${vrn}`;
      const response = await http(url, {
        headers: { Accept: 'application/vnd.hmrc.2.0+json', Authorization: `Bearer ${await bearer(http, env, base)}` },
        allow: [400],
      });
      if (response.status === 400) return { status: 'unsupported', sourceUrl: url, message: "HMRC says that isn't a valid VAT number." };
      if (response.status === 404) {
        return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [{ key: `${P}.registered`, value: false }], message: "HMRC doesn't have that VAT number on record." };
      }
      return { status: 'found', sourceUrl: url, raw: response.text, facts: parseVatLookup(response.json()) };
    },
  }, deps);
}

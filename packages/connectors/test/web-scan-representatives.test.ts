import { describe, expect, it } from 'vitest';
import type { RawResponse, Transport } from '../src/safe-fetch.js';
import { REPRESENTATIVE_VOCABULARY, SUPPORTED_LANGUAGES } from '../src/sources/policy-vocabulary.js';
import { CONNECTOR_FACT_KEYS, createPolicyScanConnector, type SourceResult } from '../src/index.js';
import { factMap, NOW } from './helpers.js';

/**
 * Representatives and points of contact on the website (18 Nov 2026): GDPR and UK GDPR art 27,
 * DSA arts 11 to 13. Something found is reported in any language; a miss only when the notice and
 * every side page found were read, in one of the 16 languages, with the footer in the page.
 */

const P = 'web.policy';
const UA = 'VeroScanBot/1.0 (admin@example.com)';
const KEYS = Object.keys(REPRESENTATIVE_VOCABULARY).map((key) => `${P}.${key}`);

type Pages = Record<string, Partial<RawResponse> & { body?: string }>;

function site(pages: Pages): Transport & { seen: string[] } {
  const seen: string[] = [];
  const transport = (async (url: URL) => {
    seen.push(url.pathname);
    const page = pages[url.pathname];
    return page ? { status: page.status ?? 200, headers: page.headers ?? {}, body: page.body ?? '' } : { status: 404, headers: {}, body: '' };
  }) as unknown as Transport & { seen: string[] };
  transport.seen = seen;
  return transport;
}

function scan(transport: Transport): Promise<SourceResult> {
  return createPolicyScanConnector({ env: { WEB_SCAN_USER_AGENT: UA }, transport, now: NOW })
    .lookup({ name: 'Kestrel Pay Inc.', jurisdiction: 'US-DE', website_url: 'https://example-company.example/' });
}

const FILLER = Array.from({ length: 320 }, (_, i) => `word${i}`).join(' ');
const robots = { '/robots.txt': { body: 'User-agent: *\nAllow: /\n' } };

function page(lang: string, body: string): { body: string } {
  return { body: `<html lang="${lang}"><body>${body}</body></html>` };
}

const FOOTER = '<footer><a href="/privacy">Privacy policy</a> <a href="/terms">Terms of service</a> <a href="/legal-notice">Legal notice</a> <a href="/dsa">Digital Services Act</a></footer>';
const ENGLISH_HOME = page('en', `<h1>Kestrel Pay</h1><p>The payments app for small shops, with the tools you need.</p>${FOOTER}`);

describe('representatives and points of contact on the website', () => {
  it('finds an EU and a UK representative in the notice, and the DSA contact point and legal representative on the DSA page', async () => {
    const result = await scan(site({
      ...robots,
      '/': ENGLISH_HOME,
      '/privacy': page('en', `<h1>Privacy policy</h1><p>Your rights. Our EU representative under Article 27 GDPR is Example Rep Ltd, Dublin. Our UK representative is Example Rep UK Ltd, London. ${FILLER}</p>`),
      '/legal-notice': page('en', '<p>Kestrel Pay Inc., a Delaware corporation.</p>'),
      '/dsa': page('en', '<p>Our single point of contact for authorities and users is dsa@example.com, in English. Our legal representative in the EU under the DSA is Example Rep Ltd.</p>'),
    }));
    const facts = factMap(result);
    expect(facts[`${P}.eu_representative_named`]).toBe(true);
    expect(facts[`${P}.uk_representative_named`]).toBe(true);
    expect(facts[`${P}.dsa_contact_point_named`]).toBe(true);
    expect(facts[`${P}.dsa_legal_representative_named`]).toBe(true);
  });

  it('reports each one missing when every page was read in English and none names one', async () => {
    const transport = site({
      ...robots,
      '/': ENGLISH_HOME,
      '/privacy': page('en', `<h1>Privacy policy</h1><p>Your rights. Contact us at privacy@example.com. ${FILLER}</p>`),
      '/legal-notice': page('en', '<p>Kestrel Pay Inc., a Delaware corporation.</p>'),
      '/dsa': page('en', '<p>Report illegal content using the form in the app.</p>'),
    });
    const facts = factMap(await scan(transport));
    for (const key of KEYS) expect(facts[key]).toBe(false);
    expect(transport.seen).toContain('/dsa');
    // With a DSA page found, the terms aren't read as well.
    expect(transport.seen).not.toContain('/terms');
  });

  it('reads the terms when there is no DSA page, and reports nothing missing for the DSA when the terms could not be read', async () => {
    const home = page('en', '<p>Kestrel Pay.</p><footer><a href="/privacy">Privacy policy</a> <a href="/terms">Terms of service</a></footer>');
    const notice = page('en', `<h1>Privacy policy</h1><p>Your rights. ${FILLER}</p>`);
    const unread = factMap(await scan(site({ ...robots, '/': home, '/privacy': notice, '/terms': { status: 500 } })));
    expect(unread[`${P}.eu_representative_named`]).toBe(false);
    expect(unread[`${P}.dsa_contact_point_named`]).toBeUndefined();
    expect(unread[`${P}.dsa_legal_representative_named`]).toBeUndefined();
    const read = factMap(await scan(site({ ...robots, '/': home, '/privacy': notice, '/terms': page('en', '<p>Our single point of contact under the DSA is dsa@example.com.</p>') })));
    expect(read[`${P}.dsa_contact_point_named`]).toBe(true);
    expect(read[`${P}.dsa_legal_representative_named`]).toBe(false);
  });

  it('reads the words in other languages', async () => {
    const home = page('de', '<p>Kestrel Pay ist die Zahlungs-App für kleine Läden und wir helfen Ihnen gerne.</p><footer><a href="/datenschutz">Datenschutz</a> <a href="/impressum">Impressum</a></footer>');
    const facts = factMap(await scan(site({
      ...robots,
      '/': home,
      '/datenschutz': page('de', `<h1>Datenschutzerklärung</h1><p>Ihre Rechte. Unser Vertreter in der Union nach Art. 27 DSGVO ist die Example Rep GmbH. ${FILLER}</p>`),
      '/impressum': page('de', '<p>Kestrel Pay Inc. Zentrale Kontaktstelle nach dem DSA: dsa@example.com.</p>'),
    })));
    expect(facts[`${P}.eu_representative_named`]).toBe(true);
    expect(facts[`${P}.dsa_contact_point_named`]).toBe(true);
    expect(facts[`${P}.uk_representative_named`]).toBe(false);
  });

  it('never reports one missing on a site in a language the scan cannot read', async () => {
    const facts = factMap(await scan(site({
      ...robots,
      '/': page('ja', '<p>ケストレルペイは小さなお店のための支払いアプリです。私たちはお客様を大切にしています。</p><footer><a href="/privacy">プライバシーポリシー</a></footer>'),
      '/privacy': page('ja', `<h1>プライバシーポリシー</h1><p>${'個人情報の取り扱いについて説明します。'.repeat(80)}</p>`),
    })));
    for (const key of KEYS) expect(facts[key]).toBeUndefined();
  });

  it('never reports one missing when the footer is added by JavaScript', async () => {
    const facts = factMap(await scan(site({
      ...robots,
      '/': page('en', '<div id="root"></div><p>Kestrel Pay, the payments app for small shops.</p>'),
      '/privacy': page('en', `<h1>Privacy policy</h1><p>Your rights. ${FILLER}</p>`),
    })));
    for (const key of KEYS) expect(facts[key]).toBeUndefined();
  });

  it('never reports one missing when the privacy notice is on another site and was not read', async () => {
    const facts = factMap(await scan(site({
      ...robots,
      '/': page('en', '<p>Kestrel Pay.</p><footer><a href="https://group.example.org/privacy">Privacy policy</a> <a href="/terms">Terms</a></footer>'),
      '/terms': page('en', '<p>Terms of service.</p>'),
    })));
    for (const key of KEYS) expect(facts[key]).toBeUndefined();
  });
});

describe('the word lists', () => {
  it('cover all 16 languages for each check, and each fact is a published key', () => {
    for (const [key, vocabulary] of Object.entries(REPRESENTATIVE_VOCABULARY)) {
      for (const language of SUPPORTED_LANGUAGES) expect((vocabulary.terms as Record<string, readonly unknown[]>)[language]?.length, `${key} ${language}`).toBeGreaterThan(0);
      expect(CONNECTOR_FACT_KEYS as readonly string[]).toContain(`${P}.${key}`);
    }
  });
});

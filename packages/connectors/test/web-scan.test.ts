import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { assertSafeUrl, BlockedUrlError, createPolicyScanConnector, isAllowedByRobots, isBlockedAddress, safeGet } from '../src/index.js';
import { guardedLookup, nodeTransport, type RawResponse, type Resolver, type Transport } from '../src/safe-fetch.js';
import { analysePolicy, detectCmp, extractLinks, htmlToText, readLastUpdated, setCookieNames, trackerScripts } from '../src/sources/policy-scan.js';
import { factMap, NOW, sample } from './helpers.js';

const P = 'web.policy';
const UA = 'VeroScanBot/1.0 (admin@example.com)';

describe('blocked addresses', () => {
  it.each([
    '127.0.0.1', '127.255.255.254', '10.0.0.1', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '0.0.0.0', '100.64.0.1',
    '192.0.2.1', '198.51.100.1', '203.0.113.1', '198.18.0.1', '224.0.0.1', '255.255.255.255',
    '::1', '::', 'fc00::1', 'fd12:3456::1', 'fe80::1', 'ff02::1', '2001:db8::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:169.254.169.254',
    '64:ff9b::a00:1', '2002:7f00:1::', '::127.0.0.1',
  ])('%s is blocked', (ip) => {
    expect(isBlockedAddress(ip)).toBe(true);
  });

  it.each(['8.8.8.8', '1.1.1.1', '172.15.0.1', '172.32.0.1', '192.167.0.1', '100.128.0.1', '2606:4700:4700::1111', '::ffff:8.8.8.8', '64:ff9b::808:808', '2002:808:808::'])('%s is allowed', (ip) => {
    expect(isBlockedAddress(ip)).toBe(false);
  });

  it('treats anything that is not an IP as blocked', () => {
    expect(isBlockedAddress('nonsense')).toBe(true);
  });
});

describe('blocked URLs', () => {
  it.each([
    'http://127.0.0.1/',
    'http://localhost/',
    'http://LOCALHOST./',
    'http://foo.localhost/',
    'http://printer.local/',
    'http://db.internal/',
    'http://intranet/',
    'http://169.254.169.254/latest/meta-data/',
    'http://[::1]/',
    'http://[::ffff:127.0.0.1]/',
    'http://[fd00::1]/',
    'http://2130706433/',
    'http://0x7f.0.0.1/',
    'http://0177.0.0.1/',
    'http://127.1/',
    'http://0/',
    'file:///etc/passwd',
    'ftp://example.com/',
    'gopher://example.com/',
    'data:text/html,hello',
    'javascript:alert(1)',
    'http://user:pass@example.com/',
    'http://example.com:8080/',
    'http://example.com:22/',
    'not a url',
    '',
  ])('%s is refused', (url) => {
    expect(() => assertSafeUrl(url)).toThrow(BlockedUrlError);
  });

  it.each(['https://example.com/', 'http://example.com/privacy', 'https://example.com:443/', 'https://sub.example.co.uk/a?b=c', 'https://8.8.8.8/'])('%s is allowed', (url) => {
    expect(assertSafeUrl(url).href).toBeTruthy();
  });
});

describe('redirects', () => {
  const reply = (status: number, location?: string, body = ''): RawResponse => ({ status, headers: location ? { location } : {}, body });

  function transportFrom(map: Record<string, RawResponse>): Transport & { seen: string[] } {
    const seen: string[] = [];
    const transport = (async (url: URL) => {
      seen.push(url.href);
      const answer = map[url.href];
      if (!answer) throw new Error(`Unexpected request to ${url.href}`);
      return answer;
    }) as unknown as Transport & { seen: string[] };
    transport.seen = seen;
    return transport;
  }

  it('follows a public redirect', async () => {
    const transport = transportFrom({ 'https://a.example/': reply(301, 'https://b.example/x'), 'https://b.example/x': reply(200, undefined, 'hi') });
    const response = await safeGet('https://a.example/', { userAgent: UA, transport });
    expect(response.body).toBe('hi');
    expect(response.finalUrl).toBe('https://b.example/x');
  });

  it.each([
    'http://127.0.0.1/admin',
    'http://169.254.169.254/latest/meta-data/iam/',
    'http://[::1]/',
    'http://localhost:80/',
    'http://2130706433/',
    'file:///etc/passwd',
    'http://internal.corp/',
  ])('refuses a redirect to %s, and never requests it', async (location) => {
    const transport = transportFrom({ 'https://a.example/': reply(302, location) });
    await expect(safeGet('https://a.example/', { userAgent: UA, transport })).rejects.toThrow(BlockedUrlError);
    expect(transport.seen).toEqual(['https://a.example/']);
  });

  it('refuses a redirect chain that ends somewhere private', async () => {
    const transport = transportFrom({
      'https://a.example/': reply(302, 'https://b.example/'),
      'https://b.example/': reply(302, 'http://10.0.0.5/'),
    });
    await expect(safeGet('https://a.example/', { userAgent: UA, transport })).rejects.toThrow(BlockedUrlError);
  });

  it('resolves relative redirects', async () => {
    const transport = transportFrom({ 'https://a.example/x/': reply(302, '../y'), 'https://a.example/y': reply(200, undefined, 'ok') });
    expect((await safeGet('https://a.example/x/', { userAgent: UA, transport })).body).toBe('ok');
  });

  it('stops after too many redirects', async () => {
    const transport = (async () => reply(302, 'https://a.example/')) as Transport;
    await expect(safeGet('https://a.example/', { userAgent: UA, transport })).rejects.toThrow('too many');
  });
});

describe('DNS checks at connect time', () => {
  const lookupOf = (resolver: Resolver, hostname = 'x.example') => new Promise<{ error: unknown; address: unknown }>((resolve) => {
    guardedLookup(resolver)(hostname, { family: 0 }, (error, address) => resolve({ error, address }));
  });

  it('refuses a public-looking name that resolves to a private address', async () => {
    const { error } = await lookupOf(async () => [{ address: '10.0.0.5', family: 4 }]);
    expect(error).toBeInstanceOf(BlockedUrlError);
  });

  it('refuses if any answer is private', async () => {
    const { error } = await lookupOf(async () => [{ address: '8.8.8.8', family: 4 }, { address: '::1', family: 6 }]);
    expect(error).toBeInstanceOf(BlockedUrlError);
  });

  it('refuses no answer', async () => {
    const { error } = await lookupOf(async () => []);
    expect(error).toBeInstanceOf(BlockedUrlError);
  });

  it('passes a public answer through', async () => {
    const { error, address } = await lookupOf(async () => [{ address: '8.8.8.8', family: 4 }]);
    expect(error).toBeNull();
    expect(address).toBe('8.8.8.8');
  });

  it('passes a resolver failure through as an error', async () => {
    const { error } = await lookupOf(async () => { throw new Error('ENOTFOUND'); });
    expect(error).toBeInstanceOf(Error);
  });
});

describe('real sockets', () => {
  let server: http.Server;
  let port = 0;
  let hits = 0;

  beforeAll(async () => {
    server = http.createServer((_req, res) => {
      hits += 1;
      res.end('secret internal page');
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('a name resolving to loopback never reaches the local server', async () => {
    // The real transport, with DNS rebinding simulated by the resolver.
    const resolver: Resolver = async () => [{ address: '127.0.0.1', family: 4 }];
    const url = new URL(`http://rebind.example:${port}/`);
    await expect(nodeTransport(url, { userAgent: UA, timeoutMs: 2000, lookup: guardedLookup(resolver) })).rejects.toThrow();
    expect(hits).toBe(0);
  });

  it('a loopback URL with a port never gets as far as a socket', async () => {
    await expect(safeGet(`http://127.0.0.1:${port}/`, { userAgent: UA })).rejects.toThrow(BlockedUrlError);
    expect(hits).toBe(0);
  });

  it('the connector refuses the local server too', async () => {
    const connector = createPolicyScanConnector({ env: { WEB_SCAN_USER_AGENT: UA }, now: NOW });
    const result = await connector.lookup({ name: 'K', jurisdiction: 'GB', website_url: `http://127.0.0.1:${port}/` });
    expect(result.status).toBe('unsupported');
    expect(result.facts).toEqual([]);
    expect(hits).toBe(0);
  });
});

describe('robots.txt', () => {
  const robots = 'User-agent: *\nDisallow: /private\nAllow: /private/ok\nDisallow: /*.pdf$\n\nUser-agent: VeroScanBot\nDisallow: /noscan\n';

  it('uses our own group if there is one', () => {
    expect(isAllowedByRobots(robots, UA, '/noscan')).toBe(false);
    expect(isAllowedByRobots(robots, UA, '/private')).toBe(true);
    expect(isAllowedByRobots(robots, 'SomeOtherBot', '/noscan')).toBe(true);
  });

  it('takes the longest match, and allow on a tie', () => {
    expect(isAllowedByRobots(robots, 'Other', '/private/x')).toBe(false);
    expect(isAllowedByRobots(robots, 'Other', '/private/ok')).toBe(true);
    expect(isAllowedByRobots('User-agent: *\nDisallow: /a\nAllow: /a', 'x', '/a')).toBe(true);
  });

  it('handles wildcards and end anchors', () => {
    expect(isAllowedByRobots(robots, 'Other', '/x.pdf')).toBe(false);
    expect(isAllowedByRobots(robots, 'Other', '/x.pdf.html')).toBe(true);
  });

  it('allows everything when empty, or when Disallow is blank', () => {
    expect(isAllowedByRobots('', UA, '/')).toBe(true);
    expect(isAllowedByRobots('User-agent: *\nDisallow:', UA, '/')).toBe(true);
    expect(isAllowedByRobots('User-agent: *\nDisallow: /', UA, '/')).toBe(false);
  });

  it('shares rules across stacked user agents and ignores comments', () => {
    const text = '# hello\nUser-agent: a\nUser-agent: b\nDisallow: /x # why\n';
    expect(isAllowedByRobots(text, 'b', '/x')).toBe(false);
    expect(isAllowedByRobots(text, 'a', '/x')).toBe(false);
  });
});

describe('page reading', () => {
  it('strips scripts, styles and tags, and decodes entities', () => {
    expect(htmlToText('<head><title>t</title></head><style>x</style><script>y</script><p>A &amp; B</p><!-- c -->')).toBe('A & B');
  });

  it('finds links, with either quote style', () => {
    expect(extractLinks(`<a class="x" href="/a">One</a><a href='/b'><b>Two</b></a><a>none</a>`)).toEqual([{ href: '/a', text: 'One' }, { href: '/b', text: 'Two' }]);
  });

  it('reads cookie names only, never values', () => {
    expect(setCookieNames({ 'set-cookie': ['_ga=abc; Path=/', 'session=secret; HttpOnly'] })).toEqual(['_ga', 'session']);
    expect(setCookieNames({ 'set-cookie': 'a=1' })).toEqual(['a']);
    expect(setCookieNames({})).toEqual([]);
  });

  it('counts trackers, but not ones a consent tool holds back', () => {
    expect(trackerScripts(sample('site-home.html'))).toEqual(['https://www.googletagmanager.com/gtag/js?id=G-X']);
  });

  it('spots a consent manager', () => {
    expect(detectCmp(sample('site-home-cmp.html'))).toBe(true);
    expect(detectCmp(sample('site-home.html'))).toBe(false);
  });

  it('reads a last updated date', () => {
    expect(readLastUpdated('Last updated: 2 March 2026. Hello')).toBe('2026-03-02');
    expect(readLastUpdated('Effective date 2026-01-15 ok')).toBe('2026-01-15');
    expect(readLastUpdated('Nothing here')).toBeNull();
  });

  it('checks the notice for what the matrix lists', () => {
    const facts = Object.fromEntries(analysePolicy(htmlToText(sample('site-privacy.html')), 'Kestrel Pay UK Ltd').map((f) => [f.key, f.value]));
    expect(facts).toMatchObject({
      [`${P}.names_company`]: true, [`${P}.rights_section`]: true, [`${P}.retention_statement`]: true, [`${P}.transfers_section`]: true,
      [`${P}.dpo_contact`]: true, [`${P}.complaint_route_ico`]: true, [`${P}.complaint_route_ndpc`]: false, [`${P}.children_section`]: true,
      [`${P}.stale_citation`]: false, [`${P}.last_updated`]: '2026-03-02',
    });
    expect(facts[`${P}.word_count`]).toBeGreaterThan(300);
  });

  it('flags the old Nigerian regulation when the 2023 Act is not mentioned', () => {
    const facts = Object.fromEntries(analysePolicy(htmlToText(sample('site-privacy-ng-stale.html')), 'X').map((f) => [f.key, f.value]));
    expect(facts[`${P}.stale_citation`]).toBe(true);
    expect(facts[`${P}.complaint_route_ndpc`]).toBe(true);
    const fine = Object.fromEntries(analysePolicy('We follow the NDPA, which replaced the NDPR.', 'X').map((f) => [f.key, f.value]));
    expect(fine[`${P}.stale_citation`]).toBe(false);
  });
});

describe('web.policy_scan', () => {
  const env = { WEB_SCAN_USER_AGENT: UA };

  function site(pages: Record<string, Partial<RawResponse> & { body?: string }>): Transport & { seen: string[]; agents: string[] } {
    const seen: string[] = [];
    const agents: string[] = [];
    const transport = (async (url: URL, options: { userAgent: string }) => {
      seen.push(url.pathname);
      agents.push(options.userAgent);
      const page = pages[url.pathname];
      return page ? { status: page.status ?? 200, headers: page.headers ?? {}, body: page.body ?? '' } : { status: 404, headers: {}, body: '' };
    }) as unknown as Transport & { seen: string[]; agents: string[] };
    transport.seen = seen;
    transport.agents = agents;
    return transport;
  }

  const fullSite = {
    '/robots.txt': { body: 'User-agent: *\nAllow: /\n' },
    '/': { body: sample('site-home.html'), headers: { 'set-cookie': ['_ga=1; Path=/', 'session=2'] } },
    '/privacy': { body: sample('site-privacy.html') },
    '/.well-known/security.txt': { body: 'Contact: mailto:security@example.com\n' },
  };

  const scan = (transport: Transport, website_url = 'https://kestrelpay.example/') =>
    createPolicyScanConnector({ env, transport, now: NOW }).lookup({ name: 'Kestrel Pay UK Ltd', jurisdiction: 'GB', website_url });

  it('reads the notice and cookie behaviour', async () => {
    const transport = site(fullSite);
    const result = await scan(transport);
    expect(result.status).toBe('found');
    expect(factMap(result)).toMatchObject({
      [`${P}.privacy_notice_found`]: true,
      [`${P}.privacy_notice_url`]: 'https://kestrelpay.example/privacy',
      [`${P}.names_company`]: true,
      [`${P}.complaint_route_ico`]: true,
      [`${P}.cookie_policy_found`]: true,
      [`${P}.terms_found`]: true,
      [`${P}.refund_policy_found`]: true,
      [`${P}.complaints_policy_found`]: false,
      [`${P}.cmp_detected`]: false,
      [`${P}.cookies_before_consent_count`]: 1,
      [`${P}.trackers_before_consent_count`]: 1,
      [`${P}.security_txt_found`]: true,
      [`${P}.ai_disclosure_found`]: true,
    });
    expect(result.provenance.rawHash).toMatch(/^[0-9a-f]{64}$/);
    // It identifies itself on every request.
    expect(new Set(transport.agents)).toEqual(new Set([UA]));
    // robots.txt is read before anything else.
    expect(transport.seen[0]).toBe('/robots.txt');
  });

  it('never stores the page or cookie values', async () => {
    const result = await scan(site(fullSite));
    const text = JSON.stringify(result);
    expect(text).not.toContain('<html');
    expect(text).not.toContain('session=2');
  });

  it('respects robots.txt for the whole site', async () => {
    const transport = site({ '/robots.txt': { body: 'User-agent: *\nDisallow: /\n' }, '/': { body: 'x' } });
    const result = await scan(transport);
    expect(result.status).toBe('unavailable');
    expect(result.message).toContain('robots.txt');
    expect(transport.seen).toEqual(['/robots.txt']);
  });

  it('respects robots.txt for the notice page', async () => {
    const transport = site({ ...fullSite, '/robots.txt': { body: 'User-agent: *\nDisallow: /privacy\nDisallow: /legal\n' } });
    const result = await scan(transport);
    expect(transport.seen).not.toContain('/privacy');
    expect(result.status).toBe('not_found');
  });

  it('respects a rule aimed at us by name', async () => {
    const transport = site({ ...fullSite, '/robots.txt': { body: 'User-agent: VeroScanBot\nDisallow: /\n\nUser-agent: *\nAllow: /\n' } });
    expect((await scan(transport)).status).toBe('unavailable');
  });

  it('holds off if robots.txt is failing, as RFC 9309 says', async () => {
    const transport = site({ ...fullSite, '/robots.txt': { status: 503 } });
    expect((await scan(transport)).status).toBe('unavailable');
    expect(transport.seen).toEqual(['/robots.txt']);
  });

  it('carries on if robots.txt is simply missing', async () => {
    const { '/robots.txt': _robots, ...rest } = fullSite;
    expect((await scan(site(rest))).status).toBe('found');
  });

  it('tries the usual paths if there is no footer link', async () => {
    const result = await scan(site({ ...fullSite, '/': { body: '<html><body>Hello</body></html>' }, '/privacy': { status: 404 }, '/privacy-policy': { body: sample('site-privacy.html') } }));
    expect(factMap(result)[`${P}.privacy_notice_url`]).toBe('https://kestrelpay.example/privacy-policy');
  });

  it('does not count a stub page as a notice', async () => {
    const result = await scan(site({ ...fullSite, '/privacy': { body: sample('site-privacy-short.html') } }));
    expect(result.status).toBe('not_found');
    expect(factMap(result)).toMatchObject({ [`${P}.privacy_notice_found`]: false, [`${P}.rights_section`]: false });
    expect(result.message).toContain("couldn't find a privacy notice");
  });

  it('counts a notice hosted elsewhere as found but unread', async () => {
    const transport = site({ '/': { body: '<a href="https://policies.other.example/x">Privacy</a>' } });
    const result = await scan(transport);
    expect(result.status).toBe('found');
    const facts = factMap(result);
    expect(facts[`${P}.privacy_notice_found`]).toBe(true);
    expect(facts[`${P}.rights_section`]).toBeUndefined();
    expect(transport.seen).not.toContain('/x');
  });

  it('does not count tag scripts when a consent manager may be holding them', async () => {
    const result = await scan(site({ ...fullSite, '/': { body: sample('site-home-cmp.html') } }));
    expect(factMap(result)[`${P}.cmp_detected`]).toBe(true);
    expect(factMap(result)[`${P}.trackers_before_consent_count`]).toBeUndefined();
  });

  it('does not publish what a page load cannot show', async () => {
    const facts = factMap(await scan(site(fullSite)));
    expect(Object.keys(facts).some((key) => /reject|banner|gpc/.test(key))).toBe(false);
  });

  it('refuses private addresses from the customer, kindly', async () => {
    const transport = site(fullSite);
    for (const url of ['http://169.254.169.254/', 'http://localhost/', 'http://[::1]/', 'file:///etc/passwd', 'http://10.0.0.1/']) {
      const result = await scan(transport, url);
      expect(result.status, url).toBe('unsupported');
      expect(result.facts).toEqual([]);
    }
    expect(transport.seen).toEqual([]);
  });

  it('refuses a site that redirects somewhere private', async () => {
    const transport = (async (url: URL) => {
      if (url.pathname === '/robots.txt') return { status: 200, headers: {}, body: '' };
      return { status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data/' }, body: '' };
    }) as Transport;
    const result = await scan(transport);
    expect(result.status).toBe('unsupported');
    expect(result.facts).toEqual([]);
  });

  it('adds https to a bare domain', async () => {
    const transport = site(fullSite);
    expect((await scan(transport, 'kestrelpay.example')).status).toBe('found');
  });

  it('is an error when the site is down', async () => {
    const transport = (async () => { throw new Error('ECONNREFUSED 8.8.8.8'); }) as Transport;
    const result = await scan(transport);
    expect(result.status).toBe('error');
    expect(result.message).not.toContain('8.8.8.8');
  });

  it('is an error when the home page errors', async () => {
    expect((await scan(site({ '/': { status: 500 } }))).status).toBe('error');
  });

  it('needs a website', async () => {
    const result = await createPolicyScanConnector({ env, transport: site({}), now: NOW }).lookup({ name: 'K', jurisdiction: 'GB' });
    expect(result.status).toBe('unsupported');
  });
});

import { describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  COUNTRIES,
  COUNTRY_CODES,
  COUNTRY_LABELS,
  countryCoverage,
  countryName,
  countryPlace,
  MVP_COUNTRIES,
  PERMISSIONS,
  ROLES,
  apiErrorSchema,
  can,
  contract,
  createApiClient,
  createCompanyBodySchema,
  createInvitationBodySchema,
  deleteAccountBodySchema,
  emailSchema,
  paginationQuerySchema,
  requestMagicLinkBodySchema,
  totpCodeBodySchema,
  updateCompanyBodySchema,
  updateMeBodySchema,
  type Endpoint,
} from '../src';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('schemas', () => {
  it('normalises email', () => {
    expect(emailSchema.parse('  Amara@KestrelPay.Example ')).toBe('amara@kestrelpay.example');
  });

  it.each(['', 'nope', 'a@', '@b.test', 'a b@c.test'])('rejects the email %j', (email) => {
    expect(emailSchema.safeParse(email).success).toBe(false);
  });

  it('messages are plain English', () => {
    const result = requestMagicLinkBodySchema.safeParse({ email: 'nope' });
    expect(result.error?.issues[0]?.message).toBe("That doesn't look like an email address yet.");
  });

  it('keeps the first three countries for older screens, and accepts any listed country', () => {
    expect([...MVP_COUNTRIES].sort()).toEqual(['GB', 'NG', 'US-DE']);
    expect(Object.keys(COUNTRY_LABELS).sort()).toEqual(['GB', 'NG', 'US-DE']);
    for (const country of [...MVP_COUNTRIES, 'FR', 'KE', 'US-CA', 'US-DC', 'US', 'JP']) {
      expect(createCompanyBodySchema.safeParse({ legalName: 'A', incorporationCountry: country }).success, country).toBe(true);
    }
    for (const country of ['ZZ', 'US-ZZ', 'gb', 'INTL', '']) {
      const result = createCompanyBodySchema.safeParse({ legalName: 'A', incorporationCountry: country });
      expect(result.success, country).toBe(false);
      expect(result.error?.issues[0]?.message).toBe("We don't recognise that country code.");
    }
  });

  it('lists every ISO country and every US state, each with an honest coverage level', () => {
    expect(COUNTRIES.filter((country) => country.parentCode === null)).toHaveLength(249);
    expect(COUNTRIES.filter((country) => country.parentCode === 'US')).toHaveLength(51);
    expect(new Set(COUNTRY_CODES).size).toBe(COUNTRY_CODES.length);
    const level = (code: string) => COUNTRIES.find((country) => country.code === code)?.coverage;
    expect([level('US-DE'), level('GB'), level('NG')]).toEqual(['full', 'full', 'full']);
    expect(level('FR')).toBe('registry');
    expect(level('KE')).toBe('international');
    expect(level('US-CA')).toBe('international');
    expect(countryName('GB')).toBe('United Kingdom');
    expect(countryName('KR')).toBe('South Korea');
    expect(countryPlace('NL')).toBe('the Netherlands');
  });

  it('says what a scan can check in plain words, never more', () => {
    expect(countryCoverage('KE')).toEqual({
      level: 'international',
      sentence: "We can check international rules and sanctions for companies in Kenya, but not yet Kenya's own company register or laws.",
    });
    expect(countryCoverage('US-CA').sentence).toBe("We can check US federal rules, international rules and sanctions for companies in California, but not yet California's own company register or state laws.");
    expect(countryCoverage('FR').sentence).toContain("but not yet France's own laws");
    expect(countryCoverage('NO', { countryRules: true }).sentence).toContain('a first set of');
    expect(countryCoverage('GB').level).toBe('full');
    for (const country of COUNTRIES) expect(countryCoverage(country.code).sentence).not.toMatch(/founder|—/i);
  });

  it('takes the level from whether the country register is switched on, when the caller knows', () => {
    expect(countryCoverage('AU', { registryOn: true }).level).toBe('registry');
    expect(countryCoverage('AU', { registryOn: false }).level).toBe('international');
    expect(countryCoverage('FR', { registryOn: false }).level).toBe('international');
    expect(countryCoverage('GB', { registryOn: false }).level).toBe('full');
    expect(countryCoverage('AU').level).toBe('international');
    expect(countryCoverage('AU', { registryOn: true, countryRules: true }).sentence).toBe(
      "We can check international rules, sanctions, Australia's company register and a first set of Australia's own rules (not yet reviewed) for companies in Australia.",
    );
    expect(countryCoverage('CH', { registryOn: false, countryRules: true }).sentence).toContain('(not yet reviewed)');
    expect(countryCoverage('NO', { registryOn: true }).sentence).not.toContain('reviewed');
  });

  it('a company update needs at least one field, and null clears optional ones', () => {
    expect(updateCompanyBodySchema.safeParse({}).success).toBe(false);
    expect(updateCompanyBodySchema.safeParse({ website: null }).success).toBe(true);
    expect(updateCompanyBodySchema.safeParse({ legalName: null }).success).toBe(false);
  });

  it('a website must be http or https', () => {
    const base = { legalName: 'A', incorporationCountry: 'GB' };
    expect(createCompanyBodySchema.safeParse({ ...base, website: 'https://a.example' }).success).toBe(true);
    expect(createCompanyBodySchema.safeParse({ ...base, website: 'ftp://a.example' }).success).toBe(false);
    expect(createCompanyBodySchema.safeParse({ ...base, website: 'javascript:alert(1)' }).success).toBe(false);
  });

  it('a TOTP code is exactly six digits', () => {
    expect(totpCodeBodySchema.safeParse({ code: '123456' }).success).toBe(true);
    for (const code of ['12345', '1234567', 'abcdef', '']) {
      expect(totpCodeBodySchema.safeParse({ code }).success).toBe(false);
    }
    expect(deleteAccountBodySchema.safeParse({ confirmEmail: 'a@b.test', totpCode: 'x' }).success).toBe(false);
  });

  it('an invitation defaults to the member role and refuses unknown ones', () => {
    expect(createInvitationBodySchema.parse({ email: 'a@b.test' }).role).toBe('member');
    expect(createInvitationBodySchema.safeParse({ email: 'a@b.test', role: 'root' }).success).toBe(false);
  });

  it('a profile update needs at least one field', () => {
    expect(updateMeBodySchema.safeParse({}).success).toBe(false);
    expect(updateMeBodySchema.safeParse({ name: 'A' }).success).toBe(true);
  });

  it('pagination has limits and a default', () => {
    expect(paginationQuerySchema.parse({}).limit).toBe(50);
    expect(paginationQuerySchema.parse({ limit: '10' }).limit).toBe(10);
    expect(paginationQuerySchema.safeParse({ limit: '0' }).success).toBe(false);
    expect(paginationQuerySchema.safeParse({ limit: '101' }).success).toBe(false);
    expect(paginationQuerySchema.safeParse({ cursor: "1' OR 1=1" }).success).toBe(false);
  });

  it('an error body must use a known code', () => {
    expect(apiErrorSchema.safeParse({ error: { code: 'not_found', message: 'x' } }).success).toBe(true);
    expect(apiErrorSchema.safeParse({ error: { code: 'made_up', message: 'x' } }).success).toBe(false);
  });
});

describe('permissions', () => {
  it('owner can do everything', () => {
    for (const permission of Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]) {
      expect(can('owner', permission)).toBe(true);
    }
  });

  it('only owners manage owners', () => {
    expect(ROLES.filter((role) => can(role, 'members.manageOwners'))).toEqual(['owner']);
  });

  it('lawyers read and do not write', () => {
    expect(can('lawyer', 'companies.read')).toBe(true);
    expect(can('lawyer', 'companies.write')).toBe(false);
    expect(can('lawyer', 'audit.read')).toBe(false);
  });

  it('members work on companies but do not manage people', () => {
    expect(can('member', 'companies.write')).toBe(true);
    expect(can('member', 'members.manage')).toBe(false);
    expect(can('member', 'invitations.manage')).toBe(false);
  });
});

describe('contract', () => {
  const endpoints = Object.values(contract).flatMap((group) => Object.values(group) as Endpoint[]);

  it('has no duplicate method and path', () => {
    const keys = endpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('every path with a placeholder declares it, and the reverse', () => {
    for (const endpoint of endpoints) {
      const inPath = [...endpoint.path.matchAll(/:([A-Za-z]+)/g)].map((match) => match[1]);
      const schema = endpoint.params as unknown as { shape?: Record<string, unknown> } | undefined;
      expect(Object.keys(schema?.shape ?? {}).sort(), endpoint.path).toEqual(inPath.sort());
    }
  });

  it('has no social sign-in', () => {
    // Google Drive, SharePoint and DocuSign are document connections a signed-in person adds under an organisation.
    // What must not exist is a way to SIGN IN through Google or any other provider.
    const signIn = endpoints.filter((endpoint) => /\/auth(\/|$)/.test(endpoint.path) || /sign-?in|log-?in/i.test(endpoint.path));
    expect(signIn.some((endpoint) => /google|oauth|social|microsoft|github/i.test(endpoint.path))).toBe(false);
    expect(endpoints.some((endpoint) => /\/oauth\//i.test(endpoint.path) && !/\/connections\//.test(endpoint.path))).toBe(false);
  });
});

describe('client', () => {
  it('builds the URL, sends credentials and JSON, and returns the parsed body', async () => {
    const fetchFn = vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse({ ok: true }, 202)));
    const client = createApiClient({ baseUrl: 'https://api.test', fetch: fetchFn });
    await expect(client.auth.requestMagicLink({ body: { email: 'A@B.test' } })).resolves.toEqual({ ok: true });

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.test/v1/auth/magic-link/request');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect((init.headers as Record<string, string>)['content-type']).toBe('application/json');
  });

  it('fills path values safely and adds query strings', async () => {
    const fetchFn = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse({ entries: [], nextCursor: null })),
    );
    const client = createApiClient({ baseUrl: '', fetch: fetchFn });
    await client.audit.list({ query: { limit: 5, cursor: '9' } });
    expect(fetchFn.mock.calls[0]?.[0]).toBe('/v1/audit?limit=5&cursor=9');

    await client.members.remove({ params: { userId: '../x?y' } }).catch(() => undefined);
    const url = fetchFn.mock.calls[1]?.[0] as string;
    expect(url).toBe('/v1/members/..%2Fx%3Fy');
  });

  it('adds caller headers, for forwarding cookies during server rendering', async () => {
    const fetchFn = vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse({ ok: true })));
    const client = createApiClient({ baseUrl: '', fetch: fetchFn, headers: () => ({ cookie: 'a=b' }) });
    await client.auth.logout();
    expect((fetchFn.mock.calls[0]?.[1]?.headers as Record<string, string>).cookie).toBe('a=b');
  });

  it('stops invalid input before sending, with the same plain message', async () => {
    const fetchFn = vi.fn<typeof fetch>();
    const client = createApiClient({ baseUrl: '', fetch: fetchFn });
    const error = await client.auth.requestMagicLink({ body: { email: 'nope' } }).catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'invalid_input', message: "That doesn't look like an email address yet." });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('turns an error response into ApiError', async () => {
    const fetchFn = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse({ error: { code: 'forbidden', message: "You don't have permission." } }, 403)),
    );
    const error = await createApiClient({ baseUrl: '', fetch: fetchFn }).me.get().catch((reason: unknown) => reason);
    expect(error).toMatchObject({ status: 403, code: 'forbidden', message: "You don't have permission." });
  });

  it('handles a network failure', async () => {
    const fetchFn = vi.fn<typeof fetch>(() => Promise.reject(new Error('offline')));
    const error = await createApiClient({ baseUrl: '', fetch: fetchFn }).me.get().catch((reason: unknown) => reason);
    expect(error).toMatchObject({ status: 0, code: 'network_error' });
  });

  it('handles an error that is not JSON', async () => {
    const fetchFn = vi.fn<typeof fetch>(() => Promise.resolve(new Response('<html>Bad gateway</html>', { status: 502 })));
    const error = await createApiClient({ baseUrl: '', fetch: fetchFn }).me.get().catch((reason: unknown) => reason);
    expect(error).toMatchObject({ status: 502, code: 'unexpected_response' });
  });

  it('refuses a success response that breaks the contract', async () => {
    const fetchFn = vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse({ unexpected: true })));
    const error = await createApiClient({ baseUrl: '', fetch: fetchFn }).me.get().catch((reason: unknown) => reason);
    expect(error).toMatchObject({ code: 'unexpected_response' });
  });

  it('removes fields the contract does not declare', async () => {
    const fetchFn = vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse({ ok: true, secret: 'x' })));
    const result = await createApiClient({ baseUrl: '', fetch: fetchFn }).auth.logout();
    expect(result).toEqual({ ok: true });
  });
});

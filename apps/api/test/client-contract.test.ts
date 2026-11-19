import { ApiError, contract, createApiClient, type ApiClient, type Endpoint } from '@vero/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ALLOWED_ORIGIN, startHarness, uniqueEmail, type Harness } from './support/harness';

/** The typed client the web app will use, running against the real API. */
describe('typed client against the real API', () => {
  let h: Harness;
  let client: ApiClient;
  let cookie = '';

  beforeAll(async () => {
    h = await startHarness();
    const fetchViaInject: typeof fetch = async (input, init) => {
      const url = new URL(input);
      const response = await h.app.inject({
        method: init?.method as 'GET',
        url: url.pathname + url.search,
        headers: { ...(init?.headers as Record<string, string>), origin: ALLOWED_ORIGIN, ...(cookie ? { cookie } : {}) },
        ...(init?.body ? { payload: init.body as string } : {}),
      });
      const set = response.cookies.find((item) => item.name === 'vero_session');
      if (set) cookie = set.value ? `vero_session=${set.value}` : '';
      return new Response(response.body || null, { status: response.statusCode });
    };
    client = createApiClient({ baseUrl: 'https://api.vero.test', fetch: fetchViaInject });
  });
  afterAll(() => h.close());

  it('runs a whole journey, with every response passing its schema', async () => {
    const email = uniqueEmail('journey');
    await client.auth.requestMagicLink({ body: { email } });
    const signIn = await client.auth.verifyMagicLink({ body: { token: await h.latestToken(email) } });
    expect(signIn.isNewUser).toBe(true);

    const me = await client.me.update({ body: { name: 'Journey' } });
    expect(me.user.name).toBe('Journey');

    const company = await client.companies.create({
      body: { legalName: 'Journey Ltd', incorporationCountry: 'NG', markets: [{ country: 'NG', kind: 'operates' }] },
    });
    const updated = await client.companies.update({ params: { companyId: company.id }, body: { stage: 'seed' } });
    expect(updated.stage).toBe('seed');
    expect((await client.companies.get({ params: { companyId: company.id } })).id).toBe(company.id);
    expect((await client.companies.list()).companies).toHaveLength(1);

    const invitation = await client.invitations.create({ body: { email: uniqueEmail('teammate') } });
    expect((await client.invitations.list()).invitations[0]?.id).toBe(invitation.id);
    await client.invitations.revoke({ params: { invitationId: invitation.id } });

    expect((await client.members.list()).members).toHaveLength(1);
    expect((await client.organisations.list()).organisations).toHaveLength(1);
    expect((await client.organisations.updateCurrent({ body: { name: 'Journey Org' } })).name).toBe('Journey Org');
    expect((await client.organisations.current()).name).toBe('Journey Org');

    const audit = await client.audit.list({ query: { limit: 5 } });
    expect(audit.entries).toHaveLength(5);
    const notifications = await client.notifications.list({ query: { unreadOnly: 'true' } });
    expect(notifications.unreadCount).toBe(0);
    expect((await client.notifications.markAllRead()).updated).toBe(0);

    const enrol = await client.auth.totpEnrol();
    expect(enrol.otpauthUri).toContain('otpauth://');

    await client.auth.logout();
    await expect(client.me.get()).rejects.toMatchObject({ status: 401, code: 'unauthenticated' });
  });

  it('turns API errors into ApiError with the plain message', async () => {
    const email = uniqueEmail('errors');
    await client.auth.requestMagicLink({ body: { email } });
    await client.auth.verifyMagicLink({ body: { token: await h.latestToken(email) } });

    const error = await client.companies
      .get({ params: { companyId: '11111111-1111-4111-8111-111111111111' } })
      .catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, code: 'not_found', message: 'That company could not be found.' });
  });

  it('every contract endpoint has a real route', () => {
    const endpoints = Object.values(contract).flatMap((group) => Object.values(group) as Endpoint[]);
    expect(endpoints.length).toBeGreaterThan(25);
    for (const endpoint of endpoints) {
      const found = h.app.hasRoute({ url: endpoint.path, method: endpoint.method });
      expect(found, `${endpoint.method} ${endpoint.path}`).toBe(true);
    }
  });
});

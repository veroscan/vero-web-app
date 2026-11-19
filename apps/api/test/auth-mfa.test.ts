import { Secret, TOTP } from 'otpauth';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { errorOf, startHarness, uniqueEmail, type Harness, type SignedIn } from './support/harness';

const STEP_MS = 30_000;

function codeAt(secret: string, time: Date): string {
  return new TOTP({ secret: Secret.fromBase32(secret), digits: 6, period: 30, algorithm: 'SHA1' }).generate({
    timestamp: time.getTime(),
  });
}

describe('TOTP', () => {
  let h: Harness;
  let time: Date;

  beforeAll(async () => {
    h = await startHarness();
  });
  afterAll(() => h.close());
  beforeEach(() => {
    // Every test moves on a step, so codes never collide with an earlier test's clock.
    time = new Date();
    h.setNow(time);
  });

  const advance = () => {
    time = new Date(time.getTime() + STEP_MS * 2);
    h.setNow(time);
  };

  async function enrol(person: SignedIn): Promise<string> {
    const response = await h.request('POST', '/v1/auth/mfa/totp/enrol', { cookie: person.cookie });
    expect(response.statusCode).toBe(200);
    return response.json<{ secret: string }>().secret;
  }

  async function enableMfa(person: SignedIn): Promise<string> {
    const secret = await enrol(person);
    const response = await h.request('POST', '/v1/auth/mfa/totp/verify', {
      cookie: person.cookie,
      body: { code: codeAt(secret, time) },
    });
    expect(response.statusCode).toBe(200);
    advance();
    return secret;
  }

  it('enrolment returns a secret and a QR address, and stores the secret encrypted', async () => {
    const person = await h.signIn();
    const response = await h.request('POST', '/v1/auth/mfa/totp/enrol', { cookie: person.cookie });
    const body = response.json<{ secret: string; otpauthUri: string }>();
    expect(body.otpauthUri).toMatch(/^otpauth:\/\/totp\//);
    expect(body.otpauthUri).toContain('Vero');

    const { rows } = await h.admin.query<{ totp_secret_encrypted: string; mfa_enabled: boolean }>(
      'SELECT totp_secret_encrypted, mfa_enabled FROM "user" WHERE id = $1',
      [person.userId],
    );
    expect(rows[0]?.totp_secret_encrypted).toBeTruthy();
    expect(rows[0]?.totp_secret_encrypted).not.toContain(body.secret);
    // Not on until a first code proves the app was set up.
    expect(rows[0]?.mfa_enabled).toBe(false);
  });

  it('a wrong first code does not switch it on', async () => {
    const person = await h.signIn();
    await enrol(person);
    const response = await h.request('POST', '/v1/auth/mfa/totp/verify', { cookie: person.cookie, body: { code: '000000' } });
    expect(response.statusCode).toBe(400);
    expect(errorOf(response).code).toBe('totp_invalid');
    const me = await h.request('GET', '/v1/me', { cookie: person.cookie });
    expect(me.json<{ user: { mfaEnabled: boolean } }>().user.mfaEnabled).toBe(false);
  });

  it('verifying before enrolling is refused', async () => {
    const person = await h.signIn();
    const response = await h.request('POST', '/v1/auth/mfa/totp/verify', { cookie: person.cookie, body: { code: '123456' } });
    expect(response.statusCode).toBe(409);
    expect(errorOf(response).code).toBe('mfa_not_started');
  });

  it('switching it on keeps this session and signs out other devices', async () => {
    const person = await h.signIn();
    const otherDevice = await h.signIn(person.email);
    await enableMfa(person);
    expect((await h.request('GET', '/v1/me', { cookie: person.cookie })).statusCode).toBe(200);
    expect((await h.request('GET', '/v1/me', { cookie: otherDevice.cookie })).statusCode).toBe(401);
  });

  it('enrolling again while it is on is refused', async () => {
    const person = await h.signIn();
    await enableMfa(person);
    const response = await h.request('POST', '/v1/auth/mfa/totp/enrol', { cookie: person.cookie });
    expect(response.statusCode).toBe(409);
    expect(errorOf(response).code).toBe('mfa_already_enabled');
  });

  it('after sign-in, nothing works until the code is entered', async () => {
    const person = await h.signIn();
    const secret = await enableMfa(person);

    const second = await h.signIn(person.email);
    const blocked = await h.request('GET', '/v1/me', { cookie: second.cookie });
    expect(blocked.statusCode).toBe(403);
    expect(errorOf(blocked).code).toBe('mfa_required');
    expect((await h.request('GET', '/v1/companies', { cookie: second.cookie })).statusCode).toBe(403);

    const wrong = await h.request('POST', '/v1/auth/mfa/totp/challenge', { cookie: second.cookie, body: { code: '000000' } });
    expect(wrong.statusCode).toBe(400);
    expect((await h.request('GET', '/v1/me', { cookie: second.cookie })).statusCode).toBe(403);

    const right = await h.request('POST', '/v1/auth/mfa/totp/challenge', {
      cookie: second.cookie,
      body: { code: codeAt(secret, time) },
    });
    expect(right.statusCode).toBe(200);
    expect((await h.request('GET', '/v1/me', { cookie: second.cookie })).statusCode).toBe(200);
  });

  it('says so in the sign-in response', async () => {
    const person = await h.signIn();
    await enableMfa(person);
    const token = await h.requestLink(person.email);
    const response = await h.request('POST', '/v1/auth/magic-link/verify', { body: { token } });
    expect(response.json<{ mfaRequired: boolean }>().mfaRequired).toBe(true);
  });

  it('a code cannot be used twice', async () => {
    const person = await h.signIn();
    const secret = await enableMfa(person);
    const code = codeAt(secret, time);
    const first = await h.signIn(person.email);
    const second = await h.signIn(person.email);

    const ok = await h.request('POST', '/v1/auth/mfa/totp/challenge', { cookie: first.cookie, body: { code } });
    expect(ok.statusCode).toBe(200);
    const replay = await h.request('POST', '/v1/auth/mfa/totp/challenge', { cookie: second.cookie, body: { code } });
    expect(replay.statusCode).toBe(400);
    expect(errorOf(replay).code).toBe('totp_invalid');
  });

  it('refuses a code from long ago', async () => {
    const person = await h.signIn();
    const secret = await enableMfa(person);
    const second = await h.signIn(person.email);
    const old = codeAt(secret, new Date(time.getTime() - STEP_MS * 10));
    const response = await h.request('POST', '/v1/auth/mfa/totp/challenge', { cookie: second.cookie, body: { code: old } });
    expect(response.statusCode).toBe(400);
  });

  it.each([['letters', 'abcdef'], ['too short', '123'], ['too long', '1234567'], ['missing', undefined]])(
    'rejects a malformed code: %s',
    async (_label, code) => {
      const person = await h.signIn();
      const response = await h.request('POST', '/v1/auth/mfa/totp/verify', { cookie: person.cookie, body: { code } });
      expect(response.statusCode).toBe(400);
      expect(errorOf(response).code).toBe('invalid_input');
    },
  );

  it('the challenge says so when it is not on', async () => {
    const person = await h.signIn();
    const response = await h.request('POST', '/v1/auth/mfa/totp/challenge', { cookie: person.cookie, body: { code: '123456' } });
    expect(response.statusCode).toBe(409);
    expect(errorOf(response).code).toBe('mfa_not_enabled');
  });

  it('can be switched off with a valid code, which removes the secret', async () => {
    const person = await h.signIn();
    const secret = await enableMfa(person);

    const wrong = await h.request('POST', '/v1/auth/mfa/totp/disable', { cookie: person.cookie, body: { code: '000000' } });
    expect(wrong.statusCode).toBe(400);

    const right = await h.request('POST', '/v1/auth/mfa/totp/disable', {
      cookie: person.cookie,
      body: { code: codeAt(secret, time) },
    });
    expect(right.statusCode).toBe(200);
    expect(right.json<{ mfaEnabled: boolean }>().mfaEnabled).toBe(false);
    const { rows } = await h.admin.query<{ totp_secret_encrypted: string | null }>(
      'SELECT totp_secret_encrypted FROM "user" WHERE id = $1',
      [person.userId],
    );
    expect(rows[0]?.totp_secret_encrypted).toBeNull();
  });

  describe('recovery codes', () => {
    async function enableWithCodes(person: SignedIn): Promise<{ secret: string; codes: string[] }> {
      const secret = await enrol(person);
      const response = await h.request('POST', '/v1/auth/mfa/totp/verify', { cookie: person.cookie, body: { code: codeAt(secret, time) } });
      expect(response.statusCode).toBe(200);
      advance();
      return { secret, codes: response.json<{ recoveryCodes: string[] }>().recoveryCodes };
    }
    const recover = (who: SignedIn, code: string) => h.request('POST', '/v1/auth/mfa/recovery', { cookie: who.cookie, body: { code } });

    it('ten are shown once when two-step sign-in goes on, and only their hashes are kept', async () => {
      const person = await h.signIn();
      const { codes } = await enableWithCodes(person);
      expect(codes).toHaveLength(10);
      expect(new Set(codes).size).toBe(10);
      for (const code of codes) expect(code).toMatch(/^[a-z2-7]{5}-[a-z2-7]{5}$/);
      const { rows } = await h.admin.query<{ code_hash: string }>(`SELECT code_hash FROM mfa_recovery_code WHERE user_id = $1`, [person.userId]);
      expect(rows).toHaveLength(10);
      const stored = JSON.stringify(rows);
      for (const code of codes) {
        expect(stored).not.toContain(code);
        expect(stored).not.toContain(code.replace('-', ''));
      }
      // Never shown again: /v1/me and the audit say nothing of them.
      const me = await h.request('GET', '/v1/me', { cookie: person.cookie });
      for (const code of codes) expect(me.body).not.toContain(code);
      const audit = await h.admin.query<{ metadata: Record<string, unknown> }>(`SELECT metadata FROM audit_log WHERE actor_id = $1 AND action = 'auth.mfa.recovery_codes_created'`, [person.userId]);
      expect(audit.rows).toEqual([{ metadata: { count: 10 } }]);
    });

    it('a code signs someone in once, in any case and spacing, and says how many are left', async () => {
      const person = await h.signIn();
      const { codes } = await enableWithCodes(person);
      const second = await h.signIn(person.email);
      expect((await recover(second, 'aaaaa-aaaaa')).statusCode).toBe(400);
      expect((await h.request('GET', '/v1/me', { cookie: second.cookie })).statusCode).toBe(403);
      const typed = ` ${(codes[0] ?? '').toUpperCase().replace('-', ' ')} `;
      const ok = await recover(second, typed);
      expect(ok.statusCode).toBe(200);
      expect(ok.json()).toEqual({ mfaEnabled: true, recoveryCodesLeft: 9 });
      expect((await h.request('GET', '/v1/me', { cookie: second.cookie })).statusCode).toBe(200);

      const third = await h.signIn(person.email);
      const again = await recover(third, codes[0] ?? '');
      expect(again.statusCode).toBe(400);
      expect(errorOf(again).message).toBe("That recovery code didn't work. Each one works only once.");
      expect((await recover(third, 'not a code')).statusCode).toBe(400);
      const used = await h.admin.query(`SELECT 1 FROM audit_log WHERE actor_id = $1 AND action = 'auth.mfa.recovery_code_used'`, [person.userId]);
      expect(used.rows).toHaveLength(1);
    });

    it('new codes need a code from the app, and end the old ones; switching off removes them', async () => {
      const person = await h.signIn();
      const { secret, codes } = await enableWithCodes(person);
      expect((await h.request('POST', '/v1/auth/mfa/recovery-codes', { cookie: person.cookie, body: { code: '000000' } })).statusCode).toBe(400);
      advance();
      const fresh = await h.request('POST', '/v1/auth/mfa/recovery-codes', { cookie: person.cookie, body: { code: codeAt(secret, time) } });
      expect(fresh.statusCode).toBe(200);
      const newCodes = fresh.json<{ recoveryCodes: string[] }>().recoveryCodes;
      expect(newCodes).toHaveLength(10);
      const second = await h.signIn(person.email);
      expect((await recover(second, codes[1] ?? '')).statusCode).toBe(400);
      expect((await recover(second, newCodes[1] ?? '')).statusCode).toBe(200);

      advance();
      const off = await h.request('POST', '/v1/auth/mfa/totp/disable', { cookie: person.cookie, body: { code: codeAt(secret, time) } });
      expect(off.statusCode).toBe(200);
      expect((await h.admin.query(`SELECT 1 FROM mfa_recovery_code WHERE user_id = $1`, [person.userId])).rows).toEqual([]);
    });

    it('is refused when two-step sign-in is off, and signed out gets 401', async () => {
      const person = await h.signIn();
      expect((await recover(person, 'abcde-fghij')).statusCode).toBe(409);
      expect((await h.request('POST', '/v1/auth/mfa/recovery-codes', { cookie: person.cookie, body: { code: '123456' } })).statusCode).toBe(409);
      expect((await h.request('POST', '/v1/auth/mfa/recovery', { body: { code: 'abcde-fghij' } })).statusCode).toBe(401);
    });
  });

  it('audits being switched on, a failed code and being switched off', async () => {
    const person = await h.signIn();
    const secret = await enableMfa(person);
    const second = await h.signIn(person.email);
    await h.request('POST', '/v1/auth/mfa/totp/challenge', { cookie: second.cookie, body: { code: '000000' } });
    await h.request('POST', '/v1/auth/mfa/totp/disable', { cookie: person.cookie, body: { code: codeAt(secret, time) } });
    const { rows } = await h.admin.query<{ action: string }>('SELECT action FROM audit_log WHERE actor_id = $1', [person.userId]);
    const actions = rows.map((row) => row.action);
    expect(actions).toEqual(expect.arrayContaining(['auth.mfa.enabled', 'auth.mfa.failed', 'auth.mfa.disabled']));
  });
});

describe('TOTP attempt limit', () => {
  let h: Harness;
  beforeAll(async () => {
    h = await startHarness({ RATE_LIMIT_TOTP_PER_USER_PER_15_MIN: '3' });
  });
  afterAll(() => h.close());

  it('stops guessing after the limit, even with a fresh session', async () => {
    const person = await h.signIn(uniqueEmail());
    const enrol = await h.request('POST', '/v1/auth/mfa/totp/enrol', { cookie: person.cookie });
    expect(enrol.statusCode).toBe(200);
    const attempt = () =>
      h.request('POST', '/v1/auth/mfa/totp/verify', { cookie: person.cookie, body: { code: '000000' } });

    for (let tries = 0; tries < 3; tries += 1) expect((await attempt()).statusCode).toBe(400);
    const blocked = await attempt();
    expect(blocked.statusCode).toBe(429);
    expect(errorOf(blocked).code).toBe('rate_limited');
    expect(blocked.headers['retry-after']).toBeDefined();
  });
});

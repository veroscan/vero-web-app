import { contract } from '@vero/shared';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { defineRoute } from '../../http/route';
import {
  completeTotpChallenge,
  confirmTotpEnrolment,
  deleteAccount,
  disableTotp,
  getMe,
  logout,
  logoutEverywhere,
  regenerateRecoveryCodes,
  requestMagicLink,
  startTotpEnrolment,
  verifyMagicLink,
} from './service';
import { useRecoveryCode } from './recovery';
import { clearSessionCookie, isNativeClient, setSessionCookie } from './session';

export function registerAuthRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.auth.requestMagicLink, { auth: 'public' }, async ({ body, meta }) => {
    await requestMagicLink(deps, body, meta);
    return { ok: true as const };
  });

  defineRoute(app, deps, contract.auth.verifyMagicLink, { auth: 'public' }, async ({ body, meta, reply, request }) => {
    const { sessionToken, response } = await verifyMagicLink(deps, body.token, meta);
    // The phone app keeps the token in the device's secure store; a browser only ever gets the HttpOnly cookie.
    if (isNativeClient(request)) return { ...response, sessionToken };
    setSessionCookie(reply, deps.config, sessionToken);
    return response;
  });

  // Signing out must work even if the person never finished the TOTP step.
  defineRoute(app, deps, contract.auth.logout, { auth: 'pending' }, async ({ session, meta, reply }) => {
    await logout(deps, session, meta);
    clearSessionCookie(reply, deps.config);
    return { ok: true as const };
  });

  defineRoute(app, deps, contract.auth.logoutEverywhere, { auth: 'session' }, async ({ session, meta, reply }) => {
    await logoutEverywhere(deps, session, meta);
    clearSessionCookie(reply, deps.config);
    return { ok: true as const };
  });

  defineRoute(app, deps, contract.auth.totpEnrol, { auth: 'session' }, ({ session, meta }) =>
    startTotpEnrolment(deps, session, meta),
  );

  defineRoute(app, deps, contract.auth.totpVerify, { auth: 'session' }, async ({ session, body, meta }) => {
    const recoveryCodes = await confirmTotpEnrolment(deps, session, body.code, meta);
    return { mfaEnabled: true, recoveryCodes };
  });

  defineRoute(app, deps, contract.auth.recoveryCodes, { auth: 'session' }, async ({ session, body, meta }) => ({
    recoveryCodes: await regenerateRecoveryCodes(deps, session, body.code, meta),
  }));

  defineRoute(app, deps, contract.auth.recoveryChallenge, { auth: 'pending' }, async ({ session, body, meta }) => {
    const recoveryCodesLeft = await useRecoveryCode(deps, session, body.code, meta);
    return { mfaEnabled: true, recoveryCodesLeft };
  });

  defineRoute(app, deps, contract.auth.totpChallenge, { auth: 'pending' }, async ({ session, body, meta }) => {
    await completeTotpChallenge(deps, session, body.code, meta);
    return { mfaEnabled: true };
  });

  defineRoute(app, deps, contract.auth.totpDisable, { auth: 'session' }, async ({ session, body, meta }) => {
    await disableTotp(deps, session, body.code, meta);
    return { mfaEnabled: false };
  });

  defineRoute(app, deps, contract.me.get, { auth: 'session' }, ({ session }) => getMe(deps, session));

  defineRoute(app, deps, contract.me.update, { auth: 'session' }, async ({ session, body }) => {
    await deps.db.withUser(session.userId, (tx) =>
      tx.update(schema.user).set(body).where(eq(schema.user.id, session.userId)),
    );
    return getMe(deps, session);
  });

  defineRoute(app, deps, contract.me.deleteAccount, { auth: 'session' }, async ({ session, body, meta, reply, request }) => {
    await deleteAccount(deps, session, body, meta, (context, message) => request.log.error(context, message));
    clearSessionCookie(reply, deps.config);
    return { ok: true as const };
  });
}

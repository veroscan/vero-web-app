import { contract } from '@vero/shared';
import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import type { OrgContext } from '../auth/session';
import { pickerStateOrganisation, stateRefusedMessage } from '../file-pickers/state';
import { GOOGLE_DRIVE_REDIRECT_PATH } from './config';
import { completeGoogleDrive, disconnectGoogleDrive, GOOGLE_DRIVE_NAME, googleDrivePickerToken, googleDriveStatus, queueGoogleDriveFiles, startGoogleDrive } from './service';

function sameOrganisation(org: OrgContext, id: string): string {
  if (org.organisationId !== id) throw errors.notAMember();
  return id;
}

/** Owners and admins only, on every route. Each says Google Drive isn't connected yet until it is configured. */
export function registerGoogleDriveRoutes(app: FastifyInstance, deps: AppDeps): void {
  const options = { auth: 'org', permission: 'connections.manage' } as const;
  const routes = contract.filePickers;

  defineRoute(app, deps, routes.googleDriveStatus, options, async ({ org, params }) => googleDriveStatus(deps, sameOrganisation(org, params.id)));

  defineRoute(app, deps, routes.googleDriveStart, options, async ({ org, params, session }) => startGoogleDrive(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId }));

  defineRoute(app, deps, routes.googleDriveCallback, options, async ({ org, params, query, session, meta }) =>
    completeGoogleDrive(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, code: query.code, state: query.state, error: query.error, meta }),
  );

  defineRoute(app, deps, routes.googleDrivePickerToken, options, async ({ org, params, session, meta }) =>
    googleDrivePickerToken(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, meta }),
  );

  defineRoute(app, deps, routes.googleDriveFiles, options, async ({ org, params, body, session, meta }) =>
    queueGoogleDriveFiles(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, body, meta }),
  );

  defineRoute(app, deps, routes.googleDriveDisconnect, options, async ({ org, params, session, meta }) =>
    disconnectGoogleDrive(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, meta }),
  );

  // Google sends people back to one fixed redirect address, which can't name an organisation.
  // This reads the organisation from our own signed state and passes the person on to its
  // callback, where the state is checked in full and used up. Nothing is stored here.
  app.get(GOOGLE_DRIVE_REDIRECT_PATH, async (request, reply) => {
    if (!deps.config.googleDrive) throw errors.notFound('That page');
    const parsed = routes.googleDriveCallback.query.safeParse(request.query);
    if (!parsed.success) throw errors.invalidInput(stateRefusedMessage(GOOGLE_DRIVE_NAME));
    const organisationId = pickerStateOrganisation(deps, 'google_drive', parsed.data.state);
    if (!organisationId) throw errors.invalidInput(stateRefusedMessage(GOOGLE_DRIVE_NAME));
    const query = new URLSearchParams({ state: parsed.data.state });
    if (parsed.data.code) query.set('code', parsed.data.code);
    if (parsed.data.error) query.set('error', parsed.data.error);
    return reply.code(302).header('location', `/v1/organisations/${organisationId}/connections/google-drive/callback?${query.toString()}`).send();
  });
}

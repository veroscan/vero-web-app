import { contract } from '@vero/shared';
import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import type { OrgContext } from '../auth/session';
import { pickerStateOrganisation, stateRefusedMessage } from '../file-pickers/state';
import { SHAREPOINT_REDIRECT_PATH } from './config';
import { completeSharepoint, disconnectSharepoint, queueSharepointFiles, SHAREPOINT_NAME, sharepointStatus, startSharepoint } from './service';

function sameOrganisation(org: OrgContext, id: string): string {
  if (org.organisationId !== id) throw errors.notAMember();
  return id;
}

/** Owners and admins only, on every route. Each says SharePoint isn't connected yet until it is configured. */
export function registerSharepointRoutes(app: FastifyInstance, deps: AppDeps): void {
  const options = { auth: 'org', permission: 'connections.manage' } as const;
  const routes = contract.filePickers;

  defineRoute(app, deps, routes.sharepointStatus, options, async ({ org, params }) => sharepointStatus(deps, sameOrganisation(org, params.id)));

  defineRoute(app, deps, routes.sharepointStart, options, async ({ org, params, session }) => startSharepoint(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId }));

  defineRoute(app, deps, routes.sharepointCallback, options, async ({ org, params, query, session, meta }) =>
    completeSharepoint(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, code: query.code, state: query.state, error: query.error, meta }),
  );

  defineRoute(app, deps, routes.sharepointFiles, options, async ({ org, params, body, session, meta }) =>
    queueSharepointFiles(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, body, meta }),
  );

  defineRoute(app, deps, routes.sharepointDisconnect, options, async ({ org, params, session, meta }) =>
    disconnectSharepoint(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, meta }),
  );

  // Microsoft sends people back to one fixed redirect address. As with Google and DocuSign, this
  // only reads the organisation from our signed state and forwards; the callback checks it in full.
  app.get(SHAREPOINT_REDIRECT_PATH, async (request, reply) => {
    if (!deps.config.sharepoint) throw errors.notFound('That page');
    const parsed = routes.sharepointCallback.query.safeParse(request.query);
    if (!parsed.success) throw errors.invalidInput(stateRefusedMessage(SHAREPOINT_NAME));
    const organisationId = pickerStateOrganisation(deps, 'sharepoint', parsed.data.state);
    if (!organisationId) throw errors.invalidInput(stateRefusedMessage(SHAREPOINT_NAME));
    const query = new URLSearchParams({ state: parsed.data.state });
    if (parsed.data.code) query.set('code', parsed.data.code);
    if (parsed.data.error) query.set('error', parsed.data.error);
    return reply.code(302).header('location', `/v1/organisations/${organisationId}/connections/sharepoint/callback?${query.toString()}`).send();
  });
}

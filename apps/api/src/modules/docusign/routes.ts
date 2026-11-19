import { contract } from '@vero/shared';
import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import type { OrgContext } from '../auth/session';
import { DOCUSIGN_REDIRECT_PATH } from './config';
import { completeConnect, disconnect, docusignStatus, listEnvelopes, queuePull, startConnect } from './service';
import { DOCUSIGN_STATE_REFUSED, docusignStateOrganisation } from './state';

function sameOrganisation(org: OrgContext, id: string): string {
  if (org.organisationId !== id) throw errors.notAMember();
  return id;
}

/** Owners and admins only, on every route. Each says DocuSign isn't connected yet until it is configured. */
export function registerDocusignRoutes(app: FastifyInstance, deps: AppDeps): void {
  const options = { auth: 'org', permission: 'connections.manage' } as const;
  const routes = contract.documentConnections;

  defineRoute(app, deps, routes.docusignStatus, options, async ({ org, params }) => docusignStatus(deps, sameOrganisation(org, params.id)));

  defineRoute(app, deps, routes.docusignStart, options, async ({ org, params, session }) => startConnect(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId }));

  defineRoute(app, deps, routes.docusignCallback, options, async ({ org, params, query, session, meta }) =>
    completeConnect(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, code: query.code, state: query.state, error: query.error, meta }),
  );

  defineRoute(app, deps, routes.docusignEnvelopes, options, async ({ org, params }) => listEnvelopes(deps, sameOrganisation(org, params.id)));

  defineRoute(app, deps, routes.docusignPull, options, async ({ org, params, body, session, meta }) =>
    queuePull(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, body, meta }),
  );

  defineRoute(app, deps, routes.docusignDisconnect, options, async ({ org, params, session, meta }) =>
    disconnect(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, meta }),
  );

  // DocuSign sends people back to one fixed redirect address, which can't name an organisation.
  // This reads the organisation from our own signed state and passes the person on to its
  // callback, where the state is checked in full and used up. Nothing is stored here.
  app.get(DOCUSIGN_REDIRECT_PATH, async (request, reply) => {
    if (!deps.config.docusign) throw errors.notFound('That page');
    const parsed = routes.docusignCallback.query.safeParse(request.query);
    if (!parsed.success) throw errors.invalidInput(DOCUSIGN_STATE_REFUSED);
    const organisationId = docusignStateOrganisation(deps, parsed.data.state);
    if (!organisationId) throw errors.invalidInput(DOCUSIGN_STATE_REFUSED);
    const query = new URLSearchParams({ state: parsed.data.state });
    if (parsed.data.code) query.set('code', parsed.data.code);
    if (parsed.data.error) query.set('error', parsed.data.error);
    return reply.code(302).header('location', `/v1/organisations/${organisationId}/connections/docusign/callback?${query.toString()}`).send();
  });
}

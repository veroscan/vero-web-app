import { contract } from '@vero/shared';
import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import type { OrgContext } from '../auth/session';
import { completeInstall, disconnect, githubStatus, queueSync, selectRepositories, startInstall } from './service';
import { STATE_REFUSED, stateOrganisation } from './state';
import { registerGithubWebhook } from './webhook';

/** The address to give GitHub as the app's Setup URL, after API_BASE_URL. */
export const GITHUB_SETUP_PATH = '/v1/connections/github/setup';

/** The path names an organisation; it must be the one the person is signed in to. */
function sameOrganisation(org: OrgContext, id: string): string {
  if (org.organisationId !== id) throw errors.notAMember();
  return id;
}

/** Owners and admins only, on every route. Each says "not connected yet" until the app is set up. */
export function registerGithubRoutes(app: FastifyInstance, deps: AppDeps): void {
  const options = { auth: 'org', permission: 'connections.manage' } as const;

  defineRoute(app, deps, contract.connections.githubStatus, options, async ({ org, params }) => githubStatus(deps, sameOrganisation(org, params.id)));

  defineRoute(app, deps, contract.connections.githubStart, options, async ({ org, params, session }) =>
    startInstall(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId }),
  );

  defineRoute(app, deps, contract.connections.githubCallback, options, async ({ org, params, query, session, meta }) =>
    completeInstall(deps, {
      organisationId: sameOrganisation(org, params.id),
      userId: session.userId,
      installationId: Number(query.installation_id),
      state: query.state,
      meta,
    }),
  );

  defineRoute(app, deps, contract.connections.githubRepositories, options, async ({ org, params, body, session, meta }) =>
    selectRepositories(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, body, meta }),
  );

  defineRoute(app, deps, contract.connections.githubSync, options, async ({ org, params, session }) =>
    queueSync(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId }),
  );

  defineRoute(app, deps, contract.connections.githubDisconnect, options, async ({ org, params, session, meta }) =>
    disconnect(deps, { organisationId: sameOrganisation(org, params.id), userId: session.userId, meta }),
  );

  // GitHub sends people back to one fixed "Setup URL", which can't name an organisation. This
  // reads the organisation from our own signed state and passes the person on to its callback,
  // where the state is checked in full and used up. Nothing is stored here.
  app.get(GITHUB_SETUP_PATH, async (request, reply) => {
    if (!deps.config.github) throw errors.notFound('That page');
    const parsed = contract.connections.githubCallback.query.safeParse(request.query);
    if (!parsed.success) throw errors.invalidInput(STATE_REFUSED);
    const organisationId = stateOrganisation(deps, parsed.data.state);
    if (!organisationId) throw errors.invalidInput(STATE_REFUSED);
    const query = new URLSearchParams({ installation_id: parsed.data.installation_id, state: parsed.data.state });
    return reply.code(302).header('location', `/v1/organisations/${organisationId}/connections/github/callback?${query.toString()}`).send();
  });

  registerGithubWebhook(app, deps);
}

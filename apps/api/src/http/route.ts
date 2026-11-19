import type { Endpoint, Permission, StaffRole } from '@vero/shared';
import { can } from '@vero/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { z } from 'zod';
import type { AppDeps } from '../deps';
import { authenticate, resolveOrg, resolveStaff, type OrgContext, type SessionContext, type StaffContext } from '../modules/auth/session';
import { errors } from './errors';

/**
 * - public: no session needed.
 * - pending: signed in, but the TOTP step may still be outstanding.
 * - session: fully signed in.
 * - org: fully signed in, with a verified membership of the active organisation.
 * - staff: fully signed in, and on the platform's own staff list. Organisation roles don't count.
 */
export type AuthMode = 'public' | 'pending' | 'session' | 'org' | 'staff';

type Output<S> = S extends z.ZodType ? z.output<S> : undefined;

export interface RequestMeta {
  ip: string;
  userAgent: string | null;
}

export type RouteContext<E extends Endpoint, A extends AuthMode> = {
  params: Output<E['params']>;
  query: Output<E['query']>;
  body: Output<E['body']>;
  request: FastifyRequest;
  reply: FastifyReply;
  meta: RequestMeta;
} & (A extends 'public' ? object : { session: SessionContext }) &
  (A extends 'org' ? { org: OrgContext } : object) &
  (A extends 'staff' ? { staff: StaffContext } : object);

export function requestMeta(request: FastifyRequest): RequestMeta {
  const agent = request.headers['user-agent'];
  return { ip: request.ip, userAgent: agent ? agent.slice(0, 300) : null };
}

function parseOrThrow(schema: z.ZodType, value: unknown): unknown {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  const missingBody = issue?.path.length === 0 && issue.code === 'invalid_type';
  throw errors.invalidInput(
    missingBody ? 'The request is missing its details.' : (issue?.message ?? 'Check what you entered.'),
  );
}

/**
 * Registers a contract endpoint. Order is fixed: who are you, may you do this, is the input
 * valid. The response goes through the contract schema, which strips any field it does not
 * declare, so a secret column can never leak by being selected.
 */
export function defineRoute<E extends Endpoint, A extends AuthMode>(
  app: FastifyInstance,
  deps: AppDeps,
  endpoint: E,
  options: {
    auth: A;
    permission?: A extends 'org' ? Permission : never;
    staffRoles?: A extends 'staff' ? readonly StaffRole[] : never;
    /** Largest body this route accepts. Only for routes that take a file. */
    bodyLimit?: number;
    /** A public form posted from the marketing website: no session, so no cross-site risk to check. */
    skipOriginCheck?: boolean;
    /** Runs before the body is read, so someone who may not upload can't make us buffer a file. */
    beforeBody?: (session: SessionContext, org: OrgContext, request: FastifyRequest) => Promise<void>;
  },
  handler: (context: RouteContext<E, A>) => Promise<z.input<E['response']>>,
): void {
  app.route({
    method: endpoint.method,
    url: endpoint.path,
    ...(options.bodyLimit ? { bodyLimit: options.bodyLimit } : {}),
    ...(options.skipOriginCheck ? { config: { skipOriginCheck: true } } : {}),
    ...(options.beforeBody
      ? {
          onRequest: async (request: FastifyRequest, reply: FastifyReply) => {
            const session = await authenticate(deps, request, reply, { allowMfaPending: false });
            const org = await resolveOrg(deps, session);
            if (options.permission && !can(org.role, options.permission)) throw errors.forbidden();
            await options.beforeBody?.(session, org, request);
          },
        }
      : {}),
    handler: async (request, reply) => {
      let session: SessionContext | undefined;
      let org: OrgContext | undefined;
      let staff: StaffContext | undefined;
      if (options.auth !== 'public') {
        session = await authenticate(deps, request, reply, { allowMfaPending: options.auth === 'pending' });
      }
      if (options.auth === 'org' && session) {
        org = await resolveOrg(deps, session);
        if (options.permission && !can(org.role, options.permission)) throw errors.forbidden();
      }
      if (options.auth === 'staff' && session) {
        staff = await resolveStaff(deps, session, options.staffRoles ?? ['admin'], requestMeta(request));
      }

      const context = {
        params: endpoint.params ? parseOrThrow(endpoint.params, request.params) : undefined,
        query: endpoint.query ? parseOrThrow(endpoint.query, request.query) : undefined,
        body: endpoint.body ? parseOrThrow(endpoint.body, request.body) : undefined,
        request,
        reply,
        meta: requestMeta(request),
        session,
        org,
        staff,
      } as unknown as RouteContext<E, A>;

      const result = await handler(context);
      const checked = endpoint.response.safeParse(result);
      if (!checked.success) {
        // Our bug, not the caller's. Field paths only: values could be sensitive.
        request.log.error(
          { paths: checked.error.issues.map((issue) => issue.path.join('.')) },
          'response did not match the contract',
        );
        throw errors.internal();
      }
      return reply.code(endpoint.status).send(checked.data);
    },
  });
}

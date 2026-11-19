import type { ErrorCode } from '@vero/shared';

/** An error that is safe to show. `message` is plain English. */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly headers?: Record<string, string>;
  readonly reason?: string;

  constructor(statusCode: number, code: ErrorCode, message: string, headers?: Record<string, string>, reason?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.headers = headers;
    if (reason !== undefined) this.reason = reason;
  }
}

export const errors = {
  unauthenticated: () => new AppError(401, 'unauthenticated', 'Please sign in to continue.'),
  mfaRequired: () => new AppError(403, 'mfa_required', 'Enter the code from your authenticator app to continue.'),
  forbidden: () => new AppError(403, 'forbidden', "You don't have permission to do that."),
  noOrganisation: () => new AppError(403, 'no_organisation', "You aren't part of an organisation yet."),
  notAMember: () => new AppError(403, 'not_a_member', "You aren't a member of that organisation."),
  // One message for "does not exist" and "belongs to someone else", so ids reveal nothing.
  notFound: (what = 'That') => new AppError(404, 'not_found', `${what} could not be found.`),
  invalidInput: (message: string) => new AppError(400, 'invalid_input', message),
  rateLimited: (retryAfterSeconds: number) =>
    new AppError(429, 'rate_limited', 'Too many attempts. Please wait a little and try again.', {
      'retry-after': String(retryAfterSeconds),
    }),
  originNotAllowed: () =>
    new AppError(403, 'origin_not_allowed', 'This request came from a site that is not allowed to use Vero.'),
  internal: () => new AppError(500, 'internal_error', 'Something went wrong on our side. Please try again.'),
  planUpgrade: (what: string) => new AppError(403, 'plan_upgrade_required', `${what} is part of a paid plan.`),
  invalidState: (message: string) => new AppError(409, 'invalid_state', message),
};

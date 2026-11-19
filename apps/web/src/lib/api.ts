import { ApiError, createApiClient } from '@vero/shared';
import { safeNext } from './next-path';

let leaving = false;

function currentPath(): string {
  return `${window.location.pathname}${window.location.search}`;
}

/** Sends someone back to sign in, and remembers where they were going. */
function leaveTo(path: string): void {
  if (leaving) return;
  leaving = true;
  const next = safeNext(currentPath());
  window.location.assign(next && next !== '/' ? `${path}?next=${encodeURIComponent(next)}` : path);
}

function isAuthCall(input: Parameters<typeof fetch>[0]): boolean {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.url;
  return url.includes('/v1/auth/');
}

/** Every call goes through here, so a lost session is handled once, in one place. */
const guardedFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (typeof window === 'undefined') return response;
  if (response.status === 401 && !isAuthCall(input)) {
    leaveTo('/sign-in');
  } else if (response.status === 403) {
    const body = (await response.clone().json().catch(() => null)) as { error?: { code?: string } } | null;
    if (body?.error?.code === 'mfa_required') leaveTo('/sign-in/two-step');
  }
  return response;
};

/** Same origin: the web server forwards /v1 to the API, so the HttpOnly cookie just works. */
export const api = createApiClient({ baseUrl: '', fetch: guardedFetch });

/** True when this failure is already being handled by sending the person to sign in. */
export function isRedirecting(error: unknown): boolean {
  return leaving || (error instanceof ApiError && (error.status === 401 || error.code === 'mfa_required'));
}

export function asApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError(0, 'unexpected_response', 'Something went wrong. Please try again.');
}

export { ApiError };

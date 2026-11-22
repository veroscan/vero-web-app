import { ApiError, createApiClient } from '@vero/shared';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Where the Vero API lives. Set EXPO_PUBLIC_API_URL for a real deployment. In development the
 * phone reaches the API on the same computer that runs the Expo dev server (port 4000), so the
 * API must listen on the network (API_HOST=0.0.0.0) for a physical phone.
 */
function apiBase(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (Platform.OS === 'web' && typeof window !== 'undefined') return `${window.location.protocol}//${window.location.hostname}:4000`;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:4000`;
}

export const API_BASE = apiBase();

let token: string | null = null;
let onSignedOut: (() => void) | null = null;

/** Set by the session once it has read the token from secure storage. */
export function setApiToken(next: string | null): void {
  token = next;
}

/** Called once when any request comes back 401, so the app returns to sign in in one place. */
export function setSignedOutHandler(handler: (() => void) | null): void {
  onSignedOut = handler;
}

function carriedToken(init: RequestInit | undefined): boolean {
  const headers = init?.headers;
  if (!headers) return false;
  if (headers instanceof Headers) return headers.has('authorization');
  if (Array.isArray(headers)) return headers.some(([name]) => name.toLowerCase() === 'authorization');
  return Object.keys(headers).some((name) => name.toLowerCase() === 'authorization');
}

const guardedFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  // Only a request that actually carried the session can prove the session is gone. A call made
  // before the saved token was read (a deep link opening the app) must not sign anyone out.
  if (response.status === 401 && token && carriedToken(init)) onSignedOut?.();
  return response;
};

/**
 * The same typed client the web app uses, built from the API contract in packages/shared.
 * Every request says it is the phone app, which lets the API accept the Bearer token.
 */
export const api = createApiClient({
  baseUrl: API_BASE,
  fetch: guardedFetch,
  headers: async () => ({
    'x-vero-client': 'mobile',
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  }),
});

export function asApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError(0, 'unexpected_response', 'Something went wrong. Please try again.');
}

/** Pulls the sign-in token out of whatever the person has: the email link, a vero:// link or the bare token. */
export function tokenFromLink(text: string): string | null {
  const trimmed = text.trim();
  const match = /[?&]token=([^&\s#]+)/.exec(trimmed);
  if (match?.[1]) return decodeURIComponent(match[1]);
  return /^[\w-]{20,200}$/.test(trimmed) ? trimmed : null;
}

export { ApiError };

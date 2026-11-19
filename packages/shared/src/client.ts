import type { z } from 'zod';
import { apiErrorSchema } from './common';
import type { ErrorCode } from './constants';
import { contract, type Contract, type Endpoint } from './contract';

/** Thrown for every failed call. `message` is plain English, safe to show to people. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ErrorCode | 'network_error' | 'unexpected_response';
  readonly reason?: string;

  constructor(status: number, code: ApiError['code'], message: string, reason?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    if (reason !== undefined) this.reason = reason;
  }
}

type SchemaInput<T> = T extends z.ZodType ? z.input<T> : never;

/** The fields a caller must pass for an endpoint. Only what the endpoint declares. */
type CallInput<E extends Endpoint> = (E['params'] extends z.ZodType
  ? { params: SchemaInput<E['params']> }
  : object) &
  (E['query'] extends z.ZodType ? { query?: SchemaInput<E['query']> } : object) &
  (E['body'] extends z.ZodType ? { body: SchemaInput<E['body']> } : object);

type HasRequiredInput<E extends Endpoint> = E['params'] extends z.ZodType
  ? true
  : E['body'] extends z.ZodType
    ? true
    : false;

type Caller<E extends Endpoint> =
  HasRequiredInput<E> extends true
    ? (input: CallInput<E>) => Promise<z.output<E['response']>>
    : (input?: CallInput<E>) => Promise<z.output<E['response']>>;

export type ApiClient = {
  [Group in keyof Contract]: {
    [Name in keyof Contract[Group]]: Contract[Group][Name] extends Endpoint
      ? Caller<Contract[Group][Name]>
      : never;
  };
};

export interface ApiClientOptions {
  /** API origin, for example http://localhost:4000. Empty string for same-origin calls. */
  baseUrl: string;
  /** Defaults to the global fetch. */
  fetch?: typeof globalThis.fetch;
  /** Extra headers per call, for example forwarding cookies during server rendering. */
  headers?: () => Record<string, string> | Promise<Record<string, string>>;
}

/** Path and query values in the contract are all simple values. */
type UrlValue = string | number | boolean | null | undefined;

interface RawInput {
  params?: Record<string, UrlValue>;
  query?: Record<string, UrlValue>;
  body?: unknown;
}

function buildPath(path: string, params: Record<string, UrlValue> | undefined): string {
  return path.replace(/:([A-Za-z]+)/g, (_match, name: string) => {
    const value = params?.[name];
    if (value === undefined || value === null) {
      throw new ApiError(0, 'unexpected_response', `Missing path value: ${name}`);
    }
    return encodeURIComponent(String(value));
  });
}

function buildQuery(query: Record<string, UrlValue> | undefined): string {
  if (!query) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

async function call(options: ApiClientOptions, def: Endpoint, input: RawInput = {}): Promise<unknown> {
  const doFetch = options.fetch ?? globalThis.fetch;
  const url = `${options.baseUrl}${buildPath(def.path, input.params)}${buildQuery(input.query)}`;
  const headers: Record<string, string> = { accept: 'application/json', ...(await options.headers?.()) };

  let body: string | Uint8Array | undefined;
  if (def.binary) {
    // A file: its checks happen on the server, which looks at what it really is.
    body = input.body as Uint8Array;
    headers['content-type'] = 'application/octet-stream';
  } else if (def.body) {
    // Check before sending, so the caller gets the same plain message the server would give.
    const parsed = def.body.safeParse(input.body);
    if (!parsed.success) {
      throw new ApiError(400, 'invalid_input', parsed.error.issues[0]?.message ?? 'Check what you entered.');
    }
    body = JSON.stringify(input.body);
    headers['content-type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await doFetch(url, { method: def.method, headers, body: body as RequestInit['body'], credentials: 'include' });
  } catch {
    throw new ApiError(0, 'network_error', "We couldn't reach Vero. Check your connection and try again.");
  }

  const text = await response.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = undefined;
  }

  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(json);
    if (parsedError.success) {
      throw new ApiError(response.status, parsedError.data.error.code, parsedError.data.error.message, parsedError.data.error.reason);
    }
    throw new ApiError(response.status, 'unexpected_response', 'Something went wrong. Please try again.');
  }

  const parsed = def.response.safeParse(json);
  if (!parsed.success) {
    throw new ApiError(response.status, 'unexpected_response', 'Something went wrong. Please try again.');
  }
  return parsed.data;
}

/** Builds the typed client from the contract, so the two can never drift apart. */
export function createApiClient(options: ApiClientOptions): ApiClient {
  const groups: Record<string, Record<string, (input?: RawInput) => Promise<unknown>>> = {};
  for (const [groupName, group] of Object.entries(contract)) {
    const methods: Record<string, (input?: RawInput) => Promise<unknown>> = {};
    for (const [name, def] of Object.entries(group)) {
      methods[name] = (input?: RawInput) => call(options, def as Endpoint, input);
    }
    groups[groupName] = methods;
  }
  return groups as unknown as ApiClient;
}

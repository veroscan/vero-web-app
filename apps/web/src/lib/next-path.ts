/**
 * Where to go after signing in. Only ever a path on this site: a sign-in link must not be
 * usable to send someone elsewhere, so anything else is dropped.
 */
export function safeNext(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null;
  if (value.includes('\\') || /[\r\n\t]/.test(value)) return null;
  // Going back to a sign-in page after signing in would be a loop.
  if (value === '/sign-in' || value.startsWith('/sign-in/') || value.startsWith('/sign-in?')) return null;
  return value;
}

const KEY = 'vero-next';

function store(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Survives the trip through the email, as long as the link opens in the same browser. */
export function rememberNext(value: string | null | undefined): void {
  const next = safeNext(value);
  try {
    if (next) store()?.setItem(KEY, next);
    else store()?.removeItem(KEY);
  } catch {
    // Private windows can refuse. They just land on Home afterwards.
  }
}

export function peekNext(): string | null {
  try {
    return safeNext(store()?.getItem(KEY));
  } catch {
    return null;
  }
}

export function takeNext(): string | null {
  const next = peekNext();
  try {
    store()?.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
  return next;
}

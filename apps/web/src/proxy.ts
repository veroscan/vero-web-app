import { NextResponse, type NextRequest } from 'next/server';
import { safeNext } from '@/lib/next-path';

const SESSION_COOKIE = 'vero_session';

/** Pages anyone can open. Everything else needs a session. */
function isPublic(pathname: string): boolean {
  return pathname === '/sign-in' || pathname.startsWith('/sign-in/') || pathname === '/sign-up' || pathname.startsWith('/legal/') || pathname.startsWith('/r/') || pathname.startsWith('/verified/');
}

/**
 * The first gate, before any page draws, so a signed-out person never sees a flash of the app.
 * It only checks the cookie is there. The API decides if it's still good, and a 401 from any
 * call sends the person back to sign in from the browser.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && !isPublic(pathname)) {
    const target = request.nextUrl.clone();
    target.pathname = '/sign-in';
    target.search = pathname === '/' ? '' : `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    return NextResponse.redirect(target);
  }
  if (hasSession && (pathname === '/sign-in' || pathname === '/sign-up')) {
    // Already signed in. A stale cookie is cleared by the API's first 401, so this can't loop.
    const next = safeNext(request.nextUrl.searchParams.get('next'));
    // The scan page is where a signed-in person lands unless they were on their way somewhere.
    return NextResponse.redirect(new URL(next ?? '/scan', request.nextUrl.origin));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/|v1/|brand/|fonts/|vero-lockup|favicon).*)'],
};

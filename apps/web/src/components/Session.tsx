'use client';

import type { Company, MeResponse, OverviewResponse } from '@vero/shared';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { safeNext, rememberNext } from '@/lib/next-path';
import { useResource } from '@/lib/useResource';
import { ErrorState, Loading } from './Bits';
import { NavigationDone } from './TLink';

interface SessionData {
  me: MeResponse;
  companies: Company[];
  overview: OverviewResponse | null;
}

export interface Session extends SessionData {
  /** The main company. Everything else in the group hangs off it. */
  root: Company | null;
  related: Company[];
  scope: 'company' | 'group';
  hasResult: boolean;
  isDemo: boolean;
  unread: number;
  refresh: () => Promise<void>;
  refreshUnread: () => void;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession needs SessionProvider');
  return session;
}

/** The root is the oldest company with no parent. The API lists companies, not a "current" one. */
function pickRoot(companies: Company[]): Company | null {
  return companies.find((company) => company.parentCompanyId === null) ?? companies[0] ?? null;
}

async function loadSession(): Promise<SessionData> {
  const [me, list] = await Promise.all([api.me.get(), api.companies.list()]);
  const root = pickRoot(list.companies);
  const scope = root && list.companies.some((company) => company.parentCompanyId === root.id) ? 'group' : 'company';
  const overview = root ? await api.results.overview({ params: { companyId: root.id }, query: { scope } }) : null;
  return { me, companies: list.companies, overview };
}

/** Pages a person with no result yet can open. The rest send them into onboarding. */
function allowedWithoutResult(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/first-result') ||
    // Following another company needs no result of your own (investors, buyers, anyone checking a supplier).
    pathname === '/scan' ||
    pathname.startsWith('/watchlist') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/plan')
  );
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const resource = useResource(loadSession, []);
  const { data, set } = resource;
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(() => {
    api.notifications.list({ query: { limit: 1 } }).then(
      (feed) => setUnread(feed.unreadCount),
      () => undefined, // The bell keeps its last count. Screens report their own failures.
    );
  }, []);

  useEffect(() => {
    if (!data) return;
    refreshUnread();
    const timer = setInterval(refreshUnread, 60_000);
    return () => clearInterval(timer);
  }, [Boolean(data), pathname, refreshUnread]);

  const refresh = useCallback(async () => {
    set(await loadSession());
  }, [set]);

  const signOut = useCallback(async () => {
    await api.auth.logout();
    rememberNext(null);
    window.location.assign('/sign-in');
  }, []);

  const session = useMemo<Session | null>(() => {
    if (!data) return null;
    const root = pickRoot(data.companies);
    const related = root ? data.companies.filter((company) => company.parentCompanyId === root.id) : [];
    const active = data.me.organisations.find((org) => org.id === data.me.activeOrganisationId);
    return {
      ...data,
      root,
      related,
      scope: related.length > 0 ? 'group' : 'company',
      hasResult: data.overview?.hasResult ?? false,
      isDemo: active?.isDemo ?? false,
      unread,
      refresh,
      refreshUnread,
      signOut,
    };
  }, [data, unread, refresh, refreshUnread, signOut]);

  // Signed-in people with nothing scanned yet go into onboarding, and come back afterwards.
  const blocked = session !== null && !session.hasResult && !allowedWithoutResult(pathname);
  useEffect(() => {
    if (!session || !blocked) return;
    rememberNext(safeNext(`${window.location.pathname}${window.location.search}`));
    router.replace(session.root ? '/' : '/onboarding/company');
  }, [blocked, session === null, router]);

  if (resource.error && !data) {
    return (
      <div className="vs">
        <main style={{ display: 'contents' }}>
          <ErrorState error={resource.error} onRetry={resource.reload} />
        </main>
      </div>
    );
  }
  if (!session || blocked) {
    return (
      <div className="vs">
        <main style={{ display: 'contents' }}>
          <Loading />
        </main>
      </div>
    );
  }
  return (
    <SessionContext.Provider value={session}>
      <NavigationDone />
      {children}
    </SessionContext.Provider>
  );
}

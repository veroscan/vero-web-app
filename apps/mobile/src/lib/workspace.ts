import type { Company, OverviewResponse } from '@vero/shared';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { useSession } from './session';

/**
 * The company the app is about, worked out the same way as the web app (apps/web Session.tsx):
 * the root is the oldest company with no parent, and when it has related companies the results
 * are read for the whole group.
 */
export interface Workspace {
  companies: Company[];
  root: Company | null;
  related: Company[];
  scope: 'company' | 'group';
  overview: OverviewResponse | null;
  hasResult: boolean;
  isDemo: boolean;
}

function pickRoot(companies: Company[]): Company | null {
  return companies.find((company) => company.parentCompanyId === null) ?? companies[0] ?? null;
}

export const workspaceKey = ['workspace'] as const;

export function useWorkspace() {
  const { me, status } = useSession();
  return useQuery({
    queryKey: workspaceKey,
    enabled: status === 'signedIn',
    queryFn: async (): Promise<Workspace> => {
      const list = await api.companies.list();
      const root = pickRoot(list.companies);
      const related = root ? list.companies.filter((company) => company.parentCompanyId === root.id) : [];
      const scope = related.length > 0 ? 'group' : 'company';
      const overview = root ? await api.results.overview({ params: { companyId: root.id }, query: { scope } }) : null;
      const active = me?.organisations.find((org) => org.id === me.activeOrganisationId);
      return { companies: list.companies, root, related, scope, overview, hasResult: overview?.hasResult ?? false, isDemo: active?.isDemo ?? false };
    },
  });
}

/** Unread notifications for the bell dot; refreshed every minute while the app is open. */
export function useUnread(): number {
  const { status } = useSession();
  const query = useQuery({
    queryKey: ['notifications', 'unread'],
    enabled: status === 'signedIn',
    refetchInterval: 60_000,
    queryFn: async () => (await api.notifications.list({ query: { limit: 1 } })).unreadCount,
  });
  return query.data ?? 0;
}

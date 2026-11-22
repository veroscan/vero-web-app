import type { Company, IssueSummary, OverviewResponse, ProjectionResponse } from '@vero/shared';
import { useQuery } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { api } from '@/lib/api';
import { historyPoints, type ChartPoint, type Projected } from '@/lib/score';
import { useWorkspace, workspaceKey } from '@/lib/workspace';

/*
 * Data for the score and findings screens. Every key starts with the workspace key, so
 * invalidating `workspaceKey` after an upload or a "we don't have it" refreshes all of it.
 */
export const keys = {
  overview: (companyId: string) => [...workspaceKey, 'overview', companyId] as const,
  issues: (companyId: string, scope: string) => [...workspaceKey, 'issues', companyId, scope] as const,
  issue: (companyId: string, ruleKey: string) => [...workspaceKey, 'issue', companyId, ruleKey] as const,
  vault: (companyId: string) => [...workspaceKey, 'vault', companyId] as const,
  histories: (ids: string) => [...workspaceKey, 'history', ids] as const,
  projection: (...parts: string[]) => [...workspaceKey, 'projection', ...parts] as const,
};

/* The company picked in the Overview switcher, shared with Findings and Documents. Null is the whole group. */
let focused: string | null = null;
const listeners = new Set<() => void>();

export function setFocus(companyId: string | null): void {
  focused = companyId;
  listeners.forEach((listener) => listener());
}

function useFocus(): string | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => focused,
    () => focused,
  );
}

export interface View {
  /** The company the screen is about: the root for the group, or the one picked. */
  company: Company;
  scope: 'company' | 'group';
  overview: OverviewResponse | null;
  /** Root first, then its related companies. */
  companies: Company[];
  /** The root has related companies, so there is something to switch between. */
  hasGroup: boolean;
  focus: string | null;
  hasResult: boolean;
  isDemo: boolean;
}

/**
 * The workspace as the screens see it: the whole group (as `useWorkspace()` works it out) unless
 * the person picked one company in the switcher, which then reads that company on its own.
 */
export function useView() {
  const ws = useWorkspace();
  const focus = useFocus();
  const data = ws.data;
  const picked = focus && data && data.scope === 'group' ? (data.companies.find((company) => company.id === focus) ?? null) : null;
  const single = useQuery({
    queryKey: keys.overview(picked?.id ?? 'none'),
    enabled: picked !== null,
    queryFn: () => api.results.overview({ params: { companyId: picked?.id ?? '' }, query: { scope: 'company' } }),
  });

  let view: View | null = null;
  if (data?.root) {
    const companies = [data.root, ...data.related];
    const overview = picked ? (single.data ?? null) : data.overview;
    view = {
      company: picked ?? data.root,
      scope: picked ? 'company' : data.scope,
      overview,
      companies,
      hasGroup: data.related.length > 0,
      focus: picked?.id ?? null,
      hasResult: overview?.hasResult ?? false,
      isDemo: data.isDemo,
    };
  }
  return {
    view,
    noCompany: data !== undefined && data.root === null,
    loading: ws.isPending || (picked !== null && single.isPending),
    error: ws.error ?? single.error,
    refreshing: (ws.isRefetching || single.isRefetching) && !ws.isPending,
    refetch: async () => {
      await Promise.all([ws.refetch(), picked ? single.refetch() : Promise.resolve()]);
    },
  };
}

/** Every finding for the company or group in view (open, cleared and not seen). */
export function useIssues(companyId: string | undefined, scope: 'company' | 'group') {
  return useQuery({
    queryKey: keys.issues(companyId ?? 'none', scope),
    enabled: !!companyId,
    queryFn: () => api.results.issues({ params: { companyId: companyId ?? '' }, query: { scope, outcome: 'all' } }),
  });
}

/** What clearing these findings does to the score, from the API. */
export function project(companyId: string, scope: 'company' | 'group', fixes: readonly Pick<IssueSummary, 'companyId' | 'ruleKey'>[]): Promise<ProjectionResponse> {
  return api.results.projection({
    params: { companyId },
    query: { scope },
    body: scope === 'group' ? { fixes: fixes.map((fix) => ({ companyId: fix.companyId, ruleKey: fix.ruleKey })) } : { ruleKeys: fixes.map((fix) => fix.ruleKey) },
  });
}

/**
 * Where the score goes after the next fix (web: useFixProjection). When the urgent cap holds the
 * fix at +0, it asks what clearing every urgent gap would do instead, which is what lifts the cap.
 */
export function useNextProjection(overview: OverviewResponse | null, companyId: string | undefined, scope: 'company' | 'group') {
  const fix = overview?.nextAction ?? null;
  const exact = overview?.score.kind === 'exact';
  const held = overview?.heldByUrgent ?? false;
  return useQuery({
    queryKey: keys.projection(companyId ?? 'none', scope, fix?.companyId ?? '', fix?.ruleKey ?? '', String(held)),
    enabled: !!companyId && !!fix && exact,
    queryFn: async (): Promise<Projected | null> => {
      if (!companyId || !fix) return null;
      const urgent = held ? (await api.results.issues({ params: { companyId }, query: { scope, outcome: 'open', severity: 'critical' } })).issues : [];
      const one = await project(companyId, scope, [fix]);
      if (one.gain > 0 || urgent.length === 0) return { from: one.current, to: one.projected, mode: 'one', urgentCount: urgent.length, reaches: one.reachesVerification };
      const all = await project(companyId, scope, urgent);
      return { from: all.current, to: all.projected, mode: 'urgent', urgentCount: urgent.length, reaches: all.reachesVerification };
    },
  });
}

/**
 * Score over time for the chart. In a group each company has its own history, so the chart shows
 * the one scoring lowest, as the web does, and says which one it is.
 */
export function useChart(companies: readonly Company[]) {
  const ids = companies.map((company) => company.id).join(',');
  return useQuery({
    queryKey: keys.histories(ids),
    enabled: companies.length > 0,
    queryFn: async (): Promise<{ company: Company; points: ChartPoint[] } | null> => {
      const lists = await Promise.all(companies.map((company) => api.companies.history({ params: { companyId: company.id } }).catch(() => ({ companyId: company.id, scans: [] }))));
      const all = companies.map((company) => ({ company, points: historyPoints(lists.find((list) => list.companyId === company.id)?.scans ?? []) }));
      const scored = all.filter((item) => item.points.length > 0);
      scored.sort((a, b) => (a.points.at(-1)?.value ?? 101) - (b.points.at(-1)?.value ?? 101));
      return scored[0] ?? null;
    },
  });
}

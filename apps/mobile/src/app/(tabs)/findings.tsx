import type { IssueSummary } from '@vero/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { keys, project, useIssues, useView } from '@/components/findings/data';
import { LightScreen } from '@/components/findings/LightScreen';
import { go } from '@/components/findings/nav';
import { ErrorCard, FindingRow, SampleNote, Skeleton, SkeletonList, sourceLine } from '@/components/findings/Parts';
import { plural, shortName } from '@/lib/format';
import { isOpenIssue, issueKey, rankIssues } from '@/lib/issues';
import { URGENT_CAP } from '@/lib/score';
import { workspaceKey } from '@/lib/workspace';
import { useTheme } from '@/theme/ThemeProvider';
import { Seg } from '@/ui/Controls';
import { Rise, useCountUp } from '@/ui/Motion';
import { Btn, Card, IconBtn, List } from '@/ui/Surfaces';
import { Kicker, Pixel, T } from '@/ui/Text';

type Tab = 'open' | 'clear';
const PAGE = 30;

/** What clearing everything open is worth, from the API's own projection. */
function PointsCard({ current, projected, open, urgent }: { current: number | null; projected: number | null; open: number; urgent: number }) {
  const { c } = useTheme();
  const gain = current !== null && projected !== null ? Math.max(0, projected - current) : null;
  const shown = useCountUp(gain ?? 0, { delay: 400 });
  let words: string;
  if (current === null) words = 'What clearing each finding is worth is part of a paid plan.';
  else if (open === 0) words = `The score is ${current}. Nothing open is holding it down.`;
  else words = `Clear ${open === 1 ? 'it' : open === 2 ? 'both' : `all ${open}`} and the score goes from ${current}${projected !== null ? ` to ${projected}` : ''}.`;
  return (
    <Card style={{ marginTop: 20 }}>
      <Kicker>Points available</Kicker>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 }}>
        {current !== null && open > 0 ? (
          <Pixel size={48} color={c.good} accessibilityLabel={gain !== null ? `${gain} points` : 'Working it out'}>
            {gain === null ? '+' : `+${shown}`}
          </Pixel>
        ) : null}
        <View style={{ flex: 1 }}>
          <T weight={700} size={14} style={{ lineHeight: 19 }}>
            {words}
          </T>
          {current !== null && urgent > 0 ? (
            <T variant="small" style={{ marginTop: 4 }} testID="points-held">
              The urgent {urgent === 1 ? 'one comes' : 'ones come'} first: until {urgent === 1 ? 'it is' : 'they are'} cleared, the score stays capped at {URGENT_CAP}.
            </T>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

/** The Findings tab, as on the Findings board. */
export default function Findings() {
  const { c } = useTheme();
  const queries = useQueryClient();
  const { view, loading, error, refetch } = useView();
  const [tab, setTab] = useState<Tab>('open');
  const [limit, setLimit] = useState(PAGE);
  const [pulling, setPulling] = useState(false);
  const companyId = view?.hasResult ? view.company.id : undefined;
  const scope = view?.scope ?? 'company';
  const group = scope === 'group';
  const overview = view?.overview ?? null;
  const issues = useIssues(companyId, scope);

  const all = useMemo(() => issues.data?.issues ?? [], [issues.data]);
  const open = useMemo(() => all.filter(isOpenIssue).sort(rankIssues), [all]);
  const cleared = useMemo(() => all.filter((issue) => issue.outcome === 'pass'), [all]);
  const urgent = open.filter((issue) => issue.severity === 'critical').length;
  const unseenUploads = all.filter((issue) => issue.outcome === 'verify' && issue.actionType === 'upload').length;
  const score = issues.data?.score ?? overview?.score ?? { kind: 'none' as const };
  const current = score.kind === 'exact' ? score.value : null;
  const openKey = open.map(issueKey).join(',');

  const allFixed = useQuery({
    queryKey: keys.projection(companyId ?? 'none', scope, 'all', openKey),
    enabled: !!companyId && current !== null && open.length > 0,
    queryFn: () => project(companyId ?? '', scope, open.slice(0, 300)),
  });

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; layer: number; items: IssueSummary[] }>();
    for (const issue of open) {
      const item = map.get(issue.layerName) ?? { name: issue.layerName, layer: issue.layer, items: [] };
      item.items.push(issue);
      map.set(issue.layerName, item);
    }
    return [...map.values()];
  }, [open]);

  const refresh = async () => {
    setPulling(true);
    try {
      await Promise.all([refetch(), queries.invalidateQueries({ queryKey: workspaceKey })]);
    } finally {
      setPulling(false);
    }
  };

  const coverage = overview?.coverage;
  const subLine = [`${open.length} open`, coverage && coverage.total > 0 ? `${coverage.counted} of ${plural(coverage.total, 'check', 'checks')}` : null].filter(Boolean).join(' · ');

  return (
    <LightScreen tabs onRefresh={() => void refresh()} refreshing={pulling}>
      <Rise style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <T variant="h1" accessibilityRole="header">
          Findings
        </T>
        <IconBtn icon="share" label="Share the report" light onPress={() => go('/share')} />
      </Rise>

      {loading || (companyId && issues.isPending) ? (
        <View style={{ gap: 16, marginTop: 14 }}>
          <Skeleton w={160} h={14} />
          <Skeleton h={110} r={24} />
          <Skeleton h={46} r={15} />
          <SkeletonList rows={4} />
        </View>
      ) : error && !view ? (
        <ErrorCard error={error} onRetry={() => void refresh()} style={{ marginTop: 18 }} />
      ) : !view || !view.hasResult ? (
        <Rise d={1}>
          <Card style={{ marginTop: 18 }}>
            <T variant="h2" accessibilityRole="header">
              Nothing found yet
            </T>
            <T variant="sub" style={{ marginTop: 6 }}>
              Findings show here after the first scan.
            </T>
            <Btn label="Find your company" icon="search" onPress={() => go('/search')} style={{ marginTop: 16 }} />
          </Card>
        </Rise>
      ) : issues.error ? (
        <ErrorCard error={issues.error} onRetry={() => void issues.refetch()} style={{ marginTop: 18 }} />
      ) : (
        <>
          <Rise d={1}>
            <T variant="sub">
              {subLine}
              {group ? ' · Whole group' : view.hasGroup ? ` · ${shortName(view.company.legalName)}` : ''}
            </T>
          </Rise>
          {overview?.sampleData ? (
            <Rise d={1}>
              <SampleNote style={{ marginTop: 16 }} />
            </Rise>
          ) : null}
          <Rise d={2}>
            <PointsCard current={current} projected={allFixed.data?.projected ?? null} open={open.length} urgent={urgent} />
          </Rise>
          <Rise d={3}>
            <Seg
              style={{ marginTop: 18 }}
              value={tab}
              onChange={(next) => {
                setTab(next);
                setLimit(PAGE);
              }}
              options={[
                { value: 'open', label: `Open ${open.length}` },
                { value: 'clear', label: `Cleared ${cleared.length}` },
              ]}
            />
          </Rise>

          {tab === 'open' ? (
            <Rise key="open">
              {groups.length === 0 ? (
                <Card style={{ marginTop: 18 }}>
                  <T weight={700} size={14}>
                    Nothing open
                  </T>
                  <T variant="small" style={{ marginTop: 2 }}>
                    Vero keeps checking, and new findings show here.
                  </T>
                </Card>
              ) : (
                groups.map((item) => {
                  const area = overview?.areas.find((candidate) => candidate.layer === item.layer);
                  return (
                    <View key={item.name}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 10, marginHorizontal: 4 }}>
                        <T variant="label" accessibilityRole="header">
                          {item.name}
                        </T>
                        {area && area.score !== null ? (
                          <Pixel size={22} accessibilityLabel={`Area score ${area.score}`}>
                            {area.score}
                          </Pixel>
                        ) : null}
                      </View>
                      <List>
                        {item.items.map((issue) => (
                          <FindingRow key={issueKey(issue)} issue={issue} sub={sourceLine(issue, group)} />
                        ))}
                      </List>
                    </View>
                  );
                })
              )}
              <T variant="small" style={{ marginTop: 18, marginHorizontal: 4, lineHeight: 19 }}>
                Empty slots never lower the score.
                {unseenUploads > 0 ? ` ${plural(unseenUploads, 'check waits', 'checks wait')} on documents you haven't shared yet.` : ''}
                {(issues.data?.lockedCount ?? 0) > 0 ? ` ${plural(issues.data?.lockedCount ?? 0, 'more finding is', 'more findings are')} on a paid plan.` : ''}
              </T>
            </Rise>
          ) : (
            <Rise key="clear">
              {cleared.length === 0 ? (
                <Card style={{ marginTop: 18 }}>
                  <T weight={700} size={14}>
                    Nothing cleared yet
                  </T>
                  <T variant="small" style={{ marginTop: 2 }}>
                    Checks that pass show here.
                  </T>
                </Card>
              ) : (
                <List style={{ marginTop: 18 }}>
                  {cleared.slice(0, limit).map((issue) => (
                    <FindingRow key={issueKey(issue)} issue={issue} sub={sourceLine(issue, group)} />
                  ))}
                </List>
              )}
              {cleared.length > 0 ? (
                <T variant="small" style={{ marginTop: 18, marginHorizontal: 4 }}>
                  {cleared.length > limit ? `Showing ${Math.min(limit, cleared.length)} of ${cleared.length} cleared checks.` : `${plural(cleared.length, 'cleared check', 'cleared checks')}, all counted in the score.`}
                </T>
              ) : null}
              {cleared.length > limit ? <Btn kind="ghost" label={`Show ${Math.min(PAGE, cleared.length - limit)} more`} onPress={() => setLimit((value) => value + PAGE)} style={{ marginTop: 14 }} /> : null}
            </Rise>
          )}
          <View style={{ height: 8, backgroundColor: c.bg }} />
        </>
      )}
    </LightScreen>
  );
}

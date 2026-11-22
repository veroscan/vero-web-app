import type { ScoreView, WatchlistItem } from '@vero/shared';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { FollowSheet } from '@/components/account/FollowSheet';
import { Page } from '@/components/account/Page';
import { Spark } from '@/components/account/Spark';
import { Empty, Problem, Skeleton, useToast } from '@/components/account/States';
import { api } from '@/lib/api';
import { monthShort, plural, shortName } from '@/lib/format';
import { countryShort, LEVEL_WORDS } from '@/lib/registers';
import { historyPoints, scoreValue, URGENT_CAP } from '@/lib/score';
import { useSession } from '@/lib/session';
import { useWorkspace } from '@/lib/workspace';
import { useTheme } from '@/theme/ThemeProvider';
import { Rise, useCountUp } from '@/ui/Motion';
import { Btn, Card, IconBtn, List, Row, Section } from '@/ui/Surfaces';
import { Pixel, T } from '@/ui/Text';

const watchlistKey = ['watchlist'] as const;

/** The score in pixel numbers. A Free range shows as "62-70"; nothing yet as a dash. */
function ScorePixel({ score, size = 30, color }: { score: ScoreView; size?: number; color?: string }) {
  const value = score.kind === 'exact' ? score.value : 0;
  const shown = useCountUp(value);
  if (score.kind === 'none') return <Pixel size={size} color={color}>--</Pixel>;
  if (score.kind === 'approximate') return <Pixel size={size * 0.8} color={color}>{`${score.low}-${score.high}`}</Pixel>;
  return <Pixel size={size} color={color}>{shown}</Pixel>;
}

function deltaOf(before: number | null | undefined, after: number | null | undefined): number | null {
  return before !== null && before !== undefined && after !== null && after !== undefined ? after - before : null;
}

/** The binoculars-on-a-file drawing for the empty watchlist, in the kit's 2D style. */
function FollowArt() {
  const { c } = useTheme();
  return (
    <View aria-hidden>
    <Svg width={120} height={104} viewBox="0 0 130 112">
      <Rect x={26} y={10} width={64} height={84} rx={9} fill={c.dark ? 'rgba(157,218,247,0.18)' : '#C9EAFB'} transform="rotate(-6 58 52)" />
      <Rect x={42} y={18} width={64} height={84} rx={9} fill={c.dark ? '#0B1068' : '#fff'} stroke="#0182FA" strokeWidth={2} transform="rotate(-6 74 60)" />
      <Path d="M54 44h28M54 54h20" stroke={c.dark ? 'rgba(157,218,247,0.5)' : '#DCE6F5'} strokeWidth={3} strokeLinecap="round" transform="rotate(-6 74 60)" />
      <Circle cx={80} cy={72} r={13} fill="none" stroke="#0182FA" strokeWidth={3} />
      <Path d="M89 81l10 10" stroke="#0182FA" strokeWidth={3.4} strokeLinecap="round" />
    </Svg>
    </View>
  );
}

function FollowedRow({ item, values }: { item: WatchlistItem; values: number[] }) {
  const { c } = useTheme();
  const value = scoreValue(item.score);
  const delta = deltaOf(item.lastChange?.scoreBefore, item.lastChange?.scoreAfter);
  const tone = delta === null || delta === 0 ? c.ink3 : delta > 0 ? c.good : c.urgent;
  const low = value !== null && value <= URGENT_CAP;
  const where = `${countryShort(item.incorporationCountry)} · ${LEVEL_WORDS[item.countryCoverage.level]}`;
  const note = item.scanInProgress && item.score.kind === 'none' ? 'Scanning' : item.score.kind === 'none' ? 'Not yet' : delta === null ? 'Not compared' : delta === 0 ? 'No change' : `${delta > 0 ? '+' : '−'}${Math.abs(delta)}`;
  return (
    <Row
      testID="watchlist-row"
      title={item.legalName}
      sub={where}
      accessibilityLabel={`${item.legalName}, ${where}. Score ${value ?? 'not yet'}. ${note}`}
      onPress={() => router.push({ pathname: '/watchlist/[companyId]', params: { companyId: item.companyId } })}
      right={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Spark values={values} color={tone} />
          <View style={{ alignItems: 'flex-end', minWidth: 46 }}>
            <ScorePixel score={item.score} color={low ? c.warn : c.ink} />
            <T weight={700} size={11.5} color={note === 'Scanning' ? c.link : tone} style={{ marginTop: 4 }}>
              {note}
            </T>
          </View>
        </View>
      }
    />
  );
}

export default function Watchlist() {
  const { c } = useTheme();
  const workspace = useWorkspace();
  const { status } = useSession();
  const queries = useQueryClient();
  const { toast, node } = useToast(90);
  const [following, setFollowing] = useState(false);
  const list = useQuery({
    queryKey: watchlistKey,
    enabled: status === 'signedIn',
    queryFn: () => api.watchlist.list(),
    // While a new company's first scan runs, look again every few seconds.
    refetchInterval: (query) => (query.state.data?.companies.some((item) => item.scanInProgress) ? 5000 : false),
  });
  const data = list.data;
  const companies = data?.companies ?? [];
  const ws = workspace.data;
  const root = ws?.root ?? null;
  const ids = [...companies.map((item) => item.companyId), ...(root ? [root.id] : [])];
  const histories = useQueries({
    queries: ids.map((companyId) => ({
      queryKey: ['history', companyId],
      enabled: status === 'signedIn',
      queryFn: () => api.companies.history({ params: { companyId } }),
      staleTime: 60_000,
    })),
  });
  const pointsOf = (companyId: string): number[] => {
    const at = ids.indexOf(companyId);
    const scans = at >= 0 ? histories[at]?.data?.scans : undefined;
    return scans ? historyPoints(scans).map((point) => point.value) : [];
  };

  const scored = companies.map((item) => scoreValue(item.score)).filter((value): value is number => value !== null);
  const average = scored.length > 0 ? Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length) : null;
  const shownAverage = useCountUp(average ?? 0);
  const changed = companies
    .filter((item) => deltaOf(item.lastChange?.scoreBefore, item.lastChange?.scoreAfter))
    .sort((a, b) => new Date(b.lastChange?.at ?? 0).getTime() - new Date(a.lastChange?.at ?? 0).getTime());
  const latest = changed[0];
  const latestDelta = latest ? deltaOf(latest.lastChange?.scoreBefore, latest.lastChange?.scoreAfter) : null;
  const sorted = [...companies].sort((a, b) => (scoreValue(b.score) ?? -1) - (scoreValue(a.score) ?? -1));
  const used = data?.used ?? 0;
  const limit = data?.limit ?? 0;
  const own = ws?.overview && ws.hasResult ? ws.overview : null;

  const refresh = () => {
    void list.refetch();
    void workspace.refetch();
    histories.forEach((history) => void history.refetch());
  };

  const addButton = <IconBtn light icon="plus" label="Follow a company" onPress={() => setFollowing(true)} />;

  return (
    <Page
      tabs
      refreshing={list.isRefetching}
      onRefresh={refresh}
      testID="watchlist"
      overlay={
        <>
          {node}
          <FollowSheet
            open={following}
            onClose={() => setFollowing(false)}
            used={used}
            limit={limit}
            onFollowed={(name, companyId) => {
              setFollowing(false);
              void queries.invalidateQueries({ queryKey: watchlistKey });
              void queries.invalidateQueries({ queryKey: ['history', companyId] });
              toast(`Following ${shortName(name)}. Its first scan has started.`);
            }}
          />
        </>
      }
    >
      <Rise style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <T variant="h1" accessibilityRole="header">
          Watchlist
        </T>
        {addButton}
      </Rise>
      <Rise d={1}>
        <T variant="sub" style={{ marginTop: 6 }}>
          Public records only, in any country
        </T>
      </Rise>

      {list.isPending ? (
        <Skeleton blocks={[92, 210, 72]} />
      ) : list.isError && !data ? (
        <Problem error={list.error} onRetry={() => void list.refetch()} />
      ) : (
        <>
          {companies.length === 0 ? (
            <Rise d={2}>
              <Empty art={<FollowArt />} title="You don't follow any company yet" body="Follow a customer, a supplier or a company you might invest in. Vero reads its public records and shows you when its score moves.">
                <Btn label="Find a company" icon="search" onPress={() => setFollowing(true)} testID="follow-company" />
                <T variant="small" center style={{ marginTop: 12 }}>
                  {limit > 0 ? `${used} of ${limit} places on your plan used` : 'Following is part of a paid plan'}
                </T>
              </Empty>
            </Rise>
          ) : (
            <>
              <Rise d={2}>
                <Card style={{ marginTop: 20, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} accessible accessibilityLabel={average !== null ? `Average score ${average}, of ${plural(scored.length, 'company', 'companies')}` : 'No scores yet'}>
                    <Pixel size={48} color={c.bigNumber}>
                      {average !== null ? shownAverage : '--'}
                    </Pixel>
                    <T variant="small" style={{ fontSize: 12, lineHeight: 16 }}>
                      {average !== null ? `Average score\nof ${plural(scored.length, 'company', 'companies')}` : 'Average shows\nafter a first scan'}
                    </T>
                  </View>
                  <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: c.line }} />
                  <View style={{ flex: 1 }}>
                    {latest && latestDelta ? (
                      <>
                        <T weight={700} size={14} color={c.warn}>
                          {`${changed.length} changed`}
                        </T>
                        <T variant="small" style={{ fontSize: 12, lineHeight: 16, marginTop: 2 }}>
                          {`${shortName(latest.legalName)}\n${latestDelta > 0 ? 'rose' : 'fell'} ${plural(Math.abs(latestDelta), 'point', 'points')}`}
                        </T>
                      </>
                    ) : (
                      <>
                        <T weight={700} size={14}>
                          {`${used} of ${limit} places`}
                        </T>
                        <T variant="small" style={{ fontSize: 12, lineHeight: 16, marginTop: 2 }}>
                          No score has moved yet
                        </T>
                      </>
                    )}
                  </View>
                </Card>
              </Rise>
              <Section title="Companies" action={`${used} of ${limit}`} onAction={() => setFollowing(true)} />
              <Rise d={3}>
                <List>
                  {sorted.map((item) => (
                    <FollowedRow key={item.companyId} item={item} values={pointsOf(item.companyId)} />
                  ))}
                </List>
              </Rise>
            </>
          )}

          {root && own ? (
            <>
              <Section title="Your company" />
              <Rise d={4}>
                <List>
                  <Row
                    title={root.legalName}
                    sub={`${countryShort(root.incorporationCountry)} · ${LEVEL_WORDS[(own.countryCoverage ?? root.countryCoverage)?.level ?? 'international']}`}
                    onPress={() => router.navigate('/')}
                    accessibilityLabel={`${root.legalName}, your company. Score ${scoreValue(own.score) ?? 'not yet'}`}
                    right={
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Spark values={pointsOf(root.id)} color={own.trend && own.trend.delta < 0 ? c.urgent : own.trend && own.trend.delta > 0 ? c.good : c.ink3} />
                        <View style={{ alignItems: 'flex-end', minWidth: 46 }}>
                          <ScorePixel score={own.score} />
                          <T weight={700} size={11.5} color={own.trend && own.trend.delta !== 0 ? (own.trend.delta > 0 ? c.good : c.urgent) : c.ink3} style={{ marginTop: 4 }}>
                            {own.trend && own.trend.delta !== 0 ? `${own.trend.delta > 0 ? '+' : '−'}${Math.abs(own.trend.delta)} since ${monthShort(own.trend.since)}` : 'Yours'}
                          </T>
                        </View>
                      </View>
                    }
                  />
                </List>
              </Rise>
            </>
          ) : null}

          <Rise d={5}>
            <Card style={{ marginTop: 14, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 20 }}>
              <T weight={700} size={14.5}>
                Read only, public records only
              </T>
              <T variant="small" style={{ marginTop: 3, lineHeight: 18 }}>
                Registers, sanctions lists and the website, never documents. Alerts for companies you follow aren&apos;t available yet: changes show here and in Notifications.
              </T>
            </Card>
          </Rise>
        </>
      )}
    </Page>
  );
}

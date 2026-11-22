import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SampleTag } from '@/components/account/Page';
import { Problem, Skeleton } from '@/components/account/States';
import { api, asApiError } from '@/lib/api';
import { plural, whenWords } from '@/lib/format';
import { countryShort, LEVEL_WORDS } from '@/lib/registers';
import { useSession } from '@/lib/session';
import { scoreSentence, URGENT_CAP } from '@/lib/score';
import { useTheme } from '@/theme/ThemeProvider';
import { Sheet } from '@/ui/Controls';
import { Rise, useCountUp } from '@/ui/Motion';
import { BackBar, Pad, Screen } from '@/ui/Screen';
import { Btn, Card, List, Row, Section } from '@/ui/Surfaces';
import { Kicker, Pixel, T } from '@/ui/Text';

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** One company you follow: its result from public records only, read only, and a way to stop following. */
export default function FollowedCompany() {
  const { c } = useTheme();
  const { companyId = '' } = useLocalSearchParams<{ companyId: string }>();
  const queries = useQueryClient();
  const [asking, setAsking] = useState(false);
  const { status } = useSession();
  const watch = useQuery({ queryKey: ['watchlist'], enabled: status === 'signedIn', queryFn: () => api.watchlist.list() });
  const item = watch.data?.companies.find((entry) => entry.companyId === companyId) ?? null;
  const result = useQuery({
    queryKey: ['followed', companyId],
    enabled: !!companyId && status === 'signedIn',
    queryFn: async () => {
      const [company, overview] = await Promise.all([api.companies.get({ params: { companyId } }), api.results.overview({ params: { companyId }, query: { scope: 'company' } })]);
      return { company, overview };
    },
    refetchInterval: (query) => (query.state.data && !query.state.data.overview.hasResult ? 5000 : false),
  });
  const stop = useMutation({
    mutationFn: () => api.watchlist.remove({ params: { companyId } }),
    onSuccess: () => {
      setAsking(false);
      void queries.invalidateQueries({ queryKey: ['watchlist'] });
      queries.removeQueries({ queryKey: ['followed', companyId] });
      router.back();
    },
  });

  const data = result.data;
  const overview = data?.overview;
  const score = overview?.score;
  const exact = score?.kind === 'exact' ? score.value : 0;
  const shown = useCountUp(exact, { delay: 400 });
  const name = data?.company.legalName ?? item?.legalName ?? 'Company';
  const country = data?.company.incorporationCountry ?? item?.incorporationCountry ?? '';
  const level = (overview?.countryCoverage ?? item?.countryCoverage)?.level;
  const change = overview?.whatChanged ?? item?.lastChange ?? null;
  const delta = change && change.scoreBefore !== null && change.scoreAfter !== null ? change.scoreAfter - change.scoreBefore : null;
  const scanning = item?.scanInProgress || (overview && !overview.hasResult);
  const areas = (overview?.areas ?? []).filter((area) => area.score !== null || area.openCount !== null);

  return (
    <Screen
      refreshing={result.isRefetching}
      onRefresh={() => {
        void result.refetch();
        void watch.refetch();
      }}
      testID="followed-company"
      top={
        <>
          <BackBar title="Watchlist" />
          <Pad>
            <Rise>
              <Kicker onNavy bold="Public records only">
                Following ·
              </Kicker>
            </Rise>
            <Rise d={1}>
              <T variant="h1" onNavy accessibilityRole="header" style={{ marginTop: 10 }}>
                {name}
              </T>
              <T variant="sub" onNavy style={{ marginTop: 6 }}>
                {[country ? countryShort(country) : null, level ? LEVEL_WORDS[level] : null].filter(Boolean).join(' · ')}
              </T>
            </Rise>
            {overview && score && score.kind !== 'none' ? (
              <Rise d={2} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: 22 }}>
                <Pixel size={96} color={exact > 0 && exact <= URGENT_CAP ? '#FFB648' : '#fff'} accessibilityLabel={`Score ${score.kind === 'exact' ? score.value : `${score.low} to ${score.high}`}`}>
                  {score.kind === 'exact' ? shown : `${score.low}-${score.high}`}
                </Pixel>
                <View style={{ paddingBottom: 10, flex: 1 }}>
                  <T weight={700} size={16} onNavy>
                    {overview.statusWord ?? 'Scored'}
                  </T>
                  {overview.coverage && overview.coverage.total > 0 ? (
                    <T variant="small" onNavy style={{ marginTop: 2 }}>{`Based on ${overview.coverage.counted} of ${plural(overview.coverage.total, 'check', 'checks')}`}</T>
                  ) : null}
                </View>
              </Rise>
            ) : scanning ? (
              <Rise d={2} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22 }}>
                <ActivityIndicator color="#fff" />
                <T weight={600} size={15} onNavy>
                  Vero is reading its public records now
                </T>
              </Rise>
            ) : null}
            {overview?.sampleData ? <SampleTag onNavy style={{ marginTop: 16 }} /> : null}
          </Pad>
        </>
      }
    >
      {result.isPending ? (
        <Skeleton blocks={[110, 220]} style={{ marginTop: 0 }} />
      ) : result.isError && !data ? (
        <Problem error={result.error} onRetry={() => void result.refetch()} style={{ marginTop: 0 }} />
      ) : overview ? (
        <>
          <Rise d={3}>
            <Card>
              <T variant="kick">Where it stands</T>
              <T weight={600} size={15} color={c.ink2} style={{ marginTop: 6, lineHeight: 21 }}>
                {!overview.hasResult ? 'The first scan is still running. Its score shows here as soon as it finishes.' : overview.statusWord ? scoreSentence(overview.statusWord) : "Vero couldn't read enough of its public records to score it yet. It tries again on the next check."}
              </T>
              {overview.heldByUrgent ? (
                <T weight={600} size={13} color={c.warn} style={{ marginTop: 8 }}>{`An urgent gap holds this score at ${URGENT_CAP} until it's fixed.`}</T>
              ) : null}
              {overview.scannedAt ? <T variant="small" style={{ marginTop: 10 }}>{`Last scanned ${whenWords(overview.scannedAt).toLowerCase() === 'today' ? `today, ${TIME.format(new Date(overview.scannedAt))}` : whenWords(overview.scannedAt)}`}</T> : null}
            </Card>
          </Rise>

          {change ? (
            <>
              <Section title="What changed lately" />
              <Rise d={4}>
                <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                  {delta !== null && delta !== 0 ? (
                    <Pixel size={34} color={delta > 0 ? c.good : c.urgent}>{`${delta > 0 ? '+' : '−'}${Math.abs(delta)}`}</Pixel>
                  ) : null}
                  <View style={{ flex: 1 }}>
                    <T weight={600} size={14} color={c.ink2} style={{ lineHeight: 20 }}>
                      {change.summary}
                    </T>
                    <T variant="small" style={{ marginTop: 4 }}>
                      {whenWords(change.at)}
                    </T>
                  </View>
                </Card>
              </Rise>
            </>
          ) : null}

          {areas.length > 0 ? (
            <>
              <Section title="Areas" />
              <Rise d={5}>
                <List>
                  {areas.map((area) => (
                    <Row
                      key={area.layer}
                      title={area.name}
                      sub={area.openCount !== null ? (area.openCount === 0 ? 'Nothing open' : `${plural(area.openCount, 'gap', 'gaps')} open`) : area.description}
                      right={
                        area.score !== null ? (
                          <Pixel size={26} color={area.score <= URGENT_CAP ? c.warn : c.ink}>
                            {area.score}
                          </Pixel>
                        ) : (
                          <T weight={700} size={13} color={c.ink3}>
                            {area.locked ? 'Not on your plan' : 'No score'}
                          </T>
                        )
                      }
                    />
                  ))}
                </List>
              </Rise>
            </>
          ) : null}

          {overview.sourcesDown.length > 0 ? (
            <T variant="small" style={{ marginTop: 16, marginHorizontal: 4 }}>{`Couldn't reach ${overview.sourcesDown.map((s) => s.sourceName).join(', ')} this time. Vero tries again on the next check.`}</T>
          ) : null}

          <Rise d={6}>
            <Card style={{ marginTop: 22, paddingVertical: 16, borderRadius: 20 }}>
              <T weight={700} size={14.5}>
                Read only
              </T>
              <T variant="small" style={{ marginTop: 3, lineHeight: 18 }}>
                Vero reads this company&apos;s public records only. Only its own team can add evidence or answer questions.
              </T>
            </Card>
            <Btn kind="ghost" label="Stop following" onPress={() => setAsking(true)} style={{ marginTop: 14 }} testID="unfollow" />
          </Rise>
        </>
      ) : null}

      <Sheet open={asking} onClose={() => setAsking(false)} label="Stop following">
        <T variant="h3" accessibilityRole="header">{`Stop following ${name}?`}</T>
        <T variant="sub" style={{ marginTop: 6 }}>
          Its scans and findings go too. You can follow it again later, and Vero will scan it afresh.
        </T>
        {stop.isError ? (
          <T weight={600} size={13.5} color={c.urgent} style={{ marginTop: 12 }} accessibilityRole="alert">
            {asApiError(stop.error).message}
          </T>
        ) : null}
        <Btn label="Stop following" busy={stop.isPending} onPress={() => stop.mutate()} style={{ marginTop: 20 }} testID="unfollow-confirm" />
        <Btn kind="ghost" label="Keep following" onPress={() => setAsking(false)} style={{ marginTop: 10 }} />
      </Sheet>
    </Screen>
  );
}

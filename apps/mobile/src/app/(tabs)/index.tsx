import type { IssueSummary, OverviewResponse, VaultResponse } from '@vero/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { keys, setFocus, useChart, useIssues, useNextProjection, useView } from '@/components/findings/data';
import { go, goTab } from '@/components/findings/nav';
import { CompanyChoices, companyWords, ErrorCard, FindingRow, SampleNote, SheetHead, Skeleton, SkeletonList } from '@/components/findings/Parts';
import { Sparkline } from '@/components/findings/Sparkline';
import { api } from '@/lib/api';
import { isToDo } from '@/lib/documents';
import { daysUntil, midSentence, monthShort, plural, POINTS_HELD_WORDS, shortDate, shortName } from '@/lib/format';
import { findingHref, isOpenIssue, rankIssues } from '@/lib/issues';
import { coverageLevelWords, projectionWords, scoreSentence, URGENT_CAP, type Projected } from '@/lib/score';
import { useUnread, workspaceKey } from '@/lib/workspace';
import { router } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { brand } from '@/theme/tokens';
import { Sheet } from '@/ui/Controls';
import { Icon } from '@/ui/Icon';
import { Rise, useCountUp } from '@/ui/Motion';
import { Pad, Screen } from '@/ui/Screen';
import { Btn, Card, IconBtn, List, Row, Section, tap } from '@/ui/Surfaces';
import { Kicker, Pixel, T } from '@/ui/Text';

const STEPS = [
  { title: 'Tell Vero about the company', body: 'Find it on its official register, in any country, then answer a few short questions.' },
  { title: 'Vero checks the records', body: 'It reads the registers, sanctions lists and the website.' },
  { title: 'You get a score and one thing to fix', body: 'A score out of 100 in plain words, and the fix that matters most.' },
];

function verdict(overview: OverviewResponse): string {
  if (overview.heldByUrgent) return `${scoreSentence(overview.statusWord)} An urgent gap holds it at ${URGENT_CAP} or below.`;
  return scoreSentence(overview.statusWord);
}

/** The header row on the navy top: the company switcher, a new scan and the bell. */
function Header({ name, line, canSwitch, onSwitch }: { name: string; line: string; canSwitch: boolean; onSwitch: () => void }) {
  const unread = useUnread();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 16 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${line}${canSwitch ? '. Switch company' : ''}`}
        disabled={!canSwitch}
        onPress={() => {
          tap();
          onSwitch();
        }}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, flexShrink: 1, opacity: pressed ? 0.7 : 1 })}
      >
        <View style={{ flexShrink: 1 }}>
          <T weight={700} size={16} onNavy numberOfLines={1} style={{ lineHeight: 19, letterSpacing: -0.25 }}>
            {name}
          </T>
          <T weight={600} size={12.5} color="rgba(255,255,255,0.62)" numberOfLines={1}>
            {line}
          </T>
        </View>
        {canSwitch ? <Icon name="down" size={16} color="rgba(255,255,255,0.62)" /> : null}
      </Pressable>
      <View style={{ flex: 1 }} />
      <IconBtn icon="plus" label="New scan" onPress={() => go('/search')} />
      <IconBtn icon="bell" label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'} dot={unread > 0} onPress={() => go('/notifications')} />
    </View>
  );
}

/** The big pixel score counting up, out of 100, with the trend on the right. */
function ScoreRow({ overview }: { overview: OverviewResponse }) {
  const score = overview.score;
  const exact = useCountUp(score.kind === 'exact' ? score.value : 0);
  const low = useCountUp(score.kind === 'approximate' ? score.low : 0);
  const high = useCountUp(score.kind === 'approximate' ? score.high : 0);
  const trend = overview.trend;
  const words = score.kind === 'exact' ? `${score.value} out of 100` : score.kind === 'approximate' ? `${score.low} to ${score.high} out of 100` : 'Not scored yet';
  return (
    <View accessible accessibilityLabel={`Score ${words}`} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 10 }}>
      <Pixel size={score.kind === 'approximate' ? 72 : 104} color="#fff" testID="home-score">
        {score.kind === 'exact' ? exact : score.kind === 'approximate' ? `${low}-${high}` : '--'}
      </Pixel>
      <T weight={600} size={17} color="rgba(255,255,255,0.6)" style={{ paddingBottom: 10 }}>
        {score.kind === 'approximate' ? '/100, roughly' : '/100'}
      </T>
      {trend ? (
        <View style={{ marginLeft: 'auto', alignItems: 'flex-end', paddingBottom: 8 }}>
          <T weight={700} size={17} color={trend.delta < 0 ? brand.urgentOnNavy : '#5EEAD4'} style={{ lineHeight: 19 }}>
            {trend.delta === 0 ? 'No change' : `${trend.delta > 0 ? '+' : '-'}${Math.abs(trend.delta)}`}
          </T>
          <T weight={600} size={12} color="rgba(255,255,255,0.55)">
            since {monthShort(trend.since)}
          </T>
        </View>
      ) : null}
    </View>
  );
}

/** "Do this first": the next action with the score it leads to. */
function NextCard({ overview, projection }: { overview: OverviewResponse; projection: Projected | null }) {
  const { c } = useTheme();
  const action = overview.nextAction;
  const moves = projection !== null && projection.to > projection.from;
  const to = useCountUp(moves && projection ? projection.to : 0, { from: projection?.from ?? 0, ms: 1600, delay: 600 });
  const note = !action ? null : overview.score.kind !== 'exact' ? 'How much this fix is worth is part of a paid plan.' : action.points === 0 && overview.heldByUrgent && !moves ? POINTS_HELD_WORDS : null;
  const words = moves && projection ? projectionWords(projection) : null;
  return (
    <Card
      padded={false}
      style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 18 }}
      accessibilityLabel={action ? `Do this first: ${action.title}` : 'Nothing needs fixing right now. See what is coming up'}
      onPress={() => (action ? router.push(findingHref(action)) : goTab('/deadlines'))}
    >
      <Kicker>Do this first</Kicker>
      <T weight={700} size={21} style={{ marginTop: 8, lineHeight: 25, letterSpacing: -0.5 }}>
        {action ? action.title : 'Nothing needs fixing right now'}
      </T>
      <T size={14} weight={500} color={c.ink2} style={{ marginTop: 6, lineHeight: 21 }}>
        {action ? action.why : 'Vero keeps checking. Dates and changes show here.'}
      </T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.line2 }}>
        {moves && projection && words ? (
          <>
            <Pixel size={36} color={c.ink4}>
              {projection.from}
            </Pixel>
            <Icon name="chev" size={16} color={c.ink4} />
            <Pixel size={36} color={c.good}>
              {to}
            </Pixel>
            <T variant="small" size={12} style={{ marginLeft: 6, flexShrink: 1, lineHeight: 16 }}>
              {`${words[0]}\n${words[1]}`}
            </T>
          </>
        ) : (
          <T variant="small" style={{ flex: 1, lineHeight: 17 }}>
            {note ?? (action ? 'Open it to see what clears it.' : 'See the dates coming up.')}
          </T>
        )}
        <View style={{ marginLeft: 'auto', width: 44, height: 44, borderRadius: 15, backgroundColor: c.navy, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrow" size={20} color="#fff" />
        </View>
      </View>
    </Card>
  );
}

/** "Coming up": the next date, in days, from the overview. */
function ComingUp({ overview }: { overview: OverviewResponse }) {
  const { c } = useTheme();
  const deadlines = overview.topDeadlines;
  const next = deadlines.find((item) => item.state !== 'overdue' && item.state !== 'done');
  const overdue = deadlines.filter((item) => item.state === 'overdue').length;
  const days = next ? Math.max(0, daysUntil(next.dueOn)) : 0;
  const shown = useCountUp(next ? days : overdue, { delay: 500 });
  if (deadlines.length === 0) {
    return (
      <Card>
        <T weight={700} size={14}>
          No dates yet
        </T>
        <T variant="small" style={{ marginTop: 2 }}>
          They show here as soon as Vero can work them out.
        </T>
      </Card>
    );
  }
  const title = next ? (days === 0 ? `${next.title} is due today` : `${days === 1 ? 'day' : 'days'} until ${midSentence(next.title)}`) : overdue === 1 ? 'date has passed' : 'dates have passed';
  const line = next ? `Due ${shortDate(next.dueOn)}, ${next.companyName}` : 'Each one says what to file, and where.';
  return (
    <Card padded={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 22 }} accessibilityLabel={`${next ? `${days} ${title}` : `${overdue} ${title}`}. ${line}`} onPress={() => goTab('/deadlines')}>
      <Pixel size={44} color={next ? c.navy : c.urgent}>
        {shown}
      </Pixel>
      <View style={{ flex: 1 }}>
        <T weight={700} size={14} style={{ lineHeight: 18 }}>
          {title}
        </T>
        <T variant="small" style={{ marginTop: 1 }}>
          {line}
        </T>
      </View>
    </Card>
  );
}

function documentsLine(vault: VaultResponse | undefined): string {
  if (!vault) return 'From registers, and the ones you share';
  const inOrder = vault.slots.filter((slot) => slot.state === 'read').length;
  const toDo = vault.slots.filter((slot) => isToDo(slot.state)).length;
  return `${inOrder} in order, ${toDo} ${toDo === 1 ? 'needs' : 'need'} action`;
}

/** Before the first result: what a scan does, and the one way in. */
function Empty({ header }: { header: ReactNode }) {
  const { c } = useTheme();
  return (
    <Screen
      tabs
      top={
        <>
          {header}
          <Pad>
            <Rise>
              <Kicker onNavy style={{ marginTop: 14 }}>
                Legal health
              </Kicker>
            </Rise>
            <Rise d={1} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 10 }}>
              <Pixel size={104} color="rgba(255,255,255,0.45)" accessibilityLabel="Not scored yet">
                --
              </Pixel>
              <T weight={600} size={17} color="rgba(255,255,255,0.6)" style={{ paddingBottom: 10 }}>
                /100
              </T>
            </Rise>
            <Rise d={2}>
              <T weight={700} size={16.5} onNavy style={{ marginTop: 14, maxWidth: 290, lineHeight: 22 }}>
                Your score shows here after the first scan.
              </T>
            </Rise>
          </Pad>
        </>
      }
    >
      <Rise d={3}>
        <Card>
          <Kicker>Start here</Kicker>
          <T weight={700} size={21} style={{ marginTop: 8, lineHeight: 25, letterSpacing: -0.5 }}>
            Find your company
          </T>
          <T size={14} color={c.ink2} style={{ marginTop: 6, lineHeight: 21 }}>
            Vero finds it on its official register, in any country, and starts checking straight away. No documents needed.
          </T>
          <Btn label="Find your company" icon="search" onPress={() => go('/search')} style={{ marginTop: 18 }} testID="find-company" />
        </Card>
      </Rise>
      <Section title="How it works" />
      <Rise d={4}>
        <List>
          {STEPS.map((step, index) => (
            <Row
              key={step.title}
              left={
                <Pixel size={28} color={c.navy} style={{ width: 22 }}>
                  {index + 1}
                </Pixel>
              }
              title={step.title}
              sub={<T variant="small" style={{ marginTop: 2 }}>{step.body}</T>}
            />
          ))}
        </List>
      </Rise>
    </Screen>
  );
}

/** The Overview tab, as on the Home board. */
export default function Overview() {
  const { c } = useTheme();
  const queries = useQueryClient();
  const { view, loading, error, refetch } = useView();
  const [switching, setSwitching] = useState(false);
  const [pulling, setPulling] = useState(false);
  const companyId = view?.company.id;
  const scope = view?.scope ?? 'company';
  const overview = view?.overview ?? null;
  const ready = view?.hasResult === true && overview !== null;

  const issues = useIssues(ready ? companyId : undefined, scope);
  const projection = useNextProjection(ready ? overview : null, companyId, scope);
  const chartCompanies = useMemo(() => (view ? (view.scope === 'group' ? view.companies : [view.company]) : []), [view]);
  const chart = useChart(ready ? chartCompanies : []);
  const vault = useQuery({ queryKey: keys.vault(companyId ?? 'none'), enabled: ready && !!companyId, queryFn: () => api.vault.get({ params: { companyId: companyId ?? '' } }) });

  const open = useMemo(() => (issues.data?.issues ?? []).filter(isOpenIssue).sort(rankIssues), [issues.data]);
  const group = scope === 'group';

  const refresh = async () => {
    setPulling(true);
    try {
      await Promise.all([refetch(), queries.invalidateQueries({ queryKey: workspaceKey }), queries.invalidateQueries({ queryKey: ['notifications'] })]);
    } finally {
      setPulling(false);
    }
  };

  const words = view ? companyWords(view.company, group, view.companies.length) : { name: 'Vero', line: 'Legal health' };
  const header = <Header name={words.name} line={words.line} canSwitch={!!view?.hasGroup} onSwitch={() => setSwitching(true)} />;
  const sheet = view ? (
    <Sheet open={switching} onClose={() => setSwitching(false)} label="Choose a company">
      <SheetHead title="Show" onClose={() => setSwitching(false)} />
      <T variant="sub" style={{ marginTop: 4, marginBottom: 16 }}>
        The whole group, or one company on its own.
      </T>
      <CompanyChoices
        companies={view.companies}
        focus={view.focus}
        hasGroup={view.hasGroup}
        onPick={(id) => {
          setFocus(id);
          setSwitching(false);
        }}
      />
    </Sheet>
  ) : null;

  if (loading) {
    return (
      <Screen
        tabs
        top={
          <>
            {header}
            <Pad style={{ gap: 14, marginTop: 14 }}>
              <Skeleton onNavy w={90} h={11} />
              <Skeleton onNavy w={170} h={86} r={14} />
              <Skeleton onNavy w="80%" h={16} />
              <Skeleton onNavy w="100%" h={86} r={14} />
            </Pad>
          </>
        }
      >
        <Skeleton h={190} r={24} />
        <View style={{ height: 28 }} />
        <SkeletonList />
      </Screen>
    );
  }

  if (error && !view) {
    return (
      <Screen tabs top={header} onRefresh={() => void refresh()} refreshing={pulling}>
        <ErrorCard error={error} onRetry={() => void refresh()} />
      </Screen>
    );
  }

  if (!view || !ready || !overview) {
    return (
      <>
        <Empty header={header} />
        {sheet}
      </>
    );
  }

  const company = view.company;
  const level = coverageLevelWords(overview.countryCoverage ?? company.countryCoverage, company.incorporationCountry);
  const coverage = overview.coverage;
  const chartData = chart.data ?? null;
  const capped = overview.heldByUrgent && (!group || chartData?.company.id === overview.nextAction?.companyId);
  const rows: IssueSummary[] = open.slice(0, 3);

  return (
    <>
      <Screen
        tabs
        onRefresh={() => void refresh()}
        refreshing={pulling}
        top={
          <>
            {header}
            <Pad>
              <Rise>
                <Kicker onNavy style={{ marginTop: 14 }}>
                  {group ? 'Group legal health' : 'Legal health'}
                </Kicker>
              </Rise>
              <Rise d={1}>
                <ScoreRow overview={overview} />
              </Rise>
              <Rise d={2}>
                <T weight={700} size={16.5} onNavy style={{ marginTop: 14, maxWidth: 300, lineHeight: 22, letterSpacing: -0.25 }}>
                  {verdict(overview)}
                </T>
              </Rise>
              <Rise d={3}>
                {chartData && chartData.points.length > 0 ? (
                  <Sparkline
                    key={`${chartData.company.id}-${chartData.points.length}`}
                    points={chartData.points}
                    cap={capped ? URGENT_CAP : null}
                    caption={group ? `${shortName(chartData.company.legalName)} over time` : null}
                    label={`${chartData.company.legalName} over time`}
                  />
                ) : chart.isPending ? (
                  <Skeleton onNavy h={86} r={14} style={{ marginTop: 14 }} />
                ) : (
                  <T variant="small" onNavy style={{ marginTop: 14 }}>
                    The line starts after the first finished scan.
                  </T>
                )}
              </Rise>
              <Rise d={4} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 10 }}>
                <T weight={600} size={12.5} color="rgba(255,255,255,0.62)" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {level ?? 'Checks that count'}
                </T>
                {coverage && coverage.total > 0 ? (
                  <T weight={600} size={12.5} color="rgba(255,255,255,0.62)" testID="score-basis">
                    <T weight={700} size={12.5} color="#fff">
                      {coverage.counted}
                    </T>{' '}
                    of {plural(coverage.total, 'check', 'checks')}
                  </T>
                ) : (
                  <T weight={600} size={12.5} color="rgba(255,255,255,0.62)">
                    Not scored yet
                  </T>
                )}
              </Rise>
            </Pad>
          </>
        }
      >
        {overview.sampleData ? (
          <Rise d={4}>
            <SampleNote style={{ marginBottom: 14 }} />
          </Rise>
        ) : null}
        <Rise d={4}>
          <NextCard overview={overview} projection={projection.data ?? null} />
        </Rise>

        <Section title="Open findings" action="See all" onAction={() => goTab('/findings')} />
        <Rise d={5}>
          {issues.isPending ? (
            <SkeletonList />
          ) : issues.error ? (
            <ErrorCard error={issues.error} onRetry={() => void issues.refetch()} />
          ) : rows.length === 0 ? (
            <Card>
              <T weight={700} size={14}>
                Nothing open
              </T>
              <T variant="small" style={{ marginTop: 2 }}>
                Vero keeps checking, and new findings show here.
              </T>
            </Card>
          ) : (
            <List>
              {rows.map((issue) => (
                <FindingRow key={`${issue.companyId}|${issue.ruleKey}`} issue={issue} group={group} />
              ))}
            </List>
          )}
        </Rise>

        <Section title="Coming up" action="Deadlines" onAction={() => goTab('/deadlines')} />
        <Rise d={6}>
          <ComingUp overview={overview} />
        </Rise>

        <Section title="More" />
        <Rise d={7}>
          <List>
            <Row title="Documents" sub={documentsLine(vault.data)} chevron onPress={() => go('/documents')} accessibilityLabel="Documents" />
            <Row title="Share the report" sub="A read-only link for investors and buyers" chevron onPress={() => go('/share')} accessibilityLabel="Share the report" />
            <Row title="Settings" sub="Alerts, team, appearance and plan" chevron onPress={() => go('/settings')} accessibilityLabel="Settings" />
          </List>
        </Rise>
        <T variant="small" center style={{ marginTop: 22, paddingHorizontal: 12, color: c.ink3 }}>
          {overview.notLegalAdvice}
        </T>
      </Screen>
      {sheet}
    </>
  );
}

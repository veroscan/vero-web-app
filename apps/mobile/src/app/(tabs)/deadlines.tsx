import type { Deadline, DeadlineListResponse } from '@vero/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Label, NavyCard, Page, SampleTag } from '@/components/account/Page';
import { Empty, Problem, Skeleton, SmallBtn, useToast } from '@/components/account/States';
import { api, asApiError } from '@/lib/api';
import { basisWords, calendarFile, daysTo, isWatched, nextDue, rowDate, trackingWords, watchingNote } from '@/lib/deadlines';
import { entitlementsOf, roleCan } from '@/lib/entitlements';
import { longDate, plural, shortName } from '@/lib/format';
import { useSession } from '@/lib/session';
import { shareText } from '@/lib/share-links';
import { useWorkspace, workspaceKey } from '@/lib/workspace';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/ui/Icon';
import { Rise, useCountUp } from '@/ui/Motion';
import { List, Row, tap } from '@/ui/Surfaces';
import { Kicker, Pixel, T } from '@/ui/Text';

const deadlinesKey = ['deadlines'] as const;

/** "21 days late", "Due soon, in 8 days", "In 105 days". */
function dueWords(item: Deadline): { text: string; tone: 'urgent' | 'warn' | 'plain' } {
  if (item.state === 'overdue') return { text: `${plural(-item.daysUntil, 'day', 'days')} late`, tone: 'urgent' };
  if (item.daysUntil === 0) return { text: 'Due today', tone: 'warn' };
  if (item.state === 'due_soon') return { text: `Due soon, in ${plural(item.daysUntil, 'day', 'days')}`, tone: 'warn' };
  return { text: `In ${plural(item.daysUntil, 'day', 'days')}`, tone: 'plain' };
}

function downloadOnWeb(text: string, name: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The navy `.nd` card: the countdown to the next date, counting up in pixel numbers. */
function NextCard({ next, lateCount, open }: { next: Deadline | null; lateCount: number; open: Deadline[] }) {
  const days = next ? daysTo(next.dueOn) : 0;
  const shown = useCountUp(days, { delay: 350 });
  const addToCalendar = () => {
    if (Platform.OS === 'web') {
      downloadOnWeb(calendarFile(open), 'vero-deadlines.ics');
      return;
    }
    const lines = open.map((item) => `${longDate(item.dueOn)}: ${item.title}, ${item.companyName}`);
    void shareText(lines.join('\n'));
  };
  return (
    <NavyCard style={{ marginTop: 22 }}>
      <View style={{ paddingHorizontal: 22, paddingVertical: 20 }}>
        <Kicker onNavy>Next deadline</Kicker>
        {next ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 12 }} accessible accessibilityLabel={`${plural(days, 'day', 'days')} to go`}>
              <Pixel size={88} color="#fff">
                {shown}
              </Pixel>
              <T weight={700} size={16} color="rgba(255,255,255,0.66)" style={{ paddingBottom: 8 }}>
                {days === 1 ? 'day' : 'days'}
              </T>
            </View>
            <T weight={700} size={16} onNavy style={{ marginTop: 12, letterSpacing: -0.15 }}>
              {next.title}
            </T>
            <T variant="small" onNavy style={{ marginTop: 2, fontSize: 13 }}>
              {`Due ${longDate(next.dueOn)} · ${shortName(next.companyName)}`}
            </T>
          </>
        ) : (
          <>
            <Pixel size={64} color="#fff" style={{ marginTop: 12 }}>
              0
            </Pixel>
            <T weight={700} size={16} onNavy style={{ marginTop: 10 }}>
              No date ahead that we know of yet
            </T>
            <T variant="small" onNavy style={{ marginTop: 2 }}>
              Vero adds a date as soon as a check gives one. It never guesses.
            </T>
          </>
        )}
        {lateCount > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF6B70' }} />
            <T weight={700} size={13} color="#FF9A9E">
              {lateCount === 1 ? '1 date is overdue, below' : `${lateCount} dates are overdue, below`}
            </T>
          </View>
        ) : null}
        {open.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={Platform.OS === 'web' ? 'Add to calendar' : 'Share the dates'}
            onPress={() => {
              tap();
              addToCalendar();
            }}
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 16,
              height: 44,
              paddingHorizontal: 14,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.18)',
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <Icon name="cal" size={17} color="#fff" />
            <T weight={700} size={13.5} color="#fff">
              {Platform.OS === 'web' ? 'Add to calendar' : 'Share the dates'}
            </T>
          </Pressable>
        ) : null}
      </View>
    </NavyCard>
  );
}

/** One `.ti` on the timeline: the date, the line with its dot, and the card. Tap to see how the date was worked out. */
function TimelineItem({ item, watching, canMark, onMark, busy, d, last }: { item: Deadline; watching: boolean; canMark: boolean; onMark: (item: Deadline) => void; busy: boolean; d: number; last: boolean }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  const late = item.state === 'overdue';
  const due = dueWords(item);
  const dueColour = due.tone === 'urgent' ? c.urgent : due.tone === 'warn' ? c.warn : c.ink2;
  const basis = basisWords(item.basis) ?? 'From the rules for this country';
  const markable = canMark && item.monitoring === 'reminder';
  return (
    <Rise d={d} style={{ flexDirection: 'row', gap: 10 }}>
      <View style={{ width: 52, paddingTop: 18, alignItems: 'flex-end' }}>
        <T weight={700} size={13} color={late ? c.urgent : c.ink3} style={{ textAlign: 'right' }}>
          {late ? 'Now' : rowDate(item.dueOn)}
        </T>
      </View>
      <View style={{ width: 14 }}>
        <View style={{ position: 'absolute', left: 6, top: 0, bottom: last ? 'auto' : 0, height: last ? 26 : undefined, width: 1.5, backgroundColor: c.line }} />
        {late ? <View style={{ position: 'absolute', left: -3, top: 16, width: 20, height: 20, borderRadius: 10, backgroundColor: c.dark ? 'rgba(255,122,127,0.16)' : 'rgba(229,72,77,0.14)' }} /> : null}
        <View style={{ position: 'absolute', left: 1, top: 20, width: 12, height: 12, borderRadius: 6, backgroundColor: c.dark ? '#0B1068' : '#fff', borderWidth: 2, borderColor: late ? c.urgent : due.tone === 'warn' ? c.warn : c.ink4 }} />
      </View>
      <View
        style={{
          flex: 1,
          minWidth: 0,
          marginBottom: 10,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: open ? (c.dark ? 'rgba(120,150,255,0.3)' : '#D5DBEA') : c.cardBorder,
          backgroundColor: c.cardGradient ? 'transparent' : c.card,
          overflow: 'hidden',
        }}
      >
        {c.cardGradient ? <LinearGradient colors={c.cardGradient} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} /> : null}
        <Pressable
          testID="deadline-card"
          accessibilityRole="button"
          accessibilityLabel={`${item.title}, ${item.companyName}. ${due.text}. ${open ? 'Hide' : 'Show'} how this date was worked out`}
          accessibilityState={{ expanded: open }}
          onPress={() => {
            tap();
            setOpen((v) => !v);
          }}
          style={({ pressed }) => ({ paddingTop: 14, paddingBottom: open ? 0 : 14, paddingHorizontal: 16, backgroundColor: pressed && !c.dark ? c.rowPressed : 'transparent' })}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <T weight={700} size={14.5} style={{ flex: 1, lineHeight: 19 }}>
              {item.title}
            </T>
            <View style={{ paddingTop: 1, transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
              <Icon name="chev" size={16} color={c.ink4} />
            </View>
          </View>
          <T variant="small" style={{ marginTop: 2 }} numberOfLines={1}>
            {item.companyName}
          </T>
          <T weight={700} size={13} color={dueColour} style={{ marginTop: 8 }}>
            {due.text}
          </T>
        </Pressable>
          {open ? (
            <Animated.View entering={FadeIn.duration(320)} style={{ marginTop: 12, marginHorizontal: 16, marginBottom: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.line2, gap: 10 }}>
              <View>
                <T variant="kick">Where the date comes from</T>
                <T weight={600} size={13.5} color={c.ink2} style={{ marginTop: 3 }}>{`${basis}. Due ${longDate(item.dueOn)}.`}</T>
              </View>
              <View>
                <T variant="kick">How Vero tracks it</T>
                <T weight={600} size={13.5} color={c.ink2} style={{ marginTop: 3 }}>{`${trackingWords(item, watching)}.`}</T>
              </View>
              {item.needsReview ? (
                <T weight={600} size={13} color={c.warn}>
                  This date rests on a rule that hasn&apos;t been reviewed yet, so treat it as a guide.
                </T>
              ) : null}
              {markable ? (
                <View style={{ flexDirection: 'row' }}>
                  <SmallBtn testID="mark-done" icon="check" label="Mark as done" busy={busy} onPress={() => onMark(item)} />
                </View>
              ) : null}
            </Animated.View>
          ) : null}
      </View>
    </Rise>
  );
}

export default function Deadlines() {
  const { c } = useTheme();
  const { me, status } = useSession();
  const workspace = useWorkspace();
  const queries = useQueryClient();
  const { toast, node } = useToast(90);
  const list = useQuery({ queryKey: deadlinesKey, enabled: status === 'signedIn', queryFn: () => api.deadlines.list({ query: {} }) });
  const [busyId, setBusyId] = useState<string | null>(null);

  const change = useMutation({
    mutationFn: async ({ item, undo }: { item: Deadline; undo: boolean }) => {
      const params = { params: { deadlineId: item.id } };
      return undo ? api.deadlines.undone(params) : api.deadlines.done(params);
    },
    onMutate: ({ item }) => setBusyId(item.id),
    onSuccess: (updated, { undo }) => {
      queries.setQueryData<DeadlineListResponse>(deadlinesKey, (old) => (old ? { ...old, deadlines: old.deadlines.map((d) => (d.id === updated.id ? updated : d)) } : old));
      void queries.invalidateQueries({ queryKey: deadlinesKey });
      void queries.invalidateQueries({ queryKey: workspaceKey });
      toast(undo ? 'Moved back to your deadlines.' : 'Marked as done. You can undo it under Done.');
    },
    onError: (error) => toast(asApiError(error).message),
    onSettled: () => setBusyId(null),
  });

  const ws = workspace.data;
  const plan = ws?.overview?.plan;
  const watching = isWatched(entitlementsOf(plan));
  const note = watchingNote(entitlementsOf(plan));
  const canMark = roleCan(me, 'deadlines.write');
  const data = list.data;
  const all = useMemo(() => data?.deadlines ?? [], [data]);
  const open = all.filter((item) => item.state !== 'done');
  const late = open.filter((item) => item.state === 'overdue').sort((a, b) => a.dueOn.localeCompare(b.dueOn));
  const coming = open.filter((item) => item.state !== 'overdue').sort((a, b) => a.dueOn.localeCompare(b.dueOn));
  const year = [...late, ...coming.filter((item) => daysTo(item.dueOn) <= 365)];
  const later = coming.filter((item) => daysTo(item.dueOn) > 365);
  const done = all.filter((item) => item.state === 'done');
  const undated = data?.undated ?? [];
  const nameOf = (companyId: string) => ws?.companies.find((company) => company.id === companyId)?.legalName ?? '';
  const nothing = data && all.length === 0 && undated.length === 0;

  const sub = ws?.root ? (ws.related.length > 0 ? `${shortName(ws.root.legalName)} and ${plural(ws.related.length, 'linked company', 'linked companies')}` : ws.root.legalName) : 'Your filing and payment dates';
  const markDone = (item: Deadline) => change.mutate({ item, undo: false });

  return (
    <Page tabs refreshing={list.isRefetching} onRefresh={() => void list.refetch()} overlay={node} testID="deadlines">
      <Rise>
        <T variant="h1" accessibilityRole="header" style={{ marginTop: 8 }}>
          Deadlines
        </T>
      </Rise>
      <Rise d={1}>
        <T variant="sub" style={{ marginTop: 6 }}>
          {sub}
        </T>
        {ws?.overview?.sampleData ? <SampleTag style={{ marginTop: 10 }} /> : null}
      </Rise>

      {list.isPending ? (
        <Skeleton blocks={[250, 88, 88, 88]} />
      ) : list.isError && !data ? (
        <Problem error={list.error} onRetry={() => void list.refetch()} />
      ) : nothing ? (
        <Empty title="We don't have any dates yet" body="That doesn't mean nothing is due. It means no check has given us a date so far." art={<Icon name="cal" size={40} color={c.ink3} stroke={1.5} />} />
      ) : (
        <>
          <Rise d={2}>
            <NextCard next={nextDue(all)} lateCount={late.length} open={open} />
          </Rise>

          {year.length > 0 ? (
            <>
              <View style={{ marginTop: 28, marginBottom: 12, marginHorizontal: 4 }}>
                <T variant="h2" accessibilityRole="header">
                  Next 12 months
                </T>
              </View>
              {year.map((item, i) => (
                <TimelineItem key={item.id} item={item} watching={watching} canMark={canMark} onMark={markDone} busy={busyId === item.id} d={Math.min(3 + i, 10)} last={i === year.length - 1} />
              ))}
            </>
          ) : null}

          {later.length > 0 ? (
            <>
              <Label>Later</Label>
              {later.map((item, i) => (
                <TimelineItem key={item.id} item={item} watching={watching} canMark={canMark} onMark={markDone} busy={busyId === item.id} d={Math.min(3 + i, 10)} last={i === later.length - 1} />
              ))}
            </>
          ) : null}

          {undated.length > 0 ? (
            <>
              <Label>No date yet</Label>
              <Rise d={4}>
                <List>
                  {undated.map((item) => (
                    <Row
                      key={`${item.companyId}-${item.ruleKey}`}
                      title={item.title}
                      sub={
                        <T variant="small" style={{ marginTop: 2 }}>
                          {`${nameOf(item.companyId)}. We need ${item.waitingOn}. Vero won't guess a date.`}
                        </T>
                      }
                      right={
                        <T weight={700} size={13} color={c.ink3}>
                          No date
                        </T>
                      }
                    />
                  ))}
                </List>
              </Rise>
            </>
          ) : null}

          {done.length > 0 ? (
            <>
              <Label>Done</Label>
              <Rise d={4}>
                <List>
                  {done.map((item) => (
                    <Row
                      key={item.id}
                      title={item.title}
                      sub={`${shortName(item.companyName)}. Was due ${longDate(item.dueOn)}.`}
                      right={canMark ? <SmallBtn testID="undo-done" label="Undo" busy={busyId === item.id} onPress={() => change.mutate({ item, undo: true })} /> : <T weight={700} size={13} color={c.good}>Done</T>}
                    />
                  ))}
                </List>
              </Rise>
            </>
          ) : null}

          {note ? (
            <Rise d={5}>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginHorizontal: 4 }}>
                <Icon name="bell" size={18} color={c.ink3} />
                <T variant="small" style={{ flex: 1, lineHeight: 18 }}>
                  <T variant="small" weight={700} color={c.ink2}>{`${note.title} `}</T>
                  {`${note.body} Reminders arrive in Notifications 30, 7 and 1 day before each date.`}
                </T>
              </View>
            </Rise>
          ) : null}
        </>
      )}
    </Page>
  );
}

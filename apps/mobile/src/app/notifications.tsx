import type { Notification, NotificationListResponse } from '@vero/shared';
import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Label, Page } from '@/components/account/Page';
import { Empty, Problem, Skeleton, SmallBtn } from '@/components/account/States';
import { api, asApiError } from '@/lib/api';
import { longDate } from '@/lib/format';
import { useSession } from '@/lib/session';
import { useTheme } from '@/theme/ThemeProvider';
import { brand } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Rise } from '@/ui/Motion';
import { List, tap } from '@/ui/Surfaces';
import { T } from '@/ui/Text';

const feedKey = ['notifications', 'feed'] as const;
type Feed = InfiniteData<NotificationListResponse, string | undefined>;

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
const WEEKDAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

/** Look-ups by a lawyer were removed with that service (19 Nov 2026). Old ones aren't shown (web notifications page). */
const shownKind = (item: Notification) => item.kind !== 'lawyer';

/** The API writes dates as 2026-11-18. People read 18 November 2026. */
function readable(text: string): string {
  return text.replace(/\b(\d{4}-\d{2}-\d{2})\b/g, (match) => longDate(match)).replace(/\.\./g, '.');
}

function dayIndex(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

function bucketOf(iso: string, now: Date): 'Today' | 'This week' | 'Earlier' {
  const gap = dayIndex(now) - dayIndex(new Date(iso));
  if (gap <= 0) return 'Today';
  if (gap < 7) return 'This week';
  return 'Earlier';
}

function timeWords(iso: string, now: Date): string {
  const date = new Date(iso);
  const gap = dayIndex(now) - dayIndex(date);
  if (gap <= 0) return TIME.format(date);
  if (gap === 1) return 'Yesterday';
  if (gap < 7) return WEEKDAY.format(date);
  return DAY.format(date);
}

/** Where a notification's web link opens in the app. Screens the app doesn't have go to the overview. */
function openLink(link: string | null): void {
  if (!link) return;
  if (link.startsWith('/deadlines')) router.navigate('/deadlines');
  else if (link.startsWith('/watchlist/')) {
    const companyId = link.split('/')[2] ?? '';
    if (companyId) router.push({ pathname: '/watchlist/[companyId]', params: { companyId } });
  } else if (link.startsWith('/watchlist')) router.navigate('/watchlist');
  else if (link.startsWith('/settings')) router.push('/settings');
  else if (link.startsWith('/notifications')) return;
  else router.navigate('/');
}

/** One `.nt` row: new ones carry the soft blue wash, a heavier title and a sky time. */
function Item({ item, fresh, now, onOpen }: { item: Notification; fresh: boolean; now: Date; onOpen: (item: Notification) => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      testID={fresh ? 'notification-new' : 'notification'}
      accessibilityRole="button"
      accessibilityLabel={`${fresh ? 'New. ' : ''}${readable(item.title)}. ${item.body ? readable(item.body) : ''}`}
      onPress={() => {
        tap();
        onOpen(item);
      }}
    >
      {({ pressed }) => (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 16, paddingHorizontal: 18, backgroundColor: pressed ? c.rowPressed : 'transparent' }}>
          {fresh ? <LinearGradient colors={c.dark ? ['rgba(61,123,255,0.16)', 'rgba(61,123,255,0)'] : ['#EEF4FF', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 0 }} style={StyleSheet.absoluteFill} /> : null}
          <View style={{ flex: 1, minWidth: 0 }}>
            <T weight={fresh ? 800 : 600} size={15} color={fresh ? c.ink : c.ink2} style={{ lineHeight: 20, letterSpacing: -0.15 }}>
              {readable(item.title)}
            </T>
            {item.body ? (
              <T variant="small" style={{ marginTop: 3, lineHeight: 18 }}>
                {readable(item.body)}
              </T>
            ) : null}
          </View>
          <T weight={fresh ? 700 : 600} size={12.5} color={fresh ? (c.dark ? '#5AA9FF' : brand.blue) : c.ink3} style={{ paddingTop: 2 }}>
            {timeWords(item.createdAt, now)}
          </T>
        </View>
      )}
    </Pressable>
  );
}

export default function Notifications() {
  const { c } = useTheme();
  const queries = useQueryClient();
  const now = new Date();
  /** Rows marked read in this visit, cleared one after another like the board. */
  const [cleared, setCleared] = useState<Set<string>>(new Set());
  const [problem, setProblem] = useState<string | null>(null);
  const { status } = useSession();
  const feed = useInfiniteQuery({
    queryKey: feedKey,
    enabled: status === 'signedIn',
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => api.notifications.list({ query: { limit: 30, ...(pageParam ? { cursor: pageParam } : {}) } }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
  const items = (feed.data?.pages ?? []).flatMap((page) => page.notifications).filter(shownKind);
  const isNew = (item: Notification) => !item.readAt && !cleared.has(item.id);
  const fresh = items.filter(isNew);

  const markReadLocally = (ids: string[]) => {
    const at = new Date().toISOString();
    queries.setQueryData<Feed>(feedKey, (old) =>
      old ? { ...old, pages: old.pages.map((page) => ({ ...page, notifications: page.notifications.map((n) => (ids.includes(n.id) ? { ...n, readAt: n.readAt ?? at } : n)) })) } : old,
    );
  };

  const markOne = useMutation({
    mutationFn: (id: string) => api.notifications.markRead({ params: { notificationId: id } }),
    onSettled: () => void queries.invalidateQueries({ queryKey: ['notifications', 'unread'] }),
  });
  const markAll = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onMutate: () => setProblem(null),
    onSuccess: () => {
      // The highlight leaves each new row in turn, 120ms apart, as on the board.
      const ids = fresh.map((item) => item.id);
      ids.forEach((id, i) =>
        setTimeout(() => {
          setCleared((prev) => new Set(prev).add(id));
          if (i === ids.length - 1) {
            markReadLocally(ids);
            void queries.invalidateQueries({ queryKey: ['notifications'] });
          }
        }, i * 120),
      );
      if (ids.length === 0) void queries.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => setProblem(asApiError(error).message),
  });

  const open = (item: Notification) => {
    if (isNew(item)) {
      setCleared((prev) => new Set(prev).add(item.id));
      markReadLocally([item.id]);
      markOne.mutate(item.id);
    }
    openLink(item.link);
  };

  const groups = (['Today', 'This week', 'Earlier'] as const).map((title) => ({ title, rows: items.filter((item) => bucketOf(item.createdAt, now) === title) })).filter((group) => group.rows.length > 0);

  return (
    <Page
      back
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mark all read"
          accessibilityState={{ disabled: fresh.length === 0 || markAll.isPending }}
          disabled={fresh.length === 0 || markAll.isPending}
          hitSlop={10}
          testID="mark-all-read"
          onPress={() => {
            tap();
            markAll.mutate();
          }}
          style={({ pressed }) => ({ minHeight: 44, justifyContent: 'center', paddingHorizontal: 4, opacity: fresh.length === 0 ? 0.4 : pressed ? 0.6 : 1 })}
        >
          <T weight={700} size={14} color={c.dark ? '#5AA9FF' : brand.blue}>
            Mark all read
          </T>
        </Pressable>
      }
      refreshing={feed.isRefetching && !feed.isFetchingNextPage}
      onRefresh={() => {
        setCleared(new Set());
        void feed.refetch();
        void queries.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      }}
      testID="notifications"
    >
      <Rise>
        <T variant="h1" accessibilityRole="header" style={{ marginTop: 4 }}>
          Notifications
        </T>
      </Rise>
      <Rise d={1}>
        <T variant="sub" style={{ marginTop: 6 }} accessibilityLiveRegion="polite">
          {feed.data ? (fresh.length > 0 ? `${fresh.length}${feed.hasNextPage ? '+' : ''} new` : 'All caught up') : ' '}
        </T>
      </Rise>

      {problem ? (
        <T weight={600} size={13.5} color={c.urgent} style={{ marginTop: 12 }} accessibilityRole="alert">
          {problem}
        </T>
      ) : null}

      {feed.isPending ? (
        <Skeleton blocks={[220, 160]} />
      ) : feed.isError && !feed.data ? (
        <Problem error={feed.error} onRetry={() => void feed.refetch()} />
      ) : items.length === 0 ? (
        <Empty art={<Icon name="bell" size={40} color={c.ink3} stroke={1.5} />} title="Nothing here yet" body="We'll tell you here when your score moves, a date gets close or something changes." />
      ) : (
        <>
          {groups.map((group, i) => (
            <View key={group.title}>
              <Label>{group.title}</Label>
              <Rise d={2 + i}>
                <List>
                  {group.rows.map((item) => (
                    <Item key={item.id} item={item} fresh={isNew(item)} now={now} onOpen={open} />
                  ))}
                </List>
              </Rise>
            </View>
          ))}
          {feed.hasNextPage ? (
            <View style={{ alignItems: 'center', marginTop: 18 }}>
              <SmallBtn label="Show earlier" busy={feed.isFetchingNextPage} onPress={() => void feed.fetchNextPage()} />
            </View>
          ) : null}
          <T variant="small" center style={{ marginTop: 22 }}>
            Updates go to the owners and admins of each company.
          </T>
        </>
      )}
    </Page>
  );
}

'use client';

import type { Notification, NotificationKind } from '@vero/shared';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Empty, ErrorState, Loading } from '@/components/Bits';
import { useSession } from '@/components/Session';
import { api, asApiError } from '@/lib/api';
import { isThisWeek, plural, whenWords } from '@/lib/format';
import { softly } from '@/lib/motion';
import { safeNext } from '@/lib/next-path';
import { useResource } from '@/lib/useResource';

const FILTERS: { id: 'all' | NotificationKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'deadline', label: 'Deadlines' },
  { id: 'lawyer', label: 'Look-ups' },
  { id: 'score', label: 'Score' },
];

function Row({ item, onOpen }: { item: Notification; onOpen: (item: Notification) => void }) {
  return (
    <button className={`row nt-row${item.readAt ? '' : ' unread'}`} type="button" onClick={() => onOpen(item)} data-testid="notification">
      <span className="stack g4">
        <span className="row-t">{item.title}</span>
        {item.body ? <span className="row-s">{item.body}</span> : null}
      </span>
      <span className="nt-when">{whenWords(item.createdAt)}</span>
    </button>
  );
}

export default function NotificationsPage() {
  const session = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | NotificationKind>('all');
  const [extra, setExtra] = useState<Notification[]>([]);
  const [cursor, setCursor] = useState<string | null | undefined>(undefined);
  const [problem, setProblem] = useState<string | null>(null);
  const resource = useResource(() => api.notifications.list({ query: { limit: 30 } }), []);
  const { data, set } = resource;

  const all = useMemo(() => [...(data?.notifications ?? []), ...extra], [data, extra]);
  const shown = useMemo(() => (filter === 'all' ? all : all.filter((item) => item.kind === filter)), [all, filter]);
  const week = shown.filter((item) => isThisWeek(item.createdAt));
  const earlier = shown.filter((item) => !isThisWeek(item.createdAt));
  const unread = data?.unreadCount ?? 0;
  const nextCursor = cursor === undefined ? data?.nextCursor : cursor;

  const open = (item: Notification) => {
    const go = () => {
      const target = safeNext(item.link);
      if (target) router.push(target);
    };
    if (item.readAt) {
      go();
      return;
    }
    api.notifications.markRead({ params: { notificationId: item.id } }).then(
      () => {
        session.refreshUnread();
        go();
      },
      () => go(), // Being unable to mark it read shouldn't stop someone reading it.
    );
  };

  const markAll = async () => {
    setProblem(null);
    try {
      await api.notifications.markAllRead();
      if (data) {
        const now = new Date().toISOString();
        set({ ...data, unreadCount: 0, notifications: data.notifications.map((item) => ({ ...item, readAt: item.readAt ?? now })) });
      }
      setExtra((items) => items.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
      session.refreshUnread();
    } catch (error) {
      setProblem(asApiError(error).message);
    }
  };

  const loadMore = async () => {
    if (!nextCursor) return;
    setProblem(null);
    try {
      const page = await api.notifications.list({ query: { limit: 30, cursor: nextCursor } });
      setExtra((items) => [...items, ...page.notifications]);
      setCursor(page.nextCursor);
    } catch (error) {
      setProblem(asApiError(error).message);
    }
  };

  return (
    <main className="wrap mid">
      <section className="sec stack g32">
        <div className="stack g12">
          <h1 className="t-1">What&apos;s new</h1>
          <p className="lead" data-testid="unread-line">
            {!data ? '' : unread > 0 ? `${plural(unread, "thing you haven't read yet", "things you haven't read yet")}.` : "You're all caught up."}
          </p>
        </div>

        {resource.loading && !data ? (
          <Loading what="Getting what's new" />
        ) : resource.error ? (
          <ErrorState error={resource.error} onRetry={resource.reload} />
        ) : (
          <>
            <div className="nt-tools">
              <div className="filters" role="group" aria-label="Filter what's new">
                {FILTERS.map((item) => (
                  <button key={item.id} className={`fbtn${filter === item.id ? ' on' : ''}`} type="button" aria-pressed={filter === item.id} onClick={() => softly(() => setFilter(item.id))}>
                    {item.label}
                  </button>
                ))}
              </div>
              <button className="btn btn-line btn-sm" type="button" disabled={unread === 0} onClick={() => void markAll()}>
                Mark all as read
              </button>
            </div>
            {problem ? (
              <p className="formerror" role="alert">
                {problem}
              </p>
            ) : null}
            {shown.length === 0 ? (
              <Empty title="Nothing here yet">{filter === 'all' ? "We'll tell you here when your score moves, a date gets close or something changes." : 'Nothing of this kind so far.'}</Empty>
            ) : (
              <div className="stack g32">
                {week.length > 0 ? (
                  <div className="stack g12">
                    <h2 className="t-3">This week</h2>
                    <div className="rows">
                      {week.map((item) => (
                        <Row key={item.id} item={item} onOpen={open} />
                      ))}
                    </div>
                  </div>
                ) : null}
                {earlier.length > 0 ? (
                  <div className="stack g12">
                    <h2 className="t-3">Earlier</h2>
                    <div className="rows">
                      {earlier.map((item) => (
                        <Row key={item.id} item={item} onOpen={open} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            {nextCursor ? (
              <div>
                <button className="btn btn-line btn-sm" type="button" onClick={() => void loadMore()}>
                  Show earlier
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}

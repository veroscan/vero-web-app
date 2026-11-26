'use client';

import '@/app/styles/pages/notifications.css';
import type { Deadline, Notification, NotificationKind } from '@vero/shared';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type CSSProperties } from 'react';
import { Empty, ErrorState, Loading } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero, Plain, useWatchlist } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { leadOverdue } from '@/lib/deadlines';
import { isThisWeek, longDate, plural, shortDate, whenWords } from '@/lib/format';
import { softly } from '@/lib/motion';
import { safeNext } from '@/lib/next-path';
import { useResource } from '@/lib/useResource';

type Filter = 'all' | NotificationKind;

const KIND_WORDS: Readonly<Record<NotificationKind, { tab: string; one: string; row: string }>> = {
  deadline: { tab: 'Deadlines', one: 'Deadlines', row: 'Deadline' },
  score: { tab: 'Score changes', one: 'Score changes', row: 'Score change' },
  lawyer: { tab: 'Look-ups', one: 'Look-ups', row: 'Look-up' },
  team: { tab: 'Team', one: 'Your team', row: 'Team' },
  system: { tab: 'From Vero', one: 'From Vero', row: 'From Vero' },
};
const KIND_ORDER: NotificationKind[] = ['deadline', 'score', 'team', 'system'];
/** Look-ups by a lawyer were removed with that service (19 Nov 2026). Old ones aren't shown. */
const shownKind = (item: Notification) => item.kind !== 'lawyer';

/** The API writes dates as 2026-11-18. People read 18 November 2026. */
function readable(text: string): string {
  return text.replace(/\b(\d{4}-\d{2}-\d{2})\b/g, (match) => longDate(match)).replace(/\.\./g, '.');
}

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

function Row({ item, index, onOpen }: { item: Notification; index: number; onOpen: (item: Notification) => void }) {
  const fresh = !item.readAt;
  const when = whenWords(item.createdAt);
  return (
    <button className={`nt${fresh ? ' new' : ''}`} type="button" onClick={() => onOpen(item)} data-testid="notification" style={{ '--r': index } as CSSProperties}>
      <span className="tm">
        {when === 'Today' || when === 'Yesterday' ? `${when}, ${TIME.format(new Date(item.createdAt))}` : when}
        {fresh ? (
          <em>
            New<span className="sr-only">, not read yet</span>
          </em>
        ) : null}
      </span>
      <span className="tx">
        <span className="ty">{KIND_WORDS[item.kind].row}</span>
        <b>{readable(item.title)}</b>
        {item.body ? <span className="p">{readable(item.body)}</span> : null}
      </span>
      {item.link ? (
        <span className="btn btn-g go" aria-hidden="true">
          Open
          <Icon name="arrow" />
        </span>
      ) : (
        <span />
      )}
    </button>
  );
}

function CalendarArt() {
  return (
    <svg className="art3" viewBox="0 0 96 96" aria-hidden="true">
      <rect x="14" y="16" width="68" height="66" rx="12" fill="#FFF0F0" />
      <rect x="14" y="16" width="68" height="18" rx="9" fill="#FFD6D8" />
      <rect x="14" y="26" width="68" height="8" fill="#FFD6D8" />
      <rect x="30" y="8" width="5" height="16" rx="2.5" fill="#E5484D" />
      <rect x="61" y="8" width="5" height="16" rx="2.5" fill="#E5484D" />
      <g fill="#E5484D" opacity=".25">
        <rect x="24" y="44" width="10" height="8" rx="2" />
        <rect x="43" y="44" width="10" height="8" rx="2" />
        <rect x="24" y="60" width="10" height="8" rx="2" />
        <rect x="43" y="60" width="10" height="8" rx="2" />
      </g>
      <rect x="62" y="44" width="10" height="8" rx="2" fill="#fff" stroke="#E5484D" strokeWidth="2" />
      <rect className="hit" x="62" y="60" width="10" height="8" rx="2" fill="#E5484D" />
    </svg>
  );
}

function CalmArt() {
  return (
    <svg className="art3" viewBox="0 0 96 96" aria-hidden="true">
      <rect x="14" y="16" width="68" height="66" rx="12" fill="#E3F8F1" />
      <rect x="14" y="16" width="68" height="18" rx="9" fill="#C4EEDF" />
      <rect x="14" y="26" width="68" height="8" fill="#C4EEDF" />
      <rect x="30" y="8" width="5" height="16" rx="2.5" fill="#0E9F78" />
      <rect x="61" y="8" width="5" height="16" rx="2.5" fill="#0E9F78" />
      <path className="hit" d="M36 57l8 8 16-17" stroke="#0E9F78" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NeedsYou({ late }: { late: Deadline | null }) {
  if (!late) {
    return (
      <div className="mod next">
        <CalmArt />
        <div className="k">Needs you now</div>
        <h3>Nothing is overdue</h3>
        <p>Every date Vero knows about is still ahead. You&apos;ll hear here 30, 7 and 1 day before each one.</p>
        <TLink className="btn" href="/deadlines">
          See your deadlines
        </TLink>
      </div>
    );
  }
  const days = -late.daysUntil;
  return (
    <div className="mod next" data-testid="notifications-needs-you">
      <CalendarArt />
      <div className="k">Needs you now</div>
      <h3>{late.title}</h3>
      <p>
        {late.companyName} hasn&apos;t done this yet.{' '}
        {late.monitoring === 'auto' ? 'Once it is filed, Vero sees it on the register at the next check.' : 'Once it is done, mark it done on your deadlines.'}
      </p>
      <div className="due">
        <CountUp className="pixel" value={days} />
        <span>
          {days === 1 ? 'day' : 'days'} late
          <br />
          since {shortDate(late.dueOn)}
        </span>
      </div>
      {late.ruleKey ? (
        <TLink className="btn" href={`/issues/${late.companyId}/${encodeURIComponent(late.ruleKey)}`}>
          Open finding
        </TLink>
      ) : (
        <TLink className="btn" href="/deadlines">
          See it in deadlines
        </TLink>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const session = useSession();
  const router = useRouter();
  const watchlist = useWatchlist();
  const [filter, setFilter] = useState<Filter>('all');
  const [extra, setExtra] = useState<Notification[]>([]);
  const [cursor, setCursor] = useState<string | null | undefined>(undefined);
  const [problem, setProblem] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const toast = useToast();
  const resource = useResource(() => api.notifications.list({ query: { limit: 30 } }), []);
  const deadlines = useResource(() => api.deadlines.list({ query: {} }).catch(() => null), []);
  const { data, set } = resource;

  const all = useMemo(() => [...(data?.notifications ?? []), ...extra].filter(shownKind), [data, extra]);
  const shown = useMemo(() => (filter === 'all' ? all : all.filter((item) => item.kind === filter)), [all, filter]);
  const week = shown.filter((item) => isThisWeek(item.createdAt));
  const earlier = shown.filter((item) => !isThisWeek(item.createdAt));
  const unread = data?.unreadCount ?? 0;
  const nextCursor = cursor === undefined ? data?.nextCursor : cursor;
  const kinds = KIND_ORDER.filter((kind) => all.some((item) => item.kind === kind));
  const weekOnly = all.filter((item) => isThisWeek(item.createdAt));
  // A quiet week reads as an empty panel, so it widens to the updates loaded so far.
  const recent = weekOnly.length >= 3 ? weekOnly : all;
  const since = recent.length > 0 ? recent[recent.length - 1]?.createdAt : null;
  const late = leadOverdue(deadlines.data?.deadlines ?? []);

  const open = (item: Notification) => {
    const go = () => {
      const target = safeNext(item.link);
      if (target) router.push(target);
    };
    if (item.readAt) {
      go();
      return;
    }
    const now = new Date().toISOString();
    if (data) set({ ...data, unreadCount: Math.max(0, data.unreadCount - 1), notifications: data.notifications.map((entry) => (entry.id === item.id ? { ...entry, readAt: now } : entry)) });
    api.notifications.markRead({ params: { notificationId: item.id } }).then(
      () => {
        session.refreshUnread();
        go();
      },
      () => go(), // Being unable to mark it read shouldn't stop someone reading it.
    );
  };

  const markAll = async () => {
    if (marking) return;
    setMarking(true);
    setProblem(null);
    try {
      await api.notifications.markAllRead();
      const now = new Date().toISOString();
      if (data) set({ ...data, unreadCount: 0, notifications: data.notifications.map((item) => ({ ...item, readAt: item.readAt ?? now })) });
      setExtra((items) => items.map((item) => ({ ...item, readAt: item.readAt ?? now })));
      session.refreshUnread();
      toast('Everything is marked as read.');
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setMarking(false);
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setProblem(null);
    try {
      const page = await api.notifications.list({ query: { limit: 30, cursor: nextCursor } });
      setExtra((items) => [...items, ...page.notifications]);
      setCursor(page.nextCursor);
    } catch (error) {
      setProblem(asApiError(error).message);
    }
    setLoadingMore(false);
  };

  if (resource.loading && !data) {
    return (
      <Plain>
        <Loading what="Getting what's new" />
      </Plain>
    );
  }
  if (resource.error && !data) {
    return (
      <Plain>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </Plain>
    );
  }

  const watched = watchlist?.companies.length ?? 0;
  const ownName = session.root?.legalName ?? 'Your company';
  const group = (title: string, items: Notification[], offset: number) =>
    items.length > 0 ? (
      <div className="grp2">
        <div className="gh2">
          <h3>{title}</h3>
          <span>{plural(items.length, 'update', 'updates')}</span>
        </div>
        <div className="rows-in">
          {items.map((item, index) => (
            <Row key={item.id} item={item} index={index + offset} onOpen={open} />
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="pg-notifications">
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Updates" /> · <b><Scramble text="Registers → Your inbox" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text="What's new" />
            </h1>
            <div className="meta">
              <span data-testid="unread-line">{unread > 0 ? `${plural(unread, "thing you haven't read yet", "things you haven't read yet")}.` : "You're all caught up."}</span>
              <span>{watched > 0 ? `${ownName} and ${plural(watched, 'followed company', 'followed companies')}` : ownName}</span>
            </div>
          </div>
          <div className="acts">
            <TLink className="btn btn-g" href="/settings#notifications">
              Notification settings
            </TLink>
            <button className="btn btn-g" type="button" disabled={unread === 0 || marking} onClick={() => void markAll()}>
              <Icon name="check" />
              Mark all as read
            </button>
          </div>
        </div>

        <section className="r1">
          <div className="mod gl wk">
            <div className="mh">
              <h2>{recent === weekOnly ? 'Your week in one look' : 'Lately, in one look'}</h2>
              <span className="sub">{recent.length > 0 ? `${plural(recent.length, 'update', 'updates')}${since ? ` since ${shortDate(since)}` : ''}` : 'Nothing new yet'}</span>
            </div>
            {recent.length > 0 ? (
              <div className="dg">
                {KIND_ORDER.filter((kind) => recent.some((item) => item.kind === kind)).map((kind) => {
                  const items = recent.filter((item) => item.kind === kind);
                  const newest = items[0] as Notification;
                  const fresh = items.filter((item) => !item.readAt).length;
                  return (
                    <div className="dr" key={kind}>
                      <div>
                        <b>{KIND_WORDS[kind].one}</b>
                        <small>{fresh > 0 ? `${fresh} unread` : 'All read'}</small>
                      </div>
                      <div className="mv">
                        <CountUp className="pixel" value={items.length} />
                        <span className="same">{items.length === 1 ? 'update' : 'updates'}</span>
                      </div>
                      <p>{readable(newest.title)}.</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="quietweek">When a score moves, a date gets close or a register changes, it shows up here, one line per kind of update.</p>
            )}
          </div>
          <NeedsYou late={late} />
        </section>
      </Hero>

      <After>
        <Reveal as="section" className="mod r2">
          <div className="mh">
            <h2>All updates</h2>
            <span className="sub">Deadlines, score changes, your team and what Vero tells you</span>
          </div>
          {kinds.length > 1 ? (
            <div className="tabs" role="group" aria-label="Filter what's new">
              {(['all', ...kinds] as Filter[]).map((kind) => (
                <button key={kind} className={`tab${filter === kind ? ' on' : ''}`} type="button" aria-pressed={filter === kind} onClick={() => softly(() => setFilter(kind))}>
                  {kind === 'all' ? 'All' : KIND_WORDS[kind].tab} <span className="n2">{kind === 'all' ? all.length : all.filter((item) => item.kind === kind).length}</span>
                </button>
              ))}
            </div>
          ) : null}
          {problem ? (
            <p className="formerror probl" role="alert">
              {problem}
            </p>
          ) : null}
          {shown.length === 0 ? (
            <Empty title="Nothing here yet">{filter === 'all' ? "We'll tell you here when your score moves, a date gets close or something changes." : 'Nothing of this kind so far.'}</Empty>
          ) : (
            <div key={filter}>
              {group('This week', week, 0)}
              {group('Earlier', earlier, week.length)}
            </div>
          )}
          <div className="endl">
            <span className="muted">Updates go to the owners and admins of each company.</span>
            {nextCursor ? (
              <button className="btn btn-g" type="button" disabled={loadingMore} onClick={() => void loadMore()}>
                {loadingMore ? 'Getting earlier updates' : 'Show earlier'}
              </button>
            ) : null}
          </div>
        </Reveal>
      </After>
    </div>
  );
}

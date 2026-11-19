'use client';

/* The watchlist (the Watchlist board): the companies you follow against the urgent cap on the navy
   light, the card to follow another, then every company with its latest change. Followed companies
   are public data only and read only (owner's decision, 19 Nov 2026). */

import type { WatchlistItem } from '@vero/shared';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type CSSProperties } from 'react';
import { ErrorState, Loading } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { Change, coverageLevelWords, numberWords, PixelScore, scanWhen, scoreValue, URGENT_CAP } from '@/components/overview/parts';
import { useSession } from '@/components/Session';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { plural } from '@/lib/format';
import { countryLong } from '@/lib/records';
import { useResource } from '@/lib/useResource';
import '@/app/styles/pages/watchlist.css';

/** One row: a company you follow, or your own company at the top. */
interface Entry {
  id: string;
  name: string;
  sub: string;
  country: string;
  score: WatchlistItem['score'];
  value: number | null;
  before: number | null;
  after: number | null;
  level: string | null;
  levelTitle: string | null;
  lastScan: string | null;
  scanning: boolean;
  mine: boolean;
  href: string;
  change: WatchlistItem['lastChange'];
}

const pct = (value: number) => Math.max(0, Math.min(100, ((value - 40) / 60) * 100));

function shortName(name: string): string {
  return name.replace(/\s+(inc\.?|ltd\.?|llc|limited|plc)$/i, '');
}

function Bars({ entries }: { entries: Entry[] }) {
  const scored = entries.filter((entry) => entry.value !== null);
  const ordered = [...scored.filter((entry) => !entry.mine).sort((a, b) => (b.value ?? 0) - (a.value ?? 0)), ...scored.filter((entry) => entry.mine)];
  return (
    <div className="bars">
      <div className="capw" aria-hidden="true">
        <div className="capl" style={{ left: `${pct(URGENT_CAP)}%` }}>
          <span>Urgent cap, {URGENT_CAP}</span>
        </div>
      </div>
      {ordered.map((entry, index) => {
        const low = !entry.mine && (entry.value ?? 0) <= URGENT_CAP;
        return (
          <div key={entry.id} className={`br${entry.mine ? ' mine' : ''}${low ? ' low' : ''}`}>
            <div className="nm">
              {shortName(entry.name)}
              <small>{entry.mine ? 'Your company' : countryLong(entry.country)}</small>
            </div>
            <div className="tr">
              <i className="fl grow" style={{ width: `${pct(entry.value ?? 0)}%`, '--i': index } as CSSProperties} />
            </div>
            <span className="pixel">{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}

type Sort = 'score' | 'name' | 'change';

function Unfollow({ entry, onDone }: { entry: Entry; onDone: () => void }) {
  const toast = useToast();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!asking) {
    return (
      <button
        type="button"
        className="wl-act"
        onClick={(event) => {
          event.stopPropagation();
          setAsking(true);
        }}
        data-testid="unfollow"
      >
        Stop following
      </button>
    );
  }
  return (
    <span className="wl-ask" onClick={(event) => event.stopPropagation()}>
      <span>Its scans go too.</span>
      <button
        type="button"
        className="wl-act wl-yes"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void (async () => {
            try {
              await api.watchlist.remove({ params: { companyId: entry.id } });
              window.dispatchEvent(new Event('vero:watchlist'));
              toast(`You've stopped following ${entry.name}.`);
              onDone();
            } catch (error) {
              toast(asApiError(error).message);
              setBusy(false);
              setAsking(false);
            }
          })();
        }}
      >
        Stop
      </button>
      <button type="button" className="wl-act" disabled={busy} onClick={() => setAsking(false)}>
        Keep
      </button>
    </span>
  );
}

export default function WatchlistPage() {
  const session = useSession();
  const router = useRouter();
  const list = useResource(() => api.watchlist.list(), []);
  const [sort, setSort] = useState<Sort>('score');
  const data = list.data;
  const root = session.root;
  const overview = session.overview;

  const entries = useMemo<Entry[]>(() => {
    const followed: Entry[] = (data?.companies ?? []).map((item) => ({
      id: item.companyId,
      name: item.legalName,
      sub: numberWords(item.incorporationCountry, item.registrationNumber) ?? countryLong(item.incorporationCountry),
      country: item.incorporationCountry,
      score: item.score,
      value: scoreValue(item.score),
      before: item.lastChange?.scoreBefore ?? null,
      after: item.lastChange?.scoreAfter ?? null,
      level: coverageLevelWords(item.countryCoverage, item.incorporationCountry),
      levelTitle: item.countryCoverage.sentence,
      lastScan: item.lastScannedAt,
      scanning: item.scanInProgress,
      mine: false,
      href: `/watchlist/${item.companyId}`,
      change: item.lastChange,
    }));
    const mine: Entry[] =
      root && overview && session.hasResult
        ? [
            {
              id: root.id,
              name: root.legalName,
              sub: session.related.length > 0 ? `Your company, with ${plural(session.related.length, 'related company', 'related companies')}` : 'Your company',
              country: root.incorporationCountry,
              score: overview.score,
              value: scoreValue(overview.score),
              // In a group the score covers every company, but the change is the parent's own: not comparable.
              before: overview.scope === 'company' ? (overview.whatChanged?.scoreBefore ?? null) : null,
              after: overview.scope === 'company' ? (overview.whatChanged?.scoreAfter ?? null) : null,
              level: coverageLevelWords(overview.countryCoverage ?? root.countryCoverage, root.incorporationCountry),
              levelTitle: (overview.countryCoverage ?? root.countryCoverage)?.sentence ?? null,
              lastScan: overview.scannedAt,
              scanning: false,
              mine: true,
              href: '/',
              change: overview.whatChanged,
            },
          ]
        : [];
    const delta = (entry: Entry) => (entry.before !== null && entry.after !== null ? Math.abs(entry.after - entry.before) : -1);
    followed.sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : sort === 'change' ? delta(b) - delta(a) : (b.value ?? -1) - (a.value ?? -1)));
    return [...mine, ...followed];
  }, [data, root, overview, session.hasResult, session.related.length, sort]);

  const followed = entries.filter((entry) => !entry.mine);
  const scored = followed.filter((entry) => entry.value !== null);
  const average = scored.length > 0 ? Math.round(scored.reduce((sum, entry) => sum + (entry.value ?? 0), 0) / scored.length) : null;
  const underCap = scored.filter((entry) => (entry.value ?? 101) <= URGENT_CAP).length;
  const counted = (data?.companies ?? []).reduce((sum, item) => sum + (item.coverage?.counted ?? 0), 0);
  const total = (data?.companies ?? []).reduce((sum, item) => sum + (item.coverage?.total ?? 0), 0);
  const weekAgo = Date.now() - 7 * 86_400_000;
  const changedThisWeek = (data?.companies ?? []).filter((item) => item.lastChange && new Date(item.lastChange.at).getTime() >= weekAgo).length;
  const changes = entries
    .filter((entry) => entry.change)
    .sort((a, b) => new Date(b.change?.at ?? 0).getTime() - new Date(a.change?.at ?? 0).getTime())
    .slice(0, 5);
  const used = data?.used ?? 0;
  const limit = data?.limit ?? 0;
  const full = data !== undefined && used >= limit;

  return (
    <div className="pg-wl">
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Companies you follow" /> · <b><Scramble text="Public records only" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text="Watchlist" />
            </h1>
            <div className="meta">
              {data ? <span>{limit > 0 ? `${used} of ${limit} followed` : 'Following is part of a paid plan'}</span> : null}
              <span>Read only: nothing to upload or answer</span>
            </div>
          </div>
        </div>
        {list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : list.loading && !data ? (
          <Loading what="Getting your watchlist" />
        ) : (
          <section className="r1">
            <div className="mod gl pf">
              <div className="l">
                <h2>Your watchlist</h2>
                <div className="avg">
                  {average !== null ? <PixelScore score={{ kind: 'exact', value: average }} testId="watchlist-average" /> : <span className="pixel">--</span>}
                  <small>/ 100</small>
                </div>
                <div className="cap">{average !== null ? `Average score across the ${plural(scored.length, 'company', 'companies')} you follow` : 'The average shows once a company you follow has a score.'}</div>
                {changedThisWeek > 0 ? <span className="delta2">{plural(changedThisWeek, 'changed', 'changed')} this week</span> : null}
                <div className="facts">
                  <div>
                    <span>Companies followed</span>
                    <CountUp className="pixel" value={followed.length} />
                  </div>
                  <div>
                    <span>At or under the cap</span>
                    <CountUp className="pixel" value={underCap} />
                  </div>
                  <div>
                    <span>Checks covered</span>
                    <b>{total > 0 ? `${counted} of ${total}` : 'None yet'}</b>
                  </div>
                </div>
              </div>
              <div className="r">
                <h3>Scores against the urgent cap</h3>
                {entries.some((entry) => entry.value !== null) ? (
                  <>
                    <Bars entries={entries} />
                    <div className="axis" aria-hidden="true">
                      <span />
                      <div>
                        <span>40</span>
                        <span>60</span>
                        <span>80</span>
                        <span>100</span>
                      </div>
                      <span />
                    </div>
                  </>
                ) : null}
                {followed.length === 0 ? <p className="wl-none">Follow a company and its score sits here beside yours, against the cap of {URGENT_CAP} that any urgent gap holds a score at.</p> : null}
              </div>
            </div>
            <div className="mod next">
              <svg className="art" viewBox="0 0 130 120" aria-hidden="true">
                <g transform="rotate(-6 65 60)">
                  <rect x="22" y="16" width="64" height="84" rx="8" fill="#C9EAFB" />
                  <rect x="40" y="26" width="64" height="84" rx="8" fill="#fff" stroke="#0182FA" strokeWidth="2" />
                  <circle cx="72" cy="58" r="13" fill="none" stroke="#0182FA" strokeWidth="3" />
                  <path d="M81 67l10 10" stroke="#0182FA" strokeWidth="3" strokeLinecap="round" />
                </g>
              </svg>
              <div className="k">Add to your watchlist</div>
              <h3>Follow a company</h3>
              <p>Vero scans its public records now, keeps checking them, and shows here when something changes.</p>
              <div className="hint">Any country. Each company shows its coverage, full, registry or international, so you know how much was checked.</div>
              {limit > 0 ? (
                <div className="slots">
                  <div className="t">
                    <span>Watchlist places</span>
                    <span>
                      <b>{used}</b> of {limit} used
                    </span>
                  </div>
                  <div className="bl" style={{ gridTemplateColumns: `repeat(${Math.min(limit, 25)},1fr)` }}>
                    {Array.from({ length: Math.min(limit, 25) }, (_, index) => (
                      <i key={index} className={index < Math.round((used / limit) * Math.min(limit, 25)) ? 'on' : undefined} />
                    ))}
                  </div>
                </div>
              ) : null}
              {full ? (
                <TLink className="btn" href="/plan">
                  {limit > 0 ? 'Your plan is full: see the plans' : 'See the plans'}
                </TLink>
              ) : (
                <TLink className="btn" href="/scan?follow=1" data-testid="follow-company">
                  <Icon name="search" />
                  Find a company
                </TLink>
              )}
            </div>
          </section>
        )}
      </Hero>
      {data ? (
        <After>
          <Reveal as="section" className="mod r2" i={0}>
            <div className="mh">
              <h2>Companies</h2>
              <span className="sub">Your own company first, then everyone you follow</span>
              {followed.length > 1 ? (
                <div className="r">
                  <div className="seg" role="group" aria-label="Sort by">
                    {(['score', 'name', 'change'] as const).map((key) => (
                      <button key={key} type="button" className={sort === key ? 'on' : undefined} aria-pressed={sort === key} onClick={() => setSort(key)}>
                        {key === 'score' ? 'Score' : key === 'name' ? 'Name' : 'Change'}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <table className="wt vtable">
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Company</th>
                  <th className="opt">Coverage</th>
                  <th>Score</th>
                  <th>Last change</th>
                  <th className="opt">Last scan</th>
                  <th className="opt" style={{ width: 150 }} aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="rows-in">
                {entries.map((entry, index) => (
                  <tr key={entry.id} className="f" style={{ '--r': index } as CSSProperties} onClick={() => router.push(entry.href)} data-testid="watchlist-row">
                    <td className="co">
                      <b>
                        <TLink className="rowlink" href={entry.href} onClick={(event) => event.stopPropagation()}>
                          {entry.name}
                        </TLink>
                      </b>
                      <small>{entry.sub}</small>
                    </td>
                    <td className="src2 opt" title={entry.levelTitle ?? undefined}>
                      {entry.level ?? countryLong(entry.country)}
                    </td>
                    <td>{entry.score.kind === 'none' ? <span className="muted">{entry.scanning ? 'Scanning' : 'Not yet'}</span> : <PixelScore score={entry.score} className={`sc${(entry.value ?? 101) <= URGENT_CAP ? ' low' : ''}`} />}</td>
                    <td>{entry.change ? <Change before={entry.before} after={entry.after} /> : <span className="vchg no">None yet</span>}</td>
                    <td className="muted opt" style={{ whiteSpace: 'nowrap' }}>
                      {entry.scanning ? 'Scanning now' : entry.lastScan ? scanWhen(entry.lastScan) : 'Not yet'}
                    </td>
                    <td className="opt">{entry.mine ? <span className="muted">Yours</span> : <Unfollow entry={entry} onDone={list.reload} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {followed.length === 0 ? (
              <p className="vempty">
                <b>You don&apos;t follow any company yet</b>
                Follow a customer, a supplier or a company you might invest in. Vero reads its public records only.
              </p>
            ) : null}
          </Reveal>
          <section className="r3b">
            <Reveal className="mod" i={0}>
              <div className="mh">
                <h2>What changed lately</h2>
                <span className="sub">The newest change on each company</span>
              </div>
              {changes.length === 0 ? (
                <p className="vempty">Nothing has changed yet. Changes show here as Vero re-checks each company.</p>
              ) : (
                <div className="chl rows-in">
                  {changes.map((entry, index) => {
                    const change = entry.change;
                    if (!change) return null;
                    const delta = entry.before !== null && entry.after !== null ? entry.after - entry.before : null;
                    return (
                      <div className="ci" key={entry.id} style={{ '--r': index } as CSSProperties}>
                        <span className="dt">{scanWhen(change.at).split(',')[0]}</span>
                        <div>
                          <b>
                            {entry.name}
                            {delta !== null && delta !== 0 ? (
                              <>
                                {delta > 0 ? ' rose to ' : ' fell to '}
                                {entry.after}
                                <span className="mv" style={{ color: delta > 0 ? 'var(--good)' : 'var(--urgent)' }}>
                                  {delta > 0 ? '+' : '-'}
                                  {Math.abs(delta)}
                                </span>
                              </>
                            ) : null}
                          </b>
                          <p>{change.summary}</p>
                        </div>
                        <TLink href={entry.mine ? '/history' : `/history?company=${entry.id}`}>View scan</TLink>
                      </div>
                    );
                  })}
                </div>
              )}
            </Reveal>
            <Reveal className="mod" i={1}>
              <div className="mh">
                <h2>How following works</h2>
              </div>
              <div className="ar">
                <div className="arw">
                  <div>
                    <b>Public records only</b>
                    <small>Registers, sanctions lists and the website. Never documents.</small>
                  </div>
                </div>
                <div className="arw">
                  <div>
                    <b>Read only</b>
                    <small>Only the company&apos;s own team can add evidence or answer questions.</small>
                  </div>
                </div>
                <div className="arw">
                  <div>
                    <b>Coverage shown on each one</b>
                    <small>How much Vero can check depends on the country.</small>
                  </div>
                </div>
              </div>
              <div className="arn">Alerts for each company you follow aren&apos;t available yet. Changes show here and in What&apos;s new.</div>
            </Reveal>
          </section>
        </After>
      ) : null}
    </div>
  );
}

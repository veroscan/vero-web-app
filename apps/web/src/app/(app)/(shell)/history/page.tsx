'use client';

/* Scan history (the History board): the score now and over time on the navy light, a fresh scan
   card, then every finished scan with what it changed. Open a scan to see its detail. */

import type { CompanyHistoryItem } from '@vero/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ErrorState, Loading, SampleNote } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { historyPoints, ScoreChart, spanDays, withinMonths } from '@/components/overview/ScoreChart';
import { Change, PixelScore, RescanButton, scanWhen, scoreValue, URGENT_CAP, useRescan } from '@/components/overview/parts';
import { useSession } from '@/components/Session';
import { After, Hero, Plain } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api } from '@/lib/api';
import { plural, shortDate } from '@/lib/format';
import { useResource } from '@/lib/useResource';
import '@/app/styles/pages/history.css';

const TRIGGER_WORDS: Record<string, string> = {
  user: 'Manual',
  check_again: 'Checked again',
  monitoring: 'Weekly re-check',
  document: 'Document changed',
  review: 'Document reviewed',
  answers: 'Answers changed',
  missing_statement: "You said what's missing",
  seed: 'First scan',
  follow: 'Started following',
  source_recovered: 'A source came back',
};

function triggerWords(trigger: string): string {
  return TRIGGER_WORDS[trigger] ?? 'Scan';
}

type Filter = 'all' | 'moved' | 'weekly' | 'manual' | 'docs' | 'answers';
const FILTERS: { key: Filter; label: string; match: (row: Row) => boolean }[] = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'moved', label: 'Score changed', match: (row) => row.delta !== null && row.delta !== 0 },
  { key: 'weekly', label: 'Weekly re-checks', match: (row) => row.scan.trigger === 'monitoring' },
  { key: 'manual', label: 'Manual', match: (row) => ['user', 'check_again', 'seed', 'follow'].includes(row.scan.trigger) },
  { key: 'docs', label: 'Documents', match: (row) => ['document', 'review'].includes(row.scan.trigger) },
  { key: 'answers', label: 'Answers', match: (row) => ['answers', 'missing_statement'].includes(row.scan.trigger) },
];

interface Row {
  scan: CompanyHistoryItem;
  before: number | null;
  after: number | null;
  delta: number | null;
  first: boolean;
}

/** Newest first, each with the score of the scan before it. */
function rowsOf(scans: readonly CompanyHistoryItem[]): Row[] {
  return scans.map((scan, index) => {
    const older = scans[index + 1];
    const after = scan.score.kind === 'exact' ? scan.score.value : null;
    const before = older && older.score.kind === 'exact' ? older.score.value : null;
    return { scan, before, after, delta: before !== null && after !== null ? after - before : null, first: !older };
  });
}

function changeWords(row: Row): string {
  if (row.scan.change?.summary) return row.scan.change.summary;
  if (row.first) return 'The first result for this company.';
  return row.scan.kind === 'full' ? 'Every source asked again. Nothing changed.' : 'Scored again. Nothing changed.';
}

const RANGES = [
  { key: '6M', months: 6 },
  { key: '1Y', months: 12 },
  { key: 'All', months: null },
] as const;

function ScanDrawer({ row, companyName, readOnly, onClose }: { row: Row | null; companyName: string; readOnly: boolean; onClose: () => void }) {
  const open = row !== null;
  const [shown, setShown] = useState<Row | null>(row);
  const panel = useRef<HTMLElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (row) setShown(row);
  }, [row]);
  useEffect(() => {
    document.body.classList.toggle('open', open);
    if (!open) return;
    // Focus moves into the panel, stays there while it is open, and goes back to the row that opened it.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closer.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const stops = Array.from(panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('open');
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open, onClose]);
  const item = row ?? shown;
  const change = item?.scan.change ?? null;
  const counts = change
    ? [
        change.newIssues > 0 ? { word: plural(change.newIssues, 'new finding', 'new findings'), note: change.newUrgent > 0 ? `${change.newUrgent} urgent or important` : 'None urgent', tone: change.newUrgent > 0 ? 'var(--urgent)' : 'var(--warn)' } : null,
        change.resolvedIssues > 0 ? { word: plural(change.resolvedIssues, 'finding cleared', 'findings cleared'), note: 'No longer open', tone: 'var(--good)' } : null,
        change.statusChanged ? { word: 'Status changed', note: item?.scan.statusWord ?? '', tone: 'var(--ink)' } : null,
        change.sanctionsMatch ? { word: 'Sanctions list match', note: 'A person needs to look at this', tone: 'var(--urgent)' } : null,
        change.notChecked > 0 ? { word: plural(change.notChecked, 'source not reached', 'sources not reached'), note: "Doesn't count for or against the score", tone: 'var(--ink-3)' } : null,
      ].filter((value): value is { word: string; note: string; tone: string } => value !== null)
    : [];
  const title = !item ? '' : item.delta === null ? (item.first ? 'The first result' : 'Scored again') : item.delta > 0 ? `Score went up to ${item.after}` : item.delta < 0 ? `Score went down to ${item.after}` : `Score stayed at ${item.after}`;
  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden="true" />
      <aside ref={panel} className="drawer" role="dialog" aria-modal="true" aria-label="Scan detail" aria-hidden={!open} data-testid="scan-drawer" {...(open ? {} : { inert: true })}>
        <div className="dh">
          <span className="muted">{item ? triggerWords(item.scan.trigger) : ''}</span>
          <button ref={closer} className="ibtn" type="button" style={{ marginLeft: 'auto', border: 0 }} onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        {item ? (
          <div className="db">
            <div className="muted">
              {companyName}, {scanWhen(item.scan.finishedAt)}
            </div>
            <h3>{title}</h3>
            {item.before !== null && item.after !== null ? (
              <div className="hs-mv">
                <span className="pixel from">{item.before}</span>
                <Icon name="chev" />
                <span className="pixel to">{item.after}</span>
                <span className="t">{item.delta === 0 ? 'No change on this scan' : `${item.delta && item.delta > 0 ? '+' : '-'}${plural(Math.abs(item.delta ?? 0), 'point', 'points')} on this scan`}</span>
              </div>
            ) : (
              <div className="hs-mv">
                <PixelScore score={item.scan.score} className="to" />
                <span className="t">{item.scan.statusWord ?? 'Not scored yet'}</span>
              </div>
            )}
            <div className="lb2">What changed</div>
            <p>{changeWords(item)}</p>
            {counts.length > 0 ? (
              <div className="hs-ck">
                {counts.map((count) => (
                  <div key={count.word}>
                    <span>
                      {count.word}
                      <small>{count.note}</small>
                    </span>
                    {/^\d/.test(count.word) ? <em style={{ color: count.tone }}>{count.word.split(' ')[0]}</em> : null}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="lb2">What Vero checked</div>
            <div className="hs-ck">
              <div>
                <span>
                  {item.scan.kind === 'full' ? 'Every source asked again' : 'The same facts, scored again'}
                  <small>{item.scan.kind === 'full' ? 'Registers, lists and the website' : 'After something you changed'}</small>
                </span>
              </div>
              <div>
                <span>
                  Checks that counted
                  <small>The rest wait on documents or don&apos;t apply</small>
                </span>
                <em>{item.scan.coverage ? `${item.scan.coverage.counted} of ${item.scan.coverage.total}` : 'None'}</em>
              </div>
              <div>
                <span>
                  Scoring method
                  <small>
                    Rules for{' '}
                    {Object.entries(item.scan.rulePackVersions)
                      .map(([where, version]) => `${where} ${version}`)
                      .join(', ') || 'no country yet'}
                  </small>
                </span>
                <em>{item.scan.methodVersion}</em>
              </div>
            </div>
          </div>
        ) : null}
        <div className="df">
          <span className="muted">{item?.scan.coverage ? `${item.scan.coverage.counted} of ${plural(item.scan.coverage.total, 'check', 'checks')}` : ''}</span>
          {readOnly ? (
            <button type="button" className="btn btn-p" style={{ marginLeft: 'auto' }} onClick={onClose}>
              Done
            </button>
          ) : (
            <TLink className="btn btn-p" style={{ marginLeft: 'auto' }} href="/issues">
              Open findings
            </TLink>
          )}
        </div>
      </aside>
    </>
  );
}

function csvOf(rows: readonly Row[], companyName: string): string {
  const cell = (value: string | number | null) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [['Company', 'Finished', 'Trigger', 'Kind', 'Score', 'Change', 'What changed', 'Checks counted', 'Checks total', 'Method'].map(cell).join(',')];
  for (const row of rows) {
    const score = row.scan.score.kind === 'exact' ? String(row.scan.score.value) : row.scan.score.kind === 'approximate' ? `${row.scan.score.low}-${row.scan.score.high}` : '';
    lines.push([companyName, row.scan.finishedAt, triggerWords(row.scan.trigger), row.scan.kind, score, row.delta, changeWords(row), row.scan.coverage?.counted ?? null, row.scan.coverage?.total ?? null, row.scan.methodVersion].map(cell).join(','));
  }
  return lines.join('\r\n');
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The document-and-scan-line art from the History board. The line moves only while a scan runs. */
function ScanArt({ running }: { running: boolean }) {
  return (
    <svg className={`art2${running ? ' run' : ''}`} viewBox="0 0 120 108" aria-hidden="true">
      <rect x="40" y="6" width="64" height="84" rx="8" fill="#E3F4FD" />
      <rect x="26" y="14" width="64" height="84" rx="8" fill="#fff" stroke="#C9EAFB" strokeWidth="2" />
      <rect x="36" y="28" width="34" height="5" rx="2.5" fill="#9DDAF7" />
      <rect x="36" y="40" width="44" height="4" rx="2" fill="#E3EAF4" />
      <rect x="36" y="50" width="40" height="4" rx="2" fill="#E3EAF4" />
      <rect x="36" y="60" width="44" height="4" rx="2" fill="#E3EAF4" />
      <rect x="36" y="70" width="30" height="4" rx="2" fill="#E3EAF4" />
      <g className="rl">
        <rect x="20" y="20" width="76" height="2" rx="1" fill="#0182FA" />
        <rect x="20" y="22" width="76" height="10" fill="#0182FA" opacity=".08" />
      </g>
    </svg>
  );
}

const PAGE = 12;

function HistoryScreen() {
  const session = useSession();
  const router = useRouter();
  const search = useSearchParams();
  const companies = useMemo(() => (session.root ? [session.root, ...session.related] : []), [session.root, session.related]);
  const asked = search.get('company');
  const own = companies.find((company) => company.id === asked) ?? null;
  // A company you follow: its own history, read only.
  const followedId = asked && !own ? asked : null;
  const followed = useResource(() => (followedId ? api.companies.get({ params: { companyId: followedId } }) : Promise.resolve(null)), [followedId]);
  const picked = own ?? (followedId ? (followed.data ?? null) : (companies[0] ?? null));
  const readOnly = picked?.relationship === 'follow';
  const companyId = picked?.id ?? '';
  const history = useResource(() => (companyId ? api.companies.history({ params: { companyId } }) : Promise.resolve(null)), [companyId]);
  const overview = useResource(() => (companyId ? api.results.overview({ params: { companyId }, query: { scope: 'company' } }) : Promise.resolve(null)), [companyId]);
  const rescan = useRescan(companyId ? [companyId] : [], () => {
    history.reload();
    overview.reload();
    void session.refresh();
  });
  const [filter, setFilter] = useState<Filter>('all');
  const [count, setCount] = useState(PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const close = useCallback(() => setOpenId(null), []);
  const [range, setRange] = useState<(typeof RANGES)[number]['key']>('All');

  const scans = history.data?.scans ?? [];
  const rows = useMemo(() => rowsOf(scans), [scans]);
  const all = useMemo(() => historyPoints(scans), [scans]);
  const span = spanDays(all);
  const points = withinMonths(all, span > 92 ? (RANGES.find((item) => item.key === range)?.months ?? null) : null);
  const latest = scans[0] ?? null;
  const values = all.map((point) => point.value);
  const highest = all.length > 0 ? all.reduce((best, point) => (point.value >= best.value ? point : best)) : null;
  const lowest = all.length > 0 ? all.reduce((worst, point) => (point.value < worst.value ? point : worst)) : null;
  const first = all[0];
  const nowValue = latest ? scoreValue(latest.score) : null;
  const held = overview.data?.heldByUrgent ?? false;
  const filtered = rows.filter(FILTERS.find((item) => item.key === filter)?.match ?? (() => true));
  const shown = filtered.slice(0, count);
  const openRow = rows.find((row) => row.scan.scanId === openId) ?? null;
  const name = picked?.legalName ?? '';
  const short = name.replace(/\s+(inc\.?|ltd\.?|llc|limited|plc)$/i, '');

  if (followedId && followed.error) {
    return (
      <Plain>
        <ErrorState error={followed.error} onRetry={followed.reload} title={followed.error.status === 404 ? "That company isn't one of yours" : "We couldn't load this company"} />
      </Plain>
    );
  }
  if (!picked && !followedId && companies.length === 0) {
    // Nothing has been scanned yet, so there is no history to show.
    return (
      <Plain>
        <div className="state" data-testid="empty-state">
          <h1>No scans yet</h1>
          <p>Every scan of your company is kept here, with what it changed. It starts with your first one.</p>
          <TLink className="btn btn-p" href="/onboarding/company">
            <Icon name="scan" />
            Scan your company
          </TLink>
        </div>
      </Plain>
    );
  }
  if (!picked) {
    return (
      <Plain>
        <Loading what="Getting your scans" />
      </Plain>
    );
  }

  return (
    <div className="pg-hist">
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Every scan" /> · <b><Scramble text="Score over time" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text="Scan history" />
            </h1>
            <div className="meta">
              <span>{name}</span>
              {history.data ? <span>{plural(scans.length, 'scan', 'scans')}</span> : null}
              {first ? <span>Since {shortDate(first.at)}</span> : null}
            </div>
          </div>
          <div className="acts">
            {companies.length > 1 && !readOnly ? (
              <div className="seg hs-co" role="group" aria-label="Company">
                {companies.map((company) => (
                  <button key={company.id} type="button" className={company.id === companyId ? 'on' : undefined} aria-pressed={company.id === companyId} onClick={() => router.replace(company.id === companies[0]?.id ? '/history' : `/history?company=${company.id}`, { scroll: false })}>
                    {company.legalName.replace(/\s+(inc\.?|ltd\.?|llc|limited|plc)$/i, '')}
                  </button>
                ))}
              </div>
            ) : null}
            <button type="button" className="btn btn-g" disabled={rows.length === 0} onClick={() => download(`${short.replace(/\W+/g, '-').toLowerCase()}-scan-history.csv`, csvOf(rows, name))}>
              <Icon name="download" />
              Export history
            </button>
          </div>
        </div>
        {history.error ? (
          <ErrorState error={history.error} onRetry={history.reload} />
        ) : history.loading && !history.data ? (
          <Loading what="Getting your scans" />
        ) : (
          <section className="r1">
            <div className="mod gl hist">
              <div className="l">
                <h2>Score now</h2>
                <div className="now">
                  {latest ? <PixelScore score={latest.score} testId="history-score" /> : <span className="pixel">--</span>}
                  <small>/ 100</small>
                </div>
                {first && nowValue !== null && all.length > 1 ? (
                  <span className="delta2">
                    {nowValue - first.value === 0 ? 'No change' : `${nowValue - first.value > 0 ? '+' : '-'}${Math.abs(nowValue - first.value)}`} since {shortDate(first.at)}
                  </span>
                ) : null}
                <div className="facts">
                  {highest ? (
                    <div>
                      <span>Highest</span>
                      <span>
                        <CountUp className="pixel" value={highest.value} /> &nbsp;{shortDate(highest.at)}
                      </span>
                    </div>
                  ) : null}
                  {lowest && values.length > 1 ? (
                    <div>
                      <span>Lowest</span>
                      <span>
                        <CountUp className="pixel" value={lowest.value} /> &nbsp;{shortDate(lowest.at)}
                      </span>
                    </div>
                  ) : null}
                  {held ? (
                    <div>
                      <span>Cap until urgent gaps clear</span>
                      <span className="pixel">{URGENT_CAP}</span>
                    </div>
                  ) : (
                    <div>
                      <span>Checks counted now</span>
                      <b>{latest?.coverage ? `${latest.coverage.counted} of ${latest.coverage.total}` : 'None yet'}</b>
                    </div>
                  )}
                </div>
              </div>
              <div className="r">
                <div className="mh">
                  <h2>Score over time</h2>
                  {span > 92 ? (
                    <div className="r">
                      <div className="seg" role="group" aria-label="How far back">
                        {RANGES.map((item) => (
                          <button key={item.key} type="button" className={range === item.key ? 'on' : undefined} aria-pressed={range === item.key} onClick={() => setRange(item.key)}>
                            {item.key}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : first ? (
                    <span className="sub hs-since">Since {shortDate(first.at)}</span>
                  ) : null}
                </div>
                {points.length > 0 ? (
                  <ScoreChart points={points} cap={held ? URGENT_CAP : null} height={250} label={`${name}, score over time`} />
                ) : (
                  <p className="hs-nochart">
                    {all.length > 0
                      ? `No scan in this time. The last was on ${shortDate(all[all.length - 1]?.at ?? '')}.`
                      : scans.length > 0
                        ? `${scans.length === 1 ? 'The scan so far has' : `The ${scans.length} scans so far have`} no score, so there is no line yet. It starts with the first scan that has one.`
                        : 'The line starts after the first finished scan.'}
                  </p>
                )}
                <div className="chart-legend">
                  {points.length > 0 ? (
                    <span>
                      <i style={{ background: '#fff' }} />
                      {points.length === 1 ? 'One score so far. The line grows as it moves.' : 'Score when it moved'}
                    </span>
                  ) : null}
                  {held ? (
                    <span>
                      <i style={{ background: 'repeating-linear-gradient(90deg,#FF8A8E 0 4px,transparent 4px 7px)' }} />
                      Urgent cap, {URGENT_CAP}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="mod next">
              <ScanArt running={rescan.running} />
              <div className="k">{readOnly ? 'A company you follow' : 'Run a fresh scan'}</div>
              <h3>{readOnly ? `Vero keeps checking ${short}` : `Scan ${short} again now`}</h3>
              <p>{readOnly ? 'Its public records are checked again on their own, and every change lands in this list.' : 'Vero asks every register and list again, reads the website, and shows what moved. Usually a minute or two.'}</p>
              {rescan.error ? (
                <p className="hs-err" role="alert">
                  {rescan.error.message}
                </p>
              ) : null}
              <div className="meta2">
                <div>
                  <span>Last scan</span>
                  <b>{latest ? scanWhen(latest.finishedAt) : 'Not yet'}</b>
                </div>
                <div>
                  <span>Scans this year</span>
                  <b>{scans.filter((scan) => new Date(scan.finishedAt).getFullYear() === new Date().getFullYear()).length}</b>
                </div>
              </div>
              {readOnly ? (
                <TLink className="btn" href={`/watchlist/${companyId}`}>
                  Back to {short}
                </TLink>
              ) : (
                <RescanButton rescan={rescan} className="btn" />
              )}
            </div>
          </section>
        )}
      </Hero>
      {history.data ? (
        <After>
          {overview.data?.sampleData ? (
            <div style={{ marginBottom: 16 }}>
              <SampleNote />
            </div>
          ) : null}
          <Reveal as="section" className="mod r2" i={0}>
            <div className="mh">
              <h2>Past scans</h2>
              <span className="sub">Open a scan to see what Vero checked and what moved</span>
            </div>
            <div className="tabs" role="group" aria-label="Which scans">
              {FILTERS.map((item) => {
                const n = rows.filter(item.match).length;
                if (n === 0 && item.key !== 'all') return null;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={filter === item.key}
                    className={`tab${filter === item.key ? ' on' : ''}`}
                    onClick={() => {
                      setFilter(item.key);
                      setCount(PAGE);
                    }}
                  >
                    {item.label} <span className="n2">{n}</span>
                  </button>
                );
              })}
            </div>
            {shown.length === 0 ? (
              <p className="vempty">
                <b>No scans yet</b>
                {readOnly ? 'They show here as Vero checks this company.' : 'They show here as each one finishes. Use Scan again above to run one now.'}
              </p>
            ) : (
              <table className="scans vtable">
                <thead>
                  <tr>
                    <th style={{ width: 150 }}>Date</th>
                    <th style={{ width: 190 }}>Trigger</th>
                    <th style={{ width: 96 }}>Score</th>
                    <th style={{ width: 150 }}>Change</th>
                    <th>What changed</th>
                    <th aria-label="Open" />
                  </tr>
                </thead>
                <tbody className="rows-in" key={filter}>
                  {shown.map((row, index) => {
                    const when = scanWhen(row.scan.finishedAt);
                    const [day, time] = when.includes(', ') ? [when.slice(0, when.lastIndexOf(', ')), when.slice(when.lastIndexOf(', ') + 2)] : [when, ''];
                    return (
                      <tr key={row.scan.scanId} className="f" style={{ '--r': Math.min(index, 14) } as CSSProperties} onClick={() => setOpenId(row.scan.scanId)} data-testid="history-row">
                        <td className="dt">
                          <b>
                            <button type="button" className="rowlink hs-open" onClick={(event) => (event.stopPropagation(), setOpenId(row.scan.scanId))}>
                              {day}
                            </button>
                          </b>
                          <small>{time}</small>
                        </td>
                        <td className="trg">
                          {triggerWords(row.scan.trigger)}
                          <small>{row.scan.kind === 'full' ? 'Sources asked again' : 'Scored again'}</small>
                        </td>
                        <td className="scc">
                          {row.before !== null && row.after !== null && row.before !== row.after ? (
                            <span className="mv" aria-hidden="true">
                              <span className="sc">{row.before}</span>
                              <Icon name="chev" />
                            </span>
                          ) : null}
                          {row.scan.score.kind === 'none' ? <span className="muted">No score</span> : <span className="sc">{row.after ?? (row.scan.score.kind === 'approximate' ? `${row.scan.score.low}-${row.scan.score.high}` : '')}</span>}
                        </td>
                        <td className="chg">{row.first ? <span className="vchg no">First scan</span> : row.scan.score.kind === 'none' ? <span className="vchg no">Nothing to compare</span> : <Change before={row.before} after={row.after} />}</td>
                        <td className="wc">{changeWords(row)}</td>
                        <td className="go">
                          <Icon name="chev" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {filtered.length > 0 ? (
              <div className="vmore">
                <span className="muted">
                  Showing {shown.length} of {plural(filtered.length, 'scan', 'scans')}
                  {shown.length > 0 ? `, back to ${shortDate(shown[shown.length - 1]?.scan.finishedAt ?? '')}` : ''}.
                </span>
                {filtered.length > shown.length ? (
                  <button type="button" className="btn btn-g hs-earlier" onClick={() => setCount((value) => value + PAGE * 2)}>
                    Show earlier scans
                  </button>
                ) : null}
              </div>
            ) : null}
          </Reveal>
        </After>
      ) : null}
      <ScanDrawer row={openRow} companyName={name} readOnly={readOnly} onClose={close} />
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <Plain>
          <Loading what="Getting your scans" />
        </Plain>
      }
    >
      <HistoryScreen />
    </Suspense>
  );
}

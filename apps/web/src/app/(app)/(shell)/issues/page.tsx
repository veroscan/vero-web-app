'use client';

import '@/app/styles/pages/findings.css';
import type { IssueSummary, ProjectionResponse } from '@vero/shared';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ErrorState, Loading, PlanLink, SampleNote, SourcesDownNote } from '@/components/Bits';
import { FindingDrawer } from '@/components/findings/FindingDrawer';
import { useScanAgain } from '@/components/findings/useScanAgain';
import { Icon } from '@/components/Icon';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { plural, shortDate, whenWords } from '@/lib/format';
import { FINDING_COLOUR, FINDING_WORDS, findingSource, findingStatus, isOpenIssue, issueKey, issuePath, type FindingStatus } from '@/lib/issues';
import { softly } from '@/lib/motion';
import { useResource } from '@/lib/useResource';

type Tab = 'open' | 'urgent' | 'attention' | 'cleared' | 'unseen';
type Source = 'all' | 'reg' | 'doc';

/** The urgent cap: an open urgent finding holds the overall score at this (owner's rule, 6 Nov 2026). */
const URGENT_CAP = 74;
const PAGE = 40;

const TABS: { id: Tab; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'attention', label: 'Needs attention' },
  { id: 'cleared', label: 'Cleared' },
  { id: 'unseen', label: 'Not seen yet' },
];

function inTab(status: FindingStatus, tab: Tab): boolean {
  if (tab === 'open') return status === 'urgent' || status === 'attention';
  return status === tab;
}

/** Urgent first, then what moves the score most, keeping the API's order otherwise. */
function rank(a: IssueSummary, b: IssueSummary): number {
  const sa = findingStatus(a) === 'urgent' ? 0 : 1;
  const sb = findingStatus(b) === 'urgent' ? 0 : 1;
  return sa - sb || (b.points ?? 0) - (a.points ?? 0);
}

function timeOf(at: string): string {
  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(at));
  return `${whenWords(at)}, ${time}`;
}

function NextArt() {
  return (
    <svg className="art" viewBox="0 0 130 120" aria-hidden="true">
      <g transform="rotate(8 65 60)">
        <rect className="a1" x="40" y="10" width="64" height="84" rx="8" />
        <rect className="a2" x="28" y="20" width="64" height="84" rx="8" />
        <rect className="a3" x="16" y="30" width="64" height="84" rx="8" strokeWidth="2" strokeDasharray="6 5" />
        <text className="aq" x="48" y="80" textAnchor="middle">
          ?
        </text>
      </g>
    </svg>
  );
}

export default function IssuesPage() {
  const session = useSession();
  const toast = useToast();
  const { root, scope, overview, related } = session;
  const several = related.length > 0;
  const resource = useResource(async () => {
    if (!root) throw new Error('No company');
    return api.results.issues({ params: { companyId: root.id }, query: { scope, outcome: 'all' } });
  }, [root?.id, scope]);

  const [tab, setTab] = useState<Tab>('open');
  const [source, setSource] = useState<Source>('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [drawer, setDrawer] = useState<IssueSummary | null>(null);
  const [allFixed, setAllFixed] = useState<ProjectionResponse | null>(null);
  const [urgentFixed, setUrgentFixed] = useState<ProjectionResponse | null>(null);

  const all = useMemo(() => resource.data?.issues ?? [], [resource.data]);
  const open = useMemo(() => all.filter(isOpenIssue).sort(rank), [all]);
  const urgent = useMemo(() => open.filter((issue) => issue.severity === 'critical'), [open]);
  const counts = useMemo(() => {
    const result: Record<Tab, number> = { open: 0, urgent: 0, attention: 0, cleared: 0, unseen: 0 };
    for (const issue of all) {
      const status = findingStatus(issue);
      for (const item of TABS) if (inTab(status, item.id)) result[item.id] += 1;
    }
    return result;
  }, [all]);

  const score = resource.data?.score ?? overview?.score ?? { kind: 'none' as const };
  const exact = score.kind === 'exact';
  const openKey = open.map(issueKey).join(',');
  const urgentKey = urgent.map(issueKey).join(',');

  // What clearing everything open does, and what clearing the urgent ones does, both from the API.
  useEffect(() => {
    setAllFixed(null);
    setUrgentFixed(null);
    if (!root || !exact || open.length === 0) return;
    let live = true;
    const ask = (list: IssueSummary[]) =>
      api.results.projection({
        params: { companyId: root.id },
        query: { scope },
        body: scope === 'group' ? { fixes: list.map((issue) => ({ companyId: issue.companyId, ruleKey: issue.ruleKey })) } : { ruleKeys: list.map((issue) => issue.ruleKey) },
      });
    ask(open.slice(0, 300)).then(
      (value) => live && setAllFixed(value),
      () => undefined, // The panel says what it can without the figure.
    );
    if (urgent.length > 0)
      ask(urgent).then(
        (value) => live && setUrgentFixed(value),
        () => undefined,
      );
    return () => {
      live = false;
    };
  }, [root?.id, scope, exact, openKey, urgentKey]);

  const companyIds = useMemo(() => (root ? [root, ...related].filter((company) => company.relationship !== 'follow').map((company) => company.id) : []), [root, related]);
  const rescan = useScanAgain(companyIds, () => {
    resource.reload();
    session.refresh().catch(() => undefined);
    toast('Scan finished. Findings are up to date.');
  });

  const shown = useMemo(() => {
    const words = query.trim().toLowerCase();
    return all
      .filter((issue) => inTab(findingStatus(issue), tab))
      .filter((issue) => source === 'all' || findingSource(issue).kind === source || (source === 'reg' && findingSource(issue).kind === 'web'))
      .filter((issue) => !words || `${issue.headline} ${issue.title ?? ''} ${issue.layerName} ${issue.companyName} ${findingSource(issue).label}`.toLowerCase().includes(words))
      .sort(rank);
  }, [all, tab, source, query]);

  const groups = useMemo(() => {
    const visible = shown.slice(0, limit);
    if (tab === 'cleared' || tab === 'unseen') return [{ key: tab, name: tab === 'cleared' ? 'Cleared' : 'Not seen yet', layer: null as number | null, items: visible }];
    const map = new Map<string, { key: string; name: string; layer: number | null; items: IssueSummary[] }>();
    for (const issue of visible) {
      const group = map.get(issue.layerName) ?? { key: issue.layerName, name: issue.layerName, layer: issue.layer, items: [] };
      group.items.push(issue);
      map.set(issue.layerName, group);
    }
    return [...map.values()];
  }, [shown, limit, tab]);

  const close = useCallback(() => setDrawer(null), []);

  if (resource.loading && !resource.data) {
    return (
      <div style={{ display: 'contents' }}>
        <Loading what="Getting what Vero found" />
      </div>
    );
  }
  if (resource.error) {
    return (
      <div style={{ display: 'contents' }}>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </div>
    );
  }
  const data = resource.data;
  if (!data) return null;

  const current = exact ? score.value : null;
  const projected = allFixed?.projected ?? null;
  const gain = current !== null && projected !== null ? Math.max(0, projected - current) : null;
  const coverage = overview?.coverage ?? null;
  const early = overview?.statusWord === 'Early read';
  const blocks = 16;
  const filled = coverage && coverage.total > 0 ? Math.round((coverage.counted / coverage.total) * blocks) : 0;
  const marked = coverage && coverage.total > 0 && open.length > 0 ? Math.min(filled, Math.max(1, Math.round((open.length / coverage.total) * blocks))) : 0;
  const unseenUploads = all.filter((issue) => issue.outcome === 'verify' && issue.actionType === 'upload').length;
  const legend = open.slice(0, 3);
  const next = overview?.nextAction ?? null;
  const nextIssue = next ? all.find((issue) => issue.companyId === next.companyId && issue.ruleKey === next.ruleKey) : undefined;
  const nextMove = urgentFixed && nextIssue && findingStatus(nextIssue) === 'urgent' ? urgentFixed : null;
  const pct = (value: number) => `${Math.max(0, Math.min(100, value))}%`;
  const shortName = (name: string) => name.replace(/\s+(inc\.?|ltd\.?|llc|limited|plc)$/i, '');

  return (
    <div className="pg-findings" style={{ display: 'contents' }}>
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="What Vero found" /> · <b><Scramble text="Missing / Proof / Cleared" delay={160} /></b>
            </div>
            <h1 className="disp">
              <Words text="Findings" />
            </h1>
            <div className="meta">
              {root ? <span>{several ? `${root.legalName} and ${plural(related.length, 'linked company', 'linked companies')}` : root.legalName}</span> : null}
              {coverage && coverage.total > 0 ? (
                <span data-testid="score-basis">
                  {coverage.counted} of {plural(coverage.total, 'check', 'checks')}
                </span>
              ) : null}
              {overview?.scannedAt ? <span>Last scan {timeOf(overview.scannedAt).replace(/^Today/, 'today').replace(/^Yesterday/, 'yesterday')}</span> : null}
            </div>
          </div>
          <div className="acts">
            {companyIds.length > 0 ? (
              <button className="btn btn-g" type="button" onClick={rescan.start} disabled={rescan.running} aria-live="polite">
                <Icon name="scan" />
                {rescan.running ? (rescan.total > 0 ? `Scanning, ${rescan.checked} of ${rescan.total}` : 'Starting the scan') : 'Scan again'}
              </button>
            ) : null}
            <TLink className="btn btn-g" href="/report">
              <Icon name="share" />
              Export
            </TLink>
          </div>
        </div>
        {rescan.problem ? (
          <p className="note warn" role="alert" style={{ marginBottom: 20 }}>
            {rescan.problem}
          </p>
        ) : null}

        <section className="r1">
          <div className="mod health sum">
            <div className="l">
              <div className="mh" style={{ padding: 0 }}>
                <h2>Open findings</h2>
              </div>
              <div className="big">
                <CountUp className="pixel" value={open.length + data.lockedCount} />
                <small data-testid="issue-count">{open.length + data.lockedCount === 0 ? 'nothing open' : 'open now'}</small>
              </div>
              <div className="line">
                {open.length === 0 ? (
                  <span className="g">Nothing needs fixing</span>
                ) : (
                  <>
                    {urgent.length > 0 ? <span className="u">{urgent.length} urgent</span> : null}
                    {urgent.length > 0 && open.length > urgent.length ? ', ' : null}
                    {open.length > urgent.length ? <span className="w">{open.length - urgent.length} need attention</span> : null}
                  </>
                )}
              </div>
              <div className="line2">
                {counts.cleared > 0 ? `${plural(counts.cleared, 'more check', 'more checks')} cleared and counted.` : 'Nothing cleared yet.'}
                {data.lockedCount > 0 ? ` ${plural(data.lockedCount, 'more finding', 'more findings')} on a paid plan.` : ''}
              </div>
              <div className="cov">
                <div className="t">
                  <span>Coverage</span>
                  {coverage && coverage.total > 0 ? (
                    <span>
                      Based on <b>{coverage.counted}</b> of {coverage.total} checks
                    </span>
                  ) : (
                    <span>Not scored yet</span>
                  )}
                </div>
                <div className="blocks" aria-hidden="true">
                  {Array.from({ length: blocks }, (_, index) => (
                    <i key={index} className={index >= filled ? 'o' : index >= filled - marked ? 'x' : undefined} />
                  ))}
                </div>
                {early ? <span className="early">Early read: less than half of what applies is checked so far.</span> : null}
              </div>
            </div>
            <div className="r">
              <h2>Points available</h2>
              {current === null ? (
                <div className="pts">
                  <p className="plan">
                    What clearing each finding is worth is part of a paid plan. <PlanLink />
                  </p>
                </div>
              ) : open.length === 0 ? (
                <div className="pts">
                  <p>
                    The score is <b data-testid="issues-score">{current}</b>. Nothing open is holding it down.
                  </p>
                </div>
              ) : (
                <div className="pts">
                  <span className="pixel">{gain === null ? '+' : <>+<CountUp value={gain} /></>}</span>
                  <p>
                    Clear {open.length === 1 ? 'it' : open.length === 2 ? 'both' : `all ${open.length}`} and the score goes from <b data-testid="issues-score">{current}</b>
                    {projected !== null ? (
                      <>
                        {' '}
                        to <b>{projected}</b>
                      </>
                    ) : null}
                    .{' '}
                    {urgent.length > 0 ? (
                      <span data-testid="points-held">
                        The urgent {urgent.length === 1 ? 'one comes' : 'ones come'} first: until {urgent.length === 1 ? 'it is' : 'they are'} cleared, the score stays capped at {URGENT_CAP}.
                      </span>
                    ) : null}
                  </p>
                </div>
              )}
              {current !== null ? (
                <>
                  <div className="track" role="img" aria-label={`Score ${current} of 100${projected !== null && open.length > 0 ? `, up to ${projected} once everything open is cleared` : ''}`}>
                    <i className="now grow" style={{ width: pct(current) }} />
                    {projected !== null && projected > current ? <i className="add grow" style={{ left: pct(current), width: pct(projected - current), '--i': 3 } as CSSProperties} /> : null}
                    {urgent.length > 0 ? (
                      <span className="cap" style={{ left: pct(URGENT_CAP) }}>
                        <span>Urgent cap {URGENT_CAP}</span>
                      </span>
                    ) : null}
                  </div>
                  <div className="ticks" aria-hidden="true">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                </>
              ) : null}
              {legend.length > 0 ? (
                <div className="leg">
                  {legend.map((issue, index) => {
                    const status = findingStatus(issue);
                    return (
                      <button key={issueKey(issue)} type="button" onClick={() => setDrawer(issue)}>
                        <i className={status === 'urgent' ? 'u' : 'w'} style={{ opacity: 1 - index * 0.2 }} />
                        {issue.points && issue.points > 0 ? <span className="pixel">+{issue.points}</span> : <span className="pixel none">{status === 'urgent' ? 'Cap' : 'Held'}</span>}
                        <span>
                          {issue.title ?? issue.headline}
                          <small>{status === 'urgent' ? 'lifts the urgent cap' : issue.layerName}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          {next ? (
            <div className="mod next" data-testid="next-action">
              <NextArt />
              <div className="k">Most important</div>
              <h3>{next.title}</h3>
              <p>{next.why}</p>
              {nextMove && nextMove.projected > nextMove.current ? (
                <div className="imp">
                  <CountUp className="pixel from" value={nextMove.current} />
                  <Icon name="chev" />
                  <CountUp className="pixel to" value={nextMove.projected} ms={1600} />
                  <span className="lab" data-testid="points-held">
                    with {urgent.length === 1 ? 'the urgent finding' : `all ${urgent.length} urgent findings`} cleared,
                    <br />
                    lifting the cap
                  </span>
                </div>
              ) : next.points !== null && next.points > 0 && current !== null ? (
                <div className="imp">
                  <CountUp className="pixel from" value={current} />
                  <Icon name="chev" />
                  <CountUp className="pixel to" value={Math.min(100, current + next.points)} ms={1600} />
                  <span className="lab">
                    adds {plural(next.points, 'point', 'points')}
                  </span>
                </div>
              ) : null}
              <TLink className="btn" href={issuePath(next)}>
                Open finding
              </TLink>
            </div>
          ) : (
            <div className="mod next">
              <div className="k">Most important</div>
              <h3>Nothing needs fixing right now</h3>
              <p>Vero keeps checking the registries and your documents, and tells you when something changes.</p>
              <TLink className="btn" href="/deadlines">
                See what&apos;s coming up
              </TLink>
            </div>
          )}
        </section>
      </Hero>

      <After>
        {overview?.sampleData || overview?.sourcesDown.length ? (
          <div className="notes">
            {overview.sampleData ? <SampleNote /> : null}
            <SourcesDownNote sources={overview.sourcesDown} />
          </div>
        ) : null}
        <Reveal as="section" className="mod" i={1}>
          <div className="mh">
            <h2>Everything Vero found</h2>
            <span className="sub">{overview?.countryCoverage?.sentence ?? 'Across official registries and the documents you shared'}</span>
          </div>
          <div className="tabs" role="tablist" aria-label="Filter findings">
            {TABS.map((item) => (
              <button
                key={item.id}
                className={`tab${tab === item.id ? ' on' : ''}`}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                data-testid={item.id === 'unseen' ? 'group-to-check' : undefined}
                onClick={() =>
                  softly(() => {
                    setTab(item.id);
                    setLimit(PAGE);
                  })
                }
              >
                {item.label} <span className="n2">{counts[item.id]}</span>
              </button>
            ))}
          </div>
          <div className="fr">
            <label className="fs">
              <Icon name="search" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search findings, sources or areas" autoComplete="off" aria-label="Search findings" />
            </label>
            <div className="seg" role="group" aria-label="Filter by source">
              {(
                [
                  ['all', 'All sources'],
                  ['reg', 'Registries'],
                  ['doc', 'Your documents'],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" className={source === id ? 'on' : undefined} aria-pressed={source === id} onClick={() => setSource(id)}>
                  {label}
                </button>
              ))}
            </div>
            <span className="muted sort">{tab === 'cleared' ? 'Checks in order, counted in the score' : tab === 'unseen' ? "These don't count for or against the score" : 'Grouped by area, highest impact first'}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th style={{ width: '42%' }}>Finding</th>
                <th className="hs">Source</th>
                <th>Status</th>
                <th className="hm">Impact</th>
                <th className="hs">Updated</th>
                <th className="hm" aria-label="Open" />
              </tr>
            </thead>
            {groups.map((group) => {
              const area = group.layer !== null ? overview?.areas.find((item) => item.layer === group.layer) : undefined;
              const openHere = group.items.filter(isOpenIssue).length;
              return (
                <tbody key={group.key} className="rows-in">
                  <tr className="gh" data-testid={`group-${group.key}`}>
                    <td colSpan={6}>
                      <div className="gw">
                        <b>{group.name}</b>
                        <small>{group.layer === null ? plural(group.items.length, 'check', 'checks') : `${openHere} open`}</small>
                        {area && area.score !== null ? (
                          <TLink href={`/areas/${area.layer}`}>
                            Area score <span className="pixel">{area.score}</span>
                          </TLink>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  {group.items.map((issue, index) => {
                    const status = findingStatus(issue);
                    const src = findingSource(issue);
                    return (
                      <tr
                        key={issueKey(issue)}
                        className="f"
                        style={{ '--r': Math.min(index, 12) } as CSSProperties}
                        tabIndex={0}
                        data-testid="issue-row"
                        onClick={() => setDrawer(issue)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setDrawer(issue);
                          }
                        }}
                        aria-label={`${status === 'cleared' ? (issue.title ?? issue.headline) : issue.headline}, ${FINDING_WORDS[status]}`}
                      >
                        <td>
                          <div className="ft2">
                            <b>{status === 'cleared' ? (issue.title ?? issue.headline) : issue.headline}</b>
                            <small>{[issue.layerName, several ? shortName(issue.companyName) : null, issue.declaredMissing ? "You told us you don't have this" : null].filter(Boolean).join(' · ')}</small>
                          </div>
                        </td>
                        <td className="src2 hs">{src.label}</td>
                        <td>
                          <span className="st2" style={{ color: FINDING_COLOUR[status] }}>
                            {FINDING_WORDS[status]}
                          </span>
                        </td>
                        <td className="hm">{issue.points && issue.points > 0 && isOpenIssue(issue) ? <span className="gain">+{issue.points}</span> : <span className="muted">-</span>}</td>
                        <td className="muted hs" style={{ whiteSpace: 'nowrap' }}>
                          {issue.dueOn ? `Due ${shortDate(issue.dueOn)}` : overview?.scannedAt ? whenWords(overview.scannedAt) : ''}
                        </td>
                        <td className="chevc hm">
                          <Icon name="chev" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}
            {shown.length === 0 ? (
              <tbody>
                <tr className="emptyrow" data-testid="empty-state">
                  <td colSpan={6}>{all.length === 0 ? 'Nothing found yet. Findings show here after the first scan.' : query || source !== 'all' ? 'No findings match that search.' : tab === 'open' || tab === 'urgent' || tab === 'attention' ? 'Nothing open here. Vero keeps checking.' : 'Nothing here yet.'}</td>
                </tr>
              </tbody>
            ) : null}
          </table>
          {shown.length > limit ? (
            <div className="more">
              <button className="btn btn-g btn-sm" type="button" onClick={() => setLimit((value) => value + PAGE * 3)}>
                Show {Math.min(PAGE * 3, shown.length - limit)} more of {shown.length}
              </button>
            </div>
          ) : null}
          <div className="foot muted">
            <span data-testid={data.lockedCount > 0 ? 'locked-count' : undefined}>
              Empty slots never lower the score.
              {unseenUploads > 0 ? ` ${plural(unseenUploads, 'check is', 'checks are')} waiting on documents you haven't shared yet.` : ''}
              {data.lockedCount > 0 ? ` ${plural(data.lockedCount, 'more finding is', 'more findings are')} on a paid plan.` : ''}
            </span>
            {data.lockedCount > 0 ? <PlanLink /> : null}
            <TLink className="btn btn-g" href="/documents">
              Add documents
            </TLink>
          </div>
        </Reveal>
      </After>
      <FindingDrawer issue={drawer} onClose={close} />
    </div>
  );
}

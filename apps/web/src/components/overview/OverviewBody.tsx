'use client';

/* The Overview board (product-design-v2 Overview): the navy hero with the glass legal-health panel,
   the score over time and the one white "Do this first" card; then findings, areas, registries and
   what's coming up on the light working area. Used for your own company and for one you follow. */

import type { Company, CompanyRecordsResponse, IssueSummary, OverviewResponse } from '@vero/shared';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Empty, PlanLink, SampleNote, SourcesDownNote } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { Reveal, Scramble, Words } from '@/components/Motion';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api } from '@/lib/api';
import { entitlementsOf } from '@/lib/entitlements';
import { agoWords, monthName, plural, POINTS_HELD_WORDS, shortDate } from '@/lib/format';
import { FINDING_COLOUR, FINDING_WORDS, findingSource, findingStatus, issueKey, issuePath, pointsLabel } from '@/lib/issues';
import { useResource } from '@/lib/useResource';
import { scoreSentence, sourceStatus, statusTone, type Tone } from '@/lib/words';
import { historyPoints, ScoreChart, spanDays, withinMonths } from './ScoreChart';
import { coverageLevelWords, CoverageLine, NextCard, numberWords, PixelScore, RescanButton, scanWhen, URGENT_CAP, useFixProjection, useRescan } from './parts';
import '@/app/styles/pages/overview.css';

export const TONE_COLOUR: Record<Tone, string> = { good: 'var(--good)', watch: 'var(--warn)', risk: 'var(--urgent)', none: 'var(--ink-3)' };
/** On the navy hero the status words need the lighter versions the boards use there. */
const HERO_TONE: Record<Tone, string> = { good: '#5EEAD4', watch: '#FCD34D', risk: '#FF8A8E', none: 'rgba(255,255,255,.6)' };

function shortName(name: string): string {
  return name.replace(/\s+(inc\.?|ltd\.?|llc|limited|plc|corp\.?)$/i, '');
}

function trendWords(trend: NonNullable<OverviewResponse['trend']>): string {
  if (trend.delta === 0) return `No change since ${monthName(trend.since)}`;
  return `${trend.delta > 0 ? '+' : '-'}${Math.abs(trend.delta)} since ${monthName(trend.since)}`;
}

function verdict(overview: OverviewResponse): string {
  if (overview.heldByUrgent) return `${scoreSentence(overview.statusWord)} An urgent gap holds it at ${URGENT_CAP} or below.`;
  return scoreSentence(overview.statusWord);
}

const RANGES = [
  { key: '3M', months: 3 },
  { key: '6M', months: 6 },
  { key: '1Y', months: 12 },
  { key: 'All', months: null },
] as const;

/** Every company's scans, so the chart can show the one the person picks. */
function useHistories(companies: readonly Company[]) {
  const ids = companies.map((company) => company.id).join(',');
  return useResource(async () => {
    const lists = await Promise.all(companies.map((company) => api.companies.history({ params: { companyId: company.id } }).catch(() => ({ companyId: company.id, scans: [] }))));
    return Object.fromEntries(lists.map((list) => [list.companyId, historyPoints(list.scans)]));
  }, [ids]);
}

function HealthPanel({ overview, companies, level, levelTitle, projected }: { overview: OverviewResponse; companies: readonly Company[]; level: string | null; levelTitle?: string; projected: number | null }) {
  const histories = useHistories(companies);
  const group = companies.length > 1;
  // In a group the score covers every company, but each company has its own history: the chart
  // shows one company at a time, starting with the one scoring lowest, and says which it is.
  const lowest = useMemo(() => {
    const data = histories.data;
    if (!data) return companies[0]?.id ?? '';
    return [...companies].sort((a, b) => (data[a.id]?.at(-1)?.value ?? 101) - (data[b.id]?.at(-1)?.value ?? 101))[0]?.id ?? '';
  }, [histories.data, companies]);
  const [picked, setPicked] = useState<string | null>(null);
  const shown = picked ?? lowest;
  const all = histories.data?.[shown] ?? [];
  const span = spanDays(all);
  const [range, setRange] = useState<(typeof RANGES)[number]['key']>('All');
  const months = RANGES.find((item) => item.key === range)?.months ?? null;
  const points = withinMonths(all, span > 92 ? months : null);
  const shownCompany = companies.find((company) => company.id === shown);
  const tone = statusTone(overview.statusWord);
  const open = overview.areas.reduce((sum, area) => sum + (area.openCount ?? 0), 0);
  const capped = overview.heldByUrgent && (!group || shown === overview.nextAction?.companyId);

  return (
    <div className="mod health">
      <div className="l">
        <div className="mh" style={{ padding: 0 }}>
          <h2>{group ? 'Group legal health' : 'Legal health'}</h2>
          {overview.statusWord ? (
            <span className="st2" style={{ color: HERO_TONE[tone], marginLeft: 'auto', marginRight: 24 }}>
              {overview.statusWord}
            </span>
          ) : null}
        </div>
        <div className="big">
          <PixelScore score={overview.score} testId="home-score" />
          <small>{overview.score.kind === 'approximate' ? '/ 100, roughly' : '/ 100'}</small>
        </div>
        {overview.trend ? <span className="delta2">{trendWords(overview.trend)}</span> : null}
        <div className="verdict">{verdict(overview)}</div>
        <CoverageLine coverage={overview.coverage} level={level} {...(levelTitle ? { levelTitle } : {})} open={open} />
      </div>
      <div className="ov-chart">
        <div className="mh">
          <h2 style={{ fontSize: 14, color: 'rgba(255,255,255,.75)' }}>{group && shownCompany ? `${shortName(shownCompany.legalName)} over time` : 'Score over time'}</h2>
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
          ) : all[0] ? (
            <span className="sub ov-since">Since {shortDate(all[0].at)}</span>
          ) : null}
        </div>
        {histories.loading && !histories.data ? (
          <div className="ov-chartwait" aria-busy="true" />
        ) : points.length > 0 ? (
          <ScoreChart points={points} cap={capped ? URGENT_CAP : null} projected={group ? null : projected} label={`${shownCompany?.legalName ?? 'Score'} over time`} />
        ) : (
          <p className="ov-nochart">The line starts after the first finished scan.</p>
        )}
        <div className="chart-legend">
          <span>
            <i style={{ background: '#fff' }} />
            Score
          </span>
          {capped ? (
            <span>
              <i style={{ background: 'repeating-linear-gradient(90deg,#FF8A8E 0 4px,transparent 4px 7px)' }} />
              Urgent cap, {URGENT_CAP}
            </span>
          ) : null}
          {!group && projected !== null ? (
            <span>
              <i style={{ background: 'repeating-linear-gradient(90deg,#5EEAD4 0 4px,transparent 4px 7px)' }} />
              Once cleared, about {projected}
            </span>
          ) : null}
          {group ? (
            <span className="ov-pick" role="group" aria-label="Company on the chart">
              {companies.map((company) => (
                <button key={company.id} type="button" className={company.id === shown ? 'on' : undefined} aria-pressed={company.id === shown} onClick={() => setPicked(company.id)}>
                  {shortName(company.legalName)}
                </button>
              ))}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type Tab = 'open' | 'urgent' | 'attention' | 'cleared';

function Findings({ overview, companyId, group, readOnly }: { overview: OverviewResponse; companyId: string; group: boolean; readOnly: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('open');
  const scope = overview.scope;
  const open = useResource(() => api.results.issues({ params: { companyId }, query: { scope, outcome: 'open' } }), [companyId, scope]);
  const passed = useResource(() => (tab === 'cleared' ? api.results.issues({ params: { companyId }, query: { scope, outcome: 'passed' } }) : Promise.resolve(null)), [companyId, scope, tab === 'cleared']);
  const issues = open.data?.issues ?? [];
  const urgent = issues.filter((issue) => issue.severity === 'critical');
  const attention = issues.filter((issue) => issue.severity !== 'critical');
  const clearedCount = open.data?.passedCount ?? null;
  const rows: IssueSummary[] = tab === 'open' ? issues : tab === 'urgent' ? urgent : tab === 'attention' ? attention : (passed.data?.issues ?? []);
  const shown = rows.slice(0, 8);
  const tabs: { key: Tab; label: string; n: number | null }[] = [
    { key: 'open', label: 'Open', n: issues.length },
    { key: 'urgent', label: 'Urgent', n: urgent.length },
    { key: 'attention', label: 'Needs attention', n: attention.length },
    { key: 'cleared', label: 'Cleared', n: clearedCount },
  ];
  const waiting = (open.loading && !open.data) || (tab === 'cleared' && passed.loading && !passed.data);

  return (
    <Reveal as="section" className="mod r2" i={0}>
      <div className="mh">
        <h2>Findings</h2>
        <span className="sub">What Vero found on the registers, your website and your documents</span>
        {readOnly ? null : (
          <div className="r">
            <TLink className="btn btn-g" style={{ height: 34, fontSize: 13 }} href="/issues">
              All findings
            </TLink>
          </div>
        )}
      </div>
      <div className="tabs" role="tablist">
        {tabs.map((item) => (
          <button key={item.key} type="button" role="tab" aria-selected={tab === item.key} className={`tab${tab === item.key ? ' on' : ''}`} onClick={() => setTab(item.key)}>
            {item.label} {item.n !== null ? <span className="n2">{item.n}</span> : null}
          </button>
        ))}
      </div>
      {waiting ? (
        <p className="vempty">Getting the findings</p>
      ) : open.error ? (
        <p className="vempty">
          <b>We couldn&apos;t load the findings.</b>
          <button type="button" className="link" onClick={open.reload}>
            Try again
          </button>
        </p>
      ) : shown.length === 0 ? (
        <p className="vempty">
          <b>{tab === 'cleared' ? 'Nothing cleared yet' : 'Nothing open here'}</b>
          {tab === 'cleared' ? 'Checks that pass show here.' : 'Vero keeps checking, and new findings show here.'}
        </p>
      ) : (
        <table className="vtable">
          <thead>
            <tr>
              <th style={{ width: '44%' }}>Finding</th>
              <th className="opt">Source</th>
              <th>Status</th>
              <th className="opt">Impact</th>
              <th className="opt" aria-label="Open" />
            </tr>
          </thead>
          <tbody className="rows-in" key={tab}>
            {shown.map((issue, index) => {
              const status = findingStatus(issue);
              const points = pointsLabel(issue);
              return (
                <tr key={issueKey(issue)} className="f" style={{ '--r': index } as CSSProperties} onClick={() => router.push(issuePath(issue))} data-testid="home-finding">
                  <td>
                    <div className="ft2">
                      <b>
                        <TLink className="rowlink" href={issuePath(issue)} onClick={(event) => event.stopPropagation()}>
                          {status === 'cleared' ? (issue.title ?? issue.headline) : issue.headline}
                        </TLink>
                      </b>
                      <small>
                        {issue.layerName}
                        {group ? `, ${issue.companyName}` : ''}
                      </small>
                    </div>
                  </td>
                  <td className="src2 opt">{findingSource(issue).label}</td>
                  <td>
                    <span className="st2" style={{ color: FINDING_COLOUR[status] }}>
                      {FINDING_WORDS[status]}
                    </span>
                  </td>
                  <td className="opt">{points ? <span className="gain">{points.replace(/ points?$/, '')}</span> : <span className="muted">{issue.pointsHeldByUrgent ? 'Held' : 'None'}</span>}</td>
                  <td className="opt" style={{ width: 40, color: 'var(--ink-4)' }}>
                    <Icon name="chev" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {rows.length > shown.length ? (
        <div className="vmore">
          <span className="muted">
            Showing {shown.length} of {rows.length}.
          </span>
          {readOnly ? null : (
            <TLink className="link" href="/issues">
              See them all
            </TLink>
          )}
        </div>
      ) : null}
    </Reveal>
  );
}

function Areas({ overview, areaHref }: { overview: OverviewResponse; areaHref: (layer: number) => string }) {
  const router = useRouter();
  // Lowest score first, as in the design. Areas with no score go last.
  const areas = [...overview.areas].sort((a, b) => (a.score ?? 101) - (b.score ?? 101));
  return (
    <Reveal as="section" className="mod ov-areas" i={1}>
      <div className="mh">
        <h2>Where you stand</h2>
        <span className="sub">Six areas, lowest first</span>
      </div>
      <table className="vtable">
        <thead>
          <tr>
            <th style={{ width: '38%' }}>Area</th>
            <th>Status</th>
            <th>Score</th>
            <th className="opt" style={{ width: '22%' }} aria-label="Score bar" />
            <th className="opt">Open</th>
            <th className="opt" aria-label="Open" />
          </tr>
        </thead>
        <tbody className="rows-in">
          {areas.map((area, index) => {
            const tone = statusTone(area.statusWord);
            return (
              <tr key={area.layer} className="f" style={{ '--r': index } as CSSProperties} onClick={() => router.push(areaHref(area.layer))} data-testid="area-row">
                <td>
                  <div className="ft2">
                    <b>
                      <TLink className="rowlink" href={areaHref(area.layer)} onClick={(event) => event.stopPropagation()}>
                        {area.name}
                      </TLink>
                    </b>
                    <small>{area.locked ? 'Area scores are part of a paid plan' : area.topIssue ? area.topIssue.headline : area.description}</small>
                  </div>
                </td>
                <td>
                  <span className="st2" style={{ color: area.locked ? 'var(--ink-3)' : TONE_COLOUR[tone] }}>
                    {area.locked ? 'Paid plan' : (area.statusWord ?? 'Not scored')}
                  </span>
                </td>
                <td>{area.score !== null ? <span className="ov-sc">{area.score}</span> : <span className="muted">-</span>}</td>
                <td className="opt">
                  <span className="ov-bar" aria-hidden="true">
                    {area.score !== null ? <i className={`grow ${tone}`} style={{ width: `${area.score}%`, '--i': index } as CSSProperties} /> : null}
                  </span>
                </td>
                <td className="muted opt">{area.openCount ?? '-'}</td>
                <td className="opt" style={{ width: 40, color: 'var(--ink-4)' }}>
                  <Icon name="chev" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Reveal>
  );
}

const ORDER: Record<Tone, number> = { risk: 0, watch: 1, none: 2, good: 3 };

function Registries({ companies, href }: { companies: readonly Company[]; href: string }) {
  const ids = companies.map((company) => company.id).join(',');
  const records = useResource(() => Promise.all(companies.map((company) => api.records.get({ params: { companyId: company.id } }).catch(() => null))), [ids]);
  const rows = (records.data ?? [])
    .filter((item): item is CompanyRecordsResponse => item !== null)
    .flatMap((item) => item.sources.map((source) => ({ source, company: item.legalName, status: sourceStatus(source) })))
    .sort((a, b) => ORDER[a.status.tone] - ORDER[b.status.tone]);
  const shown = rows.slice(0, 6);
  return (
    <Reveal className="mod" i={0}>
      <div className="mh">
        <h2>Registries</h2>
        <span className="sub">Asked on every scan</span>
      </div>
      {records.loading && !records.data ? (
        <p className="vempty">Getting the registries</p>
      ) : shown.length === 0 ? (
        <p className="vempty">No registry has been asked yet.</p>
      ) : (
        <table className="rgt vtable">
          <thead>
            <tr>
              <th>Registry</th>
              <th className="opt">Last checked</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody className="rows-in">
            {shown.map((row, index) => (
              <tr key={`${row.company}-${row.source.connectorId}`} style={{ '--r': index } as CSSProperties}>
                <td>
                  <b>{row.source.title}</b>
                  <small className="rc">{row.company}</small>
                </td>
                <td className="muted opt">{row.source.lastTriedAt ? agoWords(row.source.lastTriedAt).replace(/^on /, '') : 'Not yet'}</td>
                <td style={{ color: TONE_COLOUR[row.status.tone] }}>{row.status.word}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="vmore">
        <span className="muted">{rows.length > shown.length ? `${shown.length} of ${plural(rows.length, 'source', 'sources')}` : 'Sample data is marked on each record'}</span>
        <TLink className="link" href={href}>
          Registry records
        </TLink>
      </div>
    </Reveal>
  );
}

function daysUntil(dueOn: string, now: Date = new Date()): number {
  const due = new Date(`${dueOn}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

function ComingUp({ overview, readOnly }: { overview: OverviewResponse; readOnly: boolean }) {
  const deadlines = overview.topDeadlines;
  const next = deadlines.find((deadline) => deadline.state !== 'overdue' && deadline.state !== 'done');
  const overdue = deadlines.filter((deadline) => deadline.state === 'overdue').length;
  return (
    <Reveal className="mod" i={1}>
      <div className="mh">
        <h2>Coming up</h2>
        {readOnly ? null : (
          <div className="r">
            <TLink className="link" href="/deadlines" style={{ fontSize: 13 }}>
              All deadlines
            </TLink>
          </div>
        )}
      </div>
      <div className="cu">
        {deadlines.length === 0 ? (
          <Empty title="No dates yet">They show here as soon as Vero can work them out.</Empty>
        ) : (
          <>
            <div className="big">
              {next ? (
                <>
                  <span className="pixel">{Math.max(0, daysUntil(next.dueOn))}</span>
                  <div>
                    <b>days until {next.title.charAt(0).toLowerCase() + next.title.slice(1)}</b>
                    <small>
                      Due {shortDate(next.dueOn)}, {next.companyName}
                    </small>
                  </div>
                </>
              ) : (
                <>
                  <span className="pixel" style={{ color: 'var(--urgent)' }}>
                    {overdue}
                  </span>
                  <div>
                    <b>{overdue === 1 ? 'date has passed' : 'dates have passed'}</b>
                    <small>Each one says what to file, and where.</small>
                  </div>
                </>
              )}
            </div>
            {deadlines.map((deadline) => {
              const inner = (
                <>
                  <span className="dt">{deadline.state === 'overdue' ? 'Now' : shortDate(deadline.dueOn)}</span>
                  <div>
                    <b>{deadline.title}</b>
                    <small style={deadline.state === 'overdue' ? { color: 'var(--urgent)' } : undefined}>{deadline.state === 'overdue' ? `Overdue since ${shortDate(deadline.dueOn)}, ${deadline.companyName}` : deadline.companyName}</small>
                  </div>
                </>
              );
              return readOnly ? (
                <div className="cr" key={deadline.id} data-testid="deadline-row">
                  {inner}
                </div>
              ) : (
                <TLink className="cr" href="/deadlines" key={deadline.id} data-testid="deadline-row">
                  {inner}
                </TLink>
              );
            })}
          </>
        )}
      </div>
    </Reveal>
  );
}

export interface OverviewBodyProps {
  company: Company;
  related: readonly Company[];
  overview: OverviewResponse;
  /** A company you follow: public data only, nothing to upload or answer. */
  readOnly?: boolean;
  /** Called after a fresh scan finishes. */
  onScanned: () => void;
  crumb?: ReactNode;
  areaHref?: (layer: number) => string;
}

export function OverviewBody({ company, related, overview, readOnly = false, onScanned, crumb, areaHref = (layer) => `/areas/${layer}` }: OverviewBodyProps) {
  const companies = useMemo(() => [company, ...related], [company, related]);
  const group = companies.length > 1;
  const level = coverageLevelWords(overview.countryCoverage ?? company.countryCoverage, company.incorporationCountry);
  const levelTitle = (overview.countryCoverage ?? company.countryCoverage)?.sentence;
  const rescan = useRescan(
    companies.map((item) => item.id),
    onScanned,
  );

  // What the next fix does to the score, and, under the urgent cap, what clearing every urgent gap does.
  const action = overview.nextAction;
  const projection = useFixProjection(company.id, overview.scope, action ? { companyId: action.companyId, ruleKey: action.ruleKey } : null, overview.heldByUrgent, overview.score.kind === 'exact');
  const projected = projection && projection.to > projection.from ? projection.to : null;
  const plan = entitlementsOf(overview.plan);

  return (
    <div className="pg-ov">
      <Hero {...(crumb ? { crumb } : {})}>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text={readOnly ? 'A company you follow' : 'Legal health'} /> · <b><Scramble text="Scan / Score / Fix" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text={company.legalName} />
            </h1>
            <div className="meta">
              {numberWords(company.incorporationCountry, company.registrationNumber) ? <span>{numberWords(company.incorporationCountry, company.registrationNumber)}</span> : null}
              {group ? <span>With {plural(related.length, 'related company', 'related companies')}</span> : null}
              {overview.scannedAt ? <span>Last scan {scanWhen(overview.scannedAt).replace(/^(Today|Yesterday)/, (word) => word.toLowerCase())}</span> : null}
              {level ? <span title={levelTitle}>{level}</span> : null}
            </div>
          </div>
          <div className="acts">
            {readOnly ? null : <RescanButton rescan={rescan} />}
            {readOnly ? null : (
              <TLink className="btn btn-g" href="/badge">
                <Icon name="share" />
                Share report
              </TLink>
            )}
          </div>
        </div>
        {rescan.error ? (
          <p className="ov-heronote" role="alert">
            {rescan.error.message}
          </p>
        ) : null}
        <section className="r1">
          <HealthPanel overview={overview} companies={companies} level={level} {...(levelTitle ? { levelTitle } : {})} projected={projected} />
          {action ? (
            <NextCard
              title={action.title}
              body={action.why}
              href={issuePath(action)}
              projection={projection}
              testId="next-action"
              note={
                overview.score.kind !== 'exact' ? (
                  <>
                    How much this fix is worth is part of a paid plan. <PlanLink />
                  </>
                ) : action.points === 0 && overview.heldByUrgent && !projection ? (
                  <span data-testid="points-held">{POINTS_HELD_WORDS}</span>
                ) : null
              }
            />
          ) : (
            <NextCard
              title="Nothing needs fixing right now"
              body="Vero keeps checking. Dates and changes show here and in What's new."
              href="/deadlines"
              action="See what's coming up"
              testId="next-action"
            />
          )}
        </section>
      </Hero>
      <After>
        {overview.sampleData || overview.sourcesDown.length > 0 ? (
          <div className="ov-notes">
            {overview.sampleData ? <SampleNote /> : null}
            <SourcesDownNote sources={overview.sourcesDown} />
          </div>
        ) : null}
        {overview.whatChanged?.meaningful ? (
          <p className="ov-new">
            <b>Since you last looked:</b> {overview.whatChanged.summary}{' '}
            <TLink className="link" href={readOnly ? `/history?company=${company.id}` : '/history'}>
              Scan history
            </TLink>
          </p>
        ) : null}
        <Findings overview={overview} companyId={company.id} group={group} readOnly={readOnly} />
        <Areas overview={overview} areaHref={areaHref} />
        <section className="r3b">
          <Registries companies={companies} href={readOnly ? `/company/${company.id}` : '/company'} />
          <ComingUp overview={overview} readOnly={readOnly} />
        </section>
        <div className="ov-foot">
          {plan.fullReport && !readOnly ? (
            <TLink className="link" href="/report" data-testid="home-report">
              See the full report, ready to print
            </TLink>
          ) : null}
          <p className="fineprint">{overview.notLegalAdvice}</p>
        </div>
      </After>
    </div>
  );
}

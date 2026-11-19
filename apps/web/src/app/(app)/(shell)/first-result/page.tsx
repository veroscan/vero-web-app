'use client';

import '@/app/styles/pages/scan.css';
import type { IssueDetail, IssueSummary } from '@vero/shared';
import { useRouter } from 'next/navigation';
import { useEffect, type CSSProperties } from 'react';
import { ErrorState, Loading, PlanLink, SampleNote, SourcesDownNote } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { CountUp, Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api } from '@/lib/api';
import { coverageWords, plural, shortDate, whenWords } from '@/lib/format';
import { issuePath } from '@/lib/issues';
import { peekNext } from '@/lib/next-path';
import { useResource } from '@/lib/useResource';
import { registerFor, scoreSentence, statusTone, type Tone } from '@/lib/words';

const LEVEL = { full: 'Full coverage', registry: 'Registry coverage', international: 'International coverage' } as const;

function severityTone(severity: IssueSummary['severity']): Tone {
  if (severity === 'critical') return 'risk';
  if (severity === 'high') return 'watch';
  return 'none';
}

function possessive(name: string): string {
  const short = name.replace(/\s+(inc|inc\.|ltd|limited|llc|plc|llp|corp|corporation)\.?$/i, '');
  return short.endsWith('s') ? `${short}'` : `${short}'s`;
}

interface Found {
  top: IssueDetail[];
  rest: IssueSummary[];
  total: number;
  passed: IssueSummary[];
  passedCount: number | null;
}

export default function FirstResultPage() {
  const session = useSession();
  const router = useRouter();
  const { overview, root, scope, hasResult } = session;
  const found = useResource<Found>(async () => {
    if (!root) return { top: [], rest: [], total: 0, passed: [], passedCount: null };
    const [open, passed] = await Promise.all([
      api.results.issues({ params: { companyId: root.id }, query: { scope, outcome: 'open' } }),
      api.results.issues({ params: { companyId: root.id }, query: { scope, outcome: 'passed' } }),
    ]);
    // The rows need the plain explanation, which only the full issue carries.
    const top = await Promise.all(open.issues.slice(0, 3).map((issue) => api.results.issue({ params: { companyId: issue.companyId, ruleKey: issue.ruleKey } })));
    return { top, rest: open.issues.slice(3, 6), total: open.total, passed: passed.issues, passedCount: passed.passedCount };
  }, [root?.id, scope]);

  useEffect(() => {
    if (!hasResult) router.replace(root ? '/onboarding/scanning' : '/onboarding/company');
  }, [hasResult, root, router]);

  if (!overview || !root || !hasResult) return null;
  const { score, coverage, nextAction } = overview;
  const level = overview.countryCoverage?.level;
  const register = registerFor(root.incorporationCountry);
  const counted = coverage?.counted ?? 0;
  const totalChecks = coverage?.total ?? 0;
  const value = score.kind === 'exact' ? score.value : score.kind === 'approximate' ? Math.round((score.low + score.high) / 2) : 0;
  const homeHref = peekNext() ?? '/';
  const issues = found.data?.top ?? [];
  const gains = issues.reduce((sum, issue) => sum + (issue.points ?? 0), 0);

  return (
    <div className="pg-scan">
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Step 4 of 4" /> · <b><Scramble text="First result" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text={`${possessive(root.legalName)} first result`} />
            </h1>
            <div className="meta">
              {overview.scannedAt ? <span>Scanned {whenWords(overview.scannedAt).toLowerCase() === 'today' ? 'today' : `on ${shortDate(overview.scannedAt)}`}</span> : null}
              {root.registrationNumber ? (
                <span>
                  {register.numberLabel} {root.registrationNumber}
                </span>
              ) : null}
              {coverageWords(coverage) ? <span>{coverageWords(coverage)}</span> : null}
              {level ? <span title={overview.countryCoverage?.sentence}>{LEVEL[level]}</span> : null}
            </div>
          </div>
          <div className="acts">
            <TLink className="btn btn-g" href={homeHref}>
              Go to overview
            </TLink>
          </div>
        </div>
        {overview.sampleData ? <SampleNote /> : null}

        <section className="r1">
          <div className="mod health">
            <div className="l">
              <div className="mh" style={{ padding: 0 }}>
                <h2>Legal health</h2>
              </div>
              <div className="big" role="img" aria-label={score.kind === 'exact' ? `${score.value} out of 100` : score.kind === 'approximate' ? `${score.low} to ${score.high} out of 100` : 'Not scored yet'} data-testid="first-score">
                {score.kind === 'exact' ? (
                  <CountUp className="pixel" value={score.value} />
                ) : score.kind === 'approximate' ? (
                  <span className="pixel rng">
                    <CountUp value={score.low} />-<CountUp value={score.high} />
                  </span>
                ) : (
                  <span className="dash">-</span>
                )}
                <small>/ 100</small>
              </div>
              {overview.heldByUrgent ? <span className="capn">Capped at 74 by an urgent gap</span> : null}
              {overview.statusWord === 'Early read' ? <span className="early">Early read</span> : null}
              <div className="verdict">{scoreSentence(overview.statusWord)}</div>
              <div className="cov">
                <div className="t">
                  <span>{level ? `${LEVEL[level]}, ${register.label}` : register.label}</span>
                  <span>
                    <b>{counted}</b> of {plural(totalChecks, 'check', 'checks')}
                  </span>
                </div>
                {totalChecks > 0 ? (
                  <div className="blocks" style={{ '--n': Math.min(totalChecks, 40) } as CSSProperties} aria-hidden="true">
                    {Array.from({ length: Math.min(totalChecks, 40) }, (_, at) => (
                      <i key={at} className={at < Math.round((counted / totalChecks) * Math.min(totalChecks, 40)) ? '' : 'o'} style={{ '--i': at } as CSSProperties} />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="areas">
              <div className="mh" style={{ padding: '4px 0 8px' }}>
                <h2 style={{ fontSize: 14, color: 'var(--ink-2)' }}>By area</h2>
              </div>
              {overview.areas.map((area, at) => {
                const tone = statusTone(area.statusWord);
                return (
                  <div className="ar" key={area.layer}>
                    <b>{area.name}</b>
                    {area.score === null ? (
                      <span className="na">{area.locked ? 'On a bigger plan' : 'Nothing to score yet'}</span>
                    ) : (
                      <>
                        <span className="tr">
                          <i className={`grow ${tone === 'risk' ? 'risk' : tone === 'watch' ? 'watch' : ''}`} style={{ width: `${area.score}%`, '--i': at } as CSSProperties} />
                        </span>
                        <span className={`v ${tone === 'risk' ? 'risk' : tone === 'watch' ? 'watch' : ''}`}>
                          <CountUp value={area.score} />
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
              <div className="note2">
                {coverageWords(coverage) ?? 'Nothing is scored yet.'} Documents you haven&apos;t shared yet never lower the score.
              </div>
            </div>
          </div>

          <div className="mod next">
            <svg className="art" viewBox="0 0 130 120" aria-hidden="true">
              <g transform="rotate(8 65 60)">
                <rect x="40" y="10" width="64" height="84" rx="8" fill="#E3F4FD" />
                <rect x="28" y="20" width="64" height="84" rx="8" fill="#C9EAFB" />
                <rect x="16" y="30" width="64" height="84" rx="8" fill="#fff" stroke="#0182FA" strokeWidth="2" strokeDasharray="6 5" />
                <text x="48" y="80" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontWeight="700" fontSize="22" fill="#0182FA">
                  ?
                </text>
              </g>
            </svg>
            <div className="k">Do this first</div>
            {nextAction ? (
              <>
                <h3 style={{ maxWidth: 230 }}>{nextAction.title}</h3>
                <p>{nextAction.why}</p>
                {score.kind === 'exact' && nextAction.points ? (
                  <div className="imp">
                    <span className="pixel from">{value}</span>
                    <Icon name="chev" className="i" />
                    <CountUp className="pixel to" value={Math.min(100, value + nextAction.points)} from={value} />
                    <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, lineHeight: 1.35 }}>
                      {overview.heldByUrgent ? 'lifts the urgent cap' : 'if this is cleared'}
                      <br />
                      and adds {plural(nextAction.points, 'point', 'points')}
                    </span>
                  </div>
                ) : (
                  <p className="capline">{overview.heldByUrgent ? 'This is one of the urgent gaps holding the score at 74. Clearing them all lifts the cap.' : 'Clearing it moves the score as soon as Vero sees the proof.'}</p>
                )}
                <TLink className="btn" href={issuePath(nextAction)}>
                  See what clears it
                </TLink>
              </>
            ) : (
              <>
                <h3 style={{ maxWidth: 230 }}>Nothing urgent to fix</h3>
                <p>Vero didn&apos;t find a gap to start with. Share documents to check more of what applies.</p>
                <div className="imp" />
                <TLink className="btn" href="/documents">
                  Add documents
                </TLink>
              </>
            )}
            <div className="alt">
              {score.kind === 'approximate' ? (
                <>
                  A range on this plan. <PlanLink>Get the exact score</PlanLink>
                </>
              ) : (
                <>
                  Or <TLink href={homeHref}>go to the overview</TLink>
                </>
              )}
            </div>
          </div>
        </section>
      </Hero>

      <After>
        <SourcesDownNote sources={overview.sourcesDown} />
        <Reveal as="section" className="mod fx" i={0}>
          <div className="mh">
            <h2>What Vero found</h2>
            <span className="sub">{found.data ? (found.data.total === 0 ? 'Nothing open right now.' : `In priority order. ${gains > 0 ? `Clearing the top ${issues.length} adds ${gains} points.` : `${plural(found.data.total, 'finding', 'findings')} open.`}`) : 'In priority order.'}</span>
          </div>
          {found.loading && !found.data ? (
            <Loading what="Reading what Vero found" />
          ) : found.error ? (
            <ErrorState error={found.error} onRetry={found.reload} />
          ) : issues.length === 0 ? (
            <p className="empty">
              <b>Vero didn&apos;t find anything that needs fixing yet</b>
              Share documents so Vero can check more of what applies.
            </p>
          ) : (
            <table style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th style={{ width: 56 }} />
                  <th style={{ width: '44%' }}>Finding</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Impact</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody className="rows-in">
                {[...issues, ...(found.data?.rest ?? [])].map((issue, at) => {
                  const detail = at < issues.length ? (issue as IssueDetail) : null;
                  const tone = severityTone(issue.severity);
                  return (
                    <tr className={`f${at === 0 ? ' first' : ''}`} key={`${issue.companyId}-${issue.ruleKey}`} data-testid={detail ? 'top-issue' : undefined} style={{ '--r': at } as CSSProperties} onClick={() => router.push(issuePath(issue))}>
                      <td className="rk">{at + 1}</td>
                      <td>
                        <div className="ft2">
                          <TLink href={issuePath(issue)} onClick={(event) => event.stopPropagation()}>
                            <b>{issue.headline}</b>
                          </TLink>
                          <small>
                            {issue.layerName}
                            {issue.companyId !== root.id ? ` · ${issue.companyName}` : ''}
                          </small>
                        </div>
                        {detail ? <div className="why">{detail.missing || detail.why}</div> : null}
                      </td>
                      <td className="src2">{issue.howWeKnow[0] ?? issue.countryLabel}</td>
                      <td>
                        <span className={`st2 tone-${tone === 'none' ? 'none' : tone}`}>{issue.severityWord}</span>
                      </td>
                      <td>{issue.points ? <span className="gain">+{issue.points}</span> : <span className="muted">-</span>}</td>
                      <td style={{ color: 'var(--ink-4)' }}>
                        <Icon name="chev" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Reveal>

        <section className="r3b">
          <Reveal className="mod" i={1}>
            <div className="mh">
              <h2>In order</h2>
              <span className="sub">{found.data?.passedCount !== null && found.data?.passedCount !== undefined ? `${plural(found.data.passedCount, 'check', 'checks')} with nothing to do` : 'Checks with nothing to do'}</span>
            </div>
            {found.data && found.data.passed.length > 0 ? (
              <>
                <div className="ok2">
                  {found.data.passed.slice(0, 12).map((issue) => (
                    <div key={`${issue.companyId}-${issue.ruleKey}`}>
                      <b>{issue.title ?? issue.area}</b>
                      <small>
                        {issue.howWeKnow[0] ?? issue.layerName}
                        {issue.companyId !== root.id ? ` · ${issue.companyName}` : ''}
                      </small>
                    </div>
                  ))}
                </div>
                {found.data.passed.length > 12 ? <p className="ok2more">And {found.data.passed.length - 12} more on the findings page.</p> : null}
              </>
            ) : found.data ? (
              <p className="empty">
                <b>Nothing passed yet</b>
                {found.data.passedCount === null ? (
                  <>
                    Passed checks are listed on a bigger plan. <PlanLink />
                  </>
                ) : (
                  'Checks that pass show here.'
                )}
              </p>
            ) : null}
          </Reveal>
          <Reveal className="mod" i={2}>
            <div className="mh">
              <h2>Vero keeps watching</h2>
            </div>
            <div className="cu">
              <div className="big">
                <CountUp className="pixel" value={overview.topDeadlines.length} />
                <div>
                  <b>{overview.topDeadlines.length === 1 ? 'deadline coming up' : 'deadlines coming up'}</b>
                  <small>Vero reads the registers again and tells you what changes.</small>
                </div>
              </div>
              {overview.topDeadlines.map((deadline) => (
                <div className="cr" key={deadline.id}>
                  <span className="dt">{deadline.state === 'overdue' ? 'Now' : shortDate(deadline.dueOn)}</span>
                  <div>
                    <b>{deadline.title}</b>
                    <small className={deadline.state === 'overdue' ? 'tone-risk' : undefined}>{deadline.state === 'overdue' ? `Overdue · ${deadline.companyName}` : deadline.companyName}</small>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
        <p className="fine">{overview.notLegalAdvice}</p>
      </After>
    </div>
  );
}

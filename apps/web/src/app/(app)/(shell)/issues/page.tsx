'use client';

import type { IssueSummary, ProjectionResponse } from '@vero/shared';
import { useEffect, useMemo, useState } from 'react';
import { Arrow, Chevron, Empty, ErrorState, Loading, PlanLink, SampleNote, ScoreBasis, SourcesDownNote } from '@/components/Bits';
import { CheckRow } from '@/components/CheckRow';
import { Ruler, ScoreBox, ScoreNumber } from '@/components/Score';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { api } from '@/lib/api';
import { countryShort, plural, POINTS_HELD_WORDS, scoreLevel, scoreWords } from '@/lib/format';
import { groupBySeverity, isOpenIssue, issueKey, issuePath, pointsLabel } from '@/lib/issues';
import { softly } from '@/lib/motion';
import { useResource } from '@/lib/useResource';
import { bandWords } from '@/lib/words';

function subtitle(issue: IssueSummary, several: boolean): string {
  return [issue.layerName, issue.countryLabel, several ? issue.companyName : null].filter(Boolean).join(' · ');
}

export default function IssuesPage() {
  const session = useSession();
  const { root, scope, overview, related } = session;
  const several = related.length > 0;
  const resource = useResource(async () => {
    if (!root) throw new Error('No company');
    return api.results.issues({ params: { companyId: root.id }, query: { scope, outcome: 'all' } });
  }, [root?.id, scope]);

  const [country, setCountry] = useState<string>('all');
  const [ticked, setTicked] = useState<ReadonlySet<string>>(new Set());
  const [projection, setProjection] = useState<ProjectionResponse | null>(null);
  const [projectionFailed, setProjectionFailed] = useState(false);

  const all = useMemo(() => resource.data?.issues ?? [], [resource.data]);
  const inFilter = useMemo(() => all.filter((issue) => country === 'all' || issue.country === country), [all, country]);
  const open = useMemo(() => inFilter.filter(isOpenIssue), [inFilter]);
  const toCheck = useMemo(() => inFilter.filter((issue) => issue.outcome === 'verify'), [inFilter]);
  const countries = useMemo(() => [...new Set(all.map((issue) => issue.country))], [all]);
  const groups = useMemo(() => groupBySeverity(open), [open]);
  const tickedIssues = useMemo(() => all.filter((issue) => ticked.has(issueKey(issue))), [all, ticked]);

  const score = resource.data?.score ?? overview?.score ?? { kind: 'none' as const };
  const base = scoreLevel(score);
  const canPlan = score.kind === 'exact' && all.some((issue) => issue.points !== null && isOpenIssue(issue));
  const threshold = overview?.verifiedThreshold ?? 0;

  // The figure always comes from the API, because an urgent issue can hold a score however
  // many points each fix is worth. The last answer stays on screen while the next one arrives.
  useEffect(() => {
    setProjectionFailed(false);
    if (tickedIssues.length === 0) setProjection(null);
    if (!root || tickedIssues.length === 0) return;
    let current = true;
    const timer = setTimeout(() => {
      const body = scope === 'group' ? { fixes: tickedIssues.map((issue) => ({ companyId: issue.companyId, ruleKey: issue.ruleKey })) } : { ruleKeys: tickedIssues.map((issue) => issue.ruleKey) };
      api.results.projection({ params: { companyId: root.id }, query: { scope }, body }).then(
        (result) => {
          if (current) setProjection(result);
        },
        () => {
          if (current) setProjectionFailed(true);
        },
      );
    }, 150);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [root?.id, scope, tickedIssues]);

  const projected = tickedIssues.length === 0 ? base : (projection?.projected ?? base);
  const reaches = projected >= threshold;
  const firstTicked = tickedIssues[0];

  if (resource.loading && !resource.data) {
    return (
      <main style={{ display: 'contents' }}>
        <Loading what="Getting your issues" />
      </main>
    );
  }
  if (resource.error) {
    return (
      <main style={{ display: 'contents' }}>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </main>
    );
  }
  const data = resource.data;
  if (!data) return null;

  const toggle = (issue: IssueSummary) => {
    setTicked((current) => {
      const next = new Set(current);
      const key = issueKey(issue);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openCount = open.length + (country === 'all' ? data.lockedCount : 0);
  return (
    <main className="wrap mid">
      <section className="sec stack g32">
        <div className="stack g12">
          <h1 className="t-1" data-testid="issue-count">
            {openCount === 0 ? 'Nothing to fix' : plural(openCount, 'thing to fix', 'things to fix')}
          </h1>
          <p className="lead">{openCount === 0 ? "We haven't found anything that needs fixing here." : "In the order we'd do them, based on how serious each one is and what waiting would cost you."}</p>
        </div>

        {overview?.sampleData || overview?.sourcesDown.length ? (
          <div className="notes">
            {overview.sampleData ? <SampleNote /> : null}
            <SourcesDownNote sources={overview.sourcesDown} />
          </div>
        ) : null}

        <ScoreBox value={projected} className="scorebar">
          <div className="word">
            {score.kind === 'approximate' ? (
              <span className="bignum" data-testid="issues-score">
                {score.low}–{score.high}
              </span>
            ) : (
              <span data-testid="issues-score">
                <ScoreNumber className="bignum" />
              </span>
            )}
            <span className="quiet">out of 100</span>
          </div>
          <Ruler label={`Your score of ${scoreWords(score)} sits in ${bandWords(overview?.statusWord)}. Verification starts at ${threshold}.`} goal={threshold} />
        </ScoreBox>
        <p className="small" style={{ marginTop: -16 }}>
          <ScoreBasis coverage={overview?.coverage} held={overview?.heldByUrgent ?? false} />
        </p>

        <div className="toolrow">
          {countries.length > 1 ? (
            <div className="filters" role="group" aria-label="Filter by country">
              {['all', ...countries].map((code) => (
                <button
                  key={code}
                  className={`fbtn${country === code ? ' on' : ''}`}
                  type="button"
                  aria-pressed={country === code}
                  onClick={() => softly(() => setCountry(code))}
                >
                  {code === 'all' ? 'All' : countryShort(code)}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          {canPlan ? (
            <p className="small">Tick what you plan to fix and watch your score move.</p>
          ) : (
            <p className="small">
              Seeing what each fix is worth is part of a paid plan. <PlanLink />
            </p>
          )}
        </div>

        <div className="stack g48">
          {groups.map((group) => (
            <div className="stack g16" key={group.id} data-testid={`group-${group.id}`}>
              <h2 className={`t-3 ${group.tone}`}>{group.title}</h2>
              <div className="rows">
                {group.issues.map((issue) =>
                  issue.points !== null ? (
                    <label className="row r-pick" key={issueKey(issue)} data-testid="issue-row">
                      <input className="tick" type="checkbox" checked={ticked.has(issueKey(issue))} onChange={() => toggle(issue)} aria-label={`Add to my plan: ${issue.headline}`} />
                      <span className="stack g4">
                        <TLink className="row-t" href={issuePath(issue)}>
                          {issue.headline}
                        </TLink>
                        <span className="row-s">{subtitle(issue, several)}</span>
                        {issue.declaredMissing ? <span className="row-s">You told us you don&apos;t have this.</span> : null}
                        {issue.pointsHeldByUrgent ? (
                          <span className="row-s" data-testid="points-held">
                            {POINTS_HELD_WORDS}
                          </span>
                        ) : null}
                      </span>
                      <span className="b num pts">{pointsLabel(issue)}</span>
                    </label>
                  ) : (
                    <TLink className="row r-act" href={issuePath(issue)} key={issueKey(issue)} data-testid="issue-row">
                      <span className="stack g4">
                        <span className="row-t">{issue.headline}</span>
                        <span className="row-s">{subtitle(issue, several)}</span>
                      </span>
                    </TLink>
                  ),
                )}
              </div>
            </div>
          ))}
          {groups.length === 0 && data.lockedCount === 0 ? <Empty title="Nothing here">No open issues for this country.</Empty> : null}

          {data.lockedCount > 0 && country === 'all' ? (
            <p className="note" data-testid="locked-count">
              <span className="b">{plural(data.lockedCount, 'more issue', 'more issues')} on a paid plan.</span>
              <span>
                Your plan shows the {open.length} biggest. <PlanLink>See the plans</PlanLink>
              </span>
            </p>
          ) : null}

          {toCheck.length > 0 ? (
            <div className="stack g16" data-testid="group-to-check">
              <h2 className="t-3">We haven&apos;t seen this yet</h2>
              <p className="small">These don&apos;t count for or against your score until we can check them.</p>
              <details className="more" style={{ borderTop: '1px solid var(--line)' }}>
                <summary className="row r-open">
                  <span className="row-t">{plural(toCheck.length, 'check to look at', 'checks to look at')}</span>
                  <span />
                  <Chevron />
                </summary>
                <div className="rows">
                  {toCheck.map((issue) => (
                    <CheckRow key={issueKey(issue)} issue={issue} name={issue.headline} word={issue.outcomeWord} tone="none" fallback="We haven't seen anything on this yet." onChanged={resource.reload} />
                  ))}
                </div>
              </details>
            </div>
          ) : null}
        </div>

        {data.passedCount !== null && data.passedCount > 0 ? (
          <p className="small">
            {plural(data.passedCount, 'other check', 'other checks')} passed.{' '}
            <TLink className="link" href="/areas/1">
              See what&apos;s in good shape
            </TLink>
          </p>
        ) : null}

        <div className={`planbar${tickedIssues.length > 0 ? ' on' : ''}`} role="status" aria-live="polite" data-testid="planbar">
          <div className="stack g4">
            <p className="plan-t">
              <span>{plural(tickedIssues.length, 'fix', 'fixes')}</span> {tickedIssues.length === 1 ? 'takes' : 'take'} you to{' '}
              <span className="num" data-testid="plan-score">
                {projected}
              </span>
            </p>
            <p className="small">{projectionFailed ? "We couldn't work that out just now. Try ticking it again." : projection?.heldByUrgent ? 'An urgent issue would still be holding your score.' : reaches ? 'That reaches the level for verification.' : `${plural(threshold - projected, 'more point', 'more points')} to reach verification.`}</p>
          </div>
          {firstTicked ? (
            <TLink className="btn btn-ink btn-sm" href={issuePath(firstTicked)}>
              Start with the first <Arrow />
            </TLink>
          ) : null}
        </div>
      </section>
    </main>
  );
}

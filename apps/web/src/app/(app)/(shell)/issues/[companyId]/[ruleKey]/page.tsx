'use client';

import type { IssueDetail } from '@vero/shared';
import { useParams } from 'next/navigation';
import { ErrorState, Loading, PlanLink, Redline, SampleNote } from '@/components/Bits';
import { DeclareMissing } from '@/components/DeclareMissing';
import { PreviewLine, ScoreBox, ScoreGauge, ScoreNumber, usePreview } from '@/components/Score';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { api } from '@/lib/api';
import { POINTS_HELD_WORDS } from '@/lib/format';
import { useResource } from '@/lib/useResource';
import { severityTone } from '@/lib/words';

function FixPanel({ issue, threshold }: { issue: IssueDetail; threshold: number }) {
  const { projection } = issue;
  const to = projection && projection.to > projection.from ? projection.to : null;
  const reaches = projection !== null && projection.from < threshold && projection.to >= threshold;
  const signed = usePreview(to, `Once we've read it, you reach about ${to ?? ''}.`);
  const query = `?company=${issue.companyId}&rule=${encodeURIComponent(issue.ruleKey)}`;
  return (
    <>
      <h2 className="t-2">Fix it</h2>
      {projection ? (
        <>
          <div className="fixscore">
            <div className="word">
              <ScoreNumber className="bignum" />
              <span className="small">out of 100</span>
            </div>
            <ScoreGauge className="gauge mini" />
          </div>
          {issue.pointsHeldByUrgent ? (
            <p className="quiet" data-testid="points-held">
              {POINTS_HELD_WORDS}
            </p>
          ) : to === null ? (
            <p className="quiet">This fix won&apos;t noticeably move this company&apos;s score.</p>
          ) : (
            <p className="quiet" data-testid="fix-projection">
              This one fix takes this company&apos;s score from {projection.from} to about {to}
              {reaches ? ', the level for verification' : ''}.
            </p>
          )}
        </>
      ) : (
        <p className="quiet">
          What this fix does to your score is part of a paid plan. <PlanLink />
        </p>
      )}
      {issue.proof.length > 0 ? (
        <div className="stack g8" data-testid="proof">
          <p className="small">What clears it: {issue.proof.map((item) => item.label).join(', ')}.</p>
        </div>
      ) : null}
      {issue.canAddEvidence ? (
        <TLink className="btn btn-ink" href={`/documents/add${query}`} {...signed}>
          I already have it
        </TLink>
      ) : (
        <p className="quiet small">Only the team that owns this company, on a plan with the vault, can add the proof.</p>
      )}
      <div className="swap" style={{ paddingTop: 4 }}>
        <PreviewLine />
      </div>
    </>
  );
}

function outcomeChip(issue: IssueDetail): { word: string; tone: string } {
  if (issue.outcome === 'verify') return { word: issue.outcomeWord, tone: 'none' };
  if (issue.outcome === 'pass' || issue.outcome === 'not_applicable') return { word: issue.outcomeWord, tone: issue.outcome === 'pass' ? 'good' : 'none' };
  return { word: issue.severityWord, tone: severityTone(issue.severity) };
}

export default function IssuePage() {
  const params = useParams<{ companyId: string; ruleKey: string }>();
  const session = useSession();
  const companyId = params.companyId;
  const ruleKey = decodeURIComponent(params.ruleKey);
  const resource = useResource(() => api.results.issue({ params: { companyId, ruleKey } }), [companyId, ruleKey]);
  const issue = resource.data;

  if (resource.loading && !issue) {
    return (
      <main style={{ display: 'contents' }}>
        <Loading what="Getting this issue" />
      </main>
    );
  }
  if (resource.error || !issue) {
    return (
      <main style={{ display: 'contents' }}>
        {resource.error ? <ErrorState error={resource.error} onRetry={resource.reload} /> : null}
      </main>
    );
  }

  const chip = outcomeChip(issue);
  const isOpen = issue.outcome === 'gap' || issue.outcome === 'defect';
  const isVerify = issue.outcome === 'verify';
  const isPass = issue.outcome === 'pass';
  const threshold = session.overview?.verifiedThreshold ?? 0;
  return (
    <main className="wrap">
      <section className="sec" style={{ paddingTop: 32 }}>
        <TLink className="small" href="/issues">
          Back to all issues
        </TLink>
        <div className="lean issue-grid">
          <article className="main stack g32" style={{ maxWidth: 680 }}>
            <div className="stack g16">
              <div className="btns">
                <span className={`chip ${chip.tone}`} data-testid="issue-chip">
                  {chip.word}
                </span>
                <span className="small">
                  {issue.layerName} · {issue.companyName} · {issue.countryLabel}
                </span>
              </div>
              <h1 className="t-1">{isPass ? (issue.title ?? issue.layerName) : issue.headline}</h1>
            </div>

            {session.overview?.sampleData ? <SampleNote /> : null}

            {isVerify ? (
              <p className="note" data-testid="not-seen">
                <span className="b">We haven&apos;t seen this yet.</span>
                {/* The API's reason can open with the same words as this heading. */}
                {issue.reasonWords ? <span>{issue.reasonWords.replace(/^We haven't seen this yet\.\s*/, '')}</span> : null}
              </p>
            ) : null}

            {issue.missing && !isPass ? (
              <div className="stack g8">
                <h2 className="t-3">What&apos;s missing</h2>
                <p className="quiet" style={{ fontSize: 17 }}>
                  {issue.missing}
                </p>
              </div>
            ) : null}
            {issue.why && !isPass ? (
              <div className="stack g8">
                <h2 className="t-3">Why it matters</h2>
                <p className="quiet" style={{ fontSize: 17 }}>
                  {issue.why}
                </p>
              </div>
            ) : null}
            {issue.ifLeft && !isPass ? (
              <div className="stack g8">
                <h2 className="t-3">What happens if you leave it</h2>
                <p className="quiet" style={{ fontSize: 17 }}>
                  {issue.ifLeft}
                </p>
              </div>
            ) : null}

            {issue.fix && !isPass ? (
              <div className="stack g12">
                <h2 className="t-3">How to fix it</h2>
                <Redline fixLabel="What to do" fix={issue.fix} />
              </div>
            ) : null}

            <div className="stack g12">
              <h2 className="t-3">How we know</h2>
              {issue.howWeKnow.length > 0 ? (
                <div className="rows" data-testid="how-we-know">
                  {issue.howWeKnow.map((line) => (
                    <div className="row r-act" key={line}>
                      <span className="row-s" style={{ color: 'var(--ink)' }}>
                        {line}
                      </span>
                      {line.startsWith('You told us') && !issue.declaredMissing ? (
                        <TLink className="link small" href={`/onboarding/questions?company=${issue.companyId}`}>
                          Change
                        </TLink>
                      ) : (
                        <span />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="quiet">We haven&apos;t seen anything on this yet.</p>
              )}
              {issue.law.length > 0 ? (
                <p className="small">
                  The law: {issue.law.map((item) => (item.cite ? `${item.law} (${item.cite})` : item.law)).join('; ')}.
                  {issue.regulator ? ` Regulator: ${issue.regulator}.` : ''}
                </p>
              ) : null}
            </div>
            <p className="fineprint">{issue.notLegalAdvice}</p>
          </article>

          {issue.canDeclareMissing ? (
            <aside className="side next fixpanel stick" aria-label="What to do">
              <h2 className="t-2">What to do</h2>
              <DeclareMissing key={issue.ruleKey} item={issue} onChanged={resource.reload} />
            </aside>
          ) : isOpen || isVerify ? (
            <ScoreBox value={issue.projection?.from ?? 0} className="side next fixpanel stick">
              <FixPanel issue={issue} threshold={threshold} />
              {issue.declaredMissing ? <DeclareMissing key={issue.ruleKey} item={issue} onChanged={resource.reload} /> : null}
            </ScoreBox>
          ) : null}
        </div>
      </section>
    </main>
  );
}

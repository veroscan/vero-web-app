'use client';

import type { OverviewResponse } from '@vero/shared';
import { Arrow, BlurIn, Chevron, Empty, PlanLink, SampleNote, ScoreBasis, SourcesDownNote } from '@/components/Bits';
import { PreviewLine, Ruler, ScoreBox, ScoreGauge, ScoreNumber, usePreview } from '@/components/Score';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { entitlementsOf } from '@/lib/entitlements';
import { VFill } from '@/components/V3D';
import { monthName, plural, pointsWords, POINTS_HELD_WORDS, scoreLevel, scoreWords, shortDate } from '@/lib/format';
import { issuePath } from '@/lib/issues';
import { scoreSentence, statusTone } from '@/lib/words';

function HomeEmpty() {
  const session = useSession();
  const { user } = session.me;
  const started = session.root !== null;
  const firstName = user.name?.trim().split(/\s+/)[0];
  return (
    <main className="wrap he">
      <section className="he-hero">
        <div className="he-say">
          <p className="lead">Welcome to Vero Scan{firstName ? `, ${firstName}` : ''}.</p>
          <h1 className="t-hero">
            <BlurIn text="Let's see where your company stands." delay={0.15} />
          </h1>
          <p className="lead">{started ? `You've started on ${session.root?.legalName ?? 'your company'}. Pick up where you left off.` : "It takes a few minutes, and you don't need any documents to start."}</p>
          <TLink className="btn btn-ink he-go" id="scan" href={started ? '/onboarding/questions' : '/onboarding/company'}>
            {started ? 'Carry on' : 'Scan your company'} <Arrow />
          </TLink>
        </div>
        <div className="he-mark">
          <VFill value={0} className="gauge he-gauge" />
          <p className="small">This fills up with your score.</p>
        </div>
      </section>
      <section className="stack g20" style={{ paddingBottom: 'clamp(40px,5vw,72px)' }}>
        <h2 className="t-2">What happens when you scan</h2>
        <ol className="he-steps">
          <li>
            <h3 className="t-3">You tell us about your company</h3>
            <p className="quiet">Find it on the Delaware, UK or Nigerian register, then answer a few short questions.</p>
          </li>
          <li>
            <h3 className="t-3">We check the records</h3>
            <p className="quiet">We read the public registers and your website. You can watch each check as it happens.</p>
          </li>
          <li>
            <h3 className="t-3">You get your score</h3>
            <p className="quiet">A score out of 100 in plain English, and the one thing we&apos;d fix first.</p>
          </li>
        </ol>
      </section>
    </main>
  );
}

function NextAction({ overview }: { overview: OverviewResponse }) {
  const action = overview.nextAction;
  const current = overview.score.kind === 'exact' ? overview.score.value : null;
  const after = action && action.points !== null && current !== null ? Math.min(100, current + action.points) : null;
  const reaches = after !== null && current !== null && current < overview.verifiedThreshold && after >= overview.verifiedThreshold;
  const moves = after !== null && current !== null && after > current;
  const preview = usePreview(moves ? after : null, reaches ? 'With this fix, you reach the level for verification.' : `With this fix, you reach about ${after ?? ''}.`);
  if (!action) {
    return (
      <aside className="side next" aria-label="Your next step">
        <p className="nextlabel b">Do this next</p>
        <h2 className="t-2">Nothing needs fixing right now</h2>
        <p className="quiet">We&apos;ll tell you when a date is coming up or something changes.</p>
      </aside>
    );
  }
  return (
    <aside className="side next lifts" aria-label="Your next step" {...preview} data-testid="next-action">
      <p className="nextlabel b">Do this next</p>
      <h2 className="t-2">{action.title}</h2>
      <p className="quiet">{action.why}</p>
      {action.points === 0 ? (
        <p className="b pay" data-testid={overview.heldByUrgent ? 'points-held' : undefined}>
          {overview.heldByUrgent ? POINTS_HELD_WORDS : "This fix won't noticeably move your score."}
        </p>
      ) : after !== null && action.points !== null ? (
        <p className="b pay" data-testid="next-points">
          This one fix adds {pointsWords(action.points).slice(1)}, taking you to about {after}.
        </p>
      ) : (
        <p className="small pay">
          How much this fix is worth is part of a paid plan. <PlanLink />
        </p>
      )}
      <div className="btns">
        <TLink className="btn btn-ink" href={issuePath(action)}>
          Fix this <Arrow />
        </TLink>
      </div>
    </aside>
  );
}

function trendWords(trend: NonNullable<OverviewResponse['trend']>): string {
  if (trend.delta === 0) return `No change since ${monthName(trend.since)}.`;
  return `${trend.delta > 0 ? 'Up' : 'Down'} ${plural(Math.abs(trend.delta), 'point', 'points')} since ${monthName(trend.since)}.`;
}

function Hero({ overview, name }: { overview: OverviewResponse; name: string }) {
  const { score } = overview;
  const level = scoreLevel(score);
  const status = overview.statusWord;
  return (
    <section className="sec hero-sec">
      <ScoreBox value={level} className="lean hero">
        <div className="main stack g24">
          <p className="lead">{name}&apos;s legal health</p>
          <div className="scoreline">
            <div className="scoreword">
              {score.kind === 'approximate' ? (
                <span className="score range" data-testid="home-score">
                  {score.low}–{score.high}
                </span>
              ) : score.kind === 'exact' ? (
                <span data-testid="home-score">
                  <ScoreNumber className="score" />
                </span>
              ) : (
                <span className="score" data-testid="home-score">
                  –
                </span>
              )}
              <span className="quiet">{score.kind === 'none' ? 'not scored yet' : score.kind === 'approximate' ? 'out of 100, roughly' : 'out of 100'}</span>
            </div>
            <ScoreGauge />
          </div>
          <h1 className="t-2">
            <BlurIn text={scoreSentence(status)} delay={0.15} />
          </h1>
          <Ruler label={`Your score of ${scoreWords(score)} sits in ${status ?? 'no band yet'}. Verification starts at ${overview.verifiedThreshold}.`} goal={overview.verifiedThreshold} />
          <div className="swap">
            <p className="small">
              <ScoreBasis coverage={overview.coverage} held={overview.heldByUrgent} />{' '}
              {overview.trend ? `${trendWords(overview.trend)} ` : ''}
              <TLink className="link" href="/badge">
                How verification works
              </TLink>
            </p>
            <PreviewLine />
          </div>
        </div>
        <NextAction overview={overview} />
      </ScoreBox>
    </section>
  );
}

function Areas({ overview, companyId }: { overview: OverviewResponse; companyId: string }) {
  // Lowest score first, as in the design. Areas with no score go last.
  const areas = [...overview.areas].sort((a, b) => (a.score ?? 101) - (b.score ?? 101));
  return (
    <div className="rows">
      {areas.map((area) => {
        const tone = statusTone(area.statusWord);
        return (
          <details className="more" name="areas" key={area.layer} data-testid="area-row">
            <summary className="row r-area4">
              <span className="stack g4">
                <span className="row-t">{area.name}</span>
                <span className="row-s">{area.description}</span>
              </span>
              <span className={`st ${tone}`}>{area.locked ? 'Paid plan' : (area.statusWord ?? 'Not scored')}</span>
              <span className="num b" style={{ textAlign: 'right' }}>
                {area.score ?? '–'}
              </span>
              <Chevron />
            </summary>
            <div className="more-body">
              {area.locked ? (
                <p className="quiet">
                  Scores for each area are part of a paid plan. <PlanLink />
                </p>
              ) : area.topIssue ? (
                <>
                  <p className="quiet">
                    <span className="b">Top issue:</span> {area.topIssue.headline}
                  </p>
                  <p className="morelinks">
                    <TLink className="link" href={`/issues/${companyId}/${encodeURIComponent(area.topIssue.ruleKey)}`}>
                      {area.topIssue.points ? `Fix it, ${pointsWords(area.topIssue.points)}` : 'Fix it'}
                    </TLink>
                    <TLink className="link" href={`/areas/${area.layer}`}>
                      See this whole area
                    </TLink>
                  </p>
                </>
              ) : (
                <>
                  <p className="quiet">{area.score === null ? "Nothing applies here yet, so there's nothing to score." : 'Nothing to fix here right now.'}</p>
                  <p className="morelinks">
                    <TLink className="link" href={`/areas/${area.layer}`}>
                      See this whole area
                    </TLink>
                  </p>
                </>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const session = useSession();
  const { overview, root } = session;
  if (!overview || !root || !session.hasResult) return <HomeEmpty />;
  const shortName = root.legalName.replace(/\s+(inc\.?|ltd\.?|llc|limited|plc)$/i, '');
  return (
    <main className="wrap home">
      {overview.sampleData || overview.sourcesDown.length > 0 ? (
        <div className="notes">
          {overview.sampleData ? <SampleNote /> : null}
          <SourcesDownNote sources={overview.sourcesDown} />
        </div>
      ) : null}
      <Hero overview={overview} name={shortName} />
      <section className="sec">
        <div className="lean">
          <div className="main stack g20">
            <h2 className="t-2">Where you stand</h2>
            <Areas overview={overview} companyId={root.id} />
          </div>
          <div className="side stack g48">
            <div className="stack g20">
              <h2 className="t-2">Coming up</h2>
              {overview.topDeadlines.length > 0 ? (
                <div className="rows">
                  {overview.topDeadlines.map((deadline) => (
                    <TLink className="row r-time" href="/deadlines" key={deadline.id} data-testid="deadline-row">
                      <span className={`st num${deadline.state === 'overdue' ? ' risk' : ''}`}>{deadline.state === 'overdue' ? 'Overdue' : shortDate(deadline.dueOn)}</span>
                      <span className="stack g4">
                        <span className="row-t" style={{ fontSize: 16 }}>
                          {deadline.title}
                        </span>
                        <span className="row-s">{deadline.companyName}</span>
                      </span>
                    </TLink>
                  ))}
                </div>
              ) : (
                <Empty title="No dates yet">We&apos;ll list them here as soon as we can work them out.</Empty>
              )}
              <TLink className="link small" href="/deadlines">
                All deadlines
              </TLink>
            </div>
          </div>
        </div>
        {entitlementsOf(overview.plan).fullReport ? (
          <p className="small" style={{ paddingTop: 40 }}>
            <TLink className="link" href="/report" data-testid="home-report">
              See your full report, ready to print
            </TLink>
          </p>
        ) : null}
        <p className="fineprint" style={{ paddingTop: 40 }}>
          {overview.notLegalAdvice}
        </p>
      </section>
    </main>
  );
}

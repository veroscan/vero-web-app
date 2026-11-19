'use client';

import type { AreaResponse } from '@vero/shared';
import { useParams } from 'next/navigation';
import { Empty, ErrorState, Loading, PlanLink, SampleNote, ScoreBasis } from '@/components/Bits';
import { CheckRow } from '@/components/CheckRow';
import { Ruler, ScoreBox, ScoreNumber } from '@/components/Score';
import { useSession } from '@/components/Session';
import { TLink } from '@/components/TLink';
import { api } from '@/lib/api';
import { POINTS_HELD_WORDS } from '@/lib/format';
import { issueKey, issuePath, pointsLabel } from '@/lib/issues';
import { useResource } from '@/lib/useResource';
import { bandWords, statusTone } from '@/lib/words';

function AreaBody({ area }: { area: AreaResponse }) {
  const tone = statusTone(area.statusWord);
  return (
    <>
      {area.score !== null ? (
        <ScoreBox value={area.score} className="stack g16">
          <p className="lead">{area.name}</p>
          <div className="areanum">
            <span data-testid="area-score">
              <ScoreNumber className={`bignum ${tone}`} />
            </span>
            <span className={`st ${tone}`} style={{ fontSize: 18 }}>
              {area.statusWord}
            </span>
          </div>
          <div className="arearuler">
            <Ruler label={`This area scores ${area.score}, which sits in ${bandWords(area.statusWord)}.`} />
          </div>
        </ScoreBox>
      ) : (
        <div className="stack g16">
          <p className="lead">{area.name}</p>
          <p className="st none" style={{ fontSize: 18 }}>
            Not scored
          </p>
        </div>
      )}
      <p className="small">
        <ScoreBasis coverage={area.coverage} />
      </p>
      <h1 className="t-2" style={{ maxWidth: '24em' }}>
        {area.description}
      </h1>
      {area.cappedExplanation ? (
        <p className="quiet" style={{ maxWidth: '38em' }} data-testid="area-capped">
          {area.cappedExplanation}
        </p>
      ) : null}
    </>
  );
}

export default function AreaPage() {
  const params = useParams<{ layer: string }>();
  const session = useSession();
  const layer = Number(params.layer);
  const validLayer = Number.isInteger(layer) && layer >= 1 && layer <= 6;
  const companyId = session.root?.id ?? '';
  const { scope } = session;
  const summary = session.overview?.areas.find((item) => item.layer === layer);
  // The API refuses this for a plan without area reports, so it isn't asked.
  const locked = summary?.locked ?? false;

  const resource = useResource<AreaResponse | null>(async () => {
    if (!validLayer || locked || !companyId) return null;
    return api.results.area({ params: { companyId, layer }, query: { scope } });
  }, [companyId, layer, locked, validLayer, scope]);
  const area = resource.data;

  return (
    <main className="wrap mid">
      <section className="sec stack g48" style={{ paddingTop: 32 }}>
        <div className="stack g24">
          <TLink className="small" href="/">
            Back to home
          </TLink>
          {!validLayer ? (
            <h1 className="t-2">That area doesn&apos;t exist</h1>
          ) : locked ? (
            <div className="stack g16" data-testid="area-locked">
              <p className="lead">{summary?.name}</p>
              <h1 className="t-2">The report on each area is part of a paid plan.</h1>
              <p className="quiet">{summary?.description}</p>
              <p>
                <PlanLink />
              </p>
            </div>
          ) : resource.loading && !area ? (
            <Loading what="Getting this area" />
          ) : resource.error ? (
            <ErrorState error={resource.error} onRetry={resource.reload} />
          ) : area ? (
            <>
              {session.overview?.sampleData ? <SampleNote /> : null}
              <AreaBody area={area} />
            </>
          ) : null}
        </div>

        {area ? (
          <>
            <div className="stack g16">
              <h2 className="t-3">To fix</h2>
              {area.toFix.length > 0 ? (
                <div className="rows">
                  {area.toFix.map((issue) => (
                    <TLink className="row r-act" href={issuePath(issue)} key={issueKey(issue)} data-testid="area-fix">
                      <span className="stack g4">
                        <span className="row-t">{issue.headline}</span>
                        <span className="row-s">
                          {issue.severityWord} · {issue.countryLabel}
                        </span>
                        {issue.declaredMissing ? <span className="row-s">You told us you don&apos;t have this.</span> : null}
                        {issue.pointsHeldByUrgent ? (
                          <span className="row-s" data-testid="points-held">
                            {POINTS_HELD_WORDS}
                          </span>
                        ) : null}
                      </span>
                      <span className="b num">{pointsLabel(issue)}</span>
                    </TLink>
                  ))}
                </div>
              ) : (
                <Empty title="Nothing to fix here">There are no open issues in this area.</Empty>
              )}
            </div>

            <div className="stack g16">
              <h2 className="t-3">In good shape</h2>
              {area.inGoodShape.length > 0 ? (
                <div className="rows">
                  {area.inGoodShape.map((issue) => (
                    <CheckRow key={issueKey(issue)} issue={issue} name={issue.title ?? issue.layerName} word="Passed" tone="good" fallback="This check passed." />
                  ))}
                </div>
              ) : (
                <Empty title="Nothing has passed here yet" />
              )}
            </div>

            {area.toCheck.length > 0 ? (
              <div className="stack g16">
                <h2 className="t-3">We haven&apos;t seen this yet</h2>
                <p className="small">These don&apos;t count for or against your score until we can check them.</p>
                <div className="rows">
                  {area.toCheck.map((issue) => (
                    <CheckRow key={issueKey(issue)} issue={issue} name={issue.headline} word={issue.outcomeWord} tone="none" fallback="We haven't seen anything on this yet." onChanged={resource.reload} />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}

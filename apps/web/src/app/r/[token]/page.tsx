'use client';

import { useParams } from 'next/navigation';
import { Chevron, ErrorState, Loading, SampleNote } from '@/components/Bits';
import { PublicBar } from '@/components/PublicBar';
import { Ruler, ScoreBox, ScoreGauge, ScoreNumber } from '@/components/Score';
import { api } from '@/lib/api';
import { coverageWords, HELD_WORDS, longDate, plural } from '@/lib/format';
import { areaLine, areaOpenWords, checkedStatus, checkedWords, expiryWords } from '@/lib/trust';
import { useResource } from '@/lib/useResource';
import { bandWords, scoreSentence, statusTone } from '@/lib/words';

/** Links that have ended all answer the same way, so a stranger learns nothing from a dead one. */
function isGone(status: number): boolean {
  return status === 400 || status === 404 || status === 410;
}

export default function SharedReportPage() {
  const { token } = useParams<{ token: string }>();
  const resource = useResource(() => api.public.report({ params: { token } }), [token]);
  const report = resource.data;

  if (resource.error && !report) {
    return (
      <div className="vs">
        <PublicBar />
        <main style={{ display: 'contents' }}>
          {isGone(resource.error.status) ? (
            <div className="state" data-testid="report-gone">
              <h1 className="t-2">This link isn&apos;t open any more</h1>
              <p className="quiet">It may have expired, or been withdrawn by the company that shared it. Ask them for a new one.</p>
            </div>
          ) : (
            <ErrorState error={resource.error} onRetry={resource.reload} />
          )}
        </main>
      </div>
    );
  }
  if (!report) {
    return (
      <div className="vs">
        <PublicBar />
        <main style={{ display: 'contents' }}>
          <Loading what="Getting this report" />
        </main>
      </div>
    );
  }

  const open = report.openIssues;
  const coverage = coverageWords(report.coverage);

  return (
    <div className="vs">
      <PublicBar sharedBy={report.companyName} />
      <main className="wrap report" data-testid="shared-report">
        {report.sampleData ? (
          <div className="report-top">
            <SampleNote />
          </div>
        ) : null}
        <section className="sec">
          <ScoreBox value={report.score ?? 0} className="lean">
            <div className="main stack g24">
              <h1 className="t-1">{report.companyName}</h1>
              {report.score === null ? (
                <p className="t-2" data-testid="report-no-score">
                  No score yet.
                </p>
              ) : (
                <>
                  <div className="scoreline">
                    <div className="scoreword">
                      <ScoreNumber className="score" />
                      <span className="quiet">out of 100</span>
                    </div>
                    <ScoreGauge />
                  </div>
                  <p className="t-2" style={{ maxWidth: '22em' }}>
                    {scoreSentence(report.statusWord)}
                  </p>
                  <Ruler label={`A score of ${report.score} sits in ${bandWords(report.statusWord)}.`} />
                </>
              )}
              {coverage ? (
                <p className="small" data-testid="report-coverage">
                  {coverage}
                </p>
              ) : null}
              {report.heldByUrgent ? (
                <p className="small" data-testid="report-held">
                  {HELD_WORDS.replace('Your score', 'This score').replace('your urgent', 'its urgent')}
                </p>
              ) : null}
              <p className="small" data-testid="report-dates">
                Report from {longDate(report.reportDate)}. {expiryWords(report.expiresAt)}
              </p>
            </div>

            <aside className="side stack g16 sub" aria-label="Open issues">
              <h2 className="t-2">{open.total === 0 ? 'No issues open' : `${plural(open.total, 'issue', 'issues')} still open`}</h2>
              <div className="rows">
                <div className="row r-count">
                  <span className="st risk">Urgent</span>
                  <span className="num b">{open.urgent}</span>
                </div>
                <div className="row r-count">
                  <span className="st watch">Important</span>
                  <span className="num b">{open.important}</span>
                </div>
                <div className="row r-count">
                  <span className="st none">Worth doing</span>
                  <span className="num b">{open.worthDoing}</span>
                </div>
              </div>
              <p className="small">The details stay private unless {report.companyName} shares them.</p>
            </aside>
          </ScoreBox>
        </section>

        <section className="sec">
          <div className="lean">
            <div className="main stack g16">
              <h2 className="t-2">The six areas</h2>
              <div className="rows">
                {report.areas.map((area) => {
                  const line = areaLine(area.name);
                  return (
                    <details className="more" name="areas" key={area.name} data-testid="report-area">
                      <summary className="row r-area4">
                        <span className="stack g4">
                          <span className="row-t">{area.name}</span>
                          {line ? <span className="row-s">{line}</span> : null}
                        </span>
                        <span className={`st ${statusTone(area.statusWord)}`}>{area.statusWord ?? 'Not scored'}</span>
                        <span className="num b" style={{ textAlign: 'right' }}>
                          {area.score ?? ''}
                        </span>
                        <Chevron />
                      </summary>
                      <div className="more-body">
                        <p className="quiet">{areaOpenWords(area)}</p>
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>

            <div className="side stack g16">
              <h2 className="t-2">What&apos;s been checked</h2>
              <div className="rows">
                {report.checked.map((item) => {
                  const status = checkedStatus(item.howWeKnow);
                  return (
                    <div className="row r-act" key={item.country} data-testid="report-checked">
                      <span className="stack g4">
                        <span className="row-t">{item.country}</span>
                        <span className="row-s">{checkedWords(item.howWeKnow)}</span>
                      </span>
                      <span className={`st ${status.tone}`}>{status.word}</span>
                    </div>
                  );
                })}
              </div>
              <p className="small" data-testid="report-what-vero-checked">
                This shows only what Vero checked: public records, and the answers and documents the company added.
              </p>
            </div>
          </div>
          <p className="quiet report-note" data-testid="report-not-advice">
            {report.notLegalAdvice}
          </p>
        </section>
      </main>
    </div>
  );
}

'use client';

import { useParams } from 'next/navigation';
import { Chevron, ErrorState, Loading, SampleNote } from '@/components/Bits';
import { MissingPage } from '@/components/MissingPage';
import { CountUp } from '@/components/Motion';
import { PublicHero, PublicMessage } from '@/components/PublicBar';
import { api } from '@/lib/api';
import { coverageWords, HELD_WORDS, longDate, plural } from '@/lib/format';
import { areaLine, areaOpenWords, checkedStatus, checkedWords, expiryWords } from '@/lib/trust';
import { useResource } from '@/lib/useResource';
import { scoreSentence } from '@/lib/words';

/** Links that have ended all answer the same way, so a stranger learns nothing from a dead one. */
function isGone(status: number): boolean {
  return status === 400 || status === 404 || status === 410;
}

const LEVEL_WORDS: Record<string, string> = { full: 'Full coverage', registry: 'Register coverage', international: 'International coverage' };

/** The area line under its name: what's open there, or what the area covers when nothing is. */
function areaSmall(area: { name: string; openUrgent: number; openImportant: number; openWorthDoing: number }): { text: string; tone: string } {
  if (area.openUrgent > 0) return { text: plural(area.openUrgent, 'urgent issue', 'urgent issues'), tone: 'risk' };
  const open = area.openImportant + area.openWorthDoing;
  if (open > 0) return { text: `${plural(open, 'issue', 'issues')} open`, tone: 'watch' };
  return { text: areaLine(area.name) ?? 'Nothing open', tone: '' };
}

export default function SharedReportPage() {
  const { token } = useParams<{ token: string }>();
  const resource = useResource(() => api.public.report({ params: { token } }), [token]);
  const report = resource.data;

  if (resource.error && !report) {
    if (isGone(resource.error.status)) {
      return (
        <PublicMessage kicker="Shared report" title="This link isn't open any more" art={<MissingPage />} testId="report-gone">
          <p>It may have expired, or been withdrawn by the company that shared it. Ask them for a new one.</p>
        </PublicMessage>
      );
    }
    return (
      <div className="pg-pub">
        <PublicHero size="tall">
          <main className="msg">
            <ErrorState error={resource.error} onRetry={resource.reload} />
          </main>
        </PublicHero>
      </div>
    );
  }
  if (!report) {
    return (
      <div className="pg-pub">
        <PublicHero size="tall">
          <main className="msg">
            <Loading what="Getting this report" />
          </main>
        </PublicHero>
      </div>
    );
  }

  const open = report.openIssues;
  const coverage = coverageWords(report.coverage);
  const level = report.countryCoverage ? LEVEL_WORDS[report.countryCoverage.level] : null;

  return (
    <div className="pg-pub" data-testid="shared-report">
      <PublicHero
        sharedBy={
          <>
            Shared by <b>{report.companyName}</b> · {expiryWords(report.expiresAt).replace(/\.$/, '').toLowerCase()}
          </>
        }
      >
        <div className="content wrap">
          {report.sampleData ? (
            <div className="samplebar">
              <SampleNote />
            </div>
          ) : null}
          <div className="ph2">
            <div className="k">Company report · read-only</div>
            <h1 className="disp">{report.companyName}</h1>
            <div className="meta">
              <span>Report from {longDate(report.reportDate)}</span>
              {level ? <span title={report.countryCoverage?.sentence}>{level}</span> : null}
              <span>{open.total === 0 ? 'No issues open' : `${plural(open.total, 'issue', 'issues')} open`}</span>
            </div>
          </div>

          <section className="r1">
            <div className="mod glass gl sp">
              <div className="l">
                <h2>Legal health</h2>
                {report.score === null ? (
                  <p className="noscore" data-testid="report-no-score">
                    No score yet.
                  </p>
                ) : (
                  <>
                    <div className="big">
                      <CountUp className="pixel" value={report.score} />
                      <small>/ 100</small>
                    </div>
                    <div className="verdict">{scoreSentence(report.statusWord)}</div>
                  </>
                )}
                <div className="basis">
                  {coverage ? <span data-testid="report-coverage">{coverage}</span> : null}
                  {report.heldByUrgent ? <span data-testid="report-held">{HELD_WORDS.replace('Your score', 'This score').replace('your urgent', 'its urgent')}</span> : null}
                  <span data-testid="report-dates">
                    Report from {longDate(report.reportDate)}. {expiryWords(report.expiresAt)}
                  </span>
                </div>
              </div>
              <div className="r">
                <h2>What&apos;s been checked</h2>
                <div className="rl2">
                  {report.checked.map((item) => {
                    const status = checkedStatus(item.howWeKnow);
                    return (
                      <div key={item.country} data-testid="report-checked">
                        <span>
                          {item.country}
                          <small>{checkedWords(item.howWeKnow)}</small>
                        </span>
                        <em className={status.tone}>{status.word}</em>
                      </div>
                    );
                  })}
                </div>
                <p className="note2" data-testid="report-what-vero-checked">
                  This shows only what Vero checked: public records, and the answers and documents the company added.
                </p>
              </div>
            </div>

            <aside className="mod opencard" aria-label="Open issues">
              <div className="k">Still open</div>
              <h3>{open.total === 0 ? 'No issues open' : `${plural(open.total, 'issue', 'issues')} still open`}</h3>
              <div className="cnt">
                <div>
                  <span className="risk">Urgent</span>
                  <span className={`pixel ${open.urgent > 0 ? 'risk' : 'zero'}`}>{open.urgent}</span>
                </div>
                <div>
                  <span className="watch">Important</span>
                  <span className={`pixel ${open.important > 0 ? 'watch' : 'zero'}`}>{open.important}</span>
                </div>
                <div>
                  <span className="none">Worth doing</span>
                  <span className={`pixel ${open.worthDoing > 0 ? 'none' : 'zero'}`}>{open.worthDoing}</span>
                </div>
              </div>
              <p className="why">The details stay private unless {report.companyName} shares them.</p>
            </aside>
          </section>
        </div>
      </PublicHero>

      <main className="content after wrap">
        <section className="r3b">
          <div className="mod">
            <div className="mh">
              <h2>Areas</h2>
              <span className="sub">How each part of the company scores</span>
            </div>
            <div className="ar2">
              {report.areas.map((area) => {
                const small = areaSmall(area);
                const risky = area.openUrgent > 0;
                return (
                  <details name="areas" key={area.name} data-testid="report-area">
                    <summary className="ar">
                      <div>
                        <b>{area.name}</b>
                        <small className={small.tone}>{small.text}</small>
                      </div>
                      <div className="tr">
                        <i className={`grow${risky ? ' risk' : ''}`} style={{ width: `${area.score ?? 0}%` }} />
                      </div>
                      <span className={`pixel${risky ? ' risk' : ''}`}>{area.score ?? ''}</span>
                      <Chevron />
                    </summary>
                    <p className="ar-body">{areaOpenWords(area)}</p>
                  </details>
                );
              })}
              <div className="how" style={{ marginTop: 18 }}>
                <b>How the score works</b>
                <p>Each area adds to the overall score. An urgent issue holds the overall score down until it is fixed. Checks that wait on documents nobody has added yet never lower the score.</p>
              </div>
            </div>
          </div>

          <div className="mod">
            <div className="mh">
              <h2>About this report</h2>
              <span className="sub">What it rests on</span>
            </div>
            <div className="dl">
              <div>
                <span>
                  Report date<small>When Vero last scanned</small>
                </span>
                <em>{longDate(report.reportDate)}</em>
              </div>
              <div>
                <span>
                  This link<small>Read-only, made by the company</small>
                </span>
                <em>{longDate(report.expiresAt)}</em>
              </div>
              {report.coverage && report.coverage.total > 0 ? (
                <div>
                  <span>
                    Checks counted<small>Out of all that apply</small>
                  </span>
                  <em>
                    {report.coverage.counted} of {report.coverage.total}
                  </em>
                </div>
              ) : null}
              {level ? (
                <div>
                  <span>
                    {level}
                    <small>{report.countryCoverage?.sentence}</small>
                  </span>
                </div>
              ) : null}
            </div>
            <p className="fnote">Evidence, quotes and the documents themselves are never part of a shared report.</p>
          </div>
        </section>

        <footer className="foot2">
          <img className="light-only" src="/brand/wordmark-dark.svg" alt="Vero" />
          <img className="dark-only" src="/brand/wordmark-light.svg" alt="Vero" />
          <div>
            <p data-testid="report-not-advice">{report.notLegalAdvice}</p>
            <small>Vero shows what official registers and shared documents say.</small>
          </div>
          <div className="r">
            Report from {longDate(report.reportDate)}
            <br />
            This link expires {longDate(report.expiresAt)}
          </div>
        </footer>
      </main>
    </div>
  );
}

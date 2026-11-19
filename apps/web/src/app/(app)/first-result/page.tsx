'use client';

import type { IssueDetail } from '@vero/shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BlurIn, ErrorState, Loading, SampleNote, ScoreBasis, SourcesDownNote } from '@/components/Bits';
import { useCountUp } from '@/components/Score';
import { useSession } from '@/components/Session';
import { ThemeToggle } from '@/components/Theme';
import { TLink } from '@/components/TLink';
import { V_PATH, VHero } from '@/components/V3D';
import { api } from '@/lib/api';
import { scoreWords } from '@/lib/format';
import { peekNext } from '@/lib/next-path';
import { useResource } from '@/lib/useResource';
import { scoreSentence } from '@/lib/words';

function Counted({ value, className }: { value: number; className?: string }) {
  const number = useCountUp(value);
  return <span className={className}>{number}</span>;
}

export default function FirstResultPage() {
  const session = useSession();
  const router = useRouter();
  const { overview, root, scope, hasResult } = session;
  const top = useResource<IssueDetail[]>(async () => {
    if (!root) return [];
    const list = await api.results.issues({ params: { companyId: root.id }, query: { scope, outcome: 'open' } });
    const first = list.issues.slice(0, 3);
    // The row needs the plain explanation, which only the full issue carries.
    return Promise.all(first.map((issue) => api.results.issue({ params: { companyId: issue.companyId, ruleKey: issue.ruleKey } })));
  }, [root?.id, scope]);

  useEffect(() => {
    if (!hasResult) router.replace(root ? '/onboarding/scanning' : '/onboarding/company');
  }, [hasResult, root, router]);

  if (!overview || !root || !hasResult) return null;
  const { score } = overview;
  const isRange = score.kind === 'approximate';
  const issues = top.data ?? [];
  const heading = issues.length === 0 ? "We didn't find anything that needs fixing yet" : issues.length === 3 ? 'The three biggest things we found' : 'The biggest things we found';

  return (
    <div className="vs">
      <section className="stage fr-hero" aria-label="Your first read">
        <VHero className="fr-v">
          <svg className="fr-mark" viewBox="0 0 132 100">
            <defs>
              <linearGradient id="fr-enamel" x1="0" y1="0" x2=".55" y2="1">
                <stop offset="0" stopColor="#F08AA8" />
                <stop offset=".55" stopColor="#E06A90" />
                <stop offset="1" stopColor="#B03C64" />
              </linearGradient>
            </defs>
            <path d={V_PATH} />
          </svg>
        </VHero>
        <div className="wrap fr-top">
          <img src="/vero-lockup-dark.svg" alt="Vero Scan" />
          <div className="fr-co">
            <span>{root.legalName}</span>
            <div className="tools">
              <ThemeToggle />
            </div>
          </div>
        </div>
        <div className="wrap fr-copy">
          <p className="fr-kicker">Your first read</p>
          <div className="fr-range" role="img" aria-label={`${scoreWords(score)} out of 100`} data-testid="first-score">
            {score.kind === 'approximate' ? (
              <>
                <Counted value={score.low} className="fr-n fr-n-a" />
                <span className="fr-dash">–</span>
                <Counted value={score.high} className="fr-n" />
              </>
            ) : score.kind === 'exact' ? (
              <Counted value={score.value} className="fr-n" />
            ) : (
              <span className="fr-n">–</span>
            )}
          </div>
          <p className="fr-say">
            <BlurIn text={scoreSentence(overview.statusWord)} delay={0.9} />
          </p>
          <p className="fr-basis">
            <ScoreBasis coverage={overview.coverage} held={overview.heldByUrgent} />
          </p>
        </div>
      </section>

      <main className="wrap">
        <section className="sec">
          <div className="lean">
            <div className="main stack g20">
              {overview.sampleData ? <SampleNote /> : null}
              <SourcesDownNote sources={overview.sourcesDown} />
              <h1 className="t-2 fr-head">{heading}</h1>
              {top.loading ? (
                <Loading what="Reading what we found" />
              ) : top.error ? (
                <ErrorState error={top.error} onRetry={top.reload} />
              ) : issues.length > 0 ? (
                <div className="rows fr-rows">
                  {issues.map((issue, index) => (
                    <div className="row" key={`${issue.companyId}-${issue.ruleKey}`} data-testid="top-issue">
                      <span className="fr-i" aria-hidden="true">
                        {index + 1}
                      </span>
                      <span className="row-t">{issue.headline}</span>
                      <span className="row-s">{issue.missing || issue.why}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="fineprint">{overview.notLegalAdvice}</p>
            </div>
            <aside className="side next fr-side" aria-label={isRange ? 'Get the full report' : 'See the full report'}>
              {isRange ? (
                <>
                  <h2 className="t-2">Why it&apos;s a range</h2>
                  <p className="quiet">This comes from public records and your answers. Add your documents and we can give you an exact score and the full list of gaps.</p>
                </>
              ) : (
                <>
                  <h2 className="t-2">Your full report is ready</h2>
                  <p className="quiet">See every issue in the order we&apos;d fix them, and what each fix would do to your score.</p>
                </>
              )}
              <div className="stack g8">
                {isRange ? (
                  <TLink className="btn btn-ink" href="/plan" style={{ width: '100%' }}>
                    Get your exact score
                  </TLink>
                ) : null}
                <TLink className={`btn ${isRange ? 'btn-line' : 'btn-ink'}`} href={peekNext() ?? '/'} style={{ width: '100%' }}>
                  {isRange ? 'Look around first' : 'Go to your home page'}
                </TLink>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}

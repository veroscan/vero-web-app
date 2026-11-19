'use client';

import { useParams } from 'next/navigation';
import { ErrorState, Loading } from '@/components/Bits';
import { MissingPage } from '@/components/MissingPage';
import { PublicHero, PublicMessage } from '@/components/PublicBar';
import { V_PATH } from '@/components/VMark';
import { api } from '@/lib/api';
import { longDate } from '@/lib/format';
import { useResource } from '@/lib/useResource';

/** The flat seal: the V in the brand blues on glass. Drawn only for a badge the API says is live. */
function Seal({ company, by }: { company: string; by: string }) {
  return (
    <div className="glass seal" role="img" aria-label={`Verified seal for ${company}`}>
      <svg viewBox="0 0 132 100" aria-hidden="true">
        <defs>
          <linearGradient id="seal-v" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9DDAF7" />
            <stop offset="1" stopColor="#03B1FA" />
          </linearGradient>
        </defs>
        <path d={V_PATH} fill="url(#seal-v)" />
      </svg>
      <span className="big">Legal health verified</span>
      <small>Checked by {by}</small>
    </div>
  );
}

/** Where a company's badge link goes. It only ever says what the API says about a live badge. */
export default function VerifiedPage() {
  const { token } = useParams<{ token: string }>();
  const resource = useResource(() => api.public.badge({ params: { token } }), [token]);
  const badge = resource.data;

  if (resource.error && !badge) {
    const gone = resource.error.status === 400 || resource.error.status === 404 || resource.error.status === 410;
    if (gone) {
      return (
        <PublicMessage kicker="Verified badge" title="This badge isn't live" art={<MissingPage />} testId="verified-gone">
          <p>It may have expired, or been withdrawn. That doesn&apos;t say anything else about the company.</p>
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
  if (!badge) {
    return (
      <div className="pg-pub">
        <PublicHero size="tall">
          <main className="msg">
            <Loading what="Checking this badge" />
          </main>
        </PublicHero>
      </div>
    );
  }

  return (
    <div className="pg-pub">
      <PublicHero size="tall">
        <main className="content wrap" data-testid="verified-badge" style={{ flex: 1, display: 'flex', alignItems: 'center', width: '100%' }}>
          <div className="vb" style={{ width: '100%' }}>
            <Seal company={badge.companyName} by={badge.reviewedBy} />
            <div>
              <span className="mono kick">
                Verified badge · <b>Live</b>
              </span>
              <h1 className="disp" style={{ marginTop: 14 }}>
                {badge.companyName}
              </h1>
              <p className="lead2">Legal health verified. Checked by {badge.reviewedBy}.</p>
              <div className="glass facts">
                <div>
                  <span>Issued</span>
                  <b>{longDate(badge.issuedAt)}</b>
                </div>
                <div>
                  <span>Good until</span>
                  <b>{longDate(badge.expiresAt)}</b>
                </div>
                <div>
                  <span>Score when issued</span>
                  <b className="num">{badge.scoreAtIssue} out of 100</b>
                </div>
              </div>
              <p className="fine" data-testid="verified-not-advice">
                {badge.notLegalAdvice}
              </p>
            </div>
          </div>
        </main>
      </PublicHero>
    </div>
  );
}

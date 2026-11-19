'use client';

import { useParams } from 'next/navigation';
import { ErrorState, Loading } from '@/components/Bits';
import { PublicBar } from '@/components/PublicBar';
import { V_PATH, VSeal } from '@/components/V3D';
import { api } from '@/lib/api';
import { longDate } from '@/lib/format';
import { useResource } from '@/lib/useResource';

/** Where a company's badge link goes. It only ever says what the API says about a live badge. */
export default function VerifiedPage() {
  const { token } = useParams<{ token: string }>();
  const resource = useResource(() => api.public.badge({ params: { token } }), [token]);
  const badge = resource.data;

  if (resource.error && !badge) {
    const gone = resource.error.status === 400 || resource.error.status === 404 || resource.error.status === 410;
    return (
      <div className="vs">
        <PublicBar />
        <main style={{ display: 'contents' }}>
          {gone ? (
            <div className="state" data-testid="verified-gone">
              <h1 className="t-2">This badge isn&apos;t live</h1>
              <p className="quiet">It may have expired, or been withdrawn. That doesn&apos;t say anything else about the company.</p>
            </div>
          ) : (
            <ErrorState error={resource.error} onRetry={resource.reload} />
          )}
        </main>
      </div>
    );
  }
  if (!badge) {
    return (
      <div className="vs">
        <PublicBar />
        <main style={{ display: 'contents' }}>
          <Loading what="Checking this badge" />
        </main>
      </div>
    );
  }

  return (
    <div className="vs">
      <PublicBar />
      <main className="wrap verified" data-testid="verified-badge">
        <div className="bd-seal-box">
          <VSeal earned label={`Verified seal for ${badge.companyName}`}>
            <div className="bd-flat">
              <svg viewBox="0 0 132 100" aria-hidden="true">
                <path d={V_PATH} />
              </svg>
              <p className="bd-big">Legal health verified</p>
              <p className="small" style={{ color: 'inherit' }}>
                Checked by {badge.reviewedBy}
              </p>
            </div>
          </VSeal>
        </div>
        <div className="stack g24">
          <div className="stack g8">
            <h1 className="t-1">{badge.companyName}</h1>
            <p className="lead">Legal health verified. Checked by {badge.reviewedBy}.</p>
          </div>
          <div className="rows">
            <div className="row r-act">
              <span className="row-t">Issued</span>
              <span className="b">{longDate(badge.issuedAt)}</span>
            </div>
            <div className="row r-act">
              <span className="row-t">Good until</span>
              <span className="b">{longDate(badge.expiresAt)}</span>
            </div>
            <div className="row r-act">
              <span className="row-t">Score when issued</span>
              <span className="b num">{badge.scoreAtIssue} out of 100</span>
            </div>
          </div>
          <p className="quiet" data-testid="verified-not-advice">
            {badge.notLegalAdvice}
          </p>
        </div>
      </main>
    </div>
  );
}

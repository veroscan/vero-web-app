'use client';

/* A company you follow: the same overview as your own company, from its public records only,
   with nothing to upload or answer. The one thing you can do here is stop following it. */

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ErrorState, Loading } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { OverviewBody } from '@/components/overview/OverviewBody';
import { Plain } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { useToast } from '@/components/Toast';
import { api, asApiError, isRedirecting } from '@/lib/api';
import { useResource } from '@/lib/useResource';
import '@/app/styles/pages/watchlist.css';

const NONE: readonly never[] = [];

/** "Stop following", asked twice: its scans go with it, so the second press is the one that counts. */
function StopFollowing({ companyId, name }: { companyId: string; name: string }) {
  const router = useRouter();
  const toast = useToast();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  const wasAsking = useRef(false);

  // Focus follows the question: to "Keep following" when it opens, back to the button when it closes.
  useEffect(() => {
    if (asking) keep.current?.focus();
    else if (wasAsking.current) opener.current?.focus();
    wasAsking.current = asking;
  }, [asking]);

  const stop = () => {
    if (busy) return;
    setBusy(true);
    api.watchlist.remove({ params: { companyId } }).then(
      () => {
        window.dispatchEvent(new Event('vero:watchlist'));
        toast(`You've stopped following ${name}.`);
        router.push('/watchlist');
      },
      (failure: unknown) => {
        setBusy(false);
        if (isRedirecting(failure)) return;
        toast(asApiError(failure).message);
        setAsking(false);
      },
    );
  };

  if (!asking) {
    return (
      <button ref={opener} type="button" className="btn btn-g" onClick={() => setAsking(true)} data-testid="unfollow">
        Stop following
      </button>
    );
  }
  return (
    <div
      className="wl-confirm"
      role="group"
      aria-label={`Stop following ${name}?`}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !busy) {
          event.stopPropagation();
          setAsking(false);
        }
      }}
    >
      <span>Its scans go too.</span>
      <button type="button" className="btn btn-g wl-stop" onClick={stop} disabled={busy} aria-busy={busy} data-testid="unfollow-confirm">
        {busy ? 'Stopping' : 'Stop following'}
      </button>
      <button ref={keep} type="button" className="btn btn-g" onClick={() => setAsking(false)} disabled={busy}>
        Keep
      </button>
    </div>
  );
}

export default function FollowedCompanyPage() {
  const params = useParams<{ companyId: string }>();
  const companyId = params.companyId;
  const resource = useResource(async () => {
    const [company, overview] = await Promise.all([api.companies.get({ params: { companyId } }), api.results.overview({ params: { companyId }, query: { scope: 'company' } })]);
    return { company, overview };
  }, [companyId]);
  const data = resource.data;
  const crumb = (
    <>
      <TLink href="/watchlist">Watchlist</TLink>
      <Icon name="chev" />
      <b>{data?.company.legalName ?? 'Company'}</b>
    </>
  );

  if (resource.error) {
    return (
      <Plain crumb={crumb}>
        <ErrorState
          error={resource.error}
          onRetry={resource.reload}
          title={resource.error.status === 404 ? "This company isn't on your watchlist" : "We couldn't load this company"}
        />
      </Plain>
    );
  }
  if (!data) {
    return (
      <Plain crumb={crumb}>
        <Loading what="Getting this company" />
      </Plain>
    );
  }
  const followed = data.company.relationship === 'follow';
  return (
    <OverviewBody
      company={data.company}
      related={NONE}
      overview={data.overview}
      readOnly={followed}
      onScanned={resource.reload}
      crumb={crumb}
      back={{ href: '/watchlist', label: 'Watchlist' }}
      {...(followed ? { actions: <StopFollowing companyId={companyId} name={data.company.legalName} /> } : {})}
      areaHref={(layer) => `/areas/${layer}?company=${companyId}`}
    />
  );
}

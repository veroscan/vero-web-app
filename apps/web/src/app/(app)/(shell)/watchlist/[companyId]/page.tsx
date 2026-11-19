'use client';

/* A company you follow: the same overview as your own company, from its public records only,
   with nothing to upload or answer. */

import { useParams } from 'next/navigation';
import { ErrorState, Loading } from '@/components/Bits';
import { Icon } from '@/components/Icon';
import { OverviewBody } from '@/components/overview/OverviewBody';
import { Plain } from '@/components/Shell';
import { TLink } from '@/components/TLink';
import { api } from '@/lib/api';
import { useResource } from '@/lib/useResource';

const NONE: readonly never[] = [];

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
        <ErrorState error={resource.error} onRetry={resource.reload} />
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
  return (
    <OverviewBody
      company={data.company}
      related={NONE}
      overview={data.overview}
      readOnly={data.company.relationship === 'follow'}
      onScanned={resource.reload}
      crumb={crumb}
      areaHref={(layer) => `/areas/${layer}?company=${companyId}`}
    />
  );
}

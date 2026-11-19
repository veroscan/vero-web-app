'use client';

import '@/app/styles/pages/scan.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useSession } from '@/components/Session';
import { Finder, NextSteps } from '@/components/scan/Finder';
import { RecentScans, useRecentRows } from '@/components/scan/RecentScans';
import { confirmHref, manualHref, notFoundHref } from '@/lib/candidate';

/**
 * New scan (the NewScan board): look up any company on its register. Someone with a company of
 * their own follows the one they pick (public data, read-only). Someone without one starts onboarding.
 */
function NewScan() {
  const session = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const follow = params.get('follow') === '1' || session.root !== null;
  const recent = useRecentRows();

  useEffect(() => {
    if (!follow) router.replace('/onboarding/company');
  }, [follow, router]);

  if (!follow) return null;
  return (
    <div className="pg-scan">
      <Finder
        kicker={['Any company', 'Official records, in plain English']}
        title="Scan any company"
        lede="Search by company name or registration number. Vero reads the official registry record first, then sanctions lists and the company's website."
        rowHref={({ country, candidate, found }) => confirmHref(country, candidate, found, false, true)}
        manualHref={(country, name) => manualHref(country, name, false, true)}
        notFoundHref={(country, q, source) => notFoundHref(country, q, source, false, true)}
      >
        {recent && recent.length > 0 ? (
          <section className="r3b">
            <RecentScans rows={recent} />
            <NextSteps follow i={2} />
          </section>
        ) : (
          <div style={{ marginTop: 20, maxWidth: 560 }}>
            <NextSteps follow />
          </div>
        )}
      </Finder>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <NewScan />
    </Suspense>
  );
}

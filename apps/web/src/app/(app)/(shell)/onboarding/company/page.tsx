'use client';

import '@/app/styles/pages/scan.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useSession } from '@/components/Session';
import { Finder, NextSteps } from '@/components/scan/Finder';
import { RecentScans, useRecentRows } from '@/components/scan/RecentScans';
import { api, asApiError } from '@/lib/api';
import { confirmHref, manualHref, notFoundHref } from '@/lib/candidate';
import { rememberNext } from '@/lib/next-path';

/** Step 0 of onboarding: find your own company on its register (the NewScan board). */
function FindCompany() {
  const session = useSession();
  const router = useRouter();
  const params = useSearchParams();
  // "Add another company": someone who already has one is not sent back to it.
  const adding = params.get('add') === '1' && session.root !== null;
  const [country, setCountry] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [starting, setStarting] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const recent = useRecentRows();

  useEffect(() => {
    const next = params.get('next');
    if (next) rememberNext(next);
  }, [params]);

  // Someone who already has a company carries on from where they got to.
  useEffect(() => {
    if (session.root && params.get('add') !== '1') router.replace(session.hasResult ? '/' : '/onboarding/questions');
  }, [session.root, session.hasResult, router, params]);

  /** Not registered yet: the company still needs a name, because the API records one. */
  const startWithout = async () => {
    if (!country || query.length === 0) {
      setProblem(country ? 'Type the name you plan to use first.' : 'Choose a country and type the name you plan to use first.');
      return;
    }
    setStarting(true);
    setProblem(null);
    try {
      const body = { legalName: query, incorporationCountry: country, preIncorporation: true };
      if (adding && session.root) {
        const added = await api.companies.addRelated({ params: { companyId: session.root.id }, body });
        await session.refresh();
        router.push(`/onboarding/questions?company=${added.id}&added=1`);
        return;
      }
      await api.companies.create({ body });
      await session.refresh();
      router.push('/onboarding/questions');
    } catch (error) {
      setProblem(asApiError(error).message);
      setStarting(false);
    }
  };

  const others = (recent ?? []).filter((row) => row.key !== session.root?.id);
  return (
    <div className="pg-scan">
      <Finder
        kicker={[adding ? 'Add a company' : 'Any company', 'Official records, in plain English']}
        title={adding ? 'Add a company to your group' : 'Find your company'}
        lede="Search by company name or registration number. Vero reads the official registry record first, then the company's own documents."
        rowHref={({ country: code, candidate, found }) => confirmHref(code, candidate, found, adding)}
        manualHref={(code, name) => manualHref(code, name, adding)}
        notFoundHref={(code, q, source) => notFoundHref(code, q, source, adding)}
        onCountry={setCountry}
        onQuery={setQuery}
        footExtra={
          <>
            {' '}
            Not registered yet?{' '}
            <button className="link" type="button" disabled={starting} onClick={() => void startWithout()}>
              Start without a company
            </button>
            .
            {problem ? (
              <span className="formerror" role="alert" style={{ display: 'block', marginTop: 6 }}>
                {problem}
              </span>
            ) : null}
          </>
        }
      >
        {others.length > 0 ? (
          <section className="r3b">
            <RecentScans rows={others} />
            <NextSteps i={2} />
          </section>
        ) : (
          <div style={{ marginTop: 20, maxWidth: 560 }}>
            <NextSteps />
          </div>
        )}
      </Finder>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <FindCompany />
    </Suspense>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CheckEmail, EmailForm } from '@/components/EmailForm';
import { SignInFrame } from '@/components/SignInFrame';
import { TLink } from '@/components/TLink';
import { rememberNext } from '@/lib/next-path';

function SignIn() {
  const params = useSearchParams();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const next = params.get('next');

  // Kept through the trip to the inbox, so people land on the page they asked for.
  useEffect(() => {
    rememberNext(next);
  }, [next]);

  return (
    <SignInFrame>
      {sentTo ? (
        <CheckEmail email={sentTo} onReset={() => setSentTo(null)} />
      ) : (
        <>
          <div className="stack g8 si-in" style={{ '--n': 0 } as React.CSSProperties}>
            <h1 className="t-1">Get your legal health score</h1>
            <p className="quiet">It takes a few minutes. No documents needed to start.</p>
          </div>
          <EmailForm onSent={setSentTo} />
          <p className="small si-in" style={{ '--n': 3 } as React.CSSProperties}>
            We&apos;ll email you a sign-in link, so there&apos;s no password to remember. By continuing you accept our{' '}
            <TLink className="link" href="/legal/terms">
              terms
            </TLink>{' '}
            and{' '}
            <TLink className="link" href="/legal/privacy">
              privacy policy
            </TLink>
            .
          </p>
        </>
      )}
    </SignInFrame>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}

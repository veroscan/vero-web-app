'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CheckEmail, EmailForm, LegalLine } from '@/components/EmailForm';
import { Words } from '@/components/Motion';
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
    <SignInFrame
      top={
        <>
          New to Vero?
          <TLink href={next ? `/sign-up?next=${encodeURIComponent(next)}` : '/sign-up'}>Create an account</TLink>
        </>
      }
    >
      {sentTo ? (
        <CheckEmail email={sentTo} onReset={() => setSentTo(null)} />
      ) : (
        <>
          <h1>
            <Words text="Sign in to Vero" />
          </h1>
          <p className="lead">Use the email you signed up with. We&apos;ll send you a link that signs you in.</p>
          <EmailForm onSent={setSentTo} />
          <LegalLine lead="No password to remember. The link signs you in once and expires after 15 minutes." />
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

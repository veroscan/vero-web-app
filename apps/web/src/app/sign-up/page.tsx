'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CheckEmail, EmailForm, LegalLine } from '@/components/EmailForm';
import { Words } from '@/components/Motion';
import { SIGN_UP_SIDE, SignInFrame } from '@/components/SignInFrame';
import { TLink } from '@/components/TLink';
import { rememberNext } from '@/lib/next-path';

/**
 * A new account is the same magic link as signing in: the API makes the account the first time the
 * link is opened, and that first sign-in goes on to finding a company.
 */
function SignUp() {
  const params = useSearchParams();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const next = params.get('next');

  useEffect(() => {
    rememberNext(next);
  }, [next]);

  return (
    <SignInFrame
      side={SIGN_UP_SIDE}
      top={
        <>
          Already have an account?
          <TLink href={next ? `/sign-in?next=${encodeURIComponent(next)}` : '/sign-in'}>Sign in</TLink>
        </>
      }
    >
      {sentTo ? (
        <CheckEmail email={sentTo} onReset={() => setSentTo(null)} />
      ) : (
        <>
          <h1>
            <Words text="Create your account" />
          </h1>
          <p className="lead">Start on the Free plan. Scan your own company, or any company you want to check.</p>
          <EmailForm onSent={setSentTo} buttonLabel="Create account" />
          <LegalLine lead="We'll email you a link to sign in, so there's no password to remember." />
        </>
      )}
    </SignInFrame>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SignUp />
    </Suspense>
  );
}

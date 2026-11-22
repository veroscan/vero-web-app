'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { CheckEmail, EmailForm } from '@/components/EmailForm';
import { Words } from '@/components/Motion';
import { SignInFrame } from '@/components/SignInFrame';
import { TLink } from '@/components/TLink';
import { api, asApiError, type ApiError } from '@/lib/api';
import { peekNext, takeNext } from '@/lib/next-path';

/** The phone app's own address for a sign-in link (its scheme is set in apps/mobile/app.json). */
function appLink(token: string): string {
  return `vero://sign-in?token=${encodeURIComponent(token)}`;
}

type State ={ kind: 'working' } | { kind: 'expired' } | { kind: 'used' } | { kind: 'invalid' } | { kind: 'failed'; error: ApiError };

const SIGN_UP_TOP = (
  <>
    New to Vero?
    {/* Not prefetched: once the link signs you in, /sign-up redirects to /, and the prefetch 404s. */}
    <TLink href="/sign-up" prefetch={false}>
      Create an account
    </TLink>
  </>
);

function Verify() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  // A link asked for from the phone app opens the app, and is only used here if the person chooses to.
  const forApp = params.get('app') === '1';
  const [inBrowser, setInBrowser] = useState(false);
  const [state, setState] = useState<State>({ kind: 'working' });
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // A link only works once, so it must only be sent once, however often React runs this.
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState({ kind: 'invalid' });
      return;
    }
    if (forApp && !inBrowser) {
      window.location.href = appLink(token);
      return;
    }
    const key = `${token}:${attempt}`;
    if (sent.current === key) return;
    sent.current = key;
    setState({ kind: 'working' });
    api.auth.verifyMagicLink({ body: { token } }).then(
      (result) => {
        if (result.mfaRequired) {
          const next = peekNext();
          router.replace(next ? `/sign-in/two-step?next=${encodeURIComponent(next)}` : '/sign-in/two-step');
          return;
        }
        const next = takeNext();
        // A first sign-in goes straight to finding the company, as in the design.
        const invited = next?.startsWith('/invitations/accept') ?? false;
        router.replace(result.isNewUser && !invited ? `/onboarding/company${next ? `?next=${encodeURIComponent(next)}` : ''}` : (next ?? '/'));
      },
      (failure: unknown) => {
        const error = asApiError(failure);
        if (error.code === 'magic_link_invalid') setState({ kind: error.reason === 'used' ? 'used' : error.reason === 'expired' ? 'expired' : 'invalid' });
        else setState({ kind: 'failed', error });
      },
    );
  }, [token, attempt, router, forApp, inBrowser]);

  if (token && forApp && !inBrowser) {
    return (
      <SignInFrame top={SIGN_UP_TOP}>
        <div className="reading" role="status" data-testid="open-in-app">
          <span className="state-mark">
            <img src="/brand/app-icon.svg" alt="" />
          </span>
          <div>
            <h1>
              <Words text="Opening the Vero app" />
            </h1>
            <p className="lead">You asked for this link from the app, so it signs you in there.</p>
          </div>
        </div>
        <a className="cta" href={appLink(token)}>
          Open the Vero app
        </a>
        <p className="lead">
          Nothing happened? Copy this page&apos;s address and paste it into the app, or{' '}
          <button type="button" className="link" onClick={() => setInBrowser(true)}>
            sign in on this browser instead
          </button>
          .
        </p>
      </SignInFrame>
    );
  }

  if (sentTo) {
    return (
      <SignInFrame top={SIGN_UP_TOP}>
        <CheckEmail email={sentTo} onReset={() => setSentTo(null)} />
      </SignInFrame>
    );
  }
  if (state.kind === 'working') {
    return (
      <SignInFrame top={SIGN_UP_TOP}>
        <div className="reading" role="status">
          <span className="state-mark">
            <img src="/brand/app-icon.svg" alt="" />
          </span>
          <div>
            <h1>
              <Words text="Signing you in" />
            </h1>
            <p className="lead">Checking your link. This takes a moment.</p>
          </div>
        </div>
      </SignInFrame>
    );
  }
  if (state.kind === 'failed') {
    return (
      <SignInFrame top={SIGN_UP_TOP}>
        <div role="alert" data-testid="verify-failed">
          <h1>
            <Words text="We couldn't sign you in" />
          </h1>
          <p className="lead">{state.error.message}</p>
          <button className="cta" type="button" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      </SignInFrame>
    );
  }
  const words = {
    used: { title: 'This link has already been used', body: "Each sign-in link works once. Enter your email and we'll send a new one.", id: 'link-used' },
    expired: { title: 'This link has expired', body: "Sign-in links last 15 minutes, so this one has run out. Enter your email and we'll send a new one.", id: 'link-expired' },
    invalid: { title: "This link isn't valid", body: "Part of the link may be missing. Enter your email and we'll send a new one.", id: 'link-invalid' },
  }[state.kind];
  return (
    <SignInFrame top={SIGN_UP_TOP}>
      <div data-testid={words.id}>
        <h1>
          <Words text={words.title} />
        </h1>
        <p className="lead">{words.body}</p>
      </div>
      <EmailForm onSent={setSentTo} buttonLabel="Send a new link" />
    </SignInFrame>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}

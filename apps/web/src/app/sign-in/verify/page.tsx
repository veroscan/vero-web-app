'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { CheckEmail, EmailForm } from '@/components/EmailForm';
import { SignInFrame } from '@/components/SignInFrame';
import { api, asApiError, type ApiError } from '@/lib/api';
import { peekNext, takeNext } from '@/lib/next-path';

type State = { kind: 'working' } | { kind: 'expired' } | { kind: 'used' } | { kind: 'invalid' } | { kind: 'failed'; error: ApiError };

function Verify() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
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
  }, [token, attempt, router]);

  if (sentTo) {
    return (
      <SignInFrame>
        <CheckEmail email={sentTo} onReset={() => setSentTo(null)} />
      </SignInFrame>
    );
  }
  if (state.kind === 'working') {
    return (
      <SignInFrame>
        <div role="status">
          <h1 className="t-1">Signing you in</h1>
        </div>
      </SignInFrame>
    );
  }
  if (state.kind === 'failed') {
    return (
      <SignInFrame>
        <div className="stack g20" role="alert" data-testid="verify-failed">
          <h1 className="t-1">We couldn&apos;t sign you in</h1>
          <p className="quiet">{state.error.message}</p>
          <div>
            <button className="btn btn-ink" type="button" onClick={() => setAttempt((value) => value + 1)}>
              Try again
            </button>
          </div>
        </div>
      </SignInFrame>
    );
  }
  const words = {
    used: { title: 'This link has already been used', body: 'Each sign-in link works once. Enter your email and we\'ll send a new one.', id: 'link-used' },
    expired: { title: 'This link has expired', body: "Sign-in links last 15 minutes, so this one has run out. Enter your email and we'll send a new one.", id: 'link-expired' },
    invalid: { title: "This link isn't valid", body: "Part of the link may be missing. Enter your email and we'll send a new one.", id: 'link-invalid' },
  }[state.kind];
  return (
    <SignInFrame>
      <div className="stack g8" data-testid={words.id}>
        <h1 className="t-1">{words.title}</h1>
        <p className="quiet">{words.body}</p>
      </div>
      <EmailForm onSent={setSentTo} buttonLabel="Send a new link" animate={false} />
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

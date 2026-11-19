'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { Arrow } from '@/components/Bits';
import { Words } from '@/components/Motion';
import { SignInFrame } from '@/components/SignInFrame';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { safeNext, takeNext } from '@/lib/next-path';

type Mode = 'app' | 'recovery';

function TwoStep() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('app');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const switchTo = (next: Mode) => {
    setMode(next);
    setCode('');
    setProblem(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      if (mode === 'app') {
        await api.auth.totpChallenge({ body: { code } });
      } else {
        const result = await api.auth.recoveryChallenge({ body: { code } });
        const left = result.recoveryCodesLeft;
        if (left !== undefined) toast(left === 0 ? 'That was your last recovery code. Make new ones in Settings.' : `Signed in. ${left} recovery ${left === 1 ? 'code' : 'codes'} left.`);
      }
      const remembered = takeNext();
      router.replace(safeNext(params.get('next')) ?? remembered ?? '/');
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  const startOver = async () => {
    try {
      await api.auth.logout();
    } finally {
      window.location.assign('/sign-in');
    }
  };

  const app = mode === 'app';
  return (
    <SignInFrame>
      <h1>
        <Words key={mode} text={app ? 'Enter your code' : 'Use a recovery code'} />
      </h1>
      <p className="lead">{app ? 'Open your authenticator app and type the 6-digit code for Vero.' : 'Type one of the recovery codes you saved when you turned on two-step sign-in. Each one works once.'}</p>
      <form onSubmit={(event) => void submit(event)} noValidate>
        <div className={`field${problem ? ' bad' : ''}`}>
          {app ? (
            <>
              <label htmlFor="code">6-digit code</label>
              <input
                className="code"
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                aria-invalid={problem ? true : undefined}
                aria-describedby={problem ? 'code-problem' : undefined}
              />
            </>
          ) : (
            <>
              <label htmlFor="rcode">Recovery code</label>
              <input
                className="rcode"
                id="rcode"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="abcde-12345"
                maxLength={20}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                aria-invalid={problem ? true : undefined}
                aria-describedby={problem ? 'code-problem' : undefined}
              />
            </>
          )}
        </div>
        {problem ? (
          <p className="formerror" id="code-problem" role="alert">
            {problem}
          </p>
        ) : null}
        <button className="cta" type="submit" disabled={busy}>
          {busy ? 'Checking' : 'Continue'}
          {busy ? null : <Arrow />}
        </button>
      </form>
      <p className="alt">
        {app ? (
          <>
            No access to your app?{' '}
            <button type="button" onClick={() => switchTo('recovery')}>
              Use a recovery code
            </button>
          </>
        ) : (
          <>
            Have your app?{' '}
            <button type="button" onClick={() => switchTo('app')}>
              Use a code from the app
            </button>
          </>
        )}
        <br />
        Wrong account?{' '}
        <button type="button" onClick={() => void startOver()}>
          Start again
        </button>
      </p>
    </SignInFrame>
  );
}

export default function Page() {
  return (
    <Suspense>
      <TwoStep />
    </Suspense>
  );
}

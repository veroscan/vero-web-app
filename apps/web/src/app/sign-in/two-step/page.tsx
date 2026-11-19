'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';
import { SignInFrame } from '@/components/SignInFrame';
import { api, asApiError } from '@/lib/api';
import { safeNext, takeNext } from '@/lib/next-path';

function TwoStep() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      await api.auth.totpChallenge({ body: { code } });
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

  return (
    <SignInFrame>
      <div className="stack g8">
        <h1 className="t-1">Enter your code</h1>
        <p className="quiet">Open your authenticator app and type the 6-digit code for Vero.</p>
      </div>
      <form className="stack g16" onSubmit={(event) => void submit(event)} noValidate>
        <div className="field">
          <label htmlFor="code">6-digit code</label>
          <input className="input num" id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} aria-invalid={problem ? true : undefined} aria-describedby={problem ? 'code-problem' : undefined} />
        </div>
        {problem ? (
          <p className="formerror" id="code-problem" role="alert">
            {problem}
          </p>
        ) : null}
        <button className="btn btn-ink" type="submit" style={{ width: '100%' }} disabled={busy}>
          {busy ? 'Checking' : 'Continue'}
        </button>
      </form>
      <p className="small">
        Wrong account?{' '}
        <button className="link" type="button" style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }} onClick={() => void startOver()}>
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

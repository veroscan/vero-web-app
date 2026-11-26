'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { Arrow } from '@/components/Bits';
import { Busy } from '@/components/EmailForm';
import { Words } from '@/components/Motion';
import { SignInFrame } from '@/components/SignInFrame';
import { useToast } from '@/components/Toast';
import { api, asApiError } from '@/lib/api';
import { safeNext, takeNext } from '@/lib/next-path';

type Mode = 'app' | 'recovery';
const DIGITS = 6;

function TwoStep() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('app');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const field = useRef<HTMLInputElement>(null);

  // The code is the only thing to do here, so the keyboard starts in it, and returns to it when the way in changes.
  useEffect(() => {
    field.current?.focus({ preventScroll: true });
  }, [mode]);

  const switchTo = (next: Mode) => {
    setMode(next);
    setCode('');
    setProblem(null);
  };

  /** Digits only, however they arrive: typed, pasted with spaces, or filled in by the phone. */
  const typeDigits = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, DIGITS));
    setProblem(null);
  };

  /** The boxes fill left to right, so the caret always sits after the last digit. */
  const caretToEnd = () => {
    const input = field.current;
    if (input && (input.selectionStart !== input.value.length || input.selectionEnd !== input.value.length)) input.setSelectionRange(input.value.length, input.value.length);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const value = code.trim();
    if (mode === 'app' && value.length < DIGITS) {
      setProblem(value ? `That is ${value.length} of the ${DIGITS} digits. Type the whole code.` : 'Type the 6-digit code from your authenticator app.');
      field.current?.focus();
      return;
    }
    if (mode === 'recovery' && !value) {
      setProblem('Type one of your recovery codes.');
      field.current?.focus();
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      if (mode === 'app') {
        await api.auth.totpChallenge({ body: { code: value } });
      } else {
        const result = await api.auth.recoveryChallenge({ body: { code: value } });
        const left = result.recoveryCodesLeft;
        if (left !== undefined) toast(left === 0 ? 'That was your last recovery code. Make new ones in Settings.' : `Signed in. ${left} recovery ${left === 1 ? 'code' : 'codes'} left.`);
      }
      const remembered = takeNext();
      router.replace(safeNext(params.get('next')) ?? remembered ?? '/scan');
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
      // A code from the app is spent or wrong as a whole, so the boxes empty for the next one.
      if (mode === 'app') setCode('');
      field.current?.focus();
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
      <form onSubmit={(event) => void submit(event)} noValidate aria-busy={busy || undefined}>
        <div className={`field${problem ? ' bad' : ''}`}>
          {app ? (
            <>
              <label htmlFor="code">6-digit code</label>
              <div className="otp">
                <input
                  ref={field}
                  className="code"
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  value={code}
                  readOnly={busy}
                  onChange={(event) => typeDigits(event.target.value)}
                  onSelect={caretToEnd}
                  onFocus={caretToEnd}
                  aria-invalid={problem ? true : undefined}
                  aria-describedby={problem ? 'code-problem' : undefined}
                />
                {Array.from({ length: DIGITS }, (_, index) => {
                  const digit = code[index];
                  const at = index === Math.min(code.length, DIGITS - 1);
                  return (
                    <span key={index} className={`slot${digit ? ' full' : ''}${at ? ' at' : ''}${index === DIGITS / 2 ? ' gap' : ''}`} aria-hidden="true">
                      {digit ? <span>{digit}</span> : null}
                    </span>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <label htmlFor="rcode">Recovery code</label>
              <input
                ref={field}
                className="rcode"
                id="rcode"
                name="recovery-code"
                type="text"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                placeholder="abcde-12345"
                maxLength={20}
                value={code}
                readOnly={busy}
                onChange={(event) => {
                  setCode(event.target.value);
                  setProblem(null);
                }}
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
          {busy ? <Busy /> : null}
          {busy ? 'Checking' : 'Continue'}
          {busy ? null : <Arrow />}
        </button>
      </form>
      <p className="alt">
        <span>
          {app ? 'No access to your app?' : 'Have your app?'}
          <button type="button" onClick={() => switchTo(app ? 'recovery' : 'app')}>
            {app ? 'Use a recovery code' : 'Use a code from the app'}
          </button>
        </span>
        <span>
          Wrong account?
          <button type="button" onClick={() => void startOver()}>
            Start again
          </button>
        </span>
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

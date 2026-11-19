'use client';

import { useState, type FormEvent } from 'react';
import { api, asApiError } from '@/lib/api';

/** Asks for a sign-in link. Used on the sign-in page and when a link has stopped working. */
export function EmailForm({ onSent, buttonLabel = 'Continue', animate = true }: { onSent: (email: string) => void; buttonLabel?: string; animate?: boolean }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const motion = (n: number) => (animate ? { className: 'si-in', style: { '--n': n } as React.CSSProperties } : {});

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setProblem(null);
    try {
      await api.auth.requestMagicLink({ body: { email } });
      onSent(email.trim().toLowerCase());
    } catch (error) {
      setProblem(asApiError(error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="stack g16" onSubmit={(event) => void submit(event)} noValidate>
      <div className={`field${animate ? ' si-in' : ''}`} style={animate ? ({ '--n': 1 } as React.CSSProperties) : undefined}>
        <label htmlFor="email">Work email</label>
        <input className="input" id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} aria-describedby={problem ? 'email-problem' : undefined} aria-invalid={problem ? true : undefined} />
      </div>
      {problem ? (
        <p className="formerror" id="email-problem" role="alert">
          {problem}
        </p>
      ) : null}
      <div {...motion(2)}>
        <button className="btn btn-ink" type="submit" style={{ width: '100%' }} aria-disabled={busy} disabled={busy}>
          {busy ? 'Sending' : buttonLabel}
        </button>
      </div>
    </form>
  );
}

export function CheckEmail({ email, onReset }: { email: string; onReset: () => void }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [problem, setProblem] = useState<string | null>(null);
  const again = async () => {
    setState('sending');
    setProblem(null);
    try {
      await api.auth.requestMagicLink({ body: { email } });
      setState('sent');
    } catch (error) {
      setProblem(asApiError(error).message);
      setState('idle');
    }
  };
  return (
    <div className="stack g20" data-testid="check-email">
      <div className="stack g8">
        <h1 className="t-1">Check your email</h1>
        <p className="quiet">
          We sent a sign-in link to <span className="b">{email}</span>. It works once and expires in 15 minutes.
        </p>
      </div>
      {process.env.NODE_ENV !== 'production' ? <p className="note">In development, the link is in the API log and the outbox table.</p> : null}
      {problem ? (
        <p className="formerror" role="alert">
          {problem}
        </p>
      ) : null}
      <div className="btns">
        <button className="btn btn-line btn-sm" type="button" disabled={state === 'sending'} onClick={() => void again()}>
          {state === 'sent' ? 'Sent again' : state === 'sending' ? 'Sending' : 'Send it again'}
        </button>
        <button className="btn btn-line btn-sm" type="button" onClick={onReset}>
          Use a different email
        </button>
      </div>
    </div>
  );
}

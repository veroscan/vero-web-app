'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { api, asApiError } from '@/lib/api';
import { Arrow } from './Bits';
import { Words } from './Motion';
import { TLink } from './TLink';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/** How long before another link can be asked for, so a double press can't flood an inbox. */
const RESEND_WAIT_SECONDS = 30;

/** What went wrong with the address, in words that say how to fix it. Null when it looks right. */
function emailProblem(value: string): string | null {
  if (!value) return 'Enter your email address.';
  if (/\s/.test(value)) return 'An email address has no spaces. Check it and try again.';
  if (!value.includes('@')) return 'That is missing an @. Enter an address like name@company.com.';
  if (!EMAIL.test(value)) return 'That address looks incomplete. Enter one like name@company.com.';
  if (value.length > 254) return 'That address is too long. Check it and try again.';
  return null;
}

/** The small turning ring on a button that is working. */
export function Busy() {
  return <span className="spin" aria-hidden="true" />;
}

/** Asks for a sign-in link. Used on sign in, sign up, and when a link has stopped working. */
export function EmailForm({ onSent, buttonLabel = 'Email me a sign-in link', invitationToken }: { onSent: (email: string) => void; buttonLabel?: string; invitationToken?: string }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // Ready to type on a desk. On a phone the keyboard would cover the page before it has been read.
  useEffect(() => {
    if (window.matchMedia('(min-width: 901px) and (hover: hover)').matches) input.current?.focus({ preventScroll: true });
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const value = email.trim();
    const wrong = emailProblem(value);
    if (wrong) {
      setProblem(wrong);
      input.current?.focus();
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      await api.auth.requestMagicLink({ body: { email: value, ...(invitationToken ? { invitationToken } : {}) } });
      onSent(value.toLowerCase());
    } catch (error) {
      setProblem(asApiError(error).message);
      input.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} noValidate aria-busy={busy || undefined}>
      <div className={`field${problem ? ' bad' : ''}`}>
        <label htmlFor="email">Work email</label>
        <input
          ref={input}
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="send"
          placeholder="you@company.com"
          required
          readOnly={busy}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setProblem(null);
          }}
          aria-describedby={problem ? 'email-problem' : undefined}
          aria-invalid={problem ? true : undefined}
        />
      </div>
      {problem ? (
        <p className="formerror" id="email-problem" role="alert">
          {problem}
        </p>
      ) : null}
      <button className="cta" type="submit" disabled={busy}>
        {busy ? <Busy /> : null}
        {busy ? 'Sending' : buttonLabel}
        {busy ? null : <Arrow />}
      </button>
    </form>
  );
}

/** The envelope with the sign-in letter half out: the link is on its way. */
function Envelope() {
  return (
    <svg className="env" viewBox="0 0 132 108" aria-hidden="true">
      <rect className="e-back" x="16" y="34" width="100" height="66" rx="10" />
      <g className="letter">
        <rect className="e-paper" x="28" y="6" width="76" height="70" rx="8" />
        <rect className="e-head" x="38" y="18" width="34" height="5" rx="2.5" />
        <rect className="e-line" x="38" y="30" width="56" height="4" rx="2" />
        <rect className="e-line" x="38" y="39" width="46" height="4" rx="2" />
        <rect className="e-btn" x="38" y="50" width="40" height="12" rx="4" />
      </g>
      <path className="e-front" d="M16 46 66 76l50-30v44a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10z" />
      <path className="e-fold" d="M16 100 56 70M116 100 76 70" strokeWidth="2" />
    </svg>
  );
}

export function CheckEmail({ email, onReset, invitationToken }: { email: string; onReset: () => void; invitationToken?: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [problem, setProblem] = useState<string | null>(null);
  // A link has just gone, so the first resend waits as well.
  const [wait, setWait] = useState(RESEND_WAIT_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const again = async () => {
    if (state === 'sending' || wait > 0) return;
    setState('sending');
    setProblem(null);
    try {
      await api.auth.requestMagicLink({ body: { email, ...(invitationToken ? { invitationToken } : {}) } });
      setState('sent');
      setWait(RESEND_WAIT_SECONDS);
    } catch (error) {
      setProblem(asApiError(error).message);
      setState('idle');
    }
  };
  const waiting = wait > 0;
  return (
    <div className="sent" data-testid="check-email">
      <Envelope />
      <h1>
        <Words text="Check your inbox" />
      </h1>
      <p className="lead">
        We sent a sign-in link to <b>{email}</b>. Open it on this device and you&apos;ll land straight in Vero. It works once and expires in 15 minutes.
      </p>
      {problem ? (
        <p className="formerror" role="alert">
          {problem}
        </p>
      ) : null}
      <div className="row">
        <button type="button" disabled={state === 'sending' || waiting} onClick={() => void again()} data-testid="send-again">
          {state === 'sending' ? <Busy /> : null}
          {state === 'sending' ? 'Sending' : waiting ? (
            <>
              Send it again in <span className="num">{wait}s</span>
            </>
          ) : 'Send it again'}
        </button>
        <button type="button" onClick={onReset}>
          Use a different email
        </button>
      </div>
      <p className="legal" role="status">
        {state === 'sent' ? 'Sent again. Check your spam folder too.' : 'Nothing yet? It can take a minute. Check your spam folder too.'}
      </p>
      {process.env.NODE_ENV !== 'production' ? <p className="note devnote">In development, the link is in the API log and the outbox table.</p> : null}
    </div>
  );
}

/** The magic-link legal line under the form on sign in and sign up. */
export function LegalLine({ lead }: { lead: string }) {
  return (
    <p className="legal">
      {lead} By continuing you agree to the <TLink href="/legal/terms">terms</TLink> and <TLink href="/legal/privacy">privacy policy</TLink>.
    </p>
  );
}

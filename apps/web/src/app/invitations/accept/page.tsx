'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Loading } from '@/components/Bits';
import { Scramble, Words } from '@/components/Motion';
import { PublicHero } from '@/components/PublicBar';
import { api, asApiError } from '@/lib/api';
import { rememberNext } from '@/lib/next-path';

/**
 * Where the email's invite link lands. Joining takes a press of a button, so a mail scanner that
 * opens the link can't use the invite up.
 */
function Accept() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<{ message: string; kind: 'wrong-email' | 'ended' | 'other' } | null>(null);

  const join = async () => {
    if (busy) return;
    setBusy(true);
    setProblem(null);
    try {
      await api.invitations.accept({ body: { token } });
      window.location.assign('/');
    } catch (error) {
      const failure = asApiError(error);
      // A different address needs a different sign-in, and an ended invite can't be retried: only other failures can.
      setProblem({ message: failure.message, kind: failure.code === 'invitation_wrong_email' ? 'wrong-email' : failure.code === 'invitation_invalid' ? 'ended' : 'other' });
      setBusy(false);
    }
  };

  const useAnotherEmail = async () => {
    rememberNext(`/invitations/accept?token=${encodeURIComponent(token)}`);
    await api.auth.logout().catch(() => undefined);
    window.location.assign('/sign-in');
  };

  return (
    <main className="msg" data-testid="invitation">
      <div className="glass invite">
        <span className="mono kick">
          <Scramble text="Invitation" />
        </span>
        <h1>
          <Words text="You've been invited to join a team on Vero" delay={80} />
        </h1>
        {token ? (
          <>
            <p>You&apos;ll see their companies, documents and scores, as far as your role allows.</p>
            {problem ? (
              <p className="formerror" role="alert" data-testid="invitation-problem">
                {problem.message}
                {problem.kind === 'ended' ? ' Ask the person who invited you for a new one.' : ''}
              </p>
            ) : null}
            <div className="btns">
              {!problem || problem.kind === 'other' ? (
                <button className="btn btn-w btn-lg" type="button" disabled={busy} aria-busy={busy || undefined} onClick={() => void join()}>
                  {busy ? <span className="spin" aria-hidden="true" /> : null}
                  {busy ? 'Joining' : problem ? 'Try again' : 'Join the team'}
                </button>
              ) : null}
              {problem?.kind === 'wrong-email' ? (
                <button className="btn btn-w btn-lg" type="button" onClick={() => void useAnotherEmail()}>
                  Sign in with another email
                </button>
              ) : null}
              {problem ? (
                <a className={`btn btn-lg ${problem.kind === 'ended' ? 'btn-w' : 'btn-g'}`} href="/">
                  Go to your home page
                </a>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <p className="formerror" role="alert" data-testid="invitation-problem">
              This invitation link isn&apos;t complete. Open it again from the email, or ask the person who invited you for a new one.
            </p>
            <div className="btns">
              <a className="btn btn-g btn-lg" href="/">
                Go to your home page
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function InvitationPage() {
  return (
    <div className="pg-pub">
      <PublicHero size="tall">
        <Suspense fallback={<Loading what="Getting your invitation" />}>
          <Accept />
        </Suspense>
      </PublicHero>
    </div>
  );
}

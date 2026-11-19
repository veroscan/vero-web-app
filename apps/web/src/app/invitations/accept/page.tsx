'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Loading } from '@/components/Bits';
import { PublicBar } from '@/components/PublicBar';
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
  const [problem, setProblem] = useState<{ message: string; wrongEmail: boolean } | null>(null);

  const join = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await api.invitations.accept({ body: { token } });
      window.location.assign('/');
    } catch (error) {
      const failure = asApiError(error);
      setProblem({ message: failure.message, wrongEmail: failure.code === 'invitation_wrong_email' });
      setBusy(false);
    }
  };

  const useAnotherEmail = async () => {
    rememberNext(`/invitations/accept?token=${encodeURIComponent(token)}`);
    await api.auth.logout().catch(() => undefined);
    window.location.assign('/sign-in');
  };

  return (
    <main className="state" data-testid="invitation">
      <h1 className="t-2">You&apos;ve been invited to join a team on Vero Scan</h1>
      {token ? (
        <>
          <p className="quiet">You&apos;ll see their companies, documents and scores, as far as your role allows.</p>
          {problem ? (
            <p className="formerror" role="alert" data-testid="invitation-problem">
              {problem.message}
            </p>
          ) : null}
          <div className="btns">
            <button className="btn btn-ink" type="button" disabled={busy} onClick={() => void join()}>
              {busy ? 'Joining' : 'Join the team'}
            </button>
            {problem?.wrongEmail ? (
              <button className="btn btn-line" type="button" onClick={() => void useAnotherEmail()}>
                Sign in with another email
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <p className="formerror" role="alert" data-testid="invitation-problem">
          This invitation link isn&apos;t complete. Ask for a new one.
        </p>
      )}
    </main>
  );
}

export default function InvitationPage() {
  return (
    <div className="vs">
      <PublicBar />
      <Suspense fallback={<Loading what="Getting your invitation" />}>
        <Accept />
      </Suspense>
    </div>
  );
}

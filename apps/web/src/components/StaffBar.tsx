'use client';

import type { ApiError } from '@vero/shared';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import '@/app/styles/pages/staff.css';
import { api } from '@/lib/api';
import { PublicMessage } from './PublicBar';
import { ThemeToggle } from './Theme';
import { NavigationDone, TLink } from './TLink';

const TABS = [
  { href: '/review/work', label: 'Company look-ups', on: (path: string) => path.startsWith('/review/work') },
  { href: '/admin', label: 'Rule packs and admin', on: (path: string) => path.startsWith('/admin') },
];

/** The review desk's own header. It only draws once the API has let this person in. */
export function StaffBar() {
  const pathname = usePathname();
  const [failed, setFailed] = useState(false);
  const signOut = () => {
    setFailed(false);
    api.auth.logout().then(
      () => window.location.assign('/sign-in'),
      () => setFailed(true),
    );
  };
  return (
    <header className="deskbar">
      <NavigationDone />
      <div className="brand">
        <TLink href="/review/work" aria-label="Vero staff desk">
          <img className="light-only" src="/brand/wordmark-dark.svg" alt="Vero" />
          <img className="dark-only" src="/brand/wordmark-light.svg" alt="Vero" />
        </TLink>
        <span>Review desk</span>
      </div>
      <nav aria-label="Review desk">
        {TABS.map((tab) => (
          <TLink key={tab.href} className={tab.on(pathname) ? 'on' : undefined} href={tab.href} aria-current={tab.on(pathname) ? 'page' : undefined}>
            {tab.label}
          </TLink>
        ))}
      </nav>
      <div className="tools">
        <button className="btn btn-g btn-sm" type="button" onClick={signOut}>
          Sign out
        </button>
        <ThemeToggle />
      </div>
      {failed ? (
        <p className="formerror" role="alert">
          We couldn&apos;t sign you out. Check your connection and try again.
        </p>
      ) : null}
    </header>
  );
}

/** Someone without staff access sees this and nothing else. The API has already refused them. */
export function StaffRefused({ adminOnly = false }: { adminOnly?: boolean }) {
  return (
    <PublicMessage kicker="Staff only" title="You don't have access to this" testId="staff-refused">
      <p>
        {adminOnly ? "This part of Vero is for Vero's admins." : "This part of Vero is for Vero's review desk."} Your account isn&apos;t on it, and we&apos;ve noted the attempt.
      </p>
      <div className="btns">
        <TLink className="btn btn-w btn-lg" href="/">
          Go to your home page
        </TLink>
      </div>
    </PublicMessage>
  );
}

export function isRefused(error: ApiError | null | undefined): boolean {
  return error?.status === 403;
}

/** The desk's frame: the bar, then the page. */
export function StaffPage({ children }: { children: ReactNode }) {
  return (
    <div className="pg-staff">
      <StaffBar />
      <main className="content">{children}</main>
    </div>
  );
}

'use client';

import type { ApiError } from '@vero/shared';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
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
    <header className="bar deskbar">
      <NavigationDone />
      <div className="btns" style={{ gap: 16 }}>
        <TLink href="/review/work" aria-label="Vero staff desk">
          <img src="/vero-lockup.svg" alt="Vero Scan" />
        </TLink>
        <span className="b" style={{ fontSize: 15.5 }}>
          Review desk
        </span>
      </div>
      <nav className="tabs" aria-label="Review desk">
        {TABS.map((tab) => (
          <TLink key={tab.href} className={tab.on(pathname) ? 'on' : undefined} href={tab.href} aria-current={tab.on(pathname) ? 'page' : undefined}>
            {tab.label}
          </TLink>
        ))}
      </nav>
      <div className="tools">
        <button className="btn btn-line btn-sm" type="button" onClick={signOut}>
          Sign out
        </button>
        <ThemeToggle />
      </div>
      {failed ? (
        <p className="formerror" role="alert" style={{ flexBasis: '100%' }}>
          We couldn&apos;t sign you out. Check your connection and try again.
        </p>
      ) : null}
    </header>
  );
}

/** Someone without staff access sees this and nothing else. The API has already refused them. */
export function StaffRefused({ adminOnly = false }: { adminOnly?: boolean }) {
  return (
    <div className="vs">
      <main className="state" data-testid="staff-refused">
        <h1 className="t-2">You don&apos;t have access to this</h1>
        <p className="quiet">{adminOnly ? "This part of Vero Scan is for Code & Clause's admins." : "This part of Vero Scan is for Code & Clause's review desk."} Your account isn&apos;t on it, and we&apos;ve noted the attempt.</p>
        <TLink className="btn btn-line btn-sm" href="/">
          Go to your home page
        </TLink>
      </main>
    </div>
  );
}

export function isRefused(error: ApiError | null | undefined): boolean {
  return error?.status === 403;
}

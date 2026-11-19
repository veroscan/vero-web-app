'use client';

import { ThemeToggle } from './Theme';

/** The top bar of a page anyone can open with a link. Nothing here needs an account. */
export function PublicBar({ sharedBy }: { sharedBy?: string }) {
  return (
    <header className="bar publicbar">
      <img src="/vero-lockup.svg" alt="Vero Scan" />
      {sharedBy ? <span className="quiet sharedby">Shared by {sharedBy}</span> : null}
      <div className="tools">
        <ThemeToggle />
      </div>
    </header>
  );
}

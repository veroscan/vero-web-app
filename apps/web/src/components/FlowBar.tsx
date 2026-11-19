'use client';

import { ThemeToggle } from './Theme';
import { TLink } from './TLink';

/** The plain top bar of a screen you step into and close again, as in the designs. */
export function FlowBar({ closeHref, closeRight = false }: { closeHref: string; closeRight?: boolean }) {
  return (
    <header className={`bar${closeRight ? ' closebar' : ''}`}>
      <img src="/vero-lockup.svg" alt="Vero Scan" />
      <TLink className="small" href={closeHref}>
        Close
      </TLink>
      <div className="tools">
        <ThemeToggle />
      </div>
    </header>
  );
}

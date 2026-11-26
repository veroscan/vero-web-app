'use client';

import type { ReactNode } from 'react';
import '@/app/styles/pages/public.css';
import { Atmos, FlowLines, Scramble, Words } from './Motion';
import { ThemeToggle } from './Theme';

/** The top bar of a page anyone can open with a link. Nothing here needs an account. */
export function PublicBar({ sharedBy }: { sharedBy?: ReactNode }) {
  return (
    <header className="pubbar">
      <div className="in">
        <a href="/" aria-label="Vero">
          <img src="/brand/wordmark-light.svg" alt="Vero" />
        </a>
        {sharedBy ? <span className="by">{sharedBy}</span> : null}
        <ThemeToggle />
      </div>
    </header>
  );
}

/**
 * The navy atmosphere every public page opens on, with the bar on top. `tall` fills the window
 * for a single message (not found, an ended link); `short` is a slim head over a page of words.
 */
export function PublicHero({ children, sharedBy, size }: { children: ReactNode; sharedBy?: ReactNode; size?: 'tall' | 'short' }) {
  return (
    <div className={`hero on-dark${size ? ` ${size}` : ''}`}>
      <Atmos />
      <FlowLines />
      <PublicBar sharedBy={sharedBy} />
      {children}
    </div>
  );
}

/** One message on the atmosphere: a kicker, a light headline, a sentence and the way on. */
export function PublicMessage({ kicker, title, children, art, testId, role }: { kicker?: string; title: string; children?: ReactNode; art?: ReactNode; testId?: string; role?: 'alert' | 'status' }) {
  return (
    <div className="pg-pub">
      <PublicHero size="tall">
        <main className="msg" data-testid={testId} role={role}>
          {art}
          {kicker ? (
            <span className="mono kick">
              <Scramble text={kicker} />
            </span>
          ) : null}
          <h1 className="disp">
            <Words text={title} delay={80} />
          </h1>
          {children}
        </main>
      </PublicHero>
    </div>
  );
}

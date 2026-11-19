'use client';

import { useEffect, useState, type ReactNode } from 'react';
import '@/app/styles/pages/auth.css';
import { prefersCalm } from '@/lib/motion';
import { Atmos, FlowLines, Scramble, Words } from './Motion';
import { ThemeToggle } from './Theme';

/** What every scan reads, in the order it reads it. A picture of the method, not anyone's results. */
const READS = [
  { what: 'Company register', how: 'Standing, officers and filings', word: 'Read at the source' },
  { what: 'Filing deadlines', how: 'What is due, and what is late', word: 'Dates worked out' },
  { what: 'Other official registers', how: 'Data protection, trademarks, sanctions', word: 'Checked where they exist' },
  { what: 'The documents you add', how: 'Contracts, share records, IP', word: 'Matched to the registers' },
];

/** The glass card on the left. Each line is ticked off once, then the card holds still. */
function ScanPreview() {
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (prefersCalm()) {
      setDone(READS.length);
      return;
    }
    let step = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const next = () => {
      step += 1;
      setDone(step);
      if (step < READS.length) timers.push(setTimeout(next, 1000));
    };
    timers.push(setTimeout(next, 900));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="glass preview" aria-hidden="true">
      {done < READS.length ? <span className="scanline" /> : null}
      <div className="pv-top">
        <div>
          <b>What a scan reads</b>
          <small>For a company in any country, as far as its registers allow</small>
        </div>
        <div className="sc">
          <span className="pixel">{done}</span>
          <small>of {READS.length}</small>
        </div>
      </div>
      <div className="checks">
        {READS.map((read, index) => (
          <div key={read.what} className={`ck${index < done ? ' done' : ''}`}>
            <div>
              <b>{read.what}</b>
              <small>{read.how}</small>
            </div>
            <span className="s">{read.word}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface SideWords {
  kicker: string;
  kickerBold: string;
  display: string;
  lede: string;
}

export const SIGN_IN_SIDE: SideWords = {
  kicker: 'Welcome back',
  kickerBold: 'Your companies',
  display: 'Pick up where your last scan left off.',
  lede: 'Sign in to see what Vero found, what has changed since, and what to do next.',
};

export const SIGN_UP_SIDE: SideWords = {
  kicker: 'Company legal health',
  kickerBold: 'Scan, score, fix',
  display: 'Know where any company stands.',
  lede: 'Vero checks a company against official government registers and its own documents, then shows what is in order and what is missing.',
};

/**
 * The auth layout from the SignIn and SignUp boards: the navy atmosphere with the brand and a calm
 * line on the left, the form on the right. `top` is the line above the form (the way to the other page).
 */
export function SignInFrame({ children, top, side = SIGN_IN_SIDE, preview = true }: { children: ReactNode; top?: ReactNode; side?: SideWords; preview?: boolean }) {
  return (
    <div className="pg-auth">
      <section className="left on-dark">
        <Atmos />
        <FlowLines />
        <a href="/" aria-label="Vero">
          <img className="logo" src="/brand/wordmark-light.svg" alt="Vero" />
        </a>
        <div className="mono kick">
          <Scramble text={side.kicker} /> · <b>
            <Scramble text={side.kickerBold} delay={160} />
          </b>
        </div>
        <p className="display disp">
          <Words text={side.display} delay={120} />
        </p>
        <p className="lede">{side.lede}</p>
        {preview ? <ScanPreview /> : null}
        <div className="foot">
          <span>Scans companies in any country</span>
          <span>Says plainly how much it can check there</span>
        </div>
      </section>
      <main className="right">
        <div className="top">
          {top ? <span>{top}</span> : null}
          <ThemeToggle />
        </div>
        <div className="form">{children}</div>
      </main>
    </div>
  );
}

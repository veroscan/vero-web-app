'use client';

import type { ReactNode } from 'react';
import { BlurIn } from './Bits';
import { ThemeToggle } from './Theme';
import { V_PATH, VHero } from './V3D';

/** The split sign-in layout: the dark stage with the V, and the form beside it. */
export function SignInFrame({ children }: { children: ReactNode }) {
  return (
    <div className="vs si">
      <div className="stage si-stage">
        <VHero style={{ position: 'absolute', inset: 0 }}>
          <svg className="si-v" viewBox="0 0 132 100">
            <defs>
              <linearGradient id="si-enamel" x1="0" y1="0" x2=".55" y2="1">
                <stop offset="0" stopColor="#F08AA8" />
                <stop offset=".55" stopColor="#E06A90" />
                <stop offset="1" stopColor="#B03C64" />
              </linearGradient>
            </defs>
            <path d={V_PATH} />
          </svg>
        </VHero>
        <div className="si-haze" />
        <img className="si-logo" src="/vero-lockup-dark.svg" alt="Vero Scan" />
        <p className="si-line">
          <BlurIn text="Know exactly where your company stands." delay={0.3} />
        </p>
      </div>
      <main className="si-main">
        <div className="tools si-tools">
          <ThemeToggle />
        </div>
        <div className="stack g32 si-form">{children}</div>
      </main>
    </div>
  );
}

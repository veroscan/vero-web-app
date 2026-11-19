'use client';

import { useEffect, useId, type CSSProperties, type ReactNode } from 'react';

const SCRIPT_SRC = '/vero-3d.js';
export const V_PATH =
  'M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z';

/** Added once, by the first screen that shows a V. The script then watches the page itself. */
function useV3DScript(): void {
  useEffect(() => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);
}

interface FillProps {
  value: number;
  className?: string;
  label?: string;
  /** The colour of the empty part of the flat V. */
  back?: string;
  front?: string;
}

/** The V that fills with the real score. The flat V stays underneath if 3D can't run. */
export function VFill({ value, className = 'gauge', label, back = 'var(--line)', front = 'var(--rose)' }: FillProps) {
  useV3DScript();
  const clipId = useId();
  const level = Math.max(0, Math.min(100, value));
  return (
    <div className={className} data-v3d="fill" data-value={level} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      <div className="v3d-fallback">
        <svg viewBox="0 0 132 100" width="100%" aria-hidden="true">
          <defs>
            <clipPath id={clipId}>
              <rect width="132" height="100" y={100 - level} style={{ transition: 'y 1s var(--ease)' }} />
            </clipPath>
          </defs>
          <path d={V_PATH} style={{ fill: back }} />
          <path d={V_PATH} clipPath={`url(#${clipId})`} style={{ fill: front }} />
        </svg>
      </div>
    </div>
  );
}

interface HeroProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** The verified seal. Its state only ever comes from what the API says about the badge. */
export function VSeal({ earned, label, children }: { earned: boolean; label: string; children: ReactNode }) {
  useV3DScript();
  return (
    <div className="bd-seal" data-v3d="seal" data-state={earned ? 'earned' : 'locked'} role="img" aria-label={label}>
      <div className="v3d-fallback">{children}</div>
    </div>
  );
}

/** The large decorative V on the sign-in and first-result screens. */
export function VHero({ className, style, children }: HeroProps) {
  useV3DScript();
  return (
    <div className={className} style={style} data-v3d="hero" data-framing="bleed" aria-hidden="true">
      <div className="v3d-fallback">{children}</div>
    </div>
  );
}

/** A small flat V for loading states. No 3D. */
export function VMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 132 100" aria-hidden="true">
      <path d={V_PATH} />
    </svg>
  );
}

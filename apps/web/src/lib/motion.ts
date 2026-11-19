'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export function prefersCalm(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Follows the person's reduced-motion setting, including if it changes. */
export function useCalm(): boolean {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setCalm(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return calm;
}

/** Runs a change inside a view transition where the browser has one and motion is welcome. */
export function softly(change: () => void): void {
  if (typeof document === 'undefined' || prefersCalm() || !('startViewTransition' in document)) {
    change();
    return;
  }
  const transition = document.startViewTransition(() => flushSync(change));
  // Skipped transitions reject these. That's not a failure of anything the person did.
  transition.ready.catch(() => undefined);
  transition.finished.catch(() => undefined);
}

/** Eases a number from one value to another. Returns a function that stops it. */
export function tween(from: number, to: number, ms: number, each: (value: number) => void): () => void {
  if (prefersCalm() || from === to) {
    each(to);
    return () => undefined;
  }
  let frame = 0;
  const start = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - k, 3);
    each(Math.round(from + (to - from) * eased));
    if (k < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

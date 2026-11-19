'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { prefersCalm, tween } from '@/lib/motion';
import { V_PATH, VFill } from './V3D';

interface ScoreState {
  /** The number on show: the real score, or a preview of it. */
  shown: number;
  previewText: string;
  preview: (score: number, text: string) => void;
  clear: () => void;
}

const ScoreContext = createContext<ScoreState>({ shown: 0, previewText: '', preview: () => undefined, clear: () => undefined });

/** One score: its number, the ruler pin and the V all move together. */
export function ScoreBox({ value, className, style, label, children }: { value: number; className?: string; style?: CSSProperties; label?: string; children: ReactNode }) {
  const [preview, setPreview] = useState<{ score: number; text: string } | null>(null);
  const state = useMemo<ScoreState>(
    () => ({
      shown: preview?.score ?? value,
      previewText: preview?.text ?? '',
      preview: (score, text) => setPreview({ score, text }),
      clear: () => setPreview(null),
    }),
    [preview, value],
  );
  return (
    <ScoreContext.Provider value={state}>
      <div className={className} style={style} aria-label={label}>
        {children}
      </div>
    </ScoreContext.Provider>
  );
}

/** Counts up from nothing on arrival, then eases between values. */
export function useCountUp(target: number, firstMs = 1300, nextMs = 700): number {
  const [current, setCurrent] = useState(target);
  const from = useRef<number | null>(null);
  useEffect(() => {
    const start = from.current;
    if (start === null && prefersCalm()) {
      from.current = target;
      setCurrent(target);
      return;
    }
    const stop = tween(start ?? 0, target, start === null ? firstMs : nextMs, (value) => {
      from.current = value;
      setCurrent(value);
    });
    return stop;
  }, [target, firstMs, nextMs]);
  return current;
}

export function ScoreNumber({ className }: { className?: string }) {
  const { shown } = useContext(ScoreContext);
  const number = useCountUp(shown);
  return <span className={className}>{number}</span>;
}

export function ScoreGauge({ className, label }: { className?: string; label?: string }) {
  const { shown } = useContext(ScoreContext);
  return <VFill value={shown} {...(className ? { className } : {})} {...(label ? { label } : {})} />;
}

interface RulerProps {
  label: string;
  /** Where verification starts. Comes from the API. Left out for a single area. */
  goal?: number;
}

export function Ruler({ label, goal }: RulerProps) {
  const { shown } = useContext(ScoreContext);
  // Starts at nothing and slides across on arrival, as the number counts up.
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (prefersCalm()) {
      setLeft(shown);
      return;
    }
    const frame = requestAnimationFrame(() => setLeft(shown));
    return () => cancelAnimationFrame(frame);
  }, [shown]);
  const style = goal === undefined ? undefined : ({ '--goal': `${goal}%` } as CSSProperties);
  return (
    <div className="ruler flag" role="img" aria-label={label} style={style}>
      <svg className="pin" style={{ left: `${left}%` }} viewBox="0 0 132 100" aria-hidden="true">
        <path d={V_PATH} />
      </svg>
      <div className="track">
        <b />
        <b />
        <b />
      </div>
      {goal === undefined ? null : (
        <>
          <div className="goal" />
          <div className="goallabel">{goal} to get verified</div>
        </>
      )}
      <div className="keys">
        <span>At risk</span>
        <span>Needs work</span>
        <span>Healthy</span>
      </div>
    </div>
  );
}

/** The line that replaces quieter text while a fix is being previewed. */
export function PreviewLine() {
  const { previewText } = useContext(ScoreContext);
  return (
    <p className={`previewline${previewText ? ' on' : ''}`} aria-live="polite">
      {previewText}
    </p>
  );
}

/** Hover or focus on anything these props are spread on, and the score shows what it would do. */
export function usePreview(score: number | null, text: string) {
  const { preview, clear } = useContext(ScoreContext);
  if (score === null) return {};
  return {
    onMouseEnter: () => preview(score, text),
    onMouseLeave: clear,
    onFocus: () => preview(score, text),
    onBlur: clear,
  };
}

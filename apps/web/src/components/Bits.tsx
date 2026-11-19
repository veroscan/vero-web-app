'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Coverage } from '@vero/shared';
import type { ApiError } from '@/lib/api';
import { coverageWords, HELD_WORDS } from '@/lib/format';
import { TLink } from './TLink';

export function Arrow() {
  return (
    <svg className="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Words arriving one by one. Screen readers get the sentence whole. */
export function BlurIn({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(/\s+/).map((word, index) => (
          <span key={`${word}-${index}`}>
            <span className="bi" style={{ animationDelay: `${delay + index * 0.07}s` }}>
              {word}
            </span>{' '}
          </span>
        ))}
      </span>
    </>
  );
}

/** The V reading a page: a scan line runs over the brand mark. */
export function Loading({ what = 'Loading' }: { what?: string }) {
  return (
    <div className="state state-load" role="status" data-testid="loading">
      <span className="state-mark">
        <img src="/brand/app-icon.svg" alt="" />
      </span>
      <p className="muted">{what}</p>
    </div>
  );
}

/** The plain-language error state. The message comes from the API's own plain words. */
export function ErrorState({ error, onRetry, title = "We couldn't load this" }: { error: ApiError; onRetry?: () => void; title?: string }) {
  return (
    <div className="state" role="alert" data-testid="error-state">
      <h1>{title}</h1>
      <p>{error.message}</p>
      {onRetry ? (
        <button className="btn btn-p" type="button" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty" data-testid="empty-state">
      <b>{title}</b>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

/** What a score rests on, and what's holding it, as plain sentences. */
export function ScoreBasis({ coverage, held }: { coverage: Coverage | null | undefined; held?: boolean }) {
  const based = coverageWords(coverage);
  if (!based && !held) return null;
  return (
    <span data-testid="score-basis">
      {based}
      {based && held ? ' ' : ''}
      {held ? <span data-testid="score-held">{HELD_WORDS}</span> : null}
    </span>
  );
}

/** Says plainly when what's on screen rests on made-up records. */
export function SampleNote() {
  return (
    <p className="note" data-testid="sample-note">
      <span className="b">Sample data.</span>
      <span>This uses made-up records for testing, not a real register.</span>
    </p>
  );
}

export function SourcesDownNote({ sources }: { sources: { sourceName: string }[] }) {
  if (sources.length === 0) return null;
  const names = [...new Set(sources.map((source) => source.sourceName))];
  return (
    <p className="note warn" data-testid="sources-down">
      <span className="b">{names.length === 1 ? 'One source is down.' : `${names.length} sources are down.`}</span>
      <span>
        Couldn&apos;t reach: {names.join(', ')}. Until {names.length === 1 ? 'it comes' : 'they come'} back, {names.length === 1 ? 'it' : 'they'} won&apos;t count for or against your score.
      </span>
    </p>
  );
}

/** Marks where a paid plan would show more, with the limit coming from the API. */
export function PlanLink({ children = 'See the plans' }: { children?: ReactNode }) {
  return (
    <TLink className="link" href="/plan">
      {children}
    </TLink>
  );
}

/** Reveals the fix box, and draws the strike-through when there's clause text to strike. */
export function Redline({ original, fixLabel, fix }: { original?: string | null; fixLabel: string; fix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) {
      setOn(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries, self) => {
        if (entries[0]?.isIntersecting) {
          setOn(true);
          self.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`paper${on ? ' on' : ''}`} data-redline="">
      {original ? (
        <p>
          <span className="strike">{original}</span>
        </p>
      ) : null}
      <div className="fix" style={original ? undefined : { marginTop: 0 }}>
        <p className="b" style={{ marginBottom: 6, color: 'var(--good)', fontWeight: 700, fontSize: 13 }}>
          {fixLabel}
        </p>
        <p>{fix}</p>
      </div>
    </div>
  );
}

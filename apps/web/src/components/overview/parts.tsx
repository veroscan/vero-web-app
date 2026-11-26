'use client';

/* Pieces shared by the overview, area, history and watchlist screens: the pixel score, the coverage
   blocks under it, the white "Do this first" card with its projected score, and a re-scan that
   reports as it runs. */

import type { CountryCoverage, Coverage, ProjectionResponse, Scan, ScoreView } from '@vero/shared';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import { CountUp } from '@/components/Motion';
import { TLink } from '@/components/TLink';
import { api, asApiError, isRedirecting, type ApiError } from '@/lib/api';
import { countryShort, plural } from '@/lib/format';
import { useResource } from '@/lib/useResource';
import '@/app/styles/pages/vparts.css';

const LEVEL_WORDS: Record<CountryCoverage['level'], string> = {
  full: 'Full coverage',
  registry: 'Registry coverage',
  international: 'International coverage',
};

/** "Full coverage, Delaware". The sentence that explains it goes in the title beside it. */
export function coverageLevelWords(coverage: CountryCoverage | undefined, country: string): string | null {
  if (!coverage) return null;
  return `${LEVEL_WORDS[coverage.level]}, ${countryShort(country)}`;
}

/** What the register calls its number, for the line under a company's name. */
export function numberWords(country: string, number: string | null): string | null {
  if (!number) return null;
  if (country.startsWith('US')) return `File ${number}`;
  if (country === 'GB') return `Company ${number}`;
  if (country === 'NG') return `RC ${number}`;
  return `No. ${number}`;
}

/** The urgent cap the owner set (6 Nov 2026): an urgent gap holds any score at 74. */
export const URGENT_CAP = 74;

/** A score as one number: a range sits at its middle. Null before a result. */
export function scoreValue(score: ScoreView): number | null {
  if (score.kind === 'exact') return score.value;
  if (score.kind === 'approximate') return Math.round((score.low + score.high) / 2);
  return null;
}

/**
 * A score in the brand's pixel font, counting up on arrival. A range on Free shows as "62-70",
 * and nothing scored yet shows a dash. `testId` keeps the screens' test hooks on the number.
 */
export function PixelScore({ score, className, testId, ms = 1300 }: { score: ScoreView; className?: string; testId?: string; ms?: number }) {
  const cls = `pixel${className ? ` ${className}` : ''}`;
  if (score.kind === 'exact') {
    return (
      <span className={cls} data-testid={testId}>
        <CountUp value={score.value} ms={ms} />
      </span>
    );
  }
  if (score.kind === 'approximate') {
    return (
      <span className={cls} data-testid={testId} role="img" aria-label={`${score.low} to ${score.high}`}>
        <CountUp value={score.low} ms={ms} />
        -
        <CountUp value={score.high} ms={ms} />
      </span>
    );
  }
  return (
    <span className={cls} data-testid={testId} role="img" aria-label="Not scored yet">
      --
    </span>
  );
}

/**
 * "Based on N of M checks" as the kit's blocks: filled for checks that count, red for the share
 * that found a problem, faint for checks that don't count yet.
 */
export function CoverageBlocks({ coverage, open = 0, count = 16 }: { coverage: Coverage | null | undefined; open?: number; count?: number }) {
  const total = coverage?.total ?? 0;
  const counted = coverage?.counted ?? 0;
  const filled = total > 0 ? Math.round((counted / total) * count) : 0;
  const bad = total > 0 && open > 0 ? Math.min(filled, Math.max(1, Math.round((open / total) * count))) : 0;
  // Problems spread through the filled run, as in the design, rather than bunched at one end.
  const badAt = new Set<number>();
  for (let k = 0; k < bad; k += 1) badAt.add(Math.min(filled - 1, Math.round(((k + 0.6) * filled) / (bad + 0.2))));
  return (
    <div className="blocks vblocks" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${count},1fr)` }}>
      {Array.from({ length: count }, (_, index) => (
        <i key={index} className={index >= filled ? 'o' : badAt.has(index) ? 'x' : undefined} style={{ '--i': index } as CSSProperties} />
      ))}
    </div>
  );
}

/** Coverage under a score: the level, "N of M checks" and the blocks. Always shown with a score. */
export function CoverageLine({ coverage, level, levelTitle, open = 0 }: { coverage: Coverage | null | undefined; level: string | null; levelTitle?: string; open?: number }) {
  return (
    <div className="cov">
      <div className="t">
        <span title={levelTitle}>{level ?? 'Checks that count'}</span>
        {coverage && coverage.total > 0 ? (
          <span data-testid="score-basis">
            <b>{coverage.counted}</b> of {plural(coverage.total, 'check', 'checks')}
          </span>
        ) : (
          <span>Not scored yet</span>
        )}
      </div>
      <CoverageBlocks coverage={coverage} open={open} />
    </div>
  );
}

/** The flat 2D art on the next-step card: a stack of papers with the missing one dashed. */
export function MissingPaperArt() {
  return (
    <svg className="art" viewBox="0 0 130 120" aria-hidden="true">
      <g transform="rotate(8 65 60)">
        <rect x="40" y="10" width="64" height="84" rx="8" fill="#E3F4FD" />
        <rect x="28" y="20" width="64" height="84" rx="8" fill="#C9EAFB" />
        <rect x="16" y="30" width="64" height="84" rx="8" fill="#fff" stroke="#0182FA" strokeWidth="2" strokeDasharray="6 5" />
        <text x="48" y="80" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontWeight="700" fontSize="22" fill="#0182FA">
          ?
        </text>
      </g>
    </svg>
  );
}

export interface Projected {
  from: number;
  to: number;
  /** The fix moves the score on its own, or only once every urgent gap is cleared. */
  mode: 'one' | 'urgent';
  urgentCount: number;
  reaches: boolean;
}

export interface Fix {
  companyId: string;
  ruleKey: string;
}

/**
 * Where the score goes after a fix, from the API's own projection. When the urgent cap holds the
 * fix at +0, it asks what clearing every urgent gap would do instead, which is what lifts the cap.
 */
export function useProjection(companyId: string | undefined, scope: 'company' | 'group', fix: Fix | null, urgent: readonly Fix[], enabled: boolean): Projected | null {
  const [result, setResult] = useState<Projected | null>(null);
  const urgentKey = urgent.map((item) => `${item.companyId}|${item.ruleKey}`).join(',');
  useEffect(() => {
    let live = true;
    setResult(null);
    if (!enabled || !fix || !companyId) return;
    const ask = (fixes: readonly Fix[]): Promise<ProjectionResponse> =>
      api.results.projection({
        params: { companyId },
        query: { scope },
        body: scope === 'group' ? { fixes: [...fixes] } : { ruleKeys: fixes.map((item) => item.ruleKey) },
      });
    (async (): Promise<Projected> => {
      const one = await ask([fix]);
      if (one.gain > 0 || urgent.length === 0) return { from: one.current, to: one.projected, mode: 'one', urgentCount: urgent.length, reaches: one.reachesVerification };
      const all = await ask(urgent);
      return { from: all.current, to: all.projected, mode: 'urgent', urgentCount: urgent.length, reaches: all.reachesVerification };
    })().then(
      (value) => {
        if (live) setResult(value);
      },
      () => undefined, // The card still shows the fix; only the projected number is left out.
    );
    return () => {
      live = false;
    };
    // Compared by value: the fix and the urgent list are rebuilt on every render.
  }, [companyId, scope, fix?.companyId, fix?.ruleKey, urgentKey, enabled]);
  return result;
}

/**
 * The projection for one fix, asking for the urgent gaps itself when the urgent cap is holding
 * the score (only an exact score has a projection).
 */
export function useFixProjection(companyId: string | undefined, scope: 'company' | 'group', fix: Fix | null, heldByUrgent: boolean, exact: boolean): Projected | null {
  const urgentIssues = useResource(
    () => (companyId && heldByUrgent && exact ? api.results.issues({ params: { companyId }, query: { scope, outcome: 'open', severity: 'critical' } }) : Promise.resolve(null)),
    [companyId, scope, heldByUrgent, exact],
  );
  const urgent = (urgentIssues.data?.issues ?? []).map((issue) => ({ companyId: issue.companyId, ruleKey: issue.ruleKey }));
  return useProjection(companyId, scope, fix, urgent, exact && (!heldByUrgent || urgentIssues.data !== undefined && urgentIssues.data !== null));
}

/** The words beside the projected number. */
export function projectionWords(projection: Projected): string {
  const gain = projection.to - projection.from;
  if (projection.mode === 'urgent') {
    const which = projection.urgentCount === 1 ? 'the urgent gap' : `all ${projection.urgentCount} urgent gaps`;
    return `with ${which} cleared, lifting the cap`;
  }
  if (projection.reaches) return `adds ${plural(gain, 'point', 'points')} and reaches the level for verification`;
  return `this one fix adds ${plural(gain, 'point', 'points')}`;
}

/** The single white call to action on the atmosphere. */
export function NextCard({
  label = 'Do this first',
  title,
  body,
  href,
  action = 'Open finding',
  projection,
  note,
  art = <MissingPaperArt />,
  testId,
}: {
  label?: string;
  title: string;
  body?: ReactNode;
  href: string;
  action?: string;
  projection?: Projected | null;
  /** Shown instead of the projected number, such as why the fix doesn't move the score yet. */
  note?: ReactNode;
  art?: ReactNode;
  testId?: string;
}) {
  const moves = projection !== null && projection !== undefined && projection.to > projection.from;
  return (
    <div className="mod next" aria-label="Your next step" data-testid={testId}>
      {art}
      <div className="k">{label}</div>
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {moves && projection ? (
        <div className="imp">
          <CountUp className="pixel from" value={projection.from} from={projection.from} />
          <Icon name="chev" />
          <CountUp className="pixel to" value={projection.to} from={projection.from} ms={1600} />
          <span className="imps" data-testid={projection.mode === 'one' ? 'next-points' : 'points-held'}>
            {projectionWords(projection)}
          </span>
        </div>
      ) : note ? (
        <div className="imps-plain">{note}</div>
      ) : null}
      <TLink className="btn" href={href}>
        {action}
      </TLink>
    </div>
  );
}

/** Rows on their way: the shape of a list while it loads, with the words for screen readers. */
export function SkeletonRows({ what, rows = 4 }: { what: string; rows?: number }) {
  return (
    <div className="vskel" role="status">
      <span className="sr-only">{what}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} aria-hidden="true">
          <span>
            <i className="skel" style={{ width: `${62 - ((index * 13) % 30)}%` }} />
            <i className="skel" style={{ width: `${34 - ((index * 7) % 14)}%` }} />
          </span>
          <i className="skel" />
        </div>
      ))}
    </div>
  );
}

/** A list that didn't load: plain words and a way to ask again, inside its own panel. */
export function ListError({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <p className="vempty" role="alert">
      <b>We couldn&apos;t load {what}.</b>
      It may be the connection. Nothing has been lost.{' '}
      <button type="button" className="link" onClick={onRetry}>
        Try again
      </button>
    </p>
  );
}

const FINISHED = new Set<Scan['status']>(['partial', 'completed', 'failed']);

export interface Rescan {
  running: boolean;
  done: number;
  total: number;
  error: ApiError | null;
  start: () => void;
}

/**
 * Scans the given companies again (each one's sources asked afresh), follows the scans until they
 * finish, then calls `onDone`.
 */
export function useRescan(companyIds: readonly string[], onDone: () => void): Rescan {
  const [scans, setScans] = useState<Scan[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [running, setRunning] = useState(false);
  const finished = useRef(onDone);
  finished.current = onDone;
  const key = companyIds.join(',');

  const start = useCallback(() => {
    if (running || companyIds.length === 0) return;
    setError(null);
    setScans([]);
    setRunning(true);
    Promise.all(companyIds.map((companyId) => api.scans.create({ params: { companyId } }))).then(setScans, (failure: unknown) => {
      setRunning(false);
      if (!isRedirecting(failure)) setError(asApiError(failure));
    });
    // The ids are compared by value.
  }, [running, key]);

  const moving = scans.filter((scan) => !FINISHED.has(scan.status));
  const movingKey = moving.map((scan) => `${scan.id}:${scan.checksDone}:${scan.status}`).join(',');
  useEffect(() => {
    if (!running || scans.length === 0) return;
    if (moving.length === 0) {
      setRunning(false);
      finished.current();
      return;
    }
    const wait = Math.max(600, ...moving.map((scan) => scan.pollAfterMs));
    const timer = window.setTimeout(() => {
      Promise.all(moving.map((scan) => api.scans.get({ params: { scanId: scan.id } }))).then(
        (fresh) => setScans((list) => list.map((scan) => fresh.find((item) => item.id === scan.id) ?? scan)),
        (failure: unknown) => {
          setRunning(false);
          if (!isRedirecting(failure)) setError(asApiError(failure));
        },
      );
    }, wait);
    return () => window.clearTimeout(timer);
  }, [movingKey, running, scans.length]);

  const total = scans.reduce((sum, scan) => sum + scan.checksTotal, 0);
  const done = scans.reduce((sum, scan) => sum + (FINISHED.has(scan.status) ? scan.checksTotal : scan.checksDone + scan.checksDown), 0);
  return { running, done, total, error, start };
}

/** The "Scan again" button, which reports its progress while it runs. */
export function RescanButton({ rescan, className = 'btn btn-g', label = 'Scan again' }: { rescan: Rescan; className?: string; label?: string }) {
  return (
    <button type="button" className={className} onClick={rescan.start} disabled={rescan.running} aria-live="polite" data-testid="scan-again">
      <Icon name={rescan.running ? 'refresh' : 'scan'} />
      {rescan.running ? (rescan.total > 0 ? `Checking ${rescan.done} of ${rescan.total}` : 'Starting') : label}
    </button>
  );
}

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** "Today, 14:18", "Yesterday, 09:02", "Fri 13 Nov, 16:42". */
export function scanWhen(at: string, now: Date = new Date()): string {
  const date = new Date(at);
  const time = TIME.format(date);
  const day = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
  const gap = day(now) - day(date);
  if (gap === 0) return `Today, ${time}`;
  if (gap === 1) return `Yesterday, ${time}`;
  const sameYear = date.getFullYear() === now.getFullYear();
  const words = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) }).format(date);
  return `${words.replace(',', '')}, ${time}`;
}

/** "+3", "-2" in the pixel font, or plain "No change". */
export function Change({ before, after }: { before: number | null; after: number | null }) {
  if (before === null || after === null) return <span className="vchg no">Not compared</span>;
  const delta = after - before;
  if (delta === 0) return <span className="vchg no">No change</span>;
  return (
    <span className={`vchg ${delta > 0 ? 'pos' : 'neg'}`} aria-label={`${delta > 0 ? 'Up' : 'Down'} ${Math.abs(delta)}`}>
      {delta > 0 ? '+' : '-'}
      {Math.abs(delta)}
    </span>
  );
}

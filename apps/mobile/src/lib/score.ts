import type { CompanyHistoryItem, CountryCoverage, ScoreView } from '@vero/shared';
import { countryShort, plural } from './format';

// Ported from apps/web/src/lib/words.ts, components/overview/parts.tsx and ScoreChart.tsx.

/** The urgent cap the owner set (6 Nov 2026): an urgent gap holds any score at 74. */
export const URGENT_CAP = 74;

/** The line under the score. Words only, chosen by the status the API gives. */
export function scoreSentence(word: string | null): string {
  if (word === 'Healthy') return 'A solid base. Keep it that way.';
  if (word === 'Early read') return "Good so far, but we've checked less than half of what applies.";
  if (word === 'Needs work') return 'A real base, with gaps an investor would notice.';
  if (word === 'At risk') return 'There are gaps here an investor would stop at.';
  return "We don't have enough yet to say where you stand.";
}

/** A score as one number: a range sits at its middle. Null before a result. */
export function scoreValue(score: ScoreView): number | null {
  if (score.kind === 'exact') return score.value;
  if (score.kind === 'approximate') return Math.round((score.low + score.high) / 2);
  return null;
}

const LEVEL_WORDS: Record<CountryCoverage['level'], string> = {
  full: 'Full coverage',
  registry: 'Registry coverage',
  international: 'International coverage',
};

/** "Full coverage, Delaware". */
export function coverageLevelWords(coverage: CountryCoverage | undefined, country: string): string | null {
  if (!coverage) return null;
  return `${LEVEL_WORDS[coverage.level]}, ${countryShort(country)}`;
}

export interface Projected {
  from: number;
  to: number;
  /** The fix moves the score on its own, or only once every urgent gap is cleared. */
  mode: 'one' | 'urgent';
  urgentCount: number;
  reaches: boolean;
}

/** The words beside a projected number, two short lines. */
export function projectionWords(projection: Projected): [string, string] {
  const gain = projection.to - projection.from;
  if (projection.mode === 'urgent') {
    return [projection.urgentCount === 1 ? 'with the urgent gap cleared,' : projection.urgentCount === 2 ? 'with both urgent gaps cleared,' : `with all ${projection.urgentCount} urgent gaps cleared,`, 'lifting the cap'];
  }
  if (projection.reaches) return [`adds ${plural(gain, 'point', 'points')}`, 'and reaches verification'];
  return ['this one fix adds', plural(gain, 'point', 'points')];
}

export interface ChartPoint {
  at: string;
  value: number;
}

/**
 * Scans newest first (as the API sends them) become chart points oldest first. A run of scans
 * with the same score keeps its first point, and the newest scan is always the last point.
 */
export function historyPoints(scans: readonly CompanyHistoryItem[]): ChartPoint[] {
  const ordered = [...scans].reverse();
  const out: ChartPoint[] = [];
  ordered.forEach((scan, index) => {
    const value = scoreValue(scan.score);
    if (value === null) return;
    const last = out[out.length - 1];
    if (!last || last.value !== value || index === ordered.length - 1) out.push({ at: scan.finishedAt, value });
  });
  return out;
}

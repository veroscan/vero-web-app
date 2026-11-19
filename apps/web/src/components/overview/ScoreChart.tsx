'use client';

/* The score-over-time chart from the Overview and History boards, drawn in SVG at the size it is
   shown (so the type never stretches). Real history only: one point per scan where the score moved.
   The line draws in once, the newest point lands with a single ring, and hovering reads any point. */

import type { CompanyHistoryItem } from '@vero/shared';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { prefersCalm } from '@/lib/motion';
import '@/app/styles/pages/scorechart.css';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface ChartPoint {
  at: string;
  value: number;
}

/** A range on Free sits at its middle, as everywhere else. Unscored scans are left out. */
function valueOf(item: Pick<CompanyHistoryItem, 'score'>): number | null {
  if (item.score.kind === 'exact') return item.score.value;
  if (item.score.kind === 'approximate') return Math.round((item.score.low + item.score.high) / 2);
  return null;
}

/**
 * Scans newest first (as the API sends them) become chart points oldest first. A run of scans
 * with the same score keeps its first point, and the newest scan is always the last point.
 */
export function historyPoints(scans: readonly CompanyHistoryItem[]): ChartPoint[] {
  const ordered = [...scans].reverse();
  const out: ChartPoint[] = [];
  ordered.forEach((scan, index) => {
    const value = valueOf(scan);
    if (value === null) return;
    const last = out[out.length - 1];
    const newest = index === ordered.length - 1;
    if (!last || last.value !== value) out.push({ at: scan.finishedAt, value });
    else if (newest) out.push({ at: scan.finishedAt, value });
  });
  return out;
}

/** Points inside the last `months` months. Null keeps them all. */
export function withinMonths(points: readonly ChartPoint[], months: number | null, now: Date = new Date()): ChartPoint[] {
  if (months === null) return [...points];
  const from = new Date(now);
  from.setMonth(from.getMonth() - months);
  return points.filter((point) => new Date(point.at) >= from);
}

/** How long the history spans, in days. */
export function spanDays(points: readonly ChartPoint[]): number {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return 0;
  return (new Date(last.at).getTime() - new Date(first.at).getTime()) / 86_400_000;
}

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short' });
const FULL = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function tickWords(at: string, span: number): string {
  const date = new Date(at);
  if (span < 1.5) return TIME.format(date);
  if (span < 150) return DAY.format(date);
  return MONTH.format(date);
}

interface Props {
  points: readonly ChartPoint[];
  /** The urgent cap, drawn as a dashed red line when an urgent gap is holding the score. */
  cap?: number | null;
  /** Where the score goes once the next fix is made: a dashed green step after the last point. */
  projected?: number | null;
  height?: number;
  /** Words for screen readers, before the figures. */
  label?: string;
}

const PAD = { l: 34, r: 18, t: 18, b: 30 };
/* Colours are SVG attributes, not CSS: the chart sits on the navy atmosphere in both themes,
   and the dark-theme generator only rewrites CSS. */
const AX = { fill: 'rgba(255,255,255,.55)', fontSize: 11, fontWeight: 600, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' } as const;

export function ScoreChart({ points, cap = null, projected = null, height = 260, label = 'Score over time' }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<SVGPathElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const gradient = useId().replace(/:/g, '');

  useIso(() => {
    const element = box.current;
    if (!element) return;
    const measure = () => {
      const style = window.getComputedStyle(element);
      setWidth(Math.round(element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)));
    };
    measure();
    if (!('ResizeObserver' in window)) return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const shape = useMemo(() => {
    const W = Math.max(width, 240);
    const H = height;
    const showProjection = projected !== null && points.length > 0 && projected !== points[points.length - 1]?.value;
    const right = PAD.r + (showProjection ? 48 : 0);
    const values = points.map((point) => point.value);
    const low = Math.min(...values, cap ?? 100, projected ?? 100, 100);
    const floor = Math.max(0, Math.min(40, Math.floor((low - 6) / 20) * 20));
    const y = (value: number) => PAD.t + ((100 - value) / (100 - floor)) * (H - PAD.t - PAD.b);
    const n = points.length;
    const x = (index: number) => (n <= 1 ? (PAD.l + W - right) / 2 : PAD.l + (index * (W - PAD.l - right)) / (n - 1));
    const d = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)} ${y(point.value).toFixed(1)}`).join(' ');
    const grid: number[] = [];
    for (let value = floor; value <= 100; value += 20) grid.push(value);
    const span = spanDays(points);
    const room = Math.max(2, Math.floor((W - PAD.l - right) / 84));
    const every = Math.max(1, Math.ceil(n / room));
    const ticks = points.map((point, index) => ({ index, text: tickWords(point.at, span) })).filter((tick) => tick.index % every === 0 || tick.index === n - 1)
      // The same words twice in a row (several scans in one minute or day) say nothing new.
      .filter((tick, k, list) => k === list.length - 1 || tick.text !== list[k + 1]?.text);
    // Two ticks too close together: keep the newest.
    const spaced = ticks.filter((tick, k) => k === ticks.length - 1 || x((ticks[ticks.length - 1] as { index: number }).index) - x(tick.index) >= 60);
    return { W, H, x, y, d, grid, floor, ticks: spaced, showProjection };
  }, [width, height, points, cap, projected]);

  const signature = points.map((point) => point.value).join(',');
  useIso(() => {
    const path = line.current;
    if (!path || width === 0 || prefersCalm()) return;
    const length = path.getTotalLength();
    path.style.transition = 'none';
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.getBoundingClientRect();
    path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1)';
    path.style.strokeDashoffset = '0';
    const done = window.setTimeout(() => {
      path.style.transition = '';
      path.style.strokeDasharray = '';
      path.style.strokeDashoffset = '';
    }, 1700);
    return () => window.clearTimeout(done);
    // Draws in when the data changes, not on every resize.
  }, [signature, width === 0]);

  const first = points[0];
  const last = points[points.length - 1];
  const summary = first && last ? `${label}: ${first.value} on ${FULL.format(new Date(first.at))}, ${last.value} on ${FULL.format(new Date(last.at))}.` : label;
  const { W, H, x, y } = shape;
  const hovered = hover === null ? null : points[hover];

  return (
    <div className="chart vchart" ref={box}>
      {width > 0 && last ? (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={summary} onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9DDAF7" stopOpacity={0.35} />
              <stop offset="1" stopColor="#9DDAF7" stopOpacity={0} />
            </linearGradient>
          </defs>
          {shape.grid.map((value) => (
            <g key={value}>
              <line stroke="rgba(255,255,255,.12)" x1={PAD.l} x2={W - PAD.r} y1={y(value)} y2={y(value)} />
              <text {...AX} x={PAD.l - 10} y={y(value) + 4} textAnchor="end">
                {value}
              </text>
            </g>
          ))}
          {shape.ticks.map((tick) => (
            <text key={tick.index} {...AX} x={x(tick.index)} y={H - 8} textAnchor="middle">
              {tick.text}
            </text>
          ))}
          {cap !== null ? <line stroke="#FF8A8E" strokeWidth={1.5} strokeDasharray="5 5" x1={PAD.l} x2={W - PAD.r} y1={y(cap)} y2={y(cap)} /> : null}
          {points.length > 1 ? <path className="area" d={`${shape.d} L${x(points.length - 1)} ${y(shape.floor)} L${x(0)} ${y(shape.floor)} Z`} fill={`url(#${gradient})`} /> : null}
          <path ref={line} fill="none" stroke="#FFFFFF" strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" d={points.length > 1 ? shape.d : `M${x(0) - 1} ${y(last.value)} L${x(0) + 1} ${y(last.value)}`} />
          {points.slice(0, -1).map((point, index) => (
            <circle key={`${point.at}-${index}`} fill="#00004A" stroke="rgba(255,255,255,.7)" strokeWidth={1.5} cx={x(index)} cy={y(point.value)} r={3} />
          ))}
          {shape.showProjection && projected !== null ? (
            <g className="proj">
              <path d={`M${x(points.length - 1)} ${y(last.value)} L${x(points.length - 1) + 44} ${y(projected)}`} stroke="#5EEAD4" strokeWidth={2.2} strokeDasharray="4 5" fill="none" />
              <circle cx={x(points.length - 1) + 44} cy={y(projected)} r={5} fill="#00004A" stroke="#5EEAD4" strokeWidth={2} />
            </g>
          ) : null}
          <circle className="ring" fill="#9DDAF7" cx={x(points.length - 1)} cy={y(last.value)} r={14} />
          <circle fill="#FFFFFF" stroke="#0182FA" strokeWidth={2.5} cx={x(points.length - 1)} cy={y(last.value)} r={5.5} />
          {hover !== null && hovered ? <line stroke="rgba(255,255,255,.28)" strokeDasharray="2 3" x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} /> : null}
          {points.map((point, index) => {
            const half = points.length > 1 ? (W - PAD.l - PAD.r) / (points.length - 1) / 2 : 40;
            return <rect key={`hit-${point.at}-${index}`} className="hit" x={x(index) - half} y={0} width={half * 2} height={H} onMouseEnter={() => setHover(index)} />;
          })}
        </svg>
      ) : (
        <div style={{ height: H }} />
      )}
      <div className="tip" style={hovered && hover !== null ? { left: x(hover) + 8, top: y(hovered.value) + 18, opacity: 1 } : undefined} aria-hidden="true">
        {hovered ? (
          <>
            <b>{hovered.value}</b>
            {FULL.format(new Date(hovered.at))}
          </>
        ) : null}
      </div>
    </div>
  );
}

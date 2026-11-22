import { useEffect, useId, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import type { ChartPoint } from '@/lib/score';
import { font } from '@/theme/fonts';

const H = 86;

/** Milliseconds since mount, ticking each frame until `until`, as the board's CSS timeline. */
function useTimeline(until: number, key: string): number {
  const still = useReducedMotion();
  const [t, setT] = useState(0);
  // A new timeline starts again from 0 (previous-value pattern, during render).
  const run = `${until}|${key}`;
  const [lastRun, setLastRun] = useState(run);
  if (lastRun !== run) {
    setLastRun(run);
    setT(0);
  }
  useEffect(() => {
    // With reduced motion everything is shown at its end state (returned below).
    if (still) return;
    let frame = 0;
    let start = 0;
    const step = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      setT(Math.min(until, elapsed));
      if (elapsed < until) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [until, key, still]);
  return still ? until : t;
}

const easeOut = (p: number) => 1 - Math.pow(1 - p, 4);
/** The kit's --spring: overshoots a little, then settles. */
const springy = (p: number) => {
  const c = 1.70158 * 1.3;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
};
const phase = (t: number, delay: number, ms: number) => Math.max(0, Math.min(1, (t - delay) / ms));

/**
 * The Home board's sparkline: the real score history drawn in as a white line (the stroke
 * animates in), the area fading in under it, the urgent cap dashed in red when it holds the
 * score, and the newest point landing with a ring.
 */
export function Sparkline({ points, cap, caption, label }: { points: readonly ChartPoint[]; cap: number | null; caption?: string | null; label: string }) {
  const [W, setW] = useState(0);
  const gid = `sg${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const signature = points.map((point) => point.value).join(',');
  const t = useTimeline(2600, `${signature}|${W > 0}`);

  const shape = useMemo(() => {
    if (W === 0 || points.length === 0) return null;
    const values = points.map((point) => point.value);
    const all = cap !== null ? [...values, cap] : values;
    let lo = Math.max(0, Math.min(...all) - 6);
    let hi = Math.min(100, Math.max(...all) + 4);
    if (hi - lo < 14) {
      const mid = (hi + lo) / 2;
      lo = Math.max(0, mid - 7);
      hi = Math.min(100, mid + 7);
    }
    const y = (value: number) => H - 8 - ((value - lo) / (hi - lo)) * (H - 16);
    const n = points.length;
    const x = (index: number) => (n <= 1 ? W - 12 : 4 + (index * (W - 16)) / (n - 1));
    const coords = points.map((point, index) => [x(index), y(point.value)] as const);
    const d = `M${coords.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(' L')}`;
    let length = 0;
    for (let k = 1; k < coords.length; k += 1) {
      const a = coords[k - 1];
      const b = coords[k];
      if (a && b) length += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    const last = coords[coords.length - 1] ?? [W - 12, H / 2];
    const first = coords[0] ?? last;
    return { d, length, last, area: `${d} L${last[0]} ${H} L${first[0]} ${H} Z`, capY: cap !== null ? y(cap) : null };
  }, [W, points, cap]);

  const draw = easeOut(phase(t, 350, 1800));
  const fill = easeOut(phase(t, 1400, 800));
  const pop = springy(phase(t, 2000, 500));
  const ring = springy(phase(t, 2050, 500));
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={first && last ? `${label}: ${first.value} at the first scan, ${last.value} now.` : label}
      onLayout={(event) => setW(Math.round(event.nativeEvent.layout.width))}
      style={{ height: H, marginTop: 14 }}
    >
      {shape && last ? (
        <Svg width={W} height={H} style={{ overflow: 'visible' }}>
          <Defs>
            <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#9DDAF7" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#9DDAF7" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {shape.capY !== null ? (
            <>
              <Line x1={0} x2={W} y1={shape.capY} y2={shape.capY} stroke="#FF8A8E" strokeWidth={1.2} strokeDasharray="4 5" />
              <SvgText x={0} y={shape.capY - 6} fill="#FF9EA2" fontSize={10.5} fontFamily={font.sans(700)}>
                {`Urgent cap ${cap ?? ''}`}
              </SvgText>
            </>
          ) : null}
          {caption ? (
            <SvgText x={W - 2} y={H - 6} fill="rgba(255,255,255,0.6)" fontSize={10.5} fontFamily={font.sans(700)} textAnchor="end">
              {caption}
            </SvgText>
          ) : null}
          {points.length > 1 ? (
            <>
              <Path d={shape.area} fill={`url(#${gid})`} opacity={fill} />
              <Path d={shape.d} stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${shape.length + 2} ${shape.length + 2}`} strokeDashoffset={(shape.length + 2) * (1 - draw)} />
            </>
          ) : null}
          <Circle cx={shape.last[0]} cy={shape.last[1]} r={11 * Math.max(0, ring)} fill="#fff" opacity={0.18 * Math.min(1, ring * 1.4)} />
          <Circle cx={shape.last[0]} cy={shape.last[1]} r={5 * Math.max(0, pop)} fill="#fff" opacity={Math.min(1, pop * 1.4)} />
        </Svg>
      ) : null}
    </View>
  );
}

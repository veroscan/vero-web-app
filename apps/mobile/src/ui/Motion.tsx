import { useEffect, useState, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { motion } from '@/theme/tokens';

const ease = Easing.bezier(...motion.ease);

/** The kit's `.rise`: fades up 16px, staggered 70ms per step (--d). */
export function Rise({ d = 0, children, style }: { d?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const still = useReducedMotion();
  return (
    <Animated.View entering={still ? undefined : FadeInDown.duration(800).delay(d * motion.riseStep).easing(ease)} style={style}>
      {children}
    </Animated.View>
  );
}

/** Counts a number up from `from` with the kit's ease-out-quart (mobile.js countUp). */
export function useCountUp(to: number, { ms = 1300, delay = 250, from = 0 }: { ms?: number; delay?: number; from?: number } = {}): number {
  const still = useReducedMotion();
  const [value, setValue] = useState(still ? to : from);
  useEffect(() => {
    // With reduced motion the number is shown as is (returned below), so nothing runs.
    if (still) return;
    let frame = 0;
    let start = 0;
    const timer = setTimeout(() => {
      const step = (now: number) => {
        if (!start) start = now;
        const p = Math.min(1, (now - start) / ms);
        setValue(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 4))));
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [to, ms, delay, from, still]);
  return still ? to : value;
}

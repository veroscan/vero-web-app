import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { motion } from '@/theme/tokens';

const W = 64;
const H = 26;

/**
 * The `.mini` line on a watchlist row, from the company's real scans (oldest to newest). It draws
 * itself in from the left, like the kit's `.draw`. Fewer than two scores draws nothing.
 */
export function Spark({ values, color }: { values: number[]; color: string }) {
  const still = useReducedMotion();
  const w = useSharedValue(still ? W : 0);
  useEffect(() => {
    if (!still) w.set(withDelay(350, withTiming(W, { duration: 1800, easing: Easing.bezier(...motion.ease) })));
  }, [still, w]);
  const reveal = useAnimatedStyle(() => ({ width: w.get() }));
  if (values.length < 2) return <View style={{ width: W }} />;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = Math.max(1, high - low);
  const d = values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = high === low ? H / 2 : 23 - ((value - low) / span) * 20;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <View style={{ width: W, height: H }} aria-hidden>
      <Animated.View style={[{ height: H, overflow: 'hidden' }, reveal]}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ overflow: 'visible' }}>
          <Path d={d} stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}

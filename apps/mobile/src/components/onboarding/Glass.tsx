import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { motion } from '@/theme/tokens';

/** The kit's `.glass` card on the navy boards: a frosted white sheen with a hairline. */
export function Glass({ children, style, scanline }: { children: ReactNode; style?: StyleProp<ViewStyle>; scanline?: boolean }) {
  return (
    <View
      style={[
        {
          borderRadius: 24,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.18)',
          overflow: 'hidden',
          shadowColor: '#000014',
          shadowOpacity: 0.6,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 30 },
        },
        style,
      ]}
    >
      <LinearGradient colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.22)' }} />
      {scanline ? <Scanline /> : null}
      {children}
    </View>
  );
}

/** `.scanline`: a bright line that sweeps down the card every three seconds (`sweep` in mobile.css). */
export function Scanline() {
  const still = useReducedMotion();
  const [height, setHeight] = useState(0);
  const p = useSharedValue(0);
  useEffect(() => {
    if (still) return;
    p.set(withRepeat(withTiming(1, { duration: 3000, easing: Easing.bezier(...motion.ease) }), -1, false));
  }, [still, p]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.get(), [0, 0.15, 0.85, 1], [0, 1, 1, 0]),
    transform: [{ translateY: height * (0.06 + 0.88 * p.get()) }],
  }));
  if (still) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, height: 2, zIndex: 3, shadowColor: '#9DDAF7', shadowOpacity: 0.7, shadowRadius: 18, shadowOffset: { width: 0, height: 0 } }, style]}>
        <LinearGradient colors={['rgba(157,218,247,0)', '#9DDAF7', '#FFFFFF', '#9DDAF7', 'rgba(157,218,247,0)']} locations={[0, 0.3, 0.5, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

/** Words on the navy glass take these colours (`#6EE7C5` good, `#FFB3B5` to look at). */
export const ON_NAVY_TONE = { good: '#6EE7C5', watch: '#FFB3B5', none: 'rgba(255,255,255,0.6)' } as const;

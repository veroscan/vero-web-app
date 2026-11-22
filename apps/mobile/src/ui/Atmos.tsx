import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, Mask, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';
import { brand } from '@/theme/tokens';

/**
 * The navy "registry light" atmosphere from atmos.css: four soft brand lights drifting slowly,
 * a pixel field that shows only where the light falls, and the thin flow lines.
 * CSS blurs each light by 70px; here each light is a radial gradient that fades to nothing.
 */
const LIGHTS: {
  id: string;
  color: string;
  opacity: number;
  left?: DimensionValue;
  right?: DimensionValue;
  top?: DimensionValue;
  bottom?: DimensionValue;
  width: DimensionValue;
  height: DimensionValue;
  drift: { x: number; y: number; scale: number };
  ms: number;
}[] = [
  { id: 'b1', color: brand.blue, opacity: 0.9, left: '-22%', top: '-48%', width: '82%', height: '110%', drift: { x: 0.12, y: 0.1, scale: 1.08 }, ms: 22000 },
  { id: 'b2', color: brand.sky, opacity: 0.7, right: '-18%', top: '-40%', width: '66%', height: '90%', drift: { x: -0.1, y: 0.14, scale: 1.12 }, ms: 26000 },
  { id: 'b3', color: brand.indigo, opacity: 0.75, left: '24%', top: '20%', width: '58%', height: '80%', drift: { x: -0.14, y: -0.1, scale: 0.92 }, ms: 30000 },
  { id: 'b4', color: brand.lb, opacity: 0.35, right: '2%', bottom: '-34%', width: '50%', height: '64%', drift: { x: -0.1, y: 0.14, scale: 1.12 }, ms: 34000 },
];

function Light({ light, still }: { light: (typeof LIGHTS)[number]; still: boolean }) {
  const t = useSharedValue(0);
  const size = useSharedValue({ w: 0, h: 0 });
  useEffect(() => {
    if (still) return;
    t.set(withRepeat(withTiming(1, { duration: light.ms, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [light.ms, still, t]);
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: t.get() * light.drift.x * size.get().w },
      { translateY: t.get() * light.drift.y * size.get().h },
      { scale: 1 + t.get() * (light.drift.scale - 1) },
    ],
  }));
  const { id, color, opacity, width, height, left, right, top, bottom } = light;
  return (
    <Animated.View
      pointerEvents="none"
      onLayout={(e) => {
        size.set({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
      }}
      style={[{ position: 'absolute', width, height, left, right, top, bottom }, style]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="0.45" stopColor={color} stopOpacity={opacity * 0.55} />
            <Stop offset="0.75" stopColor={color} stopOpacity={opacity * 0.15} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx="50" cy="50" rx="50" ry="50" fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

export function Atmos({ flow = true, grid = true }: { flow?: boolean; grid?: boolean }) {
  const still = useReducedMotion();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: brand.navyDeep, overflow: 'hidden' }]}>
      {LIGHTS.map((light) => (
        <Light key={light.id} light={light} still={still} />
      ))}
      {grid ? (
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <Pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <Circle cx="7" cy="7" r="0.95" fill="#fff" fillOpacity={0.55} />
            </Pattern>
            <RadialGradient id="reveal" cx="22%" cy="10%" rx="60%" ry="70%">
              <Stop offset="0" stopColor="#fff" stopOpacity={1} />
              <Stop offset="0.45" stopColor="#fff" stopOpacity={0.35} />
              <Stop offset="0.75" stopColor="#fff" stopOpacity={0} />
            </RadialGradient>
            <Mask id="fieldmask">
              <Rect width="100%" height="100%" fill="url(#reveal)" />
            </Mask>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dots)" mask="url(#fieldmask)" opacity={0.35} />
        </Svg>
      ) : null}
      {flow ? (
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 390 600" preserveAspectRatio="none" fill="none">
          <Path d="M-20,90 C120,30 220,330 420,170" stroke={brand.flow} strokeWidth={1.1} opacity={0.6} />
          <Path d="M-20,420 C110,500 260,90 420,40" stroke={brand.lb} strokeWidth={1.1} opacity={0.3} />
          <Path d="M80,-20 C170,180 290,240 420,520" stroke={brand.flow} strokeWidth={1.1} opacity={0.6} />
        </Svg>
      ) : null}
    </View>
  );
}

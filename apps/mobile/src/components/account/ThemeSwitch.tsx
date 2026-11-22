import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme, type ThemeMode } from '@/theme/ThemeProvider';
import { dark, light, motion } from '@/theme/tokens';
import { Seg } from '@/ui/Controls';

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Automatic' },
];

const ease = Easing.bezier(...motion.ease);

/**
 * Light / Dark / Automatic. The thumb springs to the choice first (as on the board), then the
 * new theme's colour grows out of the chosen option to cover the screen, the whole app switches
 * underneath it, and it fades away to show every screen in the other theme. Reduced motion
 * switches at once. `veil` goes at the screen's root (the Page overlay) so it covers everything.
 */
export function useThemeSwitch(): { control: ReactNode; veil: ReactNode } {
  const { c, mode, setMode } = useTheme();
  const system = useColorScheme();
  const still = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const [shown, setShown] = useState<ThemeMode>(mode);
  const [veil, setVeil] = useState<{ color: string; x: number; y: number } | null>(null);
  const box = useRef<ComponentRef<typeof View>>(null);
  const grow = useSharedValue(0);
  const fade = useSharedValue(1);
  const radius = Math.hypot(width, height);

  const finish = (next: ThemeMode) => {
    setMode(next);
    fade.set(withTiming(0, { duration: 460, easing: ease }, (done) => {
      if (done) runOnJS(setVeil)(null);
    }));
  };

  const pick = (next: ThemeMode) => {
    setShown(next);
    const toDark = next === 'dark' || (next === 'system' && system === 'dark');
    if (toDark === c.dark || still) {
      setMode(next);
      return;
    }
    const index = OPTIONS.findIndex((o) => o.value === next);
    const start = (x: number, y: number) => {
      grow.set(0);
      fade.set(1);
      setVeil({ color: (toDark ? dark : light).bg, x, y });
      grow.set(withTiming(1, { duration: 560, easing: ease }, (done) => {
        if (done) runOnJS(finish)(next);
      }));
    };
    // Let the thumb land, then grow the new colour from the option that was chosen.
    setTimeout(() => {
      if (!box.current) {
        start(width / 2, height / 2);
        return;
      }
      box.current.measureInWindow((left, top, w, h) => start(left + ((index + 0.5) * w) / OPTIONS.length, top + h / 2));
    }, 300);
  };

  const circle = useAnimatedStyle(() => ({ opacity: fade.get(), transform: [{ scale: Math.max(0.001, grow.get()) }] }));

  const control = (
    <View ref={box} collapsable={false}>
      <Seg options={OPTIONS} value={shown} onChange={pick} />
    </View>
  );
  return {
    control,
    veil: veil ? (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { position: 'absolute', overflow: 'hidden', zIndex: 100 }]}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: veil.x - radius,
                top: veil.y - radius,
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                backgroundColor: veil.color,
              },
              circle,
            ]}
          />
        </View>
      ) : null,
  };
}

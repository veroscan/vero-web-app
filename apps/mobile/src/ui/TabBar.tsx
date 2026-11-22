import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { Tabs } from 'expo-router';
import { useEffect, useState, type ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { tap } from './Surfaces';
import { T } from './Text';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const ICONS: Record<string, { icon: IconName; label: string }> = {
  index: { icon: 'home', label: 'Overview' },
  findings: { icon: 'flag', label: 'Findings' },
  deadlines: { icon: 'cal', label: 'Deadlines' },
  watchlist: { icon: 'eye', label: 'Watchlist' },
};

/** The kit's floating glass tab bar: a pill glides to the chosen tab on a spring. */
export function TabBar({ state, navigateToTab }: TabBarProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const routes = state.routes.filter((r) => r.name in ICONS);
  const active = routes.findIndex((r) => r.key === state.routes[state.index]?.key);
  const step = (width - 12) / Math.max(1, routes.length);
  const x = useSharedValue(0);
  useEffect(() => {
    if (active >= 0) x.set(withSpring(active * step, { ...motion.spring, damping: 16 }));
  }, [active, step, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: Math.max(insets.bottom - 8, 0) + 18,
        height: 66,
        borderRadius: radius.tabs,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: c.tabBorder,
        shadowColor: c.dark ? '#00000A' : '#0B0E3A',
        shadowOpacity: c.dark ? 0.9 : 0.45,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 20 },
        elevation: 12,
      }}
    >
      <BlurView intensity={Platform.OS === 'android' ? 0 : 60} tint={c.dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === 'android' ? (c.dark ? 'rgba(8,11,70,0.96)' : 'rgba(255,255,255,0.97)') : c.tabBg }]} />
      {width > 0 && active >= 0 ? (
        <Animated.View style={[{ position: 'absolute', top: 6, bottom: 6, left: 6, width: step, borderRadius: radius.pill, overflow: 'hidden' }, pill]}>
          <LinearGradient colors={c.pill} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
      <View style={{ flex: 1, flexDirection: 'row', padding: 6 }} accessibilityRole="tablist">
        {routes.map((route, i) => {
          const meta = ICONS[route.name];
          if (!meta) return null;
          const on = i === active;
          const color = on ? c.tabOn : c.ink3;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={meta.label}
              testID={`tab-${route.name}`}
              onPress={() => {
                if (on) return;
                tap();
                navigateToTab(route.key);
              }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 }}
            >
              <Icon name={meta.icon} size={22} color={color} />
              <T weight={700} size={11} color={color} style={{ lineHeight: 14 }}>
                {meta.label}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

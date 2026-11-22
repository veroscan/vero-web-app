import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { Atmos } from '@/ui/Atmos';
import { TAB_SPACE } from '@/ui/Screen';
import { IconBtn } from '@/ui/Surfaces';
import { T } from '@/ui/Text';

/** The dark boards' page light: an indigo glow top right and a blue one bottom left (mobile-dark.css .phone). */
function DarkGlow() {
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <RadialGradient id="pg1" cx="85%" cy="0%" rx="133%" ry="50%" fx="85%" fy="0%">
          <Stop offset="0" stopColor="#1D34D6" stopOpacity={0.35} />
          <Stop offset="0.6" stopColor="#1D34D6" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="pg2" cx="0%" cy="100%" rx="108%" ry="45%" fx="0%" fy="100%">
          <Stop offset="0" stopColor="#0182FA" stopOpacity={0.12} />
          <Stop offset="0.6" stopColor="#0182FA" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#pg1)" />
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#pg2)" />
    </Svg>
  );
}

/**
 * The kit's light page (`.phone.light`): no navy top, a light background, the white `.ib` header
 * buttons, and the content on the 22px `.pad`. In dark it is the deep navy page with its glow.
 * `dock` pins actions to the bottom over a fade (`.dock`); `tabs` leaves room for the tab bar.
 */
export function Page({
  children,
  back,
  right,
  tabs,
  dock,
  refreshing,
  onRefresh,
  overlay,
  testID,
}: {
  children: ReactNode;
  back?: boolean;
  right?: ReactNode;
  tabs?: boolean;
  dock?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Drawn over everything, such as a toast. */
  overlay?: ReactNode;
  testID?: string;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = (tabs ? TAB_SPACE : dock ? 150 : 60) + insets.bottom;
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }} testID={testID}>
      <StatusBar style={c.dark ? 'light' : 'dark'} />
      {c.dark ? <DarkGlow /> : null}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 6, paddingBottom: bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={c.ink3} colors={[c.navy]} /> : undefined}
      >
        {back || right ? (
          <View style={styles.hd}>
            {back ? <IconBtn light icon="back" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} /> : null}
            <View style={{ flex: 1 }} />
            {right}
          </View>
        ) : null}
        <View style={{ paddingHorizontal: 22, paddingTop: back || right ? 0 : 12 }}>{children}</View>
      </ScrollView>
      {tabs ? (
        <LinearGradient
          pointerEvents="none"
          colors={[c.dark ? 'rgba(1,1,42,0)' : 'rgba(244,246,250,0)', c.bg]}
          locations={[0, 0.7]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 130 }}
        />
      ) : null}
      {dock ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 28, paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 12) + 22 }}>
          <LinearGradient pointerEvents="none" colors={[c.dark ? 'rgba(1,1,42,0)' : 'rgba(244,246,250,0)', c.bg]} locations={[0, 0.36]} style={StyleSheet.absoluteFill} />
          {dock}
        </View>
      ) : null}
      {overlay}
    </View>
  );
}

/** `.lbl`: the small bold label above a list or control. */
export function Label({ children, style }: { children: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ marginTop: 26, marginBottom: 10, marginHorizontal: 4 }, style]}>
      <T variant="label" accessibilityRole="header">
        {children}
      </T>
    </View>
  );
}

/** The demo's "Sample data" label, from the API's own flag. */
export function SampleTag({ onNavy, style }: { onNavy?: boolean; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View
      style={[
        { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 26, borderRadius: 9, backgroundColor: onNavy ? 'rgba(255,255,255,0.12)' : c.soft },
        style,
      ]}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: onNavy ? '#FFB648' : c.warn }} />
      <T variant="kick" onNavy={onNavy} color={onNavy ? '#fff' : c.ink2}>
        Sample data
      </T>
    </View>
  );
}

/** A rounded navy card with the brand atmosphere behind its content (`.nd`, `.pv`). */
export function NavyCard({ children, style, radius = 26 }: { children: ReactNode; style?: StyleProp<ViewStyle>; radius?: number }) {
  return (
    <View style={[{ borderRadius: radius, shadowColor: '#00003C', shadowOpacity: 0.7, shadowRadius: 24, shadowOffset: { width: 0, height: 22 }, elevation: 8 }, style]}>
      <View style={{ borderRadius: radius, overflow: 'hidden' }}>
        <Atmos />
        {children}
      </View>
    </View>
  );
}

/** The dark boards' panel behind a custom card: the same navy glass as `Card`. */
export function Panel({ children, style, radius = 20 }: { children: ReactNode; style?: StyleProp<ViewStyle>; radius?: number }) {
  const { c } = useTheme();
  return (
    <View style={[{ borderRadius: radius, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.cardGradient ? 'transparent' : c.card, overflow: 'hidden' }, style]}>
      {c.cardGradient ? <LinearGradient colors={c.cardGradient} style={StyleSheet.absoluteFill} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hd: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 16 },
});

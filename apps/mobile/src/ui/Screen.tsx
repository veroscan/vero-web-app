import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { Atmos } from './Atmos';
import { IconBtn } from './Surfaces';
import { T } from './Text';

/** Room the floating tab bar needs at the bottom of a tab screen. */
export const TAB_SPACE = 140;

/**
 * The kit's screen: a navy top with the brand atmosphere (`.top`), then the light body sheet
 * (`.body`) that overlaps it by 28px with 30px corners. Scrolls as one piece.
 */
export function Screen({
  top,
  children,
  tabs,
  refreshing,
  onRefresh,
  bodyStyle,
  testID,
}: {
  top: ReactNode;
  children: ReactNode;
  /** Leaves room for the floating tab bar. */
  tabs?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  bodyStyle?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }} testID={testID}>
      <StatusBar style="light" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor="#fff" progressViewOffset={insets.top} /> : undefined}
      >
        <View style={{ paddingTop: insets.top + 6, paddingBottom: 46, overflow: 'hidden' }}>
          <Atmos />
          {top}
        </View>
        <View
          style={[
            {
              flexGrow: 1,
              marginTop: -28,
              borderTopLeftRadius: radius.sheet,
              borderTopRightRadius: radius.sheet,
              backgroundColor: c.bg,
              paddingTop: 24,
              paddingHorizontal: 18,
              paddingBottom: (tabs ? TAB_SPACE : 40) + insets.bottom,
              minHeight: 420,
              overflow: 'hidden',
            },
            bodyStyle,
          ]}
        >
          {c.dark ? <LinearGradient colors={[c.bodyTop, c.bg]} locations={[0, 1]} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 260 }} /> : null}
          {children}
        </View>
      </ScrollView>
      {tabs ? (
        <LinearGradient
          pointerEvents="none"
          colors={[c.dark ? 'rgba(1,1,42,0)' : 'rgba(244,246,250,0)', c.bg]}
          locations={[0, 0.7]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 130 }}
        />
      ) : null}
    </View>
  );
}

/** A whole navy screen (Welcome, Sign in, Scanning): atmosphere behind everything. */
export function NavyScreen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const inner = <View style={{ flexGrow: 1, paddingTop: insets.top + 6, paddingBottom: insets.bottom + 20 }}>{children}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: '#00004A' }}>
      <StatusBar style="light" />
      <Atmos />
      {scroll ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </View>
  );
}

/** `.hd` for pushed screens on the navy top: a back button, a title, and optional actions. */
export function BackBar({ title, right, onBack }: { title?: string; right?: ReactNode; onBack?: () => void }) {
  return (
    <View style={styles.hd}>
      <IconBtn icon="back" label="Back" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))} />
      <View style={{ flex: 1 }}>
        {title ? (
          <T weight={700} size={16} onNavy numberOfLines={1} style={{ textAlign: 'center' }}>
            {title}
          </T>
        ) : null}
      </View>
      <View style={{ minWidth: 42, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

/** Horizontal padding for content on the navy top (`.pad`). */
export function Pad({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ paddingHorizontal: 22 }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  hd: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 16 },
});

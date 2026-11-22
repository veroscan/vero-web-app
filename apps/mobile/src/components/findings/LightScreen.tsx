import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { TAB_SPACE } from '@/ui/Screen';
import { T } from '@/ui/Text';

function clear(dark: boolean): string {
  return dark ? 'rgba(1,1,42,0)' : 'rgba(244,246,250,0)';
}

/**
 * The kit's `.phone.light` screen (Findings, Documents): no navy top, the light page from the
 * status bar down, with an optional `.hd` row, pull to refresh, and room for the tab bar or a dock.
 */
export function LightScreen({
  children,
  header,
  tabs,
  dock,
  refreshing,
  onRefresh,
}: {
  children: ReactNode;
  header?: ReactNode;
  tabs?: boolean;
  dock?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={c.dark ? 'light' : 'dark'} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + (header ? 6 : 12), paddingBottom: (tabs ? TAB_SPACE : dock ? 150 : 48) + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={c.ink3} progressViewOffset={insets.top} /> : undefined}
      >
        {header ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 16 }}>{header}</View> : null}
        <View style={{ paddingHorizontal: 22 }}>{children}</View>
      </ScrollView>
      {tabs ? <LinearGradient pointerEvents="none" colors={[clear(c.dark), c.bg]} locations={[0, 0.7]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 130 }} /> : null}
      {dock ? <Dock>{dock}</Dock> : null}
    </View>
  );
}

/** The kit's `.dock`: the one action pinned to the bottom over a fade. */
export function Dock({ children, note }: { children: ReactNode; note?: string }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
      <LinearGradient pointerEvents="none" colors={[clear(c.dark), c.bg]} locations={[0, 0.36]} style={StyleSheet.absoluteFill} />
      <View style={{ paddingTop: 28, paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 12) + 22 }}>
        {children}
        {note ? (
          <T variant="small" center style={{ marginTop: 10 }}>
            {note}
          </T>
        ) : null}
      </View>
    </View>
  );
}

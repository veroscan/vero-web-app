import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { IconBtn } from '@/ui/Surfaces';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/**
 * The all-light boards (Search, Confirm): `.phone.light` with the `.hd` back button, content on
 * `.pad`, and an optional `.dock` pinned to the bottom. In dark the page carries the kit's two
 * soft brand glows (mobile-dark.css `.phone`).
 */
export function LightScreen({ children, right, onBack, dock, testID }: { children: ReactNode; right?: ReactNode; onBack?: () => void; dock?: ReactNode; testID?: string }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView testID={testID} behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={c.dark ? 'light' : 'dark'} />
      {c.dark ? (
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <RadialGradient id="ls-a" cx="85%" cy="0%" rx="135%" ry="50%">
              <Stop offset="0" stopColor="#1D34D6" stopOpacity={0.35} />
              <Stop offset="0.6" stopColor="#1D34D6" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="ls-b" cx="0%" cy="100%" rx="110%" ry="45%">
              <Stop offset="0" stopColor="#0182FA" stopOpacity={0.12} />
              <Stop offset="0.6" stopColor="#0182FA" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#ls-a)" />
          <Rect width="100%" height="100%" fill="url(#ls-b)" />
        </Svg>
      ) : null}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 6, paddingBottom: (dock ? 170 : 40) + insets.bottom }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 16 }}>
          <IconBtn icon="back" label="Back" light onPress={onBack ?? goBack} />
          <View style={{ flex: 1 }} />
          {right}
        </View>
        <View style={{ paddingHorizontal: 22 }}>{children}</View>
      </ScrollView>
      {dock ? <Dock>{dock}</Dock> : null}
    </KeyboardAvoidingView>
  );
}

/** `.dock`: the bottom action area that fades the page out behind it. `navy` for the all-navy boards. */
export function Dock({ children, navy, style }: { children: ReactNode; navy?: boolean; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const fade: [string, string] = navy ? ['rgba(0,0,50,0)', '#000040'] : [c.dark ? 'rgba(1,1,42,0)' : 'rgba(244,246,250,0)', c.bg];
  return (
    <View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 28, paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 12) + 18 }, style]}>
      <LinearGradient pointerEvents="none" colors={fade} locations={[0, navy ? 0.4 : 0.36]} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

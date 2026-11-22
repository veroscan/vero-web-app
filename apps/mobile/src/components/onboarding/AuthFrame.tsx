import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Rise } from '@/ui/Motion';
import { Screen } from '@/ui/Screen';
import { IconBtn } from '@/ui/Surfaces';
import { Kicker, T } from '@/ui/Text';

/** Room the sheet usually needs, so the navy top fills the rest of the phone as on the board. */
const SHEET_ROOM = 420;

/**
 * The SignIn board: the navy top with a big light headline, and the sign-in sheet (white in
 * light, the kit's deep navy sheet in dark) rising from the bottom with its grab handle.
 */
export function AuthFrame({ kicker, bold, title, children, onBack }: { kicker: string; bold: string; title: string; children: ReactNode; onBack?: () => void }) {
  const { c } = useTheme();
  const { height } = useWindowDimensions();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <Screen
        top={
          <View style={{ paddingHorizontal: 22, paddingTop: 8, minHeight: Math.max(260, height - SHEET_ROOM) }}>
            <IconBtn icon="back" label="Back" onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/welcome')))} />
            <Rise d={1} style={{ marginTop: 30 }}>
              <Kicker onNavy bold={bold}>
                {`${kicker} ·`}
              </Kicker>
            </Rise>
            <Rise d={2}>
              <T variant="h1" onNavy accessibilityRole="header" style={{ marginTop: 10 }}>
                {title}
              </T>
            </Rise>
          </View>
        }
        bodyStyle={{ backgroundColor: c.dark ? c.bg : '#FFFFFF', paddingTop: 10, paddingHorizontal: 20 }}
      >
        <LinearGradient colors={c.sheet} style={StyleSheet.absoluteFill} />
        <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: c.grab, alignSelf: 'center', marginBottom: 18 }} />
        <Rise d={3}>{children}</Rise>
      </Screen>
    </KeyboardAvoidingView>
  );
}

/** The sheet's heading and line under it (`.h2` at 22px, `.sub`). */
export function SheetHead({ title, sub, center }: { title: string; sub?: ReactNode; center?: boolean }) {
  return (
    <View style={center ? { alignItems: 'center' } : undefined}>
      <T variant="h2" accessibilityRole="header" style={{ fontSize: 22, lineHeight: 28, letterSpacing: -0.4, textAlign: center ? 'center' : 'left' }}>
        {title}
      </T>
      {sub ? (
        <T variant="sub" style={{ marginTop: 4, lineHeight: 22, textAlign: center ? 'center' : 'left', maxWidth: center ? 310 : undefined }}>
          {sub}
        </T>
      ) : null}
    </View>
  );
}

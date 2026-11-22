import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutDown, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { asApiError } from '@/lib/api';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from '@/ui/Icon';
import { Btn, Card, tap } from '@/ui/Surfaces';
import { T } from '@/ui/Text';

/** Calm placeholder blocks that breathe while a screen loads, in the shape of what's coming. */
export function Skeleton({ blocks = [72, 160, 64, 64, 64], style }: { blocks?: number[]; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const still = useReducedMotion();
  const o = useSharedValue(0.55);
  useEffect(() => {
    if (!still) o.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [o, still]);
  const pulse = useAnimatedStyle(() => ({ opacity: o.get() }));
  return (
    <Animated.View accessibilityRole="progressbar" accessibilityLabel="Loading" style={[{ gap: 10, marginTop: 20 }, pulse, style]}>
      {blocks.map((height, i) => (
        <View key={i} style={{ height, borderRadius: height > 90 ? 26 : 20, backgroundColor: c.soft, borderWidth: 1, borderColor: c.line2 }} />
      ))}
    </Animated.View>
  );
}

/** Something went wrong: the API's own words, and a way to try again. */
export function Problem({ error, onRetry, style }: { error: unknown; onRetry?: () => void; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <Card style={[{ marginTop: 20, alignItems: 'flex-start', gap: 10 }, style]}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Icon name="flag" size={20} color={c.urgent} />
        <T weight={700} size={15}>
          We couldn&apos;t load this
        </T>
      </View>
      <T variant="sub" style={{ marginTop: 0 }} accessibilityRole="alert">
        {asApiError(error).message}
      </T>
      {onRetry ? <Btn kind="ghost" label="Try again" onPress={onRetry} style={{ alignSelf: 'stretch', height: 48 }} /> : null}
    </Card>
  );
}

/** An empty state: a small drawing, a plain headline and what to do next. */
export function Empty({ art, title, body, children, style }: { art?: ReactNode; title: string; body?: string; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Card style={[{ marginTop: 20, alignItems: 'center', paddingVertical: 26 }, style]}>
      {art}
      <T variant="h3" center accessibilityRole="header" style={{ marginTop: art ? 14 : 0 }}>
        {title}
      </T>
      {body ? (
        <T variant="sub" center style={{ marginTop: 6, maxWidth: 290 }}>
          {body}
        </T>
      ) : null}
      {children ? <View style={{ alignSelf: 'stretch', marginTop: 18 }}>{children}</View> : null}
    </Card>
  );
}

/** A compact pill button for actions inside cards and rows (44px hit area). */
export function SmallBtn({ label, onPress, icon, tone = 'soft', busy, disabled, testID }: { label: string; onPress: () => void; icon?: IconName; tone?: 'soft' | 'danger' | 'primary'; busy?: boolean; disabled?: boolean; testID?: string }) {
  const { c } = useTheme();
  const fg = tone === 'danger' ? c.urgent : tone === 'primary' ? '#fff' : c.dark ? '#fff' : c.navy;
  const bg = tone === 'primary' ? c.navy : tone === 'danger' ? (c.dark ? 'rgba(255,122,127,0.12)' : '#FCECED') : c.dark ? 'rgba(61,123,255,0.16)' : '#EEF1FB';
  const off = disabled || busy;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!off, busy: !!busy }}
      disabled={off}
      hitSlop={6}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({ height: 38, paddingHorizontal: 14, borderRadius: 12, backgroundColor: bg, flexDirection: 'row', alignItems: 'center', gap: 7, opacity: off ? 0.5 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] })}
    >
      {busy ? <ActivityIndicator size="small" color={fg} /> : icon ? <Icon name={icon} size={16} color={fg} stroke={2} /> : null}
      <T weight={700} size={13.5} color={fg}>
        {label}
      </T>
    </Pressable>
  );
}

/** A short message that rises above the tab bar and goes after a moment. */
export function useToast(lift = 0): { toast: (message: string) => void; node: ReactNode } {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<{ text: string; key: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage({ text, key: Date.now() });
    timer.current = setTimeout(() => setMessage(null), 2800);
  }, []);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const node = message ? (
    <Animated.View
      key={message.key}
      entering={FadeInDown.duration(380)}
      exiting={FadeOutDown.duration(260)}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={{ position: 'absolute', left: 22, right: 22, bottom: insets.bottom + 30 + lift, alignItems: 'center' }}
    >
      <View style={{ paddingVertical: 12, paddingHorizontal: 18, borderRadius: 16, backgroundColor: c.dark ? '#1D2A9E' : '#0B0E3A', shadowColor: '#000014', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 12 }, elevation: 8 }}>
        <T weight={600} size={14} color="#fff" center>
          {message.text}
        </T>
      </View>
    </Animated.View>
  ) : null;
  return { toast, node };
}

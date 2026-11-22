import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Children, isValidElement, type ReactNode } from 'react';
import { ActivityIndicator, Platform, Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { T } from './Text';

export function tap(): void {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

/** Springs down to `to` while pressed, like the kit's :active scale. */
function usePress(to = 0.96) {
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.get() }] }));
  return {
    style,
    onPressIn: () => {
      s.set(withSpring(to, motion.spring));
    },
    onPressOut: () => {
      s.set(withSpring(1, motion.spring));
    },
  };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function cardShadow(dark: boolean): ViewStyle {
  return dark
    ? { shadowColor: '#00000A', shadowOpacity: 0.9, shadowRadius: 20, shadowOffset: { width: 0, height: 18 }, elevation: 4 }
    : { shadowColor: '#0B0E3A', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 2 };
}

/** `.card`: white with a hairline in light, a deep navy glass gradient in dark. */
export function Card({ children, style, onPress, padded = true, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; padded?: boolean; accessibilityLabel?: string }) {
  const { c } = useTheme();
  const press = usePress(0.98);
  const body = (
    <>
      {c.cardGradient ? <LinearGradient colors={c.cardGradient} style={{ position: 'absolute', inset: 0, borderRadius: radius.card }} /> : null}
      {children}
    </>
  );
  const base: ViewStyle = {
    backgroundColor: c.cardGradient ? 'transparent' : c.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: c.cardBorder,
    padding: padded ? 20 : 0,
    ...cardShadow(c.dark),
  };
  if (!onPress) return <View style={[base, style]}>{body}</View>;
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        tap();
        onPress();
      }}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[base, press.style, style]}
    >
      {body}
    </AnimatedPressable>
  );
}

/** `.list`: rows separated by hairlines inside one rounded surface. */
export function List({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[{ borderRadius: radius.card, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.cardGradient ? 'transparent' : c.card, overflow: 'hidden' }, style]}>
      {c.cardGradient ? <LinearGradient colors={c.cardGradient} style={{ position: 'absolute', inset: 0 }} /> : null}
      {items.map((child, i) => (
        <View key={child.key ?? i} style={i > 0 ? { borderTopWidth: 1, borderTopColor: c.line2 } : null}>
          {child}
        </View>
      ))}
    </View>
  );
}

/** `.row`: title, small line, and something on the right (status, points or a chevron). */
export function Row({
  title,
  sub,
  right,
  left,
  chevron,
  onPress,
  accessibilityLabel,
  testID,
}: {
  title: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  left?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}) {
  const { c } = useTheme();
  const inner = (pressed: boolean) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 18, backgroundColor: pressed ? c.rowPressed : 'transparent' }}>
      {left}
      <View style={{ flex: 1, minWidth: 0 }}>
        {typeof title === 'string' ? (
          <T weight={700} size={15} style={{ lineHeight: 20, letterSpacing: -0.15 }}>
            {title}
          </T>
        ) : (
          title
        )}
        {typeof sub === 'string' ? (
          <T variant="small" numberOfLines={1} style={{ marginTop: 2 }}>
            {sub}
          </T>
        ) : (
          sub
        )}
      </View>
      {right ? <View style={{ alignItems: 'flex-end' }}>{right}</View> : null}
      {chevron ? <Icon name="chev" size={18} color={c.ink4} /> : null}
    </View>
  );
  if (!onPress) return inner(false);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        tap();
        onPress();
      }}
    >
      {({ pressed }) => inner(pressed)}
    </Pressable>
  );
}

type BtnKind = 'primary' | 'white' | 'quiet' | 'ghost';

/** `.btn`: 56 tall, 18 radius, springs on press. */
export function Btn({
  label,
  kind = 'primary',
  icon,
  onPress,
  disabled,
  busy,
  style,
  testID,
  ...rest
}: { label: string; kind?: BtnKind; icon?: IconName; onPress?: () => void; disabled?: boolean; busy?: boolean; style?: StyleProp<ViewStyle>; testID?: string } & Omit<PressableProps, 'style' | 'onPress' | 'children'>) {
  const { c } = useTheme();
  const press = usePress(0.96);
  const fg = kind === 'primary' ? c.primaryText : kind === 'white' ? '#00004A' : kind === 'quiet' ? 'rgba(255,255,255,0.78)' : c.ink;
  const off = disabled || busy;
  const shell: ViewStyle = {
    height: kind === 'quiet' ? 46 : 56,
    borderRadius: radius.btn,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    overflow: 'hidden',
    opacity: disabled ? 0.35 : 1,
    backgroundColor: kind === 'white' ? '#fff' : kind === 'ghost' ? c.soft : 'transparent',
    ...(kind === 'primary'
      ? { shadowColor: c.dark ? '#2F64F0' : '#000066', shadowOpacity: c.dark ? 0.9 : 0.8, shadowRadius: 16, shadowOffset: { width: 0, height: 14 }, elevation: 6 }
      : kind === 'white'
        ? { shadowColor: '#000014', shadowOpacity: 0.7, shadowRadius: 20, shadowOffset: { width: 0, height: 20 }, elevation: 6 }
        : {}),
  };
  return (
    <AnimatedPressable
      {...rest}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!busy }}
      disabled={off}
      onPress={() => {
        tap();
        onPress?.();
      }}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[shell, press.style, style]}
    >
      {kind === 'primary' ? <LinearGradient colors={c.primary} style={{ position: 'absolute', inset: 0 }} /> : null}
      {/* Raised above the gradient: on web a positioned layer paints over unpositioned siblings. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 1 }}>
        {busy ? <ActivityIndicator color={fg} /> : icon ? <Icon name={icon} size={19} color={fg} /> : null}
        <T weight={700} size={kind === 'quiet' ? 15 : 16} color={fg} style={{ letterSpacing: -0.15 }}>
          {label}
        </T>
      </View>
    </AnimatedPressable>
  );
}

/** `.ib`: the 42px square icon button on the navy top (or on light screens). */
export function IconBtn({ icon, onPress, label, dot, light }: { icon: IconName; onPress: () => void; label: string; dot?: boolean; light?: boolean }) {
  const { c } = useTheme();
  const press = usePress(0.9);
  const onWhite = light && !c.dark;
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress();
      }}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[
        {
          width: 42,
          height: 42,
          borderRadius: radius.ib,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: onWhite ? '#fff' : light ? c.ibBg : 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          borderColor: onWhite ? c.line : light ? c.ibBorder : 'rgba(255,255,255,0.14)',
        },
        press.style,
      ]}
    >
      <Icon name={icon} size={20} color={onWhite ? c.ink : '#fff'} />
      {dot ? <View style={{ position: 'absolute', top: 10, right: 11, width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF6B70', borderWidth: 2, borderColor: '#00004A' }} /> : null}
    </AnimatedPressable>
  );
}

/** The `.sec` heading row: a title with an optional link on the right. */
export function Section({ title, action, onAction, style }: { title: string; action?: string; onAction?: () => void; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 28, marginBottom: 12, marginHorizontal: 4 }, style]}>
      <T variant="h2" accessibilityRole="header">
        {title}
      </T>
      {action && onAction ? (
        <Pressable accessibilityRole="link" onPress={onAction} hitSlop={10}>
          <T weight={700} size={14} color={c.link}>
            {action}
          </T>
        </Pressable>
      ) : null}
    </View>
  );
}

/** The kit's `.st` status word, coloured by severity. */
export function Status({ word, tone }: { word: string; tone: 'urgent' | 'warn' | 'good' | 'muted' }) {
  const { c } = useTheme();
  const color = tone === 'urgent' ? c.urgent : tone === 'warn' ? c.warn : tone === 'good' ? c.good : c.ink3;
  return (
    <T weight={700} size={13} color={color}>
      {word}
    </T>
  );
}

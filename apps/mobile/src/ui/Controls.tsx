import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef, useEffect, useState, type ComponentRef, type ReactNode } from 'react';
import {
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { font } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius } from '@/theme/tokens';
import { Icon, type IconName } from './Icon';
import { tap } from './Surfaces';
import { T } from './Text';

/** `.seg` / `.seg.s3`: options on a soft track with a thumb that springs to the chosen one. */
export function Seg<V extends string>({ options, value, onChange, style }: { options: { value: V; label: string }[]; value: V; onChange: (value: V) => void; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useSharedValue(0);
  const step = (width - 8) / options.length;
  useEffect(() => {
    x.set(withSpring(index * step, motion.spring));
  }, [index, step, x]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[{ flexDirection: 'row', backgroundColor: c.segBg, borderRadius: radius.seg, padding: 4 }, style]}
    >
      {width > 0 ? (
        <Animated.View style={[{ position: 'absolute', top: 4, bottom: 4, left: 4, width: step, borderRadius: radius.segThumb, overflow: 'hidden', shadowColor: c.dark ? '#2F64F0' : '#0B0E3A', shadowOpacity: c.dark ? 0.8 : 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, thumb]}>
          <LinearGradient colors={c.segThumb} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (on) return;
              tap();
              onChange(o.value);
            }}
            style={{ flex: 1, height: 38, alignItems: 'center', justifyContent: 'center' }}
          >
            <T weight={700} size={14} color={on ? c.segOnText : c.ink3}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

/** `.sw`: 52 x 32 switch with a springy knob. */
export function Switch({ value, onChange, label, disabled }: { value: boolean; onChange: (next: boolean) => void; label: string; disabled?: boolean }) {
  const { c } = useTheme();
  const x = useSharedValue(value ? 20 : 0);
  useEffect(() => {
    x.set(withSpring(value ? 20 : 0, motion.spring));
  }, [value, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        tap();
        onChange(!value);
      }}
      style={{ width: 52, height: 32, borderRadius: 16, backgroundColor: value ? c.switchOn : c.switchOff, opacity: disabled ? 0.4 : 1 }}
    >
      <Animated.View style={[{ position: 'absolute', top: 3, left: 3, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', shadowColor: '#0B0E3A', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 }, knob]} />
    </Pressable>
  );
}

/**
 * `.bs` bottom sheet with its scrim. Slides up with the kit's ease, closes on the scrim, the
 * back gesture, or by dragging the grab handle down.
 */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  const { c } = useTheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(open);
  const y = useSharedValue(height);
  const fade = useSharedValue(0);
  const ease = Easing.bezier(...motion.ease);
  // Mounts as soon as it opens (adjusted during render, not in the effect); unmounts after the slide out.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) {
      y.set(withTiming(0, { duration: 600, easing: ease }));
      fade.set(withTiming(1, { duration: 450, easing: ease }));
    } else if (mounted) {
      fade.set(withTiming(0, { duration: 300 }));
      y.set(
        withTiming(height, { duration: 380, easing: ease }, (done) => {
          if (done) runOnJS(setMounted)(false);
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const drag = PanResponder.create({
    onMoveShouldSetPanResponder: (_e, g) => g.dy > 6,
    onPanResponderMove: (_e, g) => {
      y.set(Math.max(0, g.dy));
    },
    onPanResponderRelease: (_e, g) => {
      if (g.dy > 120 || g.vy > 1.1) onClose();
      else y.set(withSpring(0, motion.spring));
    },
  });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));

  if (!mounted) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }, scrimStyle]}>
        <Pressable accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={label}
        style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: height * 0.92, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, overflow: 'hidden' }, sheetStyle]}
      >
        <LinearGradient colors={c.sheet} style={StyleSheet.absoluteFill} />
        <View {...drag.panHandlers} style={{ paddingTop: 10, paddingBottom: 18, alignItems: 'center' }}>
          <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: c.grab }} />
        </View>
        <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16) + 24 }}>{children}</View>
      </Animated.View>
    </Modal>
  );
}

/** A text field in the kit's style: white (or soft navy) with a hairline and an optional icon. */
export const Field = forwardRef<ComponentRef<typeof TextInput>, TextInputProps & { icon?: IconName; style?: StyleProp<ViewStyle> }>(function Field({ icon, style, ...rest }, ref) {
  const { c } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          height: 56,
          borderRadius: radius.btn,
          paddingHorizontal: 16,
          backgroundColor: c.fieldBg,
          borderWidth: 1,
          borderColor: focus ? (c.dark ? '#4C86FF' : c.navy) : c.cardBorder,
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={c.ink3} /> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={c.placeholder}
        onFocus={(e) => {
          setFocus(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          rest.onBlur?.(e);
        }}
        {...rest}
        style={[{ flex: 1, height: '100%', fontFamily: font.sans(600), fontSize: 16, color: c.ink }, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null]}
      />
    </View>
  );
});

import { Platform, Text, type TextProps, type TextStyle } from 'react-native';
import { font, type Weight } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'sub' | 'small' | 'label' | 'kick';

interface Props extends TextProps {
  variant?: Variant;
  weight?: Weight;
  size?: number;
  color?: string;
  /** On the navy top: white type with soft white secondaries. */
  onNavy?: boolean;
  center?: boolean;
}

/** Type scale from the mobile kit (.h1 .h2 .sub .mono). Letter-spacing in the kit is in em. */
export function T({ variant = 'body', weight, size, color, onNavy, center, style, ...rest }: Props) {
  const { c } = useTheme();
  const base: Record<Variant, TextStyle> = {
    h1: { fontSize: 34, lineHeight: 36, letterSpacing: -1.5, fontFamily: font.sans(300), color: onNavy ? '#fff' : c.ink },
    h2: { fontSize: 17, lineHeight: 22, letterSpacing: -0.25, fontFamily: font.sans(700), color: onNavy ? '#fff' : c.ink },
    h3: { fontSize: 21, lineHeight: 25, letterSpacing: -0.5, fontFamily: font.sans(700), color: onNavy ? '#fff' : c.ink },
    body: { fontSize: 15, lineHeight: 22, fontFamily: font.sans(500), color: onNavy ? '#fff' : c.ink },
    sub: { fontSize: 14.5, lineHeight: 21, fontFamily: font.sans(600), color: onNavy ? 'rgba(255,255,255,0.66)' : c.ink3 },
    small: { fontSize: 12.5, lineHeight: 17, fontFamily: font.sans(600), color: onNavy ? 'rgba(255,255,255,0.62)' : c.ink3 },
    label: { fontSize: 13, lineHeight: 17, fontFamily: font.sans(700), color: c.ink3 },
    kick: {
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      fontFamily: font.mono,
      color: onNavy ? 'rgba(255,255,255,0.62)' : c.dark ? 'rgba(200,210,255,0.6)' : c.ink3,
    },
  };
  const extra: TextStyle = {
    ...(weight ? { fontFamily: font.sans(weight) } : {}),
    ...(size ? { fontSize: size, lineHeight: Math.round(size * 1.35) } : {}),
    ...(color ? { color } : {}),
    ...(center ? { textAlign: 'center' } : {}),
  };
  return <Text {...rest} style={[base[variant], extra, style]} />;
}

/** The Lowres Pixel numbers used for scores, counts and days. */
export function Pixel({ size = 36, color, style, ...rest }: TextProps & { size?: number; color?: string }) {
  const { c } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: font.pixel,
          fontSize: size,
          lineHeight: Math.round(size * 0.92),
          letterSpacing: size * 0.02,
          color: color ?? c.ink,
          includeFontPadding: false,
        },
        // The kit's soft glow on dark numbers. Web draws it as a visible box, so phones only.
        c.dark && Platform.OS !== 'web' ? { textShadowColor: 'rgba(120,160,255,0.22)', textShadowRadius: 22 } : null,
        style,
      ]}
    />
  );
}

/** The mono kicker with an optional bold tail: "WHAT VERO FOUND · MISSING / PROOF". */
export function Kicker({ children, bold, onNavy, style }: { children: string; bold?: string; onNavy?: boolean; style?: TextStyle }) {
  const { c } = useTheme();
  return (
    <T variant="kick" onNavy={onNavy} style={style}>
      {children}
      {bold ? <T variant="kick" color={onNavy ? '#fff' : c.ink}>{` ${bold}`}</T> : null}
    </T>
  );
}

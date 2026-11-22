import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { Glass, ON_NAVY_TONE } from '@/components/onboarding/Glass';
import { Wordmark } from '@/components/onboarding/Wordmark';
import { Rise, useCountUp } from '@/ui/Motion';
import { NavyScreen } from '@/ui/Screen';
import { Btn } from '@/ui/Surfaces';
import { Kicker, Pixel, T } from '@/ui/Text';

/** The Sample scan card on the board. It is an illustration and says so in its title. */
const SAMPLE = [
  { label: 'Company record', result: 'In good standing', tone: ON_NAVY_TONE.good },
  { label: 'Annual filing', result: '21 days late', tone: ON_NAVY_TONE.watch },
  { label: 'Who owns the code', result: 'No IP assignment', tone: ON_NAVY_TONE.watch },
];

function SampleRow({ label, result, tone, on }: { label: string; result: string; tone: string; on: boolean }) {
  const v = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    v.set(withTiming(on ? 1 : 0, { duration: on ? 600 : 200 }));
  }, [on, v]);
  const style = useAnimatedStyle(() => ({ opacity: 0.3 + 0.7 * v.get(), transform: [{ translateX: -6 * (1 - v.get()) }] }));
  return (
    <Animated.View style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }, style]}>
      <T weight={600} size={13.5} onNavy>
        {label}
      </T>
      <T weight={700} size={12.5} color={tone}>
        {result}
      </T>
    </Animated.View>
  );
}

function SampleScore() {
  const value = useCountUp(63, { ms: 1100, delay: 900 });
  return <Pixel size={46} color="#fff">{value}</Pixel>;
}

function SampleScan() {
  const still = useReducedMotion();
  const [cycle, setCycle] = useState(0);
  const [count, setLit] = useState(0);
  // With reduced motion every row is shown at once.
  const lit = still ? SAMPLE.length : count;
  useEffect(() => {
    if (still) return;
    const loop = setInterval(() => {
      // Each new cycle starts dark again, then the rows light up one by one.
      setCycle((n) => n + 1);
      setLit(0);
    }, 7000);
    return () => clearInterval(loop);
  }, [still]);
  useEffect(() => {
    if (still) return;
    const timers = SAMPLE.map((_, i) => setTimeout(() => setLit(i + 1), 700 + i * 650));
    return () => timers.forEach(clearTimeout);
  }, [cycle, still]);
  return (
    <Glass scanline style={{ marginTop: 30, paddingTop: 18, paddingHorizontal: 20, paddingBottom: 8 }}>
      <View accessible accessibilityLabel="Sample scan, an example of what Vero shows. Sample score 63 out of 100." style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <T weight={700} size={14.5} onNavy>
            Sample scan
          </T>
          <T weight={600} size={12} color="rgba(255,255,255,0.6)">
            What Vero shows, in seconds
          </T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5 }}>
          <SampleScore key={cycle} />
          <T weight={600} size={12} color="rgba(255,255,255,0.6)" style={{ paddingBottom: 2 }}>
            /100
          </T>
        </View>
      </View>
      {SAMPLE.map((row, i) => (
        <SampleRow key={row.label} {...row} on={i < lit} />
      ))}
    </Glass>
  );
}

/** The Welcome board. Both buttons open sign-in: one email link creates an account or signs in. */
export default function Welcome() {
  return (
    <NavyScreen>
      <View style={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 14 }}>
        <Rise style={{ marginTop: 10, marginLeft: 2 }}>
          <Wordmark height={24} />
        </Rise>
        <Rise d={1} style={{ marginTop: 58 }}>
          <Kicker onNavy bold="Scan → Score → Fix">
            Company legal health ·
          </Kicker>
        </Rise>
        <Rise d={2}>
          <T variant="h1" onNavy accessibilityRole="header" style={{ fontSize: 40, lineHeight: 43, letterSpacing: -1.8, marginTop: 10 }}>
            Know where any company stands.
          </T>
        </Rise>
        <Rise d={3}>
          <T variant="sub" onNavy style={{ marginTop: 6 }}>
            Vero reads official registers and a company&apos;s own documents, then shows what is in order and what is missing.
          </T>
        </Rise>
        <Rise d={4}>
          <SampleScan />
        </Rise>
        <View style={{ flexGrow: 1, minHeight: 32 }} />
        <Rise d={5} style={{ gap: 6 }}>
          <Btn kind="white" label="Get started" icon="arrow" testID="welcome-start" onPress={() => router.push({ pathname: '/sign-in', params: { start: '1' } })} />
          <Btn kind="quiet" label="I already have an account" testID="welcome-sign-in" onPress={() => router.push('/sign-in')} />
        </Rise>
      </View>
    </NavyScreen>
  );
}

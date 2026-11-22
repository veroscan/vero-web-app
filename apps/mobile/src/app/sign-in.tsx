import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { AuthFrame, SheetHead } from '@/components/onboarding/AuthFrame';
import { useAfterSignIn } from '@/components/onboarding/useAfterSignIn';
import { api, asApiError, tokenFromLink } from '@/lib/api';
import { useSession } from '@/lib/session';
import { useTheme } from '@/theme/ThemeProvider';
import { motion } from '@/theme/tokens';
import { Field } from '@/ui/Controls';
import { Rise } from '@/ui/Motion';
import { Btn, tap } from '@/ui/Surfaces';
import { T } from '@/ui/Text';

type Phase =
  | { kind: 'ask' }
  | { kind: 'sent'; email: string }
  | { kind: 'verifying' }
  | { kind: 'link'; reason: 'used' | 'expired' | 'invalid' }
  | { kind: 'failed'; message: string; token: string };

const LINK_WORDS = {
  used: { title: 'This link has already been used', body: "Each sign-in link works once. Enter your email and we'll send a new one." },
  expired: { title: 'This link has expired', body: "Sign-in links last 15 minutes, so this one has run out. Enter your email and we'll send a new one." },
  invalid: { title: "This link isn't valid", body: "Part of the link may be missing. Enter your email and we'll send a new one." },
} as const;

const EMAIL = /^\S+@\S+\.\S+$/;

/** The envelope from the SignIn board; the letter lifts out of it. */
function Envelope() {
  const still = useReducedMotion();
  const y = useSharedValue(still ? 0 : 26);
  useEffect(() => {
    if (!still) y.set(withDelay(200, withTiming(0, { duration: 1200, easing: Easing.bezier(...motion.ease) })));
  }, [still, y]);
  const letter = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  return (
    <View style={{ width: 118, height: 96, alignSelf: 'center' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={118} height={96} viewBox="0 0 132 108" style={{ position: 'absolute' }}>
        <Rect x="16" y="34" width="100" height="66" rx="10" fill="#C9EAFB" />
      </Svg>
      <Animated.View style={[{ position: 'absolute', inset: 0 }, letter]}>
        <Svg width={118} height={96} viewBox="0 0 132 108">
          <G>
            <Rect x="28" y="6" width="76" height="70" rx="8" fill="#fff" stroke="#E3E7F0" />
            <Rect x="38" y="18" width="34" height="5" rx="2.5" fill="#000066" />
            <Rect x="38" y="30" width="56" height="4" rx="2" fill="#DCE4EF" />
            <Rect x="38" y="39" width="46" height="4" rx="2" fill="#DCE4EF" />
            <Rect x="38" y="50" width="40" height="12" rx="4" fill="#0182FA" />
          </G>
        </Svg>
      </Animated.View>
      <Svg width={118} height={96} viewBox="0 0 132 108" style={{ position: 'absolute' }}>
        <Path d="M16 46 66 76l50-30v44a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10z" fill="#9DDAF7" />
      </Svg>
    </View>
  );
}

function TextLink({ label, onPress, testID }: { label: string; onPress: () => void; testID?: string }) {
  const { c } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        tap();
        onPress();
      }}
      style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'center', paddingHorizontal: 12 }}
    >
      <T weight={700} size={14} color={c.ink3}>
        {label}
      </T>
    </Pressable>
  );
}

function EmailForm({ initial, button, onSent }: { initial: string; button: string; onSent: (email: string) => void }) {
  const { c } = useTheme();
  const [email, setEmail] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const send = async () => {
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setProblem('Enter your email address, like you@company.com.');
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      await api.auth.requestMagicLink({ body: { email: value, app: true } });
      onSent(value);
    } catch (error) {
      setProblem(asApiError(error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ marginTop: 20 }}>
      <Field
        testID="sign-in-email"
        icon="mail"
        accessibilityLabel="Work email"
        placeholder="Work email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (problem) setProblem(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={() => void send()}
        style={problem ? { borderColor: c.urgent } : undefined}
      />
      {problem ? (
        <T weight={600} size={13} color={c.urgent} accessibilityRole="alert" style={{ marginTop: 8, marginHorizontal: 4 }}>
          {problem}
        </T>
      ) : null}
      <Btn label={button} busy={busy} testID="sign-in-send" onPress={() => void send()} style={{ marginTop: 14 }} />
    </View>
  );
}

/**
 * Sign in or create an account with one email link. The email opens the app here with
 * ?token=, or the person pastes the link. Used, expired and broken links are said plainly.
 */
export default function SignIn() {
  const { c } = useTheme();
  const params = useLocalSearchParams<{ token?: string; start?: string }>();
  const { status, signInWithToken } = useSession();
  const after = useAfterSignIn();
  const starting = params.start === '1';
  const [phase, setPhase] = useState<Phase>(params.token ? { kind: 'verifying' } : { kind: 'ask' });
  const [lastEmail, setLastEmail] = useState('');
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState('');
  const [pasteProblem, setPasteProblem] = useState<string | null>(null);
  const [resent, setResent] = useState<'idle' | 'busy' | 'done'>('idle');
  // The last token tried, so the same link is not spent twice.
  const [used, setUsed] = useState<string | null>(params.token ?? null);
  // A link opened into this screen, checked by the effect below.
  // (Boxed so the same token arriving again is still a new link.)
  const [link, setLink] = useState<{ token: string } | null>(params.token ? { token: params.token } : null);
  const [seenParam, setSeenParam] = useState(params.token);
  const checking = useRef<{ token: string } | null>(null);

  const check = async (token: string) => {
    try {
      const result = await signInWithToken(token);
      if (result.mfaRequired) {
        router.replace('/two-step');
        return;
      }
      after.go(result.isNewUser);
    } catch (failure) {
      const error = asApiError(failure);
      if (error.code === 'magic_link_invalid') setPhase({ kind: 'link', reason: error.reason === 'used' ? 'used' : error.reason === 'expired' ? 'expired' : 'invalid' });
      else setPhase({ kind: 'failed', message: error.message, token });
    }
  };
  const run = (token: string) => {
    setUsed(token);
    setPhase({ kind: 'verifying' });
    void check(token);
  };
  const verify = (token: string) => {
    if (used === token) return;
    run(token);
  };

  // Only when a new link arrives (previous-value pattern, during render).
  if (seenParam !== params.token) {
    setSeenParam(params.token);
    if (params.token && params.token !== used) {
      setUsed(params.token);
      setPhase({ kind: 'verifying' });
      setLink({ token: params.token });
    }
  }
  const checkLink = useEffectEvent((token: string) => void check(token));
  useEffect(() => {
    if (!link || checking.current === link) return;
    checking.current = link;
    checkLink(link.token);
  }, [link]);

  if (status === 'signedIn' && phase.kind === 'ask' && !params.token && !after.routing) return <Redirect href="/" />;

  const usePasted = () => {
    const token = tokenFromLink(pasted);
    if (!token) {
      setPasteProblem("That doesn't look like a Vero sign-in link. Copy the whole link from the email and paste it here.");
      return;
    }
    setPasteProblem(null);
    void verify(token);
  };

  const resend = async (email: string) => {
    setResent('busy');
    try {
      await api.auth.requestMagicLink({ body: { email, app: true } });
      setResent('done');
    } catch {
      setResent('idle');
    }
  };

  const sheet = () => {
    switch (phase.kind) {
      case 'verifying':
        return (
          <View accessibilityRole="progressbar" accessibilityLabel="Signing you in" style={{ alignItems: 'center', paddingVertical: 28, gap: 16 }}>
            <ActivityIndicator color={c.navy} size="large" />
            <SheetHead center title={after.routing ? 'Signed in' : 'Signing you in'} sub={after.routing ? 'Opening Vero.' : 'Checking your link. This takes a moment.'} />
          </View>
        );
      case 'failed':
        return (
          <View accessibilityRole="alert">
            <SheetHead title="We couldn't sign you in" sub={phase.message} />
            <Btn label="Try again" style={{ marginTop: 20 }} onPress={() => {
              run(phase.token);
            }} />
            <TextLink label="Send a new link instead" onPress={() => setPhase({ kind: 'ask' })} />
          </View>
        );
      case 'link':
        return (
          <View testID={`link-${phase.reason}`}>
            <SheetHead title={LINK_WORDS[phase.reason].title} sub={LINK_WORDS[phase.reason].body} />
            <EmailForm
              initial={lastEmail}
              button="Send a new link"
              onSent={(email) => {
                setLastEmail(email);
                setPhase({ kind: 'sent', email });
              }}
            />
          </View>
        );
      case 'sent':
        return (
          <View testID="sign-in-sent">
            <Envelope />
            <View style={{ marginTop: 16 }}>
              <SheetHead
                center
                title="Check your inbox"
                sub={
                  <>
                    We sent a link to{' '}
                    <T weight={700} size={14.5} color={c.ink}>
                      {phase.email}
                    </T>
                    . Open it on this phone and you&apos;ll land straight in Vero.
                  </>
                }
              />
            </View>
            {pasting ? (
              <Rise style={{ marginTop: 22 }}>
                <Field
                  testID="sign-in-paste"
                  icon="link"
                  accessibilityLabel="The link from the email"
                  placeholder="Paste the link from the email"
                  value={pasted}
                  onChangeText={(text) => {
                    setPasted(text);
                    if (pasteProblem) setPasteProblem(null);
                  }}
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="go"
                  onSubmitEditing={usePasted}
                  style={pasteProblem ? { borderColor: c.urgent } : undefined}
                />
                {pasteProblem ? (
                  <T weight={600} size={13} color={c.urgent} accessibilityRole="alert" style={{ marginTop: 8, marginHorizontal: 4 }}>
                    {pasteProblem}
                  </T>
                ) : null}
                <Btn label="Sign in with this link" testID="sign-in-paste-go" disabled={pasted.trim().length === 0} onPress={usePasted} style={{ marginTop: 12 }} />
              </Rise>
            ) : (
              <Btn label="Paste the link from the email" icon="link" testID="sign-in-paste-open" style={{ marginTop: 22 }} onPress={() => setPasting(true)} />
            )}
            <View style={{ marginTop: 8 }}>
              <TextLink
                label={resent === 'done' ? 'Sent. Check your inbox again' : resent === 'busy' ? 'Sending a new link' : 'Send a new link'}
                onPress={() => {
                  if (resent !== 'busy') void resend(phase.email);
                }}
              />
              <TextLink
                label="Use a different email"
                onPress={() => {
                  setPasting(false);
                  setPasted('');
                  setResent('idle');
                  setPhase({ kind: 'ask' });
                }}
              />
            </View>
          </View>
        );
      case 'ask':
        return (
          <View>
            <SheetHead
              title={starting ? 'Get started with Vero' : 'Sign in to Vero'}
              sub={starting ? 'Enter your work email. The link signs you in, and makes your account the first time.' : 'Use the email you signed up with.'}
            />
            <EmailForm
              initial={lastEmail}
              button="Email me a sign-in link"
              onSent={(email) => {
                setLastEmail(email);
                setResent('idle');
                setPhase({ kind: 'sent', email });
              }}
            />
            <T weight={600} size={12} color={c.ink3} center style={{ marginTop: 12, lineHeight: 18 }}>
              No password to remember. The link works once and expires after 15 minutes.
            </T>
          </View>
        );
    }
  };

  return (
    <AuthFrame
      kicker={starting ? 'Get started' : 'Welcome back'}
      bold={starting ? 'One email, no password' : 'Weekly re-check'}
      title={starting ? 'Find out where your company stands.' : 'Pick up where your last scan left off.'}
    >
      <Rise key={phase.kind}>{sheet()}</Rise>
    </AuthFrame>
  );
}

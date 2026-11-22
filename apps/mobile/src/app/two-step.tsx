import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AuthFrame, SheetHead } from '@/components/onboarding/AuthFrame';
import { useAfterSignIn } from '@/components/onboarding/useAfterSignIn';
import { api, asApiError } from '@/lib/api';
import { useSession } from '@/lib/session';
import { font } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { Field } from '@/ui/Controls';
import { Rise } from '@/ui/Motion';
import { Btn, tap } from '@/ui/Surfaces';
import { T } from '@/ui/Text';

type Mode = 'app' | 'recovery';

/** The second step of sign-in for people with two-step sign-in on: a code from the app, or a recovery code. */
export default function TwoStep() {
  const { c } = useTheme();
  const { refreshMe, signOut } = useSession();
  const after = useAfterSignIn();
  const [mode, setMode] = useState<Mode>('app');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [left, setLeft] = useState<number | null>(null);
  const app = mode === 'app';

  const switchTo = (next: Mode) => {
    setMode(next);
    setCode('');
    setProblem(null);
  };

  const submit = async () => {
    setBusy(true);
    setProblem(null);
    try {
      if (app) await api.auth.totpChallenge({ body: { code } });
      else {
        const result = await api.auth.recoveryChallenge({ body: { code } });
        if (result.recoveryCodesLeft !== undefined) setLeft(result.recoveryCodesLeft);
      }
      await refreshMe();
      after.go(false);
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  const startOver = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  const ready = app ? code.length === 6 : code.replace(/[\s-]/g, '').length >= 10;

  return (
    <AuthFrame kicker="Two-step sign-in" bold="One more step" title="Confirm it's you." onBack={() => void startOver()}>
      <Rise key={mode}>
        <SheetHead
          title={app ? 'Enter your code' : 'Use a recovery code'}
          sub={app ? 'Open your authenticator app and type the 6-digit code for Vero.' : 'Type one of the recovery codes you saved when you turned on two-step sign-in. Each one works once.'}
        />
        <View style={{ marginTop: 20 }}>
          <Field
            testID="two-step-code"
            icon={app ? 'lock' : 'doc'}
            accessibilityLabel={app ? '6-digit code' : 'Recovery code'}
            placeholder={app ? '6-digit code' : 'abcde-12345'}
            value={code}
            onChangeText={(text) => {
              setCode(app ? text.replace(/\D/g, '').slice(0, 6) : text.slice(0, 20));
              if (problem) setProblem(null);
            }}
            keyboardType={app ? 'number-pad' : 'default'}
            autoComplete={app ? 'one-time-code' : 'off'}
            textContentType={app ? 'oneTimeCode' : 'none'}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            returnKeyType="go"
            onSubmitEditing={() => {
              if (ready) void submit();
            }}
            style={problem ? { borderColor: c.urgent } : undefined}
          />
          {problem ? (
            <T weight={600} size={13} color={c.urgent} accessibilityRole="alert" style={{ marginTop: 8, marginHorizontal: 4 }}>
              {problem}
            </T>
          ) : null}
          {left !== null ? (
            <T weight={600} size={13} color={c.ink3} style={{ marginTop: 8, marginHorizontal: 4 }}>
              {left === 0 ? 'That was your last recovery code. Make new ones in Settings.' : `${left} recovery ${left === 1 ? 'code' : 'codes'} left.`}
            </T>
          ) : null}
          <Btn label={busy ? 'Checking' : 'Continue'} busy={busy || after.routing} disabled={!ready} testID="two-step-go" onPress={() => void submit()} style={{ marginTop: 14 }} />
        </View>
        <View style={{ marginTop: 10, alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              tap();
              switchTo(app ? 'recovery' : 'app');
            }}
            style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}
          >
            <T weight={600} size={14} color={c.ink3}>
              {app ? 'No access to your app? ' : 'Have your app? '}
              <T weight={700} size={14} color={c.link}>
                {app ? 'Use a recovery code' : 'Use a code from the app'}
              </T>
            </T>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => void startOver()} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}>
            <T weight={600} size={14} color={c.ink3}>
              Wrong account?{' '}
              <T weight={700} size={14} color={c.link} style={{ fontFamily: font.sans(700) }}>
                Start again
              </T>
            </T>
          </Pressable>
        </View>
      </Rise>
    </AuthFrame>
  );
}

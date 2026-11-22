import { PLAN_NAMES, type Plan, type PlanCode, type Role } from '@vero/shared';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Label, Page } from '@/components/account/Page';
import { Skeleton, useToast } from '@/components/account/States';
import { useThemeSwitch } from '@/components/account/ThemeSwitch';
import { api, asApiError } from '@/lib/api';
import { planNameOf } from '@/lib/entitlements';
import { longDate } from '@/lib/format';
import { useSession } from '@/lib/session';
import { useWorkspace } from '@/lib/workspace';
import { useTheme } from '@/theme/ThemeProvider';
import { Field, Sheet } from '@/ui/Controls';
import { Icon } from '@/ui/Icon';
import { Rise } from '@/ui/Motion';
import { Btn, Card, List, Row, tap } from '@/ui/Surfaces';
import { T } from '@/ui/Text';

// Ported from apps/web/src/lib/trust.ts ROLE_WORDS and apps/web/src/lib/plan-words.ts planSay / priceWords.
const ROLE_WORDS: Record<Role, string> = { owner: 'Owner', admin: 'Admin', member: 'Member', lawyer: 'Read only' };
const PLAN_SAY: Record<PlanCode, string> = {
  free: 'See where you stand, from public records and a few questions.',
  growth: 'The full picture, with your documents read and checked.',
  scale: "Everything in Growth today. Its extras are planned, and aren't running yet.",
};
function priceWords(plan: Pick<Plan, 'code' | 'priceMinor' | 'currency'>): string {
  if (plan.code === 'free') return 'Nothing to pay';
  if (plan.priceMinor === null || !plan.currency) return 'Price not set yet';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: plan.currency }).format(plan.priceMinor / 100);
}

/** A value on the right of a row (`.row .v`), with a chevron when the row opens something. */
function Value({ children, chevron }: { children: string; chevron?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 190 }}>
      <T weight={600} size={14} color={c.ink3} numberOfLines={1}>
        {children}
      </T>
      {chevron ? <Icon name="chev" size={18} color={c.ink4} /> : null}
    </View>
  );
}

/** `.out`: a full-width quiet button in the urgent colour, for signing out and deleting. */
function RedBtn({ label, onPress, busy, disabled, testID, style }: { label: string; onPress: () => void; busy?: boolean; disabled?: boolean; testID?: string; style?: object }) {
  const { c } = useTheme();
  const off = disabled || busy;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!off, busy: !!busy }}
      disabled={off}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        { height: 54, borderRadius: 18, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.cardGradient ? 'transparent' : c.card, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', opacity: off ? 0.45 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        style,
      ]}
    >
      {c.cardGradient ? <LinearGradient colors={c.cardGradient} style={StyleSheet.absoluteFill} /> : null}
      <T weight={700} size={15.5} color={c.urgent}>
        {busy ? 'One moment' : label}
      </T>
    </Pressable>
  );
}

function Avatar() {
  const { c } = useTheme();
  return (
    <View style={{ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: c.dark ? 'rgba(61,123,255,0.16)' : '#EEF1F7' }}>
      <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={c.dark ? '#B9C0E4' : '#8A90A8'} strokeWidth={1.8} strokeLinecap="round">
        <Circle cx={12} cy={9} r={3.6} />
        <Path d="M5.5 19.5c1.3-3.3 3.8-5 6.5-5s5.2 1.7 6.5 5" />
      </Svg>
    </View>
  );
}

function SheetForm({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={{ maxHeight: 600 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ErrorLine({ error }: { error: unknown }) {
  const { c } = useTheme();
  if (!error) return null;
  return (
    <T weight={600} size={13.5} color={c.urgent} style={{ marginTop: 12 }} accessibilityRole="alert">
      {asApiError(error).message}
    </T>
  );
}

type Open = 'name' | 'plan' | 'team' | 'everywhere' | 'delete' | null;

export default function Settings() {
  const { c } = useTheme();
  const { me, status, refreshMe, signOut } = useSession();
  const on = status === 'signedIn';
  const workspace = useWorkspace();
  const { toast, node } = useToast();
  const theme = useThemeSwitch();
  const [open, setOpen] = useState<Open>(null);
  const [name, setName] = useState(me?.user.name ?? '');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [code, setCode] = useState('');
  const plans = useQuery({ queryKey: ['plans'], enabled: on, queryFn: () => api.plans.list() });
  const members = useQuery({ queryKey: ['members'], enabled: on, queryFn: () => api.members.list() });
  const watch = useQuery({ queryKey: ['watchlist'], enabled: on, queryFn: () => api.watchlist.list() });

  // Opening a sheet starts its fields fresh (previous-value pattern, during render).
  const userName = me?.user.name;
  const [prevOpen, setPrevOpen] = useState<{ open: Open; userName: typeof userName }>({ open, userName });
  if (prevOpen.open !== open || prevOpen.userName !== userName) {
    setPrevOpen({ open, userName });
    if (open === 'name') setName(userName ?? '');
    if (open === 'delete') {
      setConfirmEmail('');
      setCode('');
    }
  }

  const leave = async () => {
    await signOut();
    router.replace('/welcome');
  };

  const saveName = useMutation({
    mutationFn: (next: string) => api.me.update({ body: { name: next } }),
    onSuccess: async () => {
      await refreshMe();
      setOpen(null);
      toast('Saved.');
    },
  });
  const outHere = useMutation({ mutationFn: leave });
  const outEverywhere = useMutation({
    mutationFn: async () => {
      await api.auth.logoutEverywhere();
      await leave();
    },
  });
  const remove = useMutation({
    mutationFn: async () => {
      const mfa = me?.user.mfaEnabled ?? false;
      await api.me.deleteAccount({ body: { confirmEmail: confirmEmail.trim(), ...(mfa ? { totpCode: code.trim() } : {}) } });
      await leave();
    },
  });

  if (!me) {
    return (
      <Page back>
        <T variant="h1" style={{ marginTop: 4 }}>
          Settings
        </T>
        <Skeleton />
      </Page>
    );
  }

  const user = me.user;
  const org = me.organisations.find((item) => item.id === me.activeOrganisationId);
  const planCode = plans.data?.current ?? workspace.data?.overview?.plan;
  const root = workspace.data?.root;
  const people = members.data?.members ?? [];
  const nameChanged = name.trim().length > 0 && name.trim() !== (user.name ?? '');
  const emailMatches = confirmEmail.trim().toLowerCase() === user.email.toLowerCase();
  const deleteReady = emailMatches && (!user.mfaEnabled || /^\d{6}$/.test(code.trim()));

  return (
    <Page
      back
      testID="settings"
      refreshing={plans.isRefetching}
      onRefresh={() => {
        void refreshMe();
        void plans.refetch();
        void members.refetch();
        void watch.refetch();
      }}
      overlay={
        <>
          {node}
          <Sheet open={open === 'name'} onClose={() => setOpen(null)} label="Your name">
            <SheetForm>
              <T variant="h3" accessibilityRole="header">
                Your name
              </T>
              <T variant="sub" style={{ marginTop: 4 }}>
                How your team sees you.
              </T>
              <Field value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" maxLength={120} accessibilityLabel="Your name" testID="name-field" style={{ marginTop: 16 }} returnKeyType="done" onSubmitEditing={() => nameChanged && saveName.mutate(name.trim())} />
              <T variant="small" style={{ marginTop: 10 }}>{`You sign in with ${user.email}. It can't be changed here yet.`}</T>
              <ErrorLine error={saveName.error} />
              <Btn label="Save your name" busy={saveName.isPending} disabled={!nameChanged} onPress={() => saveName.mutate(name.trim())} style={{ marginTop: 18 }} testID="name-save" />
            </SheetForm>
          </Sheet>

          <Sheet open={open === 'plan'} onClose={() => setOpen(null)} label="Your plan">
            <SheetForm>
              <T variant="h3" accessibilityRole="header">
                Plans
              </T>
              <T variant="sub" style={{ marginTop: 4 }}>
                What each plan includes. You can&apos;t change or pay for a plan in the app.
              </T>
              <View style={{ gap: 10, marginTop: 16 }}>
                {(plans.data?.plans ?? []).map((plan) => {
                  const on = plan.code === plans.data?.current;
                  return (
                    <View key={plan.code} style={{ padding: 16, borderRadius: 18, borderWidth: on ? 1.5 : 1, borderColor: on ? (c.dark ? '#4C86FF' : c.navy) : c.cardBorder, backgroundColor: on ? c.soft : 'transparent' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <T weight={700} size={17}>
                          {plan.name}
                        </T>
                        <T weight={700} size={13} color={on ? c.good : c.ink3}>
                          {on ? 'Your plan' : priceWords(plan)}
                        </T>
                      </View>
                      <T variant="small" style={{ marginTop: 4, lineHeight: 18 }}>
                        {PLAN_SAY[plan.code]}
                      </T>
                      <T variant="small" style={{ marginTop: 4 }}>{`Follow up to ${plan.entitlements.followLimit} companies`}</T>
                    </View>
                  );
                })}
              </View>
              {plans.isError ? <ErrorLine error={plans.error} /> : null}
              <T variant="small" style={{ marginTop: 14, lineHeight: 18 }}>
                Plan changes are made in Vero on the web, where payments go through Stripe&apos;s own checkout.
              </T>
            </SheetForm>
          </Sheet>

          <Sheet open={open === 'team'} onClose={() => setOpen(null)} label="Team members">
            <SheetForm>
              <T variant="h3" accessibilityRole="header">
                Team members
              </T>
              <T variant="sub" style={{ marginTop: 4 }}>{`Who can see and change ${org?.name ?? 'this workspace'}.`}</T>
              {members.isError ? <ErrorLine error={members.error} /> : null}
              <List style={{ marginTop: 16 }}>
                {people.map((person) => (
                  <Row
                    key={person.userId}
                    title={`${person.name ?? person.email}${person.userId === user.id ? ' (you)' : ''}`}
                    sub={`${person.name ? `${person.email} · ` : ''}joined ${longDate(person.joinedAt)}`}
                    right={<Value>{ROLE_WORDS[person.role]}</Value>}
                  />
                ))}
              </List>
              <T variant="small" style={{ marginTop: 12 }}>
                Invite people and change roles in Vero on the web.
              </T>
            </SheetForm>
          </Sheet>

          <Sheet open={open === 'everywhere'} onClose={() => setOpen(null)} label="Sign out everywhere">
            <T variant="h3" accessibilityRole="header">
              Sign out everywhere?
            </T>
            <T variant="sub" style={{ marginTop: 6 }}>
              This ends every session on every device, this phone too. You can sign in again with an email link.
            </T>
            <ErrorLine error={outEverywhere.error} />
            <RedBtn label="Sign out everywhere" busy={outEverywhere.isPending} onPress={() => outEverywhere.mutate()} style={{ marginTop: 20 }} testID="everywhere-confirm" />
            <Btn kind="ghost" label="Cancel" onPress={() => setOpen(null)} style={{ marginTop: 10 }} />
          </Sheet>

          <Sheet open={open === 'delete'} onClose={() => setOpen(null)} label="Delete your account">
            <SheetForm>
              <T variant="h3" accessibilityRole="header" color={c.urgent}>
                Delete your account
              </T>
              <T variant="sub" style={{ marginTop: 6, lineHeight: 21 }}>
                This deletes your account for good, and you can&apos;t undo it. On any team where you&apos;re the only person, it also deletes that team&apos;s companies, documents, scores and share links. On a team with other people, you just leave, and they keep everything. If you&apos;re
                the only owner of a team with other people, make someone else an owner first.
              </T>
              <T variant="label" style={{ marginTop: 18, marginBottom: 8 }}>{`Type your email to confirm: ${user.email}`}</T>
              <Field value={confirmEmail} onChangeText={setConfirmEmail} placeholder={user.email} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" accessibilityLabel="Type your email to confirm" testID="delete-email" />
              {user.mfaEnabled ? (
                <>
                  <T variant="label" style={{ marginTop: 14, marginBottom: 8 }}>
                    The 6-digit code from your app
                  </T>
                  <Field value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" accessibilityLabel="The 6-digit code from your app" />
                </>
              ) : null}
              <ErrorLine error={remove.error} />
              <RedBtn label="Yes, delete my account for good" busy={remove.isPending} disabled={!deleteReady} onPress={() => remove.mutate()} style={{ marginTop: 20 }} testID="delete-confirm" />
              <Btn kind="ghost" label="Keep my account" onPress={() => setOpen(null)} style={{ marginTop: 10 }} />
            </SheetForm>
          </Sheet>
          {theme.veil}
        </>
      }
    >
      <Rise>
        <T variant="h1" accessibilityRole="header" style={{ marginTop: 4 }}>
          Settings
        </T>
      </Rise>

      <Rise d={1}>
        <Card padded={false} onPress={() => setOpen('name')} accessibilityLabel={`${user.name ?? 'Add your name'}, ${user.email}. Edit your name`} style={{ marginTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 18 }}>
            <Avatar />
            <View style={{ flex: 1, minWidth: 0 }}>
              <T weight={700} size={17} style={{ letterSpacing: -0.25 }} numberOfLines={1}>
                {user.name ?? 'Add your name'}
              </T>
              <T variant="small" size={13} numberOfLines={1}>
                {user.email}
              </T>
            </View>
            <Icon name="chev" size={18} color={c.ink4} />
          </View>
        </Card>
      </Rise>

      <Rise d={2}>
        <Card padded={false} onPress={() => setOpen('plan')} accessibilityLabel={`Your plan, ${planNameOf(planCode)}. See the plans`} style={{ marginTop: 10, overflow: 'hidden' }}>
          <LinearGradient colors={c.dark ? ['rgba(18,26,120,0)', 'rgba(61,123,255,0.16)'] : ['rgba(255,255,255,0)', '#EEF4FF']} start={{ x: 0.4, y: 0.4 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: 24 }]} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 18 }}>
            <View style={{ flex: 1 }}>
              <T variant="kick">Your plan</T>
              <T weight={700} size={20} style={{ letterSpacing: -0.4, marginTop: 2 }} testID="plan-name">
                {planCode ? PLAN_NAMES[planCode] : plans.isError ? 'Not available' : ' '}
              </T>
              <T variant="small">{watch.data ? `${watch.data.used} of ${watch.data.limit} watchlist places used` : 'Shown here, changed on the web'}</T>
            </View>
            <Icon name="chev" size={18} color={c.ink4} />
          </View>
        </Card>
      </Rise>

      <Label>Workspace</Label>
      <Rise d={3}>
        <List>
          <Row title="Workspace" right={<Value>{org?.name ?? 'None yet'}</Value>} />
          <Row title="Your role" right={<Value>{org ? ROLE_WORDS[org.role] : 'None'}</Value>} />
          <Row title="Team members" onPress={() => setOpen('team')} accessibilityLabel={`Team members, ${people.length}`} right={<Value chevron>{members.data ? String(people.length) : members.isError ? 'Not available' : ' '}</Value>} />
          <Row title="Main company" right={<Value>{root?.legalName ?? 'None yet'}</Value>} />
        </List>
      </Rise>

      <Label>Appearance</Label>
      <Rise d={4}>{theme.control}</Rise>

      <Label>Account</Label>
      <Rise d={5}>
        <List>
          <Row title="Sign-in" sub={user.mfaEnabled ? 'Email link and a code from your app' : `Email link to ${user.email}`} right={<Value>On</Value>} />
          <Row
            title="Two-step sign-in"
            sub={user.mfaEnabled ? 'A code from an authenticator app as well' : 'Set it up in Vero on the web'}
            right={
              <T weight={700} size={13} color={user.mfaEnabled ? c.good : c.warn} testID="two-step-state">
                {user.mfaEnabled ? 'On' : 'Off'}
              </T>
            }
          />
          <Row title="Sign out everywhere" sub="Ends every session on every device" chevron onPress={() => setOpen('everywhere')} testID="sign-out-everywhere" accessibilityLabel="Sign out everywhere" />
          <Row
            title={
              <T weight={700} size={15} color={c.urgent} style={{ lineHeight: 20 }}>
                Delete your account
              </T>
            }
            sub="For good. This can't be undone."
            chevron
            onPress={() => setOpen('delete')}
            testID="delete-account"
            accessibilityLabel="Delete your account"
          />
        </List>
      </Rise>

      <Rise d={6}>
        <RedBtn label="Sign out" busy={outHere.isPending} onPress={() => outHere.mutate()} style={{ marginTop: 22 }} testID="sign-out" />
        <ErrorLine error={outHere.error} />
        <T variant="small" center style={{ marginTop: 16 }}>{`Member since ${longDate(user.createdAt)}`}</T>
      </Rise>
    </Page>
  );
}

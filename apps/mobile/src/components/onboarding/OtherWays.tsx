import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { api, asApiError } from '@/lib/api';
import { registerFor } from '@/lib/registers';
import { workspaceKey } from '@/lib/workspace';
import { useTheme } from '@/theme/ThemeProvider';
import { Field, Sheet } from '@/ui/Controls';
import { Icon } from '@/ui/Icon';
import { Btn, List, tap } from '@/ui/Surfaces';
import { T } from '@/ui/Text';

function Way({ title, text, onPress, testID }: { title: string; text: string; onPress: () => void; testID?: string }) {
  const { c } = useTheme();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${text}`}
      onPress={() => {
        tap();
        onPress();
      }}
    >
      {({ pressed }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15, paddingHorizontal: 18, backgroundColor: pressed ? c.rowPressed : 'transparent' }}>
          <View style={{ flex: 1 }}>
            <T weight={700} size={15} style={{ lineHeight: 20 }}>
              {title}
            </T>
            <T variant="small" style={{ marginTop: 2 }}>
              {text}
            </T>
          </View>
          <Icon name="chev" size={18} color={c.ink4} />
        </View>
      )}
    </Pressable>
  );
}

/**
 * "Can't find it in a register?" Ported from the web onboarding/not-found page: another country,
 * not registered yet, enter the details by hand, or ask a person to look it up.
 */
export function OtherWays({ open, onClose, country, query, onChooseCountry }: { open: boolean; onClose: () => void; country: string; query: string; onChooseCountry: () => void }) {
  const { c } = useTheme();
  const queries = useQueryClient();
  const [asking, setAsking] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const register = country ? registerFor(country) : null;

  const close = () => {
    onClose();
    setAsking(false);
    setProblem(null);
    setSent(false);
  };

  const needCountry = () => {
    close();
    setTimeout(onChooseCountry, 420);
  };

  const byHand = () => {
    if (!country) return needCountry();
    close();
    router.push({ pathname: '/confirm', params: { country, name: query, manual: '1' } });
  };

  const notRegistered = async () => {
    if (!country) return needCountry();
    if (!query.trim()) {
      setProblem('Type the name you plan to use in the search box first.');
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      const company = await api.companies.create({ body: { legalName: query.trim(), incorporationCountry: country, preIncorporation: true } });
      await queries.invalidateQueries({ queryKey: workspaceKey });
      close();
      router.replace({ pathname: '/questions', params: { company: company.id } });
    } catch (error) {
      setProblem(asApiError(error).message);
    } finally {
      setBusy(false);
    }
  };

  const ask = async () => {
    if (!country) return needCountry();
    if (!name.trim()) {
      setProblem('Enter the company name.');
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      await api.registry.requestLookup({
        body: { country, legalName: name.trim(), ...(number.trim() ? { registrationNumber: number.trim() } : {}), ...(note.trim() ? { note: note.trim() } : {}) },
      });
      setSent(true);
      setAsking(false);
    } catch (error) {
      setProblem(asApiError(error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={close} label="Other ways to find it">
      <T variant="h2" accessibilityRole="header" style={{ fontSize: 20, lineHeight: 25 }}>
        Other ways to find it
      </T>
      <T variant="sub" style={{ marginTop: 4 }}>
        Not being found is usually a small spelling difference. It doesn&apos;t mean the company isn&apos;t registered.
      </T>
      {asking ? (
        <View style={{ marginTop: 16, gap: 10 }}>
          <Field accessibilityLabel="Company name" placeholder="Company name" value={name} onChangeText={setName} autoFocus />
          <Field accessibilityLabel={`${register?.numberLabel ?? 'Registration number'}, optional`} placeholder={`${register?.numberLabel ?? 'Registration number'} (optional)`} value={number} onChangeText={setNumber} autoCapitalize="none" />
          <Field accessibilityLabel="Anything that would help, optional" placeholder="Anything that would help (optional)" value={note} onChangeText={setNote} />
          {problem ? (
            <T weight={600} size={13} color={c.urgent} accessibilityRole="alert">
              {problem}
            </T>
          ) : null}
          <Btn label="Ask a person to look it up" busy={busy} onPress={() => void ask()} />
          <Btn kind="ghost" label="Back" onPress={() => setAsking(false)} />
        </View>
      ) : (
        <>
          <List style={{ marginTop: 16 }}>
            <Way title="It's registered in another country" text="Choose the country where it's registered" onPress={needCountry} />
            <Way title="We haven't registered yet" text="You can still get a score, and Vero shows you what to set up first" testID="way-not-registered" onPress={() => void notRegistered()} />
            <Way title="I'll enter the details myself" text="Vero says these came from you, and checks them when it can" testID="way-manual" onPress={byHand} />
            <Way
              title="I'm sure it's registered"
              text="Tell us the details and a person will look it up"
              onPress={() => {
                if (!country) return needCountry();
                setName(query);
                setAsking(true);
              }}
            />
          </List>
          {problem ? (
            <T weight={600} size={13} color={c.urgent} accessibilityRole="alert" style={{ marginTop: 12 }}>
              {problem}
            </T>
          ) : null}
          {sent ? (
            <T weight={600} size={13} color={c.good} accessibilityRole="alert" style={{ marginTop: 12 }}>
              Sent. A person will look it up, and Vero tells you what it finds under What&apos;s new.
            </T>
          ) : null}
          {!country ? (
            <T variant="small" style={{ marginTop: 12 }}>
              Each of these needs the country first, so Vero knows which rules apply.
            </T>
          ) : null}
        </>
      )}
    </Sheet>
  );
}

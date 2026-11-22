import type { RegistrySearchResponse } from '@vero/shared';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { CountrySheet } from '@/components/onboarding/CountrySheet';
import { OtherWays } from '@/components/onboarding/OtherWays';
import { LightScreen } from '@/components/onboarding/Shell';
import { api, asApiError } from '@/lib/api';
import { LEVEL_WORDS, SEARCHABLE_COUNTRIES, coverageOf, registerFor, sentence } from '@/lib/registers';
import { useWorkspace } from '@/lib/workspace';
import { font } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Rise } from '@/ui/Motion';
import { Card, List, Row, Status, tap } from '@/ui/Surfaces';
import { Kicker, T } from '@/ui/Text';

type Candidate = RegistrySearchResponse['candidates'][number];

interface Hit {
  country: string;
  candidate: Candidate;
  sourceName: string;
  sampleData: boolean;
  checkedAt: string;
}

interface Found {
  hits: Hit[];
  /** One answer per register asked. */
  answers: (RegistrySearchResponse & { country: string })[];
}

/** Searches one register, or every register Vero can reach when no country is chosen. */
async function searchRegisters(country: string, q: string): Promise<Found> {
  const codes = country ? [country] : SEARCHABLE_COUNTRIES;
  const settled = await Promise.allSettled(codes.map(async (code) => ({ ...(await api.registry.search({ query: { country: code, q } })), country: code })));
  const answers = settled.flatMap((item) => (item.status === 'fulfilled' ? [item.value] : []));
  const failed = settled.find((item): item is PromiseRejectedResult => item.status === 'rejected');
  if (answers.length === 0 && failed) throw failed.reason;
  const hits = answers
    .flatMap((answer) => answer.candidates.map((candidate) => ({ country: answer.country, candidate, sourceName: answer.sourceName, sampleData: answer.sampleData, checkedAt: answer.checkedAt })))
    .sort((a, b) => b.candidate.matchConfidence - a.candidate.matchConfidence);
  return { hits, answers };
}

function Highlight({ text, query }: { text: string; query: string }) {
  const { c } = useTheme();
  const at = query.length >= 2 ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  const base = { fontFamily: font.sans(700), fontSize: 15, lineHeight: 20, letterSpacing: -0.15, color: c.ink };
  if (at < 0) return <T style={base}>{text}</T>;
  return (
    <T style={base}>
      {text.slice(0, at)}
      <T style={[base, { color: c.dark ? '#fff' : c.navy, backgroundColor: c.dark ? 'rgba(76,134,255,0.25)' : '#E3F3FD', borderRadius: 4 }]}>{text.slice(at, at + query.length)}</T>
      {text.slice(at + query.length)}
    </T>
  );
}

function Skeleton() {
  const { c } = useTheme();
  const still = useReducedMotion();
  const o = useSharedValue(1);
  useEffect(() => {
    if (!still) o.set(withRepeat(withTiming(0.45, { duration: 700 }), -1, true));
  }, [still, o]);
  const style = useAnimatedStyle(() => ({ opacity: o.get() }));
  return (
    <Animated.View style={[{ paddingVertical: 18, paddingHorizontal: 18, gap: 8 }, style]}>
      <View style={{ height: 13, width: '58%', borderRadius: 6, backgroundColor: c.soft }} />
      <View style={{ height: 10, width: '38%', borderRadius: 5, backgroundColor: c.soft }} />
    </Animated.View>
  );
}

function Empty({ title, text, action, onAction }: { title: string; text: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ paddingVertical: 26, paddingHorizontal: 20, alignItems: 'center' }} accessibilityLiveRegion="polite">
      <T weight={700} size={15} center>
        {title}
      </T>
      <T weight={600} size={13} color={c.ink3} center style={{ marginTop: 4, lineHeight: 20 }}>
        {text}
      </T>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8} style={{ marginTop: 10, minHeight: 44, justifyContent: 'center' }}>
          <T weight={700} size={14} color={c.link}>
            {action}
          </T>
        </Pressable>
      ) : null}
    </View>
  );
}

/** The Search board: find your company on its register, in any country, with honest coverage. */
export default function Search() {
  const { c } = useTheme();
  const workspace = useWorkspace();
  const [country, setCountry] = useState('');
  const [q, setQ] = useState('');
  const [found, setFound] = useState<Found | null>(null);
  const [searching, setSearching] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [picker, setPicker] = useState(false);
  const [ways, setWays] = useState(false);
  const decided = useRef(false);
  const trimmed = q.trim();

  // Someone who already has a company carries on from where they got to (checked once, on arrival).
  useEffect(() => {
    if (decided.current || !workspace.isSuccess) return;
    decided.current = true;
    const root = workspace.data.root;
    if (!root) return;
    if (workspace.data.hasResult) router.replace('/(tabs)');
    else router.replace({ pathname: '/questions', params: { company: root.id } });
  }, [workspace.isSuccess, workspace.data]);

  // A new search clears the last answer straight away (previous-value pattern, during render).
  const searchKey = JSON.stringify([country, trimmed, attempt]);
  const [lastSearch, setLastSearch] = useState(searchKey);
  if (lastSearch !== searchKey) {
    setLastSearch(searchKey);
    setFound(null);
    setProblem(null);
    setSearching(trimmed.length >= 2);
  }

  useEffect(() => {
    if (trimmed.length < 2) return;
    let current = true;
    const timer = setTimeout(() => {
      searchRegisters(country, trimmed).then(
        (result) => {
          if (!current) return;
          setFound(result);
          setSearching(false);
        },
        (error: unknown) => {
          if (!current) return;
          setProblem(asApiError(error).message);
          setSearching(false);
        },
      );
    }, 450);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [country, trimmed, attempt]);

  const coverage = country ? coverageOf(country) : null;
  const register = country ? registerFor(country) : null;
  const hits = found?.hits ?? [];
  const single = country && found ? found.answers[0] : undefined;
  const down = (found?.answers ?? []).filter((answer) => answer.outcome === 'source_down');
  const sample = hits.some((hit) => hit.sampleData);

  const open = (hit: Hit) => {
    const { candidate } = hit;
    router.push({
      pathname: '/confirm',
      params: {
        country: hit.country,
        name: candidate.name,
        source: hit.sourceName,
        checked: hit.checkedAt,
        ...(candidate.registrationNumber ? { number: candidate.registrationNumber } : {}),
        ...(candidate.registeredAgent ? { agent: candidate.registeredAgent } : {}),
        ...(candidate.entityType ? { type: candidate.entityType } : {}),
        ...(candidate.incorporatedOn ? { formed: candidate.incorporatedOn } : {}),
        ...(hit.sampleData ? { sample: '1' } : {}),
      },
    });
  };

  const results = () => {
    if (problem) return <Empty title="The search didn't go through" text={problem} action="Try again" onAction={() => setAttempt((n) => n + 1)} />;
    if (searching) return [0, 1, 2].map((key) => <Skeleton key={key} />);
    if (trimmed.length < 2) {
      return <Empty title={country ? `Search ${register?.register ?? 'the register'}` : 'Search registers in any country'} text={register?.numberExample ? `Try a company name, or a number like ${register.numberExample}` : 'Try a company name or a registration number'} />;
    }
    if (hits.length > 0) {
      return hits.map((hit, i) => (
        <Animated.View key={`${hit.country}-${hit.candidate.registrationNumber ?? hit.candidate.name}-${i}`} entering={FadeInDown.duration(550).delay(i * 60)}>
          <Row
            testID="search-row"
            accessibilityLabel={`${hit.candidate.name}, ${hit.sourceName}${hit.candidate.registrationNumber ? `, ${hit.candidate.registrationNumber}` : ''}`}
            title={<Highlight text={hit.candidate.name} query={trimmed} />}
            sub={[hit.sourceName, hit.candidate.registrationNumber].filter(Boolean).join(' · ')}
            right={i === 0 && hit.candidate.matchConfidence >= 0.9 ? <Status word="Best match" tone="good" /> : undefined}
            chevron
            onPress={() => open(hit)}
          />
        </Animated.View>
      ));
    }
    if (single?.outcome === 'not_available') {
      return <Empty title={`No register search in ${register?.label ?? 'this country'} yet`} text="Enter the company's details yourself. Vero still checks international rules and sanctions." action="Enter the details yourself" onAction={() => router.push({ pathname: '/confirm', params: { country, name: trimmed, manual: '1' } })} />;
    }
    if (down.length > 0 && down.length === found?.answers.length) {
      const one = down.length === 1;
      return (
        <View testID="search-source-down">
          <Empty
            title={one ? `${sentence(down[0]?.sourceName ?? 'The register')} isn't answering just now` : "The registers aren't answering just now"}
            text={one ? (down[0]?.message ?? 'Try again in a moment, or enter the details yourself.') : `Vero couldn't reach ${down.map((answer) => sentence(answer.sourceName)).join(', ')}. Try again in a moment, or enter the details yourself.`}
            action="Try again"
            onAction={() => setAttempt((n) => n + 1)}
          />
          <Pressable
            testID="search-manual"
            accessibilityRole="button"
            onPress={() => (country ? router.push({ pathname: '/confirm', params: { country, name: trimmed, manual: '1' } }) : setWays(true))}
            style={{ alignSelf: 'center', marginTop: -14, marginBottom: 14, minHeight: 44, justifyContent: 'center' }}
          >
            <T weight={700} size={14} color={c.link}>
              Enter the details yourself
            </T>
          </Pressable>
        </View>
      );
    }
    return (
      <Empty
        title={country ? `Not found at ${single?.sourceName ?? register?.register}` : 'Not found in the registers Vero can reach'}
        text="Check the spelling or try the number. Not being found here doesn't mean the company doesn't exist."
        action="Search another way"
        onAction={() => setWays(true)}
      />
    );
  };

  return (
    <LightScreen testID="search">
      <Rise>
        <Kicker bold="Records → Plain English">Any company ·</Kicker>
      </Rise>
      <Rise d={1}>
        <T variant="h1" accessibilityRole="header" style={{ marginTop: 10 }}>
          Find your company
        </T>
      </Rise>
      <Rise d={2}>
        <Card padded={false} style={{ marginTop: 24, height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18 }}>
          <Icon name="search" size={22} color={c.ink3} />
          <TextInput
            testID="search-input"
            accessibilityLabel="Company name or registration number"
            placeholder="Name or registration number"
            placeholderTextColor={c.dark ? c.ink4 : c.placeholder}
            value={q}
            onChangeText={setQ}
            autoCorrect={false}
            autoComplete="organization"
            returnKeyType="search"
            style={[{ flex: 1, height: '100%', fontFamily: font.sans(600), fontSize: 17, letterSpacing: -0.2, color: c.ink }, { outlineStyle: 'none' } as object]}
          />
          {searching ? (
            <T weight={700} size={12.5} color={c.ink3} accessibilityLiveRegion="polite">
              Searching…
            </T>
          ) : q ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear the search" hitSlop={12} onPress={() => setQ('')}>
              <Icon name="x" size={18} color={c.ink3} />
            </Pressable>
          ) : null}
        </Card>
      </Rise>
      <Rise d={3} style={{ flexDirection: 'row' }}>
        <Pressable
          testID="country-chip"
          accessibilityRole="button"
          accessibilityLabel={`Country: ${country ? registerFor(country).label : 'Any country'}. Change`}
          onPress={() => {
            tap();
            setPicker(true);
          }}
          style={({ pressed }) => ({
            marginTop: 12,
            height: 44,
            paddingLeft: 12,
            paddingRight: 14,
            borderRadius: 13,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: c.dark ? 'rgba(150,170,255,0.08)' : '#fff',
            borderWidth: 1,
            borderColor: c.dark ? 'rgba(150,170,255,0.14)' : c.line,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
        >
          <Icon name="globe" size={18} color={c.dark ? '#5AA9FF' : '#0182FA'} />
          <T weight={700} size={14}>
            {country ? registerFor(country).label : 'Any country'}
          </T>
          <View style={{ opacity: 0.5 }}>
            <Icon name="down" size={16} color={c.ink} />
          </View>
        </Pressable>
      </Rise>
      <Rise d={3}>
        <T weight={600} size={13.5} color={c.ink2} style={{ marginTop: 12, marginHorizontal: 2, lineHeight: 21 }} testID="country-coverage">
          {coverage ? (
            <>
              <T weight={700} size={13.5} color={c.ink}>
                {LEVEL_WORDS[coverage.level]}.
              </T>{' '}
              {coverage.sentence}
            </>
          ) : (
            'How much Vero can check depends on where the company is registered. With any country, Vero searches every register it can reach.'
          )}
        </T>
        {sample ? (
          <View style={{ alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: c.dark ? 'rgba(255,182,72,0.14)' : '#FFF4E0' }}>
            <T weight={700} size={12} color={c.warn}>
              Sample data · example records, not a live register
            </T>
          </View>
        ) : null}
      </Rise>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 28, marginBottom: 12, marginHorizontal: 4 }}>
        <T variant="h2" accessibilityRole="header">
          Matches
        </T>
        {hits.length > 0 && !searching ? (
          <T weight={600} size={13} color={c.ink3}>
            {hits.length} found
          </T>
        ) : null}
      </View>
      <List>{results()}</List>
      {down.length > 0 && hits.length > 0 ? (
        <T weight={600} size={12.5} color={c.warn} style={{ marginTop: 10, marginHorizontal: 4, lineHeight: 18 }}>
          {down.map((answer) => sentence(answer.sourceName)).join(', ')} {down.length === 1 ? "isn't" : "aren't"} answering just now, so {down.length === 1 ? 'its' : 'their'} matches may be missing.
        </T>
      ) : null}
      <Card onPress={() => setWays(true)} accessibilityLabel="Can't find it in a register? Enter the details yourself or search another way" style={{ marginTop: 14, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 18 }} padded={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ flex: 1 }}>
            <T weight={700} size={14.5}>
              Can&apos;t find it in a register?
            </T>
            <T weight={600} size={12.5} color={c.ink3} style={{ marginTop: 3, lineHeight: 19 }}>
              Enter the details yourself. Vero still checks international rules, sanctions, the website and your documents.
            </T>
          </View>
          <Icon name="chev" size={18} color={c.ink4} />
        </View>
      </Card>
      <View style={{ height: 20, borderRadius: radius.card }} />
      <CountrySheet open={picker} value={country} onClose={() => setPicker(false)} onPick={setCountry} />
      <OtherWays open={ways} onClose={() => setWays(false)} country={country} query={trimmed} onChooseCountry={() => setPicker(true)} />
    </LightScreen>
  );
}

import type { RegistrySearchResponse } from '@vero/shared';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { api, asApiError } from '@/lib/api';
import { countryShort, entityWords, FEATURED_COUNTRIES, LEVEL_WORDS, PICKER_COUNTRIES, registerFor } from '@/lib/registers';
import { useTheme } from '@/theme/ThemeProvider';
import { Sheet, Field } from '@/ui/Controls';
import { Icon } from '@/ui/Icon';
import { Btn, List, Row, tap } from '@/ui/Surfaces';
import { T } from '@/ui/Text';
import { SampleTag } from './Page';

type Candidate = RegistrySearchResponse['candidates'][number];

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => ({
        height: 44,
        paddingHorizontal: 14,
        borderRadius: 14,
        justifyContent: 'center',
        backgroundColor: on ? (c.dark ? '#2E5FE8' : c.navy) : c.soft,
        borderWidth: 1,
        borderColor: on ? 'transparent' : c.line,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <T weight={700} size={13.5} color={on ? '#fff' : c.ink2}>
        {label}
      </T>
    </Pressable>
  );
}

/**
 * Follow a company: pick where it's registered, search that register, then follow a match, or
 * follow it by name where the register can't be searched. Vero then scans its public records.
 */
export function FollowSheet({ open, onClose, onFollowed, used, limit }: { open: boolean; onClose: () => void; onFollowed: (name: string, companyId: string) => void; used: number; limit: number }) {
  const { c } = useTheme();
  const [country, setCountry] = useState<string>(FEATURED_COUNTRIES[0] ?? 'GB');
  const [picking, setPicking] = useState(false);
  const [place, setPlace] = useState('');
  const [q, setQ] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const full = limit > 0 && used >= limit;

  const search = useMutation({
    mutationFn: (input: { country: string; q: string }) => api.registry.search({ query: input }),
    onMutate: () => setProblem(null),
    onError: (error) => setProblem(asApiError(error).message),
  });
  const follow = useMutation({
    mutationFn: (body: { legalName: string; incorporationCountry: string; registrationNumber?: string; entityType?: string }) => api.watchlist.add({ body }),
    onMutate: () => setProblem(null),
    onSuccess: (result) => {
      onFollowed(result.company.legalName, result.company.id);
    },
    onError: (error) => setProblem(asApiError(error).message),
  });

  // Closing the sheet starts it fresh next time: local fields reset during render (previous-value pattern)...
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) {
      setProblem(null);
      setQ('');
      setPicking(false);
    }
  }
  // ...and the query client's mutation state is reset after the commit.
  useEffect(() => {
    if (!open) {
      search.reset();
      follow.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const matches = useMemo(() => {
    const needle = place.trim().toLowerCase();
    if (!needle) return PICKER_COUNTRIES.slice(0, 6);
    return PICKER_COUNTRIES.filter((item) => item.name.toLowerCase().includes(needle) || item.code.toLowerCase() === needle).slice(0, 6);
  }, [place]);

  const run = () => {
    if (q.trim().length < 2) {
      setProblem('Enter at least two characters.');
      return;
    }
    search.mutate({ country, q: q.trim() });
  };
  const followCandidate = (candidate: Candidate) =>
    follow.mutate({
      legalName: candidate.name,
      incorporationCountry: country,
      ...(candidate.registrationNumber ? { registrationNumber: candidate.registrationNumber } : {}),
      ...(candidate.entityType ? { entityType: candidate.entityType } : {}),
    });

  const result = search.data;
  const byName = result && (result.outcome === 'not_found' || result.outcome === 'not_available' || result.outcome === 'source_down' || result.candidates.length === 0);
  const featured = (FEATURED_COUNTRIES as readonly string[]).includes(country);

  return (
    <Sheet open={open} onClose={onClose} label="Follow a company">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={{ maxHeight: 620 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <T variant="h3" accessibilityRole="header">
            Follow a company
          </T>
          <T variant="sub" style={{ marginTop: 4 }}>
            Vero scans its public records now and shows you here when something changes. Read only, in any country.
          </T>

          {full ? (
            <View style={{ marginTop: 18, padding: 16, borderRadius: 18, backgroundColor: c.soft }}>
              <T weight={700} size={14.5}>{`All ${limit} places on your plan are used`}</T>
              <T variant="small" style={{ marginTop: 4 }}>
                Stop following a company to make room for another.
              </T>
            </View>
          ) : (
            <>
              <T variant="label" style={{ marginTop: 20, marginBottom: 10 }}>
                Where it&apos;s registered
              </T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} accessibilityRole="radiogroup">
                {FEATURED_COUNTRIES.map((code) => (
                  <Chip
                    key={code}
                    label={countryShort(code)}
                    on={country === code && !picking}
                    onPress={() => {
                      setCountry(code);
                      setPicking(false);
                      search.reset();
                    }}
                  />
                ))}
                <Chip label={featured || picking ? 'Another country' : countryShort(country)} on={picking || !featured} onPress={() => setPicking(true)} />
              </View>
              {picking ? (
                <Animated.View entering={FadeIn.duration(260)} style={{ marginTop: 10 }}>
                  <Field icon="globe" placeholder="Type a country" value={place} onChangeText={setPlace} autoCorrect={false} accessibilityLabel="Country" />
                  <List style={{ marginTop: 8 }}>
                    {matches.map((item) => (
                      <Row
                        key={item.code}
                        title={item.name}
                        sub={LEVEL_WORDS[item.coverage]}
                        onPress={() => {
                          setCountry(item.code);
                          setPicking(false);
                          setPlace('');
                          search.reset();
                        }}
                        accessibilityLabel={item.name}
                        right={country === item.code ? <Icon name="check" size={18} color={c.good} /> : undefined}
                      />
                    ))}
                  </List>
                </Animated.View>
              ) : null}

              <T variant="label" style={{ marginTop: 18, marginBottom: 10 }}>{`Company name or ${registerFor(country).numberLabel.toLowerCase()}`}</T>
              <Field
                icon="search"
                testID="follow-query"
                placeholder="Search the register"
                value={q}
                onChangeText={setQ}
                returnKeyType="search"
                onSubmitEditing={run}
                autoCorrect={false}
                accessibilityLabel="Company name or number"
              />
              <Btn label={search.isPending ? 'Searching' : 'Search'} icon="search" busy={search.isPending} onPress={run} style={{ marginTop: 12 }} testID="follow-search" />

              {problem ? (
                <T weight={600} size={13.5} color={c.urgent} style={{ marginTop: 12 }} accessibilityRole="alert">
                  {problem}
                </T>
              ) : null}

              {result ? (
                <Animated.View entering={FadeInDown.duration(420)} style={{ marginTop: 18 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <T variant="small" style={{ flex: 1, minWidth: 180 }}>
                      {result.message}
                    </T>
                    {result.sampleData ? <SampleTag /> : null}
                  </View>
                  {result.candidates.length > 0 ? (
                    <List style={{ marginTop: 10 }}>
                      {result.candidates.slice(0, 6).map((candidate) => (
                        <Row
                          key={`${candidate.name}-${candidate.registrationNumber ?? ''}`}
                          testID="follow-candidate"
                          title={candidate.name}
                          sub={[candidate.registrationNumber, entityWords(candidate.entityType), candidate.incorporatedOn].filter(Boolean).join(' · ') || result.sourceName}
                          accessibilityLabel={`Follow ${candidate.name}`}
                          onPress={() => followCandidate(candidate)}
                          right={
                            follow.isPending && follow.variables?.legalName === candidate.name ? (
                              <ActivityIndicator color={c.navy} />
                            ) : (
                              <T weight={700} size={14} color={c.link}>
                                Follow
                              </T>
                            )
                          }
                        />
                      ))}
                    </List>
                  ) : null}
                  {byName ? (
                    <Btn
                      kind="ghost"
                      label={`Follow “${q.trim()}” by name`}
                      busy={follow.isPending}
                      onPress={() => follow.mutate({ legalName: q.trim(), incorporationCountry: country })}
                      style={{ marginTop: 12 }}
                    />
                  ) : null}
                </Animated.View>
              ) : null}
            </>
          )}
          <View style={{ height: 8 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Sheet>
  );
}

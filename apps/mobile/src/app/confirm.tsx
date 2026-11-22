import type { RegistrySearchResponse } from '@vero/shared';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { LightScreen } from '@/components/onboarding/Shell';
import { api, asApiError } from '@/lib/api';
import { FEATURED_COUNTRIES, LEVEL_WORDS, coverageOf, countryShort, dateWords, entityWords, isCountry, readAtWords, registerFor } from '@/lib/registers';
import { workspaceKey } from '@/lib/workspace';
import { useTheme } from '@/theme/ThemeProvider';
import { Field, Switch } from '@/ui/Controls';
import { Rise } from '@/ui/Motion';
import { Btn, Card, List, Row } from '@/ui/Surfaces';
import { Kicker, T } from '@/ui/Text';

interface RelatedOption {
  country: string;
  name: string;
  number: string | null;
  type: string | null;
  sourceName: string;
  sample: boolean;
  on: boolean;
}

/** Only a clear match is offered, and the person still decides (apps/web onboarding/confirm). */
const CLEAR_MATCH = 0.9;

/** Words like Ltd or Inc. differ between registers, so the search uses the name without them. */
function coreName(name: string): string {
  return name.replace(/\b(inc|incorporated|llc|ltd|limited|plc|llp|corp|corporation|uk|nigeria)\b\.?/gi, ' ').replace(/\s+/g, ' ').trim();
}

function asRelated(country: string, found: RegistrySearchResponse): RelatedOption | null {
  const first = found.candidates[0];
  if (found.outcome !== 'found' || !first || first.matchConfidence < CLEAR_MATCH) return null;
  return { country, name: first.name, number: first.registrationNumber, type: first.entityType, sourceName: found.sourceName, sample: found.sampleData, on: true };
}

function Detail({ label, value, tone }: { label: string; value: string; tone?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 11, borderTopWidth: 1, borderTopColor: c.line2 }}>
      <T weight={600} size={14} color={c.ink3}>
        {label}
      </T>
      <T weight={700} size={14} color={tone ?? c.ink} style={{ flex: 1, textAlign: 'right' }}>
        {value}
      </T>
    </View>
  );
}

type Params = { country?: string; name?: string; source?: string; checked?: string; number?: string; agent?: string; type?: string; formed?: string; sample?: string; manual?: string };

/** The Confirm board: is this the right company, which linked companies to include, then create them. */
export default function Confirm() {
  const { c } = useTheme();
  const queries = useQueryClient();
  const params = useLocalSearchParams<Params>();
  const country = isCountry(params.country) ? params.country : null;
  const manual = params.manual === '1';
  const [name, setName] = useState(params.name ?? '');
  const [number, setNumber] = useState(params.number ?? '');
  const [found, setRelated] = useState<RelatedOption[] | null>(manual ? [] : null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  // With nothing to search for, no linked companies are offered (derived, not set in the effect).
  const noSearch = !country || manual || coreName(params.name ?? '').length < 2;
  const related = noSearch ? [] : found;

  // Real searches of the other featured registers. If one can't answer, it simply isn't offered.
  useEffect(() => {
    const query = coreName(params.name ?? '');
    if (!country || manual || query.length < 2) return;
    let current = true;
    const others = FEATURED_COUNTRIES.filter((code) => code !== country);
    void Promise.all(others.map((code) => api.registry.search({ query: { country: code, q: query } }).then((found) => asRelated(code, found)).catch(() => null))).then((options) => {
      if (current) setRelated(options.filter((option): option is RelatedOption => option !== null));
    });
    return () => {
      current = false;
    };
  }, [country, manual, params.name]);

  if (!country) {
    return (
      <LightScreen>
        <T variant="h1" accessibilityRole="header" style={{ marginTop: 10 }}>
          Let&apos;s find the company first
        </T>
        <Btn label="Find the company" style={{ marginTop: 24 }} onPress={() => router.replace('/search')} />
      </LightScreen>
    );
  }

  const register = registerFor(country);
  const coverage = coverageOf(country);
  const linked = (related ?? []).filter((option) => option.on);
  const count = 1 + linked.length;
  const sample = params.sample === '1' || (related ?? []).some((option) => option.sample);
  const type = entityWords(params.type);

  const accept = async () => {
    if (!name.trim()) {
      setProblem('Enter the company name.');
      return;
    }
    setBusy(true);
    setProblem(null);
    try {
      const company = await api.companies.create({
        body: {
          legalName: name.trim(),
          incorporationCountry: country,
          ...(number.trim() ? { registrationNumber: number.trim() } : {}),
          ...(params.type ? { entityType: params.type } : {}),
        },
      });
      for (const option of linked) {
        await api.companies.addRelated({
          params: { companyId: company.id },
          body: {
            legalName: option.name,
            incorporationCountry: option.country,
            ...(option.number ? { registrationNumber: option.number } : {}),
            ...(option.type ? { entityType: option.type } : {}),
          },
        });
      }
      await queries.invalidateQueries({ queryKey: workspaceKey });
      router.replace({ pathname: '/questions', params: { company: company.id } });
    } catch (error) {
      setProblem(asApiError(error).message);
      setBusy(false);
    }
  };

  return (
    <LightScreen
      testID="confirm"
      right={
        <T weight={700} size={13} color={c.ink3}>
          1 of 4
        </T>
      }
      dock={
        <>
          {problem ? (
            <T weight={600} size={13} color={c.urgent} center accessibilityRole="alert" style={{ marginBottom: 10 }}>
              {problem}
            </T>
          ) : null}
          <Btn testID="confirm-go" label={manual ? 'Continue' : `Continue with ${count} ${count === 1 ? 'company' : 'companies'}`} busy={busy} onPress={() => void accept()} />
          <Pressable accessibilityRole="button" accessibilityLabel="Not the right one? Search again" onPress={() => (router.canGoBack() ? router.back() : router.replace('/search'))} style={{ marginTop: 6, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}>
            <T weight={600} size={13} color={c.ink3}>
              {manual ? 'Found it after all? ' : 'Not the right one? '}
              <T weight={700} size={13} color={c.dark ? '#5AA9FF' : '#0182FA'}>
                Search again
              </T>
            </T>
          </Pressable>
        </>
      }
    >
      <Rise>
        <Kicker bold={manual ? 'Enter the company' : 'Confirm the company'}>Step 1 of 4 ·</Kicker>
      </Rise>
      <Rise d={1}>
        <T variant="h1" accessibilityRole="header" style={{ marginTop: 10 }}>
          {manual ? 'Tell us about your company' : 'Is this the right company?'}
        </T>
      </Rise>
      {sample ? (
        <Rise d={1} style={{ alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: c.dark ? 'rgba(255,182,72,0.14)' : '#FFF4E0' }}>
          <T weight={700} size={12} color={c.warn}>
            Sample data · an example record, not a live register
          </T>
        </Rise>
      ) : null}
      <Rise d={2}>
        <Card style={{ marginTop: 22, paddingTop: 18, paddingBottom: 8 }}>
          {manual ? (
            <View style={{ gap: 10, paddingBottom: 12 }}>
              <T weight={700} size={18} style={{ letterSpacing: -0.3 }}>
                Company details
              </T>
              <T variant="small">Entered by you. Vero says these came from you, and checks them with {register.register} when it can.</T>
              <T variant="label" style={{ marginTop: 6 }}>
                Company name
              </T>
              <Field testID="confirm-name" accessibilityLabel="Company name" placeholder="Company name" value={name} onChangeText={setName} autoComplete="organization" />
              <T variant="label" style={{ marginTop: 4 }}>
                {register.numberLabel} (optional)
              </T>
              <Field accessibilityLabel={`${register.numberLabel}, optional`} placeholder={register.numberExample ? `For example ${register.numberExample}` : register.numberLabel} value={number} onChangeText={setNumber} autoCapitalize="characters" autoCorrect={false} />
            </View>
          ) : (
            <>
              <T weight={700} size={18} style={{ letterSpacing: -0.3, lineHeight: 23 }}>
                {name}
              </T>
              <T variant="small" style={{ marginTop: 2 }}>
                {params.source ?? register.register}
                {params.checked ? ` · read live ${readAtWords(params.checked)}` : ''}
              </T>
              <View style={{ marginTop: 10 }}>
                {type ? <Detail label="Type" value={type} /> : null}
                {number ? <Detail label={register.numberLabel} value={number} /> : null}
                {params.formed ? <Detail label="Formed" value={dateWords(params.formed)} /> : null}
                {params.agent ? <Detail label="Registered agent" value={params.agent} /> : null}
                <Detail label="Registered in" value={register.label} />
              </View>
            </>
          )}
        </Card>
      </Rise>
      <Rise d={3}>
        <T weight={600} size={13.5} color={c.ink2} style={{ marginTop: 14, marginHorizontal: 4, lineHeight: 21 }}>
          <T weight={700} size={13.5} color={c.ink}>
            {LEVEL_WORDS[coverage.level]}.
          </T>{' '}
          {coverage.sentence}
        </T>
      </Rise>
      <T variant="label" style={{ marginTop: 26, marginBottom: 10, marginHorizontal: 4 }}>
        {manual ? 'Linked companies' : 'Linked companies, found by name on other registers'}
      </T>
      <Rise d={4}>
        {manual ? (
          <Card>
            <T variant="small" style={{ lineHeight: 19 }}>
              You can add subsidiaries and other companies in your group later.
            </T>
          </Card>
        ) : related === null ? (
          <Card accessibilityLabel="Looking for linked companies">
            <T variant="small">Looking on the other registers…</T>
          </Card>
        ) : related.length === 0 ? (
          <Card>
            <T weight={700} size={14.5}>
              No linked companies found
            </T>
            <T variant="small" style={{ marginTop: 3, lineHeight: 19 }}>
              Vero searched the other registers with full coverage and found no clear match. You can add subsidiaries later.
            </T>
          </Card>
        ) : (
          <>
            <List>
              {related.map((option) => (
                <Row
                  key={option.country}
                  title={option.name}
                  sub={`${option.sourceName}${option.number ? ` · ${option.number}` : ''} · ${countryShort(option.country)}`}
                  right={
                    <Switch
                      label={`Include ${option.name}`}
                      value={option.on}
                      onChange={(next) => setRelated((list) => (list ?? []).map((item) => (item.country === option.country ? { ...item, on: next } : item)))}
                    />
                  }
                />
              ))}
            </List>
            <T variant="small" style={{ marginTop: 10, marginHorizontal: 4, lineHeight: 18 }}>
              Only include a company that really is part of your group. Each one is scanned with its own register.
            </T>
          </>
        )}
      </Rise>
    </LightScreen>
  );
}


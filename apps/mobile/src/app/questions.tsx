import type { QuestionnaireResponse } from '@vero/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { Dock } from '@/components/onboarding/Shell';
import { api, asApiError } from '@/lib/api';
import { optionsOf, sharedAnswers, startingIndex, stepsFrom, toggleMulti, type AnswerValue, type Step } from '@/lib/questions';
import { useWorkspace } from '@/lib/workspace';
import { font } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { motion } from '@/theme/tokens';
import { Icon } from '@/ui/Icon';
import { Rise } from '@/ui/Motion';
import { NavyScreen } from '@/ui/Screen';
import { Btn, IconBtn, tap } from '@/ui/Surfaces';
import { Kicker, T } from '@/ui/Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** `.op`: an answer on navy glass that turns solid when chosen, with a round (or square, for several) tick. */
function Choice({ label, on, multi, index, onPress }: { label: string; on: boolean; multi: boolean; index: number; onPress: () => void }) {
  const { c } = useTheme();
  const still = useReducedMotion();
  const s = useSharedValue(1);
  const press = useAnimatedStyle(() => ({ transform: [{ scale: s.get() }] }));
  const onBg = c.dark ? 'rgba(61,123,255,0.32)' : '#FFFFFF';
  return (
    <Animated.View entering={still ? undefined : FadeInDown.duration(550).delay(80 + index * 55)}>
      <AnimatedPressable
        testID="question-option"
        accessibilityRole={multi ? 'checkbox' : 'radio'}
        accessibilityState={{ checked: on }}
        accessibilityLabel={label}
        onPressIn={() => {
          s.set(withSpring(0.98, motion.spring));
        }}
        onPressOut={() => {
          s.set(withSpring(1, motion.spring));
        }}
        onPress={() => {
          tap();
          onPress();
        }}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            minHeight: 58,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 18,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: on ? (c.dark ? '#4C86FF' : '#FFFFFF') : 'rgba(255,255,255,0.16)',
            backgroundColor: on ? onBg : 'transparent',
          },
          press,
        ]}
      >
        {on ? null : <LinearGradient colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />}
        <T weight={700} size={15} color={on && !c.dark ? c.ink : '#FFFFFF'} style={{ flex: 1, lineHeight: 20 }}>
          {label}
        </T>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: multi ? 7 : 12,
            borderWidth: 1.5,
            borderColor: on ? c.navy : 'rgba(255,255,255,0.35)',
            backgroundColor: on ? c.navy : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {on ? <Icon name="check" size={14} stroke={2.8} color="#fff" /> : null}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function Typed({ step, value, onChange, onSubmit }: { step: Step; value: string; onChange: (text: string) => void; onSubmit: () => void }) {
  const type = step.field.type;
  return (
    <View style={{ marginTop: 20, height: 58, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)', overflow: 'hidden', justifyContent: 'center', paddingHorizontal: 16 }}>
      <LinearGradient colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.05)']} style={StyleSheet.absoluteFill} />
      <TextInput
        testID="question-text"
        accessibilityLabel={step.title}
        value={value}
        onChangeText={onChange}
        placeholder={type === 'date' ? 'YYYY-MM-DD' : type === 'number' ? 'A number' : 'Type your answer'}
        placeholderTextColor="rgba(255,255,255,0.45)"
        keyboardType={type === 'number' ? 'number-pad' : 'default'}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        autoFocus
        style={[{ fontFamily: font.sans(600), fontSize: 17, color: '#fff', height: '100%' }, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null]}
      />
    </View>
  );
}

/** The Questions board: one question at a time, the API deciding which apply. */
export default function Questions() {
  const params = useLocalSearchParams<{ company?: string }>();
  const workspace = useWorkspace();
  const queries = useQueryClient();
  const root = workspace.data?.root ?? null;
  const companies = useMemo(() => (workspace.data?.root ? [workspace.data.root, ...workspace.data.related] : []), [workspace.data]);
  const companyId = params.company ?? root?.id ?? null;
  const company = companies.find((item) => item.id === companyId) ?? null;
  const isRelated = company !== null && root !== null && company.id !== root.id;
  const key = ['questionnaire', companyId] as const;

  const questionnaire = useQuery({
    queryKey: key,
    enabled: companyId !== null && workspace.isSuccess,
    queryFn: async (): Promise<QuestionnaireResponse> => {
      const id = companyId as string;
      if (!isRelated || !root) return api.questionnaire.get({ params: { companyId: id } });
      // Fill in what the main company already answered, so nothing is asked twice.
      const parent = await api.questionnaire.get({ params: { companyId: root.id } });
      let current = await api.questionnaire.get({ params: { companyId: id } });
      for (let round = 0; round < 6; round += 1) {
        const shared = sharedAnswers(parent, current);
        if (Object.keys(shared).length === 0) break;
        current = await api.questionnaire.answer({ params: { companyId: id }, body: { answers: shared } });
      }
      return current;
    },
  });
  const data = questionnaire.data;

  // A related company is only asked what it doesn't have yet.
  // Captured once, from the first answers that arrive (set during render, not in an effect).
  const [known, setKnown] = useState<ReadonlySet<string> | undefined>(undefined);
  if (isRelated && data && !known) {
    setKnown(new Set(data.questions.flatMap((question) => question.fields).filter((field) => field.value !== null).map((field) => field.id)));
  }
  const steps = useMemo(() => (data ? stepsFrom(data, known) : []), [data, known]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [text, setText] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Starts on the first unanswered question once the questions arrive.
  if (data && currentId === null) {
    const first = steps[startingIndex(steps)]?.field.id ?? null;
    if (first !== null) setCurrentId(first);
  }

  const index = Math.max(0, steps.findIndex((step) => step.field.id === currentId));
  const step = steps[index];
  const isLast = index === steps.length - 1;

  // On a new question, fill the box with its saved answer and clear any message (previous-value pattern).
  const [shownId, setShownId] = useState<string | undefined | null>(null);
  if (shownId !== step?.field.id) {
    setShownId(step?.field.id);
    const value = step?.field.value;
    setText(value === null || value === undefined || typeof value === 'boolean' || Array.isArray(value) ? '' : String(value));
    setProblem(null);
  }

  const finish = useCallback(() => {
    const at = companies.findIndex((item) => item.id === company?.id);
    const next = companies[at + 1];
    if (next) router.replace({ pathname: '/questions', params: { company: next.id } });
    else router.replace('/scanning');
  }, [companies, company?.id]);

  const goNext = useCallback(() => {
    clearTimeout(timer.current);
    setProblem(null);
    const following = steps[index + 1];
    if (following) setCurrentId(following.field.id);
    else finish();
  }, [steps, index, finish]);

  const goBack = () => {
    clearTimeout(timer.current);
    const previous = steps[index - 1];
    if (previous) setCurrentId(previous.field.id);
  };

  const answer = (value: AnswerValue | null, advance: boolean) => {
    if (!companyId || !step) return;
    const id = step.field.id;
    setBusy(true);
    setProblem(null);
    api.questionnaire.answer({ params: { companyId }, body: { answers: { [id]: value } } }).then(
      (response) => {
        setBusy(false);
        queries.setQueryData(key, response);
        if (!advance) return;
        // The next screen comes from the API's new list: an answer can add or hide some.
        timer.current = setTimeout(() => {
          const list = stepsFrom(response, known);
          const following = list[list.findIndex((item) => item.field.id === id) + 1];
          if (following) setCurrentId(following.field.id);
          else finish();
        }, 420);
      },
      (error: unknown) => {
        setBusy(false);
        setProblem(asApiError(error).message);
      },
    );
  };

  const name = company?.legalName ?? root?.legalName ?? 'your company';
  const total = step?.questionTotal ?? 0;
  const choices = step ? ['multi', 'single', 'boolean'].includes(step.field.type) : false;
  const multi = step?.field.type === 'multi';
  const chosen = step && Array.isArray(step.field.value) ? step.field.value : [];
  const answered = step ? (multi ? chosen.length > 0 : step.field.value !== null) : false;

  const saveTyped = () => {
    if (!step) return;
    const trimmed = text.trim();
    const before = step.field.value === null ? '' : String(step.field.value);
    if (trimmed === before) return goNext();
    if (step.field.type === 'number' && trimmed && Number.isNaN(Number(trimmed))) {
      setProblem('Type a number, like 12.');
      return;
    }
    answer(trimmed ? (step.field.type === 'number' ? Number(trimmed) : trimmed) : null, true);
  };

  const body = () => {
    if (workspace.isLoading || questionnaire.isLoading || (companyId !== null && !data && !questionnaire.isError)) {
      return (
        <View style={{ paddingTop: 80, alignItems: 'center', gap: 14 }} accessibilityRole="progressbar" accessibilityLabel="Getting the questions">
          <ActivityIndicator color="#fff" />
          <T variant="sub" onNavy>
            Getting the questions
          </T>
        </View>
      );
    }
    if (!companyId) {
      return (
        <View style={{ paddingTop: 40, gap: 16 }}>
          <T variant="h1" onNavy accessibilityRole="header">
            Let&apos;s find your company first
          </T>
          <Btn kind="white" label="Find your company" onPress={() => router.replace('/search')} />
        </View>
      );
    }
    if (questionnaire.isError || workspace.isError) {
      return (
        <View style={{ paddingTop: 40, gap: 16 }} accessibilityRole="alert">
          <T variant="h3" onNavy accessibilityRole="header">
            We couldn&apos;t get the questions
          </T>
          <T variant="sub" onNavy>
            {asApiError(questionnaire.error ?? workspace.error).message}
          </T>
          <Btn kind="white" label="Try again" onPress={() => void questionnaire.refetch()} />
        </View>
      );
    }
    if (!step) {
      return (
        <View style={{ paddingTop: 20 }}>
          <T style={{ fontFamily: font.sans(300), fontSize: 30, lineHeight: 33, letterSpacing: -1.2, color: '#fff' }} accessibilityRole="header">
            Nothing more to ask
          </T>
          <T variant="sub" onNavy style={{ marginTop: 10 }}>
            Vero has what it needs from you for {name}.
          </T>
        </View>
      );
    }
    return (
      <View>
        <Rise style={{ flexDirection: 'row', gap: 6 }}>
          {Array.from({ length: total }, (_, at) => (
            <View key={at} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: at < step.questionIndex - 1 ? '#FFFFFF' : at === step.questionIndex - 1 ? '#9DDAF7' : 'rgba(255,255,255,0.18)' }} />
          ))}
        </Rise>
        <Rise style={{ marginTop: 14 }}>
          <Kicker onNavy bold={`Question ${step.questionIndex} of ${total}`}>
            Step 2 of 4 ·
          </Kicker>
        </Rise>
        <View key={step.field.id}>
          <Rise>
            <T accessibilityRole="header" style={{ fontFamily: font.sans(300), fontSize: 30, lineHeight: 33, letterSpacing: -1.2, color: '#fff', marginTop: 10 }}>
              {step.title}
            </T>
            {step.how ? (
              <T weight={700} size={13} color="#9DDAF7" style={{ marginTop: 8 }}>
                {step.how}
              </T>
            ) : null}
            {step.field.help ? (
              <T weight={600} size={13} color="rgba(255,255,255,0.66)" style={{ marginTop: 6, lineHeight: 19 }}>
                {step.field.help}
              </T>
            ) : null}
            {isRelated ? (
              <T weight={600} size={13} color="rgba(255,255,255,0.66)" style={{ marginTop: 8 }}>
                About{' '}
                <T weight={700} size={13} color="#fff">
                  {name}
                </T>
                . Vero used your earlier answers where they apply.
              </T>
            ) : null}
          </Rise>
          {choices ? (
            <View style={{ gap: 8, marginTop: 20 }} accessibilityRole={multi ? undefined : 'radiogroup'}>
              {optionsOf(step.field).map((option, i) => {
                const on = multi ? chosen.includes(String(option.value)) : step.field.value === option.value;
                return (
                  <Choice
                    key={String(option.value)}
                    index={i}
                    label={option.label}
                    on={on}
                    multi={multi}
                    onPress={() => (multi ? answer(toggleMulti(chosen, String(option.value)), false) : answer(option.value, true))}
                  />
                );
              })}
            </View>
          ) : (
            <Typed step={step} value={text} onChange={setText} onSubmit={saveTyped} />
          )}
          {problem ? (
            <T weight={600} size={13} color="#FFB3B5" accessibilityRole="alert" style={{ marginTop: 12 }}>
              {problem}
            </T>
          ) : null}
          <Rise d={3}>
            <T weight={500} size={13.5} color="rgba(255,255,255,0.66)" style={{ marginTop: 18, lineHeight: 21 }}>
              <T weight={700} size={13.5} color="#fff">
                Why Vero asks.
              </T>{' '}
              {step.question.whyWeAsk}
            </T>
          </Rise>
        </View>
      </View>
    );
  };

  const ready = !step ? !!data : choices ? answered : text.trim().length > 0 || step.field.value !== null;
  const label = !step ? 'Continue' : isLast && companies.findIndex((item) => item.id === company?.id) === companies.length - 1 ? 'Start the scan' : 'Continue';

  return (
    <NavyScreen scroll={false}>
      <View style={{ flex: 1 }}>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 16 }}>
          {step && index > 0 ? <IconBtn icon="back" label="Previous question" onPress={goBack} /> : <View style={{ width: 42 }} />}
          <View style={{ flex: 1 }} />
          {step ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Not sure, skip this question" onPress={goNext} hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
              <T weight={700} size={14} color="rgba(255,255,255,0.72)">
                Not sure, skip
              </T>
            </Pressable>
          ) : null}
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 150 }}>
          {body()}
        </ScrollView>
        {data ? (
          <Dock navy style={{ paddingBottom: 6 }}>
            <Btn
              kind="white"
              testID="question-next"
              label={label}
              busy={busy}
              disabled={!ready}
              onPress={() => {
                if (!step) finish();
                else if (choices) goNext();
                else saveTyped();
              }}
            />
          </Dock>
        ) : null}
      </View>
      </View>
    </NavyScreen>
  );
}

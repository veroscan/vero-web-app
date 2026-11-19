'use client';

import type { QuestionnaireResponse } from '@vero/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorState, Loading } from '@/components/Bits';
import { useSession } from '@/components/Session';
import { OnboardingBar } from '@/components/Shell';
import { api, asApiError } from '@/lib/api';
import { prefersCalm } from '@/lib/motion';
import { sharedAnswers, startingIndex, stepsFrom, toggleMulti, type AnswerValue, type Step } from '@/lib/questions';
import { useResource } from '@/lib/useResource';

interface StepViewProps {
  step: Step;
  busy: boolean;
  problem: string | null;
  onAnswer: (value: AnswerValue | null, advance: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

function Choices({ step, onAnswer }: Pick<StepViewProps, 'step' | 'onAnswer'>) {
  const { field } = step;
  if (field.type === 'multi') {
    const chosen = Array.isArray(field.value) ? field.value : [];
    return (
      <div className="stack g12" role="group" aria-label={step.how || step.title}>
        {(field.options ?? []).map((option, index) => {
          const on = chosen.includes(option.value);
          return (
            <button key={option.value} className={`opt${on ? ' on' : ''}`} type="button" aria-pressed={on} onClick={() => onAnswer(toggleMulti(chosen, option.value), false)}>
              <span>{option.label}</span>
              {index < 9 ? <kbd>{index + 1}</kbd> : null}
            </button>
          );
        })}
      </div>
    );
  }
  const options: { value: AnswerValue; label: string }[] =
    field.type === 'boolean'
      ? [
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ]
      : (field.options ?? []);
  return (
    <div className="stack g12" role="radiogroup" aria-label={step.title}>
      {options.map((option, index) => {
        const on = field.value === option.value;
        return (
          <button key={String(option.value)} className={`opt${on ? ' on' : ''}`} type="button" role="radio" aria-checked={on} onClick={() => onAnswer(option.value, true)}>
            <span>{option.label}</span>
            {index < 9 ? <kbd>{index + 1}</kbd> : null}
          </button>
        );
      })}
    </div>
  );
}

function Typed({ step, onAnswer, onNext }: Pick<StepViewProps, 'step' | 'onAnswer' | 'onNext'>) {
  const { field } = step;
  const initial = field.value === null || typeof field.value === 'boolean' || Array.isArray(field.value) ? '' : String(field.value);
  const [text, setText] = useState(initial);
  const inputId = `q-${field.id}`;
  const save = () => {
    const trimmed = text.trim();
    if (trimmed === initial) return false;
    if (!trimmed) onAnswer(null, true);
    else onAnswer(field.type === 'number' ? Number(trimmed) : trimmed, true);
    return true;
  };
  return (
    <form
      className="q-field"
      onSubmit={(event) => {
        event.preventDefault();
        if (!save()) onNext();
      }}
    >
      <label className="sr-only" htmlFor={inputId}>
        {step.title}
      </label>
      <input className="input" id={inputId} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} min={field.type === 'number' ? 0 : undefined} inputMode={field.type === 'number' ? 'numeric' : undefined} value={text} autoFocus onChange={(event) => setText(event.target.value)} />
      <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
    </form>
  );
}

function StepView({ step, busy, problem, onAnswer, onBack, onNext }: StepViewProps) {
  const { field, question } = step;
  const hasChoices = field.type === 'multi' || field.type === 'single' || field.type === 'boolean';
  const count = field.type === 'boolean' ? 2 : (field.options?.length ?? 0);
  return (
    <section className="q" data-step="" data-field={field.id} key={field.id}>
      <div className="stack g16">
        <h1 className="q-title">{step.title}</h1>
        {step.how ? <p className="q-how">{step.how}</p> : null}
        {field.help ? <p className="q-how">{field.help}</p> : null}
        <p className="small q-why">
          <span className="b">Why we ask.</span> {question.whyWeAsk}
        </p>
      </div>
      <div className="stack g20">
        {hasChoices ? <Choices step={step} onAnswer={onAnswer} /> : <Typed step={step} onAnswer={onAnswer} onNext={onNext} />}
        {problem ? (
          <p className="formerror" role="alert">
            {problem}
          </p>
        ) : null}
        <div className="btns q-nav">
          <button className="btn btn-line" type="button" onClick={onBack}>
            Back
          </button>
          <span className="q-hint">
            {field.type === 'multi' || !hasChoices ? (
              <>
                Press <kbd>Enter</kbd> to continue
              </>
            ) : (
              <>
                Press <kbd>1</kbd> to <kbd>{Math.min(count, 9)}</kbd> to answer
              </>
            )}
          </span>
          <button className="btn btn-ink" type="button" disabled={busy} onClick={onNext} data-testid="q-continue">
            Continue
          </button>
        </div>
      </div>
    </section>
  );
}

function QuestionFlow({ companyId }: { companyId: string | null }) {
  const session = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const companies = useMemo(() => (session.root ? [session.root, ...session.related] : []), [session.root, session.related]);
  const company = companies.find((item) => item.id === companyId) ?? null;
  const isRelated = company !== null && company.id !== session.root?.id;
  const askedFor = params.get('field');

  const resource = useResource<QuestionnaireResponse | null>(async () => {
    if (!company) return null;
    if (!isRelated || !session.root) return api.questionnaire.get({ params: { companyId: company.id } });
    // Fill in what the main company already answered, so nothing is asked twice. New answers
    // can reveal more shared questions, so this repeats until nothing changes.
    const parent = await api.questionnaire.get({ params: { companyId: session.root.id } });
    let current = await api.questionnaire.get({ params: { companyId: company.id } });
    for (let round = 0; round < 6; round += 1) {
      const shared = sharedAnswers(parent, current);
      if (Object.keys(shared).length === 0) break;
      current = await api.questionnaire.answer({ params: { companyId: company.id }, body: { answers: shared } });
    }
    return current;
  }, [company?.id]);

  const { data, set } = resource;
  // A related company is only asked what it doesn't have yet. What it already has when the
  // questions open came from the main company's answers, and stays out of the flow.
  const alreadyKnown = useRef<ReadonlySet<string> | undefined>(undefined);
  if (isRelated && data && !alreadyKnown.current) {
    alreadyKnown.current = new Set(data.questions.flatMap((question) => question.fields).filter((field) => field.value !== null).map((field) => field.id));
  }
  const steps = useMemo(() => (data ? stepsFrom(data, alreadyKnown.current) : []), [data]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  useEffect(() => {
    if (!data) return;
    setCurrentId((id) => id ?? askedFor ?? steps[startingIndex(steps)]?.field.id ?? null);
  }, [data, steps, askedFor]);

  const index = Math.max(0, steps.findIndex((step) => step.field.id === currentId));
  const step = steps[index];

  const finish = useCallback(async () => {
    const at = companies.findIndex((item) => item.id === company?.id);
    const nextCompany = companies[at + 1];
    if (nextCompany) {
      router.push(`/onboarding/questions?company=${nextCompany.id}`);
      return;
    }
    // A company just added to an existing team still needs its first scan.
    if (session.hasResult && params.get('added') !== '1') {
      await session.refresh().catch(() => undefined);
      router.push('/');
      return;
    }
    router.push('/onboarding/scanning');
  }, [companies, company?.id, router, session, params]);

  const goNext = useCallback(() => {
    clearTimeout(advanceTimer.current);
    setProblem(null);
    const following = steps[index + 1];
    if (following) setCurrentId(following.field.id);
    else void finish();
  }, [steps, index, finish]);

  const goBack = useCallback(() => {
    clearTimeout(advanceTimer.current);
    setProblem(null);
    const previous = steps[index - 1];
    if (previous) setCurrentId(previous.field.id);
    else router.push('/');
  }, [steps, index, router]);

  // After a save, the next screen comes from the API's new list: an answer can add or hide some.
  const latestAdvance = useRef<(() => void) | null>(null);
  useEffect(() => {
    latestAdvance.current?.();
    latestAdvance.current = null;
  }, [data]);

  const answer = useCallback(
    (value: AnswerValue | null, advance: boolean) => {
      if (!company || !step) return;
      const id = step.field.id;
      setBusy(true);
      setProblem(null);
      api.questionnaire.answer({ params: { companyId: company.id }, body: { answers: { [id]: value } } }).then(
        (response) => {
          setBusy(false);
          if (advance) {
            latestAdvance.current = () => {
              const delay = prefersCalm() ? 0 : 260;
              advanceTimer.current = setTimeout(() => {
                const list = stepsFrom(response, alreadyKnown.current);
                const at = list.findIndex((item) => item.field.id === id);
                const following = list[at + 1];
                if (following) setCurrentId(following.field.id);
                else void finish();
              }, delay);
            };
          }
          set(response);
        },
        (error: unknown) => {
          setBusy(false);
          setProblem(asApiError(error).message);
        },
      );
    },
    [company, step, set, finish],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input,textarea') || event.ctrlKey || event.metaKey || event.altKey) return;
      if (/^[1-9]$/.test(event.key) && step) {
        const optionButtons = document.querySelectorAll<HTMLButtonElement>('[data-step] .opt');
        optionButtons[Number(event.key) - 1]?.click();
      }
      if (event.key === 'Enter' && !target?.closest('a,button')) goNext();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [step, goNext]);

  useEffect(() => {
    if (!session.root) router.replace('/onboarding/company');
  }, [session.root, router]);

  const label = step ? `Question ${step.questionIndex} of ${step.questionTotal}` : '';
  const width = step ? `${(step.questionIndex / step.questionTotal) * 100}%` : '0%';
  return (
    <div className="vs">
      <div className="flowbar" aria-hidden="true">
        <i style={{ width }} />
      </div>
      <OnboardingBar step={label} live />
      <main className="wrap q-main">
        {resource.loading && !data ? (
          <Loading what="Getting your questions" />
        ) : resource.error ? (
          <ErrorState error={resource.error} onRetry={resource.reload} />
        ) : step ? (
          <div className="q-flow">
            {isRelated && company ? (
              <p className="small" style={{ marginBottom: 16 }}>
                About <span className="b">{company.legalName}</span>. We&apos;ve used your earlier answers where they apply.
              </p>
            ) : null}
            <StepView key={step.field.id} step={step} busy={busy} problem={problem} onAnswer={answer} onBack={goBack} onNext={goNext} />
          </div>
        ) : (
          <div className="state">
            <h1 className="t-2">Nothing more to ask</h1>
            <button className="btn btn-ink btn-sm" type="button" onClick={() => void finish()}>
              Continue
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/** Keyed by company, so one company's questions and answers can never show under another's. */
function KeyedFlow() {
  const session = useSession();
  const companyId = useSearchParams().get('company') ?? session.root?.id ?? null;
  return <QuestionFlow key={companyId ?? 'none'} companyId={companyId} />;
}

export default function Page() {
  return (
    <Suspense>
      <KeyedFlow />
    </Suspense>
  );
}

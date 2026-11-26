'use client';

import '@/app/styles/pages/scan.css';
import type { QuestionnaireResponse } from '@vero/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from 'react';
import { ErrorState, Loading } from '@/components/Bits';
import { Reveal, Scramble, Words } from '@/components/Motion';
import { useSession } from '@/components/Session';
import { After, Hero } from '@/components/Shell';
import { api, asApiError } from '@/lib/api';
import { prefersCalm } from '@/lib/motion';
import { sharedAnswers, startingIndex, stepsFrom, toggleMulti, type AnswerValue, type Step } from '@/lib/questions';
import { useResource } from '@/lib/useResource';

const TICK = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

interface Option {
  value: AnswerValue;
  label: string;
}

function optionsOf(step: Step): Option[] {
  const { field } = step;
  if (field.type === 'boolean') {
    return [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ];
  }
  return field.options ?? [];
}

/** The answer in words, for the summary table. */
function answerWords(step: Step): string | null {
  const { field } = step;
  if (field.value === null) return null;
  if (Array.isArray(field.value)) {
    const labels = field.value.map((value) => field.options?.find((option) => option.value === value)?.label ?? value);
    return labels.length > 0 ? labels.join(', ') : null;
  }
  if (typeof field.value === 'boolean') return field.value ? 'Yes' : 'No';
  return field.options?.find((option) => option.value === field.value)?.label ?? String(field.value);
}

function Choices({ step, onAnswer }: { step: Step; onAnswer: (value: AnswerValue | null, advance: boolean) => void }) {
  const { field } = step;
  const multi = field.type === 'multi';
  const chosen = Array.isArray(field.value) ? field.value : [];
  // Up and down move between the answers. Choosing one stays a deliberate Enter or Space, because it moves the screen on.
  const onKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const all = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('.op'));
    const at = all.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    event.preventDefault();
    const to = event.key === 'Home' ? 0 : event.key === 'End' ? all.length - 1 : (at + (event.key === 'ArrowDown' ? 1 : -1) + all.length) % all.length;
    all[to]?.focus();
  };
  return (
    <div className="opts" role={multi ? 'group' : 'radiogroup'} aria-label={multi ? step.how || step.title : step.title} onKeyDown={onKey}>
      {optionsOf(step).map((option, index) => {
        const on = multi ? chosen.includes(String(option.value)) : field.value === option.value;
        return (
          <button
            key={String(option.value)}
            className={`op${multi ? ' multi' : ''}${on ? ' on' : ''}`}
            type="button"
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => (multi ? onAnswer(toggleMulti(chosen, String(option.value)), false) : onAnswer(option.value, true))}
          >
            <span>
              <b>{option.label}</b>
            </span>
            {index < 9 ? <kbd aria-hidden="true">{index + 1}</kbd> : null}
            <span className="k">{TICK}</span>
          </button>
        );
      })}
    </div>
  );
}

function Typed({ step, onAnswer, onNext, saver }: { step: Step; onAnswer: (value: AnswerValue | null, advance: boolean) => void; onNext: () => void; saver: RefObject<(() => boolean) | null> }) {
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
  // The Continue button under the box saves what was typed as well, so nothing typed is ever dropped.
  useEffect(() => {
    saver.current = save;
    return () => {
      saver.current = null;
    };
  });
  return (
    <form
      className="typed"
      onSubmit={(event) => {
        event.preventDefault();
        if (!save()) onNext();
      }}
    >
      <label className="sr-only" htmlFor={inputId}>
        {step.title}
      </label>
      <input id={inputId} type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} min={field.type === 'number' ? 0 : undefined} inputMode={field.type === 'number' ? 'numeric' : undefined} enterKeyHint="next" autoComplete="off" value={text} autoFocus onChange={(event) => setText(event.target.value)} />
      <small className="kbh">Press Enter to save and continue.</small>
      <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
    </form>
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
  // A related company is only asked what it doesn't have yet.
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
  const typedSave = useRef<(() => boolean) | null>(null);
  const sent = useRef(0);
  const answerArea = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!data) return;
    setCurrentId((id) => id ?? askedFor ?? steps[startingIndex(steps)]?.field.id ?? null);
  }, [data, steps, askedFor]);

  const index = Math.max(0, steps.findIndex((step) => step.field.id === currentId));
  const step = steps[index];
  const isLast = index === steps.length - 1;

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
  }, [steps, index]);

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
      const turn = (sent.current += 1);
      clearTimeout(advanceTimer.current);
      setBusy(true);
      setProblem(null);
      // The choice shows at once. The API's answer then replaces it, because one answer can add or hide other questions.
      if (data) set({ ...data, questions: data.questions.map((question) => ({ ...question, fields: question.fields.map((field) => (field.id === id ? { ...field, value } : field)) })) });
      api.questionnaire.answer({ params: { companyId: company.id }, body: { answers: { [id]: value } } }).then(
        (response) => {
          // Only the newest answer counts: an older reply arriving late must not undo a later choice.
          if (turn !== sent.current) return;
          setBusy(false);
          if (advance) {
            latestAdvance.current = () => {
              const delay = prefersCalm() ? 0 : 320;
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
          if (turn !== sent.current) return;
          setBusy(false);
          setProblem(asApiError(error).message);
          resource.reload();
        },
      );
    },
    [company, step, set, finish, data, resource],
  );

  // After the first screen, the keyboard follows to the new question's first answer.
  const stepId = step?.field.id;
  useEffect(() => {
    if (!stepId) return;
    if (!moved.current) {
      moved.current = true;
      return;
    }
    answerArea.current?.querySelector<HTMLElement>('.op.on, .op, .typed input')?.focus({ preventScroll: true });
  }, [stepId]);

  const onContinue = () => {
    if (busy) return;
    if (typedSave.current?.()) return;
    goNext();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input,textarea,select') || event.ctrlKey || event.metaKey || event.altKey || document.body.classList.contains('cmdo')) return;
      if (/^[1-9]$/.test(event.key) && step) {
        const optionButtons = document.querySelectorAll<HTMLButtonElement>('[data-step] .op');
        optionButtons[Number(event.key) - 1]?.click();
      }
      if (event.key === 'Enter' && !target?.closest('a,button') && !busy) goNext();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [step, goNext, busy]);

  useEffect(() => {
    if (!session.root) router.replace('/onboarding/company');
  }, [session.root, router]);

  const name = company?.legalName ?? session.root?.legalName ?? 'your company';
  const total = step?.questionTotal ?? 0;
  const hasChoices = step ? ['multi', 'single', 'boolean'].includes(step.field.type) : false;
  // An honest guess at the time: a few seconds a screen, never less than a minute.
  const minutes = Math.max(1, Math.round((steps.length * 5) / 60));
  const timeWords = minutes === 1 ? 'about a minute' : `about ${minutes} minutes`;
  const groups = steps.reduce<Step[][]>((list, item) => {
    const last = list[list.length - 1];
    if (last && last[0]?.question.id === item.question.id) last.push(item);
    else list.push([item]);
    return list;
  }, []);

  return (
    <div className="pg-scan">
      <Hero>
        <div className="pagehead">
          <div>
            <div className="mono kick">
              <Scramble text="Step 2 of 4" /> · <b><Scramble text="A few questions" delay={120} /></b>
            </div>
            <h1 className="disp">
              <Words text={`A few questions about ${name}`} />
            </h1>
            <div className="meta">
              <span>{total > 0 ? `${total} ${total === 1 ? 'question' : 'questions'}, ${timeWords}` : 'A few questions'}</span>
              <span>Your answers decide which checks run</span>
            </div>
          </div>
        </div>

        {resource.loading && !data ? (
          <Loading what="Getting the questions" />
        ) : resource.error ? (
          <ErrorState error={resource.error} onRetry={resource.reload} />
        ) : step ? (
          <section className="qa">
            <div>
              <div className="prog" aria-hidden="true">
                {Array.from({ length: total }, (_, at) => (
                  <i key={at} className={at < step.questionIndex - 1 ? 'done' : at === step.questionIndex - 1 ? 'now' : ''} />
                ))}
              </div>
              <div className="qstep" aria-live="polite">
                Question {step.questionIndex} of {total}
              </div>
              <div className="q" key={step.field.id}>
                <h2>{step.title}</h2>
                {step.how ? <div className="hint">{step.how}</div> : null}
                {step.field.help ? <div className="hint">{step.field.help}</div> : null}
                {isRelated && company ? (
                  <div className="about">
                    About <b>{company.legalName}</b>. Vero used your earlier answers where they apply.
                  </div>
                ) : null}
                <div className="qwhy">
                  <b>Why Vero asks</b>
                  <p>{step.question.whyWeAsk}</p>
                </div>
              </div>
            </div>
            <div data-step="" data-field={step.field.id} key={`a-${step.field.id}`} ref={answerArea}>
              {hasChoices ? <Choices step={step} onAnswer={answer} /> : <Typed step={step} onAnswer={answer} onNext={goNext} saver={typedSave} />}
              {problem ? (
                <p className="qerr" role="alert">
                  {problem}
                </p>
              ) : null}
              <div className="qnav">
                <button className="btn btn-g" type="button" onClick={goBack} style={{ visibility: index > 0 ? 'visible' : 'hidden' }}>
                  Back
                </button>
                <button className="skip" type="button" onClick={goNext}>
                  Not sure, skip this one
                </button>
                <button className="btn btn-p" type="button" aria-busy={busy || undefined} onClick={onContinue} data-testid="q-continue">
                  {isLast ? (session.hasResult && params.get('added') !== '1' ? 'Save answers' : 'Start the scan') : 'Continue'}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="qa">
            <div className="q">
              <h2>Nothing more to ask</h2>
              <div className="qwhy">
                <p>Vero has what it needs from you for {name}.</p>
              </div>
            </div>
            <div className="qnav">
              <button className="btn btn-p" type="button" onClick={() => void finish()} data-testid="q-continue">
                Continue
              </button>
            </div>
          </section>
        )}
      </Hero>

      {steps.length > 0 ? (
        <After>
          <Reveal as="section" className="mod ans">
            <div className="mh">
              <h2>Your answers</h2>
              <span className="sub">
                {groups.filter((group) => group.some((item) => item.field.value !== null)).length} of {groups.length} questions answered. Change any of them later in Settings, and Vero re-runs the checks they affect.
              </span>
            </div>
            <table style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th style={{ width: 44 }} />
                  <th style={{ width: '46%' }}>Question</th>
                  <th>Answer</th>
                </tr>
              </thead>
              <tbody className="rows-in">
                {groups.map((group, at) => {
                  const answered = group.filter((item) => item.field.value !== null);
                  const first = group[0] as Step;
                  const words = group.length === 1 ? answerWords(first) : answered.length > 0 ? `${answered.length} of ${group.length} answered` : null;
                  const current = group.some((item) => item.field.id === step?.field.id);
                  const target = group.find((item) => item.field.value === null) ?? first;
                  return (
                    <tr
                      key={first.question.id}
                      className={`${current ? 'cur' : ''}${answered.length > 0 ? ' got' : ''}`}
                      style={{ '--r': at } as CSSProperties}
                      onClick={() => {
                        setProblem(null);
                        setCurrentId(target.field.id);
                        window.scrollTo({ top: 0, behavior: prefersCalm() ? 'auto' : 'smooth' });
                      }}
                    >
                      <td className="n">{first.questionIndex}</td>
                      <td>
                        <button className="qlink" type="button" aria-current={current ? 'step' : undefined} aria-label={`${first.question.title}, ${words ? 'change the answer' : 'answer it'}`}>
                          {first.question.title}
                        </button>
                      </td>
                      <td className={`a${words ? '' : ' none'}`}>{words ?? 'Not answered yet'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Reveal>
        </After>
      ) : null}
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

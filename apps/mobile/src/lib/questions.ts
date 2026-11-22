import type { QuestionnaireResponse } from '@vero/shared';

/** One field per screen, the API deciding which show. Ported from apps/web/src/lib/questions.ts. */
export type Question = QuestionnaireResponse['questions'][number];
export type Field = Question['fields'][number];
export type AnswerValue = NonNullable<Field['value']>;

export interface Step {
  field: Field;
  question: Question;
  /** Position of the question among those showing now, from 1. */
  questionIndex: number;
  questionTotal: number;
  title: string;
  how: string;
}

/** Already known from the company itself, so never asked. */
const KNOWN_FROM_COMPANY = new Set(['jurisdiction', 'incorporated']);

function howWords(field: Field, isOnlyField: boolean): string {
  switch (field.type) {
    case 'multi':
      return 'Choose all that apply';
    case 'single':
    case 'boolean':
      return 'Pick the closest one';
    case 'number':
      return 'A rough number is fine';
    case 'date':
      return "Skip it if you don't know";
    case 'text':
      return isOnlyField ? '' : 'Type it in';
  }
}

export function stepsFrom(response: QuestionnaireResponse, skip?: ReadonlySet<string>): Step[] {
  const questions = response.questions
    .map((question) => ({ question, fields: question.fields.filter((field) => !KNOWN_FROM_COMPANY.has(field.id) && !skip?.has(field.id)) }))
    .filter((item) => item.fields.length > 0);
  return questions.flatMap(({ question, fields }, index) =>
    fields.map((field) => {
      const alone = fields.length === 1;
      const generic = /^choose all that apply$/i.test(field.label) || field.label.startsWith('For example');
      return {
        field,
        question,
        questionIndex: index + 1,
        questionTotal: questions.length,
        title: alone || generic ? question.title : field.label,
        how: generic && !/^choose all/i.test(field.label) ? field.label : howWords(field, alone),
      };
    }),
  );
}

/** Where to pick up: the first screen with nothing on it, or the last if all are answered. */
export function startingIndex(steps: Step[]): number {
  const first = steps.findIndex((step) => step.field.value === null);
  return first === -1 ? Math.max(0, steps.length - 1) : first;
}

/** Picking "none of these" clears the others, and picking another clears "none". */
export function toggleMulti(current: readonly string[], value: string): string[] {
  const exclusive = (item: string) => item === 'none';
  if (current.includes(value)) return current.filter((item) => item !== value);
  if (exclusive(value)) return [value];
  return [...current.filter((item) => !exclusive(item)), value];
}

/** Answers the parent has that a related company also shows, and hasn't answered itself. */
export function sharedAnswers(parent: QuestionnaireResponse, related: QuestionnaireResponse): Record<string, AnswerValue> {
  const values = new Map(parent.questions.flatMap((question) => question.fields).map((field) => [field.id, field.value]));
  const shared: Record<string, AnswerValue> = {};
  for (const field of related.questions.flatMap((question) => question.fields)) {
    if (KNOWN_FROM_COMPANY.has(field.id) || field.value !== null) continue;
    const value = values.get(field.id);
    if (value !== undefined && value !== null) shared[field.id] = value;
  }
  return shared;
}

export function optionsOf(field: Field): { value: AnswerValue; label: string }[] {
  if (field.type === 'boolean') {
    return [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ];
  }
  return field.options ?? [];
}

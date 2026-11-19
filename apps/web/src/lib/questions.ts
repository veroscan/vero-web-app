import type { QuestionnaireResponse } from '@vero/shared';

export type Question = QuestionnaireResponse['questions'][number];
export type Field = Question['fields'][number];
export type AnswerValue = NonNullable<Field['value']>;

export interface Step {
  field: Field;
  question: Question;
  /** Position of the question among those showing now, from 1. */
  questionIndex: number;
  questionTotal: number;
  /** The big heading on the screen. */
  title: string;
  /** The small line under it. */
  how: string;
}

/** Already known from the company itself, so never asked. */
const KNOWN_FROM_COMPANY = new Set(['jurisdiction', 'incorporated']);

function howWords(field: Field, isOnlyField: boolean): string {
  switch (field.type) {
    case 'multi':
      return 'Choose all that apply.';
    case 'single':
    case 'boolean':
      return 'Pick the closest one.';
    case 'number':
      return 'A rough number is fine.';
    case 'date':
      return "Skip it if you don't know.";
    case 'text':
      return isOnlyField ? '' : 'Type it in.';
  }
}

/**
 * One field on one screen, as in the design. A question with several fields becomes several
 * screens, and the API decides which of them show, so conditional logic lives in one place.
 */
export function stepsFrom(response: QuestionnaireResponse, skip?: ReadonlySet<string>): Step[] {
  const questions = response.questions
    .map((question) => ({ question, fields: question.fields.filter((field) => !KNOWN_FROM_COMPANY.has(field.id) && !skip?.has(field.id)) }))
    .filter((item) => item.fields.length > 0);
  return questions.flatMap(({ question, fields }, index) =>
    fields.map((field) => {
      const alone = fields.length === 1;
      // "Choose all that apply" isn't a heading, so a lone field takes the question's title.
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

export function isAnswered(field: Field): boolean {
  return field.value !== null;
}

/** Where to pick up: the first screen with nothing on it, or the last if all are answered. */
export function startingIndex(steps: Step[]): number {
  const first = steps.findIndex((step) => !isAnswered(step.field));
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

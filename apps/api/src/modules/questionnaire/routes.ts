import { answersToFacts, JURISDICTIONS, QUESTIONNAIRE_VERSION, varsIn, visibleQuestions, loadPack, type Answers, type FactValue } from '@vero/rules';
import { contract, type QuestionnaireResponse } from '@vero/shared';
import { and, eq, inArray } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute, type RequestMeta } from '../../http/route';
import { writeAudit } from '../audit/service';
import { requireOwned } from '../companies/ownership';
import { FIELDS, loadAnswers, rebuildAnswerFacts, requireCompany, setAttestation, withCompanyAnswers, type CompanyRow } from '../scans/facts';
import { askSourcesAgainSoon, IDENTIFIER_FIELDS, requestRescore } from '../scans/pipeline';

const { answer, question, questionSet } = schema;

/** Statements the rules accept on someone's word, gathered from the packs so the list can't drift. */
const ATTESTATION_KEYS: ReadonlySet<string> = new Set(
  JURISDICTIONS.flatMap((code) =>
    loadPack(code).rules.flatMap((rule) =>
      [rule.applies_when, rule.satisfied_when, ...(rule.defect_when === undefined ? [] : [rule.defect_when]), ...(rule.verify_when === undefined ? [] : [rule.verify_when])]
        .flatMap(varsIn)
        .filter((key) => key.startsWith('attest.'))
        .map((key) => key.slice('attest.'.length)),
    ),
  ),
);

function buildResponse(company: CompanyRow, stored: Answers, rescoreQueued: boolean): QuestionnaireResponse {
  const effective = withCompanyAnswers(company, stored);
  const questions = visibleQuestions(effective).map((item) => ({
    number: item.number,
    id: item.id,
    title: item.title,
    whyWeAsk: item.why_we_ask,
    fields: item.fields.map((field) => ({
      id: field.id,
      label: field.label,
      help: field.help ?? null,
      type: field.type,
      options: field.options ?? null,
      value: (effective[field.id] ?? null),
    })),
  }));
  // Optional fields, such as a VAT number, don't hold "complete" back.
  const fields = questions.flatMap((item) => item.fields).filter((field) => FIELDS.get(field.id)?.optional !== true);
  const answered = fields.filter((field) => field.value !== null).length;
  return {
    version: QUESTIONNAIRE_VERSION,
    questions,
    answeredFields: answered,
    visibleFields: fields.length,
    complete: answered === fields.length,
    rescoreQueued,
  };
}

async function saveAnswers(tx: Tx, company: CompanyRow, changes: Record<string, FactValue>, userId: string, now: Date): Promise<void> {
  const keys = Object.keys(changes);
  const rows = await tx
    .select({ id: question.id, key: question.key })
    .from(question)
    .innerJoin(questionSet, eq(questionSet.id, question.questionSetId))
    .where(and(eq(questionSet.version, QUESTIONNAIRE_VERSION), inArray(question.key, keys)));
  const ids = new Map(rows.map((row) => [row.key, row.id]));

  for (const [key, value] of Object.entries(changes)) {
    const questionId = ids.get(key);
    if (!questionId) throw errors.invalidInput('We do not ask that question.');
    if (value === null) {
      await tx.delete(answer).where(and(eq(answer.companyId, company.id), eq(answer.questionId, questionId)));
      continue;
    }
    await tx
      .insert(answer)
      .values({ organisationId: company.organisationId, companyId: company.id, questionId, value, answeredBy: userId, answeredAt: now })
      .onConflictDoUpdate({ target: [answer.companyId, answer.questionId], set: { value, answeredBy: userId, answeredAt: now } });
  }
}

/** Saves answers, rebuilds the facts they become, and asks for a new score if there is one. */
export async function saveCompanyAnswers(
  deps: AppDeps,
  organisationId: string,
  companyId: string,
  userId: string,
  answers: Record<string, FactValue>,
  meta?: RequestMeta,
): Promise<QuestionnaireResponse> {
  const keys = Object.keys(answers);
  for (const key of keys) {
    if (!FIELDS.has(key)) throw errors.invalidInput('We do not ask that question.');
  }
  const company = await deps.db.withOrg(organisationId, async (tx) => {
    const row = await requireCompany(tx, companyId);
    requireOwned(row);
    if (keys.includes('jurisdiction') && answers.jurisdiction !== row.incorporationCountry) {
      throw errors.invalidInput('Change the country on the company itself.');
    }
    const stored = await loadAnswers(tx, row.id);
    const merged: Answers = { ...stored };
    for (const [key, value] of Object.entries(answers)) {
      if (value === null) delete merged[key];
      else merged[key] = value;
    }
    const problem = answersToFacts(withCompanyAnswers(row, merged)).problems.find((item) => keys.includes(item.field));
    if (problem) throw errors.invalidInput(problem.message);

    await saveAnswers(tx, row, answers, userId, deps.now());
    await rebuildAnswerFacts(tx, row, deps.now());
    await writeAudit(tx, {
      organisationId,
      actorId: userId,
      action: 'answers.updated',
      target: row.id,
      // Which questions, not what was said.
      metadata: { fields: keys },
      ...(meta ? { meta } : {}),
    });
    return row;
  });
  // A new reference number means a source that couldn't run before now can: ask it soon.
  if (keys.some((key) => IDENTIFIER_FIELDS.has(key))) await askSourcesAgainSoon(deps, company.id);
  const queued = await requestRescore(deps, organisationId, company.id, 'answers');
  return deps.db.withOrg(organisationId, async (tx) => buildResponse(company, await loadAnswers(tx, company.id), queued));
}

export function registerQuestionnaireRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.questionnaire.get, { auth: 'org', permission: 'companies.read' }, async ({ org, params }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const company = await requireCompany(tx, params.companyId);
      return buildResponse(company, await loadAnswers(tx, company.id), false);
    }),
  );

  defineRoute(
    app,
    deps,
    contract.questionnaire.answer,
    { auth: 'org', permission: 'answers.write' },
    async ({ org, session, params, body, meta }) => saveCompanyAnswers(deps, org.organisationId, params.companyId, session.userId, body.answers, meta),
  );

  defineRoute(
    app,
    deps,
    contract.questionnaire.attest,
    { auth: 'org', permission: 'answers.write' },
    async ({ org, session, params, body, meta }) => {
      if (!ATTESTATION_KEYS.has(body.key)) throw errors.invalidInput('We do not ask about that.');
      await deps.db.withOrg(org.organisationId, async (tx) => {
        const company = await requireCompany(tx, params.companyId);
        requireOwned(company);
        await setAttestation(tx, company, body.key, body.value, deps.now());
        await writeAudit(tx, {
          organisationId: org.organisationId,
          actorId: session.userId,
          action: 'attestation.updated',
          target: company.id,
          metadata: { key: body.key, value: body.value },
          meta,
        });
      });
      const queued = await requestRescore(deps, org.organisationId, params.companyId, 'answers');
      return { key: body.key, value: body.value, rescoreQueued: queued };
    },
  );
}

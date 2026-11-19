import { eq } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import type { RequestMeta } from '../../http/route';
import type { Classifier, HelperUsage } from '../../infra';
import { writeAudit } from '../audit/service';

const DAY_SECONDS = 24 * 60 * 60;

export const DAILY_LIMIT_REACHED = "We've read as many documents automatically as we can today, so this one needs a person to check it.";

/** Whether the organisation has switched the document helper on. No row means off. */
export async function documentHelperSwitchedOn(tx: Tx, organisationId: string): Promise<boolean> {
  const [row] = await tx
    .select({ enabled: schema.organisationSetting.documentHelperEnabled })
    .from(schema.organisationSetting)
    .where(eq(schema.organisationSetting.organisationId, organisationId));
  return row?.enabled === true;
}

/**
 * The organisation's own say-so for its documents to be read by Claude. There is no screen for
 * it yet. Every change is audited with who made it.
 */
export async function setDocumentHelper(
  deps: AppDeps,
  input: { organisationId: string; userId: string; enabled: boolean; meta?: RequestMeta },
): Promise<void> {
  const { organisationId, userId, enabled } = input;
  await deps.db.withOrg(organisationId, async (tx) => {
    const now = deps.now();
    await tx
      .insert(schema.organisationSetting)
      .values({ organisationId, documentHelperEnabled: enabled, documentHelperSetBy: userId, documentHelperSetAt: now })
      .onConflictDoUpdate({
        target: schema.organisationSetting.organisationId,
        set: { documentHelperEnabled: enabled, documentHelperSetBy: userId, documentHelperSetAt: now },
      });
    await writeAudit(tx, {
      organisationId,
      actorId: userId,
      action: enabled ? 'organisation.document_helper_on' : 'organisation.document_helper_off',
      target: organisationId,
      ...(input.meta ? { meta: input.meta } : {}),
    });
  });
}

export interface ClassifierChoice {
  classifier: Classifier;
  /** True when the file goes to the document helper. */
  helper: boolean;
  /** Set when the helper would have been used but the daily limit stopped it. */
  unread?: string;
}

/**
 * The heuristic, unless all three hold: the helper is switched on for this environment
 * (AI_DOCUMENT_HELPER_ENABLED, with a key), the organisation has switched it on, and it is
 * under its daily limit. Anything else is exactly the classifier it was before.
 */
export async function chooseClassifier(deps: AppDeps, organisationId: string): Promise<ClassifierChoice> {
  const heuristic: ClassifierChoice = { classifier: deps.classifier, helper: false };
  const helper = deps.documentHelper;
  if (!helper) return heuristic;
  const switchedOn = await deps.db.withOrg(organisationId, (tx) => documentHelperSwitchedOn(tx, organisationId));
  if (!switchedOn) return heuristic;
  const limit = await deps.limiter.hit(`document-helper:org:${organisationId}`, deps.config.documentHelper.maxPerOrgPerDay, DAY_SECONDS);
  if (!limit.allowed) return { ...heuristic, unread: DAILY_LIMIT_REACHED };
  return { classifier: helper, helper: true };
}

/** One audit row per call: the model, how it ended and the token counts. Nothing it read. */
export async function recordHelperUsage(tx: Tx, organisationId: string, documentId: string, usage: HelperUsage): Promise<void> {
  await writeAudit(tx, {
    organisationId,
    action: 'document.helper_used',
    target: documentId,
    metadata: {
      model: usage.model,
      outcome: usage.outcome,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cacheCreationInputTokens: usage.cacheCreationInputTokens,
      cacheReadInputTokens: usage.cacheReadInputTokens,
    },
  });
}

import type { FactValue } from '@vero/rules';
import { and, desc, eq, isNotNull, ne } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import { writeAudit } from '../audit/service';
import { notifyOrganisation } from '../notifications/service';
import { isDown } from '../scans/facts';

/**
 * Change detection for monitoring re-scans. Runs inside the scan's own result transaction:
 * `snapshotBefore` reads what the company looked like before this result is written, and
 * `recordMonitoringChanges` compares, stores the difference, and tells people only when
 * something meaningful changed.
 *
 * A source that couldn't be checked this time is never a change: its facts aren't replaced,
 * its rules come out as "to check" rather than passed or failed, and it is listed as not
 * checked. Nothing here claims a problem exists because a source was down.
 */

const PROBLEM = new Set(['gap', 'defect']);
const SETTLED = new Set(['pass', 'not_applicable']);
const URGENT = new Set(['critical', 'high']);
const SCORE_DROP_POINTS = 5;
const SANCTIONS = 'sanctions.lists';

/** Facts whose value says whether the company is still going. Who says it, in words. */
export const STATUS_FACTS: Readonly<Record<string, string>> = {
  'registry.uk.companies_house.status': 'Companies House',
  'registry.ng.cac.status': 'The Corporate Affairs Commission record',
  'registry.us.delaware_vendor.vendor_status': 'Our licensed data provider',
};

/** Facts that hold people's names. Only the key is stored for these, never the value. */
export const PERSONAL_FACT = /\.(officers|pscs|shareholders|registered_agent|contributor_logins)$/;

export interface FindingState {
  ruleKey: string;
  outcome: string;
  severity: string;
  headline: string;
}

export interface BeforeSnapshot {
  previousScanId: string | null;
  scoreBefore: number | null;
  findings: FindingState[];
  facts: Map<string, FactValue>;
  deadlines: Set<string>;
  /** The newest answer from each source before this scan. */
  sources: Map<string, string>;
}

export interface FactChange {
  key: string;
  /** Left out for facts that hold people's names. */
  before?: FactValue | null;
  after?: FactValue | null;
}

export interface ResultDiff {
  factsChanged: FactChange[];
  findingsNew: FindingState[];
  findingsResolved: FindingState[];
  scoreBefore: number | null;
  scoreAfter: number | null;
  deadlinesNew: { ruleKey: string; dueOn: string; title: string }[];
  notChecked: string[];
  /** A sanctions match that wasn't there before: exact (status found) or possible (ambiguous). */
  sanctionsNewMatch: 'exact' | 'possible' | null;
  statusChanges: { key: string; who: string; before: string; after: string }[];
}

export type MeaningfulReason = 'new_urgent_finding' | 'status_change' | 'sanctions_match' | 'score_drop';

const same = (a: FactValue | undefined, b: FactValue | undefined) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export interface DiffInput {
  before: BeforeSnapshot;
  factsAfter: Map<string, FactValue>;
  findingsAfter: FindingState[];
  scoreAfter: number | null;
  deadlinesAfter: { ruleKey: string; dueOn: string; title: string }[];
  /** The newest answer from each source after this scan. */
  sourcesAfter: Map<string, string>;
}

/** What changed. Pure, so the rules can be tested without a database. */
export function diffResults(input: DiffInput): ResultDiff {
  const { before } = input;
  const keys = new Set([...before.facts.keys(), ...input.factsAfter.keys()]);
  const factsChanged: FactChange[] = [];
  const statusChanges: ResultDiff['statusChanges'] = [];
  for (const key of [...keys].sort()) {
    const was = before.facts.get(key);
    const now = input.factsAfter.get(key);
    if (same(was, now)) continue;
    factsChanged.push(PERSONAL_FACT.test(key) ? { key } : { key, before: was ?? null, after: now ?? null });
    const who = STATUS_FACTS[key];
    // A status that appears or disappears is a source answering or not, not a change of status.
    if (who && typeof was === 'string' && typeof now === 'string') statusChanges.push({ key, who, before: was, after: now });
  }

  const previous = new Map(before.findings.map((item) => [item.ruleKey, item]));
  const current = new Map(input.findingsAfter.map((item) => [item.ruleKey, item]));
  // New: a problem now that wasn't one before. A rule that was "to check" and is now a gap is new to the person.
  const findingsNew = input.findingsAfter.filter((item) => PROBLEM.has(item.outcome) && !PROBLEM.has(previous.get(item.ruleKey)?.outcome ?? ''));
  // Resolved: a problem before that now passes. "To check" now is not resolved: we just couldn't look.
  const findingsResolved = before.findings.filter((item) => PROBLEM.has(item.outcome) && SETTLED.has(current.get(item.ruleKey)?.outcome ?? ''));

  const deadlinesNew = input.deadlinesAfter.filter((item) => !before.deadlines.has(`${item.ruleKey}|${item.dueOn}`));
  const notChecked = [...input.sourcesAfter.entries()].filter(([, status]) => isDown(status)).map(([id]) => id).sort();

  const flagged = (status: string | undefined) => status === 'found' || status === 'ambiguous';
  const sanctionsNow = input.sourcesAfter.get(SANCTIONS);
  const sanctionsNewMatch = flagged(sanctionsNow) && !flagged(before.sources.get(SANCTIONS)) ? (sanctionsNow === 'found' ? 'exact' : 'possible') : null;

  return {
    factsChanged,
    findingsNew,
    findingsResolved,
    scoreBefore: before.scoreBefore,
    scoreAfter: input.scoreAfter,
    deadlinesNew,
    notChecked,
    sanctionsNewMatch,
    statusChanges,
  };
}

/**
 * Whether to tell people, and why. Only these count: a new urgent or important issue, a change
 * in the company's status, a new possible sanctions match, or a score drop of 5 or more that
 * comes with at least one new issue. A score that moves only because checks couldn't be made
 * this time is not a change worth a notification.
 */
export function meaningfulReasons(diff: ResultDiff): MeaningfulReason[] {
  const reasons: MeaningfulReason[] = [];
  if (diff.findingsNew.some((item) => URGENT.has(item.severity))) reasons.push('new_urgent_finding');
  if (diff.statusChanges.length > 0) reasons.push('status_change');
  if (diff.sanctionsNewMatch !== null) reasons.push('sanctions_match');
  const drop = diff.scoreBefore !== null && diff.scoreAfter !== null ? diff.scoreBefore - diff.scoreAfter : 0;
  if (drop >= SCORE_DROP_POINTS && diff.findingsNew.length > 0) reasons.push('score_drop');
  return reasons;
}

/** Plain words: what changed and what to do. Never a problem the sources didn't show. */
export function monitoringNotice(
  companyName: string,
  diff: ResultDiff,
  reasons: readonly MeaningfulReason[],
  exactScore: boolean,
  /** A company this team follows: the words say "its", not "your". */
  followed = false,
): { title: string; body: string } {
  const lines: string[] = [];
  const urgent = diff.findingsNew.filter((item) => URGENT.has(item.severity));
  if (reasons.includes('new_urgent_finding')) {
    const one = urgent.length === 1;
    const names = urgent.slice(0, 3).map((item) => item.headline).join('; ');
    lines.push(`${urgent.length} new urgent or important ${one ? 'issue' : 'issues'}: ${names}.`);
  }
  if (reasons.includes('status_change')) {
    for (const change of diff.statusChanges) lines.push(`${change.who} now shows the company status as "${change.after}". It was "${change.before}".`);
  }
  if (reasons.includes('sanctions_match')) {
    const how = diff.sanctionsNewMatch === 'exact' ? 'matches' : 'is close to';
    lines.push(`The company name ${how} an entry on a sanctions list. It may be another business with the same name, so a person needs to check it.`);
  }
  if (reasons.includes('score_drop') && exactScore && diff.scoreBefore !== null && diff.scoreAfter !== null) {
    lines.push(`${followed ? 'Its' : 'Your'} score went down from ${Math.round(diff.scoreBefore)} to ${Math.round(diff.scoreAfter)}.`);
  }
  if (diff.notChecked.length > 0) {
    const one = diff.notChecked.length === 1;
    lines.push(`${diff.notChecked.length} ${one ? "source couldn't" : "sources couldn't"} be checked this time. That isn't counted as a change.`);
  }
  lines.push(`Open ${companyName} to see what changed and what to do next.`);

  let title = `We re-checked ${companyName} and found changes`;
  if (reasons.length === 1) {
    if (reasons[0] === 'new_urgent_finding') title = `New ${urgent.length === 1 ? 'issue' : 'issues'} to look at for ${companyName}`;
    else if (reasons[0] === 'status_change') title = `${companyName}'s status has changed`;
    else if (reasons[0] === 'sanctions_match') title = `A possible sanctions match for ${companyName} needs checking`;
    else if (reasons[0] === 'score_drop') title = `${companyName}'s score went down`;
  }
  return { title, body: lines.join(' ') };
}

async function connectorFacts(tx: Tx, companyId: string): Promise<Map<string, FactValue>> {
  const rows = await tx
    .select({ key: schema.fact.key, value: schema.fact.value })
    .from(schema.fact)
    .where(and(eq(schema.fact.companyId, companyId), eq(schema.fact.origin, 'connector')));
  return new Map(rows.map((row) => [row.key, row.value as FactValue]));
}

async function latestSourceStatuses(tx: Tx, companyId: string, excludingScanId?: string): Promise<Map<string, string>> {
  const rows = await tx
    .selectDistinctOn([schema.sourceResult.connectorId], { connectorId: schema.sourceResult.connectorId, status: schema.sourceResult.status })
    .from(schema.sourceResult)
    .where(excludingScanId ? and(eq(schema.sourceResult.companyId, companyId), ne(schema.sourceResult.scanId, excludingScanId)) : eq(schema.sourceResult.companyId, companyId))
    .orderBy(schema.sourceResult.connectorId, desc(schema.sourceResult.retrievedAt), desc(schema.sourceResult.createdAt));
  return new Map(rows.map((row) => [row.connectorId, row.status]));
}

function findingState(row: { ruleKey: string; outcome: string; severity: string; detail: unknown }): FindingState {
  const detail = row.detail as { headline?: unknown; title?: unknown };
  const headline = typeof detail.headline === 'string' ? detail.headline : typeof detail.title === 'string' ? detail.title : row.ruleKey;
  return { ruleKey: row.ruleKey, outcome: row.outcome, severity: row.severity, headline };
}

/** What the company looked like before this scan's result: called before anything is rewritten. */
export async function snapshotBefore(tx: Tx, companyId: string, scanId: string): Promise<BeforeSnapshot> {
  const [previous] = await tx
    .select({ id: schema.scan.id })
    .from(schema.scan)
    .where(and(eq(schema.scan.companyId, companyId), isNotNull(schema.scan.finalisedSeq), ne(schema.scan.id, scanId)))
    .orderBy(desc(schema.scan.finalisedSeq))
    .limit(1);
  const findings = previous
    ? await tx
        .select({ ruleKey: schema.finding.ruleKey, outcome: schema.finding.outcome, severity: schema.finding.severity, detail: schema.finding.detail })
        .from(schema.finding)
        .where(eq(schema.finding.scanId, previous.id))
    : [];
  const [snapshot] = previous
    ? await tx.select({ overall: schema.scoreSnapshot.overall }).from(schema.scoreSnapshot).where(eq(schema.scoreSnapshot.scanId, previous.id))
    : [];
  const deadlines = await tx
    .select({ ruleKey: schema.deadline.ruleKey, dueOn: schema.deadline.dueOn })
    .from(schema.deadline)
    .where(eq(schema.deadline.companyId, companyId));
  return {
    previousScanId: previous?.id ?? null,
    scoreBefore: snapshot?.overall === null || snapshot?.overall === undefined ? null : Number(snapshot.overall),
    findings: findings.map(findingState),
    facts: await connectorFacts(tx, companyId),
    deadlines: new Set(deadlines.map((row) => `${row.ruleKey}|${row.dueOn}`)),
    sources: await latestSourceStatuses(tx, companyId, scanId),
  };
}

/**
 * Stores what changed, writes an audit entry, and notifies the people who run the organisation
 * (for a followed company, the follower's) only for a meaningful change. Runs in the scan's result transaction, after the result is written.
 */
export async function recordMonitoringChanges(
  tx: Tx,
  context: {
    organisationId: string;
    scanId: string;
    company: { id: string; legalName: string };
    before: BeforeSnapshot;
    findingsAfter: FindingState[];
    scoreAfter: number | null;
    exactScore: boolean;
  },
): Promise<{ diff: ResultDiff; reasons: MeaningfulReason[] }> {
  const deadlines = await tx
    .select({ ruleKey: schema.deadline.ruleKey, dueOn: schema.deadline.dueOn, title: schema.deadline.title })
    .from(schema.deadline)
    .where(eq(schema.deadline.companyId, context.company.id));
  const diff = diffResults({
    before: context.before,
    factsAfter: await connectorFacts(tx, context.company.id),
    findingsAfter: context.findingsAfter,
    scoreAfter: context.scoreAfter,
    deadlinesAfter: deadlines.flatMap((row) => (row.ruleKey ? [{ ruleKey: row.ruleKey, dueOn: row.dueOn, title: row.title }] : [])),
    sourcesAfter: await latestSourceStatuses(tx, context.company.id),
  });
  const reasons = meaningfulReasons(diff);
  const notify = reasons.length > 0;

  await tx
    .insert(schema.monitoringChange)
    .values({
      organisationId: context.organisationId,
      companyId: context.company.id,
      scanId: context.scanId,
      previousScanId: context.before.previousScanId,
      factsChanged: diff.factsChanged,
      findingsNew: diff.findingsNew.map(({ ruleKey, severity, outcome }) => ({ ruleKey, severity, outcome })),
      findingsResolved: diff.findingsResolved.map(({ ruleKey, severity, outcome }) => ({ ruleKey, severity, outcome })),
      scoreBefore: diff.scoreBefore === null ? null : String(diff.scoreBefore),
      scoreAfter: diff.scoreAfter === null ? null : String(diff.scoreAfter),
      deadlinesNew: diff.deadlinesNew.map(({ ruleKey, dueOn }) => ({ ruleKey, dueOn })),
      notChecked: diff.notChecked,
      meaningful: reasons,
      notified: notify,
    })
    .onConflictDoNothing();

  if (notify) {
    // A followed company's alert goes to the follower's own people, in words that fit.
    const [held] = await tx.select({ relationship: schema.company.relationship }).from(schema.company).where(eq(schema.company.id, context.company.id));
    const notice = monitoringNotice(context.company.legalName, diff, reasons, context.exactScore, held?.relationship === 'follow');
    await notifyOrganisation(tx, context.organisationId, {
      kind: 'score',
      title: notice.title,
      body: notice.body,
      link: `/companies/${context.company.id}`,
      dedupeKey: `monitoring:${context.scanId}`,
    });
  }

  await writeAudit(tx, {
    organisationId: context.organisationId,
    action: 'monitoring.changes_recorded',
    target: context.scanId,
    metadata: {
      companyId: context.company.id,
      factsChanged: diff.factsChanged.length,
      findingsNew: diff.findingsNew.length,
      findingsResolved: diff.findingsResolved.length,
      deadlinesNew: diff.deadlinesNew.length,
      notChecked: diff.notChecked,
      meaningful: reasons,
      notified: notify,
    },
  });
  return { diff, reasons };
}

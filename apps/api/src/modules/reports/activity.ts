import type { IssueActivity } from '@vero/shared';
import { and, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import { slotsFor, type CompanyRow } from '../scans/facts';

const { scan, finding, auditLog, document, vaultSlot } = schema;

/** The newest this many scans are read. A long-running company's oldest entries drop off first. */
const SCANS_READ = 200;

export interface ScanState {
  scanId: string;
  at: Date;
  open: boolean;
}

/**
 * Opened, cleared, reopened: read from how one rule stood in each finished scan, oldest first.
 * Only a scored gap or defect is "open". A scan that didn't hold the rule says nothing about it,
 * so it neither opens nor clears. The first open scan is "opened", later ones after a clear are "reopened".
 */
export function transitions(states: readonly ScanState[]): IssueActivity[] {
  const events: IssueActivity[] = [];
  let was: boolean | null = null;
  let everOpen = false;
  for (const state of states) {
    if (state.open && was !== true) {
      events.push({
        kind: everOpen ? 'reopened' : 'opened',
        at: state.at.toISOString(),
        text: everOpen ? 'It came up again in a check.' : 'First found in a check.',
        scanId: state.scanId,
      });
      everOpen = true;
    } else if (!state.open && was === true) {
      events.push({ kind: 'cleared', at: state.at.toISOString(), text: 'A check found it in good order, or no longer needed.', scanId: state.scanId });
    }
    was = state.open;
  }
  return events;
}

/** When this issue's newest result was worked out, and what has happened to it. Everything here is stored, none of it guessed. */
export async function issueHistory(tx: Tx, company: CompanyRow, ruleKey: string): Promise<{ lastCheckedAt: string | null; activity: IssueActivity[] }> {
  const rows = await tx
    .select({ scanId: scan.id, at: scan.completedAt, createdAt: scan.createdAt, outcome: finding.outcome, scored: finding.scored })
    .from(finding)
    .innerJoin(scan, eq(scan.id, finding.scanId))
    .where(and(eq(scan.companyId, company.id), eq(finding.ruleKey, ruleKey), isNotNull(scan.finalisedSeq)))
    .orderBy(desc(scan.finalisedSeq))
    .limit(SCANS_READ);
  const states: ScanState[] = rows
    .reverse()
    .map((row) => ({ scanId: row.scanId, at: row.at ?? row.createdAt, open: row.scored && (row.outcome === 'gap' || row.outcome === 'defect') }));
  const newest = rows.length > 0 ? rows[rows.length - 1] : undefined;
  const events = transitions(states);

  // The team's own statements, from the audit trail.
  const statements = await tx
    .select({ action: auditLog.action, at: auditLog.createdAt })
    .from(auditLog)
    .where(
      and(
        inArray(auditLog.action, ['document.declared_missing', 'document.undeclared_missing']),
        eq(auditLog.target, company.id),
        sql`${auditLog.metadata}->>'ruleKey' = ${ruleKey}`,
      ),
    )
    .orderBy(desc(auditLog.createdAt))
    .limit(SCANS_READ);
  for (const row of statements) {
    events.push(
      row.action === 'document.declared_missing'
        ? { kind: 'declared_missing', at: row.at.toISOString(), text: 'The team said it does not have this document.', scanId: null }
        : { kind: 'declaration_withdrawn', at: row.at.toISOString(), text: 'The team took back its "we don\'t have this" statement.', scanId: null },
    );
  }

  // Documents filed into a slot that can clear this rule.
  const slotKeys = (await slotsFor(tx, company)).filter((slot) => slot.rule_ids.includes(ruleKey)).map((slot) => slot.id);
  if (slotKeys.length > 0) {
    const filed = await tx
      .select({ at: document.createdAt, label: vaultSlot.title })
      .from(document)
      .innerJoin(vaultSlot, eq(vaultSlot.id, document.slotId))
      .where(and(eq(document.companyId, company.id), eq(document.status, 'filed'), inArray(vaultSlot.key, slotKeys)))
      .orderBy(desc(document.createdAt))
      .limit(SCANS_READ);
    for (const row of filed) events.push({ kind: 'document_added', at: row.at.toISOString(), text: `A document was added for "${row.label}".`, scanId: null });
  }

  events.sort((a, b) => b.at.localeCompare(a.at));
  return { lastCheckedAt: newest ? (newest.at ?? newest.createdAt).toISOString() : null, activity: events };
}

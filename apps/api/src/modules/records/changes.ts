import type { FactValue } from '@vero/rules';
import { and, desc, eq, inArray, like, notInArray } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import { PERSONAL_FACT, STATUS_FACTS } from '../monitoring/changes';

/**
 * Registry change history (migration 0025). Every scan result compares the register facts held
 * before it with the ones held after, and keeps each difference: field, old, new, when, source.
 *
 * What is never a change:
 * - a first answer from a source (there was nothing to differ from);
 * - a source that couldn't be checked, or answered "not found" (its facts aren't replaced, or
 *   are gone, and "not found" is never proof of absence);
 * - anything that isn't a register fact (answers, documents, the website scan).
 * A fact that holds people's names keeps only its key, as monitoring_change does.
 */

const { fact, registryChange, monitoringChange } = schema;

export interface HeldFact {
  key: string;
  value: FactValue;
  source: string;
  sourceName: string | null;
  isFixture: boolean;
}

export interface RegistryDifference {
  field: string;
  oldValue: FactValue | null;
  newValue: FactValue | null;
  detailWithheld: boolean;
  source: string;
  sourceName: string | null;
  isFixture: boolean;
}

/** The register facts held for a company right now, as the sources gave them. */
export async function heldRegistryFacts(tx: Tx, companyId: string): Promise<HeldFact[]> {
  const rows = await tx
    .select({ key: fact.key, value: fact.value, source: fact.source, sourceName: fact.sourceName, isFixture: fact.isFixture })
    .from(fact)
    .where(and(eq(fact.companyId, companyId), eq(fact.origin, 'connector'), like(fact.key, 'registry.%')));
  return rows.map((row) => ({ ...row, value: row.value as FactValue }));
}

const same = (a: FactValue | undefined, b: FactValue | undefined) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** What differs between two sets of register facts. Pure, so the rules can be tested without a database. */
export function registryDifferences(before: readonly HeldFact[], after: readonly HeldFact[]): RegistryDifference[] {
  const was = new Map(before.map((item) => [item.key, item]));
  const now = new Map(after.map((item) => [item.key, item]));
  // Only a source that answered both times can show a change.
  const answeredBefore = new Set(before.map((item) => item.source));
  const answeredNow = new Set(after.map((item) => item.source));
  const differences: RegistryDifference[] = [];
  for (const key of [...new Set([...was.keys(), ...now.keys()])].sort()) {
    const old = was.get(key);
    const current = now.get(key);
    if (same(old?.value, current?.value)) continue;
    const from = current ?? old;
    if (!from || !answeredBefore.has(from.source) || !answeredNow.has(from.source)) continue;
    const personal = PERSONAL_FACT.test(key);
    differences.push({
      field: key,
      oldValue: personal ? null : (old?.value ?? null),
      newValue: personal ? null : (current?.value ?? null),
      detailWithheld: personal,
      source: from.source,
      sourceName: from.sourceName,
      isFixture: from.isFixture,
    });
  }
  return differences;
}

/** A change in the company's own status on its register: both values known, and different. */
export function statusChangesIn(differences: readonly RegistryDifference[]): { who: string; before: string; after: string }[] {
  return differences.flatMap((item) => {
    const who = STATUS_FACTS[item.field];
    return who && typeof item.oldValue === 'string' && typeof item.newValue === 'string' ? [{ who, before: item.oldValue, after: item.newValue }] : [];
  });
}

/**
 * Stores what a scan changed on the register. Runs in the scan's result transaction, after the
 * new facts are written. `before` must have been read in the same transaction, before they were.
 */
export async function recordRegistryChanges(
  tx: Tx,
  context: { organisationId: string; companyId: string; scanId: string; before: readonly HeldFact[]; now: Date },
): Promise<RegistryDifference[]> {
  const differences = registryDifferences(context.before, await heldRegistryFacts(tx, context.companyId));
  if (differences.length === 0) return differences;
  await tx
    .insert(registryChange)
    .values(
      differences.map((item) => ({
        organisationId: context.organisationId,
        companyId: context.companyId,
        scanId: context.scanId,
        field: item.field,
        oldValue: item.oldValue,
        newValue: item.newValue,
        detailWithheld: item.detailWithheld,
        source: item.source,
        sourceName: item.sourceName,
        isFixture: item.isFixture,
        changedAt: context.now,
      })),
    )
    .onConflictDoNothing();
  return differences;
}

export interface StoredRegistryChange {
  id: string;
  scanId: string;
  field: string;
  oldValue: FactValue | null;
  newValue: FactValue | null;
  detailWithheld: boolean;
  source: string | null;
  sourceName: string | null;
  isFixture: boolean;
  changedAt: Date;
}

export const REGISTRY_CHANGE_LIMIT = 200;

/**
 * A company's register changes, newest first. Monitoring re-scans from before this table existed
 * kept their fact changes in monitoring_change, so those are read too: the same real data, with
 * no source name because none was kept.
 */
export async function registryChangeHistory(tx: Tx, companyId: string): Promise<StoredRegistryChange[]> {
  const rows = await tx
    .select()
    .from(registryChange)
    .where(eq(registryChange.companyId, companyId))
    .orderBy(desc(registryChange.changedAt), registryChange.field)
    .limit(REGISTRY_CHANGE_LIMIT);
  const stored: StoredRegistryChange[] = rows.map((row) => ({
    id: row.id,
    scanId: row.scanId,
    field: row.field,
    oldValue: (row.oldValue as FactValue | null) ?? null,
    newValue: (row.newValue as FactValue | null) ?? null,
    detailWithheld: row.detailWithheld,
    source: row.source,
    sourceName: row.sourceName,
    isFixture: row.isFixture,
    changedAt: row.changedAt,
  }));

  const covered = await tx.selectDistinct({ scanId: registryChange.scanId }).from(registryChange).where(eq(registryChange.companyId, companyId));
  const coveredIds = covered.map((row) => row.scanId);
  const older = await tx
    .select({ id: monitoringChange.id, scanId: monitoringChange.scanId, factsChanged: monitoringChange.factsChanged, createdAt: monitoringChange.createdAt })
    .from(monitoringChange)
    .where(and(eq(monitoringChange.companyId, companyId), coveredIds.length > 0 ? notInArray(monitoringChange.scanId, coveredIds) : undefined))
    .orderBy(desc(monitoringChange.createdAt))
    .limit(REGISTRY_CHANGE_LIMIT);
  const olderScans = older.map((row) => row.scanId);
  // Whether those scans' answers were fixture data, so sample data still says so.
  const fixtures = olderScans.length === 0 ? [] : await tx
    .selectDistinct({ scanId: schema.sourceResult.scanId })
    .from(schema.sourceResult)
    .where(and(inArray(schema.sourceResult.scanId, olderScans), eq(schema.sourceResult.isFixture, true)));
  const fixtureScans = new Set(fixtures.map((row) => row.scanId));
  for (const row of older) {
    for (const item of row.factsChanged as { key?: unknown; before?: FactValue | null; after?: FactValue | null }[]) {
      if (typeof item.key !== 'string' || !item.key.startsWith('registry.')) continue;
      const withheld = !('before' in item) && !('after' in item);
      // The old rows also list a fact appearing or going, which is a source answering or not: not a change.
      if (!withheld && (item.before === null || item.before === undefined || item.after === null || item.after === undefined)) continue;
      stored.push({
        id: `${row.id}:${item.key}`,
        scanId: row.scanId,
        field: item.key,
        oldValue: withheld ? null : (item.before ?? null),
        newValue: withheld ? null : (item.after ?? null),
        detailWithheld: withheld,
        source: null,
        sourceName: null,
        isFixture: fixtureScans.has(row.scanId),
        changedAt: row.createdAt,
      });
    }
  }
  return stored.sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime() || a.field.localeCompare(b.field)).slice(0, REGISTRY_CHANGE_LIMIT);
}

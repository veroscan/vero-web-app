import { createHash } from 'node:crypto';
import { ANY_JURISDICTION, deriveFrenchVatNumber, euTrademarkNumbers, type Connector, type SourceResult } from '@vero/connectors';
import {
  attachDeadlines,
  trademarkSerials,
  type Answers,
  computeDeadlines,
  DERIVED_INPUTS,
  vaultSlotsForPacks,
  freePlanRange,
  howWeKnow,
  rankPriorities,
  runEngine,
  scoreFindings,
  type DeadlineResult,
  type Fact,
  type Finding,
  type Outcome,
  type PackSelection,
  type SourceState,
  statusWord,
} from '@vero/rules';
import { PLAN_ENTITLEMENTS } from '@vero/shared';
import { and, desc, eq, inArray, isNotNull, lte, sql } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { writeAudit } from '../audit/service';
import { recordMonitoringChanges, snapshotBefore } from '../monitoring/changes';
import { snapshotView } from '../monitoring/summary';
import { emailWanted, notifyOrganisation, sendNoticeEmails, type NoticeEmail } from '../notifications/service';
import { planOf } from '../plans/service';
import { heldRegistryFacts, recordRegistryChanges, statusChangesIn } from '../records/changes';
import {
  applySourceFacts,
  connectorsForSelection,
  coversCountry,
  incorporatedOn,
  isDown,
  latestSources,
  loadAnswers,
  loadDeclaredMissing,
  loadEngineFacts,
  rebuildAnswerFacts,
  rebuildVaultFacts,
  requireCompany,
  SAMPLE_NOTE,
  selectCompanyPacks,
  sourceStates,
  stageOf,
  type CompanyRow,
  type SourceRow,
} from './facts';

const { scan, sourceResult, finding, scoreSnapshot, actionItem, deadline, companySweep, connectorHealth, vendorRecord } = schema;

const MAX_ATTEMPTS = 5;
const MAX_RETRY_MINUTES = 24 * 60;

export type ScanRow = typeof scan.$inferSelect;

/** What's kept on each finding, beyond its indexed columns. Holds no fact values. */
export interface FindingDetail {
  jurisdiction: string;
  /** Why this applies: where the company is incorporated, or a market it has users or operates in. */
  applies_because: 'incorporated' | 'market';
  area: string;
  title: string;
  headline: string;
  confidence: string;
  reason: string | null;
  /**
   * The source's own plain words behind a source reason, such as "We need your VAT number to
   * check this". Missing on findings written before this existed.
   */
  reason_detail?: string | null;
  remediation: { action_type: string; quick_order?: string };
  instruments: { law: string; cite?: string }[];
  regulator: string | null;
  evidence: string[];
  facts_used: { key: string; how_we_know: string | null; known: boolean }[];
  cost_of_delay?: { penalty: 'none' | 'moderate' | 'severe'; fundraising_relevant: boolean };
  due_on: string | null;
  rule_status: string;
  review_note: string | null;
  reviewed_at: string | null;
  /** Decided by a document alone, so "we don't have this" can be said about it. */
  document_rule: boolean;
  declared_missing: boolean;
}

// ---- Starting ----

async function markInFlight(deps: AppDeps, company: { id: string; organisationId: string }, scanId: string): Promise<void> {
  const until = new Date(deps.now().getTime() + deps.config.scanLeaseSeconds * 1000);
  await deps.db.withSystem((tx) =>
    tx
      .insert(companySweep)
      .values({ companyId: company.id, tenantId: company.organisationId, scanInFlightId: scanId, scanInFlightUntil: until })
      .onConflictDoUpdate({ target: companySweep.companyId, set: { scanInFlightId: scanId, scanInFlightUntil: until } }),
  );
}

/** Starts a full scan. If one is already moving for this company, that one comes back instead. */
export async function startFullScan(
  deps: AppDeps,
  organisationId: string,
  companyId: string,
  options: { trigger: string; requestedBy?: string | null },
): Promise<string> {
  const { scanId, isNew, company } = await deps.db.withOrg(organisationId, async (tx) => {
    const row = await requireCompany(tx, companyId);
    const selected = connectorsForSelection(deps.connectors, row, await selectCompanyPacks(tx, row)).map((connector) => connector.id);
    const [created] = await tx
      .insert(scan)
      .values({
        organisationId,
        companyId,
        kind: 'full',
        trigger: options.trigger,
        connectors: selected,
        requestedBy: options.requestedBy ?? null,
        type: 'self',
      })
      .onConflictDoNothing()
      .returning({ id: scan.id });
    if (created) return { scanId: created.id, isNew: true, company: row };
    const [active] = await tx
      .select({ id: scan.id })
      .from(scan)
      .where(and(eq(scan.companyId, companyId), eq(scan.kind, 'full'), inArray(scan.status, ['queued', 'running'])));
    if (!active) throw new Error('A scan was refused, but none is active');
    return { scanId: active.id, isNew: false, company: row };
  });
  if (isNew) {
    await markInFlight(deps, company, scanId);
    await deps.queue.enqueue('scan.run', { organisationId, scanId });
  }
  return scanId;
}

/**
 * Stops a full scan that is queued or running. Marked cancelled at once; a running one stops at its next
 * step (see `wasCancelled`), and finalising refuses anything that isn't running, so no findings or
 * score are ever written for it. Asking again for a scan already cancelled changes nothing.
 */
export async function cancelScan(deps: AppDeps, organisationId: string, scanId: string): Promise<{ row: ScanRow; changed: boolean }> {
  const outcome = await deps.db.withOrg(organisationId, async (tx) => {
    const [row] = await tx.select().from(scan).where(eq(scan.id, scanId)).for('update');
    if (!row) throw errors.notFound('That scan');
    if (row.status === 'cancelled') return { row, changed: false };
    if (row.kind !== 'full') throw errors.invalidState("A re-score can't be cancelled. It only re-reads what we already have, and finishes in moments.");
    if (row.status !== 'queued' && row.status !== 'running') throw errors.invalidState('That scan has already finished, so there is nothing to cancel.');
    const now = deps.now();
    const [stopped] = await tx
      .update(scan)
      .set({ status: 'cancelled', cancelledAt: now, completedAt: now, leaseUntil: null })
      .where(eq(scan.id, row.id))
      .returning();
    if (!stopped) throw errors.internal();
    return { row: stopped, changed: true };
  });
  if (outcome.changed) {
    await deps.db.withSystem((tx) =>
      tx
        .update(companySweep)
        .set({ scanInFlightId: null, scanInFlightUntil: null })
        .where(and(eq(companySweep.companyId, outcome.row.companyId), eq(companySweep.scanInFlightId, outcome.row.id))),
    );
  }
  return outcome;
}

/** Read fresh each time, so a cancel from another request takes effect at the next step. */
async function wasCancelled(deps: AppDeps, row: ScanRow): Promise<boolean> {
  const [current] = await deps.db.withOrg(row.organisationId, (tx) => tx.select({ status: scan.status }).from(scan).where(eq(scan.id, row.id)));
  return current?.status === 'cancelled';
}

/**
 * Asks for a new score after answers, documents, source data or a review verdict changed.
 * No connector runs. Nothing happens until a first scan exists, and several changes in a row
 * share one waiting re-score, which reads the facts as they are when it runs.
 */
export async function requestRescore(deps: AppDeps, organisationId: string, companyId: string, trigger: string): Promise<boolean> {
  const scanId = await deps.db.withOrg(organisationId, async (tx) => {
    const [first] = await tx
      .select({ id: scan.id })
      .from(scan)
      .where(and(eq(scan.companyId, companyId), isNotNull(scan.finalisedSeq)))
      .limit(1);
    if (!first) return null;
    const [created] = await tx
      .insert(scan)
      .values({ organisationId, companyId, kind: 'rescore', trigger, type: 'self' })
      .onConflictDoNothing()
      .returning({ id: scan.id });
    return created?.id ?? null;
  });
  if (!scanId) return false;
  await markInFlight(deps, { id: companyId, organisationId }, scanId);
  await deps.queue.enqueue('scan.run', { organisationId, scanId });
  return true;
}

// ---- Running ----

function timedOut(connector: Connector, now: Date, message: string): SourceResult {
  return {
    connector: connector.id,
    status: 'error',
    facts: [],
    provenance: { sourceUrl: '', retrievedAt: now.toISOString(), rawHash: '', sourceName: connector.sourceName, method: 'official_live' },
    matchConfidence: 0,
    message,
  };
}

/** A source that hangs or breaks is that source's problem. The others carry on. */
export async function lookupSafely(deps: AppDeps, connector: Connector, ref: Parameters<Connector['lookup']>[0]): Promise<SourceResult> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<SourceResult>((resolve) => {
    timer = setTimeout(
      () => resolve(timedOut(connector, deps.now(), `${connector.sourceName} took too long to answer.`)),
      deps.config.connectorTimeoutMs,
    );
    timer.unref();
  });
  try {
    return await Promise.race([connector.lookup(ref), timeout]);
  } catch {
    return timedOut(connector, deps.now(), `We couldn't check ${connector.sourceName} just now.`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sources that can only be searched by an identifier: one another source finds (the registered
 * office postcode from Companies House, a CIK from an earlier SEC answer) or one the company
 * gives us in its answers (VAT number, ICO number, trademark serials). They run second, once
 * the first stage has answered. Everything else runs in the first stage.
 */
export const STAGE_TWO: ReadonlySet<string> = new Set(['uk.hmrc_vat', 'uk.ico_register', 'us.uspto', 'eu.euipo', 'us.sec_form_d', 'fr.cnil_dpo', 'eu.vies_vat']);

/** Vendors that charge per lookup. Their good answers are reused for VENDOR_CACHE_DAYS. */
export const PAID_VENDORS: ReadonlySet<string> = new Set(['us.delaware_vendor', 'ng.cac_vendor']);

/** Answers whose change means a source waiting for that number can now be asked. */
export const IDENTIFIER_FIELDS: ReadonlySet<string> = new Set(['vat_number', 'ico_registration_number', 'us_trademark_serials', 'eu_trademark_numbers', 'lei']);

export interface Identifiers {
  vat_number?: string;
  postcode?: string;
  ico_reference?: string;
  cik?: string;
  trademark_serials?: string[];
  /** EU trade mark numbers the company gave us (EUIPO). */
  eu_trademark_numbers?: string[];
  /** France: the SIREN the Annuaire des Entreprises returned. */
  siren?: string;
  /**
   * France: the intra-EU VAT number worked out from the SIREN (FR + key + SIREN) when the company
   * gave no VAT number. A candidate to put to VIES, never a fact: the company may not be
   * registered for VAT. It is not passed to anything that compares it with the company's own number.
   */
  vat_derived?: string;
  /** The Legal Entity Identifier the company gave us. */
  lei?: string;
}

interface SourceFacts {
  connectorId: string;
  status: string;
  facts: unknown;
}

function factValue(sources: readonly SourceFacts[], connectorId: string, key: string): string | undefined {
  for (const source of sources) {
    if (source.connectorId !== connectorId || source.status !== 'found' || !Array.isArray(source.facts)) continue;
    const found = (source.facts as { key: string; value: unknown }[]).find((item) => item.key === key);
    if (typeof found?.value === 'string' && found.value.trim().length > 0) return found.value.trim();
  }
  return undefined;
}

function answerText(answers: Answers, field: string): string | undefined {
  const value = answers[field];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

/**
 * What the second stage can be searched by. Nothing here is guessed: each value is either what
 * the company told us or what an official source returned for it. `sources` newest first.
 */
export function resolveIdentifiers(answers: Answers, sources: readonly SourceFacts[]): Identifiers {
  const out: Identifiers = {};
  const vat = answerText(answers, 'vat_number');
  if (vat) out.vat_number = vat;
  const lei = answerText(answers, 'lei');
  if (lei) out.lei = lei.toUpperCase().replace(/\s+/g, '');
  const ico = answerText(answers, 'ico_registration_number');
  if (ico) out.ico_reference = ico.toUpperCase();
  const serials = trademarkSerials(answers['us_trademark_serials']);
  if (serials.length > 0) out.trademark_serials = serials;
  const euMarks = euTrademarkNumbers(answers['eu_trademark_numbers']);
  if (euMarks.length > 0) out.eu_trademark_numbers = euMarks;
  const postcode = factValue(sources, 'uk.companies_house', 'registry.uk.companies_house.registered_office_postcode');
  if (postcode) out.postcode = postcode;
  const cik = factValue(sources, 'us.sec_form_d', 'registry.us.sec_form_d.cik');
  if (cik) out.cik = cik;
  const siren = factValue(sources, 'fr.recherche_entreprises', 'registry.fr.recherche_entreprises.siren');
  if (siren) out.siren = siren;
  // Derived only when the company gave no VAT number, and only from a SIREN an official source returned.
  const derived = !out.vat_number && siren ? deriveFrenchVatNumber(siren) : null;
  if (derived) out.vat_derived = derived;
  return out;
}

/**
 * The field a country's own company number goes in. Every other country uses `registry_number`
 * (docs/GLOBAL-COVERAGE.md), so a new country's register needs nothing here.
 */
const NUMBER_FIELD: Readonly<Record<string, 'company_number' | 'rc_number' | 'file_number' | 'siren'>> = {
  GB: 'company_number',
  NG: 'rc_number',
  'US-DE': 'file_number',
  FR: 'siren',
};

export function numberFieldFor(country: string): 'company_number' | 'rc_number' | 'file_number' | 'siren' | 'registry_number' {
  return NUMBER_FIELD[country] ?? 'registry_number';
}

/** The French VAT candidate: from the SIREN the company holds, or else the one the directory returned. */
function derivedVat(company: CompanyRow, ids: Identifiers): string | undefined {
  return deriveFrenchVatNumber(company.registrationNumber ?? undefined) ?? ids.vat_derived ?? undefined;
}

/**
 * How to ask one source about this company. A source covering the company's country (its own
 * register, or a global source) gets the company's number; a register abroad gets the name,
 * never a local number. Identifiers go only to the sources that read them: the VAT number to
 * tax registers, the LEI to global sources.
 */
export function companyRef(
  company: CompanyRow,
  website: string | null,
  connector: Connector,
  extra: { identifiers?: Identifiers; vendorBusinessId?: string | null } = {},
): Parameters<Connector['lookup']>[0] {
  const home = coversCountry(connector, company.incorporationCountry);
  const jurisdiction = home ? company.incorporationCountry : (connector.jurisdictions.find((code) => code !== ANY_JURISDICTION) ?? company.incorporationCountry);
  const number = home ? (company.registrationNumber ?? undefined) : undefined;
  const ids = extra.identifiers ?? {};
  const only = (connectorId: string, value: object) => (connector.id === connectorId ? value : {});
  const taxRegister = connector.id === 'uk.hmrc_vat' || connector.capabilities.includes('tax_registration');
  // The website scan compares the numbers a site shows with the company's own, VAT number included.
  const readsVat = taxRegister || connector.id === 'web.policy_scan';
  const global = connector.jurisdictions.includes(ANY_JURISDICTION);
  return {
    name: company.legalName,
    jurisdiction,
    ...(number ? { [numberFieldFor(jurisdiction)]: number } : {}),
    ...(website ? { website_url: website } : {}),
    ...(ids.vat_number && readsVat ? { vat_number: ids.vat_number } : {}),
    // A French company that gave no VAT number: VIES is asked about the number worked out from its SIREN.
    ...(!ids.vat_number && connector.id === 'eu.vies_vat' && company.incorporationCountry === 'FR' && derivedVat(company, ids) ? { vat_number: derivedVat(company, ids), vat_number_derived: true } : {}),
    ...(ids.lei && global ? { lei: ids.lei } : {}),
    // A postcode from Companies House is only this company's when it is registered there.
    ...(ids.postcode && company.incorporationCountry === 'GB' ? only('uk.ico_register', { postcode: ids.postcode }) : {}),
    ...(ids.ico_reference ? only('uk.ico_register', { ico_reference: ids.ico_reference }) : {}),
    ...(ids.trademark_serials ? only('us.uspto', { trademark_serials: ids.trademark_serials }) : {}),
    ...(ids.eu_trademark_numbers ? only('eu.euipo', { eu_trademark_numbers: ids.eu_trademark_numbers }) : {}),
    ...(ids.cik ? only('us.sec_form_d', { cik: ids.cik }) : {}),
    // A SIREN from the French directory is only this company's when it is registered in France.
    ...(ids.siren && company.incorporationCountry === 'FR' && !number ? only('fr.cnil_dpo', { siren: ids.siren }) : {}),
    ...(extra.vendorBusinessId ? { vendor_business_id: extra.vendorBusinessId } : {}),
  };
}

export function sourceValues(result: SourceResult, connector: Connector) {
  return {
    status: result.status,
    facts: result.facts,
    sourceUrl: result.provenance.sourceUrl || null,
    retrievedAt: new Date(result.provenance.retrievedAt),
    rawHash: result.provenance.rawHash || null,
    matchConfidence: String(result.matchConfidence),
    sourceName: result.provenance.sourceName || connector.sourceName,
    evidenceMethod: result.provenance.method,
    message: result.message ?? null,
    isFixture: result.provenance.fixture === true,
    candidates: result.candidates ?? [],
  };
}

export async function recordHealth(deps: AppDeps, connectorId: string, status: string): Promise<void> {
  const now = deps.now();
  const failed = status === 'error';
  await deps.db.withSystem((tx) =>
    tx
      .insert(connectorHealth)
      .values({
        connectorId,
        lastStatus: status,
        lastCheckedAt: now,
        lastOkAt: failed ? null : now,
        lastFailureAt: failed ? now : null,
        consecutiveFailures: failed ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: connectorHealth.connectorId,
        set: {
          lastStatus: status,
          lastCheckedAt: now,
          ...(failed ? { lastFailureAt: now } : { lastOkAt: now }),
          consecutiveFailures: failed ? sql`${connectorHealth.consecutiveFailures} + 1` : 0,
        },
      }),
  );
}

async function websiteOf(tx: Tx, company: CompanyRow): Promise<string | null> {
  if (company.website) return company.website;
  const [row] = await tx
    .select({ value: schema.answer.value })
    .from(schema.answer)
    .innerJoin(schema.question, eq(schema.question.id, schema.answer.questionId))
    .where(and(eq(schema.answer.companyId, company.id), eq(schema.question.key, 'website_url')));
  return typeof row?.value === 'string' ? row.value : null;
}

// ---- Paid vendors ----

interface VendorMemory {
  vendorBusinessId: string | null;
  cached: { refHash: string; result: SourceResult } | null;
  cachedAt: Date | null;
}

/** The parts of a request that say which company this is. A change means a new lookup. */
function refHash(ref: Parameters<Connector['lookup']>[0]): string {
  const { vendor_business_id: _ignored, ...identity } = ref;
  return createHash('sha256').update(JSON.stringify(identity)).digest('hex');
}

async function vendorMemory(deps: AppDeps, organisationId: string, companyId: string, connectorId: string): Promise<VendorMemory> {
  const [found] = await deps.db.withOrg(organisationId, (tx) =>
    tx
      .select()
      .from(vendorRecord)
      .where(and(eq(vendorRecord.companyId, companyId), eq(vendorRecord.connectorId, connectorId))),
  );
  return {
    vendorBusinessId: found?.vendorBusinessId ?? null,
    cached: (found?.cachedResult as VendorMemory['cached'] | null | undefined) ?? null,
    cachedAt: found?.cachedAt ?? null,
  };
}

/** Only an answer is kept: found or not_found. An error, a wait or a question never is. */
const KEEPABLE = new Set(['found', 'not_found']);

/**
 * Asks a source, remembering what a paid vendor costs. A good vendor answer is reused for
 * VENDOR_CACHE_DAYS, unless someone asked to check again, and the vendor's own reference for
 * the company is stored so the next lookup doesn't open, and pay for, a new one.
 */
export async function lookupForCompany(
  deps: AppDeps,
  scope: { organisationId: string; companyId: string; checkAgain: boolean },
  connector: Connector,
  ref: Parameters<Connector['lookup']>[0],
): Promise<SourceResult> {
  if (!PAID_VENDORS.has(connector.id)) return lookupSafely(deps, connector, ref);
  const memory = await vendorMemory(deps, scope.organisationId, scope.companyId, connector.id);
  const hash = refHash(ref);
  const maxAgeMs = deps.config.vendorCacheDays * 86_400_000;
  const fresh = memory.cached && memory.cachedAt && memory.cached.refHash === hash && deps.now().getTime() - memory.cachedAt.getTime() < maxAgeMs;
  // The kept answer keeps its own retrieval date, so it is shown as checked then, not today.
  if (fresh && memory.cached && !scope.checkAgain) return memory.cached.result;

  const result = await lookupSafely(deps, connector, memory.vendorBusinessId ? { ...ref, vendor_business_id: memory.vendorBusinessId } : ref);
  const keep = KEEPABLE.has(result.status) && result.provenance.fixture !== true;
  const businessId = result.vendorBusinessId ?? memory.vendorBusinessId;
  if (keep || businessId !== memory.vendorBusinessId) {
    const cachedResult = keep ? { refHash: hash, result } : memory.cached;
    const cachedAt = keep ? deps.now() : memory.cachedAt;
    await deps.db.withOrg(scope.organisationId, (tx) =>
      tx
        .insert(vendorRecord)
        .values({ organisationId: scope.organisationId, companyId: scope.companyId, connectorId: connector.id, vendorBusinessId: businessId, cachedResult, cachedAt })
        .onConflictDoUpdate({
          target: [vendorRecord.organisationId, vendorRecord.companyId, vendorRecord.connectorId],
          set: { vendorBusinessId: businessId, cachedResult, cachedAt },
        }),
    );
  }
  return result;
}

/**
 * A monitoring scan never opens a new paid lookup. It reuses the vendor's kept answer while
 * it is fresh, and pays again only once that answer has expired (VENDOR_CACHE_DAYS). With no
 * kept answer for this company as it is now, the vendor isn't asked at all.
 */
export async function monitoringMayAskVendor(
  deps: AppDeps,
  scope: { organisationId: string; companyId: string },
  connector: Connector,
  ref: Parameters<Connector['lookup']>[0],
): Promise<boolean> {
  const memory = await vendorMemory(deps, scope.organisationId, scope.companyId, connector.id);
  return memory.cached !== null && memory.cached.refHash === refHash(ref);
}

// ---- Asking the sources ----

async function runSources(deps: AppDeps, row: ScanRow): Promise<void> {
  const { company, website, pending, answers } = await deps.db.withOrg(row.organisationId, async (tx) => {
    const found = await requireCompany(tx, row.companyId);
    const common = { company: found, website: await websiteOf(tx, found), answers: await loadAnswers(tx, found.id) };
    if (row.kind === 'full') {
      const rows = await tx.select({ connectorId: sourceResult.connectorId }).from(sourceResult).where(eq(sourceResult.scanId, row.id));
      const done = new Set(rows.map((item) => item.connectorId));
      // Sources already answered on an earlier attempt aren't asked again.
      return { ...common, pending: deps.connectors.filter((connector) => row.connectors.includes(connector.id) && !done.has(connector.id)) };
    }
    // A re-score asks only a source that's newly relevant, such as a new market's register.
    const known = new Set((await latestSources(tx, found.id)).map((item) => item.connectorId));
    const relevant = connectorsForSelection(deps.connectors, found, await selectCompanyPacks(tx, found));
    return { ...common, pending: relevant.filter((connector) => !known.has(connector.id)) };
  });
  const scope = { organisationId: row.organisationId, companyId: row.companyId, checkAgain: row.trigger === 'check_again' };
  const monitoring = row.trigger === 'monitoring';

  const ask = async (connector: Connector, identifiers: Identifiers): Promise<void> => {
    // A cancelled scan asks nothing more, and keeps nothing a source answers after the stop.
    if (await wasCancelled(deps, row)) return;
    const ref = companyRef(company, website, connector, { identifiers });
    if (monitoring && PAID_VENDORS.has(connector.id) && !(await monitoringMayAskVendor(deps, scope, connector, ref))) {
      // Not asked, and nothing paid: the answer from before stands, and this scan doesn't list it.
      await deps.db.withOrg(row.organisationId, (tx) =>
        tx.update(scan).set({ connectors: sql`array_remove(${scan.connectors}, ${connector.id})` }).where(eq(scan.id, row.id)),
      );
      return;
    }
    const result = await lookupForCompany(deps, scope, connector, ref);
    if (await wasCancelled(deps, row)) return;
    // Written as each source answers, so the scanning screen can show it straight away.
    await deps.db.withOrg(row.organisationId, (tx) =>
      tx
        .insert(sourceResult)
        .values({ organisationId: row.organisationId, scanId: row.id, companyId: row.companyId, connectorId: connector.id, ...sourceValues(result, connector) })
        .onConflictDoNothing(),
    );
    await recordHealth(deps, connector.id, result.status);
  };

  // Stage one: registers and lists, all at once, with only the numbers the company gave us.
  const first = pending.filter((connector) => !STAGE_TWO.has(connector.id));
  const second = pending.filter((connector) => STAGE_TWO.has(connector.id));
  const told = resolveIdentifiers(answers, []);
  await Promise.all(first.map((connector) => ask(connector, told)));
  if (second.length === 0 || (await wasCancelled(deps, row))) return;

  // Stage two: what stage one found, plus what the company told us, then all at once again.
  const identifiers = await deps.db.withOrg(row.organisationId, async (tx) => resolveIdentifiers(answers, await latestSources(tx, row.companyId)));
  await Promise.all(second.map((connector) => ask(connector, identifiers)));
}

// ---- Reviewer overlay ----

interface EvaluatedFinding extends Finding {
  review_note: string | null;
  reviewed_at: string | null;
}

// Old review-desk verdicts still count. No new ones can be made, and the words never say lawyer.
const REVIEW_WORDS = 'You uploaded this and it was reviewed';

/**
 * What a reviewer said, on the old review desk, outranks what the rules worked out. A document found wanting makes
 * the rules it supports a defect, and an override replaces the outcome for that rule.
 */
async function applyReviewerFindings(tx: Tx, company: CompanyRow, selection: PackSelection, findings: Finding[]): Promise<EvaluatedFinding[]> {
  const verdicts = await tx
    .select()
    .from(schema.reviewVerdict)
    .where(eq(schema.reviewVerdict.companyId, company.id))
    .orderBy(desc(schema.reviewVerdict.createdAt));

  const results: EvaluatedFinding[] = findings.map((item) => ({ ...item, review_note: null, reviewed_at: null }));
  if (verdicts.length === 0) return results;
  const byRule = new Map(results.map((item) => [item.rule_id, item]));

  const mark = (item: EvaluatedFinding, outcome: Outcome | null, note: string | null, at: Date): void => {
    if (outcome) {
      item.outcome = outcome;
      item.scored = outcome === 'pass' || outcome === 'gap' || outcome === 'defect';
      item.reason = null;
    }
    item.review_note = note;
    item.reviewed_at = at.toISOString();
    item.facts_used = [{ key: 'lawyer', value: undefined, known: true, how_we_know: REVIEW_WORDS }, ...item.facts_used];
  };

  // Document verdicts first: only the one on the newest filed document in each slot counts.
  const filed = await tx
    .select({ id: schema.document.id, slotKey: schema.vaultSlot.key })
    .from(schema.document)
    .innerJoin(schema.vaultSlot, eq(schema.vaultSlot.id, schema.document.slotId))
    .where(and(eq(schema.document.companyId, company.id), eq(schema.document.status, 'filed')))
    .orderBy(desc(schema.document.createdAt));
  const newestInSlot = new Map<string, string>();
  for (const doc of filed) if (!newestInSlot.has(doc.slotKey)) newestInSlot.set(doc.slotKey, doc.id);

  for (const slot of vaultSlotsForPacks(selection.packs)) {
    const documentId = newestInSlot.get(slot.id);
    if (!documentId) continue;
    const verdict = verdicts.find((item) => item.documentId === documentId && !item.ruleKey);
    if (!verdict) continue;
    for (const ruleId of slot.rule_ids) {
      const item = byRule.get(ruleId);
      if (!item) continue;
      if (verdict.verdict === 'sufficient') mark(item, null, verdict.note, verdict.createdAt);
      else if (item.outcome === 'pass') mark(item, 'defect', verdict.note, verdict.createdAt);
      else mark(item, null, verdict.note, verdict.createdAt);
    }
  }

  // Overrides last, newest wins.
  const applied = new Set<string>();
  for (const verdict of verdicts) {
    if (!verdict.ruleKey || !verdict.overrideOutcome || applied.has(verdict.ruleKey)) continue;
    applied.add(verdict.ruleKey);
    const item = byRule.get(verdict.ruleKey);
    if (item) mark(item, verdict.overrideOutcome as Outcome, verdict.note, verdict.createdAt);
  }
  return results;
}

// ---- Deadlines ----

export async function syncDeadlines(tx: Tx, company: CompanyRow, deadlines: DeadlineResult, findingIds: Map<string, string>): Promise<void> {
  const current = new Set(deadlines.dated.map((item) => `${item.rule_id}|${item.due_on}`));
  const existing = await tx
    .select({ id: deadline.id, ruleKey: deadline.ruleKey, dueOn: deadline.dueOn, status: deadline.status })
    .from(deadline)
    .where(eq(deadline.companyId, company.id));
  // A date that no longer applies goes. One the person marked as done stays on the record.
  const stale = existing.filter((row) => row.status === 'upcoming' && !current.has(`${row.ruleKey}|${row.dueOn}`)).map((row) => row.id);
  if (stale.length > 0) await tx.delete(deadline).where(inArray(deadline.id, stale));

  for (const item of deadlines.dated) {
    const values = {
      title: item.title,
      layer: item.layer,
      monitoring: item.monitoring,
      howWeTrack: item.how_we_track,
      basis: item.basis,
      needsReview: item.needs_review,
      findingId: findingIds.get(item.rule_id) ?? null,
    };
    await tx
      .insert(deadline)
      .values({ organisationId: company.organisationId, companyId: company.id, ruleKey: item.rule_id, dueOn: item.due_on, ...values })
      .onConflictDoUpdate({ target: [deadline.companyId, deadline.ruleKey, deadline.dueOn], set: values });
  }
}

// ---- Writing the result ----

/**
 * "How we know", for one fact a rule read. A worked-out fact points back to what it was worked
 * out from. Nothing is claimed from a source that's down, and a value that came from fixture
 * data says so. Something absent from the company's own evidence says that, in words.
 */
function explainFacts(
  used: Finding['facts_used'][number],
  facts: ReadonlyMap<string, Fact>,
  states: Readonly<Record<string, SourceState>>,
  fixtureKeys: ReadonlySet<string>,
  now: Date,
): FindingDetail['facts_used'] {
  const isUp = (key: string) => !Object.entries(states).some(([prefix, state]) => state !== 'ok' && (key === prefix || key.startsWith(`${prefix}.`)));
  const explain = (key: string, known: boolean, given: string | null): FindingDetail['facts_used'][number] => {
    if (!isUp(key)) return { key, known: false, how_we_know: null };
    const fact = facts.get(key);
    if (fact) {
      const words = given ?? howWeKnow(fact.provenance, now);
      return { key, known: true, how_we_know: fixtureKeys.has(key) ? `${words} ${SAMPLE_NOTE}` : words };
    }
    if (key.startsWith('vault.') || key.startsWith('attest.')) return { key, known, how_we_know: "We haven't seen this yet" };
    return { key, known, how_we_know: given };
  };
  if (used.key === 'lawyer' || used.key === 'declared_missing') return [{ key: used.key, known: true, how_we_know: used.how_we_know }];
  const inputs = used.key.startsWith('derived.') ? DERIVED_INPUTS.get(used.key) : undefined;
  if (inputs) return inputs.map((key) => explain(key, facts.has(key), null)).filter((item) => facts.has(item.key) || !isUp(item.key));
  return [explain(used.key, used.known, used.how_we_know)];
}

function actionTypeOf(item: Finding): string {
  return item.remediation.quick_order ? 'quick_order' : item.remediation.action_type;
}

function triggerWords(trigger: string): string {
  switch (trigger) {
    case 'answers':
      return 'after you changed your answers';
    case 'document':
      return 'after your documents changed';
    case 'review':
      return 'after your document was reviewed';
    case 'source_recovered':
      return 'after we reached a source again';
    case 'missing_statement':
      return "after you told us what you don't have";
    default:
      return 'after a new check';
  }
}

interface FinaliseOutcome {
  anySourceDown: boolean;
  /** Who to email, when this result is one people are waiting for. */
  mail: { to: string[]; subject: string; text: string } | null;
  /** Emails owed for notifications made with this result. Sent after it commits. */
  notices: NoticeEmail[];
}

/**
 * Words for the alert about a followed company whose score band or register status changed.
 * The band is the word people see (Healthy, Needs work, At risk), so it gives away no exact
 * number on a plan that only sees a range.
 */
export function watchlistNotice(
  companyName: string,
  band: { before: string; after: string } | null,
  statusChanges: readonly { who: string; before: string; after: string }[],
): { title: string; body: string } {
  const lines: string[] = [];
  if (band) lines.push(`${companyName} is now "${band.after}". It was "${band.before}".`);
  for (const change of statusChanges) lines.push(`${change.who} now shows the company status as "${change.after}". It was "${change.before}".`);
  lines.push(`Open ${companyName} to see what changed.`);
  const title = band && statusChanges.length > 0 ? `${companyName} has changed` : band ? `${companyName} is now ${band.after}` : `${companyName}'s status has changed`;
  return { title, body: lines.join(' ') };
}

/** The result people were told we'd email about: a scan they started, or a source coming back. */
function mailFor(row: ScanRow, company: CompanyRow, anySourceDown: boolean, webBaseUrl: string): { subject: string; text: string } | null {
  const where = `See it here: ${webBaseUrl}/`;
  if (row.trigger === 'source_recovered') {
    return { subject: `We've updated ${company.legalName}'s result`, text: `A source that was down is back, so we've updated ${company.legalName}'s result. ${where}` };
  }
  // A monitoring re-scan nobody asked for isn't emailed: its meaningful changes are notified instead.
  if (row.kind !== 'full' || row.trigger === 'seed' || row.trigger === 'monitoring') return null;
  const partly = anySourceDown ? " One source couldn't be reached, so it doesn't count for or against the result. We'll keep trying and email you when it's back." : '';
  return { subject: `Your scan of ${company.legalName} is ready`, text: `We've finished checking ${company.legalName}.${partly} ${where}` };
}

/**
 * Everything from one evaluation commits together or not at all, under a per-company lock.
 * If the process dies part way, nothing is half-written and the scan can simply run again.
 */
async function finalise(deps: AppDeps, row: ScanRow): Promise<FinaliseOutcome | null> {
  return deps.db.withOrg(row.organisationId, async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${row.companyId}, 0))`);
    const [fresh] = await tx.select().from(scan).where(eq(scan.id, row.id)).for('update');
    if (fresh?.status !== 'running') return null;

    const now = deps.now();
    const company = await requireCompany(tx, row.companyId);
    const selection = await selectCompanyPacks(tx, company);
    const relevant = connectorsForSelection(deps.connectors, company, selection);
    const relevantIds = new Set(relevant.map((connector) => connector.id));
    const sources: SourceRow[] = (await latestSources(tx, company.id)).filter((source) => relevantIds.has(source.connectorId));
    // A monitoring scan is compared with the result before it, so read that before rewriting anything.
    const before = row.trigger === 'monitoring' ? await snapshotBefore(tx, company.id, row.id) : null;

    // What the register said before this result, read before its facts are replaced.
    const registerBefore = await heldRegistryFacts(tx, company.id);
    await applySourceFacts(tx, company, sources);
    // Every difference from what was held is kept as the company's change history.
    const registerChanges = await recordRegistryChanges(tx, { organisationId: row.organisationId, companyId: company.id, scanId: row.id, before: registerBefore, now });
    await rebuildAnswerFacts(tx, company, now);
    await rebuildVaultFacts(tx, company);

    const { facts, values, fixtureKeys } = await loadEngineFacts(tx, company.id);
    const factMap = new Map(facts.map((fact) => [fact.key, fact]));
    const states = sourceStates(relevant, sources);
    const stage = stageOf(company, values);
    const packs = selection.packs;
    const plan = await planOf(tx, row.organisationId, deps.config);
    const declaredMissing = await loadDeclaredMissing(tx, company.id);
    const engine = runEngine(packs, { facts, sources: states, stage, company_name: company.legalName, as_of: now, declared_missing: declaredMissing });
    const reviewed = await applyReviewerFindings(tx, company, selection, engine.findings);
    const overlayPacks = new Set(selection.used.filter((use) => use.mode === 'overlay').map((use) => use.jurisdiction));

    const deadlines = computeDeadlines(packs, {
      facts: values,
      company: {
        incorporated_on: incorporatedOn(company, values),
        year_end: company.yearEndMonth && company.yearEndDay ? { month: company.yearEndMonth, day: company.yearEndDay } : null,
      },
      stage,
      as_of: now,
      unavailable_prefixes: Object.entries(states).filter(([, state]) => state !== 'ok').map(([prefix]) => prefix),
    });
    const evaluated = attachDeadlines(reviewed, deadlines);
    const score = scoreFindings(evaluated);
    const range = freePlanRange(evaluated);

    const ruleRows = await tx
      .select({ id: schema.rule.id, key: schema.rule.ruleKey, jurisdiction: schema.rulePack.jurisdictionCode, version: schema.rulePack.version })
      .from(schema.rule)
      .innerJoin(schema.rulePack, eq(schema.rulePack.id, schema.rule.rulePackId))
      .where(inArray(schema.rulePack.jurisdictionCode, packs.map((pack) => pack.jurisdiction)));
    const ruleIds = new Map(ruleRows.filter((item) => engine.pack_versions[item.jurisdiction] === item.version).map((item) => [item.key, item.id]));

    const messageByPrefix = new Map<string, string>();
    for (const source of sources) {
      const prefix = relevant.find((connector) => connector.id === source.connectorId)?.factPrefix;
      if (prefix && source.message && isDown(source.status)) messageByPrefix.set(prefix, source.message);
    }
    const rows = evaluated.map((item) => {
      const detail: FindingDetail = {
        jurisdiction: item.jurisdiction,
        applies_because: overlayPacks.has(item.jurisdiction) ? 'market' : 'incorporated',
        area: item.area,
        title: item.title,
        headline: item.text.headline,
        confidence: item.confidence,
        reason: item.reason,
        // Only for a missing identifier or a vendor still working: those words say what happens next.
        reason_detail: (item.reason === 'needs_identifier' || item.reason === 'source_waiting') && item.reason_source ? (messageByPrefix.get(item.reason_source) ?? null) : null,
        remediation: item.remediation,
        instruments: item.instruments,
        regulator: item.regulator,
        evidence: item.evidence,
        // How we know, never the value itself: officers' names stay out of this column.
        // Once someone says they don't have a document, that's the whole answer: "not seen yet" would contradict it.
        facts_used: (item.declared_missing ? item.facts_used.filter((used) => used.key === 'declared_missing') : item.facts_used).flatMap((used) => explainFacts(used, factMap, states, fixtureKeys, now)),
        ...(item.cost_of_delay ? { cost_of_delay: item.cost_of_delay } : {}),
        due_on: item.due_on ?? null,
        rule_status: item.rule_status,
        review_note: item.review_note,
        reviewed_at: item.reviewed_at,
        document_rule: item.document_rule,
        declared_missing: item.declared_missing,
      };
      return {
        organisationId: row.organisationId,
        scanId: row.id,
        companyId: company.id,
        ruleId: ruleIds.get(item.rule_id) ?? null,
        ruleKey: item.rule_id,
        rulePackVersion: engine.pack_versions[item.jurisdiction] ?? 'unknown',
        outcome: item.outcome,
        layer: item.layer,
        severity: item.severity,
        scored: item.scored,
        freePlanEvidence: item.free_plan_evidence === true,
        explanation: item.review_note,
        whatIsMissing: item.text.missing,
        whyItMatters: item.text.why,
        ifLeft: item.text.if_left,
        fix: item.text.fix,
        evidenceRefs: item.evidence,
        detail,
      };
    });
    const inserted = await tx.insert(finding).values(rows).onConflictDoNothing().returning({ id: finding.id, key: finding.ruleKey });
    const findingIds = new Map(inserted.map((item) => [item.key, item.id]));

    const [previous] = await tx
      .select()
      .from(scoreSnapshot)
      .where(eq(scoreSnapshot.companyId, company.id))
      .orderBy(desc(scoreSnapshot.createdAt), desc(scoreSnapshot.id))
      .limit(1);

    await tx
      .insert(scoreSnapshot)
      .values({
        organisationId: row.organisationId,
        scanId: row.id,
        companyId: company.id,
        overall: score.overall === null ? null : String(score.overall),
        layerScores: { layers: score.layers, weights_used: score.weights_used },
        methodVersion: score.method_version,
        rulePackVersions: engine.pack_versions,
        freeRange: range,
        coverage: score.coverage,
        heldByUrgent: score.held_by_urgent,
      })
      .onConflictDoNothing();

    const ranked = rankPriorities(evaluated, now);
    const actions = ranked.flatMap((action, index) => {
      const findingId = findingIds.get(action.finding.rule_id);
      if (!findingId) return [];
      return [{
        organisationId: row.organisationId,
        scanId: row.id,
        findingId,
        rank: index + 1,
        title: action.finding.text.headline,
        actionType: actionTypeOf(action.finding),
        priority: action.priority.toFixed(3),
        points: action.points.toFixed(2),
      }];
    });
    if (actions.length > 0) await tx.insert(actionItem).values(actions).onConflictDoNothing();

    await syncDeadlines(tx, company, deadlines, findingIds);

    const anySourceDown = sources.some((source) => isDown(source.status));
    await tx
      .update(scan)
      .set({
        status: anySourceDown ? 'partial' : 'completed',
        completedAt: now,
        leaseUntil: null,
        rulePackVersions: engine.pack_versions,
        packsUsed: selection.used,
        finalisedSeq: sql`nextval('scan_finalised_seq')`,
      })
      .where(eq(scan.id, row.id));

    // Tell the people running the company, without giving a Free plan its exact number.
    const exact = PLAN_ENTITLEMENTS[plan].exactScore;
    const link = `/companies/${company.id}`;
    // A followed company isn't the reader's own: name it instead of saying "your".
    const followed = company.relationship === 'follow';
    const whose = followed ? `${company.legalName}'s` : 'Your';
    const notices: NoticeEmail[] = [];
    let told = false;
    if (before) {
      // Monitoring tells people only about a meaningful change, never every small movement.
      const recorded = await recordMonitoringChanges(tx, {
        organisationId: row.organisationId,
        scanId: row.id,
        company,
        before,
        findingsAfter: rows.map((item) => ({ ruleKey: item.ruleKey, outcome: item.outcome, severity: item.severity, headline: item.detail.headline })),
        scoreAfter: score.overall,
        exactScore: exact,
      });
      told = recorded.reasons.length > 0;
    }
    if (followed && previous && !told) {
      // The watchlist alert: the followed company's band moved, or its register status changed.
      const wordBefore = snapshotView(previous, exact).statusWord;
      const wordNow = exact
        ? score.overall === null ? null : statusWord(score.overall, score.coverage)
        : range ? statusWord(Math.round((range.low + range.high) / 2), range.coverage) : null;
      const band = wordBefore !== null && wordNow !== null && wordBefore !== wordNow ? { before: wordBefore, after: wordNow } : null;
      const statusChanges = statusChangesIn(registerChanges);
      if (band || statusChanges.length > 0) {
        const notice = watchlistNotice(company.legalName, band, statusChanges);
        notices.push(...(await notifyOrganisation(tx, row.organisationId, { kind: 'score', title: notice.title, body: notice.body, link, dedupeKey: `watch:${row.id}` })));
        told = true;
      }
    }
    if (before || told) {
      // Already said, or a monitoring scan with nothing worth saying.
    } else if (!previous) {
      await notifyOrganisation(tx, row.organisationId, {
        kind: 'score',
        title: followed ? `The first read of ${company.legalName} is ready` : 'Your first read is ready',
        body: followed ? `${company.legalName}: see where it stands.` : `${company.legalName}: see where you stand.`,
        link,
        dedupeKey: `scan:${row.id}`,
      });
    } else if (exact && previous.overall !== null && score.overall !== null) {
      const before = Math.round(Number(previous.overall));
      const delta = score.overall - before;
      if (delta !== 0) {
        await notifyOrganisation(tx, row.organisationId, {
          kind: 'score',
          title: `${whose} score went ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)} ${Math.abs(delta) === 1 ? 'point' : 'points'}`,
          body: `From ${before} to ${score.overall}, ${triggerWords(row.trigger)}. ${company.legalName}.`,
          link,
          dedupeKey: `scan:${row.id}`,
        });
      }
    } else if (!exact && range) {
      const was = previous.freeRange as { low?: number; high?: number } | null;
      if (was?.low !== range.low || was?.high !== range.high) {
        await notifyOrganisation(tx, row.organisationId, {
          kind: 'score',
          title: `${whose} approximate score changed`,
          body: `Now ${range.low} to ${range.high}, ${triggerWords(row.trigger)}. ${company.legalName}.`,
          link,
          dedupeKey: `scan:${row.id}`,
        });
      }
    }

    await writeAudit(tx, {
      organisationId: row.organisationId,
      action: 'scan.finalised',
      target: row.id,
      metadata: { kind: row.kind, trigger: row.trigger, method: score.method_version, packs: selection.used, partial: anySourceDown, registerChanges: registerChanges.length },
    });
    const wanted = mailFor(row, company, anySourceDown, deps.config.webBaseUrl);
    const leads = wanted
      ? await tx
          .select({ id: schema.user.id, email: schema.user.email })
          .from(schema.membership)
          .innerJoin(schema.user, eq(schema.user.id, schema.membership.userId))
          .where(inArray(schema.membership.role, ['owner', 'admin']))
      : [];
    // The result email is a "score" email: someone who switched those off still gets the in-app notification.
    const allowed = await emailWanted(tx, leads.map((person) => person.id), 'score');
    const people = leads.filter((person) => allowed.has(person.id));
    return { anySourceDown, mail: wanted ? { ...wanted, to: people.map((person) => person.email) } : null, notices };
  });
}

// ---- The job ----

async function claim(deps: AppDeps, organisationId: string, scanId: string): Promise<ScanRow | null> {
  const now = deps.now();
  const until = new Date(now.getTime() + deps.config.scanLeaseSeconds * 1000);
  return deps.db.withOrg(organisationId, async (tx) => {
    const [claimed] = await tx
      .update(scan)
      .set({
        status: 'running',
        startedAt: sql`coalesce(${scan.startedAt}, ${now.toISOString()}::timestamptz)`,
        attempts: sql`${scan.attempts} + 1`,
        leaseUntil: until,
      })
      .where(
        and(
          eq(scan.id, scanId),
          sql`(${scan.status} = 'queued' OR (${scan.status} = 'running' AND ${scan.leaseUntil} <= ${now.toISOString()}::timestamptz))`,
        ),
      )
      .returning();
    return claimed ?? null;
  });
}

async function afterFinalise(deps: AppDeps, row: ScanRow, anySourceDown: boolean): Promise<void> {
  const next = anySourceDown ? new Date(deps.now().getTime() + deps.config.sourceRetryMinutes * 60_000) : null;
  await deps.db.withSystem(async (tx) => {
    const [sweep] = await tx.select().from(companySweep).where(eq(companySweep.companyId, row.companyId));
    const clearInFlight = sweep?.scanInFlightId === row.id ? { scanInFlightId: null, scanInFlightUntil: null } : {};
    await tx
      .insert(companySweep)
      .values({ companyId: row.companyId, tenantId: row.organisationId, nextSourceRetryAt: next })
      .onConflictDoUpdate({
        target: companySweep.companyId,
        set: {
          // A waiting retry keeps its schedule. It only clears once no source is down.
          nextSourceRetryAt: next ? (sweep?.nextSourceRetryAt ?? next) : null,
          ...(next ? {} : { sourceRetryCount: 0 }),
          ...clearInFlight,
        },
      });
  });
}

/**
 * The scan.run job. Safe to run twice at once, after a crash, or after a retry: only the holder
 * of the lease does anything, each source is written once per scan, and the result is one
 * all-or-nothing transaction.
 */
export async function runScan(deps: AppDeps, payload: { organisationId: string; scanId: string }): Promise<void> {
  const row = await claim(deps, payload.organisationId, payload.scanId);
  if (!row) return;
  if (row.attempts > MAX_ATTEMPTS) {
    await failScan(deps, row);
    return;
  }
  try {
    await runSources(deps, row);
    const result = await finalise(deps, row);
    if (result) {
      await afterFinalise(deps, row, result.anySourceDown);
      if (result.mail) await sendResultMail(deps, row.organisationId, result.mail);
      await sendNoticeEmails(deps, result.notices);
    }
  } catch (error) {
    // Let the next attempt take over straight away.
    await deps.db.withOrg(row.organisationId, (tx) =>
      tx.update(scan).set({ leaseUntil: deps.now() }).where(and(eq(scan.id, row.id), eq(scan.status, 'running'))),
    );
    throw error;
  }
}

/** The in-app notification is already saved, so a mail provider that's down costs only the email. */
async function sendResultMail(deps: AppDeps, organisationId: string, mail: NonNullable<FinaliseOutcome['mail']>): Promise<void> {
  for (const to of mail.to) {
    await deps.mailer.send({ to, subject: mail.subject, text: mail.text, template: 'scan-result', organisationId }).catch(() => undefined);
  }
}

async function failScan(deps: AppDeps, row: ScanRow): Promise<void> {
  await deps.db.withOrg(row.organisationId, (tx) =>
    tx.update(scan).set({ status: 'failed', leaseUntil: null }).where(eq(scan.id, row.id)),
  );
  await deps.db.withSystem((tx) =>
    tx
      .update(companySweep)
      .set({ scanInFlightId: null, scanInFlightUntil: null })
      .where(and(eq(companySweep.companyId, row.companyId), eq(companySweep.scanInFlightId, row.id))),
  );
}

// ---- Sweeps ----

/**
 * Brings the source retry forward, for a company that has been scanned, after it gave us a
 * reference number a source was waiting for. The retry job does the asking.
 */
export async function askSourcesAgainSoon(deps: AppDeps, companyId: string): Promise<void> {
  await deps.db.withSystem((tx) =>
    tx.update(companySweep).set({ nextSourceRetryAt: deps.now(), sourceRetryCount: 0 }).where(eq(companySweep.companyId, companyId)),
  );
}

/** Restarts any scan whose worker went away, including jobs lost with an in-process queue. */
export async function recoverScans(deps: AppDeps): Promise<number> {
  const now = deps.now();
  const until = new Date(now.getTime() + deps.config.scanLeaseSeconds * 1000);
  const due = await deps.db.withSystem(async (tx) => {
    const rows = await tx
      .select({ companyId: companySweep.companyId, organisationId: companySweep.tenantId, scanId: companySweep.scanInFlightId })
      .from(companySweep)
      .where(lte(companySweep.scanInFlightUntil, now))
      .limit(200);
    for (const row of rows) {
      await tx.update(companySweep).set({ scanInFlightUntil: until }).where(eq(companySweep.companyId, row.companyId));
    }
    return rows;
  });
  for (const row of due) {
    if (row.scanId) await deps.queue.enqueue('scan.run', { organisationId: row.organisationId, scanId: row.scanId });
  }
  return due.length;
}

/**
 * Tries the sources that were down again, one company at a time, backing off up to a day.
 * The answer replaces the old one in place. Only a source that recovers changes the score.
 */
export async function retryDownSources(deps: AppDeps): Promise<number> {
  const now = deps.now();
  const due = await deps.db.withSystem((tx) =>
    tx.select().from(companySweep).where(lte(companySweep.nextSourceRetryAt, now)).limit(50),
  );
  for (const item of due) {
    const { company, website, down, identifiers } = await deps.db.withOrg(item.tenantId, async (tx) => {
      const found = await requireCompany(tx, item.companyId);
      const sources = await latestSources(tx, item.companyId);
      return {
        company: found,
        website: await websiteOf(tx, found),
        // Stage one first, so a source that needs its answer sees the newest one.
        down: sources.filter((source) => isDown(source.status)).sort((a, b) => Number(STAGE_TWO.has(a.connectorId)) - Number(STAGE_TWO.has(b.connectorId))),
        identifiers: resolveIdentifiers(await loadAnswers(tx, found.id), sources),
      };
    });
    let recovered = false;
    let stillDown = false;
    let ids = identifiers;
    for (const source of down) {
      const connector = deps.connectors.find((candidate) => candidate.id === source.connectorId);
      if (!connector) continue;
      if (STAGE_TWO.has(connector.id) && recovered) {
        // A stage-one source just came back, so its facts may hold the identifier we lacked.
        ids = await deps.db.withOrg(item.tenantId, async (tx) => resolveIdentifiers(await loadAnswers(tx, company.id), await latestSources(tx, company.id)));
      }
      const result = await lookupForCompany(deps, { organisationId: item.tenantId, companyId: item.companyId, checkAgain: false }, connector, companyRef(company, website, connector, { identifiers: ids }));
      await deps.db.withOrg(item.tenantId, (tx) =>
        tx
          .update(sourceResult)
          .set({ ...sourceValues(result, connector), attempts: sql`${sourceResult.attempts} + 1` })
          .where(eq(sourceResult.id, source.id)),
      );
      await recordHealth(deps, connector.id, result.status);
      if (isDown(result.status)) stillDown = true;
      else recovered = true;
    }
    const count = item.sourceRetryCount + 1;
    const minutes = Math.min(MAX_RETRY_MINUTES, deps.config.sourceRetryMinutes * 2 ** Math.min(count, 10));
    await deps.db.withSystem((tx) =>
      tx
        .update(companySweep)
        .set(
          stillDown
            ? { nextSourceRetryAt: new Date(now.getTime() + minutes * 60_000), sourceRetryCount: count }
            : { nextSourceRetryAt: null, sourceRetryCount: 0 },
        )
        .where(eq(companySweep.companyId, item.companyId)),
    );
    if (recovered) await requestRescore(deps, item.tenantId, item.companyId, 'source_recovered');
  }
  return due.length;
}

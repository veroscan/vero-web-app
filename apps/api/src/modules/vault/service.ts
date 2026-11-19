import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import { isDocumentRule, isIsoDate, LAYER_NAMES, type VaultSlot } from '@vero/rules';
import { DOCUMENT_HELPER_NOTICE, SLOT_STATE_WORDS, type ConfirmDocumentBody, type ConnectedDocumentOrigin, type DocumentHelperReading, type GithubDocumentOrigin, type SlotState, type VaultDocument, type VaultResponse, type VaultSlotView } from '@vero/shared';
import { and, desc, eq, inArray, isNotNull } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import type { RequestMeta } from '../../http/route';
import type { ReadField, SignatureHint } from '../../infra';
import { writeAudit } from '../audit/service';
import { entitlementsOf, requireEntitlement } from '../plans/service';
import { requireOwned, requireOwnedCompany } from '../companies/ownership';
import { loadDeclaredMissing, requireCompany, selectCompanyPacks, slotsFor, type CompanyRow } from '../scans/facts';
import { requestRescore } from '../scans/pipeline';
import { EXTRACT_MAX_CHARS, extractPdfText } from './extract';
import { chooseClassifier, recordHelperUsage } from './helper';
import { assertExtensionMatches, cleanFileName, inspectFile, inspectTextFile } from './files';

const { document, vaultSlot, reviewTask, finding, scan } = schema;
export type DocumentRow = typeof document.$inferSelect;

const CERTIFICATE_SLOT = 'de_good_standing';

/** Signed links last five minutes. */
export const DOWNLOAD_TTL_SECONDS = 300;

interface Extracted {
  suggestedSlot?: string | null;
  suggestedLabel?: string | null;
  signature?: SignatureHint;
  textFound?: boolean;
  /** Only when the document helper was meant to read it. Suggestions, never decisions. */
  helper?: { suggestedBy: 'heuristic' | 'assistant'; fields: ReadField[]; concerns: string[]; unread: string | null };
  /** Only for a file read from a connected GitHub repository: where it came from. */
  github?: GithubDocumentOrigin;
  /** Only for a file brought in from DocuSign or the forwarding address: where it came from. */
  connection?: ConnectedDocumentOrigin;
  /** The slots a connected file may be suggested for. The classifier chooses only among these. */
  candidateSlots?: string[];
}

function helperReading(extracted: Extracted): DocumentHelperReading | undefined {
  if (!extracted.helper) return undefined;
  return { ...extracted.helper, notice: DOCUMENT_HELPER_NOTICE };
}

const SIGNATURE_WORDS: Record<SignatureHint, string | null> = {
  looks_signed: 'It looks signed. This is only a hint.',
  looks_unsigned: "It doesn't look signed yet. This is only a hint, and you have the last word.",
  unknown: null,
};

/** Where a document stands. A person confirms it; nobody else judges it (no lawyer review since 19 Nov 2026). */
function stateOf(row: DocumentRow): SlotState {
  switch (row.status) {
    case 'filed':
      return 'read';
    case 'needs_confirmation':
      return 'needs_confirmation';
    case 'rejected':
    case 'failed':
      return 'not_accepted';
    default:
      return 'reading';
  }
}

function toDto(row: DocumentRow, slots: Map<string, { key: string; label: string }>): VaultDocument {
  const extracted = row.extractedFields as Extracted;
  const state = stateOf(row);
  const slot = row.slotId ? slots.get(row.slotId) : undefined;
  const signature = extracted.signature ?? 'unknown';
  return {
    id: row.id,
    companyId: row.companyId,
    fileName: row.fileName,
    mime: row.mime,
    sizeBytes: row.sizeBytes,
    pages: row.pages,
    status: row.status as VaultDocument['status'],
    state,
    stateWord: SLOT_STATE_WORDS[state],
    slotKey: slot?.key ?? null,
    slotLabel: slot?.label ?? null,
    suggestion:
      row.classificationConfidence === null
        ? null
        : {
            slotKey: extracted.suggestedSlot ?? null,
            label: extracted.suggestedLabel ?? null,
            confidence: Number(row.classificationConfidence),
          },
    signatureHint: signature,
    signatureHintWords: SIGNATURE_WORDS[signature],
    rejectionReason: row.rejectionReason,
    documentDate: row.documentDate,
    expiresOn: row.expiresOn,
    validated: row.validated,
    uploadedAt: row.createdAt.toISOString(),
    ...(extracted.helper ? { documentHelper: helperReading(extracted) } : {}),
    ...(extracted.github ? { fromGithub: extracted.github } : {}),
    ...(extracted.connection ? { fromConnection: extracted.connection } : {}),
  };
}

async function slotIndex(tx: Tx): Promise<{ byId: Map<string, { key: string; label: string }>; idOf: Map<string, string> }> {
  const rows = await tx.select({ id: vaultSlot.id, key: vaultSlot.key, label: vaultSlot.title }).from(vaultSlot);
  return { byId: new Map(rows.map((row) => [row.id, row])), idOf: new Map(rows.map((row) => [row.key, row.id])) };
}

export async function documentDto(tx: Tx, row: DocumentRow): Promise<VaultDocument> {
  const { byId } = await slotIndex(tx);
  return toDto(row, byId);
}

export async function requireDocument(tx: Tx, documentId: string): Promise<DocumentRow> {
  const [row] = await tx.select().from(document).where(eq(document.id, documentId));
  if (!row) throw errors.notFound('That document');
  return row;
}

/** Which of a company's slots apply, going by its newest result. Before any result, all do. */
async function applicableSlots(tx: Tx, company: CompanyRow): Promise<VaultSlot[]> {
  const slots = await slotsFor(tx, company);
  const [latest] = await tx
    .select({ id: scan.id })
    .from(scan)
    .where(and(eq(scan.companyId, company.id), isNotNull(scan.finalisedSeq)))
    .orderBy(desc(scan.finalisedSeq))
    .limit(1);
  if (!latest) return slots;
  const rows = await tx.select({ key: finding.ruleKey, outcome: finding.outcome }).from(finding).where(eq(finding.scanId, latest.id));
  const applies = new Set(rows.filter((row) => row.outcome !== 'not_applicable').map((row) => row.key));
  return slots.filter((slot) => slot.rule_ids.some((ruleId) => applies.has(ruleId)));
}

/** Where a slot stands. A filed document beats a newer one still being read or one that wasn't accepted. */
function slotState(slot: VaultSlot, documents: readonly VaultDocument[], statements: ReadonlySet<string>): { chosen: VaultDocument | undefined; state: SlotState } {
  const inSlot = documents.filter((doc) => doc.slotKey === slot.id);
  const chosen = inSlot.find((doc) => doc.status === 'filed') ?? inSlot[0];
  const said = slot.rule_ids.some((ruleId) => statements.has(ruleId));
  return { chosen, state: chosen?.state ?? (said ? 'declared_missing' : 'missing') };
}

/**
 * The documents that clear one issue, and where each one stands. Unlike the vault list this is
 * sent on every plan and for followed companies too: it says what proof clears the issue the
 * person is already looking at, not the whole list of what's missing.
 */
export async function proofFor(tx: Tx, company: CompanyRow, ruleKey: string): Promise<{ slotKey: string; label: string; state: SlotState }[]> {
  const slots = (await slotsFor(tx, company)).filter((slot) => slot.rule_ids.includes(ruleKey));
  if (slots.length === 0) return [];
  const rows = await tx.select().from(document).where(eq(document.companyId, company.id)).orderBy(desc(document.createdAt), desc(document.id));
  const { byId } = await slotIndex(tx);
  const documents = rows.map((row) => toDto(row, byId));
  const statements = new Set(await loadDeclaredMissing(tx, company.id));
  return slots.map((slot) => ({ slotKey: slot.id, label: slot.label, state: slotState(slot, documents, statements).state }));
}

export async function vaultView(deps: AppDeps, tx: Tx, organisationId: string, companyId: string): Promise<VaultResponse> {
  const company = await requireCompany(tx, companyId);
  const entitlements = await entitlementsOf(tx, organisationId, deps.config);
  // On Free the list of what's missing is the full gap report, so it isn't sent.
  if (!entitlements.vault) return { companyId, canUpload: false, slots: [], documents: [], filledCount: 0, totalCount: 0 };

  const rows = await tx.select().from(document).where(eq(document.companyId, companyId)).orderBy(desc(document.createdAt), desc(document.id));
  const { byId } = await slotIndex(tx);
  const documents = rows.map((row) => toDto(row, byId));

  const statements = new Set(await loadDeclaredMissing(tx, companyId));
  const slots: VaultSlotView[] = (await applicableSlots(tx, company)).map((slot) => {
    const { chosen, state } = slotState(slot, documents, statements);
    return {
      key: slot.id,
      label: slot.label,
      reason: slot.reason,
      layer: slot.layer,
      layerName: LAYER_NAMES[slot.layer] ?? '',
      jurisdiction: slot.jurisdiction,
      expires: slot.expires,
      state,
      stateWord: SLOT_STATE_WORDS[state],
      documentId: chosen?.id ?? null,
      ruleKeys: slot.rule_ids,
    };
  });
  return {
    companyId,
    canUpload: true,
    slots,
    documents,
    filledCount: slots.filter((slot) => slot.state === 'read').length,
    totalCount: slots.length,
  };
}

/** Runs before the body is read. With a company id, a company this team only follows is refused too. */
export async function assertCanUpload(deps: AppDeps, organisationId: string, companyId?: string): Promise<void> {
  await deps.db.withOrg(organisationId, async (tx) => {
    if (companyId !== undefined) await requireOwnedCompany(tx, companyId);
    requireEntitlement(await entitlementsOf(tx, organisationId, deps.config), 'vault', 'Uploading documents');
  });
}

export async function uploadDocument(
  deps: AppDeps,
  input: { organisationId: string; companyId: string; userId: string; data: Buffer; fileName: string; slotKey?: string; meta: RequestMeta },
): Promise<VaultDocument> {
  const { organisationId, companyId, data } = input;
  // The checks come before anything is stored.
  const sniffed = inspectFile(data);
  const fileName = cleanFileName(input.fileName);
  assertExtensionMatches(fileName, sniffed);

  const preset = await deps.db.withOrg(organisationId, async (tx) => {
    const company = await requireCompany(tx, companyId);
    requireOwned(company);
    requireEntitlement(await entitlementsOf(tx, organisationId, deps.config), 'vault', 'Uploading documents');
    if (input.slotKey && !(await slotsFor(tx, company)).some((slot) => slot.id === input.slotKey)) {
      throw errors.invalidInput('That document slot does not exist for this company.');
    }
    return input.slotKey ?? null;
  });
  return storeNewDocument(deps, {
    organisationId,
    companyId,
    data,
    fileName,
    mime: sniffed.mime,
    source: 'upload',
    uploadedBy: input.userId,
    preset,
    audit: { actorId: input.userId, action: 'document.uploaded', meta: input.meta },
  });
}

/**
 * The one way a document enters the vault, whether uploaded or read from a connection: the
 * file is stored under a random key, the row starts "processing", and document.process reads
 * it and waits for a person. Nothing here files a document or reaches a score.
 */
async function storeNewDocument(
  deps: AppDeps,
  input: {
    organisationId: string;
    companyId: string;
    data: Buffer;
    fileName: string;
    mime: string;
    source: 'upload' | 'github' | 'docusign' | 'email' | 'google_drive' | 'sharepoint';
    uploadedBy: string | null;
    preset: string | null;
    externalRef?: string;
    extracted?: Extracted;
    audit: { actorId: string | null; action: string; meta?: RequestMeta };
  },
): Promise<VaultDocument> {
  const { organisationId, companyId, data } = input;
  // The key is random, so no part of the sender's file name ever reaches storage.
  const documentId = randomUUID();
  const storageKey = `org/${organisationId}/${companyId}/${documentId}`;
  // Every way in (upload, GitHub, DocuSign, email, Google Drive, SharePoint) stops here for a followed company.
  await deps.db.withOrg(organisationId, (tx) => requireOwnedCompany(tx, companyId));
  await deps.files.put(storageKey, data, { contentType: 'application/octet-stream' });
  const row = await deps.db.withOrg(organisationId, async (tx) => {
    const { idOf } = await slotIndex(tx);
    const [created] = await tx
      .insert(document)
      .values({
        id: documentId,
        organisationId,
        companyId,
        slotId: input.preset ? (idOf.get(input.preset) ?? null) : null,
        storageKey,
        ...(input.externalRef ? { externalRef: input.externalRef } : {}),
        source: input.source,
        fileName: input.fileName,
        fileHash: createHash('sha256').update(data).digest('hex'),
        mime: input.mime,
        sizeBytes: data.length,
        status: 'processing',
        uploadedBy: input.uploadedBy,
        ...(input.extracted ? { extractedFields: input.extracted } : {}),
      })
      .returning();
    if (!created) throw errors.internal();
    await writeAudit(tx, {
      organisationId,
      actorId: input.audit.actorId,
      action: input.audit.action,
      target: created.id,
      metadata: { mime: input.mime, sizeBytes: data.length },
      ...(input.audit.meta ? { meta: input.audit.meta } : {}),
    });
    return documentDto(tx, created);
  });
  await deps.queue.enqueue('document.process', { organisationId, documentId });
  return row;
}

/**
 * A file read from a connected GitHub repository becomes a vault document exactly like an
 * upload: stored, read by the same chooser (heuristic, or the document helper only where it is
 * switched on and the organisation opted in), and then waiting for a person to confirm. Only
 * plain text is taken. The classifier may only suggest one of `candidateSlots`.
 */
export async function addGithubDocument(
  deps: AppDeps,
  input: { organisationId: string; companyId: string; data: Buffer; fileName: string; origin: GithubDocumentOrigin; externalRef: string; candidateSlots: string[] },
): Promise<VaultDocument> {
  const sniffed = inspectTextFile(input.data, input.fileName);
  return storeNewDocument(deps, {
    organisationId: input.organisationId,
    companyId: input.companyId,
    data: input.data,
    fileName: cleanFileName(input.fileName),
    mime: sniffed.mime,
    source: 'github',
    uploadedBy: null,
    preset: null,
    externalRef: input.externalRef,
    extracted: { github: input.origin, candidateSlots: input.candidateSlots },
    audit: { actorId: null, action: 'document.added_from_github' },
  });
}

/**
 * A file brought in from DocuSign or the forwarding address becomes a vault document exactly
 * like an upload: the caller has already checked what the file really is (`inspectFile` or
 * `inspectTextFile`); it is stored, read by the same chooser, and then waits for a person to
 * confirm it. Its origin says where it came from and never that it is genuine or signed.
 */
export async function addConnectedDocument(
  deps: AppDeps,
  input: {
    organisationId: string;
    companyId: string;
    data: Buffer;
    fileName: string;
    mime: string;
    source: 'docusign' | 'email' | 'google_drive' | 'sharepoint';
    origin: ConnectedDocumentOrigin;
    externalRef: string;
    auditAction: string;
  },
): Promise<VaultDocument> {
  return storeNewDocument(deps, {
    organisationId: input.organisationId,
    companyId: input.companyId,
    data: input.data,
    fileName: cleanFileName(input.fileName),
    mime: input.mime,
    source: input.source,
    uploadedBy: null,
    preset: null,
    externalRef: input.externalRef,
    extracted: { connection: input.origin },
    audit: { actorId: null, action: input.auditAction },
  });
}

/** The document.process job. Reads the file, proposes a slot, and waits for a person. */
export async function processDocument(deps: AppDeps, payload: { organisationId: string; documentId: string }): Promise<void> {
  const { organisationId, documentId } = payload;
  const context = await deps.db.withOrg(organisationId, async (tx) => {
    const [row] = await tx.select().from(document).where(and(eq(document.id, documentId), eq(document.status, 'processing')));
    if (!row) return null;
    const company = await requireCompany(tx, row.companyId);
    return { row, company, slots: await slotsFor(tx, company) };
  });
  if (!context) return;
  const { row } = context;
  const before = row.extractedFields as Extracted;
  // A connected file is only ever suggested for the slots it was matched to.
  const candidates = before.candidateSlots ? new Set(before.candidateSlots) : null;
  const slots = candidates ? context.slots.filter((slot) => candidates.has(slot.id)) : context.slots;

  const data = row.storageKey ? await deps.files.get(row.storageKey) : null;
  if (!data) {
    await deps.db.withOrg(organisationId, (tx) =>
      tx.update(document).set({ status: 'failed', rejectionReason: "We couldn't read this file. Please upload it again." }).where(eq(document.id, documentId)),
    );
    return;
  }
  const pdf =
    row.mime === 'application/pdf'
      ? await extractPdfText(data)
      : row.mime?.startsWith('text/')
        ? { text: data.toString('utf8').slice(0, EXTRACT_MAX_CHARS), pages: null }
        : { text: null, pages: null };
  // The document helper only when this environment and the organisation have both said yes.
  const choice = await chooseClassifier(deps, organisationId);
  const result = await choice.classifier.classify({
    fileName: row.fileName ?? '',
    text: pdf.text,
    textCut: pdf.text !== null && pdf.text.length >= EXTRACT_MAX_CHARS,
    slots: slots.map((slot) => ({ key: slot.id, label: slot.label, reason: slot.reason })),
    ...(choice.helper ? { file: { data, mime: row.mime ?? '', pages: pdf.pages } } : {}),
  });
  const extracted: Extracted = {
    ...(before.github ? { github: before.github } : {}),
    ...(before.connection ? { connection: before.connection } : {}),
    ...(before.candidateSlots ? { candidateSlots: before.candidateSlots } : {}),
    suggestedSlot: result.slotKey,
    suggestedLabel: result.label,
    signature: result.signature,
    textFound: pdf.text !== null,
    ...(choice.helper || choice.unread
      ? {
          helper: {
            suggestedBy: result.suggestedBy ?? 'heuristic',
            fields: result.fields ?? [],
            concerns: result.concerns ?? [],
            unread: result.unread ?? choice.unread ?? null,
          },
        }
      : {}),
  };
  // Still only a suggestion: nothing here files the document or reaches a score. A person confirms.
  await deps.db.withOrg(organisationId, async (tx) => {
    await tx
      .update(document)
      .set({
        status: 'needs_confirmation',
        pages: pdf.pages,
        classification: result.label,
        classificationConfidence: String(result.confidence),
        extractedFields: extracted,
      })
      .where(and(eq(document.id, documentId), eq(document.status, 'processing')));
    if (result.usage) await recordHelperUsage(tx, organisationId, documentId, result.usage);
  });
}

export async function confirmDocument(
  deps: AppDeps,
  input: { organisationId: string; documentId: string; userId: string; body: ConfirmDocumentBody; meta: RequestMeta },
): Promise<VaultDocument> {
  const { organisationId, documentId, body } = input;
  const { dto, companyId, filed } = await deps.db.withOrg(organisationId, async (tx) => {
    const row = await requireDocument(tx, documentId);
    await requireOwnedCompany(tx, row.companyId);
    if (row.status === 'processing' || row.status === 'pending') throw errors.invalidState("We're still reading this document.");
    if (row.status === 'failed') throw errors.invalidState("We couldn't read this file. Please upload it again.");
    const company = await requireCompany(tx, row.companyId);

    const slot = (await slotsFor(tx, company)).find((candidate) => candidate.id === body.slotKey);
    if (!slot) throw errors.invalidInput('That document slot does not exist for this company.');
    for (const date of [body.documentDate, body.expiresOn]) {
      if (date !== undefined && !isIsoDate(date)) throw errors.invalidInput('That date does not exist.');
    }
    // A certificate of good standing has no expiry: the rules count 12 months from its date.
    if (slot.id === CERTIFICATE_SLOT) {
      if (!body.documentDate) throw errors.invalidInput('Add the date on the certificate.');
    } else if (slot.expires && !body.expiresOn) {
      throw errors.invalidInput('Add the expiry date, so we can remind you before it runs out.');
    }

    const { idOf } = await slotIndex(tx);
    const slotId = idOf.get(slot.id);
    if (!slotId) throw errors.internal();

    const signature = (row.extractedFields as Extracted).signature ?? 'unknown';
    const looksUnsigned = signature === 'looks_unsigned' && body.confirmSigned !== true;
    const now = deps.now();
    const [updated] = await tx
      .update(document)
      .set({
        slotId,
        status: looksUnsigned ? 'rejected' : 'filed',
        rejectionReason: looksUnsigned
          ? "This copy doesn't look signed yet, so it doesn't count. We've kept it here. Upload the signed copy, or tell us it is signed."
          : null,
        classificationConfirmedBy: input.userId,
        classificationConfirmedAt: now,
        documentDate: body.documentDate ?? null,
        expiresOn: body.expiresOn ?? null,
        // Only the person can say they checked it.
        validated: body.validated === true,
      })
      .where(eq(document.id, row.id))
      .returning();
    if (!updated) throw errors.internal();

    await writeAudit(tx, {
      organisationId,
      actorId: input.userId,
      action: looksUnsigned ? 'document.not_accepted' : 'document.filed',
      target: row.id,
      metadata: { slot: slot.id, classifierSaid: (row.extractedFields as Extracted).suggestedSlot ?? null },
      meta: input.meta,
    });

    if (!looksUnsigned) {
      // The document wins: "we don't have this" no longer holds for what it covers.
      const cleared = await tx
        .delete(schema.missingDocumentStatement)
        .where(and(eq(schema.missingDocumentStatement.companyId, row.companyId), inArray(schema.missingDocumentStatement.ruleKey, slot.rule_ids)))
        .returning({ ruleKey: schema.missingDocumentStatement.ruleKey });
      for (const item of cleared) {
        await writeAudit(tx, { organisationId, actorId: input.userId, action: 'document.statement_cleared', target: row.companyId, metadata: { ruleKey: item.ruleKey, documentId: row.id }, meta: input.meta });
      }
    }
    return { dto: await documentDto(tx, updated), companyId: row.companyId, filed: !looksUnsigned };
  });
  if (filed) await requestRescore(deps, organisationId, companyId, 'document');
  return dto;
}

export async function deleteDocument(deps: AppDeps, input: { organisationId: string; documentId: string; userId: string; meta: RequestMeta }): Promise<void> {
  const { organisationId, documentId } = input;
  const removed = await deps.db.withOrg(organisationId, async (tx) => {
    const row = await requireDocument(tx, documentId);
    await requireOwnedCompany(tx, row.companyId);
    await tx
      .update(reviewTask)
      .set({ status: 'cancelled' })
      .where(and(eq(reviewTask.documentId, row.id), inArray(reviewTask.status, ['open', 'in_progress'])));
    await tx.delete(document).where(eq(document.id, row.id));
    await writeAudit(tx, { organisationId, actorId: input.userId, action: 'document.deleted', target: row.id, meta: input.meta });
    return row;
  });
  // After the commit: a file left behind by a crash is harmless. A row with no file isn't.
  if (removed.storageKey) await deps.files.delete(removed.storageKey);
  if (removed.status === 'filed') await requestRescore(deps, organisationId, removed.companyId, 'document');
}

interface StatementInput {
  organisationId: string;
  companyId: string;
  ruleKey: string;
  userId: string;
  meta: RequestMeta;
}

/**
 * "We don't have this". An empty slot is only "not checked yet" until someone says this, and
 * then it's a real gap. Only rules decided by a document alone can take it.
 */
export async function declareMissing(deps: AppDeps, input: StatementInput): Promise<boolean> {
  const { organisationId, companyId, ruleKey } = input;
  await deps.db.withOrg(organisationId, async (tx) => {
    const company = await requireCompany(tx, companyId);
    requireOwned(company);
    const selection = await selectCompanyPacks(tx, company);
    const rule = selection.packs.flatMap((pack) => pack.rules).find((candidate) => candidate.id === ruleKey);
    if (!rule) throw errors.notFound('That issue');
    if (!isDocumentRule(rule)) throw errors.invalidInput("That check isn't decided by a document, so you can't answer it this way.");

    const slots = (await slotsFor(tx, company)).filter((slot) => slot.rule_ids.includes(ruleKey)).map((slot) => slot.id);
    const filed = slots.length === 0 ? [] : await tx
      .select({ id: document.id })
      .from(document)
      .innerJoin(vaultSlot, eq(vaultSlot.id, document.slotId))
      .where(and(eq(document.companyId, companyId), eq(document.status, 'filed'), inArray(vaultSlot.key, slots)))
      .limit(1);
    if (filed.length > 0) throw errors.invalidState('You already have a document on file for this. Delete it first if it is wrong.');

    const added = await tx
      .insert(schema.missingDocumentStatement)
      .values({ organisationId, companyId, ruleKey, statedBy: input.userId })
      .onConflictDoNothing()
      .returning({ id: schema.missingDocumentStatement.id });
    if (added.length > 0) {
      await writeAudit(tx, { organisationId, actorId: input.userId, action: 'document.declared_missing', target: companyId, metadata: { ruleKey }, meta: input.meta });
    }
  });
  return requestRescore(deps, organisationId, companyId, 'missing_statement');
}

/** The undo. It goes back to "not checked yet". */
export async function undeclareMissing(deps: AppDeps, input: StatementInput): Promise<boolean> {
  const { organisationId, companyId, ruleKey } = input;
  await deps.db.withOrg(organisationId, async (tx) => {
    requireOwned(await requireCompany(tx, companyId));
    const removed = await tx
      .delete(schema.missingDocumentStatement)
      .where(and(eq(schema.missingDocumentStatement.companyId, companyId), eq(schema.missingDocumentStatement.ruleKey, ruleKey)))
      .returning({ id: schema.missingDocumentStatement.id });
    if (removed.length === 0) throw errors.notFound('That statement');
    await writeAudit(tx, { organisationId, actorId: input.userId, action: 'document.undeclared_missing', target: companyId, metadata: { ruleKey }, meta: input.meta });
  });
  return requestRescore(deps, organisationId, companyId, 'missing_statement');
}

export function downloadExpiry(deps: AppDeps): Date {
  return new Date(deps.now().getTime() + DOWNLOAD_TTL_SECONDS * 1000);
}

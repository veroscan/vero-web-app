import type { ConnectedDocumentOrigin } from '@vero/shared';
import { and, asc, eq } from 'drizzle-orm';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError } from '../../http/errors';
import { writeAudit } from '../audit/service';
import { entitlementsOf } from '../plans/service';
import { requireCompany } from '../scans/facts';
import { inspectFile } from '../vault/files';
import { addConnectedDocument } from '../vault/service';
import { DocusignError } from './client';
import { DOCUSIGN_ACCESS_ENDED, DOCUSIGN_SOURCE, DOCUSIGN_SOURCE_NAME, docusignParts, withDocusign } from './service';

const { docusignConnection, docusignEnvelopePull, document, fact } = schema;

export interface DocusignPullRun {
  envelopes: number;
  pulled: number;
  notCompleted: number;
  failed: number;
  tooLarge: number;
  notChecked: number;
  documentsAdded: number;
  certificates: number;
}

/** "DocuSign's own record says this envelope was completed on <date>." Never "valid", never "legal". */
export function completionStatement(completedAt: string): string {
  return `DocuSign's own record says this envelope was completed on ${completedAt.slice(0, 10)}.`;
}

/**
 * The company's DocuSign facts, rebuilt from every envelope it has brought in. Lists of
 * envelope ids, dates and counts only: no names, no emails, no subjects, and nothing that says a
 * document is genuine, validly signed or sufficient.
 */
export async function rebuildDocusignFacts(deps: AppDeps, organisationId: string, companyId: string, accountId: string): Promise<void> {
  await deps.db.withOrg(organisationId, async (tx) => {
    const rows = await tx.select().from(docusignEnvelopePull).where(eq(docusignEnvelopePull.companyId, companyId)).orderBy(asc(docusignEnvelopePull.completedAt), asc(docusignEnvelopePull.envelopeId));
    await tx.delete(fact).where(and(eq(fact.companyId, companyId), eq(fact.origin, 'connector'), eq(fact.source, DOCUSIGN_SOURCE)));
    if (rows.length === 0) return;
    const day = (date: Date) => date.toISOString().slice(0, 10);
    const facts: { key: string; value: string[] }[] = [
      { key: 'docusign.envelopes_completed', value: rows.map((row) => row.envelopeId) },
      { key: 'docusign.envelope_completed_on', value: rows.map((row) => `${row.envelopeId}: ${day(row.completedAt)}`) },
      { key: 'docusign.envelope_signer_counts', value: rows.map((row) => `${row.envelopeId}: ${row.signerCount}`) },
      { key: 'docusign.certificates_retrieved', value: rows.filter((row) => row.certificateRetrieved).map((row) => row.envelopeId) },
    ];
    const now = deps.now();
    await tx.insert(fact).values(
      facts.map((item) => ({
        organisationId,
        companyId,
        key: item.key,
        value: item.value,
        origin: 'connector',
        originRef: `docusign:account:${accountId}`,
        source: DOCUSIGN_SOURCE,
        sourceName: DOCUSIGN_SOURCE_NAME,
        sourceUrl: null,
        // DocuSign's record of the customer's own envelopes: evidence, not an official register.
        evidenceMethod: 'document',
        retrievedAt: now,
        verificationTier: 4,
        matchConfidence: '1',
      })),
    );
  });
}

/** Only a real PDF is taken, with the same checks as an upload (no scripts, no embedded files). */
function asPdf(data: Buffer): boolean {
  try {
    return inspectFile(data).mime === 'application/pdf';
  } catch (error) {
    if (error instanceof AppError) return false;
    throw error;
  }
}

/**
 * The docusign.pull job. For each envelope the person picked, and only those: DocuSign's own
 * status (it must say completed), the combined signed PDF and the certificate of completion.
 * Each file becomes an unconfirmed vault document. One envelope failing never stops the others;
 * DocuSign asking us to slow down, or the access ending, stops the run.
 */
export async function runDocusignPull(
  deps: AppDeps,
  payload: { organisationId: string; companyId: string; envelopeIds: string[]; requestedBy: string | null },
): Promise<DocusignPullRun | null> {
  const parts = docusignParts(deps);
  if (!parts) return null;
  const { organisationId, companyId } = payload;
  const setup = await deps.db.withOrg(organisationId, async (tx) => {
    const [row] = await tx.select().from(docusignConnection).limit(1);
    if (!row || row.status !== 'active') return null;
    await requireCompany(tx, companyId);
    if (!(await entitlementsOf(tx, organisationId, deps.config)).vault) return null;
    return row;
  });
  if (!setup) return null;

  const envelopeIds = payload.envelopeIds.slice(0, parts.config.maxEnvelopesPerPull);
  const run: DocusignPullRun = { envelopes: envelopeIds.length, pulled: 0, notCompleted: 0, failed: 0, tooLarge: 0, notChecked: 0, documentsAdded: 0, certificates: 0 };
  const maxBytes = deps.config.maxUploadBytes;
  let stopped: DocusignError | null = null;

  for (const envelopeId of envelopeIds) {
    if (stopped) {
      run.notChecked += 1;
      continue;
    }
    try {
      const details = await withDocusign(deps, parts, organisationId, (access) => parts.client.getEnvelope(access.accessToken, access.account, envelopeId));
      if (details.status !== 'completed' || !details.completedAt) {
        run.notCompleted += 1;
        continue;
      }
      const combined = await withDocusign(deps, parts, organisationId, (access) => parts.client.getDocument(access.accessToken, access.account, envelopeId, 'combined', maxBytes));
      let certificate: Buffer | null = null;
      try {
        certificate = await withDocusign(deps, parts, organisationId, (access) => parts.client.getDocument(access.accessToken, access.account, envelopeId, 'certificate', maxBytes));
      } catch (error) {
        if (!(error instanceof DocusignError) || error.kind === 'rate_limited' || error.kind === 'invalid_grant') throw error;
      }
      const fetchedAt = deps.now().toISOString();
      const short = envelopeId.slice(0, 8);
      const files: { part: 'signed_documents' | 'certificate_of_completion'; data: Buffer; name: string }[] = [];
      if (asPdf(combined)) files.push({ part: 'signed_documents', data: combined, name: `docusign-${short}-signed-documents.pdf` });
      const certificateOk = certificate !== null && asPdf(certificate);
      if (certificateOk && certificate) files.push({ part: 'certificate_of_completion', data: certificate, name: `docusign-${short}-certificate-of-completion.pdf` });

      let added = 0;
      for (const file of files) {
        const externalRef = `docusign:${setup.accountId}:${envelopeId}:${file.part}`;
        const [already] = await deps.db.withOrg(organisationId, (tx) =>
          tx.select({ id: document.id }).from(document).where(and(eq(document.companyId, companyId), eq(document.externalRef, externalRef))).limit(1),
        );
        if (already) continue;
        const origin: ConnectedDocumentOrigin = {
          kind: 'docusign',
          envelopeId,
          accountId: setup.accountId,
          accountName: setup.accountName,
          part: file.part,
          completedAt: details.completedAt,
          fetchedAt,
          statement: completionStatement(details.completedAt),
        };
        await addConnectedDocument(deps, { organisationId, companyId, data: file.data, fileName: file.name, mime: 'application/pdf', source: 'docusign', origin, externalRef, auditAction: 'document.added_from_docusign' });
        added += 1;
      }
      run.documentsAdded += added;
      if (certificateOk) run.certificates += 1;
      await deps.db.withOrg(organisationId, (tx) =>
        tx
          .insert(docusignEnvelopePull)
          .values({ organisationId, companyId, accountId: setup.accountId, envelopeId, completedAt: new Date(details.completedAt as string), signerCount: details.signerCount, certificateRetrieved: certificateOk, documentsAdded: added, pulledBy: payload.requestedBy })
          .onConflictDoUpdate({
            target: [docusignEnvelopePull.organisationId, docusignEnvelopePull.companyId, docusignEnvelopePull.envelopeId],
            set: { completedAt: new Date(details.completedAt as string), signerCount: details.signerCount, certificateRetrieved: certificateOk, pulledAt: deps.now() },
          }),
      );
      run.pulled += 1;
    } catch (error) {
      if (!(error instanceof DocusignError)) throw error;
      if (error.kind === 'too_large') run.tooLarge += 1;
      else run.failed += 1;
      if (error.kind === 'rate_limited' || error.kind === 'invalid_grant') stopped = error;
    }
  }

  if (run.pulled > 0) await rebuildDocusignFacts(deps, organisationId, companyId, setup.accountId);
  const stop: DocusignError | null = stopped;
  await deps.db.withOrg(organisationId, async (tx) => {
    const lastError = stop ? (stop.kind === 'invalid_grant' ? DOCUSIGN_ACCESS_ENDED : stop.message) : null;
    await tx.update(docusignConnection).set({ lastPulledAt: deps.now(), ...(stop?.kind === 'invalid_grant' ? {} : { lastError }) }).where(eq(docusignConnection.id, setup.id));
    // Counts only: never a token, a name, an email or a subject.
    await writeAudit(tx, { organisationId, actorId: payload.requestedBy, action: 'docusign.pulled', target: companyId, metadata: { ...run, stoppedBy: stop?.kind ?? null } });
  });
  return run;
}

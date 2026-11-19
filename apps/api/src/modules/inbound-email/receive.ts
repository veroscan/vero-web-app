import type { ConnectedDocumentOrigin } from '@vero/shared';
import { and, eq, sql } from 'drizzle-orm';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError } from '../../http/errors';
import { writeAudit } from '../audit/service';
import { entitlementsOf } from '../plans/service';
import { cleanFileName, inspectFile, inspectTextFile, MAX_CONNECTED_TEXT_BYTES } from '../vault/files';
import { addConnectedDocument } from '../vault/service';
import { ResendError, ResendReceivingClient, type ReceivedAttachment } from './resend';

const { inboundEmailAddress, document } = schema;

/** What the vault's reader takes: PDF, PNG, JPEG and plain text. Word files are not taken by email. */
type Kind = 'pdf' | 'png' | 'jpeg' | 'text';
const EXTENSION: Record<Kind, string> = { pdf: 'pdf', png: 'png', jpeg: 'jpg', text: 'txt' };
const MIME: Record<Kind, string> = { pdf: 'application/pdf', png: 'image/png', jpeg: 'image/jpeg', text: 'text/plain' };

/** What the email says the attachment is. Only a first filter: the content decides in the end. */
function claimedKind(attachment: ReceivedAttachment): Kind | null {
  const type = attachment.contentType?.split(';')[0]?.trim() ?? '';
  const extension = attachment.filename?.split('.').pop()?.toLowerCase() ?? '';
  if (type === 'application/pdf' || extension === 'pdf') return 'pdf';
  if (type === 'image/png' || extension === 'png') return 'png';
  if (type === 'image/jpeg' || type === 'image/jpg' || extension === 'jpg' || extension === 'jpeg') return 'jpeg';
  if (type === 'text/plain' || extension === 'txt') return 'text';
  return null;
}

/** The content's own answer, or null when it isn't one of the four kinds or fails the upload checks. */
function actualKind(data: Buffer, claimed: Kind): Kind | null {
  try {
    if (claimed === 'text') return inspectTextFile(data, 'attachment.txt').mime === 'text/plain' ? 'text' : null;
    const mime = inspectFile(data).mime;
    return mime === 'application/pdf' ? 'pdf' : mime === 'image/png' ? 'png' : mime === 'image/jpeg' ? 'jpeg' : null;
  } catch (error) {
    if (error instanceof AppError) return null;
    throw error;
  }
}

function fileNameFor(attachment: ReceivedAttachment, kind: Kind, index: number): string {
  let name: string;
  try {
    name = attachment.filename ? cleanFileName(attachment.filename) : '';
  } catch {
    name = '';
  }
  if (!name) name = `forwarded-file-${index + 1}`;
  const extension = name.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined;
  const fits = kind === 'jpeg' ? extension === 'jpg' || extension === 'jpeg' : extension === EXTENSION[kind];
  return fits ? name : `${name.slice(0, 190)}.${EXTENSION[kind]}`;
}

export interface InboundEmailRun {
  attachments: number;
  added: number;
  skippedType: number;
  skippedSize: number;
  skippedCount: number;
  skippedDailyCap: number;
  skippedTotal: number;
  failed: number;
}

/**
 * The inbound-email.receive job. Reads only the attachment list of one received email (never
 * its body or headers), takes the PDF, PNG, JPEG and plain-text files within the caps, and puts
 * each in the vault as an unconfirmed document. The sender isn't trusted and gets no reply.
 */
export async function runInboundEmail(
  deps: AppDeps,
  payload: { organisationId: string; addressId: string; emailId: string; receivedAt: string; senderDomain: string | null },
): Promise<InboundEmailRun | null> {
  const config = deps.config.inboundEmail;
  if (!config) return null;
  const { organisationId } = payload;
  const setup = await deps.db.withOrg(organisationId, async (tx) => {
    const [address] = await tx.select().from(inboundEmailAddress).where(and(eq(inboundEmailAddress.id, payload.addressId), eq(inboundEmailAddress.status, 'active')));
    if (!address) return null;
    return { address, vault: (await entitlementsOf(tx, organisationId, deps.config)).vault };
  });
  if (!setup) return null;
  const { address } = setup;

  const run: InboundEmailRun = { attachments: 0, added: 0, skippedType: 0, skippedSize: 0, skippedCount: 0, skippedDailyCap: 0, skippedTotal: 0, failed: 0 };
  if (setup.vault) {
    const client = new ResendReceivingClient(config, { ...(deps.inboundEmailFetch ? { fetch: deps.inboundEmailFetch } : {}), timeoutMs: deps.config.connectorTimeoutMs });
    const listed = await client.listAttachments(payload.emailId, config.maxAttachments);
    run.attachments = listed.attachments.length;
    if (listed.more) run.skippedCount += 1;
    let total = 0;
    let capped = false;
    for (const [index, attachment] of listed.attachments.entries()) {
      const claimed = claimedKind(attachment);
      if (!claimed || !attachment.downloadUrl) {
        run.skippedType += 1;
        continue;
      }
      const limit = claimed === 'text' ? MAX_CONNECTED_TEXT_BYTES : deps.config.maxUploadBytes;
      if (attachment.size !== null && attachment.size > limit) {
        run.skippedSize += 1;
        continue;
      }
      if (attachment.size !== null && total + attachment.size > config.maxTotalBytes) {
        run.skippedTotal += 1;
        continue;
      }
      const externalRef = `email:${payload.emailId}:${attachment.id}`;
      const [already] = await deps.db.withOrg(organisationId, (tx) =>
        tx.select({ id: document.id }).from(document).where(and(eq(document.companyId, address.companyId), eq(document.externalRef, externalRef))).limit(1),
      );
      if (already) continue;
      if (capped || !(await deps.limiter.hit(`inbound-email:documents:org:${organisationId}`, config.maxDocumentsPerOrgPerDay, 24 * 60 * 60)).allowed) {
        capped = true;
        run.skippedDailyCap += 1;
        continue;
      }
      let data: Buffer;
      try {
        data = await client.download(attachment.downloadUrl, Math.min(limit, config.maxTotalBytes - total));
      } catch (error) {
        if (!(error instanceof ResendError)) throw error;
        if (error.kind === 'too_large') run.skippedSize += 1;
        else run.failed += 1;
        continue;
      }
      total += data.length;
      const kind = actualKind(data, claimed);
      if (!kind) {
        run.skippedType += 1;
        continue;
      }
      const origin: ConnectedDocumentOrigin = {
        kind: 'email',
        receivedAt: payload.receivedAt,
        senderDomain: payload.senderDomain,
        statement: `Emailed to your Vero forwarding address on ${payload.receivedAt.slice(0, 10)}. Anyone with the address can send to it, so check that this is yours.`,
      };
      await addConnectedDocument(deps, { organisationId, companyId: address.companyId, data, fileName: fileNameFor(attachment, kind, index), mime: MIME[kind], source: 'email', origin, externalRef, auditAction: 'document.added_from_email' });
      run.added += 1;
    }
  }

  await deps.db.withOrg(organisationId, async (tx) => {
    await tx
      .update(inboundEmailAddress)
      .set({ lastReceivedAt: new Date(payload.receivedAt), receivedCount: sql`${inboundEmailAddress.receivedCount} + 1` })
      .where(eq(inboundEmailAddress.id, address.id));
    // Counts only: never the sender, the subject, the body, a file name or the address.
    await writeAudit(tx, { organisationId, action: 'inbound_email.received', target: address.id, metadata: { ...run, vault: setup.vault } });
  });
  return run;
}

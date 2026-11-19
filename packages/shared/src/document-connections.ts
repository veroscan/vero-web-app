import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './common';
import { googleDriveDocumentOriginSchema, sharepointDocumentOriginSchema } from './file-pickers';

/**
 * DocuSign and forwarding by email. Both bring files into the vault as unconfirmed documents
 * for a person to confirm. Neither ever says a document is genuine, validly signed or legally
 * sufficient, and neither earns a verified badge.
 */
export const DOCUSIGN_EVIDENCE_NOTICE =
  "What we bring in from DocuSign is evidence for a person to confirm. DocuSign's own record says when an envelope was completed; that is not a check that a document is genuine, validly signed or legally sufficient, and it is never a verified result.";

export const EMAIL_EVIDENCE_NOTICE =
  'Anyone who learns this address can send files to it, so every file that arrives waits for a person to confirm it. We keep only the attachments, the date and the sender\'s domain: never the message, its subject or the full sender address. Nothing in an email is treated as an instruction, and we never reply to senders.';

/** DocuSign envelope ids are GUIDs. */
export const docusignEnvelopeIdSchema = z.string().regex(/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/, { error: 'That is not a DocuSign envelope id.' });

export const DOCUSIGN_CONNECTION_STATUSES = ['not_available', 'not_connected', 'active', 'revoked'] as const;

export const docusignConnectionSchema = z.object({
  status: z.enum(DOCUSIGN_CONNECTION_STATUSES),
  message: z.string(),
  account: z.object({ id: z.string(), name: z.string().nullable() }).nullable(),
  environment: z.enum(['demo', 'production']).nullable(),
  connectedAt: isoDateTimeSchema.nullable(),
  lastPulledAt: isoDateTimeSchema.nullable(),
  lastError: z.string().nullable(),
  maxEnvelopesPerPull: z.number().int(),
  notice: z.string(),
});
export type DocusignConnection = z.infer<typeof docusignConnectionSchema>;

export const docusignStartResponseSchema = z.object({
  status: z.enum(['ready', 'not_available']),
  message: z.string(),
  /** DocuSign's own sign-in page. Null when the feature is off. */
  authorizeUrl: z.string().nullable(),
  expiresAt: isoDateTimeSchema.nullable(),
});
export type DocusignStartResponse = z.infer<typeof docusignStartResponseSchema>;

export const docusignCallbackQuerySchema = z.object({
  code: z.string().min(1).max(4000).optional(),
  state: z.string().min(20).max(1000),
  /** DocuSign sends this instead of a code when the person said no. */
  error: z.string().max(100).optional(),
});

export const docusignEnvelopeSchema = z.object({
  envelopeId: z.string(),
  /** DocuSign's subject line, shown only so the person can pick. Never stored by us. */
  subject: z.string().nullable(),
  completedAt: isoDateTimeSchema.nullable(),
  alreadyPulled: z.boolean(),
});
export type DocusignEnvelope = z.infer<typeof docusignEnvelopeSchema>;

export const docusignEnvelopeListResponseSchema = z.object({
  envelopes: z.array(docusignEnvelopeSchema),
  /** False when there were more completed envelopes than we list at once. */
  complete: z.boolean(),
  message: z.string(),
  notice: z.string(),
});
export type DocusignEnvelopeListResponse = z.infer<typeof docusignEnvelopeListResponseSchema>;

export const docusignPullBodySchema = z.object({
  companyId: uuidSchema,
  envelopeIds: z.array(docusignEnvelopeIdSchema).min(1, { error: 'Pick at least one envelope.' }).max(100, { error: 'That is too many envelopes.' }),
});
export type DocusignPullBody = z.infer<typeof docusignPullBodySchema>;

export const docusignPullResponseSchema = z.object({ queued: z.boolean(), message: z.string() });
export type DocusignPullResponse = z.infer<typeof docusignPullResponseSchema>;

export const INBOUND_EMAIL_STATUSES = ['not_available', 'not_set_up', 'active', 'revoked'] as const;

export const inboundEmailStatusSchema = z.object({
  status: z.enum(INBOUND_EMAIL_STATUSES),
  message: z.string(),
  companyId: uuidSchema.nullable(),
  /** The last four characters of the live address, to recognise it by. */
  hint: z.string().nullable(),
  createdAt: isoDateTimeSchema.nullable(),
  lastReceivedAt: isoDateTimeSchema.nullable(),
  receivedCount: z.number().int(),
  /** The full address, only in the answer that created it. It is never shown again. */
  address: z.string().nullable(),
  notice: z.string(),
});
export type InboundEmailStatus = z.infer<typeof inboundEmailStatusSchema>;

export const inboundEmailCreateBodySchema = z.object({
  /** The company the forwarded files are evidence for. */
  companyId: uuidSchema,
});
export type InboundEmailCreateBody = z.infer<typeof inboundEmailCreateBodySchema>;

/** Where a vault document from DocuSign, the forwarding address, Google Drive or SharePoint came from. */
export const connectedDocumentOriginSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('docusign'),
    envelopeId: z.string(),
    accountId: z.string(),
    accountName: z.string().nullable(),
    part: z.enum(['signed_documents', 'certificate_of_completion']),
    completedAt: isoDateTimeSchema,
    fetchedAt: isoDateTimeSchema,
    /** "DocuSign's own record says this envelope was completed on <date>." Never more than that. */
    statement: z.string(),
  }),
  z.object({
    kind: z.literal('email'),
    receivedAt: isoDateTimeSchema,
    /** The sender's domain only, as the email claimed it. Not checked, and never the full address. */
    senderDomain: z.string().nullable(),
    statement: z.string(),
  }),
  googleDriveDocumentOriginSchema,
  sharepointDocumentOriginSchema,
]);
export type ConnectedDocumentOrigin = z.infer<typeof connectedDocumentOriginSchema>;

import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './common';
import { SLOT_STATES, type SlotState } from './constants';
import { isoDateSchema } from './product';
import { githubDocumentOriginSchema } from './connections';
import { connectedDocumentOriginSchema } from './document-connections';

export const DOCUMENT_STATUSES = ['pending', 'processing', 'needs_confirmation', 'filed', 'rejected', 'failed'] as const;
export const SIGNATURE_HINTS = ['looks_signed', 'looks_unsigned', 'unknown'] as const;

/** What a slot shows (SLOT_STATES, in constants.ts). The words come with it, so every screen says the same thing. */

export const SLOT_STATE_WORDS: Record<SlotState, string> = {
  // Nothing on file isn't held against anyone until they say they don't have it.
  missing: 'Not checked yet',
  declared_missing: "You don't have this",
  reading: 'Reading it',
  needs_confirmation: 'Is this right?',
  read: 'We read it',
  not_accepted: 'Not accepted',
};

/** What the document helper may read from a file. Each one is a suggestion for a person. */
export const DOCUMENT_HELPER_FIELD_KINDS = ['document_title', 'party', 'date', 'signatory', 'jurisdiction'] as const;

/** Shown with anything the document helper read. It never checks a document is genuine. */
export const DOCUMENT_HELPER_NOTICE =
  'Suggested, please confirm. This reading is not a check that the document is genuine, signed or legally sufficient.';

export const documentHelperReadingSchema = z.object({
  suggestedBy: z.enum(['heuristic', 'assistant']),
  notice: z.string(),
  fields: z.array(z.object({ kind: z.enum(DOCUMENT_HELPER_FIELD_KINDS), value: z.string(), evidence: z.string() })),
  concerns: z.array(z.string()),
  /** Set when the file couldn't be read automatically, in plain words. */
  unread: z.string().nullable(),
});
export type DocumentHelperReading = z.infer<typeof documentHelperReadingSchema>;

export const documentSchema = z.object({
  id: uuidSchema,
  companyId: uuidSchema,
  fileName: z.string().nullable(),
  mime: z.string().nullable(),
  sizeBytes: z.number().int().nullable(),
  pages: z.number().int().nullable(),
  status: z.enum(DOCUMENT_STATUSES),
  state: z.enum(SLOT_STATES),
  stateWord: z.string(),
  slotKey: z.string().nullable(),
  slotLabel: z.string().nullable(),
  /** What the classifier thinks this is. Always confirmed by a person, and never a view on sufficiency. */
  suggestion: z.object({ slotKey: z.string().nullable(), label: z.string().nullable(), confidence: z.number().min(0).max(1) }).nullable(),
  /** Only a hint. A person has the last word. */
  signatureHint: z.enum(SIGNATURE_HINTS),
  signatureHintWords: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  documentDate: z.string().nullable(),
  expiresOn: z.string().nullable(),
  validated: z.boolean(),
  uploadedAt: isoDateTimeSchema,
  /** Only when the organisation uses the document helper. Suggestions only, never a decision. */
  documentHelper: documentHelperReadingSchema.optional(),
  /** Only for a document read from a connected GitHub repository. It still needs a person to confirm it. */
  fromGithub: githubDocumentOriginSchema.optional(),
  /** Only for a document brought in from DocuSign or the forwarding address. It still needs a person to confirm it. */
  fromConnection: connectedDocumentOriginSchema.optional(),
});
export type VaultDocument = z.infer<typeof documentSchema>;

export const vaultSlotSchema = z.object({
  key: z.string(),
  label: z.string(),
  reason: z.string(),
  layer: z.number().int(),
  layerName: z.string(),
  jurisdiction: z.string(),
  expires: z.boolean(),
  state: z.enum(SLOT_STATES),
  stateWord: z.string(),
  documentId: uuidSchema.nullable(),
  ruleKeys: z.array(z.string()),
});
export type VaultSlotView = z.infer<typeof vaultSlotSchema>;

export const vaultResponseSchema = z.object({
  companyId: uuidSchema,
  /** False on Free: the slots show, but nothing can be uploaded. */
  canUpload: z.boolean(),
  slots: z.array(vaultSlotSchema),
  documents: z.array(documentSchema),
  filledCount: z.number().int(),
  totalCount: z.number().int(),
});
export type VaultResponse = z.infer<typeof vaultResponseSchema>;

export const uploadQuerySchema = z.object({
  fileName: z
    .string({ error: 'The file needs a name.' })
    .min(1, { error: 'The file needs a name.' })
    .max(300, { error: 'That file name is too long.' }),
  slotKey: z.string().regex(/^[a-z0-9_]+$/, { error: 'That document slot does not exist.' }).max(100).optional(),
});

/** The raw file. Sent as application/octet-stream. */
export const uploadBodySchema = z.instanceof(Uint8Array, { error: 'Choose a file to upload.' });

export const documentParamsSchema = z.object({ documentId: uuidSchema });

export const confirmDocumentBodySchema = z.object({
  slotKey: z.string({ error: 'Choose where this document goes.' }).regex(/^[a-z0-9_]+$/, { error: 'That document slot does not exist.' }).max(100),
  documentDate: isoDateSchema.optional(),
  expiresOn: isoDateSchema.optional(),
  /** The person checked this certificate themselves, for example on Delaware's website. */
  validated: z.boolean().optional(),
  /** The person says it is signed, whatever our hint thought. */
  confirmSigned: z.boolean().optional(),
});
export type ConfirmDocumentBody = z.infer<typeof confirmDocumentBodySchema>;

export const documentDownloadResponseSchema = z.object({ url: z.string(), expiresAt: isoDateTimeSchema });

export const VAULT_PROVIDERS = ['gdrive', 'notion'] as const;
export const vaultProviderParamsSchema = z.object({
  provider: z.enum(VAULT_PROVIDERS, { error: 'We do not connect to that yet.' }),
});
export const vaultConnectionSchema = z.object({
  provider: z.enum(VAULT_PROVIDERS),
  name: z.string(),
  /** Google Drive reports its real connection; the others say not connected until they are built. */
  status: z.enum(['not_connected', 'active', 'revoked']),
  message: z.string(),
});
export const vaultConnectionListResponseSchema = z.object({ connections: z.array(vaultConnectionSchema) });

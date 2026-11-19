import { z } from 'zod';
import { isoDateTimeSchema, paginationQuerySchema, uuidSchema } from './common';

export const auditEntrySchema = z.object({
  id: uuidSchema,
  actorId: uuidSchema.nullable(),
  action: z.string(),
  target: z.string().nullable(),
  ip: z.string().nullable(),
  userAgent: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: isoDateTimeSchema,
});
export type AuditEntry = z.infer<typeof auditEntrySchema>;

export const auditListQuerySchema = paginationQuerySchema;

export const auditListResponseSchema = z.object({
  entries: z.array(auditEntrySchema),
  /** Pass back as `cursor` to read older entries. Null on the last page. */
  nextCursor: z.string().nullable(),
});
export type AuditListResponse = z.infer<typeof auditListResponseSchema>;

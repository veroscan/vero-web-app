import { schema, type Tx } from '../../db';
import type { RequestMeta } from '../../http/route';

export interface AuditEntry {
  organisationId?: string | null;
  actorId?: string | null;
  action: string;
  target?: string | null;
  metadata?: Record<string, unknown>;
  meta?: RequestMeta;
}

/**
 * Records a security-relevant event in the caller's transaction, so the record and the
 * change commit together. Never pass tokens, document content or email addresses:
 * use ids, or `secrets.hmac` for an email.
 */
export async function writeAudit(tx: Tx, entry: AuditEntry): Promise<void> {
  await tx.insert(schema.auditLog).values({
    organisationId: entry.organisationId ?? null,
    actorId: entry.actorId ?? null,
    action: entry.action,
    target: entry.target ?? null,
    ip: entry.meta?.ip ?? null,
    userAgent: entry.meta?.userAgent ?? null,
    metadata: entry.metadata ?? {},
  });
}

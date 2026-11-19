import type { CompanyRelationship } from '@vero/shared';
import { eq } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import { AppError, errors } from '../../http/errors';

/**
 * Own and follow (owner's decision, 19 Nov 2026). Anyone can follow any company and see its
 * public record. Only the team that owns it can answer questions, add or remove documents,
 * say "we don't have this", mark deadlines, take the badge or make a share link.
 */

export const FOLLOWS_ONLY_MESSAGE = "You follow this company, so you can see its public record but can't add evidence for it.";

export function followsOnly(): AppError {
  return new AppError(403, 'follows_only', FOLLOWS_ONLY_MESSAGE);
}

export function relationshipOf(row: { relationship: string }): CompanyRelationship {
  return row.relationship === 'follow' ? 'follow' : 'own';
}

export function isOwned(row: { relationship: string }): boolean {
  return relationshipOf(row) === 'own';
}

/** Refuses anything that adds or changes evidence for a company this team only follows. */
export function requireOwned(row: { relationship: string }): void {
  if (!isOwned(row)) throw followsOnly();
}

/**
 * The same, by id, for routes that haven't loaded the company yet. Row-level security keeps it
 * inside the organisation, so another tenant's company is "not found", as everywhere else.
 */
export async function requireOwnedCompany(tx: Tx, companyId: string): Promise<void> {
  const [row] = await tx.select({ relationship: schema.company.relationship }).from(schema.company).where(eq(schema.company.id, companyId));
  if (!row) throw errors.notFound('That company');
  requireOwned(row);
}

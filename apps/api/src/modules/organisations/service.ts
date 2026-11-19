import { randomUUID } from 'node:crypto';
import type { Role } from '@vero/shared';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { enterOrg, schema, type Tx } from '../../db';
import { hashToken } from '../../lib/crypto';
import { writeAudit } from '../audit/service';
import { createNotification } from '../notifications/service';

const ORG_TOKEN_PATTERN = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.([A-Za-z0-9_-]{20,})$/;

/**
 * Invitation links carry the organisation id next to the secret. That lets the lookup run
 * inside that tenant's context rather than bypassing row-level security. A forged id just
 * finds no matching hash.
 */
export function parseInvitationToken(token: string): { organisationId: string; tokenHash: string } | null {
  const match = ORG_TOKEN_PATTERN.exec(token);
  if (!match?.[1]) return null;
  return { organisationId: match[1], tokenHash: hashToken(token) };
}

/** Every new person with no invitation gets their own organisation, with them as owner. */
export async function createPersonalOrganisation(tx: Tx, userId: string): Promise<string> {
  const organisationId = randomUUID();
  await enterOrg(tx, organisationId);
  await tx.insert(schema.organisation).values({ id: organisationId, name: 'My organisation' });
  await tx.insert(schema.membership).values({ organisationId, userId, role: 'owner' });
  await writeAudit(tx, { organisationId, actorId: userId, action: 'organisation.created', target: organisationId });
  return organisationId;
}

export type AcceptResult =
  | { status: 'accepted'; role: Role }
  | { status: 'invalid' }
  | { status: 'wrong_email' }
  | { status: 'already_member' };

/**
 * Accepts in one atomic step, so a link works exactly once. The caller's transaction must
 * already be in the invitation's tenant context.
 */
export async function acceptInvitationInTx(
  tx: Tx,
  input: { organisationId: string; tokenHash: string; userId: string; email: string; now: Date },
): Promise<AcceptResult> {
  const { invitation, membership } = schema;
  const [found] = await tx
    .select({ email: invitation.email })
    .from(invitation)
    .where(
      and(
        eq(invitation.tokenHash, input.tokenHash),
        isNull(invitation.acceptedAt),
        isNull(invitation.revokedAt),
        gt(invitation.expiresAt, input.now),
      ),
    );
  if (!found) return { status: 'invalid' };
  if (found.email !== input.email) return { status: 'wrong_email' };

  const [claimed] = await tx
    .update(invitation)
    .set({ acceptedAt: input.now, acceptedBy: input.userId })
    .where(and(eq(invitation.tokenHash, input.tokenHash), isNull(invitation.acceptedAt)))
    .returning({ role: invitation.role, invitedBy: invitation.invitedBy, id: invitation.id });
  if (!claimed) return { status: 'invalid' };

  const inserted = await tx
    .insert(membership)
    .values({ organisationId: input.organisationId, userId: input.userId, role: claimed.role })
    .onConflictDoNothing()
    .returning({ id: membership.id });
  if (inserted.length === 0) return { status: 'already_member' };

  await writeAudit(tx, {
    organisationId: input.organisationId,
    actorId: input.userId,
    action: 'invitation.accepted',
    target: claimed.id,
    metadata: { role: claimed.role },
  });
  if (claimed.invitedBy) {
    await createNotification(tx, {
      organisationId: input.organisationId,
      userId: claimed.invitedBy,
      kind: 'team',
      title: 'Someone accepted your invitation',
      body: 'A new person has joined your team.',
    });
  }
  return { status: 'accepted', role: claimed.role as Role };
}

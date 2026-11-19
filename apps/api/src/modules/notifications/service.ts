import type { NotificationKind } from '@vero/shared';
import { eq, inArray } from 'drizzle-orm';
import { schema, type Tx } from '../../db';

export interface NewNotification {
  organisationId: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  link?: string;
  /** The same key never makes a second notification for the same person. */
  dedupeKey?: string;
}

/** Adds an in-app notification in the caller's tenant transaction. */
export async function createNotification(tx: Tx, notification: NewNotification): Promise<void> {
  await tx.insert(schema.notification).values({
    organisationId: notification.organisationId,
    userId: notification.userId,
    kind: notification.kind,
    title: notification.title,
    body: notification.body ?? null,
    link: notification.link ?? null,
    dedupeKey: notification.dedupeKey ?? null,
  }).onConflictDoNothing();
}

/** Tells the people who run an organisation. Runs in the caller's tenant transaction. */
export async function notifyOrganisation(
  tx: Tx,
  organisationId: string,
  notification: Omit<NewNotification, 'organisationId' | 'userId'>,
): Promise<void> {
  const people = await tx
    .select({ userId: schema.membership.userId })
    .from(schema.membership)
    .where(inArray(schema.membership.role, ['owner', 'admin']));
  for (const person of people) {
    await createNotification(tx, { ...notification, organisationId, userId: person.userId });
  }
}

export async function notifyUser(tx: Tx, organisationId: string, userId: string, notification: Omit<NewNotification, 'organisationId' | 'userId'>): Promise<void> {
  const [member] = await tx.select({ id: schema.membership.id }).from(schema.membership).where(eq(schema.membership.userId, userId));
  if (member) await createNotification(tx, { ...notification, organisationId, userId });
}

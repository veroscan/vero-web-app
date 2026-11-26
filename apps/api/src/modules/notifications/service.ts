import type { EmailNotificationTopic, NotificationKind, NotificationPreferences } from '@vero/shared';
import { and, eq, inArray } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';

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

/**
 * An email owed for a notification that was really created. Collected inside the tenant
 * transaction and sent only after it commits (sendNoticeEmails), so nobody is emailed about
 * something that was rolled back.
 */
export interface NoticeEmail {
  organisationId: string;
  to: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  link: string | null;
}

type PreferenceRow = typeof schema.notificationPreference.$inferSelect;

const TOPIC_OF: Readonly<Record<NotificationKind, EmailNotificationTopic>> = { deadline: 'deadline', score: 'score', team: 'team', lawyer: 'lookup', system: 'system' };

/** A person's email choices. No row means every kind is on. */
export function preferencesOf(row: PreferenceRow | undefined): NotificationPreferences {
  return {
    email: {
      deadline: row?.emailDeadline ?? true,
      score: row?.emailScore ?? true,
      team: row?.emailTeam ?? true,
      lookup: row?.emailLookup ?? true,
      system: row?.emailSystem ?? true,
    },
  };
}

/** Of these people, the ones who haven't switched email off for this kind of notification. */
export async function emailWanted(tx: Tx, userIds: readonly string[], kind: NotificationKind): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const rows = await tx.select().from(schema.notificationPreference).where(inArray(schema.notificationPreference.userId, [...userIds]));
  const chosen = new Map(rows.map((row) => [row.userId, row]));
  return new Set(userIds.filter((userId) => preferencesOf(chosen.get(userId)).email[TOPIC_OF[kind]]));
}

export async function loadPreferences(tx: Tx, userId: string): Promise<NotificationPreferences> {
  const [row] = await tx.select().from(schema.notificationPreference).where(eq(schema.notificationPreference.userId, userId));
  return preferencesOf(row);
}

export async function savePreferences(tx: Tx, organisationId: string, userId: string, email: Partial<NotificationPreferences['email']>): Promise<NotificationPreferences> {
  const next = { ...(await loadPreferences(tx, userId)).email, ...email };
  const values = { emailDeadline: next.deadline, emailScore: next.score, emailTeam: next.team, emailLookup: next.lookup, emailSystem: next.system };
  const updated = await tx
    .update(schema.notificationPreference)
    .set(values)
    .where(and(eq(schema.notificationPreference.organisationId, organisationId), eq(schema.notificationPreference.userId, userId)))
    .returning({ userId: schema.notificationPreference.userId });
  if (updated.length === 0) await tx.insert(schema.notificationPreference).values({ organisationId, userId, ...values }).onConflictDoUpdate({ target: [schema.notificationPreference.organisationId, schema.notificationPreference.userId], set: values });
  return { email: next };
}

/** Adds an in-app notification in the caller's tenant transaction. False when its dedupe key was already used. */
export async function createNotification(tx: Tx, notification: NewNotification): Promise<boolean> {
  const rows = await tx
    .insert(schema.notification)
    .values({
      organisationId: notification.organisationId,
      userId: notification.userId,
      kind: notification.kind,
      title: notification.title,
      body: notification.body ?? null,
      link: notification.link ?? null,
      dedupeKey: notification.dedupeKey ?? null,
    })
    .onConflictDoNothing()
    .returning({ id: schema.notification.id });
  return rows.length > 0;
}

/**
 * Tells the given people, once each, and returns the emails owed: one for each person who really
 * got a new notification and hasn't switched email off for that kind. A repeat (same dedupe key)
 * owes nothing, so an email is sent once only. The in-app notification is always made.
 */
export async function notifyPeople(
  tx: Tx,
  organisationId: string,
  userIds: readonly string[],
  notification: Omit<NewNotification, 'organisationId' | 'userId'>,
): Promise<NoticeEmail[]> {
  const told: string[] = [];
  for (const userId of userIds) {
    if (await createNotification(tx, { ...notification, organisationId, userId })) told.push(userId);
  }
  const wanted = [...(await emailWanted(tx, told, notification.kind))];
  if (wanted.length === 0) return [];
  const people = await tx.select({ id: schema.user.id, email: schema.user.email }).from(schema.user).where(inArray(schema.user.id, wanted));
  return people.map((person) => ({
    organisationId,
    to: person.email,
    kind: notification.kind,
    title: notification.title,
    body: notification.body ?? null,
    link: notification.link ?? null,
  }));
}

/** The people who run an organisation: its owners and admins. */
export async function organisationLeads(tx: Tx): Promise<string[]> {
  const people = await tx
    .select({ userId: schema.membership.userId })
    .from(schema.membership)
    .where(inArray(schema.membership.role, ['owner', 'admin']));
  return people.map((person) => person.userId);
}

/**
 * Tells the people who run an organisation. Runs in the caller's tenant transaction. The emails
 * owed come back for the caller to send after its transaction commits; ignoring them sends none.
 */
export async function notifyOrganisation(
  tx: Tx,
  organisationId: string,
  notification: Omit<NewNotification, 'organisationId' | 'userId'>,
): Promise<NoticeEmail[]> {
  return notifyPeople(tx, organisationId, await organisationLeads(tx), notification);
}

export async function notifyUser(tx: Tx, organisationId: string, userId: string, notification: Omit<NewNotification, 'organisationId' | 'userId'>): Promise<void> {
  const [member] = await tx.select({ id: schema.membership.id }).from(schema.membership).where(eq(schema.membership.userId, userId));
  if (member) await createNotification(tx, { ...notification, organisationId, userId });
}

/** Only our own paths become links: a notification's link is always one, and anything else is left out. */
function linkFor(webBaseUrl: string, link: string | null): string {
  return link && link.startsWith('/') && !link.startsWith('//') ? `${webBaseUrl}${link}` : `${webBaseUrl}/notifications`;
}

/**
 * Sends the emails owed, after the transaction that created the notifications has committed.
 * The in-app notification is already saved, so a mail provider that's down costs only the email.
 */
export async function sendNoticeEmails(deps: Pick<AppDeps, 'mailer' | 'config'>, notices: readonly NoticeEmail[]): Promise<number> {
  let sent = 0;
  for (const notice of notices) {
    const link = linkFor(deps.config.webBaseUrl, notice.link);
    const text = [notice.title, ...(notice.body ? ['', notice.body] : []), '', `See it in Vero: ${link}`, '', 'You can choose which emails you get in Settings, under Notifications.'].join('\n');
    const ok = await deps.mailer
      .send({ to: notice.to, subject: notice.title, text, template: `notification-${notice.kind === 'lawyer' ? 'lookup' : notice.kind}`, organisationId: notice.organisationId })
      .then(() => true)
      .catch(() => false);
    if (ok) sent += 1;
  }
  return sent;
}

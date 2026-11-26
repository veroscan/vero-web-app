import { z } from 'zod';
import { isoDateTimeSchema, paginationQuerySchema, uuidSchema } from './common';
import { NOTIFICATION_KINDS } from './constants';

export const notificationSchema = z.object({
  id: uuidSchema,
  kind: z.enum(NOTIFICATION_KINDS),
  title: z.string(),
  body: z.string().nullable(),
  link: z.string().nullable(),
  readAt: isoDateTimeSchema.nullable(),
  createdAt: isoDateTimeSchema,
});
export type Notification = z.infer<typeof notificationSchema>;

export const notificationListQuerySchema = paginationQuerySchema.extend({
  kind: z.enum(NOTIFICATION_KINDS, { error: 'That kind of notification does not exist.' }).optional(),
  unreadOnly: z
    .enum(['true', 'false'], { error: 'unreadOnly must be true or false.' })
    .optional()
    .transform((value) => value === 'true'),
});

export const notificationListResponseSchema = z.object({
  notifications: z.array(notificationSchema),
  unreadCount: z.number().int().min(0),
  nextCursor: z.string().nullable(),
});
export type NotificationListResponse = z.infer<typeof notificationListResponseSchema>;

/**
 * Which kinds of notification also send an email. "lookup" is updates on a company we were asked
 * to look up by hand. Sign-in links and invitations aren't notifications and are always sent.
 */
export const EMAIL_NOTIFICATION_TOPICS = ['deadline', 'score', 'team', 'lookup', 'system'] as const;
export type EmailNotificationTopic = (typeof EMAIL_NOTIFICATION_TOPICS)[number];

const emailChoice = z.boolean({ error: 'Each email choice is on or off.' });

export const notificationPreferencesSchema = z.object({
  email: z.object({
    /** Reminders about dates coming up. */
    deadline: z.boolean(),
    /** Results and changes: a re-check found something, a score band or status changed. */
    score: z.boolean(),
    team: z.boolean(),
    lookup: z.boolean(),
    system: z.boolean(),
  }),
});
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

/** Only the kinds sent are changed. */
export const updateNotificationPreferencesBodySchema = z.object({
  email: z
    .object({ deadline: emailChoice, score: emailChoice, team: emailChoice, lookup: emailChoice, system: emailChoice })
    .partial()
    .refine((email) => Object.keys(email).length > 0, { error: 'Nothing to change.' }),
});
export type UpdateNotificationPreferencesBody = z.infer<typeof updateNotificationPreferencesBodySchema>;

export const notificationParamsSchema = z.object({ notificationId: uuidSchema });

export const markAllReadResponseSchema = z.object({ updated: z.number().int().min(0) });
export type MarkAllReadResponse = z.infer<typeof markAllReadResponseSchema>;

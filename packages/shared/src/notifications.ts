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

export const notificationParamsSchema = z.object({ notificationId: uuidSchema });

export const markAllReadResponseSchema = z.object({ updated: z.number().int().min(0) });
export type MarkAllReadResponse = z.infer<typeof markAllReadResponseSchema>;

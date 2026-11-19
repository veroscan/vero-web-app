import { z } from 'zod';
import { ERROR_CODES } from './constants';

export const uuidSchema = z.uuid({ error: 'That is not a valid id.' });
export const isoDateTimeSchema = z.iso.datetime({ offset: true });

/** Emails are compared and stored lower-case, with surrounding spaces removed. */
export const emailSchema = z
  .string({ error: 'Enter your email address.' })
  .trim()
  .toLowerCase()
  .max(254, { error: 'That email address is too long.' })
  .pipe(z.email({ error: "That doesn't look like an email address yet." }));

export const okResponseSchema = z.object({ ok: z.literal(true) });
export type OkResponse = z.infer<typeof okResponseSchema>;

/** Standard error body. Every non-2xx JSON response has exactly this shape. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.enum(ERROR_CODES),
    message: z.string(),
    /** A finer reason, where one helps the screen. Today only for a sign-in link: used or expired. */
    reason: z.string().optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;

export const paginationQuerySchema = z.object({
  limit: z.coerce
    .number({ error: 'Limit must be a number.' })
    .int({ error: 'Limit must be a whole number.' })
    .min(1, { error: 'Limit must be at least 1.' })
    .max(100, { error: 'Limit cannot be more than 100.' })
    .default(50),
  cursor: z
    .string()
    .regex(/^\d{1,18}$/, { error: 'That page cursor is not valid.' })
    .optional(),
});

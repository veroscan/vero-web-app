import { z } from 'zod';
import { emailSchema, isoDateTimeSchema, uuidSchema } from './common';

const optionalText = (max: number, what: string) =>
  z
    .string()
    .trim()
    .max(max, { error: `${what} is too long.` })
    .optional()
    .transform((value) => (value ? value : undefined));

/**
 * The website's "Join the waitlist" form. It also sends a hidden `website` field that people never
 * fill in (bots do) and a recaptcha token; both are accepted and never stored.
 */
export const joinWaitlistBodySchema = z.object({
  email: emailSchema,
  name: z.string({ error: 'Enter your name.' }).trim().min(2, { error: 'Enter your name.' }).max(200, { error: 'That name is too long.' }),
  company: optionalText(300, 'The company name'),
  message: optionalText(4000, 'The message'),
  need: optionalText(200, 'That choice'),
  budget: optionalText(200, 'That choice'),
  website: z.string().max(500).optional(),
  recaptchaToken: z.string().max(4000).optional(),
});
export type JoinWaitlistBody = z.infer<typeof joinWaitlistBodySchema>;

export const waitlistEntrySchema = z.object({
  id: uuidSchema,
  email: z.string(),
  name: z.string(),
  company: z.string().nullable(),
  message: z.string().nullable(),
  need: z.string().nullable(),
  budget: z.string().nullable(),
  submissions: z.number().int(),
  invitedAt: isoDateTimeSchema.nullable(),
  createdAt: isoDateTimeSchema,
});
export type WaitlistEntry = z.infer<typeof waitlistEntrySchema>;

export const adminWaitlistQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adminWaitlistResponseSchema = z.object({
  entries: z.array(waitlistEntrySchema),
  total: z.number().int(),
  hasMore: z.boolean(),
});
export type AdminWaitlistResponse = z.infer<typeof adminWaitlistResponseSchema>;

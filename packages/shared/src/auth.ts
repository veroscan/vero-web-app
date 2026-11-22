import { z } from 'zod';
import { emailSchema, isoDateTimeSchema, uuidSchema } from './common';
import { ROLES } from './constants';

const totpCodeSchema = z
  .string({ error: 'Enter the 6-digit code from your authenticator app.' })
  .trim()
  .regex(/^\d{6}$/, { error: 'Enter the 6-digit code from your authenticator app.' });

export const requestMagicLinkBodySchema = z.object({
  email: emailSchema,
  /** Carried from an invitation email so a new person joins that team on first sign-in. */
  invitationToken: z.string().min(1).max(200).optional(),
  /** Sent by the Vero phone app: the link in the email then offers to open the app. */
  app: z.boolean().optional(),
});
export type RequestMagicLinkBody = z.infer<typeof requestMagicLinkBodySchema>;

export const verifyMagicLinkBodySchema = z.object({
  token: z
    .string({ error: 'This sign-in link is not valid.' })
    .min(20, { error: 'This sign-in link is not valid.' })
    .max(200, { error: 'This sign-in link is not valid.' }),
});
export type VerifyMagicLinkBody = z.infer<typeof verifyMagicLinkBodySchema>;

export const userSchema = z.object({
  id: uuidSchema,
  email: z.string(),
  name: z.string().nullable(),
  locale: z.string(),
  mfaEnabled: z.boolean(),
  createdAt: isoDateTimeSchema,
});
export type User = z.infer<typeof userSchema>;

export const userOrganisationSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  role: z.enum(ROLES),
  /** True for the fictional seed organisation. The UI must label it as a demo. */
  isDemo: z.boolean(),
});
export type UserOrganisation = z.infer<typeof userOrganisationSchema>;

export const signInResponseSchema = z.object({
  user: userSchema,
  /** When true the session only works for the TOTP challenge until a code is entered. */
  mfaRequired: z.boolean(),
  isNewUser: z.boolean(),
  activeOrganisationId: uuidSchema.nullable(),
  /**
   * Only for the phone app (requests marked `x-vero-client: mobile`). It keeps this in the device's
   * secure store and sends it as a Bearer token. Browsers get an HttpOnly cookie and never this.
   */
  sessionToken: z.string().optional(),
});
export type SignInResponse = z.infer<typeof signInResponseSchema>;

export const meResponseSchema = z.object({
  user: userSchema,
  activeOrganisationId: uuidSchema.nullable(),
  organisations: z.array(userOrganisationSchema),
});
export type MeResponse = z.infer<typeof meResponseSchema>;

export const updateMeBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: 'Enter your name.' })
      .max(120, { error: 'That name is too long.' })
      .optional(),
    locale: z
      .string()
      .regex(/^[a-z]{2}(-[A-Z]{2})?$/, { error: 'That language setting is not valid.' })
      .optional(),
  })
  .refine((body) => body.name !== undefined || body.locale !== undefined, {
    error: 'Nothing to change.',
  });
export type UpdateMeBody = z.infer<typeof updateMeBodySchema>;

export const totpEnrolResponseSchema = z.object({
  /** Base32 secret, shown once for manual entry. */
  secret: z.string(),
  /** otpauth:// URI for the QR code. */
  otpauthUri: z.string(),
});
export type TotpEnrolResponse = z.infer<typeof totpEnrolResponseSchema>;

export const totpCodeBodySchema = z.object({ code: totpCodeSchema });
export type TotpCodeBody = z.infer<typeof totpCodeBodySchema>;

export const mfaStatusResponseSchema = z.object({
  mfaEnabled: z.boolean(),
  /** Only when two-step sign-in has just been switched on: the ten one-time recovery codes, shown this once. */
  recoveryCodes: z.array(z.string()).optional(),
  /** How many unused recovery codes are left, after one was just used. */
  recoveryCodesLeft: z.number().int().optional(),
});

/** A recovery code, as shown: ten letters and digits, in two groups of five. Spaces, case and the dash don't matter. */
export const recoveryCodeBodySchema = z.object({
  code: z
    .string({ error: 'Enter one of your recovery codes.' })
    .transform((value) => value.replace(/[\s-]/g, '').toLowerCase())
    .pipe(z.string().regex(/^[a-z2-7]{10}$/, { error: "That isn't a recovery code. It has ten letters and numbers." })),
});
export const recoveryCodesResponseSchema = z.object({
  /** Shown once. Each works once, in place of a code from the app. Making new ones ends the old ones. */
  recoveryCodes: z.array(z.string()),
});
export type MfaStatusResponse = z.infer<typeof mfaStatusResponseSchema>;

export const deleteAccountBodySchema = z.object({
  /** The person types their own email to confirm. */
  confirmEmail: emailSchema,
  /** Required when two-step sign-in is on. */
  totpCode: totpCodeSchema.optional(),
});
export type DeleteAccountBody = z.infer<typeof deleteAccountBodySchema>;

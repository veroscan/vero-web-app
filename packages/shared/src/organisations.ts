import { z } from 'zod';
import { emailSchema, isoDateTimeSchema, uuidSchema } from './common';
import { ORGANISATION_TYPES, ROLES } from './constants';

export const roleSchema = z.enum(ROLES, { error: 'That role does not exist.' });

export const organisationSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  type: z.enum(ORGANISATION_TYPES),
  region: z.string().nullable(),
  isDemo: z.boolean(),
  /** The signed-in person's role in this organisation. */
  role: roleSchema,
  createdAt: isoDateTimeSchema,
});
export type Organisation = z.infer<typeof organisationSchema>;

export const organisationListResponseSchema = z.object({
  organisations: z.array(organisationSchema),
});
export type OrganisationListResponse = z.infer<typeof organisationListResponseSchema>;

export const updateOrganisationBodySchema = z.object({
  name: z
    .string({ error: 'Enter a name for your organisation.' })
    .trim()
    .min(1, { error: 'Enter a name for your organisation.' })
    .max(200, { error: 'That name is too long.' }),
});
export type UpdateOrganisationBody = z.infer<typeof updateOrganisationBodySchema>;

export const switchOrganisationBodySchema = z.object({ organisationId: uuidSchema });
export type SwitchOrganisationBody = z.infer<typeof switchOrganisationBodySchema>;

export const switchOrganisationResponseSchema = z.object({ activeOrganisationId: uuidSchema });
export type SwitchOrganisationResponse = z.infer<typeof switchOrganisationResponseSchema>;

export const memberSchema = z.object({
  userId: uuidSchema,
  email: z.string(),
  name: z.string().nullable(),
  role: roleSchema,
  joinedAt: isoDateTimeSchema,
});
export type Member = z.infer<typeof memberSchema>;

export const memberListResponseSchema = z.object({ members: z.array(memberSchema) });
export type MemberListResponse = z.infer<typeof memberListResponseSchema>;

export const memberParamsSchema = z.object({ userId: uuidSchema });
export const updateMemberBodySchema = z.object({ role: roleSchema });
export type UpdateMemberBody = z.infer<typeof updateMemberBodySchema>;

export const invitationSchema = z.object({
  id: uuidSchema,
  email: z.string(),
  role: roleSchema,
  invitedBy: uuidSchema.nullable(),
  expiresAt: isoDateTimeSchema,
  createdAt: isoDateTimeSchema,
});
export type Invitation = z.infer<typeof invitationSchema>;

export const invitationListResponseSchema = z.object({ invitations: z.array(invitationSchema) });
export type InvitationListResponse = z.infer<typeof invitationListResponseSchema>;

export const createInvitationBodySchema = z.object({
  email: emailSchema,
  role: roleSchema.default('member'),
});
export type CreateInvitationBody = z.input<typeof createInvitationBodySchema>;

export const invitationParamsSchema = z.object({ invitationId: uuidSchema });

export const acceptInvitationBodySchema = z.object({
  token: z
    .string({ error: 'This invitation link is not valid.' })
    .min(20, { error: 'This invitation link is not valid.' })
    .max(200, { error: 'This invitation link is not valid.' }),
});
export type AcceptInvitationBody = z.infer<typeof acceptInvitationBodySchema>;

export const acceptInvitationResponseSchema = z.object({
  organisationId: uuidSchema,
  role: roleSchema,
});
export type AcceptInvitationResponse = z.infer<typeof acceptInvitationResponseSchema>;

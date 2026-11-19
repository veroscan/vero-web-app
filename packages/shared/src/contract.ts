import type { z } from 'zod';
import {
  deleteAccountBodySchema,
  meResponseSchema,
  mfaStatusResponseSchema,
  recoveryCodeBodySchema,
  recoveryCodesResponseSchema,
  requestMagicLinkBodySchema,
  signInResponseSchema,
  totpCodeBodySchema,
  totpEnrolResponseSchema,
  updateMeBodySchema,
  verifyMagicLinkBodySchema,
} from './auth';
import { auditListQuerySchema, auditListResponseSchema } from './audit';
import { okResponseSchema } from './common';
import { billingRedirectResponseSchema, checkoutBodySchema, planListResponseSchema, setPlanBodySchema, setPlanParamsSchema, setPlanResponseSchema } from './plans';
import * as c from './connections';
import * as dc from './document-connections';
import * as fp from './file-pickers';
import * as p from './product';
import * as v from './vault';
import * as w from './watchlist';
import {
  companyListQuerySchema,
  companyListResponseSchema,
  companyParamsSchema,
  companySchema,
  createCompanyBodySchema,
  updateCompanyBodySchema,
} from './companies';
import {
  markAllReadResponseSchema,
  notificationListQuerySchema,
  notificationListResponseSchema,
  notificationParamsSchema,
  notificationSchema,
} from './notifications';
import {
  acceptInvitationBodySchema,
  acceptInvitationResponseSchema,
  createInvitationBodySchema,
  invitationListResponseSchema,
  invitationParamsSchema,
  invitationSchema,
  memberListResponseSchema,
  memberParamsSchema,
  memberSchema,
  organisationListResponseSchema,
  organisationSchema,
  switchOrganisationBodySchema,
  switchOrganisationResponseSchema,
  updateMemberBodySchema,
  updateOrganisationBodySchema,
} from './organisations';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** One API endpoint. Both the Fastify routes and the typed client are built from these. */
export interface Endpoint<
  TParams extends z.ZodType | undefined = z.ZodType | undefined,
  TQuery extends z.ZodType | undefined = z.ZodType | undefined,
  TBody extends z.ZodType | undefined = z.ZodType | undefined,
  TResponse extends z.ZodType = z.ZodType,
> {
  method: HttpMethod;
  path: string;
  /** HTTP status on success. */
  status: number;
  /** The body is the raw bytes of a file, sent as application/octet-stream. */
  binary?: boolean;
  params: TParams;
  query: TQuery;
  body: TBody;
  response: TResponse;
}

function endpoint<
  TResponse extends z.ZodType,
  TParams extends z.ZodType | undefined = undefined,
  TQuery extends z.ZodType | undefined = undefined,
  TBody extends z.ZodType | undefined = undefined,
>(def: {
  method: HttpMethod;
  path: string;
  status?: number;
  params?: TParams;
  query?: TQuery;
  body?: TBody;
  binary?: boolean;
  response: TResponse;
}): Endpoint<TParams, TQuery, TBody, TResponse> {
  return {
    method: def.method,
    path: def.path,
    status: def.status ?? 200,
    ...(def.binary ? { binary: true } : {}),
    params: def.params as TParams,
    query: def.query as TQuery,
    body: def.body as TBody,
    response: def.response,
  };
}

/**
 * The API contract. Anything not listed here is not part of the public API.
 * Sign-in is email magic link plus optional TOTP. There is no social sign-in.
 */
export const contract = {
  auth: {
    /** Always answers 202 for a valid email, so it never reveals who has an account. */
    requestMagicLink: endpoint({
      method: 'POST',
      path: '/v1/auth/magic-link/request',
      status: 202,
      body: requestMagicLinkBodySchema,
      response: okResponseSchema,
    }),
    /** Consumes the link once and sets the session cookie. */
    verifyMagicLink: endpoint({
      method: 'POST',
      path: '/v1/auth/magic-link/verify',
      body: verifyMagicLinkBodySchema,
      response: signInResponseSchema,
    }),
    logout: endpoint({ method: 'POST', path: '/v1/auth/logout', response: okResponseSchema }),
    logoutEverywhere: endpoint({
      method: 'POST',
      path: '/v1/auth/logout-everywhere',
      response: okResponseSchema,
    }),
    /** Starts TOTP set-up. Two-step sign-in is not on until `totpVerify` succeeds. */
    totpEnrol: endpoint({
      method: 'POST',
      path: '/v1/auth/mfa/totp/enrol',
      response: totpEnrolResponseSchema,
    }),
    /** Confirms set-up with a first code and switches two-step sign-in on. */
    totpVerify: endpoint({
      method: 'POST',
      path: '/v1/auth/mfa/totp/verify',
      body: totpCodeBodySchema,
      response: mfaStatusResponseSchema,
    }),
    /** Second step of sign-in for people with TOTP on. */
    totpChallenge: endpoint({
      method: 'POST',
      path: '/v1/auth/mfa/totp/challenge',
      body: totpCodeBodySchema,
      response: mfaStatusResponseSchema,
    }),
    totpDisable: endpoint({
      method: 'POST',
      path: '/v1/auth/mfa/totp/disable',
      body: totpCodeBodySchema,
      response: mfaStatusResponseSchema,
    }),
    /** New recovery codes, for someone with two-step sign-in on. Needs a code from the app. The old ones stop working. */
    recoveryCodes: endpoint({
      method: 'POST',
      path: '/v1/auth/mfa/recovery-codes',
      body: totpCodeBodySchema,
      response: recoveryCodesResponseSchema,
    }),
    /** The second step of sign-in with a recovery code instead of the app. Each code works once. */
    recoveryChallenge: endpoint({
      method: 'POST',
      path: '/v1/auth/mfa/recovery',
      body: recoveryCodeBodySchema,
      response: mfaStatusResponseSchema,
    }),
  },
  me: {
    get: endpoint({ method: 'GET', path: '/v1/me', response: meResponseSchema }),
    update: endpoint({
      method: 'PATCH',
      path: '/v1/me',
      body: updateMeBodySchema,
      response: meResponseSchema,
    }),
    /** Deletes the account for real. Sole owners with teammates must hand over first. */
    deleteAccount: endpoint({
      method: 'POST',
      path: '/v1/me/delete',
      body: deleteAccountBodySchema,
      response: okResponseSchema,
    }),
  },
  organisations: {
    /** Every organisation the signed-in person belongs to. */
    list: endpoint({
      method: 'GET',
      path: '/v1/organisations',
      response: organisationListResponseSchema,
    }),
    current: endpoint({
      method: 'GET',
      path: '/v1/organisations/current',
      response: organisationSchema,
    }),
    updateCurrent: endpoint({
      method: 'PATCH',
      path: '/v1/organisations/current',
      body: updateOrganisationBodySchema,
      response: organisationSchema,
    }),
    switch: endpoint({
      method: 'POST',
      path: '/v1/organisations/switch',
      body: switchOrganisationBodySchema,
      response: switchOrganisationResponseSchema,
    }),
  },
  members: {
    list: endpoint({ method: 'GET', path: '/v1/members', response: memberListResponseSchema }),
    update: endpoint({
      method: 'PATCH',
      path: '/v1/members/:userId',
      params: memberParamsSchema,
      body: updateMemberBodySchema,
      response: memberSchema,
    }),
    /** Removes someone, or lets a person leave when the id is their own. */
    remove: endpoint({
      method: 'DELETE',
      path: '/v1/members/:userId',
      params: memberParamsSchema,
      response: okResponseSchema,
    }),
  },
  invitations: {
    list: endpoint({
      method: 'GET',
      path: '/v1/invitations',
      response: invitationListResponseSchema,
    }),
    create: endpoint({
      method: 'POST',
      path: '/v1/invitations',
      status: 201,
      body: createInvitationBodySchema,
      response: invitationSchema,
    }),
    revoke: endpoint({
      method: 'DELETE',
      path: '/v1/invitations/:invitationId',
      params: invitationParamsSchema,
      response: okResponseSchema,
    }),
    accept: endpoint({
      method: 'POST',
      path: '/v1/invitations/accept',
      body: acceptInvitationBodySchema,
      response: acceptInvitationResponseSchema,
    }),
  },
  companies: {
    /** The companies this organisation owns, by default. `?relationship=follow` or `all` for the rest. */
    list: endpoint({ method: 'GET', path: '/v1/companies', query: companyListQuerySchema, response: companyListResponseSchema }),
    get: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId',
      params: companyParamsSchema,
      response: companySchema,
    }),
    create: endpoint({
      method: 'POST',
      path: '/v1/companies',
      status: 201,
      body: createCompanyBodySchema,
      response: companySchema,
    }),
    update: endpoint({
      method: 'PATCH',
      path: '/v1/companies/:companyId',
      params: companyParamsSchema,
      body: updateCompanyBodySchema,
      response: companySchema,
    }),
    /** Subsidiaries and other entities tied to this company. */
    related: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/related',
      params: companyParamsSchema,
      response: companyListResponseSchema,
    }),
    addRelated: endpoint({
      method: 'POST',
      path: '/v1/companies/:companyId/related',
      status: 201,
      params: companyParamsSchema,
      body: createCompanyBodySchema,
      response: companySchema,
    }),
    /**
     * Turns a company this team follows into one it owns, so it can answer questions and add
     * evidence. Audited. Whether the claim is genuine isn't checked yet (owner's decision, 19 Nov 2026).
     */
    own: endpoint({
      method: 'POST',
      path: '/v1/companies/:companyId/own',
      params: companyParamsSchema,
      response: companySchema,
    }),
    /** Every finished scan, newest first, with what each one changed. */
    history: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/history',
      params: companyParamsSchema,
      response: w.companyHistoryResponseSchema,
    }),
  },
  /** Companies this organisation follows: public data only, read-only. */
  watchlist: {
    list: endpoint({ method: 'GET', path: '/v1/watchlist', response: w.watchlistResponseSchema }),
    /** Follows a company and starts a public-data scan of it. */
    add: endpoint({
      method: 'POST',
      path: '/v1/watchlist',
      status: 201,
      body: w.followCompanyBodySchema,
      response: w.followCompanyResponseSchema,
    }),
    /** Stops following. The followed company's scans and findings go with it. */
    remove: endpoint({
      method: 'DELETE',
      path: '/v1/watchlist/:companyId',
      params: w.watchlistParamsSchema,
      response: okResponseSchema,
    }),
  },
  registry: {
    /** Looks a company up on its register. "Not found" is never proof it doesn't exist. */
    search: endpoint({
      method: 'GET',
      path: '/v1/registry/search',
      query: p.registrySearchQuerySchema,
      response: p.registrySearchResponseSchema,
    }),
    /** "A person will look it up", for when a register can't find the company. */
    requestLookup: endpoint({
      method: 'POST',
      path: '/v1/registry/lookup-requests',
      status: 201,
      body: p.lookupRequestBodySchema,
      response: p.lookupRequestSchema,
    }),
    lookupRequests: endpoint({
      method: 'GET',
      path: '/v1/registry/lookup-requests',
      response: p.lookupRequestListResponseSchema,
    }),
  },
  questionnaire: {
    get: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/questionnaire',
      params: companyParamsSchema,
      response: p.questionnaireResponseSchema,
    }),
    /** Saves some answers. null clears one. Editing after a scan queues a new score. */
    answer: endpoint({
      method: 'PATCH',
      path: '/v1/companies/:companyId/questionnaire',
      params: companyParamsSchema,
      body: p.updateAnswersBodySchema,
      response: p.questionnaireResponseSchema,
    }),
    /** "You told us": a statement we can't check, which the rules accept as such. */
    attest: endpoint({
      method: 'POST',
      path: '/v1/companies/:companyId/attestations',
      params: companyParamsSchema,
      body: p.attestationBodySchema,
      response: p.attestationResponseSchema,
    }),
  },
  scans: {
    /** Starts a scan. The answer is 202: poll `get` for each source's progress. */
    create: endpoint({
      method: 'POST',
      path: '/v1/companies/:companyId/scans',
      status: 202,
      params: companyParamsSchema,
      response: p.scanSchema,
    }),
    list: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/scans',
      params: companyParamsSchema,
      response: p.scanListResponseSchema,
    }),
    /** Live per-source status for the scanning screen. Poll every `pollAfterMs`. */
    get: endpoint({ method: 'GET', path: '/v1/scans/:scanId', params: p.scanParamsSchema, response: p.scanSchema }),
  },
  results: {
    overview: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/overview',
      params: companyParamsSchema,
      query: p.resultsScopeQuerySchema,
      response: p.overviewResponseSchema,
    }),
    issues: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/issues',
      params: companyParamsSchema,
      query: p.issueListQuerySchema,
      response: p.issueListResponseSchema,
    }),
    issue: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/issues/:ruleKey',
      params: p.companyIssueParamsSchema,
      response: p.issueDetailSchema,
    }),
    area: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/areas/:layer',
      params: p.areaParamsSchema,
      query: p.resultsScopeQuerySchema,
      response: p.areaResponseSchema,
    }),
    /** "What if I fix these": the score if the chosen issues were closed. */
    projection: endpoint({
      method: 'POST',
      path: '/v1/companies/:companyId/projection',
      params: companyParamsSchema,
      query: p.resultsScopeQuerySchema,
      body: p.projectionBodySchema,
      response: p.projectionResponseSchema,
    }),
    /** "We don't have this": turns an unseen document into a real gap, and re-scores. */
    declareMissing: endpoint({
      method: 'POST',
      path: '/v1/companies/:companyId/issues/:ruleKey/missing',
      params: p.companyIssueParamsSchema,
      response: p.declareMissingResponseSchema,
    }),
    /** The undo. */
    undeclareMissing: endpoint({
      method: 'DELETE',
      path: '/v1/companies/:companyId/issues/:ruleKey/missing',
      params: p.companyIssueParamsSchema,
      response: p.declareMissingResponseSchema,
    }),
  },
  vault: {
    get: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/documents',
      params: companyParamsSchema,
      response: v.vaultResponseSchema,
    }),
    /** Send the file itself as application/octet-stream. Reading happens in the background. */
    upload: endpoint({
      method: 'POST',
      path: '/v1/companies/:companyId/documents',
      status: 202,
      binary: true,
      params: companyParamsSchema,
      query: v.uploadQuerySchema,
      body: v.uploadBodySchema,
      response: v.documentSchema,
    }),
    document: endpoint({
      method: 'GET',
      path: '/v1/documents/:documentId',
      params: v.documentParamsSchema,
      response: v.documentSchema,
    }),
    /** A person confirms which slot this belongs in. Nothing counts until they do. */
    confirm: endpoint({
      method: 'POST',
      path: '/v1/documents/:documentId/confirm',
      params: v.documentParamsSchema,
      body: v.confirmDocumentBodySchema,
      response: v.documentSchema,
    }),
    remove: endpoint({
      method: 'DELETE',
      path: '/v1/documents/:documentId',
      params: v.documentParamsSchema,
      response: okResponseSchema,
    }),
    /** A signed link that works for a few minutes. Files are always sent as downloads. */
    download: endpoint({
      method: 'GET',
      path: '/v1/documents/:documentId/download',
      params: v.documentParamsSchema,
      response: v.documentDownloadResponseSchema,
    }),
    connections: endpoint({
      method: 'GET',
      path: '/v1/vault/connections',
      response: v.vaultConnectionListResponseSchema,
    }),
    /** Not built yet. Always answers "not connected yet", with nothing pretended. */
    connect: endpoint({
      method: 'POST',
      path: '/v1/vault/connections/:provider',
      params: v.vaultProviderParamsSchema,
      response: v.vaultConnectionSchema,
    }),
  },
  /**
   * The read-only GitHub App. Owners and admins only. Until the app is registered and its
   * settings are in place, every route says "not connected yet". GitHub evidence is always for
   * a person to confirm, never a verified result.
   */
  connections: {
    githubStatus: endpoint({
      method: 'GET',
      path: '/v1/organisations/:id/connections/github',
      params: c.organisationIdParamsSchema,
      response: c.githubConnectionSchema,
    }),
    /** GitHub's install page, with a signed, single-use state that expires in 10 minutes. */
    githubStart: endpoint({
      method: 'POST',
      path: '/v1/organisations/:id/connections/github/start',
      params: c.organisationIdParamsSchema,
      response: c.githubStartResponseSchema,
    }),
    /** Where GitHub sends the person back after installing. */
    githubCallback: endpoint({
      method: 'GET',
      path: '/v1/organisations/:id/connections/github/callback',
      params: c.organisationIdParamsSchema,
      query: c.githubCallbackQuerySchema,
      response: c.githubConnectionSchema,
    }),
    /** The repositories to include. Everything not listed is left out. Default: none. */
    githubRepositories: endpoint({
      method: 'PUT',
      path: '/v1/organisations/:id/connections/github/repositories',
      params: c.organisationIdParamsSchema,
      body: c.githubSelectRepositoriesBodySchema,
      response: c.githubConnectionSchema,
    }),
    githubSync: endpoint({
      method: 'POST',
      path: '/v1/organisations/:id/connections/github/sync',
      status: 202,
      params: c.organisationIdParamsSchema,
      response: c.githubSyncResponseSchema,
    }),
    githubDisconnect: endpoint({
      method: 'DELETE',
      path: '/v1/organisations/:id/connections/github',
      params: c.organisationIdParamsSchema,
      response: c.githubConnectionSchema,
    }),
  },
  /**
   * DocuSign and forwarding by email. Owners and admins only. Each says it isn't available
   * until its settings are in place. Everything they bring in waits for a person to confirm it.
   */
  documentConnections: {
    docusignStatus: endpoint({
      method: 'GET',
      path: '/v1/organisations/:id/connections/docusign',
      params: c.organisationIdParamsSchema,
      response: dc.docusignConnectionSchema,
    }),
    /** DocuSign's sign-in page, with a signed, single-use state that expires in 10 minutes. */
    docusignStart: endpoint({
      method: 'POST',
      path: '/v1/organisations/:id/connections/docusign/start',
      params: c.organisationIdParamsSchema,
      response: dc.docusignStartResponseSchema,
    }),
    docusignCallback: endpoint({
      method: 'GET',
      path: '/v1/organisations/:id/connections/docusign/callback',
      params: c.organisationIdParamsSchema,
      query: dc.docusignCallbackQuerySchema,
      response: dc.docusignConnectionSchema,
    }),
    /** Recent completed envelopes, for the person to pick from. Nothing is brought in by listing. */
    docusignEnvelopes: endpoint({
      method: 'GET',
      path: '/v1/organisations/:id/connections/docusign/envelopes',
      params: c.organisationIdParamsSchema,
      response: dc.docusignEnvelopeListResponseSchema,
    }),
    /** Brings in only the envelopes picked. */
    docusignPull: endpoint({
      method: 'POST',
      path: '/v1/organisations/:id/connections/docusign/pull',
      status: 202,
      params: c.organisationIdParamsSchema,
      body: dc.docusignPullBodySchema,
      response: dc.docusignPullResponseSchema,
    }),
    docusignDisconnect: endpoint({
      method: 'DELETE',
      path: '/v1/organisations/:id/connections/docusign',
      params: c.organisationIdParamsSchema,
      response: dc.docusignConnectionSchema,
    }),
    emailStatus: endpoint({
      method: 'GET',
      path: '/v1/organisations/:id/connections/email',
      params: c.organisationIdParamsSchema,
      response: dc.inboundEmailStatusSchema,
    }),
    /** Makes a new private address (replacing any old one). The address is shown only in this answer. */
    emailCreate: endpoint({
      method: 'POST',
      path: '/v1/organisations/:id/connections/email',
      status: 201,
      params: c.organisationIdParamsSchema,
      body: dc.inboundEmailCreateBodySchema,
      response: dc.inboundEmailStatusSchema,
    }),
    emailRevoke: endpoint({
      method: 'DELETE',
      path: '/v1/organisations/:id/connections/email',
      params: c.organisationIdParamsSchema,
      response: dc.inboundEmailStatusSchema,
    }),
  },
  /**
   * Google Drive and SharePoint / OneDrive, both picker-based. Owners and admins only. Each says
   * it isn't available until its settings are in place. Only the files a person picks are read,
   * and each waits for a person to confirm it.
   */
  filePickers: {
    googleDriveStatus: endpoint({
      method: 'GET',
      path: '/v1/organisations/:id/connections/google-drive',
      params: c.organisationIdParamsSchema,
      response: fp.filePickerConnectionSchema,
    }),
    /** Google's sign-in page, with a signed, single-use state that expires in 10 minutes. */
    googleDriveStart: endpoint({
      method: 'POST',
      path: '/v1/organisations/:id/connections/google-drive/start',
      params: c.organisationIdParamsSchema,
      response: fp.filePickerStartResponseSchema,
    }),
    googleDriveCallback: endpoint({
      method: 'GET',
      path: '/v1/organisations/:id/connections/google-drive/callback',
      params: c.organisationIdParamsSchema,
      query: fp.filePickerCallbackQuerySchema,
      response: fp.filePickerConnectionSchema,
    }),
    /** What the Google Picker needs in the browser: a short-lived drive.file access token and public ids. Never the refresh token. */
    googleDrivePickerToken: endpoint({
      method: 'POST',
      path: '/v1/organisations/:id/connections/google-drive/picker-token',
      params: c.organisationIdParamsSchema,
      response: fp.googleDrivePickerTokenResponseSchema,
    }),
    /** Brings in only the files picked. */
    googleDriveFiles: endpoint({
      method: 'POST',
      path: '/v1/organisations/:id/connections/google-drive/files',
      status: 202,
      params: c.organisationIdParamsSchema,
      body: fp.googleDriveFilesBodySchema,
      response: fp.filePickerFilesResponseSchema,
    }),
    googleDriveDisconnect: endpoint({
      method: 'DELETE',
      path: '/v1/organisations/:id/connections/google-drive',
      params: c.organisationIdParamsSchema,
      response: fp.filePickerConnectionSchema,
    }),
    sharepointStatus: endpoint({
      method: 'GET',
      path: '/v1/organisations/:id/connections/sharepoint',
      params: c.organisationIdParamsSchema,
      response: fp.filePickerConnectionSchema,
    }),
    /** Microsoft's sign-in page, with a signed, single-use state that expires in 10 minutes. */
    sharepointStart: endpoint({
      method: 'POST',
      path: '/v1/organisations/:id/connections/sharepoint/start',
      params: c.organisationIdParamsSchema,
      response: fp.filePickerStartResponseSchema,
    }),
    sharepointCallback: endpoint({
      method: 'GET',
      path: '/v1/organisations/:id/connections/sharepoint/callback',
      params: c.organisationIdParamsSchema,
      query: fp.filePickerCallbackQuerySchema,
      response: fp.filePickerConnectionSchema,
    }),
    /** Brings in only the files picked. */
    sharepointFiles: endpoint({
      method: 'POST',
      path: '/v1/organisations/:id/connections/sharepoint/files',
      status: 202,
      params: c.organisationIdParamsSchema,
      body: fp.sharepointFilesBodySchema,
      response: fp.filePickerFilesResponseSchema,
    }),
    sharepointDisconnect: endpoint({
      method: 'DELETE',
      path: '/v1/organisations/:id/connections/sharepoint',
      params: c.organisationIdParamsSchema,
      response: fp.filePickerConnectionSchema,
    }),
  },
  deadlines: {
    list: endpoint({
      method: 'GET',
      path: '/v1/deadlines',
      query: p.deadlineListQuerySchema,
      response: p.deadlineListResponseSchema,
    }),
    /** The person says this is done. Only for dates we can't check ourselves. */
    done: endpoint({
      method: 'POST',
      path: '/v1/deadlines/:deadlineId/done',
      params: p.deadlineParamsSchema,
      response: p.deadlineSchema,
    }),
    /** They marked it by mistake, or it turned out not to be done. */
    undone: endpoint({
      method: 'DELETE',
      path: '/v1/deadlines/:deadlineId/done',
      params: p.deadlineParamsSchema,
      response: p.deadlineSchema,
    }),
  },
  records: {
    get: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/records',
      params: companyParamsSchema,
      response: p.companyRecordsResponseSchema,
    }),
    /** Re-runs this entity's sources. Rate limited. */
    checkAgain: endpoint({
      method: 'POST',
      path: '/v1/companies/:companyId/records/check-again',
      status: 202,
      params: companyParamsSchema,
      response: p.scanSchema,
    }),
  },
  /**
   * Staff only. Orders, bookings and the document review desk were removed with the lawyer
   * service (owner's decision, 19 Nov 2026). What's left is the feed of companies people asked
   * us to look up by hand.
   */
  review: {
    /** Look-up requests waiting for our team. */
    work: endpoint({ method: 'GET', path: '/v1/review/work', response: p.staffWorkResponseSchema }),
    updateWork: endpoint({
      method: 'PATCH',
      path: '/v1/review/work/:workId',
      params: p.staffWorkParamsSchema,
      body: p.updateStaffWorkBodySchema,
      response: p.updateStaffWorkResponseSchema,
    }),
  },
  badge: {
    get: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/badge',
      params: companyParamsSchema,
      response: p.badgeStatusResponseSchema,
    }),
    issue: endpoint({
      method: 'POST',
      path: '/v1/companies/:companyId/badge',
      status: 201,
      params: companyParamsSchema,
      response: p.badgeIssuedResponseSchema,
    }),
    revoke: endpoint({
      method: 'DELETE',
      path: '/v1/companies/:companyId/badge',
      params: companyParamsSchema,
      response: okResponseSchema,
    }),
  },
  shares: {
    list: endpoint({
      method: 'GET',
      path: '/v1/companies/:companyId/shares',
      params: companyParamsSchema,
      response: p.shareListResponseSchema,
    }),
    create: endpoint({
      method: 'POST',
      path: '/v1/companies/:companyId/shares',
      status: 201,
      params: companyParamsSchema,
      body: p.createShareBodySchema,
      response: p.shareCreatedResponseSchema,
    }),
    revoke: endpoint({
      method: 'DELETE',
      path: '/v1/shares/:shareId',
      params: p.shareParamsSchema,
      response: okResponseSchema,
    }),
  },
  /** No sign-in. A summary and counts only, rate limited. */
  public: {
    report: endpoint({
      method: 'GET',
      path: '/v1/public/reports/:token',
      params: p.publicTokenParamsSchema,
      response: p.publicReportResponseSchema,
    }),
    badge: endpoint({
      method: 'GET',
      path: '/v1/public/badges/:token',
      params: p.publicTokenParamsSchema,
      response: p.publicBadgeResponseSchema,
    }),
  },
  plans: {
    list: endpoint({ method: 'GET', path: '/v1/plans', response: planListResponseSchema }),
  },
  /**
   * Stripe. Until STRIPE_* is set both answer 503 payments_off and an admin changes plans by hand.
   * The webhook (POST /v1/webhooks/stripe) is outside the contract: Stripe calls it, not the app.
   */
  billing: {
    checkout: endpoint({ method: 'POST', path: '/v1/billing/checkout', body: checkoutBodySchema, response: billingRedirectResponseSchema }),
    portal: endpoint({ method: 'POST', path: '/v1/billing/portal', response: billingRedirectResponseSchema }),
  },
  admin: {
    rulePacks: endpoint({ method: 'GET', path: '/v1/admin/rule-packs', response: p.rulePackListResponseSchema }),
    /** Records a named approver. Nothing else can approve a pack. */
    approveRulePack: endpoint({
      method: 'POST',
      path: '/v1/admin/rule-packs/:jurisdiction/:version/approve',
      params: p.rulePackParamsSchema,
      body: p.approveRulePackBodySchema,
      response: p.rulePackSchema,
    }),
    connectors: endpoint({ method: 'GET', path: '/v1/admin/connectors', response: p.connectorHealthResponseSchema }),
    users: endpoint({
      method: 'GET',
      path: '/v1/admin/users',
      query: p.adminUsersQuerySchema,
      response: p.adminUsersResponseSchema,
    }),
    /** The only way a plan changes until a billing provider exists. */
    setPlan: endpoint({
      method: 'PATCH',
      path: '/v1/admin/organisations/:organisationId/plan',
      params: setPlanParamsSchema,
      body: setPlanBodySchema,
      response: setPlanResponseSchema,
    }),
    grantStaff: endpoint({
      method: 'POST',
      path: '/v1/admin/staff',
      body: p.grantStaffBodySchema,
      response: okResponseSchema,
    }),
    revokeStaff: endpoint({
      method: 'DELETE',
      path: '/v1/admin/staff/:userId',
      params: p.staffMemberParamsSchema,
      response: okResponseSchema,
    }),
  },
  search: {
    /** The Ctrl+K palette: issues, documents and deadlines in this organisation. */
    query: endpoint({ method: 'GET', path: '/v1/search', query: p.searchQuerySchema, response: p.searchResponseSchema }),
  },
  audit: {
    list: endpoint({
      method: 'GET',
      path: '/v1/audit',
      query: auditListQuerySchema,
      response: auditListResponseSchema,
    }),
  },
  notifications: {
    list: endpoint({
      method: 'GET',
      path: '/v1/notifications',
      query: notificationListQuerySchema,
      response: notificationListResponseSchema,
    }),
    markRead: endpoint({
      method: 'POST',
      path: '/v1/notifications/:notificationId/read',
      params: notificationParamsSchema,
      response: notificationSchema,
    }),
    markAllRead: endpoint({
      method: 'POST',
      path: '/v1/notifications/read-all',
      response: markAllReadResponseSchema,
    }),
  },
} as const;

export type Contract = typeof contract;

import type { Role } from './constants';

/**
 * Who may do what inside an organisation. This is the single source of truth:
 * the API enforces it on every route and the web app uses it to hide controls.
 *
 * - owner: everything, including granting or removing ownership.
 * - admin: runs the organisation day to day, but cannot touch owners.
 * - member: works on companies. Cannot manage people or read the audit log.
 * - lawyer: read-only on company data for review work.
 */
export const PERMISSIONS = {
  'organisation.read': ['owner', 'admin', 'member', 'lawyer'],
  'organisation.update': ['owner', 'admin'],
  'members.read': ['owner', 'admin', 'member', 'lawyer'],
  'members.manage': ['owner', 'admin'],
  'members.manageOwners': ['owner'],
  'invitations.read': ['owner', 'admin'],
  'invitations.manage': ['owner', 'admin'],
  'companies.read': ['owner', 'admin', 'member', 'lawyer'],
  'companies.write': ['owner', 'admin', 'member'],
  'audit.read': ['owner', 'admin'],
  'notifications.read': ['owner', 'admin', 'member', 'lawyer'],
  'answers.write': ['owner', 'admin', 'member'],
  'scans.write': ['owner', 'admin', 'member'],
  'results.read': ['owner', 'admin', 'member', 'lawyer'],
  'vault.read': ['owner', 'admin', 'member', 'lawyer'],
  'vault.write': ['owner', 'admin', 'member'],
  'deadlines.write': ['owner', 'admin', 'member'],
  'orders.write': ['owner', 'admin', 'member'],
  'sharing.manage': ['owner', 'admin'],
  /** Connecting, choosing repositories for, syncing and disconnecting GitHub. */
  'connections.manage': ['owner', 'admin'],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

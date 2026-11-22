import { can, PLAN_ENTITLEMENTS, PLAN_NAMES, type Entitlements, type MeResponse, type Permission, type PlanCode } from '@vero/shared';

// Ported from apps/web/src/lib/entitlements.ts.

/** What a plan includes. Screens ask this, so the rules stay in the one place they live. */
export function entitlementsOf(plan: PlanCode | null | undefined): Entitlements {
  return PLAN_ENTITLEMENTS[plan ?? 'free'];
}

export function planNameOf(plan: PlanCode | null | undefined): string {
  return PLAN_NAMES[plan ?? 'free'];
}

/** Whether this person's role lets them do something, so a screen doesn't offer what would be refused. */
export function roleCan(me: MeResponse | null, permission: Permission): boolean {
  if (!me) return false;
  const active = me.organisations.find((org) => org.id === me.activeOrganisationId);
  return active ? can(active.role, permission) : false;
}

import { PLAN_ENTITLEMENTS, planCodeSchema, type Entitlements, type PlanCode } from '@vero/shared';
import { eq } from 'drizzle-orm';
import type { Config } from '../../config';
import { schema, type Tx } from '../../db';
import { errors } from '../../http/errors';

/**
 * The organisation's plan. An organisation with no plan is on Free. PLAN_OVERRIDE is a
 * development convenience: config refuses to start with it in production, and it is ignored
 * here too if it ever got that far.
 */
export async function planOf(tx: Tx, organisationId: string, config: Pick<Config, 'planOverride' | 'nodeEnv'>): Promise<PlanCode> {
  if (config.planOverride && config.nodeEnv !== 'production') return config.planOverride;
  const [row] = await tx
    .select({ code: schema.plan.code })
    .from(schema.organisation)
    .innerJoin(schema.plan, eq(schema.plan.id, schema.organisation.planId))
    .where(eq(schema.organisation.id, organisationId));
  return row ? planCodeSchema.parse(row.code) : 'free';
}

export async function entitlementsOf(tx: Tx, organisationId: string, config: Pick<Config, 'planOverride' | 'nodeEnv'>): Promise<Entitlements> {
  return PLAN_ENTITLEMENTS[await planOf(tx, organisationId, config)];
}

/** Throws a clear 403 when the plan doesn't include something. */
export function requireEntitlement(entitlements: Entitlements, key: keyof Entitlements, what: string): void {
  const value = entitlements[key];
  if (value === false || value === 0) throw errors.planUpgrade(what);
}

import { EMAIL_EVIDENCE_NOTICE, type InboundEmailCreateBody, type InboundEmailStatus } from '@vero/shared';
import { eq } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import type { RequestMeta } from '../../http/route';
import { requireOwned } from '../companies/ownership';
import { writeAudit } from '../audit/service';
import { requireCompany } from '../scans/facts';
import { hashLocalPart, hintOf, newLocalPart } from './address';

const { inboundEmailAddress, inboundEmailAddressIndex } = schema;
export type InboundAddressRow = typeof inboundEmailAddress.$inferSelect;

export const EMAIL_NOT_AVAILABLE = "Forwarding by email isn't switched on yet. You can upload the files from your computer for now.";

function view(deps: AppDeps, row: InboundAddressRow | undefined, address: string | null = null, message?: string): InboundEmailStatus {
  const base = { notice: EMAIL_EVIDENCE_NOTICE, address };
  if (!deps.config.inboundEmail) return { ...base, address: null, status: 'not_available', message: EMAIL_NOT_AVAILABLE, companyId: null, hint: null, createdAt: null, lastReceivedAt: null, receivedCount: 0 };
  if (!row) return { ...base, status: 'not_set_up', message: message ?? 'No forwarding address yet. Create one to email files to your vault.', companyId: null, hint: null, createdAt: null, lastReceivedAt: null, receivedCount: 0 };
  const active = row.status === 'active';
  return {
    ...base,
    status: active ? 'active' : 'revoked',
    message:
      message ??
      (active
        ? `Your forwarding address ends in "${row.hint}". Files sent to it wait for you to confirm them.`
        : 'This forwarding address was turned off. Mail sent to it is dropped. Create a new one to forward again.'),
    companyId: row.companyId,
    hint: row.hint,
    createdAt: row.createdAt.toISOString(),
    lastReceivedAt: row.lastReceivedAt?.toISOString() ?? null,
    receivedCount: row.receivedCount,
  };
}

async function loadAddress(tx: Tx): Promise<InboundAddressRow | undefined> {
  const [row] = await tx.select().from(inboundEmailAddress).limit(1);
  return row;
}

export async function emailStatus(deps: AppDeps, organisationId: string): Promise<InboundEmailStatus> {
  return deps.db.withOrg(organisationId, async (tx) => view(deps, await loadAddress(tx)));
}

/**
 * A new private address for the organisation, replacing any old one (which stops working at
 * once). The full address is in this answer only: we keep its hash and its last four characters.
 */
export async function createAddress(deps: AppDeps, input: { organisationId: string; userId: string; body: InboundEmailCreateBody; meta: RequestMeta }): Promise<InboundEmailStatus> {
  const config = deps.config.inboundEmail;
  if (!config) throw errors.invalidState(EMAIL_NOT_AVAILABLE);
  const { organisationId } = input;
  const localPart = newLocalPart();
  const { row, previous } = await deps.db.withOrg(organisationId, async (tx) => {
    requireOwned(await requireCompany(tx, input.body.companyId));
    const existing = await loadAddress(tx);
    const values = { companyId: input.body.companyId, status: 'active', hint: hintOf(localPart), createdBy: input.userId, revokedAt: null, lastReceivedAt: null, receivedCount: 0, createdAt: deps.now() };
    const [saved] = existing
      ? await tx.update(inboundEmailAddress).set(values).where(eq(inboundEmailAddress.id, existing.id)).returning()
      : await tx.insert(inboundEmailAddress).values({ organisationId, ...values }).returning();
    if (!saved) throw errors.internal();
    // Never the address, nor its hash.
    await writeAudit(tx, { organisationId, actorId: input.userId, action: existing ? 'inbound_email.address_rotated' : 'inbound_email.address_created', target: saved.id, metadata: { companyId: input.body.companyId }, meta: input.meta });
    return { row: saved, previous: existing };
  });
  await deps.db.withSystem(async (tx) => {
    // The old address goes from the index, so it is simply unknown from now on.
    if (previous) await tx.delete(inboundEmailAddressIndex).where(eq(inboundEmailAddressIndex.addressId, previous.id));
    await tx.insert(inboundEmailAddressIndex).values({ addressHash: hashLocalPart(localPart), tenantId: organisationId, addressId: row.id });
  });
  return view(deps, row, `${localPart}@${config.domain}`, `Here is your new forwarding address. Copy it now: we show it only once. Anything sent to it waits for you to confirm it.`);
}

/** Turns the address off. Mail sent to it afterwards is accepted by the provider and dropped, with nothing stored. */
export async function revokeAddress(deps: AppDeps, input: { organisationId: string; userId: string; meta: RequestMeta }): Promise<InboundEmailStatus> {
  const { organisationId } = input;
  const row = await deps.db.withOrg(organisationId, async (tx) => {
    const existing = await loadAddress(tx);
    if (!existing || existing.status !== 'active') return existing;
    const [updated] = await tx.update(inboundEmailAddress).set({ status: 'revoked', revokedAt: deps.now() }).where(eq(inboundEmailAddress.id, existing.id)).returning();
    await writeAudit(tx, { organisationId, actorId: input.userId, action: 'inbound_email.address_revoked', target: existing.id, meta: input.meta });
    return updated;
  });
  if (row) await deps.db.withSystem((tx) => tx.delete(inboundEmailAddressIndex).where(eq(inboundEmailAddressIndex.addressId, row.id)));
  return view(deps, row);
}

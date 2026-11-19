import { and, isNotNull, lt, or } from 'drizzle-orm';
import { schema } from '../db';
import type { AppDeps } from '../deps';

/** Deletes sign-in material that can no longer be used. Runs as a background job. */
export async function purgeExpired(deps: Pick<AppDeps, 'db' | 'limiter' | 'now'>): Promise<void> {
  const dayAgo = new Date(deps.now().getTime() - 24 * 60 * 60 * 1000);
  await deps.limiter.purgeExpired();
  await deps.db.withSystem(async (tx) => {
    await tx.delete(schema.magicLink).where(lt(schema.magicLink.expiresAt, dayAgo));
    await tx.delete(schema.githubInstallStateUse).where(lt(schema.githubInstallStateUse.expiresAt, dayAgo));
    await tx.delete(schema.docusignOauthStateUse).where(lt(schema.docusignOauthStateUse.expiresAt, dayAgo));
    await tx.delete(schema.filePickerOauthStateUse).where(lt(schema.filePickerOauthStateUse.expiresAt, dayAgo));
    // Resend (Svix) retries for a few days at most. A month of delivery ids is plenty to refuse a replay.
    await tx.delete(schema.inboundEmailDelivery).where(lt(schema.inboundEmailDelivery.receivedAt, new Date(deps.now().getTime() - 30 * 24 * 60 * 60 * 1000)));
    // GitHub redelivers for days at most. A month of delivery ids is plenty to refuse a replay.
    await tx.delete(schema.githubWebhookDelivery).where(lt(schema.githubWebhookDelivery.receivedAt, new Date(deps.now().getTime() - 30 * 24 * 60 * 60 * 1000)));
    await tx
      .delete(schema.session)
      .where(
        or(
          lt(schema.session.expiresAt, dayAgo),
          and(isNotNull(schema.session.revokedAt), lt(schema.session.revokedAt, dayAgo)),
        ),
      );
  });
}

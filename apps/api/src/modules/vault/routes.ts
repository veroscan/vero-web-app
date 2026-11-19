import { contract, uuidSchema } from '@vero/shared';
import type { FastifyInstance } from 'fastify';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import { writeAudit } from '../audit/service';
import { googleDriveStatus } from '../google-drive/service';
import {
  assertCanUpload,
  confirmDocument,
  deleteDocument,
  documentDto,
  DOWNLOAD_TTL_SECONDS,
  downloadExpiry,
  requireDocument,
  uploadDocument,
  vaultView,
} from './service';

/**
 * The vault's list of connections. Google Drive reports its real picker connection (see
 * modules/google-drive; connecting it is for owners and admins, under the organisation's
 * connections). Notion isn't built yet and says so plainly rather than pretending anything is linked.
 */
type VaultConnectionStatus = { status: 'not_connected' | 'active' | 'revoked'; message: string };

export interface VaultIntegration {
  provider: 'gdrive' | 'notion';
  name: string;
  status(deps: AppDeps, organisationId: string): Promise<VaultConnectionStatus>;
}

function notConnectedYet(provider: VaultIntegration['provider'], name: string): VaultIntegration {
  return {
    provider,
    name,
    status: async () => ({ status: 'not_connected', message: `${name} isn't connected yet. You can upload the file from your computer for now.` }),
  };
}

const googleDrive: VaultIntegration = {
  provider: 'gdrive',
  name: 'Google Drive',
  status: async (deps, organisationId) => {
    const view = await googleDriveStatus(deps, organisationId);
    if (view.status === 'active' || view.status === 'revoked') return { status: view.status, message: view.message };
    if (view.status === 'not_available') return { status: 'not_connected', message: view.message };
    return { status: 'not_connected', message: 'Google Drive is not connected yet. An owner or admin can connect it, then you can pick files to bring in.' };
  },
};

const INTEGRATIONS: readonly VaultIntegration[] = [googleDrive, notConnectedYet('notion', 'Notion')];

export function registerVaultRoutes(app: FastifyInstance, deps: AppDeps): void {
  // Only inside this scope can a request carry a raw file.
  void app.register(async (scope) => {
    scope.addContentTypeParser('application/octet-stream', { parseAs: 'buffer' }, (_request, body, done) => done(null, body));
    defineRoute(
      scope,
      deps,
      contract.vault.upload,
      {
        auth: 'org',
        permission: 'vault.write',
        bodyLimit: deps.config.maxUploadBytes,
        // Someone who may not upload is turned away before a single byte of the file is read.
        beforeBody: (_session, org, request) => {
          const companyId = uuidSchema.safeParse((request.params as { companyId?: unknown }).companyId);
          return assertCanUpload(deps, org.organisationId, companyId.success ? companyId.data : undefined);
        },
      },
      async ({ org, session, params, query, body, meta }) =>
        uploadDocument(deps, {
          organisationId: org.organisationId,
          companyId: params.companyId,
          userId: session.userId,
          data: Buffer.from(body),
          fileName: query.fileName,
          ...(query.slotKey ? { slotKey: query.slotKey } : {}),
          meta,
        }),
    );
  });

  defineRoute(app, deps, contract.vault.get, { auth: 'org', permission: 'vault.read' }, async ({ org, params }) =>
    deps.db.withOrg(org.organisationId, (tx) => vaultView(deps, tx, org.organisationId, params.companyId)),
  );

  defineRoute(app, deps, contract.vault.document, { auth: 'org', permission: 'vault.read' }, async ({ org, params }) =>
    deps.db.withOrg(org.organisationId, async (tx) => documentDto(tx, await requireDocument(tx, params.documentId))),
  );

  defineRoute(app, deps, contract.vault.confirm, { auth: 'org', permission: 'vault.write' }, async ({ org, session, params, body, meta }) =>
    confirmDocument(deps, { organisationId: org.organisationId, documentId: params.documentId, userId: session.userId, body, meta }),
  );

  defineRoute(app, deps, contract.vault.remove, { auth: 'org', permission: 'vault.write' }, async ({ org, session, params, meta }) => {
    await deleteDocument(deps, { organisationId: org.organisationId, documentId: params.documentId, userId: session.userId, meta });
    return { ok: true as const };
  });

  defineRoute(app, deps, contract.vault.download, { auth: 'org', permission: 'vault.read' }, async ({ org, session, params, meta }) => {
    const key = await deps.db.withOrg(org.organisationId, async (tx) => {
      const row = await requireDocument(tx, params.documentId);
      if (!row.storageKey) throw errors.notFound('That file');
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'document.download_link', target: row.id, meta });
      return row.storageKey;
    });
    const url = await deps.files.signedDownloadUrl(key, DOWNLOAD_TTL_SECONDS);
    return { url, expiresAt: downloadExpiry(deps).toISOString() };
  });

  defineRoute(app, deps, contract.vault.connections, { auth: 'org', permission: 'vault.read' }, async ({ org }) => ({
    connections: await Promise.all(
      INTEGRATIONS.map(async (integration) => ({ provider: integration.provider, name: integration.name, ...(await integration.status(deps, org.organisationId)) })),
    ),
  }));

  defineRoute(app, deps, contract.vault.connect, { auth: 'org', permission: 'vault.write' }, async ({ org, params }) => {
    const integration = INTEGRATIONS.find((candidate) => candidate.provider === params.provider);
    if (!integration) throw errors.notFound('That connection');
    return { provider: integration.provider, name: integration.name, ...(await integration.status(deps, org.organisationId)) };
  });
}

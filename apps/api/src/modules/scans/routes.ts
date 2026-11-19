import { contract, type Scan, type ScanSource } from '@vero/shared';
import { desc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import { writeAudit } from '../audit/service';
import { isDown, latestSources, requireCompany, type SourceRow } from './facts';
import { startFullScan, type ScanRow } from './pipeline';

const { scan, sourceResult } = schema;

/**
 * The scanning screen polls GET /v1/scans/:id rather than holding an event stream open.
 * Sources are written to Postgres as they answer, and the worker can be a separate process,
 * so a stream would need a pub/sub layer just to read the same rows. A short poll needs no
 * sticky connections or proxy settings, and survives a browser sleeping or an API restart.
 */
const POLL_AFTER_MS = 1500;

const SANCTIONS = 'sanctions.lists';

/** Names that stand alone on a row. sourceName is written to go in the middle of a sentence. */
const SOURCE_TITLES: Readonly<Record<string, string>> = {
  'uk.companies_house': 'Companies House',
  'uk.ico_register': 'ICO register',
  'uk.hmrc_vat': 'HMRC VAT',
  'us.uspto': 'US trademarks (USPTO)',
  'us.sec_form_d': 'SEC Form D',
  'us.delaware_vendor': 'Delaware company record',
  'ng.cac_vendor': 'Corporate Affairs Commission, Nigeria',
  'ng.ndpc_list': 'Nigeria data protection list',
  'sanctions.lists': 'Sanctions lists',
  'web.policy_scan': 'Your website',
};

function summaryOf(connectorId: string, state: ScanSource['state']): string {
  if (connectorId === SANCTIONS) {
    if (state === 'not_found') return 'No matches on the lists we checked.';
    if (state === 'found') return 'A possible match. A person needs to check this.';
  }
  switch (state) {
    case 'waiting':
      return "Waiting for an answer. It won't count for or against your score until it comes.";
    case 'found':
      return 'Checked. We found the record.';
    case 'not_found':
      return "We couldn't find a record here. That isn't proof there isn't one.";
    case 'ambiguous':
      return 'We found more than one possible match, so we need you to confirm which.';
    case 'error':
      return "We couldn't reach this source just now. We'll keep trying, and it won't count for or against your score.";
    case 'unavailable':
      return "This source isn't connected yet. It won't count for or against your score.";
    case 'unsupported':
      return "We need a detail from you, such as a number, before we can check this source. It won't count for or against your score.";
  }
}

export function sourceDto(connectorId: string, sourceName: string, row: SourceRow | undefined): ScanSource {
  const state = (row?.status ?? 'waiting') as ScanSource['state'];
  return {
    connectorId,
    sourceName: row?.sourceName ?? sourceName,
    title: SOURCE_TITLES[connectorId] ?? sourceName,
    state,
    // A source short of an identifier says which one in its own words.
    summary: state === 'unsupported' && row?.message ? row.message : summaryOf(connectorId, state),
    // A vendor still preparing its report is waiting, not down.
    down: row ? isDown(row.status) && row.status !== 'waiting' : false,
    lastTriedAt: row?.retrievedAt.toISOString() ?? null,
    sampleData: row?.isFixture ?? false,
  };
}

function nameOf(deps: AppDeps, connectorId: string): string {
  return deps.connectors.find((connector) => connector.id === connectorId)?.sourceName ?? connectorId;
}

export async function scanDto(deps: AppDeps, tx: Tx, row: ScanRow): Promise<Scan> {
  // A re-score runs no sources, so it reports the newest answer from each.
  const rows =
    row.kind === 'full'
      ? await tx.select().from(sourceResult).where(eq(sourceResult.scanId, row.id))
      : await latestSources(tx, row.companyId);
  const byId = new Map(rows.map((item) => [item.connectorId, item]));
  const ids = row.kind === 'full' ? row.connectors : rows.map((item) => item.connectorId);
  const sources = ids.map((id) => sourceDto(id, nameOf(deps, id), byId.get(id)));
  const moving = row.status === 'queued' || row.status === 'running';
  return {
    id: row.id,
    companyId: row.companyId,
    kind: row.kind as Scan['kind'],
    trigger: row.trigger,
    status: row.status as Scan['status'],
    startedAt: row.startedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    checksDone: sources.filter((source) => source.state !== 'waiting' && !source.down).length,
    checksDown: sources.filter((source) => source.down).length,
    checksTotal: sources.length,
    sources,
    rulePackVersions: row.rulePackVersions as Record<string, string>,
    pollAfterMs: moving ? POLL_AFTER_MS : 0,
  };
}

export function registerScanRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.scans.create, { auth: 'org', permission: 'scans.write' }, async ({ org, session, params, meta }) => {
    const scanId = await startFullScan(deps, org.organisationId, params.companyId, { trigger: 'user', requestedBy: session.userId });
    return deps.db.withOrg(org.organisationId, async (tx) => {
      const [row] = await tx.select().from(scan).where(eq(scan.id, scanId));
      if (!row) throw errors.notFound('That scan');
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'scan.requested', target: scanId, meta });
      return scanDto(deps, tx, row);
    });
  });

  defineRoute(app, deps, contract.scans.list, { auth: 'org', permission: 'companies.read' }, async ({ org, params }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      await requireCompany(tx, params.companyId);
      const rows = await tx
        .select()
        .from(scan)
        .where(eq(scan.companyId, params.companyId))
        .orderBy(desc(scan.createdAt), desc(scan.id))
        .limit(20);
      const scans: Scan[] = [];
      for (const row of rows) scans.push(await scanDto(deps, tx, row));
      return { scans };
    }),
  );

  defineRoute(app, deps, contract.scans.get, { auth: 'org', permission: 'companies.read' }, async ({ org, params }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const [row] = await tx.select().from(scan).where(eq(scan.id, params.scanId));
      if (!row) throw errors.notFound('That scan');
      return scanDto(deps, tx, row);
    }),
  );
}

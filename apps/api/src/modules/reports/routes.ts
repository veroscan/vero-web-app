import { badgeEligibility, LAYER_NAMES, SCORING, statusWord } from '@vero/rules';
import {
  COUNTRY_LABELS,
  countryName,
  countryPlace,
  contract,
  PLAN_ENTITLEMENTS,
  publicReportResponseSchema,
  type BadgeStatusResponse,
  type MvpCountry,
  type PublicReportResponse,
  type ShareLink,
} from '@vero/shared';
import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema, type Tx } from '../../db';
import type { AppDeps } from '../../deps';
import { AppError, errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import { hashToken, randomToken } from '../../lib/crypto';
import { writeAudit } from '../audit/service';
import { planPrices } from '../billing/routes';
import { isOwned, requireOwned } from '../companies/ownership';
import { parseInvitationToken } from '../organisations/service';
import { planOf, requireEntitlement } from '../plans/service';
import { declareMissing, undeclareMissing } from '../vault/service';
import { coverageFor, homeRegisterFor, isDown, latestSources, requireCompany, SAMPLE_NOTE } from '../scans/facts';
import {
  buildArea,
  buildIssueDetail,
  buildIssueList,
  buildOverview,
  buildProjection,
  isOpenFinding,
  loadResults,
  NOT_LEGAL_ADVICE,
} from './results';

const { verificationBadge, sharedReport, document: documentTable, scan: scanTable, publicTokenIndex } = schema;

/** The badge needs a full scan this recent, and never outlives it. */
const SCAN_DAYS = SCORING.badge.full_scan_valid_days;
const DAY_MS = 86_400_000;

/** When the newest finished full scan ran. Re-scores don't count: they don't ask the sources again. */
async function lastFullScan(tx: Tx, companyId: string): Promise<Date | null> {
  const [row] = await tx
    .select({ at: scanTable.completedAt })
    .from(scanTable)
    .where(and(eq(scanTable.companyId, companyId), eq(scanTable.kind, 'full'), isNotNull(scanTable.finalisedSeq), isNotNull(scanTable.completedAt)))
    .orderBy(desc(scanTable.completedAt))
    .limit(1);
  return row?.at ?? null;
}

const FOLLOWED_BLOCKER = "You follow this company, so it can't have a badge here. Only the team that owns it can take one.";

async function badgeStatus(deps: AppDeps, tx: Tx, organisationId: string, companyId: string): Promise<BadgeStatusResponse> {
  const set = await loadResults(deps, tx, organisationId, companyId, 'company');
  const scanned = await lastFullScan(tx, companyId);
  const owned = set.companies[0] ? isOwned(set.companies[0]) : true;
  const check = badgeEligibility({ overall: set.score.overall, findings: set.findings, last_full_scan_on: scanned?.toISOString() ?? null, as_of: deps.now() });
  const now = deps.now();
  const [badge] = await tx
    .select()
    .from(verificationBadge)
    .where(eq(verificationBadge.companyId, companyId))
    .orderBy(desc(verificationBadge.issuedAt))
    .limit(1);
  const exact = set.entitlements.exactScore;
  return {
    companyId,
    // Free can't have one, and is told so in the same words as anyone else. Nor can a followed company.
    eligible: owned && set.entitlements.publicSharing && check.eligible,
    blockers: !owned ? [FOLLOWED_BLOCKER] : set.entitlements.publicSharing ? check.blockers : ['The verified badge is part of a paid plan.'],
    requirements: {
      minScore: SCORING.badge.min_score,
      currentScore: exact ? set.score.overall : null,
      minCoveragePercent: Math.round(SCORING.badge.min_coverage * 100),
      coverage: exact ? set.score.coverage : null,
      openUrgent: exact ? set.findings.filter((item) => isOpenFinding(item) && item.severity === 'critical').length : null,
      lastFullScanOn: scanned?.toISOString().slice(0, 10) ?? null,
      fullScanWithinDays: SCAN_DAYS,
    },
    badge: badge
      ? {
          id: badge.id,
          issuedAt: badge.issuedAt.toISOString(),
          expiresAt: badge.expiresAt.toISOString(),
          scoreAtIssue: Math.round(Number(badge.scoreAtIssue)),
          active: badge.revokedAt === null && badge.expiresAt > now,
        }
      : null,
  };
}

/**
 * The public summary, frozen when the link is made. Built field by field from an allow-list.
 * It holds counts and words: no document, no issue text, no rule name, no person.
 */
async function buildPublicSummary(deps: AppDeps, tx: Tx, organisationId: string, companyId: string): Promise<Omit<PublicReportResponse, 'expiresAt'>> {
  const set = await loadResults(deps, tx, organisationId, companyId, 'company');
  const company = await requireCompany(tx, companyId);
  const open = set.findings.filter(isOpenFinding);
  const count = (severities: string[], layer?: number) =>
    open.filter((item) => severities.includes(item.severity) && (layer === undefined || item.layer === layer)).length;
  const sources = await latestSources(tx, companyId);
  const sample = sources.some((source) => source.isFixture);
  const anyUp = sources.some((source) => !isDown(source.status));
  const country = company.incorporationCountry;
  const label = country in COUNTRY_LABELS ? COUNTRY_LABELS[country as MvpCountry] : countryName(country);
  const checked: PublicReportResponse['checked'] = [];
  const register = homeRegisterFor(deps.connectors, country);
  if (country !== 'US-DE' && country !== 'GB' && country !== 'NG') {
    // Any other country: say only what its own register told us, and never that it was checked when it wasn't.
    const answered = register ? sources.some((source) => source.connectorId === register.id && !isDown(source.status)) : false;
    checked.push({
      country: label,
      howWeKnow: !register
        ? `Not checked: we can't read the company register in ${countryPlace(country)} yet.`
        : answered
          ? `Checked with ${register.sourceName}.`
          : "Not checked: the register couldn't be reached.",
    });
  } else if (country === 'US-DE') {
    const [certificate] = await tx
      .select({ dated: documentTable.documentDate })
      .from(documentTable)
      .innerJoin(schema.vaultSlot, eq(schema.vaultSlot.id, documentTable.slotId))
      .where(
        and(
          eq(documentTable.companyId, companyId),
          eq(schema.vaultSlot.key, 'de_good_standing'),
          eq(documentTable.status, 'filed'),
          eq(documentTable.validated, true),
        ),
      )
      .orderBy(desc(documentTable.createdAt))
      .limit(1);
    checked.push({
      country: label,
      howWeKnow: certificate?.dated
        ? `Certificate of good standing, dated ${certificate.dated}. The company uploaded this and we read it.`
        : "No certificate of good standing on file. Delaware doesn't allow automatic status checks.",
    });
  } else if (anyUp) {
    checked.push({
      country: label,
      howWeKnow: country === 'GB' ? 'Checked with Companies House.' : 'Checked with the Corporate Affairs Commission (CAC) through a licensed provider.',
    });
  } else {
    checked.push({ country: label, howWeKnow: "Not checked: the register couldn't be reached." });
  }
  const exact = set.score.overall;
  return {
    companyName: company.legalName,
    score: exact,
    statusWord: exact === null ? null : statusWord(exact, set.score.coverage),
    coverage: set.score.coverage,
    heldByUrgent: set.score.held_by_urgent,
    reportDate: deps.now().toISOString(),
    openIssues: {
      total: open.length,
      urgent: count(['critical']),
      important: count(['high']),
      worthDoing: count(['medium', 'low']),
    },
    areas: set.score.layers.map((layer) => ({
      name: LAYER_NAMES[layer.layer] ?? '',
      score: layer.score,
      statusWord: layer.score === null ? null : statusWord(layer.score, layer.coverage),
      openUrgent: count(['critical'], layer.layer),
      openImportant: count(['high'], layer.layer),
      openWorthDoing: count(['medium', 'low'], layer.layer),
    })),
    checked: sample ? checked.map((item) => ({ ...item, howWeKnow: `${item.howWeKnow} ${SAMPLE_NOTE}` })) : checked,
    countryCoverage: coverageFor(country, deps.connectors),
    sampleData: sample,
    notLegalAdvice: 'This is a signal, not legal advice or full due diligence. It shows what had been checked on the date above.',
  };
}

function shareDto(row: typeof sharedReport.$inferSelect, now: Date): ShareLink {
  return {
    id: row.id,
    companyId: row.companyId,
    expiresAt: row.expiresAt.toISOString(),
    revokedAt: row.revokedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    active: row.revokedAt === null && row.expiresAt > now,
  };
}

/**
 * A new public token: random, and carrying no id of ours (audit fix, 19 Nov 2026). Its hash is
 * looked up in public_token_index, a system-scope table of ids only, to find the one tenant to
 * enter. Links made before then still have the old "<organisation id>.<random>" form and keep working.
 */
function newPublicToken(): { token: string; hash: string } {
  const token = randomToken();
  return { token, hash: hashToken(token) };
}

async function indexPublicToken(deps: AppDeps, input: { hash: string; kind: 'share' | 'badge'; organisationId: string; refId: string }): Promise<void> {
  await deps.db.withSystem((tx) => tx.insert(publicTokenIndex).values({ tokenHash: input.hash, kind: input.kind, tenantId: input.organisationId, refId: input.refId }));
}

/** Which tenant a public token belongs to, or null. One answer for every kind of bad link. */
async function resolvePublicToken(deps: AppDeps, token: string, kind: 'share' | 'badge'): Promise<{ organisationId: string; tokenHash: string } | null> {
  if (token.includes('.')) return parseInvitationToken(token);
  const tokenHash = hashToken(token);
  const [row] = await deps.db.withSystem((tx) =>
    tx.select({ tenantId: publicTokenIndex.tenantId, kind: publicTokenIndex.kind }).from(publicTokenIndex).where(eq(publicTokenIndex.tokenHash, tokenHash)),
  );
  return row && row.kind === kind ? { organisationId: row.tenantId, tokenHash } : null;
}

function linkGone(): AppError {
  return errors.notFound('That link');
}

async function enforcePublicLimit(deps: AppDeps, ip: string): Promise<void> {
  await deps.limiter.enforce(`public:${deps.secrets.hmac('rate-limit', ip)}`, deps.config.rateLimits.publicPerIpPerMinute, 60);
}

export function registerReportRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.plans.list, { auth: 'org', permission: 'organisation.read' }, async ({ org }) => {
    const current = await deps.db.withOrg(org.organisationId, (tx) => planOf(tx, org.organisationId, deps.config));
    // From Stripe when payments are on; null otherwise. Never a number written in code.
    const prices = await planPrices(deps);
    return {
      current,
      plans: (['free', 'growth', 'scale'] as const).map((code) => ({
        code,
        name: code === 'free' ? 'Free' : code === 'growth' ? 'Growth' : 'Scale',
        priceMinor: prices[code].priceMinor,
        currency: prices[code].currency,
        entitlements: PLAN_ENTITLEMENTS[code],
      })),
    };
  });

  defineRoute(app, deps, contract.results.overview, { auth: 'org', permission: 'results.read' }, async ({ org, session, params, query }) =>
    deps.db.withOrg(org.organisationId, (tx) => buildOverview(deps, tx, org.organisationId, params.companyId, query.scope, session.userId)),
  );

  defineRoute(app, deps, contract.results.issues, { auth: 'org', permission: 'results.read' }, async ({ org, params, query }) =>
    deps.db.withOrg(org.organisationId, (tx) => buildIssueList(deps, tx, org.organisationId, params.companyId, query)),
  );

  defineRoute(app, deps, contract.results.issue, { auth: 'org', permission: 'results.read' }, async ({ org, params }) =>
    deps.db.withOrg(org.organisationId, (tx) => buildIssueDetail(deps, tx, org.organisationId, params.companyId, params.ruleKey)),
  );

  defineRoute(app, deps, contract.results.area, { auth: 'org', permission: 'results.read' }, async ({ org, params, query }) =>
    deps.db.withOrg(org.organisationId, (tx) => buildArea(deps, tx, org.organisationId, params.companyId, params.layer, query.scope)),
  );

  defineRoute(app, deps, contract.results.projection, { auth: 'org', permission: 'results.read' }, async ({ org, params, query, body }) =>
    deps.db.withOrg(org.organisationId, (tx) => buildProjection(deps, tx, org.organisationId, params.companyId, { scope: query.scope, ruleKeys: body.ruleKeys, fixes: body.fixes })),
  );

  defineRoute(app, deps, contract.results.declareMissing, { auth: 'org', permission: 'answers.write' }, async ({ org, session, params, meta }) => {
    const rescoreQueued = await declareMissing(deps, { organisationId: org.organisationId, companyId: params.companyId, ruleKey: params.ruleKey, userId: session.userId, meta });
    return { ruleKey: params.ruleKey, declaredMissing: true, rescoreQueued };
  });

  defineRoute(app, deps, contract.results.undeclareMissing, { auth: 'org', permission: 'answers.write' }, async ({ org, session, params, meta }) => {
    const rescoreQueued = await undeclareMissing(deps, { organisationId: org.organisationId, companyId: params.companyId, ruleKey: params.ruleKey, userId: session.userId, meta });
    return { ruleKey: params.ruleKey, declaredMissing: false, rescoreQueued };
  });

  // ---- Badge ----

  defineRoute(app, deps, contract.badge.get, { auth: 'org', permission: 'results.read' }, async ({ org, params }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      await requireCompany(tx, params.companyId);
      return badgeStatus(deps, tx, org.organisationId, params.companyId);
    }),
  );

  defineRoute(app, deps, contract.badge.issue, { auth: 'org', permission: 'sharing.manage' }, async ({ org, session, params, meta }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      requireOwned(await requireCompany(tx, params.companyId));
      const before = await badgeStatus(deps, tx, org.organisationId, params.companyId);
      if (!before.eligible) throw new AppError(409, 'not_eligible', before.blockers[0] ?? "You can't have the badge yet.");
      const now = deps.now();
      // Good until the full scan behind it is 90 days old: a new full scan and a new badge renew it.
      const scanned = (await lastFullScan(tx, params.companyId)) ?? now;
      const scanDay = Date.UTC(scanned.getUTCFullYear(), scanned.getUTCMonth(), scanned.getUTCDate());
      const expiresAt = new Date(scanDay + (SCAN_DAYS + 1) * DAY_MS);
      // One live badge at a time: a new one replaces the old link.
      await tx.update(verificationBadge).set({ revokedAt: now }).where(and(eq(verificationBadge.companyId, params.companyId), isNull(verificationBadge.revokedAt)));
      const { token, hash } = newPublicToken();
      const [issued] = await tx.insert(verificationBadge).values({
        organisationId: org.organisationId,
        companyId: params.companyId,
        issuedAt: now,
        expiresAt,
        scoreAtIssue: String(before.requirements.currentScore ?? 0),
        publicToken: hash,
      }).returning({ id: verificationBadge.id });
      if (!issued) throw errors.internal();
      await indexPublicToken(deps, { hash, kind: 'badge', organisationId: org.organisationId, refId: issued.id });
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'badge.issued', target: params.companyId, meta });
      return { ...(await badgeStatus(deps, tx, org.organisationId, params.companyId)), publicToken: token };
    }),
  );

  defineRoute(app, deps, contract.badge.revoke, { auth: 'org', permission: 'sharing.manage' }, async ({ org, session, params, meta }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      await requireCompany(tx, params.companyId);
      await tx.update(verificationBadge).set({ revokedAt: deps.now() }).where(and(eq(verificationBadge.companyId, params.companyId), isNull(verificationBadge.revokedAt)));
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'badge.revoked', target: params.companyId, meta });
      return { ok: true as const };
    }),
  );

  // ---- Share links ----

  defineRoute(app, deps, contract.shares.list, { auth: 'org', permission: 'sharing.manage' }, async ({ org, params }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      await requireCompany(tx, params.companyId);
      const rows = await tx.select().from(sharedReport).where(eq(sharedReport.companyId, params.companyId)).orderBy(desc(sharedReport.createdAt));
      return { links: rows.map((row) => shareDto(row, deps.now())) };
    }),
  );

  defineRoute(app, deps, contract.shares.create, { auth: 'org', permission: 'sharing.manage' }, async ({ org, session, params, body, meta }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      requireOwned(await requireCompany(tx, params.companyId));
      const plan = await planOf(tx, org.organisationId, deps.config);
      requireEntitlement(PLAN_ENTITLEMENTS[plan], 'publicSharing', 'A public share link');
      const summary = await buildPublicSummary(deps, tx, org.organisationId, params.companyId);
      if (summary.score === null) throw errors.invalidState('Run a scan first, so there is something to share.');
      const { token, hash } = newPublicToken();
      const now = deps.now();
      const [row] = await tx
        .insert(sharedReport)
        .values({
          organisationId: org.organisationId,
          companyId: params.companyId,
          tokenHash: hash,
          summary,
          createdBy: session.userId,
          expiresAt: new Date(now.getTime() + body.expiresInDays * 86_400_000),
        })
        .returning();
      if (!row) throw errors.internal();
      await indexPublicToken(deps, { hash, kind: 'share', organisationId: org.organisationId, refId: row.id });
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'share.created', target: row.id, metadata: { days: body.expiresInDays }, meta });
      return { ...shareDto(row, now), token };
    }),
  );

  defineRoute(app, deps, contract.shares.revoke, { auth: 'org', permission: 'sharing.manage' }, async ({ org, session, params, meta }) =>
    deps.db.withOrg(org.organisationId, async (tx) => {
      const rows = await tx.update(sharedReport).set({ revokedAt: deps.now() }).where(eq(sharedReport.id, params.shareId)).returning({ id: sharedReport.id });
      if (rows.length === 0) throw errors.notFound('That link');
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'share.revoked', target: params.shareId, meta });
      return { ok: true as const };
    }),
  );

  // ---- Public. No sign-in, rate limited, and one answer for every kind of bad link. ----

  defineRoute(app, deps, contract.public.report, { auth: 'public' }, async ({ params, meta }) => {
    await enforcePublicLimit(deps, meta.ip);
    const parsed = await resolvePublicToken(deps, params.token, 'share');
    if (!parsed) throw linkGone();
    const row = await deps.db.withOrg(parsed.organisationId, async (tx) => {
      const [found] = await tx.select().from(sharedReport).where(eq(sharedReport.tokenHash, parsed.tokenHash));
      if (!found) return null;
      // An exact score is a paid feature, so a downgraded organisation's links stop answering.
      return PLAN_ENTITLEMENTS[await planOf(tx, parsed.organisationId, deps.config)].publicSharing ? found : null;
    });
    if (!row || row.revokedAt !== null || row.expiresAt <= deps.now()) throw linkGone();
    // The stored summary still goes through the schema, so nothing else can ever leave.
    return publicReportResponseSchema.parse({ ...(row.summary as object), expiresAt: row.expiresAt.toISOString() });
  });

  defineRoute(app, deps, contract.public.badge, { auth: 'public' }, async ({ params, meta }) => {
    await enforcePublicLimit(deps, meta.ip);
    const parsed = await resolvePublicToken(deps, params.token, 'badge');
    if (!parsed) throw linkGone();
    return deps.db.withOrg(parsed.organisationId, async (tx) => {
      const [row] = await tx
        .select({ badge: verificationBadge, name: schema.company.legalName })
        .from(verificationBadge)
        .innerJoin(schema.company, eq(schema.company.id, verificationBadge.companyId))
        .where(eq(verificationBadge.publicToken, parsed.tokenHash));
      if (!row || row.badge.revokedAt !== null || row.badge.expiresAt <= deps.now()) throw linkGone();
      if (!PLAN_ENTITLEMENTS[await planOf(tx, parsed.organisationId, deps.config)].publicSharing) throw linkGone();
      return {
        companyName: row.name,
        verified: true as const,
        // The badge says only what Vero checked. No lawyer reviewed it (owner's decision, 19 Nov 2026).
        reviewedBy: 'Vero',
        issuedAt: row.badge.issuedAt.toISOString(),
        expiresAt: row.badge.expiresAt.toISOString(),
        scoreAtIssue: Math.round(Number(row.badge.scoreAtIssue)),
        notLegalAdvice: NOT_LEGAL_ADVICE,
      };
    });
  });
}


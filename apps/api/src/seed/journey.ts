import type { Coverage, ScoreView } from '@vero/shared';
import { and, eq, isNotNull } from 'drizzle-orm';
import { DEMO_ORGANISATION_ID, DEMO_USER_ID, seedDemoData } from '../db/seed';
import { enterOrg, schema } from '../db';
import type { AppDeps } from '../deps';
import { InProcessQueue } from '../infra';
import { registerJobHandlers } from '../jobs';
import { changePlan } from '../modules/admin/routes';
import { saveCompanyAnswers } from '../modules/questionnaire/routes';
import { buildOverview, loadResults } from '../modules/reports/results';
import { requireCompany } from '../modules/scans/facts';
import { startFullScan } from '../modules/scans/pipeline';
import { confirmDocument, declareMissing, uploadDocument, vaultView } from '../modules/vault/service';
import { samplePdf } from './sample-pdf';

export const DEMO_LAWYER_ID = '00000000-0000-4000-8000-00000000b002';
export const DEMO_LAWYER_EMAIL = 'lawyer@codeclause.example';
export const DEMO_ADMIN_ID = '00000000-0000-4000-8000-00000000b003';
export const DEMO_ADMIN_EMAIL = 'admin@codeclause.example';

const INC = '00000000-0000-4000-8000-00000000c001';
const UK = '00000000-0000-4000-8000-00000000c002';
const NG = '00000000-0000-4000-8000-00000000c003';

const META = { ip: '127.0.0.1', userAgent: 'demo-seed' };

/** Fictional company kept on Free, so a first read can always be seen. */
export const DEMO_FREE_ORGANISATION_ID = '00000000-0000-4000-8000-00000000a002';
export const DEMO_FREE_USER_ID = '00000000-0000-4000-8000-00000000b004';
export const DEMO_FREE_EMAIL = 'founder@wrenlabs.example';
const WREN = '00000000-0000-4000-8000-00000000c004';

/** Plain answers, the same for each entity except where a country asks its own questions. */
const COMMON_ANSWERS: Record<string, string | number | boolean | string[]> = {
  investor_countries: ['US'],
  has_raised_or_raising: true,
  raised_priced_round: false,
  has_employees: true,
  last_hire_on: '2026-02-02',
  has_contractors: true,
  has_foreign_workers: false,
  revenue_band: 'under_1m',
  headcount_band: '11_50',
  processes_personal_data: true,
  sensitive_data: ['financial'],
  data_hosted_abroad: true,
  uses_processors: true,
  has_website: true,
  website_url: 'https://kestrelpay.example',
  has_app: true,
  trackers: ['analytics'],
  marketing_consent: 'opt_in',
  sends_sms_or_calls: false,
  ai_roles: ['deployer'],
  ai_use_cases: ['chatbot'],
  ai_uses_third_party_models: true,
  staff_use_ai: true,
  automated_decisions: false,
  payments_mode: ['psp_only'],
  has_partner_agreement: true,
  sectors: ['none'],
  customer_type: 'both',
  has_subscriptions: true,
  sells_to_enterprise: true,
  enterprise_demands_escrow: false,
  offers_api: true,
  sells_physical_products: false,
  user_generated_content: false,
  users_under_18: false,
  ip_founders_signed: true,
  ip_employees_signed: true,
  // The story: the lead developer built the product and never signed the code over.
  ip_contractors_signed: false,
  ip_preincorp_assigned: true,
  has_patentable_technology: false,
  grants_equity_to_staff: true,
  pays_foreign_for_technology: false,
  ip_moved_offshore: false,
  exports_controlled_tech: false,
};

const ENTITIES = [
  { id: INC, answers: { ...COMMON_ANSWERS, user_countries: ['US'], us_states: ['other'], employee_countries: [], contractor_countries: ['NG'], entity_type_us: 'c_corp', foreign_ownership_25_plus: true, foreign_entity_registered_in_us: false, operates_in_delaware: false, does_business_in_other_states: false, has_delaware_employees: false, founders_restricted_stock: false } },
  { id: UK, answers: { ...COMMON_ANSWERS, user_countries: ['GB'], employee_countries: ['GB'], contractor_countries: ['NG'], entity_type_gb: 'ltd', data_subjects_gb_12m: 4200, has_premises: false, offers_account_information_services: false } },
  { id: NG, answers: { ...COMMON_ANSWERS, user_countries: ['NG'], employee_countries: ['NG'], contractor_countries: ['NG'], entity_type_ng: 'ltd', ng_small_company: false, foreign_shareholders_or_directors: true, data_subjects_ng_6m: 3100, data_subjects_ng_12m: 5200, ndpc_category: 'dont_know', supplies_government: false } },
];

/**
 * What the demo company hasn't got round to yet, so its gaps are its own and not chance. The
 * rest of its slots get a real uploaded sample document. Nothing here touches a score.
 */
const NOT_FILED = /(contractor_ip_assignment|team_ip_assignment|ng_team|ng_invention|shareholders?_agreement|investor_agreements|round_documents|ai_(governance|use|acceptable)|acceptable_use|dpia|trademark$)/;

/** Rules whose document the demo says it really doesn't have, so they're real gaps. */
const STATED_MISSING: Readonly<Record<string, readonly string[]>> = {
  [INC]: ['US-DE.EQUITY.SHAREHOLDER_AGREEMENT'],
  [UK]: ['GB.EQUITY.SHAREHOLDERS_AGREEMENT'],
  [NG]: ['NG.EQUITY.SHAREHOLDERS_AGREEMENT'],
};

function sampleLines(label: string): string[] {
  return ['SAMPLE DOCUMENT, NOT A REAL RECORD', label, 'Kestrel Pay (fictional)', 'Signed by Amara Okafor'];
}

export interface DemoReport {
  ran: boolean;
  /** The Free first read: a range. */
  /** exactIfPaid is what the same empty company would see on a paid plan: the findings are the same. */
  firstRead: { company: string; low: number | null; high: number | null; coverage: Coverage | null; exactIfPaid: number | null }[];
  /** The first read across the whole group, as the home screen shows it. */
  firstReadGroup: { low: number | null; high: number | null; coverage: Coverage | null; exactIfPaid: number | null };
  growth: { company: string; score: number | null; statusWord: string | null; openIssues: number; coverage: Coverage | null; heldByUrgent: boolean }[];
  group: number | null;
  groupCoverage: Coverage | null;
  documentsFiled: number;
  topIssue: string | null;
  free: { low: number | null; high: number | null; coverage: Coverage | null };
}

function rangeOf(view: ScoreView): { low: number | null; high: number | null } {
  return view.kind === 'approximate' ? { low: view.low, high: view.high } : { low: null, high: null };
}

/**
 * Takes the demo through the real product: answers, a real scan in fixture mode and a Free first
 * read, then an upgrade and real uploads. No score, finding or fact is ever
 * written directly here. Refuses anything but fixture mode. If the demo has a result, it stops.
 */
export async function seedDemoJourney(deps: AppDeps): Promise<DemoReport> {
  const empty: DemoReport = { ran: false, firstRead: [], firstReadGroup: { low: null, high: null, coverage: null, exactIfPaid: null }, growth: [], group: null, groupCoverage: null, documentsFiled: 0, topIssue: null, free: { low: null, high: null, coverage: null } };
  if (deps.config.connectorMode !== 'fixture') {
    throw new Error('The demo journey runs only with CONNECTOR_MODE=fixture, so its sample data can never mix with real data.');
  }
  await seedDemoData(deps.db);

  const already = await deps.db.withOrg(DEMO_ORGANISATION_ID, (tx) =>
    tx.select({ id: schema.scan.id }).from(schema.scan).where(and(eq(schema.scan.organisationId, DEMO_ORGANISATION_ID), isNotNull(schema.scan.finalisedSeq))).limit(1),
  );
  if (already.length > 0) return empty;

  // Setting up the fictional organisations and staff. This is the part an admin would do.
  await deps.db.withSystem(async (tx) => {
    await tx.insert(schema.user).values({ id: DEMO_LAWYER_ID, email: DEMO_LAWYER_EMAIL, name: 'Demo Lawyer' }).onConflictDoNothing();
    await tx.insert(schema.user).values({ id: DEMO_ADMIN_ID, email: DEMO_ADMIN_EMAIL, name: 'Demo Admin' }).onConflictDoNothing();
    await tx.insert(schema.user).values({ id: DEMO_FREE_USER_ID, email: DEMO_FREE_EMAIL, name: 'Wren Founder' }).onConflictDoNothing();
    await tx.insert(schema.platformStaff).values({ userId: DEMO_LAWYER_ID, role: 'lawyer' }).onConflictDoNothing();
    await tx.insert(schema.platformStaff).values({ userId: DEMO_ADMIN_ID, role: 'admin' }).onConflictDoNothing();

    await enterOrg(tx, DEMO_ORGANISATION_ID);
    await tx.update(schema.company).set({ yearEndMonth: 12, yearEndDay: 31 }).where(eq(schema.company.organisationId, DEMO_ORGANISATION_ID));
    await tx.update(schema.company).set({ parentCompanyId: INC }).where(eq(schema.company.id, UK));
    await tx.update(schema.company).set({ parentCompanyId: INC }).where(eq(schema.company.id, NG));

    await enterOrg(tx, DEMO_FREE_ORGANISATION_ID);
    await tx.insert(schema.organisation).values({ id: DEMO_FREE_ORGANISATION_ID, name: 'Wren Labs (demo)', isDemo: true }).onConflictDoNothing();
    await tx.insert(schema.membership).values({ organisationId: DEMO_FREE_ORGANISATION_ID, userId: DEMO_FREE_USER_ID, role: 'owner' }).onConflictDoNothing();
    await tx
      .insert(schema.company)
      .values({ id: WREN, organisationId: DEMO_FREE_ORGANISATION_ID, legalName: 'Wren Labs Ltd', incorporationCountry: 'GB', registrationNumber: 'DEMO-GB-0004', stage: 'pre_seed', createdBy: DEMO_FREE_USER_ID })
      .onConflictDoNothing();
  });

  if (deps.queue instanceof InProcessQueue) registerJobHandlers(deps);
  const settle = async () => {
    if (deps.queue instanceof InProcessQueue) await deps.queue.drain();
  };
  const overviewOf = (organisationId: string, companyId: string, scope: 'company' | 'group' = 'company') =>
    deps.db.withOrg(organisationId, (tx) => buildOverview(deps, tx, organisationId, companyId, scope));

  // A company that stays on Free.
  await saveCompanyAnswers(deps, DEMO_FREE_ORGANISATION_ID, WREN, DEMO_FREE_USER_ID, {
    ...COMMON_ANSWERS,
    user_countries: ['GB'],
    employee_countries: ['GB'],
    contractor_countries: ['GB'],
    entity_type_gb: 'ltd',
    data_subjects_gb_12m: 800,
    has_premises: false,
    offers_account_information_services: false,
    website_url: 'https://wrenlabs.example',
    ip_contractors_signed: true,
    has_raised_or_raising: false,
    raised_priced_round: false,
    payments_mode: ['none'],
    has_partner_agreement: false,
  }, META);
  await startFullScan(deps, DEMO_FREE_ORGANISATION_ID, WREN, { trigger: 'seed', requestedBy: DEMO_FREE_USER_ID });
  await settle();

  // Kestrel's first read, on Free.
  const firstRead: DemoReport['firstRead'] = [];
  for (const entity of ENTITIES) {
    await saveCompanyAnswers(deps, DEMO_ORGANISATION_ID, entity.id, DEMO_USER_ID, entity.answers, META);
    await startFullScan(deps, DEMO_ORGANISATION_ID, entity.id, { trigger: 'seed', requestedBy: DEMO_USER_ID });
    await settle();
    const read = await overviewOf(DEMO_ORGANISATION_ID, entity.id);
    const company = await deps.db.withOrg(DEMO_ORGANISATION_ID, (tx) => requireCompany(tx, entity.id));
    const exact = await deps.db.withOrg(DEMO_ORGANISATION_ID, (tx) => loadResults(deps, tx, DEMO_ORGANISATION_ID, entity.id, 'company'));
    firstRead.push({ company: company.legalName, ...rangeOf(read.score), coverage: read.coverage, exactIfPaid: exact.score.overall });
  }

  const firstGroup = await overviewOf(DEMO_ORGANISATION_ID, INC, 'group');
  const exactGroup = await deps.db.withOrg(DEMO_ORGANISATION_ID, (tx) => loadResults(deps, tx, DEMO_ORGANISATION_ID, INC, 'group'));
  const firstReadGroup = { ...rangeOf(firstGroup.score), coverage: firstGroup.coverage, exactIfPaid: exactGroup.score.overall };

  // An admin moves it to Growth. The score doesn't change until the documents go in.
  await changePlan(deps, DEMO_ORGANISATION_ID, 'growth', DEMO_ADMIN_ID, META);
  await settle();

  let documentsFiled = 0;
  for (const entity of ENTITIES) {
    const view = await deps.db.withOrg(DEMO_ORGANISATION_ID, (tx) => vaultView(deps, tx, DEMO_ORGANISATION_ID, entity.id));
    const wanted = view.slots.filter((slot) => !NOT_FILED.test(slot.key));
    const uploaded: { id: string; slot: (typeof wanted)[number] }[] = [];
    for (const slot of wanted) {
      const document = await uploadDocument(deps, {
        organisationId: DEMO_ORGANISATION_ID,
        companyId: entity.id,
        userId: DEMO_USER_ID,
        data: samplePdf(sampleLines(slot.label)),
        fileName: `sample-${slot.key}.pdf`,
        slotKey: slot.key,
        meta: META,
      });
      uploaded.push({ id: document.id, slot });
    }
    await settle();
    for (const { id, slot } of uploaded) {
      await confirmDocument(deps, {
        organisationId: DEMO_ORGANISATION_ID,
        documentId: id,
        userId: DEMO_USER_ID,
        body: {
          slotKey: slot.key,
          confirmSigned: true,
          documentDate: '2026-10-12',
          ...(slot.expires && slot.key !== 'de_good_standing' ? { expiresOn: '2027-10-12' } : {}),
          ...(slot.key === 'de_good_standing' ? { validated: true } : {}),
        },
        meta: META,
      });
      documentsFiled += 1;
    }
    await settle();
  }

  for (const entity of ENTITIES) {
    for (const ruleKey of STATED_MISSING[entity.id] ?? []) {
      await declareMissing(deps, { organisationId: DEMO_ORGANISATION_ID, companyId: entity.id, ruleKey, userId: DEMO_USER_ID, meta: META });
    }
  }
  await settle();

  const growth: DemoReport['growth'] = [];
  for (const entity of ENTITIES) {
    const read = await overviewOf(DEMO_ORGANISATION_ID, entity.id);
    const company = await deps.db.withOrg(DEMO_ORGANISATION_ID, (tx) => requireCompany(tx, entity.id));
    growth.push({
      company: company.legalName,
      score: read.score.kind === 'exact' ? read.score.value : null,
      statusWord: read.statusWord,
      openIssues: read.areas.reduce((sum, area) => sum + (area.openCount ?? 0), 0),
      coverage: read.coverage,
      heldByUrgent: read.heldByUrgent,
    });
  }
  const group = await overviewOf(DEMO_ORGANISATION_ID, INC, 'group');
  const free = await overviewOf(DEMO_FREE_ORGANISATION_ID, WREN);
  return {
    ran: true,
    firstRead,
    firstReadGroup,
    growth,
    group: group.score.kind === 'exact' ? group.score.value : null,
    groupCoverage: group.coverage,
    documentsFiled,
    topIssue: group.nextAction?.title ?? null,
    free: { ...rangeOf(free.score), coverage: free.coverage },
  };
}

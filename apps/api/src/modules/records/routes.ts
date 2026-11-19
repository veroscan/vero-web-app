import { howWeKnow, type EvidenceMethod, type FactValue } from '@vero/rules';
import { contract, type CompanyRecordsResponse, type RecordItem } from '@vero/shared';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import { writeAudit } from '../audit/service';
import { connectorsForSelection, coverageFor, latestSources, requireCompany, SAMPLE_NOTE, selectCompanyPacks } from '../scans/facts';
import { startFullScan } from '../scans/pipeline';
import { scanDto, sourceDto } from '../scans/routes';

interface FieldSpec {
  key: string;
  label: string;
  format?: (value: FactValue) => string;
}

const yesNo = (value: FactValue) => (value === true ? 'Yes' : value === false ? 'No' : String(value));
const countOf = (value: FactValue) => String(value);
const list = (value: FactValue) => (Array.isArray(value) ? value.join(', ') : String(value));

/**
 * What the records page shows per register. Delaware deliberately has no status line here:
 * "vendor_status" exists, and it is not to be presented as a live Delaware status.
 */
const FIELDS: Record<string, FieldSpec[]> = {
  GB: [
    { key: 'registry.uk.companies_house.status', label: 'Status' },
    { key: 'registry.uk.companies_house.company_number', label: 'Company number' },
    { key: 'registry.uk.companies_house.type', label: 'Type' },
    { key: 'registry.uk.companies_house.incorporated_on', label: 'Incorporated' },
    { key: 'registry.uk.companies_house.confirmation_next_due', label: 'Confirmation statement due' },
    { key: 'registry.uk.companies_house.accounts_next_due', label: 'Accounts due' },
    { key: 'registry.uk.companies_house.directors_active_count', label: 'Active directors', format: countOf },
    { key: 'registry.uk.companies_house.officers', label: 'Officers', format: list },
    { key: 'registry.uk.companies_house.directors_idv_outstanding_count', label: 'Director identity checks', format: countOf },
    { key: 'registry.uk.companies_house.pscs', label: 'People with significant control', format: list },
    { key: 'registry.uk.companies_house.charges_outstanding_count', label: 'Outstanding charges', format: countOf },
    { key: 'registry.uk.companies_house.insolvency_case_count', label: 'Insolvency cases', format: countOf },
    { key: 'registry.uk.ico.listed', label: 'On the ICO register', format: yesNo },
    { key: 'registry.uk.hmrc_vat.registered', label: 'VAT registered', format: yesNo },
  ],
  'US-DE': [
    { key: 'registry.us.delaware_vendor.entity_type', label: 'Type' },
    { key: 'registry.us.delaware_vendor.file_number', label: 'File number' },
    { key: 'registry.us.delaware_vendor.formed_on', label: 'Formed' },
    { key: 'registry.us.delaware_vendor.registered_agent', label: 'Registered agent' },
    { key: 'registry.us.delaware_vendor.next_report_due', label: 'Next annual report' },
    { key: 'registry.us.uspto.trademark_marks', label: 'US trademarks', format: list },
    { key: 'registry.us.sec_form_d.filed', label: 'SEC Form D filed', format: yesNo },
  ],
  NG: [
    { key: 'registry.ng.cac.status', label: 'Status' },
    { key: 'registry.ng.cac.rc_number', label: 'RC number' },
    { key: 'registry.ng.cac.type', label: 'Type' },
    { key: 'registry.ng.cac.incorporated_on', label: 'Incorporated' },
    { key: 'registry.ng.cac.directors_count', label: 'Directors', format: countOf },
    { key: 'registry.ng.cac.officers', label: 'Officers', format: list },
    { key: 'registry.ng.cac.shareholders', label: 'Shareholders', format: list },
    { key: 'registry.ng.cac.psc_count', label: 'People with significant control', format: countOf },
    { key: 'registry.ng.cac.tin_issued', label: 'Tax ID (TIN)', format: yesNo },
    { key: 'registry.ng.ndpc.listed', label: 'On the NDPC list', format: yesNo },
  ],
  FR: [
    { key: 'registry.fr.recherche_entreprises.status', label: 'Status' },
    { key: 'registry.fr.recherche_entreprises.siren', label: 'SIREN' },
    { key: 'registry.fr.recherche_entreprises.created_on', label: 'Created' },
    { key: 'registry.fr.recherche_entreprises.directors_count', label: 'Directors', format: countOf },
    { key: 'registry.fr.cnil_dpo.listed', label: 'On the CNIL DPO list', format: yesNo },
  ],
  // Any other country: only what every country has (sanctions, below) until its register is built.
};

const SANCTIONS_FIELD: FieldSpec = {
  key: 'registry.sanctions.match',
  label: 'Sanctions lists',
  format: (value) => (value === true ? 'A possible match to check' : 'No matches'),
};

const DELAWARE_NOTE =
  "Delaware doesn't allow automatic status checks, so we go by your Certificate of Good Standing. Send a new one every year so it stays current.";

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function registerRecordRoutes(app: FastifyInstance, deps: AppDeps): void {
  defineRoute(app, deps, contract.records.get, { auth: 'org', permission: 'companies.read' }, async ({ org, params }) =>
    deps.db.withOrg(org.organisationId, async (tx): Promise<CompanyRecordsResponse> => {
      const company = await requireCompany(tx, params.companyId);
      const rows = await tx.select().from(schema.fact).where(eq(schema.fact.companyId, company.id));
      const facts = new Map(rows.map((row) => [row.key, row]));
      const now = deps.now();

      const items: RecordItem[] = [];
      if (company.incorporationCountry === 'US-DE') {
        // Never a live status: only the certificate the person uploaded and checked.
        const validated = facts.get('vault.de_good_standing.validated');
        const dated = facts.get('vault.de_good_standing.dated');
        const certified = validated?.value === true && typeof dated?.value === 'string';
        items.push({
          key: 'good_standing',
          label: 'Good standing',
          value: certified ? `Certified ${formatDate(dated.value as string)}` : 'No certificate on file',
          needsYou: !certified,
          source: certified ? 'Your Certificate of Good Standing' : null,
          retrievedAt: certified ? (dated?.retrievedAt.toISOString() ?? null) : null,
          howWeKnow: certified ? 'You uploaded this and we read it' : "Upload your certificate. Delaware doesn't allow automatic status checks.",
          sampleData: false,
        });
      }
      for (const field of [...(FIELDS[company.incorporationCountry] ?? []), SANCTIONS_FIELD]) {
        const row = facts.get(field.key);
        if (!row) continue;
        const value = row.value as FactValue;
        const words = howWeKnow(
          {
            source: row.source,
            source_name: row.sourceName ?? row.source,
            method: (row.evidenceMethod ?? 'attested') as EvidenceMethod,
            retrieved_at: row.retrievedAt.toISOString(),
          },
          now,
        );
        items.push({
          key: field.key,
          label: field.label,
          value: field.format ? field.format(value) : String(value),
          needsYou: false,
          source: row.sourceName,
          retrievedAt: row.retrievedAt.toISOString(),
          howWeKnow: row.isFixture ? `${words} ${SAMPLE_NOTE}` : words,
          sampleData: row.isFixture,
        });
      }

      const relevant = connectorsForSelection(deps.connectors, company, await selectCompanyPacks(tx, company));
      const sources = await latestSources(tx, company.id);
      const byId = new Map(sources.map((source) => [source.connectorId, source]));
      const checkedAt = sources.map((source) => source.retrievedAt.getTime()).sort((a, b) => b - a)[0];
      return {
        companyId: company.id,
        legalName: company.legalName,
        country: company.incorporationCountry,
        checkedAt: checkedAt ? new Date(checkedAt).toISOString() : null,
        items,
        sources: relevant.map((connector) => sourceDto(connector.id, connector.sourceName, byId.get(connector.id))),
        statusNote: company.incorporationCountry === 'US-DE' ? DELAWARE_NOTE : null,
        countryCoverage: coverageFor(company.incorporationCountry, deps.connectors),
        sampleData: items.some((item) => item.sampleData),
      };
    }),
  );

  defineRoute(app, deps, contract.records.checkAgain, { auth: 'org', permission: 'scans.write' }, async ({ org, session, params, meta }) => {
    await deps.db.withOrg(org.organisationId, (tx) => requireCompany(tx, params.companyId));
    await deps.limiter.enforce(`check-again:${params.companyId}`, deps.config.rateLimits.checkAgainPerCompanyPerHour, 3600);
    const scanId = await startFullScan(deps, org.organisationId, params.companyId, { trigger: 'check_again', requestedBy: session.userId });
    return deps.db.withOrg(org.organisationId, async (tx) => {
      const [row] = await tx.select().from(schema.scan).where(eq(schema.scan.id, scanId));
      if (!row) throw errors.notFound('That scan');
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'records.check_again', target: params.companyId, meta });
      return scanDto(deps, tx, row);
    });
  });
}

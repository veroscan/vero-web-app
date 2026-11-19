import type { Connector, SourceResult } from '@vero/connectors';
import { contract, countryPlace, type LookupRequest, type RegistrySearchResponse } from '@vero/shared';
import { desc } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { schema } from '../../db';
import type { AppDeps } from '../../deps';
import { errors } from '../../http/errors';
import { defineRoute } from '../../http/route';
import { writeAudit } from '../audit/service';
import { notifyOrganisation } from '../notifications/service';
import { coverageFor, homeRegisterFor } from '../scans/facts';
import { lookupSafely, numberFieldFor } from '../scans/pipeline';

const NUMBER_PATTERN = /^[A-Za-z]{0,3}[-\s]?\d[\d-]{2,}$/;

/** Which fact holds what, on each register. */
const FIELDS: Record<string, { name: string; number: string; type: string; formed: string }> = {
  GB: {
    name: 'registry.uk.companies_house.company_name',
    number: 'registry.uk.companies_house.company_number',
    type: 'registry.uk.companies_house.type',
    formed: 'registry.uk.companies_house.incorporated_on',
  },
  'US-DE': {
    name: 'registry.us.delaware_vendor.name',
    number: 'registry.us.delaware_vendor.file_number',
    type: 'registry.us.delaware_vendor.entity_type',
    formed: 'registry.us.delaware_vendor.formed_on',
  },
  NG: {
    name: 'registry.ng.cac.name',
    number: 'registry.ng.cac.rc_number',
    type: 'registry.ng.cac.type',
    formed: 'registry.ng.cac.incorporated_on',
  },
  FR: {
    name: 'registry.fr.recherche_entreprises.registered_name',
    number: 'registry.fr.recherche_entreprises.siren',
    type: 'registry.fr.recherche_entreprises.legal_form_code',
    formed: 'registry.fr.recherche_entreprises.created_on',
  },
};

/**
 * A register added later (docs/GLOBAL-COVERAGE.md) is read by the usual names under its own
 * fact prefix, so it needs no entry above. A name we can't read falls back to what was typed.
 */
function genericFields(prefix: string): { name: string[]; number: string[]; type: string[]; formed: string[] } {
  const under = (names: string[]) => names.map((name) => `${prefix}.${name}`);
  return {
    name: under(['registered_name', 'company_name', 'legal_name', 'name']),
    number: under(['registry_number', 'company_number', 'organisation_number', 'business_id', 'number']),
    type: under(['legal_form', 'entity_type', 'type', 'legal_form_code']),
    formed: under(['incorporated_on', 'registered_on', 'founded_on', 'created_on', 'formed_on']),
  };
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/** We can't search this country's register yet: say so, and let the company be entered by hand. */
function notAvailable(country: string, checkedAt: Date): RegistrySearchResponse {
  const place = countryPlace(country);
  return {
    outcome: 'not_available',
    sourceName: `the company register in ${place}`,
    message: `We can't search the company register in ${place} yet. Enter the company's details yourself. We'll still check international rules and sanctions.`,
    candidates: [],
    checkedAt: checkedAt.toISOString(),
    sampleData: false,
  };
}

function toResponse(result: SourceResult, connector: Connector, country: string, checkedAt: Date, fallbackName: string): RegistrySearchResponse {
  const base = {
    sourceName: connector.sourceName,
    checkedAt: checkedAt.toISOString(),
    sampleData: result.provenance.fixture === true,
  };
  const facts = new Map(result.facts.map((fact) => [fact.key, fact.value]));
  const known = FIELDS[country];
  const generic = genericFields(connector.factPrefix);
  const pick = (keys: string[]) => keys.map((key) => asString(facts.get(key))).find((value) => value !== null) ?? null;
  const fields = known ?? { name: '', number: '', type: '', formed: '' };
  const read = (field: 'name' | 'number' | 'type' | 'formed') => (known ? asString(facts.get(fields[field])) : pick(generic[field]));
  switch (result.status) {
    case 'found':
      return {
        ...base,
        outcome: 'found',
        message: `We found this on ${connector.sourceName}. Check it's yours.`,
        candidates: [
          {
            name: read('name') ?? fallbackName,
            registrationNumber: read('number'),
            registeredAgent: asString(facts.get('registry.us.delaware_vendor.registered_agent')),
            entityType: read('type'),
            incorporatedOn: read('formed'),
            matchConfidence: result.matchConfidence,
          },
        ],
      };
    case 'ambiguous':
      return {
        ...base,
        outcome: 'ambiguous',
        message: `We found more than one possible match on ${connector.sourceName}. Choose yours.`,
        candidates: (result.candidates ?? []).map((candidate) => ({
          name: candidate.name,
          registrationNumber: candidate.identifier ?? null,
          registeredAgent: null,
          entityType: null,
          incorporatedOn: null,
          matchConfidence: result.matchConfidence,
        })),
      };
    case 'not_found':
      return {
        ...base,
        outcome: 'not_found',
        message: `We couldn't find this on ${connector.sourceName}. That doesn't prove it isn't registered, so check the spelling or enter the details yourself.`,
        candidates: [],
      };
    default:
      return {
        ...base,
        outcome: 'source_down',
        message: `We can't reach ${connector.sourceName} just now. You can enter the details yourself and we'll check again later.`,
        candidates: [],
      };
  }
}

function lookupDto(row: typeof schema.lookupRequest.$inferSelect): LookupRequest {
  return {
    id: row.id,
    country: row.country,
    legalName: row.legalName,
    registrationNumber: row.registrationNumber,
    status: row.status as LookupRequest['status'],
    createdAt: row.createdAt.toISOString(),
  };
}

export function registerRegistryRoutes(app: FastifyInstance, deps: AppDeps): void {
  // "A person will look it up". It reaches our team's staff work feed.
  defineRoute(app, deps, contract.registry.requestLookup, { auth: 'org', permission: 'companies.write' }, async ({ org, session, body, meta }) => {
    await deps.limiter.enforce(`lookup-request:${org.organisationId}`, deps.config.rateLimits.lookupRequestsPerOrgPerDay, 86_400);
    const row = await deps.db.withOrg(org.organisationId, async (tx) => {
      const [created] = await tx
        .insert(schema.lookupRequest)
        .values({
          organisationId: org.organisationId,
          country: body.country,
          legalName: body.legalName,
          registrationNumber: body.registrationNumber ?? null,
          note: body.note ?? null,
          requestedBy: session.userId,
        })
        .returning();
      if (!created) throw errors.internal();
      await writeAudit(tx, { organisationId: org.organisationId, actorId: session.userId, action: 'lookup.requested', target: created.id, metadata: { country: body.country }, meta });
      await notifyOrganisation(tx, org.organisationId, {
        // The kind code stays 'lawyer' so older clients and tests still filter it; its words never say lawyer.
        kind: 'lawyer',
        title: "We've asked someone to look this up",
        body: `${body.legalName}. We'll tell you what they find.`,
        dedupeKey: `lookup:${created.id}`,
      });
      return created;
    });
    // The free-text note stays with the client's request, as with orders.
    await deps.db.withSystem((tx) =>
      tx.insert(schema.staffNotification).values({
        tenantId: org.organisationId,
        kind: 'lookup_request',
        refId: row.id,
        title: 'A company to look up by hand',
        body: `${row.legalName}, ${row.country}.`,
      }),
    );
    return lookupDto(row);
  });

  defineRoute(app, deps, contract.registry.lookupRequests, { auth: 'org', permission: 'companies.read' }, async ({ org }) => {
    const rows = await deps.db.withOrg(org.organisationId, (tx) => tx.select().from(schema.lookupRequest).orderBy(desc(schema.lookupRequest.createdAt)));
    return { requests: rows.map(lookupDto) };
  });

  defineRoute(app, deps, contract.registry.search, { auth: 'org', permission: 'companies.write' }, async ({ org, query }) => {
    await deps.limiter.enforce(`registry-search:${org.organisationId}`, deps.config.rateLimits.registrySearchPerOrgPerHour, 3600);
    // Only the country's own register: a global source (GLEIF and the like) isn't one.
    const connector = homeRegisterFor(deps.connectors, query.country);
    const countryCoverage = coverageFor(query.country, deps.connectors);
    if (!connector) return { ...notAvailable(query.country, deps.now()), countryCoverage };

    const isNumber = NUMBER_PATTERN.test(query.q);
    const numberField = numberFieldFor(query.country);
    const result = await lookupSafely(deps, connector, {
      name: query.q,
      jurisdiction: query.country,
      ...(isNumber ? { [numberField]: query.q } : {}),
    });
    return { ...toResponse(result, connector, query.country, deps.now(), query.q), countryCoverage };
  });
}

import { ANY_JURISDICTION, type Connector } from '@vero/connectors';
import {
  answersToFacts,
  hasCountryPack,
  QUESTIONNAIRE,
  selectPacks,
  vaultSlotsForPacks,
  type Answers,
  type EvidenceMethod,
  type Fact,
  type FactValue,
  type PackSelection,
  type SourceState,
} from '@vero/rules';
import { countryCoverage, type CountryCoverage } from '@vero/shared';
import { and, desc, eq, inArray, like } from 'drizzle-orm';
import { schema, type Tx } from '../../db';
import { errors } from '../../http/errors';

export type CompanyRow = typeof schema.company.$inferSelect;
export type SourceRow = typeof schema.sourceResult.$inferSelect;

export const QUESTIONNAIRE_SOURCE = 'questionnaire';
export const ATTESTATION_SOURCE = 'attestation';
export const SAMPLE_NOTE = '(sample data, not a real record)';

export const FIELDS = new Map(QUESTIONNAIRE.flatMap((question) => question.fields).map((field) => [field.id, field]));

export async function requireCompany(tx: Tx, companyId: string): Promise<CompanyRow> {
  const [row] = await tx.select().from(schema.company).where(eq(schema.company.id, companyId));
  if (!row) throw errors.notFound('That company');
  return row;
}

function listAnswer(value: FactValue | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

/**
 * The rules this company is measured against: its country of incorporation in full, plus the
 * compliance rules of each country where it has users or operates. Investor countries add
 * nothing yet: see COVERAGE.md.
 */
export async function selectCompanyPacks(tx: Tx, company: CompanyRow): Promise<PackSelection> {
  const rows = await tx
    .select({ country: schema.companyMarket.country })
    .from(schema.companyMarket)
    .where(and(eq(schema.companyMarket.companyId, company.id), inArray(schema.companyMarket.kind, ['operates', 'users'])));
  const answers = await loadAnswers(tx, company.id);
  return selectPacks({
    incorporation: company.incorporationCountry,
    markets: [...rows.map((row) => row.country), ...listAnswer(answers.user_countries)],
    employee_countries: listAnswer(answers.employee_countries),
  });
}

/**
 * Whether a source covers a company registered in this country: it lists the country, or '*'
 * (every country), or the country a subdivision belongs to ("US" covers "US-CA").
 */
export function coversCountry(connector: Pick<Connector, 'jurisdictions'>, country: string): boolean {
  if (connector.jurisdictions.includes(ANY_JURISDICTION) || connector.jurisdictions.includes(country)) return true;
  const dash = country.indexOf('-');
  return dash > 0 && connector.jurisdictions.includes(country.slice(0, dash));
}

/**
 * Whether this country's own official company register is switched on here: a source listed for
 * the country by name (not only through '*'), that looks companies up, with its settings set.
 * `configured` is read on every call, so setting a key raises the country with no restart.
 */
export function registryOnFor(connectors: readonly Pick<Connector, 'jurisdictions' | 'capabilities' | 'configured'>[], country: string): boolean {
  return connectors.some((connector) => connector.jurisdictions.includes(country) && connector.capabilities.includes('entity_lookup') && connector.configured !== false);
}

/**
 * What a scan can check for a company registered in this country, in one plain sentence. The
 * level comes from the sources this API actually built: "registry" only while the country's own
 * register is switched on. Without connectors, the shared default map is used.
 */
export function coverageFor(country: string, connectors?: readonly Pick<Connector, 'jurisdictions' | 'capabilities' | 'configured'>[]): CountryCoverage {
  const registryOn = connectors === undefined ? undefined : registryOnFor(connectors, country);
  return countryCoverage(country, { countryRules: hasCountryPack(country), ...(registryOn === undefined ? {} : { registryOn }) });
}

/** The country's own company register: listed for it by name (not only through '*'), and it looks companies up. */
export function homeRegisterFor<T extends Pick<Connector, 'jurisdictions' | 'capabilities'>>(connectors: readonly T[], country: string): T | undefined {
  return connectors.find((connector) => connector.jurisdictions.includes(country) && connector.capabilities.includes('entity_lookup'));
}

/**
 * The sources for this selection: every source covering the country of incorporation, global
 * ones included. Abroad, only registers of who may do what, never company registers.
 */
export function connectorsForSelection(connectors: readonly Connector[], company: Pick<CompanyRow, 'incorporationCountry'>, selection: PackSelection): Connector[] {
  // A backup register (OpenCorporates) isn't asked where the country's own register is on.
  const ownRegisterOn = registryOnFor(connectors, company.incorporationCountry);
  return connectors.filter(
    (connector) =>
      !(connector.fallbackRegister && ownRegisterOn) &&
      (coversCountry(connector, company.incorporationCountry) ||
        (selection.overlay_markets.some((market) => connector.jurisdictions.includes(market)) &&
          connector.capabilities.some((capability) => capability === 'dp_registration' || capability === 'licence'))),
  );
}

/** Answers kept for this company, keyed by field id. */
export async function loadAnswers(tx: Tx, companyId: string): Promise<Answers> {
  const rows = await tx
    .select({ key: schema.question.key, value: schema.answer.value })
    .from(schema.answer)
    .innerJoin(schema.question, eq(schema.question.id, schema.answer.questionId))
    .where(eq(schema.answer.companyId, companyId));
  return Object.fromEntries(rows.map((row) => [row.key, row.value as FactValue]));
}

/** What the company record already settles, so nobody is asked twice or can contradict it. */
export function withCompanyAnswers(company: CompanyRow, stored: Answers): Answers {
  return {
    ...stored,
    jurisdiction: company.incorporationCountry,
    incorporated: company.preIncorporation ? false : (stored.incorporated ?? true),
  };
}

/** Rebuilds the facts that come from answers. Fields not showing take their stated default. */
export async function rebuildAnswerFacts(tx: Tx, company: CompanyRow, now: Date): Promise<void> {
  const { facts } = answersToFacts(withCompanyAnswers(company, await loadAnswers(tx, company.id)));
  await tx
    .delete(schema.fact)
    .where(and(eq(schema.fact.companyId, company.id), eq(schema.fact.origin, 'answer'), eq(schema.fact.source, QUESTIONNAIRE_SOURCE)));
  if (facts.length === 0) return;
  await tx.insert(schema.fact).values(
    facts.map((fact) => ({
      organisationId: company.organisationId,
      companyId: company.id,
      key: fact.key,
      value: fact.value,
      origin: 'answer',
      source: QUESTIONNAIRE_SOURCE,
      sourceName: 'You told us',
      evidenceMethod: 'attested',
      retrievedAt: now,
      verificationTier: 5,
    })),
  );
}

/**
 * Rebuilds the facts that come from documents. For each slot the newest filed document
 * counts. A sufficient verdict from the old review desk moves it from "we read it" to "it was reviewed".
 */
export async function rebuildVaultFacts(tx: Tx, company: CompanyRow): Promise<void> {
  const docs = await tx
    .select({
      id: schema.document.id,
      slotKey: schema.vaultSlot.key,
      updatedAt: schema.document.updatedAt,
      createdAt: schema.document.createdAt,
      documentDate: schema.document.documentDate,
      expiresOn: schema.document.expiresOn,
      validated: schema.document.validated,
    })
    .from(schema.document)
    .innerJoin(schema.vaultSlot, eq(schema.vaultSlot.id, schema.document.slotId))
    .where(and(eq(schema.document.companyId, company.id), eq(schema.document.status, 'filed')))
    .orderBy(desc(schema.document.createdAt), desc(schema.document.id));

  const verdicts = docs.length === 0 ? [] : await tx
    .select({ documentId: schema.reviewVerdict.documentId, verdict: schema.reviewVerdict.verdict, createdAt: schema.reviewVerdict.createdAt })
    .from(schema.reviewVerdict)
    .where(and(eq(schema.reviewVerdict.companyId, company.id), inArray(schema.reviewVerdict.documentId, docs.map((doc) => doc.id))))
    .orderBy(desc(schema.reviewVerdict.createdAt));
  const latestVerdict = new Map<string, string>();
  for (const verdict of verdicts) {
    if (verdict.documentId && !latestVerdict.has(verdict.documentId)) latestVerdict.set(verdict.documentId, verdict.verdict);
  }

  await tx.delete(schema.fact).where(and(eq(schema.fact.companyId, company.id), like(schema.fact.key, 'vault.%')));

  const seen = new Set<string>();
  const rows: (typeof schema.fact.$inferInsert)[] = [];
  for (const doc of docs) {
    if (seen.has(doc.slotKey)) continue;
    seen.add(doc.slotKey);
    const reviewed = latestVerdict.get(doc.id) === 'sufficient';
    const common = {
      organisationId: company.organisationId,
      companyId: company.id,
      origin: reviewed ? 'reviewer' : 'document',
      originRef: doc.id,
      source: 'vault',
      sourceName: 'your documents',
      evidenceMethod: reviewed ? 'lawyer' : 'document',
      retrievedAt: doc.updatedAt,
      verificationTier: 4,
    };
    const add = (name: string, value: FactValue) => rows.push({ ...common, key: `vault.${doc.slotKey}.${name}`, value });
    add('present', true);
    if (doc.documentDate) add('dated', doc.documentDate);
    if (doc.expiresOn) add('expires_on', doc.expiresOn);
    if (doc.validated) add('validated', true);
  }
  if (rows.length > 0) await tx.insert(schema.fact).values(rows);
}

/** Facts from a source are replaced whole, but only when the source really answered. */
export async function applySourceFacts(tx: Tx, company: CompanyRow, sources: readonly SourceRow[]): Promise<void> {
  for (const source of sources) {
    if (source.status !== 'found' && source.status !== 'not_found') continue;
    await tx
      .delete(schema.fact)
      .where(and(eq(schema.fact.companyId, company.id), eq(schema.fact.origin, 'connector'), eq(schema.fact.source, source.connectorId)));
    // A null value is a source saying "we can't tell": kept as no fact at all, which the rules read as unknown.
    const facts = (source.facts as { key: string; value: FactValue }[]).filter((fact) => fact.value !== null);
    if (facts.length === 0) continue;
    await tx.insert(schema.fact).values(
      facts.map((fact) => ({
        organisationId: company.organisationId,
        companyId: company.id,
        key: fact.key,
        value: fact.value,
        origin: 'connector',
        originRef: source.id,
        source: source.connectorId,
        sourceName: source.sourceName,
        sourceUrl: source.sourceUrl,
        evidenceMethod: source.evidenceMethod,
        retrievedAt: source.retrievedAt,
        verificationTier: source.evidenceMethod === 'official_live' ? 1 : source.evidenceMethod === 'licensed_vendor' ? 2 : 3,
        matchConfidence: source.matchConfidence,
        isFixture: source.isFixture,
      })),
    );
  }
}

/** The newest answer from each source, whichever scan it came from. */
export async function latestSources(tx: Tx, companyId: string): Promise<SourceRow[]> {
  return tx
    .selectDistinctOn([schema.sourceResult.connectorId])
    .from(schema.sourceResult)
    .where(eq(schema.sourceResult.companyId, companyId))
    .orderBy(schema.sourceResult.connectorId, desc(schema.sourceResult.retrievedAt), desc(schema.sourceResult.createdAt));
}

export function sourceStateOf(status: string): SourceState {
  switch (status) {
    case 'found':
    case 'not_found':
      return 'ok';
    case 'ambiguous':
      return 'ambiguous';
    case 'error':
      return 'error';
    case 'unsupported':
      return 'unsupported';
    case 'waiting':
      return 'waiting';
    default:
      return 'unavailable';
  }
}

/**
 * A source that didn't answer: down, not connected, short of an identifier, or a vendor still
 * preparing its report. It never counts for or against the score, and the retry job asks again.
 */
export function isDown(status: string): boolean {
  return status === 'error' || status === 'unavailable' || status === 'unsupported' || status === 'waiting';
}

export interface EngineFacts {
  facts: Fact[];
  /** Plain values, for deadlines. */
  values: Record<string, FactValue>;
  fixtureKeys: Set<string>;
}

export async function loadEngineFacts(tx: Tx, companyId: string): Promise<EngineFacts> {
  const rows = await tx.select().from(schema.fact).where(eq(schema.fact.companyId, companyId));
  const facts: Fact[] = [];
  const values: Record<string, FactValue> = {};
  const fixtureKeys = new Set<string>();
  for (const row of rows) {
    const value = row.value as FactValue;
    values[row.key] = value;
    if (row.isFixture) fixtureKeys.add(row.key);
    facts.push({
      key: row.key,
      value,
      provenance: {
        source: row.source,
        source_name: row.sourceName ?? row.source,
        method: (row.evidenceMethod ?? 'attested') as EvidenceMethod,
        retrieved_at: row.retrievedAt.toISOString(),
        ...(row.sourceUrl ? { source_url: row.sourceUrl } : {}),
      },
    });
  }
  return { facts, values, fixtureKeys };
}

/** The states for this company's own sources, keyed by the prefix the engine understands. */
export function sourceStates(connectors: readonly Connector[], sources: readonly SourceRow[]): Record<string, SourceState> {
  const prefixes = new Map(connectors.map((connector) => [connector.id, connector.factPrefix]));
  const states: Record<string, SourceState> = {};
  for (const source of sources) {
    const prefix = prefixes.get(source.connectorId);
    if (prefix) states[prefix] = sourceStateOf(source.status);
  }
  return states;
}

/** S1 pre-incorporation to S5 post-raise, from what the company has told us. */
export function stageOf(company: CompanyRow, values: Readonly<Record<string, FactValue>>): number {
  if (company.preIncorporation || values['company.incorporated'] === false) return 1;
  if (values['answers.raised_priced_round'] === true || company.stage === 'series_a' || company.stage === 'series_b_plus') return 5;
  if (values['answers.has_raised_or_raising'] === true) return 4;
  const revenue = values['answers.revenue_band'];
  if (typeof revenue === 'string' && revenue !== 'none') return 3;
  return 2;
}

const INCORPORATED_ON: Record<string, string> = {
  GB: 'registry.uk.companies_house.incorporated_on',
  'US-DE': 'registry.us.delaware_vendor.formed_on',
  NG: 'registry.ng.cac.incorporated_on',
};

export function incorporatedOn(company: CompanyRow, values: Readonly<Record<string, FactValue>>): string | null {
  const value = values[INCORPORATED_ON[company.incorporationCountry] ?? ''];
  return typeof value === 'string' ? value : null;
}

export async function slotsFor(tx: Tx, company: CompanyRow) {
  return vaultSlotsForPacks((await selectCompanyPacks(tx, company)).packs);
}

/** Facts anyone may say about themselves: the "You told us" statements the rules read. */
export async function setAttestation(tx: Tx, company: CompanyRow, key: string, value: boolean, now: Date): Promise<void> {
  const factKey = `attest.${key}`;
  await tx.delete(schema.fact).where(and(eq(schema.fact.companyId, company.id), eq(schema.fact.key, factKey)));
  // "No" is kept too: it is a definite answer, and a real gap on any plan.
  await tx.insert(schema.fact).values({
    organisationId: company.organisationId,
    companyId: company.id,
    key: factKey,
    value,
    origin: 'answer',
    source: ATTESTATION_SOURCE,
    sourceName: 'You told us',
    evidenceMethod: 'attested',
    retrievedAt: now,
    verificationTier: 5,
  });
}

/** Rules whose document this company has told us it doesn't have. */
export async function loadDeclaredMissing(tx: Tx, companyId: string): Promise<string[]> {
  const rows = await tx
    .select({ ruleKey: schema.missingDocumentStatement.ruleKey })
    .from(schema.missingDocumentStatement)
    .where(eq(schema.missingDocumentStatement.companyId, companyId));
  return rows.map((row) => row.ruleKey);
}

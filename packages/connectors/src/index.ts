import { createFixtureConnectors } from './fixtures.js';
import { createCacVendorConnector } from './sources/cac-vendor.js';
import { createCompaniesHouseConnector } from './sources/companies-house.js';
import { createDelawareVendorConnector } from './sources/delaware-vendor.js';
import { createCnilDpoConnector } from './sources/fr-cnil-dpo.js';
import { createRechercheEntreprisesConnector } from './sources/fr-recherche-entreprises.js';
import { createHmrcVatConnector } from './sources/hmrc-vat.js';
import { createIcoRegisterConnector } from './sources/ico-register.js';
import { createNdpcListConnector } from './sources/ndpc-list.js';
import { createPolicyScanConnector } from './sources/policy-scan.js';
import { createSanctionsConnector } from './sources/sanctions.js';
import { createSecFormDConnector } from './sources/sec-form-d.js';
import { createUsptoConnector } from './sources/uspto.js';
import { createGleifConnector } from './sources/global-gleif.js';
import { createViesVatConnector } from './sources/eu-vies-vat.js';
import { createOpenCorporatesConnector } from './sources/global-opencorporates.js';
import { createAbrConnector } from './sources/au-abr.js';
import { createCanadaCorporationsConnector } from './sources/ca-corporations.js';
import { createDanishCvrConnector } from './sources/dk-cvr.js';
import { createCroConnector } from './sources/ie-cro.js';
import { createKvkConnector } from './sources/nl-kvk.js';
import { createNzCompaniesConnector } from './sources/nz-companies.js';
import { createOpenRegisterConnector } from './sources/de-openregister.js';
import { createBrregConnector } from './sources/no-brreg.js';
import { createPrhConnector } from './sources/fi-prh.js';
import { createAresConnector } from './sources/cz-ares.js';
import { createKrsConnector } from './sources/pl-krs.js';
import { createAcraConnector } from './sources/sg-acra.js';
import { createZefixConnector } from './sources/ch-zefix.js';
import { createEsmaProspectusConnector } from './sources/eu-esma-prospectus.js';
import { createEuipoConnector } from './sources/eu-euipo.js';
import { assertRecordModeAllowed, DEFAULT_RECORD_MAX_BYTES, recordingFetch } from './record.js';
export { recordOneLookup, SOURCE_FACTORIES, type RecordOutcome } from './record-run.js';
import { ANY_JURISDICTION, type Connector, type ConnectorDeps, type SourceResult } from './types.js';

export * from './types.js';
export * from './fact-keys.js';
export { assertFixtureModeAllowed, createFixtureConnectors, FixtureModeRefusedError, KESTREL_FR_SIREN, KESTREL_KEYLESS_NUMBERS, KESTREL_LEI, KESTREL_NATIONAL_NUMBERS } from './fixtures.js';
export { deriveFrenchVatNumber, frenchVatKey, isValidSiren, luhnValid, normaliseFrenchName, normaliseSiren } from './sources/fr-common.js';
export { FR_NOT_IN_DIRECTORY, parseFrenchCompany } from './sources/fr-recherche-entreprises.js';
export { CNIL_COMPACT_HEADER, cnilColumns, compactCnilDpo, createCsvRowReader, parseCnilCompact } from './sources/fr-cnil-dpo.js';
export { compactGels, GELS_COMPACT_FORMAT, parseGelsJson } from './sources/sanctions.js';
export { compactEuFsf, EU_FSF_COMPACT_FORMAT, parseEuFsfXml } from './sources/sanctions.js';
export { GLEIF_MISS, isGleifPerson, isValidLei, normaliseLei, parseGleifRecord } from './sources/global-gleif.js';
export { countryName, normaliseEuVat, viesCountryCode, VIES_JURISDICTIONS, VIES_WORDS } from './sources/eu-vies-vat.js';
export {
  DEFAULT_OFFICIAL_COUNTRIES, isOpenCorporatesPerson, openCorporatesJurisdiction, OPENCORPORATES_WORDS, parseOpenCorporatesCompany,
} from './sources/global-opencorporates.js';
export { alternateLegalForm, companyNameSimilarity, looksLikeCompanyName, normaliseCompanyName, sameCompanyName } from './sources/legal-forms.js';
export { createGleifConnector, createOpenCorporatesConnector, createViesVatConnector };
// EU trade marks and the EU prospectus register (18 Nov 2026).
export { euTrademarkNumbers, normaliseEuTrademarkNumber, parseEuipoTrademark } from './sources/eu-euipo.js';
export { ESMA_MISS, parseEsmaProspectuses } from './sources/eu-esma-prospectus.js';
export { createEsmaProspectusConnector, createEuipoConnector };
// National registers that need a key or account (docs/NATIONAL-REGISTERS.md).
export {
  digitsOf, isValidAbn, isValidAcn, isValidCvr, isValidNzbn, keyRefused, makeNameNormaliser, pickByName,
} from './sources/keyed-registers-common.js';
export { DK_NOT_IN_REGISTER, isDanishSoleProprietorship, parseDanishCompany } from './sources/dk-cvr.js';
export { AU_NOT_IN_REGISTER, isAustralianIndividual, parseAbnDetails, unwrapJsonp } from './sources/au-abr.js';
export { isNzSoleTrader, NZ_NOT_IN_REGISTER, parseNzEntity } from './sources/nz-companies.js';
// Germany through a paid licensed provider: the Handelsregister has no free API (18 Nov 2026).
export { DE_NOT_IN_REGISTER, isGermanSoleTrader, parseGermanCompany } from './sources/de-openregister.js';
export { createOpenRegisterConnector };
export { CA_MESSAGES, countFederalDirectors, parseFederalCorporation } from './sources/ca-corporations.js';
export { isEenmanszaak, NL_NOT_IN_REGISTER, parseKvkProfile } from './sources/nl-kvk.js';
export { IE_NOT_IN_REGISTER, parseCroCompany } from './sources/ie-cro.js';
export { createAbrConnector, createCanadaCorporationsConnector, createCroConnector, createDanishCvrConnector, createKvkConnector, createNzCompaniesConnector };
// National registers that need no key (docs/NATIONAL-REGISTERS.md).
export {
  formatSwissUid, isValidCzechIco, isValidFinnishBusinessId, isValidNorwegianOrgNumber, isValidSwissUid, normaliseCzechIco, normaliseFinnishBusinessId,
  normaliseNationalName, normaliseNorwegianOrgNumber, normalisePolishKrs, normaliseSingaporeUen, normaliseSwissUid,
} from './sources/national-common.js';
export { isNorwegianPersonRecord, NO_WORDS, parseNorwegianUnit } from './sources/no-brreg.js';
export { FI_WORDS, isFinnishPersonRecord, parseFinnishCompany } from './sources/fi-prh.js';
export { CZ_WORDS, isCzechPersonRecord, parseCzechSubject } from './sources/cz-ares.js';
export { isPolishPersonRecord, parsePolishExtract, PL_WORDS } from './sources/pl-krs.js';
export { isSingaporePersonRecord, parseSingaporeEntity, SG_WORDS } from './sources/sg-acra.js';
export { CH_WORDS, isSwissPersonRecord, parseSwissCompany } from './sources/ch-zefix.js';
export { createAcraConnector, createAresConnector, createBrregConnector, createKrsConnector, createPrhConnector, createZefixConnector };
export { createHttp, defineConnector, RateLimiter, SourceError, toEngineInput, type Http, type HttpResponse, type LookupContext } from './runtime.js';
export { assertSafeUrl, BlockedUrlError, isBlockedAddress, safeGet } from './safe-fetch.js';
export { isAllowedByRobots } from './robots.js';
export {
  assertAllowedGithubPath, GITHUB_ALLOWED_PATHS, GITHUB_MAX_FILE_BYTES, isAllowedGithubPath, isSafeRef, isValidRepoFullName, PathNotAllowedError,
} from './github/allowlist.js';
export { APP_JWT_LIFETIME_SECONDS, createAppJwt, InvalidPrivateKeyError, parseGithubPrivateKey } from './github/jwt.js';
export {
  GithubAppClient, GithubError,
  type GithubClientOptions, type GithubFailureKind, type GithubFile, type GithubInstallationInfo, type GithubRepoDetails, type GithubRepoSummary,
} from './github/client.js';
export {
  dayWords, isReferenceKey, listUpdatedWords, maxAgeHoursFor, readStored, REFERENCE_KEYS, staleListWords,
  type ReferenceCopy, type ReferenceKey, type ReferenceOptions, type ReferenceStore, type StoredRead,
} from './reference-store.js';
export {
  createReferenceRefresher, MIN_ROW_SHARE, REFERENCE_SOURCES,
  type HeldCopy, type ReferenceRefresher, type ReferenceRefresherDeps, type ReferenceSourceDefinition, type RefreshOutcome,
} from './reference.js';
export {
  assertRecordModeAllowed, buildManifest, DEFAULT_RECORD_MAX_BYTES, loadSessions, missingSettings, RECORDABLE, recordingFetch, RecordModeRefusedError,
  redactBody, redactUrl, replayEnv, replayFetch, REPLAY_SETTINGS, safeHeaders, sessionDir, writeManifest,
  type RecordedResponse, type RecordedSession, type SessionManifest,
} from './record.js';
export {
  createCacVendorConnector, createCnilDpoConnector, createCompaniesHouseConnector, createDelawareVendorConnector, createHmrcVatConnector, createIcoRegisterConnector,
  createNdpcListConnector, createPolicyScanConnector, createRechercheEntreprisesConnector, createSanctionsConnector, createSecFormDConnector, createUsptoConnector,
};

export class InvalidConnectorModeError extends Error {
  override name = 'InvalidConnectorModeError';
}

/**
 * The connectors for this environment. CONNECTOR_MODE=fixture gives clearly
 * labelled sample data, and throws under NODE_ENV=production. Otherwise you get the
 * real ones, each returning "unavailable" until its key is set.
 */
export function createConnectors(deps: ConnectorDeps): Connector[] {
  const mode = deps.env['CONNECTOR_MODE'] ?? 'live';
  if (mode === 'fixture') return createFixtureConnectors(deps.env, deps.now);
  if (mode !== 'live') throw new InvalidConnectorModeError(`CONNECTOR_MODE must be "live" or "fixture", not "${mode}".`);
  const recordDir = deps.env['CONNECTOR_RECORD_DIR']?.trim();
  if (recordDir) assertRecordModeAllowed({ NODE_ENV: deps.env['NODE_ENV'] ?? process.env['NODE_ENV'] });
  const maxBytes = Number(deps.env['CONNECTOR_RECORD_MAX_BYTES']) || DEFAULT_RECORD_MAX_BYTES;
  // Development only: each provider's responses are also saved, redacted. See record.ts.
  const forSource = (connectorId: string): ConnectorDeps => (recordDir
    ? { ...deps, fetch: recordingFetch(deps.fetch ?? ((url, init) => fetch(url, init)), { dir: recordDir, connectorId, maxBytes, ...(deps.now ? { now: deps.now } : {}) }) }
    : deps);
  const built: Connector[] = [
    createCompaniesHouseConnector(forSource('uk.companies_house')),
    // Reads a downloaded file, not a provider: nothing to record.
    createIcoRegisterConnector(deps),
    createHmrcVatConnector(forSource('uk.hmrc_vat')),
    createUsptoConnector(forSource('us.uspto')),
    createSecFormDConnector(forSource('us.sec_form_d')),
    createDelawareVendorConnector(forSource('us.delaware_vendor')),
    createCacVendorConnector(forSource('ng.cac_vendor')),
    createNdpcListConnector(forSource('ng.ndpc_list')),
    createSanctionsConnector(forSource('sanctions.lists')),
    // France, data only (docs/FRANCE.md). Only ever chosen for a company incorporated in France,
    // which the API can't create yet, so these never run in a customer's scan today.
    createRechercheEntreprisesConnector(forSource('fr.recherche_entreprises')),
    // Reads only the stored copy kept by the refresh job: nothing to record.
    createCnilDpoConnector(deps),
    // Reads the company's own website through its own guarded transport: not recorded.
    createPolicyScanConnector(deps),
    // National registers that need a key or account: each stays "unavailable" until its
    // settings are set (docs/NATIONAL-REGISTERS.md).
    createDanishCvrConnector(forSource('dk.cvr')),
    createAbrConnector(forSource('au.abr')),
    createNzCompaniesConnector(forSource('nz.companies')),
    createOpenRegisterConnector(forSource('de.openregister')),
    createCanadaCorporationsConnector(forSource('ca.corporations')),
    createKvkConnector(forSource('nl.kvk')),
    createCroConnector(forSource('ie.cro')),
    // National registers that need no key: off until PUBLIC_API_USER_AGENT is set. Zefix is free
    // but needs credentials from the Swiss Federal Office of Justice (docs/NATIONAL-REGISTERS.md).
    createBrregConnector(forSource('no.brreg')),
    createPrhConnector(forSource('fi.prh')),
    createAresConnector(forSource('cz.ares')),
    createKrsConnector(forSource('pl.krs')),
    createAcraConnector(forSource('sg.acra')),
    createZefixConnector(forSource('ch.zefix')),
  ];
  // Global sources, asked for a company in any country (docs/GLOBAL-COVERAGE.md). GLEIF and VIES
  // are keyless and off until PUBLIC_API_USER_AGENT is set; OpenCorporates needs its paid key.
  // OpenCorporates is the fallback register: it skips every country another entity-lookup
  // source already covers, worked out from the list above so new country sources count too.
  // A country counts only while its own source is switched on: a Danish company with no CVR
  // login set still gets OpenCorporates, rather than no register check at all.
  const officialCountries = () => [...new Set(built.filter((c) => c.capabilities.includes('entity_lookup') && c.configured !== false).flatMap((c) => c.jurisdictions).filter((j) => j !== ANY_JURISDICTION))];
  return [
    ...built,
    createGleifConnector(forSource('global.gleif')),
    createViesVatConnector(forSource('eu.vies_vat')),
    // EU trade marks by number (off until EUIPO_CLIENT_ID and EUIPO_CLIENT_SECRET are set), and
    // ESMA's prospectus register by LEI (keyless, off until PUBLIC_API_USER_AGENT is set).
    createEuipoConnector(forSource('eu.euipo')),
    createEsmaProspectusConnector(forSource('eu.esma_prospectus')),
    createOpenCorporatesConnector(forSource('global.opencorporates'), { officialCountries }),
  ];
}

/**
 * Picks the connectors that cover a jurisdiction, global ones ('*') included. A backup register
 * (OpenCorporates) is left out where the country's own register is switched on.
 */
export function connectorsFor(connectors: readonly Connector[], jurisdiction: string): Connector[] {
  const ownRegisterOn = connectors.some((c) => c.jurisdictions.includes(jurisdiction) && c.capabilities.includes('entity_lookup') && c.configured !== false);
  return connectors.filter((c) => (c.jurisdictions.includes(jurisdiction) || c.jurisdictions.includes(ANY_JURISDICTION)) && !(c.fallbackRegister && ownRegisterOn));
}

/** Runs them all at once. A failing source never takes the others down. */
export async function runConnectors(connectors: readonly Connector[], ref: Parameters<Connector['lookup']>[0]): Promise<SourceResult[]> {
  return Promise.all(connectors.map((connector) => connector.lookup(ref)));
}

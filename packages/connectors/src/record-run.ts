import { mkdirSync } from 'node:fs';
import { assertRecordModeAllowed, buildManifest, missingSettings, RECORDABLE, recordingFetch, writeManifest, DEFAULT_RECORD_MAX_BYTES } from './record.js';
import { createCacVendorConnector } from './sources/cac-vendor.js';
import { createCompaniesHouseConnector } from './sources/companies-house.js';
import { createDelawareVendorConnector } from './sources/delaware-vendor.js';
import { createRechercheEntreprisesConnector } from './sources/fr-recherche-entreprises.js';
import { createHmrcVatConnector } from './sources/hmrc-vat.js';
import { createNdpcListConnector } from './sources/ndpc-list.js';
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
import { CompanyRefSchema, type CompanyRef, type Connector, type ConnectorDeps, type Env, type FetchLike, type SourceResult } from './types.js';

/** Builds one recordable source. Shared by the recording script and the replay harness. */
export const SOURCE_FACTORIES: Readonly<Record<string, (deps: ConnectorDeps) => Connector>> = {
  'uk.companies_house': createCompaniesHouseConnector,
  'uk.hmrc_vat': createHmrcVatConnector,
  'us.uspto': createUsptoConnector,
  'us.sec_form_d': createSecFormDConnector,
  'us.delaware_vendor': createDelawareVendorConnector,
  'ng.cac_vendor': createCacVendorConnector,
  'ng.ndpc_list': createNdpcListConnector,
  'sanctions.lists': createSanctionsConnector,
  'fr.recherche_entreprises': createRechercheEntreprisesConnector,
  'global.gleif': createGleifConnector,
  'eu.vies_vat': createViesVatConnector,
  'global.opencorporates': (deps) => createOpenCorporatesConnector(deps),
  'dk.cvr': createDanishCvrConnector,
  'au.abr': createAbrConnector,
  'nz.companies': createNzCompaniesConnector,
  'de.openregister': createOpenRegisterConnector,
  'ca.corporations': createCanadaCorporationsConnector,
  'nl.kvk': createKvkConnector,
  'ie.cro': createCroConnector,
  'no.brreg': createBrregConnector,
  'fi.prh': createPrhConnector,
  'cz.ares': createAresConnector,
  'pl.krs': createKrsConnector,
  'sg.acra': createAcraConnector,
  'ch.zefix': createZefixConnector,
  'eu.esma_prospectus': createEsmaProspectusConnector,
};

export type RecordOutcome =
  | { kind: 'refused'; message: string }
  | { kind: 'not_connected'; missing: string[] }
  | { kind: 'recorded'; folder: string | null; saved: number; status: SourceResult['status']; factKeys: string[]; message: string | undefined };

/**
 * One live lookup, with every provider response saved under `dir`, plus a manifest the replay
 * harness reads. Says plainly when it can't run, and never calls a provider without a key.
 */
export async function recordOneLookup(options: {
  connectorId: string;
  ref: CompanyRef;
  env: Env;
  dir: string;
  fetch?: FetchLike;
  now?: () => Date;
}): Promise<RecordOutcome> {
  const { connectorId, env, dir } = options;
  try {
    assertRecordModeAllowed(env);
  } catch (error) {
    return { kind: 'refused', message: (error as Error).message };
  }
  if (env['CONNECTOR_MODE'] === 'fixture') return { kind: 'refused', message: 'Recording needs real sources. Set CONNECTOR_MODE=live (or leave it empty).' };
  const factory = SOURCE_FACTORIES[connectorId];
  if (!factory || !RECORDABLE[connectorId]) {
    return { kind: 'refused', message: `${connectorId} can't be recorded. Choose one of: ${Object.keys(SOURCE_FACTORIES).join(', ')}.` };
  }
  const parsed = CompanyRefSchema.safeParse(options.ref);
  if (!parsed.success) return { kind: 'refused', message: 'A company name and a jurisdiction (GB, NG, US-DE, or FR for the French sources) are needed.' };
  const missing = missingSettings(connectorId, env);
  if (missing.length > 0) return { kind: 'not_connected', missing };

  const now = options.now ?? (() => new Date());
  mkdirSync(dir, { recursive: true });
  const maxBytes = Number(env['CONNECTOR_RECORD_MAX_BYTES']) || DEFAULT_RECORD_MAX_BYTES;
  const recorder = recordingFetch(options.fetch ?? ((url, init) => fetch(url, init)), { dir, connectorId, now, maxBytes });
  // No retries: one real call per request is all we need, and all we want to pay for.
  const connector = factory({ env, fetch: recorder, now, retries: 0 });
  const result = await connector.lookup(options.ref);
  const folder = recorder.session();
  if (folder) writeManifest(folder, buildManifest(connectorId, options.ref, env, result, now()));
  return { kind: 'recorded', folder, saved: recorder.saved(), status: result.status, factKeys: result.facts.map((fact) => fact.key).sort(), message: result.message };
}

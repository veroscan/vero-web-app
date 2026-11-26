import { z } from 'zod';
import type { ReferenceOptions } from './reference-store.js';

export const CAPABILITIES = [
  'entity_lookup', 'officers', 'filings', 'trademarks', 'patents', 'dp_registration', 'licence', 'court',
  'tax_registration', 'fundraising', 'sanctions', 'website',
] as const;
export type Capability = (typeof CAPABILITIES)[number];

/**
 * A country the engine can be asked about: an ISO 3166-1 alpha-2 code ("FR", "NO"), or a
 * subdivision such as "US-DE" (ISO 3166-2 style). Any country is accepted here: which sources
 * and rules apply is decided by each connector's `jurisdictions` and by the rule packs.
 * docs/GLOBAL-COVERAGE.md says what each country gets today.
 */
export const JURISDICTION_CODE = /^[A-Z]{2}(-[A-Z0-9]{1,3})?$/;
export type EngineJurisdiction = string;
/** A connector whose `jurisdictions` holds this covers every country (GLEIF, sanctions, website). */
export const ANY_JURISDICTION = '*';

export const CompanyRefSchema = z.strictObject({
  name: z.string().trim().min(1),
  jurisdiction: z.string().regex(JURISDICTION_CODE, 'A country code such as GB, FR or US-DE'),
  /** France: the 9-digit SIREN, from the company or an official French source. */
  siren: z.string().trim().min(1).optional(),
  /** The national company number where the country has no field of its own here (NO organisasjonsnummer, FI Y-tunnus, CZ ICO, PL KRS, DK CVR, AU ACN, NZ NZBN, SG UEN, CA corporation number). */
  registry_number: z.string().trim().min(1).optional(),
  /** The 20-character Legal Entity Identifier (ISO 17442), from the company or GLEIF. */
  lei: z.string().trim().min(1).optional(),
  company_number: z.string().trim().min(1).optional(),
  rc_number: z.string().trim().min(1).optional(),
  file_number: z.string().trim().min(1).optional(),
  vat_number: z.string().trim().min(1).optional(),
  /** True when vat_number was worked out by us from the company number, not given by the company. */
  vat_number_derived: z.boolean().optional(),
  postcode: z.string().trim().min(1).optional(),
  ico_reference: z.string().trim().min(1).optional(),
  cik: z.string().trim().min(1).optional(),
  website_url: z.string().trim().min(1).optional(),
  trademark_serials: z.array(z.string().trim().min(1)).optional(),
  /** EU trade mark numbers (EUIPO application numbers, 9 digits) the company gave us. */
  eu_trademark_numbers: z.array(z.string().trim().min(1)).optional(),
  vendor_business_id: z.string().trim().min(1).optional(),
  /** Fixture mode only: pick an outcome. Ignored by real connectors. */
  scenario: z.enum(['found', 'not_found', 'ambiguous', 'error', 'unavailable']).optional(),
});
export type CompanyRef = z.input<typeof CompanyRefSchema>;

export type FactValue = string | number | boolean | null | string[];
export interface Fact { key: string; value: FactValue }

/** Same words as the rules package's evidence methods, so facts carry straight across. */
export type EvidenceMethod = 'official_live' | 'licensed_vendor' | 'official_list';

export interface Provenance {
  sourceUrl: string;
  retrievedAt: string;
  /** SHA-256 of what the source sent, so we can show evidence without storing personal data. */
  rawHash: string;
  sourceName: string;
  method: EvidenceMethod;
  /** Only ever true in fixture mode, so sample data can't pass as real. */
  fixture?: true;
}

/**
 * "not_found" is never proof of absence: it means this source didn't return it.
 * "unavailable" means no key, or the source is switched off. "unsupported" means we
 * lack something only the company can give us, such as a VAT number, and the
 * message says what. "waiting" means a paid vendor is still preparing its report:
 * the retry job asks again. None of the last three counts for or against the score.
 */
export type SourceStatus = 'found' | 'not_found' | 'ambiguous' | 'error' | 'unsupported' | 'unavailable' | 'waiting';

/** One possible match. `status` is the company's own status on the register, only when the source's answer includes it. */
export interface Candidate { name: string; identifier?: string; status?: string }

export interface SourceResult {
  connector: string;
  status: SourceStatus;
  facts: Fact[];
  provenance: Provenance;
  /** 0 to 1. Shown to users. */
  matchConfidence: number;
  /** Plain words, safe to show. Never holds secrets. */
  message?: string;
  candidates?: Candidate[];
  /**
   * A vendor's own reference for this company (Middesk's business id), so the next
   * lookup reuses it instead of creating, and paying for, a new one.
   */
  vendorBusinessId?: string;
}

export interface Connector {
  id: string;
  jurisdictions: readonly string[];
  capabilities: readonly Capability[];
  /** Facts from this connector start with this, so the engine knows which rules a dead source touches. */
  factPrefix: string;
  sourceName: string;
  /** False when a setting it needs (a key, a contact string) is missing, so it can only answer "unavailable". */
  configured?: boolean;
  /** A backup company register (OpenCorporates): asked only where the country's own register isn't switched on. */
  fallbackRegister?: boolean;
  lookup(input: CompanyRef): Promise<SourceResult>;
}

/** What a source implementation hands back. The runtime adds provenance and handles failure. */
export interface LookupOutcome {
  status: SourceStatus;
  facts?: Fact[];
  /** Raw text for the evidence hash. It isn't stored. */
  raw?: string;
  /** Used instead of hashing `raw`, when the answer came from a stored copy whose hash is known. */
  rawHash?: string;
  sourceUrl: string;
  matchConfidence?: number;
  message?: string;
  candidates?: Candidate[];
  vendorBusinessId?: string;
}

/** Caching hook. The app can back this with Valkey; nothing here needs it. */
export interface CacheHook {
  get(key: string): Promise<SourceResult | undefined>;
  set(key: string, value: SourceResult, ttlSeconds: number): Promise<void>;
}

export type Env = Readonly<Record<string, string | undefined>>;
export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export interface ConnectorDeps {
  env: Env;
  fetch?: FetchLike;
  now?: () => Date;
  sleep?: (ms: number) => Promise<void>;
  cache?: CacheHook;
  /** Per-attempt timeout. */
  timeoutMs?: number;
  /** Retries after the first attempt. */
  retries?: number;
  /**
   * Stored copies of the public lists (ICO, NDPC, sanctions), kept fresh by a scheduled job.
   * Without it, those sources behave as before: a local file, or a download during the scan.
   */
  reference?: ReferenceOptions;
}

import { PackSchema, VaultSlotSchema, type Jurisdiction, type Pack, type VaultSlot } from '../schema.js';
import { au } from './au.js';
import { ca } from './ca.js';
import { ch } from './ch.js';
import { de, DE_INTL_EQUIVALENTS } from './de.js';
import { gh, GH_INTL_EQUIVALENTS } from './gh.js';
import { ke, KE_INTL_EQUIVALENTS } from './ke.js';
import { za, ZA_INTL_EQUIVALENTS } from './za.js';
import { cz, CZ_INTL_EQUIVALENTS } from './cz.js';
import { dk, DK_INTL_EQUIVALENTS } from './dk.js';
import { fi, FI_INTL_EQUIVALENTS } from './fi.js';
import { fr, FR_INTL_EQUIVALENTS } from './fr.js';
import { gb } from './gb.js';
import { ie, IE_INTL_EQUIVALENTS } from './ie.js';
import { intl, INTL_EQUIVALENTS as INTL_BASE_EQUIVALENTS } from './intl.js';
import { ng } from './ng.js';
import { nl, NL_INTL_EQUIVALENTS } from './nl.js';
import { norway, NO_INTL_EQUIVALENTS } from './no.js';
import { nz } from './nz.js';
import { pl, PL_INTL_EQUIVALENTS } from './pl.js';
import { sg } from './sg.js';
import { usDelaware } from './us-de.js';
import { usFederal } from './us-federal.js';

export class InvalidRulePackError extends Error {
  readonly problems: string[];

  constructor(jurisdiction: string, problems: string[]) {
    super(`Rule pack ${jurisdiction} is invalid:\n${problems.join('\n')}`);
    this.name = 'InvalidRulePackError';
    this.problems = problems;
  }
}

/** Validates a pack, failing loudly and listing every problem. */
export function validatePack(raw: unknown): Pack {
  const parsed = PackSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  const label = (raw as { jurisdiction?: unknown } | null)?.jurisdiction;
  throw new InvalidRulePackError(
    typeof label === 'string' ? label : 'unknown',
    parsed.error.issues.map((issue) => `${issue.path.join('.') || '(pack)'}: ${issue.message}`),
  );
}

/** The International pack's jurisdiction: rules that are not one country's law. */
export const INTERNATIONAL = 'INTL';

interface PackSource {
  pack: Pack;
  slots: readonly VaultSlot[];
}

/**
 * Every rule pack. Adding a country's own pack is one line here, such as `NO: no,` with its
 * file in packs/no.ts built with packBuilder('NO', ...). It then applies to companies in that
 * country, together with the International pack, and to companies with users there.
 */
const RAW: Readonly<Record<string, PackSource>> = {
  INTL: intl,
  US: usFederal,
  'US-DE': usDelaware,
  GB: gb,
  NG: ng,
  // Draft country packs, each with the International pack (16 Nov 2026).
  CH: ch,
  SG: sg,
  AU: au,
  NZ: nz,
  CA: ca,
  // Draft EU and EEA country packs, each with the EU common rules (eu-common.ts) (16 Nov 2026).
  FR: fr,
  NO: norway,
  FI: fi,
  DK: dk,
  NL: nl,
  IE: ie,
  CZ: cz,
  PL: pl,
  DE: de,
  // Draft country packs, each with the International pack (18 Nov 2026).
  ZA: za,
  KE: ke,
  GH: gh,
};

/**
 * Countries whose own packs already hold every international check, so the International pack
 * isn't added for them (it is built from their rules). Every other country gets it.
 */
const STANDALONE: ReadonlySet<string> = new Set(['US-DE', 'GB', 'NG']);

/** Every pack that exists, in a stable order. */
export const JURISDICTIONS: readonly Jurisdiction[] = Object.keys(RAW);

const loaded = new Map<Jurisdiction, Pack>();

export class UnknownRulePackError extends Error {
  override name = 'UnknownRulePackError';
}

export function hasPack(jurisdiction: Jurisdiction): boolean {
  return Object.hasOwn(RAW, jurisdiction);
}

function sourceOf(jurisdiction: Jurisdiction): PackSource {
  const source = hasPack(jurisdiction) ? RAW[jurisdiction] : undefined;
  if (!source) throw new UnknownRulePackError(`There is no rule pack for ${jurisdiction}.`);
  return source;
}

export function loadPack(jurisdiction: Jurisdiction): Pack {
  const cached = loaded.get(jurisdiction);
  if (cached) return cached;
  const pack = validatePack(sourceOf(jurisdiction).pack);
  loaded.set(jurisdiction, pack);
  return pack;
}

/** A pack plus everything it inherits. US-DE gives the federal pack and the Delaware pack. */
function withParents(jurisdiction: Jurisdiction): Pack[] {
  const pack = loadPack(jurisdiction);
  return [...pack.inherits.flatMap((parent) => withParents(parent)), pack];
}

/** A country's own rule pack exists (a draft counts). Not the International pack. */
export function hasCountryPack(country: string): boolean {
  return country !== INTERNATIONAL && hasPack(country);
}

function isUnitedStates(country: string): boolean {
  return country === 'US' || country.startsWith('US-');
}

/**
 * The packs for a company registered in this country, International last.
 *
 * - US-DE, GB, NG: their own packs, as before (US-DE inherits the federal pack).
 * - Any other US state, or "US": the federal pack plus the International pack.
 * - A country with its own pack (a draft added later): that pack plus the International pack.
 * - Every other country: the International pack only.
 * - "INTL" itself: the International pack.
 */
export function packsFor(country: Jurisdiction): Pack[] {
  if (country === INTERNATIONAL) return [loadPack(INTERNATIONAL)];
  if (STANDALONE.has(country)) return withParents(country);
  const own = hasPack(country) ? withParents(country) : [];
  const federal = isUnitedStates(country) && !own.some((pack) => pack.jurisdiction === 'US') ? withParents('US') : [];
  const packs = [...federal, ...own];
  return packs.some((pack) => pack.jurisdiction === INTERNATIONAL) ? packs : [...packs, loadPack(INTERNATIONAL)];
}

/** What to upload, per layer, for one pack and the packs it inherits, each with a plain reason. */
export function vaultSlotsFor(jurisdiction: Jurisdiction): VaultSlot[] {
  const own = sourceOf(jurisdiction).slots.map((slot) => VaultSlotSchema.parse(slot));
  const parents = loadPack(jurisdiction).inherits.flatMap((parent) => vaultSlotsFor(parent));
  return [...parents, ...own];
}

/** The slots behind the rules actually in play, with each slot pointing only at those rules. */
export function vaultSlotsForPacks(packs: readonly Pack[]): VaultSlot[] {
  const slots = new Map<string, VaultSlot>();
  for (const pack of packs) {
    const ruleIds = new Set(pack.rules.map((rule) => rule.id));
    for (const raw of sourceOf(pack.jurisdiction).slots) {
      const slot = VaultSlotSchema.parse(raw);
      const relevant = slot.rule_ids.filter((id) => ruleIds.has(id));
      if (relevant.length > 0 && !slots.has(slot.id)) slots.set(slot.id, { ...slot, rule_ids: relevant });
    }
  }
  return [...slots.values()];
}

/**
 * @deprecated The three first countries' codes, kept for older callers. Any country code now
 * works with packsFor directly.
 */
export const COUNTRY_TO_JURISDICTION = { 'US-DE': 'US-DE', GB: 'GB', NG: 'NG' } as const;

/** Each international rule with every country rule that stands in for it. */
function mergeEquivalents(...maps: Readonly<Record<string, readonly string[]>>[]): Readonly<Record<string, readonly string[]>> {
  const out: Record<string, string[]> = {};
  for (const map of maps) for (const [id, ids] of Object.entries(map)) out[id] = [...(out[id] ?? []), ...ids];
  return out;
}

/** intl.ts's list, plus the EU and EEA packs' own (kept with each pack, so it is written once). */
export const INTL_EQUIVALENTS: Readonly<Record<string, readonly string[]>> = mergeEquivalents(
  INTL_BASE_EQUIVALENTS,
  FR_INTL_EQUIVALENTS,
  NO_INTL_EQUIVALENTS,
  FI_INTL_EQUIVALENTS,
  DK_INTL_EQUIVALENTS,
  NL_INTL_EQUIVALENTS,
  IE_INTL_EQUIVALENTS,
  CZ_INTL_EQUIVALENTS,
  PL_INTL_EQUIVALENTS,
  DE_INTL_EQUIVALENTS,
  ZA_INTL_EQUIVALENTS,
  KE_INTL_EQUIVALENTS,
  GH_INTL_EQUIVALENTS,
);

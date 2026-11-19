import { hasCountryPack, INTERNATIONAL, INTL_EQUIVALENTS, packsFor } from './packs/index.js';
import type { Jurisdiction, Pack, Rule } from './schema.js';

/**
 * Which rules a company is measured against. A PROPOSAL for Code & Clause to confirm: see
 * COVERAGE.md. The country of incorporation decides the corporate layers, in full. Each other
 * country where the company has users or operates adds its compliance and AI and data rules,
 * and never its company filings. A company in any other country is measured against the
 * International pack (and its country's own pack, once one exists): see packsFor.
 */
/** A country code where a company is registered or has users: "GB", "KE", "US-CA". */
export type Market = string;
/** @deprecated The first three countries. Any country code is a Market now. */
export type MvpMarket = 'US-DE' | 'GB' | 'NG';
/** The first three markets keep their order; any other country with a pack follows, by code. */
const MARKET_ORDER: readonly string[] = ['GB', 'NG', 'US-DE'];

export interface PackUse {
  jurisdiction: Jurisdiction;
  version: string;
  /** "full" is the country of incorporation. "overlay" is a market it has users or operates in. */
  mode: 'full' | 'overlay';
  /** How many of the pack's rules were evaluated. */
  rules: number;
}

export interface PackSelection {
  packs: Pack[];
  used: PackUse[];
  /** Countries other than the country of incorporation that added rules. */
  overlay_markets: Market[];
}

export interface SelectPacksInput {
  incorporation: Market;
  /** Countries where the company has users or operates. Those with no rule pack of their own add nothing. */
  markets: readonly string[];
  employee_countries?: readonly string[];
}

/** The pack a market brings in. US users mean the US rules, which sit in the Delaware pack. */
function normalise(country: string): Market | null {
  if (country === 'US' || country.startsWith('US-')) return 'US-DE';
  return hasCountryPack(country) ? country : null;
}

function marketOrder(markets: ReadonlySet<string>): string[] {
  const rest = [...markets].filter((market) => !MARKET_ORDER.includes(market)).sort();
  return [...MARKET_ORDER, ...rest];
}

/** Whether a rule follows a company into a country where it isn't incorporated. */
export function overlayMode(rule: Pick<Rule, 'layer' | 'market_overlay'>): NonNullable<Rule['market_overlay']> {
  return rule.market_overlay ?? (rule.layer === 3 || rule.layer === 6 ? 'market' : 'never');
}

/**
 * Picks the packs for one company. Each rule is evaluated at most once: no pack appears twice,
 * and a policy shared across countries counts only for the first pack that asks for it. The
 * International pack, where it applies, comes last: an international rule is left out when a
 * country rule in the selection asks for the same thing.
 */
export function selectPacks(input: SelectPacksInput): PackSelection {
  const packs: Pack[] = [];
  const used: PackUse[] = [];
  const seenPacks = new Set<Jurisdiction>();
  const seenObligations = new Set<string>();
  const remember = (pack: Pack) => {
    for (const rule of pack.rules) if (rule.shared_obligation) seenObligations.add(rule.shared_obligation);
  };

  const home = packsFor(input.incorporation);
  const international = home.find((pack) => pack.jurisdiction === INTERNATIONAL);
  for (const pack of home) {
    if (pack === international) continue;
    packs.push(pack);
    used.push({ jurisdiction: pack.jurisdiction, version: pack.version, mode: 'full', rules: pack.rules.length });
    seenPacks.add(pack.jurisdiction);
    remember(pack);
  }

  const markets = new Set(input.markets.map(normalise).filter((country): country is Market => country !== null));
  const employees = new Set((input.employee_countries ?? []).map(normalise).filter((country): country is Market => country !== null));
  // Staff somewhere is operating there, even if nobody listed it as a market.
  for (const country of employees) markets.add(country);

  const overlayMarkets: Market[] = [];
  for (const market of marketOrder(markets)) {
    if (market === input.incorporation || !markets.has(market)) continue;
    let added = false;
    for (const pack of packsFor(market)) {
      // The International pack never follows a market: it is the home country's, or nobody's.
      if (pack.jurisdiction === INTERNATIONAL || seenPacks.has(pack.jurisdiction)) continue;
      const rules = pack.rules.filter((rule) => {
        const mode = overlayMode(rule);
        if (mode === 'never' || (mode === 'employees_here' && !employees.has(market))) return false;
        return !(rule.shared_obligation && seenObligations.has(rule.shared_obligation));
      });
      if (rules.length === 0) continue;
      const narrowed: Pack = { ...pack, rules };
      packs.push(narrowed);
      used.push({ jurisdiction: pack.jurisdiction, version: pack.version, mode: 'overlay', rules: rules.length });
      seenPacks.add(pack.jurisdiction);
      remember(narrowed);
      added = true;
    }
    if (added) overlayMarkets.push(market);
  }

  if (international) {
    const selected = new Set(packs.flatMap((pack) => pack.rules.map((rule) => rule.id)));
    const rules = international.rules.filter((rule) => {
      if (rule.shared_obligation && seenObligations.has(rule.shared_obligation)) return false;
      return !(INTL_EQUIVALENTS[rule.id] ?? []).some((id) => selected.has(id));
    });
    if (rules.length > 0) {
      const narrowed: Pack = rules.length === international.rules.length ? international : { ...international, rules };
      packs.push(narrowed);
      used.push({ jurisdiction: international.jurisdiction, version: international.version, mode: 'full', rules: rules.length });
    }
  }
  return { packs, used, overlay_markets: overlayMarkets };
}

import type { Logic } from '../logic.js';
import { answersFor, overlayModeFor, sharedObligationFor } from './annotations.js';
import type { Jurisdiction, Pack, Recurrence, Rule, Severity, VaultSlot } from '../schema.js';

/** Small authoring helpers. Everything they build is plain JSON-ready data, validated when a pack loads. */

export const ALL: Logic = true;
export const yes = (key: string): Logic => ({ '==': [{ var: key }, true] });
export const no = (key: string): Logic => ({ '==': [{ var: key }, false] });
export const eq = (key: string, value: string | number): Logic => ({ '==': [{ var: key }, value] });
export const zero = (key: string): Logic => ({ '==': [{ var: key }, 0] });
export const atLeast = (key: string, value: number): Logic => ({ '>=': [{ var: key }, value] });
export const above = (key: string, value: number): Logic => ({ '>': [{ var: key }, value] });
export const all = (...items: Logic[]): Logic => ({ and: items });
export const any = (...items: Logic[]): Logic => ({ or: items });
export const not = (item: Logic): Logic => ({ '!': [item] });
export const held = (slot: string): Logic => yes(`vault.${slot}.present`);
export const told = (key: string): Logic => yes(`attest.${key}`);

export const remind = { mode: 'reminder' } as const;
export const auto = (source: string) => ({ mode: 'auto', source }) as const;

export const MAPS = {
  delaware: 'docs/knowledge/vero-scan-delaware-rule-pack-map.md',
  uk: 'docs/knowledge/vero-scan-uk-rule-pack-map.md',
  nigeria: 'docs/knowledge/vero-scan-nigeria-rule-pack-map.md',
  switzerland: 'docs/knowledge/vero-scan-switzerland-rule-pack-map.md',
  singapore: 'docs/knowledge/vero-scan-singapore-rule-pack-map.md',
  australia: 'docs/knowledge/vero-scan-australia-rule-pack-map.md',
  newZealand: 'docs/knowledge/vero-scan-new-zealand-rule-pack-map.md',
  canada: 'docs/knowledge/vero-scan-canada-rule-pack-map.md',
  eu: 'docs/knowledge/vero-scan-eu-common-rule-pack-map.md',
  france: 'docs/knowledge/vero-scan-france-rule-pack-map.md',
  norway: 'docs/knowledge/vero-scan-norway-rule-pack-map.md',
  finland: 'docs/knowledge/vero-scan-finland-rule-pack-map.md',
  denmark: 'docs/knowledge/vero-scan-denmark-rule-pack-map.md',
  netherlands: 'docs/knowledge/vero-scan-netherlands-rule-pack-map.md',
  ireland: 'docs/knowledge/vero-scan-ireland-rule-pack-map.md',
  czechia: 'docs/knowledge/vero-scan-czechia-rule-pack-map.md',
  poland: 'docs/knowledge/vero-scan-poland-rule-pack-map.md',
  germany: 'docs/knowledge/vero-scan-germany-rule-pack-map.md',
  southAfrica: 'docs/knowledge/vero-scan-south-africa-rule-pack-map.md',
  kenya: 'docs/knowledge/vero-scan-kenya-rule-pack-map.md',
  ghana: 'docs/knowledge/vero-scan-ghana-rule-pack-map.md',
} as const;

export interface SlotSpec {
  id: string;
  label: string;
  reason: string;
  tier?: 4 | 5;
  expires?: boolean;
}

interface Common {
  id: string;
  layer: number;
  area: string;
  stage: number;
  title: string;
  when?: Logic;
  sev: Severity;
  tier: number;
  /** [section heading text, text on the map line], and the map when it isn't the pack's own. */
  src: [string, string, string?][];
  regulator?: string;
  law?: [string, string?][];
  rec?: Recurrence;
  /** A map row tagged [verify], or listed under the map's "to confirm" section. */
  review?: boolean;
  penalty?: 'none' | 'moderate' | 'severe';
  raising?: boolean;
  from?: string;
  to?: string;
  params?: Record<string, unknown>;
  defect?: Logic;
  verify?: Logic;
  action?: Rule['remediation']['action_type'];
  order?: string;
  /** Opts this rule in or out of following a company abroad. */
  overlay?: Rule['market_overlay'];
  /** One obligation several packs ask for (an EU rule in each EU country's pack): only the first counts. */
  shared?: string;
}

export interface RuleSpec extends Common {
  sat: Logic;
  evidence: string[];
  /** headline, missing, why, if left, fix */
  text: [string, string, string, string, string];
  slot?: SlotSpec | SlotSpec[];
}

export interface DocSpec extends Common {
  slot: SlotSpec;
  /** Lower-case name used in a sentence. Defaults to the title with a lower-case first letter. */
  noun?: string;
  sat?: Logic;
  why?: string;
  ifLeft?: string;
  fix?: string;
}

const IF_LEFT_BY_LAYER: Record<number, string> = {
  1: "You'll be asked for it in due diligence, and a gap in your company records can hold up a bank or an investor.",
  2: "It will come up in investor due diligence, and questions about who owns your IP have to be settled before a round can close.",
  3: "If a regulator or a customer asks for it, you won't have anything to show them.",
  4: "It will come up when a customer or investor reads your contracts, and you'd be fixing it under time pressure.",
  5: "It will come up in your next round, and investors will want it sorted before they sign.",
  6: "Investors and enterprise customers are starting to ask for this, and you won't have an answer ready.",
};

function lowerFirst(text: string): string {
  return /^[A-Z][a-z]/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

export function packBuilder(jurisdiction: Jurisdiction, map: string, meta: { name: string; version: string; inherits?: Jurisdiction[] }) {
  const rules: Rule[] = [];
  const slots = new Map<string, VaultSlot>();

  function addSlot(spec: SlotSpec, ruleId: string, layer: number): void {
    const existing = slots.get(spec.id);
    if (existing) {
      existing.rule_ids.push(ruleId);
      return;
    }
    slots.set(spec.id, {
      id: spec.id,
      jurisdiction,
      layer,
      label: spec.label,
      reason: spec.reason,
      rule_ids: [ruleId],
      tier: spec.tier ?? 5,
      expires: spec.expires ?? false,
    });
  }

  function base(spec: Common, sat: Logic, evidence: string[], text: Rule['text'], action: Rule['remediation']['action_type']): Rule {
    const rule: Rule = {
      id: spec.id,
      jurisdiction,
      layer: spec.layer,
      area: spec.area,
      title: spec.title,
      instruments: (spec.law ?? []).map(([law, cite]) => (cite ? { law, cite } : { law })),
      regulator: spec.regulator ?? null,
      stage_from: spec.stage,
      applies_when: spec.when ?? ALL,
      satisfied_when: sat,
      recurrence: spec.rec ?? null,
      evidence,
      severity: spec.sev,
      tier: spec.tier,
      confidence: spec.review ? 'needs_review' : 'verified',
      text,
      remediation: spec.order ? { action_type: action, quick_order: spec.order } : { action_type: action },
      cost_of_delay: {
        penalty: spec.penalty ?? 'none',
        fundraising_relevant: spec.raising ?? (spec.layer === 2 || spec.layer === 5),
      },
      effective_from: spec.from ?? null,
      effective_to: spec.to ?? null,
      sources: spec.src.map(([section, line, doc]) => ({ doc: doc ?? map, section, line })),
      status: 'draft',
    };
    if (spec.defect !== undefined) rule.defect_when = spec.defect;
    if (spec.verify !== undefined) rule.verify_when = spec.verify;
    if (spec.params !== undefined) rule.parameters = spec.params;
    const overlay = spec.overlay ?? overlayModeFor(spec.id);
    if (overlay !== undefined) rule.market_overlay = overlay;
    const shared = spec.shared ?? sharedObligationFor(spec.id);
    if (shared !== undefined) rule.shared_obligation = shared;
    const answered = answersFor(spec.id);
    if (answered !== undefined) rule.answered_by = answered;
    return rule;
  }

  return {
    /** A rule with its plain-language text written by hand. */
    rule(spec: RuleSpec): void {
      const [headline, missing, why, if_left, fix] = spec.text;
      rules.push(base(spec, spec.sat, spec.evidence, { headline, missing, why, if_left, fix }, spec.action ?? 'upload'));
      const specs = spec.slot === undefined ? [] : Array.isArray(spec.slot) ? spec.slot : [spec.slot];
      for (const slot of specs) addSlot(slot, spec.id, spec.layer);
    },
    /** A document that belongs in the vault. Most of the text follows from what it is and why we ask. */
    doc(spec: DocSpec): void {
      const noun = spec.noun ?? lowerFirst(spec.title);
      const why = spec.why ?? spec.slot.reason;
      const text = {
        headline: `We don't have your ${noun} on file`,
        missing: `You haven't added your ${noun} to your documents yet.`,
        why,
        if_left: spec.ifLeft ?? IF_LEFT_BY_LAYER[spec.layer] ?? 'You will have nothing to show when someone asks.',
        fix: spec.fix ?? `Add your ${noun} to your documents. If you don't have one yet, put one in place and add it here.`,
      };
      rules.push(base(spec, spec.sat ?? held(spec.slot.id), [spec.slot.label], text, spec.action ?? 'upload'));
      addSlot(spec.slot, spec.id, spec.layer);
    },
    build(): { pack: Pack; slots: VaultSlot[] } {
      return {
        pack: {
          jurisdiction,
          name: meta.name,
          version: meta.version,
          status: 'draft',
          inherits: meta.inherits ?? [],
          rules,
        },
        slots: [...slots.values()],
      };
    },
  };
}

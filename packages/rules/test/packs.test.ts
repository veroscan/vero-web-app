import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DERIVED_KEYS,
  InvalidRulePackError,
  JURISDICTIONS,
  QUESTIONNAIRE_FACT_KEYS,
  REGISTRY_FACT_KEYS,
  RuleSchema,
  loadPack,
  packsFor,
  validatePack,
  vaultSlotsFor,
  varsIn,
  type Logic,
  type Pack,
  type Rule,
} from '../src/index.js';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');
const allPacks = JURISDICTIONS.map((j) => loadPack(j));
const allRules = allPacks.flatMap((p) => p.rules);

const docs = new Map<string, string[]>();
function linesOf(doc: string): string[] {
  let lines = docs.get(doc);
  if (!lines) {
    lines = readFileSync(join(REPO_ROOT, doc), 'utf8').split(/\r?\n/);
    docs.set(doc, lines);
  }
  return lines;
}

/** The lines under the heading that contains `section`, up to the next heading of the same or a higher level. */
function sectionLines(doc: string, section: string): string[] {
  const lines = linesOf(doc);
  const start = lines.findIndex((line) => /^#{1,6}\s/.test(line) && line.includes(section));
  if (start === -1) return [];
  const level = /^(#+)/.exec(lines[start] as string)?.[1]?.length ?? 2;
  const out: string[] = [];
  for (const line of lines.slice(start + 1)) {
    const heading = /^(#+)\s/.exec(line);
    if (heading && (heading[1] as string).length <= level) break;
    out.push(line);
  }
  return out;
}

function logicOf(rule: Rule): Logic[] {
  const logic: Logic[] = [rule.applies_when, rule.satisfied_when];
  if (rule.defect_when !== undefined) logic.push(rule.defect_when);
  if (rule.verify_when !== undefined) logic.push(rule.verify_when);
  return logic;
}

function recurrenceFacts(rule: Rule): string[] {
  const r = rule.recurrence;
  if (!r) return [];
  const keys: string[] = r.done_fact ? [r.done_fact] : [];
  if (r.type === 'registry_date' || r.type === 'expiry') keys.push(r.fact);
  if (r.type === 'after_event') keys.push(r.event_fact);
  if (r.type === 'every_years') keys.push(r.from_fact);
  return keys;
}

describe('rule packs load and validate', () => {
  it('has a meaningful number of rules per country', () => {
    const delaware = packsFor('US-DE').flatMap((p) => p.rules);
    expect(delaware.length).toBeGreaterThanOrEqual(100);
    expect(loadPack('GB').rules.length).toBeGreaterThanOrEqual(90);
    expect(loadPack('NG').rules.length).toBeGreaterThanOrEqual(80);
  });

  it('US-DE inherits the federal pack', () => {
    expect(packsFor('US-DE').map((p) => p.jurisdiction)).toEqual(['US', 'US-DE']);
    expect(packsFor('GB').map((p) => p.jurisdiction)).toEqual(['GB']);
  });

  it('keeps every pack and rule in draft', () => {
    for (const pack of allPacks) expect(pack.status).toBe('draft');
    for (const rule of allRules) expect(rule.status).toBe('draft');
  });

  it('refuses a pack that claims to be approved', () => {
    const pack = loadPack('GB');
    expect(() => validatePack({ ...pack, status: 'approved' })).toThrow(InvalidRulePackError);
    expect(() => RuleSchema.parse({ ...pack.rules[0], status: 'approved' })).toThrow();
  });

  it('fails loudly on an invalid pack and names the problem', () => {
    const pack = loadPack('GB');
    const broken: Pack = { ...pack, rules: [{ ...(pack.rules[0] as Rule), severity: 'huge' as Rule['severity'] }] };
    try {
      validatePack(broken);
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidRulePackError);
      expect((error as InvalidRulePackError).message).toContain('rules.0.severity');
    }
  });

  it('rejects bad logic, ids, layers, duplicates and dates', () => {
    const rule = loadPack('NG').rules[0] as Rule;
    expect(() => RuleSchema.parse({ ...rule, applies_when: { bogus: [1] } })).toThrow(/bogus/);
    expect(() => RuleSchema.parse({ ...rule, id: 'not a rule id' })).toThrow();
    expect(() => RuleSchema.parse({ ...rule, id: 'GB.WRONG.PLACE' })).toThrow();
    expect(() => RuleSchema.parse({ ...rule, layer: 7 })).toThrow();
    expect(() => RuleSchema.parse({ ...rule, effective_from: '2026-02-31' })).toThrow();
    expect(() => RuleSchema.parse({ ...rule, effective_from: '2026-01-01', effective_to: '2025-01-01' })).toThrow();
    expect(() => RuleSchema.parse({ ...rule, sources: [] })).toThrow();
    expect(() => validatePack({ ...loadPack('NG'), rules: [rule, rule] })).toThrow(/Duplicate/);
  });
});

describe.each(allRules.map((rule) => [rule.id, rule] as const))('%s', (_id, rule) => {
  it('validates against the schema', () => {
    expect(RuleSchema.safeParse(rule).success).toBe(true);
  });

  it('traces to a real line in its map', () => {
    for (const source of rule.sources) {
      const lines = sectionLines(source.doc, source.section);
      expect(lines.length, `section "${source.section}" not found in ${source.doc}`).toBeGreaterThan(0);
      expect(lines.some((line) => line.includes(source.line)), `"${source.line}" not found under "${source.section}"`).toBe(true);
    }
  });

  it('is needs_review if, and only if, a cited line is tagged or awaiting confirmation', () => {
    const tagged = rule.sources.some((source) => {
      if (source.section.startsWith('6. Thresholds')) return true;
      return sectionLines(source.doc, source.section)
        .filter((line) => line.includes(source.line))
        .some((line) => /\[(verify|\?|K)[^\]]*\]/i.test(line));
    });
    expect(rule.confidence).toBe(tagged ? 'needs_review' : 'verified');
  });

  it('only reads facts that something can write', () => {
    const keys = [...logicOf(rule).flatMap(varsIn), ...recurrenceFacts(rule)];
    const slots = new Set(vaultSlotsFor(rule.jurisdiction).map((s) => s.id));
    for (const key of keys) {
      if (key.startsWith('derived.')) expect(DERIVED_KEYS, key).toContain(key);
      else if (key.startsWith('registry.') || key.startsWith('web.')) expect(REGISTRY_FACT_KEYS as readonly string[], key).toContain(key);
      else if (key.startsWith('answers.') || key.startsWith('company.')) expect(QUESTIONNAIRE_FACT_KEYS, key).toContain(key);
      else if (key.startsWith('vault.')) expect(slots.has(key.split('.')[1] as string), `no vault slot for ${key}`).toBe(true);
      else expect(key.startsWith('attest.'), `unknown namespace: ${key}`).toBe(true);
    }
  });

  it('has complete plain-language text a person can read', () => {
    const text = Object.values(rule.text).join(' ');
    expect(text).not.toMatch(/\btier\s*\d/i);
    expect(text).not.toMatch(/\[verify\]|needs_review|\bdefect\b|\bcritical\b/i);
    expect(text).not.toMatch(/—/);
    expect(rule.title.length).toBeLessThan(90);
  });
});

describe('core sets from section 5 of each map', () => {
  const core: Record<string, string[]> = {
    'US-DE': [
      'US-DE.CORP.ENTITY_ON_RECORD', 'US-DE.CORP.REGISTERED_AGENT', 'US-DE.CORP.GOOD_STANDING', 'US-DE.CORP.FRANCHISE_TAX',
      'US.TAX.EIN', 'US-DE.CORP.BYLAWS', 'US-DE.CORP.ORGANISATIONAL_RESOLUTIONS', 'US-DE.EQUITY.STOCK_LEDGER', 'US.EQUITY.ELECTION_83B',
      'US-DE.IP.PIIA', 'US-DE.IP.NDA', 'US.IP.TRADEMARK', 'US.IP.PATENTS', 'US-DE.DP.PRIVACY_NOTICE', 'US-DE.DP.COOKIE_POLICY', 'US.SANCT.SCREENING',
    ],
    GB: [
      'GB.CORP.STATUS', 'GB.CORP.CONFIRMATION_STATEMENT', 'GB.CORP.ACCOUNTS', 'GB.CORP.DIRECTORS', 'GB.CORP.PSC', 'GB.CORP.DIRECTOR_IDV', 'GB.CORP.PSC_IDV',
      'GB.CORP.CHARGES_INSOLVENCY', 'GB.DP.ICO_FEE', 'GB.DP.PRIVACY_NOTICE', 'GB.DP.COOKIE_CONSENT', 'GB.IP.TRADEMARK',
      'GB.CORP.FOUNDERS_AGREEMENT', 'GB.IP.FOUNDER_ASSIGNMENT', 'GB.IP.NDA', 'GB.CORP.ARTICLES', 'GB.CORP.STATUTORY_REGISTERS', 'GB.CORP.RESOLUTIONS',
    ],
    NG: [
      'NG.CORP.CAC_REGISTRATION', 'NG.CORP.DIRECTORS', 'NG.CORP.SHAREHOLDERS', 'NG.CORP.PSC', 'NG.CORP.ANNUAL_RETURNS', 'NG.TAX.TIN', 'NG.DP.DCPMI_REGISTRATION',
      'NG.DP.PRIVACY_POLICY', 'NG.DP.COOKIE_POLICY', 'NG.DP.CONSENT_COOKIES', 'NG.IP.TRADEMARK', 'NG.CORP.FOUNDERS_AGREEMENT', 'NG.IP.FOUNDER_ASSIGNMENT', 'NG.IP.NDA',
      'NG.CORP.MEMART', 'NG.CORP.STATUTORY_REGISTERS', 'NG.CORP.RESOLUTIONS',
    ],
  };

  it.each(Object.entries(core))('encodes every core item for %s', (jurisdiction, ids) => {
    const rules = new Set(packsFor(jurisdiction as 'US-DE' | 'GB' | 'NG').flatMap((p) => p.rules.map((r) => r.id)));
    for (const id of ids) expect(rules.has(id), id).toBe(true);
  });
});

describe('triggers from the brief are covered in each country', () => {
  const triggers = ['derived.personal_data', 'derived.employees', 'derived.contractors', 'derived.uses_ai', 'derived.has_website', 'derived.invested'];
  it.each(['US-DE', 'GB', 'NG'] as const)('%s has rules behind each trigger', (jurisdiction) => {
    const read = new Set(packsFor(jurisdiction).flatMap((p) => p.rules.flatMap((r) => varsIn(r.applies_when))));
    for (const trigger of triggers) {
      // Nigeria's map has no invested-only rows, so fundraising documents sit under ALL there.
      if (jurisdiction === 'NG' && trigger === 'derived.invested') continue;
      expect(read.has(trigger), `${jurisdiction} has no rule on ${trigger}`).toBe(true);
    }
    const foreign = jurisdiction === 'NG' ? 'derived.foreign_any' : jurisdiction === 'US-DE' ? 'derived.foreign_owned' : 'derived.foreign_workers';
    expect(read.has(foreign)).toBe(true);
    const payments = jurisdiction === 'GB' ? 'derived.sector.uk_financial' : 'derived.sector.payments';
    expect(read.has(payments)).toBe(true);
  });
});

describe('vault slots', () => {
  it.each(['US-DE', 'GB', 'NG'] as const)('%s slots each have a plain reason and a layer', (jurisdiction) => {
    const slots = vaultSlotsFor(jurisdiction);
    expect(slots.length).toBeGreaterThan(40);
    for (const slot of slots) {
      expect(slot.reason.length).toBeGreaterThan(15);
      expect(slot.layer).toBeGreaterThanOrEqual(1);
      expect(slot.layer).toBeLessThanOrEqual(6);
      expect(slot.reason).not.toMatch(/\btier\b/i);
    }
    expect(new Set(slots.map((s) => s.id)).size).toBe(slots.length);
  });

  it('asks for the same two certificates first in Delaware', () => {
    const ids = vaultSlotsFor('US-DE').map((s) => s.id);
    expect(ids).toContain('de_good_standing');
    expect(ids).toContain('de_franchise_tax');
    expect(ids).toContain('ein_letter');
  });

  it('marks things that run out', () => {
    const gb = vaultSlotsFor('GB');
    expect(gb.find((s) => s.id === 'gb_el_insurance')?.expires).toBe(true);
    expect(gb.find((s) => s.id === 'gb_nda')?.expires).toBe(false);
  });
});

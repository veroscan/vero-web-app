import { describe, expect, it } from 'vitest';
import { INTERNATIONAL, INTL_EQUIVALENTS, loadPack, packsFor, runEngine, selectPacks, validatePack, vaultSlotsFor, varsIn, type Fact, type FactValue, type Rule } from '../src/index.js';

/**
 * The draft packs added on 18 Nov 2026: South Africa, Kenya and Ghana (each with the International
 * pack), and Germany (with the EU common rules). None has a connected official register, so the
 * tests hold them to: no register fact read (Africa), nothing "critical", a page missing only fails
 * where the scan reads the site's language, and a [verify] line can only give "to check".
 */
const AS_OF = '2026-12-15';
const AFRICA = ['ZA', 'KE', 'GH'] as const;
const facts = (values: Record<string, FactValue>): Fact[] => Object.entries(values).map(([key, value]) => ({ key, value }));
const logicOf = (rule: Rule) => [rule.applies_when, rule.satisfied_when, ...(rule.defect_when === undefined ? [] : [rule.defect_when]), ...(rule.verify_when === undefined ? [] : [rule.verify_when])];

function outcome(cc: string, id: string, values: Record<string, FactValue>, sources: Record<string, 'ok' | 'unavailable'> = {}) {
  const pack = loadPack(cc);
  const rule = pack.rules.find((item) => item.id === id);
  if (!rule) throw new Error(`No rule ${id}`);
  return runEngine([{ ...pack, rules: [rule] }], { facts: facts(values), sources, stage: 5, as_of: AS_OF }).findings[0]?.outcome;
}

describe.each(AFRICA)('the %s draft pack', (cc) => {
  const pack = loadPack(cc);

  it('loads, validates, is a 0.1.0 draft, and comes with the International pack', () => {
    expect(() => validatePack(pack)).not.toThrow();
    expect(pack.version).toBe('0.1.0');
    expect(pack.rules.length).toBeGreaterThanOrEqual(30);
    for (const rule of pack.rules) expect(rule.status).toBe('draft');
    expect(packsFor(cc).map((item) => item.jurisdiction)).toEqual([cc, INTERNATIONAL]);
  });

  it('reads no register fact and calls nothing critical: no register is connected', () => {
    for (const rule of pack.rules) {
      expect(rule.severity, rule.id).not.toBe('critical');
      for (const key of logicOf(rule).flatMap(varsIn)) expect(key.startsWith('registry.'), `${rule.id} reads ${key}`).toBe(false);
    }
  });

  it('writes for people, and keeps its slots to its own prefix', () => {
    for (const rule of pack.rules) expect([rule.title, ...Object.values(rule.text)].join(' '), rule.id).not.toMatch(/founder|lawyer|Code & Clause|—/i);
    for (const slot of vaultSlotsFor(cc)) expect(slot.id.startsWith(`${cc.toLowerCase()}_`), slot.id).toBe(true);
  });

  it('fails a website rule only where the scan reads the site, and never when it was not scanned', () => {
    const webRules = pack.rules.filter((rule) => logicOf(rule).flatMap(varsIn).some((key) => key.startsWith('web.policy.') && key !== 'web.policy.language_supported'));
    expect(webRules.length).toBeGreaterThan(0);
    const site = { 'answers.has_website': true, 'answers.has_app': false, 'answers.customer_type': 'b2c', 'answers.takes_payments': true, 'answers.processes_personal_data': true, 'answers.uses_ai': true };
    for (const rule of webRules) {
      const missing = Object.fromEntries(logicOf(rule).flatMap(varsIn).filter((key) => key.startsWith('web.policy.')).map((key) => [key, false] as const));
      expect(outcome(cc, rule.id, { ...site, ...missing, 'web.policy.language_supported': false }), rule.id).not.toMatch(/gap|defect/);
      expect(outcome(cc, rule.id, site), `${rule.id} not scanned`).not.toMatch(/gap|defect/);
    }
  });

  it('gives way to the International rule only where it asks the same thing', () => {
    const ids = selectPacks({ incorporation: cc, markets: [] }).packs.flatMap((item) => item.rules.map((rule) => rule.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ['INTL.DP.PRIVACY_NOTICE', 'INTL.CORP.CONSTITUTION', 'INTL.SEC.INCIDENT_RESPONSE']) expect(ids, id).not.toContain(id);
    expect(ids).toContain('INTL.SANCT.SCREENING');
    expect(INTL_EQUIVALENTS['INTL.DP.PRIVACY_NOTICE']).toContain(`${cc}.DP.PRIVACY_NOTICE`);
  });
});

describe('data protection registration is proved by a certificate', () => {
  const pd = { 'answers.processes_personal_data': true };

  it('South Africa: the Information Officer certificate passes, and nothing else does', () => {
    expect(outcome('ZA', 'ZA.DP.INFORMATION_OFFICER', { 'vault.za_information_officer.present': true })).toBe('pass');
    expect(outcome('ZA', 'ZA.DP.INFORMATION_OFFICER', {})).not.toBe('pass');
  });

  it('Kenya: the ODPC certificate, or a confirmed exemption, passes', () => {
    expect(outcome('KE', 'KE.DP.ODPC_REGISTRATION', { ...pd, 'vault.ke_odpc_certificate.present': true })).toBe('pass');
    expect(outcome('KE', 'KE.DP.ODPC_REGISTRATION', { ...pd, 'attest.ke_odpc_exempt': true })).toBe('pass');
    expect(outcome('KE', 'KE.DP.ODPC_REGISTRATION', { 'answers.processes_personal_data': false })).toBe('not_applicable');
  });

  it('Ghana: the DPC certificate passes, and it renews every two years', () => {
    expect(outcome('GH', 'GH.DP.DPC_REGISTRATION', { ...pd, 'vault.gh_dpc_certificate.present': true })).toBe('pass');
    expect(loadPack('GH').rules.find((rule) => rule.id === 'GH.DP.DPC_REGISTRATION')?.recurrence).toMatchObject({ type: 'every_years', years: 2 });
  });

  it('South Africa: the VAT rule rests on an unpromulgated threshold, so it only ever says "to check" and states no figure', () => {
    const rule = loadPack('ZA').rules.find((item) => item.id === 'ZA.TAX.VAT_REGISTRATION');
    expect(rule?.confidence).toBe('needs_review');
    expect(rule?.parameters).toBeUndefined();
    expect(Object.values(rule?.text ?? {}).join(' ')).not.toMatch(/R ?\d/);
    expect(outcome('ZA', 'ZA.TAX.VAT_REGISTRATION', {})).toBe('verify');
  });
});

describe('Germany through OpenRegister', () => {
  const R = 'registry.de.openregister';

  it('reads the provider only to pass, never to fail', () => {
    for (const id of ['DE.CORP.STATUS', 'DE.CORP.SHARE_CAPITAL', 'DE.CORP.MANAGING_DIRECTOR']) {
      expect(loadPack('DE').rules.find((rule) => rule.id === id)?.severity, id).not.toBe('critical');
    }
    expect(outcome('DE', 'DE.CORP.SHARE_CAPITAL', { [`${R}.identified`]: true, [`${R}.legal_form`]: 'gmbh', [`${R}.capital_amount`]: 25000, [`${R}.capital_currency`]: 'EUR' }, { [R]: 'ok' })).toBe('pass');
    expect(outcome('DE', 'DE.CORP.SHARE_CAPITAL', { [`${R}.identified`]: true, [`${R}.legal_form`]: 'gmbh', [`${R}.capital_amount`]: 1000, [`${R}.capital_currency`]: 'EUR' }, { [R]: 'ok' })).toBe('verify');
    expect(outcome('DE', 'DE.CORP.MANAGING_DIRECTOR', { [`${R}.identified`]: true, [`${R}.directors_count`]: 0 }, { [R]: 'ok' })).toBe('verify');
    expect(outcome('DE', 'DE.CORP.MANAGING_DIRECTOR', { [`${R}.identified`]: true, [`${R}.directors_count`]: 1 }, { [R]: 'ok' })).toBe('pass');
  });

  it('with the source off, a register extract answers the status and director rules', () => {
    const extract = { 'vault.de_register_extract.present': true };
    expect(outcome('DE', 'DE.CORP.STATUS', extract, { [R]: 'unavailable' })).toBe('pass');
    expect(outcome('DE', 'DE.CORP.STATUS', {}, { [R]: 'unavailable' })).toBe('verify');
    expect(outcome('DE', 'DE.CORP.MANAGING_DIRECTOR', extract, { [R]: 'unavailable' })).toBe('pass');
  });

  it('uses the German DPO threshold in place of the EU one, asked once', () => {
    const ids = loadPack('DE').rules.map((rule) => rule.id);
    expect(ids).toContain('DE.DP.DPO');
    expect(loadPack('DE').rules.find((rule) => rule.id === 'DE.DP.DPO')?.shared_obligation).toBe('eu_dpo');
    expect(loadPack('DE').rules.find((rule) => rule.id === 'DE.DP.CHILD_CONSENT')?.parameters).toEqual({ age_of_digital_consent: 16 });
  });
});

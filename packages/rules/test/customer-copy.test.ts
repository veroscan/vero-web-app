import { describe, expect, it } from 'vitest';
import { howWeKnow, JURISDICTIONS, loadPack, vaultSlotsFor } from '../src/index.js';

// What a customer reads never sends them to a lawyer, or to Vero or Code & Clause for legal work.
// "An accredited agent" is fine: it is advice, not a referral.
const BANNED = /lawyer|solicitor|attorney|Code & Clause/i;

describe('customer-facing copy', () => {
  it.each(JURISDICTIONS)('%s: issue text and document reasons name no lawyer', (code) => {
    for (const rule of loadPack(code).rules) {
      expect([rule.title, ...Object.values(rule.text)].join(' '), rule.id).not.toMatch(BANNED);
    }
    for (const slot of vaultSlotsFor(code)) expect(`${slot.label} ${slot.reason}`, slot.id).not.toMatch(BANNED);
  });

  it('says how a reviewed document is known without a lawyer', () => {
    const words = howWeKnow({ source: 'vault', source_name: 'your documents', method: 'lawyer', retrieved_at: '2026-11-19T00:00:00Z' }, new Date('2026-11-19T00:00:00Z'));
    expect(words).not.toMatch(BANNED);
  });
});

import { describe, expect, it } from 'vitest';
import { answersToFacts, FieldSchema, JURISDICTIONS, trademarkSerials, loadPack, QUESTIONNAIRE, QUESTIONNAIRE_FACT_KEYS, QuestionSchema, varsIn, visibleQuestions } from '../src/index.js';

describe('questionnaire v1', () => {
  it('has the 22 questions plus the optional reference numbers, numbered in order', () => {
    expect(QUESTIONNAIRE).toHaveLength(23);
    expect(QUESTIONNAIRE.map((q) => q.number)).toEqual(Array.from({ length: 23 }, (_, i) => i + 1));
  });

  it('validates as data', () => {
    for (const question of QUESTIONNAIRE) expect(QuestionSchema.safeParse(question).success).toBe(true);
  });

  it('has a "why we ask" line on every question', () => {
    for (const question of QUESTIONNAIRE) expect(question.why_we_ask.length, question.id).toBeGreaterThan(20);
  });

  it('takes the country of registration from the company record, for any country', () => {
    const field = QUESTIONNAIRE[0]?.fields.find((f) => f.id === 'jurisdiction');
    expect(field?.type).toBe('text');
    for (const code of ['US-DE', 'GB', 'NG', 'KE', 'FR', 'US-CA']) {
      const { problems, values } = answersToFacts({ jurisdiction: code });
      expect(problems, code).toEqual([]);
      expect(values['company.jurisdiction']).toBe(code);
    }
    expect(answersToFacts({ jurisdiction: 'Kenya' }).problems[0]?.message).toContain('country code');
  });

  it('gives a company in any country the questions that are not about one country, and no other country\'s', () => {
    const ids = (answers: Parameters<typeof visibleQuestions>[0]) => visibleQuestions(answers).flatMap((q) => q.fields.map((f) => f.id));
    const kenya = ids({ jurisdiction: 'KE', processes_personal_data: true, has_employees: true });
    for (const id of ['has_employees', 'processes_personal_data', 'ai_roles', 'ip_founders_signed', 'lei']) expect(kenya, id).toContain(id);
    for (const id of ['entity_type_us', 'entity_type_gb', 'entity_type_ng', 'vat_number', 'us_trademark_serials', 'franchise_tax_paid_on', 'last_confirmation_on', 'data_subjects_gb_12m', 'data_subjects_ng_6m']) {
      expect(kenya, id).not.toContain(id);
    }
    // A US state gets the federal questions, not Delaware's own.
    const california = ids({ jurisdiction: 'US-CA' });
    for (const id of ['entity_type_us', 'foreign_ownership_25_plus', 'us_trademark_serials', 'federal_return_filed_on']) expect(california, id).toContain(id);
    expect(california).not.toContain('franchise_tax_paid_on');
    // An EU company is asked for its VAT number, for the EU VAT register.
    expect(ids({ jurisdiction: 'FR' })).toContain('vat_number');
    expect(answersToFacts({ jurisdiction: 'FR', vat_number: 'FR40303265045' }).problems).toEqual([]);
  });

  it('asks for an LEI everywhere, optionally, and checks its shape', () => {
    const field = QUESTIONNAIRE.flatMap((q) => q.fields).find((f) => f.id === 'lei');
    expect(field?.optional).toBe(true);
    expect(field?.fact).toBe('answers.lei');
    expect(answersToFacts({ jurisdiction: 'KE', lei: '5493001KJTIIGC8Y1R12' }).values['answers.lei']).toBe('5493001KJTIIGC8Y1R12');
    expect(answersToFacts({ jurisdiction: 'KE', lei: 'ABC' }).problems[0]?.message).toContain('20 letters and numbers');
  });

  it('uses plain English, with no legal shorthand in the labels', () => {
    for (const question of QUESTIONNAIRE) {
      for (const field of question.fields) {
        expect(field.label).not.toMatch(/\b(DCPMI|PSC|ADMT|DPIA|ROPA)\b/);
        expect(field.label).not.toMatch(/—/);
      }
    }
  });

  it('gives every field a unique id', () => {
    const ids = QUESTIONNAIRE.flatMap((q) => q.fields.map((f) => f.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every show_when only reads facts the questionnaire writes', () => {
    for (const question of QUESTIONNAIRE) {
      const logic = [question.show_when, ...question.fields.map((f) => f.show_when)].filter((l) => l !== undefined);
      for (const key of logic.flatMap(varsIn)) expect(QUESTIONNAIRE_FACT_KEYS, key).toContain(key);
    }
  });

  it('every question a rule depends on has somewhere to write it', () => {
    const reads = JURISDICTIONS.flatMap((j) => loadPack(j).rules.flatMap((r) => varsIn(r.applies_when)));
    for (const key of reads.filter((k) => k.startsWith('answers.') || k.startsWith('company.'))) {
      expect(QUESTIONNAIRE_FACT_KEYS, key).toContain(key);
    }
  });
});

describe('answers become facts', () => {
  it('writes a fact per answer', () => {
    const { values, problems } = answersToFacts({ jurisdiction: 'GB', incorporated: true, entity_type_gb: 'ltd', has_employees: true });
    expect(problems).toEqual([]);
    expect(values['company.jurisdiction']).toBe('GB');
    expect(values['company.entity_type']).toBe('ltd');
    expect(values['answers.has_employees']).toBe(true);
  });

  it('fills in hidden follow-ups so they are not left unknown', () => {
    const { values } = answersToFacts({ jurisdiction: 'GB', has_employees: false, processes_personal_data: false });
    expect(values['answers.has_foreign_workers']).toBe(false);
    expect(values['answers.sensitive_data']).toEqual(['none']);
    expect(values['answers.uses_processors']).toBe(false);
    expect(values['answers.automated_decisions']).toBe(false);
  });

  it('ignores an answer to a question that is not showing', () => {
    const { values } = answersToFacts({ jurisdiction: 'GB', has_employees: false, has_foreign_workers: true });
    expect(values['answers.has_foreign_workers']).toBe(false);
  });

  it('leaves unanswered questions out, rather than guessing', () => {
    const { values } = answersToFacts({ jurisdiction: 'GB' });
    expect(values['answers.has_employees']).toBeUndefined();
  });

  it('reports bad answers in plain words', () => {
    const { problems } = answersToFacts({ jurisdiction: 'GB', has_employees: 'lots', revenue_band: 'huge', user_countries: ['Mars'] });
    // Reported in question order: 2, 5, 6.
    expect(problems.map((p) => p.field)).toEqual(['user_countries', 'has_employees', 'revenue_band']);
    expect(problems[0]?.message).toContain("can't use");
  });

  it('checks dates and numbers', () => {
    const bad = answersToFacts({ jurisdiction: 'GB', last_confirmation_on: '2026-02-31', processes_personal_data: true, data_subjects_gb_12m: -1 });
    expect(bad.problems.map((p) => p.field).sort()).toEqual(['data_subjects_gb_12m', 'last_confirmation_on']);
    const good = answersToFacts({ jurisdiction: 'GB', last_confirmation_on: '2026-02-20', processes_personal_data: true, data_subjects_gb_12m: 1000 });
    expect(good.problems).toEqual([]);
  });
});

describe('conditional logic', () => {
  const ids = (answers: Parameters<typeof visibleQuestions>[0]) => visibleQuestions(answers).flatMap((q) => q.fields.map((f) => f.id));

  it('adapts to the country', () => {
    expect(ids({ jurisdiction: 'US-DE' })).toContain('entity_type_us');
    expect(ids({ jurisdiction: 'US-DE' })).toContain('operates_in_delaware');
    expect(ids({ jurisdiction: 'US-DE' })).toContain('franchise_tax_paid_on');
    expect(ids({ jurisdiction: 'US-DE' })).not.toContain('last_confirmation_on');
    expect(ids({ jurisdiction: 'GB' })).toContain('last_confirmation_on');
    expect(ids({ jurisdiction: 'GB' })).toContain('has_premises');
    expect(ids({ jurisdiction: 'GB' })).not.toContain('operates_in_delaware');
    expect(ids({ jurisdiction: 'NG' })).toContain('last_annual_return_on');
    expect(ids({ jurisdiction: 'NG' })).toContain('foreign_shareholders_or_directors');
  });

  it('only asks about US states if you have US users', () => {
    expect(ids({ jurisdiction: 'GB', user_countries: ['GB'] })).not.toContain('us_states');
    expect(ids({ jurisdiction: 'GB', user_countries: ['US'] })).toContain('us_states');
  });

  it('follows up on California only when California is chosen', () => {
    const base = { jurisdiction: 'US-DE', user_countries: ['US'] };
    expect(ids({ ...base, us_states: ['DE'] })).not.toContain('data_subjects_ca_12m');
    expect(ids({ ...base, us_states: ['CA'] })).toContain('data_subjects_ca_12m');
  });

  it('skips the data questions if you hold no personal data', () => {
    const none = ids({ jurisdiction: 'NG', processes_personal_data: false });
    expect(none).not.toContain('sensitive_data');
    expect(none).not.toContain('data_subjects_ng_6m');
    expect(ids({ jurisdiction: 'NG', processes_personal_data: true })).toContain('data_subjects_ng_6m');
  });

  it('shows the partner agreement question only for partner-only payments', () => {
    expect(ids({ payments_mode: ['psp_only'] })).toContain('has_partner_agreement');
    expect(ids({ payments_mode: ['none'] })).not.toContain('has_partner_agreement');
  });

  it('removes questions with nothing left to ask', () => {
    expect(visibleQuestions({ jurisdiction: 'GB' }).map((q) => q.id)).not.toContain('sensitive_data');
  });

  it('hides a follow-up until its parent is answered', () => {
    expect(ids({})).not.toContain('has_foreign_workers');
    expect(ids({ has_employees: true })).toContain('has_foreign_workers');
  });
});

describe('reference numbers (question 23)', () => {
  const ids = (answers: Parameters<typeof visibleQuestions>[0]) => visibleQuestions(answers).flatMap((q) => q.fields.map((f) => f.id));
  const fieldOf = (id: string) => QUESTIONNAIRE.flatMap((q) => q.fields).find((f) => f.id === id);

  it('asks a UK company for its VAT number, and not a Delaware or Nigerian one', () => {
    expect(ids({ jurisdiction: 'GB' })).toContain('vat_number');
    expect(ids({ jurisdiction: 'US-DE' })).not.toContain('vat_number');
    expect(ids({ jurisdiction: 'NG' })).not.toContain('vat_number');
  });

  it('asks for the ICO number only where UK data law applies and personal data is held', () => {
    expect(ids({ jurisdiction: 'GB', processes_personal_data: true })).toContain('ico_registration_number');
    expect(ids({ jurisdiction: 'GB', processes_personal_data: false })).not.toContain('ico_registration_number');
    expect(ids({ jurisdiction: 'US-DE', processes_personal_data: true })).not.toContain('ico_registration_number');
    expect(ids({ jurisdiction: 'NG', user_countries: ['GB'], processes_personal_data: true })).toContain('ico_registration_number');
    expect(ids({ jurisdiction: 'NG', processes_personal_data: true })).not.toContain('reference_numbers');
  });

  it('asks a Delaware company for trademark serials', () => {
    expect(ids({ jurisdiction: 'US-DE' })).toContain('us_trademark_serials');
    expect(ids({ jurisdiction: 'GB' })).not.toContain('us_trademark_serials');
  });

  it('marks all three optional, explains each in plain words, and leaves no default when skipped', () => {
    for (const id of ['vat_number', 'ico_registration_number', 'us_trademark_serials']) {
      const field = fieldOf(id);
      expect(field?.optional, id).toBe(true);
      expect(field?.help?.length, id).toBeGreaterThan(30);
      expect(field?.if_hidden, id).toBeUndefined();
    }
    const { values } = answersToFacts({ jurisdiction: 'GB' });
    expect(values['answers.vat_number']).toBeUndefined();
  });

  it('accepts good numbers in the forms people write them', () => {
    for (const vat of ['123456789', 'GB123456789', 'gb 123 4567 89', '123456789012']) {
      const { problems, values } = answersToFacts({ jurisdiction: 'GB', vat_number: vat });
      expect(problems, vat).toEqual([]);
      expect(values['answers.vat_number']).toBe(vat);
    }
    expect(answersToFacts({ jurisdiction: 'GB', processes_personal_data: true, ico_registration_number: 'ZA123456' }).problems).toEqual([]);
    expect(answersToFacts({ jurisdiction: 'US-DE', us_trademark_serials: '97123456, 97123457' }).problems).toEqual([]);
  });

  it('refuses a malformed number with a plain message that says what a good one looks like', () => {
    const vat = answersToFacts({ jurisdiction: 'GB', vat_number: '12345' });
    expect(vat.problems[0]?.message).toContain('9 digits');
    expect(vat.values['answers.vat_number']).toBeUndefined();
    expect(answersToFacts({ jurisdiction: 'GB', processes_personal_data: true, ico_registration_number: 'AB123' }).problems[0]?.message).toContain('starts with Z');
    expect(answersToFacts({ jurisdiction: 'US-DE', us_trademark_serials: 'KESTREL' }).problems[0]?.message).toContain('8 digits');
  });

  it('reads serial numbers out of an answer, without duplicates', () => {
    expect(trademarkSerials('97123456, 97123457;97123456')).toEqual(['97123456', '97123457']);
    expect(trademarkSerials(undefined)).toEqual([]);
    expect(trademarkSerials(true)).toEqual([]);
  });

  it('only lets text fields carry a format', () => {
    expect(FieldSchema.safeParse({ id: 'x', label: 'Xxx', type: 'boolean', fact: 'answers.x', format: { pattern: '.', message: 'Not a good answer.' } }).success).toBe(false);
  });
});

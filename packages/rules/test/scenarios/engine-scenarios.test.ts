import { describe, expect, it } from 'vitest';
import {
  badgeEligibility,
  howWeKnow,
  packsFor,
  roundScore,
  scoreFindings,
  SCORING,
  selectPacks,
  type EvidenceMethod,
  type Fact,
  type MvpMarket,
  type Outcome,
  type ScorableFinding,
  type Severity,
  type SourceState,
} from '../../src/index.js';
import { answersFor, AS_OF, byRule, CLEAN, HOME_SOURCES, readingPrefix, SOURCES, world, wordsOf, type SourceKey, type WorldOptions } from './world.js';

/**
 * The scenario specification for the pure engine (docs/SCENARIO-AUDIT.md). Each block is one
 * situation a real company can be in; each test says, in plain words, what the engine must do.
 * Facts are made up; no provider is asked.
 */

const COUNTRIES: MvpMarket[] = ['GB', 'NG', 'US-DE'];
const SCORED = new Set<Outcome>(['pass', 'gap', 'defect']);
const isThin = (coverage: { counted: number; total: number }) => coverage.counted < coverage.total * SCORING.status.healthy_needs_coverage;

describe.each(COUNTRIES)('a company incorporated in %s', (country) => {
  describe('that is clean and healthy, with everything on file', () => {
    const w = world({ country, allDocuments: true });

    it('scores Healthy, with no urgent issue, from more than half of what applies', () => {
      expect(w.score.overall).toBeGreaterThanOrEqual(SCORING.status.healthy_from);
      expect(w.score.status).toBe('Healthy');
      expect(w.score.open_critical).toBe(0);
      expect(w.score.held_by_urgent).toBe(false);
      expect(isThin(w.score.coverage)).toBe(false);
    });

    it('always says what the score rests on', () => {
      expect(w.score.coverage.counted).toBeGreaterThan(0);
      expect(w.score.coverage.total).toBeGreaterThanOrEqual(w.score.coverage.counted);
      for (const layer of w.score.layers) expect(layer.coverage.total).toBeGreaterThanOrEqual(layer.coverage.counted);
    });

    it('still cannot earn the Verified badge without a full scan in the last 90 days', () => {
      const badge = badgeEligibility({ overall: w.score.overall, findings: w.findings, last_full_scan_on: null, as_of: AS_OF });
      expect(badge.eligible).toBe(false);
      expect(badge.blockers).toContain('Run a full scan first.');
    });
  });

  describe('that is young, with little checked yet', () => {
    const w = world({ country });

    it('shows a score, but calls it an "Early read", never Healthy', () => {
      expect(w.score.overall).not.toBeNull();
      expect(isThin(w.score.coverage)).toBe(true);
      expect(w.score.status).not.toBe('Healthy');
      if ((w.score.overall ?? 0) >= SCORING.status.healthy_from) expect(w.score.status).toBe('Early read');
    });

    it('labels thin areas too', () => {
      for (const layer of w.score.layers) {
        if (layer.score === null || layer.score < SCORING.status.healthy_from) continue;
        if (isThin(layer.coverage)) expect(layer.coverage.counted).toBeLessThan(layer.coverage.total * 0.5);
      }
    });

    it('leaves every empty document slot "not checked yet", never a gap', () => {
      const documentOnly = w.findings.filter((item) => item.document_rule);
      expect(documentOnly.length).toBeGreaterThan(0);
      for (const item of documentOnly) {
        expect(['verify', 'not_applicable'], item.rule_id).toContain(item.outcome);
        expect(item.scored).toBe(false);
      }
    });

    it('lets the free plan range look as thin as it is', () => {
      expect(w.range).not.toBeNull();
      expect(w.range?.coverage.total).toBe(w.score.coverage.total);
      expect(isThin(w.range?.coverage ?? { counted: 0, total: 1 })).toBe(true);
    });
  });

  describe('when every source is unavailable', () => {
    const states = Object.fromEntries(HOME_SOURCES[country].map((key) => [key, 'unavailable'])) as Partial<Record<SourceKey, SourceState>>;
    const w = world({ country, states, allDocuments: true });

    it('never treats an older value from a source that is down as known', () => {
      const down = HOME_SOURCES[country].map((key) => SOURCES[key].prefix);
      for (const item of w.findings) {
        for (const used of item.facts_used) {
          if (down.some((prefix) => used.key.startsWith(`${prefix}.`))) expect(used.known, `${item.rule_id} ${used.key}`).toBe(false);
        }
      }
    });

    it('never passes or fails a check that only a source could answer', () => {
      for (const item of w.findings) {
        const keys = item.facts_used.map((used) => used.key);
        const onlySources = keys.length > 0 && keys.every((key) => key.startsWith('registry.') || key.startsWith('web.'));
        if (onlySources && item.outcome !== 'not_applicable') {
          expect(item.outcome, item.rule_id).toBe('verify');
          expect(item.reason, item.rule_id).toBe(item.confidence === 'needs_review' ? 'needs_review' : 'source_unavailable');
        }
      }
    });

    it('puts no date in the calendar that comes from a source that is down', () => {
      for (const dated of w.deadlines.dated) expect(dated.basis, dated.rule_id).not.toBe('source_date');
    });

    it('scores only what it could check, and says so', () => {
      const clean = world({ country, allDocuments: true });
      expect(w.score.coverage.counted).toBeLessThan(clean.score.coverage.counted);
      if (w.score.overall !== null) expect(w.score.overall).toBeLessThanOrEqual(100);
    });
  });
});

describe('one source at a time', () => {
  const cases: [SourceState, string][] = [
    ['unavailable', 'source_unavailable'],
    ['error', 'source_error'],
    ['waiting', 'source_waiting'],
    ['unsupported', 'needs_identifier'],
    ['ambiguous', 'source_ambiguous'],
  ];

  it.each(cases)('a register that is %s makes its checks "to check" with the reason %s, and names the source', (state, reason) => {
    const w = world({ country: 'GB', states: { ch: state } });
    const status = byRule(w.findings, 'GB.CORP.STATUS');
    expect(status.outcome).toBe('verify');
    expect(status.scored).toBe(false);
    expect(status.reason).toBe(reason);
    expect(status.reason_source).toBe(SOURCES.ch.prefix);
  });

  it('a paid vendor still preparing its report is "waiting", not a pass or a fail, and is decided once it answers', () => {
    const waiting = world({ country: 'US-DE', states: { de: 'waiting' } });
    const record = byRule(waiting.findings, 'US-DE.CORP.ENTITY_ON_RECORD');
    expect(record.outcome).toBe('verify');
    expect(record.reason).toBe('source_waiting');
    const answered = world({ country: 'US-DE' });
    expect(byRule(answered.findings, 'US-DE.CORP.ENTITY_ON_RECORD').outcome).toBe('pass');
  });

  it('a source that is down does not move the score of checks that do not read it', () => {
    const up = world({ country: 'GB', allDocuments: true });
    const down = world({ country: 'GB', allDocuments: true, states: { ico: 'unavailable' } });
    const untouched = (findings: typeof up.findings) => findings.filter((item) => !readingPrefix([item], 'registry.uk.ico').length && !item.facts_used.some((used) => used.key.startsWith('derived.uk.ico'))).map((item) => [item.rule_id, item.outcome]);
    expect(untouched(down.findings)).toEqual(untouched(up.findings));
  });
});

describe('missing identifiers', () => {
  it('without a VAT number, HMRC is unsupported and the VAT checks wait for the number', () => {
    const w = world({ country: 'GB', answers: undefined, states: { vat: 'unsupported' } });
    const vat = byRule(w.findings, 'GB.TAX.VAT_RETURNS');
    expect(vat.outcome).toBe('verify');
    expect(vat.reason).toBe('needs_identifier');
    expect(vat.reason_source).toBe(SOURCES.vat.prefix);
  });

  it('once the number is added and HMRC answers, the check is decided by what HMRC said', () => {
    const w = world({ country: 'GB' });
    expect(byRule(w.findings, 'GB.TAX.VAT_RETURNS').outcome).not.toBe('not_applicable');
    const notRegistered = world({ country: 'GB', registry: { vat: { registered: false } } });
    expect(byRule(notRegistered.findings, 'GB.TAX.VAT_RETURNS').outcome).toBe('not_applicable');
  });

  it('an ICO register that needs the ICO number is "to check", never "not on the register"', () => {
    const w = world({ country: 'GB', states: { ico: 'unsupported' } });
    const ico = byRule(w.findings, 'GB.DP.ICO_FEE');
    expect(ico.outcome).toBe('verify');
    expect(ico.reason).toBe('needs_identifier');
  });
});

describe('name matching', () => {
  it('an ambiguous register match is never used as the company', () => {
    const w = world({ country: 'NG', states: { cac: 'ambiguous' } });
    const cac = byRule(w.findings, 'NG.CORP.CAC_REGISTRATION');
    expect(cac.outcome).toBe('verify');
    expect(cac.reason).toBe('source_ambiguous');
    expect(cac.facts_used.every((used) => !used.key.startsWith('registry.') || !used.known)).toBe(true);
  });
});

describe('sanctions', () => {
  it('an exact name match is urgent, caps the score at 74, and never says the company is sanctioned', () => {
    const w = world({ country: 'US-DE', allDocuments: true, registry: { sanctions: { ...CLEAN.sanctions, match: true, possible_match: false } } });
    const screening = byRule(w.findings, 'US.SANCT.SCREENING');
    expect(screening.outcome).toBe('defect');
    expect(screening.severity_word).toBe('Urgent');
    expect(w.score.overall).toBeLessThanOrEqual(SCORING.overall_critical_cap);
    expect(w.score.held_by_urgent).toBe(true);
    const words = wordsOf(screening);
    expect(words).not.toMatch(/\b(is|are|was) sanctioned\b|\bsanctioned (company|business|entity)\b/i);
    expect(words).toMatch(/may be another business/i);
  });

  it('a possible match (the source answers "ambiguous") is a person\'s check, never a pass', () => {
    const w = world({ country: 'US-DE', registry: { sanctions: { lists_checked: CLEAN.sanctions.lists_checked as string[], possible_match: true } }, states: { sanctions: 'ambiguous' } });
    const screening = byRule(w.findings, 'US.SANCT.SCREENING');
    expect(screening.outcome).toBe('verify');
    expect(screening.scored).toBe(false);
    expect(screening.reason).toBe('source_ambiguous');
  });

  it('a stale list makes the whole sanctions check unavailable: never "no match"', () => {
    const w = world({ country: 'US-DE', states: { sanctions: 'unavailable' } });
    const screening = byRule(w.findings, 'US.SANCT.SCREENING');
    expect(screening.outcome).toBe('verify');
    expect(screening.reason).toBe('source_unavailable');
  });

  it('today, a GB or NG company without sanctions exposure has no rule that scores an exact match (decision D2)', () => {
    for (const country of ['GB', 'NG'] as const) {
      const answers = { ...answersFor(country), exports_controlled_tech: false };
      const w = world({ country, answers, registry: { sanctions: { ...CLEAN.sanctions, match: true } } });
      const readers = readingPrefix(w.findings, 'registry.sanctions').filter((item) => item.scored);
      expect(readers, country).toEqual([]);
    }
  });
});

describe('a company that has ceased', () => {
  it.each(['dissolved', 'liquidation', 'administration'])('a UK company shown as %s is urgent and the score says why it is held', (status) => {
    const w = world({ country: 'GB', allDocuments: true, registry: { ch: { ...CLEAN.ch, status } } });
    const finding = byRule(w.findings, 'GB.CORP.STATUS');
    expect(finding.outcome).toBe('defect');
    expect(finding.severity).toBe('critical');
    expect(w.score.overall).toBeLessThanOrEqual(74);
    expect(w.score.held_by_urgent).toBe(true);
    expect(w.score.status).not.toBe('Healthy');
  });

  it('a UK company Companies House did not find is "to check", never "does not exist"', () => {
    const w = world({ country: 'GB', registry: { ch: { found: false } } });
    expect(byRule(w.findings, 'GB.CORP.STATUS').outcome).toBe('verify');
  });

  it('a Nigerian company returned as inactive is urgent', () => {
    const w = world({ country: 'NG', registry: { cac: { ...CLEAN.cac, status: 'inactive' } } });
    expect(byRule(w.findings, 'NG.CORP.CAC_REGISTRATION').outcome).toBe('defect');
    expect(w.score.overall).toBeLessThanOrEqual(74);
  });

  it('today, a filed Certificate of Incorporation outranks an "inactive" CAC status, so the urgent finding passes (decision D5)', () => {
    const certificate: Fact[] = [{ key: 'vault.ng_certificate_of_incorporation.present', value: true }];
    const w = world({ country: 'NG', registry: { cac: { ...CLEAN.cac, status: 'inactive' } }, extra: certificate });
    expect(byRule(w.findings, 'NG.CORP.CAC_REGISTRATION').outcome).toBe('pass');
  });

  it('a Nigerian company the provider did not find is "to check"', () => {
    const w = world({ country: 'NG', registry: { cac: { found: false } } });
    expect(byRule(w.findings, 'NG.CORP.CAC_REGISTRATION').outcome).toBe('verify');
  });

  it('a Delaware record the provider did not return is a gap today, and its words say that does not mean the company does not exist (decision D3)', () => {
    const w = world({ country: 'US-DE', registry: { de: { found: false } } });
    const record = byRule(w.findings, 'US-DE.CORP.ENTITY_ON_RECORD');
    expect(record.outcome).toBe('gap');
    expect(record.text.missing).toContain("That doesn't mean the company doesn't exist");
  });

  it('Delaware status never comes from a live source: no rule reads the vendor\'s status (decision D4)', () => {
    const w = world({ country: 'US-DE', registry: { de: { ...CLEAN.de, vendor_status: 'void' } } });
    expect(w.findings.filter((item) => item.facts_used.some((used) => used.key.endsWith('.vendor_status')))).toEqual([]);
  });
});

describe('urgent and important findings', () => {
  it('an urgent finding caps a perfect company at 74, and the score says the cap is why', () => {
    const w = world({ country: 'GB', allDocuments: true, registry: { ch: { ...CLEAN.ch, status: 'dissolved' } } });
    const uncapped = world({ country: 'GB', allDocuments: true });
    expect(uncapped.score.overall).toBeGreaterThan(74);
    expect(w.score.overall).toBe(74);
    expect(w.score.held_by_urgent).toBe(true);
    expect(w.score.status).toBe('Needs work');
    const badge = badgeEligibility({ overall: w.score.overall, findings: w.findings, last_full_scan_on: '2026-10-01', as_of: AS_OF });
    expect(badge.blockers).toContain('Every urgent issue needs to be fixed first.');
  });

  it('many important findings but none urgent: no cap, and the word follows the number', () => {
    const w = world({
      country: 'GB',
      registry: {
        ch: { ...CLEAN.ch, confirmation_overdue: true, accounts_overdue: true, registered_office_in_dispute: true },
        ico: { listed: false },
        web: { privacy_notice_found: true, complaint_route_ico: false, cookie_policy_found: false, terms_found: false, cmp_detected: false, cookies_before_consent_count: 3 },
      },
    });
    const open = w.findings.filter((item) => item.scored && (item.outcome === 'gap' || item.outcome === 'defect'));
    expect(open.filter((item) => item.severity === 'high').length).toBeGreaterThanOrEqual(3);
    expect(open.filter((item) => item.severity === 'critical')).toEqual([]);
    expect(w.score.held_by_urgent).toBe(false);
    expect(w.score.open_critical).toBe(0);
  });

  it('a register miss on the ICO list counts as a gap, and its words say it may not mean the fee is unpaid (decision D3)', () => {
    const w = world({ country: 'GB', registry: { ico: { listed: false } } });
    const ico = byRule(w.findings, 'GB.DP.ICO_FEE');
    expect(ico.outcome).toBe('gap');
    expect(ico.text.missing).toMatch(/may not mean you haven't paid/);
  });
});

describe('documents', () => {
  it('an empty slot is "not checked yet" and becomes a gap only when the person says they do not have it', () => {
    const empty = world({ country: 'GB' });
    const id = 'GB.IP.FOUNDER_ASSIGNMENT';
    expect(byRule(empty.findings, id).outcome).toBe('verify');
    expect(byRule(empty.findings, id).reason).toBe('not_seen_yet');
    const declared = world({ country: 'GB', declaredMissing: [id] });
    expect(byRule(declared.findings, id).outcome).toBe('gap');
    expect(byRule(declared.findings, id).declared_missing).toBe(true);
  });

  it('a Certificate of Good Standing filed but not confirmed on Delaware\'s validator is "to check", never "certified"', () => {
    const doc = (validated: boolean, dated: string): Fact[] => [
      { key: 'vault.de_good_standing.present', value: true },
      { key: 'vault.de_good_standing.dated', value: dated },
      ...(validated ? [{ key: 'vault.de_good_standing.validated', value: true }] : []),
    ];
    const unconfirmed = world({ country: 'US-DE', extra: doc(false, '2026-10-01') });
    expect(byRule(unconfirmed.findings, 'US-DE.CORP.GOOD_STANDING').outcome).toBe('verify');
    const certified = world({ country: 'US-DE', extra: doc(true, '2026-10-01') });
    expect(byRule(certified.findings, 'US-DE.CORP.GOOD_STANDING').outcome).toBe('pass');
    const old = world({ country: 'US-DE', extra: doc(true, '2025-09-01') });
    expect(byRule(old.findings, 'US-DE.CORP.GOOD_STANDING').outcome).toBe('gap');
  });

  it('the free plan range never counts a check that only a document can decide (bug fixed: derived from documents)', () => {
    const w = world({ country: 'US-DE', extra: [
      { key: 'vault.de_good_standing.present', value: true },
      { key: 'vault.de_good_standing.dated', value: '2026-10-01' },
      { key: 'vault.de_good_standing.validated', value: true },
    ] });
    expect(byRule(w.findings, 'US-DE.CORP.GOOD_STANDING').free_plan_evidence).toBe(false);
    // A check worked out from a public register still counts.
    const gb = world({ country: 'GB' });
    expect(byRule(gb.findings, 'GB.DP.ICO_FEE').free_plan_evidence).toBe(true);
  });
});

describe('rules still waiting on a lawyer', () => {
  const all = COUNTRIES.flatMap((country) => packsFor(country)).filter((pack, index, list) => list.findIndex((other) => other.jurisdiction === pack.jurisdiction) === index);
  const draft = all.flatMap((pack) => pack.rules).filter((rule) => rule.confidence === 'needs_review');

  it('there are 60 of them, and no rule is marked approved', () => {
    expect(draft).toHaveLength(60);
    expect(all.flatMap((pack) => pack.rules).every((rule) => rule.status === 'draft')).toBe(true);
  });

  it('none is ever scored, even when every fact it reads is known', () => {
    for (const country of COUNTRIES) {
      const w = world({ country, allDocuments: true });
      for (const item of w.findings.filter((finding) => finding.confidence === 'needs_review')) {
        expect(item.scored, item.rule_id).toBe(false);
        expect(['verify', 'not_applicable']).toContain(item.outcome);
      }
    }
  });
});

describe('data that must not change the score', () => {
  const github: Fact[] = [
    ['github.repositories', ['heron/app']], ['github.licence_spdx', ['MIT']], ['github.licence_file_repos', ['heron/app']], ['github.security_policy_repos', []],
    ['github.public_repos', ['heron/app']], ['github.contributor_count', 3], ['github.package_json_licences', ['GPL-3.0']],
  ].map(([key, value]) => ({ key: key as string, value: value as Fact['value'], provenance: { source: 'github', source_name: 'GitHub', method: 'document' as const, retrieved_at: AS_OF } }));
  const france: Fact[] = [
    ['registry.fr.recherche_entreprises.identified', true], ['registry.fr.recherche_entreprises.status', 'ceased'], ['registry.fr.cnil_dpo.listed', false],
  ].map(([key, value]) => ({ key: key as string, value: value as Fact['value'], provenance: { source: 'fr', source_name: 'Annuaire des Entreprises', method: 'official_live' as const, retrieved_at: AS_OF } }));

  it.each(COUNTRIES)('GitHub facts appear as evidence only: %s findings and score are identical with or without them', (country) => {
    const without = world({ country, allDocuments: true });
    const withGithub = world({ country, allDocuments: true, extra: github });
    expect(withGithub.findings.map((item) => [item.rule_id, item.outcome])).toEqual(without.findings.map((item) => [item.rule_id, item.outcome]));
    expect(withGithub.score).toEqual(without.score);
  });

  it.each(COUNTRIES)('French facts, even a "ceased" French record, change nothing for a %s company', (country) => {
    const without = world({ country });
    const withFrance = world({ country, extra: france });
    expect(withFrance.score).toEqual(without.score);
  });

  it('countries with no rule pack add no rules, whatever the markets say', () => {
    const base = selectPacks({ incorporation: 'GB', markets: [] });
    const elsewhere = selectPacks({ incorporation: 'GB', markets: ['TZ', 'EU', 'other', 'BR'] });
    expect(elsewhere.used).toEqual(base.used);
  });
});

describe('operating-market combinations', () => {
  const combos: [MvpMarket, string[], string[]][] = [
    ['GB', ['NG'], ['GB', 'NG']],
    ['GB', ['US'], ['GB', 'US', 'US-DE']],
    ['NG', ['GB', 'US'], ['NG', 'GB', 'US', 'US-DE']],
    ['US-DE', ['GB', 'NG'], ['US', 'US-DE', 'GB', 'NG']],
    // France has a draft pack since 16 Nov 2026: its data and AI rules follow the company there.
    ['US-DE', ['EU', 'FR'], ['US', 'US-DE', 'FR']],
  ];

  it.each(combos)('a %s company with users in %j is measured against %j', (country, markets, expected) => {
    const selection = selectPacks({ incorporation: country, markets });
    expect(selection.packs.map((pack) => pack.jurisdiction).sort()).toEqual([...expected].sort());
    // Abroad, only compliance and AI and data rules follow the company, never its filings.
    for (const use of selection.used.filter((item) => item.mode === 'overlay')) {
      const pack = selection.packs.find((item) => item.jurisdiction === use.jurisdiction);
      expect(pack?.rules.every((rule) => rule.layer !== 1)).toBe(true);
    }
  });

  const URGENT: Record<MvpMarket, WorldOptions['registry']> = {
    GB: { ch: { ...CLEAN.ch, status: 'dissolved' } },
    NG: { cac: { ...CLEAN.cac, status: 'inactive' } },
    'US-DE': { sanctions: { ...CLEAN.sanctions, match: true } },
  };

  it.each(combos)('a %s company with users in %j stays within 0 to 100, and an urgent finding still caps it at 74', (country, markets) => {
    const home = country === 'US-DE' ? 'US' : country;
    const users = [home, ...markets.filter((market) => ['US', 'GB', 'NG'].includes(market))];
    const answers = { ...answersFor(country), user_countries: [...new Set(users)] };
    const clean = world({ country, answers, allDocuments: true });
    expect(clean.score.overall).toBeGreaterThanOrEqual(0);
    expect(clean.score.overall).toBeLessThanOrEqual(100);
    const urgent = world({ country, answers, registry: URGENT[country] });
    expect(urgent.score.open_critical).toBeGreaterThan(0);
    expect(urgent.score.overall).toBeLessThanOrEqual(SCORING.overall_critical_cap);
    expect(urgent.score.status).not.toBe('Healthy');
  });
});

describe('the score itself', () => {
  it('never goes above 100 or below 0, and is a whole number, for any mix of outcomes', () => {
    const outcomes: Outcome[] = ['pass', 'gap', 'defect', 'verify', 'not_applicable'];
    const severities: Severity[] = ['critical', 'high', 'medium', 'low'];
    let seed = 7;
    const next = () => {
      seed = (seed * 48271) % 2147483647;
      return seed;
    };
    for (let round = 0; round < 400; round += 1) {
      const findings: ScorableFinding[] = Array.from({ length: 1 + (next() % 40) }, (_, index) => {
        const outcome = outcomes[next() % outcomes.length] as Outcome;
        return { rule_id: `R${index}`, layer: 1 + (next() % 6), outcome, severity: severities[next() % severities.length] as Severity, scored: SCORED.has(outcome) };
      });
      const score = scoreFindings(findings);
      if (score.overall === null) continue;
      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(Number.isInteger(score.overall)).toBe(true);
      if (score.open_critical > 0) expect(score.overall).toBeLessThanOrEqual(74);
      expect(roundScore(score.overall)).toBe(score.overall);
    }
  });

  it.each(COUNTRIES)('is the same every time for the same facts (%s)', (country) => {
    const first = world({ country, allDocuments: true, registry: { ch: { ...CLEAN.ch, confirmation_overdue: true } } });
    const second = world({ country, allDocuments: true, registry: { ch: { ...CLEAN.ch, confirmation_overdue: true } } });
    expect(second.findings).toEqual(first.findings);
    expect(second.score).toEqual(first.score);
    expect(second.deadlines).toEqual(first.deadlines);
  });
});

describe('deadlines', () => {
  it('a date in the past is overdue, a near one is due soon, and the words say how we track it', () => {
    const w = world({ country: 'GB', registry: { ch: { ...CLEAN.ch, confirmation_next_due: '2026-11-01', accounts_next_due: '2026-12-01' } } });
    const confirmation = w.deadlines.dated.find((item) => item.rule_id === 'GB.CORP.CONFIRMATION_STATEMENT');
    expect(confirmation?.status).toBe('overdue');
    expect(confirmation?.how_we_track).toBe('We check this with Companies House');
    const accounts = w.deadlines.dated.find((item) => item.rule_id === 'GB.CORP.ACCOUNTS');
    expect(accounts?.status).toBe('due_soon');
  });

  it('with no date from the source, nothing is invented: it waits, in plain words', () => {
    const w = world({ country: 'GB', registry: { ch: { ...CLEAN.ch, confirmation_next_due: null } } });
    expect(w.deadlines.dated.find((item) => item.rule_id === 'GB.CORP.CONFIRMATION_STATEMENT')).toBeUndefined();
    const waiting = w.deadlines.undated.find((item) => item.rule_id === 'GB.CORP.CONFIRMATION_STATEMENT');
    expect(waiting?.waiting_on).toBe('a date from the source');
  });

  it('a deadline resting on a rule still waiting on a lawyer says so', () => {
    for (const country of COUNTRIES) {
      const w = world({ country, allDocuments: true });
      for (const item of w.deadlines.dated) {
        const finding = w.findings.find((f) => f.rule_id === item.rule_id);
        if (finding) expect(item.needs_review).toBe(finding.confidence === 'needs_review');
      }
    }
  });
});

describe('words people read', () => {
  const rules = COUNTRIES.flatMap((country) => packsFor(country).flatMap((pack) => pack.rules));

  it('no rule text draws a legal conclusion or says a company is sanctioned', () => {
    for (const rule of rules) {
      const words = [rule.title, ...Object.values(rule.text)].join(' ');
      expect(words, rule.id).not.toMatch(/\b(is|are) (non-)?compliant\b|\billegal\b|\bunlawful\b|\bguilty\b|\b(is|are|was) sanctioned\b|\bfraud(ulent)?\b/i);
    }
  });

  it('"does not exist" is only ever said to deny it', () => {
    for (const rule of rules) {
      const words = Object.values(rule.text).join(' ');
      for (const match of words.matchAll(/doesn't exist|does not exist/gi)) {
        expect(words.slice(Math.max(0, (match.index ?? 0) - 40), match.index), rule.id).toMatch(/doesn't mean|does not mean/);
      }
    }
  });

  it('"how we know" never shows a tier number, and only official sources say "Checked with"', () => {
    const when = new Date(AS_OF);
    const p = (method: EvidenceMethod) => howWeKnow({ source: 's', source_name: 'Companies House', method, retrieved_at: AS_OF }, when);
    expect(p('official_live')).toBe('Checked with Companies House today');
    expect(p('licensed_vendor')).toBe('From our licensed data provider');
    expect(p('official_list')).toBe('Found on the Companies House list');
    expect(p('document')).toBe('You uploaded this and we read it');
    expect(p('attested')).toBe('You told us');
    expect(p('lawyer')).toBe('You uploaded this and it was reviewed');
    for (const method of ['document', 'attested', 'computed'] as const) expect(p(method)).not.toMatch(/Checked with|Tier/);
  });
});

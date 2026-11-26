import { defineConnector, type Http, type HttpResponse } from '../runtime.js';
import { asArray, asRecord, asString, nameSimilarity, normaliseName, personLabel } from '../text.js';
import type { CompanyRef, Connector, ConnectorDeps, Fact, FactValue, LookupOutcome } from '../types.js';

/**
 * uk.companies_house: the free Companies House public data API.
 *
 * Checked against the official developer specs on 5 Nov 2026
 * (developer-specs.company-information.service.gov.uk): companyProfile, officerSummary,
 * psc list and chargeList field names, and 600 requests per 5 minutes. A keyless
 * call returns 401, so the route exists. Couldn't confirm without a key: real
 * response bodies. test/samples/ are built from the specs, not recorded.
 *
 * Identity checks. The matrix treats a missing `identity_verified_on` after the
 * deadline as a gap. Companies House's own forum says that date only appears when
 * an authorised agent (ACSP) did the check: someone who verified directly through
 * GOV.UK can have `appointment_verification_start_on` or a statement date instead,
 * and some verified people show nothing for a while. So we count anyone with any
 * of those fields as on record. Nothing on record is "not on record", not "failed",
 * and the rule only calls it a gap once the due date has passed. Natural-person
 * directors only: secretaries and corporate directors don't verify this way.
 */

const BASE = 'https://api.company-information.service.gov.uk';
const P = 'registry.uk.companies_house';

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

function bool(value: unknown): boolean {
  return value === true;
}

interface IdvSummary { onRecord: number; outstanding: number; nextDue: string | null }

export function summariseIdv(people: Record<string, unknown>[]): IdvSummary {
  let onRecord = 0;
  let outstanding = 0;
  let nextDue: string | null = null;
  for (const person of people) {
    const details = asRecord(person['identity_verification_details']);
    const verified = ['identity_verified_on', 'appointment_verification_start_on', 'appointment_verification_statement_date']
      .some((key) => asString(details[key]) !== undefined);
    if (verified) {
      onRecord += 1;
    } else {
      outstanding += 1;
      const due = asString(details['appointment_verification_statement_due_on']);
      if (due && (nextDue === null || due < nextDue)) nextDue = due;
    }
  }
  return { onRecord, outstanding, nextDue };
}

export function parseProfile(raw: unknown): Fact[] {
  const profile = asRecord(raw);
  const confirmation = asRecord(profile['confirmation_statement']);
  const accounts = asRecord(profile['accounts']);
  const next = asRecord(accounts['next_accounts']);
  const last = asRecord(accounts['last_accounts']);
  const facts: Fact[] = [
    fact('found', true),
    fact('company_number', asString(profile['company_number']) ?? ''),
    fact('company_name', asString(profile['company_name']) ?? ''),
    fact('type', asString(profile['type']) ?? 'unknown'),
    fact('registered_office_present', Object.keys(asRecord(profile['registered_office_address'])).length > 0),
    fact('registered_office_in_dispute', bool(profile['registered_office_is_in_dispute'])),
    fact('undeliverable_registered_office', bool(profile['undeliverable_registered_office_address'])),
    fact('sic_codes', asArray(profile['sic_codes']).map(String)),
  ];
  const optional: [string, string | undefined][] = [
    // No status in the record is not a status: left out, the status check waits rather than
    // reading "unknown" as "not active", which is urgent.
    ['status', asString(profile['company_status'])],
    ['status_detail', asString(profile['company_status_detail'])],
    ['incorporated_on', asString(profile['date_of_creation'])],
    ['confirmation_next_due', asString(confirmation['next_due'])],
    ['confirmation_last_made_up_to', asString(confirmation['last_made_up_to'])],
    ['accounts_next_due', asString(next['due_on'])],
    ['accounts_last_type', asString(last['type'])],
    // The company's registered office is public. Only the postcode is kept: the ICO
    // register needs it to tell two companies with the same name apart.
    ['registered_office_postcode', asString(asRecord(profile['registered_office_address'])['postal_code'])],
  ];
  for (const [key, value] of optional) if (value !== undefined) facts.push(fact(key, value));
  // Only say "not overdue" when the source actually told us.
  if (typeof confirmation['overdue'] === 'boolean') facts.push(fact('confirmation_overdue', confirmation['overdue']));
  if (typeof next['overdue'] === 'boolean') facts.push(fact('accounts_overdue', next['overdue']));
  return facts;
}

export function parseOfficers(raw: unknown): Fact[] {
  const items = asArray(asRecord(raw)['items']).map(asRecord);
  const active = items.filter((item) => asString(item['resigned_on']) === undefined);
  const isDirector = (item: Record<string, unknown>) => {
    const role = asString(item['officer_role']) ?? '';
    return role.includes('director') && !role.startsWith('corporate');
  };
  const directors = active.filter((item) => (asString(item['officer_role']) ?? '').includes('director'));
  const idv = summariseIdv(active.filter(isDirector));
  const facts = [
    // Names and roles only. Service addresses and dates of birth are dropped here.
    fact('officers', active.map((item) => personLabel(asString(item['name']), asString(item['officer_role']))).filter((v): v is string => v !== null)),
    fact('directors_active_count', directors.length),
    fact('directors_idv_on_record_count', idv.onRecord),
    fact('directors_idv_outstanding_count', idv.outstanding),
  ];
  if (idv.nextDue) facts.push(fact('directors_idv_next_due', idv.nextDue));
  return facts;
}

export function parsePscs(raw: unknown): Fact[] {
  const items = asArray(asRecord(raw)['items']).map(asRecord);
  const active = items.filter((item) => item['ceased'] !== true && asString(item['ceased_on']) === undefined);
  const people = active.filter((item) => (asString(item['kind']) ?? '').startsWith('individual'));
  const idv = summariseIdv(people);
  const facts = [
    fact('psc_active_count', active.length),
    fact('pscs', active.map((item) => asString(item['name'])).filter((v): v is string => v !== undefined)),
    fact('psc_idv_outstanding_count', idv.outstanding),
    fact('psc_sanctioned', active.some((item) => item['is_sanctioned'] === true)),
  ];
  if (idv.nextDue) facts.push(fact('psc_idv_next_due', idv.nextDue));
  return facts;
}

export function parseCharges(raw: unknown): Fact[] {
  const items = asArray(asRecord(raw)['items']).map(asRecord);
  return [
    fact('charges_total_count', items.length),
    fact('charges_outstanding_count', items.filter((item) => {
      const status = asString(item['status']);
      return status === 'outstanding' || status === 'part-satisfied';
    }).length),
  ];
}

export function parseInsolvency(raw: unknown): Fact[] {
  return [fact('insolvency_case_count', asArray(asRecord(raw)['cases']).length)];
}

async function optionalFacts(http: Http, url: string, headers: Record<string, string>, parse: (raw: unknown) => Fact[], whenMissing: Fact[]): Promise<{ facts: Fact[]; raw: string; failed: boolean }> {
  try {
    const response: HttpResponse = await http(url, { headers });
    if (response.status === 404) return { facts: whenMissing, raw: '', failed: false };
    return { facts: parse(response.json()), raw: response.text, failed: false };
  } catch {
    // One sub-resource being down leaves those facts unknown. It doesn't sink the rest.
    return { facts: [], raw: '', failed: true };
  }
}

async function findCompanyNumber(ref: CompanyRef, http: Http, headers: Record<string, string>): Promise<{ number: string; confidence: number } | LookupOutcome> {
  if (ref.company_number) return { number: ref.company_number.toUpperCase().padStart(8, '0'), confidence: 1 };
  const url = `${BASE}/search/companies?q=${encodeURIComponent(ref.name)}&items_per_page=20`;
  const response = await http(url, { headers });
  const items = asArray(asRecord(response.json())['items']).map(asRecord);
  const scored = items.map((item) => ({
    number: asString(item['company_number']) ?? '',
    name: asString(item['title']) ?? '',
    status: asString(item['company_status']) ?? undefined,
    similarity: nameSimilarity(ref.name, asString(item['title']) ?? ''),
  })).filter((c) => c.number !== '');

  const exact = scored.filter((c) => normaliseName(c.name) === normaliseName(ref.name));
  if (exact.length === 1) return { number: (exact[0] as { number: string }).number, confidence: 0.95 };
  const close = exact.length > 1 ? exact : scored.filter((c) => c.similarity >= 0.55).slice(0, 5);
  if (close.length > 0) {
    return {
      status: 'ambiguous', sourceUrl: url, raw: response.text,
      matchConfidence: Math.max(...close.map((c) => c.similarity)),
      message: 'A few companies at Companies House could be yours. Pick the right one.',
      candidates: close.map((c) => ({ name: c.name, identifier: c.number, ...(c.status ? { status: c.status } : {}) })),
    };
  }
  return {
    status: 'not_found', sourceUrl: url, raw: response.text,
    facts: [fact('found', false)],
    message: "We didn't find this name at Companies House. If you have a company number, add it and we'll check again.",
  };
}

export function createCompaniesHouseConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'uk.companies_house',
    jurisdictions: ['GB'],
    capabilities: ['entity_lookup', 'officers', 'filings'],
    factPrefix: P,
    sourceName: 'Companies House',
    method: 'official_live',
    homeUrl: BASE,
    requiredEnv: ['COMPANIES_HOUSE_API_KEY'],
    rateLimit: { requests: 600, perMs: 5 * 60_000 },
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      const key = env['COMPANIES_HOUSE_API_KEY'] as string;
      // HTTP Basic, with the key as the username and an empty password.
      const headers = { Authorization: `Basic ${Buffer.from(`${key}:`).toString('base64')}`, Accept: 'application/json' };

      const found = await findCompanyNumber(ref, http, headers);
      if ('status' in found) return found;
      const number = found.number;
      const base = `${BASE}/company/${encodeURIComponent(number)}`;

      const profileResponse = await http(base, { headers });
      if (profileResponse.status === 404) {
        return { status: 'not_found', sourceUrl: base, raw: profileResponse.text, facts: [fact('found', false)], message: "We didn't find that company number at Companies House." };
      }
      const profile = profileResponse.json();
      const facts = parseProfile(profile);
      const links = asRecord(asRecord(profile)['links']);

      const parts = await Promise.all([
        optionalFacts(http, `${base}/officers?items_per_page=100`, headers, parseOfficers, []),
        // Companies House answers 404 when no PSC is on the register.
        optionalFacts(http, `${base}/persons-with-significant-control?items_per_page=100`, headers, parsePscs, [fact('psc_active_count', 0), fact('pscs', []), fact('psc_idv_outstanding_count', 0), fact('psc_sanctioned', false)]),
        // These two links only exist when there is something to read.
        links['charges'] ? optionalFacts(http, `${base}/charges?items_per_page=100`, headers, parseCharges, [fact('charges_total_count', 0), fact('charges_outstanding_count', 0)])
          : Promise.resolve({ facts: [fact('charges_total_count', 0), fact('charges_outstanding_count', 0)], raw: '', failed: false }),
        links['insolvency'] ? optionalFacts(http, `${base}/insolvency`, headers, parseInsolvency, [fact('insolvency_case_count', 0)])
          : Promise.resolve({ facts: [fact('insolvency_case_count', 0)], raw: '', failed: false }),
        optionalFacts(http, `${base}/filing-history?category=incorporation&items_per_page=1`, headers, (raw) => [fact('incorporation_filing_on_record', Number(asRecord(raw)['total_count'] ?? 0) > 0)], [fact('incorporation_filing_on_record', false)]),
        optionalFacts(http, `${base}/filing-history?category=capital&items_per_page=100`, headers, parseCapitalFilings, [fact('capital_filing_on_record', false)]),
      ]);
      for (const part of parts) facts.push(...part.facts);

      // A company's first statement of capital is inside its incorporation filing,
      // and later ones in the confirmation statement, as the UK map's section 1 row says.
      const has = (key: string) => facts.some((f) => f.key === `${P}.${key}` && f.value !== false && f.value !== '');
      const capitalIndex = facts.findIndex((f) => f.key === `${P}.capital_filing_on_record`);
      if (capitalIndex !== -1 && (has('incorporation_filing_on_record') || has('confirmation_last_made_up_to'))) {
        facts[capitalIndex] = fact('capital_filing_on_record', true);
      }

      const failed = parts.some((part) => part.failed);
      const outcome: LookupOutcome = {
        status: 'found',
        sourceUrl: base,
        raw: [profileResponse.text, ...parts.map((part) => part.raw)].join('\n'),
        facts,
        matchConfidence: found.confidence,
      };
      if (failed) outcome.message = "We read the main record, but Companies House didn't answer for every section. We'll try again.";
      return outcome;
    },
  }, deps);
}

export function parseCapitalFilings(raw: unknown): Fact[] {
  const record = asRecord(raw);
  const items = asArray(record['items']).map(asRecord);
  const allotments = items.filter((item) => asString(item['type']) === 'SH01').map((item) => asString(item['date'])).filter((d): d is string => d !== undefined).sort();
  const total = Number(record['total_count'] ?? items.length);
  const facts = [fact('capital_filing_on_record', total > 0)];
  const latest = allotments[allotments.length - 1];
  if (latest) facts.push(fact('last_allotment_on', latest));
  // A fundraising signal, like SEC Form D: SH01 is the return of an allotment of shares, filed
  // within a month of issuing them. Counts and dates only, never the amounts or who got them.
  // Only when every capital filing was read (one page of 100): otherwise the count would be short.
  if (total <= items.length) {
    facts.push(fact('allotment_filings_count', allotments.length));
    const first = allotments[0];
    if (first) facts.push(fact('first_allotment_on', first));
  }
  return facts;
}

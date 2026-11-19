import { defineConnector } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact } from '../types.js';
import { chooseByName, factIn, isValidNorwegianOrgNumber, normaliseNorwegianOrgNumber, publicUserAgent, pushDefined, registerWords, uniqueSorted } from './national-common.js';

/**
 * no.brreg: the Central Coordinating Register for Legal Entities (Enhetsregisteret), run by
 * Brønnøysundregistrene. Free, no key, official. Licence: NLOD 2.0 (Norwegian Licence for Open
 * Government Data).
 *
 * Checked against the official OpenAPI description embedded in the documentation
 * (data.brreg.no/enhetsregisteret/api/dokumentasjon/en/index.html) on 16 Nov 2026:
 * GET /enhetsregisteret/api/enheter/{orgnr} gives an `Enhet` (200), a `SlettetEnhet` with
 * `slettedato` for a deleted unit (200, `respons_klasse`), 404 when unknown, and 410 `GoneEnhet`
 * when removed for legal reasons. GET /enheter?navn=... searches by name (`_embedded.enheter`,
 * `page.totalElements`; page+size may not pass 10,000). GET /enheter/{orgnr}/roller gives
 * `rollegrupper[].roller[]` with `type.beskrivelse` and either `person` (name, birth date) or
 * `enhet` (an organisation). No rate limit is published: we stay at 5 requests a second.
 *
 * Checked against a real reply on 16 Nov 2026 (Equinor ASA, 923609016, one unit and one roles
 * call): field names as documented; `antallAnsatte` is an exact count, so we keep a band;
 * `kapital.belop` is a number; roles carry each person's name and birth date, which never leave
 * this file.
 *
 * What it can't say. A miss means "not in this register under that number or name", never "this
 * company doesn't exist", and its `identified` fact is null (unknown).
 *
 * Personal data. Role holders are reduced to counts and role titles here. A sole proprietorship
 * (organisation form ENK) is one person's business: its record is never kept and it is never
 * offered as a candidate. The unit's phone and email are not read.
 */

const BASE = 'https://data.brreg.no/enhetsregisteret/api';
const P = 'registry.no.brreg';
const fact = factIn(P);
/** Not published. Five a second is well under anything the register could mind. */
const RATE = { requests: 5, perMs: 1000 };
const SOLE_PROPRIETORSHIP = 'ENK';

export const NO_WORDS = registerWords({
  register: 'the Norwegian register of legal entities (Brønnøysundregistrene)',
  numberLabel: 'organisation number',
  numberFormat: '9 digits that pass the organisation-number check',
});

function formCode(unit: Record<string, unknown>): string | undefined {
  return asString(asRecord(unit['organisasjonsform'])['kode']);
}

/** A record kept as a company only when it positively looks like one: a name, a form, and not ENK. */
export function isNorwegianPersonRecord(unit: Record<string, unknown>): boolean {
  const code = formCode(unit);
  return code === undefined || code === SOLE_PROPRIETORSHIP || asString(unit['navn']) === undefined;
}

function employeesBand(unit: Record<string, unknown>): string | undefined {
  const count = unit['antallAnsatte'];
  if (unit['harRegistrertAntallAnsatte'] === false) return '0';
  if (typeof count !== 'number') return undefined;
  if (count === 0) return '0';
  if (count < 5) return '1-4';
  if (count < 10) return '5-9';
  if (count < 50) return '10-49';
  if (count < 250) return '50-249';
  return '250+';
}

function statusOf(unit: Record<string, unknown>): string {
  if (unit['respons_klasse'] === 'SlettetEnhet' || asString(unit['slettedato'])) return 'deleted';
  if (unit['konkurs'] === true) return 'bankrupt';
  if (unit['underTvangsavviklingEllerTvangsopplosning'] === true) return 'under_compulsory_dissolution';
  if (unit['underAvvikling'] === true) return 'under_liquidation';
  return 'active';
}

const bool = (value: unknown) => (typeof value === 'boolean' ? value : undefined);

/** The facts for one unit, and its roles reduced to counts and titles. */
export function parseNorwegianUnit(raw: unknown, rolesRaw?: unknown): Fact[] {
  const unit = asRecord(raw);
  const address = asRecord(unit['forretningsadresse']);
  const capital = asRecord(unit['kapital']);
  const facts: Fact[] = [
    fact('identified', true),
    fact('org_number', asString(unit['organisasjonsnummer']) ?? ''),
    fact('status', statusOf(unit)),
  ];
  pushDefined(facts, P, [
    ['registered_name', asString(unit['navn'])],
    ['organisation_form_code', formCode(unit)],
    ['bankrupt', bool(unit['konkurs'])],
    ['under_liquidation', bool(unit['underAvvikling'])],
    ['under_compulsory_dissolution', bool(unit['underTvangsavviklingEllerTvangsopplosning'])],
    ['deleted_on', asString(unit['slettedato'])],
    ['in_business_register', bool(unit['registrertIForetaksregisteret'])],
    ['in_vat_register', bool(unit['registrertIMvaregisteret'])],
    ['founded_on', asString(unit['stiftelsesdato'])],
    ['registered_on', asString(unit['registreringsdatoEnhetsregisteret'])],
    ['nace_code', asString(asRecord(unit['naeringskode1'])['kode'])],
    ['employees_band', employeesBand(unit)],
    // The registered business address's municipality: public, and never a person's (ENK is not kept).
    ['municipality', asString(address['kommune'])],
    ['municipality_number', asString(address['kommunenummer'])],
    ['share_capital', typeof capital['belop'] === 'number' ? capital['belop'] : undefined],
    ['share_capital_currency', asString(capital['valuta'])],
    ['part_of_group', bool(unit['erIKonsern'])],
    ['last_accounts_year', asString(unit['sisteInnsendteAarsregnskap'])],
  ]);
  if (rolesRaw !== undefined) {
    // Each role holder is a person (name, birth date) or an organisation. Only counts and titles stay.
    const roles = asArray(asRecord(rolesRaw)['rollegrupper']).flatMap((group) => asArray(asRecord(group)['roller']).map(asRecord))
      .filter((role) => role['avregistrert'] !== true);
    facts.push(
      fact('roles_count', roles.length),
      fact('roles_entity_count', roles.filter((role) => role['enhet'] !== undefined && role['person'] === undefined).length),
      fact('role_titles', uniqueSorted(roles.map((role) => asString(asRecord(role['type'])['beskrivelse'])))),
    );
  }
  return facts;
}

function unitsOf(raw: unknown): Record<string, unknown>[] {
  return asArray(asRecord(asRecord(raw)['_embedded'])['enheter']).map(asRecord);
}

export function createBrregConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'no.brreg',
    jurisdictions: ['NO'],
    capabilities: ['entity_lookup', 'officers'],
    factPrefix: P,
    sourceName: 'Brønnøysundregistrene',
    method: 'official_live',
    homeUrl: 'https://data.brreg.no/enhetsregisteret/oppslag',
    // No key, but it stays off until we name ourselves.
    requiredEnv: ['PUBLIC_API_USER_AGENT'],
    rateLimit: RATE,
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      const headers = { Accept: 'application/json', 'User-Agent': publicUserAgent(env) };
      const identified = `${P}.identified`;

      const withRoles = async (unit: Record<string, unknown>, url: string, text: string, confidence: number) => {
        const number = asString(unit['organisasjonsnummer']) as string;
        // A deleted unit has no current roles to read.
        // If the roles can't be read, the unit's own facts still stand and no role fact is given:
        // "no roles" would be a claim we can't make.
        let rolesText = '';
        let rolesBody: unknown;
        if (statusOf(unit) !== 'deleted') {
          try {
            const roles = await http(`${BASE}/enheter/${number}/roller`, { headers });
            if (roles.status === 200) {
              rolesText = roles.text;
              rolesBody = roles.json();
            }
          } catch {
            rolesBody = undefined;
          }
        }
        return { status: 'found' as const, sourceUrl: url, raw: text + rolesText, facts: parseNorwegianUnit(unit, rolesBody), matchConfidence: confidence };
      };

      if (ref.registry_number !== undefined) {
        const number = normaliseNorwegianOrgNumber(ref.registry_number);
        if (!number || !isValidNorwegianOrgNumber(number)) return { status: 'unsupported', sourceUrl: BASE, message: NO_WORDS.invalidNumber };
        const url = `${BASE}/enheter/${number}`;
        const response = await http(url, { headers, allow: [410] });
        if (response.status === 404 || response.status === 410) {
          return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [{ key: identified, value: null }], message: NO_WORDS.notFoundByNumber };
        }
        const unit = asRecord(response.json());
        if (isNorwegianPersonRecord(unit)) return { status: 'unsupported', sourceUrl: url, raw: response.text, message: NO_WORDS.person };
        return withRoles(unit, url, response.text, 1);
      }

      const url = `${BASE}/enheter?navn=${encodeURIComponent(ref.name)}&size=20`;
      const response = await http(url, { headers });
      const body = response.status === 404 ? {} : response.json();
      // Sole proprietorships are people: never offered as candidates.
      const units = unitsOf(body).filter((unit) => !isNorwegianPersonRecord(unit));
      const total = asRecord(asRecord(body)['page'])['totalElements'];
      const chosen = chooseByName({
        ref, items: units, nameOf: (unit) => asString(unit['navn']), numberOf: (unit) => asString(unit['organisasjonsnummer']),
        truncated: typeof total === 'number' && total > unitsOf(body).length, words: NO_WORDS, identifiedKey: identified, sourceUrl: url, raw: response.text,
      });
      if ('match' in chosen) return withRoles(chosen.match, url, response.text, 0.95);
      return chosen;
    },
  }, deps);
}

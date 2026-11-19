import { defineConnector } from '../runtime.js';
import { asArray, asRecord, asString, nameSimilarity } from '../text.js';
import type { Candidate, Connector, ConnectorDeps, Fact, FactValue, LookupOutcome } from '../types.js';
import { isValidSiren, normaliseFrenchName, normaliseSiren } from './fr-common.js';

/**
 * fr.recherche_entreprises: the API Recherche d'entreprises behind the Annuaire des
 * Entreprises (data.gouv / DINUM). Free, no key, official.
 *
 * Checked against the official OpenAPI description (recherche-entreprises.api.gouv.fr,
 * openapi.json) on 14 Nov 2026: GET /search, `q` (a 9-digit SIREN or 14-digit SIRET is a
 * direct lookup and other filters are ignored), `per_page` at most 25, `page`; response keys
 * `results`, `total_results`, `page`, `per_page`, `total_pages`; result fields `siren`,
 * `nom_complet`, `nom_raison_sociale`, `etat_administratif`, `date_creation`, `date_fermeture`,
 * `nature_juridique`, `activite_principale`, `categorie_entreprise`, `tranche_effectif_salarie`,
 * `statut_diffusion` ("O" full, "P" partial), `nombre_etablissements(_ouverts)`, `siege`
 * (`code_postal`, `libelle_commune`, ...), `dirigeants` (`type_dirigeant` "personne physique" or
 * "personne morale", `qualite`), `complements` (`est_entrepreneur_individuel`, ...). At most 7
 * requests a second per IP (30 per ASN): 429 with Retry-After. A descriptive User-Agent is
 * asked for. NOT checked against a real response: no call was made from this code.
 *
 * What it can't say. Companies that are not publicly listed ("non-diffusibles") and those whose
 * RCS registration was refused are not in this API. So a miss means "not in the public French
 * directory", never "this company doesn't exist", and it gives no fact that a rule could read as
 * a failure: `identified` is null (unknown), so any rule reading it would be "to check".
 *
 * VAT number. The directory's `tva` list holds the intra-EU VAT number it calculates from the SIREN
 * (real reply of 15 Nov 2026: Danone, SIREN 552032534, "FR27552032534"). The Annuaire's own
 * definition page says the number is only attributed to companies subject to VAT, and the directory
 * lists a calculated one for any company, so it is kept as `vat_number_listed` ("the directory lists
 * this number"), never as "VAT registered". Only VIES can say that: see eu.vies_vat.
 *
 * Personal data (GDPR data minimisation). Directors' names, birth dates and nationalities are
 * dropped here and never stored: only how many directors there are, how many are companies, and
 * the role titles. A sole trader's registered name is a person's name, so it isn't kept either.
 */

const BASE = 'https://recherche-entreprises.api.gouv.fr';
const P = 'registry.fr.recherche_entreprises';
/** The published limit is 7 a second per IP. We stay just under it. */
const RATE = { requests: 6, perMs: 1000 };
const PER_PAGE = 10;
/** INSEE legal category 1000: entrepreneur individuel, a natural person. */
const SOLE_TRADER = '1000';

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

/**
 * A sole trader's registered name is a person's name, and so can be their address. The
 * directory marks them as legal category 1000 or "entrepreneur individuel", but the first real
 * reply (15 Nov 2026) showed a partly published record with NO legal category and NO company
 * name, only "nom_complet" holding a person's name. So a record is kept as a company only when it
 * positively looks like one: it has a company name ("nom_raison_sociale") and is not category 1000.
 */
function isSoleTrader(result: Record<string, unknown>): boolean {
  if (asString(result['nature_juridique']) === SOLE_TRADER) return true;
  if (asRecord(result['complements'])['est_entrepreneur_individuel'] === true) return true;
  return asString(result['nom_raison_sociale']) === undefined;
}

function statusOf(value: string | undefined): string {
  if (value === 'A') return 'active';
  if (value === 'C') return 'ceased';
  return 'unknown';
}

/** The facts for one company. Directors are reduced to counts and role titles right here. */
export function parseFrenchCompany(raw: unknown): Fact[] {
  const result = asRecord(raw);
  const siege = asRecord(result['siege']);
  const directors = asArray(result['dirigeants']).map(asRecord);
  const isEntity = (item: Record<string, unknown>) => (asString(item['type_dirigeant']) ?? '').toLowerCase().includes('morale');
  const roles = [...new Set(directors.map((item) => asString(item['qualite'])).filter((v): v is string => v !== undefined))].sort();

  const facts: Fact[] = [
    fact('identified', true),
    fact('siren', asString(result['siren']) ?? ''),
    fact('status', statusOf(asString(result['etat_administratif']))),
    fact('directors_count', directors.length),
    fact('directors_entity_count', directors.filter(isEntity).length),
    fact('directors_role_titles', roles),
  ];
  // A sole trader's name is a person's name: not kept.
  const person = isSoleTrader(result);
  const name = person ? undefined : asString(result['nom_raison_sociale']);
  const optional: [string, string | undefined][] = [
    ['registered_name', name],
    ['created_on', asString(result['date_creation'])],
    ['ceased_on', asString(result['date_fermeture'])],
    ['legal_form_code', asString(result['nature_juridique'])],
    ['naf_code', asString(result['activite_principale'])],
    ['company_category', asString(result['categorie_entreprise'])],
    ['size_band', asString(result['tranche_effectif_salarie'])],
    // The registered office of a company is public. A sole trader's can be their home: not kept.
    // The directory lists the VAT number it works out from the SIREN. A company's number, never a person's.
    ['vat_number_listed', person ? undefined : asArray(result['tva']).map(asString).find((v): v is string => v !== undefined && /^FR[0-9A-Z]{2}[0-9]{9}$/.test(v))],
    ['hq_postcode', person ? undefined : asString(siege['code_postal'])],
    ['hq_commune', person ? undefined : asString(siege['libelle_commune'])],
  ];
  for (const [key, value] of optional) if (value !== undefined) facts.push(fact(key, value));
  for (const [key, field] of [['establishments_count', 'nombre_etablissements'], ['establishments_open_count', 'nombre_etablissements_ouverts']] as const) {
    if (typeof result[field] === 'number') facts.push(fact(key, result[field]));
  }
  const diffusion = asString(result['statut_diffusion']);
  if (diffusion) facts.push(fact('partially_published', diffusion === 'P'));
  return facts;
}

/** The words for a miss. Never "doesn't exist": some companies are left out of this directory. */
export const FR_NOT_IN_DIRECTORY = {
  name: "We didn't find this name in the public French business directory (Annuaire des Entreprises). That doesn't mean the company doesn't exist: companies that asked not to be listed publicly aren't shown there. Add the company's SIREN and we'll check again.",
  siren: "We didn't find this SIREN in the public French business directory (Annuaire des Entreprises). That doesn't mean the company doesn't exist: companies that asked not to be listed publicly aren't shown there, so a person needs to check this.",
} as const;

function results(raw: unknown): Record<string, unknown>[] {
  return asArray(asRecord(raw)['results']).map(asRecord);
}

function displayName(result: Record<string, unknown>): string {
  return asString(result['nom_raison_sociale']) ?? '';
}

export function createRechercheEntreprisesConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'fr.recherche_entreprises',
    jurisdictions: ['FR'],
    capabilities: ['entity_lookup', 'officers'],
    factPrefix: P,
    sourceName: 'Annuaire des Entreprises',
    method: 'official_live',
    homeUrl: BASE,
    // No key, but like the SEC and the website scan it stays off until we name ourselves.
    requiredEnv: ['FR_RECHERCHE_ENTREPRISES_USER_AGENT'],
    rateLimit: RATE,
    ttlSeconds: 6 * 3600,
    async lookup(ref, { http, env }) {
      const headers = { Accept: 'application/json', 'User-Agent': (env['FR_RECHERCHE_ENTREPRISES_USER_AGENT'] as string).trim() };

      if (ref.siren !== undefined) {
        const siren = normaliseSiren(ref.siren);
        if (!siren || !isValidSiren(siren)) {
          return { status: 'unsupported', sourceUrl: BASE, message: "That SIREN doesn't look right: it should be 9 digits and pass the SIREN check. Correct it in your answers and we'll check again." };
        }
        const url = `${BASE}/search?q=${siren}`;
        const response = await http(url, { headers });
        const match = response.status === 404 ? undefined : results(response.json()).find((item) => asString(item['siren']) === siren);
        if (!match) return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: FR_NOT_IN_DIRECTORY.siren };
        return { status: 'found', sourceUrl: url, raw: response.text, facts: parseFrenchCompany(match), matchConfidence: 1 };
      }

      // The light request: the full one took 25 s on 15 Nov 2026, this one 2 s.
      const url = `${BASE}/search?q=${encodeURIComponent(ref.name)}&per_page=${PER_PAGE}&page=1&minimal=true&include=siege`;
      const response = await http(url, { headers });
      // Sole traders are people: never offered as candidates.
      const companies = (response.status === 404 ? [] : results(response.json())).filter((item) => !isSoleTrader(item) && asString(item['siren']));
      const wanted = normaliseFrenchName(ref.name);
      const exact = companies.filter((item) => [asString(item['nom_raison_sociale']), asString(item['nom_complet'])].some((name) => name !== undefined && normaliseFrenchName(name) === wanted));
      const only = exact.length === 1 ? exact[0] : undefined;
      if (only) {
        // The light search leaves out the directors, so the full record is read by its SIREN.
        const sirenUrl = `${BASE}/search?q=${asString(only['siren'])}`;
        const full = await http(sirenUrl, { headers });
        const record = results(full.json()).find((item) => asString(item['siren']) === asString(only['siren']));
        if (record && !isSoleTrader(record)) return { status: 'found', sourceUrl: sirenUrl, raw: full.text, facts: parseFrenchCompany(record), matchConfidence: 0.95 };
      }

      const close = exact.length > 1 ? exact : companies.filter((item) => nameSimilarity(displayName(item), ref.name) >= 0.55).slice(0, 5);
      if (close.length > 0) {
        const candidates: Candidate[] = close.map((item) => ({ name: displayName(item), identifier: asString(item['siren']) as string }));
        const outcome: LookupOutcome = {
          status: 'ambiguous', sourceUrl: url, raw: response.text, candidates,
          matchConfidence: Math.max(...close.map((item) => nameSimilarity(displayName(item), ref.name))),
          message: 'A few companies in the French business directory could be yours. Add your SIREN so we check the right one.',
        };
        return outcome;
      }
      return { status: 'not_found', sourceUrl: url, raw: response.text, facts: [fact('identified', null)], message: FR_NOT_IN_DIRECTORY.name };
    },
  }, deps);
}

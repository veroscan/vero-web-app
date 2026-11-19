import { defineConnector, SourceError } from '../runtime.js';
import { asArray, asRecord, asString } from '../text.js';
import type { Connector, ConnectorDeps, Fact, FactValue } from '../types.js';
import { isValidLei, normaliseLei } from './global-gleif.js';

/**
 * eu.esma_prospectus: ESMA's register of prospectuses approved under the Prospectus Regulation
 * (Regulation (EU) 2017/1129), the EU's public signal that a company offered securities to the
 * public or listed them, the way SEC Form D is for US private raises. Keyless.
 *
 * Checked on 18 Nov 2026:
 * - ESMA documents machine access to its registers through Solr ("A2A" access, section 11 of
 *   https://registers.esma.europa.eu/publication/helpApp): the core
 *   `esma_registers_priii_documents`, `select?q=...&wt=json`.
 * - Real replies (two requests, Siemens AG by its LEI): issuers are child documents
 *   (`type_s: child`, `issuer_lei`, `issuer_name`); prospectuses are parent documents
 *   (`type_s: parent`, `approval_filing_date`, `document_type`, `home_member_state_code`,
 *   `prospectus_type_code`). A block-join query, `{!parent which="type_s:parent"}issuer_lei:<LEI>`,
 *   returns the prospectuses of one issuer.
 * - Reuse: the register's legal notice (https://registers.esma.europa.eu/publication/legalNoticePage)
 *   authorises reproduction with the source acknowledged. No published rate limit: we send at most 1
 *   request a second.
 *
 * What it can't say. Only offers big enough to need a prospectus are here, so a startup's seed or
 * Series A round never is: a miss means "no prospectus in the ESMA register for this LEI", never "has
 * not raised money". Only the LEI is searched (names match too loosely). Party names, which can be
 * people (offerors, guarantors), are never kept, and neither are document texts.
 */

const P = 'registry.eu.esma_prospectus';
const HOME = 'https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_priii_documents';
const SOLR = 'https://registers.esma.europa.eu/solr/esma_registers_priii_documents/select';
/** The newest this many are read; the total comes from numFound. */
const ROWS = 100;

export const ESMA_MISS = "We didn't find a prospectus for this LEI in ESMA's register. That's usual: a private round to a few investors needs no prospectus, so it isn't proof of anything.";

function fact(key: string, value: FactValue): Fact {
  return { key: `${P}.${key}`, value };
}

/** Facts from a block-join reply. Dates only, codes only: never names. */
export function parseEsmaProspectuses(raw: unknown): { total: number; facts: Fact[] } {
  const record = asRecord(raw);
  const header = asRecord(record['responseHeader']);
  const response = asRecord(record['response']);
  if (header['status'] !== 0 || typeof response['numFound'] !== 'number') throw new SourceError("ESMA's register sent something we couldn't read.");
  const total = response['numFound'];
  const docs = asArray(response['docs']).map(asRecord).filter((doc) => asString(doc['type_s']) === 'parent');
  const dates = docs.map((doc) => asString(doc['approval_filing_date'])?.slice(0, 10)).filter((date): date is string => date !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(date)).sort();
  const states = [...new Set(docs.map((doc) => asString(doc['home_member_state_code'])).filter((code): code is string => code !== undefined && /^[A-Z]{2}$/.test(code)))].sort();
  const types = [...new Set(docs.map((doc) => asString(doc['document_type'])).filter((code): code is string => code !== undefined && /^[A-Z]{2,6}$/.test(code)))].sort();
  const facts: Fact[] = [fact('documents_found', total)];
  const latest = dates[dates.length - 1];
  if (latest) facts.push(fact('latest_approval_on', latest));
  // The earliest date is only honest when every document was read.
  if (dates[0] && total <= docs.length) facts.push(fact('first_approval_on', dates[0]));
  if (states.length > 0) facts.push(fact('approval_countries', states));
  if (types.length > 0) facts.push(fact('document_types', types));
  return { total, facts };
}

export function createEsmaProspectusConnector(deps: ConnectorDeps): Connector {
  return defineConnector({
    id: 'eu.esma_prospectus',
    // Any issuer, wherever it is, can have an EU prospectus: asked for every company with an LEI.
    jurisdictions: ['*'],
    capabilities: ['fundraising'],
    factPrefix: P,
    sourceName: "ESMA's prospectus register",
    method: 'official_live',
    homeUrl: HOME,
    // No key. Like the other keyless sources it stays off until we name ourselves.
    requiredEnv: ['PUBLIC_API_USER_AGENT'],
    rateLimit: { requests: 1, perMs: 1000 },
    ttlSeconds: 24 * 3600,
    async lookup(ref, { http, env }) {
      const lei = ref.lei === undefined ? null : normaliseLei(ref.lei);
      if (!lei) return { status: 'unsupported', sourceUrl: HOME, message: "We need the company's LEI to check ESMA's prospectus register. Add it in your answers if the company has one." };
      if (!isValidLei(lei)) return { status: 'unsupported', sourceUrl: HOME, message: "That LEI doesn't look right: it should be 20 letters and digits and pass the LEI check. Correct it in your answers and we'll check again." };
      const query = new URLSearchParams({
        q: `{!parent which="type_s:parent"}issuer_lei:${lei}`,
        wt: 'json',
        rows: String(ROWS),
        sort: 'approval_filing_date desc',
        fl: 'type_s,approval_filing_date,document_type,home_member_state_code',
      });
      const url = `${SOLR}?${query.toString()}`;
      const response = await http(url, { headers: { Accept: 'application/json', 'User-Agent': (env['PUBLIC_API_USER_AGENT'] as string).trim() } });
      if (response.status !== 200) throw new SourceError(`ESMA's register answered with an error (${response.status}).`);
      const { total, facts } = parseEsmaProspectuses(response.json());
      if (total === 0) return { status: 'not_found', sourceUrl: HOME, raw: response.text, facts, message: ESMA_MISS };
      return { status: 'found', sourceUrl: HOME, raw: response.text, facts, matchConfidence: 1, message: `ESMA's register lists ${total} prospectus document${total === 1 ? '' : 's'} for this LEI.` };
    },
  }, deps);
}

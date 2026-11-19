import { listUpdatedWords, readStored, staleListWords } from '../reference-store.js';
import { defineConnector, SourceError } from '../runtime.js';
import { toIsoDate } from '../text.js';
import type { Connector, ConnectorDeps, Fact } from '../types.js';
import { isValidSiren, normaliseSiren } from './fr-common.js';

/**
 * fr.cnil_dpo: the CNIL's open dataset of organisations that designated a data protection
 * officer (data.gouv.fr, "Organismes ayant désigné un(e) délégué(e) à la protection des
 * données (DPD/DPO)", Licence Ouverte 2.0, CSV of about 32 MB, updated monthly).
 *
 * The stable download address is the data.gouv.fr resource link
 * https://www.data.gouv.fr/api/1/datasets/r/c5d02b42-1008-4406-83f5-3a81c8b936a3 (read from the
 * dataset page on 14 Nov 2026). It is set by FR_CNIL_DPO_URL, empty by default.
 *
 * NOT CONFIRMED: the CSV's column names, separator and encoding are not published on the
 * dataset page, and we were not allowed to download the file. So the reader finds its columns
 * by name (any header with "siren" that isn't about the DPO; a date header with "designation" or
 * "effet") and fails loudly when it can't tell. See docs/FRANCE.md.
 *
 * Personal data. The file holds DPOs' names, emails and phone numbers. None of it is kept: the
 * refresh job streams the file and keeps only the set of organisation SIRENs and, where given, a
 * designation date. That compact copy (a few MB at most) is what reference_data stores.
 *
 * What it can't say. Being on the list is a designation the CNIL received. Not being on it is
 * not proof there is no DPO: an organisation that didn't enter a SIREN when designating can't be
 * matched. So a miss is "not found on the list", never "no DPO".
 */

const P = 'registry.fr.cnil_dpo';
const HOME = 'https://www.data.gouv.fr/datasets/organismes-ayant-designe-un-e-delegue-e-a-la-protection-des-donnees-dpd-dpo/';
const LIST_NAME = 'CNIL list of organisations with a data protection officer';

export const CNIL_COMPACT_HEADER = '# vero.fr.cnil_dpo.v1';
/** A download bigger than this is refused (the file was about 32 MB in Nov 2026). */
export const CNIL_MAX_BYTES = 150_000_000;
/** And one with more rows than this. */
export const CNIL_MAX_ROWS = 3_000_000;

const FORMAT_ERROR = "The CNIL list isn't in the format we expect, so we can't read it.";

/** Lower case, no accents, anything else an underscore. A mis-decoded accent becomes one too. */
function headerKey(cell: string): string {
  return cell.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

/** Which columns hold the organisation's SIREN and the designation date. Throws when unsure. */
export function cnilColumns(header: readonly string[]): { siren: number; date: number | null } {
  const keys = header.map(headerKey);
  // A column about the DPO itself (an external DPO is often a firm with its own SIREN) is not ours.
  const aboutDpo = (key: string) => /dpo|dpd|deleg|d_l_gu|l_gu/.test(key);
  const sirens = keys.map((key, index) => ({ key, index })).filter(({ key }) => key.includes('siren') && !key.includes('siret') && !aboutDpo(key));
  const first = sirens[0];
  if (sirens.length !== 1 || !first) throw new SourceError(FORMAT_ERROR);
  const date = keys.findIndex((key) => key.includes('date') && /signation|effet/.test(key));
  return { siren: first.index, date: date === -1 ? null : date };
}

/**
 * A CSV reader fed in pieces, so a large file never sits in memory whole. RFC 4180 quoting
 * (quoted separators and newlines, doubled quotes). The separator is picked from the header line.
 */
export function createCsvRowReader(onRow: (row: string[]) => void): { push(chunk: string): void; end(): void } {
  let separator: string | null = null;
  let pending = '';
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let quoteNext = false;
  let started = false;

  const emitRow = () => {
    row.push(field);
    field = '';
    if (row.some((cell) => cell.trim() !== '')) onRow(row);
    row = [];
  };
  const feed = (text: string) => {
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i] as string;
      if (quoted) {
        if (quoteNext) {
          quoteNext = false;
          if (ch === '"') {
            field += '"';
            continue;
          }
          quoted = false;
        } else if (ch === '"') {
          quoteNext = true;
          continue;
        } else {
          field += ch;
          continue;
        }
      }
      if (ch === '"' && field.trim() === '') {
        field = '';
        quoted = true;
      } else if (ch === separator) {
        row.push(field);
        field = '';
      } else if (ch === '\n') {
        emitRow();
      } else if (ch !== '\r') {
        field += ch;
      }
    }
  };
  return {
    push(chunk) {
      if (separator === null) {
        pending += chunk;
        const newline = pending.indexOf('\n');
        if (newline === -1 && pending.length < 65_536) return;
        const first = newline === -1 ? pending : pending.slice(0, newline);
        separator = (first.match(/;/g)?.length ?? 0) >= (first.match(/,/g)?.length ?? 0) ? ';' : ',';
        const text = pending.charCodeAt(0) === 0xfeff ? pending.slice(1) : pending;
        pending = '';
        started = true;
        feed(text);
        return;
      }
      feed(chunk);
    },
    end() {
      if (!started) {
        separator ??= (pending.match(/;/g)?.length ?? 0) >= (pending.match(/,/g)?.length ?? 0) ? ';' : ',';
        feed(pending.charCodeAt(0) === 0xfeff ? pending.slice(1) : pending);
        pending = '';
      }
      if (quoteNext) quoted = false;
      if (field !== '' || row.length > 0) emitRow();
    },
  };
}

/**
 * Reads the CNIL CSV, in pieces, and keeps only SIRENs and dates. Every other cell (names,
 * emails, phones, addresses) is dropped as soon as its row is read. Throws on a format it can't
 * read or a file over the caps.
 */
export async function compactCnilDpo(chunks: AsyncIterable<string> | Iterable<string>, limits: { maxRows?: number } = {}): Promise<string> {
  const maxRows = limits.maxRows ?? CNIL_MAX_ROWS;
  const kept = new Map<string, string | null>();
  let columns: { siren: number; date: number | null } | null = null;
  let rows = 0;
  const reader = createCsvRowReader((row) => {
    if (!columns) {
      columns = cnilColumns(row);
      return;
    }
    rows += 1;
    if (rows > maxRows) throw new SourceError('The CNIL list is much bigger than expected, so we kept the last good copy.');
    const siren = normaliseSiren(row[columns.siren]);
    if (!siren) return;
    const date = columns.date === null ? null : toIsoDate(row[columns.date]);
    const held = kept.get(siren);
    // Several designations for one SIREN: the newest date is kept.
    if (held === undefined || (date !== null && (held === null || date > held))) kept.set(siren, date);
  });
  for await (const chunk of chunks) reader.push(chunk);
  reader.end();
  if (!columns) throw new SourceError(FORMAT_ERROR);
  const lines = [...kept.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([siren, date]) => (date ? `${siren},${date}` : siren));
  return `${CNIL_COMPACT_HEADER}\n${lines.join('\n')}${lines.length > 0 ? '\n' : ''}`;
}

/** Reads our compact copy: SIREN to designation date (or null when the list gave none). */
export function parseCnilCompact(text: string): Map<string, string | null> {
  const lines = text.split('\n');
  if (lines[0]?.trim() !== CNIL_COMPACT_HEADER) throw new SourceError('Our copy of the CNIL list is not in the format we expect.');
  const out = new Map<string, string | null>();
  for (const line of lines.slice(1)) {
    const [siren, date] = line.trim().split(',');
    if (siren && /^\d{9}$/.test(siren)) out.set(siren, date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null);
  }
  return out;
}

export function createCnilDpoConnector(deps: ConnectorDeps): Connector {
  const fromCopy = new Map<string, Map<string, string | null>>();
  return defineConnector({
    id: 'fr.cnil_dpo',
    jurisdictions: ['FR'],
    capabilities: ['dp_registration'],
    factPrefix: P,
    sourceName: 'CNIL DPO',
    method: 'official_list',
    homeUrl: HOME,
    // The address the refresh job downloads from. The connector itself only reads the stored copy.
    requiredEnv: ['FR_CNIL_DPO_URL'],
    ttlSeconds: 24 * 3600,
    async lookup(ref, { now }) {
      const siren = normaliseSiren(ref.siren);
      if (!siren || !isValidSiren(siren)) {
        return { status: 'unsupported', sourceUrl: HOME, message: "We need the company's SIREN to check the CNIL list of data protection officers. Add it in your answers." };
      }
      // A 32 MB file is never downloaded during a scan: only the stored copy is read.
      const stored = await readStored(deps.reference, 'fr.cnil_dpo', now(), parseCnilCompact, fromCopy);
      if (stored.state === 'none') return { status: 'unavailable', sourceUrl: HOME, message: "We don't hold a copy of the CNIL list yet, so we haven't checked this. It doesn't count for or against your score." };
      if (stored.state === 'stale') return { status: 'unavailable', sourceUrl: HOME, message: staleListWords(LIST_NAME, stored.copy.checkedAt) };
      const note = listUpdatedWords(stored.copy.checkedAt);
      const evidence = { rawHash: stored.copy.contentHash };
      if (stored.data.has(siren)) {
        const facts: Fact[] = [{ key: `${P}.listed`, value: true }];
        const date = stored.data.get(siren);
        if (date) facts.push({ key: `${P}.designated_on`, value: date });
        return { status: 'found', sourceUrl: HOME, ...evidence, facts, matchConfidence: 1, message: `This SIREN is on the CNIL list of organisations that designated a data protection officer. ${note}` };
      }
      return {
        status: 'not_found', sourceUrl: HOME, ...evidence,
        facts: [{ key: `${P}.listed`, value: false }],
        message: `We didn't find this SIREN on the CNIL list of organisations that designated a data protection officer. That isn't proof there is no DPO: the list can only match organisations that gave their SIREN. ${note}`,
      };
    },
  }, deps);
}

import { readFile } from 'node:fs/promises';
import { listUpdatedWords, readStored, staleListWords } from '../reference-store.js';
import { defineConnector, SourceError } from '../runtime.js';
import { nameSimilarity, normaliseName, normalisePostcode, parseCsv, toIsoDate } from '../text.js';
import type { Connector, ConnectorDeps, Fact } from '../types.js';

/**
 * uk.ico_register: the ICO's register of fee payers, imported from its daily file.
 * There's no API. The file has no company number, so a match needs both the name
 * and the postcode.
 *
 * Couldn't confirm: the file's current header. The ICO download page returned 403
 * to automated fetches when this was written (the site is Cloudflare-gated), as
 * the matrix warned. The aliases below come from past files. An unknown header
 * fails loudly with an error instead of matching nothing and calling that "not found".
 *
 * The register is read from the copy the refresh job stores (ICO_REGISTER_URL), and only
 * from the local ICO_REGISTER_FILE when no copy exists. A copy older than
 * REFERENCE_MAX_AGE_HOURS gives "unavailable", never an answer.
 *
 * The postcode normally comes from the Companies House profile (stage 1 of a scan),
 * and the registration number from the questionnaire (answers.ico_registration_number).
 * With neither, this source is "unsupported" and says what it needs.
 */

const P = 'registry.uk.ico';
const HOME = 'https://ico.org.uk/ESDWebPages/Search';

export interface IcoEntry {
  reference: string;
  name: string;
  tradingNames: string[];
  postcode: string;
  endDate: string | null;
  tier: string | null;
}

const COLUMNS: Record<keyof IcoEntry, string[]> = {
  reference: ['registration_number', 'registration number', 'reference', 'registration_reference'],
  name: ['organisation_name', 'organisation name', 'name'],
  tradingNames: ['trading_names', 'trading names', 'trading_name'],
  postcode: ['organisation_postcode', 'postcode', 'post_code'],
  endDate: ['end_date_of_registration', 'end date of registration', 'end_date', 'registration_end_date'],
  tier: ['payment_tier', 'tier', 'fee_tier'],
};

export function parseIcoRegister(csv: string): IcoEntry[] {
  const rows = parseCsv(csv);
  const header = (rows[0] ?? []).map((cell) => cell.trim().toLowerCase());
  const indexOf = (field: keyof IcoEntry) => header.findIndex((cell) => COLUMNS[field].includes(cell));
  const columns = { reference: indexOf('reference'), name: indexOf('name'), tradingNames: indexOf('tradingNames'), postcode: indexOf('postcode'), endDate: indexOf('endDate'), tier: indexOf('tier') };
  if (columns.reference === -1 || columns.name === -1 || columns.postcode === -1) {
    throw new SourceError("The ICO register file isn't in the format we expect, so we can't read it.");
  }
  const cell = (row: string[], index: number) => (index === -1 ? '' : (row[index] ?? '').trim());
  return rows.slice(1).map((row) => ({
    reference: cell(row, columns.reference),
    name: cell(row, columns.name),
    tradingNames: cell(row, columns.tradingNames).split(/[;|]/).map((n) => n.trim()).filter(Boolean),
    postcode: normalisePostcode(cell(row, columns.postcode)),
    endDate: toIsoDate(cell(row, columns.endDate)),
    tier: cell(row, columns.tier) || null,
  }));
}

function factsFor(entry: IcoEntry): Fact[] {
  const facts: Fact[] = [{ key: `${P}.listed`, value: true }, { key: `${P}.z_reference`, value: entry.reference }];
  if (entry.endDate) facts.push({ key: `${P}.expires_on`, value: entry.endDate });
  if (entry.tier) facts.push({ key: `${P}.tier`, value: entry.tier });
  return facts;
}

export function createIcoRegisterConnector(deps: ConnectorDeps & { readRegisterFile?: (path: string) => Promise<string> }): Connector {
  const read = deps.readRegisterFile ?? ((path: string) => readFile(path, 'utf8'));
  let loaded: { path: string; entries: IcoEntry[] } | undefined;
  const fromCopy = new Map<string, IcoEntry[]>();

  return defineConnector({
    id: 'uk.ico_register',
    jurisdictions: ['GB'],
    capabilities: ['dp_registration'],
    factPrefix: P,
    sourceName: 'ICO register',
    method: 'official_list',
    homeUrl: HOME,
    // A local file, or the address the refresh job downloads from.
    requiredEnvAny: ['ICO_REGISTER_FILE', 'ICO_REGISTER_URL'],
    ttlSeconds: 6 * 3600,
    async lookup(ref, { env, now }) {
      // The stored copy first. A copy that is too old gives no answer at all.
      const stored = await readStored(deps.reference, 'uk.ico_register', now(), parseIcoRegister, fromCopy);
      if (stored.state === 'stale') return { status: 'unavailable', sourceUrl: HOME, message: staleListWords('ICO register', stored.copy.checkedAt) };
      let entries: IcoEntry[];
      let note = '';
      let rawHash: string | undefined;
      if (stored.state === 'fresh') {
        entries = stored.data;
        note = listUpdatedWords(stored.copy.checkedAt);
        rawHash = stored.copy.contentHash;
      } else {
        const path = env['ICO_REGISTER_FILE']?.trim();
        if (!path) return { status: 'unavailable', sourceUrl: HOME, message: "We don't have a copy of the ICO register yet." };
        if (loaded?.path !== path) loaded = { path, entries: parseIcoRegister(await read(path)) };
        entries = loaded.entries;
      }
      const said = (text?: string) => {
        const words = [text, note].filter(Boolean).join(' ');
        return words ? { message: words } : {};
      };
      const hash = rawHash ? { rawHash } : {};

      if (ref.ico_reference) {
        const wanted = ref.ico_reference.toUpperCase();
        const direct = entries.find((entry) => entry.reference.toUpperCase() === wanted);
        if (direct) return { status: 'found', sourceUrl: `https://ico.org.uk/ESDWebPages/Entry/${encodeURIComponent(direct.reference)}`, facts: factsFor(direct), matchConfidence: 1, ...hash, ...said() };
      }

      // A name alone is too weak to call it either way, so without a postcode or a
      // registration number we say what we need instead of guessing.
      if (!ref.postcode && !ref.ico_reference) {
        return { status: 'unsupported', sourceUrl: HOME, message: 'We need your registered office postcode or your ICO registration number to check this. Add your ICO number in your answers.' };
      }

      const wantedName = normaliseName(ref.name);
      const sameName = entries.filter((entry) => [entry.name, ...entry.tradingNames].some((n) => normaliseName(n) === wantedName));
      if (!ref.postcode) {
        if (sameName.length === 0) {
          return { status: 'not_found', sourceUrl: HOME, facts: [{ key: `${P}.listed`, value: false }], ...hash, ...said("We can't find this name on the ICO register. If you paid recently, give it a week to appear.") };
        }
        return {
          status: 'ambiguous', sourceUrl: HOME, matchConfidence: 0.5, ...hash,
          ...said('We found this name on the ICO register, but we need your postcode to be sure it is you.'),
          candidates: sameName.slice(0, 5).map((entry) => ({ name: entry.name, identifier: entry.reference })),
        };
      }

      const postcode = normalisePostcode(ref.postcode);
      const matches = sameName.filter((entry) => entry.postcode === postcode);
      const latest = [...matches].sort((a, b) => (b.endDate ?? '').localeCompare(a.endDate ?? ''))[0];
      if (latest) return { status: 'found', sourceUrl: `https://ico.org.uk/ESDWebPages/Entry/${encodeURIComponent(latest.reference)}`, facts: factsFor(latest), matchConfidence: 0.95, ...hash, ...said() };

      const near = entries.filter((entry) => entry.postcode === postcode && nameSimilarity(entry.name, ref.name) >= 0.7);
      if (near.length > 0 || sameName.length > 0) {
        return {
          status: 'ambiguous', sourceUrl: HOME, matchConfidence: 0.5, ...hash,
          ...said('We found a close match on the ICO register. Check whether it is you.'),
          candidates: [...near, ...sameName].slice(0, 5).map((entry) => ({ name: entry.name, identifier: entry.reference })),
        };
      }
      return { status: 'not_found', sourceUrl: HOME, facts: [{ key: `${P}.listed`, value: false }], ...hash, ...said("We can't find this company on the ICO register. If you paid recently, give it a week to appear, or upload your receipt.") };
    },
  }, deps);
}

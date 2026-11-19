/**
 * npm run connectors:record -- --source uk.companies_house --name "Your Company Ltd" --jurisdiction GB
 *
 * Makes ONE live lookup against one provider and saves what it sent back, redacted, so the
 * parsers can be checked against a real response. Development only: refused when
 * NODE_ENV=production. Needs that provider's key in .env, and never calls a provider without
 * one. Read docs/RECORDING-REAL-RESPONSES.md first.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { recordOneLookup, RECORDABLE, type CompanyRef } from '@vero/connectors';

const ROOT = resolve(import.meta.dirname, '..');
export const DEFAULT_DIR = resolve(ROOT, 'packages', 'connectors', 'test', 'recorded', 'data');

const USAGE = `Usage: npm run connectors:record -- --source <source> --name "<company name>" --jurisdiction <GB|NG|US-DE|FR|NO|FI|CZ|PL|SG|CH> [options]

Sources: ${Object.keys(RECORDABLE).join(', ')}
Options:
  --number <n>     company number (Companies House) or RC number (CAC)
  --vat <n>        UK VAT number (HMRC)
  --serials <a,b>  US trademark serial numbers (USPTO)
  --cik <n>        SEC CIK, to skip the name search (SEC)
  --business <id>  an existing Middesk business id, so no new one is created (Delaware vendor)
  --siren <n>      the 9-digit SIREN (France: Annuaire des Entreprises)
  --registry-number <n>  the national company number (NO organisation number, FI Business ID, CZ ICO, PL KRS, SG UEN, CH UID)`;

/** The countries a recordable source covers. National registers without a key: NO, FI, CZ, PL, SG, CH. */
export const RECORD_JURISDICTIONS: readonly string[] = ['GB', 'NG', 'US-DE', 'FR', 'NO', 'FI', 'CZ', 'PL', 'SG', 'CH'];

export function refFromArgs(values: Record<string, string | undefined>): CompanyRef | string {
  const jurisdiction = values['jurisdiction'];
  if (!values['name']) return 'Give the company name with --name.';
  if (jurisdiction === undefined || !RECORD_JURISDICTIONS.includes(jurisdiction)) return `Give --jurisdiction as one of ${RECORD_JURISDICTIONS.join(', ')}.`;
  const number = values['number'];
  return {
    name: values['name'],
    jurisdiction,
    ...(values['registry-number'] ? { registry_number: values['registry-number'] } : {}),
    ...(number && jurisdiction === 'GB' ? { company_number: number } : {}),
    ...(number && jurisdiction === 'NG' ? { rc_number: number } : {}),
    ...(values['vat'] ? { vat_number: values['vat'] } : {}),
    ...(values['siren'] ? { siren: values['siren'] } : {}),
    ...(values['cik'] ? { cik: values['cik'] } : {}),
    ...(values['business'] ? { vendor_business_id: values['business'] } : {}),
    ...(values['serials'] ? { trademark_serials: values['serials'].split(',').map((item) => item.trim()).filter(Boolean) } : {}),
  };
}

async function main(): Promise<number> {
  if (process.env['NODE_ENV'] !== 'production' && existsSync(resolve(ROOT, '.env'))) process.loadEnvFile(resolve(ROOT, '.env'));
  const { values } = parseArgs({
    options: {
      source: { type: 'string' }, name: { type: 'string' }, jurisdiction: { type: 'string' }, number: { type: 'string' },
      vat: { type: 'string' }, serials: { type: 'string' }, cik: { type: 'string' }, business: { type: 'string' }, siren: { type: 'string' }, 'registry-number': { type: 'string' }, help: { type: 'boolean' },
    },
  });
  if (values.help || !values.source) {
    console.log(USAGE);
    return values.help ? 0 : 1;
  }
  const ref = refFromArgs(values as Record<string, string | undefined>);
  if (typeof ref === 'string') {
    console.error(`${ref}\n\n${USAGE}`);
    return 1;
  }
  const dir = process.env['CONNECTOR_RECORD_DIR']?.trim() || DEFAULT_DIR;
  const outcome = await recordOneLookup({ connectorId: values.source, ref, env: process.env, dir });
  switch (outcome.kind) {
    case 'refused':
      console.error(outcome.message);
      return 1;
    case 'not_connected':
      console.error(`${values.source} isn't connected, so nothing was called. Set ${outcome.missing.join(', ')} in .env and try again.`);
      return 1;
    case 'recorded':
      // Fact names only. Values can be about real people and stay in the files you review.
      console.log(`Result: ${outcome.status}${outcome.message ? ` (${outcome.message})` : ''}`);
      console.log(`Responses saved: ${outcome.saved}${outcome.folder ? ` in ${outcome.folder}` : ''}`);
      console.log(`Facts read: ${outcome.factKeys.length > 0 ? outcome.factKeys.join(', ') : 'none'}`);
      console.log('Next: read every file in that folder before sharing it (docs/RECORDING-REAL-RESPONSES.md), then run npm run connectors:replay.');
      return outcome.saved > 0 ? 0 : 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  main().then((code) => { process.exitCode = code; }, () => {
    // No error details: they could hold a URL with a key in it.
    console.error('The recording failed before it finished.');
    process.exitCode = 1;
  });
}

import type { ConnectorHealthResponse, RulePack } from '@vero/shared';
import { longDate } from './format';
import type { Tone } from './words';

/** Staff screens: rule packs, sources and the look-up feed. The document review desk was removed on 19 Nov 2026. */

export interface PackWords {
  word: string;
  tone: Tone;
  approved: boolean;
  line: string;
}

/**
 * The only place a pack gets called approved, and only when the API says so with a name and a
 * date. Anything else is a draft, whatever else is on the row.
 */
export function packWords(pack: Pick<RulePack, 'status' | 'approvedBy' | 'approvedAt'>): PackWords {
  if (pack.status === 'approved' && pack.approvedBy && pack.approvedAt) {
    return { word: 'Approved', tone: 'good', approved: true, line: `Approved by ${pack.approvedBy} on ${longDate(pack.approvedAt)}` };
  }
  if (pack.status === 'retired') return { word: 'Retired', tone: 'none', approved: false, line: 'No longer in use' };
  return { word: 'Draft', tone: 'watch', approved: false, line: 'Not approved by Code & Clause. Its rules stay labelled as drafts.' };
}

/** How a rule pack reads on a customer's report. Anything not approved says draft, and no reviewer is named. */
export function reportPackWords(pack: { jurisdiction: string; version: string; status: string }): string {
  const name = `${pack.jurisdiction} ${pack.version}`;
  return pack.status === 'approved' ? `${name}, reviewed` : `${name}, draft, not yet reviewed`;
}

type Connector = ConnectorHealthResponse['connectors'][number];

export interface ConnectorWords {
  word: string;
  tone: Tone;
  line: string;
}

/** A source's last answer. Never checked says exactly that, and sample data can't pass for working. */
export function connectorWords(connector: Connector, mode: ConnectorHealthResponse['mode']): ConnectorWords {
  const checked = connector.lastCheckedAt ? `Last checked ${longDate(connector.lastCheckedAt)}` : 'No check has run yet';
  const failures = connector.consecutiveFailures > 0 ? `. ${connector.consecutiveFailures} ${connector.consecutiveFailures === 1 ? 'failure' : 'failures'} in a row` : '';
  const line = `${connector.jurisdictions.join(', ')}. ${checked}${failures}`;
  if (connector.lastStatus === null) return { word: 'Not checked yet', tone: 'none', line };
  if (connector.lastStatus === 'error') return { word: 'Not responding', tone: 'risk', line };
  if (connector.lastStatus === 'unavailable' || connector.lastStatus === 'unsupported') return { word: 'Not connected', tone: 'none', line };
  return mode === 'fixture' ? { word: 'Sample data', tone: 'none', line } : { word: 'Working', tone: 'good', line };
}

export const WORK_STATUSES: Readonly<Record<string, readonly { value: 'in_progress' | 'completed' | 'cancelled'; label: string }[]>> = {
  lookup_request: [
    { value: 'in_progress', label: 'In progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
};

export const WORK_KIND_WORDS: Readonly<Record<string, string>> = {
  lookup_request: 'Company look-up',
};

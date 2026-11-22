import type { ScanSource } from '@vero/shared';

/** Words for scan sources. Ported from apps/web/src/lib/words.ts (sourceWorking, sourceStatus) and format.ts (agoWords). */
export type Tone = 'good' | 'watch' | 'none';

const SOURCE_WORKING: Record<string, string> = {
  'uk.companies_house': 'Reading the record at Companies House',
  'uk.ico_register': "Looking on the UK's data protection register",
  'uk.hmrc_vat': 'Checking the HMRC VAT register',
  'us.uspto': 'Searching for trademarks in the name',
  'us.sec_form_d': 'Looking for fundraising filings at the SEC',
  'us.delaware_vendor': 'Looking up the company on the Delaware register',
  'ng.cac_vendor': 'Asking the Corporate Affairs Commission in Nigeria',
  'ng.ndpc_list': "Looking on Nigeria's data protection register",
  'sanctions.lists': 'Checking the sanctions lists',
  'web.policy_scan': 'Reading the privacy notice on the website',
};

export function sourceWorking(source: Pick<ScanSource, 'connectorId' | 'sourceName'>): string {
  return SOURCE_WORKING[source.connectorId] ?? `Checking ${source.sourceName}`;
}

/** "Not found" is never called a problem here: it isn't proof of anything. */
export function sourceStatus(source: Pick<ScanSource, 'state' | 'connectorId'>): { word: string; tone: Tone } {
  switch (source.state) {
    case 'waiting':
      return { word: 'Waiting', tone: 'none' };
    case 'found':
      return source.connectorId === 'sanctions.lists' ? { word: 'Needs a person', tone: 'watch' } : { word: 'Done', tone: 'good' };
    case 'not_found':
      return source.connectorId === 'sanctions.lists' ? { word: 'No match', tone: 'good' } : { word: 'Not found', tone: 'watch' };
    case 'ambiguous':
      return { word: 'Needs you', tone: 'watch' };
    case 'error':
      return { word: 'Not answering', tone: 'watch' };
    case 'unavailable':
    case 'unsupported':
      return { word: 'Not connected', tone: 'none' };
  }
}

export function agoWords(value: string | null, now: Date = new Date()): string {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'not yet';
  const minutes = Math.round((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes === 1) return 'a minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
}

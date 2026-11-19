import { countryName, type CompanyRecordsResponse, type IssueSummary, type RecordItem, type ScanSource } from '@vero/shared';
import { entityWords, longDate, pointsWords, sentence } from './format';
import { sourceStatus, type Tone } from './words';

/** Where a screen says Delaware rather than the US state's ISO name. Everything else reads the shared list. */
export const COUNTRY_LONG: Readonly<Record<string, string>> = { 'US-DE': 'Delaware', GB: 'United Kingdom', NG: 'Nigeria' };

/** The long name for any country a company can be in. */
export function countryLong(code: string): string {
  return COUNTRY_LONG[code] ?? countryName(code);
}

export const CAC_STATUS_SLOT = 'ng_cac_status_report';

const CH = 'registry.uk.companies_house';
const CAC = 'registry.ng.cac';
const ICO = 'registry.uk.ico.listed';
const NDPC = 'registry.ng.ndpc.listed';
const VAT = 'registry.uk.hmrc_vat.registered';
const FORM_D = 'registry.us.sec_form_d.filed';
const MARKS = 'registry.us.uspto.trademark_marks';
const SANCTIONS = 'registry.sanctions.match';
const TIN = `${CAC}.tin_issued`;
const DIRECTOR_CHECKS = `${CH}.directors_idv_outstanding_count`;
const INSOLVENCY = `${CH}.insolvency_case_count`;

const SAMPLE_WORDS = '(sample data, not a real record)';

const LABELS: Readonly<Record<string, string>> = {
  [`${CH}.confirmation_next_due`]: 'Confirmation statement',
  [`${CH}.accounts_next_due`]: 'Annual accounts',
  [`${CH}.directors_active_count`]: 'Directors',
  [`${CAC}.directors_count`]: 'Directors',
  [ICO]: 'Data protection fee',
  [NDPC]: 'Data protection registration',
  [VAT]: 'VAT',
  [FORM_D]: 'SEC Form D',
};

/** Which open issue explains a row, when the company has one. */
const RULE_FOR_ROW: Readonly<Record<string, string>> = {
  good_standing: 'US-DE.CORP.GOOD_STANDING',
  [`${CH}.confirmation_next_due`]: 'GB.CORP.CONFIRMATION_STATEMENT',
  [`${CH}.accounts_next_due`]: 'GB.CORP.ACCOUNTS',
  [ICO]: 'GB.DP.ICO_FEE',
  [NDPC]: 'NG.DP.DCPMI_REGISTRATION',
};

/** Where each source's facts are kept, so a source with no facts can still get a row of its own. */
const SOURCE_PREFIX: Readonly<Record<string, string>> = {
  'uk.companies_house': CH,
  'uk.ico_register': 'registry.uk.ico',
  'uk.hmrc_vat': 'registry.uk.hmrc_vat',
  'us.uspto': 'registry.us.uspto',
  'us.sec_form_d': 'registry.us.sec_form_d',
  'us.delaware_vendor': 'registry.us.delaware_vendor',
  'ng.cac_vendor': CAC,
  'ng.ndpc_list': 'registry.ng.ndpc',
  'sanctions.lists': 'registry.sanctions',
};

const DAY = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Today, or on 3 Nov 2026. */
export function dayWords(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  return date.toISOString().slice(0, 10) === now.toISOString().slice(0, 10) ? 'today' : `on ${DAY.format(date)}`;
}

/** The line above the facts. Nothing checked yet says exactly that. */
export function checkedWords(checkedAt: string | null, now: Date = new Date()): string {
  return checkedAt ? `Checked ${dayWords(checkedAt, now)} at ${TIME.format(new Date(checkedAt))}.` : 'Not checked yet.';
}

function listName(source: string): string {
  if (source.endsWith('register')) return `the ${source}`;
  if (source.includes('sanctions')) return `the ${source} lists`;
  return `the ${source} list`;
}

/**
 * Where a fact came from and when, in plain words. The API's words for a list say "Found on the
 * list" even when the answer was that it wasn't, so a list check is worded here.
 */
export function sourceWords(item: Pick<RecordItem, 'source' | 'retrievedAt' | 'howWeKnow' | 'sampleData'>, now: Date = new Date()): string {
  const base = item.howWeKnow.replace(SAMPLE_WORDS, '').trim();
  const when = item.retrievedAt ? dayWords(item.retrievedAt, now) : null;
  let words: string;
  if (base.startsWith('Found on the ') && item.source) {
    words = `Checked ${listName(item.source)}${when ? ` ${when}` : ''}`;
  } else if (!when || /\b(today|on \d)/.test(base)) {
    words = base;
  } else if (base === 'From our licensed data provider' && item.source?.startsWith('CAC')) {
    words = `${item.source}. Retrieved ${when}`;
  } else {
    words = `${base}. Retrieved ${when}`;
  }
  return item.sampleData ? `${words} ${SAMPLE_WORDS}` : words;
}

/** "Delaware doesn't allow automatic status checks, so we go by..." as a heading and a sentence. */
export function splitStatusNote(note: string): { title: string; body: string } {
  const match = /^(.*?), so (.*)$/s.exec(note);
  return match?.[1] && match[2] ? { title: match[1], body: sentence(match[2]) } : { title: 'How we know this', body: note };
}

export interface RowLink {
  href: string;
  label: string;
}

export interface FactRow {
  key: string;
  label: string;
  value: string;
  tone: Tone;
  source: string;
  numeric: boolean;
  /** Needs the person to act. This is what "2 things need you" counts. */
  needsYou: boolean;
  body: string | null;
  links: RowLink[];
}

export interface RowContext {
  now?: Date;
  /** Open issues for this company. A row only links to one that's really there. */
  issues?: readonly IssueSummary[];
  canUpload?: boolean;
}

interface Presence {
  yes: string;
  body: (name: string) => string;
  slot?: string;
  uploadLabel?: string;
}

/** A yes or no from a register. "No" only means we didn't find it, and it's never worded as more. */
const PRESENCE: Readonly<Record<string, Presence>> = {
  [ICO]: {
    yes: 'On the ICO register',
    body: (name) => `We can't find ${name} on the ICO register. That isn't proof it isn't there: if you paid recently, give it a week to appear, or upload your receipt.`,
    slot: 'gb_ico_receipt',
    uploadLabel: 'Upload your receipt',
  },
  [NDPC]: {
    yes: 'On the NDPC list',
    body: (name) => `We can't find ${name} on the Nigeria Data Protection Commission's list. That isn't proof it isn't there: the list may be behind, or show another name.`,
  },
  [VAT]: {
    yes: 'Registered',
    body: () => "HMRC didn't find a VAT registration for what we checked. That isn't proof there isn't one, and not every company has to register.",
  },
  [FORM_D]: {
    yes: 'Filed',
    body: (name) => `We didn't find a Form D for ${name} on SEC EDGAR. That isn't proof there isn't one: it may be under another name.`,
  },
  [TIN]: {
    yes: 'Issued',
    body: (name) => `Our licensed data provider didn't show a tax ID for ${name}. That isn't proof there isn't one: check your certificate from the Federal Inland Revenue Service.`,
  },
};

function isIsoDay(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function issueLink(key: string, companyId: string, issues: readonly IssueSummary[], label: string): RowLink | null {
  const rule = RULE_FOR_ROW[key];
  const issue = rule ? issues.find((item) => item.ruleKey === rule) : undefined;
  if (!rule || !issue) return null;
  const points = issue.points && issue.points > 0 ? `, ${pointsWords(issue.points)}` : '';
  return { href: `/issues/${companyId}/${encodeURIComponent(rule)}`, label: `${label}${points}` };
}

function itemRow(records: CompanyRecordsResponse, item: RecordItem, context: Required<RowContext>, downHere: boolean): FactRow {
  const { now, issues, canUpload } = context;
  const today = now.toISOString().slice(0, 10);
  const row: FactRow = {
    key: item.key,
    label: LABELS[item.key] ?? item.label,
    value: item.value,
    tone: 'none',
    source: sourceWords(item, now),
    numeric: /(number|rc_number)$/.test(item.key),
    needsYou: item.needsYou,
    body: null,
    links: [],
  };
  if (downHere) row.source = `${row.source}. We couldn't reach it on the last try, so this may be out of date.`;

  if (item.key === 'good_standing') {
    row.tone = item.needsYou ? 'watch' : 'good';
    if (item.needsYou) {
      const link = issueLink(item.key, records.companyId, issues, 'Why this matters');
      if (link) row.links.push(link);
    }
    return row;
  }

  const presence = PRESENCE[item.key];
  if (presence) {
    if (item.value === 'Yes') {
      row.value = presence.yes;
      row.tone = 'good';
    } else {
      row.value = 'Not found';
      row.tone = 'watch';
      row.body = presence.body(records.legalName);
      const link = issueLink(item.key, records.companyId, issues, 'What to do');
      if (link) {
        row.links.push(link);
        row.needsYou = true;
      }
      if (presence.slot && presence.uploadLabel && canUpload) {
        row.links.push({ href: `/documents/add?company=${records.companyId}&slot=${presence.slot}`, label: presence.uploadLabel });
      }
    }
    return row;
  }

  if (item.key === SANCTIONS) {
    const clean = item.value === 'No matches';
    row.tone = clean ? 'good' : 'watch';
    row.needsYou = !clean;
    if (!clean) {
      row.body = "A possible match isn't a finding. It may be another business with the same name, so a person needs to check it.";
    }
    return row;
  }

  if (item.key === MARKS && item.value.trim() === '') {
    row.value = 'Not found';
    row.tone = 'watch';
    row.body = `We didn't find a US trademark for ${records.legalName}. That isn't proof there isn't one: it may be under another name.`;
    return row;
  }

  if (item.key.endsWith('.status')) {
    row.value = sentence(item.value.replaceAll('-', ' '));
    row.tone = item.value.toLowerCase() === 'active' ? 'good' : 'watch';
    return row;
  }
  if (item.key.endsWith('.type') || item.key.endsWith('.entity_type')) {
    row.value = entityWords(item.value) ?? item.value;
    return row;
  }
  if (item.key === DIRECTOR_CHECKS) {
    const waiting = item.value !== '0';
    row.value = waiting ? `${item.value} still to verify` : 'All verified';
    row.tone = waiting ? 'watch' : 'good';
    return row;
  }
  if (item.key.endsWith('_count')) {
    row.value = `${item.value} on record`;
    if (item.key === INSOLVENCY && item.value !== '0') {
      row.tone = 'risk';
      row.needsYou = true;
    }
    return row;
  }

  if (item.key.endsWith('_next_due') && isIsoDay(item.value)) {
    const overdue = item.value < today;
    row.value = overdue ? `Overdue since ${longDate(item.value)}` : `Due ${longDate(item.value)}`;
    if (overdue) {
      row.tone = 'risk';
      row.needsYou = true;
      row.body = 'File it on the Companies House website. Until you do, anyone who looks up the company, investors included, sees it as overdue.';
      const link = issueLink(item.key, records.companyId, issues, 'How to fix this');
      if (link) row.links.push(link);
      row.links.push({ href: `/deadlines?company=${records.companyId}`, label: 'See it in your deadlines' });
    }
    return row;
  }
  if (isIsoDay(item.value)) row.value = longDate(item.value);
  return row;
}

function sourceRow(source: ScanSource, now: Date): FactRow {
  const status = sourceStatus(source);
  const tried = source.lastTriedAt ? ` Last tried ${dayWords(source.lastTriedAt, now)}.` : '';
  const clean = source.connectorId === 'sanctions.lists' && source.state === 'not_found';
  return {
    key: `source:${source.connectorId}`,
    label: source.title,
    value: clean ? 'No matches' : status.word,
    tone: status.tone,
    source: `${source.summary}${tried}${source.sampleData ? ` ${SAMPLE_WORDS}` : ''}`,
    numeric: false,
    needsYou: source.state === 'ambiguous',
    body: null,
    links: [],
  };
}

const SOURCE_ROW_STATES: ReadonlySet<ScanSource['state']> = new Set<ScanSource['state']>(['waiting', 'not_found', 'ambiguous', 'error', 'unavailable', 'unsupported']);

/** Every fact the API gave, then a row for each source that gave none and hasn't simply answered. */
export function recordRows(records: CompanyRecordsResponse, context: RowContext = {}): FactRow[] {
  const full: Required<RowContext> = { now: context.now ?? new Date(), issues: context.issues ?? [], canUpload: context.canUpload ?? false };
  const covers = (source: ScanSource, key: string) => {
    const prefix = SOURCE_PREFIX[source.connectorId];
    return prefix !== undefined && key.startsWith(`${prefix}.`);
  };
  const rows = records.items.map((item) => itemRow(records, item, full, records.sources.some((source) => source.down && covers(source, item.key))));
  for (const source of records.sources) {
    const hasFacts = records.items.some((item) => covers(source, item.key));
    if (!hasFacts && SOURCE_ROW_STATES.has(source.state)) rows.push(sourceRow(source, full.now));
  }
  return rows;
}

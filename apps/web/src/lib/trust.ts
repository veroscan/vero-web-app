import type { BadgeStatusResponse, PublicReportResponse, Role } from '@vero/shared';
import { longDate, plural } from './format';
import type { Tone } from './words';


const ON_A_PAID_PLAN = 'Shown on a paid plan';

export interface RequirementRow {
  key: string;
  label: string;
  status: string;
  tone: Tone;
}

function toneOf(met: boolean | null, missed: Tone = 'watch'): Tone {
  if (met === null) return 'none';
  return met ? 'good' : missed;
}

/** A full scan within the API's own number of days. The API checks this itself. These words only show it. */
function scannedLately(on: string, days: number, now: Date): boolean {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return (today - Date.parse(`${on.slice(0, 10)}T00:00:00Z`)) / 86_400_000 <= days;
}

/** What the badge takes, each row from the API's own numbers. A plan that hides a number says so. */
export function badgeRows(status: Pick<BadgeStatusResponse, 'requirements'>, now: Date = new Date()): RequirementRow[] {
  const { minScore, currentScore, minCoveragePercent, coverage, openUrgent, lastFullScanOn, fullScanWithinDays } = status.requirements;
  const covered = coverage === null ? null : coverage.total > 0 && (coverage.counted / coverage.total) * 100 >= minCoveragePercent;
  const scanned = lastFullScanOn === null ? false : scannedLately(lastFullScanOn, fullScanWithinDays, now);
  return [
    {
      key: 'score',
      label: `Score of ${minScore} or more`,
      status: currentScore === null ? ON_A_PAID_PLAN : `You're at ${currentScore}`,
      tone: toneOf(currentScore === null ? null : currentScore >= minScore),
    },
    {
      key: 'coverage',
      label: `At least ${minCoveragePercent}% of the checks that apply counted`,
      status: coverage === null ? ON_A_PAID_PLAN : `${coverage.counted} of ${coverage.total} counted`,
      tone: toneOf(covered),
    },
    {
      key: 'urgent',
      label: 'No urgent issues',
      status: openUrgent === null ? ON_A_PAID_PLAN : openUrgent === 0 ? 'None open' : `${openUrgent} open`,
      tone: toneOf(openUrgent === null ? null : openUrgent === 0, 'risk'),
    },
    {
      key: 'scan',
      label: `A full scan in the last ${fullScanWithinDays} days`,
      status: lastFullScanOn === null ? 'Not yet' : `Last scanned ${longDate(lastFullScanOn)}`,
      tone: toneOf(scanned),
    },
  ];
}

/** The only way a screen may call a badge earned: the API has one, and says it's live. */
export function earnedBadge(status: Pick<BadgeStatusResponse, 'badge'>): NonNullable<BadgeStatusResponse['badge']> | null {
  return status.badge?.active === true ? status.badge : null;
}

export function shareUrl(token: string, origin: string): string {
  return `${origin}/r/${encodeURIComponent(token)}`;
}

export function verifiedUrl(token: string, origin: string): string {
  return `${origin}/verified/${encodeURIComponent(token)}`;
}

// ---- Team ----

export const ROLE_WORDS: Record<Role, string> = { owner: 'Owner', admin: 'Admin', member: 'Member', lawyer: 'Read only' };

// ---- The public report ----

const AREA_LINES: Readonly<Record<string, string>> = {
  'Intellectual property': 'Who owns the code, brand and ideas',
  Compliance: 'Data protection and the licences needed',
  Fundraising: 'Cap table, SAFEs and investor documents',
  'AI and data': 'How the company uses and trains AI',
  'Company foundations': 'Registration, directors and filings',
  Contracts: 'What it signs with customers, staff and suppliers',
};

export function areaLine(name: string): string | null {
  return AREA_LINES[name] ?? null;
}

type PublicArea = PublicReportResponse['areas'][number];

/** "1 urgent issue and 1 worth doing are open." Counts only: the details stay private. */
export function areaOpenWords(area: Pick<PublicArea, 'openUrgent' | 'openImportant' | 'openWorthDoing'>): string {
  const parts: string[] = [];
  if (area.openUrgent > 0) parts.push(plural(area.openUrgent, 'urgent issue', 'urgent issues'));
  if (area.openImportant > 0) parts.push(plural(area.openImportant, 'important issue', 'important issues'));
  if (area.openWorthDoing > 0) parts.push(`${area.openWorthDoing} ${parts.length === 0 ? (area.openWorthDoing === 1 ? 'issue worth doing' : 'issues worth doing') : 'worth doing'}`);
  if (parts.length === 0) return 'Nothing is open here.';
  const total = area.openUrgent + area.openImportant + area.openWorthDoing;
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
  const open = `${list} ${total === 1 ? 'is' : 'are'} open.`;
  return area.openUrgent > 0 ? `${open} An urgent issue keeps an area below 50 until it's fixed, however much else is in order.` : open;
}

export function expiryWords(expiresAt: string, now: Date = new Date()): string {
  const days = Math.ceil((new Date(expiresAt).getTime() - now.getTime()) / 86_400_000);
  if (days <= 0) return 'This link has expired.';
  return days === 1 ? 'Link expires tomorrow.' : `Link expires in ${days} days.`;
}

/** The API's words, with any date in them read out. */
export function checkedWords(howWeKnow: string): string {
  return howWeKnow.replace(/\b\d{4}-\d{2}-\d{2}\b/g, (date) => longDate(date));
}

export function checkedStatus(howWeKnow: string): { word: string; tone: Tone } {
  return /^(Not checked|No certificate)/.test(howWeKnow) ? { word: 'Not checked', tone: 'watch' } : { word: 'Checked', tone: 'good' };
}

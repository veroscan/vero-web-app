import type { IssueSummary } from '@vero/shared';
import { pointsWords } from './format';

export function issueKey(issue: Pick<IssueSummary, 'companyId' | 'ruleKey'>): string {
  return `${issue.companyId}|${issue.ruleKey}`;
}

export function issuePath(issue: Pick<IssueSummary, 'companyId' | 'ruleKey'>): string {
  return `/issues/${issue.companyId}/${encodeURIComponent(issue.ruleKey)}`;
}

export function isOpenIssue(issue: IssueSummary): boolean {
  return issue.outcome === 'gap' || issue.outcome === 'defect';
}

export interface IssueGroup {
  id: 'urgent' | 'important' | 'worth';
  title: string;
  tone: '' | 'risk' | 'watch';
  issues: IssueSummary[];
}

/** Keeps the API's ranking inside each group, as in the design. */
export function groupBySeverity(issues: IssueSummary[]): IssueGroup[] {
  const groups: IssueGroup[] = [
    { id: 'urgent', title: 'Urgent', tone: 'risk', issues: issues.filter((issue) => issue.severity === 'critical') },
    { id: 'important', title: 'Important', tone: 'watch', issues: issues.filter((issue) => issue.severity === 'high') },
    { id: 'worth', title: 'Worth doing', tone: '', issues: issues.filter((issue) => issue.severity === 'medium' || issue.severity === 'low') },
  ];
  return groups.filter((group) => group.issues.length > 0);
}

/** The points to show on a row. Never "+0": the row says why instead, or nothing. */
export function pointsLabel(issue: Pick<IssueSummary, 'points'>): string | null {
  return issue.points === null || issue.points === 0 ? null : pointsWords(issue.points);
}

/** What a finding is now, as one coloured word. Urgent open findings first, then the rest. */
export type FindingStatus = 'urgent' | 'attention' | 'cleared' | 'unseen' | 'na';

export function findingStatus(issue: Pick<IssueSummary, 'outcome' | 'severity'>): FindingStatus {
  if (issue.outcome === 'gap' || issue.outcome === 'defect') return issue.severity === 'critical' ? 'urgent' : 'attention';
  if (issue.outcome === 'pass') return 'cleared';
  if (issue.outcome === 'verify') return 'unseen';
  return 'na';
}

export const FINDING_WORDS: Record<FindingStatus, string> = {
  urgent: 'Urgent',
  attention: 'Needs attention',
  cleared: 'Cleared',
  unseen: 'Not seen yet',
  na: "Doesn't apply",
};

/** The colour token for each status word. */
export const FINDING_COLOUR: Record<FindingStatus, string> = {
  urgent: 'var(--urgent)',
  attention: 'var(--warn)',
  cleared: 'var(--good)',
  unseen: 'var(--ink-3)',
  na: 'var(--ink-3)',
};

export type SourceKind = 'reg' | 'doc' | 'web' | 'answers' | 'none';

/** Where Vero learnt this, from the API's own "how we know" lines. */
export function findingSource(issue: Pick<IssueSummary, 'howWeKnow'>): { label: string; kind: SourceKind } {
  for (const line of issue.howWeKnow) {
    const checked = /^Checked (?:with|on) (.+?)(?:\s+(?:today|yesterday|on\b|\()|$)/i.exec(line);
    if (checked?.[1]) {
      const name = checked[1].trim();
      if (/website/i.test(name)) return { label: 'Your website', kind: 'web' };
      return { label: name.charAt(0).toUpperCase() + name.slice(1), kind: 'reg' };
    }
    if (/uploaded|you shared|your document/i.test(line)) return { label: 'Your documents', kind: 'doc' };
  }
  if (issue.howWeKnow.some((line) => /^You told us/i.test(line))) return { label: 'Your answers', kind: 'answers' };
  return { label: 'Not seen yet', kind: 'none' };
}

/** One "how we know" line as a whole thought. The API can send a bare "You told us", which reads as cut off. */
export function knowWords(line: string): string {
  return /^You told us\.?$/i.test(line.trim()) ? 'From the answers you gave Vero' : line;
}

/** Vero is a scanner: rule text that tells people to hire someone is left out of what a customer sees. */
export function withoutReferrals(text: string | null | undefined): string | null {
  if (!text) return null;
  const kept = text
    .split(/(?<=[.!?])\s+/)
    .filter((part) => !/\b(lawyers?|solicitors?|attorneys?|counsel|law firm|code\s*&\s*clause)\b/i.test(part))
    .join(' ')
    .trim();
  return kept.length > 0 ? kept : null;
}

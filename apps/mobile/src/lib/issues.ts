import type { IssueSummary } from '@vero/shared';
import type { Href } from 'expo-router';

// Ported from apps/web/src/lib/issues.ts: status words, sources and the referral filter.

export function issueKey(issue: Pick<IssueSummary, 'companyId' | 'ruleKey'>): string {
  return `${issue.companyId}|${issue.ruleKey}`;
}

/** The phone's finding screen for an issue. */
export function findingHref(issue: Pick<IssueSummary, 'companyId' | 'ruleKey'>): Href {
  return `/finding/${issue.companyId}/${encodeURIComponent(issue.ruleKey)}` as Href;
}

export function isOpenIssue(issue: Pick<IssueSummary, 'outcome'>): boolean {
  return issue.outcome === 'gap' || issue.outcome === 'defect';
}

/** What a finding is now, as one coloured word. */
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

/** The `Status` tone for each status word. */
export const FINDING_TONE: Record<FindingStatus, 'urgent' | 'warn' | 'good' | 'muted'> = {
  urgent: 'urgent',
  attention: 'warn',
  cleared: 'good',
  unseen: 'muted',
  na: 'muted',
};

/** Urgent first, then what moves the score most, keeping the API's order otherwise. */
export function rankIssues(a: IssueSummary, b: IssueSummary): number {
  const sa = findingStatus(a) === 'urgent' ? 0 : 1;
  const sb = findingStatus(b) === 'urgent' ? 0 : 1;
  return sa - sb || (b.points ?? 0) - (a.points ?? 0);
}

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

/** Vero is a scanner: rule text that tells people to hire someone is left out of what a user sees. */
export function withoutReferrals(text: string | null | undefined): string | null {
  if (!text) return null;
  const kept = text
    .split(/(?<=[.!?])\s+/)
    .filter((part) => !/\b(lawyers?|solicitors?|attorneys?|counsel|law firm|code\s*&\s*clause)\b/i.test(part))
    .join(' ')
    .trim();
  return kept.length > 0 ? kept : null;
}

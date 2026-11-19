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

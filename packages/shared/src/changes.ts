import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './common';

/**
 * What one finished scan changed compared with the one before it, in counts and plain words.
 * Counts only, never issue text, so a plan that shows a few issues learns nothing more here.
 * A source that couldn't be checked is never a change: it is only counted in `notChecked`.
 */
export const changeSummarySchema = z.object({
  scanId: uuidSchema,
  at: isoDateTimeSchema,
  /** What started the scan: user, monitoring, answers, document, and so on. */
  trigger: z.string(),
  newIssues: z.number().int(),
  /** Of the new issues, how many are urgent or important. */
  newUrgent: z.number().int(),
  resolvedIssues: z.number().int(),
  /** Null on plans that see a range, and when there was no score. */
  scoreBefore: z.number().int().nullable(),
  scoreAfter: z.number().int().nullable(),
  statusChanged: z.boolean(),
  sanctionsMatch: z.boolean(),
  /** Sources that couldn't be checked this time. Not counted as a change. */
  notChecked: z.number().int(),
  /** One of the changes we tell people about (the monitoring rules). */
  meaningful: z.boolean(),
  summary: z.string(),
});
export type ChangeSummary = z.infer<typeof changeSummarySchema>;

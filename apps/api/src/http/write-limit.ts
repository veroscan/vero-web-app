import type { AppDeps } from '../deps';

/** Small settings changes (reminders, link names, email choices, sessions, cancelling a scan): per person, per hour. */
export const SETTING_WRITES_PER_USER_PER_HOUR = 120;

/** Throws a 429 once one person has made this kind of change too many times in an hour. */
export async function enforceWriteLimit(deps: Pick<AppDeps, 'limiter'>, what: string, userId: string): Promise<void> {
  await deps.limiter.enforce(`write:${what}:${userId}`, SETTING_WRITES_PER_USER_PER_HOUR, 3600);
}

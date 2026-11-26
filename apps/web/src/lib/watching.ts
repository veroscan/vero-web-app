import type { WatchlistMonitoring } from '@vero/shared';
import { plural, shortDate } from './format';

/** "2 urgent issues", "No urgent issues", or nothing when the API has no count yet (before the first result). */
export function urgentWords(count: number | null | undefined): { text: string; tone: 'urgent' | 'good' } | null {
  if (count === null || count === undefined) return null;
  return count === 0 ? { text: 'No urgent issues', tone: 'good' } : { text: plural(count, 'urgent issue', 'urgent issues'), tone: 'urgent' };
}

/**
 * When the next automatic re-check is due. Nothing at all when monitoring is off (the screen says that once,
 * plainly). The date is when the company becomes due, not a promise of the minute, so it says "around".
 */
export function nextCheckWords(monitoring: WatchlistMonitoring | undefined, dueAt: string | null | undefined, now: Date = new Date()): string | null {
  if (!monitoring || !monitoring.on) return null;
  if (!dueAt) return 'Next re-check after the first full scan';
  return new Date(dueAt).getTime() <= now.getTime() ? 'Next re-check is due now' : `Next re-check around ${shortDate(dueAt)}`;
}

/** The one line about re-checks for the top of a screen: on and how often, or plainly that they are off. */
export function monitoringLine(monitoring: WatchlistMonitoring | undefined): { title: string; body: string } | null {
  if (!monitoring) return null;
  if (monitoring.on) {
    return { title: monitoring.everyDays === 1 ? 'Re-checked every day' : monitoring.everyDays ? `Re-checked every ${plural(monitoring.everyDays, 'day', 'days')}` : 'Re-checked automatically', body: monitoring.note };
  }
  return { title: 'Automatic re-checks are off', body: monitoring.note };
}

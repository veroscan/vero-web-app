import { router, type Href } from 'expo-router';

/**
 * Opens a route by its path. Some screens these link to (search, notifications, share, settings)
 * belong to other parts of the app and may not be in the generated route types yet.
 */
export function go(path: string): void {
  router.push(path as Href);
}

/** Switches to a tab without stacking another copy of it. */
export function goTab(path: '/' | '/findings' | '/deadlines' | '/watchlist'): void {
  router.navigate(path as Href);
}

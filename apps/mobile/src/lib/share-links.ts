import Constants from 'expo-constants';
import { Platform, Share } from 'react-native';

/**
 * Where the public report opens: the Vero website, at /r/<token> (apps/web/src/lib/trust.ts shareUrl).
 * Set EXPO_PUBLIC_WEB_URL for a real deployment. In development the website runs on port 3000 of
 * the computer that serves the app.
 */
export function webOrigin(): string {
  const configured = process.env.EXPO_PUBLIC_WEB_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (Platform.OS === 'web' && typeof window !== 'undefined') return `${window.location.protocol}//${window.location.hostname}:3000`;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:3000`;
}

export function shareUrl(token: string): string {
  return `${webOrigin()}/r/${encodeURIComponent(token)}`;
}

/** Copies text where the platform lets us without a native module. Returns false when it can't. */
export async function copyText(text: string): Promise<boolean> {
  if (Platform.OS !== 'web') return false;
  try {
    await globalThis.navigator?.clipboard?.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Opens the system share sheet. Never throws: a browser without Web Share just does nothing. */
export async function shareText(message: string, url?: string): Promise<boolean> {
  try {
    await Share.share(url ? { message, url } : { message });
    return true;
  } catch {
    return false;
  }
}

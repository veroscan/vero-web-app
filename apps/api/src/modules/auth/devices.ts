/**
 * A coarse label for a session's device, from its user agent: "Chrome on Windows". Only the
 * browser family and the operating system, never a version or a model. Null when the user agent
 * is missing or says nothing we recognise: the screen then says it doesn't know.
 */

const BROWSERS: readonly (readonly [RegExp, string])[] = [
  // Order matters: Edge and Opera also say Chrome, and Chrome also says Safari.
  [/\bEdg(?:e|A|iOS)?\//, 'Edge'],
  [/\b(?:OPR|Opera)\//, 'Opera'],
  [/\bSamsungBrowser\//, 'Samsung Internet'],
  [/\b(?:Firefox|FxiOS)\//, 'Firefox'],
  [/\b(?:Chrome|CriOS)\//, 'Chrome'],
  [/\bSafari\//, 'Safari'],
];

const SYSTEMS: readonly (readonly [RegExp, string])[] = [
  [/\biPhone\b/, 'iPhone'],
  [/\biPad\b/, 'iPad'],
  [/\bAndroid\b/, 'Android'],
  [/\bWindows\b/, 'Windows'],
  [/\bCrOS\b/, 'ChromeOS'],
  [/\bMac OS X\b|\bMacintosh\b/, 'Mac'],
  [/\bLinux\b/, 'Linux'],
];

export function deviceLabel(userAgent: string | null | undefined): string | null {
  if (!userAgent) return null;
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? null;
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? null;
  if (browser && system) return `${browser} on ${system}`;
  return browser ?? system;
}

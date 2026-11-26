import { resolve } from 'node:path';
import type { NextConfig } from 'next';

const repoRoot = resolve(import.meta.dirname, '..', '..');

/** Read when the app is built: rewrites are fixed at build time for `next start`. */
const apiOrigin = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000';

/**
 * Next.js cuts any request passing through a rewrite at 10 MB by default, and the API then waits
 * for bytes that never come. This must stay above the API's own limit (MAX_UPLOAD_MB), so that
 * an oversized file gets the API's plain refusal.
 */
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? 25);

const config: NextConfig = {
  reactStrictMode: true,
  experimental: { proxyClientMaxBodySize: `${maxUploadMb + 1}mb` },
  // The browser refuses an oversized file before sending it. Refused mid-send, the rewrite sometimes turns the API's 413 into a 500.
  env: { NEXT_PUBLIC_MAX_UPLOAD_MB: String(maxUploadMb) },
  poweredByHeader: false,
  // sharp is banned, so Next.js must never try to optimise an image.
  images: { unoptimized: true },
  transpilePackages: ['@vero/shared'],
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
  async rewrites() {
    // Same origin in the browser, so the API's HttpOnly session cookie works.
    return [{ source: '/v1/:path*', destination: `${apiOrigin}/v1/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          // A sign-in link carries its token in the address, so it must never leak onward.
          { key: 'Referrer-Policy', value: 'same-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
          // Everything the app loads is its own: scripts, styles, fonts, images and the API (same origin, through the rewrite).
          // Inline scripts stay allowed for the theme script and Next's own bootstrap. Development needs eval for fast refresh.
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Content-Security-Policy',
                  value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
                },
                { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
              ]
            : []),
        ],
      },
    ];
  },
};

export default config;

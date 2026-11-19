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
  // The route that serves the 3D script reads it from docs/design.
  outputFileTracingIncludes: { '/vero-3d.js': ['../../docs/design/vero-3d.js'] },
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
        ],
      },
    ];
  },
};

export default config;

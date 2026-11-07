import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Production builds are a static export (`out/`): every route becomes `<route>.html`
 * (`/product` -> `out/product.html`). Links in the markup are clean (`/product`), so the host must
 * serve `product.html` at `/product` (Vercel, Netlify and Cloudflare Pages do; `npm start` does too).
 * `next dev` also answers the old `.html` addresses through development-only rewrites.
 */
const nextConfig: NextConfig = {
  output: isDev ? undefined : "export",
  trailingSlash: false,
  images: { unoptimized: true },
  reactStrictMode: true,
  ...(isDev && {
    async rewrites() {
      return [
        { source: "/index.html", destination: "/" },
        { source: "/:path*.html", destination: "/:path*" },
      ];
    },
  }),
};

export default nextConfig;

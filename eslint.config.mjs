import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  { ignores: [".next/**", "out/**", "public/**", "tools/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Static export with `images.unoptimized`: plain <img> is intended (fixed sizes, no optimiser).
      "@next/next/no-img-element": "off",
      // Internal links are plain <a href="x.html"> on purpose: the template's page transition
      // runs on full-page navigation (see README, "Navigation").
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

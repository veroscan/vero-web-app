import type { Metadata } from "next";
import { COMPANY } from "./site";

interface PageMetaInput {
  title: string;
  /** Social card title when it differs from the page title. */
  ogTitle?: string;
  description: string;
  /** Shorter text for social cards when it differs from the meta description. */
  ogDescription?: string;
  /**
   * Search-engine indexing. "noindex" keeps a page out of results but lets crawlers follow its links;
   * "framework" leaves the tag to Next (the not-found page is always marked noindex by Next itself).
   */
  indexing?: "index" | "noindex" | "framework";
  article?: { publishedTime: string; section: string };
}

const ROBOTS: Record<NonNullable<PageMetaInput["indexing"]>, Metadata["robots"]> = {
  index: { index: true, follow: true, "max-image-preview": "large" },
  noindex: { index: false, follow: true },
  framework: undefined,
};

/**
 * Head metadata of one page. There is no canonical URL or absolute og:url because the production
 * domain is not decided yet (the share image is declared once in the root layout for the same reason).
 */
export function pageMetadata({ title, ogTitle, description, ogDescription, indexing = "index", article }: PageMetaInput): Metadata {
  return {
    title,
    description,
    robots: ROBOTS[indexing],
    openGraph: {
      type: article ? "article" : "website",
      siteName: COMPANY.productName,
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      ...(article ? { publishedTime: article.publishedTime, section: article.section } : {}),
    },
    // Next also derives twitter:title and twitter:description from the Open Graph fields.
    twitter: { card: "summary_large_image" },
  };
}

import "@/styles/blog.css";
import "@/styles/pages-c.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { InsightsHero } from "@/components/sections/insights/InsightsHero";
import { InsightsList } from "@/components/sections/insights/InsightsList";
import { InsightsCta } from "@/components/sections/insights/InsightsCta";

export const metadata = pageMetadata({
  title: "Insights: plain-English notes on the law behind a technology company | Vero Scan",
  description: "Short, plain-English guides from Code & Clause on the rules Vero Scan checks: cookie banners in Nigeria, who owns the code a contractor wrote, and what Active means on the CAC register.",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Vero Scan Insights",
  inLanguage: "en",
  description: "Short, plain-English guides from Code & Clause on the rules Vero Scan checks: cookie banners in Nigeria, who owns the code a contractor wrote, and what Active means on the CAC register.",
  publisher: {
    "@type": "Organization",
    name: "Code & Clause LTD",
    email: "hello@codeclauselegal.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Suite 191B Jide Oki Street, Off Ligali Ayorinde",
      addressLocality: "Victoria Island, Lagos",
      addressCountry: "NG",
    },
  },
  hasPart: [
    {
      "@type": "BlogPosting",
      headline: "Your cookie banner is probably non-compliant in Nigeria: what GAID 2025 Articles 7 and 19 require",
      datePublished: "2026-11-03",
    },
    {
      "@type": "BlogPosting",
      headline: "“Active” is not the same as compliant: CAC annual returns, status reports and what investors check",
      datePublished: "2026-11-03",
    },
    {
      "@type": "BlogPosting",
      headline: "The contractor who built your product may still own it: IP assignment in Nigeria, the UK and the US",
      datePublished: "2026-11-02",
    },
  ],
};

export default function InsightsPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main>
        <InsightsHero />
        <InsightsList />
        <InsightsCta />
      </main>
    </>
  );
}

import "@/styles/blog.css";
import "@/styles/pages-c.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { ReadProgress } from "@/components/ui/ReadProgress";
import { ArticleHero } from "@/components/sections/articles/cac-annual-returns-and-status/ArticleHero";
import { ArticleIntro } from "@/components/sections/articles/cac-annual-returns-and-status/ArticleIntro";
import { ArticleBody } from "@/components/sections/articles/cac-annual-returns-and-status/ArticleBody";
import { RelatedArticles } from "@/components/sections/articles/cac-annual-returns-and-status/RelatedArticles";
import { ArticleCta } from "@/components/sections/articles/cac-annual-returns-and-status/ArticleCta";

export const metadata = pageMetadata({
  title: "CAC annual returns, status reports and what investors check | Vero Scan",
  description: "A company can show “active” on the CAC register and still fail corporate due diligence. What the status means, what annual returns and status reports prove, and the record investors expect to see.",
  article: { publishedTime: "2026-11-03", section: "Corporate" },
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: "“Active” is not the same as compliant: CAC annual returns, status reports and what investors check",
      description: "A company can show “active” on the CAC register and still fail corporate due diligence. What the status means, what annual returns and status reports prove, and the record investors expect to see.",
      datePublished: "2026-11-03",
      dateModified: "2026-11-03",
      inLanguage: "en",
      articleSection: "Corporate",
      author: {
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
      about: {
        "@type": "SoftwareApplication",
        name: "Vero Scan",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
      },
      isPartOf: {
        "@type": "Blog",
        name: "Vero Scan Insights",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Does “active” status mean my annual returns are up to date?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Not necessarily. The CAC marks persistent non-filers inactive, so “active” is a good sign, but it does not tell you which years were filed. A CAC Status Report or your filing acknowledgements confirm the history.",
          },
        },
        {
          "@type": "Question",
          name: "When is our annual return due?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The timing is tied to the annual general meeting, and small or exempt companies commonly work to a mid-year deadline. Practitioners read the rules differently and your first return depends on your incorporation date, so confirm your date with the CAC or your company secretary.",
          },
        },
        {
          "@type": "Question",
          name: "What happens if we have missed several years?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You file each missing year and pay the late-filing penalties. Until that is done the company risks inactive status and, eventually, strike-off, and some other filings become harder. Start with the oldest year.",
          },
        },
        {
          "@type": "Question",
          name: "Why do investors care about the register of members if we have a cap table?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Because the register, supported by filed returns of allotment, is the legal record of who owns the company. A cap table that does not match it is a promise, not title. Investors reconcile the two before they wire money.",
          },
        },
        {
          "@type": "Question",
          name: "Can Vero Scan see our filing history automatically?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Partly. Registration, status, directors, shareholders and PSC records come through licensed CAC data partners. No interface exposes annual returns by year, so filing history is confirmed from a status report or your acknowledgements, and the score marks it “verify” until then.",
          },
        },
        {
          "@type": "Question",
          name: "Does a SAFE need to be filed at the CAC?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A SAFE is a contract, not a share, so it does not appear on the register. When it converts, the resulting allotment must be authorised by resolution and filed like any other.",
          },
        },
      ],
    },
  ],
};

export default function CacAnnualReturnsArticle() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main>
        <ReadProgress />
        <ArticleHero />
        <ArticleIntro />
        <ArticleBody />
        <RelatedArticles />
        <ArticleCta />
      </main>
    </>
  );
}

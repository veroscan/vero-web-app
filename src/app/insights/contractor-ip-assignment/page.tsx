import "@/styles/blog.css";
import "@/styles/pages-c.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { ReadProgress } from "@/components/ui/ReadProgress";
import { ArticleHero } from "@/components/sections/articles/contractor-ip-assignment/ArticleHero";
import { ArticleIntro } from "@/components/sections/articles/contractor-ip-assignment/ArticleIntro";
import { ArticleBody } from "@/components/sections/articles/contractor-ip-assignment/ArticleBody";
import { RelatedArticles } from "@/components/sections/articles/contractor-ip-assignment/RelatedArticles";
import { ArticleCta } from "@/components/sections/articles/contractor-ip-assignment/ArticleCta";

export const metadata = pageMetadata({
  title: "Contractor IP assignment in Nigeria, the UK and the US | Vero Scan",
  description: "Paying a contractor does not make you the owner of the code they wrote. How copyright ownership works for contractors in Nigeria, the UK and the US, where assignments fail, and how to fix the gaps before due diligence.",
  article: { publishedTime: "2026-11-02", section: "IP ownership" },
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: "The contractor who built your product may still own it: IP assignment in Nigeria, the UK and the US",
      description: "Paying a contractor does not make you the owner of the code they wrote. How copyright ownership works for contractors in Nigeria, the UK and the US, where assignments fail, and how to fix the gaps before due diligence.",
      datePublished: "2026-11-02",
      dateModified: "2026-11-02",
      inLanguage: "en",
      articleSection: "IP ownership",
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
          name: "We paid the contractor in full. Don’t we own the code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Not automatically. Payment usually gives you, at most, an implied licence to use the work for the purpose it was commissioned. Ownership moves only by operation of law (for employees) or by a written assignment.",
          },
        },
        {
          "@type": "Question",
          name: "Is a work-for-hire clause enough in a US contract?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Usually not for software written by a contractor. Work made for hire only covers nine statutory categories, and most software falls outside them. Contracts normally pair the clause with a present assignment under 17 USC §204(a), and in California a work-for-hire clause can raise employment-status issues.",
          },
        },
        {
          "@type": "Question",
          name: "Our developer worked through an agency. Who needs to sign?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Whoever owns the rights. That is often the agency, which in turn needs assignments from its own staff or subcontractors. Ask for an assignment from the agency and evidence of its chain of title.",
          },
        },
        {
          "@type": "Question",
          name: "Can we fix a missing assignment after the code was written?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. A confirmatory assignment, signed now and expressly covering the earlier work, is the usual fix. It is much easier while the relationship is good, so do it before a fundraising timetable forces the conversation.",
          },
        },
        {
          "@type": "Question",
          name: "Do founders need to assign IP to their own company?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Code written before incorporation, or written by a founder outside any employment contract, belongs to the founder. Investors expect a founder IP assignment to the company, usually signed at or soon after incorporation.",
          },
        },
      ],
    },
  ],
};

export default function ContractorIpAssignmentArticle() {
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

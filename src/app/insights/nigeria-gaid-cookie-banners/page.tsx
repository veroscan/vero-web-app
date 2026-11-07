import "@/styles/blog.css";
import "@/styles/pages-c.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { ReadProgress } from "@/components/ui/ReadProgress";
import { ArticleHero } from "@/components/sections/articles/nigeria-gaid-cookie-banners/ArticleHero";
import { ArticleIntro } from "@/components/sections/articles/nigeria-gaid-cookie-banners/ArticleIntro";
import { ArticleBody } from "@/components/sections/articles/nigeria-gaid-cookie-banners/ArticleBody";
import { RelatedArticles } from "@/components/sections/articles/nigeria-gaid-cookie-banners/RelatedArticles";
import { ArticleCta } from "@/components/sections/articles/nigeria-gaid-cookie-banners/ArticleCta";

export const metadata = pageMetadata({
  title: "GAID 2025 cookie banners in Nigeria: Articles 7 and 19 | Vero Scan",
  description: "GAID 2025 changed what a lawful cookie banner looks like in Nigeria. Here is what Articles 7(1)(l) and 19 require, what the notice behind the banner must say, and a ten-point check you can run today.",
  article: { publishedTime: "2026-11-03", section: "Data protection" },
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      headline: "Your cookie banner is probably non-compliant in Nigeria: what GAID 2025 Articles 7 and 19 require",
      description: "GAID 2025 changed what a lawful cookie banner looks like in Nigeria. Here is what Articles 7(1)(l) and 19 require, what the notice behind the banner must say, and a ten-point check you can run today.",
      datePublished: "2026-11-03",
      dateModified: "2026-11-03",
      inLanguage: "en",
      articleSection: "Data protection",
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
          name: "Does GAID apply if my company is not incorporated in Nigeria?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It can. The NDPA is generally read as applying to anyone who processes personal data of people in Nigeria, wherever the company is based. If your product has Nigerian users, plan on meeting GAID’s notice and consent rules. Registration with the NDPC is a separate question. It depends on how many Nigerian data subjects you process in a six-month period and on your sector.",
          },
        },
        {
          "@type": "Question",
          name: "Is a bottom cookie bar ever acceptable in Nigeria?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Vero Scan’s Nigeria rule, reviewed by Code & Clause, treats a bottom bar as failing GAID Article 7(1)(l), because it does not obstruct the middle, left or right of the page. A centred modal or a side panel is the safer layout.",
          },
        },
        {
          "@type": "Question",
          name: "Do strictly necessary cookies need consent?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Cookies the site cannot work without, such as session, security and load-balancing cookies, are generally treated as outside the consent requirement. They should still be listed in the cookie notice. Analytics and advertising cookies need consent before they load.",
          },
        },
        {
          "@type": "Question",
          name: "What happens if we get it wrong?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The NDPC can issue compliance notices and impose fines under the NDPA, and it has shown it will act at scale: it issued 1,368 compliance notices in August 2025. There is also a commercial cost. Cookie behaviour is visible from outside, so investors and enterprise customers check it during due diligence.",
          },
        },
        {
          "@type": "Question",
          name: "How often should we re-test the banner?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Every time you add a tag, pixel or SDK, and at least once a quarter. Marketing tools are often added without anyone checking whether they respect the consent choice. Ongoing monitoring re-runs the check and flags changes.",
          },
        },
      ],
    },
  ],
};

export default function NigeriaGaidCookieBannersArticle() {
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

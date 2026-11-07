import "@/styles/scenes.css";
import "@/styles/pages-a.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { CoverageHero } from "@/components/sections/coverage/CoverageHero";
import { CoveragePanel } from "@/components/sections/coverage/CoveragePanel";
import { CountryRows } from "@/components/sections/coverage/CountryRows";
import { ScanChoices } from "@/components/sections/coverage/ScanChoices";
import { NextCountries } from "@/components/sections/coverage/NextCountries";
import { CoverageFaq } from "@/components/sections/coverage/CoverageFaq";
import { CoverageCta } from "@/components/sections/coverage/CoverageCta";

export const metadata = pageMetadata({
  title: "Coverage: Delaware, the United Kingdom and Nigeria | Vero Scan",
  description: "Vero Scan launches with Delaware, the United Kingdom and Nigeria, and reads each one the way its registers allow. Kenya, Ghana, South Africa, Germany and France are next.",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which countries does Vero Scan cover at launch?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Delaware, the United Kingdom and Nigeria. Kenya, Ghana, South Africa, Germany and France are next. You choose where the company is incorporated and where it works, and every finding is tagged to a country.",
      },
    },
    {
      "@type": "Question",
      name: "Why can&#8217;t Vero check Delaware live?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Delaware’s Division of Corporations does not allow automated access to its entity search, and your consent does not change that. So Vero uses the company record from a licensed provider, or the Certificate of Good Standing you upload, and shows it as certified on a date. It is never shown as live.",
      },
    },
    {
      "@type": "Question",
      name: "Does an Active status at the CAC mean our annual returns are filed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not on its own. Active is a useful sign, but no official source shows which years were filed. Vero says the company is active, and only says returns are current when a CAC status report confirms it.",
      },
    },
    {
      "@type": "Question",
      name: "Does Vero scrape registers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Where a register’s terms limit or forbid automated access, Vero uses a licensed provider or an official document you upload instead. Where an official source is open, such as Companies House, it reads it directly.",
      },
    },
    {
      "@type": "Question",
      name: "Can I ask for another country?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Each new country is added with its own rules and its own way of being checked. Tell us where you work and we will prioritise by demand. Join the waitlist and say where you are incorporated.",
      },
    },
  ],
};

export default function CoveragePage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main>
        <CoverageHero />
        <CoveragePanel />
        <CountryRows />
        <ScanChoices />
        <NextCountries />
        <CoverageFaq />
        <CoverageCta />
      </main>
    </>
  );
}

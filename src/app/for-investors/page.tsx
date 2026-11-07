import "@/styles/services.css";
import "@/styles/pages-b.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { InvestorsHero } from "@/components/sections/for-investors/InvestorsHero";
import { InvestorFeatures } from "@/components/sections/for-investors/InvestorFeatures";
import { SourceCheck } from "@/components/sections/for-investors/SourceCheck";
import { PublicBadge } from "@/components/sections/for-investors/PublicBadge";
import { Journey } from "@/components/sections/for-investors/Journey";
import { UsParentStack } from "@/components/sections/for-investors/UsParentStack";
import { InvestorFaq } from "@/components/sections/for-investors/InvestorFaq";
import { InvestorExamples } from "@/components/sections/for-investors/InvestorExamples";
import { InvestorsCta } from "@/components/sections/for-investors/InvestorsCta";

export const metadata = pageMetadata({
  title: "Vero Scan for investors: read a company before you back it",
  description: "See what an investor sees in Vero Scan: the public report page and badge, how each fact is known, how to use it in diligence, and the Delaware flip and cross-border points.",
  ogDescription: "A score out of 100, six areas and a named source for every fact. Read the report a company shares, then ask for the documents.",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What do I see when a company shares its report?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A public page with the score out of 100, the six areas, how many issues are open and what has been checked, with the date. The details of each issue stay private unless the company shares them.",
      },
    },
    {
      "@type": "Question",
      name: "Is the badge proof that a company is compliant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. It is a signal. It means the score is 80 or more, there are no urgent issues, and a Code & Clause lawyer has read the key documents in the last 12 months. It is not legal advice or full due diligence, and it shows what had been checked on the date of the report.",
      },
    },
    {
      "@type": "Question",
      name: "Can I scan a company without its help?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can get a first read from public data only. Anything that needs documents depends on the company sharing them. “Not found” is never proof that something does not exist.",
      },
    },
    {
      "@type": "Question",
      name: "How current is a report?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each report carries its date. UK records are read live from Companies House on the day. Nigerian records come from a licensed provider and Delaware from a dated certificate or a licensed provider. Those two are never shown as live.",
      },
    },
    {
      "@type": "Question",
      name: "Can I follow my portfolio in Vero Scan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not yet. Portfolio tools, such as watching your companies’ scores over time, are planned for later. They are not part of the first release.",
      },
    },
    {
      "@type": "Question",
      name: "What does it cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We have not published pricing yet. The first read is free. Paid plans add document reading and lawyer review. Join the waitlist and we will tell you when plans open.",
      },
    },
  ],
};

export default function ForInvestorsPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main className="pb">
        <InvestorsHero />
        <InvestorFeatures />
        <SourceCheck />
        <PublicBadge />
        <Journey />
        <UsParentStack />
        <InvestorFaq />
        <InvestorExamples />
        <InvestorsCta />
      </main>
    </>
  );
}

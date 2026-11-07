import "@/styles/work.css";
import "@/styles/scenes.css";
import "@/styles/pages-a.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { SampleHero } from "@/components/sections/sample-report/SampleHero";
import { ShortReport } from "@/components/sections/sample-report/ShortReport";
import { ExampleCompany } from "@/components/sections/sample-report/ExampleCompany";
import { Screens } from "@/components/sections/sample-report/Screens";
import { Modules } from "@/components/sections/sample-report/Modules";
import { Change } from "@/components/sections/sample-report/Change";
import { Process } from "@/components/sections/sample-report/Process";
import { SampleFaq } from "@/components/sections/sample-report/SampleFaq";
import { SampleCta } from "@/components/sections/sample-report/SampleCta";

export const metadata = pageMetadata({
  title: "Sample report: Kestrel Pay, an example company | Vero Scan",
  description: "See what a Vero Scan report looks like. An illustrative report for Kestrel Pay, a made-up company: the shared report, the list of fixes and one issue page. Nothing here is a real scan.",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Kestrel Pay a real company?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Kestrel Pay, its documents and every number on this page are made up to show what a report looks like. Nothing here comes from a scan of a real company, and there are no customers behind it.",
      },
    },
    {
      "@type": "Question",
      name: "How is the 72 worked out?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It is the weighted average of the six area scores, using the launch default weights: 20 per cent each for company foundations, intellectual property and compliance, 15 per cent each for contracts and AI and data, and 10 per cent for fundraising. The methodology shows the working.",
      },
    },
    {
      "@type": "Question",
      name: "Would Kestrel Pay earn the verified badge?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not as it stands. It needs a score of 80 or more, no urgent issue open and a lawyer review in the last 12 months. It is at 72, it has one urgent issue open, and a lawyer has read 3 of its 9 key documents.",
      },
    },
    {
      "@type": "Question",
      name: "Can I share a report like this?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can share a link that expires, or save a PDF. The details stay private unless you choose to share them. The report says what was checked and on what date, so a reader can see what it rests on.",
      },
    },
  ],
};

export default function SampleReportPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main className="cs">
        <SampleHero />
        <ShortReport />
        <ExampleCompany />
        <Screens />
        <Modules />
        <Change />
        <Process />
        <SampleFaq />
        <SampleCta />
      </main>
    </>
  );
}

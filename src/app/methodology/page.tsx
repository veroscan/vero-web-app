import "@/styles/scenes.css";
import "@/styles/pages-a.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { MethodologyHero } from "@/components/sections/methodology/MethodologyHero";
import { MethodologyStatement } from "@/components/sections/methodology/MethodologyStatement";
import { Layers } from "@/components/sections/methodology/Layers";
import { Findings } from "@/components/sections/methodology/Findings";
import { Weights } from "@/components/sections/methodology/Weights";
import { Sources } from "@/components/sections/methodology/Sources";
import { Verification } from "@/components/sections/methodology/Verification";
import { Limits } from "@/components/sections/methodology/Limits";
import { MethodologyFaq } from "@/components/sections/methodology/MethodologyFaq";
import { MethodologyCta } from "@/components/sections/methodology/MethodologyCta";

export const metadata = pageMetadata({
  title: "How the Vero Scan score works | Vero Scan",
  description: "The method behind the score: six areas, how findings are weighted, the weights and bands we start with, the six phrases that say where a fact came from, and what a score cannot tell you.",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does the score measure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Whether the legal basics a technology company needs are in place and in order: the company and its filings, who owns the IP, registrations and policies, contracts, fundraising documents, and how AI and personal data are handled. It is a signal built from facts. It is not a legal opinion.",
      },
    },
    {
      "@type": "Question",
      name: "How is the overall score calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each area’s score is the share of its applicable, weighted checks that pass. The overall score is the weighted average of the six areas. The weights and the 75 and 50 bands are launch defaults, and we will publish them in full before launch. Before you add documents, the score is shown as a range, because it rests on public records and your answers alone.",
      },
    },
    {
      "@type": "Question",
      name: "What is a rule pack, and why are versions recorded?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each country has a rule pack: its legal requirements written as rules, each with the law it comes from, what triggers it, what counts as evidence and what happens if it is missed. A Code & Clause lawyer approves a rule before it can change a score. Every score records the method and rule-pack versions it used, so when the law changes an old score stays explainable and a rescan shows what moved.",
      },
    },
    {
      "@type": "Question",
      name: "Can I share my score with investors?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Once your score is 80 or more, no urgent issue is open and a Code & Clause lawyer has read your key documents within the last 12 months, you can show the verified badge and share a public page. Before that you can share a report link, which says what has and has not been checked.",
      },
    },
    {
      "@type": "Question",
      name: "Is the score legal advice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The score is the diagnostic, not the treatment. It shows where the gaps are against the law as of November 2026. It does not replace a lawyer reviewing your transaction documents before a round closes or carrying out due diligence before an acquisition.",
      },
    },
  ],
};

export default function MethodologyPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main>
        <MethodologyHero />
        <MethodologyStatement />
        <Layers />
        <Findings />
        <Weights />
        <Sources />
        <Verification />
        <Limits />
        <MethodologyFaq />
        <MethodologyCta />
      </main>
    </>
  );
}

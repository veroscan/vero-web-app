import type { FaqItem } from "@/components/ui/FaqList";
import { FaqSection } from "@/components/ui/FaqSection";

const FAQ_ITEMS: readonly FaqItem[] = [
  { question: "What does the score measure?", answer: "Whether the legal basics a technology company needs are in place and in order: the company and its filings, who owns the IP, registrations and policies, contracts, fundraising documents, and how AI and personal data are handled. It is a signal built from facts. It is not a legal opinion.", open: true },
  { question: "How is the overall score calculated?", answer: "Each area’s score is the share of its applicable, weighted checks that pass. The overall score is the weighted average of the six areas. The weights and the 75 and 50 bands are launch defaults, and we will publish them in full before launch. Before you add documents, the score is shown as a range, because it rests on public records and your answers alone." },
  { question: "What is a rule pack, and why are versions recorded?", answer: "Each country has a rule pack: its legal requirements written as rules, each with the law it comes from, what triggers it, what counts as evidence and what happens if it is missed. A Code & Clause lawyer approves a rule before it can change a score. Every score records the method and rule-pack versions it used, so when the law changes an old score stays explainable and a rescan shows what moved." },
  { question: "Can I share my score with investors?", answer: "Yes. Once your score is 80 or more, no urgent issue is open and a Code & Clause lawyer has read your key documents within the last 12 months, you can show the verified badge and share a public page. Before that you can share a report link, which says what has and has not been checked." },
  { question: "Is the score legal advice?", answer: "No. The score is the diagnostic, not the treatment. It shows where the gaps are against the law as of November 2026. It does not replace a lawyer reviewing your transaction documents before a round closes or carrying out due diligence before an acquisition." },
];

export function MethodologyFaq() {
  return (
    <FaqSection
      eyebrow="Questions"
      heading="Questions about the method."
      note="Something we did not cover? Write to hello@codeclauselegal.com."
      action={{ label: "Ask us anything", href: "/contact" }}
      items={FAQ_ITEMS}
    />
  );
}

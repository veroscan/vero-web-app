import type { FaqItem } from "@/components/ui/FaqList";
import { FaqSection } from "@/components/ui/FaqSection";

const FAQ_ITEMS: readonly FaqItem[] = [
  { question: "Is Kestrel Pay a real company?", answer: "No. Kestrel Pay, its documents and every number on this page are made up to show what a report looks like. Nothing here comes from a scan of a real company, and there are no customers behind it.", open: true },
  {
    question: "How is the 72 worked out?",
    answer: (
      <>
        <p>
          It is the weighted average of the six area scores, using the launch default weights: 20 per cent
          each for company foundations, intellectual property and compliance, 15 per cent each for contracts
          and AI and data, and 10 per cent for fundraising.{" "}
          <a className="link" href="/methodology">The methodology</a>{" "}
          shows the working.
        </p>
      </>
    ),
  },
  { question: "Would Kestrel Pay earn the verified badge?", answer: "Not as it stands. It needs a score of 80 or more, no urgent issue open and a lawyer review in the last 12 months. It is at 72, it has one urgent issue open, and a lawyer has read 3 of its 9 key documents." },
  { question: "Can I share a report like this?", answer: "Yes. You can share a link that expires, or save a PDF. The details stay private unless you choose to share them. The report says what was checked and on what date, so a reader can see what it rests on." },
];

export function SampleFaq() {
  return (
    <FaqSection
      eyebrow="Questions"
      heading="About this example."
      note="Want to see a report on your own company? Join the waitlist."
      action={{ label: "Ask us anything", href: "/contact" }}
      items={FAQ_ITEMS}
    />
  );
}

import type { FaqItem } from "@/components/ui/FaqList";
import { FaqSection } from "@/components/ui/FaqSection";

const FAQ_ITEMS: readonly FaqItem[] = [
  { question: "What is Vero Scan?", answer: "Vero Scan is a legal health score for technology companies, built by Code & Clause, a cross-border technology law firm. It checks registry records, your documents and your product against the law of each country you work in, scores six areas out of 100, and shows you in plain English what is missing and how to fix it.", open: true },
  { question: "Is it legal advice?", answer: "No. Vero Scan is not legal advice and does not replace a lawyer reviewing your transaction documents. It shows you where the gaps are. The score is the diagnostic. A Code & Clause lawyer can help with the treatment." },
  { question: "Which countries does it cover?", answer: "Delaware, the United Kingdom and Nigeria at launch. Kenya, Ghana, South Africa, Germany and France are next. You choose where the company is incorporated and where it operates, and every finding is tagged to a country." },
  { question: "What does it cost?", answer: "We have not published pricing yet. The first read is free. Paid plans add document reading and lawyer review. Join the waitlist and we will tell you when plans open." },
  { question: "Where does the information come from?", answer: "From official registers, a licensed data provider, documents you upload, your own answers, and lawyers who read your documents. Each finding says which one it came from. When we cannot find something, we say we could not find it. That is never proof it does not exist." },
  { question: "Can investors scan a company?", answer: "Yes. An investor can scan a company they are considering, or follow the companies they have already backed. Where documents are needed, the company has to share them." },
];

export function Faq() {
  return (
    <FaqSection
      eyebrow="Questions"
      heading="Straight answers before you start."
      note="Something we did not cover? Write to hello@codeclauselegal.com."
      action={{ label: "Ask us anything", href: "/contact" }}
      items={FAQ_ITEMS}
    />
  );
}

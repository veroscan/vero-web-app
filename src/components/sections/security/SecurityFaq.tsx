import type { FaqItem } from "@/components/ui/FaqList";
import { FaqSection } from "@/components/ui/FaqSection";

const FAQ_ITEMS: readonly FaqItem[] = [
  { question: "Does Vero train AI on my documents?", answer: "No. Vero uses an AI model to read documents you upload, so it can suggest what a document is and pull out basic facts. Customer documents are not used to train AI models, and the AI provider acts as a sub-processor under a data processing agreement.", open: true },
  { question: "Who can open my documents?", answer: "You and your team. Code & Clause lawyers open a document only when you ask for a verification or help with a gap. That access is limited to the reviewing lawyer and recorded in the audit log. [Code & Clause to confirm its internal access policy.]" },
  { question: "Is Vero certified?", answer: "No certification is claimed. An independent penetration test is planned before launch. We will say here what has been done and what has not." },
  { question: "How long do you keep my data?", answer: "Registry data pulled for a scan is kept for a limited time and then reduced to facts with their source [period for Code & Clause to confirm]. Your documents stay until you delete them or close your account [retention schedule to confirm]." },
  { question: "How do I report a vulnerability or raise a data protection concern?", answer: "Write to hello@codeclauselegal.com. [Code & Clause to confirm response times, any formal disclosure policy and the data protection officer’s details.]" },
];

export function SecurityFaq() {
  return (
    <FaqSection
      eyebrow="Questions"
      heading="Questions about security."
      note="Something we did not cover? Write to hello@codeclauselegal.com."
      action={{ label: "Ask us anything", href: "/contact" }}
      items={FAQ_ITEMS}
    />
  );
}

import type { FaqItem } from "@/components/ui/FaqList";
import { FaqSection } from "@/components/ui/FaqSection";

const FAQ_ITEMS: readonly FaqItem[] = [
  { question: "What does the free first read include?", answer: "The first read uses public records and your own answers. It gives you a score as a range, such as 55 to 70, and your three biggest findings. Add your documents and you get an exact score, the full list of gaps and, on paid plans, a lawyer’s review. We have not published pricing yet.", open: true },
  { question: "Does software decide whether my documents are good enough?", answer: "No. Vero Scan uses software to read a document you upload, suggest what it is, and pull out basic facts such as the parties, dates, governing law and signatures. You confirm where it goes. Only a lawyer can say whether a document does what it should." },
  { question: "Can I connect Google Drive, Notion or my contract tools?", answer: "Not yet. For now you upload files. Connecting Google Drive and Notion is planned, and so are integrations with SpotDraft, DocuSign and Digify. We will say on this page when any of them goes live." },
  { question: "Is the report legal advice?", answer: "No. The score is the diagnostic, not the treatment. Vero Scan shows you where the gaps are against the law as of November 2026. It does not replace a lawyer reviewing your transaction documents. A Code & Clause lawyer can help you fix what the scan finds." },
];

export function ProductFaq() {
  return (
    <FaqSection
      eyebrow="Questions"
      heading="What people ask about the product."
      note="Something we did not cover? Write to hello@codeclauselegal.com."
      action={{ label: "Ask us anything", href: "/contact" }}
      items={FAQ_ITEMS}
    />
  );
}

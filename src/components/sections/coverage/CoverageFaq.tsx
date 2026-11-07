import type { FaqItem } from "@/components/ui/FaqList";
import { FaqSection } from "@/components/ui/FaqSection";

const FAQ_ITEMS: readonly FaqItem[] = [
  { question: "Which countries does Vero Scan cover at launch?", answer: "Delaware, the United Kingdom and Nigeria. Kenya, Ghana, South Africa, Germany and France are next. You choose where the company is incorporated and where it works, and every finding is tagged to a country.", open: true },
  { question: "Why can’t Vero check Delaware live?", answer: "Delaware’s Division of Corporations does not allow automated access to its entity search, and your consent does not change that. So Vero uses the company record from a licensed provider, or the Certificate of Good Standing you upload, and shows it as certified on a date. It is never shown as live." },
  { question: "Does an Active status at the CAC mean our annual returns are filed?", answer: "Not on its own. Active is a useful sign, but no official source shows which years were filed. Vero says the company is active, and only says returns are current when a CAC status report confirms it." },
  { question: "Does Vero scrape registers?", answer: "No. Where a register’s terms limit or forbid automated access, Vero uses a licensed provider or an official document you upload instead. Where an official source is open, such as Companies House, it reads it directly." },
  { question: "Can I ask for another country?", answer: "Yes. Each new country is added with its own rules and its own way of being checked. Tell us where you work and we will prioritise by demand. Join the waitlist and say where you are incorporated." },
];

export function CoverageFaq() {
  return (
    <FaqSection
      eyebrow="Questions"
      heading="Questions about coverage."
      note="Need a country we do not cover yet? Tell us."
      action={{ label: "Ask us anything", href: "/contact" }}
      items={FAQ_ITEMS}
    />
  );
}

import "@/styles/scenes.css";
import "@/styles/pages-a.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { SecurityHero } from "@/components/sections/security/SecurityHero";
import { SecurityIntro } from "@/components/sections/security/SecurityIntro";
import { DataRows } from "@/components/sections/security/DataRows";
import { SecurityStatus } from "@/components/sections/security/SecurityStatus";
import { SecurityFaq } from "@/components/sections/security/SecurityFaq";
import { SecurityCta } from "@/components/sections/security/SecurityCta";

export const metadata = pageMetadata({
  title: "Security and trust | Vero Scan",
  description: "How Vero Scan is built to protect your data: what it collects, how documents are stored and who can open them, how AI is used, your rights, and what is still planned or to be confirmed.",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does Vero train AI on my documents?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Vero uses an AI model to read documents you upload, so it can suggest what a document is and pull out basic facts. Customer documents are not used to train AI models, and the AI provider acts as a sub-processor under a data processing agreement.",
      },
    },
    {
      "@type": "Question",
      name: "Who can open my documents?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You and your team. Code & Clause lawyers open a document only when you ask for a verification or help with a gap. That access is limited to the reviewing lawyer and recorded in the audit log. [Code & Clause to confirm its internal access policy.]",
      },
    },
    {
      "@type": "Question",
      name: "Is Vero certified?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No certification is claimed. An independent penetration test is planned before launch. We will say here what has been done and what has not.",
      },
    },
    {
      "@type": "Question",
      name: "How long do you keep my data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Registry data pulled for a scan is kept for a limited time and then reduced to facts with their source [period for Code & Clause to confirm]. Your documents stay until you delete them or close your account [retention schedule to confirm].",
      },
    },
    {
      "@type": "Question",
      name: "How do I report a vulnerability or raise a data protection concern?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Write to hello@codeclauselegal.com. [Code & Clause to confirm response times, any formal disclosure policy and the data protection officer’s details.]",
      },
    },
  ],
};

export default function SecurityPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main>
        <SecurityHero />
        <SecurityIntro />
        <DataRows />
        <SecurityStatus />
        <SecurityFaq />
        <SecurityCta />
      </main>
    </>
  );
}

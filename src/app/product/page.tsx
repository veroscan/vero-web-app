import "@/styles/scenes.css";
import "@/styles/pages-a.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { ProductHero } from "@/components/sections/product/ProductHero";
import { ProductSteps } from "@/components/sections/product/ProductSteps";
import { ProductAreas } from "@/components/sections/product/ProductAreas";
import { ProductDocuments } from "@/components/sections/product/ProductDocuments";
import { ProductFaq } from "@/components/sections/product/ProductFaq";
import { ProductCta } from "@/components/sections/product/ProductCta";

export const metadata = pageMetadata({
  title: "The Vero Scan product: scan, score, report, act, verify | Vero Scan",
  description: "See what Vero Scan does. It reads the official registers, your website and your documents, scores six areas out of 100, lists what to fix in order and lets a Code & Clause lawyer confirm the documents that matter.",
  ogTitle: "The Vero Scan product | Vero Scan",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does the free first read include?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The first read uses public records and your own answers. It gives you a score as a range, such as 55 to 70, and your three biggest findings. Add your documents and you get an exact score, the full list of gaps and, on paid plans, a lawyer’s review. We have not published pricing yet.",
      },
    },
    {
      "@type": "Question",
      name: "Does software decide whether my documents are good enough?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Vero Scan uses software to read a document you upload, suggest what it is, and pull out basic facts such as the parties, dates, governing law and signatures. You confirm where it goes. Only a lawyer can say whether a document does what it should.",
      },
    },
    {
      "@type": "Question",
      name: "Can I connect Google Drive, Notion or my contract tools?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not yet. For now you upload files. Connecting Google Drive and Notion is planned, and so are integrations with SpotDraft, DocuSign and Digify. We will say on this page when any of them goes live.",
      },
    },
    {
      "@type": "Question",
      name: "Is the report legal advice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The score is the diagnostic, not the treatment. Vero Scan shows you where the gaps are against the law as of November 2026. It does not replace a lawyer reviewing your transaction documents. A Code & Clause lawyer can help you fix what the scan finds.",
      },
    },
  ],
};

export default function ProductPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main>
        <ProductHero />
        <ProductSteps />
        <ProductAreas />
        <ProductDocuments />
        <ProductFaq />
        <ProductCta />
      </main>
    </>
  );
}

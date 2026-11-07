import "@/styles/scenes.css";
import "@/styles/home.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { Hero } from "@/components/sections/home/Hero";
import { Statement } from "@/components/sections/home/Statement";
import { Serve } from "@/components/sections/home/Serve";
import { Areas } from "@/components/sections/home/Areas";
import { Sources } from "@/components/sections/home/Sources";
import { BothSides } from "@/components/sections/home/BothSides";
import { Marquee } from "@/components/sections/home/Marquee";
import { Coverage } from "@/components/sections/home/Coverage";
import { Faq } from "@/components/sections/home/Faq";
import { Cta } from "@/components/sections/home/Cta";

export const metadata = pageMetadata({
  title: "The legal health score for technology companies | Vero Scan",
  description: "Vero Scan checks your registry records, documents and product against the law in Delaware, the UK and Nigeria, then gives you a score out of 100 and a plan to fix what is missing.",
  ogDescription: "Know your legal health before your investors do. A score out of 100 and a plan to fix what is missing.",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Vero Scan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vero Scan is a legal health score for technology companies, built by Code & Clause, a cross-border technology law firm. It checks registry records, your documents and your product against the law of each country you work in, scores six areas out of 100, and shows you in plain English what is missing and how to fix it.",
      },
    },
    {
      "@type": "Question",
      name: "Is it legal advice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Vero Scan is not legal advice and does not replace a lawyer reviewing your transaction documents. It shows you where the gaps are. The score is the diagnostic. A Code & Clause lawyer can help with the treatment.",
      },
    },
    {
      "@type": "Question",
      name: "Which countries does it cover?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Delaware, the United Kingdom and Nigeria at launch. Kenya, Ghana, South Africa, Germany and France are next. You choose where the company is incorporated and where it operates, and every finding is tagged to a country.",
      },
    },
    {
      "@type": "Question",
      name: "What does it cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We have not published pricing yet. The first read is free. Paid plans add document reading and lawyer review. Join the waitlist and we will tell you when plans open.",
      },
    },
    {
      "@type": "Question",
      name: "Where does the information come from?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "From official registers, a licensed data provider, documents you upload, your own answers, and lawyers who read your documents. Each finding says which one it came from. When we cannot find something, we say we could not find it. That is never proof it does not exist.",
      },
    },
    {
      "@type": "Question",
      name: "Can investors scan a company?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. An investor can scan a company they are considering, or follow the companies they have already backed. Where documents are needed, the company has to share them.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main>
        <Hero />
        <Statement />
        <Serve />
        <Areas />
        <Sources />
        <BothSides />
        <Marquee />
        <Coverage />
        <Faq />
        <Cta />
      </main>
    </>
  );
}

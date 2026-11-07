import "@/styles/pages-b.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { AboutHero } from "@/components/sections/about/AboutHero";
import { LaunchStats } from "@/components/sections/about/LaunchStats";
import { Mission } from "@/components/sections/about/Mission";
import { WhyItMatters } from "@/components/sections/about/WhyItMatters";
import { HowItWorks } from "@/components/sections/about/HowItWorks";
import { Principles } from "@/components/sections/about/Principles";
import { Partners } from "@/components/sections/about/Partners";
import { ShortVersion } from "@/components/sections/about/ShortVersion";
import { AboutCta } from "@/components/sections/about/AboutCta";

export const metadata = pageMetadata({
  title: "About Vero Scan and Code & Clause | Vero Scan",
  description: "Vero Scan is built by Code & Clause, a cross-border technology law firm. Software reads the records and lawyers confirm the documents, so legal health becomes something you can see.",
  ogDescription: "Built by lawyers who think in product terms. Software finds the gaps and Code & Clause lawyers confirm the documents.",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Vero Scan and Code & Clause",
  about: {
    "@id": "#org",
  },
  isPartOf: {
    "@type": "WebSite",
    name: "Vero Scan",
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main className="pb">
        <AboutHero />
        <LaunchStats />
        <Mission />
        <WhyItMatters />
        <HowItWorks />
        <Principles />
        <Partners />
        <ShortVersion />
        <AboutCta />
      </main>
    </>
  );
}

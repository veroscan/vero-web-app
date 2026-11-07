import "@/styles/pages-b.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { FoundersHero } from "@/components/sections/for-founders/FoundersHero";
import { Situations } from "@/components/sections/for-founders/Situations";
import { SituationStories } from "@/components/sections/for-founders/SituationStories";
import { FoundersStatement } from "@/components/sections/for-founders/FoundersStatement";
import { FoundersCta } from "@/components/sections/for-founders/FoundersCta";

export const metadata = pageMetadata({
  title: "Vero Scan for founders: find the gap before investors do",
  description: "Raising, selling, hiring contractors, handling personal data, using AI or opening in another country: Vero Scan names the legal gap in plain English and the fix, before an investor’s lawyer finds it.",
  ogDescription: "The legal gap and the fix for six situations founders meet: raising, selling, contractors, personal data, AI and new countries.",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Vero Scan for founders",
  description: "Six situations founders meet, the legal gap in each and the fix, with Vero Scan.",
  isPartOf: {
    "@type": "WebSite",
    name: "Vero Scan",
  },
};

export default function ForFoundersPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main className="pb">
        <FoundersHero />
        <Situations />
        <SituationStories />
        <FoundersStatement />
        <FoundersCta />
      </main>
    </>
  );
}

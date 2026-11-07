import "@/styles/pages-c.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { TermsHero } from "@/components/sections/terms-of-service/TermsHero";
import { TermsText } from "@/components/sections/terms-of-service/TermsText";

export const metadata = pageMetadata({
  title: "Terms of service | Vero Scan",
  description: "Terms for using the Vero Scan website, joining the waitlist and requesting a demo. Draft for lawyer review.",
  indexing: "noindex",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Website and waitlist terms of use",
  inLanguage: "en",
  description: "Terms for using the Vero Scan website, joining the waitlist and requesting a demo. Draft for lawyer review.",
  publisher: {
    "@type": "Organization",
    name: "Code & Clause LTD",
    email: "hello@codeclauselegal.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Suite 191B Jide Oki Street, Off Ligali Ayorinde",
      addressLocality: "Victoria Island, Lagos",
      addressCountry: "NG",
    },
  },
};

export default function TermsOfServicePage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main className="legal">
        <TermsHero />
        <TermsText />
      </main>
    </>
  );
}

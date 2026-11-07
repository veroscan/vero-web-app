import "@/styles/pages-c.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { PrivacyHero } from "@/components/sections/privacy-policy/PrivacyHero";
import { PrivacyText } from "@/components/sections/privacy-policy/PrivacyText";

export const metadata = pageMetadata({
  title: "Privacy policy | Vero Scan",
  description: "How Code & Clause collects and uses personal data through the Vero Scan website, waitlist, demo requests and emails. Draft for lawyer review.",
  indexing: "noindex",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy policy",
  inLanguage: "en",
  description: "How Code & Clause collects and uses personal data through the Vero Scan website, waitlist, demo requests and emails. Draft for lawyer review.",
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

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main className="legal">
        <PrivacyHero />
        <PrivacyText />
      </main>
    </>
  );
}

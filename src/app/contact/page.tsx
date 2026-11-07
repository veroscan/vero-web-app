import "@/styles/contact.css";
import "@/styles/pages-b.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { ContactHero } from "@/components/sections/contact/ContactHero";
import { RequestDemo } from "@/components/sections/contact/RequestDemo";
import { LaunchUpdates } from "@/components/sections/contact/LaunchUpdates";

export const metadata = pageMetadata({
  title: "Contact and book a demo | Vero Scan",
  description: "Write to Code & Clause or book a Vero Scan demo. A demo shows a scan end to end: registry records, the six areas, the gap report, the fix list and lawyer verification.",
  ogDescription: "Book a Vero Scan demo or write to the Code & Clause team.",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact and book a demo | Vero Scan",
  about: {
    "@type": "SoftwareApplication",
    name: "Vero Scan",
  },
  isPartOf: {
    "@type": "WebSite",
    name: "Vero Scan",
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main className="pb">
        <ContactHero />
        <RequestDemo />
        <LaunchUpdates />
      </main>
    </>
  );
}

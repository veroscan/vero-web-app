import "@/styles/contact.css";
import "@/styles/pages-b.css";
import { JsonLd } from "@/components/ui/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { WaitlistHero } from "@/components/sections/waitlist/WaitlistHero";
import { WaitlistForm } from "@/components/sections/waitlist/WaitlistForm";
import { WaitlistWho } from "@/components/sections/waitlist/WaitlistWho";

export const metadata = pageMetadata({
  title: "Join the waitlist | Vero Scan",
  description: "Be among the first to run Vero Scan, the legal health score for technology companies. Join the waitlist for founders, investors, accelerators and advisers.",
  ogDescription: "Be among the first to run Vero Scan. We will email you when your place opens, with what to prepare and how to run your first scan.",
});

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Join the waitlist | Vero Scan",
  description: "Join the Vero Scan waitlist. Vero Scan is a product of Code & Clause LTD.",
  isPartOf: {
    "@type": "WebSite",
    name: "Vero Scan",
  },
};

export default function WaitlistPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <main className="pb">
        <WaitlistHero />
        <WaitlistForm />
        <WaitlistWho />
      </main>
    </>
  );
}

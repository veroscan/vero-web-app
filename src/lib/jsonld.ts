import { COMPANY } from "./site";

/** Any JSON-serialisable schema.org object. */
export type JsonLdValue = Readonly<Record<string, unknown>>;

/** Organisation, product and website entities included on every page. */
export const SITE_JSON_LD: JsonLdValue = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "#org",
      name: COMPANY.legalName,
      legalName: COMPANY.legalName,
      email: COMPANY.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: COMPANY.streetAddress,
        addressLocality: COMPANY.locality,
        addressCountry: COMPANY.country,
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "#product",
      name: COMPANY.productName,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "The legal health score for technology companies. Vero Scan checks registry records, documents and product against the law of each country a company works in and gives a score out of 100.",
      publisher: { "@id": "#org" },
    },
    { "@type": "WebSite", name: COMPANY.productName, inLanguage: "en", publisher: { "@id": "#org" } },
  ],
};

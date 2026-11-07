import { Eyebrow } from "@/components/ui/Eyebrow";

interface GlanceItem {
  readonly term: string;
  readonly detail: string;
}

const GLANCE_ITEMS: readonly GlanceItem[] = [
  { term: "Product", detail: "Vero Scan, the legal health score for technology companies" },
  {
    term: "Built by",
    detail: "Code & Clause LTD, trading as Code & Clause Legal, a cross-border technology law firm",
  },
  { term: "Office", detail: "Suite 191B Jide Oki Street, Off Ligali Ayorinde, Victoria Island, Lagos, Nigeria" },
  {
    term: "Launch coverage",
    detail: "Delaware, the United Kingdom and Nigeria. Kenya, Ghana, South Africa, Germany and France are next.",
  },
  {
    term: "What it is not",
    detail: "Not legal advice, and not a replacement for a lawyer reviewing your transaction documents",
  },
  {
    term: "Pricing",
    detail: "Not published yet. The first read is free. Paid plans add document reading and lawyer review.",
  },
  { term: "Company number and founding year", detail: "[To be added by Code & Clause]" },
];

export function ShortVersion() {
  return (
    <section className="pad-sm" aria-labelledby="glance-title">
      <div className="wrap u-display-grid-gap-32px">
        <div className="sec-head u-margin-bottom-0">
          <Eyebrow>Vero Scan at a glance</Eyebrow>
          <h2 className="h2" id="glance-title" data-split="">The short version.</h2>
        </div>
        <dl className="glance" data-reveal="">
          {GLANCE_ITEMS.map((item) => (
            <div key={item.term}>
              <dt>{item.term}</dt>
              <dd>{item.detail}</dd>
            </div>
          ))}
          <div>
            <dt>Contact</dt>
            <dd>
              <a className="text-link" href="mailto:hello@codeclauselegal.com">hello@codeclauselegal.com</a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

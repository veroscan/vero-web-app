import { Button } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/SectionHead";

interface CoverageCovListItem {
  readonly heading: string;
  readonly detail: string;
  readonly text: string;
  readonly covL: string;
}

const COVERAGE_COV_LIST_ITEMS: readonly CoverageCovListItem[] = [
  {
    heading: "Delaware",
    detail: "United States",
    text: "Company record from a dated, uploaded certificate or a licensed provider. It is never shown as live.",
    covL: "Company record · Registered agent · Franchise tax · US trademarks",
  },
  {
    heading: "United Kingdom",
    detail: "Companies House",
    text: "Read live from Companies House, with the date of the check and any filing that is overdue.",
    covL: "Company record · Filings · Directors · Website privacy and cookies",
  },
  {
    heading: "Nigeria",
    detail: "CAC and NDPC",
    text: "Company record through our licensed provider, and a search of the Nigeria Data Protection Commission list.",
    covL: "Company record · Directors · NDPC list · Website privacy and cookies",
  },
];

const COVERAGE_CHIPS: readonly string[] = [
  "Kenya",
  "Ghana",
  "South Africa",
  "Germany",
  "France",
];

export function Coverage() {
  return (
    <section className="pad" id="coverage" aria-labelledby="cov-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Coverage"
          title="Three places at launch. Five more next."
          id="cov-title"
          intro="Each country has its own registers, its own rules and its own way of being checked. Legal facts on this site are as of November 2026."
        />
        <ul className="cov-list">
          {COVERAGE_COV_LIST_ITEMS.map((item) => (
            <li key={item.heading} className="cov-row" data-reveal="">
              <div className="cov-n">
                <h3>{item.heading}</h3>
                <small>{item.detail}</small>
              </div>
              <p>{item.text}</p>
              <span className="cov-l">{item.covL}</span>
            </li>
          ))}
        </ul>
        <div className="cov-next" data-reveal="">
          <span>Next</span>
          <ul className="chips" aria-label="Countries planned next">
            {COVERAGE_CHIPS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <p className="u-margin-top-36px" data-reveal="">
          <Button variant="soft" href="/coverage">See coverage</Button>
        </p>
      </div>
    </section>
  );
}

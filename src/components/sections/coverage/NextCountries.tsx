import { SectionHead } from "@/components/ui/SectionHead";

const NEXT_CHIPS: readonly string[] = [
  "Kenya",
  "Ghana",
  "South Africa",
  "Germany",
  "France",
];

export function NextCountries() {
  return (
    <section className="pad-sm" id="next" aria-labelledby="next-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Next"
          title="Kenya, Ghana, South Africa, Germany and France."
          id="next-title"
          intro="These are planned, not live. Tell us where you work and we will prioritise by demand."
        />
        <ul className="chips pa-chips" aria-label="Countries planned next" data-reveal="">
          {NEXT_CHIPS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="small-print u-margin-top-28px" data-reveal="">
          Each new country is added with its own rules and its own way of being checked. We will say here when one
          goes live.
        </p>
      </div>
    </section>
  );
}

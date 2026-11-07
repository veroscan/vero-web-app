import { SectionHead } from "@/components/ui/SectionHead";

interface LimitsPaLimItem {
  readonly text: string;
  readonly heading: string;
  readonly text2: string;
}

const LIMITS_PA_LIMS: readonly LimitsPaLimItem[] = [
  {
    text: "01",
    heading: "It cannot say a document is legally sufficient.",
    text2: "Software reads that a document is there and pulls out basic facts such as parties, dates and governing law. Only a lawyer can say whether it does what it should.",
  },
  {
    text: "02",
    heading: "It cannot prove something does not exist.",
    text2: "“Not found” shows where we looked and on what date. It is never shown as proof of absence.",
  },
  {
    text: "03",
    heading: "It covers only what you selected.",
    text2: "Your score reflects the countries and rules in your scan, as the law stood on the date of the rule-pack version used. Legal facts on this site are as of November 2026.",
  },
  {
    text: "04",
    heading: "It is not legal advice.",
    text2: "It is not a full legal review and it is not due diligence. Those remain separate legal services from Code & Clause.",
  },
  {
    text: "05",
    heading: "It may change as the method does.",
    text2: "Weights, bands and the 80 for verification are launch defaults. Every score records the method and rule-pack versions it used, so a change never rewrites history without saying so.",
  },
];

export function Limits() {
  return (
    <section className="pad on-dark u-overflow-hidden" id="limits" aria-labelledby="limits-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Limits"
          title="What a score cannot tell you."
          id="limits-title"
          intro="A score is a signal, like a credit score. It tells you, and anyone you share it with, whether to look deeper."
        />
        <ol className="pa-lims">
          {LIMITS_PA_LIMS.map((item) => (
            <li key={item.text} className="pa-lim" data-reveal="">
              <span className="n">{item.text}</span>
              <h3>{item.heading}</h3>
              <p>{item.text2}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

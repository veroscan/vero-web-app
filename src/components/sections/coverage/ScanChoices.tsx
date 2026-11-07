import { Eyebrow } from "@/components/ui/Eyebrow";

interface PaSplitPaDefItem {
  readonly title: string;
  readonly text: string;
}

const PA_SPLIT_PA_DEFS: readonly PaSplitPaDefItem[] = [
  {
    title: "Where the company is incorporated",
    text: "One choice. It sets which register Vero reads and the company foundations checks.",
  },
  { title: "Where it works", text: "As many as apply. Each adds that country’s compliance and data rules." },
  {
    title: "Where its investors are",
    text: "As many as apply. They shape the fundraising checks, such as whether a SAFE works under the law of each country.",
  },
  {
    title: "Its sector",
    text: "Switches on the licences that apply in each country you chose, so a payments company in Nigeria meets different rules from one in the UK.",
  },
];

export function ScanChoices() {
  return (
    <section className="pad" aria-labelledby="sel-title">
      <div className="wrap pa-split">
        <div className="pa-copy">
          <Eyebrow>Your scan</Eyebrow>
          <h2 className="h2" id="sel-title" data-split="">Four choices shape your scan.</h2>
          <p className="muted">
            Every finding is tagged to a country and the law it comes from, so a gap reads “Nigeria: no data
            protection registration found”, never just “a compliance issue”.
          </p>
        </div>
        <ul className="pa-defs">
          {PA_SPLIT_PA_DEFS.map((item) => (
            <li key={item.title} className="pa-def pa-def-sel" data-reveal="">
              <b>{item.title}</b>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

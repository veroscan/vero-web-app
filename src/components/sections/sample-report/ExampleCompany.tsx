import { Eyebrow } from "@/components/ui/Eyebrow";

interface CsBeforeNeedItem {
  readonly heading: string;
  readonly text: string;
}

const CS_BEFORE_NEEDS: readonly CsBeforeNeedItem[] = [
  {
    heading: "Delaware parent",
    text: "Kestrel Pay Inc. is the parent company, with a registered agent and a franchise tax to pay.",
  },
  { heading: "UK subsidiary", text: "Kestrel Pay UK Ltd files at Companies House and has two directors." },
  {
    heading: "Nigerian subsidiary",
    text: "Kestrel Pay Nigeria Ltd is registered with the CAC and handles Nigerian customers’ data.",
  },
  {
    heading: "A seed investor",
    text: "A SAFE is signed, and a founder, a contractor and a cap table all need to line up with it.",
  },
];

export function ExampleCompany() {
  return (
    <section className="pad cs-before">
      <div className="wrap">
        <div className="sec-head">
          <Eyebrow>The example company</Eyebrow>
          <h2 className="h2" data-split="">A payments start-up in three countries.</h2>
          <p className="body-l">
            Kestrel Pay is a fictional company with a parent in Delaware, a UK subsidiary and a Nigerian
            subsidiary. Its details are invented to show the range of things a scan looks at.
          </p>
        </div>
        <div className="needs">
          {CS_BEFORE_NEEDS.map((item) => (
            <article key={item.heading} className="need" data-reveal="">
              <h3 className="h4">{item.heading}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

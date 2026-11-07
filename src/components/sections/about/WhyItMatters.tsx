import { Eyebrow } from "@/components/ui/Eyebrow";

const PB_WHY_PB_WHY_BODY_ITEMS: readonly string[] = [
  "A technology company usually knows its legal position only because a lawyer told it so at some point, or because it assumes everything is in order. The gaps tend to surface at the worst moment: in an investor’s due diligence, a large customer’s procurement review or a regulator’s letter.",
  "Investors face the same blind spot. They either pay for country-by-country legal due diligence, or they skip it and find the problems after the money has moved.",
  "Vero Scan makes legal health visible, in plain English, before that moment. It is a product of Code & Clause LTD, which advises technology companies whose products, teams and investors cross borders.",
];

export function WhyItMatters() {
  return (
    <section className="pad" aria-labelledby="why-title">
      <div className="wrap pb-why">
        <div className="pb-why-head">
          <Eyebrow data-reveal="">The problem</Eyebrow>
          <h2 className="h2" id="why-title" data-split="">
            Most companies assume their legal is clean until something goes wrong.
          </h2>
        </div>
        <div className="pb-why-body">
          {PB_WHY_PB_WHY_BODY_ITEMS.map((item) => (
            <p key={item} className="body-l" data-reveal="">{item}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

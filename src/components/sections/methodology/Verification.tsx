import { SectionHead } from "@/components/ui/SectionHead";

interface VerificationRingItem {
  readonly title: string;
  readonly heading: string;
  readonly text: string;
}

const VERIFICATION_RINGS: readonly VerificationRingItem[] = [
  {
    title: "1",
    heading: "A range",
    text: "The free first read. Public records and your answers give a range, such as 55 to 70, and your three biggest findings.",
  },
  {
    title: "2",
    heading: "An exact score",
    text: "Add your documents. Vero reads them and scores all six areas, and you get the full list of gaps.",
  },
  {
    title: "3",
    heading: "Verified",
    text: "A score of 80 or more, no urgent issue open, and a Code & Clause lawyer review in the last 12 months.",
  },
];

export function Verification() {
  return (
    <section className="pad-sm" id="verification" aria-labelledby="ver-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Confidence"
          title="From a range to a verified badge."
          id="ver-title"
          intro="How sure the score is depends on what Vero has been able to read."
        />
        <div className="rings" data-pa-in="">
          <div className="rings-line" data-draw="" aria-hidden="true">
            <i></i>
          </div>
          {VERIFICATION_RINGS.map((item) => (
            <div key={item.title} className="ring-item" data-reveal="">
              <span className="ring-num">
                <b>{item.title}</b>
              </span>
              <h3>{item.heading}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

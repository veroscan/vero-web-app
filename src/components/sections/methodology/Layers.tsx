import { SectionHead } from "@/components/ui/SectionHead";

interface LayersStepItem {
  readonly dot: string;
  readonly heading: string;
  readonly text: string;
  readonly paW: string;
}

const LAYERS_STEPS: readonly LayersStepItem[] = [
  {
    dot: "1",
    heading: "Company foundations",
    text: "Is the company real, active and in good standing?",
    paW: "Weight 20%",
  },
  { dot: "2", heading: "Intellectual property", text: "Who owns the code, brand and ideas?", paW: "Weight 20%" },
  { dot: "3", heading: "Compliance", text: "Data protection and the licences it needs.", paW: "Weight 20%" },
  { dot: "4", heading: "Contracts", text: "What it has promised customers, staff and suppliers.", paW: "Weight 15%" },
  { dot: "5", heading: "Fundraising", text: "Cap table, SAFEs and investor documents.", paW: "Weight 10%" },
  { dot: "6", heading: "AI and data", text: "How it uses AI and handles personal data.", paW: "Weight 15%" },
];

export function Layers() {
  return (
    <section className="pad-sm" id="layers" aria-labelledby="layers-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Six areas"
          title="The score has six parts."
          id="layers-title"
          intro="Each area has its own checks, its own score and its own list of fixes. The overall score is the weighted average of the six."
        />
        <ol className="steps steps--6">
          <li className="steps-line" data-draw="" aria-hidden="true">
            <i></i>
          </li>
          {LAYERS_STEPS.map((item) => (
            <li key={item.dot} className="step">
              <span className="dot">{item.dot}</span>
              <h4>{item.heading}</h4>
              <p>{item.text}</p>
              <small className="pa-w">{item.paW}</small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

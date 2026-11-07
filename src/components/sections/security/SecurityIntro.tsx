import { SectionHead } from "@/components/ui/SectionHead";

interface PaFeatItem {
  readonly text: string;
  readonly heading: string;
  readonly text2: string;
}

const PA_FEATS: readonly PaFeatItem[] = [
  {
    text: "01",
    heading: "Minimal by design",
    text2: "Company details, questionnaire answers, public registry facts and the documents you choose to share. Nothing you have not chosen.",
  },
  {
    text: "02",
    heading: "Encrypted and separated",
    text2: "Planned baseline: encryption in transit and at rest, role-based access, each organisation kept apart, and an audit log of who did what.",
  },
  {
    text: "03",
    heading: "People only with a reason",
    text2: "Code & Clause lawyers open your documents for the reviews you ask for. AI reads documents but never trains on them.",
  },
];

export function SecurityIntro() {
  return (
    <section className="pad" aria-labelledby="base-title">
      <div className="wrap">
        <SectionHead
          eyebrow="The baseline"
          title="Collected sparingly, kept protected."
          id="base-title"
          intro="Vero asks for what a scan needs and no more. This is the baseline the product is being built to."
        />
        <ol className="pa-feats">
          {PA_FEATS.map((item) => (
            <li key={item.text} className="pa-feat" data-reveal="">
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

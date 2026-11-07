import { SectionHead } from "@/components/ui/SectionHead";
import { cx } from "@/lib/cx";

const PB_DUO_COL_TICKS: readonly string[] = [
  "Reads official registers, or a licensed data provider where a register is not open",
  "Reads the privacy notice and cookie banner on your website",
  "Reads the documents you upload, and keeps them private to your team",
  "Scores six areas out of 100, with every finding tagged to a country and a source",
];

interface FxBarFxNavItem {
  readonly mark: string;
  readonly tone: string;
}

const FX_BAR_FX_NAV_ITEMS: readonly FxBarFxNavItem[] = [
  { mark: "Issues", tone: "" },
  { mark: "Documents", tone: "on" },
  { mark: "Deadlines", tone: "" },
];

interface FxBodyFxFlowItem {
  readonly title: string;
  readonly text: string;
  readonly detail: string;
}

const FX_BODY_FX_FLOW_ITEMS: readonly FxBodyFxFlowItem[] = [
  { title: "1", text: "Missing", detail: "Counts as a gap" },
  { title: "2", text: "You uploaded this and we read it", detail: "Software reads the signed PDF" },
  { title: "3", text: "A lawyer read this", detail: "Confirms it moves what it should" },
];

const PB_DUO_COL_TICKS_2: readonly string[] = [
  "Read your key documents and confirm they do what they should, not only that they exist",
  "Draft a missing document when you ask them to",
  "Talk through a fix that needs judgement",
  "Stand behind the badge: a lawyer review in the last 12 months is one of its three conditions",
];

export function HowItWorks() {
  return (
    <section className="pad-sm" aria-labelledby="duo-title">
      <div className="wrap">
        <SectionHead
          eyebrow="How lawyers and software work together"
          title="The software finds. The lawyers confirm."
          id="duo-title"
          intro="Software is fast and consistent at reading records. It cannot tell you whether a document does what it should. A lawyer can. Vero uses each for what it is good at, and says which one you are looking at."
        />
        <div className="pb-duo">
          <div className="pb-duo-col" data-reveal="">
            <h3>What the software does</h3>
            <ul className="ticks">
              {PB_DUO_COL_TICKS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <figure
            className="fx pb-duo-fx"
            data-fx="docs"
            role="img"
            aria-label="Example: one document moves from missing, to read by the software, to read by a lawyer"
            data-reveal="scale"
          >
            <div className="fx-win">
              <div className="fx-bar">
                <span className="fx-co">Kestrel Pay Inc.</span>
                <span className="fx-nav">
                  {FX_BAR_FX_NAV_ITEMS.map((item) => (
                    <i key={item.mark} className={cx(item.tone)}>{item.mark}</i>
                  ))}
                </span>
              </div>
              <div className="fx-body">
                <div className="fx-head">
                  <div>
                    <h4>IP assignment, lead developer</h4>
                    <p>Moves ownership of the code to the company</p>
                  </div>
                  <div className="fx-score">
                    <b className="fx-state">A lawyer read this</b>
                  </div>
                </div>
                <ol className="fx-flow" data-flow="">
                  {FX_BODY_FX_FLOW_ITEMS.map((item) => (
                    <li key={item.title} className="done">
                      <b>{item.title}</b>
                      <span>
                        {item.text}
                        <small>{item.detail}</small>
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="fx-ex">Example company and data</div>
              </div>
            </div>
          </figure>
          <div className="pb-duo-col" data-reveal="">
            <h3>What the lawyers do</h3>
            <ul className="ticks">
              {PB_DUO_COL_TICKS_2.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

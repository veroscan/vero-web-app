import { Eyebrow } from "@/components/ui/Eyebrow";
import { cssVars } from "@/lib/css";
import { cx } from "@/lib/cx";

interface WeightsOnItem {
  readonly text: string;
  readonly tone: string;
}

const WEIGHTS_ON_ITEMS: readonly WeightsOnItem[] = [
  { text: "Home", tone: "on" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

interface WeightsPaWtItem {
  readonly text: string;
  readonly title: string;
  readonly w: string;
}

const WEIGHTS_PA_WT_ITEMS: readonly WeightsPaWtItem[] = [
  { text: "Company foundations", title: "20%", w: "100%" },
  { text: "Intellectual property", title: "20%", w: "100%" },
  { text: "Compliance", title: "20%", w: "100%" },
  { text: "Contracts", title: "15%", w: "75%" },
  { text: "Fundraising", title: "10%", w: "50%" },
  { text: "AI and data", title: "15%", w: "75%" },
];

const WEIGHTS_PS_KEYS: readonly string[] = [
  "At risk, under 50",
  "Needs work, 50 to 74",
  "Healthy, 75+",
];

const WEIGHTS_TICKS: readonly string[] = [
  "75 or more is Healthy, 50 to 74 is Needs work, and under 50 is At risk",
  "An open urgent issue holds its area below 50",
  "Verification starts at 80, with no urgent issue open and a lawyer review in the last 12 months",
];

export function Weights() {
  return (
    <section className="pad on-dark u-overflow-hidden" id="weights" aria-labelledby="weights-title">
      <div className="wrap pa-split pa-split-r">
        <div className="pa-visual">
          <div className="mk-static">
            <div className="pa-win" data-pa="weights">
              <div className="pa-bar">
                <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                  <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                </svg>
                <nav aria-hidden="true">
                  {WEIGHTS_ON_ITEMS.map((item) => (
                    <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                  ))}
                </nav>
                <span className="who">Kestrel Pay Inc.</span>
              </div>
              <div className="pa-body">
                <p className="pa-h">Layer weights</p>
                <ul className="pa-wt">
                  {WEIGHTS_PA_WT_ITEMS.map((item) => (
                    <li key={item.text} className="t-none">
                      <span className="n">{item.text}</span>
                      <span className="m">
                        <i style={cssVars({ "--w": item.w })}></i>
                      </span>
                      <b>{item.title}</b>
                    </li>
                  ))}
                </ul>
                <p className="pa-h2">Bands</p>
                <div
                  className="ps-ruler"
                  role="img"
                  aria-label="75 or more is Healthy, 50 to 74 is Needs work, under 50 is At risk. Verification starts at 80."
                >
                  <span className="ps-goal">80 to get verified</span>
                  <div className="ps-track">
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>
                  <span className="ps-pin u-left-72pct"></span>
                  <div className="ps-keys">
                    {WEIGHTS_PS_KEYS.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="pa-ex">
                Launch defaults. They may change, and we will publish them in full before launch.
              </p>
            </div>
          </div>
        </div>
        <div className="pa-copy">
          <Eyebrow>Weights and bands</Eyebrow>
          <h2 className="h2" id="weights-title" data-split="">The starting weights, and what the bands mean.</h2>
          <p className="muted">
            Company foundations, intellectual property and compliance count 20 per cent each. Contracts and AI and
            data count 15 per cent each. Fundraising counts 10 per cent. If a whole area does not apply to a
            company, the weights of the others adjust so the score is not distorted.
          </p>
          <ul className="ticks">
            {WEIGHTS_TICKS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="small-print">
            These are launch defaults, not final. We will publish the full set before launch.
          </p>
        </div>
      </div>
    </section>
  );
}

import { Eyebrow } from "@/components/ui/Eyebrow";

interface PaPanelPaCtrieItem {
  readonly title: string;
  readonly detail: string;
  readonly text: string;
}

const PA_PANEL_PA_CTRIES: readonly PaPanelPaCtrieItem[] = [
  {
    title: "Delaware",
    detail: "United States",
    text: "A dated certificate you upload, or a licensed provider. Never shown as live.",
  },
  {
    title: "United Kingdom",
    detail: "Companies House",
    text: "Read live from Companies House, with the date and time of the check.",
  },
  {
    title: "Nigeria",
    detail: "CAC and NDPC",
    text: "The company record through a licensed provider, plus a search of the NDPC list.",
  },
];

const PA_PANEL_PA_CTRIES_2: readonly string[] = [
  "Kenya",
  "Ghana",
  "South Africa",
  "Germany",
  "France",
];

export function CoveragePanel() {
  return (
    <section className="pad-sm" aria-labelledby="panel-title">
      <div className="wrap">
        <div className="pa-panel on-dark" data-reveal="scale">
          <div className="pa-panel-head">
            <Eyebrow>Launch coverage</Eyebrow>
            <h2 id="panel-title">Three countries at launch. Five next.</h2>
            <p>
              Each country is read the way its registers allow. Legal facts on this site are as of November 2026.
            </p>
          </div>
          <ol className="pa-ctries">
            {PA_PANEL_PA_CTRIES.map((item) => (
              <li key={item.title} className="pa-ctry on" data-reveal="">
                <span className="n">
                  <b>{item.title}</b>
                  <small>{item.detail}</small>
                </span>
                <span className="h">{item.text}</span>
                <span className="s">At launch</span>
              </li>
            ))}
            {PA_PANEL_PA_CTRIES_2.map((item) => (
              <li key={item} className="pa-ctry off" data-reveal="">
                <span className="n">
                  <b>{item}</b>
                </span>
                <span className="h">Planned. Not covered yet.</span>
                <span className="s">Next</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

import { Eyebrow } from "@/components/ui/Eyebrow";
import { cx } from "@/lib/cx";

interface FindingsPaDefItem {
  readonly good: string;
  readonly text: string;
  readonly tone: string;
}

const FINDINGS_PA_DEFS: readonly FindingsPaDefItem[] = [
  { good: "Pass", text: "The item is in place.", tone: "good" },
  { good: "Gap", text: "The item is missing.", tone: "risk" },
  {
    good: "Defect",
    text: "It exists but has a problem, such as a privacy policy with no way to complain to the regulator.",
    tone: "watch",
  },
  {
    good: "Verify",
    text: "The evidence is incomplete. It is shown to you but left out of the score until it is confirmed. It does not count as a pass or a fail.",
    tone: "none",
  },
  {
    good: "Not applicable",
    text: "The rule does not apply to this company. It is left out, and the weights of the areas adjust if a whole area does not apply.",
    tone: "none",
  },
];

interface FindingsPaDefItem2 {
  readonly risk: string;
  readonly text: string;
  readonly emphasis: string;
  readonly tone: string;
}

const FINDINGS_PA_DEFS_2: readonly FindingsPaDefItem2[] = [
  {
    risk: "Urgent",
    text: "Counts most. While one is open, its area stays below 50, however much else passes.",
    emphasis: "Weight 10",
    tone: "risk",
  },
  {
    risk: "Important",
    text: "A real problem an investor or regulator would raise.",
    emphasis: "Weight 6",
    tone: "watch",
  },
  {
    risk: "Worth doing",
    text: "Good housekeeping. Fixing it helps, and leaving it rarely stops a deal.",
    emphasis: "Weight 3 or 1",
    tone: "none",
  },
];

interface FindingsOnItem {
  readonly text: string;
  readonly tone: string;
}

const FINDINGS_ON_ITEMS: readonly FindingsOnItem[] = [
  { text: "Home", tone: "on" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

interface FindingsPaWkItem {
  readonly text: string;
  readonly text2: string;
  readonly text3: string;
  readonly puSt: string;
  readonly tone: string;
  readonly tone2: string;
}

const FINDINGS_PA_WKS: readonly FindingsPaWkItem[] = [
  {
    text: "Lead developer has signed the code over",
    text2: "Urgent",
    text3: "10",
    puSt: "Gap",
    tone: "risk",
    tone2: "risk",
  },
  {
    text: "Founders have assigned their IP to the company",
    text2: "Important",
    text3: "6",
    puSt: "Pass",
    tone: "watch",
    tone2: "good",
  },
  {
    text: "Employee contracts include IP terms",
    text2: "Important",
    text3: "6",
    puSt: "Pass",
    tone: "watch",
    tone2: "good",
  },
  {
    text: "Brand trademarked in the US",
    text2: "Worth doing",
    text3: "3",
    puSt: "Pass",
    tone: "none",
    tone2: "good",
  },
  {
    text: "Brand trademarked in the UK",
    text2: "Worth doing",
    text3: "1",
    puSt: "Gap",
    tone: "none",
    tone2: "watch",
  },
];

export function Findings() {
  return (
    <section className="pad" id="findings" aria-labelledby="findings-title">
      <div className="wrap pa-split">
        <div className="pa-copy">
          <Eyebrow>Findings</Eyebrow>
          <h2 className="h2" id="findings-title" data-split="">Weighted by how serious, not by how many.</h2>
          <p className="muted">
            Every check ends in one of five outcomes. Its weight depends on how serious it is. An area’s score is
            the share of its applicable, weighted checks that pass.
          </p>
          <h3 className="pa-h3">Outcomes</h3>
          <ul className="pa-defs">
            {FINDINGS_PA_DEFS.map((item) => (
              <li key={item.good} className="pa-def">
                <b className={cx(item.tone)}>{item.good}</b>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <h3 className="pa-h3">Severity</h3>
          <ul className="pa-defs">
            {FINDINGS_PA_DEFS_2.map((item) => (
              <li key={item.risk} className="pa-def pa-def-w">
                <b className={cx(item.tone)}>{item.risk}</b>
                <span>{item.text}</span>
                <em>{item.emphasis}</em>
              </li>
            ))}
          </ul>
          <p className="small-print">The weights are launch defaults and may change.</p>
        </div>
        <div className="pa-visual">
          <div className="mk-static">
            <div className="pa-win" data-pa="worked">
              <div className="pa-bar">
                <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                  <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                </svg>
                <nav aria-hidden="true">
                  {FINDINGS_ON_ITEMS.map((item) => (
                    <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                  ))}
                </nav>
                <span className="who">Kestrel Pay Inc.</span>
              </div>
              <div className="pa-body">
                <p className="pa-h">How one area is scored</p>
                <p className="pa-sub">
                  Intellectual property at Kestrel Pay Inc. Made-up checks, launch-default weights.
                </p>
                <ul className="pa-wks">
                  {FINDINGS_PA_WKS.map((item) => (
                    <li key={item.text} className="pa-wk">
                      <span className="t">{item.text}</span>
                      <span className={cx("sv", item.tone)}>{item.text2}</span>
                      <span className="wt">{item.text3}</span>
                      <span className={cx("pu-st", item.tone2)}>{item.puSt}</span>
                    </li>
                  ))}
                  <li className="pa-wk is-out">
                    <span className="t">NDA with new partners (we haven’t seen a copy)</span>
                    <span className="sv none">Worth doing</span>
                    <span className="wt">–</span>
                    <span className="pu-st none">Verify</span>
                  </li>
                </ul>
                <div className="pa-calc">
                  <p className="c1">
                    <span>Passed weight 15 ÷ applicable weight 26</span>
                    <b className="v1">58</b>
                  </p>
                  <p className="c2">
                    <span>An urgent issue is open, so the area is held below 50</span>
                    <b className="v2 risk">49</b>
                  </p>
                </div>
              </div>
              <p className="pa-ex">Example company and made-up checks. Weights are launch defaults.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

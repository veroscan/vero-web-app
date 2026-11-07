import { Eyebrow } from "@/components/ui/Eyebrow";
import { LinkArrow } from "@/components/ui/LinkArrow";

const SV_CASE_COPY_TICKS: readonly string[] = [
  "A score of 80 or more",
  "No urgent issues open",
  "A Code & Clause lawyer review in the last 12 months",
];

interface FxBodyFxRowItem {
  readonly title: string;
  readonly fxSt: string;
  readonly c: string;
}

const FX_BODY_FX_ROWS: readonly FxBodyFxRowItem[] = [
  { title: "Score of 80 or more", fxSt: "You’re at 80", c: "0" },
  { title: "No urgent issues", fxSt: "None open", c: "1" },
  { title: "Lawyer review in the last 12 months", fxSt: "9 of 9 read", c: "2" },
];

export function PublicBadge() {
  return (
    <section className="pad-sm">
      <div className="wrap">
        <div className="sv-case">
          <div className="sv-case-copy">
            <Eyebrow>The badge</Eyebrow>
            <h2 className="h2" data-split="">A public page, and a badge that links to it.</h2>
            <p className="body-l">
              A company earns the badge when it meets all three conditions. Then it can put the badge on its
              website. You click it and land on the public page.
            </p>
            <ul className="ticks">
              {SV_CASE_COPY_TICKS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="small-print u-margin-0">
              The 80 mark and the other thresholds are launch defaults and may change.
            </p>
            <LinkArrow href="/sample-report">See the sample report</LinkArrow>
          </div>
          <figure
            className="fx pb-badge"
            data-fx="badge"
            role="img"
            aria-label="Example badge: Legal health verified, reviewed by Code and Clause, for Kestrel Pay Inc."
            data-reveal="scale"
          >
            <div className="fx-win">
              <div className="fx-seal">
                <svg viewBox="-4 -4 140 108" aria-hidden="true">
                  <path className="vtab" d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0Z" />
                  <path className="vfield" d="M97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                </svg>
                <div className="cap">
                  <div className="lock">
                    <strong>Not earned yet</strong>
                    <small>Kestrel Pay Inc.</small>
                  </div>
                  <div className="earned">
                    <strong>Legal health verified</strong>
                    <small>Reviewed by Code &amp; Clause</small>
                    <small>Kestrel Pay Inc.</small>
                  </div>
                </div>
              </div>
              <div className="fx-body">
                <div className="fx-rows">
                  {FX_BODY_FX_ROWS.map((item) => (
                    <div key={item.title} className="fx-row nobox cond">
                      <span className="t">
                        <b>{item.title}</b>
                      </span>
                      <span className="fx-st good" data-c={item.c}>{item.fxSt}</span>
                    </div>
                  ))}
                </div>
                <div className="fx-ex">Example company and data</div>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}

import { SectionHead } from "@/components/ui/SectionHead";
import { cssVars } from "@/lib/css";
import { cx } from "@/lib/cx";

const FX_BODY_FX_KEYS: readonly string[] = [
  "At risk",
  "Needs work",
  "Healthy",
];

interface FxBodyFxRowItem {
  readonly title: string;
  readonly fxSt: string;
  readonly tone: string;
}

const FX_BODY_FX_ROWS: readonly FxBodyFxRowItem[] = [
  { title: "Signed IP assignment from the lead developer", fxSt: "Missing", tone: "risk" },
  { title: "Signed IP assignment from the founders", fxSt: "Done", tone: "good" },
  { title: "Privacy notice names the AI you use", fxSt: "Missing", tone: "risk" },
];

interface FxBodyFxRowItem2 {
  readonly title: string;
  readonly detail: string;
  readonly fxSt: string;
  readonly tone: string;
}

const FX_BODY_FX_ROWS_2: readonly FxBodyFxRowItem2[] = [
  { title: "Founders’ IP assignment", detail: "A lawyer read this", fxSt: "Lawyer checked", tone: "good" },
  {
    title: "Employee agreement template",
    detail: "You uploaded this and we read it",
    fxSt: "We read it",
    tone: "watch",
  },
  { title: "Bylaws and stock ledger", detail: "A lawyer will check these agree", fxSt: "We read it", tone: "watch" },
];

interface FxBodyFxRowItem3 {
  readonly title: string;
  readonly detail: string;
}

const FX_BODY_FX_ROWS_3: readonly FxBodyFxRowItem3[] = [
  { title: "Proof of franchise tax needed", detail: "Delaware" },
  { title: "Confirmation statement is overdue", detail: "United Kingdom" },
  { title: "Not found on the NDPC list", detail: "Nigeria" },
];

interface FxBodyFxRowItem4 {
  readonly title: string;
  readonly fxSt: string;
  readonly tone: string;
}

const FX_BODY_FX_ROWS_4: readonly FxBodyFxRowItem4[] = [
  { title: "Checked with Companies House today", fxSt: "Live", tone: "good" },
  { title: "From our licensed data provider", fxSt: "Dated", tone: "good" },
  { title: "We couldn’t find it. That is not proof it is absent.", fxSt: "Not found", tone: "none" },
];

export function Principles() {
  return (
    <section className="pad principles-sec" aria-labelledby="pr-title">
      <div className="wrap">
        <SectionHead eyebrow="Principles" title="Six principles, in plain words." id="pr-title" />
        <div className="pstack">
          <article className="pcard" style={cssVars({ "--i": 0 })}>
            <div className="pcard-copy">
              <span className="pc-n">01 / 06</span>
              <h3>Legal health should be visible.</h3>
              <p>
                Today a company knows its legal position is clean because a lawyer said so, or assumes it is until
                something goes wrong. A score changes that. You can see it, track it and improve it.
              </p>
            </div>
            <div className="pv pv-ui" aria-hidden="true">
              <div className="fx-win fx-mini">
                <div className="fx-body">
                  <div className="fx-head">
                    <div>
                      <h4>Kestrel Pay’s legal health</h4>
                      <p>Example company</p>
                    </div>
                    <div className="fx-score">
                      <b>72</b>
                      <span className="watch">Needs work</span>
                    </div>
                  </div>
                  <div className="fx-track">
                    <i></i>
                    <i></i>
                    <i></i>
                    <span className="fx-pin u-left-72pct"></span>
                  </div>
                  <div className="fx-keys">
                    {FX_BODY_FX_KEYS.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
          <article className="pcard" style={cssVars({ "--i": 1 })}>
            <div className="pcard-copy">
              <span className="pc-n">02 / 06</span>
              <h3>Facts, not opinions.</h3>
              <p>
                A company either has IP assignments from its contractors or it does not. Its privacy policy either
                covers its real data flows or it does not. The scan establishes the facts, and the score reflects
                them.
              </p>
            </div>
            <div className="pv pv-ui" aria-hidden="true">
              <div className="fx-win fx-mini">
                <div className="fx-body">
                  <div className="fx-rows">
                    {FX_BODY_FX_ROWS.map((item) => (
                      <div key={item.title} className="fx-row nobox">
                        <span className="t">
                          <b>{item.title}</b>
                        </span>
                        <span className={cx("fx-st", item.tone)}>{item.fxSt}</span>
                      </div>
                    ))}
                  </div>
                  <div className="fx-ex">Example company and data</div>
                </div>
              </div>
            </div>
          </article>
          <article className="pcard" style={cssVars({ "--i": 2 })}>
            <div className="pcard-copy">
              <span className="pc-n">03 / 06</span>
              <h3>The score is the diagnosis. Code &amp; Clause is the treatment.</h3>
              <p>
                Most tools stop at the flag. Vero puts your fixes in order and gives each one a route to a Code
                &amp; Clause lawyer: have a document drafted, book a consultation or complete a registration. The
                firm that finds the gap can also close it.
              </p>
            </div>
            <div className="pv pv-ui" aria-hidden="true">
              <div className="fx-win fx-mini">
                <div className="fx-body">
                  <div className="fx-head">
                    <div>
                      <h4>Your lead developer hasn’t signed the code over</h4>
                      <p>Intellectual property</p>
                    </div>
                    <span className="fx-st risk">Urgent</span>
                  </div>
                  <div className="fx-actions">
                    <span className="fx-btn on">Have a lawyer draft it</span>
                    <span className="fx-btn">I already have it signed</span>
                  </div>
                  <div className="fx-ex">Example company and data</div>
                </div>
              </div>
            </div>
          </article>
          <article className="pcard" style={cssVars({ "--i": 3 })}>
            <div className="pcard-copy">
              <span className="pc-n">04 / 06</span>
              <h3>Lawyer-verified, not just flagged.</h3>
              <p>
                Software can tell you a document exists. It cannot tell you whether your SAFE’s conversion terms
                work with your shareholders’ agreement. A Code &amp; Clause lawyer reads what you hold and
                confirms whether it is enough, not only whether it is there.
              </p>
            </div>
            <div className="pv pv-ui" aria-hidden="true">
              <div className="fx-win fx-mini">
                <div className="fx-body">
                  <div className="fx-rows">
                    {FX_BODY_FX_ROWS_2.map((item) => (
                      <div key={item.title} className="fx-row nobox">
                        <span className="t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className={cx("fx-st", item.tone)}>{item.fxSt}</span>
                      </div>
                    ))}
                  </div>
                  <div className="fx-ex">Example company and data</div>
                </div>
              </div>
            </div>
          </article>
          <article className="pcard" style={cssVars({ "--i": 4 })}>
            <div className="pcard-copy">
              <span className="pc-n">05 / 06</span>
              <h3>Countries, not blocs.</h3>
              <p>
                Legal duties belong to countries. A rule that applies in the United Kingdom may not apply in
                Nigeria, and the registers are different too. Vero tags every gap to a country and the law behind
                it.
              </p>
            </div>
            <div className="pv pv-ui" aria-hidden="true">
              <div className="fx-win fx-mini">
                <div className="fx-body">
                  <div className="fx-rows">
                    {FX_BODY_FX_ROWS_3.map((item) => (
                      <div key={item.title} className="fx-row nobox">
                        <span className="t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className="fx-st watch">Important</span>
                      </div>
                    ))}
                  </div>
                  <div className="fx-ex">Example company and data</div>
                </div>
              </div>
            </div>
          </article>
          <article className="pcard" style={cssVars({ "--i": 5 })}>
            <div className="pcard-copy">
              <span className="pc-n">06 / 06</span>
              <h3>Honest by design.</h3>
              <p>
                Every finding says how it is known. We never use data from a source whose terms forbid automated
                access, and we label partial results as partial. “Not found” is never proof that something does
                not exist. Vero Scan is not legal advice and does not replace a lawyer reviewing your transaction
                documents.
              </p>
            </div>
            <div className="pv pv-ui" aria-hidden="true">
              <div className="fx-win fx-mini">
                <div className="fx-body">
                  <div className="fx-rows">
                    {FX_BODY_FX_ROWS_4.map((item) => (
                      <div key={item.title} className="fx-row nobox">
                        <span className="t">
                          <b>{item.title}</b>
                        </span>
                        <span className={cx("fx-st", item.tone)}>{item.fxSt}</span>
                      </div>
                    ))}
                  </div>
                  <div className="fx-ex">Example data</div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

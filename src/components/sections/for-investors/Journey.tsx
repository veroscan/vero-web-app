import { Eyebrow } from "@/components/ui/Eyebrow";
import { cssVars } from "@/lib/css";
import { cx } from "@/lib/cx";

interface ProcessFxRowItem {
  readonly title: string;
  readonly detail: string;
  readonly fxSt: string;
  readonly fxNum: string;
  readonly tone: string;
}

const PROCESS_FX_ROWS: readonly ProcessFxRowItem[] = [
  {
    title: "Intellectual property",
    detail: "Who owns the code, brand and ideas",
    fxSt: "At risk",
    fxNum: "49",
    tone: "risk",
  },
  {
    title: "Compliance",
    detail: "Data protection and the licences needed",
    fxSt: "Needs work",
    fxNum: "68",
    tone: "watch",
  },
  {
    title: "Fundraising",
    detail: "Cap table, SAFEs and investor documents",
    fxSt: "Needs work",
    fxNum: "74",
    tone: "watch",
  },
  { title: "AI and data", detail: "How the company uses and trains AI", fxSt: "Healthy", fxNum: "75", tone: "good" },
];

interface ProcessFxRowItem2 {
  readonly title: string;
  readonly detail: string;
}

const PROCESS_FX_ROWS_2: readonly ProcessFxRowItem2[] = [
  {
    title: "Delaware",
    detail: "Certificate of good standing, dated 12 October 2026. Kestrel Pay uploaded this and we read it.",
  },
  { title: "United Kingdom", detail: "Checked with Companies House today." },
  { title: "Nigeria", detail: "From our licensed data provider." },
];

interface ProcessFxRowItem3 {
  readonly title: string;
  readonly detail: string;
  readonly fxSt: string;
  readonly tone: string;
}

const PROCESS_FX_ROWS_3: readonly ProcessFxRowItem3[] = [
  {
    title: "IP assignment, lead developer",
    detail: "Moves ownership of the code to the company",
    fxSt: "Asked",
    tone: "watch",
  },
  { title: "SAFE, seed round", detail: "Terms for money that converts later", fxSt: "Request", tone: "none" },
  { title: "Delaware franchise tax receipt", detail: "Proof the tax is paid", fxSt: "Request", tone: "none" },
];

interface ProcessJyListItem {
  readonly jyN: string;
  readonly title: string;
  readonly text: string;
  readonly i: string;
}

const PROCESS_JY_LIST_ITEMS: readonly ProcessJyListItem[] = [
  {
    jyN: "01",
    title: "Open the link",
    text: "The company sends you a link to its report. It carries a date and expires, so you know how old it is.",
    i: "0",
  },
  {
    jyN: "02",
    title: "Read the score",
    text: "One number out of 100, then the six areas behind it and how many issues are still open.",
    i: "1",
  },
  {
    jyN: "03",
    title: "Check how each fact is known",
    text: "Every line names its source: the register, a licensed provider, a document read, or the company’s own word.",
    i: "2",
  },
  {
    jyN: "04",
    title: "Ask for documents",
    text: "Where you need more, you ask. The company chooses whether to share, and the details stay private until it does.",
    i: "3",
  },
];

export function Journey() {
  return (
    <section className="on-dark jy" id="process" data-journey="" style={cssVars({ "--n": 4 })}>
      <div className="jy-pin">
        <div className="wrap jy-grid">
          <div className="jy-left">
            <Eyebrow>In diligence</Eyebrow>
            <h2 className="h2">From a shared link to the documents you need.</h2>
            <div className="jy-stage">
              <div className="jy-count">
                <b className="jy-cur">01</b>
                <span>/ 04</span>
              </div>
              <div className="jy-scenes">
                <div className="jy-scene" data-i="0" aria-hidden="true">
                  <div className="fx-win fx-scene">
                    <div className="fx-bar">
                      <span className="fx-co">Message</span>
                      <span className="fx-nav">
                        <i>Inbox</i>
                      </span>
                    </div>
                    <div className="fx-body">
                      <div className="fx-head">
                        <div>
                          <h4>Kestrel Pay shared a report with you</h4>
                          <p>From the founders of Kestrel Pay Inc. (example)</p>
                        </div>
                      </div>
                      <div className="fx-rows">
                        <div className="fx-row nobox">
                          <span className="t">
                            <b>Report from 5 November 2026</b>
                            <small>Link expires in 30 days</small>
                          </span>
                          <span className="fx-st none">Shared</span>
                        </div>
                        <div className="fx-row nobox">
                          <span className="t">
                            <b>The details stay private</b>
                            <small>Unless Kestrel Pay shares them</small>
                          </span>
                          <span className="fx-st none">Private</span>
                        </div>
                      </div>
                      <div className="fx-actions">
                        <span className="fx-btn on">Open the report</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="jy-scene" data-i="1" aria-hidden="true">
                  <div className="fx-win fx-scene">
                    <div className="fx-bar">
                      <span className="fx-co">Kestrel Pay’s legal health</span>
                      <span className="fx-nav">
                        <i>Shared by Kestrel Pay</i>
                      </span>
                    </div>
                    <div className="fx-body">
                      <div className="fx-head">
                        <div>
                          <h4>12 issues still open</h4>
                          <p>Urgent 1 · Important 5 · Worth doing 6</p>
                        </div>
                        <div className="fx-score">
                          <b>72</b>
                          <span className="watch">Needs work</span>
                        </div>
                      </div>
                      <div className="fx-rows">
                        {PROCESS_FX_ROWS.map((item) => (
                          <div key={item.title} className="fx-row nobox fx-area" data-score={item.fxNum}>
                            <span className="t">
                              <b>{item.title}</b>
                              <small>{item.detail}</small>
                            </span>
                            <span className={cx("fx-st", item.tone)}>{item.fxSt}</span>
                            <span className="fx-num">{item.fxNum}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="jy-scene" data-i="2" aria-hidden="true">
                  <div className="fx-win fx-scene">
                    <div className="fx-bar">
                      <span className="fx-co">What’s been checked</span>
                      <span className="fx-nav">
                        <i>3 countries</i>
                      </span>
                    </div>
                    <div className="fx-body">
                      <div className="fx-rows">
                        {PROCESS_FX_ROWS_2.map((item) => (
                          <div key={item.title} className="fx-row nobox">
                            <span className="t">
                              <b>{item.title}</b>
                              <small>{item.detail}</small>
                            </span>
                            <span className="fx-st good">Checked</span>
                          </div>
                        ))}
                      </div>
                      <p className="fx-note">
                        A Code &amp; Clause lawyer has read 3 of the company’s 9 key documents.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="jy-scene" data-i="3" aria-hidden="true">
                  <div className="fx-win fx-scene">
                    <div className="fx-bar">
                      <span className="fx-co">Request documents</span>
                      <span className="fx-nav">
                        <i>Sent to Kestrel Pay</i>
                      </span>
                    </div>
                    <div className="fx-body">
                      <div className="fx-rows">
                        {PROCESS_FX_ROWS_3.map((item) => (
                          <div key={item.title} className="fx-row nobox">
                            <span className="t">
                              <b>{item.title}</b>
                              <small>{item.detail}</small>
                            </span>
                            <span className={cx("fx-st", item.tone)}>{item.fxSt}</span>
                          </div>
                        ))}
                      </div>
                      <p className="fx-note">
                        The company has to share the documents. Nothing is opened without its say.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="jy-bar">
                <i></i>
              </div>
            </div>
          </div>
          <ol className="jy-list">
            <li className="jy-rail" aria-hidden="true">
              <i></i>
            </li>
            {PROCESS_JY_LIST_ITEMS.map((item) => (
              <li key={item.jyN} className="jy-step" data-i={item.i}>
                <button type="button">
                  <span className="jy-n">{item.jyN}</span>
                  <span className="jy-t">
                    <b>{item.title}</b>
                    <span>{item.text}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

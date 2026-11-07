import { LinkArrow } from "@/components/ui/LinkArrow";
import { cssVars } from "@/lib/css";
import { cx } from "@/lib/cx";

const SCAN_TICKS: readonly string[] = [
  "Say where the company is incorporated, where it works and where its investors are",
  "Vero reads the official registers, your website’s privacy notice and cookie banner, and the documents you give it",
  "Every check says what it found and where it looked",
];

const SCAN_FIT_FOR_ITEMS: readonly string[] = [
  "Delaware",
  "United Kingdom",
  "Nigeria",
];

interface ScanPuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puSt: string;
  readonly tone: string;
  readonly working: string;
}

const SCAN_PU_ROWS: readonly ScanPuRowItem[] = [
  {
    title: "Delaware company record",
    detail: "Found, with a registered agent",
    puSt: "Done",
    tone: "good",
    working: "Reading the register",
  },
  {
    title: "US trademarks",
    detail: "One trademark filed",
    puSt: "Done",
    tone: "good",
    working: "Searching the US register",
  },
  {
    title: "Companies House, United Kingdom",
    detail: "Active, but a filing is overdue",
    puSt: "Found an issue",
    tone: "watch",
    working: "Live from Companies House",
  },
  {
    title: "Corporate Affairs Commission, Nigeria",
    detail: "Active, with two directors on record",
    puSt: "Done",
    tone: "good",
    working: "Through our licensed provider",
  },
  {
    title: "Your website’s privacy notice and cookies",
    detail: "Your cookie banner has no clear way to say no",
    puSt: "Found an issue",
    tone: "watch",
    working: "Reading kestrelpay.co",
  },
  {
    title: "Nigeria data protection register",
    detail: "We couldn’t find Kestrel Pay on the NDPC list",
    puSt: "Found an issue",
    tone: "watch",
    working: "Searching the NDPC list",
  },
];

const SCORE_TICKS: readonly string[] = [
  "A score out of 100, and a score for each of six areas",
  "An urgent issue keeps its area below 50 until it is fixed, so one big gap cannot hide behind many small passes",
  "75 or more is Healthy, 50 to 74 is Needs work, under 50 is At risk. Weights and bands are launch defaults and may change",
];

interface ScoreOnItem {
  readonly text: string;
  readonly tone: string;
}

const SCORE_ON_ITEMS: readonly ScoreOnItem[] = [
  { text: "Home", tone: "on" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

const SCORE_PS_KEYS: readonly string[] = [
  "At risk",
  "Needs work",
  "Healthy",
];

const REPORT_TICKS: readonly string[] = [
  "Plain English: what is missing, why it matters, what happens if you leave it, and the fix",
  "Each finding names its country and the law it comes from",
  "Share a link that expires, or save a PDF. The details stay private unless you share them",
];

interface ReportPuRowItem {
  readonly title: string;
  readonly detail: string;
}

const REPORT_PU_ROWS: readonly ReportPuRowItem[] = [
  {
    title: "Delaware",
    detail: "Certificate of good standing, dated 12 October 2026. Kestrel Pay uploaded this and we read it.",
  },
  { title: "United Kingdom", detail: "Checked with Companies House today." },
  { title: "Nigeria", detail: "Checked with the Corporate Affairs Commission (CAC) through a licensed provider." },
];

const ACT_TICKS: readonly string[] = [
  "Every issue is Urgent, Important or Worth doing, ranked by how serious it is and what waiting would cost",
  "Each fix shows how many points it adds, worked out from your own score",
  "Have a lawyer draft the document, upload one you already have, or talk to a lawyer first",
];

interface ActListItem {
  readonly text: string;
  readonly tone: string;
}

const ACT_LIST_ITEMS: readonly ActListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "on" },
  { text: "Documents", tone: "" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

const VERIFY_TICKS: readonly string[] = [
  "You need all three: a score of 80 or more, no urgent issues open, and a lawyer review in the last 12 months",
  "You get a public page and a badge for your website, both linking to what was checked",
  "Investors can open the page and check it for themselves",
];

interface VerifyPuRowItem {
  readonly title: string;
  readonly puSt: string;
  readonly tone: string;
}

const VERIFY_PU_ROWS: readonly VerifyPuRowItem[] = [
  { title: "Score of 80 or more", puSt: "You’re at 72", tone: "watch" },
  { title: "No urgent issues", puSt: "1 open", tone: "risk" },
  { title: "Lawyer review in the last 12 months", puSt: "3 of 9 read", tone: "watch" },
];

export function ProductSteps() {
  return (
    <section className="pad-sm pa-rows">
      <div className="wrap">
        <article className="svc-row" id="scan">
          <div className="svc-copy">
            <span className="idx" data-reveal="">01 / 05</span>
            <h2 className="h2" data-split="">Scan</h2>
            <p className="sub" data-reveal="">Tell Vero your company. It reads the rest.</p>
            <div data-reveal="">
              <ul className="ticks">
                {SCAN_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="fit-for">
              {SCAN_FIT_FOR_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div data-reveal="">
              <LinkArrow href="/methodology">See where each fact comes from</LinkArrow>
            </div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="pa-win" data-pa="scan">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <p className="pa-h">Scanning Kestrel Pay Inc.</p>
                  <div className="pa-prog" aria-hidden="true">
                    <i></i>
                  </div>
                  <p className="pa-count">
                    <b>6</b>{" "}
                    of 6 checks done
                  </p>
                  <ul className="pu-rows">
                    {SCAN_PU_ROWS.map((item) => (
                      <li
                        key={item.title}
                        className="pu-row"
                        data-working={item.working}
                        data-result={item.detail}
                        data-word={item.puSt}
                        data-tone={item.tone}
                      >
                        <span className="pu-t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className={cx("pu-st", item.tone)}>{item.puSt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="pa-ex">Example company and data</p>
              </div>
            </div>
          </div>
        </article>
        <article className="svc-row" id="score">
          <div className="svc-copy">
            <span className="idx" data-reveal="">02 / 05</span>
            <h2 className="h2" data-split="">Score</h2>
            <p className="sub" data-reveal="">One number, six areas behind it.</p>
            <div data-reveal="">
              <ul className="ticks">
                {SCORE_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div data-reveal="">
              <LinkArrow href="/methodology">How the score is worked out</LinkArrow>
            </div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="pa-win" data-pa="score">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {SCORE_ON_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <p className="pa-lead">Where Kestrel Pay stands</p>
                  <div className="pa-big">
                    <span className="num">72</span>
                    <span className="of">out of 100</span>
                    <b className="pu-st watch word">Needs work</b>
                  </div>
                  <div
                    className="ps-ruler"
                    role="img"
                    aria-label="A score of 72 sits in Needs work. Verification starts at 80."
                  >
                    <span className="ps-goal">80 to get verified</span>
                    <div className="ps-track">
                      <i></i>
                      <i></i>
                      <i></i>
                    </div>
                    <span className="ps-pin u-left-72pct"></span>
                    <div className="ps-keys">
                      {SCORE_PS_KEYS.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </div>
                  <ul className="pa-areas">
                    <li className="t-good" data-score="84">
                      <span className="n">Company foundations</span>
                      <span className="m">
                        <i style={cssVars({ "--w": "84%" })}></i>
                      </span>
                      <span className="pu-st good">Healthy</span>
                      <span className="num">84</span>
                    </li>
                    <li className="t-risk" data-score="49">
                      <span className="n">Intellectual property</span>
                      <span className="m">
                        <i style={cssVars({ "--w": "49%" })}></i>
                      </span>
                      <span className="pu-st risk">At risk</span>
                      <span className="num">49</span>
                    </li>
                    <li className="t-watch" data-score="68">
                      <span className="n">Compliance</span>
                      <span className="m">
                        <i style={cssVars({ "--w": "68%" })}></i>
                      </span>
                      <span className="pu-st watch">Needs work</span>
                      <span className="num">68</span>
                    </li>
                    <li className="t-good" data-score="86">
                      <span className="n">Contracts</span>
                      <span className="m">
                        <i style={cssVars({ "--w": "86%" })}></i>
                      </span>
                      <span className="pu-st good">Healthy</span>
                      <span className="num">86</span>
                    </li>
                    <li className="t-watch" data-score="74">
                      <span className="n">Fundraising</span>
                      <span className="m">
                        <i style={cssVars({ "--w": "74%" })}></i>
                      </span>
                      <span className="pu-st watch">Needs work</span>
                      <span className="num">74</span>
                    </li>
                    <li className="t-good" data-score="79">
                      <span className="n">AI and data</span>
                      <span className="m">
                        <i style={cssVars({ "--w": "79%" })}></i>
                      </span>
                      <span className="pu-st good">Healthy</span>
                      <span className="num">79</span>
                    </li>
                  </ul>
                </div>
                <p className="pa-ex">Example company and data</p>
              </div>
            </div>
          </div>
        </article>
        <article className="svc-row" id="report">
          <div className="svc-copy">
            <span className="idx" data-reveal="">03 / 05</span>
            <h2 className="h2" data-split="">Report</h2>
            <p className="sub" data-reveal="">A report anyone can read.</p>
            <div data-reveal="">
              <ul className="ticks">
                {REPORT_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div data-reveal="">
              <LinkArrow href="/sample-report">See a full sample report</LinkArrow>
            </div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="pa-win" data-pa="report">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <span className="who">Shared report</span>
                </div>
                <div className="pa-body">
                  <div className="pa-rep-top">
                    <div>
                      <p className="pa-h">Kestrel Pay Inc.</p>
                      <p className="pa-sub">Report from 5 November 2026. Link expires in 30 days.</p>
                    </div>
                  </div>
                  <div className="pa-big">
                    <span className="num">72</span>
                    <span className="of">out of 100</span>
                    <b className="pu-st watch word">Needs work</b>
                  </div>
                  <p className="pa-say">A solid legal base, with one urgent issue still open.</p>
                  <p className="pa-open">
                    <b>12 issues still open</b>
                    <span className="risk">
                      Urgent{" "}
                      <i>1</i>
                    </span>
                    <span className="watch">
                      Important{" "}
                      <i>5</i>
                    </span>
                    <span className="quiet">
                      Worth doing{" "}
                      <i>6</i>
                    </span>
                  </p>
                  <p className="pa-h2">What’s been checked</p>
                  <ul className="pu-rows pa-checks">
                    {REPORT_PU_ROWS.map((item) => (
                      <li key={item.title} className="pu-row">
                        <span className="pu-t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className="pu-st good">Checked</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pa-foot">
                    A Code &amp; Clause lawyer has read 3 of the company’s 9 key documents.
                  </p>
                </div>
                <p className="pa-ex">Example company and data</p>
              </div>
            </div>
          </div>
        </article>
        <article className="svc-row" id="act">
          <div className="svc-copy">
            <span className="idx" data-reveal="">04 / 05</span>
            <h2 className="h2" data-split="">Act</h2>
            <p className="sub" data-reveal="">A fix list, in the order we would do it.</p>
            <div data-reveal="">
              <ul className="ticks">
                {ACT_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div data-reveal="">
              <LinkArrow href="/methodology">Read how issues are ranked</LinkArrow>
            </div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="pa-win" data-pa="issue">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {ACT_LIST_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <p className="pa-kick">
                    <b className="risk">Urgent</b>
                    <span>Intellectual property</span>
                  </p>
                  <p className="pa-h pa-h-big">Your lead developer hasn’t signed the code over to Kestrel Pay</p>
                  <p className="pa-sub pa-why">
                    Without it, the developer may still own the code. Your company may not legally own the
                    technology it is selling.
                  </p>
                  <div className="pa-paper">
                    <p className="pa-sub">Contractor agreement, clause 9</p>
                    <p className="old">
                      <span>
                        The Contractor retains all right, title and interest in the Deliverables and grants the
                        Company a non-exclusive licence to use them.
                      </span>
                    </p>
                    <div className="new">
                      <p className="pa-fixlab">What it should say</p>
                      <p>
                        The Contractor assigns to the Company all right, title and interest in the Deliverables on
                        creation, including all intellectual property rights.
                      </p>
                    </div>
                  </div>
                  <div className="pa-fixbar">
                    <div className="pa-score">
                      <b className="num">72</b>
                      <span>out of 100</span>
                    </div>
                    <p className="pa-sub">This one fix takes you to about 80, the level for verification.</p>
                    <span className="pa-btn">Have a lawyer draft it</span>
                  </div>
                </div>
                <p className="pa-ex">Example company and data</p>
              </div>
            </div>
          </div>
        </article>
        <article className="svc-row" id="verify">
          <div className="svc-copy">
            <span className="idx" data-reveal="">05 / 05</span>
            <h2 className="h2" data-split="">Verify</h2>
            <p className="sub" data-reveal="">A lawyer reads it. Then you earn the badge.</p>
            <div data-reveal="">
              <ul className="ticks">
                {VERIFY_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div data-reveal="">
              <LinkArrow href="/methodology#verification">What counts toward verification</LinkArrow>
            </div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="ps ps-verify pa-vwrap" data-pa="%s">
                <div className="pu-win">
                  <div className="ps-seal">
                    <svg viewBox="-4 -4 140 108" aria-hidden="true">
                      <path className="vtab" d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0Z" />
                      <path className="vfield" d="M97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                    </svg>
                    <div className="cap u-display-grid">
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
                  <div className="ps-main">
                    <h4>Verified badge</h4>
                    <p className="need">You need all three.</p>
                    <ul className="pu-rows">
                      {VERIFY_PU_ROWS.map((item) => (
                        <li key={item.title} className="pu-row">
                          <span className="pu-t">
                            <b>{item.title}</b>
                          </span>
                          <span className={cx("pu-st", item.tone)}>{item.puSt}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="foot">
                      Fixing the urgent issue clears the second one and takes your score to about 80.
                    </p>
                  </div>
                </div>
                <p className="pa-ex pa-ex-out">Example company and data</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

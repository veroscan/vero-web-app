import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { cx } from "@/lib/cx";

const SCENE_0_PS_NOW_ITEMS: readonly string[] = [
  "Looking up your company on the Delaware register.",
  "Searching for trademarks in your name.",
  "Reading your record at Companies House.",
  "Asking the Corporate Affairs Commission in Nigeria.",
  "Reading the privacy notice on kestrelpay.co.",
  "Looking for you on Nigeria’s data protection register.",
  "That’s everything. Your first read is ready.",
];

interface Scene0PuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puSt: string;
  readonly tone: string;
  readonly working: string;
}

const SCENE_0_PU_ROWS: readonly Scene0PuRowItem[] = [
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

const SCENE_1_PS_KEYS: readonly string[] = [
  "At risk",
  "Needs work",
  "Healthy",
];

interface Scene1PuRowItem {
  readonly title: string;
  readonly puSt: string;
  readonly num: string;
  readonly tone: string;
}

const SCENE_1_PU_ROWS: readonly Scene1PuRowItem[] = [
  { title: "Company foundations", puSt: "Healthy", num: "84", tone: "good" },
  { title: "Intellectual property", puSt: "At risk", num: "49", tone: "risk" },
  { title: "Compliance", puSt: "Needs work", num: "68", tone: "watch" },
  { title: "Contracts", puSt: "Healthy", num: "86", tone: "good" },
  { title: "Fundraising", puSt: "Needs work", num: "74", tone: "watch" },
  { title: "AI and data", puSt: "Healthy", num: "79", tone: "good" },
];

interface Scene2PuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puPts: string;
  readonly points: string;
}

const SCENE_2_PU_ROWS: readonly Scene2PuRowItem[] = [
  {
    title: "Your UK confirmation statement is overdue",
    detail: "Company foundations · United Kingdom",
    puPts: "+3 points",
    points: "3",
  },
  {
    title: "You’re not registered with the Nigeria Data Protection Commission",
    detail: "Compliance · Nigeria",
    puPts: "+3 points",
    points: "3",
  },
  {
    title: "We need proof your Delaware franchise tax is paid",
    detail: "Company foundations · Delaware",
    puPts: "+2 points",
    points: "2",
  },
];

interface Scene3PuRowItem {
  readonly title: string;
  readonly puSt: string;
  readonly tone: string;
}

const SCENE_3_PU_ROWS: readonly Scene3PuRowItem[] = [
  { title: "Score of 80 or more", puSt: "You’re at 72", tone: "watch" },
  { title: "No urgent issues", puSt: "1 open", tone: "risk" },
  { title: "Lawyer review in the last 12 months", puSt: "3 of 9 read", tone: "watch" },
];

interface Scene3PuRowItem2 {
  readonly title: string;
  readonly detail: string;
}

const SCENE_3_PU_ROWS_2: readonly Scene3PuRowItem2[] = [
  { title: "A public page", detail: "A link you can send to anyone. It shows your score and what has been checked." },
  { title: "A badge for your website", detail: "It links straight to your public page." },
  { title: "Investors can check it", detail: "They open the page and see it for themselves." },
];

export function Serve() {
  return (
    <section className="serve" id="how" data-serve="" aria-labelledby="serve-title">
      <div className="wrap serve-grid">
        <div className="serve-side">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="h2" id="serve-title" data-split="">From company name to a score you can act on.</h2>
          <p className="muted u-margin-0">
            Four steps, shown on an example company. Pick one, or let them play. Every name and number here is
            illustrative.
          </p>
          <ul className="serve-tabs" role="tablist" aria-label="How Vero Scan works">
            <li>
              <button
                className="serve-tab"
                type="button"
                role="tab"
                aria-selected="true"
                aria-controls="scene-0"
                id="stab-0"
              >
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m20 20-4.2-4.2" />
                  </svg>
                </span>
                <b>Scan</b>
                <span className="d">Registers, website and documents, read for you</span>
                <span className="go" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
                <span className="bar">
                  <i></i>
                </span>
              </button>
            </li>
            <li>
              <button
                className="serve-tab"
                type="button"
                role="tab"
                aria-selected="false"
                aria-controls="scene-1"
                id="stab-1"
              >
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 17a8 8 0 0 1 16 0" />
                    <path d="m12 17 4-6" />
                  </svg>
                </span>
                <b>Score and report</b>
                <span className="d">One number, then plain English</span>
                <span className="go" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
                <span className="bar">
                  <i></i>
                </span>
              </button>
            </li>
            <li>
              <button
                className="serve-tab"
                type="button"
                role="tab"
                aria-selected="false"
                aria-controls="scene-2"
                id="stab-2"
              >
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m4 7 2 2 3-4M4 17l2 2 3-4M12 7h8M12 17h8" />
                  </svg>
                </span>
                <b>Act</b>
                <span className="d">A fix list, in the order to do it</span>
                <span className="go" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
                <span className="bar">
                  <i></i>
                </span>
              </button>
            </li>
            <li>
              <button
                className="serve-tab"
                type="button"
                role="tab"
                aria-selected="false"
                aria-controls="scene-3"
                id="stab-3"
              >
                <span className="ic">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <b>Verify</b>
                <span className="d">A lawyer reads it, then you earn the badge</span>
                <span className="go" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
                <span className="bar">
                  <i></i>
                </span>
              </button>
            </li>
          </ul>
          <div>
            <Button variant="soft" href="/product">See the product</Button>
          </div>
        </div>
        <div className="serve-stage">
          <article
            className="scene is-active"
            id="scene-0"
            data-scene="scan"
            data-time="12"
            role="tabpanel"
            aria-labelledby="stab-0"
          >
            <div className="scene-cap">
              <div>
                <h3>Scan</h3>
                <p>
                  Tell Vero your company and the countries you work in. It reads the official registers, your
                  website and the documents you give it.
                </p>
              </div>
              <span className="tagline">Example company</span>
            </div>
            <div className="scene-body ps ps-scan">
              <div className="pu-win">
                <div className="ps-side">
                  <div className="ps-gauge" aria-hidden="true">
                    <svg viewBox="0 0 132 100">
                      <defs>
                        <clipPath id="psV">
                          <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0Z" />
                          <path d="M97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                        </clipPath>
                      </defs>
                      <g clipPath="url(#psV)">
                        <rect className="field" width="132" height="100" />
                        <rect className="lvl" width="132" height="100" />
                      </g>
                    </svg>
                  </div>
                  <p className="ps-now" role="status">
                    {SCENE_0_PS_NOW_ITEMS.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </p>
                </div>
                <div className="ps-main">
                  <h4>Scanning Kestrel Pay Inc.</h4>
                  <p className="ps-count">
                    <b>6</b>{" "}
                    of 6 checks done
                  </p>
                  <ul className="pu-rows">
                    {SCENE_0_PU_ROWS.map((item) => (
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
              </div>
            </div>
          </article>
          <article
            className="scene"
            id="scene-1"
            data-scene="score"
            data-time="11"
            role="tabpanel"
            aria-labelledby="stab-1"
          >
            <div className="scene-cap">
              <div>
                <h3>Score and report</h3>
                <p>
                  One number out of 100, a score for each of six areas, and a report that says in plain English
                  what is missing and why it matters.
                </p>
              </div>
              <span className="tagline">Example company</span>
            </div>
            <div className="scene-body ps ps-score">
              <div className="pu-win">
                <p className="pu-lead">Kestrel Pay’s legal health</p>
                <div className="ps-big">
                  <span className="ps-num">72</span>
                  <span className="of">out of 100</span>
                  <b className="pu-st watch ps-word">Needs work</b>
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
                    {SCENE_1_PS_KEYS.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
                <h4>A solid base, with one problem an investor would stop at.</h4>
                <ul className="pu-rows">
                  {SCENE_1_PU_ROWS.map((item) => (
                    <li key={item.title} className="pu-row" data-score={item.num}>
                      <span className="pu-t">
                        <b>{item.title}</b>
                      </span>
                      <span className={cx("pu-st", item.tone)}>{item.puSt}</span>
                      <span className="num">{item.num}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
          <article
            className="scene"
            id="scene-2"
            data-scene="act"
            data-time="11"
            role="tabpanel"
            aria-labelledby="stab-2"
          >
            <div className="scene-cap">
              <div>
                <h3>Act</h3>
                <p>
                  Every gap becomes a fix, in the order we would do them. Tick what you plan to do and watch the
                  score move.
                </p>
              </div>
              <span className="tagline">Example company</span>
            </div>
            <div className="scene-body ps ps-act">
              <div className="pu-win">
                <div className="ps-hd">
                  <div>
                    <h4>12 things to fix</h4>
                  </div>
                  <div className="ps-sc">
                    <b>72</b>
                    <span className="watch">Needs work</span>
                  </div>
                </div>
                <div className="ps-ruler" role="img" aria-label="Score ruler">
                  <div className="ps-track">
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>
                  <span className="ps-pin u-left-72pct"></span>
                </div>
                <div className="grp">
                  <h5 className="risk">Urgent</h5>
                  <ul className="pu-rows">
                    <li className="fix" data-points="8">
                      <span className="box" aria-hidden="true"></span>
                      <span className="t">
                        <b>Your lead developer hasn’t signed the code over</b>
                        <small>Intellectual property · Delaware and Nigeria</small>
                      </span>
                      <span className="pu-pts">+8 points</span>
                    </li>
                  </ul>
                  <h5 className="watch">Important</h5>
                  <ul className="pu-rows">
                    {SCENE_2_PU_ROWS.map((item) => (
                      <li key={item.title} className="fix" data-points={item.points}>
                        <span className="box" aria-hidden="true"></span>
                        <span className="t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className="pu-pts">{item.puPts}</span>
                      </li>
                    ))}
                  </ul>
                  <h5 className="quiet">Worth doing</h5>
                  <ul className="pu-rows">
                    <li className="fix" data-points="1">
                      <span className="box" aria-hidden="true"></span>
                      <span className="t">
                        <b>Put the March vendor renewal date in your calendar</b>
                        <small>Contracts</small>
                      </span>
                      <span className="pu-pts">+1 point</span>
                    </li>
                    <li className="fix" data-points="1">
                      <span className="box" aria-hidden="true"></span>
                      <span className="t">
                        <b>Update your cap table, last changed five months ago</b>
                        <small>Fundraising</small>
                      </span>
                      <span className="pu-pts">+1 point</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </article>
          <article
            className="scene"
            id="scene-3"
            data-scene="verify"
            data-time="11"
            role="tabpanel"
            aria-labelledby="stab-3"
          >
            <div className="scene-cap">
              <div>
                <h3>Verify</h3>
                <p>
                  A Code &amp; Clause lawyer reads your documents and confirms they do what they should. Meet
                  three conditions and you earn a public badge.
                </p>
              </div>
              <span className="tagline">Example company</span>
            </div>
            <div className="scene-body ps ps-verify">
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
                    {SCENE_3_PU_ROWS.map((item) => (
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
                  <h5 className="get">What you get once you’ve earned it</h5>
                  <ul className="pu-rows">
                    {SCENE_3_PU_ROWS_2.map((item) => (
                      <li key={item.title} className="pu-row">
                        <span className="pu-t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

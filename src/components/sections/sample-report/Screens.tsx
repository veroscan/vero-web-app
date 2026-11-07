import { Eyebrow } from "@/components/ui/Eyebrow";
import { cssVars } from "@/lib/css";
import { cx } from "@/lib/cx";

interface StoryGridStoryStepItem {
  readonly stN: string;
  readonly heading: string;
  readonly text: string;
  readonly text2: string;
  readonly text3: string;
  readonly text4: string;
  readonly st: string;
}

const STORY_GRID_STORY_STEPS: readonly StoryGridStoryStepItem[] = [
  {
    stN: "01",
    heading: "The shared report",
    text: "One link, one score, six areas. It says what has been checked and on what date. The details stay private unless the company shares them.",
    text2: "Score",
    text3: "Six areas",
    text4: "What was checked",
    st: "0",
  },
  {
    stN: "02",
    heading: "The list of fixes",
    text: "Twelve issues, in the order we would do them. Urgent comes first, then Important, then Worth doing. Each shows how many points it adds. Tick what you plan to do and watch the score move.",
    text2: "Urgent",
    text3: "Important",
    text4: "Worth doing",
    st: "1",
  },
  {
    stN: "03",
    heading: "One issue, in plain English",
    text: "What is missing, why it matters, what happens if you leave it, and what the contract says next to what it should say. On the right, the next step and what it does to the score.",
    text2: "What is missing",
    text3: "The fix",
    text4: "How we know",
    st: "2",
  },
];

interface PaColPaCheckedItem {
  readonly text: string;
  readonly detail: string;
}

const PA_COL_PA_CHECKED_ITEMS: readonly PaColPaCheckedItem[] = [
  { text: "Delaware", detail: "Dated certificate, uploaded and read" },
  { text: "United Kingdom", detail: "Checked with Companies House today" },
  { text: "Nigeria", detail: "CAC, through a licensed provider" },
];

interface OneIssueInPlainListItem {
  readonly text: string;
  readonly tone: string;
}

const ONE_ISSUE_IN_PLAIN_LIST_ITEMS: readonly OneIssueInPlainListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "on" },
  { text: "Documents", tone: "" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

interface GrpPuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puPts: string;
  readonly points: string;
}

const GRP_PU_ROWS: readonly GrpPuRowItem[] = [
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

interface ThingsToFixListItem {
  readonly text: string;
  readonly tone: string;
}

const THINGS_TO_FIX_LIST_ITEMS: readonly ThingsToFixListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "on" },
  { text: "Documents", tone: "" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

interface DvUiDvDotItem {
  readonly tone: string;
  readonly go: string;
  readonly ariaLabel: string;
}

const DV_UI_DV_DOTS: readonly DvUiDvDotItem[] = [
  { tone: "is-on", go: "0", ariaLabel: "Go to step 1" },
  { tone: "", go: "1", ariaLabel: "Go to step 2" },
  { tone: "", go: "2", ariaLabel: "Go to step 3" },
];

export function Screens() {
  return (
    <section className="cs-story pad" data-story="">
      <div className="wrap">
        <div className="sec-head">
          <Eyebrow>Walkthrough</Eyebrow>
          <h2 className="h2" data-split="">Three screens, in the order a founder meets them.</h2>
          <p className="body-l">Scroll through the report. The highlight shows what to look at on each screen.</p>
        </div>
        <div className="story-grid story-grid--browser">
          <div className="story-steps">
            {STORY_GRID_STORY_STEPS.map((item) => (
              <article key={item.stN} className="st" data-st={item.st}>
                <span className="st-n">
                  {item.stN}
                  <i>/03</i>
                </span>
                <h3 className="h3">{item.heading}</h3>
                <p>{item.text}</p>
                <ul className="st-tags">
                  <li>{item.text2}</li>
                  <li>{item.text3}</li>
                  <li>{item.text4}</li>
                </ul>
              </article>
            ))}
          </div>
          <div className="story-dev">
            <div className="story-sticky">
              <div className="dv dv--browser">
                <div className="dv-screen">
                  <figure className="dv-shot is-on" data-shot="0">
                    <div className="pa-fitbox pa-fit-fill">
                      <div className="pa-win pa-wide" data-pa="report">
                        <div className="pa-bar">
                          <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                            <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                          </svg>
                          <span className="who">Shared report</span>
                        </div>
                        <div className="pa-body">
                          <div className="pa-two">
                            <div className="pa-col pa-col-l">
                              <p className="pa-h">Kestrel Pay Inc.</p>
                              <p className="pa-sub">Report from 5 November 2026. Link expires in 30 days.</p>
                              <div className="pa-big">
                                <span className="num">72</span>
                                <span className="of">out of 100</span>
                              </div>
                              <b className="pu-st watch word">Needs work</b>
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
                            </div>
                            <div className="pa-col pa-col-r">
                              <p className="pa-h2">The six areas</p>
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
                              <p className="pa-h2">What’s been checked</p>
                              <ul className="pa-checked">
                                {PA_COL_PA_CHECKED_ITEMS.map((item) => (
                                  <li key={item.text}>
                                    <span>
                                      {item.text}
                                      <small>{item.detail}</small>
                                    </span>
                                    <b className="good">Checked</b>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <p className="pa-ex">Example company and data. Nothing here is a real scan.</p>
                      </div>
                    </div>
                    <span className="dv-spot u-left-2pct-top-15pct-width-33pct-height-33pct">
                      <em>One number out of 100</em>
                    </span>
                  </figure>
                  <figure className="dv-shot" data-shot="1">
                    <div className="pa-fitbox pa-fit-fill">
                      <div className="pa-win pa-wide ps-act pa-issues" data-pa="issues">
                        <div className="pa-bar">
                          <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                            <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                          </svg>
                          <nav aria-hidden="true">
                            {ONE_ISSUE_IN_PLAIN_LIST_ITEMS.map((item) => (
                              <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                            ))}
                          </nav>
                          <span className="who">Kestrel Pay Inc.</span>
                        </div>
                        <div className="pa-body">
                          <div className="ps-hd">
                            <div>
                              <h4>12 things to fix</h4>
                              <p className="pa-sub">
                                In the order we’d do them. Tick what you plan to fix and watch your score move.
                              </p>
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
                              {GRP_PU_ROWS.map((item) => (
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
                                  <b>No UK data protection fee found</b>
                                  <small>Compliance · United Kingdom</small>
                                </span>
                                <span className="pu-pts">+1 point</span>
                              </li>
                              <li className="fix" data-points="1">
                                <span className="box" aria-hidden="true"></span>
                                <span className="t">
                                  <b>Your cookie banner has no clear way to say no</b>
                                  <small>Compliance · Nigeria and United Kingdom</small>
                                </span>
                                <span className="pu-pts">+1 point</span>
                              </li>
                            </ul>
                          </div>
                          <p className="pa-more">Six more are not shown here. 29 other checks passed.</p>
                        </div>
                        <p className="pa-ex">Example company and data</p>
                      </div>
                    </div>
                    <span className="dv-spot u-left-2pct-top-33pct-width-96pct-height-10pct">
                      <em>Urgent comes first</em>
                    </span>
                  </figure>
                  <figure className="dv-shot" data-shot="2">
                    <div className="pa-fitbox pa-fit-fill">
                      <div className="pa-win pa-wide" data-pa="issue">
                        <div className="pa-bar">
                          <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                            <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                          </svg>
                          <nav aria-hidden="true">
                            {THINGS_TO_FIX_LIST_ITEMS.map((item) => (
                              <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                            ))}
                          </nav>
                          <span className="who">Kestrel Pay Inc.</span>
                        </div>
                        <div className="pa-body">
                          <div className="pa-two pa-two-issue">
                            <div className="pa-col pa-col-l pa-issue-l">
                              <p className="pa-kick">
                                <b className="risk">Urgent</b>
                                <span>Intellectual property</span>
                              </p>
                              <p className="pa-h pa-h-big">
                                Your lead developer hasn’t signed the code over to Kestrel Pay
                              </p>
                              <p className="pa-h2">What’s missing</p>
                              <p className="pa-sub">
                                You don’t have a signed IP assignment from the developer who built your core
                                product between January 2023 and August 2024.
                              </p>
                              <p className="pa-h2">Why it matters</p>
                              <p className="pa-sub">
                                Without it, the developer may still own the code. Your company may not legally own
                                the technology it is selling.
                              </p>
                              <div className="pa-paper">
                                <p className="pa-sub">Contractor agreement, clause 9</p>
                                <p className="old">
                                  <span>
                                    The Contractor retains all right, title and interest in the Deliverables and
                                    grants the Company a non-exclusive licence to use them.
                                  </span>
                                </p>
                                <div className="new">
                                  <p className="pa-fixlab">What it should say</p>
                                  <p>
                                    The Contractor assigns to the Company all right, title and interest in the
                                    Deliverables on creation.
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="pa-col pa-col-r pa-fixpanel">
                              <p className="pa-h">Fix it</p>
                              <div className="pa-score">
                                <b className="num">72</b>
                                <span>out of 100</span>
                              </div>
                              <p className="pa-sub">
                                This one fix takes your score from 72 to about 80, the level for verification.
                              </p>
                              <ol className="pa-steps">
                                <li className="now">Draft</li>
                                <li>Sign</li>
                                <li>File</li>
                              </ol>
                              <span className="pa-btn">Have a lawyer draft it</span>
                              <span className="pa-btn pa-btn-line">I already have it signed</span>
                              <p className="pa-sub">Not sure? Talk to a Code &amp; Clause lawyer.</p>
                              <p className="pa-h2">How we know</p>
                              <p className="pa-sub">
                                We read the contractor agreement you uploaded on 12 October. You told us a
                                contractor built the core product.
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="pa-ex">Example company and data</p>
                      </div>
                    </div>
                    <span className="dv-spot u-left-60pct-top-14pct-width-38pct-height-56pct">
                      <em>The next step and what it does to your score</em>
                    </span>
                  </figure>
                </div>
              </div>
              <div className="dv-ui">
                <div className="dv-dots" role="group" aria-label="Walkthrough steps">
                  {DV_UI_DV_DOTS.map((item) => (
                    <button key={item.go} className={cx("dv-dot", item.tone)} type="button" data-go={item.go} aria-label={item.ariaLabel}></button>
                  ))}
                </div>
                <div className="dv-bar">
                  <i></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

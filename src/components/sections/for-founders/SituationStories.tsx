import { cx } from "@/lib/cx";

const RAISING_FIT_FOR_ITEMS: readonly string[] = [
  "Fundraising",
  "Intellectual property",
  "Delaware",
];

interface RaisingFxNavItem {
  readonly mark: string;
  readonly tone: string;
}

const RAISING_FX_NAV_ITEMS: readonly RaisingFxNavItem[] = [
  { mark: "Issues", tone: "" },
  { mark: "Documents", tone: "on" },
  { mark: "Deadlines", tone: "" },
];

interface RaisingFxRowItem {
  readonly title: string;
  readonly detail: string;
  readonly fxSt: string;
  readonly fxAct: string;
  readonly tone: string;
  readonly missing: string;
}

const RAISING_FX_ROWS: readonly RaisingFxRowItem[] = [
  {
    title: "Board consent for the round",
    detail: "Shows the board approved it",
    fxSt: "Lawyer checked",
    fxAct: "View",
    tone: "good",
    missing: "0",
  },
  {
    title: "Investor rights letter",
    detail: "What each investor is entitled to",
    fxSt: "You told us",
    fxAct: "Add proof",
    tone: "none",
    missing: "0",
  },
  {
    title: "83(b) election, one founder",
    detail: "Proof it was filed in time",
    fxSt: "Missing",
    fxAct: "Add",
    tone: "risk",
    missing: "1",
  },
  {
    title: "Shareholders’ agreement",
    detail: "How the owners agree to act together",
    fxSt: "Missing",
    fxAct: "Add",
    tone: "risk",
    missing: "1",
  },
];

const FUNDRAISING_LIST_ITEMS: readonly string[] = [
  "A SAFE that converts one way while the stock ledger says another",
  "Advisor equity promised by email and never recorded",
  "No 83(b) election on file for one founder",
];

const FUNDRAISING_LIST_ITEMS_2: readonly string[] = [
  "Cap table, SAFEs and stock ledger read side by side, with mismatches named",
  "Missing documents shown as empty slots, so nothing is a surprise",
  "A lawyer reads the ones that need judgement",
];

const SELLING_FIT_FOR_ITEMS: readonly string[] = [
  "Contracts",
  "Compliance",
  "United Kingdom",
  "Nigeria",
];

interface SellingFxNavItem {
  readonly mark: string;
  readonly tone: string;
}

const SELLING_FX_NAV_ITEMS: readonly SellingFxNavItem[] = [
  { mark: "Issues", tone: "on" },
  { mark: "Documents", tone: "" },
  { mark: "Deadlines", tone: "" },
];

interface SellingFxGrpItem {
  readonly title: string;
  readonly detail: string;
  readonly country: string;
}

const SELLING_FX_GRP_ITEMS: readonly SellingFxGrpItem[] = [
  {
    title: "No data processing agreement with your payment processor",
    detail: "Contracts · Nigeria",
    country: "Nigeria",
  },
  { title: "Two vendor contracts renew in March", detail: "Contracts", country: "" },
  {
    title: "Your cookie banner has no clear way to say no",
    detail: "Compliance · Nigeria and United Kingdom",
    country: "Nigeria United Kingdom",
  },
];

const THINGS_A_BUYER_WOULD_LIST_ITEMS: readonly string[] = [
  "Customer terms that nobody has read since they were written",
  "No data processing agreement with your payment processor",
  "Two vendor contracts that renew in March, noticed in April",
];

const THINGS_A_BUYER_WOULD_LIST_ITEMS_2: readonly string[] = [
  "Your standard terms read, not just stored",
  "Renewals and notice dates pulled out and put on one list",
  "Missing documents named, each with a route to get it drafted",
];

const CONTRACTORS_FIT_FOR_ITEMS: readonly string[] = [
  "Intellectual property",
  "Delaware",
  "United Kingdom",
  "Nigeria",
];

interface ContractorsFxNavItem {
  readonly mark: string;
  readonly tone: string;
}

const CONTRACTORS_FX_NAV_ITEMS: readonly ContractorsFxNavItem[] = [
  { mark: "Issues", tone: "on" },
  { mark: "Documents", tone: "" },
  { mark: "Deadlines", tone: "" },
];

interface ContractorsFxKvItem {
  readonly term: string;
  readonly detail: string;
}

const CONTRACTORS_FX_KV_ITEMS: readonly ContractorsFxKvItem[] = [
  {
    term: "What’s missing",
    detail: "You don’t have a signed IP assignment from the developer who built your core product between January 2023 and August 2024.",
  },
  {
    term: "Why it matters",
    detail: "Without it, the developer may still own the code. Your company may not legally own the technology it is selling.",
  },
  {
    term: "What happens if you leave it",
    detail: "It will be flagged in your first investor due diligence, and it has to be fixed before any round can close.",
  },
];

interface ContractorsFxStepItem {
  readonly title: string;
  readonly fxStep: string;
  readonly step: string;
}

const CONTRACTORS_FX_STEPS: readonly ContractorsFxStepItem[] = [
  { title: "1", fxStep: "Draft", step: "0" },
  { title: "2", fxStep: "Sign", step: "1" },
  { title: "3", fxStep: "File", step: "2" },
];

const YOUR_LEAD_DEVELOPER_HASN_LIST_ITEMS: readonly string[] = [
  "A lead developer who built the core product and never signed the code over",
  "Code written before the company existed, never transferred",
  "Open-source licences that nobody has listed",
];

const YOUR_LEAD_DEVELOPER_HASN_LIST_ITEMS_2: readonly string[] = [
  "The person, the period and the document that fixes it, all named",
  "A lawyer drafts the assignment, or you upload the signed one",
  "A lawyer reads it and confirms it moves what it should",
];

const DATA_FIT_FOR_ITEMS: readonly string[] = [
  "Compliance",
  "AI and data",
  "United Kingdom",
  "Nigeria",
];

interface DataFxNavItem {
  readonly mark: string;
  readonly tone: string;
}

const DATA_FX_NAV_ITEMS: readonly DataFxNavItem[] = [
  { mark: "Issues", tone: "on" },
  { mark: "Documents", tone: "" },
  { mark: "Deadlines", tone: "" },
];

interface DataFxKvItem {
  readonly term: string;
  readonly detail: string;
}

const DATA_FX_KV_ITEMS: readonly DataFxKvItem[] = [
  { term: "What’s missing", detail: "We couldn’t find Kestrel Pay on the NDPC list." },
  {
    term: "Why it matters",
    detail: "Nigeria requires some companies that handle personal data to register with the NDPC. If that includes Kestrel Pay, running without registration is a breach.",
  },
  {
    term: "What happens if you leave it",
    detail: "A Nigerian customer, bank or investor can check the list in a minute. If we are wrong, or you don’t need to register, tell us and we will update this.",
  },
];

interface DataFxStepItem {
  readonly title: string;
  readonly fxStep: string;
  readonly step: string;
}

const DATA_FX_STEPS: readonly DataFxStepItem[] = [
  { title: "1", fxStep: "Check", step: "0" },
  { title: "2", fxStep: "Register", step: "1" },
  { title: "3", fxStep: "Add proof", step: "2" },
];

const YOU_RE_NOT_REGISTERED_LIST_ITEMS: readonly string[] = [
  "A cookie banner with no clear way to say no",
  "No sign of your company on the regulator’s list",
  "A policy that still cites a law that has been replaced",
];

const YOU_RE_NOT_REGISTERED_LIST_ITEMS_2: readonly string[] = [
  "Your published notice and cookie banner read against local rules",
  "Regulator lists searched, with the date of the search",
  "“Not found” reported as not found, never as proof you are absent",
];

const AI_FIT_FOR_ITEMS: readonly string[] = [
  "AI and data",
  "Contracts",
  "United Kingdom",
  "Nigeria",
];

interface AiFxNavItem {
  readonly mark: string;
  readonly tone: string;
}

const AI_FX_NAV_ITEMS: readonly AiFxNavItem[] = [
  { mark: "Issues", tone: "" },
  { mark: "Documents", tone: "on" },
  { mark: "Deadlines", tone: "" },
];

const AI_AND_DATA_LIST_ITEMS: readonly string[] = [
  "AI use that is not mentioned in the privacy notice",
  "No written rules on how the team uses AI tools",
  "Customer data sent to a model provider with no data terms",
];

const AI_AND_DATA_LIST_ITEMS_2: readonly string[] = [
  "Each AI tool you use listed, with the documents that should exist",
  "Model agreements and data terms read for what they allow",
  "A simple AI use policy as a slot to fill, not a blank page",
];

const EXPANDING_FIT_FOR_ITEMS: readonly string[] = [
  "Company foundations",
  "Delaware",
  "United Kingdom",
  "Nigeria",
];

interface ExpandingFxNavItem {
  readonly mark: string;
  readonly tone: string;
}

const EXPANDING_FX_NAV_ITEMS: readonly ExpandingFxNavItem[] = [
  { mark: "Issues", tone: "on" },
  { mark: "Documents", tone: "" },
  { mark: "Deadlines", tone: "" },
];

interface ExpandingFxTabItem {
  readonly mark: string;
  readonly tone: string;
  readonly c: string;
}

const EXPANDING_FX_TABS: readonly ExpandingFxTabItem[] = [
  { mark: "All", tone: "on", c: "all" },
  { mark: "Delaware", tone: "", c: "Delaware" },
  { mark: "UK", tone: "", c: "United Kingdom" },
  { mark: "Nigeria", tone: "", c: "Nigeria" },
];

interface ExpandingFxGrpItem {
  readonly title: string;
  readonly detail: string;
  readonly fxPts: string;
  readonly points: string;
  readonly country: string;
}

const EXPANDING_FX_GRP_ITEMS: readonly ExpandingFxGrpItem[] = [
  {
    title: "We need proof your Delaware franchise tax is paid",
    detail: "Company foundations · Delaware",
    fxPts: "+2 points",
    points: "2",
    country: "Delaware",
  },
  {
    title: "Your UK confirmation statement is overdue",
    detail: "Company foundations · United Kingdom",
    fxPts: "+3 points",
    points: "3",
    country: "United Kingdom",
  },
  {
    title: "You’re not registered with the Nigeria Data Protection Commission",
    detail: "Compliance · Nigeria",
    fxPts: "+3 points",
    points: "3",
    country: "Nigeria",
  },
];

interface ExpandingFxGrpItem2 {
  readonly title: string;
  readonly detail: string;
  readonly country: string;
}

const EXPANDING_FX_GRP_ITEMS_2: readonly ExpandingFxGrpItem2[] = [
  {
    title: "Confirm your Nigerian annual returns are up to date",
    detail: "Company foundations · Nigeria",
    country: "Nigeria",
  },
  {
    title: "Your brand isn’t trademarked in the UK",
    detail: "Intellectual property · United Kingdom",
    country: "United Kingdom",
  },
  { title: "No UK data protection fee found", detail: "Compliance · United Kingdom", country: "United Kingdom" },
];

const THINGS_TO_FIX_BY_LIST_ITEMS: readonly string[] = [
  "A Delaware franchise tax receipt that nobody can find",
  "A UK confirmation statement that is overdue",
  "A Nigerian subsidiary paying its parent with no NOTAP check",
];

const THINGS_TO_FIX_BY_LIST_ITEMS_2: readonly string[] = [
  "Every finding names its country and the law behind it",
  "Filings and due dates for each country on one list",
  "Records read from the register where it allows, or from a dated certificate or licensed provider where it does not",
];

export function SituationStories() {
  return (
    <section className="pad-sm">
      <div className="wrap">
        <article className="story" id="raising">
          <div className="story-copy">
            <span className="idx" data-reveal="">01 / 06</span>
            <h2 className="h2" data-split="">You are raising money</h2>
            <p className="body-l" data-reveal="">
              A round rarely stalls on the pitch. It stalls in diligence, when an investor’s lawyer finds a SAFE
              that does not match the stock ledger, advisor shares nobody wrote down, or a founder with no 83(b)
              election on file. Each one costs time and leverage once there is a term sheet.
            </p>
            <div className="fit-for" data-reveal="">
              {RAISING_FIT_FOR_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p className="story-ref" data-reveal="">
              Want to see a whole report? Open the{" "}
              <a href="/sample-report">sample report</a>
              .
            </p>
          </div>
          <div className="story-visual">
            <div className="pb-mock" data-reveal="scale">
              <figure
                className="fx"
                data-fx="docs"
                role="img"
                aria-label="Example Documents screen for Kestrel Pay Inc., Fundraising: 4 of 6 documents in place, two missing."
              >
                <div className="fx-win">
                  <div className="fx-bar">
                    <span className="fx-co">Kestrel Pay Inc.</span>
                    <span className="fx-nav">
                      {RAISING_FX_NAV_ITEMS.map((item) => (
                        <i key={item.mark} className={cx(item.tone)}>{item.mark}</i>
                      ))}
                    </span>
                  </div>
                  <div className="fx-body">
                    <div className="fx-head">
                      <div>
                        <h4>Fundraising</h4>
                        <p>
                          <span data-fx-count="">4</span>{" "}
                          of 6 in place
                        </p>
                      </div>
                      <div className="fx-score">
                        <b className="fx-big" data-fx-n="">4</b>
                        <span>of 6 documents</span>
                      </div>
                    </div>
                    <div className="fx-meter" aria-hidden="true">
                      <i className="u-width-67pct" data-fx-bar=""></i>
                    </div>
                    <div className="fx-rows">
                      <div className="fx-row doc" data-missing="0">
                        <span className="t">
                          <b>Cap table</b>
                          <small>Who owns what, round by round</small>
                          <small className="note">Last changed five months ago.</small>
                        </span>
                        <span className="fx-st watch" data-fx-st="">We read it</span>
                        <span className="fx-act">View</span>
                      </div>
                      <div className="fx-row doc" data-missing="0">
                        <span className="t">
                          <b>SAFE, seed round</b>
                          <small>Terms for money that converts later</small>
                          <small className="note">It doesn’t match your stock ledger. See the issue.</small>
                        </span>
                        <span className="fx-st watch" data-fx-st="">We read it</span>
                        <span className="fx-act">View</span>
                      </div>
                      {RAISING_FX_ROWS.map((item) => (
                        <div key={item.title} className="fx-row doc" data-missing={item.missing}>
                          <span className="t">
                            <b>{item.title}</b>
                            <small>{item.detail}</small>
                          </span>
                          <span className={cx("fx-st", item.tone)} data-fx-st="">{item.fxSt}</span>
                          <span className="fx-act">{item.fxAct}</span>
                        </div>
                      ))}
                    </div>
                    <div className="fx-ex">Example company and data</div>
                  </div>
                </div>
              </figure>
            </div>
            <div className="flow" data-reveal="">
              <div className="flow-card">
                <small>The gap</small>
                <ul>
                  {FUNDRAISING_LIST_ITEMS.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 3h9l3 3v15H6z" />
                        <path d="M9 9h6M9 13h6M9 17h4" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flow-arrow" aria-hidden="true">
                <span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
              <div className="flow-card after">
                <small>The fix</small>
                <ul>
                  {FUNDRAISING_LIST_ITEMS_2.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8 12 3 3 5-6" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </article>
        <article className="story" id="selling">
          <div className="story-copy">
            <span className="idx" data-reveal="">02 / 06</span>
            <h2 className="h2" data-split="">You are selling to a large customer, or selling the company</h2>
            <p className="body-l" data-reveal="">
              Large customers send questionnaires. Buyers’ lawyers ask for every contract. Both are checking the
              same thing: that your promises and your paperwork agree. Vero Scan reads your standard terms and
              vendor contracts before they do.
            </p>
            <div className="fit-for" data-reveal="">
              {SELLING_FIT_FOR_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p className="story-ref" data-reveal="">
              Buyers and investors read the same facts. See{" "}
              <a href="/for-investors">what an investor sees</a>
              .
            </p>
          </div>
          <div className="story-visual">
            <div className="pb-mock" data-reveal="scale">
              <figure
                className="fx"
                data-fx="issues"
                role="img"
                aria-label="Example Issues screen for Kestrel Pay Inc.: one important and three worth-doing contract and compliance fixes."
              >
                <div className="fx-win">
                  <div className="fx-bar">
                    <span className="fx-co">Kestrel Pay Inc.</span>
                    <span className="fx-nav">
                      {SELLING_FX_NAV_ITEMS.map((item) => (
                        <i key={item.mark} className={cx(item.tone)}>{item.mark}</i>
                      ))}
                    </span>
                  </div>
                  <div className="fx-body">
                    <div className="fx-head">
                      <div>
                        <h4 data-fx-title="">4 things a buyer would ask about</h4>
                        <p>Showing Contracts and Compliance</p>
                      </div>
                      <div className="fx-score">
                        <b data-fx-score="">72</b>
                        <span className="watch" data-fx-word="">Needs work</span>
                      </div>
                    </div>
                    <div className="fx-track" aria-hidden="true">
                      <i></i>
                      <i></i>
                      <i></i>
                      <span className="fx-pin u-left-72pct" data-fx-pin=""></span>
                    </div>
                    <div className="fx-grp">
                      <h5 className="watch">Important</h5>
                      <div className="fx-row" data-points="3" data-country="Nigeria United Kingdom">
                        <span className="box" aria-hidden="true"></span>
                        <span className="t">
                          <b>Your customer terms have no data protection clause</b>
                          <small>Contracts · Nigeria and United Kingdom</small>
                        </span>
                        <span className="fx-pts">+3 points</span>
                      </div>
                    </div>
                    <div className="fx-grp">
                      <h5 className="none">Worth doing</h5>
                      {SELLING_FX_GRP_ITEMS.map((item) => (
                        <div key={item.title} className="fx-row" data-points="1" data-country={item.country}>
                          <span className="box" aria-hidden="true"></span>
                          <span className="t">
                            <b>{item.title}</b>
                            <small>{item.detail}</small>
                          </span>
                          <span className="fx-pts">+1 point</span>
                        </div>
                      ))}
                    </div>
                    <div className="fx-ex">Example company and data</div>
                  </div>
                </div>
              </figure>
            </div>
            <div className="flow" data-reveal="">
              <div className="flow-card">
                <small>The gap</small>
                <ul>
                  {THINGS_A_BUYER_WOULD_LIST_ITEMS.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 3h9l3 3v15H6z" />
                        <path d="M9 9h6M9 13h6M9 17h4" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flow-arrow" aria-hidden="true">
                <span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
              <div className="flow-card after">
                <small>The fix</small>
                <ul>
                  {THINGS_A_BUYER_WOULD_LIST_ITEMS_2.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8 12 3 3 5-6" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </article>
        <article className="story" id="contractors">
          <div className="story-copy">
            <span className="idx" data-reveal="">03 / 06</span>
            <h2 className="h2" data-split="">You hire contractors to build the product</h2>
            <p className="body-l" data-reveal="">
              In many countries the person who writes code owns it unless they transfer it in writing. A
              contractor agreement is not the same as owning the code. That is how a company ends up selling
              technology it cannot prove it owns, and how an investor’s lawyer ends up asking for a signature from
              someone who left two years ago.
            </p>
            <div className="fit-for" data-reveal="">
              {CONTRACTORS_FIT_FOR_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p className="story-ref" data-reveal="">
              Read the longer note:{" "}
              <a href="/insights/contractor-ip-assignment">
                why a contractor agreement is not an IP assignment
              </a>
              .
            </p>
          </div>
          <div className="story-visual">
            <div className="pb-mock" data-reveal="scale">
              <figure
                className="fx"
                data-fx="one"
                role="img"
                aria-label="Example One issue screen: the lead developer has not signed the code over. The fix is Draft, Sign, File and takes the score from 72 to about 80."
              >
                <div className="fx-win">
                  <div className="fx-bar">
                    <span className="fx-co">Kestrel Pay Inc.</span>
                    <span className="fx-nav">
                      {CONTRACTORS_FX_NAV_ITEMS.map((item) => (
                        <i key={item.mark} className={cx(item.tone)}>{item.mark}</i>
                      ))}
                    </span>
                  </div>
                  <div className="fx-body">
                    <div className="fx-back">Back to all issues</div>
                    <div className="fx-tag">
                      <span className="risk">Urgent</span>{" "}
                      · Intellectual property
                    </div>
                    <h4 className="fx-h">Your lead developer hasn’t signed the code over to Kestrel Pay</h4>
                    <dl className="fx-kv">
                      {CONTRACTORS_FX_KV_ITEMS.map((item) => (
                        <div key={item.term}>
                          <dt>{item.term}</dt>
                          <dd>{item.detail}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="fx-clause">
                      <div>
                        <small>What your contract says</small>
                        <p>
                          The Contractor retains all right, title and interest in the Deliverables and grants the
                          Company a non-exclusive licence to use them.
                        </p>
                      </div>
                      <div className="good">
                        <small>What it should say</small>
                        <p>
                          The Contractor assigns to the Company all right, title and interest in the Deliverables
                          on creation.
                        </p>
                      </div>
                    </div>
                    <div className="fx-how">
                      <small>How we know</small>
                      <p>We read the contractor agreement you uploaded on 12 October.</p>
                    </div>
                    <div className="fx-law">
                      The law: Copyright Act 2022 (Nigeria) and 17 U.S.C. § 204(a) (United States). A transfer of
                      copyright has to be in writing.
                    </div>
                    <div className="fx-fix">
                      <div className="fx-steps">
                        {CONTRACTORS_FX_STEPS.map((item) => (
                          <span key={item.title} className="fx-step" data-step={item.step}>
                            <b>{item.title}</b>
                            {item.fxStep}
                          </span>
                        ))}
                      </div>
                      <div className="fx-fixscore">
                        <b data-fx-score="">72</b>
                        <span className="watch" data-fx-word="">Needs work</span>
                      </div>
                    </div>
                    <p className="fx-note" data-fx-note="" data-from="72" data-to="80">
                      This one fix takes your score from 72 to about 80, the level for verification.
                    </p>
                    <div className="fx-ex">Example company and data</div>
                  </div>
                </div>
              </figure>
            </div>
            <div className="flow" data-reveal="">
              <div className="flow-card">
                <small>The gap</small>
                <ul>
                  {YOUR_LEAD_DEVELOPER_HASN_LIST_ITEMS.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 3h9l3 3v15H6z" />
                        <path d="M9 9h6M9 13h6M9 17h4" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flow-arrow" aria-hidden="true">
                <span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
              <div className="flow-card after">
                <small>The fix</small>
                <ul>
                  {YOUR_LEAD_DEVELOPER_HASN_LIST_ITEMS_2.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8 12 3 3 5-6" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </article>
        <article className="story" id="data">
          <div className="story-copy">
            <span className="idx" data-reveal="">04 / 06</span>
            <h2 className="h2" data-split="">You handle personal data</h2>
            <p className="body-l" data-reveal="">
              Most early privacy policies are copied from a template. They name the wrong law, miss the countries
              where your users are, and say nothing about the hosting, analytics and AI services the product
              relies on. Vero Scan checks what you publish against what the law asks for now, and searches the
              regulators’ public lists.
            </p>
            <div className="fit-for" data-reveal="">
              {DATA_FIT_FOR_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p className="story-ref" data-reveal="">
              Read the longer note:{" "}
              <a href="/insights/nigeria-gaid-cookie-banners">
                Nigeria’s cookie banner rules, in plain English
              </a>
              .
            </p>
          </div>
          <div className="story-visual">
            <div className="pb-mock" data-reveal="scale">
              <figure
                className="fx"
                data-fx="one"
                role="img"
                aria-label="Example One issue screen: Kestrel Pay is not on the Nigeria Data Protection Commission list. The fix is Check, Register, Add proof."
              >
                <div className="fx-win">
                  <div className="fx-bar">
                    <span className="fx-co">Kestrel Pay Inc.</span>
                    <span className="fx-nav">
                      {DATA_FX_NAV_ITEMS.map((item) => (
                        <i key={item.mark} className={cx(item.tone)}>{item.mark}</i>
                      ))}
                    </span>
                  </div>
                  <div className="fx-body">
                    <div className="fx-back">Back to all issues</div>
                    <div className="fx-tag">
                      <span className="watch">Important</span>{" "}
                      · Compliance
                    </div>
                    <h4 className="fx-h">You’re not registered with the Nigeria Data Protection Commission</h4>
                    <dl className="fx-kv">
                      {DATA_FX_KV_ITEMS.map((item) => (
                        <div key={item.term}>
                          <dt>{item.term}</dt>
                          <dd>{item.detail}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="fx-how">
                      <small>How we know</small>
                      <p>
                        We looked on the NDPC list on 4 November and found nothing. You told us you handle
                        customer data in Nigeria.
                      </p>
                    </div>
                    <div className="fx-law">The law: Nigeria Data Protection Act 2023.</div>
                    <div className="fx-fix">
                      <div className="fx-steps">
                        {DATA_FX_STEPS.map((item) => (
                          <span key={item.title} className="fx-step" data-step={item.step}>
                            <b>{item.title}</b>
                            {item.fxStep}
                          </span>
                        ))}
                      </div>
                      <div className="fx-fixscore">
                        <b data-fx-score="">72</b>
                        <span className="watch" data-fx-word="">Needs work</span>
                      </div>
                    </div>
                    <p className="fx-note" data-fx-note="" data-from="72" data-to="75">
                      This one fix takes your score from 72 to about 75.
                    </p>
                    <div className="fx-ex">Example company and data</div>
                  </div>
                </div>
              </figure>
            </div>
            <div className="flow" data-reveal="">
              <div className="flow-card">
                <small>The gap</small>
                <ul>
                  {YOU_RE_NOT_REGISTERED_LIST_ITEMS.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 3h9l3 3v15H6z" />
                        <path d="M9 9h6M9 13h6M9 17h4" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flow-arrow" aria-hidden="true">
                <span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
              <div className="flow-card after">
                <small>The fix</small>
                <ul>
                  {YOU_RE_NOT_REGISTERED_LIST_ITEMS_2.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8 12 3 3 5-6" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </article>
        <article className="story" id="ai">
          <div className="story-copy">
            <span className="idx" data-reveal="">05 / 06</span>
            <h2 className="h2" data-split="">You use AI in the product or in the team</h2>
            <p className="body-l" data-reveal="">
              AI rules arrive at different speeds. The EU has an AI Act. The UK regulates through existing law.
              Nigeria has policy and pending bills, not a binding AI law. A product sold in several places needs a
              map, not a guess, and customers now ask how you use AI before they sign.
            </p>
            <div className="fit-for" data-reveal="">
              {AI_FIT_FOR_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p className="story-ref" data-reveal="">
              How the AI and data area is scored is on the{" "}
              <a href="/methodology">methodology page</a>
              .
            </p>
          </div>
          <div className="story-visual">
            <div className="pb-mock" data-reveal="scale">
              <figure
                className="fx"
                data-fx="docs"
                role="img"
                aria-label="Example Documents screen for Kestrel Pay Inc., AI and data: 2 of 3 documents in place, the AI use policy is missing."
              >
                <div className="fx-win">
                  <div className="fx-bar">
                    <span className="fx-co">Kestrel Pay Inc.</span>
                    <span className="fx-nav">
                      {AI_FX_NAV_ITEMS.map((item) => (
                        <i key={item.mark} className={cx(item.tone)}>{item.mark}</i>
                      ))}
                    </span>
                  </div>
                  <div className="fx-body">
                    <div className="fx-head">
                      <div>
                        <h4>AI and data</h4>
                        <p>
                          <span data-fx-count="">2</span>{" "}
                          of 3 in place
                        </p>
                      </div>
                      <div className="fx-score">
                        <b className="fx-big" data-fx-n="">2</b>
                        <span>of 3 documents</span>
                      </div>
                    </div>
                    <div className="fx-meter" aria-hidden="true">
                      <i className="u-width-67pct" data-fx-bar=""></i>
                    </div>
                    <div className="fx-rows">
                      <div className="fx-row doc" data-missing="0">
                        <span className="t">
                          <b>Data terms with your main vendor</b>
                          <small>Who may see customer data, and for what</small>
                        </span>
                        <span className="fx-st good" data-fx-st="">Lawyer checked</span>
                        <span className="fx-act">View</span>
                      </div>
                      <div className="fx-row doc" data-missing="0">
                        <span className="t">
                          <b>Model provider agreement</b>
                          <small>What the AI provider may do with your data</small>
                        </span>
                        <span className="fx-st watch" data-fx-st="">We read it</span>
                        <span className="fx-act">View</span>
                      </div>
                      <div className="fx-row doc" data-missing="1">
                        <span className="t">
                          <b>AI use policy</b>
                          <small>Rules for how your team uses AI tools</small>
                          <small className="note">
                            Your team has no written rules on using AI. Adding one is worth 1 point.
                          </small>
                        </span>
                        <span className="fx-st risk" data-fx-st="">Missing</span>
                        <span className="fx-act">Add</span>
                      </div>
                    </div>
                    <div className="fx-ex">Example company and data</div>
                  </div>
                </div>
              </figure>
            </div>
            <div className="flow" data-reveal="">
              <div className="flow-card">
                <small>The gap</small>
                <ul>
                  {AI_AND_DATA_LIST_ITEMS.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 3h9l3 3v15H6z" />
                        <path d="M9 9h6M9 13h6M9 17h4" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flow-arrow" aria-hidden="true">
                <span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
              <div className="flow-card after">
                <small>The fix</small>
                <ul>
                  {AI_AND_DATA_LIST_ITEMS_2.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8 12 3 3 5-6" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </article>
        <article className="story" id="expanding">
          <div className="story-copy">
            <span className="idx" data-reveal="">06 / 06</span>
            <h2 className="h2" data-split="">You are opening in another country</h2>
            <p className="body-l" data-reveal="">
              A company that enters a new market with the paperwork it used at home usually learns the gap from a
              regulator, a customer or an investor. Many African startups move under a Delaware holding company to
              raise from US investors. That creates duties on both sides: Delaware’s annual report and franchise
              tax, due each 1 March, and, where a Nigerian subsidiary pays its parent for technology, a possible
              registration with NOTAP within 30 days.
            </p>
            <div className="fit-for" data-reveal="">
              {EXPANDING_FIT_FOR_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p className="story-ref" data-reveal="">
              See the countries on the{" "}
              <a href="/coverage">coverage page</a>
              , or read{" "}
              <a href="/insights/cac-annual-returns-and-status">
                why an active status is not the same as up to date
              </a>
              .
            </p>
          </div>
          <div className="story-visual">
            <div className="pb-mock" data-reveal="scale">
              <figure
                className="fx"
                data-fx="issues"
                role="img"
                aria-label="Example Issues screen for Kestrel Pay Inc. with country filters: six fixes across Delaware, the United Kingdom and Nigeria."
              >
                <div className="fx-win">
                  <div className="fx-bar">
                    <span className="fx-co">Kestrel Pay Inc.</span>
                    <span className="fx-nav">
                      {EXPANDING_FX_NAV_ITEMS.map((item) => (
                        <i key={item.mark} className={cx(item.tone)}>{item.mark}</i>
                      ))}
                    </span>
                  </div>
                  <div className="fx-body">
                    <div className="fx-head">
                      <div>
                        <h4 data-fx-title="">6 things to fix, by country</h4>
                        <p>Pick a country to see its list</p>
                      </div>
                      <div className="fx-score">
                        <b data-fx-score="">72</b>
                        <span className="watch" data-fx-word="">Needs work</span>
                      </div>
                    </div>
                    <div className="fx-track" aria-hidden="true">
                      <i></i>
                      <i></i>
                      <i></i>
                      <span className="fx-pin u-left-72pct" data-fx-pin=""></span>
                    </div>
                    <div className="fx-tabs" aria-hidden="true">
                      {EXPANDING_FX_TABS.map((item) => (
                        <i key={item.mark} className={cx(item.tone)} data-c={item.c}>{item.mark}</i>
                      ))}
                    </div>
                    <div className="fx-grp">
                      <h5 className="watch">Important</h5>
                      {EXPANDING_FX_GRP_ITEMS.map((item) => (
                        <div
                          key={item.title}
                          className="fx-row"
                          data-points={item.points}
                          data-country={item.country}
                        >
                          <span className="box" aria-hidden="true"></span>
                          <span className="t">
                            <b>{item.title}</b>
                            <small>{item.detail}</small>
                          </span>
                          <span className="fx-pts">{item.fxPts}</span>
                        </div>
                      ))}
                    </div>
                    <div className="fx-grp">
                      <h5 className="none">Worth doing</h5>
                      {EXPANDING_FX_GRP_ITEMS_2.map((item) => (
                        <div key={item.title} className="fx-row" data-points="1" data-country={item.country}>
                          <span className="box" aria-hidden="true"></span>
                          <span className="t">
                            <b>{item.title}</b>
                            <small>{item.detail}</small>
                          </span>
                          <span className="fx-pts">+1 point</span>
                        </div>
                      ))}
                    </div>
                    <div className="fx-ex">Example company and data</div>
                  </div>
                </div>
              </figure>
            </div>
            <div className="flow" data-reveal="">
              <div className="flow-card">
                <small>The gap</small>
                <ul>
                  {THINGS_TO_FIX_BY_LIST_ITEMS.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 3h9l3 3v15H6z" />
                        <path d="M9 9h6M9 13h6M9 17h4" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flow-arrow" aria-hidden="true">
                <span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
              <div className="flow-card after">
                <small>The fix</small>
                <ul>
                  {THINGS_TO_FIX_BY_LIST_ITEMS_2.map((item) => (
                    <li key={item}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8 12 3 3 5-6" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

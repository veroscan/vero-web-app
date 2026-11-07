import { Eyebrow } from "@/components/ui/Eyebrow";
import { cssVars } from "@/lib/css";
import { cx } from "@/lib/cx";

interface DocumentsListItem {
  readonly text: string;
  readonly tone: string;
}

const DOCUMENTS_LIST_ITEMS: readonly DocumentsListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "on" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

interface Scene0PuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puSt: string;
  readonly tone: string;
}

const SCENE_0_PU_ROWS: readonly Scene0PuRowItem[] = [
  {
    title: "IP assignment, lead developer",
    detail: "Moves ownership of the code to the company",
    puSt: "Missing",
    tone: "risk",
  },
  {
    title: "Open-source licence list",
    detail: "Shows the code you use doesn’t restrict what you sell",
    puSt: "Missing",
    tone: "watch",
  },
  {
    title: "Founders’ IP assignment",
    detail: "Moves anything built before the company existed",
    puSt: "Lawyer checked",
    tone: "good",
  },
  {
    title: "Delaware franchise tax receipt",
    detail: "Delaware doesn’t allow automatic checks, so we need a copy",
    puSt: "Missing",
    tone: "watch",
  },
  {
    title: "CAC status report, Nigeria",
    detail: "Confirms your annual returns are up to date",
    puSt: "You told us",
    tone: "watch",
  },
];

interface DeadlinesListItem {
  readonly text: string;
  readonly tone: string;
}

const DEADLINES_LIST_ITEMS: readonly DeadlinesListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "" },
  { text: "Deadlines", tone: "on" },
  { text: "Company", tone: "" },
];

interface Scene1PaDateItem {
  readonly text: string;
  readonly title: string;
  readonly detail: string;
  readonly tone: string;
}

const SCENE_1_PA_DATES: readonly Scene1PaDateItem[] = [
  {
    text: "12 Oct",
    title: "UK confirmation statement",
    detail: "Kestrel Pay UK Ltd · We check this with Companies House",
    tone: "risk",
  },
  {
    text: "18 Nov",
    title: "UK director identity verification",
    detail: "Kestrel Pay UK Ltd · We check this with Companies House",
    tone: "watch",
  },
  {
    text: "1 Mar",
    title: "Delaware annual report and franchise tax",
    detail: "Kestrel Pay Inc. · We’ll remind you and ask for proof",
    tone: "none",
  },
  {
    text: "31 Mar",
    title: "Nigeria data protection audit return",
    detail: "Kestrel Pay Nigeria Ltd · We’ll remind you and ask for proof",
    tone: "none",
  },
  {
    text: "9 Aug",
    title: "UK data protection fee",
    detail: "Kestrel Pay UK Ltd · We check this on the ICO register",
    tone: "none",
  },
];

interface LawyerReviewListItem {
  readonly text: string;
  readonly tone: string;
}

const LAWYER_REVIEW_LIST_ITEMS: readonly LawyerReviewListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "on" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

interface Scene2PuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puSt: string;
  readonly tone: string;
}

const SCENE_2_PU_ROWS: readonly Scene2PuRowItem[] = [
  {
    title: "SAFE with a seed investor",
    detail: "A lawyer read this on 3 November. The conversion cap doesn’t match your stock ledger. It needs an amendment before your next round.",
    puSt: "Needs changes",
    tone: "watch",
  },
  {
    title: "Founders’ agreement",
    detail: "A lawyer read this on 3 November. The founders have signed their work over to the company. Nothing to change.",
    puSt: "Sufficient",
    tone: "good",
  },
  {
    title: "Customer terms",
    detail: "A lawyer read this on 28 October. These do what you need them to do. Nothing to change.",
    puSt: "Sufficient",
    tone: "good",
  },
];

const SCENE_2_PA_QUEUE_ITEMS: readonly string[] = [
  "Contractor agreement: does it move ownership of the code to you?",
  "Cap table: does it match what your investors were promised?",
  "Privacy policy: does it meet UK and Nigerian data law?",
];

export function ProductDocuments() {
  return (
    <section className="serve" id="around" data-serve="" aria-labelledby="around-title">
      <div className="wrap serve-grid">
        <div className="serve-side">
          <Eyebrow>Around the score</Eyebrow>
          <h2 className="h2" id="around-title" data-split="">Documents, dates and a lawyer, in one place.</h2>
          <p className="muted u-margin-0">
            Three parts of the product that keep the score honest. Pick one, or let them play. Every name and
            number here is illustrative.
          </p>
          <ul className="serve-tabs" role="tablist" aria-label="Documents, deadlines and lawyer review">
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
                    <path d="M6 3h9l4 4v14H6z" />
                    <path d="M14 3v5h5M9 13h7M9 17h5" />
                  </svg>
                </span>
                <b>Documents</b>
                <span className="d">Every document, in its right place</span>
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
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                </span>
                <b>Deadlines</b>
                <span className="d">Every date, with who checks it</span>
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
                    <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <b>Lawyer review</b>
                <span className="d">Sufficient, not just present</span>
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
        </div>
        <div className="serve-stage">
          <article
            className="scene is-active"
            id="scene-0"
            data-scene="pa-vault"
            data-time="11"
            role="tabpanel"
            aria-labelledby="stab-0"
          >
            <div className="scene-cap">
              <div>
                <h3>Documents</h3>
                <p>
                  You don’t need to know what a company should have. The vault is the list. Each empty slot counts
                  as a gap until you fill it. Upload files directly. Connecting Google Drive or Notion is planned.
                </p>
              </div>
              <span className="tagline">Example company</span>
            </div>
            <div className="scene-body pa-sbody">
              <div className="pa-win pa-wide" data-pa="vault">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {DOCUMENTS_LIST_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <div className="pa-vhead">
                    <div>
                      <p className="pa-h">
                        <b className="num">19</b>{" "}
                        of 31 documents in place
                      </p>
                      <p className="pa-sub">Each empty slot counts as a gap until it’s filled.</p>
                    </div>
                  </div>
                  <div className="pa-drop">
                    <span className="pa-file">
                      <i></i>
                      IP-assignment-signed.pdf
                    </span>
                    <span className="pa-read">Reading your document</span>
                    <p className="pa-found">
                      This looks like an IP assignment between Kestrel Pay Inc. and your lead developer, signed by
                      both on 3 November 2026. Is that right?
                    </p>
                    <span className="pa-btn">Yes, file it</span>
                  </div>
                  <p className="pa-h2">Intellectual property</p>
                  <ul className="pu-rows">
                    {SCENE_0_PU_ROWS.map((item) => (
                      <li key={item.title} className="pu-row">
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
          </article>
          <article
            className="scene"
            id="scene-1"
            data-scene="pa-dates"
            data-time="10"
            role="tabpanel"
            aria-labelledby="stab-1"
          >
            <div className="scene-cap">
              <div>
                <h3>Deadlines</h3>
                <p>
                  Every date your companies have to meet. Some we check for you. For the rest, we remind you and
                  ask for proof.
                </p>
              </div>
              <span className="tagline">Example company</span>
            </div>
            <div className="scene-body pa-sbody">
              <div className="pa-win pa-wide" data-pa="dates">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {DEADLINES_LIST_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <div className="pa-vhead">
                    <div>
                      <p className="pa-h">Deadlines</p>
                      <p className="pa-sub">
                        Every date your three companies have to meet. Some we can check for you. For the rest,
                        we’ll remind you and ask for proof.
                      </p>
                    </div>
                  </div>
                  <ul className="pa-dates">
                    {SCENE_1_PA_DATES.map((item) => (
                      <li key={item.text} className="pa-date">
                        <span className={cx("d", item.tone)}>{item.text}</span>
                        <span className="t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <span className="pa-btn pa-btn-line">Add these to your calendar</span>
                </div>
                <p className="pa-ex">Example company and dates</p>
              </div>
            </div>
          </article>
          <article
            className="scene"
            id="scene-2"
            data-scene="pa-review"
            data-time="11"
            role="tabpanel"
            aria-labelledby="stab-2"
          >
            <div className="scene-cap">
              <div>
                <h3>Lawyer review</h3>
                <p>
                  A Code &amp; Clause lawyer reads the documents that matter and marks each one sufficient or not,
                  with notes. Software reads. A lawyer judges.
                </p>
              </div>
              <span className="tagline">Example company</span>
            </div>
            <div className="scene-body pa-sbody">
              <div className="pa-win pa-wide" data-pa="review">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {LAWYER_REVIEW_LIST_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <div className="pa-vhead">
                    <div>
                      <p className="pa-h">Lawyer review</p>
                      <p className="pa-sub">
                        Software can tell you a document exists. A lawyer tells you whether it works.
                      </p>
                    </div>
                  </div>
                  <p className="pa-read-n">
                    <b className="num">3</b>{" "}
                    of 9 key documents read by a Code &amp; Clause lawyer
                  </p>
                  <div className="pa-prog pa-prog-s" aria-hidden="true">
                    <i style={cssVars({ "--w": "33.3%" })}></i>
                  </div>
                  <p className="pa-h2">What they found</p>
                  <ul className="pu-rows">
                    {SCENE_2_PU_ROWS.map((item) => (
                      <li key={item.title} className="pu-row">
                        <span className="pu-t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className={cx("pu-st", item.tone)}>{item.puSt}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pa-h2">Still in the queue</p>
                  <ul className="pa-queue">
                    {SCENE_2_PA_QUEUE_ITEMS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="pa-ex">Example company and documents</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

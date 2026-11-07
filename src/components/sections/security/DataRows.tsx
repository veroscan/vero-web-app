import { LinkArrow } from "@/components/ui/LinkArrow";
import { cx } from "@/lib/cx";

const COLLECTED_TICKS: readonly string[] = [
  "Your company’s name, where it is incorporated, where it operates, where its investors are, its sector and stage",
  "Facts from public registers, with the source and date",
  "The documents you upload, and nothing else",
];

interface WhatVeroCollectsListItem {
  readonly text: string;
  readonly tone: string;
}

const WHAT_VERO_COLLECTS_LIST_ITEMS: readonly WhatVeroCollectsListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "on" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

interface CollectedPuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puSt: string;
  readonly tone: string;
}

const COLLECTED_PU_ROWS: readonly CollectedPuRowItem[] = [
  {
    title: "Your inputs",
    detail: "Company name, where it is incorporated and works, sector, stage and your questionnaire answers",
    puSt: "You told us",
    tone: "none",
  },
  {
    title: "Public records",
    detail: "Facts from official registers, with source and date. Officer names and roles only",
    puSt: "Checked",
    tone: "good",
  },
  { title: "Documents", detail: "Only the files you upload or choose", puSt: "You uploaded this", tone: "good" },
];

const PROTECTED_TICKS: readonly string[] = [
  "Planned baseline: encrypted connections, encrypted storage, extra protection for integration credentials and short-lived links for file access",
  "Role-based access, with each organisation’s data kept separate",
  "Multi-factor sign-in that an organisation can require",
  "A log of sign-ins, document access, exports, AI calls and deletions",
];

interface EncryptionAndAccessListItem {
  readonly text: string;
  readonly tone: string;
}

const ENCRYPTION_AND_ACCESS_LIST_ITEMS: readonly EncryptionAndAccessListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "on" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

interface ProtectedPuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puSt: string;
  readonly tone: string;
}

const PROTECTED_PU_ROWS: readonly ProtectedPuRowItem[] = [
  { title: "You and your team", detail: "Each organisation’s data is kept separate", puSt: "Yes", tone: "good" },
  { title: "A Code & Clause lawyer", detail: "Only for a review you ask for", puSt: "On request", tone: "watch" },
  { title: "Anyone else", detail: "No access", puSt: "No", tone: "risk" },
];

interface ProtectedPaLogItem {
  readonly text: string;
  readonly detail: string;
}

const PROTECTED_PA_LOG_ITEMS: readonly ProtectedPaLogItem[] = [
  { text: "Signed in", detail: "Your team" },
  { text: "Document opened", detail: "Reviewing lawyer, for the review you asked for" },
  { text: "Export downloaded", detail: "Your team" },
];

const AI_TICKS: readonly string[] = [
  "It extracts text, proposes the document type and reads basic facts: parties, dates, governing law and whether it is signed",
  "It never decides whether a document is legally sufficient. A lawyer does",
  "Planned: only the pages needed, an organisation-level switch, and every AI call logged",
];

interface HowVeroUsesAiListItem {
  readonly text: string;
  readonly tone: string;
}

const HOW_VERO_USES_AI_LIST_ITEMS: readonly HowVeroUsesAiListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "on" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

interface AiPaFactItem {
  readonly detail: string;
  readonly title: string;
}

const AI_PA_FACTS: readonly AiPaFactItem[] = [
  { detail: "What it looks like", title: "An IP assignment" },
  { detail: "Parties", title: "Kestrel Pay Inc. and your lead developer" },
  { detail: "Signed", title: "3 November 2026" },
];

const RIGHTS_TICKS: readonly string[] = [
  "Registry data pulled for a scan is kept for a limited time, then reduced to facts with their source [period to confirm]",
  "Your documents stay until you delete them or close your account [retention schedule to confirm]",
  "You can ask for access, correction, deletion and export of your data",
];

interface RightsOnItem {
  readonly text: string;
  readonly tone: string;
}

const RIGHTS_ON_ITEMS: readonly RightsOnItem[] = [
  { text: "Home", tone: "on" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "" },
];

interface RightsPuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puSt: string;
  readonly tone: string;
}

const RIGHTS_PU_ROWS: readonly RightsPuRowItem[] = [
  {
    title: "Ask for access or correction",
    detail: "Under the NDPA 2023 and GAID 2025, the UK GDPR and the GDPR",
    puSt: "Write to us",
    tone: "good",
  },
  {
    title: "Ask for deletion or a copy",
    detail: "Documents, or your whole account",
    puSt: "Write to us",
    tone: "good",
  },
  { title: "Delete and export in the app", detail: "Built into your account", puSt: "Planned", tone: "watch" },
];

export function DataRows() {
  return (
    <section className="pad-sm pa-rows" aria-label="How data is handled">
      <div className="wrap">
        <article className="svc-row" id="collected">
          <div className="svc-copy">
            <span className="idx" data-reveal="">01 / 04</span>
            <h2 className="h2" data-split="">What Vero collects</h2>
            <p className="sub" data-reveal="">Only what a scan needs.</p>
            <div data-reveal="">
              <ul className="ticks">
                {COLLECTED_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div data-reveal="">
              <LinkArrow href="/methodology">See how the score uses it</LinkArrow>
            </div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="pa-win" data-pa="rise">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {WHAT_VERO_COLLECTS_LIST_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <p className="pa-h">What a scan uses</p>
                  <ul className="pu-rows">
                    {COLLECTED_PU_ROWS.map((item) => (
                      <li key={item.title} className="pu-row">
                        <span className="pu-t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className={cx("pu-st", item.tone)}>{item.puSt}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pa-sub">
                    Connecting Google Drive or Notion is planned. When it arrives, Vero will read only the files
                    or pages you choose.
                  </p>
                </div>
                <p className="pa-ex">Example company. Illustrative.</p>
              </div>
            </div>
          </div>
        </article>
        <article className="svc-row" id="protected">
          <div className="svc-copy">
            <span className="idx" data-reveal="">02 / 04</span>
            <h2 className="h2" data-split="">Encryption and access</h2>
            <p className="sub" data-reveal="">Layers of control around your documents.</p>
            <div data-reveal="">
              <ul className="ticks">
                {PROTECTED_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div data-reveal=""></div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="pa-win" data-pa="access">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {ENCRYPTION_AND_ACCESS_LIST_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <p className="pa-h">Who can open your documents</p>
                  <ul className="pu-rows">
                    {PROTECTED_PU_ROWS.map((item) => (
                      <li key={item.title} className="pu-row">
                        <span className="pu-t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className={cx("pu-st", item.tone)}>{item.puSt}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pa-h2">Activity log</p>
                  <ul className="pa-log">
                    {PROTECTED_PA_LOG_ITEMS.map((item) => (
                      <li key={item.text}>
                        <span>{item.text}</span>
                        <small>{item.detail}</small>
                      </li>
                    ))}
                  </ul>
                  <p className="pa-sub">The log records who did what. It never records what a document says.</p>
                </div>
                <p className="pa-ex">Illustrative. Provider, region and settings to be confirmed.</p>
              </div>
            </div>
          </div>
        </article>
        <article className="svc-row" id="ai">
          <div className="svc-copy">
            <span className="idx" data-reveal="">03 / 04</span>
            <h2 className="h2" data-split="">How Vero uses AI</h2>
            <p className="sub" data-reveal="">A reader, not a judge.</p>
            <div data-reveal="">
              <ul className="ticks">
                {AI_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div data-reveal=""></div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="pa-win" data-pa="airead">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {HOW_VERO_USES_AI_LIST_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <p className="pa-h">Reading a document</p>
                  <p className="pa-file-line">
                    <span className="pa-file">
                      <i></i>
                      IP-assignment-signed.pdf
                    </span>
                  </p>
                  <ul className="pa-facts">
                    {AI_PA_FACTS.map((item) => (
                      <li key={item.detail}>
                        <small>{item.detail}</small>
                        <b>{item.title}</b>
                      </li>
                    ))}
                  </ul>
                  <ul className="pu-rows">
                    <li className="pu-row">
                      <span className="pu-t">
                        <b>Does it do what it should?</b>
                        <small>Software does not decide this</small>
                      </span>
                      <span className="pu-st watch">A lawyer decides</span>
                    </li>
                  </ul>
                  <p className="pa-sub">Customer documents are not used to train AI models.</p>
                </div>
                <p className="pa-ex">Example company and document</p>
              </div>
            </div>
          </div>
        </article>
        <article className="svc-row" id="rights">
          <div className="svc-copy">
            <span className="idx" data-reveal="">04 / 04</span>
            <h2 className="h2" data-split="">Retention and your rights</h2>
            <p className="sub" data-reveal="">Keep what you need. Delete when you ask.</p>
            <div data-reveal="">
              <ul className="ticks">
                {RIGHTS_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div data-reveal=""></div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="pa-win" data-pa="rise">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {RIGHTS_ON_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <p className="pa-h">Your data</p>
                  <ul className="pu-rows">
                    {RIGHTS_PU_ROWS.map((item) => (
                      <li key={item.title} className="pu-row">
                        <span className="pu-t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className={cx("pu-st", item.tone)}>{item.puSt}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pa-sub">
                    Write to hello@codeclauselegal.com. Retention periods are to be confirmed.
                  </p>
                </div>
                <p className="pa-ex">Illustrative</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

import type { FaqItem } from "@/components/ui/FaqList";
import { Button } from "@/components/ui/Button";
import { FaqList } from "@/components/ui/FaqList";
import { cx } from "@/lib/cx";

interface PostAsideTocItem {
  readonly label: string;
  readonly href: string;
}

const POST_ASIDE_TOC_ITEMS: readonly PostAsideTocItem[] = [
  { label: "What “active” actually tells you", href: "#what-active-means" },
  { label: "Annual returns under CAMA 2020", href: "#annual-returns" },
  { label: "The status report: the document that settles it", href: "#status-report" },
  { label: "What investors check", href: "#what-investors-check" },
  { label: "A filing-health checklist", href: "#checklist" },
  { label: "Fixing a lapsed record", href: "#fixing-it" },
  { label: "How Vero Scan checks this", href: "#how-vero-checks" },
  { label: "FAQs", href: "#faq" },
];

const WHAT_ACTIVE_ACTUALLY_TELLS_LIST_ITEMS: readonly string[] = [
  "which years’ annual returns were filed, and when;",
  "whether the share capital and shareholders on the register match the cap table the founders are presenting;",
  "whether allotments made after a SAFE or note converted were ever filed;",
  "whether persons with significant control (PSCs) are disclosed and current;",
  "whether directors who left were removed, and new ones properly appointed.",
];

const GUIDE_PROSE_ITEMS: readonly string[] = [
  "Every company registered under the Companies and Allied Matters Act (CAMA) 2020 must file an annual return with the CAC. The return confirms the company’s particulars for the year: registered office, directors and secretary, share capital, shareholders and, for most companies, accounts information.",
  "The filing window is tied to the annual general meeting, and small or exempt companies commonly work to a mid-year deadline. Practitioners read the timing rules differently, and the first return’s due date depends on when the company was incorporated, so confirm your own date with the CAC or your company secretary rather than relying on a rule of thumb.",
  "What is not in doubt is the consequence of missing it. Late returns attract penalties that grow with the delay, persistent non-filing leads to inactive status, and a company that stays out of compliance risks being struck off the register. Each missed year also has to be filed, and paid for, before the record is clean again.",
];

interface TheStatusReportTheListItem {
  readonly term: string;
  readonly text: string;
}

const THE_STATUS_REPORT_THE_LIST_ITEMS: readonly TheStatusReportTheListItem[] = [
  {
    term: "The CAC Status Report",
    text: "summarises the company’s current particulars and standing. It can be obtained through the CAC’s licensed data partners or ordered by a CAC accredited agent, typically for around ₦5,000.",
  },
  {
    term: "A historical report",
    text: "setting out the company’s full filing history can be ordered through an accredited agent for more, typically ₦20,000 to ₦30,000, and is what counsel will want if the history is in doubt.",
  },
  {
    term: "Annual return acknowledgements",
    text: "issued on filing are the company’s own proof, year by year. Keep them.",
  },
];

const WHAT_INVESTORS_CHECK_LIST_ITEMS: readonly string[] = [
  "the certificate of incorporation, RC number and the Memorandum and Articles of Association (MEMART) currently registered;",
  "a recent CAC Status Report and evidence of annual returns for each year since incorporation;",
  "the register of members, and every return of allotment and share transfer filed since incorporation, reconciled to the cap table;",
  "the PSC disclosure filed with the CAC under CAMA 2020 and the Persons with Significant Control Regulations 2022;",
  "particulars of current directors and the secretary, with filings for every change;",
  "board and shareholder resolutions authorising each allotment and each change to the articles;",
  "the Tax Identification Number issued at incorporation.",
];

const A_FILING_HEALTH_CHECKLIST_LIST_ITEMS: readonly string[] = [
  "Status on the CAC register is ACTIVE.",
  "An annual return has been filed for every year it was due, with acknowledgements on file.",
  "A CAC Status Report less than three months old is in the data room.",
  "Shareholders and share capital on the register match the cap table, to the share.",
  "Every allotment since incorporation is supported by a resolution and a filed return of allotment.",
  "PSC disclosure is current and matches the people who actually control the company.",
  "Directors and secretary on the register are the people actually serving.",
  "Statutory registers (members, directors, PSCs) are written up and match the CAC record.",
];

interface HowVeroScanChecksListItem {
  readonly term: string;
  readonly text: string;
}

const HOW_VERO_SCAN_CHECKS_LIST_ITEMS: readonly HowVeroScanChecksListItem[] = [
  {
    term: "From our licensed data provider:",
    text: "registration, RC number, status, directors, shareholders, share capital and PSC records, pulled through licensed CAC data partners. Vero Scan does not scrape the CAC portal, whose terms forbid it.",
  },
  {
    term: "You upload this and we read it:",
    text: "annual-return history, confirmed from a CAC Status Report or historical report, which Code & Clause can order as an accredited agent, or from your filing acknowledgements.",
  },
  {
    term: "You tell us:",
    text: "statutory registers, share certificates and board resolutions, held in the vault and open to review by a Code & Clause lawyer.",
  },
];

const FAQ_ITEMS: readonly FaqItem[] = [
  { question: "Does “active” status mean my annual returns are up to date?", answer: "Not necessarily. The CAC marks persistent non-filers inactive, so “active” is a good sign, but it does not tell you which years were filed. A CAC Status Report or your filing acknowledgements confirm the history." },
  { question: "When is our annual return due?", answer: "The timing is tied to the annual general meeting, and small or exempt companies commonly work to a mid-year deadline. Practitioners read the rules differently and your first return depends on your incorporation date, so confirm your date with the CAC or your company secretary." },
  { question: "What happens if we have missed several years?", answer: "You file each missing year and pay the late-filing penalties. Until that is done the company risks inactive status and, eventually, strike-off, and some other filings become harder. Start with the oldest year." },
  { question: "Why do investors care about the register of members if we have a cap table?", answer: "Because the register, supported by filed returns of allotment, is the legal record of who owns the company. A cap table that does not match it is a promise, not title. Investors reconcile the two before they wire money." },
  { question: "Can Vero Scan see our filing history automatically?", answer: "Partly. Registration, status, directors, shareholders and PSC records come through licensed CAC data partners. No interface exposes annual returns by year, so filing history is confirmed from a status report or your acknowledgements, and the score marks it “verify” until then." },
  { question: "Does a SAFE need to be filed at the CAC?", answer: "A SAFE is a contract, not a share, so it does not appear on the register. When it converts, the resulting allotment must be authorised by resolution and filed like any other." },
];

interface PsVisualNdMockItem {
  readonly emphasis: string;
  readonly tone: string;
}

const PS_VISUAL_ND_MOCK_ITEMS: readonly PsVisualNdMockItem[] = [
  { emphasis: "Checked with Companies House today", tone: "g" },
  { emphasis: "Found on the NDPC list", tone: "g" },
  { emphasis: "You uploaded this and we read it", tone: "w" },
  { emphasis: "You told us", tone: "w" },
  { emphasis: "A lawyer read this", tone: "g" },
];

export function ArticleBody() {
  return (
    <section className="pad-sm">
      <div className="wrap guide post-guide">
        <aside className="post-aside">
          <nav className="toc" aria-label="On this page">
            <small>
              On this page{" "}
              <span className="toc-pct" aria-hidden="true">0%</span>
            </small>
            {POST_ASIDE_TOC_ITEMS.map((item) => (
              <a key={item.label} href={item.href}>{item.label}</a>
            ))}
          </nav>
          <div className="share" aria-label="Share this article">
            <small>Share</small>
            <button className="share-copy" type="button" data-url="" aria-label="Copy link">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
                <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
              </svg>
              <span>Copied</span>
            </button>
            <a
              className="share-mail"
              href="mailto:?subject=“Active” is not the same as compliant: CAC annual returns, status reports and what investors check"
              data-subject="“Active” is not the same as compliant: CAC annual returns, status reports and what investors check"
              aria-label="Share by email"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="m4 8 8 6 8-6" />
              </svg>
            </a>
          </div>
        </aside>
        <article className="prose post-body">
          <p>
            A founder searches the Corporate Affairs Commission (CAC) portal, sees “ACTIVE” next to the company
            name and moves on. An investor’s counsel does the same search and keeps going: annual returns,
            allotments, persons with significant control, the registers behind them. The gap between those two
            searches is where many Nigerian rounds slow down.
          </p>
          <p>
            This article explains what the CAC status actually tells you, what it does not, and what a clean
            corporate record looks like to someone deciding whether to invest.
          </p>
          <h2 id="what-active-means">What “active” actually tells you</h2>
          <p>
            The CAC marks companies that stop filing annual returns as inactive. So “active” is a useful signal:
            it means the company exists and has not been flagged. It is not a compliance certificate. An active
            status does not tell you:
          </p>
          <ul>
            {WHAT_ACTIVE_ACTUALLY_TELLS_LIST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Any of those can be wrong while the status still reads “active”. That is why Vero Scan reports CAC
            standing as “active” and never as “returns filed for 2025” unless a document confirms it.
          </p>
          <h2 id="annual-returns">Annual returns under CAMA 2020</h2>
          {GUIDE_PROSE_ITEMS.map((item) => (
            <p key={item}>{item}</p>
          ))}
          <h2 id="status-report">The status report: the document that settles it</h2>
          <p>
            Because no public interface lists annual returns by year, the evidence that settles the question is a
            document generated by the CAC itself:
          </p>
          <ul>
            {THE_STATUS_REPORT_THE_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ul>
          <p>
            A status report less than three months old is a sensible thing to have in a data room before you open
            it. It answers the first question an investor’s lawyer will ask.
          </p>
          <h2 id="what-investors-check">What investors check</h2>
          <p>Corporate diligence on a Nigerian company usually covers the same ground. Expect to be asked for:</p>
          <ul>
            {WHAT_INVESTORS_CHECK_LIST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            The single most common finding is a mismatch between the cap table and the register: shares promised
            or issued in a spreadsheet, never allotted by resolution, never filed. It is fixable, but it has to be
            fixed before closing, and it often means chasing signatures from people who have left.
          </p>
          <h2 id="checklist">A filing-health checklist</h2>
          <p>Work through this list once a year, ideally right after your annual return is filed:</p>
          <ol>
            {A_FILING_HEALTH_CHECKLIST_LIST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <h2 id="fixing-it">Fixing a lapsed record</h2>
          <p>
            If the checklist turns up gaps, the order of work matters. File outstanding annual returns first,
            oldest year first, and pay the penalties: until standing is restored, other filings and certified
            copies can be harder to obtain. Then reconcile shares, filing any missing returns of allotment and
            transfers with the resolutions behind them. Finish with PSC and officer updates, and order a fresh
            status report to prove the result.
          </p>
          <p>
            Start early. Back-filing several years for a company that has raised money touches shareholders,
            directors and sometimes former employees, and it rarely fits inside a closing timetable.
          </p>
          <h2 id="how-vero-checks">How Vero Scan checks this</h2>
          <p>
            Company foundations is the first of the{" "}
            <a href="/methodology">six layers</a>{" "}
            Vero Scan scores. For a Nigerian company,{" "}
            <a href="/product">registry intelligence</a>{" "}
            works like this:
          </p>
          <ul>
            {HOW_VERO_SCAN_CHECKS_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ul>
          <p>
            Where only the status is known, the finding reads “standing: active, filing history unconfirmed” and
            is marked for verification rather than scored as a pass. The reconciliation between register and cap
            table is flagged in the Fundraising layer, because that is where it costs you.
          </p>
          <p>
            <strong>See where your company stands.</strong>{" "}
            Vero Scan is in early access.{" "}
            <a href="/waitlist">Join the waitlist</a>{" "}
            to run your first scan when it opens, or{" "}
            <a href="/contact">book a demo</a>{" "}
            to walk through the Nigeria corporate checks with Code &amp; Clause.
          </p>
          <h2 id="faq">FAQs</h2>
          <p>Short answers to the questions founders and investors ask us most on this topic.</p>
          <FaqList items={FAQ_ITEMS} />
          <p className="end-note">
            <em>This article is general information as of November 2026, not legal advice.</em>
          </p>
          <div className="post-service" data-reveal="">
            <span className="ps-visual">
              <span className="nd-mock vm m-src" aria-hidden="true">
                {PS_VISUAL_ND_MOCK_ITEMS.map((item) => (
                  <i key={item.emphasis} className="sr">
                    <b className={cx(item.tone)}></b>
                    <em>{item.emphasis}</em>
                  </i>
                ))}
              </span>
            </span>
            <small>Learn more</small>
            <div>
              <b>How Vero reads the law</b>
              <p>
                Every finding says where it came from. The methodology page explains the sources, the scoring and
                the limits.
              </p>
            </div>
            <Button variant="green" href="/methodology">Read the methodology</Button>
          </div>
          <div className="author" data-reveal="">
            <span className="av">
              <img src="/vero/vero-mark.svg" alt="" width="40" height="30" />
            </span>
            <div>
              <small>Written by</small>
              <b>Code &amp; Clause</b>
              <p>A cross-border technology law firm. Vero Scan is a product of Code &amp; Clause LTD.</p>
              <a href="/about">About Code &amp; Clause</a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

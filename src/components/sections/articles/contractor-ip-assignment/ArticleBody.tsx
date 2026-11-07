import type { FaqItem } from "@/components/ui/FaqList";
import { Button } from "@/components/ui/Button";
import { FaqList } from "@/components/ui/FaqList";
import { cx } from "@/lib/cx";

interface PostAsideTocItem {
  readonly label: string;
  readonly href: string;
}

const POST_ASIDE_TOC_ITEMS: readonly PostAsideTocItem[] = [
  { label: "Why the default favours the contractor", href: "#default-rule" },
  { label: "Nigeria, the UK and the US", href: "#three-countries" },
  { label: "Where assignments go wrong", href: "#where-it-goes-wrong" },
  { label: "The clean-up checklist", href: "#checklist" },
  { label: "How Vero Scan checks this", href: "#how-vero-checks" },
  { label: "FAQs", href: "#faq" },
];

interface WhereAssignmentsGoWrongListItem {
  readonly term: string;
  readonly text: string;
}

const WHERE_ASSIGNMENTS_GO_WRONG_LIST_ITEMS: readonly WhereAssignmentsGoWrongListItem[] = [
  {
    term: "Future tense.",
    text: "“The contractor agrees to assign” is a promise to assign later. US courts distinguish it from “hereby assigns”, which transfers rights as they arise. Use present words of assignment.",
  },
  {
    term: "Wrong party.",
    text: "If the developer worked through their own company or an agency, the rights may sit with that entity. The assignment must come from whoever owns them, and the agency needs its own chain from its people.",
  },
  {
    term: "Start date after the work.",
    text: "An agreement signed in March does not obviously cover code written in January. Use a confirmatory assignment that names the earlier work.",
  },
  {
    term: "Founder IP left out.",
    text: "Code written before incorporation belongs to the founder who wrote it. It must be assigned to the company, ideally at incorporation.",
  },
  {
    term: "No further-assurance clause.",
    text: "Without one you cannot compel a former contractor to sign what a registry or buyer later needs.",
  },
  {
    term: "Open source ignored.",
    text: "Ownership of your code does not cure licence obligations on code you incorporated. Keep a record of open-source components and their licences.",
  },
];

const THE_CLEAN_UP_CHECKLIST_LIST_ITEMS: readonly string[] = [
  "List everyone who has contributed code, designs or content to the product, with dates and the capacity they worked in.",
  "For each employee, confirm an employment agreement with an IP clause; for each contractor or agency, a signed assignment.",
  "Check that each assignment uses present words (“hereby assigns”), names the right party and covers all past work.",
  "Get founders to sign an assignment of pre-incorporation IP to the company.",
  "Where anything is missing, ask for a confirmatory assignment now, while relationships are good. Offer a modest payment as consideration if needed.",
  "Add moral-rights waivers where the law allows them, and further-assurance clauses everywhere.",
  "If contractors are in Germany or France, check local formalities: an explicit grant of usage rights under UrhG §31(5), or an assignment that lists each right with scope, territory and duration under CPI L131-3.",
  "Store signed copies where you can find them in a day, not a month.",
];

const FAQ_ITEMS: readonly FaqItem[] = [
  { question: "We paid the contractor in full. Don’t we own the code?", answer: "Not automatically. Payment usually gives you, at most, an implied licence to use the work for the purpose it was commissioned. Ownership moves only by operation of law (for employees) or by a written assignment." },
  { question: "Is a work-for-hire clause enough in a US contract?", answer: "Usually not for software written by a contractor. Work made for hire only covers nine statutory categories, and most software falls outside them. Contracts normally pair the clause with a present assignment under 17 USC §204(a), and in California a work-for-hire clause can raise employment-status issues." },
  { question: "Our developer worked through an agency. Who needs to sign?", answer: "Whoever owns the rights. That is often the agency, which in turn needs assignments from its own staff or subcontractors. Ask for an assignment from the agency and evidence of its chain of title." },
  { question: "Can we fix a missing assignment after the code was written?", answer: "Yes. A confirmatory assignment, signed now and expressly covering the earlier work, is the usual fix. It is much easier while the relationship is good, so do it before a fundraising timetable forces the conversation." },
  { question: "Do founders need to assign IP to their own company?", answer: "Yes. Code written before incorporation, or written by a founder outside any employment contract, belongs to the founder. Investors expect a founder IP assignment to the company, usually signed at or soon after incorporation." },
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
              href="mailto:?subject=The contractor who built your product may still own it: IP assignment in Nigeria, the UK and the US"
              data-subject="The contractor who built your product may still own it: IP assignment in Nigeria, the UK and the US"
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
            Most early products are built by people who are not employees: a freelance developer, an agency, a
            technical co-founder who joined before the company existed. Paying them, even generously, does not
            make the company the owner of what they wrote. In Nigeria, the UK and the US the starting point is the
            same: copyright belongs to the author unless the law or a written document moves it.
          </p>
          <p>
            That gap rarely matters until someone asks. The person asking is usually an investor’s lawyer, an
            acquirer, or an enterprise customer whose contract makes you warrant that you own your software.
          </p>
          <h2 id="default-rule">Why the default favours the contractor</h2>
          <p>
            Software is protected as a literary work. The first owner of copyright is, in general, the person who
            created it. Each of the three legal systems then makes an exception for employees acting in the course
            of their employment, and none makes the same exception for independent contractors.
          </p>
          <p>
            So the question for every line of code in your product is: who wrote it, in what capacity, and what
            did they sign? If the answer is “a contractor, and nothing”, your company most likely holds at best an
            implied licence to use the code. It does not own it, cannot stop others using it, and cannot give
            clean title to an investor or buyer.
          </p>
          <h2 id="three-countries">Nigeria, the UK and the US</h2>
          <h3>Nigeria</h3>
          <p>
            Under the Copyright Act 2022, first ownership vests in the author. Works made by an employee in the
            course of employment generally belong to the employer unless the contract says otherwise. There is no
            equivalent rule for contractors, so a contractor’s work stays with the contractor until it is assigned
            in writing. Founders should treat a signed assignment as essential, not optional.
          </p>
          <p>
            Two Nigerian points are often missed. Inventions are governed separately, by the Patents and Designs
            Act, so patentable work needs its own assignment language. And if a Nigerian company pays a foreign
            party for software, a licence or technical services, the agreement must be registered with NOTAP
            within 30 days; without registration, fees cannot be remitted through CBN-regulated channels.
          </p>
          <h3>United Kingdom</h3>
          <p>
            The Copyright, Designs and Patents Act (CDPA) 1988 s.11(2) gives the employer ownership of works made
            by an employee in the course of employment. Contractors keep ownership unless they assign it, and CDPA
            1988 s.90(3) makes an assignment ineffective unless it is in writing and signed by or on behalf of the
            assignor. An email saying “the code is yours” or an unsigned statement of work will not do. Employee
            inventions are dealt with separately under the Patents Act 1977.
          </p>
          <h3>United States</h3>
          <p>
            Under 17 USC §101 and §201(b), work made by an employee within the scope of employment is a “work made
            for hire” owned by the employer. A contractor’s work only qualifies as work made for hire if it falls
            within nine statutory categories and the parties sign a written agreement saying so. Software usually
            does not fit those categories. The safe route is an express assignment, which 17 USC §204(a) requires
            to be in writing and signed by the owner of the rights. Patents also need an express assignment.
          </p>
          <p>
            California adds two traps. Employee invention assignments must respect the limits in California Labor
            Code §§2870–2872, including the required notice. And a work-for-hire clause with a California
            contractor can, under Labor Code §3351.5(c), cause them to be treated as an employee for some
            purposes, which is one reason US counsel often prefer a straight assignment for contractors.
            Confidentiality agreements should also carry the whistleblower notice in the Defend Trade Secrets Act,
            18 USC §1833(b).
          </p>
          <h2 id="where-it-goes-wrong">Where assignments go wrong</h2>
          <p>Having a document is not the same as having a good one. The defects lawyers find most often:</p>
          <ul>
            {WHERE_ASSIGNMENTS_GO_WRONG_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ul>
          <h2 id="checklist">The clean-up checklist</h2>
          <ol>
            {THE_CLEAN_UP_CHECKLIST_LIST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <h2 id="how-vero-checks">How Vero Scan checks this</h2>
          <p>
            Intellectual property is one of the six areas in the score, and contractor assignments are among the
            few findings that can be rated critical: one missing assignment for the person who built the core
            product caps the layer in the red, however many other items pass.
          </p>
          <ul>
            <li>
              <strong>By questionnaire:</strong>{" "}
              the scan asks where your team is based, who is an employee and who is a contractor, and whether
              founders assigned pre-incorporation IP. That builds the list of assignments your company should hold
              under the law of each country.
            </li>
            <li>
              <strong>By document:</strong>{" "}
              agreements uploaded to the{" "}
              <a href="/product">vault</a>{" "}
              are classified and checked for parties, dates, signature status and assignment language.
            </li>
            <li>
              <strong>By lawyer review:</strong>{" "}
              a Code &amp; Clause lawyer confirms whether each assignment is actually sufficient, which is the
              question software cannot answer alone.
            </li>
            <li>
              <strong>Automatically:</strong>{" "}
              registered trade marks and patents are checked against public registers such as USPTO, where the
              company’s name is the applicant or owner.
            </li>
          </ul>
          <p>
            Gaps are written as business consequences. For example: “No IP assignment from the lead developer who
            built the core product between January 2023 and August 2024. The company may not own the technology it
            sells. This will be raised in due diligence and must be fixed before a round can close.” See the{" "}
            <a href="/for-founders">IP ownership</a>{" "}
            use case for more.
          </p>
          <p>
            <strong>See where your company stands.</strong>{" "}
            Vero Scan is in early access.{" "}
            <a href="/waitlist">Join the waitlist</a>{" "}
            to run your first scan when it opens, or{" "}
            <a href="/contact">book a demo</a>{" "}
            to walk through the IP layer with Code &amp; Clause.
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

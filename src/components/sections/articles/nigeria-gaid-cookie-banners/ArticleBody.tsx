import type { FaqItem } from "@/components/ui/FaqList";
import { Button } from "@/components/ui/Button";
import { FaqList } from "@/components/ui/FaqList";
import { cx } from "@/lib/cx";

interface PostAsideTocItem {
  readonly label: string;
  readonly href: string;
}

const POST_ASIDE_TOC_ITEMS: readonly PostAsideTocItem[] = [
  { label: "What changed on 19 September 2025", href: "#what-changed" },
  { label: "Article 7(1)(l): placement and prominence", href: "#article-7" },
  { label: "Article 19: what valid consent looks like", href: "#article-19" },
  { label: "The notice behind the banner", href: "#privacy-notice" },
  { label: "A ten-point banner check", href: "#checklist" },
  { label: "How Vero Scan checks this", href: "#how-vero-checks" },
  { label: "FAQs", href: "#faq" },
];

interface WhatChangedOnSeptemberListItem {
  readonly term: string;
  readonly text: string;
}

const WHAT_CHANGED_ON_SEPTEMBER_LIST_ITEMS: readonly WhatChangedOnSeptemberListItem[] = [
  {
    term: "It is not only for Nigerian companies.",
    text: "The NDPA is generally read as reaching anyone who processes personal data of people in Nigeria, wherever the company is incorporated. A UK or Delaware company with Nigerian users should read GAID too.",
  },
  {
    term: "The privacy notice is a statutory document.",
    text: "NDPA s.27 lists what a notice must tell people; GAID adds how and where it must be presented.",
  },
  {
    term: "Registration and audits sit alongside it.",
    text: "Data controllers and processors of major importance must register with the NDPC under NDPA s.44. Those in the higher tiers file an annual Compliance Audit Return (CAR) through a licensed Data Protection Compliance Organisation, due 31 March each year. The 2025 cycle was extended to 30 May 2026.",
  },
];

const GUIDE_PROSE_ITEMS: readonly string[] = [
  "Article 7 of GAID deals with the information a controller must give and the way it must be given. Paragraph (1)(l) is the part that catches cookie banners: notices must be presented on the homepage, and the cookie notice must be prominent enough that a visitor engages with it rather than scrolling past.",
  "Vero Scan’s Nigeria rule, reviewed by Code & Clause, applies the provision this way: the cookie notice should obstruct the middle, left or right of the page. A narrow bar pinned to the bottom of the screen, which is the default layout of many consent tools, does not meet that standard, because a visitor can use the whole site without ever touching it.",
  "In practice that means:",
];

const ARTICLE_L_PLACEMENT_AND_LIST_ITEMS: readonly string[] = [
  "a centred modal, or a panel on the left or right, shown on the first visit to the homepage;",
  "the privacy notice linked from the homepage itself, not only from a footer several clicks deep;",
  "the banner shown before any non-essential cookie or tracker loads, not after.",
];

interface ArticleWhatValidConsentListItem {
  readonly term: string;
  readonly text: string;
}

const ARTICLE_WHAT_VALID_CONSENT_LIST_ITEMS: readonly ArticleWhatValidConsentListItem[] = [
  {
    term: "Explicit accept and reject.",
    text: "“Reject” is offered alongside “Accept”, not hidden behind “Settings”. A single “OK” button is not a choice.",
  },
  {
    term: "Purpose stated.",
    text: "The banner says what the cookies are for (analytics, advertising, personalisation), not a generic “we use cookies to improve your experience”.",
  },
  {
    term: "Withdrawal explained.",
    text: "Users are told how to change their mind, and the route works. A persistent “Cookie settings” link is the usual answer.",
  },
  {
    term: "Nothing before the choice.",
    text: "Pre-ticked boxes, and trackers that fire on page load, fail however well the banner is worded.",
  },
];

const THE_NOTICE_BEHIND_THE_LIST_ITEMS: readonly string[] = [
  "who the controller is, matching the legal name on the CAC register;",
  "the purposes of processing and the lawful basis for each;",
  "who receives the data, including vendors outside Nigeria;",
  "the data subject rights in Part VI of the NDPA and how to exercise them;",
  "how long data is kept, and the right to complain to the NDPC;",
  "any automated decision-making, and the right to object to it.",
];

const A_TEN_POINT_BANNER_LIST_ITEMS: readonly string[] = [
  "The cookie notice appears on the first visit to the homepage, before any interaction.",
  "It sits in the middle, left or right of the page, not as a bottom bar.",
  "“Accept” and “Reject” appear on the same layer, with equal prominence.",
  "Each category of cookie is named with its purpose.",
  "No boxes are pre-ticked.",
  "No analytics or advertising cookies are set before a choice is made.",
  "After “Reject”, no new non-essential tracker loads.",
  "The choice is remembered, and a “Cookie settings” link lets users withdraw it.",
  "The privacy notice is linked from the homepage and meets NDPA s.27.",
  "The DPO contact is published if you are a controller of major importance.",
];

interface HowVeroScanChecksListItem {
  readonly term: string;
  readonly text: string;
}

const HOW_VERO_SCAN_CHECKS_LIST_ITEMS: readonly HowVeroScanChecksListItem[] = [
  {
    term: "Loads your site in a clean browser",
    text: "twice, once without interaction and once after “Reject all”, and records every cookie, storage entry and third-party request.",
  },
  {
    term: "Detects the consent tool",
    text: "and tests the banner against GAID: position, accept and reject on the same layer, purposes listed, no pre-ticked boxes, withdrawal available.",
  },
  {
    term: "Reads the privacy notice",
    text: "against NDPA s.27 and GAID Articles 11(2), 27 and 45, and checks the controller name against the CAC record.",
  },
];

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Does GAID apply if my company is not incorporated in Nigeria?",
    answer: (
      <>
        <p>
          It can. The NDPA is generally read as applying to anyone who processes personal data of people in
          Nigeria, wherever the company is based. If your product has Nigerian users, plan on meeting GAID’s
          notice and consent rules.
        </p>
        <p>
          Registration with the NDPC is a separate question. It depends on how many Nigerian data subjects you
          process in a six-month period and on your sector.
        </p>
      </>
    ),
  },
  { question: "Is a bottom cookie bar ever acceptable in Nigeria?", answer: "Vero Scan’s Nigeria rule, reviewed by Code & Clause, treats a bottom bar as failing GAID Article 7(1)(l), because it does not obstruct the middle, left or right of the page. A centred modal or a side panel is the safer layout." },
  { question: "Do strictly necessary cookies need consent?", answer: "Cookies the site cannot work without, such as session, security and load-balancing cookies, are generally treated as outside the consent requirement. They should still be listed in the cookie notice. Analytics and advertising cookies need consent before they load." },
  {
    question: "What happens if we get it wrong?",
    answer: (
      <>
        <p>
          The NDPC can issue compliance notices and impose fines under the NDPA, and it has shown it will act
          at scale: it issued 1,368 compliance notices in August 2025.
        </p>
        <p>
          There is also a commercial cost. Cookie behaviour is visible from outside, so investors and
          enterprise customers check it during due diligence.
        </p>
      </>
    ),
  },
  { question: "How often should we re-test the banner?", answer: "Every time you add a tag, pixel or SDK, and at least once a quarter. Marketing tools are often added without anyone checking whether they respect the consent choice. Ongoing monitoring re-runs the check and flags changes." },
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
              href="mailto:?subject=Your cookie banner is probably non-compliant in Nigeria: what GAID 2025 Articles 7 and 19 require"
              data-subject="Your cookie banner is probably non-compliant in Nigeria: what GAID 2025 Articles 7 and 19 require"
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
            Most Nigerian websites still greet visitors the same way: a thin strip along the bottom of the screen,
            a single “Accept” or “Got it” button, and analytics already running in the background. Since 19
            September 2025 that pattern has a problem. The General Application and Implementation Directive (GAID)
            2025, issued by the Nigeria Data Protection Commission (NDPC) under the Nigeria Data Protection Act
            (NDPA) 2023, sets out how notices and consent must work on a website or app, and the bottom-bar banner
            fails it on more than one count.
          </p>
          <p>
            This guide explains what Articles 7 and 19 of GAID require, what the regulator expects to find behind
            the banner, and how to check your own site in under an hour.
          </p>
          <h2 id="what-changed">What changed on 19 September 2025</h2>
          <p>
            The NDPA 2023 replaced the old NDPR framework as Nigeria’s primary data protection law. GAID 2025,
            issued on 20 March 2025 and in force from 19 September 2025, is the NDPC’s directive on how the Act
            applies in practice. It turns general duties (be transparent, have a lawful basis, respect data
            subject rights) into specific expectations for websites, apps, audits and registrations.
          </p>
          <p>Three points matter for a technology company:</p>
          <ul>
            {WHAT_CHANGED_ON_SEPTEMBER_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ul>
          <h2 id="article-7">Article 7(1)(l): placement and prominence</h2>
          {GUIDE_PROSE_ITEMS.map((item) => (
            <p key={item}>{item}</p>
          ))}
          <ul>
            {ARTICLE_L_PLACEMENT_AND_LIST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            The placement test is visual, so it is easy to run: open your site in a private window on a phone and
            on a laptop, and look at what a first-time visitor actually sees.
          </p>
          <h2 id="article-19">Article 19: what valid consent looks like</h2>
          <p>
            Article 19 sets the standard for consent collected through cookies and similar technologies. Read with
            the NDPA’s general consent rules, it requires a clear, affirmative choice made with enough information
            to understand it. For a banner, that comes down to four tests:
          </p>
          <ul>
            {ARTICLE_WHAT_VALID_CONSENT_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ul>
          <p>
            The last test is where most sites fail. A banner can look perfect while analytics and advertising
            pixels have already set cookies in the background. The only way to know is to load the page in a clean
            browser and inspect what is set before anyone clicks.
          </p>
          <h2 id="privacy-notice">The notice behind the banner</h2>
          <p>
            A compliant banner points to a compliant notice. Under NDPA s.27 and GAID, the privacy notice should
            cover, in plain language:
          </p>
          <ul>
            {THE_NOTICE_BEHIND_THE_LIST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            GAID adds three expectations that are often missed. Article 11(2) requires the Data Protection
            Officer’s contact details to be published where the controller is one of major importance. Article 27
            requires information to be given in clear, plain language; a notice copied from a European template
            that cites only the GDPR rarely passes. Article 45 deals with cross-border transfers: if your data is
            hosted or processed outside Nigeria, the notice should state the basis for the transfer.
          </p>
          <h2 id="checklist">A ten-point banner check</h2>
          <p>Run through this list on your production site, in a private browser window:</p>
          <ol>
            {A_TEN_POINT_BANNER_LIST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p>
            If you fail items 2, 3 or 6, the fix is usually a configuration change in your consent tool rather
            than a rebuild. Most consent management platforms support a centred layout, a first-layer reject
            button and script blocking until consent. They are simply not the defaults.
          </p>
          <h2 id="how-vero-checks">How Vero Scan checks this</h2>
          <p>
            Cookie compliance is one of the few legal obligations that can be tested from the outside, so Vero
            Scan verifies it automatically, as a check made live against the site. For a company with users in
            Nigeria, the Nigeria module:
          </p>
          <ul>
            {HOW_VERO_SCAN_CHECKS_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
            <li>
              <strong>Checks the NDPC register</strong>
              , which GAID Article 9(7) requires the Commission to publish, to see whether the company appears as
              a controller or processor of major importance.
            </li>
          </ul>
          <p>
            What cannot be seen from outside is handled by document or attestation. Your record of processing
            activities, consent logs, data processing agreements and CAR filing receipt go into the{" "}
            <a href="/product">document vault</a>
            , and a Code &amp; Clause lawyer can review them. Every finding shows its source and verification
            tier, and every gap is written as a business consequence, tagged with the instrument it comes from.
          </p>
          <p>
            If you also have users in the UK or the EU, the same scan applies PECR as amended by the Data (Use and
            Access) Act 2025, and ePrivacy Directive Article 5(3) as implemented in each member state. The{" "}
            <a href="/for-founders">data protection</a>{" "}
            page lists every rule the scan applies.
          </p>
          <p>
            <strong>See where your company stands.</strong>{" "}
            Vero Scan is in early access.{" "}
            <a href="/waitlist">Join the waitlist</a>{" "}
            to run your first scan when it opens, or{" "}
            <a href="/contact">book a demo</a>{" "}
            to walk through the Nigeria module with Code &amp; Clause.
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

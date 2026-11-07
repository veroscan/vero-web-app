interface GuideTocItem {
  readonly label: string;
  readonly href: string;
}

const GUIDE_TOC_ITEMS: readonly GuideTocItem[] = [
  { label: "Introduction", href: "#section-1" },
  { label: "Who we are and how to contact us", href: "#section-2" },
  { label: "Personal data we collect", href: "#section-3" },
  { label: "How we use it and why", href: "#section-4" },
  { label: "Cookies", href: "#section-5" },
  { label: "Sharing and sub-processors", href: "#section-6" },
  { label: "International transfers", href: "#section-7" },
  { label: "Retention", href: "#section-8" },
  { label: "Your rights", href: "#section-9" },
  { label: "Complaints", href: "#section-10" },
  { label: "Security", href: "#section-11" },
  { label: "Children", href: "#section-12" },
  { label: "Changes and contact", href: "#section-13" },
];

interface PersonalDataWeCollectListItem {
  readonly term: string;
  readonly text: string;
}

const PERSONAL_DATA_WE_COLLECT_LIST_ITEMS: readonly PersonalDataWeCollectListItem[] = [
  {
    term: "Waitlist form:",
    text: "your name, work email address, company name, role, the country your company is incorporated in, the type of user you are (for example founder, investor or accelerator) and anything you choose to tell us in the optional message field.",
  },
  {
    term: "Demo request form:",
    text: "the same details, plus your preferred time for a call and what you would like to discuss.",
  },
  { term: "Emails and messages:", text: "the content of any email you send us and our replies." },
  {
    term: "Technical data:",
    text: "your IP address, browser and device type, pages visited, the page that referred you and the time of your visit, collected through server logs and, where you allow it, cookies.",
  },
  { term: "Email engagement:", text: "whether our emails were delivered and, where you allow it, opened." },
];

interface HowWeUseItListItem {
  readonly term: string;
  readonly text: string;
}

const HOW_WE_USE_IT_LIST_ITEMS: readonly HowWeUseItListItem[] = [
  {
    term: "Running the waitlist and inviting you to early access",
    text: "— your consent, given when you join the waitlist. You can withdraw it at any time.",
  },
  {
    term: "Answering demo requests and arranging calls",
    text: "— steps you ask us to take before entering into a contract, and our legitimate interest in replying to enquiries.",
  },
  {
    term: "Sending Vero Scan product updates and launch news",
    text: "— your consent. Every email has an unsubscribe link.",
  },
  {
    term: "Operating and securing the website",
    text: "— our legitimate interest in keeping the website available, secure and free of abuse.",
  },
  {
    term: "Understanding how the website is used",
    text: "— your consent where cookies or similar technologies need it, otherwise our legitimate interest in improving the website.",
  },
  {
    term: "Meeting legal and regulatory obligations",
    text: "— compliance with a legal obligation, for example record-keeping, responding to regulators, or establishing and defending legal claims.",
  },
];

const GUIDE_PROSE_ITEMS: readonly string[] = [
  "Code & Clause is based in Nigeria. Our service providers may store or process personal data in other countries, including the United Kingdom, the European Economic Area and the United States.",
  "When personal data leaves the country where it was collected, we use a transfer mechanism recognised by the applicable law. Depending on the route, this may be an adequacy decision or regulation, the UK International Data Transfer Agreement or Addendum, the European Commission's standard contractual clauses, a provider's certification under the EU–US Data Privacy Framework, or the safeguards the NDPA and GAID require for transfers out of Nigeria, together with a transfer risk assessment where one is required.",
  "You can ask us which safeguard applies to a particular transfer.",
];

interface HowLongWeKeepListItem {
  readonly term: string;
  readonly text: string;
}

const HOW_LONG_WE_KEEP_LIST_ITEMS: readonly HowLongWeKeepListItem[] = [
  {
    term: "Waitlist details:",
    text: "until you leave the waitlist, or 24 months after our last contact with you, whichever is earlier.",
  },
  {
    term: "Demo requests and related emails:",
    text: "24 months after our last contact, unless you become a client, in which case our client-file retention rules apply.",
  },
  {
    term: "Marketing preferences and unsubscribe records:",
    text: "for as long as needed to respect your choice not to be contacted.",
  },
  { term: "Cookie consent records:", text: "for the life of the consent plus 12 months." },
  { term: "Server and security logs:", text: "up to 90 days, unless needed to investigate an incident." },
];

const YOUR_RIGHTS_LIST_ITEMS: readonly string[] = [
  "to be told how your personal data is used (this policy);",
  "to access the personal data we hold about you and receive a copy;",
  "to have inaccurate data corrected and incomplete data completed;",
  "to have your data erased where there is no good reason for us to keep it;",
  "to restrict how we use your data in certain circumstances;",
  "to receive your data in a portable format, or have it sent to another controller, where processing is based on consent or contract and is automated;",
  "to object to processing based on legitimate interests, and to object at any time to direct marketing;",
  "to withdraw consent at any time, without affecting processing that took place before;",
  "not to be subject to decisions based solely on automated processing that have legal or similarly significant effects.",
];

interface ComplaintsListItem {
  readonly term: string;
  readonly text: string;
}

const COMPLAINTS_LIST_ITEMS: readonly ComplaintsListItem[] = [
  { term: "Nigeria:", text: "the Nigeria Data Protection Commission (NDPC)." },
  { term: "United Kingdom:", text: "the Information Commissioner's Office (ICO)." },
  {
    term: "European Union:",
    text: "the supervisory authority in the member state where you live or work, or where you think the problem occurred.",
  },
  {
    term: "Elsewhere:",
    text: "the data protection authority in your country, for example the Office of the Data Protection Commissioner in Kenya, the Data Protection Commission in Ghana or the Information Regulator in South Africa.",
  },
];

export function PrivacyText() {
  return (
    <section className="pad-sm u-padding-top-0">
      <div className="wrap guide">
        <nav className="toc" aria-label="On this page">
          <small>On this page</small>
          {GUIDE_TOC_ITEMS.map((item) => (
            <a key={item.label} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <article className="prose">
          <div className="draft-flag">
            <b>Draft for lawyer review</b>
            <p>
              Draft — to be reviewed and approved by Code &amp; Clause before publication. Text in square brackets
              marks a decision or detail Code &amp; Clause still needs to confirm.
            </p>
          </div>
          <h2 id="section-1">Introduction</h2>
          <p>
            This privacy policy explains how Code and Clause LTD, trading as Code &amp; Clause Legal (“Code &amp;
            Clause”, “we”, “us”), collects and uses personal data through the Vero Scan website, the Vero Scan
            waitlist, the demo request form and the emails we send about Vero Scan.
          </p>
          <p>
            The policy also covers cookies and similar technologies used on the website: see “Cookies and similar
            technologies” below. How the Vero Scan application is planned to protect documents is described on the{" "}
            <a href="/security">Security page</a>
            , and how it uses AI in the{" "}
            <a href="/terms-of-service">terms</a>
            .
          </p>
          <p>
            Vero Scan is a legal health score for technology companies, built by Code &amp; Clause. The Vero Scan
            application is not yet available. When it launches, it will have its own privacy notice covering
            company data, uploaded documents and scan results. This policy covers the website and waitlist only.
          </p>
          <p>
            We have written this policy to meet the Nigeria Data Protection Act 2023 (NDPA) and the NDPA General
            Application and Implementation Directive 2025 (GAID), the UK GDPR and Data Protection Act 2018 (as
            amended by the Data (Use and Access) Act 2025), and the EU General Data Protection Regulation (GDPR),
            as they apply to the people who use this website.
          </p>
          <h2 id="section-2">Who we are</h2>
          <p>
            Code and Clause LTD is the controller of the personal data described in this policy. That means we
            decide why and how it is used.
          </p>
          <ul>
            <li>Code and Clause LTD, trading as Code &amp; Clause Legal</li>
            <li>Suite 191B Jide Oki Street, Off Ligali Ayorinde, Victoria Island, Lagos, Nigeria</li>
            <li>
              Email:{" "}
              <a href="mailto:hello@codeclauselegal.com">hello@codeclauselegal.com</a>
            </li>
          </ul>
          <p>
            Data protection officer: [Code &amp; Clause to confirm whether a data protection officer is appointed
            and, if so, their contact details].
          </p>
          <p>
            Representatives: [Code &amp; Clause to confirm whether a UK representative under Article 27 UK GDPR
            and an EU representative under Article 27 GDPR are required for the website and waitlist, and to name
            them if so].
          </p>
          <h2 id="section-3">Personal data we collect</h2>
          <p>
            We collect only what we need to run the waitlist, answer demo requests and keep the website working.
          </p>
          <ul>
            {PERSONAL_DATA_WE_COLLECT_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ul>
          <p>
            Please do not send contracts, cap tables or other confidential documents through the website forms.
            The forms are not designed for them.
          </p>
          <p>
            We do not ask for special category (sensitive) personal data through the website, and we do not
            knowingly collect data about children.
          </p>
          <h2 id="section-4">How we use it and our lawful bases</h2>
          <p>
            We use your personal data for the purposes below. For each purpose we rely on a lawful basis
            recognised by the NDPA, the UK GDPR and the GDPR.
          </p>
          <ul>
            {HOW_WE_USE_IT_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ul>
          <p>
            Where we rely on legitimate interests, we have weighed them against your interests and rights and
            concluded that they are not overridden. You can ask us for more detail.
          </p>
          <p>
            We do not make decisions about you based solely on automated processing that have legal or similarly
            significant effects. We do not sell your personal data.
          </p>
          <h2 id="section-5">Cookies and similar technologies</h2>
          <p>The website uses cookies and similar technologies in two categories.</p>
          <ul>
            <li>
              <strong>Strictly necessary:</strong>{" "}
              needed for the website to work and to remember your cookie choices. These do not need consent.
            </li>
            <li>
              <strong>Analytics and other non-essential cookies:</strong>{" "}
              used only if you accept them through the cookie banner. “Reject” is offered as clearly as “Accept”,
              and you can change your choice at any time from the cookie settings link in the footer.
            </li>
          </ul>
          <p>
            We keep a record of your cookie choice so we can show that consent was given. Where the law allows
            certain analytics cookies without consent (for example under the UK&apos;s Privacy and Electronic
            Communications Regulations as amended by the Data (Use and Access) Act 2025), we will still tell you
            about them and let you opt out.
          </p>
          <p>
            [Cookie table listing each cookie, its provider, purpose and duration to be inserted once the
            website&apos;s analytics and form tools are chosen.]
          </p>
          <h2 id="section-6">Who we share it with</h2>
          <p>We share personal data only where needed for the purposes above:</p>
          <ul>
            <li>
              <strong>Service providers (sub-processors)</strong>{" "}
              that run parts of the website for us and act only on our instructions under a written contract: a
              website hosting provider, an email delivery provider, a form and scheduling provider and, if
              enabled, an analytics provider. [Names and locations to be listed here once each provider is
              chosen.]
            </li>
            <li>
              <strong>Code &amp; Clause staff and lawyers</strong>{" "}
              who need the information to manage the waitlist, answer your request or prepare a demo.
            </li>
            <li>
              <strong>Professional advisers</strong>
              , such as auditors, insurers and external counsel, who are bound by confidentiality.
            </li>
            <li>
              <strong>Regulators, courts and law enforcement</strong>{" "}
              where the law requires it.
            </li>
            <li>
              <strong>A buyer or successor</strong>{" "}
              if Code &amp; Clause or the Vero Scan business is reorganised, merged or sold, subject to
              confidentiality and this policy.
            </li>
          </ul>
          <p>
            We will keep an up-to-date list of sub-processors and send it to you on request at{" "}
            <a href="mailto:hello@codeclauselegal.com">hello@codeclauselegal.com</a>
            .
          </p>
          <h2 id="section-7">International transfers</h2>
          {GUIDE_PROSE_ITEMS.map((item) => (
            <p key={item}>{item}</p>
          ))}
          <h2 id="section-8">How long we keep it</h2>
          <p>
            We keep personal data only for as long as we need it for the purpose it was collected for. Our
            proposed retention periods are [for Code &amp; Clause to confirm]:
          </p>
          <ul>
            {HOW_LONG_WE_KEEP_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ul>
          <p>At the end of the period we delete the data or make it anonymous.</p>
          <h2 id="section-9">Your rights</h2>
          <p>
            Depending on where you live and which law applies, you have some or all of these rights under the NDPA
            and GAID, the UK GDPR and the GDPR:
          </p>
          <ul>
            {YOUR_RIGHTS_LIST_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            To use any of these rights, email{" "}
            <a href="mailto:hello@codeclauselegal.com">hello@codeclauselegal.com</a>
            . We may need to confirm your identity first. We will respond within the time the applicable law
            requires. Under the UK GDPR and GDPR this is one month, which can be extended in some cases. There is
            normally no fee.
          </p>
          <h2 id="section-10">Complaints</h2>
          <p>
            If you are unhappy with how we have handled your personal data, please contact us first at{" "}
            <a href="mailto:hello@codeclauselegal.com">hello@codeclauselegal.com</a>{" "}
            so we can try to put it right.
          </p>
          <p>You also have the right to complain to a data protection authority:</p>
          <ul>
            {COMPLAINTS_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ul>
          <h2 id="section-11">Security</h2>
          <p>
            We protect personal data with technical and organisational measures appropriate to the risk. These
            include encrypted connections (TLS) to the website, access limited to the people who need it,
            multi-factor authentication on administrative accounts, and written contracts requiring our providers
            to keep data secure.
          </p>
          <p>
            No website or transmission over the internet is completely secure. If a personal data breach must be
            reported, we will notify the relevant authority and, where required, the people affected, within the
            time limits set by law.
          </p>
          <h2 id="section-12">Children</h2>
          <p>
            The website and waitlist are intended for people acting for businesses, investors and organisations.
            They are not directed at children, and we do not knowingly collect personal data from anyone under 18.
            If you think a child has given us personal data, contact us and we will delete it.
          </p>
          <h2 id="section-13">Changes and contact</h2>
          <p>
            We will update this policy when our practices or the law change, and change the date at the top of the
            page. If a change is significant, we will tell people on the waitlist by email.
          </p>
          <p>Questions about this policy or your personal data can be sent to:</p>
          <ul>
            <li>Code and Clause LTD, trading as Code &amp; Clause Legal</li>
            <li>Suite 191B Jide Oki Street, Off Ligali Ayorinde, Victoria Island, Lagos, Nigeria</li>
            <li>
              Email:{" "}
              <a href="mailto:hello@codeclauselegal.com">hello@codeclauselegal.com</a>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}

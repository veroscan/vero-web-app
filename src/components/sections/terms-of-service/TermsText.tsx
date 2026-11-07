interface GuideTocItem {
  readonly label: string;
  readonly href: string;
}

const GUIDE_TOC_ITEMS: readonly GuideTocItem[] = [
  { label: "About these terms", href: "#section-2" },
  { label: "Definitions", href: "#section-3" },
  { label: "Website and waitlist", href: "#section-4" },
  { label: "Not legal advice", href: "#section-5" },
  { label: "How Vero Scan uses AI", href: "#section-ai" },
  { label: "Intellectual property", href: "#section-6" },
  { label: "Liability, law and contact", href: "#section-7" },
];

interface DefinitionsListItem {
  readonly term: string;
  readonly text: string;
}

const DEFINITIONS_LIST_ITEMS: readonly DefinitionsListItem[] = [
  {
    term: "Vero Scan",
    text: "means the legal health score product for technology companies being developed by Code & Clause, including its future application, reports and related services.",
  },
  { term: "Website", text: "means the Vero Scan marketing website and all pages, content and forms on it." },
  {
    term: "Waitlist",
    text: "means the list of people and organisations who have asked to hear about, and be considered for, early access to Vero Scan.",
  },
  {
    term: "Content",
    text: "means all text, scores, examples, illustrative scenarios, articles, graphics, designs, software and other material on the Website.",
  },
  {
    term: "You",
    text: "means the person using the Website and, where relevant, the organisation that person acts for.",
  },
];

interface TheWebsiteAndTheListItem {
  readonly term: string;
  readonly text: string;
}

const THE_WEBSITE_AND_THE_LIST_ITEMS: readonly TheWebsiteAndTheListItem[] = [
  {
    term: "Joining the waitlist.",
    text: "It does not create a contract for Vero Scan services, and it does not oblige you to buy anything.",
  },
  {
    term: "No guarantee of access or timing.",
    text: "We decide who receives early access and when, and we may close or change the waitlist at any time. Launch dates, features and country coverage described on the Website may change before launch.",
  },
  {
    term: "Illustrative content.",
    text: "Scenarios, example scores, example companies and screenshots on the Website are illustrative. They describe fictional companies and do not report results for any real customer.",
  },
  {
    term: "Your information.",
    text: "You agree that the information you give us in the waitlist and demo forms is accurate and that you are entitled to give it.",
  },
  {
    term: "Acceptable use.",
    text: "You must not use the Website unlawfully; attempt to gain unauthorised access to it or to our systems; introduce malicious code; scrape, copy or harvest Content or data by automated means; or use the Website in a way that could damage or overload it.",
  },
  {
    term: "Availability.",
    text: "We provide the Website on an “as available” basis and may change, suspend or withdraw any part of it without notice.",
  },
];

interface NotLegalAdviceListItem {
  readonly term: string;
  readonly text: string;
}

const NOT_LEGAL_ADVICE_LIST_ITEMS: readonly NotLegalAdviceListItem[] = [
  {
    term: "General information only.",
    text: "The Website and its Content give general information about Vero Scan and about legal and regulatory topics affecting technology companies. They are not legal advice and must not be relied on as legal advice.",
  },
  {
    term: "No lawyer–client relationship.",
    text: "Reading the Website, joining the waitlist or requesting a demo does not create a lawyer–client relationship between you and Code & Clause. That relationship arises only under a separate written engagement with Code & Clause.",
  },
  {
    term: "Dated content.",
    text: "Legal articles on the Website are dated and describe the law as we understood it on that date. The law changes; check the current position, and take advice on your own facts, before acting.",
  },
  {
    term: "What a score is.",
    text: "A Vero Scan score, when the product is available, will be a diagnostic signal about a company's legal infrastructure. It will not be a legal opinion, a full legal review or due diligence.",
  },
];

interface HowVeroScanUsesListItem {
  readonly term: string;
  readonly text: string;
}

const HOW_VERO_SCAN_USES_LIST_ITEMS: readonly HowVeroScanUsesListItem[] = [
  {
    term: "Purpose.",
    text: "This section applies to Vero Scan when it launches and supplements the separate application terms. Vero Scan is not yet live; we publish these commitments now so that people joining the waitlist know how the product is being built. AI helps Vero read and sort information quickly. It does not decide whether a company's legal documents are good enough: that judgement belongs to rules written and approved by Code & Clause lawyers, and to lawyer review.",
  },
  {
    term: "Document classification.",
    text: "When a company uploads a document, AI helps identify what it is (for example an IP assignment, contractor agreement, SAFE, shareholders' agreement, data processing agreement, privacy policy or board resolution) and extracts basic facts: parties, dates, governing law, signature status and key clauses. Simple rules based on file names and titles run first; AI is used where they are not enough.",
  },
  {
    term: "Company intelligence.",
    text: "AI helps summarise public information about a company, such as its website, app store listings, job listings and public filings, into a profile of what it builds, its sector, its markets and its stage. This uses public information only and never documents in a company's vault.",
  },
  {
    term: "What AI does not do.",
    text: "It does not decide whether a document is legally sufficient: AI can detect that a SAFE is present, but only a lawyer can tell you whether its conversion mechanics work with your cap table. It does not calculate the Legal Health Score on its own, because the score is calculated by rules that Code & Clause lawyers write and approve. It does not give legal advice, and it does not make decisions about individuals that have legal or similarly significant effects.",
  },
  {
    term: "Human and lawyer review.",
    text: "Every AI classification is shown with a confidence level. The user confirms which vault slot a document belongs in, and low-confidence results are marked “needs review” and are not counted until they are confirmed. A Code & Clause lawyer reviews the key documents and records whether each is sufficient or not sufficient, with notes. A verified Legal Health badge is only issued after that lawyer review.",
  },
  {
    term: "No training on customer documents.",
    text: "We do not use documents that customers upload, or the results of their scans, to train or fine-tune any AI model, whether ours or a provider's. Our provider contracts must say the same.",
  },
  {
    term: "Providers.",
    text: "Vero Scan will use a commercial AI model provider under contract terms that prohibit the provider from using customers' data to train or improve its models, with zero data retention where the provider offers it. Where customers need their data processed in the UK or EU, we will use a provider region that meets that need. The provider will be a sub-processor under a data processing agreement and will be named in our sub-processor list before launch. [Provider and region to be confirmed by Code & Clause.]",
  },
  {
    term: "Data minimisation and control.",
    text: "Only the pages or clauses needed for a task are sent to the AI model, not whole document sets. Passwords, API keys, access tokens and other credentials are never sent. Each organisation can switch AI processing off, and documents are then classified by the user and by rules alone. We will complete a data protection impact assessment for AI processing before launch, because uploaded documents can contain names, salaries and identification details.",
  },
  {
    term: "Accuracy and sources.",
    text: "Every flag in a Vero report shows its source and the date it was retrieved, with a confidence level where AI or matching was involved. A “not found” result is never presented as proof that something does not exist. If you think a classification or finding is wrong, you can correct it and the score updates; corrections are logged.",
  },
  {
    term: "Records and retention.",
    text: "Every AI request is recorded in an audit log showing when it was made and for which organisation. The log never records document content or secrets. Classification results are stored with the document's record for as long as the document is in the vault, and deleted when the document or the account is deleted. [Detailed retention periods to be set in the product privacy notice before launch.]",
  },
  {
    term: "Laws and review.",
    text: "We design Vero's AI use to meet the NDPA 2023 and GAID 2025, the UK GDPR and the GDPR. We will record each AI use in an AI inventory and classify it under the EU AI Act. We do not expect Vero's planned uses to fall within the Act's high-risk categories; we will confirm this classification before launch and give the transparency information the Act requires. We will review this section at least once a year and whenever we change our AI provider, the data we send to AI, or the way AI output is used. Material changes will be published here with a new date.",
  },
  {
    term: "Questions.",
    text: "Questions about AI processing, requests to switch it off, and data processing agreements can be sent to hello@codeclauselegal.com.",
  },
];

interface IntellectualPropertyListItem {
  readonly term: string;
  readonly text: string;
}

const INTELLECTUAL_PROPERTY_LIST_ITEMS: readonly IntellectualPropertyListItem[] = [
  {
    term: "Ownership.",
    text: "Code & Clause or its licensors own all intellectual property rights in the Website and its Content, including the Vero Scan name, the “vero” wordmark and the check-mark “v”. Nothing in these Terms transfers any of those rights to you.",
  },
  {
    term: "Permitted use.",
    text: "You may view the Website and print or save reasonable extracts of articles for your own internal, non-commercial use, provided you keep any copyright and source notices.",
  },
  {
    term: "Restrictions.",
    text: "You must not reproduce, republish, sell or create derivative works from the Content, or use our names, logos or marks, without our written permission.",
  },
  {
    term: "Feedback.",
    text: "If you send us ideas or feedback about Vero Scan, you allow us to use them without restriction or payment. We will not identify you publicly without your permission.",
  },
];

interface LiabilityGoverningLawAndListItem {
  readonly term: string;
  readonly text: string;
}

const LIABILITY_GOVERNING_LAW_AND_LIST_ITEMS: readonly LiabilityGoverningLawAndListItem[] = [
  {
    term: "Exclusions.",
    text: "To the extent the law allows, we exclude all warranties about the Website and its Content, including that they are accurate, complete, up to date or free of errors or viruses.",
  },
  {
    term: "No liability for reliance.",
    text: "We are not liable for any loss arising from reliance on the Website or its Content, or from any delay in, change to or cancellation of the waitlist or the launch of Vero Scan.",
  },
  {
    term: "Limit.",
    text: "Our total liability to you arising from your use of the Website and the waitlist is limited to [amount to be set by Code & Clause].",
  },
  {
    term: "What we do not exclude.",
    text: "Nothing in these Terms limits liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for anything else that cannot be limited or excluded by law. If you use the Website as a consumer, these Terms do not affect rights you have under the mandatory consumer law of your country.",
  },
  {
    term: "Third-party links.",
    text: "The Website may link to other websites, such as regulators' sites. We are not responsible for their content or practices.",
  },
  {
    term: "Governing law.",
    text: "These Terms, and any dispute about them or the Website, are governed by the laws of the Federal Republic of Nigeria. The courts of Lagos State, Nigeria have jurisdiction, subject to any mandatory right you have to bring proceedings in your country of residence.",
  },
  {
    term: "General.",
    text: "If any part of these Terms is found unenforceable, the rest remains in force. A failure or delay in enforcing any part is not a waiver. We may transfer our rights and obligations under these Terms to another organisation that takes over the Vero Scan business.",
  },
];

export function TermsText() {
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
          <h2 id="section-2">About these terms</h2>
          <p>
            By using the Website, joining the waitlist or requesting a demo, you agree to these Terms. If you are
            acting for a company or other organisation, you confirm that you are authorised to accept these Terms
            on its behalf.
          </p>
          <p>
            We may update these Terms from time to time by publishing a new version on the Website with a new date
            at the top. The version in force when you use the Website applies. If a change materially affects
            people on the waitlist, we will tell them by email.
          </p>
          <p>
            Our{" "}
            <a href="/privacy-policy">privacy policy</a>{" "}
            explains how we use personal data collected through the Website. The section{" "}
            <a href="#section-ai">How Vero Scan uses AI</a>{" "}
            below explains how Vero Scan uses artificial intelligence.
          </p>
          <h2 id="section-3">Definitions</h2>
          <ol>
            {DEFINITIONS_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ol>
          <h2 id="section-4">The website and the waitlist</h2>
          <ol>
            {THE_WEBSITE_AND_THE_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ol>
          <h2 id="section-5">Not legal advice</h2>
          <ol>
            {NOT_LEGAL_ADVICE_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ol>
          <h2 id="section-ai">How Vero Scan uses AI</h2>
          <ol>
            {HOW_VERO_SCAN_USES_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ol>
          <h2 id="section-6">Intellectual property</h2>
          <ol>
            {INTELLECTUAL_PROPERTY_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
          </ol>
          <h2 id="section-7">Liability, governing law and contact</h2>
          <ol>
            {LIABILITY_GOVERNING_LAW_AND_LIST_ITEMS.map((item) => (
              <li key={item.term}>
                <strong>{item.term}</strong>{" "}
                {item.text}
              </li>
            ))}
            <li>
              <strong>Contact.</strong>{" "}
              Questions about these Terms can be sent to{" "}
              <a href="mailto:hello@codeclauselegal.com">hello@codeclauselegal.com</a>{" "}
              or to Code and Clause LTD, Suite 191B Jide Oki Street, Off Ligali Ayorinde, Victoria Island, Lagos,
              Nigeria.
            </li>
          </ol>
        </article>
      </div>
    </section>
  );
}

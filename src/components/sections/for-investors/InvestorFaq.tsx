import { Eyebrow } from "@/components/ui/Eyebrow";

interface FaqSvFaqListItem {
  readonly question: string;
  readonly text: string;
}

const FAQ_SV_FAQ_LIST_ITEMS: readonly FaqSvFaqListItem[] = [
  {
    question: "Is the badge proof that a company is compliant?",
    text: "No. It is a signal. It means the score is 80 or more, there are no urgent issues, and a Code & Clause lawyer has read the key documents in the last 12 months. It is not legal advice or full due diligence, and it shows what had been checked on the date of the report.",
  },
  {
    question: "Can I scan a company without its help?",
    text: "You can get a first read from public data only. Anything that needs documents depends on the company sharing them. “Not found” is never proof that something does not exist.",
  },
  {
    question: "How current is a report?",
    text: "Each report carries its date. UK records are read live from Companies House on the day. Nigerian records come from a licensed provider and Delaware from a dated certificate or a licensed provider. Those two are never shown as live.",
  },
  {
    question: "Can I follow my portfolio in Vero Scan?",
    text: "Not yet. Portfolio tools, such as watching your companies’ scores over time, are planned for later. They are not part of the first release.",
  },
  {
    question: "What does it cost?",
    text: "We have not published pricing yet. The first read is free. Paid plans add document reading and lawyer review. Join the waitlist and we will tell you when plans open.",
  },
];

export function InvestorFaq() {
  return (
    <section className="pad-sm" id="faq">
      <div className="wrap sv-faq">
        <div className="sec-head">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="h2" data-split="">Investor questions</h2>
          <p className="muted">
            Something else? Write to{" "}
            <a className="text-link" href="mailto:hello@codeclauselegal.com">hello@codeclauselegal.com</a>
            .
          </p>
        </div>
        <div className="sv-faq-list">
          <details className="qa" open>
            <summary>What do I see when a company shares its report?</summary>
            <div className="a">
              <p>
                A public page with the score out of 100, the six areas, how many issues are open and what has been
                checked, with the date. The details of each issue stay private unless the company shares them.
              </p>
            </div>
          </details>
          {FAQ_SV_FAQ_LIST_ITEMS.map((item) => (
            <details key={item.question} className="qa">
              <summary>{item.question}</summary>
              <div className="a">
                <p>{item.text}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

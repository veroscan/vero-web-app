import { SectionHead } from "@/components/ui/SectionHead";

export function InvestorFeatures() {
  return (
    <section className="pad-sm">
      <div className="wrap">
        <SectionHead
          eyebrow="What you see"
          title="Everything an investor needs to decide whether to go deeper."
        />
        <div className="sv-feats">
          <article className="sv-feat" data-reveal="">
            <span className="sv-feat-ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 3h9l4 4v14H6z" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            </span>
            <h3>A public report page</h3>
            <p>
              A link the company sends you. It shows the score, the six areas and what has been checked, with the
              date of the report.
            </p>
          </article>
          <article className="sv-feat" data-reveal="">
            <span className="sv-feat-ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 17a8 8 0 0 1 16 0" />
                <path d="m12 17 4-6" />
              </svg>
            </span>
            <h3>A score out of 100</h3>
            <p>
              Healthy from 75, Needs work from 50 to 74, At risk under 50. An urgent issue keeps an area below 50
              until it is fixed.
            </p>
          </article>
          <article className="sv-feat" data-reveal="">
            <span className="sv-feat-ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-4.2-4.2" />
              </svg>
            </span>
            <h3>A source for every fact</h3>
            <p>
              Checked with Companies House today. From our licensed data provider. You uploaded this and we read
              it. You told us. A lawyer read this.
            </p>
          </article>
          <article className="sv-feat" data-reveal="">
            <span className="sv-feat-ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <h3>A badge that links back</h3>
            <p>
              A company that earns the badge puts it on its website. It links to its public page, so nobody has to
              take its word for it.
            </p>
          </article>
          <article className="sv-feat" data-reveal="">
            <span className="sv-feat-ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 9h18M8 9v11" />
              </svg>
            </span>
            <h3>Documents, on request</h3>
            <p>
              Ask the company for the documents behind a finding. It decides what to share. Where documents are
              needed, it has to share them.
            </p>
          </article>
          <article className="sv-feat" data-reveal="">
            <span className="sv-feat-ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="M11 8v3l2 1.5M20 20l-4.2-4.2" />
              </svg>
            </span>
            <h3>Check a company by name</h3>
            <p>
              Type a name and a country and get a first read from public data only. It is not legal advice, and it
              says where each fact came from.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

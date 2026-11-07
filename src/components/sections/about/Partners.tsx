import { LinkArrow } from "@/components/ui/LinkArrow";
import { SectionHead } from "@/components/ui/SectionHead";

export function Partners() {
  return (
    <section className="pad-sm" aria-labelledby="partner-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Work with Code & Clause"
          title="Partners we would like to hear from."
          id="partner-title"
          intro="Nothing here is a signed partnership. These are the kinds of organisations we would like to work with. Write to us and tell us about yours."
        />
        <div className="partners">
          <div className="partner" data-reveal="">
            <span className="ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z" />
              </svg>
            </span>
            <h3>Law firms and practitioners</h3>
            <p>Review how a country’s rules are written into Vero, or take on local counsel work for fixes.</p>
            <LinkArrow href="mailto:hello@codeclauselegal.com?subject=Law%20firm%20or%20practitioner">
              Enquire by email
            </LinkArrow>
          </div>
          <div className="partner" data-reveal="">
            <span className="ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 8h8M8 12h8M8 16h5" />
              </svg>
            </span>
            <h3>Registry agents</h3>
            <p>
              Registry filings, status reports and trademark searches, starting in Nigeria and the countries we
              add next.
            </p>
            <LinkArrow href="mailto:hello@codeclauselegal.com?subject=Registry%20agent">
              Enquire by email
            </LinkArrow>
          </div>
          <div className="partner" data-reveal="">
            <span className="ico">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="8" r="3.2" />
                <path d="M3 20a6 6 0 0 1 12 0M16 5a3.2 3.2 0 0 1 0 6M18 14a6 6 0 0 1 3 6" />
              </svg>
            </span>
            <h3>Accelerators and programmes</h3>
            <p>Run the same scan across a founder cohort, or pilot Vero with us and shape what it covers.</p>
            <LinkArrow href="mailto:hello@codeclauselegal.com?subject=Accelerator%20or%20programme">
              Enquire by email
            </LinkArrow>
          </div>
          <div className="partner" data-reveal="">
            <span className="ico">
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
            <h3>Document platforms</h3>
            <p>
              Connections to Google Drive, Notion, SpotDraft, DocuSign and Digify are planned. Tell us what would
              help.
            </p>
            <LinkArrow href="mailto:hello@codeclauselegal.com?subject=Document%20platform">
              Enquire by email
            </LinkArrow>
          </div>
        </div>
      </div>
    </section>
  );
}

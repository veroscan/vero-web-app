import { SectionHead } from "@/components/ui/SectionHead";

interface WhoReferTabItem {
  readonly text: string;
  readonly id: string;
  readonly ariaControls: string;
  readonly ariaSelected: "true" | "false";
}

const WHO_REFER_TABS: readonly WhoReferTabItem[] = [
  { text: "Founders and companies", id: "t-founders", ariaControls: "p-founders", ariaSelected: "true" },
  { text: "Investors and programmes", id: "t-investors", ariaControls: "p-investors", ariaSelected: "false" },
  { text: "Law firms and advisers", id: "t-advisers", ariaControls: "p-advisers", ariaSelected: "false" },
];

export function WaitlistWho() {
  return (
    <section className="pad on-dark u-overflow-hidden" id="who">
      <div className="wrap u-position-relative">
        <SectionHead
          eyebrow="Who it is for"
          title="Founders, investors, programmes and the advisers who work with them."
          intro="Vero Scan is a product of Code & Clause LTD. Launch coverage is Delaware, the United Kingdom and Nigeria. Kenya, Ghana, South Africa, Germany and France are next."
        />
        <div className="refer-tabs" role="tablist" aria-label="Who it is for">
          {WHO_REFER_TABS.map((item) => (
            <button
              key={item.text}
              type="button"
              role="tab"
              id={item.id}
              aria-controls={item.ariaControls}
              aria-selected={item.ariaSelected}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="refer-panel" id="p-founders" role="tabpanel" aria-labelledby="t-founders">
          <ul className="refer-list">
            <li>
              <span className="rf-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m20 20-4.2-4.2" />
                </svg>
              </span>
              <b>A free first read</b>
              <span>
                Start with a scan of public data and a short questionnaire. You get an approximate score and your
                top gaps.
              </span>
            </li>
            <li>
              <span className="rf-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m4 7 2 2 3-4M4 17l2 2 3-4M12 7h8M12 17h8" />
                </svg>
              </span>
              <b>A fix list in plain English</b>
              <span>
                Each gap says what is missing, why it matters and what to do, in the order we would do it.
              </span>
            </li>
            <li>
              <span className="rf-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-4 4-8 11-9-1 7-5 10-9 11zM14.5 9.5h.01" />
                </svg>
              </span>
              <b>Not incorporated yet? Join anyway</b>
              <span>Solo builders and pre-incorporation teams can scan the product they have built.</span>
            </li>
            <li>
              <span className="rf-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <b>A badge, once you earn it</b>
              <span>
                A lawyer reads your key documents. Meet the conditions and you get a public page and a badge for
                your website.
              </span>
            </li>
          </ul>
        </div>
        <div className="refer-panel" id="p-investors" role="tabpanel" aria-labelledby="t-investors" hidden>
          <ul className="refer-list">
            <li>
              <span className="rf-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m20 20-4.2-4.2" />
                </svg>
              </span>
              <b>Check a company by name</b>
              <span>
                Get a first read from public data only. It is not legal advice, and it says where each fact came
                from.
              </span>
            </li>
            <li>
              <span className="rf-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 3h9l4 4v14H6z" />
                  <path d="M9 12h6M9 16h6" />
                </svg>
              </span>
              <b>Read the report a company shares</b>
              <span>A public page with the score, the six areas and what has been checked.</span>
            </li>
            <li>
              <span className="rf-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                </svg>
              </span>
              <b>Portfolio tools come later</b>
              <span>Following the companies you have backed is planned, not available at launch.</span>
            </li>
            <li>
              <span className="rf-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M3 9h18M8 9v11" />
                </svg>
              </span>
              <b>Programmes and accelerators</b>
              <span>Cohort reviews are by enquiry. Tell us about your programme and we will be in touch.</span>
            </li>
          </ul>
        </div>
        <div className="refer-panel" id="p-advisers" role="tabpanel" aria-labelledby="t-advisers" hidden>
          <ul className="refer-list">
            <li>
              <span className="rf-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z" />
                </svg>
              </span>
              <b>Rule-pack review</b>
              <span>
                Law firms and practitioners who want to review how a country’s rules are written into Vero Scan.
              </span>
            </li>
            <li>
              <span className="rf-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
                </svg>
              </span>
              <b>Local counsel for fixes</b>
              <span>When a finding needs a local lawyer, a partner firm can take it from the report.</span>
            </li>
            <li>
              <span className="rf-ico">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
                  <path d="M3 7l9 4 9-4M12 11v10" />
                </svg>
              </span>
              <b>Document platforms</b>
              <span>Integrations with Google Drive, Notion, SpotDraft, DocuSign and Digify are planned.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

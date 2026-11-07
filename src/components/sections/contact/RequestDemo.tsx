import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface ContactGridPbListItem {
  readonly title: string;
  readonly text: string;
}

const CONTACT_GRID_PB_LIST_ITEMS: readonly ContactGridPbListItem[] = [
  { title: "Registry records", text: "Your company, read from the registers in each country." },
  { title: "The six areas", text: "A score out of 100 and the six areas behind it." },
  { title: "The gap report", text: "What is missing, why it matters and what happens if you leave it." },
  { title: "The fix list", text: "Your priority actions, in the order we would do them." },
  { title: "Lawyer verification", text: "How a Code & Clause lawyer reads your documents and confirms them." },
];

const REQUEST_A_DEMO_LIST_ITEMS: readonly string[] = [
  "Nigeria",
  "United Kingdom",
  "United States",
  "Germany or France",
  "Kenya, Ghana or South Africa",
  "Elsewhere or not yet",
];

const REQUEST_A_DEMO_LIST_ITEMS_2: readonly string[] = [
  "Referral",
  "Code & Clause",
  "Vero insights article",
  "LinkedIn",
  "Search engine",
  "Accelerator or investor",
  "Event",
  "Other",
];

export function RequestDemo() {
  return (
    <section className="pad-sm u-padding-top-0">
      <div className="wrap contact-grid">
        <div className="u-display-grid-gap-28px-align-content-start">
          <div className="contact-cards">
            <a className="c-card" href="mailto:hello@codeclauselegal.com" data-reveal="">
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
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>
              <span className="c-txt">
                <small>Email</small>
                <span className="val">hello@codeclauselegal.com</span>
              </span>
              <span className="c-arr">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </span>
            </a>
            <div className="c-card pb-static" data-reveal="">
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
                  <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
              </span>
              <span className="c-txt">
                <small>Office</small>
                <span className="val val--addr">
                  Code &amp; Clause LTD, Suite 191B Jide Oki Street, Off Ligali Ayorinde, Victoria Island, Lagos,
                  Nigeria
                </span>
              </span>
            </div>
          </div>
          <div data-reveal="">
            <Eyebrow>What a demo shows</Eyebrow>
            <ul className="pb-list">
              {CONTACT_GRID_PB_LIST_ITEMS.map((item) => (
                <li key={item.title}>
                  <b>{item.title}</b>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="small-print u-margin-0" data-reveal="">
            Vero Scan is a product of Code &amp; Clause LTD, trading as Code &amp; Clause Legal. It is not legal
            advice.
          </p>
        </div>
        <form
          className="form pb-form"
          id="demo-form"
          action="#"
          method="post"
          noValidate
          data-vero-form="demo"
          data-reveal=""
          data-sent="Thank you. We have your request and will be in touch to arrange a time."
          data-offline="This form is not connected yet, so nothing was sent. Please email us and we will arrange a time."
        >
          <div className="fs-head">
            <h2>Request a demo</h2>
            <p className="muted u-margin-6px-0-0">All fields are needed.</p>
          </div>
          <div className="hp" aria-hidden="true">
            <label>
              Leave this empty if you are a person
              <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="field" data-req="email">
            <label htmlFor="d-email">Work email</label>
            <input id="d-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@company.com" required aria-describedby="d-email-e" />
            <p className="fld-err" id="d-email-e" role="alert" hidden></p>
          </div>
          <div className="two">
            <div className="field" data-req="text">
              <label htmlFor="d-first">First name</label>
              <input id="d-first" name="first_name" autoComplete="given-name" required aria-describedby="d-first-e" />
              <p className="fld-err" id="d-first-e" role="alert" hidden></p>
            </div>
            <div className="field" data-req="text">
              <label htmlFor="d-last">Last name</label>
              <input id="d-last" name="last_name" autoComplete="family-name" required aria-describedby="d-last-e" />
              <p className="fld-err" id="d-last-e" role="alert" hidden></p>
            </div>
          </div>
          <div className="field" data-req="text">
            <label htmlFor="d-company">Company name</label>
            <input id="d-company" name="company" autoComplete="organization" required aria-describedby="d-company-e" />
            <p className="fld-err" id="d-company-e" role="alert" hidden></p>
          </div>
          <fieldset
            className="field pb-group"
            data-req="group"
            data-msg="Choose at least one thing you would like to see."
          >
            <legend>What would you like to see?</legend>
            <div className="opt-chips">
              <input type="checkbox" id="d-see-0" name="would_like_to_see" defaultValue="Company self-scan" />
              <label htmlFor="d-see-0">Company self-scan</label>
              <input type="checkbox" id="d-see-1" name="would_like_to_see" defaultValue="Investor scan by name" />
              <label htmlFor="d-see-1">Investor scan by name</label>
              <input type="checkbox" id="d-see-2" name="would_like_to_see" defaultValue="Portfolio or cohort review" />
              <label htmlFor="d-see-2">Portfolio or cohort review</label>
              <input type="checkbox" id="d-see-3" name="would_like_to_see" defaultValue="Lawyer verification" />
              <label htmlFor="d-see-3">Lawyer verification</label>
            </div>
            <p className="fld-err" role="alert" hidden></p>
          </fieldset>
          <div className="field" data-req="select">
            <label htmlFor="d-inc">Where is the company incorporated?</label>
            <select id="d-inc" name="incorporated_in" required aria-describedby="d-inc-e">
              <option value="">Choose one</option>
              {REQUEST_A_DEMO_LIST_ITEMS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <p className="fld-err" id="d-inc-e" role="alert" hidden></p>
          </div>
          <div className="field" data-req="select">
            <label htmlFor="d-hear">How did you hear about us?</label>
            <select id="d-hear" name="heard_from" required aria-describedby="d-hear-e">
              <option value="">Choose one</option>
              {REQUEST_A_DEMO_LIST_ITEMS_2.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <p className="fld-err" id="d-hear-e" role="alert" hidden></p>
          </div>
          <div className="fs-nav">
            <Button variant="green" type="submit">Request a demo</Button>
          </div>
          <div className="form-out" role="status" aria-live="polite"></div>
        </form>
      </div>
    </section>
  );
}

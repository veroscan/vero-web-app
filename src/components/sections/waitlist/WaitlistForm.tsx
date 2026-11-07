import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

interface ContactGridPbStepItem {
  readonly title: string;
  readonly term: string;
  readonly text: string;
}

const CONTACT_GRID_PB_STEPS: readonly ContactGridPbStepItem[] = [
  {
    title: "01",
    term: "You join today.",
    text: "Tell us who you are and what you are working on. It takes about a minute.",
  },
  {
    title: "02",
    term: "We email you when your place opens.",
    text: "The email says what to prepare and how to run your first scan.",
  },
  {
    title: "03",
    term: "You start with a free first read.",
    text: "It uses public data and a short questionnaire, and gives you an approximate score and your top gaps in Delaware, the United Kingdom and Nigeria.",
  },
];

const JOIN_THE_WAITLIST_LIST_ITEMS: readonly string[] = [
  "Stage 1: pre-incorporation",
  "Stage 2: incorporated, pre-revenue",
  "Stage 3: revenue, pre-raise",
  "Stage 4: raising",
  "Stage 5: post-raise, scaling",
  "Not applicable: I invest or advise",
];

const JOIN_THE_WAITLIST_LIST_ITEMS_2: readonly string[] = [
  "Referral",
  "Code & Clause",
  "Vero insights article",
  "LinkedIn",
  "Search engine",
  "Accelerator or investor",
  "Event",
  "Other",
];

export function WaitlistForm() {
  return (
    <section className="pad-sm u-padding-top-0">
      <div className="wrap contact-grid">
        <div className="u-display-grid-gap-28px-align-content-start">
          <div data-reveal="">
            <Eyebrow>What happens next</Eyebrow>
            <ol className="pb-steps">
              {CONTACT_GRID_PB_STEPS.map((item) => (
                <li key={item.title}>
                  <b>{item.title}</b>
                  <span>
                    <strong>{item.term}</strong>{" "}
                    {item.text}
                  </span>
                </li>
              ))}
            </ol>
          </div>
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
                <small>Prefer to write?</small>
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
          </div>
          <p className="small-print u-margin-0" data-reveal="">
            Pricing is not published yet. The first read is free, and paid plans add document reading and lawyer
            review. We will share pricing with waitlist members before launch. We use your details only to tell
            you about Vero Scan.
          </p>
        </div>
        <form
          className="form pb-form"
          id="waitlist-form"
          action="#"
          method="post"
          noValidate
          data-vero-form="waitlist"
          data-reveal=""
          data-sent="You are on the list. We will email you when your place opens."
          data-offline="This form is not connected yet, so nothing was sent. Please email us and we will add you by hand."
        >
          <div className="fs-head">
            <h2>Join the waitlist</h2>
            <p className="muted u-margin-6px-0-0">All fields are needed unless marked optional.</p>
          </div>
          <div className="hp" aria-hidden="true">
            <label>
              Leave this empty if you are a person
              <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="field" data-req="email">
            <label htmlFor="w-email">Work email</label>
            <input id="w-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@company.com" required aria-describedby="w-email-e" />
            <p className="fld-err" id="w-email-e" role="alert" hidden></p>
          </div>
          <div className="two">
            <div className="field" data-req="text">
              <label htmlFor="w-first">First name</label>
              <input id="w-first" name="first_name" autoComplete="given-name" required aria-describedby="w-first-e" />
              <p className="fld-err" id="w-first-e" role="alert" hidden></p>
            </div>
            <div className="field" data-req="text">
              <label htmlFor="w-last">Last name</label>
              <input id="w-last" name="last_name" autoComplete="family-name" required aria-describedby="w-last-e" />
              <p className="fld-err" id="w-last-e" role="alert" hidden></p>
            </div>
          </div>
          <div className="field" data-req="text">
            <label htmlFor="w-company">Company name</label>
            <input id="w-company" name="company" autoComplete="organization" required aria-describedby="w-company-e" />
            <p className="fld-err" id="w-company-e" role="alert" hidden></p>
          </div>
          <fieldset className="field pb-group" data-req="group" data-msg="Choose at least one option.">
            <legend>I am joining as</legend>
            <div className="opt-chips">
              <input type="checkbox" id="w-as-0" name="joining_as" defaultValue="Founder or company" />
              <label htmlFor="w-as-0">Founder or company</label>
              <input type="checkbox" id="w-as-1" name="joining_as" defaultValue="Investor or VC" />
              <label htmlFor="w-as-1">Investor or VC</label>
              <input type="checkbox" id="w-as-2" name="joining_as" defaultValue="Accelerator or programme" />
              <label htmlFor="w-as-2">Accelerator or programme</label>
              <input type="checkbox" id="w-as-3" name="joining_as" defaultValue="Law firm or adviser" />
              <label htmlFor="w-as-3">Law firm or adviser</label>
            </div>
            <p className="fld-err" role="alert" hidden></p>
          </fieldset>
          <div className="field" data-req="select">
            <label htmlFor="w-stage">Company stage</label>
            <select id="w-stage" name="company_stage" required aria-describedby="w-stage-e">
              <option value="">Choose one</option>
              {JOIN_THE_WAITLIST_LIST_ITEMS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <p className="fld-err" id="w-stage-e" role="alert" hidden></p>
          </div>
          <div className="field" data-req="select">
            <label htmlFor="w-hear">How did you hear about us?</label>
            <select id="w-hear" name="heard_from" required aria-describedby="w-hear-e">
              <option value="">Choose one</option>
              {JOIN_THE_WAITLIST_LIST_ITEMS_2.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <p className="fld-err" id="w-hear-e" role="alert" hidden></p>
          </div>
          <div className="fs-nav">
            <Button variant="green" type="submit">Join the waitlist</Button>
          </div>
          <div className="form-out" role="status" aria-live="polite"></div>
        </form>
      </div>
    </section>
  );
}

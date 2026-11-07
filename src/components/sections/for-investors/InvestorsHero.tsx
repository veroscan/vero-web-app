import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

const SV_HERO_COPY_FIT_FOR_ITEMS: readonly string[] = [
  "Public report page",
  "Badge",
  "Sources named",
  "Delaware",
  "United Kingdom",
  "Nigeria",
];

interface FxBodyFxRowItem {
  readonly title: string;
  readonly detail: string;
  readonly fxSt: string;
  readonly fxNum: string;
  readonly tone: string;
}

const FX_BODY_FX_ROWS: readonly FxBodyFxRowItem[] = [
  {
    title: "Intellectual property",
    detail: "Who owns the code, brand and ideas",
    fxSt: "At risk",
    fxNum: "49",
    tone: "risk",
  },
  {
    title: "Compliance",
    detail: "Data protection and the licences needed",
    fxSt: "Needs work",
    fxNum: "68",
    tone: "watch",
  },
  {
    title: "Fundraising",
    detail: "Cap table, SAFEs and investor documents",
    fxSt: "Needs work",
    fxNum: "74",
    tone: "watch",
  },
  { title: "AI and data", detail: "How the company uses and trains AI", fxSt: "Healthy", fxNum: "75", tone: "good" },
  {
    title: "Contracts",
    detail: "What it signs with customers, staff and suppliers",
    fxSt: "Healthy",
    fxNum: "82",
    tone: "good",
  },
  {
    title: "Company foundations",
    detail: "Registration, directors and filings",
    fxSt: "Healthy",
    fxNum: "84",
    tone: "good",
  },
];

export function InvestorsHero() {
  return (
    <section className="page-hero sv-hero">
      <div className="orb orb--ring u-width-260px-height-260px-right-neg60px-top-6pct" data-float="40"></div>
      <div className="wrap">
        <div className="crumbs" data-hero="">
          <a href="/">Home</a>{" "}
          · Solutions · For investors
        </div>
        <div className="sv-hero-grid">
          <div className="sv-hero-copy">
            <span className="sv-idx" data-hero="">For investors</span>
            <h1 className="h1" data-hero-split="">Read a company before you back it.</h1>
            <p className="lead" data-hero="">
              Open the report a company shares with you, or get a first read from public data. You see a score out
              of 100, six areas, and where every fact came from. Nobody has to take anyone’s word for it.
            </p>
            <div className="btn-row" data-hero="">
              <Button variant="green" href="/waitlist">Join the waitlist</Button>
              <Button variant="soft" href="/contact">Book a demo</Button>
            </div>
            <div className="fit-for" data-hero="">
              {SV_HERO_COPY_FIT_FOR_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div data-hero="">
            <div className="pb-hero-mock">
              <figure
                className="fx"
                data-fx="report"
                role="img"
                aria-label="Example shared report page for Kestrel Pay Inc.: score 72 out of 100, Needs work, with six areas."
              >
                <div className="fx-win">
                  <div className="fx-bar">
                    <span className="fx-co">Kestrel Pay’s legal health</span>
                    <span className="fx-nav">
                      <i>Shared by Kestrel Pay</i>
                    </span>
                  </div>
                  <div className="fx-body">
                    <div className="fx-head">
                      <div>
                        <h4>Kestrel Pay Inc.</h4>
                        <p>A solid legal base, with one urgent issue still open.</p>
                      </div>
                      <div className="fx-score">
                        <b data-fx-score="">72</b>
                        <span className="watch">Needs work</span>
                      </div>
                    </div>
                    <div className="fx-track" aria-hidden="true">
                      <i></i>
                      <i></i>
                      <i></i>
                      <span className="fx-pin u-left-72pct" data-fx-pin=""></span>
                    </div>
                    <p className="fx-count">
                      <b>12 issues still open</b>
                      <span className="risk">Urgent 1</span>
                      <span className="watch">Important 5</span>
                      <span className="quiet">Worth doing 6</span>
                    </p>
                    <div className="fx-rows">
                      {FX_BODY_FX_ROWS.map((item) => (
                        <div key={item.title} className="fx-row nobox fx-area" data-score={item.fxNum}>
                          <span className="t">
                            <b>{item.title}</b>
                            <small>{item.detail}</small>
                          </span>
                          <span className={cx("fx-st", item.tone)}>{item.fxSt}</span>
                          <span className="fx-num">{item.fxNum}</span>
                        </div>
                      ))}
                    </div>
                    <div className="fx-ex">
                      Report from 5 November 2026. Link expires in 30 days. Example company and data.
                    </div>
                  </div>
                </div>
              </figure>
            </div>
          </div>
        </div>
        <div className="answer-box sv-answer" data-hero="">
          <small>In short</small>
          <p>
            Vero Scan gives investors a signal that tells them whether a company’s legal infrastructure is clean
            enough to go deeper. It is a first filter, not legal advice and not full due diligence. Every finding
            names its country and its source, and “not found” is never treated as proof.
          </p>
        </div>
      </div>
    </section>
  );
}

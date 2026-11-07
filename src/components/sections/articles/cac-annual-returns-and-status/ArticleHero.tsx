import { cx } from "@/lib/cx";

interface WCsFactItem {
  readonly text: string;
  readonly emphasis: string;
  readonly tone: string;
}

const W_CS_FACTS: readonly WCsFactItem[] = [
  { text: "Directors", emphasis: "2 on record", tone: "" },
  { text: "Shareholders", emphasis: "3 on record", tone: "" },
  { text: "Status report", emphasis: "Not uploaded", tone: "watch" },
];

const W_CS_ROWS: readonly string[] = [
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
];

export function ArticleHero() {
  return (
    <section className="page-hero post-hero">
      <div className="orb orb--ring u-width-200px-height-200px-left-neg60px-bottom-8pct" data-float="-30"></div>
      <div className="wrap">
        <div className="crumbs" data-hero="">
          <a href="/">Home</a>{" "}
          ·{" "}
          <a href="/insights">Insights</a>{" "}
          · Corporate
        </div>
        <div className="post-head">
          <div className="post-title">
            <span className="post-chip" data-hero="">
              Corporate
              <i></i>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              6 min read
            </span>
            <h1 className="h1 post-h1" data-hero-split="">
              “Active” is not the same as compliant: CAC annual returns, status reports and what investors check
            </h1>
            <p className="lead" data-hero="">
              A company can show “active” on the CAC register and still fail corporate due diligence. What the
              status means, what annual returns and status reports prove, and the record investors expect to see.
            </p>
            <div className="byline" data-hero="">
              <span className="by-mark">
                <img src="/vero/vero-mark.svg" alt="" width="22" height="17" />
              </span>
              <span>
                By{" "}
                <a href="/about">
                  <b>Code &amp; Clause</b>
                </a>
                , cross-border technology law firm
              </span>
              <span className="by-date">
                Published{" "}
                <time dateTime="2026-11-03">3 November 2026</time>
              </span>
            </div>
          </div>
          <div
            className="post-cover"
            data-hero=""
            data-tilt=""
            role="img"
            aria-label="Illustration: a company record marked Active beside a calendar of annual return years, none confirmed"
          >
            <div className="iv iv-cac" aria-hidden="true">
              <div className="iv-in">
                <div className="iv-st st-cac">
                  <div className="w cs-reg">
                    <small>Company record</small>
                    <b>Kestrel Pay Ltd</b>
                    <div className="cs-badge">
                      <u></u>
                      Active
                    </div>
                    <ul className="cs-facts">
                      {W_CS_FACTS.map((item) => (
                        <li key={item.text}>
                          <span>{item.text}</span>
                          <em className={cx(item.tone)}>{item.emphasis}</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w cs-cal">
                    <div className="cs-ch">
                      <b>Annual returns</b>
                      <em>Example</em>
                    </div>
                    <ul className="cs-rows">
                      {W_CS_ROWS.map((item) => (
                        <li key={item}>
                          <i>?</i>
                          <span>{item}</span>
                          <em>Not confirmed</em>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="cs-verdict">
                    <u className="dot u-background-watch"></u>
                    Active, filing history unconfirmed
                    <b className="watch">Verify</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

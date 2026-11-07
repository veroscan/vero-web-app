import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
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

export function RelatedArticles() {
  return (
    <section className="pad-sm related">
      <div className="wrap">
        <div className="related-head">
          <Eyebrow>Related insights</Eyebrow>
          <h2 className="h2" data-split="">Keep reading</h2>
          <Button variant="soft" href="/insights">All insights</Button>
        </div>
        <div className="post-grid-cards post-grid-2">
          <article className="post-card" data-topic="data" data-reveal="">
            <a
              className="pc-link"
              href="/insights/nigeria-gaid-cookie-banners"
              aria-label="Your cookie banner is probably non-compliant in Nigeria: what GAID 2025 Articles 7 and 19 require"
            >
              <div className="pc-cover">
                <div className="iv iv-cookie" aria-hidden="true">
                  <div className="iv-in">
                    <div className="iv-st st-ck">
                      <div className="w ck-page">
                        <div className="ck-bar">
                          <i></i>
                          <i></i>
                          <i></i>
                          <span>kestrelpay.co</span>
                          <em>Example</em>
                        </div>
                        <div className="ck-body">
                          <b className="sk s1"></b>
                          <b className="sk s2"></b>
                          <b className="sk s3"></b>
                          <b className="sk s4"></b>
                        </div>
                      </div>
                      <div className="w ck-modal">
                        <b>Cookies on this site</b>
                        <p>Analytics and advertising cookies stay off until you choose.</p>
                        <div className="ck-sw">
                          <span>
                            Analytics
                            <i></i>
                          </span>
                          <span>
                            Advertising
                            <i></i>
                          </span>
                        </div>
                        <div className="ck-btns">
                          <span>Reject all</span>
                          <span>Accept all</span>
                        </div>
                      </div>
                      <div className="ck-verdict">
                        <u className="dot"></u>
                        Reject sits next to Accept
                        <b className="good">Done</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pc-body">
                <span className="pc-meta">
                  <span className="pc-tp">Data protection</span>
                  <time dateTime="2026-11-03">3 November 2026</time>
                  <span>
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
                    7 min read
                  </span>
                </span>
                <h3>
                  Your cookie banner is probably non-compliant in Nigeria: what GAID 2025 Articles 7 and 19
                  require
                </h3>
                <p>
                  GAID 2025 changed what a lawful cookie banner looks like in Nigeria. Here is what Articles
                  7(1)(l) and 19 require, what the notice behind the banner must say, and a ten-point check you
                  can run today.
                </p>
                <span className="pc-more">
                  Read article
                  <i>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </i>
                </span>
              </div>
            </a>
          </article>
          <article className="post-card" data-topic="corp" data-reveal="">
            <a
              className="pc-link"
              href="/insights/cac-annual-returns-and-status"
              aria-label="“Active” is not the same as compliant: CAC annual returns, status reports and what investors check"
            >
              <div className="pc-cover">
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
              <div className="pc-body">
                <span className="pc-meta">
                  <span className="pc-tp">Corporate</span>
                  <time dateTime="2026-11-03">3 November 2026</time>
                  <span>
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
                </span>
                <h3>
                  “Active” is not the same as compliant: CAC annual returns, status reports and what investors
                  check
                </h3>
                <p>
                  A company can show “active” on the CAC register and still fail corporate due diligence. What the
                  status means, what annual returns and status reports prove, and the record investors expect to
                  see.
                </p>
                <span className="pc-more">
                  Read article
                  <i>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </i>
                </span>
              </div>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

interface BlogBarFilterItem {
  readonly text: string;
  readonly filter: string;
  readonly slug: string;
}

const BLOG_BAR_FILTERS: readonly BlogBarFilterItem[] = [
  { text: "Data protection", filter: "data", slug: "data-protection" },
  { text: "IP ownership", filter: "ip", slug: "ip-ownership" },
  { text: "Corporate", filter: "corp", slug: "corporate" },
];

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

export function InsightsList() {
  return (
    <section className="pad-sm u-padding-top-0">
      <div className="wrap">
        <div className="blog-bar">
          <div className="filters" role="group" aria-label="Filter articles by topic">
            <span className="pill" aria-hidden="true"></span>
            <button type="button" data-filter="all" aria-pressed="true">
              <span>All</span>
            </button>
            {BLOG_BAR_FILTERS.map((item) => (
              <button
                key={item.text}
                type="button"
                data-filter={item.filter}
                data-slug={item.slug}
                aria-pressed="false"
              >
                <span>{item.text}</span>
              </button>
            ))}
          </div>
          <span className="blog-found" aria-live="polite">
            <b data-found="">3</b>{" "}
            articles
          </span>
        </div>
        <div className="post-grid-cards blog-grid">
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
          <article className="post-card" data-topic="ip" data-reveal="">
            <a
              className="pc-link"
              href="/insights/contractor-ip-assignment"
              aria-label="The contractor who built your product may still own it: IP assignment in Nigeria, the UK and the US"
            >
              <div className="pc-cover">
                <div className="iv iv-ip iv--ink" aria-hidden="true">
                  <div className="iv-in">
                    <div className="iv-st st-ip">
                      <div className="w ip-doc">
                        <div className="ip-head">
                          <b>Assignment of intellectual property</b>
                          <em>Example</em>
                        </div>
                        <div className="ip-p ip-l">
                          <small>Contractor</small>
                          <b>Freelance developer</b>
                        </div>
                        <div className="ip-link">
                          <span>hereby assigns</span>
                          <i className="ip-line"></i>
                          <u className="ip-tok">&lt;/&gt;</u>
                        </div>
                        <div className="ip-p ip-r">
                          <small>Company</small>
                          <b>Kestrel Pay Ltd</b>
                        </div>
                        <div className="ip-sig ip-sl">
                          <svg viewBox="0 0 108 22">
                            <line className="bl" x1="2" y1="19" x2="106" y2="19" />
                            <path pathLength="1" d="M6 14 C 12 1, 18 1, 20 12 S 30 20, 36 9 S 46 3, 50 12 S 64 18, 72 8 L 100 13" />
                          </svg>
                          <small>Signed by the contractor</small>
                        </div>
                        <div className="ip-sig ip-sr">
                          <svg viewBox="0 0 108 22">
                            <line className="bl" x1="2" y1="19" x2="106" y2="19" />
                            <path pathLength="1" d="M6 12 C 14 4, 20 4, 22 13 S 32 17, 40 7 S 52 5, 56 13 S 70 17, 78 9 L 98 11" />
                          </svg>
                          <small>Signed for the company</small>
                        </div>
                        <div className="ip-st">
                          <span className="sw2">
                            <span className="a">
                              <span>No signed assignment from the developer</span>
                              <b className="risk">Urgent</b>
                            </span>
                            <span className="b">
                              <span>Signed assignment on file</span>
                              <b className="good">Done</b>
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pc-body">
                <span className="pc-meta">
                  <span className="pc-tp">IP ownership</span>
                  <time dateTime="2026-11-02">2 November 2026</time>
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
                  The contractor who built your product may still own it: IP assignment in Nigeria, the UK and the
                  US
                </h3>
                <p>
                  Paying a contractor does not make you the owner of the code they wrote. How copyright ownership
                  works for contractors in Nigeria, the UK and the US, where assignments fail, and how to fix the
                  gaps before due diligence.
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
        <div className="blog-empty" hidden>
          <b>No article on that yet.</b>
          <p>Tell us what you would like us to write about.</p>
          <Button variant="green" href="mailto:hello@codeclauselegal.com?subject=Insights%20topic">
            Email us
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ArticleHero() {
  return (
    <section className="page-hero post-hero">
      <div className="orb orb--ring u-width-200px-height-200px-left-neg60px-bottom-8pct" data-float="-30"></div>
      <div className="wrap">
        <div className="crumbs" data-hero="">
          <a href="/">Home</a>{" "}
          ·{" "}
          <a href="/insights">Insights</a>{" "}
          · IP ownership
        </div>
        <div className="post-head">
          <div className="post-title">
            <span className="post-chip" data-hero="">
              IP ownership
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
              The contractor who built your product may still own it: IP assignment in Nigeria, the UK and the US
            </h1>
            <p className="lead" data-hero="">
              Paying a contractor does not make you the owner of the code they wrote. How copyright ownership
              works for contractors in Nigeria, the UK and the US, where assignments fail, and how to fix the gaps
              before due diligence.
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
                <time dateTime="2026-11-02">2 November 2026</time>
              </span>
            </div>
          </div>
          <div
            className="post-cover"
            data-hero=""
            data-tilt=""
            role="img"
            aria-label="Illustration: an assignment of intellectual property between a freelance developer and a company, signed by both"
          >
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
        </div>
      </div>
    </section>
  );
}

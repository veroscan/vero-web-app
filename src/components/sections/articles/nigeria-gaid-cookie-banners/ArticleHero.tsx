export function ArticleHero() {
  return (
    <section className="page-hero post-hero">
      <div className="orb orb--ring u-width-200px-height-200px-left-neg60px-bottom-8pct" data-float="-30"></div>
      <div className="wrap">
        <div className="crumbs" data-hero="">
          <a href="/">Home</a>{" "}
          ·{" "}
          <a href="/insights">Insights</a>{" "}
          · Data protection
        </div>
        <div className="post-head">
          <div className="post-title">
            <span className="post-chip" data-hero="">
              Data protection
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
              7 min read
            </span>
            <h1 className="h1 post-h1" data-hero-split="">
              Your cookie banner is probably non-compliant in Nigeria: what GAID 2025 Articles 7 and 19 require
            </h1>
            <p className="lead" data-hero="">
              GAID 2025 changed what a lawful cookie banner looks like in Nigeria. Here is what Articles 7(1)(l)
              and 19 require, what the notice behind the banner must say, and a ten-point check you can run today.
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
            aria-label="Illustration: a cookie banner with Reject all and Accept all side by side, equally prominent"
          >
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
        </div>
      </div>
    </section>
  );
}

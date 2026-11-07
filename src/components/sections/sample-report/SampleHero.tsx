import { cssVars } from "@/lib/css";

interface CsHeroCsMetaItem {
  readonly term: string;
  readonly detail: string;
}

const CS_HERO_CS_META_ITEMS: readonly CsHeroCsMetaItem[] = [
  { term: "Company", detail: "Kestrel Pay Inc. (made up)" },
  { term: "Works in", detail: "Delaware, the UK and Nigeria" },
  { term: "Score", detail: "72 out of 100, Needs work" },
  { term: "Report date", detail: "5 November 2026" },
];

interface PaColPaCheckedItem {
  readonly text: string;
  readonly detail: string;
}

const PA_COL_PA_CHECKED_ITEMS: readonly PaColPaCheckedItem[] = [
  { text: "Delaware", detail: "Dated certificate, uploaded and read" },
  { text: "United Kingdom", detail: "Checked with Companies House today" },
  { text: "Nigeria", detail: "CAC, through a licensed provider" },
];

export function SampleHero() {
  return (
    <section className="cs-hero">
      <div className="wrap">
        <div className="crumbs" data-hero="">
          <a href="/">Home</a>{" "}
          · Sample report
        </div>
        <div className="cs-hero-row">
          <div>
            <p className="cs-client" data-hero="">
              <b></b>
              Kestrel Pay Inc.
              <span>Illustrative example. Not a real scan.</span>
            </p>
            <h1 className="h1 cs-h1" data-hero-split="">A full report, on a company that does not exist.</h1>
          </div>
          <p className="lead" data-hero="">
            Kestrel Pay is made up. This is what a Vero Scan report looks like: the shared report, the list of
            fixes, and one issue page. Every name and number is an example.
          </p>
        </div>
        <dl className="cs-meta" data-hero="">
          {CS_HERO_CS_META_ITEMS.map((item) => (
            <div key={item.term}>
              <dt>{item.term}</dt>
              <dd>{item.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="cs-stage cs-stage--ui" data-cs-stage="">
        <div className="cs-stage-in">
          <div className="pa-fitbox pa-hero-fit">
            <div className="pa-win pa-wide" data-pa="report">
              <div className="pa-bar">
                <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                  <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                </svg>
                <span className="who">Shared report</span>
              </div>
              <div className="pa-body">
                <div className="pa-two">
                  <div className="pa-col pa-col-l">
                    <p className="pa-h">Kestrel Pay Inc.</p>
                    <p className="pa-sub">Report from 5 November 2026. Link expires in 30 days.</p>
                    <div className="pa-big">
                      <span className="num">72</span>
                      <span className="of">out of 100</span>
                    </div>
                    <b className="pu-st watch word">Needs work</b>
                    <p className="pa-say">A solid legal base, with one urgent issue still open.</p>
                    <p className="pa-open">
                      <b>12 issues still open</b>
                      <span className="risk">
                        Urgent{" "}
                        <i>1</i>
                      </span>
                      <span className="watch">
                        Important{" "}
                        <i>5</i>
                      </span>
                      <span className="quiet">
                        Worth doing{" "}
                        <i>6</i>
                      </span>
                    </p>
                  </div>
                  <div className="pa-col pa-col-r">
                    <p className="pa-h2">The six areas</p>
                    <ul className="pa-areas">
                      <li className="t-good" data-score="84">
                        <span className="n">Company foundations</span>
                        <span className="m">
                          <i style={cssVars({ "--w": "84%" })}></i>
                        </span>
                        <span className="pu-st good">Healthy</span>
                        <span className="num">84</span>
                      </li>
                      <li className="t-risk" data-score="49">
                        <span className="n">Intellectual property</span>
                        <span className="m">
                          <i style={cssVars({ "--w": "49%" })}></i>
                        </span>
                        <span className="pu-st risk">At risk</span>
                        <span className="num">49</span>
                      </li>
                      <li className="t-watch" data-score="68">
                        <span className="n">Compliance</span>
                        <span className="m">
                          <i style={cssVars({ "--w": "68%" })}></i>
                        </span>
                        <span className="pu-st watch">Needs work</span>
                        <span className="num">68</span>
                      </li>
                      <li className="t-good" data-score="86">
                        <span className="n">Contracts</span>
                        <span className="m">
                          <i style={cssVars({ "--w": "86%" })}></i>
                        </span>
                        <span className="pu-st good">Healthy</span>
                        <span className="num">86</span>
                      </li>
                      <li className="t-watch" data-score="74">
                        <span className="n">Fundraising</span>
                        <span className="m">
                          <i style={cssVars({ "--w": "74%" })}></i>
                        </span>
                        <span className="pu-st watch">Needs work</span>
                        <span className="num">74</span>
                      </li>
                      <li className="t-good" data-score="79">
                        <span className="n">AI and data</span>
                        <span className="m">
                          <i style={cssVars({ "--w": "79%" })}></i>
                        </span>
                        <span className="pu-st good">Healthy</span>
                        <span className="num">79</span>
                      </li>
                    </ul>
                    <p className="pa-h2">What’s been checked</p>
                    <ul className="pa-checked">
                      {PA_COL_PA_CHECKED_ITEMS.map((item) => (
                        <li key={item.text}>
                          <span>
                            {item.text}
                            <small>{item.detail}</small>
                          </span>
                          <b className="good">Checked</b>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <p className="pa-ex">Example company and data. Nothing here is a real scan.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

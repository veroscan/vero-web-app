import { cx } from "@/lib/cx";

const DELAWARE_TICKS: readonly string[] = [
  "The company record comes from a licensed provider, or from the Certificate of Good Standing you upload, shown with its date",
  "Delaware’s Division of Corporations does not allow automated access, so Vero never scrapes it",
  "Franchise tax standing comes from a receipt or printout you add. The annual report and franchise tax are due on 1 March",
  "US trademarks are read from the USPTO register",
];

const DELAWARE_FIT_FOR_ITEMS: readonly string[] = [
  "Company record",
  "Registered agent",
  "Franchise tax",
  "US trademarks",
];

interface DelawareListItem {
  readonly text: string;
  readonly tone: string;
}

const DELAWARE_LIST_ITEMS: readonly DelawareListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "on" },
];

interface DelawarePuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puSt: string;
  readonly tone: string;
}

const DELAWARE_PU_ROWS: readonly DelawarePuRowItem[] = [
  {
    title: "Good standing",
    detail: "Certificate of Good Standing, dated 12 October 2026. You uploaded this and we read it.",
    puSt: "Certified",
    tone: "good",
  },
  { title: "Registered agent", detail: "Found, from our licensed data provider", puSt: "Done", tone: "good" },
  {
    title: "Franchise tax",
    detail: "We need proof it is paid. Delaware does not allow automatic checks",
    puSt: "Add proof",
    tone: "watch",
  },
  {
    title: "US trademarks",
    detail: "One trademark filed. Found on the USPTO register today",
    puSt: "Done",
    tone: "good",
  },
];

const UNITED_KINGDOM_TICKS: readonly string[] = [
  "Status, overdue filings, directors and their identity verification, read from Companies House with the time of the check",
  "Confirmation statement and accounts due dates, so an overdue filing shows up the day it is overdue",
  "The data protection fee, checked on the ICO register",
  "Your website’s privacy notice and cookie banner",
];

const UNITED_KINGDOM_FIT_FOR_ITEMS: readonly string[] = [
  "Company record",
  "Filings",
  "Directors",
  "Website privacy and cookies",
];

interface UnitedKingdomListItem {
  readonly text: string;
  readonly tone: string;
}

const UNITED_KINGDOM_LIST_ITEMS: readonly UnitedKingdomListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "on" },
];

interface UnitedKingdomPuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puSt: string;
  readonly tone: string;
}

const UNITED_KINGDOM_PU_ROWS: readonly UnitedKingdomPuRowItem[] = [
  { title: "Company status", detail: "Active", puSt: "Done", tone: "good" },
  { title: "Confirmation statement", detail: "Overdue since 12 October", puSt: "Found an issue", tone: "risk" },
  {
    title: "Directors",
    detail: "Two on record. One still has to verify their identity by 18 November",
    puSt: "Found an issue",
    tone: "watch",
  },
  {
    title: "Data protection fee",
    detail: "No UK data protection fee found on the ICO register",
    puSt: "Worth doing",
    tone: "none",
  },
];

const NIGERIA_TICKS: readonly string[] = [
  "The company record, directors and status from the Corporate Affairs Commission, through a licensed provider. Vero does not scrape the CAC portal",
  "Active tells you the company is in good standing, not that every annual return is filed. A CAC status report confirms returns",
  "A search of the Nigeria Data Protection Commission list. The audit return is due on 31 March",
  "Your website’s privacy notice and cookie banner, against Nigeria’s rules",
];

const NIGERIA_FIT_FOR_ITEMS: readonly string[] = [
  "Company record",
  "Directors",
  "NDPC list",
  "Website privacy and cookies",
];

interface NigeriaListItem {
  readonly text: string;
  readonly tone: string;
}

const NIGERIA_LIST_ITEMS: readonly NigeriaListItem[] = [
  { text: "Home", tone: "" },
  { text: "Issues", tone: "" },
  { text: "Documents", tone: "" },
  { text: "Deadlines", tone: "" },
  { text: "Company", tone: "on" },
];

interface NigeriaPuRowItem {
  readonly title: string;
  readonly detail: string;
  readonly puSt: string;
  readonly tone: string;
}

const NIGERIA_PU_ROWS: readonly NigeriaPuRowItem[] = [
  {
    title: "Company record",
    detail: "Active, with two directors on record. From our licensed data provider",
    puSt: "Done",
    tone: "good",
  },
  {
    title: "Annual returns",
    detail: "You told us they are up to date. A CAC status report would confirm it",
    puSt: "You told us",
    tone: "watch",
  },
  {
    title: "Data protection register",
    detail: "We couldn’t find Kestrel Pay on the NDPC list",
    puSt: "Found an issue",
    tone: "watch",
  },
  {
    title: "Website cookies",
    detail: "Your cookie banner has no clear way to say no",
    puSt: "Found an issue",
    tone: "watch",
  },
];

export function CountryRows() {
  return (
    <section className="pad-sm pa-rows" aria-label="How each launch country is read">
      <div className="wrap">
        <article className="svc-row" id="delaware">
          <div className="svc-copy">
            <span className="idx" data-reveal="">01 / 03</span>
            <h2 className="h2" data-split="">Delaware</h2>
            <p className="sub" data-reveal="">A dated certificate. Never live.</p>
            <div data-reveal="">
              <ul className="ticks">
                {DELAWARE_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="fit-for">
              {DELAWARE_FIT_FOR_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div data-reveal=""></div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="pa-win" data-pa="cov">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {DELAWARE_LIST_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <p className="pa-h">
                    Delaware
                    <span className="pa-stampline">
                      <b className="pa-stamp">Certified 12 October 2026</b>
                    </span>
                  </p>
                  <ul className="pu-rows">
                    {DELAWARE_PU_ROWS.map((item) => (
                      <li key={item.title} className="pu-row">
                        <span className="pu-t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className={cx("pu-st", item.tone)}>{item.puSt}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pa-sub">A dated certificate, never a live status.</p>
                </div>
                <p className="pa-ex">Example company and data</p>
              </div>
            </div>
          </div>
        </article>
        <article className="svc-row" id="united-kingdom">
          <div className="svc-copy">
            <span className="idx" data-reveal="">02 / 03</span>
            <h2 className="h2" data-split="">United Kingdom</h2>
            <p className="sub" data-reveal="">Companies House, read live.</p>
            <div data-reveal="">
              <ul className="ticks">
                {UNITED_KINGDOM_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="fit-for">
              {UNITED_KINGDOM_FIT_FOR_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div data-reveal=""></div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="pa-win" data-pa="cov">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {UNITED_KINGDOM_LIST_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <p className="pa-h">
                    United Kingdom
                    <span className="pa-live">
                      <i></i>
                      Checked with Companies House today
                    </span>
                  </p>
                  <ul className="pu-rows">
                    {UNITED_KINGDOM_PU_ROWS.map((item) => (
                      <li key={item.title} className="pu-row">
                        <span className="pu-t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className={cx("pu-st", item.tone)}>{item.puSt}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pa-sub">Read live, with the time of the check.</p>
                </div>
                <p className="pa-ex">Example company and data</p>
              </div>
            </div>
          </div>
        </article>
        <article className="svc-row" id="nigeria">
          <div className="svc-copy">
            <span className="idx" data-reveal="">03 / 03</span>
            <h2 className="h2" data-split="">Nigeria</h2>
            <p className="sub" data-reveal="">CAC through a provider, and the NDPC list.</p>
            <div data-reveal="">
              <ul className="ticks">
                {NIGERIA_TICKS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="fit-for">
              {NIGERIA_FIT_FOR_ITEMS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <div data-reveal=""></div>
          </div>
          <div className="svc-media">
            <div className="mk-static" data-speed="-0.06">
              <div className="pa-win" data-pa="cov">
                <div className="pa-bar">
                  <svg className="v" viewBox="0 0 132 100" aria-hidden="true">
                    <path d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0ZM97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
                  </svg>
                  <nav aria-hidden="true">
                    {NIGERIA_LIST_ITEMS.map((item) => (
                      <span key={item.text} className={cx(item.tone)}>{item.text}</span>
                    ))}
                  </nav>
                  <span className="who">Kestrel Pay Inc.</span>
                </div>
                <div className="pa-body">
                  <p className="pa-h">Nigeria</p>
                  <ul className="pu-rows">
                    {NIGERIA_PU_ROWS.map((item) => (
                      <li key={item.title} className="pu-row">
                        <span className="pu-t">
                          <b>{item.title}</b>
                          <small>{item.detail}</small>
                        </span>
                        <span className={cx("pu-st", item.tone)}>{item.puSt}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pa-sub">“Not found” is never proof that something does not exist.</p>
                </div>
                <p className="pa-ex">Example company and data</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

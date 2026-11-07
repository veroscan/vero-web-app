import { Button } from "@/components/ui/Button";
import { SectionHead } from "@/components/ui/SectionHead";
import { cx } from "@/lib/cx";

const SX_COPY_TICKS: readonly string[] = [
  "Status and filings, checked at the register",
  "Directors, shareholders and agents match the record",
  "Annual filings and franchise tax up to date",
];

interface MkWinMkTableItem {
  readonly text: string;
  readonly watch: string;
  readonly tone: string;
}

const MK_WIN_MK_TABLE_ITEMS: readonly MkWinMkTableItem[] = [
  { text: "UK confirmation statement is overdue", watch: "Important", tone: "watch" },
  { text: "Proof of Delaware franchise tax needed", watch: "Important", tone: "watch" },
  { text: "Directors match Companies House", watch: "Done", tone: "good" },
];

interface SxSecSxItem {
  readonly sxN: string;
  readonly sxName: string;
  readonly sxN2: string;
  readonly sub: string;
  readonly text: string;
  readonly text2: string;
  readonly text3: string;
  readonly title: string;
  readonly risk: string;
  readonly text4: string;
  readonly risk2: string;
  readonly text5: string;
  readonly none: string;
  readonly text6: string;
  readonly tone: string;
  readonly tone2: string;
  readonly tone3: string;
  readonly sx: string;
}

const SX_SEC_SX_ITEMS: readonly SxSecSxItem[] = [
  {
    sxN: "02",
    sxName: "Intellectual property",
    sxN2: "02 / 06",
    sub: "Who owns your code, brand and ideas?",
    text: "Code assigned to the company, not to a person",
    text2: "Trademarks filed where you sell",
    text3: "Contractor and employee IP terms in place",
    title: "49",
    risk: "At risk",
    text4: "Lead developer has not signed the code over",
    risk2: "Urgent",
    text5: "One US trademark, none in the UK",
    none: "Worth doing",
    text6: "Employee IP terms are in place",
    tone: "risk",
    tone2: "risk",
    tone3: "none",
    sx: "1",
  },
  {
    sxN: "03",
    sxName: "Compliance",
    sxN2: "03 / 06",
    sub: "Data protection and the licences you need.",
    text: "Registered where the law says you must be",
    text2: "Privacy notice and cookie banner checked on your site",
    text3: "Gaps explained in plain English",
    title: "68",
    risk: "Needs work",
    text4: "Not found on the NDPC list",
    risk2: "Important",
    text5: "Cookie banner has no clear way to say no",
    none: "Important",
    text6: "Privacy notice found",
    tone: "watch",
    tone2: "watch",
    tone3: "watch",
    sx: "2",
  },
  {
    sxN: "04",
    sxName: "Contracts",
    sxN2: "04 / 06",
    sub: "What you have promised customers, staff and suppliers.",
    text: "Your standard terms read, not just stored",
    text2: "Renewals and notice dates pulled out",
    text3: "Missing documents flagged",
    title: "86",
    risk: "Healthy",
    text4: "Two vendor contracts renew in March",
    risk2: "Worth doing",
    text5: "Customer terms cap liability",
    none: "Done",
    text6: "Standard NDA in use",
    tone: "good",
    tone2: "none",
    tone3: "good",
    sx: "3",
  },
  {
    sxN: "05",
    sxName: "Fundraising",
    sxN2: "05 / 06",
    sub: "Your cap table, SAFEs and investor documents.",
    text: "Cap table matches the documents behind it",
    text2: "SAFEs and notes read for conversion terms",
    text3: "What a data room will ask for, ready first",
    title: "74",
    risk: "Needs work",
    text4: "SAFE does not match the stock ledger",
    risk2: "Important",
    text5: "Cap table last updated five months ago",
    none: "Worth doing",
    text6: "Board consent for the round is on file",
    tone: "watch",
    tone2: "watch",
    tone3: "none",
    sx: "4",
  },
  {
    sxN: "06",
    sxName: "AI and data",
    sxN2: "06 / 06",
    sub: "How you use AI and handle personal data.",
    text: "Where personal data goes and who sees it",
    text2: "AI use described honestly in your notices",
    text3: "Transfer terms for data that crosses borders",
    title: "79",
    risk: "Healthy",
    text4: "No transfer terms for data sent abroad",
    risk2: "Important",
    text5: "AI use is not in the privacy notice",
    none: "Worth doing",
    text6: "Data terms with your main vendor",
    tone: "good",
    tone2: "watch",
    tone3: "none",
    sx: "5",
  },
];

export function Areas() {
  return (
    <section className="pad sx-sec" aria-labelledby="sx-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Six areas"
          title="One score, six areas behind it."
          id="sx-title"
          intro="Each area gets its own score and its own list of fixes, so one serious gap cannot hide behind many small passes. The weights are launch defaults and may change."
        />
        <div className="sx" data-sx-root="">
          <article className="sx-item is-open" data-sx="0" tabIndex={0}>
            <div className="sx-tab">
              <span className="sx-n">01</span>
              <span className="sx-name">Company foundations</span>
            </div>
            <div className="sx-body">
              <div className="sx-copy">
                <span className="sx-n">01 / 06</span>
                <h3>Company foundations</h3>
                <p className="sub">Is the company real, active and in good standing?</p>
                <ul className="ticks">
                  {SX_COPY_TICKS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Button variant="green" href="/product">Explore the product</Button>
              </div>
              <div className="sx-visual">
                <div className="mk mk-area" aria-hidden="true">
                  <div className="mk-win">
                    <div className="mk-ahead">
                      <span>Company foundations</span>
                      <span className="mk-sc">
                        <b>84</b>
                        <em className="good">Healthy</em>
                      </span>
                    </div>
                    <div className="mk-table">
                      {MK_WIN_MK_TABLE_ITEMS.map((item) => (
                        <div key={item.text} className="mk-row">
                          <span>{item.text}</span>
                          <em className={cx(item.tone)}>{item.watch}</em>
                        </div>
                      ))}
                    </div>
                    <div className="mk-ex">Example company and data</div>
                  </div>
                </div>
              </div>
            </div>
          </article>
          {SX_SEC_SX_ITEMS.map((item) => (
            <article key={item.sxN} className="sx-item" data-sx={item.sx} tabIndex={0}>
              <div className="sx-tab">
                <span className="sx-n">{item.sxN}</span>
                <span className="sx-name">{item.sxName}</span>
              </div>
              <div className="sx-body">
                <div className="sx-copy">
                  <span className="sx-n">{item.sxN2}</span>
                  <h3>{item.sxName}</h3>
                  <p className="sub">{item.sub}</p>
                  <ul className="ticks">
                    <li>{item.text}</li>
                    <li>{item.text2}</li>
                    <li>{item.text3}</li>
                  </ul>
                  <a className="btn btn--green" href="/product" data-magnetic="">
                    Explore the product
                    <span className="btn-ico">
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
                <div className="sx-visual">
                  <div className="mk mk-area" aria-hidden="true">
                    <div className="mk-win">
                      <div className="mk-ahead">
                        <span>{item.sxName}</span>
                        <span className="mk-sc">
                          <b>{item.title}</b>
                          <em className={cx(item.tone)}>{item.risk}</em>
                        </span>
                      </div>
                      <div className="mk-table">
                        <div className="mk-row">
                          <span>{item.text4}</span>
                          <em className={cx(item.tone2)}>{item.risk2}</em>
                        </div>
                        <div className="mk-row">
                          <span>{item.text5}</span>
                          <em className={cx(item.tone3)}>{item.none}</em>
                        </div>
                        <div className="mk-row">
                          <span>{item.text6}</span>
                          <em className="good">Done</em>
                        </div>
                      </div>
                      <div className="mk-ex">Example company and data</div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

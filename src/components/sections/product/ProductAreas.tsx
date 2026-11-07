import { SectionHead } from "@/components/ui/SectionHead";
import { cssVars } from "@/lib/css";
import { cx } from "@/lib/cx";

interface PaAreasSecPaArealistItem {
  readonly paAn: string;
  readonly heading: string;
  readonly text: string;
  readonly text2: string;
  readonly text3: string;
  readonly text4: string;
  readonly num: string;
  readonly puSt: string;
  readonly tone: string;
  readonly w: string;
}

const PA_AREAS_SEC_PA_AREALIST_ITEMS: readonly PaAreasSecPaArealistItem[] = [
  {
    paAn: "01",
    heading: "Company foundations",
    text: "Is the company real, active and in good standing?",
    text2: "Status and filings, checked at the register",
    text3: "Directors, shareholders and agents match the record",
    text4: "Annual filings and franchise tax up to date",
    num: "84",
    puSt: "Healthy",
    tone: "good",
    w: "84%",
  },
  {
    paAn: "02",
    heading: "Intellectual property",
    text: "Who owns your code, brand and ideas?",
    text2: "Code assigned to the company, not to a person",
    text3: "Trademarks filed where you sell",
    text4: "Contractor and employee IP terms in place",
    num: "49",
    puSt: "At risk",
    tone: "risk",
    w: "49%",
  },
  {
    paAn: "03",
    heading: "Compliance",
    text: "Data protection and the licences you need.",
    text2: "Registered where the law says you must be",
    text3: "Privacy notice and cookie banner checked on your site",
    text4: "Gaps explained in plain English",
    num: "68",
    puSt: "Needs work",
    tone: "watch",
    w: "68%",
  },
  {
    paAn: "04",
    heading: "Contracts",
    text: "What you have promised customers, staff and suppliers.",
    text2: "Your standard terms read, not just stored",
    text3: "Renewals and notice dates pulled out",
    text4: "Missing documents flagged",
    num: "86",
    puSt: "Healthy",
    tone: "good",
    w: "86%",
  },
  {
    paAn: "05",
    heading: "Fundraising",
    text: "Your cap table, SAFEs and investor documents.",
    text2: "Cap table matches the documents behind it",
    text3: "SAFEs and notes read for conversion terms",
    text4: "What a data room will ask for, ready first",
    num: "74",
    puSt: "Needs work",
    tone: "watch",
    w: "74%",
  },
  {
    paAn: "06",
    heading: "AI and data",
    text: "How you use AI and handle personal data.",
    text2: "Where personal data goes and who sees it",
    text3: "AI use described honestly in your notices",
    text4: "Transfer terms for data that crosses borders",
    num: "79",
    puSt: "Healthy",
    tone: "good",
    w: "79%",
  },
];

export function ProductAreas() {
  return (
    <section className="pad pa-areas-sec" aria-labelledby="areas-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Six areas"
          title="One score, six areas behind it."
          id="areas-title"
          intro="Each area has its own score and its own list of fixes. The example scores here are for a made-up company. Weights and bands are launch defaults and may change."
        />
        <ol className="pa-arealist">
          {PA_AREAS_SEC_PA_AREALIST_ITEMS.map((item) => (
            <li key={item.paAn} className="pa-arearow" data-reveal="">
              <span className="pa-an">{item.paAn}</span>
              <div className="pa-at">
                <h3>{item.heading}</h3>
                <p>{item.text}</p>
              </div>
              <ul className="pa-ak">
                <li>{item.text2}</li>
                <li>{item.text3}</li>
                <li>{item.text4}</li>
              </ul>
              <div className="pa-as">
                <span className="num" data-to={item.num}>{item.num}</span>
                <span className={cx("pu-st", item.tone)}>{item.puSt}</span>
                <span className="m" aria-hidden="true">
                  <i style={cssVars({ "--w": item.w })}></i>
                </span>
              </div>
            </li>
          ))}
        </ol>
        <p className="small-print" data-reveal="">
          Example company and data. Kestrel Pay Inc. is not a real customer.
        </p>
      </div>
    </section>
  );
}

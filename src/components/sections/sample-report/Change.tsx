import { SectionHead } from "@/components/ui/SectionHead";

interface ChgItem {
  readonly text: string;
  readonly chgA: string;
}

const CHG_ITEMS: readonly ChgItem[] = [
  { text: "Not sure what an investor’s lawyer will find", chgA: "Twelve issues in order, with the urgent one first" },
  { text: "Not sure whether you own your code", chgA: "One page: what is missing, why it matters and the fix" },
  { text: "Nothing to show an investor", chgA: "A report that names where each fact came from" },
  { text: "Deadlines kept in someone’s head", chgA: "Every deadline listed, with who checks it" },
];

export function Change() {
  return (
    <section className="pad">
      <div className="wrap">
        <SectionHead eyebrow="What changes" title="From not knowing to a plan." />
        <div className="chg">
          <div className="chg-head">
            <span>Before a report</span>
            <span></span>
            <span>With one</span>
          </div>
          {CHG_ITEMS.map((item) => (
            <div key={item.text} className="chg-row" data-chg="">
              <p className="chg-b">
                <span>{item.text}</span>
              </p>
              <span className="chg-ar" aria-hidden="true">
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
              </span>
              <p className="chg-a">{item.chgA}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

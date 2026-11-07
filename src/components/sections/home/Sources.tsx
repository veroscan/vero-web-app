import { SectionHead } from "@/components/ui/SectionHead";

interface HowWeKnowSrcListItem {
  readonly srcN: string;
  readonly srcP: string;
  readonly srcD: string;
}

const HOW_WE_KNOW_SRC_LIST_ITEMS: readonly HowWeKnowSrcListItem[] = [
  {
    srcN: "01",
    srcP: "Checked with Companies House today",
    srcD: "A live read of the UK register. We show you the date and time of the check.",
  },
  {
    srcN: "02",
    srcP: "From our licensed data provider",
    srcD: "Where a register is not open to everyone, a licensed provider supplies the record. It carries its date and is never shown as live.",
  },
  {
    srcN: "03",
    srcP: "Found on the NDPC list",
    srcD: "We looked for you on Nigeria’s data protection register. If we cannot find you, we say so. That is not proof you are absent.",
  },
  {
    srcN: "04",
    srcP: "You uploaded this and we read it",
    srcD: "A document you gave us, read by software and kept private to your team.",
  },
  {
    srcN: "05",
    srcP: "You told us",
    srcD: "Your own answers. They are marked as yours until we find a record or a lawyer reads the document.",
  },
  {
    srcN: "06",
    srcP: "A lawyer read this",
    srcD: "A Code & Clause lawyer read the document and confirmed it does what it should, not only that it exists.",
  },
];

export function Sources() {
  return (
    <section className="pad on-dark u-overflow-hidden" id="how-we-know">
      <div className="wrap u-position-relative">
        <SectionHead
          eyebrow="How we know"
          title="Every finding says where it came from."
          intro="Vero never tells you something without saying how it knows. These are the six phrases you will see, and what each one means."
        />
        <ol className="src-list">
          {HOW_WE_KNOW_SRC_LIST_ITEMS.map((item) => (
            <li key={item.srcN} className="src-row" data-reveal="">
              <b className="src-n">{item.srcN}</b>
              <span className="src-p">{item.srcP}</span>
              <span className="src-d">{item.srcD}</span>
            </li>
          ))}
        </ol>
        <p className="small-print u-margin-top-28px" data-reveal="">
          “Not found” is never proof that something does not exist. A search tells you what a register showed on
          the day we looked.{" "}
          <a className="link" href="/methodology">Read the methodology</a>
          .
        </p>
      </div>
    </section>
  );
}

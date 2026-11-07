import { SectionHead } from "@/components/ui/SectionHead";

interface SourcesPaSrcItem {
  readonly title: string;
  readonly text: string;
  readonly text2: string;
  readonly text3: string;
}

const SOURCES_PA_SRCS: readonly SourcesPaSrcItem[] = [
  {
    title: "01",
    text: "Checked with Companies House today",
    text2: "A live read of the UK register. We show the date and time of the check.",
    text3: "Counts. An official live source.",
  },
  {
    title: "02",
    text: "From our licensed data provider",
    text2: "Where a register is not open to everyone, a licensed provider supplies the record. It carries its date and is never shown as live.",
    text3: "Counts, with its date.",
  },
  {
    title: "03",
    text: "Found on the NDPC list",
    text2: "We looked for the company on Nigeria’s data protection register. If we cannot find it, we say so. That is not proof it is absent.",
    text3: "Counts when found.",
  },
  {
    title: "04",
    text: "You uploaded this and we read it",
    text2: "A document you gave us, read by software and kept private to your team. Where an official check exists, we use it, for example a Delaware certificate checked against the state’s own validator.",
    text3: "Counts once checked. Until then it shows as documented, not confirmed.",
  },
  {
    title: "05",
    text: "You told us",
    text2: "Your own answer. It is marked as yours until we find a record or a lawyer reads the document.",
    text3: "Counts in part. It cannot earn the badge on its own.",
  },
  {
    title: "06",
    text: "A lawyer read this",
    text2: "A Code & Clause lawyer read the document and confirmed it does what it should, not only that it exists.",
    text3: "Needed within the last 12 months for the badge.",
  },
];

export function Sources() {
  return (
    <section className="pad" id="sources" aria-labelledby="sources-title">
      <div className="wrap">
        <SectionHead
          eyebrow="Where facts come from"
          title="Six phrases, six kinds of source."
          id="sources-title"
          intro="Vero never tells you something without saying how it knows. Here is what each phrase means and whether it counts toward verification."
        />
        <ol className="pa-srcs">
          {SOURCES_PA_SRCS.map((item) => (
            <li key={item.title} className="pa-src" data-reveal="">
              <b className="n">{item.title}</b>
              <span className="p">{item.text}</span>
              <span className="d">{item.text2}</span>
              <span className="c">
                <small>Toward verification</small>
                {item.text3}
              </span>
            </li>
          ))}
        </ol>
        <p className="small-print" data-reveal="">
          Where a register’s terms forbid automated access, such as Delaware’s Division of Corporations, Vero does
          not scrape it. It uses a licensed provider or a document you upload instead.
        </p>
      </div>
    </section>
  );
}

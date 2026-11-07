import { Eyebrow } from "@/components/ui/Eyebrow";
import { LinkArrow } from "@/components/ui/LinkArrow";

interface SvCheckPbSrcItem {
  readonly title: string;
  readonly text: string;
}

const SV_CHECK_PB_SRCS: readonly SvCheckPbSrcItem[] = [
  {
    title: "Checked with Companies House today",
    text: "A live read of the UK register. We show the date and time of the check.",
  },
  {
    title: "From our licensed data provider",
    text: "Where a register is not open to everyone, a licensed provider supplies the record. It carries its date and is never shown as live.",
  },
  {
    title: "You uploaded this and we read it",
    text: "Delaware status is a dated certificate the company uploaded, or a licensed provider. It is never shown as live.",
  },
  {
    title: "You told us",
    text: "The company’s own answers. They stay marked as theirs until we find a record or a lawyer reads the document.",
  },
  {
    title: "A lawyer read this",
    text: "A Code & Clause lawyer read the document and confirmed it does what it should, not only that it exists.",
  },
];

export function SourceCheck() {
  return (
    <section className="pad-sm">
      <div className="wrap">
        <div className="sv-check pb-known">
          <div className="sv-check-copy">
            <Eyebrow>How each fact is known</Eyebrow>
            <h2 className="h2" data-split="">Every line says where it came from.</h2>
            <p className="muted">
              These five phrases are the whole vocabulary. You can see which facts were read from a register,
              which came from a document, and which are the company’s own word.
            </p>
            <LinkArrow href="/methodology">Read the methodology</LinkArrow>
          </div>
          <ul className="pb-srcs">
            {SV_CHECK_PB_SRCS.map((item) => (
              <li key={item.title}>
                <b>{item.title}</b>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

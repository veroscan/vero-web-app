import { Eyebrow } from "@/components/ui/Eyebrow";

interface CsModsModItem {
  readonly modN: string;
  readonly heading: string;
  readonly text: string;
}

const CS_MODS_MODS: readonly CsModsModItem[] = [
  { modN: "01", heading: "The score", text: "One number out of 100, with a word: Healthy, Needs work or At risk." },
  { modN: "02", heading: "Six areas", text: "Each with its own score and its own list of fixes." },
  { modN: "03", heading: "Issues in order", text: "Urgent, Important, Worth doing, with points for each." },
  { modN: "04", heading: "What was checked", text: "Every register and document read, with the date." },
  { modN: "05", heading: "Documents", text: "What is in place, what is missing, and what a lawyer has read." },
  { modN: "06", heading: "Deadlines", text: "Every date the companies must meet, and who checks it." },
  { modN: "07", heading: "Lawyer review", text: "Sufficient or not, with notes, on the documents that matter." },
  { modN: "08", heading: "Share and save", text: "A link that expires, or a PDF. Details stay private." },
];

export function Modules() {
  return (
    <section className="pad cs-mods on-dark">
      <div className="wrap u-position-relative">
        <div className="sec-head">
          <Eyebrow>What is in a report</Eyebrow>
          <h2 className="h2" data-split="">Everything a reader needs, nothing they do not.</h2>
          <p className="body-l">Eight parts, each in plain English and each naming its source.</p>
        </div>
        <div className="mods">
          {CS_MODS_MODS.map((item) => (
            <article key={item.modN} className="mod" data-reveal="">
              <span className="mod-n">{item.modN}</span>
              <h3 className="h4">{item.heading}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Eyebrow } from "@/components/ui/Eyebrow";
import { LinkArrow } from "@/components/ui/LinkArrow";

interface CsProcPrItem {
  readonly mark: string;
  readonly heading: string;
  readonly text: string;
}

const CS_PROC_PRS: readonly CsProcPrItem[] = [
  {
    mark: "1",
    heading: "You tell us about the company",
    text: "Its name, where it is incorporated, where it works, and where its investors are.",
  },
  {
    mark: "2",
    heading: "Vero reads what is public",
    text: "The official registers, and your website’s privacy notice and cookie banner.",
  },
  {
    mark: "3",
    heading: "You add documents and answers",
    text: "Documents are read by software. Your answers are marked as yours.",
  },
  {
    mark: "4",
    heading: "A lawyer reads what matters",
    text: "Sufficient or not, with notes. Then the score updates.",
  },
];

export function Process() {
  return (
    <section className="pad cs-proc">
      <div className="wrap">
        <div className="sec-head">
          <Eyebrow>How a report is made</Eyebrow>
          <h2 className="h2" data-split="">Four steps, from name to plan.</h2>
          <p className="body-l">
            The same steps for every company.{" "}
            <LinkArrow href="/methodology">How the score is worked out</LinkArrow>
          </p>
        </div>
        <ol className="prs" data-prs="">
          <span className="prs-line" aria-hidden="true">
            <i></i>
          </span>
          {CS_PROC_PRS.map((item) => (
            <li key={item.mark} className="pr" data-reveal="">
              <span className="pr-dot">
                <i>{item.mark}</i>
              </span>
              <h3 className="h4">{item.heading}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

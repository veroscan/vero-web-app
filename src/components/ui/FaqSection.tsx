import { Button } from "./Button";
import { Eyebrow } from "./Eyebrow";
import { FaqList, type FaqItem } from "./FaqList";

interface FaqSectionProps {
  eyebrow: string;
  heading: string;
  /** Sentence under the heading. */
  note: string;
  action: { label: string; href: string };
  items: readonly FaqItem[];
  /** Spacing class of the section (`pad` by default). */
  spacing?: "pad" | "pad-sm";
}

/** "Questions" band: heading, a pointer to contact, and the accordion. Anchored at `#faq`. */
export function FaqSection({ eyebrow, heading, note, action, items, spacing = "pad" }: FaqSectionProps) {
  return (
    <section className={spacing} id="faq" aria-labelledby="faq-title">
      <div className="wrap faq-grid">
        <div className="faq-side">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="h2" id="faq-title" data-split="">
            {heading}
          </h2>
          <p className="muted u-margin-0">{note}</p>
          <div className="btn-row">
            <Button variant="soft" href={action.href}>
              {action.label}
            </Button>
          </div>
        </div>
        <FaqList items={items} />
      </div>
    </section>
  );
}

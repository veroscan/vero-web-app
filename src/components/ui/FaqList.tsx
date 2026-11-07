import type { ReactNode } from "react";

export interface FaqItem {
  readonly question: string;
  /** Plain text becomes one paragraph; anything else is rendered as given. */
  readonly answer: ReactNode;
  /** Open when the page loads. */
  readonly open?: boolean;
}

/** Accordion of `<details>`. The runtime animates open/close and keeps one answer open at a time. */
export function FaqList({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="faq">
      {items.map((item) => (
        <details key={item.question} open={item.open}>
          <summary>
            {item.question}
            <span className="pm" aria-hidden="true"></span>
          </summary>
          <div className="ans">{typeof item.answer === "string" ? <p>{item.answer}</p> : item.answer}</div>
        </details>
      ))}
    </div>
  );
}

import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

interface SectionHeadProps {
  eyebrow: string;
  title: string;
  /** Optional lead paragraph under the heading. */
  intro?: ReactNode;
  id?: string;
}

/** Eyebrow, split-text heading and optional intro that open most sections. */
export function SectionHead({ eyebrow, title, intro, id }: SectionHeadProps) {
  return (
    <div className="sec-head">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="h2" id={id} data-split="">
        {title}
      </h2>
      {intro !== undefined && <p className="muted">{intro}</p>}
    </div>
  );
}

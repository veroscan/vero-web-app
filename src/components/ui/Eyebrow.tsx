import type { HTMLAttributes } from "react";

/** Small uppercase label above a heading. The runtime scrambles its letters in on scroll. */
export function Eyebrow(props: HTMLAttributes<HTMLSpanElement>) {
  return <span className="eyebrow" {...props} />;
}

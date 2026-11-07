import type { ReactNode } from "react";
import { ARROW_RIGHT_PATH } from "@/lib/brand";

/** Text link that ends in a small right arrow. */
export function LinkArrow({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="link-arrow" href={href}>
      {children}{" "}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={ARROW_RIGHT_PATH} />
      </svg>
    </a>
  );
}

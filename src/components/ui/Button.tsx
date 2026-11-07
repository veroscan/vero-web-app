import type { ReactNode } from "react";
import { ARROW_UP_RIGHT_PATH } from "@/lib/brand";
import { cx } from "@/lib/cx";
import { ArrowIcon } from "./Icon";

export type ButtonVariant = "ink" | "green" | "soft" | "light" | "ghost";

type ButtonProps = {
  variant?: ButtonVariant;
  children: ReactNode;
} & ({ href: string; type?: never } | { href?: never; type: "submit" | "button" });

/** Pill button with the rolling label and arrow chip. The runtime attaches the magnetic hover to `data-magnetic`. */
export function Button({ variant = "ink", href, type, children }: ButtonProps) {
  const className = cx("btn", variant !== "ink" && `btn--${variant}`);
  const content = (
    <>
      {children}{" "}
      <span className="btn-ico">
        <ArrowIcon path={ARROW_UP_RIGHT_PATH} />
      </span>
    </>
  );
  if (href !== undefined) {
    return (
      <a className={className} href={href} data-magnetic="">
        {content}
      </a>
    );
  }
  return (
    <button className={className} type={type} data-magnetic="">
      {content}
    </button>
  );
}

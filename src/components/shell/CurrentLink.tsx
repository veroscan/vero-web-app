"use client";

import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes } from "react";
import { routeKey } from "@/lib/routes";

interface CurrentLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** Other links that also make this one "current" (a dropdown trigger covers its items). */
  alsoCurrentFor?: readonly string[];
}

/** Plain anchor that carries `aria-current="page"` when it points at the page being shown. */
export function CurrentLink({ href, alsoCurrentFor = [], ...rest }: CurrentLinkProps) {
  const route = routeKey(usePathname());
  const isCurrent = [href, ...alsoCurrentFor].some((target) => routeKey(target) === route);
  return <a href={href} aria-current={isCurrent ? "page" : undefined} {...rest} />;
}

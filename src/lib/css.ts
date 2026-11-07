import type { CSSProperties } from "react";

type CustomProperties = Readonly<Record<`--${string}`, string | number>>;

/** Typed style object for data-driven CSS custom properties, e.g. `cssVars({ "--w": "49%" })`. */
export function cssVars(vars: CustomProperties): CSSProperties {
  return vars as CSSProperties;
}

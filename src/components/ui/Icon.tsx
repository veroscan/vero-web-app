import type { SVGProps } from "react";

interface StrokeIconProps extends Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> {
  /** SVG path data, one entry per `<path>`. */
  paths: readonly string[];
}

/** 24x24 line icon that inherits the text colour. */
export function StrokeIcon({ paths, ...rest }: StrokeIconProps) {
  return (
    <svg viewBox="0 0 24 24" {...rest}>
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/** Arrow glyph used in buttons and cards. */
export function ArrowIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

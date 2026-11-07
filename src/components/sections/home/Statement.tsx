import { Eyebrow } from "@/components/ui/Eyebrow";
import { LinkArrow } from "@/components/ui/LinkArrow";

export function Statement() {
  return (
    <section className="pad">
      <div className="orb orb--ring u-width-420px-height-420px-left-neg180px-top-10pct" data-float="30"></div>
      <div className="wrap u-position-relative-display-grid-gap-40px">
        <Eyebrow data-reveal="">Why it exists</Eyebrow>
        <p className="statement" data-highlight="">
          Investors’ lawyers find the gaps at the worst moment. Vero Scan finds them{" "}
          <em>first</em>
          , scores your company out of 100 and shows you{" "}
          <em>what to fix</em>
          .
        </p>
        <div data-reveal="">
          <LinkArrow href="/methodology">How Vero reads the law</LinkArrow>
        </div>
      </div>
    </section>
  );
}

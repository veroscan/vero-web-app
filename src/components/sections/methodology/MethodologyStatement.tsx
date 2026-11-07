import { Eyebrow } from "@/components/ui/Eyebrow";

export function MethodologyStatement() {
  return (
    <section className="pad" aria-label="In short">
      <div className="wrap u-display-grid-gap-40px">
        <Eyebrow data-reveal="">In short</Eyebrow>
        <p className="statement" data-highlight="">
          Each area is scored on the checks that apply to it. Every finding says{" "}
          <em>where it came from</em>
          . One urgent gap{" "}
          <em>cannot hide</em>{" "}
          behind many small passes.
        </p>
      </div>
    </section>
  );
}

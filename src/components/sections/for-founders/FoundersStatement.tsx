import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function FoundersStatement() {
  return (
    <section className="pad on-dark u-overflow-hidden">
      <div className="wrap u-position-relative-display-grid-gap-36px">
        <Eyebrow>Built for founders, not legal departments</Eyebrow>
        <p className="statement" data-highlight="">
          You do not need a general counsel to know what is{" "}
          <em>missing</em>
          . You need a list in plain English, in the{" "}
          <em>order to fix it</em>
          .
        </p>
        <div data-reveal="">
          <Button variant="green" href="/sample-report">See a sample report</Button>
        </div>
      </div>
    </section>
  );
}

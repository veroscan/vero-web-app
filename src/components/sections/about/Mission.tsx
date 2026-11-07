import { Eyebrow } from "@/components/ui/Eyebrow";

export function Mission() {
  return (
    <section className="pad on-dark u-overflow-hidden">
      <div className="wrap u-position-relative-display-grid-gap-36px">
        <Eyebrow>Why it exists</Eyebrow>
        <p className="statement" data-highlight="">
          When a bank reads a credit score, it is not reading your whole financial history. It is reading a{" "}
          <em>signal</em>{" "}
          that tells it whether to go{" "}
          <em>deeper</em>
          . Vero gives investors, customers and partners that signal for legal health.
        </p>
      </div>
    </section>
  );
}

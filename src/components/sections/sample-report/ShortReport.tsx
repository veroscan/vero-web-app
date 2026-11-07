import { Eyebrow } from "@/components/ui/Eyebrow";

export function ShortReport() {
  return (
    <section className="pad-sm cs-short-sec">
      <div className="wrap">
        <div className="cs-short" data-reveal="">
          <Eyebrow>In short</Eyebrow>
          <p data-highlight="">
            Kestrel Pay scores 72 out of 100, which is Needs work. One urgent issue holds its intellectual
            property area at 49: the lead developer has not signed the code over to the company. Fixing it would
            take the score to about 80. Everything else on the list is smaller.
          </p>
        </div>
      </div>
    </section>
  );
}

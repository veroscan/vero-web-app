import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function SampleCta() {
  return (
    <section className="pad-sm">
      <div className="wrap">
        <div className="cta" data-scale-in="">
          <div className="cta-row">
            <div className="u-display-grid-gap-26px">
              <Eyebrow>Get started</Eyebrow>
              <h2 data-split="">Run a report like this on your own company.</h2>
              <div className="btn-row">
                <Button variant="green" href="/waitlist">Join the waitlist</Button>
                <Button variant="light" href="/contact">Book a demo</Button>
              </div>
            </div>
            <div className="contact-lines">
              <span>This report is an example.</span>
              <span>The first read is free. Pricing is not published yet.</span>
              <a href="mailto:hello@codeclauselegal.com">hello@codeclauselegal.com</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

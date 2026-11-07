import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function SecurityCta() {
  return (
    <section className="pad-sm">
      <div className="wrap">
        <div className="cta" data-scale-in="">
          <div className="cta-row">
            <div className="u-display-grid-gap-26px">
              <Eyebrow>Questions about security?</Eyebrow>
              <h2 data-split="">Ask us anything about how we handle your data.</h2>
              <div className="btn-row">
                <Button variant="green" href="/waitlist">Join the waitlist</Button>
                <Button variant="light" href="/contact">Book a demo</Button>
              </div>
            </div>
            <div className="contact-lines">
              <span>
                Write to hello@codeclauselegal.com to report a vulnerability or raise a data protection concern.
              </span>
              <a href="mailto:hello@codeclauselegal.com">hello@codeclauselegal.com</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

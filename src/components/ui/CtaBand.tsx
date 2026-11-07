import type { ReactNode } from "react";
import { COMPANY } from "@/lib/site";
import { Button } from "./Button";
import { Eyebrow } from "./Eyebrow";

interface CtaBandProps {
  heading: string;
  eyebrow?: string;
  /** Disclaimer shown above the band. */
  smallPrint?: string;
  /** Replaces the default waitlist and demo buttons (for example a sign-up form). */
  children?: ReactNode;
}

/** Closing ink band: heading, actions and the standing contact lines. */
export function CtaBand({ heading, eyebrow = "Get started", smallPrint, children }: CtaBandProps) {
  return (
    <section className="pad-sm">
      <div className="wrap">
        {smallPrint !== undefined && (
          <p className="small-print u-margin-0-0-28px" data-reveal="">
            {smallPrint}
          </p>
        )}
        <div className="cta" data-scale-in="">
          <div className="cta-row">
            <div className="u-display-grid-gap-26px">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h2 data-split="">{heading}</h2>
              {children ?? (
                <div className="btn-row">
                  <Button variant="green" href="/waitlist">
                    Join the waitlist
                  </Button>{" "}
                  <Button variant="light" href="/contact">
                    Book a demo
                  </Button>
                </div>
              )}
            </div>
            <div className="contact-lines">
              <span>The first read is free.</span> <span>Pricing is not published yet.</span>{" "}
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <Eyebrow data-hero="">Vero Scan, by Code &amp; Clause</Eyebrow>
            <h1 className="display" data-hero-split="">
              The legal health score for{" "}
              <span className="accent">technology companies.</span>
            </h1>
            <p className="lead" data-hero="">
              Vero Scan checks your registry records, documents and product against the law of every country you
              work in. You get a score out of 100 and a plan to fix what is missing.
            </p>
            <div className="btn-row" data-hero="">
              <Button variant="green" href="/waitlist">Join the waitlist</Button>
              <Button variant="soft" href="/contact">Book a demo</Button>
            </div>
            <div className="hero-tags" data-hero="">
              <span className="tag">
                <i></i>
                Delaware, the UK and Nigeria at launch
              </span>
              <span className="tag">
                <i></i>
                Not legal advice
              </span>
            </div>
          </div>
          <div
            className="hero-mark"
            data-vero-mark=""
            data-bg="#F6F5F7"
            role="img"
            aria-label="The Vero mark, a rose V"
          >
            <div className="mark-flat" aria-hidden="true">
              <svg viewBox="-4 -4 140 108">
                <path className="p-tab" d="M14.7 0H51L35 26.5C31 32 26 35 19 35 8 35 0 27 0 17 0 8 6 2 14.7 0Z" />
                <path className="p-v" d="M97 0h35L74 92.6c-3.5 4.9-8.5 7.4-14 7.4-6 0-11.5-3-15-7.5L22.4 58.4C27 61.5 31.5 64 37.6 64c6.4 0 11.4-2.5 14.9-7.5L84 7c3-4 8-7 13-7Z" />
              </svg>
            </div>
            <canvas aria-hidden="true"></canvas>
          </div>
        </div>
      </div>
      <div className="hero-hint">
        <b></b>
        Scroll
      </div>
    </section>
  );
}

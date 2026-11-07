import { Button } from "@/components/ui/Button";

export function FoundersHero() {
  return (
    <section className="page-hero">
      <div className="orb orb--ring u-width-240px-height-240px-right-8pct-top-20pct" data-float="-30"></div>
      <div className="wrap">
        <div className="crumbs" data-hero="">
          <a href="/">Home</a>{" "}
          · Solutions · For founders
        </div>
        <div className="page-hero-row">
          <h1 className="h1" data-hero-split="">
            Find what your company is missing while it is still cheap to fix.
          </h1>
          <p className="lead" data-hero="">
            Raising, selling, hiring contractors, handling personal data, using AI or opening in another country.
            Each one has a legal gap that investors and customers find. Vero Scan finds it first, says it in plain
            English and shows the fix.
          </p>
        </div>
        <div className="btn-row" data-hero="">
          <Button variant="green" href="/waitlist">Join the waitlist</Button>
          <Button variant="soft" href="/contact">Book a demo</Button>
        </div>
      </div>
    </section>
  );
}
